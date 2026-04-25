'use client';

import { Suspense, useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { apiRequest } from '@/lib/api';

type VerifyResponse = {
  success: boolean;
  message?: string;
};

function VerifyEmailContent() {
  const searchParams = useSearchParams();
  const token = useMemo(() => searchParams.get('token') || '', [searchParams]);
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
  const [message, setMessage] = useState('Verifying your email...');

  useEffect(() => {
    let isMounted = true;

    const verify = async () => {
      if (!token) {
        if (!isMounted) return;
        setStatus('error');
        setMessage('Verification token is missing. Please use the link from your email again.');
        return;
      }

      try {
        const result = await apiRequest<VerifyResponse>('/auth/verify-email', {
          method: 'POST',
          body: JSON.stringify({ token }),
        });

        if (!isMounted) return;

        setStatus('success');
        setMessage(result.message || 'Your email has been verified successfully.');
      } catch (error) {
        if (!isMounted) return;

        setStatus('error');
        setMessage(error instanceof Error ? error.message : 'Email verification failed.');
      }
    };

    verify();

    return () => {
      isMounted = false;
    };
  }, [token]);

  const isSuccess = status === 'success';

  return (
    <main style={styles.page}>
      <section style={styles.card}>
        <div style={styles.badge}>{isSuccess ? 'Verified' : status === 'error' ? 'Unable to verify' : 'Verifying'}</div>
        <h1 style={styles.title}>{isSuccess ? 'Email verified' : 'Verify your email'}</h1>
        <p style={styles.text}>{message}</p>

        {isSuccess ? (
          <div style={styles.actions}>
            <Link href="/" style={styles.primaryButton}>
              Go to home
            </Link>
            <Link href="/profile" style={styles.secondaryButton}>
              Open profile
            </Link>
          </div>
        ) : status === 'error' ? (
          <div style={styles.actions}>
            <Link href="/" style={styles.primaryButton}>
              Go home
            </Link>
          </div>
        ) : (
          <div style={styles.pulseRow}>
            <span style={styles.pulseDot} />
            <span style={styles.pulseText}>Checking token validity</span>
          </div>
        )}
      </section>
    </main>
  );
}

export default function VerifyEmailPage() {
  return (
    <Suspense
      fallback={(
        <main style={styles.page}>
          <section style={styles.card}>
            <div style={styles.badge}>Verifying</div>
            <h1 style={styles.title}>Verify your email</h1>
            <p style={styles.text}>Checking token validity</p>
          </section>
        </main>
      )}
    >
      <VerifyEmailContent />
    </Suspense>
  );
}

const styles: Record<string, React.CSSProperties> = {
  page: {
    minHeight: '100vh',
    display: 'grid',
    placeItems: 'center',
    padding: '32px 16px',
    background:
      'radial-gradient(circle at top, rgba(201,168,76,0.18), transparent 34%), linear-gradient(180deg, #071409 0%, #0f1d12 48%, #020503 100%)',
    color: '#f6f1df',
  },
  card: {
    width: '100%',
    maxWidth: '560px',
    padding: '32px',
    borderRadius: '28px',
    border: '1px solid rgba(201,168,76,0.22)',
    background: 'rgba(14, 25, 16, 0.72)',
    boxShadow: '0 24px 80px rgba(0,0,0,0.35)',
    backdropFilter: 'blur(18px)',
    textAlign: 'center',
  },
  badge: {
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '8px 14px',
    borderRadius: '999px',
    background: 'rgba(201,168,76,0.14)',
    border: '1px solid rgba(201,168,76,0.28)',
    color: '#d9c37d',
    fontSize: '12px',
    letterSpacing: '0.18em',
    textTransform: 'uppercase',
    marginBottom: '18px',
  },
  title: {
    margin: 0,
    fontSize: 'clamp(2rem, 5vw, 3.4rem)',
    lineHeight: 1,
    fontFamily: 'Cormorant Garamond, serif',
    fontWeight: 600,
  },
  text: {
    margin: '16px 0 0',
    fontSize: '0.98rem',
    lineHeight: 1.7,
    color: 'rgba(246,241,223,0.8)',
  },
  actions: {
    display: 'flex',
    gap: '12px',
    justifyContent: 'center',
    flexWrap: 'wrap',
    marginTop: '28px',
  },
  primaryButton: {
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    minWidth: '160px',
    padding: '12px 18px',
    borderRadius: '999px',
    background: '#c9a84c',
    color: '#10160c',
    textDecoration: 'none',
    fontWeight: 700,
    letterSpacing: '0.08em',
    textTransform: 'uppercase',
  },
  secondaryButton: {
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    minWidth: '160px',
    padding: '12px 18px',
    borderRadius: '999px',
    border: '1px solid rgba(201,168,76,0.3)',
    color: '#f6f1df',
    textDecoration: 'none',
    fontWeight: 700,
    letterSpacing: '0.08em',
    textTransform: 'uppercase',
    background: 'rgba(255,255,255,0.04)',
  },
  pulseRow: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '10px',
    marginTop: '26px',
    color: 'rgba(246,241,223,0.75)',
  },
  pulseDot: {
    width: '10px',
    height: '10px',
    borderRadius: '50%',
    background: '#c9a84c',
    boxShadow: '0 0 0 0 rgba(201,168,76,0.6)',
    animation: 'pulse 1.4s ease-in-out infinite',
  },
  pulseText: {
    fontSize: '0.92rem',
  },
};