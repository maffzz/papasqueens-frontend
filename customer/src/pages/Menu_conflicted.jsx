import React, { useEffect, useState } from 'react'
import { useCart } from '../context/CartContext'
import { api, formatPrice, getTenantId } from '../api/client'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { useToast } from '../context/ToastContext'

export default function Menu() {
  const [items, setItems] = useState([])
  const [allItems, setAllItems] = useState([])
  const [loading, setLoading] = useState(true)
  const [err, setErr] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('')
  const { items: cart, add, remove, clear, total } = useCart()
  const nav = useNavigate()
  const { auth } = useAuth()
  const { showToast } = useToast()

  useEffect(() => {
    // Leer categoría seleccionada del localStorage
    const cat = localStorage.getItem('selectedCategory') || ''
    setSelectedCategory(cat)
  }, [])

  useEffect(() => {
    (async () => {
      try {
        const data = await api('/menu')
        const all = Array.isArray(data) ? data : (data.items || [])
        setAllItems(all)
        
        // Guardar categorías únicas en localStorage para que el header las use
        const uniqueCategories = [...new Set(all.map(item => item.categoria || item.category).filter(Boolean))]
        if (uniqueCategories.length > 0) {
          localStorage.setItem('availableCategories', JSON.stringify(uniqueCategories))
        }
        
        // Aplicar filtro de categoría si existe
        // El backend usa el campo "categoria" (en español) según add_menu_item.py
        if (selectedCategory) {
          const filtered = all.filter(item => {
            const itemCat = (item.categoria || item.category || '').toLowerCase().trim()
            const selectedCat = selectedCategory.toLowerCase().trim()
            // Coincidencia exacta o parcial
            return itemCat === selectedCat || itemCat.includes(selectedCat) || selectedCat.includes(itemCat)
          })
          setItems(filtered)
        } else {
          setItems(all)
        }
      } catch (e) { 
        console.error('Error cargando menú:', e)
        setErr('Error cargando menú: ' + (e.message || 'Error desconocido'))
      } finally { setLoading(false) }
    })()
  }, [selectedCategory])

  async function createOrder(ev) {
    ev.preventDefault()
    if (!cart.length) {
      alert('Tu carrito está vacío')
      return
    }
    if (!auth?.id) {
      alert('Debes iniciar sesión para crear un pedido. Redirigiendo al login...')
      nav('/login')
      return
    }
    const tenant_id = getTenantId()
    if (!tenant_id) {
      alert('Error: No se encontró tenant_id. Por favor recarga la página.')
      return
    }
    const payload = {
      id_customer: auth.id,
      tenant_id,
      list_id_products: cart.map(x => x.id_producto).filter(Boolean),
    }
    if (!payload.list_id_products.length) {
      alert('Error: No hay productos válidos en el carrito')
      return
    }
    try {
      console.log('Creando pedido con payload:', payload)
      const res = await api('/orders', { method: 'POST', body: JSON.stringify(payload) })
      console.log('Respuesta del servidor:', res)
      clear()
      const orderId = res.id_order || res.order_id || res.id || ''
      if (orderId) {
        alert(`¡Pedido creado exitosamente! ID: ${orderId}`)
        nav(`/track?id=${encodeURIComponent(orderId)}`)
      } else {
        alert('Pedido creado pero no se recibió ID. Revisa en "Rastrear pedido"')
      }
    } catch (e) {
      console.error('Error al crear pedido:', e)
      const errorMsg = e.message || 'No se pudo crear el pedido'
      showToast({ type: 'error', message: `Error: ${errorMsg}` })
      alert(`Error: ${errorMsg}`)
    }
  }

  return (
<<<<<<< HEAD
    <main style={{ background: '#f5f5f5', minHeight: '100vh', paddingTop: '2rem' }}>
      <div className="container section">
        <section className="grid" style={{ gridTemplateColumns: '2fr 1fr', gap: '1.5rem', alignItems: 'start' }}>
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
              <h2 style={{ color: '#03592e', fontSize: '28px', margin: 0 }}>
                Nuestro Menú {selectedCategory && `- ${selectedCategory}`}
              </h2>
              {selectedCategory && (
                <button 
                  className="btn" 
                  onClick={() => {
                    setSelectedCategory('')
                    localStorage.removeItem('selectedCategory')
                    setItems(allItems)
                  }}
                >
                  Limpiar filtro
                </button>
              )}
=======
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
>>>>>>> 88daaaf94185ec1a916f58e55352c957ebdc8789
            </div>
            {loading ? <div className="card">Cargando…</div> : err ? <div className="card">{err}</div> : (
              <div className="grid" style={{ gridTemplateColumns: 'repeat(3, minmax(0,1fr))', gap: '1rem' }}>
                {items.map(item => (
                  <div key={item.id_producto || item.id} className="card" style={{ cursor: 'pointer', transition: 'transform 0.2s' }}>
                    <div style={{ display:'flex', flexDirection:'column', gap:'.5rem' }}>
                      {/* Imagen del producto si existe */}
                      {item.imagen || item.image || item.image_url ? (
                        <img 
                          src={item.imagen || item.image || item.image_url} 
                          alt={item.nombre || item.name} 
                          style={{ width:'100%', height:'150px', borderRadius:'8px', objectFit:'cover', marginBottom:'.5rem' }} 
                        />
                      ) : (
                        <div style={{ width:'100%', height:'150px', background:'#f0f0f0', borderRadius:'8px', display:'flex', alignItems:'center', justifyContent:'center', fontSize:'48px', marginBottom:'.5rem' }}>
                          🍟
                        </div>
                      )}
                      <div style={{ fontWeight:600, fontSize:'16px' }}>{item.nombre || item.name}</div>
                      <div className="price" style={{ fontSize:'18px' }}>{formatPrice(item.precio || item.price || 0)}</div>
                      <button 
                        className="btn primary" 
                        onClick={(e) => {
                          e.preventDefault()
                          e.stopPropagation()
                          const product = {
                            id_producto: item.id_producto || item.id || item.sku,
                            nombre: item.nombre || item.name,
                            precio: item.precio || item.price || 0
                          }
                          if (!product.id_producto) {
                            showToast({ type: 'error', message: 'Error: Producto sin ID válido' })
                            return
                          }
                          add(product)
                          showToast({ type: 'success', message: `${product.nombre} agregado al carrito` })
                        }}
                        style={{ width:'100%' }}
                      >
                        Agregar
                      </button>
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
                  <button 
                    className="btn" 
                    onClick={(e) => {
                      e.preventDefault()
                      remove(x.id_producto)
                      showToast({ type: 'info', message: `${x.nombre} removido del carrito` })
                    }}
                  >
                    Quitar
                  </button>
                </div>
              </div>
            ))}
          </div>
          <div style={{ display:'flex', justifyContent:'space-between', marginTop:'1rem' }}>
            <div>Total</div>
            <div className="price">{formatPrice(total)}</div>
          </div>
          <hr style={{ margin:'1rem 0', border:'none', borderTop:'1px solid #eee' }} />
          {!auth?.id && (
            <div style={{ padding: '1rem', background: '#fff3cd', borderRadius: '8px', marginBottom: '1rem' }}>
              <strong>⚠️ Debes iniciar sesión para crear un pedido</strong>
              <button className="btn primary" onClick={() => nav('/login')} style={{ width: '100%', marginTop: '0.5rem' }}>
                Ir a Login
              </button>
            </div>
          )}
          <form onSubmit={createOrder} className="list">
            <button 
              className="btn primary" 
              type="submit" 
              disabled={!auth?.id || !cart.length}
              style={{ width: '100%' }}
            >
              {!auth?.id ? 'Inicia sesión primero' : cart.length ? 'Confirmar pedido' : 'Carrito vacío'}
            </button>
          </form>
        </aside>
        </section>
      </div>
    </main>
  )
}
