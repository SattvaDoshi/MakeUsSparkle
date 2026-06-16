'use client';

import { useState } from 'react';
import { apiRequest } from '@/lib/api';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function ForgotPasswordPage() {
  const router = useRouter();
  const [step, setStep] = useState<1 | 2>(1);
  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [feedback, setFeedback] = useState('');
  const [success, setSuccess] = useState(false);

  const handleRequestOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setFeedback('');
    try {
      await apiRequest<{ success: boolean; message: string }>('/auth/forgot-password', {
        method: 'POST',
        body: JSON.stringify({ email }),
      });
      setStep(2);
      setFeedback('OTP has been sent to your email.');
    } catch (err) {
      setFeedback(err instanceof Error ? err.message : 'Failed to send OTP.');
    } finally {
      setLoading(false);
    }
  };

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setFeedback('');
    try {
      await apiRequest<{ success: boolean; message: string }>('/auth/reset-password', {
        method: 'POST',
        body: JSON.stringify({ email, otp, newPassword }),
      });
      setSuccess(true);
      setFeedback('Password reset successfully. You can now login.');
      setTimeout(() => {
        router.push('/');
        // Wait a bit before opening the modal so the route transition can happen
        setTimeout(() => {
          window.dispatchEvent(new CustomEvent('makeussparkle:auth-open', { detail: { tab: 'login' } }));
        }, 500);
      }, 2000);
    } catch (err) {
      setFeedback(err instanceof Error ? err.message : 'Failed to reset password. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fp-container">
      <style>{`
        .fp-container {
          min-height: 80vh;
          display: flex;
          align-items: center;
          justify-content: center;
          background: #fdfbf7;
          padding: 2rem;
          font-family: 'Jost', sans-serif;
        }
        .fp-card {
          background: #c8dfc0;
          width: 100%;
          max-width: 440px;
          border-radius: 24px;
          padding: 2.5rem 2rem;
          box-shadow: 0 10px 30px rgba(60, 80, 40, 0.05);
        }
        .fp-title {
          font-family: 'Playfair Display', serif;
          font-size: 1.8rem;
          color: #1e3a18;
          text-align: center;
          margin-bottom: 0.5rem;
        }
        .fp-sub {
          text-align: center;
          color: #4a6040;
          font-size: 0.9rem;
          margin-bottom: 2rem;
        }
        .fp-form {
          display: flex;
          flex-direction: column;
          gap: 1rem;
        }
        .fp-input {
          width: 100%;
          background: rgba(255, 255, 255, 0.6);
          border: 1px solid rgba(90, 120, 70, 0.2);
          border-radius: 12px;
          padding: 0.8rem 1.2rem;
          color: #2e4a28;
          font-size: 1rem;
          outline: none;
          transition: all 0.2s;
          box-sizing: border-box;
        }
        .fp-input:focus {
          background: rgba(255, 255, 255, 0.9);
          border-color: rgba(80, 130, 60, 0.5);
        }
        .fp-submit {
          width: 100%;
          background: #3e6b30;
          color: #f5eedb;
          border: none;
          border-radius: 14px;
          padding: 1rem;
          font-size: 1rem;
          font-weight: 600;
          cursor: pointer;
          margin-top: 1rem;
          transition: background 0.2s;
        }
        .fp-submit:hover:not(:disabled) {
          background: #2e4a28;
        }
        .fp-submit:disabled {
          opacity: 0.5;
          cursor: not-allowed;
        }
        .fp-feedback {
          text-align: center;
          color: #3e6b30;
          margin-top: 1.5rem;
          font-size: 0.9rem;
          background: rgba(255,255,255,0.4);
          padding: 0.8rem;
          border-radius: 8px;
        }
        .fp-back {
          display: block;
          text-align: center;
          margin-top: 1.5rem;
          color: #4a6040;
          text-decoration: none;
          font-size: 0.9rem;
        }
        .fp-back:hover {
          text-decoration: underline;
        }
      `}</style>
      
      <div className="fp-card">
        <h1 className="fp-title">Reset Password</h1>
        <p className="fp-sub">
          {step === 1 
            ? 'Enter your email address to receive a one-time password (OTP).' 
            : 'Enter the OTP sent to your email and your new password.'}
        </p>

        {success ? (
          <div className="fp-feedback">
            <strong>{feedback}</strong>
            <p style={{marginTop: '0.5rem', fontSize: '0.8rem'}}>Redirecting to home...</p>
          </div>
        ) : (
          <form className="fp-form" onSubmit={step === 1 ? handleRequestOtp : handleResetPassword}>
            {step === 1 ? (
              <input
                className="fp-input"
                type="email"
                placeholder="Email Address"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            ) : (
              <>
                <input
                  className="fp-input"
                  type="text"
                  placeholder="6-digit OTP"
                  value={otp}
                  onChange={(e) => setOtp(e.target.value)}
                  maxLength={6}
                  required
                />
                <input
                  className="fp-input"
                  type="password"
                  placeholder="New Password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  minLength={6}
                  required
                />
              </>
            )}

            <button type="submit" className="fp-submit" disabled={loading}>
              {loading ? 'Please wait...' : step === 1 ? 'Send OTP' : 'Reset Password'}
            </button>
          </form>
        )}

        {feedback && !success && (
          <div className="fp-feedback">{feedback}</div>
        )}

        <Link href="/" className="fp-back">
          Back to Home
        </Link>
      </div>
    </div>
  );
}
