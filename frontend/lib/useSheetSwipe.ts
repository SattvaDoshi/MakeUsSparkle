'use client';

import { useCallback, useRef } from 'react';
import type { PointerEvent as ReactPointerEvent } from 'react';

/**
 * Mobile bottom sheets: drag the grab handle down to dismiss.
 *   const { sheetRef, grabProps } = useSheetSwipe(close);
 *   <div ref={sheetRef} className="my-sheet"> <div className="sheet-grab" {...grabProps}><span/></div> … </div>
 * Only acts at phone width; on larger screens the handle is hidden by CSS and this does nothing.
 */
export function useSheetSwipe(onClose: () => void, maxWidth = 767) {
  const sheetRef = useRef<HTMLElement | null>(null);
  const drag = useRef<{ y: number; t: number } | null>(null);

  const onPointerDown = useCallback((e: ReactPointerEvent<HTMLElement>) => {
    if (!window.matchMedia(`(max-width: ${maxWidth}px)`).matches || !sheetRef.current) return;
    drag.current = { y: e.clientY, t: Date.now() };
    try { e.currentTarget.setPointerCapture(e.pointerId); } catch { /* not all browsers */ }
    sheetRef.current.style.transition = 'none';
  }, [maxWidth]);

  const onPointerMove = useCallback((e: ReactPointerEvent<HTMLElement>) => {
    if (!drag.current || !sheetRef.current) return;
    const dy = Math.max(0, e.clientY - drag.current.y); // never drag upward
    sheetRef.current.style.transform = `translateY(${dy}px)`;
  }, []);

  const finish = useCallback((e: ReactPointerEvent<HTMLElement>) => {
    const start = drag.current;
    const el = sheetRef.current;
    drag.current = null;
    if (!start || !el) return;
    const dy = e.clientY - start.y;
    const speed = dy / Math.max(1, Date.now() - start.t); // px per ms
    el.style.transition = '';
    if (dy > 110 || (speed > 0.6 && dy > 40)) {
      // Fling it away, then let the normal close state take over.
      el.style.transform = 'translateY(100%)';
      onClose();
      window.setTimeout(() => { el.style.transform = ''; }, 500);
    } else {
      el.style.transform = ''; // snap back
    }
  }, [onClose]);

  return {
    sheetRef,
    grabProps: { onPointerDown, onPointerMove, onPointerUp: finish, onPointerCancel: finish },
  };
}

/** Handle styles shared by every sheet. Include once inside the sheet's <style>. */
export const SHEET_GRAB_CSS = `
  .sheet-grab{display:none}
  @media (max-width:767px){
    .sheet-grab{display:flex;justify-content:center;align-items:center;height:26px;flex-shrink:0;touch-action:none;cursor:grab}
    .sheet-grab span{width:42px;height:4px;border-radius:99px;background:rgba(26,31,13,.22)}
  }
`;
