"use client";

import { useCallback, useEffect, useState, type RefObject } from "react";
import styles from "./CarouselArrows.module.css";

/**
 * Prev / next buttons for a horizontally scrolling track.
 * Pass the ref of the scrolling element; buttons disable at either end and
 * re-measure when the track's size or its children change (async-loaded cards).
 */
export default function CarouselArrows({
  targetRef,
  label = "products",
}: {
  targetRef: RefObject<HTMLElement | null>;
  label?: string;
}) {
  const [canPrev, setCanPrev] = useState(false);
  const [canNext, setCanNext] = useState(false);

  const measure = useCallback(() => {
    const el = targetRef.current;
    if (!el) return;
    setCanPrev(el.scrollLeft > 4);
    setCanNext(el.scrollLeft + el.clientWidth < el.scrollWidth - 4);
  }, [targetRef]);

  useEffect(() => {
    const el = targetRef.current;
    if (!el) return;
    measure();
    el.addEventListener("scroll", measure, { passive: true });
    const ro = new ResizeObserver(measure);
    ro.observe(el);
    const mo = new MutationObserver(measure);
    mo.observe(el, { childList: true });
    return () => {
      el.removeEventListener("scroll", measure);
      ro.disconnect();
      mo.disconnect();
    };
  }, [targetRef, measure]);

  const go = (dir: 1 | -1) => {
    const el = targetRef.current;
    if (!el) return;
    el.scrollBy({ left: dir * Math.max(240, el.clientWidth * 0.8), behavior: "smooth" });
  };

  return (
    <div className={styles.wrap}>
      <button type="button" className={styles.btn} onClick={() => go(-1)} disabled={!canPrev} aria-label={`Previous ${label}`}>
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><polyline points="15 18 9 12 15 6" /></svg>
      </button>
      <button type="button" className={styles.btn} onClick={() => go(1)} disabled={!canNext} aria-label={`Next ${label}`}>
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><polyline points="9 18 15 12 9 6" /></svg>
      </button>
    </div>
  );
}
