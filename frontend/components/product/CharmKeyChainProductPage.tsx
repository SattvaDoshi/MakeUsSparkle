// 'use client';

// import { useState, useRef, type ChangeEvent } from 'react';

// interface KeychainBase {
//   id: string;
//   name: string;
//   price: number;
//   description: string;
//   image: string;
//   color: string;
// }

// interface CharmItem {
//   id: string;
//   name: string;
//   price: number;
//   image: string;
//   emoji: string;
//   customisable?: boolean;
//   hasPhotoUpload?: boolean;
// }

// interface CharmCategory {
//   id: string;
//   label: string;
//   icon: string;
//   charms: CharmItem[];
// }

// // ─── Charm & Keychain product data (images come from backend) ─────────────────
// const KEYCHAIN_BASES: KeychainBase[] = [
//   {
//     id: 'kb-1',
//     name: 'Classic Ring Base',
//     price: 199,
//     description: 'Durable zinc alloy split ring',
//     image: 'https://images.unsplash.com/photo-1582143570735-ebf7c44a5c54?w=400&q=80',
//     color: '#c9a84c',
//   },
//   {
//     id: 'kb-2',
//     name: 'Lobster Clasp Base',
//     price: 249,
//     description: 'Smooth lobster clasp with link chain',
//     image: 'https://images.unsplash.com/photo-1582143570735-ebf7c44a5c54?w=400&q=80',
//     color: '#b8b8b8',
//   },
//   {
//     id: 'kb-3',
//     name: 'Carabiner Base',
//     price: 299,
//     description: 'Heavy-duty carabiner clip',
//     image: 'https://images.unsplash.com/photo-1582143570735-ebf7c44a5c54?w=400&q=80',
//     color: '#1e2310',
//   },
// ];

// const CHARM_CATEGORIES: CharmCategory[] = [
//   {
//     id: 'initials',
//     label: 'Initial Letters',
//     icon: '𝑨',
//     charms: [
//       { id: 'c-a', name: 'Letter A', price: 199, image: 'https://images.unsplash.com/photo-1612817288484-6f916006741a?w=300&q=80', emoji: 'A' },
//       { id: 'c-b', name: 'Letter B', price: 199, image: 'https://images.unsplash.com/photo-1612817288484-6f916006741a?w=300&q=80', emoji: 'B' },
//       { id: 'c-c', name: 'Letter C', price: 199, image: 'https://images.unsplash.com/photo-1612817288484-6f916006741a?w=300&q=80', emoji: 'C' },
//       { id: 'c-d', name: 'Letter D', price: 199, image: 'https://images.unsplash.com/photo-1612817288484-6f916006741a?w=300&q=80', emoji: 'D' },
//       { id: 'c-e', name: 'Letter E', price: 199, image: 'https://images.unsplash.com/photo-1612817288484-6f916006741a?w=300&q=80', emoji: 'E' },
//       { id: 'c-m', name: 'Letter M', price: 199, image: 'https://images.unsplash.com/photo-1612817288484-6f916006741a?w=300&q=80', emoji: 'M' },
//       { id: 'c-s', name: 'Letter S', price: 199, image: 'https://images.unsplash.com/photo-1612817288484-6f916006741a?w=300&q=80', emoji: 'S' },
//       { id: 'c-r', name: 'Letter R', price: 199, image: 'https://images.unsplash.com/photo-1612817288484-6f916006741a?w=300&q=80', emoji: 'R' },
//     ],
//   },
//   {
//     id: 'symbols',
//     label: 'Symbols & Icons',
//     icon: '✦',
//     charms: [
//       { id: 's-star',   name: 'Gold Star',    price: 249, image: 'https://images.unsplash.com/photo-1617038260897-41a1f14a8ca0?w=300&q=80', emoji: '⭐' },
//       { id: 's-heart',  name: 'Heart',        price: 249, image: 'https://images.unsplash.com/photo-1617038260897-41a1f14a8ca0?w=300&q=80', emoji: '❤️' },
//       { id: 's-moon',   name: 'Crescent Moon',price: 299, image: 'https://images.unsplash.com/photo-1617038260897-41a1f14a8ca0?w=300&q=80', emoji: '🌙' },
//       { id: 's-crown',  name: 'Crown',        price: 349, image: 'https://images.unsplash.com/photo-1617038260897-41a1f14a8ca0?w=300&q=80', emoji: '👑' },
//       { id: 's-butterfly',name: 'Butterfly',  price: 299, image: 'https://images.unsplash.com/photo-1617038260897-41a1f14a8ca0?w=300&q=80', emoji: '🦋' },
//       { id: 's-flower', name: 'Flower',       price: 249, image: 'https://images.unsplash.com/photo-1617038260897-41a1f14a8ca0?w=300&q=80', emoji: '🌸' },
//     ],
//   },
//   {
//     id: 'birthstones',
//     label: 'Birthstones',
//     icon: '💎',
//     charms: [
//       { id: 'bs-jan', name: 'Garnet — Jan',    price: 399, image: 'https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?w=300&q=80', emoji: '🔴' },
//       { id: 'bs-feb', name: 'Amethyst — Feb',  price: 399, image: 'https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?w=300&q=80', emoji: '🟣' },
//       { id: 'bs-mar', name: 'Aquamarine — Mar',price: 399, image: 'https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?w=300&q=80', emoji: '🔵' },
//       { id: 'bs-apr', name: 'Diamond — Apr',   price: 499, image: 'https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?w=300&q=80', emoji: '💎' },
//       { id: 'bs-aug', name: 'Peridot — Aug',   price: 399, image: 'https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?w=300&q=80', emoji: '🟢' },
//       { id: 'bs-dec', name: 'Turquoise — Dec', price: 399, image: 'https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?w=300&q=80', emoji: '🩵' },
//     ],
//   },
//   {
//     id: 'custom',
//     label: 'Custom Name',
//     icon: '✎',
//     charms: [
//       { id: 'cu-name',  name: 'Custom Name Charm',   price: 799, image: 'https://images.unsplash.com/photo-1612817288484-6f916006741a?w=300&q=80', emoji: '🔤', customisable: true },
//       { id: 'cu-date',  name: 'Special Date Charm',  price: 699, image: 'https://images.unsplash.com/photo-1612817288484-6f916006741a?w=300&q=80', emoji: '📅', customisable: true },
//       { id: 'cu-photo', name: 'Photo Locket Charm',  price: 999, image: 'https://images.unsplash.com/photo-1612817288484-6f916006741a?w=300&q=80', emoji: '🖼️', customisable: true, hasPhotoUpload: true },
//     ],
//   },
// ];

// const MAX_CHARMS = 6;

// // ─── Charm ring on the visualiser ────────────────────────────────────────────
// function CharmRing({ charm, index, total, onRemove }: { charm: CharmItem; index: number; total: number; onRemove: (charmId: string) => void }) {
//   const angle = (index / Math.max(total, 1)) * 360 - 90;
//   const radius = total <= 3 ? 68 : total <= 5 ? 76 : 84;
//   const x = 50 + radius * Math.cos((angle * Math.PI) / 180);
//   const y = 50 + radius * Math.sin((angle * Math.PI) / 180);

//   return (
//     <div
//       style={{
//         position: 'absolute',
//         left: `${x}%`,
//         top: `${y}%`,
//         transform: 'translate(-50%, -50%)',
//         animation: 'charmPop .35s cubic-bezier(.34,1.56,.64,1) both',
//         zIndex: 2,
//       }}
//     >
//       <div className="kc-vis-charm">
//         <span className="kc-vis-charm-emoji">{charm.emoji}</span>
//         <button className="kc-vis-charm-remove" onClick={() => onRemove(charm.id)} aria-label={`Remove ${charm.name}`}>×</button>
//         <div className="kc-vis-charm-line" style={{
//           position: 'absolute',
//           width: `${radius * 0.28}px`,
//           height: '1px',
//           background: 'rgba(201,168,76,.35)',
//           transformOrigin: '100% 50%',
//           right: '50%',
//           top: '50%',
//           transform: `rotate(${angle + 180}deg)`,
//           pointerEvents: 'none',
//         }} />
//       </div>
//       <div className="kc-vis-charm-name">{charm.name}</div>
//     </div>
//   );
// }

// // ─── Keychain Visualiser ──────────────────────────────────────────────────────
// function KeychainVisualiser({ base, charms }: { base: KeychainBase | null; charms: CharmItem[] }) {
//   return (
//     <div className="kc-vis-wrap">
//       <div className="kc-vis-scene">
//         {/* Ring/base centre */}
//         <div className="kc-vis-base">
//           {base ? (
//             <>
//               <div className="kc-vis-base-ring" style={{ borderColor: base.color }} />
//               <span className="kc-vis-base-label">{base.name.split(' ')[0]}</span>
//             </>
//           ) : (
//             <span className="kc-vis-base-empty">Choose<br/>a base</span>
//           )}
//         </div>

//         {/* Charms orbiting */}
//         {charms.map((charm, i) => (
//           <CharmRing key={charm.id} charm={charm} index={i} total={charms.length} onRemove={() => {}} />
//         ))}

//         {/* Empty slot hints */}
//         {base && charms.length === 0 && (
//           <div className="kc-vis-hint">Add charms below to see them here</div>
//         )}
//       </div>

//       {/* Count pill */}
//       {charms.length > 0 && (
//         <div className="kc-vis-count-wrap">
//           <div className="kc-vis-count">
//             <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>
//             You have <strong>{charms.length}</strong> charm{charms.length !== 1 ? 's' : ''} on your keychain
//             {charms.length >= MAX_CHARMS && <span className="kc-vis-max"> · Maximum reached</span>}
//           </div>
//           <div className="kc-vis-names">
//             {charms.map((c, i) => (
//               <span key={c.id} className="kc-vis-name-tag">
//                 {c.emoji} {c.name}
//               </span>
//             ))}
//           </div>
//         </div>
//       )}
//     </div>
//   );
// }

// // ─── Charm card ───────────────────────────────────────────────────────────────
// function CharmCard({ charm, added, onToggle, disabled }: { charm: CharmItem; added: boolean; onToggle: () => void; disabled: boolean }) {
//   const [customText, setCustomText] = useState('');
//   const [photoPreview, setPhotoPreview] = useState<string | null>(null);
//   const fileRef = useRef<HTMLInputElement | null>(null);

//   const handlePhoto = (e: ChangeEvent<HTMLInputElement>) => {
//     const f = e.currentTarget.files?.[0];
//     if (!f) return;
//     const r = new FileReader();
//     r.onload = (ev) => setPhotoPreview((ev.target?.result as string) || null);
//     r.readAsDataURL(f);
//   };

//   return (
//     <div className={`kc-charm-card${added ? ' added' : ''}${disabled && !added ? ' disabled' : ''}`}>
//       <div className="kc-charm-img-wrap">
//         {/* eslint-disable-next-line @next/next/no-img-element */}
//         <img src={charm.image} alt={charm.name} />
//         <div className="kc-charm-emoji-overlay">{charm.emoji}</div>
//         {added && (
//           <div className="kc-charm-added-badge">
//             <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3"><polyline points="20 6 9 17 4 12"/></svg>
//           </div>
//         )}
//       </div>
//       <div className="kc-charm-body">
//         <span className="kc-charm-name">{charm.name}</span>
//         <span className="kc-charm-price">₹{charm.price.toLocaleString('en-IN')}</span>
//       </div>

//       {/* Customisation fields for custom charms */}
//       {added && charm.customisable && (
//         <div className="kc-charm-custom">
//           <input
//             className="kc-charm-custom-input"
//             placeholder={charm.hasPhotoUpload ? 'Name or date for engraving…' : 'Enter text to engrave…'}
//             value={customText}
//             onChange={e => setCustomText(e.target.value)}
//             maxLength={20}
//           />
//           {charm.hasPhotoUpload && (
//             <label className="kc-charm-upload">
//               <input ref={fileRef} type="file" accept="image/*" style={{ display: 'none' }} onChange={handlePhoto} />
//               {photoPreview
//                 ? <img src={photoPreview} alt="Locket preview" style={{ width: 28, height: 28, objectFit: 'cover', borderRadius: 4 }} />
//                 : <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><rect x="3" y="3" width="18" height="18" rx="3"/><circle cx="8.5" cy="8.5" r="1.5"/><polyline points="21 15 16 10 5 21"/></svg>
//               }
//               <span>{photoPreview ? 'Change' : 'Photo'}</span>
//             </label>
//           )}
//         </div>
//       )}

//       <button
//         className={`kc-charm-btn${added ? ' remove' : ''}`}
//         onClick={onToggle}
//         disabled={disabled && !added}
//       >
//         {added ? (
//           <><svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><line x1="5" y1="12" x2="19" y2="12"/></svg> Remove</>
//         ) : (
//           <><svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg> Add</>
//         )}
//       </button>
//     </div>
//   );
// }

// // ─── Main page ────────────────────────────────────────────────────────────────
// export default function KeychainsCharmsPage() {
//   const [selectedBase, setSelectedBase] = useState<KeychainBase | null>(null);
//   const [selectedCharms, setSelectedCharms] = useState<CharmItem[]>([]);
//   const [activeCategory, setActiveCategory] = useState('initials');

//   const toggleCharm = (charm: CharmItem) => {
//     setSelectedCharms(prev => {
//       const exists = prev.find(c => c.id === charm.id);
//       if (exists) return prev.filter(c => c.id !== charm.id);
//       if (prev.length >= MAX_CHARMS) return prev;
//       return [...prev, charm];
//     });
//   };

//   const removeCharm = (charmId: string) => {
//     setSelectedCharms(prev => prev.filter(c => c.id !== charmId));
//   };

//   const totalPrice = (selectedBase?.price || 0) + selectedCharms.reduce((s, c) => s + c.price, 0);
//   const activeCharmCategory = CHARM_CATEGORIES.find(c => c.id === activeCategory);

//   return (
//     <>
//       <style>{`
//         @import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,300;0,400;0,600;1,300;1,400&family=Jost:wght@200;300;400;500;600&display=swap');

//         :root {
//           --beige:     #f5f0e8;
//           --beige-dk:  #ede5d5;
//           --beige-dkr: #d9cdb8;
//           --olive-900: #1a1f0d;
//           --olive-600: #3d4a22;
//           --olive-500: #5a6b2e;
//           --olive-400: #7a8e3c;
//           --olive-50:  #f2f4e8;
//           --gold:      #c9a84c;
//           --ink:       #1e2310;
//           --mist:      rgba(30,35,16,.45);
//           --red:       #c0392b;
//           --green:     #2e7d32;
//         }
//         *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

//         .kc {
//           min-height: 100vh;
//           background: var(--beige);
//           background-image:
//             radial-gradient(ellipse 80% 30% at 50% -5%, rgba(201,168,76,.08) 0%, transparent 60%),
//             radial-gradient(ellipse 40% 50% at 100% 100%, rgba(90,110,35,.07) 0%, transparent 55%);
//           font-family: 'Jost', sans-serif;
//           color: var(--ink);
//         }

//         .kc-topbar {
//           display: flex; align-items: center; justify-content: space-between;
//           padding: 16px 52px;
//           border-bottom: 1px solid rgba(61,74,34,.1);
//           background: rgba(245,240,232,.85);
//           backdrop-filter: blur(12px);
//           position: sticky; top: 0; z-index: 100;
//         }
//         .kc-logo { font-family: 'Cormorant Garamond', serif; font-size: 22px; font-weight: 300; letter-spacing: .14em; color: var(--olive-600); text-decoration: none; }
//         .kc-logo em { font-style: italic; color: var(--gold); }
//         .kc-nav { display: flex; gap: 28px; }
//         .kc-nav a { font-size: 10px; letter-spacing: .28em; text-transform: uppercase; color: var(--mist); text-decoration: none; font-weight: 500; transition: color .2s; }
//         .kc-nav a:hover, .kc-nav a.active { color: var(--olive-600); }

//         .kc-hero {
//           padding: 48px 52px 32px;
//           border-bottom: 1px solid rgba(61,74,34,.08);
//           animation: kcFadeUp .65s ease both;
//         }
//         .kc-hero-eyebrow {
//           font-size: 9px; letter-spacing: .5em; text-transform: uppercase;
//           color: var(--gold); margin-bottom: 12px;
//           display: flex; align-items: center; gap: 12px;
//         }
//         .kc-hero-eyebrow::before { content: ''; width: 32px; height: 1px; background: linear-gradient(90deg, var(--gold), transparent); }
//         .kc-hero h1 { font-family: 'Cormorant Garamond', serif; font-size: clamp(2.2rem, 4.5vw, 3.8rem); font-weight: 300; color: var(--olive-600); line-height: 1.08; letter-spacing: -.02em; }
//         .kc-hero h1 em { font-style: italic; color: var(--gold); }
//         .kc-hero-desc { font-size: 12px; font-weight: 300; color: var(--mist); max-width: 520px; line-height: 1.8; margin-top: 10px; letter-spacing: .04em; }

//         /* ── Layout ── */
//         .kc-body {
//           display: grid;
//           grid-template-columns: 1fr 340px;
//           gap: 0;
//           padding: 0 52px 72px;
//           align-items: start;
//           animation: kcFadeUp .65s ease .12s both;
//         }
//         .kc-left { padding-top: 28px; padding-right: 32px; }
//         .kc-right { padding-top: 28px; position: sticky; top: 85px; }

//         .kc-section-lbl { font-size: 9px; letter-spacing: .4em; text-transform: uppercase; color: var(--mist); font-weight: 500; margin-bottom: 14px; }

//         /* ── Base selector ── */
//         .kc-bases { display: flex; gap: 12px; margin-bottom: 32px; flex-wrap: wrap; }
//         .kc-base-card {
//           display: flex; align-items: center; gap: 10px;
//           background: white; border: 1.5px solid var(--beige-dkr);
//           border-radius: 14px; padding: 12px 16px; cursor: pointer;
//           transition: border-color .2s, box-shadow .2s; min-width: 180px; flex: 1;
//         }
//         .kc-base-card:hover { border-color: var(--olive-400); }
//         .kc-base-card.selected { border-color: var(--gold); box-shadow: 0 0 0 3px rgba(201,168,76,.15); }
//         .kc-base-dot { width: 22px; height: 22px; border-radius: 50%; border: 2px solid; flex-shrink: 0; }
//         .kc-base-info { flex: 1; }
//         .kc-base-name { font-size: 11px; font-weight: 600; color: var(--olive-600); display: block; margin-bottom: 2px; }
//         .kc-base-desc { font-size: 9.5px; color: var(--mist); display: block; }
//         .kc-base-price { font-size: 11px; font-weight: 600; color: var(--ink); }

//         /* ── Charm category tabs ── */
//         .kc-cat-tabs { display: flex; gap: 6px; margin-bottom: 18px; flex-wrap: wrap; }
//         .kc-cat-tab {
//           font-family: 'Jost', sans-serif;
//           font-size: 10px; font-weight: 600; letter-spacing: .1em; text-transform: uppercase;
//           padding: 8px 16px; border-radius: 50px;
//           border: 1.5px solid var(--beige-dkr); background: white;
//           cursor: pointer; color: var(--mist); transition: all .2s;
//           display: flex; align-items: center; gap: 6px;
//         }
//         .kc-cat-tab:hover { border-color: var(--olive-400); color: var(--olive-600); background: var(--olive-50); }
//         .kc-cat-tab.active { border-color: var(--olive-600); background: var(--olive-600); color: var(--beige); }

//         /* ── Charm grid ── */
//         .kc-charm-grid {
//           display: grid;
//           grid-template-columns: repeat(auto-fill, minmax(140px, 1fr));
//           gap: 12px;
//           margin-bottom: 32px;
//         }
//         .kc-charm-card {
//           background: white; border: 1.5px solid var(--beige-dkr);
//           border-radius: 14px; overflow: hidden;
//           transition: border-color .2s, box-shadow .2s, transform .15s;
//         }
//         .kc-charm-card:hover { border-color: var(--olive-400); transform: translateY(-2px); }
//         .kc-charm-card.added { border-color: var(--gold); box-shadow: 0 0 0 2px rgba(201,168,76,.18); }
//         .kc-charm-card.disabled { opacity: .45; }
//         .kc-charm-img-wrap { position: relative; aspect-ratio: 1; overflow: hidden; background: var(--beige-dk); }
//         .kc-charm-img-wrap img { width: 100%; height: 100%; object-fit: cover; transition: transform .35s; }
//         .kc-charm-card:hover .kc-charm-img-wrap img { transform: scale(1.07); }
//         .kc-charm-emoji-overlay {
//           position: absolute; inset: 0;
//           display: flex; align-items: center; justify-content: center;
//           font-size: 2rem; background: rgba(245,240,232,.55);
//           backdrop-filter: blur(2px);
//         }
//         .kc-charm-added-badge {
//           position: absolute; top: 7px; right: 7px;
//           width: 22px; height: 22px; border-radius: 50%; background: var(--gold);
//           display: flex; align-items: center; justify-content: center;
//         }
//         .kc-charm-body { padding: 8px 10px 6px; }
//         .kc-charm-name { display: block; font-size: 10px; font-weight: 500; color: var(--ink); margin-bottom: 2px; line-height: 1.3; }
//         .kc-charm-price { display: block; font-size: 10.5px; font-weight: 600; color: var(--olive-600); }
//         .kc-charm-custom { padding: 6px 10px; border-top: 1px solid var(--beige-dkr); display: flex; gap: 6px; align-items: center; }
//         .kc-charm-custom-input {
//           flex: 1; border: 1.5px solid var(--beige-dkr); border-radius: 6px;
//           padding: 5px 8px; font-family: 'Jost', sans-serif;
//           font-size: 10px; color: var(--ink); background: white; outline: none;
//           transition: border-color .2s;
//         }
//         .kc-charm-custom-input:focus { border-color: var(--olive-400); }
//         .kc-charm-custom-input::placeholder { color: rgba(30,35,16,.3); }
//         .kc-charm-upload {
//           display: flex; align-items: center; gap: 4px;
//           font-size: 9px; font-weight: 600; letter-spacing: .08em; text-transform: uppercase;
//           color: var(--olive-600); border: 1.5px dashed var(--beige-dkr);
//           border-radius: 6px; padding: 5px 7px; cursor: pointer; background: var(--olive-50);
//           transition: border-color .2s; flex-shrink: 0;
//         }
//         .kc-charm-upload:hover { border-color: var(--olive-400); }
//         .kc-charm-btn {
//           display: flex; align-items: center; justify-content: center; gap: 5px;
//           width: 100%; font-family: 'Jost', sans-serif;
//           font-size: 9.5px; font-weight: 600; letter-spacing: .1em; text-transform: uppercase;
//           padding: 8px; border: none; cursor: pointer;
//           transition: background .2s, color .2s;
//           background: var(--olive-50); color: var(--olive-600);
//         }
//         .kc-charm-btn:hover { background: var(--olive-100); }
//         .kc-charm-btn.remove { background: rgba(192,57,43,.07); color: var(--red); }
//         .kc-charm-btn.remove:hover { background: rgba(192,57,43,.12); }
//         .kc-charm-btn:disabled { opacity: .4; cursor: not-allowed; }

//         /* ── Visualiser ── */
//         .kc-vis-wrap { margin-bottom: 20px; }
//         .kc-vis-scene {
//           width: 100%; aspect-ratio: 1;
//           background: white;
//           border: 1.5px solid var(--beige-dkr);
//           border-radius: 20px;
//           position: relative;
//           overflow: hidden;
//           background-image:
//             radial-gradient(circle at 50% 50%, rgba(201,168,76,.06) 0%, transparent 70%),
//             repeating-linear-gradient(45deg, rgba(61,74,34,.015) 0px, rgba(61,74,34,.015) 1px, transparent 1px, transparent 20px);
//         }
//         .kc-vis-base {
//           position: absolute;
//           left: 50%; top: 50%;
//           transform: translate(-50%, -50%);
//           width: 72px; height: 72px;
//           border-radius: 50%;
//           background: var(--beige-dk);
//           display: flex; flex-direction: column; align-items: center; justify-content: center;
//           z-index: 3;
//           box-shadow: 0 4px 20px rgba(61,74,34,.15), 0 0 0 8px rgba(245,240,232,.8);
//         }
//         .kc-vis-base-ring {
//           width: 48px; height: 48px; border-radius: 50%;
//           border: 4px solid; margin-bottom: 4px;
//           flex-shrink: 0;
//         }
//         .kc-vis-base-label {
//           font-size: 8px; font-weight: 600; letter-spacing: .12em; text-transform: uppercase;
//           color: var(--mist);
//         }
//         .kc-vis-base-empty {
//           font-size: 8.5px; font-weight: 400; color: var(--mist);
//           text-align: center; letter-spacing: .06em; line-height: 1.4;
//         }
//         .kc-vis-hint {
//           position: absolute; bottom: 14px; left: 50%; transform: translateX(-50%);
//           font-size: 9.5px; color: var(--mist); letter-spacing: .06em; white-space: nowrap;
//         }
//         .kc-vis-charm {
//           position: relative;
//           width: 44px; height: 44px;
//           border-radius: 50%;
//           background: var(--beige-dk);
//           border: 2px solid var(--gold);
//           display: flex; align-items: center; justify-content: center;
//           box-shadow: 0 3px 12px rgba(201,168,76,.25);
//           cursor: pointer;
//           transition: transform .18s;
//         }
//         .kc-vis-charm:hover { transform: scale(1.12); }
//         .kc-vis-charm-emoji { font-size: 1.2rem; }
//         .kc-vis-charm-remove {
//           position: absolute; top: -6px; right: -6px;
//           width: 16px; height: 16px; border-radius: 50%;
//           background: var(--red); border: none; cursor: pointer;
//           color: white; font-size: 11px; line-height: 1;
//           display: flex; align-items: center; justify-content: center;
//           opacity: 0; transition: opacity .15s;
//         }
//         .kc-vis-charm:hover .kc-vis-charm-remove { opacity: 1; }
//         .kc-vis-charm-name {
//           position: absolute; top: calc(100% + 3px); left: 50%;
//           transform: translateX(-50%);
//           font-size: 7px; font-weight: 600; letter-spacing: .08em; text-transform: uppercase;
//           color: var(--mist); white-space: nowrap;
//           background: rgba(245,240,232,.92); padding: 1px 5px; border-radius: 3px;
//         }

//         /* Count pill */
//         .kc-vis-count-wrap { margin-top: 14px; }
//         .kc-vis-count {
//           background: linear-gradient(135deg, rgba(201,168,76,.12), rgba(90,110,35,.08));
//           border: 1px solid rgba(201,168,76,.28);
//           border-radius: 10px; padding: 10px 14px;
//           font-size: 11px; font-weight: 300; color: var(--olive-600);
//           letter-spacing: .04em; line-height: 1.7;
//           display: flex; align-items: center; gap: 7px; flex-wrap: wrap;
//         }
//         .kc-vis-count strong { font-weight: 700; }
//         .kc-vis-max { color: var(--red); font-weight: 600; }
//         .kc-vis-names { display: flex; flex-wrap: wrap; gap: 5px; margin-top: 8px; }
//         .kc-vis-name-tag {
//           font-size: 9px; font-weight: 500; letter-spacing: .06em;
//           color: var(--ink); background: white;
//           border: 1px solid var(--beige-dkr);
//           padding: 3px 8px; border-radius: 50px;
//         }

//         /* ── Summary panel ── */
//         .kc-summary {
//           background: white; border: 1.5px solid var(--beige-dkr);
//           border-radius: 20px; overflow: hidden;
//         }
//         .kc-summary-header {
//           padding: 18px 20px 14px;
//           border-bottom: 1px solid var(--beige-dkr);
//           background: linear-gradient(135deg, var(--olive-50), var(--beige-dk));
//         }
//         .kc-summary-title { font-family: 'Cormorant Garamond', serif; font-size: 1.1rem; font-weight: 400; color: var(--olive-600); }
//         .kc-summary-body { padding: 14px 20px; }
//         .kc-sum-row { display: flex; justify-content: space-between; font-size: 11px; color: var(--mist); margin-bottom: 7px; }
//         .kc-sum-row span:last-child { font-weight: 500; color: var(--ink); }
//         .kc-summary-divider { height: 1px; background: linear-gradient(90deg, rgba(61,74,34,.1), rgba(201,168,76,.2), rgba(61,74,34,.1)); margin: 10px 0; }
//         .kc-sum-total { display: flex; justify-content: space-between; align-items: baseline; margin-bottom: 14px; }
//         .kc-sum-total-lbl { font-size: 10px; letter-spacing: .1em; text-transform: uppercase; color: var(--mist); }
//         .kc-sum-total-val { font-family: 'Cormorant Garamond', serif; font-size: 1.5rem; font-weight: 600; color: var(--ink); }
//         .kc-btn-cart {
//           display: flex; align-items: center; justify-content: center; gap: 8px; width: 100%;
//           font-family: 'Jost', sans-serif; font-size: 11px; font-weight: 700; letter-spacing: .16em; text-transform: uppercase;
//           color: var(--beige); background: var(--olive-900); border: none; border-radius: 50px; padding: 14px;
//           cursor: pointer; margin-bottom: 8px; transition: background .22s;
//         }
//         .kc-btn-cart:hover { background: var(--olive-600); }
//         .kc-btn-cart:disabled { opacity: .4; cursor: not-allowed; background: var(--olive-900); }
//         .kc-btn-buy {
//           display: flex; align-items: center; justify-content: center; gap: 8px; width: 100%;
//           font-family: 'Jost', sans-serif; font-size: 11px; font-weight: 700; letter-spacing: .16em; text-transform: uppercase;
//           color: var(--beige); background: var(--gold); border: none; border-radius: 50px; padding: 14px;
//           cursor: pointer; transition: background .22s;
//         }
//         .kc-btn-buy:hover { background: #b8902b; }
//         .kc-btn-buy:disabled { opacity: .4; cursor: not-allowed; background: var(--gold); }
//         .kc-summary-note { font-size: 9.5px; color: var(--mist); text-align: center; margin-top: 10px; line-height: 1.6; }

//         @keyframes kcFadeUp { from { opacity: 0; transform: translateY(16px); } to { opacity: 1; transform: translateY(0); } }
//         @keyframes charmPop { from { opacity: 0; transform: translate(-50%, -50%) scale(0); } to { opacity: 1; transform: translate(-50%, -50%) scale(1); } }

//         @media (max-width: 960px) {
//           .kc-body { grid-template-columns: 1fr; }
//           .kc-left { padding-right: 0; }
//           .kc-right { position: static; }
//           .kc-topbar, .kc-hero, .kc-body { padding-left: 24px; padding-right: 24px; }
//           .kc-nav { display: none; }
//         }
//         @media (max-width: 520px) {
//           .kc-topbar, .kc-hero, .kc-body { padding-left: 16px; padding-right: 16px; }
//           .kc-charm-grid { grid-template-columns: repeat(auto-fill, minmax(120px, 1fr)); gap: 10px; }
//         }
//       `}</style>

//       <div className="kc">
//         <nav className="kc-topbar">
//           <a href="/" className="kc-logo">Mai<em>son</em></a>
//           <div className="kc-nav">
//             <a href="#">Collections</a>
//             <a href="#" className="active">Shop</a>
//             <a href="#">About</a>
//           </div>
//         </nav>

//         <div className="kc-hero">
//           <div className="kc-hero-eyebrow">Women · Accessories · Keychains & Charms</div>
//           <h1>Build Your <em>Charm</em> Keychain</h1>
//           <p className="kc-hero-desc">
//             Pick a base, choose up to {MAX_CHARMS} charms, and watch your keychain come to life. Each charm is hand-finished and added to your real-time preview.
//           </p>
//         </div>

//         <div className="kc-body">
//           {/* Left — builder */}
//           <div className="kc-left">
//             {/* Step 1 — Base */}
//             <p className="kc-section-lbl">Step 1 — Choose a Keychain Base</p>
//             <div className="kc-bases">
//               {KEYCHAIN_BASES.map(base => (
//                 <div
//                   key={base.id}
//                   className={`kc-base-card${selectedBase?.id === base.id ? ' selected' : ''}`}
//                   onClick={() => setSelectedBase(selectedBase?.id === base.id ? null : base)}
//                 >
//                   <div className="kc-base-dot" style={{ borderColor: base.color, background: base.color + '22' }} />
//                   <div className="kc-base-info">
//                     <span className="kc-base-name">{base.name}</span>
//                     <span className="kc-base-desc">{base.description}</span>
//                   </div>
//                   <span className="kc-base-price">₹{base.price}</span>
//                 </div>
//               ))}
//             </div>

//             {/* Step 2 — Charms */}
//             <p className="kc-section-lbl">
//               Step 2 — Add Charms ({selectedCharms.length}/{MAX_CHARMS})
//             </p>

//             {/* Category tabs */}
//             <div className="kc-cat-tabs">
//               {CHARM_CATEGORIES.map(cat => (
//                 <button
//                   key={cat.id}
//                   className={`kc-cat-tab${activeCategory === cat.id ? ' active' : ''}`}
//                   onClick={() => setActiveCategory(cat.id)}
//                 >
//                   <span>{cat.icon}</span>
//                   {cat.label}
//                 </button>
//               ))}
//             </div>

//             {/* Charm grid */}
//             <div className="kc-charm-grid">
//               {activeCharmCategory?.charms.map(charm => {
//                 const isAdded = selectedCharms.some(c => c.id === charm.id);
//                 const isFull = selectedCharms.length >= MAX_CHARMS;
//                 return (
//                   <CharmCard
//                     key={charm.id}
//                     charm={charm}
//                     added={isAdded}
//                     disabled={isFull}
//                     onToggle={() => toggleCharm(charm)}
//                   />
//                 );
//               })}
//             </div>
//           </div>

//           {/* Right — visualiser + summary */}
//           <div className="kc-right">
//             <p className="kc-section-lbl">Your Keychain Preview</p>
//             <KeychainVisualiser
//               base={selectedBase}
//               charms={selectedCharms}
//             />

//             <div className="kc-summary">
//               <div className="kc-summary-header">
//                 <div className="kc-summary-title">Order Summary</div>
//               </div>
//               <div className="kc-summary-body">
//                 {selectedBase && (
//                   <div className="kc-sum-row">
//                     <span>Base: {selectedBase.name}</span>
//                     <span>₹{selectedBase.price}</span>
//                   </div>
//                 )}
//                 {selectedCharms.map(c => (
//                   <div key={c.id} className="kc-sum-row">
//                     <span>{c.emoji} {c.name}</span>
//                     <span>₹{c.price}</span>
//                   </div>
//                 ))}
//                 {!selectedBase && selectedCharms.length === 0 && (
//                   <p style={{ fontSize: 10.5, color: 'var(--mist)', fontStyle: 'italic', textAlign: 'center', padding: '8px 0', letterSpacing: '.04em' }}>
//                     Nothing selected yet
//                   </p>
//                 )}
//                 <div className="kc-summary-divider" />
//                 <div className="kc-sum-total">
//                   <span className="kc-sum-total-lbl">Total</span>
//                   <span className="kc-sum-total-val">₹{totalPrice.toLocaleString('en-IN')}</span>
//                 </div>
//                 <button
//                   className="kc-btn-cart"
//                   disabled={!selectedBase && selectedCharms.length === 0}
//                 >
//                   <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z"/><line x1="3" y1="6" x2="21" y2="6"/><path d="M16 10a4 4 0 0 1-8 0"/></svg>
//                   Add to Cart
//                 </button>
//                 <button
//                   className="kc-btn-buy"
//                   disabled={!selectedBase && selectedCharms.length === 0}
//                 >
//                   <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M5 12h14M12 5l7 7-7 7"/></svg>
//                   Buy It Now
//                 </button>
//                 <p className="kc-summary-note">Free shipping above ₹599 · COD available</p>
//               </div>
//             </div>
//           </div>
//         </div>
//       </div>
//     </>
//   );
// }


'use client';

import { useState, useRef, type ChangeEvent, useCallback } from 'react';
import { useCart } from '@/lib/cartContext';
import { fireConfetti } from '@/components/cart/ConfettiManager';
import UpperNav from '@/components/ui/UpperNav';
import { useRouter } from 'next/navigation';

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

/* ─────────────────────────────────────────────────────────────
   DATA
───────────────────────────────────────────────────────────── */
const CHARM_CATEGORIES: CharmCategory[] = [
  {
    id: 'initials',
    label: 'Initial Letters',
    icon: '𝑨',
    charms: [
      { id: 'c-a', name: 'Letter A', price: 199, image: 'https://images.unsplash.com/photo-1612817288484-6f916006741a?w=400&q=80', emoji: 'A' },
      { id: 'c-b', name: 'Letter B', price: 199, image: 'https://images.unsplash.com/photo-1612817288484-6f916006741a?w=400&q=80', emoji: 'B' },
      { id: 'c-c', name: 'Letter C', price: 199, image: 'https://images.unsplash.com/photo-1612817288484-6f916006741a?w=400&q=80', emoji: 'C' },
      { id: 'c-d', name: 'Letter D', price: 199, image: 'https://images.unsplash.com/photo-1612817288484-6f916006741a?w=400&q=80', emoji: 'D' },
      { id: 'c-e', name: 'Letter E', price: 199, image: 'https://images.unsplash.com/photo-1612817288484-6f916006741a?w=400&q=80', emoji: 'E' },
      { id: 'c-m', name: 'Letter M', price: 199, image: 'https://images.unsplash.com/photo-1612817288484-6f916006741a?w=400&q=80', emoji: 'M' },
      { id: 'c-s', name: 'Letter S', price: 199, image: 'https://images.unsplash.com/photo-1612817288484-6f916006741a?w=400&q=80', emoji: 'S' },
      { id: 'c-r', name: 'Letter R', price: 199, image: 'https://images.unsplash.com/photo-1612817288484-6f916006741a?w=400&q=80', emoji: 'R' },
    ],
  },
  {
    id: 'symbols',
    label: 'Symbols & Icons',
    icon: '✦',
    charms: [
      { id: 's-star',      name: 'Gold Star',     price: 249, image: 'https://images.unsplash.com/photo-1617038260897-41a1f14a8ca0?w=400&q=80', emoji: '⭐' },
      { id: 's-heart',     name: 'Heart',         price: 249, image: 'https://images.unsplash.com/photo-1617038260897-41a1f14a8ca0?w=400&q=80', emoji: '❤️' },
      { id: 's-moon',      name: 'Crescent Moon', price: 299, image: 'https://images.unsplash.com/photo-1617038260897-41a1f14a8ca0?w=400&q=80', emoji: '🌙' },
      { id: 's-crown',     name: 'Crown',         price: 349, image: 'https://images.unsplash.com/photo-1617038260897-41a1f14a8ca0?w=400&q=80', emoji: '👑' },
      { id: 's-butterfly', name: 'Butterfly',     price: 299, image: 'https://images.unsplash.com/photo-1617038260897-41a1f14a8ca0?w=400&q=80', emoji: '🦋' },
      { id: 's-flower',    name: 'Flower',        price: 249, image: 'https://images.unsplash.com/photo-1617038260897-41a1f14a8ca0?w=400&q=80', emoji: '🌸' },
    ],
  },
  {
    id: 'birthstones',
    label: 'Birthstones',
    icon: '💎',
    charms: [
      { id: 'bs-jan', name: 'Garnet — Jan',     price: 399, image: 'https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?w=400&q=80', emoji: '🔴' },
      { id: 'bs-feb', name: 'Amethyst — Feb',   price: 399, image: 'https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?w=400&q=80', emoji: '🟣' },
      { id: 'bs-mar', name: 'Aquamarine — Mar', price: 399, image: 'https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?w=400&q=80', emoji: '🔵' },
      { id: 'bs-apr', name: 'Diamond — Apr',    price: 499, image: 'https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?w=400&q=80', emoji: '💎' },
      { id: 'bs-aug', name: 'Peridot — Aug',    price: 399, image: 'https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?w=400&q=80', emoji: '🟢' },
      { id: 'bs-dec', name: 'Turquoise — Dec',  price: 399, image: 'https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?w=400&q=80', emoji: '🩵' },
    ],
  },
  {
    id: 'custom',
    label: 'Custom Name',
    icon: '✎',
    charms: [
      { id: 'cu-name',  name: 'Custom Name Charm',  price: 799, image: 'https://images.unsplash.com/photo-1612817288484-6f916006741a?w=400&q=80', emoji: '🔤', customisable: true },
      { id: 'cu-date',  name: 'Special Date Charm', price: 699, image: 'https://images.unsplash.com/photo-1612817288484-6f916006741a?w=400&q=80', emoji: '📅', customisable: true },
      { id: 'cu-photo', name: 'Photo Locket Charm', price: 999, image: 'https://images.unsplash.com/photo-1612817288484-6f916006741a?w=400&q=80', emoji: '🖼️', customisable: true, hasPhotoUpload: true },
    ],
  },
];

const MAX_CHARMS = 6;

/* ─────────────────────────────────────────────────────────────
   HELPERS
───────────────────────────────────────────────────────────── */
  function buildCartItem(charm: CharmItem) {
    return {
      id: `charm-${charm.id}-${Date.now()}`,
      name: charm.name,
      price: charm.price,
      originalPrice: null,
      image: charm.image,
      color: 'Gold',
      colorHex: '#c9a84c',
      sku: `CHARM-${charm.id.toUpperCase()}`,
      href: `/keychains-charms`,
    };
  }

/* ─────────────────────────────────────────────────────────────
   CHARM CARD
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
    <div className={`charm-card${added ? ' charm-card--added' : ''}${disabled && !added ? ' charm-card--disabled' : ''}`}>
      {/* Image */}
      <div className="charm-card__img-wrap">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={charm.image} alt={charm.name} />
        <div className="charm-card__emoji">{charm.emoji}</div>
        {added && (
          <div className="charm-card__badge">
            <svg width="9" height="9" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3.5">
              <polyline points="20 6 9 17 4 12" />
            </svg>
          </div>
        )}
      </div>

      {/* Body */}
      <div className="charm-card__body">
        <span className="charm-card__name">{charm.name}</span>
        <span className="charm-card__price">₹{charm.price.toLocaleString('en-IN')}</span>
      </div>

      {/* Custom fields */}
      {added && charm.customisable && (
        <div className="charm-card__custom">
          <input
            className="charm-card__custom-input"
            placeholder={charm.hasPhotoUpload ? 'Name for engraving…' : 'Enter text…'}
            value={customText}
            onChange={(e) => setCustomText(e.target.value)}
            maxLength={20}
          />
          {charm.hasPhotoUpload && (
            <label className="charm-card__upload">
              <input ref={fileRef} type="file" accept="image/*" style={{ display: 'none' }} onChange={handlePhoto} />
              {photoPreview ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={photoPreview} alt="Locket preview" style={{ width: 24, height: 24, objectFit: 'cover', borderRadius: 4 }} />
              ) : (
                <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
                  <rect x="3" y="3" width="18" height="18" rx="3" />
                  <circle cx="8.5" cy="8.5" r="1.5" />
                  <polyline points="21 15 16 10 5 21" />
                </svg>
              )}
              <span>{photoPreview ? 'Change' : 'Photo'}</span>
            </label>
          )}
        </div>
      )}

      {/* Toggle button */}
      <button
        className={`charm-card__btn${added ? ' charm-card__btn--remove' : ''}`}
        onClick={onToggle}
        disabled={disabled && !added}
      >
        {added ? (
          <>
            <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <line x1="5" y1="12" x2="19" y2="12" />
            </svg>
            Remove
          </>
        ) : (
          <>
            <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
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
export default function KeychainsCharmsPage() {
  const { addItem } = useCart();
  const router = useRouter();
  const cartBtnRef = useRef<HTMLButtonElement | null>(null);

  const [selectedCharms, setSelectedCharms] = useState<CharmItem[]>([]);
  const [activeCategory, setActiveCategory] = useState('initials');
  const [cartAdded, setCartAdded] = useState(false);

  const toggleCharm = useCallback((charm: CharmItem) => {
    setSelectedCharms((prev) => {
      const exists = prev.find((c) => c.id === charm.id);
      if (exists) return prev.filter((c) => c.id !== charm.id);
      if (prev.length >= MAX_CHARMS) return prev;
      return [...prev, charm];
    });
  }, []);

  const removeCharm = useCallback((charmId: string) => {
    setSelectedCharms((prev) => prev.filter((c) => c.id !== charmId));
  }, []);

  const totalPrice = selectedCharms.reduce((s, c) => s + c.price, 0);
  const hasItems = selectedCharms.length > 0;
  const activeCharmCategory = CHARM_CATEGORIES.find((c) => c.id === activeCategory);

  /* ── Cart actions ── */
  function handleAddToCart() {
    if (!hasItems) return;
    selectedCharms.forEach((charm) => {
      addItem(buildCartItem(charm));
    });
    fireConfetti(cartBtnRef.current);
    setCartAdded(true);
    setTimeout(() => setCartAdded(false), 1800);
  }

  function handleBuyNow() {
    if (!hasItems) return;
    handleAddToCart();
    setTimeout(() => router.push('/checkout'), 150);
  }

  /* ─────────────────────────────────────────────────────────────
     RENDER
  ───────────────────────────────────────────────────────────── */
  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,300;0,400;0,600;1,300;1,400&family=Jost:wght@200;300;400;500;600&display=swap');

        :root {
          --beige:      #f5f0e8;
          --beige-dk:   #ede5d5;
          --beige-dkr:  #d9cdb8;
          --olive-900:  #1a1f0d;
          --olive-700:  #283010;
          --olive-600:  #3d4a22;
          --olive-500:  #5a6b2e;
          --olive-400:  #7a8e3c;
          --olive-100:  #e8edd6;
          --olive-50:   #f2f4e8;
          --gold:       #c9a84c;
          --gold-light: #eedfa0;
          --ink:        #1e2310;
          --mist:       rgba(30,35,16,.48);
          --mist-lt:    rgba(30,35,16,.28);
          --red:        #c0392b;
          --green:      #2e7d32;
          --card-r:     16px;
        }

        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
        button { font-family: 'Jost', sans-serif; cursor: pointer; }
        img { display: block; }

        /* ─── PAGE ─── */
        .kc-page {
          min-height: 100dvh;
          background: var(--beige);
          background-image:
            radial-gradient(ellipse 70% 35% at 50% -4%, rgba(201,168,76,.09) 0%, transparent 60%),
            radial-gradient(ellipse 35% 55% at 100% 100%, rgba(90,107,46,.07) 0%, transparent 55%);
          font-family: 'Jost', sans-serif;
          color: var(--ink);
        }

        /* ─── HERO ─── */
        .kc-hero {
          padding: 44px 60px 36px;
          background: linear-gradient(160deg, var(--beige) 0%, #ede5cf 60%, var(--beige) 100%);
          border-bottom: 1px solid rgba(61,74,34,.1);
          position: relative; overflow: hidden;
          animation: kcUp .6s ease both;
        }
        .kc-hero::before {
          content: '';
          position: absolute; right: -80px; top: -80px;
          width: 420px; height: 420px; border-radius: 50%;
          background: radial-gradient(circle, rgba(201,168,76,.1) 0%, transparent 65%);
          pointer-events: none;
        }
        .kc-hero-eyebrow {
          display: flex; align-items: center; gap: 12px;
          font-size: 9px; letter-spacing: .5em; text-transform: uppercase;
          color: var(--gold); font-weight: 500; margin-bottom: 16px;
        }
        .kc-hero-eyebrow::before {
          content: ''; width: 28px; height: 1px;
          background: linear-gradient(90deg, var(--gold), transparent);
        }
        .kc-hero h1 {
          font-family: 'Cormorant Garamond', serif;
          font-size: clamp(2rem, 4.2vw, 3.6rem);
          font-weight: 300; color: var(--olive-600);
          line-height: 1.06; letter-spacing: -.02em;
          margin-bottom: 10px;
        }
        .kc-hero h1 em { font-style: italic; color: var(--gold); }
        .kc-hero-desc {
          font-size: 12.5px; font-weight: 300; color: var(--mist);
          max-width: 500px; line-height: 1.85; letter-spacing: .03em;
        }

        /* ─── LAYOUT ─── */
        .kc-layout {
          display: grid;
          grid-template-columns: 1fr 340px;
          gap: 0;
          padding: 0 60px 80px;
          align-items: start;
          animation: kcUp .6s ease .1s both;
        }

        /* ─── LEFT ─── */
        .kc-left { padding-top: 30px; padding-right: 36px; }

        .kc-section-lbl {
          font-size: 9px; letter-spacing: .44em; text-transform: uppercase;
          color: var(--mist-lt); font-weight: 500; margin-bottom: 16px;
          display: flex; align-items: center; gap: 10px;
        }
        .kc-section-lbl::after {
          content: ''; flex: 1; height: 1px; background: var(--beige-dkr);
        }

        /* ─── CATEGORY TABS ─── */
        .kc-cat-tabs {
          display: flex; gap: 6px; margin-bottom: 20px; flex-wrap: wrap;
        }
        .kc-cat-tab {
          font-size: 9.5px; font-weight: 600; letter-spacing: .1em; text-transform: uppercase;
          padding: 8px 18px; border-radius: 50px;
          border: 1.5px solid var(--beige-dkr); background: white;
          cursor: pointer; color: var(--mist);
          transition: all .2s; display: flex; align-items: center; gap: 6px;
        }
        .kc-cat-tab:hover {
          border-color: var(--olive-400); color: var(--olive-600); background: var(--olive-50);
        }
        .kc-cat-tab.active {
          border-color: var(--olive-600); background: var(--olive-600); color: var(--beige);
        }

        /* ─── CHARM GRID ─── */
        .kc-charm-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(148px, 1fr));
          gap: 14px;
          margin-bottom: 36px;
        }

        /* ─── CHARM CARD ─── */
        .charm-card {
          background: white;
          border: 1.5px solid var(--beige-dkr);
          border-radius: var(--card-r);
          overflow: hidden;
          transition: border-color .2s, box-shadow .2s, transform .15s;
        }
        .charm-card:hover {
          border-color: var(--olive-400);
          transform: translateY(-3px);
          box-shadow: 0 8px 24px rgba(30,35,16,.10);
        }
        .charm-card--added {
          border-color: var(--gold);
          box-shadow: 0 0 0 2.5px rgba(201,168,76,.2);
        }
        .charm-card--disabled { opacity: .4; pointer-events: none; }

        .charm-card__img-wrap {
          position: relative;
          aspect-ratio: 1;
          overflow: hidden;
          background: var(--beige-dk);
        }
        .charm-card__img-wrap img {
          width: 100%; height: 100%; object-fit: cover;
          transition: transform .38s;
        }
        .charm-card:hover .charm-card__img-wrap img { transform: scale(1.08); }
        .charm-card__emoji {
          position: absolute; inset: 0;
          display: flex; align-items: center; justify-content: center;
          font-size: 2.1rem;
          background: rgba(245,240,232,.52);
          backdrop-filter: blur(3px);
        }
        .charm-card__badge {
          position: absolute; top: 8px; right: 8px;
          width: 22px; height: 22px; border-radius: 50%;
          background: var(--gold);
          display: flex; align-items: center; justify-content: center;
          box-shadow: 0 2px 8px rgba(201,168,76,.5);
          animation: badgePop .28s cubic-bezier(.34,1.56,.64,1) both;
        }
        @keyframes badgePop {
          from { transform: scale(0); }
          to   { transform: scale(1); }
        }

        .charm-card__body { padding: 9px 11px 6px; }
        .charm-card__name {
          display: block; font-size: 10.5px; font-weight: 500;
          color: var(--ink); margin-bottom: 2px; line-height: 1.3;
        }
        .charm-card__price {
          display: block; font-size: 11px; font-weight: 600; color: var(--olive-600);
        }

        .charm-card__custom {
          padding: 6px 10px; border-top: 1px solid var(--beige-dkr);
          display: flex; gap: 6px; align-items: center;
        }
        .charm-card__custom-input {
          flex: 1; border: 1.5px solid var(--beige-dkr); border-radius: 6px;
          padding: 5px 8px; font-family: 'Jost', sans-serif;
          font-size: 10px; color: var(--ink); background: white; outline: none;
          transition: border-color .2s;
        }
        .charm-card__custom-input:focus { border-color: var(--olive-400); }
        .charm-card__custom-input::placeholder { color: var(--mist-lt); }
        .charm-card__upload {
          display: flex; align-items: center; gap: 4px;
          font-size: 9px; font-weight: 600; letter-spacing: .08em; text-transform: uppercase;
          color: var(--olive-600); border: 1.5px dashed var(--beige-dkr);
          border-radius: 6px; padding: 5px 7px; cursor: pointer; background: var(--olive-50);
          transition: border-color .2s; flex-shrink: 0;
        }
        .charm-card__upload:hover { border-color: var(--olive-400); }

        .charm-card__btn {
          display: flex; align-items: center; justify-content: center; gap: 5px;
          width: 100%; font-family: 'Jost', sans-serif;
          font-size: 9.5px; font-weight: 600; letter-spacing: .1em; text-transform: uppercase;
          padding: 9px; border: none; cursor: pointer;
          transition: background .2s, color .2s;
          background: var(--olive-50); color: var(--olive-600);
        }
        .charm-card__btn:hover { background: var(--olive-100); }
        .charm-card__btn--remove { background: rgba(192,57,43,.07); color: var(--red); }
        .charm-card__btn--remove:hover { background: rgba(192,57,43,.13); }
        .charm-card__btn:disabled { opacity: .38; cursor: not-allowed; }

        /* ─── RIGHT PANEL ─── */
        .kc-right {
          padding-top: 30px;
          position: sticky; top: 88px;
        }

        /* ─── SELECTED CHARMS STRIP ─── */
        .kc-selected-strip {
          background: white;
          border: 1.5px solid var(--beige-dkr);
          border-radius: var(--card-r);
          overflow: hidden;
          margin-bottom: 16px;
        }
        .kc-selected-head {
          padding: 14px 18px 12px;
          background: linear-gradient(135deg, var(--olive-50), var(--beige-dk));
          border-bottom: 1px solid var(--beige-dkr);
          display: flex; align-items: center; justify-content: space-between;
        }
        .kc-selected-title {
          font-family: 'Cormorant Garamond', serif;
          font-size: 1rem; font-weight: 400; color: var(--olive-600);
        }
        .kc-selected-count {
          font-size: 9px; font-weight: 700; letter-spacing: .14em; text-transform: uppercase;
          color: var(--gold); background: rgba(201,168,76,.12);
          padding: 3px 10px; border-radius: 50px;
          border: 1px solid rgba(201,168,76,.25);
        }
        .kc-selected-count.max { color: var(--red); background: rgba(192,57,43,.08); border-color: rgba(192,57,43,.2); }

        .kc-selected-body { padding: 14px 18px; }

        .kc-selected-empty {
          text-align: center;
          font-family: 'Cormorant Garamond', serif; font-style: italic;
          font-size: 12.5px; color: var(--mist-lt);
          padding: 18px 0;
        }

        /* Selected charm thumbnails */
        .kc-selected-list {
          display: flex; flex-direction: column; gap: 8px;
        }
        .kc-selected-item {
          display: flex; align-items: center; gap: 10px;
          padding: 8px 10px;
          background: var(--beige);
          border: 1px solid var(--beige-dkr);
          border-radius: 10px;
          animation: itemSlide .3s cubic-bezier(.34,1.3,.64,1) both;
        }
        @keyframes itemSlide {
          from { opacity: 0; transform: translateX(12px); }
          to   { opacity: 1; transform: translateX(0); }
        }
        .kc-selected-thumb {
          position: relative; width: 42px; height: 42px;
          border-radius: 9px; overflow: hidden; flex-shrink: 0;
          border: 1.5px solid var(--beige-dkr);
          background: var(--beige-dk);
        }
        .kc-selected-thumb img {
          width: 100%; height: 100%; object-fit: cover;
        }
        .kc-selected-thumb-emoji {
          position: absolute; inset: 0;
          display: flex; align-items: center; justify-content: center;
          font-size: 1.2rem;
          background: rgba(245,240,232,.55);
          backdrop-filter: blur(2px);
        }
        .kc-selected-info { flex: 1; min-width: 0; }
        .kc-selected-name {
          display: block; font-size: 10.5px; font-weight: 500;
          color: var(--ink); white-space: nowrap; overflow: hidden; text-overflow: ellipsis;
        }
        .kc-selected-price {
          display: block; font-size: 10px; font-weight: 600; color: var(--olive-500);
          margin-top: 1px;
        }
        .kc-selected-remove {
          width: 24px; height: 24px; border-radius: 50%;
          border: 1.5px solid var(--beige-dkr); background: white;
          display: flex; align-items: center; justify-content: center;
          color: var(--mist); font-size: 14px; line-height: 1;
          cursor: pointer; flex-shrink: 0; padding: 0;
          transition: border-color .18s, color .18s, background .18s;
        }
        .kc-selected-remove:hover {
          border-color: var(--red); color: var(--red); background: rgba(192,57,43,.06);
        }

        /* ─── SUMMARY ─── */
        .kc-summary {
          background: white;
          border: 1.5px solid var(--beige-dkr);
          border-radius: var(--card-r);
          overflow: hidden;
          box-shadow: 0 6px 28px rgba(30,35,16,.1);
        }
        .kc-summary-head {
          padding: 18px 20px 14px;
          background: linear-gradient(135deg, var(--olive-50), var(--beige-dk));
          border-bottom: 1px solid var(--beige-dkr);
          position: relative; overflow: hidden;
        }
        .kc-summary-head::after {
          content: '◈';
          position: absolute; right: 16px; top: 50%;
          transform: translateY(-50%);
          font-size: 40px; color: rgba(201,168,76,.1);
          pointer-events: none; line-height: 1;
        }
        .kc-summary-title {
          font-family: 'Cormorant Garamond', serif;
          font-size: 1.05rem; font-weight: 400; color: var(--olive-600);
        }
        .kc-summary-body { padding: 14px 20px 18px; }

        .kc-sum-divider {
          height: 1px; margin: 10px 0;
          background: linear-gradient(90deg, transparent, var(--gold-light), transparent);
        }
        .kc-sum-total {
          display: flex; justify-content: space-between; align-items: baseline;
          margin-bottom: 14px;
        }
        .kc-sum-total-lbl {
          font-size: 9.5px; font-weight: 600; letter-spacing: .15em;
          text-transform: uppercase; color: var(--mist);
        }
        .kc-sum-total-val {
          font-family: 'Cormorant Garamond', serif;
          font-size: 1.65rem; font-weight: 600; color: var(--ink);
        }

        /* Buttons */
        .kc-btn-cart {
          display: flex; align-items: center; justify-content: center; gap: 8px;
          width: 100%; font-family: 'Jost', sans-serif;
          font-size: 10.5px; font-weight: 700; letter-spacing: .16em; text-transform: uppercase;
          color: var(--beige); background: var(--olive-900);
          border: none; border-radius: 50px; padding: 15px;
          cursor: pointer; margin-bottom: 9px;
          box-shadow: 0 4px 16px rgba(26,31,13,.28);
          transition: background .22s, transform .15s, box-shadow .2s;
        }
        .kc-btn-cart:hover:not(:disabled) {
          background: var(--olive-600);
          transform: translateY(-1px);
          box-shadow: 0 6px 20px rgba(26,31,13,.34);
        }
        .kc-btn-cart:disabled { opacity: .38; cursor: not-allowed; }
        .kc-btn-cart.done { background: var(--green) !important; }

        .kc-btn-buy {
          display: flex; align-items: center; justify-content: center; gap: 8px;
          width: 100%; font-family: 'Jost', sans-serif;
          font-size: 10.5px; font-weight: 700; letter-spacing: .16em; text-transform: uppercase;
          color: var(--ink); background: var(--gold-light);
          border: 1.5px solid var(--gold); border-radius: 50px; padding: 14px;
          cursor: pointer;
          transition: background .22s, color .22s, transform .15s;
        }
        .kc-btn-buy:hover:not(:disabled) {
          background: var(--gold); color: white;
          transform: translateY(-1px);
        }
        .kc-btn-buy:disabled { opacity: .38; cursor: not-allowed; }

        .kc-summary-perks {
          display: flex; justify-content: center; gap: 14px;
          margin-top: 12px; flex-wrap: wrap;
        }
        .kc-perk {
          font-size: 9px; color: var(--mist-lt);
          display: flex; align-items: center; gap: 4px;
        }
        .kc-perk-dot {
          width: 3px; height: 3px; border-radius: 50%;
          background: var(--gold); opacity: .6;
        }

        /* ─── ANIMATIONS ─── */
        @keyframes kcUp {
          from { opacity: 0; transform: translateY(16px); }
          to   { opacity: 1; transform: translateY(0); }
        }

        /* ─── RESPONSIVE ─── */
        @media (max-width: 1024px) {
          .kc-layout { grid-template-columns: 1fr; }
          .kc-left { padding-right: 0; }
          .kc-right { position: static; }
          .kc-hero, .kc-layout { padding-left: 32px; padding-right: 32px; }
        }
        @media (max-width: 680px) {
          .kc-hero, .kc-layout { padding-left: 18px; padding-right: 18px; }
          .kc-hero { padding-top: 28px; padding-bottom: 24px; }
          .kc-charm-grid { grid-template-columns: repeat(auto-fill, minmax(130px, 1fr)); gap: 10px; }
          .kc-layout { padding-bottom: 52px; }
        }
        @media (max-width: 400px) {
          .kc-charm-grid { grid-template-columns: repeat(2, 1fr); }
        }
      `}</style>

      <div className="kc-page">
        <UpperNav />

        {/* ── HERO ── */}
        <div className="kc-hero">
          <div className="kc-hero-eyebrow">Women · Accessories · Keychains &amp; Charms</div>
          <h1>Design Your <em>Charm</em> Keychain</h1>
          <p className="kc-hero-desc">
            Browse our hand-finished charms and add up to {MAX_CHARMS} to your keychain.
            Each piece is crafted with care — initial letters, birthstones, symbols, and custom engravings.
          </p>
        </div>

        {/* ── CONTENT ── */}
        <div className="kc-layout">

          {/* LEFT — Charm selector */}
          <div className="kc-left">
            <p className="kc-section-lbl">
              Choose Your Charms ({selectedCharms.length}/{MAX_CHARMS})
            </p>

            {/* Category Tabs */}
            <div className="kc-cat-tabs">
              {CHARM_CATEGORIES.map((cat) => (
                <button
                  key={cat.id}
                  className={`kc-cat-tab${activeCategory === cat.id ? ' active' : ''}`}
                  onClick={() => setActiveCategory(cat.id)}
                >
                  <span>{cat.icon}</span>
                  {cat.label}
                </button>
              ))}
            </div>

            {/* Charm Grid */}
            <div className="kc-charm-grid">
              {activeCharmCategory?.charms.map((charm) => {
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
              })}
            </div>
          </div>

          {/* RIGHT — Selected charms + Summary */}
          <div className="kc-right">

            {/* Selected charms panel */}
            <p className="kc-section-lbl" style={{ marginBottom: 12 }}>Your Selection</p>
            <div className="kc-selected-strip">
              <div className="kc-selected-head">
                <span className="kc-selected-title">Selected Charms</span>
                <span className={`kc-selected-count${selectedCharms.length >= MAX_CHARMS ? ' max' : ''}`}>
                  {selectedCharms.length >= MAX_CHARMS ? 'Max reached' : `${selectedCharms.length} of ${MAX_CHARMS}`}
                </span>
              </div>
              <div className="kc-selected-body">
                {selectedCharms.length === 0 ? (
                  <p className="kc-selected-empty">No charms selected yet</p>
                ) : (
                  <div className="kc-selected-list">
                    {selectedCharms.map((charm) => (
                      <div key={charm.id} className="kc-selected-item">
                        <div className="kc-selected-thumb">
                          {/* eslint-disable-next-line @next/next/no-img-element */}
                          <img src={charm.image} alt={charm.name} />
                          <div className="kc-selected-thumb-emoji">{charm.emoji}</div>
                        </div>
                        <div className="kc-selected-info">
                          <span className="kc-selected-name">{charm.name}</span>
                          <span className="kc-selected-price">₹{charm.price.toLocaleString('en-IN')}</span>
                        </div>
                        <button
                          className="kc-selected-remove"
                          onClick={() => removeCharm(charm.id)}
                          aria-label={`Remove ${charm.name}`}
                        >
                          ×
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Order Summary + Buttons */}
            <div className="kc-summary">
              <div className="kc-summary-head">
                <div className="kc-summary-title">Order Summary</div>
              </div>
              <div className="kc-summary-body">
                <div className="kc-sum-divider" />
                <div className="kc-sum-total">
                  <span className="kc-sum-total-lbl">Total</span>
                  <span className="kc-sum-total-val">₹{totalPrice.toLocaleString('en-IN')}</span>
                </div>

                <button
                  ref={cartBtnRef}
                  className={`kc-btn-cart${cartAdded ? ' done' : ''}`}
                  onClick={handleAddToCart}
                  disabled={!hasItems}
                >
                  {cartAdded ? (
                    <>
                      <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                        <polyline points="20 6 9 17 4 12" />
                      </svg>
                      Added to Cart!
                    </>
                  ) : (
                    <>
                      <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z" />
                        <line x1="3" y1="6" x2="21" y2="6" />
                        <path d="M16 10a4 4 0 0 1-8 0" />
                      </svg>
                      Add to Cart
                    </>
                  )}
                </button>

                <button
                  className="kc-btn-buy"
                  onClick={handleBuyNow}
                  disabled={!hasItems}
                >
                  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M5 12h14M12 5l7 7-7 7" />
                  </svg>
                  Buy It Now
                </button>

                <div className="kc-summary-perks">
                  <span className="kc-perk"><span className="kc-perk-dot" />Free shipping ₹599+</span>
                  <span className="kc-perk"><span className="kc-perk-dot" />COD available</span>
                  <span className="kc-perk"><span className="kc-perk-dot" />Easy returns</span>
                </div>
              </div>
            </div>

          </div>
        </div>
      </div>
    </>
  );
}