import { useState, type FormEvent } from 'react'
import { Link, Navigate, useLocation } from 'react-router-dom'
import TextField from '../components/TextField'
import { useAuth } from '../context/AuthContext'
import { ApiError } from '../lib/api'

export default function Login() {
  const { user, loading, login } = useAuth()
  const state = useLocation().state as { from?: string } | null
  const from = state?.from ?? '/'
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [busy, setBusy] = useState(false)

  if (loading) return null
  if (user) return <Navigate to={from} replace />

  const submit = async (e: FormEvent) => {
    e.preventDefault()
    setError('')
    setBusy(true)
    try {
      await login(email, password)
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Something went wrong')
      setBusy(false)
    }
  }

  return (
    <form onSubmit={submit} className="space-y-4">
      <div>
        <h2 className="text-2xl font-bold">Log in</h2>
        <p className="mt-1 text-xs font-semibold">
          New user?{' '}
          <Link to="/register" state={state} className="text-accent hover:underline">
            Create account
          </Link>
        </p>
      </div>
      <TextField type="email" placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)} autoComplete="email" required />
      <TextField type="password" placeholder="Password" value={password} onChange={(e) => setPassword(e.target.value)} autoComplete="current-password" required />
      {error && <p className="text-sm text-red-300">{error}</p>}
      <button
        type="submit"
        disabled={busy}
        className="h-12 w-full bg-accent text-sm font-extrabold text-black transition-colors hover:bg-accent-hover disabled:opacity-60"
      >
        {busy ? 'Logging in…' : 'Log in'}
      </button>
    </form>
  )
}