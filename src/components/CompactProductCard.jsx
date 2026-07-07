import { formatPrice, hasStock, productHasAnyStock, productImages, savingsAmount, usesModels } from '../data/products'
import CatalogImage from './CatalogImage'

export default function CompactProductCard({
  product,
  activeModel,
  onOpen,
  onAddToCart,
  mode = 'smart',
}) {
  const needsModel = usesModels(product)
  const canAddDirectly = !needsModel || !!activeModel
  const exactStock = canAddDirectly ? hasStock(product, activeModel) : null
  const hasAnyStock = productHasAnyStock(product)
  const image = productImages(product)[0]
  const savings = savingsAmount(product)

  const actionLabel =
    mode === 'open'
      ? 'Ver producto'
      : !canAddDirectly
        ? 'Ver opciones'
        : exactStock
          ? 'Agregar'
          : 'Sin stock'

  const isDisabled = mode !== 'open' && canAddDirectly && !exactStock

  const handleAction = (event) => {
    event.stopPropagation()

    if (mode === 'open' || !canAddDirectly) {
      onOpen(product)
      return
    }

    if (!exactStock) return
    onAddToCart(product, activeModel)
  }

  return (
    <article
      onClick={() => onOpen(product)}
      className="group w-[230px] sm:w-[250px] flex-shrink-0 rounded-[22px] bg-white dark:bg-[#1c1c1e] border border-black/[0.05] dark:border-white/[0.08] overflow-hidden cursor-pointer"
    >
      <div className="aspect-[4/3] bg-[#fbfbfd] dark:bg-[#2c2c2e] overflow-hidden">
        <CatalogImage
          src={image}
          alt={product.nombre}
          fallbackText={product.nombre}
          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
        />
      </div>

      <div className="p-4">
        <div className="flex items-start justify-between gap-2">
          <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-[#86868b]">
            {product.categoria}
          </p>
          <span
            className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${
              hasAnyStock
                ? 'bg-green-100 text-green-700 dark:bg-green-500/15 dark:text-green-400'
                : 'bg-red-100 text-red-600 dark:bg-red-500/15 dark:text-red-400'
            }`}
          >
            {hasAnyStock ? 'Disponible' : 'Agotado'}
          </span>
        </div>

        <h3 className="mt-2 text-[15px] font-semibold leading-[1.3] tracking-tight text-[#1d1d1f] dark:text-white line-clamp-2">
          {product.nombre}
        </h3>

        <div className="mt-3 flex items-end justify-between gap-3">
          <div>
            {typeof product.precio === 'number' && (
              <p className="text-sm font-semibold text-[#1d1d1f] dark:text-white">
                {formatPrice(product.precio)}
              </p>
            )}
            {product.precio_original && product.precio_original > product.precio && (
              <>
                <p className="text-[11px] text-[#86868b] line-through">
                  {formatPrice(product.precio_original)}
                </p>
                <p className="text-[11px] font-semibold text-green-600 dark:text-green-400">
                  Ahorras {formatPrice(savings)}
                </p>
              </>
            )}
          </div>

          <button
            type="button"
            onClick={handleAction}
            disabled={isDisabled}
            className={`rounded-full px-3 py-2 text-xs font-semibold transition-colors ${
              isDisabled
                ? 'bg-[#d2d2d7] dark:bg-white/10 text-white cursor-not-allowed'
                : 'bg-[#0071e3] hover:bg-[#0077ed] text-white'
            }`}
          >
            {actionLabel}
          </button>
        </div>
      </div>
    </article>
  )
}
