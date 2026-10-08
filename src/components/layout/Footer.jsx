import siteConfig from '../../data/siteConfig'
import UnderlineLink from '../common/UnderlineLink'

export default function Footer() {
  return (
    <footer className="site-footer relative overflow-hidden px-7 pb-7 pt-10 font-mono text-[11px] uppercase tracking-[0.18em] md:px-10 md:pt-14">
      <div aria-hidden="true" className="site-footer__ghost">SB</div>
      <div className="relative z-10">
        <div className="mb-10 flex items-center justify-between border-b border-white/15 pb-4 text-muted">
          <span><span className="text-accent">05</span> / End note</span>
          <span>{siteConfig.coordinates}</span>
        </div>
        <div className="grid gap-10 md:grid-cols-12 md:items-end">
          <div className="md:col-span-6">
            <p className="mb-2 text-accent">Built with intent</p>
            <p className="site-footer__name font-display font-black uppercase leading-[0.82] tracking-[-0.06em]">
              {(siteConfig.fullName ?? siteConfig.name).split(' ').map((part) => (
                <span key={part} className="block whitespace-nowrap">{part}</span>
              ))}
            </p>
            <p className="mt-4 text-white/55">{siteConfig.location} / {siteConfig.role}</p>
          </div>
          <ul className="grid grid-cols-2 gap-x-8 gap-y-3 md:col-span-3 md:grid-cols-1">
            {siteConfig.socialLinks.map((s) => (
              <li key={s.label}>
                <UnderlineLink href={s.href} target={s.href.startsWith('http') ? '_blank' : undefined} rel="noreferrer">
                  {s.label}
                </UnderlineLink>
              </li>
            ))}
          </ul>
          <div className="md:col-span-3 md:text-right">
            <p className="inline-flex items-center gap-2 text-white/75">
              <span className="relative flex h-2 w-2">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-accent opacity-60 motion-reduce:animate-none" />
                <span className="relative inline-flex h-2 w-2 rounded-full bg-accent" />
              </span>
              {siteConfig.status}
            </p>
          </div>
        </div>
        <div className="mt-12 flex items-center justify-between border-t border-white/15 pt-4 text-white/45">
          <span>© {new Date().getFullYear()} {siteConfig.fullName ?? siteConfig.name}</span>
          <span>Designed / Developed</span>
        </div>
      </div>
    </footer>
  )
}
