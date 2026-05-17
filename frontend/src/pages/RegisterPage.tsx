import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import './AuthPage.css';

const BACKEND = import.meta.env.VITE_API_BASE_URL ?? 'http://localhost:8080';

type AccountType = 'user' | 'seller';

export default function RegisterPage() {
  const navigate = useNavigate();
  const { register } = useAuth();

  const [accountType, setAccountType] = useState<AccountType>('user');
  const [form, setForm] = useState({ username: '', email: '', password: '', confirm: '' });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    setForm({ ...form, [e.target.name]: e.target.value });
  }

  const pwReqs = [
    { label: 'At least 8 characters', met: form.password.length >= 8 },
    { label: 'Contains a number', met: /\d/.test(form.password) },
    { label: 'Contains uppercase letter', met: /[A-Z]/.test(form.password) },
  ];

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    if (form.password !== form.confirm) {
      setError('Passwords do not match.');
      return;
    }

    setLoading(true);
    try {
      await register(form.username, form.email, form.password, accountType);
      setSuccess(true);
      setTimeout(() => navigate('/login'), 2000);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Registration failed. Please try again.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="auth-page">
      {/* Left panel */}
      <div className="auth-panel auth-panel--hero">
        <div className="auth-hero__content">
          <span className="auth-hero__badge">
            {accountType === 'seller' ? 'Sell on ShopFlow' : 'Join Now'}
          </span>
          <h1 className="auth-hero__title">
            {accountType === 'seller'
              ? 'Reach Thousands of Customers.'
              : 'Start Your Enterprise Journey Today.'}
          </h1>
          <p className="auth-hero__sub">
            {accountType === 'seller'
              ? 'List your products, manage orders, and grow your business with our seller tools and real-time analytics.'
              : 'Create your account to unlock powerful procurement tools, real-time analytics, and enterprise-grade security.'}
          </p>
          <div className="auth-hero__features">
            <div className="auth-feature">
              <div className="auth-feature__icon">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="20" height="20" aria-hidden="true">
                  <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
                </svg>
              </div>
              <div>
                <p className="auth-feature__title">Enterprise Security</p>
                <p className="auth-feature__desc">Bank-level security for your business data</p>
              </div>
            </div>
            <div className="auth-feature">
              <div className="auth-feature__icon">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="20" height="20" aria-hidden="true">
                  <rect x="1" y="4" width="22" height="16" rx="2" ry="2" />
                  <line x1="1" y1="10" x2="23" y2="10" />
                </svg>
              </div>
              <div>
                <p className="auth-feature__title">Free to Start</p>
                <p className="auth-feature__desc">No credit card required to create an account</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Right panel — form */}
      <div className="auth-panel auth-panel--form">
        <div className="auth-form-wrap">
          {success ? (
            <div className="auth-success" role="status">
              <div className="auth-success__icon" aria-hidden="true">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" width="32" height="32">
                  <polyline points="20 6 9 17 4 12" />
                </svg>
              </div>
              <h2 className="auth-form-title">Account created!</h2>
              <p className="auth-form-sub">Redirecting you to sign in…</p>
            </div>
          ) : (
            <>
              <div className="auth-form-header">
                <h2 className="auth-form-title">Create account</h2>
                <p className="auth-form-sub">Register to get started</p>
              </div>

              {/* Account type toggle */}
              <div className="account-type-toggle" role="group" aria-label="Account type">
                <button
                  type="button"
                  className={`account-type-btn${accountType === 'user' ? ' account-type-btn--active' : ''}`}
                  onClick={() => setAccountType('user')}
                >
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="16" height="16" aria-hidden="true">
                    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                    <circle cx="12" cy="7" r="4" />
                  </svg>
                  Customer
                </button>
                <button
                  type="button"
                  className={`account-type-btn${accountType === 'seller' ? ' account-type-btn--active' : ''}`}
                  onClick={() => setAccountType('seller')}
                >
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="16" height="16" aria-hidden="true">
                    <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
                    <polyline points="9 22 9 12 15 12 15 22" />
                  </svg>
                  Seller
                </button>
              </div>

              {accountType === 'seller' && (
                <div className="seller-notice" role="note">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="15" height="15" aria-hidden="true">
                    <circle cx="12" cy="12" r="10" />
                    <line x1="12" y1="8" x2="12" y2="12" />
                    <line x1="12" y1="16" x2="12.01" y2="16" />
                  </svg>
                  You'll get access to the seller dashboard to list products and manage orders.
                </div>
              )}

              <form className="auth-form" onSubmit={handleSubmit} noValidate>
                {error && (
                  <div className="auth-error" role="alert">
                    <svg viewBox="0 0 20 20" fill="currentColor" width="16" height="16" aria-hidden="true">
                      <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                    </svg>
                    {error}
                  </div>
                )}

                <div className="auth-field">
                  <label htmlFor="reg-username" className="auth-label">Username</label>
                  <input id="reg-username" name="username" type="text" className="auth-input"
                    placeholder="johndoe" value={form.username} onChange={handleChange} required autoFocus />
                </div>

                <div className="auth-field">
                  <label htmlFor="reg-email" className="auth-label">Email</label>
                  <input id="reg-email" name="email" type="email" className="auth-input"
                    placeholder="you@company.com" value={form.email} onChange={handleChange} required />
                </div>

                <div className="auth-field">
                  <label htmlFor="reg-password" className="auth-label">Password</label>
                  <input id="reg-password" name="password" type="password" className="auth-input"
                    placeholder="Create a strong password" value={form.password} onChange={handleChange} required />
                  {form.password.length > 0 && (
                    <ul className="pw-reqs" aria-label="Password requirements">
                      {pwReqs.map((r) => (
                        <li key={r.label} className={`pw-req ${r.met ? 'pw-req--met' : ''}`}>
                          <span className="pw-req__dot" aria-hidden="true" />
                          {r.label}
                        </li>
                      ))}
                    </ul>
                  )}
                </div>

                <div className="auth-field">
                  <label htmlFor="reg-confirm" className="auth-label">Confirm Password</label>
                  <input id="reg-confirm" name="confirm" type="password" className="auth-input"
                    placeholder="Repeat your password" value={form.confirm} onChange={handleChange} required />
                </div>

                <button type="submit" className={`auth-submit${accountType === 'seller' ? ' auth-submit--seller' : ''}`} disabled={loading}>
                  {loading
                    ? <span className="auth-spinner" aria-label="Creating account…" />
                    : accountType === 'seller' ? 'Create Seller Account' : 'Create Account'}
                </button>
              </form>

              {/* ── Social login divider ── */}
              <div className="auth-divider">
                <span className="auth-divider__line" />
                <span className="auth-divider__text">or sign up with</span>
                <span className="auth-divider__line" />
              </div>

              {/* ── OAuth2 buttons ── */}
              <div className="auth-social">
                <a
                  href={`${BACKEND}/oauth2/authorization/google`}
                  className="auth-social-btn auth-social-btn--google"
                  aria-label="Sign up with Google"
                >
                  <svg viewBox="0 0 24 24" width="20" height="20" aria-hidden="true">
                    <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                    <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                    <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z" fill="#FBBC05"/>
                    <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
                  </svg>
                  Google
                </a>

                <a
                  href={`${BACKEND}/oauth2/authorization/github`}
                  className="auth-social-btn auth-social-btn--github"
                  aria-label="Sign up with GitHub"
                >
                  <svg viewBox="0 0 24 24" width="20" height="20" fill="currentColor" aria-hidden="true">
                    <path d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z"/>
                  </svg>
                  GitHub
                </a>
              </div>

              <p className="auth-switch">
                Already have an account?{' '}
                <Link to="/login" className="auth-switch__link">Sign in</Link>
              </p>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
