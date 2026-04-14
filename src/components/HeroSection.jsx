import { formatPrice } from '../data/products'
import { ChevronRightIcon } from './Icons'

export default function HeroSection({ product, onOpen }) {
  // Fallback por si no hay producto destacado en el catálogo
  if (!product) {
    return (
      <section className="pt-28 pb-6 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-[#1c1c1e] to-[#000] min-h-[300px] flex items-center justify-center text-center p-8">
          <div className="relative z-10">
            <h1 className="text-2xl sm:text-4xl font-semibold text-white mb-3">
              Bienvenido a ELEEME
            </h1>
            <p className="text-[#6e6e73] max-w-md mx-auto">
              Explorá nuestro catálogo de accesorios premium para tu ecosistema Apple.
            </p>
          </div>
        </div>
      </section>
    )
  }

  const discount = product.precio_original
    ? Math.round((1 - product.precio / product.precio_original) * 100)
    : null

  return (
    <section className="pt-28 pb-6 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto animate-fade-in">
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-[#1c1c1e] via-[#2c2c2e] to-[#1a1a2e] min-h-[400px] sm:min-h-[520px] flex items-center group">
        
        {/* Luz de fondo dinámica */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-[-10%] right-[-5%] w-[500px] h-[500px] bg-[#0071e3]/20 rounded-full blur-[120px] animate-pulse" />
          <div className="absolute bottom-[-10%] left-[10%] w-[400px] h-[400px] bg-purple-500/10 rounded-full blur-[100px]" />
        </div>

        <div className="relative z-10 grid grid-cols-1 md:grid-cols-2 gap-8 items-center w-full p-8 sm:p-12 lg:p-16">
          
          {/* Info */}
          <div className="animate-slide-up">
            <div className="flex items-center gap-3 mb-6">
              {product.tag && (
                <span className="text-[10px] font-bold tracking-[0.2em] text-[#0071e3] uppercase bg-blue-500/10 px-2.5 py-1 rounded-md">
                  {product.tag}
                </span>
              )}
              {discount && !product.ocultar_descuento_porcentaje && (
                <span className="text-xs font-bold bg-red-500 text-white px-2 py-0.5 rounded-full">
                  OFERTA
                </span>
              )}
            </div>

            <h1 className="text-4xl sm:text-6xl font-bold text-white leading-[1.1] mb-6 tracking-tight">
              {product.nombre}
            </h1>

            <p className="text-[#86868b] text-base sm:text-lg mb-8 leading-relaxed max-w-md">
              {product.descripcion.split('.')[0]}.
            </p>

            <div className="flex items-center gap-5 mb-10">
              <div className="flex flex-col">
                <span className="text-3xl sm:text-4xl font-semibold text-white tracking-tight">
                  {formatPrice(product.precio)}
                </span>
                {product.precio_original && !product.ocultar_descuento_nro && (
                  <span className="text-[#6e6e73] line-through text-sm sm:text-base">
                    {formatPrice(product.precio_original)} {!product.ocultar_descuento_porcentaje && `(−${discount}%)`}
                  </span>
                )}
              </div>
            </div>

            <button
              onClick={() => onOpen(product)}
              className="inline-flex items-center gap-2 bg-white hover:bg-[#f5f5f7] active:scale-95 text-black text-sm sm:text-base font-semibold px-8 py-4 rounded-full transition-all duration-300 shadow-xl shadow-white/5"
            >
              Comprar ahora
              <ChevronRightIcon className="w-5 h-5" />
            </button>
          </div>

          {/* Imagen Hero */}
          <div className="relative flex items-center justify-center md:justify-end animate-fade-in stagger-3">
            <div className="relative w-full max-w-[320px] sm:max-w-[400px] aspect-square flex items-center justify-center">
              {/* Brillo detrás de la imagen */}
              <div className="absolute inset-0 bg-white/5 rounded-full blur-3xl scale-75 group-hover:scale-100 transition-transform duration-700" />
              <img
                src={product.imagen_url}
                alt={product.nombre}
                className="relative z-10 w-full h-full object-contain drop-shadow-[0_20px_50px_rgba(0,0,0,0.5)] group-hover:scale-105 transition-transform duration-700"
                onError={(e) => { e.target.style.display = 'none' }}
              />
            </div>
          </div>

        </div>
      </div>
    </section>
  )
}

