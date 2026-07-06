import { useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { apiClient, API_BASE } from '../lib/api';
import './ProductPage.css';

interface Product {
  productId: number;
  productName: string;
  image?: string;
  description: string;
  quantity: number;
  price: number;
  discount: number;
  specialPrice: number;
}

export default function ProductPage() {
  const { productId } = useParams<{ productId: string }>();
  const { isAuthenticated, setCartCount } = useAuth();
  const navigate = useNavigate();
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [qty, setQty] = useState(1);
  const [cartState, setCartState] = useState<'idle' | 'loading' | 'added' | 'error'>('idle');

  useEffect(() => {
    if (!productId) {
      setError('Product not found.');
      setLoading(false);
      return;
    }

    async function fetchProduct() {
      try {
        const res = await fetch(`${API_BASE}/api/public/products/${productId}`);
        if (!res.ok) throw new Error('Failed to load product details.');
        const data = (await res.json()) as Product;
        setProduct(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Unknown error');
      } finally {
        setLoading(false);
      }
    }

    fetchProduct();
  }, [productId]);

  async function handleAddToCart() {
    if (!isAuthenticated) {
      navigate('/login', { state: { from: `/products/${productId}` } });
      return;
    }
    if (!product) return;
    setCartState('loading');
    try {
      const cart = await apiClient.addToCart(product.productId, qty);
      setCartCount(cart.products?.length ?? 0);
      setCartState('added');
      setTimeout(() => setCartState('idle'), 2500);
    } catch {
      setCartState('error');
      setTimeout(() => setCartState('idle'), 2500);
    }
  }

  const savings = product ? product.price - product.specialPrice : 0;
  const inStock = product ? product.quantity > 0 : false;

  return (
    <div className="product-detail-page">
      {/* Breadcrumb */}
      <div className="container">
        <nav className="breadcrumb" aria-label="Breadcrumb">
          <Link to="/" className="breadcrumb__link">Home</Link>
          <span className="breadcrumb__sep" aria-hidden="true">›</span>
          <Link to="/products" className="breadcrumb__link">Products</Link>
          {product && (
            <>
              <span className="breadcrumb__sep" aria-hidden="true">›</span>
              <span className="breadcrumb__current" aria-current="page">{product.productName}</span>
            </>
          )}
        </nav>
      </div>

      <div className="container product-detail-layout">
        {/* ── Loading skeleton ── */}
        {loading && (
          <div className="product-detail-skeleton" aria-busy="true" aria-label="Loading product">
            <div className="skeleton-image" />
            <div className="skeleton-body">
              <div className="skeleton-line skeleton-line--title" />
              <div className="skeleton-line skeleton-line--short" />
              <div className="skeleton-line" />
              <div className="skeleton-line" />
              <div className="skeleton-line skeleton-line--short" />
            </div>
          </div>
        )}

        {/* ── Error state ── */}
        {error && !loading && (
          <div className="product-detail-error" role="alert">
            <p className="status-error">{error}</p>
            <Link to="/products" className="btn-secondary" style={{ marginTop: '16px', display: 'inline-block' }}>
              Back to products
            </Link>
          </div>
        )}

        {/* ── Product detail ── */}
        {product && !loading && !error && (
          <article className="product-detail">
            {/* Image panel */}
            <div className="product-detail__image-panel">
              <div className="product-detail__image-frame">
                {product.image ? (
                  <img
                    src={`${API_BASE}/api/public/products/image/${product.image}`}
                    alt={product.productName}
                    className="product-detail__img"
                  />
                ) : (
                  <div className="product-detail__no-image" aria-label="No image available">
                    <svg viewBox="0 0 48 48" fill="none" aria-hidden="true" width="64" height="64">
                      <rect x="4" y="4" width="40" height="40" rx="8" stroke="currentColor" strokeWidth="2" />
                      <circle cx="17" cy="18" r="4" stroke="currentColor" strokeWidth="2" />
                      <path d="M4 34l10-10 8 8 6-6 16 14" stroke="currentColor" strokeWidth="2" strokeLinejoin="round" />
                    </svg>
                    <p>No image available</p>
                  </div>
                )}
              </div>
            </div>

            {/* Info panel */}
            <div className="product-detail__info">
              <h1 className="product-detail__name">{product.productName}</h1>

              {/* Stock badge */}
              <span className={`stock-badge ${inStock ? 'stock-badge--in' : 'stock-badge--out'}`}>
                {inStock ? `In stock (${product.quantity} left)` : 'Out of stock'}
              </span>

              {/* Description */}
              <p className="product-detail__description">{product.description}</p>

              {/* Pricing */}
              <div className="product-detail__pricing">
                <span className="price-special">${product.specialPrice.toFixed(2)}</span>
                {product.discount > 0 && (
                  <>
                    <span className="price-original">${product.price.toFixed(2)}</span>
                    <span className="discount-badge-inline" aria-label={`${product.discount}% off`}>
                      -{product.discount}%
                    </span>
                    <span className="price-savings">You save ${savings.toFixed(2)}</span>
                  </>
                )}
              </div>

              {/* Quantity selector + Add to cart */}
              {inStock && (
                <div className="product-detail__actions">
                  <div className="qty-selector" role="group" aria-label="Quantity">
                    <button
                      type="button"
                      className="qty-btn"
                      onClick={() => setQty((q) => Math.max(1, q - 1))}
                      aria-label="Decrease quantity"
                      disabled={qty <= 1}
                    >
                      −
                    </button>
                    <span className="qty-value" aria-live="polite" aria-atomic="true">{qty}</span>
                    <button
                      type="button"
                      className="qty-btn"
                      onClick={() => setQty((q) => Math.min(product.quantity, q + 1))}
                      aria-label="Increase quantity"
                      disabled={qty >= product.quantity}
                    >
                      +
                    </button>
                  </div>

                  <button
                    type="button"
                    className={`btn-add-cart${cartState === 'added' ? ' btn-add-cart--added' : ''}${cartState === 'error' ? ' btn-add-cart--error' : ''}`}
                    onClick={handleAddToCart}
                    disabled={cartState === 'loading'}
                    aria-live="polite"
                  >
                    {cartState === 'loading' && (
                      <>
                        <span className="btn-spinner" aria-hidden="true" />
                        Adding…
                      </>
                    )}
                    {cartState === 'added' && (
                      <>
                        <svg viewBox="0 0 20 20" fill="currentColor" width="18" height="18" aria-hidden="true">
                          <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                        </svg>
                        Added to cart
                      </>
                    )}
                    {cartState === 'error' && 'Failed — try again'}
                    {cartState === 'idle' && (
                      <>
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="18" height="18" aria-hidden="true">
                          <path d="M6 2L3 6v14a2 2 0 002 2h14a2 2 0 002-2V6l-3-4z" />
                          <line x1="3" y1="6" x2="21" y2="6" />
                          <path d="M16 10a4 4 0 01-8 0" />
                        </svg>
                        {isAuthenticated ? 'Add to cart' : 'Sign in to add'}
                      </>
                    )}
                  </button>
                </div>
              )}

              {/* Product meta */}
              <dl className="product-detail__meta">
                <div className="meta-row">
                  <dt>Product ID</dt>
                  <dd>#{product.productId}</dd>
                </div>
                <div className="meta-row">
                  <dt>Price</dt>
                  <dd>${product.price.toFixed(2)}</dd>
                </div>
                {product.discount > 0 && (
                  <div className="meta-row">
                    <dt>Discount</dt>
                    <dd>{product.discount}%</dd>
                  </div>
                )}
                <div className="meta-row">
                  <dt>Availability</dt>
                  <dd>{product.quantity > 0 ? `${product.quantity} units` : 'Unavailable'}</dd>
                </div>
              </dl>
            </div>
          </article>
        )}
      </div>
    </div>
  );
}
