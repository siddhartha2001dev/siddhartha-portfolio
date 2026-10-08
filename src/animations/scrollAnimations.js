import { gsap } from './gsapSetup'

// Section theme: background/text swap driven by scroll position.
export function themeTrigger(el, theme, onChange) {
  return {
    trigger: el,
    start: 'top 55%',
    end: 'bottom 55%',
    onEnter: () => onChange(theme),
    onEnterBack: () => onChange(theme),
  }
}

export const parallax = (el, amount = 80, trigger = el, extra = {}) =>
  gsap.fromTo(
    el,
    { y: -amount },
    { y: amount, ease: 'none', scrollTrigger: { trigger, start: 'top bottom', end: 'bottom top', scrub: true, ...extra } },
  )
