import { useEffect, useState, useCallback } from 'react';
import { useSearchParams } from 'react-router-dom';
import ProductCard from '../components/ProductCard';
import { apiClient } from '../lib/api';
import type { Product, Category, CategoryResponse } from '../types';


const PAGE_SIZE = 12;

export default function ProductsPage() {
  const [searchParams, setSearchParams] = useSearchParams();

  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [totalPages, setTotalPages] = useState(0);
  const [totalElements, setTotalElements] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Controlled inputs (local state before committing to URL)
  const [searchInput, setSearchInput] = useState(searchParams.get('keyword') ?? '');

  // Derived from URL params
  const keyword = searchParams.get('keyword') ?? '';
  const category = searchParams.get('category') ?? '';
  const page = parseInt(searchParams.get('page') ?? '0', 10);

  // Fetch categories once
  useEffect(() => {
    apiClient.getCategories(0, 50)
      .then((data: CategoryResponse) => setCategories(data.content ?? []))
      .catch(() => {/* non-critical */});
  }, []);

  // Fetch products whenever filters change
  const fetchProducts = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const params: Record<string, string | number> = {
        pageNumber: page,
        pageSize: PAGE_SIZE,
        sortBy: 'productName',
        sortOrder: 'asc',
      };
      if (keyword) params.keyword = keyword;
      if (category) params.category = category;

      const data = await apiClient.getProducts(params);
      setProducts(data.content ?? []);
      setTotalPages(data.totalPages ?? 0);
      setTotalElements(data.totalElements ?? 0);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
    } finally {
      setLoading(false);
    }
  }, [keyword, category, page]);

  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);

  function handleSearch(e: React.FormEvent) {
    e.preventDefault();
    const next = new URLSearchParams(searchParams);
    if (searchInput.trim()) {
      next.set('keyword', searchInput.trim());
    } else {
      next.delete('keyword');
    }
    next.set('page', '0');
    setSearchParams(next);
  }

  function handleCategoryClick(name: string) {
    const next = new URLSearchParams(searchParams);
    if (category === name) {
      next.delete('category');
    } else {
      next.set('category', name);
    }
    next.set('page', '0');
    setSearchParams(next);
  }

  function handleClearFilters() {
    setSearchInput('');
    setSearchParams({});
  }

  function handlePageChange(newPage: number) {
    const next = new URLSearchParams(searchParams);
    next.set('page', String(newPage));
    setSearchParams(next);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  const hasFilters = keyword || category;
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div>
      {/* ── Page header ── */}
      <div className="bg-gradient-to-br from-primary to-primary-container py-12 md:py-8">
        <div className="container">
          <p className="text-on-primary-container text-xs font-bold tracking-[0.14em] uppercase mb-2">Catalogue</p>
          <h1 className="text-3xl font-extrabold text-on-primary tracking-tight md:text-2xl">All Products</h1>
          {totalElements > 0 && !loading && (
            <p className="text-on-primary-container text-sm mt-1">{totalElements} items available</p>
          )}
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
          {hasFilters && <span className="ml-auto text-xs font-bold text-secondary bg-secondary/10 px-2 py-0.5 rounded-full">Active</span>}
        </button>

        <div className="grid grid-cols-1 md:grid-cols-[260px_1fr] gap-6 md:gap-10 pt-6 md:pt-10 pb-16 items-start">
          {/* ── Sidebar ── */}
          <aside className={`flex flex-col gap-7 md:sticky md:top-[calc(56px+24px)] md:overflow-visible md:max-h-none md:opacity-100 md:mb-0 overflow-hidden transition-all duration-300 ${sidebarOpen ? 'max-h-[800px] opacity-100 mb-6' : 'max-h-0 opacity-0 mb-0'}`}>
            {/* Search */}
            <form className="flex flex-col gap-2" onSubmit={handleSearch} role="search">
              <label htmlFor="product-search" className="sr-only">Search products</label>
              <div className="relative">
                <svg className="absolute left-3 top-1/2 -translate-y-1/2 text-on-surface-variant pointer-events-none" width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                  <circle cx="11" cy="11" r="7" stroke="currentColor" strokeWidth="2" />
                  <path d="M16.5 16.5L21 21" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                </svg>
                <input
                  id="product-search"
                  type="search"
                  className="w-full py-[10px] pl-10 pr-[14px] border-[1.5px] border-outline-variant rounded-xl bg-white text-on-surface font-sans text-[0.9rem] focus:outline-none focus:border-secondary focus:ring-[3px] focus:ring-secondary/10 transition-all placeholder:text-on-surface-variant"
                  placeholder="Search products…"
                  value={searchInput}
                  onChange={(e) => setSearchInput(e.target.value)}
                />
              </div>
              <button type="submit" className="w-full py-2 rounded-xl border-none bg-secondary text-on-secondary font-bold text-sm cursor-pointer hover:bg-secondary-container transition-colors">Search</button>
            </form>

            {/* Category filter */}
            {categories.length > 0 && (
              <div className="flex flex-col">
                <p className="text-[0.78rem] font-extrabold text-on-surface-variant uppercase tracking-[0.06em] mb-2">Categories</p>
                <ul className="flex flex-col gap-0.5 list-none m-0 p-0" role="list">
                  {categories.map((cat) => (
                    <li key={cat.categoryId}>
                      <button
                        type="button"
                        className={`w-full text-left px-[14px] py-2 rounded-[10px] text-on-surface font-sans text-sm font-medium cursor-pointer hover:bg-surface-container transition-colors border-none ${category === cat.categoryName ? 'bg-secondary-container text-on-secondary-container font-bold' : 'bg-transparent'}`}
                        onClick={() => handleCategoryClick(cat.categoryName)}
                        aria-pressed={category === cat.categoryName}
                      >
                        {cat.categoryName}
                      </button>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Clear filters */}
            {hasFilters && (
              <button type="button" className="w-full py-2 rounded-xl border border-outline-variant bg-transparent text-on-surface font-bold text-sm cursor-pointer hover:bg-surface-container transition-colors" onClick={handleClearFilters}>
                Clear all filters
              </button>
            )}
          </aside>

          {/* ── Main content ── */}
          <main>
            {/* Active filters */}
            {hasFilters && (
              <div className="flex flex-wrap gap-2 mb-4" aria-label="Active filters">
                {keyword && (
                  <span className="inline-flex items-center gap-1 px-3 py-1 bg-secondary/10 text-secondary text-sm font-semibold rounded-full">
                    Search: <strong>{keyword}</strong>
                    <button
                      type="button"
                      className="ml-1 text-secondary hover:text-error"
                      aria-label={`Remove search filter: ${keyword}`}
                      onClick={() => {
                        setSearchInput('');
                        const next = new URLSearchParams(searchParams);
                        next.delete('keyword');
                        next.set('page', '0');
                        setSearchParams(next);
                      }}
                    >×</button>
                  </span>
                )}
                {category && (
                  <span className="inline-flex items-center gap-1 px-3 py-1 bg-secondary/10 text-secondary text-sm font-semibold rounded-full">
                    Category: <strong>{category}</strong>
                    <button
                      type="button"
                      className="ml-1 text-secondary hover:text-error"
                      aria-label={`Remove category filter: ${category}`}
                      onClick={() => {
                        const next = new URLSearchParams(searchParams);
                        next.delete('category');
                        next.set('page', '0');
                        setSearchParams(next);
                      }}
                    >×</button>
                  </span>
                )}
              </div>
            )}

            {/* Status */}
            {loading && (
              <div className="grid grid-cols-2 sm:grid-cols-[repeat(auto-fill,minmax(220px,1fr))] gap-3 sm:gap-[18px] w-full" aria-live="polite" aria-busy="true">
                {Array.from({ length: PAGE_SIZE }).map((_, i) => (
                  <div key={i} className="h-[220px] md:h-[300px] bg-surface-container rounded-2xl animate-pulse" aria-hidden="true" />
                ))}
              </div>
            )}

            {error && (
              <div className="flex flex-col items-center gap-2 py-16 text-on-surface-variant text-center" role="alert">
                <p>{error}</p>
                <button type="button" className="mt-3 px-5 py-2 rounded-xl border-none bg-secondary text-on-secondary font-bold text-sm cursor-pointer hover:bg-secondary-container transition-colors" onClick={fetchProducts}>
                  Retry
                </button>
              </div>
            )}

            {!loading && !error && products.length === 0 && (
              <div className="flex flex-col items-center gap-2 py-16 text-on-surface-variant text-center" role="status">
                <p>No products found{hasFilters ? ' for the current filters' : ''}.</p>
                {hasFilters && (
                  <button type="button" className="mt-3 px-5 py-2 rounded-xl border border-outline-variant bg-transparent text-on-surface font-bold text-sm cursor-pointer hover:bg-surface-container transition-colors" onClick={handleClearFilters}>
                    Clear filters
                  </button>
                )}
              </div>
            )}

            {!loading && !error && products.length > 0 && (
              <>
                <div className="grid grid-cols-2 sm:grid-cols-[repeat(auto-fill,minmax(220px,1fr))] gap-3 sm:gap-[18px] w-full" aria-label="Products">
                  {products.map((product) => (
                    <ProductCard key={product.productId} product={product} />
                  ))}
                </div>

                {/* Pagination */}
                {totalPages > 1 && (
                  <nav className="flex items-center justify-center gap-2 mt-10" aria-label="Product pages">
                    <button
                      type="button"
                      className="min-w-[38px] h-[38px] px-2.5 border-[1.5px] border-outline-variant rounded-[10px] bg-white text-on-surface font-sans text-sm font-semibold cursor-pointer hover:bg-surface-container hover:border-secondary hover:text-secondary disabled:opacity-35 disabled:cursor-not-allowed transition-colors"
                      onClick={() => handlePageChange(page - 1)}
                      disabled={page === 0}
                      aria-label="Previous page"
                    >
                      ‹
                    </button>

                    {Array.from({ length: totalPages }).map((_, i) => {
                      // Show first, last, current ±1, and ellipsis
                      const show = i === 0 || i === totalPages - 1 || Math.abs(i - page) <= 1;
                      const showEllipsisBefore = i === 1 && page > 3;
                      const showEllipsisAfter = i === totalPages - 2 && page < totalPages - 4;

                      if (!show) return null;
                      return (
                        <span key={i}>
                          {showEllipsisBefore && <span className="px-2 text-on-surface-variant">…</span>}
                          <button
                            type="button"
                            className={`min-w-[38px] h-[38px] px-2.5 border-[1.5px] rounded-[10px] font-sans text-sm font-semibold cursor-pointer transition-colors ${i === page ? 'bg-secondary border-secondary text-on-secondary' : 'border-outline-variant bg-white text-on-surface hover:bg-surface-container hover:border-secondary hover:text-secondary'}`}
                            onClick={() => handlePageChange(i)}
                            aria-label={`Page ${i + 1}`}
                            aria-current={i === page ? 'page' : undefined}
                          >
                            {i + 1}
                          </button>
                          {showEllipsisAfter && <span className="px-2 text-on-surface-variant">…</span>}
                        </span>
                      );
                    })}

                    <button
                      type="button"
                      className="min-w-[38px] h-[38px] px-2.5 border-[1.5px] border-outline-variant rounded-[10px] bg-white text-on-surface font-sans text-sm font-semibold cursor-pointer hover:bg-surface-container hover:border-secondary hover:text-secondary disabled:opacity-35 disabled:cursor-not-allowed transition-colors"
                      onClick={() => handlePageChange(page + 1)}
                      disabled={page >= totalPages - 1}
                      aria-label="Next page"
                    >
                      ›
                    </button>
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
