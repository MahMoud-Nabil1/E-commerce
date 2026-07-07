import { Link, useParams } from 'react-router-dom';

export default function OrderSuccessPage() {
  const { orderId } = useParams<{ orderId: string }>();

  return (
    <div className="container" style={{ padding: '3rem 1rem', textAlign: 'center', maxWidth: '500px' }}>
      <div style={{ fontSize: '4rem', color: '#4caf50', marginBottom: '1rem' }}>✓</div>
      <h1 className="headline-lg" style={{ marginBottom: '1rem' }}>Order Placed Successfully!</h1>
      <p style={{ color: '#555', marginBottom: '2rem' }}>
        Thank you for your purchase. Your order #{orderId} has been received and is being processed.
      </p>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
        <Link to="/profile/orders" className="cart-btn-primary" style={{ padding: '0.75rem', textDecoration: 'none', borderRadius: '4px', display: 'inline-block' }}>
          View My Orders
        </Link>
        <Link to="/" style={{ color: '#005c97', textDecoration: 'none', marginTop: '0.5rem' }}>
          Continue Shopping
        </Link>
      </div>
    </div>
  );
}
