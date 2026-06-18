'use client';
import { useRef } from 'react';
import dynamic from 'next/dynamic';
import ResearchChapters from '@/components/research/ResearchChapters';
import ResearchOverlay from '@/components/research/film/ResearchOverlay';
import { useFilmEnabled } from '@/components/research/film/useFilmEnabled';
import { useFilmProgress } from '@/components/research/film/useFilmProgress';
import '@/styles/research-film.css';

// The persistent WebGL film canvas — code-split and client-only.
const ResearchFilm = dynamic(() => import('@/components/research/film/ResearchFilm'), { ssr: false });

export default function ResearchPage() {
  const filmEnabled = useFilmEnabled();
  const scrollRef = useRef<HTMLDivElement>(null);
  useFilmProgress(scrollRef, filmEnabled);

  return (
    <>
      {/* ── The film (desktop + motion). Overlay text is SSR'd for SEO; the
           canvas is client-only; the spacer provides the scroll length. ── */}
      <div className="research-film" aria-hidden={!filmEnabled}>
        {filmEnabled && <ResearchFilm />}
        <ResearchOverlay enabled={filmEnabled} />
        <div ref={scrollRef} className="film-scroll-spacer" />
      </div>

      {/* ── Fallback: the original chapters (mobile / reduced-motion). SSR'd for
           SEO; its effects + heavy 3D stay dormant while the film is active. ── */}
      <div className="research-fallback">
        <ResearchChapters active={!filmEnabled} />
      </div>
    </>
  );
}
