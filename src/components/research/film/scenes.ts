// ============================================================
// Film scene configuration + the deterministic functions that map
// global scroll progress (0 → 1) to camera, morph, bloom, and per-scene
// visibility. Everything here is a pure function of `progress`, so scrubbing
// back and forth is exact.
//
// NOTE: ranges below are for the CURRENT scaffold (Scenes 0 + 1 only) and
// distribute across the full 700vh container. When Scenes 2–5 are added these
// are re-divided into the final 0–8 / 8–28 / … bands from the brief.
// ============================================================

export interface SceneDef {
  id: number;
  start: number;
  end: number;
}

export const SCENES: SceneDef[] = [
  { id: 0, start: 0.0, end: 0.34 }, // cold open / title
  { id: 1, start: 0.3, end: 1.0 }, // glove materializes
];

export const clamp01 = (x: number) => Math.min(1, Math.max(0, x));
export const lerp = (a: number, b: number, t: number) => a + (b - a) * t;
export function smoothstep(edge0: number, edge1: number, x: number) {
  const t = clamp01((x - edge0) / (edge1 - edge0));
  return t * t * (3 - 2 * t);
}
export function localProgress(p: number, s: SceneDef) {
  return clamp01((p - s.start) / (s.end - s.start));
}

/** Per-scene visibility weights (0 → 1) with a cross-fade in the overlap band. */
export function sceneWeights(p: number): [number, number] {
  return [1 - smoothstep(0.26, 0.36, p), smoothstep(0.3, 0.42, p)];
}

export interface CamState {
  pos: [number, number, number];
  target: [number, number, number];
}

interface CamKey {
  p: number;
  pos: [number, number, number];
  tgt: [number, number, number];
}

// Pulled-back keyframes so the full glove is framed (no cropped fingertips).
// Targets sit slightly left of the glove (~x 0.4–0.5) so it lands right-of-centre
// with the Scene 1 text on the left.
const CAM_KEYS: CamKey[] = [
  { p: 0.0, pos: [0, 0, 17], tgt: [0, 0, 0] }, // cold open — far back
  { p: 0.06, pos: [0, 0, 14], tgt: [0, 0, 0] }, // drift in
  { p: 0.12, pos: [0.8, 0.5, 12.5], tgt: [0.4, 0.1, 0] }, // ease toward glove
  { p: 0.22, pos: [2.6, 0.4, 12], tgt: [0.4, 0.1, 0] }, // gentle orbit right
  { p: 0.32, pos: [0.7, 0.1, 11], tgt: [0.25, 0.0, 0] }, // settle, full glove right-of-centre
  { p: 1.0, pos: [0.7, 0.1, 11], tgt: [0.25, 0.0, 0] }, // hold
];

/** Camera position + look target as a pure function of global progress. */
export function getCamera(p: number): CamState {
  let a = CAM_KEYS[0];
  let b = CAM_KEYS[CAM_KEYS.length - 1];
  for (let i = 0; i < CAM_KEYS.length - 1; i++) {
    if (p >= CAM_KEYS[i].p && p <= CAM_KEYS[i + 1].p) {
      a = CAM_KEYS[i];
      b = CAM_KEYS[i + 1];
      break;
    }
  }
  if (p >= b.p) a = b;
  const t = a === b ? 0 : smoothstep(a.p, b.p, p);
  return {
    pos: [lerp(a.pos[0], b.pos[0], t), lerp(a.pos[1], b.pos[1], t), lerp(a.pos[2], b.pos[2], t)],
    target: [lerp(a.tgt[0], b.tgt[0], t), lerp(a.tgt[1], b.tgt[1], t), lerp(a.tgt[2], b.tgt[2], t)],
  };
}

/** 0 → 1 as the glove dissolves in across Scene 1 (after the dust clears). */
export const gloveReveal = (p: number) => smoothstep(0.26, 0.55, p);
/** 0 → 1 as the teal sensor dots ignite (after the glove has formed). */
export const sensorIgnite = (p: number) => smoothstep(0.55, 0.85, p);
/** 1 → 0 as the cold-open dust fades out before the glove appears. */
export const particleFade = (p: number) => 1 - smoothstep(0.14, 0.28, p);
/** Bloom strength: dramatic cold open, essentially off for the white glove. */
export const bloomStrength = (p: number) => lerp(1.4, 0.15, smoothstep(0.06, 0.16, p));
/** Scene-1 light ramp — lights come up slightly ahead of the fabric reveal. */
export const lightUp = (p: number) => smoothstep(0.14, 0.4, p);
