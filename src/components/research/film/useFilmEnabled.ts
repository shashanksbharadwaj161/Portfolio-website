'use client';
import { useEffect, useState } from 'react';

// The film runs only on wide viewports with motion allowed. Everywhere else
// (mobile, reduced-motion) the existing static research chapters are the
// experience. Returns false during SSR / first paint so the server renders the
// fallback, then resolves on the client.
const QUERY = '(min-width: 1024px) and (prefers-reduced-motion: no-preference)';

export function useFilmEnabled(): boolean {
  const [enabled, setEnabled] = useState(false);

  useEffect(() => {
    const mq = window.matchMedia(QUERY);
    const update = () => setEnabled(mq.matches);
    update();
    mq.addEventListener('change', update);
    return () => mq.removeEventListener('change', update);
  }, []);

  return enabled;
}
