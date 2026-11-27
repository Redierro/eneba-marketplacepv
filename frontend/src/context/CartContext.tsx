import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from 'react'

export type CartItem = { offer_id: number; quantity: number }
export const MAX_QTY = 10
const KEY = 'eneba_cart'

function load(): CartItem[] {
  try {
    const v = JSON.parse(localStorage.getItem(KEY) ?? '[]')
    return Array.isArray(v)
      ? v.filter((i) => Number.isInteger(i?.offer_id) && Number.isInteger(i?.quantity) && i.quantity > 0)
      : []
  } catch {
    return []
  }
}

type Ctx = {
  items: CartItem[]
  count: number
  qtyOf: (offerId: number) => number
  add: (offerId: number, qty?: number) => void
  setQty: (offerId: number, qty: number) => void
  remove: (offerId: number) => void
  clear: () => void
}

const CartContext = createContext<Ctx | null>(null)

export function CartProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<CartItem[]>(load)

  useEffect(() => {
    try {
      localStorage.setItem(KEY, JSON.stringify(items))
    } catch {
      /* storage unavailable */
    }
  }, [items])

  const add = useCallback((offerId: number, qty = 1) => {
    setItems((prev) => {
      const found = prev.find((i) => i.offer_id === offerId)
      if (found) return prev.map((i) => (i.offer_id === offerId ? { ...i, quantity: Math.min(MAX_QTY, i.quantity + qty) } : i))
      return [...prev, { offer_id: offerId, quantity: Math.min(MAX_QTY, qty) }]
    })
  }, [])

  const setQty = useCallback((offerId: number, qty: number) => {
    setItems((prev) =>
      qty <= 0
        ? prev.filter((i) => i.offer_id !== offerId)
        : prev.map((i) => (i.offer_id === offerId ? { ...i, quantity: Math.min(MAX_QTY, qty) } : i)),
    )
  }, [])

  const remove = useCallback((offerId: number) => setItems((prev) => prev.filter((i) => i.offer_id !== offerId)), [])
  const clear = useCallback(() => setItems([]), [])

  const value = useMemo<Ctx>(
    () => ({
      items,
      count: items.reduce((n, i) => n + i.quantity, 0),
      qtyOf: (id) => items.find((i) => i.offer_id === id)?.quantity ?? 0,
      add,
      setQty,
      remove,
      clear,
    }),
    [items, add, setQty, remove, clear],
  )

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>
}

export function useCart() {
  const c = useContext(CartContext)
  if (!c) throw new Error('useCart must be used inside CartProvider')
  return c
}