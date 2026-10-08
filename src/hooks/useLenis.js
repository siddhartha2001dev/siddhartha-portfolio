import { useEffect } from 'react'
import Lenis from 'lenis'
import { gsap, ScrollTrigger } from '../animations/gsapSetup'
import { setLenis } from '../animations/lenisStore'

// One scroll system: Lenis drives ScrollTrigger through GSAP's ticker.
export function useLenis(reduced) {
  useEffect(() => {
    const lenis = new Lenis({
      duration: reduced ? 0.01 : 1.1,
      smoothWheel: !reduced,
      wheelMultiplier: 0.95,
      touchMultiplier: 1.4,
    })
    setLenis(lenis)
    lenis.on('scroll', ScrollTrigger.update)
    const tick = (t) => lenis.raf(t * 1000)
    gsap.ticker.add(tick)
    gsap.ticker.lagSmoothing(0)
    lenis.stop() // released by the loader
    return () => {
      gsap.ticker.remove(tick)
      lenis.destroy()
      setLenis(null)
    }
  }, [reduced])
}
