"use client";

import { useEffect, useRef, useState } from "react";

/** Becomes true (once) when the element is within `margin` of the viewport — used to defer data fetching. */
export function useNearViewport<T extends HTMLElement>(margin = "600px 0px") {
  const ref = useRef<T>(null);
  const [near, setNear] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el || near) return;
    const io = new IntersectionObserver(
      ([e]) => {
        // also fire when we've already scrolled past it (End key, anchor jump, restored scroll position)
        if (e.isIntersecting || e.boundingClientRect.top < 0) { setNear(true); io.disconnect(); }
      },
      { rootMargin: margin },
    );
    io.observe(el);
    return () => io.disconnect();
  }, [margin, near]);

  return [ref, near] as const;
}
