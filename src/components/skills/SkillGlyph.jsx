// Small procedural marks (no assets). Variant chosen by index; stroke is the single accent.
export default function SkillGlyph({ variant = 0 }) {
  const common = { fill: 'none', stroke: '#ff4a1c', strokeWidth: 1 }
  return (
    <svg viewBox="0 0 120 120" width="140" height="140" aria-hidden="true">
      {variant % 4 === 0 &&
        [0, 1, 2, 3, 4].map((i) => (
          <rect key={i} x={10 + i * 10} y={10 + i * 10} width={100 - i * 20} height={100 - i * 20} transform={`rotate(${i * 9} 60 60)`} {...common} />
        ))}
      {variant % 4 === 1 &&
        Array.from({ length: 25 }).map((_, i) => (
          <circle key={i} cx={20 + (i % 5) * 20} cy={20 + Math.floor(i / 5) * 20} r={(i % 5 === Math.floor(i / 5)) ? 5 : 2} fill="#ff4a1c" />
        ))}
      {variant % 4 === 2 &&
        Array.from({ length: 12 }).map((_, i) => <line key={i} x1={i * 10} y1={120} x2={i * 10 + 40} y2={0} {...common} />)}
      {variant % 4 === 3 && (
        <>
          <circle cx="60" cy="60" r="44" {...common} />
          <circle cx="60" cy="60" r="22" {...common} />
          <line x1="8" y1="60" x2="112" y2="60" {...common} />
          <line x1="60" y1="8" x2="60" y2="112" {...common} />
        </>
      )}
    </svg>
  )
}
