'use client';

import { useEffect, useState, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { apiRequest } from '@/lib/api';
import { useCart } from '@/lib/cartContext';

function PaymentStatusContent() {
  const searchParams = useSearchParams();
  const { clearCart } = useCart();

  const [status, setStatus] = useState<'verifying' | 'success' | 'failed' | 'error'>('verifying');
  const [message, setMessage] = useState('');

  useEffect(() => {
    const merchantOrderId = searchParams.get('merchantOrderId');
    const orderId = searchParams.get('orderId');

    if (!merchantOrderId || !orderId) {
      // Try from sessionStorage (set just before redirect)
      const stored = sessionStorage.getItem('pendingPayment');
      if (stored) {
        const { orderId: storedOrderId, merchantOrderId: storedMerchantOrderId, paymentMode } = JSON.parse(stored);
        verifyPayment(storedOrderId, storedMerchantOrderId, paymentMode);
      } else {
        setStatus('error');
        setMessage('Missing payment information.');
      }
      return;
    }

    // Also read paymentMode from sessionStorage if query params are provided
    const stored = sessionStorage.getItem('pendingPayment');
    const paymentMode = stored ? JSON.parse(stored).paymentMode : 'ONLINE';
    verifyPayment(orderId, merchantOrderId, paymentMode);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function verifyPayment(orderId: string, merchantOrderId: string, paymentMode = 'ONLINE') {
    try {
      setStatus('verifying');
      await apiRequest('/payment/verify', {
        method: 'POST',
        body: JSON.stringify({ orderId, merchantOrderId, paymentMode }),
      });
      sessionStorage.removeItem('pendingPayment');
      clearCart();
      setStatus('success');
    } catch (err: unknown) {
      const error = err as Error;
      console.error('Payment verification failed:', error);
      setStatus('failed');
      setMessage(error.message || 'Payment could not be verified. Please contact support.');
    }
  }

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:wght@300;400&family=DM+Sans:wght@400;500;600;700&display=swap');
        .ps-root { min-height: 100vh; background: #f5f0e8; display: flex; flex-direction: column; align-items: center; justify-content: center; padding: 40px 24px; font-family: 'DM Sans', sans-serif; text-align: center; }
        .ps-card { background: white; border-radius: 20px; padding: 48px 36px; max-width: 440px; width: 100%; box-shadow: 0 8px 40px rgba(0,0,0,.08); }
        .ps-icon { font-size: 64px; margin-bottom: 20px; }
        .ps-title { font-family: 'Cormorant Garamond', serif; font-size: 32px; font-weight: 300; color: #1a3a1a; margin-bottom: 10px; }
        .ps-sub { font-size: 14px; color: rgba(26,58,26,.6); line-height: 1.7; margin-bottom: 28px; }
        .ps-btn { display: inline-block; padding: 14px 40px; background: #2d5a27; color: white; border: none; border-radius: 50px; font-family: 'DM Sans', sans-serif; font-size: 11px; font-weight: 700; letter-spacing: .22em; text-transform: uppercase; cursor: pointer; text-decoration: none; transition: background .2s; }
        .ps-btn:hover { background: #3a7a32; }
        .ps-btn-outline { display: inline-block; padding: 12px 32px; background: transparent; color: #2d5a27; border: 1.5px solid #2d5a27; border-radius: 50px; font-family: 'DM Sans', sans-serif; font-size: 11px; font-weight: 700; letter-spacing: .22em; text-transform: uppercase; cursor: pointer; text-decoration: none; margin-left: 12px; }
        .ps-spinner { width: 48px; height: 48px; border: 4px solid rgba(45,90,39,.15); border-top-color: #2d5a27; border-radius: 50%; animation: spin .8s linear infinite; margin: 0 auto 24px; }
        @keyframes spin { to { transform: rotate(360deg); } }
        .ps-error-msg { background: #fff5f5; border: 1px solid rgba(220,50,50,.2); border-radius: 10px; padding: 14px 18px; font-size: 13px; color: #7a2020; margin-bottom: 24px; line-height: 1.5; }
      `}</style>

      <div className="ps-root">
        <div className="ps-card">
          {status === 'verifying' && (
            <>
              <div className="ps-spinner" />
              <h1 className="ps-title">Verifying Payment…</h1>
              <p className="ps-sub">Please wait while we confirm your payment with PhonePe. Do not close this page.</p>
            </>
          )}

          {status === 'success' && (
            <>
              <div className="ps-icon">✅</div>
              <h1 className="ps-title">Order Placed!</h1>
              <p className="ps-sub">Your payment was successful and your order is confirmed. You&apos;ll receive a confirmation email shortly.</p>
              <Link href="/" className="ps-btn">Continue Shopping</Link>
            </>
          )}

          {(status === 'failed' || status === 'error') && (
            <>
              <div className="ps-icon">❌</div>
              <h1 className="ps-title">Payment {status === 'failed' ? 'Failed' : 'Error'}</h1>
              {message && <div className="ps-error-msg">{message}</div>}
              <p className="ps-sub">
                {status === 'failed'
                  ? 'Your payment could not be verified. If money was deducted, it will be refunded within 5–7 business days.'
                  : 'Something went wrong. Please try again or contact our support team.'}
              </p>
              <Link href="/checkout" className="ps-btn">Try Again</Link>
              <Link href="/" className="ps-btn-outline">Go Home</Link>
            </>
          )}
        </div>
      </div>
    </>
  );
}

export default function PaymentStatusPage() {
  return (
    <Suspense fallback={
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#f5f0e8', fontFamily: 'sans-serif' }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{ width: 48, height: 48, border: '4px solid rgba(45,90,39,.15)', borderTopColor: '#2d5a27', borderRadius: '50%', animation: 'spin .8s linear infinite', margin: '0 auto 20px' }} />
          <p style={{ color: '#2d5a27', fontWeight: 600 }}>Loading…</p>
        </div>
      </div>
    }>
      <PaymentStatusContent />
    </Suspense>
  );
}
