import { useState, useRef, useEffect } from 'react'
import { DEFAULT_STOCK_KEY, formatPrice, productImages } from '../data/products'
import { COLOR_PRESETS, MODEL_CATEGORIES, MODELS } from '../data/catalogConfig'
import { putVideo, deleteVideo, getVideo, putImage, deleteImage, getImage } from '../utils/videoStore'
import {
  getAdminToken, setAdminToken, hasAdminToken,
  uploadMedia, publishCatalog, countLocalMedia, rememberSlice,
} from '../utils/remoteStore'
import { XIcon, ChevronLeftIcon } from './Icons'
import CatalogImage from './CatalogImage'

// ─── CONTRASEÑA DEL PANEL ADMIN ───────────────────────────────────────────────
const ADMIN_PASSWORD = 'eleeme2024'

const EMPTY_FORM = {
  nombre: '',
  categoria: 'Fundas',
  precio: '',
  precio_original: '',
  tag: '',
  compatible_con: '',
  modelos: [],
  imagenes: [],
  imagen_ajuste: 'cover',
  videos: [],
  descripcion: '',
  por_que_lo_necesitas: '',
  destacado: false,
  ocultar_descuento_nro: false,
  ocultar_descuento_porcentaje: false,
  colores: [],
  stock: {},
  notificar_cuando_stock: [],
  stock_gestion: 'manual',
}

// Redimensiona la imagen a máx 1000px y la devuelve como Blob JPEG 85%.
// Las fotos subidas se guardan en IndexedDB (no en localStorage, que es chico y se
// satura con pocas fotos en base64), referenciadas en el producto como 'idb:<key>'.
function resizeImageToBlob(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = (e) => {
      const img = new Image()
      img.onload = () => {
        const MAX = 1000
        const ratio = Math.min(MAX / img.width, MAX / img.height, 1)
        const canvas = document.createElement('canvas')
        canvas.width = Math.round(img.width * ratio)
        canvas.height = Math.round(img.height * ratio)
        canvas.getContext('2d').drawImage(img, 0, 0, canvas.width, canvas.height)
        canvas.toBlob(
          (blob) => (blob ? resolve(blob) : reject(new Error('No se pudo generar la imagen'))),
          'image/jpeg',
          0.85
        )
      }
      img.onerror = reject
      img.src = e.target.result
    }
    reader.onerror = reject
    reader.readAsDataURL(file)
  })
}

// Iconos locales para el panel
const EditIcon = ({ className }) => (
  <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L10.582 16.07a4.5 4.5 0 01-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 011.13-1.897l8.932-8.931zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0115.75 21H5.25A2.25 2.25 0 013 18.75V8.25A2.25 2.25 0 015.25 6H10" />
  </svg>
)

const TrashIcon = ({ className }) => (
  <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0" />
  </svg>
)

const DuplicateIcon = ({ className }) => (
  <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 17.25v3.375c0 .621-.504 1.125-1.125 1.125h-9.75a1.125 1.125 0 0 1-1.125-1.125V7.875c0-.621.504-1.125 1.125-1.125H6.75a9.06 9.06 0 0 1 1.5.124m7.5 10.376h3.375c.621 0 1.125-.504 1.125-1.125V11.25c0-4.46-3.243-8.161-7.5-8.876a9.06 9.06 0 0 0-1.5-.124H9.375c-.621 0-1.125.504-1.125 1.125v3.5m7.5 10.375H9.375a1.125 1.125 0 0 1-1.125-1.125v-9.25m12 6.625v-1.875a3.375 3.375 0 0 0-3.375-3.375h-1.5a1.125 1.125 0 0 1-1.125-1.125v-1.5a3.375 3.375 0 0 0-3.375-3.375H9.75" />
  </svg>
)

// ─── GESTOR DE CATEGORÍAS ─────────────────────────────────────────────────────
// Permite al cliente agregar, renombrar, reordenar y borrar las categorías que se
// muestran en el catálogo. Al renombrar, mueve también los productos a la nueva.
function CategoryManager({ categories, products, onSaveProducts, onSaveCategories, onReset, onClose }) {
  const [list, setList] = useState(() => categories.map((nombre) => ({ nombre, original: nombre })))
  const [nuevo, setNuevo] = useState('')
  const [error, setError] = useState('')

  const countFor = (name) => products.filter((p) => p.categoria === name).length

  const addCategory = () => {
    const name = nuevo.trim()
    if (!name) return
    if (list.some((c) => c.nombre.trim().toLowerCase() === name.toLowerCase())) {
      setError('Esa categoría ya existe')
      return
    }
    setList((prev) => [...prev, { nombre: name, original: null }])
    setNuevo('')
    setError('')
  }

  const rename = (index, value) => setList((prev) => prev.map((c, i) => (i === index ? { ...c, nombre: value } : c)))

  const remove = (index) => {
    const target = list[index]
    const used = target.original ? countFor(target.original) : 0
    if (used > 0 && !window.confirm(`Hay ${used} producto(s) en "${target.original}". Si la borrás, dejan de aparecer hasta que les cambies la categoría. ¿Borrar igual?`)) return
    setList((prev) => prev.filter((_, i) => i !== index))
  }

  const move = (index, dir) => {
    const j = index + dir
    if (j < 0 || j >= list.length) return
    setList((prev) => {
      const next = [...prev]
      ;[next[index], next[j]] = [next[j], next[index]]
      return next
    })
  }

  const save = () => {
    const names = list.map((c) => c.nombre.trim()).filter(Boolean)
    if (!names.length) {
      setError('Tiene que quedar al menos una categoría')
      return
    }
    const lower = names.map((n) => n.toLowerCase())
    if (new Set(lower).size !== lower.length) {
      setError('Hay categorías repetidas')
      return
    }
    // Mapa de renombres para migrar los productos afectados
    const renames = list
      .filter((c) => c.original && c.nombre.trim() && c.nombre.trim() !== c.original)
      .map((c) => [c.original, c.nombre.trim()])
    if (renames.length) {
      const map = Object.fromEntries(renames)
      onSaveProducts(products.map((p) => (map[p.categoria] ? { ...p, categoria: map[p.categoria] } : p)))
    }
    onSaveCategories(names)
    onClose()
  }

  return (
    <div className="fixed inset-0 z-[60] bg-black/40 backdrop-blur-sm flex items-end sm:items-center justify-center p-0 sm:p-4 animate-fade-in" onClick={onClose}>
      <div className="bg-white dark:bg-[#1c1c1e] w-full sm:max-w-lg rounded-t-3xl sm:rounded-3xl shadow-2xl max-h-[90vh] flex flex-col" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between px-6 py-5 border-b border-gray-100 dark:border-white/10">
          <div>
            <h2 className="text-lg font-black dark:text-white tracking-tight">Categorías</h2>
            <p className="text-[11px] text-[#86868b]">Las que se ven en el catálogo. Arrastrá el orden con ▲▼.</p>
          </div>
          <button onClick={onClose} className="p-2 text-[#86868b] hover:bg-[#f5f5f7] dark:hover:bg-[#2c2c2e] rounded-full">
            <XIcon className="w-5 h-5" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto px-6 py-4 space-y-2">
          {list.map((c, i) => (
            <div key={i} className="flex items-center gap-2 bg-[#f5f5f7] dark:bg-[#2c2c2e] rounded-2xl p-2">
              <div className="flex flex-col">
                <button type="button" onClick={() => move(i, -1)} className="px-1 text-gray-400 hover:text-[#0071e3] leading-none">▲</button>
                <button type="button" onClick={() => move(i, 1)} className="px-1 text-gray-400 hover:text-[#0071e3] leading-none">▼</button>
              </div>
              <input
                value={c.nombre}
                onChange={(e) => rename(i, e.target.value)}
                className="flex-1 min-w-0 bg-white dark:bg-[#1c1c1e] dark:text-white rounded-xl px-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-[#0071e3]/20"
              />
              {c.original && countFor(c.original) > 0 && (
                <span className="text-[10px] font-bold text-[#86868b] whitespace-nowrap">{countFor(c.original)} prod.</span>
              )}
              <button type="button" onClick={() => remove(i)} className="p-2 text-gray-400 hover:text-red-500">
                <TrashIcon className="w-5 h-5" />
              </button>
            </div>
          ))}

          <div className="flex items-center gap-2 pt-2">
            <input
              value={nuevo}
              onChange={(e) => { setNuevo(e.target.value); setError('') }}
              onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), addCategory())}
              placeholder="Nueva categoría…"
              className="flex-1 min-w-0 bg-[#f5f5f7] dark:bg-[#2c2c2e] dark:text-white rounded-xl px-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-[#0071e3]/20"
            />
            <button type="button" onClick={addCategory} className="text-xs font-black uppercase tracking-widest text-white bg-[#0071e3] px-4 py-2.5 rounded-xl active:scale-95 transition-all">
              Agregar
            </button>
          </div>
          {error && <p className="text-red-500 text-xs">{error}</p>}
        </div>

        <div className="px-6 py-4 border-t border-gray-100 dark:border-white/10 flex items-center gap-3">
          <button type="button" onClick={onReset} className="text-xs font-bold text-[#86868b] hover:text-red-500">Restaurar predeterminadas</button>
          <button type="button" onClick={save} className="ml-auto bg-black dark:bg-white dark:text-black text-white font-black uppercase tracking-widest text-xs px-6 py-3 rounded-2xl active:scale-95 transition-all">
            Guardar
          </button>
        </div>
      </div>
    </div>
  )
}

export default function AdminPanel({ products, onSave, onReset, categories, onSaveCategories, onResetCategories, onClose }) {
  const [authenticated, setAuthenticated] = useState(false)
  const [categoryManagerOpen, setCategoryManagerOpen] = useState(false)
  const [pwInput, setPwInput] = useState('')
  const [pwError, setPwError] = useState(false)
  const [form, setForm] = useState(EMPTY_FORM)
  const [editingId, setEditingId] = useState(null)
  const [imageProcessing, setImageProcessing] = useState(false)
  const [videoProcessing, setVideoProcessing] = useState(false)
  const [imageUrlInput, setImageUrlInput] = useState('')
  const [videoUrlInput, setVideoUrlInput] = useState('')
  const [saveStatus, setSaveStatus] = useState('')
  const [searchQuery, setSearchQuery] = useState('')
  const [activeView, setActiveView] = useState('list') // 'list' | 'form'

  // ── Conexión con la nube ──────────────────────────────────────────────────────
  const [cloudOpen, setCloudOpen] = useState(false)
  const [tokenInput, setTokenInput] = useState(getAdminToken())
  const [connected, setConnected] = useState(hasAdminToken())
  const [publishing, setPublishing] = useState(false)
  const [publishMsg, setPublishMsg] = useState('')

  const fileRef = useRef()
  const videoFileRef = useRef()
  const formRef = useRef()

  const f = (field) => (e) => setForm((prev) => ({ ...prev, [field]: e.target.value }))

  const handleLogin = (e) => {
    e.preventDefault()
    if (pwInput === ADMIN_PASSWORD) {
      setAuthenticated(true)
    } else {
      setPwError(true)
      setPwInput('')
      setTimeout(() => setPwError(false), 1500)
    }
  }

  // Guardar / borrar el token de conexión con la nube
  const saveCloudToken = () => {
    setAdminToken(tokenInput)
    setConnected(hasAdminToken())
    setPublishMsg(hasAdminToken() ? 'Conectado ✓' : 'Desconectado')
    setTimeout(() => setPublishMsg(''), 2500)
  }

  // Publicar todo el catálogo online (sube fotos/videos locales y guarda en la nube)
  const handlePublish = async () => {
    if (!hasAdminToken()) {
      setCloudOpen(true)
      setPublishMsg('Primero pegá la clave y conectá.')
      return
    }
    const total = countLocalMedia(products)
    let done = 0
    setPublishing(true)
    setPublishMsg(total ? `Subiendo fotos/videos… 0/${total}` : 'Publicando…')
    try {
      const result = await publishCatalog(
        { products, categories },
        () => { done++; setPublishMsg(`Subiendo fotos/videos… ${done}/${total}`) }
      )
      if (result.ok) {
        // Guardar localmente los productos ya migrados (con URLs) para no resubir
        if (Array.isArray(result.products)) onSave(result.products)
        rememberSlice('categories', categories)
        setPublishMsg('Publicado ✓ Ya lo ven todos.')
      } else if (result.reason === 'no-token') {
        setPublishMsg('Falta conectar la clave.')
      } else {
        setPublishMsg(`No se pudo publicar${result.status ? ` (error ${result.status})` : ''}. Revisá la clave.`)
      }
    } catch {
      setPublishMsg('No se pudo publicar. Revisá la conexión.')
    } finally {
      setPublishing(false)
      setTimeout(() => setPublishMsg(''), 5000)
    }
  }

  const handleEdit = (product) => {
    setForm({
      ...product,
      precio: String(product.precio),
      precio_original: product.precio_original ? String(product.precio_original) : '',
    })
    setEditingId(product.id)
    setActiveView('form')
    setTimeout(() => formRef.current?.scrollTo({ top: 0, behavior: 'smooth' }), 50)
  }

  const handleNew = () => {
    const categoria = categories.includes(EMPTY_FORM.categoria)
      ? EMPTY_FORM.categoria
      : categories[0] || EMPTY_FORM.categoria
    setForm({ ...EMPTY_FORM, categoria })
    setEditingId(null)
    setActiveView('form')
    setTimeout(() => formRef.current?.scrollTo({ top: 0, behavior: 'smooth' }), 50)
  }

  const handleDelete = (id) => {
    if (!window.confirm('¿Eliminar este producto?')) return
    const target = products.find((p) => p.id === id)
    // Liberar los medios subidos a IndexedDB (fotos 'idb:<key>' y videos { key })
    ;(target?.imagenes || []).forEach((src) => {
      if (typeof src === 'string' && src.startsWith('idb:')) deleteImage(src.slice(4))
    })
    ;(target?.videos || []).forEach((v) => { if (v?.key) deleteVideo(v.key) })
    onSave(products.filter((p) => p.id !== id))
    if (editingId === id) {
      setEditingId(null)
      setForm(EMPTY_FORM)
    }
  }

  const handleDuplicate = async (product) => {
    const newId = products.length ? Math.max(...products.map((p) => p.id)) + 1 : 1

    // Copiar los blobs de IndexedDB con claves nuevas para que borrar la copia no
    // afecte al original (y viceversa).
    const imagenes = []
    for (const src of product.imagenes || []) {
      if (typeof src === 'string' && src.startsWith('idb:')) {
        const blob = await getImage(src.slice(4))
        if (blob) {
          const key = `img_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`
          await putImage(key, blob)
          imagenes.push(`idb:${key}`)
        }
      } else {
        imagenes.push(src)
      }
    }
    const videos = []
    for (const v of product.videos || []) {
      if (v?.key) {
        const blob = await getVideo(v.key)
        if (blob) {
          const key = `vid_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`
          await putVideo(key, blob)
          videos.push({ key })
        }
      } else if (v?.url) {
        videos.push({ url: v.url })
      }
    }

    const duplicated = {
      ...product,
      id: newId,
      nombre: `${product.nombre} (Copia)`,
      destacado: false,
      imagenes,
      videos,
      imagen_url: imagenes[0] || '',
    }
    onSave([...products, duplicated])
    handleEdit(duplicated)
  }

  const handleMoveUp = (index) => {
    if (index === 0) return
    const updated = [...products]
    ;[updated[index - 1], updated[index]] = [updated[index], updated[index - 1]]
    onSave(updated)
  }

  const handleMoveDown = (index) => {
    if (index === products.length - 1) return
    const updated = [...products]
    ;[updated[index], updated[index + 1]] = [updated[index + 1], updated[index]]
    onSave(updated)
  }

  // ── Fotos del producto (varias) ──────────────────────────────────────────────
  // Cada foto subida se redimensiona y guarda en IndexedDB; en el producto se
  // referencia como 'idb:<key>'. Los links/URL se guardan tal cual.
  const handleImageFiles = async (e) => {
    const files = Array.from(e.target.files || [])
    if (!files.length) return
    try {
      setImageProcessing(true)
      const nuevas = []
      for (const file of files) {
        const blob = await resizeImageToBlob(file)
        // Si hay conexión con la nube, la foto se sube y se guarda como URL
        // pública (visible desde cualquier dispositivo). Si no, va a IndexedDB.
        const url = await uploadMedia(blob, 'img', 'foto.jpg')
        if (url) {
          nuevas.push(url)
        } else {
          const key = `img_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`
          await putImage(key, blob)
          nuevas.push(`idb:${key}`)
        }
      }
      setForm((prev) => ({ ...prev, imagenes: [...(prev.imagenes || []), ...nuevas] }))
    } catch {
      alert('Error al procesar alguna imagen.')
    } finally {
      setImageProcessing(false)
      e.target.value = ''
    }
  }

  const addImageUrl = () => {
    const url = (imageUrlInput || '').trim()
    if (!url) return
    setForm((prev) => ({ ...prev, imagenes: [...(prev.imagenes || []), url] }))
    setImageUrlInput('')
  }

  const removeImage = async (index) => {
    const target = (form.imagenes || [])[index]
    if (typeof target === 'string' && target.startsWith('idb:')) await deleteImage(target.slice(4))
    setForm((prev) => ({ ...prev, imagenes: (prev.imagenes || []).filter((_, i) => i !== index) }))
  }

  const moveImage = (index, dir) => {
    const j = index + dir
    setForm((prev) => {
      const arr = [...(prev.imagenes || [])]
      if (j < 0 || j >= arr.length) return prev
      ;[arr[index], arr[j]] = [arr[j], arr[index]]
      return { ...prev, imagenes: arr }
    })
  }

  // ── Videos del producto (varios) ─────────────────────────────────────────────
  const handleVideoFile = async (e) => {
    const file = e.target.files?.[0]
    if (!file) return
    if (file.size > 60 * 1024 * 1024) {
      alert('El video es muy pesado (máx 60 MB). Subí un clip más corto.')
      e.target.value = ''
      return
    }
    try {
      setVideoProcessing(true)
      // Si hay conexión con la nube, el video se sube y se guarda como URL.
      const url = await uploadMedia(file, 'vid', file.name || 'video.mp4')
      if (url) {
        setForm((prev) => ({ ...prev, videos: [...(prev.videos || []), { url }] }))
      } else {
        const key = `vid_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`
        await putVideo(key, file)
        setForm((prev) => ({ ...prev, videos: [...(prev.videos || []), { key }] }))
      }
    } catch {
      alert('No se pudo guardar el video.')
    } finally {
      setVideoProcessing(false)
      e.target.value = ''
    }
  }

  const addVideoUrl = () => {
    const url = (videoUrlInput || '').trim()
    if (!url) return
    setForm((prev) => ({ ...prev, videos: [...(prev.videos || []), { url }] }))
    setVideoUrlInput('')
  }

  const removeVideo = async (index) => {
    const target = (form.videos || [])[index]
    if (target?.key) await deleteVideo(target.key)
    setForm((prev) => ({ ...prev, videos: (prev.videos || []).filter((_, i) => i !== index) }))
  }

  // ── Gestión de colores ──────────────────────────────────────────────────────
  const updateColor = (index, patch) => setForm((prev) => {
    const colores = [...(prev.colores || [])]
    const old = colores[index]
    colores[index] = { ...old, ...patch }
    let stock = prev.stock || {}
    // Si cambió el nombre, migrar las claves de stock para no perder cantidades
    if (patch.nombre !== undefined && patch.nombre !== old.nombre) {
      stock = Object.fromEntries(
        Object.entries(prev.stock || {}).map(([k, byColor]) => {
          const nb = { ...byColor }
          if (Object.prototype.hasOwnProperty.call(nb, old.nombre)) {
            nb[patch.nombre] = nb[old.nombre]
            delete nb[old.nombre]
          }
          return [k, nb]
        })
      )
    }
    return { ...prev, colores, stock }
  })

  const removeColor = (index) => setForm((prev) => {
    const target = (prev.colores || [])[index]
    const colores = (prev.colores || []).filter((_, i) => i !== index)
    const stock = Object.fromEntries(
      Object.entries(prev.stock || {}).map(([k, byColor]) => {
        const nb = { ...byColor }
        if (target) delete nb[target.nombre]
        return [k, nb]
      })
    )
    return { ...prev, colores, stock }
  })

  const addColor = () => setForm((prev) => ({
    ...prev,
    colores: [...(prev.colores || []), { nombre: 'Nuevo color', codigo: '#888888', activo: true }],
  }))

  const togglePresetColor = (preset) => setForm((prev) => {
    const colores = [...(prev.colores || [])]
    const existingIndex = colores.findIndex(
      (color) => color.nombre.trim().toLowerCase() === preset.nombre.toLowerCase()
    )

    if (existingIndex >= 0) {
      const target = colores[existingIndex]
      const nextColors = colores.filter((_, index) => index !== existingIndex)
      const stock = Object.fromEntries(
        Object.entries(prev.stock || {}).map(([key, byColor]) => {
          const nextByColor = { ...byColor }
          delete nextByColor[target.nombre]
          return [key, nextByColor]
        })
      )

      return { ...prev, colores: nextColors, stock }
    }

    return {
      ...prev,
      colores: [...colores, { ...preset, activo: true }],
    }
  })

  // Claves de stock: por modelo si el producto tiene modelos cargados (igual criterio que
  // usesModels() en products.js y que el modal del cliente), o una única clave para el resto.
  const stockKeys =
    (form.modelos || []).length ? form.modelos : [DEFAULT_STOCK_KEY]

  const setStockQty = (modelKey, colorName, value) => {
    const qty = Math.max(0, Math.floor(Number(value) || 0))
    const prevQty = form.stock?.[modelKey]?.[colorName] ?? 0
    setForm((prev) => {
      const stock = { ...(prev.stock || {}) }
      stock[modelKey] = { ...(stock[modelKey] || {}), [colorName]: qty }
      return { ...prev, stock }
    })
    // Aviso de restock cuando un color pasa de 0 a positivo y hay gente esperando
    if (prevQty === 0 && qty > 0 && (form.notificar_cuando_stock || []).length) {
      const n = form.notificar_cuando_stock.length
      setSaveStatus(`✓ Restock — ${n} ${n === 1 ? 'persona espera' : 'personas esperan'} aviso`)
      setTimeout(() => setSaveStatus(''), 3500)
    }
  }

  const copyRestockEmails = () => {
    const emails = (form.notificar_cuando_stock || []).join(', ')
    if (!emails) return
    navigator.clipboard?.writeText(emails)
    setSaveStatus('Emails copiados')
    setTimeout(() => setSaveStatus(''), 2000)
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    const precio = Number(form.precio)
    const precio_original = form.precio_original ? Number(form.precio_original) : null
    // imagen_url se mantiene como espejo de la primera foto (compatibilidad)
    const imagen_url = (form.imagenes || [])[0] || ''
    const base = { ...form, imagen_url, precio, precio_original }

    let updated
    let targetId = editingId

    if (editingId) {
      updated = products.map((p) =>
        p.id === editingId ? { ...p, ...base } : p
      )
    } else {
      const newId = products.length ? Math.max(...products.map((p) => p.id)) + 1 : 1
      targetId = newId
      updated = [...products, { ...base, id: newId }]
    }

    // Si se marca como destacado, desmarcar el resto (solo uno en el banner)
    if (form.destacado) {
      updated = updated.map((p) => ({ ...p, destacado: p.id === targetId }))
    }

    try {
      onSave(updated)
      setSaveStatus('¡Guardado!')
      setTimeout(() => setSaveStatus(''), 2500)
      setActiveView('list')
    } catch (err) {
      alert('Error al guardar. Si es por espacio, usá una URL de imagen.')
    }
  }

  const filteredProducts = products.filter(p => 
    p.nombre.toLowerCase().includes(searchQuery.toLowerCase()) ||
    p.categoria.toLowerCase().includes(searchQuery.toLowerCase())
  )

  if (!authenticated) {
    return (
      <div className="fixed inset-0 z-50 bg-[#f5f5f7] dark:bg-black flex items-center justify-center p-4">
        <div className="bg-white dark:bg-[#1c1c1e] rounded-3xl p-8 w-full max-w-sm shadow-2xl animate-scale-in">
          <div className="text-center mb-8">
            <span className="text-4xl">🔐</span>
            <h2 className="text-xl font-bold mt-4 dark:text-white">Panel Admin</h2>
            <p className="text-sm text-[#86868b] mt-1">Ingresá para gestionar ELEEME</p>
          </div>
          <form onSubmit={handleLogin} className="space-y-4">
            <input
              type="password"
              placeholder="Contraseña"
              value={pwInput}
              onChange={(e) => setPwInput(e.target.value)}
              className="w-full bg-[#f5f5f7] dark:bg-[#2c2c2e] dark:text-white rounded-xl px-4 py-4 text-sm outline-none focus:ring-2 focus:ring-[#0071e3]"
              autoFocus
            />
            {pwError && <p className="text-red-500 text-xs text-center">Contraseña incorrecta</p>}
            <button type="submit" className="w-full bg-black dark:bg-white dark:text-black text-white font-bold py-4 rounded-xl text-sm active:scale-95 transition-all">
              Entrar
            </button>
            <button type="button" onClick={onClose} className="w-full text-sm text-[#86868b] mt-2">Volver al sitio</button>
          </form>
        </div>
      </div>
    )
  }

  return (
    <div className="fixed inset-0 z-50 bg-[#f5f5f7] dark:bg-black flex flex-col animate-fade-in overflow-hidden">
      
      {/* Header Panel */}
      <header className="bg-white dark:bg-[#1c1c1e] border-b border-gray-100 dark:border-white/10 px-4 sm:px-6 py-4 flex items-center justify-between flex-shrink-0 z-20">
        <div className="flex items-center gap-2 sm:gap-3">
          <button onClick={onClose} aria-label="Volver al inicio" className="flex items-center gap-1 pr-1 text-[#1d1d1f] dark:text-white hover:text-[#0071e3] transition-colors">
            <ChevronLeftIcon className="w-6 h-6" />
            <span className="text-sm font-medium hidden sm:inline">Inicio</span>
          </button>
          <div className="w-8 h-8 rounded-full bg-[#0071e3] flex items-center justify-center text-white text-xs font-black">E</div>
          <div>
            <h1 className="font-black text-sm sm:text-lg tracking-tighter dark:text-white leading-tight uppercase">ADMIN ELEEME</h1>
            <p className="text-[10px] text-[#86868b] font-bold uppercase tracking-widest hidden sm:block">Control de Inventario</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {saveStatus && <span className="text-xs font-bold text-green-500 mr-2 animate-pulse">{saveStatus}</span>}
          <button onClick={onClose} className="p-2 hover:bg-[#f5f5f7] dark:hover:bg-[#2c2c2e] rounded-full transition-colors text-[#86868b]">
            <XIcon className="w-6 h-6" />
          </button>
        </div>
      </header>

      {/* Conexión con la nube — publicar para que todos vean lo mismo */}
      <div className="bg-white dark:bg-[#1c1c1e] border-b border-gray-100 dark:border-white/10 flex-shrink-0">
        <div className="flex items-center gap-3 px-4 py-2.5">
          <span className={`flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-widest ${connected ? 'text-green-500' : 'text-[#86868b]'}`}>
            <span className={`w-2 h-2 rounded-full ${connected ? 'bg-green-500' : 'bg-gray-300 dark:bg-gray-600'}`} />
            {connected ? 'Nube conectada' : 'Solo en este celular'}
          </span>
          <button
            type="button"
            onClick={() => setCloudOpen((v) => !v)}
            className="text-[11px] font-bold text-[#0071e3]"
          >
            {connected ? 'Cambiar clave' : 'Conectar'}
          </button>
          <div className="ml-auto flex items-center gap-2">
            {publishMsg && <span className="text-[11px] font-bold text-[#0071e3] truncate max-w-[40vw]">{publishMsg}</span>}
            <button
              type="button"
              onClick={handlePublish}
              disabled={publishing}
              className="text-[11px] font-black uppercase tracking-widest text-white bg-[#0071e3] px-4 py-2 rounded-full active:scale-95 transition-all disabled:opacity-50"
            >
              {publishing ? 'Publicando…' : '☁ Publicar online'}
            </button>
          </div>
        </div>
        {cloudOpen && (
          <div className="px-4 pb-3 flex flex-col sm:flex-row sm:items-center gap-2">
            <input
              type="password"
              value={tokenInput}
              onChange={(e) => setTokenInput(e.target.value)}
              placeholder="Clave de publicación (ADMIN_TOKEN)"
              className="flex-1 min-w-0 bg-[#f5f5f7] dark:bg-[#2c2c2e] dark:text-white rounded-xl px-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-[#0071e3]/20"
            />
            <button
              type="button"
              onClick={saveCloudToken}
              className="text-xs font-black uppercase tracking-widest text-white bg-black dark:bg-white dark:text-black px-5 py-2.5 rounded-xl active:scale-95 transition-all"
            >
              Guardar clave
            </button>
            <p className="text-[11px] text-[#86868b] sm:hidden">La clave la configuraste en Vercel (variable ADMIN_TOKEN).</p>
          </div>
        )}
      </div>

      {/* Selector de Vista (Solo Móvil) */}
      <div className="lg:hidden flex bg-white dark:bg-[#1c1c1e] border-b border-gray-100 dark:border-white/10 sticky top-0 z-10 flex-shrink-0">
        <button 
          onClick={() => setActiveView('list')}
          className={`flex-1 py-4 text-xs font-black uppercase tracking-widest transition-all ${activeView === 'list' ? 'text-[#0071e3] border-b-2 border-[#0071e3]' : 'text-[#86868b]'}`}
        >
          Productos ({products.length})
        </button>
        <button 
          onClick={handleNew}
          className={`flex-1 py-4 text-xs font-black uppercase tracking-widest transition-all ${activeView === 'form' ? 'text-[#0071e3] border-b-2 border-[#0071e3]' : 'text-[#86868b]'}`}
        >
          {editingId ? 'Editando' : '+ Añadir'}
        </button>
      </div>

      <div className="flex-1 min-h-0 flex flex-col lg:flex-row relative overflow-hidden">
        
        {/* Lista Lateral */}
        <div className={`
          flex-1 min-h-0 lg:w-[420px] lg:flex-none border-r border-gray-100 dark:border-white/10 bg-white dark:bg-[#1c1c1e] flex flex-col
          ${activeView === 'list' ? 'flex' : 'hidden lg:flex'}
        `}>
          <div className="p-4 border-b border-gray-50 dark:border-white/5 flex-shrink-0 space-y-3">
            <div className="relative group">
              <input
                type="text"
                placeholder="Buscar por nombre o categoría..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-[#f5f5f7] dark:bg-[#2c2c2e] dark:text-white rounded-2xl px-5 py-4 text-sm outline-none focus:ring-2 focus:ring-[#0071e3]/20 transition-all"
              />
              <span className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-[#0071e3] transition-colors">🔍</span>
            </div>
            <button
              type="button"
              onClick={() => setCategoryManagerOpen(true)}
              className="w-full text-xs font-black uppercase tracking-widest text-[#0071e3] bg-blue-50 dark:bg-blue-500/10 py-3 rounded-2xl active:scale-95 transition-all"
            >
              🏷️ Editar categorías
            </button>
          </div>

          <div className="flex-1 overflow-y-auto overscroll-contain">
            <ul className="divide-y divide-gray-50 dark:divide-white/5 pb-32">
              {filteredProducts.map((p, idx) => (
                <li key={p.id} className={`group flex items-center gap-4 px-4 py-5 transition-all cursor-pointer ${editingId === p.id ? 'bg-blue-50/70 dark:bg-blue-500/10' : 'hover:bg-[#f5f5f7] dark:hover:bg-[#2c2c2e]'}`} onClick={() => handleEdit(p)}>
                  
                  {/* Reordenar (Solo Desktop) */}
                  {!searchQuery && (
                    <div className="hidden lg:flex flex-col gap-1 opacity-0 group-hover:opacity-100 transition-opacity" onClick={e => e.stopPropagation()}>
                      <button onClick={() => handleMoveUp(idx)} className="p-1 hover:text-[#0071e3] text-gray-300 dark:text-gray-600">▲</button>
                      <button onClick={() => handleMoveDown(idx)} className="p-1 hover:text-[#0071e3] text-gray-300 dark:text-gray-600">▼</button>
                    </div>
                  )}
                  
                  <div className="w-14 h-14 rounded-2xl bg-[#f5f5f7] dark:bg-[#2c2c2e] overflow-hidden flex-shrink-0 border border-gray-100 dark:border-white/5">
                    <CatalogImage src={productImages(p)[0]} alt={p.nombre} fallbackText={p.nombre} className="w-full h-full object-cover" />
                  </div>

                  <div className="flex-1 min-w-0">
                    <h4 className="text-[14px] font-bold text-[#1d1d1f] dark:text-white truncate tracking-tight">{p.nombre}</h4>
                    <p className="text-[12px] font-medium text-[#86868b] flex items-center gap-2">
                      {formatPrice(p.precio)}
                      {p.destacado && <span className="bg-amber-100 text-amber-700 dark:bg-amber-500/20 dark:text-amber-400 text-[9px] px-1.5 py-0.5 rounded-full font-bold uppercase">Banner</span>}
                    </p>
                  </div>

                  <div className="flex items-center gap-1" onClick={e => e.stopPropagation()}>
                    <button onClick={() => handleDuplicate(p)} title="Duplicar" className="p-3 text-gray-400 hover:text-[#0071e3] transition-colors">
                      <DuplicateIcon className="w-5 h-5" />
                    </button>
                    <button onClick={() => handleDelete(p.id)} title="Borrar" className="p-3 text-gray-400 hover:text-red-500 transition-colors">
                      <TrashIcon className="w-5 h-5" />
                    </button>
                  </div>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Formulario de Edición */}
        <div className={`
          flex-1 overflow-y-auto overscroll-contain bg-[#f5f5f7] dark:bg-black p-4 sm:p-8 lg:p-12
          ${activeView === 'form' ? 'flex flex-col' : 'hidden lg:flex lg:flex-col'}
        `} ref={formRef}>
          
          <div className="max-w-3xl mx-auto w-full pb-32">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-8 gap-4">
              <div>
                <h2 className="text-3xl font-black tracking-tight dark:text-white leading-none">
                  {editingId ? 'Editar Detalles' : 'Nuevo Producto'}
                </h2>
                <p className="text-sm text-[#86868b] mt-2 font-medium">Completa todos los campos obligatorios (*)</p>
              </div>
              {activeView === 'form' && (
                <button onClick={() => setActiveView('list')} className="lg:hidden self-start text-xs font-black uppercase tracking-widest text-[#0071e3] bg-blue-50 dark:bg-blue-500/10 px-4 py-2 rounded-full">
                  ← Volver a la lista
                </button>
              )}
            </div>

            <form onSubmit={handleSubmit} className="space-y-8">
              
              {/* Bloque: Información Básica */}
              <div className="bg-white dark:bg-[#1c1c1e] p-6 sm:p-8 rounded-[32px] shadow-sm space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="md:col-span-2">
                    <label className="admin-label">Nombre del Producto *</label>
                    <input className="admin-input" value={form.nombre} onChange={f('nombre')} required placeholder="Ej: iPhone 15 Pro Max" />
                  </div>
                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <label className="admin-label !mb-0">Categoría *</label>
                      <button type="button" onClick={() => setCategoryManagerOpen(true)} className="text-[11px] font-black uppercase tracking-widest text-[#0071e3]">
                        Editar categorías
                      </button>
                    </div>
                    <select className="admin-input appearance-none" style={{ backgroundImage: 'url("data:image/svg+xml,%3Csvg xmlns=\'http://www.w3.org/2000/svg\' fill=\'none\' viewBox=\'0 0 24 24\' stroke=\'currentColor\'%3E%3Cpath stroke-linecap=\'round\' stroke-linejoin=\'round\' stroke-width=\'2\' d=\'M19 9l-7 7-7-7\' /%3E%3C/svg%3E")', backgroundRepeat: 'no-repeat', backgroundPosition: 'right 1rem center', backgroundSize: '1rem' }} value={form.categoria} onChange={f('categoria')}>
                      {(categories.includes(form.categoria) ? categories : [form.categoria, ...categories]).map((c) => <option key={c}>{c}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="admin-label">Compatible con *</label>
                    <input className="admin-input" value={form.compatible_con} onChange={f('compatible_con')} required placeholder="Ej: iPhone 12 en adelante" />
                  </div>
                </div>

                {/* Modelos compatibles — habilita el filtro por modelo (Fundas / Protectores / Vidrio).
                    También se muestra si el producto YA tiene modelos guardados aunque su categoría
                    no sea de modelos, para poder sacarlos: el modal del cliente los muestra mientras
                    el array no esté vacío, así que siempre tiene que haber forma de editarlos. */}
                {(MODEL_CATEGORIES.includes(form.categoria) || (form.modelos || []).length > 0) && (
                  <div className="pt-2">
                    <label className="admin-label">Modelos de iPhone (filtro)</label>
                    <p className="text-[11px] text-[#86868b] mb-3">Tocá los modelos para los que está disponible este producto.</p>
                    <div className="flex flex-wrap gap-2">
                      {MODELS.map((m) => {
                        const active = (form.modelos || []).includes(m)
                        return (
                          <button
                            key={m}
                            type="button"
                            onClick={() => setForm((prev) => {
                              const current = prev.modelos || []
                              return {
                                ...prev,
                                modelos: active ? current.filter((x) => x !== m) : [...current, m],
                              }
                            })}
                            className={`text-[11px] font-semibold px-3 py-2 rounded-full border transition-all ${
                              active
                                ? 'bg-[#0071e3] border-[#0071e3] text-white'
                                : 'bg-[#f5f5f7] dark:bg-[#2c2c2e] border-transparent text-[#6e6e73] dark:text-[#86868b] hover:border-[#0071e3]'
                            }`}
                          >
                            {m}
                          </button>
                        )
                      })}
                    </div>
                  </div>
                )}
              </div>

              {/* Bloque: Stock y Colores */}
              <div className="bg-white dark:bg-[#1c1c1e] p-6 sm:p-8 rounded-[32px] shadow-sm space-y-8 border-2 border-emerald-50 dark:border-emerald-500/10 relative overflow-hidden">
                <div className="absolute top-0 right-0 p-1 px-4 bg-emerald-50 dark:bg-emerald-500/10 text-[10px] font-black text-emerald-600 uppercase tracking-widest rounded-bl-xl">Inventario</div>

                {/* Colores */}
                <div>
                  <div className="flex flex-col gap-2 mb-4">
                    <h3 className="text-xs font-black uppercase text-[#86868b] tracking-tighter">Colores disponibles</h3>
                    <p className="text-[11px] text-[#86868b]">Tocá burbujas para sumar o sacar colores rápidos. Después podés ajustar nombre o código si hace falta.</p>
                  </div>

                  <div className="flex flex-wrap gap-2 mb-4">
                    {COLOR_PRESETS.map((preset) => {
                      const active = (form.colores || []).some(
                        (color) => color.nombre.trim().toLowerCase() === preset.nombre.toLowerCase()
                      )

                      return (
                        <button
                          key={preset.nombre}
                          type="button"
                          onClick={() => togglePresetColor(preset)}
                          className={`inline-flex items-center gap-2 rounded-full border px-3 py-2 text-[11px] font-semibold transition-all ${
                            active
                              ? 'border-[#0071e3] bg-blue-50 text-[#0071e3] dark:bg-blue-500/10'
                              : 'border-gray-200 bg-white text-[#6e6e73] hover:border-[#0071e3] dark:border-white/10 dark:bg-[#1c1c1e] dark:text-[#86868b]'
                          }`}
                        >
                          <span
                            className="h-4 w-4 rounded-full border border-black/10 dark:border-white/20"
                            style={{ backgroundColor: preset.codigo }}
                          />
                          {preset.nombre}
                        </button>
                      )
                    })}
                  </div>

                  <div className="space-y-3">
                    {(form.colores || []).map((c, i) => (
                      <div key={i} className="flex items-center gap-3 bg-[#f5f5f7] dark:bg-[#2c2c2e] rounded-2xl p-3">
                        <input
                          type="color"
                          value={/^#[0-9a-fA-F]{6}$/.test(c.codigo) ? c.codigo : '#888888'}
                          onChange={(e) => updateColor(i, { codigo: e.target.value })}
                          className="w-10 h-10 rounded-lg border-0 bg-transparent cursor-pointer flex-shrink-0"
                          title="Color"
                        />
                        <input
                          type="text"
                          value={c.nombre}
                          onChange={(e) => updateColor(i, { nombre: e.target.value })}
                          placeholder="Nombre del color"
                          className="flex-1 min-w-0 bg-white dark:bg-[#1c1c1e] dark:text-white rounded-xl px-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-[#0071e3]/20"
                        />
                        <label className="flex items-center gap-2 cursor-pointer flex-shrink-0" title="Visible en el catálogo">
                          <input
                            type="checkbox"
                            checked={c.activo !== false}
                            onChange={(e) => updateColor(i, { activo: e.target.checked })}
                            className="w-4 h-4 rounded border-gray-300 text-[#0071e3]"
                          />
                          <span className="text-[11px] font-medium text-[#6e6e73] dark:text-[#86868b] hidden sm:inline">Activo</span>
                        </label>
                        <button type="button" onClick={() => removeColor(i)} title="Eliminar color" className="p-2 text-gray-400 hover:text-red-500 transition-colors flex-shrink-0">
                          <TrashIcon className="w-5 h-5" />
                        </button>
                      </div>
                    ))}
                    {(form.colores || []).length === 0 && (
                      <p className="text-[11px] text-[#86868b] italic">Sin colores cargados todavía.</p>
                    )}
                  </div>
                  <button type="button" onClick={addColor} className="mt-3 text-xs font-black uppercase tracking-widest text-[#0071e3] bg-blue-50 dark:bg-blue-500/10 px-4 py-2.5 rounded-full active:scale-95 transition-all">
                    + Agregar color
                  </button>
                </div>

                {/* Tabla de stock por modelo */}
                {(form.colores || []).length > 0 && (
                  <div className="pt-6 border-t border-gray-100 dark:border-white/5">
                    <h3 className="text-xs font-black uppercase text-[#86868b] tracking-tighter mb-1">Stock por modelo y color</h3>
                    <p className="text-[11px] text-[#86868b] mb-4">Cantidad de unidades de cada color. 0 = agotado.</p>
                    <div className="space-y-4">
                      {stockKeys.map((modelKey) => (
                        <div key={modelKey} className="bg-[#f5f5f7] dark:bg-[#2c2c2e] rounded-2xl p-4">
                          <p className="text-[13px] font-bold text-[#1d1d1f] dark:text-white mb-3">
                            {modelKey === DEFAULT_STOCK_KEY ? 'Stock general' : modelKey}
                          </p>
                          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                            {(form.colores || []).map((c, i) => (
                              <div key={i}>
                                <label className="flex items-center gap-1.5 text-[11px] font-medium text-[#6e6e73] dark:text-[#86868b] mb-1 truncate">
                                  <span className="w-3 h-3 rounded-full border border-black/10 dark:border-white/20 flex-shrink-0" style={{ backgroundColor: c.codigo }} />
                                  <span className="truncate">{c.nombre}</span>
                                </label>
                                <input
                                  type="number"
                                  min="0"
                                  value={form.stock?.[modelKey]?.[c.nombre] ?? 0}
                                  onChange={(e) => setStockQty(modelKey, c.nombre, e.target.value)}
                                  className="w-full bg-white dark:bg-[#1c1c1e] dark:text-white rounded-xl px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-[#0071e3]/20"
                                />
                              </div>
                            ))}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Gestión de stock: manual vs automático */}
                <div className="pt-6 border-t border-gray-100 dark:border-white/5">
                  <h3 className="text-xs font-black uppercase text-[#86868b] tracking-tighter mb-3">¿Cómo querés manejar el stock?</h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {[
                      { val: 'manual', titulo: 'Manual', desc: 'Vos editás las cantidades cuando vendés.' },
                      { val: 'automatico', titulo: 'Automático', desc: 'Baja al comprar (cuando integres carrito).' },
                    ].map((opt) => {
                      const active = (form.stock_gestion || 'manual') === opt.val
                      return (
                        <button
                          key={opt.val}
                          type="button"
                          onClick={() => setForm((p) => ({ ...p, stock_gestion: opt.val }))}
                          className={`text-left p-4 rounded-2xl border-2 transition-all ${active ? 'border-[#0071e3] bg-blue-50/50 dark:bg-blue-500/10' : 'border-gray-100 dark:border-white/10 hover:border-[#0071e3]/40'}`}
                        >
                          <p className={`text-sm font-bold ${active ? 'text-[#0071e3]' : 'text-[#1d1d1f] dark:text-white'}`}>
                            {active ? '● ' : '○ '}{opt.titulo}
                          </p>
                          <p className="text-[11px] text-[#86868b] mt-1 leading-relaxed">{opt.desc}</p>
                        </button>
                      )
                    })}
                  </div>
                </div>

                {/* Lista de espera de restock */}
                {(form.notificar_cuando_stock || []).length > 0 && (
                  <div className="pt-6 border-t border-gray-100 dark:border-white/5">
                    <div className="flex items-center justify-between gap-3 mb-3">
                      <h3 className="text-xs font-black uppercase text-amber-600 tracking-tighter">
                        🔔 {form.notificar_cuando_stock.length} {form.notificar_cuando_stock.length === 1 ? 'persona espera' : 'personas esperan'} restock
                      </h3>
                      <button type="button" onClick={copyRestockEmails} className="text-[11px] font-black uppercase tracking-widest text-[#0071e3] bg-blue-50 dark:bg-blue-500/10 px-3 py-1.5 rounded-full active:scale-95 transition-all">
                        Copiar todos
                      </button>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {form.notificar_cuando_stock.map((email, i) => (
                        <span key={i} className="text-[11px] font-medium text-[#6e6e73] dark:text-[#86868b] bg-[#f5f5f7] dark:bg-[#2c2c2e] px-3 py-1.5 rounded-full">
                          {email}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Bloque: Precios y Oferta */}
              <div className="bg-white dark:bg-[#1c1c1e] p-6 sm:p-8 rounded-[32px] shadow-sm space-y-6 border-2 border-blue-50 dark:border-blue-500/10 relative overflow-hidden">
                <div className="absolute top-0 right-0 p-1 px-4 bg-blue-50 dark:bg-blue-500/10 text-[10px] font-black text-[#0071e3] uppercase tracking-widest rounded-bl-xl">Finanzas</div>
                <div className="flex items-center justify-between">
                  <h3 className="text-xs font-black uppercase text-[#86868b] tracking-tighter">Precios y Promociones</h3>
                  {form.precio && form.precio_original && Number(form.precio_original) > Number(form.precio) && (
                    <span className="text-[10px] font-black bg-red-500 text-white px-3 py-1.5 rounded-full shadow-lg shadow-red-500/20">
                      -{Math.round((1 - Number(form.precio) / Number(form.precio_original)) * 100)}% DESCUENTO
                    </span>
                  )}
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="admin-label">Precio de Venta (ARS) *</label>
                    <div className="relative">
                       <span className="absolute left-4 top-1/2 -translate-y-1/2 font-bold text-gray-400">$</span>
                       <input type="number" className="admin-input pl-10" value={form.precio} onChange={f('precio')} required placeholder="0" />
                    </div>
                  </div>
                  <div>
                    <label className="admin-label">Precio Original (Tachado)</label>
                    <div className="relative">
                       <span className="absolute left-4 top-1/2 -translate-y-1/2 font-bold text-gray-400">$</span>
                       <input type="number" className="admin-input pl-10" value={form.precio_original} onChange={f('precio_original')} placeholder="Escribir solo si está de oferta" />
                    </div>
                  </div>
                </div>

                {/* Toggles de Oferta */}
                <div className="pt-4 border-t border-gray-100 dark:border-white/5 grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <label className="flex items-center gap-3 cursor-pointer">
                    <input 
                      type="checkbox" 
                      checked={form.ocultar_descuento_nro} 
                      onChange={e => setForm(p => ({...p, ocultar_descuento_nro: e.target.checked}))}
                      className="w-4 h-4 rounded border-gray-300 text-[#0071e3] transition-all"
                    />
                    <span className="text-xs font-medium text-[#6e6e73] dark:text-[#86868b]">Ocultar precio tachado</span>
                  </label>
                  <label className="flex items-center gap-3 cursor-pointer">
                    <input 
                      type="checkbox" 
                      checked={form.ocultar_descuento_porcentaje} 
                      onChange={e => setForm(p => ({...p, ocultar_descuento_porcentaje: e.target.checked}))}
                      className="w-4 h-4 rounded border-gray-300 text-[#0071e3] transition-all"
                    />
                    <span className="text-xs font-medium text-[#6e6e73] dark:text-[#86868b]">Ocultar burbuja de %</span>
                  </label>
                </div>
              </div>

              {/* Bloque: Etiquetas y Banner */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="bg-white dark:bg-[#1c1c1e] p-6 sm:p-8 rounded-[32px] shadow-sm">
                  <label className="admin-label">Etiqueta Visual (Badge)</label>
                  <input className="admin-input" value={form.tag} onChange={f('tag')} placeholder="Ej: PRODUCTO TOP" />
                  <div className="flex flex-wrap gap-2 mt-4">
                    {['OFERTA', 'Novedad', 'Limitado', 'Top'].map(t => (
                      <button key={t} type="button" onClick={() => setForm(p => ({...p, tag: t}))} className="text-[10px] font-black px-4 py-2 bg-[#f5f5f7] dark:bg-[#2c2c2e] rounded-full dark:text-white hover:bg-[#0071e3] hover:text-white transition-all uppercase tracking-widest border border-transparent">+{t}</button>
                    ))}
                  </div>
                </div>
                <div className="bg-white dark:bg-[#1c1c1e] p-6 sm:p-8 rounded-[32px] shadow-sm flex items-center justify-between gap-6">
                  <div className="flex-1">
                    <p className="text-sm font-black text-[#1d1d1f] dark:text-white uppercase tracking-tight">Destacar Producto</p>
                    <p className="text-[11px] text-[#86868b] font-medium leading-relaxed mt-1">Aparecerá en el banner principal al inicio.</p>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer flex-shrink-0">
                    <input type="checkbox" checked={form.destacado} onChange={(e) => setForm(p => ({...p, destacado: e.target.checked}))} className="sr-only peer" />
                    <div className="w-14 h-8 bg-gray-200 peer-focus:outline-none rounded-full peer dark:bg-gray-700 peer-checked:bg-[#0071e3] peer-checked:after:translate-x-6 after:content-[''] after:absolute after:top-[4px] after:left-[4px] after:bg-white after:rounded-full after:h-6 after:w-6 after:transition-all shadow-inner"></div>
                  </label>
                </div>
              </div>

              {/* Bloque: Contenido */}
              <div className="bg-white dark:bg-[#1c1c1e] p-6 sm:p-8 rounded-[32px] shadow-sm space-y-6">
                <div>
                  <label className="admin-label">Descripción para Grilla (Técnica) *</label>
                  <textarea rows={2} className="admin-input resize-none py-4" value={form.descripcion} onChange={f('descripcion')} required placeholder="Detalles cortos que se ven en la tarjeta..." />
                </div>
                <div>
                  <label className="admin-label">Descripción para Detalle (Venta) *</label>
                  <textarea rows={4} className="admin-input resize-none py-4" value={form.por_que_lo_necesitas} onChange={f('por_que_lo_necesitas')} required placeholder="Texto persuasivo para convencer al cliente..." />
                </div>
              </div>

              {/* Bloque: Imagen */}
              <div className="bg-white dark:bg-[#1c1c1e] p-6 sm:p-8 rounded-[32px] shadow-sm">
                <div className="flex items-center justify-between mb-6">
                  <label className="admin-label !mb-0">Fotos del Producto *</label>
                  <span className="text-[11px] font-bold text-[#86868b]">
                    {(form.imagenes || []).length} {(form.imagenes || []).length === 1 ? 'foto' : 'fotos'}
                  </span>
                </div>

                {/* Galería de fotos cargadas — la primera es la portada */}
                {(form.imagenes || []).length > 0 ? (
                  <div className="grid grid-cols-3 sm:grid-cols-4 gap-3 mb-6">
                    {(form.imagenes || []).map((src, i) => (
                      <div key={i} className="relative aspect-square bg-[#fbfbfd] dark:bg-[#2c2c2e] rounded-2xl overflow-hidden border border-gray-100 dark:border-white/5 group">
                        <CatalogImage src={src} alt="" fallbackText={form.nombre} className={`w-full h-full ${form.imagen_ajuste === 'contain' ? 'object-contain p-2' : 'object-cover'}`} />
                        {i === 0 && (
                          <span className="absolute top-1.5 left-1.5 text-[8px] font-black uppercase tracking-widest bg-[#0071e3] text-white px-1.5 py-0.5 rounded-full">Portada</span>
                        )}
                        <div className="absolute inset-x-0 bottom-0 flex items-center justify-between gap-1 p-1.5 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity">
                          <button type="button" onClick={() => moveImage(i, -1)} disabled={i === 0} title="Mover antes" className="text-white text-sm disabled:opacity-30">◀</button>
                          <button type="button" onClick={() => removeImage(i)} title="Quitar" className="bg-white/90 text-black text-[9px] font-black px-2 py-0.5 rounded-full">QUITAR</button>
                          <button type="button" onClick={() => moveImage(i, 1)} disabled={i === (form.imagenes || []).length - 1} title="Mover después" className="text-white text-sm disabled:opacity-30">▶</button>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="w-full h-40 bg-[#fbfbfd] dark:bg-[#2c2c2e] rounded-[24px] flex flex-col items-center justify-center border-2 border-dashed border-gray-100 dark:border-white/5 mb-6">
                    <span className="text-5xl opacity-20">📷</span>
                    <span className="text-[11px] text-[#86868b] mt-2">Todavía sin fotos</span>
                  </div>
                )}

                <div className="space-y-4">
                  <button type="button" onClick={() => fileRef.current.click()} disabled={imageProcessing} className="w-full bg-[#0071e3] text-white py-5 rounded-[20px] text-sm font-black uppercase tracking-widest shadow-xl shadow-blue-500/20 active:scale-95 transition-all">
                    {imageProcessing ? 'PROCESANDO...' : '+ AGREGAR FOTOS DESDE GALERÍA'}
                  </button>
                  <div className="flex items-center gap-3">
                    <div className="h-px bg-gray-100 dark:bg-white/5 flex-1"></div>
                    <span className="text-[10px] font-black text-gray-300 uppercase tracking-widest">o pega un link</span>
                    <div className="h-px bg-gray-100 dark:bg-white/5 flex-1"></div>
                  </div>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      className="admin-input text-sm py-4 flex-1"
                      value={imageUrlInput}
                      onChange={(e) => setImageUrlInput(e.target.value)}
                      onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), addImageUrl())}
                      placeholder="https://ejemplo.com/imagen.jpg"
                    />
                    <button type="button" onClick={addImageUrl} className="flex-shrink-0 text-xs font-black uppercase tracking-widest text-white bg-[#1d1d1f] dark:bg-white dark:text-black px-5 rounded-[20px] active:scale-95 transition-all">
                      Agregar
                    </button>
                  </div>
                  <p className="text-[10px] text-[#86868b] font-medium text-center italic">Podés subir varias fotos a la vez. La primera es la portada (arrastrá con ◀▶).</p>
                  <input ref={fileRef} type="file" accept="image/*" multiple className="hidden" onChange={handleImageFiles} />
                </div>

                {/* Cómo se muestra la foto en el recuadro */}
                <div className="mt-8 pt-6 border-t border-gray-100 dark:border-white/5">
                  <label className="admin-label mb-3 block">¿Cómo se ve la foto en el recuadro?</label>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {[
                      { val: 'cover', titulo: 'Rellenar recuadro', desc: 'La foto ocupa todo el cuadro, sin bordes. Puede recortar un poco los costados.' },
                      { val: 'contain', titulo: 'Mostrar completa', desc: 'Se ve la foto entera, sin recortar. Puede dejar bordes alrededor.' },
                    ].map((opt) => {
                      const active = (form.imagen_ajuste || 'cover') === opt.val
                      return (
                        <button
                          key={opt.val}
                          type="button"
                          onClick={() => setForm((p) => ({ ...p, imagen_ajuste: opt.val }))}
                          className={`text-left p-4 rounded-2xl border-2 transition-all ${active ? 'border-[#0071e3] bg-blue-50/50 dark:bg-blue-500/10' : 'border-gray-100 dark:border-white/10 hover:border-[#0071e3]/40'}`}
                        >
                          <p className={`text-sm font-bold ${active ? 'text-[#0071e3]' : 'text-[#1d1d1f] dark:text-white'}`}>
                            {active ? '● ' : '○ '}{opt.titulo}
                          </p>
                          <p className="text-[11px] text-[#86868b] mt-1 leading-relaxed">{opt.desc}</p>
                        </button>
                      )
                    })}
                  </div>
                </div>

                {/* Videos del producto (opcional, varios) */}
                <div className="mt-6 pt-6 border-t border-gray-100 dark:border-white/5">
                  <div className="flex items-center justify-between mb-3">
                    <label className="admin-label !mb-0">Videos del producto (opcional)</label>
                    <span className="text-[11px] font-bold text-[#86868b]">
                      {(form.videos || []).length} {(form.videos || []).length === 1 ? 'video' : 'videos'}
                    </span>
                  </div>

                  {/* Videos cargados */}
                  {(form.videos || []).length > 0 && (
                    <div className="space-y-2 mb-4">
                      {(form.videos || []).map((v, i) => (
                        <div key={i} className="flex items-center justify-between gap-3 bg-[#f5f5f7] dark:bg-[#2c2c2e] rounded-2xl px-4 py-3">
                          <span className="flex items-center gap-2 text-sm font-bold text-[#1d1d1f] dark:text-white min-w-0">
                            <svg className="w-5 h-5 text-[#0071e3] flex-shrink-0" viewBox="0 0 24 24" fill="currentColor"><path d="M8 5v14l11-7z" /></svg>
                            <span className="truncate">{v.key ? 'Video subido ✓' : v.url}</span>
                          </span>
                          <button type="button" onClick={() => removeVideo(i)} className="flex-shrink-0 text-[11px] font-black uppercase tracking-widest text-red-500 px-3 py-1.5 rounded-full active:scale-95 transition-all">
                            Quitar
                          </button>
                        </div>
                      ))}
                    </div>
                  )}

                  <button
                    type="button"
                    onClick={() => videoFileRef.current.click()}
                    disabled={videoProcessing}
                    className="w-full bg-[#1d1d1f] dark:bg-white dark:text-black text-white py-5 rounded-[20px] text-sm font-black uppercase tracking-widest active:scale-95 transition-all"
                  >
                    {videoProcessing ? 'SUBIENDO...' : '+ SUBIR VIDEO DESDE EL CELULAR'}
                  </button>
                  <div className="flex items-center gap-3 my-4">
                    <div className="h-px bg-gray-100 dark:bg-white/5 flex-1"></div>
                    <span className="text-[10px] font-black text-gray-300 uppercase tracking-widest">o pega un link</span>
                    <div className="h-px bg-gray-100 dark:bg-white/5 flex-1"></div>
                  </div>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      className="admin-input text-sm py-4 flex-1"
                      value={videoUrlInput}
                      onChange={(e) => setVideoUrlInput(e.target.value)}
                      onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), addVideoUrl())}
                      placeholder="Link de Instagram, YouTube, TikTok o .mp4"
                    />
                    <button type="button" onClick={addVideoUrl} className="flex-shrink-0 text-xs font-black uppercase tracking-widest text-white bg-[#0071e3] px-5 rounded-[20px] active:scale-95 transition-all">
                      Agregar
                    </button>
                  </div>

                  <input ref={videoFileRef} type="file" accept="video/*" className="hidden" onChange={handleVideoFile} />
                  <p className="text-[11px] text-[#86868b] mt-3 leading-relaxed">
                    Podés sumar varios videos. Subí clips cortos (máx 60 MB c/u) o pegá links. Tip: videos de 5 a 15 segundos cargan más rápido.
                  </p>
                </div>
              </div>

              {/* Botón Guardar (Flotante en móvil) */}
              <div className="fixed bottom-0 left-0 right-0 p-5 pb-[calc(1.25rem+env(safe-area-inset-bottom))] bg-white/80 dark:bg-black/80 backdrop-blur-xl border-t border-gray-100 dark:border-white/10 lg:relative lg:bg-transparent lg:border-0 lg:p-0 lg:pt-8 z-30">
                <div className="flex flex-col sm:flex-row items-center gap-4 max-w-3xl mx-auto">
                  <button type="submit" className="w-full sm:flex-1 bg-black dark:bg-white dark:text-black text-white py-5 rounded-[24px] font-black uppercase tracking-widest shadow-2xl active:scale-[0.98] transition-all text-sm">
                    {editingId ? 'ACTUALIZAR PRODUCTO' : 'PUBLICAR EN CATÁLOGO'}
                  </button>
                  {editingId && (
                    <button type="button" onClick={() => setActiveView('list')} className="w-full sm:w-auto text-xs font-black uppercase tracking-widest text-[#86868b] px-8 py-5">
                      CANCELAR
                    </button>
                  )}
                </div>
              </div>

            </form>
          </div>
        </div>
      </div>

      {categoryManagerOpen && (
        <CategoryManager
          categories={categories}
          products={products}
          onSaveProducts={onSave}
          onSaveCategories={onSaveCategories}
          onReset={onResetCategories}
          onClose={() => setCategoryManagerOpen(false)}
        />
      )}
    </div>
  )
}
