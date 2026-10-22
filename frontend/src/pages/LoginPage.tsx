import { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { apiClient } from '../lib/api';

// ── View states ──────────────────────────────────────────────────────────────
type View = 'login' | 'forgot-email' | 'forgot-otp' | 'forgot-done';

export default function LoginPage() {
  const navigate  = useNavigate();
  const location  = useLocation();
  const { login } = useAuth();

  // ── Login state ────────────────────────────────────────────────────────────
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPass, setShowPass] = useState(false);
  const [loading,  setLoading]  = useState(false);
  const [error,    setError]    = useState<string | null>(null);

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
  const [fpUsername,  setFpUsername]  = useState<string | null>(null);
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
      const data = await apiClient.forgotPassword(fpEmail);
      setFpUsername(data.username ?? null);
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
    setFpUsername(null);
    setError(null);
  }

  // ── Shared class strings ───────────────────────────────────────────────────
  const inputCls = (hasErr?: boolean) =>
    `w-full px-[14px] py-[11px] border-[1.5px] rounded-[10px] bg-surface text-on-surface font-sans text-[0.9rem] outline-none transition-all placeholder:text-outline ${
      hasErr
        ? 'border-red-600 focus:border-red-600 focus:ring-[3px] focus:ring-red-600/10'
        : 'border-outline-variant focus:border-secondary focus:ring-[3px] focus:ring-secondary/10'
    }`;

  const submitCls =
    'w-full py-[13px] border-none rounded-[10px] bg-secondary text-on-secondary font-sans text-[0.95rem] font-bold cursor-pointer flex items-center justify-center gap-2 mt-1 tracking-[0.01em] hover:bg-secondary-container hover:shadow-[0_4px_16px_rgba(38,77,217,0.25)] active:scale-[0.98] disabled:opacity-60 disabled:cursor-not-allowed transition-all';

  const errorCls =
    'flex items-center gap-1.5 text-[0.82rem] font-medium text-red-600 mb-0.5';

  const infoCls =
    'flex items-center gap-2 px-[14px] py-3 rounded-[10px] bg-secondary/7 border border-secondary/18 text-secondary text-[0.875rem] font-medium mb-1';

  const backBtnCls =
    'inline-flex items-center gap-1.5 bg-transparent border-none p-0 font-sans text-[0.83rem] font-semibold text-on-surface-variant cursor-pointer mb-7 hover:text-on-surface transition-colors';

  // ── Render ─────────────────────────────────────────────────────────────────
  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 min-h-[calc(100vh-var(--navbar-height,64px))]">
      {/* ── Left hero panel ── */}
      <div className="relative hidden lg:flex items-center overflow-hidden px-14 py-16"
        style={{ background: 'linear-gradient(160deg, var(--color-primary) 0%, var(--color-primary-container) 60%, #1a3a6e 100%)' }}>
        {/* decorative circles */}
        <div className="absolute w-[420px] h-[420px] rounded-full bg-white/6 pointer-events-none -bottom-[120px] -right-[100px]" />
        <div className="absolute w-[220px] h-[220px] rounded-full bg-white/6 pointer-events-none -top-[60px] -left-[60px]" />

        <div className="relative z-[1] max-w-[440px]">
          <span className="inline-flex items-center gap-1.5 px-[14px] py-[5px] rounded-full bg-white/10 border border-white/18 text-white/85 text-[0.72rem] font-bold tracking-[0.1em] uppercase mb-7">
            {view === 'login' ? 'Welcome Back' : 'Password Recovery'}
          </span>
          <h1 className="text-[2.4rem] font-extrabold text-white leading-[1.18] tracking-[-0.025em] mb-[18px]">
            {view === 'login'
              ? 'Good to see you again.'
              : "Let's get you back in."}
          </h1>
          <p className="text-white/60 text-[0.975rem] leading-[1.7] mb-11">
            {view === 'login'
              ? 'Sign in to pick up where you left off — your cart, orders, and deals are all waiting for you.'
              : "We'll send a one-time code to your email so you can securely reset your password."}
          </p>
          <ul className="list-none flex flex-col gap-[18px] p-0 m-0">
            <li className="flex items-center gap-3.5">
              <span className="w-9 h-9 rounded-[10px] bg-white/10 border border-white/14 flex items-center justify-center text-white/90 text-[0.85rem] shrink-0" aria-hidden="true">✓</span>
              <span className="text-[0.875rem] text-white/75 leading-[1.5]">Instant access to your orders &amp; wishlist</span>
            </li>
            <li className="flex items-center gap-3.5">
              <span className="w-9 h-9 rounded-[10px] bg-white/10 border border-white/14 flex items-center justify-center text-white/90 text-[0.85rem] shrink-0" aria-hidden="true">✓</span>
              <span className="text-[0.875rem] text-white/75 leading-[1.5]">Exclusive member deals and early access</span>
            </li>
            <li className="flex items-center gap-3.5">
              <span className="w-9 h-9 rounded-[10px] bg-white/10 border border-white/14 flex items-center justify-center text-white/90 text-[0.85rem] shrink-0" aria-hidden="true">✓</span>
              <span className="text-[0.875rem] text-white/75 leading-[1.5]">Secure checkout with saved addresses</span>
            </li>
          </ul>
        </div>
      </div>

      {/* ── Right form panel ── */}
      <div className="bg-surface flex items-center justify-center px-4 sm:px-10 py-8 md:py-[52px]">
        <div className="w-full max-w-[420px]">

          {/* ════ VIEW: LOGIN ════ */}
          {view === 'login' && (
            <>
              <div className="mb-7">
                <h2 className="text-[1.75rem] font-extrabold text-on-surface tracking-[-0.025em] mb-1.5 leading-[1.2]">Welcome back</h2>
                <p className="text-on-surface-variant text-[0.875rem] leading-[1.5]">Sign in to your account to continue</p>
              </div>

              <form className="flex flex-col gap-[18px] mb-5" onSubmit={handleLoginSubmit} noValidate>

                <div className="flex flex-col gap-1.5">
                  <label htmlFor="login-username" className="text-[0.82rem] font-semibold text-on-surface tracking-[0.01em]">Username</label>
                  <input
                    id="login-username"
                    type="text"
                    className={inputCls(!!error)}
                    placeholder="your_username"
                    value={username}
                    onChange={(e) => { setUsername(e.target.value); setError(null); }}
                    required
                    autoComplete="username"
                    autoFocus
                  />
                </div>

                <div className="flex flex-col gap-1.5">
                  <div className="flex items-center justify-between gap-2">
                    <label htmlFor="login-password" className="text-[0.82rem] font-semibold text-on-surface tracking-[0.01em]">Password</label>
                    <button
                      type="button"
                      className="bg-transparent border-none p-0 font-sans text-[0.8rem] font-semibold text-secondary cursor-pointer hover:opacity-75 transition-opacity"
                      onClick={() => { setError(null); setView('forgot-email'); }}
                    >
                      Forgot password?
                    </button>
                  </div>
                  <div className="relative flex items-center">
                    <input
                      id="login-password"
                      type={showPass ? 'text' : 'password'}
                      className={inputCls(!!error) + ' pr-[42px]'}
                      placeholder="••••••••"
                      value={password}
                      onChange={(e) => { setPassword(e.target.value); setError(null); }}
                      required
                      autoComplete="current-password"
                    />
                    <button
                      type="button"
                      className="absolute right-3 bg-transparent border-none p-0.5 text-on-surface-variant cursor-pointer flex items-center justify-center rounded-md hover:text-on-surface transition-colors"
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

                <button type="submit" className={submitCls} disabled={loading} id="login-submit-btn">
                  {loading ? <span className="w-[18px] h-[18px] rounded-full border-[2.5px] border-white/35 border-t-white animate-spin" aria-label="Signing in…" /> : 'Sign In'}
                </button>

                {error && (
                  <p className={errorCls} role="alert">
                    <svg viewBox="0 0 20 20" fill="currentColor" width="14" height="14" aria-hidden="true">
                      <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                    </svg>
                    Incorrect username or password. Please try again.
                  </p>
                )}
              </form>

              <p className="text-center text-[0.875rem] text-on-surface-variant mt-5">
                Don't have an account?{' '}
                <Link to="/register" className="text-secondary font-bold no-underline hover:text-secondary-container transition-colors">Create one</Link>
              </p>
            </>
          )}

          {/* ════ VIEW: FORGOT — enter email ════ */}
          {view === 'forgot-email' && (
            <>
              <button type="button" className={backBtnCls} onClick={backToLogin}>
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" width="16" height="16" aria-hidden="true">
                  <polyline points="15 18 9 12 15 6" />
                </svg>
                Back to Sign In
              </button>

              <div className="mb-7">
                <div className="w-[60px] h-[60px] rounded-[16px] bg-secondary/10 text-secondary flex items-center justify-center mb-[18px]">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="26" height="26" aria-hidden="true">
                    <rect x="2" y="4" width="20" height="16" rx="2" />
                    <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7" />
                  </svg>
                </div>
                <h2 className="text-[1.75rem] font-extrabold text-on-surface tracking-[-0.025em] mb-1.5 leading-[1.2]">Reset your password</h2>
                <p className="text-on-surface-variant text-[0.875rem] leading-[1.5]">Enter your email and we'll send a 6-digit code.</p>
              </div>

              <form className="flex flex-col gap-[18px] mb-5" onSubmit={handleForgotEmail} noValidate>
                {fpError && (
                  <div className={errorCls} role="alert">
                    <svg viewBox="0 0 20 20" fill="currentColor" width="16" height="16" aria-hidden="true">
                      <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                    </svg>
                    {fpError}
                  </div>
                )}

                <div className="flex flex-col gap-1.5">
                  <label htmlFor="fp-email" className="text-[0.82rem] font-semibold text-on-surface tracking-[0.01em]">Email address</label>
                  <input
                    id="fp-email"
                    type="email"
                    className={inputCls()}
                    placeholder="you@example.com"
                    value={fpEmail}
                    onChange={(e) => setFpEmail(e.target.value)}
                    required
                    autoFocus
                    autoComplete="email"
                  />
                </div>

                <button type="submit" className={submitCls} disabled={fpLoading} id="fp-send-otp-btn">
                  {fpLoading ? <span className="w-[18px] h-[18px] rounded-full border-[2.5px] border-white/35 border-t-white animate-spin" aria-label="Sending…" /> : 'Send Reset Code'}
                </button>
              </form>
            </>
          )}

          {/* ════ VIEW: FORGOT — enter OTP + new password ════ */}
          {view === 'forgot-otp' && (
            <>
              <button type="button" className={backBtnCls} onClick={() => { setView('forgot-email'); setFpError(null); setFpSuccess(null); }}>
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" width="16" height="16" aria-hidden="true">
                  <polyline points="15 18 9 12 15 6" />
                </svg>
                Change email
              </button>

              <div className="mb-7">
                <div className="w-[60px] h-[60px] rounded-[16px] bg-purple-500/10 text-purple-700 flex items-center justify-center mb-[18px]">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="26" height="26" aria-hidden="true">
                    <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
                    <path d="M7 11V7a5 5 0 0 1 10 0v4" />
                  </svg>
                </div>
                <h2 className="text-[1.75rem] font-extrabold text-on-surface tracking-[-0.025em] mb-1.5 leading-[1.2]">Enter your code</h2>
                <p className="text-on-surface-variant text-[0.875rem] leading-[1.5]">
                  We sent a 6-digit code to <strong>{fpEmail}</strong>.<br />
                  It expires in 15 minutes.
                </p>
                {fpUsername && (
                  <p className="mt-2 text-[0.82rem] text-on-surface-variant">
                    Account: <span className="font-semibold text-on-surface">{fpUsername}</span>
                  </p>
                )}
              </div>

              {fpSuccess && (
                <div className={infoCls} role="status">
                  <svg viewBox="0 0 20 20" fill="currentColor" width="16" height="16" aria-hidden="true">
                    <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                  </svg>
                  {fpSuccess}
                </div>
              )}

              <form className="flex flex-col gap-[18px] mb-5" onSubmit={handleResetPassword} noValidate>
                {fpError && (
                  <div className={errorCls} role="alert">
                    <svg viewBox="0 0 20 20" fill="currentColor" width="16" height="16" aria-hidden="true">
                      <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                    </svg>
                    {fpError}
                  </div>
                )}

                <div className="flex flex-col gap-1.5">
                  <label htmlFor="fp-otp" className="text-[0.82rem] font-semibold text-on-surface tracking-[0.01em]">6-digit OTP code</label>
                  <input
                    id="fp-otp"
                    type="text"
                    inputMode="numeric"
                    pattern="[0-9]{6}"
                    maxLength={6}
                    className={inputCls() + ' text-center text-[1.35rem] tracking-[0.35em] font-bold font-mono py-[14px] px-5'}
                    placeholder="• • • • • •"
                    value={fpOtp}
                    onChange={(e) => setFpOtp(e.target.value.replace(/\D/g, '').slice(0, 6))}
                    required
                    autoFocus
                    autoComplete="one-time-code"
                  />
                </div>

                <div className="flex flex-col gap-1.5">
                  <label htmlFor="fp-new-pass" className="text-[0.82rem] font-semibold text-on-surface tracking-[0.01em]">New password</label>
                  <div className="relative flex items-center">
                    <input
                      id="fp-new-pass"
                      type={fpShowPass ? 'text' : 'password'}
                      className={inputCls() + ' pr-[42px]'}
                      placeholder="At least 8 characters"
                      value={fpNewPass}
                      onChange={(e) => setFpNewPass(e.target.value)}
                      required
                      autoComplete="new-password"
                    />
                    <button type="button" className="absolute right-3 bg-transparent border-none p-0.5 text-on-surface-variant cursor-pointer flex items-center justify-center rounded-md hover:text-on-surface transition-colors" aria-label={fpShowPass ? 'Hide' : 'Show'} onClick={() => setFpShowPass(v => !v)}>
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

                <div className="flex flex-col gap-1.5">
                  <label htmlFor="fp-confirm-pass" className="text-[0.82rem] font-semibold text-on-surface tracking-[0.01em]">Confirm new password</label>
                  <input
                    id="fp-confirm-pass"
                    type={fpShowPass ? 'text' : 'password'}
                    className={inputCls()}
                    placeholder="Repeat your new password"
                    value={fpConfirm}
                    onChange={(e) => setFpConfirm(e.target.value)}
                    required
                    autoComplete="new-password"
                  />
                </div>

                <button type="submit" className={submitCls} disabled={fpLoading || fpOtp.length < 6} id="fp-reset-btn">
                  {fpLoading ? <span className="w-[18px] h-[18px] rounded-full border-[2.5px] border-white/35 border-t-white animate-spin" aria-label="Resetting…" /> : 'Reset Password'}
                </button>
              </form>

              <p className="text-center text-[0.875rem] text-on-surface-variant mt-5">
                Didn't receive it?{' '}
                <button
                  type="button"
                  className={`bg-transparent border-none p-0 font-sans font-bold text-secondary cursor-pointer hover:text-secondary-container transition-colors ${resendCool ? 'opacity-50 cursor-default' : ''}`}
                  onClick={handleResend}
                  disabled={resendCool}
                >
                  {resendCool ? 'Resent! (wait 30s)' : 'Resend code'}
                </button>
              </p>
            </>
          )}

          {/* ════ VIEW: FORGOT — success ════ */}
          {view === 'forgot-done' && (
            <div className="text-center py-12" role="status">
              <div className="w-[68px] h-[68px] rounded-full bg-green-100 text-green-600 flex items-center justify-center mx-auto mb-[22px]">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" width="32" height="32">
                  <polyline points="20 6 9 17 4 12" />
                </svg>
              </div>
              <h2 className="text-[1.75rem] font-extrabold text-on-surface tracking-[-0.025em] mb-1.5 leading-[1.2]">Password reset!</h2>
              <p className="text-on-surface-variant text-[0.875rem] leading-[1.5] mb-7">
                Your password has been updated. You can now sign in with your new credentials.
              </p>
              <button type="button" className={submitCls} onClick={backToLogin} id="fp-back-login-btn">
                Back to Sign In
              </button>
            </div>
          )}

        </div>
      </div>
    </div>
  );
}
