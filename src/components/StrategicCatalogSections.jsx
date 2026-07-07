import ProductCard from './ProductCard'

function StrategicSection({ section, activeModel, onOpen, onAddToCart }) {
  if (!section.products.length) return null

  return (
    <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-12">
      <div className="mb-5 flex items-end justify-between gap-3">
        <div>
          <h3 className="text-[22px] sm:text-[28px] font-semibold tracking-tight text-[#1d1d1f] dark:text-white">
            {section.title}
          </h3>
          <p className="mt-1 text-sm text-[#6e6e73] dark:text-[#86868b] max-w-2xl">
            {section.description}
          </p>
        </div>
        <span className="text-[13px] font-medium text-[#86868b] whitespace-nowrap">
          {section.products.length} {section.products.length === 1 ? 'producto' : 'productos'}
        </span>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-5">
        {section.products.map((product, index) => (
          <div
            key={product.id}
            className={`animate-slide-up stagger-${Math.min(index + 1, 12)}`}
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

export default function StrategicCatalogSections({
  sections,
  totalProducts,
  activeModel,
  onOpen,
  onAddToCart,
}) {
  if (!sections.length) return null

  return (
    <div>
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-8">
        <div className="flex items-baseline justify-between gap-3 mb-1">
          <h2 className="text-[22px] sm:text-[28px] font-semibold tracking-tight text-[#1d1d1f] dark:text-white">
            Catalogo
          </h2>
          <span className="text-[13px] font-medium text-[#86868b] whitespace-nowrap">
            {totalProducts} {totalProducts === 1 ? 'producto' : 'productos'}
          </span>
        </div>
        <p className="text-sm text-[#6e6e73] dark:text-[#86868b] max-w-2xl">
          Ordenado por tipo de compra para que primero aparezca lo esencial y despues los complementos.
        </p>
      </section>

      {sections.map((section) => (
        <StrategicSection
          key={section.key}
          section={section}
          activeModel={activeModel}
          onOpen={onOpen}
          onAddToCart={onAddToCart}
        />
      ))}
    </div>
  )
}
