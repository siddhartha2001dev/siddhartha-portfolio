import { useEffect, useRef } from 'react'
import { gsap } from '../../animations/gsapSetup'

// D. Outlined typography that fills left→right as you scroll through it.
export default function FillText({ as: Tag = 'span', children, className = '', fillClass = '', start = 'top 85%', end = 'bottom 45%', scrub = true }) {
  const root = useRef(null)
  useEffect(() => {
    const el = root.current
    const fill = el?.querySelector('[data-fill]')
    if (!el || !fill) return undefined

    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    if (reduced) {
      gsap.set(fill, { clipPath: 'inset(0 0% 0 0)', webkitClipPath: 'inset(0 0% 0 0)' })
      return undefined
    }

    const tween = gsap.fromTo(
      fill,
      { clipPath: 'inset(0 100% 0 0)', webkitClipPath: 'inset(0 100% 0 0)' },
      {
        clipPath: 'inset(0 0% 0 0)',
        webkitClipPath: 'inset(0 0% 0 0)',
        ease: scrub ? 'none' : 'expo.out',
        duration: scrub ? undefined : 1.15,
        onComplete: scrub ? undefined : () => {
          gsap.set(fill, { clipPath: 'inset(0)', webkitClipPath: 'inset(0)' })
        },
        scrollTrigger: scrub
          ? { trigger: el, start, end, scrub: 0.35, invalidateOnRefresh: true }
          : { trigger: el, start, toggleActions: 'play none none reverse', invalidateOnRefresh: true },
      },
    )

    return () => {
      tween.scrollTrigger?.kill()
      tween.kill()
    }
  }, [start, end])
  return (
    <Tag ref={root} className={`relative block ${className}`}>
      <span className="sr-only">{children}</span>
      <span aria-hidden="true" className="text-outline block">{children}</span>
      <span aria-hidden="true" data-fill className={`absolute inset-0 block ${fillClass}`}>{children}</span>
    </Tag>
  )
}
