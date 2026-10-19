
'use client';

import { useRef, useEffect } from 'react';
import Link from 'next/link';
import { useCart } from '@/lib/cartContext';
import CartBanner from '@/components/cart/CartBanner';

// ─── Main CartDrawer ──────────────────────────────────────────────────────────
export default function CartDrawer() {
  const { state, closeDrawer, removeItem, updateQty, itemCount, subtotal, total, autoDiscountAmount, appliedOffers, applicableOffers, toggleOfferOptOut } = useCart();
  const { isDrawerOpen, items } = state;
  const overlayRef = useRef<HTMLDivElement>(null);

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
        @import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,400;0,600;1,400;1,600&family=Jost:wght@300;400;500;600&display=swap');

        :root {
          --beige:     #f5f0e8;
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
          display: flex; gap: 12px; background: white; border-radius: 14px;
          padding: 12px; border: 1px solid rgba(61,74,34,.07);
        }
        .di-img {
          width: 68px; height: 68px; border-radius: 10px;
          object-fit: cover; flex-shrink: 0; background: var(--beige-dk);
        }
        .di-body { flex: 1; min-width: 0; }
        .di-name {
          font-size: 13px; font-weight: 500; color: var(--olive-900);
          margin-bottom: 3px; line-height: 1.3;
          white-space: nowrap; overflow: hidden; text-overflow: ellipsis;
        }
        .di-color {
          display: flex; align-items: center; gap: 5px;
          font-size: 11px; color: var(--mist); margin-bottom: 8px;
        }
        .di-color-dot {
          width: 10px; height: 10px; border-radius: 50%;
          border: 1.5px solid rgba(0,0,0,.12); flex-shrink: 0;
        }
        .di-price-row { display: flex; align-items: center; gap: 6px; }
        .di-price { font-size: 14px; font-weight: 600; color: var(--olive-900); }
        .di-original { font-size: 11px; color: var(--mist); text-decoration: line-through; }
        .di-actions {
          display: flex; flex-direction: column;
          align-items: flex-end; justify-content: space-between;
        }
        .di-remove {
          background: none; border: none; cursor: pointer;
          color: var(--mist); font-size: 18px; line-height: 1; padding: 2px;
          transition: color .2s;
        }
        .di-remove:hover { color: var(--red); }
        .di-qty {
          display: flex; align-items: center;
          border: 1.5px solid var(--beige-dkr); border-radius: 50px; overflow: hidden;
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
          font-size: 12px; font-weight: 600; color: var(--ink);
        }

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
          .drawer-items { padding: 12px 16px; }
          .drawer-foot  { padding: 14px 16px 20px; }
        }
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

          {/* ── CartBanner ── */}
          {items.length > 0 && (
            <div className="dp-section">
              <CartBanner />
            </div>
          )}

          {/* ── Items ── */}
          {items.length === 0 ? (
            <div className="drawer-empty">
              <div className="drawer-empty-icon">◇</div>
              <p className="drawer-empty-text">Your cart is empty</p>
              <Link href="/categories" className="drawer-empty-link" onClick={closeDrawer}>
                Start Shopping
              </Link>
            </div>
          ) : (
            <div className="drawer-items">
              {items.map(item => (
                <div
                  className="di-card"
                  key={item.cartItemId ?? `${item.id}-${item.colorHex}`}
                  style={(item.selectedCharms?.length || item.selectionGroups?.length) ? { flexDirection: 'column', gap: 8 } : undefined}
                >
                  <div style={{ display: 'flex', gap: 12 }}>
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <Link href={item.href || `/products/${item.id}`} onClick={closeDrawer} style={{ flexShrink: 0 }}>
  <img className="di-img" src={item.image} alt={item.name} />
</Link>
                    <div className="di-body">
                      <Link href={item.href || `/products/${item.id}`} onClick={closeDrawer} style={{ textDecoration: 'none' }}>
  <div className="di-name">{item.name}</div>
</Link>

                      {/* {!item.selectedCharms?.length && (
                        <div className="di-color">
                          <span className="di-color-dot" style={{ background: item.colorHex }} />
                          {item.color}
                        </div>
                      )} */}
                      <div className="di-price-row">
                        <span className="di-price">₹{(item.price * item.qty).toLocaleString('en-IN')}</span>
                        {item.originalPrice && (
                          <span className="di-original">₹{(item.originalPrice * item.qty).toLocaleString('en-IN')}</span>
                        )}
                      </div>
                      {(item as any).priceBreakdown && (
                        <div style={{ fontSize: 9.5, color: 'var(--mist)', marginTop: 2 }}>
                          {(item as any).priceBreakdown}
                        </div>
                      )}
                    </div>
                    <div className="di-actions">
                      <button
                        className="di-remove"
                        onClick={() => removeItem(item.id, item.colorHex)}
                        aria-label={`Remove ${item.name}`}
                      >×</button>
                      {(!item.selectedCharms?.length && !item.selectionGroups?.length) && (
                        <div className="di-qty">
                          <button className="di-qty-btn" onClick={() => updateQty(item.id, item.colorHex, item.qty - 1)}>−</button>
                          <span className="di-qty-val">{item.qty}</span>
                          <button className="di-qty-btn" onClick={() => updateQty(item.id, item.colorHex, item.qty + 1)}>+</button>
                        </div>
                      )}
                    </div>
                  </div>

                  {item.chain && (
                    <div style={{ fontSize: 11, color: 'var(--olive-600)', marginTop: 8, padding: '0 10px' }}>
                      Chain: <strong>{item.chainLabel || item.chain}</strong>
                    </div>
                  )}

                  {item.selectedCharms && item.selectedCharms.length > 0 && (
                    <div style={{ background: 'var(--beige)', borderRadius: 8, padding: '8px 10px', display: 'flex', flexDirection: 'column', gap: 4 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap', marginBottom: 2 }}>
                        <span style={{ fontSize: 8, letterSpacing: '.25em', textTransform: 'uppercase', color: 'var(--mist)', fontWeight: 600 }}>
                          {item.selectedCharms.length} Pieces
                        </span>
                        {/* Band badge */}
                        {(item as any).band?.name && (
                          <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4, fontSize: 9, fontWeight: 600, color: 'var(--olive-600)', background: 'rgba(74,92,34,.08)', padding: '2px 6px', borderRadius: 12 }}>
                            {(item as any).band?.image ? (
                              <img src={(item as any).band.image} alt={(item as any).band.name} style={{ width: 12, height: 12, borderRadius: '50%', objectFit: 'cover', flexShrink: 0 }} />
                            ) : <span>🪡</span>}
                            {(item as any).band.name}
                          </span>
                        )}
                        {/* Pack add-on badge */}
                        {(item as any).selectionGroups?.[0]?.metadata?.packAddOn > 0 && (
                          <span style={{ fontSize: 8, color: 'var(--mist)', fontStyle: 'italic' }}>
                            +₹{(item as any).selectionGroups[0].metadata.packAddOn} add-on
                          </span>
                        )}
                      </div>
                      {item.selectedCharms.map((selection, idx: number) => {
                        const charm = typeof selection === 'string' ? { id: selection, name: selection } : selection;
                        return (
                          <div key={charm.id || charm._id || idx} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: 11 }}>
                            <span style={{ color: 'var(--olive-900)', display: 'flex', alignItems: 'center', gap: 5 }}>
                              <span style={{ fontSize: 12 }}>{charm.emoji || '◈'}</span>
                              {charm.name || 'Charm'}
                            </span>
                            {charm.price ? <span style={{ fontWeight: 600, color: 'var(--olive-600)', fontSize: 10 }}>₹{charm.price.toLocaleString('en-IN')}</span> : null}
                          </div>
                        );
                      })}
                    </div>
                  )}

                  {!item.selectedCharms?.length && item.selectionGroups && item.selectionGroups.length > 0 && (
                    <div style={{ background: 'var(--beige)', borderRadius: 8, padding: '8px 10px', display: 'flex', flexDirection: 'column', gap: 4 }}>
                      <div style={{ fontSize: 8, letterSpacing: '.25em', textTransform: 'uppercase', color: 'var(--mist)', fontWeight: 600, marginBottom: 2 }}>
                        Included Items
                      </div>
                      {Boolean(item.customData) && (Boolean(item.customData?.comboPresetMessage) || Boolean(item.customData?.comboPersonalMessage)) && (
                        <div style={{ padding: '4px 6px', background: 'rgba(201,168,76,0.1)', borderRadius: 6, fontSize: 10, color: 'var(--olive-700)', marginBottom: 4 }}>
                          <div style={{ fontWeight: 600, fontSize: 9, color: 'var(--gold)', textTransform: 'uppercase', letterSpacing: '.05em' }}>Box Customisation</div>
                          {Boolean(item.customData?.comboPresetMessage) && <div>Card: <em>{String(item.customData?.comboPresetMessage)}</em></div>}
                          {Boolean(item.customData?.comboPersonalMessage) && <div>Message: &ldquo;{String(item.customData?.comboPersonalMessage)}&rdquo;</div>}
                        </div>
                      )}
                      {item.selectionGroups.flatMap((group) => 
                        group.items.map((selection, idx) => (
                          <div key={selection.id || idx} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '4px 0', borderBottom: '1px solid rgba(61,74,34,.05)' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                              {selection.image && <img src={selection.image} alt={selection.name} style={{ width: 28, height: 28, borderRadius: 4, objectFit: 'cover' }} />}
                              <div style={{ display: 'flex', flexDirection: 'column' }}>
                                <span style={{ fontSize: 9, color: 'var(--mist)', textTransform: 'uppercase', letterSpacing: '.05em' }}>{group.label || group.category}</span>
                                <span style={{ fontSize: 11, color: 'var(--olive-900)' }}>{selection.name}</span>
                                {Boolean(selection.customData) && (Boolean(selection.customData?.presetMessage) || Boolean(selection.customData?.personalMessage) || Boolean(selection.customData?.chain) || (Boolean(selection.customData?.charmCount) && Number(selection.customData?.charmCount) > 0)) && (
                                  <div style={{ fontSize: 9.5, color: 'var(--olive-600)', marginTop: 2 }}>
                                    {Boolean(selection.customData?.presetMessage) && <div>Card: <em>{String(selection.customData?.presetMessage)}</em></div>}
                                    {Boolean(selection.customData?.personalMessage) && <div>Msg: &ldquo;{String(selection.customData?.personalMessage)}&rdquo;</div>}
                                    {Boolean(selection.customData?.chain) && <div>Chain: <strong>{String(selection.customData?.chain)}</strong></div>}
                                    {Boolean(selection.customData?.charmCount) && Number(selection.customData?.charmCount) > 0 && (
                                      <div>Charms: {Array.isArray(selection.customData?.selectedCharms) ? selection.customData.selectedCharms.filter(Boolean).join(', ') : ''}</div>
                                    )}
                                  </div>
                                )}
                              </div>
                            </div>
                          </div>
                        ))
                      )}
                    </div>
                  )}

                  {item.giftBox && (
                    <div
                      style={{
                        marginTop: 8,
                        background: 'linear-gradient(135deg, rgba(201,168,76,0.12), rgba(61,80,22,0.06))',
                        border: '1px solid rgba(201,168,76,0.3)',
                        borderRadius: 10,
                        padding: '8px 10px',
                        display: 'flex',
                        alignItems: 'center',
                        gap: 10,
                      }}
                    >
                      {item.giftBoxDetails?.image ? (
                        <img
                          src={item.giftBoxDetails.image}
                          alt={item.giftBoxDetails.heading || 'Gift Box'}
                          style={{
                            width: 36,
                            height: 36,
                            borderRadius: 6,
                            objectFit: 'cover',
                            flexShrink: 0,
                            border: '1px solid rgba(201,168,76,0.3)',
                          }}
                        />
                      ) : (
                        <span style={{ fontSize: 18 }}>🎁</span>
                      )}
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 6 }}>
                          <span
                            style={{
                              fontSize: 11,
                              fontWeight: 600,
                              color: 'var(--olive-900)',
                              whiteSpace: 'nowrap',
                              overflow: 'hidden',
                              textOverflow: 'ellipsis',
                            }}
                          >
                            🎁 {item.giftBoxDetails?.heading || 'Premium Gift Box'}
                          </span>
                          <span style={{ fontSize: 11, fontWeight: 700, color: 'var(--olive-700)', flexShrink: 0 }}>
                            +₹{item.giftBoxDetails?.price ?? 99}
                          </span>
                        </div>
                        {item.giftBoxDetails?.description && (
                          <div
                            style={{
                              fontSize: 10,
                              color: 'var(--mist)',
                              lineHeight: 1.3,
                              marginTop: 2,
                              whiteSpace: 'nowrap',
                              overflow: 'hidden',
                              textOverflow: 'ellipsis',
                            }}
                          >
                            {item.giftBoxDetails.description}
                          </div>
                        )}
                        {item.giftMessage && (
                          <div style={{ fontSize: 9.5, color: 'var(--olive-600)', fontStyle: 'italic', marginTop: 2 }}>
                            &ldquo;{item.giftMessage}&rdquo;
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}

          {/* ── Footer ── */}
          {items.length > 0 && (
            <div className="drawer-foot">
              <div className="drawer-subtotal-row">
                <span>Subtotal ({itemCount} item{itemCount !== 1 ? 's' : ''})</span>
                <strong>₹{subtotal.toLocaleString('en-IN')}</strong>
              </div>

              {/* Auto-applied store offers */}
              {applicableOffers.length > 0 && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 6, padding: '8px 0', borderTop: '1px solid rgba(61,74,34,.08)' }}>
                  <span style={{ fontSize: 9, fontWeight: 700, letterSpacing: '.18em', textTransform: 'uppercase', color: 'var(--mist)' }}>Store Offers</span>
                  {applicableOffers.map((o) => (
                    <div key={o.id} style={{
                      display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                      background: o.applied ? 'rgba(46,125,50,.07)' : 'rgba(0,0,0,.03)',
                      border: `1px solid ${o.applied ? 'rgba(46,125,50,.2)' : 'rgba(0,0,0,.07)'}`,
                      borderRadius: 8, padding: '7px 10px',
                    }}>
                      <label style={{ display: 'flex', alignItems: 'center', gap: 7, cursor: 'pointer', flex: 1 }}>
                        <input
                          type="checkbox"
                          checked={o.applied}
                          onChange={() => toggleOfferOptOut(o.id)}
                          style={{ cursor: 'pointer', accentColor: 'var(--olive-600)', width: 14, height: 14, flexShrink: 0 }}
                        />
                        <span style={{ fontSize: 12, fontWeight: 500, color: o.applied ? 'var(--olive-700)' : 'var(--mist)', lineHeight: 1.3 }}>{o.title}</span>
                      </label>
                      <span style={{
                        fontSize: 12, fontWeight: 800, color: o.applied ? 'var(--green)' : 'var(--mist)',
                        flexShrink: 0, marginLeft: 8,
                      }}>
                        {o.applied ? `−₹${o.amount.toLocaleString('en-IN')}` : 'Off'}
                      </span>
                    </div>
                  ))}
                  {autoDiscountAmount > 0 && (
                    <div style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '3px 2px' }}>
                      <span style={{ display: 'inline-block', width: 7, height: 7, borderRadius: '50%', background: 'var(--green)', flexShrink: 0, animation: 'drawerPulse 1.8s infinite' }} />
                      <span style={{ fontSize: 11, color: 'var(--green)', fontWeight: 600 }}>
                        Saving ₹{autoDiscountAmount.toLocaleString('en-IN')} with store offer{appliedOffers.length !== 1 ? 's' : ''}
                      </span>
                    </div>
                  )}
                </div>
              )}

              <div className="drawer-subtotal-row" style={{ borderTop: '1px solid rgba(61,74,34,.1)', paddingTop: 10, marginTop: 4 }}>
                <span style={{ fontWeight: 700 }}>Total</span>
                <strong style={{ fontSize: 16 }}>₹{total.toLocaleString('en-IN')}</strong>
              </div>
              <div className="drawer-cta">
                <Link href="/cart" className="drawer-btn-cart" onClick={closeDrawer}>
                  View Cart &amp; Checkout
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M5 12h14M12 5l7 7-7 7" />
                  </svg>
                </Link>
                <button className="drawer-btn-shop" onClick={closeDrawer}>
                  Continue Shopping
                </button>
              </div>
            </div>
          )}


        </div>
      </div>
    </>
  );
}
