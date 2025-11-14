import React, { useEffect, useRef, useState } from 'react'
import { api, haversine, formatDuration } from '../api/client'
import { useToast } from '../context/ToastContext'
import L from 'leaflet'

const markerIcon = L.icon({
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41]
})

export default function Delivery() {
  const [riders, setRiders] = useState([])
  const [filter, setFilter] = useState('')
  const [actives, setActives] = useState([])
  const [trackingId, setTrackingId] = useState('')
  const mapRef = useRef(null)
  const markerRef = useRef(null)
  const polyRef = useRef(null)
  const { showToast } = useToast()

  async function loadRiders() {
    try {
      const data = await api('/riders')
      setRiders(Array.isArray(data) ? data : (data.items || []))
    } catch (e) { setRiders([]) }
  }

  async function loadActives() {
    try {
      const data = await api('/delivery')
      const list = Array.isArray(data) ? data : (data.items || [])
      setActives(list)
    } catch (e) {
      setActives([])
    }
  }

  useEffect(() => {
    loadRiders();
    loadActives();
    const t1 = setInterval(loadRiders, 20000)
    const t2 = setInterval(loadActives, 20000)
    return () => { clearInterval(t1); clearInterval(t2) }
  }, [])

  async function setStatus(id, status) { try { await api(`/riders/${encodeURIComponent(id)}/status`, { method:'PATCH', body: JSON.stringify({ status }) }); loadRiders() } catch (e) {} }

  async function assign(ev) {
    ev.preventDefault()
    const fd = new FormData(ev.currentTarget)
    const payload = { id_order: fd.get('order'), id_staff: fd.get('rider') }
    const msg = document.getElementById('assign-msg')
    if (!payload.id_order || !payload.id_staff) { msg.textContent = 'IDs requeridos'; showToast({ type:'warning', message:'Completa ID de pedido y staff' }); return }
    try { const res = await api('/delivery/assign', { method:'POST', body: JSON.stringify(payload) }); msg.textContent = `Asignado (delivery: ${res.id_delivery || res.delivery_id || res.id || '—'})`; showToast({ type:'success', message:'Pedido asignado' }) } catch (e) { msg.textContent = 'Error al asignar'; showToast({ type:'error', message:'Error al asignar' }) }
  }

  async function action(kind, id) {
    const msg = document.getElementById('actions-msg')
    try {
      if (kind === 'handoff') await api(`/delivery/orders/${encodeURIComponent(id)}/handoff`, { method:'POST' })
      else if (kind === 'delivered') await api(`/delivery/orders/${encodeURIComponent(id)}/delivered`, { method:'POST' })
      else if (kind.startsWith('status-')) { const status = kind.replace('status-',''); await api(`/delivery/${encodeURIComponent(id)}/status`, { method:'PATCH', body: JSON.stringify({ status }) }) }
      msg.textContent = 'Acción realizada'
      showToast({ type:'success', message:'Acción realizada' })
    } catch (e) { msg.textContent = 'Error ejecutando acción'; showToast({ type:'error', message:'Error ejecutando acción' }) }
  }

  async function sendLocation(ev) {
    ev.preventDefault()
    const fd = new FormData(ev.currentTarget)
    const payload = { id_delivery: fd.get('delivery'), lat: parseFloat(fd.get('lat')), lng: parseFloat(fd.get('lng')) }
    const msg = document.getElementById('loc-msg')
    if (!payload.id_delivery || !isFinite(payload.lat) || !isFinite(payload.lng)) { msg.textContent = 'Datos inválidos'; showToast({ type:'warning', message:'Completa ID y coordenadas válidas' }); return }
    try { await api('/delivery/location', { method:'POST', body: JSON.stringify(payload) }); msg.textContent='Ubicación actualizada'; showToast({ type:'success', message:'Ubicación actualizada' }) } catch (e) { msg.textContent='Error enviando ubicación'; showToast({ type:'error', message:'Error enviando ubicación' }) }
  }

  function useGPS() {
    const form = document.getElementById('loc-form')
    if (!navigator.geolocation) { alert('Geolocalización no soportada'); return }
    navigator.geolocation.getCurrentPosition(pos => {
      form.querySelector('[name="lat"]').value = pos.coords.latitude
      form.querySelector('[name="lng"]').value = pos.coords.longitude
    }, () => alert('No se pudo obtener la ubicación'))
  }

  async function queryDelivery(ev) {
    ev.preventDefault()
    const id = new FormData(ev.currentTarget).get('delivery')
    try { const data = await api(`/delivery/${encodeURIComponent(id)}`); renderDelivery(data) } catch (e) { document.getElementById('delivery-view').innerHTML = '<div class="card">Error consultando delivery</div>' }
  }

  async function track(ev) {
    ev.preventDefault()
    const id = new FormData(ev.currentTarget).get('delivery')
    setTrackingId(id)
    try { const data = await api(`/delivery/${encodeURIComponent(id)}/track`); renderTrack(data) } catch (e) { document.getElementById('track-view').innerHTML = '<div class="card">Error consultando track</div>' }
  }

  function renderDelivery(d) {
    const wrap = document.getElementById('delivery-view')
    if (!d) { wrap.innerHTML = '<div class="card">No encontrado</div>'; return }
    wrap.innerHTML = `<div class="card"><div><strong>Delivery #${d.id_delivery || d.id}</strong></div><div>Pedido: ${d.id_order || d.order_id}</div><div>Rider: ${d.id_staff || d.rider_id}</div><div>Estado: ${d.status || d.estado}</div><div>Ubicación: ${(d.location && (d.location.lat + ', ' + d.location.lng)) || '—'}</div></div>`
  }

  function renderTrack(t) {
    const wrap = document.getElementById('track-view')
    if (!t) { wrap.innerHTML = '<div class="card">Sin datos</div>'; return }
    const points = Array.isArray(t) ? t : (t.points || [])
    const last = points[points.length - 1]
    wrap.innerHTML = `<div class="card"><div><strong>Puntos</strong> (${points.length})</div><div class="list">${points.map(p => `<div>${new Date(p.timestamp || Date.now()).toLocaleTimeString()} — ${p.lat}, ${p.lng}</div>`).join('')}</div><div style=\"margin-top:.5rem; color:#666\">Último: ${last ? (last.lat + ', ' + last.lng) : '—'}</div></div>`

    if (!mapRef.current) {
      mapRef.current = L.map('map').setView(last ? [last.lat, last.lng] : [-12.0464, -77.0428], 13)
      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', { maxZoom: 19, attribution: '&copy; OpenStreetMap' }).addTo(mapRef.current)
    }
    const map = mapRef.current
    const latlngs = points.filter(p => typeof p.lat === 'number' && typeof p.lng === 'number').map(p => [p.lat, p.lng])
    if (polyRef.current) { map.removeLayer(polyRef.current); polyRef.current = null }
    if (latlngs.length) {
      polyRef.current = L.polyline(latlngs, { color: '#03592e' }).addTo(map)
      map.fitBounds(polyRef.current.getBounds(), { padding: [20, 20] })
    }
    if (markerRef.current) { map.removeLayer(markerRef.current); markerRef.current = null }
    if (last && typeof last.lat === 'number' && typeof last.lng === 'number') {
      markerRef.current = L.marker([last.lat, last.lng], { icon: markerIcon }).addTo(map)
    }

    const destLat = parseFloat(document.getElementById('eta-dest-lat')?.value)
    const destLng = parseFloat(document.getElementById('eta-dest-lng')?.value)
    const kmh = parseFloat(document.getElementById('eta-speed')?.value) || 25
    if (isFinite(destLat) && isFinite(destLng) && last) {
      const meters = haversine({ lat: last.lat, lng: last.lng }, { lat: destLat, lng: destLng })
      const mps = Math.max(kmh, 1) * 1000 / 3600
      const seconds = meters / mps
      const el = document.getElementById('eta-view')
      if (el) el.textContent = `ETA ~ ${formatDuration(seconds)} (distancia ${(meters/1000).toFixed(2)} km)`
    }
  }

  useEffect(() => {
    if (!trackingId) return
    const t = setInterval(async () => {
      try { const data = await api(`/delivery/${encodeURIComponent(trackingId)}/track`); renderTrack(data) } catch (e) {}
    }, 8000)
    return () => clearInterval(t)
  }, [trackingId])

  return (
    <main className="container section">
      <h1 className="appTitle" style={{ color:'#03592e' }}>Gestión de Delivery</h1>

      <section className="grid" style={{ gridTemplateColumns:'1.3fr 1fr', gap:'1.5rem', alignItems:'start' }}>
        <div className="list">
          <div className="card">
            <h2 className="appTitle" style={{ marginBottom: '.5rem' }}>Entregas activas</h2>
            {!actives.length ? (
              <div className="card">No disponible o sin entregas</div>
            ) : (
              <div className="list">
                {actives.map(d => (
                  <div className="card" key={d.id_delivery || d.id}>
                    <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', gap:'.5rem' }}>
                      <div>
                        <div><strong>Delivery #{d.id_delivery || d.id}</strong> — Pedido {d.id_order || d.order_id}</div>
                        <div style={{ color:'#666' }}>Estado: {d.status || d.estado}</div>
                      </div>
                      <div style={{ display:'flex', gap:'.5rem' }}>
                        <button className="btn" onClick={async () => { setTrackingId(d.id_delivery || d.id); try { const data = await api(`/delivery/${encodeURIComponent(d.id_delivery || d.id)}/track`); renderTrack(data) } catch {} }}>Track</button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="card">
            <h2 className="appTitle" style={{ marginBottom: '.5rem' }}>Repartidores</h2>
            <div style={{ display:'flex', gap:'.5rem', alignItems:'center', marginBottom:'.5rem' }}>
              <input className="input" placeholder="ID o nombre" value={filter} onChange={e => setFilter(e.target.value)} />
              <button className="btn" onClick={loadRiders}>Actualizar</button>
            </div>
            <div className="list">
              {riders.filter(r => !filter || String(r.id_staff||r.id||'').includes(filter) || String(r.nombre||r.name||'').toLowerCase().includes(filter.toLowerCase()))
                .map(r => (
                  <div className="card" key={r.id_staff || r.id}>
                    <div style={{ display:'flex', justifyContent:'space-between', gap:'.5rem', alignItems:'center' }}>
                      <div>
                        <div><strong>{r.nombre || r.name || 'Rider'}</strong> <small>(ID: {r.id_staff || r.id})</small></div>
                        <div style={{ color:'#666' }}>Estado: {r.status || r.estado || 'desconocido'}</div>
                      </div>
                      <div style={{ display:'flex', gap:'.5rem' }}>
                        <button className="btn" onClick={() => setStatus(r.id_staff || r.id, 'available')}>Disponible</button>
                        <button className="btn" onClick={() => setStatus(r.id_staff || r.id, 'busy')}>Ocupado</button>
                      </div>
                    </div>
                  </div>
                ))}
            </div>
          </div>

          <div className="card">
            <h2 className="appTitle" style={{ marginBottom: '.5rem' }}>Asignar Delivery a Pedido</h2>
            <form onSubmit={assign} className="list">
              <input className="input" name="order" placeholder="ID de pedido" required />
              <input className="input" name="rider" placeholder="ID de staff" required />
              <button className="btn primary" type="submit">Asignar</button>
            </form>
            <div id="assign-msg" style={{ marginTop: '.5rem' }}></div>
          </div>

          <div className="card">
            <h2 className="appTitle" style={{ marginBottom: '.5rem' }}>Acciones del Delivery</h2>
            <form id="actions-form" className="list" onSubmit={e => e.preventDefault()}>
              <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:'.5rem' }}>
                <input className="input" name="delivery" placeholder="ID de delivery (para cambiar status)" required />
                <input className="input" name="order" placeholder="ID de pedido (para handoff/entregado)" required />
              </div>
              <div style={{ display:'flex', gap:'.5rem', flexWrap:'wrap' }}>
                <button className="btn" type="button" onClick={(e) => action('status-pickup', e.currentTarget.closest('form').querySelector('[name=delivery]').value)}>En camino a recoger</button>
                <button className="btn" type="button" onClick={(e) => action('handoff', e.currentTarget.closest('form').querySelector('[name=order]').value)}>Handoff</button>
                <button className="btn" type="button" onClick={(e) => action('status-onroute', e.currentTarget.closest('form').querySelector('[name=delivery]').value)}>En ruta</button>
                <button className="btn" type="button" onClick={(e) => action('delivered', e.currentTarget.closest('form').querySelector('[name=order]').value)}>Entregado</button>
              </div>
            </form>
            <div id="actions-msg" style={{ marginTop: '.5rem' }}></div>
          </div>

          <div className="card">
            <h2 className="appTitle" style={{ marginBottom: '.5rem' }}>Actualizar ubicación</h2>
            <form id="loc-form" className="list" onSubmit={sendLocation}>
              <input className="input" name="delivery" placeholder="ID de delivery" required />
              <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:'.5rem' }}>
                <input className="input" name="lat" placeholder="Latitud" required />
                <input className="input" name="lng" placeholder="Longitud" required />
              </div>
              <div style={{ display:'flex', gap:'.5rem' }}>
                <button className="btn" type="submit">Enviar ubicación</button>
                <button className="btn" type="button" onClick={useGPS}>Usar GPS del navegador</button>
              </div>
            </form>
            <div id="loc-msg" style={{ marginTop: '.5rem' }}></div>
          </div>
        </div>

        <aside className="list">
          <div className="card">
            <h2 className="appTitle" style={{ marginBottom: '.5rem' }}>Consultar Delivery</h2>
            <form onSubmit={queryDelivery} className="list">
              <input className="input" name="delivery" placeholder="ID de delivery" required />
              <button className="btn" type="submit">Consultar</button>
            </form>
            <div id="delivery-view" className="list" style={{ marginTop: '.75rem' }}></div>
          </div>

          <div className="card">
            <h2 className="appTitle" style={{ marginBottom: '.5rem' }}>Track en tiempo real</h2>
            <form onSubmit={track} className="list">
              <input className="input" name="delivery" placeholder="ID de delivery" required />
              <button className="btn" type="submit">Track</button>
            </form>
            <div id="track-view" className="list" style={{ marginTop: '.75rem' }}></div>
            <div id="map" className="map"></div>
          </div>

          <div className="card">
            <h2 className="appTitle" style={{ marginBottom: '.5rem' }}>ETA (estimado de llegada)</h2>
            <div className="list">
              <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:'.5rem' }}>
                <input id="eta-dest-lat" className="input" placeholder="Destino lat" />
                <input id="eta-dest-lng" className="input" placeholder="Destino lng" />
              </div>
              <div style={{ display:'flex', gap:'.5rem', alignItems:'center' }}>
                <input id="eta-speed" className="input" defaultValue="25" placeholder="Velocidad km/h (default 25)" />
                <button className="btn" onClick={(e)=>{ e.preventDefault(); if (trackingId) track(new Event('submit', { cancelable: true })); }}>Recalcular</button>
              </div>
              <div id="eta-view" style={{ color:'#666' }}>ETA ~ —</div>
            </div>
          </div>
        </aside>
      </section>
    </main>
  )
}
