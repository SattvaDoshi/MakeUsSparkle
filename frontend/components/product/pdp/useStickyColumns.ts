import { useEffect, type RefObject } from 'react';

/**
 * Two-column product layouts: whichever column is shorter stays pinned while the taller one scrolls.
 * A column taller than the screen sticks by its bottom edge (negative top) so all of it can be reached.
 * Desktop only (>= 1024px).
 */
export function useStickyColumns(refs: RefObject<HTMLElement | null>[], deps: unknown[] = []) {
  useEffect(() => {
    const cols = refs.map((r) => r.current).filter(Boolean) as HTMLElement[];
    if (cols.length === 0) return;
    const apply = () => {
      cols.forEach((el) => {
        if (window.innerWidth < 1024) { el.style.position = ''; el.style.top = ''; return; }
        el.style.position = 'sticky';
        el.style.top = `${Math.min(96, window.innerHeight - el.offsetHeight - 24)}px`;
      });
    };
    apply();
    const ro = new ResizeObserver(apply);
    cols.forEach((el) => ro.observe(el));
    window.addEventListener('resize', apply);
    return () => { ro.disconnect(); window.removeEventListener('resize', apply); };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps);
}
