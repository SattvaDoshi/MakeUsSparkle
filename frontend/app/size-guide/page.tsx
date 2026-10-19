import UpperNav from '@/components/ui/UpperNav';
import Footer from '@/components/home/Footer';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Size Guide — MakeYouSparkle',
  description: 'Find your perfect jewelry fit with MakeYouSparkle ring, necklace, and bracelet size guides.',
};

export default function SizeGuidePage() {
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
            Perfect Fit Guarantee
          </p>
          <h1 style={{ fontFamily: 'var(--font-display, Georgia, serif)', fontSize: 'clamp(28px, 4vw, 42px)', fontWeight: 400, margin: '0 0 12px' }}>
            Jewellery Size Guide
          </h1>
          <p style={{ maxWidth: '540px', margin: '0 auto', fontSize: '14px', lineHeight: 1.6, color: 'rgba(255,255,255,0.85)' }}>
            Find the right measurements for rings, necklaces, and bracelets before ordering.
          </p>
        </section>

        {/* Content */}
        <div style={{ maxWidth: '860px', margin: '0 auto', padding: '48px 24px 72px' }}>
          <div style={{ background: '#fff', borderRadius: '14px', border: '1px solid rgba(42,42,39,0.08)', padding: 'clamp(24px, 4vw, 40px)', display: 'flex', flexDirection: 'column', gap: '36px' }}>
            
            {/* Rings */}
            <section>
              <h2 style={{ fontSize: '18px', fontWeight: 600, color: '#2a4d1c', marginBottom: '8px' }}>
                💍 Ring Sizing
              </h2>
              <p style={{ fontSize: '14px', color: '#555', lineHeight: 1.6 }}>
                Most of our rings are <strong>adjustable</strong> to comfortably fit Indian standard sizes 10 through 18. For non-adjustable rings, measure the internal diameter of a ring that fits you:
              </p>
              <div style={{ overflowX: 'auto', marginTop: '12px' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px', textAlign: 'left' }}>
                  <thead>
                    <tr style={{ background: '#f5f8f2', borderBottom: '2px solid #dcebd3' }}>
                      <th style={{ padding: '10px' }}>Indian Size</th>
                      <th style={{ padding: '10px' }}>Diameter (mm)</th>
                      <th style={{ padding: '10px' }}>Circumference (mm)</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr style={{ borderBottom: '1px solid #eee' }}><td style={{ padding: '10px' }}>12</td><td style={{ padding: '10px' }}>16.5 mm</td><td style={{ padding: '10px' }}>51.8 mm</td></tr>
                    <tr style={{ borderBottom: '1px solid #eee' }}><td style={{ padding: '10px' }}>14</td><td style={{ padding: '10px' }}>17.2 mm</td><td style={{ padding: '10px' }}>54.0 mm</td></tr>
                    <tr style={{ borderBottom: '1px solid #eee' }}><td style={{ padding: '10px' }}>16</td><td style={{ padding: '10px' }}>17.8 mm</td><td style={{ padding: '10px' }}>56.0 mm</td></tr>
                    <tr><td style={{ padding: '10px' }}>18</td><td style={{ padding: '10px' }}>18.5 mm</td><td style={{ padding: '10px' }}>58.1 mm</td></tr>
                  </tbody>
                </table>
              </div>
            </section>

            {/* Necklaces */}
            <section>
              <h2 style={{ fontSize: '18px', fontWeight: 600, color: '#2a4d1c', marginBottom: '8px' }}>
                📿 Necklace Lengths
              </h2>
              <ul style={{ fontSize: '14px', lineHeight: 1.8, color: '#555', paddingLeft: '20px', margin: 0 }}>
                <li><strong>Choker (14–16 inches / 35–40 cm):</strong> Fits snugly around the base of the neck.</li>
                <li><strong>Princess (18 inches / 45 cm):</strong> Rests elegantly on the collarbone. Ideal for everyday pendants.</li>
                <li><strong>Matinee (20–22 inches / 50–55 cm):</strong> Falls just above the bust line, perfect for layering.</li>
                <li>Most MakeYouSparkle chains include a <strong>2-inch extension chain</strong> for custom adjustment.</li>
              </ul>
            </section>

            {/* Bracelets & Charms */}
            <section>
              <h2 style={{ fontSize: '18px', fontWeight: 600, color: '#2a4d1c', marginBottom: '8px' }}>
                ✨ Bracelets &amp; Custom Charms
              </h2>
              <p style={{ fontSize: '14px', color: '#555', lineHeight: 1.6 }}>
                Our charm chains and link bracelets standard length is <strong>16 cm + 4 cm adjustable extender</strong>, designed to fit wrists from 5.5 inches to 7.5 inches snugly or loose.
              </p>
            </section>

            <div style={{ background: '#f9f9f6', padding: '16px 20px', borderRadius: '8px', fontSize: '13px', color: '#555', borderLeft: '4px solid #7aaa5e' }}>
              Still unsure about your size? Message us on WhatsApp with a photo or measurement and we will guide you personally!
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}
