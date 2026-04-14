import { useState } from 'react'
import { products as defaultProducts } from '../data/products'

const STORAGE_KEY = 'eleeme_catalog_v1'

// Carga productos desde localStorage; si no hay datos, usa los defaults de products.js
function loadProducts() {
  try {
    const stored = localStorage.getItem(STORAGE_KEY)
    if (stored) return JSON.parse(stored)
  } catch {}
  return defaultProducts
}

export function useProducts() {
  const [products, setProducts] = useState(loadProducts)

  // Puede lanzar QuotaExceededError si las imágenes en base64 saturan localStorage
  const saveProducts = (newProducts) => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(newProducts))
    setProducts(newProducts)
  }

  // Restaura el catálogo de ejemplo original
  const resetToDefaults = () => {
    localStorage.removeItem(STORAGE_KEY)
    setProducts(defaultProducts)
  }

  return { products, saveProducts, resetToDefaults }
}
