// Tiny editorial index marker: "02 — About / 22.57° N"
export default function SectionLabel({ index, title, meta, className = '' }) {
  return (
    <div className={`flex items-center gap-3 font-mono text-[11px] uppercase tracking-[0.2em] ${className}`}>
      <span className="text-accent">{String(index).padStart(2, '0')}</span>
      <span className="h-px w-8 bg-current opacity-40" />
      <span>{title}</span>
      {meta && <span className="opacity-50">/ {meta}</span>}
    </div>
  )
}
