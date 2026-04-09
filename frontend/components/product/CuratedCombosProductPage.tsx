'use client';

import { useState, useMemo, useCallback } from 'react';

// ─── All available products by category ──────────────────────────────────────
const PRODUCTS_BY_CATEGORY = {
  necklace: [
    { id: 1, name: 'Dainty Layered Necklace', price: 1299, image: 'https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?w=400&q=80', customisable: false },
    { id: 2, name: 'Pearl Pendant Necklace',  price: 2499, image: 'https://images.unsplash.com/photo-1573408301185-9519f94816b5?w=400&q=80', customisable: false },
    { id: 3, name: 'Layered Gold Chain',       price: 1599, image: 'https://images.unsplash.com/photo-1611591437281-460bfbe1220a?w=400&q=80', customisable: false },
  ],
  earrings: [
    { id: 4, name: 'Gold Hoop Earrings',    price: 899, image: 'https://images.unsplash.com/photo-1588444650733-d0f07d323dde?w=400&q=80', customisable: false },
    { id: 5, name: 'Minimal Stud Earrings', price: 549, image: 'https://images.unsplash.com/photo-1605100804763-247f67b3557e?w=400&q=80', customisable: false },
    { id: 6, name: 'Korean Ear Cuffs',      price: 699, image: 'https://images.unsplash.com/photo-1617038260897-41a1f14a8ca0?w=400&q=80', customisable: false },
  ],
  bracelets: [
    { id: 7, name: 'Beaded Charm Bracelet', price: 749,  image: 'https://images.unsplash.com/photo-1602173574767-37ac01994b2a?w=400&q=80', customisable: false },
    { id: 8, name: 'Kada Bangle Set',       price: 1899, image: 'https://images.unsplash.com/photo-1612817288484-6f916006741a?w=400&q=80', customisable: false },
    { id: 9, name: 'Minimal Chain Bracelet',price: 999,  image: 'https://images.unsplash.com/photo-1612817288484-6f916006741a?w=400&q=80', customisable: false },
  ],
  rings: [
    { id: 10, name: 'Diamond Ring',     price: 2999, image: 'https://images.unsplash.com/photo-1605100804763-247f67b3557e?w=400&q=80', customisable: false },
    { id: 11, name: 'Minimal Gold Ring',price: 999,  image: 'https://images.unsplash.com/photo-1605100804763-247f67b3557e?w=400&q=80', customisable: false },
    { id: 12, name: 'Couple Rings Set', price: 1999, image: 'https://images.unsplash.com/photo-1588444650733-d0f07d323dde?w=400&q=80', customisable: false },
  ],
  'gift-boxes': [
    { id: 16, name: 'Luxury Gift Box',   price: 2499, image: 'https://images.unsplash.com/photo-1549465220-1a8b9238cd48?w=400&q=80', customisable: true },
    { id: 17, name: 'Birthday Gift Box', price: 1999, image: 'https://images.unsplash.com/photo-1549465220-1a8b9238cd48?w=400&q=80', customisable: true },
  ],
  keychains: [
    { id: 18, name: 'Personalised Keychain', price: 399, image: 'https://images.unsplash.com/photo-1582143570735-ebf7c44a5c54?w=400&q=80', customisable: true },
    { id: 19, name: 'Metal Charm Keychain',  price: 499, image: 'https://images.unsplash.com/photo-1582143570735-ebf7c44a5c54?w=400&q=80', customisable: true },
  ],
  'hair-accessories': [
    { id: 13, name: 'Elegant Hair Clip', price: 499, image: 'https://images.unsplash.com/photo-1591206422576-7e00ff5f7db7?w=400&q=80', customisable: false },
    { id: 14, name: 'Pearl Hair Band',   price: 799, image: 'https://images.unsplash.com/photo-1591206422576-7e00ff5f7db7?w=400&q=80', customisable: false },
    { id: 15, name: 'Floral Hair Pins',  price: 599, image: 'https://images.unsplash.com/photo-1591206422576-7e00ff5f7db7?w=400&q=80', customisable: false },
  ],
};

const PRESET_COMBOS = [
  {
    id: 'festive',
    name: 'Festive Glow',
    tagline: 'Celebrate every moment',
    price: 2999,
    originalPrice: 4500,
    image: 'https://images.unsplash.com/photo-1602173574767-37ac01994b2a?w=600&q=85',
    badge: 'Most Loved',
    includedCategories: ['necklace', 'earrings', 'bracelets'],
    defaultSelections: { necklace: 1, earrings: 4, bracelets: 7 },
  },
  {
    id: 'bridal',
    name: 'Bridal Radiance',
    tagline: 'For your most beautiful day',
    price: 5999,
    originalPrice: 8800,
    image: 'https://images.unsplash.com/photo-1573408301185-9519f94816b5?w=600&q=85',
    badge: 'Premium',
    includedCategories: ['necklace', 'earrings', 'rings', 'bracelets'],
    defaultSelections: { necklace: 2, earrings: 4, rings: 10, bracelets: 8 },
  },
  {
    id: 'minimal',
    name: 'Minimal Edit',
    tagline: 'Less is more, always',
    price: 1999,
    originalPrice: 2800,
    image: 'https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?w=600&q=85',
    badge: 'New',
    includedCategories: ['necklace', 'earrings'],
    defaultSelections: { necklace: 1, earrings: 5 },
  },
  {
    id: 'gifting',
    name: 'Gifting Special',
    tagline: 'Curated with love',
    price: 3499,
    originalPrice: 5200,
    image: 'https://images.unsplash.com/photo-1549465220-1a8b9238cd48?w=600&q=85',
    badge: 'Gift Ready',
    includedCategories: ['necklace', 'earrings', 'bracelets', 'gift-boxes'],
    defaultSelections: { necklace: 3, earrings: 6, bracelets: 9, 'gift-boxes': 16 },
  },
];

const CATEGORY_LABELS = {
  necklace: 'Necklace',
  earrings: 'Earrings',
  bracelets: 'Bracelet',
  rings: 'Ring',
  'gift-boxes': 'Gift Box',
  keychains: 'Keychain',
  'hair-accessories': 'Hair Accessory',
};

// ─── Customisation mini-panel ─────────────────────────────────────────────────
function MiniCustomPanel({ productName }) {
  const [text, setText] = useState('');
  const [preview, setPreview] = useState(null);

  const handleFile = (e) => {
    const f = e.target.files[0];
    if (!f) return;
    const r = new FileReader();
    r.onload = (ev) => setPreview(ev.target.result);
    r.readAsDataURL(f);
  };

  return (
    <div className="cc-cust">
      <div className="cc-cust-head">
        <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>
        Personalise your {productName}
      </div>
      <input
        className="cc-cust-input"
        placeholder="Add a name or message (e.g. 'Happy Birthday Sarah')…"
        value={text}
        onChange={e => setText(e.target.value)}
        maxLength={80}
      />
      <label className="cc-cust-upload">
        <input type="file" accept="image/*" style={{ display: 'none' }} onChange={handleFile} />
        {preview
          ? <img src={preview} alt="Preview" style={{ width: 36, height: 36, objectFit: 'cover', borderRadius: 6 }} />
          : <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><rect x="3" y="3" width="18" height="18" rx="3"/><circle cx="8.5" cy="8.5" r="1.5"/><polyline points="21 15 16 10 5 21"/></svg>
        }
        <span>{preview ? 'Change photo' : 'Upload photo'}</span>
      </label>
    </div>
  );
}

// ─── Product selector card (single-select, used in preset mode) ───────────────
function ProductSelectCard({ product, selected, onSelect }) {
  return (
    <button
      className={`cc-prod-card${selected ? ' selected' : ''}`}
      onClick={() => onSelect(product.id)}
    >
      <div className="cc-prod-img-wrap">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={product.image} alt={product.name} />
        {selected && (
          <div className="cc-prod-check">
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3"><polyline points="20 6 9 17 4 12"/></svg>
          </div>
        )}
      </div>
      <div className="cc-prod-info">
        <span className="cc-prod-name">{product.name}</span>
        <span className="cc-prod-price">₹{product.price.toLocaleString('en-IN')}</span>
      </div>
    </button>
  );
}

// ─── Product selector card (multi-select, used in custom mode) ────────────────
function ProductMultiSelectCard({ product, selected, onToggle }) {
  return (
    <button
      className={`cc-prod-card${selected ? ' selected' : ''}`}
      onClick={() => onToggle(product.id)}
    >
      <div className="cc-prod-img-wrap">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={product.image} alt={product.name} />
        {selected && (
          <div className="cc-prod-check">
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3"><polyline points="20 6 9 17 4 12"/></svg>
          </div>
        )}
      </div>
      <div className="cc-prod-info">
        <span className="cc-prod-name">{product.name}</span>
        <span className="cc-prod-price">₹{product.price.toLocaleString('en-IN')}</span>
      </div>
    </button>
  );
}

// ─── Category row (single-select, preset mode) ────────────────────────────────
function CategoryRow({ catKey, products, selectedId, onSelect, label }) {
  const selectedProduct = products.find(p => p.id === selectedId);
  const [expanded, setExpanded] = useState(false);

  return (
    <div className="cc-cat-row">
      <div className="cc-cat-row-head" onClick={() => setExpanded(e => !e)}>
        <div className="cc-cat-row-left">
          <span className="cc-cat-num">
            {selectedProduct
              ? <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="var(--gold)" strokeWidth="3"><polyline points="20 6 9 17 4 12"/></svg>
              : '·'}
          </span>
          <span className="cc-cat-label">{label}</span>
          {selectedProduct && (
            <span className="cc-cat-selected-name">{selectedProduct.name}</span>
          )}
        </div>
        <div className="cc-cat-row-right">
          {selectedProduct && <span className="cc-cat-price">₹{selectedProduct.price.toLocaleString('en-IN')}</span>}
          <svg className={`cc-cat-chevron${expanded ? ' open' : ''}`} width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="6 9 12 15 18 9"/></svg>
        </div>
      </div>

      {expanded && (
        <div className="cc-cat-products">
          {products.map(p => (
            <ProductSelectCard
              key={p.id}
              product={p}
              selected={selectedId === p.id}
              onSelect={(id) => { onSelect(catKey, id); }}
            />
          ))}
        </div>
      )}

      {expanded && selectedProduct?.customisable && (
        <MiniCustomPanel productName={selectedProduct.name} />
      )}
    </div>
  );
}

// ─── Category row (multi-select, custom mode) ─────────────────────────────────
function CategoryRowMulti({ catKey, products, selectedIds, onToggle, label }) {
  const [expanded, setExpanded] = useState(false);
  const count = selectedIds.length;
  const anyCustomisable = selectedIds.some(id => {
    const p = products.find(p => p.id === id);
    return p?.customisable;
  });

  return (
    <div className="cc-cat-row">
      <div className="cc-cat-row-head" onClick={() => setExpanded(e => !e)}>
        <div className="cc-cat-row-left">
          <span className="cc-cat-num">
            {count > 0
              ? <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="var(--gold)" strokeWidth="3"><polyline points="20 6 9 17 4 12"/></svg>
              : '·'}
          </span>
          <span className="cc-cat-label">{label}</span>
          {count > 0 && (
            <span className="cc-cat-selected-name">{count} selected</span>
          )}
        </div>
        <div className="cc-cat-row-right">
          <svg className={`cc-cat-chevron${expanded ? ' open' : ''}`} width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="6 9 12 15 18 9"/></svg>
        </div>
      </div>

      {expanded && (
        <div className="cc-cat-products">
          {products.map(p => (
            <ProductMultiSelectCard
              key={p.id}
              product={p}
              selected={selectedIds.includes(p.id)}
              onToggle={(id) => onToggle(catKey, id)}
            />
          ))}
        </div>
      )}

      {expanded && anyCustomisable && (
        <MiniCustomPanel productName={label} />
      )}
    </div>
  );
}

// ─── Preset combo card ────────────────────────────────────────────────────────
function PresetComboCard({ combo, selected, onSelect }) {
  const discount = Math.round(((combo.originalPrice - combo.price) / combo.originalPrice) * 100);
  return (
    <button className={`cc-preset-card${selected ? ' selected' : ''}`} onClick={() => onSelect(combo.id)}>
      <div className="cc-preset-img">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={combo.image} alt={combo.name} />
        <div className="cc-preset-grad" />
        <span className="cc-preset-badge">{combo.badge}</span>
        {selected && <div className="cc-preset-selected-ring" />}
      </div>
      <div className="cc-preset-body">
        <span className="cc-preset-name">{combo.name}</span>
        <span className="cc-preset-tagline">{combo.tagline}</span>
        <div className="cc-preset-price-row">
          <span className="cc-preset-price">₹{combo.price.toLocaleString('en-IN')}</span>
          <span className="cc-preset-original">₹{combo.originalPrice.toLocaleString('en-IN')}</span>
          <span className="cc-preset-off">{discount}% off</span>
        </div>
        <div className="cc-preset-includes">
          {combo.includedCategories.map(c => (
            <span key={c} className="cc-preset-tag">{CATEGORY_LABELS[c]}</span>
          ))}
        </div>
      </div>
    </button>
  );
}

// ─── Main page ────────────────────────────────────────────────────────────────
export default function CuratedCombosPage() {
  const [mode, setMode] = useState('preset');

  const [selectedComboId, setSelectedComboId] = useState('festive');
  const [comboSelections, setComboSelections] = useState(() => {
    const combo = PRESET_COMBOS.find(c => c.id === 'festive');
    return { ...combo.defaultSelections };
  });

  // custom mode: selectedIds is an object of catKey -> array of selected product ids
  const [customSelectedIds, setCustomSelectedIds] = useState({});
  const [customCategories, setCustomCategories] = useState(['necklace', 'earrings']);

  const selectedCombo = PRESET_COMBOS.find(c => c.id === selectedComboId);

  const handleComboSelect = useCallback((id) => {
    setSelectedComboId(id);
    const combo = PRESET_COMBOS.find(c => c.id === id);
    setComboSelections({ ...combo.defaultSelections });
  }, []);

  const handlePresetSelection = useCallback((catKey, productId) => {
    setComboSelections(prev => ({ ...prev, [catKey]: productId }));
  }, []);

  // Toggle a product id in/out of the multi-select array for a category
  const handleCustomToggle = useCallback((catKey, productId) => {
    setCustomSelectedIds(prev => {
      const current = prev[catKey] || [];
      const already = current.includes(productId);
      return {
        ...prev,
        [catKey]: already ? current.filter(id => id !== productId) : [...current, productId],
      };
    });
  }, []);

  const customTotal = useMemo(() => {
    return customCategories.reduce((sum, cat) => {
      const ids = customSelectedIds[cat] || [];
      return sum + ids.reduce((s, id) => {
        const prod = PRODUCTS_BY_CATEGORY[cat]?.find(p => p.id === id);
        return s + (prod?.price || 0);
      }, 0);
    }, 0);
  }, [customSelectedIds, customCategories]);

  const presetTotal = selectedCombo?.price || 0;
  const ALL_CATEGORIES = Object.keys(PRODUCTS_BY_CATEGORY);

  // Flatten all selected custom items for the summary panel
  const customSummaryItems = useMemo(() => {
    const items = [];
    customCategories.forEach(cat => {
      const ids = customSelectedIds[cat] || [];
      ids.forEach(id => {
        const prod = PRODUCTS_BY_CATEGORY[cat]?.find(p => p.id === id);
        if (prod) items.push({ catKey: cat, prod });
      });
    });
    return items;
  }, [customSelectedIds, customCategories]);

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,300;0,400;0,600;1,300;1,400&family=Jost:wght@200;300;400;500;600&display=swap');

        :root {
          --beige:     #f5f0e8;
          --beige-dk:  #ede5d5;
          --beige-dkr: #d9cdb8;
          --olive-900: #1a1f0d;
          --olive-600: #3d4a22;
          --olive-500: #5a6b2e;
          --olive-400: #7a8e3c;
          --olive-50:  #f2f4e8;
          --gold:      #c9a84c;
          --ink:       #1e2310;
          --mist:      rgba(30,35,16,.45);
          --green:     #2e7d32;
        }
        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

        .cc {
          min-height: 100vh;
          background: var(--beige);
          background-image:
            radial-gradient(ellipse 80% 30% at 50% -5%, rgba(201,168,76,.08) 0%, transparent 60%),
            radial-gradient(ellipse 40% 50% at 100% 100%, rgba(90,110,35,.07) 0%, transparent 55%);
          font-family: 'Jost', sans-serif;
          color: var(--ink);
        }
        .cc-topbar {
          display: flex; align-items: center; justify-content: space-between;
          padding: 16px 52px;
          border-bottom: 1px solid rgba(61,74,34,.1);
          background: rgba(245,240,232,.85);
          backdrop-filter: blur(12px);
          position: sticky; top: 0; z-index: 100;
        }
        .cc-logo {
          font-family: 'Cormorant Garamond', serif;
          font-size: 22px; font-weight: 300; letter-spacing: .14em;
          color: var(--olive-600); text-decoration: none;
        }
        .cc-logo em { font-style: italic; color: var(--gold); }
        .cc-nav { display: flex; gap: 28px; }
        .cc-nav a {
          font-size: 10px; letter-spacing: .28em; text-transform: uppercase;
          color: var(--mist); text-decoration: none; font-weight: 500; transition: color .2s;
        }
        .cc-nav a:hover, .cc-nav a.active { color: var(--olive-600); }

        .cc-hero {
          padding: 48px 52px 32px;
          border-bottom: 1px solid rgba(61,74,34,.08);
          animation: ccFadeUp .65s ease both;
        }
        .cc-hero-eyebrow {
          font-size: 9px; letter-spacing: .5em; text-transform: uppercase;
          color: var(--gold); margin-bottom: 12px;
          display: flex; align-items: center; gap: 12px;
        }
        .cc-hero-eyebrow::before { content: ''; width: 32px; height: 1px; background: linear-gradient(90deg, var(--gold), transparent); }
        .cc-hero h1 {
          font-family: 'Cormorant Garamond', serif;
          font-size: clamp(2.2rem, 4.5vw, 3.8rem);
          font-weight: 300; color: var(--olive-600); line-height: 1.08; letter-spacing: -.02em;
        }
        .cc-hero h1 em { font-style: italic; color: var(--gold); }
        .cc-hero-desc {
          font-size: 12px; font-weight: 300; color: var(--mist);
          max-width: 520px; line-height: 1.8; margin-top: 10px; letter-spacing: .04em;
        }

        .cc-mode-strip {
          padding: 24px 52px 0;
          animation: ccFadeUp .65s ease .08s both;
        }
        .cc-mode-toggle {
          display: inline-flex;
          background: white;
          border: 1.5px solid var(--beige-dkr);
          border-radius: 50px;
          padding: 4px; gap: 4px;
        }
        .cc-mode-btn {
          font-family: 'Jost', sans-serif;
          font-size: 10px; font-weight: 600; letter-spacing: .16em; text-transform: uppercase;
          padding: 10px 24px; border-radius: 50px; border: none; cursor: pointer;
          transition: all .25s; background: transparent; color: var(--mist);
        }
        .cc-mode-btn.active {
          background: var(--olive-600); color: var(--beige);
          box-shadow: 0 4px 14px rgba(61,74,34,.25);
        }
        .cc-mode-desc {
          font-size: 11px; font-weight: 300; color: var(--mist);
          letter-spacing: .04em; margin-top: 10px; line-height: 1.6;
        }

        .cc-body {
          display: grid;
          grid-template-columns: 1fr 360px;
          gap: 32px;
          padding: 28px 52px 72px;
          align-items: start;
          animation: ccFadeUp .65s ease .14s both;
        }

        .cc-section-lbl {
          font-size: 9px; letter-spacing: .4em; text-transform: uppercase;
          color: var(--mist); font-weight: 500; margin-bottom: 16px;
        }

        /* Preset cards */
        .cc-preset-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(210px, 1fr));
          gap: 16px; margin-bottom: 32px;
        }
        .cc-preset-card {
          background: white; border: 2px solid var(--beige-dkr);
          border-radius: 18px; overflow: hidden; cursor: pointer;
          text-align: left; transition: border-color .22s, box-shadow .22s, transform .18s; padding: 0;
        }
        .cc-preset-card:hover { border-color: var(--olive-400); box-shadow: 0 8px 32px rgba(61,74,34,.1); transform: translateY(-2px); }
        .cc-preset-card.selected { border-color: var(--gold); box-shadow: 0 0 0 3px rgba(201,168,76,.18), 0 8px 28px rgba(61,74,34,.1); }
        .cc-preset-img { position: relative; aspect-ratio: 3/2; overflow: hidden; }
        .cc-preset-img img { width: 100%; height: 100%; object-fit: cover; transition: transform .45s; }
        .cc-preset-card:hover .cc-preset-img img { transform: scale(1.06); }
        .cc-preset-grad { position: absolute; inset: 0; background: linear-gradient(to top, rgba(30,35,16,.55) 0%, transparent 50%); }
        .cc-preset-badge {
          position: absolute; top: 10px; left: 10px;
          font-size: 8px; font-weight: 700; letter-spacing: .14em; text-transform: uppercase;
          color: var(--ink); background: var(--gold); padding: 4px 10px; border-radius: 4px;
        }
        .cc-preset-selected-ring { position: absolute; inset: 0; border: 3px solid var(--gold); pointer-events: none; }
        .cc-preset-body { padding: 14px 16px 16px; }
        .cc-preset-name { display: block; font-family: 'Cormorant Garamond', serif; font-size: 1.1rem; font-weight: 400; color: var(--olive-600); margin-bottom: 3px; }
        .cc-preset-tagline { display: block; font-size: 10px; color: var(--mist); letter-spacing: .06em; margin-bottom: 10px; }
        .cc-preset-price-row { display: flex; align-items: baseline; gap: 8px; margin-bottom: 8px; }
        .cc-preset-price { font-family: 'Cormorant Garamond', serif; font-size: 1.3rem; font-weight: 600; color: var(--ink); }
        .cc-preset-original { font-size: 11px; color: var(--mist); text-decoration: line-through; }
        .cc-preset-off { font-size: 9px; font-weight: 700; letter-spacing: .06em; color: var(--beige); background: var(--olive-500); padding: 2px 7px; border-radius: 4px; text-transform: uppercase; }
        .cc-preset-includes { display: flex; flex-wrap: wrap; gap: 5px; }
        .cc-preset-tag { font-size: 8.5px; letter-spacing: .1em; text-transform: uppercase; color: var(--mist); border: 1px solid var(--beige-dkr); padding: 2px 8px; border-radius: 50px; }

        /* Customise block */
        .cc-customise-block { background: white; border: 1.5px solid var(--beige-dkr); border-radius: 18px; overflow: hidden; }
        .cc-customise-head {
          padding: 16px 20px; border-bottom: 1px solid var(--beige-dkr);
          display: flex; align-items: center; justify-content: space-between;
        }
        .cc-customise-title { font-size: 11px; font-weight: 600; letter-spacing: .12em; text-transform: uppercase; color: var(--olive-600); }
        .cc-customise-sub { font-size: 10px; color: var(--mist); letter-spacing: .04em; }

        /* Category rows */
        .cc-cat-row { border-bottom: 1px solid rgba(61,74,34,.07); }
        .cc-cat-row:last-child { border-bottom: none; }
        .cc-cat-row-head {
          display: flex; align-items: center; justify-content: space-between;
          padding: 13px 20px; cursor: pointer; transition: background .15s;
        }
        .cc-cat-row-head:hover { background: var(--olive-50); }
        .cc-cat-row-left { display: flex; align-items: center; gap: 10px; }
        .cc-cat-num {
          width: 20px; height: 20px; display: flex; align-items: center; justify-content: center;
          font-size: 9px; font-weight: 600; color: var(--mist);
          background: var(--beige-dk); border-radius: 50%; flex-shrink: 0;
        }
        .cc-cat-label { font-size: 11px; font-weight: 600; letter-spacing: .08em; text-transform: uppercase; color: var(--olive-600); }
        .cc-cat-selected-name { font-size: 10.5px; color: var(--mist); font-weight: 300; }
        .cc-cat-row-right { display: flex; align-items: center; gap: 10px; }
        .cc-cat-price { font-size: 11px; font-weight: 600; color: var(--ink); }
        .cc-cat-chevron { color: var(--mist); transition: transform .25s; }
        .cc-cat-chevron.open { transform: rotate(180deg); }
        .cc-cat-products {
          display: grid; grid-template-columns: repeat(auto-fill, minmax(130px, 1fr));
          gap: 10px; padding: 4px 20px 16px;
        }
        .cc-prod-card {
          background: transparent; border: 1.5px solid var(--beige-dkr);
          border-radius: 12px; overflow: hidden; cursor: pointer; text-align: left;
          transition: border-color .2s, box-shadow .2s; padding: 0;
        }
        .cc-prod-card:hover { border-color: var(--olive-400); }
        .cc-prod-card.selected { border-color: var(--gold); box-shadow: 0 0 0 2px rgba(201,168,76,.2); }
        .cc-prod-img-wrap { position: relative; aspect-ratio: 1; overflow: hidden; }
        .cc-prod-img-wrap img { width: 100%; height: 100%; object-fit: cover; transition: transform .35s; }
        .cc-prod-card:hover .cc-prod-img-wrap img { transform: scale(1.07); }
        .cc-prod-check {
          position: absolute; top: 6px; right: 6px; width: 22px; height: 22px;
          border-radius: 50%; background: var(--gold);
          display: flex; align-items: center; justify-content: center;
        }
        .cc-prod-info { padding: 8px 10px; }
        .cc-prod-name { display: block; font-size: 10px; font-weight: 500; color: var(--ink); margin-bottom: 3px; line-height: 1.3; }
        .cc-prod-price { display: block; font-size: 10.5px; font-weight: 600; color: var(--olive-600); }

        /* Customisation mini panel */
        .cc-cust {
          margin: 0 20px 16px;
          background: linear-gradient(135deg, rgba(201,168,76,.07), rgba(90,110,35,.05));
          border: 1px solid rgba(201,168,76,.25); border-radius: 12px; padding: 12px 14px;
        }
        .cc-cust-head {
          display: flex; align-items: center; gap: 7px;
          font-size: 10px; font-weight: 700; letter-spacing: .1em; text-transform: uppercase;
          color: #8c6b20; margin-bottom: 10px;
        }
        .cc-cust-input {
          width: 100%; border: 1.5px solid var(--beige-dkr); border-radius: 8px; padding: 8px 12px;
          font-family: 'Jost', sans-serif; font-size: 11px; color: var(--ink); background: white;
          outline: none; margin-bottom: 8px; transition: border-color .2s;
        }
        .cc-cust-input:focus { border-color: var(--olive-400); }
        .cc-cust-input::placeholder { color: rgba(30,35,16,.3); }
        .cc-cust-upload {
          display: inline-flex; align-items: center; gap: 7px;
          font-size: 10px; font-weight: 600; letter-spacing: .1em; text-transform: uppercase;
          color: var(--olive-600); border: 1.5px dashed var(--beige-dkr);
          border-radius: 8px; padding: 7px 14px; cursor: pointer;
          transition: border-color .2s, background .2s; background: white;
        }
        .cc-cust-upload:hover { border-color: var(--olive-400); background: var(--olive-50); }

        /* Custom mode */
        .cc-add-cats { display: flex; flex-wrap: wrap; gap: 8px; margin-bottom: 24px; }
        .cc-add-cat-btn {
          font-family: 'Jost', sans-serif;
          font-size: 9.5px; font-weight: 600; letter-spacing: .14em; text-transform: uppercase;
          color: var(--mist); padding: 7px 16px;
          border: 1.5px solid rgba(61,74,34,.15); border-radius: 50px;
          background: transparent; cursor: pointer; transition: all .2s;
        }
        .cc-add-cat-btn:hover { color: var(--olive-600); border-color: var(--olive-400); background: var(--olive-50); }
        .cc-add-cat-btn.added { color: var(--beige); background: var(--olive-600); border-color: var(--olive-600); }
        .cc-custom-block { background: white; border: 1.5px solid var(--beige-dkr); border-radius: 18px; overflow: hidden; }

        /* Summary */
        .cc-summary {
          position: sticky; top: 85px;
          background: white; border: 1.5px solid var(--beige-dkr); border-radius: 20px; overflow: hidden;
        }
        .cc-summary-header {
          padding: 20px 22px 16px; border-bottom: 1px solid var(--beige-dkr);
          background: linear-gradient(135deg, var(--olive-50), var(--beige-dk));
        }
        .cc-summary-title { font-family: 'Cormorant Garamond', serif; font-size: 1.1rem; font-weight: 400; color: var(--olive-600); }
        .cc-summary-mode { font-size: 9px; font-weight: 600; letter-spacing: .2em; text-transform: uppercase; color: var(--gold); margin-top: 3px; display: block; }
        .cc-summary-body { padding: 16px 22px; }
        .cc-summary-items { margin-bottom: 16px; }
        .cc-sum-item { display: flex; align-items: center; gap: 10px; padding: 8px 0; border-bottom: 1px solid rgba(61,74,34,.06); }
        .cc-sum-item:last-child { border-bottom: none; }
        .cc-sum-item-img { width: 40px; height: 40px; border-radius: 8px; object-fit: cover; flex-shrink: 0; border: 1px solid var(--beige-dkr); }
        .cc-sum-item-info { flex: 1; }
        .cc-sum-item-cat { font-size: 8.5px; letter-spacing: .14em; text-transform: uppercase; color: var(--mist); display: block; }
        .cc-sum-item-name { font-size: 11px; font-weight: 500; color: var(--ink); display: block; }
        .cc-sum-item-price { font-size: 11px; font-weight: 600; color: var(--olive-600); }
        .cc-sum-empty { font-size: 11px; font-weight: 300; color: var(--mist); text-align: center; padding: 16px 0; letter-spacing: .04em; font-style: italic; }
        .cc-summary-divider { height: 1px; background: linear-gradient(90deg, rgba(61,74,34,.1), rgba(201,168,76,.2), rgba(61,74,34,.1)); margin: 12px 0; }
        .cc-summary-total-row { display: flex; justify-content: space-between; align-items: baseline; margin-bottom: 6px; }
        .cc-summary-total-label { font-size: 10px; letter-spacing: .1em; text-transform: uppercase; color: var(--mist); }
        .cc-summary-total-value { font-family: 'Cormorant Garamond', serif; font-size: 1.6rem; font-weight: 600; color: var(--ink); }
        .cc-summary-savings { font-size: 10px; font-weight: 600; color: var(--green); margin-bottom: 14px; letter-spacing: .04em; }
        .cc-btn-add {
          display: flex; align-items: center; justify-content: center; gap: 8px; width: 100%;
          font-family: 'Jost', sans-serif; font-size: 11px; font-weight: 700; letter-spacing: .16em; text-transform: uppercase;
          color: var(--beige); background: var(--olive-900); border: none; border-radius: 50px; padding: 15px;
          cursor: pointer; margin-bottom: 10px; transition: background .22s;
        }
        .cc-btn-add:hover { background: var(--olive-600); }
        .cc-btn-buy {
          display: flex; align-items: center; justify-content: center; gap: 8px; width: 100%;
          font-family: 'Jost', sans-serif; font-size: 11px; font-weight: 700; letter-spacing: .16em; text-transform: uppercase;
          color: var(--beige); background: var(--gold); border: none; border-radius: 50px; padding: 15px;
          cursor: pointer; transition: background .22s;
        }
        .cc-btn-buy:hover { background: #b8902b; }
        .cc-summary-note { font-size: 9.5px; color: var(--mist); text-align: center; margin-top: 12px; line-height: 1.6; letter-spacing: .03em; }

        @keyframes ccFadeUp { from { opacity: 0; transform: translateY(16px); } to { opacity: 1; transform: translateY(0); } }

        @media (max-width: 960px) {
          .cc-body { grid-template-columns: 1fr; }
          .cc-summary { position: static; }
          .cc-topbar, .cc-hero, .cc-mode-strip, .cc-body { padding-left: 24px; padding-right: 24px; }
          .cc-nav { display: none; }
        }
        @media (max-width: 520px) {
          .cc-topbar, .cc-hero, .cc-mode-strip, .cc-body { padding-left: 16px; padding-right: 16px; }
          .cc-preset-grid { grid-template-columns: 1fr 1fr; }
        }
      `}</style>

      <div className="cc">
        <nav className="cc-topbar">
          <a href="/" className="cc-logo">Mai<em>son</em></a>
          <div className="cc-nav">
            <a href="#">Collections</a>
            <a href="#" className="active">Shop</a>
            <a href="#">About</a>
          </div>
        </nav>

        <div className="cc-hero">
          <div className="cc-hero-eyebrow">Women · Jewellery · Curated Combos</div>
          <h1>Build Your <em>Perfect</em> Set</h1>
          <p className="cc-hero-desc">
            Choose a curated combo and swap pieces to your liking — or build something entirely your own. Every combination is handpicked for harmony.
          </p>
        </div>

        <div className="cc-mode-strip">
          <div className="cc-mode-toggle">
            <button className={`cc-mode-btn${mode === 'preset' ? ' active' : ''}`} onClick={() => setMode('preset')}>
              ◈ Curated Sets
            </button>
            <button className={`cc-mode-btn${mode === 'custom' ? ' active' : ''}`} onClick={() => setMode('custom')}>
              ✦ Build Your Own
            </button>
          </div>
          <p className="cc-mode-desc">
            {mode === 'preset'
              ? 'Pick a pre-curated combo at a fixed price — then swap individual pieces within each category to match your taste.'
              : 'Select any categories you like and choose as many products as you want from each. Price is calculated dynamically.'}
          </p>
        </div>

        <div className="cc-body">
          {/* Left column */}
          <div>
            {mode === 'preset' && (
              <>
                <p className="cc-section-lbl">Choose a Combo Set</p>
                <div className="cc-preset-grid">
                  {PRESET_COMBOS.map(combo => (
                    <PresetComboCard key={combo.id} combo={combo} selected={selectedComboId === combo.id} onSelect={handleComboSelect} />
                  ))}
                </div>
                <p className="cc-section-lbl">Customise Your Selections</p>
                <div className="cc-customise-block">
                  <div className="cc-customise-head">
                    <span className="cc-customise-title">{selectedCombo?.name}</span>
                    <span className="cc-customise-sub">Swap any piece below</span>
                  </div>
                  {selectedCombo?.includedCategories.map(catKey => (
                    <CategoryRow
                      key={catKey}
                      catKey={catKey}
                      label={CATEGORY_LABELS[catKey]}
                      products={PRODUCTS_BY_CATEGORY[catKey] || []}
                      selectedId={comboSelections[catKey]}
                      onSelect={handlePresetSelection}
                    />
                  ))}
                </div>
              </>
            )}

            {mode === 'custom' && (
              <>
                <p className="cc-section-lbl">Select Categories to Include</p>
                <div className="cc-add-cats">
                  {ALL_CATEGORIES.map(cat => (
                    <button
                      key={cat}
                      className={`cc-add-cat-btn${customCategories.includes(cat) ? ' added' : ''}`}
                      onClick={() => setCustomCategories(prev =>
                        prev.includes(cat) ? prev.filter(c => c !== cat) : [...prev, cat]
                      )}
                    >
                      {customCategories.includes(cat) ? '✓ ' : '+ '}
                      {CATEGORY_LABELS[cat]}
                    </button>
                  ))}
                </div>

                {customCategories.length > 0 && (
                  <>
                    <p className="cc-section-lbl">Choose Products From Each Category</p>
                    <div className="cc-custom-block">
                      {customCategories.map(catKey => (
                        <CategoryRowMulti
                          key={catKey}
                          catKey={catKey}
                          label={CATEGORY_LABELS[catKey]}
                          products={PRODUCTS_BY_CATEGORY[catKey] || []}
                          selectedIds={customSelectedIds[catKey] || []}
                          onToggle={handleCustomToggle}
                        />
                      ))}
                    </div>
                  </>
                )}
              </>
            )}
          </div>

          {/* Right summary */}
          <div>
            <div className="cc-summary">
              <div className="cc-summary-header">
                <div className="cc-summary-title">Your Combo Summary</div>
                <span className="cc-summary-mode">
                  {mode === 'preset' ? '◈ Curated Set' : '✦ Custom Build'}
                </span>
              </div>
              <div className="cc-summary-body">
                <div className="cc-summary-items">
                  {mode === 'preset' && selectedCombo ? (
                    selectedCombo.includedCategories.map(catKey => {
                      const selId = comboSelections[catKey];
                      const prod = PRODUCTS_BY_CATEGORY[catKey]?.find(p => p.id === selId);
                      if (!prod) return null;
                      return (
                        <div key={catKey} className="cc-sum-item">
                          {/* eslint-disable-next-line @next/next/no-img-element */}
                          <img className="cc-sum-item-img" src={prod.image} alt={prod.name} />
                          <div className="cc-sum-item-info">
                            <span className="cc-sum-item-cat">{CATEGORY_LABELS[catKey]}</span>
                            <span className="cc-sum-item-name">{prod.name}</span>
                          </div>
                          <span className="cc-sum-item-price">✓</span>
                        </div>
                      );
                    })
                  ) : mode === 'custom' ? (
                    customCategories.length === 0
                      ? <p className="cc-sum-empty">No categories selected yet.</p>
                      : customSummaryItems.length === 0
                        ? <p className="cc-sum-empty">No products selected yet.</p>
                        : customSummaryItems.map(({ catKey, prod }) => (
                            <div key={`${catKey}-${prod.id}`} className="cc-sum-item">
                              {/* eslint-disable-next-line @next/next/no-img-element */}
                              <img className="cc-sum-item-img" src={prod.image} alt={prod.name} />
                              <div className="cc-sum-item-info">
                                <span className="cc-sum-item-cat">{CATEGORY_LABELS[catKey]}</span>
                                <span className="cc-sum-item-name">{prod.name}</span>
                              </div>
                              <span className="cc-sum-item-price">₹{prod.price.toLocaleString('en-IN')}</span>
                            </div>
                          ))
                  ) : null}
                </div>

                <div className="cc-summary-divider" />

                <div className="cc-summary-total-row">
                  <span className="cc-summary-total-label">Total</span>
                  <span className="cc-summary-total-value">
                    ₹{(mode === 'preset' ? presetTotal : customTotal).toLocaleString('en-IN')}
                  </span>
                </div>

                {mode === 'preset' && selectedCombo && (
                  <p className="cc-summary-savings">
                    You save ₹{(selectedCombo.originalPrice - selectedCombo.price).toLocaleString('en-IN')} on this set 🎉
                  </p>
                )}

                <button className="cc-btn-add">
                  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z"/><line x1="3" y1="6" x2="21" y2="6"/><path d="M16 10a4 4 0 0 1-8 0"/></svg>
                  Add Combo to Cart
                </button>
                <button className="cc-btn-buy">
                  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M5 12h14M12 5l7 7-7 7"/></svg>
                  Buy It Now
                </button>
                <p className="cc-summary-note">Free shipping above ₹599 · COD available · Easy returns</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}