import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react'
import { apiFetch } from '../../lib/api.js'
import { adminFetch, getToken, setToken } from './adminApi.js'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [ready, setReady] = useState(false)

  useEffect(() => {
    const token = getToken()
    if (!token) {
      setReady(true)
      return
    }
    adminFetch('/api/admin/auth/me')
      .then((u) => setUser(u))
      .catch(() => setToken(null))
      .finally(() => setReady(true))
  }, [])

  const login = useCallback(async (email, senha) => {
    const res = await apiFetch('/api/admin/auth/login', {
      method: 'POST',
      body: { email, senha },
    })
    setToken(res.token)
    setUser({ id: res.id, nome: res.nome, email: res.email, role: res.role })
    return res
  }, [])

  const logout = useCallback(() => {
    setToken(null)
    setUser(null)
  }, [])

  const isMaster = user?.role === 'Master'

  const value = useMemo(
    () => ({ user, ready, isMaster, login, logout }),
    [user, ready, isMaster, login, logout],
  )
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth deve ser usado dentro de AuthProvider')
  return ctx
}
