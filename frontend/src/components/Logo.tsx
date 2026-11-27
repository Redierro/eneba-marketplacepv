import { Link } from 'react-router-dom'

export default function Logo() {
  return (
    <Link to="/" className="flex items-center gap-2 text-[40px] font-extrabold leading-none tracking-tight">
      <span className="inline-block h-9 w-9 rounded-full bg-linear-to-br from-accent via-crimson to-mint" />
      eneba
    </Link>
  )
}