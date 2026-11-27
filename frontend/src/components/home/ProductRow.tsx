import { useRef } from 'react'
import { Link } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import { api } from '../../lib/api'
import type { ProductCard as Product } from '../../lib/types'
import Container from '../Container'
import ProductCard from '../ProductCard'

type Data = { items: Product[]; link: string }

export default function ProductRow({ title, endpoint }: { title: string; endpoint: string }) {
  const ref = useRef<HTMLDivElement>(null)
  const { data, isLoading, isError } = useQuery({ queryKey: ['home', endpoint], queryFn: () => api<Data>(endpoint) })
  const scroll = (dir: 1 | -1) => ref.current?.scrollBy({ left: dir * 840, behavior: 'smooth' })

  if (isError || (data && data.items.length === 0)) return null

  const arrow = 'absolute top-1/2 z-10 hidden h-10 w-10 -translate-y-1/2 items-center justify-center bg-black/60 hover:bg-black md:flex'

  return (
    <Container>
      <h2 className="mb-6 text-[28px] font-bold">{title}</h2>
      <div className="relative">
        <div ref={ref} className="no-scrollbar flex gap-5 overflow-x-auto scroll-smooth">
          {isLoading
            ? Array.from({ length: 6 }, (_, i) => <div key={i} className="h-[420px] w-[200px] shrink-0 animate-pulse bg-white/10" />)
            : data!.items.map((p) => <ProductCard key={p.id} p={p} />)}
        </div>
        <button onClick={() => scroll(-1)} className={`${arrow} left-0`} aria-label="Previous">
          <ChevronLeft />
        </button>
        <button onClick={() => scroll(1)} className={`${arrow} right-0`} aria-label="Next">
          <ChevronRight />
        </button>
      </div>
      {data?.link && (
        <div className="mt-6 flex justify-center">
          <Link to={data.link} className="border border-white px-14 py-3 text-sm font-bold hover:bg-white/10">
            Show all
          </Link>
        </div>
      )}
    </Container>
  )
}