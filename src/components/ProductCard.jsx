import { formatPrice } from '../data/products'

export default function ProductCard({ product, onOpen }) {
  const discount = product.precio_original
    ? Math.round((1 - product.precio / product.precio_original) * 100)
    : null

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
          <p className="text-[10px] font-bold text-[#0071e3] uppercase tracking-widest mb-1 opacity-80">
            {product.categoria}
          </p>
          <h3 className="font-semibold text-[#1d1d1f] dark:text-white text-[15px] sm:text-[17px] leading-[1.3] tracking-tight mb-2 group-hover:text-[#0071e3] transition-colors duration-300">
            {product.nombre}
          </h3>
          <p className="text-xs text-[#86868b] dark:text-[#86868b] mb-4 line-clamp-2 leading-relaxed">
            {product.compatible_con}
          </p>
        </div>

        <div className="flex items-center justify-between pt-4 border-t border-gray-50 dark:border-white/5">
          <div className="flex flex-col">
            <span className="font-bold text-[#1d1d1f] dark:text-white text-base sm:text-lg tracking-tight">
              {formatPrice(product.precio)}
            </span>
            {product.precio_original && !product.ocultar_descuento_nro && (
              <span className="text-[11px] text-[#86868b] line-through decoration-red-500/30">
                {formatPrice(product.precio_original)}
              </span>
            )}
          </div>
          
          <div className="w-8 h-8 rounded-full bg-[#f5f5f7] dark:bg-[#2c2c2e] flex items-center justify-center group-hover:bg-[#0071e3] transition-all duration-300">
            <span className="text-[#1d1d1f] dark:text-white group-hover:text-white transition-colors text-lg leading-none">+</span>
          </div>
        </div>
      </div>
    </article>
  )
}

