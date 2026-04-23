// // // 'use client';

// // // import { useState, useMemo, useCallback, type ChangeEvent } from 'react';

// // // type CategoryKey = 'necklace' | 'earrings' | 'bracelets' | 'rings' | 'gift-boxes' | 'keychains' | 'hair-accessories';

// // // interface ComboProduct {
// // //   id: number;
// // //   name: string;
// // //   price: number;
// // //   image: string;
// // //   customisable: boolean;
// // // }

// // // interface PresetCombo {
// // //   id: string;
// // //   name: string;
// // //   tagline: string;
// // //   price: number;
// // //   originalPrice: number;
// // //   image: string;
// // //   badge: string;
// // //   includedCategories: CategoryKey[];
// // //   defaultSelections: Partial<Record<CategoryKey, number>>;
// // // }

// // // // ─── All available products by category ──────────────────────────────────────
// // // const PRODUCTS_BY_CATEGORY: Record<CategoryKey, ComboProduct[]> = {
// // //   necklace: [
// // //     { id: 1, name: 'Dainty Layered Necklace', price: 1299, image: 'https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?w=400&q=80', customisable: false },
// // //     { id: 2, name: 'Pearl Pendant Necklace',  price: 2499, image: 'https://images.unsplash.com/photo-1573408301185-9519f94816b5?w=400&q=80', customisable: false },
// // //     { id: 3, name: 'Layered Gold Chain',       price: 1599, image: 'https://images.unsplash.com/photo-1611591437281-460bfbe1220a?w=400&q=80', customisable: false },
// // //   ],
// // //   earrings: [
// // //     { id: 4, name: 'Gold Hoop Earrings',    price: 899, image: 'https://images.unsplash.com/photo-1588444650733-d0f07d323dde?w=400&q=80', customisable: false },
// // //     { id: 5, name: 'Minimal Stud Earrings', price: 549, image: 'https://images.unsplash.com/photo-1605100804763-247f67b3557e?w=400&q=80', customisable: false },
// // //     { id: 6, name: 'Korean Ear Cuffs',      price: 699, image: 'https://images.unsplash.com/photo-1617038260897-41a1f14a8ca0?w=400&q=80', customisable: false },
// // //   ],
// // //   bracelets: [
// // //     { id: 7, name: 'Beaded Charm Bracelet', price: 749,  image: 'https://images.unsplash.com/photo-1602173574767-37ac01994b2a?w=400&q=80', customisable: false },
// // //     { id: 8, name: 'Kada Bangle Set',       price: 1899, image: 'https://images.unsplash.com/photo-1612817288484-6f916006741a?w=400&q=80', customisable: false },
// // //     { id: 9, name: 'Minimal Chain Bracelet',price: 999,  image: 'https://images.unsplash.com/photo-1612817288484-6f916006741a?w=400&q=80', customisable: false },
// // //   ],
// // //   rings: [
// // //     { id: 10, name: 'Diamond Ring',     price: 2999, image: 'https://images.unsplash.com/photo-1605100804763-247f67b3557e?w=400&q=80', customisable: false },
// // //     { id: 11, name: 'Minimal Gold Ring',price: 999,  image: 'https://images.unsplash.com/photo-1605100804763-247f67b3557e?w=400&q=80', customisable: false },
// // //     { id: 12, name: 'Couple Rings Set', price: 1999, image: 'https://images.unsplash.com/photo-1588444650733-d0f07d323dde?w=400&q=80', customisable: false },
// // //   ],
// // //   'gift-boxes': [
// // //     { id: 16, name: 'Luxury Gift Box',   price: 2499, image: 'https://images.unsplash.com/photo-1549465220-1a8b9238cd48?w=400&q=80', customisable: true },
// // //     { id: 17, name: 'Birthday Gift Box', price: 1999, image: 'https://images.unsplash.com/photo-1549465220-1a8b9238cd48?w=400&q=80', customisable: true },
// // //   ],
// // //   keychains: [
// // //     { id: 18, name: 'Personalised Keychain', price: 399, image: 'https://images.unsplash.com/photo-1582143570735-ebf7c44a5c54?w=400&q=80', customisable: true },
// // //     { id: 19, name: 'Metal Charm Keychain',  price: 499, image: 'https://images.unsplash.com/photo-1582143570735-ebf7c44a5c54?w=400&q=80', customisable: true },
// // //   ],
// // //   'hair-accessories': [
// // //     { id: 13, name: 'Elegant Hair Clip', price: 499, image: 'https://images.unsplash.com/photo-1591206422576-7e00ff5f7db7?w=400&q=80', customisable: false },
// // //     { id: 14, name: 'Pearl Hair Band',   price: 799, image: 'https://images.unsplash.com/photo-1591206422576-7e00ff5f7db7?w=400&q=80', customisable: false },
// // //     { id: 15, name: 'Floral Hair Pins',  price: 599, image: 'https://images.unsplash.com/photo-1591206422576-7e00ff5f7db7?w=400&q=80', customisable: false },
// // //   ],
// // // };

// // // const PRESET_COMBOS: PresetCombo[] = [
// // //   {
// // //     id: 'festive',
// // //     name: 'Festive Glow',
// // //     tagline: 'Celebrate every moment',
// // //     price: 2999,
// // //     originalPrice: 4500,
// // //     image: 'https://images.unsplash.com/photo-1602173574767-37ac01994b2a?w=600&q=85',
// // //     badge: 'Most Loved',
// // //     includedCategories: ['necklace', 'earrings', 'bracelets'],
// // //     defaultSelections: { necklace: 1, earrings: 4, bracelets: 7 },
// // //   },
// // //   {
// // //     id: 'bridal',
// // //     name: 'Bridal Radiance',
// // //     tagline: 'For your most beautiful day',
// // //     price: 5999,
// // //     originalPrice: 8800,
// // //     image: 'https://images.unsplash.com/photo-1573408301185-9519f94816b5?w=600&q=85',
// // //     badge: 'Premium',
// // //     includedCategories: ['necklace', 'earrings', 'rings', 'bracelets'],
// // //     defaultSelections: { necklace: 2, earrings: 4, rings: 10, bracelets: 8 },
// // //   },
// // //   {
// // //     id: 'minimal',
// // //     name: 'Minimal Edit',
// // //     tagline: 'Less is more, always',
// // //     price: 1999,
// // //     originalPrice: 2800,
// // //     image: 'https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?w=600&q=85',
// // //     badge: 'New',
// // //     includedCategories: ['necklace', 'earrings'],
// // //     defaultSelections: { necklace: 1, earrings: 5 },
// // //   },
// // //   {
// // //     id: 'gifting',
// // //     name: 'Gifting Special',
// // //     tagline: 'Curated with love',
// // //     price: 3499,
// // //     originalPrice: 5200,
// // //     image: 'https://images.unsplash.com/photo-1549465220-1a8b9238cd48?w=600&q=85',
// // //     badge: 'Gift Ready',
// // //     includedCategories: ['necklace', 'earrings', 'bracelets', 'gift-boxes'],
// // //     defaultSelections: { necklace: 3, earrings: 6, bracelets: 9, 'gift-boxes': 16 },
// // //   },
// // // ];

// // // const CATEGORY_LABELS: Record<CategoryKey, string> = {
// // //   necklace: 'Necklace',
// // //   earrings: 'Earrings',
// // //   bracelets: 'Bracelet',
// // //   rings: 'Ring',
// // //   'gift-boxes': 'Gift Box',
// // //   keychains: 'Keychain',
// // //   'hair-accessories': 'Hair Accessory',
// // // };

// // // // ─── Customisation mini-panel ─────────────────────────────────────────────────
// // // function MiniCustomPanel({ productName }: { productName: string }) {
// // //   const [text, setText] = useState('');
// // //   const [preview, setPreview] = useState<string | null>(null);

// // //   const handleFile = (e: ChangeEvent<HTMLInputElement>) => {
// // //     const f = e.currentTarget.files?.[0];
// // //     if (!f) return;
// // //     const r = new FileReader();
// // //     r.onload = (ev) => setPreview((ev.target?.result as string) || null);
// // //     r.readAsDataURL(f);
// // //   };

// // //   return (
// // //     <div className="cc-cust">
// // //       <div className="cc-cust-head">
// // //         <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>
// // //         Personalise your {productName}
// // //       </div>
// // //       <input
// // //         className="cc-cust-input"
// // //         placeholder="Add a name or message (e.g. 'Happy Birthday Sarah')…"
// // //         value={text}
// // //         onChange={e => setText(e.target.value)}
// // //         maxLength={80}
// // //       />
// // //       <label className="cc-cust-upload">
// // //         <input type="file" accept="image/*" style={{ display: 'none' }} onChange={handleFile} />
// // //         {preview
// // //           ? <img src={preview} alt="Preview" style={{ width: 36, height: 36, objectFit: 'cover', borderRadius: 6 }} />
// // //           : <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><rect x="3" y="3" width="18" height="18" rx="3"/><circle cx="8.5" cy="8.5" r="1.5"/><polyline points="21 15 16 10 5 21"/></svg>
// // //         }
// // //         <span>{preview ? 'Change photo' : 'Upload photo'}</span>
// // //       </label>
// // //     </div>
// // //   );
// // // }

// // // // ─── Product selector card (single-select, used in preset mode) ───────────────
// // // function ProductSelectCard({ product, selected, onSelect }: { product: ComboProduct; selected: boolean; onSelect: (id: number) => void }) {
// // //   return (
// // //     <button
// // //       className={`cc-prod-card${selected ? ' selected' : ''}`}
// // //       onClick={() => onSelect(product.id)}
// // //     >
// // //       <div className="cc-prod-img-wrap">
// // //         {/* eslint-disable-next-line @next/next/no-img-element */}
// // //         <img src={product.image} alt={product.name} />
// // //         {selected && (
// // //           <div className="cc-prod-check">
// // //             <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3"><polyline points="20 6 9 17 4 12"/></svg>
// // //           </div>
// // //         )}
// // //       </div>
// // //       <div className="cc-prod-info">
// // //         <span className="cc-prod-name">{product.name}</span>
// // //         <span className="cc-prod-price">₹{product.price.toLocaleString('en-IN')}</span>
// // //       </div>
// // //     </button>
// // //   );
// // // }

// // // // ─── Product selector card (multi-select, used in custom mode) ────────────────
// // // function ProductMultiSelectCard({ product, selected, onToggle }: { product: ComboProduct; selected: boolean; onToggle: (id: number) => void }) {
// // //   return (
// // //     <button
// // //       className={`cc-prod-card${selected ? ' selected' : ''}`}
// // //       onClick={() => onToggle(product.id)}
// // //     >
// // //       <div className="cc-prod-img-wrap">
// // //         {/* eslint-disable-next-line @next/next/no-img-element */}
// // //         <img src={product.image} alt={product.name} />
// // //         {selected && (
// // //           <div className="cc-prod-check">
// // //             <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3"><polyline points="20 6 9 17 4 12"/></svg>
// // //           </div>
// // //         )}
// // //       </div>
// // //       <div className="cc-prod-info">
// // //         <span className="cc-prod-name">{product.name}</span>
// // //         <span className="cc-prod-price">₹{product.price.toLocaleString('en-IN')}</span>
// // //       </div>
// // //     </button>
// // //   );
// // // }

// // // // ─── Category row (single-select, preset mode) ────────────────────────────────
// // // function CategoryRow({ catKey, products, selectedId, onSelect, label }: {
// // //   catKey: CategoryKey;
// // //   products: ComboProduct[];
// // //   selectedId?: number;
// // //   onSelect: (catKey: CategoryKey, id: number) => void;
// // //   label: string;
// // // }) {
// // //   const selectedProduct = products.find(p => p.id === selectedId);
// // //   const [expanded, setExpanded] = useState(false);

// // //   return (
// // //     <div className="cc-cat-row">
// // //       <div className="cc-cat-row-head" onClick={() => setExpanded(e => !e)}>
// // //         <div className="cc-cat-row-left">
// // //           <span className="cc-cat-num">
// // //             {selectedProduct
// // //               ? <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="var(--gold)" strokeWidth="3"><polyline points="20 6 9 17 4 12"/></svg>
// // //               : '·'}
// // //           </span>
// // //           <span className="cc-cat-label">{label}</span>
// // //           {selectedProduct && (
// // //             <span className="cc-cat-selected-name">{selectedProduct.name}</span>
// // //           )}
// // //         </div>
// // //         <div className="cc-cat-row-right">
// // //           {selectedProduct && <span className="cc-cat-price">₹{selectedProduct.price.toLocaleString('en-IN')}</span>}
// // //           <svg className={`cc-cat-chevron${expanded ? ' open' : ''}`} width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="6 9 12 15 18 9"/></svg>
// // //         </div>
// // //       </div>

// // //       {expanded && (
// // //         <div className="cc-cat-products">
// // //           {products.map(p => (
// // //             <ProductSelectCard
// // //               key={p.id}
// // //               product={p}
// // //               selected={selectedId === p.id}
// // //               onSelect={(id) => { onSelect(catKey, id); }}
// // //             />
// // //           ))}
// // //         </div>
// // //       )}

// // //       {expanded && selectedProduct?.customisable && (
// // //         <MiniCustomPanel productName={selectedProduct.name} />
// // //       )}
// // //     </div>
// // //   );
// // // }

// // // // ─── Category row (multi-select, custom mode) ─────────────────────────────────
// // // function CategoryRowMulti({ catKey, products, selectedIds, onToggle, label }: {
// // //   catKey: CategoryKey;
// // //   products: ComboProduct[];
// // //   selectedIds: number[];
// // //   onToggle: (catKey: CategoryKey, id: number) => void;
// // //   label: string;
// // // }) {
// // //   const [expanded, setExpanded] = useState(false);
// // //   const count = selectedIds.length;
// // //   const anyCustomisable = selectedIds.some(id => {
// // //     const p = products.find(p => p.id === id);
// // //     return p?.customisable;
// // //   });

// // //   return (
// // //     <div className="cc-cat-row">
// // //       <div className="cc-cat-row-head" onClick={() => setExpanded(e => !e)}>
// // //         <div className="cc-cat-row-left">
// // //           <span className="cc-cat-num">
// // //             {count > 0
// // //               ? <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="var(--gold)" strokeWidth="3"><polyline points="20 6 9 17 4 12"/></svg>
// // //               : '·'}
// // //           </span>
// // //           <span className="cc-cat-label">{label}</span>
// // //           {count > 0 && (
// // //             <span className="cc-cat-selected-name">{count} selected</span>
// // //           )}
// // //         </div>
// // //         <div className="cc-cat-row-right">
// // //           <svg className={`cc-cat-chevron${expanded ? ' open' : ''}`} width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="6 9 12 15 18 9"/></svg>
// // //         </div>
// // //       </div>

// // //       {expanded && (
// // //         <div className="cc-cat-products">
// // //           {products.map(p => (
// // //             <ProductMultiSelectCard
// // //               key={p.id}
// // //               product={p}
// // //               selected={selectedIds.includes(p.id)}
// // //               onToggle={(id) => onToggle(catKey, id)}
// // //             />
// // //           ))}
// // //         </div>
// // //       )}

// // //       {expanded && anyCustomisable && (
// // //         <MiniCustomPanel productName={label} />
// // //       )}
// // //     </div>
// // //   );
// // // }

// // // // ─── Preset combo card ────────────────────────────────────────────────────────
// // // function PresetComboCard({ combo, selected, onSelect }: { combo: PresetCombo; selected: boolean; onSelect: (id: string) => void }) {
// // //   const discount = Math.round(((combo.originalPrice - combo.price) / combo.originalPrice) * 100);
// // //   return (
// // //     <button className={`cc-preset-card${selected ? ' selected' : ''}`} onClick={() => onSelect(combo.id)}>
// // //       <div className="cc-preset-img">
// // //         {/* eslint-disable-next-line @next/next/no-img-element */}
// // //         <img src={combo.image} alt={combo.name} />
// // //         <div className="cc-preset-grad" />
// // //         <span className="cc-preset-badge">{combo.badge}</span>
// // //         {selected && <div className="cc-preset-selected-ring" />}
// // //       </div>
// // //       <div className="cc-preset-body">
// // //         <span className="cc-preset-name">{combo.name}</span>
// // //         <span className="cc-preset-tagline">{combo.tagline}</span>
// // //         <div className="cc-preset-price-row">
// // //           <span className="cc-preset-price">₹{combo.price.toLocaleString('en-IN')}</span>
// // //           <span className="cc-preset-original">₹{combo.originalPrice.toLocaleString('en-IN')}</span>
// // //           <span className="cc-preset-off">{discount}% off</span>
// // //         </div>
// // //         <div className="cc-preset-includes">
// // //           {combo.includedCategories.map(c => (
// // //             <span key={c} className="cc-preset-tag">{CATEGORY_LABELS[c]}</span>
// // //           ))}
// // //         </div>
// // //       </div>
// // //     </button>
// // //   );
// // // }

// // // // ─── Main page ────────────────────────────────────────────────────────────────
// // // export default function CuratedCombosPage() {
// // //   const [mode, setMode] = useState<'preset' | 'custom'>('preset');

// // //   const [selectedComboId, setSelectedComboId] = useState('festive');
// // //   const [comboSelections, setComboSelections] = useState<Partial<Record<CategoryKey, number>>>(() => {
// // //     const combo = PRESET_COMBOS.find(c => c.id === 'festive');
// // //     return combo ? { ...combo.defaultSelections } : {};
// // //   });

// // //   // custom mode: selectedIds is an object of catKey -> array of selected product ids
// // //   const [customSelectedIds, setCustomSelectedIds] = useState<Partial<Record<CategoryKey, number[]>>>({});
// // //   const [customCategories, setCustomCategories] = useState<CategoryKey[]>(['necklace', 'earrings']);

// // //   const selectedCombo = PRESET_COMBOS.find(c => c.id === selectedComboId);

// // //   const handleComboSelect = useCallback((id: string) => {
// // //     setSelectedComboId(id);
// // //     const combo = PRESET_COMBOS.find(c => c.id === id);
// // //     if (!combo) return;
// // //     setComboSelections({ ...combo.defaultSelections });
// // //   }, []);

// // //   const handlePresetSelection = useCallback((catKey: CategoryKey, productId: number) => {
// // //     setComboSelections(prev => ({ ...prev, [catKey]: productId }));
// // //   }, []);

// // //   // Toggle a product id in/out of the multi-select array for a category
// // //   const handleCustomToggle = useCallback((catKey: CategoryKey, productId: number) => {
// // //     setCustomSelectedIds(prev => {
// // //       const current = prev[catKey] || [];
// // //       const already = current.includes(productId);
// // //       return {
// // //         ...prev,
// // //         [catKey]: already ? current.filter(id => id !== productId) : [...current, productId],
// // //       };
// // //     });
// // //   }, []);

// // //   const customTotal = useMemo(() => {
// // //     return customCategories.reduce((sum, cat) => {
// // //       const ids = customSelectedIds[cat] || [];
// // //       return sum + ids.reduce((s, id) => {
// // //         const prod = PRODUCTS_BY_CATEGORY[cat]?.find(p => p.id === id);
// // //         return s + (prod?.price || 0);
// // //       }, 0);
// // //     }, 0);
// // //   }, [customSelectedIds, customCategories]);

// // //   const presetTotal = selectedCombo?.price || 0;
// // //   const ALL_CATEGORIES = Object.keys(PRODUCTS_BY_CATEGORY) as CategoryKey[];

// // //   // Flatten all selected custom items for the summary panel
// // //   const customSummaryItems = useMemo(() => {
// // //     const items: Array<{ catKey: CategoryKey; prod: ComboProduct }> = [];
// // //     customCategories.forEach(cat => {
// // //       const ids = customSelectedIds[cat] || [];
// // //       ids.forEach(id => {
// // //         const prod = PRODUCTS_BY_CATEGORY[cat]?.find(p => p.id === id);
// // //         if (prod) items.push({ catKey: cat, prod });
// // //       });
// // //     });
// // //     return items;
// // //   }, [customSelectedIds, customCategories]);

// // //   return (
// // //     <>
// // //       <style>{`
// // //         @import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,300;0,400;0,600;1,300;1,400&family=Jost:wght@200;300;400;500;600&display=swap');

// // //         :root {
// // //           --beige:     #f5f0e8;
// // //           --beige-dk:  #ede5d5;
// // //           --beige-dkr: #d9cdb8;
// // //           --olive-900: #1a1f0d;
// // //           --olive-600: #3d4a22;
// // //           --olive-500: #5a6b2e;
// // //           --olive-400: #7a8e3c;
// // //           --olive-50:  #f2f4e8;
// // //           --gold:      #c9a84c;
// // //           --ink:       #1e2310;
// // //           --mist:      rgba(30,35,16,.45);
// // //           --green:     #2e7d32;
// // //         }
// // //         *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

// // //         .cc {
// // //           min-height: 100vh;
// // //           background: var(--beige);
// // //           background-image:
// // //             radial-gradient(ellipse 80% 30% at 50% -5%, rgba(201,168,76,.08) 0%, transparent 60%),
// // //             radial-gradient(ellipse 40% 50% at 100% 100%, rgba(90,110,35,.07) 0%, transparent 55%);
// // //           font-family: 'Jost', sans-serif;
// // //           color: var(--ink);
// // //         }
// // //         .cc-topbar {
// // //           display: flex; align-items: center; justify-content: space-between;
// // //           padding: 16px 52px;
// // //           border-bottom: 1px solid rgba(61,74,34,.1);
// // //           background: rgba(245,240,232,.85);
// // //           backdrop-filter: blur(12px);
// // //           position: sticky; top: 0; z-index: 100;
// // //         }
// // //         .cc-logo {
// // //           font-family: 'Cormorant Garamond', serif;
// // //           font-size: 22px; font-weight: 300; letter-spacing: .14em;
// // //           color: var(--olive-600); text-decoration: none;
// // //         }
// // //         .cc-logo em { font-style: italic; color: var(--gold); }
// // //         .cc-nav { display: flex; gap: 28px; }
// // //         .cc-nav a {
// // //           font-size: 10px; letter-spacing: .28em; text-transform: uppercase;
// // //           color: var(--mist); text-decoration: none; font-weight: 500; transition: color .2s;
// // //         }
// // //         .cc-nav a:hover, .cc-nav a.active { color: var(--olive-600); }

// // //         .cc-hero {
// // //           padding: 48px 52px 32px;
// // //           border-bottom: 1px solid rgba(61,74,34,.08);
// // //           animation: ccFadeUp .65s ease both;
// // //         }
// // //         .cc-hero-eyebrow {
// // //           font-size: 9px; letter-spacing: .5em; text-transform: uppercase;
// // //           color: var(--gold); margin-bottom: 12px;
// // //           display: flex; align-items: center; gap: 12px;
// // //         }
// // //         .cc-hero-eyebrow::before { content: ''; width: 32px; height: 1px; background: linear-gradient(90deg, var(--gold), transparent); }
// // //         .cc-hero h1 {
// // //           font-family: 'Cormorant Garamond', serif;
// // //           font-size: clamp(2.2rem, 4.5vw, 3.8rem);
// // //           font-weight: 300; color: var(--olive-600); line-height: 1.08; letter-spacing: -.02em;
// // //         }
// // //         .cc-hero h1 em { font-style: italic; color: var(--gold); }
// // //         .cc-hero-desc {
// // //           font-size: 12px; font-weight: 300; color: var(--mist);
// // //           max-width: 520px; line-height: 1.8; margin-top: 10px; letter-spacing: .04em;
// // //         }

// // //         .cc-mode-strip {
// // //           padding: 24px 52px 0;
// // //           animation: ccFadeUp .65s ease .08s both;
// // //         }
// // //         .cc-mode-toggle {
// // //           display: inline-flex;
// // //           background: white;
// // //           border: 1.5px solid var(--beige-dkr);
// // //           border-radius: 50px;
// // //           padding: 4px; gap: 4px;
// // //         }
// // //         .cc-mode-btn {
// // //           font-family: 'Jost', sans-serif;
// // //           font-size: 10px; font-weight: 600; letter-spacing: .16em; text-transform: uppercase;
// // //           padding: 10px 24px; border-radius: 50px; border: none; cursor: pointer;
// // //           transition: all .25s; background: transparent; color: var(--mist);
// // //         }
// // //         .cc-mode-btn.active {
// // //           background: var(--olive-600); color: var(--beige);
// // //           box-shadow: 0 4px 14px rgba(61,74,34,.25);
// // //         }
// // //         .cc-mode-desc {
// // //           font-size: 11px; font-weight: 300; color: var(--mist);
// // //           letter-spacing: .04em; margin-top: 10px; line-height: 1.6;
// // //         }

// // //         .cc-body {
// // //           display: grid;
// // //           grid-template-columns: 1fr 360px;
// // //           gap: 32px;
// // //           padding: 28px 52px 72px;
// // //           align-items: start;
// // //           animation: ccFadeUp .65s ease .14s both;
// // //         }

// // //         .cc-section-lbl {
// // //           font-size: 9px; letter-spacing: .4em; text-transform: uppercase;
// // //           color: var(--mist); font-weight: 500; margin-bottom: 16px;
// // //         }

// // //         /* Preset cards */
// // //         .cc-preset-grid {
// // //           display: grid;
// // //           grid-template-columns: repeat(auto-fill, minmax(210px, 1fr));
// // //           gap: 16px; margin-bottom: 32px;
// // //         }
// // //         .cc-preset-card {
// // //           background: white; border: 2px solid var(--beige-dkr);
// // //           border-radius: 18px; overflow: hidden; cursor: pointer;
// // //           text-align: left; transition: border-color .22s, box-shadow .22s, transform .18s; padding: 0;
// // //         }
// // //         .cc-preset-card:hover { border-color: var(--olive-400); box-shadow: 0 8px 32px rgba(61,74,34,.1); transform: translateY(-2px); }
// // //         .cc-preset-card.selected { border-color: var(--gold); box-shadow: 0 0 0 3px rgba(201,168,76,.18), 0 8px 28px rgba(61,74,34,.1); }
// // //         .cc-preset-img { position: relative; aspect-ratio: 3/2; overflow: hidden; }
// // //         .cc-preset-img img { width: 100%; height: 100%; object-fit: cover; transition: transform .45s; }
// // //         .cc-preset-card:hover .cc-preset-img img { transform: scale(1.06); }
// // //         .cc-preset-grad { position: absolute; inset: 0; background: linear-gradient(to top, rgba(30,35,16,.55) 0%, transparent 50%); }
// // //         .cc-preset-badge {
// // //           position: absolute; top: 10px; left: 10px;
// // //           font-size: 8px; font-weight: 700; letter-spacing: .14em; text-transform: uppercase;
// // //           color: var(--ink); background: var(--gold); padding: 4px 10px; border-radius: 4px;
// // //         }
// // //         .cc-preset-selected-ring { position: absolute; inset: 0; border: 3px solid var(--gold); pointer-events: none; }
// // //         .cc-preset-body { padding: 14px 16px 16px; }
// // //         .cc-preset-name { display: block; font-family: 'Cormorant Garamond', serif; font-size: 1.1rem; font-weight: 400; color: var(--olive-600); margin-bottom: 3px; }
// // //         .cc-preset-tagline { display: block; font-size: 10px; color: var(--mist); letter-spacing: .06em; margin-bottom: 10px; }
// // //         .cc-preset-price-row { display: flex; align-items: baseline; gap: 8px; margin-bottom: 8px; }
// // //         .cc-preset-price { font-family: 'Cormorant Garamond', serif; font-size: 1.3rem; font-weight: 600; color: var(--ink); }
// // //         .cc-preset-original { font-size: 11px; color: var(--mist); text-decoration: line-through; }
// // //         .cc-preset-off { font-size: 9px; font-weight: 700; letter-spacing: .06em; color: var(--beige); background: var(--olive-500); padding: 2px 7px; border-radius: 4px; text-transform: uppercase; }
// // //         .cc-preset-includes { display: flex; flex-wrap: wrap; gap: 5px; }
// // //         .cc-preset-tag { font-size: 8.5px; letter-spacing: .1em; text-transform: uppercase; color: var(--mist); border: 1px solid var(--beige-dkr); padding: 2px 8px; border-radius: 50px; }

// // //         /* Customise block */
// // //         .cc-customise-block { background: white; border: 1.5px solid var(--beige-dkr); border-radius: 18px; overflow: hidden; }
// // //         .cc-customise-head {
// // //           padding: 16px 20px; border-bottom: 1px solid var(--beige-dkr);
// // //           display: flex; align-items: center; justify-content: space-between;
// // //         }
// // //         .cc-customise-title { font-size: 11px; font-weight: 600; letter-spacing: .12em; text-transform: uppercase; color: var(--olive-600); }
// // //         .cc-customise-sub { font-size: 10px; color: var(--mist); letter-spacing: .04em; }

// // //         /* Category rows */
// // //         .cc-cat-row { border-bottom: 1px solid rgba(61,74,34,.07); }
// // //         .cc-cat-row:last-child { border-bottom: none; }
// // //         .cc-cat-row-head {
// // //           display: flex; align-items: center; justify-content: space-between;
// // //           padding: 13px 20px; cursor: pointer; transition: background .15s;
// // //         }
// // //         .cc-cat-row-head:hover { background: var(--olive-50); }
// // //         .cc-cat-row-left { display: flex; align-items: center; gap: 10px; }
// // //         .cc-cat-num {
// // //           width: 20px; height: 20px; display: flex; align-items: center; justify-content: center;
// // //           font-size: 9px; font-weight: 600; color: var(--mist);
// // //           background: var(--beige-dk); border-radius: 50%; flex-shrink: 0;
// // //         }
// // //         .cc-cat-label { font-size: 11px; font-weight: 600; letter-spacing: .08em; text-transform: uppercase; color: var(--olive-600); }
// // //         .cc-cat-selected-name { font-size: 10.5px; color: var(--mist); font-weight: 300; }
// // //         .cc-cat-row-right { display: flex; align-items: center; gap: 10px; }
// // //         .cc-cat-price { font-size: 11px; font-weight: 600; color: var(--ink); }
// // //         .cc-cat-chevron { color: var(--mist); transition: transform .25s; }
// // //         .cc-cat-chevron.open { transform: rotate(180deg); }
// // //         .cc-cat-products {
// // //           display: grid; grid-template-columns: repeat(auto-fill, minmax(130px, 1fr));
// // //           gap: 10px; padding: 4px 20px 16px;
// // //         }
// // //         .cc-prod-card {
// // //           background: transparent; border: 1.5px solid var(--beige-dkr);
// // //           border-radius: 12px; overflow: hidden; cursor: pointer; text-align: left;
// // //           transition: border-color .2s, box-shadow .2s; padding: 0;
// // //         }
// // //         .cc-prod-card:hover { border-color: var(--olive-400); }
// // //         .cc-prod-card.selected { border-color: var(--gold); box-shadow: 0 0 0 2px rgba(201,168,76,.2); }
// // //         .cc-prod-img-wrap { position: relative; aspect-ratio: 1; overflow: hidden; }
// // //         .cc-prod-img-wrap img { width: 100%; height: 100%; object-fit: cover; transition: transform .35s; }
// // //         .cc-prod-card:hover .cc-prod-img-wrap img { transform: scale(1.07); }
// // //         .cc-prod-check {
// // //           position: absolute; top: 6px; right: 6px; width: 22px; height: 22px;
// // //           border-radius: 50%; background: var(--gold);
// // //           display: flex; align-items: center; justify-content: center;
// // //         }
// // //         .cc-prod-info { padding: 8px 10px; }
// // //         .cc-prod-name { display: block; font-size: 10px; font-weight: 500; color: var(--ink); margin-bottom: 3px; line-height: 1.3; }
// // //         .cc-prod-price { display: block; font-size: 10.5px; font-weight: 600; color: var(--olive-600); }

// // //         /* Customisation mini panel */
// // //         .cc-cust {
// // //           margin: 0 20px 16px;
// // //           background: linear-gradient(135deg, rgba(201,168,76,.07), rgba(90,110,35,.05));
// // //           border: 1px solid rgba(201,168,76,.25); border-radius: 12px; padding: 12px 14px;
// // //         }
// // //         .cc-cust-head {
// // //           display: flex; align-items: center; gap: 7px;
// // //           font-size: 10px; font-weight: 700; letter-spacing: .1em; text-transform: uppercase;
// // //           color: #8c6b20; margin-bottom: 10px;
// // //         }
// // //         .cc-cust-input {
// // //           width: 100%; border: 1.5px solid var(--beige-dkr); border-radius: 8px; padding: 8px 12px;
// // //           font-family: 'Jost', sans-serif; font-size: 11px; color: var(--ink); background: white;
// // //           outline: none; margin-bottom: 8px; transition: border-color .2s;
// // //         }
// // //         .cc-cust-input:focus { border-color: var(--olive-400); }
// // //         .cc-cust-input::placeholder { color: rgba(30,35,16,.3); }
// // //         .cc-cust-upload {
// // //           display: inline-flex; align-items: center; gap: 7px;
// // //           font-size: 10px; font-weight: 600; letter-spacing: .1em; text-transform: uppercase;
// // //           color: var(--olive-600); border: 1.5px dashed var(--beige-dkr);
// // //           border-radius: 8px; padding: 7px 14px; cursor: pointer;
// // //           transition: border-color .2s, background .2s; background: white;
// // //         }
// // //         .cc-cust-upload:hover { border-color: var(--olive-400); background: var(--olive-50); }

// // //         /* Custom mode */
// // //         .cc-add-cats { display: flex; flex-wrap: wrap; gap: 8px; margin-bottom: 24px; }
// // //         .cc-add-cat-btn {
// // //           font-family: 'Jost', sans-serif;
// // //           font-size: 9.5px; font-weight: 600; letter-spacing: .14em; text-transform: uppercase;
// // //           color: var(--mist); padding: 7px 16px;
// // //           border: 1.5px solid rgba(61,74,34,.15); border-radius: 50px;
// // //           background: transparent; cursor: pointer; transition: all .2s;
// // //         }
// // //         .cc-add-cat-btn:hover { color: var(--olive-600); border-color: var(--olive-400); background: var(--olive-50); }
// // //         .cc-add-cat-btn.added { color: var(--beige); background: var(--olive-600); border-color: var(--olive-600); }
// // //         .cc-custom-block { background: white; border: 1.5px solid var(--beige-dkr); border-radius: 18px; overflow: hidden; }

// // //         /* Summary */
// // //         .cc-summary {
// // //           position: sticky; top: 85px;
// // //           background: white; border: 1.5px solid var(--beige-dkr); border-radius: 20px; overflow: hidden;
// // //         }
// // //         .cc-summary-header {
// // //           padding: 20px 22px 16px; border-bottom: 1px solid var(--beige-dkr);
// // //           background: linear-gradient(135deg, var(--olive-50), var(--beige-dk));
// // //         }
// // //         .cc-summary-title { font-family: 'Cormorant Garamond', serif; font-size: 1.1rem; font-weight: 400; color: var(--olive-600); }
// // //         .cc-summary-mode { font-size: 9px; font-weight: 600; letter-spacing: .2em; text-transform: uppercase; color: var(--gold); margin-top: 3px; display: block; }
// // //         .cc-summary-body { padding: 16px 22px; }
// // //         .cc-summary-items { margin-bottom: 16px; }
// // //         .cc-sum-item { display: flex; align-items: center; gap: 10px; padding: 8px 0; border-bottom: 1px solid rgba(61,74,34,.06); }
// // //         .cc-sum-item:last-child { border-bottom: none; }
// // //         .cc-sum-item-img { width: 40px; height: 40px; border-radius: 8px; object-fit: cover; flex-shrink: 0; border: 1px solid var(--beige-dkr); }
// // //         .cc-sum-item-info { flex: 1; }
// // //         .cc-sum-item-cat { font-size: 8.5px; letter-spacing: .14em; text-transform: uppercase; color: var(--mist); display: block; }
// // //         .cc-sum-item-name { font-size: 11px; font-weight: 500; color: var(--ink); display: block; }
// // //         .cc-sum-item-price { font-size: 11px; font-weight: 600; color: var(--olive-600); }
// // //         .cc-sum-empty { font-size: 11px; font-weight: 300; color: var(--mist); text-align: center; padding: 16px 0; letter-spacing: .04em; font-style: italic; }
// // //         .cc-summary-divider { height: 1px; background: linear-gradient(90deg, rgba(61,74,34,.1), rgba(201,168,76,.2), rgba(61,74,34,.1)); margin: 12px 0; }
// // //         .cc-summary-total-row { display: flex; justify-content: space-between; align-items: baseline; margin-bottom: 6px; }
// // //         .cc-summary-total-label { font-size: 10px; letter-spacing: .1em; text-transform: uppercase; color: var(--mist); }
// // //         .cc-summary-total-value { font-family: 'Cormorant Garamond', serif; font-size: 1.6rem; font-weight: 600; color: var(--ink); }
// // //         .cc-summary-savings { font-size: 10px; font-weight: 600; color: var(--green); margin-bottom: 14px; letter-spacing: .04em; }
// // //         .cc-btn-add {
// // //           display: flex; align-items: center; justify-content: center; gap: 8px; width: 100%;
// // //           font-family: 'Jost', sans-serif; font-size: 11px; font-weight: 700; letter-spacing: .16em; text-transform: uppercase;
// // //           color: var(--beige); background: var(--olive-900); border: none; border-radius: 50px; padding: 15px;
// // //           cursor: pointer; margin-bottom: 10px; transition: background .22s;
// // //         }
// // //         .cc-btn-add:hover { background: var(--olive-600); }
// // //         .cc-btn-buy {
// // //           display: flex; align-items: center; justify-content: center; gap: 8px; width: 100%;
// // //           font-family: 'Jost', sans-serif; font-size: 11px; font-weight: 700; letter-spacing: .16em; text-transform: uppercase;
// // //           color: var(--beige); background: var(--gold); border: none; border-radius: 50px; padding: 15px;
// // //           cursor: pointer; transition: background .22s;
// // //         }
// // //         .cc-btn-buy:hover { background: #b8902b; }
// // //         .cc-summary-note { font-size: 9.5px; color: var(--mist); text-align: center; margin-top: 12px; line-height: 1.6; letter-spacing: .03em; }

// // //         @keyframes ccFadeUp { from { opacity: 0; transform: translateY(16px); } to { opacity: 1; transform: translateY(0); } }

// // //         @media (max-width: 960px) {
// // //           .cc-body { grid-template-columns: 1fr; }
// // //           .cc-summary { position: static; }
// // //           .cc-topbar, .cc-hero, .cc-mode-strip, .cc-body { padding-left: 24px; padding-right: 24px; }
// // //           .cc-nav { display: none; }
// // //         }
// // //         @media (max-width: 520px) {
// // //           .cc-topbar, .cc-hero, .cc-mode-strip, .cc-body { padding-left: 16px; padding-right: 16px; }
// // //           .cc-preset-grid { grid-template-columns: 1fr 1fr; }
// // //         }
// // //       `}</style>

// // //       <div className="cc">
// // //         <nav className="cc-topbar">
// // //           <a href="/" className="cc-logo">Mai<em>son</em></a>
// // //           <div className="cc-nav">
// // //             <a href="#">Collections</a>
// // //             <a href="#" className="active">Shop</a>
// // //             <a href="#">About</a>
// // //           </div>
// // //         </nav>

// // //         <div className="cc-hero">
// // //           <div className="cc-hero-eyebrow">Women · Jewellery · Curated Combos</div>
// // //           <h1>Build Your <em>Perfect</em> Set</h1>
// // //           <p className="cc-hero-desc">
// // //             Choose a curated combo and swap pieces to your liking — or build something entirely your own. Every combination is handpicked for harmony.
// // //           </p>
// // //         </div>

// // //         <div className="cc-mode-strip">
// // //           <div className="cc-mode-toggle">
// // //             <button className={`cc-mode-btn${mode === 'preset' ? ' active' : ''}`} onClick={() => setMode('preset')}>
// // //               ◈ Curated Sets
// // //             </button>
// // //             <button className={`cc-mode-btn${mode === 'custom' ? ' active' : ''}`} onClick={() => setMode('custom')}>
// // //               ✦ Build Your Own
// // //             </button>
// // //           </div>
// // //           <p className="cc-mode-desc">
// // //             {mode === 'preset'
// // //               ? 'Pick a pre-curated combo at a fixed price — then swap individual pieces within each category to match your taste.'
// // //               : 'Select any categories you like and choose as many products as you want from each. Price is calculated dynamically.'}
// // //           </p>
// // //         </div>

// // //         <div className="cc-body">
// // //           {/* Left column */}
// // //           <div>
// // //             {mode === 'preset' && (
// // //               <>
// // //                 <p className="cc-section-lbl">Choose a Combo Set</p>
// // //                 <div className="cc-preset-grid">
// // //                   {PRESET_COMBOS.map(combo => (
// // //                     <PresetComboCard key={combo.id} combo={combo} selected={selectedComboId === combo.id} onSelect={handleComboSelect} />
// // //                   ))}
// // //                 </div>
// // //                 <p className="cc-section-lbl">Customise Your Selections</p>
// // //                 <div className="cc-customise-block">
// // //                   <div className="cc-customise-head">
// // //                     <span className="cc-customise-title">{selectedCombo?.name}</span>
// // //                     <span className="cc-customise-sub">Swap any piece below</span>
// // //                   </div>
// // //                   {selectedCombo?.includedCategories.map(catKey => (
// // //                     <CategoryRow
// // //                       key={catKey}
// // //                       catKey={catKey}
// // //                       label={CATEGORY_LABELS[catKey]}
// // //                       products={PRODUCTS_BY_CATEGORY[catKey] || []}
// // //                       selectedId={comboSelections[catKey]}
// // //                       onSelect={handlePresetSelection}
// // //                     />
// // //                   ))}
// // //                 </div>
// // //               </>
// // //             )}

// // //             {mode === 'custom' && (
// // //               <>
// // //                 <p className="cc-section-lbl">Select Categories to Include</p>
// // //                 <div className="cc-add-cats">
// // //                   {ALL_CATEGORIES.map(cat => (
// // //                     <button
// // //                       key={cat}
// // //                       className={`cc-add-cat-btn${customCategories.includes(cat) ? ' added' : ''}`}
// // //                       onClick={() => setCustomCategories(prev =>
// // //                         prev.includes(cat) ? prev.filter(c => c !== cat) : [...prev, cat]
// // //                       )}
// // //                     >
// // //                       {customCategories.includes(cat) ? '✓ ' : '+ '}
// // //                       {CATEGORY_LABELS[cat]}
// // //                     </button>
// // //                   ))}
// // //                 </div>

// // //                 {customCategories.length > 0 && (
// // //                   <>
// // //                     <p className="cc-section-lbl">Choose Products From Each Category</p>
// // //                     <div className="cc-custom-block">
// // //                       {customCategories.map(catKey => (
// // //                         <CategoryRowMulti
// // //                           key={catKey}
// // //                           catKey={catKey}
// // //                           label={CATEGORY_LABELS[catKey]}
// // //                           products={PRODUCTS_BY_CATEGORY[catKey] || []}
// // //                           selectedIds={customSelectedIds[catKey] || []}
// // //                           onToggle={handleCustomToggle}
// // //                         />
// // //                       ))}
// // //                     </div>
// // //                   </>
// // //                 )}
// // //               </>
// // //             )}
// // //           </div>

// // //           {/* Right summary */}
// // //           <div>
// // //             <div className="cc-summary">
// // //               <div className="cc-summary-header">
// // //                 <div className="cc-summary-title">Your Combo Summary</div>
// // //                 <span className="cc-summary-mode">
// // //                   {mode === 'preset' ? '◈ Curated Set' : '✦ Custom Build'}
// // //                 </span>
// // //               </div>
// // //               <div className="cc-summary-body">
// // //                 <div className="cc-summary-items">
// // //                   {mode === 'preset' && selectedCombo ? (
// // //                     selectedCombo.includedCategories.map(catKey => {
// // //                       const selId = comboSelections[catKey];
// // //                       const prod = PRODUCTS_BY_CATEGORY[catKey]?.find(p => p.id === selId);
// // //                       if (!prod) return null;
// // //                       return (
// // //                         <div key={catKey} className="cc-sum-item">
// // //                           {/* eslint-disable-next-line @next/next/no-img-element */}
// // //                           <img className="cc-sum-item-img" src={prod.image} alt={prod.name} />
// // //                           <div className="cc-sum-item-info">
// // //                             <span className="cc-sum-item-cat">{CATEGORY_LABELS[catKey]}</span>
// // //                             <span className="cc-sum-item-name">{prod.name}</span>
// // //                           </div>
// // //                           <span className="cc-sum-item-price">✓</span>
// // //                         </div>
// // //                       );
// // //                     })
// // //                   ) : mode === 'custom' ? (
// // //                     customCategories.length === 0
// // //                       ? <p className="cc-sum-empty">No categories selected yet.</p>
// // //                       : customSummaryItems.length === 0
// // //                         ? <p className="cc-sum-empty">No products selected yet.</p>
// // //                         : customSummaryItems.map(({ catKey, prod }) => (
// // //                             <div key={`${catKey}-${prod.id}`} className="cc-sum-item">
// // //                               {/* eslint-disable-next-line @next/next/no-img-element */}
// // //                               <img className="cc-sum-item-img" src={prod.image} alt={prod.name} />
// // //                               <div className="cc-sum-item-info">
// // //                                 <span className="cc-sum-item-cat">{CATEGORY_LABELS[catKey]}</span>
// // //                                 <span className="cc-sum-item-name">{prod.name}</span>
// // //                               </div>
// // //                               <span className="cc-sum-item-price">₹{prod.price.toLocaleString('en-IN')}</span>
// // //                             </div>
// // //                           ))
// // //                   ) : null} 
// // //                 </div>

// // //                 <div className="cc-summary-divider" />

// // //                 <div className="cc-summary-total-row">
// // //                   <span className="cc-summary-total-label">Total</span>
// // //                   <span className="cc-summary-total-value">
// // //                     ₹{(mode === 'preset' ? presetTotal : customTotal).toLocaleString('en-IN')}
// // //                   </span>
// // //                 </div>

// // //                 {mode === 'preset' && selectedCombo && (
// // //                   <p className="cc-summary-savings">
// // //                     You save ₹{(selectedCombo.originalPrice - selectedCombo.price).toLocaleString('en-IN')} on this set 🎉
// // //                   </p>
// // //                 )}

// // //                 <button className="cc-btn-add">
// // //                   <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z"/><line x1="3" y1="6" x2="21" y2="6"/><path d="M16 10a4 4 0 0 1-8 0"/></svg>
// // //                   Add Combo to Cart
// // //                 </button>
// // //                 <button className="cc-btn-buy">
// // //                   <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M5 12h14M12 5l7 7-7 7"/></svg>
// // //                   Buy It Now
// // //                 </button>
// // //                 <p className="cc-summary-note">Free shipping above ₹599 · COD available · Easy returns</p>
// // //               </div>
// // //             </div>
// // //           </div>
// // //         </div>
// // //       </div>
// // //     </>
// // //   );
// // // }



// // // 'use client';

// // // import { useState, useMemo, useCallback, type ChangeEvent } from 'react';
// // // import UpperNav from '@/components/ui/UpperNav';

// // // type CategoryKey =
// // //   | 'necklace'
// // //   | 'earrings'
// // //   | 'bracelets'
// // //   | 'rings'
// // //   | 'gift-boxes'
// // //   | 'keychains'
// // //   | 'hair-accessories';

// // // interface ComboProduct {
// // //   id: number;
// // //   name: string;
// // //   price: number;
// // //   image: string;
// // //   customisable: boolean;
// // // }

// // // interface PresetCombo {
// // //   id: string;
// // //   name: string;
// // //   tagline: string;
// // //   price: number;
// // //   originalPrice: number;
// // //   image: string;
// // //   badge: string;
// // //   tint: string;
// // //   includedCategories: CategoryKey[];
// // //   defaultSelections: Partial<Record<CategoryKey, number>>;
// // // }

// // // const PRODUCTS_BY_CATEGORY: Record<CategoryKey, ComboProduct[]> = {
// // //   necklace: [
// // //     { id: 1, name: 'Dainty Layered Necklace', price: 1299, image: 'https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?w=400&q=80', customisable: false },
// // //     { id: 2, name: 'Pearl Pendant Necklace', price: 2499, image: 'https://images.unsplash.com/photo-1573408301185-9519f94816b5?w=400&q=80', customisable: false },
// // //     { id: 3, name: 'Layered Gold Chain', price: 1599, image: 'https://images.unsplash.com/photo-1611591437281-460bfbe1220a?w=400&q=80', customisable: false },
// // //   ],
// // //   earrings: [
// // //     { id: 4, name: 'Gold Hoop Earrings', price: 899, image: 'https://images.unsplash.com/photo-1588444650733-d0f07d323dde?w=400&q=80', customisable: false },
// // //     { id: 5, name: 'Minimal Stud Earrings', price: 549, image: 'https://images.unsplash.com/photo-1605100804763-247f67b3557e?w=400&q=80', customisable: false },
// // //     { id: 6, name: 'Korean Ear Cuffs', price: 699, image: 'https://images.unsplash.com/photo-1617038260897-41a1f14a8ca0?w=400&q=80', customisable: false },
// // //   ],
// // //   bracelets: [
// // //     { id: 7, name: 'Beaded Charm Bracelet', price: 749, image: 'https://images.unsplash.com/photo-1602173574767-37ac01994b2a?w=400&q=80', customisable: false },
// // //     { id: 8, name: 'Kada Bangle Set', price: 1899, image: 'https://images.unsplash.com/photo-1612817288484-6f916006741a?w=400&q=80', customisable: false },
// // //     { id: 9, name: 'Minimal Chain Bracelet', price: 999, image: 'https://images.unsplash.com/photo-1612817288484-6f916006741a?w=400&q=80', customisable: false },
// // //   ],
// // //   rings: [
// // //     { id: 10, name: 'Diamond Ring', price: 2999, image: 'https://images.unsplash.com/photo-1605100804763-247f67b3557e?w=400&q=80', customisable: false },
// // //     { id: 11, name: 'Minimal Gold Ring', price: 999, image: 'https://images.unsplash.com/photo-1605100804763-247f67b3557e?w=400&q=80', customisable: false },
// // //     { id: 12, name: 'Couple Rings Set', price: 1999, image: 'https://images.unsplash.com/photo-1588444650733-d0f07d323dde?w=400&q=80', customisable: false },
// // //   ],
// // //   'gift-boxes': [
// // //     { id: 16, name: 'Luxury Gift Box', price: 2499, image: 'https://images.unsplash.com/photo-1549465220-1a8b9238cd48?w=400&q=80', customisable: true },
// // //     { id: 17, name: 'Birthday Gift Box', price: 1999, image: 'https://images.unsplash.com/photo-1549465220-1a8b9238cd48?w=400&q=80', customisable: true },
// // //   ],
// // //   keychains: [
// // //     { id: 18, name: 'Personalised Keychain', price: 399, image: 'https://images.unsplash.com/photo-1582143570735-ebf7c44a5c54?w=400&q=80', customisable: true },
// // //     { id: 19, name: 'Metal Charm Keychain', price: 499, image: 'https://images.unsplash.com/photo-1582143570735-ebf7c44a5c54?w=400&q=80', customisable: true },
// // //   ],
// // //   'hair-accessories': [
// // //     { id: 13, name: 'Elegant Hair Clip', price: 499, image: 'https://images.unsplash.com/photo-1591206422576-7e00ff5f7db7?w=400&q=80', customisable: false },
// // //     { id: 14, name: 'Pearl Hair Band', price: 799, image: 'https://images.unsplash.com/photo-1591206422576-7e00ff5f7db7?w=400&q=80', customisable: false },
// // //     { id: 15, name: 'Floral Hair Pins', price: 599, image: 'https://images.unsplash.com/photo-1591206422576-7e00ff5f7db7?w=400&q=80', customisable: false },
// // //   ],
// // // };

// // // const PRESET_COMBOS: PresetCombo[] = [
// // //   {
// // //     id: 'festive',
// // //     name: 'Festive Glow',
// // //     tagline: 'Celebrate every moment',
// // //     price: 2999,
// // //     originalPrice: 4500,
// // //     image: 'https://images.unsplash.com/photo-1602173574767-37ac01994b2a?w=800&q=90',
// // //     badge: 'Most Loved',
// // //     tint: '#c8a84b',
// // //     includedCategories: ['necklace', 'earrings', 'bracelets'],
// // //     defaultSelections: { necklace: 1, earrings: 4, bracelets: 7 },
// // //   },
// // //   {
// // //     id: 'bridal',
// // //     name: 'Bridal Radiance',
// // //     tagline: 'For your most beautiful day',
// // //     price: 5999,
// // //     originalPrice: 8800,
// // //     image: 'https://images.unsplash.com/photo-1573408301185-9519f94816b5?w=800&q=90',
// // //     badge: 'Premium',
// // //     tint: '#b07d62',
// // //     includedCategories: ['necklace', 'earrings', 'rings', 'bracelets'],
// // //     defaultSelections: { necklace: 2, earrings: 4, rings: 10, bracelets: 8 },
// // //   },
// // //   {
// // //     id: 'minimal',
// // //     name: 'Minimal Edit',
// // //     tagline: 'Less is more, always',
// // //     price: 1999,
// // //     originalPrice: 2800,
// // //     image: 'https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?w=800&q=90',
// // //     badge: 'New',
// // //     tint: '#6b7c45',
// // //     includedCategories: ['necklace', 'earrings'],
// // //     defaultSelections: { necklace: 1, earrings: 5 },
// // //   },
// // //   {
// // //     id: 'gifting',
// // //     name: 'Gifting Special',
// // //     tagline: 'Curated with love',
// // //     price: 3499,
// // //     originalPrice: 5200,
// // //     image: 'https://images.unsplash.com/photo-1549465220-1a8b9238cd48?w=800&q=90',
// // //     badge: 'Gift Ready',
// // //     tint: '#8a6fa8',
// // //     includedCategories: ['necklace', 'earrings', 'bracelets', 'gift-boxes'],
// // //     defaultSelections: { necklace: 3, earrings: 6, bracelets: 9, 'gift-boxes': 16 },
// // //   },
// // // ];

// // // const CATEGORY_LABELS: Record<CategoryKey, string> = {
// // //   necklace: 'Necklace',
// // //   earrings: 'Earrings',
// // //   bracelets: 'Bracelet',
// // //   rings: 'Ring',
// // //   'gift-boxes': 'Gift Box',
// // //   keychains: 'Keychain',
// // //   'hair-accessories': 'Hair Accessory',
// // // };

// // // /* ── Personalise panel ─────────────────────────────────────── */
// // // function PersonalisePanel({ productName }: { productName: string }) {
// // //   const [text, setText] = useState('');
// // //   const [preview, setPreview] = useState<string | null>(null);
// // //   const handleFile = (e: ChangeEvent<HTMLInputElement>) => {
// // //     const f = e.currentTarget.files?.[0];
// // //     if (!f) return;
// // //     const r = new FileReader();
// // //     r.onload = ev => setPreview((ev.target?.result as string) ?? null);
// // //     r.readAsDataURL(f);
// // //   };
// // //   return (
// // //     <div className="pers-panel">
// // //       <p className="pers-label">✦ Personalise · {productName}</p>
// // //       <input className="pers-input" placeholder="Add a name or message…" value={text} onChange={e => setText(e.target.value)} maxLength={80} />
// // //       <label className="pers-upload">
// // //         <input type="file" accept="image/*" style={{ display: 'none' }} onChange={handleFile} />
// // //         {preview
// // //           ? <img src={preview} alt="preview" style={{ width: 26, height: 26, objectFit: 'cover', borderRadius: 5 }} />
// // //           : <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><rect x="3" y="3" width="18" height="18" rx="3" /><circle cx="8.5" cy="8.5" r="1.5" /><polyline points="21 15 16 10 5 21" /></svg>
// // //         }
// // //         <span>{preview ? 'Change photo' : 'Upload photo'}</span>
// // //       </label>
// // //     </div>
// // //   );
// // // }

// // // /* ── Product card (in accordion) ──────────────────────────── */
// // // function ProdCard({ product, selected, onToggle }: { product: ComboProduct; selected: boolean; onToggle: () => void }) {
// // //   return (
// // //     <button className={`pcard${selected ? ' on' : ''}`} onClick={onToggle}>
// // //       <div className="pcard-img">
// // //         <img src={product.image} alt={product.name} />
// // //         {selected && (
// // //           <span className="pcard-tick">
// // //             <svg width="9" height="9" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="3.5"><polyline points="20 6 9 17 4 12" /></svg>
// // //           </span>
// // //         )}
// // //       </div>
// // //       <div className="pcard-foot">
// // //         <span className="pcard-name">{product.name}</span>
// // //         <span className="pcard-price">₹{product.price.toLocaleString('en-IN')}</span>
// // //       </div>
// // //     </button>
// // //   );
// // // }

// // // /* ── Accordion (single select) ─────────────────────────────── */
// // // function Accordion({ catKey, products, selectedId, onSelect }: {
// // //   catKey: CategoryKey; products: ComboProduct[];
// // //   selectedId?: number; onSelect: (id: number) => void;
// // // }) {
// // //   const [open, setOpen] = useState(false);
// // //   const sel = products.find(p => p.id === selectedId);
// // //   return (
// // //     <div className="acc">
// // //       <button className="acc-head" onClick={() => setOpen(o => !o)}>
// // //         <span className="acc-cat">{CATEGORY_LABELS[catKey]}</span>
// // //         <span className={`acc-info${!sel ? ' dim' : ''}`}>
// // //           {sel ? <>{sel.name} · <strong>₹{sel.price.toLocaleString('en-IN')}</strong></> : 'Select one'}
// // //         </span>
// // //         <svg className={`acc-chevron${open ? ' open' : ''}`} width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2"><polyline points="6 9 12 15 18 9" /></svg>
// // //       </button>
// // //       {open && (
// // //         <div className="acc-body">
// // //           <div className="pgrid">
// // //             {products.map(p => <ProdCard key={p.id} product={p} selected={p.id === selectedId} onToggle={() => onSelect(p.id)} />)}
// // //           </div>
// // //           {sel?.customisable && <PersonalisePanel productName={sel.name} />}
// // //         </div>
// // //       )}
// // //     </div>
// // //   );
// // // }

// // // /* ── Accordion (multi select) ──────────────────────────────── */
// // // function AccordionMulti({ catKey, products, selectedIds, onToggle }: {
// // //   catKey: CategoryKey; products: ComboProduct[];
// // //   selectedIds: number[]; onToggle: (id: number) => void;
// // // }) {
// // //   const [open, setOpen] = useState(false);
// // //   const count = selectedIds.length;
// // //   const anyCustom = selectedIds.some(id => products.find(p => p.id === id)?.customisable);
// // //   return (
// // //     <div className="acc">
// // //       <button className="acc-head" onClick={() => setOpen(o => !o)}>
// // //         <span className="acc-cat">{CATEGORY_LABELS[catKey]}</span>
// // //         <span className={`acc-info${count === 0 ? ' dim' : ''}`}>{count > 0 ? `${count} selected` : 'Select any'}</span>
// // //         <svg className={`acc-chevron${open ? ' open' : ''}`} width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2"><polyline points="6 9 12 15 18 9" /></svg>
// // //       </button>
// // //       {open && (
// // //         <div className="acc-body">
// // //           <div className="pgrid">
// // //             {products.map(p => <ProdCard key={p.id} product={p} selected={selectedIds.includes(p.id)} onToggle={() => onToggle(p.id)} />)}
// // //           </div>
// // //           {anyCustom && <PersonalisePanel productName={CATEGORY_LABELS[catKey]} />}
// // //         </div>
// // //       )}
// // //     </div>
// // //   );
// // // }

// // // /* ── Combo card ─────────────────────────────────────────────── */
// // // function ComboCard({ combo, selected, onSelect }: { combo: PresetCombo; selected: boolean; onSelect: () => void }) {
// // //   const pct = Math.round(((combo.originalPrice - combo.price) / combo.originalPrice) * 100);
// // //   return (
// // //     <button className={`ccard${selected ? ' sel' : ''}`} onClick={onSelect} style={{ '--t': combo.tint } as React.CSSProperties}>
// // //       <div className="ccard-img">
// // //         <img src={combo.image} alt={combo.name} />
// // //         <div className="ccard-grad" />
// // //         <span className="ccard-badge">{combo.badge}</span>
// // //         <span className="ccard-disc">{pct}% off</span>
// // //         {selected && <div className="ccard-ring" />}
// // //         <div className="ccard-overlay-text">
// // //           <span className="ccard-name">{combo.name}</span>
// // //           <span className="ccard-tagline">{combo.tagline}</span>
// // //         </div>
// // //       </div>
// // //       <div className="ccard-bar" />
// // //       <div className="ccard-foot">
// // //         <div className="ccard-price-row">
// // //           <span className="ccard-price">₹{combo.price.toLocaleString('en-IN')}</span>
// // //           <span className="ccard-was">₹{combo.originalPrice.toLocaleString('en-IN')}</span>
// // //         </div>
// // //         <div className="ccard-chips">
// // //           {combo.includedCategories.map(c => <span key={c} className="ccard-chip">{CATEGORY_LABELS[c]}</span>)}
// // //         </div>
// // //       </div>
// // //     </button>
// // //   );
// // // }

// // // /* ── Main page ──────────────────────────────────────────────── */
// // // export default function CuratedCombosPage() {
// // //   const [mode, setMode] = useState<'preset' | 'custom'>('preset');
// // //   const [selComboId, setSelComboId] = useState('festive');
// // //   const [comboSel, setComboSel] = useState<Partial<Record<CategoryKey, number>>>(() => {
// // //     const c = PRESET_COMBOS.find(c => c.id === 'festive');
// // //     return c ? { ...c.defaultSelections } : {};
// // //   });
// // //   const [customIds, setCustomIds] = useState<Partial<Record<CategoryKey, number[]>>>({});
// // //   const [customCats, setCustomCats] = useState<CategoryKey[]>(['necklace', 'earrings']);

// // //   const selCombo = PRESET_COMBOS.find(c => c.id === selComboId);
// // //   const ALL_CATS = Object.keys(PRODUCTS_BY_CATEGORY) as CategoryKey[];

// // //   const handleComboSelect = useCallback((id: string) => {
// // //     setSelComboId(id);
// // //     const c = PRESET_COMBOS.find(c => c.id === id);
// // //     if (c) setComboSel({ ...c.defaultSelections });
// // //   }, []);

// // //   const handlePresetSel = useCallback((cat: CategoryKey, id: number) => {
// // //     setComboSel(p => ({ ...p, [cat]: id }));
// // //   }, []);

// // //   const handleCustomToggle = useCallback((cat: CategoryKey, id: number) => {
// // //     setCustomIds(p => {
// // //       const cur = p[cat] ?? [];
// // //       return { ...p, [cat]: cur.includes(id) ? cur.filter(x => x !== id) : [...cur, id] };
// // //     });
// // //   }, []);

// // //   const customTotal = useMemo(() =>
// // //     customCats.reduce((sum, cat) =>
// // //       sum + (customIds[cat] ?? []).reduce((s, id) =>
// // //         s + (PRODUCTS_BY_CATEGORY[cat]?.find(p => p.id === id)?.price ?? 0), 0), 0),
// // //     [customIds, customCats]);

// // //   const customItems = useMemo(() => {
// // //     const items: { catKey: CategoryKey; prod: ComboProduct }[] = [];
// // //     customCats.forEach(cat =>
// // //       (customIds[cat] ?? []).forEach(id => {
// // //         const prod = PRODUCTS_BY_CATEGORY[cat]?.find(p => p.id === id);
// // //         if (prod) items.push({ catKey: cat, prod });
// // //       })
// // //     );
// // //     return items;
// // //   }, [customIds, customCats]);

// // //   const presetTotal = selCombo?.price ?? 0;
// // //   const saving = selCombo ? selCombo.originalPrice - selCombo.price : 0;

// // //   return (
// // //     <>
// // //       <style>{`
// // //         @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,400;0,500;0,600;1,400;1,500&family=Outfit:wght@300;400;500;600&display=swap');

// // //         :root {
// // //           --bg:      #f7f4ee;
// // //           --surf:    #ffffff;
// // //           --bdr:     #e4ddd0;
// // //           --bdr2:    #cfc7b6;
// // //           --olive:   #49581f;
// // //           --olive2:  #68773e;
// // //           --olivedim:#edf0e2;
// // //           --gold:    #c7a748;
// // //           --gold2:   #eedfa0;
// // //           --ink:     #1b1f0e;
// // //           --ink6:    rgba(27,31,14,.6);
// // //           --ink3:    rgba(27,31,14,.32);
// // //           --green:   #2d6e30;
// // //           --ffd:     'Playfair Display',Georgia,serif;
// // //           --ffb:     'Outfit',sans-serif;
// // //           --card-r:  18px;
// // //         }
// // //         *,*::before,*::after{box-sizing:border-box;margin:0;padding:0}
// // //         button{font-family:var(--ffb);cursor:pointer}
// // //         img{display:block}

// // //         /* PAGE */
// // //         .page{min-height:100dvh;background:var(--bg);font-family:var(--ffb);color:var(--ink)}

// // //         /* HERO */
// // //         .hero{
// // //           padding:52px 60px 44px;
// // //           background:linear-gradient(160deg,#f7f4ee 0%,#f0e9da 55%,#f7f4ee 100%);
// // //           border-bottom:1px solid var(--bdr);
// // //           position:relative;overflow:hidden;
// // //         }
// // //         .hero::before{
// // //           content:'';position:absolute;right:-60px;top:-60px;
// // //           width:380px;height:380px;border-radius:50%;
// // //           background:radial-gradient(circle,rgba(199,167,72,.12) 0%,transparent 68%);
// // //           pointer-events:none;
// // //         }
// // //         .hero-tag{
// // //           display:flex;align-items:center;gap:10px;
// // //           font-size:9.5px;letter-spacing:.44em;text-transform:uppercase;
// // //           color:var(--gold);font-weight:500;margin-bottom:18px;
// // //         }
// // //         .hero-tag-line{width:30px;height:1px;background:var(--gold);opacity:.5}
// // //         .hero h1{
// // //           font-family:var(--ffd);
// // //           font-size:clamp(2.2rem,4.5vw,3.8rem);
// // //           font-weight:500;color:var(--olive);
// // //           line-height:1.08;letter-spacing:-.022em;
// // //           margin-bottom:14px;
// // //         }
// // //         .hero h1 em{font-style:italic;color:var(--gold)}
// // //         .hero p{font-size:14px;font-weight:300;color:var(--ink6);max-width:460px;line-height:1.85}

// // //         /* MODE BAR */
// // //         .modebar{
// // //           padding:30px 60px 0;
// // //           display:flex;align-items:flex-start;gap:20px;flex-wrap:wrap;
// // //         }
// // //         .modetoggle{
// // //           display:flex;background:var(--surf);
// // //           border:1.5px solid var(--bdr2);border-radius:50px;
// // //           padding:5px;gap:4px;
// // //           box-shadow:0 2px 10px rgba(27,31,14,.1);flex-shrink:0;
// // //         }
// // //         .modebtn{
// // //           font-size:10.5px;font-weight:600;letter-spacing:.13em;text-transform:uppercase;
// // //           padding:11px 26px;border-radius:50px;border:none;background:transparent;
// // //           color:var(--ink6);transition:all .25s;
// // //         }
// // //         .modebtn.on{
// // //           background:var(--olive);color:#fff;
// // //           box-shadow:0 3px 14px rgba(73,88,31,.35);
// // //         }
// // //         .modehint{
// // //           font-size:12.5px;font-weight:300;color:var(--ink6);
// // //           line-height:1.75;max-width:480px;padding-top:14px;
// // //         }

// // //         /* LAYOUT */
// // //         .layout{
// // //           display:grid;
// // //           grid-template-columns:1fr 356px;
// // //           gap:24px;
// // //           padding:30px 60px 80px;
// // //           align-items:start;
// // //         }

// // //         /* SECTION LABEL */
// // //         .slbl{
// // //           font-size:9px;letter-spacing:.42em;text-transform:uppercase;
// // //           color:var(--ink3);font-weight:500;margin-bottom:16px;
// // //           display:flex;align-items:center;gap:10px;
// // //         }
// // //         .slbl::after{content:'';flex:1;height:1px;background:var(--bdr)}

// // //         /* ══════════════════════════════
// // //            COMBO CARDS  — full redesign
// // //         ══════════════════════════════ */
// // //         .cgrid{
// // //           display:grid;
// // //           grid-template-columns:repeat(2,1fr);
// // //           gap:16px;margin-bottom:36px;
// // //         }

// // //         .ccard{
// // //           position:relative;padding:0;border:none;background:var(--surf);
// // //           border-radius:var(--card-r);overflow:hidden;text-align:left;
// // //           box-shadow:0 2px 14px rgba(27,31,14,.10);
// // //           transition:transform .22s cubic-bezier(.34,1.3,.64,1),box-shadow .22s;
// // //           outline:none;
// // //         }
// // //         .ccard:hover{
// // //           transform:translateY(-5px) scale(1.015);
// // //           box-shadow:0 18px 50px rgba(27,31,14,.17);
// // //         }
// // //         .ccard.sel{
// // //           box-shadow:0 0 0 2.5px var(--t,var(--gold)),0 12px 36px rgba(27,31,14,.18);
// // //         }
// // //         /* image */
// // //         .ccard-img{position:relative;aspect-ratio:4/3;overflow:hidden}
// // //         .ccard-img img{width:100%;height:100%;object-fit:cover;transition:transform .5s ease}
// // //         .ccard:hover .ccard-img img{transform:scale(1.09)}
// // //         .ccard-grad{
// // //           position:absolute;inset:0;
// // //           background:linear-gradient(to bottom,rgba(0,0,0,.04) 0%,rgba(0,0,0,.62) 100%);
// // //         }
// // //         .ccard-badge{
// // //           position:absolute;top:10px;left:10px;
// // //           background:rgba(255,255,255,.9);
// // //           color:var(--ink);font-size:8px;font-weight:700;
// // //           letter-spacing:.15em;text-transform:uppercase;
// // //           padding:4px 9px;border-radius:50px;
// // //           backdrop-filter:blur(4px);
// // //         }
// // //         .ccard-disc{
// // //           position:absolute;top:10px;right:10px;
// // //           background:var(--t,var(--gold));color:#fff;
// // //           font-size:8.5px;font-weight:700;
// // //           padding:4px 9px;border-radius:50px;
// // //         }
// // //         .ccard-ring{
// // //           position:absolute;inset:0;
// // //           border:2.5px solid var(--t,var(--gold));
// // //           border-radius:calc(var(--card-r) - 1px);
// // //           pointer-events:none;
// // //         }
// // //         .ccard-overlay-text{
// // //           position:absolute;bottom:0;left:0;right:0;
// // //           padding:12px 14px;
// // //           display:flex;flex-direction:column;gap:2px;
// // //         }
// // //         .ccard-name{
// // //           font-family:var(--ffd);font-size:1.1rem;font-weight:500;
// // //           color:#fff;line-height:1.15;text-shadow:0 1px 5px rgba(0,0,0,.35);
// // //         }
// // //         .ccard-tagline{font-size:9.5px;color:rgba(255,255,255,.68);letter-spacing:.05em}
// // //         /* tint bar */
// // //         .ccard-bar{height:4px;background:var(--t,var(--gold))}
// // //         /* footer */
// // //         .ccard-foot{padding:11px 14px 14px}
// // //         .ccard-price-row{display:flex;align-items:baseline;gap:7px;margin-bottom:8px}
// // //         .ccard-price{
// // //           font-family:var(--ffd);font-size:1.2rem;font-weight:600;color:var(--ink)
// // //         }
// // //         .ccard-was{font-size:11px;color:var(--ink3);text-decoration:line-through}
// // //         .ccard-chips{display:flex;flex-wrap:wrap;gap:4px}
// // //         .ccard-chip{
// // //           font-size:7.5px;font-weight:500;letter-spacing:.1em;text-transform:uppercase;
// // //           color:var(--ink6);border:1px solid var(--bdr);
// // //           padding:2px 7px;border-radius:50px;
// // //           transition:border-color .18s,color .18s;
// // //         }
// // //         .ccard.sel .ccard-chip{
// // //           border-color:color-mix(in srgb,var(--t,var(--gold)) 40%,transparent);
// // //           color:var(--olive);
// // //         }

// // //         /* CUSTOMISE BLOCK */
// // //         .custblock{
// // //           background:var(--surf);border:1.5px solid var(--bdr);
// // //           border-radius:var(--card-r);overflow:hidden;
// // //           box-shadow:0 2px 12px rgba(27,31,14,.09);
// // //         }
// // //         .custhead{
// // //           padding:15px 22px;border-bottom:1px solid var(--bdr);
// // //           background:linear-gradient(135deg,var(--olivedim),#f3ede0);
// // //           display:flex;align-items:center;justify-content:space-between;
// // //         }
// // //         .custtitle{
// // //           font-family:var(--ffd);font-size:1rem;font-weight:500;color:var(--olive)
// // //         }
// // //         .custsub{font-size:10px;color:var(--ink6);letter-spacing:.04em}

// // //         /* ACCORDION */
// // //         .acc{border-bottom:1px solid var(--bdr)}
// // //         .acc:last-child{border-bottom:none}
// // //         .acc-head{
// // //           width:100%;display:flex;align-items:center;gap:12px;
// // //           padding:13px 22px;background:transparent;border:none;text-align:left;
// // //           transition:background .15s;
// // //         }
// // //         .acc-head:hover{background:var(--olivedim)}
// // //         .acc-cat{
// // //           font-size:10.5px;font-weight:600;letter-spacing:.1em;text-transform:uppercase;
// // //           color:var(--olive);flex-shrink:0;width:108px;
// // //         }
// // //         .acc-info{flex:1;font-size:11px;color:var(--ink6);white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
// // //         .acc-info.dim{color:var(--ink3);font-style:italic}
// // //         .acc-info strong{color:var(--ink);font-weight:600}
// // //         .acc-chevron{color:var(--ink3);transition:transform .22s;flex-shrink:0}
// // //         .acc-chevron.open{transform:rotate(180deg)}
// // //         .acc-body{padding:8px 22px 18px}

// // //         /* PRODUCT GRID */
// // //         .pgrid{
// // //           display:grid;
// // //           grid-template-columns:repeat(auto-fill,minmax(118px,1fr));
// // //           gap:10px;margin-bottom:10px;
// // //         }
// // //         .pcard{
// // //           background:#fff;border:1.5px solid var(--bdr);
// // //           border-radius:12px;overflow:hidden;padding:0;text-align:left;
// // //           transition:border-color .18s,box-shadow .18s,transform .18s;
// // //         }
// // //         .pcard:hover{border-color:var(--olive2);box-shadow:0 4px 14px rgba(27,31,14,.12);transform:translateY(-2px)}
// // //         .pcard.on{border-color:var(--gold);box-shadow:0 0 0 2px rgba(199,167,72,.22)}
// // //         .pcard-img{position:relative;aspect-ratio:1;overflow:hidden}
// // //         .pcard-img img{width:100%;height:100%;object-fit:cover;transition:transform .35s}
// // //         .pcard:hover .pcard-img img{transform:scale(1.1)}
// // //         .pcard-tick{
// // //           position:absolute;top:6px;right:6px;
// // //           width:20px;height:20px;border-radius:50%;
// // //           background:var(--gold);display:flex;align-items:center;justify-content:center;
// // //           box-shadow:0 2px 6px rgba(199,167,72,.5);
// // //         }
// // //         .pcard-foot{padding:7px 9px 9px}
// // //         .pcard-name{display:block;font-size:10px;font-weight:500;color:var(--ink);line-height:1.35;margin-bottom:2px}
// // //         .pcard-price{display:block;font-size:10.5px;font-weight:600;color:var(--olive)}

// // //         /* PERSONALISE */
// // //         .pers-panel{
// // //           background:linear-gradient(135deg,rgba(199,167,72,.07),rgba(73,88,31,.04));
// // //           border:1px solid rgba(199,167,72,.2);
// // //           border-radius:10px;padding:12px 14px;margin-top:4px;
// // //         }
// // //         .pers-label{
// // //           font-size:9px;font-weight:700;letter-spacing:.14em;text-transform:uppercase;
// // //           color:#896018;margin-bottom:8px;
// // //         }
// // //         .pers-input{
// // //           width:100%;border:1.5px solid var(--bdr2);border-radius:7px;
// // //           padding:8px 11px;font-family:var(--ffb);font-size:11.5px;
// // //           color:var(--ink);background:#fff;outline:none;
// // //           margin-bottom:7px;transition:border-color .2s;
// // //         }
// // //         .pers-input:focus{border-color:var(--olive2)}
// // //         .pers-input::placeholder{color:var(--ink3)}
// // //         .pers-upload{
// // //           display:inline-flex;align-items:center;gap:6px;
// // //           font-size:9.5px;font-weight:600;letter-spacing:.1em;text-transform:uppercase;
// // //           color:var(--olive);border:1.5px dashed var(--bdr2);
// // //           border-radius:7px;padding:6px 12px;cursor:pointer;background:#fff;
// // //           transition:border-color .2s,background .2s;
// // //         }
// // //         .pers-upload:hover{border-color:var(--olive2);background:var(--olivedim)}

// // //         /* CATEGORY PILLS (custom mode) */
// // //         .catpills{display:flex;flex-wrap:wrap;gap:8px;margin-bottom:24px}
// // //         .catpill{
// // //           font-size:10px;font-weight:500;letter-spacing:.1em;text-transform:uppercase;
// // //           color:var(--ink6);padding:8px 16px;
// // //           border:1.5px solid var(--bdr2);border-radius:50px;
// // //           background:transparent;transition:all .2s;
// // //         }
// // //         .catpill:hover{color:var(--olive);border-color:var(--olive2);background:var(--olivedim)}
// // //         .catpill.on{background:var(--olive);color:#fff;border-color:var(--olive)}
// // //         .customblock{
// // //           background:var(--surf);border:1.5px solid var(--bdr);
// // //           border-radius:var(--card-r);overflow:hidden;
// // //           box-shadow:0 2px 12px rgba(27,31,14,.09);
// // //         }

// // //         /* ══════════════════════
// // //            SUMMARY PANEL
// // //         ══════════════════════ */
// // //         .summary{
// // //           position:sticky;top:80px;
// // //           background:var(--surf);border:1.5px solid var(--bdr);
// // //           border-radius:var(--card-r);overflow:hidden;
// // //           box-shadow:0 6px 28px rgba(27,31,14,.12);
// // //         }
// // //         .sum-head{
// // //           padding:20px 22px 16px;
// // //           background:linear-gradient(135deg,var(--olivedim),#f0e8d8);
// // //           border-bottom:1px solid var(--bdr);
// // //           position:relative;overflow:hidden;
// // //         }
// // //         .sum-head::after{
// // //           content:'◈';position:absolute;right:18px;top:50%;
// // //           transform:translateY(-50%);font-size:38px;
// // //           color:rgba(199,167,72,.12);pointer-events:none;line-height:1;
// // //         }
// // //         .sum-title{
// // //           font-family:var(--ffd);font-size:1.1rem;font-weight:500;color:var(--olive)
// // //         }
// // //         .sum-modetag{
// // //           display:block;font-size:8.5px;font-weight:700;
// // //           letter-spacing:.22em;text-transform:uppercase;color:var(--gold);margin-top:3px;
// // //         }
// // //         .sum-body{padding:16px 22px 20px}
// // //         .sum-list{margin-bottom:14px}
// // //         .sum-row{
// // //           display:flex;align-items:center;gap:10px;
// // //           padding:8px 0;border-bottom:1px solid rgba(27,31,14,.06);
// // //         }
// // //         .sum-row:last-child{border-bottom:none}
// // //         .sum-thumb{
// // //           width:40px;height:40px;border-radius:9px;object-fit:cover;
// // //           border:1.5px solid var(--bdr);flex-shrink:0;
// // //         }
// // //         .sum-info{flex:1;min-width:0}
// // //         .sum-cat{font-size:7.5px;letter-spacing:.15em;text-transform:uppercase;color:var(--ink3);display:block}
// // //         .sum-name{font-size:11px;font-weight:500;color:var(--ink);display:block;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
// // //         .sum-price{font-size:11px;font-weight:600;color:var(--olive);flex-shrink:0}
// // //         .sum-check{
// // //           width:22px;height:22px;border-radius:50%;
// // //           background:var(--olivedim);display:flex;align-items:center;justify-content:center;
// // //           font-size:10px;color:var(--olive);flex-shrink:0;
// // //         }
// // //         .sum-empty{
// // //           text-align:center;font-family:var(--ffd);font-style:italic;
// // //           font-size:12.5px;color:var(--ink3);padding:20px 0;
// // //         }
// // //         .sum-divider{
// // //           height:1px;margin:12px 0;
// // //           background:linear-gradient(90deg,transparent,var(--gold2),transparent);
// // //         }
// // //         .sum-total-row{display:flex;justify-content:space-between;align-items:baseline;margin-bottom:4px}
// // //         .sum-total-lbl{font-size:9px;font-weight:600;letter-spacing:.15em;text-transform:uppercase;color:var(--ink6)}
// // //         .sum-total-val{font-family:var(--ffd);font-size:1.7rem;font-weight:600;color:var(--ink)}
// // //         .sum-saving{font-size:11.5px;font-weight:500;color:var(--green);margin-bottom:16px}

// // //         /* BUTTONS */
// // //         .btn-cart{
// // //           width:100%;display:flex;align-items:center;justify-content:center;gap:8px;
// // //           font-size:10.5px;font-weight:700;letter-spacing:.16em;text-transform:uppercase;
// // //           color:#fff;background:var(--olive);border:none;
// // //           border-radius:50px;padding:15px;margin-bottom:10px;
// // //           box-shadow:0 4px 14px rgba(73,88,31,.32);
// // //           transition:background .2s,transform .15s,box-shadow .2s;
// // //         }
// // //         .btn-cart:hover{background:#384a14;transform:translateY(-1px);box-shadow:0 6px 22px rgba(73,88,31,.4)}
// // //         .btn-buy{
// // //           width:100%;display:flex;align-items:center;justify-content:center;gap:8px;
// // //           font-size:10.5px;font-weight:700;letter-spacing:.16em;text-transform:uppercase;
// // //           color:var(--ink);background:var(--gold2);
// // //           border:1.5px solid var(--gold);border-radius:50px;padding:14px;
// // //           transition:all .2s;
// // //         }
// // //         .btn-buy:hover{background:var(--gold);color:#fff;transform:translateY(-1px)}

// // //         .perks{display:flex;justify-content:center;gap:14px;margin-top:14px;flex-wrap:wrap}
// // //         .perk{font-size:9px;color:var(--ink3);display:flex;align-items:center;gap:4px}
// // //         .perk-dot{width:3px;height:3px;border-radius:50%;background:var(--gold);opacity:.65}

// // //         /* ANIMATIONS */
// // //         @keyframes up{from{opacity:0;transform:translateY(18px)}to{opacity:1;transform:translateY(0)}}
// // //         .hero{animation:up .55s ease both}
// // //         .modebar{animation:up .55s ease .07s both}
// // //         .layout{animation:up .55s ease .13s both}

// // //         /* RESPONSIVE */
// // //         @media(max-width:1024px){
// // //           .layout{grid-template-columns:1fr}
// // //           .summary{position:static}
// // //           .hero,.modebar,.layout{padding-left:32px;padding-right:32px}
// // //         }
// // //         @media(max-width:680px){
// // //           .hero,.modebar,.layout{padding-left:18px;padding-right:18px}
// // //           .hero{padding-top:30px;padding-bottom:26px}
// // //           .cgrid{grid-template-columns:1fr 1fr;gap:12px}
// // //           .modebtn{padding:9px 16px;font-size:10px}
// // //           .acc-cat{width:88px}
// // //           .layout{padding-bottom:52px}
// // //         }
// // //         @media(max-width:400px){
// // //           .cgrid{grid-template-columns:1fr}
// // //         }
// // //       `}</style>

// // //       <div className="page">
// // //         <UpperNav />

// // //         {/* HERO */}
// // //         <div className="hero">
// // //           <div className="hero-tag">
// // //             <span className="hero-tag-line" />
// // //             Jewellery · Curated Combos
// // //           </div>
// // //           <h1>Build Your <em>Perfect</em><br />Jewellery Set</h1>
// // //           <p>Choose a curated combo and swap pieces to your liking — or build something entirely your own.</p>
// // //         </div>

// // //         {/* MODE */}
// // //         <div className="modebar">
// // //           <div className="modetoggle">
// // //             <button className={`modebtn${mode === 'preset' ? ' on' : ''}`} onClick={() => setMode('preset')}>◈ Curated Sets</button>
// // //             <button className={`modebtn${mode === 'custom' ? ' on' : ''}`} onClick={() => setMode('custom')}>✦ Build Your Own</button>
// // //           </div>
// // //           <p className="modehint">
// // //             {mode === 'preset'
// // //               ? 'Pick a pre-curated combo at a bundled price, then swap individual pieces within each category to match your taste.'
// // //               : 'Choose categories freely and pick as many products as you like. Price updates live as you build.'}
// // //           </p>
// // //         </div>

// // //         {/* CONTENT */}
// // //         <div className="layout">
// // //           {/* LEFT */}
// // //           <div>
// // //             {mode === 'preset' && (
// // //               <>
// // //                 <p className="slbl">Choose a Combo Set</p>
// // //                 <div className="cgrid">
// // //                   {PRESET_COMBOS.map(c => (
// // //                     <ComboCard key={c.id} combo={c} selected={selComboId === c.id} onSelect={() => handleComboSelect(c.id)} />
// // //                   ))}
// // //                 </div>

// // //                 <p className="slbl">Swap Pieces in Your Set</p>
// // //                 <div className="custblock">
// // //                   <div className="custhead">
// // //                     <span className="custtitle">{selCombo?.name}</span>
// // //                     <span className="custsub">Expand a category to swap</span>
// // //                   </div>
// // //                   {selCombo?.includedCategories.map(cat => (
// // //                     <Accordion
// // //                       key={cat}
// // //                       catKey={cat}
// // //                       products={PRODUCTS_BY_CATEGORY[cat] ?? []}
// // //                       selectedId={comboSel[cat]}
// // //                       onSelect={id => handlePresetSel(cat, id)}
// // //                     />
// // //                   ))}
// // //                 </div>
// // //               </>
// // //             )}

// // //             {mode === 'custom' && (
// // //               <>
// // //                 <p className="slbl">Select Your Categories</p>
// // //                 <div className="catpills">
// // //                   {ALL_CATS.map(cat => (
// // //                     <button
// // //                       key={cat}
// // //                       className={`catpill${customCats.includes(cat) ? ' on' : ''}`}
// // //                       onClick={() => setCustomCats(p => p.includes(cat) ? p.filter(c => c !== cat) : [...p, cat])}
// // //                     >
// // //                       {customCats.includes(cat) ? '✓ ' : '+ '}{CATEGORY_LABELS[cat]}
// // //                     </button>
// // //                   ))}
// // //                 </div>
// // //                 {customCats.length > 0 && (
// // //                   <>
// // //                     <p className="slbl">Choose Products</p>
// // //                     <div className="customblock">
// // //                       {customCats.map(cat => (
// // //                         <AccordionMulti
// // //                           key={cat}
// // //                           catKey={cat}
// // //                           products={PRODUCTS_BY_CATEGORY[cat] ?? []}
// // //                           selectedIds={customIds[cat] ?? []}
// // //                           onToggle={id => handleCustomToggle(cat, id)}
// // //                         />
// // //                       ))}
// // //                     </div>
// // //                   </>
// // //                 )}
// // //               </>
// // //             )}
// // //           </div>

// // //           {/* SUMMARY */}
// // //           <div>
// // //             <div className="summary">
// // //               <div className="sum-head">
// // //                 <div className="sum-title">Your Combo</div>
// // //                 <span className="sum-modetag">{mode === 'preset' ? '◈ Curated Set' : '✦ Custom Build'}</span>
// // //               </div>
// // //               <div className="sum-body">
// // //                 <div className="sum-list">
// // //                   {mode === 'preset' && selCombo
// // //                     ? selCombo.includedCategories.map(cat => {
// // //                         const prod = PRODUCTS_BY_CATEGORY[cat]?.find(p => p.id === comboSel[cat]);
// // //                         if (!prod) return null;
// // //                         return (
// // //                           <div key={cat} className="sum-row">
// // //                             <img className="sum-thumb" src={prod.image} alt={prod.name} />
// // //                             <div className="sum-info">
// // //                               <span className="sum-cat">{CATEGORY_LABELS[cat]}</span>
// // //                               <span className="sum-name">{prod.name}</span>
// // //                             </div>
// // //                             <span className="sum-check">✓</span>
// // //                           </div>
// // //                         );
// // //                       })
// // //                     : mode === 'custom'
// // //                     ? customCats.length === 0
// // //                       ? <p className="sum-empty">No categories selected.</p>
// // //                       : customItems.length === 0
// // //                       ? <p className="sum-empty">No products chosen yet.</p>
// // //                       : customItems.map(({ catKey, prod }) => (
// // //                           <div key={`${catKey}-${prod.id}`} className="sum-row">
// // //                             <img className="sum-thumb" src={prod.image} alt={prod.name} />
// // //                             <div className="sum-info">
// // //                               <span className="sum-cat">{CATEGORY_LABELS[catKey]}</span>
// // //                               <span className="sum-name">{prod.name}</span>
// // //                             </div>
// // //                             <span className="sum-price">₹{prod.price.toLocaleString('en-IN')}</span>
// // //                           </div>
// // //                         ))
// // //                     : null}
// // //                 </div>

// // //                 <div className="sum-divider" />
// // //                 <div className="sum-total-row">
// // //                   <span className="sum-total-lbl">Total</span>
// // //                   <span className="sum-total-val">₹{(mode === 'preset' ? presetTotal : customTotal).toLocaleString('en-IN')}</span>
// // //                 </div>
// // //                 {mode === 'preset' && selCombo && (
// // //                   <p className="sum-saving">🎉 You save ₹{saving.toLocaleString('en-IN')} on this set</p>
// // //                 )}

// // //                 <button className="btn-cart">
// // //                   <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
// // //                     <path d="M6 2L3 6v14a2 2 0 002 2h14a2 2 0 002-2V6l-3-4z"/><line x1="3" y1="6" x2="21" y2="6"/><path d="M16 10a4 4 0 01-8 0"/>
// // //                   </svg>
// // //                   Add Combo to Cart
// // //                 </button>
// // //                 <button className="btn-buy">
// // //                   <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
// // //                     <path d="M5 12h14M12 5l7 7-7 7"/>
// // //                   </svg>
// // //                   Buy It Now
// // //                 </button>

// // //                 <div className="perks">
// // //                   <span className="perk"><span className="perk-dot"/>Free shipping ₹599+</span>
// // //                   <span className="perk"><span className="perk-dot"/>COD available</span>
// // //                   <span className="perk"><span className="perk-dot"/>Easy returns</span>
// // //                 </div>
// // //               </div>
// // //             </div>
// // //           </div>
// // //         </div>
// // //       </div>
// // //     </>
// // //   );
// // // }


// // 'use client';

// // import { useState, useMemo, useCallback, useRef, type ChangeEvent } from 'react';
// // import { useCart } from '@/lib/cartContext';
// // import { fireConfetti } from '@/components/cart/ConfettiManager';
// // import UpperNav from '@/components/ui/UpperNav';
// // import { useRouter } from 'next/navigation';

// // /* ─────────────────────────────────────────────────────────────
// //    TYPES
// // ───────────────────────────────────────────────────────────── */
// // type CategoryKey =
// //   | 'necklace' | 'earrings' | 'bracelets' | 'rings'
// //   | 'gift-boxes' | 'keychains' | 'hair-accessories';

// // interface ComboProduct {
// //   id: number;
// //   name: string;
// //   price: number;
// //   image: string;
// //   customisable: boolean;
// // }

// // interface PresetCombo {
// //   id: string;
// //   name: string;
// //   tagline: string;
// //   price: number;
// //   originalPrice: number;
// //   image: string;
// //   badge: string;
// //   badgeColor: string;
// //   includedCategories: CategoryKey[];
// //   defaultSelections: Partial<Record<CategoryKey, number>>;
// // }

// // /* ─────────────────────────────────────────────────────────────
// //    DATA
// // ───────────────────────────────────────────────────────────── */
// // const PRODUCTS_BY_CATEGORY: Record<CategoryKey, ComboProduct[]> = {
// //   necklace: [
// //     { id: 1, name: 'Dainty Layered Necklace', price: 1299, image: 'https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?w=400&q=80', customisable: false },
// //     { id: 2, name: 'Pearl Pendant Necklace',  price: 2499, image: 'https://images.unsplash.com/photo-1573408301185-9519f94816b5?w=400&q=80', customisable: false },
// //     { id: 3, name: 'Layered Gold Chain',       price: 1599, image: 'https://images.unsplash.com/photo-1611591437281-460bfbe1220a?w=400&q=80', customisable: false },
// //   ],
// //   earrings: [
// //     { id: 4, name: 'Gold Hoop Earrings',    price: 899,  image: 'https://images.unsplash.com/photo-1588444650733-d0f07d323dde?w=400&q=80', customisable: false },
// //     { id: 5, name: 'Minimal Stud Earrings', price: 549,  image: 'https://images.unsplash.com/photo-1605100804763-247f67b3557e?w=400&q=80', customisable: false },
// //     { id: 6, name: 'Korean Ear Cuffs',      price: 699,  image: 'https://images.unsplash.com/photo-1617038260897-41a1f14a8ca0?w=400&q=80', customisable: false },
// //   ],
// //   bracelets: [
// //     { id: 7,  name: 'Beaded Charm Bracelet',  price: 749,  image: 'https://images.unsplash.com/photo-1602173574767-37ac01994b2a?w=400&q=80', customisable: false },
// //     { id: 8,  name: 'Kada Bangle Set',         price: 1899, image: 'https://images.unsplash.com/photo-1612817288484-6f916006741a?w=400&q=80', customisable: false },
// //     { id: 9,  name: 'Minimal Chain Bracelet',  price: 999,  image: 'https://images.unsplash.com/photo-1612817288484-6f916006741a?w=400&q=80', customisable: false },
// //   ],
// //   rings: [
// //     { id: 10, name: 'Diamond Ring',      price: 2999, image: 'https://images.unsplash.com/photo-1605100804763-247f67b3557e?w=400&q=80', customisable: false },
// //     { id: 11, name: 'Minimal Gold Ring', price: 999,  image: 'https://images.unsplash.com/photo-1605100804763-247f67b3557e?w=400&q=80', customisable: false },
// //     { id: 12, name: 'Couple Rings Set',  price: 1999, image: 'https://images.unsplash.com/photo-1588444650733-d0f07d323dde?w=400&q=80', customisable: false },
// //   ],
// //   'gift-boxes': [
// //     { id: 16, name: 'Luxury Gift Box',   price: 2499, image: 'https://images.unsplash.com/photo-1549465220-1a8b9238cd48?w=400&q=80', customisable: true },
// //     { id: 17, name: 'Birthday Gift Box', price: 1999, image: 'https://images.unsplash.com/photo-1549465220-1a8b9238cd48?w=400&q=80', customisable: true },
// //   ],
// //   keychains: [
// //     { id: 18, name: 'Personalised Keychain', price: 399, image: 'https://images.unsplash.com/photo-1582143570735-ebf7c44a5c54?w=400&q=80', customisable: true },
// //     { id: 19, name: 'Metal Charm Keychain',  price: 499, image: 'https://images.unsplash.com/photo-1582143570735-ebf7c44a5c54?w=400&q=80', customisable: true },
// //   ],
// //   'hair-accessories': [
// //     { id: 13, name: 'Elegant Hair Clip', price: 499, image: 'https://images.unsplash.com/photo-1591206422576-7e00ff5f7db7?w=400&q=80', customisable: false },
// //     { id: 14, name: 'Pearl Hair Band',   price: 799, image: 'https://images.unsplash.com/photo-1591206422576-7e00ff5f7db7?w=400&q=80', customisable: false },
// //     { id: 15, name: 'Floral Hair Pins',  price: 599, image: 'https://images.unsplash.com/photo-1591206422576-7e00ff5f7db7?w=400&q=80', customisable: false },
// //   ],
// // };

// // const PRESET_COMBOS: PresetCombo[] = [
// //   {
// //     id: 'festive',
// //     name: 'Festive Glow',
// //     tagline: 'Celebrate every moment',
// //     price: 2999, originalPrice: 4500,
// //     image: 'https://images.unsplash.com/photo-1602173574767-37ac01994b2a?w=600&q=85',
// //     badge: 'Most Loved', badgeColor: '#c9a84c',
// //     includedCategories: ['necklace', 'earrings', 'bracelets'],
// //     defaultSelections: { necklace: 1, earrings: 4, bracelets: 7 },
// //   },
// //   {
// //     id: 'bridal',
// //     name: 'Bridal Radiance',
// //     tagline: 'For your most beautiful day',
// //     price: 5999, originalPrice: 8800,
// //     image: 'https://images.unsplash.com/photo-1573408301185-9519f94816b5?w=600&q=85',
// //     badge: 'Premium', badgeColor: '#8b5cf6',
// //     includedCategories: ['necklace', 'earrings', 'rings', 'bracelets'],
// //     defaultSelections: { necklace: 2, earrings: 4, rings: 10, bracelets: 8 },
// //   },
// //   {
// //     id: 'minimal',
// //     name: 'Minimal Edit',
// //     tagline: 'Less is more, always',
// //     price: 1999, originalPrice: 2800,
// //     image: 'https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?w=600&q=85',
// //     badge: 'New', badgeColor: '#3a8c72',
// //     includedCategories: ['necklace', 'earrings'],
// //     defaultSelections: { necklace: 1, earrings: 5 },
// //   },
// //   {
// //     id: 'gifting',
// //     name: 'Gifting Special',
// //     tagline: 'Curated with love',
// //     price: 3499, originalPrice: 5200,
// //     image: 'https://images.unsplash.com/photo-1549465220-1a8b9238cd48?w=600&q=85',
// //     badge: 'Gift Ready', badgeColor: '#e05c9b',
// //     includedCategories: ['necklace', 'earrings', 'bracelets', 'gift-boxes'],
// //     defaultSelections: { necklace: 3, earrings: 6, bracelets: 9, 'gift-boxes': 16 },
// //   },
// // ];

// // const CAT_LABELS: Record<CategoryKey, string> = {
// //   necklace: 'Necklace', earrings: 'Earrings', bracelets: 'Bracelet',
// //   rings: 'Ring', 'gift-boxes': 'Gift Box', keychains: 'Keychain',
// //   'hair-accessories': 'Hair Accessory',
// // };

// // const ALL_CATEGORIES = Object.keys(PRODUCTS_BY_CATEGORY) as CategoryKey[];

// // /* ─────────────────────────────────────────────────────────────
// //    HELPER: build cart-compatible item from a combo
// //    The useCart.addItem expects this shape (from your cartContext):
// //    { id, name, price, originalPrice, image, color, colorHex, sku, href }
// // ───────────────────────────────────────────────────────────── */
// // function buildCartItem(
// //   comboId: string,
// //   comboName: string,
// //   price: number,
// //   originalPrice: number | null,
// //   image: string,
// // ) {
// //   return {
// //     id: `combo-${comboId}-${Date.now()}`,    // unique per add
// //     name: comboName,
// //     price,
// //     originalPrice,
// //     image,
// //     color: 'Mixed',
// //     colorHex: '#c9a84c',
// //     sku: `COMBO-${comboId.toUpperCase()}`,
// //     href: `/combos/${comboId}`,
// //   };
// // }

// // /* ─────────────────────────────────────────────────────────────
// //    MINI CUSTOM PANEL
// // ───────────────────────────────────────────────────────────── */
// // function MiniCustomPanel({ productName }: { productName: string }) {
// //   const [text, setText] = useState('');
// //   const [preview, setPreview] = useState<string | null>(null);

// //   const handleFile = (e: ChangeEvent<HTMLInputElement>) => {
// //     const f = e.currentTarget.files?.[0];
// //     if (!f) return;
// //     const r = new FileReader();
// //     r.onload = ev => setPreview((ev.target?.result as string) || null);
// //     r.readAsDataURL(f);
// //   };

// //   return (
// //     <div className="cust-panel">
// //       <div className="cust-panel-head">
// //         <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
// //           <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/>
// //         </svg>
// //         Personalise · {productName}
// //       </div>
// //       <input
// //         className="cust-input"
// //         placeholder="Add a name or message (e.g. 'Happy Birthday Sarah')…"
// //         value={text}
// //         onChange={e => setText(e.target.value)}
// //         maxLength={80}
// //       />
// //       <label className="cust-upload">
// //         <input type="file" accept="image/*" style={{ display:'none' }} onChange={handleFile} />
// //         {preview
// //           ? <img src={preview} alt="preview" style={{ width:32, height:32, objectFit:'cover', borderRadius:6 }} />
// //           : <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
// //               <rect x="3" y="3" width="18" height="18" rx="3"/>
// //               <circle cx="8.5" cy="8.5" r="1.5"/>
// //               <polyline points="21 15 16 10 5 21"/>
// //             </svg>
// //         }
// //         <span>{preview ? 'Change photo' : 'Upload photo'}</span>
// //       </label>
// //     </div>
// //   );
// // }

// // /* ─────────────────────────────────────────────────────────────
// //    PRODUCT CARD (used inside category rows)
// // ───────────────────────────────────────────────────────────── */
// // function ProdCard({ product, selected, onSelect }: {
// //   product: ComboProduct; selected: boolean; onSelect: (id: number) => void;
// // }) {
// //   return (
// //     <button className={`prod-card ${selected ? 'sel' : ''}`} onClick={() => onSelect(product.id)}>
// //       <div className="prod-img-wrap">
// //         <img src={product.image} alt={product.name} />
// //         {selected && (
// //           <div className="prod-check">
// //             <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3">
// //               <polyline points="20 6 9 17 4 12"/>
// //             </svg>
// //           </div>
// //         )}
// //       </div>
// //       <div className="prod-info">
// //         <span className="prod-name">{product.name}</span>
// //         <span className="prod-price">₹{product.price.toLocaleString('en-IN')}</span>
// //       </div>
// //     </button>
// //   );
// // }

// // /* ─────────────────────────────────────────────────────────────
// //    CATEGORY ROW — single-select (preset mode)
// // ───────────────────────────────────────────────────────────── */
// // function CatRow({ catKey, products, selectedId, onSelect, label }: {
// //   catKey: CategoryKey; products: ComboProduct[]; selectedId?: number;
// //   onSelect: (k: CategoryKey, id: number) => void; label: string;
// // }) {
// //   const [open, setOpen] = useState(false);
// //   const sel = products.find(p => p.id === selectedId);

// //   return (
// //     <div className="cat-row">
// //       <button className="cat-row-head" onClick={() => setOpen(o => !o)}>
// //         <div className="cat-row-left">
// //           <span className={`cat-dot ${sel ? 'done' : ''}`}>
// //             {sel
// //               ? <svg width="9" height="9" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><polyline points="20 6 9 17 4 12"/></svg>
// //               : ''}
// //           </span>
// //           <span className="cat-label">{label}</span>
// //           {sel && <span className="cat-sel-name">{sel.name}</span>}
// //         </div>
// //         <div className="cat-row-right">
// //           {sel && <span className="cat-sel-price">₹{sel.price.toLocaleString('en-IN')}</span>}
// //           <svg className={`cat-chevron ${open ? 'open' : ''}`} width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
// //             <polyline points="6 9 12 15 18 9"/>
// //           </svg>
// //         </div>
// //       </button>
// //       {open && (
// //         <>
// //           <div className="cat-products">
// //             {products.map(p => (
// //               <ProdCard key={p.id} product={p} selected={selectedId === p.id} onSelect={id => onSelect(catKey, id)} />
// //             ))}
// //           </div>
// //           {sel?.customisable && <MiniCustomPanel productName={sel.name} />}
// //         </>
// //       )}
// //     </div>
// //   );
// // }

// // /* ─────────────────────────────────────────────────────────────
// //    CATEGORY ROW — multi-select (custom mode)
// // ───────────────────────────────────────────────────────────── */
// // function CatRowMulti({ catKey, products, selectedIds, onToggle, label }: {
// //   catKey: CategoryKey; products: ComboProduct[]; selectedIds: number[];
// //   onToggle: (k: CategoryKey, id: number) => void; label: string;
// // }) {
// //   const [open, setOpen] = useState(false);
// //   const count = selectedIds.length;
// //   const anyCustom = selectedIds.some(id => products.find(p => p.id === id)?.customisable);

// //   return (
// //     <div className="cat-row">
// //       <button className="cat-row-head" onClick={() => setOpen(o => !o)}>
// //         <div className="cat-row-left">
// //           <span className={`cat-dot ${count > 0 ? 'done' : ''}`}>
// //             {count > 0
// //               ? <svg width="9" height="9" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><polyline points="20 6 9 17 4 12"/></svg>
// //               : ''}
// //           </span>
// //           <span className="cat-label">{label}</span>
// //           {count > 0 && <span className="cat-sel-name">{count} selected</span>}
// //         </div>
// //         <div className="cat-row-right">
// //           <svg className={`cat-chevron ${open ? 'open' : ''}`} width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
// //             <polyline points="6 9 12 15 18 9"/>
// //           </svg>
// //         </div>
// //       </button>
// //       {open && (
// //         <>
// //           <div className="cat-products">
// //             {products.map(p => (
// //               <ProdCard key={p.id} product={p} selected={selectedIds.includes(p.id)} onSelect={id => onToggle(catKey, id)} />
// //             ))}
// //           </div>
// //           {open && anyCustom && <MiniCustomPanel productName={label} />}
// //         </>
// //       )}
// //     </div>
// //   );
// // }

// // /* ─────────────────────────────────────────────────────────────
// //    PRESET COMBO CARD
// // ───────────────────────────────────────────────────────────── */
// // function PresetCard({ combo, selected, onSelect }: {
// //   combo: PresetCombo; selected: boolean; onSelect: (id: string) => void;
// // }) {
// //   const disc = Math.round(((combo.originalPrice - combo.price) / combo.originalPrice) * 100);
// //   return (
// //     <button className={`preset-card ${selected ? 'sel' : ''}`} onClick={() => onSelect(combo.id)}>
// //       <div className="preset-img-wrap">
// //         <img src={combo.image} alt={combo.name} />
// //         <div className="preset-img-grad" />
// //         <span className="preset-badge" style={{ background: combo.badgeColor }}>{combo.badge}</span>
// //         <span className="preset-disc-pill">{disc}% off</span>
// //         {selected && (
// //           <div className="preset-sel-ring">
// //             <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5">
// //               <polyline points="20 6 9 17 4 12"/>
// //             </svg>
// //           </div>
// //         )}
// //       </div>
// //       <div className="preset-body">
// //         <span className="preset-name">{combo.name}</span>
// //         <span className="preset-tagline">{combo.tagline}</span>
// //         <div className="preset-price-row">
// //           <span className="preset-price">₹{combo.price.toLocaleString('en-IN')}</span>
// //           <span className="preset-orig">₹{combo.originalPrice.toLocaleString('en-IN')}</span>
// //         </div>
// //         <div className="preset-tags">
// //           {combo.includedCategories.map(c => (
// //             <span key={c} className="preset-tag">{CAT_LABELS[c]}</span>
// //           ))}
// //         </div>
// //       </div>
// //     </button>
// //   );
// // }

// // /* ─────────────────────────────────────────────────────────────
// //    MAIN PAGE
// // ───────────────────────────────────────────────────────────── */
// // export default function CuratedCombosPage() {
// //   const { addItem } = useCart();
// //   const router = useRouter();
// //   const cartBtnRef = useRef<HTMLButtonElement | null>(null);

// //   const [mode, setMode] = useState<'preset' | 'custom'>('preset');
// //   const [selectedComboId, setSelectedComboId] = useState('festive');
// //   const [comboSelections, setComboSelections] = useState<Partial<Record<CategoryKey, number>>>(() => {
// //     const c = PRESET_COMBOS.find(c => c.id === 'festive');
// //     return c ? { ...c.defaultSelections } : {};
// //   });
// //   const [customSelectedIds, setCustomSelectedIds] = useState<Partial<Record<CategoryKey, number[]>>>({});
// //   const [customCategories, setCustomCategories] = useState<CategoryKey[]>(['necklace', 'earrings']);
// //   const [cartAdded, setCartAdded] = useState(false);

// //   const selectedCombo = PRESET_COMBOS.find(c => c.id === selectedComboId);

// //   const handleComboSelect = useCallback((id: string) => {
// //     setSelectedComboId(id);
// //     const c = PRESET_COMBOS.find(c => c.id === id);
// //     if (c) setComboSelections({ ...c.defaultSelections });
// //   }, []);

// //   const handlePresetSelection = useCallback((k: CategoryKey, id: number) => {
// //     setComboSelections(prev => ({ ...prev, [k]: id }));
// //   }, []);

// //   const handleCustomToggle = useCallback((k: CategoryKey, id: number) => {
// //     setCustomSelectedIds(prev => {
// //       const cur = prev[k] || [];
// //       return { ...prev, [k]: cur.includes(id) ? cur.filter(x => x !== id) : [...cur, id] };
// //     });
// //   }, []);

// //   /* ── Derived values ── */
// //   const customTotal = useMemo(() => {
// //     return customCategories.reduce((sum, cat) => {
// //       return sum + (customSelectedIds[cat] || []).reduce((s, id) => {
// //         const p = PRODUCTS_BY_CATEGORY[cat]?.find(p => p.id === id);
// //         return s + (p?.price || 0);
// //       }, 0);
// //     }, 0);
// //   }, [customSelectedIds, customCategories]);

// //   const presetTotal = selectedCombo?.price || 0;
// //   const totalPrice = mode === 'preset' ? presetTotal : customTotal;
// //   const totalOriginal = mode === 'preset' ? (selectedCombo?.originalPrice || presetTotal) : customTotal;
// //   const savings = totalOriginal - totalPrice;

// //   // Summary items for preset
// //   const presetSummaryItems = useMemo(() => {
// //     if (!selectedCombo) return [];
// //     return selectedCombo.includedCategories.flatMap(k => {
// //       const id = comboSelections[k];
// //       const p = PRODUCTS_BY_CATEGORY[k]?.find(p => p.id === id);
// //       return p ? [{ k, p }] : [];
// //     });
// //   }, [selectedCombo, comboSelections]);

// //   // Summary items for custom
// //   const customSummaryItems = useMemo(() => {
// //     return customCategories.flatMap(k =>
// //       (customSelectedIds[k] || []).flatMap(id => {
// //         const p = PRODUCTS_BY_CATEGORY[k]?.find(p => p.id === id);
// //         return p ? [{ k, p }] : [];
// //       })
// //     );
// //   }, [customSelectedIds, customCategories]);

// //   const summaryItems = mode === 'preset' ? presetSummaryItems.map(i => ({ k: i.k, p: i.p })) : customSummaryItems;
// //   const hasItems = summaryItems.length > 0;

// //   /* ── Cart actions ── */
// //   function handleAddToCart() {
// //     if (!hasItems) return;

// //     if (mode === 'preset' && selectedCombo) {
// //       // Add the preset combo as ONE cart item using the combo's price
// //       addItem(buildCartItem(
// //         selectedCombo.id,
// //         selectedCombo.name,
// //         selectedCombo.price,
// //         selectedCombo.originalPrice,
// //         selectedCombo.image,
// //       ));
// //     } else {
// //       // Custom mode: add each selected product individually
// //       customSummaryItems.forEach(({ k, p }) => {
// //         addItem({
// //           id: `${k}-${p.id}`,
// //           name: p.name,
// //           price: p.price,
// //           originalPrice: null,
// //           image: p.image,
// //           color: CAT_LABELS[k],
// //           colorHex: '#c9a84c',
// //           sku: `PROD-${p.id}`,
// //           href: `/products/${p.id}`,
// //         });
// //       });
// //     }

// //     fireConfetti(cartBtnRef.current);
// //     setCartAdded(true);
// //     setTimeout(() => setCartAdded(false), 1800);
// //   }

// //   function handleBuyNow() {
// //     if (!hasItems) return;
// //     handleAddToCart();
// //     // Navigate to checkout after a short delay so cart state settles
// //     setTimeout(() => router.push('/checkout'), 150);
// //   }

// //   /* ─────────────────────────────────────────────────────────────
// //      RENDER
// //   ───────────────────────────────────────────────────────────── */
// //   return (
// //     <>
// //       <style>{`
// //         @import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,300;0,400;0,600;1,300;1,400&family=Outfit:wght@300;400;500;600&display=swap');

// //         :root {
// //           --cream:    #f7f3ec;
// //           --cream2:   #efe9de;
// //           --cream3:   #e2d9c8;
// //           --ink:      #1c1a14;
// //           --ink2:     #4a4535;
// //           --mist:     rgba(28,26,20,.4);
// //           --gold:     #c9a84c;
// //           --gold2:    #b8902b;
// //           --olive:    #3d4a22;
// //           --olive2:   #5a6b2e;
// //           --olive-lt: #f0f2e6;
// //           --green:    #2e7d32;
// //           --white:    #ffffff;
// //           --radius:   16px;
// //           --shadow-sm: 0 2px 12px rgba(28,26,20,.07);
// //           --shadow-md: 0 8px 32px rgba(28,26,20,.1);
// //           --shadow-lg: 0 20px 56px rgba(28,26,20,.14);
// //         }

// //         *, *::before, *::after { box-sizing:border-box; margin:0; padding:0; }

// //         .cc {
// //           min-height: 100vh;
// //           background: var(--cream);
// //           color: var(--ink);
// //           font-family: 'Outfit', sans-serif;
// //         }

// //         /* ── HERO BAND ─────────────────────────────────── */
// //         .cc-hero {
// //           padding: clamp(24px,4vw,44px) clamp(16px,5vw,64px) clamp(20px,3.5vw,36px);
// //           background: linear-gradient(135deg, #ede5d0 0%, #f5f0e4 60%, #ece4d4 100%);
// //           border-bottom: 1px solid var(--cream3);
// //           position: relative;
// //           overflow: hidden;
// //         }
// //         .cc-hero::before {
// //           content:'';
// //           position:absolute; right:-5%; top:-40%;
// //           width: min(400px,55vw); height: min(400px,55vw);
// //           border-radius: 50%;
// //           background: radial-gradient(circle, rgba(201,168,76,.1) 0%, transparent 70%);
// //           pointer-events:none;
// //         }
// //         .cc-hero-eyebrow {
// //           font-size: 9px; letter-spacing: .42em; text-transform: uppercase;
// //           color: var(--gold); margin-bottom: 10px;
// //           display: flex; align-items: center; gap: 10px;
// //         }
// //         .cc-hero-eyebrow::before {
// //           content:''; width:28px; height:1px;
// //           background: linear-gradient(90deg, var(--gold), transparent);
// //         }
// //         .cc-hero h1 {
// //           font-family: 'Cormorant Garamond', serif;
// //           font-size: clamp(1.9rem, 4vw, 3.4rem);
// //           font-weight: 300; line-height: 1.06;
// //           letter-spacing: -.02em; color: var(--olive);
// //         }
// //         .cc-hero h1 em { font-style: italic; color: var(--gold); }
// //         .cc-hero-sub {
// //           font-size: clamp(11px,1.3vw,12.5px); font-weight: 300;
// //           color: var(--mist); margin-top: 7px; line-height: 1.7; letter-spacing: .03em;
// //           max-width: 480px;
// //         }

// //         /* ── MODE TOGGLE ───────────────────────────────── */
// //         .cc-mode {
// //           padding: 20px clamp(16px,5vw,64px) 0;
// //           display: flex; align-items: center; justify-content: space-between;
// //           flex-wrap: wrap; gap: 12px;
// //         }
// //         .cc-toggle {
// //           display: inline-flex;
// //           background: var(--white);
// //           border: 1.5px solid var(--cream3);
// //           border-radius: 50px; padding: 4px; gap: 3px;
// //           box-shadow: var(--shadow-sm);
// //         }
// //         .cc-toggle-btn {
// //           font-family: 'Outfit', sans-serif;
// //           font-size: 9.5px; font-weight: 600; letter-spacing: .16em; text-transform: uppercase;
// //           padding: 9px 22px; border-radius: 50px; border: none; cursor: pointer;
// //           transition: all .25s; background: transparent; color: var(--mist);
// //         }
// //         .cc-toggle-btn.on {
// //           background: var(--olive); color: var(--cream);
// //           box-shadow: 0 4px 14px rgba(61,74,34,.25);
// //         }
// //         .cc-mode-hint {
// //           font-size: 10.5px; font-weight: 300; color: var(--mist); letter-spacing: .02em;
// //         }

// //         /* ── BODY LAYOUT ───────────────────────────────── */
// //         .cc-body {
// //           display: grid;
// //           grid-template-columns: 1fr 340px;
// //           gap: 24px;
// //           padding: 24px clamp(16px,5vw,64px) 72px;
// //           align-items: start;
// //         }
// //         @media (max-width: 960px) {
// //           .cc-body { grid-template-columns: 1fr; }
// //           .cc-summary { position: static !important; }
// //         }

// //         /* ── SECTION LABEL ─────────────────────────────── */
// //         .sec-lbl {
// //           font-size: 8.5px; letter-spacing: .4em; text-transform: uppercase;
// //           color: var(--mist); font-weight: 500; margin-bottom: 14px;
// //           display: flex; align-items: center; gap: 12px;
// //         }
// //         .sec-lbl::after {
// //           content:''; flex:1; height:1px;
// //           background: linear-gradient(90deg, var(--cream3), transparent);
// //         }

// //         /* ── PRESET COMBO GRID ─────────────────────────── */
// //         .preset-grid {
// //           display: grid;
// //           grid-template-columns: repeat(auto-fill, minmax(185px, 1fr));
// //           gap: 14px; margin-bottom: 28px;
// //         }

// //         .preset-card {
// //           background: var(--white);
// //           border: 2px solid var(--cream3);
// //           border-radius: 20px; overflow: hidden;
// //           cursor: pointer; text-align: left; padding: 0;
// //           transition: border-color .22s, box-shadow .22s, transform .2s;
// //           box-shadow: var(--shadow-sm);
// //         }
// //         .preset-card:hover {
// //           border-color: var(--gold); box-shadow: var(--shadow-md);
// //           transform: translateY(-2px);
// //         }
// //         .preset-card.sel {
// //           border-color: var(--gold);
// //           box-shadow: 0 0 0 4px rgba(201,168,76,.15), var(--shadow-md);
// //         }
// //         .preset-img-wrap {
// //           position: relative; aspect-ratio: 4/3; overflow: hidden;
// //         }
// //         .preset-img-wrap img {
// //           width:100%; height:100%; object-fit:cover;
// //           transition: transform .45s ease;
// //         }
// //         .preset-card:hover .preset-img-wrap img { transform: scale(1.07); }
// //         .preset-img-grad {
// //           position:absolute; inset:0;
// //           background: linear-gradient(to top, rgba(28,26,20,.62) 0%, transparent 55%);
// //         }
// //         .preset-badge {
// //           position:absolute; top:9px; left:9px;
// //           font-size:7.5px; font-weight:700; letter-spacing:.14em; text-transform:uppercase;
// //           color:#fff; padding:3px 9px; border-radius:4px;
// //         }
// //         .preset-disc-pill {
// //           position:absolute; top:9px; right:9px;
// //           font-size:7.5px; font-weight:700; letter-spacing:.1em;
// //           color:var(--ink); background:var(--cream); padding:3px 8px; border-radius:4px;
// //         }
// //         .preset-sel-ring {
// //           position:absolute; bottom:8px; right:8px;
// //           width:28px; height:28px; border-radius:50%;
// //           background:var(--gold);
// //           display:flex; align-items:center; justify-content:center;
// //           box-shadow: 0 2px 8px rgba(201,168,76,.4);
// //         }
// //         .preset-body { padding: 12px 14px 14px; }
// //         .preset-name {
// //           display:block; font-family:'Cormorant Garamond',serif;
// //           font-size:1.05rem; font-weight:400; color:var(--olive); margin-bottom:2px;
// //         }
// //         .preset-tagline {
// //           display:block; font-size:9.5px; color:var(--mist);
// //           letter-spacing:.05em; margin-bottom:9px;
// //         }
// //         .preset-price-row { display:flex; align-items:baseline; gap:7px; margin-bottom:8px; }
// //         .preset-price {
// //           font-family:'Cormorant Garamond',serif; font-size:1.2rem;
// //           font-weight:600; color:var(--ink);
// //         }
// //         .preset-orig {
// //           font-size:10.5px; color:var(--mist); text-decoration:line-through;
// //         }
// //         .preset-tags { display:flex; flex-wrap:wrap; gap:4px; }
// //         .preset-tag {
// //           font-size:8px; letter-spacing:.1em; text-transform:uppercase;
// //           color:var(--mist); border:1px solid var(--cream3);
// //           padding:2px 7px; border-radius:50px;
// //         }

// //         /* ── CUSTOMISE BLOCK ───────────────────────────── */
// //         .cust-block {
// //           background: var(--white);
// //           border: 1.5px solid var(--cream3);
// //           border-radius: var(--radius);
// //           overflow: hidden;
// //           box-shadow: var(--shadow-sm);
// //         }
// //         .cust-block-head {
// //           padding: 14px 18px;
// //           border-bottom: 1px solid var(--cream3);
// //           background: linear-gradient(135deg, var(--olive-lt), var(--cream2));
// //           display: flex; align-items: center; justify-content: space-between;
// //         }
// //         .cust-block-title {
// //           font-family: 'Cormorant Garamond', serif; font-size: 1rem; color: var(--olive);
// //         }
// //         .cust-block-sub { font-size: 9.5px; color: var(--mist); }

// //         /* ── CATEGORY ROWS ─────────────────────────────── */
// //         .cat-row { border-bottom: 1px solid rgba(28,26,20,.06); }
// //         .cat-row:last-child { border-bottom: none; }
// //         .cat-row-head {
// //           width:100%; text-align:left;
// //           display:flex; align-items:center; justify-content:space-between;
// //           padding: 12px 18px; cursor:pointer;
// //           background:transparent; border:none;
// //           transition: background .15s;
// //         }
// //         .cat-row-head:hover { background: var(--olive-lt); }
// //         .cat-row-left { display:flex; align-items:center; gap:9px; }
// //         .cat-dot {
// //           width:18px; height:18px; border-radius:50%; flex-shrink:0;
// //           display:flex; align-items:center; justify-content:center;
// //           background:var(--cream2); color:var(--mist); font-size:9px;
// //           border: 1.5px solid var(--cream3);
// //           transition: background .2s, border-color .2s, color .2s;
// //         }
// //         .cat-dot.done { background:var(--gold); border-color:var(--gold); color:#fff; }
// //         .cat-label {
// //           font-size:10.5px; font-weight:600; letter-spacing:.1em;
// //           text-transform:uppercase; color:var(--olive);
// //         }
// //         .cat-sel-name { font-size:10px; color:var(--mist); font-weight:300; }
// //         .cat-row-right { display:flex; align-items:center; gap:8px; }
// //         .cat-sel-price { font-size:11px; font-weight:600; color:var(--ink); }
// //         .cat-chevron { color:var(--mist); transition:transform .25s; }
// //         .cat-chevron.open { transform:rotate(180deg); }
// //         .cat-products {
// //           display:grid;
// //           grid-template-columns: repeat(auto-fill, minmax(120px, 1fr));
// //           gap:9px; padding: 4px 18px 14px;
// //         }

// //         /* Product card in row */
// //         .prod-card {
// //           background:var(--cream);
// //           border:1.5px solid var(--cream3);
// //           border-radius:12px; overflow:hidden;
// //           cursor:pointer; text-align:left; padding:0;
// //           transition: border-color .2s, box-shadow .2s, transform .18s;
// //           box-shadow: none;
// //         }
// //         .prod-card:hover { border-color:var(--gold); transform:translateY(-1px); box-shadow:var(--shadow-sm); }
// //         .prod-card.sel { border-color:var(--gold); box-shadow:0 0 0 2px rgba(201,168,76,.2); }
// //         .prod-img-wrap { position:relative; aspect-ratio:1; overflow:hidden; }
// //         .prod-img-wrap img { width:100%; height:100%; object-fit:cover; transition:transform .35s; }
// //         .prod-card:hover .prod-img-wrap img { transform:scale(1.07); }
// //         .prod-check {
// //           position:absolute; top:5px; right:5px;
// //           width:20px; height:20px; border-radius:50%;
// //           background:var(--gold);
// //           display:flex; align-items:center; justify-content:center;
// //         }
// //         .prod-info { padding:7px 9px; }
// //         .prod-name {
// //           display:block; font-size:9.5px; font-weight:500;
// //           color:var(--ink); margin-bottom:2px; line-height:1.3;
// //           white-space:nowrap; overflow:hidden; text-overflow:ellipsis;
// //         }
// //         .prod-price { display:block; font-size:10px; font-weight:600; color:var(--olive2); }

// //         /* ── CUSTOM PANEL ──────────────────────────────── */
// //         .cust-panel {
// //           margin: 0 18px 14px;
// //           background: linear-gradient(135deg, rgba(201,168,76,.07), rgba(90,110,35,.04));
// //           border:1px solid rgba(201,168,76,.22); border-radius:10px; padding:11px 13px;
// //         }
// //         .cust-panel-head {
// //           display:flex; align-items:center; gap:6px;
// //           font-size:9.5px; font-weight:700; letter-spacing:.12em; text-transform:uppercase;
// //           color:#8c6b20; margin-bottom:9px;
// //         }
// //         .cust-input {
// //           width:100%; border:1.5px solid var(--cream3); border-radius:8px; padding:7px 11px;
// //           font-family:'Outfit',sans-serif; font-size:11px; color:var(--ink);
// //           background:var(--white); outline:none; margin-bottom:7px;
// //           transition:border-color .2s;
// //         }
// //         .cust-input:focus { border-color:var(--olive2); }
// //         .cust-input::placeholder { color:rgba(28,26,20,.3); }
// //         .cust-upload {
// //           display:inline-flex; align-items:center; gap:6px;
// //           font-size:9.5px; font-weight:600; letter-spacing:.1em; text-transform:uppercase;
// //           color:var(--olive); border:1.5px dashed var(--cream3);
// //           border-radius:8px; padding:6px 13px; cursor:pointer;
// //           background:var(--white); transition:border-color .2s, background .2s;
// //         }
// //         .cust-upload:hover { border-color:var(--olive2); background:var(--olive-lt); }

// //         /* ── CUSTOM MODE ADD-CATS ───────────────────────── */
// //         .add-cats { display:flex; flex-wrap:wrap; gap:7px; margin-bottom:20px; }
// //         .add-cat-btn {
// //           font-family:'Outfit',sans-serif;
// //           font-size:9.5px; font-weight:600; letter-spacing:.14em; text-transform:uppercase;
// //           padding:7px 15px; border:1.5px solid rgba(61,74,34,.15); border-radius:50px;
// //           background:transparent; color:var(--mist); cursor:pointer; transition:all .2s;
// //         }
// //         .add-cat-btn:hover { color:var(--olive); border-color:var(--olive2); background:var(--olive-lt); }
// //         .add-cat-btn.on { color:var(--cream); background:var(--olive); border-color:var(--olive); }
// //         .custom-block {
// //           background:var(--white); border:1.5px solid var(--cream3);
// //           border-radius:var(--radius); overflow:hidden; box-shadow:var(--shadow-sm);
// //         }

// //         /* ── SUMMARY ────────────────────────────────────── */
// //         .cc-summary {
// //           position: sticky; top: 88px;
// //           background: var(--white);
// //           border: 1.5px solid var(--cream3);
// //           border-radius: 20px; overflow: hidden;
// //           box-shadow: var(--shadow-md);
// //         }
// //         .sum-header {
// //           padding: 18px 20px 14px;
// //           background: linear-gradient(135deg, #ede5d0, #f5f0e4);
// //           border-bottom: 1px solid var(--cream3);
// //         }
// //         .sum-title {
// //           font-family:'Cormorant Garamond',serif; font-size:1.1rem;
// //           font-weight:400; color:var(--olive);
// //         }
// //         .sum-mode {
// //           display:block; font-size:8.5px; font-weight:600;
// //           letter-spacing:.2em; text-transform:uppercase; color:var(--gold); margin-top:2px;
// //         }
// //         .sum-body { padding:14px 18px; }
// //         .sum-items { margin-bottom:14px; max-height:280px; overflow-y:auto; }
// //         .sum-items::-webkit-scrollbar { width:3px; }
// //         .sum-items::-webkit-scrollbar-thumb { background:var(--cream3); border-radius:2px; }

// //         .sum-item {
// //           display:flex; align-items:center; gap:10px;
// //           padding:8px 0; border-bottom:1px solid rgba(28,26,20,.05);
// //         }
// //         .sum-item:last-child { border-bottom:none; }
// //         .sum-item-img {
// //           width:38px; height:38px; border-radius:8px; object-fit:cover;
// //           border:1px solid var(--cream3); flex-shrink:0;
// //         }
// //         .sum-item-info { flex:1; min-width:0; }
// //         .sum-item-cat {
// //           display:block; font-size:8px; letter-spacing:.14em; text-transform:uppercase;
// //           color:var(--mist);
// //         }
// //         .sum-item-name {
// //           display:block; font-size:10.5px; font-weight:500; color:var(--ink);
// //           white-space:nowrap; overflow:hidden; text-overflow:ellipsis;
// //         }
// //         .sum-item-price { font-size:10.5px; font-weight:600; color:var(--olive2); flex-shrink:0; }

// //         .sum-empty {
// //           font-size:11px; font-weight:300; color:var(--mist);
// //           text-align:center; padding:20px 0; font-style:italic; letter-spacing:.04em;
// //         }

// //         .sum-divider {
// //           height:1px;
// //           background: linear-gradient(90deg, rgba(61,74,34,.1), rgba(201,168,76,.25), rgba(61,74,34,.1));
// //           margin: 12px 0;
// //         }
// //         .sum-total-row {
// //           display:flex; justify-content:space-between; align-items:baseline; margin-bottom:4px;
// //         }
// //         .sum-total-label { font-size:9.5px; letter-spacing:.12em; text-transform:uppercase; color:var(--mist); }
// //         .sum-total-val {
// //           font-family:'Cormorant Garamond',serif; font-size:1.65rem;
// //           font-weight:600; color:var(--ink);
// //         }
// //         .sum-savings {
// //           font-size:10px; font-weight:600; color:var(--green);
// //           margin-bottom:14px; letter-spacing:.03em;
// //         }

// //         /* ── CTA BUTTONS ────────────────────────────────── */
// //         .btn-cart {
// //           display:flex; align-items:center; justify-content:center; gap:8px; width:100%;
// //           font-family:'Outfit',sans-serif; font-size:10.5px; font-weight:700;
// //           letter-spacing:.18em; text-transform:uppercase;
// //           color:var(--cream); background:var(--olive); border:none;
// //           border-radius:50px; padding:14px; cursor:pointer; margin-bottom:9px;
// //           transition: background .22s, transform .15s, box-shadow .2s;
// //           box-shadow: 0 4px 18px rgba(61,74,34,.25);
// //           opacity: 1;
// //         }
// //         .btn-cart:hover:not(:disabled) { background:var(--olive2); box-shadow:0 6px 24px rgba(61,74,34,.3); transform:translateY(-1px); }
// //         .btn-cart:active:not(:disabled) { transform:translateY(0); }
// //         .btn-cart:disabled { opacity:.45; cursor:not-allowed; }
// //         .btn-cart.done { background:var(--green) !important; }

// //         .btn-buy {
// //           display:flex; align-items:center; justify-content:center; gap:8px; width:100%;
// //           font-family:'Outfit',sans-serif; font-size:10.5px; font-weight:700;
// //           letter-spacing:.18em; text-transform:uppercase;
// //           color:var(--ink); background:var(--gold); border:none;
// //           border-radius:50px; padding:14px; cursor:pointer;
// //           transition: background .22s, transform .15s;
// //           box-shadow: 0 4px 18px rgba(201,168,76,.3);
// //         }
// //         .btn-buy:hover:not(:disabled) { background:var(--gold2); transform:translateY(-1px); }
// //         .btn-buy:disabled { opacity:.45; cursor:not-allowed; }

// //         .sum-note {
// //           font-size:9.5px; color:var(--mist); text-align:center;
// //           margin-top:11px; line-height:1.65; letter-spacing:.02em;
// //         }

// //         /* ── RESPONSIVE ──────────────────────────────────── */
// //         @media (max-width:640px) {
// //           .preset-grid { grid-template-columns: 1fr 1fr; }
// //           .cat-products { grid-template-columns: repeat(auto-fill, minmax(100px, 1fr)); }
// //         }
// //         @media (max-width:380px) {
// //           .preset-grid { grid-template-columns: 1fr; }
// //         }
// //       `}</style>

// //       <div className="cc">
// //         <UpperNav />

// //         {/* HERO */}
// //         <div className="cc-hero">
// //           <div className="cc-hero-eyebrow">Women · Jewellery · Curated Combos</div>
// //           <h1>Build Your <em>Perfect</em> Set</h1>
// //           <p className="cc-hero-sub">
// //             Choose a curated combo and swap pieces to your liking — or build something entirely your own.
// //           </p>
// //         </div>

// //         {/* MODE TOGGLE */}
// //         <div className="cc-mode">
// //           <div className="cc-toggle">
// //             <button className={`cc-toggle-btn ${mode === 'preset' ? 'on' : ''}`} onClick={() => setMode('preset')}>
// //               ◈ Curated Sets
// //             </button>
// //             <button className={`cc-toggle-btn ${mode === 'custom' ? 'on' : ''}`} onClick={() => setMode('custom')}>
// //               ✦ Build Your Own
// //             </button>
// //           </div>
// //           <p className="cc-mode-hint">
// //             {mode === 'preset'
// //               ? 'Pick a set — then swap pieces within each category'
// //               : 'Choose any categories & mix products freely'}
// //           </p>
// //         </div>

// //         {/* BODY */}
// //         <div className="cc-body">

// //           {/* LEFT */}
// //           <div>
// //             {mode === 'preset' && (
// //               <>
// //                 <p className="sec-lbl">Choose a Combo</p>
// //                 <div className="preset-grid">
// //                   {PRESET_COMBOS.map(c => (
// //                     <PresetCard key={c.id} combo={c} selected={selectedComboId === c.id} onSelect={handleComboSelect} />
// //                   ))}
// //                 </div>

// //                 <p className="sec-lbl">Customise Your Selections</p>
// //                 <div className="cust-block">
// //                   <div className="cust-block-head">
// //                     <span className="cust-block-title">{selectedCombo?.name}</span>
// //                     <span className="cust-block-sub">Swap any piece below</span>
// //                   </div>
// //                   {selectedCombo?.includedCategories.map(k => (
// //                     <CatRow
// //                       key={k} catKey={k} label={CAT_LABELS[k]}
// //                       products={PRODUCTS_BY_CATEGORY[k] || []}
// //                       selectedId={comboSelections[k]}
// //                       onSelect={handlePresetSelection}
// //                     />
// //                   ))}
// //                 </div>
// //               </>
// //             )}

// //             {mode === 'custom' && (
// //               <>
// //                 <p className="sec-lbl">Select Categories</p>
// //                 <div className="add-cats">
// //                   {ALL_CATEGORIES.map(cat => (
// //                     <button
// //                       key={cat}
// //                       className={`add-cat-btn ${customCategories.includes(cat) ? 'on' : ''}`}
// //                       onClick={() => setCustomCategories(prev =>
// //                         prev.includes(cat) ? prev.filter(c => c !== cat) : [...prev, cat]
// //                       )}
// //                     >
// //                       {customCategories.includes(cat) ? '✓' : '+'} {CAT_LABELS[cat]}
// //                     </button>
// //                   ))}
// //                 </div>

// //                 {customCategories.length > 0 && (
// //                   <>
// //                     <p className="sec-lbl">Choose Products</p>
// //                     <div className="custom-block">
// //                       {customCategories.map(k => (
// //                         <CatRowMulti
// //                           key={k} catKey={k} label={CAT_LABELS[k]}
// //                           products={PRODUCTS_BY_CATEGORY[k] || []}
// //                           selectedIds={customSelectedIds[k] || []}
// //                           onToggle={handleCustomToggle}
// //                         />
// //                       ))}
// //                     </div>
// //                   </>
// //                 )}
// //               </>
// //             )}
// //           </div>

// //           {/* RIGHT — SUMMARY */}
// //           <div>
// //             <div className="cc-summary">
// //               <div className="sum-header">
// //                 <div className="sum-title">Your Combo Summary</div>
// //                 <span className="sum-mode">
// //                   {mode === 'preset' ? '◈ Curated Set' : '✦ Custom Build'}
// //                 </span>
// //               </div>
// //               <div className="sum-body">
// //                 <div className="sum-items">
// //                   {summaryItems.length === 0
// //                     ? <p className="sum-empty">No items selected yet</p>
// //                     : summaryItems.map(({ k, p }) => (
// //                         <div key={`${k}-${p.id}`} className="sum-item">
// //                           <img className="sum-item-img" src={p.image} alt={p.name} />
// //                           <div className="sum-item-info">
// //                             <span className="sum-item-cat">{CAT_LABELS[k]}</span>
// //                             <span className="sum-item-name">{p.name}</span>
// //                           </div>
// //                           <span className="sum-item-price">₹{p.price.toLocaleString('en-IN')}</span>
// //                         </div>
// //                       ))
// //                   }
// //                 </div>

// //                 <div className="sum-divider" />

// //                 <div className="sum-total-row">
// //                   <span className="sum-total-label">Total</span>
// //                   <span className="sum-total-val">₹{totalPrice.toLocaleString('en-IN')}</span>
// //                 </div>

// //                 {savings > 0 && (
// //                   <p className="sum-savings">You save ₹{savings.toLocaleString('en-IN')} on this set 🎉</p>
// //                 )}

// //                 {/* ── ADD TO CART ── */}
// //                 <button
// //                   ref={cartBtnRef}
// //                   className={`btn-cart ${cartAdded ? 'done' : ''}`}
// //                   onClick={handleAddToCart}
// //                   disabled={!hasItems}
// //                 >
// //                   {cartAdded ? (
// //                     <>
// //                       <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><polyline points="20 6 9 17 4 12"/></svg>
// //                       Added to Cart!
// //                     </>
// //                   ) : (
// //                     <>
// //                       <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
// //                         <path d="M6 2L3 6v14a2 2 0 002 2h14a2 2 0 002-2V6l-3-4z"/>
// //                         <line x1="3" y1="6" x2="21" y2="6"/>
// //                         <path d="M16 10a4 4 0 01-8 0"/>
// //                       </svg>
// //                       Add Combo to Cart
// //                     </>
// //                   )}
// //                 </button>

// //                 {/* ── BUY NOW ── */}
// //                 <button
// //                   className="btn-buy"
// //                   onClick={handleBuyNow}
// //                   disabled={!hasItems}
// //                 >
// //                   <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
// //                     <path d="M5 12h14M12 5l7 7-7 7"/>
// //                   </svg>
// //                   Buy It Now
// //                 </button>

// //                 <p className="sum-note">Free shipping above ₹599 · COD available · Easy returns</p>
// //               </div>
// //             </div>
// //           </div>

// //         </div>
// //       </div>
// //     </>
// //   );
// // }


// 'use client';

// import { useState, useMemo, useCallback, useRef, type ChangeEvent } from 'react';
// import { useCart } from '@/lib/cartContext';
// import { fireConfetti } from '@/components/cart/ConfettiManager';
// import UpperNav from '@/components/ui/UpperNav';
// import { useRouter } from 'next/navigation';

// /* ─────────────────────────────────────────────────────────────
//    TYPES
// ───────────────────────────────────────────────────────────── */
// type CategoryKey =
//   | 'necklace' | 'earrings' | 'bracelets' | 'rings'
//   | 'gift-boxes' | 'keychains' | 'hair-accessories';

// interface ComboProduct {
//   id: number;
//   name: string;
//   price: number;
//   image: string;
//   customisable: boolean;
// }

// interface PresetCombo {
//   id: string;
//   name: string;
//   tagline: string;
//   price: number;
//   originalPrice: number;
//   image: string;
//   badge: string;
//   tint: string;
//   includedCategories: CategoryKey[];
//   defaultSelections: Partial<Record<CategoryKey, number>>;
// }

// /* ─────────────────────────────────────────────────────────────
//    DATA
// ───────────────────────────────────────────────────────────── */
// const PRODUCTS_BY_CATEGORY: Record<CategoryKey, ComboProduct[]> = {
//   necklace: [
//     { id: 1, name: 'Dainty Layered Necklace', price: 1299, image: 'https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?w=400&q=80', customisable: false },
//     { id: 2, name: 'Pearl Pendant Necklace',  price: 2499, image: 'https://images.unsplash.com/photo-1573408301185-9519f94816b5?w=400&q=80', customisable: false },
//     { id: 3, name: 'Layered Gold Chain',       price: 1599, image: 'https://images.unsplash.com/photo-1611591437281-460bfbe1220a?w=400&q=80', customisable: false },
//   ],
//   earrings: [
//     { id: 4, name: 'Gold Hoop Earrings',    price: 899,  image: 'https://images.unsplash.com/photo-1588444650733-d0f07d323dde?w=400&q=80', customisable: false },
//     { id: 5, name: 'Minimal Stud Earrings', price: 549,  image: 'https://images.unsplash.com/photo-1605100804763-247f67b3557e?w=400&q=80', customisable: false },
//     { id: 6, name: 'Korean Ear Cuffs',      price: 699,  image: 'https://images.unsplash.com/photo-1617038260897-41a1f14a8ca0?w=400&q=80', customisable: false },
//   ],
//   bracelets: [
//     { id: 7,  name: 'Beaded Charm Bracelet',  price: 749,  image: 'https://images.unsplash.com/photo-1602173574767-37ac01994b2a?w=400&q=80', customisable: false },
//     { id: 8,  name: 'Kada Bangle Set',         price: 1899, image: 'https://images.unsplash.com/photo-1612817288484-6f916006741a?w=400&q=80', customisable: false },
//     { id: 9,  name: 'Minimal Chain Bracelet',  price: 999,  image: 'https://images.unsplash.com/photo-1612817288484-6f916006741a?w=400&q=80', customisable: false },
//   ],
//   rings: [
//     { id: 10, name: 'Diamond Ring',      price: 2999, image: 'https://images.unsplash.com/photo-1605100804763-247f67b3557e?w=400&q=80', customisable: false },
//     { id: 11, name: 'Minimal Gold Ring', price: 999,  image: 'https://images.unsplash.com/photo-1605100804763-247f67b3557e?w=400&q=80', customisable: false },
//     { id: 12, name: 'Couple Rings Set',  price: 1999, image: 'https://images.unsplash.com/photo-1588444650733-d0f07d323dde?w=400&q=80', customisable: false },
//   ],
//   'gift-boxes': [
//     { id: 16, name: 'Luxury Gift Box',   price: 2499, image: 'https://images.unsplash.com/photo-1549465220-1a8b9238cd48?w=400&q=80', customisable: true },
//     { id: 17, name: 'Birthday Gift Box', price: 1999, image: 'https://images.unsplash.com/photo-1549465220-1a8b9238cd48?w=400&q=80', customisable: true },
//   ],
//   keychains: [
//     { id: 18, name: 'Personalised Keychain', price: 399, image: 'https://images.unsplash.com/photo-1582143570735-ebf7c44a5c54?w=400&q=80', customisable: true },
//     { id: 19, name: 'Metal Charm Keychain',  price: 499, image: 'https://images.unsplash.com/photo-1582143570735-ebf7c44a5c54?w=400&q=80', customisable: true },
//   ],
//   'hair-accessories': [
//     { id: 13, name: 'Elegant Hair Clip', price: 499, image: 'https://images.unsplash.com/photo-1591206422576-7e00ff5f7db7?w=400&q=80', customisable: false },
//     { id: 14, name: 'Pearl Hair Band',   price: 799, image: 'https://images.unsplash.com/photo-1591206422576-7e00ff5f7db7?w=400&q=80', customisable: false },
//     { id: 15, name: 'Floral Hair Pins',  price: 599, image: 'https://images.unsplash.com/photo-1591206422576-7e00ff5f7db7?w=400&q=80', customisable: false },
//   ],
// };

// const PRESET_COMBOS: PresetCombo[] = [
//   {
//     id: 'festive',
//     name: 'Festive Glow',
//     tagline: 'Celebrate every moment',
//     price: 2999, originalPrice: 4500,
//     image: 'https://images.unsplash.com/photo-1602173574767-37ac01994b2a?w=800&q=90',
//     badge: 'Most Loved', tint: '#c8a84b',
//     includedCategories: ['necklace', 'earrings', 'bracelets'],
//     defaultSelections: { necklace: 1, earrings: 4, bracelets: 7 },
//   },
//   {
//     id: 'bridal',
//     name: 'Bridal Radiance',
//     tagline: 'For your most beautiful day',
//     price: 5999, originalPrice: 8800,
//     image: 'https://images.unsplash.com/photo-1573408301185-9519f94816b5?w=800&q=90',
//     badge: 'Premium', tint: '#b07d62',
//     includedCategories: ['necklace', 'earrings', 'rings', 'bracelets'],
//     defaultSelections: { necklace: 2, earrings: 4, rings: 10, bracelets: 8 },
//   },
//   {
//     id: 'minimal',
//     name: 'Minimal Edit',
//     tagline: 'Less is more, always',
//     price: 1999, originalPrice: 2800,
//     image: 'https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?w=800&q=90',
//     badge: 'New', tint: '#6b7c45',
//     includedCategories: ['necklace', 'earrings'],
//     defaultSelections: { necklace: 1, earrings: 5 },
//   },
//   {
//     id: 'gifting',
//     name: 'Gifting Special',
//     tagline: 'Curated with love',
//     price: 3499, originalPrice: 5200,
//     image: 'https://images.unsplash.com/photo-1549465220-1a8b9238cd48?w=800&q=90',
//     badge: 'Gift Ready', tint: '#8a6fa8',
//     includedCategories: ['necklace', 'earrings', 'bracelets', 'gift-boxes'],
//     defaultSelections: { necklace: 3, earrings: 6, bracelets: 9, 'gift-boxes': 16 },
//   },
// ];

// const CATEGORY_LABELS: Record<CategoryKey, string> = {
//   necklace: 'Necklace', earrings: 'Earrings', bracelets: 'Bracelet',
//   rings: 'Ring', 'gift-boxes': 'Gift Box', keychains: 'Keychain',
//   'hair-accessories': 'Hair Accessory',
// };

// const ALL_CATEGORIES = Object.keys(PRODUCTS_BY_CATEGORY) as CategoryKey[];

// /* ─────────────────────────────────────────────────────────────
//    HELPER: build cart-compatible item from a combo
// ───────────────────────────────────────────────────────────── */
// function buildCartItem(
//   comboId: string,
//   comboName: string,
//   price: number,
//   originalPrice: number | null,
//   image: string,
// ) {
//   return {
//     id: `combo-${comboId}-${Date.now()}`,
//     name: comboName,
//     price,
//     originalPrice,
//     image,
//     color: 'Mixed',
//     colorHex: '#c9a84c',
//     sku: `COMBO-${comboId.toUpperCase()}`,
//     href: `/combos/${comboId}`,
//   };
// }

// /* ─────────────────────────────────────────────────────────────
//    PERSONALISE PANEL  (from file 1 UI)
// ───────────────────────────────────────────────────────────── */
// function PersonalisePanel({ productName }: { productName: string }) {
//   const [text, setText] = useState('');
//   const [preview, setPreview] = useState<string | null>(null);

//   const handleFile = (e: ChangeEvent<HTMLInputElement>) => {
//     const f = e.currentTarget.files?.[0];
//     if (!f) return;
//     const r = new FileReader();
//     r.onload = ev => setPreview((ev.target?.result as string) ?? null);
//     r.readAsDataURL(f);
//   };

//   return (
//     <div className="pers-panel">
//       <p className="pers-label">✦ Personalise · {productName}</p>
//       <input
//         className="pers-input"
//         placeholder="Add a name or message…"
//         value={text}
//         onChange={e => setText(e.target.value)}
//         maxLength={80}
//       />
//       <label className="pers-upload">
//         <input type="file" accept="image/*" style={{ display: 'none' }} onChange={handleFile} />
//         {preview
//           ? <img src={preview} alt="preview" style={{ width: 26, height: 26, objectFit: 'cover', borderRadius: 5 }} />
//           : <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><rect x="3" y="3" width="18" height="18" rx="3" /><circle cx="8.5" cy="8.5" r="1.5" /><polyline points="21 15 16 10 5 21" /></svg>
//         }
//         <span>{preview ? 'Change photo' : 'Upload photo'}</span>
//       </label>
//     </div>
//   );
// }

// /* ─────────────────────────────────────────────────────────────
//    PRODUCT CARD  (file 1 UI)
// ───────────────────────────────────────────────────────────── */
// function ProdCard({ product, selected, onToggle }: {
//   product: ComboProduct; selected: boolean; onToggle: () => void;
// }) {
//   return (
//     <button className={`pcard${selected ? ' on' : ''}`} onClick={onToggle}>
//       <div className="pcard-img">
//         <img src={product.image} alt={product.name} />
//         {selected && (
//           <span className="pcard-tick">
//             <svg width="9" height="9" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="3.5"><polyline points="20 6 9 17 4 12" /></svg>
//           </span>
//         )}
//       </div>
//       <div className="pcard-foot">
//         <span className="pcard-name">{product.name}</span>
//         <span className="pcard-price">₹{product.price.toLocaleString('en-IN')}</span>
//       </div>
//     </button>
//   );
// }

// /* ─────────────────────────────────────────────────────────────
//    ACCORDION — single-select  (file 1 UI, file 2 logic)
// ───────────────────────────────────────────────────────────── */
// function Accordion({ catKey, products, selectedId, onSelect }: {
//   catKey: CategoryKey; products: ComboProduct[];
//   selectedId?: number; onSelect: (k: CategoryKey, id: number) => void;
// }) {
//   const [open, setOpen] = useState(false);
//   const sel = products.find(p => p.id === selectedId);

//   return (
//     <div className="acc">
//       <button className="acc-head" onClick={() => setOpen(o => !o)}>
//         <span className="acc-cat">{CATEGORY_LABELS[catKey]}</span>
//         <span className={`acc-info${!sel ? ' dim' : ''}`}>
//           {sel ? <>{sel.name} · <strong>₹{sel.price.toLocaleString('en-IN')}</strong></> : 'Select one'}
//         </span>
//         <svg className={`acc-chevron${open ? ' open' : ''}`} width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2"><polyline points="6 9 12 15 18 9" /></svg>
//       </button>
//       {open && (
//         <div className="acc-body">
//           <div className="pgrid">
//             {products.map(p => (
//               <ProdCard key={p.id} product={p} selected={p.id === selectedId} onToggle={() => onSelect(catKey, p.id)} />
//             ))}
//           </div>
//           {sel?.customisable && <PersonalisePanel productName={sel.name} />}
//         </div>
//       )}
//     </div>
//   );
// }

// /* ─────────────────────────────────────────────────────────────
//    ACCORDION — multi-select  (file 1 UI, file 2 logic)
// ───────────────────────────────────────────────────────────── */
// function AccordionMulti({ catKey, products, selectedIds, onToggle }: {
//   catKey: CategoryKey; products: ComboProduct[];
//   selectedIds: number[]; onToggle: (k: CategoryKey, id: number) => void;
// }) {
//   const [open, setOpen] = useState(false);
//   const count = selectedIds.length;
//   const anyCustom = selectedIds.some(id => products.find(p => p.id === id)?.customisable);

//   return (
//     <div className="acc">
//       <button className="acc-head" onClick={() => setOpen(o => !o)}>
//         <span className="acc-cat">{CATEGORY_LABELS[catKey]}</span>
//         <span className={`acc-info${count === 0 ? ' dim' : ''}`}>
//           {count > 0 ? `${count} selected` : 'Select any'}
//         </span>
//         <svg className={`acc-chevron${open ? ' open' : ''}`} width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2"><polyline points="6 9 12 15 18 9" /></svg>
//       </button>
//       {open && (
//         <div className="acc-body">
//           <div className="pgrid">
//             {products.map(p => (
//               <ProdCard key={p.id} product={p} selected={selectedIds.includes(p.id)} onToggle={() => onToggle(catKey, p.id)} />
//             ))}
//           </div>
//           {anyCustom && <PersonalisePanel productName={CATEGORY_LABELS[catKey]} />}
//         </div>
//       )}
//     </div>
//   );
// }

// /* ─────────────────────────────────────────────────────────────
//    COMBO CARD  (file 1 UI, slightly smaller)
// ───────────────────────────────────────────────────────────── */
// function ComboCard({ combo, selected, onSelect }: {
//   combo: PresetCombo; selected: boolean; onSelect: (id: string) => void;
// }) {
//   const pct = Math.round(((combo.originalPrice - combo.price) / combo.originalPrice) * 100);
//   return (
//     <button
//       className={`ccard${selected ? ' sel' : ''}`}
//       onClick={() => onSelect(combo.id)}
//       style={{ '--t': combo.tint } as React.CSSProperties}
//     >
//       <div className="ccard-img">
//         <img src={combo.image} alt={combo.name} />
//         <div className="ccard-grad" />
//         <span className="ccard-badge">{combo.badge}</span>
//         <span className="ccard-disc">{pct}% off</span>
//         {selected && <div className="ccard-ring" />}
//         <div className="ccard-overlay-text">
//           <span className="ccard-name">{combo.name}</span>
//           <span className="ccard-tagline">{combo.tagline}</span>
//         </div>
//       </div>
//       <div className="ccard-bar" />
//       <div className="ccard-foot">
//         <div className="ccard-price-row">
//           <span className="ccard-price">₹{combo.price.toLocaleString('en-IN')}</span>
//           <span className="ccard-was">₹{combo.originalPrice.toLocaleString('en-IN')}</span>
//         </div>
//         <div className="ccard-chips">
//           {combo.includedCategories.map(c => (
//             <span key={c} className="ccard-chip">{CATEGORY_LABELS[c]}</span>
//           ))}
//         </div>
//       </div>
//     </button>
//   );
// }

// /* ─────────────────────────────────────────────────────────────
//    MAIN PAGE
// ───────────────────────────────────────────────────────────── */
// export default function CuratedCombosPage() {
//   const { addItem } = useCart();
//   const router = useRouter();
//   const cartBtnRef = useRef<HTMLButtonElement | null>(null);

//   const [mode, setMode] = useState<'preset' | 'custom'>('preset');
//   const [selectedComboId, setSelectedComboId] = useState('festive');
//   const [comboSelections, setComboSelections] = useState<Partial<Record<CategoryKey, number>>>(() => {
//     const c = PRESET_COMBOS.find(c => c.id === 'festive');
//     return c ? { ...c.defaultSelections } : {};
//   });
//   const [customSelectedIds, setCustomSelectedIds] = useState<Partial<Record<CategoryKey, number[]>>>({});
//   const [customCategories, setCustomCategories] = useState<CategoryKey[]>(['necklace', 'earrings']);
//   const [cartAdded, setCartAdded] = useState(false);

//   const selectedCombo = PRESET_COMBOS.find(c => c.id === selectedComboId);

//   const handleComboSelect = useCallback((id: string) => {
//     setSelectedComboId(id);
//     const c = PRESET_COMBOS.find(c => c.id === id);
//     if (c) setComboSelections({ ...c.defaultSelections });
//   }, []);

//   const handlePresetSelection = useCallback((k: CategoryKey, id: number) => {
//     setComboSelections(prev => ({ ...prev, [k]: id }));
//   }, []);

//   const handleCustomToggle = useCallback((k: CategoryKey, id: number) => {
//     setCustomSelectedIds(prev => {
//       const cur = prev[k] || [];
//       return { ...prev, [k]: cur.includes(id) ? cur.filter(x => x !== id) : [...cur, id] };
//     });
//   }, []);

//   /* ── Derived values ── */
//   const customTotal = useMemo(() => {
//     return customCategories.reduce((sum, cat) => {
//       return sum + (customSelectedIds[cat] || []).reduce((s, id) => {
//         const p = PRODUCTS_BY_CATEGORY[cat]?.find(p => p.id === id);
//         return s + (p?.price || 0);
//       }, 0);
//     }, 0);
//   }, [customSelectedIds, customCategories]);

//   const presetTotal = selectedCombo?.price || 0;
//   const totalPrice = mode === 'preset' ? presetTotal : customTotal;
//   const totalOriginal = mode === 'preset' ? (selectedCombo?.originalPrice || presetTotal) : customTotal;
//   const savings = totalOriginal - totalPrice;

//   const presetSummaryItems = useMemo(() => {
//     if (!selectedCombo) return [];
//     return selectedCombo.includedCategories.flatMap(k => {
//       const id = comboSelections[k];
//       const p = PRODUCTS_BY_CATEGORY[k]?.find(p => p.id === id);
//       return p ? [{ k, p }] : [];
//     });
//   }, [selectedCombo, comboSelections]);

//   const customSummaryItems = useMemo(() => {
//     return customCategories.flatMap(k =>
//       (customSelectedIds[k] || []).flatMap(id => {
//         const p = PRODUCTS_BY_CATEGORY[k]?.find(p => p.id === id);
//         return p ? [{ k, p }] : [];
//       })
//     );
//   }, [customSelectedIds, customCategories]);

//   const summaryItems = mode === 'preset'
//     ? presetSummaryItems.map(i => ({ k: i.k, p: i.p }))
//     : customSummaryItems;
//   const hasItems = summaryItems.length > 0;

//   /* ── Cart actions ── */
//   function handleAddToCart() {
//     if (!hasItems) return;
//     if (mode === 'preset' && selectedCombo) {
//       addItem(buildCartItem(
//         selectedCombo.id, selectedCombo.name,
//         selectedCombo.price, selectedCombo.originalPrice, selectedCombo.image,
//       ));
//     } else {
//       customSummaryItems.forEach(({ k, p }) => {
//         addItem({
//           id: `${k}-${p.id}`, name: p.name, price: p.price,
//           originalPrice: null, image: p.image, color: CATEGORY_LABELS[k],
//           colorHex: '#c9a84c', sku: `PROD-${p.id}`, href: `/products/${p.id}`,
//         });
//       });
//     }
//     fireConfetti(cartBtnRef.current);
//     setCartAdded(true);
//     setTimeout(() => setCartAdded(false), 1800);
//   }

//   function handleBuyNow() {
//     if (!hasItems) return;
//     handleAddToCart();
//     setTimeout(() => router.push('/checkout'), 150);
//   }

//   /* ─────────────────────────────────────────────────────────────
//      RENDER
//   ───────────────────────────────────────────────────────────── */
//   return (
//     <>
//       <style>{`
//         @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,400;0,500;0,600;1,400;1,500&family=Outfit:wght@300;400;500;600&display=swap');

//         :root {
//           --bg:       #f7f4ee;
//           --surf:     #ffffff;
//           --bdr:      #e4ddd0;
//           --bdr2:     #cfc7b6;
//           --olive:    #49581f;
//           --olive2:   #68773e;
//           --olivedim: #edf0e2;
//           --gold:     #c7a748;
//           --gold2:    #eedfa0;
//           --ink:      #1b1f0e;
//           --ink6:     rgba(27,31,14,.6);
//           --ink3:     rgba(27,31,14,.32);
//           --green:    #2d6e30;
//           --ffd:      'Playfair Display', Georgia, serif;
//           --ffb:      'Outfit', sans-serif;
//           --card-r:   18px;
//         }
//         *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
//         button { font-family: var(--ffb); cursor: pointer; }
//         img { display: block; }

//         /* ── PAGE ── */
//         .page {
//           min-height: 100dvh;
//           background: var(--bg);
//           font-family: var(--ffb);
//           color: var(--ink);
//         }

//         /* ── HERO ── */
//         .hero {
//           padding: 52px 60px 44px;
//           background: linear-gradient(160deg, #f7f4ee 0%, #f0e9da 55%, #f7f4ee 100%);
//           border-bottom: 1px solid var(--bdr);
//           position: relative; overflow: hidden;
//           animation: up .55s ease both;
//         }
//         .hero::before {
//           content: ''; position: absolute; right: -60px; top: -60px;
//           width: 380px; height: 380px; border-radius: 50%;
//           background: radial-gradient(circle, rgba(199,167,72,.12) 0%, transparent 68%);
//           pointer-events: none;
//         }
//         .hero-tag {
//           display: flex; align-items: center; gap: 10px;
//           font-size: 9.5px; letter-spacing: .44em; text-transform: uppercase;
//           color: var(--gold); font-weight: 500; margin-bottom: 18px;
//         }
//         .hero-tag-line { width: 30px; height: 1px; background: var(--gold); opacity: .5; }
//         .hero h1 {
//           font-family: var(--ffd);
//           font-size: clamp(2.2rem, 4.5vw, 3.8rem);
//           font-weight: 500; color: var(--olive);
//           line-height: 1.08; letter-spacing: -.022em;
//           margin-bottom: 14px;
//         }
//         .hero h1 em { font-style: italic; color: var(--gold); }
//         .hero p { font-size: 14px; font-weight: 300; color: var(--ink6); max-width: 460px; line-height: 1.85; }

//         /* ── MODE BAR ── */
//         .modebar {
//           padding: 30px 60px 0;
//           display: flex; align-items: flex-start; gap: 20px; flex-wrap: wrap;
//           animation: up .55s ease .07s both;
//         }
//         .modetoggle {
//           display: flex; background: var(--surf);
//           border: 1.5px solid var(--bdr2); border-radius: 50px;
//           padding: 5px; gap: 4px;
//           box-shadow: 0 2px 10px rgba(27,31,14,.1); flex-shrink: 0;
//         }
//         .modebtn {
//           font-size: 10.5px; font-weight: 600; letter-spacing: .13em; text-transform: uppercase;
//           padding: 11px 26px; border-radius: 50px; border: none; background: transparent;
//           color: var(--ink6); transition: all .25s;
//         }
//         .modebtn.on {
//           background: var(--olive); color: #fff;
//           box-shadow: 0 3px 14px rgba(73,88,31,.35);
//         }
//         .modehint {
//           font-size: 12.5px; font-weight: 300; color: var(--ink6);
//           line-height: 1.75; max-width: 480px; padding-top: 14px;
//         }

//         /* ── LAYOUT ── */
//         .layout {
//           display: grid;
//           grid-template-columns: 1fr 356px;
//           gap: 24px;
//           padding: 30px 60px 80px;
//           align-items: start;
//           animation: up .55s ease .13s both;
//         }

//         /* ── SECTION LABEL ── */
//         .slbl {
//           font-size: 9px; letter-spacing: .42em; text-transform: uppercase;
//           color: var(--ink3); font-weight: 500; margin-bottom: 16px;
//           display: flex; align-items: center; gap: 10px;
//         }
//         .slbl::after { content: ''; flex: 1; height: 1px; background: var(--bdr); }

//         /* ══════════════════════════════════════
//            COMBO CARDS — file 1 UI, slightly smaller
//         ══════════════════════════════════════ */
//         .cgrid {
//           display: grid;
//           grid-template-columns: repeat(2, 1fr);
//           gap: 13px;
//           margin-bottom: 36px;
//         }

//         .ccard {
//           position: relative; padding: 0; border: none;
//           background: var(--surf); border-radius: var(--card-r);
//           overflow: hidden; text-align: left;
//           box-shadow: 0 2px 14px rgba(27,31,14,.10);
//           transition: transform .22s cubic-bezier(.34,1.3,.64,1), box-shadow .22s;
//           outline: none;
//         }
//         .ccard:hover {
//           transform: translateY(-5px) scale(1.015);
//           box-shadow: 0 18px 50px rgba(27,31,14,.17);
//         }
//         .ccard.sel {
//           box-shadow: 0 0 0 2.5px var(--t, var(--gold)), 0 12px 36px rgba(27,31,14,.18);
//         }

//         /* image — slightly reduced aspect ratio for smaller card feel */
//         .ccard-img { position: relative; aspect-ratio: 4 / 2.8; overflow: hidden; }
//         .ccard-img img {
//           width: 100%; height: 100%; object-fit: cover;
//           transition: transform .5s ease;
//         }
//         .ccard:hover .ccard-img img { transform: scale(1.09); }
//         .ccard-grad {
//           position: absolute; inset: 0;
//           background: linear-gradient(to bottom, rgba(0,0,0,.04) 0%, rgba(0,0,0,.62) 100%);
//         }
//         .ccard-badge {
//           position: absolute; top: 8px; left: 8px;
//           background: rgba(255,255,255,.9);
//           color: var(--ink); font-size: 7.5px; font-weight: 700;
//           letter-spacing: .15em; text-transform: uppercase;
//           padding: 3px 8px; border-radius: 50px;
//           backdrop-filter: blur(4px);
//         }
//         .ccard-disc {
//           position: absolute; top: 8px; right: 8px;
//           background: var(--t, var(--gold)); color: #fff;
//           font-size: 8px; font-weight: 700;
//           padding: 3px 8px; border-radius: 50px;
//         }
//         .ccard-ring {
//           position: absolute; inset: 0;
//           border: 2.5px solid var(--t, var(--gold));
//           border-radius: calc(var(--card-r) - 1px);
//           pointer-events: none;
//         }
//         .ccard-overlay-text {
//           position: absolute; bottom: 0; left: 0; right: 0;
//           padding: 10px 12px;
//           display: flex; flex-direction: column; gap: 1px;
//         }
//         .ccard-name {
//           font-family: var(--ffd); font-size: 1rem; font-weight: 500;
//           color: #fff; line-height: 1.15;
//           text-shadow: 0 1px 5px rgba(0,0,0,.35);
//         }
//         .ccard-tagline { font-size: 9px; color: rgba(255,255,255,.68); letter-spacing: .05em; }

//         /* tint bar */
//         .ccard-bar { height: 3px; background: var(--t, var(--gold)); }

//         /* footer — tighter */
//         .ccard-foot { padding: 9px 12px 12px; }
//         .ccard-price-row {
//           display: flex; align-items: baseline; gap: 7px; margin-bottom: 7px;
//         }
//         .ccard-price {
//           font-family: var(--ffd); font-size: 1.1rem; font-weight: 600; color: var(--ink);
//         }
//         .ccard-was { font-size: 10.5px; color: var(--ink3); text-decoration: line-through; }
//         .ccard-chips { display: flex; flex-wrap: wrap; gap: 3px; }
//         .ccard-chip {
//           font-size: 7px; font-weight: 500; letter-spacing: .1em; text-transform: uppercase;
//           color: var(--ink6); border: 1px solid var(--bdr);
//           padding: 2px 6px; border-radius: 50px;
//           transition: border-color .18s, color .18s;
//         }
//         .ccard.sel .ccard-chip {
//           border-color: color-mix(in srgb, var(--t, var(--gold)) 40%, transparent);
//           color: var(--olive);
//         }

//         /* ── CUSTOMISE BLOCK ── */
//         .custblock {
//           background: var(--surf); border: 1.5px solid var(--bdr);
//           border-radius: var(--card-r); overflow: hidden;
//           box-shadow: 0 2px 12px rgba(27,31,14,.09);
//         }
//         .custhead {
//           padding: 15px 22px; border-bottom: 1px solid var(--bdr);
//           background: linear-gradient(135deg, var(--olivedim), #f3ede0);
//           display: flex; align-items: center; justify-content: space-between;
//         }
//         .custtitle { font-family: var(--ffd); font-size: 1rem; font-weight: 500; color: var(--olive); }
//         .custsub { font-size: 10px; color: var(--ink6); letter-spacing: .04em; }

//         /* ── ACCORDION ── */
//         .acc { border-bottom: 1px solid var(--bdr); }
//         .acc:last-child { border-bottom: none; }
//         .acc-head {
//           width: 100%; display: flex; align-items: center; gap: 12px;
//           padding: 13px 22px; background: transparent; border: none; text-align: left;
//           transition: background .15s;
//         }
//         .acc-head:hover { background: var(--olivedim); }
//         .acc-cat {
//           font-size: 10.5px; font-weight: 600; letter-spacing: .1em; text-transform: uppercase;
//           color: var(--olive); flex-shrink: 0; width: 108px;
//         }
//         .acc-info { flex: 1; font-size: 11px; color: var(--ink6); white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
//         .acc-info.dim { color: var(--ink3); font-style: italic; }
//         .acc-info strong { color: var(--ink); font-weight: 600; }
//         .acc-chevron { color: var(--ink3); transition: transform .22s; flex-shrink: 0; }
//         .acc-chevron.open { transform: rotate(180deg); }
//         .acc-body { padding: 8px 22px 18px; }

//         /* ── PRODUCT GRID ── */
//         .pgrid {
//           display: grid;
//           grid-template-columns: repeat(auto-fill, minmax(118px, 1fr));
//           gap: 10px; margin-bottom: 10px;
//         }
//         .pcard {
//           background: #fff; border: 1.5px solid var(--bdr);
//           border-radius: 12px; overflow: hidden; padding: 0; text-align: left;
//           transition: border-color .18s, box-shadow .18s, transform .18s;
//         }
//         .pcard:hover {
//           border-color: var(--olive2);
//           box-shadow: 0 4px 14px rgba(27,31,14,.12);
//           transform: translateY(-2px);
//         }
//         .pcard.on { border-color: var(--gold); box-shadow: 0 0 0 2px rgba(199,167,72,.22); }
//         .pcard-img { position: relative; aspect-ratio: 1; overflow: hidden; }
//         .pcard-img img { width: 100%; height: 100%; object-fit: cover; transition: transform .35s; }
//         .pcard:hover .pcard-img img { transform: scale(1.1); }
//         .pcard-tick {
//           position: absolute; top: 6px; right: 6px;
//           width: 20px; height: 20px; border-radius: 50%;
//           background: var(--gold); display: flex; align-items: center; justify-content: center;
//           box-shadow: 0 2px 6px rgba(199,167,72,.5);
//         }
//         .pcard-foot { padding: 7px 9px 9px; }
//         .pcard-name { display: block; font-size: 10px; font-weight: 500; color: var(--ink); line-height: 1.35; margin-bottom: 2px; }
//         .pcard-price { display: block; font-size: 10.5px; font-weight: 600; color: var(--olive); }

//         /* ── PERSONALISE ── */
//         .pers-panel {
//           background: linear-gradient(135deg, rgba(199,167,72,.07), rgba(73,88,31,.04));
//           border: 1px solid rgba(199,167,72,.2);
//           border-radius: 10px; padding: 12px 14px; margin-top: 4px;
//         }
//         .pers-label {
//           font-size: 9px; font-weight: 700; letter-spacing: .14em; text-transform: uppercase;
//           color: #896018; margin-bottom: 8px;
//         }
//         .pers-input {
//           width: 100%; border: 1.5px solid var(--bdr2); border-radius: 7px;
//           padding: 8px 11px; font-family: var(--ffb); font-size: 11.5px;
//           color: var(--ink); background: #fff; outline: none;
//           margin-bottom: 7px; transition: border-color .2s;
//         }
//         .pers-input:focus { border-color: var(--olive2); }
//         .pers-input::placeholder { color: var(--ink3); }
//         .pers-upload {
//           display: inline-flex; align-items: center; gap: 6px;
//           font-size: 9.5px; font-weight: 600; letter-spacing: .1em; text-transform: uppercase;
//           color: var(--olive); border: 1.5px dashed var(--bdr2);
//           border-radius: 7px; padding: 6px 12px; cursor: pointer; background: #fff;
//           transition: border-color .2s, background .2s;
//         }
//         .pers-upload:hover { border-color: var(--olive2); background: var(--olivedim); }

//         /* ── CATEGORY PILLS (custom mode) ── */
//         .catpills { display: flex; flex-wrap: wrap; gap: 8px; margin-bottom: 24px; }
//         .catpill {
//           font-size: 10px; font-weight: 500; letter-spacing: .1em; text-transform: uppercase;
//           color: var(--ink6); padding: 8px 16px;
//           border: 1.5px solid var(--bdr2); border-radius: 50px;
//           background: transparent; transition: all .2s;
//         }
//         .catpill:hover { color: var(--olive); border-color: var(--olive2); background: var(--olivedim); }
//         .catpill.on { background: var(--olive); color: #fff; border-color: var(--olive); }
//         .customblock {
//           background: var(--surf); border: 1.5px solid var(--bdr);
//           border-radius: var(--card-r); overflow: hidden;
//           box-shadow: 0 2px 12px rgba(27,31,14,.09);
//         }

//         /* ══════════════════════
//            SUMMARY PANEL
//         ══════════════════════ */
//         .summary {
//           position: sticky; top: 80px;
//           background: var(--surf); border: 1.5px solid var(--bdr);
//           border-radius: var(--card-r); overflow: hidden;
//           box-shadow: 0 6px 28px rgba(27,31,14,.12);
//         }
//         .sum-head {
//           padding: 20px 22px 16px;
//           background: linear-gradient(135deg, var(--olivedim), #f0e8d8);
//           border-bottom: 1px solid var(--bdr);
//           position: relative; overflow: hidden;
//         }
//         .sum-head::after {
//           content: '◈'; position: absolute; right: 18px; top: 50%;
//           transform: translateY(-50%); font-size: 38px;
//           color: rgba(199,167,72,.12); pointer-events: none; line-height: 1;
//         }
//         .sum-title { font-family: var(--ffd); font-size: 1.1rem; font-weight: 500; color: var(--olive); }
//         .sum-modetag {
//           display: block; font-size: 8.5px; font-weight: 700;
//           letter-spacing: .22em; text-transform: uppercase; color: var(--gold); margin-top: 3px;
//         }
//         .sum-body { padding: 16px 22px 20px; }
//         .sum-list { margin-bottom: 14px; }
//         .sum-row {
//           display: flex; align-items: center; gap: 10px;
//           padding: 8px 0; border-bottom: 1px solid rgba(27,31,14,.06);
//         }
//         .sum-row:last-child { border-bottom: none; }
//         .sum-thumb {
//           width: 40px; height: 40px; border-radius: 9px; object-fit: cover;
//           border: 1.5px solid var(--bdr); flex-shrink: 0;
//         }
//         .sum-info { flex: 1; min-width: 0; }
//         .sum-cat { font-size: 7.5px; letter-spacing: .15em; text-transform: uppercase; color: var(--ink3); display: block; }
//         .sum-name { font-size: 11px; font-weight: 500; color: var(--ink); display: block; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
//         .sum-price { font-size: 11px; font-weight: 600; color: var(--olive); flex-shrink: 0; }
//         .sum-check {
//           width: 22px; height: 22px; border-radius: 50%;
//           background: var(--olivedim); display: flex; align-items: center; justify-content: center;
//           font-size: 10px; color: var(--olive); flex-shrink: 0;
//         }
//         .sum-empty {
//           text-align: center; font-family: var(--ffd); font-style: italic;
//           font-size: 12.5px; color: var(--ink3); padding: 20px 0;
//         }
//         .sum-divider {
//           height: 1px; margin: 12px 0;
//           background: linear-gradient(90deg, transparent, var(--gold2), transparent);
//         }
//         .sum-total-row { display: flex; justify-content: space-between; align-items: baseline; margin-bottom: 4px; }
//         .sum-total-lbl { font-size: 9px; font-weight: 600; letter-spacing: .15em; text-transform: uppercase; color: var(--ink6); }
//         .sum-total-val { font-family: var(--ffd); font-size: 1.7rem; font-weight: 600; color: var(--ink); }
//         .sum-saving { font-size: 11.5px; font-weight: 500; color: var(--green); margin-bottom: 16px; }

//         /* ── BUTTONS ── */
//         .btn-cart {
//           width: 100%; display: flex; align-items: center; justify-content: center; gap: 8px;
//           font-size: 10.5px; font-weight: 700; letter-spacing: .16em; text-transform: uppercase;
//           color: #fff; background: var(--olive); border: none;
//           border-radius: 50px; padding: 15px; margin-bottom: 10px;
//           box-shadow: 0 4px 14px rgba(73,88,31,.32);
//           transition: background .2s, transform .15s, box-shadow .2s;
//         }
//         .btn-cart:hover:not(:disabled) { background: #384a14; transform: translateY(-1px); box-shadow: 0 6px 22px rgba(73,88,31,.4); }
//         .btn-cart:disabled { opacity: .45; cursor: not-allowed; }
//         .btn-cart.done { background: var(--green) !important; }

//         .btn-buy {
//           width: 100%; display: flex; align-items: center; justify-content: center; gap: 8px;
//           font-size: 10.5px; font-weight: 700; letter-spacing: .16em; text-transform: uppercase;
//           color: var(--ink); background: var(--gold2);
//           border: 1.5px solid var(--gold); border-radius: 50px; padding: 14px;
//           transition: all .2s;
//         }
//         .btn-buy:hover:not(:disabled) { background: var(--gold); color: #fff; transform: translateY(-1px); }
//         .btn-buy:disabled { opacity: .45; cursor: not-allowed; }

//         .perks { display: flex; justify-content: center; gap: 14px; margin-top: 14px; flex-wrap: wrap; }
//         .perk { font-size: 9px; color: var(--ink3); display: flex; align-items: center; gap: 4px; }
//         .perk-dot { width: 3px; height: 3px; border-radius: 50%; background: var(--gold); opacity: .65; }

//         /* ── ANIMATIONS ── */
//         @keyframes up {
//           from { opacity: 0; transform: translateY(18px); }
//           to   { opacity: 1; transform: translateY(0); }
//         }

//         /* ── RESPONSIVE ── */
//         @media (max-width: 1024px) {
//           .layout { grid-template-columns: 1fr; }
//           .summary { position: static; }
//           .hero, .modebar, .layout { padding-left: 32px; padding-right: 32px; }
//         }
//         @media (max-width: 680px) {
//           .hero, .modebar, .layout { padding-left: 18px; padding-right: 18px; }
//           .hero { padding-top: 30px; padding-bottom: 26px; }
//           .cgrid { grid-template-columns: 1fr 1fr; gap: 10px; }
//           .modebtn { padding: 9px 16px; font-size: 10px; }
//           .acc-cat { width: 88px; }
//           .layout { padding-bottom: 52px; }
//         }
//         @media (max-width: 400px) {
//           .cgrid { grid-template-columns: 1fr; }
//         }
//       `}</style>

//       <div className="page">
//         <UpperNav />

//         {/* ── HERO ── */}
//         <div className="hero">
//           <div className="hero-tag">
//             <span className="hero-tag-line" />
//             Jewellery · Curated Combos
//           </div>
//           <h1>Build Your <em>Perfect</em><br />Jewellery Set</h1>
//           <p>Choose a curated combo and swap pieces to your liking — or build something entirely your own.</p>
//         </div>

//         {/* ── MODE BAR ── */}
//         <div className="modebar">
//           <div className="modetoggle">
//             <button className={`modebtn${mode === 'preset' ? ' on' : ''}`} onClick={() => setMode('preset')}>
//               ◈ Curated Sets
//             </button>
//             <button className={`modebtn${mode === 'custom' ? ' on' : ''}`} onClick={() => setMode('custom')}>
//               ✦ Build Your Own
//             </button>
//           </div>
//           <p className="modehint">
//             {mode === 'preset'
//               ? 'Pick a pre-curated combo at a bundled price, then swap individual pieces within each category to match your taste.'
//               : 'Choose categories freely and pick as many products as you like. Price updates live as you build.'}
//           </p>
//         </div>

//         {/* ── CONTENT ── */}
//         <div className="layout">

//           {/* LEFT */}
//           <div>
//             {mode === 'preset' && (
//               <>
//                 <p className="slbl">Choose a Combo Set</p>
//                 <div className="cgrid">
//                   {PRESET_COMBOS.map(c => (
//                     <ComboCard
//                       key={c.id}
//                       combo={c}
//                       selected={selectedComboId === c.id}
//                       onSelect={handleComboSelect}
//                     />
//                   ))}
//                 </div>

//                 <p className="slbl">Swap Pieces in Your Set</p>
//                 <div className="custblock">
//                   <div className="custhead">
//                     <span className="custtitle">{selectedCombo?.name}</span>
//                     <span className="custsub">Expand a category to swap</span>
//                   </div>
//                   {selectedCombo?.includedCategories.map(cat => (
//                     <Accordion
//                       key={cat}
//                       catKey={cat}
//                       products={PRODUCTS_BY_CATEGORY[cat] ?? []}
//                       selectedId={comboSelections[cat]}
//                       onSelect={handlePresetSelection}
//                     />
//                   ))}
//                 </div>
//               </>
//             )}

//             {mode === 'custom' && (
//               <>
//                 <p className="slbl">Select Your Categories</p>
//                 <div className="catpills">
//                   {ALL_CATEGORIES.map(cat => (
//                     <button
//                       key={cat}
//                       className={`catpill${customCategories.includes(cat) ? ' on' : ''}`}
//                       onClick={() => setCustomCategories(prev =>
//                         prev.includes(cat) ? prev.filter(c => c !== cat) : [...prev, cat]
//                       )}
//                     >
//                       {customCategories.includes(cat) ? '✓ ' : '+ '}{CATEGORY_LABELS[cat]}
//                     </button>
//                   ))}
//                 </div>

//                 {customCategories.length > 0 && (
//                   <>
//                     <p className="slbl">Choose Products</p>
//                     <div className="customblock">
//                       {customCategories.map(cat => (
//                         <AccordionMulti
//                           key={cat}
//                           catKey={cat}
//                           products={PRODUCTS_BY_CATEGORY[cat] ?? []}
//                           selectedIds={customSelectedIds[cat] ?? []}
//                           onToggle={handleCustomToggle}
//                         />
//                       ))}
//                     </div>
//                   </>
//                 )}
//               </>
//             )}
//           </div>

//           {/* SUMMARY */}
//           <div>
//             <div className="summary">
//               <div className="sum-head">
//                 <div className="sum-title">Your Combo</div>
//                 <span className="sum-modetag">
//                   {mode === 'preset' ? '◈ Curated Set' : '✦ Custom Build'}
//                 </span>
//               </div>
//               <div className="sum-body">
//                 <div className="sum-list">
//                   {summaryItems.length === 0 ? (
//                     <p className="sum-empty">No items selected yet.</p>
//                   ) : summaryItems.map(({ k, p }) => (
//                     <div key={`${k}-${p.id}`} className="sum-row">
//                       <img className="sum-thumb" src={p.image} alt={p.name} />
//                       <div className="sum-info">
//                         <span className="sum-cat">{CATEGORY_LABELS[k]}</span>
//                         <span className="sum-name">{p.name}</span>
//                       </div>
//                       {mode === 'preset'
//                         ? <span className="sum-check">✓</span>
//                         : <span className="sum-price">₹{p.price.toLocaleString('en-IN')}</span>
//                       }
//                     </div>
//                   ))}
//                 </div>

//                 <div className="sum-divider" />

//                 <div className="sum-total-row">
//                   <span className="sum-total-lbl">Total</span>
//                   <span className="sum-total-val">₹{totalPrice.toLocaleString('en-IN')}</span>
//                 </div>

//                 {savings > 0 && (
//                   <p className="sum-saving">🎉 You save ₹{savings.toLocaleString('en-IN')} on this set</p>
//                 )}

//                 <button
//                   ref={cartBtnRef}
//                   className={`btn-cart${cartAdded ? ' done' : ''}`}
//                   onClick={handleAddToCart}
//                   disabled={!hasItems}
//                 >
//                   {cartAdded ? (
//                     <>
//                       <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><polyline points="20 6 9 17 4 12"/></svg>
//                       Added to Cart!
//                     </>
//                   ) : (
//                     <>
//                       <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
//                         <path d="M6 2L3 6v14a2 2 0 002 2h14a2 2 0 002-2V6l-3-4z"/>
//                         <line x1="3" y1="6" x2="21" y2="6"/>
//                         <path d="M16 10a4 4 0 01-8 0"/>
//                       </svg>
//                       Add Combo to Cart
//                     </>
//                   )}
//                 </button>

//                 <button
//                   className="btn-buy"
//                   onClick={handleBuyNow}
//                   disabled={!hasItems}
//                 >
//                   <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
//                     <path d="M5 12h14M12 5l7 7-7 7"/>
//                   </svg>
//                   Buy It Now
//                 </button>

//                 <div className="perks">
//                   <span className="perk"><span className="perk-dot"/>Free shipping ₹599+</span>
//                   <span className="perk"><span className="perk-dot"/>COD available</span>
//                   <span className="perk"><span className="perk-dot"/>Easy returns</span>
//                 </div>
//               </div>
//             </div>
//           </div>

//         </div>
//       </div>
//     </>
//   );
// }  


'use client';

import { useState, useMemo, useCallback, useRef, type ChangeEvent } from 'react';

/* ─────────────────────────────────────────────────────────────
   TYPES
───────────────────────────────────────────────────────────── */
type CategoryKey =
  | 'necklace' | 'earrings' | 'bracelets' | 'rings'
  | 'gift-boxes' | 'keychains' | 'hair-accessories';

interface ComboProduct {
  id: number;
  name: string;
  price: number;
  image: string;
  customisable: boolean;
}

interface PresetCombo {
  id: string;
  name: string;
  tagline: string;
  price: number;
  originalPrice: number;
  image: string;
  badge: string;
  tint: string;
  includedCategories: CategoryKey[];
  defaultSelections: Partial<Record<CategoryKey, number>>;
}

/* ─────────────────────────────────────────────────────────────
   DATA
───────────────────────────────────────────────────────────── */
const PRODUCTS_BY_CATEGORY: Record<CategoryKey, ComboProduct[]> = {
  necklace: [
    { id: 1, name: 'Dainty Layered Necklace', price: 1299, image: 'https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?w=400&q=80', customisable: false },
    { id: 2, name: 'Pearl Pendant Necklace',  price: 2499, image: 'https://images.unsplash.com/photo-1573408301185-9519f94816b5?w=400&q=80', customisable: false },
    { id: 3, name: 'Layered Gold Chain',       price: 1599, image: 'https://images.unsplash.com/photo-1611591437281-460bfbe1220a?w=400&q=80', customisable: false },
  ],
  earrings: [
    { id: 4, name: 'Gold Hoop Earrings',    price: 899,  image: 'https://images.unsplash.com/photo-1588444650733-d0f07d323dde?w=400&q=80', customisable: false },
    { id: 5, name: 'Minimal Stud Earrings', price: 549,  image: 'https://images.unsplash.com/photo-1605100804763-247f67b3557e?w=400&q=80', customisable: false },
    { id: 6, name: 'Korean Ear Cuffs',      price: 699,  image: 'https://images.unsplash.com/photo-1617038260897-41a1f14a8ca0?w=400&q=80', customisable: false },
  ],
  bracelets: [
    { id: 7,  name: 'Beaded Charm Bracelet',  price: 749,  image: 'https://images.unsplash.com/photo-1602173574767-37ac01994b2a?w=400&q=80', customisable: false },
    { id: 8,  name: 'Kada Bangle Set',         price: 1899, image: 'https://images.unsplash.com/photo-1612817288484-6f916006741a?w=400&q=80', customisable: false },
    { id: 9,  name: 'Minimal Chain Bracelet',  price: 999,  image: 'https://images.unsplash.com/photo-1612817288484-6f916006741a?w=400&q=80', customisable: false },
  ],
  rings: [
    { id: 10, name: 'Diamond Ring',      price: 2999, image: 'https://images.unsplash.com/photo-1605100804763-247f67b3557e?w=400&q=80', customisable: false },
    { id: 11, name: 'Minimal Gold Ring', price: 999,  image: 'https://images.unsplash.com/photo-1605100804763-247f67b3557e?w=400&q=80', customisable: false },
    { id: 12, name: 'Couple Rings Set',  price: 1999, image: 'https://images.unsplash.com/photo-1588444650733-d0f07d323dde?w=400&q=80', customisable: false },
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

const PRESET_COMBOS: PresetCombo[] = [
  {
    id: 'festive', name: 'Festive Glow', tagline: 'Celebrate every moment',
    price: 2999, originalPrice: 4500,
    image: 'https://images.unsplash.com/photo-1602173574767-37ac01994b2a?w=800&q=90',
    badge: 'Most Loved', tint: '#c8a84b',
    includedCategories: ['necklace', 'earrings', 'bracelets'],
    defaultSelections: { necklace: 1, earrings: 4, bracelets: 7 },
  },
  {
    id: 'bridal', name: 'Bridal Radiance', tagline: 'For your most beautiful day',
    price: 5999, originalPrice: 8800,
    image: 'https://images.unsplash.com/photo-1573408301185-9519f94816b5?w=800&q=90',
    badge: 'Premium', tint: '#b07d62',
    includedCategories: ['necklace', 'earrings', 'rings', 'bracelets'],
    defaultSelections: { necklace: 2, earrings: 4, rings: 10, bracelets: 8 },
  },
  {
    id: 'minimal', name: 'Minimal Edit', tagline: 'Less is more, always',
    price: 1999, originalPrice: 2800,
    image: 'https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?w=800&q=90',
    badge: 'New', tint: '#6b7c45',
    includedCategories: ['necklace', 'earrings'],
    defaultSelections: { necklace: 1, earrings: 5 },
  },
  {
    id: 'gifting', name: 'Gifting Special', tagline: 'Curated with love',
    price: 3499, originalPrice: 5200,
    image: 'https://images.unsplash.com/photo-1549465220-1a8b9238cd48?w=800&q=90',
    badge: 'Gift Ready', tint: '#8a6fa8',
    includedCategories: ['necklace', 'earrings', 'bracelets', 'gift-boxes'],
    defaultSelections: { necklace: 3, earrings: 6, bracelets: 9, 'gift-boxes': 16 },
  },
];

const CATEGORY_LABELS: Record<CategoryKey, string> = {
  necklace: 'Necklace', earrings: 'Earrings', bracelets: 'Bracelet',
  rings: 'Ring', 'gift-boxes': 'Gift Box', keychains: 'Keychain',
  'hair-accessories': 'Hair Accessory',
};

const ALL_CATEGORIES = Object.keys(PRODUCTS_BY_CATEGORY) as CategoryKey[];

/* ─────────────────────────────────────────────────────────────
   PERSONALISE PANEL
───────────────────────────────────────────────────────────── */
function PersonalisePanel({ productName }: { productName: string }) {
  const [text, setText] = useState('');
  const [preview, setPreview] = useState<string | null>(null);

  const handleFile = (e: ChangeEvent<HTMLInputElement>) => {
    const f = e.currentTarget.files?.[0];
    if (!f) return;
    const r = new FileReader();
    r.onload = ev => setPreview((ev.target?.result as string) ?? null);
    r.readAsDataURL(f);
  };

  return (
    <div className="pers-panel">
      <p className="pers-label">✦ Personalise · {productName}</p>
      <input
        className="pers-input"
        placeholder="Add a name or message…"
        value={text}
        onChange={e => setText(e.target.value)}
        maxLength={80}
      />
      <label className="pers-upload">
        <input type="file" accept="image/*" style={{ display: 'none' }} onChange={handleFile} />
        {preview
          ? <img src={preview} alt="preview" style={{ width: 24, height: 24, objectFit: 'cover', borderRadius: 4 }} />
          : <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
              <rect x="3" y="3" width="18" height="18" rx="3" />
              <circle cx="8.5" cy="8.5" r="1.5" />
              <polyline points="21 15 16 10 5 21" />
            </svg>
        }
        <span>{preview ? 'Change photo' : 'Upload photo'}</span>
      </label>
    </div>
  );
}

/* ─────────────────────────────────────────────────────────────
   PRODUCT CARD (compact)
───────────────────────────────────────────────────────────── */
function ProdCard({ product, selected, onToggle }: {
  product: ComboProduct; selected: boolean; onToggle: () => void;
}) {
  return (
    <button className={`pcard${selected ? ' on' : ''}`} onClick={onToggle}>
      <div className="pcard-img">
        <img src={product.image} alt={product.name} />
        {selected && (
          <span className="pcard-tick">
            <svg width="8" height="8" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="3.5">
              <polyline points="20 6 9 17 4 12" />
            </svg>
          </span>
        )}
      </div>
      <div className="pcard-foot">
        <span className="pcard-name">{product.name}</span>
        <span className="pcard-price">₹{product.price.toLocaleString('en-IN')}</span>
      </div>
    </button>
  );
}

/* ─────────────────────────────────────────────────────────────
   ACCORDION — single-select (desktop)
───────────────────────────────────────────────────────────── */
function Accordion({ catKey, products, selectedId, onSelect }: {
  catKey: CategoryKey; products: ComboProduct[];
  selectedId?: number; onSelect: (k: CategoryKey, id: number) => void;
}) {
  const [open, setOpen] = useState(false);
  const sel = products.find(p => p.id === selectedId);

  return (
    <div className="acc">
      <button className="acc-head" onClick={() => setOpen(o => !o)}>
        <span className="acc-cat">{CATEGORY_LABELS[catKey]}</span>
        <span className={`acc-info${!sel ? ' dim' : ''}`}>
          {sel ? <>{sel.name} · <strong>₹{sel.price.toLocaleString('en-IN')}</strong></> : 'Select one'}
        </span>
        <svg className={`acc-chevron${open ? ' open' : ''}`} width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
          <polyline points="6 9 12 15 18 9" />
        </svg>
      </button>
      {open && (
        <div className="acc-body">
          <div className="pgrid">
            {products.map(p => (
              <ProdCard key={p.id} product={p} selected={p.id === selectedId} onToggle={() => onSelect(catKey, p.id)} />
            ))}
          </div>
          {sel?.customisable && <PersonalisePanel productName={sel.name} />}
        </div>
      )}
    </div>
  );
}

/* ─────────────────────────────────────────────────────────────
   ACCORDION — multi-select (desktop)
───────────────────────────────────────────────────────────── */
function AccordionMulti({ catKey, products, selectedIds, onToggle }: {
  catKey: CategoryKey; products: ComboProduct[];
  selectedIds: number[]; onToggle: (k: CategoryKey, id: number) => void;
}) {
  const [open, setOpen] = useState(false);
  const count = selectedIds.length;
  const anyCustom = selectedIds.some(id => products.find(p => p.id === id)?.customisable);

  return (
    <div className="acc">
      <button className="acc-head" onClick={() => setOpen(o => !o)}>
        <span className="acc-cat">{CATEGORY_LABELS[catKey]}</span>
        <span className={`acc-info${count === 0 ? ' dim' : ''}`}>
          {count > 0 ? `${count} selected` : 'Select any'}
        </span>
        <svg className={`acc-chevron${open ? ' open' : ''}`} width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
          <polyline points="6 9 12 15 18 9" />
        </svg>
      </button>
      {open && (
        <div className="acc-body">
          <div className="pgrid">
            {products.map(p => (
              <ProdCard key={p.id} product={p} selected={selectedIds.includes(p.id)} onToggle={() => onToggle(catKey, p.id)} />
            ))}
          </div>
          {anyCustom && <PersonalisePanel productName={CATEGORY_LABELS[catKey]} />}
        </div>
      )}
    </div>
  );
}

/* ─────────────────────────────────────────────────────────────
   COMBO CARD — with inline mobile product picker
   KEY CHANGE: On mobile, clicking the card shows a product
   selector IMMEDIATELY BELOW the card (not at bottom of page)
───────────────────────────────────────────────────────────── */
interface ComboCardProps {
  combo: PresetCombo;
  selected: boolean;
  onSelect: (id: string) => void;
  // Mobile inline picker props
  comboSelections: Partial<Record<CategoryKey, number>>;
  onPresetSelection: (k: CategoryKey, id: number) => void;
}

function ComboCard({ combo, selected, onSelect, comboSelections, onPresetSelection }: ComboCardProps) {
  const pct = Math.round(((combo.originalPrice - combo.price) / combo.originalPrice) * 100);
  const [mobileExpanded, setMobileExpanded] = useState(false);
  const [activeCat, setActiveCat] = useState<CategoryKey | null>(null);

  const handleCardClick = () => {
    onSelect(combo.id);
    // On mobile, toggle the inline picker
    if (selected) {
      setMobileExpanded(o => !o);
    } else {
      setMobileExpanded(true);
    }
    setActiveCat(null);
  };

  return (
    <div className={`ccard-wrap${selected ? ' sel' : ''}`}>
      <button
        className={`ccard${selected ? ' sel' : ''}`}
        onClick={handleCardClick}
        style={{ '--t': combo.tint } as React.CSSProperties}
      >
        <div className="ccard-img">
          <img src={combo.image} alt={combo.name} />
          <div className="ccard-grad" />
          <span className="ccard-badge">{combo.badge}</span>
          <span className="ccard-disc">{pct}% off</span>
          {selected && <div className="ccard-ring" />}
          <div className="ccard-overlay-text">
            <span className="ccard-name">{combo.name}</span>
            <span className="ccard-tagline">{combo.tagline}</span>
          </div>
        </div>
        <div className="ccard-bar" style={{ background: combo.tint }} />
        <div className="ccard-foot">
          <div className="ccard-price-row">
            <span className="ccard-price">₹{combo.price.toLocaleString('en-IN')}</span>
            <span className="ccard-was">₹{combo.originalPrice.toLocaleString('en-IN')}</span>
          </div>
          <div className="ccard-chips">
            {combo.includedCategories.map(c => (
              <span key={c} className="ccard-chip">{CATEGORY_LABELS[c]}</span>
            ))}
          </div>
          {/* Mobile hint */}
          <div className="ccard-mobile-hint">
            {selected
              ? <span>{mobileExpanded ? '▲ Hide options' : '▼ Customise pieces'}</span>
              : <span>Tap to select & customise</span>
            }
          </div>
        </div>
      </button>

      {/* ── MOBILE INLINE PRODUCT PICKER ── */}
      {selected && mobileExpanded && (
        <div className="mobile-picker">
          <div className="mobile-picker-head">
            <span className="mobile-picker-title">Swap Pieces · {combo.name}</span>
            <button className="mobile-picker-close" onClick={() => setMobileExpanded(false)}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
              </svg>
            </button>
          </div>

          {/* Category tabs */}
          <div className="mobile-cat-tabs">
            {combo.includedCategories.map(cat => {
              const selId = comboSelections[cat];
              const selProd = PRODUCTS_BY_CATEGORY[cat]?.find(p => p.id === selId);
              return (
                <button
                  key={cat}
                  className={`mobile-cat-tab${activeCat === cat ? ' on' : ''}${selProd ? ' done' : ''}`}
                  onClick={() => setActiveCat(activeCat === cat ? null : cat)}
                >
                  {selProd ? (
                    <svg width="9" height="9" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
                      <polyline points="20 6 9 17 4 12"/>
                    </svg>
                  ) : null}
                  {CATEGORY_LABELS[cat]}
                </button>
              );
            })}
          </div>

          {/* Product grid for active category */}
          {activeCat && (
            <div className="mobile-prod-section">
              <div className="mobile-pgrid">
                {(PRODUCTS_BY_CATEGORY[activeCat] ?? []).map(p => {
                  const isSelected = comboSelections[activeCat] === p.id;
                  return (
                    <button
                      key={p.id}
                      className={`mobile-prod${isSelected ? ' on' : ''}`}
                      onClick={() => onPresetSelection(activeCat, p.id)}
                    >
                      <div className="mobile-prod-img">
                        <img src={p.image} alt={p.name} />
                        {isSelected && (
                          <span className="mobile-prod-tick">
                            <svg width="8" height="8" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="3.5">
                              <polyline points="20 6 9 17 4 12"/>
                            </svg>
                          </span>
                        )}
                      </div>
                      <span className="mobile-prod-name">{p.name}</span>
                      <span className="mobile-prod-price">₹{p.price.toLocaleString('en-IN')}</span>
                    </button>
                  );
                })}
              </div>
              {/* Personalise if customisable */}
              {(() => {
                const selId = comboSelections[activeCat];
                const selProd = PRODUCTS_BY_CATEGORY[activeCat]?.find(p => p.id === selId);
                return selProd?.customisable ? <PersonalisePanel productName={selProd.name} /> : null;
              })()}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

/* ─────────────────────────────────────────────────────────────
   MAIN PAGE
───────────────────────────────────────────────────────────── */
export default function CuratedCombosPage() {
  // NOTE: Replace these with your actual imports:
  // import { useCart } from '@/lib/cartContext';
  // import { fireConfetti } from '@/components/cart/ConfettiManager';
  // import UpperNav from '@/components/ui/UpperNav';
  // import { useRouter } from 'next/navigation';

  const cartBtnRef = useRef<HTMLButtonElement | null>(null);

  const [mode, setMode] = useState<'preset' | 'custom'>('preset');
  const [selectedComboId, setSelectedComboId] = useState('festive');
  const [comboSelections, setComboSelections] = useState<Partial<Record<CategoryKey, number>>>(() => {
    const c = PRESET_COMBOS.find(c => c.id === 'festive');
    return c ? { ...c.defaultSelections } : {};
  });
  const [customSelectedIds, setCustomSelectedIds] = useState<Partial<Record<CategoryKey, number[]>>>({});
  const [customCategories, setCustomCategories] = useState<CategoryKey[]>(['necklace', 'earrings']);
  const [cartAdded, setCartAdded] = useState(false);

  const selectedCombo = PRESET_COMBOS.find(c => c.id === selectedComboId);

  const handleComboSelect = useCallback((id: string) => {
    setSelectedComboId(id);
    const c = PRESET_COMBOS.find(c => c.id === id);
    if (c) setComboSelections({ ...c.defaultSelections });
  }, []);

  const handlePresetSelection = useCallback((k: CategoryKey, id: number) => {
    setComboSelections(prev => ({ ...prev, [k]: id }));
  }, []);

  const handleCustomToggle = useCallback((k: CategoryKey, id: number) => {
    setCustomSelectedIds(prev => {
      const cur = prev[k] || [];
      return { ...prev, [k]: cur.includes(id) ? cur.filter(x => x !== id) : [...cur, id] };
    });
  }, []);

  const customTotal = useMemo(() => {
    return customCategories.reduce((sum, cat) => {
      return sum + (customSelectedIds[cat] || []).reduce((s, id) => {
        const p = PRODUCTS_BY_CATEGORY[cat]?.find(p => p.id === id);
        return s + (p?.price || 0);
      }, 0);
    }, 0);
  }, [customSelectedIds, customCategories]);

  const presetTotal = selectedCombo?.price || 0;
  const totalPrice = mode === 'preset' ? presetTotal : customTotal;
  const totalOriginal = mode === 'preset' ? (selectedCombo?.originalPrice || presetTotal) : customTotal;
  const savings = totalOriginal - totalPrice;

  const presetSummaryItems = useMemo(() => {
    if (!selectedCombo) return [];
    return selectedCombo.includedCategories.flatMap(k => {
      const id = comboSelections[k];
      const p = PRODUCTS_BY_CATEGORY[k]?.find(p => p.id === id);
      return p ? [{ k, p }] : [];
    });
  }, [selectedCombo, comboSelections]);

  const customSummaryItems = useMemo(() => {
    return customCategories.flatMap(k =>
      (customSelectedIds[k] || []).flatMap(id => {
        const p = PRODUCTS_BY_CATEGORY[k]?.find(p => p.id === id);
        return p ? [{ k, p }] : [];
      })
    );
  }, [customSelectedIds, customCategories]);

  const summaryItems = mode === 'preset'
    ? presetSummaryItems.map(i => ({ k: i.k, p: i.p }))
    : customSummaryItems;
  const hasItems = summaryItems.length > 0;

  function handleAddToCart() {
    if (!hasItems) return;
    // Replace with your actual cart logic:
    // addItem(...);
    // fireConfetti(cartBtnRef.current);
    setCartAdded(true);
    setTimeout(() => setCartAdded(false), 1800);
  }

  function handleBuyNow() {
    if (!hasItems) return;
    handleAddToCart();
    // setTimeout(() => router.push('/checkout'), 150);
  }

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,400;0,500;0,600;1,400;1,500&family=Outfit:wght@300;400;500;600&display=swap');

        :root {
          --bg:       #f7f4ee;
          --surf:     #ffffff;
          --bdr:      #e4ddd0;
          --bdr2:     #cfc7b6;
          --olive:    #49581f;
          --olive2:   #68773e;
          --olivedim: #edf0e2;
          --gold:     #c7a748;
          --gold2:    #eedfa0;
          --ink:      #1b1f0e;
          --ink6:     rgba(27,31,14,.6);
          --ink3:     rgba(27,31,14,.32);
          --green:    #2d6e30;
          --ffd:      'Playfair Display', Georgia, serif;
          --ffb:      'Outfit', sans-serif;
          --card-r:   14px;
        }

        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
        button { font-family: var(--ffb); cursor: pointer; }
        img { display: block; }

        /* ── PAGE ── */
        .page {
          min-height: 100dvh;
          background: var(--bg);
          font-family: var(--ffb);
          color: var(--ink);
        }

        /* ── HERO ── */
        .hero {
          padding: clamp(28px, 4vw, 48px) clamp(16px, 5vw, 60px) clamp(22px, 3vw, 38px);
          background: linear-gradient(160deg, #f7f4ee 0%, #f0e9da 55%, #f7f4ee 100%);
          border-bottom: 1px solid var(--bdr);
          position: relative; overflow: hidden;
          animation: up .5s ease both;
        }
        .hero::before {
          content: ''; position: absolute; right: -60px; top: -60px;
          width: 300px; height: 300px; border-radius: 50%;
          background: radial-gradient(circle, rgba(199,167,72,.12) 0%, transparent 68%);
          pointer-events: none;
        }
        .hero-tag {
          display: flex; align-items: center; gap: 10px;
          font-size: 8.5px; letter-spacing: .42em; text-transform: uppercase;
          color: var(--gold); font-weight: 500; margin-bottom: 12px;
        }
        .hero-tag-line { width: 24px; height: 1px; background: var(--gold); opacity: .5; }
        .hero h1 {
          font-family: var(--ffd);
          font-size: clamp(1.6rem, 4vw, 3.2rem);
          font-weight: 500; color: var(--olive);
          line-height: 1.1; letter-spacing: -.02em;
          margin-bottom: 10px;
        }
        .hero h1 em { font-style: italic; color: var(--gold); }
        .hero p {
          font-size: clamp(11px, 1.3vw, 13px); font-weight: 300;
          color: var(--ink6); max-width: 440px; line-height: 1.8;
        }

        /* ── MODE BAR ── */
        .modebar {
          padding: clamp(16px, 3vw, 26px) clamp(16px, 5vw, 60px) 0;
          display: flex; align-items: flex-start; gap: 16px; flex-wrap: wrap;
          animation: up .5s ease .07s both;
        }
        .modetoggle {
          display: flex; background: var(--surf);
          border: 1.5px solid var(--bdr2); border-radius: 50px;
          padding: 4px; gap: 3px;
          box-shadow: 0 2px 10px rgba(27,31,14,.1); flex-shrink: 0;
        }
        .modebtn {
          font-size: 9.5px; font-weight: 600; letter-spacing: .13em; text-transform: uppercase;
          padding: clamp(8px,1.5vw,10px) clamp(14px,2.5vw,22px);
          border-radius: 50px; border: none; background: transparent;
          color: var(--ink6); transition: all .25s;
        }
        .modebtn.on {
          background: var(--olive); color: #fff;
          box-shadow: 0 3px 12px rgba(73,88,31,.35);
        }
        .modehint {
          font-size: 11px; font-weight: 300; color: var(--ink6);
          line-height: 1.7; max-width: 440px; padding-top: 12px;
        }

        /* ── LAYOUT ── */
        .layout {
          display: grid;
          grid-template-columns: 1fr 320px;
          gap: 20px;
          padding: clamp(16px,3vw,26px) clamp(16px,5vw,60px) 64px;
          align-items: start;
          animation: up .5s ease .13s both;
        }

        /* ── SECTION LABEL ── */
        .slbl {
          font-size: 8px; letter-spacing: .4em; text-transform: uppercase;
          color: var(--ink3); font-weight: 500; margin-bottom: 12px;
          display: flex; align-items: center; gap: 10px;
        }
        .slbl::after { content: ''; flex: 1; height: 1px; background: var(--bdr); }

        /* ══════════════════════════════════════
           COMBO CARDS — reduced size
        ══════════════════════════════════════ */
        .cgrid {
          display: grid;
          grid-template-columns: repeat(2, 1fr);
          gap: 10px;
          margin-bottom: 28px;
        }

        /* wrapper holds card + mobile inline picker */
        .ccard-wrap {
          display: flex; flex-direction: column;
          border-radius: var(--card-r);
          overflow: hidden;
        }
        .ccard-wrap.sel {
          box-shadow: 0 0 0 2px var(--gold), 0 8px 28px rgba(27,31,14,.14);
          border-radius: var(--card-r);
        }

        .ccard {
          position: relative; padding: 0; border: 2px solid transparent;
          background: var(--surf); border-radius: var(--card-r);
          overflow: hidden; text-align: left; width: 100%;
          box-shadow: 0 1px 8px rgba(27,31,14,.08);
          transition: transform .2s cubic-bezier(.34,1.3,.64,1), box-shadow .2s;
          outline: none;
        }
        .ccard-wrap.sel .ccard {
          border-radius: var(--card-r) var(--card-r) 0 0;
          border-bottom-left-radius: 0;
          border-bottom-right-radius: 0;
        }
        .ccard:hover {
          transform: translateY(-3px) scale(1.01);
          box-shadow: 0 10px 32px rgba(27,31,14,.14);
        }

        /* image — compact */
        .ccard-img { position: relative; aspect-ratio: 4 / 2.6; overflow: hidden; }
        .ccard-img img {
          width: 100%; height: 100%; object-fit: cover;
          transition: transform .5s ease;
        }
        .ccard:hover .ccard-img img { transform: scale(1.07); }
        .ccard-grad {
          position: absolute; inset: 0;
          background: linear-gradient(to bottom, rgba(0,0,0,.02) 0%, rgba(0,0,0,.6) 100%);
        }
        .ccard-badge {
          position: absolute; top: 7px; left: 7px;
          background: rgba(255,255,255,.92);
          color: var(--ink); font-size: 7px; font-weight: 700;
          letter-spacing: .14em; text-transform: uppercase;
          padding: 2px 7px; border-radius: 50px;
          backdrop-filter: blur(4px);
        }
        .ccard-disc {
          position: absolute; top: 7px; right: 7px;
          color: #fff; font-size: 7px; font-weight: 700;
          background: var(--t, var(--gold));
          padding: 2px 7px; border-radius: 50px;
        }
        .ccard-ring {
          position: absolute; inset: 0;
          border: 2px solid var(--t, var(--gold));
          pointer-events: none;
        }
        .ccard-overlay-text {
          position: absolute; bottom: 0; left: 0; right: 0;
          padding: 8px 10px;
          display: flex; flex-direction: column; gap: 1px;
        }
        .ccard-name {
          font-family: var(--ffd); font-size: .88rem; font-weight: 500;
          color: #fff; line-height: 1.2;
          text-shadow: 0 1px 4px rgba(0,0,0,.35);
        }
        .ccard-tagline { font-size: 8px; color: rgba(255,255,255,.65); letter-spacing: .04em; }

        .ccard-bar { height: 2.5px; }
        .ccard-foot { padding: 7px 10px 9px; }
        .ccard-price-row { display: flex; align-items: baseline; gap: 6px; margin-bottom: 5px; }
        .ccard-price { font-family: var(--ffd); font-size: .95rem; font-weight: 600; color: var(--ink); }
        .ccard-was { font-size: 9.5px; color: var(--ink3); text-decoration: line-through; }
        .ccard-chips { display: flex; flex-wrap: wrap; gap: 3px; margin-bottom: 4px; }
        .ccard-chip {
          font-size: 6.5px; font-weight: 500; letter-spacing: .09em; text-transform: uppercase;
          color: var(--ink6); border: 1px solid var(--bdr);
          padding: 1.5px 5px; border-radius: 50px;
        }
        .ccard-wrap.sel .ccard-chip {
          border-color: rgba(199,167,72,.4); color: var(--olive);
        }
        /* Mobile hint — only visible on mobile */
        .ccard-mobile-hint {
          display: none;
          font-size: 8.5px; color: var(--gold); font-weight: 600;
          letter-spacing: .06em; margin-top: 2px;
        }

        /* ── MOBILE INLINE PICKER ── */
        .mobile-picker {
          background: var(--olivedim);
          border-top: 1px solid rgba(199,167,72,.3);
          padding: 0;
          border-radius: 0 0 var(--card-r) var(--card-r);
          animation: slideDown .22s ease;
          overflow: hidden;
        }
        @keyframes slideDown {
          from { opacity: 0; transform: translateY(-8px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        .mobile-picker-head {
          display: flex; align-items: center; justify-content: space-between;
          padding: 9px 12px 6px;
          border-bottom: 1px solid var(--bdr);
          background: linear-gradient(135deg, var(--olivedim), #f0e8d8);
        }
        .mobile-picker-title {
          font-size: 9px; font-weight: 700; letter-spacing: .1em; text-transform: uppercase;
          color: var(--olive);
        }
        .mobile-picker-close {
          background: transparent; border: none; color: var(--ink3); padding: 3px;
          display: flex; align-items: center; justify-content: center;
          border-radius: 50%; transition: background .15s;
        }
        .mobile-picker-close:hover { background: var(--bdr); }

        /* Category tabs */
        .mobile-cat-tabs {
          display: flex; gap: 6px; flex-wrap: wrap;
          padding: 8px 12px 6px;
        }
        .mobile-cat-tab {
          font-size: 8.5px; font-weight: 600; letter-spacing: .1em; text-transform: uppercase;
          padding: 5px 11px; border-radius: 50px;
          border: 1.5px solid var(--bdr2);
          background: var(--surf); color: var(--ink6);
          transition: all .18s;
          display: flex; align-items: center; gap: 4px;
        }
        .mobile-cat-tab.on { background: var(--olive); color: #fff; border-color: var(--olive); }
        .mobile-cat-tab.done { border-color: var(--gold); color: var(--olive2); }
        .mobile-cat-tab.on.done { background: var(--olive); color: #fff; }

        /* Mobile product grid */
        .mobile-prod-section { padding: 6px 12px 12px; }
        .mobile-pgrid {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 7px; margin-bottom: 8px;
        }
        .mobile-prod {
          background: var(--surf); border: 1.5px solid var(--bdr);
          border-radius: 10px; overflow: hidden;
          padding: 0; text-align: left;
          transition: border-color .18s, box-shadow .18s;
          display: flex; flex-direction: column;
        }
        .mobile-prod:hover { border-color: var(--olive2); }
        .mobile-prod.on { border-color: var(--gold); box-shadow: 0 0 0 2px rgba(199,167,72,.2); }
        .mobile-prod-img { position: relative; aspect-ratio: 1; overflow: hidden; }
        .mobile-prod-img img { width: 100%; height: 100%; object-fit: cover; }
        .mobile-prod-tick {
          position: absolute; top: 4px; right: 4px;
          width: 16px; height: 16px; border-radius: 50%;
          background: var(--gold); display: flex; align-items: center; justify-content: center;
        }
        .mobile-prod-name {
          display: block; font-size: 8.5px; font-weight: 500; color: var(--ink);
          padding: 4px 6px 1px; line-height: 1.3;
        }
        .mobile-prod-price {
          display: block; font-size: 9px; font-weight: 600; color: var(--olive2);
          padding: 0 6px 5px;
        }

        /* ── CUSTOMISE BLOCK (desktop accordion) ── */
        .custblock {
          background: var(--surf); border: 1.5px solid var(--bdr);
          border-radius: var(--card-r); overflow: hidden;
          box-shadow: 0 1px 8px rgba(27,31,14,.07);
        }
        .custhead {
          padding: 11px 18px; border-bottom: 1px solid var(--bdr);
          background: linear-gradient(135deg, var(--olivedim), #f3ede0);
          display: flex; align-items: center; justify-content: space-between;
        }
        .custtitle { font-family: var(--ffd); font-size: .92rem; font-weight: 500; color: var(--olive); }
        .custsub { font-size: 9px; color: var(--ink6); letter-spacing: .04em; }

        /* ── ACCORDION ── */
        .acc { border-bottom: 1px solid var(--bdr); }
        .acc:last-child { border-bottom: none; }
        .acc-head {
          width: 100%; display: flex; align-items: center; gap: 10px;
          padding: 11px 18px; background: transparent; border: none; text-align: left;
          transition: background .15s;
        }
        .acc-head:hover { background: var(--olivedim); }
        .acc-cat {
          font-size: 9.5px; font-weight: 600; letter-spacing: .1em; text-transform: uppercase;
          color: var(--olive); flex-shrink: 0; width: 96px;
        }
        .acc-info { flex: 1; font-size: 10px; color: var(--ink6); white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
        .acc-info.dim { color: var(--ink3); font-style: italic; }
        .acc-info strong { color: var(--ink); font-weight: 600; }
        .acc-chevron { color: var(--ink3); transition: transform .22s; flex-shrink: 0; }
        .acc-chevron.open { transform: rotate(180deg); }
        .acc-body { padding: 7px 18px 14px; }

        /* ── PRODUCT GRID ── */
        .pgrid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(100px, 1fr));
          gap: 8px; margin-bottom: 8px;
        }
        .pcard {
          background: #fff; border: 1.5px solid var(--bdr);
          border-radius: 10px; overflow: hidden; padding: 0; text-align: left;
          transition: border-color .18s, box-shadow .18s, transform .18s;
        }
        .pcard:hover { border-color: var(--olive2); box-shadow: 0 3px 10px rgba(27,31,14,.1); transform: translateY(-1px); }
        .pcard.on { border-color: var(--gold); box-shadow: 0 0 0 2px rgba(199,167,72,.2); }
        .pcard-img { position: relative; aspect-ratio: 1; overflow: hidden; }
        .pcard-img img { width: 100%; height: 100%; object-fit: cover; transition: transform .3s; }
        .pcard:hover .pcard-img img { transform: scale(1.08); }
        .pcard-tick {
          position: absolute; top: 5px; right: 5px;
          width: 17px; height: 17px; border-radius: 50%;
          background: var(--gold); display: flex; align-items: center; justify-content: center;
        }
        .pcard-foot { padding: 5px 7px 7px; }
        .pcard-name { display: block; font-size: 9px; font-weight: 500; color: var(--ink); line-height: 1.3; margin-bottom: 1px; }
        .pcard-price { display: block; font-size: 9.5px; font-weight: 600; color: var(--olive); }

        /* ── PERSONALISE ── */
        .pers-panel {
          background: linear-gradient(135deg, rgba(199,167,72,.07), rgba(73,88,31,.04));
          border: 1px solid rgba(199,167,72,.2);
          border-radius: 9px; padding: 10px 12px; margin-top: 4px;
        }
        .pers-label { font-size: 8.5px; font-weight: 700; letter-spacing: .12em; text-transform: uppercase; color: #896018; margin-bottom: 7px; }
        .pers-input {
          width: 100%; border: 1.5px solid var(--bdr2); border-radius: 6px;
          padding: 7px 10px; font-family: var(--ffb); font-size: 10.5px;
          color: var(--ink); background: #fff; outline: none;
          margin-bottom: 6px; transition: border-color .2s;
        }
        .pers-input:focus { border-color: var(--olive2); }
        .pers-input::placeholder { color: var(--ink3); }
        .pers-upload {
          display: inline-flex; align-items: center; gap: 5px;
          font-size: 8.5px; font-weight: 600; letter-spacing: .1em; text-transform: uppercase;
          color: var(--olive); border: 1.5px dashed var(--bdr2);
          border-radius: 6px; padding: 5px 10px; cursor: pointer; background: #fff;
          transition: border-color .2s, background .2s;
        }
        .pers-upload:hover { border-color: var(--olive2); background: var(--olivedim); }

        /* ── CATEGORY PILLS (custom mode) ── */
        .catpills { display: flex; flex-wrap: wrap; gap: 7px; margin-bottom: 18px; }
        .catpill {
          font-size: 9px; font-weight: 500; letter-spacing: .1em; text-transform: uppercase;
          color: var(--ink6); padding: 7px 14px;
          border: 1.5px solid var(--bdr2); border-radius: 50px;
          background: transparent; transition: all .2s;
        }
        .catpill:hover { color: var(--olive); border-color: var(--olive2); background: var(--olivedim); }
        .catpill.on { background: var(--olive); color: #fff; border-color: var(--olive); }
        .customblock {
          background: var(--surf); border: 1.5px solid var(--bdr);
          border-radius: var(--card-r); overflow: hidden;
          box-shadow: 0 1px 8px rgba(27,31,14,.07);
        }

        /* ── SUMMARY ── */
        .summary {
          position: sticky; top: 72px;
          background: var(--surf); border: 1.5px solid var(--bdr);
          border-radius: var(--card-r); overflow: hidden;
          box-shadow: 0 4px 20px rgba(27,31,14,.1);
        }
        .sum-head {
          padding: 16px 18px 12px;
          background: linear-gradient(135deg, var(--olivedim), #f0e8d8);
          border-bottom: 1px solid var(--bdr);
          position: relative; overflow: hidden;
        }
        .sum-head::after {
          content: '◈'; position: absolute; right: 14px; top: 50%;
          transform: translateY(-50%); font-size: 32px;
          color: rgba(199,167,72,.1); pointer-events: none; line-height: 1;
        }
        .sum-title { font-family: var(--ffd); font-size: 1rem; font-weight: 500; color: var(--olive); }
        .sum-modetag {
          display: block; font-size: 8px; font-weight: 700;
          letter-spacing: .2em; text-transform: uppercase; color: var(--gold); margin-top: 2px;
        }
        .sum-body { padding: 12px 18px 16px; }
        .sum-list { margin-bottom: 12px; max-height: 240px; overflow-y: auto; }
        .sum-list::-webkit-scrollbar { width: 3px; }
        .sum-list::-webkit-scrollbar-thumb { background: var(--bdr2); border-radius: 2px; }
        .sum-row {
          display: flex; align-items: center; gap: 8px;
          padding: 7px 0; border-bottom: 1px solid rgba(27,31,14,.05);
        }
        .sum-row:last-child { border-bottom: none; }
        .sum-thumb {
          width: 34px; height: 34px; border-radius: 7px; object-fit: cover;
          border: 1px solid var(--bdr); flex-shrink: 0;
        }
        .sum-info { flex: 1; min-width: 0; }
        .sum-cat { font-size: 7px; letter-spacing: .14em; text-transform: uppercase; color: var(--ink3); display: block; }
        .sum-name { font-size: 10px; font-weight: 500; color: var(--ink); display: block; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
        .sum-price { font-size: 10px; font-weight: 600; color: var(--olive); flex-shrink: 0; }
        .sum-check {
          width: 18px; height: 18px; border-radius: 50%;
          background: var(--olivedim); display: flex; align-items: center; justify-content: center;
          font-size: 9px; color: var(--olive); flex-shrink: 0;
        }
        .sum-empty {
          text-align: center; font-family: var(--ffd); font-style: italic;
          font-size: 11.5px; color: var(--ink3); padding: 16px 0;
        }
        .sum-divider {
          height: 1px; margin: 10px 0;
          background: linear-gradient(90deg, transparent, var(--gold2), transparent);
        }
        .sum-total-row { display: flex; justify-content: space-between; align-items: baseline; margin-bottom: 3px; }
        .sum-total-lbl { font-size: 8.5px; font-weight: 600; letter-spacing: .14em; text-transform: uppercase; color: var(--ink6); }
        .sum-total-val { font-family: var(--ffd); font-size: 1.5rem; font-weight: 600; color: var(--ink); }
        .sum-saving { font-size: 10.5px; font-weight: 500; color: var(--green); margin-bottom: 13px; }

        /* ── BUTTONS ── */
        .btn-cart {
          width: 100%; display: flex; align-items: center; justify-content: center; gap: 7px;
          font-size: 9.5px; font-weight: 700; letter-spacing: .16em; text-transform: uppercase;
          color: #fff; background: var(--olive); border: none;
          border-radius: 50px; padding: 13px; margin-bottom: 8px;
          box-shadow: 0 3px 12px rgba(73,88,31,.28);
          transition: background .2s, transform .15s, box-shadow .2s;
        }
        .btn-cart:hover:not(:disabled) { background: #384a14; transform: translateY(-1px); }
        .btn-cart:disabled { opacity: .45; cursor: not-allowed; }
        .btn-cart.done { background: var(--green) !important; }

        .btn-buy {
          width: 100%; display: flex; align-items: center; justify-content: center; gap: 7px;
          font-size: 9.5px; font-weight: 700; letter-spacing: .16em; text-transform: uppercase;
          color: var(--ink); background: var(--gold2);
          border: 1.5px solid var(--gold); border-radius: 50px; padding: 12px;
          transition: all .2s;
        }
        .btn-buy:hover:not(:disabled) { background: var(--gold); color: #fff; transform: translateY(-1px); }
        .btn-buy:disabled { opacity: .45; cursor: not-allowed; }

        .perks { display: flex; justify-content: center; gap: 12px; margin-top: 12px; flex-wrap: wrap; }
        .perk { font-size: 8.5px; color: var(--ink3); display: flex; align-items: center; gap: 3px; }
        .perk-dot { width: 3px; height: 3px; border-radius: 50%; background: var(--gold); opacity: .6; }

        /* ── ANIMATIONS ── */
        @keyframes up {
          from { opacity: 0; transform: translateY(14px); }
          to   { opacity: 1; transform: translateY(0); }
        }

        /* ══════════════════════════════════════
           RESPONSIVE
        ══════════════════════════════════════ */

        /* Tablet */
        @media (max-width: 1024px) {
          .layout {
            grid-template-columns: 1fr;
          }
          .summary { position: static; }
        }

        /* Mobile ≤ 680px — show mobile picker, hide desktop accordion */
        @media (max-width: 680px) {
          .hero, .modebar, .layout { padding-left: 14px; padding-right: 14px; }
          .hero { padding-top: 24px; padding-bottom: 20px; }
          .modebar { padding-top: 14px; }
          .layout { padding-top: 16px; padding-bottom: 40px; gap: 14px; }

          .cgrid {
            grid-template-columns: 1fr 1fr;
            gap: 8px;
          }

          /* Show mobile hint on cards */
          .ccard-mobile-hint { display: block; }

          /* Hide desktop accordion on mobile, show mobile picker instead */
          .desktop-only { display: none !important; }

          .modebtn { padding: 7px 12px; font-size: 9px; }

          /* Mobile product grid: 3 columns */
          .mobile-pgrid {
            grid-template-columns: repeat(3, 1fr);
          }

          /* Summary sticks at bottom on mobile as a floating bar */
          .summary {
            position: static;
            border-radius: 14px;
          }
        }

        @media (max-width: 400px) {
          .cgrid { grid-template-columns: 1fr; }
          .mobile-pgrid { grid-template-columns: repeat(2, 1fr); }
        }

        /* Tablet range: show desktop layout, hide mobile picker */
        @media (min-width: 681px) {
          .mobile-picker { display: none !important; }
          .ccard-mobile-hint { display: none !important; }
        }
      `}</style>

      <div className="page">
        {/* Replace with <UpperNav /> */}

        {/* ── HERO ── */}
        <div className="hero">
          <div className="hero-tag">
            <span className="hero-tag-line" />
            Jewellery · Curated Combos
          </div>
          <h1>Build Your <em>Perfect</em><br />Jewellery Set</h1>
          <p>Choose a curated combo and swap pieces to your liking — or build something entirely your own.</p>
        </div>

        {/* ── MODE BAR ── */}
        <div className="modebar">
          <div className="modetoggle">
            <button className={`modebtn${mode === 'preset' ? ' on' : ''}`} onClick={() => setMode('preset')}>
              ◈ Curated Sets
            </button>
            <button className={`modebtn${mode === 'custom' ? ' on' : ''}`} onClick={() => setMode('custom')}>
              ✦ Build Your Own
            </button>
          </div>
          <p className="modehint">
            {mode === 'preset'
              ? 'Pick a pre-curated combo at a bundled price, then swap individual pieces to match your taste.'
              : 'Choose categories freely and pick as many products as you like.'}
          </p>
        </div>

        {/* ── CONTENT ── */}
        <div className="layout">

          {/* LEFT COLUMN */}
          <div>
            {mode === 'preset' && (
              <>
                <p className="slbl">Choose a Combo Set</p>

                {/* COMBO GRID — cards with inline mobile pickers */}
                <div className="cgrid">
                  {PRESET_COMBOS.map(c => (
                    <ComboCard
                      key={c.id}
                      combo={c}
                      selected={selectedComboId === c.id}
                      onSelect={handleComboSelect}
                      comboSelections={comboSelections}
                      onPresetSelection={handlePresetSelection}
                    />
                  ))}
                </div>

                {/* Desktop accordion — hidden on mobile */}
                <div className="desktop-only">
                  <p className="slbl">Swap Pieces in Your Set</p>
                  <div className="custblock">
                    <div className="custhead">
                      <span className="custtitle">{selectedCombo?.name}</span>
                      <span className="custsub">Expand a category to swap</span>
                    </div>
                    {selectedCombo?.includedCategories.map(cat => (
                      <Accordion
                        key={cat}
                        catKey={cat}
                        products={PRODUCTS_BY_CATEGORY[cat] ?? []}
                        selectedId={comboSelections[cat]}
                        onSelect={handlePresetSelection}
                      />
                    ))}
                  </div>
                </div>
              </>
            )}

            {mode === 'custom' && (
              <>
                <p className="slbl">Select Your Categories</p>
                <div className="catpills">
                  {ALL_CATEGORIES.map(cat => (
                    <button
                      key={cat}
                      className={`catpill${customCategories.includes(cat) ? ' on' : ''}`}
                      onClick={() => setCustomCategories(prev =>
                        prev.includes(cat) ? prev.filter(c => c !== cat) : [...prev, cat]
                      )}
                    >
                      {customCategories.includes(cat) ? '✓ ' : '+ '}{CATEGORY_LABELS[cat]}
                    </button>
                  ))}
                </div>

                {customCategories.length > 0 && (
                  <>
                    <p className="slbl">Choose Products</p>
                    <div className="customblock">
                      {customCategories.map(cat => (
                        <AccordionMulti
                          key={cat}
                          catKey={cat}
                          products={PRODUCTS_BY_CATEGORY[cat] ?? []}
                          selectedIds={customSelectedIds[cat] ?? []}
                          onToggle={handleCustomToggle}
                        />
                      ))}
                    </div>
                  </>
                )}
              </>
            )}
          </div>

          {/* RIGHT — SUMMARY */}
          <div>
            <div className="summary">
              <div className="sum-head">
                <div className="sum-title">Your Combo</div>
                <span className="sum-modetag">
                  {mode === 'preset' ? '◈ Curated Set' : '✦ Custom Build'}
                </span>
              </div>
              <div className="sum-body">
                <div className="sum-list">
                  {summaryItems.length === 0 ? (
                    <p className="sum-empty">No items selected yet.</p>
                  ) : summaryItems.map(({ k, p }) => (
                    <div key={`${k}-${p.id}`} className="sum-row">
                      <img className="sum-thumb" src={p.image} alt={p.name} />
                      <div className="sum-info">
                        <span className="sum-cat">{CATEGORY_LABELS[k]}</span>
                        <span className="sum-name">{p.name}</span>
                      </div>
                      {mode === 'preset'
                        ? <span className="sum-check">✓</span>
                        : <span className="sum-price">₹{p.price.toLocaleString('en-IN')}</span>
                      }
                    </div>
                  ))}
                </div>

                <div className="sum-divider" />

                <div className="sum-total-row">
                  <span className="sum-total-lbl">Total</span>
                  <span className="sum-total-val">₹{totalPrice.toLocaleString('en-IN')}</span>
                </div>

                {savings > 0 && (
                  <p className="sum-saving">🎉 You save ₹{savings.toLocaleString('en-IN')} on this set</p>
                )}

                <button
                  ref={cartBtnRef}
                  className={`btn-cart${cartAdded ? ' done' : ''}`}
                  onClick={handleAddToCart}
                  disabled={!hasItems}
                >
                  {cartAdded ? (
                    <>
                      <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                        <polyline points="20 6 9 17 4 12"/>
                      </svg>
                      Added to Cart!
                    </>
                  ) : (
                    <>
                      <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M6 2L3 6v14a2 2 0 002 2h14a2 2 0 002-2V6l-3-4z"/>
                        <line x1="3" y1="6" x2="21" y2="6"/>
                        <path d="M16 10a4 4 0 01-8 0"/>
                      </svg>
                      Add Combo to Cart
                    </>
                  )}
                </button>

                <button className="btn-buy" onClick={handleBuyNow} disabled={!hasItems}>
                  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
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