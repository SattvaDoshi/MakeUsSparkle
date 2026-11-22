import { useCallback, useEffect, useRef } from 'react';

/**
 * `later(fn, ms, key?)` — setTimeout that is cleaned up when the component unmounts, and that restarts
 * (instead of stacking) when called again with the same key. Fixes the "Added ✓" flags: a second tap
 * used to let the first timer reset the flag early, and timers kept firing after navigating away.
 */
export function useLater() {
  const timers = useRef(new Map<string, number>());
  useEffect(() => {
    const map = timers.current;
    return () => { map.forEach((id) => clearTimeout(id)); map.clear(); };
  }, []);
  return useCallback((fn: () => void, ms: number, key = 'default') => {
    const map = timers.current;
    const prev = map.get(key);
    if (prev !== undefined) clearTimeout(prev);
    map.set(key, window.setTimeout(() => { map.delete(key); fn(); }, ms));
  }, []);
}
