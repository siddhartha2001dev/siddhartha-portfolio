// Faint editorial column guides. Four columns on mobile, twelve on desktop.
export default function GridLines() {
  return (
    <div aria-hidden="true" className="pointer-events-none fixed inset-0 z-[5] mx-5 grid grid-cols-4 gap-0 md:mx-8 md:grid-cols-12">
      {Array.from({ length: 12 }).map((_, i) => (
        <div
          key={i}
          className={`border-l border-current opacity-[0.045] ${i >= 4 ? 'hidden md:block' : ''} ${i === 11 ? 'border-r' : ''}`}
        />
      ))}
    </div>
  )
}
