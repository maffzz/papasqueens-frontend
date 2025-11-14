import React, { useEffect, useState } from 'react'
import { useCart } from '../context/CartContext'
import { api, formatPrice } from '../api/client'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

export default function Menu() {
  const [items, setItems] = useState([])
  const [loading, setLoading] = useState(true)
  const [err, setErr] = useState('')
  const { items: cart, add, remove, clear, total } = useCart()
  const nav = useNavigate()
  const { auth } = useAuth()

  useEffect(() => {
    (async () => {
      try {
        const data = await api('/menu')
        setItems(Array.isArray(data) ? data : (data.items || []))
      } catch (e) { setErr('Error cargando menú') } finally { setLoading(false) }
    })()
  }, [])

  async function createOrder(ev) {
    ev.preventDefault()
    if (!cart.length) return alert('Tu carrito está vacío')
    const fd = new FormData(ev.currentTarget)
    const tenant_id = localStorage.getItem('tenantId') || '';
    const payload = {
      id_customer: auth?.id || '',
      tenant_id,
      list_id_products: cart.map(x => x.id_producto),
      // Otros datos adicionales para info rápida:
      customer_name: fd.get('customer'),
      phone: fd.get('phone'),
      address: fd.get('address'),
    }
    try {
      const res = await api('/orders', { method: 'POST', body: JSON.stringify(payload) })
      clear()
      const orderId = res.id_order || res.order_id || res.id || ''
      if (orderId) nav(`/track?id=${encodeURIComponent(orderId)}`)
    } catch (e) { alert('No se pudo crear el pedido') }
  }

  return (
    <main className="container section">
      <h1 className="appTitle" style={{ color: '#03592e' }}>Haz tu pedido</h1>
      <section className="grid" style={{ gridTemplateColumns: '2fr 1fr', gap: '1.5rem', alignItems: 'start' }}>
        <div>
          {loading ? <div className="card">Cargando…</div> : err ? <div className="card">{err}</div> : (
            <div className="grid" style={{ gridTemplateColumns: 'repeat(3, minmax(0,1fr))' }}>
              {items.map(item => (
                <div key={item.id_producto || item.id} className="card">
                  {item.image_url && (
                    <div style={{ marginBottom: '.5rem' }}>
                      <img
                        src={item.image_url}
                        alt={item.nombre || item.name}
                        style={{ width: '100%', height: '160px', objectFit: 'cover', borderRadius: '.5rem' }}
                      />
                    </div>
                  )}
                  <div style={{ display:'flex', flexDirection:'column', gap:'.5rem' }}>
                    <div style={{ fontWeight:600 }}>{item.nombre || item.name}</div>
                    <div className="price">{formatPrice(item.precio || item.price || 0)}</div>
                    <button className="btn primary" onClick={() => add({ id_producto: item.id_producto || item.id || item.sku, nombre: item.nombre || item.name, precio: item.precio || item.price || 0 })}>Agregar</button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
        <aside className="card" style={{ position:'sticky', top:'5rem' }}>
          <h2 className="appTitle" style={{ marginBottom: '.5rem' }}>Tu carrito</h2>
          <div className="list">
            {cart.map(x => (
              <div key={x.id_producto} className="card">
                <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', gap:'.75rem' }}>
                  <div>
                    <div>{x.nombre}</div>
                    <div className="price">{formatPrice(x.precio)} × {x.qty}</div>
                  </div>
                  <button className="btn" onClick={() => remove(x.id_producto)}>Quitar</button>
                </div>
              </div>
            ))}
          </div>
          <div style={{ display:'flex', justifyContent:'space-between', marginTop:'1rem' }}>
            <div>Total</div>
            <div className="price">{formatPrice(total)}</div>
          </div>
          <hr style={{ margin:'1rem 0', border:'none', borderTop:'1px solid #eee' }} />
          <form onSubmit={createOrder} className="list">
            <input className="input" name="customer" placeholder="Tu nombre" required />
            <input className="input" name="phone" placeholder="Teléfono" required />
            <input className="input" name="address" placeholder="Dirección de entrega" />
            <button className="btn primary" type="submit">Confirmar pedido</button>
          </form>
        </aside>
      </section>
    </main>
  )
}
