import SectionLabel from '../components/common/SectionLabel'
import FillText from '../components/common/FillText'
import UnderlineLink from '../components/common/UnderlineLink'
import ProjectFrame from '../components/projects/ProjectFrame'
import siteConfig from '../data/siteConfig'

export default function SelectedWork({ standalone = false }) {
  const { projects, socialLinks } = siteConfig
  const github = socialLinks.find((s) => s.label === 'GitHub')

  return (
    <section
      id="work"
      data-theme={standalone ? 'paper' : 'ink'}
      className={`relative z-10 ${standalone ? 'selected-work--page bg-paper text-ink' : 'bg-ink text-paper'}`}
    >
      <div className="px-5 pt-[16vh] md:px-8 md:pt-[20vh]">
        <div className="flex items-end justify-between">
          <SectionLabel index={2} title="Selected Work" meta={`${projects.length} projects`} />
          <span className="font-mono text-[11px] uppercase tracking-[0.2em] text-muted">2025 — 2026</span>
        </div>
        <h2 className="mt-8 font-display font-black uppercase leading-[0.82] tracking-[-0.05em] wdth-cond [font-size:min(22vw,30vh)]">
          <FillText as="span" fillClass="text-paper" className="text-paper">Selected</FillText>
          <FillText as="span" fillClass="text-accent" className="text-paper md:ml-[12vw]">Work</FillText>
        </h2>
      </div>

      {projects.map((p, i) => (
        <ProjectFrame key={p.id} project={p} index={i} total={projects.length} />
      ))}

      <div className="flex justify-end px-5 pb-[12vh] pt-[6vh] font-mono text-[11px] uppercase tracking-[0.2em] md:px-8">
        <UnderlineLink href={github.href} target="_blank" rel="noreferrer">
          All repositories ↗
        </UnderlineLink>
      </div>
    </section>
  )
}
