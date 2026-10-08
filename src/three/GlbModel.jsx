import { useRef } from 'react'
import { useGLTF } from '@react-three/drei'
import { useFrame } from '@react-three/fiber'
import { sceneState } from '../animations/sceneState'

export default function GlbModel({ url, reduced }) {
  const { scene } = useGLTF(url)
  const ref = useRef()
  useFrame((state, dt) => {
    if (!ref.current || reduced) return
    const k = 1 - Math.pow(0.001, dt)
    ref.current.rotation.y += (sceneState.mouseX * 0.6 + sceneState.scroll * Math.PI - ref.current.rotation.y) * k
    ref.current.rotation.x += (sceneState.mouseY * 0.3 - ref.current.rotation.x) * k
  })
  return <primitive ref={ref} object={scene} />
}
