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
    const payload = { username: fd.get('username'), password: fd.get('password') }
    if (!payload.username || !payload.password) { setMsg('Completa usuario y contraseña'); showToast({ type:'warning', message:'Completa usuario y contraseña' }); return }
    try {
      const res = await api('/auth/staff/login', { method: 'POST', body: JSON.stringify(payload) })
      const token = res.token || res.access_token
      const role = res.role || 'staff'
      if (!token) throw new Error('Sin token')
      const headersReq = res.headers_required || {}
      login({ token, role, user: res.user || payload.username, id: res.id_staff || headersReq['X-User-Id'], email: headersReq['X-User-Email'], type: 'staff' })
      setMsg('Ingreso correcto, redirigiendo…')
      showToast({ type:'success', message:'Ingreso correcto' })
      nav('/delivery')
    } catch (e) {
      setMsg('Credenciales inválidas')
      showToast({ type:'error', message:'Credenciales inválidas' })
    }
  }

  return (
    <main className="container section" style={{ maxWidth: 480 }}>
      <h1 className="appTitle" style={{ color: '#03592e' }}>Acceso Staff</h1>
      <form onSubmit={onSubmit} className="list card">
        <input className="input" name="username" placeholder="Usuario" required />
        <input className="input" name="password" type="password" placeholder="Contraseña" required />
        <button className="btn primary" type="submit">Ingresar</button>
      </form>
      <div style={{ marginTop: '.75rem' }}>{msg}</div>
    </main>
  )
}
