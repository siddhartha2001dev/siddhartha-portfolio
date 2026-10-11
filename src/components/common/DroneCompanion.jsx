import { useEffect, useRef, useState } from 'react'
import { Canvas, useFrame } from '@react-three/fiber'
import { ContactShadows, Environment } from '@react-three/drei'
import * as THREE from 'three'
import { sceneState } from '../../animations/sceneState'
import { BeeRobot } from '../../../BeeRobot.jsx'

function ActivationPulse({ reacting }) {
  const ring = useRef(null)
  const material = useRef(null)
  const pulse = useRef(0)
  const previous = useRef(reacting)

  useFrame((_, delta) => {
    if (reacting && !previous.current) pulse.current = 1
    previous.current = reacting
    pulse.current = Math.max(0, pulse.current - delta * 2.25)
    const amount = pulse.current
    if (ring.current) {
      ring.current.visible = amount > 0.01
      ring.current.scale.setScalar(0.75 + (1 - amount) * 1.55)
      ring.current.rotation.y += delta * 0.9
    }
    if (material.current) material.current.opacity = amount * 0.5
  })

  return (
    <mesh ref={ring} position={[0, -0.28, 0]} rotation={[Math.PI / 2, 0, 0]} renderOrder={25}>
      <torusGeometry args={[0.92, 0.018, 8, 64]} />
      <meshBasicMaterial ref={material} color="#ffb14a" transparent opacity={0} depthTest={false} depthWrite={false} toneMapped={false} />
    </mesh>
  )
}

function BeeRig({ progressRef, reduced, reacting }) {
  const rig = useRef(null)
  const reaction = useRef(0)

  useFrame((state, delta) => {
    if (!rig.current) return
    const time = state.clock.elapsedTime
    const motion = reduced ? 0 : 1
    const progress = progressRef.current
    reaction.current = THREE.MathUtils.damp(reaction.current, reacting && !reduced ? 1 : 0, 8, delta)
    const response = reaction.current
    rig.current.position.y = THREE.MathUtils.damp(rig.current.position.y, Math.sin(time * 1.25) * 0.04 * motion + response * 0.12, 4, delta)
    rig.current.rotation.y = THREE.MathUtils.damp(rig.current.rotation.y, -0.52 + progress * Math.PI * 2 + sceneState.mouseX * 0.09 * motion + response * 1.15, 4, delta)
    rig.current.rotation.x = THREE.MathUtils.damp(rig.current.rotation.x, sceneState.mouseY * -0.055 * motion - response * 0.18, 3, delta)
    rig.current.rotation.z = THREE.MathUtils.damp(rig.current.rotation.z, sceneState.mouseX * -0.03 * motion + Math.sin(time * 18) * response * 0.025, 3, delta)
    const scale = 1 + response * 0.055
    // Keep the model uniformly scaled on touch devices and during the click
    // reaction so the bee never appears stretched or squashed.
    rig.current.scale.setScalar(scale)
  })

  return (
    <group ref={rig} position={[0, -0.18, 0]}>
      <BeeRobot scale={0.7} rotation={[0, -0.2, 0]} />
      <ActivationPulse reacting={reacting} />
    </group>
  )
}

export default function DroneCompanion() {
  const wrapper = useRef(null)
  const progressRef = useRef(0)
  const reactionTimer = useRef(null)
  const [reacting, setReacting] = useState(false)
  const reduced = window.matchMedia?.('(prefers-reduced-motion: reduce)').matches ?? false
  const mobile = window.innerWidth < 768

  const reactToClick = () => {
    setReacting(true)
    window.clearTimeout(reactionTimer.current)
    reactionTimer.current = window.setTimeout(() => setReacting(false), 1100)
  }

  useEffect(() => () => window.clearTimeout(reactionTimer.current), [])

  useEffect(() => {
    let frame = 0
    const update = () => {
      const node = wrapper.current
      if (!node) return

      const sectionIds = ['top', 'about', 'work', 'experience', 'skills', 'ai-lab', 'contact']
      const sections = sectionIds.map((id) => document.querySelector(`#${id}`)).filter(Boolean)
      if (!sections.length) {
        node.style.opacity = '1'
        node.dataset.state = 'arrived'
        node.style.setProperty('--drone-scale', '1')
        node.style.setProperty('--drone-rise', '0px')
        node.style.setProperty('--drone-y', '78vh')
        node.style.setProperty('--drone-x', '86%')
        return
      }

      const firstTop = sections[0].getBoundingClientRect().top + window.scrollY
      const start = firstTop - window.innerHeight * 0.7
      const end = Math.max(start + 1, document.documentElement.scrollHeight - window.innerHeight * 0.45)
      const progress = THREE.MathUtils.clamp((window.scrollY - start) / (end - start), 0, 1)
      progressRef.current = progress

      const viewportMidpoint = window.scrollY + window.innerHeight * 0.52
      let activeIndex = 0
      sections.forEach((section, index) => {
        const top = section.getBoundingClientRect().top + window.scrollY
        if (top <= viewportMidpoint) activeIndex = index
      })
      const mobile = window.innerWidth < 768
      const gutter = mobile ? 23 : 10
      const isFinalSection = activeIndex === sections.length - 1
      const cornerX = isFinalSection || activeIndex % 2 !== 0 ? 100 - gutter : gutter
      const cornerY = isFinalSection ? (mobile ? 80 : 84) : (mobile ? 73 : 77)
      // Keep the companion off the hero; introduce it once the first content
      // section takes over so it does not compete with the hero scene.
      const arrived = activeIndex > 0
      node.style.opacity = arrived ? '1' : '0'
      node.dataset.state = arrived ? 'arrived' : 'hidden'
      node.style.setProperty('--drone-scale', arrived ? '1' : '0.42')
      node.style.setProperty('--drone-rise', arrived ? '0px' : '2.5rem')
      node.style.setProperty('--drone-y', `${cornerY}vh`)
      node.style.setProperty('--drone-x', `${cornerX}%`)
      node.style.setProperty('--drone-tilt', `${Math.sin(progress * Math.PI * 2) * 4}deg`)
    }
    const onScroll = () => {
      cancelAnimationFrame(frame)
      frame = requestAnimationFrame(update)
    }

    update()
    window.addEventListener('scroll', onScroll, { passive: true })
    window.addEventListener('resize', onScroll)
    const observer = new MutationObserver(onScroll)
    observer.observe(document.querySelector('main') || document.body, { childList: true })
    return () => {
      cancelAnimationFrame(frame)
      window.removeEventListener('scroll', onScroll)
      window.removeEventListener('resize', onScroll)
      observer.disconnect()
    }
  }, [])

  // The companion is intentionally desktop-only. Avoid mounting the R3F
  // canvas on phones where the GLB is not rendering reliably and where it
  // competes with the mobile card interactions.
  if (mobile) return null

  return (
    <>
      <div
        ref={wrapper}
        className="drone-companion"
        role="button"
        tabIndex="0"
        aria-label="Robotic bee companion"
        onClick={reactToClick}
        onKeyDown={(event) => {
          if (event.key === 'Enter' || event.key === ' ') {
            event.preventDefault()
            reactToClick()
          }
        }}
      >
      <div className="drone-companion__scene">
        <Canvas camera={{ position: [5, 2.4, 7.2], fov: 38 }} dpr={[1, mobile ? 1.8 : 1.75]} shadows gl={{ alpha: true, antialias: true, powerPreference: 'high-performance', toneMapping: THREE.ACESFilmicToneMapping, toneMappingExposure: 0.95 }}>
          <ambientLight intensity={0.5} />
          <directionalLight position={[3, 4, 5]} intensity={3.1} color="#fff4df" castShadow shadow-mapSize={[mobile ? 768 : 1024, mobile ? 768 : 1024]} />
          <directionalLight position={[-4, 2, -3]} intensity={1.25} color="#b9d9ff" />
          <spotLight position={[1.5, 3.5, 4]} angle={0.48} penumbra={0.65} intensity={4.2} color="#fff8ed" castShadow />
          <pointLight position={[2, 1, 3]} intensity={3.2} color="#ff9d2e" distance={8} decay={2} />
          <pointLight position={[-2, 0.4, 1]} intensity={1.8} color="#5ab9ff" distance={7} decay={2} />
          <Environment preset="city" environmentIntensity={0.72} />
          <BeeRig progressRef={progressRef} reduced={reduced} reacting={reacting} />
          <ContactShadows position={[0, -2.05, -1.15]} opacity={mobile ? 0.22 : 0.3} scale={5} blur={mobile ? 2.2 : 2.8} far={3.2} color="#14181c" />
        </Canvas>
      </div>
      </div>
    </>
  )
}
