import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import ProductCard from '../components/ProductCard';
import { apiClient } from '../lib/api';
import type { Product, Category } from '../types';

export default function HomePage() {
  const [products, setProducts]     = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading]       = useState(true);
  const [error, setError]           = useState<string | null>(null);

  useEffect(() => {
    async function fetchHomepageData() {
      try {
        const [productsJson, categoriesJson] = await Promise.all([
          apiClient.getProducts({ pageNumber: 0, pageSize: 8 }),
          apiClient.getCategories(0, 8),
        ]);
        setProducts(productsJson.content ?? []);
        setCategories(categoriesJson.content ?? []);
      } catch (fetchError) {
        setError(fetchError instanceof Error ? fetchError.message : 'Failed to load products');
      } finally {
        setLoading(false);
      }
    }
    fetchHomepageData();
  }, []);

  return (
    <div>

      {/* ── Hero ── */}
      <section className="flex items-center min-h-[38vh] md:min-h-[50vh] bg-gradient-to-br from-surface-low to-background py-8 md:py-16 border-b border-outline-variant w-full">
        <div className="container">
          <div className="max-w-xl">
            <span className="inline-block px-3.5 py-1 md:px-4 md:py-1.5 bg-surface-container border border-outline-variant rounded-full text-[11px] md:text-xs font-extrabold tracking-[0.06em] uppercase text-on-surface-variant mb-5 md:mb-7">
              Free shipping on orders over $50
            </span>
            <h1 className="text-2xl sm:text-3xl md:text-5xl font-extrabold text-on-surface leading-[1.15] mb-4 md:mb-5 break-words">
              Everything you need,<br />delivered to your door.
            </h1>
            <p className="text-on-surface-variant max-w-[500px] mb-6 md:mb-8 leading-[1.6] text-sm md:text-base">
              Shop thousands of products across electronics, fashion, home goods, and more —
              with fast delivery and easy returns every time.
            </p>
            <div className="flex flex-col sm:flex-row gap-2.5 sm:gap-3">
              <Link to="/products" className="inline-flex items-center justify-center gap-1.5 px-6 py-3 rounded-full font-bold text-sm md:text-[0.9rem] cursor-pointer no-underline bg-primary text-on-primary shadow-[0_4px_16px_rgba(0,0,0,0.12)] hover:brightness-[1.08] hover:-translate-y-px hover:shadow-[0_6px_20px_rgba(0,0,0,0.16)] transition-all whitespace-nowrap w-full sm:w-auto">Shop now</Link>
              <Link to="/categories" className="inline-flex items-center justify-center gap-1.5 px-6 py-3 rounded-full font-bold text-sm md:text-[0.9rem] cursor-pointer no-underline bg-transparent text-on-surface border border-outline-variant hover:bg-surface-container hover:-translate-y-px transition-all whitespace-nowrap w-full sm:w-auto">Browse categories</Link>
            </div>
          </div>
        </div>
      </section>

      {/* ── Trust bar ── */}
      <div className="border-b border-outline-variant bg-surface py-3 md:py-4">
        <div className="container grid grid-cols-2 md:grid-cols-4 gap-2.5 md:gap-4">
          <div className="flex items-center gap-2.5 md:gap-3 p-2 rounded-xl bg-surface-low/50">
            <span className="text-xl md:text-2xl shrink-0">🚚</span>
            <div>
              <strong className="block text-xs md:text-sm font-bold text-on-surface">Fast delivery</strong>
              <span className="text-[11px] md:text-xs text-on-surface-variant">2–5 business days</span>
            </div>
          </div>
          <div className="flex items-center gap-2.5 md:gap-3 p-2 rounded-xl bg-surface-low/50">
            <span className="text-xl md:text-2xl shrink-0">↩️</span>
            <div>
              <strong className="block text-xs md:text-sm font-bold text-on-surface">Easy returns</strong>
              <span className="text-[11px] md:text-xs text-on-surface-variant">30-day policy</span>
            </div>
          </div>
          <div className="flex items-center gap-2.5 md:gap-3 p-2 rounded-xl bg-surface-low/50">
            <span className="text-xl md:text-2xl shrink-0">🔒</span>
            <div>
              <strong className="block text-xs md:text-sm font-bold text-on-surface">Secure checkout</strong>
              <span className="text-[11px] md:text-xs text-on-surface-variant">Safe &amp; encrypted</span>
            </div>
          </div>
          <div className="flex items-center gap-2.5 md:gap-3 p-2 rounded-xl bg-surface-low/50">
            <span className="text-xl md:text-2xl shrink-0">🎧</span>
            <div>
              <strong className="block text-xs md:text-sm font-bold text-on-surface">24/7 support</strong>
              <span className="text-[11px] md:text-xs text-on-surface-variant">Always ready to help</span>
            </div>
          </div>
        </div>
      </div>

      {/* ── Featured Products ── */}
      <section className="py-8 md:py-16 w-full container">
        <div className="flex flex-wrap justify-between gap-[18px] items-end mb-6 md:mb-8">
          <div>
            <p className="text-[0.78rem] font-extrabold text-on-surface-variant uppercase tracking-[0.06em] mb-1">Handpicked for you</p>
            <h2 className="text-2xl md:text-3xl font-extrabold text-on-surface tracking-tight">New &amp; popular right now</h2>
          </div>
          {!loading && !error && (
            <Link to="/products" className="inline-flex items-center justify-center gap-1.5 px-4 py-1.5 md:px-5 md:py-2 rounded-full font-bold text-xs md:text-[0.85rem] cursor-pointer no-underline bg-transparent text-on-surface border border-outline-variant hover:bg-surface-container hover:-translate-y-px transition-all whitespace-nowrap">
              View all products →
            </Link>
          )}
        </div>

        {error && (
          <div className="flex flex-col items-center gap-2 py-8 text-center text-on-surface-variant">
            <p>⚠️ {error}</p>
            <button className="inline-flex items-center justify-center gap-1.5 px-5 py-2 rounded-full font-bold text-[0.85rem] cursor-pointer bg-transparent text-on-surface border border-outline-variant hover:bg-surface-container transition-all" onClick={() => window.location.reload()}>
              Try again
            </button>
          </div>
        )}

        <div className="grid grid-cols-2 sm:grid-cols-[repeat(auto-fill,minmax(220px,1fr))] gap-3 sm:gap-[18px] w-full" aria-label="Products">
          {loading
            ? Array.from({ length: 8 }).map((_, i) => (
                <div key={i} className="rounded-2xl bg-surface-container overflow-hidden animate-pulse h-[220px] md:h-[300px]" aria-hidden="true" />
              ))
            : products.map((product) => (
                <ProductCard key={product.productId} product={product} />
              ))}
          {!loading && !error && products.length === 0 && (
            <div className="col-span-full py-12 text-center text-on-surface-variant">No products available yet.</div>
          )}
        </div>
      </section>

      {/* ── Categories ── */}
      {categories.length > 0 && (
        <section className="py-[clamp(40px,8vw,72px)] w-full bg-surface-low border-t border-outline-variant">
          <div className="container">
            <div className="flex flex-wrap justify-between gap-[18px] items-end mb-8">
              <div>
                <p className="text-[0.78rem] font-extrabold text-on-surface-variant uppercase tracking-[0.06em] mb-1">Shop by category</p>
                <h2 className="text-3xl font-extrabold text-on-surface tracking-tight">What are you looking for?</h2>
              </div>
            </div>
            <div className="flex flex-wrap gap-3">
              {categories.map((category) => (
                <Link
                  key={category.categoryId}
                  to={`/products?category=${encodeURIComponent(category.categoryName)}`}
                  className="px-5 py-3 rounded-full bg-surface-container text-on-surface border border-outline-variant font-bold text-[clamp(0.78rem,2vw,0.9rem)] whitespace-nowrap no-underline hover:bg-primary hover:text-on-primary hover:border-primary hover:-translate-y-0.5 transition-all"
                >
                  {category.categoryName}
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}

    </div>
  );
}
