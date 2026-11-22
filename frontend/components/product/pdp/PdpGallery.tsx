'use client';

import { useCallback, useEffect, useRef, useState, type ReactNode } from 'react';
import { createPortal } from 'react-dom';
import { cdnImage } from '@/lib/cdn';
import styles from './pdp.module.css';
import { lockScroll } from '@/lib/scrollLock';

/** Thumbnails + hover-zoom on desktop, swipeable full-width carousel on mobile, fullscreen lightbox on tap/click. */
export default function PdpGallery({
  images, active, onChange, alt, soldOut, chip, wish, fallback,
}: {
  images: string[]; active: number; onChange: (i: number) => void; alt: string;
  soldOut?: boolean; chip?: string; wish?: ReactNode; fallback: string;
}) {
  const list = images.length ? images : [fallback];
  const [lightbox, setLightbox] = useState(false);
  const [shared, setShared] = useState('');
  const share = useCallback(async () => {
    const url = window.location.href;
    const title = document.title;
    try {
      if (navigator.share) { await navigator.share({ title, url }); return; }
      await navigator.clipboard.writeText(url);
      setShared('Link copied');
      setTimeout(() => setShared(''), 1800);
    } catch { /* user dismissed the share sheet */ }
  }, []);
  const shareBtn = (
    <>
      <button type="button" className={styles.shareBtn} onClick={share} aria-label="Share this product">
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><circle cx="18" cy="5" r="3" /><circle cx="6" cy="12" r="3" /><circle cx="18" cy="19" r="3" /><line x1="8.6" y1="13.5" x2="15.4" y2="17.5" /><line x1="15.4" y1="6.5" x2="8.6" y2="10.5" /></svg>
      </button>
      {shared && <span className={styles.shareToast} role="status">{shared}</span>}
    </>
  );
  const [zoom, setZoom] = useState(false);
  const [origin, setOrigin] = useState({ x: 50, y: 50 });
  const trackRef = useRef<HTMLDivElement>(null);
  const fromScroll = useRef(false);
  const tileRefs = useRef<(HTMLButtonElement | null)[]>([]);
  const mounted = useRef(false);
  const safe = Math.min(active, list.length - 1);

  // Keep the mobile carousel in step when the active image changes from elsewhere (thumb, colour pick).
  useEffect(() => {
    const el = trackRef.current;
    if (!el || fromScroll.current) { fromScroll.current = false; return; }
    el.scrollTo({ left: safe * el.clientWidth, behavior: 'smooth' });
  }, [safe]);

  // Only follow the active image once the shopper has interacted; programmatic changes while the
  // page loads (default colour/variant selection) must not scroll the page away from the top.
  const interacted = useRef(false);
  useEffect(() => {
    const on = () => { interacted.current = true; };
    const evs = ['pointerdown', 'keydown', 'touchstart'] as const;
    evs.forEach((e) => window.addEventListener(e, on, { once: true, passive: true }));
    return () => evs.forEach((e) => window.removeEventListener(e, on));
  }, []);

  useEffect(() => {
    if (!mounted.current) { mounted.current = true; return; }
    if (!interacted.current) return;
    if (typeof window !== 'undefined' && window.innerWidth >= 1024 && !lightbox) {
      tileRefs.current[safe]?.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [safe]);

  const onScroll = useCallback(() => {
    const el = trackRef.current;
    if (!el || !el.clientWidth) return;
    const i = Math.round(el.scrollLeft / el.clientWidth);
    if (i !== safe) { fromScroll.current = true; onChange(i); }
  }, [safe, onChange]);

  useEffect(() => { setZoom(false); }, [safe, lightbox]);

  useEffect(() => {
    if (!lightbox) return;
    const key = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setLightbox(false);
      if (e.key === 'ArrowRight') onChange((safe + 1) % list.length);
      if (e.key === 'ArrowLeft') onChange((safe - 1 + list.length) % list.length);
    };
    document.addEventListener('keydown', key);
    const unlock = lockScroll();
    return () => { document.removeEventListener('keydown', key); unlock(); };
  }, [lightbox, safe, list.length, onChange]);

  const onErr = (e: React.SyntheticEvent<HTMLImageElement>) => { if (!e.currentTarget.src.endsWith(fallback)) e.currentTarget.src = fallback; };

  return (
    <div className={styles.wrap}>
      <div className={styles.gallery}>
        {/* Desktop: every image as a square tile in a two-column grid */}
        <div className={`${styles.tiles}${list.length === 1 ? ` ${styles.tilesOne}` : ''}`}>
          {list.map((img, i) => (
            <button key={img + i} type="button" ref={(el) => { tileRefs.current[i] = el; }}
              className={`${styles.tile}${i === 0 ? ` ${styles.tileFirst}` : ''}`}
              onClick={() => { onChange(i); setLightbox(true); }} aria-label={`Open image ${i + 1}`}>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={cdnImage(img, 900)} alt={i === 0 ? alt : `${alt} ${i + 1}`} loading={i === 0 ? 'eager' : 'lazy'} fetchPriority={i === 0 ? 'high' : undefined} onError={onErr} />
              {i === 0 && chip && !soldOut && <span className={styles.chipTL}>{chip}</span>}
              {i === 0 && soldOut && <span className={styles.soldOverlay}><span>Sold out</span></span>}
            </button>
          ))}
          <div className={styles.tileWish}>{wish}{shareBtn}</div>
        </div>

        {/* Mobile carousel */}
        <div className={styles.mobileWrap}>
          <div className={styles.track} ref={trackRef} onScroll={onScroll}>
            {list.map((img, i) => (
              <div key={img + i} className={styles.slide} onClick={() => setLightbox(true)}>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={cdnImage(img, 900)} alt={i === 0 ? alt : `${alt} ${i + 1}`} loading={i === 0 ? 'eager' : 'lazy'} onError={onErr} />
              </div>
            ))}
          </div>
          {chip && !soldOut && <span className={styles.chipTL}>{chip}</span>}
          {soldOut && <div className={styles.soldOverlay}><span>Sold out</span></div>}
          {list.length > 1 && <span className={styles.counter}>{safe + 1} / {list.length}</span>}
          <div className={styles.wrapWish}>{wish}{shareBtn}</div>
          {list.length > 1 && (
            <div className={styles.dots} aria-hidden="true">
              {list.map((_, i) => <span key={i} className={`${styles.dot}${safe === i ? ` ${styles.dotOn}` : ''}`} />)}
            </div>
          )}
        </div>
      </div>

      {lightbox && typeof document !== 'undefined' && createPortal(
        <div className={styles.lightbox} role="dialog" aria-modal="true" aria-label="Product image" onClick={() => setLightbox(false)}>
          <div className={styles.lbStage} onClick={(e) => e.stopPropagation()}
            onMouseMove={(e) => {
              if (!zoom) return;
              const r = e.currentTarget.getBoundingClientRect();
              setOrigin({ x: ((e.clientX - r.left) / r.width) * 100, y: ((e.clientY - r.top) / r.height) * 100 });
            }}>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={cdnImage(list[safe], 1800)} alt={alt}
              className={zoom ? styles.lbZoomed : undefined}
              style={zoom ? { transformOrigin: `${origin.x}% ${origin.y}%` } : undefined}
              onClick={() => setZoom((z) => !z)}
              draggable={false}
            />
          </div>
          <button className={`${styles.lbBtn} ${styles.lbClose}`} aria-label="Close" onClick={() => setLightbox(false)}>×</button>
          <span className={styles.lbHint}>{zoom ? 'Move to pan · click to zoom out' : 'Click image to zoom'}</span>
          {list.length > 1 && <>
            <button className={`${styles.lbBtn} ${styles.lbPrev}`} aria-label="Previous" onClick={(e) => { e.stopPropagation(); onChange((safe - 1 + list.length) % list.length); }}>‹</button>
            <button className={`${styles.lbBtn} ${styles.lbNext}`} aria-label="Next" onClick={(e) => { e.stopPropagation(); onChange((safe + 1) % list.length); }}>›</button>
            <span className={styles.lbCount}>{safe + 1} / {list.length}</span>
          </>}
        </div>,
        document.body,
      )}
    </div>
  );
}
