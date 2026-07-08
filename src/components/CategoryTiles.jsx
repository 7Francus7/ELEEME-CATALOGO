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

// Icono por palabra clave: el cliente renombra categorías desde el admin
// ("Protectores de Cámaras", "Agarres / Correas", "Parlantes"...), así que
// matcheamos por contenido y no por nombre exacto. Orden importa: lo más
// específico primero.
const ICON_RULES = [
  { keywords: ['funda cargador'], icon: PhoneBoltIcon },
  { keywords: ['funda auricular'], icon: EarbudsIcon },
  { keywords: ['personaliza'], icon: SparklesIcon },
  { keywords: ['battery', 'bateria', 'batería'], icon: BatteryPackIcon },
  { keywords: ['funda'], icon: CaseIcon },
  { keywords: ['cargador'], icon: ChargerIcon },
  { keywords: ['cable'], icon: CableIcon },
  { keywords: ['vidrio', 'templado'], icon: TemperedGlassIcon },
  { keywords: ['camara', 'cámara', 'protector'], icon: CameraIcon },
  { keywords: ['correa', 'agarre', 'malla', 'reloj', 'watch'], icon: WatchIcon },
  { keywords: ['auricular', 'airpod'], icon: EarbudsIcon },
  { keywords: ['parlante', 'jbl', 'speaker'], icon: SpeakerIcon },
]

function iconFor(category) {
  const name = String(category || '').trim().toLowerCase()
  const rule = ICON_RULES.find(({ keywords }) => keywords.some((keyword) => name.includes(keyword)))
  return rule?.icon || GridIcon
}

export default function CategoryTiles({ categories, onSelectCategory }) {
  if (!categories?.length) return null

  return (
    <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-20 sm:pt-24 animate-fade-in">
      {/* flex-wrap centrado: la última fila queda centrada en vez de dejar huecos */}
      <div className="mx-auto flex max-w-4xl flex-wrap justify-center gap-2 sm:gap-2.5">
        {categories.map((category) => {
          const Icon = iconFor(category)
          return (
            <button
              key={category}
              type="button"
              onClick={() => onSelectCategory(category)}
              className="group flex w-[calc(33.333%-0.375rem)] sm:w-[122px] flex-col items-center justify-center gap-1.5 rounded-2xl bg-white dark:bg-[#1c1c1e] border border-black/[0.06] dark:border-white/[0.06] px-1.5 py-3 sm:py-3.5 transition-all duration-200 hover:border-[#0071e3]/40 hover:shadow-sm active:scale-[0.96]"
            >
              <span className="flex h-9 w-9 items-center justify-center rounded-full bg-[#eef4fe] dark:bg-[#0a84ff]/15 text-[#0071e3] dark:text-[#0a84ff] transition-transform duration-200 group-hover:scale-105">
                <Icon className="h-5 w-5" />
              </span>
              <span className="text-[11px] sm:text-[12px] font-medium tracking-tight leading-tight text-center text-[#1d1d1f] dark:text-white/90">
                {category}
              </span>
            </button>
          )
        })}
      </div>
    </section>
  )
}
