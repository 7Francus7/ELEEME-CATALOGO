import { useEffect, useState } from 'react'
import { getImage } from '../utils/videoStore'

// Muestra una imagen del catálogo resolviendo su origen:
//   - 'idb:<key>'  → imagen subida, guardada en IndexedDB (se carga como object URL)
//   - cualquier otra cosa (http…, data:base64) → se usa directo
// Si la imagen falla en cargar, cae a un placeholder con el nombre del producto.
export default function CatalogImage({ src, alt = '', className = '', onClick, fallbackText }) {
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

  return (
    <img
      src={resolved || `https://placehold.co/400x400/f5f5f7/86868b?text=${encodeURIComponent(fallbackText || alt || '')}`}
      alt={alt}
      onClick={onClick}
      className={className}
      onError={(e) => {
        e.target.src = `https://placehold.co/400x400/f5f5f7/86868b?text=${encodeURIComponent(fallbackText || alt || '')}`
      }}
    />
  )
}
