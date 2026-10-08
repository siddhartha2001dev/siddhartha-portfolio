import { forwardRef, useMemo } from 'react'
import * as THREE from 'three'
import { useThree } from '@react-three/fiber'

const BEAM_VERT = /* glsl */ `
varying vec2 vUv;
void main(){ vUv = uv; gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0); }
`
// Thin optical scan: white-hot core, orange/red body, chromatic fringes, tapered tips.
const BEAM_FRAG = /* glsl */ `
varying vec2 vUv;
uniform float uTime;
uniform float uBeamI;
float prof(float y, float th){ float k = y / th; return exp(-k * k); }
float h11(float x){ return fract(sin(x * 127.1) * 43758.5453); }
float n11(float x){ float i = floor(x), f = fract(x); f = f * f * (3.0 - 2.0 * f); return mix(h11(i), h11(i + 1.0), f); }
void main(){
  float x = (vUv.x - 0.5) * 2.0;
  float y = (vUv.y - 0.5) * 1.2;
  float ax = abs(x);
  float len = pow(max(1.0 - ax, 0.0), 1.6);
  float th = mix(0.0008, 0.0052, len);
  float disp = 0.004 + 0.010 * ax;

  vec3 tint = mix(vec3(1.0, 0.2, 0.03), vec3(1.0, 0.7, 0.26), pow(len, 1.2));
  vec3 col = tint * prof(y, th) * 1.5;
  col += vec3(1.0, 0.12, 0.05) * prof(y - disp * 1.8, th * 1.5) * 0.55 * len;
  col += vec3(0.08, 0.85, 1.0) * prof(y + disp * 1.9, th * 1.5) * 0.7 * len;
  col += vec3(0.16, 0.34, 1.0) * prof(y + disp * 3.6, th * 2.0) * 0.5 * len;
  col += vec3(1.0) * prof(y, th * 0.5) * 1.5 * pow(len, 1.4);
  col += tint * exp(-abs(y) / (th * 8.0)) * 0.13 * len;                 // halo
  col += vec3(1.0, 0.38, 0.08) * exp(-abs(y) / 0.13) * 0.045 * len * len; // wide glow

  float sh = 0.86 + 0.3 * n11(x * 46.0 + uTime * 1.6);
  float pulse = exp(-pow((x - (fract(uTime * 0.06) * 2.6 - 1.3)) * 2.6, 2.0)) * 0.55;
  col *= sh * (1.0 + pulse) * uBeamI;
  gl_FragColor = vec4(col, clamp(max(col.r, max(col.g, col.b)), 0.0, 1.0));
}
`

const SPARK_VERT = /* glsl */ `
attribute float aSeed;
attribute float aSize;
attribute vec3 aCol;
uniform float uTime;
uniform float uDpr;
uniform float uBeamI;
varying vec3 vC;
varying float vA;
void main(){
  float life = fract(uTime * (0.07 + aSeed * 0.09) + aSeed * 7.0);
  vec3 p = position;
  float dir = aSeed > 0.5 ? 1.0 : -1.0;
  p.y += dir * life * (0.06 + aSeed * 0.2);
  p.x += (aSeed - 0.5) * life * 0.25;
  vA = sin(life * 3.14159); vA *= vA;
  vA *= uBeamI;
  vC = aCol;
  gl_PointSize = aSize * uDpr * (0.4 + vA);
  gl_Position = projectionMatrix * modelViewMatrix * vec4(p, 1.0);
}
`
const SPARK_FRAG = /* glsl */ `
varying vec3 vC;
varying float vA;
void main(){
  float d = length(gl_PointCoord - 0.5) * 2.0;
  float a = smoothstep(1.0, 0.0, d);
  vec3 c = vC * a * vA * 2.2;
  gl_FragColor = vec4(c, clamp(max(c.r, max(c.g, c.b)), 0.0, 1.0));
}
`

/**
 * The beam + a handful of sparks. Placement/tilt is driven from TechGod's frame loop
 * (so it tracks the eyeline); this component only owns the geometry and materials.
 */
export default forwardRef(function LightBeam({ uniforms, sparks, width = 12 }, ref) {
  const dpr = useThree((s) => s.viewport.dpr)

  const beamMat = useMemo(
    () =>
      new THREE.ShaderMaterial({
        vertexShader: BEAM_VERT,
        fragmentShader: BEAM_FRAG,
        uniforms: { uTime: uniforms.uTime, uBeamI: uniforms.uBeamI },
        transparent: true,
        depthTest: false,
        depthWrite: false,
        blending: THREE.CustomBlending,
        blendEquation: THREE.AddEquation,
        blendSrc: THREE.OneFactor,
        blendDst: THREE.OneFactor,
        blendSrcAlpha: THREE.OneFactor,
        blendDstAlpha: THREE.OneFactor,
        toneMapped: false,
      }),
    [uniforms],
  )

  const sparkData = useMemo(() => {
    if (!sparks) return null
    const pos = new Float32Array(sparks * 3)
    const seed = new Float32Array(sparks)
    const size = new Float32Array(sparks)
    const col = new Float32Array(sparks * 3)
    const palette = [
      [1.0, 0.55, 0.15],
      [1.0, 0.85, 0.45],
      [0.2, 0.85, 1.0],
      [1.0, 0.3, 0.1],
    ]
    for (let i = 0; i < sparks; i++) {
      // concentrated toward the centre of the beam, thin vertical scatter
      const g = (Math.random() + Math.random() + Math.random() - 1.5) / 1.5
      pos.set([g * 1.7, (Math.random() - 0.5) * 0.05, 0], i * 3)
      seed[i] = Math.random()
      size[i] = 1.6 + Math.random() * 2.6
      col.set(palette[i % palette.length], i * 3)
    }
    const g = new THREE.BufferGeometry()
    g.setAttribute('position', new THREE.BufferAttribute(pos, 3))
    g.setAttribute('aSeed', new THREE.BufferAttribute(seed, 1))
    g.setAttribute('aSize', new THREE.BufferAttribute(size, 1))
    g.setAttribute('aCol', new THREE.BufferAttribute(col, 3))
    return g
  }, [sparks])

  const sparkMat = useMemo(
    () =>
      new THREE.ShaderMaterial({
        vertexShader: SPARK_VERT,
        fragmentShader: SPARK_FRAG,
        uniforms: { uTime: uniforms.uTime, uBeamI: uniforms.uBeamI, uDpr: { value: dpr } },
        transparent: true,
        depthTest: false,
        depthWrite: false,
        blending: THREE.CustomBlending,
        blendEquation: THREE.AddEquation,
        blendSrc: THREE.OneFactor,
        blendDst: THREE.OneFactor,
        blendSrcAlpha: THREE.OneFactor,
        blendDstAlpha: THREE.OneFactor,
        toneMapped: false,
      }),
    [uniforms, dpr],
  )

  return (
    <group ref={ref} renderOrder={20}>
      <mesh material={beamMat} renderOrder={20} frustumCulled={false}>
        <planeGeometry args={[width, 1.2]} />
      </mesh>
      {sparkData && <points geometry={sparkData} material={sparkMat} renderOrder={21} frustumCulled={false} />}
    </group>
  )
})
