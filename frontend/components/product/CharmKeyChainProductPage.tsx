
'use client';

import { useState, useEffect, useRef, type ChangeEvent, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { useCart } from '@/lib/cartContext';
import UpperNav from '@/components/ui/UpperNav';
import { fetchCharmItems, type CharmItemData } from '@/lib/catalogApi';

/* ─────────────────────────────────────────────────────────────
   TYPES
───────────────────────────────────────────────────────────── */
interface CharmItem {
  id: string;
  name: string;
  price: number;
  image: string;
  emoji: string;
  customisable?: boolean;
  hasPhotoUpload?: boolean;
}

interface CharmCategory {
  id: string;
  label: string;
  icon: string;
  charms: CharmItem[];
}

const TAB_ICONS: Record<string, string> = {
  initials: '𝑨',
  symbols: '✦',
  birthstones: '💎',
  custom: '✎',
  designs: '◈',
  characters: '🎭',
};

function groupCharmsByCategory(items: CharmItemData[]): CharmCategory[] {
  const map = new Map<string, CharmItem[]>();
  for (const item of items) {
    const key = item.charmCategory;
    if (!map.has(key)) map.set(key, []);
    map.get(key)!.push({
      id: item.id,
      name: item.name,
      price: item.price,
      image: item.image,
      emoji: item.emoji,
      customisable: item.customisable || undefined,
      hasPhotoUpload: item.hasPhotoUpload || undefined,
    });
  }
  return Array.from(map.entries()).map(([key, charms]) => ({
    id: key,
    label: key.charAt(0).toUpperCase() + key.slice(1),
    icon: TAB_ICONS[key] || '◈',
    charms,
  }));
}

const CATEGORY_CONFIG: Record<string, { title: string; titleEm: string; desc: string; maxCharms: number }> = {
  'custom-charm-jewellery': {
    title: 'Design Your',
    titleEm: 'Charm Jewellery',
    desc: 'Browse our hand-finished charms and add your favourites — initials, birthstones, symbols & custom engravings.',
    maxCharms: 8,
  },
  keychains: {
    title: 'Build Your',
    titleEm: 'Custom Keychain',
    desc: 'Pick your favourite charms to create a one-of-a-kind keychain — letters, symbols, characters & more.',
    maxCharms: 6,
  },
};

const DEFAULT_CONFIG = CATEGORY_CONFIG['custom-charm-jewellery'];

/* ─────────────────────────────────────────────────────────────
   CHARM CARD — Compact
───────────────────────────────────────────────────────────── */
function CharmCard({
  charm,
  added,
  onToggle,
  disabled,
}: {
  charm: CharmItem;
  added: boolean;
  onToggle: () => void;
  disabled: boolean;
}) {
  const [customText, setCustomText] = useState('');
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);
  const fileRef = useRef<HTMLInputElement | null>(null);

  const handlePhoto = (e: ChangeEvent<HTMLInputElement>) => {
    const f = e.currentTarget.files?.[0];
    if (!f) return;
    const r = new FileReader();
    r.onload = (ev) => setPhotoPreview((ev.target?.result as string) || null);
    r.readAsDataURL(f);
  };

  return (
    <div className={`cc${added ? ' cc--on' : ''}${disabled && !added ? ' cc--off' : ''}`}>
      {/* Compact image + emoji */}
      <div className="cc__img">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={charm.image} alt={charm.name} />
        <span className="cc__emo">{charm.emoji}</span>
        {added && (
          <span className="cc__tick">
            <svg width="8" height="8" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3.5">
              <polyline points="20 6 9 17 4 12" />
            </svg>
          </span>
        )}
      </div>

      {/* Info row */}
      <div className="cc__info">
        <span className="cc__name">{charm.name}</span>
        <span className="cc__price">₹{charm.price}</span>
      </div>

      {/* Custom fields (only visible when added) */}
      {added && charm.customisable && (
        <div className="cc__cust">
          <input
            className="cc__cust-inp"
            placeholder={charm.hasPhotoUpload ? 'Engraving text…' : 'Enter text…'}
            value={customText}
            onChange={(e) => setCustomText(e.target.value)}
            maxLength={20}
          />
          {charm.hasPhotoUpload && (
            <label className="cc__upload">
              <input ref={fileRef} type="file" accept="image/*" style={{ display: 'none' }} onChange={handlePhoto} />
              {photoPreview ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={photoPreview} alt="preview" style={{ width: 20, height: 20, objectFit: 'cover', borderRadius: 3 }} />
              ) : (
                <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
                  <rect x="3" y="3" width="18" height="18" rx="3" />
                  <circle cx="8.5" cy="8.5" r="1.5" />
                  <polyline points="21 15 16 10 5 21" />
                </svg>
              )}
            </label>
          )}
        </div>
      )}

      {/* Add / Remove button */}
      <button
        className={`cc__btn${added ? ' cc__btn--rm' : ''}`}
        onClick={onToggle}
        disabled={disabled && !added}
        aria-label={added ? `Remove ${charm.name}` : `Add ${charm.name}`}
      >
        {added ? (
          <>
            <svg width="9" height="9" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.8">
              <line x1="5" y1="12" x2="19" y2="12" />
            </svg>
            Remove
          </>
        ) : (
          <>
            <svg width="9" height="9" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.8">
              <line x1="12" y1="5" x2="12" y2="19" />
              <line x1="5" y1="12" x2="19" y2="12" />
            </svg>
            Add
          </>
        )}
      </button>
    </div>
  );
}

/* ─────────────────────────────────────────────────────────────
   MAIN PAGE
───────────────────────────────────────────────────────────── */
export default function KeychainsCharmsPage({ parentCategory = 'custom-charm-jewellery' }: { parentCategory?: string }) {
  const router = useRouter();
  const { addItem } = useCart();
  const config = CATEGORY_CONFIG[parentCategory] || DEFAULT_CONFIG;
  const MAX_CHARMS = config.maxCharms;

  const [charmCategories, setCharmCategories] = useState<CharmCategory[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCharms, setSelectedCharms] = useState<CharmItem[]>([]);
  const [activeCategory, setActiveCategory] = useState('');
  const [cartAdded, setCartAdded] = useState(false);

  useEffect(() => {
    let mounted = true;
    setLoading(true);
    fetchCharmItems(parentCategory)
      .then((items) => {
        if (!mounted) return;
        const grouped = groupCharmsByCategory(items);
        setCharmCategories(grouped);
        if (grouped.length > 0) setActiveCategory(grouped[0].id);
        setLoading(false);
      })
      .catch(() => {
        if (mounted) setLoading(false);
      });
    return () => { mounted = false; };
  }, [parentCategory]);

  const toggleCharm = useCallback((charm: CharmItem) => {
    setSelectedCharms((prev) => {
      const exists = prev.find((c) => c.id === charm.id);
      if (exists) return prev.filter((c) => c.id !== charm.id);
      if (prev.length >= MAX_CHARMS) return prev;
      return [...prev, charm];
    });
  }, [MAX_CHARMS]);

  const removeCharm = useCallback((charmId: string) => {
    setSelectedCharms((prev) => prev.filter((c) => c.id !== charmId));
  }, []);

  const totalPrice = selectedCharms.reduce((s, c) => s + c.price, 0);
  const hasItems = selectedCharms.length > 0;
  const activeCharmCategory = charmCategories.find((c) => c.id === activeCategory);

  function handleAddToCart() {
    if (!hasItems) return;
    
    const cartItem = {
      id: `custom-${parentCategory}-${Date.now()}`,
      name: `Custom ${config.title}`,
      price: totalPrice,
      image: selectedCharms[0]?.image || '', // Using first charm as preview
      color: 'Custom',
      colorHex: '#d9cdb8',
      sku: `CUST-${parentCategory.toUpperCase()}`,
      href: '#',
      selectedCharms: selectedCharms.map(c => c.id), // Storing just IDs or full objects. Let's store objects to display names if needed, but backend expects ObjectIds if we populated it. Wait, the backend model is: `selectedCharms: [{ type: mongoose.Schema.Types.ObjectId, ref: "CharmItem" }]`. So we just need the IDs!
    };
    
    // Pass full objects for frontend rendering if we want, but backend expects IDs.
    // Let's pass objects, we can map to ID in checkout.
    addItem({ ...cartItem, selectedCharms: selectedCharms }, false);

    setCartAdded(true);
    setTimeout(() => setCartAdded(false), 1800);
  }

  function handleBuyNow() {
    if (!hasItems) return;
    handleAddToCart();
    router.push('/cart');
  }

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,300;0,400;0,600;1,300;1,400&family=DM+Sans:wght@300;400;500;600&display=swap');

        /* ── TOKENS ── */
        :root {
          --bg:        #f4f0e6;
          --bg-2:      #ebe4d4;
          --bg-3:      #ddd4bc;
          --ol9:       #1a1f0d;
          --ol7:       #283010;
          --ol6:       #3d4a22;
          --ol5:       #5a6b2e;
          --ol4:       #7a8e3c;
          --ol1:       #e8edce;
          --ol0:       #f1f4e4;
          --gold:      #c9a84c;
          --gold-lt:   #e8d48a;
          --ink:       #1e2310;
          --mist:      rgba(30,35,16,.46);
          --mist-lt:   rgba(30,35,16,.26);
          --red:       #b83228;
          --grn:       #2a6e30;
          --r:         12px;
          --r-sm:      8px;
        }

        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
        html { scroll-behavior: smooth; }
        body { font-family: 'DM Sans', sans-serif; color: var(--ink); }
        button { font-family: 'DM Sans', sans-serif; cursor: pointer; }
        img { display: block; }

        /* ── PAGE ── */
        .pg {
          min-height: 100dvh;
          background: var(--bg);
          background-image:
            radial-gradient(ellipse 75% 30% at 50% -3%, rgba(201,168,76,.1) 0%, transparent 58%),
            radial-gradient(ellipse 32% 52% at 98% 100%, rgba(90,107,46,.08) 0%, transparent 52%);
        }

        /* ── TOP NAV ── */
        .nav {
          display: flex; align-items: center; justify-content: space-between;
          padding: 14px 48px;
          background: rgba(244,240,230,.88);
          backdrop-filter: blur(14px) saturate(140%);
          border-bottom: 1px solid rgba(61,74,34,.09);
          position: sticky; top: 0; z-index: 200;
        }
        .nav-logo {
          font-family: 'Cormorant Garamond', serif;
          font-size: 21px; font-weight: 300; letter-spacing: .18em;
          color: var(--ol6); text-decoration: none;
        }
        .nav-logo em { font-style: italic; color: var(--gold); }
        .nav-links { display: flex; gap: 26px; }
        .nav-links a {
          font-size: 10px; letter-spacing: .3em; text-transform: uppercase;
          color: var(--mist); text-decoration: none; font-weight: 500;
          transition: color .18s;
        }
        .nav-links a:hover, .nav-links a.active { color: var(--ol6); }
        .nav-cart-btn {
          display: flex; align-items: center; gap: 6px;
          font-size: 10px; letter-spacing: .14em; text-transform: uppercase;
          font-weight: 600; color: var(--ol6);
          background: var(--ol0); border: 1.5px solid var(--bg-3);
          padding: 7px 14px; border-radius: 50px;
          transition: all .18s; cursor: pointer;
        }
        .nav-cart-btn:hover { background: var(--ol1); border-color: var(--ol4); }

        /* ── HERO ── */
        .hero {
          padding: 55px 48px 34px;
          border-bottom: 1px solid rgba(61,74,34,.09);
          position: relative; overflow: hidden;
          animation: fadeUp .55s ease both;
        }
        .hero::after {
          content: '◈';
          position: absolute; right: 56px; top: 50%;
          transform: translateY(-50%);
          font-size: 110px; color: rgba(201,168,76,.065);
          pointer-events: none; line-height: 1;
          font-family: serif;
        }
        .hero-crumb {
          display: flex; align-items: center; gap: 10px; margin-bottom: 14px;
          font-size: 8.5px; letter-spacing: .52em; text-transform: uppercase;
          color: var(--gold); font-weight: 500;
        }
        .hero-crumb::before {
          content: ''; width: 24px; height: 1px;
          background: linear-gradient(90deg, var(--gold), transparent);
        }
        .hero h1 {
          font-family: 'Cormorant Garamond', serif;
          font-size: clamp(1.9rem, 3.8vw, 3.2rem);
          font-weight: 300; color: var(--ol6);
          line-height: 1.07; letter-spacing: -.02em;
          margin-bottom: 10px;
        }
        .hero h1 em { font-style: italic; color: var(--gold); }
        .hero-desc {
          font-size: 12.5px; font-weight: 300; color: var(--mist);
          max-width: 480px; line-height: 1.82; letter-spacing: .02em;
        }

        /* ── LAYOUT ── */
        .layout {
          display: grid;
          grid-template-columns: 1fr 320px;
          gap: 0;
          padding: 0 48px 72px;
          align-items: start;
          animation: fadeUp .55s ease .1s both;
        }

        .col-left  { padding-top: 26px; padding-right: 32px; }
        .col-right { padding-top: 26px; position: sticky; top: 76px; }

        /* ── SECTION LABEL ── */
        .sec-lbl {
          font-size: 8.5px; letter-spacing: .46em; text-transform: uppercase;
          color: var(--mist-lt); font-weight: 600; margin-bottom: 14px;
          display: flex; align-items: center; gap: 10px;
        }
        .sec-lbl::after { content: ''; flex: 1; height: 1px; background: var(--bg-3); }

        /* ── CATEGORY TABS ── */
        .cat-tabs {
          display: flex; gap: 5px; margin-bottom: 16px; flex-wrap: wrap;
        }
        .cat-tab {
          font-size: 9px; font-weight: 600; letter-spacing: .1em; text-transform: uppercase;
          padding: 6px 14px; border-radius: 50px;
          border: 1.5px solid var(--bg-3); background: white;
          cursor: pointer; color: var(--mist);
          transition: all .18s; display: flex; align-items: center; gap: 5px;
        }
        .cat-tab:hover { border-color: var(--ol4); color: var(--ol6); background: var(--ol0); }
        .cat-tab.on { border-color: var(--ol6); background: var(--ol6); color: var(--bg); }

        /* ── CHARM GRID — Compact ── */
        .charm-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(108px, 1fr));
          gap: 10px;
          margin-bottom: 28px;
        }

        /* ── CHARM CARD ── */
        .cc {
          background: white;
          border: 1.5px solid var(--bg-3);
          border-radius: var(--r);
          overflow: hidden;
          transition: border-color .18s, box-shadow .18s, transform .14s;
          display: flex; flex-direction: column;
        }
        .cc:hover {
          border-color: var(--ol4);
          transform: translateY(-2px);
          box-shadow: 0 6px 18px rgba(30,35,16,.1);
        }
        .cc--on {
          border-color: var(--gold);
          box-shadow: 0 0 0 2px rgba(201,168,76,.18);
        }
        .cc--off { opacity: .38; pointer-events: none; }

        /* Image — small square */
        .cc__img {
          position: relative;
          width: 100%;
          aspect-ratio: 1 / 1;
          max-height: 90px;            /* cap the image height */
          overflow: hidden;
          background: var(--bg-2);
          flex-shrink: 0;
        }
        .cc__img img {
          width: 100%; height: 100%; object-fit: cover;
          transition: transform .32s;
        }
        .cc:hover .cc__img img { transform: scale(1.08); }
        .cc__emo {
          position: absolute; inset: 0;
          display: flex; align-items: center; justify-content: center;
          font-size: 1.55rem;
          background: rgba(244,240,230,.5);
          backdrop-filter: blur(2px);
          pointer-events: none;
        }
        .cc__tick {
          position: absolute; top: 5px; right: 5px;
          width: 18px; height: 18px; border-radius: 50%;
          background: var(--gold);
          display: flex; align-items: center; justify-content: center;
          box-shadow: 0 2px 6px rgba(201,168,76,.5);
          animation: pop .24s cubic-bezier(.34,1.56,.64,1) both;
        }
        @keyframes pop { from { transform: scale(0); } to { transform: scale(1); } }

        /* Info */
        .cc__info {
          padding: 6px 8px 4px;
          display: flex; flex-direction: column; gap: 1px;
          flex: 1;
        }
        .cc__name {
          font-size: 10px; font-weight: 500; color: var(--ink);
          white-space: nowrap; overflow: hidden; text-overflow: ellipsis;
          line-height: 1.3;
        }
        .cc__price { font-size: 10px; font-weight: 700; color: var(--ol5); }

        /* Custom input */
        .cc__cust {
          padding: 5px 8px; border-top: 1px solid var(--bg-3);
          display: flex; gap: 5px; align-items: center;
        }
        .cc__cust-inp {
          flex: 1; border: 1.5px solid var(--bg-3); border-radius: 5px;
          padding: 4px 6px; font-family: 'DM Sans', sans-serif;
          font-size: 9px; color: var(--ink); background: white; outline: none;
          transition: border-color .18s;
        }
        .cc__cust-inp:focus { border-color: var(--ol4); }
        .cc__cust-inp::placeholder { color: var(--mist-lt); }
        .cc__upload {
          display: flex; align-items: center; justify-content: center;
          width: 28px; height: 28px; border-radius: 5px;
          border: 1.5px dashed var(--bg-3); cursor: pointer;
          background: var(--ol0); color: var(--ol5);
          transition: border-color .18s; flex-shrink: 0;
        }
        .cc__upload:hover { border-color: var(--ol4); }

        /* Button */
        .cc__btn {
          display: flex; align-items: center; justify-content: center; gap: 4px;
          width: 100%; font-family: 'DM Sans', sans-serif;
          font-size: 9px; font-weight: 700; letter-spacing: .09em; text-transform: uppercase;
          padding: 7px; border: none; cursor: pointer;
          transition: background .18s, color .18s;
          background: var(--ol0); color: var(--ol6);
          flex-shrink: 0;
        }
        .cc__btn:hover { background: var(--ol1); }
        .cc__btn--rm { background: rgba(184,50,40,.07); color: var(--red); }
        .cc__btn--rm:hover { background: rgba(184,50,40,.13); }
        .cc__btn:disabled { opacity: .36; cursor: not-allowed; }

        /* ── RIGHT — SELECTED PANEL ── */
        .sel-panel {
          background: white;
          border: 1.5px solid var(--bg-3);
          border-radius: var(--r);
          overflow: hidden;
          margin-bottom: 14px;
        }
        .sel-head {
          padding: 12px 16px;
          background: linear-gradient(135deg, var(--ol0), var(--bg-2));
          border-bottom: 1px solid var(--bg-3);
          display: flex; align-items: center; justify-content: space-between;
        }
        .sel-title {
          font-family: 'Cormorant Garamond', serif;
          font-size: .95rem; font-weight: 400; color: var(--ol6);
        }
        .sel-badge {
          font-size: 8.5px; font-weight: 700; letter-spacing: .12em; text-transform: uppercase;
          color: var(--gold); background: rgba(201,168,76,.12);
          padding: 2px 9px; border-radius: 50px;
          border: 1px solid rgba(201,168,76,.24);
        }
        .sel-badge.full { color: var(--red); background: rgba(184,50,40,.08); border-color: rgba(184,50,40,.2); }

        .sel-body { padding: 12px 14px; }
        .sel-empty {
          text-align: center;
          font-family: 'Cormorant Garamond', serif; font-style: italic;
          font-size: 12px; color: var(--mist-lt);
          padding: 16px 0;
        }
        .sel-list { display: flex; flex-direction: column; gap: 7px; }
        .sel-item {
          display: flex; align-items: center; gap: 9px;
          padding: 7px 9px;
          background: var(--bg);
          border: 1px solid var(--bg-3);
          border-radius: var(--r-sm);
          animation: slideIn .25s cubic-bezier(.34,1.3,.64,1) both;
        }
        @keyframes slideIn {
          from { opacity: 0; transform: translateX(10px); }
          to   { opacity: 1; transform: translateX(0); }
        }
        .sel-thumb {
          position: relative; width: 36px; height: 36px;
          border-radius: 7px; overflow: hidden; flex-shrink: 0;
          border: 1.5px solid var(--bg-3); background: var(--bg-2);
        }
        .sel-thumb img { width: 100%; height: 100%; object-fit: cover; }
        .sel-thumb-emo {
          position: absolute; inset: 0;
          display: flex; align-items: center; justify-content: center;
          font-size: 1rem;
          background: rgba(244,240,230,.5);
          backdrop-filter: blur(1.5px);
        }
        .sel-info { flex: 1; min-width: 0; }
        .sel-name {
          display: block; font-size: 10px; font-weight: 500; color: var(--ink);
          white-space: nowrap; overflow: hidden; text-overflow: ellipsis;
        }
        .sel-price { display: block; font-size: 9.5px; font-weight: 700; color: var(--ol5); margin-top: 1px; }
        .sel-rm {
          width: 22px; height: 22px; border-radius: 50%;
          border: 1.5px solid var(--bg-3); background: white;
          display: flex; align-items: center; justify-content: center;
          color: var(--mist); font-size: 13px; line-height: 1;
          cursor: pointer; flex-shrink: 0; padding: 0;
          transition: border-color .16s, color .16s, background .16s;
        }
        .sel-rm:hover { border-color: var(--red); color: var(--red); background: rgba(184,50,40,.06); }

        /* ── SUMMARY ── */
        .summary {
          background: white;
          border: 1.5px solid var(--bg-3);
          border-radius: var(--r);
          overflow: hidden;
          box-shadow: 0 6px 28px rgba(30,35,16,.1);
        }
        .sum-head {
          padding: 16px 18px 12px;
          background: linear-gradient(140deg, var(--ol0), var(--bg-2));
          border-bottom: 1px solid var(--bg-3);
          position: relative; overflow: hidden;
        }
        .sum-head::after {
          content: '◈'; position: absolute; right: 14px; top: 50%;
          transform: translateY(-50%);
          font-size: 38px; color: rgba(201,168,76,.09);
          pointer-events: none; line-height: 1; font-family: serif;
        }
        .sum-title {
          font-family: 'Cormorant Garamond', serif;
          font-size: 1rem; font-weight: 400; color: var(--ol6);
        }
        .sum-body { padding: 14px 18px 16px; }

        .sum-divider {
          height: 1px; margin: 10px 0;
          background: linear-gradient(90deg, transparent, var(--gold-lt), transparent);
        }
        .sum-total {
          display: flex; justify-content: space-between; align-items: baseline;
          margin-bottom: 14px;
        }
        .sum-total-lbl {
          font-size: 9px; font-weight: 700; letter-spacing: .16em;
          text-transform: uppercase; color: var(--mist);
        }
        .sum-total-val {
          font-family: 'Cormorant Garamond', serif;
          font-size: 1.6rem; font-weight: 600; color: var(--ink);
        }

        /* Buttons */
        .btn-cart {
          display: flex; align-items: center; justify-content: center; gap: 7px;
          width: 100%; font-family: 'DM Sans', sans-serif;
          font-size: 10px; font-weight: 700; letter-spacing: .16em; text-transform: uppercase;
          color: var(--bg); background: var(--ol9);
          border: none; border-radius: 50px; padding: 14px;
          cursor: pointer; margin-bottom: 8px;
          box-shadow: 0 4px 16px rgba(26,31,13,.28);
          transition: background .2s, transform .14s, box-shadow .18s;
        }
        .btn-cart:hover:not(:disabled) {
          background: var(--ol6);
          transform: translateY(-1px);
          box-shadow: 0 6px 20px rgba(26,31,13,.32);
        }
        .btn-cart:disabled { opacity: .36; cursor: not-allowed; }
        .btn-cart.done { background: var(--grn) !important; }

        .btn-buy {
          display: flex; align-items: center; justify-content: center; gap: 7px;
          width: 100%; font-family: 'DM Sans', sans-serif;
          font-size: 10px; font-weight: 700; letter-spacing: .16em; text-transform: uppercase;
          color: var(--ol9); background: var(--gold-lt);
          border: 1.5px solid var(--gold); border-radius: 50px; padding: 13px;
          cursor: pointer;
          transition: background .2s, color .2s, transform .14s;
        }
        .btn-buy:hover:not(:disabled) {
          background: var(--gold); color: white;
          transform: translateY(-1px);
        }
        .btn-buy:disabled { opacity: .36; cursor: not-allowed; }

        /* Perks */
        .perks {
          display: flex; justify-content: center; gap: 10px;
          margin-top: 12px; flex-wrap: wrap;
        }
        .perk {
          font-size: 8.5px; color: var(--mist-lt);
          display: flex; align-items: center; gap: 4px;
        }
        .perk-dot { width: 3px; height: 3px; border-radius: 50%; background: var(--gold); opacity: .6; }

        /* ── ANIMATIONS ── */
        @keyframes fadeUp {
          from { opacity: 0; transform: translateY(14px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        @keyframes pulse {
          0%, 100% { opacity: 0.3; }
          50% { opacity: 0.15; }
        }

        /* ── RESPONSIVE ── */

        /* Tablet */
        @media (max-width: 1024px) {
          .layout { grid-template-columns: 1fr; }
          .col-left { padding-right: 0; }
          .col-right { position: static; }
          .nav, .hero, .layout { padding-left: 28px; padding-right: 28px; }
          .nav-links { display: none; }
          .hero::after { display: none; }
        }

        /* Large mobile / small tablet */
        @media (max-width: 680px) {
          .nav, .hero, .layout { padding-left: 16px; padding-right: 16px; }
          .hero { padding-top: 55px; padding-bottom: 20px; }
          .layout { padding-bottom: 48px; }
          /* 3-column on wide phone */
          .charm-grid { grid-template-columns: repeat(3, 1fr); gap: 8px; }
          .cc__img { max-height: 80px; }
        }

        /* Small mobile */
        @media (max-width: 420px) {
          /* 3-column still — enough space */
          .charm-grid { grid-template-columns: repeat(3, 1fr); gap: 7px; }
          .cc__img { max-height: 72px; }
          .cc__name { font-size: 9px; }
          .cc__price { font-size: 9px; }
          .cat-tab { font-size: 8.5px; padding: 5px 10px; }
        }

        /* Very small */
        @media (max-width: 340px) {
          .charm-grid { grid-template-columns: repeat(2, 1fr); gap: 6px; }
        }
      `}</style>

      <div className="pg">

        {/* ── NAV ── */}
         <UpperNav />

        {/* ── HERO ── */}
        <div className="hero">
          <h1>{config.title} <em>{config.titleEm}</em></h1>
          <p className="hero-desc">
            {config.desc} Add up to {MAX_CHARMS} pieces to your order.
          </p>
        </div>

        {/* ── CONTENT ── */}
        <div className="layout">

          {/* LEFT */}
          <div className="col-left">
            <p className="sec-lbl">Choose Your Charms ({selectedCharms.length}/{MAX_CHARMS})</p>

            {/* Category Tabs */}
            <div className="cat-tabs">
              {charmCategories.map((cat) => (
                <button
                  key={cat.id}
                  className={`cat-tab${activeCategory === cat.id ? ' on' : ''}`}
                  onClick={() => setActiveCategory(cat.id)}
                >
                  <span>{cat.icon}</span>
                  {cat.label}
                </button>
              ))}
            </div>

            {/* Charm Grid */}
            <div className="charm-grid">
              {loading ? (
                Array.from({ length: 8 }).map((_, i) => (
                  <div key={i} className="cc" style={{ minHeight: 120, opacity: 0.3, animation: 'pulse 1.4s ease-in-out infinite' }} />
                ))
              ) : (
                activeCharmCategory?.charms.map((charm) => {
                  const isAdded = selectedCharms.some((c) => c.id === charm.id);
                  const isFull = selectedCharms.length >= MAX_CHARMS;
                  return (
                    <CharmCard
                      key={charm.id}
                      charm={charm}
                      added={isAdded}
                      disabled={isFull}
                      onToggle={() => toggleCharm(charm)}
                    />
                  );
                })
              )}
            </div>
          </div>

          {/* RIGHT */}
          <div className="col-right">

            {/* Selection panel */}
            <p className="sec-lbl" style={{ marginBottom: 10 }}>Your Selection</p>
            <div className="sel-panel">
              <div className="sel-head">
                <span className="sel-title">Selected Charms</span>
                <span className={`sel-badge${selectedCharms.length >= MAX_CHARMS ? ' full' : ''}`}>
                  {selectedCharms.length >= MAX_CHARMS ? 'Max reached' : `${selectedCharms.length} / ${MAX_CHARMS}`}
                </span>
              </div>
              <div className="sel-body">
                {selectedCharms.length === 0 ? (
                  <p className="sel-empty">No charms selected yet</p>
                ) : (
                  <div className="sel-list">
                    {selectedCharms.map((charm) => (
                      <div key={charm.id} className="sel-item">
                        <div className="sel-thumb">
                          {/* eslint-disable-next-line @next/next/no-img-element */}
                          <img src={charm.image} alt={charm.name} />
                          <div className="sel-thumb-emo">{charm.emoji}</div>
                        </div>
                        <div className="sel-info">
                          <span className="sel-name">{charm.name}</span>
                          <span className="sel-price">₹{charm.price.toLocaleString('en-IN')}</span>
                        </div>
                        <button
                          className="sel-rm"
                          onClick={() => removeCharm(charm.id)}
                          aria-label={`Remove ${charm.name}`}
                        >×</button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Order summary */}
            <div className="summary">
              <div className="sum-head">
                <div className="sum-title">Order Summary</div>
              </div>
              <div className="sum-body">
                <div className="sum-divider" />
                <div className="sum-total">
                  <span className="sum-total-lbl">Total</span>
                  <span className="sum-total-val">₹{totalPrice.toLocaleString('en-IN')}</span>
                </div>

                <button
                  className={`btn-cart${cartAdded ? ' done' : ''}`}
                  onClick={handleAddToCart}
                  disabled={!hasItems}
                >
                  {cartAdded ? (
                    <>
                      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                        <polyline points="20 6 9 17 4 12" />
                      </svg>
                      Added to Cart!
                    </>
                  ) : (
                    <>
                      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z"/>
                        <line x1="3" y1="6" x2="21" y2="6"/>
                        <path d="M16 10a4 4 0 0 1-8 0"/>
                      </svg>
                      Add to Cart
                    </>
                  )}
                </button>

                <button className="btn-buy" onClick={handleBuyNow} disabled={!hasItems}>
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M5 12h14M12 5l7 7-7 7"/>
                  </svg>
                  Buy It Now
                </button>

                <div className="perks">
                  <span className="perk"><span className="perk-dot"/>Free shipping ₹599+</span>
                  <span className="perk"><span className="perk-dot"/>COD available</span>
                  <span className="perk"><span className="perk-dot"/>Easy returns</span>
                </div>
              </div>
            </div>

          </div>
        </div>
      </div>
    </>
  );
}  