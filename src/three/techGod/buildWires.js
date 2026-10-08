import * as THREE from 'three'
import { MeshBVH } from 'three-mesh-bvh'
import { MODEL_PROFILE, TECH_COLORS } from './config'

function rng(seed) {
  let s = seed >>> 0
  return () => {
    s = (s + 0x6d2b79f5) >>> 0
    let t = s
    t = Math.imul(t ^ (t >>> 15), t | 1)
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61)
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}

const palette = TECH_COLORS.map((t) => ({ color: new THREE.Color(t.c), w: t.w }))
function pickColor(r) {
  let acc = 0
  for (const p of palette) {
    acc += p.w
    if (r <= acc) return p.color
  }
  return palette[0].color
}

const VERT = /* glsl */ `
attribute vec3 aColor;
attribute float aT;
attribute float aPh;
varying vec3 vC;
varying float vPulse;
varying vec3 vWP;
uniform float uTime;
void main(){
  vC = aColor;
  vPulse = 0.5 + 0.5 * sin(aT * 16.0 - uTime * 2.4 + aPh);
  vec4 wp = modelMatrix * vec4(position, 1.0);
  vWP = wp.xyz;
  gl_Position = projectionMatrix * viewMatrix * wp;
}
`
const FRAG = /* glsl */ `
varying vec3 vC;
varying float vPulse;
varying vec3 vWP;
uniform vec3 uBeamP;
uniform vec3 uBeamD;
uniform float uBeamI;
void main(){
  vec2 q = vWP.xy - uBeamP.xy;
  float sd = q.x * uBeamD.y - q.y * uBeamD.x;
  float bf = exp(-sd * sd * 9.0) * uBeamI;
  vec3 col = vC * (0.5 + 1.15 * vPulse + 1.6 * bf);
  gl_FragColor = vec4(col, 1.0);
  #include <colorspace_fragment>
}
`

/**
 * Fibre-optic bundle that hugs the neck and spills over the shoulders.
 * Strands are ray-cast onto the real mesh so they follow the anatomy.
 */
export function buildWires(geometry, uniforms, quality) {
  const { neckAxis, neck } = MODEL_PROFILE
  const bvh = new MeshBVH(geometry)
  const rand = rng(21)
  const ray = new THREE.Ray()
  const origin = new THREE.Vector3()
  const dir = new THREE.Vector3()

  const surface = (phi, y) => {
    const s = Math.sin(phi)
    const c = Math.cos(phi)
    origin.set(neckAxis[0] + s * 8, y, neckAxis[1] + c * 8)
    dir.set(-s, 0, -c)
    ray.set(origin, dir)
    const hit = bvh.raycastFirst(ray, THREE.DoubleSide)
    return hit ? { p: hit.point.clone(), n: hit.face.normal.clone() } : null
  }

  const positions = []
  const colors = []
  const ts = []
  const phs = []
  const indices = []
  const SIDES = 4
  const T = new THREE.Vector3()
  const N = new THREE.Vector3()
  const B = new THREE.Vector3()
  const up = new THREE.Vector3(0, 1, 0)
  const alt = new THREE.Vector3(1, 0, 0)

  let vBase = 0
  for (let s = 0; s < quality.wires; s++) {
    // bias to the side of the neck the camera sees (front ± ~140°)
    const phi0 = (rand() - 0.5) * 2 * (rand() < 0.1 ? 2.5 : 1.9)
    const shoulder = rand() < 0.1 // a few strands run on over the chest / shoulders
    const yb = shoulder ? neck.yBottom - 0.3 - rand() * 0.5 : neck.yBottom + (rand() - 0.2) * 0.35
    const yt = neck.yTop - 0.05 - rand() * (shoulder ? 1.1 : 0.7)
    const twist = (rand() - 0.5) * (shoulder ? 0.9 : 0.6)
    const wob = 0.07 + rand() * 0.12
    const seed = rand() * 10
    const lift = 0.012 + rand() * 0.03

    const pts = []
    const K = 9
    for (let k = 0; k <= K; k++) {
      const t = k / K
      const y = yb + (yt - yb) * t
      const phi = phi0 + twist * t + (Math.sin(t * 9 + seed) * 0.6 + Math.sin(t * 4 + seed * 2) * 0.4) * wob
      const hit = surface(phi, y)
      if (!hit) continue
      pts.push(hit.p.addScaledVector(hit.n, lift + Math.sin(t * 5 + seed) * 0.01))
    }
    if (pts.length < 4) continue
    const curve = new THREE.CatmullRomCurve3(pts, false, 'catmullrom', 0.5)
    const samples = curve.getSpacedPoints(quality.wireSegs)

    const col = pickColor(rand())
    const jitter = 0.85 + rand() * 0.3
    const r0 = 0.0045 + Math.pow(rand(), 3) * 0.02
    const ph = rand() * 6.28

    for (let i = 0; i < samples.length; i++) {
      const t = i / (samples.length - 1)
      const a = samples[Math.max(0, i - 1)]
      const b = samples[Math.min(samples.length - 1, i + 1)]
      T.subVectors(b, a).normalize()
      N.crossVectors(T, Math.abs(T.dot(up)) < 0.9 ? up : alt).normalize()
      B.crossVectors(T, N).normalize()
      const r = r0 * (0.55 + 0.45 * Math.sin(Math.PI * t))
      for (let sd = 0; sd < SIDES; sd++) {
        const ang = (sd / SIDES) * Math.PI * 2
        positions.push(
          samples[i].x + (N.x * Math.cos(ang) + B.x * Math.sin(ang)) * r,
          samples[i].y + (N.y * Math.cos(ang) + B.y * Math.sin(ang)) * r,
          samples[i].z + (N.z * Math.cos(ang) + B.z * Math.sin(ang)) * r,
        )
        colors.push(col.r * jitter, col.g * jitter, col.b * jitter)
        ts.push(t)
        phs.push(ph)
      }
    }
    for (let i = 0; i < samples.length - 1; i++) {
      for (let sd = 0; sd < SIDES; sd++) {
        const a = vBase + i * SIDES + sd
        const b = vBase + i * SIDES + ((sd + 1) % SIDES)
        const c = vBase + (i + 1) * SIDES + sd
        const d = vBase + (i + 1) * SIDES + ((sd + 1) % SIDES)
        indices.push(a, c, b, b, c, d)
      }
    }
    vBase += samples.length * SIDES
  }

  const geo = new THREE.BufferGeometry()
  geo.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3))
  geo.setAttribute('aColor', new THREE.Float32BufferAttribute(colors, 3))
  geo.setAttribute('aT', new THREE.Float32BufferAttribute(ts, 1))
  geo.setAttribute('aPh', new THREE.Float32BufferAttribute(phs, 1))
  geo.setIndex(indices)
  geo.computeBoundingSphere()

  const mat = new THREE.ShaderMaterial({
    vertexShader: VERT,
    fragmentShader: FRAG,
    uniforms: { uTime: uniforms.uTime, uBeamP: uniforms.uBeamP, uBeamD: uniforms.uBeamD, uBeamI: uniforms.uBeamI },
    side: THREE.DoubleSide,
  })
  const mesh = new THREE.Mesh(geo, mat)
  mesh.frustumCulled = false
  return {
    mesh,
    dispose: () => {
      geo.dispose()
      mat.dispose()
    },
  }
}
