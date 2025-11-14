import React, { useEffect, useState } from 'react'
import { api, formatPrice } from '../api/client'
import { useToast } from '../context/ToastContext'

export default function Kitchen() {
  const [queue, setQueue] = useState([])
  const [loading, setLoading] = useState(true)
  const { showToast } = useToast()

  async function load() {
    try {
      const data = await api('/kitchen/queue')
      setQueue(Array.isArray(data) ? data : (data.items || []))
    } catch (e) {
      setQueue([])
      showToast({ type:'error', message:'Error cargando la cola' })
    } finally { setLoading(false) }
  }

  useEffect(() => { load(); const t = setInterval(load, 15000); return () => clearInterval(t) }, [])

  async function doAction(kind, id) {
    try {
      if (kind === 'accept') await api(`/kitchen/orders/${encodeURIComponent(id)}/accept`, { method: 'POST' })
      if (kind === 'pack') await api(`/kitchen/orders/${encodeURIComponent(id)}/pack`, { method: 'POST' })
      await load()
      showToast({ type:'success', message: kind === 'accept' ? 'Pedido aceptado' : 'Pedido empacado' })
    } catch (e) {
      showToast({ type:'error', message:'No se pudo ejecutar la acción' })
    }
  }

  return (
    <main className="container section">
      <h1 className="appTitle" style={{ color:'#03592e' }}>Cocina - Cola de pedidos</h1>
      <div style={{ display:'flex', gap:'.5rem', alignItems:'center' }}>
        <button className="btn" onClick={load}>Actualizar</button>
      </div>
      {loading ? <div className="card" style={{ marginTop: '.75rem' }}>Cargando…</div> : (
        <div className="grid" style={{ gridTemplateColumns:'repeat(2, minmax(0,1fr))', marginTop: '.75rem' }}>
          {queue.length === 0 ? <div className="card">No hay pedidos en cola</div> : queue.map(order => (
            <div className="card" key={order.id_order || order.order_id || order.id}>
              <div style={{ display:'flex', flexDirection:'column', gap:'.5rem' }}>
                <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center' }}>
                  <strong>Pedido #{order.id_order || order.order_id || order.id}</strong>
                  <span className="price">{formatPrice(order.total || 0)}</span>
                </div>
                <div>Cliente: {order.customer_name || order.customer || ''}</div>
                <ul className="list" style={{ paddingLeft:'1rem' }}>
                  {(order.items || []).map((i, idx) => <li key={idx}>{i.cantidad || i.qty || 1} × {i.nombre || i.name}</li>)}
                </ul>
                <div style={{ display:'flex', gap:'.5rem' }}>
                  <button className="btn primary" onClick={() => doAction('accept', order.id_order || order.order_id || order.id)}>Aceptar</button>
                  <button className="btn" onClick={() => doAction('pack', order.id_order || order.order_id || order.id)}>Empacar</button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </main>
  )
}
