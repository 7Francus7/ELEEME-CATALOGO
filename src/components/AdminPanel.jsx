import { useState, useRef, useEffect } from 'react'
import { CATEGORIES, MODEL_CATEGORIES, MODELS, DEFAULT_STOCK_KEY, formatPrice } from '../data/products'
import { XIcon, ChevronLeftIcon } from './Icons'

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
  imagen_url: '',
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

export default function AdminPanel({ products, onSave, onReset, onClose }) {
  const [authenticated, setAuthenticated] = useState(false)
  const [pwInput, setPwInput] = useState('')
  const [pwError, setPwError] = useState(false)
  const [form, setForm] = useState(EMPTY_FORM)
  const [editingId, setEditingId] = useState(null)
  const [imageProcessing, setImageProcessing] = useState(false)
  const [saveStatus, setSaveStatus] = useState('')
  const [searchQuery, setSearchQuery] = useState('')
  const [activeView, setActiveView] = useState('list') // 'list' | 'form'
  
  const fileRef = useRef()
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
    setForm(EMPTY_FORM)
    setEditingId(null)
    setActiveView('form')
    setTimeout(() => formRef.current?.scrollTo({ top: 0, behavior: 'smooth' }), 50)
  }

  const handleDelete = (id) => {
    if (!window.confirm('¿Eliminar este producto?')) return
    onSave(products.filter((p) => p.id !== id))
    if (editingId === id) {
      setEditingId(null)
      setForm(EMPTY_FORM)
    }
  }

  const handleDuplicate = (product) => {
    const newId = products.length ? Math.max(...products.map((p) => p.id)) + 1 : 1
    const duplicated = {
      ...product,
      id: newId,
      nombre: `${product.nombre} (Copia)`,
      destacado: false,
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

  const handleImageFile = async (e) => {
    const file = e.target.files?.[0]
    if (!file) return
    try {
      setImageProcessing(true)
      const base64 = await resizeImage(file)
      setForm((prev) => ({ ...prev, imagen_url: base64 }))
    } catch {
      alert('Error al procesar la imagen.')
    } finally {
      setImageProcessing(false)
      e.target.value = ''
    }
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

  // Claves de stock: por modelo (Fundas/Protectores) o una única para el resto
  const stockKeys =
    MODEL_CATEGORIES.includes(form.categoria) && (form.modelos || []).length
      ? form.modelos
      : [DEFAULT_STOCK_KEY]

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
          <div className="p-4 border-b border-gray-50 dark:border-white/5 flex-shrink-0">
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
                    <img src={p.imagen_url} className="w-full h-full object-cover" />
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
                    <label className="admin-label">Categoría *</label>
                    <select className="admin-input appearance-none" style={{ backgroundImage: 'url("data:image/svg+xml,%3Csvg xmlns=\'http://www.w3.org/2000/svg\' fill=\'none\' viewBox=\'0 0 24 24\' stroke=\'currentColor\'%3E%3Cpath stroke-linecap=\'round\' stroke-linejoin=\'round\' stroke-width=\'2\' d=\'M19 9l-7 7-7-7\' /%3E%3C/svg%3E")', backgroundRepeat: 'no-repeat', backgroundPosition: 'right 1rem center', backgroundSize: '1rem' }} value={form.categoria} onChange={f('categoria')}>
                      {CATEGORIES.filter(c => c !== 'Todos').map(c => <option key={c}>{c}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="admin-label">Compatible con *</label>
                    <input className="admin-input" value={form.compatible_con} onChange={f('compatible_con')} required placeholder="Ej: iPhone 12 en adelante" />
                  </div>
                </div>

                {/* Modelos compatibles — habilita el filtro por modelo (solo Fundas / Protectores) */}
                {MODEL_CATEGORIES.includes(form.categoria) && (
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
                  <h3 className="text-xs font-black uppercase text-[#86868b] tracking-tighter mb-4">Colores disponibles</h3>
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
                <label className="admin-label mb-6 block">Imagen del Producto *</label>
                <div className="flex flex-col md:flex-row gap-8 items-center">
                  <div className="w-48 h-48 bg-[#fbfbfd] dark:bg-[#2c2c2e] rounded-[24px] flex items-center justify-center border-2 border-dashed border-gray-100 dark:border-white/5 overflow-hidden group relative">
                    {form.imagen_url ? (
                      <>
                        <img src={form.imagen_url} className="w-full h-full object-contain p-4 transition-transform group-hover:scale-105" />
                        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                          <button type="button" onClick={() => setForm(p => ({...p, imagen_url: ''}))} className="bg-white text-black text-[10px] font-black px-3 py-1.5 rounded-full shadow-xl">QUITAR</button>
                        </div>
                      </>
                    ) : (
                      <span className="text-5xl opacity-20">📷</span>
                    )}
                  </div>
                  <div className="flex-1 w-full space-y-4">
                    <button type="button" onClick={() => fileRef.current.click()} disabled={imageProcessing} className="w-full bg-[#0071e3] text-white py-5 rounded-[20px] text-sm font-black uppercase tracking-widest shadow-xl shadow-blue-500/20 active:scale-95 transition-all">
                      {imageProcessing ? 'PROCESANDO...' : 'ELEGIR DESDE GALERÍA'}
                    </button>
                    <div className="flex items-center gap-3">
                      <div className="h-px bg-gray-100 dark:bg-white/5 flex-1"></div>
                      <span className="text-[10px] font-black text-gray-300 uppercase tracking-widest">o pega un link</span>
                      <div className="h-px bg-gray-100 dark:bg-white/5 flex-1"></div>
                    </div>
                    <input type="text" className="admin-input text-sm py-4" value={form.imagen_url.startsWith('data:') ? '' : form.imagen_url} onChange={f('imagen_url')} placeholder="https://ejemplo.com/imagen.jpg" />
                    <p className="text-[10px] text-[#86868b] font-medium text-center italic">Tip: recomendamos imágenes con fondo blanco o transparente.</p>
                    <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={handleImageFile} />
                  </div>
                </div>
              </div>

              {/* Botón Guardar (Flotante en móvil) */}
              <div className="fixed bottom-0 left-0 right-0 p-5 bg-white/80 dark:bg-black/80 backdrop-blur-xl border-t border-gray-100 dark:border-white/10 lg:relative lg:bg-transparent lg:border-0 lg:p-0 lg:pt-8 z-30">
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
    </div>
  )
}
