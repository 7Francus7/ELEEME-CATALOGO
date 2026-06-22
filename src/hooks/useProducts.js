import { useState } from 'react'
import { products as defaultProducts } from '../data/products'
import { MODELS } from '../data/catalogConfig'

const STORAGE_KEY = 'eleeme_catalog_v4'
const LEGACY_STORAGE_KEY = 'eleeme_catalog_v3'
const VALID_MODELS = new Set(MODELS)

function inferLegacyCategory(product) {
  const name = `${product?.nombre || ''} ${product?.tag || ''}`.toLowerCase()
  if (name.includes('airpods') || name.includes('auricular')) return 'Auriculares'
  if (name.includes('anillo') || name.includes('grip') || name.includes('soporte')) return 'Correas'
  if (name.includes('jbl')) return 'JBL'
  if (name.includes('cable') || name.includes('lightning') || name.includes('usb-c')) return 'Cables'
  if (name.includes('vidrio templado')) return 'Vidrio templado'
  if (name.includes('cámara')) return 'Protectores de cámara'
  if (name.includes('cargador') || name.includes('magsafe')) return 'Cargadores'
  return 'Fundas'
}

function normalizeProduct(product) {
  // Las categorías ahora son editables por el cliente, así que no se valida contra
  // una lista fija: se respeta la categoría guardada. Solo se infiere si falta o
  // si es el bucket genérico legacy 'Accesorios'.
  const stored = product?.categoria
  const categoria =
    stored && stored !== 'Accesorios' ? stored : inferLegacyCategory(product)

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
