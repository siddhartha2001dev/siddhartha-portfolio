import { useRef } from 'react'
import { gsap } from '../../animations/gsapSetup'
import { splitText, revealWords } from '../../animations/textAnimations'
import { useScrollAnimation } from '../../hooks/useScrollAnimation'
import { useHasFinePointer } from '../../hooks/useIsMobile'
import ProjectMedia from './ProjectMedia'

export default function ProjectFrame({ project, index, total }) {
  const root = useRef(null)
  const disp = useRef(null)
  const fine = useHasFinePointer()
  const flip = index % 2 === 1
  const fid = `distort-${project.id}`
  const num = String(index + 1).padStart(2, '0')

  useScrollAnimation(root, ({ desktop }, el) => {
    const cleanups = []
    const frame = el.querySelector('[data-frame]')
    const media = el.querySelector('[data-media]')
    const slide = el.querySelector('[data-slide]')
    const title = el.querySelector('[data-title]')
    const meta = el.querySelectorAll('[data-meta] > *')
    const tech = el.querySelectorAll('[data-tech] > li')

    // Frame opens (clip-path) as it enters; next project arrives from the opposite side.
    gsap.fromTo(frame, { clipPath: 'inset(100% 0 0 0)' }, { clipPath: 'inset(0% 0 0 0)', duration: 1.7, ease: 'expo.inOut', scrollTrigger: { trigger: el, start: 'top 70%' } })
    gsap.fromTo(media, { scale: 1.4 }, { scale: 1, ease: 'none', scrollTrigger: { trigger: el, start: 'top bottom', end: 'bottom top', scrub: true } })
    if (desktop) {
      gsap.fromTo(slide, { x: flip ? '9vw' : '-9vw' }, { x: 0, ease: 'none', scrollTrigger: { trigger: el, start: 'top bottom', end: 'top 25%', scrub: true } })
    }

    // Title: words rise out of masks, then drift at different speeds (split-text parallax).
    const t = splitText(title, 'words')
    cleanups.push(() => t.revert())
    gsap.set(t.words, { yPercent: 110 })
    revealWords(t.words, { stagger: 0.12, scrollTrigger: { trigger: el, start: 'top 60%' } })
    if (desktop) {
      t.words.forEach((w, i) =>
        gsap.fromTo(w.parentElement, { y: 40 * (i + 1) }, { y: -40 * (i + 1), ease: 'none', scrollTrigger: { trigger: el, start: 'top bottom', end: 'bottom top', scrub: 0.5 } }),
      )
      gsap.fromTo(title, { x: flip ? '-5vw' : '5vw' }, { x: flip ? '3vw' : '-3vw', ease: 'none', scrollTrigger: { trigger: el, start: 'top bottom', end: 'bottom top', scrub: true } })
    }

    gsap.from(meta, { opacity: 0, y: 24, stagger: 0.09, duration: 1, ease: 'power3.out', scrollTrigger: { trigger: el, start: 'top 60%' } })
    gsap.from(tech, { opacity: 0, y: 12, stagger: 0.05, duration: 0.65, ease: 'power3.out', scrollTrigger: { trigger: el, start: 'top 55%' } })
    return () => cleanups.forEach((c) => c())
  })

  // Hover: subtle displacement ripple, scale, title nudge. Fine pointers only.
  const enter = () => {
    if (!fine) return
    const el = root.current
    const media = el.querySelector('[data-media]')
    media.style.filter = `url(#${fid})`
    gsap.timeline({ onComplete: () => { media.style.filter = '' } })
      .to(disp.current, { attr: { scale: 46 }, duration: 0.45, ease: 'power2.out' })
      .to(disp.current, { attr: { scale: 0 }, duration: 1, ease: 'power3.out' })
    gsap.to(el.querySelector('[data-hover-scale]'), { scale: 1.04, duration: 1.2, ease: 'expo.out', overwrite: 'auto' })
    gsap.to(el.querySelector('[data-title-wrap]'), { x: flip ? 18 : -18, duration: 0.9, ease: 'expo.out', overwrite: 'auto' })
    gsap.to(el.querySelectorAll('[data-tech] > li'), { x: 6, stagger: 0.03, duration: 0.6, overwrite: 'auto' })
  }
  const leave = () => {
    if (!fine) return
    const el = root.current
    gsap.to(el.querySelector('[data-hover-scale]'), { scale: 1, duration: 1.2, ease: 'expo.out', overwrite: 'auto' })
    gsap.to(el.querySelector('[data-title-wrap]'), { x: 0, duration: 0.9, ease: 'expo.out', overwrite: 'auto' })
    gsap.to(el.querySelectorAll('[data-tech] > li'), { x: 0, stagger: 0.03, duration: 0.6, overwrite: 'auto' })
  }

  return (
    <article ref={root} className="relative px-5 py-[9vh] md:px-8 md:py-[13vh]" aria-labelledby={`project-${project.id}`}>
      <svg width="0" height="0" className="absolute" aria-hidden="true" focusable="false">
        <filter id={fid} x="-5%" y="-5%" width="110%" height="110%">
          <feTurbulence type="fractalNoise" baseFrequency="0.006 0.02" numOctaves="1" seed={project.id} result="n" />
          <feDisplacementMap ref={disp} in="SourceGraphic" in2="n" scale="0" xChannelSelector="R" yChannelSelector="G" />
        </filter>
      </svg>

      <div className="relative grid gap-6 md:grid-cols-12 md:gap-8">
        <div data-slide className={`relative md:col-span-8 ${flip ? 'md:col-start-5' : 'md:col-start-1'}`}>
          <a
            href={project.link}
            target={project.link.startsWith('http') ? '_blank' : undefined}
            rel="noreferrer"
            data-cursor="VIEW"
            onMouseEnter={enter}
            onMouseLeave={leave}
            aria-label={`Open project: ${project.title}`}
            className="block"
          >
            <div data-frame className="project-frame relative aspect-[4/5] w-full overflow-hidden bg-white/5 sm:aspect-[4/3]">
              <div data-hover-scale className="h-full w-full">
                <div data-media className="h-full w-full will-change-transform">
                  <ProjectMedia project={project} index={index} total={total} />
                </div>
              </div>
              <div className="project-frame__veil absolute inset-0 flex items-end justify-between p-5 font-mono text-[10px] uppercase tracking-[0.18em] text-white sm:p-7">
                <span>View case study</span>
                <span className="grid h-9 w-9 place-items-center rounded-full border border-white/60 text-base transition-transform duration-500">↗</span>
              </div>
            </div>
          </a>
        </div>

        <div
          data-meta
          className={`flex flex-col gap-5 font-mono text-[11px] uppercase tracking-[0.16em] md:col-span-3 md:row-start-1 md:self-start ${
            flip ? 'md:col-start-1' : 'md:col-start-10'
          }`}
        >
          <p className="project-meta__index flex items-baseline gap-3">
            <span className="text-accent">{num}</span>
            <span className="text-muted">/ {String(total).padStart(2, '0')}</span>
            <span className="ml-auto text-paper">{project.year}</span>
          </p>
          <p className="project-meta__category text-muted">{project.category}</p>
          <p className="project-meta__description max-w-[34ch] font-display text-[15px] font-normal normal-case leading-relaxed tracking-normal text-paper/85">
            {project.description}
          </p>
          <ul data-tech className="flex flex-wrap gap-2 text-paper/70">
            {project.technologies.map((t) => (
              <li key={t} className="project-tech-pill rounded-full border border-current/25 px-2.5 py-1 text-[9px] tracking-[0.12em] transition-colors duration-300">{t}</li>
            ))}
          </ul>
        </div>

        <div
          data-title-wrap
          className={`pointer-events-none relative z-20 md:absolute md:bottom-[-6vh] md:max-w-[70%] ${flip ? 'md:left-0' : 'md:right-0 md:text-right'}`}
        >
          <h3
            id={`project-${project.id}`}
            data-title
            className="font-display font-black uppercase leading-[0.84] tracking-[-0.05em] wdth-cond [font-size:min(19vw,22vh)] md:[font-size:min(11vw,22vh)]"
          >
            {project.title}
          </h3>
        </div>
      </div>
    </article>
  )
}
