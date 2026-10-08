import { useLayoutEffect } from 'react'
import { gsap } from '../animations/gsapSetup'

// Scoped, responsive, reduced-motion-aware animation setup.
// setup({ desktop }, scopeEl) may return a cleanup function (e.g. splitText reverts).
// Under prefers-reduced-motion the setup never runs, so content stays in its final, readable state.
export function useScrollAnimation(scopeRef, setup, deps = []) {
  useLayoutEffect(() => {
    const el = scopeRef.current
    if (!el) return
    const mm = gsap.matchMedia(el)
    mm.add(
      { motion: '(prefers-reduced-motion: no-preference)', desktop: '(min-width: 1024px)' },
      (ctx) => {
        const { motion, desktop } = ctx.conditions
        if (!motion) return
        return setup({ desktop }, el)
      },
    )
    return () => mm.revert()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps)
}
