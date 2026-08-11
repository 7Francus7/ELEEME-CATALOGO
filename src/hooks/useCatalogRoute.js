import { useCallback, useEffect, useState } from 'react'
import { categorySlug } from '../utils/slugs'

// Ruteo del catálogo con la History API, sin dependencias.
//
// Por qué no React Router: la app no tiene rutas anidadas, ni layouts, ni loaders.
// Toda la navegación son tres piezas de estado (categoría, búsqueda, producto) que
// ya vivían juntas en App.jsx. Meter un router obligaría a partir App.jsx en
// componentes de ruta —un refactor grande— para resolver lo mismo que estas ~90
// líneas. Ver el informe del corte para el detalle.
//
// URLs que entiende:
//   /                                  home
//   /categoria/:slug                   categoría (?modelo=… opcional)
//   /producto/:handle                  producto abierto sobre su contexto
//   ?q=…                               búsqueda (combinable con lo anterior)

const EMPTY_ROUTE = { category: null, categorySlug: null, product: null, query: '', model: null }

export function parseLocation(pathname = window.location.pathname, search = window.location.search) {
  const params = new URLSearchParams(search)
  const query = params.get('q') || ''
  const model = params.get('modelo') || null

  const segments = pathname.split('/').filter(Boolean)
  // El prefijo se compara sin distinguir mayúsculas para que un enlace pegado
  // como /Producto/... o /CATEGORIA/... siga resolviendo en vez de caer al home.
  const kind = (segments[0] || '').toLowerCase()

  if (kind === 'producto' && segments[1]) {
    return { ...EMPTY_ROUTE, product: segments[1], query, model }
  }

  if (kind === 'categoria' && segments[1]) {
    return { ...EMPTY_ROUTE, categorySlug: segments[1], query, model }
  }

  return { ...EMPTY_ROUTE, query, model }
}

// Construye la URL a partir de la ruta. El producto manda sobre la categoría:
// cuando hay un producto abierto, la URL es la del producto (que es la que se
// comparte); al cerrarlo se vuelve al contexto por historial.
export function buildUrl({ categorySlug: catSlug, product, query, model }) {
  let path = '/'
  if (product) path = `/producto/${product}`
  else if (catSlug) path = `/categoria/${catSlug}`

  const params = new URLSearchParams()
  if (query) params.set('q', query)
  if (model) params.set('modelo', model)

  const qs = params.toString()
  return qs ? `${path}?${qs}` : path
}

function currentDepth() {
  const depth = window.history.state?.eleemeDepth
  return Number.isFinite(depth) ? depth : 0
}

export function useCatalogRoute() {
  const [route, setRoute] = useState(() => parseLocation())

  // Marca la entrada inicial para saber después si hay historial propio al que
  // volver (deep link directo = profundidad 0 = no hay adónde ir con back()).
  useEffect(() => {
    if (!Number.isFinite(window.history.state?.eleemeDepth)) {
      window.history.replaceState({ ...window.history.state, eleemeDepth: 0 }, '')
    }
  }, [])

  useEffect(() => {
    const onPopState = () => setRoute(parseLocation())
    window.addEventListener('popstate', onPopState)
    return () => window.removeEventListener('popstate', onPopState)
  }, [])

  const navigate = useCallback((patch, { replace = false } = {}) => {
    setRoute((current) => {
      const next = { ...current, ...patch }
      const url = buildUrl(next)

      if (url !== `${window.location.pathname}${window.location.search}`) {
        if (replace) {
          window.history.replaceState({ ...window.history.state, eleemeDepth: currentDepth() }, '', url)
        } else {
          window.history.pushState({ eleemeDepth: currentDepth() + 1 }, '', url)
        }
      }

      return next
    })
  }, [])

  // Cierre de un overlay: si llegamos navegando dentro del sitio, back() devuelve
  // al contexto anterior (y es lo mismo que hace el botón Atrás de Android).
  // Si la página se abrió directo en el deep link no hay adónde volver, así que
  // se reemplaza la URL por el contexto que corresponda.
  const closeOverlay = useCallback((fallbackPatch) => {
    if (currentDepth() > 0) {
      window.history.back()
      return
    }
    setRoute((current) => {
      const next = { ...current, ...fallbackPatch }
      window.history.replaceState(
        { ...window.history.state, eleemeDepth: 0 },
        '',
        buildUrl(next)
      )
      return next
    })
  }, [])

  const setCategoryBySlug = useCallback(
    (category, options) => navigate({ categorySlug: category ? categorySlug(category) : null, product: null, model: null }, options),
    [navigate]
  )

  return { route, navigate, closeOverlay, setCategoryBySlug }
}
