'use client';
import { createContext, useContext } from 'react';

export interface PageTransitionApi {
  /** Route navigation with a full-screen fade-to-black transition (nav orbs). */
  navigate: (href: string) => void;
  /** Same-route locale switch with a soft content cross-fade (language toggle). */
  switchLocale: (href: string) => void;
}

export const PageTransitionContext = createContext<PageTransitionApi>({
  navigate: () => {},
  switchLocale: () => {},
});

export const usePageTransition = () => useContext(PageTransitionContext);
