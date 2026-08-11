import { useEffect, useState } from 'react'
import { getImage } from '../utils/videoStore'

// Placeholder local (data URI). Antes se pedía a placehold.co: eso agregaba una
// request a un tercero por cada imagen faltante y dejaba huecos rotos si ese
// servicio no respondía. Ahora se dibuja en el navegador, sin red.
function placeholderFor(text) {
  const label = String(text || '').trim().slice(0, 42)
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 400">
<rect width="400" height="400" fill="#f5f5f7"/>
<g fill="none" stroke="#c7c7cc" stroke-width="8" stroke-linecap="round" stroke-linejoin="round">
<rect x="140" y="150" width="120" height="92" rx="10"/>
<path d="M140 214l30-28a12 12 0 0 1 17 0l25 25"/>
<path d="M198 208l18-17a12 12 0 0 1 17 0l27 26"/>
<circle cx="176" cy="176" r="9"/>
</g>
<text x="200" y="286" text-anchor="middle" fill="#86868b"
 font-family="Inter, -apple-system, Segoe UI, sans-serif" font-size="19">${
   label.replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&apos;' }[c]))
 }</text>
</svg>`
  return `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svg)}`
}

// Muestra una imagen del catálogo resolviendo su origen:
//   - 'idb:<key>'  → imagen subida, guardada en IndexedDB (se carga como object URL)
//   - cualquier otra cosa (http…, data:base64) → se usa directo
// Si la imagen falla en cargar, cae a un placeholder con el nombre del producto.
export default function CatalogImage({
  src,
  alt = '',
  className = '',
  onClick,
  fallbackText,
  loading = 'lazy',
}) {
  const isIdb = typeof src === 'string' && src.startsWith('idb:')
  const [resolved, setResolved] = useState(isIdb ? '' : src || '')

  useEffect(() => {
    let objectUrl
    if (typeof src === 'string' && src.startsWith('idb:')) {
      setResolved('')
      getImage(src.slice(4)).then((blob) => {
        if (blob) {
          objectUrl = URL.createObjectURL(blob)
          setResolved(objectUrl)
        }
      })
    } else {
      setResolved(src || '')
    }
    return () => { if (objectUrl) URL.revokeObjectURL(objectUrl) }
  }, [src])

  const placeholder = placeholderFor(fallbackText || alt)

  return (
    <img
      src={resolved || placeholder}
      alt={alt}
      onClick={onClick}
      className={className}
      loading={loading}
      decoding="async"
      onError={(e) => {
        if (e.target.src !== placeholder) e.target.src = placeholder
      }}
    />
  )
}
