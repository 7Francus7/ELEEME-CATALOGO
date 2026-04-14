import { useEffect } from 'react'
import { formatPrice, WHATSAPP_NUMBER } from '../data/products'
import { XIcon, WhatsAppIcon } from './Icons'

export default function ProductModal({ product, onClose }) {
  // Cerrar con Escape
  useEffect(() => {
    const handleKey = (e) => { if (e.key === 'Escape') onClose() }
    window.addEventListener('keydown', handleKey)
    return () => window.removeEventListener('keydown', handleKey)
  }, [onClose])

  // Bloquear scroll del body
  useEffect(() => {
    document.body.style.overflow = 'hidden'
    return () => { document.body.style.overflow = '' }
  }, [])

  const whatsappMessage = encodeURIComponent(
    `Hola! Me interesa el ${product.nombre} (${formatPrice(product.precio)}). ¿Podés darme más información?`
  )

  return (
    <div
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 animate-fade-in"
      onClick={onClose}
    >
      {/* Backdrop con blur */}
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" />

      {/* Panel del modal */}
      <div
        className="relative w-full sm:max-w-3xl max-h-[96vh] sm:max-h-[88vh]
                   bg-white dark:bg-[#1c1c1e]
                   rounded-t-3xl sm:rounded-2xl
                   overflow-hidden flex flex-col animate-slide-up"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Botón cerrar */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 z-10 w-8 h-8 flex items-center justify-center
                     rounded-full bg-[#f5f5f7] dark:bg-[#2c2c2e]
                     text-[#6e6e73] dark:text-[#86868b]
                     hover:text-[#1d1d1f] dark:hover:text-white transition-colors"
          aria-label="Cerrar"
        >
          <XIcon className="w-4 h-4" />
        </button>

        {/* Tirante móvil */}
        <div className="flex justify-center pt-3 pb-1 sm:hidden">
          <div className="w-10 h-1 rounded-full bg-gray-300 dark:bg-gray-600" />
        </div>

        {/* Contenido principal — scroll interno */}
        <div className="flex flex-col sm:flex-row overflow-y-auto sm:overflow-hidden flex-1">

          {/* Imagen */}
          <div className="sm:w-2/5 bg-[#f5f5f7] dark:bg-[#2c2c2e] flex items-center justify-center p-8 min-h-56 sm:min-h-full flex-shrink-0">
            <img
              src={product.imagen_url}
              alt={product.nombre}
              className="max-w-full max-h-64 sm:max-h-80 object-contain"
              onError={(e) => {
                e.target.src = `https://placehold.co/400x400/f5f5f7/86868b?text=${encodeURIComponent(product.nombre)}`
              }}
            />
          </div>

          {/* Detalle */}
          <div className="sm:w-3/5 p-6 sm:p-8 overflow-y-auto">

            {/* Tag + nombre */}
            {product.tag && (
              <span className="text-xs font-semibold uppercase tracking-wider text-[#0071e3]">
                {product.tag}
              </span>
            )}
            <h2 className="text-2xl font-semibold text-[#1d1d1f] dark:text-white mt-2 mb-1 leading-tight">
              {product.nombre}
            </h2>
            <p className="text-sm text-[#6e6e73] dark:text-[#86868b] mb-6">
              Compatible con {product.compatible_con}
            </p>

            {/* Especificaciones */}
            <div className="mb-5">
              <h3 className="text-[11px] font-semibold uppercase tracking-widest text-[#6e6e73] dark:text-[#86868b] mb-2">
                Especificaciones
              </h3>
              <p className="text-sm text-[#1d1d1f] dark:text-[#e5e5ea] leading-relaxed">
                {product.descripcion}
              </p>
            </div>

            {/* Por qué lo necesitás */}
            <div className="bg-[#f5f5f7] dark:bg-[#2c2c2e] rounded-xl p-4 mb-6">
              <h3 className="text-[11px] font-semibold uppercase tracking-widest text-[#0071e3] mb-2">
                Por qué lo necesitás
              </h3>
              <p className="text-sm text-[#1d1d1f] dark:text-[#e5e5ea] leading-relaxed">
                {product.por_que_lo_necesitas}
              </p>
            </div>

            {/* Precio + CTA */}
            <div className="flex items-center justify-between gap-4 flex-wrap">
              <div>
                <p className="text-2xl font-semibold text-[#1d1d1f] dark:text-white">
                  {formatPrice(product.precio)}
                </p>
                {product.precio_original && !product.ocultar_descuento_nro && (
                  <p className="text-sm text-[#6e6e73] dark:text-[#86868b] line-through">
                    {formatPrice(product.precio_original)}
                  </p>
                )}
              </div>
              <a
                href={`https://wa.me/${WHATSAPP_NUMBER}?text=${whatsappMessage}`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 bg-[#25d366] hover:bg-[#22c55e] active:scale-95
                           text-white text-sm font-semibold px-5 py-3 rounded-full
                           transition-all duration-200 shadow-lg shadow-green-500/20"
              >
                <WhatsAppIcon className="w-5 h-5" />
                Consultar por WhatsApp
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
