import { useEffect, useMemo, useState } from 'react'
import { WHATSAPP_NUMBER } from '../data/catalogConfig'
import { formatPrice, modelStock, usesModels } from '../data/products'
import { describePackItems, estimatedPackPrice, packHasStock, resolvePackProducts } from '../utils/packSelectors'

const CART_STORAGE_KEY = 'eleeme_cart_v1'

function loadCart() {
  try {
    const raw = localStorage.getItem(CART_STORAGE_KEY)
    const parsed = raw ? JSON.parse(raw) : []
    if (!Array.isArray(parsed)) return []

    return parsed.filter((item) => {
      if ((item?.type || 'product') === 'pack') {
        return Boolean(item?.packId) && item?.quantity > 0
      }
      return Number.isFinite(item?.productId) && item?.quantity > 0
    })
  } catch {
    return []
  }
}

function productItemKey(productId, model) {
  return `product::${productId}::${model || ''}`
}

function packItemKey(packId) {
  return `pack::${packId}`
}

function buildWhatsAppMessage(items, totalPrice) {
  const lines = ['Hola, quiero hacer este pedido:', '']

  items.forEach((item) => {
    if (item.type === 'pack') {
      lines.push(`- Pack ${item.name}`)
      if (item.includedItems.length) {
        lines.push(`  Incluye: ${item.includedItems.join(', ')}`)
      }
    } else {
      const detail = item.model ? `${item.name} · ${item.model}` : item.name
      lines.push(`- ${detail}`)
    }

    const quantityLine = [`x${item.quantity}`]
    if (typeof item.price === 'number') quantityLine.push(formatPrice(item.price))
    if (typeof item.lineTotal === 'number') quantityLine.push(`= ${formatPrice(item.lineTotal)}`)

    lines.push(`  ${quantityLine.join(' · ')}`)
    lines.push('')
  })

  if (typeof totalPrice === 'number') {
    lines.push(`Total estimado: ${formatPrice(totalPrice)}`)
    lines.push('')
  }

  lines.push('Me confirmas stock y forma de entrega?')
  return lines.join('\n')
}

export function useCart(products, packs) {
  const [rawItems, setRawItems] = useState(loadCart)

  useEffect(() => {
    localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(rawItems))
  }, [rawItems])

  const items = useMemo(() => {
    return rawItems
      .map((rawItem) => {
        if ((rawItem.type || 'product') === 'pack') {
          const pack = packs.find((entry) => entry.id === rawItem.packId)
          if (!pack) return null

          const price = Number.isFinite(pack.price) ? pack.price : estimatedPackPrice(pack, products)
          const quantity = Number(rawItem.quantity) || 0

          return {
            key: packItemKey(pack.id),
            type: 'pack',
            packId: pack.id,
            quantity,
            name: pack.name,
            price,
            lineTotal: price !== null ? price * quantity : null,
            includedItems: describePackItems(pack, products),
            availableStock: packHasStock(pack, products) ? null : 0,
          }
        }

        const product = products.find((entry) => entry.id === rawItem.productId)
        if (!product) return null

        const price = typeof product.precio === 'number' ? product.precio : null
        const quantity = Number(rawItem.quantity) || 0

        return {
          key: productItemKey(rawItem.productId, rawItem.model),
          type: 'product',
          productId: rawItem.productId,
          model: rawItem.model || null,
          quantity,
          name: product.nombre,
          price,
          lineTotal: price !== null ? price * quantity : null,
          availableStock: modelStock(product, rawItem.model || null),
        }
      })
      .filter(Boolean)
  }, [packs, products, rawItems])

  const totalItems = useMemo(
    () => items.reduce((sum, item) => sum + item.quantity, 0),
    [items]
  )

  const totalPrice = useMemo(() => {
    if (!items.length) return null
    if (items.some((item) => typeof item.lineTotal !== 'number')) return null
    return items.reduce((sum, item) => sum + item.lineTotal, 0)
  }, [items])

  const whatsappUrl = useMemo(() => {
    if (!items.length) return `https://wa.me/${WHATSAPP_NUMBER}`
    return `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(buildWhatsAppMessage(items, totalPrice))}`
  }, [items, totalPrice])

  const addItem = (product, selectedModel = null) => {
    if (usesModels(product) && !selectedModel) return 'missing_model'

    const availableStock = modelStock(product, selectedModel)
    if (availableStock !== null && availableStock <= 0) return 'out_of_stock'

    let nextStatus = 'added'

    setRawItems((current) => {
      const key = productItemKey(product.id, selectedModel)
      const existing = current.find((item) => productItemKey(item.productId, item.model) === key)

      if (existing) {
        if (availableStock !== null && existing.quantity >= availableStock) {
          nextStatus = 'max_stock'
          return current
        }

        return current.map((item) =>
          productItemKey(item.productId, item.model) === key
            ? { ...item, quantity: item.quantity + 1 }
            : item
        )
      }

      return [...current, { type: 'product', productId: product.id, model: selectedModel || '', quantity: 1 }]
    })

    return nextStatus
  }

  const addPack = (pack) => {
    if (!packHasStock(pack, products)) return 'out_of_stock'

    setRawItems((current) => {
      const key = packItemKey(pack.id)
      const existing = current.find((item) => (item.type || 'product') === 'pack' && packItemKey(item.packId) === key)

      if (existing) {
        return current.map((item) =>
          (item.type || 'product') === 'pack' && packItemKey(item.packId) === key
            ? { ...item, quantity: item.quantity + 1 }
            : item
        )
      }

      return [...current, { type: 'pack', packId: pack.id, quantity: 1 }]
    })

    return 'added'
  }

  const incrementItem = (target) => {
    if (target.type === 'pack') {
      setRawItems((current) =>
        current.map((item) =>
          (item.type || 'product') === 'pack' && packItemKey(item.packId) === target.key
            ? { ...item, quantity: item.quantity + 1 }
            : item
        )
      )
      return 'updated'
    }

    const product = products.find((entry) => entry.id === target.productId)
    if (!product) return 'missing_product'

    const availableStock = modelStock(product, target.model || null)
    let nextStatus = 'updated'

    setRawItems((current) =>
      current.map((item) => {
        if (productItemKey(item.productId, item.model) !== target.key) return item
        if (availableStock !== null && item.quantity >= availableStock) {
          nextStatus = 'max_stock'
          return item
        }
        return { ...item, quantity: item.quantity + 1 }
      })
    )

    return nextStatus
  }

  const decrementItem = (target) => {
    setRawItems((current) =>
      current
        .map((item) => {
          if ((target.type || 'product') === 'pack') {
            return (item.type || 'product') === 'pack' && packItemKey(item.packId) === target.key
              ? { ...item, quantity: item.quantity - 1 }
              : item
          }

          return productItemKey(item.productId, item.model) === target.key
            ? { ...item, quantity: item.quantity - 1 }
            : item
        })
        .filter((item) => item.quantity > 0)
    )
  }

  const removeItem = (target) => {
    setRawItems((current) =>
      current.filter((item) => {
        if ((target.type || 'product') === 'pack') {
          return !((item.type || 'product') === 'pack' && packItemKey(item.packId) === target.key)
        }
        return productItemKey(item.productId, item.model) !== target.key
      })
    )
  }

  const clearCart = () => setRawItems([])

  return {
    items,
    totalItems,
    totalPrice,
    whatsappUrl,
    addItem,
    addPack,
    incrementItem,
    decrementItem,
    removeItem,
    clearCart,
  }
}
