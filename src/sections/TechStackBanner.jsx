import LogoLoop from '../components/hero/LogoLoop'
import { SiReact, SiNextdotjs, SiTypescript, SiTailwindcss } from 'react-icons/si'

const techLogos = [
  { node: <SiReact />, title: 'React', href: 'https://react.dev' },
  { node: <SiNextdotjs />, title: 'Next.js', href: 'https://nextjs.org' },
  { node: <SiTypescript />, title: 'TypeScript', href: 'https://www.typescriptlang.org' },
  { node: <SiTailwindcss />, title: 'Tailwind CSS', href: 'https://tailwindcss.com' },
]

export default function TechStackBanner() {
  return (
    <section
      aria-label="Technology stack"
      data-theme="ink"
      className="tech-stack-banner relative z-20 flex min-h-[230px] flex-col justify-center overflow-hidden px-5 py-12 text-paper md:min-h-[300px] md:px-8 md:py-16"
    >
      <div className="mb-8 flex items-center justify-between font-mono text-[10px] uppercase tracking-[0.2em] text-muted md:mb-10 md:text-[11px]">
        <span>Stack / Tools</span>
        <span>Scroll to explore</span>
      </div>
      <LogoLoop
        logos={techLogos}
        speed={0}
        direction="left"
        logoHeight={76}
        gap={88}
        hoverSpeed={0}
        scaleOnHover
        fadeOut
        fadeOutColor="#0c0c0b"
        scrollControlled
        className="logoloop--fade-below"
        ariaLabel="Technology stack"
      />
    </section>
  )
}
