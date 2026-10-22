import { useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { apiClient } from '../lib/api';
import type { Address, Order } from '../types';

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

  /* ── Shared class helpers ── */
  const inputCls = 'w-full px-3 py-[0.55rem] rounded-lg border-[1.5px] border-outline-variant font-sans text-[0.875rem] text-on-surface bg-surface outline-none transition-colors focus:border-secondary box-border';
  const labelCls = 'text-[0.78rem] font-semibold text-on-surface-variant';

  const btnPrimary = (sm?: boolean) =>
    `inline-flex items-center gap-1.5 ${sm ? 'px-3 py-[0.35rem] text-[0.8rem]' : 'px-[1.1rem] py-[0.55rem] text-[0.875rem]'} rounded-lg bg-secondary text-white font-bold cursor-pointer border-none transition-all hover:bg-secondary-container disabled:opacity-60 disabled:cursor-not-allowed`;

  const btnGhost = (sm?: boolean) =>
    `inline-flex items-center gap-1.5 ${sm ? 'px-3 py-[0.35rem] text-[0.8rem]' : 'px-[1.1rem] py-[0.55rem] text-[0.875rem]'} rounded-lg bg-surface-container text-on-surface font-bold cursor-pointer border border-outline-variant transition-all hover:bg-surface-high disabled:opacity-60 disabled:cursor-not-allowed`;

  const btnDanger = (sm?: boolean) =>
    `inline-flex items-center gap-1.5 ${sm ? 'px-3 py-[0.35rem] text-[0.8rem]' : 'px-[1.1rem] py-[0.55rem] text-[0.875rem]'} rounded-lg bg-error-container text-error font-bold cursor-pointer border-none transition-all hover:bg-[#ffdad6] disabled:opacity-60 disabled:cursor-not-allowed`;

  if (loading) return (
    <div className="flex items-center justify-center min-h-[calc(100vh-var(--navbar-height,64px))]">
      <div className="w-10 h-10 rounded-full border-[3px] border-surface-high border-t-secondary animate-spin" />
    </div>
  );

  return (
    <div className="min-h-[calc(100vh-var(--navbar-height,64px))] bg-background">

      {/* ── HERO BANNER ── */}
      <div className="relative overflow-hidden pt-12 pb-9">
        {/* gradient background */}
        <div className="absolute inset-0 opacity-[0.97]"
          style={{ background: 'linear-gradient(135deg, var(--color-primary) 0%, #1a2b4c 60%, var(--color-secondary) 100%)' }} />
        {/* dot pattern overlay */}
        <div className="absolute inset-0"
          style={{ background: "url(\"data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.04'%3E%3Ccircle cx='30' cy='30' r='28'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E\") repeat" }} />

        <div className="container relative flex flex-col sm:flex-row items-start sm:items-center gap-4 sm:gap-6">
          {/* Avatar */}
          <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-full bg-secondary border-[3px] border-white/25 text-white text-[1.4rem] sm:text-[1.75rem] font-extrabold flex items-center justify-center shrink-0 shadow-[0_4px_20px_rgba(0,0,0,0.25)]">
            {initials}
          </div>

          {/* Info */}
          <div className="flex-1 min-w-0">
            <h1 className="text-[1.3rem] sm:text-[1.6rem] font-extrabold text-white m-0 mb-1 tracking-[-0.02em]">{displayName}</h1>
            <p className="text-[0.8rem] sm:text-[0.875rem] text-white/70 m-0 mb-2.5">
              {user?.email}
              {joinedDate && <span className="text-white/50"> · Member since {new Date(joinedDate).toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}</span>}
            </p>
            <div className="flex gap-1.5 flex-wrap">
              {user?.roles?.map(r => (
                <span key={r} className="inline-block px-[10px] py-[2px] rounded-full text-[0.72rem] font-bold tracking-[0.04em] uppercase bg-white/15 text-white/90 border border-white/20">
                  {r.replace('ROLE_', '')}
                </span>
              ))}
            </div>
          </div>

          {/* Quick stats */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-px bg-white/12 border border-white/12 rounded-2xl overflow-hidden w-full sm:w-auto shrink-0">
            {[
              { val: orders.length, lbl: 'Orders' },
              { val: delivered, lbl: 'Delivered' },
              { val: `$${totalSpent.toFixed(0)}`, lbl: 'Total Spent' },
              { val: addresses.length, lbl: 'Addresses' },
            ].map((s) => (
              <div key={s.lbl} className="px-4 py-2.5 flex flex-col items-center gap-0.5 bg-black/10">
                <span className="text-[1.1rem] sm:text-[1.2rem] font-extrabold text-white leading-none">{s.val}</span>
                <span className="text-[0.7rem] text-white/60 font-medium whitespace-nowrap">{s.lbl}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── TABS ── */}
      <div className="bg-surface border-b border-outline-variant sticky top-[var(--navbar-height,64px)] z-10">
        <div className="container flex overflow-x-auto scrollbar-thin">
          {(['profile', 'addresses', 'orders'] as Tab[]).map(t => (
            <button
              key={t}
              className={`flex items-center gap-[7px] px-5 py-[14px] bg-transparent border-none border-b-[3px] font-sans text-[0.875rem] font-semibold cursor-pointer transition-colors whitespace-nowrap ${
                activeTab === t
                  ? 'text-secondary border-b-secondary'
                  : 'text-on-surface-variant border-b-transparent hover:text-secondary'
              }`}
              onClick={() => setActiveTab(t)}
            >
              {t === 'profile'   && <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="8" r="4"/><path d="M4 20c0-4 3.6-7 8-7s8 3 8 7"/></svg>}
              {t === 'addresses' && <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7z"/><circle cx="12" cy="9" r="2.5"/></svg>}
              {t === 'orders'    && <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M6 2L3 6v14a2 2 0 002 2h14a2 2 0 002-2V6l-3-4z"/><line x1="3" y1="6" x2="21" y2="6"/><path d="M16 10a4 4 0 01-8 0"/></svg>}
              {t.charAt(0).toUpperCase() + t.slice(1)}
              {t === 'orders'    && orders.length > 0    && <span className="bg-secondary text-white rounded-full text-[0.68rem] font-extrabold px-1.5 py-[1px] leading-[1.4]">{orders.length}</span>}
              {t === 'addresses' && addresses.length > 0 && <span className="bg-secondary text-white rounded-full text-[0.68rem] font-extrabold px-1.5 py-[1px] leading-[1.4]">{addresses.length}</span>}
            </button>
          ))}
        </div>
      </div>

      {/* ── CONTENT ── */}
      <div className="container py-9 px-[var(--margin-edge,1rem)]">

        {/* ── PROFILE TAB ── */}
        {activeTab === 'profile' && (
          <div className="flex flex-col gap-6">
            {/* Personal info card */}
            <div className="bg-surface border border-outline-variant rounded-2xl overflow-hidden">
              <div className="flex items-center gap-2 px-5 py-4 text-[0.9rem] font-bold text-on-surface border-b border-outline-variant bg-surface-low">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="8" r="4"/><path d="M4 20c0-4 3.6-7 8-7s8 3 8 7"/></svg>
                Personal Information
              </div>
              <div className="flex flex-col">
                {[
                  { key: 'Display Name', val: displayName, mono: false },
                  { key: 'Username', val: `@${user?.username}`, mono: true },
                  { key: 'Email', val: user?.email, mono: false },
                  ...(joinedDate ? [{ key: 'Member Since', val: new Date(joinedDate).toLocaleDateString('en-US', { day: 'numeric', month: 'long', year: 'numeric' }), mono: false }] : []),
                ].map((row, i, arr) => (
                  <div key={row.key} className={`flex items-center px-5 py-[14px] gap-4 ${i < arr.length - 1 ? 'border-b border-surface-container' : ''}`}>
                    <span className="min-w-[140px] text-[0.82rem] font-semibold text-on-surface-variant shrink-0">{row.key}</span>
                    <span className={`text-[0.9rem] text-on-surface flex items-center gap-1.5 flex-wrap ${row.mono ? "font-mono text-[0.85rem] text-secondary" : ''}`}>{row.val}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Activity mini-cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4">
              {[
                { icon: '🛒', val: orders.length,             lbl: 'Total Orders',    color: 'bg-blue-50 border-blue-200 text-blue-700' },
                { icon: '✅', val: delivered,                  lbl: 'Delivered',       color: 'bg-green-50 border-green-200 text-green-700' },
                { icon: '💳', val: `$${totalSpent.toFixed(2)}`, lbl: 'Total Spent',   color: 'bg-purple-50 border-purple-200 text-purple-700' },
                { icon: '📍', val: addresses.length,           lbl: 'Saved Addresses', color: 'bg-orange-50 border-orange-200 text-orange-700' },
              ].map(card => (
                <div key={card.lbl} className={`rounded-[14px] p-[18px_20px] flex items-center gap-3.5 border ${card.color}`}>
                  <div className="text-[1.6rem] leading-none shrink-0">{card.icon}</div>
                  <div>
                    <p className="text-[1.4rem] font-extrabold m-0 mb-0.5 leading-none">{card.val}</p>
                    <p className="text-[0.775rem] font-semibold m-0 opacity-70">{card.lbl}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ── ADDRESSES TAB ── */}
        {activeTab === 'addresses' && (
          <div className="flex flex-col gap-6">
            <div className="flex items-start justify-between gap-4 flex-wrap">
              <div>
                <h2 className="text-[1.25rem] font-extrabold text-on-surface m-0 mb-0.5 tracking-[-0.01em]">Saved Addresses</h2>
                <p className="text-[0.825rem] text-on-surface-variant m-0">{addresses.length} address{addresses.length !== 1 ? 'es' : ''} on file</p>
              </div>
              {!showAddForm && !editingId && (
                <button className={btnPrimary()} onClick={() => { setShowAddForm(true); setAddError(null); setAddForm(EMPTY_ADDR); }}>
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
                  Add New Address
                </button>
              )}
            </div>

            {addresses.length === 0 && !showAddForm && (
              <div className="flex flex-col items-center gap-2 py-14 px-6 bg-surface border-[1.5px] border-dashed border-outline-variant rounded-2xl text-center">
                <div className="text-[2.5rem] leading-none mb-1">📍</div>
                <p className="text-[1.05rem] font-bold text-on-surface m-0">No addresses yet</p>
                <p className="text-[0.85rem] text-on-surface-variant m-0 mb-2">Add a shipping address to speed up checkout.</p>
                <button className={btnPrimary()} onClick={() => setShowAddForm(true)}>+ Add Address</button>
              </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {addresses.map(addr => (
                <div key={addr.addressId} className="bg-surface border-[1.5px] border-outline-variant rounded-[14px] p-5 flex flex-col gap-3 transition-all hover:border-secondary hover:shadow-md">
                  {editingId === addr.addressId ? (
                    <form onSubmit={handleEdit} className="flex flex-col gap-3">
                      <p className="text-[0.95rem] font-bold text-secondary m-0 mb-1">Edit Address</p>
                      {editError && <p className="text-[0.82rem] text-error bg-error-container px-2.5 py-1.5 rounded-md m-0">{editError}</p>}
                      <div className="grid grid-cols-2 gap-2.5">
                        <div className="col-span-2 flex flex-col gap-1"><label className={labelCls}>Building / Apartment Name</label><input className={inputCls} value={editForm.buildingName} onChange={e => setEditForm(f => ({ ...f, buildingName: e.target.value }))} /></div>
                        <div className="col-span-2 flex flex-col gap-1"><label className={labelCls}>Street</label><input className={inputCls} value={editForm.street} onChange={e => setEditForm(f => ({ ...f, street: e.target.value }))} /></div>
                        <div className="flex flex-col gap-1"><label className={labelCls}>City</label><input className={inputCls} value={editForm.city} onChange={e => setEditForm(f => ({ ...f, city: e.target.value }))} /></div>
                        <div className="flex flex-col gap-1"><label className={labelCls}>State / Gov.</label><input className={inputCls} value={editForm.state} onChange={e => setEditForm(f => ({ ...f, state: e.target.value }))} /></div>
                        <div className="flex flex-col gap-1"><label className={labelCls}>Country</label><input className={inputCls} value={editForm.country} onChange={e => setEditForm(f => ({ ...f, country: e.target.value }))} /></div>
                        <div className="flex flex-col gap-1"><label className={labelCls}>Postal Code</label><input className={inputCls} value={editForm.pincode} onChange={e => setEditForm(f => ({ ...f, pincode: e.target.value }))} /></div>
                      </div>
                      <div className="flex gap-2 pt-1">
                        <button type="submit" className={btnPrimary()} disabled={editSaving}>{editSaving ? 'Saving…' : 'Save Changes'}</button>
                        <button type="button" className={btnGhost()} onClick={() => setEditingId(null)}>Cancel</button>
                      </div>
                    </form>
                  ) : (
                    <>
                      <div className="text-[1.5rem] leading-none">📍</div>
                      <div className="flex-1 flex flex-col gap-0.5">
                        <p className="font-bold text-on-surface m-0 text-[0.95rem]">{addr.buildingName}</p>
                        <p className="text-[0.825rem] text-on-surface-variant m-0">{addr.street}</p>
                        <p className="text-[0.825rem] text-on-surface-variant m-0">{addr.city}, {addr.state}</p>
                        <p className="text-[0.825rem] text-on-surface-variant m-0">{addr.country} · {addr.pincode}</p>
                      </div>
                      <div className="flex gap-2 pt-1 border-t border-surface-container">
                        <button className={btnGhost(true)} onClick={() => startEdit(addr)}>Edit</button>
                        <button className={btnDanger(true)} onClick={() => handleDelete(addr.addressId)}>Delete</button>
                      </div>
                    </>
                  )}
                </div>
              ))}

              {/* Add form card */}
              {showAddForm && (
                <div className="bg-surface-low border-[1.5px] border-dashed border-secondary rounded-[14px] p-5 col-span-full">
                  <form onSubmit={handleAdd} className="flex flex-col gap-3">
                    <p className="text-[0.95rem] font-bold text-secondary m-0 mb-1">New Address</p>
                    {addError && <p className="text-[0.82rem] text-error bg-error-container px-2.5 py-1.5 rounded-md m-0">{addError}</p>}
                    <div className="grid grid-cols-2 gap-2.5">
                      <div className="col-span-2 flex flex-col gap-1"><label className={labelCls}>Building / Apartment Name</label><input className={inputCls} placeholder="e.g. Nile Tower, Apt 4B" value={addForm.buildingName} onChange={e => setAddForm(f => ({ ...f, buildingName: e.target.value }))} /></div>
                      <div className="col-span-2 flex flex-col gap-1"><label className={labelCls}>Street</label><input className={inputCls} placeholder="e.g. 12 Tahrir St" value={addForm.street} onChange={e => setAddForm(f => ({ ...f, street: e.target.value }))} /></div>
                      <div className="flex flex-col gap-1"><label className={labelCls}>City</label><input className={inputCls} placeholder="Cairo" value={addForm.city} onChange={e => setAddForm(f => ({ ...f, city: e.target.value }))} /></div>
                      <div className="flex flex-col gap-1"><label className={labelCls}>State / Gov.</label><input className={inputCls} placeholder="Cairo" value={addForm.state} onChange={e => setAddForm(f => ({ ...f, state: e.target.value }))} /></div>
                      <div className="flex flex-col gap-1"><label className={labelCls}>Country</label><input className={inputCls} placeholder="Egypt" value={addForm.country} onChange={e => setAddForm(f => ({ ...f, country: e.target.value }))} /></div>
                      <div className="flex flex-col gap-1"><label className={labelCls}>Postal Code</label><input className={inputCls} placeholder="11511" value={addForm.pincode} onChange={e => setAddForm(f => ({ ...f, pincode: e.target.value }))} /></div>
                    </div>
                    <div className="flex gap-2 pt-1">
                      <button type="submit" className={btnPrimary()} disabled={addSaving}>{addSaving ? 'Saving…' : 'Save Address'}</button>
                      <button type="button" className={btnGhost()} onClick={() => { setShowAddForm(false); setAddError(null); }}>Cancel</button>
                    </div>
                  </form>
                </div>
              )}
            </div>
          </div>
        )}

        {/* ── ORDERS TAB ── */}
        {activeTab === 'orders' && (
          <div className="flex flex-col gap-6">
            <div className="flex items-start justify-between gap-4 flex-wrap">
              <div>
                <h2 className="text-[1.25rem] font-extrabold text-on-surface m-0 mb-0.5 tracking-[-0.01em]">Order History</h2>
                <p className="text-[0.825rem] text-on-surface-variant m-0">{orders.length} order{orders.length !== 1 ? 's' : ''} placed</p>
              </div>
            </div>

            {orders.length === 0 ? (
              <div className="flex flex-col items-center gap-2 py-14 px-6 bg-surface border-[1.5px] border-dashed border-outline-variant rounded-2xl text-center">
                <div className="text-[2.5rem] leading-none mb-1">🛍️</div>
                <p className="text-[1.05rem] font-bold text-on-surface m-0">No orders yet</p>
                <p className="text-[0.85rem] text-on-surface-variant m-0">When you place an order it will show up here.</p>
              </div>
            ) : (
              <div className="flex flex-col gap-3.5">
                {orders.map(order => (
                  <div key={order.orderId} className="bg-surface border border-outline-variant rounded-[14px] overflow-hidden transition-shadow hover:shadow-md">
                    {/* Head */}
                    <div className="flex items-center justify-between px-5 py-[14px] bg-surface-low border-b border-outline-variant flex-wrap gap-2">
                      <div className="text-[0.95rem] font-extrabold text-on-surface">Order #{order.orderId}</div>
                      <div className="flex items-center gap-2.5">
                        <span className="text-[0.8rem] text-on-surface-variant">{order.orderDate}</span>
                        <span
                          className="inline-flex items-center px-[10px] py-[3px] rounded-full text-[0.75rem] font-bold border"
                          style={{
                            background: `color-mix(in srgb, ${statusColor(order.orderStatus)} 12%, transparent)`,
                            color: statusColor(order.orderStatus),
                            borderColor: `color-mix(in srgb, ${statusColor(order.orderStatus)} 25%, transparent)`,
                          }}
                        >
                          {order.orderStatus}
                        </span>
                      </div>
                    </div>

                    {/* Items */}
                    <div className="px-5 py-[14px] flex flex-col gap-2">
                      {order.orderItems?.map(item => (
                        <div key={item.orderItemId} className="flex items-center gap-2 text-[0.875rem]">
                          <span className="flex-1 text-on-surface font-semibold whitespace-nowrap overflow-hidden text-ellipsis">{item.product?.productName}</span>
                          <span className="text-on-surface-variant text-[0.8rem] bg-surface-container px-[7px] py-[1px] rounded-md whitespace-nowrap">×{item.quantity}</span>
                          <span className="font-bold text-on-surface whitespace-nowrap">${(item.orderedProductPrice * item.quantity).toFixed(2)}</span>
                        </div>
                      ))}
                    </div>

                    {/* Footer */}
                    <div className="flex items-center justify-between px-5 py-3 bg-surface-low border-t border-outline-variant">
                      <span className="text-[0.82rem] font-semibold text-on-surface-variant">Total</span>
                      <span className="text-[1.1rem] font-extrabold text-on-surface">${order.totalAmount?.toFixed(2)}</span>
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
