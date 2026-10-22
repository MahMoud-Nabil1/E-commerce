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

  /* ── Shared field styles ── */
  const inputCls = 'w-full px-3 py-[0.6rem] rounded-md border border-outline-variant text-[0.9rem] text-on-surface bg-surface box-border font-sans outline-none focus:border-secondary transition-colors';
  const labelCls = 'block font-semibold mb-1.5 text-[0.85rem] text-on-surface-variant';

  return (
    <div className="container px-4 py-8 max-w-[640px]">
      <h1 className="text-3xl font-extrabold text-on-surface tracking-tight mb-7">Checkout</h1>

      {error && (
        <div className="mb-4 px-4 py-3 rounded-md bg-red-50 text-red-800 text-[0.9rem]">
          {error}
        </div>
      )}

      <form onSubmit={handlePlaceOrder} className="flex flex-col gap-7">

        {/* ── SHIPPING ADDRESS ─────────────────────────────── */}
        <section>
          <div className="flex items-center justify-between mb-[0.85rem]">
            <h2 className="text-base font-bold text-on-surface m-0">Shipping Address</h2>
            <button
              type="button"
              onClick={() => { setShowAddForm(v => !v); setAddrError(null); setAddrForm(EMPTY_FORM); }}
              className={`flex items-center gap-1.5 border-none rounded-md px-[0.9rem] py-[0.4rem] text-[0.85rem] font-semibold cursor-pointer transition-colors ${
                showAddForm
                  ? 'bg-surface-low text-on-surface'
                  : 'bg-secondary text-on-secondary hover:bg-secondary-container'
              }`}
            >
              {showAddForm ? '✕ Cancel' : '+ Add New Address'}
            </button>
          </div>

          {/* Saved address cards */}
          {addresses.length > 0 && (
            <div className={`flex flex-col gap-[0.6rem] ${showAddForm ? 'mb-4' : ''}`}>
              {addresses.map(addr => {
                const selected = addressId === addr.addressId;
                return (
                  <label
                    key={addr.addressId}
                    className={`flex items-start gap-3 px-4 py-[0.85rem] rounded-lg cursor-pointer transition-[border,background] ${
                      selected
                        ? 'border-2 border-secondary bg-blue-50'
                        : 'border-[1.5px] border-outline-variant bg-white'
                    }`}
                  >
                    <input
                      type="radio"
                      name="address"
                      value={addr.addressId}
                      checked={selected}
                      onChange={() => setAddressId(addr.addressId)}
                      className="mt-[3px] accent-secondary"
                    />
                    <div className="flex-1">
                      <p className="font-bold m-0 mb-0.5">{addr.buildingName}</p>
                      <p className="m-0 text-[0.875rem] text-on-surface-variant">
                        {addr.street}, {addr.city}, {addr.state}
                      </p>
                      <p className="m-0 text-[0.875rem] text-on-surface-variant">
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
            <p className="text-on-surface-variant text-[0.9rem] m-0">
              No saved addresses yet. Click <strong>"+ Add New Address"</strong> to add one.
            </p>
          )}

          {/* Manage link */}
          {addresses.length > 0 && !showAddForm && (
            <p className="mt-2 text-[0.8rem] text-on-surface-variant">
              Need to edit or delete an address?{' '}
              <Link to="/profile" state={{ tab: 'addresses' }} className="text-secondary font-semibold no-underline hover:underline">
                Manage in Profile →
              </Link>
            </p>
          )}

          {/* ── Inline add-address form ── */}
          {showAddForm && (
            <div className="bg-blue-50 border-[1.5px] border-blue-200 rounded-[10px] p-5">
              <p className="font-bold text-secondary m-0 mb-4">New Address</p>
              {addrError && <p className="text-red-700 text-[0.85rem] m-0 mb-3">{addrError}</p>}

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-[0.7rem]">
                <div className="col-span-1 sm:col-span-2">
                  <label className={labelCls}>Building / Apartment Name</label>
                  <input className={inputCls} type="text" placeholder="e.g. Nile Tower, Apt 4B"
                    value={addrForm.buildingName} onChange={e => setField('buildingName', e.target.value)} />
                </div>
                <div className="col-span-1 sm:col-span-2">
                  <label className={labelCls}>Street</label>
                  <input className={inputCls} type="text" placeholder="e.g. 12 Tahrir St"
                    value={addrForm.street} onChange={e => setField('street', e.target.value)} />
                </div>
                <div>
                  <label className={labelCls}>City</label>
                  <input className={inputCls} type="text" placeholder="Cairo"
                    value={addrForm.city} onChange={e => setField('city', e.target.value)} />
                </div>
                <div>
                  <label className={labelCls}>State / Governorate</label>
                  <input className={inputCls} type="text" placeholder="Cairo"
                    value={addrForm.state} onChange={e => setField('state', e.target.value)} />
                </div>
                <div>
                  <label className={labelCls}>Country</label>
                  <input className={inputCls} type="text" placeholder="Egypt"
                    value={addrForm.country} onChange={e => setField('country', e.target.value)} />
                </div>
                <div>
                  <label className={labelCls}>Postal Code</label>
                  <input className={inputCls} type="text" placeholder="11511"
                    value={addrForm.pincode} onChange={e => setField('pincode', e.target.value)} />
                </div>
              </div>

              <button
                type="button"
                onClick={handleAddAddress}
                disabled={addrSaving}
                className={`mt-4 w-full py-[0.65rem] bg-secondary text-on-secondary border-none rounded-md font-bold text-[0.9rem] transition-opacity ${addrSaving ? 'cursor-not-allowed opacity-70' : 'cursor-pointer hover:bg-secondary-container'}`}
              >
                {addrSaving ? 'Saving…' : 'Save Address'}
              </button>
            </div>
          )}
        </section>

        {/* ── PAYMENT METHOD ───────────────────────────────── */}
        <section>
          <h2 className="text-base font-bold text-on-surface mb-[0.85rem]">Payment Method</h2>
          <select
            value={paymentMethod}
            onChange={e => setPaymentMethod(e.target.value)}
            className={inputCls}
          >
            <option value="CASH_ON_DELIVERY">Cash on Delivery (COD)</option>
            <option value="INSTAPAY">InstaPay</option>
            <option value="VODAFONE_CASH">Vodafone Cash</option>
          </select>
        </section>

        {paymentMethod !== 'CASH_ON_DELIVERY' && (
          <section>
            <label className="block text-base font-bold text-on-surface mb-[0.85rem]">Transaction ID / Wallet Number</label>
            <input
              type="text"
              value={transactionId}
              onChange={e => setTransactionId(e.target.value)}
              placeholder="Enter transfer transaction reference ID"
              required
              className={inputCls}
            />
          </section>
        )}

        <button
          type="submit"
          disabled={loading || !addressId}
          className={`w-full py-[0.9rem] text-base border-none rounded-lg font-bold bg-secondary text-on-secondary transition-all ${
            loading || !addressId
              ? 'cursor-not-allowed opacity-60'
              : 'cursor-pointer hover:bg-secondary-container active:scale-[0.98]'
          }`}
        >
          {loading ? 'Processing…' : 'Confirm and Place Order'}
        </button>

      </form>
    </div>
  );
}
