import { useQuery } from '@tanstack/react-query'
import HomeBlock from '../components/home/HomeBlock'
import { api } from '../lib/api'
import type { HomeBlockDef } from '../lib/types'

export default function Home() {
  const { data, isError } = useQuery({
    queryKey: ['home', 'layout'],
    queryFn: () => api<{ blocks: HomeBlockDef[] }>('/home/layout'),
  })

  if (isError) return <p className="p-10 text-center">Could not load the homepage.</p>

  return (
    <div>
      {data?.blocks.map((b, i) => (
        <section key={b.id} className={b.type === 'banner' ? '' : `py-10 ${i % 2 === 0 ? 'bg-primary' : 'bg-deep'}`}>
          <HomeBlock block={b} />
        </section>
      ))}
    </div>
  )
}