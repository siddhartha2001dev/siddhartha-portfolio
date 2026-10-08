import * as THREE from 'three'
import { MODEL_PROFILE } from './config'

// Shared uniforms: one object drives the marble, the wires and the beam.
export function createTechUniforms() {
  return {
    uTime: { value: 0 },
    uBeamP: { value: new THREE.Vector3(0, 0.5, 0) }, // beam centre (world)
    uBeamD: { value: new THREE.Vector3(1, 0, 0) }, // beam direction (world, unit)
    uBeamI: { value: 1 }, // beam intensity 0..1
    uAxis: { value: new THREE.Vector2(...MODEL_PROFILE.neckAxis) },
  }
}

const NOISE = /* glsl */ `
float ss(float a, float b, float x){ float t = clamp((x - a) / (b - a), 0.0, 1.0); return t * t * (3.0 - 2.0 * t); }
float hash13(vec3 p){ p = fract(p * 0.1031); p += dot(p, p.zyx + 31.32); return fract((p.x + p.y) * p.z); }
float vnoise(vec3 x){
  vec3 i = floor(x), f = fract(x);
  f = f * f * f * (f * (f * 6.0 - 15.0) + 10.0);
  return mix(
    mix(mix(hash13(i), hash13(i + vec3(1,0,0)), f.x), mix(hash13(i + vec3(0,1,0)), hash13(i + vec3(1,1,0)), f.x), f.y),
    mix(mix(hash13(i + vec3(0,0,1)), hash13(i + vec3(1,0,1)), f.x), mix(hash13(i + vec3(0,1,1)), hash13(i + vec3(1,1,1)), f.x), f.y),
    f.z);
}
float fbm(vec3 p){
  float a = 0.5, s = 0.0, t = 0.0;
  for (int i = 0; i < OCT; i++) { s += a * vnoise(p); t += a; p = p * 2.03 + 13.7; a *= 0.5; }
  return s / t;
}
vec3 techColor(float t){
  t = fract(t);
  vec3 red = vec3(1.0, 0.10, 0.04), orange = vec3(1.0, 0.45, 0.06), yellow = vec3(1.0, 0.78, 0.25);
  vec3 cyan = vec3(0.08, 0.85, 1.0), blue = vec3(0.14, 0.38, 1.0), purple = vec3(0.6, 0.2, 1.0);
  vec3 c = red;
  c = mix(c, orange, smoothstep(0.08, 0.2, t));
  c = mix(c, yellow, smoothstep(0.2, 0.28, t) * 0.8);
  c = mix(c, red, smoothstep(0.3, 0.38, t));
  c = mix(c, cyan, smoothstep(0.4, 0.5, t));
  c = mix(c, blue, smoothstep(0.55, 0.65, t));
  c = mix(c, purple, smoothstep(0.7, 0.8, t));
  c = mix(c, red, smoothstep(0.88, 0.98, t));
  return c;
}
vec3 bumpN(vec3 surfPos, vec3 surfNorm, vec2 dHdxy, float faceDir){
  vec3 sx = normalize(dFdx(surfPos)), sy = normalize(dFdy(surfPos));
  vec3 r1 = cross(sy, surfNorm), r2 = cross(surfNorm, sx);
  float det = dot(sx, r1) * faceDir;
  vec3 g = sign(det) * (dHdxy.x * r1 + dHdxy.y * r2);
  return normalize(abs(det) * surfNorm - g);
}
`

const FRAG_PARS = /* glsl */ `
varying vec3 vOP;
varying vec3 vWP;
uniform float uTime;
uniform vec3 uBeamP;
uniform vec3 uBeamD;
uniform float uBeamI;
uniform vec2 uAxis;
${NOISE}
float gCrack = 0.0, gCore = 0.0, gH = 0.0, gNeck = 0.0;
vec3 gGlow = vec3(0.0);
vec3 gBeamSpill = vec3(0.0);
vec3 gMarble = vec3(0.8);
float gRough = 0.5;
`

// Marble + cracks + beam spill, evaluated where diffuseColor is set.
const COLOR_CHUNK = /* glsl */ `
#include <color_fragment>
{
  vec3 mp = vOP;
  float n1 = fbm(mp * 0.85);
  float n2 = fbm(mp * 3.1 + 7.0);
  float grain = vnoise(mp * 16.0);

  // aged ivory → pale grey-green, with thin dark veins
  vec3 ivory = vec3(0.74, 0.74, 0.69);
  vec3 grey = vec3(0.5, 0.59, 0.57);
  vec3 marble = mix(ivory, grey, ss(0.38, 0.66, n1));
  marble *= 0.9 + 0.2 * n2;
  float vein = 1.0 - ss(0.0, 0.07, abs(sin(mp.x * 1.15 + mp.y * 0.75 + n1 * 5.5)));
  marble = mix(marble, vec3(0.34, 0.37, 0.35), vein * 0.32);
  marble *= 0.94 + 0.12 * grain; // weathering

  // ── fractures: two domain-warped iso-line fields; where they cross, cracks branch
  vec3 warp = vec3(fbm(mp * 1.6), fbm(mp * 1.6 + 11.0), fbm(mp * 1.6 + 23.0)) - 0.5;
  vec3 jag = vec3(vnoise(mp * 5.0), vnoise(mp * 5.0 + 9.0), vnoise(mp * 5.0 + 19.0)) - 0.5;
  vec3 wp = mp + warp * 2.6 + jag * 0.45;
  float cn = fbm(wp * 0.95 + 3.0);
  float r1 = abs(cn - 0.5);
  float fw1 = fwidth(cn);
  float m1 = ss(0.55, 0.66, fbm(mp * 0.7 + 5.0)); // only some regions are fractured
  float w1 = 0.016;
  float crack1 = (1.0 - ss(w1 * 0.35, w1 + fw1 * 1.6, r1)) * m1;
  float core1 = (1.0 - ss(0.0, w1 * 0.4 + fw1 * 1.0, r1)) * m1;

  float cn2 = fbm(wp * 2.1 + 40.0);
  float r2 = abs(cn2 - 0.5);
  float fw2 = fwidth(cn2);
  float m2 = ss(0.62, 0.75, fbm(mp * 0.9 + 70.0));
  float w2 = 0.008;
  float crack2 = (1.0 - ss(w2 * 0.35, w2 + fw2 * 1.6, r2)) * m2;

  float crack = max(crack1, crack2 * 0.85);
  float core = core1;
  float crackWide = max(1.0 - ss(0.0, w1 * 3.0 + fw1 * 2.0, r1), 0.0) * m1;

  // dark hollow neck: the ancient shell with the machinery exposed beneath
  vec2 axisD = mp.xz - uAxis;
  float neck = (1.0 - ss(${MODEL_PROFILE.neck.yTop.toFixed(2)} - 0.55, ${MODEL_PROFILE.neck.yTop.toFixed(2)} - 0.1, mp.y))
       * ss(${MODEL_PROFILE.neck.yBottom.toFixed(2)} - 0.35, ${MODEL_PROFILE.neck.yBottom.toFixed(2)} + 0.1, mp.y)
       * (1.0 - ss(${(MODEL_PROFILE.neck.maxRadius - 0.45).toFixed(2)}, ${MODEL_PROFILE.neck.maxRadius.toFixed(2)}, length(axisD)));

  // beam spill (world space): coloured light on nearby marble
  vec2 q = vWP.xy - uBeamP.xy;
  float sd = q.x * uBeamD.y - q.y * uBeamD.x;            // signed distance to the beam line
  float al = dot(q, uBeamD.xy);                           // position along the beam
  float bf = exp(-sd * sd * 11.0) * uBeamI;
  vec3 bcol = mix(vec3(1.0, 0.42, 0.08), vec3(1.0, 0.82, 0.5), exp(-al * al * 0.5));
  bcol = mix(bcol, vec3(0.1, 0.65, 1.0), ss(0.02, 0.32, -sd) * 0.8);

  // where the technology shows through: neck / shoulders / lower face / around the beam
  float region = 0.05 + 1.0 * (1.0 - ss(-1.4, 1.3, mp.y)) + 1.1 * bf;
  float tmask = ss(0.46, 0.6, fbm(mp * 1.1 + 40.0));
  float hue = fbm(mp * 0.9 + 90.0) * 1.7 + mp.y * 0.05;
  float amt = (core * region * (0.15 + tmask * 2.4) + crack * 0.04 * region * tmask) * (1.0 - neck * 0.85);

  vec3 dark = vec3(0.01, 0.01, 0.014);
  marble = mix(marble, marble * 0.55, crackWide * 0.5);                 // soft chipped edge
  marble = mix(marble, dark, clamp(crack * 0.95, 0.0, 1.0));
  marble = mix(marble, marble * 0.07 + vec3(0.006, 0.01, 0.022), neck * 0.97);

  // chest/shoulders sink into shadow: the bust emerges from the dark, and hero copy stays legible
  marble *= mix(0.1, 1.0, ss(-3.1, -1.0, mp.y));
  gMarble = marble;
  gCrack = crack; gCore = core; gNeck = neck;
  gGlow = techColor(hue) * amt * 1.9 + vec3(0.02, 0.06, 0.16) * neck * 0.6;
  gBeamSpill = bcol * bf * (0.16 * marble + vec3(core * 1.6 + crack * 0.4));
  gH = (vnoise(mp * 14.0) - 0.5) * 0.014 + (grain - 0.5) * 0.006 - crackWide * 0.03;
  gRough = clamp(0.5 + (n2 - 0.5) * 0.45 + crack * 0.3 - bf * 0.1, 0.22, 0.95);
  diffuseColor.rgb = marble;
}
`

export function createMarbleMaterial(uniforms, octaves = 4) {
  const mat = new THREE.MeshPhysicalMaterial({
    color: '#ffffff',
    roughness: 0.5,
    metalness: 0,
    sheen: 0.2,
    sheenColor: new THREE.Color('#b9d8cf'),
    sheenRoughness: 0.55,
    envMapIntensity: 1.0,
  })
  mat.userData.uniforms = uniforms
  mat.customProgramCacheKey = () => `marble-${octaves}`
  mat.onBeforeCompile = (shader) => {
    Object.assign(shader.uniforms, uniforms)
    shader.defines = { ...(shader.defines || {}), OCT: octaves }

    shader.vertexShader = shader.vertexShader
      .replace('#include <common>', '#include <common>\nvarying vec3 vOP;\nvarying vec3 vWP;')
      .replace(
        '#include <begin_vertex>',
        `#include <begin_vertex>
        vec4 _p = vec4(transformed, 1.0);
        #ifdef USE_INSTANCING
          _p = instanceMatrix * _p;
        #endif
        vOP = _p.xyz;
        vWP = (modelMatrix * _p).xyz;`,
      )

    shader.fragmentShader = shader.fragmentShader
      .replace('#include <common>', `#include <common>\n${FRAG_PARS}`)
      .replace('#include <color_fragment>', COLOR_CHUNK)
      .replace('#include <roughnessmap_fragment>', '#include <roughnessmap_fragment>\nroughnessFactor = gRough;')
      .replace(
        '#include <normal_fragment_maps>',
        `#include <normal_fragment_maps>
        normal = bumpN(-vViewPosition, normal, vec2(dFdx(gH), dFdy(gH)) * 45.0, faceDirection);`,
      )
      .replace(
        '#include <emissivemap_fragment>',
        '#include <emissivemap_fragment>\ntotalEmissiveRadiance += gGlow + gBeamSpill;',
      )
  }
  return mat
}
