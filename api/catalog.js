// Función serverless: catálogo compartido en la nube (Vercel Blob).
//
//   GET  /api/catalog  → devuelve { products, categories } publicados, o 404 si
//                        todavía no se publicó nada.
//   POST /api/catalog  → guarda { products, categories }. Requiere el header
//                        Authorization: Bearer <ADMIN_TOKEN>.
//
// El JSON se guarda siempre en el mismo archivo (catalog.json) y se sirve sin
// cache para que todos vean la última versión apenas se publica.
import { put, list } from '@vercel/blob'

const CATALOG_PATH = 'catalog/catalog.json'

function getToken(req) {
  const header = req.headers.authorization || req.headers.Authorization || ''
  return header.replace(/^Bearer\s+/i, '').trim()
}

export default async function handler(req, res) {
  // Sin token de escritura configurado en el proyecto → backend no disponible.
  if (!process.env.BLOB_READ_WRITE_TOKEN) {
    return res.status(503).json({ error: 'Almacenamiento no configurado' })
  }

  if (req.method === 'GET') {
    try {
      const { blobs } = await list({ prefix: CATALOG_PATH })
      const blob = blobs.find((b) => b.pathname === CATALOG_PATH)
      if (!blob) return res.status(404).json(null)
      const r = await fetch(blob.url, { cache: 'no-store' })
      if (!r.ok) return res.status(404).json(null)
      const data = await r.json()
      res.setHeader('Cache-Control', 'no-store')
      return res.status(200).json(data)
    } catch (e) {
      return res.status(500).json({ error: String(e?.message || e) })
    }
  }

  if (req.method === 'POST') {
    if (!process.env.ADMIN_TOKEN || getToken(req) !== process.env.ADMIN_TOKEN) {
      return res.status(401).json({ error: 'No autorizado' })
    }
    try {
      const payload = typeof req.body === 'string' ? req.body : JSON.stringify(req.body ?? {})
      await put(CATALOG_PATH, payload, {
        access: 'public',
        contentType: 'application/json; charset=utf-8',
        addRandomSuffix: false,
        allowOverwrite: true,
        cacheControlMaxAge: 0,
      })
      return res.status(200).json({ ok: true })
    } catch (e) {
      return res.status(500).json({ error: String(e?.message || e) })
    }
  }

  res.setHeader('Allow', 'GET, POST')
  return res.status(405).json({ error: 'Método no permitido' })
}
