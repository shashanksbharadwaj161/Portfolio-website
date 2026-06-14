import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

if (typeof window !== 'undefined') {
  gsap.registerPlugin(ScrollTrigger);
}

export const fadeUpOnScroll = (element: string | Element, delay = 0) => {
  return gsap.fromTo(
    element,
    { opacity: 0, y: 60 },
    {
      opacity: 1,
      y: 0,
      duration: 0.8,
      delay,
      ease: 'power3.out',
      scrollTrigger: {
        trigger: element as Element,
        start: 'top 85%',
        toggleActions: 'play none none none',
      },
    }
  );
};

export const staggerFadeUp = (elements: string, stagger = 0.15) => {
  return gsap.fromTo(
    elements,
    { opacity: 0, y: 40 },
    {
      opacity: 1,
      y: 0,
      duration: 0.7,
      stagger,
      ease: 'power3.out',
      scrollTrigger: {
        trigger: elements,
        start: 'top 85%',
        toggleActions: 'play none none none',
      },
    }
  );
};

export const countUp = (element: Element, target: number, suffix = '') => {
  const obj = { val: 0 };
  return gsap.to(obj, {
    val: target,
    duration: 2,
    ease: 'power2.out',
    onUpdate: () => {
      element.textContent = Math.round(obj.val) + suffix;
    },
    scrollTrigger: {
      trigger: element,
      start: 'top 85%',
      toggleActions: 'play none none none',
    },
  });
};
