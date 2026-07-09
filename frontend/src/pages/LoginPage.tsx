import { useState } from 'react';
import { Link, useNavigate, useLocation, useSearchParams } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { apiClient } from '../lib/api';
import './AuthPage.css';

const BACKEND = import.meta.env.VITE_API_BASE_URL ?? 'http://localhost:8080';

// ── View states ──────────────────────────────────────────────────────────────
type View = 'login' | 'forgot-email' | 'forgot-otp' | 'forgot-done';

export default function LoginPage() {
  const navigate  = useNavigate();
  const location  = useLocation();
  const [searchParams] = useSearchParams();
  const { login } = useAuth();

  // ── Login state ────────────────────────────────────────────────────────────
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPass, setShowPass] = useState(false);
  const [loading,  setLoading]  = useState(false);
  const [error,    setError]    = useState<string | null>(
    searchParams.get('oauthError')
      ? decodeURIComponent(searchParams.get('oauthError')!)
      : null
  );

  // ── Forgot-password state ──────────────────────────────────────────────────
  const [view,        setView]        = useState<View>('login');
  const [fpEmail,     setFpEmail]     = useState('');
  const [fpOtp,       setFpOtp]       = useState('');
  const [fpNewPass,   setFpNewPass]   = useState('');
  const [fpConfirm,   setFpConfirm]   = useState('');
  const [fpShowPass,  setFpShowPass]  = useState(false);
  const [fpLoading,   setFpLoading]   = useState(false);
  const [fpError,     setFpError]     = useState<string | null>(null);
  const [fpSuccess,   setFpSuccess]   = useState<string | null>(null);
  const [resendCool,  setResendCool]  = useState(false);

  const from = (location.state as { from?: string })?.from;

  // ── Login submit ───────────────────────────────────────────────────────────
  async function handleLoginSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      await login(username, password);
      navigate(from ?? '/redirect', { replace: true });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Invalid credentials. Please try again.');
    } finally {
      setLoading(false);
    }
  }

  // ── Forgot: send OTP ───────────────────────────────────────────────────────
  async function handleForgotEmail(e: React.FormEvent) {
    e.preventDefault();
    setFpError(null);
    setFpLoading(true);
    try {
      await apiClient.forgotPassword(fpEmail);
      setFpSuccess('A 6-digit OTP has been sent to your email.');
      setView('forgot-otp');
    } catch (err) {
      setFpError(err instanceof Error ? err.message : 'Failed to send OTP. Please try again.');
    } finally {
      setFpLoading(false);
    }
  }

  // ── Forgot: resend OTP ─────────────────────────────────────────────────────
  async function handleResend() {
    if (resendCool) return;
    setFpError(null);
    setResendCool(true);
    try {
      await apiClient.forgotPassword(fpEmail);
      setFpSuccess('A new OTP has been sent to your email.');
    } catch (err) {
      setFpError(err instanceof Error ? err.message : 'Failed to resend OTP.');
    } finally {
      setTimeout(() => setResendCool(false), 30000);
    }
  }

  // ── Forgot: reset password ─────────────────────────────────────────────────
  async function handleResetPassword(e: React.FormEvent) {
    e.preventDefault();
    setFpError(null);
    if (fpNewPass !== fpConfirm) {
      setFpError('Passwords do not match.');
      return;
    }
    if (fpNewPass.length < 8) {
      setFpError('Password must be at least 8 characters.');
      return;
    }
    setFpLoading(true);
    try {
      await apiClient.resetPassword(fpEmail, fpOtp, fpNewPass);
      setView('forgot-done');
    } catch (err) {
      setFpError(err instanceof Error ? err.message : 'Failed to reset password. Check your OTP and try again.');
    } finally {
      setFpLoading(false);
    }
  }

  // ── Back to login helper ───────────────────────────────────────────────────
  function backToLogin() {
    setView('login');
    setFpEmail('');
    setFpOtp('');
    setFpNewPass('');
    setFpConfirm('');
    setFpError(null);
    setFpSuccess(null);
    setError(null);
  }

  // ── Render ─────────────────────────────────────────────────────────────────
  return (
    <div className="auth-page">
      {/* ── Left hero panel ── */}
      <div className="auth-panel auth-panel--hero">
        <div className="auth-hero__content">
          <span className="auth-hero__badge">Secure Access</span>
          <h1 className="auth-hero__title">
            {view === 'login'
              ? 'The Precision Standard for Enterprise Procurement.'
              : 'Password Recovery'}
          </h1>
          <p className="auth-hero__sub">
            {view === 'login'
              ? 'Access your dashboard to manage inventory, track logistics, and scale your commerce operations.'
              : 'We\'ll send a one-time code to your email so you can securely reset your password.'}
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

      {/* ── Right form panel ── */}
      <div className="auth-panel auth-panel--form">
        <div className="auth-form-wrap">

          {/* ════ VIEW: LOGIN ════ */}
          {view === 'login' && (
            <>
              <div className="auth-form-header">
                <h2 className="auth-form-title">Welcome back</h2>
                <p className="auth-form-sub">Sign in to your account to continue</p>
              </div>

              <form className="auth-form" onSubmit={handleLoginSubmit} noValidate>
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
                  <div className="auth-label-row">
                    <label htmlFor="login-password" className="auth-label">Password</label>
                    <button
                      type="button"
                      className="auth-forgot-link"
                      onClick={() => { setError(null); setView('forgot-email'); }}
                    >
                      Forgot password?
                    </button>
                  </div>
                  <div className="auth-input-wrap">
                    <input
                      id="login-password"
                      type={showPass ? 'text' : 'password'}
                      className="auth-input auth-input--icon"
                      placeholder="••••••••"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      required
                      autoComplete="current-password"
                    />
                    <button
                      type="button"
                      className="auth-eye-btn"
                      aria-label={showPass ? 'Hide password' : 'Show password'}
                      onClick={() => setShowPass(v => !v)}
                    >
                      {showPass ? (
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="18" height="18">
                          <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94" />
                          <path d="M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19" />
                          <line x1="1" y1="1" x2="23" y2="23" />
                        </svg>
                      ) : (
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="18" height="18">
                          <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                          <circle cx="12" cy="12" r="3" />
                        </svg>
                      )}
                    </button>
                  </div>
                </div>

                <button type="submit" className="auth-submit" disabled={loading} id="login-submit-btn">
                  {loading ? <span className="auth-spinner" aria-label="Signing in…" /> : 'Sign In'}
                </button>
              </form>

              <div className="auth-divider">
                <span className="auth-divider__line" />
                <span className="auth-divider__text">or continue with</span>
                <span className="auth-divider__line" />
              </div>

              <div className="auth-social">
                <a href={`${BACKEND}/oauth2/authorization/google`} className="auth-social-btn auth-social-btn--google" aria-label="Sign in with Google">
                  <svg viewBox="0 0 24 24" width="20" height="20" aria-hidden="true">
                    <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                    <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                    <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z" fill="#FBBC05"/>
                    <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
                  </svg>
                  Google
                </a>
                <a href={`${BACKEND}/oauth2/authorization/github`} className="auth-social-btn auth-social-btn--github" aria-label="Sign in with GitHub">
                  <svg viewBox="0 0 24 24" width="20" height="20" fill="currentColor" aria-hidden="true">
                    <path d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z"/>
                  </svg>
                  GitHub
                </a>
              </div>

              <p className="auth-switch">
                Don't have an account?{' '}
                <Link to="/register" className="auth-switch__link">Create one</Link>
              </p>
            </>
          )}

          {/* ════ VIEW: FORGOT — enter email ════ */}
          {view === 'forgot-email' && (
            <>
              <button type="button" className="auth-back-btn" onClick={backToLogin}>
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" width="16" height="16" aria-hidden="true">
                  <polyline points="15 18 9 12 15 6" />
                </svg>
                Back to Sign In
              </button>

              <div className="auth-form-header">
                <div className="auth-step-icon auth-step-icon--blue">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="26" height="26" aria-hidden="true">
                    <rect x="2" y="4" width="20" height="16" rx="2" />
                    <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7" />
                  </svg>
                </div>
                <h2 className="auth-form-title">Reset your password</h2>
                <p className="auth-form-sub">Enter your email and we'll send a 6-digit code.</p>
              </div>

              <form className="auth-form" onSubmit={handleForgotEmail} noValidate>
                {fpError && (
                  <div className="auth-error" role="alert">
                    <svg viewBox="0 0 20 20" fill="currentColor" width="16" height="16" aria-hidden="true">
                      <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                    </svg>
                    {fpError}
                  </div>
                )}

                <div className="auth-field">
                  <label htmlFor="fp-email" className="auth-label">Email address</label>
                  <input
                    id="fp-email"
                    type="email"
                    className="auth-input"
                    placeholder="you@example.com"
                    value={fpEmail}
                    onChange={(e) => setFpEmail(e.target.value)}
                    required
                    autoFocus
                    autoComplete="email"
                  />
                </div>

                <button type="submit" className="auth-submit" disabled={fpLoading} id="fp-send-otp-btn">
                  {fpLoading ? <span className="auth-spinner" aria-label="Sending…" /> : 'Send Reset Code'}
                </button>
              </form>
            </>
          )}

          {/* ════ VIEW: FORGOT — enter OTP + new password ════ */}
          {view === 'forgot-otp' && (
            <>
              <button type="button" className="auth-back-btn" onClick={() => { setView('forgot-email'); setFpError(null); setFpSuccess(null); }}>
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" width="16" height="16" aria-hidden="true">
                  <polyline points="15 18 9 12 15 6" />
                </svg>
                Change email
              </button>

              <div className="auth-form-header">
                <div className="auth-step-icon auth-step-icon--purple">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="26" height="26" aria-hidden="true">
                    <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
                    <path d="M7 11V7a5 5 0 0 1 10 0v4" />
                  </svg>
                </div>
                <h2 className="auth-form-title">Enter your code</h2>
                <p className="auth-form-sub">
                  We sent a 6-digit code to <strong>{fpEmail}</strong>.<br />
                  It expires in 15 minutes.
                </p>
              </div>

              {fpSuccess && (
                <div className="auth-info" role="status">
                  <svg viewBox="0 0 20 20" fill="currentColor" width="16" height="16" aria-hidden="true">
                    <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                  </svg>
                  {fpSuccess}
                </div>
              )}

              <form className="auth-form" onSubmit={handleResetPassword} noValidate>
                {fpError && (
                  <div className="auth-error" role="alert">
                    <svg viewBox="0 0 20 20" fill="currentColor" width="16" height="16" aria-hidden="true">
                      <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                    </svg>
                    {fpError}
                  </div>
                )}

                <div className="auth-field">
                  <label htmlFor="fp-otp" className="auth-label">6-digit OTP code</label>
                  <input
                    id="fp-otp"
                    type="text"
                    inputMode="numeric"
                    pattern="[0-9]{6}"
                    maxLength={6}
                    className="auth-input auth-input--otp"
                    placeholder="• • • • • •"
                    value={fpOtp}
                    onChange={(e) => setFpOtp(e.target.value.replace(/\D/g, '').slice(0, 6))}
                    required
                    autoFocus
                    autoComplete="one-time-code"
                  />
                </div>

                <div className="auth-field">
                  <label htmlFor="fp-new-pass" className="auth-label">New password</label>
                  <div className="auth-input-wrap">
                    <input
                      id="fp-new-pass"
                      type={fpShowPass ? 'text' : 'password'}
                      className="auth-input auth-input--icon"
                      placeholder="At least 8 characters"
                      value={fpNewPass}
                      onChange={(e) => setFpNewPass(e.target.value)}
                      required
                      autoComplete="new-password"
                    />
                    <button type="button" className="auth-eye-btn" aria-label={fpShowPass ? 'Hide' : 'Show'} onClick={() => setFpShowPass(v => !v)}>
                      {fpShowPass ? (
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="18" height="18">
                          <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94" />
                          <path d="M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19" />
                          <line x1="1" y1="1" x2="23" y2="23" />
                        </svg>
                      ) : (
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="18" height="18">
                          <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                          <circle cx="12" cy="12" r="3" />
                        </svg>
                      )}
                    </button>
                  </div>
                </div>

                <div className="auth-field">
                  <label htmlFor="fp-confirm-pass" className="auth-label">Confirm new password</label>
                  <input
                    id="fp-confirm-pass"
                    type={fpShowPass ? 'text' : 'password'}
                    className="auth-input"
                    placeholder="Repeat your new password"
                    value={fpConfirm}
                    onChange={(e) => setFpConfirm(e.target.value)}
                    required
                    autoComplete="new-password"
                  />
                </div>

                <button type="submit" className="auth-submit" disabled={fpLoading || fpOtp.length < 6} id="fp-reset-btn">
                  {fpLoading ? <span className="auth-spinner" aria-label="Resetting…" /> : 'Reset Password'}
                </button>
              </form>

              <p className="auth-switch">
                Didn't receive it?{' '}
                <button type="button" className={`auth-switch__link auth-resend-btn${resendCool ? ' auth-resend-btn--cool' : ''}`} onClick={handleResend} disabled={resendCool}>
                  {resendCool ? 'Resent! (wait 30s)' : 'Resend code'}
                </button>
              </p>
            </>
          )}

          {/* ════ VIEW: FORGOT — success ════ */}
          {view === 'forgot-done' && (
            <div className="auth-success" role="status">
              <div className="auth-success__icon">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" width="32" height="32">
                  <polyline points="20 6 9 17 4 12" />
                </svg>
              </div>
              <h2 className="auth-form-title">Password reset!</h2>
              <p className="auth-form-sub" style={{ marginBottom: '28px' }}>
                Your password has been updated. You can now sign in with your new credentials.
              </p>
              <button type="button" className="auth-submit" onClick={backToLogin} id="fp-back-login-btn">
                Back to Sign In
              </button>
            </div>
          )}

        </div>
      </div>
    </div>
  );
}
