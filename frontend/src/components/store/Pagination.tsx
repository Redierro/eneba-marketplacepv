type Props = { page: number; totalPages: number; onChange: (p: number) => void }

export default function Pagination({ page, totalPages, onChange }: Props) {
  if (totalPages <= 1) return null

  const pages: (number | '…')[] = []
  const start = Math.max(1, page - 2)
  const end = Math.min(totalPages, page + 2)
  if (start > 1) pages.push(1)
  if (start > 2) pages.push('…')
  for (let i = start; i <= end; i++) pages.push(i)
  if (end < totalPages - 1) pages.push('…')
  if (end < totalPages) pages.push(totalPages)

  const btn = 'min-w-10 border border-white/60 px-3 py-2 text-sm font-bold hover:bg-white/10 disabled:opacity-40 disabled:hover:bg-transparent'

  return (
    <nav className="mt-10 flex flex-wrap items-center justify-center gap-2" aria-label="Pagination">
      <button className={btn} disabled={page === 1} onClick={() => onChange(page - 1)}>
        Prev
      </button>
      {pages.map((p, i) =>
        p === '…' ? (
          <span key={`e${i}`} className="px-2">…</span>
        ) : (
          <button key={p} onClick={() => onChange(p)} className={`${btn} ${p === page ? 'border-accent bg-accent text-black hover:bg-accent' : ''}`}>
            {p}
          </button>
        ),
      )}
      <button className={btn} disabled={page === totalPages} onClick={() => onChange(page + 1)}>
        Next
      </button>
    </nav>
  )
}