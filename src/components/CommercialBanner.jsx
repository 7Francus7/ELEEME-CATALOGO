import { XIcon } from './Icons'

const CARD_THEMES = [
  'from-[#1a4fff] via-[#2b63ff] to-[#7fa5ff]',
  'from-[#111111] via-[#303030] to-[#585858]',
  'from-[#ef4444] via-[#f97316] to-[#facc15]',
  'from-[#0f766e] via-[#14b8a6] to-[#5eead4]',
]

function cardThemeFor(name, index) {
  const value = String(name || '').toLowerCase()
  if (value.includes('visa')) return 'from-[#0a47ff] via-[#1e63ff] to-[#79a1ff]'
  if (value.includes('master')) return 'from-[#111111] via-[#373737] to-[#686868]'
  if (value.includes('american') || value.includes('amex')) return 'from-[#0369a1] via-[#0ea5e9] to-[#7dd3fc]'
  if (value.includes('naranja')) return 'from-[#ea580c] via-[#f97316] to-[#fdba74]'
  return CARD_THEMES[index % CARD_THEMES.length]
}

function PaymentCard({ name, index }) {
  const value = String(name || '').trim()
  if (!value) return null

  return (
    <div
      className={`relative overflow-hidden rounded-[22px] border border-white/15 bg-gradient-to-br ${cardThemeFor(value, index)} px-4 py-3 text-white shadow-lg shadow-black/10`}
    >
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-[10px] font-black uppercase tracking-[0.22em] text-white/75">Tarjeta</p>
          <p className="mt-2 text-sm font-black tracking-tight">{value}</p>
        </div>
        <div className="relative h-8 w-12 flex-shrink-0">
          <span className="absolute left-0 top-1 h-6 w-6 rounded-full bg-white/90" />
          <span className="absolute right-0 top-1 h-6 w-6 rounded-full bg-white/45" />
        </div>
      </div>
    </div>
  )
}

export default function CommercialBanner({ config, onDismiss, preview = false }) {
  if (!config?.enabled && !preview) return null

  const badge = config?.badge || 'Cuotas sin interes'
  const title = config?.title || 'Hasta 6 cuotas sin interes'
  const description = config?.description || ''
  const note = config?.note || ''
  const cards = config?.cards || []
  const perks = config?.perks || []

  return (
    <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-4">
      <div className="relative overflow-hidden rounded-[32px] border border-[#f5c087]/50 bg-[linear-gradient(135deg,#1d1d1f_0%,#4a2d14_45%,#f97316_100%)] px-5 py-5 text-white shadow-[0_24px_80px_rgba(146,64,14,0.24)] sm:px-7 sm:py-6">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(255,255,255,0.18),transparent_34%),radial-gradient(circle_at_bottom_right,rgba(255,214,170,0.24),transparent_30%)]" />
        {!preview && onDismiss && (
          <button
            type="button"
            onClick={onDismiss}
            aria-label="Cerrar banner de cuotas"
            className="absolute right-3 top-3 z-10 rounded-full border border-white/15 bg-white/10 p-2 text-white/80 transition hover:bg-white/15 hover:text-white"
          >
            <XIcon className="h-4 w-4" />
          </button>
        )}

        <div className="relative grid gap-5 lg:grid-cols-[minmax(0,1.35fr)_minmax(280px,0.95fr)] lg:items-center">
          <div>
            <span className="inline-flex rounded-full border border-white/20 bg-white/12 px-3 py-1 text-[10px] font-black uppercase tracking-[0.24em] text-white/85">
              {badge}
            </span>
            <h2 className="mt-4 max-w-xl text-2xl font-black tracking-tight text-white sm:text-[2rem] sm:leading-[1.05]">
              {title}
            </h2>
            <p className="mt-3 max-w-2xl text-sm font-medium leading-relaxed text-white/82 sm:text-[15px]">
              {description}
            </p>

            {!!perks.length && (
              <div className="mt-5 flex flex-wrap gap-2.5">
                {perks.map((perk) => (
                  <span
                    key={perk}
                    className="rounded-full border border-white/16 bg-black/18 px-3 py-1.5 text-[11px] font-bold text-white/92 backdrop-blur"
                  >
                    {perk}
                  </span>
                ))}
              </div>
            )}

            {note && (
              <p className="mt-4 text-[11px] font-medium uppercase tracking-[0.14em] text-white/62">
                {note}
              </p>
            )}
          </div>

          <div className="rounded-[28px] border border-white/14 bg-white/10 p-4 backdrop-blur-md">
            <div className="flex items-center justify-between gap-3">
              <div>
                <p className="text-[10px] font-black uppercase tracking-[0.22em] text-white/65">Tarjetas</p>
                <p className="mt-1 text-lg font-black tracking-tight text-white">Medios de pago destacados</p>
              </div>
              <div className="rounded-full bg-white/12 px-3 py-1 text-[10px] font-black uppercase tracking-[0.22em] text-white/78">
                Sin interes
              </div>
            </div>

            <div className="mt-4 grid gap-3 sm:grid-cols-2">
              {cards.map((card, index) => (
                <PaymentCard key={`${card}-${index}`} name={card} index={index} />
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
