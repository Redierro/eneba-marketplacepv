import { useState } from 'react'
import { Link, useLocation, useParams } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import Container from '../components/Container'
import { api, ApiError } from '../lib/api'
import { formatPrice } from '../lib/format'
import type { OrderDetail as Order } from '../lib/types'

function KeyBox({ value }: { value: string }) {
  const [copied, setCopied] = useState(false)
  const copy = async () => {
    try {
      await navigator.clipboard.writeText(value)
      setCopied(true)
      setTimeout(() => setCopied(false), 1500)
    } catch {
      /* clipboard unavailable */
    }
  }
  return (
    <div className="flex items-center gap-3">
      <code className="bg-primary-dark px-3 py-2 font-mono text-sm tracking-wider">{value}</code>
      <button onClick={copy} className="border border-white px-3 py-2 text-xs font-bold hover:bg-white/10">
        {copied ? 'Copied' : 'Copy'}
      </button>
    </div>
  )
}

export default function OrderDetail() {
  const { id } = useParams()
  const purchased = (useLocation().state as { purchased?: boolean } | null)?.purchased
  const { data, isLoading, error } = useQuery({
    queryKey: ['orders', id],
    queryFn: () => api<Order>(`/orders/${id}`),
    retry: false,
  })

  if (isLoading) return <Container className="py-10"><div className="h-[300px] animate-pulse bg-white/10" /></Container>
  if (error || !data) {
    return (
      <Container className="py-16 text-center">
        <h1 className="text-3xl font-bold">{error instanceof ApiError && error.status === 404 ? 'Order not found' : 'Something went wrong'}</h1>
        <Link to="/orders" className="mt-6 inline-block border border-white px-10 py-3 text-sm font-bold hover:bg-white/10">
          My orders
        </Link>
      </Container>
    )
  }

  return (
    <Container className="py-8">
      {purchased && (
        <div className="mb-6 bg-mint/20 p-6">
          <h1 className="text-3xl font-extrabold">Thank you for your purchase!</h1>
          <p className="mt-1 text-sm">Your digital keys are below. You can find them in your orders any time.</p>
        </div>
      )}
      <div className="mb-6 flex flex-wrap items-end justify-between gap-2">
        <h2 className="text-2xl font-bold">Order #{data.id}</h2>
        <span className="text-sm text-muted">{new Date(data.created_at).toLocaleString('en-GB')}</span>
      </div>

      <div className="space-y-4">
        {data.items.map((it, i) => (
          <div key={i} className="flex flex-wrap gap-4 bg-night p-4">
            <Link to={`/product/${it.slug}`} className="h-[110px] w-[82px] shrink-0 bg-deep">
              {it.image_url && <img src={it.image_url} alt="" className="h-full w-full object-cover" />}
            </Link>
            <div className="flex min-w-0 flex-1 flex-col gap-2">
              <div>
                <Link to={`/product/${it.slug}`} className="font-bold hover:underline">
                  {it.name}
                </Link>
                <div className="text-xs text-muted">Sold by {it.seller}</div>
              </div>
              <KeyBox value={it.key} />
            </div>
            <div className="font-extrabold">{formatPrice(it.price)}</div>
          </div>
        ))}
      </div>

      <div className="mt-6 flex items-end justify-end gap-4">
        <span className="font-bold">Total:</span>
        <span className="text-3xl font-extrabold">{formatPrice(data.total)}</span>
      </div>
    </Container>
  )
}