import { gsap } from './gsapSetup'
import { revealChars } from './textAnimations'

// Returns a PAUSED timeline; the hero plays it once the loader hands off.
export function heroIntro({ chars, meta, canvas }) {
  const tl = gsap.timeline({ paused: true, defaults: { ease: 'expo.out' } })
  tl.add(revealChars(chars, { stagger: 0.028, duration: 1.3 }), 0)
  if (canvas) tl.to(canvas, { opacity: 1, scale: 1, duration: 1.8 }, 0.35)
  if (meta?.length) tl.to(meta, { opacity: 1, y: 0, stagger: 0.08, duration: 0.9 }, 0.95)
  return tl
}
