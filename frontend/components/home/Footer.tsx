import Link from 'next/link';
import styles from './Footer.module.css';

const WHATSAPP = '918356939586';
const EMAIL = 'makeyousparkle5@gmail.com';

const footerLinks = {
  Shop: [
    { label: 'All Categories', href: '/categories' },
    { label: 'Shop by Style', href: '/styles' },
    { label: 'Gift Combos', href: '/combos' },
    { label: 'Offers & Coupons', href: '/offers' },
  ],
  Help: [
    { label: 'Track Order', href: '/profile' },
    { label: 'Shipping Policy', href: '/shipping-policy' },
    { label: 'Returns & Exchange', href: '/refund-policy' },
    { label: 'Size Guide', href: '/size-guide' },
    { label: 'Contact Us', href: '/contact' },
  ],
  Company: [
    { label: 'Affiliate Program', href: '/affiliate' },
    { label: 'Privacy Policy', href: '/privacy' },
  ],
};

const perks = [
  { title: 'Free shipping', text: 'On orders above ₹999', icon: <><rect x="1" y="6" width="15" height="11" rx="1" /><path d="M16 9h4l3 3v5h-7" /><circle cx="6" cy="18" r="2" /><circle cx="18" cy="18" r="2" /></> },
  { title: 'Easy exchange', text: 'Hassle-free, via WhatsApp', icon: <><path d="M3 12a9 9 0 0 1 15-6.7L21 8" /><path d="M21 3v5h-5" /><path d="M21 12a9 9 0 0 1-15 6.7L3 16" /><path d="M3 21v-5h5" /></> },
  { title: 'Secure payments', text: 'UPI, cards & COD', icon: <><rect x="3" y="11" width="18" height="11" rx="2" /><path d="M7 11V7a5 5 0 0 1 10 0v4" /></> },
  { title: 'Made to personalise', text: 'Custom charm jewellery', icon: <><path d="M12 2l2.4 6.9H22l-6 4.5 2.3 7.1L12 16l-6.3 4.5L8 13.4 2 8.9h7.6z" /></> },
];

export default function Footer() {
  return (
    <footer id="footer" className={styles.footer}>
      {/* Reassurance strip */}
      <div className={styles.perks}>
        <ul className={styles.perkList}>
          {perks.map((p) => (
            <li key={p.title} className={styles.perk}>
              <svg className={styles.perkIcon} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">{p.icon}</svg>
              <span className={styles.perkText}>
                <strong>{p.title}</strong>
                <span>{p.text}</span>
              </span>
            </li>
          ))}
        </ul>
      </div>

      {/* Main footer */}
      <div className={styles.main}>
        <div className={styles.brand}>
          <h2 className={styles.brandName}>MakeYou<em>Sparkle</em></h2>
          <p className={styles.brandTagline}>Where every piece tells a story</p>
          <p className={styles.brandText}>Handcrafted jewellery, gifts and custom charms — made to be worn every day and remembered forever.</p>
          <div className={styles.contact}>
            <a className={`${styles.contactBtn} ${styles.contactWa}`} href={`https://wa.me/${WHATSAPP}`} target="_blank" rel="noopener noreferrer">
              <svg viewBox="0 0 32 32" fill="currentColor" aria-hidden="true"><path d="M16.04 3C9.4 3 4 8.4 4 15.04c0 2.12.55 4.18 1.6 6L4 29l8.14-1.56a12 12 0 0 0 3.9.65h.01C22.68 28.1 28 22.7 28 16.06 28 9.4 22.68 3 16.04 3Zm5.47 14.43c-.3-.15-1.77-.87-2.04-.97-.28-.1-.48-.15-.67.15-.2.3-.77.97-.94 1.17-.17.2-.35.22-.65.07-.3-.15-1.27-.47-2.42-1.49-.9-.8-1.5-1.78-1.67-2.08-.17-.3-.02-.46.13-.61.14-.13.3-.35.45-.52.15-.18.2-.3.3-.5.1-.2.05-.37-.03-.52-.07-.15-.67-1.62-.92-2.22-.24-.58-.49-.5-.67-.51h-.57c-.2 0-.52.07-.8.37-.27.3-1.04 1.02-1.04 2.49 0 1.47 1.07 2.89 1.22 3.09.15.2 2.1 3.2 5.08 4.49.71.3 1.26.49 1.7.63.71.23 1.36.2 1.87.12.57-.08 1.77-.72 2.02-1.42.25-.7.25-1.3.17-1.42-.07-.12-.27-.2-.57-.35Z" /></svg>
              Chat on WhatsApp
            </a>
            <a className={styles.contactBtn} href={`mailto:${EMAIL}`}>
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><rect x="3" y="5" width="18" height="14" rx="2" /><path d="M3 7l9 6 9-6" /></svg>
              Email us
            </a>
          </div>
        </div>

        {Object.entries(footerLinks).map(([group, links]) => (
          <nav key={group} className={styles.linkGroup} aria-label={group}>
            <h3 className={styles.groupTitle}>{group}</h3>
            <ul className={styles.linkList}>
              {links.map((l) => (
                <li key={l.label}>
                  <Link href={l.href} className={styles.link}>{l.label}</Link>
                </li>
              ))}
            </ul>
          </nav>
        ))}
      </div>

      {/* Bottom bar */}
      <div className={styles.bottom}>
        <p className={styles.copyright}>© {new Date().getFullYear()} MakeUsSparkle. All rights reserved.</p>
        <div className={styles.payments} aria-label="Accepted payments">
          {['UPI', 'Card', 'NetBanking', 'COD', 'Wallet'].map((p) => (
            <span key={p} className={styles.payBadge}>{p}</span>
          ))}
        </div>
      </div>
    </footer>
  );
}
