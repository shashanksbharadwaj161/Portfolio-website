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

/** Camera position + look target as a pure function of global progress. */
export function getCamera(p: number): CamState {
  // Scene 0 — drift forward through the dust.
  const s0 = smoothstep(0, 0.34, p);
  const cam0: CamState = {
    pos: [0, lerp(0.7, 0.45, s0), lerp(9, 6.6, s0)],
    target: [0, 0, 0],
  };

  // Scene 1 — slow orbit around the glove.
  const q = localProgress(p, SCENES[1]);
  const ang = lerp(-0.55, 0.5, q);
  const rad = lerp(6.6, 5.3, smoothstep(0, 0.5, q));
  const cam1: CamState = {
    pos: [Math.sin(ang) * rad, lerp(0.45, 0.65, q), Math.cos(ang) * rad],
    target: [0, -0.2, 0],
  };

  const w = smoothstep(0.3, 0.36, p);
  return {
    pos: [lerp(cam0.pos[0], cam1.pos[0], w), lerp(cam0.pos[1], cam1.pos[1], w), lerp(cam0.pos[2], cam1.pos[2], w)],
    target: [
      lerp(cam0.target[0], cam1.target[0], w),
      lerp(cam0.target[1], cam1.target[1], w),
      lerp(cam0.target[2], cam1.target[2], w),
    ],
  };
}

/** 0 → 1 as the solid glove fades in across Scene 1. */
export const gloveReveal = (p: number) => smoothstep(0.3, 0.62, p);
/** 0 → 1 as dust particles travel from the cloud onto the glove surface. */
export const particleMorph = (p: number) => smoothstep(0.28, 0.55, p);
/** 1 → 0 as particles dissolve once the solid glove has taken over. */
export const particleFade = (p: number) => 1 - smoothstep(0.58, 0.85, p);
/** Bloom strength: high in the cold open, settling for the glove reveal. */
export const bloomStrength = (p: number) => lerp(1.15, 0.6, smoothstep(0, 0.4, p));
