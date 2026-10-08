// ─────────────────────────────────────────────────────────────
// Tech Greek god — single place to swap the base sculpture.
//
// Drop a new GLB at public/models/tech-greek-god.glb (or change HERO_MODEL),
// then adjust MODEL_PROFILE landmarks to match it. Everything else
// (marble shader, cracks, wires, hair, beam) is generated on top.
// All landmark values are in the GLB's own units.
// ─────────────────────────────────────────────────────────────
export const HERO_MODEL = '/models/tech-greek-god.glb'

export const MODEL_PROFILE = {
  // Placement in the hero scene (scene units; camera sits at z = 5.6).
  scale: 0.36,
  position: [-0.12, -0.62, 0],
  // Art-directed 3/4 pose, facing viewer's right and slightly down.
  pose: { rotY: 0.38, rotX: 0.05 },

  // Landmarks (model units).
  eyeLine: { y: 1.64, z: 1.9 }, // where the beam crosses
  neckAxis: [-0.1, -0.4], // [x, z] centre line of the neck
  neck: { yTop: -0.2, yBottom: -2.15, maxRadius: 2.3 },

  // Features generated on top of the base mesh. Turn off any the GLB already has.
  features: {
    hair: true, // marble curls over a bald scan
    wires: true, // fibre-optic bundle on the neck / shoulders
  },
  // hairline: the scalp region the curls grow from
  hair: { front: 2.72, side: 2.1, back: 1.0 },
}

// Per-tier budget. Tablet/mobile get less of everything.
export const QUALITY = {
  desktop: { octaves: 4, curls: 520, curlDetail: 2, wires: 260, wireSegs: 26, sparks: 34 },
  tablet: { octaves: 3, curls: 340, curlDetail: 1, wires: 160, wireSegs: 20, sparks: 16 },
  mobile: { octaves: 3, curls: 190, curlDetail: 1, wires: 90, wireSegs: 16, sparks: 8 },
}

// Technology palette (sRGB hex). Reds/oranges dominate, cool colours accent.
export const TECH_COLORS = [
  { c: '#ff2a1a', w: 0.3 },
  { c: '#ff7a1a', w: 0.22 },
  { c: '#2a6bff', w: 0.17 },
  { c: '#19e6ff', w: 0.14 },
  { c: '#9b3bff', w: 0.11 },
  { c: '#ffd34a', w: 0.06 },
]
