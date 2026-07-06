import { useEffect, useState, useCallback } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { apiClient, API_BASE, type Cart, type CartProduct } from '../lib/api';
import './CartPage.css';

export default function CartPage() {
  const { isAuthenticated, isLoading: authLoading, setCartCount } = useAuth();
  const navigate = useNavigate();

  const [cart, setCart] = useState<Cart | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [busyItems, setBusyItems] = useState<Set<number>>(new Set());
  const [promoCode, setPromoCode] = useState('');

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
  const subtotal = items.reduce((s, p) => s + p.specialPrice * p.quantity, 0);
  const shipping = subtotal > 0 && subtotal <= 100 ? 9.99 : 0;
  const tax = subtotal * 0.0825;
  const total = subtotal + shipping + tax;

  // ── Auth still loading — wait before deciding to redirect ──────────────────
  if (authLoading) {
    return (
      <div className="cart-auth-loading" aria-busy="true" aria-label="Restoring session">
        <span className="cart-page-spinner" />
      </div>
    );
  }

  // ── Main render ────────────────────────────────────────────────────────────
  return (
    <div className="cart-page">
      {/* Breadcrumb */}
      <div className="container">
        <nav className="breadcrumb" aria-label="Breadcrumb">
          <Link to="/" className="breadcrumb__link">Home</Link>
          <span className="breadcrumb__sep" aria-hidden="true">›</span>
          <span className="breadcrumb__current" aria-current="page">Shopping Cart</span>
        </nav>
      </div>

      <div className="container cart-layout">
        {/* ── Main column ── */}
        <div className="cart-main">
          <h1 className="cart-title">
            Shopping Cart
            {!loading && items.length > 0 && (
              <span className="cart-count">{items.length} item{items.length !== 1 ? 's' : ''}</span>
            )}
          </h1>

          {/* Loading skeletons */}
          {loading && (
            <div className="cart-skeletons" aria-busy="true">
              {[1, 2, 3].map((i) => <div key={i} className="cart-item-skeleton" />)}
            </div>
          )}

          {/* Error */}
          {error && !loading && (
            <div className="cart-empty" role="alert">
              <p className="status-error">{error}</p>
              <button type="button" className="cart-btn-primary" onClick={fetchCart} style={{ marginTop: 12 }}>
                Retry
              </button>
            </div>
          )}

          {/* Empty */}
          {!loading && !error && items.length === 0 && (
            <div className="cart-empty" role="status">
              <svg viewBox="0 0 64 64" fill="none" aria-hidden="true" width="64" height="64">
                <circle cx="24" cy="56" r="4" stroke="currentColor" strokeWidth="2.5" />
                <circle cx="48" cy="56" r="4" stroke="currentColor" strokeWidth="2.5" />
                <path d="M4 6h6l8 32h28l6-22H16" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
              <p>Your cart is empty</p>
              <Link to="/products" className="cart-btn-primary" style={{ marginTop: 16, display: 'inline-block' }}>
                Browse products
              </Link>
            </div>
          )}

          {/* Items list */}
          {!loading && !error && items.length > 0 && (
            <ul className="cart-items" aria-label="Cart items">
              {items.map((product) => {
                const busy = busyItems.has(product.productId);
                return (
                  <li key={product.productId} className="cart-item">
                    {/* Image */}
                    <div className="cart-item__img-wrap">
                      {product.image ? (
                        <img
                          src={`${API_BASE}/api/public/products/image/${product.image}`}
                          alt={product.productName}
                          className="cart-item__img"
                        />
                      ) : (
                        <div className="cart-item__img-placeholder" aria-hidden="true">
                          <svg viewBox="0 0 48 48" fill="none" width="32" height="32">
                            <rect x="4" y="4" width="40" height="40" rx="8" stroke="currentColor" strokeWidth="2" />
                            <circle cx="17" cy="18" r="4" stroke="currentColor" strokeWidth="2" />
                            <path d="M4 34l10-10 8 8 6-6 16 14" stroke="currentColor" strokeWidth="2" strokeLinejoin="round" />
                          </svg>
                        </div>
                      )}
                    </div>

                    {/* Info */}
                    <div className="cart-item__info">
                      <Link to={`/products/${product.productId}`} className="cart-item__name">
                        {product.productName}
                      </Link>
                      <p className="cart-item__unit-price">${product.specialPrice.toFixed(2)} each</p>
                    </div>

                    {/* Qty controls */}
                    <div className="cart-item__qty" role="group" aria-label={`Quantity for ${product.productName}`}>
                      <button
                        type="button"
                        className="qty-btn"
                        onClick={() => handleUpdateQty(product, 'delete')}
                        disabled={busy || product.quantity <= 1}
                        aria-label="Decrease quantity"
                      >−</button>
                      <span className="qty-value">{product.quantity}</span>
                      <button
                        type="button"
                        className="qty-btn"
                        onClick={() => handleUpdateQty(product, 'add')}
                        disabled={busy}
                        aria-label="Increase quantity"
                      >+</button>
                    </div>

                    {/* Line total */}
                    <p className="cart-item__total">
                      ${(product.specialPrice * product.quantity).toFixed(2)}
                    </p>

                    {/* Remove */}
                    <button
                      type="button"
                      className="cart-item__remove"
                      onClick={() => handleRemove(product)}
                      disabled={busy}
                      aria-label={`Remove ${product.productName}`}
                    >
                      {busy ? (
                        <span className="cart-spinner" aria-hidden="true" />
                      ) : (
                        <svg viewBox="0 0 20 20" fill="currentColor" width="16" height="16" aria-hidden="true">
                          <path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" />
                        </svg>
                      )}
                    </button>
                  </li>
                );
              })}
            </ul>
          )}
        </div>

        {/* ── Order summary ── */}
        {!loading && items.length > 0 && (
          <aside className="cart-summary">
            <h2 className="cart-summary__title">Order Summary</h2>

            <dl className="cart-summary__rows">
              <div className="cart-summary__row">
                <dt>Subtotal</dt>
                <dd>${subtotal.toFixed(2)}</dd>
              </div>
              <div className="cart-summary__row">
                <dt>Shipping</dt>
                <dd className={shipping === 0 ? 'cart-summary__free' : ''}>
                  {shipping === 0 ? 'FREE' : `$${shipping.toFixed(2)}`}
                </dd>
              </div>
              <div className="cart-summary__row">
                <dt>Tax (8.25%)</dt>
                <dd>${tax.toFixed(2)}</dd>
              </div>
              <div className="cart-summary__row cart-summary__row--total">
                <dt>Total</dt>
                <dd>${total.toFixed(2)}</dd>
              </div>
            </dl>

            {/* Promo code */}
            <div className="cart-promo">
              <label htmlFor="promo-input" className="cart-promo__label">Promo code</label>
              <div className="cart-promo__row">
                <input
                  id="promo-input"
                  type="text"
                  className="cart-promo__input"
                  placeholder="Enter code"
                  value={promoCode}
                  onChange={(e) => setPromoCode(e.target.value)}
                />
                <button type="button" className="cart-promo__btn">Apply</button>
              </div>
            </div>

            <button type="button" className="cart-btn-primary cart-checkout-btn">
              Proceed to Checkout
            </button>

            <p className="cart-secure">
              <svg viewBox="0 0 20 20" fill="currentColor" width="14" height="14" aria-hidden="true">
                <path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd" />
              </svg>
              Secure checkout guaranteed
            </p>

            {subtotal > 0 && subtotal < 100 && (
              <p className="cart-free-shipping-hint">
                Add ${(100 - subtotal).toFixed(2)} more for free shipping
              </p>
            )}
          </aside>
        )}
      </div>
    </div>
  );
}
