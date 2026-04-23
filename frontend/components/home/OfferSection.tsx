'use client';

import { useState } from 'react';
import Link from 'next/link';

interface Offer {
  id: string;
  code: string;
  title: string;
  description: string;
  discount: string;
  discountType: 'percent' | 'flat';
  minOrder: number;
  expiry: string;
  category: 'jewellery' | 'combo' | 'all' | 'gift';
  isNew?: boolean;
}

const OFFERS: Offer[] = [
  { id: '1', code: 'SPARK20', title: '20% off on Jewellery', description: 'Valid on all jewellery orders above ₹999', discount: '20', discountType: 'percent', minOrder: 999, expiry: '30 Apr 2025', category: 'jewellery', isNew: true },
  { id: '2', code: 'COMBO150', title: '₹150 off on Curated Combos', description: 'Mix and match your favourite pieces', discount: '150', discountType: 'flat', minOrder: 1499, expiry: '15 May 2025', category: 'combo' },
  { id: '3', code: 'GIFT10', title: '10% off on Gift Boxes', description: 'Surprise someone special today', discount: '10', discountType: 'percent', minOrder: 599, expiry: '31 May 2025', category: 'gift' },
  { id: '4', code: 'NEWUSER50', title: '₹50 off on First Order', description: 'Welcome to MakeUsSparkle!', discount: '50', discountType: 'flat', minOrder: 399, expiry: '31 Dec 2025', category: 'all', isNew: true },
  { id: '5', code: 'MONSOON15', title: '15% off Sitewide', description: 'Limited time monsoon sale — shop now', discount: '15', discountType: 'percent', minOrder: 0, expiry: '10 Jun 2025', category: 'all' },
  { id: '6', code: 'CHARM30', title: '30% off Custom Charms', description: 'Personalise your favourite charm jewellery', discount: '30', discountType: 'percent', minOrder: 699, expiry: '20 May 2025', category: 'jewellery' },
];

const FILTERS = ['All', 'Jewellery', 'Combos', 'Gift', 'Sitewide'] as const;
type Filter = typeof FILTERS[number];

const categoryMap: Record<Filter, Offer['category'] | 'all-filter'> = {
  'All': 'all-filter',
  'Jewellery': 'jewellery',
  'Combos': 'combo',
  'Gift': 'gift',
  'Sitewide': 'all',
};

export default function OffersSection() {
  const [activeFilter, setActiveFilter] = useState<Filter>('All');
  const [copied, setCopied] = useState<string | null>(null);

  const filtered = activeFilter === 'All'
    ? OFFERS
    : OFFERS.filter(o => o.category === categoryMap[activeFilter]);

  const copyCode = (code: string) => {
    navigator.clipboard.writeText(code);
    setCopied(code);
    setTimeout(() => setCopied(null), 2000);
  };

  return (
    <>
      <style>{CSS}</style>
      <section className="os">
        <div className="os-hero">
          <span className="os-eyebrow">Exclusive Deals</span>
          <h1 className="os-title">Offers & <em>Coupons</em></h1>
          <p className="os-sub">Apply at checkout to save on your sparkle</p>
        </div>

        <div className="os-filters">
          {FILTERS.map(f => (
            <button
              key={f}
              className={`os-filter${activeFilter === f ? ' on' : ''}`}
              onClick={() => setActiveFilter(f)}
            >{f}</button>
          ))}
        </div>

        <div className="os-grid">
          {filtered.map(offer => (
            <div key={offer.id} className="os-card">
              {offer.isNew && <span className="os-new">New</span>}
              <div className="os-card-top">
                <div className="os-discount">
                  <span className="os-disc-val">
                    {offer.discountType === 'percent' ? `${offer.discount}%` : `₹${offer.discount}`}
                  </span>
                  <span className="os-disc-off">OFF</span>
                </div>
                <div className="os-card-info">
                  <h3 className="os-card-title">{offer.title}</h3>
                  <p className="os-card-desc">{offer.description}</p>
                </div>
              </div>

              <div className="os-card-mid">
                {offer.minOrder > 0 && (
                  <span className="os-pill">Min order ₹{offer.minOrder}</span>
                )}
                <span className="os-pill">Expires {offer.expiry}</span>
              </div>

              <div className="os-card-bot">
                <div className="os-code-box">
                  <span className="os-code">{offer.code}</span>
                  <button
                    className={`os-copy${copied === offer.code ? ' done' : ''}`}
                    onClick={() => copyCode(offer.code)}
                  >
                    {copied === offer.code ? '✓ Copied' : 'Copy'}
                  </button>
                </div>
                <Link href="/categories" className="os-shop">
                  Shop now →
                </Link>
              </div>
            </div>
          ))}
        </div>

        {filtered.length === 0 && (
          <div className="os-empty">No offers in this category right now. Check back soon!</div>
        )}
      </section>
    </>
  );
}

const CSS = `
@import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,400;0,600;1,400;1,600&family=Nunito:wght@300;400;500;600;700&display=swap');

.os {
  background: #faf8f3;
  min-height: 100vh;
  font-family: 'Nunito', sans-serif;
  padding-bottom: 80px;
}

.os-hero {
  background: linear-gradient(160deg, #446c35bd 100%, #172710 0%);
  padding: 55px 20px 36px;
  text-align: center;
  position: relative;
  overflow: hidden;
}
.os-hero::after {
  content: '';
  position: absolute; inset: 0;
  background: radial-gradient(ellipse 80% 60% at 50% -10%, rgba(122,170,92,.25) 0%, transparent 60%);
  pointer-events: none;
}
.os-eyebrow {
  display: inline-block;
  font-size: 9px; font-weight: 700; letter-spacing: .44em; text-transform: uppercase;
  color: #c8992e; margin-bottom: 8px;
}
.os-title {
  font-family: 'Cormorant Garamond', serif;
  font-size: clamp(2rem, 7vw, 3rem);
  font-weight: 400; color: #fff;
  letter-spacing: -.01em; line-height: 1; margin-bottom: 8px;
}
.os-title em { font-style: italic; color: #c8992e; }
.os-sub { font-size: 12px; color: rgba(255,255,255,.5); font-weight: 400; }

.os-filters {
  display: flex; gap: 8px; overflow-x: auto; scrollbar-width: none;
  padding: 20px 16px 4px;
}
.os-filters::-webkit-scrollbar { display: none; }
.os-filter {
  flex-shrink: 0;
  padding: 8px 18px;
  font-family: 'Nunito', sans-serif;
  font-size: 10px; font-weight: 700; letter-spacing: .18em; text-transform: uppercase;
  border: 1.5px solid #d0c8b4; border-radius: 100px;
  background: #fff; color: #828278; cursor: pointer;
  transition: all .2s;
  -webkit-tap-highlight-color: transparent;
}
.os-filter.on {
  background: #253d18; border-color: #253d18; color: #fff;
}

.os-grid {
  padding: 16px 14px;
  display: grid;
  gap: 14px;
  grid-template-columns: 1fr;
}
@media (min-width: 600px) { .os-grid { grid-template-columns: repeat(2, 1fr); } }
@media (min-width: 960px) { .os-grid { grid-template-columns: repeat(3, 1fr); padding: 20px 40px; } }

.os-card {
  background: #fff;
  border: 1px solid #e8dfc8;
  border-radius: 14px;
  padding: 20px;
  position: relative;
  box-shadow: 0 2px 12px rgba(35,60,18,.07);
  transition: box-shadow .24s, transform .24s;
}
.os-card:hover { box-shadow: 0 6px 28px rgba(35,60,18,.12); transform: translateY(-2px); }

.os-new {
  position: absolute; top: 14px; right: 14px;
  font-size: 8px; font-weight: 700; letter-spacing: .2em; text-transform: uppercase;
  background: #253d18; color: #fff;
  padding: 3px 9px; border-radius: 100px;
}

.os-card-top { display: flex; gap: 14px; align-items: flex-start; margin-bottom: 14px; }
.os-discount {
  flex-shrink: 0;
  display: flex; flex-direction: column; align-items: center;
  background: linear-gradient(135deg, #253d18, #365928);
  color: #fff; border-radius: 10px;
  padding: 10px 14px; min-width: 62px;
}
.os-disc-val { font-size: 1.3rem; font-weight: 700; line-height: 1; }
.os-disc-off { font-size: 8px; font-weight: 700; letter-spacing: .16em; opacity: .7; }

.os-card-title { font-size: 13px; font-weight: 700; color: #1c1c17; margin-bottom: 4px; line-height: 1.3; }
.os-card-desc  { font-size: 11px; color: #828278; line-height: 1.5; }

.os-card-mid { display: flex; flex-wrap: wrap; gap: 6px; margin-bottom: 14px; }
.os-pill {
  font-size: 9.5px; font-weight: 600; color: #527a3e;
  background: #eff6ea; border: 1px solid #c0dd97;
  padding: 3px 10px; border-radius: 100px;
}

.os-card-bot { display: flex; align-items: center; gap: 10px; }
.os-code-box {
  display: flex; align-items: center; gap: 0; flex: 1;
  border: 1.5px dashed #c8992e; border-radius: 8px; overflow: hidden;
}
.os-code {
  flex: 1; padding: 8px 12px;
  font-size: 11px; font-weight: 700; letter-spacing: .14em;
  color: #a07820; background: #faf4e8;
}
.os-copy {
  padding: 8px 14px;
  font-size: 10px; font-weight: 700; letter-spacing: .12em; text-transform: uppercase;
  background: #253d18; color: #fff; border: none; cursor: pointer;
  transition: background .2s;
  -webkit-tap-highlight-color: transparent;
  white-space: nowrap;
}
.os-copy.done { background: #527a3e; }

.os-shop {
  flex-shrink: 0;
  font-size: 10px; font-weight: 700; letter-spacing: .14em;
  color: #253d18; text-decoration: none;
  padding: 8px 14px; border: 1.5px solid #253d18; border-radius: 8px;
  transition: background .2s, color .2s;
  -webkit-tap-highlight-color: transparent;
  white-space: nowrap;
}
.os-shop:hover { background: #253d18; color: #fff; }

.os-empty {
  text-align: center; padding: 60px 20px;
  font-size: 13px; color: #828278;
}
`;