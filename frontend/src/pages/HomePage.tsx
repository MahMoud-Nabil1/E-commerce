import { useEffect, useState } from 'react';
import ProductCard from '../components/ProductCard';
import { apiClient } from '../lib/api';
import type { Product, Category } from '../types';
import './HomePage.css';

export default function HomePage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchHomepageData() {
      try {
        const [productsJson, categoriesJson] = await Promise.all([
          apiClient.getProducts({ pageNumber: 0, pageSize: 6 }),
          apiClient.getCategories(0, 6),
        ]);

        setProducts(productsJson.content ?? []);
        setCategories(categoriesJson.content ?? []);
      } catch (fetchError) {
        setError(fetchError instanceof Error ? fetchError.message : 'Unknown error');
      } finally {
        setLoading(false);
      }
    }

    fetchHomepageData();
  }, []);

  return (
    <div className="home-page">
      <section className="home-hero">
        <div className="container">
          <div className="home-hero__content">
            <span className="home-hero__badge">Live from the backend</span>
            <h1 className="display-xl">Precision Commerce<br />for Professionals</h1>
            <p className="body-lg home-hero__subtitle">
              Curated products designed for the sophisticated enterprise buyer. Performance meets elegance.
            </p>
          </div>
        </div>
      </section>

      <section className="home-section container">
        <div className="section-header">
          <div>
            <p className="section-overline">Featured products</p>
            <h2 className="headline-lg">From the storefront API</h2>
          </div>
          <div className="status-line">
            {loading && 'Loading products…'}
            {error && <span className="status-error">{error}</span>}
            {!loading && !error && `${products.length} products loaded`}
          </div>
        </div>

        <div className="product-grid">
          {products.map((product) => (
            <ProductCard key={product.productId} product={product} />
          ))}
          {!loading && !error && products.length === 0 && (
            <div className="empty-state">No products available yet.</div>
          )}
        </div>
      </section>

      <section className="home-section container">
        <div className="section-header">
          <div>
            <p className="section-overline">Browse categories</p>
            <h2 className="headline-lg">Shop by category</h2>
          </div>
        </div>

        <div className="category-list">
          {categories.map((category) => (
            <span className="category-chip" key={category.categoryId}>
              {category.categoryName}
            </span>
          ))}
          {!loading && !error && categories.length === 0 && (
            <div className="empty-state">No categories available yet.</div>
          )}
        </div>
      </section>
    </div>
  );
}
