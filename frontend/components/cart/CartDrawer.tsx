'use client';

import Em from "@/components/ui/Em";
import { useRef, useEffect, useState } from 'react';
import Link from 'next/link';
import { useCart } from '@/lib/cartContext';
import { cdnImage } from '@/lib/cdn';
import CartUpsell from '@/components/cart/CartUpsell';
import { fetchCatalogProducts, type CatalogProduct } from '@/lib/catalogApi';

/** Chosen options (colour, size, etc.) saved on a hamper piece, as readable text lines */
function getOptionLines(customData: any): Array<[string, string]> {
  if (!customData) return [];
  const lines: Array<[string, string]> = [];
  const sel = customData.selections as Record<string, string> | undefined;
  if (sel && typeof sel === 'object') {
    Object.entries(sel).forEach(([k, v]) => { if (v) lines.push([k, String(v)]); });
  }
  const alreadyHas = (label: string) => lines.some(([k]) => k.toLowerCase() === label.toLowerCase());
  if (customData.color && !alreadyHas('Colour') && !alreadyHas('Color')) lines.push(['Colour', String(customData.color)]);
  if (customData.size && !alreadyHas('Size')) lines.push(['Size', String(customData.size)]);
  return lines;
}

// ─── Main CartDrawer ──────────────────────────────────────────────────────────
export default function CartDrawer() {
  const { state, closeDrawer, removeItem, updateQty, itemCount, subtotal, total, autoDiscountAmount, appliedOffers, applicableOffers, toggleOfferOptOut } = useCart();
  const { isDrawerOpen, items } = state;
  const overlayRef = useRef<HTMLDivElement>(null);
  const [catalog, setCatalog] = useState<CatalogProduct[]>([]);
  const FREE_SHIP = 999;
  const toFree = Math.max(0, FREE_SHIP - subtotal);
  const shipPct = Math.min(100, Math.round((subtotal / FREE_SHIP) * 100));

  // Load the catalogue once, the first time the drawer opens (it is cached after that)
  useEffect(() => {
    if (!isDrawerOpen || catalog.length) return;
    let live = true;
    fetchCatalogProducts().then((p) => live && setCatalog(p)).catch(() => {});
    return () => { live = false; };
  }, [isDrawerOpen, catalog.length]);

  // Close on Esc
  useEffect(() => {
    if (!isDrawerOpen) return;
    const handler = (e: KeyboardEvent) => { if (e.key === 'Escape') closeDrawer(); };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [isDrawerOpen, closeDrawer]);

  // Lock body scroll
  useEffect(() => {
    document.body.style.overflow = isDrawerOpen ? 'hidden' : '';
    return () => { document.body.style.overflow = ''; };
  }, [isDrawerOpen]);

  return (
    <>
      <style>{`

        :root {
          --beige:     #ffffff;
          --beige-dk:  #ede5d5;
          --beige-dkr: #d9cdb8;
          --olive-900: #1a1f0d;
          --olive-700: #283010;
          --olive-600: #3d4a22;
          --olive-500: #5a6b2e;
          --olive-400: #7a8e3c;
          --olive-50:  #f2f4e8;
          --gold:      #c9a84c;
          --gold-lt:   #eedfa0;
          --ink:       #1e2310;
          --mist:      rgba(30,35,16,.45);
          --mist-lt:   rgba(30,35,16,.35);
          --red:       #c0392b;
          --green:     #2e7d32;
        }

        /* ── Overlay ── */
        .drawer-overlay {
          position: fixed; inset: 0; z-index: 500;
          background: rgba(26,31,13,0); pointer-events: none;
          transition: background .35s ease;
        }
        .drawer-overlay.open {
          background: rgba(26,31,13,.55); pointer-events: all;
        }

        /* ── Panel ── */
        .drawer-panel {
          position: fixed; top: 0; right: 0; bottom: 0;
          width: min(420px, 100vw);
          background: var(--beige);
          display: flex; flex-direction: column;
          transform: translateX(100%);
          transition: transform .4s cubic-bezier(.22,.68,0,1.12);
          z-index: 501;
          box-shadow: -8px 0 48px rgba(26,31,13,.18);
          font-family: 'Jost', sans-serif; color: var(--ink);
        }
        .drawer-overlay.open .drawer-panel { transform: translateX(0); }

        /* ── Header ── */
        .drawer-head {
          display: flex; align-items: center; justify-content: space-between;
          padding: 18px 20px 14px;
          border-bottom: 1px solid rgba(61,74,34,.1); flex-shrink: 0;
        }
        .drawer-head-left { display: flex; align-items: baseline; gap: 10px; }
        .drawer-head-title {
          font-family: 'Cormorant Garamond', serif;
          font-size: 24px; font-weight: 600; letter-spacing: .02em; color: var(--olive-900);
        }
        .drawer-head-count {
          font-size: 11px; letter-spacing: .18em; text-transform: uppercase; color: var(--mist);
        }
        .drawer-close {
          width: 34px; height: 34px; border-radius: 50%;
          border: 1.5px solid var(--beige-dkr); background: white;
          cursor: pointer; display: flex; align-items: center; justify-content: center;
          color: var(--mist); transition: all .2s;
        }
        .drawer-close:hover { border-color: var(--olive-400); color: var(--olive-600); background: var(--olive-50); }

        /* ── Progress wrapper ── */
        .dp-section {
          padding: 16px 20px 20px;
          border-bottom: 1px solid rgba(61,74,34,.08);
          flex-shrink: 0;
          background: white;
        }

        /* ══════════════════
            ITEMS & FOOTER
        ══════════════════ */
        .drawer-items {
          flex: 1; overflow-y: auto; padding: 14px 20px;
          display: flex; flex-direction: column; gap: 12px;
          scrollbar-width: thin; scrollbar-color: var(--beige-dkr) transparent;
        }
        .drawer-items::-webkit-scrollbar { width: 4px; }
        .drawer-items::-webkit-scrollbar-thumb { background: var(--beige-dkr); border-radius: 2px; }

        .di-card {
          display: flex; gap: 14px; background: white; border-radius: 16px;
          padding: 14px; border: 1px solid rgba(201,168,76,.18);
          box-shadow: 0 2px 10px rgba(26,31,13,.03);
          transition: border-color .2s;
        }
        .di-card:hover { border-color: rgba(201,168,76,.35); }
        .di-img {
          width: 78px; height: 78px; border-radius: 12px;
          object-fit: cover; flex-shrink: 0; background: var(--beige-dk);
          border: 1px solid rgba(61,74,34,.08);
        }
        .di-body { flex: 1; min-width: 0; }
        .di-name {
          font-size: 15px; font-weight: 600; color: var(--olive-900);
          margin-bottom: 4px; line-height: 1.35;
          display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical;
          overflow: hidden;
        }
        .di-color {
          display: flex; align-items: center; gap: 5px;
          font-size: 11.5px; color: var(--mist); margin-bottom: 6px;
        }
        .di-color-dot {
          width: 11px; height: 11px; border-radius: 50%;
          border: 1.5px solid rgba(0,0,0,.12); flex-shrink: 0;
        }
        .di-price-row { display: flex; align-items: baseline; gap: 8px; flex-wrap: wrap; margin-top: 3px; }
        .di-price { font-size: 16px; font-weight: 700; color: var(--olive-900); }
        .di-original { font-size: 12px; color: var(--mist); text-decoration: line-through; }
        .di-gift-pill {
          display: inline-flex; align-items: center; gap: 4px;
          font-size: 11px; font-weight: 600; color: #8c6b20;
          background: rgba(201,168,76,0.12);
          border: 1px solid rgba(201,168,76,0.25);
          border-radius: 6px; padding: 2px 7px; margin-top: 5px;
          line-height: 1.3;
        }
        .di-actions {
          display: flex; flex-direction: column;
          align-items: flex-end; justify-content: space-between;
        }
        .di-remove {
          background: none; border: none; cursor: pointer;
          color: var(--mist); font-size: 20px; line-height: 1; padding: 2px 4px;
          transition: color .2s, transform .15s; border-radius: 4px;
        }
        .di-remove:hover { color: var(--red); transform: scale(1.1); }
        .di-qty {
          display: flex; align-items: center;
          border: 1.5px solid var(--beige-dkr); border-radius: 50px; overflow: hidden;
          background: var(--beige);
        }
        .di-qty-btn {
          width: 28px; height: 28px; background: none; border: none;
          font-size: 16px; cursor: pointer; color: var(--olive-600);
          display: flex; align-items: center; justify-content: center;
          transition: background .15s;
        }
        .di-qty-btn:hover { background: var(--olive-50); }
        .di-qty-val {
          min-width: 28px; text-align: center;
          font-size: 12.5px; font-weight: 600; color: var(--ink);
        }

        /* Included item option lines (colour, size…) */
        .di-opt-lines {
          display: flex; flex-direction: column; gap: 2px; margin-top: 3px;
          font-size: 12.5px; color: var(--olive-700);
        }
        .di-opt-lines strong { font-weight: 700; color: var(--olive-900); }

        /* Empty state */
        .drawer-empty {
          flex: 1; display: flex; flex-direction: column;
          align-items: center; justify-content: center; gap: 12px;
          padding: 40px 24px; text-align: center;
        }
        .drawer-empty-icon {
          font-family: 'Cormorant Garamond', serif;
          font-size: 48px; font-style: italic; font-weight: 300;
          color: rgba(61,74,34,.15);
        }
        .drawer-empty-text { font-size: 14px; color: var(--mist); letter-spacing: .06em; }
        .drawer-empty-link {
          font-size: 11px; letter-spacing: .2em; text-transform: uppercase;
          color: var(--olive-600); text-decoration: none; font-weight: 500;
          border-bottom: 1px solid rgba(61,74,34,.2); padding-bottom: 2px;
          transition: color .2s;
        }
        .drawer-empty-link:hover { color: var(--olive-500); }

        /* Footer */
        .drawer-foot {
          padding: 16px 20px 22px;
          border-top: 1px solid rgba(61,74,34,.1);
          background: white; flex-shrink: 0;
        }
        .drawer-subtotal-row {
          display: flex; justify-content: space-between;
          font-size: 14px; color: var(--mist); margin-bottom: 14px;
        }
        .drawer-subtotal-row strong { font-weight: 600; color: var(--ink); }
        .drawer-cta { display: flex; flex-direction: column; gap: 8px; }
        .drawer-btn-cart {
          display: flex; align-items: center; justify-content: center; gap: 8px;
          padding: 14px; background: var(--olive-900); color: var(--beige);
          border: none; border-radius: 50px;
          font-family: 'Jost', sans-serif; font-size: 11px; font-weight: 600;
          letter-spacing: .22em; text-transform: uppercase;
          text-decoration: none; cursor: pointer; transition: background .22s; width: 100%;
        }
        .drawer-btn-cart:hover { background: var(--olive-600); }
        .drawer-btn-shop {
          display: flex; align-items: center; justify-content: center;
          padding: 13px; background: transparent; color: var(--olive-600);
          border: 1.5px solid var(--beige-dkr); border-radius: 50px;
          font-family: 'Jost', sans-serif; font-size: 11px; font-weight: 500;
          letter-spacing: .18em; text-transform: uppercase;
          text-decoration: none; cursor: pointer; transition: all .2s;
        }
        .drawer-btn-shop:hover { border-color: var(--olive-400); background: var(--olive-50); }

        @keyframes drawerPulse {
          0%, 100% { opacity: 1; transform: scale(1); }
          50%       { opacity: .5; transform: scale(.8); }
        }

        /* ── Mobile ── */
        @media (max-width: 480px) {
          .drawer-panel { width: 100vw; }
          .drawer-head  { padding: 16px 16px 12px; }
          .dp-section   { padding: 14px 16px 18px; }
          .drawer-items { padding: 12px 14px; }
          .drawer-foot  { padding: 14px 16px 20px; }
        }

        /* ── Redesign ── */
        .dp-section { padding: 12px 20px 14px; background: #fafaf6; }
        .ship-msg { margin: 0 0 8px; font-size: 13px; color: #4a4a40; }
        .ship-msg b { color: #1a1a14; font-weight: 600; }
        .ship-track { height: 7px; border-radius: 99px; background: #e7e5da; overflow: hidden; }
        .ship-fill { display: block; height: 100%; border-radius: 99px; background: linear-gradient(90deg,#3d6b4f,#2a4736); transition: width .5s ease; }
        .drawer-items { gap: 14px; padding: 16px 20px 24px; }
        .di-card { border: 1px solid #ecebe4; box-shadow: none; border-radius: 16px; }
        .di-card:hover { border-color: #dcdacf; }
        .di-img { width: 84px; height: 84px; }
        .di-name { font-size: 14.5px; }
        .di-low { margin-top: 5px; font-size: 11.5px; font-weight: 600; color: #b4491f; }
        .di-qty { border-color: #dcdacf; background: #fff; }
        .drawer-empty { padding: 36px 16px 8px; gap: 8px; }
        .drawer-empty-icon { width: 64px; height: 64px; border-radius: 50%; background: #f1f5f1; color: #2a4736; display: flex; align-items: center; justify-content: center; font-size: 28px; font-style: normal; margin-bottom: 6px; }
        .drawer-empty-title { margin: 0; font-family: 'Cormorant Garamond', serif; font-size: 26px; font-weight: 600; color: #1a1a14; }
        .drawer-empty-text { margin: 0 0 12px; }
        .drawer-foot { padding: 12px 20px 16px; box-shadow: 0 -10px 30px rgba(26,26,20,.06); border-top: 1px solid #ecebe4; }
        .foot-save { margin: 0 0 12px; font-size: 12.5px; color: #2a4736; background: #f1f5f1; padding: 8px 12px; border-radius: 10px; display: flex; align-items: center; gap: 7px; }
        .foot-save b { font-weight: 700; }
        .foot-note { margin: 8px 0 0; text-align: center; font-size: 11.5px; color: #8b8b80; }
        .drawer-btn-cart { padding: 15px; font-size: 12px; background: #1a1a14; }
        .drawer-btn-cart:hover { background: #2a4736; }
        .cu { margin-top: 8px; padding-top: 20px; border-top: 1px solid #ecebe4; }
        .cu-title { margin: 0; font-family: 'Cormorant Garamond', serif; font-size: 22px; font-weight: 600; color: #1a1a14; }
        .cu-title em { font-style: italic; color: #3d6b4f; }
        .cu-sub { margin: 3px 0 12px; font-size: 12.5px; color: #6f6f64; }
        .cu-row { display: flex; gap: 12px; overflow-x: auto; scroll-snap-type: x proximity; scroll-padding-left: 20px; margin: 0 -20px; padding: 2px 20px 8px; scrollbar-width: none; }
        .cu-row::-webkit-scrollbar { display: none; }
        .cu-card { flex: 0 0 132px; scroll-snap-align: start; display: flex; flex-direction: column; gap: 4px; }
        .cu-img { position: relative; display: block; aspect-ratio: 4/5; border-radius: 12px; overflow: hidden; background: #f4f3ee; }
        .cu-img img { width: 100%; height: 100%; object-fit: cover; display: block; }
        .cu-off { position: absolute; top: 6px; left: 6px; font-size: 9.5px; font-weight: 600; background: #fff; color: #2a4736; padding: 3px 7px; border-radius: 99px; }
        .cu-name { margin-top: 4px; font-size: 12.5px; color: #1a1a14; text-decoration: none; line-height: 1.3; display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden; min-height: 32px; }
        .cu-price { display: flex; align-items: baseline; gap: 6px; font-size: 13px; }
        .cu-price b { font-weight: 600; } .cu-price s { font-size: 11px; color: #8b8b80; }
        .cu-low { font-size: 11px; font-weight: 600; color: #b4491f; }
        .cu-btn { margin-top: 4px; display: flex; align-items: center; justify-content: center; padding: 8px; border-radius: 99px; border: 1px solid #1a1a14; background: #fff; color: #1a1a14; font-family: inherit; font-size: 11px; font-weight: 600; letter-spacing: .08em; text-transform: uppercase; text-decoration: none; cursor: pointer; transition: background .2s, color .2s; }
        .cu-btn:hover:not(:disabled) { background: #1a1a14; color: #fff; }
        .cu-btn.is-on { background: #2a4736; border-color: #2a4736; color: #fff; cursor: default; }
        @media (max-width: 480px) { .dp-section { padding: 12px 16px 14px; } .drawer-items { padding: 14px 14px 20px; } .cu-row { margin: 0 -14px; padding: 2px 14px 8px; scroll-padding-left: 14px; } }

        /* ── Mini cart v3: compact rows, slim footer ── */
        .drawer-items { gap: 0; padding: 4px 20px 24px; }
        .ci { padding: 16px 0; border-bottom: 1px solid #ecebe4; display: flex; flex-direction: column; gap: 10px; }
        .ci-main { display: flex; gap: 14px; }
        .ci-imgwrap { flex: 0 0 68px; width: 68px; height: 84px; border-radius: 10px; overflow: hidden; background: #f4f3ee; display: block; }
        .ci-img { width: 100%; height: 100%; object-fit: cover; display: block; }
        .ci-body { flex: 1; min-width: 0; display: flex; flex-direction: column; gap: 3px; }
        .ci-top { display: flex; justify-content: space-between; align-items: flex-start; gap: 10px; }
        .ci-name { font-size: 14px; font-weight: 500; color: #1a1a14; text-decoration: none; line-height: 1.3; display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden; }
        .ci-price { font-size: 14px; font-weight: 600; color: #1a1a14; flex-shrink: 0; }
        .ci-meta { font-size: 12px; color: #6f6f64; }
        .ci-was { font-size: 11.5px; color: #8b8b80; text-decoration: line-through; align-self: flex-end; margin-top: -2px; }
        .ci-low { font-size: 11.5px; font-weight: 600; color: #b4491f; }
        .ci-bottom { margin-top: auto; padding-top: 6px; display: flex; align-items: center; justify-content: space-between; }
        .ci-qty { display: inline-flex; align-items: center; border: 1px solid #dcdacf; border-radius: 99px; height: 30px; }
        .ci-qty button { width: 28px; height: 28px; border: 0; background: none; font-size: 15px; cursor: pointer; color: #1a1a14; border-radius: 99px; }
        .ci-qty button:hover { background: #f4f3ee; }
        .ci-qty span { min-width: 20px; text-align: center; font-size: 13px; font-weight: 600; }
        .ci-qtyfixed { font-size: 12.5px; color: #6f6f64; }
        .ci-remove { width: 32px; height: 32px; border: 0; border-radius: 50%; background: none; color: #8b8b80; display: flex; align-items: center; justify-content: center; cursor: pointer; transition: background .2s, color .2s; }
        .ci-remove:hover { background: #fbeeea; color: #c0392b; }
        .ci-gift { display: flex; align-items: center; gap: 8px; font-size: 12px; color: #5c4a14; background: #faf5e6; border-radius: 8px; padding: 7px 10px; }
        .ci-gift span { flex: 1; min-width: 0; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
        .ci-gift b { font-weight: 600; }
        .ci-details { font-size: 12px; color: #4a4a40; background: #fafaf6; border-radius: 8px; }
        .ci-details summary { cursor: pointer; padding: 8px 10px; list-style: none; display: flex; justify-content: space-between; align-items: center; font-weight: 500; }
        .ci-details summary::-webkit-details-marker { display: none; }
        .ci-details summary::after { content: '+'; font-size: 15px; color: #6f6f64; }
        .ci-details[open] summary::after { content: '−'; }
        .ci-details ul { list-style: none; margin: 0; padding: 0 10px 8px; display: flex; flex-direction: column; gap: 6px; }
        .ci-details li { display: flex; justify-content: space-between; gap: 10px; align-items: flex-start; }
        .ci-details li span { display: flex; flex-direction: column; gap: 1px; color: #1a1a14; }
        .ci-details li em { font-style: normal; font-size: 11.5px; color: #6f6f64; }
        .ci-details li i { font-style: normal; font-size: 10.5px; text-transform: uppercase; letter-spacing: .06em; color: #8b8b80; flex-shrink: 0; }
        .offers { margin-top: 16px; display: flex; flex-direction: column; gap: 6px; }
        .offers-h { font-size: 10.5px; font-weight: 600; letter-spacing: .14em; text-transform: uppercase; color: #6f6f64; }
        .offer { display: flex; align-items: center; gap: 10px; padding: 10px 12px; border: 1px solid #ecebe4; border-radius: 10px; cursor: pointer; font-size: 13px; }
        .offer.on { background: #f1f5f1; border-color: #cfdccf; }
        .offer input { accent-color: #2a4736; width: 15px; height: 15px; flex-shrink: 0; }
        .offer-t { flex: 1; min-width: 0; }
        .offer-a { font-weight: 600; color: #6f6f64; }
        .offer.on .offer-a { color: #2a4736; }
        .sum { margin-top: 16px; padding: 14px 0 0; border-top: 1px dashed #dcdacf; display: flex; flex-direction: column; gap: 8px; font-size: 13.5px; color: #4a4a40; }
        .sum > div { display: flex; justify-content: space-between; }
        .sum-save { color: #2a4736; font-weight: 600; }
        .drawer-foot { padding: 12px 20px calc(14px + env(safe-area-inset-bottom)); display: flex; flex-direction: column; gap: 10px; }
        .foot-row { display: flex; align-items: baseline; justify-content: space-between; }
        .foot-label { font-size: 13px; color: #6f6f64; }
        .foot-total { font-size: 20px; font-weight: 600; color: #1a1a14; }
        .cu { margin-top: 24px; }
        @media (max-width: 480px) { .drawer-items { padding: 2px 14px 20px; } .drawer-foot { padding-left: 14px; padding-right: 14px; } }

        /* ── You may also like: uniform cards ── */
        .cu-row { align-items: stretch; gap: 12px; }
        .cu-card { flex: 0 0 148px; display: flex; flex-direction: column; gap: 10px; padding: 0; background: none; }
        .cu-img { aspect-ratio: 1 / 1; border-radius: 14px; }
        .cu-info { display: flex; flex-direction: column; gap: 4px; }
        .cu-name { margin: 0; min-height: 36px; font-size: 13px; line-height: 1.4; font-weight: 500; -webkit-line-clamp: 2; }
        .cu-price { height: 18px; align-items: baseline; }
        .cu-price b { font-size: 14px; }
        .cu-btn { margin-top: auto; height: 36px; padding: 0; font-size: 11px; }

        /* ── Cart item card v4 ── */
        .drawer-items { padding: 14px 20px 24px; gap: 0; }
        .ci { padding: 14px; margin-bottom: 12px; border: 1px solid #ecebe4; border-radius: 16px; background: #fff; box-shadow: 0 1px 2px rgba(26,26,20,.03); gap: 12px; }
        .ci-main { gap: 14px; }
        .ci-imgwrap { flex: 0 0 84px; width: 84px; height: 104px; border-radius: 12px; }
        .ci-body { gap: 8px; }
        .ci-top { align-items: flex-start; gap: 8px; }
        .ci-name { font-size: 15px; font-weight: 500; line-height: 1.3; }
        .ci-remove { margin: -6px -6px 0 0; width: 30px; height: 30px; flex-shrink: 0; }
        .ci-chips { display: flex; flex-wrap: wrap; gap: 6px; }
        .ci-chip { font-size: 11.5px; color: #4a4a40; background: #f4f3ee; padding: 3px 9px; border-radius: 99px; text-transform: capitalize; }
        .ci-bottom { margin-top: auto; padding-top: 0; align-items: flex-end; }
        .ci-qty { height: 34px; background: #f7f6f1; border-color: #e6e4da; }
        .ci-qty button { width: 32px; height: 32px; font-size: 16px; }
        .ci-qty span { min-width: 22px; font-size: 13.5px; }
        .ci-pricebox { display: flex; flex-direction: column; align-items: flex-end; line-height: 1.15; }
        .ci-pricebox b { font-size: 16px; font-weight: 600; color: #1a1a14; }
        .ci-pricebox s { font-size: 12px; color: #8b8b80; }
        @media (max-width: 480px) { .drawer-items { padding: 12px 14px 20px; } .ci-imgwrap { flex-basis: 76px; width: 76px; height: 96px; } }
      `}</style>

      <div
        ref={overlayRef}
        className={`drawer-overlay${isDrawerOpen ? ' open' : ''}`}
        onClick={e => { if (e.target === overlayRef.current) closeDrawer(); }}
      >
        <div className="drawer-panel" role="dialog" aria-modal="true" aria-label="Shopping cart">

          {/* ── Header ── */}
          <div className="drawer-head">
            <div className="drawer-head-left">
              <span className="drawer-head-title">Your Cart</span>
              {itemCount > 0 && (
                <span className="drawer-head-count">{itemCount} item{itemCount !== 1 ? 's' : ''}</span>
              )}
            </div>
            <button className="drawer-close" onClick={closeDrawer} aria-label="Close cart">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
              </svg>
            </button>
          </div>

          {/* ── Free-shipping progress ── */}
          {items.length > 0 && (
            <div className="dp-section">
              <p className="ship-msg">
                {toFree > 0
                  ? <>You&apos;re <b>₹{toFree.toLocaleString('en-IN')}</b> away from <b>free shipping</b></>
                  : <>🎉 You&apos;ve unlocked <b>free shipping</b></>}
              </p>
              <div className="ship-track" role="progressbar" aria-valuenow={shipPct} aria-valuemin={0} aria-valuemax={100}>
                <span className="ship-fill" style={{ width: `${shipPct}%` }} />
              </div>
            </div>
          )}

          {/* ── Items ── */}
          {items.length === 0 ? (
            <div className="drawer-items">
              <div className="drawer-empty">
                <div className="drawer-empty-icon"><Em c="🛍" size="1em" /></div>
                <p className="drawer-empty-title">Your cart is empty</p>
                <p className="drawer-empty-text">Find something you&apos;ll love.</p>
                <Link href="/categories" className="drawer-btn-cart" style={{ width: 'auto', padding: '13px 28px' }} onClick={closeDrawer}>
                  Start shopping
                </Link>
              </div>
              <CartUpsell items={items} products={catalog} onNavigate={closeDrawer} />
            </div>
          ) : (
            <div className="drawer-items">
              {items.map(item => {
                const giftPrice = item.giftBox ? Number(item.giftBoxDetails?.price ?? 50) : 0;
                const basePrice = item.basePrice ?? Math.max(0, item.price - giftPrice);
                const itemTotal = item.price * item.qty;
                const hasStrikethrough = Boolean(item.originalPrice && item.originalPrice > item.price);
                const href = item.href || `/products/${item.id}`;
                const hasGroups = Boolean(item.selectionGroups?.length);
                const hasCharms = Boolean(item.selectedCharms?.length);
                const meta: string[] = [];
                if (item.size) meta.push(item.size);
                if (item.color && item.color !== 'Default') meta.push(item.color);
                if (item.variantLabel) meta.push(item.variantLabel);
                if (item.chain) meta.push(`Chain: ${item.chainLabel || item.chain}`);
                const groupItems = hasGroups ? item.selectionGroups!.flatMap((g) => g.items.map((sel) => ({ g, sel }))) : [];
                // Only show the "included" list when there is something worth listing: several pieces, or a piece with its own options.
                const detailCount = hasCharms ? item.selectedCharms!.length : groupItems.length;
                const optLines = (sel: any) => {
                  const l = getOptionLines(sel.customData).map(([k, v]) => `${k}: ${v}`);
                  if (sel.customData?.presetMessage) l.push(`Card: ${String(sel.customData.presetMessage)}`);
                  if (sel.customData?.personalMessage) l.push(`Msg: “${String(sel.customData.personalMessage)}”`);
                  return l;
                };
                const singleLines = !hasCharms && groupItems.length === 1 ? optLines(groupItems[0].sel) : [];
                if (singleLines.length) meta.push(...singleLines.filter((l) => { const v = l.split(': ').slice(1).join(': ').toLowerCase(); return !meta.some((m) => m.toLowerCase() === l.toLowerCase() || m.toLowerCase() === v); }));
                const showDetails = hasCharms ? detailCount > 1 : detailCount > 1;

                return (
                  <div className="ci" key={item.cartItemId ?? `${item.id}-${item.colorHex}`}>
                    <div className="ci-main">
                      <Link href={href} onClick={closeDrawer} className="ci-imgwrap">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img className="ci-img" src={cdnImage(item.image, 240)} alt={item.name} decoding="async" />
                      </Link>
                      <div className="ci-body">
                        <div className="ci-top">
                          <Link href={href} onClick={closeDrawer} className="ci-name">{item.name}</Link>
                          <button type="button" className="ci-remove" onClick={() => removeItem(item.id, item.colorHex)} aria-label={`Remove ${item.name}`} title="Remove">
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M3 6h18" /><path d="M8 6V4a1 1 0 0 1 1-1h6a1 1 0 0 1 1 1v2" /><path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6" /><path d="M10 11v6M14 11v6" /></svg>
                          </button>
                        </div>
                        {meta.length > 0 && <div className="ci-chips">{meta.map((m) => <span key={m} className="ci-chip">{m}</span>)}</div>}
                        <div className="ci-bottom">
                          <div className="ci-qty">
                            <button type="button" aria-label="Decrease quantity" onClick={() => item.qty <= 1 ? removeItem(item.id, item.colorHex) : updateQty(item.id, item.colorHex, item.qty - 1)}>−</button>
                            <span>{item.qty}</span>
                            <button type="button" aria-label="Increase quantity" onClick={() => updateQty(item.id, item.colorHex, item.qty + 1)}>+</button>
                          </div>
                          <div className="ci-pricebox">
                            {hasStrikethrough && <s>₹{(item.originalPrice! * item.qty).toLocaleString('en-IN')}</s>}
                            <b>₹{itemTotal.toLocaleString('en-IN')}</b>
                          </div>
                        </div>
                      </div>
                    </div>

                    {item.giftBox && (
                      <div className="ci-gift">
                        <Em c="🎁" size="1em" />
                        <span>{item.giftBoxDetails?.heading || 'Premium Gift Box'}{item.giftMessage ? ' + message' : ''}</span>
                        <b>+₹{(giftPrice * item.qty).toLocaleString('en-IN')}</b>
                      </div>
                    )}

                    {showDetails && (
                      <details className="ci-details">
                        <summary>{hasCharms ? `${detailCount} piece${detailCount !== 1 ? 's' : ''} included` : `${detailCount} item${detailCount !== 1 ? 's' : ''} included`}</summary>
                        <ul>
                          {hasCharms && item.selectedCharms!.map((sel, idx) => {
                            const c = (typeof sel === 'string' ? { name: sel } : sel) as any;
                            return <li key={c.id || c._id || idx}><span>{c.name || 'Charm'}</span>{c.price ? <b>₹{Number(c.price).toLocaleString('en-IN')}</b> : null}</li>;
                          })}
                          {!hasCharms && groupItems.map(({ g, sel }, idx) => {
                            const lines = optLines(sel);
                            return (
                              <li key={sel.id || idx}>
                                <span>{sel.name}{lines.length > 0 && <em>{lines.join(' · ')}</em>}</span>
                                <i>{g.label || g.category}</i>
                              </li>
                            );
                          })}
                        </ul>
                      </details>
                    )}
                  </div>
                );
              })}

              {/* Store offers */}
              {applicableOffers.length > 0 && (
                <div className="offers">
                  <span className="offers-h">Store offers</span>
                  {applicableOffers.map((o) => (
                    <label key={o.id} className={`offer${o.applied ? ' on' : ''}`}>
                      <input type="checkbox" checked={o.applied} onChange={() => toggleOfferOptOut(o.id)} />
                      <span className="offer-t">{o.title}</span>
                      <span className="offer-a">{o.applied ? `−₹${o.amount.toLocaleString('en-IN')}` : 'Off'}</span>
                    </label>
                  ))}
                </div>
              )}

              <CartUpsell items={items} products={catalog} onNavigate={closeDrawer} />
            </div>
          )}

          {/* ── Footer ── */}
          {items.length > 0 && (
            <div className="drawer-foot">
              <div className="foot-row">
                <span className="foot-label">Total</span>
                <span className="foot-total">₹{total.toLocaleString('en-IN')}</span>
              </div>
              <Link href="/cart" className="drawer-btn-cart" onClick={closeDrawer}>
                Checkout
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M5 12h14M12 5l7 7-7 7" />
                </svg>
              </Link>
            </div>
          )}

        </div>
      </div>
    </>
  );
}