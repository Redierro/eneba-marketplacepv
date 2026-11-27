import type { HomeBlockDef } from '../../lib/types'
import BannerCarousel from './BannerCarousel'
import CategoryGrid from './CategoryGrid'
import ProductRow from './ProductRow'

export default function HomeBlock({ block }: { block: HomeBlockDef }) {
  switch (block.type) {
    case 'banner':
      return <BannerCarousel endpoint={block.endpoint} />
    case 'product_row':
      return <ProductRow title={block.title} endpoint={block.endpoint} />
    case 'category_grid':
      return <CategoryGrid title={block.title} endpoint={block.endpoint} />
    default:
      return null
  }
}