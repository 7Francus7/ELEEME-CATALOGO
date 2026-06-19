import { useEffect, useRef, useState } from 'react'
import {
  SearchIcon,
  XIcon,
  SunIcon,
  MoonIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
} from './Icons'

function ScrollableChipsRow({ ariaLabel, children, rowClassName = '' }) {
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
    <div className="relative pb-3">
      {canScrollLeft && (
        <button
          type="button"
          onClick={() => scrollByStep(-1)}
          aria-label={`${ariaLabel}: mover a la izquierda`}
          className="absolute left-0 top-1/2 z-10 -translate-y-1/2 h-8 w-8 rounded-full border border-gray-200/80 bg-white/95 text-[#1d1d1f] shadow-sm transition-colors hover:border-[#0071e3] hover:text-[#0071e3] dark:border-white/10 dark:bg-black/90 dark:text-white"
        >
          <ChevronLeftIcon className="m-auto h-4 w-4" />
        </button>
      )}

      {canScrollRight && (
        <button
          type="button"
          onClick={() => scrollByStep(1)}
          aria-label={`${ariaLabel}: mover a la derecha`}
          className="absolute right-0 top-1/2 z-10 -translate-y-1/2 h-8 w-8 rounded-full border border-gray-200/80 bg-white/95 text-[#1d1d1f] shadow-sm transition-colors hover:border-[#0071e3] hover:text-[#0071e3] dark:border-white/10 dark:bg-black/90 dark:text-white"
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

export default function Header({
  categories,
  selectedCategory,
  onCategoryChange,
  models = [],
  selectedModel,
  onModelChange,
  searchQuery,
  onSearchChange,
  isDark,
  onToggleDark,
  onGoHome,
}) {
  const [searchOpen, setSearchOpen] = useState(false)

  const handleCloseSearch = () => {
    setSearchOpen(false)
    onSearchChange('')
  }

  const isHome = selectedCategory === 'Todos' && !searchQuery

  return (
    <header className="fixed top-0 left-0 right-0 z-40 bg-white/80 backdrop-blur-xl border-b border-gray-200/60 dark:bg-black/80 dark:border-white/10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center h-14 gap-3">
          {!searchOpen && !isHome && (
            <button
              onClick={onGoHome}
              className="flex-shrink-0 flex items-center gap-1 -ml-1 pr-1 text-[#1d1d1f] transition-colors hover:text-[#0071e3] dark:text-white dark:hover:text-[#0071e3]"
              aria-label="Volver al inicio"
            >
              <ChevronLeftIcon className="w-5 h-5" />
              <span className="text-sm font-medium hidden sm:inline">Inicio</span>
            </button>
          )}

          {!searchOpen && (
            <button onClick={onGoHome} className="flex-shrink-0 select-none" aria-label="Inicio">
              <span
                className="text-[#1d1d1f] dark:text-white"
                style={{ fontWeight: 900, fontSize: '17px', letterSpacing: '-0.04em' }}
              >
                ELEEME
              </span>
            </button>
          )}

          <div className={`flex items-center transition-all duration-300 ${searchOpen ? 'flex-1' : 'ml-auto'}`}>
            {searchOpen ? (
              <div className="flex-1 flex items-center gap-2 rounded-full bg-[#f5f5f7] px-4 py-2 dark:bg-[#1c1c1e]">
                <SearchIcon className="w-4 h-4 text-[#86868b] flex-shrink-0" />
                <input
                  autoFocus
                  type="text"
                  placeholder="Buscar productos..."
                  value={searchQuery}
                  onChange={(e) => onSearchChange(e.target.value)}
                  className="flex-1 bg-transparent text-sm text-[#1d1d1f] outline-none placeholder-[#86868b] dark:text-white"
                />
                <button
                  onClick={handleCloseSearch}
                  className="flex-shrink-0 text-[#86868b] transition-colors hover:text-[#1d1d1f] dark:hover:text-white"
                >
                  <XIcon className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-1">
                <button
                  onClick={() => setSearchOpen(true)}
                  className="p-2.5 flex items-center justify-center text-[#1d1d1f] transition-colors hover:text-[#0071e3] dark:text-white dark:hover:text-[#0071e3]"
                  aria-label="Buscar"
                >
                  <SearchIcon className="w-5 h-5" />
                </button>
                <button
                  onClick={onToggleDark}
                  className="p-2.5 flex items-center justify-center text-[#1d1d1f] transition-colors hover:text-[#0071e3] dark:text-white dark:hover:text-[#0071e3]"
                  aria-label="Cambiar tema"
                >
                  {isDark ? <SunIcon className="w-5 h-5" /> : <MoonIcon className="w-5 h-5" />}
                </button>
              </div>
            )}
          </div>
        </div>

        {!searchOpen && (
          <ScrollableChipsRow
            ariaLabel="Categorías"
            rowClassName="flex w-max min-w-full gap-2 px-1"
          >
            {categories.map((cat) => {
              const active = selectedCategory === cat
              return (
                <button
                  key={cat}
                  onClick={() => onCategoryChange(cat)}
                  aria-pressed={active}
                  className={`flex-shrink-0 h-8 px-4 rounded-full text-[13px] font-medium tracking-tight transition-all duration-200 active:scale-[0.96] ${
                    active
                      ? 'bg-[#1d1d1f] text-white shadow-sm dark:bg-white dark:text-black'
                      : 'bg-black/[0.04] text-[#1d1d1f] hover:bg-black/[0.07] dark:bg-white/[0.08] dark:text-white/80 dark:hover:bg-white/[0.12]'
                  }`}
                >
                  {cat}
                </button>
              )
            })}
          </ScrollableChipsRow>
        )}

        {!searchOpen && models.length > 0 && (
          <ScrollableChipsRow
            ariaLabel="Modelos"
            rowClassName="flex w-max min-w-full items-center gap-2 animate-slide-down"
          >
            <span className="flex-shrink-0 pr-1 text-[11px] font-semibold uppercase tracking-wider text-[#86868b]">
              Modelo
            </span>
            <button
              onClick={() => onModelChange('Todos')}
              className={`flex-shrink-0 inline-flex items-center h-8 px-3.5 rounded-full text-[13px] font-medium tracking-tight border transition-all duration-200 active:scale-[0.96] ${
                selectedModel === 'Todos'
                  ? 'bg-[#0071e3] border-[#0071e3] text-white'
                  : 'bg-transparent border-gray-200 text-[#6e6e73] hover:border-[#0071e3] dark:border-white/10 dark:text-[#86868b]'
              }`}
            >
              Todos
            </button>
            {models.map((model) => (
              <button
                key={model}
                onClick={() => onModelChange(model)}
                className={`flex-shrink-0 inline-flex items-center h-8 px-3.5 rounded-full text-[13px] font-medium tracking-tight border transition-all duration-200 active:scale-[0.96] ${
                  selectedModel === model
                    ? 'bg-[#0071e3] border-[#0071e3] text-white'
                    : 'bg-transparent border-gray-200 text-[#6e6e73] hover:border-[#0071e3] dark:border-white/10 dark:text-[#86868b]'
                }`}
              >
                {model}
              </button>
            ))}
          </ScrollableChipsRow>
        )}
      </div>
    </header>
  )
}
