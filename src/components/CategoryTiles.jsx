import {
  CaseIcon,
  ChargerIcon,
  CableIcon,
  TemperedGlassIcon,
  CameraIcon,
  WatchIcon,
  EarbudsIcon,
  SpeakerIcon,
  SparklesIcon,
  BatteryPackIcon,
  PhoneBoltIcon,
  GridIcon,
} from './Icons'

// Icono por categoría. Si el cliente crea una categoría nueva desde el admin,
// cae en GridIcon sin romper nada.
const CATEGORY_ICONS = {
  fundas: CaseIcon,
  cargadores: ChargerIcon,
  cables: CableIcon,
  'vidrio templado': TemperedGlassIcon,
  'protectores de cámara': CameraIcon,
  'protectores de camara': CameraIcon,
  correas: WatchIcon,
  reloj: WatchIcon,
  'funda cargador': PhoneBoltIcon,
  auriculares: EarbudsIcon,
  'funda auriculares': EarbudsIcon,
  'personaliza tu funda': SparklesIcon,
  'battery pack': BatteryPackIcon,
  jbl: SpeakerIcon,
}

function iconFor(category) {
  return CATEGORY_ICONS[String(category || '').trim().toLowerCase()] || GridIcon
}

export default function CategoryTiles({ categories, onSelectCategory }) {
  if (!categories?.length) return null

  return (
    <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-20 sm:pt-24 animate-fade-in">
      <div className="grid grid-cols-3 sm:grid-cols-4 lg:grid-cols-6 gap-2.5 sm:gap-3">
        {categories.map((category) => {
          const Icon = iconFor(category)
          return (
            <button
              key={category}
              type="button"
              onClick={() => onSelectCategory(category)}
              className="group flex flex-col items-center justify-center gap-2 rounded-2xl bg-white dark:bg-[#1c1c1e] border border-black/[0.06] dark:border-white/[0.06] px-2 py-4 sm:py-5 transition-all duration-200 hover:border-[#0071e3]/40 hover:shadow-sm active:scale-[0.96]"
            >
              <span className="flex h-11 w-11 items-center justify-center rounded-full bg-[#eef4fe] dark:bg-[#0a84ff]/15 text-[#0071e3] dark:text-[#0a84ff] transition-transform duration-200 group-hover:scale-105">
                <Icon className="h-6 w-6" />
              </span>
              <span className="text-[12px] sm:text-[13px] font-medium tracking-tight leading-tight text-center text-[#1d1d1f] dark:text-white/90">
                {category}
              </span>
            </button>
          )
        })}
      </div>
    </section>
  )
}
