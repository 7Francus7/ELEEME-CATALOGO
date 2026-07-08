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
} from './Icons'

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

// Tarjeta de servicio técnico: chips de reparación que abren WhatsApp con
// mensaje pre-armado. Es lo único que va arriba del catálogo junto a los tiles.
export default function CatalogHero() {
  return (
    <section className="px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto pt-6 sm:pt-8 animate-fade-in">
      <div className="rounded-3xl bg-white dark:bg-[#1c1c1e] border border-black/[0.06] dark:border-white/[0.06] px-6 py-7 sm:px-10 sm:py-9">
        <p className="text-[11px] font-semibold tracking-[0.16em] uppercase text-[#86868b] mb-3">
          Servicio tecnico
        </p>
        <h1 className="text-[24px] sm:text-[30px] leading-[1.1] font-semibold tracking-tight text-[#1d1d1f] dark:text-white">
          Reparamos tu iPhone.
        </h1>
        <p className="mt-3 text-[15px] leading-relaxed text-[#6e6e73] dark:text-[#86868b] max-w-3xl">
          Elegi la falla y abri una consulta rapida por WhatsApp sin salir del catalogo.
        </p>

        <div className="mt-6 flex flex-wrap gap-2">
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

        <p className="mt-4 text-[13px] font-medium tracking-tight text-[#86868b]">
          Todos los modelos, del iPhone 11 al iPhone 17 Pro Max.
        </p>

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
    </section>
  )
}
