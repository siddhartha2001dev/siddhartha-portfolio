import { useState } from 'react'
import SectionLabel from '../components/common/SectionLabel'
import SkillIndex from '../components/skills/SkillIndex'

export default function Skills() {
  const [name, setName] = useState(null)
  return (
    <section
      id="skills"
      data-theme="ink"
      className={`skills-section relative z-10 overflow-hidden px-5 pb-[14vh] pt-[16vh] text-paper transition-colors duration-1000 md:px-8 ${name ? 'bg-[#171715]' : 'bg-ink'}`}
    >
      {/* Background responds: hovered technology appears as a ghosted outline */}
      <p
        aria-hidden="true"
        className={`pointer-events-none absolute -right-[2vw] bottom-[4vh] max-w-full whitespace-nowrap font-display font-black uppercase leading-none tracking-[-0.05em] text-accent text-outline wdth-cond [font-size:min(24vw,34vh)] transition-opacity duration-700 ${
          name ? 'opacity-[0.16]' : 'opacity-0'
        }`}
      >
        {name}
      </p>

      <div className="relative">
        <SectionLabel index={4} title="Skills" meta="Index" className="mb-10 md:mb-14" />
        <SkillIndex onHover={setName} />
      </div>
    </section>
  )
}
