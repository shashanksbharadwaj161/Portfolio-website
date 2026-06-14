'use client';
import { useEffect, useRef } from 'react';
import { gsap } from 'gsap';

const INTERACTIVE = 'a, button, [role="button"], input, textarea, select, .nav-orb';

export default function CustomCursor() {
  const cursorRef = useRef<HTMLDivElement>(null);
  const followerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const cursor = cursorRef.current;
    const follower = followerRef.current;
    if (!cursor || !follower) return;

    const moveCursor = (e: MouseEvent) => {
      gsap.to(cursor, { x: e.clientX - 6, y: e.clientY - 6, duration: 0.1 });
      gsap.to(follower, { x: e.clientX - 20, y: e.clientY - 20, duration: 0.3 });
    };

    const isInteractive = (target: EventTarget | null) =>
      target instanceof Element && !!target.closest(INTERACTIVE);

    const handleOver = (e: MouseEvent) => {
      if (isInteractive(e.target)) {
        gsap.to(follower, { scale: 1.8, opacity: 0.25, duration: 0.2 });
        gsap.to(cursor, { scale: 1.4, duration: 0.2 });
      }
    };

    const handleOut = (e: MouseEvent) => {
      if (isInteractive(e.target)) {
        gsap.to(follower, { scale: 1, opacity: 0.5, duration: 0.2 });
        gsap.to(cursor, { scale: 1, duration: 0.2 });
      }
    };

    window.addEventListener('mousemove', moveCursor);
    document.addEventListener('mouseover', handleOver);
    document.addEventListener('mouseout', handleOut);

    return () => {
      window.removeEventListener('mousemove', moveCursor);
      document.removeEventListener('mouseover', handleOver);
      document.removeEventListener('mouseout', handleOut);
    };
  }, []);

  return (
    <>
      <div
        ref={cursorRef}
        className="cursor"
        style={{ position: 'fixed', pointerEvents: 'none', zIndex: 9999 }}
      />
      <div
        ref={followerRef}
        className="cursor-follower"
        style={{ position: 'fixed', pointerEvents: 'none', zIndex: 9998 }}
      />
    </>
  );
}
