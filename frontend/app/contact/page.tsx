import UpperNav from '@/components/ui/UpperNav';
import Footer from '@/components/home/Footer';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Contact Us — MakeYouSparkle',
  description: 'Get in touch with the MakeYouSparkle team for order inquiries, support, or custom jewelry requests.',
};

export default function ContactPage() {
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
            We are here to help
          </p>
          <h1 style={{ fontFamily: 'var(--font-display, Georgia, serif)', fontSize: 'clamp(28px, 4vw, 42px)', fontWeight: 400, margin: '0 0 12px' }}>
            Contact Us
          </h1>
          <p style={{ maxWidth: '540px', margin: '0 auto', fontSize: '14px', lineHeight: 1.6, color: 'rgba(255,255,255,0.85)' }}>
            Have a question about an order, custom charm, or delivery? Reach out to our customer care team.
          </p>
        </section>

        {/* Contact Cards */}
        <div style={{ maxWidth: '860px', margin: '0 auto', padding: '48px 24px 72px' }}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '20px', marginBottom: '32px' }}>
            
            {/* WhatsApp */}
            <div style={{ background: '#fff', borderRadius: '12px', border: '1px solid rgba(42,42,39,0.08)', padding: '28px 24px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <div style={{ fontSize: '28px' }}>💬</div>
              <h3 style={{ fontSize: '18px', fontWeight: 600, color: '#2a4d1c', margin: 0 }}>WhatsApp Support</h3>
              <p style={{ fontSize: '13px', color: '#666', margin: 0, lineHeight: 1.5 }}>
                Fastest support for order tracking, customization requests, and questions.
              </p>
              <a
                href="https://wa.me/918356939586"
                target="_blank"
                rel="noopener noreferrer"
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '8px',
                  background: '#25D366',
                  color: '#fff',
                  fontWeight: 600,
                  fontSize: '14px',
                  padding: '10px 16px',
                  borderRadius: '6px',
                  textDecoration: 'none',
                  marginTop: 'auto',
                  width: 'fit-content',
                }}
              >
                Chat on WhatsApp (+91 8356939586)
              </a>
            </div>

            {/* Email */}
            <div style={{ background: '#fff', borderRadius: '12px', border: '1px solid rgba(42,42,39,0.08)', padding: '28px 24px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <div style={{ fontSize: '28px' }}>✉️</div>
              <h3 style={{ fontSize: '18px', fontWeight: 600, color: '#2a4d1c', margin: 0 }}>Email Us</h3>
              <p style={{ fontSize: '13px', color: '#666', margin: 0, lineHeight: 1.5 }}>
                Send us detailed queries, partnership requests, or exchange videos.
              </p>
              <a
                href="mailto:makeyousparkle5@gmail.com"
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '8px',
                  background: '#2a4d1c',
                  color: '#fff',
                  fontWeight: 600,
                  fontSize: '14px',
                  padding: '10px 16px',
                  borderRadius: '6px',
                  textDecoration: 'none',
                  marginTop: 'auto',
                  width: 'fit-content',
                }}
              >
                makeyousparkle5@gmail.com
              </a>
            </div>

            {/* Hours */}
            <div style={{ background: '#fff', borderRadius: '12px', border: '1px solid rgba(42,42,39,0.08)', padding: '28px 24px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <div style={{ fontSize: '28px' }}>⏱️</div>
              <h3 style={{ fontSize: '18px', fontWeight: 600, color: '#2a4d1c', margin: 0 }}>Operating Hours</h3>
              <p style={{ fontSize: '13px', color: '#666', margin: 0, lineHeight: 1.5 }}>
                Monday to Saturday<br />
                <strong>10:00 AM – 7:00 PM IST</strong>
              </p>
              <p style={{ fontSize: '12px', color: '#888', margin: 0 }}>
                We typically respond within 2 to 4 hours during business hours.
              </p>
            </div>

          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}
