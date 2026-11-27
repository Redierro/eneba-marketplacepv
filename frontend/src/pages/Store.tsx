import { useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import { keepPreviousData, useQuery } from '@tanstack/react-query'
import { SlidersHorizontal } from 'lucide-react'
import Container from '../components/Container'
import ProductCard from '../components/ProductCard'
import FilterSidebar, { activeFilterCount } from '../components/store/FilterSidebar'
import Pagination from '../components/store/Pagination'
import { api } from '../lib/api'
import type { FilterOptions, ProductList } from '../lib/types'

const SORTS = [
  { value: 'popular', label: 'Popularity' },
  { value: 'newest', label: 'Newest' },
  { value: 'price_asc', label: 'Price: low to high' },
  { value: 'price_desc', label: 'Price: high to low' },
  { value: 'discount', label: 'Biggest discount' },
]

export default function Store() {
  const [params, setParams] = useSearchParams()
  const [filtersOpen, setFiltersOpen] = useState(false)

  const q = params.get('q') ?? ''
  const sort = params.get('sort') ?? (q ? 'relevance' : 'popular')
  const page = Math.max(1, Number(params.get('page')) || 1)
  const qs = params.toString()

  const { data: options } = useQuery({
    queryKey: ['filters'],
    queryFn: () => api<FilterOptions>('/filters'),
    staleTime: Infinity,
  })

  const { data, isLoading, isError, isFetching } = useQuery({
    queryKey: ['products', qs],
    queryFn: () => api<ProductList>('/products' + (qs ? `?${qs}` : '')),
    placeholderData: keepPreviousData,
  })

  const update = (changes: Record<string, string | null>, keepPage = false) => {
    const next = new URLSearchParams(params)
    for (const [k, v] of Object.entries(changes)) {
      if (v === null || v === '') next.delete(k)
      else next.set(k, v)
    }
    if (!keepPage) next.delete('page')
    setParams(next)
  }

  const goToPage = (p: number) => {
    update({ page: p === 1 ? null : String(p) }, true)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const sorts = q ? [{ value: 'relevance', label: 'Relevance' }, ...SORTS] : SORTS
  const filterCount = activeFilterCount(params)

  return (
    <Container className="py-8">
      <div className="mb-6 flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold">{q ? `Results for “${q}”` : 'Store'}</h1>
          {data && <p className="mt-1 text-sm text-muted">{data.total} products</p>}
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={() => setFiltersOpen((o) => !o)}
            className="flex items-center gap-2 border border-white px-4 py-2 text-sm font-bold lg:hidden"
          >
            <SlidersHorizontal size={16} />
            Filters{filterCount > 0 && ` (${filterCount})`}
          </button>
          <label className="flex items-center gap-2 text-sm">
            <span className="hidden sm:inline">Sort by</span>
            <select
              value={sort}
              onChange={(e) => update({ sort: e.target.value })}
              className="border border-white bg-primary-dark px-3 py-2 text-sm font-semibold outline-none"
            >
              {sorts.map((s) => (
                <option key={s.value} value={s.value}>
                  {s.label}
                </option>
              ))}
            </select>
          </label>
        </div>
      </div>

      <div className="flex flex-col gap-8 lg:flex-row lg:items-start">
        <div className={`${filtersOpen ? 'block' : 'hidden'} lg:block lg:w-[260px] lg:shrink-0`}>
          <FilterSidebar options={options} params={params} update={update} />
        </div>

        <div className="min-w-0 flex-1">
          {isError && <p>Could not load products.</p>}

          {isLoading && (
            <div className="grid grid-cols-[repeat(auto-fill,200px)] justify-center gap-5 sm:justify-between">
              {Array.from({ length: 8 }, (_, i) => (
                <div key={i} className="h-[420px] w-[200px] animate-pulse bg-white/10" />
              ))}
            </div>
          )}

          {data && data.items.length === 0 && (
            <div className="border border-white/20 p-10 text-center">
              <p className="text-lg font-bold">No products found</p>
              <p className="mt-1 text-sm text-muted">Try different keywords or remove some filters.</p>
            </div>
          )}

          {data && data.items.length > 0 && (
            <div
              className={`grid grid-cols-[repeat(auto-fill,200px)] justify-center gap-5 transition-opacity sm:justify-between ${
                isFetching ? 'opacity-60' : ''
              }`}
            >
              {data.items.map((p) => (
                <ProductCard key={p.id} p={p} />
              ))}
            </div>
          )}

          {data && <Pagination page={page} totalPages={data.total_pages} onChange={goToPage} />}
        </div>
      </div>
    </Container>
  )
}