// ─── CONFIGURACIÓN ────────────────────────────────────────────────────────────
export const WHATSAPP_NUMBER = '542644056880'
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

// ─── HELPER DE PRECIO ─────────────────────────────────────────────────────────
export const formatPrice = (price) =>
  new Intl.NumberFormat('es-AR', {
    style: 'currency',
    currency: 'ARS',
    maximumFractionDigits: 0,
  }).format(price)

// Devuelve los modelos presentes en una lista de productos, ordenados según MODELS
export const availableModelsFor = (productList) => {
  const set = new Set()
  productList.forEach((p) => (p.modelos || []).forEach((m) => set.add(m)))
  return MODELS.filter((m) => set.has(m))
}

// ─── CATÁLOGO DE PRODUCTOS ────────────────────────────────────────────────────
// Campos:
//   categoria → una de CATEGORIES (sin 'Todos')
//   modelos → array de modelos compatibles; habilita el filtro por modelo (solo Fundas / Protectores)
//   compatible_con → texto legible que se muestra en la card y el modal
//   imagen_url → reemplazar con fotos reales del cliente
export const products = [
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
  },
  {
    id: 5,
    nombre: 'Protector de Cámara Vidrio Templado',
    categoria: 'Protectores de cámara',
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
  },
  {
    id: 8,
    nombre: 'Cable USB-C a Lightning 1 m',
    categoria: 'Cargadores',
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
  },
  {
    id: 10,
    nombre: 'Soporte Anillo MagSafe',
    categoria: 'Accesorios',
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
  },
  {
    id: 11,
    nombre: 'AirPods Pro (2ª generación)',
    categoria: 'Accesorios',
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
  },
]
