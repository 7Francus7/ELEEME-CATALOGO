import { INSTAGRAM_URL, WHATSAPP_NUMBER } from '../data/catalogConfig'
import {
  ScreenIcon,
  BatteryIcon,
  CameraIcon,
  BackGlassIcon,
  ChargingPortIcon,
  ButtonIcon,
  OtherRepairIcon,
  ChevronRightIcon,
  WhatsAppIcon,
} from './Icons'

const heroWhatsAppLink = `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(
  'Hola! Quiero ver opciones y hacer un pedido.'
)}`

const REPAIRS = [
  { icon: ScreenIcon, name: 'Pantalla' },
  { icon: BatteryIcon, name: 'Bateria' },
  { icon: CameraIcon, name: 'Camara' },
  { icon: BackGlassIcon, name: 'Tapa trasera' },
  { icon: ChargingPortIcon, name: 'Pin de carga' },
  { icon: ButtonIcon, name: 'Botones' },
  {
    icon: OtherRepairIcon,
    name: 'Otro arreglo',
    message: 'Hola! Mi iPhone tiene otra falla o no se bien que necesita. Me ayudan?',
  },
]

const waLink = (text) => `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(text)}`

export default function CatalogHero({ onBrowseCatalog, compactTop = false }) {
  return (
    <section
      className={`px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto animate-fade-in ${
        compactTop ? 'pt-8 sm:pt-10' : 'pt-28 sm:pt-32'
      }`}
    >
      <div className="rounded-3xl bg-white dark:bg-[#1c1c1e] border border-black/[0.06] dark:border-white/[0.06] px-6 py-8 sm:px-10 sm:py-10">
        <p className="text-[11px] font-semibold tracking-[0.16em] uppercase text-[#86868b] mb-3">
          ELEEME
        </p>

        <div className="max-w-4xl">
          <h1 className="text-[30px] sm:text-[42px] leading-[1.05] font-semibold tracking-tight text-[#1d1d1f] dark:text-white">
            Accesorios para iPhone listos para elegir y pedir por WhatsApp.
          </h1>
          <p className="mt-4 text-[15px] sm:text-[17px] leading-relaxed text-[#6e6e73] dark:text-[#86868b] max-w-3xl">
            Encontra el producto, agregalo al pedido y envia un mensaje armado en segundos.
            Sin vueltas, sin escribir uno por uno.
          </p>
        </div>

        <div className="mt-7 flex flex-col sm:flex-row gap-3">
          <button
            type="button"
            onClick={onBrowseCatalog}
            className="inline-flex items-center justify-center gap-2 rounded-full bg-[#0071e3] hover:bg-[#0077ed] active:scale-[0.98] text-white text-sm font-semibold px-6 py-3 transition-all duration-200"
          >
            Ver catalogo
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

        <div className="mt-8 border-t border-black/[0.06] dark:border-white/[0.08] pt-8">
          <p className="text-[11px] font-semibold tracking-[0.16em] uppercase text-[#86868b] mb-3">
            Servicio tecnico
          </p>
          <h2 className="text-[24px] sm:text-[30px] leading-[1.1] font-semibold tracking-tight text-[#1d1d1f] dark:text-white">
            Tambien necesitas reparar tu iPhone?
          </h2>
          <p className="mt-3 text-[15px] leading-relaxed text-[#6e6e73] dark:text-[#86868b] max-w-3xl">
            Si ademas tenes una falla, podes abrir una consulta rapida por WhatsApp desde aca
            sin salir del catalogo.
          </p>

          <div className="mt-7 flex flex-wrap gap-2">
            {REPAIRS.map(({ icon: Icon, name, message }) => (
              <a
                key={name}
                href={waLink(message || `Hola! Queria consultar por la reparacion de ${name} de mi iPhone.`)}
                target="_blank"
                rel="noopener noreferrer"
                className="group inline-flex items-center gap-2 h-10 pl-3 pr-3.5 rounded-full border border-black/[0.08] dark:border-white/[0.10] text-[#1d1d1f] dark:text-white/90 hover:border-[#0071e3] hover:text-[#0071e3] transition-colors duration-200 active:scale-[0.97]"
              >
                <Icon className="w-[18px] h-[18px] text-[#86868b] group-hover:text-current transition-colors duration-200" />
                <span className="text-[13px] font-medium tracking-tight">{name}</span>
              </a>
            ))}
          </div>

          <div className="mt-6 flex flex-col sm:flex-row sm:items-center gap-4 sm:gap-6">
            <a
              href={waLink('Hola! Mi iPhone tiene una falla y me gustaria un diagnostico.')}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 text-[15px] font-semibold tracking-tight text-[#0071e3] hover:gap-2.5 transition-all duration-200"
            >
              Diagnosticar falla
              <ChevronRightIcon className="w-4 h-4" />
            </a>

            <a
              href={INSTAGRAM_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="text-[15px] font-medium text-[#86868b] hover:text-[#1d1d1f] dark:hover:text-white transition-colors duration-200"
            >
              Ver Instagram
            </a>
          </div>
        </div>
      </div>
    </section>
  )
}
