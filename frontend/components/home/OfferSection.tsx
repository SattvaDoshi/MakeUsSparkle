'use client';

import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { apiRequest, getApiUrl } from '@/lib/api';
import { cdnImage } from '@/lib/cdn';
import styles from './OfferSection.module.css';

interface Offer {
  id: string;
  code: string;
  title: string;
  description: string;
  discount: string;
  discountType: 'percent' | 'flat' | 'free_shipping' | 'buy_x_for_y' | 'bogo';
  buyQuantity?: number;
  getQuantity?: number;
  minOrder: number;
  expiry: string;
  category: 'jewellery' | 'combo' | 'all' | 'gift';
  isNew?: boolean;
  imageSrc: string;
  isCoupon?: boolean;
}

type ApiOffer = {
  _id: string;
  code: string;
  name: string;
  description?: string;
  discountType: 'percentage' | 'fixed' | 'free_shipping';
  discountValue: number;
  minOrderValue?: number;
  expiryDate?: string;
  offerCategory?: 'jewellery' | 'combo' | 'gift' | 'all';
  image?: string;
  isFeatured?: boolean;
  createdAt?: string;
  title?: string;
  offerType?: 'bogo' | 'percentage' | 'fixed' | 'buy_x_for_y' | 'free_shipping';
  buyQuantity?: number;
  getQuantity?: number;
};

type PublicOffersResponse = {
  success: boolean;
  offers: ApiOffer[];
};


const isNotExpired = (offer: ApiOffer): boolean => {
  return true;
};

const mapApiOffer = (offer: ApiOffer, isCoupon: boolean): Offer => {
  const parsedExpiry = offer.expiryDate ? new Date(offer.expiryDate) : null;
  const expiryText =
    parsedExpiry && !Number.isNaN(parsedExpiry.getTime())
      ? parsedExpiry.toLocaleDateString('en-IN', {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
      })
      : 'No expiry';

  const category =
    offer.offerCategory === 'jewellery' ||
      offer.offerCategory === 'combo' ||
      offer.offerCategory === 'gift' ||
      offer.offerCategory === 'all'
      ? offer.offerCategory
      : 'all';

  const createdAt = offer.createdAt ? new Date(offer.createdAt) : null;
  const isRecent =
    createdAt && !Number.isNaN(createdAt.getTime())
      ? (Date.now() - createdAt.getTime()) / (1000 * 60 * 60 * 24) <= 10
      : false;

  let type: Offer['discountType'] = 'percent';
  if (offer.discountType === 'free_shipping' || offer.offerType === 'free_shipping') type = 'free_shipping';
  else if (offer.discountType === 'fixed' || offer.offerType === 'fixed') type = 'flat';
  else if (offer.offerType === 'buy_x_for_y') type = 'buy_x_for_y';
  else if (offer.offerType === 'bogo') type = 'bogo';

  return {
    id: offer._id,
    code: offer.code || (isCoupon ? 'SPECIAL' : 'AUTOMATIC'),
    title: offer.title || offer.name || (isCoupon ? 'Promo Coupon' : 'Special Offer'),
    description: offer.description || (offer.offerType === 'buy_x_for_y' ? `Buy ${offer.buyQuantity} for ₹${offer.discountValue}` : 'Limited period offer'),
    discount: String(offer.discountValue ?? 0),
    discountType: type,
    buyQuantity: offer.buyQuantity,
    getQuantity: offer.getQuantity,
    minOrder: Number(offer.minOrderValue || 0),
    expiry: expiryText,
    category,
    isNew: Boolean(offer.isFeatured || isRecent),
    imageSrc: offer.image || '/images/hero.png',
    isCoupon,
  };
};

const FILTERS = ['All', 'Jewellery', 'Combos', 'Gift', 'Sitewide'] as const;
type Filter = (typeof FILTERS)[number];

const categoryMap: Record<Filter, Offer['category'] | 'all-filter'> = {
  All: 'all-filter',
  Jewellery: 'jewellery',
  Combos: 'combo',
  Gift: 'gift',
  Sitewide: 'all',
};

/** Big headline for a card: "20% OFF", "₹100 OFF", "Buy 2 for ₹999", ... */
function discountLabel(o: Offer): { big: string; small: string } {
  switch (o.discountType) {
    case 'percent': return { big: `${o.discount}%`, small: 'OFF' };
    case 'flat': return { big: `₹${o.discount}`, small: 'OFF' };
    case 'free_shipping': return { big: 'FREE', small: 'SHIPPING' };
    case 'buy_x_for_y': return { big: `${o.buyQuantity ?? ''} for`, small: `₹${o.discount}` };
    case 'bogo': return { big: `Buy ${o.buyQuantity ?? 1}`, small: `Get ${o.getQuantity ?? 1} free` };
  }
}

const Check = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><polyline points="20 6 9 17 4 12" /></svg>
);
const Arrow = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M5 12h14M12 5l7 7-7 7" /></svg>
);

function Meta({ offer }: { offer: Offer }) {
  return (
    <div className={styles.metaRow}>
      {offer.minOrder > 0 && <span className={styles.metaPill}>Min ₹{offer.minOrder}</span>}
      <span className={styles.metaPill}>{offer.expiry === 'No expiry' ? 'No expiry' : `Valid till ${offer.expiry}`}</span>
    </div>
  );
}

export default function OffersSection() {
  const [activeFilter, setActiveFilter] = useState<Filter>('All');
  const [copied, setCopied] = useState<string | null>(null);
  const [offers, setOffers] = useState<Offer[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'coupons' | 'offers'>('offers');

  useEffect(() => {
    let ignore = false;
    (async () => {
      try {
        const fetchEndpoint = async (path: string): Promise<ApiOffer[]> => {
          try {
            const data = await apiRequest<{ success: boolean; offers?: ApiOffer[] }>(path);
            if (Array.isArray(data?.offers)) return data.offers;
            if (Array.isArray(data)) return data as any;
          } catch {
            try {
              const res = await fetch(getApiUrl(path));
              if (res.ok) {
                const data = await res.json();
                if (Array.isArray(data?.offers)) return data.offers;
                if (Array.isArray(data)) return data;
              }
            } catch {}
          }
          return [];
        };

        const [rawCoupons, rawStore] = await Promise.all([
          fetchEndpoint('/coupons/offers'),
          fetchEndpoint('/offers/public'),
        ]);

        const coupons = rawCoupons.filter(isNotExpired).map((o) => mapApiOffer(o, true));
        const store = rawStore.filter(isNotExpired).map((o) => mapApiOffer(o, false));
        if (!ignore) setOffers([...store, ...coupons]);
      } finally {
        if (!ignore) setLoading(false);
      }
    })();
    return () => { ignore = true; };
  }, []);

  const categoryOffers = useMemo(
    () => (activeFilter === 'All' ? offers : offers.filter((o) => o.category === categoryMap[activeFilter] || o.category === 'all')),
    [activeFilter, offers],
  );
  const couponCount = useMemo(() => categoryOffers.filter((o) => o.isCoupon).length, [categoryOffers]);
  const offerCount = useMemo(() => categoryOffers.filter((o) => !o.isCoupon).length, [categoryOffers]);
  const filtered = useMemo(() => categoryOffers.filter((o) => !!o.isCoupon === (activeTab === 'coupons')), [categoryOffers, activeTab]);

  const copyCode = (code: string) => {
    navigator.clipboard?.writeText(code).catch(() => {});
    setCopied(code);
    setTimeout(() => setCopied(null), 2000);
  };

  return (
    <section className={styles.page}>
      <div className={`${styles.inner} ${styles.hero}`}>
        <span className={styles.eyebrow}>Exclusive deals</span>
        <h1 className={styles.title}>Offers &amp; <em>Coupons</em></h1>
        <p className={styles.sub}>Offers apply automatically in your cart. Coupons are codes you enter at checkout.</p>
      </div>

      {/* Toolbar: type toggle + category chips */}
      <div className={styles.toolbarWrap}>
        <div className={`${styles.inner} ${styles.toolbar}`}>
          <div className={styles.toggle} role="tablist" aria-label="Offer type">
            <button type="button" role="tab" aria-selected={activeTab === 'offers'} className={`${styles.toggleBtn}${activeTab === 'offers' ? ` ${styles.toggleOn}` : ''}`} onClick={() => setActiveTab('offers')}>
              Store offers <span className={styles.count}>{offerCount}</span>
            </button>
            <button type="button" role="tab" aria-selected={activeTab === 'coupons'} className={`${styles.toggleBtn}${activeTab === 'coupons' ? ` ${styles.toggleOn}` : ''}`} onClick={() => setActiveTab('coupons')}>
              Coupons <span className={styles.count}>{couponCount}</span>
            </button>
          </div>
          <div className={styles.chips} role="group" aria-label="Category">
            {FILTERS.map((f) => (
              <button key={f} type="button" aria-pressed={activeFilter === f} className={`${styles.chip}${activeFilter === f ? ` ${styles.chipOn}` : ''}`} onClick={() => setActiveFilter(f)}>
                {f}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className={styles.inner}>
        <div key={activeTab + activeFilter} className={styles.grid}>
          {loading ? (
            Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className={styles.skel} aria-hidden="true">
                <div className={`${styles.shimmer} ${styles.skelImg}`} />
                <div className={`${styles.shimmer} ${styles.skelLine}`} style={{ width: '70%' }} />
                <div className={`${styles.shimmer} ${styles.skelLine}`} style={{ width: '90%' }} />
              </div>
            ))
          ) : (
            filtered.map((offer, i) => {
              const d = discountLabel(offer);
              const media = (
                <div className={styles.media}>
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={cdnImage(offer.imageSrc, 720)} alt="" loading={i < 3 ? 'eager' : 'lazy'} />
                  <span className={styles.badge}><b>{d.big}</b> {d.small}</span>
                  {offer.isNew && <span className={styles.new}>New</span>}
                </div>
              );
              return offer.isCoupon ? (
                <article key={offer.id} className={styles.card} style={{ animationDelay: `${Math.min(i * 0.05, 0.4)}s` }}>
                  {media}
                  <div className={styles.body}>
                    <h2 className={styles.cardTitle}>{offer.title}</h2>
                    {offer.description && <p className={styles.desc}>{offer.description}</p>}
                    <Meta offer={offer} />
                    <div className={styles.codeRow}>
                      <span className={styles.code}>{offer.code}</span>
                      <button type="button" className={`${styles.copy}${copied === offer.code ? ` ${styles.copied}` : ''}`} onClick={() => copyCode(offer.code)} aria-label={`Copy coupon code ${offer.code}`}>
                        {copied === offer.code ? <><Check /> Copied</> : 'Copy code'}
                      </button>
                    </div>
                  </div>
                </article>
              ) : (
                <Link key={offer.id} href={`/offers/${offer.id}`} className={`${styles.card} ${styles.cardLink}`} style={{ animationDelay: `${Math.min(i * 0.05, 0.4)}s` }} aria-label={`View offer: ${offer.title}`}>
                  {media}
                  <div className={styles.body}>
                    <h2 className={styles.cardTitle}>{offer.title}</h2>
                    {offer.description && <p className={styles.desc}>{offer.description}</p>}
                    <Meta offer={offer} />
                    <div className={styles.footRow}>
                      <span className={styles.auto}><i /> Auto-applied</span>
                      <span className={styles.view}>View offer <Arrow /></span>
                    </div>
                  </div>
                </Link>
              );
            })
          )}
        </div>

        {!loading && filtered.length === 0 && (
          <div className={styles.empty}>
            <h2>Nothing here right now</h2>
            <p>No active {activeTab === 'coupons' ? 'coupons' : 'offers'}{activeFilter !== 'All' ? ` in ${activeFilter}` : ''} at the moment.{' '}
              {activeFilter !== 'All' ? 'Try another category, or ' : ''}check back soon!</p>
            {activeFilter !== 'All' && <button type="button" className={styles.emptyBtn} onClick={() => setActiveFilter('All')}>Show all</button>}
          </div>
        )}

        {/* How it works */}
        <ol className={styles.steps}>
          <li><span className={styles.stepNo}>1</span><div><strong>Add your favourites</strong><span>Fill your cart with pieces you love.</span></div></li>
          <li><span className={styles.stepNo}>2</span><div><strong>Offers apply automatically</strong><span>Store offers show up in your cart — no code needed.</span></div></li>
          <li><span className={styles.stepNo}>3</span><div><strong>Got a coupon?</strong><span>Copy the code and enter it at checkout.</span></div></li>
        </ol>
      </div>
    </section>
  );
}
