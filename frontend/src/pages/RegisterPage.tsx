import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import './AuthPage.css';

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
