import { useEffect, useMemo, useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'
import { sceneState } from '../animations/sceneState'

// Procedural, art-directed fallback: a faceted, slightly crushed icosahedron
// inside a thin wireframe shell. Facets are quantised so it reads as cut stone / machined metal.
function buildGeometry(detail) {
  const g = new THREE.IcosahedronGeometry(1.35, detail)
  const p = g.attributes.position
  const v = new THREE.Vector3()
  for (let i = 0; i < p.count; i++) {
    v.fromBufferAttribute(p, i)
    const n =
      Math.sin(v.x * 2.1 + v.y * 1.3) * 0.5 +
      Math.sin(v.y * 2.7 - v.z * 1.9) * 0.35 +
      Math.sin(v.z * 3.3 + v.x * 1.1) * 0.25
    const q = Math.round(n * 4) / 4 // quantise → hard planes
    v.multiplyScalar(1 + q * 0.16)
    v.y *= 1.18 // taller, monolith-like
    p.setXYZ(i, v.x, v.y, v.z)
  }
  g.computeVertexNormals()
  return g
}

export default function Monolith({ detail = 1, reduced = false }) {
  const group = useRef()
  const shell = useRef()
  const geo = useMemo(() => buildGeometry(detail), [detail])
  const shellGeo = useMemo(() => new THREE.IcosahedronGeometry(1.9, 1), [])
  const mat = useMemo(
    () =>
      new THREE.MeshStandardMaterial({
        color: '#b9b6ae',
        metalness: 1,
        roughness: 0.28,
        flatShading: true,
      }),
    [],
  )
  const wire = useMemo(
    () => new THREE.MeshBasicMaterial({ color: '#ff4a1c', wireframe: true, transparent: true, opacity: 0.35 }),
    [],
  )

  useEffect(
    () => () => {
      geo.dispose()
      shellGeo.dispose()
      mat.dispose()
      wire.dispose()
    },
    [geo, shellGeo, mat, wire],
  )

  const target = useRef({ x: 0, y: 0 })
  useFrame((state, dt) => {
    const g = group.current
    if (!g) return
    const s = sceneState
    const k = 1 - Math.pow(0.001, dt) // frame-rate independent damping
    const motion = reduced ? 0 : 1
    target.current.x += (s.mouseY * 0.35 - target.current.x) * k
    target.current.y += (s.mouseX * 0.5 - target.current.y) * k
    g.rotation.x = target.current.x * motion + s.scroll * 0.9 * motion
    g.rotation.y = target.current.y * motion + s.scroll * Math.PI * 0.8 * motion + (reduced ? 0.5 : state.clock.elapsedTime * 0.06)
    g.position.y = -s.scroll * 0.8
    const sc = 1 - s.scroll * 0.25
    const fit = Math.min(1, state.viewport.width / 4.6) // keep the object inside portrait screens
    g.scale.setScalar(sc * fit)
    if (shell.current) {
      shell.current.rotation.y = -g.rotation.y * 0.5
      shell.current.rotation.x = g.rotation.x * 0.4
    }
    // lights follow theme (ink → paper): wire fades as the hero hands off
    wire.opacity = 0.35 * (1 - s.scroll)
    state.camera.position.z = 5.6 + s.scroll * 1.4
  })

  return (
    <group ref={group}>
      <mesh geometry={geo} material={mat} />
      <mesh ref={shell} geometry={shellGeo} material={wire} />
    </group>
  )
}
