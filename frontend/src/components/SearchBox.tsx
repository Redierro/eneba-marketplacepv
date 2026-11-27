import { useEffect, useRef, useState, type FormEvent } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Search } from 'lucide-react'
import { api } from '../lib/api'
import { formatPrice } from '../lib/format'
import type { ProductCard } from '../lib/types'

export default function SearchBox() {
  const [q, setQ] = useState('')
  const [items, setItems] = useState<ProductCard[]>([])
  const [open, setOpen] = useState(false)
  const box = useRef<HTMLDivElement>(null)
  const navigate = useNavigate()

  useEffect(() => {
    const term = q.trim()
    if (term.length < 2) {
      setItems([])
      return
    }
    const ctrl = new AbortController()
    const t = setTimeout(() => {
      api<{ items: ProductCard[] }>(`/search/suggest?q=${encodeURIComponent(term)}`, { signal: ctrl.signal })
        .then((r) => setItems(r.items))
        .catch(() => {})
    }, 250)
    return () => {
      clearTimeout(t)
      ctrl.abort()
    }
  }, [q])

  useEffect(() => {
    const onDown = (e: MouseEvent) => {
      if (!box.current?.contains(e.target as Node)) setOpen(false)
    }
    document.addEventListener('mousedown', onDown)
    return () => document.removeEventListener('mousedown', onDown)
  }, [])

  const submit = (e: FormEvent) => {
    e.preventDefault()
    const term = q.trim()
    if (!term) return
    setOpen(false)
    navigate(`/store?q=${encodeURIComponent(term)}`)
  }

  return (
    <div ref={box} className="relative w-full">
      <form onSubmit={submit} className="flex h-[57px] items-center gap-3 border border-white px-4">
        <Search size={24} className="shrink-0" />
        <input
          value={q}
          onChange={(e) => {
            setQ(e.target.value)
            setOpen(true)
          }}
          onFocus={() => setOpen(true)}
          placeholder="Search for games, top-ups and more"
          className="w-full bg-transparent text-lg font-semibold text-white outline-none placeholder:text-white/70"
        />
      </form>

      {open && q.trim().length >= 2 && (
        <div className="absolute left-0 right-0 top-full z-50 border border-white/30 bg-primary-dark shadow-xl">
          {items.length === 0 && <div className="px-4 py-3 text-muted">No matches</div>}
          {items.map((p) => (
            <Link
              key={p.id}
              to={`/product/${p.slug}`}
              onClick={() => setOpen(false)}
              className="flex items-center gap-3 px-4 py-2 hover:bg-white/10"
            >
              {p.image_url && <img src={p.image_url} alt="" className="h-[53px] w-10 object-cover" />}
              <span className="flex-1 text-sm font-semibold">{p.name}</span>
              <span className="text-sm font-bold">{formatPrice(p.price)}</span>
            </Link>
          ))}
          {items.length > 0 && (
            <Link
              to={`/store?q=${encodeURIComponent(q.trim())}`}
              onClick={() => setOpen(false)}
              className="block border-t border-white/20 px-4 py-3 text-center text-sm font-bold hover:bg-white/10"
            >
              See all results
            </Link>
          )}
        </div>
      )}
    </div>
  )
}