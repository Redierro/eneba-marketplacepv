import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { api } from '../../lib/api'
import type { Banner } from '../../lib/types'
import Container from '../Container'

const GRADIENTS = [
  'from-crimson/70 via-night to-primary',
  'from-primary-dark via-primary to-mint/40',
  'from-accent/40 via-deep to-night',
]

export default function BannerCarousel({ endpoint }: { endpoint: string }) {
  const { data } = useQuery({ queryKey: ['home', endpoint], queryFn: () => api<{ items: Banner[] }>(endpoint) })
  const [idx, setIdx] = useState(0)
  const items = data?.items ?? []

  useEffect(() => {
    if (items.length < 2) return
    const t = setInterval(() => setIdx((i) => (i + 1) % items.length), 6000)
    return () => clearInterval(t)
  }, [items.length])

  if (items.length === 0) return <div className="h-[380px] animate-pulse bg-white/10" />

  const b = items[idx % items.length]
  return (
    <div
      className={`relative h-[380px] bg-linear-to-r bg-cover bg-center ${GRADIENTS[idx % GRADIENTS.length]}`}
      style={b.image_url ? { backgroundImage: `url(${b.image_url})` } : undefined}
    >
      <Container className="flex h-full flex-col justify-center gap-4">
        <h1 className="max-w-[640px] text-4xl font-extrabold leading-tight md:text-6xl">{b.title}</h1>
        {b.subtitle && <p className="max-w-[520px] text-lg text-muted">{b.subtitle}</p>}
        {b.link_url && (
          <Link
            to={b.link_url}
            className="w-fit bg-accent px-12 py-3 text-sm font-extrabold uppercase text-black transition-colors hover:bg-accent-hover"
          >
            Shop now
          </Link>
        )}
      </Container>
      <div className="absolute bottom-4 left-1/2 flex -translate-x-1/2 gap-2">
        {items.map((_, i) => (
          <button
            key={i}
            onClick={() => setIdx(i)}
            aria-label={`Slide ${i + 1}`}
            className={`h-2 w-8 ${i === idx % items.length ? 'bg-white' : 'bg-white/40'}`}
          />
        ))}
      </div>
    </div>
  )
}