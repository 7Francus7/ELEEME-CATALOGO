import { WHATSAPP_NUMBER, INSTAGRAM_URL } from '../data/catalogConfig'
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
  { icon: ScreenIcon, nombre: 'Pantalla' },
  { icon: BatteryIcon, nombre: 'Batería' },
  { icon: CameraIcon, nombre: 'Cámara' },
  { icon: BackGlassIcon, nombre: 'Tapa trasera' },
  { icon: ChargingPortIcon, nombre: 'Pin de carga' },
  { icon: ButtonIcon, nombre: 'Botones' },
  {
    icon: OtherRepairIcon,
    nombre: 'Otro arreglo',
    mensaje: 'Hola! Mi iPhone tiene otra falla / no sé bien qué necesita. ¿Me pueden ayudar?',
  },
]

const waLink = (text) => `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(text)}`

export default function ServiceTechnic() {
  return (
    <section className="px-4 sm:px-6 lg:px-8 pb-16 max-w-7xl mx-auto">
      <div className="rounded-3xl bg-white dark:bg-[#1c1c1e] border border-black/[0.06] dark:border-white/[0.06] px-6 py-8 sm:px-10">
        <div className="max-w-2xl">
          <p className="text-[11px] font-semibold tracking-[0.16em] uppercase text-[#86868b] mb-3">
            Servicio técnico
          </p>
          <h2 className="text-[24px] sm:text-[30px] leading-[1.1] font-semibold tracking-tight text-[#1d1d1f] dark:text-white">
            ¿También necesitás reparar tu iPhone?
          </h2>
          <p className="mt-3 text-[15px] leading-relaxed text-[#6e6e73] dark:text-[#86868b]">
            El catálogo sigue siendo la ruta principal. Si además tenés una falla, podés abrir una consulta rápida por WhatsApp desde acá.
          </p>
        </div>

        <div className="mt-7 flex flex-wrap gap-2">
          {REPAIRS.map(({ icon: Icon, nombre, mensaje }) => (
            <a
              key={nombre}
              href={waLink(mensaje || `Hola! Quería consultar por la reparación de *${nombre}* de mi iPhone.`)}
              target="_blank"
              rel="noopener noreferrer"
              className="group inline-flex items-center gap-2 h-9 pl-3 pr-3.5 rounded-full border border-black/[0.08] dark:border-white/[0.10] text-[#1d1d1f] dark:text-white/90 hover:border-[#0071e3] hover:text-[#0071e3] transition-colors duration-200 active:scale-[0.97]"
            >
              <Icon className="w-[18px] h-[18px] text-[#86868b] group-hover:text-current transition-colors duration-200" />
              <span className="text-[13px] font-medium tracking-tight">{nombre}</span>
            </a>
          ))}
        </div>

        <div className="mt-6 flex flex-col sm:flex-row sm:items-center gap-4 sm:gap-6">
          <a
            href={waLink('Hola! Mi iPhone tiene una falla y me gustaría un diagnóstico.')}
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

      {/* Financiación: 3 cuotas sin interés en compras superiores a $50.000 */}
      <div className="mt-4 rounded-2xl bg-[#0071e3]/[0.06] dark:bg-[#0a84ff]/[0.10]
                      border border-[#0071e3]/15 dark:border-[#0a84ff]/20
                      px-5 py-4 sm:px-6 flex items-center gap-3.5">
        <span className="flex-none inline-flex items-center justify-center w-9 h-9 rounded-full
                         bg-[#0071e3] dark:bg-[#0a84ff] text-white text-[15px] font-semibold tracking-tight">
          3×
        </span>
        <p className="text-[13px] sm:text-[14px] leading-snug font-medium tracking-tight text-[#1d1d1f] dark:text-white">
          <span className="font-semibold text-[#0071e3] dark:text-[#0a84ff]">3 cuotas sin interés</span>
          {' '}en todos nuestros productos superando los $50.000.
        </p>
      </div>
    </section>
  )
}
