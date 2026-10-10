import { useEffect, useRef, useState } from 'react'
import { gsap } from '../../animations/gsapSetup'
import { useHasFinePointer } from '../../hooks/useIsMobile'
import SkillGlyph from './SkillGlyph'
import DecryptedText from '../common/DecryptedText'
import siteConfig from '../../data/siteConfig'
import { useReducedMotion } from '../../hooks/useReducedMotion'

// Flat index across groups so the glyph / dimming logic is simple.
let counter = 0
const groups = siteConfig.skills.map((g) => ({ ...g, items: g.items.map((it) => ({ ...it, idx: counter++ })) }))
const flat = groups.flatMap((g) => g.items)

export default function SkillIndex({ onHover }) {
  const [hovered, setHovered] = useState(null)
  const [activeGroup, setActiveGroup] = useState(null)
  const glyph = useRef(null)
  const skillsIndex = useRef(null)
  const listRefs = useRef([])
  const fine = useHasFinePointer()
  const reduced = useReducedMotion()

  useEffect(() => {
    const closeActiveGroup = (event) => {
      if (!skillsIndex.current?.contains(event.target)) setActiveGroup(null)
    }
    document.addEventListener('pointerdown', closeActiveGroup)
    return () => document.removeEventListener('pointerdown', closeActiveGroup)
  }, [])

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

  const scrubGroup = (groupIndex, event) => {
    event.preventDefault()
    event.stopPropagation()
    setActiveGroup(groupIndex)
    const list = listRefs.current[groupIndex]
    const rail = event.currentTarget
    if (!list || !rail) return

    const updateScroll = (clientY) => {
      const bounds = rail.getBoundingClientRect()
      const progress = Math.max(0, Math.min(1, (clientY - bounds.top) / bounds.height))
      list.scrollTop = progress * (list.scrollHeight - list.clientHeight)
    }

    updateScroll(event.clientY)
    const move = (moveEvent) => updateScroll(moveEvent.clientY)
    const stop = () => {
      document.removeEventListener('pointermove', move)
      document.removeEventListener('pointerup', stop)
    }
    document.addEventListener('pointermove', move)
    document.addEventListener('pointerup', stop, { once: true })
  }

  const scrollListWithTrackpad = (event) => {
    const list = event.currentTarget
    const group = list.closest('.skills-group')
    const mobileInactive = window.matchMedia('(max-width: 767px)').matches && !group?.classList.contains('skills-group--scroll-active')
    if (mobileInactive) return
    if (list.scrollHeight <= list.clientHeight) return
    event.preventDefault()
    event.stopPropagation()
    list.scrollTop += event.deltaY
  }

  return (
    <div ref={skillsIndex} className="skills-index" onPointerLeave={() => set(null)}>
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
        <div
          key={g.group}
          onPointerDown={() => setActiveGroup(gi)}
          className={`skills-group skills-group--${gi} relative overflow-hidden rounded-[1.5rem] p-5 md:p-7 ${activeGroup === gi ? 'skills-group--scroll-active' : ''}`}
        >
          <div className="skills-group__header mb-6 flex items-center gap-3 font-mono text-[11px] uppercase tracking-[0.2em] text-muted">
            <span className="skills-group__letter text-accent">{String.fromCharCode(65 + gi)}</span>
            <span>{g.group}</span>
            <span className="skills-count ml-auto">{String(g.items.length).padStart(2, '0')} skills</span>
          </div>
          <div className="skills-group__watermark" aria-hidden="true">{String(gi + 1).padStart(2, '0')}</div>
          <div
            className="skills-group__scroll-rail"
            onPointerDown={(event) => scrubGroup(gi, event)}
          >
            <span />
          </div>
          <ul
            ref={(element) => { listRefs.current[gi] = element }}
            onWheel={scrollListWithTrackpad}
            className="skills-group__list"
          >
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
                  className={`skill-row flex flex-wrap items-center justify-between gap-x-4 transition-[opacity,transform] duration-700 ease-expo ${
                    dim ? 'opacity-20' : 'opacity-100'
                  } ${on ? 'skill-row--active md:translate-x-[3vw]' : ''}`}
                >
                  <span className="skill-row__number font-mono text-accent">{String(it.idx + 1).padStart(2, '0')}</span>
                  <DecryptedText
                    text={it.name}
                    animateOn="hover"
                    sequential
                    revealDirection="center"
                    speed={reduced ? 1 : 28}
                    maxIterations={reduced ? 1 : 5}
                    parentClassName="skill-name font-display font-black uppercase leading-[0.98] tracking-[-0.04em] wdth-cond [font-size:min(13vw,15vh)]"
                    encryptedClassName="text-accent"
                    className="text-paper"
                    useOriginalCharsOnly
                  />
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
