import { savingsAmount } from '../data/products'

export function getProductRef(product) {
  return String(product?.handle || product?.id || '')
}

export function isProductVisible(product) {
  return product?.visible !== false
}

function isPromo(product) {
  return savingsAmount(product) > 0
}

function isBestSeller(product) {
  const tag = `${product?.tag || ''}`.toLowerCase()
  const badges = Array.isArray(product?.badges) ? product.badges.join(' ').toLowerCase() : ''
  return Boolean(product?.destacado) || tag.includes('vendido') || tag.includes('ventas') || badges.includes('vendido')
}

function queryScore(product, query) {
  if (!query) return 0

  const normalized = query.trim().toLowerCase()
  if (!normalized) return 0

  const name = `${product?.nombre || ''}`.toLowerCase()
  const compatible = `${product?.compatible_con || ''}`.toLowerCase()
  const category = `${product?.categoria || ''}`.toLowerCase()
  const description = `${product?.descripcion || ''}`.toLowerCase()

  if (name === normalized) return 5
  if (name.startsWith(normalized)) return 4
  if (name.includes(normalized)) return 3
  if (compatible.includes(normalized) || category.includes(normalized)) return 2
  if (description.includes(normalized)) return 1
  return 0
}

const STRATEGIC_SECTION_DEFINITIONS = [
  {
    key: 'fundas',
    title: 'Fundas',
    description: 'Primero lo mas pedido: fundas listas para elegir por modelo.',
    categories: ['Fundas'],
  },
  {
    key: 'proteccion',
    title: 'Proteccion de camara',
    description: 'Protectores y vidrios para resolver cuidado extra en misma pasada.',
    categories: ['Protectores de cámara', 'Vidrio templado'],
  },
  {
    key: 'carga',
    title: 'Carga',
    description: 'Cargadores y cables juntos para cerrar compra completa sin buscar aparte.',
    categories: ['Cargadores', 'Cables', 'Battery pack', 'Funda cargador'],
  },
  {
    key: 'accesorios',
    title: 'Accesorios',
    description: 'Soportes, correas y extras rapidos para complementar pedido.',
    categories: ['Correas', 'Reloj', 'Personaliza tu funda', 'Funda auriculares'],
  },
  {
    key: 'audio',
    title: 'Audio',
    description: 'Productos premium separados para no mezclar con compra base.',
    categories: ['Auriculares', 'JBL'],
  },
]

function uniqueCategories(values) {
  const seen = new Set()
  const out = []

  values.forEach((value) => {
    const name = String(value || '').trim()
    if (!name) return

    const key = name.toLowerCase()
    if (seen.has(key)) return

    seen.add(key)
    out.push(name)
  })

  return out
}

function visibleCategorySet(products) {
  return new Set(
    products
      .filter(isProductVisible)
      .map((product) => String(product?.categoria || '').trim())
      .filter(Boolean)
  )
}

export function getCatalogNavigationCategories(configuredCategories, products) {
  const used = visibleCategorySet(products)
  const orderedConfigured = uniqueCategories(configuredCategories).filter((category) => used.has(category))
  const missing = [...used].filter((category) => !orderedConfigured.includes(category))

  return [...orderedConfigured, ...sortCategoriesForNavigation(missing)]
}

function sortCategoriesForNavigation(categories) {
  const priority = new Map(
    STRATEGIC_SECTION_DEFINITIONS.flatMap((section, sectionIndex) =>
      section.categories.map((category, categoryIndex) => [
        category,
        sectionIndex * 10 + categoryIndex,
      ])
    )
  )

  return [...categories].sort((left, right) => {
    const leftPriority = priority.get(left) ?? 999
    const rightPriority = priority.get(right) ?? 999
    if (leftPriority !== rightPriority) return leftPriority - rightPriority
    return left.localeCompare(right, 'es', { sensitivity: 'base' })
  })
}

export function sortProductsForCatalog(products, { query = '' } = {}) {
  return [...products]
    .filter(isProductVisible)
    .map((product, index) => ({ product, index }))
    .sort((left, right) => {
      const leftProduct = left.product
      const rightProduct = right.product

      const searchDiff = queryScore(rightProduct, query) - queryScore(leftProduct, query)
      if (searchDiff !== 0) return searchDiff

      const comparisons = [
        (leftProduct.manualOrder ?? 9999) - (rightProduct.manualOrder ?? 9999),
        left.index - right.index,
      ]

      return comparisons.find((value) => value !== 0) ?? 0
    })
    .map(({ product }) => product)
}

function takeCurated(products, predicate, limit, options = {}) {
  return sortProductsForCatalog(products.filter(predicate), options).slice(0, limit)
}

export function getCuratedCollections(products) {
  const visibleProducts = products.filter(isProductVisible)
  const promos = takeCurated(visibleProducts, isPromo, 4)
  const bestSellers = takeCurated(visibleProducts, isBestSeller, 4)

  const latest = [...visibleProducts]
    .sort((left, right) => {
      return (left.manualOrder ?? 9999) - (right.manualOrder ?? 9999)
    })
    .slice(0, 4)

  return { promos, bestSellers, latest }
}

function buildStrategicSection(section, visibleProducts) {
  const products = sortProductsForCatalog(
    visibleProducts.filter((product) => section.categories.includes(product.categoria))
  )

  if (!products.length) return null

  return {
    key: section.key,
    title: section.title,
    description: section.description,
    categories: section.categories,
    products,
  }
}

export function getStrategicCatalogSections(products, configuredCategories = []) {
  const visibleProducts = products.filter(isProductVisible)
  const sections = STRATEGIC_SECTION_DEFINITIONS
    .map((section) => buildStrategicSection(section, visibleProducts))
    .filter(Boolean)

  const covered = new Set(sections.flatMap((section) => section.categories))
  const visibleCategories = visibleCategorySet(visibleProducts)
  const orderedFallbacks = getCatalogNavigationCategories(configuredCategories, visibleProducts)
    .filter((category) => visibleCategories.has(category) && !covered.has(category))

  orderedFallbacks.forEach((category) => {
    const categoryProducts = sortProductsForCatalog(
      visibleProducts.filter((product) => product.categoria === category)
    )

    if (!categoryProducts.length) return

    sections.push({
      key: `category-${category}`,
      title: category,
      description: 'Productos agrupados por categoria para mantener catalogo claro.',
      categories: [category],
      products: categoryProducts,
    })
  })

  return sections
}

function findProductByRef(products, ref) {
  return products.find((product) => getProductRef(product) === ref || String(product.id) === ref)
}

export function getRelatedProducts(products, currentProduct, limit = 3) {
  if (!currentProduct) return []

  const visibleProducts = products.filter(isProductVisible)
  const explicit = (currentProduct.related || [])
    .map((ref) => findProductByRef(visibleProducts, ref))
    .filter((product) => product && product.id !== currentProduct.id)

  const explicitUnique = explicit.filter(
    (product, index) => explicit.findIndex((item) => item.id === product.id) === index
  )

  if (explicitUnique.length >= limit) {
    return explicitUnique.slice(0, limit)
  }

  const sameCategory = sortProductsForCatalog(
    visibleProducts.filter(
      (product) =>
        product.id !== currentProduct.id &&
        product.categoria === currentProduct.categoria &&
        !explicitUnique.some((related) => related.id === product.id)
    )
  )

  const fallback = sortProductsForCatalog(
    visibleProducts.filter(
      (product) =>
        product.id !== currentProduct.id &&
        !explicitUnique.some((related) => related.id === product.id) &&
        !sameCategory.some((related) => related.id === product.id)
    )
  )

  return [...explicitUnique, ...sameCategory, ...fallback].slice(0, limit)
}

export function getCollectionDefinition(key) {
  if (key === 'promos') {
    return {
      title: 'Promos',
      description: 'Productos con precio promocional cargado en el catalogo.',
    }
  }

  if (key === 'bestSellers') {
    return {
      title: 'Mas vendidos',
      description: 'Productos destacados para resolver compras rapidas.',
    }
  }

  return {
    title: 'Novedades',
    description: 'Ultimos productos visibles, priorizando los que tienen stock.',
  }
}
