import { useEffect } from 'react'
import Lenis from 'lenis'
import { gsap, ScrollTrigger } from '../animations/gsapSetup'
import { setLenis } from '../animations/lenisStore'

// One scroll system: Lenis drives ScrollTrigger through GSAP's ticker.
export function useLenis(reduced) {
  useEffect(() => {
    const lenis = new Lenis({
      // Drive Lenis from GSAP's ticker so scroll and ScrollTrigger stay on
      // the same frame. Lerp gives a more consistent feel than a fixed
      // duration when the wheel velocity changes.
      autoRaf: false,
      // A lower lerp produces a longer, softer glide instead of a sharp
      // catch-up when the wheel emits larger deltas.
      // Keep the same smoothing curve on touch devices as desktop so the
      // ScrollTrigger stack has identical timing and reverses naturally.
      lerp: reduced ? 1 : 0.055,
      smoothWheel: !reduced,
      wheelMultiplier: reduced ? 1 : 0.78,
      touchMultiplier: reduced ? 1 : 1.05,
      syncTouch: false,
      overscroll: true,
    })
    setLenis(lenis)
    lenis.on('scroll', ScrollTrigger.update)
    const tick = (t) => lenis.raf(t * 1000)
    gsap.ticker.add(tick)
    // Keep animation frames from jumping after a brief tab switch or
    // rendering hiccup while still allowing GSAP to recover normally.
    gsap.ticker.lagSmoothing(500, 33)
    lenis.stop() // released by the loader
    return () => {
      gsap.ticker.remove(tick)
      lenis.destroy()
      setLenis(null)
    }
  }, [reduced])
}
