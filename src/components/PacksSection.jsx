import PackCard from './PackCard'

export default function PacksSection({ packs, products, onAddPack }) {
  if (!packs.length) return null

  return (
    <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-10">
      <div className="mb-4">
        <h2 className="text-[22px] sm:text-[28px] font-semibold tracking-tight text-[#1d1d1f] dark:text-white">
          Packs
        </h2>
        <p className="mt-1 text-sm text-[#6e6e73] dark:text-[#86868b]">
          Combos simples para resolver compras completas en menos pasos.
        </p>
      </div>

      <div className="flex gap-3 overflow-x-auto scrollbar-hide pb-2">
        {packs.map((pack) => (
          <PackCard
            key={pack.id}
            pack={pack}
            products={products}
            onAddPack={onAddPack}
          />
        ))}
      </div>
    </section>
  )
}
