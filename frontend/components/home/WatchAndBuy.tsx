"use client";

import { useCallback, useEffect, useLayoutEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { fetchWatchAndBuy, type CatalogWatchBuyVideo } from "@/lib/catalogApi";
import { useCart } from "@/lib/cartContext";
import { useGender } from "@/lib/genderContext";
import CarouselArrows from "@/components/ui/CarouselArrows";
import styles from "./WatchAndBuy.module.css";

/**
 * Watch & Buy — shoppable vertical videos.
 *
 * Performance model (this section must never slow the homepage):
 *  - Nothing is fetched until the section is ~600px from the viewport.
 *  - The grid renders small poster images only (lazy, async-decoded). No <video>
 *    exists in the DOM until a shopper hovers (desktop) or opens a card.
 *  - Hover previews are skipped on touch, Save-Data, slow connections and
 *    reduced-motion; at most one preview plays at a time.
 *  - The viewer mounts exactly one <video>; neighbours are not preloaded.
 */

const money = (n: number) => `₹${Math.round(n).toLocaleString("en-IN")}`;
const fmtDur = (s: number) => (s > 0 ? `${Math.floor(s / 60)}:${String(Math.round(s % 60)).padStart(2, "0")}` : "");

function canPreview(): boolean {
  if (typeof window === "undefined") return false;
  if (!window.matchMedia("(hover: hover) and (pointer: fine)").matches) return false;
  if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return false;
  const c = (navigator as unknown as { connection?: { saveData?: boolean; effectiveType?: string } }).connection;
  if (c?.saveData || /(^|-)2g$/.test(c?.effectiveType || "")) return false;
  return true;
}

/* ───────────────────────── Card ───────────────────────── */
function VideoCard({ v, onOpen, clone = false }: { v: CatalogWatchBuyVideo; onOpen: () => void; clone?: boolean }) {
  const [previewing, setPreviewing] = useState(false);
  const timer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);
  const p = v.product;
  const thumb = p.mainImage || p.images?.[0] || "";

  const start = () => {
    if (!canPreview()) return;
    clearTimeout(timer.current);
    timer.current = setTimeout(() => setPreviewing(true), 350); // ignore fly-over hovers
  };
  const stop = () => { clearTimeout(timer.current); setPreviewing(false); };
  useEffect(() => () => clearTimeout(timer.current), []);

  return (
    <button
      type="button"
      className={styles.card}
      data-previewing={previewing}
      onClick={onOpen}
      onPointerEnter={start}
      onPointerLeave={stop}
      onFocus={start}
      onBlur={stop}
      aria-label={`Watch video: ${p.name}`}
      aria-hidden={clone || undefined}
      tabIndex={clone ? -1 : undefined}
    >
      {v.poster && (
        // eslint-disable-next-line @next/next/no-img-element
        <img className={styles.poster} src={v.poster} alt="" loading="lazy" decoding="async" width={360} height={640} />
      )}
      {previewing && (
        <video className={styles.preview} src={v.src} poster={v.poster || undefined} muted loop playsInline autoPlay preload="none" />
      )}
      <span className={styles.scrim} />
      <span className={styles.play} aria-hidden="true">
        <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor"><path d="M8 5v14l11-7z" /></svg>
      </span>
      {v.duration > 0 && <span className={styles.dur}>{fmtDur(v.duration)}</span>}
      <span className={styles.mini}>
        {thumb && (
          // eslint-disable-next-line @next/next/no-img-element
          <img className={styles.miniImg} src={thumb} alt="" loading="lazy" decoding="async" />
        )}
        <span className={styles.miniText}>
          <span className={styles.miniName}>{p.name}</span>
          <span className={styles.miniPrice}>
            {money(p.price)}
            {p.originalPrice && p.originalPrice > p.price && <span className={styles.miniWas}>{money(p.originalPrice)}</span>}
          </span>
        </span>
      </span>
    </button>
  );
}

/* ───────────────────────── Viewer ───────────────────────── */
function Viewer({ items, start, onClose }: { items: CatalogWatchBuyVideo[]; start: number; onClose: () => void }) {
  const router = useRouter();
  const { addItem } = useCart();
  const [i, setI] = useState(start);
  const [muted, setMuted] = useState(true);
  const [paused, setPaused] = useState(false);
  const [added, setAdded] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);
  const barRef = useRef<HTMLElement>(null);
  const touchY = useRef<number | null>(null);

  const v = items[i];
  const p = v.product;
  const href = p.href || `/products/${p.sourceId || p.id}`;
  const isOut = (p.stock ?? Infinity) <= 0;
  const needsOptions = Boolean(p.allowCustomization) || (p.sizes?.length ?? 0) > 0 || Boolean(p.perCharmPrice);
  const discount = p.originalPrice && p.originalPrice > p.price ? Math.round(((p.originalPrice - p.price) / p.originalPrice) * 100) : null;
  const thumb = p.mainImage || p.images?.[0] || "";

  const go = useCallback((d: 1 | -1) => setI((n) => Math.min(items.length - 1, Math.max(0, n + d))), [items.length]);

  /* Lock page scroll, Esc / arrow keys */
  useEffect(() => {
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const key = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
      else if (e.key === "ArrowRight" || e.key === "ArrowDown") go(1);
      else if (e.key === "ArrowLeft" || e.key === "ArrowUp") go(-1);
    };
    window.addEventListener("keydown", key);
    return () => { document.body.style.overflow = prev; window.removeEventListener("keydown", key); };
  }, [go, onClose]);

  /* New slide: reset UI state */
  useEffect(() => { setPaused(false); setAdded(false); if (barRef.current) barRef.current.style.width = "0%"; }, [i]);

  /* Warm just the next poster (cheap) — never the next video */
  useEffect(() => {
    const next = items[i + 1];
    if (next?.poster) { const img = new Image(); img.src = next.poster; }
  }, [i, items]);

  const toggle = () => {
    const el = videoRef.current;
    if (!el) return;
    if (el.paused) { void el.play(); setPaused(false); } else { el.pause(); setPaused(true); }
  };

  const onTime = () => {
    const el = videoRef.current;
    if (el && barRef.current && el.duration) barRef.current.style.width = `${(el.currentTime / el.duration) * 100}%`;
  };

  const addToCart = () => {
    if (isOut) return;
    if (needsOptions) { router.push(href); onClose(); return; }
    addItem(
      {
        id: String(p.id), sourceId: p.sourceId ?? String(p.id), name: p.name, price: p.price,
        originalPrice: p.originalPrice ?? null, image: thumb,
        color: p.colors?.[0]?.label ?? "Default", colorHex: p.colors?.[0]?.hex ?? "#000000",
        sku: p.sku ?? `SKU-${p.id}`, href: p.href ?? "", category: p.category,
        categoryId: p.categoryId, subCategoryId: p.subCategoryId, styleId: p.styleId,
      },
      true,
    );
    setAdded(true);
  };

  return createPortal(
    <div className={styles.overlay} role="dialog" aria-modal="true" aria-label={`${p.name} video`} onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}>
      <button type="button" className={`${styles.round} ${styles.navPrev}`} onClick={() => go(-1)} disabled={i === 0} aria-label="Previous video">
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><polyline points="15 18 9 12 15 6" /></svg>
      </button>
      <button type="button" className={`${styles.round} ${styles.navNext}`} onClick={() => go(1)} disabled={i === items.length - 1} aria-label="Next video">
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><polyline points="9 18 15 12 9 6" /></svg>
      </button>

      <div className={styles.dialog}>
        <div
          className={styles.stage}
          onTouchStart={(e) => { touchY.current = e.touches[0].clientY; }}
          onTouchEnd={(e) => {
            if (touchY.current == null) return;
            const dy = touchY.current - e.changedTouches[0].clientY;
            touchY.current = null;
            if (Math.abs(dy) > 60) go(dy > 0 ? 1 : -1);
          }}
        >
          <div className={styles.progress}><i ref={barRef} /></div>
          <video
            key={v.id}
            ref={videoRef}
            className={styles.video}
            src={v.src}
            poster={v.poster || undefined}
            autoPlay
            loop
            muted={muted}
            playsInline
            preload="auto"
            onTimeUpdate={onTime}
          />
          <button type="button" className={styles.stageBtn} onClick={toggle} aria-label={paused ? "Play video" : "Pause video"} />
          {paused && (
            <span className={styles.pausedIcon}><span><svg width="26" height="26" viewBox="0 0 24 24" fill="currentColor"><path d="M8 5v14l11-7z" /></svg></span></span>
          )}
          <button type="button" className={`${styles.round} ${styles.mute}`} onClick={() => setMuted((m) => !m)} aria-label={muted ? "Unmute" : "Mute"}>
            {muted ? (
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5" /><line x1="23" y1="9" x2="17" y2="15" /><line x1="17" y1="9" x2="23" y2="15" /></svg>
            ) : (
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5" /><path d="M15.5 8.5a5 5 0 0 1 0 7" /><path d="M19 5a10 10 0 0 1 0 14" /></svg>
            )}
          </button>
        </div>

        <aside className={styles.panel}>
          <span className={styles.panelEyebrow}>Shop this video</span>
          {thumb && (
            // eslint-disable-next-line @next/next/no-img-element
            <img className={styles.pImg} src={thumb} alt="" />
          )}
          <div className={styles.pInfo}>
            <h3 className={styles.pName}>{p.name}</h3>
            {(p.rating ?? 0) > 0 && (
              <div className={styles.pRating}><b>★</b> {Number(p.rating).toFixed(1)}{p.reviewCount ? ` (${p.reviewCount})` : ""}</div>
            )}
            <div className={styles.pPrice}>
              <strong>{money(p.price)}</strong>
              {p.originalPrice && p.originalPrice > p.price && <s>{money(p.originalPrice)}</s>}
              {discount && <em>{discount}% off</em>}
            </div>
          </div>
          <div className={styles.actions}>
            <button type="button" className={styles.btnPrimary} onClick={addToCart} disabled={isOut}>
              {isOut ? "Sold out" : added ? "Added ✓" : needsOptions ? "Select options" : "Add to cart"}
            </button>
            <Link href={href} className={styles.btnGhost} onClick={onClose}>View details</Link>
          </div>
        </aside>

        <button type="button" className={`${styles.round} ${styles.close}`} onClick={onClose} aria-label="Close video">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"><line x1="6" y1="6" x2="18" y2="18" /><line x1="18" y1="6" x2="6" y2="18" /></svg>
        </button>
      </div>
    </div>,
    document.body,
  );
}

/* ───────────────────────── Section ───────────────────────── */
export default function WatchAndBuy() {
  const sentinel = useRef<HTMLDivElement>(null);
  const trackRef = useRef<HTMLDivElement>(null);
  const [near, setNear] = useState(false);
  const [items, setItems] = useState<CatalogWatchBuyVideo[] | null>(null);
  const [open, setOpen] = useState<number | null>(null);
  /* Infinite loop: 3 identical copies in the track; whenever the shopper drifts into the
     first or last copy we silently jump one copy-width, which looks identical. */
  const [looping, setLooping] = useState(true);
  const setWidth = useRef(0);
  const { gender } = useGender();

  /* Don't touch the network until the shopper scrolls close */
  useEffect(() => {
    const el = sentinel.current;
    if (!el) return;
    const io = new IntersectionObserver(([e]) => { if (e.isIntersecting) { setNear(true); io.disconnect(); } }, { rootMargin: "600px 0px" });
    io.observe(el);
    return () => io.disconnect();
  }, []);

  useEffect(() => {
    if (!near) return;
    let live = true;
    fetchWatchAndBuy(gender).then((r) => live && setItems(r)).catch(() => live && setItems([]));
    return () => { live = false; };
  }, [near, gender]);

  const close = useCallback(() => setOpen(null), []);

  const n = items?.length ?? 0;
  const canLoop = n >= 2 && looping;

  /* Measure one copy's width; if it can't fill the viewport there's nothing to loop. */
  const measure = useCallback(() => {
    const track = trackRef.current;
    if (!track || n < 2) return;
    const kids = track.children;
    if (kids.length < n * 3) return;
    const w = (kids[n] as HTMLElement).offsetLeft - (kids[0] as HTMLElement).offsetLeft;
    const prev = setWidth.current;
    setWidth.current = w;
    if (w <= track.clientWidth + 8) { setLooping(false); return; }
    // keep the shopper's place when the card size changes (resize / breakpoint)
    const within = prev > 0 ? ((track.scrollLeft % prev) / prev) * w : 0;
    track.style.scrollSnapType = "none";
    track.scrollLeft = w + within;
    requestAnimationFrame(() => { track.style.scrollSnapType = ""; });
  }, [n]);

  useLayoutEffect(() => {
    if (!canLoop) return;
    setWidth.current = 0;
    measure();
    const track = trackRef.current;
    if (!track) return;
    const ro = new ResizeObserver(() => measure());
    ro.observe(track);
    return () => ro.disconnect();
  }, [canLoop, measure]);

  /* Re-centre once scrolling settles (so smooth scrolls / momentum aren't interrupted) */
  useEffect(() => {
    const track = trackRef.current;
    if (!track || !canLoop) return;
    let t: ReturnType<typeof setTimeout> | undefined;
    const settle = () => {
      const w = setWidth.current;
      if (!w) return;
      let x = track.scrollLeft;
      if (x >= w * 2) x -= w;
      else if (x < w) x += w;
      else return;
      track.style.scrollSnapType = "none";
      track.scrollLeft = x;
      requestAnimationFrame(() => { track.style.scrollSnapType = ""; });
    };
    const onScroll = () => { clearTimeout(t); t = setTimeout(settle, 90); };
    track.addEventListener("scroll", onScroll, { passive: true });
    return () => { clearTimeout(t); track.removeEventListener("scroll", onScroll); };
  }, [canLoop, items]);

  if (!near || (items && items.length === 0)) return <div ref={sentinel} aria-hidden="true" />;

  return (
    <section className={styles.section} data-home-section="watch" aria-label="Watch and buy">
      <div className={styles.inner}>
        <div className={styles.header}>
          <div className={styles.titleGroup}>
            <span className={styles.eyebrow}>Shop the look</span>
            <h2 className={styles.title}>Watch <em>&amp;</em> Buy</h2>
          </div>
          {items && items.length > 1 && (
            <div className={styles.controls}><CarouselArrows targetRef={trackRef} label="videos" /></div>
          )}
        </div>

        <div className={styles.trackWrap}>
          <div className={styles.track} ref={trackRef}>
            {items === null
              ? Array.from({ length: 5 }).map((_, k) => <div key={k} className={styles.skel} aria-hidden="true" />)
              : (canLoop ? [0, 1, 2] : [0]).flatMap((copy) =>
                  items.map((v, k) => (
                    <VideoCard key={`${v.id}-${copy}`} v={v} clone={copy !== (canLoop ? 1 : 0)} onOpen={() => setOpen(k)} />
                  )),
                )}
          </div>
        </div>
      </div>

      {open !== null && items && <Viewer items={items} start={open} onClose={close} />}
    </section>
  );
}
