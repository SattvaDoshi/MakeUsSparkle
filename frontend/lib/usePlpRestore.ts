'use client';

import { useEffect, useLayoutEffect, useRef, useState, type CSSProperties } from 'react';

/**
 * Back-to-listing restore, shared by every page that lists products.
 *
 * A listing remembers its state (filters, sort, loaded count... whatever the page passes) plus the scroll position in
 * sessionStorage when a product is opened, so Back puts the shopper exactly where they were. Clicking any other
 * internal link (menu, logo, category...) forgets it, so a fresh visit always starts at the top. `mounted` stays false
 * for the very first render of a page load, which is the hydration render and must match the server.
 */
export type PlpSnapshot<S extends object> = S & { y: number; ts: number };

const PREFIX = 'mus_plp:';
const MAX_AGE = 30 * 60 * 1000;
// Links that open a product page (regular pieces and charm pieces).
const PDP_HREF = /^\/(products|custom-charm)\//;
// Ctrl/Cmd/Shift/middle clicks and target=_blank open elsewhere: this page stays as it is.
const staysHere = (e: MouseEvent, a: Element) =>
  e.defaultPrevented ? false : !(e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey || (a.getAttribute('target') || '') === '_blank');
const keyFor = () => `${PREFIX}${window.location.pathname}${window.location.search}`;
let mounted = false;

if (typeof window !== 'undefined') {
  document.addEventListener('click', (e) => {
    const a = (e.target as Element | null)?.closest?.('a[href]');
    if (!a || !staysHere(e, a)) return;
    const href = a.getAttribute('href') || '';
    if (PDP_HREF.test(href) || !href.startsWith('/')) return; // product pages keep it; #, tel:, mailto:, external don't leave
    document.documentElement.style.removeProperty('scroll-behavior'); // never leave smooth scrolling switched off
    try {
      Object.keys(sessionStorage).filter((k) => k.startsWith(PREFIX)).forEach((k) => sessionStorage.removeItem(k));
    } catch { /* storage unavailable */ }
  }, true);
}

/** The saved state for this URL, or null (first render of a page load, nothing saved, or too old). Use as a lazy useState initialiser. */
export function readPlpSnapshot<S extends object>(): PlpSnapshot<S> | null {
  if (typeof window === 'undefined' || !mounted) return null;
  return readStored<S>();
}

function readStored<S extends object>(): PlpSnapshot<S> | null {
  try {
    const snap: PlpSnapshot<S> | null = JSON.parse(sessionStorage.getItem(keyFor()) || 'null');
    return snap && Date.now() - snap.ts < MAX_AGE ? snap : null;
  } catch { return null; }
}

/**
 * @param snap   what readPlpSnapshot() returned for this visit
 * @param state  the current state to save alongside the scroll position
 * @param ready  true once the cards are on screen (restore waits for it)
 * @param onLateRestore  called once after a full page load that was reached with Back/Forward (phones often reload the
 *        page instead of keeping it): the first render must match the server, so the saved state is applied afterwards
 *        through this. Pass setters; also update any "filter changed" bookkeeping so it isn't mistaken for a new filter.
 * @returns holdStyle: put it on the element wrapping the cards, so the page keeps its height until `ready`
 *          (otherwise the browser clamps the scroll to the footer and only jumps up once the cards arrive).
 */
export function usePlpRestore<S extends object>(snap: PlpSnapshot<S> | null, state: S, ready: boolean, onLateRestore?: (s: PlpSnapshot<S>) => void) {
  const [late, setLate] = useState<PlpSnapshot<S> | null>(null);
  const onLate = useRef(onLateRestore);
  useLayoutEffect(() => { onLate.current = onLateRestore; });
  const restoreRef = useRef<PlpSnapshot<S> | null>(snap);
  const restoringRef = useRef(!!snap);
  const latest = useRef(state);
  useLayoutEffect(() => { latest.current = state; });

  useEffect(() => {
    let frozen = false;
    let raf = 0;
    let unfreeze: ReturnType<typeof setTimeout> | undefined;
    if (!mounted && !restoreRef.current) {
      const nav = performance.getEntriesByType?.('navigation')?.[0] as PerformanceNavigationTiming | undefined;
      const stored = nav?.type === 'back_forward' ? readStored<S>() : null;
      if (stored) {
        restoreRef.current = stored;
        restoringRef.current = true;
        document.documentElement.style.scrollBehavior = 'auto'; // jump, don't glide (the site scrolls smoothly otherwise)
        setLate(stored);
        onLate.current?.(stored);
      }
    }
    mounted = true;
    if (!restoreRef.current && history.scrollRestoration === 'manual') history.scrollRestoration = 'auto'; // nothing to restore after all
    if (!restoreRef.current) document.documentElement.style.removeProperty('scroll-behavior');
    // Frozen once a link is clicked, because Next resets the scroll to 0 while leaving and that must not overwrite the saved position.
    const save = () => {
      if (frozen || restoringRef.current) return;
      try {
        const s: PlpSnapshot<S> = { ...latest.current, y: window.scrollY, ts: Date.now() };
        sessionStorage.setItem(keyFor(), JSON.stringify(s));
      } catch { /* storage unavailable */ }
    };
    const onScroll = () => { if (!raf) raf = requestAnimationFrame(() => { raf = 0; save(); }); };
    const onClick = (e: MouseEvent) => {
      const a = (e.target as Element | null)?.closest?.('a[href]');
      if (!a || !staysHere(e, a)) return;
      const href = a.getAttribute('href') || '';
      if (!href.startsWith('/')) return;
      if (PDP_HREF.test(href)) {
        save();
        // No smooth glide while leaving or coming back: the browser would record a mid-glide position and then glide
        // from the top on Back. Switched back on once the position is restored (or on the next listing visit).
        document.documentElement.style.scrollBehavior = 'auto';
      } else { try { sessionStorage.removeItem(keyFor()); } catch { /* ignore */ } }
      frozen = true;
      unfreeze = setTimeout(() => { frozen = false; }, 1500);
    };
    window.addEventListener('scroll', onScroll, { passive: true });
    document.addEventListener('click', onClick, true);
    return () => {
      window.removeEventListener('scroll', onScroll);
      document.removeEventListener('click', onClick, true);
      if (raf) cancelAnimationFrame(raf);
      if (unfreeze) clearTimeout(unfreeze);
    };
  }, []);

  // Before the first paint: if the cards are already there (cached catalogue), put the page at the saved spot at once.
  useLayoutEffect(() => {
    const s = restoreRef.current;
    if (s && ready) window.scrollTo({ top: s.y, behavior: 'instant' as ScrollBehavior });
  }, []);

  // Once the cards are on screen, jump back to the saved position. The page uses smooth scrolling and the browser
  // runs its own (smooth, slightly off) restore, so take over: manual restoration, instant jumps, re-checked while
  // images settle, and stopped the moment the shopper scrolls themselves.
  useEffect(() => {
    const s = restoreRef.current;
    if (!s || !ready) return;
    history.scrollRestoration = 'manual';
    const jump = () => window.scrollTo({ top: s.y, behavior: 'instant' as ScrollBehavior });
    let tries = 0;
    let timer: ReturnType<typeof setTimeout> | undefined;
    const stop = () => {
      cancelAnimationFrame(raf);
      if (timer) clearTimeout(timer);
      history.scrollRestoration = 'auto';
      window.removeEventListener('wheel', finish);
      window.removeEventListener('touchstart', finish);
      window.removeEventListener('keydown', finish);
    };
    const finish = () => {
      restoringRef.current = false;
      restoreRef.current = null;
      document.documentElement.style.removeProperty('scroll-behavior');
      stop();
    };
    const step = () => {
      if (Math.abs(window.scrollY - s.y) > 8) jump();
      tries += 1;
      if (tries < 8) timer = setTimeout(step, 150); else finish();
    };
    window.addEventListener('wheel', finish, { passive: true });
    window.addEventListener('touchstart', finish, { passive: true });
    window.addEventListener('keydown', finish);
    const raf = requestAnimationFrame(step);
    return stop;
  }, [ready]);

  const hold = snap ?? late;
  const holdStyle: CSSProperties | undefined = hold && !ready ? { minHeight: `calc(${hold.y}px + 100vh)` } : undefined;
  return { holdStyle, holding: !!holdStyle };
}
