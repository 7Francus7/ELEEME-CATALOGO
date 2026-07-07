import { productHasAnyStock, productTotalStock, savingsAmount } from '../data/products'

export function getProductRef(product) {
  return String(product?.handle || product?.id || '')
}

export function isProductVisible(product) {
  return product?.visible !== false
}

function hasPrice(product) {
  return Number.isFinite(product?.precio)
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

export function sortProductsForCatalog(products, { query = '' } = {}) {
  return [...products]
    .filter(isProductVisible)
    .map((product, index) => ({ product, index }))
    .sort((left, right) => {
      const leftProduct = left.product
      const rightProduct = right.product

      const comparisons = [
        queryScore(rightProduct, query) - queryScore(leftProduct, query),
        Number(productHasAnyStock(rightProduct)) - Number(productHasAnyStock(leftProduct)),
        Number(hasPrice(rightProduct)) - Number(hasPrice(leftProduct)),
        Number(isBestSeller(rightProduct)) - Number(isBestSeller(leftProduct)),
        Number(isPromo(rightProduct)) - Number(isPromo(leftProduct)),
        productTotalStock(rightProduct) - productTotalStock(leftProduct),
        savingsAmount(rightProduct) - savingsAmount(leftProduct),
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
      const stockDiff = Number(productHasAnyStock(right)) - Number(productHasAnyStock(left))
      if (stockDiff !== 0) return stockDiff
      return (left.manualOrder ?? 9999) - (right.manualOrder ?? 9999)
    })
    .slice(0, 4)

  return { promos, bestSellers, latest }
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
