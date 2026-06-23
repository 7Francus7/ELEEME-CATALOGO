// Función serverless: catálogo compartido en la nube (PostgreSQL / Neon).
//
//   GET  /api/catalog  → devuelve { products, categories } publicados, o 404 si
//                        todavía no se publicó nada.
//   POST /api/catalog  → guarda { products, categories }. Requiere el header
//                        Authorization: Bearer <ADMIN_TOKEN>.
import { neon } from '@neondatabase/serverless'

const CONN =
  process.env.DATABASE_URL ||
  process.env.POSTGRES_URL ||
  process.env.NEON_DATABASE_URL ||
  process.env.POSTGRES_PRISMA_URL

function getToken(req) {
  const header = req.headers.authorization || req.headers.Authorization || ''
  return header.replace(/^Bearer\s+/i, '').trim()
}

async function ensureTables(sql) {
  await sql`CREATE TABLE IF NOT EXISTS catalog (
    id INT PRIMARY KEY,
    data JSONB NOT NULL,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
  )`
}

export default async function handler(req, res) {
  if (!CONN) {
    return res.status(503).json({ error: 'Base de datos no configurada' })
  }
  const sql = neon(CONN)

  try {
    await ensureTables(sql)
  } catch (e) {
    return res.status(500).json({ error: 'No se pudo inicializar la base', detail: String(e?.message || e) })
  }

  if (req.method === 'GET') {
    try {
      const rows = await sql`SELECT data FROM catalog WHERE id = 1`
      if (!rows.length) return res.status(404).json(null)
      res.setHeader('Cache-Control', 'no-store')
      return res.status(200).json(rows[0].data)
    } catch (e) {
      return res.status(500).json({ error: String(e?.message || e) })
    }
  }

  if (req.method === 'POST') {
    if (!process.env.ADMIN_TOKEN || getToken(req) !== process.env.ADMIN_TOKEN) {
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
      return res.status(500).json({ error: String(e?.message || e) })
    }
  }

  res.setHeader('Allow', 'GET, POST')
  return res.status(405).json({ error: 'Método no permitido' })
}
