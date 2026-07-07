import { XIcon } from './Icons'

function MastercardLogo() {
  return (
    <div
      className="flex h-10 min-w-[72px] items-center justify-center rounded-xl px-3 shadow-sm"
      style={{ backgroundColor: '#101010' }}
    >
      <div className="flex items-center">
        <span
          className="h-5 w-5 rounded-full"
          style={{ backgroundColor: '#eb001b' }}
        />
        <span
          className="-ml-1.5 h-5 w-5 rounded-full"
          style={{ backgroundColor: '#f79e1b' }}
        />
      </div>
    </div>
  )
}

function TextLogo({ label, className, compact = false, labelClassName = '', backgroundColor }) {
  return (
    <div
      className={`flex h-10 items-center justify-center rounded-xl px-3 shadow-sm ${className}`}
      style={{ backgroundColor }}
    >
      <span
        className={`font-black uppercase tracking-tight ${compact ? 'text-[9px]' : 'text-[12px]'} ${labelClassName}`}
        style={{ color: '#ffffff' }}
      >
        {label}
      </span>
    </div>
  )
}

function GenericLogo() {
  return (
    <div
      className="flex h-10 min-w-[62px] items-center justify-center rounded-xl px-3 shadow-sm"
      style={{ backgroundColor: '#0d4f93' }}
    >
      <div className="flex h-4 w-4 rotate-45 items-center justify-center border-2 border-white/90">
        <div className="h-1.5 w-1.5 rotate-45 bg-white/90" />
      </div>
    </div>
  )
}

function PaymentLogo({ name }) {
  const value = String(name || '').trim()
  if (!value) return null

  const normalized = value.toLowerCase()

  if (normalized.includes('master')) return <MastercardLogo />
  if (normalized.includes('visa')) {
    return <TextLogo label="VISA" className="min-w-[66px]" backgroundColor="#1a46a7" />
  }
  if (normalized.includes('american') || normalized.includes('amex')) {
    return <TextLogo label="AMERICAN EXPRESS" className="min-w-[96px]" backgroundColor="#33a7df" compact />
  }
  if (normalized.includes('naranja')) {
    return <TextLogo label="N" className="min-w-[58px]" backgroundColor="#ff7a00" labelClassName="text-[18px] leading-none" />
  }
  if (normalized.includes('credi')) {
    return <TextLogo label="CREDIMAS" className="min-w-[74px]" backgroundColor="#e53935" compact />
  }

  return <GenericLogo />
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
    <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 sm:pt-10">
      <div className="relative overflow-hidden rounded-[28px] border border-black/[0.06] bg-white px-5 py-5 shadow-sm sm:px-6">
        {!preview && onDismiss && (
          <button
            type="button"
            onClick={onDismiss}
            aria-label="Cerrar banner de cuotas"
            className="absolute right-3 top-3 rounded-full bg-[#f5f5f7] p-2 text-[#86868b] transition hover:bg-[#ebebef] hover:text-[#1d1d1f]"
          >
            <XIcon className="h-4 w-4" />
          </button>
        )}

        <div className="flex flex-col gap-4">
          <div className="max-w-3xl pr-10">
            <span className="inline-flex rounded-full bg-[#f5f5f7] px-3 py-1 text-[10px] font-black uppercase tracking-[0.22em] text-[#6e6e73]">
              {badge}
            </span>
            <h2 className="mt-3 text-[22px] font-semibold tracking-tight text-[#1d1d1f] sm:text-[26px]">
              {title}
            </h2>
            {description && (
              <p className="mt-2 text-[14px] leading-relaxed text-[#6e6e73] sm:text-[15px]">
                {description}
              </p>
            )}
          </div>

          {!!cards.length && (
            <div className="rounded-[22px] bg-[#f5f5f7] px-3 py-3 sm:px-4">
              <div className="flex flex-wrap items-center gap-2.5">
                {cards.map((card, index) => (
                  <PaymentLogo key={`${card}-${index}`} name={card} />
                ))}
              </div>
            </div>
          )}

          {(perks.length > 0 || note) && (
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              {!!perks.length && (
                <div className="flex flex-wrap gap-2">
                  {perks.map((perk) => (
                    <span
                      key={perk}
                      className="rounded-full border border-black/[0.06] bg-[#fbfbfd] px-3 py-1.5 text-[11px] font-semibold text-[#6e6e73]"
                    >
                      {perk}
                    </span>
                  ))}
                </div>
              )}
              {note && (
                <p className="text-[11px] font-medium uppercase tracking-[0.12em] text-[#86868b]">
                  {note}
                </p>
              )}
            </div>
          )}
        </div>
      </div>
    </section>
  )
}
