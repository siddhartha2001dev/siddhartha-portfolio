# Siddhartha — Portfolio

React + Vite + GSAP/ScrollTrigger + Lenis + React Three Fiber, styled with Tailwind only.

## Run
```bash
npm install
npm run dev      # development
npm run build    # production build → dist/
```

## Edit your content (no component changes needed)
Everything lives in `src/data/`:
- `siteConfig.js` — name, role, location, email, social links, About copy, contact copy
- `projects.js` — projects (put images in `public/projects/`, e.g. `notesvault.webp`; a typographic frame shows until then)
- `experience.js` — the pinned timeline
- `skills.js` — the typographic skill index

Placeholders to replace: LinkedIn URL (`siteConfig.js`), `public/resume.pdf`, project images, the two placeholder projects.

## Hero sculpture (tech Greek god)
The hero 3D object is a marble bust with cracks that reveal wiring, a fibre-optic neck bundle and a horizontal light beam.
- Base mesh: `public/models/tech-greek-god.glb` (path is `HERO_MODEL` in `src/three/techGod/config.js`). Swap in any bust GLB, then
  adjust `MODEL_PROFILE` (scale, position, eye line, neck landmarks, hairline) in the same file.
- Marble, cracks, glow and beam-spill are one shader (`marbleMaterial.js`); hair curls (`buildHair.js`) and wires (`buildWires.js`)
  are generated from the base mesh. Turn them off in `MODEL_PROFILE.features` if your GLB already has hair/wires.
- Quality tiers (desktop / tablet / mobile) live in `QUALITY` in the config. `prefers-reduced-motion` renders a static composition.
- Base head scan: Lee Perry-Smith (three.js examples), CC BY 3.0 — keep the credit if you keep this mesh.
- `src/three/Monolith.jsx` and `GlbModel.jsx` are the old circular object and are no longer used.

## Notes
- Reduced-motion users get no loader, no pinning, a static scene and a plain experience list.
- Mobile gets a lighter scene (lower DPR, fewer facets) and no custom cursor.
