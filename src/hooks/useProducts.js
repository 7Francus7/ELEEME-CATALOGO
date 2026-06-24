import { useState, useEffect, useRef } from 'react'
import { products as defaultProducts } from '../data/products'
import { MODELS } from '../data/catalogConfig'
import { loadRemoteCatalog, rememberSlice, pushRemoteCatalog } from '../utils/remoteStore'

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

  // Migración a multimedia: garantiza siempre arrays imagenes[] y videos[].
  // Catálogos viejos guardaban una sola foto (imagen_url) y un solo video
  // (video_url / video_storage_key); acá se convierten a los nuevos arrays.
  const imagenes = Array.isArray(product?.imagenes) && product.imagenes.length
    ? product.imagenes.filter(Boolean)
    : (product?.imagen_url ? [product.imagen_url] : [])

  let videos
  if (Array.isArray(product?.videos)) {
    videos = product.videos.filter((v) => v && (v.key || v.url))
  } else {
    videos = []
    if (product?.video_storage_key) videos.push({ key: product.video_storage_key })
    if (product?.video_url) videos.push({ url: product.video_url })
  }

  return {
    ...product,
    categoria,
    modelos: [...MODELS.filter((model) => knownModels.includes(model)), ...extraModels],
    imagenes,
    videos,
    imagen_url: imagenes[0] || '',
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
  // Si el dueño edita y guarda mientras el fetch de la nube (lento en el celular)
  // todavía está en vuelo, esa respuesta llega DESPUÉS y pisaba la edición recién
  // hecha (en memoria, en localStorage y en el snapshot que se sube). Esta bandera
  // marca que ya hubo una edición local para no pisarla con la versión vieja.
  const localEdited = useRef(false)

  // Al abrir, traer el catálogo publicado en la nube (si hay backend configurado).
  // Mientras tanto se muestra lo local/los defaults; cuando llega, lo reemplaza.
  useEffect(() => {
    rememberSlice('products', products)
    let alive = true
    loadRemoteCatalog().then((remote) => {
      // No pisar ediciones locales ya guardadas con la respuesta vieja del fetch.
      if (!alive || localEdited.current) return
      if (!remote || !Array.isArray(remote.products)) return
      const normalized = remote.products.map(normalizeProduct)
      try { localStorage.setItem(STORAGE_KEY, JSON.stringify(normalized)) } catch {}
      rememberSlice('products', normalized)
      setProducts(normalized)
    })
    return () => { alive = false }
  }, [])

  // Puede lanzar QuotaExceededError si las imágenes en base64 saturan localStorage
  const saveProducts = (newProducts) => {
    localEdited.current = true
    const normalized = newProducts.map(normalizeProduct)
    try { localStorage.setItem(STORAGE_KEY, JSON.stringify(normalized)) } catch {}
    setProducts(normalized)
    // Sincronizar con la nube (no hace nada si no hay token de admin cargado)
    rememberSlice('products', normalized)
    pushRemoteCatalog()
  }

  // Restaura el catálogo de ejemplo original
  const resetToDefaults = () => {
    localStorage.removeItem(STORAGE_KEY)
    localStorage.removeItem(LEGACY_STORAGE_KEY)
    setProducts(defaultProducts.map(normalizeProduct))
  }

  return { products, saveProducts, resetToDefaults }
}
