// 'use client';

// import {
//   useState,
//   useMemo,
//   useCallback,
//   useEffect,
//   type ChangeEvent,
// } from 'react';
// import { useRouter } from 'next/navigation';
// import { useCart } from '@/lib/cartContext';
// import UpperNav from '@/components/ui/UpperNav';
// import { sortProducts, type SortOption } from '@/components/ui/SortFilter';
// import { apiRequest } from '@/lib/api';

// /* ─────────────────────────────────────────────────────────────
//    TYPES
// ───────────────────────────────────────────────────────────── */
// type CategoryKey = string;

// interface ProductVariant {
//   colour?: string;
//   size?: string;
//   personalMessage?: string;
//   uploadedImageBase64?: string;
// }

// interface ComboProduct {
//   id: string;
//   name: string;
//   price: number;
//   image: string;
//   customisable: boolean;
//   availableColours?: string[];
//   availableSizes?: string[];
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
//   defaultSelections: Partial<Record<CategoryKey, string>>;
// }

// /* ─────────────────────────────────────────────────────────────
//    PRODUCT CUSTOMISER MODAL
// ───────────────────────────────────────────────────────────── */
// interface CustomiserProps {
//   product: ComboProduct;
//   variant: ProductVariant;
//   onSave: (v: ProductVariant) => void;
//   onClose: () => void;
//   isAddFlow?: boolean;
// }

// function ProductCustomiser({ product, variant, onSave, onClose, isAddFlow }: CustomiserProps) {
//   const [local, setLocal] = useState<ProductVariant>({ ...variant });

//   const handleFile = (e: ChangeEvent<HTMLInputElement>) => {
//     const f = e.currentTarget.files?.[0];
//     if (!f) return;
//     const r = new FileReader();
//     r.onload = ev => setLocal(prev => ({ ...prev, uploadedImageBase64: ev.target?.result as string }));
//     r.readAsDataURL(f);
//   };

//   const colours = product.availableColours?.length
//     ? product.availableColours
//     : ['Gold', 'Silver', 'Rose Gold', 'Antique'];

//   const sizes = product.availableSizes?.length
//     ? product.availableSizes
//     : ['XS', 'S', 'M', 'L', 'XL'];

//   const hasAnySelection = !!(local.colour || local.size || local.personalMessage || local.uploadedImageBase64);

//   return (
//     <div className="modal-backdrop" onClick={e => e.target === e.currentTarget && onClose()}>
//       <div className="modal-box" role="dialog" aria-modal="true">
//         <div className="modal-header">
//           <div className="modal-header-text">
//             <span className="modal-eyebrow">Customise Piece</span>
//             <h2 className="modal-title">{product.name}</h2>
//           </div>
//           <button className="modal-close" onClick={onClose} aria-label="Close dialog">
//             <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
//               <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
//             </svg>
//           </button>
//         </div>

//         <div className="modal-product-strip">
//           <img className="modal-product-img" src={product.image || '/images/hero.png'} alt={product.name} />
//           <div className="modal-product-info">
//             <div className="modal-product-name">{product.name}</div>
//             <div className="modal-product-price">₹{product.price.toLocaleString('en-IN')}</div>
//             {isAddFlow && <div className="modal-product-note">Choose your preferences, then add to hamper</div>}
//           </div>
//         </div>

//         <div className="modal-body">
//           <div className="modal-field">
//             <label className="modal-field-label">
//               <span className="modal-field-num">1</span>
//               Select Colour
//               {local.colour && <span className="modal-selected-badge">{local.colour}</span>}
//             </label>
//             <div className="modal-chips">
//               {colours.map(c => (
//                 <button key={c} className={`chip${local.colour === c ? ' chip-on' : ''}`}
//                   onClick={() => setLocal(prev => ({ ...prev, colour: c }))}>{c}</button>
//               ))}
//             </div>
//           </div>

//           <div className="modal-field">
//             <label className="modal-field-label">
//               <span className="modal-field-num">2</span>
//               Select Size
//               {local.size && <span className="modal-selected-badge">Size {local.size}</span>}
//             </label>
//             <div className="modal-chips">
//               {sizes.map(s => (
//                 <button key={s} className={`chip chip-size${local.size === s ? ' chip-on' : ''}`}
//                   onClick={() => setLocal(prev => ({ ...prev, size: s }))}>{s}</button>
//               ))}
//             </div>
//           </div>

//           <div className="modal-field">
//             <label className="modal-field-label">
//               <span className="modal-field-num">3</span>
//               Personalised Message
//               <span className="modal-field-optional">optional</span>
//             </label>
//             <textarea className="modal-textarea"
//               placeholder="E.g. 'To my dearest Priya, with love…'"
//               value={local.personalMessage || ''}
//               onChange={e => setLocal(prev => ({ ...prev, personalMessage: e.target.value }))}
//               maxLength={120} rows={3} />
//             <div className="modal-char-count">{(local.personalMessage || '').length}/120 characters</div>
//           </div>

//           <div className="modal-field">
//             <label className="modal-field-label">
//               <span className="modal-field-num">4</span>
//               Upload Photo
//               <span className="modal-field-optional">optional</span>
//             </label>
//             <label className="modal-upload-zone">
//               <input type="file" accept="image/*" style={{ display: 'none' }} onChange={handleFile} />
//               {local.uploadedImageBase64 ? (
//                 <div className="modal-upload-preview">
//                   <img src={local.uploadedImageBase64} alt="Uploaded preview" />
//                   <div className="modal-upload-preview-info">
//                     <span className="modal-upload-preview-name">Photo uploaded ✓</span>
//                     <span className="modal-upload-change">Tap to change</span>
//                   </div>
//                 </div>
//               ) : (
//                 <div className="modal-upload-empty">
//                   <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
//                     <rect x="3" y="3" width="18" height="18" rx="3"/>
//                     <circle cx="8.5" cy="8.5" r="1.5"/>
//                     <polyline points="21 15 16 10 5 21"/>
//                   </svg>
//                   <span className="modal-upload-cta">Tap to upload a photo</span>
//                   <span className="modal-upload-sub">JPG, PNG, WEBP supported</span>
//                 </div>
//               )}
//             </label>
//           </div>

//           {hasAnySelection && (
//             <div className="modal-summary-box">
//               <div className="modal-summary-title">Your selections</div>
//               <div className="modal-summary-tags">
//                 {local.colour && <span className="modal-sum-tag">🎨 {local.colour}</span>}
//                 {local.size && <span className="modal-sum-tag">📐 Size {local.size}</span>}
//                 {local.personalMessage && <span className="modal-sum-tag">✉ Personal message</span>}
//                 {local.uploadedImageBase64 && <span className="modal-sum-tag">📷 Photo added</span>}
//               </div>
//             </div>
//           )}
//         </div>

//         <div className="modal-footer">
//           <button className="modal-btn-skip" onClick={() => { onSave({}); onClose(); }}>Skip customisation</button>
//           <button className="modal-btn-save" onClick={() => { onSave(local); onClose(); }}>
//             {isAddFlow ? (
//               <><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M12 5v14M5 12l7 7 7-7"/></svg>Add to Hamper</>
//             ) : (
//               <><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><polyline points="20 6 9 17 4 12"/></svg>Save Changes</>
//             )}
//           </button>
//         </div>
//       </div>
//     </div>
//   );
// }

// /* ─────────────────────────────────────────────────────────────
//    COMBO CARD — Card + Side Panel layout
// ───────────────────────────────────────────────────────────── */
// interface ComboCardProps {
//   combo: PresetCombo;
//   selected: boolean;
//   onSelect: (id: string) => void;
//   productsByCategory: Record<string, ComboProduct[]>;
//   categoryLabels: Record<string, string>;
//   variants: Record<string, ProductVariant>;
//   onVariantChange: (productId: string, v: ProductVariant) => void;
//   onOpenPanel: (combo: PresetCombo, products: ComboProduct[]) => void;
// }

// function ComboCard({ combo, selected, onSelect, productsByCategory, categoryLabels, variants, onVariantChange, onOpenPanel }: ComboCardProps) {
//   const pct = Math.round(((combo.originalPrice - combo.price) / combo.originalPrice) * 100);

//   const hamperProducts: ComboProduct[] = useMemo(() => {
//     const seen = new Set<string>();
//     const result: ComboProduct[] = [];
//     combo.includedCategories.forEach(cat => {
//       (productsByCategory[cat] ?? []).forEach(p => {
//         if (!seen.has(p.id)) { seen.add(p.id); result.push(p); }
//       });
//     });
//     return result;
//   }, [combo, productsByCategory]);

//   const customisedCount = hamperProducts.filter(p =>
//     !!(variants[p.id]?.colour || variants[p.id]?.size || variants[p.id]?.personalMessage || variants[p.id]?.uploadedImageBase64)
//   ).length;

//   const handleClick = () => {
//     onSelect(combo.id);
//     onOpenPanel(combo, hamperProducts);
//   };

//   return (
//     <div className={`cc-card${selected ? ' cc-selected' : ''}`} onClick={handleClick}>
//       <div className="cc-img-area">
//         <img src={combo.image || '/images/hero.png'} alt={combo.name} />
//         <div className="cc-img-grad" />
//         {pct > 0 && <span className="cc-pct-badge">{pct}% off</span>}
//         {combo.badge && <span className="cc-label-badge">{combo.badge}</span>}
//         {selected && (
//           <div className="cc-selected-check">
//             <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3.5">
//               <polyline points="20 6 9 17 4 12"/>
//             </svg>
//           </div>
//         )}
//         <div className="cc-img-text">
//           <div className="cc-img-name">{combo.name}</div>
//           <div className="cc-img-tagline">{combo.tagline}</div>
//         </div>
//       </div>
//       <div className="cc-color-strip" style={{ background: combo.tint }} />
//       <div className="cc-foot">
//         <div className="cc-price-row">
//           <span className="cc-price">₹{combo.price.toLocaleString('en-IN')}</span>
//           {combo.originalPrice > combo.price && (
//             <span className="cc-original">₹{combo.originalPrice.toLocaleString('en-IN')}</span>
//           )}
//           {pct > 0 && <span className="cc-save-tag">Save {pct}%</span>}
//         </div>
//         <div className="cc-pieces-count">
//           {hamperProducts.length} pieces
//           {customisedCount > 0 && <span className="cc-cust-dot"> · {customisedCount} customised</span>}
//         </div>
//         <div className="cc-cta-hint">
//           {selected ? '✦ Selected — tap to view pieces' : 'Tap to select & view pieces →'}
//         </div>
//       </div>
//     </div>
//   );
// }

// /* ─────────────────────────────────────────────────────────────
//    SIDE PANEL — slides in from right on desktop, bottom sheet on mobile
// ───────────────────────────────────────────────────────────── */
// interface SidePanelProps {
//   combo: PresetCombo | null;
//   products: ComboProduct[];
//   variants: Record<string, ProductVariant>;
//   onVariantChange: (productId: string, v: ProductVariant) => void;
//   categoryLabels: Record<string, string>;
//   onClose: () => void;
// }

// function SidePanel({ combo, products, variants, onVariantChange, categoryLabels, onClose }: SidePanelProps) {
//   const [customising, setCustomising] = useState<ComboProduct | null>(null);
//   const [activeIdx, setActiveIdx] = useState(0);

//   useEffect(() => { setActiveIdx(0); }, [combo?.id]);

//   if (!combo) return null;

//   const customisedCount = products.filter(p =>
//     !!(variants[p.id]?.colour || variants[p.id]?.size || variants[p.id]?.personalMessage || variants[p.id]?.uploadedImageBase64)
//   ).length;

//   const activeProduct = products[activeIdx];
//   const activeVariant = activeProduct ? (variants[activeProduct.id] || {}) : {};
//   const hasActiveCust = !!(activeVariant.colour || activeVariant.size || activeVariant.personalMessage || activeVariant.uploadedImageBase64);

//   return (
//     <>
//       {customising && (
//         <ProductCustomiser
//           product={customising}
//           variant={variants[customising.id] || {}}
//           onSave={v => { onVariantChange(customising.id, v); setCustomising(null); }}
//           onClose={() => setCustomising(null)}
//         />
//       )}
//       <div className="panel-backdrop" onClick={e => e.target === e.currentTarget && onClose()} />
//       <div className="side-panel">
//         {/* Panel header */}
//         <div className="panel-head">
//           <div>
//             <div className="panel-eyebrow">Pieces in this set</div>
//             <div className="panel-title">{combo.name}</div>
//           </div>
//           <div className="panel-head-right">
//             <span className="panel-prog">{customisedCount}/{products.length} done</span>
//             <button className="panel-close" onClick={onClose} aria-label="Close panel">
//               <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
//                 <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
//               </svg>
//             </button>
//           </div>
//         </div>

//         {/* Thumbnail strip */}
//         <div className="panel-thumbs">
//           {products.map((p, i) => {
//             const v = variants[p.id] || {};
//             const done = !!(v.colour || v.size || v.personalMessage || v.uploadedImageBase64);
//             return (
//               <button key={p.id} className={`panel-thumb${activeIdx === i ? ' active' : ''}${done ? ' done' : ''}`}
//                 onClick={() => setActiveIdx(i)}>
//                 <img src={p.image || '/images/hero.png'} alt={p.name} />
//                 {done && <span className="panel-thumb-check">✓</span>}
//               </button>
//             );
//           })}
//         </div>

//         {/* Active product detail */}
//         {activeProduct && (
//           <div className="panel-detail">
//             <div className="panel-detail-img">
//               <a
//                 href={`/products/${activeProduct.id}?fromCombo=true`}
//                 className="panel-detail-img-link"
//                 onClick={e => e.stopPropagation()}
//               >
//                 <img src={activeProduct.image || '/images/hero.png'} alt={activeProduct.name} />
//                 <div className="panel-detail-img-overlay">
//                   <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2.5">
//                     <path d="M5 12h14M12 5l7 7-7 7"/>
//                   </svg>
//                 </div>
//               </a>
//             </div>
//             <div className="panel-detail-info">
//               <a
//                 href={`/products/${activeProduct.id}?fromCombo=true`}
//                 className="panel-detail-name-link"
//                 onClick={e => e.stopPropagation()}
//               >
//                 <div className="panel-detail-name">{activeProduct.name}</div>
//               </a>
//               <div className="panel-detail-price">₹{activeProduct.price.toLocaleString('en-IN')}</div>
//               {hasActiveCust && (
//                 <div className="panel-detail-tags">
//                   {activeVariant.colour && <span className="panel-tag">🎨 {activeVariant.colour}</span>}
//                   {activeVariant.size && <span className="panel-tag">📐 {activeVariant.size}</span>}
//                   {activeVariant.personalMessage && <span className="panel-tag">✉ Msg</span>}
//                   {activeVariant.uploadedImageBase64 && <span className="panel-tag">📷</span>}
//                 </div>
//               )}
//               <button className="panel-customise-btn" onClick={() => setCustomising(activeProduct)}>
//                 {hasActiveCust ? '✎ Edit customisation' : '+ Customise this piece'}
//               </button>
//             </div>
//           </div>
//         )}

//         {/* Nav arrows */}
//         {products.length > 1 && (
//           <div className="panel-nav">
//             <button className="panel-nav-btn" onClick={() => setActiveIdx(i => Math.max(0, i - 1))} disabled={activeIdx === 0}>
//               ← Prev
//             </button>
//             <span className="panel-nav-count">{activeIdx + 1} / {products.length}</span>
//             <button className="panel-nav-btn" onClick={() => setActiveIdx(i => Math.min(products.length - 1, i + 1))} disabled={activeIdx === products.length - 1}>
//               Next →
//             </button>
//           </div>
//         )}

//         {customisedCount < products.length && (
//           <div className="panel-tip">💡 Select each piece above to customise colour, size & message</div>
//         )}
//       </div>
//     </>
//   );
// }

// /* ─────────────────────────────────────────────────────────────
//    CUSTOM PRODUCT CARD
//    - Image and name link to PDP with ?fromCombo=true to hide cart/buy/look sections
//    - Add/remove/customise buttons still work independently
// ───────────────────────────────────────────────────────────── */
// interface CustomProdCardProps {
//   product: ComboProduct;
//   inHamper: boolean;
//   variant: ProductVariant;
//   onAdd: () => void;
//   onRemove: () => void;
//   onEditCustomise: () => void;
// }

// function CustomProdCard({ product, inHamper, variant, onAdd, onRemove, onEditCustomise }: CustomProdCardProps) {
//   const hasCustomisation = !!(variant.colour || variant.size || variant.personalMessage || variant.uploadedImageBase64);

//   return (
//     <div className={`cp-card${inHamper ? ' cp-in-hamper' : ''}`}>
//       <div className="cp-img">
//         {/*
//           FIX 2: Image links to PDP with ?fromCombo=true so PDP can hide
//           Add to Cart / Buy Now / Complete the Look for combo-context visits.
//           The cp-img-toggle (transparent full-area button) sits on top for add/remove,
//           but the link area is carved out at the bottom-right via pointer-events.
//         */}
//         <a
//           href={`/products/${product.id}?fromCombo=true`}
//           className="cp-img-link"
//           onClick={e => e.stopPropagation()}
//         >
//           <img src={product.image || '/images/hero.png'} alt={product.name} />
//         </a>
//         {/* Overlay toggle — only shows the green check when in hamper; handles add/remove */}
//         <button
//           className="cp-img-toggle"
//           onClick={inHamper ? onRemove : onAdd}
//           aria-label={inHamper ? 'Remove from hamper' : 'Add to hamper'}
//         >
//           {inHamper && (
//             <div className="cp-in-overlay">
//               <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="3">
//                 <polyline points="20 6 9 17 4 12"/>
//               </svg>
//             </div>
//           )}
//         </button>
//       </div>
//       <div className="cp-body">
//         {/* FIX 2: Name links to PDP with fromCombo param */}
//         <a
//           href={`/products/${product.id}?fromCombo=true`}
//           className="cp-name-link"
//           onClick={e => e.stopPropagation()}
//         >
//           <div className="cp-name">{product.name}</div>
//         </a>
//         <div className="cp-price">₹{product.price.toLocaleString('en-IN')}</div>
//         {inHamper ? (
//           <div className="cp-in-actions">
//             {hasCustomisation && (
//               <div className="cp-tag-row">
//                 {variant.colour && <span className="cp-tag">{variant.colour}</span>}
//                 {variant.size && <span className="cp-tag">{variant.size}</span>}
//               </div>
//             )}
//             <button className="cp-edit-btn" onClick={onEditCustomise}>
//               {hasCustomisation ? '✎ Edit' : '+ Customise'}
//             </button>
//             <button className="cp-remove-btn" onClick={onRemove}>Remove</button>
//           </div>
//         ) : (
//           <button className="cp-add-btn" onClick={onAdd}>+ Add</button>
//         )}
//       </div>
//     </div>
//   );
// }

// /* ─────────────────────────────────────────────────────────────
//    MOBILE SUMMARY DRAWER
// ───────────────────────────────────────────────────────────── */
// interface MobileSummaryProps {
//   totalPrice: number;
//   savings: number;
//   itemCount: number;
//   onOpen: () => void;
//   hasItems: boolean;
//   onAddToCart: () => void;
//   cartAdded: boolean;
// }

// function MobileSummaryBar({ totalPrice, savings, itemCount, onOpen, hasItems, onAddToCart, cartAdded }: MobileSummaryProps) {
//   return (
//     <div className="mobile-bar">
//       <button className="mobile-bar-info" onClick={onOpen} disabled={!hasItems}>
//         {hasItems ? (
//           <>
//             <div className="mobile-bar-count">{itemCount} piece{itemCount !== 1 ? 's' : ''}</div>
//             <div className="mobile-bar-price">₹{totalPrice.toLocaleString('en-IN')}</div>
//             {savings > 0 && <div className="mobile-bar-save">Save ₹{savings.toLocaleString('en-IN')}</div>}
//             <div className="mobile-bar-view">View summary ▲</div>
//           </>
//         ) : (
//           <div className="mobile-bar-empty">Select pieces to begin</div>
//         )}
//       </button>
//       {/* FIX 1: Cart button is always rendered alongside the info area,
//           never overflows or gets hidden behind safe-area / nav bars */}
//       <button
//         className={`mobile-bar-cart${cartAdded ? ' done' : ''}`}
//         onClick={onAddToCart}
//         disabled={!hasItems}
//       >
//         {cartAdded ? '✓ Added!' : 'Add to Cart'}
//       </button>
//     </div>
//   );
// }

// /* ─────────────────────────────────────────────────────────────
//    MAIN PAGE
// ───────────────────────────────────────────────────────────── */
// export default function CuratedCombosPage({ gender = 'women' }: { gender?: string }) {
//   const router = useRouter();
//   const { addItem } = useCart();

//   const [mode, setMode] = useState<'preset' | 'custom'>('preset');

//   const [selectedComboId, setSelectedComboId] = useState('');
//   const [presetVariants, setPresetVariants] = useState<Record<string, ProductVariant>>({});

//   // Side panel state
//   const [panelCombo, setPanelCombo] = useState<PresetCombo | null>(null);
//   const [panelProducts, setPanelProducts] = useState<ComboProduct[]>([]);

//   /*
//     FIX 3: In "Build Your Own" mode the category selector now works like an
//     accordion / radio — clicking a pill opens ONLY that category's grid and
//     collapses any previously-open one.  We track a single `activeCategory`
//     string (null = none open) instead of a multi-select array.
//   */
//   const [activeCategory, setActiveCategory] = useState<CategoryKey | null>(null);

//   // Keep the old multi-select for cart-building purposes (all items the user
//   // has added to the hamper can span multiple categories they visited).
//   // We still need to know every category that has hamper items so the summary
//   // renders correctly — we derive that from `hamper` instead of the pill state.
//   const [hamper, setHamper] = useState<Record<string, ProductVariant>>({});

//   const [pendingAdd, setPendingAdd] = useState<ComboProduct | null>(null);
//   const [editingProduct, setEditingProduct] = useState<ComboProduct | null>(null);

//   const [showMobileSummary, setShowMobileSummary] = useState(false);
//   const [cartAdded, setCartAdded] = useState(false);

//   const [isLoading, setIsLoading] = useState(true);
//   const [presetCombos, setPresetCombos] = useState<PresetCombo[]>([]);
//   const [customComboData, setCustomComboData] = useState<any>(null);
//   const [productsByCategory, setProductsByCategory] = useState<Record<string, ComboProduct[]>>({});
//   const [categoryLabels, setCategoryLabels] = useState<Record<string, string>>({});
//   const [allCategories, setAllCategories] = useState<CategoryKey[]>([]);

//   useEffect(() => {
//     async function loadData() {
//       try {
//         const [combosRes, productsRes, categoriesRes] = await Promise.all([
//           apiRequest<{ success: boolean; combos: any[] }>('/combos'),
//           apiRequest<{ success: boolean; products: any[] }>('/products'),
//           apiRequest<{ success: boolean; categories: any[] }>('/categories'),
//         ]);

//         const catLabels: Record<string, string> = {};
//         categoriesRes.categories?.forEach((c: any) => { catLabels[c._id] = c.name; });
//         setCategoryLabels(catLabels);

//         const prods = productsRes.products || [];
//         const pByCat: Record<string, ComboProduct[]> = {};
//         prods.forEach((p: any) => {
//           if (!p.category) return;
//           const catId = typeof p.category === 'string' ? p.category : p.category._id;
//           if (!pByCat[catId]) pByCat[catId] = [];
//           pByCat[catId].push({
//             id: p._id, name: p.title, price: p.price || 0,
//             image: p.mainImage || p.images?.[0] || '',
//             customisable: !!p.isCustomisable,
//             availableColours: p.colours || [],
//             availableSizes: p.sizes || [],
//           });
//         });

//         const combos = combosRes.combos || [];
//         const curated = combos.filter((c: any) => c.type === 'curated');
//         const custom = combos.find((c: any) => c.type === 'custom');

//         const mappedPresets: PresetCombo[] = curated.map((c: any) => {
//           const includedCats: string[] = [];
//           const defaultSels: Record<string, string> = {};
//           c.slots?.forEach((s: any) => {
//             const catId = typeof s.category === 'string' ? s.category : s.category?._id;
//             if (!catId) return;
//             includedCats.push(catId);
//             const defId = typeof s.defaultProduct === 'string' ? s.defaultProduct : s.defaultProduct?._id;
//             if (defId) defaultSels[catId] = defId;
//             if (!pByCat[catId]) pByCat[catId] = [];
//             s.allowedProducts?.forEach((ap: any) => {
//               const apId = typeof ap === 'string' ? ap : ap?._id;
//               if (apId && !pByCat[catId].find((x: ComboProduct) => x.id === apId)) {
//                 const prodInfo = prods.find((pr: any) => pr._id === apId) || (typeof ap !== 'string' ? ap : null);
//                 if (prodInfo) {
//                   pByCat[catId].push({
//                     id: prodInfo._id, name: prodInfo.title, price: prodInfo.price || 0,
//                     image: prodInfo.mainImage || prodInfo.images?.[0] || '',
//                     customisable: !!prodInfo.isCustomisable,
//                     availableColours: prodInfo.colours || [],
//                     availableSizes: prodInfo.sizes || [],
//                   });
//                 }
//               }
//             });
//           });
//           return {
//             id: c._id, name: c.name, tagline: c.description || '',
//             price: c.price || 0, originalPrice: c.originalPrice || c.price || 0,
//             image: c.image || '', badge: c.badge || '', tint: c.tint || '#c8a84b',
//             includedCategories: includedCats, defaultSelections: defaultSels,
//           };
//         });

//         setProductsByCategory(pByCat);
//         setPresetCombos(mappedPresets);
//         if (mappedPresets.length > 0) setSelectedComboId(mappedPresets[0].id);

//         if (custom) {
//           setCustomComboData(custom);
//           const eligible = custom.categories?.map((c: any) => typeof c === 'string' ? c : c._id) || Object.keys(pByCat);
//           setAllCategories(eligible);
//           // Open the first category by default
//           if (eligible.length > 0) setActiveCategory(eligible[0]);
//         } else {
//           const keys = Object.keys(pByCat);
//           setAllCategories(keys);
//           if (keys.length > 0) setActiveCategory(keys[0]);
//         }
//       } catch (e) {
//         console.error('Error loading combo data', e);
//       } finally {
//         setIsLoading(false);
//       }
//     }
//     loadData();
//   }, []);

//   const selectedCombo = presetCombos.find(c => c.id === selectedComboId);
//   const hamperProductIds = Object.keys(hamper);

//   /*
//     For the custom mode summary we need to show all products that are in the
//     hamper, regardless of which category pill is currently open.  We derive
//     the categories that have hamper items dynamically from `hamper`.
//   */
//   const categoriesWithHamperItems: CategoryKey[] = useMemo(() => {
//     return allCategories.filter(cat =>
//       (productsByCategory[cat] ?? []).some(p => hamperProductIds.includes(p.id))
//     );
//   }, [hamperProductIds, allCategories, productsByCategory]);

//   const customTotal = useMemo(() => {
//     return hamperProductIds.reduce((sum, pid) => {
//       // Find the product price across all categories
//       for (const cat of allCategories) {
//         const p = (productsByCategory[cat] ?? []).find(x => x.id === pid);
//         if (p) return sum + p.price;
//       }
//       return sum;
//     }, 0);
//   }, [hamperProductIds, allCategories, productsByCategory]);

//   let customDiscount = 0;
//   if (mode === 'custom' && customComboData?.discountRules?.length > 0) {
//     const totalItems = hamperProductIds.length;
//     const rules = [...customComboData.discountRules].sort((a: any, b: any) =>
//       (b.minItems || 0) - (a.minItems || 0) || (b.minPrice || 0) - (a.minPrice || 0)
//     );
//     for (const rule of rules) {
//       if ((!rule.minItems || totalItems >= rule.minItems) && (!rule.minPrice || customTotal >= rule.minPrice)) {
//         customDiscount = customComboData.discountType === 'percentage'
//           ? (customTotal * (rule.discountValue || 0)) / 100
//           : rule.discountValue || 0;
//         break;
//       }
//     }
//   }

//   const presetTotal = selectedCombo?.price || 0;
//   const presetOriginal = selectedCombo?.originalPrice || presetTotal;
//   const totalPrice = mode === 'preset' ? presetTotal : Math.max(0, customTotal - customDiscount);
//   const savings = mode === 'preset' ? (presetOriginal - presetTotal) : customDiscount;

//   const presetSummaryItems = useMemo(() => {
//     if (!selectedCombo) return [];
//     const seen = new Set<string>();
//     const items: { p: ComboProduct; k: string }[] = [];
//     selectedCombo.includedCategories.forEach(k => {
//       (productsByCategory[k] ?? []).forEach(p => {
//         if (!seen.has(p.id)) { seen.add(p.id); items.push({ p, k }); }
//       });
//     });
//     return items;
//   }, [selectedCombo, productsByCategory]);

//   const customSummaryItems = useMemo(() => {
//     return categoriesWithHamperItems.flatMap(k =>
//       (productsByCategory[k] ?? []).filter(p => hamperProductIds.includes(p.id)).map(p => ({ k, p }))
//     );
//   }, [categoriesWithHamperItems, productsByCategory, hamperProductIds]);

//   const summaryItems = mode === 'preset' ? presetSummaryItems : customSummaryItems;
//   const hasItems = summaryItems.length > 0;

//   const buildCartItem = useCallback(() => {
//     if (!hasItems) return null;
//     return {
//       id: mode === 'preset' ? String(selectedCombo?.id || 'preset') : `custom-combo-${Date.now()}`,
//       name: mode === 'preset' ? (selectedCombo?.name || 'Curated Box') : 'Custom Jewellery Hamper',
//       price: totalPrice,
//       originalPrice: mode === 'preset' ? presetOriginal : customTotal,
//       image: mode === 'preset' ? (selectedCombo?.image || '') : (summaryItems[0]?.p?.image || ''),
//       color: 'Default', colorHex: '#c9a84c',
//       sku: `COMBO-${mode.toUpperCase()}`,
//       href: `/categories/${gender}/curated-combos`,
//       selectionGroups: summaryItems.map(({ k, p }) => {
//         const v = mode === 'preset' ? (presetVariants[p.id] || {}) : (hamper[p.id] || {});
//         return {
//           category: k, label: categoryLabels[k] || k,
//           items: [{ id: String(p.id), name: p.name, price: p.price, image: p.image, quantity: 1,
//             colour: v.colour, size: v.size, personalMessage: v.personalMessage }],
//         };
//       }),
//     };
//   }, [hasItems, mode, selectedCombo, totalPrice, presetOriginal, customTotal, summaryItems, presetVariants, hamper, categoryLabels, gender]);

//   function handleAddToCart() {
//     const item = buildCartItem();
//     if (!item) return;
//     addItem(item);
//     setCartAdded(true);
//     setTimeout(() => setCartAdded(false), 1800);
//   }

//   function handleBuyNow() {
//     const item = buildCartItem();
//     if (!item) return;
//     addItem(item, false);
//     router.push('/cart');
//   }

//   function handleProductAdd(p: ComboProduct) { setPendingAdd(p); }
//   function handleProductRemove(productId: string) {
//     setHamper(prev => { const next = { ...prev }; delete next[productId]; return next; });
//   }

//   function handleOpenPanel(combo: PresetCombo, products: ComboProduct[]) {
//     setPanelCombo(combo);
//     setPanelProducts(products);
//   }

//   /*
//     FIX 3: Category pill click handler — behaves like an accordion.
//     Clicking an already-open category closes it (toggle), clicking a new one
//     switches to that category and hides the previously open grid.
//   */
//   function handleCategoryPillClick(cat: CategoryKey) {
//     setActiveCategory(prev => (prev === cat ? null : cat));
//   }

//   /* ─── RENDER ─── */
//   return (
//     <>
//       <style>{`
//         @import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,400;0,500;0,600;1,400;1,500&family=DM+Sans:ital,opsz,wght@0,9..40,300;0,9..40,400;0,9..40,500;0,9..40,600;1,9..40,300&display=swap');

//         :root {
//           --bg:        #f5f2eb;
//           --bg2:       #ede9df;
//           --surf:      #ffffff;
//           --bdr:       #e0d8c8;
//           --bdr2:      #c9bfa8;
//           --olive:     #3d5016;
//           --olive2:    #5a6e2b;
//           --olivedim:  #eef1e3;
//           --gold:      #b8982a;
//           --gold2:     #f0e4a0;
//           --golddim:   #fdf8e8;
//           --ink:       #1a1d0d;
//           --ink7:      rgba(26,29,13,.7);
//           --ink4:      rgba(26,29,13,.4);
//           --ink2:      rgba(26,29,13,.15);
//           --green:     #2a6030;
//           --sage:      #8a9e6a;
//           --red:       #c0392b;
//           --ffd:       'Cormorant Garamond', Georgia, serif;
//           --ffb:       'DM Sans', system-ui, sans-serif;
//           --r:         12px;
//           --rsm:       8px;
//           --shadow:    0 4px 24px rgba(26,29,13,.10);
//           --shadow-lg: 0 8px 40px rgba(26,29,13,.16);
//         }
//         *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
//         html { scroll-behavior: smooth; }
//         body { font-family: var(--ffb); background: var(--bg); color: var(--ink); }
//         button { font-family: var(--ffb); cursor: pointer; background: transparent; border: none; }
//         img { display: block; max-width: 100%; }
//         textarea { font-family: var(--ffb); }

//         /* ── MODAL ── */
//         .modal-backdrop {
//           position: fixed; inset: 0; z-index: 1000;
//           background: rgba(10,12,5,.55);
//           backdrop-filter: blur(8px);
//           display: flex; align-items: center; justify-content: center;
//           padding: 16px;
//           animation: fadeIn .2s ease;
//         }
//         @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
//         .modal-box {
//           width: 100%; max-width: 520px;
//           max-height: calc(100dvh - 32px);
//           background: var(--surf);
//           border-radius: 16px;
//           overflow: hidden;
//           display: flex; flex-direction: column;
//           box-shadow: var(--shadow-lg);
//           animation: modalIn .28s cubic-bezier(.34,1.1,.64,1);
//         }
//         @keyframes modalIn {
//           from { opacity: 0; transform: scale(.94) translateY(16px); }
//           to   { opacity: 1; transform: scale(1) translateY(0); }
//         }
//         .modal-header {
//           display: flex; align-items: flex-start; justify-content: space-between;
//           padding: 18px 20px 14px;
//           background: linear-gradient(135deg, var(--olivedim) 0%, #ede9d8 100%);
//           border-bottom: 1px solid var(--bdr);
//           flex-shrink: 0;
//         }
//         .modal-header-text { flex: 1; min-width: 0; }
//         .modal-eyebrow {
//           display: block; font-size: 9px; font-weight: 700;
//           letter-spacing: .24em; text-transform: uppercase;
//           color: var(--sage); margin-bottom: 3px;
//         }
//         .modal-title { font-family: var(--ffd); font-size: 1.3rem; font-weight: 500; color: var(--olive); line-height: 1.2; }
//         .modal-close {
//           width: 34px; height: 34px; border-radius: 50%;
//           display: flex; align-items: center; justify-content: center;
//           color: var(--ink4); background: rgba(255,255,255,.6);
//           transition: all .15s; flex-shrink: 0; margin-left: 12px;
//           border: 1px solid var(--bdr);
//         }
//         .modal-close:hover { background: #fff; color: var(--ink); }
//         .modal-product-strip {
//           display: flex; align-items: center; gap: 14px;
//           padding: 12px 20px; border-bottom: 1px solid var(--bdr);
//           background: #fafaf6; flex-shrink: 0;
//         }
//         .modal-product-img { width: 54px; height: 54px; border-radius: var(--rsm); object-fit: cover; border: 1px solid var(--bdr); flex-shrink: 0; }
//         .modal-product-name { font-size: 13px; font-weight: 600; color: var(--ink); margin-bottom: 2px; }
//         .modal-product-price { font-size: 12px; color: var(--olive2); font-weight: 600; }
//         .modal-product-note { font-size: 10px; color: var(--ink4); margin-top: 3px; }
//         .modal-body { flex: 1; overflow-y: auto; padding: 18px 20px; display: flex; flex-direction: column; gap: 20px; }
//         .modal-body::-webkit-scrollbar { width: 3px; }
//         .modal-body::-webkit-scrollbar-thumb { background: var(--bdr2); border-radius: 3px; }
//         .modal-field { display: flex; flex-direction: column; gap: 9px; }
//         .modal-field-label {
//           display: flex; align-items: center; gap: 8px;
//           font-size: 10px; font-weight: 700; letter-spacing: .15em;
//           text-transform: uppercase; color: var(--ink);
//         }
//         .modal-field-num {
//           width: 20px; height: 20px; border-radius: 50%;
//           background: var(--olive); color: #fff;
//           font-size: 9px; font-weight: 700;
//           display: flex; align-items: center; justify-content: center; flex-shrink: 0;
//         }
//         .modal-field-optional { font-size: 8px; font-weight: 400; letter-spacing: .04em; text-transform: none; color: var(--ink4); padding: 2px 7px; border: 1px solid var(--bdr2); border-radius: 50px; }
//         .modal-selected-badge { font-size: 9px; font-weight: 600; text-transform: none; letter-spacing: .03em; background: var(--olive); color: #fff; padding: 2px 9px; border-radius: 50px; margin-left: auto; }
//         .modal-chips { display: flex; flex-wrap: wrap; gap: 8px; }
//         .chip { font-size: 12px; font-weight: 500; padding: 8px 16px; border-radius: 6px; border: 1.5px solid var(--bdr2); color: var(--ink7); transition: all .18s; min-height: 38px; display: flex; align-items: center; }
//         .chip:hover { border-color: var(--olive2); color: var(--olive); background: var(--olivedim); }
//         .chip-on { background: var(--olive); color: #fff !important; border-color: var(--olive) !important; }
//         .chip-size { min-width: 50px; justify-content: center; }
//         .modal-textarea { width: 100%; border: 1.5px solid var(--bdr); border-radius: var(--rsm); padding: 10px 12px; font-size: 13px; color: var(--ink); background: var(--bg); outline: none; resize: none; line-height: 1.65; transition: border-color .2s; }
//         .modal-textarea:focus { border-color: var(--olive2); background: #fff; }
//         .modal-textarea::placeholder { color: var(--ink4); }
//         .modal-char-count { font-size: 10px; color: var(--ink4); text-align: right; }
//         .modal-upload-zone { display: block; border: 2px dashed var(--bdr2); border-radius: var(--rsm); cursor: pointer; transition: all .2s; overflow: hidden; }
//         .modal-upload-zone:hover { border-color: var(--olive2); background: var(--olivedim); }
//         .modal-upload-empty { display: flex; flex-direction: column; align-items: center; gap: 7px; padding: 24px 16px; color: var(--ink4); text-align: center; }
//         .modal-upload-cta { font-size: 13px; font-weight: 500; color: var(--olive); }
//         .modal-upload-sub { font-size: 10px; }
//         .modal-upload-preview { display: flex; align-items: center; gap: 14px; padding: 12px 16px; background: var(--olivedim); }
//         .modal-upload-preview img { width: 52px; height: 52px; border-radius: 7px; object-fit: cover; }
//         .modal-upload-preview-name { font-size: 12px; font-weight: 600; color: var(--olive); display: block; }
//         .modal-upload-change { font-size: 10px; color: var(--ink4); display: block; margin-top: 2px; }
//         .modal-summary-box { background: var(--golddim); border: 1px solid rgba(184,152,42,.3); border-radius: var(--rsm); padding: 11px 14px; }
//         .modal-summary-title { font-size: 8.5px; font-weight: 700; letter-spacing: .15em; text-transform: uppercase; color: var(--gold); margin-bottom: 7px; }
//         .modal-summary-tags { display: flex; flex-wrap: wrap; gap: 5px; }
//         .modal-sum-tag { font-size: 11px; font-weight: 500; color: #7a6010; background: rgba(255,255,255,.7); border: 1px solid rgba(184,152,42,.3); padding: 3px 9px; border-radius: 50px; }
//         .modal-footer { padding: 12px 20px 18px; border-top: 1px solid var(--bdr); display: flex; gap: 10px; flex-shrink: 0; background: #fafaf6; }
//         .modal-btn-skip { flex: 1; font-size: 9.5px; font-weight: 600; letter-spacing: .1em; text-transform: uppercase; color: var(--ink4); border: 1.5px solid var(--bdr2); border-radius: 6px; padding: 12px 14px; transition: all .18s; min-height: 44px; }
//         .modal-btn-skip:hover { border-color: var(--ink4); color: var(--ink); }
//         .modal-btn-save { flex: 2; display: flex; align-items: center; justify-content: center; gap: 7px; font-size: 9.5px; font-weight: 700; letter-spacing: .14em; text-transform: uppercase; color: #fff; background: var(--olive); border-radius: 6px; padding: 12px 18px; min-height: 44px; box-shadow: 0 4px 14px rgba(61,80,22,.25); transition: all .2s; }
//         .modal-btn-save:hover { background: #2e3c0e; transform: translateY(-1px); }

//         /* ── PAGE SHELL ── */
//         .page { min-height: 100dvh; background: var(--bg); }

//         /* ── HERO ── */
//         .hero {
//           margin-top: 56px;
//           padding: clamp(28px,4vw,52px) clamp(20px,6vw,72px) clamp(20px,3vw,36px);
//           background: linear-gradient(155deg, #f5f2eb 0%, #ede5d0 55%, #f5f2eb 100%);
//           border-bottom: 1px solid var(--bdr);
//           position: relative; overflow: hidden;
//         }
//         .hero::before { content: ''; position: absolute; right: -80px; top: -80px; width: 360px; height: 360px; border-radius: 50%; background: radial-gradient(circle, rgba(184,152,42,.1) 0%, transparent 68%); pointer-events: none; }
//         .hero-eyebrow { display: flex; align-items: center; gap: 10px; font-size: 8px; letter-spacing: .44em; text-transform: uppercase; color: var(--gold); font-weight: 600; margin-bottom: 12px; }
//         .hero-line { width: 24px; height: 1px; background: var(--gold); opacity: .5; }
//         .hero h1 { font-family: var(--ffd); font-size: clamp(1.7rem, 5vw, 3.4rem); font-weight: 500; color: var(--olive); line-height: 1.08; margin-bottom: 10px; }
//         .hero h1 em { font-style: italic; color: var(--gold); }
//         .hero-desc { font-size: clamp(12px, 1.3vw, 13.5px); font-weight: 300; color: var(--ink7); max-width: 400px; line-height: 1.8; }

//         /* ── MODE BAR ── */
//         .modebar { padding: 18px clamp(20px,6vw,72px) 0; display: flex; align-items: flex-start; gap: 18px; flex-wrap: wrap; }
//         .modetoggle { display: flex; background: var(--surf); border: 1.5px solid var(--bdr2); border-radius: 8px; padding: 4px; gap: 3px; box-shadow: var(--shadow); flex-shrink: 0; }
//         .modebtn { font-size: 10px; font-weight: 600; letter-spacing: .12em; text-transform: uppercase; padding: clamp(8px,1.5vw,11px) clamp(14px,2.2vw,22px); border-radius: 6px; color: var(--ink7); transition: all .22s; min-height: 38px; }
//         .modebtn.on { background: var(--olive); color: #fff; box-shadow: 0 2px 10px rgba(61,80,22,.3); }
//         .modehint { font-size: 12px; font-weight: 300; color: var(--ink7); line-height: 1.75; max-width: 420px; padding-top: 10px; }

//         /* ── LAYOUT ── */
//         .layout { display: grid; grid-template-columns: 1fr 300px; gap: 24px; padding: clamp(18px,3vw,28px) clamp(20px,6vw,72px) 100px; align-items: start; }
//         @media (max-width: 1100px) { .layout { grid-template-columns: 1fr; } }

//         /* ── SECTION LABEL ── */
//         .sec-label { font-size: 8px; letter-spacing: .42em; text-transform: uppercase; color: var(--ink4); font-weight: 600; display: flex; align-items: center; gap: 12px; margin-bottom: 14px; }
//         .sec-label::after { content: ''; flex: 1; height: 1px; background: var(--bdr); }

//         /* ── COMBO GRID ── */
//         .cgrid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 12px; }
//         @media (max-width: 900px) { .cgrid { grid-template-columns: repeat(2, 1fr); } }
//         @media (max-width: 420px) { .cgrid { grid-template-columns: repeat(2, 1fr); gap: 8px; } }

//         /* ── COMBO CARD ── */
//         .cc-card {
//           background: var(--surf);
//           border: 1px solid var(--bdr);
//           cursor: pointer;
//           display: flex; flex-direction: column;
//           transition: all .2s cubic-bezier(.34,1.1,.64,1);
//           position: relative;
//           overflow: hidden;
//         }
//         .cc-card:hover { transform: translateY(-3px); box-shadow: var(--shadow-lg); border-color: var(--bdr2); }
//         .cc-card.cc-selected { border-color: var(--bdr); box-shadow: 0 4px 20px rgba(61,80,22,.15); }

//         .cc-img-area { position: relative; aspect-ratio: 4/5; overflow: hidden; }
//         .cc-img-area img { width: 100%; height: 100%; object-fit: cover; transition: transform .5s ease; }
//         .cc-card:hover .cc-img-area img { transform: scale(1.06); }
//         .cc-img-grad { position: absolute; inset: 0; background: linear-gradient(to bottom, transparent 35%, rgba(0,0,0,.65) 100%); }
//         .cc-pct-badge { position: absolute; top: 8px; right: 8px; font-size: 8px; font-weight: 700; background: var(--olive); color: #fff; padding: 3px 8px; }
//         .cc-label-badge { position: absolute; top: 8px; left: 8px; font-size: 7px; font-weight: 700; letter-spacing: .1em; text-transform: uppercase; background: rgba(255,255,255,.93); backdrop-filter: blur(4px); color: var(--ink); padding: 3px 8px; }
//         .cc-selected-check { position: absolute; bottom: 8px; right: 8px; width: 24px; height: 24px; background: var(--olive); color: #fff; display: flex; align-items: center; justify-content: center; z-index: 2; }
//         .cc-img-text { position: absolute; bottom: 0; left: 0; right: 0; padding: 10px 11px; }
//         .cc-img-name { font-family: var(--ffd); font-size: 1rem; font-weight: 500; color: #fff; text-shadow: 0 1px 6px rgba(0,0,0,.4); line-height: 1.2; }
//         .cc-img-tagline { font-size: 8px; color: rgba(255,255,255,.55); margin-top: 1px; }
//         .cc-color-strip { height: 2px; }
//         .cc-foot { padding: 10px 11px 11px; }
//         .cc-price-row { display: flex; align-items: baseline; gap: 6px; margin-bottom: 3px; flex-wrap: wrap; }
//         .cc-price { font-family: var(--ffd); font-size: 1rem; font-weight: 600; color: var(--ink); }
//         .cc-original { font-size: 9.5px; color: var(--ink4); text-decoration: line-through; }
//         .cc-save-tag { font-size: 8px; font-weight: 700; color: var(--green); background: rgba(42,96,48,.08); padding: 2px 6px; }
//         .cc-pieces-count { font-size: 9px; color: var(--ink4); margin-bottom: 4px; }
//         .cc-cust-dot { color: var(--olive2); }
//         .cc-cta-hint { font-size: 8.5px; color: var(--gold); font-weight: 600; letter-spacing: .03em; }
//         .cc-selected .cc-cta-hint { color: var(--olive); }

//         /* ── PANEL BACKDROP ── */
//         .panel-backdrop {
//           position: fixed; inset: 0; z-index: 400;
//           background: rgba(10,12,5,.4);
//           backdrop-filter: blur(4px);
//           animation: fadeIn .2s ease;
//         }

//         /* ── SIDE PANEL ── */
//         .side-panel {
//           position: fixed; top: 0; right: 0; bottom: 0; z-index: 401;
//           width: min(420px, 92vw);
//           background: var(--surf);
//           border-left: 1px solid var(--bdr);
//           display: flex; flex-direction: column;
//           box-shadow: -8px 0 40px rgba(26,29,13,.15);
//           animation: slideIn .28s cubic-bezier(.34,1.05,.64,1);
//           overflow: hidden;
//         }
//         @keyframes slideIn { from { transform: translateX(100%); } to { transform: translateX(0); } }

//         .panel-detail-img { width: 90px; height: 90px; flex-shrink: 0; overflow: hidden; border: 1px solid var(--bdr); position: relative; }
//         .panel-detail-img-link { display: block; width: 100%; height: 100%; text-decoration: none; }
//         .panel-detail-img-link img { width: 100%; height: 100%; object-fit: cover; }
//         .panel-detail-img-overlay {
//           position: absolute; inset: 0;
//           background: rgba(61,80,22,0);
//           display: flex; align-items: center; justify-content: center;
//           transition: background .2s;
//         }
//         .panel-detail-img-link:hover .panel-detail-img-overlay { background: rgba(61,80,22,0.3); }
//         .panel-detail-name-link { text-decoration: none; color: inherit; }
//         .panel-detail-name-link:hover .panel-detail-name {
//           text-decoration: underline;
//           text-decoration-color: var(--bdr2);
//           text-underline-offset: 3px;
//         }

//         @media (max-width: 600px) {
//           .side-panel {
//             top: auto; right: 0; left: 0; bottom: 0;
//             width: 100%; max-height: 82dvh;
//             border-left: none; border-top: 1px solid var(--bdr);
//             border-radius: 16px 16px 0 0;
//             animation: slideUp .28s cubic-bezier(.34,1.05,.64,1);
//           }
//           @keyframes slideUp { from { transform: translateY(100%); } to { transform: translateY(0); } }
//         }

//         .panel-head {
//           display: flex; align-items: flex-start; justify-content: space-between;
//           padding: 16px 18px 14px;
//           background: linear-gradient(135deg, var(--olivedim) 0%, #ede9d8 100%);
//           border-bottom: 1px solid var(--bdr);
//           flex-shrink: 0;
//         }
//         .panel-eyebrow { font-size: 8px; font-weight: 700; letter-spacing: .22em; text-transform: uppercase; color: var(--sage); margin-bottom: 3px; display: block; }
//         .panel-title { font-family: var(--ffd); font-size: 1.15rem; font-weight: 500; color: var(--olive); }
//         .panel-head-right { display: flex; align-items: center; gap: 10px; flex-shrink: 0; margin-left: 12px; }
//         .panel-prog { font-size: 9px; font-weight: 600; color: var(--olive2); background: var(--olivedim); border: 1px solid rgba(90,110,43,.25); padding: 3px 9px; white-space: nowrap; }
//         .panel-close { width: 32px; height: 32px; display: flex; align-items: center; justify-content: center; color: var(--ink4); background: rgba(255,255,255,.6); border: 1px solid var(--bdr); transition: all .15s; }
//         .panel-close:hover { background: #fff; color: var(--ink); }

//         .panel-thumbs {
//           display: flex; gap: 8px; overflow-x: auto; padding: 12px 16px;
//           border-bottom: 1px solid var(--bdr); flex-shrink: 0;
//           scroll-snap-type: x mandatory; -webkit-overflow-scrolling: touch;
//         }
//         .panel-thumbs::-webkit-scrollbar { height: 3px; }
//         .panel-thumbs::-webkit-scrollbar-thumb { background: var(--bdr2); }
//         .panel-thumb {
//           flex-shrink: 0; width: 56px; height: 56px;
//           position: relative; overflow: hidden;
//           border: 2px solid var(--bdr); cursor: pointer;
//           transition: all .18s; scroll-snap-align: start; background: none; padding: 0;
//         }
//         .panel-thumb img { width: 100%; height: 100%; object-fit: cover; }
//         .panel-thumb:hover { border-color: var(--olive2); }
//         .panel-thumb.active { border-color: var(--olive); }
//         .panel-thumb.done { border-color: var(--gold); }
//         .panel-thumb-check {
//           position: absolute; bottom: 2px; right: 2px;
//           width: 14px; height: 14px; background: var(--gold); color: #fff;
//           font-size: 7px; font-weight: 700; display: flex; align-items: center; justify-content: center;
//         }

//         .panel-detail {
//           display: flex; gap: 14px; padding: 16px 18px;
//           border-bottom: 1px solid var(--bdr); flex-shrink: 0;
//         }
//         .panel-detail-info { flex: 1; min-width: 0; display: flex; flex-direction: column; gap: 4px; }
//         .panel-detail-name { font-size: 13px; font-weight: 600; color: var(--ink); line-height: 1.3; }
//         .panel-detail-price { font-size: 12px; font-weight: 600; color: var(--olive2); }
//         .panel-detail-tags { display: flex; flex-wrap: wrap; gap: 4px; }
//         .panel-tag { font-size: 9px; background: var(--golddim); color: #7a6010; padding: 2px 7px; border: 1px solid rgba(184,152,42,.25); }
//         .panel-customise-btn {
//           margin-top: 4px; font-size: 9px; font-weight: 700; letter-spacing: .1em; text-transform: uppercase;
//           color: var(--olive); border: 1.5px solid var(--olive2); padding: 7px 12px;
//           transition: all .18s; align-self: flex-start; min-height: 32px;
//         }
//         .panel-customise-btn:hover { background: var(--olive); color: #fff; }

//         .panel-nav { display: flex; align-items: center; justify-content: space-between; padding: 10px 18px; border-bottom: 1px solid var(--bdr); flex-shrink: 0; }
//         .panel-nav-btn { font-size: 10px; font-weight: 600; color: var(--olive); letter-spacing: .08em; padding: 6px 14px; border: 1.5px solid var(--bdr2); transition: all .18s; min-height: 34px; }
//         .panel-nav-btn:hover:not(:disabled) { border-color: var(--olive); background: var(--olivedim); }
//         .panel-nav-btn:disabled { opacity: .35; cursor: default; }
//         .panel-nav-count { font-size: 10px; color: var(--ink4); }
//         .panel-tip { margin: 12px 18px; padding: 9px 13px; background: rgba(184,152,42,.08); font-size: 9.5px; color: var(--olive2); text-align: center; }

//         /* ── CUSTOM PRODUCT CARD ── */
//         .cp-card { background: var(--surf); border: 1.5px solid var(--bdr); overflow: hidden; display: flex; flex-direction: column; transition: all .2s; }
//         .cp-card:hover { border-color: var(--olive2); transform: translateY(-2px); box-shadow: 0 6px 16px rgba(26,29,13,.09); }
//         .cp-in-hamper { border-color: var(--gold); box-shadow: 0 0 0 2px rgba(184,152,42,.15); }
//         .cp-img { position: relative; aspect-ratio: 1; overflow: hidden; }
//         .cp-img-link { display: block; width: 100%; height: 100%; text-decoration: none; }
//         .cp-img-link img { width: 100%; height: 100%; object-fit: cover; transition: transform .3s; display: block; }
//         .cp-card:hover .cp-img-link img { transform: scale(1.05); }
//         /* Toggle button covers the whole image area for tap-to-add/remove,
//            but pointer-events are set to none on the img so the link can receive
//            clicks via the link layer underneath. The overlay div is non-interactive. */
//         .cp-img-toggle {
//           position: absolute; inset: 0; width: 100%; height: 100%;
//           background: transparent; border: none; cursor: pointer; padding: 0; z-index: 1;
//         }
//         .cp-in-overlay { position: absolute; inset: 0; background: rgba(61,80,22,.4); display: flex; align-items: center; justify-content: center; pointer-events: none; }
//         .cp-body { padding: 6px 8px 8px; display: flex; flex-direction: column; gap: 2px; }
//         .cp-name-link { text-decoration: none; color: inherit; }
//         .cp-name-link:hover .cp-name { color: var(--olive); text-decoration: underline; text-decoration-color: var(--bdr2); text-underline-offset: 2px; }
//         .cp-name { font-size: 9.5px; font-weight: 500; color: var(--ink); line-height: 1.3; }
//         .cp-price { font-size: 9.5px; font-weight: 600; color: var(--olive2); }
//         .cp-in-actions { display: flex; flex-direction: column; gap: 3px; }
//         .cp-tag-row { display: flex; flex-wrap: wrap; gap: 3px; }
//         .cp-tag { font-size: 7.5px; background: var(--golddim); color: #7a6010; padding: 1px 5px; border: 1px solid rgba(184,152,42,.25); }
//         .cp-edit-btn { font-size: 7.5px; font-weight: 700; letter-spacing: .07em; text-transform: uppercase; color: var(--olive); border: 1.5px solid var(--olive2); padding: 4px 0; min-height: 26px; transition: all .18s; }
//         .cp-edit-btn:hover { background: var(--olive); color: #fff; }
//         .cp-remove-btn { font-size: 7.5px; font-weight: 500; text-transform: uppercase; letter-spacing: .05em; color: var(--ink4); border: 1px solid var(--bdr2); padding: 3px 0; min-height: 24px; transition: all .18s; }
//         .cp-remove-btn:hover { color: var(--red); border-color: var(--red); }
//         .cp-add-btn { font-size: 8px; font-weight: 700; letter-spacing: .08em; text-transform: uppercase; color: var(--ink); border: 1.5px solid var(--bdr2); padding: 5px 0; min-height: 28px; transition: all .18s; margin-top: 2px; }
//         .cp-add-btn:hover { background: var(--olive); color: #fff; border-color: var(--olive); }

//         /* ── HAMPER STATUS ── */
//         .hamper-status { display: flex; align-items: center; justify-content: space-between; background: linear-gradient(135deg, var(--olive), var(--olive2)); color: #fff; padding: 12px 16px; margin-bottom: 18px; }
//         .hamper-status-left strong { font-family: var(--ffd); font-size: 1.1rem; }
//         .hamper-status-left span { font-size: 9.5px; opacity: .7; letter-spacing: .04em; display: block; margin-top: 1px; }
//         .hamper-clear { font-size: 8.5px; font-weight: 700; letter-spacing: .1em; text-transform: uppercase; color: rgba(255,255,255,.7); border: 1px solid rgba(255,255,255,.3); padding: 6px 12px; transition: all .18s; min-height: 32px; }
//         .hamper-clear:hover { background: rgba(255,255,255,.15); color: #fff; }

//         /* ── FIX 3: Category pills — accordion/radio behaviour ── */
//         .cat-pills { display: flex; flex-wrap: wrap; gap: 7px; margin-bottom: 18px; }
//         .cat-pill {
//           font-size: 9.5px; font-weight: 500; letter-spacing: .09em; text-transform: uppercase;
//           color: var(--ink7); padding: 8px 16px; min-height: 38px;
//           border: 1.5px solid var(--bdr2); transition: all .2s;
//           display: flex; align-items: center; gap: 6px;
//         }
//         .cat-pill:hover { color: var(--olive); border-color: var(--olive2); background: var(--olivedim); }
//         .cat-pill.on { background: var(--olive); color: #fff; border-color: var(--olive); }
//         /* Chevron indicator on active pill */
//         .cat-pill-chevron {
//           display: inline-block;
//           transition: transform .25s ease;
//           font-style: normal;
//           font-size: 10px;
//           opacity: .7;
//         }
//         .cat-pill.on .cat-pill-chevron { transform: rotate(180deg); opacity: 1; }

//         /* Category product grid — animated open/close */
//         .custom-section {
//           margin-bottom: 8px; overflow: hidden;
//           box-shadow: var(--shadow); border: 1px solid var(--bdr);
//           /* Use max-height transition for smooth accordion effect */
//         }
//         .custom-section-inner {
//           overflow: hidden;
//           transition: max-height 0.35s cubic-bezier(.4,0,.2,1);
//         }
//         .custom-sec-head {
//           display: flex; align-items: center; justify-content: space-between;
//           padding: 11px 16px;
//           background: linear-gradient(135deg, var(--olivedim), #ede9d8);
//           border-bottom: 1px solid var(--bdr);
//         }
//         .custom-sec-title { font-family: var(--ffd); font-size: 1rem; font-weight: 500; color: var(--olive); }
//         .custom-sec-count { font-size: 9.5px; color: var(--olive2); font-weight: 600; }
//         .custom-prod-grid {
//           display: grid; grid-template-columns: repeat(auto-fill, minmax(110px, 1fr));
//           gap: 10px; padding: 12px 14px 14px; background: var(--surf);
//         }
//         @media (max-width: 600px) {
//           .custom-prod-grid { grid-template-columns: repeat(3, 1fr); gap: 6px; padding: 8px 10px 10px; }
//           .cp-name { font-size: 9px; }
//           .cp-price { font-size: 9px; }
//           .cp-body { padding: 5px 6px 7px; gap: 2px; }
//         }
//         @media (max-width: 380px) {
//           .custom-prod-grid { grid-template-columns: repeat(3, 1fr); gap: 5px; padding: 7px 8px 9px; }
//           .cp-name { font-size: 8px; }
//           .cp-price { font-size: 8px; }
//           .cp-edit-btn, .cp-remove-btn, .cp-add-btn { font-size: 7px; min-height: 22px; padding: 3px 0; }
//         }

//         /* ── SUMMARY PANEL (desktop right col) ── */
//         .summary-panel { position: sticky; top: 76px; background: var(--surf); border: 1px solid var(--bdr); overflow: hidden; box-shadow: var(--shadow); }
//         .sum-head { padding: 16px 18px 13px; background: linear-gradient(135deg, var(--olivedim), #ede5d0); border-bottom: 1px solid var(--bdr); }
//         .sum-title { font-family: var(--ffd); font-size: 1.05rem; font-weight: 500; color: var(--olive); }
//         .sum-modetag { display: block; font-size: 7.5px; font-weight: 700; letter-spacing: .2em; text-transform: uppercase; color: var(--gold); margin-top: 2px; }
//         .sum-body { padding: 14px 16px 18px; }
//         .sum-list { margin-bottom: 13px; max-height: 260px; overflow-y: auto; }
//         .sum-list::-webkit-scrollbar { width: 3px; }
//         .sum-list::-webkit-scrollbar-thumb { background: var(--bdr2); }
//         .sum-row { display: flex; align-items: center; gap: 9px; padding: 8px 0; border-bottom: 1px solid var(--ink2); }
//         .sum-row:last-child { border-bottom: none; }
//         .sum-thumb { width: 36px; height: 36px; object-fit: cover; border: 1px solid var(--bdr); flex-shrink: 0; }
//         .sum-info { flex: 1; min-width: 0; }
//         .sum-cat { font-size: 7px; letter-spacing: .14em; text-transform: uppercase; color: var(--ink4); display: block; }
//         .sum-name { font-size: 10px; font-weight: 500; color: var(--ink); display: block; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
//         .sum-tags { display: flex; gap: 3px; flex-wrap: wrap; margin-top: 2px; }
//         .sum-tag { font-size: 7px; font-weight: 500; background: var(--golddim); color: #7a6010; padding: 1.5px 6px; }
//         .sum-price { font-size: 10px; font-weight: 600; color: var(--olive); flex-shrink: 0; }
//         .sum-check { width: 18px; height: 18px; background: var(--olivedim); color: var(--olive); display: flex; align-items: center; justify-content: center; font-size: 8.5px; flex-shrink: 0; }
//         .sum-empty { text-align: center; font-family: var(--ffd); font-style: italic; font-size: 13px; color: var(--ink4); padding: 22px 0; }
//         .sum-divider { height: 1px; margin: 13px 0; background: linear-gradient(90deg, transparent, var(--gold2), transparent); }
//         .sum-total-row { display: flex; justify-content: space-between; align-items: baseline; margin-bottom: 4px; }
//         .sum-total-lbl { font-size: 8px; font-weight: 700; letter-spacing: .15em; text-transform: uppercase; color: var(--ink4); }
//         .sum-total-val { font-family: var(--ffd); font-size: 1.6rem; font-weight: 600; color: var(--ink); }
//         .sum-saving { font-size: 11px; font-weight: 500; color: var(--green); margin-bottom: 14px; }
//         .btn-cart { width: 100%; display: flex; align-items: center; justify-content: center; gap: 7px; font-size: 9.5px; font-weight: 700; letter-spacing: .15em; text-transform: uppercase; color: #fff; background: var(--olive); padding: 14px; margin-bottom: 8px; min-height: 48px; box-shadow: 0 4px 14px rgba(61,80,22,.25); transition: all .2s; }
//         .btn-cart:hover:not(:disabled) { background: #2e3c0e; transform: translateY(-1px); }
//         .btn-cart:disabled { opacity: .4; cursor: not-allowed; }
//         .btn-cart.done { background: var(--green) !important; }
//         .btn-buy { width: 100%; display: flex; align-items: center; justify-content: center; gap: 7px; font-size: 9.5px; font-weight: 700; letter-spacing: .13em; text-transform: uppercase; color: var(--ink); background: var(--gold2); border: 1.5px solid var(--gold); padding: 12px; min-height: 44px; transition: all .2s; }
//         .btn-buy:hover:not(:disabled) { background: var(--gold); color: #fff; transform: translateY(-1px); }
//         .btn-buy:disabled { opacity: .4; cursor: not-allowed; }
//         .perks { display: flex; justify-content: center; gap: 12px; margin-top: 12px; flex-wrap: wrap; }
//         .perk { font-size: 8.5px; color: var(--ink4); display: flex; align-items: center; gap: 4px; }
//         .perk::before { content: '◆'; font-size: 4.5px; color: var(--gold); opacity: .6; }

//         /* ─────────────────────────────────────────────────────────
//            FIX 1: Mobile bottom bar — cart button always visible
//            ───────────────────────────────────────────────────────── */
//         .mobile-bar {
//           display: none;
//           position: fixed; bottom: 0; left: 0; right: 0; z-index: 200;
//           background: var(--surf);
//           border-top: 1px solid var(--bdr);
//           /* Safe-area padding so content clears home indicator */
//           padding: 10px 16px max(14px, env(safe-area-inset-bottom, 14px));
//           align-items: stretch;
//           gap: 10px;
//           box-shadow: 0 -4px 20px rgba(26,29,13,.12);
//           /* Ensure the bar itself is tall enough to contain both children */
//           min-height: calc(64px + env(safe-area-inset-bottom, 0px));
//         }
//         .mobile-bar-info {
//           flex: 1; text-align: left; padding: 0; background: none; border: none;
//           display: flex; flex-direction: column; justify-content: center;
//           min-width: 0;
//         }
//         .mobile-bar-count { font-size: 9px; color: var(--ink4); font-weight: 500; }
//         .mobile-bar-price { font-family: var(--ffd); font-size: 1.3rem; font-weight: 600; color: var(--ink); line-height: 1.1; }
//         .mobile-bar-save { font-size: 9.5px; color: var(--green); font-weight: 500; }
//         .mobile-bar-view { font-size: 8.5px; color: var(--gold); font-weight: 600; }
//         .mobile-bar-empty { font-size: 11px; color: var(--ink4); font-style: italic; }

//         /* FIX 1: Cart button — fixed width, vertically centred, never hidden */
//         .mobile-bar-cart {
//           flex-shrink: 0;
//           align-self: center;       /* vertically centre inside the bar */
//           font-size: 10px; font-weight: 700; letter-spacing: .13em; text-transform: uppercase;
//           color: #fff; background: var(--olive);
//           padding: 0 20px;
//           height: 46px;
//           min-width: 120px;
//           box-shadow: 0 4px 12px rgba(61,80,22,.25);
//           transition: all .18s;
//           display: flex; align-items: center; justify-content: center;
//           border: none;
//         }
//         .mobile-bar-cart.done { background: var(--green); }
//         .mobile-bar-cart:disabled { opacity: .4; cursor: not-allowed; }
//         .mobile-bar-cart:not(:disabled):active { transform: scale(.97); }

//         /* FIX 1: Give the page content enough bottom clearance so the last
//            card is never hidden behind the bar on mobile. */
//         @media (max-width: 1100px) {
//           .layout {
//             padding-bottom: calc(100px + env(safe-area-inset-bottom, 0px)) !important;
//           }
//           .summary-panel { display: none; }
//           .mobile-bar { display: flex; }
//         }

//         /* ── MOBILE SUMMARY SHEET ── */
//         .mobile-sum-backdrop { position: fixed; inset: 0; z-index: 300; background: rgba(10,12,5,.55); backdrop-filter: blur(5px); display: flex; align-items: flex-end; }
//         .mobile-sum-sheet {
//           width: 100%; background: var(--surf); border-radius: 16px 16px 0 0;
//           max-height: 82dvh; overflow-y: auto;
//           padding-bottom: max(16px, env(safe-area-inset-bottom, 16px));
//           animation: sheetUp .25s cubic-bezier(.34,1.1,.64,1);
//         }
//         @keyframes sheetUp { from { transform: translateY(100%); } to { transform: translateY(0); } }
//         .mobile-sum-handle { display: flex; justify-content: center; padding: 11px; }
//         .mobile-sum-handle-bar { width: 32px; height: 3px; border-radius: 2px; background: var(--bdr2); }
//         .mobile-sum-title { font-family: var(--ffd); font-size: 1.15rem; font-weight: 500; color: var(--olive); padding: 0 18px 11px; border-bottom: 1px solid var(--bdr); }
//         .mobile-sum-list { padding: 0 18px; }
//         .mobile-sum-footer { padding: 14px 18px 0; }

//         /* ── LOADING ── */
//         .loading { display: flex; align-items: center; justify-content: center; min-height: 40vh; font-family: var(--ffd); font-style: italic; font-size: 1.25rem; color: var(--ink4); }

//         /* ── RESPONSIVE ── */
//         @media (max-width: 760px) {
//           .hero, .modebar, .layout { padding-left: 14px; padding-right: 14px; }
//           .hero { margin-top: 48px; padding-top: 24px; }
//           .layout { padding-top: 16px; }
//         }
//         @media (min-width: 1101px) {
//           .mobile-bar { display: none !important; }
//           .mobile-sum-backdrop { display: none !important; }
//         }
//       `}</style>

//       <div className="page">
//         <UpperNav />

//         {/* HERO */}
//         <div className="hero">
//           <div className="hero-eyebrow">
//             <span className="hero-line"/>
//             <span>Jewellery Collections</span>
//             <span className="hero-line"/>
//           </div>
//           <h1>Build Your <em>Perfect</em><br />Jewellery Hamper</h1>
//           <p className="hero-desc">Choose a curated set and personalise every piece — or build something entirely your own.</p>
//         </div>

//         {/* MODE BAR */}
//         <div className="modebar">
//           <div className="modetoggle">
//             <button className={`modebtn${mode === 'preset' ? ' on' : ''}`} onClick={() => setMode('preset')}>◈ Curated Sets</button>
//             <button className={`modebtn${mode === 'custom' ? ' on' : ''}`} onClick={() => setMode('custom')}>✦ Build Your Own</button>
//           </div>
//           <p className="modehint">
//             {mode === 'preset'
//               ? 'Pick a curated hamper, tap to view & personalise each piece.'
//               : 'Choose a category, pick your pieces, customise each one, and add to cart.'}
//           </p>
//         </div>

//         {/* SIDE PANEL (preset mode) */}
//         {mode === 'preset' && panelCombo && (
//           <SidePanel
//             combo={panelCombo}
//             products={panelProducts}
//             variants={presetVariants}
//             onVariantChange={(pid, v) => setPresetVariants(prev => ({ ...prev, [pid]: v }))}
//             categoryLabels={categoryLabels}
//             onClose={() => setPanelCombo(null)}
//           />
//         )}

//         {/* ADD-FLOW MODAL */}
//         {pendingAdd && (
//           <ProductCustomiser
//             product={pendingAdd}
//             variant={{}}
//             onSave={v => { setHamper(prev => ({ ...prev, [pendingAdd.id]: v })); setPendingAdd(null); }}
//             onClose={() => setPendingAdd(null)}
//             isAddFlow
//           />
//         )}

//         {/* EDIT MODAL */}
//         {editingProduct && (
//           <ProductCustomiser
//             product={editingProduct}
//             variant={hamper[editingProduct.id] || {}}
//             onSave={v => { setHamper(prev => ({ ...prev, [editingProduct.id]: v })); setEditingProduct(null); }}
//             onClose={() => setEditingProduct(null)}
//           />
//         )}

//         {/* MOBILE SUMMARY DRAWER */}
//         {showMobileSummary && (
//           <div className="mobile-sum-backdrop" onClick={e => e.target === e.currentTarget && setShowMobileSummary(false)}>
//             <div className="mobile-sum-sheet">
//               <div className="mobile-sum-handle"><div className="mobile-sum-handle-bar"/></div>
//               <div className="mobile-sum-title">Your Hamper Summary</div>
//               <div className="mobile-sum-list">
//                 {summaryItems.length === 0 ? (
//                   <p className="sum-empty">No pieces added yet.</p>
//                 ) : summaryItems.map(({ k, p }) => {
//                   const v = mode === 'preset' ? (presetVariants[p.id] || {}) : (hamper[p.id] || {});
//                   const tags = [v.colour, v.size ? `Size ${v.size}` : '', v.personalMessage ? '✉ Msg' : ''].filter(Boolean);
//                   return (
//                     <div key={`${k}-${p.id}`} className="sum-row">
//                       <img className="sum-thumb" src={p.image || '/images/hero.png'} alt={p.name} />
//                       <div className="sum-info">
//                         <span className="sum-cat">{categoryLabels[k] || k}</span>
//                         <span className="sum-name">{p.name}</span>
//                         {tags.length > 0 && <div className="sum-tags">{tags.map(t => <span key={t} className="sum-tag">{t}</span>)}</div>}
//                       </div>
//                       <span className="sum-price">₹{p.price.toLocaleString('en-IN')}</span>
//                     </div>
//                   );
//                 })}
//               </div>
//               <div className="mobile-sum-footer">
//                 <div className="sum-divider"/>
//                 <div className="sum-total-row">
//                   <span className="sum-total-lbl">Total</span>
//                   <span className="sum-total-val">₹{totalPrice.toLocaleString('en-IN')}</span>
//                 </div>
//                 {savings > 0 && <p className="sum-saving">🎉 You save ₹{savings.toLocaleString('en-IN')}</p>}
//                 <button className={`btn-cart${cartAdded ? ' done' : ''}`} onClick={() => { handleAddToCart(); setShowMobileSummary(false); }} disabled={!hasItems}>
//                   {cartAdded ? '✓ Added to Cart!' : 'Add Hamper to Cart'}
//                 </button>
//                 <button className="btn-buy" onClick={() => { setShowMobileSummary(false); handleBuyNow(); }} disabled={!hasItems}>
//                   <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M5 12h14M12 5l7 7-7 7"/></svg>
//                   Buy It Now
//                 </button>
//               </div>
//             </div>
//           </div>
//         )}

//         {/* LAYOUT */}
//         <div className="layout">
//           <div>
//             {isLoading ? (
//               <div className="loading">Loading collections…</div>
//             ) : mode === 'preset' ? (
//               <>
//                 <div className="sec-label">Choose a Hamper Set</div>
//                 <div className="cgrid">
//                   {presetCombos.map(c => (
//                     <ComboCard
//                       key={c.id}
//                       combo={c}
//                       selected={selectedComboId === c.id}
//                       onSelect={setSelectedComboId}
//                       productsByCategory={productsByCategory}
//                       categoryLabels={categoryLabels}
//                       variants={presetVariants}
//                       onVariantChange={(pid, v) => setPresetVariants(prev => ({ ...prev, [pid]: v }))}
//                       onOpenPanel={handleOpenPanel}
//                     />
//                   ))}
//                 </div>
//               </>
//             ) : (
//               <>
//                 {/* ── FIX 3: Category pills — only one open at a time ── */}
//                 <div className="sec-label">1. Select a Category</div>
//                 <div className="cat-pills">
//                   {allCategories.map(cat => {
//                     const isOpen = activeCategory === cat;
//                     const countInHamper = (productsByCategory[cat] ?? []).filter(p => hamperProductIds.includes(p.id)).length;
//                     return (
//                       <button
//                         key={cat}
//                         className={`cat-pill${isOpen ? ' on' : ''}`}
//                         onClick={() => handleCategoryPillClick(cat)}
//                       >
//                         {isOpen ? '✓ ' : '+ '}
//                         {categoryLabels[cat] || cat}
//                         {countInHamper > 0 && !isOpen && (
//                           <span style={{ marginLeft: 4, fontSize: 8, background: 'var(--gold)', color: '#fff', padding: '1px 5px', borderRadius: 50 }}>
//                             {countInHamper}
//                           </span>
//                         )}
//                         <em className="cat-pill-chevron">▾</em>
//                       </button>
//                     );
//                   })}
//                 </div>

//                 {hamperProductIds.length > 0 && (
//                   <div className="hamper-status">
//                     <div className="hamper-status-left">
//                       <strong>{hamperProductIds.length} piece{hamperProductIds.length !== 1 ? 's' : ''}</strong>{' '}in your hamper
//                       <span>Items go to cart together as one hamper</span>
//                     </div>
//                     <button className="hamper-clear" onClick={() => setHamper({})}>Clear all</button>
//                   </div>
//                 )}

//                 {/* ── FIX 3: Only the active category's grid is rendered ── */}
//                 {activeCategory !== null && (productsByCategory[activeCategory] ?? []).length > 0 && (
//                   <>
//                     <div className="sec-label" style={{ marginTop: 4, marginBottom: 12 }}>2. Pick Your Pieces</div>
//                     <div className="custom-section">
//                       <div className="custom-sec-head">
//                         <span className="custom-sec-title">{categoryLabels[activeCategory] || activeCategory}</span>
//                         {(productsByCategory[activeCategory] ?? []).filter(p => hamperProductIds.includes(p.id)).length > 0 && (
//                           <span className="custom-sec-count">
//                             {(productsByCategory[activeCategory] ?? []).filter(p => hamperProductIds.includes(p.id)).length} selected
//                           </span>
//                         )}
//                       </div>
//                       <div className="custom-prod-grid">
//                         {(productsByCategory[activeCategory] ?? []).map(p => (
//                           <CustomProdCard
//                             key={p.id}
//                             product={p}
//                             inHamper={hamperProductIds.includes(p.id)}
//                             variant={hamper[p.id] || {}}
//                             onAdd={() => handleProductAdd(p)}
//                             onRemove={() => handleProductRemove(p.id)}
//                             onEditCustomise={() => setEditingProduct(p)}
//                           />
//                         ))}
//                       </div>
//                     </div>
//                   </>
//                 )}

//                 {activeCategory === null && allCategories.length > 0 && (
//                   <p style={{ fontSize: 12, color: 'var(--ink4)', fontStyle: 'italic', marginTop: 8 }}>
//                     Select a category above to browse and add pieces to your hamper.
//                   </p>
//                 )}
//               </>
//             )}
//           </div>

//           {/* RIGHT — DESKTOP SUMMARY */}
//           <div>
//             <div className="summary-panel">
//               <div className="sum-head">
//                 <div className="sum-title">Your Hamper</div>
//                 <span className="sum-modetag">{mode === 'preset' ? '◈ Curated Set' : '✦ Custom Build'}</span>
//               </div>
//               <div className="sum-body">
//                 <div className="sum-list">
//                   {summaryItems.length === 0 ? (
//                     <p className="sum-empty">{mode === 'preset' ? 'Select a hamper above.' : 'Add pieces to see them here.'}</p>
//                   ) : summaryItems.map(({ k, p }) => {
//                     const v = mode === 'preset' ? (presetVariants[p.id] || {}) : (hamper[p.id] || {});
//                     const tags = [v.colour, v.size ? `Size ${v.size}` : '', v.personalMessage ? '✉ Msg' : '', v.uploadedImageBase64 ? '📷' : ''].filter(Boolean);
//                     return (
//                       <div key={`${k}-${p.id}`} className="sum-row">
//                         <img className="sum-thumb" src={p.image || '/images/hero.png'} alt={p.name} />
//                         <div className="sum-info">
//                           <span className="sum-cat">{categoryLabels[k] || k}</span>
//                           <span className="sum-name">{p.name}</span>
//                           {tags.length > 0 && <div className="sum-tags">{tags.map(t => <span key={t} className="sum-tag">{t}</span>)}</div>}
//                         </div>
//                         {mode === 'preset'
//                           ? <span className="sum-check">✓</span>
//                           : <span className="sum-price">₹{p.price.toLocaleString('en-IN')}</span>
//                         }
//                       </div>
//                     );
//                   })}
//                 </div>
//                 <div className="sum-divider"/>
//                 <div className="sum-total-row">
//                   <span className="sum-total-lbl">Total</span>
//                   <span className="sum-total-val">₹{totalPrice.toLocaleString('en-IN')}</span>
//                 </div>
//                 {savings > 0 && <p className="sum-saving">🎉 You save ₹{savings.toLocaleString('en-IN')}</p>}
//                 <button className={`btn-cart${cartAdded ? ' done' : ''}`} onClick={handleAddToCart} disabled={!hasItems}>
//                   {cartAdded ? (
//                     <><svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><polyline points="20 6 9 17 4 12"/></svg> Added to Cart!</>
//                   ) : (
//                     <><svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M6 2L3 6v14a2 2 0 002 2h14a2 2 0 002-2V6l-3-4z"/><line x1="3" y1="6" x2="21" y2="6"/><path d="M16 10a4 4 0 01-8 0"/></svg> Add Hamper to Cart</>
//                   )}
//                 </button>
//                 <button className="btn-buy" onClick={handleBuyNow} disabled={!hasItems}>
//                   <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M5 12h14M12 5l7 7-7 7"/></svg>
//                   Buy It Now
//                 </button>
//                 <div className="perks">
//                   <span className="perk">Free shipping ₹599+</span>
//                   <span className="perk">COD available</span>
//                   <span className="perk">Easy returns</span>
//                 </div>
//               </div>
//             </div>
//           </div>
//         </div>

//         {/* MOBILE BOTTOM BAR — FIX 1: always visible, cart button never hidden */}
//         <MobileSummaryBar
//           totalPrice={totalPrice}
//           savings={savings}
//           itemCount={summaryItems.length}
//           onOpen={() => setShowMobileSummary(true)}
//           hasItems={hasItems}
//           onAddToCart={handleAddToCart}
//           cartAdded={cartAdded}
//         />
//       </div>
//     </>
//   );
// }



'use client';

import {
  useState,
  useMemo,
  useCallback,
  useEffect,
  type ChangeEvent,
} from 'react';
import { useRouter } from 'next/navigation';
import { useCart } from '@/lib/cartContext';
import UpperNav from '@/components/ui/UpperNav';
import { sortProducts, type SortOption } from '@/components/ui/SortFilter';
import { apiRequest } from '@/lib/api';

/* ─────────────────────────────────────────────────────────────
   TYPES
───────────────────────────────────────────────────────────── */
type CategoryKey = string;

interface ProductVariant {
  colour?: string;
  size?: string;
  personalMessage?: string;
  uploadedImageBase64?: string;
}

interface ComboProduct {
  id: string;
  name: string;
  price: number;
  image: string;
  customisable: boolean;
  availableColours?: string[];
  availableSizes?: string[];
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
   PRODUCT CUSTOMISER MODAL
───────────────────────────────────────────────────────────── */
interface CustomiserProps {
  product: ComboProduct;
  variant: ProductVariant;
  onSave: (v: ProductVariant) => void;
  onClose: () => void;
  isAddFlow?: boolean;
}

function ProductCustomiser({ product, variant, onSave, onClose, isAddFlow }: CustomiserProps) {
  const [local, setLocal] = useState<ProductVariant>({ ...variant });

  const handleFile = (e: ChangeEvent<HTMLInputElement>) => {
    const f = e.currentTarget.files?.[0];
    if (!f) return;
    const r = new FileReader();
    r.onload = ev => setLocal(prev => ({ ...prev, uploadedImageBase64: ev.target?.result as string }));
    r.readAsDataURL(f);
  };

  const colours = product.availableColours?.length
    ? product.availableColours
    : ['Gold', 'Silver', 'Rose Gold', 'Antique'];

  const sizes = product.availableSizes?.length
    ? product.availableSizes
    : ['XS', 'S', 'M', 'L', 'XL'];

  const hasAnySelection = !!(local.colour || local.size || local.personalMessage || local.uploadedImageBase64);

  return (
    <div className="modal-backdrop" onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="modal-box" role="dialog" aria-modal="true">
        <div className="modal-header">
          <div className="modal-header-text">
            <span className="modal-eyebrow">Customise Piece</span>
            <h2 className="modal-title">{product.name}</h2>
          </div>
          <button className="modal-close" onClick={onClose} aria-label="Close dialog">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
            </svg>
          </button>
        </div>

        <div className="modal-product-strip">
          <img className="modal-product-img" src={product.image || '/images/hero.png'} alt={product.name} />
          <div className="modal-product-info">
            <div className="modal-product-name">{product.name}</div>
            <div className="modal-product-price">₹{product.price.toLocaleString('en-IN')}</div>
            {isAddFlow && <div className="modal-product-note">Choose your preferences, then add to hamper</div>}
          </div>
        </div>

        <div className="modal-body">
          <div className="modal-field">
            <label className="modal-field-label">
              <span className="modal-field-num">1</span>
              Select Colour
              {local.colour && <span className="modal-selected-badge">{local.colour}</span>}
            </label>
            <div className="modal-chips">
              {colours.map(c => (
                <button key={c} className={`chip${local.colour === c ? ' chip-on' : ''}`}
                  onClick={() => setLocal(prev => ({ ...prev, colour: c }))}>{c}</button>
              ))}
            </div>
          </div>

          <div className="modal-field">
            <label className="modal-field-label">
              <span className="modal-field-num">2</span>
              Select Size
              {local.size && <span className="modal-selected-badge">Size {local.size}</span>}
            </label>
            <div className="modal-chips">
              {sizes.map(s => (
                <button key={s} className={`chip chip-size${local.size === s ? ' chip-on' : ''}`}
                  onClick={() => setLocal(prev => ({ ...prev, size: s }))}>{s}</button>
              ))}
            </div>
          </div>

          <div className="modal-field">
            <label className="modal-field-label">
              <span className="modal-field-num">3</span>
              Personalised Message
              <span className="modal-field-optional">optional</span>
            </label>
            <textarea className="modal-textarea"
              placeholder="E.g. 'To my dearest Priya, with love…'"
              value={local.personalMessage || ''}
              onChange={e => setLocal(prev => ({ ...prev, personalMessage: e.target.value }))}
              maxLength={120} rows={3} />
            <div className="modal-char-count">{(local.personalMessage || '').length}/120 characters</div>
          </div>

          <div className="modal-field">
            <label className="modal-field-label">
              <span className="modal-field-num">4</span>
              Upload Photo
              <span className="modal-field-optional">optional</span>
            </label>
            <label className="modal-upload-zone">
              <input type="file" accept="image/*" style={{ display: 'none' }} onChange={handleFile} />
              {local.uploadedImageBase64 ? (
                <div className="modal-upload-preview">
                  <img src={local.uploadedImageBase64} alt="Uploaded preview" />
                  <div className="modal-upload-preview-info">
                    <span className="modal-upload-preview-name">Photo uploaded ✓</span>
                    <span className="modal-upload-change">Tap to change</span>
                  </div>
                </div>
              ) : (
                <div className="modal-upload-empty">
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                    <rect x="3" y="3" width="18" height="18" rx="3"/>
                    <circle cx="8.5" cy="8.5" r="1.5"/>
                    <polyline points="21 15 16 10 5 21"/>
                  </svg>
                  <span className="modal-upload-cta">Tap to upload a photo</span>
                  <span className="modal-upload-sub">JPG, PNG, WEBP supported</span>
                </div>
              )}
            </label>
          </div>

          {hasAnySelection && (
            <div className="modal-summary-box">
              <div className="modal-summary-title">Your selections</div>
              <div className="modal-summary-tags">
                {local.colour && <span className="modal-sum-tag">🎨 {local.colour}</span>}
                {local.size && <span className="modal-sum-tag">📐 Size {local.size}</span>}
                {local.personalMessage && <span className="modal-sum-tag">✉ Personal message</span>}
                {local.uploadedImageBase64 && <span className="modal-sum-tag">📷 Photo added</span>}
              </div>
            </div>
          )}
        </div>

        <div className="modal-footer">
          <button className="modal-btn-skip" onClick={() => { onSave({}); onClose(); }}>Skip customisation</button>
          <button className="modal-btn-save" onClick={() => { onSave(local); onClose(); }}>
            {isAddFlow ? (
              <><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M12 5v14M5 12l7 7 7-7"/></svg>Add to Hamper</>
            ) : (
              <><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><polyline points="20 6 9 17 4 12"/></svg>Save Changes</>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}

/* ─────────────────────────────────────────────────────────────
   COMBO CARD — Card + Side Panel layout
───────────────────────────────────────────────────────────── */
interface ComboCardProps {
  combo: PresetCombo;
  selected: boolean;
  onSelect: (id: string) => void;
  productsByCategory: Record<string, ComboProduct[]>;
  categoryLabels: Record<string, string>;
  variants: Record<string, ProductVariant>;
  onVariantChange: (productId: string, v: ProductVariant) => void;
  onOpenPanel: (combo: PresetCombo, products: ComboProduct[]) => void;
}

function ComboCard({ combo, selected, onSelect, productsByCategory, categoryLabels, variants, onVariantChange, onOpenPanel }: ComboCardProps) {
  const pct = Math.round(((combo.originalPrice - combo.price) / combo.originalPrice) * 100);

  const hamperProducts: ComboProduct[] = useMemo(() => {
    const seen = new Set<string>();
    const result: ComboProduct[] = [];
    combo.includedCategories.forEach(cat => {
      (productsByCategory[cat] ?? []).forEach(p => {
        if (!seen.has(p.id)) { seen.add(p.id); result.push(p); }
      });
    });
    return result;
  }, [combo, productsByCategory]);

  const customisedCount = hamperProducts.filter(p =>
    !!(variants[p.id]?.colour || variants[p.id]?.size || variants[p.id]?.personalMessage || variants[p.id]?.uploadedImageBase64)
  ).length;

  const handleClick = () => {
    onSelect(combo.id);
    onOpenPanel(combo, hamperProducts);
  };

  return (
    <div className={`cc-card${selected ? ' cc-selected' : ''}`} onClick={handleClick}>
      <div className="cc-img-area">
        <img src={combo.image || '/images/hero.png'} alt={combo.name} />
        <div className="cc-img-grad" />
        {pct > 0 && <span className="cc-pct-badge">{pct}% off</span>}
        {combo.badge && <span className="cc-label-badge">{combo.badge}</span>}
        {selected && (
          <div className="cc-selected-check">
            <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3.5">
              <polyline points="20 6 9 17 4 12"/>
            </svg>
          </div>
        )}
        <div className="cc-img-text">
          <div className="cc-img-name">{combo.name}</div>
          <div className="cc-img-tagline">{combo.tagline}</div>
        </div>
      </div>
      <div className="cc-color-strip" style={{ background: combo.tint }} />
      <div className="cc-foot">
        <div className="cc-price-row">
          <span className="cc-price">₹{combo.price.toLocaleString('en-IN')}</span>
          {combo.originalPrice > combo.price && (
            <span className="cc-original">₹{combo.originalPrice.toLocaleString('en-IN')}</span>
          )}
          {pct > 0 && <span className="cc-save-tag">Save {pct}%</span>}
        </div>
        <div className="cc-pieces-count">
          {hamperProducts.length} pieces
          {customisedCount > 0 && <span className="cc-cust-dot"> · {customisedCount} customised</span>}
        </div>
        <div className="cc-cta-hint">
          {selected ? '✦ Selected — tap to view pieces' : 'Tap to select & view pieces →'}
        </div>
      </div>
    </div>
  );
}

/* ─────────────────────────────────────────────────────────────
   SIDE PANEL — slides in from right on desktop, bottom sheet on mobile
───────────────────────────────────────────────────────────── */
interface SidePanelProps {
  combo: PresetCombo | null;
  products: ComboProduct[];
  variants: Record<string, ProductVariant>;
  onVariantChange: (productId: string, v: ProductVariant) => void;
  categoryLabels: Record<string, string>;
  onClose: () => void;
}

function SidePanel({ combo, products, variants, onVariantChange, categoryLabels, onClose }: SidePanelProps) {
  const [customising, setCustomising] = useState<ComboProduct | null>(null);
  const [activeIdx, setActiveIdx] = useState(0);

  useEffect(() => { setActiveIdx(0); }, [combo?.id]);

  if (!combo) return null;

  const customisedCount = products.filter(p =>
    !!(variants[p.id]?.colour || variants[p.id]?.size || variants[p.id]?.personalMessage || variants[p.id]?.uploadedImageBase64)
  ).length;

  const activeProduct = products[activeIdx];
  const activeVariant = activeProduct ? (variants[activeProduct.id] || {}) : {};
  const hasActiveCust = !!(activeVariant.colour || activeVariant.size || activeVariant.personalMessage || activeVariant.uploadedImageBase64);

  return (
    <>
      {customising && (
        <ProductCustomiser
          product={customising}
          variant={variants[customising.id] || {}}
          onSave={v => { onVariantChange(customising.id, v); setCustomising(null); }}
          onClose={() => setCustomising(null)}
        />
      )}
      <div className="panel-backdrop" onClick={e => e.target === e.currentTarget && onClose()} />
      <div className="side-panel">
        {/* Panel header */}
        <div className="panel-head">
          <div>
            <div className="panel-eyebrow">Pieces in this set</div>
            <div className="panel-title">{combo.name}</div>
          </div>
          <div className="panel-head-right">
            <span className="panel-prog">{customisedCount}/{products.length} done</span>
            <button className="panel-close" onClick={onClose} aria-label="Close panel">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
              </svg>
            </button>
          </div>
        </div>

        {/* Thumbnail strip */}
        <div className="panel-thumbs">
          {products.map((p, i) => {
            const v = variants[p.id] || {};
            const done = !!(v.colour || v.size || v.personalMessage || v.uploadedImageBase64);
            return (
              <button key={p.id} className={`panel-thumb${activeIdx === i ? ' active' : ''}${done ? ' done' : ''}`}
                onClick={() => setActiveIdx(i)}>
                <img src={p.image || '/images/hero.png'} alt={p.name} />
                {done && <span className="panel-thumb-check">✓</span>}
              </button>
            );
          })}
        </div>

        {/* Active product detail */}
        {activeProduct && (
          <div className="panel-detail">
            <div className="panel-detail-img">
              <a
                href={`/products/${activeProduct.id}?fromCombo=true`}
                className="panel-detail-img-link"
                onClick={e => e.stopPropagation()}
              >
                <img src={activeProduct.image || '/images/hero.png'} alt={activeProduct.name} />
                <div className="panel-detail-img-overlay">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2.5">
                    <path d="M5 12h14M12 5l7 7-7 7"/>
                  </svg>
                </div>
              </a>
            </div>
            <div className="panel-detail-info">
              <a
                href={`/products/${activeProduct.id}?fromCombo=true`}
                className="panel-detail-name-link"
                onClick={e => e.stopPropagation()}
              >
                <div className="panel-detail-name">{activeProduct.name}</div>
              </a>
              <div className="panel-detail-price">₹{activeProduct.price.toLocaleString('en-IN')}</div>
              {hasActiveCust && (
                <div className="panel-detail-tags">
                  {activeVariant.colour && <span className="panel-tag">🎨 {activeVariant.colour}</span>}
                  {activeVariant.size && <span className="panel-tag">📐 {activeVariant.size}</span>}
                  {activeVariant.personalMessage && <span className="panel-tag">✉ Msg</span>}
                  {activeVariant.uploadedImageBase64 && <span className="panel-tag">📷</span>}
                </div>
              )}
              <button className="panel-customise-btn" onClick={() => setCustomising(activeProduct)}>
                {hasActiveCust ? '✎ Edit customisation' : '+ Customise this piece'}
              </button>
            </div>
          </div>
        )}

        {/* Nav arrows */}
        {products.length > 1 && (
          <div className="panel-nav">
            <button className="panel-nav-btn" onClick={() => setActiveIdx(i => Math.max(0, i - 1))} disabled={activeIdx === 0}>
              ← Prev
            </button>
            <span className="panel-nav-count">{activeIdx + 1} / {products.length}</span>
            <button className="panel-nav-btn" onClick={() => setActiveIdx(i => Math.min(products.length - 1, i + 1))} disabled={activeIdx === products.length - 1}>
              Next →
            </button>
          </div>
        )}

        {customisedCount < products.length && (
          <div className="panel-tip">💡 Select each piece above to customise colour, size & message</div>
        )}
      </div>
    </>
  );
}

/* ─────────────────────────────────────────────────────────────
   CUSTOM PRODUCT CARD
   Image and name link to PDP with ?fromCombo=true.
   Add/remove/customise buttons work independently.
───────────────────────────────────────────────────────────── */
interface CustomProdCardProps {
  product: ComboProduct;
  inHamper: boolean;
  variant: ProductVariant;
  onAdd: () => void;
  onRemove: () => void;
  onEditCustomise: () => void;
}

function CustomProdCard({ product, inHamper, variant, onAdd, onRemove, onEditCustomise }: CustomProdCardProps) {
  const hasCustomisation = !!(variant.colour || variant.size || variant.personalMessage || variant.uploadedImageBase64);

  return (
    <div className={`cp-card${inHamper ? ' cp-in-hamper' : ''}`}>
      <div className="cp-img">
        {/*
          Image links to PDP with ?fromCombo=true so PDP hides
          Add to Cart / Buy Now / Complete the Look for combo-context visits.
          The cp-img-toggle (transparent full-area button) handles add/remove;
          the link occupies the same space but sits beneath via z-index layering.
          We use pointer-events on the link so the toggle still captures taps
          on the non-link area, but the link itself is clickable.
        */}
        <a
          href={`/products/${product.id}?fromCombo=true`}
          className="cp-img-link"
          onClick={e => e.stopPropagation()}
        >
          <img src={product.image || '/images/hero.png'} alt={product.name} />
        </a>
        {/* Green check overlay + add/remove tap area — sits above the link */}
        <button
          className="cp-img-toggle"
          onClick={inHamper ? onRemove : onAdd}
          aria-label={inHamper ? 'Remove from hamper' : 'Add to hamper'}
        >
          {inHamper && (
            <div className="cp-in-overlay">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="3">
                <polyline points="20 6 9 17 4 12"/>
              </svg>
            </div>
          )}
        </button>
      </div>
      <div className="cp-body">
        {/* Name links to PDP with fromCombo param */}
        <a
          href={`/products/${product.id}?fromCombo=true`}
          className="cp-name-link"
          onClick={e => e.stopPropagation()}
        >
          <div className="cp-name">{product.name}</div>
        </a>
        <div className="cp-price">₹{product.price.toLocaleString('en-IN')}</div>
        {inHamper ? (
          <div className="cp-in-actions">
            {hasCustomisation && (
              <div className="cp-tag-row">
                {variant.colour && <span className="cp-tag">{variant.colour}</span>}
                {variant.size && <span className="cp-tag">{variant.size}</span>}
              </div>
            )}
            <button className="cp-edit-btn" onClick={onEditCustomise}>
              {hasCustomisation ? '✎ Edit' : '+ Customise'}
            </button>
            <button className="cp-remove-btn" onClick={onRemove}>Remove</button>
          </div>
        ) : (
          <button className="cp-add-btn" onClick={onAdd}>+ Add</button>
        )}
      </div>
    </div>
  );
}

/* ─────────────────────────────────────────────────────────────
   MOBILE SUMMARY DRAWER
───────────────────────────────────────────────────────────── */
interface MobileSummaryProps {
  totalPrice: number;
  savings: number;
  itemCount: number;
  onOpen: () => void;
  hasItems: boolean;
  onAddToCart: () => void;
  cartAdded: boolean;
}

function MobileSummaryBar({ totalPrice, savings, itemCount, onOpen, hasItems, onAddToCart, cartAdded }: MobileSummaryProps) {
  return (
    <div className="mobile-bar">
      {/* Left info area — tappable to open summary sheet */}
      <button className="mobile-bar-info" onClick={onOpen} disabled={!hasItems}>
        {hasItems ? (
          <>
            <div className="mobile-bar-count">{itemCount} piece{itemCount !== 1 ? 's' : ''}</div>
            <div className="mobile-bar-price">₹{totalPrice.toLocaleString('en-IN')}</div>
            {savings > 0 && <div className="mobile-bar-save">Save ₹{savings.toLocaleString('en-IN')}</div>}
            <div className="mobile-bar-view">View summary ▲</div>
          </>
        ) : (
          <div className="mobile-bar-empty">Select pieces to begin</div>
        )}
      </button>

      {/*
        FIX 1: Cart button is always rendered as a sibling to the info area,
        never overflows or gets hidden behind safe-area / nav bars.
        It has a fixed height and width so it is always fully visible.
      */}
      <button
        className={`mobile-bar-cart${cartAdded ? ' done' : ''}`}
        onClick={onAddToCart}
        disabled={!hasItems}
      >
        {cartAdded ? '✓ Added!' : 'Add to Cart'}
      </button>
    </div>
  );
}

/* ─────────────────────────────────────────────────────────────
   MAIN PAGE
───────────────────────────────────────────────────────────── */
export default function CuratedCombosPage({ gender = 'women' }: { gender?: string }) {
  const router = useRouter();
  const { addItem } = useCart();

  const [mode, setMode] = useState<'preset' | 'custom'>('preset');

  const [selectedComboId, setSelectedComboId] = useState('');
  const [presetVariants, setPresetVariants] = useState<Record<string, ProductVariant>>({});

  // Side panel state
  const [panelCombo, setPanelCombo] = useState<PresetCombo | null>(null);
  const [panelProducts, setPanelProducts] = useState<ComboProduct[]>([]);

  /*
    In "Build Your Own" mode the category selector works like an
    accordion / radio — clicking a pill opens ONLY that category's grid and
    collapses any previously-open one.  We track a single `activeCategory`
    string (null = none open) instead of a multi-select array.
  */
  const [activeCategory, setActiveCategory] = useState<CategoryKey | null>(null);

  const [hamper, setHamper] = useState<Record<string, ProductVariant>>({});

  const [pendingAdd, setPendingAdd] = useState<ComboProduct | null>(null);
  const [editingProduct, setEditingProduct] = useState<ComboProduct | null>(null);

  const [showMobileSummary, setShowMobileSummary] = useState(false);
  const [cartAdded, setCartAdded] = useState(false);

  const [isLoading, setIsLoading] = useState(true);
  const [presetCombos, setPresetCombos] = useState<PresetCombo[]>([]);
  const [customComboData, setCustomComboData] = useState<any>(null);
  const [productsByCategory, setProductsByCategory] = useState<Record<string, ComboProduct[]>>({});
  const [categoryLabels, setCategoryLabels] = useState<Record<string, string>>({});
  const [allCategories, setAllCategories] = useState<CategoryKey[]>([]);

  useEffect(() => {
    async function loadData() {
      try {
        const [combosRes, productsRes, categoriesRes] = await Promise.all([
          apiRequest<{ success: boolean; combos: any[] }>('/combos'),
          apiRequest<{ success: boolean; products: any[] }>('/products'),
          apiRequest<{ success: boolean; categories: any[] }>('/categories'),
        ]);

        const catLabels: Record<string, string> = {};
        categoriesRes.categories?.forEach((c: any) => { catLabels[c._id] = c.name; });
        setCategoryLabels(catLabels);

        const prods = productsRes.products || [];
        const pByCat: Record<string, ComboProduct[]> = {};
        prods.forEach((p: any) => {
          if (!p.category) return;
          const catId = typeof p.category === 'string' ? p.category : p.category._id;
          if (!pByCat[catId]) pByCat[catId] = [];
          pByCat[catId].push({
            id: p._id, name: p.title, price: p.price || 0,
            image: p.mainImage || p.images?.[0] || '',
            customisable: !!p.isCustomisable,
            availableColours: p.colours || [],
            availableSizes: p.sizes || [],
          });
        });

        const combos = combosRes.combos || [];
        const curated = combos.filter((c: any) => c.type === 'curated');
        const custom = combos.find((c: any) => c.type === 'custom');

        const mappedPresets: PresetCombo[] = curated.map((c: any) => {
          const includedCats: string[] = [];
          const defaultSels: Record<string, string> = {};
          c.slots?.forEach((s: any) => {
            const catId = typeof s.category === 'string' ? s.category : s.category?._id;
            if (!catId) return;
            includedCats.push(catId);
            const defId = typeof s.defaultProduct === 'string' ? s.defaultProduct : s.defaultProduct?._id;
            if (defId) defaultSels[catId] = defId;
            if (!pByCat[catId]) pByCat[catId] = [];
            s.allowedProducts?.forEach((ap: any) => {
              const apId = typeof ap === 'string' ? ap : ap?._id;
              if (apId && !pByCat[catId].find((x: ComboProduct) => x.id === apId)) {
                const prodInfo = prods.find((pr: any) => pr._id === apId) || (typeof ap !== 'string' ? ap : null);
                if (prodInfo) {
                  pByCat[catId].push({
                    id: prodInfo._id, name: prodInfo.title, price: prodInfo.price || 0,
                    image: prodInfo.mainImage || prodInfo.images?.[0] || '',
                    customisable: !!prodInfo.isCustomisable,
                    availableColours: prodInfo.colours || [],
                    availableSizes: prodInfo.sizes || [],
                  });
                }
              }
            });
          });
          return {
            id: c._id, name: c.name, tagline: c.description || '',
            price: c.price || 0, originalPrice: c.originalPrice || c.price || 0,
            image: c.image || '', badge: c.badge || '', tint: c.tint || '#c8a84b',
            includedCategories: includedCats, defaultSelections: defaultSels,
          };
        });

        setProductsByCategory(pByCat);
        setPresetCombos(mappedPresets);
        if (mappedPresets.length > 0) setSelectedComboId(mappedPresets[0].id);

        if (custom) {
          setCustomComboData(custom);
          const eligible = custom.categories?.map((c: any) => typeof c === 'string' ? c : c._id) || Object.keys(pByCat);
          setAllCategories(eligible);
          if (eligible.length > 0) setActiveCategory(eligible[0]);
        } else {
          const keys = Object.keys(pByCat);
          setAllCategories(keys);
          if (keys.length > 0) setActiveCategory(keys[0]);
        }
      } catch (e) {
        console.error('Error loading combo data', e);
      } finally {
        setIsLoading(false);
      }
    }
    loadData();
  }, []);

  const selectedCombo = presetCombos.find(c => c.id === selectedComboId);
  const hamperProductIds = Object.keys(hamper);

  const categoriesWithHamperItems: CategoryKey[] = useMemo(() => {
    return allCategories.filter(cat =>
      (productsByCategory[cat] ?? []).some(p => hamperProductIds.includes(p.id))
    );
  }, [hamperProductIds, allCategories, productsByCategory]);

  const customTotal = useMemo(() => {
    return hamperProductIds.reduce((sum, pid) => {
      for (const cat of allCategories) {
        const p = (productsByCategory[cat] ?? []).find(x => x.id === pid);
        if (p) return sum + p.price;
      }
      return sum;
    }, 0);
  }, [hamperProductIds, allCategories, productsByCategory]);

  let customDiscount = 0;
  if (mode === 'custom' && customComboData?.discountRules?.length > 0) {
    const totalItems = hamperProductIds.length;
    const rules = [...customComboData.discountRules].sort((a: any, b: any) =>
      (b.minItems || 0) - (a.minItems || 0) || (b.minPrice || 0) - (a.minPrice || 0)
    );
    for (const rule of rules) {
      if ((!rule.minItems || totalItems >= rule.minItems) && (!rule.minPrice || customTotal >= rule.minPrice)) {
        customDiscount = customComboData.discountType === 'percentage'
          ? (customTotal * (rule.discountValue || 0)) / 100
          : rule.discountValue || 0;
        break;
      }
    }
  }

  const presetTotal = selectedCombo?.price || 0;
  const presetOriginal = selectedCombo?.originalPrice || presetTotal;
  const totalPrice = mode === 'preset' ? presetTotal : Math.max(0, customTotal - customDiscount);
  const savings = mode === 'preset' ? (presetOriginal - presetTotal) : customDiscount;

  const presetSummaryItems = useMemo(() => {
    if (!selectedCombo) return [];
    const seen = new Set<string>();
    const items: { p: ComboProduct; k: string }[] = [];
    selectedCombo.includedCategories.forEach(k => {
      (productsByCategory[k] ?? []).forEach(p => {
        if (!seen.has(p.id)) { seen.add(p.id); items.push({ p, k }); }
      });
    });
    return items;
  }, [selectedCombo, productsByCategory]);

  const customSummaryItems = useMemo(() => {
    return categoriesWithHamperItems.flatMap(k =>
      (productsByCategory[k] ?? []).filter(p => hamperProductIds.includes(p.id)).map(p => ({ k, p }))
    );
  }, [categoriesWithHamperItems, productsByCategory, hamperProductIds]);

  const summaryItems = mode === 'preset' ? presetSummaryItems : customSummaryItems;
  const hasItems = summaryItems.length > 0;

  const buildCartItem = useCallback(() => {
    if (!hasItems) return null;
    return {
      id: mode === 'preset' ? String(selectedCombo?.id || 'preset') : `custom-combo-${Date.now()}`,
      name: mode === 'preset' ? (selectedCombo?.name || 'Curated Box') : 'Custom Jewellery Hamper',
      price: totalPrice,
      originalPrice: mode === 'preset' ? presetOriginal : customTotal,
      image: mode === 'preset' ? (selectedCombo?.image || '') : (summaryItems[0]?.p?.image || ''),
      color: 'Default', colorHex: '#c9a84c',
      sku: `COMBO-${mode.toUpperCase()}`,
      href: `/categories/${gender}/curated-combos`,
      selectionGroups: summaryItems.map(({ k, p }) => {
        const v = mode === 'preset' ? (presetVariants[p.id] || {}) : (hamper[p.id] || {});
        return {
          category: k, label: categoryLabels[k] || k,
          items: [{ id: String(p.id), name: p.name, price: p.price, image: p.image, quantity: 1,
            colour: v.colour, size: v.size, personalMessage: v.personalMessage }],
        };
      }),
    };
  }, [hasItems, mode, selectedCombo, totalPrice, presetOriginal, customTotal, summaryItems, presetVariants, hamper, categoryLabels, gender]);

  function handleAddToCart() {
    const item = buildCartItem();
    if (!item) return;
    addItem(item);
    setCartAdded(true);
    setTimeout(() => setCartAdded(false), 1800);
  }

  function handleBuyNow() {
    const item = buildCartItem();
    if (!item) return;
    addItem(item, false);
    router.push('/cart');
  }

  function handleProductAdd(p: ComboProduct) { setPendingAdd(p); }
  function handleProductRemove(productId: string) {
    setHamper(prev => { const next = { ...prev }; delete next[productId]; return next; });
  }

  function handleOpenPanel(combo: PresetCombo, products: ComboProduct[]) {
    setPanelCombo(combo);
    setPanelProducts(products);
  }

  function handleCategoryPillClick(cat: CategoryKey) {
    setActiveCategory(prev => (prev === cat ? null : cat));
  }

  /* ─── RENDER ─── */
  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,400;0,500;0,600;1,400;1,500&family=DM+Sans:ital,opsz,wght@0,9..40,300;0,9..40,400;0,9..40,500;0,9..40,600;1,9..40,300&display=swap');

        :root {
          --bg:        #f5f2eb;
          --bg2:       #ede9df;
          --surf:      #ffffff;
          --bdr:       #e0d8c8;
          --bdr2:      #c9bfa8;
          --olive:     #3d5016;
          --olive2:    #5a6e2b;
          --olivedim:  #eef1e3;
          --gold:      #b8982a;
          --gold2:     #f0e4a0;
          --golddim:   #fdf8e8;
          --ink:       #1a1d0d;
          --ink7:      rgba(26,29,13,.7);
          --ink4:      rgba(26,29,13,.4);
          --ink2:      rgba(26,29,13,.15);
          --green:     #2a6030;
          --sage:      #8a9e6a;
          --red:       #c0392b;
          --ffd:       'Cormorant Garamond', Georgia, serif;
          --ffb:       'DM Sans', system-ui, sans-serif;
          --r:         12px;
          --rsm:       8px;
          --shadow:    0 4px 24px rgba(26,29,13,.10);
          --shadow-lg: 0 8px 40px rgba(26,29,13,.16);
        }
        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
        html { scroll-behavior: smooth; }
        body { font-family: var(--ffb); background: var(--bg); color: var(--ink); }
        button { font-family: var(--ffb); cursor: pointer; background: transparent; border: none; }
        img { display: block; max-width: 100%; }
        textarea { font-family: var(--ffb); }

        /* ── MODAL ── */
        .modal-backdrop {
          position: fixed; inset: 0; z-index: 1000;
          background: rgba(10,12,5,.55);
          backdrop-filter: blur(8px);
          display: flex; align-items: center; justify-content: center;
          padding: 16px;
          animation: fadeIn .2s ease;
        }
        @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
        .modal-box {
          width: 100%; max-width: 520px;
          max-height: calc(100dvh - 32px);
          background: var(--surf);
          border-radius: 16px;
          overflow: hidden;
          display: flex; flex-direction: column;
          box-shadow: var(--shadow-lg);
          animation: modalIn .28s cubic-bezier(.34,1.1,.64,1);
        }
        @keyframes modalIn {
          from { opacity: 0; transform: scale(.94) translateY(16px); }
          to   { opacity: 1; transform: scale(1) translateY(0); }
        }
        .modal-header {
          display: flex; align-items: flex-start; justify-content: space-between;
          padding: 18px 20px 14px;
          background: linear-gradient(135deg, var(--olivedim) 0%, #ede9d8 100%);
          border-bottom: 1px solid var(--bdr);
          flex-shrink: 0;
        }
        .modal-header-text { flex: 1; min-width: 0; }
        .modal-eyebrow {
          display: block; font-size: 9px; font-weight: 700;
          letter-spacing: .24em; text-transform: uppercase;
          color: var(--sage); margin-bottom: 3px;
        }
        .modal-title { font-family: var(--ffd); font-size: 1.3rem; font-weight: 500; color: var(--olive); line-height: 1.2; }
        .modal-close {
          width: 34px; height: 34px; border-radius: 50%;
          display: flex; align-items: center; justify-content: center;
          color: var(--ink4); background: rgba(255,255,255,.6);
          transition: all .15s; flex-shrink: 0; margin-left: 12px;
          border: 1px solid var(--bdr);
        }
        .modal-close:hover { background: #fff; color: var(--ink); }
        .modal-product-strip {
          display: flex; align-items: center; gap: 14px;
          padding: 12px 20px; border-bottom: 1px solid var(--bdr);
          background: #fafaf6; flex-shrink: 0;
        }
        .modal-product-img { width: 54px; height: 54px; border-radius: var(--rsm); object-fit: cover; border: 1px solid var(--bdr); flex-shrink: 0; }
        .modal-product-name { font-size: 13px; font-weight: 600; color: var(--ink); margin-bottom: 2px; }
        .modal-product-price { font-size: 12px; color: var(--olive2); font-weight: 600; }
        .modal-product-note { font-size: 10px; color: var(--ink4); margin-top: 3px; }
        .modal-body { flex: 1; overflow-y: auto; padding: 18px 20px; display: flex; flex-direction: column; gap: 20px; }
        .modal-body::-webkit-scrollbar { width: 3px; }
        .modal-body::-webkit-scrollbar-thumb { background: var(--bdr2); border-radius: 3px; }
        .modal-field { display: flex; flex-direction: column; gap: 9px; }
        .modal-field-label {
          display: flex; align-items: center; gap: 8px;
          font-size: 10px; font-weight: 700; letter-spacing: .15em;
          text-transform: uppercase; color: var(--ink);
        }
        .modal-field-num {
          width: 20px; height: 20px; border-radius: 50%;
          background: var(--olive); color: #fff;
          font-size: 9px; font-weight: 700;
          display: flex; align-items: center; justify-content: center; flex-shrink: 0;
        }
        .modal-field-optional { font-size: 8px; font-weight: 400; letter-spacing: .04em; text-transform: none; color: var(--ink4); padding: 2px 7px; border: 1px solid var(--bdr2); border-radius: 50px; }
        .modal-selected-badge { font-size: 9px; font-weight: 600; text-transform: none; letter-spacing: .03em; background: var(--olive); color: #fff; padding: 2px 9px; border-radius: 50px; margin-left: auto; }
        .modal-chips { display: flex; flex-wrap: wrap; gap: 8px; }
        .chip { font-size: 12px; font-weight: 500; padding: 8px 16px; border-radius: 6px; border: 1.5px solid var(--bdr2); color: var(--ink7); transition: all .18s; min-height: 38px; display: flex; align-items: center; }
        .chip:hover { border-color: var(--olive2); color: var(--olive); background: var(--olivedim); }
        .chip-on { background: var(--olive); color: #fff !important; border-color: var(--olive) !important; }
        .chip-size { min-width: 50px; justify-content: center; }
        .modal-textarea { width: 100%; border: 1.5px solid var(--bdr); border-radius: var(--rsm); padding: 10px 12px; font-size: 13px; color: var(--ink); background: var(--bg); outline: none; resize: none; line-height: 1.65; transition: border-color .2s; }
        .modal-textarea:focus { border-color: var(--olive2); background: #fff; }
        .modal-textarea::placeholder { color: var(--ink4); }
        .modal-char-count { font-size: 10px; color: var(--ink4); text-align: right; }
        .modal-upload-zone { display: block; border: 2px dashed var(--bdr2); border-radius: var(--rsm); cursor: pointer; transition: all .2s; overflow: hidden; }
        .modal-upload-zone:hover { border-color: var(--olive2); background: var(--olivedim); }
        .modal-upload-empty { display: flex; flex-direction: column; align-items: center; gap: 7px; padding: 24px 16px; color: var(--ink4); text-align: center; }
        .modal-upload-cta { font-size: 13px; font-weight: 500; color: var(--olive); }
        .modal-upload-sub { font-size: 10px; }
        .modal-upload-preview { display: flex; align-items: center; gap: 14px; padding: 12px 16px; background: var(--olivedim); }
        .modal-upload-preview img { width: 52px; height: 52px; border-radius: 7px; object-fit: cover; }
        .modal-upload-preview-name { font-size: 12px; font-weight: 600; color: var(--olive); display: block; }
        .modal-upload-change { font-size: 10px; color: var(--ink4); display: block; margin-top: 2px; }
        .modal-summary-box { background: var(--golddim); border: 1px solid rgba(184,152,42,.3); border-radius: var(--rsm); padding: 11px 14px; }
        .modal-summary-title { font-size: 8.5px; font-weight: 700; letter-spacing: .15em; text-transform: uppercase; color: var(--gold); margin-bottom: 7px; }
        .modal-summary-tags { display: flex; flex-wrap: wrap; gap: 5px; }
        .modal-sum-tag { font-size: 11px; font-weight: 500; color: #7a6010; background: rgba(255,255,255,.7); border: 1px solid rgba(184,152,42,.3); padding: 3px 9px; border-radius: 50px; }
        .modal-footer { padding: 12px 20px 18px; border-top: 1px solid var(--bdr); display: flex; gap: 10px; flex-shrink: 0; background: #fafaf6; }
        .modal-btn-skip { flex: 1; font-size: 9.5px; font-weight: 600; letter-spacing: .1em; text-transform: uppercase; color: var(--ink4); border: 1.5px solid var(--bdr2); border-radius: 6px; padding: 12px 14px; transition: all .18s; min-height: 44px; }
        .modal-btn-skip:hover { border-color: var(--ink4); color: var(--ink); }
        .modal-btn-save { flex: 2; display: flex; align-items: center; justify-content: center; gap: 7px; font-size: 9.5px; font-weight: 700; letter-spacing: .14em; text-transform: uppercase; color: #fff; background: var(--olive); border-radius: 6px; padding: 12px 18px; min-height: 44px; box-shadow: 0 4px 14px rgba(61,80,22,.25); transition: all .2s; }
        .modal-btn-save:hover { background: #2e3c0e; transform: translateY(-1px); }

        /* ── PAGE SHELL ── */
        .page { min-height: 100dvh; background: var(--bg); }

        /* ── HERO ── */
        .hero {
          margin-top: 56px;
          padding: clamp(28px,4vw,52px) clamp(20px,6vw,72px) clamp(20px,3vw,36px);
          background: linear-gradient(155deg, #f5f2eb 0%, #ede5d0 55%, #f5f2eb 100%);
          border-bottom: 1px solid var(--bdr);
          position: relative; overflow: hidden;
        }
        .hero::before { content: ''; position: absolute; right: -80px; top: -80px; width: 360px; height: 360px; border-radius: 50%; background: radial-gradient(circle, rgba(184,152,42,.1) 0%, transparent 68%); pointer-events: none; }
        .hero-eyebrow { display: flex; align-items: center; gap: 10px; font-size: 8px; letter-spacing: .44em; text-transform: uppercase; color: var(--gold); font-weight: 600; margin-bottom: 12px; }
        .hero-line { width: 24px; height: 1px; background: var(--gold); opacity: .5; }
        .hero h1 { font-family: var(--ffd); font-size: clamp(1.7rem, 5vw, 3.4rem); font-weight: 500; color: var(--olive); line-height: 1.08; margin-bottom: 10px; }
        .hero h1 em { font-style: italic; color: var(--gold); }
        .hero-desc { font-size: clamp(12px, 1.3vw, 13.5px); font-weight: 300; color: var(--ink7); max-width: 400px; line-height: 1.8; }

        /* ── MODE BAR ── */
        .modebar { padding: 18px clamp(20px,6vw,72px) 0; display: flex; align-items: flex-start; gap: 18px; flex-wrap: wrap; }
        .modetoggle { display: flex; background: var(--surf); border: 1.5px solid var(--bdr2); border-radius: 8px; padding: 4px; gap: 3px; box-shadow: var(--shadow); flex-shrink: 0; }
        .modebtn { font-size: 10px; font-weight: 600; letter-spacing: .12em; text-transform: uppercase; padding: clamp(8px,1.5vw,11px) clamp(14px,2.2vw,22px); border-radius: 6px; color: var(--ink7); transition: all .22s; min-height: 38px; }
        .modebtn.on { background: var(--olive); color: #fff; box-shadow: 0 2px 10px rgba(61,80,22,.3); }
        .modehint { font-size: 12px; font-weight: 300; color: var(--ink7); line-height: 1.75; max-width: 420px; padding-top: 10px; }

        /* ── LAYOUT ── */
        .layout { display: grid; grid-template-columns: 1fr 300px; gap: 24px; padding: clamp(18px,3vw,28px) clamp(20px,6vw,72px) 100px; align-items: start; }
        @media (max-width: 1100px) { .layout { grid-template-columns: 1fr; } }

        /* ── SECTION LABEL ── */
        .sec-label { font-size: 8px; letter-spacing: .42em; text-transform: uppercase; color: var(--ink4); font-weight: 600; display: flex; align-items: center; gap: 12px; margin-bottom: 14px; }
        .sec-label::after { content: ''; flex: 1; height: 1px; background: var(--bdr); }

        /* ── COMBO GRID ── */
        .cgrid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 12px; }
        @media (max-width: 900px) { .cgrid { grid-template-columns: repeat(2, 1fr); } }
        @media (max-width: 420px) { .cgrid { grid-template-columns: repeat(2, 1fr); gap: 8px; } }

        /* ── COMBO CARD ── */
        .cc-card {
          background: var(--surf);
          border: 1px solid var(--bdr);
          cursor: pointer;
          display: flex; flex-direction: column;
          transition: all .2s cubic-bezier(.34,1.1,.64,1);
          position: relative;
          overflow: hidden;
        }
        .cc-card:hover { transform: translateY(-3px); box-shadow: var(--shadow-lg); border-color: var(--bdr2); }
        .cc-card.cc-selected { border-color: var(--bdr); box-shadow: 0 4px 20px rgba(61,80,22,.15); }

        .cc-img-area { position: relative; aspect-ratio: 4/5; overflow: hidden; }
        .cc-img-area img { width: 100%; height: 100%; object-fit: cover; transition: transform .5s ease; }
        .cc-card:hover .cc-img-area img { transform: scale(1.06); }
        .cc-img-grad { position: absolute; inset: 0; background: linear-gradient(to bottom, transparent 35%, rgba(0,0,0,.65) 100%); }
        .cc-pct-badge { position: absolute; top: 8px; right: 8px; font-size: 8px; font-weight: 700; background: var(--olive); color: #fff; padding: 3px 8px; }
        .cc-label-badge { position: absolute; top: 8px; left: 8px; font-size: 7px; font-weight: 700; letter-spacing: .1em; text-transform: uppercase; background: rgba(255,255,255,.93); backdrop-filter: blur(4px); color: var(--ink); padding: 3px 8px; }
        .cc-selected-check { position: absolute; bottom: 8px; right: 8px; width: 24px; height: 24px; background: var(--olive); color: #fff; display: flex; align-items: center; justify-content: center; z-index: 2; }
        .cc-img-text { position: absolute; bottom: 0; left: 0; right: 0; padding: 10px 11px; }
        .cc-img-name { font-family: var(--ffd); font-size: 1rem; font-weight: 500; color: #fff; text-shadow: 0 1px 6px rgba(0,0,0,.4); line-height: 1.2; }
        .cc-img-tagline { font-size: 8px; color: rgba(255,255,255,.55); margin-top: 1px; }
        .cc-color-strip { height: 2px; }
        .cc-foot { padding: 10px 11px 11px; }
        .cc-price-row { display: flex; align-items: baseline; gap: 6px; margin-bottom: 3px; flex-wrap: wrap; }
        .cc-price { font-family: var(--ffd); font-size: 1rem; font-weight: 600; color: var(--ink); }
        .cc-original { font-size: 9.5px; color: var(--ink4); text-decoration: line-through; }
        .cc-save-tag { font-size: 8px; font-weight: 700; color: var(--green); background: rgba(42,96,48,.08); padding: 2px 6px; }
        .cc-pieces-count { font-size: 9px; color: var(--ink4); margin-bottom: 4px; }
        .cc-cust-dot { color: var(--olive2); }
        .cc-cta-hint { font-size: 8.5px; color: var(--gold); font-weight: 600; letter-spacing: .03em; }
        .cc-selected .cc-cta-hint { color: var(--olive); }

        /* ── PANEL BACKDROP ── */
        .panel-backdrop {
          position: fixed; inset: 0; z-index: 400;
          background: rgba(10,12,5,.4);
          backdrop-filter: blur(4px);
          animation: fadeIn .2s ease;
        }

        /* ── SIDE PANEL ── */
        .side-panel {
          position: fixed; top: 0; right: 0; bottom: 0; z-index: 401;
          width: min(420px, 92vw);
          background: var(--surf);
          border-left: 1px solid var(--bdr);
          display: flex; flex-direction: column;
          box-shadow: -8px 0 40px rgba(26,29,13,.15);
          animation: slideIn .28s cubic-bezier(.34,1.05,.64,1);
          overflow: hidden;
        }
        @keyframes slideIn { from { transform: translateX(100%); } to { transform: translateX(0); } }

        .panel-detail-img { width: 90px; height: 90px; flex-shrink: 0; overflow: hidden; border: 1px solid var(--bdr); position: relative; }
        .panel-detail-img-link { display: block; width: 100%; height: 100%; text-decoration: none; }
        .panel-detail-img-link img { width: 100%; height: 100%; object-fit: cover; }
        .panel-detail-img-overlay {
          position: absolute; inset: 0;
          background: rgba(61,80,22,0);
          display: flex; align-items: center; justify-content: center;
          transition: background .2s;
        }
        .panel-detail-img-link:hover .panel-detail-img-overlay { background: rgba(61,80,22,0.3); }
        .panel-detail-name-link { text-decoration: none; color: inherit; }
        .panel-detail-name-link:hover .panel-detail-name {
          text-decoration: underline;
          text-decoration-color: var(--bdr2);
          text-underline-offset: 3px;
        }

        @media (max-width: 600px) {
          .side-panel {
            top: auto; right: 0; left: 0; bottom: 0;
            width: 100%; max-height: 82dvh;
            border-left: none; border-top: 1px solid var(--bdr);
            border-radius: 16px 16px 0 0;
            animation: slideUp .28s cubic-bezier(.34,1.05,.64,1);
          }
          @keyframes slideUp { from { transform: translateY(100%); } to { transform: translateY(0); } }
        }

        .panel-head {
          display: flex; align-items: flex-start; justify-content: space-between;
          padding: 16px 18px 14px;
          background: linear-gradient(135deg, var(--olivedim) 0%, #ede9d8 100%);
          border-bottom: 1px solid var(--bdr);
          flex-shrink: 0;
        }
        .panel-eyebrow { font-size: 8px; font-weight: 700; letter-spacing: .22em; text-transform: uppercase; color: var(--sage); margin-bottom: 3px; display: block; }
        .panel-title { font-family: var(--ffd); font-size: 1.15rem; font-weight: 500; color: var(--olive); }
        .panel-head-right { display: flex; align-items: center; gap: 10px; flex-shrink: 0; margin-left: 12px; }
        .panel-prog { font-size: 9px; font-weight: 600; color: var(--olive2); background: var(--olivedim); border: 1px solid rgba(90,110,43,.25); padding: 3px 9px; white-space: nowrap; }
        .panel-close { width: 32px; height: 32px; display: flex; align-items: center; justify-content: center; color: var(--ink4); background: rgba(255,255,255,.6); border: 1px solid var(--bdr); transition: all .15s; }
        .panel-close:hover { background: #fff; color: var(--ink); }

        .panel-thumbs {
          display: flex; gap: 8px; overflow-x: auto; padding: 12px 16px;
          border-bottom: 1px solid var(--bdr); flex-shrink: 0;
          scroll-snap-type: x mandatory; -webkit-overflow-scrolling: touch;
        }
        .panel-thumbs::-webkit-scrollbar { height: 3px; }
        .panel-thumbs::-webkit-scrollbar-thumb { background: var(--bdr2); }
        .panel-thumb {
          flex-shrink: 0; width: 56px; height: 56px;
          position: relative; overflow: hidden;
          border: 2px solid var(--bdr); cursor: pointer;
          transition: all .18s; scroll-snap-align: start; background: none; padding: 0;
        }
        .panel-thumb img { width: 100%; height: 100%; object-fit: cover; }
        .panel-thumb:hover { border-color: var(--olive2); }
        .panel-thumb.active { border-color: var(--olive); }
        .panel-thumb.done { border-color: var(--gold); }
        .panel-thumb-check {
          position: absolute; bottom: 2px; right: 2px;
          width: 14px; height: 14px; background: var(--gold); color: #fff;
          font-size: 7px; font-weight: 700; display: flex; align-items: center; justify-content: center;
        }

        .panel-detail {
          display: flex; gap: 14px; padding: 16px 18px;
          border-bottom: 1px solid var(--bdr); flex-shrink: 0;
        }
        .panel-detail-info { flex: 1; min-width: 0; display: flex; flex-direction: column; gap: 4px; }
        .panel-detail-name { font-size: 13px; font-weight: 600; color: var(--ink); line-height: 1.3; }
        .panel-detail-price { font-size: 12px; font-weight: 600; color: var(--olive2); }
        .panel-detail-tags { display: flex; flex-wrap: wrap; gap: 4px; }
        .panel-tag { font-size: 9px; background: var(--golddim); color: #7a6010; padding: 2px 7px; border: 1px solid rgba(184,152,42,.25); }
        .panel-customise-btn {
          margin-top: 4px; font-size: 9px; font-weight: 700; letter-spacing: .1em; text-transform: uppercase;
          color: var(--olive); border: 1.5px solid var(--olive2); padding: 7px 12px;
          transition: all .18s; align-self: flex-start; min-height: 32px;
        }
        .panel-customise-btn:hover { background: var(--olive); color: #fff; }

        .panel-nav { display: flex; align-items: center; justify-content: space-between; padding: 10px 18px; border-bottom: 1px solid var(--bdr); flex-shrink: 0; }
        .panel-nav-btn { font-size: 10px; font-weight: 600; color: var(--olive); letter-spacing: .08em; padding: 6px 14px; border: 1.5px solid var(--bdr2); transition: all .18s; min-height: 34px; }
        .panel-nav-btn:hover:not(:disabled) { border-color: var(--olive); background: var(--olivedim); }
        .panel-nav-btn:disabled { opacity: .35; cursor: default; }
        .panel-nav-count { font-size: 10px; color: var(--ink4); }
        .panel-tip { margin: 12px 18px; padding: 9px 13px; background: rgba(184,152,42,.08); font-size: 9.5px; color: var(--olive2); text-align: center; }

        /* ── CUSTOM PRODUCT CARD ── */
        .cp-card { background: var(--surf); border: 1.5px solid var(--bdr); overflow: hidden; display: flex; flex-direction: column; transition: all .2s; }
        .cp-card:hover { border-color: var(--olive2); transform: translateY(-2px); box-shadow: 0 6px 16px rgba(26,29,13,.09); }
        .cp-in-hamper { border-color: var(--gold); box-shadow: 0 0 0 2px rgba(184,152,42,.15); }
        .cp-img { position: relative; aspect-ratio: 1; overflow: hidden; }
        .cp-img-link { display: block; width: 100%; height: 100%; text-decoration: none; z-index: 0; position: relative; }
        .cp-img-link img { width: 100%; height: 100%; object-fit: cover; transition: transform .3s; display: block; }
        .cp-card:hover .cp-img-link img { transform: scale(1.05); }
        /*
          The toggle button sits above the image link (z-index: 1).
          It is transparent so the image is visible through it.
          We carve out a small bottom-right corner so the PDP link is
          accessible by long-pressing / right-clicking on the image;
          for normal taps the toggle fires add/remove.
        */
        .cp-img-toggle {
          position: absolute; inset: 0; width: 100%; height: 100%;
          background: transparent; border: none; cursor: pointer; padding: 0; z-index: 1;
        }
        .cp-in-overlay { position: absolute; inset: 0; background: rgba(61,80,22,.4); display: flex; align-items: center; justify-content: center; pointer-events: none; }
        .cp-body { padding: 6px 8px 8px; display: flex; flex-direction: column; gap: 2px; }
        .cp-name-link { text-decoration: none; color: inherit; }
        .cp-name-link:hover .cp-name { color: var(--olive); text-decoration: underline; text-decoration-color: var(--bdr2); text-underline-offset: 2px; }
        .cp-name { font-size: 9.5px; font-weight: 500; color: var(--ink); line-height: 1.3; }
        .cp-price { font-size: 9.5px; font-weight: 600; color: var(--olive2); }
        .cp-in-actions { display: flex; flex-direction: column; gap: 3px; }
        .cp-tag-row { display: flex; flex-wrap: wrap; gap: 3px; }
        .cp-tag { font-size: 7.5px; background: var(--golddim); color: #7a6010; padding: 1px 5px; border: 1px solid rgba(184,152,42,.25); }
        .cp-edit-btn { font-size: 7.5px; font-weight: 700; letter-spacing: .07em; text-transform: uppercase; color: var(--olive); border: 1.5px solid var(--olive2); padding: 4px 0; min-height: 26px; transition: all .18s; }
        .cp-edit-btn:hover { background: var(--olive); color: #fff; }
        .cp-remove-btn { font-size: 7.5px; font-weight: 500; text-transform: uppercase; letter-spacing: .05em; color: var(--ink4); border: 1px solid var(--bdr2); padding: 3px 0; min-height: 24px; transition: all .18s; }
        .cp-remove-btn:hover { color: var(--red); border-color: var(--red); }
        .cp-add-btn { font-size: 8px; font-weight: 700; letter-spacing: .08em; text-transform: uppercase; color: var(--ink); border: 1.5px solid var(--bdr2); padding: 5px 0; min-height: 28px; transition: all .18s; margin-top: 2px; }
        .cp-add-btn:hover { background: var(--olive); color: #fff; border-color: var(--olive); }

        /* ── HAMPER STATUS ── */
        .hamper-status { display: flex; align-items: center; justify-content: space-between; background: linear-gradient(135deg, var(--olive), var(--olive2)); color: #fff; padding: 12px 16px; margin-bottom: 18px; }
        .hamper-status-left strong { font-family: var(--ffd); font-size: 1.1rem; }
        .hamper-status-left span { font-size: 9.5px; opacity: .7; letter-spacing: .04em; display: block; margin-top: 1px; }
        .hamper-clear { font-size: 8.5px; font-weight: 700; letter-spacing: .1em; text-transform: uppercase; color: rgba(255,255,255,.7); border: 1px solid rgba(255,255,255,.3); padding: 6px 12px; transition: all .18s; min-height: 32px; }
        .hamper-clear:hover { background: rgba(255,255,255,.15); color: #fff; }

        /* ── Category pills ── */
        .cat-pills { display: flex; flex-wrap: wrap; gap: 7px; margin-bottom: 18px; }
        .cat-pill {
          font-size: 9.5px; font-weight: 500; letter-spacing: .09em; text-transform: uppercase;
          color: var(--ink7); padding: 8px 16px; min-height: 38px;
          border: 1.5px solid var(--bdr2); transition: all .2s;
          display: flex; align-items: center; gap: 6px;
        }
        .cat-pill:hover { color: var(--olive); border-color: var(--olive2); background: var(--olivedim); }
        .cat-pill.on { background: var(--olive); color: #fff; border-color: var(--olive); }
        .cat-pill-chevron {
          display: inline-block;
          transition: transform .25s ease;
          font-style: normal;
          font-size: 10px;
          opacity: .7;
        }
        .cat-pill.on .cat-pill-chevron { transform: rotate(180deg); opacity: 1; }

        /* Category product grid */
        .custom-section {
          margin-bottom: 8px; overflow: hidden;
          box-shadow: var(--shadow); border: 1px solid var(--bdr);
        }
        .custom-sec-head {
          display: flex; align-items: center; justify-content: space-between;
          padding: 11px 16px;
          background: linear-gradient(135deg, var(--olivedim), #ede9d8);
          border-bottom: 1px solid var(--bdr);
        }
        .custom-sec-title { font-family: var(--ffd); font-size: 1rem; font-weight: 500; color: var(--olive); }
        .custom-sec-count { font-size: 9.5px; color: var(--olive2); font-weight: 600; }
        .custom-prod-grid {
          display: grid; grid-template-columns: repeat(auto-fill, minmax(110px, 1fr));
          gap: 10px; padding: 12px 14px 14px; background: var(--surf);
        }
        @media (max-width: 600px) {
          .custom-prod-grid { grid-template-columns: repeat(3, 1fr); gap: 6px; padding: 8px 10px 10px; }
          .cp-name { font-size: 9px; }
          .cp-price { font-size: 9px; }
          .cp-body { padding: 5px 6px 7px; gap: 2px; }
        }
        @media (max-width: 380px) {
          .custom-prod-grid { grid-template-columns: repeat(3, 1fr); gap: 5px; padding: 7px 8px 9px; }
          .cp-name { font-size: 8px; }
          .cp-price { font-size: 8px; }
          .cp-edit-btn, .cp-remove-btn, .cp-add-btn { font-size: 7px; min-height: 22px; padding: 3px 0; }
        }

        /* ── SUMMARY PANEL (desktop right col) ── */
        .summary-panel { position: sticky; top: 76px; background: var(--surf); border: 1px solid var(--bdr); overflow: hidden; box-shadow: var(--shadow); }
        .sum-head { padding: 16px 18px 13px; background: linear-gradient(135deg, var(--olivedim), #ede5d0); border-bottom: 1px solid var(--bdr); }
        .sum-title { font-family: var(--ffd); font-size: 1.05rem; font-weight: 500; color: var(--olive); }
        .sum-modetag { display: block; font-size: 7.5px; font-weight: 700; letter-spacing: .2em; text-transform: uppercase; color: var(--gold); margin-top: 2px; }
        .sum-body { padding: 14px 16px 18px; }
        .sum-list { margin-bottom: 13px; max-height: 260px; overflow-y: auto; }
        .sum-list::-webkit-scrollbar { width: 3px; }
        .sum-list::-webkit-scrollbar-thumb { background: var(--bdr2); }
        .sum-row { display: flex; align-items: center; gap: 9px; padding: 8px 0; border-bottom: 1px solid var(--ink2); }
        .sum-row:last-child { border-bottom: none; }
        .sum-thumb { width: 36px; height: 36px; object-fit: cover; border: 1px solid var(--bdr); flex-shrink: 0; }
        .sum-info { flex: 1; min-width: 0; }
        .sum-cat { font-size: 7px; letter-spacing: .14em; text-transform: uppercase; color: var(--ink4); display: block; }
        .sum-name { font-size: 10px; font-weight: 500; color: var(--ink); display: block; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
        .sum-tags { display: flex; gap: 3px; flex-wrap: wrap; margin-top: 2px; }
        .sum-tag { font-size: 7px; font-weight: 500; background: var(--golddim); color: #7a6010; padding: 1.5px 6px; }
        .sum-price { font-size: 10px; font-weight: 600; color: var(--olive); flex-shrink: 0; }
        .sum-check { width: 18px; height: 18px; background: var(--olivedim); color: var(--olive); display: flex; align-items: center; justify-content: center; font-size: 8.5px; flex-shrink: 0; }
        .sum-empty { text-align: center; font-family: var(--ffd); font-style: italic; font-size: 13px; color: var(--ink4); padding: 22px 0; }
        .sum-divider { height: 1px; margin: 13px 0; background: linear-gradient(90deg, transparent, var(--gold2), transparent); }
        .sum-total-row { display: flex; justify-content: space-between; align-items: baseline; margin-bottom: 4px; }
        .sum-total-lbl { font-size: 8px; font-weight: 700; letter-spacing: .15em; text-transform: uppercase; color: var(--ink4); }
        .sum-total-val { font-family: var(--ffd); font-size: 1.6rem; font-weight: 600; color: var(--ink); }
        .sum-saving { font-size: 11px; font-weight: 500; color: var(--green); margin-bottom: 14px; }
        .btn-cart { width: 100%; display: flex; align-items: center; justify-content: center; gap: 7px; font-size: 9.5px; font-weight: 700; letter-spacing: .15em; text-transform: uppercase; color: #fff; background: var(--olive); padding: 14px; margin-bottom: 8px; min-height: 48px; box-shadow: 0 4px 14px rgba(61,80,22,.25); transition: all .2s; }
        .btn-cart:hover:not(:disabled) { background: #2e3c0e; transform: translateY(-1px); }
        .btn-cart:disabled { opacity: .4; cursor: not-allowed; }
        .btn-cart.done { background: var(--green) !important; }
        .btn-buy { width: 100%; display: flex; align-items: center; justify-content: center; gap: 7px; font-size: 9.5px; font-weight: 700; letter-spacing: .13em; text-transform: uppercase; color: var(--ink); background: var(--gold2); border: 1.5px solid var(--gold); padding: 12px; min-height: 44px; transition: all .2s; }
        .btn-buy:hover:not(:disabled) { background: var(--gold); color: #fff; transform: translateY(-1px); }
        .btn-buy:disabled { opacity: .4; cursor: not-allowed; }
        .perks { display: flex; justify-content: center; gap: 12px; margin-top: 12px; flex-wrap: wrap; }
        .perk { font-size: 8.5px; color: var(--ink4); display: flex; align-items: center; gap: 4px; }
        .perk::before { content: '◆'; font-size: 4.5px; color: var(--gold); opacity: .6; }

        /* ─────────────────────────────────────────────────────────
           FIX 1: Mobile bottom bar
           Two explicit children side-by-side:
             • .mobile-bar-info  (flex: 1, truncates at left edge)
             • .mobile-bar-cart  (fixed width, never hidden)
           The bar itself uses display:flex with align-items:stretch so
           both children fill the full height. Safe-area inset is applied
           as bottom padding on the bar, NOT on the children, so the cart
           button is always fully visible above the home indicator.
           ───────────────────────────────────────────────────────── */
        .mobile-bar {
          display: none;               /* shown only on ≤1100px via media query below */
          position: fixed;
          bottom: 0; left: 0; right: 0;
          z-index: 200;
          background: var(--surf);
          border-top: 1px solid var(--bdr);
          box-shadow: 0 -4px 20px rgba(26,29,13,.12);
          /* horizontal padding */
          padding-left: 16px;
          padding-right: 16px;
          /* top padding inside bar */
          padding-top: 10px;
          /* bottom padding clears iOS home indicator */
          padding-bottom: max(14px, env(safe-area-inset-bottom, 14px));
          /* layout */
          align-items: center;         /* vertically centre children */
          gap: 12px;
          /* minimum usable height above safe area */
          min-height: 64px;
        }

        .mobile-bar-info {
          flex: 1;
          min-width: 0;                /* allow truncation */
          display: flex;
          flex-direction: column;
          justify-content: center;
          gap: 1px;
          text-align: left;
          padding: 0;
          background: none;
          border: none;
          cursor: pointer;
        }
        .mobile-bar-info:disabled { cursor: default; }
        .mobile-bar-count { font-size: 9px; color: var(--ink4); font-weight: 500; }
        .mobile-bar-price { font-family: var(--ffd); font-size: 1.3rem; font-weight: 600; color: var(--ink); line-height: 1.1; }
        .mobile-bar-save { font-size: 9.5px; color: var(--green); font-weight: 500; }
        .mobile-bar-view { font-size: 8.5px; color: var(--gold); font-weight: 600; }
        .mobile-bar-empty { font-size: 11px; color: var(--ink4); font-style: italic; }

        /*
          FIX 1: Cart button — hard-coded dimensions so it can NEVER be
          accidentally hidden, clipped, or squashed. flex-shrink:0 prevents
          the info column from eating into its width.
        */
        .mobile-bar-cart {
          flex-shrink: 0;
          width: 128px;               /* fixed width — never collapses */
          height: 46px;               /* fixed height — always fully visible */
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 10px;
          font-weight: 700;
          letter-spacing: .13em;
          text-transform: uppercase;
          color: #fff;
          background: var(--olive);
          border: none;
          border-radius: 4px;
          box-shadow: 0 4px 12px rgba(61,80,22,.28);
          transition: background .18s, transform .12s;
        }
        .mobile-bar-cart.done { background: var(--green); }
        .mobile-bar-cart:disabled { opacity: .4; cursor: not-allowed; }
        .mobile-bar-cart:not(:disabled):active { transform: scale(.97); }

        /* Show the bar on mobile/tablet */
        @media (max-width: 1100px) {
          .layout {
            /* give page content room so last card clears the bar */
            padding-bottom: calc(100px + env(safe-area-inset-bottom, 0px)) !important;
          }
          .summary-panel { display: none; }
          .mobile-bar { display: flex; }
        }

        /* ── MOBILE SUMMARY SHEET ── */
        .mobile-sum-backdrop { position: fixed; inset: 0; z-index: 300; background: rgba(10,12,5,.55); backdrop-filter: blur(5px); display: flex; align-items: flex-end; }
        .mobile-sum-sheet {
          width: 100%; background: var(--surf); border-radius: 16px 16px 0 0;
          max-height: 82dvh; overflow-y: auto;
          padding-bottom: max(16px, env(safe-area-inset-bottom, 16px));
          animation: sheetUp .25s cubic-bezier(.34,1.1,.64,1);
        }
        @keyframes sheetUp { from { transform: translateY(100%); } to { transform: translateY(0); } }
        .mobile-sum-handle { display: flex; justify-content: center; padding: 11px; }
        .mobile-sum-handle-bar { width: 32px; height: 3px; border-radius: 2px; background: var(--bdr2); }
        .mobile-sum-title { font-family: var(--ffd); font-size: 1.15rem; font-weight: 500; color: var(--olive); padding: 0 18px 11px; border-bottom: 1px solid var(--bdr); }
        .mobile-sum-list { padding: 0 18px; }
        .mobile-sum-footer { padding: 14px 18px 0; }

        /* ── LOADING ── */
        .loading { display: flex; align-items: center; justify-content: center; min-height: 40vh; font-family: var(--ffd); font-style: italic; font-size: 1.25rem; color: var(--ink4); }

        /* ── RESPONSIVE ── */
        @media (max-width: 760px) {
          .hero, .modebar, .layout { padding-left: 14px; padding-right: 14px; }
          .hero { margin-top: 48px; padding-top: 24px; }
          .layout { padding-top: 16px; }
        }
        @media (min-width: 1101px) {
          .mobile-bar { display: none !important; }
          .mobile-sum-backdrop { display: none !important; }
        }
      `}</style>

      <div className="page">
        <UpperNav />

        {/* HERO */}
        <div className="hero">
          <div className="hero-eyebrow">
            <span className="hero-line"/>
            <span>Jewellery Collections</span>
            <span className="hero-line"/>
          </div>
          <h1>Build Your <em>Perfect</em><br />Jewellery Hamper</h1>
          <p className="hero-desc">Choose a curated set and personalise every piece — or build something entirely your own.</p>
        </div>

        {/* MODE BAR */}
        <div className="modebar">
          <div className="modetoggle">
            <button className={`modebtn${mode === 'preset' ? ' on' : ''}`} onClick={() => setMode('preset')}>◈ Curated Sets</button>
            <button className={`modebtn${mode === 'custom' ? ' on' : ''}`} onClick={() => setMode('custom')}>✦ Build Your Own</button>
          </div>
          <p className="modehint">
            {mode === 'preset'
              ? 'Pick a curated hamper, tap to view & personalise each piece.'
              : 'Choose a category, pick your pieces, customise each one, and add to cart.'}
          </p>
        </div>

        {/* SIDE PANEL (preset mode) */}
        {mode === 'preset' && panelCombo && (
          <SidePanel
            combo={panelCombo}
            products={panelProducts}
            variants={presetVariants}
            onVariantChange={(pid, v) => setPresetVariants(prev => ({ ...prev, [pid]: v }))}
            categoryLabels={categoryLabels}
            onClose={() => setPanelCombo(null)}
          />
        )}

        {/* ADD-FLOW MODAL */}
        {pendingAdd && (
          <ProductCustomiser
            product={pendingAdd}
            variant={{}}
            onSave={v => { setHamper(prev => ({ ...prev, [pendingAdd.id]: v })); setPendingAdd(null); }}
            onClose={() => setPendingAdd(null)}
            isAddFlow
          />
        )}

        {/* EDIT MODAL */}
        {editingProduct && (
          <ProductCustomiser
            product={editingProduct}
            variant={hamper[editingProduct.id] || {}}
            onSave={v => { setHamper(prev => ({ ...prev, [editingProduct.id]: v })); setEditingProduct(null); }}
            onClose={() => setEditingProduct(null)}
          />
        )}

        {/* MOBILE SUMMARY DRAWER */}
        {showMobileSummary && (
          <div className="mobile-sum-backdrop" onClick={e => e.target === e.currentTarget && setShowMobileSummary(false)}>
            <div className="mobile-sum-sheet">
              <div className="mobile-sum-handle"><div className="mobile-sum-handle-bar"/></div>
              <div className="mobile-sum-title">Your Hamper Summary</div>
              <div className="mobile-sum-list">
                {summaryItems.length === 0 ? (
                  <p className="sum-empty">No pieces added yet.</p>
                ) : summaryItems.map(({ k, p }) => {
                  const v = mode === 'preset' ? (presetVariants[p.id] || {}) : (hamper[p.id] || {});
                  const tags = [v.colour, v.size ? `Size ${v.size}` : '', v.personalMessage ? '✉ Msg' : ''].filter(Boolean);
                  return (
                    <div key={`${k}-${p.id}`} className="sum-row">
                      <img className="sum-thumb" src={p.image || '/images/hero.png'} alt={p.name} />
                      <div className="sum-info">
                        <span className="sum-cat">{categoryLabels[k] || k}</span>
                        <span className="sum-name">{p.name}</span>
                        {tags.length > 0 && <div className="sum-tags">{tags.map(t => <span key={t} className="sum-tag">{t}</span>)}</div>}
                      </div>
                      <span className="sum-price">₹{p.price.toLocaleString('en-IN')}</span>
                    </div>
                  );
                })}
              </div>
              <div className="mobile-sum-footer">
                <div className="sum-divider"/>
                <div className="sum-total-row">
                  <span className="sum-total-lbl">Total</span>
                  <span className="sum-total-val">₹{totalPrice.toLocaleString('en-IN')}</span>
                </div>
                {savings > 0 && <p className="sum-saving">🎉 You save ₹{savings.toLocaleString('en-IN')}</p>}
                <button className={`btn-cart${cartAdded ? ' done' : ''}`} onClick={() => { handleAddToCart(); setShowMobileSummary(false); }} disabled={!hasItems}>
                  {cartAdded ? '✓ Added to Cart!' : 'Add Hamper to Cart'}
                </button>
                <button className="btn-buy" onClick={() => { setShowMobileSummary(false); handleBuyNow(); }} disabled={!hasItems}>
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M5 12h14M12 5l7 7-7 7"/></svg>
                  Buy It Now
                </button>
              </div>
            </div>
          </div>
        )}

        {/* LAYOUT */}
        <div className="layout">
          <div>
            {isLoading ? (
              <div className="loading">Loading collections…</div>
            ) : mode === 'preset' ? (
              <>
                <div className="sec-label">Choose a Hamper Set</div>
                <div className="cgrid">
                  {presetCombos.map(c => (
                    <ComboCard
                      key={c.id}
                      combo={c}
                      selected={selectedComboId === c.id}
                      onSelect={setSelectedComboId}
                      productsByCategory={productsByCategory}
                      categoryLabels={categoryLabels}
                      variants={presetVariants}
                      onVariantChange={(pid, v) => setPresetVariants(prev => ({ ...prev, [pid]: v }))}
                      onOpenPanel={handleOpenPanel}
                    />
                  ))}
                </div>
              </>
            ) : (
              <>
                {/* Category pills — only one open at a time */}
                <div className="sec-label">1. Select a Category</div>
                <div className="cat-pills">
                  {allCategories.map(cat => {
                    const isOpen = activeCategory === cat;
                    const countInHamper = (productsByCategory[cat] ?? []).filter(p => hamperProductIds.includes(p.id)).length;
                    return (
                      <button
                        key={cat}
                        className={`cat-pill${isOpen ? ' on' : ''}`}
                        onClick={() => handleCategoryPillClick(cat)}
                      >
                        {isOpen ? '✓ ' : '+ '}
                        {categoryLabels[cat] || cat}
                        {countInHamper > 0 && !isOpen && (
                          <span style={{ marginLeft: 4, fontSize: 8, background: 'var(--gold)', color: '#fff', padding: '1px 5px', borderRadius: 50 }}>
                            {countInHamper}
                          </span>
                        )}
                        <em className="cat-pill-chevron">▾</em>
                      </button>
                    );
                  })}
                </div>

                {hamperProductIds.length > 0 && (
                  <div className="hamper-status">
                    <div className="hamper-status-left">
                      <strong>{hamperProductIds.length} piece{hamperProductIds.length !== 1 ? 's' : ''}</strong>{' '}in your hamper
                      <span>Items go to cart together as one hamper</span>
                    </div>
                    <button className="hamper-clear" onClick={() => setHamper({})}>Clear all</button>
                  </div>
                )}

                {/* Only the active category's grid is rendered */}
                {activeCategory !== null && (productsByCategory[activeCategory] ?? []).length > 0 && (
                  <>
                    <div className="sec-label" style={{ marginTop: 4, marginBottom: 12 }}>2. Pick Your Pieces</div>
                    <div className="custom-section">
                      <div className="custom-sec-head">
                        <span className="custom-sec-title">{categoryLabels[activeCategory] || activeCategory}</span>
                        {(productsByCategory[activeCategory] ?? []).filter(p => hamperProductIds.includes(p.id)).length > 0 && (
                          <span className="custom-sec-count">
                            {(productsByCategory[activeCategory] ?? []).filter(p => hamperProductIds.includes(p.id)).length} selected
                          </span>
                        )}
                      </div>
                      <div className="custom-prod-grid">
                        {(productsByCategory[activeCategory] ?? []).map(p => (
                          <CustomProdCard
                            key={p.id}
                            product={p}
                            inHamper={hamperProductIds.includes(p.id)}
                            variant={hamper[p.id] || {}}
                            onAdd={() => handleProductAdd(p)}
                            onRemove={() => handleProductRemove(p.id)}
                            onEditCustomise={() => setEditingProduct(p)}
                          />
                        ))}
                      </div>
                    </div>
                  </>
                )}

                {activeCategory === null && allCategories.length > 0 && (
                  <p style={{ fontSize: 12, color: 'var(--ink4)', fontStyle: 'italic', marginTop: 8 }}>
                    Select a category above to browse and add pieces to your hamper.
                  </p>
                )}
              </>
            )}
          </div>

          {/* RIGHT — DESKTOP SUMMARY */}
          <div>
            <div className="summary-panel">
              <div className="sum-head">
                <div className="sum-title">Your Hamper</div>
                <span className="sum-modetag">{mode === 'preset' ? '◈ Curated Set' : '✦ Custom Build'}</span>
              </div>
              <div className="sum-body">
                <div className="sum-list">
                  {summaryItems.length === 0 ? (
                    <p className="sum-empty">{mode === 'preset' ? 'Select a hamper above.' : 'Add pieces to see them here.'}</p>
                  ) : summaryItems.map(({ k, p }) => {
                    const v = mode === 'preset' ? (presetVariants[p.id] || {}) : (hamper[p.id] || {});
                    const tags = [v.colour, v.size ? `Size ${v.size}` : '', v.personalMessage ? '✉ Msg' : '', v.uploadedImageBase64 ? '📷' : ''].filter(Boolean);
                    return (
                      <div key={`${k}-${p.id}`} className="sum-row">
                        <img className="sum-thumb" src={p.image || '/images/hero.png'} alt={p.name} />
                        <div className="sum-info">
                          <span className="sum-cat">{categoryLabels[k] || k}</span>
                          <span className="sum-name">{p.name}</span>
                          {tags.length > 0 && <div className="sum-tags">{tags.map(t => <span key={t} className="sum-tag">{t}</span>)}</div>}
                        </div>
                        {mode === 'preset'
                          ? <span className="sum-check">✓</span>
                          : <span className="sum-price">₹{p.price.toLocaleString('en-IN')}</span>
                        }
                      </div>
                    );
                  })}
                </div>
                <div className="sum-divider"/>
                <div className="sum-total-row">
                  <span className="sum-total-lbl">Total</span>
                  <span className="sum-total-val">₹{totalPrice.toLocaleString('en-IN')}</span>
                </div>
                {savings > 0 && <p className="sum-saving">🎉 You save ₹{savings.toLocaleString('en-IN')}</p>}
                <button className={`btn-cart${cartAdded ? ' done' : ''}`} onClick={handleAddToCart} disabled={!hasItems}>
                  {cartAdded ? (
                    <><svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><polyline points="20 6 9 17 4 12"/></svg> Added to Cart!</>
                  ) : (
                    <><svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M6 2L3 6v14a2 2 0 002 2h14a2 2 0 002-2V6l-3-4z"/><line x1="3" y1="6" x2="21" y2="6"/><path d="M16 10a4 4 0 01-8 0"/></svg> Add Hamper to Cart</>
                  )}
                </button>
                <button className="btn-buy" onClick={handleBuyNow} disabled={!hasItems}>
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M5 12h14M12 5l7 7-7 7"/></svg>
                  Buy It Now
                </button>
                <div className="perks">
                  <span className="perk">Free shipping ₹599+</span>
                  <span className="perk">COD available</span>
                  <span className="perk">Easy returns</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* MOBILE BOTTOM BAR — cart button always visible */}
        <MobileSummaryBar
          totalPrice={totalPrice}
          savings={savings}
          itemCount={summaryItems.length}
          onOpen={() => setShowMobileSummary(true)}
          hasItems={hasItems}
          onAddToCart={handleAddToCart}
          cartAdded={cartAdded}
        />
      </div>
    </>
  );
}

