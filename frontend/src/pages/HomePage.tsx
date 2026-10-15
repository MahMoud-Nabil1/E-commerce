import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import ProductCard from '../components/ProductCard';
import { apiClient } from '../lib/api';
import type { Product, Category } from '../types';
import './HomePage.css';

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
    <div className="home-page">

      {/* ── Hero ── */}
      <section className="home-hero">
        <div className="container">
          <div className="home-hero__content">
            <span className="home-hero__badge">Free shipping on orders over $50</span>
            <h1 className="display-xl">
              Everything you need,<br />delivered to your door.
            </h1>
            <p className="body-lg home-hero__subtitle">
              Shop thousands of products across electronics, fashion, home goods, and more —
              with fast delivery and easy returns every time.
            </p>
            <div className="home-hero__actions">
              <Link to="/products" className="btn btn--primary">Shop now</Link>
              <Link to="/categories" className="btn btn--ghost">Browse categories</Link>
            </div>
          </div>
        </div>
      </section>

      {/* ── Trust bar ── */}
      <div className="trust-bar">
        <div className="container trust-bar__inner">
          <div className="trust-bar__item">
            <span className="trust-bar__icon">🚚</span>
            <div>
              <strong>Fast delivery</strong>
              <span>2–5 business days</span>
            </div>
          </div>
          <div className="trust-bar__item">
            <span className="trust-bar__icon">↩️</span>
            <div>
              <strong>Easy returns</strong>
              <span>30-day no-hassle policy</span>
            </div>
          </div>
          <div className="trust-bar__item">
            <span className="trust-bar__icon">🔒</span>
            <div>
              <strong>Secure checkout</strong>
              <span>Your data is always safe</span>
            </div>
          </div>
          <div className="trust-bar__item">
            <span className="trust-bar__icon">🎧</span>
            <div>
              <strong>24/7 support</strong>
              <span>We're here when you need us</span>
            </div>
          </div>
        </div>
      </div>

      {/* ── Featured Products ── */}
      <section className="home-section container">
        <div className="section-header">
          <div>
            <p className="section-overline">Handpicked for you</p>
            <h2 className="headline-lg">New &amp; popular right now</h2>
          </div>
          {!loading && !error && (
            <Link to="/products" className="btn btn--ghost btn--sm">
              View all products →
            </Link>
          )}
        </div>

        {error && (
          <div className="home-error">
            <p>⚠️ {error}</p>
            <button className="btn btn--ghost btn--sm" onClick={() => window.location.reload()}>
              Try again
            </button>
          </div>
        )}

        <div className="product-grid">
          {loading
            ? Array.from({ length: 8 }).map((_, i) => (
                <div key={i} className="product-card product-card--skeleton">
                  <div className="skeleton skeleton--image" />
                  <div className="product-card__body">
                    <div className="skeleton skeleton--title" />
                    <div className="skeleton skeleton--desc" />
                    <div className="skeleton skeleton--price" />
                  </div>
                </div>
              ))
            : products.map((product) => (
                <ProductCard key={product.productId} product={product} />
              ))}
          {!loading && !error && products.length === 0 && (
            <div className="empty-state">No products available yet.</div>
          )}
        </div>
      </section>

      {/* ── Categories ── */}
      {categories.length > 0 && (
        <section className="home-section home-section--alt">
          <div className="container">
            <div className="section-header">
              <div>
                <p className="section-overline">Shop by category</p>
                <h2 className="headline-lg">What are you looking for?</h2>
              </div>
            </div>
            <div className="category-list">
              {categories.map((category) => (
                <Link
                  key={category.categoryId}
                  to={`/products?category=${encodeURIComponent(category.categoryName)}`}
                  className="category-chip"
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
