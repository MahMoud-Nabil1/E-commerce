import { useEffect, useState, useCallback } from 'react';
import { useSearchParams } from 'react-router-dom';
import ProductCard from '../components/ProductCard';
import { apiClient } from '../lib/api';
import type { Product } from '../types';



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

  const [deals, setDeals]               = useState<Product[]>([]);
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


      // Keep only discounted products, then apply tier filter
      let filtered = (data.content ?? []).filter((p: Product) => p.discount > 0 && p.discount >= minDisc);

      // Sort
      if (sortParam === 'discount') {
        filtered = filtered.sort((a: Product, b: Product) => b.discount - a.discount);
      } else if (sortParam === 'price_asc') {
        filtered = filtered.sort((a: Product, b: Product) => a.specialPrice - b.specialPrice);
      } else if (sortParam === 'price_desc') {
        filtered = filtered.sort((a: Product, b: Product) => b.specialPrice - a.specialPrice);
      } else if (sortParam === 'savings') {
        filtered = filtered.sort((a: Product, b: Product) => (b.price - b.specialPrice) - (a.price - a.specialPrice));
      }

      setDeals(filtered);
      setTotalElements(filtered.length);
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

  const topSaving = deals.length > 0
    ? Math.max(...deals.map(p => p.price - p.specialPrice))
    : 0;
  const topDiscount = deals.length > 0
    ? Math.max(...deals.map(p => p.discount))
    : 0;

  const filterItemClass = (active: boolean) =>
    `w-full text-left px-[14px] py-2 rounded-[10px] text-on-surface font-sans text-sm font-medium cursor-pointer hover:bg-surface-container transition-colors border-none ${active ? 'bg-secondary-container text-on-secondary-container font-bold' : 'bg-transparent'}`;

  return (
    <div>
      {/* ── Hero ── */}
      <div className="bg-[linear-gradient(135deg,#1a0533_0%,#031636_50%,#0d2a5e_100%)] py-[52px] relative overflow-hidden md:py-9">
        {/* Radial highlight overlay */}
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_70%_50%,rgba(38,77,217,0.25)_0%,transparent_65%)] pointer-events-none" />
        <div className="container relative">
          <div className="flex items-center justify-between gap-6 flex-wrap">
            <div>
              <p className="text-amber-400 text-[11px] font-bold tracking-[0.12em] uppercase mb-2">Limited Time</p>
              <h1 className="text-3xl font-extrabold text-white tracking-tight md:text-2xl">Today's Deals</h1>
              <p className="text-white/70 text-[0.95rem] max-w-[500px] mt-2">
                {loading ? 'Loading deals…' : `${totalElements} discounted product${totalElements !== 1 ? 's' : ''} — save big today`}
              </p>
            </div>
            {!loading && deals.length > 0 && (
              <div className="hidden md:flex items-center gap-6 bg-white/[0.07] border border-white/[0.12] rounded-2xl px-7 py-5 backdrop-blur-sm shrink-0">
                <div className="flex flex-col items-center">
                  <span className="text-[22px] font-extrabold text-amber-400 leading-none">Up to {topDiscount}%</span>
                  <span className="text-white/60 text-xs mt-1">off</span>
                </div>
                <div className="w-px h-9 bg-white/[0.15]" />
                <div className="flex flex-col items-center">
                  <span className="text-[22px] font-extrabold text-amber-400 leading-none">${topSaving.toFixed(0)}</span>
                  <span className="text-white/60 text-xs mt-1">max saving</span>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="container">
        {/* ── Mobile filter toggle ── */}
        <button
          type="button"
          className="flex md:hidden items-center gap-2 w-full px-4 py-[10px] mb-4 border-[1.5px] border-outline-variant rounded-xl bg-white text-on-surface font-sans text-sm font-semibold cursor-pointer hover:border-secondary hover:bg-surface-low transition-colors mt-6"
          onClick={() => setSidebarOpen(v => !v)}
          aria-expanded={sidebarOpen}
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
            <line x1="4" y1="6" x2="20" y2="6"/><line x1="8" y1="12" x2="20" y2="12"/><line x1="12" y1="18" x2="20" y2="18"/>
          </svg>
          {sidebarOpen ? 'Hide Filters' : 'Show Filters'}
        </button>

        <div className="grid grid-cols-1 md:grid-cols-[260px_1fr] gap-6 md:gap-10 pt-6 md:pt-10 pb-10 md:pb-16 items-start">
          {/* ── Sidebar ── */}
          <aside className={`md:sticky md:top-[calc(56px+24px)] flex flex-col gap-7 overflow-hidden transition-[max-height,opacity,margin] duration-300 md:overflow-visible md:max-h-none md:opacity-100 ${sidebarOpen ? 'max-h-[800px] opacity-100 mb-6' : 'max-h-0 opacity-0 mb-0 md:mb-0'}`}>
            {/* Discount tier filter */}
            <div className="flex flex-col">
              <p className="text-[0.78rem] font-extrabold text-on-surface-variant uppercase tracking-[0.06em] mb-2">Discount</p>
              <ul className="flex flex-col gap-0.5 list-none m-0 p-0">
                {DISCOUNT_TIERS.map(tier => (
                  <li key={tier.min}>
                    <button
                      type="button"
                      className={filterItemClass(minDisc === tier.min)}
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
            <div className="flex flex-col">
              <p className="text-[0.78rem] font-extrabold text-on-surface-variant uppercase tracking-[0.06em] mb-2">Sort by</p>
              <ul className="flex flex-col gap-0.5 list-none m-0 p-0">
                {[
                  { value: 'discount',   label: 'Biggest discount' },
                  { value: 'savings',    label: 'Most savings ($)' },
                  { value: 'price_asc',  label: 'Price: low → high' },
                  { value: 'price_desc', label: 'Price: high → low' },
                ].map(opt => (
                  <li key={opt.value}>
                    <button
                      type="button"
                      className={filterItemClass(sortParam === opt.value)}
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
          <main>
            {/* Loading skeletons */}
            {loading && (
              <div className="grid grid-cols-2 sm:grid-cols-[repeat(auto-fill,minmax(220px,1fr))] gap-3 sm:gap-[18px] w-full" aria-busy="true">
                {Array.from({ length: PAGE_SIZE }).map((_, i) => (
                  <div key={i} className="h-[220px] md:h-[300px] bg-surface-container rounded-2xl animate-pulse" aria-hidden="true" />
                ))}
              </div>
            )}

            {/* Error */}
            {error && (
              <div className="flex flex-col items-center gap-2 py-16 text-on-surface-variant text-center" role="alert">
                <p>{error}</p>
                <button type="button" className="mt-3 px-5 py-2 rounded-xl border-none bg-secondary text-on-secondary font-bold text-sm cursor-pointer hover:bg-secondary-container transition-colors" onClick={fetchDeals}>
                  Retry
                </button>
              </div>
            )}

            {/* Empty */}
            {!loading && !error && deals.length === 0 && (
              <div className="flex flex-col items-center gap-2 py-16 text-on-surface-variant text-center" role="status">
                <svg viewBox="0 0 64 64" fill="none" width="56" height="56" aria-hidden="true">
                  <circle cx="32" cy="32" r="28" stroke="currentColor" strokeWidth="2" opacity=".3" />
                  <path d="M20 32h24M32 20v24" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" opacity=".4" />
                </svg>
                <p>No deals found for this filter.</p>
                <button
                  type="button"
                  className="mt-3 px-5 py-2 rounded-xl border border-outline-variant bg-transparent text-on-surface font-bold text-sm cursor-pointer hover:bg-surface-container transition-colors"
                  onClick={() => setSearchParams({})}
                >
                  Clear filters
                </button>
              </div>
            )}

            {/* Grid */}
            {!loading && !error && deals.length > 0 && (
              <>
                <div className="grid grid-cols-2 sm:grid-cols-[repeat(auto-fill,minmax(220px,1fr))] gap-3 sm:gap-[18px] w-full" aria-label="Deals">
                  {deals.map(product => (
                    <ProductCard key={product.productId} product={product} />
                  ))}
                </div>

                {/* Pagination */}
                {totalPages > 1 && (
                  <nav className="flex items-center justify-center gap-2 mt-10" aria-label="Deals pages">
                    <button
                      type="button"
                      className="min-w-[38px] h-[38px] px-2.5 border-[1.5px] border-outline-variant rounded-[10px] bg-white text-on-surface font-sans text-sm font-semibold cursor-pointer hover:bg-surface-container hover:border-secondary hover:text-secondary disabled:opacity-35 disabled:cursor-not-allowed transition-colors"
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
                          className={`min-w-[38px] h-[38px] px-2.5 border-[1.5px] rounded-[10px] font-sans text-sm font-semibold cursor-pointer transition-colors ${i === page ? 'bg-secondary border-secondary text-on-secondary' : 'border-outline-variant bg-white text-on-surface hover:bg-surface-container hover:border-secondary hover:text-secondary'}`}
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
                      className="min-w-[38px] h-[38px] px-2.5 border-[1.5px] border-outline-variant rounded-[10px] bg-white text-on-surface font-sans text-sm font-semibold cursor-pointer hover:bg-surface-container hover:border-secondary hover:text-secondary disabled:opacity-35 disabled:cursor-not-allowed transition-colors"
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
    </div>
  );
}
