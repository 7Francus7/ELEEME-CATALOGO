// Función serverless: catálogo compartido en la nube (PostgreSQL / Neon).
//
//   GET  /api/catalog            → devuelve { products, categories } publicados,
//                                  o 404 si todavía no se publicó nada.
//   GET  /api/catalog?verify=1   → valida la clave (Authorization: Bearer <ADMIN_TOKEN>)
//                                  sin tocar la base. Lo usa el login del panel admin.
//   POST /api/catalog            → guarda { products, categories }. Requiere el header
//                                  Authorization: Bearer <ADMIN_TOKEN>.
import { neon } from '@neondatabase/serverless'
import { timingSafeEqual } from 'node:crypto'

const CONN =
  process.env.DATABASE_URL ||
  process.env.POSTGRES_URL ||
  process.env.NEON_DATABASE_URL ||
  process.env.POSTGRES_PRISMA_URL

// Comparación en tiempo constante para no filtrar la clave por timing.
function tokenOk(req) {
  const expected = process.env.ADMIN_TOKEN || ''
  if (!expected) return false
  const header = req.headers.authorization || req.headers.Authorization || ''
  const provided = header.replace(/^Bearer\s+/i, '').trim()
  const a = Buffer.from(provided)
  const b = Buffer.from(expected)
  return a.length === b.length && timingSafeEqual(a, b)
}

async function ensureTables(sql) {
  await sql`CREATE TABLE IF NOT EXISTS catalog (
    id INT PRIMARY KEY,
    data JSONB NOT NULL,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
  )`
}

export default async function handler(req, res) {
  // Verificación de clave del panel admin: no necesita base de datos.
  if (req.method === 'GET' && req.query?.verify) {
    if (!process.env.ADMIN_TOKEN) {
      return res.status(503).json({ error: 'Publicación no configurada' })
    }
    if (!tokenOk(req)) return res.status(401).json({ error: 'No autorizado' })
    return res.status(200).json({ ok: true })
  }

  if (!CONN) {
    return res.status(503).json({ error: 'Base de datos no configurada' })
  }
  const sql = neon(CONN)

  try {
    await ensureTables(sql)
  } catch (e) {
    console.error('catalog init error:', e)
    return res.status(500).json({ error: 'No se pudo inicializar la base' })
  }

  if (req.method === 'GET') {
    try {
      const rows = await sql`SELECT data FROM catalog WHERE id = 1`
      if (!rows.length) return res.status(404).json(null)
      res.setHeader('Cache-Control', 'no-store')
      return res.status(200).json(rows[0].data)
    } catch (e) {
      console.error('catalog read error:', e)
      return res.status(500).json({ error: 'Error al leer el catálogo' })
    }
  }

  if (req.method === 'POST') {
    if (!tokenOk(req)) {
      return res.status(401).json({ error: 'No autorizado' })
    }
    try {
      const body = typeof req.body === 'string' ? JSON.parse(req.body || '{}') : (req.body || {})
      const payload = {
        products: Array.isArray(body.products) ? body.products : [],
        categories: Array.isArray(body.categories) ? body.categories : [],
      }
      await sql`
        INSERT INTO catalog (id, data, updated_at)
        VALUES (1, ${JSON.stringify(payload)}::jsonb, now())
        ON CONFLICT (id) DO UPDATE SET data = EXCLUDED.data, updated_at = now()
      `
      return res.status(200).json({ ok: true })
    } catch (e) {
      console.error('catalog write error:', e)
      return res.status(500).json({ error: 'Error al guardar el catálogo' })
    }
  }

  res.setHeader('Allow', 'GET, POST')
  return res.status(405).json({ error: 'Método no permitido' })
}
