import React, { createContext, useContext, useEffect, useState } from 'react'
import { setAuth as persist, getAuth as read } from '../api/client'

const AuthCtx = createContext(null)

export function AuthProvider({ children }) {
  const [auth, setAuth] = useState(() => read())
  useEffect(() => { persist(auth) }, [auth])
  const login = (data) => setAuth(data)
  const logout = () => setAuth({})
  return <AuthCtx.Provider value={{ auth, login, logout }}>{children}</AuthCtx.Provider>
}

export function useAuth() { return useContext(AuthCtx) }

export function RequireRole({ role, roles, children }) {
  const { auth } = useAuth()
  const actual = auth?.role
  const required = roles || (role ? [role] : [])
  const ok = () => {
    if (!required?.length) return !!actual
    return required.some(r => r === 'staff' ? (actual === 'staff' || actual === 'admin') : actual === r)
  }
  if (!ok()) return <div className="container section"><div className="card">Acceso restringido</div></div>
  return children
}
