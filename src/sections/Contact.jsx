import { useRef } from 'react'
import { FaBehance, FaEnvelope, FaFileLines, FaGithub, FaLinkedinIn } from 'react-icons/fa6'
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

const { contact, email, socialLinks } = siteConfig
const icons = {
  GitHub: FaGithub,
  LinkedIn: FaLinkedinIn,
  Behance: FaBehance,
  Email: FaEnvelope,
  Resume: FaFileLines,
}

export default function Contact({ standalone = false }) {
  const root = useRef(null)

  useScrollAnimation(root, (_, el) => {
    const lines = [...el.querySelectorAll('[data-line]')]
    const splits = lines.map((line) => splitText(line, 'chars'))
    splits.forEach((split, index) => {
      gsap.set(split.chars, { yPercent: 110 })
      revealChars(split.chars, {
        stagger: 0.025,
        delay: index * 0.1,
        scrollTrigger: { trigger: el.querySelector('[data-headline]'), start: 'top 78%' },
      })
    })
    gsap.from(el.querySelectorAll('[data-fade]'), {
      opacity: 0,
      y: 22,
      stagger: 0.08,
      duration: 1,
      scrollTrigger: { trigger: el.querySelector('[data-panel]'), start: 'top 88%' },
    })
    return () => splits.forEach((split) => split.revert())
  })

  return (
    <section
      id="contact"
      ref={root}
      data-theme="paper"
      className={`relative z-10 overflow-hidden bg-paper text-ink ${standalone ? 'min-h-[100svh]' : ''}`}
    >
      <div aria-hidden="true" className="pointer-events-none absolute right-[-12vw] top-[10vh] h-[42vw] w-[42vw] rounded-full border border-ink/10 md:right-[-6vw]" />
      <div aria-hidden="true" className="pointer-events-none absolute right-[8vw] top-[22vh] h-2 w-2 rounded-full bg-accent shadow-[0_0_0_8px_rgba(255,112,67,0.12)]" />

      <div className={`relative mx-auto max-w-[1480px] px-5 md:px-10 ${standalone ? 'pb-[12vh] pt-[18vh] md:pt-[20vh]' : 'pb-[10vh] pt-[16vh] md:pt-[18vh]'}`}>
        <div className="flex items-start justify-between gap-6">
          <SectionLabel index={5} title="Contact" meta="Open channel" />
        </div>

        <div className="mt-[10vh] grid gap-12 md:mt-[11vh] md:grid-cols-12 md:items-end md:gap-12 lg:gap-20">
          <div className="md:col-span-7 md:pb-5">
            <p className="mb-5 font-mono text-[10px] uppercase tracking-[0.2em] text-ink/45">01 / Start a conversation</p>
            <h2 data-headline aria-label={`${contact.headline[0]} ${contact.headline[1]}`} className="font-display font-black uppercase leading-[0.8] tracking-[-0.06em] wdth-cond [font-size:min(18vw,25vh)]">
              <span aria-hidden="true" data-line className="block">{contact.headline[0]}</span>
              <span aria-hidden="true" data-line className="block md:ml-[8vw]">{contact.headline[1]}</span>
            </h2>
          </div>

          <div data-panel className="self-end md:col-span-5 md:pb-1">
            <div className="border border-ink/20 bg-white/35 p-5 shadow-[14px_14px_0_rgba(8,7,17,0.06)] md:p-8">
              <p className="flex items-start gap-2 font-mono text-[10px] uppercase leading-relaxed tracking-[0.16em] text-ink/50">
                <span className="relative mt-1 flex h-2 w-2 shrink-0"><span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-accent opacity-50 motion-reduce:animate-none" /><span className="relative h-2 w-2 rounded-full bg-accent" /></span>
                {siteConfig.status}
              </p>
              <a href={`mailto:${email}`} data-fade className="group mt-7 flex items-center justify-between gap-4 border-t border-ink pt-5 font-display text-lg font-bold tracking-[-0.02em] md:text-xl">
                <span className="break-all transition-colors duration-500 group-hover:text-accent">{email}</span>
                <svg aria-hidden="true" viewBox="0 0 24 24" fill="none" className="h-8 w-8 shrink-0 transition-transform duration-500 group-hover:rotate-45">
                  <path d="M5 19 19 5M8 5h11v11" stroke="currentColor" strokeWidth="1.5" strokeLinecap="square" />
                </svg>
              </a>
            </div>
          </div>

          <FillText as="h2" aria-label={contact.headline[2]} className="w-max max-w-none whitespace-nowrap md:col-span-7 md:ml-[8vw] text-ink font-display font-black uppercase leading-[0.8] tracking-[-0.06em] wdth-cond [font-size:min(18vw,25vh)]" fillClass="text-accent" scrub={false} start="top 82%">{contact.headline[2]}</FillText>
        </div>

        {standalone && <div className="mt-[12vh] grid gap-10 border-t border-ink/20 pt-6 md:mt-[14vh] md:grid-cols-12 md:gap-8 lg:gap-12">
          <div data-fade className="md:col-span-4">
            <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-ink/45">Find me elsewhere</p>
            <p className="mt-4 max-w-[28ch] font-serif text-xl italic leading-tight text-ink/65">Good work starts with a clear brief and gets better through honest iteration.</p>
          </div>
          <ul data-fade className="grid grid-cols-3 gap-x-6 gap-y-5 md:col-span-5 md:col-start-6 md:grid-cols-5 md:gap-x-8">
            {socialLinks.map((social) => (
              <li key={social.label}>
                <UnderlineLink href={social.href} target={social.href.startsWith('http') ? '_blank' : undefined} rel="noreferrer" aria-label={social.label} title={social.label} className="inline-flex items-center text-3xl text-ink/75 transition-all duration-500 hover:-translate-y-1 hover:scale-110 hover:text-accent md:text-4xl">
                  {(() => { const Icon = icons[social.label]; return Icon ? <Icon aria-hidden="true" /> : <span aria-hidden="true">↗</span> })()}
                </UnderlineLink>
              </li>
            ))}
          </ul>
          <div data-fade className="md:col-span-2 md:col-start-11 md:text-right">
            <MagneticLink href="#top" onClick={(event) => { event.preventDefault(); scrollToTarget(0) }} aria-label="Back to top" className="inline-flex items-center gap-2 font-mono text-[10px] uppercase tracking-[0.18em] transition-colors duration-500 hover:text-accent">
              Back to top <span aria-hidden="true">↑</span>
            </MagneticLink>
          </div>
        </div>}
      </div>
      {!standalone && <Footer />}
    </section>
  )
}
