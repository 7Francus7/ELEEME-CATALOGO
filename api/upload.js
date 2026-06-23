// Función serverless: sube una foto o video a la nube (Vercel Blob) y devuelve
// su URL pública. Requiere Authorization: Bearer <ADMIN_TOKEN>.
//
// El cuerpo del request es el archivo crudo (binario). El tipo y el nombre se
// pasan por query string: /api/upload?kind=img&name=foto.jpg
import { put } from '@vercel/blob'

// Recibimos el archivo como stream crudo, no como JSON.
export const config = { api: { bodyParser: false } }

function getToken(req) {
  const header = req.headers.authorization || req.headers.Authorization || ''
  return header.replace(/^Bearer\s+/i, '').trim()
}

function readBody(req) {
  return new Promise((resolve, reject) => {
    const chunks = []
    req.on('data', (c) => chunks.push(c))
    req.on('end', () => resolve(Buffer.concat(chunks)))
    req.on('error', reject)
  })
}

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST')
    return res.status(405).json({ error: 'Método no permitido' })
  }
  if (!process.env.BLOB_READ_WRITE_TOKEN) {
    return res.status(503).json({ error: 'Almacenamiento no configurado' })
  }
  if (!process.env.ADMIN_TOKEN || getToken(req) !== process.env.ADMIN_TOKEN) {
    return res.status(401).json({ error: 'No autorizado' })
  }

  try {
    const kind = String(req.query?.kind || 'img').replace(/[^a-z]/gi, '').slice(0, 8) || 'img'
    const rawName = String(req.query?.name || 'archivo')
    const safeName = rawName.replace(/[^a-zA-Z0-9._-]/g, '_').slice(-48) || 'archivo'
    const pathname = `media/${kind}/${Date.now()}_${Math.random().toString(36).slice(2, 7)}_${safeName}`

    const body = await readBody(req)
    if (!body.length) return res.status(400).json({ error: 'Archivo vacío' })

    const blob = await put(pathname, body, {
      access: 'public',
      contentType: req.headers['content-type'] || 'application/octet-stream',
      addRandomSuffix: false,
    })
    return res.status(200).json({ url: blob.url })
  } catch (e) {
    return res.status(500).json({ error: String(e?.message || e) })
  }
}
