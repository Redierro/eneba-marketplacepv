import type { InputHTMLAttributes } from 'react'

type Props = InputHTMLAttributes<HTMLInputElement> & { error?: string }

export default function TextField({ error, className = '', ...rest }: Props) {
  return (
    <div>
      <input
        {...rest}
        className={`h-14 w-full bg-primary-dark px-4 text-sm outline-none placeholder:text-muted focus:ring-1 focus:ring-white ${
          error ? 'ring-1 ring-red-300' : ''
        } ${className}`}
      />
      {error && <p className="mt-1 text-xs text-red-300">{error}</p>}
    </div>
  )
}