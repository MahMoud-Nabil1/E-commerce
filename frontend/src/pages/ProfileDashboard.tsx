import { useEffect, useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { apiClient } from '../lib/api';
import type { Address, Order } from '../types';

export function ProfileDashboard() {
  const { user } = useAuth();
  const [addresses, setAddresses] = useState<Address[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [activeTab, setActiveTab] = useState<'profile' | 'addresses' | 'orders'>('profile');
  const [loading, setLoading] = useState(false);

  // Address Form State
  const [street, setStreet] = useState('');
  const [buildingName, setBuildingName] = useState('');
  const [city, setCity] = useState('');
  const [state, setState] = useState('');
  const [country, setCountry] = useState('');
  const [pincode, setPincode] = useState('');
  const [formError, setFormError] = useState<string | null>(null);

  useEffect(() => {
    async function loadData() {
      setLoading(true);
      try {
        const [addrList, orderList] = await Promise.all([
          apiClient.getUserAddresses(),
          apiClient.getMyOrders(),
        ]);
        setAddresses(addrList);
        setOrders(orderList);
      } catch (err) {
        console.error('Failed to load profile data', err);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

  const handleAddAddress = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);
    if (!street || !buildingName || !city || !state || !country || !pincode) {
      setFormError('All fields are required.');
      return;
    }
    try {
      const newAddr = await apiClient.addAddress({
        street,
        buildingName,
        city,
        state,
        country,
        pincode,
      });
      setAddresses([...addresses, newAddr]);
      setStreet('');
      setBuildingName('');
      setCity('');
      setState('');
      setCountry('');
      setPincode('');
    } catch (err) {
      setFormError(err instanceof Error ? err.message : 'Failed to add address');
    }
  };

  const handleDeleteAddress = async (addressId: number) => {
    try {
      await apiClient.deleteAddress(addressId);
      setAddresses(addresses.filter(a => a.addressId !== addressId));
    } catch (err) {
      console.error('Failed to delete address', err);
    }
  };

  return (
    <div className="container" style={{ padding: '2rem 1rem' }}>
      <h1 className="headline-lg" style={{ marginBottom: '1.5rem' }}>My Account</h1>

      <div style={{ display: 'flex', gap: '1rem', borderBottom: '1px solid #ddd', marginBottom: '2.0rem' }}>
        <button 
          onClick={() => setActiveTab('profile')} 
          style={{ 
            padding: '0.75rem 1.5rem', 
            background: 'none', 
            border: 'none', 
            borderBottom: activeTab === 'profile' ? '3px solid #005c97' : 'none',
            fontWeight: activeTab === 'profile' ? 'bold' : 'normal',
            cursor: 'pointer' 
          }}
        >
          Profile
        </button>
        <button 
          onClick={() => setActiveTab('addresses')} 
          style={{ 
            padding: '0.75rem 1.5rem', 
            background: 'none', 
            border: 'none', 
            borderBottom: activeTab === 'addresses' ? '3px solid #005c97' : 'none',
            fontWeight: activeTab === 'addresses' ? 'bold' : 'normal',
            cursor: 'pointer' 
          }}
        >
          Addresses
        </button>
        <button 
          onClick={() => setActiveTab('orders')} 
          style={{ 
            padding: '0.75rem 1.5rem', 
            background: 'none', 
            border: 'none', 
            borderBottom: activeTab === 'orders' ? '3px solid #005c97' : 'none',
            fontWeight: activeTab === 'orders' ? 'bold' : 'normal',
            cursor: 'pointer' 
          }}
        >
          Orders
        </button>
      </div>

      {loading && <p>Loading data...</p>}

      {!loading && activeTab === 'profile' && (
        <div style={{ background: '#f9f9f9', padding: '1.5rem', borderRadius: '8px' }}>
          <h2>Personal Information</h2>
          <div style={{ marginTop: '1rem', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
            <p><strong>Username:</strong> {user?.username}</p>
            <p><strong>Email:</strong> {user?.email}</p>
            <p><strong>Roles:</strong> {user?.roles?.join(', ')}</p>
          </div>
        </div>
      )}

      {!loading && activeTab === 'addresses' && (
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem' }}>
          <div>
            <h2>Saved Addresses</h2>
            {addresses.length === 0 ? (
              <p>No addresses found.</p>
            ) : (
              <ul style={{ listStyle: 'none', padding: 0, marginTop: '1rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                {addresses.map(addr => (
                  <li key={addr.addressId} style={{ background: '#f5f5f5', padding: '1rem', borderRadius: '6px', position: 'relative' }}>
                    <p style={{ fontWeight: 'bold' }}>{addr.buildingName}</p>
                    <p>{addr.street}, {addr.city}</p>
                    <p>{addr.state}, {addr.country} - {addr.pincode}</p>
                    <button 
                      onClick={() => handleDeleteAddress(addr.addressId)} 
                      style={{ 
                        position: 'absolute', 
                        right: '1rem', 
                        top: '1rem', 
                        background: '#f44336', 
                        color: 'white', 
                        border: 'none', 
                        padding: '0.25rem 0.5rem', 
                        borderRadius: '4px',
                        cursor: 'pointer' 
                      }}
                    >
                      Delete
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </div>
          <div style={{ background: '#f9f9f9', padding: '1.5rem', borderRadius: '8px' }}>
            <h2>Add New Address</h2>
            {formError && <p style={{ color: 'red' }}>{formError}</p>}
            <form onSubmit={handleAddAddress} style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', marginTop: '1rem' }}>
              <input type="text" placeholder="Building Name" value={buildingName} onChange={(e) => setBuildingName(e.target.value)} style={{ padding: '0.5rem' }} />
              <input type="text" placeholder="Street Name" value={street} onChange={(e) => setStreet(e.target.value)} style={{ padding: '0.5rem' }} />
              <input type="text" placeholder="City" value={city} onChange={(e) => setCity(e.target.value)} style={{ padding: '0.5rem' }} />
              <input type="text" placeholder="State" value={state} onChange={(e) => setState(e.target.value)} style={{ padding: '0.5rem' }} />
              <input type="text" placeholder="Country" value={country} onChange={(e) => setCountry(e.target.value)} style={{ padding: '0.5rem' }} />
              <input type="text" placeholder="Pincode" value={pincode} onChange={(e) => setPincode(e.target.value)} style={{ padding: '0.5rem' }} />
              <button type="submit" className="cart-btn-primary" style={{ padding: '0.5rem', cursor: 'pointer' }}>Add Address</button>
            </form>
          </div>
        </div>
      )}

      {!loading && activeTab === 'orders' && (
        <div>
          <h2>Order History</h2>
          {orders.length === 0 ? (
            <p style={{ marginTop: '1rem' }}>You have not placed any orders yet.</p>
          ) : (
            <ul style={{ listStyle: 'none', padding: 0, marginTop: '1rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              {orders.map(order => (
                <li key={order.orderId} style={{ background: '#f9f9f9', padding: '1.5rem', borderRadius: '8px', borderLeft: '5px solid #005c97' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: 'bold', marginBottom: '0.5rem' }}>
                    <span>Order #{order.orderId}</span>
                    <span>{order.orderDate}</span>
                  </div>
                  <p><strong>Status:</strong> <span style={{ color: order.orderStatus === 'PAID' || order.orderStatus === 'CONFIRMED' ? 'green' : '#ff9800' }}>{order.orderStatus}</span></p>
                  <p><strong>Total Amount:</strong> ${order.totalAmount.toFixed(2)}</p>
                  <div style={{ marginTop: '1rem' }}>
                    <p style={{ fontWeight: 'bold' }}>Items:</p>
                    <ul style={{ paddingLeft: '1.25rem', marginTop: '0.25rem' }}>
                      {order.orderItems?.map(item => (
                        <li key={item.orderItemId}>
                          {item.productName} (x{item.quantity}) - ${(item.orderedProductPrice * item.quantity).toFixed(2)}
                        </li>
                      ))}
                    </ul>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>
      )}
    </div>
  );
}
