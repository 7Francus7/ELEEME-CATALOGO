import { ChevronRightIcon } from './Icons'

export default function ServiceTechnic() {
  const services = [
    { id: 1, name: 'Consultoría', description: 'Asesoría personalizada en accesorios' },
    { id: 2, name: 'Garantía', description: 'Cobertura completa de tus productos' },
    { id: 3, name: 'Soporte', description: 'Asistencia técnica profesional' },
    { id: 4, name: 'Envío', description: 'Entregas rápidas y seguras' },
  ]

  return (
    <section className="pt-24 sm:pt-28 pb-6 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto animate-fade-in">
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-[#1c1c1e] via-[#2c2c2e] to-[#1a1a2e] min-h-[300px] sm:min-h-[520px] flex items-center group">

        {/* Luz de fondo dinámica */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-[-10%] right-[-5%] w-[500px] h-[500px] bg-[#0071e3]/20 rounded-full blur-[120px] animate-pulse" />
          <div className="absolute bottom-[-10%] left-[10%] w-[400px] h-[400px] bg-purple-500/10 rounded-full blur-[100px]" />
        </div>

        <div className="relative z-10 w-full p-6 sm:p-12 lg:p-16 animate-slide-up">
          <div className="max-w-3xl">
            <h1 className="text-3xl sm:text-5xl lg:text-6xl font-bold text-white leading-[1.1] mb-4 sm:mb-6 tracking-tight">
              Servicio Técnico
            </h1>

            <p className="text-[#86868b] text-sm sm:text-lg mb-8 sm:mb-12 leading-relaxed max-w-2xl">
              Atención especializada para tu ecosistema Apple. Contamos con profesionales dedicados a brindarte la mejor experiencia.
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
              {services.map((service) => (
                <button
                  key={service.id}
                  className="group/service flex items-start gap-4 p-4 sm:p-6 rounded-2xl bg-white/5 hover:bg-white/10 border border-white/10 hover:border-white/20 transition-all duration-300 text-left"
                >
                  <div className="flex-shrink-0 w-12 h-12 rounded-full bg-[#0071e3]/20 flex items-center justify-center group-hover/service:bg-[#0071e3]/30 transition-colors">
                    <ChevronRightIcon className="w-6 h-6 text-[#0071e3] group-hover/service:translate-x-0.5 transition-transform" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="text-sm sm:text-base font-semibold text-white mb-1">
                      {service.name}
                    </h3>
                    <p className="text-xs sm:text-sm text-[#86868b] group-hover/service:text-[#a1a1a6] transition-colors">
                      {service.description}
                    </p>
                  </div>
                </button>
              ))}
            </div>

            <div className="mt-8 sm:mt-12 flex flex-col sm:flex-row gap-3 sm:gap-4">
              <a
                href="https://wa.me/542644056880?text=Hola%2C%20quisiera%20consultar%20sobre%20servicio%20t%C3%A9cnico"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center justify-center gap-2 bg-[#25d366] hover:bg-[#20ba5a] active:scale-95 text-white text-sm sm:text-base font-semibold px-8 py-4 rounded-full transition-all duration-300 shadow-xl shadow-[#25d366]/20"
              >
                Consultar por WhatsApp
                <ChevronRightIcon className="w-5 h-5" />
              </a>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
