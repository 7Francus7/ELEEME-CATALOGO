import { formatPrice, WHATSAPP_NUMBER, hasStock } from '../data/products'
import { WhatsAppIcon } from './Icons'

export default function ProductCard({ product, onOpen, activeModel }) {
  const whatsappLink = `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(
    `Hola! Me interesa el ${product.nombre}. ¿Me pasás más info?`
  )}`

  const discount = product.precio_original
    ? Math.round((1 - product.precio / product.precio_original) * 100)
    : null

  // Badge de stock solo cuando hay un modelo filtrado (null = no mostrar)
  const inStock = activeModel ? hasStock(product, activeModel) : null

  return (
    <article
      onClick={() => onOpen(product)}
      className="group bg-white dark:bg-[#1c1c1e] rounded-[24px] overflow-hidden cursor-pointer
                 shadow-[0_2px_8px_rgba(0,0,0,0.04)] hover:shadow-[0_20px_40px_rgba(0,0,0,0.08)] 
                 dark:shadow-none dark:hover:shadow-[0_20px_40px_rgba(0,0,0,0.4)]
                 transition-all duration-500 hover:-translate-y-1.5 flex flex-col h-full"
    >
      {/* Imagen */}
      <div className="aspect-square bg-[#fbfbfd] dark:bg-[#2c2c2e] overflow-hidden relative flex items-center justify-center p-6">
        <img
          src={product.imagen_url}
          alt={product.nombre}
          className="w-full h-full object-contain group-hover:scale-110 transition-transform duration-700 ease-out drop-shadow-sm"
          onError={(e) => {
            e.target.src = `https://placehold.co/400x400/f5f5f7/86868b?text=${encodeURIComponent(product.nombre)}`
          }}
        />
        
        {/* Badge superior (Tag) */}
        {product.tag && (
          <div className="absolute top-3 right-3">
             <span className="text-[9px] font-bold tracking-wider bg-white/90 dark:bg-black/50 backdrop-blur-md text-[#1d1d1f] dark:text-white px-2 py-1 rounded-md shadow-sm uppercase">
               {product.tag}
             </span>
          </div>
        )}

        {/* Badge de descuento */}
        {discount && !product.ocultar_descuento_porcentaje && (
          <span className="absolute bottom-3 left-3 text-[10px] font-bold bg-red-500 text-white px-2 py-0.5 rounded-full shadow-sm">
            −{discount}%
          </span>
        )}
      </div>

      {/* Info */}
      <div className="p-5 flex flex-col flex-1">
        <div className="mb-auto">
          <div className="flex items-center justify-between gap-2 mb-1">
            <p className="text-[10px] font-bold text-[#0071e3] uppercase tracking-widest opacity-80">
              {product.categoria}
            </p>
            {inStock !== null && (
              <span
                className={`text-[9px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full ${
                  inStock
                    ? 'bg-green-100 text-green-700 dark:bg-green-500/15 dark:text-green-400'
                    : 'bg-red-100 text-red-600 dark:bg-red-500/15 dark:text-red-400'
                }`}
              >
                {inStock ? 'En stock' : 'Agotado'}
              </span>
            )}
          </div>
          <h3 className="font-semibold text-[#1d1d1f] dark:text-white text-[15px] sm:text-[17px] leading-[1.3] tracking-tight mb-2 group-hover:text-[#0071e3] transition-colors duration-300">
            {product.nombre}
          </h3>
          <p className="text-xs text-[#86868b] dark:text-[#86868b] mb-4 line-clamp-2 leading-relaxed">
            {product.compatible_con}
          </p>
        </div>

        <div className="flex items-center justify-between gap-2 pt-4 border-t border-gray-50 dark:border-white/5">
          <div className="flex flex-col min-w-0">
            <span className="font-bold text-[#1d1d1f] dark:text-white text-base sm:text-lg tracking-tight">
              {formatPrice(product.precio)}
            </span>
            {product.precio_original && !product.ocultar_descuento_nro && (
              <span className="text-[11px] text-[#86868b] line-through decoration-red-500/30">
                {formatPrice(product.precio_original)}
              </span>
            )}
          </div>

          {/* Botón directo de WhatsApp — no abre el modal */}
          <a
            href={whatsappLink}
            target="_blank"
            rel="noopener noreferrer"
            onClick={(e) => e.stopPropagation()}
            aria-label={`Consultar ${product.nombre} por WhatsApp`}
            className="flex-shrink-0 flex items-center gap-1.5 bg-[#25d366] hover:bg-[#22c55e] active:scale-95
                       text-white text-xs font-semibold px-3 py-2 rounded-full transition-all duration-200
                       shadow-sm shadow-green-500/20"
          >
            <WhatsAppIcon className="w-4 h-4" />
            <span className="hidden sm:inline">Consultar</span>
          </a>
        </div>
      </div>
    </article>
  )
}

