import { useEffect, useState, useCallback } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { apiClient, resolveProductImage } from '../lib/api';
import type { Cart, CartProduct } from '../types';

export default function CartPage() {
  const { isAuthenticated, isLoading: authLoading, setCartCount } = useAuth();
  const navigate = useNavigate();

  const [cart, setCart] = useState<Cart | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [busyItems, setBusyItems] = useState<Set<number>>(new Set());

  const fetchCart = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await apiClient.getCart();
      setCart(data);
      setCartCount(data.products?.length ?? 0);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load cart.');
    } finally {
      setLoading(false);
    }
  }, [setCartCount]);

  useEffect(() => {
    // Wait until auth has finished restoring the session from the cookie
    if (authLoading) return;
    if (!isAuthenticated) {
      navigate('/login', { state: { from: '/cart' } });
      return;
    }
    fetchCart();
  }, [authLoading, isAuthenticated, fetchCart, navigate]);

  async function handleUpdateQty(product: CartProduct, op: 'add' | 'delete') {
    setBusyItems((s) => new Set(s).add(product.productId));
    try {
      const updated = await apiClient.updateCartItem(product.productId, op);
      setCart(updated);
      setCartCount(updated.products?.length ?? 0);
    } catch {
      // silently ignore
    } finally {
      setBusyItems((s) => { const n = new Set(s); n.delete(product.productId); return n; });
    }
  }

  async function handleRemove(product: CartProduct) {
    if (!cart) return;
    setBusyItems((s) => new Set(s).add(product.productId));
    try {
      await apiClient.removeFromCart(cart.cartId, product.productId);
      await fetchCart();
    } catch {
      // silently ignore
    } finally {
      setBusyItems((s) => { const n = new Set(s); n.delete(product.productId); return n; });
    }
  }

  const items = cart?.products ?? [];
  const subtotal = items.reduce((s: number, p: CartProduct) => s + p.specialPrice * p.quantity, 0);
  const shipping = subtotal > 0 && subtotal <= 100 ? 9.99 : 0;
  const tax = subtotal * 0.0825;
  const total = subtotal + shipping + tax;

  // ── Auth still loading — wait before deciding to redirect ──────────────────
  if (authLoading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center" aria-busy="true" aria-label="Restoring session">
        <span className="w-10 h-10 rounded-full border-[3px] border-surface-high border-t-secondary animate-spin" />
      </div>
    );
  }

  // ── Main render ────────────────────────────────────────────────────────────
  return (
    <div>
      {/* Breadcrumb */}
      <div className="container">
        <nav className="flex items-center gap-1.5 pt-5 text-[0.85rem] flex-wrap" aria-label="Breadcrumb">
          <Link to="/" className="text-on-surface-variant no-underline hover:text-secondary transition-colors">Home</Link>
          <span className="text-on-surface-variant" aria-hidden="true">›</span>
          <span className="text-on-surface font-semibold" aria-current="page">Shopping Cart</span>
        </nav>
      </div>

      <div className="container grid grid-cols-1 md:grid-cols-[1fr_360px] gap-6 md:gap-10 pt-8 pb-16 items-start">
        {/* ── Main column ── */}
        <div>
          <h1 className="text-2xl font-extrabold text-on-surface tracking-tight mb-6 flex items-center gap-3">
            Shopping Cart
            {!loading && items.length > 0 && (
              <span className="text-sm font-medium text-on-surface-variant">{items.length} item{items.length !== 1 ? 's' : ''}</span>
            )}
          </h1>

          {/* Loading skeletons */}
          {loading && (
            <div className="flex flex-col gap-3" aria-busy="true">
              {[1, 2, 3].map((i) => <div key={i} className="h-[88px] bg-surface-container rounded-2xl animate-pulse" />)}
            </div>
          )}

          {/* Error */}
          {error && !loading && (
            <div className="flex flex-col items-center gap-2 py-8 text-center" role="alert">
              <p className="text-error font-semibold">{error}</p>
              <button type="button" className="mt-3 inline-flex items-center justify-center px-6 py-[13px] border-none rounded-xl bg-secondary text-on-secondary font-sans text-[0.95rem] font-bold cursor-pointer hover:bg-secondary-container hover:text-on-secondary-container active:scale-[0.97] transition-all" onClick={fetchCart}>
                Retry
              </button>
            </div>
          )}

          {/* Empty */}
          {!loading && !error && items.length === 0 && (
            <div className="flex flex-col items-center gap-4 py-16 text-on-surface-variant text-center" role="status">
              <svg viewBox="0 0 64 64" fill="none" aria-hidden="true" width="64" height="64">
                <circle cx="24" cy="56" r="4" stroke="currentColor" strokeWidth="2.5" />
                <circle cx="48" cy="56" r="4" stroke="currentColor" strokeWidth="2.5" />
                <path d="M4 6h6l8 32h28l6-22H16" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
              <p>Your cart is empty</p>
              <Link to="/products" className="mt-4 inline-flex items-center justify-center px-6 py-[13px] border-none rounded-xl bg-secondary text-on-secondary font-sans text-[0.95rem] font-bold cursor-pointer no-underline hover:bg-secondary-container hover:text-on-secondary-container active:scale-[0.97] transition-all">
                Browse products
              </Link>
            </div>
          )}

          {/* Items list */}
          {!loading && !error && items.length > 0 && (
            <ul className="flex flex-col gap-3 list-none m-0 p-0" aria-label="Cart items">
              {items.map((product: CartProduct) => {
                const busy = busyItems.has(product.productId);
                return (
                  <li key={product.productId} className="grid grid-cols-[72px_1fr] sm:grid-cols-[88px_1fr_auto_auto_auto] gap-3 sm:gap-4 items-center p-3.5 sm:p-4 bg-white border border-outline-variant rounded-2xl hover:shadow-md transition-shadow">
                    {/* Image */}
                    <div className="w-[72px] h-[72px] sm:w-[88px] sm:h-[88px] rounded-[10px] overflow-hidden bg-surface-container shrink-0">
                      {(() => { const src = resolveProductImage(product); return src ? (
                        <img
                          src={src}
                          alt={product.productName}
                          className="w-full h-full object-contain p-2"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-on-surface-variant/40" aria-hidden="true">
                          <svg viewBox="0 0 48 48" fill="none" width="32" height="32">
                            <rect x="4" y="4" width="40" height="40" rx="8" stroke="currentColor" strokeWidth="2" />
                            <circle cx="17" cy="18" r="4" stroke="currentColor" strokeWidth="2" />
                            <path d="M4 34l10-10 8 8 6-6 16 14" stroke="currentColor" strokeWidth="2" strokeLinejoin="round" />
                          </svg>
                        </div>
                      ); })()}
                    </div>

                    {/* Info */}
                    <div className="min-w-0">
                      <Link to={`/products/${product.productId}`} className="text-[0.95rem] font-bold text-on-surface no-underline hover:text-secondary transition-colors line-clamp-2">
                        {product.productName}
                      </Link>
                      <p className="text-sm text-on-surface-variant mt-0.5">${product.specialPrice.toFixed(2)} each</p>
                    </div>

                    {/* Actions row on mobile, direct columns on desktop via sm:contents */}
                    <div className="col-span-2 sm:col-span-1 sm:contents flex items-center justify-between gap-3 pt-2.5 border-t border-outline-variant/40 sm:border-t-0 sm:pt-0">
                      {/* Qty controls */}
                      <div className="flex items-center border-[1.5px] border-outline-variant rounded-[10px] overflow-hidden bg-white" role="group" aria-label={`Quantity for ${product.productName}`}>
                        <button
                          type="button"
                          className="w-[34px] h-9 border-none bg-transparent text-on-surface text-lg font-semibold cursor-pointer flex items-center justify-center hover:bg-surface-container disabled:opacity-35 disabled:cursor-not-allowed"
                          onClick={() => handleUpdateQty(product, 'delete')}
                          disabled={busy || product.quantity <= 1}
                          aria-label="Decrease quantity"
                        >−</button>
                        <span className="min-w-[32px] text-center text-[0.9rem] font-bold text-on-surface border-x-[1.5px] border-outline-variant h-9 flex items-center justify-center">{product.quantity}</span>
                        <button
                          type="button"
                          className="w-[34px] h-9 border-none bg-transparent text-on-surface text-lg font-semibold cursor-pointer flex items-center justify-center hover:bg-surface-container disabled:opacity-35 disabled:cursor-not-allowed"
                          onClick={() => handleUpdateQty(product, 'add')}
                          disabled={busy}
                          aria-label="Increase quantity"
                        >+</button>
                      </div>

                      {/* Line total */}
                      <p className="text-[0.95rem] font-extrabold text-on-surface min-w-[72px] text-right">
                        ${(product.specialPrice * product.quantity).toFixed(2)}
                      </p>

                      {/* Remove */}
                      <button
                        type="button"
                        className="w-8 h-8 border-none bg-transparent text-on-surface-variant cursor-pointer rounded-lg flex items-center justify-center hover:bg-error-container hover:text-error disabled:opacity-50 disabled:cursor-not-allowed transition-colors ml-auto sm:ml-0"
                        onClick={() => handleRemove(product)}
                        disabled={busy}
                        aria-label={`Remove ${product.productName}`}
                      >
                        {busy ? (
                          <span className="w-4 h-4 rounded-full border-2 border-current/30 border-t-current animate-spin" aria-hidden="true" />
                        ) : (
                          <svg viewBox="0 0 20 20" fill="currentColor" width="16" height="16" aria-hidden="true">
                            <path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" />
                          </svg>
                        )}
                      </button>
                    </div>
                  </li>
                );
              })}
            </ul>
          )}
        </div>

        {/* ── Order summary ── */}
        {!loading && items.length > 0 && (
          <aside className="sticky top-[calc(56px+24px)] bg-white border border-outline-variant rounded-[20px] p-6 flex flex-col gap-5">
            <h2 className="text-lg font-extrabold text-on-surface tracking-tight">Order Summary</h2>

            <dl className="flex flex-col gap-3">
              <div className="flex justify-between text-sm text-on-surface-variant">
                <dt>Subtotal</dt>
                <dd className="font-medium text-on-surface">${subtotal.toFixed(2)}</dd>
              </div>
              <div className="flex justify-between text-sm text-on-surface-variant">
                <dt>Shipping</dt>
                <dd className={`font-medium ${shipping === 0 ? 'text-green-700' : 'text-on-surface'}`}>
                  {shipping === 0 ? 'FREE' : `$${shipping.toFixed(2)}`}
                </dd>
              </div>
              <div className="flex justify-between text-sm text-on-surface-variant">
                <dt>Tax (8.25%)</dt>
                <dd className="font-medium text-on-surface">${tax.toFixed(2)}</dd>
              </div>
              <div className="flex justify-between text-base font-extrabold text-on-surface pt-3 border-t border-outline-variant">
                <dt>Total</dt>
                <dd>${total.toFixed(2)}</dd>
              </div>
            </dl>

            <button type="button" className="w-full inline-flex items-center justify-center px-6 py-[13px] border-none rounded-xl bg-secondary text-on-secondary font-sans text-[0.95rem] font-bold cursor-pointer hover:bg-secondary-container hover:text-on-secondary-container active:scale-[0.97] transition-all" onClick={() => navigate('/checkout')}>
              Proceed to Checkout
            </button>

            <p className="flex items-center justify-center gap-1.5 text-xs text-on-surface-variant">
              <svg viewBox="0 0 20 20" fill="currentColor" width="14" height="14" aria-hidden="true">
                <path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd" />
              </svg>
              Secure checkout guaranteed
            </p>

            {subtotal > 0 && subtotal < 100 && (
              <p className="text-xs text-green-700 font-semibold text-center bg-green-50 px-3 py-2 rounded-lg">
                Add ${(100 - subtotal).toFixed(2)} more for free shipping
              </p>
            )}
          </aside>
        )}
      </div>
    </div>
  );
}
