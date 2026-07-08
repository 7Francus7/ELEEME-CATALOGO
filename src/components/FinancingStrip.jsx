import { useEffect, useState } from 'react'
import { DEFAULT_COMMERCIAL_BANNER } from '../data/catalogConfig'

const PAYMENT_METHODS = {
  visa: { src: '/brand-logos/visa.svg', className: 'h-3.5 max-w-[64px]' },
  mastercard: { src: '/brand-logos/mastercard.svg', className: 'h-5 max-w-[64px]' },
  'american express': { src: '/brand-logos/americanexpress.svg', className: 'h-5 max-w-[64px]' },
  amex: { src: '/brand-logos/americanexpress.svg', className: 'h-5 max-w-[64px]' },
  'naranja x': { src: '/brand-logos/naranjax.svg', className: 'h-3.5 max-w-[64px]' },
  naranjax: { src: '/brand-logos/naranjax.svg', className: 'h-3.5 max-w-[64px]' },
}

function cardAssetFor(name) {
  return PAYMENT_METHODS[String(name || '').trim().toLowerCase()] || null
}

function CardLogo({ name }) {
  const asset = cardAssetFor(name)

  if (!asset) {
    return (
      <span className="text-[12px] font-semibold text-[#1d1d1f] whitespace-nowrap">
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

// Burbujita compacta de financiación: texto fijo + logos de tarjetas que van
// rotando solos (Visa → Mastercard → Naranja X).
export default function FinancingStrip({ config, preview = false }) {
  const activeConfig = config || DEFAULT_COMMERCIAL_BANNER
  const cards = activeConfig.cards?.length ? activeConfig.cards : DEFAULT_COMMERCIAL_BANNER.cards
  const [cardIndex, setCardIndex] = useState(0)

  useEffect(() => {
    if (cards.length < 2) return undefined
    const id = setInterval(() => setCardIndex((index) => index + 1), 2000)
    return () => clearInterval(id)
  }, [cards.length])

  if (activeConfig?.enabled === false && !preview) return null

  const currentCard = cards[cardIndex % cards.length]

  return (
    <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-4 flex flex-col items-center">
      <div className="inline-flex items-center gap-2.5 rounded-full border border-black/[0.06] dark:border-white/[0.08] bg-white dark:bg-[#1c1c1e] shadow-sm pl-4 pr-2 py-1.5">
        <span className="relative flex h-2 w-2">
          <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-[#34c759] opacity-60" />
          <span className="relative inline-flex h-2 w-2 rounded-full bg-[#34c759]" />
        </span>
        <span className="text-[13px] sm:text-sm font-semibold tracking-tight text-[#1d1d1f] dark:text-white whitespace-nowrap">
          {activeConfig.title || '3 cuotas sin interes'}
        </span>
        <span
          key={currentCard}
          className="flex h-8 min-w-[64px] items-center justify-center rounded-full bg-[#f5f5f7] dark:bg-white px-3 animate-card-swap"
        >
          <CardLogo name={currentCard} />
        </span>
      </div>
      {!!activeConfig.note && (
        <p className="mt-1.5 text-[11px] font-medium tracking-tight text-[#86868b]">
          {activeConfig.note}
        </p>
      )}
    </section>
  )
}
