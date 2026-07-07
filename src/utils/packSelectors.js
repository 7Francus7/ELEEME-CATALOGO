import { productHasAnyStock, savingsAmount } from '../data/products'
import { getProductRef, isProductVisible } from './catalogSelectors'

function findProductByRef(products, ref) {
  return products.find((product) => getProductRef(product) === ref || String(product.id) === ref)
}

export function resolvePackProducts(pack, products) {
  return (pack?.productIds || [])
    .map((ref) => findProductByRef(products, ref))
    .filter(Boolean)
}

export function estimatedPackPrice(pack, products) {
  const included = resolvePackProducts(pack, products)
  if (!included.length) return null
  if (included.some((product) => !Number.isFinite(product?.precio))) return null
  return included.reduce((sum, product) => sum + product.precio, 0)
}

export function packSavingsAmount(pack, products) {
  if (!Number.isFinite(pack?.price)) return 0
  const estimated = estimatedPackPrice(pack, products)
  if (!Number.isFinite(estimated)) return 0
  return Math.max(estimated - pack.price, 0)
}

export function packHasStock(pack, products) {
  const included = resolvePackProducts(pack, products)
  if (!included.length) return false
  return included.every((product) => isProductVisible(product) && productHasAnyStock(product))
}

export function visiblePacks(packs, products) {
  return [...packs]
    .filter((pack) => pack?.visible !== false && resolvePackProducts(pack, products).length > 0)
    .sort((left, right) => {
      const stockDiff = Number(packHasStock(right, products)) - Number(packHasStock(left, products))
      if (stockDiff !== 0) return stockDiff

      const savingsDiff = packSavingsAmount(right, products) - packSavingsAmount(left, products)
      if (savingsDiff !== 0) return savingsDiff

      const estimatedDiff = (estimatedPackPrice(right, products) ?? 0) - (estimatedPackPrice(left, products) ?? 0)
      if (estimatedDiff !== 0) return estimatedDiff

      return (left.manualOrder ?? 9999) - (right.manualOrder ?? 9999)
    })
}

export function describePackItems(pack, products) {
  return resolvePackProducts(pack, products).map((product) => product.nombre)
}

export function totalPackProductSavings(pack, products) {
  return resolvePackProducts(pack, products).reduce((sum, product) => sum + savingsAmount(product), 0)
}
