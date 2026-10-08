import { lazy, Suspense, useEffect, useRef } from 'react'
import { gsap } from '../animations/gsapSetup'
import { splitText } from '../animations/textAnimations'
import { heroIntro } from '../animations/heroAnimations'
import { sceneState } from '../animations/sceneState'
import { useScrollAnimation } from '../hooks/useScrollAnimation'
import siteConfig from '../data/siteConfig'
import DecryptedText from '../components/common/DecryptedText'

const Scene = lazy(() => import('../three/Scene'))

const LINE_STYLES = [
  'self-start [font-size:min(27vw,28vh)]',
  'self-end text-outline [font-size:min(27vw,28vh)]',
  'self-start [font-size:min(17vw,17vh)]',
]

export default function Hero({ ready }) {
  const root = useRef(null)
  const canvas = useRef(null)
  const intro = useRef(null)
  const readyRef = useRef(ready)
  readyRef.current = ready

  useScrollAnimation(root, ({ desktop }, el) => {
    const lines = [...el.querySelectorAll('[data-line]')]
    const meta = el.querySelectorAll('[data-meta]:not([data-logo-meta])')
    const splits = lines.map((l) => (l.dataset.decryptedLine ? null : splitText(l, 'chars')))

    if (!readyRef.current) {
      const chars = splits.filter(Boolean).flatMap((s) => s.chars)
      gsap.set(chars, { yPercent: 110 })
      gsap.set(meta, { opacity: 0, y: 12 })
      gsap.set(canvas.current, { opacity: 0, scale: 1.12 })
      intro.current = heroIntro({ chars, meta, canvas: canvas.current })
    }

    // The hero stays pinned while About slides over it; type drifts at different speeds.
    const speeds = desktop ? [-34, -52, -70] : [-14, -24, -34]
    const drift = desktop ? [-6, 7, -4] : [-3, 3, -2]
    const tl = gsap.timeline({
      defaults: { ease: 'none' },
      scrollTrigger: {
        trigger: el,
        start: 'top top',
        end: 'bottom top',
        scrub: 0.6,
        pin: true,
        pinSpacing: false,
        onUpdate: (self) => { sceneState.scroll = self.progress },
      },
    })
    lines.forEach((l, i) => tl.to(l, { y: `${speeds[i]}vh`, x: `${drift[i]}vw` }, 0))
    // fromTo + immediateRender:false so the scrub never fights the intro timeline
    tl.fromTo(meta, { opacity: 1, y: 0 }, { opacity: 0, y: -20, stagger: 0.02, immediateRender: false }, 0)
    tl.to(el.querySelector('[data-canvas-scale]'), { scale: 1.18 }, 0)

    return () => {
      splits.filter(Boolean).forEach((s) => s.revert())
      intro.current?.kill()
      intro.current = null
      sceneState.scroll = 0
    }
  })

  useEffect(() => {
    if (ready) intro.current?.play()
  }, [ready])

  // Feed normalized pointer coordinates to the 3D scene for a restrained cursor parallax.
  useEffect(() => {
    if (!window.matchMedia('(pointer: fine)').matches) return undefined
    const move = (event) => {
      sceneState.mouseX = (event.clientX / window.innerWidth) * 2 - 1
      sceneState.mouseY = -((event.clientY / window.innerHeight) * 2 - 1)
    }
    const reset = () => {
      sceneState.mouseX = 0
      sceneState.mouseY = 0
    }
    window.addEventListener('pointermove', move, { passive: true })
    window.addEventListener('blur', reset)
    return () => {
      window.removeEventListener('pointermove', move)
      window.removeEventListener('blur', reset)
      reset()
    }
  }, [])

  return (
    <section
      id="top"
      ref={root}
      data-theme="ink"
      className="relative z-0 h-[100svh] min-h-[560px] w-full overflow-hidden bg-ink text-paper"
    >
      <div ref={canvas} className="absolute inset-0 z-0">
        <div data-canvas-scale className="absolute inset-0">
          <Suspense fallback={null}>
            <Scene />
          </Suspense>
        </div>
      </div>

      <div className="pointer-events-none relative z-10 flex h-full flex-col justify-between px-5 pb-6 pt-20 md:px-8 md:pb-8">
        <div data-meta className="flex items-start justify-between font-mono text-[10px] uppercase tracking-[0.2em] text-muted md:text-[11px]">
          <span>Portfolio<br />Vol. {new Date().getFullYear()}</span>
          <span className="text-right">{siteConfig.coordinates.split(', ')[0]}<br />{siteConfig.coordinates.split(', ')[1]}</span>
        </div>

        <h1 aria-label={siteConfig.heroLines.join(' ')} className="pointer-events-none flex flex-col font-display font-black uppercase leading-[0.8] tracking-[-0.05em] wdth-cond">
          {siteConfig.heroLines.map((line, i) => (
            <span
              key={line}
              aria-hidden="true"
              data-line={line}
              data-hindi={line === 'STACK' ? 'स्टैक' : undefined}
              data-decrypted-line={line === 'STACK' || line === 'DEVELOPER' ? 'true' : undefined}
              className={`block ${LINE_STYLES[i]} ${line === 'STACK' ? 'stack-word' : ''}`}
            >
              {line === 'STACK' ? (
                <>
                  <span className="stack-english">STACK</span>
                  <span className="stack-hindi">स्टैक</span>
                  <span className="stack-bangla">স্ট্যাক</span>
                </>
              ) : line === 'DEVELOPER' ? (
                <DecryptedText
                  text={line}
                  speed={46}
                  maxIterations={12}
                  sequential
                  revealDirection="center"
                  useOriginalCharsOnly
                  animateOn="always"
                  glitch
                  className="text-paper"
                  encryptedClassName="text-accent"
                />
              ) : line}
              </span>
          ))}
        </h1>

        <div className="grid grid-cols-2 items-end gap-4 font-mono text-[10px] uppercase tracking-[0.2em] md:grid-cols-12 md:text-[11px]">
          <p data-meta className="text-muted md:col-span-4 md:col-start-8">
            {siteConfig.location}
            <br />
            {siteConfig.status}
          </p>
          <p data-meta className="flex items-center justify-end gap-3 md:col-span-1 md:col-start-12">
            Scroll
            <span className="relative block h-8 w-px overflow-hidden bg-white/20">
              <span className="absolute inset-x-0 top-0 h-3 animate-[scrollcue_1.8s_ease-in-out_infinite] bg-accent motion-reduce:animate-none" />
            </span>
          </p>
        </div>
      </div>
    </section>
  )
}
