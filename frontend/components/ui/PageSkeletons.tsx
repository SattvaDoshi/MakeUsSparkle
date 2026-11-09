import s from './PageSkeletons.module.css';

const B = ({ className = '', style }: { className?: string; style?: React.CSSProperties }) => (
  <span className={`${s.sk} ${className}`} style={style} />
);

/** Product / combo / charm detail page: breadcrumb, image grid, title, price, options, CTA, accordions. */
export function PdpSkeleton({ withBar = false }: { withBar?: boolean }) {
  return (
    <div className={s.page} aria-busy="true" aria-label="Loading product" role="status">
      {withBar && <div className={s.bar} />}
      <div className={s.wrap}>
        <B className={s.crumb} />
        <div className={s.pdp}>
          <div className={s.gal}>
            <B className={s.galTile} />
            <B className={`${s.galTile} ${s.galMore}`} />
            <B className={`${s.galTile} ${s.galMore}`} />
            <B className={`${s.galTile} ${s.galMore}`} />
          </div>
          <div className={s.info}>
            <B className={`${s.line} `} style={{ width: 120 }} />
            <B className={s.h1} />
            <B className={s.price} />
            <B className={s.line} style={{ width: '92%' }} />
            <B className={s.line} style={{ width: '70%' }} />
            <B className={s.line} style={{ width: 90, marginTop: 8 }} />
            <div className={s.chips}>{[0, 1, 2, 3].map((i) => <B key={i} className={s.chip} />)}</div>
            <B className={s.line} style={{ width: 70, marginTop: 8 }} />
            <div className={s.chips}>{[0, 1, 2, 3].map((i) => <B key={i} className={s.pill} />)}</div>
            <div className={s.cta}><B className={s.ctaQty} /><B className={s.ctaBtn} /></div>
            <B className={s.acc} style={{ marginTop: 12 }} />
            <B className={s.acc} />
            <B className={s.acc} />
          </div>
        </div>
      </div>
    </div>
  );
}

/** Cart page: title, a few item cards and the order summary. */
export function CartSkeleton({ items = 2 }: { items?: number }) {
  return (
    <div className={s.page} aria-busy="true" aria-label="Loading your cart" role="status">
      <div className={s.bar} />
      <div className={s.wrap}>
        <B className={s.title} />
        <div className={s.cols}>
          <div className={s.stack}>
            <B style={{ height: 56, borderRadius: 14 }} />
            {Array.from({ length: items }).map((_, i) => (
              <div key={i} className={s.item}>
                <B className={s.itemImg} />
                <div className={s.itemBody}>
                  <B className={s.line} style={{ width: '70%', height: 18 }} />
                  <B className={s.line} style={{ width: '40%' }} />
                  <div className={s.row}><B className={s.pill} style={{ width: 110 }} /><B className={s.line} style={{ width: 70, height: 20 }} /></div>
                </div>
              </div>
            ))}
          </div>
          <div className={s.card}>
            <B className={s.line} style={{ width: 140, height: 20 }} />
            <B className={s.field} />
            {[0, 1, 2].map((i) => <div key={i} className={s.row}><B className={s.line} style={{ width: 110 }} /><B className={s.line} style={{ width: 60 }} /></div>)}
            <B className={s.btn} />
          </div>
        </div>
      </div>
    </div>
  );
}

/** Checkout: stepper, address + delivery panels, order summary. */
export function CheckoutSkeleton() {
  return (
    <div className={s.page} aria-busy="true" aria-label="Loading checkout" role="status">
      <div className={s.bar} />
      <div className={s.wrap}>
        <div className={s.steps}><B className={s.step} /><B className={s.step} /><B className={s.step} /></div>
        <div className={s.cols}>
          <div className={s.stack}>
            <B className={s.title} style={{ marginBottom: 0 }} />
            <div className={s.card}>
              <B style={{ height: 92, borderRadius: 14 }} />
              <B className={s.field} />
              <div className={s.grid2}><B className={s.field} /><B className={s.field} /></div>
            </div>
            <B className={s.title} style={{ marginBottom: 0, marginTop: 12 }} />
            <div className={s.card}><div className={s.grid2}><B style={{ height: 110, borderRadius: 14 }} /><B style={{ height: 110, borderRadius: 14 }} /></div></div>
          </div>
          <div className={s.card}>
            <B className={s.line} style={{ width: 140, height: 20 }} />
            {[0, 1].map((i) => <div key={i} className={s.row}><B style={{ width: 48, height: 60, borderRadius: 10 }} /><B className={s.line} style={{ width: 60 }} /></div>)}
            {[0, 1, 2].map((i) => <div key={i} className={s.row}><B className={s.line} style={{ width: 110 }} /><B className={s.line} style={{ width: 60 }} /></div>)}
            <B className={s.btn} />
          </div>
        </div>
      </div>
    </div>
  );
}

/** Any listing / grid page (wishlist, categories, offers, styles). */
export function GridPageSkeleton({ count = 8 }: { count?: number }) {
  return (
    <div className={s.page} aria-busy="true" aria-label="Loading" role="status">
      <div className={s.wrap}>
        <B className={s.crumb} />
        <B className={s.title} style={{ width: 300, height: 40 }} />
        <div className={s.grid}>
          {Array.from({ length: count }).map((_, i) => (
            <div key={i} className={s.gcard}>
              <B className={s.gimg} />
              <B className={s.line} style={{ width: '80%' }} />
              <B className={s.line} style={{ width: '40%' }} />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

/** Form / account style page (profile, forms). */
export function PanelPageSkeleton() {
  return (
    <div className={s.page} aria-busy="true" aria-label="Loading" role="status">
      <div className={s.wrap} style={{ maxWidth: 880 }}>
        <B className={s.title} style={{ width: 260, height: 38 }} />
        <div className={s.stack}>
          {[0, 1, 2].map((i) => (
            <div key={i} className={s.card}>
              <B className={s.line} style={{ width: 160, height: 18 }} />
              <div className={s.grid2}><B className={s.field} /><B className={s.field} /></div>
              <B className={s.field} />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
