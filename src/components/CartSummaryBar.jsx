import { formatPrice } from '../data/products'
import { ChevronRightIcon, ShoppingBagIcon } from './Icons'

export default function CartSummaryBar({ totalItems, totalPrice, onOpen }) {
  if (!totalItems) return null

  return (
    <div className="fixed inset-x-0 bottom-0 z-30 px-4 pb-[calc(1rem+env(safe-area-inset-bottom))] sm:px-6">
      <button
        type="button"
        onClick={onOpen}
        className="max-w-4xl mx-auto w-full rounded-2xl bg-[#1d1d1f] dark:bg-white text-white dark:text-black px-4 py-3.5 shadow-[0_20px_40px_rgba(0,0,0,0.18)] flex items-center justify-between gap-4 animate-slide-up"
      >
        <div className="flex items-center gap-3 min-w-0">
          <span className="flex h-11 w-11 items-center justify-center rounded-full bg-white/10 dark:bg-black/10">
            <ShoppingBagIcon className="w-5 h-5" />
          </span>
          <div className="text-left min-w-0">
            <p className="text-sm font-semibold">
              {totalItems} {totalItems === 1 ? 'item en tu pedido' : 'items en tu pedido'}
            </p>
            <p className="text-xs text-white/70 dark:text-black/70">
              {typeof totalPrice === 'number' ? formatPrice(totalPrice) : 'Total a confirmar'}
            </p>
          </div>
        </div>

        <span className="inline-flex items-center gap-1 text-sm font-semibold whitespace-nowrap">
          Ver pedido
          <ChevronRightIcon className="w-4 h-4" />
        </span>
      </button>
    </div>
  )
}
