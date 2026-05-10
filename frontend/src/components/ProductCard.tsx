import { Link } from 'react-router-dom';
import '../pages/HomePage.css';
import './ProductCard.css';

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

export default function ProductCard({ product }: { product: Product }) {
  const inStock = product.quantity > 0;

  return (
    <Link
      to={`/products/${product.productId}`}
      className="product-card-link"
      aria-label={`View ${product.productName}`}
    >
      <article className="product-card">
        {/* Image area */}
        <div className="product-card__image">
          {product.discount > 0 && (
            <span className="product-card__badge" aria-label={`${product.discount}% off`}>
              -{product.discount}%
            </span>
          )}
          {product.image ? (
            <img
              src={`/api/public/products/image/${product.image}`}
              alt={product.productName}
              className="product-card__img"
              loading="lazy"
            />
          ) : (
            <svg viewBox="0 0 48 48" fill="none" aria-hidden="true" width="40" height="40" className="product-card__placeholder-icon">
              <rect x="4" y="4" width="40" height="40" rx="8" stroke="currentColor" strokeWidth="2" />
              <circle cx="17" cy="18" r="4" stroke="currentColor" strokeWidth="2" />
              <path d="M4 34l10-10 8 8 6-6 16 14" stroke="currentColor" strokeWidth="2" strokeLinejoin="round" />
            </svg>
          )}
        </div>

        {/* Body */}
        <div className="product-card__body">
          <h3 className="product-card__title">{product.productName}</h3>
          <p className="product-card__desc">{product.description}</p>

          <div className="product-card__footer">
            <div className="product-card__pricing">
              <span className="product-card__price">${product.specialPrice.toFixed(2)}</span>
              {product.discount > 0 && (
                <span className="product-card__original">${product.price.toFixed(2)}</span>
              )}
            </div>
            <span className={`product-card__stock ${inStock ? 'product-card__stock--in' : 'product-card__stock--out'}`}>
              {inStock ? 'In stock' : 'Out of stock'}
            </span>
          </div>
        </div>
      </article>
    </Link>
  );
}
