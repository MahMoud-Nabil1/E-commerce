import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import './AuthPage.css';

type AccountType = 'user' | 'seller';

export default function RegisterPage() {
  const navigate = useNavigate();
  const { register } = useAuth();

  const [accountType, setAccountType] = useState<AccountType>('user');
  const [form,        setForm]        = useState({ username: '', email: '', password: '', confirm: '' });
  const [loading,     setLoading]     = useState(false);
  const [error,       setError]       = useState<string | null>(null);
  const [success,     setSuccess]     = useState(false);

  function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    setForm({ ...form, [e.target.name]: e.target.value });
  }

  const pwReqs = [
    { label: 'At least 8 characters',    met: form.password.length >= 8 },
    { label: 'Contains a number',         met: /\d/.test(form.password) },
    { label: 'Contains uppercase letter', met: /[A-Z]/.test(form.password) },
  ];

  async function handleRegisterSubmit(e: React.FormEvent) {
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
      {/* ── Left hero panel ── */}
      <div className="auth-panel auth-panel--hero">
        <div className="auth-hero__content">
          <span className="auth-hero__badge">
            {accountType === 'seller' ? 'Sell on ShopFlow' : 'Join Now'}
          </span>
          <h1 className="auth-hero__title">
            {accountType === 'seller'
              ? 'Start growing your business with ShopFlow.'
              : 'Join millions of happy shoppers worldwide.'}
          </h1>
          <p className="auth-hero__desc">
            {accountType === 'seller'
              ? 'List products, manage inventory, and reach customers everywhere.'
              : 'Create a free account to track orders, save favorites, and get exclusive deals.'}
          </p>

          <ul className="auth-features">
            <li className="auth-feature">
              <span className="auth-feature__icon" aria-hidden="true">✓</span>
              <span>
                {accountType === 'seller'
                  ? 'Real-time sales dashboard & analytics'
                  : 'Fast checkout & order tracking'}
              </span>
            </li>
            <li className="auth-feature">
              <span className="auth-feature__icon" aria-hidden="true">✓</span>
              <span>
                {accountType === 'seller'
                  ? 'Integrated payment processing with Stripe'
                  : 'Curated deals and personalized recommendations'}
              </span>
            </li>
            <li className="auth-feature">
              <span className="auth-feature__icon" aria-hidden="true">✓</span>
              <span>
                {accountType === 'seller'
                  ? 'Dedicated seller support team'
                  : '24/7 customer support & easy returns'}
              </span>
            </li>
          </ul>
        </div>
      </div>

      {/* ── Right form panel ── */}
      <div className="auth-panel auth-panel--form">
        <div className="auth-form-container">
          {success ? (
            <div className="auth-success" role="status">
              <div className="auth-success__icon">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" width="32" height="32">
                  <polyline points="20 6 9 17 4 12" />
                </svg>
              </div>
              <h2 className="auth-form-title">Account Created!</h2>
              <p className="auth-form-sub">Your account is ready. Redirecting you to sign in…</p>
              <Link to="/login" className="auth-submit" style={{ marginTop: '1.5rem', display: 'block', textAlign: 'center', textDecoration: 'none' }}>
                Sign In Now
              </Link>
            </div>
          ) : (
            <>
              {/* Account type selector */}
              <div className="auth-tabs" role="tablist">
                <button
                  type="button"
                  role="tab"
                  aria-selected={accountType === 'user'}
                  className={`auth-tab${accountType === 'user' ? ' auth-tab--active' : ''}`}
                  onClick={() => setAccountType('user')}
                  id="tab-customer"
                >
                  Customer Account
                </button>
                <button
                  type="button"
                  role="tab"
                  aria-selected={accountType === 'seller'}
                  className={`auth-tab${accountType === 'seller' ? ' auth-tab--active' : ''}`}
                  onClick={() => setAccountType('seller')}
                  id="tab-seller"
                >
                  Seller Account
                </button>
              </div>

              <div className="auth-form-header">
                <h2 className="auth-form-title">
                  {accountType === 'seller' ? 'Create Seller Account' : 'Create an Account'}
                </h2>
                <p className="auth-form-sub">
                  {accountType === 'seller'
                    ? 'Start selling to millions of shoppers today.'
                    : 'Fill in your details below to get started.'}
                </p>
              </div>

              {error && (
                <div className="auth-error" role="alert">
                  <svg viewBox="0 0 20 20" fill="currentColor" width="16" height="16" aria-hidden="true">
                    <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                  </svg>
                  {error}
                </div>
              )}

              <form className="auth-form" onSubmit={handleRegisterSubmit} noValidate>
                <div className="auth-field">
                  <label htmlFor="reg-username" className="auth-label">Username</label>
                  <input
                    id="reg-username"
                    name="username"
                    type="text"
                    className="auth-input"
                    placeholder="johndoe"
                    value={form.username}
                    onChange={handleChange}
                    required
                    autoComplete="username"
                    autoFocus
                  />
                </div>

                <div className="auth-field">
                  <label htmlFor="reg-email" className="auth-label">Email address</label>
                  <input
                    id="reg-email"
                    name="email"
                    type="email"
                    className="auth-input"
                    placeholder="john@example.com"
                    value={form.email}
                    onChange={handleChange}
                    required
                    autoComplete="email"
                  />
                </div>

                <div className="auth-field">
                  <label htmlFor="reg-password" className="auth-label">Password</label>
                  <input
                    id="reg-password"
                    name="password"
                    type="password"
                    className="auth-input"
                    placeholder="••••••••"
                    value={form.password}
                    onChange={handleChange}
                    required
                    autoComplete="new-password"
                  />
                  {form.password.length > 0 && (
                    <ul className="auth-pw-reqs" aria-label="Password requirements">
                      {pwReqs.map((r) => (
                        <li key={r.label} className={`auth-pw-req${r.met ? ' auth-pw-req--met' : ''}`}>
                          <span aria-hidden="true">{r.met ? '✓' : '○'}</span>
                          {r.label}
                        </li>
                      ))}
                    </ul>
                  )}
                </div>

                <div className="auth-field">
                  <label htmlFor="reg-confirm" className="auth-label">Confirm password</label>
                  <input
                    id="reg-confirm"
                    name="confirm"
                    type="password"
                    className="auth-input"
                    placeholder="••••••••"
                    value={form.confirm}
                    onChange={handleChange}
                    required
                    autoComplete="new-password"
                  />
                </div>

                <button
                  type="submit"
                  className="auth-submit"
                  disabled={loading}
                  id="reg-submit-btn"
                >
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
