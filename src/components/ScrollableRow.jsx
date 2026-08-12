import { useEffect, useRef, useState } from 'react'
import { ChevronLeftIcon, ChevronRightIcon } from './Icons'

// Fila horizontal con flechas que aparecen sólo cuando hay algo más para ver.
// En mobile se arrastra con el dedo; en desktop no hay swipe y la barra de
// scroll está oculta, así que sin estas flechas el contenido de más a la
// derecha queda inalcanzable.
export default function ScrollableRow({
  ariaLabel,
  children,
  rowClassName = '',
  className = 'relative pb-3',
  // Dónde se paran las flechas. En filas altas (cards) el centro exacto cae
  // sobre el texto, así que quien la usa puede subirlas al área de la foto.
  arrowPosition = 'top-1/2 -translate-y-1/2',
}) {
  const rowRef = useRef(null)
  const [canScrollLeft, setCanScrollLeft] = useState(false)
  const [canScrollRight, setCanScrollRight] = useState(false)

  useEffect(() => {
    const row = rowRef.current
    if (!row) return undefined

    const updateScrollState = () => {
      const maxScroll = row.scrollWidth - row.clientWidth
      setCanScrollLeft(row.scrollLeft > 8)
      setCanScrollRight(maxScroll > 8 && row.scrollLeft < maxScroll - 8)
    }

    updateScrollState()
    row.addEventListener('scroll', updateScrollState, { passive: true })
    window.addEventListener('resize', updateScrollState)

    const resizeObserver = window.ResizeObserver
      ? new ResizeObserver(updateScrollState)
      : null
    resizeObserver?.observe(row)

    return () => {
      row.removeEventListener('scroll', updateScrollState)
      window.removeEventListener('resize', updateScrollState)
      resizeObserver?.disconnect()
    }
  }, [children])

  const scrollByStep = (direction) => {
    const row = rowRef.current
    if (!row) return
    row.scrollBy({
      left: direction * Math.max(row.clientWidth * 0.75, 180),
      behavior: 'smooth',
    })
  }

  return (
    <div className={className}>
      {canScrollLeft && (
        <button
          type="button"
          onClick={() => scrollByStep(-1)}
          aria-label={`${ariaLabel}: mover a la izquierda`}
          className={`absolute left-0 z-10 ${arrowPosition} h-8 w-8 rounded-full border border-gray-200/80 bg-white/95 text-[#1d1d1f] shadow-sm transition-colors hover:border-[#0071e3] hover:text-[#0071e3] dark:border-white/10 dark:bg-black/90 dark:text-white`}
        >
          <ChevronLeftIcon className="m-auto h-4 w-4" />
        </button>
      )}

      {canScrollRight && (
        <button
          type="button"
          onClick={() => scrollByStep(1)}
          aria-label={`${ariaLabel}: mover a la derecha`}
          className={`absolute right-0 z-10 ${arrowPosition} h-8 w-8 rounded-full border border-gray-200/80 bg-white/95 text-[#1d1d1f] shadow-sm transition-colors hover:border-[#0071e3] hover:text-[#0071e3] dark:border-white/10 dark:bg-black/90 dark:text-white`}
        >
          <ChevronRightIcon className="m-auto h-4 w-4" />
        </button>
      )}

      <div
        ref={rowRef}
        className={`overflow-x-auto scrollbar-hide ${canScrollLeft ? 'pl-10' : ''} ${canScrollRight ? 'pr-10' : ''}`}
      >
        <div className={rowClassName}>
          {children}
        </div>
      </div>
    </div>
  )
}
