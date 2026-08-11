// Presentación de la marca arriba de los tiles.
//
// Antes el catálogo abría directamente con la fila de iconos de categorías: quien
// llegaba desde Instagram o WhatsApp no tenía forma de saber en 3 segundos qué
// vende ELEEME, y el único <h1> de la página era el de servicio técnico
// ("Reparamos tu iPhone"), que describe otra cosa.
//
// El texto es exactamente el que ya usaba el proyecto en el <meta description>
// y en el footer: no se agrega ninguna afirmación comercial nueva.
export default function CatalogIntro() {
  return (
    <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-20 sm:pt-24 animate-fade-in">
      <div className="mx-auto max-w-2xl text-center">
        <h1 className="text-[26px] sm:text-[34px] leading-[1.15] font-semibold tracking-tight text-[#1d1d1f] dark:text-white text-balance">
          Accesorios originales y premium para el ecosistema Apple.
        </h1>
        <p className="mt-3 text-[15px] sm:text-base leading-relaxed text-[#6e6e73] dark:text-[#86868b]">
          Calidad verificada, entrega inmediata.
        </p>
      </div>
    </section>
  )
}
