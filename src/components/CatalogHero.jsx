import { WHATSAPP_NUMBER } from '../data/catalogConfig'
import { ChevronRightIcon, WhatsAppIcon } from './Icons'

const heroWhatsAppLink = `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(
  'Hola! Quiero ver opciones y hacer un pedido.'
)}`

export default function CatalogHero({ onBrowseCatalog, productCount }) {
  return (
    <section className="pt-28 sm:pt-32 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto animate-fade-in">
      <div className="rounded-3xl bg-white dark:bg-[#1c1c1e] border border-black/[0.06] dark:border-white/[0.06] px-6 py-8 sm:px-10 sm:py-10">
        <p className="text-[11px] font-semibold tracking-[0.16em] uppercase text-[#86868b] mb-3">
          ELEEME
        </p>

        <div className="max-w-3xl">
          <h1 className="text-[30px] sm:text-[42px] leading-[1.05] font-semibold tracking-tight text-[#1d1d1f] dark:text-white">
            Accesorios para iPhone listos para elegir y pedir por WhatsApp.
          </h1>
          <p className="mt-4 text-[15px] sm:text-[17px] leading-relaxed text-[#6e6e73] dark:text-[#86868b] max-w-2xl">
            Encontrá el producto, agregalo al pedido y enviá un mensaje armado en segundos.
            Sin vueltas, sin escribir uno por uno.
          </p>
        </div>

        <div className="mt-7 flex flex-col sm:flex-row gap-3">
          <button
            type="button"
            onClick={onBrowseCatalog}
            className="inline-flex items-center justify-center gap-2 rounded-full bg-[#0071e3] hover:bg-[#0077ed] active:scale-[0.98] text-white text-sm font-semibold px-6 py-3 transition-all duration-200"
          >
            Ver catálogo
            <ChevronRightIcon className="w-4 h-4" />
          </button>

          <a
            href={heroWhatsAppLink}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center justify-center gap-2 rounded-full bg-[#25d366] hover:bg-[#22c55e] active:scale-[0.98] text-white text-sm font-semibold px-6 py-3 transition-all duration-200"
          >
            <WhatsAppIcon className="w-4 h-4" />
            Hablar por WhatsApp
          </a>
        </div>

        <div className="mt-7 grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div className="rounded-2xl bg-[#f5f5f7] dark:bg-[#2c2c2e] px-4 py-4">
            <p className="text-xs font-semibold uppercase tracking-widest text-[#86868b] mb-1">
              Compra rápida
            </p>
            <p className="text-sm text-[#1d1d1f] dark:text-white">
              Armá el pedido y enviá todo en un solo mensaje.
            </p>
          </div>
          <div className="rounded-2xl bg-[#f5f5f7] dark:bg-[#2c2c2e] px-4 py-4">
            <p className="text-xs font-semibold uppercase tracking-widest text-[#86868b] mb-1">
              Stock visible
            </p>
            <p className="text-sm text-[#1d1d1f] dark:text-white">
              Revisá disponibilidad antes de consultar.
            </p>
          </div>
          <div className="rounded-2xl bg-[#f5f5f7] dark:bg-[#2c2c2e] px-4 py-4">
            <p className="text-xs font-semibold uppercase tracking-widest text-[#86868b] mb-1">
              Catálogo activo
            </p>
            <p className="text-sm text-[#1d1d1f] dark:text-white">
              {productCount} {productCount === 1 ? 'producto cargado' : 'productos cargados'} para explorar.
            </p>
          </div>
        </div>
      </div>
    </section>
  )
}
