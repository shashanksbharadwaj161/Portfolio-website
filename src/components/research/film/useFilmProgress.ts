'use client';
import { useEffect, type RefObject } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { filmStore } from './filmStore';

gsap.registerPlugin(ScrollTrigger);

// One ScrollTrigger drives the entire film. It writes normalized progress
// (0 → 1) into the shared store on every scroll update — deterministic, so
// scrubbing backwards replays the film exactly. Lenis already drives
// ScrollTrigger globally (SmoothScroll component), so no extra wiring needed.
export function useFilmProgress(scrollRef: RefObject<HTMLElement>, enabled: boolean) {
  useEffect(() => {
    const el = scrollRef.current;
    if (!enabled || !el) return;

    const st = ScrollTrigger.create({
      trigger: el,
      start: 'top top',
      end: 'bottom bottom',
      onUpdate: (self) => {
        filmStore.progress = self.progress;
      },
    });

    // Recalculate once layout settles (fonts, dynamic canvas mount).
    const refresh = () => ScrollTrigger.refresh();
    const id = window.setTimeout(refresh, 60);

    return () => {
      window.clearTimeout(id);
      st.kill();
    };
  }, [enabled, scrollRef]);
}
