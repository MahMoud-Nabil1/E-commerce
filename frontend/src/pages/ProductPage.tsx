import { useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { apiClient, resolveProductImage } from '../lib/api';
import type { Product } from '../types';
import ProductReviews from '../components/ProductReviews';

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
        const data = await apiClient.getProductById(productId!);
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

  // Build the ordered gallery: images[] takes priority, falls back to single image field.
  const gallery: string[] = product
    ? (product.images && product.images.length > 0
        ? product.images
        : product.image && product.image !== 'default.png' ? [product.image] : [])
    : [];

  const [selectedImg, setSelectedImg] = useState<string | null>(null);
  // Keep selectedImg in sync when the product first loads (or changes).
  useEffect(() => { setSelectedImg(gallery[0] ?? null); }, [product?.productId]); // eslint-disable-line

  const resolveUrl = (url: string) =>
    url.startsWith('http') ? url : `${resolveProductImage({ image: url }) ?? url}`;

  return (
    <div>
      {/* Breadcrumb */}
      <div className="container">
        <nav className="flex items-center gap-1.5 pt-5 text-[0.85rem] flex-wrap" aria-label="Breadcrumb">
          <Link to="/" className="text-on-surface-variant no-underline hover:text-secondary transition-colors">Home</Link>
          <span className="text-on-surface-variant" aria-hidden="true">›</span>
          <Link to="/products" className="text-on-surface-variant no-underline hover:text-secondary transition-colors">Products</Link>
          {product && (
            <>
              <span className="text-on-surface-variant" aria-hidden="true">›</span>
              <span className="text-on-surface font-semibold whitespace-nowrap overflow-hidden text-ellipsis max-w-[260px]" aria-current="page">{product.productName}</span>
            </>
          )}
        </nav>
      </div>

      <div className="container py-8">
        {/* ── Loading skeleton ── */}
        {loading && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-14 items-start animate-pulse" aria-busy="true" aria-label="Loading product">
            <div className="aspect-square rounded-3xl bg-surface-container" />
            <div className="flex flex-col gap-4">
              <div className="h-10 bg-surface-container rounded-xl w-3/4" />
              <div className="h-6 bg-surface-container rounded-xl w-1/4" />
              <div className="h-4 bg-surface-container rounded-xl" />
              <div className="h-4 bg-surface-container rounded-xl" />
              <div className="h-4 bg-surface-container rounded-xl w-2/3" />
            </div>
          </div>
        )}

        {/* ── Error state ── */}
        {error && !loading && (
          <div className="flex flex-col items-center gap-4 py-16 text-center" role="alert">
            <p className="text-error font-semibold">{error}</p>
            <Link to="/products" className="mt-4 inline-block px-6 py-3 rounded-xl bg-surface-container text-on-surface font-bold no-underline hover:bg-surface-high transition-colors">
              Back to products
            </Link>
          </div>
        )}

        {/* ── Product detail ── */}
        {product && !loading && !error && (
          <>
            <article className="grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-14 items-start">
              {/* Image panel */}
              <div className="flex flex-col gap-3">
                {/* Main viewer */}
                <div className="aspect-square max-h-[460px] sm:max-h-[320px] mx-auto w-full rounded-3xl overflow-hidden bg-surface-container border border-outline-variant flex items-center justify-center">
                  {selectedImg ? (
                    <img
                      src={resolveUrl(selectedImg)}
                      alt={product.productName}
                      className="w-full h-full object-contain p-6 sm:p-4"
                    />
                  ) : (
                    <div className="flex flex-col items-center gap-2 text-on-surface-variant" aria-label="No image available">
                      <svg viewBox="0 0 48 48" fill="none" aria-hidden="true" width="64" height="64">
                        <rect x="4" y="4" width="40" height="40" rx="8" stroke="currentColor" strokeWidth="2" />
                        <circle cx="17" cy="18" r="4" stroke="currentColor" strokeWidth="2" />
                        <path d="M4 34l10-10 8 8 6-6 16 14" stroke="currentColor" strokeWidth="2" strokeLinejoin="round" />
                      </svg>
                      <p className="text-sm">No image available</p>
                    </div>
                  )}
                </div>

                {/* Thumbnail strip — only shown when there are 2+ images */}
                {gallery.length > 1 && (
                  <div className="flex gap-2 overflow-x-auto py-0.5 pb-1.5 scrollbar-thin" role="list" aria-label="Product images">
                    {gallery.map((url, i) => (
                      <button
                        key={i}
                        type="button"
                        role="listitem"
                        className={`w-[68px] h-[68px] sm:w-[52px] sm:h-[52px] shrink-0 rounded-[10px] border-2 overflow-hidden cursor-pointer bg-surface-container hover:border-on-surface-variant transition-colors ${selectedImg === url ? 'border-secondary ring-2 ring-secondary/25' : 'border-outline-variant'}`}
                        onClick={() => setSelectedImg(url)}
                        aria-label={`View image ${i + 1}`}
                        aria-pressed={selectedImg === url}
                      >
                        <img src={resolveUrl(url)} alt={`${product.productName} ${i + 1}`} className="w-full h-full object-contain" />
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* Info panel */}
              <div className="flex flex-col gap-4">
                <h1 className="text-[2rem] font-extrabold leading-snug tracking-tight text-on-surface m-0 md:text-[1.6rem] sm:text-[1.35rem]">{product.productName}</h1>

                {/* Stock badge */}
                <span className={inStock
                  ? 'inline-block px-[14px] py-[5px] rounded-full text-[0.8rem] font-bold tracking-wider bg-green-100 text-green-800 w-fit'
                  : 'inline-block px-[14px] py-[5px] rounded-full text-[0.8rem] font-bold tracking-wider bg-error-container text-on-error-container w-fit'
                }>
                  {inStock ? `In stock (${product.quantity} left)` : 'Out of stock'}
                </span>

                {/* Description */}
                <p className="text-on-surface-variant leading-relaxed text-[0.95rem] sm:text-[0.875rem]">{product.description}</p>

                {/* Pricing */}
                <div className="flex items-baseline gap-3 flex-wrap">
                  <span className="text-[2.25rem] font-extrabold text-on-surface tracking-tight md:text-[1.75rem] sm:text-[1.5rem]">${product.specialPrice.toFixed(2)}</span>
                  {product.discount > 0 && (
                    <>
                      <span className="text-[1.1rem] sm:text-[0.95rem] font-medium text-on-surface-variant line-through">${product.price.toFixed(2)}</span>
                      <span className="text-[0.8rem] font-bold text-on-surface bg-surface-container px-2 py-0.5 rounded-full" aria-label={`${product.discount}% off`}>
                        -{product.discount}%
                      </span>
                      <span className="text-[0.85rem] sm:text-[0.75rem] font-bold text-green-700 bg-green-100 px-2.5 py-0.5 rounded-full">You save ${savings.toFixed(2)}</span>
                    </>
                  )}
                </div>

                {/* Quantity selector + Add to cart */}
                {inStock && (
                  <div className="flex items-center gap-4 flex-wrap sm:flex-col sm:items-stretch sm:gap-3">
                    <div className="flex items-center border-[1.5px] border-outline-variant rounded-xl overflow-hidden bg-white sm:w-full sm:justify-between" role="group" aria-label="Quantity">
                      <button
                        type="button"
                        className="w-10 h-11 border-none bg-transparent text-on-surface text-xl font-semibold cursor-pointer flex items-center justify-center hover:bg-surface-container disabled:opacity-35 disabled:cursor-not-allowed sm:flex-1"
                        onClick={() => setQty((q) => Math.max(1, q - 1))}
                        aria-label="Decrease quantity"
                        disabled={qty <= 1}
                      >
                        −
                      </button>
                      <span className="min-w-[44px] text-center text-[0.95rem] font-bold text-on-surface border-x-[1.5px] border-outline-variant h-11 flex items-center justify-center" aria-live="polite" aria-atomic="true">{qty}</span>
                      <button
                        type="button"
                        className="w-10 h-11 border-none bg-transparent text-on-surface text-xl font-semibold cursor-pointer flex items-center justify-center hover:bg-surface-container disabled:opacity-35 disabled:cursor-not-allowed sm:flex-1"
                        onClick={() => setQty((q) => Math.min(product.quantity, q + 1))}
                        aria-label="Increase quantity"
                        disabled={qty >= product.quantity}
                      >
                        +
                      </button>
                    </div>

                    <button
                      type="button"
                      className={`flex-1 min-w-[180px] sm:w-full sm:py-3.5 inline-flex items-center justify-center gap-2 px-6 py-3 border-none rounded-xl font-sans text-[0.95rem] font-bold cursor-pointer transition-all active:scale-[0.97] disabled:opacity-60 disabled:cursor-not-allowed ${
                        cartState === 'added' ? 'bg-green-600 text-white hover:bg-green-700' :
                        cartState === 'error' ? 'bg-error text-on-error' :
                        'bg-secondary text-on-secondary hover:bg-secondary-container'
                      }`}
                      onClick={handleAddToCart}
                      disabled={cartState === 'loading'}
                      aria-live="polite"
                    >
                      {cartState === 'loading' && (
                        <>
                          <span className="w-4 h-4 rounded-full border-2 border-white/30 border-t-white animate-spin" aria-hidden="true" />
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
                <dl className="flex flex-col gap-2 mt-2 border-t border-outline-variant pt-4">
                  <div className="flex gap-4 text-sm">
                    <dt className="text-on-surface-variant min-w-[100px]">Product ID</dt>
                    <dd className="text-on-surface font-medium">#{product.productId}</dd>
                  </div>
                  <div className="flex gap-4 text-sm">
                    <dt className="text-on-surface-variant min-w-[100px]">Price</dt>
                    <dd className="text-on-surface font-medium">${product.price.toFixed(2)}</dd>
                  </div>
                  {product.discount > 0 && (
                    <div className="flex gap-4 text-sm">
                      <dt className="text-on-surface-variant min-w-[100px]">Discount</dt>
                      <dd className="text-on-surface font-medium">{product.discount}%</dd>
                    </div>
                  )}
                  <div className="flex gap-4 text-sm">
                    <dt className="text-on-surface-variant min-w-[100px]">Availability</dt>
                    <dd className="text-on-surface font-medium">{product.quantity > 0 ? `${product.quantity} units` : 'Unavailable'}</dd>
                  </div>
                </dl>
              </div>
            </article>

            {/* Reviews section */}
            <ProductReviews productId={product.productId} />
          </>
        )}
      </div>
    </div>
  );
}
