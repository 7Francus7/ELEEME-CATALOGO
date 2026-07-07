import CompactProductCard from './CompactProductCard'
import { getCollectionDefinition } from '../utils/catalogSelectors'

function CuratedRow({ title, description, products, activeModel, onOpenProduct, onAddToCart }) {
  if (!products.length) return null

  return (
    <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-10">
      <div className="mb-4">
        <h2 className="text-[22px] sm:text-[28px] font-semibold tracking-tight text-[#1d1d1f] dark:text-white">
          {title}
        </h2>
        <p className="mt-1 text-sm text-[#6e6e73] dark:text-[#86868b]">
          {description}
        </p>
      </div>

      <div className="flex gap-3 overflow-x-auto scrollbar-hide pb-2">
        {products.map((product) => (
          <CompactProductCard
            key={product.id}
            product={product}
            activeModel={activeModel}
            onOpen={onOpenProduct}
            onAddToCart={onAddToCart}
          />
        ))}
      </div>
    </section>
  )
}

export default function CuratedSections({
  collections,
  activeModel,
  onOpenProduct,
  onAddToCart,
}) {
  const sections = [
    { key: 'promos', products: collections.promos },
    { key: 'bestSellers', products: collections.bestSellers },
    { key: 'latest', products: collections.latest },
  ]

  return (
    <>
      {sections.map(({ key, products }) => {
        const definition = getCollectionDefinition(key)
        return (
          <CuratedRow
            key={key}
            title={definition.title}
            description={definition.description}
            products={products}
            activeModel={activeModel}
            onOpenProduct={onOpenProduct}
            onAddToCart={onAddToCart}
          />
        )
      })}
    </>
  )
}
