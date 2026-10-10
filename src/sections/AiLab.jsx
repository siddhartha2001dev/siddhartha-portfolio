import { useEffect, useRef } from 'react'
import { Canvas, useFrame } from '@react-three/fiber'
import { RoundedBox } from '@react-three/drei'
import * as THREE from 'three'
import { gsap, ScrollTrigger } from '../animations/gsapSetup'
import { sceneState } from '../animations/sceneState'
import { useScrollAnimation } from '../hooks/useScrollAnimation'
import { useReducedMotion } from '../hooks/useReducedMotion'
import SectionLabel from '../components/common/SectionLabel'
import FillText from '../components/common/FillText'
import DecryptedText from '../components/common/DecryptedText'

const workflow = [
  {
    id: '01',
    state: 'DISCOVER / 01',
    title: 'Understand the problem',
    summary: 'Start with the user, the product goal and the flow that needs to exist before choosing a feature or a technology.',
    tools: ['Product flow', 'User context', 'AI ideation'],
    signal: 'BRIEF → FLOW',
    visual: 'discovery',
    workflow: ['Clarify the user', 'Map the feature flow', 'Define success', 'Choose the stack'],
  },
  {
    id: '02',
    state: 'DESIGN / 02',
    title: 'Shape the interface',
    summary: 'Turn the flow into a clear, responsive interface with a visual system that gives the product a point of view.',
    tools: ['Figma', 'Google Stitch', 'Penpot'],
    signal: 'FLOW → FRAME',
    visual: 'design',
    workflow: ['Wireframe the states', 'Prototype the flow', 'Define the visual language', 'Plan responsive behavior'],
  },
  {
    id: '03',
    state: 'FRONTEND / 03',
    title: 'Build the experience',
    summary: 'Compose the interface from reusable React pieces, then add the motion and interaction that make the product feel alive.',
    tools: ['React.js', 'Tailwind CSS', 'GSAP'],
    signal: 'FRAME → FEEL',
    visual: 'frontend',
    workflow: ['Build components', 'Connect UI state', 'Add motion systems', 'Test responsive views'],
  },
  {
    id: '04',
    state: 'BACKEND / 04',
    title: 'Make the system work',
    summary: 'Build the API, data model and authentication layer behind the interface so the product is reliable beyond the happy path.',
    tools: ['Node.js', 'Express.js', 'MongoDB'],
    signal: 'DATA → API',
    visual: 'backend',
    workflow: ['Model the data', 'Build the routes', 'Protect access', 'Handle failures'],
  },
  {
    id: '05',
    state: 'INTEGRATE / 05',
    title: 'Connect the capabilities',
    summary: 'Add the product-specific services—AI, real-time communication, payments or crypto—without losing control of the user flow.',
    tools: ['Gemini AI', 'Socket.IO', 'Payments'],
    signal: 'SERVICE → VALUE',
    visual: 'integrate',
    workflow: ['Connect the service', 'Validate the payload', 'Design loading states', 'Surface the result'],
  },
  {
    id: '06',
    state: 'SHIP / 06',
    title: 'Test, refine, release',
    summary: 'Finish with API checks, edge cases and deployment discipline, then use feedback to decide what deserves the next iteration.',
    tools: ['Postman', 'Docker', 'JWT / RBAC'],
    signal: 'CHECK → SHIP',
    visual: 'ship',
    workflow: ['Test the API', 'Check edge cases', 'Secure the release', 'Ship and iterate'],
  },
]

function Cyborg({ progressRef, reduced }) {
  const rig = useRef(null)
  const head = useRef(null)
  const visor = useRef(null)

  useFrame((state, delta) => {
    if (!rig.current) return
    const progress = progressRef.current
    const time = state.clock.elapsedTime
    const motion = reduced ? 0 : 1
    const stage = progress * (workflow.length - 1)
    const stagePhase = stage % 1
    rig.current.rotation.y = THREE.MathUtils.damp(rig.current.rotation.y, -0.28 + progress * 1.2 + Math.sin(time * 0.8) * 0.08 * motion, 4, delta)
    rig.current.rotation.x = THREE.MathUtils.damp(rig.current.rotation.x, progress * 0.22, 4, delta)
    rig.current.position.y = THREE.MathUtils.damp(rig.current.position.y, Math.sin(time * 1.4) * 0.08 * motion, 4, delta)
    if (head.current) {
      head.current.rotation.y = THREE.MathUtils.damp(head.current.rotation.y, (stagePhase - 0.5) * 0.35 + sceneState.mouseX * 0.34 * motion, 5, delta)
      head.current.rotation.x = THREE.MathUtils.damp(head.current.rotation.x, Math.sin(stagePhase * Math.PI) * -0.12 + sceneState.mouseY * -0.18 * motion, 5, delta)
    }
    if (visor.current) visor.current.material.emissiveIntensity = 2 + Math.sin(time * 5) * 0.55 * motion + progress * 1.5
  })

  const metal = { color: '#f4f1ea', metalness: 0.78, roughness: 0.18 }
  const dark = { color: '#343944', metalness: 0.7, roughness: 0.26 }
  const glow = { color: '#ff4a1c', emissive: '#ff4a1c', emissiveIntensity: 2.5, toneMapped: false }

  return (
    <group ref={rig} rotation={[0, -0.28, 0]}>
      <group ref={head}>
        <RoundedBox position={[0, 0.85, 0]} args={[0.7, 0.75, 0.55]} radius={0.12} smoothness={4} castShadow><meshStandardMaterial {...metal} /></RoundedBox>
        <mesh ref={visor} position={[0, 0.9, 0.29]}><boxGeometry args={[0.5, 0.16, 0.035]} /><meshStandardMaterial {...glow} /></mesh>
        <mesh position={[-0.38, 0.85, 0]} rotation={[0, 0, Math.PI / 2]}><cylinderGeometry args={[0.13, 0.13, 0.08, 16]} /><meshStandardMaterial {...dark} /></mesh>
        <mesh position={[0.38, 0.85, 0]} rotation={[0, 0, Math.PI / 2]}><cylinderGeometry args={[0.13, 0.13, 0.08, 16]} /><meshStandardMaterial {...dark} /></mesh>
        <RoundedBox position={[0, 0.68, 0.28]} args={[0.28, 0.1, 0.08]} radius={0.03} smoothness={3}><meshStandardMaterial {...dark} /></RoundedBox>
      </group>
      <mesh position={[0, 0.56, 0]}><cylinderGeometry args={[0.13, 0.13, 0.2, 16]} /><meshStandardMaterial {...dark} /></mesh>
      <RoundedBox position={[0, 0.08, 0]} args={[1.05, 0.85, 0.48]} radius={0.16} smoothness={4} castShadow><meshStandardMaterial {...dark} /></RoundedBox>
      <mesh position={[0, 0.45, 0.27]}><boxGeometry args={[0.28, 0.3, 0.035]} /><meshStandardMaterial {...glow} /></mesh>
      <mesh position={[-0.3, 0.42, 0.29]}><boxGeometry args={[0.08, 0.04, 0.03]} /><meshStandardMaterial {...glow} /></mesh>
      <mesh position={[0.3, 0.42, 0.29]}><boxGeometry args={[0.08, 0.04, 0.03]} /><meshStandardMaterial {...glow} /></mesh>
      <RoundedBox position={[-0.7, 0.08, 0]} rotation={[0, 0, -0.12]} args={[0.24, 0.7, 0.3]} radius={0.1} smoothness={4}><meshStandardMaterial {...metal} /></RoundedBox>
      <RoundedBox position={[0.7, 0.08, 0]} rotation={[0, 0, 0.12]} args={[0.24, 0.7, 0.3]} radius={0.1} smoothness={4}><meshStandardMaterial {...metal} /></RoundedBox>
      <mesh position={[-0.7, -0.3, 0]}><sphereGeometry args={[0.14, 16, 12]} /><meshStandardMaterial {...glow} /></mesh>
      <mesh position={[0.7, -0.3, 0]}><sphereGeometry args={[0.14, 16, 12]} /><meshStandardMaterial {...glow} /></mesh>
      <RoundedBox position={[-0.7, -0.45, 0.02]} rotation={[0, 0, -0.08]} args={[0.22, 0.42, 0.26]} radius={0.08} smoothness={4}><meshStandardMaterial {...metal} /></RoundedBox>
      <RoundedBox position={[0.7, -0.45, 0.02]} rotation={[0, 0, 0.08]} args={[0.22, 0.42, 0.26]} radius={0.08} smoothness={4}><meshStandardMaterial {...metal} /></RoundedBox>
      <mesh position={[-0.45, -0.1, 0.25]}><sphereGeometry args={[0.11, 16, 12]} /><meshStandardMaterial {...glow} /></mesh>
      <mesh position={[0.45, -0.1, 0.25]}><sphereGeometry args={[0.11, 16, 12]} /><meshStandardMaterial {...glow} /></mesh>
      <RoundedBox position={[-0.45, -0.62, 0]} args={[0.33, 0.95, 0.38]} radius={0.1} smoothness={4}><meshStandardMaterial {...metal} /></RoundedBox>
      <RoundedBox position={[0.45, -0.62, 0]} args={[0.33, 0.95, 0.38]} radius={0.1} smoothness={4}><meshStandardMaterial {...metal} /></RoundedBox>
      <RoundedBox position={[-0.45, -1.14, 0.08]} args={[0.42, 0.2, 0.55]} radius={0.08} smoothness={4}><meshStandardMaterial {...dark} /></RoundedBox>
      <RoundedBox position={[0.45, -1.14, 0.08]} args={[0.42, 0.2, 0.55]} radius={0.08} smoothness={4}><meshStandardMaterial {...dark} /></RoundedBox>
      <mesh position={[0, 1.32, 0]}><cylinderGeometry args={[0.025, 0.025, 0.35, 8]} /><meshStandardMaterial {...metal} /></mesh>
      <mesh position={[0, 1.52, 0]}><sphereGeometry args={[0.06, 12, 8]} /><meshStandardMaterial {...glow} /></mesh>
    </group>
  )
}

export default function AiLab() {
  const root = useRef(null)
  const rail = useRef(null)
  const scrollProgress = useRef(0)
  const reduced = useReducedMotion()

  useScrollAnimation(root, (_, el) => {
    const cards = el.querySelectorAll('[data-lab-card]')
    gsap.from(cards, {
      opacity: 0,
      y: 45,
      rotate: (index) => (index % 2 ? 1.5 : -1.5),
      stagger: 0.12,
      duration: 1.1,
      ease: 'power3.out',
      scrollTrigger: { trigger: el, start: 'top 72%' },
    })
  })

  useEffect(() => {
    const track = rail.current
    if (!track) return undefined
    const cards = [...track.querySelectorAll('[data-lab-card]')]
    const mobile = window.matchMedia('(max-width: 767px)').matches
    const getTravel = () => Math.max(1, track.clientHeight + 32)
    const updateCards = (progress = scrollProgress.current) => {
      scrollProgress.current = progress
      // Move each card by one complete rail height per stack step. A fixed
      // pixel distance left taller cards partially visible near the end.
      const travel = getTravel()
      cards.forEach((card, index) => {
        const distance = index - progress * (cards.length - 1)
        const depth = Math.max(0, distance)
        gsap.set(card, {
          y: distance < 0 ? distance * travel : Math.min(1.8, depth) * 22,
          rotateZ: distance < 0 ? distance * (index % 2 ? -2.2 : 2.2) : Math.min(1.8, depth) * (index % 2 ? 1.2 : -1.2),
          rotateY: Math.min(1, Math.max(-1, distance)) * -5,
          scale: distance < 0 ? 1 + distance * 0.04 : 1 - Math.min(1.8, depth) * 0.045,
          opacity: distance < -1 ? 0 : 1,
          // The active card stays on top while it exits; the next card is
          // revealed underneath. Reversing progress reverses the stack.
          zIndex: distance < 0 ? 200 - index : 100 - index,
        })
      })
    }
    updateCards()
    window.addEventListener('resize', updateCards)
    const horizontalScroll = ScrollTrigger.create({
      trigger: track,
      // Resolve the start against the actual viewport center so the fixed
      // navbar never participates in the card-stack trigger calculation.
      start: () => `center ${Math.round(window.innerHeight / 2 + 32)}px`,
      // The mobile cards travel by the full rail height. Match the trigger's
      // distance to that movement so the final card reaches the front and
      // reversing the gesture follows the exact same path.
      end: () => `+=${mobile
        ? Math.max(1200, (cards.length - 1) * getTravel())
        : Math.max(1200, cards.length * 360)}`,
      pin: true,
      // Touch scrolling needs a direct reversible mapping; the desktop scrub
      // lag makes the stack appear to skip or stall when scrolling upward.
      scrub: mobile ? true : 1,
      invalidateOnRefresh: true,
      onRefresh: (self) => updateCards(self.progress),
      onUpdate: (self) => {
        updateCards(self.progress)
      },
    })
    return () => {
      window.removeEventListener('resize', updateCards)
      horizontalScroll.kill()
      gsap.killTweensOf(cards)
    }
  }, [])

  return (
    <section ref={root} id="ai-lab" data-theme="ink" className="ai-lab relative z-10 overflow-hidden bg-ink px-5 pb-[14vh] pt-[16vh] text-paper md:px-8">
      <div className="ai-lab__backdrop" aria-hidden="true">
        <span />
        <span />
      </div>

      <div className="relative z-10">
        <div className="flex items-end justify-between gap-6">
          <SectionLabel index={5} title="AI Lab" meta="Build chain" />
          <span className="hidden font-mono text-[10px] uppercase tracking-[0.2em] text-muted md:block">Human-led / machine-assisted</span>
        </div>

        <div className="mt-8 grid gap-8 md:grid-cols-12 md:items-end">
          <h2 className="md:col-span-8 font-display font-black uppercase leading-[0.82] tracking-[-0.06em] wdth-cond [font-size:min(18vw,25vh)]">
            <FillText as="span" fillClass="text-paper" className="block text-paper">Product</FillText>
            <FillText as="span" fillClass="text-accent" className="ml-[10vw] block text-paper">Build Chain</FillText>
          </h2>
          <p className="max-w-[30ch] font-serif text-2xl italic leading-[0.95] text-paper/65 md:col-span-3 md:col-start-10 md:pb-2 md:text-3xl">
            From a rough idea to a tested product, every stage connects the skills and tools behind this portfolio.
          </p>
        </div>

        <div className="ai-lab__status mt-14 flex flex-wrap items-center gap-x-6 gap-y-3 border-y border-white/15 py-4 font-mono text-[10px] uppercase tracking-[0.18em] text-muted">
          <span className="flex items-center gap-2 text-paper"><i className="h-2 w-2 animate-pulse rounded-full bg-accent motion-reduce:animate-none" /> Lab online</span>
          <span>6 connected stages</span>
          <span>Idea → release</span>
          <span className="ml-auto text-accent">⌁ signal received</span>
        </div>

        <div ref={rail} className="ai-lab__rail mt-8 flex gap-4 overflow-x-auto pb-5">
          {workflow.map((experiment) => (
            <article key={experiment.id} data-lab-card className={`ai-lab-card ai-lab-card--${experiment.visual} group relative overflow-hidden rounded-[1rem] border border-white/15 p-4 md:p-5`}>
              <div className="ai-lab-card__noise" aria-hidden="true" />
              <div className="relative z-10 flex items-start justify-between gap-4 font-mono text-[10px] uppercase tracking-[0.16em]">
                <span className="text-accent">{experiment.id} / {experiment.state}</span>
                <span className="text-muted">{experiment.signal}</span>
              </div>

              <div className="ai-lab-card__screen relative z-10 my-5 grid place-items-center md:my-6" aria-hidden="true">
                {experiment.visual === 'discovery' && <div className="ai-lab-visual ai-lab-visual--discovery"><span className="ai-lab-visual__target">?</span><span className="ai-lab-visual__orbit" /><span className="ai-lab-visual__label">QUESTION / SIGNAL</span></div>}
                {experiment.visual === 'design' && <div className="ai-lab-visual ai-lab-visual--design"><span className="ai-lab-visual__window"><i /><i /><i /></span><span className="ai-lab-visual__cursor">↖</span><span className="ai-lab-visual__label">FRAME / FLOW</span></div>}
                {experiment.visual === 'frontend' && <div className="ai-lab-visual ai-lab-visual--frontend"><span className="ai-lab-visual__bracket">&lt;/&gt;</span><span className="ai-lab-visual__cursor">+</span><span className="ai-lab-visual__label">COMPONENT / MOTION</span></div>}
                {experiment.visual === 'backend' && <div className="ai-lab-visual ai-lab-visual--backend"><span className="ai-lab-visual__database"><i /><i /><i /></span><span className="ai-lab-visual__label">DATA / ROUTES</span></div>}
                {experiment.visual === 'integrate' && <div className="ai-lab-visual ai-lab-visual--integrate"><span className="ai-lab-visual__plug">↯</span><span className="ai-lab-visual__connector ai-lab-visual__connector--one" /><span className="ai-lab-visual__connector ai-lab-visual__connector--two" /><span className="ai-lab-visual__label">SERVICE / VALUE</span></div>}
                {experiment.visual === 'ship' && <div className="ai-lab-visual ai-lab-visual--ship"><span className="ai-lab-visual__check">✓</span><span className="ai-lab-visual__launch">↗</span><span className="ai-lab-visual__label">RELEASE / NEXT</span></div>}
              </div>

              <div className="relative z-10">
                <DecryptedText
                  text={experiment.title}
                  animateOn="hover"
                  sequential
                  revealDirection="center"
                  speed={25}
                  maxIterations={5}
                  parentClassName="font-display text-3xl font-black uppercase leading-none tracking-[-0.06em] wdth-cond md:text-4xl"
                  encryptedClassName="text-accent"
                  className="text-paper"
                  useOriginalCharsOnly
                />
                <p className="mt-3 max-w-[31ch] font-display text-sm leading-relaxed text-paper/65">{experiment.summary}</p>
                <ol className="ai-lab-card__workflow mt-4 grid gap-2">
                  {experiment.workflow.map((step, index) => (
                    <li key={step} className="flex items-center gap-3 font-mono text-[10px] uppercase tracking-[0.12em] text-muted">
                      <span className="text-accent">0{index + 1}</span>
                      <span>{step}</span>
                    </li>
                  ))}
                </ol>
                <ul className="mt-4 flex flex-wrap gap-2">
                  {experiment.tools.map((tool) => <li key={tool} className="rounded-full border border-white/15 px-2.5 py-1 font-mono text-[9px] uppercase tracking-[0.12em] text-muted transition-colors duration-300 group-hover:border-accent group-hover:text-accent">{tool}</li>)}
                </ul>
              </div>
            </article>
          ))}
        </div>

      </div>
    </section>
  )
}
