import { useEffect, useRef } from 'react'
import { gsap } from '../../animations/gsapSetup'
import siteConfig from '../../data/siteConfig'

// Short, honest loader: waits for fonts, floors at ~1.3s, then wipes up into the hero.
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
        duration: 1.3,
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
      Promise.race([fontsReady, new Promise((r) => setTimeout(r, 1500))]).then(() => tl.play())
    }, root)
    return () => ctx.revert()
  }, [onReveal, onComplete])

  return (
    <div
      ref={root}
      role="status"
      aria-label="Loading"
      className="fixed inset-0 z-[900] flex flex-col justify-between bg-ink p-5 text-paper md:p-8"
      style={{ clipPath: 'inset(0 0 0% 0)' }}
    >
      <div className="flex justify-between font-mono text-[11px] uppercase tracking-[0.2em] text-muted">
        <span>{siteConfig.role}</span>
        <span>{siteConfig.coordinates}</span>
      </div>
      <div className="mask-line">
        <h1
          ref={name}
          className="font-display text-[clamp(3.5rem,17vw,16rem)] font-black uppercase leading-[0.85] tracking-[-0.04em] wdth-cond"
        >
          {siteConfig.fullName}
        </h1>
      </div>
      <div>
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
