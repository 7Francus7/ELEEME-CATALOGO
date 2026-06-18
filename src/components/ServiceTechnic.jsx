import { WHATSAPP_NUMBER, INSTAGRAM_URL } from '../data/products'
import {
  WrenchIcon,
  ScreenIcon,
  BatteryIcon,
  CameraIcon,
  BackGlassIcon,
  ChargingPortIcon,
  ButtonIcon,
  ChevronRightIcon,
  InstagramIcon,
} from './Icons'

// Servicios de reparación. Cada uno abre WhatsApp con un mensaje pre-cargado.
const REPAIRS = [
  { icon: ScreenIcon,       nombre: 'Pantalla',      detalle: 'Cambio de display con garantía' },
  { icon: BatteryIcon,      nombre: 'Batería',       detalle: 'Reemplazo y test de salud' },
  { icon: CameraIcon,       nombre: 'Cámara',        detalle: 'Módulo trasero y frontal' },
  { icon: BackGlassIcon,    nombre: 'Tapa trasera',  detalle: 'Vidrio posterior original' },
  { icon: ChargingPortIcon, nombre: 'Pin de carga',  detalle: 'Limpieza y recambio de puerto' },
  { icon: ButtonIcon,       nombre: 'Botones',       detalle: 'Volumen, encendido y Home' },
]

const waLink = (texto) =>
  `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(texto)}`

export default function ServiceTechnic() {
  return (
    <section className="pt-20 sm:pt-24 pb-2 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto animate-fade-in">
      <div className="relative overflow-hidden rounded-[28px] bg-[#0a0a0c] border border-white/[0.06]">

        {/* Resplandor de fondo, sutil */}
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute -top-32 -right-24 w-[460px] h-[460px] bg-[#0071e3]/[0.12] rounded-full blur-[130px]" />
          <div className="absolute -bottom-40 -left-20 w-[420px] h-[420px] bg-indigo-500/[0.08] rounded-full blur-[120px]" />
        </div>

        <div className="relative z-10 px-6 py-10 sm:px-12 sm:py-14 lg:px-16">

          {/* Encabezado */}
          <div className="max-w-2xl">
            <div className="inline-flex items-center gap-2 rounded-full bg-white/[0.06] border border-white/10 pl-2 pr-3.5 py-1.5 mb-6">
              <span className="flex items-center justify-center w-6 h-6 rounded-full bg-[#0071e3]/15">
                <WrenchIcon className="w-3.5 h-3.5 text-[#0a84ff]" />
              </span>
              <span className="text-[11px] font-semibold tracking-[0.14em] uppercase text-white/70">
                Servicio Técnico
              </span>
            </div>

            <h1 className="text-[28px] leading-[1.1] sm:text-5xl font-semibold text-white tracking-tight mb-4">
              Reparamos tu iPhone
              <span className="block text-white/40">como nuevo.</span>
            </h1>

            <p className="text-[15px] sm:text-[17px] leading-relaxed text-white/55 max-w-xl">
              Repuestos de calidad, diagnóstico sin cargo y atención directa por WhatsApp.
              Elegí qué necesitás y te respondemos al instante.
            </p>
          </div>

          {/* Grilla de reparaciones */}
          <div className="mt-9 sm:mt-11 grid grid-cols-2 lg:grid-cols-3 gap-2.5 sm:gap-3">
            {REPAIRS.map(({ icon: Icon, nombre, detalle }) => (
              <a
                key={nombre}
                href={waLink(`Hola! Quería consultar por la reparación de *${nombre}* de mi iPhone.`)}
                target="_blank"
                rel="noopener noreferrer"
                className="group relative flex items-center gap-3.5 rounded-2xl bg-white/[0.04] hover:bg-white/[0.07]
                           border border-white/[0.06] hover:border-white/[0.14] px-4 py-3.5 sm:px-5 sm:py-4
                           transition-all duration-300 active:scale-[0.98]"
              >
                <span className="flex-shrink-0 flex items-center justify-center w-11 h-11 rounded-xl bg-white/[0.06]
                                 text-white/80 group-hover:text-[#0a84ff] group-hover:bg-[#0a84ff]/10 transition-colors duration-300">
                  <Icon className="w-[22px] h-[22px]" />
                </span>

                <span className="min-w-0 flex-1">
                  <span className="block text-[15px] font-medium text-white tracking-tight">
                    {nombre}
                  </span>
                  <span className="block text-[12px] text-white/45 truncate">
                    {detalle}
                  </span>
                </span>

                <ChevronRightIcon className="flex-shrink-0 w-4 h-4 text-white/25 group-hover:text-white/60
                                             group-hover:translate-x-0.5 transition-all duration-300" />
              </a>
            ))}
          </div>

          {/* Acciones */}
          <div className="mt-9 sm:mt-11 flex flex-col sm:flex-row sm:items-center gap-4">
            <a
              href={waLink('Hola! Mi iPhone tiene una falla y me gustaría un diagnóstico.')}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center justify-center gap-2 h-12 px-7 rounded-full
                         bg-white text-black text-[15px] font-semibold tracking-tight
                         hover:bg-white/90 active:scale-[0.97] transition-all duration-200"
            >
              Diagnosticar falla
              <ChevronRightIcon className="w-4 h-4" />
            </a>

            <a
              href={INSTAGRAM_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center justify-center gap-2 h-12 px-2 sm:px-1
                         text-[15px] font-medium text-white/60 hover:text-white transition-colors duration-200"
            >
              <InstagramIcon className="w-[18px] h-[18px]" />
              Ver más en Instagram
            </a>
          </div>

        </div>
      </div>
    </section>
  )
}
