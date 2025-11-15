import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { api, getTenantId } from '../api/client'
import { useAuth } from '../context/AuthContext'
import { useToast } from '../context/ToastContext'

export default function Login() {
  const [msg, setMsg] = useState('')
  const nav = useNavigate()
  const { login } = useAuth()
  const { showToast } = useToast()

  async function onSubmit(ev) {
    ev.preventDefault()
    const fd = new FormData(ev.currentTarget)
    const tenant_id = getTenantId()
    if (!tenant_id) {
      setMsg('Error: No se encontró tenant_id. Por favor recarga la página.')
      showToast({ type: 'error', message: 'Error: tenant_id requerido' })
      return
    }
    const payload = { 
      email: fd.get('email'), 
      password: fd.get('password'), 
      name: fd.get('name'),
      tenant_id: tenant_id  // Backend requiere tenant_id en el body
    }
    if (!payload.email || !payload.password) { 
      setMsg('Completa email y contraseña')
      showToast({ type:'warning', message:'Completa email y contraseña' })
      return 
    }
    try {
      console.log('Intentando login con tenant_id:', tenant_id)
      const res = await api('/auth/customer/login', { method: 'POST', body: JSON.stringify(payload) })
      console.log('Respuesta del login:', res)
      const token = res.token || res.access_token || 'customer'
      const headersReq = res.headers_required || {}
      const userData = {
        token,
        role: 'cliente',
        user: res.name || payload.name || payload.email,
        id: res.id_user || res.id || headersReq['X-User-Id'] || payload.email,
        email: res.email || payload.email,
        type: 'customer',
        tenant_id: res.tenant_id || tenant_id  // Guardar tenant_id en auth
      }
      login(userData)
      setMsg('Ingreso correcto')
      showToast({ type:'success', message:'Ingreso correcto' })
      setTimeout(() => nav('/'), 500)
    } catch (e) {
      console.error('Error en login:', e)
      const errorMsg = e.message || 'Credenciales inválidas'
      setMsg(errorMsg)
      showToast({ type:'error', message: errorMsg })
    }
  }

  return (
    <main className="container section" style={{ maxWidth: 480 }}>
      <h1 className="appTitle" style={{ color: '#03592e' }}>Acceso Clientes</h1>
      <form onSubmit={onSubmit} className="list card">
        <input className="input" name="name" placeholder="Tu nombre" />
        <input className="input" name="email" type="email" placeholder="Email" required />
        <input className="input" name="password" type="password" placeholder="Contraseña" required />
        <button className="btn primary" type="submit">Ingresar</button>
      </form>
      <div style={{ marginTop: '.75rem' }}>{msg}</div>
    </main>
  )
}
