export class ApiError extends Error {
  status: number
  fields?: Record<string, string>

  constructor(status: number, message: string, fields?: Record<string, string>) {
    super(message)
    this.status = status
    this.fields = fields
  }
}

type Opts = { method?: string; body?: unknown; signal?: AbortSignal }

export async function api<T>(path: string, opts: Opts = {}): Promise<T> {
  const res = await fetch('/api' + path, {
    method: opts.method ?? 'GET',
    headers: opts.body ? { 'Content-Type': 'application/json' } : undefined,
    body: opts.body ? JSON.stringify(opts.body) : undefined,
    credentials: 'same-origin',
    signal: opts.signal,
  })
  const data = await res.json().catch(() => null)
    if (!res.ok) throw new ApiError(res.status, data?.error ?? (res.statusText || 'Request failed'), data?.fields)
  return data as T
}