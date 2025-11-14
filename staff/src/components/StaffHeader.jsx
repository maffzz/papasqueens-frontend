import React, { useState } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

export default function StaffHeader() {
  const { auth, logout } = useAuth()
  const [open, setOpen] = useState(false)
  return (
    <header className="header">
      <div className="container nav">
        <Link to="/delivery"><img className="logo" alt="Papas Queen's" src="https://tofuu.getjusto.com/orioneat-local/resized2/W2N3u38SAkY8yFaNM-x-300.webp" /></Link>
        <nav style={{ marginLeft: 'auto', display: 'flex', gap: '.5rem' }}>
          {auth?.role === 'staff' || auth?.role === 'admin' ? (
            <>
              <Link className="btn" to="/kitchen">Cocina</Link>
              <Link className="btn" to="/delivery">Delivery</Link>
              {auth?.role === 'admin' && (
                <div style={{ position:'relative' }}>
                  <button className="btn" onClick={() => setOpen(o => !o)}>Admin ▾</button>
                  {open && (
                    <div style={{ position:'absolute', right:0, top:'110%', background:'#fff', border:'1px solid #e5e7eb', borderRadius:8, padding:8, display:'flex', flexDirection:'column', gap:6, minWidth:180, boxShadow:'0 8px 20px rgba(0,0,0,.12)' }} onMouseLeave={() => setOpen(false)}>
                      <Link className="btn ghost" to="/admin/menu" onClick={()=>setOpen(false)}>Admin Menú</Link>
                      <Link className="btn ghost" to="/admin/staff" onClick={()=>setOpen(false)}>Admin Staff</Link>
                      <Link className="btn ghost" to="/admin/analytics" onClick={()=>setOpen(false)}>Analytics</Link>
                    </div>
                  )}
                </div>
              )}
              <button className="btn" onClick={logout}>Salir</button>
            </>
          ) : (
            <Link className="btn" to="/login">Staff</Link>
          )}
        </nav>
      </div>
    </header>
  )
}
