// Mutable state read every frame by the WebGL scene (no React re-renders).
export const sceneState = {
  scroll: 0, // 0..1 progress through hero
  mouseX: 0, // -1..1
  mouseY: 0,
  theme: 0, // 0 = ink, 1 = paper (lights follow)
  ready: false,
}
