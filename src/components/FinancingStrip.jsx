import { DEFAULT_COMMERCIAL_BANNER } from '../data/catalogConfig'

const PAYMENT_METHODS = {
  visa: { src: '/brand-logos/visa.svg', className: 'h-4 sm:h-5 max-w-[88px]' },
  mastercard: { src: '/brand-logos/mastercard.svg', className: 'h-5 sm:h-6 max-w-[88px]' },
  'american express': { src: '/brand-logos/americanexpress.svg', className: 'h-5 sm:h-6 max-w-[92px]' },
  amex: { src: '/brand-logos/americanexpress.svg', className: 'h-5 sm:h-6 max-w-[92px]' },
  'naranja x': { src: '/brand-logos/naranjax.svg', className: 'h-4 sm:h-5 max-w-[88px]' },
  naranjax: { src: '/brand-logos/naranjax.svg', className: 'h-4 sm:h-5 max-w-[88px]' },
}

function cardAssetFor(name) {
  return PAYMENT_METHODS[String(name || '').trim().toLowerCase()] || null
}

function CardLogo({ name }) {
  const asset = cardAssetFor(name)

  if (!asset) {
    return (
      <span className="text-[12px] font-semibold text-[#1d1d1f] dark:text-white whitespace-nowrap">
        {name}
      </span>
    )
  }

  return (
    <img
      src={asset.src}
      alt={name}
      className={`${asset.className} w-auto object-contain`}
      loading="lazy"
    />
  )
}

export default function FinancingStrip({ config, preview = false }) {
  const activeConfig = config || DEFAULT_COMMERCIAL_BANNER

  if (activeConfig?.enabled === false && !preview) return null

  return (
    <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-4 pb-8">
      <div className="rounded-2xl border border-black/[0.06] dark:border-white/[0.08] bg-white/80 dark:bg-[#1c1c1e]/80 backdrop-blur-sm px-4 py-3 sm:px-5">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="min-w-0">
            <p className="text-[12px] font-semibold uppercase tracking-[0.14em] text-[#86868b]">
              {activeConfig.badge || 'Financiacion'}
            </p>
            <p className="mt-1 text-sm sm:text-[15px] font-medium text-[#1d1d1f] dark:text-white">
              {activeConfig.title || 'Hasta 6 cuotas sin interes con tarjetas seleccionadas.'}
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2 sm:justify-end">
            {(activeConfig.cards || []).map((name) => (
              <div
                key={name}
                className="flex h-10 min-w-[78px] items-center justify-center rounded-xl bg-[#f5f5f7] dark:bg-[#2c2c2e] px-3"
              >
                <CardLogo name={name} />
              </div>
            ))}
            <div className="flex h-10 min-w-[46px] items-center justify-center rounded-xl bg-[#f5f5f7] dark:bg-[#2c2c2e] px-3 text-[18px] font-semibold text-[#86868b] dark:text-[#b0b0b5]">
              +
            </div>
          </div>
        </div>

        {!!activeConfig.perks?.length && (
          <div className="mt-3 flex flex-wrap gap-2">
            {activeConfig.perks.map((perk) => (
              <span
                key={perk}
                className="rounded-full border border-black/[0.06] dark:border-white/[0.08] bg-[#fbfbfd] dark:bg-[#2c2c2e] px-3 py-1 text-[11px] font-medium text-[#6e6e73] dark:text-[#b0b0b5]"
              >
                {perk}
              </span>
            ))}
          </div>
        )}

        <p className="mt-3 text-[11px] uppercase tracking-[0.12em] text-[#86868b]">
          {activeConfig.note || 'Promocion sujeta a banco emisor y disponibilidad.'}
        </p>
      </div>
    </section>
  )
}
