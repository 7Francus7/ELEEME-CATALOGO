// Función serverless: sube una foto (o clip chico) a la base (PostgreSQL / Neon)
// y devuelve una URL para mostrarla: /api/media?id=<id>
//
// Requiere Authorization: Bearer <ADMIN_TOKEN>. El cuerpo es el archivo crudo.
// Límite de Vercel: ~4.5 MB por request → ideal para fotos. Los videos pesados
// no entran por acá (el cliente cae a guardado local / link).
import { neon } from '@neondatabase/serverless'
import { timingSafeEqual } from 'node:crypto'

export const config = { api: { bodyParser: false } }

const CONN =
  process.env.DATABASE_URL ||
  process.env.POSTGRES_URL ||
  process.env.NEON_DATABASE_URL ||
  process.env.POSTGRES_PRISMA_URL

const MAX_BYTES = 4 * 1024 * 1024 // 4 MB de margen bajo el límite de Vercel

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

function readBody(req, limit) {
  return new Promise((resolve, reject) => {
    const chunks = []
    let size = 0
    req.on('data', (c) => {
      size += c.length
      if (size > limit) {
        reject(new Error('too-large'))
        req.destroy()
        return
      }
      chunks.push(c)
    })
    req.on('end', () => resolve(Buffer.concat(chunks)))
    req.on('error', reject)
  })
}

async function ensureTables(sql) {
  await sql`CREATE TABLE IF NOT EXISTS media (
    id TEXT PRIMARY KEY,
    content_type TEXT NOT NULL,
    bytes BYTEA NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
  )`
}

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST')
    return res.status(405).json({ error: 'Método no permitido' })
  }
  if (!CONN) return res.status(503).json({ error: 'Base de datos no configurada' })
  if (!tokenOk(req)) {
    return res.status(401).json({ error: 'No autorizado' })
  }

  try {
    const sql = neon(CONN)
    await ensureTables(sql)

    let body
    try {
      body = await readBody(req, MAX_BYTES)
    } catch (e) {
      if (String(e?.message) === 'too-large') {
        return res.status(413).json({ error: 'Archivo demasiado pesado para la nube' })
      }
      throw e
    }
    if (!body.length) return res.status(400).json({ error: 'Archivo vacío' })

    const kind = String(req.query?.kind || 'img').replace(/[^a-z]/gi, '').slice(0, 8) || 'img'
    const id = `${kind}_${Date.now()}_${Math.random().toString(36).slice(2, 9)}`
    const contentType = req.headers['content-type'] || 'application/octet-stream'

    await sql`
      INSERT INTO media (id, content_type, bytes)
      VALUES (${id}, ${contentType}, decode(${body.toString('hex')}, 'hex'))
    `
    return res.status(200).json({ url: `/api/media?id=${encodeURIComponent(id)}` })
  } catch (e) {
    console.error('upload error:', e)
    return res.status(500).json({ error: 'Error al subir el archivo' })
  }
}
