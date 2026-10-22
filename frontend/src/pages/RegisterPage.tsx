import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

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

  // ── Shared class strings ───────────────────────────────────────────────────
  const inputCls =
    'w-full px-[14px] py-[11px] border-[1.5px] border-outline-variant rounded-[10px] bg-surface text-on-surface font-sans text-[0.9rem] outline-none transition-all placeholder:text-outline focus:border-secondary focus:ring-[3px] focus:ring-secondary/10';

  const submitCls = (isSeller: boolean) =>
    `w-full py-[13px] border-none rounded-[10px] font-sans text-[0.95rem] font-bold cursor-pointer flex items-center justify-center gap-2 mt-1 tracking-[0.01em] active:scale-[0.98] disabled:opacity-60 disabled:cursor-not-allowed transition-all ${
      isSeller
        ? 'bg-[#0f5132] text-white hover:bg-[#0a3d26] hover:shadow-[0_4px_16px_rgba(15,81,50,0.28)]'
        : 'bg-secondary text-on-secondary hover:bg-secondary-container hover:shadow-[0_4px_16px_rgba(38,77,217,0.25)]'
    }`;

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
            {accountType === 'seller' ? 'Sell on ShopFlow' : 'Join Now'}
          </span>
          <h1 className="text-[2.4rem] font-extrabold text-white leading-[1.18] tracking-[-0.025em] mb-[18px]">
            {accountType === 'seller'
              ? 'Start growing your business with ShopFlow.'
              : 'Join millions of happy shoppers worldwide.'}
          </h1>
          <p className="text-white/60 text-[0.975rem] leading-[1.7] mb-11">
            {accountType === 'seller'
              ? 'List products, manage inventory, and reach customers everywhere.'
              : 'Create a free account to track orders, save favorites, and get exclusive deals.'}
          </p>

          <ul className="list-none flex flex-col gap-[18px] p-0 m-0">
            <li className="flex items-center gap-3.5">
              <span className="w-9 h-9 rounded-[10px] bg-white/10 border border-white/14 flex items-center justify-center text-white/90 text-[0.85rem] shrink-0" aria-hidden="true">✓</span>
              <span className="text-[0.875rem] text-white/75 leading-[1.5]">
                {accountType === 'seller'
                  ? 'Real-time sales dashboard & analytics'
                  : 'Fast checkout & order tracking'}
              </span>
            </li>
            <li className="flex items-center gap-3.5">
              <span className="w-9 h-9 rounded-[10px] bg-white/10 border border-white/14 flex items-center justify-center text-white/90 text-[0.85rem] shrink-0" aria-hidden="true">✓</span>
              <span className="text-[0.875rem] text-white/75 leading-[1.5]">
                {accountType === 'seller'
                  ? 'Integrated payment processing with Stripe'
                  : 'Curated deals and personalized recommendations'}
              </span>
            </li>
            <li className="flex items-center gap-3.5">
              <span className="w-9 h-9 rounded-[10px] bg-white/10 border border-white/14 flex items-center justify-center text-white/90 text-[0.85rem] shrink-0" aria-hidden="true">✓</span>
              <span className="text-[0.875rem] text-white/75 leading-[1.5]">
                {accountType === 'seller'
                  ? 'Dedicated seller support team'
                  : '24/7 customer support & easy returns'}
              </span>
            </li>
          </ul>
        </div>
      </div>

      {/* ── Right form panel ── */}
      <div className="bg-surface flex items-center justify-center px-4 sm:px-10 py-8 md:py-[52px]">
        <div className="w-full max-w-[420px]">
          {success ? (
            <div className="text-center py-12" role="status">
              <div className="w-[68px] h-[68px] rounded-full bg-green-100 text-green-600 flex items-center justify-center mx-auto mb-[22px]">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" width="32" height="32">
                  <polyline points="20 6 9 17 4 12" />
                </svg>
              </div>
              <h2 className="text-[1.75rem] font-extrabold text-on-surface tracking-[-0.025em] mb-1.5 leading-[1.2]">Account Created!</h2>
              <p className="text-on-surface-variant text-[0.875rem] leading-[1.5] mb-6">Your account is ready. Redirecting you to sign in…</p>
              <Link to="/login" className="block w-full py-[13px] border-none rounded-[10px] bg-secondary text-on-secondary font-bold text-[0.95rem] text-center no-underline hover:bg-secondary-container transition-all mt-6">
                Sign In Now
              </Link>
            </div>
          ) : (
            <>
              {/* Account type selector */}
              <div className="flex gap-0 mb-8 bg-surface-low rounded-xl p-1" role="tablist">
                <button
                  type="button"
                  role="tab"
                  aria-selected={accountType === 'user'}
                  className={`flex-1 py-[9px] px-4 border-none rounded-[9px] font-sans text-[0.845rem] font-semibold cursor-pointer transition-all whitespace-nowrap ${
                    accountType === 'user'
                      ? 'bg-surface text-secondary shadow-[0_1px_5px_rgba(0,0,0,0.10)]'
                      : 'bg-transparent text-on-surface-variant hover:bg-surface-container hover:text-on-surface'
                  }`}
                  onClick={() => setAccountType('user')}
                  id="tab-customer"
                >
                  Customer Account
                </button>
                <button
                  type="button"
                  role="tab"
                  aria-selected={accountType === 'seller'}
                  className={`flex-1 py-[9px] px-4 border-none rounded-[9px] font-sans text-[0.845rem] font-semibold cursor-pointer transition-all whitespace-nowrap ${
                    accountType === 'seller'
                      ? 'bg-surface text-secondary shadow-[0_1px_5px_rgba(0,0,0,0.10)]'
                      : 'bg-transparent text-on-surface-variant hover:bg-surface-container hover:text-on-surface'
                  }`}
                  onClick={() => setAccountType('seller')}
                  id="tab-seller"
                >
                  Seller Account
                </button>
              </div>

              <div className="mb-7">
                <h2 className="text-[1.75rem] font-extrabold text-on-surface tracking-[-0.025em] mb-1.5 leading-[1.2]">
                  {accountType === 'seller' ? 'Create Seller Account' : 'Create an Account'}
                </h2>
                <p className="text-on-surface-variant text-[0.875rem] leading-[1.5]">
                  {accountType === 'seller'
                    ? 'Start selling to millions of shoppers today.'
                    : 'Fill in your details below to get started.'}
                </p>
              </div>

              {error && (
                <div className="flex items-center gap-1.5 text-[0.82rem] font-medium text-red-600 mb-3" role="alert">
                  <svg viewBox="0 0 20 20" fill="currentColor" width="16" height="16" aria-hidden="true">
                    <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                  </svg>
                  {error}
                </div>
              )}

              <form className="flex flex-col gap-[18px] mb-5" onSubmit={handleRegisterSubmit} noValidate>
                <div className="flex flex-col gap-1.5">
                  <label htmlFor="reg-username" className="text-[0.82rem] font-semibold text-on-surface tracking-[0.01em]">Username</label>
                  <input
                    id="reg-username"
                    name="username"
                    type="text"
                    className={inputCls}
                    placeholder="johndoe"
                    value={form.username}
                    onChange={handleChange}
                    required
                    autoComplete="username"
                    autoFocus
                  />
                </div>

                <div className="flex flex-col gap-1.5">
                  <label htmlFor="reg-email" className="text-[0.82rem] font-semibold text-on-surface tracking-[0.01em]">Email address</label>
                  <input
                    id="reg-email"
                    name="email"
                    type="email"
                    className={inputCls}
                    placeholder="john@example.com"
                    value={form.email}
                    onChange={handleChange}
                    required
                    autoComplete="email"
                  />
                </div>

                <div className="flex flex-col gap-1.5">
                  <label htmlFor="reg-password" className="text-[0.82rem] font-semibold text-on-surface tracking-[0.01em]">Password</label>
                  <input
                    id="reg-password"
                    name="password"
                    type="password"
                    className={inputCls}
                    placeholder="••••••••"
                    value={form.password}
                    onChange={handleChange}
                    required
                    autoComplete="new-password"
                  />
                  {form.password.length > 0 && (
                    <ul className="list-none p-0 mt-2 flex flex-col gap-1" aria-label="Password requirements">
                      {pwReqs.map((r) => (
                        <li key={r.label} className={`flex items-center gap-2 text-[0.78rem] ${r.met ? 'text-green-700' : 'text-on-surface-variant'}`}>
                          <span aria-hidden="true">{r.met ? '✓' : '○'}</span>
                          {r.label}
                        </li>
                      ))}
                    </ul>
                  )}
                </div>

                <div className="flex flex-col gap-1.5">
                  <label htmlFor="reg-confirm" className="text-[0.82rem] font-semibold text-on-surface tracking-[0.01em]">Confirm password</label>
                  <input
                    id="reg-confirm"
                    name="confirm"
                    type="password"
                    className={inputCls}
                    placeholder="••••••••"
                    value={form.confirm}
                    onChange={handleChange}
                    required
                    autoComplete="new-password"
                  />
                </div>

                <button
                  type="submit"
                  className={submitCls(accountType === 'seller')}
                  disabled={loading}
                  id="reg-submit-btn"
                >
                  {loading
                    ? <span className="w-[18px] h-[18px] rounded-full border-[2.5px] border-white/35 border-t-white animate-spin" aria-label="Creating account…" />
                    : accountType === 'seller' ? 'Create Seller Account' : 'Create Account'}
                </button>
              </form>

              <p className="text-center text-[0.875rem] text-on-surface-variant mt-5">
                Already have an account?{' '}
                <Link to="/login" className="text-secondary font-bold no-underline hover:text-secondary-container transition-colors">Sign in</Link>
              </p>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
