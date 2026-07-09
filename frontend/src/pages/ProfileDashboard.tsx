import { useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { apiClient } from '../lib/api';
import type { Address, Order } from '../types';
import './ProfileDashboard.css';

const EMPTY_ADDR = { buildingName: '', street: '', city: '', state: '', country: '', pincode: '' };
type Tab = 'profile' | 'addresses' | 'orders';

export function ProfileDashboard() {
  const { user } = useAuth();
  const location = useLocation();

  const initialTab: Tab =
    (location.state as { tab?: Tab } | null)?.tab ??
    (new URLSearchParams(location.search).get('tab') as Tab | null) ??
    'profile';

  const [activeTab, setActiveTab]   = useState<Tab>(initialTab);
  const [addresses, setAddresses]   = useState<Address[]>([]);
  const [orders, setOrders]         = useState<Order[]>([]);
  const [loading, setLoading]       = useState(true);

  /* ── Add form ── */
  const [showAddForm, setShowAddForm] = useState(false);
  const [addForm, setAddForm]         = useState(EMPTY_ADDR);
  const [addError, setAddError]       = useState<string | null>(null);
  const [addSaving, setAddSaving]     = useState(false);

  /* ── Edit form ── */
  const [editingId, setEditingId]   = useState<number | null>(null);
  const [editForm, setEditForm]     = useState(EMPTY_ADDR);
  const [editError, setEditError]   = useState<string | null>(null);
  const [editSaving, setEditSaving] = useState(false);

  useEffect(() => {
    setLoading(true);
    Promise.all([apiClient.getUserAddresses(), apiClient.getMyOrders()])
      .then(([a, o]) => { setAddresses(a); setOrders(o); })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  /* ── Add ── */
  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault(); setAddError(null);
    const { buildingName, street, city, state, country, pincode } = addForm;
    if (!buildingName || !street || !city || !state || !country || !pincode) { setAddError('All fields are required.'); return; }
    setAddSaving(true);
    try {
      const saved = await apiClient.addAddress(addForm);
      setAddresses(p => [...p, saved]); setAddForm(EMPTY_ADDR); setShowAddForm(false);
    } catch { setAddError('Failed to save address.'); }
    finally { setAddSaving(false); }
  };

  /* ── Edit ── */
  const startEdit = (a: Address) => {
    setEditingId(a.addressId);
    setEditForm({ buildingName: a.buildingName, street: a.street, city: a.city, state: a.state, country: a.country, pincode: a.pincode });
    setEditError(null); setShowAddForm(false);
  };
  const handleEdit = async (e: React.FormEvent) => {
    e.preventDefault(); setEditError(null);
    if (!editingId) return;
    const { buildingName, street, city, state, country, pincode } = editForm;
    if (!buildingName || !street || !city || !state || !country || !pincode) { setEditError('All fields are required.'); return; }
    setEditSaving(true);
    try {
      const updated = await apiClient.updateAddress(editingId, editForm);
      setAddresses(p => p.map(a => a.addressId === editingId ? updated : a)); setEditingId(null);
    } catch { setEditError('Failed to update address.'); }
    finally { setEditSaving(false); }
  };

  /* ── Delete ── */
  const handleDelete = async (id: number) => {
    if (!confirm('Delete this address?')) return;
    try {
      await apiClient.deleteAddress(id);
      setAddresses(p => p.filter(a => a.addressId !== id));
      if (editingId === id) setEditingId(null);
    } catch {
      // Ignored: delete failure is handled or is non-blocking
    }
  };

  /* ── Derived stats ── */
  const totalSpent   = orders.filter(o => o.orderStatus !== 'Cancelled').reduce((s, o) => s + (o.totalAmount ?? 0), 0);
  const delivered    = orders.filter(o => o.orderStatus === 'Delivered').length;
  const initials     = (user?.username ?? 'U').slice(0, 2).toUpperCase();
  const joinedDate   = user?.joinedDate ?? null;
  const displayName  = user?.name || user?.username;

  const statusColor = (s: string) => {
    if (s === 'Delivered') return '#059669';
    if (s === 'Cancelled') return '#dc2626';
    if (s === 'Shipped')   return '#7c3aed';
    return '#d97706';
  };

  if (loading) return (
    <div className="pf-loading">
      <div className="pf-spinner" />
    </div>
  );

  return (
    <div className="pf-root">

      {/* ── HERO BANNER ── */}
      <div className="pf-hero">
        <div className="pf-hero__bg" />
        <div className="container pf-hero__body">
          <div className="pf-avatar">{initials}</div>
          <div className="pf-hero__info">
            <h1 className="pf-hero__name">{displayName}</h1>
            <p className="pf-hero__sub">
              {user?.email}
              {joinedDate && <span className="pf-hero__joined"> · Member since {new Date(joinedDate).toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}</span>}
            </p>
            <div className="pf-hero__badges">
              {user?.roles?.map(r => (
                <span key={r} className="pf-badge">{r.replace('ROLE_', '')}</span>
              ))}
            </div>
          </div>
          {/* Quick stats */}
          <div className="pf-hero__stats">
            <div className="pf-stat">
              <span className="pf-stat__val">{orders.length}</span>
              <span className="pf-stat__lbl">Orders</span>
            </div>
            <div className="pf-stat">
              <span className="pf-stat__val">{delivered}</span>
              <span className="pf-stat__lbl">Delivered</span>
            </div>
            <div className="pf-stat">
              <span className="pf-stat__val">${totalSpent.toFixed(0)}</span>
              <span className="pf-stat__lbl">Total Spent</span>
            </div>
            <div className="pf-stat">
              <span className="pf-stat__val">{addresses.length}</span>
              <span className="pf-stat__lbl">Addresses</span>
            </div>
          </div>
        </div>
      </div>

      {/* ── TABS ── */}
      <div className="pf-tabs-wrap container">
        <div className="pf-tabs">
          {(['profile', 'addresses', 'orders'] as Tab[]).map(t => (
            <button key={t} className={`pf-tab${activeTab === t ? ' pf-tab--active' : ''}`} onClick={() => setActiveTab(t)}>
              {t === 'profile'   && <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="8" r="4"/><path d="M4 20c0-4 3.6-7 8-7s8 3 8 7"/></svg>}
              {t === 'addresses' && <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7z"/><circle cx="12" cy="9" r="2.5"/></svg>}
              {t === 'orders'    && <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M6 2L3 6v14a2 2 0 002 2h14a2 2 0 002-2V6l-3-4z"/><line x1="3" y1="6" x2="21" y2="6"/><path d="M16 10a4 4 0 01-8 0"/></svg>}
              {t.charAt(0).toUpperCase() + t.slice(1)}
              {t === 'orders' && orders.length > 0 && <span className="pf-tab__count">{orders.length}</span>}
              {t === 'addresses' && addresses.length > 0 && <span className="pf-tab__count">{addresses.length}</span>}
            </button>
          ))}
        </div>
      </div>

      {/* ── CONTENT ── */}
      <div className="container pf-content">

        {/* ── PROFILE TAB ── */}
        {activeTab === 'profile' && (
          <div className="pf-section">
            <div className="pf-card pf-info-card">
              <div className="pf-card__header">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="8" r="4"/><path d="M4 20c0-4 3.6-7 8-7s8 3 8 7"/></svg>
                Personal Information
              </div>
              <div className="pf-info-rows">
                <div className="pf-info-row">
                  <span className="pf-info-row__key">Display Name</span>
                  <span className="pf-info-row__val">{displayName}</span>
                </div>
                <div className="pf-info-row">
                  <span className="pf-info-row__key">Username</span>
                  <span className="pf-info-row__val pf-mono">@{user?.username}</span>
                </div>
                <div className="pf-info-row">
                  <span className="pf-info-row__key">Email</span>
                  <span className="pf-info-row__val">{user?.email}</span>
                </div>
                {joinedDate && (
                  <div className="pf-info-row">
                    <span className="pf-info-row__key">Member Since</span>
                    <span className="pf-info-row__val">{new Date(joinedDate).toLocaleDateString('en-US', { day: 'numeric', month: 'long', year: 'numeric' })}</span>
                  </div>
                )}
              </div>
            </div>

            {/* Activity summary mini-cards */}
            <div className="pf-mini-grid">
              <div className="pf-mini-card pf-mini-card--blue">
                <div className="pf-mini-card__icon">🛒</div>
                <div>
                  <p className="pf-mini-card__val">{orders.length}</p>
                  <p className="pf-mini-card__lbl">Total Orders</p>
                </div>
              </div>
              <div className="pf-mini-card pf-mini-card--green">
                <div className="pf-mini-card__icon">✅</div>
                <div>
                  <p className="pf-mini-card__val">{delivered}</p>
                  <p className="pf-mini-card__lbl">Delivered</p>
                </div>
              </div>
              <div className="pf-mini-card pf-mini-card--purple">
                <div className="pf-mini-card__icon">💳</div>
                <div>
                  <p className="pf-mini-card__val">${totalSpent.toFixed(2)}</p>
                  <p className="pf-mini-card__lbl">Total Spent</p>
                </div>
              </div>
              <div className="pf-mini-card pf-mini-card--orange">
                <div className="pf-mini-card__icon">📍</div>
                <div>
                  <p className="pf-mini-card__val">{addresses.length}</p>
                  <p className="pf-mini-card__lbl">Saved Addresses</p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ── ADDRESSES TAB ── */}
        {activeTab === 'addresses' && (
          <div className="pf-section">
            <div className="pf-section-header">
              <div>
                <h2 className="pf-section-title">Saved Addresses</h2>
                <p className="pf-section-sub">{addresses.length} address{addresses.length !== 1 ? 'es' : ''} on file</p>
              </div>
              {!showAddForm && !editingId && (
                <button className="pf-btn pf-btn--primary" onClick={() => { setShowAddForm(true); setAddError(null); setAddForm(EMPTY_ADDR); }}>
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
                  Add New Address
                </button>
              )}
            </div>

            {addresses.length === 0 && !showAddForm && (
              <div className="pf-empty">
                <div className="pf-empty__icon">📍</div>
                <p className="pf-empty__title">No addresses yet</p>
                <p className="pf-empty__sub">Add a shipping address to speed up checkout.</p>
                <button className="pf-btn pf-btn--primary" onClick={() => setShowAddForm(true)}>+ Add Address</button>
              </div>
            )}

            <div className="pf-addr-grid">
              {addresses.map(addr => (
                <div key={addr.addressId} className="pf-addr-card">
                  {editingId === addr.addressId ? (
                    <form onSubmit={handleEdit} className="pf-addr-form">
                      <p className="pf-addr-form__title">Edit Address</p>
                      {editError && <p className="pf-form-error">{editError}</p>}
                      <div className="pf-form-grid">
                        <div className="pf-form-field pf-form-field--full">
                          <label>Building / Apartment Name</label>
                          <input value={editForm.buildingName} onChange={e => setEditForm(f => ({ ...f, buildingName: e.target.value }))} />
                        </div>
                        <div className="pf-form-field pf-form-field--full">
                          <label>Street</label>
                          <input value={editForm.street} onChange={e => setEditForm(f => ({ ...f, street: e.target.value }))} />
                        </div>
                        <div className="pf-form-field">
                          <label>City</label>
                          <input value={editForm.city} onChange={e => setEditForm(f => ({ ...f, city: e.target.value }))} />
                        </div>
                        <div className="pf-form-field">
                          <label>State / Gov.</label>
                          <input value={editForm.state} onChange={e => setEditForm(f => ({ ...f, state: e.target.value }))} />
                        </div>
                        <div className="pf-form-field">
                          <label>Country</label>
                          <input value={editForm.country} onChange={e => setEditForm(f => ({ ...f, country: e.target.value }))} />
                        </div>
                        <div className="pf-form-field">
                          <label>Postal Code</label>
                          <input value={editForm.pincode} onChange={e => setEditForm(f => ({ ...f, pincode: e.target.value }))} />
                        </div>
                      </div>
                      <div className="pf-form-actions">
                        <button type="submit" className="pf-btn pf-btn--primary" disabled={editSaving}>{editSaving ? 'Saving…' : 'Save Changes'}</button>
                        <button type="button" className="pf-btn pf-btn--ghost" onClick={() => setEditingId(null)}>Cancel</button>
                      </div>
                    </form>
                  ) : (
                    <>
                      <div className="pf-addr-card__icon">📍</div>
                      <div className="pf-addr-card__body">
                        <p className="pf-addr-card__building">{addr.buildingName}</p>
                        <p className="pf-addr-card__line">{addr.street}</p>
                        <p className="pf-addr-card__line">{addr.city}, {addr.state}</p>
                        <p className="pf-addr-card__line">{addr.country} · {addr.pincode}</p>
                      </div>
                      <div className="pf-addr-card__actions">
                        <button className="pf-btn pf-btn--sm pf-btn--ghost" onClick={() => startEdit(addr)}>Edit</button>
                        <button className="pf-btn pf-btn--sm pf-btn--danger" onClick={() => handleDelete(addr.addressId)}>Delete</button>
                      </div>
                    </>
                  )}
                </div>
              ))}

              {/* Add form card */}
              {showAddForm && (
                <div className="pf-addr-card pf-addr-card--form">
                  <form onSubmit={handleAdd} className="pf-addr-form">
                    <p className="pf-addr-form__title">New Address</p>
                    {addError && <p className="pf-form-error">{addError}</p>}
                    <div className="pf-form-grid">
                      <div className="pf-form-field pf-form-field--full">
                        <label>Building / Apartment Name</label>
                        <input placeholder="e.g. Nile Tower, Apt 4B" value={addForm.buildingName} onChange={e => setAddForm(f => ({ ...f, buildingName: e.target.value }))} />
                      </div>
                      <div className="pf-form-field pf-form-field--full">
                        <label>Street</label>
                        <input placeholder="e.g. 12 Tahrir St" value={addForm.street} onChange={e => setAddForm(f => ({ ...f, street: e.target.value }))} />
                      </div>
                      <div className="pf-form-field">
                        <label>City</label>
                        <input placeholder="Cairo" value={addForm.city} onChange={e => setAddForm(f => ({ ...f, city: e.target.value }))} />
                      </div>
                      <div className="pf-form-field">
                        <label>State / Gov.</label>
                        <input placeholder="Cairo" value={addForm.state} onChange={e => setAddForm(f => ({ ...f, state: e.target.value }))} />
                      </div>
                      <div className="pf-form-field">
                        <label>Country</label>
                        <input placeholder="Egypt" value={addForm.country} onChange={e => setAddForm(f => ({ ...f, country: e.target.value }))} />
                      </div>
                      <div className="pf-form-field">
                        <label>Postal Code</label>
                        <input placeholder="11511" value={addForm.pincode} onChange={e => setAddForm(f => ({ ...f, pincode: e.target.value }))} />
                      </div>
                    </div>
                    <div className="pf-form-actions">
                      <button type="submit" className="pf-btn pf-btn--primary" disabled={addSaving}>{addSaving ? 'Saving…' : 'Save Address'}</button>
                      <button type="button" className="pf-btn pf-btn--ghost" onClick={() => { setShowAddForm(false); setAddError(null); }}>Cancel</button>
                    </div>
                  </form>
                </div>
              )}
            </div>
          </div>
        )}

        {/* ── ORDERS TAB ── */}
        {activeTab === 'orders' && (
          <div className="pf-section">
            <div className="pf-section-header">
              <div>
                <h2 className="pf-section-title">Order History</h2>
                <p className="pf-section-sub">{orders.length} order{orders.length !== 1 ? 's' : ''} placed</p>
              </div>
            </div>

            {orders.length === 0 ? (
              <div className="pf-empty">
                <div className="pf-empty__icon">🛍️</div>
                <p className="pf-empty__title">No orders yet</p>
                <p className="pf-empty__sub">When you place an order it will show up here.</p>
              </div>
            ) : (
              <div className="pf-orders">
                {orders.map(order => (
                  <div key={order.orderId} className="pf-order-card">
                    <div className="pf-order-card__head">
                      <div className="pf-order-card__id">Order #{order.orderId}</div>
                      <div className="pf-order-card__meta">
                        <span className="pf-order-card__date">{order.orderDate}</span>
                        <span className="pf-order-status" style={{ '--s-color': statusColor(order.orderStatus) } as React.CSSProperties}>
                          {order.orderStatus}
                        </span>
                      </div>
                    </div>
                    <div className="pf-order-card__items">
                      {order.orderItems?.map(item => (
                        <div key={item.orderItemId} className="pf-order-item">
                          <span className="pf-order-item__name">{item.product?.productName}</span>
                          <span className="pf-order-item__qty">×{item.quantity}</span>
                          <span className="pf-order-item__price">${(item.orderedProductPrice * item.quantity).toFixed(2)}</span>
                        </div>
                      ))}
                    </div>
                    <div className="pf-order-card__foot">
                      <span className="pf-order-card__total-lbl">Total</span>
                      <span className="pf-order-card__total">${order.totalAmount?.toFixed(2)}</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
