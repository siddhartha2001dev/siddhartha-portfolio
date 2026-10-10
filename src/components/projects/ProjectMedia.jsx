import { useState } from 'react'

const VISUALS = {
  1: {
    background: 'radial-gradient(circle at 78% 20%, rgba(255, 116, 67, 0.9), transparent 25%), linear-gradient(135deg, #f0e8d8 0%, #d4c2a5 100%)',
    mark: 'N',
    label: 'AI COMMERCE',
    accent: '#ff7043',
  },
  2: {
    background: 'radial-gradient(circle at 22% 18%, rgba(127, 184, 255, 0.9), transparent 24%), linear-gradient(135deg, #d9e6eb 0%, #8299a8 100%)',
    mark: 'J',
    label: 'JOB PORTAL',
    accent: '#245d83',
  },
  3: {
    background: 'radial-gradient(circle at 82% 78%, rgba(222, 244, 171, 0.8), transparent 25%), linear-gradient(135deg, #d8dfc4 0%, #77816a 100%)',
    mark: 'N',
    label: 'SECURE API',
    accent: '#30442e',
  },
  4: {
    background: 'radial-gradient(circle at 72% 24%, rgba(227, 157, 255, 0.8), transparent 25%), linear-gradient(135deg, #d7c8de 0%, #66516e 100%)',
    mark: 'Z',
    label: 'REAL-TIME CHAT',
    accent: '#4d285b',
  },
}

// Real image when present in /public/projects, otherwise a typographic "contact frame".
export default function ProjectMedia({ project, index, total }) {
  const [failed, setFailed] = useState(false)
  if (!failed && project.image) {
    return (
      <img
        src={project.image}
        alt={`${project.title} — ${project.category} project preview`}
        loading={index === 0 ? 'eager' : 'lazy'}
        fetchPriority={index === 0 ? 'high' : 'auto'}
        decoding="async"
        onError={() => setFailed(true)}
        className="h-full w-full object-cover"
      />
    )
  }
  const n = String(index + 1).padStart(2, '0')
  const visual = VISUALS[project.id] ?? { background: project.tone, mark: project.title[0], label: project.category, accent: '#ff4a1c' }
  return (
    <div className="relative h-full w-full overflow-hidden text-ink" style={{ background: visual.background }} role="img" aria-label={`${project.title} — ${project.category} project preview`}>
      <div className="absolute inset-5 border border-ink/25" />
      <div className="absolute -right-[12%] -top-[8%] h-[52%] w-[52%] rounded-full border-[1.5rem] border-white/20" />
      <div className="absolute -bottom-[20%] -left-[9%] h-[62%] w-[62%] rounded-full border border-ink/20" />
      <span className="absolute left-8 top-8 font-mono text-[10px] uppercase tracking-[0.22em] opacity-70">{visual.label}</span>
      <span className="absolute right-8 top-8 font-mono text-[10px] uppercase tracking-[0.2em] opacity-70">{n} / {String(total).padStart(2, '0')}</span>
      <div className="absolute inset-0 grid place-items-center">
        <div className="relative grid h-[42%] w-[42%] place-items-center rounded-full border border-white/40 bg-white/20 shadow-2xl backdrop-blur-sm">
          <span className="font-display text-[min(28vw,30vh)] font-black leading-none tracking-[-0.1em]" style={{ color: visual.accent }}>{visual.mark}</span>
          <span className="absolute -bottom-7 rounded-full border border-ink/30 bg-white/30 px-3 py-1 font-mono text-[9px] uppercase tracking-[0.18em]">{project.title}</span>
        </div>
      </div>
      <div className="absolute bottom-8 left-8 right-8 flex items-end justify-between gap-4 font-mono text-[10px] uppercase tracking-[0.16em]">
        <span className="max-w-[18ch] leading-relaxed opacity-75">{project.technologies.slice(0, 3).join(' · ')}</span>
        <span className="h-3 w-3 shrink-0 rounded-full" style={{ background: visual.accent }} />
      </div>
    </div>
  )
}
