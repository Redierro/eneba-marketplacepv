import { useState, type FormEvent } from 'react'
import { Link, Navigate, useNavigate } from 'react-router-dom'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import Container from '../components/Container'
import TextField from '../components/TextField'
import { useCart } from '../context/CartContext'
import { api, ApiError } from '../lib/api'
import { formatPrice } from '../lib/format'
import type { CartQuote } from '../lib/types'

const formatCard = (v: string) => v.replace(/\D/g, '').slice(0, 19).replace(/(.{4})/g, '$1 ').trim()
const formatExpiry = (v: string) => {
  const d = v.replace(/\D/g, '').slice(0, 4)
  return d.length > 2 ? `${d.slice(0, 2)}/${d.slice(2)}` : d
}

export default function Checkout() {
  const { items, clear } = useCart()
  const navigate = useNavigate()
  const qc = useQueryClient()
  const [number, setNumber] = useState('')
  const [name, setName] = useState('')
  const [expiry, setExpiry] = useState('')
  const [cvc, setCvc] = useState('')
  const [fields, setFields] = useState<Record<string, string>>({})
  const [error, setError] = useState('')
  const [busy, setBusy] = useState(false)

  const { data } = useQuery({
    queryKey: ['cart', JSON.stringify(items)],
    queryFn: () => api<CartQuote>('/cart/quote', { method: 'POST', body: { items } }),
    enabled: items.length > 0,
  })

  if (items.length === 0 && !busy) return <Navigate to="/cart" replace />

  const lines = data?.items.filter((l) => l.available) ?? []

  const submit = async (e: FormEvent) => {
    e.preventDefault()
    if (lines.length === 0) return
    setError('')
    setFields({})
    setBusy(true)
    try {
      const r = await api<{ order_id: number }>('/checkout', {
        method: 'POST',
        body: {
          items: lines.map((l) => ({ offer_id: l.offer_id, quantity: l.quantity })),
          card: { number, name, expiry, cvc },
        },
      })
      ;['products', 'product', 'home', 'cart', 'orders', 'filters'].forEach((k) => qc.invalidateQueries({ queryKey: [k] }))
      navigate(`/orders/${r.order_id}`, { state: { purchased: true }, replace: true })
      clear()
    } catch (err) {
      if (err instanceof ApiError) {
        setFields(err.fields ?? {})
        setError(err.message)
        if (err.status === 409) qc.invalidateQueries({ queryKey: ['cart'] })
      } else setError('Something went wrong')
      setBusy(false)
    }
  }

  return (
    <Container className="py-8">
      <h1 className="mb-6 text-3xl font-bold">Payment</h1>
      <form onSubmit={submit} noValidate className="flex flex-col gap-8 lg:flex-row lg:items-start">
        <div className="flex-1 space-y-4 bg-night p-6">
          <h2 className="text-xl font-bold">Card details</h2>
          <p className="text-xs text-muted">
            Simulated payment. Use <b>4242 4242 4242 4242</b>, any future expiry and any CVC. Use <b>4000 0000 0000 0002</b> to test a declined card.
          </p>
          <TextField placeholder="Card number" value={number} onChange={(e) => setNumber(formatCard(e.target.value))} inputMode="numeric" autoComplete="cc-number" error={fields.card_number} />
          <TextField placeholder="Name on card" value={name} onChange={(e) => setName(e.target.value)} autoComplete="cc-name" error={fields.name} />
          <div className="grid grid-cols-2 gap-4">
            <TextField placeholder="MM/YY" value={expiry} onChange={(e) => setExpiry(formatExpiry(e.target.value))} inputMode="numeric" autoComplete="cc-exp" error={fields.expiry} />
            <TextField placeholder="CVC" value={cvc} onChange={(e) => setCvc(e.target.value.replace(/\D/g, '').slice(0, 4))} inputMode="numeric" autoComplete="cc-csc" error={fields.cvc} />
          </div>
          {error && (
            <p className="text-sm text-red-300">
              {error}{' '}
              {error.includes('stock') || error.includes('available') ? (
                <Link to="/cart" className="underline">Back to cart</Link>
              ) : null}
            </p>
          )}
        </div>

        <aside className="bg-night p-6 lg:w-[380px] lg:shrink-0">
          <h2 className="text-xl font-bold">Summary</h2>
          <ul className="mt-4 space-y-3 text-sm">
            {lines.map((l) => (
              <li key={l.offer_id} className="flex justify-between gap-3">
                <span>
                  {l.quantity} × {l.name}
                </span>
                <span className="font-semibold">{formatPrice(l.price * l.quantity)}</span>
              </li>
            ))}
          </ul>
          <div className="mt-4 flex items-end justify-between border-t border-white/15 pt-4">
            <span className="font-bold">Total:</span>
            <span className="text-3xl font-extrabold">{formatPrice(lines.reduce((s, l) => s + l.price * l.quantity, 0))}</span>
          </div>
          <button
            type="submit"
            disabled={busy || lines.length === 0}
            className="mt-5 w-full bg-accent py-3 text-sm font-extrabold text-black transition-colors hover:bg-accent-hover disabled:opacity-60"
          >
            {busy ? 'Processing…' : 'Pay now'}
          </button>
        </aside>
      </form>
    </Container>
  )
}