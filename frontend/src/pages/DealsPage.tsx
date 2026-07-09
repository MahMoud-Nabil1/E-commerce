import { useEffect, useState, useCallback } from 'react';
import { useSearchParams } from 'react-router-dom';
import ProductCard from '../components/ProductCard';
import { apiClient } from '../lib/api';
import type { Product } from '../types';
import './DealsPage.css';



const PAGE_SIZE = 12;

const DISCOUNT_TIERS = [
  { label: 'All Deals', min: 1 },
  { label: '10%+ off',  min: 10 },
  { label: '20%+ off',  min: 20 },
  { label: '30%+ off',  min: 30 },
  { label: '50%+ off',  min: 50 },
];

export default function DealsPage() {
  const [searchParams, setSearchParams] = useSearchParams();

  const [allDeals, setAllDeals]         = useState<Product[]>([]);
  const [displayed, setDisplayed]       = useState<Product[]>([]);
  const [totalElements, setTotalElements] = useState(0);
  const [totalPages, setTotalPages]     = useState(0);
  const [loading, setLoading]           = useState(true);
  const [error, setError]               = useState<string | null>(null);
  const [sidebarOpen, setSidebarOpen]   = useState(false);

  const page      = parseInt(searchParams.get('page') ?? '0', 10);
  const minDisc   = parseInt(searchParams.get('minDiscount') ?? '1', 10);
  const sortParam = searchParams.get('sort') ?? 'discount';

  // Fetch all products with a discount, large page to filter client-side by tier
  const fetchDeals = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await apiClient.getProducts({
        pageNumber: page,
        pageSize: PAGE_SIZE,
        sortBy: 'price',
        sortOrder: 'asc',
      });


      // Keep only discounted products
      let deals = (data.content ?? []).filter((p: Product) => p.discount > 0);

      // Apply tier filter
      deals = deals.filter((p: Product) => p.discount >= minDisc);

      // Sort
      if (sortParam === 'discount') {
        deals = deals.sort((a: Product, b: Product) => b.discount - a.discount);
      } else if (sortParam === 'price_asc') {
        deals = deals.sort((a: Product, b: Product) => a.specialPrice - b.specialPrice);
      } else if (sortParam === 'price_desc') {
        deals = deals.sort((a: Product, b: Product) => b.specialPrice - a.specialPrice);
      } else if (sortParam === 'savings') {
        deals = deals.sort((a: Product, b: Product) => (b.price - b.specialPrice) - (a.price - a.specialPrice));
      }

      setAllDeals(deals);
      setDisplayed(deals);
      setTotalElements(deals.length);
      setTotalPages(data.totalPages ?? 0);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
    } finally {
      setLoading(false);
    }
  }, [page, minDisc, sortParam]);

  useEffect(() => { fetchDeals(); }, [fetchDeals]);

  function setParam(key: string, value: string) {
    const next = new URLSearchParams(searchParams);
    next.set(key, value);
    next.set('page', '0');
    setSearchParams(next);
  }

  function handlePageChange(newPage: number) {
    const next = new URLSearchParams(searchParams);
    next.set('page', String(newPage));
    setSearchParams(next);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  const topSaving = allDeals.length > 0
    ? Math.max(...allDeals.map(p => p.price - p.specialPrice))
    : 0;
  const topDiscount = allDeals.length > 0
    ? Math.max(...allDeals.map(p => p.discount))
    : 0;

  return (
    <div className="deals-page">
      {/* ── Hero ── */}
      <div className="deals-hero">
        <div className="container">
          <div className="deals-hero__content">
            <div>
              <p className="section-overline deals-hero__overline">Limited Time</p>
              <h1 className="headline-lg deals-hero__title">Today's Deals</h1>
              <p className="deals-hero__sub">
                {loading ? 'Loading deals…' : `${totalElements} discounted product${totalElements !== 1 ? 's' : ''} — save big today`}
              </p>
            </div>
            {!loading && allDeals.length > 0 && (
              <div className="deals-hero__stats">
                <div className="deals-stat">
                  <span className="deals-stat__value">Up to {topDiscount}%</span>
                  <span className="deals-stat__label">off</span>
                </div>
                <div className="deals-stat deals-stat--divider" />
                <div className="deals-stat">
                  <span className="deals-stat__value">${topSaving.toFixed(0)}</span>
                  <span className="deals-stat__label">max saving</span>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="container deals-layout">
        {/* ── Mobile filter toggle ── */}
        <button
          type="button"
          className="products-filter-toggle"
          onClick={() => setSidebarOpen(v => !v)}
          aria-expanded={sidebarOpen}
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
            <line x1="4" y1="6" x2="20" y2="6"/><line x1="8" y1="12" x2="20" y2="12"/><line x1="12" y1="18" x2="20" y2="18"/>
          </svg>
          {sidebarOpen ? 'Hide Filters' : 'Show Filters'}
        </button>

        {/* ── Sidebar ── */}
        <aside className={`deals-sidebar${sidebarOpen ? ' products-sidebar--open' : ''}`}>
          {/* Discount tier filter */}
          <div className="deals-filter-group">
            <p className="deals-filter-label">Discount</p>
            <ul className="deals-filter-list">
              {DISCOUNT_TIERS.map(tier => (
                <li key={tier.min}>
                  <button
                    type="button"
                    className={`deals-filter-item${minDisc === tier.min ? ' deals-filter-item--active' : ''}`}
                    onClick={() => setParam('minDiscount', String(tier.min))}
                    aria-pressed={minDisc === tier.min}
                  >
                    {tier.label}
                  </button>
                </li>
              ))}
            </ul>
          </div>

          {/* Sort */}
          <div className="deals-filter-group">
            <p className="deals-filter-label">Sort by</p>
            <ul className="deals-filter-list">
              {[
                { value: 'discount',   label: 'Biggest discount' },
                { value: 'savings',    label: 'Most savings ($)' },
                { value: 'price_asc',  label: 'Price: low → high' },
                { value: 'price_desc', label: 'Price: high → low' },
              ].map(opt => (
                <li key={opt.value}>
                  <button
                    type="button"
                    className={`deals-filter-item${sortParam === opt.value ? ' deals-filter-item--active' : ''}`}
                    onClick={() => setParam('sort', opt.value)}
                    aria-pressed={sortParam === opt.value}
                  >
                    {opt.label}
                  </button>
                </li>
              ))}
            </ul>
          </div>
        </aside>

        {/* ── Main ── */}
        <main className="deals-main">
          {/* Loading skeletons */}
          {loading && (
            <div className="skeleton-grid" aria-busy="true">
              {Array.from({ length: PAGE_SIZE }).map((_, i) => (
                <div key={i} className="skeleton-card" aria-hidden="true" />
              ))}
            </div>
          )}

          {/* Error */}
          {error && (
            <div className="deals-status" role="alert">
              <p className="status-error">{error}</p>
              <button type="button" className="btn-primary" onClick={fetchDeals} style={{ marginTop: 12 }}>
                Retry
              </button>
            </div>
          )}

          {/* Empty */}
          {!loading && !error && displayed.length === 0 && (
            <div className="deals-empty" role="status">
              <svg viewBox="0 0 64 64" fill="none" width="56" height="56" aria-hidden="true">
                <circle cx="32" cy="32" r="28" stroke="currentColor" strokeWidth="2" opacity=".3" />
                <path d="M20 32h24M32 20v24" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" opacity=".4" />
              </svg>
              <p>No deals found for this filter.</p>
              <button
                type="button"
                className="btn-ghost"
                onClick={() => setSearchParams({})}
                style={{ marginTop: 12 }}
              >
                Clear filters
              </button>
            </div>
          )}

          {/* Grid */}
          {!loading && !error && displayed.length > 0 && (
            <>
              <div className="product-grid" aria-label="Deals">
                {displayed.map(product => (
                  <ProductCard key={product.productId} product={product} />
                ))}
              </div>

              {/* Pagination */}
              {totalPages > 1 && (
                <nav className="pagination" aria-label="Deals pages">
                  <button
                    type="button"
                    className="pagination__btn"
                    onClick={() => handlePageChange(page - 1)}
                    disabled={page === 0}
                    aria-label="Previous page"
                  >‹</button>

                  {Array.from({ length: totalPages }).map((_, i) => {
                    const show = i === 0 || i === totalPages - 1 || Math.abs(i - page) <= 1;
                    if (!show) return null;
                    return (
                      <button
                        key={i}
                        type="button"
                        className={`pagination__btn${i === page ? ' pagination__btn--active' : ''}`}
                        onClick={() => handlePageChange(i)}
                        aria-label={`Page ${i + 1}`}
                        aria-current={i === page ? 'page' : undefined}
                      >
                        {i + 1}
                      </button>
                    );
                  })}

                  <button
                    type="button"
                    className="pagination__btn"
                    onClick={() => handlePageChange(page + 1)}
                    disabled={page >= totalPages - 1}
                    aria-label="Next page"
                  >›</button>
                </nav>
              )}
            </>
          )}
        </main>
      </div>
    </div>
  );
}
