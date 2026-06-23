// Función serverless: autoriza la subida DIRECTA de videos desde el navegador a
// Vercel Blob. Así el archivo no pasa por la función (que tiene tope de ~4,5 MB)
// y se pueden subir videos pesados.
//
// El navegador llama a /api/blob-upload (vía la librería @vercel/blob/client),
// acá validamos el ADMIN_TOKEN y, si está bien, se emite el permiso de subida.
import { handleUpload } from '@vercel/blob/client'

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST')
    return res.status(405).json({ error: 'Método no permitido' })
  }
  if (!process.env.BLOB_READ_WRITE_TOKEN) {
    return res.status(503).json({ error: 'Almacenamiento de videos no configurado' })
  }

  try {
    const jsonResponse = await handleUpload({
      body: req.body,
      request: req,
      // Se ejecuta antes de emitir el permiso: acá controlamos quién puede subir.
      onBeforeGenerateToken: async (_pathname, clientPayload) => {
        if (!process.env.ADMIN_TOKEN || clientPayload !== process.env.ADMIN_TOKEN) {
          throw new Error('No autorizado')
        }
        return {
          allowedContentTypes: ['video/*', 'image/*'],
          maximumSizeInBytes: 200 * 1024 * 1024, // 200 MB
          addRandomSuffix: true,
        }
      },
      onUploadCompleted: async () => {
        // No necesitamos hacer nada al completar; la URL la guarda el cliente.
      },
    })
    return res.status(200).json(jsonResponse)
  } catch (e) {
    return res.status(400).json({ error: String(e?.message || e) })
  }
}
