import Link from 'next/link';
import styles from './Footer.module.css';

const footerLinks = {
  Shop: [
    { label: 'New Arrivals', href: '/new-arrivals' },
    { label: 'Women\'s Jewellery', href: '/categories/women/jewellery' },
    { label: 'Men\'s Jewellery', href: '/categories/men/jewellery' },
    { label: 'Gift Boxes', href: '/categories/women/gift-boxes' },
    { label: 'Curated Combos', href: '/categories/women/curated-combos' },
    { label: 'Custom Charm', href: '/categories/women/custom-charm' },
  ],
  Help: [
    { label: 'Track Order', href: '/track' },
    { label: 'Shipping Policy', href: '/shipping' },
    { label: 'Returns & Exchange', href: '/returns' },
    { label: 'Size Guide', href: '/size-guide' },
    { label: 'FAQs', href: '/faq' },
    { label: 'Contact Us', href: '/contact' },
  ],
  Company: [
    { label: 'About Us', href: '/about' },
    { label: 'Affiliate Program', href: 'https://saltyfam.bixgrow.com' },
    { label: 'Offers & Coupons', href: '/offers' },
    { label: 'Privacy Policy', href: '/privacy' },
    { label: 'Terms of Service', href: '/terms' },
  ],
};

export default function Footer() {
  return (
    <footer className={styles.footer}>
      {/* Newsletter strip */}
      <div className={styles.newsletter}>
        <div className={styles.newsletterInner}>
          <div>
            <h3 className={styles.newsletterTitle}>Stay in the loop</h3>
            <p className={styles.newsletterSub}>New arrivals, exclusive offers & stories — delivered to you.</p>
          </div>
          <div className={styles.newsletterForm}>
            <input
              type="email"
              placeholder="Your email address"
              className={styles.newsletterInput}
            />
            <button className={styles.newsletterBtn}>Subscribe</button>
          </div>
        </div>
      </div>

      {/* Main footer */}
      <div className={styles.main}>
        <div className={styles.brand}>
          <h2 className={styles.brandName}>MakeUs<em>Sparkle</em></h2>
          <p className={styles.brandTagline}>Where every piece tells a story</p>
          <div className={styles.social}>
            {['Instagram', 'WhatsApp', 'Pinterest', 'YouTube'].map(s => (
              <a key={s} href="#" className={styles.socialLink} aria-label={s}>
                {s[0]}
              </a>
            ))}
          </div>
          <div className={styles.certBadges}>
            <span className={styles.cert}>✦ Authentic Jewellery</span>
            <span className={styles.cert}>✦ Secure Payments</span>
          </div>
        </div>

        {Object.entries(footerLinks).map(([group, links]) => (
          <div key={group} className={styles.linkGroup}>
            <h4 className={styles.groupTitle}>{group}</h4>
            <ul className={styles.linkList}>
              {links.map(l => (
                <li key={l.label}>
                  <Link href={l.href} className={styles.link}>{l.label}</Link>
                </li>
              ))}
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