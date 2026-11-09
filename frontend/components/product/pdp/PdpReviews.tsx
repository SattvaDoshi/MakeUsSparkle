'use client';

import { useEffect, useMemo, useState } from 'react';
import { createPortal } from 'react-dom';
import { useAuth } from '@/lib/authContext';
import { submitProductReview, type ReviewData } from '@/lib/catalogApi';
import { cdnImage } from '@/lib/cdn';
import styles from './pdp.module.css';

const stars = (n: number) => '★'.repeat(Math.round(n)) + '☆'.repeat(5 - Math.round(n));

type SubmitFn = (p: { productId: string; rating: number; body: string; images: File[] }, token: string) => Promise<{ success: boolean; message?: string; review?: ReviewData }>;

export default function PdpReviews({ productId, reviews, setReviews, submitReview }: {
  productId: string; reviews: ReviewData[]; setReviews: React.Dispatch<React.SetStateAction<ReviewData[]>>;
  /** Defaults to the product review endpoint; pass another (e.g. for combos) to post elsewhere. */
  submitReview?: SubmitFn;
}) {
  const { token } = useAuth();
  const [filter, setFilter] = useState<'all' | 'photos' | number>('all');
  const [sort, setSort] = useState<'new' | 'high' | 'low'>('new');
  const [shown, setShown] = useState(4);
  const [sheet, setSheet] = useState(false);
  const [form, setForm] = useState<{ rating: number; body: string; images: File[] }>({ rating: 5, body: '', images: [] });
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState('');
  const [photo, setPhoto] = useState<string | null>(null);

  // One preview URL per chosen file, released when the files change or the section unmounts (no leaked blobs).
  const previews = useMemo(() => form.images.map((f) => URL.createObjectURL(f)), [form.images]);
  useEffect(() => () => { previews.forEach((u) => URL.revokeObjectURL(u)); }, [previews]);

  const total = reviews.length;
  const avg = total ? reviews.reduce((a, r) => a + r.rating, 0) / total : 0;
  const dist = [5, 4, 3, 2, 1].map((n) => {
    const c = reviews.filter((r) => r.rating === n).length;
    return { n, c, pct: total ? Math.round((c / total) * 100) : 0 };
  });
  const recommend = total ? Math.round((reviews.filter((r) => r.rating >= 4).length / total) * 100) : 0;
  const allPhotos = useMemo(() => reviews.flatMap((r) => r.images || []), [reviews]);

  const list = useMemo(() => {
    let l = reviews.filter((r) => filter === 'all' ? true : filter === 'photos' ? (r.images?.length ?? 0) > 0 : r.rating === filter);
    l = [...l].sort((a, b) =>
      sort === 'high' ? b.rating - a.rating : sort === 'low' ? a.rating - b.rating
      : new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    return l;
  }, [reviews, filter, sort]);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!token) { setErr('Please sign in to write a review.'); window.dispatchEvent(new CustomEvent('makeussparkle:auth-open', { detail: { tab: 'login' } })); return; }
    setBusy(true); setErr('');
    const res = await (submitReview ?? submitProductReview)({ productId, ...form }, token);
    setBusy(false);
    if (res.success && res.review) {
      setReviews([res.review, ...reviews]); setSheet(false); setForm({ rating: 5, body: '', images: [] });
    } else setErr(res.message || 'Could not submit your review. Please try again.');
  }

  return (
    <section className={`${styles.wrap} ${styles.rev}`} id="reviews" aria-labelledby="rev-h">
      <div className={styles.shelfHead}>
        <div>
          <span className={styles.shelfEyebrow}>Customer Stories</span>
          <h2 className={styles.shelfTitle} id="rev-h">Ratings &amp; <em>Reviews</em></h2>
        </div>
        {total > 0 && <button type="button" className={styles.writeBtn} onClick={() => setSheet(true)}>Write a review</button>}
      </div>

      {total === 0 ? (
        <div className={styles.noRev}>
          <div className={styles.noRevStars} aria-hidden="true">
            {[0, 1, 2, 3, 4].map((i) => <svg key={i} width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinejoin="round"><path d="m12 3 2.7 5.8 6.3.7-4.7 4.3 1.3 6.2L12 16.9 6.4 20l1.3-6.2L3 9.5l6.3-.7z" /></svg>)}
          </div>
          <h3>No reviews yet</h3>
          <p>Be the first to share how this piece looks and feels. Your words help others choose with confidence.</p>
          <div className={styles.noRevHints}>
            <span>Quality &amp; finish</span><span>Fit &amp; comfort</span><span>Packaging</span><span>Photos help most</span>
          </div>
          <button type="button" className={styles.writeBtn} onClick={() => setSheet(true)}>Write the first review</button>
        </div>
      ) : (
        <>
      <div className={styles.revTop}>
        <div className={styles.score}>
          <div className={styles.scoreNum}>{avg.toFixed(1)}<small> / 5</small></div>
          <div className={styles.stars} aria-label={`${avg.toFixed(1)} out of 5`}>{stars(avg)}</div>
          <div className={styles.scoreSub}>Based on {total} review{total === 1 ? '' : 's'}</div>
          <div className={styles.recommend}><svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="M20 6 9 17l-5-5" /></svg>{recommend}% rate this 4★ or higher</div>
        </div>
        <div className={styles.bars}>
          {dist.map((d) => (
            <button key={d.n} type="button" className={`${styles.bar}${filter === d.n ? ` ${styles.barOn}` : ''}`}
              onClick={() => { setFilter(filter === d.n ? 'all' : d.n); setShown(4); }} aria-pressed={filter === d.n}>
              <span>{d.n} ★</span>
              <span className={styles.barTrack}><span className={styles.barFill} style={{ width: `${d.pct}%`, display: 'block' }} /></span>
              <span className={styles.barCount}>{d.c}</span>
            </button>
          ))}
        </div>
      </div>
        </>
      )}

      {allPhotos.length > 0 && (
        <div className={styles.photos}>
          <div className={styles.photosTitle}>Photos from customers</div>
          <div className={styles.photoRow}>
            {allPhotos.slice(0, 14).map((src, i) => (
              <button key={src + i} type="button" className={styles.photo} onClick={() => setPhoto(src)} aria-label="View customer photo">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={cdnImage(src, 240)} alt="" loading="lazy" />
              </button>
            ))}
          </div>
        </div>
      )}

      {total > 0 && (
        <div className={styles.tools}>
          <div className={styles.filters} role="group" aria-label="Filter reviews">
            {([['all', 'All'], ['photos', 'With photos'], [5, '5★'], [4, '4★'], [3, '3★'], [2, '2★'], [1, '1★']] as const).map(([k, label]) => (
              <button key={String(k)} type="button" className={`${styles.fchip}${filter === k ? ` ${styles.fchipOn}` : ''}`}
                onClick={() => { setFilter(k as typeof filter); setShown(4); }}>{label}</button>
            ))}
          </div>
          <select className={styles.sort} value={sort} onChange={(e) => setSort(e.target.value as typeof sort)} aria-label="Sort reviews">
            <option value="new">Newest first</option>
            <option value="high">Highest rated</option>
            <option value="low">Lowest rated</option>
          </select>
        </div>
      )}

      {total === 0 ? null : list.length === 0 ? (
        <div className={styles.empty}><h3>No reviews match</h3><button type="button" className={styles.moreBtn} onClick={() => setFilter('all')}>Show all reviews</button></div>
      ) : (
        <div className={styles.list}>
          {list.slice(0, shown).map((r, i) => {
            const nm = `${r.user?.firstName || 'Verified'} ${r.user?.lastName || 'Buyer'}`.trim();
            return (
              <article key={r._id} className={styles.card} style={{ animationDelay: `${(i % 4) * 0.06}s` }}>
                <div className={styles.cardTop}>
                  <div className={styles.avatar}>{(r.user?.firstName || 'A')[0].toUpperCase()}</div>
                  <div className={styles.who}>
                    <div className={styles.name}>{nm}
                      {r.isVerifiedPurchase && <span className={styles.verified}>
                        <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="M20 6 9 17l-5-5" /></svg>Verified buyer</span>}
                    </div>
                    <div className={styles.date}>{new Date(r.createdAt).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}</div>
                  </div>
                </div>
                <div className={styles.cardStars} aria-label={`${r.rating} out of 5`}>{stars(r.rating)}</div>
                <p className={styles.body}>{r.body}</p>
                {r.images && r.images.length > 0 && (
                  <div className={styles.cardPhotos}>
                    {r.images.map((src, k) => (
                      <button key={k} type="button" className={styles.photo} onClick={() => setPhoto(src)} aria-label="View photo">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img src={cdnImage(src, 200)} alt="" loading="lazy" />
                      </button>
                    ))}
                  </div>
                )}
              </article>
            );
          })}
        </div>
      )}
      {shown < list.length && <div className={styles.more}><button type="button" className={styles.moreBtn} onClick={() => setShown((s) => s + 4)}>Show more reviews</button></div>}

      {sheet && (
        <div className={styles.sheetBack} onClick={() => setSheet(false)}>
          <form className={styles.sheet} onClick={(e) => e.stopPropagation()} onSubmit={submit} role="dialog" aria-modal="true" aria-label="Write a review">
            <h3 className={styles.sheetTitle}>Write a review</h3>
            <p className={styles.sheetSub}>Share your experience with this piece.</p>
            {err && <div className={styles.err}>{err}</div>}
            <div className={styles.pick} role="radiogroup" aria-label="Rating">
              {[1, 2, 3, 4, 5].map((n) => (
                <button key={n} type="button" role="radio" aria-checked={form.rating === n} aria-label={`${n} star${n > 1 ? 's' : ''}`}
                  className={`${styles.pickStar}${n <= form.rating ? ` ${styles.pickOn}` : ''}`} onClick={() => setForm((f) => ({ ...f, rating: n }))}>★</button>
              ))}
            </div>
            <textarea className={styles.field} required rows={4} placeholder="What did you love? How is the quality and fit?" value={form.body}
              onChange={(e) => setForm((f) => ({ ...f, body: e.target.value }))} />
            <label className={styles.addPhoto}>
              <input type="file" accept="image/*" multiple hidden onChange={(e) => {
                const picked = Array.from(e.target.files || []);
                const ok = picked.filter((f) => /^image\/(jpeg|png|webp|avif)$/.test(f.type) && f.size <= 8 * 1024 * 1024);
                setErr(ok.length < picked.length ? 'Only JPG, PNG, WebP or AVIF photos up to 8 MB are allowed.' : '');
                setForm((f) => ({ ...f, images: [...f.images, ...ok].slice(0, 5) }));
                e.target.value = '';
              }} />
              + Add photos
            </label>
            {form.images.length > 0 && (
              <div className={styles.prevRow}>
                {form.images.map((f, i) => (
                  <div key={i} className={styles.prev}>
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={previews[i]} alt="" />
                    <button type="button" aria-label="Remove photo" onClick={() => setForm((s) => ({ ...s, images: s.images.filter((_, k) => k !== i) }))}>×</button>
                  </div>
                ))}
              </div>
            )}
            <div className={styles.sheetActions}>
              <button type="button" className={styles.btnGhost} onClick={() => setSheet(false)}>Cancel</button>
              <button type="submit" className={styles.btnPrimary} disabled={busy}>{busy ? 'Submitting…' : 'Submit'}</button>
            </div>
          </form>
        </div>
      )}

      {photo && typeof document !== 'undefined' && createPortal(
        <div className={styles.lightbox} onClick={() => setPhoto(null)} role="dialog" aria-modal="true" aria-label="Customer photo">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={cdnImage(photo, 1400)} alt="Customer photo" onClick={(e) => e.stopPropagation()} />
          <button className={`${styles.lbBtn} ${styles.lbClose}`} aria-label="Close" onClick={() => setPhoto(null)}>×</button>
        </div>
      ,
        document.body,
      )}
    </section>
  );
}
