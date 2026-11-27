import { Link } from 'react-router-dom'
import { formatPrice } from '../lib/format'
import type { ProductCard as Product } from '../lib/types'

export default function ProductCard({ p }: { p: Product }) {
  return (
    <Link
      to={`/product/${p.slug}`}
      className="flex w-[200px] shrink-0 flex-col border border-mint/60 bg-night transition-colors hover:border-mint"
    >
      <div className="relative aspect-[3/4] overflow-hidden bg-deep">
        {p.image_url && <img src={p.image_url} alt={p.name} loading="lazy" className="h-full w-full object-cover" />}
        <div className="absolute inset-x-0 bottom-0 bg-black/60 py-1 text-center text-xs font-semibold">{p.platform}</div>
      </div>
      <div className="flex flex-1 flex-col gap-1 p-4">
        <h3 className="line-clamp-2 min-h-[2.5rem] text-xs font-bold">{p.name}</h3>
        <div className="mt-2 text-xs">
          From{' '}
          {p.old_price && (
            <>
              <s className="font-bold">{formatPrice(p.old_price)}</s>{' '}
              <span className="font-bold text-lime">-{p.discount}%</span>
            </>
          )}
        </div>
        <div className="text-xl font-extrabold">{formatPrice(p.price)}</div>
        <div className="text-xs text-muted">
          {p.offers_count} {p.offers_count === 1 ? 'offer' : 'offers'}
        </div>
      </div>
    </Link>
  )
}