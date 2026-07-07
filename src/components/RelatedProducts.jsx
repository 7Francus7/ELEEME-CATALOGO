import CompactProductCard from './CompactProductCard'

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
          Tambien te puede servir
        </h3>
        <p className="mt-1 text-sm text-[#6e6e73] dark:text-[#86868b]">
          Te mostramos productos de la misma categoria o alternativas con stock visible.
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
