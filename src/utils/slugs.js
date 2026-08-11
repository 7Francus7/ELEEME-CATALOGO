// Slugs para las URLs del catálogo.
//
// Productos: se usa el `handle` que los productos YA tienen (ver data/products.js
// y normalizeProduct en hooks/useProducts.js). No se inventa una clave nueva ni
// se migran datos: el handle es estable, no se edita desde el admin y para los
// productos creados a mano cae en String(id), que también sirve como URL.
//
// Categorías: el dueño las renombra desde el admin, así que el slug se deriva del
// nombre de forma determinística y se resuelve comparando slugs.

// "Protectores de cámara" → "protectores-de-camara"
export function slugify(value) {
  return String(value || '')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '') // saca tildes/dieresis
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
}

export const categorySlug = (category) => slugify(category)

// Devuelve el nombre real de la categoría a partir del slug de la URL.
// null si ese slug no corresponde a ninguna categoría visible.
export function categoryFromSlug(slug, categories) {
  if (!slug) return null
  const target = slugify(decodeURIComponent(slug))
  return categories.find((category) => categorySlug(category) === target) || null
}

// El segmento de URL de un producto: su handle, o el id como último recurso.
export function productSlug(product) {
  const handle = String(product?.handle || '').trim()
  if (handle) return encodeURIComponent(handle)
  return String(product?.id ?? '')
}

// Resuelve un producto desde el segmento de la URL. Acepta, en orden:
//   1. el handle exacto            → /producto/funda-metal-color-blanco
//   2. el id numérico              → /producto/5   (enlaces viejos siguen andando)
//   3. el handle "slugificado"     → tolera acentos o mayúsculas en el enlace
// Devuelve null si no matchea nada; nunca tira.
export function productFromSlug(slug, products) {
  if (!slug || !Array.isArray(products)) return null

  let ref
  try {
    ref = decodeURIComponent(String(slug))
  } catch {
    ref = String(slug)
  }
  ref = ref.trim()
  if (!ref) return null

  const byHandle = products.find((product) => String(product?.handle || '') === ref)
  if (byHandle) return byHandle

  const byId = products.find((product) => String(product?.id) === ref)
  if (byId) return byId

  const target = slugify(ref)
  if (!target) return null

  return (
    products.find((product) => slugify(product?.handle || '') === target) ||
    products.find((product) => slugify(product?.nombre || '') === target) ||
    null
  )
}
