'use client';
import { useEffect, useRef } from 'react';
import { gsap } from 'gsap';

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

    window.addEventListener('mousemove', moveCursor);
    return () => window.removeEventListener('mousemove', moveCursor);
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
