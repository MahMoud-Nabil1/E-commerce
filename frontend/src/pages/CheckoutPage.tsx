import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { apiClient } from '../lib/api';
import type { Address } from '../types';

export default function CheckoutPage() {
  const navigate = useNavigate();
  const [addresses, setAddresses] = useState<Address[]>([]);
  const [addressId, setAddressId] = useState<number | null>(null);
  const [paymentMethod, setPaymentMethod] = useState('CASH_ON_DELIVERY');
  const [transactionId, setTransactionId] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function loadAddresses() {
      try {
        const addrList = await apiClient.getUserAddresses();
        setAddresses(addrList);
        if (addrList.length > 0) {
          setAddressId(addrList[0].addressId);
        }
      } catch (err) {
        console.error('Failed to load addresses', err);
      }
    }
    loadAddresses();
  }, []);

  const handlePlaceOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!addressId) {
      setError('Please select or add an address.');
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const order = await apiClient.placeOrder(addressId, paymentMethod, transactionId);
      navigate(`/order-success/${order.orderId}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Checkout failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container" style={{ padding: '2rem 1rem', maxWidth: '600px' }}>
      <h1 className="headline-lg" style={{ marginBottom: '1.5rem' }}>Checkout</h1>
      {error && <div className="status-error" style={{ marginBottom: '1rem', padding: '0.75rem', borderRadius: '4px', background: '#ffebee', color: '#c62828' }}>{error}</div>}
      <form onSubmit={handlePlaceOrder} style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
        <div>
          <label style={{ display: 'block', fontWeight: 'bold', marginBottom: '0.5rem' }}>Shipping Address</label>
          {addresses.length === 0 ? (
            <p style={{ color: '#666' }}>No addresses found. Please add an address in your Profile Dashboard.</p>
          ) : (
            <select 
              value={addressId || ''} 
              onChange={(e) => setAddressId(Number(e.target.value))}
              style={{ width: '100%', padding: '0.75rem', borderRadius: '4px', border: '1px solid #ccc' }}
            >
              {addresses.map(addr => (
                <option key={addr.addressId} value={addr.addressId}>
                  {addr.buildingName}, {addr.street}, {addr.city}, {addr.state}, {addr.country} - {addr.pincode}
                </option>
              ))}
            </select>
          )}
        </div>

        <div>
          <label style={{ display: 'block', fontWeight: 'bold', marginBottom: '0.5rem' }}>Payment Method</label>
          <select 
            value={paymentMethod} 
            onChange={(e) => setPaymentMethod(e.target.value)}
            style={{ width: '100%', padding: '0.75rem', borderRadius: '4px', border: '1px solid #ccc' }}
          >
            <option value="CASH_ON_DELIVERY">Cash on Delivery (COD)</option>
            <option value="INSTAPAY">InstaPay</option>
            <option value="VODAFONE_CASH">Vodafone Cash</option>
          </select>
        </div>

        {paymentMethod !== 'CASH_ON_DELIVERY' && (
          <div>
            <label style={{ display: 'block', fontWeight: 'bold', marginBottom: '0.5rem' }}>Transaction ID / Wallet Number</label>
            <input 
              type="text" 
              value={transactionId} 
              onChange={(e) => setTransactionId(e.target.value)}
              placeholder="Enter transfer transaction reference ID"
              required
              style={{ width: '100%', padding: '0.75rem', borderRadius: '4px', border: '1px solid #ccc' }}
            />
          </div>
        )}

        <button 
          type="submit" 
          disabled={loading || !addressId}
          className="cart-btn-primary"
          style={{ padding: '0.75rem', fontSize: '1rem', border: 'none', borderRadius: '4px', cursor: 'pointer' }}
        >
          {loading ? 'Processing Checkout...' : 'Confirm and Place Order'}
        </button>
      </form>
    </div>
  );
}
