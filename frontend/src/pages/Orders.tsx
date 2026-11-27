import { Link } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import Container from '../components/Container'
import { api } from '../lib/api'
import { formatPrice } from '../lib/format'
import type { OrderSummary } from '../lib/types'

export default function Orders() {
  const { data, isLoading } = useQuery({
    queryKey: ['orders'],
    queryFn: () => api<{ items: OrderSummary[] }>('/orders'),
  })

  return (
    <Container className="py-8">
      <h1 className="mb-6 text-3xl font-bold">My orders</h1>
      {isLoading && <div className="h-[200px] animate-pulse bg-white/10" />}
      {data && data.items.length === 0 && (
        <div className="border border-white/20 p-10 text-center">
          <p className="text-lg font-bold">No orders yet</p>
          <Link to="/store" className="mt-4 inline-block bg-accent px-12 py-3 text-sm font-extrabold text-black hover:bg-accent-hover">
            Browse the store
          </Link>
        </div>
      )}
      <div className="space-y-3">
        {data?.items.map((o) => (
          <Link key={o.id} to={`/orders/${o.id}`} className="flex flex-wrap items-center justify-between gap-4 bg-night p-5 hover:bg-primary-dark">
            <div>
              <div className="font-bold">Order #{o.id}</div>
              <div className="text-xs text-muted">{new Date(o.created_at).toLocaleString('en-GB')}</div>
            </div>
            <div className="text-sm">{o.items} {o.items === 1 ? 'key' : 'keys'}</div>
            <div className="text-xl font-extrabold">{formatPrice(o.total)}</div>
          </Link>
        ))}
      </div>
    </Container>
  )
}