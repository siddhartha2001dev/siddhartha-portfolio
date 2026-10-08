import { useEffect, useRef, useState } from 'react'
import { gsap } from '../../animations/gsapSetup'
import siteConfig from '../../data/siteConfig'

const LINKS = [
  { label: 'Projects', href: '/projects', section: 'work' },
  { label: 'About', href: '/about', section: 'about' },
  { label: 'Experience', href: '/experience', section: 'experience' },
  { label: 'Contact', href: '/contact', section: 'contact' },
  { label: 'Game', href: '/game', section: 'game' },
]

export default function Navigation({ visible }) {
  const [open, setOpen] = useState(false)
  const [onLight, setOnLight] = useState(false)
  const [nightMode, setNightMode] = useState(() => window.localStorage?.getItem('portfolio-theme') === 'night')
  const currentPath = window.location.pathname.replace(/\/+$/, '') || '/'
  const header = useRef(null)
  const overlay = useRef(null)

  useEffect(() => {
    if (nightMode) {
      document.documentElement.dataset.themeMode = 'night'
      window.localStorage?.setItem('portfolio-theme', 'night')
    } else {
      delete document.documentElement.dataset.themeMode
      window.localStorage?.setItem('portfolio-theme', 'day')
    }
  }, [nightMode])

  useEffect(() => {
    if (visible) gsap.fromTo(header.current, { yPercent: -100, opacity: 0 }, { yPercent: 0, opacity: 1, duration: 1.2, delay: 0.2 })
  }, [visible])

  // Update the header surface as sections pass beneath it. Navigation links
  // themselves stay fixed to the page that was opened.
  useEffect(() => {
    let raf = 0
    const sections = [...document.querySelectorAll('[data-theme]')]
    const update = () => {
      raf = 0
      // header colour follows whichever section sits under it (later sections stack on top)
      let theme = 'ink'
      for (const sec of sections) {
        const r = sec.getBoundingClientRect()
        if (r.top <= 36 && r.bottom > 36) theme = sec.dataset.theme
      }
      setOnLight(theme === 'paper')
    }
    const onScroll = () => { if (!raf) raf = requestAnimationFrame(update) }
    update()
    window.addEventListener('scroll', onScroll, { passive: true })
    window.addEventListener('resize', onScroll)
    return () => {
      cancelAnimationFrame(raf)
      window.removeEventListener('resize', onScroll)
      window.removeEventListener('scroll', onScroll)
    }
  }, [])

  // mobile menu: animate + lock scroll + Esc
  useEffect(() => {
    const el = overlay.current
    if (!el) return
    if (open) {
      gsap.to(el, { clipPath: 'inset(0 0 0% 0)', duration: 0.9, ease: 'expo.inOut', pointerEvents: 'auto' })
      gsap.fromTo(el.querySelectorAll('[data-item]'), { yPercent: 110 }, { yPercent: 0, stagger: 0.07, duration: 1, delay: 0.25 })
    } else {
      gsap.to(el, { clipPath: 'inset(0 0 100% 0)', duration: 0.7, ease: 'expo.inOut', pointerEvents: 'none' })
    }
    const key = (e) => e.key === 'Escape' && setOpen(false)
    window.addEventListener('keydown', key)
    return () => window.removeEventListener('keydown', key)
  }, [open])

  return (
    <>
      <header
        ref={header}
        className={`site-nav fixed inset-x-0 top-0 z-[700] opacity-0 transition-colors duration-500 ${
          open || onLight ? 'site-nav--light text-ink' : 'text-paper'
        }`}
      >
        <nav aria-label="Primary" className="bg-transparent flex items-center justify-between px-5 py-5 md:px-8">
          <a
            href="/"
            data-cursor="link"
            className="site-nav__brand font-display text-sm font-extrabold uppercase tracking-[0.18em]"
          >
            {siteConfig.name}<span className="text-accent">.</span>
          </a>

          <ul className="hidden items-center gap-9 md:flex">
            {LINKS.map((l) => (
              <li key={l.href}>
                <a
                  href={l.href}
                  data-cursor="link"
                  aria-current={currentPath === l.href ? 'true' : undefined}
                  className="group relative font-mono text-[11px] uppercase tracking-[0.2em]"
                >
                  {l.label}
                  <span
                    className={`absolute -bottom-1 left-0 h-px w-full origin-left bg-current transition-transform duration-500 ease-expo ${
                      currentPath === l.href ? 'scale-x-100' : 'scale-x-0 group-hover:scale-x-100'
                    }`}
                  />
                </a>
              </li>
            ))}
          </ul>

          <button
            type="button"
            data-cursor="link"
            className="hidden items-center gap-3 font-mono text-[11px] uppercase tracking-[0.2em] md:flex"
            aria-label={nightMode ? 'Switch to day mode' : 'Switch to night mode'}
            aria-pressed={nightMode}
            onClick={() => setNightMode((mode) => !mode)}
          >
            <span aria-hidden="true" className={`relative block h-6 w-11 rounded-full border border-current/50 p-0.5 transition-colors duration-500 ${nightMode ? 'bg-accent/20' : 'bg-current/10'}`}>
              <span className={`block h-4 w-4 rounded-full bg-accent shadow-[0_0_12px_rgba(255,74,28,0.45)] transition-transform duration-500 ease-expo ${nightMode ? 'translate-x-5' : 'translate-x-0'}`} />
            </span>
            {nightMode ? 'Day' : 'Night'}
          </button>

          <div className="flex items-center gap-4 md:hidden">
            <button
              type="button"
              data-cursor="link"
              className="grid h-10 w-14 place-items-center rounded-full border border-current/40 transition-colors duration-300 hover:border-accent"
              aria-label={nightMode ? 'Switch to day mode' : 'Switch to night mode'}
              aria-pressed={nightMode}
              onClick={() => setNightMode((mode) => !mode)}
            >
              <span aria-hidden="true" className={`relative block h-6 w-11 rounded-full p-0.5 transition-colors duration-500 ${nightMode ? 'bg-accent/20' : 'bg-current/10'}`}>
                <span className={`relative block h-5 w-5 rounded-full bg-accent shadow-[0_0_12px_rgba(255,74,28,0.45)] transition-transform duration-500 ease-expo ${nightMode ? 'translate-x-5' : 'translate-x-0'}`}>
                  <span className="absolute inset-0 grid place-items-center text-[11px] text-ink">{nightMode ? '☼' : '◐'}</span>
                </span>
              </span>
            </button>
            <button
              type="button"
              className="font-mono text-[11px] uppercase tracking-[0.2em]"
              aria-expanded={open}
              aria-controls="mobile-menu"
              onClick={() => setOpen((o) => !o)}
            >
              {open ? 'Close' : 'Menu'}
            </button>
          </div>
        </nav>
      </header>

      <div
        id="mobile-menu"
        ref={overlay}
        className="pointer-events-none fixed inset-0 z-[650] flex flex-col justify-end bg-accent p-5 text-ink md:hidden"
        style={{ clipPath: 'inset(0 0 100% 0)' }}
        aria-hidden={!open}
      >
        <ul className="mb-10 space-y-1">
          {LINKS.map((l, i) => (
            <li key={l.href} className="mask-line">
              <a
                data-item
                href={l.href}
                tabIndex={open ? 0 : -1}
                className="flex items-baseline gap-4 font-display text-[16vw] font-black uppercase leading-[0.95] tracking-[-0.04em] wdth-cond"
              >
                <span className="font-mono text-xs tracking-[0.2em]">{String(i + 1).padStart(2, '0')}</span>
                {l.label}
              </a>
            </li>
          ))}
        </ul>
        <div className="flex justify-between font-mono text-[11px] uppercase tracking-[0.2em]">
          <span>{siteConfig.location}</span>
          <a href={`mailto:${siteConfig.email}`}>Email</a>
        </div>
      </div>
    </>
  )
}
