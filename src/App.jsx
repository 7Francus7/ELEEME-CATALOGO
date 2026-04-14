import { useState, useMemo, useEffect } from 'react'
import { CATEGORIES } from './data/products'
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
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedProduct, setSelectedProduct] = useState(null)
  const [adminOpen, setAdminOpen] = useState(false)
  const [isDark, setIsDark] = useState(() => {
    const dark = initDark()
    if (dark) document.documentElement.classList.add('dark')
    return dark
  })

  // Producto destacado para el hero (primero con destacado: true)
  const heroProduct = useMemo(() => products.find((p) => p.destacado), [products])

  // Filtrado instantáneo por categoría + búsqueda
  const filteredProducts = useMemo(() => {
    return products.filter((p) => {
      const matchesCategory =
        selectedCategory === 'Todos' || p.categoria === selectedCategory
      const q = searchQuery.trim().toLowerCase()
      const matchesSearch =
        !q ||
        p.nombre.toLowerCase().includes(q) ||
        p.descripcion.toLowerCase().includes(q) ||
        p.compatible_con.toLowerCase().includes(q) ||
        p.categoria.toLowerCase().includes(q)
      return matchesCategory && matchesSearch
    })
  }, [products, selectedCategory, searchQuery])

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

  return (
    <div className="min-h-screen bg-[#f5f5f7] dark:bg-black transition-colors duration-300">
      <Header
        categories={CATEGORIES}
        selectedCategory={selectedCategory}
        onCategoryChange={setSelectedCategory}
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        isDark={isDark}
        onToggleDark={toggleDark}
      />

      <main>
        {!searchQuery && (
          <HeroSection product={heroProduct} onOpen={setSelectedProduct} />
        )}
        <ProductGrid
          products={filteredProducts}
          onOpen={setSelectedProduct}
          searchQuery={searchQuery}
          selectedCategory={selectedCategory}
          onClearSearch={() => { setSearchQuery(''); setSelectedCategory('Todos') }}
        />
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
