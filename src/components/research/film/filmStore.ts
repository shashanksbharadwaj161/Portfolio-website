// Single source of truth for the film's scroll position, shared between the
// DOM-land ScrollTrigger (useFilmProgress) and the WebGL-land R3F components.
// A plain module singleton is intentional: the page is single-instance and this
// avoids threading a ref through the dynamic(ssr:false) Canvas boundary.
export const filmStore = {
  /** Normalized scroll progress across the whole film, 0 → 1. */
  progress: 0,
};
