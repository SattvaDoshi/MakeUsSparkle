import styles from "./Skeletons.module.css";

const sk = (extra: string) => `${styles.sk} ${extra}`;

function Head() {
  return (
    <div className={styles.head}>
      <span className={sk(styles.eyebrow)} />
      <span className={sk(styles.title)} />
    </div>
  );
}

/** Row of product-card placeholders (New Arrivals, Open Section, ...). */
export function ProductRowSkeleton({ count = 6 }: { count?: number }) {
  return (
    <section className={styles.section} aria-hidden="true">
      <div className={styles.inner}>
        <Head />
        <div className={styles.row}>
          {Array.from({ length: count }).map((_, i) => (
            <div key={i} className={styles.card}>
              <div className={sk(styles.media)} />
              <span className={sk(styles.line)} style={{ width: "40%" }} />
              <span className={sk(styles.line)} style={{ width: "85%" }} />
              <span className={sk(styles.line)} style={{ width: "30%" }} />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

/** Two big editorial cards (banner carousel). */
export function BannerSkeleton() {
  return (
    <section className={styles.section} aria-hidden="true">
      <div className={styles.inner}>
        <div className={styles.row}>
          <div className={sk(styles.wide)} />
          <div className={sk(styles.wide)} />
        </div>
      </div>
    </section>
  );
}

/** Portrait tiles (shop by style). */
export function StyleSkeleton() {
  return (
    <section className={styles.section} aria-hidden="true">
      <div className={styles.inner}>
        <Head />
        <div className={styles.row}>
          {Array.from({ length: 4 }).map((_, i) => <div key={i} className={sk(styles.tall)} />)}
        </div>
      </div>
    </section>
  );
}

/** Full-width banner band. */
export function BandSkeleton() {
  return <div className={sk(styles.band)} aria-hidden="true" />;
}

/** Row of round style filters (listing pages). */
export function CircleRowSkeleton({ count = 7 }: { count?: number }) {
  return (
    <div className={styles.circles} aria-hidden="true">
      {Array.from({ length: count }).map((_, i) => <span key={i} className={sk(styles.circle)} />)}
    </div>
  );
}
