'use client';
import { useCallback, useEffect, useRef } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { gsap } from 'gsap';
import SmoothScroll from '@/components/layout/SmoothScroll';
import NavigationOrbs from '@/components/layout/NavigationOrbs';
import LanguageToggle from '@/components/layout/LanguageToggle';
import { PageTransitionContext, type PageTransitionApi } from './transition-context';

export default function PageTransition({ children }: { children: React.ReactNode }) {
  const overlayRef = useRef<HTMLDivElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);
  const router = useRouter();
  const pathname = usePathname();

  const firstRender = useRef(true);
  const pendingReveal = useRef(false);

  // Reveal / cross-fade once the new route has mounted.
  useEffect(() => {
    const overlay = overlayRef.current;
    const content = contentRef.current;

    if (firstRender.current) {
      firstRender.current = false;
      if (overlay) gsap.set(overlay, { autoAlpha: 0 });
      return;
    }

    // Cross-fade the new page content in (covers language switches too).
    if (content) {
      gsap.fromTo(content, { autoAlpha: 0 }, { autoAlpha: 1, duration: 0.4, ease: 'power2.out' });
    }

    if (overlay) {
      if (pendingReveal.current) {
        // We faded to black before navigating — now lift the curtain.
        pendingReveal.current = false;
        gsap.fromTo(overlay, { autoAlpha: 1 }, { autoAlpha: 0, duration: 0.4, ease: 'power2.inOut' });
      } else {
        // Back/forward or language switch: keep the overlay hidden.
        gsap.set(overlay, { autoAlpha: 0 });
      }
    }
  }, [pathname]);

  const navigate = useCallback<PageTransitionApi['navigate']>(
    (href) => {
      const overlay = overlayRef.current;
      if (!overlay) {
        router.push(href);
        return;
      }
      pendingReveal.current = true;
      gsap.to(overlay, {
        autoAlpha: 1,
        duration: 0.4,
        ease: 'power2.inOut',
        onComplete: () => router.push(href),
      });
    },
    [router]
  );

  const switchLocale = useCallback<PageTransitionApi['switchLocale']>(
    (href) => {
      // Soft cross-fade: fade current content out, then navigate. The mount
      // effect fades the freshly-translated content back in.
      const content = contentRef.current;
      if (!content) {
        router.push(href);
        return;
      }
      gsap.to(content, {
        autoAlpha: 0,
        duration: 0.25,
        ease: 'power2.in',
        onComplete: () => router.push(href),
      });
    },
    [router]
  );

  return (
    <PageTransitionContext.Provider value={{ navigate, switchLocale }}>
      <NavigationOrbs />
      <LanguageToggle />
      <div ref={overlayRef} className="page-transition-overlay" aria-hidden="true" />
      <SmoothScroll>
        <div ref={contentRef}>{children}</div>
      </SmoothScroll>
    </PageTransitionContext.Provider>
  );
}
