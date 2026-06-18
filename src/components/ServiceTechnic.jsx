import { WHATSAPP_NUMBER, INSTAGRAM_URL } from '../data/products'
import {
  ScreenIcon,
  BatteryIcon,
  CameraIcon,
  BackGlassIcon,
  ChargingPortIcon,
  ButtonIcon,
  ChevronRightIcon,
} from './Icons'

// Servicios de reparación. Cada uno abre WhatsApp con un mensaje pre-cargado.
const REPAIRS = [
  { icon: ScreenIcon,       nombre: 'Pantalla' },
  { icon: BatteryIcon,      nombre: 'Batería' },
  { icon: CameraIcon,       nombre: 'Cámara' },
  { icon: BackGlassIcon,    nombre: 'Tapa trasera' },
  { icon: ChargingPortIcon, nombre: 'Pin de carga' },
  { icon: ButtonIcon,       nombre: 'Botones' },
]

const waLink = (texto) =>
  `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(texto)}`

export default function ServiceTechnic() {
  return (
    <section className="pt-20 sm:pt-24 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto animate-fade-in">
      <div className="rounded-3xl bg-white dark:bg-[#1c1c1e] border border-black/[0.06] dark:border-white/[0.06] px-6 py-8 sm:px-10 sm:py-10">

        {/* Encabezado */}
        <p className="text-[11px] font-semibold tracking-[0.16em] uppercase text-[#86868b] mb-3">
          Servicio Técnico
        </p>
        <h1 className="text-[26px] sm:text-[34px] leading-[1.15] font-semibold tracking-tight text-[#1d1d1f] dark:text-white max-w-xl">
          Reparamos tu iPhone
          <span className="text-[#86868b]"> con repuestos de calidad.</span>
        </h1>

        {/* Chips de reparación */}
        <div className="mt-7 flex flex-wrap gap-2">
          {REPAIRS.map(({ icon: Icon, nombre }) => (
            <a
              key={nombre}
              href={waLink(`Hola! Quería consultar por la reparación de *${nombre}* de mi iPhone.`)}
              target="_blank"
              rel="noopener noreferrer"
              className="group inline-flex items-center gap-2 h-9 pl-3 pr-3.5 rounded-full
                         border border-black/[0.08] dark:border-white/[0.10]
                         text-[#1d1d1f] dark:text-white/90
                         hover:border-[#0071e3] hover:text-[#0071e3] dark:hover:text-[#0a84ff]
                         transition-colors duration-200 active:scale-[0.97]"
            >
              <Icon className="w-[18px] h-[18px] text-[#86868b] group-hover:text-current transition-colors duration-200" />
              <span className="text-[13px] font-medium tracking-tight">{nombre}</span>
            </a>
          ))}
        </div>

        {/* Acciones */}
        <div className="mt-8 flex items-center gap-5">
          <a
            href={waLink('Hola! Mi iPhone tiene una falla y me gustaría un diagnóstico.')}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 text-[15px] font-semibold tracking-tight
                       text-[#0071e3] dark:text-[#0a84ff] hover:gap-2.5 transition-all duration-200"
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
            Instagram
          </a>
        </div>

      </div>
    </section>
  )
}
