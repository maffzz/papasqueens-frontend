import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { api } from '../api/client'
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
    const payload = { email: fd.get('email'), password: fd.get('password'), name: fd.get('name') }
    if (!payload.email || !payload.password) { setMsg('Completa email y contraseña'); showToast({ type:'warning', message:'Completa email y contraseña' }); return }
    try {
      const res = await api('/auth/customer/login', { method: 'POST', body: JSON.stringify(payload) })
      const token = res.token || res.access_token || 'customer'
      const headersReq = res.headers_required || {}
      login({ token, role: 'cliente', user: res.name || payload.name || payload.email, id: res.id_user || headersReq['X-User-Id'], email: res.email || payload.email, type: 'customer' })
      setMsg('Ingreso correcto')
      showToast({ type:'success', message:'Ingreso correcto' })
      nav('/')
    } catch (e) {
      setMsg('Credenciales inválidas')
      showToast({ type:'error', message:'Credenciales inválidas' })
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
