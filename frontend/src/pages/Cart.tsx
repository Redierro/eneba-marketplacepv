import { useEffect } from 'react'
import { Link } from 'react-router-dom'
import { keepPreviousData, useQuery } from '@tanstack/react-query'
import { Trash2 } from 'lucide-react'
import Container from '../components/Container'
import { MAX_QTY, useCart } from '../context/CartContext'
import { api } from '../lib/api'
import { formatPrice } from '../lib/format'
import type { CartQuote } from '../lib/types'

export default function Cart() {
  const { items, setQty, remove } = useCart()
  const key = JSON.stringify(items)

  const { data, isFetching } = useQuery({
    queryKey: ['cart', key],
    queryFn: () => api<CartQuote>('/cart/quote', { method: 'POST', body: { items } }),
    enabled: items.length > 0,
    placeholderData: keepPreviousData,
  })

  // drop offers that no longer exist
  useEffect(() => {
    if (!data || isFetching) return
    const present = new Set(data.items.map((l) => l.offer_id))
    items.forEach((i) => !present.has(i.offer_id) && remove(i.offer_id))
  }, [data, isFetching, items, remove])

  if (items.length === 0) {
    return (
      <Container className="py-16 text-center">
        <h1 className="text-3xl font-bold">Your cart is empty</h1>
        <Link to="/store" className="mt-6 inline-block bg-accent px-12 py-3 text-sm font-extrabold text-black hover:bg-accent-hover">
          Browse the store
        </Link>
      </Container>
    )
  }

  const hasUnavailable = data?.items.some((l) => !l.available)
  const qtyBtn = 'h-8 w-8 border border-white/50 font-bold hover:bg-white/10 disabled:opacity-40 disabled:hover:bg-transparent'

  return (
    <Container className="py-8">
      <h1 className="mb-6 text-3xl font-bold">My cart</h1>
      <div className="flex flex-col gap-8 lg:flex-row lg:items-start">
        <div className={`flex-1 space-y-4 transition-opacity ${isFetching ? 'opacity-60' : ''}`}>
          {data?.items.map((l) => (
            <div key={l.offer_id} className="flex gap-4 bg-night p-4">
              <Link to={`/product/${l.slug}`} className="h-[110px] w-[82px] shrink-0 bg-deep">
                {l.image_url && <img src={l.image_url} alt="" className="h-full w-full object-cover" />}
              </Link>
              <div className="flex min-w-0 flex-1 flex-col gap-1">
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <div className="text-xs">
                      Sold by <b>{l.seller}</b>
                    </div>
                    <Link to={`/product/${l.slug}`} className="font-bold hover:underline">
                      {l.name}
                    </Link>
                  </div>
                  <button onClick={() => remove(l.offer_id)} aria-label="Remove" className="p-1 hover:text-crimson">
                    <Trash2 size={18} />
                  </button>
                </div>
                <div className="text-sm text-muted">
                  Digital product · {l.region}
                </div>
                {!l.available && <div className="text-sm font-bold text-crimson">Out of stock</div>}
                <div className="mt-auto flex items-center justify-between pt-2">
                  <div className="flex items-center gap-3">
                    <button className={qtyBtn} onClick={() => setQty(l.offer_id, l.quantity - 1)} disabled={!l.available}>
                      −
                    </button>
                    <span className="w-6 text-center font-bold">{l.quantity}</span>
                    <button
                      className={qtyBtn}
                      onClick={() => setQty(l.offer_id, l.quantity + 1)}
                      disabled={l.quantity >= Math.min(MAX_QTY, l.stock)}
                    >
                      +
                    </button>
                  </div>
                  <div className="text-lg font-extrabold">{formatPrice(l.price * l.quantity)}</div>
                </div>
              </div>
            </div>
          ))}
        </div>

        <aside className="bg-night p-6 lg:w-[360px] lg:shrink-0">
          <h2 className="text-xl font-bold">Summary</h2>
          <div className="mt-4 flex justify-between text-sm">
            <span>{data?.count ?? 0} product(s)</span>
            <span>{formatPrice(data?.total ?? 0)}</span>
          </div>
          <div className="mt-4 flex items-end justify-between border-t border-white/15 pt-4">
            <span className="font-bold">Total:</span>
            <span className="text-3xl font-extrabold">{formatPrice(data?.total ?? 0)}</span>
          </div>
          {hasUnavailable && <p className="mt-3 text-xs text-crimson">Out-of-stock items will be skipped at checkout.</p>}
          <Link
            to="/checkout"
            className={`mt-5 block bg-accent py-3 text-center text-sm font-extrabold text-black hover:bg-accent-hover ${
              !data || data.count === 0 ? 'pointer-events-none opacity-50' : ''
            }`}
          >
            Proceed to checkout
          </Link>
        </aside>
      </div>
    </Container>
  )
}