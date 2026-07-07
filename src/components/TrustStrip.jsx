export default function TrustStrip({ items }) {
  if (!items?.length) return null

  return (
    <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-8">
      <div className="flex flex-wrap gap-2">
        {items.map((item) => (
          <div
            key={item}
            className="inline-flex items-center rounded-full bg-white dark:bg-[#1c1c1e] border border-black/[0.05] dark:border-white/[0.08] px-4 py-2 text-sm font-medium text-[#1d1d1f] dark:text-white"
          >
            <span className="mr-2 text-[#25d366]">✓</span>
            {item}
          </div>
        ))}
      </div>
    </section>
  )
}
