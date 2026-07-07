import { useState } from 'react'
import { DEFAULT_COMMERCIAL_BANNER } from '../data/catalogConfig'
import CommercialBanner from './CommercialBanner'
import { XIcon } from './Icons'

function linesFromList(list) {
  return (list || []).join('\n')
}

function listFromText(value, fallback) {
  const clean = value
    .split(/\n|,/)
    .map((item) => item.trim())
    .filter(Boolean)

  return clean.length ? clean : [...fallback]
}

export default function BannerManager({ config, onSave, onReset, onClose, onSaved }) {
  const [draft, setDraft] = useState(() => ({
    enabled: config?.enabled !== false,
    badge: config?.badge || DEFAULT_COMMERCIAL_BANNER.badge,
    title: config?.title || DEFAULT_COMMERCIAL_BANNER.title,
    description: config?.description || DEFAULT_COMMERCIAL_BANNER.description,
    note: config?.note || DEFAULT_COMMERCIAL_BANNER.note,
    cardsText: linesFromList(config?.cards || DEFAULT_COMMERCIAL_BANNER.cards),
    perksText: linesFromList(config?.perks || DEFAULT_COMMERCIAL_BANNER.perks),
  }))

  const update = (field) => (e) => setDraft((prev) => ({ ...prev, [field]: e.target.value }))

  const handleSave = () => {
    onSave({
      enabled: draft.enabled,
      badge: draft.badge,
      title: draft.title,
      description: draft.description,
      note: draft.note,
      cards: listFromText(draft.cardsText, DEFAULT_COMMERCIAL_BANNER.cards),
      perks: listFromText(draft.perksText, DEFAULT_COMMERCIAL_BANNER.perks),
    })
    onSaved?.('Banner actualizado')
    onClose()
  }

  const handleReset = () => {
    if (!window.confirm('Restaurar banner predeterminado?')) return
    onReset()
    onSaved?.('Banner restaurado')
    onClose()
  }

  const previewConfig = {
    enabled: true,
    badge: draft.badge,
    title: draft.title,
    description: draft.description,
    note: draft.note,
    cards: listFromText(draft.cardsText, DEFAULT_COMMERCIAL_BANNER.cards),
    perks: listFromText(draft.perksText, DEFAULT_COMMERCIAL_BANNER.perks),
  }

  return (
    <div
      className="fixed inset-0 z-[60] bg-black/45 backdrop-blur-sm flex items-end sm:items-center justify-center p-0 sm:p-4 animate-fade-in"
      onClick={onClose}
    >
      <div
        className="bg-[#f5f5f7] dark:bg-black w-full sm:max-w-5xl rounded-t-[32px] sm:rounded-[32px] shadow-2xl max-h-[92vh] flex flex-col overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between px-6 py-5 border-b border-gray-100 dark:border-white/10 bg-white dark:bg-[#1c1c1e]">
          <div>
            <h2 className="text-lg font-black tracking-tight dark:text-white">Banner de cuotas</h2>
            <p className="text-[11px] text-[#86868b] font-medium">Editable, visible u oculto desde admin.</p>
          </div>
          <button onClick={onClose} className="p-2 text-[#86868b] hover:bg-[#f5f5f7] dark:hover:bg-[#2c2c2e] rounded-full">
            <XIcon className="w-5 h-5" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8">
          <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.05fr)]">
            <div className="space-y-5">
              <div className="bg-white dark:bg-[#1c1c1e] rounded-[28px] p-6 shadow-sm space-y-5">
                <div className="flex items-center justify-between gap-4">
                  <div>
                    <p className="text-sm font-black text-[#1d1d1f] dark:text-white uppercase tracking-tight">Mostrar banner</p>
                    <p className="text-[11px] text-[#86868b] mt-1">Si lo apagás, no se ve en el sitio.</p>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer flex-shrink-0">
                    <input
                      type="checkbox"
                      checked={draft.enabled}
                      onChange={(e) => setDraft((prev) => ({ ...prev, enabled: e.target.checked }))}
                      className="sr-only peer"
                    />
                    <div className="w-14 h-8 bg-gray-200 rounded-full peer dark:bg-gray-700 peer-checked:bg-[#0071e3] peer-checked:after:translate-x-6 after:content-[''] after:absolute after:top-[4px] after:left-[4px] after:bg-white after:rounded-full after:h-6 after:w-6 after:transition-all shadow-inner" />
                  </label>
                </div>

                <div>
                  <label className="admin-label">Etiqueta superior</label>
                  <input className="admin-input" value={draft.badge} onChange={update('badge')} placeholder="Ej: Cuotas sin interes" />
                </div>

                <div>
                  <label className="admin-label">Titulo principal</label>
                  <input className="admin-input" value={draft.title} onChange={update('title')} placeholder="Ej: Hasta 6 cuotas sin interes" />
                </div>

                <div>
                  <label className="admin-label">Texto descriptivo</label>
                  <textarea rows={3} className="admin-input resize-none py-4" value={draft.description} onChange={update('description')} />
                </div>

                <div>
                  <label className="admin-label">Aclaracion chica</label>
                  <input className="admin-input" value={draft.note} onChange={update('note')} placeholder="Ej: Promocion sujeta a banco emisor" />
                </div>
              </div>

              <div className="bg-white dark:bg-[#1c1c1e] rounded-[28px] p-6 shadow-sm space-y-5">
                <div>
                  <label className="admin-label">Tarjetas destacadas</label>
                  <textarea
                    rows={5}
                    className="admin-input resize-none py-4"
                    value={draft.cardsText}
                    onChange={update('cardsText')}
                    placeholder={'Visa\nMastercard\nAmerican Express'}
                  />
                  <p className="text-[11px] text-[#86868b] mt-2">Una por linea o separadas por coma.</p>
                </div>

                <div>
                  <label className="admin-label">Beneficios cortos</label>
                  <textarea
                    rows={4}
                    className="admin-input resize-none py-4"
                    value={draft.perksText}
                    onChange={update('perksText')}
                    placeholder={'Sin recargo\nCompra segura\nAtencion personalizada'}
                  />
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <div className="flex items-center justify-between px-1">
                <div>
                  <p className="text-xs font-black uppercase tracking-[0.2em] text-[#86868b]">Vista previa</p>
                  {!draft.enabled && <p className="text-[11px] text-amber-600 mt-1">Guardado en oculto.</p>}
                </div>
              </div>
              <div className="rounded-[32px] border border-dashed border-[#d6d6db] dark:border-white/10 bg-white/60 dark:bg-[#1c1c1e]/40 py-2">
                <CommercialBanner config={previewConfig} preview />
              </div>
            </div>
          </div>
        </div>

        <div className="px-6 py-4 border-t border-gray-100 dark:border-white/10 bg-white dark:bg-[#1c1c1e] flex items-center gap-3">
          <button type="button" onClick={handleReset} className="text-xs font-bold text-[#86868b] hover:text-red-500">
            Restaurar predeterminado
          </button>
          <button
            type="button"
            onClick={handleSave}
            className="ml-auto bg-black dark:bg-white dark:text-black text-white font-black uppercase tracking-widest text-xs px-6 py-3 rounded-2xl active:scale-95 transition-all"
          >
            Guardar banner
          </button>
        </div>
      </div>
    </div>
  )
}
