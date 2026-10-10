import { useRef, useMemo } from 'react'
import { Canvas, useFrame } from '@react-three/fiber'
import { Float, Environment, OrbitControls, ContactShadows } from '@react-three/drei'
import * as THREE from 'three'

/* ---------- Materials ---------- */
const useMats = () =>
  useMemo(
    () => {
      const canvas = document.createElement('canvas')
      canvas.width = 96
      canvas.height = 96
      const context = canvas.getContext('2d')
      context.fillStyle = '#0b0d10'
      context.fillRect(0, 0, 96, 96)
      context.strokeStyle = '#242a31'
      context.lineWidth = 2
      for (let offset = -96; offset < 192; offset += 12) {
        context.beginPath()
        context.moveTo(offset, 0)
        context.lineTo(offset + 96, 96)
        context.stroke()
        context.beginPath()
        context.moveTo(offset + 96, 0)
        context.lineTo(offset, 96)
        context.stroke()
      }
      const carbon = new THREE.CanvasTexture(canvas)
      carbon.wrapS = THREE.RepeatWrapping
      carbon.wrapT = THREE.RepeatWrapping
      carbon.repeat.set(2, 2)
      carbon.colorSpace = THREE.SRGBColorSpace

      const brushedCanvas = document.createElement('canvas')
      brushedCanvas.width = 128
      brushedCanvas.height = 64
      const brushedContext = brushedCanvas.getContext('2d')
      brushedContext.fillStyle = '#8b9299'
      brushedContext.fillRect(0, 0, 128, 64)
      for (let y = 0; y < 64; y += 2) {
        const shade = 112 + Math.floor(Math.random() * 42)
        brushedContext.strokeStyle = `rgba(${shade}, ${shade + 4}, ${shade + 8}, ${0.18 + Math.random() * 0.22})`
        brushedContext.beginPath()
        brushedContext.moveTo(0, y + Math.random())
        brushedContext.lineTo(128, y + Math.random())
        brushedContext.stroke()
      }
      const brushed = new THREE.CanvasTexture(brushedCanvas)
      brushed.wrapS = THREE.RepeatWrapping
      brushed.wrapT = THREE.RepeatWrapping
      brushed.repeat.set(3, 2)
      brushed.colorSpace = THREE.SRGBColorSpace

      return {
      yellow: new THREE.MeshPhysicalMaterial({ color: '#d98a08', metalness: 0.86, roughness: 0.2, clearcoat: 1, clearcoatRoughness: 0.12, envMapIntensity: 1.35 }),
      yellowDark: new THREE.MeshPhysicalMaterial({ color: '#8e5700', metalness: 0.9, roughness: 0.27, clearcoat: 0.8, clearcoatRoughness: 0.16, envMapIntensity: 1.2 }),
      black: new THREE.MeshPhysicalMaterial({ color: '#07090c', map: carbon, metalness: 0.78, roughness: 0.2, clearcoat: 1, clearcoatRoughness: 0.1, envMapIntensity: 1.4 }),
      steel: new THREE.MeshPhysicalMaterial({ color: '#9aa1a8', map: brushed, metalness: 1, roughness: 0.22, clearcoat: 0.45, clearcoatRoughness: 0.2, envMapIntensity: 1.45 }),
      chrome: new THREE.MeshPhysicalMaterial({ color: '#e4e9ee', map: brushed, metalness: 1, roughness: 0.1, clearcoat: 0.7, clearcoatRoughness: 0.12, envMapIntensity: 1.8 }),
      eye: new THREE.MeshPhysicalMaterial({ color: '#020305', metalness: 0.96, roughness: 0.035, clearcoat: 1, clearcoatRoughness: 0.02, envMapIntensity: 2.2 }),
      glow: new THREE.MeshStandardMaterial({ color: '#ffd400', emissive: '#ff9b00', emissiveIntensity: 3.4, toneMapped: false }),
      navy: new THREE.MeshPhysicalMaterial({ color: '#101e32', metalness: 0.8, roughness: 0.3, clearcoat: 0.65, envMapIntensity: 1.2 }),
      wing: new THREE.MeshPhysicalMaterial({ color: '#aab5ba', metalness: 0.22, roughness: 0.24, transmission: 0.35, thickness: 0.012, transparent: true, opacity: 0.56, side: THREE.DoubleSide, depthWrite: false }),
      }
    },
    []
  )

/* ---------- Antenna (segmented tube with rings) ---------- */
function Antenna({ pts, m, rings = 18, radius = 0.045 }) {
  const curve = useMemo(() => new THREE.CatmullRomCurve3(pts.map((p) => new THREE.Vector3(...p))), [pts])
  const items = useMemo(
    () =>
      Array.from({ length: rings }, (_, i) => {
        const t = (i + 0.5) / rings
        const p = curve.getPoint(t)
        const tan = curve.getTangent(t)
        const q = new THREE.Quaternion().setFromUnitVectors(new THREE.Vector3(0, 0, 1), tan)
        return { p, q }
      }),
    [curve, rings]
  )
  const end = curve.getPoint(1)
  return (
    <group>
      <mesh material={m.black}>
        <tubeGeometry args={[curve, 48, radius, 8, false]} />
      </mesh>
      {items.map((it, i) => (
        <mesh key={i} position={it.p} quaternion={it.q} material={i % 2 ? m.navy : m.yellowDark}>
          <torusGeometry args={[radius * 1.25, 0.014, 6, 14]} />
        </mesh>
      ))}
      <mesh position={end} material={m.yellowDark}>
        <sphereGeometry args={[radius * 1.4, 12, 12]} />
      </mesh>
    </group>
  )
}

/* ---------- Spring coil ---------- */
function Spring({ m, h = 0.25, r = 0.07, turns = 6 }) {
  return (
    <group>
      {Array.from({ length: turns }, (_, i) => (
        <mesh key={i} position={[0, -(i / (turns - 1)) * h, 0]} rotation={[Math.PI / 2, 0, 0]} material={m.steel}>
          <torusGeometry args={[r, 0.014, 6, 14]} />
        </mesh>
      ))}
    </group>
  )
}

/* ---------- Leg ---------- */
function Leg({ m, pos, side, fwd, spread = 0.55, phase = 0 }) {
  const root = useRef()
  const knee = useRef()
  useFrame(({ clock }) => {
    const t = clock.elapsedTime
    if (root.current) root.current.rotation.x = fwd + Math.sin(t * 1.4 + phase) * 0.05
    if (knee.current) knee.current.rotation.x = Math.sin(t * 1.4 + phase + 1) * 0.06
  })
  return (
    <group position={pos}>
      <group rotation={[0, 0, side * spread]}>
        <group ref={root}>
          <Spring m={m} />
          {/* upper leg */}
          <group position={[0, -0.22, 0]}>
            <mesh position={[0, -0.32, 0]} material={m.yellow}>
              <capsuleGeometry args={[0.15, 0.55, 8, 16]} />
            </mesh>
            {/* armor plate */}
            <mesh position={[side * 0.1, -0.3, 0.06]} rotation={[0, 0, side * 0.1]} material={m.yellowDark}>
              <boxGeometry args={[0.1, 0.4, 0.14]} />
            </mesh>
            <mesh position={[0, -0.12, 0.14]} rotation={[Math.PI / 2, 0, 0]} material={m.chrome}>
              <cylinderGeometry args={[0.06, 0.06, 0.05, 16]} />
            </mesh>
            {/* knee */}
            <group position={[0, -0.72, 0]}>
              <mesh material={m.steel}>
                <sphereGeometry args={[0.13, 16, 16]} />
              </mesh>
              <group ref={knee} rotation={[0, 0, -side * 0.55]}>
                <mesh position={[0, -0.32, 0]} material={m.black}>
                  <cylinderGeometry args={[0.1, 0.08, 0.6, 12]} />
                </mesh>
                {/* yellow trim lines */}
                <mesh position={[0, -0.32, 0.085]} material={m.glow}>
                  <boxGeometry args={[0.025, 0.5, 0.01]} />
                </mesh>
                <mesh position={[0, -0.5, 0]} material={m.yellowDark}>
                  <torusGeometry args={[0.095, 0.02, 8, 16]} />
                </mesh>
                {/* foot + claw */}
                <group position={[0, -0.65, 0]}>
                  <mesh material={m.steel}>
                    <sphereGeometry args={[0.07, 12, 12]} />
                  </mesh>
                  <mesh position={[side * 0.08, -0.12, 0]} rotation={[0, 0, side * 0.9]} material={m.black}>
                    <coneGeometry args={[0.05, 0.28, 8]} />
                  </mesh>
                  <mesh position={[0, -0.12, 0.06]} rotation={[0.5, 0, 0]} material={m.black}>
                    <coneGeometry args={[0.035, 0.2, 8]} />
                  </mesh>
                </group>
              </group>
            </group>
          </group>
        </group>
      </group>
    </group>
  )
}

/* ---------- Wing (translucent, hex veins) ---------- */
function Wing({ m, L = 2.6, W = 0.95 }) {
  const { shape, lines } = useMemo(() => {
    const s = new THREE.Shape()
    s.absellipse(L / 2, 0, L / 2, W / 2, 0, Math.PI * 2, false)
    const h = 0.17
    const dx = 1.5 * h
    const dy = Math.sqrt(3) * h
    const v = []
    for (let col = 0; col * dx < L; col++) {
      for (let row = -8; row < 8; row++) {
        const cx = 0.1 + col * dx
        const cy = row * dy + (col % 2 ? dy / 2 : 0)
        const e = ((cx - L / 2) / (L / 2)) ** 2 + (cy / (W / 2)) ** 2
        if (e > 0.8) continue
        for (let k = 0; k < 6; k++) {
          const a1 = (k * Math.PI) / 3
          const a2 = ((k + 1) * Math.PI) / 3
          v.push(cx + h * Math.cos(a1), cy + h * Math.sin(a1), 0.003, cx + h * Math.cos(a2), cy + h * Math.sin(a2), 0.003)
        }
      }
    }
    const g = new THREE.BufferGeometry()
    g.setAttribute('position', new THREE.Float32BufferAttribute(v, 3))
    return { shape: s, lines: g }
  }, [L, W])

  return (
    <group>
      <mesh material={m.wing}>
        <shapeGeometry args={[shape, 48]} />
      </mesh>
      <lineSegments geometry={lines}>
        <lineBasicMaterial color="#181818" />
      </lineSegments>
      {/* leading-edge spar */}
      <mesh position={[L / 2, 0.02, 0.01]} rotation={[0, 0, 0.04]} material={m.black}>
        <boxGeometry args={[L, 0.05, 0.03]} />
      </mesh>
      <mesh position={[L * 0.5, -W * 0.28, 0.01]} rotation={[0, 0, -0.05]} material={m.yellow}>
        <boxGeometry args={[L * 0.8, 0.018, 0.02]} />
      </mesh>
    </group>
  )
}

/* ---------- Main bee ---------- */
export function BeeRobot(props) {
  const m = useMats()
  const wingR = useRef()
  const wingL = useRef()
  const wingR2 = useRef()
  const wingL2 = useRef()
  const antA = useRef()
  const body = useRef()

  useFrame(({ clock }) => {
    const t = clock.elapsedTime
    const flap = Math.sin(t * 28) * 0.22
    if (wingR.current) wingR.current.rotation.z = 0.55 + flap
    if (wingL.current) wingL.current.rotation.z = 0.55 + flap
    if (wingR2.current) wingR2.current.rotation.z = 0.35 + flap * 0.8
    if (wingL2.current) wingL2.current.rotation.z = 0.35 + flap * 0.8
    if (antA.current) antA.current.rotation.z = Math.sin(t * 1.8) * 0.04
    if (body.current) body.current.rotation.x = Math.sin(t * 1.2) * 0.04
  })

  const abdomen = [
    { z: -1.05, r: 0.92, c: m.yellow },
    { z: -1.42, r: 0.88, c: m.black },
    { z: -1.78, r: 0.8, c: m.yellow },
    { z: -2.12, r: 0.7, c: m.black },
    { z: -2.42, r: 0.56, c: m.yellow },
    { z: -2.68, r: 0.4, c: m.black },
  ]

  return (
    <group {...props}>
      <Float speed={2} rotationIntensity={0.25} floatIntensity={1.2} floatingRange={[-0.15, 0.15]}>
        <group ref={body} position={[0, 0.2, 0]}>
          {/* ===== THORAX ===== */}
          <mesh position={[0, 0.2, 0]} scale={[1.05, 0.95, 1.1]} material={m.yellow}>
            <sphereGeometry args={[0.95, 48, 48]} />
          </mesh>
          {/* top armor plate */}
          <mesh position={[0, 0.82, -0.05]} scale={[0.7, 0.18, 0.8]} material={m.black}>
            <sphereGeometry args={[0.8, 32, 16]} />
          </mesh>
          {/* panel seams */}
          {[-0.35, 0, 0.35].map((z, i) => (
            <mesh key={i} position={[0, 0.2, z]} rotation={[0, 0, 0]} scale={[1.07, 0.97, 1]} material={m.yellowDark}>
              <torusGeometry args={[0.92, 0.012, 6, 64]} />
            </mesh>
          ))}
          {/* bolts */}
          {[[-0.45, 0.78, 0.25], [0.45, 0.78, 0.25], [-0.5, 0.74, -0.35], [0.5, 0.74, -0.35]].map((p, i) => (
            <mesh key={i} position={p} material={m.chrome}>
              <cylinderGeometry args={[0.055, 0.055, 0.04, 16]} />
            </mesh>
          ))}
          {/* chest mechanics */}
          <mesh position={[0, -0.45, 0.2]} rotation={[Math.PI / 2, 0, 0]} material={m.black}>
            <cylinderGeometry args={[0.32, 0.32, 0.5, 24]} />
          </mesh>
          <mesh position={[0, -0.45, 0.46]} rotation={[Math.PI / 2, 0, 0]} material={m.steel}>
            <torusGeometry args={[0.24, 0.04, 10, 28]} />
          </mesh>
          <mesh position={[0, -0.45, 0.47]} rotation={[Math.PI / 2, 0, 0]} material={m.glow}>
            <cylinderGeometry args={[0.1, 0.1, 0.03, 20]} />
          </mesh>
          {/* pipes */}
          {[-0.5, 0.5].map((x, i) => (
            <mesh key={i} position={[x, -0.2, 0.5]} rotation={[0.3, 0, x * 0.4]} material={m.steel}>
              <cylinderGeometry args={[0.04, 0.04, 0.6, 8]} />
            </mesh>
          ))}

          {/* ===== SHOULDER LENS RINGS (wing mounts) ===== */}
          {[1, -1].map((s) => (
            <group key={s} position={[s * 0.86, 0.5, 0.1]} rotation={[0, s * Math.PI / 2 * 0.9, 0]}>
              <mesh material={m.chrome}>
                <torusGeometry args={[0.38, 0.05, 16, 48]} />
              </mesh>
              <mesh position={[0, 0, -0.04]} material={m.yellowDark}>
                <torusGeometry args={[0.3, 0.05, 12, 40]} />
              </mesh>
              <mesh position={[0, 0, -0.08]} rotation={[Math.PI / 2, 0, 0]} material={m.black}>
                <cylinderGeometry args={[0.26, 0.26, 0.12, 32]} />
              </mesh>
              <mesh position={[0, 0, -0.02]} rotation={[Math.PI / 2, 0, 0]} material={m.eye}>
                <cylinderGeometry args={[0.14, 0.14, 0.04, 32]} />
              </mesh>
              <mesh position={[0, 0, 0.0]} rotation={[Math.PI / 2, 0, 0]} material={m.glow}>
                <torusGeometry args={[0.15, 0.012, 8, 32]} />
              </mesh>
            </group>
          ))}

          {/* ===== WINGS ===== */}
          {/* front pair */}
          <group position={[0.7, 0.85, 0.05]} rotation={[0, 0.45, 0]}>
            <group ref={wingR}>
              <Wing m={m} />
            </group>
          </group>
          <group position={[-0.7, 0.85, 0.05]} rotation={[0, Math.PI - 0.45, 0]}>
            <group ref={wingL}>
              <Wing m={m} />
            </group>
          </group>
          {/* hind pair (smaller) */}
          <group position={[0.55, 0.8, -0.3]} rotation={[0, 0.9, 0]} scale={0.65}>
            <group ref={wingR2}>
              <Wing m={m} />
            </group>
          </group>
          <group position={[-0.55, 0.8, -0.3]} rotation={[0, Math.PI - 0.9, 0]} scale={0.65}>
            <group ref={wingL2}>
              <Wing m={m} />
            </group>
          </group>

          {/* ===== ABDOMEN ===== */}
          {abdomen.map((a, i) => (
            <group key={i} position={[0, 0.05 - i * 0.02, a.z]}>
              <mesh scale={[a.r, a.r * 0.92, 0.33]} material={a.c}>
                <sphereGeometry args={[1, 40, 32]} />
              </mesh>
              {i % 2 === 1 && (
                <mesh position={[0, 0, 0.12]} scale={[a.r * 0.98, a.r * 0.9, 1]} material={m.glow}>
                  <torusGeometry args={[1, 0.008, 6, 64]} />
                </mesh>
              )}
            </group>
          ))}
          {/* ribs + connectors */}
          {abdomen.slice(0, -1).map((a, i) => (
            <mesh key={i} position={[0, -0.7 * a.r + 0.05, a.z - 0.18]} rotation={[Math.PI / 2, 0, 0]} material={m.steel}>
              <cylinderGeometry args={[0.35, 0.35, 0.08, 16]} />
            </mesh>
          ))}
          {/* stinger */}
          <mesh position={[0, -0.02, -3.05]} rotation={[-Math.PI / 2, 0, 0]} material={m.black}>
            <coneGeometry args={[0.16, 0.55, 16]} />
          </mesh>

          {/* ===== HEAD ===== */}
          <group position={[0, 0.0, 1.35]}>
            {/* face shell */}
            <mesh scale={[0.85, 0.85, 0.75]} material={m.yellow}>
              <sphereGeometry args={[0.8, 40, 40]} />
            </mesh>
            {/* compound eyes */}
            {[1, -1].map((s) => (
              <mesh key={s} position={[s * 0.5, 0.02, 0.1]} scale={[0.55, 0.78, 0.62]} material={m.eye}>
                <sphereGeometry args={[0.85, 48, 48]} />
              </mesh>
            ))}
            {/* eye rim */}
            {[1, -1].map((s) => (
              <mesh key={s} position={[s * 0.6, 0.02, 0.12]} rotation={[0, s * 1.15, 0]} scale={[0.95, 1.28, 1]} material={m.yellowDark}>
                <torusGeometry args={[0.52, 0.025, 8, 48]} />
              </mesh>
            ))}
            {/* face plate */}
            <mesh position={[0, -0.05, 0.62]} rotation={[0.1, 0, 0]} scale={[0.6, 0.65, 0.2]} material={m.black}>
              <sphereGeometry args={[0.7, 6, 2]} />
            </mesh>
            <mesh position={[0, 0.22, 0.65]} rotation={[0, 0, Math.PI / 6]} material={m.yellowDark}>
              <cylinderGeometry args={[0.18, 0.18, 0.04, 6]} />
            </mesh>
            {/* glowing sensors */}
            {[[-0.2, -0.05], [0.2, -0.05], [-0.14, -0.2], [0.14, -0.2]].map(([x, y], i) => (
              <mesh key={i} position={[x, y, 0.72]} material={m.glow}>
                <sphereGeometry args={[0.04, 12, 12]} />
              </mesh>
            ))}
            {/* ocelli */}
            {[-0.18, 0, 0.18].map((x, i) => (
              <mesh key={i} position={[x, 0.62, 0.35]} material={m.glow}>
                <sphereGeometry args={[0.035, 10, 10]} />
              </mesh>
            ))}
            {/* mandibles */}
            {[1, -1].map((s) => (
              <group key={s} position={[s * 0.18, -0.58, 0.45]} rotation={[0.3, 0, s * 0.35]}>
                <mesh material={m.black}>
                  <coneGeometry args={[0.09, 0.4, 10]} />
                </mesh>
                <mesh position={[0, 0.12, 0]} material={m.steel}>
                  <sphereGeometry args={[0.08, 10, 10]} />
                </mesh>
              </group>
            ))}
            {/* proboscis springs */}
            <group position={[0, -0.55, 0.6]} rotation={[0.2, 0, 0]}>
              <Spring m={m} h={0.3} r={0.06} turns={7} />
            </group>
            {/* antennae */}
            <group ref={antA}>
              <group position={[0.22, 0.7, 0.15]}>
                <Antenna m={m} rings={22} pts={[[0, 0, 0], [0.05, 0.4, 0.05], [0.12, 0.85, 0.0], [0.15, 1.3, -0.1]]} />
              </group>
              <group position={[-0.5, 0.45, 0.35]}>
                <Antenna m={m} rings={26} pts={[[0, 0, 0], [-0.35, 0.2, 0.05], [-0.8, 0.3, 0.0], [-1.3, 0.2, -0.1]]} />
              </group>
              <group position={[0.5, 0.45, 0.35]}>
                <Antenna m={m} rings={26} pts={[[0, 0, 0], [0.35, 0.2, 0.05], [0.8, 0.3, 0.0], [1.3, 0.2, -0.1]]} />
              </group>
              <group position={[-0.3, -0.35, 0.6]}>
                <Antenna m={m} rings={12} radius={0.035} pts={[[0, 0, 0], [-0.3, -0.05, 0.15], [-0.6, -0.2, 0.2]]} />
              </group>
            </group>
          </group>

          {/* ===== LEGS (3 pairs) ===== */}
          {[1, -1].map((s) => (
            <group key={s}>
              <Leg m={m} pos={[s * 0.55, -0.45, 0.65]} side={s} fwd={-0.5} spread={0.5} phase={s} />
              <Leg m={m} pos={[s * 0.6, -0.5, 0.0]} side={s} fwd={0.0} spread={0.7} phase={s + 1} />
              <Leg m={m} pos={[s * 0.55, -0.45, -0.7]} side={s} fwd={0.5} spread={0.5} phase={s + 2} />
            </group>
          ))}
        </group>
      </Float>
    </group>
  )
}

/* ---------- Demo scene (drop-in) ---------- */
export default function BeeScene() {
  return (
    <Canvas camera={{ position: [5, 2.2, 6.5], fov: 38 }} dpr={[1, 2]} gl={{ alpha: true, antialias: true }}>
      <ambientLight intensity={0.5} />
      <directionalLight position={[5, 6, 4]} intensity={2.2} />
      <directionalLight position={[-5, 2, -4]} intensity={1} color="#ffd9a0" />
      <Environment preset="city" />
      <BeeRobot scale={0.9} rotation={[0, -0.6, 0]} />
      <ContactShadows position={[0, -2.6, 0]} opacity={0.35} blur={2.8} scale={10} />
      <OrbitControls enablePan={false} enableZoom={false} />
    </Canvas>
  )
}
