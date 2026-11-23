'use client';

import { useCallback, useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import { cdnImage } from '@/lib/cdn';
import { lockScroll } from '@/lib/scrollLock';

export interface WornPhoto { url: string; caption?: string }

/** "Worn by customers": a swipeable row of real photos, opening a full-screen viewer. Renders nothing when there are no photos. */
export default function PdpWorn({ photos }: { photos?: WornPhoto[] }) {
  const list = (photos || []).filter((p) => p?.url);
  const [open, setOpen] = useState<number | null>(null);
  const close = useCallback(() => setOpen(null), []);
  const step = useCallback((d: number) => setOpen((i) => (i === null ? i : (i + d + list.length) % list.length)), [list.length]);

  useEffect(() => {
    if (open === null) return;
    const unlock = lockScroll();
    const key = (e: KeyboardEvent) => {
      if (e.key === 'Escape') close();
      if (e.key === 'ArrowRight') step(1);
      if (e.key === 'ArrowLeft') step(-1);
    };
    document.addEventListener('keydown', key);
    return () => { unlock(); document.removeEventListener('keydown', key); };
  }, [open, close, step]);

  if (list.length === 0) return null;
  const cur = open === null ? null : list[open];

  return (
    <section className="pw" aria-label="Worn by customers">
      <style>{`
        .pw{max-width:1280px;margin:0 auto;padding:36px 20px 8px;font-family:'Jost',sans-serif}
        .pw h2{margin:0 0 4px;font-family:'Cormorant Garamond',serif;font-size:28px;font-weight:500;color:#1a1a14}
        .pw h2 em{font-style:italic;color:#2a4736}
        .pw-sub{margin:0 0 16px;font-size:13.5px;color:#6f6f64}
        .pw-row{display:flex;gap:12px;overflow-x:auto;scroll-snap-type:x mandatory;padding-bottom:6px;scrollbar-width:none;-webkit-overflow-scrolling:touch}
        .pw-row::-webkit-scrollbar{display:none}
        .pw-tile{all:unset;box-sizing:border-box;flex:0 0 auto;width:200px;scroll-snap-align:start;cursor:pointer;display:flex;flex-direction:column;gap:8px}
        .pw-tile:focus-visible{outline:2px solid #2a4736;outline-offset:3px;border-radius:14px}
        .pw-img{aspect-ratio:4/5;border-radius:14px;overflow:hidden;background:#f1efe6}
        .pw-img img{width:100%;height:100%;object-fit:cover;display:block;transition:transform .35s}
        @media(hover:hover){.pw-tile:hover .pw-img img{transform:scale(1.04)}}
        .pw-cap{font-size:12.5px;color:#4a4a40;line-height:1.3;padding:0 2px}
        @media (max-width:767px){.pw{padding:28px 16px 4px}.pw h2{font-size:24px}.pw-tile{width:156px}}
        .pw-lb{position:fixed;inset:0;z-index:9700;background:rgba(10,12,6,.94);display:flex;align-items:center;justify-content:center;flex-direction:column;gap:12px;padding:20px}
        .pw-lb img{max-width:min(92vw,720px);max-height:78vh;object-fit:contain;border-radius:10px}
        .pw-lb-cap{color:#f1efe6;font-size:14px;min-height:20px;text-align:center}
        .pw-x,.pw-nav{all:unset;box-sizing:border-box;position:absolute;width:44px;height:44px;border-radius:50%;background:rgba(255,255,255,.14);color:#fff;display:flex;align-items:center;justify-content:center;cursor:pointer}
        @media(hover:hover){.pw-x:hover, .pw-nav:hover{background:rgba(255,255,255,.26)}}
        .pw-x:focus-visible,.pw-nav:focus-visible{outline:2px solid #fff}
        .pw-x{top:16px;right:16px}.pw-prev{left:16px;top:50%}.pw-next{right:16px;top:50%}
        .pw-count{position:absolute;top:24px;left:20px;color:#d8d6c8;font-size:12.5px;letter-spacing:.08em}
      `}</style>
      <h2>Worn by <em>customers</em></h2>
      <p className="pw-sub">Real photos from people who own it.</p>
      <div className="pw-row">
        {list.map((p, i) => (
          <button key={p.url + i} type="button" className="pw-tile" onClick={() => setOpen(i)} aria-label={`Open customer photo ${i + 1} of ${list.length}`}>
            <span className="pw-img">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={cdnImage(p.url, 500)} alt={p.caption || `Customer photo ${i + 1}`} loading="lazy" />
            </span>
            {p.caption && <span className="pw-cap">{p.caption}</span>}
          </button>
        ))}
      </div>

      {cur && open !== null && typeof document !== 'undefined' && createPortal(
        <div className="pw-lb" role="dialog" aria-modal="true" aria-label="Customer photo" onClick={(e) => { if (e.target === e.currentTarget) close(); }}>
          <span className="pw-count">{open + 1} / {list.length}</span>
          <button type="button" className="pw-x" onClick={close} aria-label="Close"><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" /></svg></button>
          {list.length > 1 && <button type="button" className="pw-nav pw-prev" onClick={() => step(-1)} aria-label="Previous photo"><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="15 18 9 12 15 6" /></svg></button>}
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={cdnImage(cur.url, 1200)} alt={cur.caption || 'Customer photo'} />
          <div className="pw-lb-cap">{cur.caption}</div>
          {list.length > 1 && <button type="button" className="pw-nav pw-next" onClick={() => step(1)} aria-label="Next photo"><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="9 18 15 12 9 6" /></svg></button>}
        </div>,
        document.body,
      )}
    </section>
  );
}
