export type User = { id: number; email: string; name: string }

export type HomeBlockDef = { id: number; type: string; title: string; endpoint: string }
export type Banner = { id: number; title: string; subtitle: string | null; image_url: string | null; link_url: string | null }
export type Category = { name: string; slug: string; count: number; link: string }
export type ProductCard = {
  id: number
  slug: string
  name: string
  image_url: string | null
  platform: string
  platform_slug: string
  genre: string | null
  price: number
  old_price: number | null
  discount: number
  offers_count: number
}
export type ProductList = { items: ProductCard[]; page: number; per_page: number; total: number; total_pages: number }
export type Option = { name: string; slug: string }
export type FilterOptions = {
  platforms: Option[]
  regions: Option[]
  genres: Option[]
  price: { min: number; max: number }
}
export type Offer = {
  id: number
  price: number
  old_price: number | null
  seller: { id: number; name: string; rating: number }
  region: string
  region_slug: string
  stock: number
}
export type ProductDetail = {
  id: number
  slug: string
  name: string
  description: string
  image_url: string | null
  release_date: string | null
  platform: string
  platform_slug: string
  genre: string | null
  offers: Offer[]
}
export type CartLine = {
  offer_id: number
  slug: string
  name: string
  image_url: string | null
  platform: string
  seller: string
  region: string
  price: number
  old_price: number | null
  stock: number
  quantity: number
  available: boolean
}
export type CartQuote = { items: CartLine[]; count: number; total: number }
export type OrderSummary = { id: number; total: number; status: string; created_at: string; items: number }
export type OrderItem = {
  name: string
  slug: string
  image_url: string | null
  platform: string
  seller: string
  price: number
  key: string
}
export type OrderDetail = { id: number; total: number; status: string; created_at: string; items: OrderItem[] }