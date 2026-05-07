import { Link } from 'react-router-dom';
import '../pages/HomePage.css';

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
  return (
    <Link to={`/products/${product.productId}`} className="product-card-link" style={{ textDecoration: 'none', color: 'inherit' }}>
      <article className="product-card">
        <div className="product-card__image">
          <span>{product.image ? 'View product' : 'No image'}</span>
        </div>
        <div className="product-card__body">
          <h3>{product.productName}</h3>
          <p>{product.description}</p>
          <div className="product-card__meta">
            <span>Price: ${product.price.toFixed(2)}</span>
            <span>Qty: {product.quantity}</span>
          </div>
        </div>
      </article>
    </Link>
  );
}
