import { useEffect, useRef } from 'react'
import { gsap } from '../../animations/gsapSetup'
import siteConfig from '../../data/siteConfig'

// Loader holds long enough for the type and cyber-art layers to register before
// the screen wipes into the hero.
export default function Loader({ onReveal, onComplete }) {
  const root = useRef(null)
  const num = useRef(null)
  const bar = useRef(null)
  const name = useRef(null)

  useEffect(() => {
    const counter = { v: 0 }
    const ctx = gsap.context(() => {
      gsap.fromTo(name.current, { yPercent: 105 }, { yPercent: 0, duration: 1, ease: 'expo.out' })
      const tl = gsap.timeline({ paused: true })
      tl.to(counter, {
        v: 100,
        duration: 1.8,
        ease: 'power2.inOut',
        onUpdate: () => {
          const n = Math.round(counter.v)
          if (num.current) num.current.textContent = String(n).padStart(3, '0')
          if (bar.current) bar.current.style.transform = `scaleX(${n / 100})`
        },
      })
      tl.to(name.current, { yPercent: -105, duration: 0.7, ease: 'expo.in' }, '+=0.05')
      tl.to(root.current, { clipPath: 'inset(0 0 100% 0)', duration: 1, ease: 'expo.inOut' }, '-=0.35')
      tl.call(() => onReveal?.(), null, '-=0.6')
      tl.call(() => onComplete?.())
      const fontsReady = document.fonts?.ready ?? Promise.resolve()
      Promise.race([fontsReady, new Promise((r) => setTimeout(r, 1900))]).then(() => tl.play())
    }, root)
    return () => ctx.revert()
  }, [onReveal, onComplete])

  return (
    <div
      ref={root}
      role="status"
      aria-label="Loading"
      className="loader-screen fixed inset-0 z-[900] flex flex-col justify-between overflow-hidden bg-ink p-5 text-paper md:p-8"
      style={{ clipPath: 'inset(0 0 0% 0)' }}
    >
      <div className="loader-screen__art" aria-hidden="true">
        <span className="loader-screen__flash loader-screen__flash--one">SIGNAL / 001</span>
        <span className="loader-screen__flash loader-screen__flash--two">CYBER<br />FORM</span>
        <span className="loader-screen__flash loader-screen__flash--three">///</span>
        <span className="loader-screen__flash loader-screen__flash--four">NO<br />SIGNAL</span>
        <span className="loader-screen__flash loader-screen__flash--five">0101 1100<br />0010 0111</span>
        <span className="loader-screen__graffiti loader-screen__graffiti--one">404</span>
        <span className="loader-screen__graffiti loader-screen__graffiti--two">CTRL<br />SHIFT</span>
        <span className="loader-screen__graffiti loader-screen__graffiti--three">↯</span>
        <span className="loader-screen__grid" />
        <span className="loader-screen__scanline" />
      </div>
      <div className="relative z-10 flex justify-between font-mono text-[11px] uppercase tracking-[0.2em] text-muted">
        <span>{siteConfig.role}</span>
        <span>{siteConfig.coordinates}</span>
      </div>
      <div className="mask-line relative z-10">
        <h1
          ref={name}
          className="font-display text-[clamp(3.5rem,17vw,16rem)] font-black uppercase leading-[0.85] tracking-[-0.04em] wdth-cond"
        >
          {siteConfig.fullName}
        </h1>
      </div>
      <div className="relative z-10">
        <div className="mb-3 flex items-end justify-between font-mono text-[11px] uppercase tracking-[0.2em]">
          <span className="text-muted">Loading portfolio</span>
          <span ref={num} className="text-accent">000</span>
        </div>
        <div className="h-px w-full bg-white/15">
          <div ref={bar} className="h-px origin-left bg-accent" style={{ transform: 'scaleX(0)' }} />
        </div>
      </div>
    </div>
  )
}
