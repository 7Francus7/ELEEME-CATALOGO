import { useEffect, useRef, useState } from 'react'

const FEEDBACK_MS = 1600

// Las cards del catálogo llaman a addItem y hasta ahora tiraban el resultado:
// si el producto ya estaba en el máximo de stock, tocar "Agregar" no hacía
// nada visible y parecía roto. Este hook guarda el estado devuelto y lo limpia
// solo, para que el botón pueda contestar sin que cada card repita la lógica.
export function useAddToCartFeedback(onAddToCart) {
  const [status, setStatus] = useState('')
  const timer = useRef(null)

  useEffect(() => () => clearTimeout(timer.current), [])

  const addToCart = (product, model = null) => {
    const result = onAddToCart?.(product, model) || ''
    setStatus(result)

    clearTimeout(timer.current)
    timer.current = setTimeout(() => setStatus(''), FEEDBACK_MS)

    return result
  }

  return { status, addToCart }
}

// Estilo del botón mientras dura el mensaje. Devuelve null para los estados
// que no tienen nada que decir, así la card usa su apariencia normal.
export function addToCartFeedback(status) {
  switch (status) {
    case 'added':
      return { label: 'Agregado ✓', className: 'bg-green-600 text-white' }
    case 'max_stock':
      return { label: 'Sin más stock', className: 'bg-amber-500 text-white' }
    case 'out_of_stock':
      return { label: 'Sin stock', className: 'bg-amber-500 text-white' }
    default:
      return null
  }
}
