'use client';

import { useState } from 'react';
import Image from 'next/image';
import { useAuth } from '@/components/AuthProvider';
import { useRouter } from 'next/navigation';
import logo2 from '@/app/assets/logo2.png';

export default function LoginPage() {
  const { login } = useAuth();
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSubmitting(true);

    try {
      await login(email.trim(), password);
      router.push('/');
    } catch (err) {
      setError(err.message || 'Unable to sign in. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="login-page">
      <div className="login-panel login-panel-brand">
        <div className="login-brand-content">
          <div className="login-logo">
            <Image src={logo2} alt="Engage Now Africa" className="login-logo-img" priority />
          </div>
          <h1 className="login-headline">Project management built for impact.</h1>
          <p className="login-tagline">
            Track projects, budgets, beneficiaries, and team collaboration — all in one place.
          </p>
          <ul className="login-features">
            <li>
              <span className="login-feature-icon">✓</span>
              Real-time dashboard &amp; reporting
            </li>
            <li>
              <span className="login-feature-icon">✓</span>
              Budget tracking &amp; donor compliance
            </li>
            <li>
              <span className="login-feature-icon">✓</span>
              Secure team collaboration
            </li>
          </ul>
        </div>
        <div className="login-brand-pattern" aria-hidden="true" />
      </div>

      <div className="login-panel login-panel-form">
        <div className="login-form-wrap">
          <div className="login-form-header">
            <h2>Welcome back</h2>
            <p>Sign in to your account to continue</p>
          </div>

          <form className="login-form" onSubmit={handleSubmit}>
            {error && (
              <div className="login-error" role="alert">
                {error}
              </div>
            )}

            <label className="login-field">
              <span>Email address</span>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@organization.org"
                autoComplete="email"
                required
                disabled={submitting}
              />
            </label>

            <label className="login-field">
              <span>Password</span>
              <div className="login-password-wrap">
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter your password"
                  autoComplete="current-password"
                  required
                  disabled={submitting}
                />
                <button
                  type="button"
                  className="login-password-toggle"
                  onClick={() => setShowPassword((v) => !v)}
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                  tabIndex={-1}
                >
                  {showPassword ? (
                    <svg fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                      <path d="M17.94 17.94A10.07 10.07 0 0112 20c-7 0-11-8-11-8a18.45 18.45 0 015.06-5.94M9.9 4.24A9.12 9.12 0 0112 4c7 0 11 8 11 8a18.5 18.5 0 01-2.16 3.19m-6.72-1.07a3 3 0 11-4.24-4.24" />
                      <line x1="1" y1="1" x2="23" y2="23" />
                    </svg>
                  ) : (
                    <svg fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                      <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                      <circle cx="12" cy="12" r="3" />
                    </svg>
                  )}
                </button>
              </div>
            </label>

            <button type="submit" className="login-submit" disabled={submitting}>
              {submitting ? 'Signing in…' : 'Sign in'}
            </button>
          </form>

          <p className="login-footer-note">
            NGO Project Management · Engage Now Africa
          </p>
        </div>
      </div>
    </div>
  );
}
