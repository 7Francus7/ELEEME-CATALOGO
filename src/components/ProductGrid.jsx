import ProductCard from './ProductCard'

export default function ProductGrid({
  products,
  onOpen,
  onAddToCart,
  searchQuery,
  selectedCategory,
  activeModel,
  showTitle,
  onClearSearch,
}) {
  if (products.length === 0) {
    const hasFilter = searchQuery || (selectedCategory && selectedCategory !== 'Todos')
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24 text-center animate-fade-in">
        <p className="text-5xl mb-4">🔍</p>
        <p className="text-[#1d1d1f] dark:text-white font-semibold text-lg mb-2">
          Sin resultados
        </p>
        <p className="text-sm text-[#6e6e73] dark:text-[#86868b] mb-6 max-w-xs mx-auto">
          {searchQuery
            ? <>No encontramos productos para <strong>"{searchQuery}"</strong>.</>
            : <>No hay productos en la categoría <strong>{selectedCategory}</strong>.</>}
        </p>
        {hasFilter && (
          <button
            onClick={onClearSearch}
            className="inline-flex items-center gap-2 bg-[#0071e3] hover:bg-[#0077ed] active:scale-95 text-white text-sm font-medium px-5 py-2.5 rounded-full transition-all duration-200"
          >
            Ver todos los productos
          </button>
        )}
      </div>
    )
  }

  return (
    <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-16">
      <div className="flex items-baseline justify-between gap-3 mb-5 sm:mb-6">
        {showTitle ? (
          <h2 className="text-[22px] sm:text-[28px] font-semibold tracking-tight text-[#1d1d1f] dark:text-white">
            Catálogo
          </h2>
        ) : <span />}
        <span className="text-[13px] font-medium text-[#86868b] whitespace-nowrap">
          {products.length} {products.length === 1 ? 'producto' : 'productos'}
        </span>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-5">
        {products.map((product, i) => (
          <div
            key={product.id}
            className={`animate-slide-up stagger-${Math.min(i + 1, 12)}`}
          >
            <ProductCard
              product={product}
              onOpen={onOpen}
              onAddToCart={onAddToCart}
              activeModel={activeModel}
            />
          </div>
        ))}
      </div>
    </section>
  )
}
