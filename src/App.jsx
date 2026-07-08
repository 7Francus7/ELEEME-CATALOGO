import { useEffect, useMemo, useState } from 'react'
import {
  MODEL_CATEGORIES,
  availableModelsFor,
} from './data/catalogConfig'
import { packs } from './data/packs'
import { useProducts } from './hooks/useProducts'
import { useCategories } from './hooks/useCategories'
import { useCommercialBanner } from './hooks/useCommercialBanner'
import { useCart } from './hooks/useCart'
import Header from './components/Header'
import CategoryTiles from './components/CategoryTiles'
import CatalogHero from './components/CatalogHero'
import FinancingStrip from './components/FinancingStrip'
import StrategicCatalogSections from './components/StrategicCatalogSections'
import ProductGrid from './components/ProductGrid'
import ProductModal from './components/ProductModal'
import CartSheet from './components/CartSheet'
import CartSummaryBar from './components/CartSummaryBar'
import AdminPanel from './components/AdminPanel'
import Footer from './components/Footer'
import {
  getCatalogNavigationCategories,
  getRelatedProducts,
  getStrategicCatalogSections,
  isProductVisible,
  sortProductsForCatalog,
} from './utils/catalogSelectors'

const DARK_KEY = 'eleeme_dark_mode'

function initDark() {
  const stored = localStorage.getItem(DARK_KEY)
  if (stored !== null) return stored === 'true'
  return window.matchMedia?.('(prefers-color-scheme: dark)').matches ?? false
}

export default function App() {
  const { products, saveProducts, resetToDefaults } = useProducts()
  const { categories, saveCategories, resetCategories } = useCategories()
  const { bannerConfig, saveBannerConfig, resetBannerConfig } = useCommercialBanner()
  const {
    items: cartItems,
    totalItems: cartCount,
    totalPrice: cartTotal,
    whatsappUrl,
    addItem,
    incrementItem,
    decrementItem,
    removeItem,
    clearCart,
  } = useCart(products, packs)

  const catalogCategories = useMemo(
    () => getCatalogNavigationCategories(categories, products),
    [categories, products]
  )
  const navCategories = useMemo(() => ['Todos', ...catalogCategories], [catalogCategories])

  const [selectedCategory, setSelectedCategory] = useState('Todos')
  const [selectedModel, setSelectedModel] = useState('Todos')
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedProduct, setSelectedProduct] = useState(null)
  const [adminOpen, setAdminOpen] = useState(false)
  const [cartOpen, setCartOpen] = useState(false)
  const [isDark, setIsDark] = useState(() => {
    const dark = initDark()
    if (dark) document.documentElement.classList.add('dark')
    return dark
  })

  const handleCategoryChange = (category) => {
    setSelectedCategory(category)
    setSelectedModel('Todos')
  }

  const goHome = () => {
    setSelectedCategory('Todos')
    setSelectedModel('Todos')
    setSearchQuery('')
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const handleTileSelect = (category) => {
    handleCategoryChange(category)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const handleNotifyRestock = (productId, email) => {
    const clean = (email || '').trim().toLowerCase()
    if (!clean || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(clean)) return 'invalid'

    const product = products.find((entry) => entry.id === productId)
    const list = product?.notificar_cuando_stock || []
    if (list.some((entry) => entry.toLowerCase() === clean)) return 'duplicate'

    const updated = products.map((entry) =>
      entry.id === productId
        ? { ...entry, notificar_cuando_stock: [...list, clean] }
        : entry
    )

    saveProducts(updated)
    return 'added'
  }

  const modelFilterActive = MODEL_CATEGORIES.includes(selectedCategory) && !searchQuery

  const modelsForCategory = useMemo(() => {
    if (!modelFilterActive) return []
    return availableModelsFor(products.filter((product) => product.categoria === selectedCategory))
  }, [modelFilterActive, products, selectedCategory])

  const filteredProducts = useMemo(() => {
    return products.filter((product) => {
      const matchesCategory =
        selectedCategory === 'Todos' || product.categoria === selectedCategory

      const matchesModel =
        !modelFilterActive ||
        selectedModel === 'Todos' ||
        (product.modelos || []).includes(selectedModel)

      const query = searchQuery.trim().toLowerCase()
      const matchesSearch =
        !query ||
        product.nombre.toLowerCase().includes(query) ||
        product.descripcion.toLowerCase().includes(query) ||
        product.compatible_con.toLowerCase().includes(query) ||
        product.categoria.toLowerCase().includes(query)

      return matchesCategory && matchesModel && matchesSearch
    })
  }, [modelFilterActive, products, searchQuery, selectedCategory, selectedModel])

  const sortedProducts = useMemo(
    () => sortProductsForCatalog(filteredProducts, { query: searchQuery }),
    [filteredProducts, searchQuery]
  )

  const toggleDark = () => {
    const next = !isDark
    setIsDark(next)
    document.documentElement.classList.toggle('dark', next)
    localStorage.setItem(DARK_KEY, String(next))
  }

  const handleAddToCart = (product, model = null) => addItem(product, model)

  useEffect(() => {
    if (selectedCategory !== 'Todos' && !catalogCategories.includes(selectedCategory)) {
      setSelectedCategory('Todos')
    }
  }, [catalogCategories, selectedCategory])

  useEffect(() => {
    document.body.style.overflow = adminOpen || selectedProduct || cartOpen ? 'hidden' : ''
    return () => {
      document.body.style.overflow = ''
    }
  }, [adminOpen, cartOpen, selectedProduct])

  const showHero = !searchQuery && selectedCategory === 'Todos'
  const activeModel = modelFilterActive && selectedModel !== 'Todos' ? selectedModel : null
  const strategicSections = useMemo(
    () => getStrategicCatalogSections(products, categories),
    [categories, products]
  )
  const visibleProductCount = useMemo(
    () => products.filter(isProductVisible).length,
    [products]
  )
  const activeProduct =
    products.find((product) => product.id === selectedProduct?.id) || selectedProduct || null
  const relatedProducts = useMemo(
    () => getRelatedProducts(products, activeProduct, 3),
    [activeProduct, products]
  )

  return (
    <div className="min-h-screen bg-[#f5f5f7] dark:bg-black transition-colors duration-300">
      <Header
        categories={navCategories}
        selectedCategory={selectedCategory}
        onCategoryChange={handleCategoryChange}
        models={modelsForCategory}
        selectedModel={selectedModel}
        onModelChange={setSelectedModel}
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        isDark={isDark}
        onToggleDark={toggleDark}
        onGoHome={goHome}
        cartCount={cartCount}
        onOpenCart={() => setCartOpen(true)}
      />

      <main className={cartCount > 0 ? 'pb-24 sm:pb-28' : ''}>
        {showHero && (
          <CategoryTiles
            categories={catalogCategories}
            onSelectCategory={handleTileSelect}
          />
        )}

        {showHero && <FinancingStrip config={bannerConfig} />}

        {showHero && <CatalogHero />}

        <div
          className={
            showHero
              ? 'pt-8 sm:pt-10'
              : modelsForCategory.length > 0
                ? 'pt-40 sm:pt-44'
                : 'pt-28 sm:pt-32'
          }
        >
          {showHero ? (
            <StrategicCatalogSections
              sections={strategicSections}
              totalProducts={visibleProductCount}
              activeModel={activeModel}
              onOpen={setSelectedProduct}
              onAddToCart={handleAddToCart}
            />
          ) : (
            <ProductGrid
              products={sortedProducts}
              onOpen={setSelectedProduct}
              onAddToCart={handleAddToCart}
              searchQuery={searchQuery}
              selectedCategory={selectedCategory}
              activeModel={activeModel}
              showTitle
              onClearSearch={() => {
                handleCategoryChange('Todos')
                setSearchQuery('')
              }}
            />
          )}
        </div>

      </main>

      <Footer onAdminOpen={() => setAdminOpen(true)} />

      {selectedProduct && (
        <ProductModal
          product={activeProduct}
          activeModel={activeModel}
          relatedProducts={relatedProducts}
          onNotifyRestock={handleNotifyRestock}
          onAddToCart={handleAddToCart}
          onOpenProduct={setSelectedProduct}
          onClose={() => setSelectedProduct(null)}
        />
      )}

      {cartOpen && (
        <CartSheet
          isOpen={cartOpen}
          items={cartItems}
          totalItems={cartCount}
          totalPrice={cartTotal}
          whatsappUrl={whatsappUrl}
          onClose={() => setCartOpen(false)}
          onIncrement={incrementItem}
          onDecrement={decrementItem}
          onRemove={removeItem}
          onClear={clearCart}
        />
      )}

      <CartSummaryBar
        totalItems={cartCount}
        totalPrice={cartTotal}
        onOpen={() => setCartOpen(true)}
      />

      {adminOpen && (
        <AdminPanel
          products={products}
          onSave={saveProducts}
          onReset={resetToDefaults}
          categories={categories}
          onSaveCategories={saveCategories}
          onResetCategories={resetCategories}
          bannerConfig={bannerConfig}
          onSaveBannerConfig={saveBannerConfig}
          onResetBannerConfig={resetBannerConfig}
          onClose={() => setAdminOpen(false)}
        />
      )}
    </div>
  )
}
