// Module singleton so navigation / loader can control the one Lenis instance.
let instance = null
export const setLenis = (l) => { instance = l }
export const getLenis = () => instance

export const scrollToTarget = (target, opts = {}) => {
  if (instance) instance.scrollTo(target, { duration: 1.6, easing: (t) => 1 - Math.pow(1 - t, 4), ...opts })
  else {
    const el = typeof target === 'string' ? document.querySelector(target) : target
    el?.scrollIntoView?.({ behavior: 'smooth' })
  }
}
