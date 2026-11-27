import { useState, type FormEvent } from 'react'
import { Link, Navigate, useLocation } from 'react-router-dom'
import TextField from '../components/TextField'
import { useAuth } from '../context/AuthContext'
import { ApiError } from '../lib/api'

export default function Register() {
  const { user, loading, register } = useAuth()
  const state = useLocation().state as { from?: string } | null
  const from = state?.from ?? '/'
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [fields, setFields] = useState<Record<string, string>>({})
  const [error, setError] = useState('')
  const [busy, setBusy] = useState(false)

  if (loading) return null
  if (user) return <Navigate to={from} replace />

  const submit = async (e: FormEvent) => {
    e.preventDefault()
    setError('')
    setFields({})
    setBusy(true)
    try {
      await register(name, email, password)
    } catch (err) {
      if (err instanceof ApiError) {
        setFields(err.fields ?? {})
        if (!err.fields) setError(err.message)
      } else setError('Something went wrong')
      setBusy(false)
    }
  }

  return (
    <form onSubmit={submit} className="space-y-4" noValidate>
      <div>
        <h2 className="text-2xl font-bold">Create account</h2>
        <p className="mt-1 text-xs font-semibold">
          Already registered?{' '}
          <Link to="/login" state={state} className="text-accent hover:underline">
            Log in
          </Link>
        </p>
      </div>
      <TextField placeholder="Name" value={name} onChange={(e) => setName(e.target.value)} autoComplete="name" error={fields.name} />
      <TextField type="email" placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)} autoComplete="email" error={fields.email} />
      <TextField type="password" placeholder="Password (min. 8 characters)" value={password} onChange={(e) => setPassword(e.target.value)} autoComplete="new-password" error={fields.password} />
      {error && <p className="text-sm text-red-300">{error}</p>}
      <button
        type="submit"
        disabled={busy}
        className="h-12 w-full bg-accent text-sm font-extrabold text-black transition-colors hover:bg-accent-hover disabled:opacity-60"
      >
        {busy ? 'Creating…' : 'Create account'}
      </button>
    </form>
  )
}