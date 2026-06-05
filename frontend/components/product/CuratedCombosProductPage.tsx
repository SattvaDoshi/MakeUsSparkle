

// 'use client';

// import { useState, useMemo, useCallback, useRef, type ChangeEvent } from 'react';
// import UpperNav from '@/components/ui/UpperNav';
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
//     id: 'festive', name: 'Festive Glow', tagline: 'Celebrate every moment',
//     price: 2999, originalPrice: 4500,
//     image: 'https://images.unsplash.com/photo-1602173574767-37ac01994b2a?w=800&q=90',
//     badge: 'Most Loved', tint: '#c8a84b',
//     includedCategories: ['necklace', 'earrings', 'bracelets'],
//     defaultSelections: { necklace: 1, earrings: 4, bracelets: 7 },
//   },
//   {
//     id: 'bridal', name: 'Bridal Radiance', tagline: 'For your most beautiful day',
//     price: 5999, originalPrice: 8800,
//     image: 'https://images.unsplash.com/photo-1573408301185-9519f94816b5?w=800&q=90',
//     badge: 'Premium', tint: '#b07d62',
//     includedCategories: ['necklace', 'earrings', 'rings', 'bracelets'],
//     defaultSelections: { necklace: 2, earrings: 4, rings: 10, bracelets: 8 },
//   },
//   {
//     id: 'minimal', name: 'Minimal Edit', tagline: 'Less is more, always',
//     price: 1999, originalPrice: 2800,
//     image: 'https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?w=800&q=90',
//     badge: 'New', tint: '#6b7c45',
//     includedCategories: ['necklace', 'earrings'],
//     defaultSelections: { necklace: 1, earrings: 5 },
//   },
//   {
//     id: 'gifting', name: 'Gifting Special', tagline: 'Curated with love',
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
//    PERSONALISE PANEL
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
//           ? <img src={preview} alt="preview" style={{ width: 24, height: 24, objectFit: 'cover', borderRadius: 4 }} />
//           : <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
//               <rect x="3" y="3" width="18" height="18" rx="3" />
//               <circle cx="8.5" cy="8.5" r="1.5" />
//               <polyline points="21 15 16 10 5 21" />
//             </svg>
//         }
//         <span>{preview ? 'Change photo' : 'Upload photo'}</span>
//       </label>
//     </div>
//   );
// }

// /* ─────────────────────────────────────────────────────────────
//    PRODUCT CARD (compact)
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
//             <svg width="8" height="8" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="3.5">
//               <polyline points="20 6 9 17 4 12" />
//             </svg>
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
//    ACCORDION — single-select (desktop)
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
//         <svg className={`acc-chevron${open ? ' open' : ''}`} width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
//           <polyline points="6 9 12 15 18 9" />
//         </svg>
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
//    ACCORDION — multi-select (desktop)
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
//         <svg className={`acc-chevron${open ? ' open' : ''}`} width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
//           <polyline points="6 9 12 15 18 9" />
//         </svg>
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
//    COMBO CARD — with inline mobile product picker
//    KEY CHANGE: On mobile, clicking the card shows a product
//    selector IMMEDIATELY BELOW the card (not at bottom of page)
// ───────────────────────────────────────────────────────────── */
// interface ComboCardProps {
//   combo: PresetCombo;
//   selected: boolean;
//   onSelect: (id: string) => void;
//   // Mobile inline picker props
//   comboSelections: Partial<Record<CategoryKey, number>>;
//   onPresetSelection: (k: CategoryKey, id: number) => void;
// }

// function ComboCard({ combo, selected, onSelect, comboSelections, onPresetSelection }: ComboCardProps) {
//   const pct = Math.round(((combo.originalPrice - combo.price) / combo.originalPrice) * 100);
//   const [mobileExpanded, setMobileExpanded] = useState(false);
//   const [activeCat, setActiveCat] = useState<CategoryKey | null>(null);

//   const handleCardClick = () => {
//     onSelect(combo.id);
//     // On mobile, toggle the inline picker
//     if (selected) {
//       setMobileExpanded(o => !o);
//     } else {
//       setMobileExpanded(true);
//     }
//     setActiveCat(null);
//   };

//   return (
//     <div className={`ccard-wrap${selected ? ' sel' : ''}`}>
//       <button
//         className={`ccard${selected ? ' sel' : ''}`}
//         onClick={handleCardClick}
//         style={{ '--t': combo.tint } as React.CSSProperties}
//       >
//         <div className="ccard-img">
//           <img src={combo.image} alt={combo.name} />
//           <div className="ccard-grad" />
//           <span className="ccard-badge">{combo.badge}</span>
//           <span className="ccard-disc">{pct}% off</span>
//           {selected && <div className="ccard-ring" />}
//           <div className="ccard-overlay-text">
//             <span className="ccard-name">{combo.name}</span>
//             <span className="ccard-tagline">{combo.tagline}</span>
//           </div>
//         </div>
//         <div className="ccard-bar" style={{ background: combo.tint }} />
//         <div className="ccard-foot">
//           <div className="ccard-price-row">
//             <span className="ccard-price">₹{combo.price.toLocaleString('en-IN')}</span>
//             <span className="ccard-was">₹{combo.originalPrice.toLocaleString('en-IN')}</span>
//           </div>
//           <div className="ccard-chips">
//             {combo.includedCategories.map(c => (
//               <span key={c} className="ccard-chip">{CATEGORY_LABELS[c]}</span>
//             ))}
//           </div>
//           {/* Mobile hint */}
//           <div className="ccard-mobile-hint">
//             {selected
//               ? <span>{mobileExpanded ? '▲ Hide options' : '▼ Customise pieces'}</span>
//               : <span>Tap to select & customise</span>
//             }
//           </div>
//         </div>
//       </button>

//       {/* ── MOBILE INLINE PRODUCT PICKER ── */}
//       {selected && mobileExpanded && (
//         <div className="mobile-picker">
//           <div className="mobile-picker-head">
//             <span className="mobile-picker-title">Swap Pieces · {combo.name}</span>
//             <button className="mobile-picker-close" onClick={() => setMobileExpanded(false)}>
//               <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
//                 <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
//               </svg>
//             </button>
//           </div>

//           {/* Category tabs */}
//           <div className="mobile-cat-tabs">
//             {combo.includedCategories.map(cat => {
//               const selId = comboSelections[cat];
//               const selProd = PRODUCTS_BY_CATEGORY[cat]?.find(p => p.id === selId);
//               return (
//                 <button
//                   key={cat}
//                   className={`mobile-cat-tab${activeCat === cat ? ' on' : ''}${selProd ? ' done' : ''}`}
//                   onClick={() => setActiveCat(activeCat === cat ? null : cat)}
//                 >
//                   {selProd ? (
//                     <svg width="9" height="9" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
//                       <polyline points="20 6 9 17 4 12"/>
//                     </svg>
//                   ) : null}
//                   {CATEGORY_LABELS[cat]}
//                 </button>
//               );
//             })}
//           </div>

//           {/* Product grid for active category */}
//           {activeCat && (
//             <div className="mobile-prod-section">
//               <div className="mobile-pgrid">
//                 {(PRODUCTS_BY_CATEGORY[activeCat] ?? []).map(p => {
//                   const isSelected = comboSelections[activeCat] === p.id;
//                   return (
//                     <button
//                       key={p.id}
//                       className={`mobile-prod${isSelected ? ' on' : ''}`}
//                       onClick={() => onPresetSelection(activeCat, p.id)}
//                     >
//                       <div className="mobile-prod-img">
//                         <img src={p.image} alt={p.name} />
//                         {isSelected && (
//                           <span className="mobile-prod-tick">
//                             <svg width="8" height="8" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="3.5">
//                               <polyline points="20 6 9 17 4 12"/>
//                             </svg>
//                           </span>
//                         )}
//                       </div>
//                       <span className="mobile-prod-name">{p.name}</span>
//                       <span className="mobile-prod-price">₹{p.price.toLocaleString('en-IN')}</span>
//                     </button>
//                   );
//                 })}
//               </div>
//               {/* Personalise if customisable */}
//               {(() => {
//                 const selId = comboSelections[activeCat];
//                 const selProd = PRODUCTS_BY_CATEGORY[activeCat]?.find(p => p.id === selId);
//                 return selProd?.customisable ? <PersonalisePanel productName={selProd.name} /> : null;
//               })()}
//             </div>
//           )}
//         </div>
//       )}
//     </div>
//   );
// }

// /* ─────────────────────────────────────────────────────────────
//    MAIN PAGE
// ───────────────────────────────────────────────────────────── */
// export default function CuratedCombosPage({ gender = 'women' }: { gender?: string }) {
//   // NOTE: Replace these with your actual imports:
//   // import { useCart } from '@/lib/cartContext';
//   // import { fireConfetti } from '@/components/cart/ConfettiManager';
//   // import UpperNav from '@/components/ui/UpperNav';
//   // import { useRouter } from 'next/navigation';

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

//   function handleAddToCart() {
//     if (!hasItems) return;
//     // Replace with your actual cart logic:
//     // addItem(...);
//     // fireConfetti(cartBtnRef.current);
//     setCartAdded(true);
//     setTimeout(() => setCartAdded(false), 1800);
//   }

//   function handleBuyNow() {
//     if (!hasItems) return;
//     handleAddToCart();
//     // setTimeout(() => router.push('/checkout'), 150);
//   }

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
//           --card-r:   14px;
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
//           margin-top: 45px
//           padding: clamp(40px, 4vw, 56px) clamp(16px, 5vw, 60px) clamp(22px, 3vw, 38px);
//           background: linear-gradient(160deg, #f7f4ee 0%, #f0e9da 55%, #f7f4ee 100%);
//           border-bottom: 1px solid var(--bdr);
//           position: relative; overflow: hidden;
//           animation: up .5s ease both;
//         }
//         .hero::before {
//           content: ''; position: absolute; right: -60px; top: -60px;
//           width: 300px; height: 300px; border-radius: 50%;
//           background: radial-gradient(circle, rgba(199,167,72,.12) 0%, transparent 68%);
//           pointer-events: none;
//         }
//         .hero-tag {
//           display: flex; align-items: center; gap: 10px;
//           font-size: 8.5px; letter-spacing: .42em; text-transform: uppercase;
//           color: var(--gold); font-weight: 500; margin-bottom: 12px;
//         }
//         .hero-tag-line { width: 24px; height: 1px; background: var(--gold); opacity: .5; }
//         .hero h1 {
//           font-family: var(--ffd);
//           font-size: clamp(1.6rem, 4vw, 3.2rem);
//           font-weight: 500; color: var(--olive);
//           line-height: 1.1; letter-spacing: -.02em;
//           margin-bottom: 10px;
//         }
//         .hero h1 em { font-style: italic; color: var(--gold); }
//         .hero p {
//           font-size: clamp(11px, 1.3vw, 13px); font-weight: 300;
//           color: var(--ink6); max-width: 440px; line-height: 1.8;
//         }

//         /* ── MODE BAR ── */
//         .modebar {
//           padding: clamp(16px, 3vw, 26px) clamp(16px, 5vw, 60px) 0;
//           display: flex; align-items: flex-start; gap: 16px; flex-wrap: wrap;
//           animation: up .5s ease .07s both;
//         }
//         .modetoggle {
//           display: flex; background: var(--surf);
//           border: 1.5px solid var(--bdr2); border-radius: 50px;
//           padding: 4px; gap: 3px;
//           box-shadow: 0 2px 10px rgba(27,31,14,.1); flex-shrink: 0;
//         }
//         .modebtn {
//           font-size: 9.5px; font-weight: 600; letter-spacing: .13em; text-transform: uppercase;
//           padding: clamp(8px,1.5vw,10px) clamp(14px,2.5vw,22px);
//           border-radius: 50px; border: none; background: transparent;
//           color: var(--ink6); transition: all .25s;
//         }
//         .modebtn.on {
//           background: var(--olive); color: #fff;
//           box-shadow: 0 3px 12px rgba(73,88,31,.35);
//         }
//         .modehint {
//           font-size: 11px; font-weight: 300; color: var(--ink6);
//           line-height: 1.7; max-width: 440px; padding-top: 12px;
//         }

//         /* ── LAYOUT ── */
//         .layout {
//           display: grid;
//           grid-template-columns: 1fr 320px;
//           gap: 20px;
//           padding: clamp(16px,3vw,26px) clamp(16px,5vw,60px) 64px;
//           align-items: start;
//           animation: up .5s ease .13s both;
//         }

//         /* ── SECTION LABEL ── */
//         .slbl {
//           font-size: 8px; letter-spacing: .4em; text-transform: uppercase;
//           color: var(--ink3); font-weight: 500; margin-bottom: 12px;
//           display: flex; align-items: center; gap: 10px;
//         }
//         .slbl::after { content: ''; flex: 1; height: 1px; background: var(--bdr); }

//         /* ══════════════════════════════════════
//            COMBO CARDS — reduced size
//         ══════════════════════════════════════ */
//         .cgrid {
//           display: grid;
//           grid-template-columns: repeat(2, 1fr);
//           gap: 10px;
//           margin-bottom: 28px;
//         }

//         /* wrapper holds card + mobile inline picker */
//         .ccard-wrap {
//           display: flex; flex-direction: column;
//           border-radius: var(--card-r);
//           overflow: hidden;
//         }
//         .ccard-wrap.sel {
//           box-shadow: 0 0 0 2px var(--gold), 0 8px 28px rgba(27,31,14,.14);
//           border-radius: var(--card-r);
//         }

//         .ccard {
//           position: relative; padding: 0; border: 2px solid transparent;
//           background: var(--surf); border-radius: var(--card-r);
//           overflow: hidden; text-align: left; width: 100%;
//           box-shadow: 0 1px 8px rgba(27,31,14,.08);
//           transition: transform .2s cubic-bezier(.34,1.3,.64,1), box-shadow .2s;
//           outline: none;
//         }
//         .ccard-wrap.sel .ccard {
//           border-radius: var(--card-r) var(--card-r) 0 0;
//           border-bottom-left-radius: 0;
//           border-bottom-right-radius: 0;
//         }
//         .ccard:hover {
//           transform: translateY(-3px) scale(1.01);
//           box-shadow: 0 10px 32px rgba(27,31,14,.14);
//         }

//         /* image — compact */
//         .ccard-img { position: relative; aspect-ratio: 4 / 2.6; overflow: hidden; }
//         .ccard-img img {
//           width: 100%; height: 100%; object-fit: cover;
//           transition: transform .5s ease;
//         }
//         .ccard:hover .ccard-img img { transform: scale(1.07); }
//         .ccard-grad {
//           position: absolute; inset: 0;
//           background: linear-gradient(to bottom, rgba(0,0,0,.02) 0%, rgba(0,0,0,.6) 100%);
//         }
//         .ccard-badge {
//           position: absolute; top: 7px; left: 7px;
//           background: rgba(255,255,255,.92);
//           color: var(--ink); font-size: 7px; font-weight: 700;
//           letter-spacing: .14em; text-transform: uppercase;
//           padding: 2px 7px; border-radius: 50px;
//           backdrop-filter: blur(4px);
//         }
//         .ccard-disc {
//           position: absolute; top: 7px; right: 7px;
//           color: #fff; font-size: 7px; font-weight: 700;
//           background: var(--t, var(--gold));
//           padding: 2px 7px; border-radius: 50px;
//         }
//         .ccard-ring {
//           position: absolute; inset: 0;
//           border: 2px solid var(--t, var(--gold));
//           pointer-events: none;
//         }
//         .ccard-overlay-text {
//           position: absolute; bottom: 0; left: 0; right: 0;
//           padding: 8px 10px;
//           display: flex; flex-direction: column; gap: 1px;
//         }
//         .ccard-name {
//           font-family: var(--ffd); font-size: .88rem; font-weight: 500;
//           color: #fff; line-height: 1.2;
//           text-shadow: 0 1px 4px rgba(0,0,0,.35);
//         }
//         .ccard-tagline { font-size: 8px; color: rgba(255,255,255,.65); letter-spacing: .04em; }

//         .ccard-bar { height: 2.5px; }
//         .ccard-foot { padding: 7px 10px 9px; }
//         .ccard-price-row { display: flex; align-items: baseline; gap: 6px; margin-bottom: 5px; }
//         .ccard-price { font-family: var(--ffd); font-size: .95rem; font-weight: 600; color: var(--ink); }
//         .ccard-was { font-size: 9.5px; color: var(--ink3); text-decoration: line-through; }
//         .ccard-chips { display: flex; flex-wrap: wrap; gap: 3px; margin-bottom: 4px; }
//         .ccard-chip {
//           font-size: 6.5px; font-weight: 500; letter-spacing: .09em; text-transform: uppercase;
//           color: var(--ink6); border: 1px solid var(--bdr);
//           padding: 1.5px 5px; border-radius: 50px;
//         }
//         .ccard-wrap.sel .ccard-chip {
//           border-color: rgba(199,167,72,.4); color: var(--olive);
//         }
//         /* Mobile hint — only visible on mobile */
//         .ccard-mobile-hint {
//           display: none;
//           font-size: 8.5px; color: var(--gold); font-weight: 600;
//           letter-spacing: .06em; margin-top: 2px;
//         }

//         /* ── MOBILE INLINE PICKER ── */
//         .mobile-picker {
//           background: var(--olivedim);
//           border-top: 1px solid rgba(199,167,72,.3);
//           padding: 0;
//           border-radius: 0 0 var(--card-r) var(--card-r);
//           animation: slideDown .22s ease;
//           overflow: hidden;
//         }
//         @keyframes slideDown {
//           from { opacity: 0; transform: translateY(-8px); }
//           to   { opacity: 1; transform: translateY(0); }
//         }
//         .mobile-picker-head {
//           display: flex; align-items: center; justify-content: space-between;
//           padding: 9px 12px 6px;
//           border-bottom: 1px solid var(--bdr);
//           background: linear-gradient(135deg, var(--olivedim), #f0e8d8);
//         }
//         .mobile-picker-title {
//           font-size: 9px; font-weight: 700; letter-spacing: .1em; text-transform: uppercase;
//           color: var(--olive);
//         }
//         .mobile-picker-close {
//           background: transparent; border: none; color: var(--ink3); padding: 3px;
//           display: flex; align-items: center; justify-content: center;
//           border-radius: 50%; transition: background .15s;
//         }
//         .mobile-picker-close:hover { background: var(--bdr); }

//         /* Category tabs */
//         .mobile-cat-tabs {
//           display: flex; gap: 6px; flex-wrap: wrap;
//           padding: 8px 12px 6px;
//         }
//         .mobile-cat-tab {
//           font-size: 8.5px; font-weight: 600; letter-spacing: .1em; text-transform: uppercase;
//           padding: 5px 11px; border-radius: 50px;
//           border: 1.5px solid var(--bdr2);
//           background: var(--surf); color: var(--ink6);
//           transition: all .18s;
//           display: flex; align-items: center; gap: 4px;
//         }
//         .mobile-cat-tab.on { background: var(--olive); color: #fff; border-color: var(--olive); }
//         .mobile-cat-tab.done { border-color: var(--gold); color: var(--olive2); }
//         .mobile-cat-tab.on.done { background: var(--olive); color: #fff; }

//         /* Mobile product grid */
//         .mobile-prod-section { padding: 6px 12px 12px; }
//         .mobile-pgrid {
//           display: grid;
//           grid-template-columns: repeat(3, 1fr);
//           gap: 7px; margin-bottom: 8px;
//         }
//         .mobile-prod {
//           background: var(--surf); border: 1.5px solid var(--bdr);
//           border-radius: 10px; overflow: hidden;
//           padding: 0; text-align: left;
//           transition: border-color .18s, box-shadow .18s;
//           display: flex; flex-direction: column;
//         }
//         .mobile-prod:hover { border-color: var(--olive2); }
//         .mobile-prod.on { border-color: var(--gold); box-shadow: 0 0 0 2px rgba(199,167,72,.2); }
//         .mobile-prod-img { position: relative; aspect-ratio: 1; overflow: hidden; }
//         .mobile-prod-img img { width: 100%; height: 100%; object-fit: cover; }
//         .mobile-prod-tick {
//           position: absolute; top: 4px; right: 4px;
//           width: 16px; height: 16px; border-radius: 50%;
//           background: var(--gold); display: flex; align-items: center; justify-content: center;
//         }
//         .mobile-prod-name {
//           display: block; font-size: 8.5px; font-weight: 500; color: var(--ink);
//           padding: 4px 6px 1px; line-height: 1.3;
//         }
//         .mobile-prod-price {
//           display: block; font-size: 9px; font-weight: 600; color: var(--olive2);
//           padding: 0 6px 5px;
//         }

//         /* ── CUSTOMISE BLOCK (desktop accordion) ── */
//         .custblock {
//           background: var(--surf); border: 1.5px solid var(--bdr);
//           border-radius: var(--card-r); overflow: hidden;
//           box-shadow: 0 1px 8px rgba(27,31,14,.07);
//         }
//         .custhead {
//           padding: 11px 18px; border-bottom: 1px solid var(--bdr);
//           background: linear-gradient(135deg, var(--olivedim), #f3ede0);
//           display: flex; align-items: center; justify-content: space-between;
//         }
//         .custtitle { font-family: var(--ffd); font-size: .92rem; font-weight: 500; color: var(--olive); }
//         .custsub { font-size: 9px; color: var(--ink6); letter-spacing: .04em; }

//         /* ── ACCORDION ── */
//         .acc { border-bottom: 1px solid var(--bdr); }
//         .acc:last-child { border-bottom: none; }
//         .acc-head {
//           width: 100%; display: flex; align-items: center; gap: 10px;
//           padding: 11px 18px; background: transparent; border: none; text-align: left;
//           transition: background .15s;
//         }
//         .acc-head:hover { background: var(--olivedim); }
//         .acc-cat {
//           font-size: 9.5px; font-weight: 600; letter-spacing: .1em; text-transform: uppercase;
//           color: var(--olive); flex-shrink: 0; width: 96px;
//         }
//         .acc-info { flex: 1; font-size: 10px; color: var(--ink6); white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
//         .acc-info.dim { color: var(--ink3); font-style: italic; }
//         .acc-info strong { color: var(--ink); font-weight: 600; }
//         .acc-chevron { color: var(--ink3); transition: transform .22s; flex-shrink: 0; }
//         .acc-chevron.open { transform: rotate(180deg); }
//         .acc-body { padding: 7px 18px 14px; }

//         /* ── PRODUCT GRID ── */
//         .pgrid {
//           display: grid;
//           grid-template-columns: repeat(auto-fill, minmax(100px, 1fr));
//           gap: 8px; margin-bottom: 8px;
//         }
//         .pcard {
//           background: #fff; border: 1.5px solid var(--bdr);
//           border-radius: 10px; overflow: hidden; padding: 0; text-align: left;
//           transition: border-color .18s, box-shadow .18s, transform .18s;
//         }
//         .pcard:hover { border-color: var(--olive2); box-shadow: 0 3px 10px rgba(27,31,14,.1); transform: translateY(-1px); }
//         .pcard.on { border-color: var(--gold); box-shadow: 0 0 0 2px rgba(199,167,72,.2); }
//         .pcard-img { position: relative; aspect-ratio: 1; overflow: hidden; }
//         .pcard-img img { width: 100%; height: 100%; object-fit: cover; transition: transform .3s; }
//         .pcard:hover .pcard-img img { transform: scale(1.08); }
//         .pcard-tick {
//           position: absolute; top: 5px; right: 5px;
//           width: 17px; height: 17px; border-radius: 50%;
//           background: var(--gold); display: flex; align-items: center; justify-content: center;
//         }
//         .pcard-foot { padding: 5px 7px 7px; }
//         .pcard-name { display: block; font-size: 9px; font-weight: 500; color: var(--ink); line-height: 1.3; margin-bottom: 1px; }
//         .pcard-price { display: block; font-size: 9.5px; font-weight: 600; color: var(--olive); }

//         /* ── PERSONALISE ── */
//         .pers-panel {
//           background: linear-gradient(135deg, rgba(199,167,72,.07), rgba(73,88,31,.04));
//           border: 1px solid rgba(199,167,72,.2);
//           border-radius: 9px; padding: 10px 12px; margin-top: 4px;
//         }
//         .pers-label { font-size: 8.5px; font-weight: 700; letter-spacing: .12em; text-transform: uppercase; color: #896018; margin-bottom: 7px; }
//         .pers-input {
//           width: 100%; border: 1.5px solid var(--bdr2); border-radius: 6px;
//           padding: 7px 10px; font-family: var(--ffb); font-size: 10.5px;
//           color: var(--ink); background: #fff; outline: none;
//           margin-bottom: 6px; transition: border-color .2s;
//         }
//         .pers-input:focus { border-color: var(--olive2); }
//         .pers-input::placeholder { color: var(--ink3); }
//         .pers-upload {
//           display: inline-flex; align-items: center; gap: 5px;
//           font-size: 8.5px; font-weight: 600; letter-spacing: .1em; text-transform: uppercase;
//           color: var(--olive); border: 1.5px dashed var(--bdr2);
//           border-radius: 6px; padding: 5px 10px; cursor: pointer; background: #fff;
//           transition: border-color .2s, background .2s;
//         }
//         .pers-upload:hover { border-color: var(--olive2); background: var(--olivedim); }

//         /* ── CATEGORY PILLS (custom mode) ── */
//         .catpills { display: flex; flex-wrap: wrap; gap: 7px; margin-bottom: 18px; }
//         .catpill {
//           font-size: 9px; font-weight: 500; letter-spacing: .1em; text-transform: uppercase;
//           color: var(--ink6); padding: 7px 14px;
//           border: 1.5px solid var(--bdr2); border-radius: 50px;
//           background: transparent; transition: all .2s;
//         }
//         .catpill:hover { color: var(--olive); border-color: var(--olive2); background: var(--olivedim); }
//         .catpill.on { background: var(--olive); color: #fff; border-color: var(--olive); }
//         .customblock {
//           background: var(--surf); border: 1.5px solid var(--bdr);
//           border-radius: var(--card-r); overflow: hidden;
//           box-shadow: 0 1px 8px rgba(27,31,14,.07);
//         }

//         /* ── SUMMARY ── */
//         .summary {
//           position: sticky; top: 72px;
//           background: var(--surf); border: 1.5px solid var(--bdr);
//           border-radius: var(--card-r); overflow: hidden;
//           box-shadow: 0 4px 20px rgba(27,31,14,.1);
//         }
//         .sum-head {
//           padding: 16px 18px 12px;
//           background: linear-gradient(135deg, var(--olivedim), #f0e8d8);
//           border-bottom: 1px solid var(--bdr);
//           position: relative; overflow: hidden;
//         }
//         .sum-head::after {
//           content: '◈'; position: absolute; right: 14px; top: 50%;
//           transform: translateY(-50%); font-size: 32px;
//           color: rgba(199,167,72,.1); pointer-events: none; line-height: 1;
//         }
//         .sum-title { font-family: var(--ffd); font-size: 1rem; font-weight: 500; color: var(--olive); }
//         .sum-modetag {
//           display: block; font-size: 8px; font-weight: 700;
//           letter-spacing: .2em; text-transform: uppercase; color: var(--gold); margin-top: 2px;
//         }
//         .sum-body { padding: 12px 18px 16px; }
//         .sum-list { margin-bottom: 12px; max-height: 240px; overflow-y: auto; }
//         .sum-list::-webkit-scrollbar { width: 3px; }
//         .sum-list::-webkit-scrollbar-thumb { background: var(--bdr2); border-radius: 2px; }
//         .sum-row {
//           display: flex; align-items: center; gap: 8px;
//           padding: 7px 0; border-bottom: 1px solid rgba(27,31,14,.05);
//         }
//         .sum-row:last-child { border-bottom: none; }
//         .sum-thumb {
//           width: 34px; height: 34px; border-radius: 7px; object-fit: cover;
//           border: 1px solid var(--bdr); flex-shrink: 0;
//         }
//         .sum-info { flex: 1; min-width: 0; }
//         .sum-cat { font-size: 7px; letter-spacing: .14em; text-transform: uppercase; color: var(--ink3); display: block; }
//         .sum-name { font-size: 10px; font-weight: 500; color: var(--ink); display: block; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
//         .sum-price { font-size: 10px; font-weight: 600; color: var(--olive); flex-shrink: 0; }
//         .sum-check {
//           width: 18px; height: 18px; border-radius: 50%;
//           background: var(--olivedim); display: flex; align-items: center; justify-content: center;
//           font-size: 9px; color: var(--olive); flex-shrink: 0;
//         }
//         .sum-empty {
//           text-align: center; font-family: var(--ffd); font-style: italic;
//           font-size: 11.5px; color: var(--ink3); padding: 16px 0;
//         }
//         .sum-divider {
//           height: 1px; margin: 10px 0;
//           background: linear-gradient(90deg, transparent, var(--gold2), transparent);
//         }
//         .sum-total-row { display: flex; justify-content: space-between; align-items: baseline; margin-bottom: 3px; }
//         .sum-total-lbl { font-size: 8.5px; font-weight: 600; letter-spacing: .14em; text-transform: uppercase; color: var(--ink6); }
//         .sum-total-val { font-family: var(--ffd); font-size: 1.5rem; font-weight: 600; color: var(--ink); }
//         .sum-saving { font-size: 10.5px; font-weight: 500; color: var(--green); margin-bottom: 13px; }

//         /* ── BUTTONS ── */
//         .btn-cart {
//           width: 100%; display: flex; align-items: center; justify-content: center; gap: 7px;
//           font-size: 9.5px; font-weight: 700; letter-spacing: .16em; text-transform: uppercase;
//           color: #fff; background: var(--olive); border: none;
//           border-radius: 50px; padding: 13px; margin-bottom: 8px;
//           box-shadow: 0 3px 12px rgba(73,88,31,.28);
//           transition: background .2s, transform .15s, box-shadow .2s;
//         }
//         .btn-cart:hover:not(:disabled) { background: #384a14; transform: translateY(-1px); }
//         .btn-cart:disabled { opacity: .45; cursor: not-allowed; }
//         .btn-cart.done { background: var(--green) !important; }

//         .btn-buy {
//           width: 100%; display: flex; align-items: center; justify-content: center; gap: 7px;
//           font-size: 9.5px; font-weight: 700; letter-spacing: .16em; text-transform: uppercase;
//           color: var(--ink); background: var(--gold2);
//           border: 1.5px solid var(--gold); border-radius: 50px; padding: 12px;
//           transition: all .2s;
//         }
//         .btn-buy:hover:not(:disabled) { background: var(--gold); color: #fff; transform: translateY(-1px); }
//         .btn-buy:disabled { opacity: .45; cursor: not-allowed; }

//         .perks { display: flex; justify-content: center; gap: 12px; margin-top: 12px; flex-wrap: wrap; }
//         .perk { font-size: 8.5px; color: var(--ink3); display: flex; align-items: center; gap: 3px; }
//         .perk-dot { width: 3px; height: 3px; border-radius: 50%; background: var(--gold); opacity: .6; }

//         /* ── ANIMATIONS ── */
//         @keyframes up {
//           from { opacity: 0; transform: translateY(14px); }
//           to   { opacity: 1; transform: translateY(0); }
//         }

//         /* ══════════════════════════════════════
//            RESPONSIVE
//         ══════════════════════════════════════ */

//         /* Tablet */
//         @media (max-width: 1024px) {
//           .layout {
//             grid-template-columns: 1fr;
//           }
//           .summary { position: static; }
//         }

//         /* Mobile ≤ 680px — show mobile picker, hide desktop accordion */
//         @media (max-width: 680px) {
//           .hero, .modebar, .layout { padding-left: 14px; padding-right: 14px; }
//           .hero { padding-top: 40px; padding-bottom: 20px; }
//           .modebar { padding-top: 14px; }
//           .layout { padding-top: 16px; padding-bottom: 40px; gap: 14px; }

//           .cgrid {
//             grid-template-columns: 1fr 1fr;
//             gap: 8px;
//           }

//           /* Show mobile hint on cards */
//           .ccard-mobile-hint { display: block; }

//           /* Hide desktop accordion on mobile, show mobile picker instead */
//           .desktop-only { display: none !important; }

//           .modebtn { padding: 7px 12px; font-size: 9px; }

//           /* Mobile product grid: 3 columns */
//           .mobile-pgrid {
//             grid-template-columns: repeat(3, 1fr);
//           }

//           /* Summary sticks at bottom on mobile as a floating bar */
//           .summary {
//             position: static;
//             border-radius: 14px;
//           }
//         }

//         @media (max-width: 400px) {
//           .cgrid { grid-template-columns: 1fr; }
//           .mobile-pgrid { grid-template-columns: repeat(2, 1fr); }
//         }

//         /* Tablet range: show desktop layout, hide mobile picker */
//         @media (min-width: 681px) {
//           .mobile-picker { display: none !important; }
//           .ccard-mobile-hint { display: none !important; }
//         }
//       `}</style>

//       <div className="page">
//         {/* Replace with <UpperNav /> */}
//            <UpperNav />  
//         {/* ── HERO ── */}
//         <div className="hero">
//           <div className="hero-tag">
//             <span className="hero-tag-line" />
//             {/* Jewellery · Curated Combos */}
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
//               ? 'Pick a pre-curated combo at a bundled price, then swap individual pieces to match your taste.'
//               : 'Choose categories freely and pick as many products as you like.'}
//           </p>
//         </div>

//         {/* ── CONTENT ── */}
//         <div className="layout">

//           {/* LEFT COLUMN */}
//           <div>
//             {mode === 'preset' && (
//               <>
//                 <p className="slbl">Choose a Combo Set</p>

//                 {/* COMBO GRID — cards with inline mobile pickers */}
//                 <div className="cgrid">
//                   {PRESET_COMBOS.map(c => (
//                     <ComboCard
//                       key={c.id}
//                       combo={c}
//                       selected={selectedComboId === c.id}
//                       onSelect={handleComboSelect}
//                       comboSelections={comboSelections}
//                       onPresetSelection={handlePresetSelection}
//                     />
//                   ))}
//                 </div>

//                 {/* Desktop accordion — hidden on mobile */}
//                 <div className="desktop-only">
//                   <p className="slbl">Swap Pieces in Your Set</p>
//                   <div className="custblock">
//                     <div className="custhead">
//                       <span className="custtitle">{selectedCombo?.name}</span>
//                       <span className="custsub">Expand a category to swap</span>
//                     </div>
//                     {selectedCombo?.includedCategories.map(cat => (
//                       <Accordion
//                         key={cat}
//                         catKey={cat}
//                         products={PRODUCTS_BY_CATEGORY[cat] ?? []}
//                         selectedId={comboSelections[cat]}
//                         onSelect={handlePresetSelection}
//                       />
//                     ))}
//                   </div>
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

//           {/* RIGHT — SUMMARY */}
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
//                       <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
//                         <polyline points="20 6 9 17 4 12"/>
//                       </svg>
//                       Added to Cart!
//                     </>
//                   ) : (
//                     <>
//                       <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
//                         <path d="M6 2L3 6v14a2 2 0 002 2h14a2 2 0 002-2V6l-3-4z"/>
//                         <line x1="3" y1="6" x2="21" y2="6"/>
//                         <path d="M16 10a4 4 0 01-8 0"/>
//                       </svg>
//                       Add Combo to Cart
//                     </>
//                   )}
//                 </button>

//                 <button className="btn-buy" onClick={handleBuyNow} disabled={!hasItems}>
//                   <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
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

import { useState, useMemo, useCallback, useRef, useEffect, type ChangeEvent } from 'react';
import { useRouter } from 'next/navigation';
import { useCart } from '@/lib/cartContext';
import UpperNav from '@/components/ui/UpperNav';
import SortFilter, { sortProducts, type SortOption } from '@/components/ui/SortFilter';
import { apiRequest } from '@/lib/api';

/* ─────────────────────────────────────────────────────────────
   TYPES
───────────────────────────────────────────────────────────── */
type CategoryKey = string;

interface ComboProduct {
  id: string;
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
  defaultSelections: Partial<Record<CategoryKey, string>>;
}

/* ─────────────────────────────────────────────────────────────
   DATA
───────────────────────────────────────────────────────────── */
/* ─────────────────────────────────────────────────────────────
   DATA (Now dynamic)
───────────────────────────────────────────────────────────── */

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
        <img src={product.image || '/images/hero.png'} alt={product.name} />
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
function Accordion({ catKey, categoryLabels, products, selectedId, onSelect, sortOption }: {
  catKey: CategoryKey; categoryLabels: Record<string, string>; products: ComboProduct[];
  selectedId?: string; onSelect: (k: CategoryKey, id: string) => void;
  sortOption: SortOption;
}) {
  const [open, setOpen] = useState(false);
  const sel = products.find(p => p.id === selectedId);
  const sorted = useMemo(() => sortProducts(products, sortOption), [products, sortOption]);

  return (
    <div className="acc">
      <button className="acc-head" onClick={() => setOpen(o => !o)}>
        <span className="acc-cat">{categoryLabels[catKey] || catKey}</span>
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
            {sorted.map(p => (
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
function AccordionMulti({ catKey, categoryLabels, products, selectedIds, onToggle, sortOption }: {
  catKey: CategoryKey; categoryLabels: Record<string, string>; products: ComboProduct[];
  selectedIds: string[]; onToggle: (k: CategoryKey, id: string) => void;
  sortOption: SortOption;
}) {
  const [open, setOpen] = useState(false);
  const count = selectedIds.length;
  const anyCustom = selectedIds.some(id => products.find(p => p.id === id)?.customisable);
  const sorted = useMemo(() => sortProducts(products, sortOption), [products, sortOption]);

  return (
    <div className="acc">
      <button className="acc-head" onClick={() => setOpen(o => !o)}>
        <span className="acc-cat">{categoryLabels[catKey] || catKey}</span>
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
            {sorted.map(p => (
              <ProdCard key={p.id} product={p} selected={selectedIds.includes(p.id)} onToggle={() => onToggle(catKey, p.id)} />
            ))}
          </div>
          {anyCustom && <PersonalisePanel productName={categoryLabels[catKey] || catKey} />}
        </div>
      )}
    </div>
  );
}

/* ─────────────────────────────────────────────────────────────
   COMBO CARD — with inline mobile product picker
───────────────────────────────────────────────────────────── */
interface ComboCardProps {
  combo: PresetCombo;
  selected: boolean;
  onSelect: (id: string) => void;
  comboSelections: Partial<Record<CategoryKey, string>>;
  onPresetSelection: (k: CategoryKey, id: string) => void;
  sortOption: SortOption;
  productsByCategory: Record<string, ComboProduct[]>;
  categoryLabels: Record<string, string>;
}

function ComboCard({ combo, selected, onSelect, comboSelections, onPresetSelection, sortOption, productsByCategory, categoryLabels }: ComboCardProps) {
  const pct = Math.round(((combo.originalPrice - combo.price) / combo.originalPrice) * 100);
  const [mobileExpanded, setMobileExpanded] = useState(false);
  const [activeCat, setActiveCat] = useState<CategoryKey | null>(null);

  const handleCardClick = () => {
    onSelect(combo.id);
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
          <img src={combo.image || '/images/hero.png'} alt={combo.name} />
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
              <span key={c} className="ccard-chip">{categoryLabels[c] || c}</span>
            ))}
          </div>
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

          <div className="mobile-cat-tabs">
            {combo.includedCategories.map(cat => {
              const selId = comboSelections[cat];
              const selProd = productsByCategory[cat]?.find(p => p.id === selId);
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
                  {categoryLabels[cat] || cat}
                </button>
              );
            })}
          </div>

          {activeCat && (
            <div className="mobile-prod-section">
              <div className="mobile-pgrid">
                {sortProducts(productsByCategory[activeCat] ?? [], sortOption).map(p => {
                  const isSelected = comboSelections[activeCat] === p.id;
                  return (
                    <button
                      key={p.id}
                      className={`mobile-prod${isSelected ? ' on' : ''}`}
                      onClick={() => onPresetSelection(activeCat, p.id)}
                    >
                      <div className="mobile-prod-img">
                        <img src={p.image || '/images/hero.png'} alt={p.name} />
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
              {(() => {
                const selId = comboSelections[activeCat];
                const selProd = productsByCategory[activeCat]?.find(p => p.id === selId);
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
export default function CuratedCombosPage({ gender = 'women' }: { gender?: string }) {
  const router = useRouter();
  const { addItem } = useCart();
  const cartBtnRef = useRef<HTMLButtonElement | null>(null);

  const [mode, setMode] = useState<'preset' | 'custom'>('preset');
  const [selectedComboId, setSelectedComboId] = useState('festive');
  const [comboSelections, setComboSelections] = useState<Partial<Record<CategoryKey, string>>>({});
  const [customSelectedIds, setCustomSelectedIds] = useState<Partial<Record<CategoryKey, string[]>>>({});
  const [customCategories, setCustomCategories] = useState<CategoryKey[]>([]);
  const [cartAdded, setCartAdded] = useState(false);

  // ── Dynamic Data State ──
  const [isLoading, setIsLoading] = useState(true);
  const [presetCombos, setPresetCombos] = useState<PresetCombo[]>([]);
  const [customComboData, setCustomComboData] = useState<any>(null); // For custom rules
  const [productsByCategory, setProductsByCategory] = useState<Record<string, ComboProduct[]>>({});
  const [categoryLabels, setCategoryLabels] = useState<Record<string, string>>({});
  const [allCategories, setAllCategories] = useState<CategoryKey[]>([]);

  useEffect(() => {
    async function loadData() {
      try {
        const [combosRes, productsRes, categoriesRes] = await Promise.all([
          apiRequest<{ success: boolean; combos: any[] }>('/combos'),
          apiRequest<{ success: boolean; products: any[] }>('/products'),
          apiRequest<{ success: boolean; categories: any[] }>('/categories')
        ]);

        const catLabels: Record<string, string> = {};
        if (categoriesRes.categories) {
          categoriesRes.categories.forEach(c => {
            catLabels[c._id] = c.name;
          });
        }
        setCategoryLabels(catLabels);

        const prods = productsRes.products || [];
        const pByCat: Record<string, ComboProduct[]> = {};
        prods.forEach(p => {
          if (!p.category) return;
          const catId = typeof p.category === 'string' ? p.category : p.category._id;
          if (!pByCat[catId]) pByCat[catId] = [];
          pByCat[catId].push({
            id: p._id,
            name: p.title,
            price: p.price || 0,
            image: p.mainImage || (p.images && p.images[0]) || '',
            customisable: !!p.isCustomisable
          });
        });

        const combos = combosRes.combos || [];
        const curated = combos.filter(c => c.type === 'curated');
        const custom = combos.find(c => c.type === 'custom');

        const mappedPresets: PresetCombo[] = curated.map(c => {
          const includedCats: string[] = [];
          const defaultSels: Record<string, string> = {};
          
          if (c.slots) {
            c.slots.forEach((s: any) => {
              const catId = typeof s.category === 'string' ? s.category : s.category?._id;
              if (catId) {
                includedCats.push(catId);
                const defaultProdId = typeof s.defaultProduct === 'string' ? s.defaultProduct : s.defaultProduct?._id;
                if (defaultProdId) defaultSels[catId] = defaultProdId;

                // Also ensure these products are in the lookup map
                if (!pByCat[catId]) pByCat[catId] = [];
                s.allowedProducts?.forEach((ap: any) => {
                  const apId = typeof ap === 'string' ? ap : ap?._id;
                  if (apId && !pByCat[catId].find(x => x.id === apId)) {
                    const prodInfo = prods.find(pr => pr._id === apId) || (typeof ap !== 'string' ? ap : null);
                    if (prodInfo) {
                      pByCat[catId].push({
                        id: prodInfo._id,
                        name: prodInfo.title,
                        price: prodInfo.price || 0,
                        image: prodInfo.mainImage || (prodInfo.images && prodInfo.images[0]) || '',
                        customisable: !!prodInfo.isCustomisable
                      });
                    }
                  }
                });
              }
            });
          }

          return {
            id: c._id,
            name: c.name,
            tagline: c.description || '',
            price: c.price || 0,
            originalPrice: c.originalPrice || c.price || 0,
            image: c.image || '',
            badge: c.status === 'active' ? 'Active' : '',
            tint: '#c8a84b',
            includedCategories: includedCats,
            defaultSelections: defaultSels
          };
        });

        setProductsByCategory(pByCat);
        setPresetCombos(mappedPresets);
        
        if (mappedPresets.length > 0) {
          setSelectedComboId(mappedPresets[0].id);
          setComboSelections({ ...mappedPresets[0].defaultSelections });
        }

        if (custom) {
          setCustomComboData(custom);
          const eligibleCats = custom.categories?.map((c: any) => typeof c === 'string' ? c : c._id) || Object.keys(pByCat);
          setAllCategories(eligibleCats);
          if (eligibleCats.length > 0) {
            setCustomCategories(eligibleCats.slice(0, 2));
          }
        } else {
          setAllCategories(Object.keys(pByCat));
        }

      } catch (e) {
        console.error("Error loading combo data", e);
      } finally {
        setIsLoading(false);
      }
    }
    loadData();
  }, []);

  // ── SortFilter state — one for preset product pickers, one for custom ──
  const [presetSortOption, setPresetSortOption] = useState<SortOption>('featured');
  const [customSortOption, setCustomSortOption] = useState<SortOption>('featured');

  const selectedCombo = presetCombos.find(c => c.id === selectedComboId);

  const handleComboSelect = useCallback((id: string) => {
    setSelectedComboId(id);
    const c = presetCombos.find(c => c.id === id);
    if (c) setComboSelections({ ...c.defaultSelections });
  }, [presetCombos]);

  const handlePresetSelection = useCallback((k: CategoryKey, id: string) => {
    setComboSelections(prev => ({ ...prev, [k]: id }));
  }, []);

  const handleCustomToggle = useCallback((k: CategoryKey, id: string) => {
    setCustomSelectedIds(prev => {
      const cur = prev[k] || [];
      return { ...prev, [k]: cur.includes(id) ? cur.filter(x => x !== id) : [...cur, id] };
    });
  }, []);

  const customTotal = useMemo(() => {
    return customCategories.reduce((sum, cat) => {
      return sum + (customSelectedIds[cat] || []).reduce((s, id) => {
        const p = productsByCategory[cat]?.find(p => p.id === id);
        return s + (p?.price || 0);
      }, 0);
    }, 0);
  }, [customSelectedIds, customCategories]);

  const presetTotal = selectedCombo?.price || 0;
  const totalOriginal = mode === 'preset' ? (selectedCombo?.originalPrice || presetTotal) : customTotal;
  
  // Apply dynamic discount rules for custom combo
  let customDiscount = 0;
  if (mode === 'custom' && customComboData?.discountRules?.length > 0) {
    const totalItems = customCategories.reduce((sum, cat) => sum + (customSelectedIds[cat]?.length || 0), 0);
    // Sort rules so highest requirement matches first
    const rules = [...customComboData.discountRules].sort((a, b) => {
      if (a.minItems !== b.minItems) return (b.minItems || 0) - (a.minItems || 0);
      return (b.minPrice || 0) - (a.minPrice || 0);
    });
    
    for (const rule of rules) {
      if ((!rule.minItems || totalItems >= rule.minItems) && (!rule.minPrice || customTotal >= rule.minPrice)) {
        if (customComboData.discountType === 'percentage') {
          customDiscount = (customTotal * (rule.discountValue || 0)) / 100;
        } else {
          customDiscount = rule.discountValue || 0;
        }
        break;
      }
    }
  }
  
  const totalPrice = mode === 'preset' ? presetTotal : Math.max(0, customTotal - customDiscount);
  const savings = mode === 'preset' ? (totalOriginal - totalPrice) : customDiscount;

  const presetSummaryItems = useMemo(() => {
    if (!selectedCombo) return [];
    return selectedCombo.includedCategories.flatMap(k => {
      const id = comboSelections[k];
      const p = productsByCategory[k]?.find(p => p.id === id);
      return p ? [{ k, p }] : [];
    });
  }, [selectedCombo, comboSelections, productsByCategory]);

  const customSummaryItems = useMemo(() => {
    return customCategories.flatMap(k =>
      (customSelectedIds[k] || []).flatMap(id => {
        const p = productsByCategory[k]?.find(p => p.id === id);
        return p ? [{ k, p }] : [];
      })
    );
  }, [customSelectedIds, customCategories, productsByCategory]);

  const summaryItems = mode === 'preset'
    ? presetSummaryItems.map(i => ({ k: i.k, p: i.p }))
    : customSummaryItems;
  const hasItems = summaryItems.length > 0;

  const buildComboCartItem = useCallback(() => {
    if (!hasItems) return null;
    return {
      id: mode === 'preset' ? String(selectedCombo?.id || 'preset') : 'custom-combo-' + Date.now(),
      name: mode === 'preset' ? (selectedCombo?.name || 'Curated Box') : 'Custom Jewellery Box',
      price: totalPrice,
      originalPrice: totalOriginal,
      image: mode === 'preset' ? (selectedCombo?.image || '') : (summaryItems[0]?.p?.image || ''),
      color: 'Default',
      colorHex: '#c9a84c',
      sku: `COMBO-${mode.toUpperCase()}`,
      href: `/categories/${gender}/curated-combos`,
      selectionGroups: summaryItems.map(item => ({
        category: item.k,
        label: categoryLabels[item.k] || item.k,
        items: [{
          id: String(item.p.id),
          name: item.p.name,
          price: item.p.price,
          image: item.p.image,
          quantity: 1,
        }]
      }))
    };
  }, [hasItems, mode, selectedCombo, totalPrice, totalOriginal, summaryItems, categoryLabels, gender]);

  function handleAddToCart() {
    const item = buildComboCartItem();
    if (!item) return;
    addItem(item);
    setCartAdded(true);
    setTimeout(() => setCartAdded(false), 1800);
  }

  function handleBuyNow() {
    const item = buildComboCartItem();
    if (!item) return;
    addItem(item, false);
    router.push('/cart');
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
          margin-top: 45px;
          padding: clamp(40px, 4vw, 56px) clamp(16px, 5vw, 60px) clamp(22px, 3vw, 38px);
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

        /* ── SECTION LABEL ROW — holds label + SortFilter ── */
        .slbl-row {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 12px;
          margin-bottom: 12px;
          flex-wrap: wrap;
        }
        .slbl {
          font-size: 8px; letter-spacing: .4em; text-transform: uppercase;
          color: var(--ink3); font-weight: 500;
          display: flex; align-items: center; gap: 10px;
          flex: 1; min-width: 0;
          margin-bottom: 0; /* reset since now inside row */
        }
        .slbl::after { content: ''; flex: 1; height: 1px; background: var(--bdr); }

        /* SortFilter wrapper — right-aligned on desktop/tablet, full-width on mobile */
        .sort-wrap {
          flex-shrink: 0;
        }

        /* ── COMBO CARDS ── */
        .cgrid {
          display: grid;
          grid-template-columns: repeat(2, 1fr);
          gap: 10px;
          margin-bottom: 28px;
        }

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
        }
        .ccard:hover {
          transform: translateY(-3px) scale(1.01);
          box-shadow: 0 10px 32px rgba(27,31,14,.14);
        }

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

        /* ── CUSTOMISE BLOCK ── */
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

        /* ── CATEGORY PILLS ── */
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

        @media (max-width: 1024px) {
          .layout { grid-template-columns: 1fr; }
          .summary { position: static; }
        }

        @media (max-width: 680px) {
          .hero, .modebar, .layout { padding-left: 14px; padding-right: 14px; }
          .hero { padding-top: 40px; padding-bottom: 20px; }
          .modebar { padding-top: 14px; }
          .layout { padding-top: 16px; padding-bottom: 40px; gap: 14px; }

          .cgrid { grid-template-columns: 1fr 1fr; gap: 8px; }

          .ccard-mobile-hint { display: block; }
          .desktop-only { display: none !important; }

          .modebtn { padding: 7px 12px; font-size: 9px; }

          /* On mobile: slbl-row stacks, sort goes full width */
          .slbl-row {
            flex-direction: row;
            align-items: center;
            justify-content: space-between;
            gap: 8px;
          }
         

          .mobile-pgrid { grid-template-columns: repeat(3, 1fr); }

          .summary { position: static; border-radius: 14px; }
        }

        @media (max-width: 400px) {
          .cgrid { grid-template-columns: 1fr; }
          .mobile-pgrid { grid-template-columns: repeat(2, 1fr); }
        }

        @media (min-width: 681px) {
          .mobile-picker { display: none !important; }
          .ccard-mobile-hint { display: none !important; }
        }
      `}</style>

      <div className="page">
        <UpperNav />

        {/* ── HERO ── */}
        <div className="hero">
          <div className="hero-tag">
            <span className="hero-tag-line" />
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
                {/* Section label + SortFilter for combo cards (sorted by price) */}
                <div className="slbl-row">
                  <p className="slbl">Choose a Combo Set</p>
                  <div className="sort-wrap">
                    <SortFilter
                      value={presetSortOption}
                      onChange={setPresetSortOption}
                    />
                  </div>
                </div>

                {/* COMBO GRID */}
                <div className="cgrid">
                  {presetCombos.map(c => (
                    <ComboCard
                      key={c.id}
                      combo={c}
                      selected={selectedComboId === c.id}
                      onSelect={handleComboSelect}
                      comboSelections={comboSelections}
                      onPresetSelection={handlePresetSelection}
                      sortOption={presetSortOption}
                      productsByCategory={productsByCategory}
                      categoryLabels={categoryLabels}
                    />
                  ))}
                </div>

                {/* Desktop accordion */}
                <div className="desktop-only">
                  <div className="slbl-row">
                    <p className="slbl">Swap Pieces in Your Set</p>
                    <div className="sort-wrap">
                      <SortFilter
                        value={presetSortOption}
                        onChange={setPresetSortOption}
                      />
                    </div>
                  </div>
                  <div className="custblock">
                    <div className="custhead">
                      <span className="custtitle">{selectedCombo?.name}</span>
                      <span className="custsub">Expand a category to swap</span>
                    </div>
                    {selectedCombo?.includedCategories.map(cat => (
                      <Accordion
                        key={cat}
                        catKey={cat}
                        categoryLabels={categoryLabels}
                        products={productsByCategory[cat] ?? []}
                        selectedId={comboSelections[cat]}
                        onSelect={handlePresetSelection}
                        sortOption={presetSortOption}
                      />
                    ))}
                  </div>
                </div>
              </>
            )}

            {mode === 'custom' && (
              <>
                <p className="slbl" style={{ marginBottom: 12 }}>Select Your Categories</p>
                <div className="catpills">
                  {allCategories.map(cat => (
                    <button
                      key={cat}
                      className={`catpill${customCategories.includes(cat) ? ' on' : ''}`}
                      onClick={() => setCustomCategories(prev =>
                        prev.includes(cat) ? prev.filter(c => c !== cat) : [...prev, cat]
                      )}
                    >
                      {customCategories.includes(cat) ? '✓ ' : '+ '}{categoryLabels[cat] || cat}
                    </button>
                  ))}
                </div>

                {customCategories.length > 0 && (
                  <>
                    <div className="slbl-row">
                      <p className="slbl">Choose Products</p>
                      <div className="sort-wrap">
                        <SortFilter
                          value={customSortOption}
                          onChange={setCustomSortOption}
                        />
                      </div>
                    </div>
                    <div className="customblock">
                      {customCategories.map(cat => (
                        <AccordionMulti
                          key={cat}
                          catKey={cat}
                          categoryLabels={categoryLabels}
                          products={productsByCategory[cat] ?? []}
                          selectedIds={customSelectedIds[cat] ?? []}
                          onToggle={handleCustomToggle}
                          sortOption={customSortOption}
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
                      <img className="sum-thumb" src={p.image || '/images/hero.png'} alt={p.name} />
                      <div className="sum-info">
                        <span className="sum-cat">{categoryLabels[k] || k}</span>
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