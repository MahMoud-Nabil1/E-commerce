import { useEffect, useState, useCallback } from 'react';
import { useSearchParams } from 'react-router-dom';
import ProductCard from '../components/ProductCard';
import { apiClient } from '../lib/api';
import type { Product, Category, CategoryResponse } from '../types';
import './ProductsPage.css';


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

  return (
    <div className="products-page">
      {/* ── Page header ── */}
      <div className="products-hero">
        <div className="container">
          <p className="section-overline">Catalogue</p>
          <h1 className="headline-lg">All Products</h1>
          {totalElements > 0 && !loading && (
            <p className="products-hero__count">{totalElements} items available</p>
          )}
        </div>
      </div>

      <div className="container products-layout">
        {/* ── Sidebar ── */}
        <aside className="products-sidebar">
          {/* Search */}
          <form className="search-form" onSubmit={handleSearch} role="search">
            <label htmlFor="product-search" className="sr-only">Search products</label>
            <div className="search-form__inner">
              <svg className="search-form__icon" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                <circle cx="11" cy="11" r="7" stroke="currentColor" strokeWidth="2" />
                <path d="M16.5 16.5L21 21" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
              </svg>
              <input
                id="product-search"
                type="search"
                className="search-form__input"
                placeholder="Search products…"
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
              />
            </div>
            <button type="submit" className="btn-primary">Search</button>
          </form>

          {/* Category filter */}
          {categories.length > 0 && (
            <div className="filter-group">
              <p className="filter-group__label">Categories</p>
              <ul className="filter-list" role="list">
                {categories.map((cat) => (
                  <li key={cat.categoryId}>
                    <button
                      type="button"
                      className={`filter-item${category === cat.categoryName ? ' filter-item--active' : ''}`}
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
            <button type="button" className="btn-ghost" onClick={handleClearFilters}>
              Clear all filters
            </button>
          )}
        </aside>

        {/* ── Main content ── */}
        <main className="products-main">
          {/* Active filters */}
          {hasFilters && (
            <div className="active-filters" aria-label="Active filters">
              {keyword && (
                <span className="filter-tag">
                  Search: <strong>{keyword}</strong>
                  <button
                    type="button"
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
                <span className="filter-tag">
                  Category: <strong>{category}</strong>
                  <button
                    type="button"
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
            <div className="products-status" aria-live="polite" aria-busy="true">
              <div className="skeleton-grid">
                {Array.from({ length: PAGE_SIZE }).map((_, i) => (
                  <div key={i} className="skeleton-card" aria-hidden="true" />
                ))}
              </div>
            </div>
          )}

          {error && (
            <div className="products-status" role="alert">
              <p className="status-error">{error}</p>
              <button type="button" className="btn-primary" onClick={fetchProducts} style={{ marginTop: '12px' }}>
                Retry
              </button>
            </div>
          )}

          {!loading && !error && products.length === 0 && (
            <div className="empty-state" role="status">
              <p>No products found{hasFilters ? ' for the current filters' : ''}.</p>
              {hasFilters && (
                <button type="button" className="btn-ghost" onClick={handleClearFilters} style={{ marginTop: '12px' }}>
                  Clear filters
                </button>
              )}
            </div>
          )}

          {!loading && !error && products.length > 0 && (
            <>
              <div className="product-grid" aria-label="Products">
                {products.map((product) => (
                  <ProductCard key={product.productId} product={product} />
                ))}
              </div>

              {/* Pagination */}
              {totalPages > 1 && (
                <nav className="pagination" aria-label="Product pages">
                  <button
                    type="button"
                    className="pagination__btn"
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
                        {showEllipsisBefore && <span className="pagination__ellipsis">…</span>}
                        <button
                          type="button"
                          className={`pagination__btn${i === page ? ' pagination__btn--active' : ''}`}
                          onClick={() => handlePageChange(i)}
                          aria-label={`Page ${i + 1}`}
                          aria-current={i === page ? 'page' : undefined}
                        >
                          {i + 1}
                        </button>
                        {showEllipsisAfter && <span className="pagination__ellipsis">…</span>}
                      </span>
                    );
                  })}

                  <button
                    type="button"
                    className="pagination__btn"
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
  );
}
