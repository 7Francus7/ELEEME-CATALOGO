// ─── CONFIGURACIÓN ────────────────────────────────────────────────────────────
export const WHATSAPP_NUMBER = '542644056880'
export const INSTAGRAM_URL = 'https://www.instagram.com/eleeme.st.acc/'

export const CATEGORIES = ['Todos', 'iPhone', 'Mac', 'Watch', 'Audio', 'Otros']

// ─── HELPER DE PRECIO ─────────────────────────────────────────────────────────
export const formatPrice = (price) =>
  new Intl.NumberFormat('es-AR', {
    style: 'currency',
    currency: 'ARS',
    maximumFractionDigits: 0,
  }).format(price)

// ─── CATÁLOGO DE PRODUCTOS ────────────────────────────────────────────────────
// Campos:
//   imagen_url → reemplazar con fotos reales del cliente
//   compatible_con → se muestra en la card y en el modal
//   por_que_lo_necesitas → texto aspiracional en el modal (evitar frases genéricas)
export const products = [
  {
    id: 1,
    nombre: 'AirPods Pro (2ª generación)',
    categoria: 'Audio',
    precio: 189999,
    precio_original: 219999,
    descripcion:
      'Chip H2 con cancelación activa de ruido una generación más arriba. Modo Transparencia adaptativa que ajusta el entorno en tiempo real. Audio espacial personalizado con seguimiento dinámico de cabeza. Hasta 30 h de batería total con el estuche MagSafe cargable por USB-C.',
    por_que_lo_necesitas:
      'El ANC de segunda generación corta frecuencias bajas que otros auriculares no alcanzan. A los cinco minutos, olvidás que los tenés puestos. El precio bajó; la calidad, no.',
    imagen_url:
      'https://images.unsplash.com/photo-1600294037681-c80b4cb5b434?auto=format&fit=crop&w=800&q=80',
    compatible_con: 'iPhone 12 o posterior · Mac · iPad · Apple Watch',
    destacado: true,
    tag: 'Más vendido',
  },
  {
    id: 2,
    nombre: 'Cable MagSafe 2 m',
    categoria: 'iPhone',
    precio: 29999,
    precio_original: null,
    descripcion:
      'Carga magnética certificada MFi hasta 15 W. Imán de precisión que se alinea solo al acercarse al iPhone. Sin calor excesivo ni micro-daño por ciclos repetidos. Trenzado de nylon resistente a dobleces, con conector USB-C en el otro extremo.',
    por_que_lo_necesitas:
      'El cable incluido en caja entrega 5 W. Este entrega el triple. La diferencia en tu rutina de noche: carga completa antes de dormirte, sin apuros a la mañana.',
    imagen_url:
      'https://images.unsplash.com/photo-1610945415295-d9bbf067e59c?auto=format&fit=crop&w=800&q=80',
    compatible_con: 'iPhone 12 / 13 / 14 / 15 series · MagSafe Battery Pack',
    destacado: false,
    tag: 'Original Apple',
  },
  {
    id: 3,
    nombre: 'Apple Watch Series 9 GPS 45 mm',
    categoria: 'Watch',
    precio: 349999,
    precio_original: 389999,
    descripcion:
      'Chip S9 SiP de doble núcleo. Pantalla Always-On Retina de 2000 nits, visible bajo sol directo. ECG, oxímetro de sangre y sensor de temperatura de muñeca. Gesto de doble toque para responder llamadas sin tocar la pantalla.',
    por_que_lo_necesitas:
      'No es un reloj inteligente más. Es el dispositivo de salud más preciso que podés usar las 24 h sin ir a un laboratorio. Cada dato que registra es tuyo, en tiempo real.',
    imagen_url:
      'https://images.unsplash.com/photo-1546868871-7041f2a55e12?auto=format&fit=crop&w=800&q=80',
    compatible_con: 'iPhone XS o posterior con iOS 17',
    destacado: false,
    tag: 'Salud & Bienestar',
  },
  {
    id: 4,
    nombre: 'Funda Spigen Ultra Hybrid MagSafe',
    categoria: 'iPhone',
    precio: 18999,
    precio_original: null,
    descripcion:
      'Policarbonato transparente con marco TPU de alta resistencia al impacto. Imán MagSafe integrado de potencia certificada. Borde de cámara elevado 1,5 mm. Tratamiento anti-UV: no amarilla con el tiempo.',
    por_que_lo_necesitas:
      'Protege sin ocultar. El diseño del iPhone 15 Pro es parte del producto; esta funda lo exhibe y lo cuida al mismo tiempo. Compatible con todos los accesorios MagSafe del ecosistema.',
    imagen_url:
      'https://images.unsplash.com/photo-1574755393849-623942496936?auto=format&fit=crop&w=800&q=80',
    compatible_con: 'iPhone 15 Pro · Accesorios MagSafe universales',
    destacado: false,
    tag: 'Protección premium',
  },
  {
    id: 5,
    nombre: 'Belkin MagSafe 3 en 1 Stand',
    categoria: 'Otros',
    precio: 89999,
    precio_original: 109999,
    descripcion:
      'Carga simultánea de iPhone (15 W MagSafe), Apple Watch (5 W Fast Charge) y AirPods (5 W). Brazo ajustable para modo horizontal (StandBy iOS 17) o vertical. Cable USB-C trenzado. Cargador de pared 30 W incluido.',
    por_que_lo_necesitas:
      'Un cable enredado en el velador no es una solución, es resignación. Este stand convierte tu mesa de luz en una estación de carga ordenada. Sin buscar cables a las 7 AM.',
    imagen_url:
      'https://images.unsplash.com/photo-1583394838336-acd977736f90?auto=format&fit=crop&w=800&q=80',
    compatible_con: 'iPhone 12 o posterior · Apple Watch Series 4+ · AirPods Pro 2 / AirPods 3',
    destacado: false,
    tag: 'Todo en uno',
  },
  {
    id: 6,
    nombre: 'Hub USB-C 7 en 1 Anker 551',
    categoria: 'Mac',
    precio: 54999,
    precio_original: null,
    descripcion:
      'HDMI 4K 60 Hz. USB-A 3.0 × 2. USB-C datos 5 Gbps. Lectores SD y microSD simultáneos. Pass-through USB-C 100 W. Carcasa de aluminio anodizado al tono del MacBook. Sin driver, plug & play en cualquier sistema operativo.',
    por_que_lo_necesitas:
      'El MacBook tiene dos puertos. El mundo tiene diez periféricos. Este hub cierra la brecha sin comprometer la estética del escritorio ni calentar la laptop.',
    imagen_url:
      'https://images.unsplash.com/photo-1531297484001-80022131f5a1?auto=format&fit=crop&w=800&q=80',
    compatible_con: 'MacBook Pro 2019+ · MacBook Air M1/M2/M3 · iPad Pro con USB-C',
    destacado: false,
    tag: 'Productividad',
  },
  {
    id: 7,
    nombre: 'Magic Keyboard con Touch ID',
    categoria: 'Mac',
    precio: 94999,
    precio_original: null,
    descripcion:
      'Mecanismo de teclas de tijera silencioso con recorrido preciso. Touch ID para desbloqueo instantáneo y pago con Apple Pay. Batería de un mes con uso diario. Conexión USB-C cableada o Bluetooth estable hasta 10 m.',
    por_que_lo_necesitas:
      'Tocás el teclado ocho horas por día. La calidad de las teclas no es un lujo, es ergonomía. Este es el teclado con el que Apple diseña sus propias computadoras.',
    imagen_url:
      'https://images.unsplash.com/photo-1587829741301-dc798b83add3?auto=format&fit=crop&w=800&q=80',
    compatible_con: 'Mac con Apple Silicon · Mac Intel con macOS Ventura+ · iPad Pro M2+',
    destacado: false,
    tag: 'Diseño Apple',
  },
  {
    id: 8,
    nombre: 'Apple TV 4K (3ª generación)',
    categoria: 'Otros',
    precio: 124999,
    precio_original: 139999,
    descripcion:
      'Chip A15 Bionic. Video 4K HDR10+ y Dolby Vision a 60 fps. Audio Spatial con Dolby Atmos. Siri Remote con control de TV por infrarrojos. Hub HomeKit integrado para automatización del hogar sin hub adicional.',
    por_que_lo_necesitas:
      'Convierte cualquier televisor en pantalla Apple. Control del hogar, contenido en 4K real y cero anuncios en la interfaz. Una compra que mejora cada noche durante años.',
    imagen_url:
      'https://images.unsplash.com/photo-1593359677879-a4bb92f4834e?auto=format&fit=crop&w=800&q=80',
    compatible_con: 'TV con HDMI 2.1 · iPhone/iPad para AirPlay · HomePod',
    destacado: false,
    tag: 'Hogar inteligente',
  },
]
