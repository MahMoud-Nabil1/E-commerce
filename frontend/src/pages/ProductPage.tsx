import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import './HomePage.css';

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
  const params = useParams();
  const productId = params.productId ?? '';
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!productId) {
      setError('Product not found');
      setLoading(false);
      return;
    }

    async function fetchProduct() {
      try {
        const response = await fetch(`/api/public/products/${productId}`);
        if (!response.ok) {
          throw new Error('Failed to load product details.');
        }

        const data = (await response.json()) as Product;
        setProduct(data);
      } catch (fetchError) {
        setError(fetchError instanceof Error ? fetchError.message : 'Unknown error');
      } finally {
        setLoading(false);
      }
    }

    fetchProduct();
  }, [productId]);

  return (
    <div className="home-page">
      <section className="home-section container">
        <div className="section-header">
          <div>
            <p className="section-overline">Product</p>
            <h2 className="headline-lg">Product details</h2>
          </div>
          <div className="status-line">
            {loading && 'Loading product…'}
            {error && <span className="status-error">{error}</span>}
          </div>
        </div>

        {product && !loading && !error && (
          <article className="product-card">
            <div className="product-card__image">
              <span>{product.image ? 'Product image' : 'No image'}</span>
            </div>
            <div className="product-card__body">
              <h3>{product.productName}</h3>
              <p>{product.description}</p>
              <div className="product-card__meta">
                <span>Price: ${product.price.toFixed(2)}</span>
                <span>Discount: {product.discount}%</span>
                <span>Special: ${product.specialPrice.toFixed(2)}</span>
                <span>Qty: {product.quantity}</span>
              </div>
            </div>
          </article>
        )}

        {!loading && !error && !product && (
          <div className="empty-state">Product not available.</div>
        )}

        <div style={{ marginTop: '24px' }}>
          <Link to="/" className="category-chip" style={{ textDecoration: 'none' }}>
            Back to homepage
          </Link>
        </div>
      </section>
    </div>
  );
}
