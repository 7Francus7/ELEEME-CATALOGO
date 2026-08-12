import { useState } from 'react'
import {
  SearchIcon,
  XIcon,
  SunIcon,
  MoonIcon,
  ChevronLeftIcon,
  ShoppingBagIcon,
} from './Icons'
import ScrollableRow from './ScrollableRow'

// El mismo botón se usa con la búsqueda abierta y cerrada. La `key` del badge
// es la cantidad: al cambiar, React lo remonta y la animación vuelve a correr.
function CartButton({ cartCount, onOpenCart }) {
  return (
    <button
      onClick={onOpenCart}
      className="relative p-2.5 flex items-center justify-center text-[#1d1d1f] transition-colors hover:text-[#0071e3] dark:text-white dark:hover:text-[#0071e3]"
      aria-label={cartCount > 0 ? `Ver pedido (${cartCount})` : 'Ver pedido'}
    >
      <ShoppingBagIcon className="w-5 h-5" />
      {cartCount > 0 && (
        <span
          key={cartCount}
          className="animate-badge-pop absolute -top-0.5 -right-0.5 min-w-[18px] h-[18px] px-1 rounded-full bg-[#0071e3] text-white text-[10px] font-bold flex items-center justify-center"
        >
          {cartCount}
        </span>
      )}
    </button>
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
  cartCount = 0,
  onOpenCart,
}) {
  const [searchOpen, setSearchOpen] = useState(false)

  // La X guarda el campo pero deja la búsqueda hecha: cerrarlo borraba los
  // resultados que la persona acababa de conseguir. Para volver al catálogo
  // completo está "Inicio", que aparece apenas hay una búsqueda activa.
  const handleCloseSearch = () => setSearchOpen(false)

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
            <button
              onClick={onGoHome}
              className="flex-shrink-0 inline-flex items-center min-h-[44px] pr-1 select-none"
              aria-label="Inicio"
            >
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
              <div className="flex items-center gap-1.5 flex-1">
                <div className="flex-1 flex items-center gap-2 rounded-full bg-[#f5f5f7] px-4 py-2 dark:bg-[#1c1c1e]">
                  <SearchIcon className="w-4 h-4 text-[#86868b] flex-shrink-0" />
                  <input
                    autoFocus
                    type="text"
                    inputMode="search"
                    aria-label="Buscar productos"
                    placeholder="Buscar productos..."
                    value={searchQuery}
                    onChange={(e) => onSearchChange(e.target.value)}
                    className="flex-1 bg-transparent text-sm text-[#1d1d1f] outline-none placeholder-[#86868b] dark:text-white"
                  />
                  <button
                    onClick={handleCloseSearch}
                    aria-label="Cerrar búsqueda"
                    className="flex-shrink-0 text-[#86868b] transition-colors hover:text-[#1d1d1f] dark:hover:text-white"
                  >
                    <XIcon className="w-4 h-4" />
                  </button>
                </div>
                <CartButton cartCount={cartCount} onOpenCart={onOpenCart} />
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
                <CartButton cartCount={cartCount} onOpenCart={onOpenCart} />
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

        {/* En home los tiles del medio reemplazan a los chips: arriba queda solo ELEEME */}
        {!searchOpen && !isHome && (
          <ScrollableRow
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
          </ScrollableRow>
        )}

        {!searchOpen && models.length > 0 && (
          <ScrollableRow
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
          </ScrollableRow>
        )}
      </div>
    </header>
  )
}
