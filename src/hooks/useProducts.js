import { useState } from 'react'
import { products as defaultProducts } from '../data/products'
import { ADMIN_CATEGORIES, MODELS } from '../data/catalogConfig'

const STORAGE_KEY = 'eleeme_catalog_v4'
const LEGACY_STORAGE_KEY = 'eleeme_catalog_v3'
const VALID_CATEGORIES = new Set(ADMIN_CATEGORIES)
const VALID_MODELS = new Set(MODELS)

function inferLegacyCategory(product) {
  const name = `${product?.nombre || ''} ${product?.tag || ''}`.toLowerCase()
  if (name.includes('airpods') || name.includes('auricular')) return 'Auriculares'
  if (name.includes('anillo') || name.includes('grip') || name.includes('soporte')) return 'T Grip'
  if (name.includes('jbl')) return 'JBL'
  if (name.includes('cable') || name.includes('lightning') || name.includes('usb-c')) return 'Cables'
  if (name.includes('vidrio templado')) return 'Vidrio templado'
  if (name.includes('cámara')) return 'Protectores de cámara'
  if (name.includes('cargador') || name.includes('magsafe')) return 'Cargadores'
  return product?.categoria || 'Fundas'
}

function normalizeProduct(product) {
  const categoria =
    product?.categoria === 'Accesorios'
      ? inferLegacyCategory(product)
      : VALID_CATEGORIES.has(product?.categoria)
        ? product.categoria
        : inferLegacyCategory(product)

  const knownModels = []
  const extraModels = []
  ;(product?.modelos || []).forEach((model) => {
    if (VALID_MODELS.has(model)) knownModels.push(model)
    else if (model) extraModels.push(model)
  })

  return {
    ...product,
    categoria,
    modelos: [...MODELS.filter((model) => knownModels.includes(model)), ...extraModels],
  }
}

function parseStoredProducts(raw) {
  const parsed = JSON.parse(raw)
  return Array.isArray(parsed) ? parsed.map(normalizeProduct) : defaultProducts
}

// Carga productos desde localStorage; si no hay datos, usa los defaults de products.js
function loadProducts() {
  try {
    const stored = localStorage.getItem(STORAGE_KEY)
    if (stored) return parseStoredProducts(stored)
    const legacy = localStorage.getItem(LEGACY_STORAGE_KEY)
    if (legacy) {
      const migrated = parseStoredProducts(legacy)
      localStorage.setItem(STORAGE_KEY, JSON.stringify(migrated))
      return migrated
    }
  } catch {}
  return defaultProducts.map(normalizeProduct)
}

export function useProducts() {
  const [products, setProducts] = useState(loadProducts)

  // Puede lanzar QuotaExceededError si las imágenes en base64 saturan localStorage
  const saveProducts = (newProducts) => {
    const normalized = newProducts.map(normalizeProduct)
    localStorage.setItem(STORAGE_KEY, JSON.stringify(normalized))
    setProducts(normalized)
  }

  // Restaura el catálogo de ejemplo original
  const resetToDefaults = () => {
    localStorage.removeItem(STORAGE_KEY)
    localStorage.removeItem(LEGACY_STORAGE_KEY)
    setProducts(defaultProducts.map(normalizeProduct))
  }

  return { products, saveProducts, resetToDefaults }
}
