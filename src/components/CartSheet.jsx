import { formatPrice } from '../data/products'
import { MinusIcon, PlusIcon, ShoppingBagIcon, TrashIcon, WhatsAppIcon, XIcon } from './Icons'

export default function CartSheet({
  isOpen,
  items,
  totalItems,
  totalPrice,
  whatsappUrl,
  onClose,
  onIncrement,
  onDecrement,
  onRemove,
  onClear,
}) {
  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 flex justify-end" onClick={onClose}>
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" />

      <aside
        className="relative ml-auto h-full w-full sm:max-w-md bg-white dark:bg-[#1c1c1e] animate-slide-up sm:animate-scale-in flex flex-col"
        onClick={(event) => event.stopPropagation()}
      >
        <div className="flex items-center justify-between px-4 sm:px-5 py-4 border-b border-gray-100 dark:border-white/10">
          <div className="flex items-center gap-3">
            <span className="flex h-10 w-10 items-center justify-center rounded-full bg-[#f5f5f7] dark:bg-[#2c2c2e] text-[#1d1d1f] dark:text-white">
              <ShoppingBagIcon className="w-5 h-5" />
            </span>
            <div>
              <h2 className="text-base font-semibold text-[#1d1d1f] dark:text-white">Tu pedido</h2>
              <p className="text-sm text-[#6e6e73] dark:text-[#86868b]">
                {totalItems} {totalItems === 1 ? 'item' : 'items'} agregados
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="w-10 h-10 rounded-full bg-[#f5f5f7] dark:bg-[#2c2c2e] text-[#6e6e73] dark:text-[#86868b] hover:text-[#1d1d1f] dark:hover:text-white transition-colors"
            aria-label="Cerrar pedido"
          >
            <XIcon className="w-4 h-4 m-auto" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto px-4 sm:px-5 py-5">
          {items.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-center px-6">
              <div className="w-16 h-16 rounded-full bg-[#f5f5f7] dark:bg-[#2c2c2e] flex items-center justify-center mb-4">
                <ShoppingBagIcon className="w-7 h-7 text-[#86868b]" />
              </div>
              <p className="text-lg font-semibold text-[#1d1d1f] dark:text-white mb-2">
                Tu pedido está vacío
              </p>
              <p className="text-sm text-[#6e6e73] dark:text-[#86868b]">
                Agregá productos desde el catálogo para enviar el pedido por WhatsApp.
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {items.map((item) => (
                <article
                  key={item.key}
                  className="rounded-2xl border border-gray-100 dark:border-white/10 bg-[#fbfbfd] dark:bg-[#161617] p-4"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <h3 className="text-sm font-semibold text-[#1d1d1f] dark:text-white">
                        {item.name}
                      </h3>
                      {item.model && (
                        <p className="mt-1 text-xs font-medium text-[#0071e3]">
                          {item.model}
                        </p>
                      )}
                      {item.type === 'pack' && item.includedItems?.length > 0 && (
                        <p className="mt-2 text-xs text-[#6e6e73] dark:text-[#86868b]">
                          Incluye: {item.includedItems.join(', ')}
                        </p>
                      )}
                      {typeof item.availableStock === 'number' && (
                        <p className="mt-2 text-xs text-[#6e6e73] dark:text-[#86868b]">
                          {item.type === 'pack' ? 'Pack sin stock completo' : `Stock visible: ${item.availableStock}`}
                        </p>
                      )}
                    </div>

                    <button
                      type="button"
                      onClick={() => onRemove(item)}
                      className="w-9 h-9 rounded-full bg-white dark:bg-[#2c2c2e] text-[#86868b] hover:text-red-500 transition-colors"
                      aria-label={`Quitar ${item.name}`}
                    >
                      <TrashIcon className="w-4 h-4 m-auto" />
                    </button>
                  </div>

                  <div className="mt-4 flex items-center justify-between gap-3">
                    <div>
                      {typeof item.price === 'number' && (
                        <p className="text-sm font-semibold text-[#1d1d1f] dark:text-white">
                          {formatPrice(item.price)}
                        </p>
                      )}
                      {typeof item.lineTotal === 'number' && (
                        <p className="text-xs text-[#6e6e73] dark:text-[#86868b]">
                          Subtotal: {formatPrice(item.lineTotal)}
                        </p>
                      )}
                    </div>

                    <div className="inline-flex items-center gap-2 rounded-full bg-white dark:bg-[#2c2c2e] px-2 py-1">
                      <button
                        type="button"
                        onClick={() => onDecrement(item)}
                        className="w-8 h-8 rounded-full text-[#1d1d1f] dark:text-white hover:bg-[#f5f5f7] dark:hover:bg-white/10 transition-colors"
                        aria-label={`Restar ${item.name}`}
                      >
                        <MinusIcon className="w-4 h-4 m-auto" />
                      </button>
                      <span className="min-w-6 text-center text-sm font-semibold text-[#1d1d1f] dark:text-white">
                        {item.quantity}
                      </span>
                      <button
                        type="button"
                        onClick={() => onIncrement(item)}
                        disabled={typeof item.availableStock === 'number' && item.quantity >= item.availableStock}
                        className="w-8 h-8 rounded-full text-[#1d1d1f] dark:text-white hover:bg-[#f5f5f7] dark:hover:bg-white/10 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
                        aria-label={`Sumar ${item.name}`}
                      >
                        <PlusIcon className="w-4 h-4 m-auto" />
                      </button>
                    </div>
                  </div>
                </article>
              ))}
            </div>
          )}
        </div>

        <div className="border-t border-gray-100 dark:border-white/10 px-4 sm:px-5 py-4 pb-[calc(1rem+env(safe-area-inset-bottom))]">
          <div className="flex items-center justify-between text-sm mb-4">
            <span className="text-[#6e6e73] dark:text-[#86868b]">Total estimado</span>
            <span className="font-semibold text-[#1d1d1f] dark:text-white">
              {typeof totalPrice === 'number' ? formatPrice(totalPrice) : 'A confirmar'}
            </span>
          </div>

          <div className="flex flex-col gap-2">
            <a
              href={whatsappUrl}
              target="_blank"
              rel="noopener noreferrer"
              className={`inline-flex items-center justify-center gap-2 rounded-full text-sm font-semibold px-5 py-3.5 transition-all duration-200 ${
                items.length
                  ? 'bg-[#25d366] hover:bg-[#22c55e] active:scale-[0.98] text-white'
                  : 'bg-[#d2d2d7] text-white pointer-events-none'
              }`}
            >
              <WhatsAppIcon className="w-5 h-5" />
              Enviar pedido por WhatsApp
            </a>

            <button
              type="button"
              onClick={onClear}
              disabled={!items.length}
              className="inline-flex items-center justify-center rounded-full border border-gray-200 dark:border-white/10 text-sm font-semibold text-[#1d1d1f] dark:text-white px-5 py-3 transition-colors hover:border-red-400 hover:text-red-500 disabled:opacity-40 disabled:cursor-not-allowed"
            >
              Vaciar pedido
            </button>
          </div>
        </div>
      </aside>
    </div>
  )
}
