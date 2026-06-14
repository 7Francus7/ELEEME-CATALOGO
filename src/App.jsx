import { useState, useMemo, useEffect } from 'react'
import { CATEGORIES, MODEL_CATEGORIES, availableModelsFor } from './data/products'
import { useProducts } from './hooks/useProducts'
import Header from './components/Header'
import HeroSection from './components/HeroSection'
import ProductGrid from './components/ProductGrid'
import ProductModal from './components/ProductModal'
import AdminPanel from './components/AdminPanel'
import Footer from './components/Footer'

const DARK_KEY = 'eleeme_dark_mode'

function initDark() {
  const stored = localStorage.getItem(DARK_KEY)
  if (stored !== null) return stored === 'true'
  // Respetar preferencia del sistema si no hay setting guardado
  return window.matchMedia?.('(prefers-color-scheme: dark)').matches ?? false
}

export default function App() {
  const { products, saveProducts, resetToDefaults } = useProducts()

  const [selectedCategory, setSelectedCategory] = useState('Todos')
  const [selectedModel, setSelectedModel] = useState('Todos')
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedProduct, setSelectedProduct] = useState(null)
  const [adminOpen, setAdminOpen] = useState(false)
  const [isDark, setIsDark] = useState(() => {
    const dark = initDark()
    if (dark) document.documentElement.classList.add('dark')
    return dark
  })

  // Cambiar de categoría reinicia el filtro de modelo
  const handleCategoryChange = (cat) => {
    setSelectedCategory(cat)
    setSelectedModel('Todos')
  }

  // Producto destacado para el hero (primero con destacado: true)
  const heroProduct = useMemo(() => products.find((p) => p.destacado), [products])

  // El filtro por modelo solo aplica en categorías de Fundas / Protectores
  const modelFilterActive = MODEL_CATEGORIES.includes(selectedCategory) && !searchQuery

  // Modelos disponibles para la categoría actual (solo los que existen en el catálogo)
  const modelsForCategory = useMemo(() => {
    if (!modelFilterActive) return []
    return availableModelsFor(products.filter((p) => p.categoria === selectedCategory))
  }, [products, selectedCategory, modelFilterActive])

  // Filtrado instantáneo por categoría + modelo + búsqueda
  const filteredProducts = useMemo(() => {
    return products.filter((p) => {
      const matchesCategory =
        selectedCategory === 'Todos' || p.categoria === selectedCategory

      const matchesModel =
        !modelFilterActive ||
        selectedModel === 'Todos' ||
        (p.modelos || []).includes(selectedModel)

      const q = searchQuery.trim().toLowerCase()
      const matchesSearch =
        !q ||
        p.nombre.toLowerCase().includes(q) ||
        p.descripcion.toLowerCase().includes(q) ||
        p.compatible_con.toLowerCase().includes(q) ||
        p.categoria.toLowerCase().includes(q)

      // Si es la vista 'Todos' y no hay búsqueda, ocultamos el destacado de la grilla
      // para que no aparezca duplicado (ya que está en el Hero)
      if (selectedCategory === 'Todos' && !q && p.destacado) return false

      return matchesCategory && matchesModel && matchesSearch
    })
  }, [products, selectedCategory, selectedModel, modelFilterActive, searchQuery])

  const toggleDark = () => {
    const next = !isDark
    setIsDark(next)
    document.documentElement.classList.toggle('dark', next)
    localStorage.setItem(DARK_KEY, String(next))
  }

  // Bloquear scroll del body cuando el admin o modal están abiertos
  useEffect(() => {
    document.body.style.overflow = (adminOpen || selectedProduct) ? 'hidden' : ''
    return () => { document.body.style.overflow = '' }
  }, [adminOpen, selectedProduct])

  // Padding superior extra cuando el header muestra la fila de modelos
  const showHero = !searchQuery && selectedCategory === 'Todos'

  return (
    <div className="min-h-screen bg-[#f5f5f7] dark:bg-black transition-colors duration-300">
      <Header
        categories={CATEGORIES}
        selectedCategory={selectedCategory}
        onCategoryChange={handleCategoryChange}
        models={modelsForCategory}
        selectedModel={selectedModel}
        onModelChange={setSelectedModel}
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        isDark={isDark}
        onToggleDark={toggleDark}
      />

      <main>
        {showHero && (
          <HeroSection product={heroProduct} onOpen={setSelectedProduct} />
        )}
        <div className={showHero ? '' : (modelsForCategory.length > 0 ? 'pt-40 sm:pt-44' : 'pt-28 sm:pt-32')}>
          <ProductGrid
            products={filteredProducts}
            onOpen={setSelectedProduct}
            searchQuery={searchQuery}
            selectedCategory={selectedCategory}
            onClearSearch={() => { handleCategoryChange('Todos'); setSearchQuery('') }}
          />
        </div>
      </main>

      <Footer onAdminOpen={() => setAdminOpen(true)} />

      {/* Modal de detalle de producto */}
      {selectedProduct && (
        <ProductModal
          product={selectedProduct}
          onClose={() => setSelectedProduct(null)}
        />
      )}

      {/* Panel de administración (solo accesible con contraseña) */}
      {adminOpen && (
        <AdminPanel
          products={products}
          onSave={saveProducts}
          onReset={resetToDefaults}
          onClose={() => setAdminOpen(false)}
        />
      )}
    </div>
  )
}
