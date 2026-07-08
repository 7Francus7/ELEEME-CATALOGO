import { useEffect, useState } from 'react'
import {
  activeColors,
  colorStock,
  formatPrice,
  modelStock,
  productImages,
  productVideos,
  savingsAmount,
  usesModels,
} from '../data/products'
import { WHATSAPP_NUMBER } from '../data/catalogConfig'
import { getVideo } from '../utils/videoStore'
import { ChevronLeftIcon, WhatsAppIcon, XIcon } from './Icons'
import CatalogImage from './CatalogImage'
import RelatedProducts from './RelatedProducts'

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

    return () => {
      if (objectUrl) URL.revokeObjectURL(objectUrl)
    }
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
        <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
          <path d="M8 5v14l11-7z" />
        </svg>
        Ver video
      </a>
    )
  }

  return null
}

export default function ProductModal({
  product,
  activeModel,
  relatedProducts = [],
  onNotifyRestock,
  onAddToCart,
  onOpenProduct,
  onClose,
}) {
  const [email, setEmail] = useState('')
  const [notifyStatus, setNotifyStatus] = useState('')
  const [lightboxOpen, setLightboxOpen] = useState(false)
  const [activeImage, setActiveImage] = useState(0)
  const [selectedModel, setSelectedModel] = useState('')
  const [cartFeedback, setCartFeedback] = useState('')

  const images = productImages(product)
  const videos = productVideos(product)
  const fitContain = product.imagen_ajuste === 'contain'
  const safeActive = Math.min(activeImage, Math.max(images.length - 1, 0))
  const hasVideo = videos.length > 0
  const colors = activeColors(product)
  const needsModel = usesModels(product)
  const savings = savingsAmount(product)

  useEffect(() => {
    if (!needsModel) {
      setSelectedModel('')
      return
    }

    if (activeModel && product.modelos.includes(activeModel)) {
      setSelectedModel(activeModel)
    } else {
      setSelectedModel('')
    }
  }, [activeModel, needsModel, product.id, product.modelos])

  useEffect(() => {
    setCartFeedback('')
    setNotifyStatus('')
    setEmail('')
    setActiveImage(0)
  }, [product.id])

  const currentModel = needsModel ? selectedModel || null : null
  const stockVisible = !needsModel || !!currentModel
  const totalStock = modelStock(product, currentModel)
  const someColorOutOfStock =
    stockVisible && colors.some((color) => (colorStock(product, currentModel, color.nombre) ?? 0) === 0)
  const canAddToCart = !needsModel || (!!currentModel && (totalStock ?? 0) > 0)
  const addButtonLabel = !needsModel
    ? totalStock > 0 ? 'Agregar al pedido' : 'Sin stock'
    : !currentModel
      ? 'Elegí un modelo'
      : totalStock > 0
        ? 'Agregar al pedido'
        : 'Sin stock'

  const goImage = (direction) => {
    setActiveImage((index) => {
      if (!images.length) return 0
      return (index + direction + images.length) % images.length
    })
  }

  useEffect(() => {
    const handleKey = (event) => {
      if (event.key === 'Escape') {
        if (lightboxOpen) setLightboxOpen(false)
        else onClose()
      } else if (lightboxOpen && images.length > 1) {
        if (event.key === 'ArrowRight') goImage(1)
        else if (event.key === 'ArrowLeft') goImage(-1)
      }
    }

    window.addEventListener('keydown', handleKey)
    return () => window.removeEventListener('keydown', handleKey)
  }, [images.length, lightboxOpen, onClose])

  useEffect(() => {
    document.body.style.overflow = 'hidden'
    return () => {
      document.body.style.overflow = ''
    }
  }, [])

  const whatsappMessage = encodeURIComponent(
    `Hola! Quiero consultar por ${product.nombre}${currentModel ? ` para ${currentModel}` : ''}${typeof product.precio === 'number' ? ` (${formatPrice(product.precio)})` : ''}. Si esta disponible, me lo reservas?`
  )

  const handleNotify = () => {
    const status = onNotifyRestock?.(product.id, email) || 'invalid'
    setNotifyStatus(status)
    if (status === 'added') setEmail('')
  }

  const handleAddToCart = () => {
    const status = onAddToCart?.(product, currentModel)
    setCartFeedback(status || '')
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 animate-fade-in"
      onClick={onClose}
    >
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" />

      <div
        className="relative w-full sm:max-w-3xl max-h-[92dvh] sm:max-h-[88vh] bg-white dark:bg-[#1c1c1e] rounded-t-3xl sm:rounded-2xl overflow-hidden flex flex-col animate-slide-up"
        onClick={(event) => event.stopPropagation()}
      >
        <div className="flex items-center justify-between px-3 sm:px-4 h-12 flex-shrink-0 border-b border-gray-100 dark:border-white/10 bg-white dark:bg-[#1c1c1e]">
          <button
            onClick={onClose}
            className="flex items-center gap-1 pl-1 pr-2 py-1.5 rounded-full text-[#1d1d1f] dark:text-white hover:text-[#0071e3] transition-colors text-sm font-semibold"
            aria-label="Atrás"
          >
            <ChevronLeftIcon className="w-5 h-5" />
            Atrás
          </button>

          <button
            onClick={onClose}
            className="w-9 h-9 flex items-center justify-center rounded-full bg-[#f5f5f7] dark:bg-[#2c2c2e] text-[#6e6e73] dark:text-[#86868b] hover:text-[#1d1d1f] dark:hover:text-white transition-colors"
            aria-label="Cerrar"
          >
            <XIcon className="w-4 h-4" />
          </button>
        </div>

        <div className="flex flex-col sm:flex-row overflow-y-auto sm:overflow-hidden flex-1">
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
                <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-4.35-4.35M11 8v6M8 11h6M19 11a8 8 0 11-16 0 8 8 0 0116 0z" />
                </svg>
                Ampliar
              </span>
            </div>

            {images.length > 1 && (
              <div className="flex gap-2 overflow-x-auto p-3">
                {images.map((src, index) => (
                  <button
                    key={index}
                    onClick={() => setActiveImage(index)}
                    aria-label={`Ver foto ${index + 1}`}
                    className={`flex-shrink-0 w-14 h-14 rounded-xl overflow-hidden border-2 transition-all ${
                      index === safeActive ? 'border-[#0071e3]' : 'border-transparent opacity-70 hover:opacity-100'
                    }`}
                  >
                    <CatalogImage src={src} alt="" fallbackText={product.nombre} className="w-full h-full object-cover" />
                  </button>
                ))}
              </div>
            )}
          </div>

          <div className="sm:w-3/5 p-6 sm:p-8 pb-[calc(1.5rem+env(safe-area-inset-bottom))] sm:pb-8 overflow-y-auto">
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

            {needsModel && product.modelos.length > 0 && (
              <div className="mb-6">
                <h3 className="text-[11px] font-semibold uppercase tracking-widest text-[#6e6e73] dark:text-[#86868b] mb-3">
                  Elegí un modelo
                </h3>
                <div className="flex flex-wrap gap-2">
                  {product.modelos.map((model) => {
                    const modelOut = (modelStock(product, model) ?? 0) === 0
                    return (
                      <button
                        key={model}
                        type="button"
                        onClick={() => {
                          setSelectedModel(model)
                          setCartFeedback('')
                        }}
                        className={`text-xs font-medium px-3 py-1.5 rounded-full border transition-colors ${
                          model === currentModel
                            ? 'border-[#0071e3] bg-[#0071e3]/10 text-[#0071e3]'
                            : modelOut
                              ? 'border-gray-200 dark:border-white/10 text-[#86868b] opacity-70 hover:border-[#0071e3]'
                              : 'border-gray-200 dark:border-white/10 text-[#1d1d1f] dark:text-[#e5e5ea] hover:border-[#0071e3]'
                        }`}
                      >
                        {model}
                        {modelOut && (
                          <span className="ml-1.5 text-[10px] font-semibold uppercase tracking-wide text-[#86868b]">
                            Agotado
                          </span>
                        )}
                      </button>
                    )
                  })}
                </div>
                {!currentModel && (
                  <p className="mt-3 text-sm text-[#6e6e73] dark:text-[#86868b]">
                    Seleccioná un modelo para ver la disponibilidad por color.
                  </p>
                )}
              </div>
            )}

            {colors.length > 0 && (
              <div className="mb-6">
                <h3 className="text-[11px] font-semibold uppercase tracking-widest text-[#6e6e73] dark:text-[#86868b] mb-3">
                  Colores y disponibilidad
                  {currentModel && (
                    <span className="text-[#0071e3] normal-case tracking-normal font-medium"> · {currentModel}</span>
                  )}
                </h3>

                {!stockVisible ? (
                  <div className="space-y-3">
                    <div className="flex flex-wrap gap-2">
                      {colors.map((color) => (
                        <span
                          key={color.nombre}
                          className="flex items-center gap-2 rounded-full border border-gray-100 dark:border-white/10 bg-white dark:bg-[#1c1c1e] pl-1.5 pr-3 py-1"
                        >
                          <span
                            className="w-4 h-4 rounded-full border border-black/10 dark:border-white/20 flex-shrink-0"
                            style={{ backgroundColor: color.codigo }}
                          />
                          <span className="text-sm font-medium text-[#1d1d1f] dark:text-white">{color.nombre}</span>
                        </span>
                      ))}
                    </div>
                    <p className="flex items-center gap-2 text-[13px] font-medium text-[#0071e3] dark:text-[#0a84ff] bg-[#0071e3]/[0.06] dark:bg-[#0a84ff]/10 rounded-xl px-4 py-3">
                      <svg className="w-4 h-4 flex-shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8}>
                        <circle cx="12" cy="12" r="9" />
                        <path strokeLinecap="round" d="M12 11v5M12 8h.01" />
                      </svg>
                      Elegí un modelo arriba para ver la disponibilidad de cada color.
                    </p>
                  </div>
                ) : (
                  <div className="space-y-2">
                    {colors.map((color) => {
                      const quantity = colorStock(product, currentModel, color.nombre) ?? 0
                      const outOfStock = quantity === 0
                      const lowStock = !outOfStock && quantity <= 2

                      return (
                        <div
                          key={color.nombre}
                          className={`flex items-center gap-3 rounded-xl px-3 py-2.5 border ${
                            outOfStock
                              ? 'border-transparent bg-[#f5f5f7] dark:bg-[#2c2c2e]'
                              : 'border-gray-100 dark:border-white/10 bg-white dark:bg-[#1c1c1e]'
                          }`}
                        >
                          <span
                            className={`w-5 h-5 rounded-full border border-black/10 dark:border-white/20 flex-shrink-0 ${outOfStock ? 'opacity-50' : ''}`}
                            style={{ backgroundColor: color.codigo }}
                          />
                          <span className={`text-sm font-medium flex-1 ${outOfStock ? 'text-[#86868b]' : 'text-[#1d1d1f] dark:text-white'}`}>
                            {color.nombre}
                          </span>
                          {outOfStock ? (
                            <span className="inline-flex items-center gap-1.5 rounded-full bg-black/[0.05] dark:bg-white/[0.08] px-2.5 py-1 text-[11px] font-semibold text-[#86868b]">
                              Agotado
                            </span>
                          ) : lowStock ? (
                            <span className="inline-flex items-center gap-1.5 rounded-full bg-amber-100 dark:bg-amber-500/15 px-2.5 py-1 text-[11px] font-semibold text-amber-700 dark:text-amber-400">
                              <span className="h-1.5 w-1.5 rounded-full bg-amber-500" />
                              {quantity === 1 ? 'Última unidad' : `Quedan ${quantity}`}
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1.5 rounded-full bg-green-100 dark:bg-green-500/15 px-2.5 py-1 text-[11px] font-semibold text-green-700 dark:text-green-400">
                              <span className="h-1.5 w-1.5 rounded-full bg-green-500" />
                              En stock
                            </span>
                          )}
                        </div>
                      )
                    })}
                  </div>
                )}

                {someColorOutOfStock && (
                  <div className="mt-4 bg-amber-50 dark:bg-amber-500/10 rounded-xl p-4">
                    <p className="text-xs font-semibold text-amber-700 dark:text-amber-400 mb-2">
                      ¿Querés que te avise cuando vuelva el stock?
                    </p>
                    {notifyStatus === 'added' ? (
                      <p className="text-sm font-medium text-green-600 dark:text-green-400">
                        Listo, te avisamos apenas vuelva.
                      </p>
                    ) : notifyStatus === 'duplicate' ? (
                      <p className="text-sm font-medium text-[#0071e3]">
                        Ya estás en la lista de aviso.
                      </p>
                    ) : (
                      <div className="flex gap-2">
                        <input
                          type="email"
                          value={email}
                          onChange={(event) => {
                            setEmail(event.target.value)
                            setNotifyStatus('')
                          }}
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

            <div className="mb-5">
              <h3 className="text-[11px] font-semibold uppercase tracking-widest text-[#6e6e73] dark:text-[#86868b] mb-2">
                Especificaciones
              </h3>
              <p className="text-sm text-[#1d1d1f] dark:text-[#e5e5ea] leading-relaxed">
                {product.descripcion}
              </p>
            </div>

            {hasVideo && (
              <div className="mb-6">
                <h3 className="text-[11px] font-semibold uppercase tracking-widest text-[#6e6e73] dark:text-[#86868b] mb-2">
                  {videos.length === 1 ? 'Video del producto' : 'Videos del producto'}
                </h3>
                <div className="space-y-3">
                  {videos.map((video, index) => (
                    <ProductVideo key={video.key || video.url || index} video={video} />
                  ))}
                </div>
              </div>
            )}

            <div className="bg-[#f5f5f7] dark:bg-[#2c2c2e] rounded-xl p-4 mb-6">
              <h3 className="text-[11px] font-semibold uppercase tracking-widest text-[#0071e3] mb-2">
                Por qué lo necesitás
              </h3>
              <p className="text-sm text-[#1d1d1f] dark:text-[#e5e5ea] leading-relaxed">
                {product.por_que_lo_necesitas}
              </p>
            </div>

            <div className="flex flex-col gap-4">
              <div>
                <p className="text-2xl font-semibold text-[#1d1d1f] dark:text-white">
                  {formatPrice(product.precio)}
                </p>
                {product.precio_original && !product.ocultar_descuento_nro && (
                  <>
                    <p className="text-sm text-[#6e6e73] dark:text-[#86868b] line-through">
                      {formatPrice(product.precio_original)}
                    </p>
                    {savings > 0 && (
                      <p className="text-sm font-semibold text-green-600 dark:text-green-400">
                        Ahorras {formatPrice(savings)}
                      </p>
                    )}
                  </>
                )}
              </div>

              <div className="flex flex-col sm:flex-row sm:items-center gap-2">
                <button
                  type="button"
                  onClick={handleAddToCart}
                  disabled={!canAddToCart}
                  className="flex-1 sm:flex-none bg-[#0071e3] hover:bg-[#0077ed] disabled:bg-[#d2d2d7] dark:disabled:bg-white/10 disabled:cursor-not-allowed active:scale-95 text-white text-sm font-semibold px-5 py-3.5 rounded-full transition-all duration-200"
                >
                  {addButtonLabel}
                </button>

                <a
                  href={`https://wa.me/${WHATSAPP_NUMBER}?text=${whatsappMessage}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex-1 sm:flex-none flex items-center justify-center gap-2 bg-[#25d366] hover:bg-[#22c55e] active:scale-95 text-white text-sm font-semibold px-5 py-3.5 rounded-full transition-all duration-200 shadow-lg shadow-green-500/20"
                >
                  <WhatsAppIcon className="w-5 h-5" />
                  Consultar y cerrar por WhatsApp
                </a>
              </div>

              <p className="text-sm text-[#6e6e73] dark:text-[#86868b]">
                Sumalo al pedido o abrinos WhatsApp con el mensaje ya armado.
              </p>

              {cartFeedback === 'added' && (
                <p className="text-sm font-medium text-green-600 dark:text-green-400">
                  Producto agregado al pedido.
                </p>
              )}
              {cartFeedback === 'max_stock' && (
                <p className="text-sm font-medium text-amber-600 dark:text-amber-400">
                  Ya agregaste todo el stock visible para este producto.
                </p>
              )}
              {cartFeedback === 'missing_model' && (
                <p className="text-sm font-medium text-amber-600 dark:text-amber-400">
                  Elegí un modelo antes de agregar.
                </p>
              )}
              {cartFeedback === 'out_of_stock' && (
                <p className="text-sm font-medium text-red-500">
                  No hay stock visible para agregar este producto.
                </p>
              )}
            </div>

            <RelatedProducts
              products={relatedProducts}
              activeModel={activeModel}
              onOpenProduct={onOpenProduct}
              onAddToCart={onAddToCart}
            />
          </div>
        </div>
      </div>

      {lightboxOpen && (
        <div
          className="fixed inset-0 z-[60] flex items-center justify-center bg-black/90 p-4 animate-fade-in"
          onClick={(event) => {
            event.stopPropagation()
            setLightboxOpen(false)
          }}
        >
          <button
            onClick={(event) => {
              event.stopPropagation()
              setLightboxOpen(false)
            }}
            className="absolute top-4 right-4 w-10 h-10 flex items-center justify-center rounded-full bg-white/10 text-white hover:bg-white/20 transition-colors"
            aria-label="Cerrar"
          >
            <XIcon className="w-5 h-5" />
          </button>

          {images.length > 1 && (
            <>
              <button
                onClick={(event) => {
                  event.stopPropagation()
                  goImage(-1)
                }}
                aria-label="Foto anterior"
                className="absolute left-4 top-1/2 -translate-y-1/2 w-11 h-11 flex items-center justify-center rounded-full bg-white/10 text-white hover:bg-white/20 transition-colors"
              >
                <ChevronLeftIcon className="w-6 h-6" />
              </button>
              <button
                onClick={(event) => {
                  event.stopPropagation()
                  goImage(1)
                }}
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
            onClick={(event) => event.stopPropagation()}
            className="max-w-full max-h-[90dvh] object-contain rounded-lg cursor-zoom-out select-none"
          />
        </div>
      )}
    </div>
  )
}
