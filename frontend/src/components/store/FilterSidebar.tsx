import { useState, type FormEvent } from 'react'
import type { FilterOptions, Option } from '../../lib/types'

type Props = {
  options?: FilterOptions
  params: URLSearchParams
  update: (changes: Record<string, string | null>) => void
}

const FILTER_KEYS = ['platform', 'region', 'genre', 'price_min', 'price_max', 'deals']

export function activeFilterCount(params: URLSearchParams) {
  return FILTER_KEYS.filter((k) => params.get(k)).length
}

function CheckGroup({ title, field, items, params, update }: { title: string; field: string; items: Option[]; params: URLSearchParams; update: Props['update'] }) {
  const selected = (params.get(field) ?? '').split(',').filter(Boolean)
  const toggle = (slug: string) => {
    const next = selected.includes(slug) ? selected.filter((s) => s !== slug) : [...selected, slug]
    update({ [field]: next.join(',') || null })
  }
  return (
    <div className="border-b border-white/15 py-4">
      <h3 className="mb-3 text-sm font-bold">{title}</h3>
      <ul className="space-y-2">
        {items.map((o) => (
          <li key={o.slug}>
            <label className="flex cursor-pointer items-center gap-3 text-sm">
              <input
                type="checkbox"
                checked={selected.includes(o.slug)}
                onChange={() => toggle(o.slug)}
                className="h-4 w-4 accent-accent"
              />
              {o.name}
            </label>
          </li>
        ))}
      </ul>
    </div>
  )
}

function PriceFilter({ options, params, update }: Props) {
  const [min, setMin] = useState(params.get('price_min') ?? '')
  const [max, setMax] = useState(params.get('price_max') ?? '')
  const submit = (e: FormEvent) => {
    e.preventDefault()
    update({ price_min: min || null, price_max: max || null })
  }
  const input = 'w-full border border-white/50 bg-transparent px-2 py-2 text-sm outline-none focus:border-white'
  return (
    <form onSubmit={submit} className="border-b border-white/15 py-4">
      <h3 className="mb-3 text-sm font-bold">Price (EUR)</h3>
      <div className="flex items-center gap-2">
        <input type="number" min={0} value={min} onChange={(e) => setMin(e.target.value)} placeholder={String(options?.price.min ?? 0)} className={input} />
        <span>–</span>
        <input type="number" min={0} value={max} onChange={(e) => setMax(e.target.value)} placeholder={String(options?.price.max ?? '')} className={input} />
      </div>
      <button type="submit" className="mt-3 w-full border border-white py-2 text-sm font-bold hover:bg-white/10">
        Apply
      </button>
    </form>
  )
}

export default function FilterSidebar({ options, params, update }: Props) {
  const clear = () => update(Object.fromEntries(FILTER_KEYS.map((k) => [k, null])))
  const price = `${params.get('price_min') ?? ''}-${params.get('price_max') ?? ''}`

  return (
    <aside className="bg-night px-5 py-2">
      <div className="flex items-center justify-between border-b border-white/15 py-4">
        <h2 className="font-bold">Filters</h2>
        {activeFilterCount(params) > 0 && (
          <button onClick={clear} className="text-sm text-accent hover:underline">
            Clear all
          </button>
        )}
      </div>

      <label className="flex cursor-pointer items-center gap-3 border-b border-white/15 py-4 text-sm font-semibold">
        <input
          type="checkbox"
          checked={params.get('deals') === '1'}
          onChange={(e) => update({ deals: e.target.checked ? '1' : null })}
          className="h-4 w-4 accent-accent"
        />
        On sale only
      </label>

      {options && (
        <>
          <CheckGroup title="Platform" field="platform" items={options.platforms} params={params} update={update} />
          <CheckGroup title="Region" field="region" items={options.regions} params={params} update={update} />
          <CheckGroup title="Genre" field="genre" items={options.genres} params={params} update={update} />
          <PriceFilter key={price} options={options} params={params} update={update} />
        </>
      )}
    </aside>
  )
}