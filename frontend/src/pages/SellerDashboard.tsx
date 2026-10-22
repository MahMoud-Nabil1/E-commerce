import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { apiClient } from '../lib/api';
import type { Product, Category, Order } from '../types';
import { ProductModal, ImageUploadModal } from './AdminDashboard';

type Tab = 'overview' | 'products' | 'orders';

const ORDER_STATUSES = ['Accepted', 'Processing', 'Shipped', 'Delivered', 'Cancelled'];

function statusBadge(status: string) {
  const map: Record<string, string> = {
    Accepted:   'bg-blue-100 text-blue-700 border-blue-200',
    Processing: 'bg-orange-100 text-orange-700 border-orange-200',
    Shipped:    'bg-purple-100 text-purple-700 border-purple-200',
    Delivered:  'bg-green-100 text-green-700 border-green-200',
    Cancelled:  'bg-red-100 text-red-700 border-red-200',
  };
  return map[status] ?? 'bg-surface-container text-on-surface border-outline-variant';
}

/* ── Shared Tailwind helpers ── */
const sidebarLinkCls = (active: boolean) =>
  `flex items-center gap-2.5 px-3 py-2.5 rounded-lg text-[14px] font-${active ? '600' : '500'} cursor-pointer border-none w-full text-left no-underline transition-colors ${
    active
      ? 'bg-surface-container text-on-surface border border-outline-variant'
      : 'bg-transparent text-on-surface-variant hover:bg-surface-container hover:text-on-surface'
  }`;

const btnCls = (variant: 'primary' | 'outline' | 'danger', sm?: boolean) => {
  const base = `inline-flex items-center gap-1.5 ${sm ? 'px-[10px] py-[5px] text-[12px]' : 'px-4 py-2 text-[13px]'} rounded-lg font-semibold cursor-pointer border no-underline whitespace-nowrap transition-all disabled:opacity-50 disabled:cursor-not-allowed`;
  if (variant === 'primary') return `${base} bg-surface-container text-on-surface border-outline-variant hover:bg-surface-high`;
  if (variant === 'danger')  return `${base} bg-error-container text-on-error-container border-error-container hover:bg-[#ffdad6]`;
  return `${base} bg-transparent text-on-surface border-outline-variant hover:bg-surface-container`;
};

const alertCls = (type: 'error' | 'success') =>
  `flex items-center gap-2 px-[14px] py-[10px] rounded-lg text-[13px] mb-4 ${
    type === 'error' ? 'bg-error-container text-on-error-container' : 'bg-green-100 text-green-800'
  }`;

export default function SellerDashboard() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [tab, setTab] = useState<Tab>('overview');

  const handleLogout = async () => { await logout(); navigate('/login'); };
  const initials = user?.username?.slice(0, 2).toUpperCase() ?? 'SE';

  return (
    <div className="flex min-h-screen bg-surface-low items-stretch">
      {/* ── Sidebar ── */}
      <aside className="hidden md:flex w-[240px] shrink-0 bg-surface-low flex-col py-6 sticky top-0 h-screen overflow-y-auto border-r border-outline-variant">
        <div className="px-5 pb-6 border-b border-outline-variant mb-3">
          <p className="text-[11px] font-bold tracking-[0.1em] uppercase text-on-surface-variant mb-1">Seller Panel</p>
          <p className="text-[18px] font-bold text-on-surface">ShopFlow</p>
        </div>
        <nav className="flex-1 flex flex-col gap-0.5 px-3">
          {([
            ['overview', 'Overview',    overviewIcon],
            ['products', 'My Products', productIcon],
            ['orders',   'My Orders',   orderIcon],
          ] as [Tab, string, React.ReactNode][]).map(([key, label, icon]) => (
            <button key={key} className={sidebarLinkCls(tab === key)} onClick={() => setTab(key)}>
              {icon}{label}
            </button>
          ))}
          <div className="h-px bg-outline-variant my-2 mx-0" />
          <button className={sidebarLinkCls(false)} onClick={handleLogout}>{logoutIcon}Sign Out</button>
        </nav>
        <div className="p-3 border-t border-outline-variant mt-auto">
          <div className="flex items-center gap-2.5 px-3 py-2 rounded-lg">
            <div className="w-8 h-8 rounded-full bg-surface-container flex items-center justify-center text-[13px] font-bold text-on-surface shrink-0 border border-outline-variant">{initials}</div>
            <div className="flex-1 min-w-0">
              <p className="text-[13px] font-semibold text-on-surface whitespace-nowrap overflow-hidden text-ellipsis">{user?.username}</p>
              <p className="text-[11px] text-on-surface-variant">Seller</p>
            </div>
          </div>
        </div>
      </aside>

      {/* ── Main ── */}
      <main className="flex-1 min-w-0 min-h-screen p-4 md:p-8 pb-20 md:pb-8 overflow-y-auto bg-surface-low">
        {tab === 'overview' && <SellerOverviewTab />}
        {tab === 'products' && <SellerProductsTab />}
        {tab === 'orders'   && <SellerOrdersTab />}
      </main>

      {/* ── Mobile bottom nav ── */}
      <nav className="hidden fixed bottom-0 left-0 right-0 z-[100] bg-surface border-t border-outline-variant pb-[env(safe-area-inset-bottom,4px)] shadow-[0_-4px_16px_rgba(11,28,48,0.08)] max-md:flex" aria-label="Dashboard navigation">
        <div className="flex items-stretch justify-between w-full">
          {([
            ['overview', 'Overview', <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/></svg>],
            ['products', 'Products', <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"/></svg>],
            ['orders',   'Orders',   <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M6 2L3 6v14a2 2 0 002 2h14a2 2 0 002-2V6l-3-4z"/><line x1="3" y1="6" x2="21" y2="6"/></svg>],
          ] as [Tab, string, React.ReactNode][]).map(([key, label, icon]) => (
            <button key={key} className={`flex-1 flex flex-col items-center justify-center gap-1 py-2 px-0.5 bg-transparent border-none cursor-pointer font-sans text-[0.65rem] font-semibold whitespace-nowrap transition-colors ${tab === key ? 'text-secondary' : 'text-on-surface-variant hover:text-on-surface'}`} onClick={() => setTab(key)}>
              {icon}{label}
            </button>
          ))}
          <button className="flex-1 flex flex-col items-center justify-center gap-1 py-2 px-0.5 bg-transparent border-none cursor-pointer font-sans text-[0.65rem] font-semibold text-on-surface-variant hover:text-on-surface transition-colors" onClick={handleLogout}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/>
              <polyline points="16 17 21 12 16 7"/>
              <line x1="21" y1="12" x2="9" y2="12"/>
            </svg>
            Logout
          </button>
        </div>
      </nav>
    </div>
  );
}

/* ── Overview ─────────────────────────────────────────────────────────────── */
function SellerOverviewTab() {
  const { user } = useAuth();
  const [stats, setStats] = useState({
    totalProducts: 0,
    outOfStock: 0,
    totalOrders: 0,
    pendingOrders: 0,
    totalRevenue: 0,
    deliveredOrders: 0,
  });
  const [recentOrders, setRecentOrders] = useState<Order[]>([]);
  const [topProducts, setTopProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      apiClient.sellerGetProducts(0, 100),
      apiClient.sellerGetOrders(0, 50),
    ]).then(([p, o]) => {
      const outOfStock = p.content.filter((prod: Product) => prod.quantity === 0).length;
      const pending = o.content.filter((ord: Order) =>
        ord.orderStatus === 'Accepted' || ord.orderStatus === 'Processing'
      ).length;
      const delivered = o.content.filter((ord: Order) => ord.orderStatus === 'Delivered').length;
      const revenue = o.content
        .filter((ord: Order) => ord.orderStatus !== 'Cancelled')
        .reduce((sum: number, ord: Order) => sum + (ord.totalAmount ?? 0), 0);

      // Top 5 products by price as a proxy for featured items
      const top = [...p.content]
        .sort((a, b) => (b.price ?? 0) - (a.price ?? 0))
        .slice(0, 5);

      setStats({
        totalProducts: p.totalElements,
        outOfStock,
        totalOrders: o.totalElements,
        pendingOrders: pending,
        totalRevenue: revenue,
        deliveredOrders: delivered,
      });
      setRecentOrders(o.content.slice(0, 5));
      setTopProducts(top);
    }).finally(() => setLoading(false));
  }, []);

  if (loading) return <p style={{ color: 'var(--color-on-surface-variant)' }}>Loading…</p>;

  return (
    <>
      <div className="mb-7">
        <h1 className="text-[24px] font-bold text-on-surface mb-1">Welcome back, {user?.username} 👋</h1>
        <p className="text-[14px] text-on-surface-variant">Here's what's happening in your store today.</p>
      </div>

      {/* Primary stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4 mb-8">
        <div className="bg-surface border border-outline-variant rounded-xl p-5 flex flex-col gap-1.5">
          <p className="text-[12px] font-semibold text-on-surface-variant uppercase tracking-[0.05em]">My Products</p>
          <p className="text-[28px] font-extrabold text-on-surface leading-none">{stats.totalProducts}</p>
          {stats.outOfStock > 0 && (
            <p className="text-[12px] text-orange-700">⚠ {stats.outOfStock} out of stock</p>
          )}
        </div>
        <div className="bg-surface border border-outline-variant rounded-xl p-5 flex flex-col gap-1.5">
          <p className="text-[12px] font-semibold text-on-surface-variant uppercase tracking-[0.05em]">Total Orders</p>
          <p className="text-[28px] font-extrabold text-on-surface leading-none">{stats.totalOrders}</p>
          {stats.pendingOrders > 0 && (
            <p className="text-[12px] text-orange-700">{stats.pendingOrders} need attention</p>
          )}
        </div>
        <div className="bg-surface border border-outline-variant rounded-xl p-5 flex flex-col gap-1.5">
          <p className="text-[12px] font-semibold text-on-surface-variant uppercase tracking-[0.05em]">Total Revenue</p>
          <p className="text-[28px] font-extrabold text-on-surface leading-none">${stats.totalRevenue.toFixed(2)}</p>
          <p className="text-[12px] text-on-surface-variant">Excluding cancelled orders</p>
        </div>
        <div className="bg-surface border border-outline-variant rounded-xl p-5 flex flex-col gap-1.5">
          <p className="text-[12px] font-semibold text-on-surface-variant uppercase tracking-[0.05em]">Delivered</p>
          <p className="text-[28px] font-extrabold text-on-surface leading-none">{stats.deliveredOrders}</p>
          <p className="text-[12px] text-on-surface-variant">
            {stats.totalOrders > 0
              ? `${Math.round((stats.deliveredOrders / stats.totalOrders) * 100)}% completion rate`
              : 'No orders yet'}
          </p>
        </div>
      </div>

      {/* Two-column overview grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Orders */}
        <div className="bg-surface border border-outline-variant rounded-xl overflow-hidden">
          <div className="flex items-center justify-between px-5 py-[18px] border-b border-outline-variant gap-3 flex-wrap">
            <h2 className="text-[16px] font-bold text-on-surface">Recent Orders</h2>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full border-collapse text-[14px]">
              <thead>
                <tr>
                  {['ID','Date','Total','Status'].map(h => (
                    <th key={h} className="px-4 py-[10px] text-left text-[11px] font-bold uppercase tracking-[0.06em] text-on-surface-variant bg-surface-low border-b border-outline-variant whitespace-nowrap">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {recentOrders.length === 0
                  ? <tr><td colSpan={4} className="text-center py-8 text-on-surface-variant">No orders yet</td></tr>
                  : recentOrders.map(o => (
                    <tr key={o.orderId} className="hover:bg-surface-low">
                      <td className="px-4 py-3 border-b border-outline-variant text-on-surface align-middle">#{o.orderId}</td>
                      <td className="px-4 py-3 border-b border-outline-variant text-on-surface align-middle">{o.orderDate}</td>
                      <td className="px-4 py-3 border-b border-outline-variant text-on-surface align-middle">${o.totalAmount?.toFixed(2)}</td>
                      <td className="px-4 py-3 border-b border-outline-variant align-middle">
                        <span className={`inline-flex items-center px-2 py-[2px] rounded-full text-[11px] font-bold uppercase tracking-[0.04em] border ${statusBadge(o.orderStatus)}`}>{o.orderStatus}</span>
                      </td>
                    </tr>
                  ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Top Products */}
        <div className="bg-surface border border-outline-variant rounded-xl overflow-hidden">
          <div className="flex items-center justify-between px-5 py-[18px] border-b border-outline-variant gap-3 flex-wrap">
            <h2 className="text-[16px] font-bold text-on-surface">Your Products</h2>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full border-collapse text-[14px]">
              <thead>
                <tr>
                  {['Name','Price','Stock'].map(h => (
                    <th key={h} className="px-4 py-[10px] text-left text-[11px] font-bold uppercase tracking-[0.06em] text-on-surface-variant bg-surface-low border-b border-outline-variant whitespace-nowrap">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {topProducts.length === 0
                  ? <tr><td colSpan={3} className="text-center py-8 text-on-surface-variant">No products yet</td></tr>
                  : topProducts.map(p => (
                    <tr key={p.productId} className="hover:bg-surface-low">
                      <td className="px-4 py-3 border-b border-outline-variant font-semibold text-on-surface align-middle">{p.productName}</td>
                      <td className="px-4 py-3 border-b border-outline-variant text-on-surface align-middle">${p.price?.toFixed(2)}</td>
                      <td className="px-4 py-3 border-b border-outline-variant align-middle">
                        <span className={`inline-flex items-center px-2 py-[2px] rounded-full text-[11px] font-bold uppercase tracking-[0.04em] border ${p.quantity > 0 ? 'bg-green-100 text-green-700 border-green-200' : 'bg-red-100 text-red-700 border-red-200'}`}>
                          {p.quantity > 0 ? p.quantity : 'Out'}
                        </span>
                      </td>
                    </tr>
                  ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Order status breakdown */}
      {stats.totalOrders > 0 && (
        <div className="bg-surface border border-outline-variant rounded-xl overflow-hidden mt-6">
          <div className="flex items-center justify-between px-5 py-[18px] border-b border-outline-variant gap-3 flex-wrap">
            <h2 className="text-[16px] font-bold text-on-surface">Order Status Breakdown</h2>
          </div>
          <div className="flex gap-3 px-5 py-4 flex-wrap">
            {(['Accepted', 'Processing', 'Shipped', 'Delivered', 'Cancelled'] as const).map(status => {
              const count = recentOrders.filter(o => o.orderStatus === status).length;
              return (
                <div key={status} className="flex items-center gap-2 px-3.5 py-2 rounded-[10px] bg-surface-low border border-outline-variant">
                  <span className={`inline-flex items-center px-2 py-[2px] rounded-full text-[11px] font-bold uppercase tracking-[0.04em] border ${statusBadge(status)}`}>{status}</span>
                  <span className="font-bold text-[15px] text-on-surface">{count}</span>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </>
  );
}

/* ── Products ─────────────────────────────────────────────────────────────── */
function SellerProductsTab() {
  const [products, setProducts] = useState<Product[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState<Product | null>(null);
  const [categories, setCategories] = useState<Category[]>([]);
  const [uploadTarget, setUploadTarget] = useState<Product | null>(null);

  const load = useCallback(() => {
    setLoading(true);
    apiClient.sellerGetProducts(page, 15)
      .then(r => { setProducts(r.content); setTotal(r.totalElements); })
      .catch(() => setError('Failed to load products'))
      .finally(() => setLoading(false));
  }, [page]);

  useEffect(() => { load(); }, [load]);
  useEffect(() => { apiClient.getCategories(0, 100).then(r => setCategories(r.content)).catch(() => {}); }, []);

  const handleDelete = async (id: number) => {
    if (!confirm('Delete this product?')) return;
    try { await apiClient.sellerDeleteProduct(id); load(); } catch { setError('Delete failed'); }
  };

  return (
    <>
      <div className="mb-7">
        <h1 className="text-[24px] font-bold text-on-surface mb-1">My Products</h1>
        <p className="text-[14px] text-on-surface-variant">{total} products in your store</p>
      </div>
      {error && <div className={alertCls('error')}>{error}</div>}
      <div className="bg-surface border border-outline-variant rounded-xl overflow-hidden mb-6">
        <div className="flex items-center justify-between px-5 py-[18px] border-b border-outline-variant gap-3 flex-wrap">
          <h2 className="text-[16px] font-bold text-on-surface">Product Catalog</h2>
          <button className={btnCls('primary')} onClick={() => { setEditing(null); setShowModal(true); }}>+ Add Product</button>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full border-collapse text-[14px]">
            <thead>
              <tr>
                {['ID','Name','Price','Discount','Stock','Actions'].map(h => (
                  <th key={h} className="px-4 py-[10px] text-left text-[11px] font-bold uppercase tracking-[0.06em] text-on-surface-variant bg-surface-low border-b border-outline-variant whitespace-nowrap">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {loading
                ? <tr><td colSpan={6} className="text-center py-10 text-on-surface-variant">Loading…</td></tr>
                : products.length === 0
                  ? <tr><td colSpan={6} className="text-center py-8 text-on-surface-variant">No products yet. Add your first one!</td></tr>
                  : products.map(p => (
                    <tr key={p.productId} className="hover:bg-surface-low">
                      <td className="px-4 py-3 border-b border-outline-variant text-on-surface align-middle">#{p.productId}</td>
                      <td className="px-4 py-3 border-b border-outline-variant font-semibold text-on-surface align-middle">{p.productName}</td>
                      <td className="px-4 py-3 border-b border-outline-variant text-on-surface align-middle">${p.price?.toFixed(2)}</td>
                      <td className="px-4 py-3 border-b border-outline-variant text-on-surface align-middle">{p.discount}%</td>
                      <td className="px-4 py-3 border-b border-outline-variant align-middle">
                        <span className={`inline-flex items-center px-2 py-[2px] rounded-full text-[11px] font-bold uppercase tracking-[0.04em] border ${p.quantity > 0 ? 'bg-green-100 text-green-700 border-green-200' : 'bg-red-100 text-red-700 border-red-200'}`}>
                          {p.quantity > 0 ? p.quantity : 'Out'}
                        </span>
                      </td>
                      <td className="px-4 py-3 border-b border-outline-variant align-middle">
                        <div className="flex gap-1.5">
                          <button className={btnCls('outline', true)} onClick={() => { setEditing(p); setShowModal(true); }}>Edit</button>
                          <button className={btnCls('outline', true)} style={{ color: 'var(--color-primary)' }} onClick={() => setUploadTarget(p)}>📷 Image</button>
                          <button className={btnCls('danger', true)} onClick={() => handleDelete(p.productId)}>Delete</button>
                        </div>
                      </td>
                    </tr>
                  ))}
            </tbody>
          </table>
        </div>
        <div className="flex items-center justify-end gap-2 px-5 py-[14px] border-t border-outline-variant text-[13px] text-on-surface-variant">
          <button className={btnCls('outline', true)} disabled={page === 0} onClick={() => setPage(p => p - 1)}>← Prev</button>
          <span>Page {page + 1}</span>
          <button className={btnCls('outline', true)} disabled={(page + 1) * 15 >= total} onClick={() => setPage(p => p + 1)}>Next →</button>
        </div>
      </div>
      {showModal && <ProductModal product={editing} categories={categories} isAdmin={false} onClose={() => setShowModal(false)} onSaved={() => { setShowModal(false); load(); }} />}
      {uploadTarget && <ImageUploadModal product={uploadTarget} isAdmin={false} onClose={() => setUploadTarget(null)} onSaved={() => { setUploadTarget(null); load(); }} />}
    </>
  );
}

/* ── Orders ───────────────────────────────────────────────────────────────── */
function SellerOrdersTab() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [updatingId, setUpdatingId] = useState<number | null>(null);

  const load = useCallback(() => {
    setLoading(true);
    apiClient.sellerGetOrders(page, 15)
      .then(r => { setOrders(r.content); setTotal(r.totalElements); })
      .catch(() => setError('Failed to load orders'))
      .finally(() => setLoading(false));
  }, [page]);

  useEffect(() => { load(); }, [load]);

  const handleStatusChange = async (orderId: number, status: string) => {
    setUpdatingId(orderId);
    try { await apiClient.sellerUpdateOrderStatus(orderId, status); load(); }
    catch { setError('Status update failed'); }
    finally { setUpdatingId(null); }
  };

  const handleApprovePayment = async (orderId: number) => {
    setUpdatingId(orderId);
    try { await apiClient.sellerApprovePayment(orderId); load(); }
    catch { setError('Payment approval failed'); }
    finally { setUpdatingId(null); }
  };

  return (
    <>
      <div className="mb-7">
        <h1 className="text-[24px] font-bold text-on-surface mb-1">My Orders</h1>
        <p className="text-[14px] text-on-surface-variant">Orders containing your products</p>
      </div>
      {error && <div className={alertCls('error')}>{error}</div>}
      <div className="bg-surface border border-outline-variant rounded-xl overflow-hidden mb-6">
        <div className="flex items-center justify-between px-5 py-[18px] border-b border-outline-variant gap-3 flex-wrap">
          <h2 className="text-[16px] font-bold text-on-surface">Order List</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full border-collapse text-[14px]">
            <thead>
              <tr>
                {['ID','Customer','Date','Products','Address','Total','Status','Update'].map(h => (
                  <th key={h} className="px-4 py-[10px] text-left text-[11px] font-bold uppercase tracking-[0.06em] text-on-surface-variant bg-surface-low border-b border-outline-variant whitespace-nowrap">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {loading
                ? <tr><td colSpan={8} className="text-center py-10 text-on-surface-variant">Loading…</td></tr>
                : orders.length === 0
                  ? <tr><td colSpan={8} className="text-center py-8 text-on-surface-variant">No orders yet</td></tr>
                  : orders.map(o => {
                    const addr = o.address;
                    const addrLine = addr
                      ? [addr.street, addr.buildingName, addr.city, addr.state, addr.country, addr.pincode]
                          .filter(Boolean).join(', ')
                      : '—';
                    return (
                    <tr key={o.orderId} className="hover:bg-surface-low">
                      <td className="px-4 py-3 border-b border-outline-variant text-on-surface align-middle">#{o.orderId}</td>
                      <td className="px-4 py-3 border-b border-outline-variant text-on-surface align-middle">{o.email}</td>
                      <td className="px-4 py-3 border-b border-outline-variant text-on-surface align-middle">{o.orderDate}</td>
                      <td className="px-4 py-3 border-b border-outline-variant align-middle">
                        {o.orderItems && o.orderItems.length > 0 ? (
                          <ul className="m-0 p-0 list-none flex flex-col gap-[3px]">
                            {o.orderItems.map((item, i) => (
                              <li key={i} className="flex items-center gap-1.5">
                                <span className="w-1.5 h-1.5 rounded-full bg-secondary shrink-0 inline-block" />
                                <span className="font-medium text-[13px]">{item.product?.productName}</span>
                                {item.quantity > 1 && (
                                  <span className="text-[11px] text-on-surface-variant bg-surface-container rounded px-[5px] py-[1px]">×{item.quantity}</span>
                                )}
                              </li>
                            ))}
                          </ul>
                        ) : <span className="text-on-surface-variant">—</span>}
                      </td>
                      <td className="px-4 py-3 border-b border-outline-variant text-[13px] text-on-surface-variant max-w-[220px] whitespace-normal leading-[1.4] align-middle">{addrLine}</td>
                      <td className="px-4 py-3 border-b border-outline-variant text-on-surface align-middle">${o.totalAmount?.toFixed(2)}</td>
                      <td className="px-4 py-3 border-b border-outline-variant align-middle">
                        <span className={`inline-flex items-center px-2 py-[2px] rounded-full text-[11px] font-bold uppercase tracking-[0.04em] border ${statusBadge(o.orderStatus)}`}>{o.orderStatus}</span>
                      </td>
                      <td className="px-4 py-3 border-b border-outline-variant align-middle">
                        {o.orderStatus === 'PENDING_PAYMENT' ? (
                          <button
                            className={btnCls('primary', true)}
                            disabled={updatingId === o.orderId}
                            onClick={() => handleApprovePayment(o.orderId)}
                          >
                            Approve
                          </button>
                        ) : (
                          <select
                            className="px-2 py-1 text-[12px] border border-outline-variant rounded-lg bg-surface text-on-surface outline-none focus:border-secondary"
                            value={o.orderStatus}
                            disabled={updatingId === o.orderId}
                            onChange={e => handleStatusChange(o.orderId, e.target.value)}
                          >
                            {ORDER_STATUSES.map(s => <option key={s} value={s}>{s}</option>)}
                          </select>
                        )}
                      </td>
                    </tr>
                    );
                  })}
            </tbody>
          </table>
        </div>
        <div className="flex items-center justify-end gap-2 px-5 py-[14px] border-t border-outline-variant text-[13px] text-on-surface-variant">
          <button className={btnCls('outline', true)} disabled={page === 0} onClick={() => setPage(p => p - 1)}>← Prev</button>
          <span>Page {page + 1} of {Math.ceil(total / 15) || 1}</span>
          <button className={btnCls('outline', true)} disabled={(page + 1) * 15 >= total} onClick={() => setPage(p => p + 1)}>Next →</button>
        </div>
      </div>
    </>
  );
}

/* ── Icons ────────────────────────────────────────────────────────────────── */
const overviewIcon = <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/></svg>;
const productIcon  = <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"/></svg>;
const orderIcon    = <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M6 2L3 6v14a2 2 0 002 2h14a2 2 0 002-2V6l-3-4z"/><line x1="3" y1="6" x2="21" y2="6"/><path d="M16 10a4 4 0 01-8 0"/></svg>;
const logoutIcon   = <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/></svg>;
