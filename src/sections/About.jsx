import { useRef } from 'react'
import { gsap } from '../animations/gsapSetup'
import { splitText, revealWords, scrollFillWords } from '../animations/textAnimations'
import { useScrollAnimation } from '../hooks/useScrollAnimation'
import SectionLabel from '../components/common/SectionLabel'
import siteConfig from '../data/siteConfig'
import homeProfilePic from '../../assets/profilepic.jpg'
import aboutProfilePic from '../../assets/IMG_4754.JPG'

const { about } = siteConfig

const LINE_LAYOUT = [
  '',
  'md:ml-[6vw]',
  'md:ml-[2vw]',
  'md:ml-[14vw] font-serif font-normal normal-case italic tracking-[-0.03em] text-accent',
]

export default function About({ standalone = false }) {
  const root = useRef(null)
  const profilePic = standalone ? aboutProfilePic : homeProfilePic

  useScrollAnimation(root, ({ desktop }, el) => {
    const cleanups = []

    // C. Statement fills from muted to full contrast as you read it.
    const lines = [...el.querySelectorAll('[data-statement] [data-line]')]
    const splits = lines.map((l) => splitText(l, 'words'))
    cleanups.push(() => splits.forEach((s) => s.revert()))
    scrollFillWords(splits.flatMap((s) => s.words), el.querySelector('[data-statement]'), { start: 'top 80%', end: 'bottom 55%' })

    // E. Last line drifts independently.
    if (desktop) {
      gsap.fromTo(lines[3], { x: '-6vw' }, { x: '4vw', ease: 'none', scrollTrigger: { trigger: lines[3], start: 'top bottom', end: 'bottom top', scrub: true } })
    }

    // Hairlines draw, facts step in.
    el.querySelectorAll('[data-rule]').forEach((r) =>
      gsap.fromTo(r, { scaleX: 0 }, { scaleX: 1, duration: 1.4, transformOrigin: 'left', scrollTrigger: { trigger: r, start: 'top 90%' } }),
    )
    gsap.from(el.querySelectorAll('[data-fact]'), {
      opacity: 0, y: 18, stagger: 0.1, duration: 1,
      scrollTrigger: { trigger: el.querySelector('[data-facts]'), start: 'top 80%' },
    })

    // B. Lead paragraph: words rise out of masks (only here, not every paragraph).
    const lead = splitText(el.querySelector('[data-lead]'), 'words')
    cleanups.push(() => lead.revert())
    gsap.set(lead.words, { yPercent: 110 })
    revealWords(lead.words, { stagger: 0.02, duration: 1.1, scrollTrigger: { trigger: el.querySelector('[data-lead]'), start: 'top 85%' } })

    return () => cleanups.forEach((c) => c())
  })

  return (
    <section id="about" ref={root} data-theme="paper" className="relative z-20 bg-paper text-ink">
      <div className="px-5 pb-[14vh] pt-[18vh] md:px-8 md:pt-[22vh]">
        <SectionLabel index={1} title="About" meta={siteConfig.location} className="mb-10 md:mb-16" />

        <h2
          data-statement
          aria-label={about.statement.join(' ')}
          className="font-display font-black uppercase leading-[0.86] tracking-[-0.045em] wdth-cond [font-size:min(12.3vw,21vh)]"
        >
          {about.statement.map((line, i) => (
            <span key={line} aria-hidden="true" data-line className={`block ${LINE_LAYOUT[i]}`}>
              {line}
            </span>
          ))}
        </h2>

        <div className="about-portrait mt-[12vh] grid gap-8 md:grid-cols-12 md:items-end">
          <figure className="relative md:col-span-5 md:col-start-2">
            <div className="relative aspect-[4/5] overflow-hidden border border-ink bg-ink p-2">
              <div className="relative h-full overflow-hidden bg-[#b8b1a5]">
                <img
                  src={profilePic}
                  alt="Portrait of Siddhartha Banerjee"
                  className="h-full w-full object-cover transition-transform duration-1000 ease-expo hover:scale-105"
                />
                <span aria-hidden="true" className="absolute inset-x-0 bottom-0 h-1/3 bg-gradient-to-t from-ink/35 to-transparent" />
              </div>
              <span aria-hidden="true" className="absolute -right-2 -top-2 h-5 w-5 border-r-2 border-t-2 border-accent" />
              <span aria-hidden="true" className="absolute -bottom-2 -left-2 h-5 w-5 border-b-2 border-l-2 border-accent" />
            </div>
            <figcaption className="mt-3 flex justify-between font-mono text-[10px] uppercase tracking-[0.18em] text-ink/50">
              <span>01 / Portrait</span>
              <span>Kolkata, IN</span>
            </figcaption>
          </figure>
          <p className="max-w-[28ch] font-serif text-2xl italic leading-tight text-ink/70 md:col-span-4 md:col-start-8 md:pb-8 md:text-3xl">
            The person behind the pixels, products and purposeful motion.
          </p>
        </div>

        <div className="mt-[14vh] grid gap-12 md:grid-cols-12 md:gap-8">
          <dl data-facts className="md:col-span-4">
            {about.facts.map((f) => (
              <div key={f.label} data-fact className="relative py-4">
                <span data-rule className="absolute inset-x-0 top-0 h-px bg-ink/70" />
                <dt className="font-mono text-[10px] uppercase tracking-[0.2em] text-ink/50">{f.label}</dt>
                <dd className="mt-1 font-display text-lg font-semibold tracking-tight">{f.value}</dd>
              </div>
            ))}
            <span data-rule className="block h-px bg-ink/70" />
          </dl>

          <div className="md:col-span-7 md:col-start-6">
            <p data-lead className="font-display text-[1.65rem] font-medium leading-[1.12] tracking-[-0.02em] md:text-[2.4rem]">
              {about.lead}
            </p>

            <div className="mt-12 grid gap-8 font-mono text-[11px] uppercase leading-relaxed tracking-[0.14em] sm:grid-cols-2">
              <div>
                <p className="mb-2 text-ink/50">Philosophy</p>
                <p className="normal-case tracking-normal [font-family:var(--font-display)] text-sm leading-relaxed text-ink/80 md:text-base">{about.philosophy}</p>
              </div>
              <div>
                <p className="mb-2 text-ink/50">Interests</p>
                <p className="text-ink/80">{about.interests.join(' / ')}</p>
                <p className="mb-2 mt-6 text-ink/50">Design</p>
                <p className="text-ink/80">{about.designInterests.join(' / ')}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
