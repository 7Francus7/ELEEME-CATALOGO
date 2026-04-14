import { useState, useRef } from 'react'
import { CATEGORIES, formatPrice } from '../data/products'
import { XIcon } from './Icons'

// ─── CONTRASEÑA DEL PANEL ADMIN ───────────────────────────────────────────────
// Cambiá esta contraseña y no la compartas. Al ser un sitio estático, es
// protección contra edición casual — no contra alguien técnico que inspeccione el código.
const ADMIN_PASSWORD = 'eleeme2024'

const EMPTY_FORM = {
  nombre: '',
  categoria: 'iPhone',
  precio: '',
  precio_original: '',
  tag: '',
  compatible_con: '',
  imagen_url: '',
  descripcion: '',
  por_que_lo_necesitas: '',
  destacado: false,
}

// Redimensiona la imagen a máx 800px y la convierte a JPEG 82% antes de guardar
function resizeImage(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = (e) => {
      const img = new Image()
      img.onload = () => {
        const MAX = 800
        const ratio = Math.min(MAX / img.width, MAX / img.height, 1)
        const canvas = document.createElement('canvas')
        canvas.width = Math.round(img.width * ratio)
        canvas.height = Math.round(img.height * ratio)
        canvas.getContext('2d').drawImage(img, 0, 0, canvas.width, canvas.height)
        resolve(canvas.toDataURL('image/jpeg', 0.82))
      }
      img.onerror = reject
      img.src = e.target.result
    }
    reader.onerror = reject
    reader.readAsDataURL(file)
  })
}

// Icono de flecha arriba
const ArrowUpIcon = ({ className }) => (
  <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M5 15l7-7 7 7" />
  </svg>
)

// Icono de flecha abajo
const ArrowDownIcon = ({ className }) => (
  <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
  </svg>
)

// Icono de duplicar
const DuplicateIcon = ({ className }) => (
  <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 17.25v3.375c0 .621-.504 1.125-1.125 1.125h-9.75a1.125 1.125 0 0 1-1.125-1.125V7.875c0-.621.504-1.125 1.125-1.125H6.75a9.06 9.06 0 0 1 1.5.124m7.5 10.376h3.375c.621 0 1.125-.504 1.125-1.125V11.25c0-4.46-3.243-8.161-7.5-8.876a9.06 9.06 0 0 0-1.5-.124H9.375c-.621 0-1.125.504-1.125 1.125v3.5m7.5 10.375H9.375a1.125 1.125 0 0 1-1.125-1.125v-9.25m12 6.625v-1.875a3.375 3.375 0 0 0-3.375-3.375h-1.5a1.125 1.125 0 0 1-1.125-1.125v-1.5a3.375 3.375 0 0 0-3.375-3.375H9.75" />
  </svg>
)

export default function AdminPanel({ products, onSave, onReset, onClose }) {
  const [authenticated, setAuthenticated] = useState(false)
  const [pwInput, setPwInput] = useState('')
  const [pwError, setPwError] = useState(false)
  const [form, setForm] = useState(EMPTY_FORM)
  const [editingId, setEditingId] = useState(null)
  const [imageProcessing, setImageProcessing] = useState(false)
  const [saveStatus, setSaveStatus] = useState('')
  const [listSearch, setListSearch] = useState('')
  const fileRef = useRef()
  const formRef = useRef()

  const f = (field) => (e) => setForm((prev) => ({ ...prev, [field]: e.target.value }))

  // Productos filtrados en la lista lateral
  const filteredList = listSearch.trim()
    ? products.filter((p) =>
        p.nombre.toLowerCase().includes(listSearch.toLowerCase()) ||
        p.categoria.toLowerCase().includes(listSearch.toLowerCase())
      )
    : products

  // ── Autenticación ────────────────────────────────────────────────────────────
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

  // ── Formulario ───────────────────────────────────────────────────────────────
  const handleEdit = (product) => {
    setForm({
      ...product,
      precio: String(product.precio),
      precio_original: product.precio_original ? String(product.precio_original) : '',
    })
    setEditingId(product.id)
    formRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' })
  }

  const handleNew = () => {
    setForm(EMPTY_FORM)
    setEditingId(null)
  }

  const handleDelete = (id) => {
    if (!window.confirm('¿Eliminar este producto? Esta acción no se puede deshacer.')) return
    onSave(products.filter((p) => p.id !== id))
    if (editingId === id) handleNew()
  }

  // ── Duplicar producto ────────────────────────────────────────────────────────
  const handleDuplicate = (product) => {
    const newId = products.length ? Math.max(...products.map((p) => p.id)) + 1 : 1
    const duplicated = {
      ...product,
      id: newId,
      nombre: `${product.nombre} (copia)`,
      destacado: false,
    }
    onSave([...products, duplicated])
    setSaveStatus('Duplicado ✓')
    setTimeout(() => setSaveStatus(''), 2000)
  }

  // ── Reordenar productos ──────────────────────────────────────────────────────
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

  const handleImageFile = async (e) => {
    const file = e.target.files?.[0]
    if (!file) return
    try {
      setImageProcessing(true)
      const base64 = await resizeImage(file)
      setForm((prev) => ({ ...prev, imagen_url: base64 }))
    } catch {
      alert('No se pudo procesar la imagen. Probá con otro archivo o usá una URL.')
    } finally {
      setImageProcessing(false)
      // Reset el input para poder subir el mismo archivo de nuevo si hace falta
      e.target.value = ''
    }
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    const precio = Number(form.precio)
    const precio_original = form.precio_original ? Number(form.precio_original) : null

    let updated
    let targetId = editingId

    if (editingId) {
      updated = products.map((p) =>
        p.id === editingId ? { ...p, ...form, precio, precio_original } : p
      )
    } else {
      const newId = products.length ? Math.max(...products.map((p) => p.id)) + 1 : 1
      targetId = newId
      updated = [...products, { ...form, id: newId, precio, precio_original }]
    }

    // Solo un producto puede ser el destacado del banner
    if (form.destacado) {
      updated = updated.map((p) => ({ ...p, destacado: p.id === targetId }))
    }

    try {
      onSave(updated)
      setSaveStatus('Guardado ✓')
      setTimeout(() => setSaveStatus(''), 2500)
      handleNew()
    } catch (err) {
      if (err?.name === 'QuotaExceededError') {
        alert(
          'El almacenamiento del navegador está lleno.\n\n' +
          'Solución: usá URL de imagen (ej: subí la foto a imgbb.com y pegá el link) ' +
          'en lugar de archivos subidos desde el dispositivo.'
        )
      } else {
        alert('Error al guardar. Revisá los datos e intentá de nuevo.')
      }
    }
  }

  const handleReset = () => {
    if (!window.confirm('¿Restaurar el catálogo de ejemplo? Perderás todos los cambios actuales.')) return
    onReset()
    handleNew()
  }

  // ────────────────────────────────────────────────────────────────────────────
  // Pantalla de contraseña
  // ────────────────────────────────────────────────────────────────────────────
  if (!authenticated) {
    return (
      <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 animate-fade-in">
        <div className="bg-white dark:bg-[#1c1c1e] rounded-2xl p-8 w-full max-w-sm shadow-2xl animate-slide-up relative">
          <button
            onClick={onClose}
            className="absolute top-4 right-4 w-8 h-8 flex items-center justify-center rounded-full bg-[#f5f5f7] dark:bg-[#2c2c2e] text-[#6e6e73] hover:text-[#1d1d1f] dark:hover:text-white transition-colors"
          >
            <XIcon className="w-4 h-4" />
          </button>

          <div className="text-center mb-6">
            <div className="text-3xl mb-3">🔐</div>
            <h2 className="text-xl font-semibold text-[#1d1d1f] dark:text-white">Panel Admin</h2>
            <p className="text-sm text-[#6e6e73] dark:text-[#86868b] mt-1">
              ELEEME · Acceso restringido
            </p>
          </div>

          <form onSubmit={handleLogin} className="space-y-3">
            <input
              type="password"
              placeholder="Contraseña"
              value={pwInput}
              onChange={(e) => setPwInput(e.target.value)}
              autoFocus
              className={`w-full bg-[#f5f5f7] dark:bg-[#2c2c2e] text-[#1d1d1f] dark:text-white rounded-xl px-4 py-3 text-sm outline-none transition-all ${
                pwError
                  ? 'ring-2 ring-red-500'
                  : 'focus:ring-2 focus:ring-[#0071e3]'
              }`}
            />
            {pwError && (
              <p className="text-red-500 text-xs text-center animate-slide-down">Contraseña incorrecta</p>
            )}
            <button
              type="submit"
              className="w-full bg-[#1d1d1f] dark:bg-white text-white dark:text-black font-medium py-3 rounded-xl text-sm hover:opacity-80 transition-opacity"
            >
              Ingresar
            </button>
          </form>
        </div>
      </div>
    )
  }

  // ────────────────────────────────────────────────────────────────────────────
  // Panel principal
  // ────────────────────────────────────────────────────────────────────────────
  return (
    <div className="fixed inset-0 z-50 bg-[#f5f5f7] dark:bg-black flex flex-col animate-fade-in">

      {/* ── Header del panel ─────────────────────────────────────────────────── */}
      <div className="bg-white dark:bg-[#1c1c1e] border-b border-gray-200 dark:border-white/10 px-4 sm:px-6 py-4 flex items-center justify-between flex-shrink-0">
        <div>
          <p
            className="font-black text-[#1d1d1f] dark:text-white text-base"
            style={{ letterSpacing: '-0.04em' }}
          >
            ELEEME
          </p>
          <p className="text-xs text-[#6e6e73] dark:text-[#86868b]">Panel de administración</p>
        </div>
        <div className="flex items-center gap-4">
          {saveStatus && (
            <span className="text-sm font-medium text-green-500 animate-slide-down">{saveStatus}</span>
          )}
          <button
            onClick={handleReset}
            className="text-xs text-[#6e6e73] dark:text-[#86868b] hover:text-red-500 transition-colors hidden sm:block"
          >
            Restaurar catálogo ejemplo
          </button>
          <button
            onClick={onClose}
            className="flex items-center gap-1.5 text-sm text-[#6e6e73] dark:text-[#86868b] hover:text-[#1d1d1f] dark:hover:text-white transition-colors"
          >
            <XIcon className="w-4 h-4" />
            Cerrar
          </button>
        </div>
      </div>

      {/* ── Body: lista izquierda + formulario derecho ───────────────────────── */}
      <div className="flex-1 overflow-hidden flex flex-col lg:flex-row">

        {/* Lista de productos */}
        <div className="lg:w-2/5 border-b lg:border-b-0 lg:border-r border-gray-200 dark:border-white/10 overflow-y-auto bg-white dark:bg-[#1c1c1e] flex flex-col">
          {/* Header de la lista con búsqueda */}
          <div className="px-4 py-3 border-b border-gray-100 dark:border-white/10 sticky top-0 bg-white dark:bg-[#1c1c1e] z-10 space-y-2">
            <div className="flex items-center justify-between">
              <p className="text-sm font-medium text-[#1d1d1f] dark:text-white">
                {products.length} {products.length === 1 ? 'producto' : 'productos'}
              </p>
              <button
                onClick={handleNew}
                className="text-sm font-medium text-[#0071e3] hover:underline"
              >
                + Nuevo
              </button>
            </div>
            {/* Búsqueda en lista */}
            {products.length > 3 && (
              <input
                type="text"
                placeholder="Buscar en el catálogo..."
                value={listSearch}
                onChange={(e) => setListSearch(e.target.value)}
                className="w-full bg-[#f5f5f7] dark:bg-[#2c2c2e] text-[#1d1d1f] dark:text-white rounded-lg px-3 py-1.5 text-xs outline-none focus:ring-1 focus:ring-[#0071e3] transition-all placeholder-[#86868b]"
              />
            )}
          </div>

          {filteredList.length === 0 && (
            <p className="text-sm text-[#6e6e73] dark:text-[#86868b] text-center py-8">
              {listSearch ? `Sin resultados para "${listSearch}"` : 'Sin productos. Agregá el primero →'}
            </p>
          )}

          <ul className="divide-y divide-gray-100 dark:divide-white/10 overflow-y-auto">
            {filteredList.map((p) => {
              // Índice real en products (para las flechas de reordenar)
              const realIndex = products.findIndex((prod) => prod.id === p.id)
              return (
                <li
                  key={p.id}
                  className={`flex items-center gap-3 px-3 py-3 transition-colors ${
                    editingId === p.id
                      ? 'bg-blue-50 dark:bg-blue-900/20'
                      : 'hover:bg-[#f5f5f7] dark:hover:bg-[#2c2c2e]'
                  }`}
                >
                  {/* Flechas de reordenamiento — solo si no hay filtro activo */}
                  {!listSearch && (
                    <div className="flex flex-col gap-0.5 flex-shrink-0">
                      <button
                        onClick={() => handleMoveUp(realIndex)}
                        disabled={realIndex === 0}
                        title="Subir"
                        className="p-0.5 text-[#86868b] hover:text-[#0071e3] disabled:opacity-20 disabled:cursor-not-allowed transition-colors"
                      >
                        <ArrowUpIcon className="w-3 h-3" />
                      </button>
                      <button
                        onClick={() => handleMoveDown(realIndex)}
                        disabled={realIndex === products.length - 1}
                        title="Bajar"
                        className="p-0.5 text-[#86868b] hover:text-[#0071e3] disabled:opacity-20 disabled:cursor-not-allowed transition-colors"
                      >
                        <ArrowDownIcon className="w-3 h-3" />
                      </button>
                    </div>
                  )}

                  {/* Miniatura */}
                  <img
                    src={p.imagen_url}
                    alt={p.nombre}
                    className="w-10 h-10 rounded-lg object-cover bg-[#f5f5f7] dark:bg-[#2c2c2e] flex-shrink-0"
                    onError={(e) => {
                      e.target.src = `https://placehold.co/40x40/f5f5f7/86868b?text=·`
                    }}
                  />

                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-[#1d1d1f] dark:text-white truncate leading-tight">
                      {p.nombre}
                    </p>
                    <p className="text-xs text-[#6e6e73] dark:text-[#86868b]">
                      {formatPrice(p.precio)}
                      {p.destacado && (
                        <span className="ml-2 text-[#0071e3]">★ Banner</span>
                      )}
                    </p>
                  </div>

                  {/* Acciones */}
                  <div className="flex gap-1.5 flex-shrink-0 items-center">
                    <button
                      onClick={() => handleEdit(p)}
                      title="Editar"
                      className="text-xs font-medium text-[#0071e3] hover:underline"
                    >
                      Editar
                    </button>
                    <span className="text-gray-300 dark:text-gray-600">·</span>
                    <button
                      onClick={() => handleDuplicate(p)}
                      title="Duplicar"
                      className="text-[#86868b] hover:text-[#0071e3] transition-colors"
                    >
                      <DuplicateIcon className="w-3.5 h-3.5" />
                    </button>
                    <span className="text-gray-300 dark:text-gray-600">·</span>
                    <button
                      onClick={() => handleDelete(p.id)}
                      title="Borrar"
                      className="text-xs font-medium text-red-500 hover:underline"
                    >
                      Borrar
                    </button>
                  </div>
                </li>
              )
            })}
          </ul>
        </div>

        {/* ── Formulario ─────────────────────────────────────────────────────── */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8" ref={formRef}>
          <h2 className="text-base font-semibold text-[#1d1d1f] dark:text-white mb-5">
            {editingId ? 'Editar producto' : 'Agregar producto nuevo'}
          </h2>

          <form onSubmit={handleSubmit} className="space-y-4 max-w-2xl">

            {/* Nombre + Categoría */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div className="sm:col-span-2">
                <label className="admin-label">Nombre *</label>
                <input
                  className="admin-input"
                  value={form.nombre}
                  onChange={f('nombre')}
                  required
                  placeholder="AirPods Pro (2ª generación)"
                />
              </div>
              <div>
                <label className="admin-label">Categoría *</label>
                <select className="admin-input" value={form.categoria} onChange={f('categoria')}>
                  {CATEGORIES.filter((c) => c !== 'Todos').map((c) => (
                    <option key={c}>{c}</option>
                  ))}
                </select>
              </div>
            </div>

            {/* Precios */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="admin-label">Precio actual (ARS) *</label>
                <input
                  className="admin-input"
                  type="number"
                  min="0"
                  value={form.precio}
                  onChange={f('precio')}
                  required
                  placeholder="189999"
                />
              </div>
              <div>
                <label className="admin-label">Precio tachado (opcional)</label>
                <input
                  className="admin-input"
                  type="number"
                  min="0"
                  value={form.precio_original}
                  onChange={f('precio_original')}
                  placeholder="219999"
                />
              </div>
            </div>

            {/* Tag + Compatibilidad */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="admin-label">Tag (badge de la tarjeta)</label>
                <input
                  className="admin-input"
                  value={form.tag}
                  onChange={f('tag')}
                  placeholder="Más vendido / Novedad / Oferta"
                />
              </div>
              <div>
                <label className="admin-label">Compatible con *</label>
                <input
                  className="admin-input"
                  value={form.compatible_con}
                  onChange={f('compatible_con')}
                  required
                  placeholder="iPhone 15 / Mac / iPad"
                />
              </div>
            </div>

            {/* Imagen */}
            <div>
              <label className="admin-label">Imagen del producto</label>
              <div className="flex gap-4 items-start">
                {/* Preview */}
                <div className="w-24 h-24 flex-shrink-0 rounded-xl overflow-hidden bg-[#f5f5f7] dark:bg-[#2c2c2e] flex items-center justify-center">
                  {form.imagen_url ? (
                    <img
                      src={form.imagen_url}
                      className="w-full h-full object-cover"
                      onError={(e) => { e.target.style.display = 'none' }}
                    />
                  ) : (
                    <span className="text-3xl">📷</span>
                  )}
                </div>

                <div className="flex-1 space-y-2">
                  {/* Upload desde dispositivo */}
                  <button
                    type="button"
                    onClick={() => fileRef.current.click()}
                    disabled={imageProcessing}
                    className="w-full border-2 border-dashed border-gray-300 dark:border-gray-600 hover:border-[#0071e3] rounded-xl px-4 py-3 text-sm text-[#6e6e73] dark:text-[#86868b] hover:text-[#0071e3] transition-colors text-center disabled:opacity-50"
                  >
                    {imageProcessing ? '⏳ Procesando imagen...' : '📁 Subir desde dispositivo'}
                  </button>
                  <p className="text-xs text-[#86868b] text-center">— o —</p>
                  {/* URL */}
                  <input
                    className="admin-input text-xs"
                    value={form.imagen_url.startsWith('data:') ? '' : form.imagen_url}
                    onChange={f('imagen_url')}
                    placeholder="Pegar URL de imagen (ej: https://imgbb.com/...)"
                  />
                  <input
                    ref={fileRef}
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={handleImageFile}
                  />
                  <p className="text-[10px] text-[#86868b]">
                    Tip: para URLs, subí la foto gratis en{' '}
                    <a href="https://imgbb.com" target="_blank" rel="noreferrer" className="text-[#0071e3] underline">
                      imgbb.com
                    </a>
                  </p>
                </div>
              </div>
            </div>

            {/* Descripción técnica */}
            <div>
              <label className="admin-label">Descripción técnica *</label>
              <textarea
                className="admin-input resize-none"
                rows={3}
                value={form.descripcion}
                onChange={f('descripcion')}
                required
                placeholder="Chip H2, cancelación activa de ruido, hasta 30h de batería..."
              />
            </div>

            {/* Por qué lo necesitás */}
            <div>
              <label className="admin-label">Por qué lo necesitás *</label>
              <textarea
                className="admin-input resize-none"
                rows={3}
                value={form.por_que_lo_necesitas}
                onChange={f('por_que_lo_necesitas')}
                required
                placeholder="Texto aspiracional que convenza al comprador. Sin frases genéricas."
              />
            </div>

            {/* Destacado */}
            <label className="flex items-center gap-3 cursor-pointer group">
              <input
                type="checkbox"
                checked={form.destacado}
                onChange={(e) => setForm((prev) => ({ ...prev, destacado: e.target.checked }))}
                className="w-4 h-4 accent-[#0071e3] flex-shrink-0"
              />
              <span className="text-sm text-[#1d1d1f] dark:text-[#e5e5ea]">
                Mostrar como producto destacado en el banner principal
                <span className="text-xs text-[#6e6e73] dark:text-[#86868b] ml-1">(solo uno a la vez)</span>
              </span>
            </label>

            {/* Acciones */}
            <div className="flex items-center gap-3 pt-2 flex-wrap">
              <button
                type="submit"
                className="bg-[#0071e3] hover:bg-[#0077ed] active:scale-95 text-white font-medium px-6 py-2.5 rounded-full text-sm transition-all"
              >
                {editingId ? 'Guardar cambios' : 'Agregar producto'}
              </button>
              {editingId && (
                <>
                  <button
                    type="button"
                    onClick={() => handleDuplicate(products.find(p => p.id === editingId))}
                    className="flex items-center gap-1.5 text-sm text-[#6e6e73] dark:text-[#86868b] hover:text-[#0071e3] dark:hover:text-[#0071e3] transition-colors"
                  >
                    <DuplicateIcon className="w-4 h-4" />
                    Duplicar
                  </button>
                  <button
                    type="button"
                    onClick={handleNew}
                    className="text-sm text-[#6e6e73] dark:text-[#86868b] hover:text-[#1d1d1f] dark:hover:text-white transition-colors"
                  >
                    Cancelar edición
                  </button>
                </>
              )}
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}
