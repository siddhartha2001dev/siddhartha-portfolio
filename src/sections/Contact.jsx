import { useRef } from 'react'
import { gsap } from '../animations/gsapSetup'
import { splitText, revealChars } from '../animations/textAnimations'
import { scrollToTarget } from '../animations/lenisStore'
import { useScrollAnimation } from '../hooks/useScrollAnimation'
import SectionLabel from '../components/common/SectionLabel'
import FillText from '../components/common/FillText'
import MagneticLink from '../components/common/MagneticLink'
import UnderlineLink from '../components/common/UnderlineLink'
import Footer from '../components/layout/Footer'
import siteConfig from '../data/siteConfig'

const { contact, email, socialLinks, handle } = siteConfig
const value = {
  Email: email,
  GitHub: `@${handle}`,
  LinkedIn: 'Connect',
  Resume: 'Download PDF',
}

export default function Contact() {
  const root = useRef(null)

  useScrollAnimation(root, (_, el) => {
    const lines = [...el.querySelectorAll('[data-line]')]
    const splits = lines.map((l) => splitText(l, 'chars'))
    splits.forEach((s, i) => {
      gsap.set(s.chars, { yPercent: 110 })
      revealChars(s.chars, { stagger: 0.03, delay: i * 0.12, scrollTrigger: { trigger: el.querySelector('h2'), start: 'top 75%' } })
    })
    gsap.from(el.querySelectorAll('[data-fade]'), {
      opacity: 0, y: 24, stagger: 0.08, duration: 1,
      scrollTrigger: { trigger: el.querySelector('[data-cta]'), start: 'top 90%' },
    })
    return () => splits.forEach((s) => s.revert())
  })

  return (
    <section id="contact" ref={root} data-theme="paper" className="relative z-10 flex min-h-[100svh] flex-col justify-between bg-paper text-ink">
      <div className="px-5 pt-[16vh] md:px-8 md:pt-[20vh]">
        <SectionLabel index={5} title="Contact" meta={contact.note} className="mb-8 max-w-full" />

        <h2
          aria-label={contact.headline.join(' ')}
          className="font-display font-black uppercase leading-[0.84] tracking-[-0.05em] wdth-cond [font-size:min(19vw,25vh)]"
        >
          <span aria-hidden="true" data-line className="block">{contact.headline[0]}</span>
          <span aria-hidden="true" data-line className="block md:ml-[10vw]">{contact.headline[1]}</span>
          <FillText as="span" className="text-ink" fillClass="text-accent" start="top 90%" end="bottom 60%">{contact.headline[2]}</FillText>
        </h2>

        <a
          data-cta
          data-cursor="OPEN"
          href={`mailto:${email}`}
          className="group mt-[9vh] flex items-center justify-between gap-4 overflow-hidden border-y border-ink px-0 py-5 transition-colors duration-700 ease-expo hover:bg-ink hover:px-4 hover:text-paper focus-visible:bg-ink focus-visible:text-paper md:py-7"
        >
          <span className="font-display font-black uppercase leading-none tracking-[-0.04em] [font-size:min(12vw,12vh)] [font-stretch:62%] transition-[font-stretch,letter-spacing] duration-700 ease-expo group-hover:tracking-[-0.02em] group-hover:[font-stretch:125%] group-hover:text-accent group-focus-visible:[font-stretch:125%] md:[font-size:min(8.5vw,12vh)]">
            {contact.cta}
          </span>
          <span aria-hidden="true" className="text-4xl transition-transform duration-700 ease-expo group-hover:rotate-45 md:text-6xl">↗</span>
        </a>

        <ul className="mt-10 grid grid-cols-2 gap-x-6 gap-y-8 md:grid-cols-4">
          {socialLinks.map((s) => (
            <li key={s.label} data-fade>
              <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-ink/50">{s.label}</p>
              <UnderlineLink
                href={s.href}
                target={s.href.startsWith('http') ? '_blank' : undefined}
                rel="noreferrer"
                className="mt-1 break-all font-display text-lg font-semibold tracking-tight md:text-xl"
              >
                {value[s.label] ?? s.label}
              </UnderlineLink>
            </li>
          ))}
        </ul>

        <div data-fade className="mt-10 flex items-end justify-between">
          <p className="max-w-[34ch] font-serif text-2xl italic leading-tight md:text-3xl">{contact.note}</p>
          <MagneticLink
            href="#top"
            onClick={(e) => { e.preventDefault(); scrollToTarget(0) }}
            aria-label="Back to top"
            className="grid h-20 w-20 shrink-0 place-items-center rounded-full border border-ink font-mono text-[11px] uppercase tracking-[0.18em] transition-colors duration-500 hover:bg-ink hover:text-paper"
          >
            Top ↑
          </MagneticLink>
        </div>
      </div>

      <div className="mt-[10vh]">
        <Footer />
      </div>
    </section>
  )
}
