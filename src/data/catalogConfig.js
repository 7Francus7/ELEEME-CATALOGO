export const WHATSAPP_NUMBER = '5492645588337'
export const INSTAGRAM_URL = 'https://www.instagram.com/eleeme.st.acc/'

// Categorías por defecto del catálogo (sin 'Todos', que se antepone siempre).
// El cliente puede editar esta lista desde el panel admin; estos son los valores
// iniciales si nunca tocó nada.
export const DEFAULT_CATEGORIES = [
  'Fundas',
  'Cargadores',
  'Cables',
  'Vidrio templado',
  'Protectores de cámara',
  'Correas',
  'Funda cargador',
  'Auriculares',
  'Funda auriculares',
  'Reloj',
  'Personaliza tu funda',
  'Battery pack',
  'JBL',
]

export const MODEL_CATEGORIES = ['Fundas', 'Protectores de cámara', 'Vidrio templado']

export const MODELS = [
  'iPhone 17 Pro Max',
  'iPhone 17 Pro',
  'iPhone 17',
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
  'iPhone 12 Pro Max',
  'iPhone 12 Pro',
  'iPhone 12',
  'iPhone 11 Pro Max',
  'iPhone 11 Pro',
  'iPhone 11',
]

export const COLOR_PRESETS = [
  { nombre: 'Blanco', codigo: '#FFFFFF' },
  { nombre: 'Negro', codigo: '#1d1d1f' },
  { nombre: 'Plata', codigo: '#C7C7CC' },
  { nombre: 'Dorado', codigo: '#D4AF37' },
  { nombre: 'Rosa', codigo: '#FF6482' },
  { nombre: 'Azul', codigo: '#0071e3' },
  { nombre: 'Rojo', codigo: '#ff3b30' },
  { nombre: 'Verde', codigo: '#34c759' },
  { nombre: 'Violeta', codigo: '#8e44ad' },
  { nombre: 'Transparente', codigo: '#EAEAEA' },
]

export const availableModelsFor = (productList) => {
  const set = new Set()
  productList.forEach((product) => (product.modelos || []).forEach((model) => set.add(model)))
  return MODELS.filter((model) => set.has(model))
}

export const DEFAULT_COMMERCIAL_BANNER = {
  enabled: true,
  badge: 'Cuotas sin interes',
  title: '3 cuotas sin interes',
  description: 'Paga con tus tarjetas favoritas y coordina tu compra por WhatsApp en minutos.',
  note: 'En compras superando los $50.000.',
  cards: ['Visa', 'Mastercard', 'Naranja X'],
  perks: ['Sin recargo', 'Compra segura', 'Atencion personalizada'],
}

export const TRUST_STRIP_ITEMS = [
  'Atencion por WhatsApp',
  'Productos con stock actualizado',
  'Retiro coordinado',
  'Asesoramiento para elegir modelo',
]
