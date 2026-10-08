import { useRef } from 'react'
import { gsap } from '../../animations/gsapSetup'
import { useScrollAnimation } from '../../hooks/useScrollAnimation'

// D. Outlined typography that fills left→right as you scroll through it.
export default function FillText({ as: Tag = 'span', children, className = '', fillClass = '', start = 'top 85%', end = 'bottom 45%' }) {
  const root = useRef(null)
  useScrollAnimation(root, (_, el) => {
    const fill = el.querySelector('[data-fill]')
    gsap.fromTo(
      fill,
      { clipPath: 'inset(0 100% 0 0)' },
      { clipPath: 'inset(0 0% 0 0)', ease: 'none', scrollTrigger: { trigger: el, start, end, scrub: true } },
    )
  })
  return (
    <Tag ref={root} className={`relative block ${className}`}>
      <span className="sr-only">{children}</span>
      <span aria-hidden="true" className="text-outline block">{children}</span>
      <span aria-hidden="true" data-fill className={`absolute inset-0 block ${fillClass}`}>{children}</span>
    </Tag>
  )
}
