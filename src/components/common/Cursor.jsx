import { useEffect, useRef } from 'react'
import { gsap } from '../../animations/gsapSetup'
import { useHasFinePointer } from '../../hooks/useIsMobile'
import { useReducedMotion } from '../../hooks/useReducedMotion'

// Elements opt in with data-cursor="VIEW" (label) or data-cursor="link" (grow only).
export default function Cursor() {
  const ring = useRef(null)
  const trail = useRef(null)
  const label = useRef(null)
  const fine = useHasFinePointer()
  const reduced = useReducedMotion()

  useEffect(() => {
    if (!fine) return
    document.documentElement.classList.add('has-cursor')
    const el = ring.current
    const trailEl = trail.current
    gsap.set(el, { xPercent: -50, yPercent: -50, opacity: 0 })
    gsap.set(trailEl, { xPercent: -50, yPercent: -50, opacity: 0 })
    const xTo = gsap.quickTo(el, 'x', { duration: reduced ? 0.01 : 0.45, ease: 'power3.out' })
    const yTo = gsap.quickTo(el, 'y', { duration: reduced ? 0.01 : 0.45, ease: 'power3.out' })
    const trailXTo = gsap.quickTo(trailEl, 'x', { duration: reduced ? 0.01 : 0.8, ease: 'power3.out' })
    const trailYTo = gsap.quickTo(trailEl, 'y', { duration: reduced ? 0.01 : 0.8, ease: 'power3.out' })
    let shown = false

    const move = (e) => {
      if (!shown) {
        shown = true
        gsap.to(el, { opacity: 1, duration: 0.4 })
        gsap.to(trailEl, { opacity: 0.65, duration: 0.55 })
      }
      xTo(e.clientX)
      yTo(e.clientY)
      trailXTo(e.clientX)
      trailYTo(e.clientY)
    }
    const over = (e) => {
      const t = e.target.closest?.('[data-cursor]')
      const kind = t?.dataset.cursor
      if (!kind) return setState('idle')
      if (kind === 'link') return setState('link')
      label.current.textContent = kind
      setState('label')
    }
    const setState = (s) => {
      const size = s === 'label' ? 92 : s === 'link' ? 44 : 12
      gsap.to(el, {
        width: size,
        height: size,
        backgroundColor: s === 'label' ? '#ff4a1c' : s === 'link' ? 'rgba(255,255,255,1)' : 'rgba(255,255,255,1)',
        duration: 0.5,
        ease: 'expo.out',
        overwrite: 'auto',
      })
      el.style.mixBlendMode = s === 'label' ? 'normal' : 'difference'
      gsap.to(label.current, { opacity: s === 'label' ? 1 : 0, duration: 0.25 })
    }
    const leave = () => {
      gsap.to(el, { opacity: 0, duration: 0.3 })
      gsap.to(trailEl, { opacity: 0, duration: 0.3 })
    }
    const enter = () => {
      if (!shown) return
      gsap.to(el, { opacity: 1, duration: 0.3 })
      gsap.to(trailEl, { opacity: 0.65, duration: 0.3 })
    }

    window.addEventListener('pointermove', move, { passive: true })
    document.addEventListener('pointerover', over, { passive: true })
    document.documentElement.addEventListener('mouseleave', leave)
    document.documentElement.addEventListener('mouseenter', enter)
    return () => {
      document.documentElement.classList.remove('has-cursor')
      window.removeEventListener('pointermove', move)
      document.removeEventListener('pointerover', over)
      document.documentElement.removeEventListener('mouseleave', leave)
      document.documentElement.removeEventListener('mouseenter', enter)
    }
  }, [fine, reduced])

  if (!fine) return null
  return (
    <>
      <div
        ref={trail}
        aria-hidden="true"
        className="pointer-events-none fixed left-0 top-0 z-[998] h-9 w-9 rounded-full border border-accent/70 mix-blend-difference"
      >
        <span className="absolute -right-1 -top-1 h-1.5 w-1.5 rounded-full bg-accent" />
      </div>
      <div
        ref={ring}
        aria-hidden="true"
        className="pointer-events-none fixed left-0 top-0 z-[999] grid h-3 w-3 place-items-center rounded-full bg-white mix-blend-difference"
      >
        <span ref={label} className="font-mono text-[10px] font-medium uppercase tracking-[0.2em] text-ink opacity-0" />
      </div>
    </>
  )
}
