import { Link, useParams } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { Star } from 'lucide-react'
import Container from '../components/Container'
import { useCart } from '../context/CartContext'
import { api, ApiError } from '../lib/api'
import { formatPrice } from '../lib/format'
import type { Offer, ProductDetail } from '../lib/types'

function OfferRow({ offer, best }: { offer: Offer; best: boolean }) {
  const { add, qtyOf } = useCart()
  const inCart = qtyOf(offer.id)
  const discount = offer.old_price && offer.old_price > offer.price ? Math.round((1 - offer.price / offer.old_price) * 100) : 0

  return (
    <div className={`flex flex-wrap items-center gap-x-6 gap-y-3 border-b border-white/15 px-5 py-4 ${best ? 'bg-primary-dark' : ''}`}>
      <div className="min-w-[160px] flex-1">
        <div className="font-bold">{offer.seller.name}</div>
        <div className="mt-1 flex items-center gap-1 text-xs text-muted">
          <Star size={12} className="fill-accent text-accent" />
          {offer.seller.rating.toFixed(1)}
        </div>
      </div>
      <div className="w-28 text-sm font-bold uppercase text-mint">{offer.region}</div>
      <div className="w-24 text-sm text-muted">{offer.stock} in stock</div>
      <div className="w-32 text-right">
        {discount > 0 && (
          <div className="text-xs">
            <s>{formatPrice(offer.old_price!)}</s> <span className="font-bold text-lime">-{discount}%</span>
          </div>
        )}
        <div className="text-xl font-extrabold">{formatPrice(offer.price)}</div>
        {best && <div className="text-[10px] font-bold uppercase text-accent">Best price</div>}
      </div>
      <div className="w-full sm:w-40">
        <button
          onClick={() => add(offer.id)}
          disabled={inCart >= Math.min(10, offer.stock)}
          className="w-full bg-accent py-3 text-sm font-extrabold text-black transition-colors hover:bg-accent-hover disabled:opacity-50"
        >
          {inCart > 0 ? `In cart (${inCart}) +` : 'Add to cart'}
        </button>
      </div>
    </div>
  )
}

export default function Product() {
  const { slug } = useParams()
  const { data, isLoading, error } = useQuery({
    queryKey: ['product', slug],
    queryFn: () => api<ProductDetail>(`/products/${slug}`),
    retry: false,
  })

  if (isLoading) return <Container className="py-10"><div className="h-[400px] animate-pulse bg-white/10" /></Container>
  if (error || !data) {
    const notFound = error instanceof ApiError && error.status === 404
    return (
      <Container className="py-16 text-center">
        <h1 className="text-3xl font-bold">{notFound ? 'Product not found' : 'Something went wrong'}</h1>
        <Link to="/store" className="mt-6 inline-block border border-white px-10 py-3 text-sm font-bold hover:bg-white/10">
          Back to store
        </Link>
      </Container>
    )
  }

  const best = data.offers[0]
  const facts: [string, string | null][] = [
    ['Platform', data.platform],
    ['Genre', data.genre],
    ['Release date', data.release_date ? new Date(data.release_date).toLocaleDateString('en-GB') : null],
  ]

  return (
    <Container className="py-8">
      <div className="flex flex-col gap-8 md:flex-row">
        <div className="w-full shrink-0 md:w-[300px]">
          <div className="aspect-[3/4] border border-mint/60 bg-deep">
            {data.image_url && <img src={data.image_url} alt={data.name} className="h-full w-full object-cover" />}
          </div>
        </div>

        <div className="flex-1">
          <h1 className="text-3xl font-extrabold md:text-4xl">{data.name}</h1>
          <dl className="mt-5 grid grid-cols-[110px_1fr] gap-y-2 text-sm">
            {facts.map(([k, v]) => v && (
              <div key={k} className="contents">
                <dt className="text-muted">{k}</dt>
                <dd className="font-semibold">{v}</dd>
              </div>
            ))}
          </dl>
          <p className="mt-5 max-w-[640px] leading-relaxed text-muted">{data.description}</p>
          {best && (
            <div className="mt-6">
              <div className="text-xs">From</div>
              <div className="text-4xl font-extrabold">{formatPrice(best.price)}</div>
            </div>
          )}
        </div>
      </div>

      <h2 className="mb-4 mt-12 text-[28px] font-bold">
        Offers <span className="text-base font-semibold text-muted">({data.offers.length})</span>
      </h2>
      {data.offers.length === 0 ? (
        <p className="border border-white/20 p-8 text-center">No offers available right now.</p>
      ) : (
        <div className="border border-white/15 bg-night">
          {data.offers.map((o, i) => (
            <OfferRow key={o.id} offer={o} best={i === 0} />
          ))}
        </div>
      )}
    </Container>
  )
}