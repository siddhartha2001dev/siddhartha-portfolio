import { useEffect, useRef, useState } from 'react'
import { gsap } from '../../animations/gsapSetup'
import { useHasFinePointer } from '../../hooks/useIsMobile'
import SkillGlyph from './SkillGlyph'
import siteConfig from '../../data/siteConfig'

// Flat index across groups so the glyph / dimming logic is simple.
let counter = 0
const groups = siteConfig.skills.map((g) => ({ ...g, items: g.items.map((it) => ({ ...it, idx: counter++ })) }))
const flat = groups.flatMap((g) => g.items)

export default function SkillIndex({ onHover }) {
  const [hovered, setHovered] = useState(null)
  const glyph = useRef(null)
  const fine = useHasFinePointer()

  // Glyph trails the pointer with inertia.
  useEffect(() => {
    if (!fine) return
    const el = glyph.current
    gsap.set(el, { xPercent: -50, yPercent: -50 })
    const xTo = gsap.quickTo(el, 'x', { duration: 0.7, ease: 'power3.out' })
    const yTo = gsap.quickTo(el, 'y', { duration: 0.7, ease: 'power3.out' })
    const move = (e) => { xTo(e.clientX + 120); yTo(e.clientY - 20) }
    window.addEventListener('pointermove', move, { passive: true })
    return () => window.removeEventListener('pointermove', move)
  }, [fine])

  const set = (i) => {
    setHovered(i)
    onHover?.(i === null ? null : flat[i].name)
  }

  return (
    <div onPointerLeave={() => set(null)}>
      {fine && (
        <div
          ref={glyph}
          aria-hidden="true"
          className={`pointer-events-none fixed left-0 top-0 z-30 transition-[opacity,scale] duration-500 ease-expo ${hovered === null ? 'scale-75 opacity-0' : 'scale-100 opacity-100'}`}
        >
          <SkillGlyph variant={hovered ?? 0} />
        </div>
      )}

      {groups.map((g, gi) => (
        <div key={g.group} className="skills-group border-t border-white/15 py-8 md:py-10">
          <div className="skills-group__header mb-4 flex items-center gap-3 font-mono text-[11px] uppercase tracking-[0.2em] text-muted">
            <span className="text-accent">{String.fromCharCode(65 + gi)}</span>
            <span>{g.group}</span>
            <span className="skills-count ml-auto">{String(g.items.length).padStart(2, '0')} skills</span>
          </div>
          <ul>
            {g.items.map((it) => {
              const on = hovered === it.idx
              const dim = hovered !== null && !on
              return (
                <li
                  key={it.name}
                  tabIndex={0}
                  data-cursor="link"
                  onPointerEnter={() => set(it.idx)}
                  onFocus={() => set(it.idx)}
                  onBlur={() => set(null)}
                  className={`skill-row flex flex-wrap items-baseline justify-between gap-x-6 transition-[opacity,transform] duration-700 ease-expo ${
                    dim ? 'opacity-20' : 'opacity-100'
                  } ${on ? 'skill-row--active md:translate-x-[3vw]' : ''}`}
                >
                  <span className="skill-row__number font-mono text-accent">{String(it.idx + 1).padStart(2, '0')}</span>
                  <span className="skill-name font-display font-black uppercase leading-[0.98] tracking-[-0.04em] wdth-cond [font-size:min(13vw,15vh)]">
                    {it.name}
                  </span>
                  <span
                    className={`font-mono text-[11px] uppercase tracking-[0.18em] text-muted transition-opacity duration-500 md:text-xs ${
                      on ? 'md:opacity-100' : 'md:opacity-0'
                    } max-md:basis-full max-md:pb-3`}
                  >
                    {it.note}
                  </span>
                </li>
              )
            })}
          </ul>
        </div>
      ))}
    </div>
  )
}
