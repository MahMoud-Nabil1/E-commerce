import { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import './AuthPage.css';

export default function LoginPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const { login, user } = useAuth();

  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Redirect back to where the user came from, or role-based default
  const from = (location.state as { from?: string })?.from;

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      await login(username, password);
      // Determine redirect: explicit "from" takes priority, then role-based default
      if (from) {
        navigate(from, { replace: true });
      } else {
        // We need to read the updated user from the context after login.
        // login() sets the user synchronously via setUser, so we read it via
        // a small trick: re-read from the returned data via the auth context.
        // The user state update is async in React, so we check roles from the
        // login response directly by reading the updated context on next tick.
        // Instead, we navigate to a role-aware redirect component.
        navigate('/redirect', { replace: true });
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Invalid credentials. Please try again.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="auth-page">
      {/* Left panel */}
      <div className="auth-panel auth-panel--hero">
        <div className="auth-hero__content">
          <span className="auth-hero__badge">Secure Access</span>
          <h1 className="auth-hero__title">The Precision Standard for Enterprise Procurement.</h1>
          <p className="auth-hero__sub">
            Access your dashboard to manage inventory, track logistics, and scale your commerce operations.
          </p>
          <div className="auth-hero__features">
            <div className="auth-feature">
              <div className="auth-feature__icon">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="20" height="20" aria-hidden="true">
                  <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
                </svg>
              </div>
              <div>
                <p className="auth-feature__title">256-bit SSL Encryption</p>
                <p className="auth-feature__desc">All data encrypted in transit</p>
              </div>
            </div>
            <div className="auth-feature">
              <div className="auth-feature__icon">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="20" height="20" aria-hidden="true">
                  <polyline points="22 12 18 12 15 21 9 3 6 12 2 12" />
                </svg>
              </div>
              <div>
                <p className="auth-feature__title">Real-time Analytics</p>
                <p className="auth-feature__desc">Zero-latency data synchronization</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Right panel — form */}
      <div className="auth-panel auth-panel--form">
        <div className="auth-form-wrap">
          <div className="auth-form-header">
            <h2 className="auth-form-title">Welcome back</h2>
            <p className="auth-form-sub">Sign in to your account to continue</p>
          </div>

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
              <label htmlFor="login-username" className="auth-label">Username</label>
              <input
                id="login-username"
                type="text"
                className="auth-input"
                placeholder="your_username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                required
                autoComplete="username"
                autoFocus
              />
            </div>

            <div className="auth-field">
              <label htmlFor="login-password" className="auth-label">Password</label>
              <input
                id="login-password"
                type="password"
                className="auth-input"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                autoComplete="current-password"
              />
            </div>

            <button type="submit" className="auth-submit" disabled={loading}>
              {loading ? (
                <span className="auth-spinner" aria-label="Signing in…" />
              ) : (
                'Sign In'
              )}
            </button>
          </form>

          <p className="auth-switch">
            Don't have an account?{' '}
            <Link to="/register" className="auth-switch__link">Create one</Link>
          </p>
        </div>
      </div>
    </div>
  );
}
