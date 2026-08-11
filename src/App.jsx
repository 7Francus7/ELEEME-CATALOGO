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
import CatalogIntro from './components/CatalogIntro'
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
import { useCatalogRoute } from './hooks/useCatalogRoute'
import { categoryFromSlug, categorySlug, productFromSlug, productSlug } from './utils/slugs'

const DARK_KEY = 'eleeme_dark_mode'

// Modo claro por defecto. Sólo se abre en oscuro si la persona lo eligió antes
// con el botón del header; ya no se sigue el tema del sistema. Quien tenga el
// teléfono en oscuro ve igual la tienda clara la primera vez.
// Tiene que coincidir con el script de index.html que pinta el fondo antes de
// que monte React, o se ve un flash al cargar.
function initDark() {
  return localStorage.getItem(DARK_KEY) === 'true'
}

// Mantiene la barra del navegador (mobile) del mismo color que el catálogo.
function syncThemeColor(dark) {
  document
    .querySelector('meta[name="theme-color"]')
    ?.setAttribute('content', dark ? '#000000' : '#f5f5f7')
}

export default function App() {
  const { products, saveProducts, resetToDefaults, remoteSettled } = useProducts()
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

  // La URL es la fuente de verdad de categoría / búsqueda / producto: así el
  // historial del navegador, los deep links y el botón Atrás de Android salen
  // gratis, sin duplicar estado.
  const { route, navigate, closeOverlay } = useCatalogRoute()

  const selectedCategory = useMemo(
    () => categoryFromSlug(route.categorySlug, catalogCategories) || 'Todos',
    [catalogCategories, route.categorySlug]
  )
  const searchQuery = route.query
  const selectedModel = route.model || 'Todos'
  const selectedProduct = useMemo(
    () => productFromSlug(route.product, products),
    [products, route.product]
  )

  const [adminOpen, setAdminOpen] = useState(false)
  const [cartOpen, setCartOpen] = useState(false)
  const [isDark, setIsDark] = useState(() => {
    const dark = initDark()
    if (dark) document.documentElement.classList.add('dark')
    return dark
  })

  // Cambiar de categoría limpia el modelo, igual que antes.
  const handleCategoryChange = (category) => {
    navigate({
      categorySlug: category && category !== 'Todos' ? categorySlug(category) : null,
      model: null,
      product: null,
    })
  }

  const goHome = () => {
    navigate({ categorySlug: null, model: null, query: '', product: null })
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const handleTileSelect = (category) => {
    handleCategoryChange(category)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  // Escribir en el buscador reemplaza la entrada actual: si empujáramos una por
  // tecla, el botón Atrás tendría que deshacer letra por letra.
  const handleSearchChange = (value) => {
    navigate({ query: value, product: null }, { replace: true })
  }

  const handleModelChange = (model) => {
    navigate({ model: model && model !== 'Todos' ? model : null }, { replace: true })
  }

  // Abrir producto = entrada nueva de historial. Cerrarlo vuelve por historial,
  // que es exactamente lo que hace Atrás en Android.
  const handleOpenProduct = (product) => {
    if (!product) return
    navigate({ product: productSlug(product) })
  }

  const handleCloseProduct = () => {
    closeOverlay({
      product: null,
      categorySlug: selectedProduct?.categoria ? categorySlug(selectedProduct.categoria) : null,
    })
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
    document.documentElement.style.backgroundColor = next ? '#000000' : '#f5f5f7'
    syncThemeColor(next)
    localStorage.setItem(DARK_KEY, String(next))
  }

  const handleAddToCart = (product, model = null) => addItem(product, model)

  // Fallback de slugs que no existen (link viejo, categoría renombrada, typo).
  // Se espera a que el catálogo de la nube haya resuelto: hasta entonces un slug
  // válido puede parecer inválido sólo porque su producto todavía no llegó.
  // Nunca rompe: limpia la URL con replace y deja al usuario en el catálogo.
  useEffect(() => {
    if (!remoteSettled) return

    if (route.product && !selectedProduct) {
      navigate({ product: null }, { replace: true })
      return
    }

    if (route.categorySlug && !categoryFromSlug(route.categorySlug, catalogCategories)) {
      navigate({ categorySlug: null, model: null }, { replace: true })
    }
  }, [
    catalogCategories,
    navigate,
    remoteSettled,
    route.categorySlug,
    route.product,
    selectedProduct,
  ])

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
  // selectedProduct ya sale resuelto contra `products`, así que refleja las
  // ediciones del admin en vivo sin necesidad de volver a buscarlo.
  const activeProduct = selectedProduct
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
        onModelChange={handleModelChange}
        searchQuery={searchQuery}
        onSearchChange={handleSearchChange}
        isDark={isDark}
        onToggleDark={toggleDark}
        onGoHome={goHome}
        cartCount={cartCount}
        onOpenCart={() => setCartOpen(true)}
      />

      <main className={cartCount > 0 ? 'pb-24 sm:pb-28' : ''}>
        {showHero && <CatalogIntro />}

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
              onOpen={handleOpenProduct}
              onAddToCart={handleAddToCart}
            />
          ) : (
            <ProductGrid
              products={sortedProducts}
              onOpen={handleOpenProduct}
              onAddToCart={handleAddToCart}
              searchQuery={searchQuery}
              selectedCategory={selectedCategory}
              activeModel={activeModel}
              showTitle
              onClearSearch={goHome}
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
          onOpenProduct={handleOpenProduct}
          onClose={handleCloseProduct}
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
