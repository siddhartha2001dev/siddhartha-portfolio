import { useEffect, useRef, useState } from 'react'
import { gsap, ScrollTrigger } from '../animations/gsapSetup'
import { useScrollAnimation } from '../hooks/useScrollAnimation'
import { useReducedMotion } from '../hooks/useReducedMotion'
import SectionLabel from '../components/common/SectionLabel'
import siteConfig from '../data/siteConfig'

const items = siteConfig.experience
const N = items.length

// Masked glyph/word row used for the swap animation
const Masked = ({ children, attr, className = '' }) => (
  <span className={`inline-block overflow-hidden align-top ${className}`}>
    <span {...{ [attr]: true }} className="inline-block will-change-transform">{children}</span>
  </span>
)

function StaticList() {
  return (
    <ol className="space-y-12">
      {items.map((it) => (
        <li key={`${it.year}-${it.title}`} className="grid gap-3 border-t border-ink/30 pt-6 md:grid-cols-12">
          <p className="font-display text-6xl font-black leading-none tracking-[-0.04em] wdth-cond md:col-span-3">{it.year}</p>
          <div className="md:col-span-8 md:col-start-5">
            <h3 className="font-display text-3xl font-black uppercase tracking-[-0.03em] wdth-cond">{it.title}</h3>
            <p className="mt-1 font-mono text-[11px] uppercase tracking-[0.18em] text-ink/60">{it.subtitle}</p>
            <p className="mt-3 max-w-prose">{it.summary}</p>
          </div>
        </li>
      ))}
    </ol>
  )
}

export default function Experience() {
  const root = useRef(null)
  const bar = useRef(null)
  const activeRef = useRef(0)
  const firstRun = useRef(true)
  const [active, setActive] = useState(0)
  const reduced = useReducedMotion()

  // Pin the section; scroll progress selects the active role.
  useScrollAnimation(root, (_, el) => {
    const st = ScrollTrigger.create({
      trigger: el,
      start: 'top top',
      end: `+=${N * 70}%`,
      pin: true,
      onUpdate: (self) => {
        if (bar.current) bar.current.style.transform = `scaleX(${self.progress})`
        const i = Math.min(N - 1, Math.floor(self.progress * N))
        if (i !== activeRef.current) {
          activeRef.current = i
          setActive(i)
        }
      },
    })
    return () => {
      st.kill()
      activeRef.current = 0
      setActive(0)
    }
  })

  // Swap animation: digits and title words rise out of their masks.
  useEffect(() => {
    if (reduced) return
    if (firstRun.current) {
      firstRun.current = false
      return
    }
    const ctx = gsap.context(() => {
      gsap.fromTo('[data-digit]', { yPercent: 105 }, { yPercent: 0, stagger: 0.07, duration: 1.1 })
      gsap.fromTo('[data-word]', { yPercent: 105 }, { yPercent: 0, stagger: 0.08, duration: 1.1, delay: 0.1 })
      gsap.fromTo('[data-swap]', { opacity: 0, y: 14 }, { opacity: 1, y: 0, stagger: 0.08, duration: 0.9, delay: 0.25 })
    }, root)
    return () => ctx.revert()
  }, [active, reduced])

  const cur = items[active]

  if (reduced) {
    return (
      <section id="experience" ref={root} data-theme="paper" className="relative z-10 bg-paper px-5 py-[16vh] text-ink md:px-8">
          <SectionLabel index={3} title="Experience" meta="2023 — now" className="mb-12" />
        <StaticList />
      </section>
    )
  }

  return (
    <section id="experience" ref={root} data-theme="paper" className="relative z-10 min-h-[100svh] bg-paper text-ink">
      <div className="flex min-h-[100svh] flex-col justify-between px-5 pb-6 pt-24 md:px-8 md:pb-8 md:pt-28">
        <div className="flex items-center justify-between">
          <SectionLabel index={3} title="Experience" meta="2023 — now" />
          <p className="font-mono text-[11px] uppercase tracking-[0.2em]" aria-hidden="true">
            <span className="text-accent">{String(active + 1).padStart(2, '0')}</span>
            <span className="text-ink/40"> / {String(N).padStart(2, '0')}</span>
          </p>
        </div>

        <div className="grid items-end gap-8 md:grid-cols-12">
          <div className="md:col-span-8" aria-live="polite">
            <p className="font-display font-black leading-[0.8] tracking-[-0.06em] wdth-cond [font-size:min(34vw,36vh)] [font-variant-numeric:tabular-nums]">
              {cur.year.split('').map((d, i) => (
                <Masked key={`${active}-${i}`} attr="data-digit">{d}</Masked>
              ))}
            </p>
            <p className="mt-3 font-display font-black uppercase leading-[0.9] tracking-[-0.04em] wdth-cond [font-size:min(12vw,14vh)]">
              {cur.title.split(' ').map((w, i) => (
                <span key={`${active}-${i}`}>
                  <Masked attr="data-word">{w}</Masked>{' '}
                </span>
              ))}
            </p>
          </div>

          <div className="md:col-span-4">
            <ol className="mb-8 hidden md:block" aria-label="Timeline">
              {items.map((it, i) => (
                <li
                  key={`${it.year}-${it.title}`}
                  aria-current={i === active ? 'step' : undefined}
                  className={`flex items-center gap-3 border-t border-ink/20 py-2 font-mono text-[11px] uppercase tracking-[0.18em] transition-opacity duration-500 ${
                    i === active ? 'opacity-100' : 'opacity-35'
                  }`}
                >
                  <span className={`h-1.5 w-1.5 rounded-full transition-colors duration-500 ${i === active ? 'bg-accent' : 'bg-transparent'}`} />
                  <span>{it.year}</span>
                  <span className="ml-auto">{it.title}</span>
                </li>
              ))}
            </ol>
            <p data-swap className="font-mono text-[11px] uppercase tracking-[0.2em] text-ink/60">{cur.subtitle}</p>
            <p data-swap className="mt-3 max-w-[44ch] text-base leading-relaxed md:text-lg">{cur.summary}</p>
            <ul data-swap className="mt-4 flex flex-wrap gap-2 font-mono text-[10px] uppercase tracking-[0.16em]">
              {cur.tags.map((t) => (
                <li key={t} className="border border-ink/40 px-2 py-1">{t}</li>
              ))}
            </ul>
          </div>
        </div>

        <div className="h-px w-full bg-ink/15" aria-hidden="true">
          <div ref={bar} className="h-px origin-left bg-accent" style={{ transform: 'scaleX(0)' }} />
        </div>
      </div>
    </section>
  )
}
