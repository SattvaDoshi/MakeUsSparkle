'use client';

import { useLayoutEffect, useRef } from 'react';

/**
 * Shown under a listing's loading screen. When the shopper is coming Back to a listing they had scrolled down, the
 * loading screen alone is short, so the browser clamps the scroll to the bottom (the footer) and the page only jumps
 * up once the real listing arrives. This keeps the page as tall as the saved scroll position so that never happens.
 */
export default function PlpRestoreSpacer() {
  const ref = useRef<HTMLDivElement>(null);
  useLayoutEffect(() => {
    try {
      const snap = JSON.parse(sessionStorage.getItem(`mus_plp:${window.location.pathname}${window.location.search}`) || 'null');
      if (snap && Date.now() - snap.ts < 30 * 60 * 1000 && ref.current) ref.current.style.height = `${Math.round(snap.y)}px`;
    } catch { /* storage unavailable */ }
  }, []);
  return <div ref={ref} aria-hidden="true" />;
}
