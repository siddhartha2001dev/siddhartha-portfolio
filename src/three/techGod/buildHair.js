import * as THREE from 'three'
import { mergeVertices } from 'three/examples/jsm/utils/BufferGeometryUtils.js'
import { MODEL_PROFILE } from './config'

// deterministic PRNG so the sculpture is identical on every load
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
const smooth = (a, b, x) => {
  const t = Math.min(1, Math.max(0, (x - a) / (b - a)))
  return t * t * (3 - 2 * t)
}

// A swirled, flattened lump: reads as a carved marble lock once many overlap.
function makeCurlGeometry(detail) {
  let g = new THREE.IcosahedronGeometry(1, detail + 1)
  g.deleteAttribute('normal')
  g.deleteAttribute('uv')
  g = mergeVertices(g, 1e-4)
  const p = g.attributes.position
  const v = new THREE.Vector3()
  for (let i = 0; i < p.count; i++) {
    v.fromBufferAttribute(p, i)
    const a = Math.atan2(v.y, v.x)
    const rad = Math.hypot(v.x, v.y)
    const ridge = Math.sin(a * 2 - rad * 7 + v.z * 2)
    v.multiplyScalar(1 + 0.17 * ridge)
    // taper one end so locks have a direction
    v.y *= 1 - 0.3 * Math.max(0, v.x)
    p.setXYZ(i, v.x, v.y, v.z)
  }
  g.computeVertexNormals()
  return g
}

/**
 * Marble hair for a bald scan: a thin cap hugging the scalp + instanced curls on top.
 * Returns { group, dispose }.
 */
export function buildHair(geometry, material, quality) {
  const { hair } = MODEL_PROFILE
  const pos = geometry.attributes.position
  const nor = geometry.attributes.normal
  const index = geometry.index
  const n = pos.count

  // head centre for the hairline angle
  geometry.computeBoundingBox()
  const bb = geometry.boundingBox
  const hx = -0.07
  const hz = -0.25
  const masked = new Uint8Array(n)
  const maskedIdx = []
  for (let i = 0; i < n; i++) {
    const x = pos.getX(i)
    const y = pos.getY(i)
    const z = pos.getZ(i)
    const th = Math.abs(Math.atan2(x - hx, z - hz))
    const hairY = hair.front - (hair.front - hair.side) * smooth(0.6, 1.4, th) - (hair.side - hair.back) * smooth(1.8, 2.8, th)
    // only the head: reject shoulders/neck (wide or low)
    if (y > hairY && Math.hypot(x - hx, z - hz) < 2.4 && y < bb.max.y + 0.01) {
      masked[i] = 1
      maskedIdx.push(i)
    }
  }

  // ── scalp cap
  const capPos = new Float32Array(pos.array)
  const OFF = 0.06
  for (const i of maskedIdx) {
    capPos[i * 3] += nor.getX(i) * OFF
    capPos[i * 3 + 1] += nor.getY(i) * OFF
    capPos[i * 3 + 2] += nor.getZ(i) * OFF
  }
  const tris = []
  for (let i = 0; i < index.count; i += 3) {
    const a = index.getX(i)
    const b = index.getX(i + 1)
    const c = index.getX(i + 2)
    if (masked[a] && masked[b] && masked[c]) tris.push(a, b, c)
  }
  const capGeo = new THREE.BufferGeometry()
  capGeo.setAttribute('position', new THREE.BufferAttribute(capPos, 3))
  capGeo.setAttribute('normal', new THREE.BufferAttribute(new Float32Array(nor.array), 3))
  capGeo.setIndex(tris)
  const cap = new THREE.Mesh(capGeo, material)

  // ── curls: rejection-sample the masked vertices for an even spread
  const rand = rng(7)
  const candidates = maskedIdx.slice()
  for (let i = candidates.length - 1; i > 0; i--) {
    const j = Math.floor(rand() * (i + 1))
    ;[candidates[i], candidates[j]] = [candidates[j], candidates[i]]
  }
  let spacing = 0.24
  let chosen = []
  for (let pass = 0; pass < 6 && chosen.length < quality.curls; pass++) {
    chosen = []
    const s2 = spacing * spacing
    for (const idx of candidates) {
      const x = pos.getX(idx)
      const y = pos.getY(idx)
      const z = pos.getZ(idx)
      let ok = true
      for (const c of chosen) {
        const dx = x - c.x
        const dy = y - c.y
        const dz = z - c.z
        if (dx * dx + dy * dy + dz * dz < s2) { ok = false; break }
      }
      if (ok) chosen.push({ idx, x, y, z })
      if (chosen.length >= quality.curls) break
    }
    spacing *= 0.86
  }

  const curlGeo = makeCurlGeometry(quality.curlDetail)
  const inst = new THREE.InstancedMesh(curlGeo, material, chosen.length)
  const m = new THREE.Matrix4()
  const basis = new THREE.Matrix4()
  const q = new THREE.Quaternion()
  const roll = new THREE.Quaternion()
  const nrm = new THREE.Vector3()
  const flow = new THREE.Vector3()
  const xAx = new THREE.Vector3()
  const yAx = new THREE.Vector3()
  const posV = new THREE.Vector3()
  const sc = new THREE.Vector3()
  chosen.forEach((c, k) => {
    nrm.set(nor.getX(c.idx), nor.getY(c.idx), nor.getZ(c.idx)).normalize()
    // locks fall away from the crown: project "down + outward" onto the tangent plane
    flow.set(c.x - hx, -1.2, c.z - hz).normalize()
    flow.addScaledVector(nrm, -flow.dot(nrm))
    if (flow.lengthSq() < 1e-4) flow.set(rand() - 0.5, 0, rand() - 0.5)
    flow.normalize()
    xAx.copy(flow)
    yAx.crossVectors(nrm, xAx).normalize()
    basis.makeBasis(xAx, yAx, nrm)
    q.setFromRotationMatrix(basis)
    roll.setFromAxisAngle(nrm, (rand() - 0.5) * 0.9)
    q.premultiply(roll)
    const s = 0.8 + rand() * 0.45
    sc.set(0.3 * s, 0.2 * s, 0.14 * (0.8 + rand() * 0.5))
    posV.set(c.x, c.y, c.z).addScaledVector(nrm, OFF + 0.035)
    m.compose(posV, q, sc)
    inst.setMatrixAt(k, m)
  })
  inst.instanceMatrix.needsUpdate = true
  inst.computeBoundingSphere()

  const group = new THREE.Group()
  group.add(cap, inst)
  return {
    group,
    dispose: () => {
      capGeo.dispose()
      curlGeo.dispose()
      inst.dispose()
    },
  }
}
