// Función serverless: sirve una foto/clip guardado en la base (PostgreSQL / Neon).
//   GET /api/media?id=<id>
// Cada id es único e inmutable, así que se cachea fuerte (navegador + CDN).
import { neon } from '@neondatabase/serverless'

const CONN =
  process.env.DATABASE_URL ||
  process.env.POSTGRES_URL ||
  process.env.NEON_DATABASE_URL ||
  process.env.POSTGRES_PRISMA_URL

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    res.setHeader('Allow', 'GET')
    return res.status(405).json({ error: 'Método no permitido' })
  }
  if (!CONN) return res.status(503).json({ error: 'Base de datos no configurada' })

  const id = String(req.query?.id || '').trim()
  if (!id) return res.status(400).json({ error: 'Falta id' })

  try {
    const sql = neon(CONN)
    const rows = await sql`
      SELECT content_type, encode(bytes, 'base64') AS b64 FROM media WHERE id = ${id}
    `
    if (!rows.length) return res.status(404).json({ error: 'No encontrado' })

    const buf = Buffer.from(rows[0].b64, 'base64')
    res.setHeader('Content-Type', rows[0].content_type || 'application/octet-stream')
    res.setHeader('Cache-Control', 'public, max-age=31536000, s-maxage=31536000, immutable')
    res.setHeader('Content-Length', String(buf.length))
    return res.status(200).send(buf)
  } catch (e) {
    return res.status(500).json({ error: String(e?.message || e) })
  }
}
