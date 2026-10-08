// Subtle film grain, generated inline (no asset). Fixed, non-interactive.
export default function Grain() {
  const svg = `<svg xmlns='http://www.w3.org/2000/svg' width='160' height='160'><filter id='n'><feTurbulence type='fractalNoise' baseFrequency='.9' numOctaves='2' stitchTiles='stitch'/><feColorMatrix values='0 0 0 0 1 0 0 0 0 1 0 0 0 0 1 0 0 0 .55 0'/></filter><rect width='100%' height='100%' filter='url(%23n)'/></svg>`
  return (
    <div
      aria-hidden="true"
      className="pointer-events-none fixed inset-0 z-[800] opacity-[0.07] mix-blend-overlay"
      style={{ backgroundImage: `url("data:image/svg+xml;utf8,${svg}")` }}
    />
  )
}
