import { createContext, useCallback, useContext, useEffect, useState, type ReactNode } from 'react'
import { api } from '../lib/api'
import type { User } from '../lib/types'
import { useQueryClient } from '@tanstack/react-query'

type Ctx = {
  user: User | null
  loading: boolean
  login: (email: string, password: string) => Promise<void>
  register: (name: string, email: string, password: string) => Promise<void>
  logout: () => Promise<void>
}

const AuthContext = createContext<Ctx | null>(null)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)
  const qc = useQueryClient()

  useEffect(() => {
    api<{ user: User }>('/auth/me')
      .then((r) => setUser(r.user))
      .catch(() => setUser(null))
      .finally(() => setLoading(false))
  }, [])

    const login = useCallback(async (email: string, password: string) => {
		const r = await api<{ user: User }>('/auth/login', { method: 'POST', body: { email, password } })
		qc.removeQueries({ queryKey: ['orders'] })
		setUser(r.user)
	  }, [qc])

	const register = useCallback(async (name: string, email: string, password: string) => {
		const r = await api<{ user: User }>('/auth/register', { method: 'POST', body: { name, email, password } })
		qc.removeQueries({ queryKey: ['orders'] })
		setUser(r.user)
	  }, [qc])

	const logout = useCallback(async () => {
		await api('/auth/logout', { method: 'POST' })
		qc.removeQueries({ queryKey: ['orders'] })
		setUser(null)
	  }, [qc])

  return <AuthContext.Provider value={{ user, loading, login, register, logout }}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const c = useContext(AuthContext)
  if (!c) throw new Error('useAuth must be used inside AuthProvider')
  return c
}