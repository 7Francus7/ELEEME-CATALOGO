import { ChevronDownIcon } from './Icons'

// Sección plegable para las listas largas del modal (modelos, colores).
//
// El encabezado funciona como una fila de selector: muestra en qué estado está
// la elección sin necesidad de abrir. `highlight` se usa cuando todavía falta
// elegir algo, para que la fila se lea como una acción pendiente y no como un
// bloque decorativo cerrado.
export default function DisclosureSection({
  id,
  label,
  summary,
  open,
  onToggle,
  highlight = false,
  triggerRef,
  children,
}) {
  return (
    <div className="mb-5">
      <button
        ref={triggerRef}
        type="button"
        onClick={onToggle}
        aria-expanded={open}
        aria-controls={`${id}-panel`}
        className={`w-full flex items-center gap-3 rounded-2xl border px-4 py-3 text-left transition-colors ${
          highlight
            ? 'border-[#0071e3]/40 bg-[#0071e3]/[0.04] dark:bg-[#0a84ff]/[0.08] hover:border-[#0071e3]'
            : 'border-gray-200 dark:border-white/10 bg-white dark:bg-[#1c1c1e] hover:border-[#0071e3]/50'
        }`}
      >
        <span className="min-w-0 flex-1">
          <span className="block text-[11px] font-semibold uppercase tracking-widest text-[#6e6e73] dark:text-[#86868b]">
            {label}
          </span>
          <span className="mt-0.5 block text-sm font-medium text-[#1d1d1f] dark:text-white">
            {summary}
          </span>
        </span>

        <ChevronDownIcon
          className={`w-5 h-5 flex-shrink-0 text-[#86868b] transition-transform duration-200 ${
            open ? 'rotate-180' : ''
          }`}
        />
      </button>

      {open && (
        <div id={`${id}-panel`} role="region" aria-label={label} className="pt-3 animate-slide-down">
          {children}
        </div>
      )}
    </div>
  )
}
