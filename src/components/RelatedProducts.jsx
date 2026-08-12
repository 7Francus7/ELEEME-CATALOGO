import CompactProductCard from './CompactProductCard'
import ScrollableRow from './ScrollableRow'

export default function RelatedProducts({
  products,
  activeModel,
  onOpenProduct,
  onAddToCart,
}) {
  if (!products.length) return null

  return (
    <section className="mt-8">
      <div className="mb-4">
        <h3 className="text-[18px] font-semibold tracking-tight text-[#1d1d1f] dark:text-white">
          También te puede servir
        </h3>
        <p className="mt-1 text-sm text-[#6e6e73] dark:text-[#86868b]">
          Te mostramos productos de la misma categoría o alternativas con stock visible.
        </p>
      </div>

      <ScrollableRow
        ariaLabel="Productos relacionados"
        rowClassName="flex gap-3 pb-2"
        // Centro del recuadro de la foto de las cards (aspect 4/3 sobre 230px).
        arrowPosition="top-[86px] -translate-y-1/2"
      >
        {products.map((product) => (
          <CompactProductCard
            key={product.id}
            product={product}
            activeModel={activeModel}
            onOpen={onOpenProduct}
            onAddToCart={onAddToCart}
          />
        ))}
      </ScrollableRow>
    </section>
  )
}
