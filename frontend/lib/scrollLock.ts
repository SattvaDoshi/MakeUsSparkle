/**
 * Reference-counted page scroll lock.
 *
 * Several things lock the page at once or in overlap (cart drawer, nav menu, image lightboxes,
 * exit-intent modal). If each sets `body.style.overflow` itself, whichever closes first unlocks
 * the page while another overlay is still open. Every lock here is released on its own and the
 * page only scrolls again when the last one is gone.
 *
 * Usage in an effect:  useEffect(() => lockScroll(), []);   // or  if (open) return lockScroll();
 */
let locks = 0;
let saved = '';

export function lockScroll(): () => void {
  if (typeof document === 'undefined') return () => {};
  if (locks === 0) {
    saved = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
  }
  locks += 1;
  let released = false;
  return () => {
    if (released) return;
    released = true;
    locks = Math.max(0, locks - 1);
    if (locks === 0) document.body.style.overflow = saved;
  };
}
