import { useState } from 'react'
import { WhatsAppIcon, InstagramIcon } from './Icons'
import { WHATSAPP_NUMBER, INSTAGRAM_URL } from '../data/products'

export default function Footer({ onAdminOpen }) {
  const year = new Date().getFullYear()
  // Contador secreto: 5 clicks en el © abre el panel admin
  const [clicks, setClicks] = useState(0)

  const handleCopyrightClick = () => {
    const next = clicks + 1
    setClicks(next)
    if (next >= 5) {
      setClicks(0)
      onAdminOpen()
    }
  }

  return (
    <footer className="border-t border-gray-200 dark:border-white/10 bg-white dark:bg-[#1c1c1e]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-8 mb-10">

          {/* Marca */}
          <div>
            <h3
              className="text-[#1d1d1f] dark:text-white mb-2"
              style={{ fontWeight: 900, fontSize: '16px', letterSpacing: '-0.04em' }}
            >
              ELEEME
            </h3>
            <p className="text-sm text-[#6e6e73] dark:text-[#86868b] leading-relaxed">
              Accesorios originales y premium para el ecosistema Apple.
              Calidad verificada, entrega inmediata.
            </p>
          </div>

          {/* Contacto */}
          <div>
            <h4 className="text-sm font-semibold text-[#1d1d1f] dark:text-white mb-3">Contacto</h4>
            <ul className="space-y-2 text-sm text-[#6e6e73] dark:text-[#86868b]">
              <li>
                <a
                  href={`https://wa.me/${WHATSAPP_NUMBER}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 hover:text-[#25d366] transition-colors"
                >
                  <WhatsAppIcon className="w-4 h-4" />
                  WhatsApp
                </a>
              </li>
            </ul>
          </div>

          {/* Redes */}
          <div>
            <h4 className="text-sm font-semibold text-[#1d1d1f] dark:text-white mb-3">Redes sociales</h4>
            <ul className="space-y-2 text-sm text-[#6e6e73] dark:text-[#86868b]">
              <li>
                <a
                  href={INSTAGRAM_URL}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 hover:text-[#e1306c] transition-colors"
                >
                  <InstagramIcon className="w-4 h-4" />
                  @eleeme.st.acc
                </a>
              </li>
            </ul>
          </div>
        </div>

        {/* Pie legal */}
        <div className="pt-6 border-t border-gray-200 dark:border-white/10 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 text-xs text-[#6e6e73] dark:text-[#86868b]">
          {/* 5 clicks en el © abre el panel admin — invisible para visitantes */}
          <button
            onClick={handleCopyrightClick}
            className="hover:opacity-70 transition-opacity cursor-default select-none text-left"
          >
            © {year} ELEEME · Todos los derechos reservados.
          </button>
          <p>Los precios pueden variar sin previo aviso.</p>
        </div>
      </div>
    </footer>
  )
}
