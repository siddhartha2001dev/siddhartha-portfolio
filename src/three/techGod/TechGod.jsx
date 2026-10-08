import { useEffect, useMemo, useRef } from 'react'
import * as THREE from 'three'
import { useFrame, useThree } from '@react-three/fiber'
import { useGLTF } from '@react-three/drei'
import { sceneState } from '../../animations/sceneState'
import { HERO_MODEL, MODEL_PROFILE, QUALITY } from './config'
import { createMarbleMaterial, createTechUniforms } from './marbleMaterial'
import { buildHair } from './buildHair'
import { buildWires } from './buildWires'
import LightBeam from './LightBeam'

const BEAM_TILT = -0.2 // rad: screen-space slope of the scan line

// Pull every mesh out of the GLB, bake its transform, merge into one geometry (model units).
function extractGeometry(scene) {
  scene.updateMatrixWorld(true)
  const parts = []
  scene.traverse((o) => {
    if (!o.isMesh) return
    const g = o.geometry.clone()
    g.applyMatrix4(o.matrixWorld)
    for (const k of Object.keys(g.attributes)) if (!['position', 'normal'].includes(k)) g.deleteAttribute(k)
    if (!g.attributes.normal) g.computeVertexNormals()
    parts.push(g)
  })
  return parts[0] // the base sculpture is a single mesh; extend with mergeGeometries if you swap in a multi-part GLB
}

function build(scene, tier, uniforms) {
  const q = QUALITY[tier]
  const geo = extractGeometry(scene)
  const material = createMarbleMaterial(uniforms, q.octaves)
  const root = new THREE.Group()
  const head = new THREE.Mesh(geo, material)
  root.add(head)
  const disposers = [() => geo.dispose(), () => material.dispose()]

  if (MODEL_PROFILE.features.hair) {
    const hair = buildHair(geo, material, q)
    root.add(hair.group)
    disposers.push(hair.dispose)
  }
  if (MODEL_PROFILE.features.wires) {
    const wires = buildWires(geo, uniforms, q)
    root.add(wires.mesh)
    disposers.push(wires.dispose)
  }
  root.scale.setScalar(MODEL_PROFILE.scale)
  return { root, dispose: () => disposers.forEach((d) => d()), quality: q }
}

export default function TechGod({ tier = 'desktop', reduced = false }) {
  const { scene } = useGLTF(HERO_MODEL)
  const uniforms = useMemo(createTechUniforms, [])
  const built = useMemo(() => build(scene, tier, uniforms), [scene, tier, uniforms])
  useEffect(() => () => built.dispose(), [built])

  const rig = useRef() // placement + scroll
  const pose = useRef() // art-directed rotation + pointer
  const beam = useRef()
  const sm = useRef({ x: 0, y: 0 })
  const eye = useMemo(() => new THREE.Vector3(), [])
  const viewport = useThree((s) => s.viewport)

  useFrame((state, dt) => {
    if (!rig.current || !pose.current) return
    const s = sceneState
    const k = 1 - Math.pow(0.001, Math.min(dt, 0.1))
    const motion = reduced ? 0 : 1
    sm.current.x += (s.mouseX - sm.current.x) * k * 0.6
    sm.current.y += (s.mouseY - sm.current.y) * k * 0.6
    const t = reduced ? 0 : state.clock.elapsedTime

    // pointer parallax + a very slow breath; never a spin
    pose.current.rotation.y = MODEL_PROFILE.pose.rotY + (sm.current.x * 0.16 + Math.sin(t * 0.33) * 0.014) * motion + s.scroll * 0.32 * motion
    pose.current.rotation.x = MODEL_PROFILE.pose.rotX + sm.current.y * 0.07 * motion + s.scroll * 0.06 * motion

    // scroll: drift up and back, shrink a touch (hero type slides over it)
    const fit = Math.min(1, viewport.width / 2.6)
    const [px, py] = MODEL_PROFILE.position
    rig.current.position.set(px + sm.current.x * 0.07 * motion, py * fit + s.scroll * 0.6 * motion + -sm.current.y * 0.03 * motion, -s.scroll * 0.5)
    rig.current.scale.setScalar(fit * (1 - s.scroll * 0.14))
    state.camera.position.z = 5.6 + s.scroll * 1.0

    // beam follows the eyeline
    rig.current.updateWorldMatrix(true, true)
    eye.set(0, MODEL_PROFILE.eyeLine.y, MODEL_PROFILE.eyeLine.z)
    built.root.localToWorld(eye)
    uniforms.uTime.value = t
    uniforms.uBeamP.value.copy(eye)
    uniforms.uBeamD.value.set(Math.cos(BEAM_TILT), Math.sin(BEAM_TILT), 0)
    uniforms.uBeamI.value = (1 - s.scroll * 0.92) * (reduced ? 0.8 : 1 + Math.sin(t * 1.7) * 0.04)
    if (beam.current) {
      beam.current.position.copy(eye)
      beam.current.rotation.z = BEAM_TILT
    }
  })

  return (
    <>
      <group ref={rig}>
        <group ref={pose} rotation={[MODEL_PROFILE.pose.rotX, MODEL_PROFILE.pose.rotY, 0]}>
          <primitive object={built.root} />
        </group>
      </group>
      <LightBeam ref={beam} uniforms={uniforms} sparks={reduced ? 0 : built.quality.sparks} />
    </>
  )
}

useGLTF.preload(HERO_MODEL)
