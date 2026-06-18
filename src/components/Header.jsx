import { useState } from 'react'
import { SearchIcon, XIcon, SunIcon, MoonIcon, ChevronLeftIcon } from './Icons'

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

  // Estamos en el inicio cuando no hay categoría filtrada ni búsqueda
  const isHome = selectedCategory === 'Todos' && !searchQuery

  return (
    <header className="fixed top-0 left-0 right-0 z-40 bg-white/80 dark:bg-black/80 backdrop-blur-xl border-b border-gray-200/60 dark:border-white/10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

        {/* Fila principal */}
        <div className="flex items-center h-14 gap-3">

          {/* Flecha volver al inicio (cuando hay filtro o categoría activa) */}
          {!searchOpen && !isHome && (
            <button
              onClick={onGoHome}
              className="flex-shrink-0 flex items-center gap-1 -ml-1 pr-1 text-[#1d1d1f] dark:text-white hover:text-[#0071e3] dark:hover:text-[#0071e3] transition-colors"
              aria-label="Volver al inicio"
            >
              <ChevronLeftIcon className="w-5 h-5" />
              <span className="text-sm font-medium hidden sm:inline">Inicio</span>
            </button>
          )}

          {/* Logo ELEEME */}
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

          {/* Buscador expandible */}
          <div className={`flex items-center transition-all duration-300 ${searchOpen ? 'flex-1' : 'ml-auto'}`}>
            {searchOpen ? (
              <div className="flex-1 flex items-center gap-2 bg-[#f5f5f7] dark:bg-[#1c1c1e] rounded-full px-4 py-2">
                <SearchIcon className="w-4 h-4 text-[#86868b] flex-shrink-0" />
                <input
                  autoFocus
                  type="text"
                  placeholder="Buscar productos..."
                  value={searchQuery}
                  onChange={(e) => onSearchChange(e.target.value)}
                  className="flex-1 bg-transparent text-sm text-[#1d1d1f] dark:text-white placeholder-[#86868b] outline-none"
                />
                <button
                  onClick={handleCloseSearch}
                  className="flex-shrink-0 text-[#86868b] hover:text-[#1d1d1f] dark:hover:text-white transition-colors"
                >
                  <XIcon className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-1">
                <button
                  onClick={() => setSearchOpen(true)}
                  className="p-2.5 flex items-center justify-center text-[#1d1d1f] dark:text-white hover:text-[#0071e3] dark:hover:text-[#0071e3] transition-colors"
                  aria-label="Buscar"
                >
                  <SearchIcon className="w-5 h-5" />
                </button>
                <button
                  onClick={onToggleDark}
                  className="p-2.5 flex items-center justify-center text-[#1d1d1f] dark:text-white hover:text-[#0071e3] dark:hover:text-[#0071e3] transition-colors"
                  aria-label="Cambiar tema"
                >
                  {isDark ? <SunIcon className="w-5 h-5" /> : <MoonIcon className="w-5 h-5" />}
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Chips de categorías (scroll horizontal, estilo iOS) */}
        {!searchOpen && (
          <div className="flex gap-2 pb-3 -mx-1 px-1 overflow-x-auto scrollbar-hide">
            {categories.map((cat) => {
              const active = selectedCategory === cat
              return (
                <button
                  key={cat}
                  onClick={() => onCategoryChange(cat)}
                  aria-pressed={active}
                  className={`flex-shrink-0 h-8 px-4 rounded-full text-[13px] font-medium tracking-tight
                              transition-all duration-200 active:scale-[0.96] ${
                    active
                      ? 'bg-[#1d1d1f] dark:bg-white text-white dark:text-black shadow-sm'
                      : 'bg-black/[0.04] dark:bg-white/[0.08] text-[#1d1d1f] dark:text-white/80 hover:bg-black/[0.07] dark:hover:bg-white/[0.12]'
                  }`}
                >
                  {cat}
                </button>
              )
            })}
          </div>
        )}

        {/* Filtro por modelo de iPhone (solo Fundas / Protectores) */}
        {!searchOpen && models.length > 0 && (
          <div className="flex items-center gap-2 pb-3 overflow-x-auto scrollbar-hide animate-slide-down">
            <span className="flex-shrink-0 text-[11px] font-semibold uppercase tracking-wider text-[#86868b] pr-1">
              Modelo
            </span>
            <button
              onClick={() => onModelChange('Todos')}
              className={`flex-shrink-0 inline-flex items-center h-8 px-3.5 rounded-full text-[13px] font-medium tracking-tight border transition-all duration-200 active:scale-[0.96] ${
                selectedModel === 'Todos'
                  ? 'bg-[#0071e3] border-[#0071e3] text-white'
                  : 'bg-transparent border-gray-200 dark:border-white/10 text-[#6e6e73] dark:text-[#86868b] hover:border-[#0071e3]'
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
                    : 'bg-transparent border-gray-200 dark:border-white/10 text-[#6e6e73] dark:text-[#86868b] hover:border-[#0071e3]'
                }`}
              >
                {model}
              </button>
            ))}
          </div>
        )}
      </div>
    </header>
  )
}
