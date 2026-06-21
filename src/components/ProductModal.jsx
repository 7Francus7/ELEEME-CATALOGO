import { useEffect, useState } from 'react'
import {
  formatPrice,
  usesModels,
  activeColors,
  colorStock,
  modelStock,
} from '../data/products'
import { WHATSAPP_NUMBER } from '../data/catalogConfig'
import { XIcon, WhatsAppIcon, ChevronLeftIcon } from './Icons'

export default function ProductModal({ product, activeModel, onNotifyRestock, onClose }) {
  const [email, setEmail] = useState('')
  const [notifyStatus, setNotifyStatus] = useState('') // '' | 'added' | 'duplicate' | 'invalid'

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

  // Video: archivo directo (mp4/webm…) se reproduce en línea; redes sociales abren en pestaña nueva
  const videoUrl = product.video_url?.trim()
  const isFileVideo = videoUrl && /\.(mp4|webm|ogg|mov)(\?|#|$)/i.test(videoUrl)

  // ── Lógica de stock / colores ──────────────────────────────────────────────
  const colores = activeColors(product)
  // Para productos con modelos hace falta un modelo elegido; los demás usan stock fijo
  const needsModel = usesModels(product)
  const stockVisible = !needsModel || !!activeModel
  const totalStock = modelStock(product, activeModel)
  const isAutomatic = product.stock_gestion === 'automatico'

  // ¿Hay al menos un color agotado en la vista actual? (para ofrecer aviso de restock)
  const algunAgotado =
    stockVisible && colores.some((c) => (colorStock(product, activeModel, c.nombre) ?? 0) === 0)

  const handleNotify = () => {
    const status = onNotifyRestock?.(product.id, email) || 'invalid'
    setNotifyStatus(status)
    if (status === 'added') setEmail('')
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 animate-fade-in"
      onClick={onClose}
    >
      {/* Backdrop con blur */}
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" />

      {/* Panel del modal */}
      <div
        className="relative w-full sm:max-w-3xl max-h-[92dvh] sm:max-h-[88vh]
                   bg-white dark:bg-[#1c1c1e]
                   rounded-t-3xl sm:rounded-2xl
                   overflow-hidden flex flex-col animate-slide-up"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Barra superior fija — siempre visible */}
        <div className="flex items-center justify-between px-3 sm:px-4 h-12 flex-shrink-0
                        border-b border-gray-100 dark:border-white/10 bg-white dark:bg-[#1c1c1e]">
          <button
            onClick={onClose}
            className="flex items-center gap-1 pl-1 pr-2 py-1.5 rounded-full
                       text-[#1d1d1f] dark:text-white hover:text-[#0071e3] dark:hover:text-[#0071e3]
                       transition-colors text-sm font-semibold"
            aria-label="Atrás"
          >
            <ChevronLeftIcon className="w-5 h-5" />
            Atrás
          </button>
          <button
            onClick={onClose}
            className="w-9 h-9 flex items-center justify-center rounded-full
                       bg-[#f5f5f7] dark:bg-[#2c2c2e]
                       text-[#6e6e73] dark:text-[#86868b]
                       hover:text-[#1d1d1f] dark:hover:text-white transition-colors"
            aria-label="Cerrar"
          >
            <XIcon className="w-4 h-4" />
          </button>
        </div>

        {/* Contenido principal — scroll interno */}
        <div className="flex flex-col sm:flex-row overflow-y-auto sm:overflow-hidden flex-1">

          {/* Imagen */}
          <div className="sm:w-2/5 bg-[#f5f5f7] dark:bg-[#2c2c2e] flex-shrink-0 overflow-hidden">
            <img
              src={product.imagen_url}
              alt={product.nombre}
              className={`w-full h-64 sm:h-full ${
                product.imagen_ajuste === 'contain' ? 'object-contain p-8' : 'object-cover'
              }`}
              onError={(e) => {
                e.target.src = `https://placehold.co/400x400/f5f5f7/86868b?text=${encodeURIComponent(product.nombre)}`
              }}
            />
          </div>

          {/* Detalle */}
          <div className="sm:w-3/5 p-6 sm:p-8 pb-[calc(1.5rem+env(safe-area-inset-bottom))] sm:pb-8 overflow-y-auto">

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

            {/* Colores y disponibilidad */}
            {colores.length > 0 && (
              <div className="mb-6">
                <h3 className="text-[11px] font-semibold uppercase tracking-widest text-[#6e6e73] dark:text-[#86868b] mb-3">
                  Colores y disponibilidad
                  {needsModel && activeModel && (
                    <span className="text-[#0071e3] normal-case tracking-normal font-medium"> · {activeModel}</span>
                  )}
                </h3>

                {!stockVisible ? (
                  <p className="text-sm text-[#6e6e73] dark:text-[#86868b] bg-[#f5f5f7] dark:bg-[#2c2c2e] rounded-xl px-4 py-3">
                    Seleccioná un modelo arriba para ver el stock de cada color.
                  </p>
                ) : (
                  <div className="space-y-2">
                    {colores.map((c) => {
                      const qty = colorStock(product, activeModel, c.nombre) ?? 0
                      const agotado = qty === 0
                      return (
                        <div
                          key={c.nombre}
                          className={`flex items-center gap-3 rounded-xl px-3 py-2.5 border ${
                            agotado
                              ? 'border-transparent bg-[#f5f5f7] dark:bg-[#2c2c2e] opacity-60'
                              : 'border-gray-100 dark:border-white/10 bg-white dark:bg-[#1c1c1e]'
                          }`}
                        >
                          <span
                            className="w-5 h-5 rounded-full border border-black/10 dark:border-white/20 flex-shrink-0"
                            style={{ backgroundColor: c.codigo }}
                          />
                          <span className={`text-sm font-medium flex-1 ${agotado ? 'text-[#6e6e73] dark:text-[#86868b] line-through' : 'text-[#1d1d1f] dark:text-white'}`}>
                            {c.nombre}
                          </span>
                          {agotado ? (
                            <span className="text-xs font-semibold text-[#86868b] uppercase tracking-wide">Agotado</span>
                          ) : (
                            <span className="text-xs font-semibold text-green-600 dark:text-green-400">
                              {qty} {qty === 1 ? 'disponible' : 'disponibles'}
                            </span>
                          )}
                        </div>
                      )
                    })}
                  </div>
                )}

                {/* Aviso de restock cuando hay algún color agotado */}
                {algunAgotado && (
                  <div className="mt-4 bg-amber-50 dark:bg-amber-500/10 rounded-xl p-4">
                    <p className="text-xs font-semibold text-amber-700 dark:text-amber-400 mb-2">
                      ¿Querés que te avise cuando vuelva el stock?
                    </p>
                    {notifyStatus === 'added' ? (
                      <p className="text-sm font-medium text-green-600 dark:text-green-400">
                        ✓ Listo, te avisamos apenas vuelva.
                      </p>
                    ) : notifyStatus === 'duplicate' ? (
                      <p className="text-sm font-medium text-[#0071e3]">
                        Ya estás en la lista de aviso ✓
                      </p>
                    ) : (
                      <div className="flex gap-2">
                        <input
                          type="email"
                          value={email}
                          onChange={(e) => { setEmail(e.target.value); setNotifyStatus('') }}
                          placeholder="tu@email.com"
                          className="flex-1 min-w-0 bg-white dark:bg-[#2c2c2e] dark:text-white rounded-lg px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-[#0071e3]/40 border border-amber-200 dark:border-transparent"
                        />
                        <button
                          onClick={handleNotify}
                          className="flex-shrink-0 bg-[#1d1d1f] dark:bg-white dark:text-black text-white text-sm font-semibold px-4 py-2 rounded-lg active:scale-95 transition-all"
                        >
                          Avisarme
                        </button>
                      </div>
                    )}
                    {notifyStatus === 'invalid' && (
                      <p className="text-xs text-red-500 mt-2">Ingresá un email válido.</p>
                    )}
                  </div>
                )}
              </div>
            )}

            {/* Especificaciones */}
            <div className="mb-5">
              <h3 className="text-[11px] font-semibold uppercase tracking-widest text-[#6e6e73] dark:text-[#86868b] mb-2">
                Especificaciones
              </h3>
              <p className="text-sm text-[#1d1d1f] dark:text-[#e5e5ea] leading-relaxed">
                {product.descripcion}
              </p>
            </div>

            {/* Video del producto */}
            {videoUrl && (
              <div className="mb-6">
                <h3 className="text-[11px] font-semibold uppercase tracking-widest text-[#6e6e73] dark:text-[#86868b] mb-2">
                  Video del producto
                </h3>
                {isFileVideo ? (
                  <video
                    src={videoUrl}
                    controls
                    playsInline
                    preload="metadata"
                    className="w-full rounded-xl bg-black max-h-72 object-contain"
                  />
                ) : (
                  <a
                    href={videoUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center justify-center gap-2 bg-[#1d1d1f] dark:bg-white dark:text-black text-white text-sm font-semibold px-4 py-3 rounded-xl active:scale-95 transition-all"
                  >
                    <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor"><path d="M8 5v14l11-7z" /></svg>
                    Ver video
                  </a>
                )}
              </div>
            )}

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
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
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
              <div className="flex items-center gap-2">
                {/* Botón comprar — solo UI, aparece si la gestión es automática y hay stock */}
                {isAutomatic && stockVisible && totalStock > 0 && (
                  <button
                    className="flex-shrink-0 bg-[#0071e3] hover:bg-[#0077ed] active:scale-95 text-white text-sm font-semibold px-5 py-3.5 rounded-full transition-all duration-200"
                  >
                    Comprar
                  </button>
                )}
                <a
                  href={`https://wa.me/${WHATSAPP_NUMBER}?text=${whatsappMessage}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex-1 sm:flex-none flex items-center justify-center gap-2 bg-[#25d366] hover:bg-[#22c55e] active:scale-95
                             text-white text-sm font-semibold px-5 py-3.5 rounded-full
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
    </div>
  )
}
