import { formatPrice } from '../data/products'
import { describePackItems, estimatedPackPrice, packHasStock, packSavingsAmount } from '../utils/packSelectors'

export default function PackCard({ pack, products, onAddPack }) {
  const available = packHasStock(pack, products)
  const items = describePackItems(pack, products)
  const estimatedPrice = estimatedPackPrice(pack, products)
  const displayPrice = Number.isFinite(pack.price) ? pack.price : estimatedPrice
  const savings = packSavingsAmount(pack, products)

  return (
    <article className="w-[260px] sm:w-[290px] flex-shrink-0 rounded-[24px] bg-white dark:bg-[#1c1c1e] border border-black/[0.05] dark:border-white/[0.08] p-5">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-[#86868b]">
            Pack
          </p>
          <h3 className="mt-2 text-[18px] font-semibold leading-[1.2] tracking-tight text-[#1d1d1f] dark:text-white">
            {pack.name}
          </h3>
        </div>
        <span
          className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${
            available
              ? 'bg-green-100 text-green-700 dark:bg-green-500/15 dark:text-green-400'
              : 'bg-red-100 text-red-600 dark:bg-red-500/15 dark:text-red-400'
          }`}
        >
          {available ? 'Disponible' : 'Sin stock'}
        </span>
      </div>

      <p className="mt-3 text-sm leading-relaxed text-[#6e6e73] dark:text-[#86868b]">
        {pack.description}
      </p>

      <div className="mt-4 space-y-1">
        {items.map((item) => (
          <p key={item} className="text-sm text-[#1d1d1f] dark:text-white">
            - {item}
          </p>
        ))}
      </div>

      <div className="mt-5 flex items-end justify-between gap-3">
        <div>
          <p className="text-base font-semibold text-[#1d1d1f] dark:text-white">
            {typeof displayPrice === 'number' ? formatPrice(displayPrice) : 'Precio a confirmar'}
          </p>
          {Number.isFinite(pack.price) && Number.isFinite(estimatedPrice) && pack.price < estimatedPrice && (
            <p className="text-[11px] text-[#86868b] line-through">
              {formatPrice(estimatedPrice)}
            </p>
          )}
          {!Number.isFinite(pack.price) && Number.isFinite(estimatedPrice) && (
            <p className="text-[11px] text-[#86868b]">
              Total estimado
            </p>
          )}
          {savings > 0 && (
            <p className="mt-1 text-[11px] font-semibold text-green-600 dark:text-green-400">
              Ahorras {formatPrice(savings)}
            </p>
          )}
        </div>

        <button
          type="button"
          onClick={() => onAddPack(pack)}
          disabled={!available}
          className={`rounded-full px-4 py-2 text-xs font-semibold transition-colors ${
            available
              ? 'bg-[#0071e3] hover:bg-[#0077ed] text-white'
              : 'bg-[#d2d2d7] dark:bg-white/10 text-white cursor-not-allowed'
          }`}
        >
          Agregar pack
        </button>
      </div>
    </article>
  )
}
