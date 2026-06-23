import { useEffect, useState } from 'react'
import {
  formatPrice,
  usesModels,
  activeColors,
  colorStock,
  modelStock,
  productImages,
  productVideos,
} from '../data/products'
import { WHATSAPP_NUMBER } from '../data/catalogConfig'
import { getVideo } from '../utils/videoStore'
import { XIcon, WhatsAppIcon, ChevronLeftIcon } from './Icons'
import CatalogImage from './CatalogImage'

// Reproductor de un video del producto. Resuelve su origen:
//   - { key }  → video subido, guardado en IndexedDB (object URL, reproducción inline)
//   - { url }  → archivo directo (.mp4/.webm…) inline; redes sociales abren en pestaña
function ProductVideo({ video }) {
  const [uploadedUrl, setUploadedUrl] = useState('')
  useEffect(() => {
    let objectUrl
    if (video.key) {
      getVideo(video.key).then((blob) => {
        if (blob) {
          objectUrl = URL.createObjectURL(blob)
          setUploadedUrl(objectUrl)
        }
      })
    }
    return () => { if (objectUrl) URL.revokeObjectURL(objectUrl) }
  }, [video.key])

  const url = video.url?.trim()
  // Reproducción inline para archivos de video directos y para los servidos por
  // nuestro backend (/api/media, que manda el Content-Type correcto).
  const isFileVideo = url && (/\.(mp4|webm|ogg|mov)(\?|#|$)/i.test(url) || /^\/api\/media\b/.test(url))

  if (uploadedUrl || isFileVideo) {
    return (
      <video
        src={uploadedUrl || url}
        controls
        playsInline
        preload="metadata"
        className="w-full rounded-xl bg-black max-h-72 object-contain"
      />
    )
  }
  if (url) {
    return (
      <a
        href={url}
        target="_blank"
        rel="noopener noreferrer"
        className="flex items-center justify-center gap-2 bg-[#1d1d1f] dark:bg-white dark:text-black text-white text-sm font-semibold px-4 py-3 rounded-xl active:scale-95 transition-all"
      >
        <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor"><path d="M8 5v14l11-7z" /></svg>
        Ver video
      </a>
    )
  }
  return null
}

export default function ProductModal({ product, activeModel, onNotifyRestock, onClose }) {
  const [email, setEmail] = useState('')
  const [notifyStatus, setNotifyStatus] = useState('') // '' | 'added' | 'duplicate' | 'invalid'
  const [lightboxOpen, setLightboxOpen] = useState(false) // foto en pantalla completa
  const [activeImage, setActiveImage] = useState(0) // foto activa en la galería

  const images = productImages(product)
  const videos = productVideos(product)
  const fitContain = product.imagen_ajuste === 'contain'
  const safeActive = Math.min(activeImage, Math.max(images.length - 1, 0))
  const goImage = (dir) => setActiveImage((i) => {
    if (!images.length) return 0
    return (i + dir + images.length) % images.length
  })

  // Cerrar con Escape (primero el lightbox si está abierto, después el modal)
  useEffect(() => {
    const handleKey = (e) => {
      if (e.key === 'Escape') {
        if (lightboxOpen) setLightboxOpen(false)
        else onClose()
      } else if (lightboxOpen && images.length > 1) {
        if (e.key === 'ArrowRight') goImage(1)
        else if (e.key === 'ArrowLeft') goImage(-1)
      }
    }
    window.addEventListener('keydown', handleKey)
    return () => window.removeEventListener('keydown', handleKey)
  }, [onClose, lightboxOpen, images.length])

  // Bloquear scroll del body
  useEffect(() => {
    document.body.style.overflow = 'hidden'
    return () => { document.body.style.overflow = '' }
  }, [])

  const whatsappMessage = encodeURIComponent(
    `Hola! Me interesa el ${product.nombre} (${formatPrice(product.precio)}). ¿Podés darme más información?`
  )

  const hasVideo = videos.length > 0

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

          {/* Galería — tocar para ver en grande; flechas/miniaturas si hay varias fotos */}
          <div className="sm:w-2/5 bg-[#f5f5f7] dark:bg-[#2c2c2e] flex-shrink-0 sm:overflow-y-auto">
            <div className="relative group">
              <CatalogImage
                src={images[safeActive]}
                alt={product.nombre}
                fallbackText={product.nombre}
                onClick={() => setLightboxOpen(true)}
                className={`w-full h-64 sm:h-80 cursor-zoom-in ${fitContain ? 'object-contain p-8' : 'object-cover'}`}
              />

              {images.length > 1 && (
                <>
                  <button
                    onClick={() => goImage(-1)}
                    aria-label="Foto anterior"
                    className="absolute left-2 top-1/2 -translate-y-1/2 w-9 h-9 flex items-center justify-center rounded-full bg-black/45 text-white hover:bg-black/65 backdrop-blur-sm transition-colors"
                  >
                    <ChevronLeftIcon className="w-5 h-5" />
                  </button>
                  <button
                    onClick={() => goImage(1)}
                    aria-label="Foto siguiente"
                    className="absolute right-2 top-1/2 -translate-y-1/2 w-9 h-9 flex items-center justify-center rounded-full bg-black/45 text-white hover:bg-black/65 backdrop-blur-sm transition-colors rotate-180"
                  >
                    <ChevronLeftIcon className="w-5 h-5" />
                  </button>
                  <span className="pointer-events-none absolute bottom-2 left-2 rounded-full bg-black/55 px-2.5 py-1 text-[11px] font-medium text-white backdrop-blur-sm">
                    {safeActive + 1} / {images.length}
                  </span>
                </>
              )}

              <span className="pointer-events-none absolute bottom-2 right-2 flex items-center gap-1 rounded-full bg-black/55 px-2.5 py-1 text-[11px] font-medium text-white opacity-90 backdrop-blur-sm">
                <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-4.35-4.35M11 8v6M8 11h6M19 11a8 8 0 11-16 0 8 8 0 0116 0z" /></svg>
                Ampliar
              </span>
            </div>

            {/* Miniaturas */}
            {images.length > 1 && (
              <div className="flex gap-2 overflow-x-auto p-3">
                {images.map((src, i) => (
                  <button
                    key={i}
                    onClick={() => setActiveImage(i)}
                    aria-label={`Ver foto ${i + 1}`}
                    className={`flex-shrink-0 w-14 h-14 rounded-xl overflow-hidden border-2 transition-all ${
                      i === safeActive ? 'border-[#0071e3]' : 'border-transparent opacity-70 hover:opacity-100'
                    }`}
                  >
                    <CatalogImage src={src} alt="" fallbackText={product.nombre} className="w-full h-full object-cover" />
                  </button>
                ))}
              </div>
            )}
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

            {/* Modelos disponibles (solo productos que se gestionan por modelo) */}
            {needsModel && product.modelos.length > 0 && (
              <div className="mb-6">
                <h3 className="text-[11px] font-semibold uppercase tracking-widest text-[#6e6e73] dark:text-[#86868b] mb-3">
                  Modelos disponibles
                </h3>
                <div className="flex flex-wrap gap-2">
                  {product.modelos.map((m) => (
                    <span
                      key={m}
                      className={`text-xs font-medium px-3 py-1.5 rounded-full border ${
                        m === activeModel
                          ? 'border-[#0071e3] bg-[#0071e3]/10 text-[#0071e3]'
                          : 'border-gray-200 dark:border-white/10 text-[#1d1d1f] dark:text-[#e5e5ea]'
                      }`}
                    >
                      {m}
                    </span>
                  ))}
                </div>
              </div>
            )}

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
                  <div className="space-y-3">
                    <div className="flex flex-wrap gap-2">
                      {colores.map((c) => (
                        <span
                          key={c.nombre}
                          className="flex items-center gap-2 rounded-full border border-gray-100 dark:border-white/10 bg-white dark:bg-[#1c1c1e] pl-1.5 pr-3 py-1"
                        >
                          <span
                            className="w-4 h-4 rounded-full border border-black/10 dark:border-white/20 flex-shrink-0"
                            style={{ backgroundColor: c.codigo }}
                          />
                          <span className="text-sm font-medium text-[#1d1d1f] dark:text-white">{c.nombre}</span>
                        </span>
                      ))}
                    </div>
                    <p className="text-sm text-[#6e6e73] dark:text-[#86868b] bg-[#f5f5f7] dark:bg-[#2c2c2e] rounded-xl px-4 py-3">
                      Disponible en estos colores para todos los modelos. Seleccioná un modelo arriba para ver el stock de cada color.
                    </p>
                  </div>
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

            {/* Videos del producto */}
            {hasVideo && (
              <div className="mb-6">
                <h3 className="text-[11px] font-semibold uppercase tracking-widest text-[#6e6e73] dark:text-[#86868b] mb-2">
                  {videos.length === 1 ? 'Video del producto' : 'Videos del producto'}
                </h3>
                <div className="space-y-3">
                  {videos.map((v, i) => (
                    <ProductVideo key={v.key || v.url || i} video={v} />
                  ))}
                </div>
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

      {/* Lightbox: foto del producto en pantalla completa */}
      {lightboxOpen && (
        <div
          className="fixed inset-0 z-[60] flex items-center justify-center bg-black/90 p-4 animate-fade-in"
          onClick={(e) => { e.stopPropagation(); setLightboxOpen(false) }}
        >
          <button
            onClick={(e) => { e.stopPropagation(); setLightboxOpen(false) }}
            className="absolute top-4 right-4 w-10 h-10 flex items-center justify-center rounded-full bg-white/10 text-white hover:bg-white/20 transition-colors"
            aria-label="Cerrar"
          >
            <XIcon className="w-5 h-5" />
          </button>

          {images.length > 1 && (
            <>
              <button
                onClick={(e) => { e.stopPropagation(); goImage(-1) }}
                aria-label="Foto anterior"
                className="absolute left-4 top-1/2 -translate-y-1/2 w-11 h-11 flex items-center justify-center rounded-full bg-white/10 text-white hover:bg-white/20 transition-colors"
              >
                <ChevronLeftIcon className="w-6 h-6" />
              </button>
              <button
                onClick={(e) => { e.stopPropagation(); goImage(1) }}
                aria-label="Foto siguiente"
                className="absolute right-4 top-1/2 -translate-y-1/2 w-11 h-11 flex items-center justify-center rounded-full bg-white/10 text-white hover:bg-white/20 transition-colors rotate-180"
              >
                <ChevronLeftIcon className="w-6 h-6" />
              </button>
              <span className="absolute bottom-5 left-1/2 -translate-x-1/2 rounded-full bg-white/10 px-3 py-1 text-sm font-medium text-white">
                {safeActive + 1} / {images.length}
              </span>
            </>
          )}

          <CatalogImage
            src={images[safeActive]}
            alt={product.nombre}
            fallbackText={product.nombre}
            onClick={(e) => e.stopPropagation()}
            className="max-w-full max-h-[90dvh] object-contain rounded-lg cursor-zoom-out select-none"
          />
        </div>
      )}
    </div>
  )
}
