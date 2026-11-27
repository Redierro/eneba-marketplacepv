import { Link } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { Gamepad2 } from 'lucide-react'
import { api } from '../../lib/api'
import type { Category } from '../../lib/types'
import Container from '../Container'

export default function CategoryGrid({ title, endpoint }: { title: string; endpoint: string }) {
  const { data } = useQuery({ queryKey: ['home', endpoint], queryFn: () => api<{ items: Category[] }>(endpoint) })
  if (!data || data.items.length === 0) return null

  return (
    <Container>
      <h2 className="mb-6 text-[28px] font-bold">{title}</h2>
      <div className="grid grid-cols-2 gap-5 sm:grid-cols-4 lg:grid-cols-7">
        {data.items.map((c) => (
          <Link
            key={c.slug}
            to={c.link}
            className="flex h-[140px] flex-col items-center justify-between bg-primary p-4 text-sm font-bold shadow-lg transition-colors hover:bg-primary-dark"
          >
            <span>{c.count}</span>
            <Gamepad2 size={34} />
            <span>{c.name}</span>
          </Link>
        ))}
      </div>
    </Container>
  )
}