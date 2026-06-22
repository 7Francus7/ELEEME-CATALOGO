// Almacén de medios en IndexedDB (videos e imágenes subidas desde el celular).
// localStorage (donde viven los productos) tiene ~5MB y se satura con pocas fotos
// o un solo video en base64. IndexedDB aguanta cientos de MB, así que los archivos
// pesados van acá y en el producto guardamos solo la clave de referencia.

const DB_NAME = 'eleeme_media'
const VIDEO_STORE = 'videos'
const IMAGE_STORE = 'images'

function openDB() {
  return new Promise((resolve, reject) => {
    const req = indexedDB.open(DB_NAME, 2)
    req.onupgradeneeded = () => {
      const db = req.result
      if (!db.objectStoreNames.contains(VIDEO_STORE)) db.createObjectStore(VIDEO_STORE)
      if (!db.objectStoreNames.contains(IMAGE_STORE)) db.createObjectStore(IMAGE_STORE)
    }
    req.onsuccess = () => resolve(req.result)
    req.onerror = () => reject(req.error)
  })
}

function putMedia(store, key, blob) {
  return openDB().then((db) => new Promise((resolve, reject) => {
    const tx = db.transaction(store, 'readwrite')
    tx.objectStore(store).put(blob, key)
    tx.oncomplete = () => resolve(key)
    tx.onerror = () => reject(tx.error)
  }))
}

function getMedia(store, key) {
  return openDB().then((db) => new Promise((resolve, reject) => {
    const tx = db.transaction(store, 'readonly')
    const req = tx.objectStore(store).get(key)
    req.onsuccess = () => resolve(req.result || null)
    req.onerror = () => reject(req.error)
  }))
}

function deleteMedia(store, key) {
  if (!key) return Promise.resolve()
  return openDB().then((db) => new Promise((resolve, reject) => {
    const tx = db.transaction(store, 'readwrite')
    tx.objectStore(store).delete(key)
    tx.oncomplete = () => resolve()
    tx.onerror = () => reject(tx.error)
  }))
}

// ─── Videos ───────────────────────────────────────────────────────────────────
export const putVideo = (key, blob) => putMedia(VIDEO_STORE, key, blob)
export const getVideo = (key) => getMedia(VIDEO_STORE, key)
export const deleteVideo = (key) => deleteMedia(VIDEO_STORE, key)

// ─── Imágenes ───────────────────────────────────────────────────────────────────
export const putImage = (key, blob) => putMedia(IMAGE_STORE, key, blob)
export const getImage = (key) => getMedia(IMAGE_STORE, key)
export const deleteImage = (key) => deleteMedia(IMAGE_STORE, key)
