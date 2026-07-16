'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/authContext';

/**
 * /signup?ref=<code>
 *
 * This page exists solely to handle referral deep-links.
 * • If the visitor is already logged in → redirect to home.
 * • Otherwise → fire the auth-open event so the LoginPopup appears
 *   (the popup reads ?ref= from the URL and passes it to /auth/register).
 */
export default function SignupPage() {
  const { isAuthenticated, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (loading) return;

    if (isAuthenticated) {
      router.replace('/');
      return;
    }

    // Small delay so the LoginPopup mounts first
    const timer = setTimeout(() => {
      window.dispatchEvent(new CustomEvent('makeussparkle:auth-open', { detail: { tab: 'register' } }));
    }, 300);

    return () => clearTimeout(timer);
  }, [isAuthenticated, loading, router]);

  return (
    <div style={{
      minHeight: '100dvh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      fontFamily: 'system-ui, sans-serif',
      background: '#f5f2eb',
      color: '#1a1d0d',
    }}>
      <p style={{ opacity: 0.5, fontSize: 14 }}>Opening sign-up…</p>
    </div>
  );
}
