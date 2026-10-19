import UpperNav from '@/components/ui/UpperNav';
import Footer from '@/components/home/Footer';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Privacy Policy — MakeYouSparkle',
  description: 'Learn how MakeYouSparkle collects, protects, and uses your personal information.',
};

export default function PrivacyPolicyPage() {
  return (
    <>
      <UpperNav />
      <main style={{ minHeight: '80vh', background: '#faf9f5', color: '#1a1f0d', fontFamily: "'Jost', sans-serif" }}>
        {/* Hero */}
        <section
          style={{
            background: 'linear-gradient(135deg, #709860 0%, #3d6b29 100%)',
            padding: '56px 24px 44px',
            textAlign: 'center',
            color: '#fff',
          }}
        >
          <p style={{ fontSize: '11px', letterSpacing: '0.4em', textTransform: 'uppercase', color: 'rgba(255,255,255,0.9)', marginBottom: '10px' }}>
            Legal &amp; Trust
          </p>
          <h1 style={{ fontFamily: 'var(--font-display, Georgia, serif)', fontSize: 'clamp(28px, 4vw, 42px)', fontWeight: 400, margin: '0 0 12px' }}>
            Privacy Policy
          </h1>
          <p style={{ maxWidth: '600px', margin: '0 auto', fontSize: '14px', lineHeight: 1.6, color: 'rgba(255,255,255,0.85)' }}>
            Your privacy and trust are our top priorities. Here is how we collect, safeguard, and use your personal data.
          </p>
        </section>

        {/* Content */}
        <div style={{ maxWidth: '860px', margin: '0 auto', padding: '48px 24px 72px' }}>
          <div style={{ background: '#fff', borderRadius: '14px', border: '1px solid rgba(42, 42, 39, 0.08)', padding: 'clamp(24px, 4vw, 40px)', display: 'flex', flexDirection: 'column', gap: '32px' }}>
            
            <section>
              <h2 style={{ fontSize: '18px', fontWeight: 600, color: '#2a4d1c', marginBottom: '12px' }}>
                1. Information We Collect
              </h2>
              <p style={{ fontSize: '14px', lineHeight: 1.8, color: '#444' }}>
                When you visit or place an order with MakeYouSparkle, we collect essential details such as your name, contact phone number, shipping address, email address, and order history to fulfill your purchases and provide support.
              </p>
            </section>

            <section>
              <h2 style={{ fontSize: '18px', fontWeight: 600, color: '#2a4d1c', marginBottom: '12px' }}>
                2. Payment Security
              </h2>
              <p style={{ fontSize: '14px', lineHeight: 1.8, color: '#444' }}>
                All online transactions are processed securely through certified payment gateway partners (such as Cashfree / Razorpay / UPI). MakeYouSparkle does not store your credit card, debit card, or net banking credentials on our servers.
              </p>
            </section>

            <section>
              <h2 style={{ fontSize: '18px', fontWeight: 600, color: '#2a4d1c', marginBottom: '12px' }}>
                3. How We Use Your Information
              </h2>
              <ul style={{ fontSize: '14px', lineHeight: 1.8, color: '#444', paddingLeft: '20px', margin: 0 }}>
                <li>To pack, fulfill, and ship your jewelry orders with courier partners.</li>
                <li>To send tracking links, delivery SMS/WhatsApp alerts, and order confirmations.</li>
                <li>To handle customer service, modifications, or exchange queries.</li>
                <li>To prevent fraud and maintain the security of our store.</li>
              </ul>
            </section>

            <section>
              <h2 style={{ fontSize: '18px', fontWeight: 600, color: '#2a4d1c', marginBottom: '12px' }}>
                4. Cookies &amp; Analytics
              </h2>
              <p style={{ fontSize: '14px', lineHeight: 1.8, color: '#444' }}>
                We use cookies and local storage to remember your shopping cart items, session preferences, and understand website traffic patterns to improve your browsing experience.
              </p>
            </section>

            <section>
              <h2 style={{ fontSize: '18px', fontWeight: 600, color: '#2a4d1c', marginBottom: '12px' }}>
                5. Third-Party Sharing
              </h2>
              <p style={{ fontSize: '14px', lineHeight: 1.8, color: '#444' }}>
                We never sell or rent your personal information to third parties. Data is shared strictly with authorized partners required for business operations (such as logistics carriers like Delhivery / Shiprocket and payment gateways).
              </p>
            </section>

            <section>
              <h2 style={{ fontSize: '18px', fontWeight: 600, color: '#2a4d1c', marginBottom: '12px' }}>
                6. Contact Our Grievance Officer
              </h2>
              <p style={{ fontSize: '14px', lineHeight: 1.8, color: '#444' }}>
                If you have questions, corrections, or concerns regarding your personal data, reach out to us at:
              </p>
              <div style={{ marginTop: '12px', padding: '16px', background: '#f5f8f2', borderRadius: '8px', fontSize: '14px', color: '#1e2a14' }}>
                <p style={{ margin: '0 0 6px' }}><strong>Email:</strong> makeyousparkle5@gmail.com</p>
                <p style={{ margin: 0 }}><strong>WhatsApp:</strong> +91 8356939586</p>
              </div>
            </section>

            <div style={{ borderTop: '1px solid #eaeaea', paddingTop: '16px', fontSize: '12px', color: '#888' }}>
              Last updated: October 2026. MakeYouSparkle is committed to complying with applicable data privacy regulations.
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}
