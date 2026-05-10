'use client';

import { useState, useRef, useEffect } from 'react';

/* ─────────────────────────────────────────────────────────────
   TYPES
───────────────────────────────────────────────────────────── */
export type SortOption = 'default' | 'price-asc' | 'price-desc' | 'alpha-asc' | 'featured';

export interface SortFilterProps {
  value: SortOption;
  onChange: (sort: SortOption) => void;
  /** Visual variant — matches the page it's embedded in */
  variant?: 'olive' | 'dark' | 'glam' | 'sage';
  /** Extra class for positioning */
  className?: string;
}

/* ─────────────────────────────────────────────────────────────
   SORT OPTIONS CONFIG
───────────────────────────────────────────────────────────── */
const SORT_OPTIONS: { value: SortOption; label: string; shortLabel: string; icon: React.ReactNode }[] = [
  {
    value: 'default',
    label: 'Default',
    shortLabel: 'Sort',
    icon: (
      <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <line x1="8" y1="6" x2="21" y2="6"/>
        <line x1="8" y1="12" x2="21" y2="12"/>
        <line x1="8" y1="18" x2="21" y2="18"/>
        <line x1="3" y1="6" x2="3.01" y2="6"/>
        <line x1="3" y1="12" x2="3.01" y2="12"/>
        <line x1="3" y1="18" x2="3.01" y2="18"/>
      </svg>
    ),
  },
  {
    value: 'price-asc',
    label: 'Price: Low to High',
    shortLabel: 'Low → High',
    icon: (
      <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <path d="M3 16l4 4 4-4"/>
        <path d="M7 20V4"/>
        <path d="M11 4h10"/>
        <path d="M11 8h7"/>
        <path d="M11 12h4"/>
      </svg>
    ),
  },
  {
    value: 'price-desc',
    label: 'Price: High to Low',
    shortLabel: 'High → Low',
    icon: (
      <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <path d="M3 8l4-4 4 4"/>
        <path d="M7 4v16"/>
        <path d="M11 12h10"/>
        <path d="M11 16h7"/>
        <path d="M11 20h4"/>
      </svg>
    ),
  },
  {
    value: 'alpha-asc',
    label: 'Name: A → Z',
    shortLabel: 'A → Z',
    icon: (
      <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <path d="M3 16l4 4 4-4"/>
        <path d="M7 20V4"/>
        <path d="M20 8h-5l5 8h-5"/>
      </svg>
    ),
  },
];

/* ─────────────────────────────────────────────────────────────
   UTILITY: sort an array of products
   Call this anywhere you have a list with { price, name }
───────────────────────────────────────────────────────────── */
export function sortProducts<T extends { price: number; name: string }>(
  list: T[],
  sort: SortOption
): T[] {
  const copy = [...list];
  switch (sort) {
    case 'price-asc':
      return copy.sort((a, b) => a.price - b.price);
    case 'price-desc':
      return copy.sort((a, b) => b.price - a.price);
    case 'alpha-asc':
      return copy.sort((a, b) => a.name.localeCompare(b.name));
    default:
      return copy;
  }
}

/* ─────────────────────────────────────────────────────────────
   COMPONENT
───────────────────────────────────────────────────────────── */
export default function SortFilter({
  value,
  onChange,
  variant = 'olive',
  className = '',
}: SortFilterProps) {
  const [open, setOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);

  /* Close on outside click */
  useEffect(() => {
    if (!open) return;
    const handler = (e: MouseEvent) => {
      if (rootRef.current && !rootRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [open]);

  /* Close on Escape */
  useEffect(() => {
    if (!open) return;
    const handler = (e: KeyboardEvent) => { if (e.key === 'Escape') setOpen(false); };
    document.addEventListener('keydown', handler);
    return () => document.removeEventListener('keydown', handler);
  }, [open]);

  const active = SORT_OPTIONS.find((o) => o.value === value) ?? SORT_OPTIONS[0];
  const isFiltered = value !== 'default';

  return (
    <>
      <style>{`
        /* ── SF Tokens ── */
        .sf-wrap {
          position: relative;
          display: inline-block;
          font-family: 'DM Sans', 'Outfit', 'Nunito', 'Jost', sans-serif;
          user-select: none;
        }

        /* ── Trigger button ── */
        .sf-trigger {
          display: inline-flex;
          align-items: center;
          gap: 7px;
          padding: 8px 13px 8px 11px;
          border-radius: 50px;
          border: 1.5px solid var(--sf-bdr, rgba(60,90,35,0.22));
          background: var(--sf-bg, #ffffff);
          color: var(--sf-txt, #1c1c17);
          font-family: inherit;
          font-size: 10px;
          font-weight: 600;
          letter-spacing: 0.1em;
          text-transform: uppercase;
          cursor: pointer;
          white-space: nowrap;
          transition: border-color 0.18s, background 0.18s, box-shadow 0.18s;
          outline: none;
        }
        .sf-trigger:hover {
          border-color: var(--sf-bdr-hover, rgba(60,90,35,0.5));
          background: var(--sf-bg-hover, #f4f9ef);
          box-shadow: 0 2px 10px rgba(37,61,24,0.1);
        }
        .sf-trigger.sf-open {
          border-color: var(--sf-accent, #253d18);
          background: var(--sf-bg-hover, #f4f9ef);
        }
        .sf-trigger.sf-active {
          border-color: var(--sf-accent, #253d18);
          background: var(--sf-accent, #253d18);
          color: #fff;
        }

        /* Icon colour inherits from parent */
        .sf-trigger svg { flex-shrink: 0; }

        /* Active dot */
        .sf-dot {
          width: 6px;
          height: 6px;
          border-radius: 50%;
          background: var(--sf-gold, #a07820);
          flex-shrink: 0;
        }

        /* Chevron */
        .sf-chevron {
          transition: transform 0.22s;
          opacity: 0.55;
          flex-shrink: 0;
        }
        .sf-trigger.sf-open .sf-chevron { transform: rotate(180deg); }

        /* ── Dropdown ── */
        .sf-dropdown {
          position: absolute;
          top: calc(100% + 7px);
          right: 0;
          min-width: 200px;
          background: #fff;
          border: 1.5px solid rgba(60,90,35,0.14);
          border-radius: 12px;
          box-shadow: 0 8px 32px rgba(30,35,16,0.13), 0 1px 4px rgba(30,35,16,0.06);
          overflow: hidden;
          z-index: 999;
          animation: sfSlideIn 0.18s cubic-bezier(0.22,0.68,0,1.2) both;
          transform-origin: top right;
        }
        @keyframes sfSlideIn {
          from { opacity: 0; transform: scale(0.92) translateY(-6px); }
          to   { opacity: 1; transform: scale(1) translateY(0); }
        }

        /* Header inside dropdown */
        .sf-dropdown-head {
          padding: 9px 14px 7px;
          border-bottom: 1px solid rgba(60,90,35,0.08);
          font-size: 8px;
          font-weight: 700;
          letter-spacing: 0.36em;
          text-transform: uppercase;
          color: rgba(30,35,16,0.4);
          background: linear-gradient(135deg, #f4f9ef, #f9f6ef);
        }

        /* Option row */
        .sf-option {
          display: flex;
          align-items: center;
          gap: 10px;
          width: 100%;
          padding: 10px 14px;
          background: transparent;
          border: none;
          font-family: inherit;
          font-size: 11px;
          font-weight: 500;
          color: rgba(30,35,16,0.75);
          text-align: left;
          cursor: pointer;
          transition: background 0.14s, color 0.14s;
          border-bottom: 1px solid rgba(60,90,35,0.05);
          letter-spacing: 0.01em;
        }
        .sf-option:last-child { border-bottom: none; }
        .sf-option:hover {
          background: #f1f7ec;
          color: #253d18;
        }
        .sf-option.sf-option-active {
          background: #253d18;
          color: #fff;
          font-weight: 600;
        }
        .sf-option-icon {
          display: flex;
          align-items: center;
          justify-content: center;
          width: 26px;
          height: 26px;
          border-radius: 7px;
          background: rgba(60,90,35,0.08);
          flex-shrink: 0;
          transition: background 0.14s;
        }
        .sf-option-active .sf-option-icon {
          background: rgba(255,255,255,0.15);
        }
        .sf-option:hover:not(.sf-option-active) .sf-option-icon {
          background: rgba(60,90,35,0.14);
        }
        .sf-option-check {
          margin-left: auto;
          flex-shrink: 0;
          opacity: 0;
          transition: opacity 0.14s;
        }
        .sf-option-active .sf-option-check { opacity: 1; }

        /* ── VARIANT: dark (for Maximalist / Rocker / Street styles) ── */
        .sf-wrap.sf-dark .sf-trigger {
          --sf-bdr:       rgba(255,255,255,0.16);
          --sf-bg:        rgba(255,255,255,0.06);
          --sf-txt:       rgba(255,255,255,0.85);
          --sf-bdr-hover: rgba(255,255,255,0.36);
          --sf-bg-hover:  rgba(255,255,255,0.1);
          --sf-accent:    rgba(255,255,255,0.9);
          --sf-gold:      #c9a84c;
        }
        .sf-wrap.sf-dark .sf-trigger.sf-active {
          background: rgba(255,255,255,0.18);
          color: #fff;
        }
        .sf-wrap.sf-dark .sf-dropdown {
          background: #1e1e2a;
          border-color: rgba(255,255,255,0.1);
          box-shadow: 0 8px 32px rgba(0,0,0,0.5);
        }
        .sf-wrap.sf-dark .sf-dropdown-head {
          background: rgba(255,255,255,0.04);
          color: rgba(255,255,255,0.35);
          border-color: rgba(255,255,255,0.06);
        }
        .sf-wrap.sf-dark .sf-option {
          color: rgba(255,255,255,0.65);
          border-color: rgba(255,255,255,0.04);
        }
        .sf-wrap.sf-dark .sf-option:hover {
          background: rgba(255,255,255,0.07);
          color: #fff;
        }
        .sf-wrap.sf-dark .sf-option.sf-option-active {
          background: rgba(255,255,255,0.14);
          color: #fff;
        }
        .sf-wrap.sf-dark .sf-option-icon {
          background: rgba(255,255,255,0.08);
        }

        /* ── VARIANT: glam (silver / grey) ── */
        .sf-wrap.sf-glam .sf-trigger {
          --sf-bdr:       #A9A9A9;
          --sf-bg:        #E8E8E8;
          --sf-txt:       #000;
          --sf-bdr-hover: #555;
          --sf-bg-hover:  #d0d0d0;
          --sf-accent:    #000;
          --sf-gold:      #555;
        }
        .sf-wrap.sf-glam .sf-option:hover {
          background: #d8d8d8;
          color: #000;
        }
        .sf-wrap.sf-glam .sf-option.sf-option-active {
          background: #000;
          color: #fff;
        }
.sf-wrap.sf-sage .sf-trigger {
  --sf-bdr:       rgba(73,88,31,0.2);
  --sf-bg:        #f4f8ec;
  --sf-txt:       #49581f;
  --sf-bdr-hover: rgba(73,88,31,0.45);
  --sf-bg-hover:  #e8f0d4;
  --sf-accent:    #68773e;
  --sf-gold:      #c7a748;
}
.sf-wrap.sf-sage .sf-trigger.sf-active {
  background: #68773e; color: #fff; border-color: #68773e;
}
.sf-wrap.sf-sage .sf-option.sf-option-active { background: #68773e; color: #fff; }
.sf-wrap.sf-sage .sf-option:hover:not(.sf-option-active) { background: #edf2dc; color: #49581f; }
        /* ── Responsive label ── */
        .sf-label-full { display: inline; }
        .sf-label-short { display: none; }

        @media (max-width: 640px) {
          .sf-label-full { display: none; }
          .sf-label-short { display: inline; }
          .sf-trigger { padding: 7px 11px 7px 10px; font-size: 9px; }
          .sf-dropdown { min-width: 180px; }
          .sf-option { font-size: 10.5px; padding: 9px 12px; }
        }

}
      `}</style>

      <div
        ref={rootRef}
        className={`sf-wrap${variant === 'dark' ? ' sf-dark' : variant === 'glam' ? ' sf-glam' : variant === 'sage' ? ' sf-sage' : ''}${className ? ` ${className}` : ''}`}
      >
        {/* Trigger */}
        <button
          className={`sf-trigger${open ? ' sf-open' : ''}${isFiltered ? ' sf-active' : ''}`}
          onClick={() => setOpen((o) => !o)}
          aria-haspopup="listbox"
          aria-expanded={open}
          aria-label="Sort products"
        >
          {active.icon}

          <span className="sf-label-full">{isFiltered ? active.label : 'Sort By'}</span>
          <span className="sf-label-short">{isFiltered ? active.shortLabel : 'Sort'}</span>

          {isFiltered && <span className="sf-dot" />}

          <svg className="sf-chevron" width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
            <polyline points="6 9 12 15 18 9" />
          </svg>
        </button>

        {/* Dropdown */}
        {open && (
          <div className="sf-dropdown" role="listbox">
            <div className="sf-dropdown-head">Sort By</div>

            {SORT_OPTIONS.map((opt) => (
              <button
                key={opt.value}
                role="option"
                aria-selected={value === opt.value}
                className={`sf-option${value === opt.value ? ' sf-option-active' : ''}`}
                onClick={() => { onChange(opt.value); setOpen(false); }}
              >
                <span className="sf-option-icon">{opt.icon}</span>
                {opt.label}
                <svg className="sf-option-check" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.8">
                  <polyline points="20 6 9 17 4 12" />
                </svg>
              </button>
            ))}
          </div>
        )}
      </div>
    </>
  );
}