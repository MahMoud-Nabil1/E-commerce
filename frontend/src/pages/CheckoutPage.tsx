import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { apiClient } from '../lib/api';
import type { Address } from '../types';

const EMPTY_FORM = { buildingName: '', street: '', city: '', state: '', country: '', pincode: '' };

export default function CheckoutPage() {
  const navigate = useNavigate();

  const [addresses, setAddresses]   = useState<Address[]>([]);
  const [addressId, setAddressId]   = useState<number | null>(null);
  const [paymentMethod, setPaymentMethod] = useState('CASH_ON_DELIVERY');
  const [transactionId, setTransactionId] = useState('');
  const [loading, setLoading]       = useState(false);
  const [error, setError]           = useState<string | null>(null);

  // Add-address form
  const [showAddForm, setShowAddForm] = useState(false);
  const [addrForm, setAddrForm]       = useState(EMPTY_FORM);
  const [addrError, setAddrError]     = useState<string | null>(null);
  const [addrSaving, setAddrSaving]   = useState(false);

  useEffect(() => {
    apiClient.getUserAddresses().then(list => {
      setAddresses(list);
      if (list.length > 0) setAddressId(list[0].addressId);
    }).catch(() => {});
  }, []);

  const setField = (k: keyof typeof EMPTY_FORM, v: string) =>
    setAddrForm(f => ({ ...f, [k]: v }));

  const handleAddAddress = async () => {
    setAddrError(null);
    const { buildingName, street, city, state, country, pincode } = addrForm;
    if (!buildingName || !street || !city || !state || !country || !pincode) {
      setAddrError('All fields are required.'); return;
    }
    setAddrSaving(true);
    try {
      const saved = await apiClient.addAddress(addrForm);
      setAddresses(prev => [...prev, saved]);
      setAddressId(saved.addressId);
      setAddrForm(EMPTY_FORM);
      setShowAddForm(false);
    } catch {
      setAddrError('Failed to save address.');
    } finally { setAddrSaving(false); }
  };

  const handlePlaceOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!addressId) { setError('Please select or add a shipping address.'); return; }
    setLoading(true); setError(null);
    try {
      const order = await apiClient.placeOrder(addressId, paymentMethod, transactionId);
      navigate(`/order-success/${order.orderId}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Checkout failed');
    } finally { setLoading(false); }
  };

  /* ── Styles ── */
  const inp: React.CSSProperties = {
    width: '100%', padding: '0.6rem 0.75rem', borderRadius: '6px',
    border: '1px solid #ccc', fontSize: '0.9rem', boxSizing: 'border-box',
  };
  const lbl: React.CSSProperties = { display: 'block', fontWeight: 600, marginBottom: '0.35rem', fontSize: '0.85rem', color: '#444' };

  return (
    <div className="container" style={{ padding: '2rem 1rem', maxWidth: '640px' }}>
      <h1 className="headline-lg" style={{ marginBottom: '1.75rem' }}>Checkout</h1>

      {error && (
        <div style={{ marginBottom: '1rem', padding: '0.75rem 1rem', borderRadius: '6px', background: '#ffebee', color: '#c62828', fontSize: '0.9rem' }}>
          {error}
        </div>
      )}

      <form onSubmit={handlePlaceOrder} style={{ display: 'flex', flexDirection: 'column', gap: '1.75rem' }}>

        {/* ── SHIPPING ADDRESS ─────────────────────────────── */}
        <section>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.85rem' }}>
            <h2 style={{ fontSize: '1rem', fontWeight: 700, margin: 0 }}>Shipping Address</h2>
            <button
              type="button"
              onClick={() => { setShowAddForm(v => !v); setAddrError(null); setAddrForm(EMPTY_FORM); }}
              style={{
                display: 'flex', alignItems: 'center', gap: '0.35rem',
                background: showAddForm ? '#f5f5f5' : '#005c97', color: showAddForm ? '#333' : '#fff',
                border: 'none', borderRadius: '6px', padding: '0.4rem 0.9rem',
                fontSize: '0.85rem', fontWeight: 600, cursor: 'pointer',
              }}
            >
              {showAddForm ? '✕ Cancel' : '+ Add New Address'}
            </button>
          </div>

          {/* Saved address cards */}
          {addresses.length > 0 && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem', marginBottom: showAddForm ? '1rem' : 0 }}>
              {addresses.map(addr => {
                const selected = addressId === addr.addressId;
                return (
                  <label
                    key={addr.addressId}
                    style={{
                      display: 'flex', alignItems: 'flex-start', gap: '0.75rem',
                      padding: '0.85rem 1rem', borderRadius: '8px', cursor: 'pointer',
                      border: selected ? '2px solid #005c97' : '1.5px solid #ddd',
                      background: selected ? '#f0f7ff' : '#fff',
                      transition: 'border 0.15s',
                    }}
                  >
                    <input
                      type="radio"
                      name="address"
                      value={addr.addressId}
                      checked={selected}
                      onChange={() => setAddressId(addr.addressId)}
                      style={{ marginTop: '3px', accentColor: '#005c97' }}
                    />
                    <div style={{ flex: 1 }}>
                      <p style={{ fontWeight: 700, margin: '0 0 2px' }}>{addr.buildingName}</p>
                      <p style={{ margin: '0', fontSize: '0.875rem', color: '#555' }}>
                        {addr.street}, {addr.city}, {addr.state}
                      </p>
                      <p style={{ margin: '0', fontSize: '0.875rem', color: '#555' }}>
                        {addr.country} — {addr.pincode}
                      </p>
                    </div>
                  </label>
                );
              })}
            </div>
          )}

          {/* No addresses + no form open */}
          {addresses.length === 0 && !showAddForm && (
            <p style={{ color: '#888', fontSize: '0.9rem', margin: 0 }}>
              No saved addresses yet. Click <strong>"+ Add New Address"</strong> to add one.
            </p>
          )}

          {/* Manage link */}
          {addresses.length > 0 && !showAddForm && (
            <p style={{ marginTop: '0.5rem', fontSize: '0.8rem', color: '#666' }}>
              Need to edit or delete an address?{' '}
              <Link to="/profile" state={{ tab: 'addresses' }} style={{ color: '#005c97', fontWeight: 600 }}>
                Manage in Profile →
              </Link>
            </p>
          )}

          {/* ── Inline add-address form ── */}
          {showAddForm && (
            <div style={{
              background: '#f5f8ff', border: '1.5px solid #c5d5f0',
              borderRadius: '10px', padding: '1.25rem',
            }}>
              <p style={{ fontWeight: 700, color: '#005c97', margin: '0 0 1rem' }}>New Address</p>
              {addrError && <p style={{ color: '#c62828', fontSize: '0.85rem', margin: '0 0 0.75rem' }}>{addrError}</p>}

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.7rem' }}>
                <div style={{ gridColumn: '1 / -1' }}>
                  <label style={lbl}>Building / Apartment Name</label>
                  <input style={inp} type="text" placeholder="e.g. Nile Tower, Apt 4B"
                    value={addrForm.buildingName} onChange={e => setField('buildingName', e.target.value)} />
                </div>
                <div style={{ gridColumn: '1 / -1' }}>
                  <label style={lbl}>Street</label>
                  <input style={inp} type="text" placeholder="e.g. 12 Tahrir St"
                    value={addrForm.street} onChange={e => setField('street', e.target.value)} />
                </div>
                <div>
                  <label style={lbl}>City</label>
                  <input style={inp} type="text" placeholder="Cairo"
                    value={addrForm.city} onChange={e => setField('city', e.target.value)} />
                </div>
                <div>
                  <label style={lbl}>State / Governorate</label>
                  <input style={inp} type="text" placeholder="Cairo"
                    value={addrForm.state} onChange={e => setField('state', e.target.value)} />
                </div>
                <div>
                  <label style={lbl}>Country</label>
                  <input style={inp} type="text" placeholder="Egypt"
                    value={addrForm.country} onChange={e => setField('country', e.target.value)} />
                </div>
                <div>
                  <label style={lbl}>Postal Code</label>
                  <input style={inp} type="text" placeholder="11511"
                    value={addrForm.pincode} onChange={e => setField('pincode', e.target.value)} />
                </div>
              </div>

              <button
                type="button"
                onClick={handleAddAddress}
                disabled={addrSaving}
                style={{
                  marginTop: '1rem', width: '100%', padding: '0.65rem',
                  background: '#005c97', color: '#fff', border: 'none',
                  borderRadius: '6px', fontWeight: 700, fontSize: '0.9rem',
                  cursor: addrSaving ? 'not-allowed' : 'pointer',
                  opacity: addrSaving ? 0.7 : 1,
                }}
              >
                {addrSaving ? 'Saving…' : 'Save Address'}
              </button>
            </div>
          )}
        </section>

        {/* ── PAYMENT METHOD ───────────────────────────────── */}
        <section>
          <h2 style={{ fontSize: '1rem', fontWeight: 700, marginBottom: '0.85rem' }}>Payment Method</h2>
          <select value={paymentMethod} onChange={e => setPaymentMethod(e.target.value)} style={inp}>
            <option value="CASH_ON_DELIVERY">Cash on Delivery (COD)</option>
            <option value="INSTAPAY">InstaPay</option>
            <option value="VODAFONE_CASH">Vodafone Cash</option>
          </select>
        </section>

        {paymentMethod !== 'CASH_ON_DELIVERY' && (
          <section>
            <label style={{ ...lbl, fontSize: '1rem', fontWeight: 700 }}>Transaction ID / Wallet Number</label>
            <input
              type="text" value={transactionId} onChange={e => setTransactionId(e.target.value)}
              placeholder="Enter transfer transaction reference ID"
              required style={inp}
            />
          </section>
        )}

        <button
          type="submit"
          disabled={loading || !addressId}
          className="cart-btn-primary"
          style={{
            padding: '0.9rem', fontSize: '1rem', border: 'none', borderRadius: '8px',
            fontWeight: 700, cursor: loading || !addressId ? 'not-allowed' : 'pointer',
            opacity: loading || !addressId ? 0.6 : 1,
          }}
        >
          {loading ? 'Processing…' : 'Confirm and Place Order'}
        </button>

      </form>
    </div>
  );
}
