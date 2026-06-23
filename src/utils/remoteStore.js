// Sincronización del catálogo con la nube (backend en /api, ver carpeta /api).
//
// Todo acá degrada con elegancia: si el backend no está configurado o no hay
// token de admin cargado, la app sigue funcionando igual que antes, 100% local.
// Solo cuando el dueño carga su token y publica, los cambios pasan a guardarse
// online y todos los que abren el link ven la última versión.

import { getImage, getVideo } from './videoStore'

const TOKEN_KEY = 'eleeme_admin_token'

// ── Token de admin (se guarda en este dispositivo para no reescribirlo) ─────────
export function getAdminToken() {
  try { return localStorage.getItem(TOKEN_KEY) || '' } catch { return '' }
}
export function setAdminToken(token) {
  try {
    const clean = (token || '').trim()
    if (clean) localStorage.setItem(TOKEN_KEY, clean)
    else localStorage.removeItem(TOKEN_KEY)
  } catch {}
}
export function hasAdminToken() {
  return !!getAdminToken()
}

// ── Lectura del catálogo publicado (una sola vez por carga de página) ───────────
let loadPromise
export function loadRemoteCatalog() {
  if (!loadPromise) {
    loadPromise = fetch('/api/catalog', { cache: 'no-store' })
      .then((r) => (r.ok ? r.json() : null))
      .then((data) => (data && typeof data === 'object' ? data : null))
      .catch(() => null)
  }
  return loadPromise
}

// ── Escritura del catálogo ──────────────────────────────────────────────────────
// Guardamos por separado lo último conocido de cada parte (productos/categorías)
// para poder publicar el catálogo completo aunque solo cambie una de las dos.
const snapshot = { products: undefined, categories: undefined }
export function rememberSlice(key, value) { snapshot[key] = value }

let pushTimer
// Publica el snapshot actual. Devuelve { ok, ... }. Si no hay token, no hace nada.
export function pushRemoteCatalog() {
  const token = getAdminToken()
  if (!token) return Promise.resolve({ ok: false, reason: 'no-token' })
  clearTimeout(pushTimer)
  return new Promise((resolve) => {
    pushTimer = setTimeout(() => {
      fetch('/api/catalog', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          products: snapshot.products ?? [],
          categories: snapshot.categories ?? [],
        }),
      })
        .then(async (r) => resolve({ ok: r.ok, status: r.status }))
        .catch(() => resolve({ ok: false, reason: 'network' }))
    }, 500)
  })
}

// ── Subida de medios (fotos/videos) a la nube ───────────────────────────────────
// Recibe un Blob/File. Devuelve la URL pública, o null si no se pudo (sin token,
// sin backend o error de red) para poder caer al guardado local.
export async function uploadMedia(file, kind = 'img', name) {
  const token = getAdminToken()
  if (!token || !file) return null
  const filename = name || file.name || `${kind}`
  try {
    const res = await fetch(
      `/api/upload?kind=${encodeURIComponent(kind)}&name=${encodeURIComponent(filename)}`,
      {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': file.type || 'application/octet-stream',
        },
        body: file,
      }
    )
    if (!res.ok) return null
    const data = await res.json()
    return data?.url || null
  } catch {
    return null
  }
}

// ── Publicación completa (migra fotos/videos locales a la nube) ─────────────────
// Recorre los productos y sube a la nube cualquier media que todavía viva local
// (fotos 'idb:<key>' y videos { key }), reemplazándola por su URL pública. Así
// el catálogo que se publica es visible desde cualquier dispositivo.
async function migrateProductsMedia(products, onStep) {
  const out = []
  for (const p of products) {
    const imagenes = []
    for (const src of p.imagenes || []) {
      if (typeof src === 'string' && src.startsWith('idb:')) {
        const blob = await getImage(src.slice(4))
        const url = blob ? await uploadMedia(blob, 'img', 'foto.jpg') : null
        imagenes.push(url || src) // si falla la subida, se deja la referencia local
        onStep?.()
      } else if (src) {
        imagenes.push(src)
      }
    }
    const videos = []
    for (const v of p.videos || []) {
      if (v?.key) {
        const blob = await getVideo(v.key)
        const url = blob ? await uploadMedia(blob, 'vid', 'video.mp4') : null
        videos.push(url ? { url } : v)
        onStep?.()
      } else if (v?.url) {
        videos.push({ url: v.url })
      }
    }
    out.push({ ...p, imagenes, videos, imagen_url: imagenes[0] || '' })
  }
  return out
}

// Cuenta cuántos medios hay que subir (para mostrar progreso).
export function countLocalMedia(products) {
  let n = 0
  for (const p of products || []) {
    for (const src of p.imagenes || []) {
      if (typeof src === 'string' && src.startsWith('idb:')) n++
    }
    for (const v of p.videos || []) {
      if (v?.key) n++
    }
  }
  return n
}

// Migra medios locales y publica el catálogo completo.
// Devuelve { ok, products } — products ya con las URLs migradas para guardarlo
// también en local y no volver a subir lo mismo la próxima vez.
export async function publishCatalog({ products, categories }, onStep) {
  const token = getAdminToken()
  if (!token) return { ok: false, reason: 'no-token' }
  const migrated = await migrateProductsMedia(products || [], onStep)
  rememberSlice('products', migrated)
  rememberSlice('categories', categories || [])
  const res = await pushRemoteCatalog()
  return { ...res, products: migrated }
}
