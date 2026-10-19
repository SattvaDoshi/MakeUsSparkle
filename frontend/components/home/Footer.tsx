import Link from 'next/link';
import styles from './Footer.module.css';

const footerLinks = {
  Help: [
    { label: 'Track Order', href: '/track' },
    { label: 'Shipping Policy', href: '/shipping-policy' },
    { label: 'Returns & Exchange', href: '/refund-policy' },
    { label: 'Size Guide', href: '/size-guide' },
    { label: 'Contact Us', href: '/contact' },
  ],
  Company: [
    { label: 'Affiliate Program', href: '/affiliate' },
    { label: 'Offers & Coupons', href: '/offers' },
    { label: 'Privacy Policy', href: '/privacy' },
  ],
};

export default function Footer() {
  return (
    <footer id="footer" className={styles.footer}>

      {/* Main footer */}
      <div className={styles.main}>
        <div className={styles.brand}>
          <h2 className={styles.brandName}>MakeYou<em>Sparkle</em></h2>
          <p className={styles.brandTagline}>Where every piece tells a story</p>
        </div>

        {Object.entries(footerLinks).map(([group, links]) => (
          <div key={group} className={styles.linkGroup}>
            <h4 className={styles.groupTitle}>{group}</h4>
            <ul className={styles.linkList}>
              {links.map(l => {
                const isExternal = l.href.startsWith('http') || l.href.startsWith('mailto:');
                return (
                  <li key={l.label}>
                    {isExternal ? (
                      <a href={l.href} className={styles.link} target="_blank" rel="noopener noreferrer">
                        {l.label}
                      </a>
                    ) : (
                      <Link href={l.href} className={styles.link}>
                        {l.label}
                      </Link>
                    )}
                  </li>
                );
              })}
            </ul>
          </div>
        ))}
      </div>

      {/* Bottom bar */}
      <div className={styles.bottom}>
        <p className={styles.copyright}>© {new Date().getFullYear()} MakeUsSparkle. All rights reserved.</p>
        <div className={styles.payments}>
          {['UPI', 'Card', 'NetBanking', 'COD', 'Wallet'].map(p => (
            <span key={p} className={styles.payBadge}>{p}</span>
          ))}
        </div>
      </div>
    </footer>
  );
}