// ─── CONFIGURACIÓN ────────────────────────────────────────────────────────────
export const WHATSAPP_NUMBER = '5492645588337'
export const INSTAGRAM_URL = 'https://www.instagram.com/eleeme.st.acc/'

// Categorías principales del catálogo (la primera, 'Todos', es la vista inicial)
export const CATEGORIES = ['Todos', 'Fundas', 'Protectores de cámara', 'Cargadores', 'Accesorios']

// Categorías donde tiene sentido filtrar por modelo de iPhone
export const MODEL_CATEGORIES = ['Fundas', 'Protectores de cámara']

// Modelos de iPhone disponibles (orden de más nuevo a más antiguo).
// El filtro del header solo muestra los modelos que realmente existen en el catálogo.
export const MODELS = [
  'iPhone 16 Pro Max',
  'iPhone 16 Pro',
  'iPhone 16',
  'iPhone 15 Pro Max',
  'iPhone 15 Pro',
  'iPhone 15',
  'iPhone 14 Pro Max',
  'iPhone 14 Pro',
  'iPhone 14',
  'iPhone 13 Pro Max',
  'iPhone 13 Pro',
  'iPhone 13',
  'iPhone 12',
]

const PRODUCT_COMMERCIAL_FIELDS = {
  1: {
    handle: 'funda-metal-color-blanco',
    related: ['protector-camara-vidrio-templado', 'cargador-magsafe-15w', 'soporte-anillo-magsafe'],
    badges: ['mas-vendido'],
    visible: true,
    manualOrder: 10,
  },
  2: {
    handle: 'funda-transparente-reforzada',
    related: ['protector-camara-vidrio-templado', 'cargador-pared-20w', 'cable-usbc-lightning-1m'],
    badges: ['proteccion'],
    visible: true,
    manualOrder: 20,
  },
  3: {
    handle: 'funda-antigolpes-negra',
    related: ['protector-camara-vidrio-templado', 'cargador-pared-20w', 'cable-usbc-lightning-1m'],
    badges: ['proteccion'],
    visible: true,
    manualOrder: 30,
  },
  4: {
    handle: 'funda-silicona-magsafe',
    related: ['cargador-magsafe-15w', 'soporte-anillo-magsafe', 'cargador-pared-20w'],
    badges: ['magsafe'],
    visible: true,
    manualOrder: 40,
  },
  5: {
    handle: 'protector-camara-vidrio-templado',
    related: ['funda-transparente-reforzada', 'funda-antigolpes-negra', 'protector-camara-metalico'],
    badges: ['proteccion'],
    visible: true,
    manualOrder: 50,
  },
  6: {
    handle: 'protector-camara-metalico',
    related: ['funda-metal-color-blanco', 'funda-silicona-magsafe', 'protector-camara-vidrio-templado'],
    badges: ['proteccion'],
    visible: true,
    manualOrder: 60,
  },
  7: {
    handle: 'cargador-magsafe-15w',
    related: ['funda-silicona-magsafe', 'soporte-anillo-magsafe', 'cargador-pared-20w'],
    badges: ['carga'],
    visible: true,
    manualOrder: 70,
  },
  8: {
    handle: 'cable-usbc-lightning-1m',
    related: ['cargador-pared-20w', 'cargador-magsafe-15w', 'soporte-anillo-magsafe'],
    badges: ['carga'],
    visible: true,
    manualOrder: 80,
  },
  9: {
    handle: 'cargador-pared-20w',
    related: ['cable-usbc-lightning-1m', 'cargador-magsafe-15w', 'soporte-anillo-magsafe'],
    badges: ['carga'],
    visible: true,
    manualOrder: 90,
  },
  10: {
    handle: 'soporte-anillo-magsafe',
    related: ['funda-silicona-magsafe', 'cargador-magsafe-15w', 'cargador-pared-20w'],
    badges: ['magsafe'],
    visible: true,
    manualOrder: 100,
  },
  11: {
    handle: 'airpods-pro-2',
    related: ['cargador-magsafe-15w', 'cargador-pared-20w', 'soporte-anillo-magsafe'],
    badges: ['audio'],
    visible: true,
    manualOrder: 110,
  },
}

// Clave de stock usada por los productos que no se filtran por modelo (cargadores, accesorios)
export const DEFAULT_STOCK_KEY = 'Único'

// ─── HELPER DE PRECIO ─────────────────────────────────────────────────────────
export const formatPrice = (price) =>
  new Intl.NumberFormat('es-AR', {
    style: 'currency',
    currency: 'ARS',
    maximumFractionDigits: 0,
  }).format(price)

// ─── HELPERS DE MEDIOS (fotos / videos) ───────────────────────────────────────
// Un producto puede tener varias fotos (imagenes[]) y varios videos (videos[]).
// Para compatibilidad con catálogos viejos, si faltan los arrays se derivan de los
// campos antiguos imagen_url / video_url / video_storage_key.
//   - imagenes[]: cada entrada es un link, un base64 (data:) o una clave 'idb:<key>'
//                 que apunta a una imagen guardada en IndexedDB (ver utils/videoStore)
//   - videos[]:   cada entrada es { key } (video subido en IndexedDB) o { url } (link)
export const productImages = (product) => {
  if (Array.isArray(product?.imagenes) && product.imagenes.length) {
    return product.imagenes.filter(Boolean)
  }
  return product?.imagen_url ? [product.imagen_url] : []
}

export const productVideos = (product) => {
  if (Array.isArray(product?.videos) && product.videos.length) {
    return product.videos.filter((v) => v && (v.key || v.url))
  }
  const out = []
  if (product?.video_storage_key) out.push({ key: product.video_storage_key })
  if (product?.video_url) out.push({ url: product.video_url })
  return out
}

// Devuelve los modelos presentes en una lista de productos, ordenados según MODELS
export const availableModelsFor = (productList) => {
  const set = new Set()
  productList.forEach((p) => (p.modelos || []).forEach((m) => set.add(m)))
  return MODELS.filter((m) => set.has(m))
}

// ─── HELPERS DE STOCK Y COLORES ───────────────────────────────────────────────
// Indica si el producto se gestiona por modelo (Fundas / Protectores con modelos)
export const usesModels = (product) => Array.isArray(product.modelos) && product.modelos.length > 0

// Colores activos de un producto (los desactivados no se muestran al cliente)
export const activeColors = (product) =>
  (product.colores || []).filter((c) => c.activo !== false)

// Clave de stock a usar para el modelo seleccionado.
// - Productos con modelos: la clave es el modelo (null si no hay modelo elegido)
// - Productos sin modelos: siempre DEFAULT_STOCK_KEY
const stockKeyFor = (product, model) => {
  if (usesModels(product)) {
    return model && model !== 'Todos' ? model : null
  }
  return DEFAULT_STOCK_KEY
}

// Stock de un color concreto para el modelo dado. null si no aplica (sin modelo elegido)
export const colorStock = (product, model, colorName) => {
  const key = stockKeyFor(product, model)
  if (!key) return null
  return product.stock?.[key]?.[colorName] ?? 0
}

// Stock total del modelo (suma de todos los colores activos).
// null = no se puede determinar (producto con modelos sin modelo elegido)
export const modelStock = (product, model) => {
  const key = stockKeyFor(product, model)
  if (!key) return null
  const byColor = product.stock?.[key]
  if (!byColor) return 0
  return activeColors(product).reduce((sum, c) => sum + (Number(byColor[c.nombre]) || 0), 0)
}

// True si hay al menos una unidad para el modelo dado
export const hasStock = (product, model) => {
  const total = modelStock(product, model)
  return total === null ? null : total > 0
}

// Stock total del producto considerando todos sus modelos o su stock unico.
export const productTotalStock = (product) => {
  if (!product?.stock) return 0

  if (!usesModels(product)) {
    return modelStock(product, null) ?? 0
  }

  return Object.keys(product.stock).reduce((sum, model) => {
    return sum + activeColors(product).reduce((colorSum, color) => {
      return colorSum + (Number(product.stock?.[model]?.[color.nombre]) || 0)
    }, 0)
  }, 0)
}

export const productHasAnyStock = (product) => productTotalStock(product) > 0

export const savingsAmount = (entry) => {
  if (!Number.isFinite(entry?.precio_original) || !Number.isFinite(entry?.precio)) return 0
  if (entry.precio_original <= entry.precio) return 0
  return entry.precio_original - entry.precio
}

// ─── CATÁLOGO DE PRODUCTOS ────────────────────────────────────────────────────
// Campos:
//   categoria → una de CATEGORIES (sin 'Todos')
//   modelos → array de modelos compatibles; habilita el filtro por modelo (solo Fundas / Protectores)
//   compatible_con → texto legible que se muestra en la card y el modal
//   imagen_url → reemplazar con fotos reales del cliente
//   imagen_ajuste → 'cover' (rellena el recuadro, por defecto) | 'contain' (muestra la foto completa)
//   video_url → link opcional a un video (.mp4 se reproduce inline; redes sociales abren en pestaña)
//   video_storage_key → clave del video subido al catálogo (el archivo vive en IndexedDB, ver utils/videoStore)
//   colores → [{ nombre, codigo (hex), activo }]
//   stock → { [modelo|DEFAULT_STOCK_KEY]: { [nombreColor]: cantidad } }
//   notificar_cuando_stock → emails que esperan aviso de restock
//   stock_gestion → 'manual' | 'automatico'
const BASE_PRODUCTS = [
  {
    id: 1,
    nombre: 'Funda Metal Color Blanco',
    categoria: 'Fundas',
    precio: 16999,
    precio_original: 21999,
    modelos: ['iPhone 15 Pro Max', 'iPhone 15 Pro', 'iPhone 14 Pro Max', 'iPhone 14 Pro', 'iPhone 13 Pro'],
    descripcion:
      'Marco de aluminio anodizado con espalda de policarbonato blanco mate. Botones metálicos de respuesta firme. Bordes elevados que protegen pantalla y cámara. Compatible con MagSafe.',
    por_que_lo_necesitas:
      'Un acabado premium que se siente sólido en la mano y mantiene el iPhone como nuevo. El blanco mate no se mancha ni amarillea con el uso.',
    imagen_url:
      'https://images.unsplash.com/photo-1601593346740-925612772716?auto=format&fit=crop&w=800&q=80',
    compatible_con: 'iPhone 13 Pro a 15 Pro Max',
    destacado: true,
    tag: 'Más vendido',
    colores: [
      { nombre: 'Blanco', codigo: '#FFFFFF', activo: true },
      { nombre: 'Plata', codigo: '#C7C7CC', activo: true },
      { nombre: 'Negro', codigo: '#1d1d1f', activo: true },
    ],
    stock: {
      'iPhone 15 Pro Max': { Blanco: 5, Plata: 3, Negro: 0 },
      'iPhone 15 Pro': { Blanco: 2, Plata: 0, Negro: 4 },
      'iPhone 14 Pro Max': { Blanco: 0, Plata: 1, Negro: 2 },
      'iPhone 14 Pro': { Blanco: 3, Plata: 2, Negro: 0 },
      'iPhone 13 Pro': { Blanco: 1, Plata: 0, Negro: 0 },
    },
    notificar_cuando_stock: [],
    stock_gestion: 'manual',
  },
  {
    id: 2,
    nombre: 'Funda Transparente Reforzada',
    categoria: 'Fundas',
    precio: 12999,
    precio_original: null,
    modelos: [
      'iPhone 16 Pro Max', 'iPhone 16 Pro', 'iPhone 16',
      'iPhone 15 Pro Max', 'iPhone 15 Pro', 'iPhone 15',
      'iPhone 14 Pro Max', 'iPhone 14', 'iPhone 13',
    ],
    descripcion:
      'Policarbonato cristalino con marco de TPU flexible y esquinas reforzadas. Tratamiento anti-UV que evita el amarilleo. Borde de cámara elevado 1,5 mm.',
    por_que_lo_necesitas:
      'Protege sin esconder el diseño del iPhone. Las esquinas reforzadas absorben los golpes de las caídas más comunes.',
    imagen_url:
      'https://images.unsplash.com/photo-1574755393849-623942496936?auto=format&fit=crop&w=800&q=80',
    compatible_con: 'iPhone 13 a 16 Pro Max',
    destacado: false,
    tag: 'Anti-amarilleo',
    colores: [
      { nombre: 'Transparente', codigo: '#EAEAEA', activo: true },
      { nombre: 'Humo', codigo: '#6e6e73', activo: true },
    ],
    stock: {
      'iPhone 16 Pro Max': { Transparente: 8, Humo: 4 },
      'iPhone 16 Pro': { Transparente: 6, Humo: 2 },
      'iPhone 16': { Transparente: 5, Humo: 0 },
      'iPhone 15 Pro Max': { Transparente: 4, Humo: 3 },
      'iPhone 15 Pro': { Transparente: 0, Humo: 1 },
      'iPhone 15': { Transparente: 3, Humo: 2 },
      'iPhone 14 Pro Max': { Transparente: 2, Humo: 0 },
      'iPhone 14': { Transparente: 1, Humo: 1 },
      'iPhone 13': { Transparente: 0, Humo: 0 },
    },
    notificar_cuando_stock: [],
    stock_gestion: 'manual',
  },
  {
    id: 3,
    nombre: 'Funda Antigolpes Negra',
    categoria: 'Fundas',
    precio: 14999,
    precio_original: 18999,
    modelos: [
      'iPhone 15 Pro Max', 'iPhone 15', 'iPhone 14 Pro Max',
      'iPhone 14', 'iPhone 13 Pro Max', 'iPhone 13', 'iPhone 12',
    ],
    descripcion:
      'Doble capa: TPU absorbente por dentro y policarbonato rígido por fuera. Esquinas con cámaras de aire (grado militar). Textura antideslizante.',
    por_que_lo_necesitas:
      'La máxima protección para quienes se les cae el teléfono seguido. Pasa la prueba de caída desde 2 metros sin que el iPhone sufra.',
    imagen_url:
      'https://images.unsplash.com/photo-1592890288564-76628a30a657?auto=format&fit=crop&w=800&q=80',
    compatible_con: 'iPhone 12 a 15 Pro Max',
    destacado: false,
    tag: 'Grado militar',
    colores: [
      { nombre: 'Negro', codigo: '#1d1d1f', activo: true },
      { nombre: 'Azul', codigo: '#2563eb', activo: true },
      { nombre: 'Verde Militar', codigo: '#4b5320', activo: true },
    ],
    stock: {
      'iPhone 15 Pro Max': { Negro: 6, Azul: 3, 'Verde Militar': 2 },
      'iPhone 15': { Negro: 4, Azul: 0, 'Verde Militar': 1 },
      'iPhone 14 Pro Max': { Negro: 2, Azul: 2, 'Verde Militar': 0 },
      'iPhone 14': { Negro: 5, Azul: 1, 'Verde Militar': 3 },
      'iPhone 13 Pro Max': { Negro: 0, Azul: 0, 'Verde Militar': 0 },
      'iPhone 13': { Negro: 3, Azul: 2, 'Verde Militar': 0 },
      'iPhone 12': { Negro: 1, Azul: 0, 'Verde Militar': 1 },
    },
    notificar_cuando_stock: [],
    stock_gestion: 'manual',
  },
  {
    id: 4,
    nombre: 'Funda Silicona MagSafe',
    categoria: 'Fundas',
    precio: 15999,
    precio_original: null,
    modelos: [
      'iPhone 16 Pro', 'iPhone 16', 'iPhone 15 Pro Max',
      'iPhone 15', 'iPhone 14 Pro', 'iPhone 14',
    ],
    descripcion:
      'Silicona suave al tacto con interior de microfibra. Imán MagSafe integrado de potencia certificada. Disponible en varios colores. Botones recubiertos.',
    por_que_lo_necesitas:
      'El tacto sedoso de la silicona original con el agarre perfecto del MagSafe. Se conecta solo a cargadores y accesorios magnéticos.',
    imagen_url:
      'https://images.unsplash.com/photo-1556656793-08538906a9f8?auto=format&fit=crop&w=800&q=80',
    compatible_con: 'iPhone 14 a 16 Pro',
    destacado: false,
    tag: 'MagSafe',
    colores: [
      { nombre: 'Naranja', codigo: '#FF9500', activo: true },
      { nombre: 'Negro', codigo: '#1d1d1f', activo: true },
      { nombre: 'Azul', codigo: '#0071e3', activo: true },
      { nombre: 'Rosa', codigo: '#FF6482', activo: true },
      { nombre: 'Blanco', codigo: '#FFFFFF', activo: true },
    ],
    stock: {
      'iPhone 16 Pro': { Naranja: 3, Negro: 5, Azul: 2, Rosa: 4, Blanco: 1 },
      'iPhone 16': { Naranja: 0, Negro: 3, Azul: 2, Rosa: 0, Blanco: 2 },
      'iPhone 15 Pro Max': { Naranja: 2, Negro: 4, Azul: 0, Rosa: 3, Blanco: 5 },
      'iPhone 15': { Naranja: 1, Negro: 0, Azul: 1, Rosa: 2, Blanco: 0 },
      'iPhone 14 Pro': { Naranja: 0, Negro: 2, Azul: 0, Rosa: 0, Blanco: 1 },
      'iPhone 14': { Naranja: 2, Negro: 1, Azul: 3, Rosa: 1, Blanco: 0 },
    },
    notificar_cuando_stock: [],
    stock_gestion: 'manual',
  },
  {
    id: 5,
    nombre: 'Protector de Cámara Vidrio Templado',
    categoria: 'Vidrio templado',
    precio: 6999,
    precio_original: 8999,
    modelos: [
      'iPhone 16 Pro Max', 'iPhone 16 Pro', 'iPhone 15 Pro Max',
      'iPhone 15 Pro', 'iPhone 14 Pro Max', 'iPhone 14 Pro',
    ],
    descripcion:
      'Vidrio templado 9H individual para cada lente, con marco de aluminio. No interfiere con el flash ni el modo nocturno. Instalación con guía de alineación.',
    por_que_lo_necesitas:
      'El lente es lo más caro de reparar del iPhone. Por una fracción del costo lo dejás blindado contra rayones y golpes.',
    imagen_url:
      'https://images.unsplash.com/photo-1510557880182-3d4d3cba35a5?auto=format&fit=crop&w=800&q=80',
    compatible_con: 'iPhone 14 Pro a 16 Pro Max',
    destacado: false,
    tag: 'Vidrio 9H',
    colores: [
      { nombre: 'Transparente', codigo: '#EAEAEA', activo: true },
      { nombre: 'Negro', codigo: '#1d1d1f', activo: true },
    ],
    stock: {
      'iPhone 16 Pro Max': { Transparente: 10, Negro: 6 },
      'iPhone 16 Pro': { Transparente: 8, Negro: 4 },
      'iPhone 15 Pro Max': { Transparente: 5, Negro: 0 },
      'iPhone 15 Pro': { Transparente: 3, Negro: 2 },
      'iPhone 14 Pro Max': { Transparente: 0, Negro: 1 },
      'iPhone 14 Pro': { Transparente: 2, Negro: 0 },
    },
    notificar_cuando_stock: [],
    stock_gestion: 'manual',
  },
  {
    id: 6,
    nombre: 'Protector de Cámara Metálico',
    categoria: 'Protectores de cámara',
    precio: 7999,
    precio_original: null,
    modelos: [
      'iPhone 16 Pro Max', 'iPhone 15 Pro Max', 'iPhone 15',
      'iPhone 14 Pro Max', 'iPhone 14', 'iPhone 13',
    ],
    descripcion:
      'Anillo de aleación de aluminio que rodea todo el módulo de cámara. Resiste caídas y golpes laterales. Disponible en negro, plata y dorado.',
    por_que_lo_necesitas:
      'Protección estructural del módulo completo, no solo del vidrio. Suma un detalle de color que combina con la funda.',
    imagen_url:
      'https://images.unsplash.com/photo-1592434134753-a70baf7979d5?auto=format&fit=crop&w=800&q=80',
    compatible_con: 'iPhone 13 a 16 Pro Max',
    destacado: false,
    tag: 'Aluminio',
    colores: [
      { nombre: 'Negro', codigo: '#1d1d1f', activo: true },
      { nombre: 'Plata', codigo: '#C7C7CC', activo: true },
      { nombre: 'Dorado', codigo: '#D4AF37', activo: true },
    ],
    stock: {
      'iPhone 16 Pro Max': { Negro: 4, Plata: 3, Dorado: 2 },
      'iPhone 15 Pro Max': { Negro: 2, Plata: 0, Dorado: 1 },
      'iPhone 15': { Negro: 3, Plata: 2, Dorado: 0 },
      'iPhone 14 Pro Max': { Negro: 0, Plata: 1, Dorado: 0 },
      'iPhone 14': { Negro: 1, Plata: 0, Dorado: 2 },
      'iPhone 13': { Negro: 0, Plata: 0, Dorado: 0 },
    },
    notificar_cuando_stock: [],
    stock_gestion: 'manual',
  },
  {
    id: 7,
    nombre: 'Cargador MagSafe 15W',
    categoria: 'Cargadores',
    precio: 24999,
    precio_original: 29999,
    modelos: [],
    descripcion:
      'Carga magnética inalámbrica de hasta 15 W. Alineación automática por imanes. Cable USB-C trenzado de 1 m. Sin sobrecalentamiento por ciclos repetidos.',
    por_que_lo_necesitas:
      'Apoyás el iPhone y carga solo, sin enchufar nada. La forma más cómoda de mantener la batería arriba durante el día.',
    imagen_url:
      'https://images.unsplash.com/photo-1591290619762-d6f1f2c4f7c5?auto=format&fit=crop&w=800&q=80',
    compatible_con: 'iPhone 12 o posterior · AirPods con estuche MagSafe',
    destacado: false,
    tag: 'Inalámbrico',
    colores: [
      { nombre: 'Blanco', codigo: '#FFFFFF', activo: true },
    ],
    stock: {
      [DEFAULT_STOCK_KEY]: { Blanco: 7 },
    },
    notificar_cuando_stock: [],
    stock_gestion: 'manual',
  },
  {
    id: 8,
    nombre: 'Cable USB-C a Lightning 1 m',
    categoria: 'Cables',
    precio: 9999,
    precio_original: null,
    modelos: [],
    descripcion:
      'Certificado MFi para carga rápida de hasta 20 W con adaptador compatible. Trenzado de nylon resistente a dobleces. Conectores reforzados.',
    por_que_lo_necesitas:
      'El cable barato se pela en meses. Este aguanta miles de ciclos y carga el doble de rápido que el de caja.',
    imagen_url:
      'https://images.unsplash.com/photo-1610945415295-d9bbf067e59c?auto=format&fit=crop&w=800&q=80',
    compatible_con: 'iPhone 5 a 14 series · iPad con Lightning',
    destacado: false,
    tag: 'Certificado MFi',
    colores: [
      { nombre: 'Blanco', codigo: '#FFFFFF', activo: true },
      { nombre: 'Negro', codigo: '#1d1d1f', activo: true },
    ],
    stock: {
      [DEFAULT_STOCK_KEY]: { Blanco: 12, Negro: 0 },
    },
    notificar_cuando_stock: [],
    stock_gestion: 'manual',
  },
  {
    id: 9,
    nombre: 'Cargador de Pared 20W USB-C',
    categoria: 'Cargadores',
    precio: 13999,
    precio_original: 16999,
    modelos: [],
    descripcion:
      'Adaptador compacto de 20 W con tecnología Power Delivery. Carga el iPhone al 50% en 30 minutos. Protección contra sobrecarga y cortocircuito.',
    por_que_lo_necesitas:
      'Carga rápida real en un cubo del tamaño de un dado. El complemento ideal para cualquier cable USB-C.',
    imagen_url:
      'https://images.unsplash.com/photo-1588872657578-7efd1f1555ed?auto=format&fit=crop&w=800&q=80',
    compatible_con: 'iPhone 8 o posterior · AirPods · Apple Watch (con cable)',
    destacado: false,
    tag: 'Carga rápida',
    colores: [
      { nombre: 'Blanco', codigo: '#FFFFFF', activo: true },
    ],
    stock: {
      [DEFAULT_STOCK_KEY]: { Blanco: 9 },
    },
    notificar_cuando_stock: [],
    stock_gestion: 'manual',
  },
  {
    id: 10,
    nombre: 'Soporte Anillo MagSafe',
    categoria: 'Correas',
    precio: 8999,
    precio_original: null,
    modelos: [],
    descripcion:
      'Anillo plegable magnético que funciona como agarre y como soporte. Imán MagSafe de alta sujeción. Acabado en aluminio.',
    por_que_lo_necesitas:
      'Sostené el teléfono con un dedo o apoyalo para ver videos sin manos. Se pega y se saca sin dejar residuos.',
    imagen_url:
      'https://images.unsplash.com/photo-1530319067432-f2a729c03db5?auto=format&fit=crop&w=800&q=80',
    compatible_con: 'iPhone 12 o posterior · Fundas MagSafe',
    destacado: false,
    tag: 'Agarre + soporte',
    colores: [
      { nombre: 'Negro', codigo: '#1d1d1f', activo: true },
      { nombre: 'Plata', codigo: '#C7C7CC', activo: true },
      { nombre: 'Dorado', codigo: '#D4AF37', activo: true },
    ],
    stock: {
      [DEFAULT_STOCK_KEY]: { Negro: 4, Plata: 2, Dorado: 0 },
    },
    notificar_cuando_stock: [],
    stock_gestion: 'manual',
  },
  {
    id: 11,
    nombre: 'AirPods Pro (2ª generación)',
    categoria: 'Auriculares',
    precio: 189999,
    precio_original: 219999,
    modelos: [],
    descripcion:
      'Chip H2 con cancelación activa de ruido. Modo Transparencia adaptativa. Audio espacial con seguimiento de cabeza. Hasta 30 h de batería con el estuche USB-C.',
    por_que_lo_necesitas:
      'La cancelación de ruido de segunda generación corta frecuencias que otros auriculares no alcanzan. A los cinco minutos olvidás que los tenés puestos.',
    imagen_url:
      'https://images.unsplash.com/photo-1600294037681-c80b4cb5b434?auto=format&fit=crop&w=800&q=80',
    compatible_con: 'iPhone 12 o posterior · Mac · iPad',
    destacado: false,
    tag: 'Audio premium',
    colores: [
      { nombre: 'Blanco', codigo: '#FFFFFF', activo: true },
    ],
    stock: {
      [DEFAULT_STOCK_KEY]: { Blanco: 3 },
    },
    notificar_cuando_stock: [],
    stock_gestion: 'manual',
  },
]

export const products = BASE_PRODUCTS.map((product) => {
  const commercial = PRODUCT_COMMERCIAL_FIELDS[product.id] || {}

  return {
    visible: true,
    manualOrder: product.id * 10,
    related: [],
    badges: [],
    handle: String(product.id),
    ...product,
    ...commercial,
  }
})
