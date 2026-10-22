import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { apiClient } from '../lib/api';
import type { Product, Category, Order } from '../types';
import React from 'react';

type Tab = 'overview' | 'products' | 'myproducts' | 'categories' | 'orders' | 'sellers';

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
    type === 'error'   ? 'bg-error-container text-on-error-container' : 'bg-green-100 text-green-800'
  }`;

const formInputCls = 'w-full px-3 py-[9px] border border-outline-variant rounded-lg text-[14px] text-on-surface bg-surface outline-none font-sans transition-colors focus:border-secondary';

export default function AdminDashboard() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [tab, setTab] = useState<Tab>('overview');

  const handleLogout = async () => { await logout(); navigate('/login'); };
  const initials = user?.username?.slice(0, 2).toUpperCase() ?? 'AD';

  return (
    <div className="flex min-h-screen bg-surface-low items-stretch">
      {/* ── Sidebar ── */}
      <aside className="hidden md:flex w-[240px] shrink-0 bg-surface-low flex-col py-6 sticky top-0 h-screen overflow-y-auto border-r border-outline-variant">
        <div className="px-5 pb-6 border-b border-outline-variant mb-3">
          <p className="text-[11px] font-bold tracking-[0.1em] uppercase text-on-surface-variant mb-1">Admin Panel</p>
          <p className="text-[18px] font-bold text-on-surface">ShopFlow</p>
        </div>
        <nav className="flex-1 flex flex-col gap-0.5 px-3">
          {([
            ['overview',    'Overview',      overviewIcon],
            ['products',    'All Products',  productIcon],
            ['myproducts',  'My Products',   myProductsIcon],
            ['categories',  'Categories',    categoryIcon],
            ['orders',      'Orders',        orderIcon],
            ['sellers',     'Sellers',       sellerIcon],
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
              <p className="text-[11px] text-on-surface-variant">Administrator</p>
            </div>
          </div>
        </div>
      </aside>

      {/* ── Main ── */}
      <main className="flex-1 min-w-0 min-h-screen p-4 md:p-8 pb-20 md:pb-8 overflow-y-auto bg-surface-low">
        {tab === 'overview'   && <OverviewTab />}
        {tab === 'products'   && <ProductsTab currentUsername={user?.username ?? ''} />}
        {tab === 'myproducts' && <AdminMyProductsTab />}
        {tab === 'categories' && <CategoriesTab />}
        {tab === 'orders'     && <OrdersTab />}
        {tab === 'sellers'    && <SellersTab />}
      </main>

      {/* ── Mobile bottom nav ── */}
      <nav className="hidden fixed bottom-0 left-0 right-0 z-[100] bg-surface border-t border-outline-variant pb-[env(safe-area-inset-bottom,4px)] shadow-[0_-4px_16px_rgba(11,28,48,0.08)] max-md:flex" aria-label="Dashboard navigation">
        <div className="flex items-stretch justify-between w-full">
          {([
            ['overview',   'Overview',   <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/></svg>],
            ['products',   'Products',   <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"/></svg>],
            ['orders',     'Orders',     <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M6 2L3 6v14a2 2 0 002 2h14a2 2 0 002-2V6l-3-4z"/><line x1="3" y1="6" x2="21" y2="6"/></svg>],
            ['categories', 'Categories', <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M3 7h18M3 12h18M3 17h18"/></svg>],
            ['sellers',    'Sellers',    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>],
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

function OverviewTab() {
  const [stats, setStats] = useState({ products: 0, categories: 0, orders: 0, sellers: 0 });
  const [recentOrders, setRecentOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      apiClient.adminGetProducts(0, 1),
      apiClient.adminGetCategories(0, 1),
      apiClient.adminGetOrders(0, 5),
      apiClient.adminGetSellers(0),
    ]).then(([p, c, o, s]) => {
      setStats({ products: p.totalElements, categories: c.totalElements, orders: o.totalElements, sellers: s.totalElements ?? 0 });
      setRecentOrders(o.content);
    }).finally(() => setLoading(false));
  }, []);

  if (loading) return <p style={{ color: 'var(--color-on-surface-variant)' }}>Loading…</p>;

  return (
    <>
      <div className="mb-7">
        <h1 className="text-[24px] font-bold text-on-surface mb-1">Overview</h1>
        <p className="text-[14px] text-on-surface-variant">Welcome back — here's what's happening today.</p>
      </div>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4 mb-8">
        <StatCard icon="📦" label="Total Products"  value={stats.products}   />
        <StatCard icon="🗂️" label="Categories"      value={stats.categories} />
        <StatCard icon="🛒" label="Total Orders"    value={stats.orders}     />
        <StatCard icon="🏪" label="Active Sellers"  value={stats.sellers}    />
      </div>
      <div className="bg-surface border border-outline-variant rounded-xl overflow-hidden mb-6">
        <div className="flex items-center justify-between px-5 py-[18px] border-b border-outline-variant gap-3 flex-wrap">
          <h2 className="text-[16px] font-bold text-on-surface">Recent Orders</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full border-collapse text-[14px]">
            <thead>
              <tr>
                {['Order ID','Customer','Date','Total','Status'].map(h => (
                  <th key={h} className="px-4 py-[10px] text-left text-[11px] font-bold uppercase tracking-[0.06em] text-on-surface-variant bg-surface-low border-b border-outline-variant whitespace-nowrap">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {recentOrders.length === 0
                ? <tr><td colSpan={5} className="text-center py-8 text-on-surface-variant">No orders yet</td></tr>
                : recentOrders.map(o => (
                  <tr key={o.orderId} className="hover:bg-surface-low">
                    <td className="px-4 py-3 border-b border-outline-variant text-on-surface">#{o.orderId}</td>
                    <td className="px-4 py-3 border-b border-outline-variant text-on-surface">{o.email}</td>
                    <td className="px-4 py-3 border-b border-outline-variant text-on-surface">{o.orderDate}</td>
                    <td className="px-4 py-3 border-b border-outline-variant text-on-surface">${o.totalAmount?.toFixed(2)}</td>
                    <td className="px-4 py-3 border-b border-outline-variant">
                      <span className={`inline-flex items-center px-2 py-[2px] rounded-full text-[11px] font-bold uppercase tracking-[0.04em] border ${statusBadge(o.orderStatus)}`}>{o.orderStatus}</span>
                    </td>
                  </tr>
                ))}
            </tbody>
          </table>
        </div>
      </div>
    </>
  );
}

function StatCard({ label, value }: { icon?: string; label: string; value: number }) {
  return (
    <div className="bg-surface border border-outline-variant rounded-xl p-5 flex flex-col gap-1.5">
      <p className="text-[12px] font-semibold text-on-surface-variant uppercase tracking-[0.05em]">{label}</p>
      <p className="text-[28px] font-extrabold text-on-surface leading-none">{value.toLocaleString()}</p>
    </div>
  );
}

function ProductsTab({ currentUsername }: { currentUsername: string }) {
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
    setError('');
    apiClient.adminGetProducts(page, 15)
      .then(r => { setProducts(r.content); setTotal(r.totalElements); })
      .catch(() => setError('Failed to load products'))
      .finally(() => setLoading(false));
  }, [page]);

  useEffect(() => { load(); }, [load]);
  useEffect(() => { apiClient.adminGetCategories(0, 100).then(r => setCategories(r.content)).catch(() => {}); }, []);

  const handleDelete = async (id: number) => {
    if (!confirm('Delete this product?')) return;
    try { await apiClient.adminDeleteProduct(id); load(); } catch { setError('Delete failed'); }
  };

  return (
    <>
      <div className="mb-7">
        <h1 className="text-[24px] font-bold text-on-surface mb-1">All Products</h1>
        <p className="text-[14px] text-on-surface-variant">{total} products across all sellers</p>
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
                {['ID','Name','Seller','Price','Discount','Stock','Actions'].map(h => (
                  <th key={h} className="px-4 py-[10px] text-left text-[11px] font-bold uppercase tracking-[0.06em] text-on-surface-variant bg-surface-low border-b border-outline-variant whitespace-nowrap">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {loading
                ? <tr><td colSpan={7} className="text-center py-10 text-on-surface-variant">Loading…</td></tr>
                : products.length === 0
                  ? <tr><td colSpan={7} className="text-center py-8 text-on-surface-variant">No products</td></tr>
                  : products.map(p => (
                    <tr key={p.productId} className="hover:bg-surface-low">
                      <td className="px-4 py-3 border-b border-outline-variant text-on-surface align-middle">#{p.productId}</td>
                      <td className="px-4 py-3 border-b border-outline-variant font-semibold text-on-surface align-middle">{p.productName}</td>
                      <td className="px-4 py-3 border-b border-outline-variant align-middle">
                        <span className="inline-flex items-center gap-1.5">
                          <span className="w-[26px] h-[26px] rounded-full inline-flex items-center justify-center text-[11px] font-bold shrink-0"
                            style={{ background: p.seller ? 'var(--color-secondary)' : 'var(--color-surface-variant)', color: p.seller ? 'var(--color-on-secondary)' : 'var(--color-on-surface-variant)' }}>
                            {p.seller?.username?.slice(0, 2).toUpperCase() ?? '?'}
                          </span>
                          <span className="text-[13px]" style={{ color: p.seller ? 'inherit' : 'var(--color-on-surface-variant)', fontStyle: p.seller ? 'normal' : 'italic' }}>
                            {p.seller?.username ?? 'Unassigned'}
                          </span>
                        </span>
                      </td>
                      <td className="px-4 py-3 border-b border-outline-variant text-on-surface align-middle">${p.price?.toFixed(2)}</td>
                      <td className="px-4 py-3 border-b border-outline-variant text-on-surface align-middle">{p.discount}%</td>
                      <td className="px-4 py-3 border-b border-outline-variant align-middle">
                        <span className={`inline-flex items-center px-2 py-[2px] rounded-full text-[11px] font-bold uppercase tracking-[0.04em] border ${p.quantity > 0 ? 'bg-green-100 text-green-700 border-green-200' : 'bg-red-100 text-red-700 border-red-200'}`}>
                          {p.quantity > 0 ? p.quantity : 'Out'}
                        </span>
                      </td>
                      <td className="px-4 py-3 border-b border-outline-variant align-middle">
                        <div className="flex gap-1.5">
                          {/* superadmin can only edit/upload their own products; other admins can edit any */}
                          {(currentUsername !== 'superadmin' || p.seller?.username === currentUsername) && (
                            <button className={btnCls('outline', true)} onClick={() => { setEditing(p); setShowModal(true); }}>Edit</button>
                          )}
                          {p.seller?.username === currentUsername && (
                            <button className={btnCls('outline', true)} style={{ color: 'var(--color-primary)' }} onClick={() => setUploadTarget(p)}>📷 Image</button>
                          )}
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
      {showModal && <ProductModal product={editing} categories={categories} isAdmin onClose={() => setShowModal(false)} onSaved={() => { setShowModal(false); load(); }} />}
      {uploadTarget && <ImageUploadModal product={uploadTarget} isAdmin onClose={() => setUploadTarget(null)} onSaved={() => { setUploadTarget(null); load(); }} />}
    </>
  );
}

/* ── Admin My Products Tab ───────────────────────────────────────────────── */
function AdminMyProductsTab() {
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
    setError('');
    // Uses the dedicated admin "my products" endpoint to fetch only this admin's own products
    apiClient.adminGetMyProducts(page, 15)
      .then(r => { setProducts(r.content); setTotal(r.totalElements); })
      .catch(() => setError('Failed to load your products'))
      .finally(() => setLoading(false));
  }, [page]);

  useEffect(() => { load(); }, [load]);
  useEffect(() => { apiClient.adminGetCategories(0, 100).then(r => setCategories(r.content)).catch(() => {}); }, []);

  const handleDelete = async (id: number) => {
    if (!confirm('Delete this product?')) return;
    try { await apiClient.adminDeleteProduct(id); load(); } catch { setError('Delete failed'); }
  };

  return (
    <>
      <div className="mb-7">
        <h1 className="text-[24px] font-bold text-on-surface mb-1">My Products</h1>
        <p className="text-[14px] text-on-surface-variant">{total} products listed by you</p>
      </div>
      {error && <div className={alertCls('error')}>{error}</div>}
      <div className="bg-surface border border-outline-variant rounded-xl overflow-hidden mb-6">
        <div className="flex items-center justify-between px-5 py-[18px] border-b border-outline-variant gap-3 flex-wrap">
          <h2 className="text-[16px] font-bold text-on-surface">My Listings</h2>
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
                  ? <tr><td colSpan={6} className="text-center py-8 text-on-surface-variant">You haven't listed any products yet.</td></tr>
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
      {showModal && <ProductModal product={editing} categories={categories} isAdmin onClose={() => setShowModal(false)} onSaved={() => { setShowModal(false); load(); }} />}
      {uploadTarget && <ImageUploadModal product={uploadTarget} isAdmin onClose={() => setUploadTarget(null)} onSaved={() => { setUploadTarget(null); load(); }} />}
    </>
  );
}

function CategoriesTab() {
  const [cats, setCats] = useState<Category[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState<Category | null>(null);

  const load = useCallback(() => {
    setLoading(true);
    apiClient.adminGetCategories(0, 50)
      .then(r => { setCats(r.content); setTotal(r.totalElements); })
      .catch(() => setError('Failed to load categories'))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => { load(); }, [load]);

  const handleDelete = async (id: number) => {
    if (!confirm('Delete this category?')) return;
    try { await apiClient.adminDeleteCategory(id); load(); } catch { setError('Delete failed'); }
  };

  return (
    <>
      <div className="mb-7">
        <h1 className="text-[24px] font-bold text-on-surface mb-1">Categories</h1>
        <p className="text-[14px] text-on-surface-variant">{total} categories</p>
      </div>
      {error && <div className={alertCls('error')}>{error}</div>}
      <div className="bg-surface border border-outline-variant rounded-xl overflow-hidden mb-6">
        <div className="flex items-center justify-between px-5 py-[18px] border-b border-outline-variant gap-3 flex-wrap">
          <h2 className="text-[16px] font-bold text-on-surface">All Categories</h2>
          <button className={btnCls('primary')} onClick={() => { setEditing(null); setShowModal(true); }}>+ Add Category</button>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full border-collapse text-[14px]">
            <thead>
              <tr>
                {['ID','Name','Actions'].map(h => (
                  <th key={h} className="px-4 py-[10px] text-left text-[11px] font-bold uppercase tracking-[0.06em] text-on-surface-variant bg-surface-low border-b border-outline-variant whitespace-nowrap">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {loading
                ? <tr><td colSpan={3} className="text-center py-10 text-on-surface-variant">Loading…</td></tr>
                : cats.map(c => (
                  <tr key={c.categoryId} className="hover:bg-surface-low">
                    <td className="px-4 py-3 border-b border-outline-variant text-on-surface align-middle">#{c.categoryId}</td>
                    <td className="px-4 py-3 border-b border-outline-variant font-semibold text-on-surface align-middle">{c.categoryName}</td>
                    <td className="px-4 py-3 border-b border-outline-variant align-middle">
                      <div className="flex gap-1.5">
                        <button className={btnCls('outline', true)} onClick={() => { setEditing(c); setShowModal(true); }}>Edit</button>
                        <button className={btnCls('danger', true)} onClick={() => handleDelete(c.categoryId)}>Delete</button>
                      </div>
                    </td>
                  </tr>
                ))}
            </tbody>
          </table>
        </div>
      </div>
      {showModal && <CategoryModal category={editing} onClose={() => setShowModal(false)} onSaved={() => { setShowModal(false); load(); }} />}
    </>
  );
}

function OrdersTab() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [updatingId, setUpdatingId] = useState<number | null>(null);

  const load = useCallback(() => {
    setLoading(true);
    apiClient.adminGetOrders(page, 15)
      .then(r => { setOrders(r.content); setTotal(r.totalElements); })
      .catch(() => setError('Failed to load orders'))
      .finally(() => setLoading(false));
  }, [page]);

  useEffect(() => { load(); }, [load]);

  const handleStatusChange = async (orderId: number, status: string) => {
    setUpdatingId(orderId);
    try { await apiClient.adminUpdateOrderStatus(orderId, status); load(); }
    catch { setError('Status update failed'); }
    finally { setUpdatingId(null); }
  };

  const handleApprovePayment = async (orderId: number) => {
    setUpdatingId(orderId);
    try { await apiClient.adminApprovePayment(orderId); load(); }
    catch { setError('Payment approval failed'); }
    finally { setUpdatingId(null); }
  };

  return (
    <>
      <div className="mb-7">
        <h1 className="text-[24px] font-bold text-on-surface mb-1">Orders</h1>
        <p className="text-[14px] text-on-surface-variant">{total} total orders</p>
      </div>
      {error && <div className={alertCls('error')}>{error}</div>}
      <div className="bg-surface border border-outline-variant rounded-xl overflow-hidden mb-6">
        <div className="flex items-center justify-between px-5 py-[18px] border-b border-outline-variant gap-3 flex-wrap">
          <h2 className="text-[16px] font-bold text-on-surface">All Orders</h2>
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
                  ? <tr><td colSpan={8} className="text-center py-8 text-on-surface-variant">No orders</td></tr>
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

function SellersTab() {
  type Seller = { id: number; username: string; email: string; roles: string[]; enabled: boolean; banned: boolean; suspended: boolean };
  const [sellers, setSellers] = useState<Seller[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [actionError, setActionError] = useState('');
  const [actingId, setActingId] = useState<number | null>(null);

  const load = useCallback(() => {
    setLoading(true);
    apiClient.adminGetSellers(0)
      .then(r => setSellers((r.content ?? []) as Seller[]))
      .catch(() => setError('Failed to load sellers'))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => { load(); }, [load]);

  const handleAction = async (id: number, action: 'ban' | 'suspend' | 'activate') => {
    const labels = { ban: 'permanently ban', suspend: 'suspend', activate: 'activate' };
    if (!confirm(`Are you sure you want to ${labels[action]} this seller?`)) return;
    setActingId(id);
    setActionError('');
    try {
      if (action === 'ban')      await apiClient.adminBanSeller(id);
      if (action === 'suspend')  await apiClient.adminSuspendSeller(id);
      if (action === 'activate') await apiClient.adminActivateSeller(id);
      load();
    } catch {
      setActionError(`Failed to ${action} seller.`);
    } finally {
      setActingId(null);
    }
  };

  const statusBadgeCls = (s: Seller) => {
    if (s.banned)    return 'bg-red-100 text-red-700 border-red-200';
    if (s.suspended) return 'bg-orange-100 text-orange-700 border-orange-200';
    return 'bg-green-100 text-green-700 border-green-200';
  };
  const statusLabel = (s: Seller) => {
    if (s.banned)    return 'Banned';
    if (s.suspended) return 'Suspended';
    return 'Active';
  };

  return (
    <>
      <div className="mb-7">
        <h1 className="text-[24px] font-bold text-on-surface mb-1">Sellers</h1>
        <p className="text-[14px] text-on-surface-variant">All registered sellers on the platform</p>
      </div>
      {error      && <div className={alertCls('error')}>{error}</div>}
      {actionError && <div className={alertCls('error')}>{actionError}</div>}
      <div className="bg-surface border border-outline-variant rounded-xl overflow-hidden mb-6">
        <div className="flex items-center justify-between px-5 py-[18px] border-b border-outline-variant gap-3 flex-wrap">
          <h2 className="text-[16px] font-bold text-on-surface">Seller Accounts</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full border-collapse text-[14px]">
            <thead>
              <tr>
                {['ID', 'Username', 'Email', 'Roles', 'Status', 'Actions'].map(h => (
                  <th key={h} className="px-4 py-[10px] text-left text-[11px] font-bold uppercase tracking-[0.06em] text-on-surface-variant bg-surface-low border-b border-outline-variant whitespace-nowrap">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {loading
                ? <tr><td colSpan={6} className="text-center py-10 text-on-surface-variant">Loading…</td></tr>
                : sellers.length === 0
                  ? <tr><td colSpan={6} className="text-center py-8 text-on-surface-variant">No sellers found</td></tr>
                  : sellers.map(s => (
                    <tr key={s.id} className="hover:bg-surface-low">
                      <td className="px-4 py-3 border-b border-outline-variant text-on-surface align-middle">#{s.id}</td>
                      <td className="px-4 py-3 border-b border-outline-variant font-semibold text-on-surface align-middle">{s.username}</td>
                      <td className="px-4 py-3 border-b border-outline-variant text-on-surface align-middle">{s.email}</td>
                      <td className="px-4 py-3 border-b border-outline-variant align-middle">
                        {s.roles?.map(r => (
                          <span key={r} className="inline-flex items-center mr-1 px-2 py-[2px] rounded-full text-[11px] font-bold uppercase tracking-[0.04em] border bg-blue-100 text-blue-700 border-blue-200">
                            {r.replace('ROLE_', '')}
                          </span>
                        ))}
                      </td>
                      <td className="px-4 py-3 border-b border-outline-variant align-middle">
                        <span className={`inline-flex items-center px-2 py-[2px] rounded-full text-[11px] font-bold uppercase tracking-[0.04em] border ${statusBadgeCls(s)}`}>
                          {statusLabel(s)}
                        </span>
                      </td>
                      <td className="px-4 py-3 border-b border-outline-variant align-middle">
                        <div className="flex gap-1.5 flex-wrap">
                          {/* Active seller — show Suspend + Ban */}
                          {!s.banned && !s.suspended && (
                            <>
                              <button
                                className={btnCls('outline', true)}
                                disabled={actingId === s.id}
                                onClick={() => handleAction(s.id, 'suspend')}
                              >
                                Suspend
                              </button>
                              <button
                                className={btnCls('danger', true)}
                                disabled={actingId === s.id}
                                onClick={() => handleAction(s.id, 'ban')}
                              >
                                Ban
                              </button>
                            </>
                          )}
                          {/* Suspended seller — show Activate + Ban */}
                          {s.suspended && !s.banned && (
                            <>
                              <button
                                className={btnCls('primary', true)}
                                disabled={actingId === s.id}
                                onClick={() => handleAction(s.id, 'activate')}
                              >
                                Activate
                              </button>
                              <button
                                className={btnCls('danger', true)}
                                disabled={actingId === s.id}
                                onClick={() => handleAction(s.id, 'ban')}
                              >
                                Ban
                              </button>
                            </>
                          )}
                          {/* Banned seller — only Activate */}
                          {s.banned && (
                            <button
                              className={btnCls('primary', true)}
                              disabled={actingId === s.id}
                              onClick={() => handleAction(s.id, 'activate')}
                            >
                              Unban
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
            </tbody>
          </table>
        </div>
      </div>
    </>
  );
}

/* ── Shared Modals ────────────────────────────────────────────────────────── */
interface ProductModalProps {
  product: Product | null;
  categories: Category[];
  isAdmin: boolean;
  onClose: () => void;
  onSaved: () => void;
}

export function ProductModal({ product, categories, isAdmin, onClose, onSaved }: ProductModalProps) {
  const [form, setForm] = useState({
    productName: product?.productName ?? '',
    description: product?.description ?? '',
    price: product?.price ?? 0,
    discount: product?.discount ?? 0,
    quantity: product?.quantity ?? 0,
    categoryId: categories[0]?.categoryId ?? 0,
  });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const set = (k: string, v: string | number) => setForm(f => ({ ...f, [k]: v }));

  // Sync categoryId when categories load asynchronously (seller flow)
  useEffect(() => {
    if (!product && categories.length > 0 && form.categoryId === 0) {
      setForm(f => ({ ...f, categoryId: categories[0].categoryId }));
    }
  }, [categories, product, form.categoryId]);

  const handleSave = async () => {
    if (!form.productName.trim() || form.productName.trim().length < 3) {
      setError('Product name must be at least 3 characters'); return;
    }
    if (!form.description.trim() || form.description.trim().length < 6) {
      setError('Description must be at least 6 characters'); return;
    }
    if (!product && form.categoryId === 0) {
      setError('Please select a category'); return;
    }
    setSaving(true); setError('');
    try {
      if (product) {
        if (isAdmin) await apiClient.adminUpdateProduct(product.productId, form);
        else await apiClient.sellerUpdateProduct(product.productId, form);
      } else {
        const payload = { ...form, image: 'default.png', specialPrice: 0 };
        if (isAdmin) await apiClient.adminAddProduct(form.categoryId, payload);
        else await apiClient.sellerAddProduct(form.categoryId, payload);
      }
      onSaved();
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Save failed');
    } finally { setSaving(false); }
  };

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-[1000] p-4" onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="bg-surface rounded-xl p-7 w-full max-w-[520px] max-h-[90vh] overflow-y-auto shadow-xl">
        <h2 className="text-[18px] font-bold text-on-surface mb-5">{product ? 'Edit Product' : 'Add Product'}</h2>
        {error && <div className={alertCls('error')}>{error}</div>}
        <div className="grid gap-4 mb-4" style={{ gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))' }}>
          <div className="flex flex-col gap-1.5" style={{ gridColumn: '1 / -1' }}>
            <label className="text-[13px] font-semibold text-on-surface">Product Name</label>
            <input className={formInputCls} value={form.productName} onChange={e => set('productName', e.target.value)} />
          </div>
          <div className="flex flex-col gap-1.5" style={{ gridColumn: '1 / -1' }}>
            <label className="text-[13px] font-semibold text-on-surface">Description <span className="text-on-surface-variant font-normal">(min 6 chars)</span></label>
            <textarea
              className={formInputCls}
              rows={3}
              style={{ resize: 'vertical', fontFamily: 'inherit' }}
              placeholder="Describe the product (at least 6 characters)"
              value={form.description}
              onChange={e => set('description', e.target.value)}
            />
          </div>
          <div className="flex flex-col gap-1.5">
            <label className="text-[13px] font-semibold text-on-surface">Price ($)</label>
            <input className={formInputCls} type="number" min="0" step="0.01" value={form.price} onChange={e => set('price', parseFloat(e.target.value))} />
          </div>
          <div className="flex flex-col gap-1.5">
            <label className="text-[13px] font-semibold text-on-surface">Discount (%)</label>
            <input className={formInputCls} type="number" min="0" max="100" value={form.discount} onChange={e => set('discount', parseFloat(e.target.value))} />
          </div>
          <div className="flex flex-col gap-1.5">
            <label className="text-[13px] font-semibold text-on-surface">Stock Quantity</label>
            <input className={formInputCls} type="number" min="0" value={form.quantity} onChange={e => set('quantity', parseInt(e.target.value))} />
          </div>
          {!product && (
            <div className="flex flex-col gap-1.5">
              <label className="text-[13px] font-semibold text-on-surface">Category</label>
              <select className={formInputCls} value={form.categoryId} onChange={e => set('categoryId', parseInt(e.target.value))}>
                {categories.map(c => <option key={c.categoryId} value={c.categoryId}>{c.categoryName}</option>)}
              </select>
            </div>
          )}
        </div>
        <div className="flex justify-end gap-2.5 mt-6">
          <button className={btnCls('outline')} onClick={onClose}>Cancel</button>
          <button className={btnCls('primary')} onClick={handleSave} disabled={saving}>{saving ? 'Saving…' : 'Save'}</button>
        </div>
      </div>
    </div>
  );
}

interface CategoryModalProps { category: Category | null; onClose: () => void; onSaved: () => void; }

export function CategoryModal({ category, onClose, onSaved }: CategoryModalProps) {
  const [name, setName] = useState(category?.categoryName ?? '');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const handleSave = async () => {
    if (!name.trim()) { setError('Name is required'); return; }
    setSaving(true); setError('');
    try {
      if (category) await apiClient.adminUpdateCategory(category.categoryId, name.trim());
      else await apiClient.adminCreateCategory(name.trim());
      onSaved();
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Save failed');
    } finally { setSaving(false); }
  };

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-[1000] p-4" onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="bg-surface rounded-xl p-7 w-full max-w-[520px] max-h-[90vh] overflow-y-auto shadow-xl">
        <h2 className="text-[18px] font-bold text-on-surface mb-5">{category ? 'Edit Category' : 'Add Category'}</h2>
        {error && <div className={alertCls('error')}>{error}</div>}
        <div className="flex flex-col gap-1.5 mb-4">
          <label className="text-[13px] font-semibold text-on-surface">Category Name</label>
          <input className={formInputCls} value={name} onChange={e => setName(e.target.value)} autoFocus />
        </div>
        <div className="flex justify-end gap-2.5 mt-6">
          <button className={btnCls('outline')} onClick={onClose}>Cancel</button>
          <button className={btnCls('primary')} onClick={handleSave} disabled={saving}>{saving ? 'Saving…' : 'Save'}</button>
        </div>
      </div>
    </div>
  );
}

/* ── Image Upload Modal ───────────────────────────────────────────────────── */
interface ImageUploadModalProps {
  product: Product;
  isAdmin: boolean;
  onClose: () => void;
  onSaved: () => void;
}

export function ImageUploadModal({ product, isAdmin, onClose, onSaved }: ImageUploadModalProps) {
  // Gallery state — initialised from the product's images array, falling back to
  // the legacy single-image field so older products still show their picture.
  const initGallery = (): string[] => {
    if (product.images && product.images.length > 0) return [...product.images];
    if (product.image && product.image !== 'default.png') return [product.image];
    return [];
  };

  const [gallery,   setGallery]   = useState<string[]>(initGallery);
  const [selected,  setSelected]  = useState<string | null>(gallery[0] ?? null);
  const [files,     setFiles]     = useState<File[]>([]);
  const [previews,  setPreviews]  = useState<string[]>([]);  // blob URLs for pending files
  const [dragging,  setDragging]  = useState(false);
  const [uploading, setUploading] = useState(false);
  const [deleting,  setDeleting]  = useState<string | null>(null);
  const [error,     setError]     = useState('');
  const [success,   setSuccess]   = useState('');
  const inputRef = React.useRef<HTMLInputElement>(null);

  const ALLOWED = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];
  const MAX_MB  = 10;

  // ── helpers ──────────────────────────────────────────────────────────────

  // Only Cloudinary (http) and blob preview URLs are valid; local filenames are legacy stale data
  const resolveUrl = (url: string) =>
    url.startsWith('http') || url.startsWith('blob:') ? url : null;

  const pickFiles = (raw: FileList | null) => {
    if (!raw) return;
    setError('');
    const valid: File[]   = [];
    const blobs: string[] = [];
    Array.from(raw).forEach(f => {
      if (!ALLOWED.includes(f.type))          { setError(`"${f.name}" is not a supported image type.`); return; }
      if (f.size > MAX_MB * 1024 * 1024)      { setError(`"${f.name}" exceeds ${MAX_MB} MB.`);          return; }
      valid.push(f);
      blobs.push(URL.createObjectURL(f));
    });
    setFiles(prev  => [...prev,  ...valid]);
    setPreviews(prev => [...prev, ...blobs]);
    // Select first newly staged image in the preview strip
    if (blobs.length > 0) setSelected(blobs[0]);
  };

  const removePending = (idx: number) => {
    URL.revokeObjectURL(previews[idx]);
    setFiles(prev    => prev.filter((_, i) => i !== idx));
    setPreviews(prev => {
      const next = prev.filter((_, i) => i !== idx);
      if (selected === prev[idx]) setSelected(next[0] ?? gallery[0] ?? null);
      return next;
    });
  };

  // ── upload staged files ───────────────────────────────────────────────────

  const handleUpload = async () => {
    if (files.length === 0) { setError('Please select at least one image first.'); return; }
    setUploading(true); setError(''); setSuccess('');
    try {
      const updated = isAdmin
        ? await apiClient.adminAddProductImages(product.productId, files)
        : await apiClient.sellerAddProductImages(product.productId, files);

      const nextGallery = updated.images ?? [];
      setGallery(nextGallery);
      setSelected(nextGallery[nextGallery.length - 1] ?? null);
      // clean up blob URLs
      previews.forEach(URL.revokeObjectURL);
      setFiles([]);
      setPreviews([]);
      setSuccess(`${files.length} image${files.length > 1 ? 's' : ''} uploaded successfully!`);
      setTimeout(() => onSaved(), 900);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Upload failed. Please try again.');
    } finally { setUploading(false); }
  };

  // ── delete an existing gallery image ─────────────────────────────────────

  const handleDelete = async (url: string) => {
    if (!confirm('Remove this image from the product?')) return;
    setDeleting(url); setError(''); setSuccess('');
    try {
      const updated = isAdmin
        ? await apiClient.adminDeleteProductImage(product.productId, url)
        : await apiClient.sellerDeleteProductImage(product.productId, url);

      const nextGallery = updated.images ?? [];
      setGallery(nextGallery);
      setSelected(prev => prev === url ? (nextGallery[0] ?? null) : prev);
      setSuccess('Image removed.');
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Delete failed. Please try again.');
    } finally { setDeleting(null); }
  };

  // ── render ────────────────────────────────────────────────────────────────

  // All thumbnails = saved gallery + staged blob previews
  // resolveUrl returns null for legacy local filenames; filter those out to avoid broken requests
  const allThumbs: Array<{ src: string; isPending: boolean; pendingIdx?: number; _raw?: string }> = [
    ...gallery
      .map(src => ({ src: resolveUrl(src), isPending: false, _raw: src }))
      .filter((t): t is { src: string; isPending: boolean; _raw: string } => t.src !== null),
    ...previews.map((src, i) => ({ src, isPending: true, pendingIdx: i })),
  ];

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-[1000] p-4" onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="bg-surface rounded-xl p-7 w-full max-w-[540px] max-h-[90vh] overflow-y-auto shadow-xl">
        <h2 className="text-[18px] font-bold text-on-surface mb-4">🖼 Product Gallery</h2>
        <p className="text-[13px] text-on-surface-variant mb-4">
          <strong>{product.productName}</strong>
          <span className="ml-2 font-normal">{gallery.length} saved · {files.length} pending</span>
        </p>

        {error   && <div className={alertCls('error')}>{error}</div>}
        {success && <div className={alertCls('success')}>✅ {success}</div>}

        {/* ── Main Preview ── */}
        <div className="w-full h-[240px] rounded-xl bg-surface-low border border-outline-variant flex items-center justify-center overflow-hidden mb-3">
          {selected ? (
            <img src={selected} alt="Selected" className="max-w-full max-h-full object-contain block" />
          ) : (
            <div className="flex flex-col items-center gap-2 text-on-surface-variant text-[13px]">
              <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" style={{ opacity: 0.35 }}>
                <rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="8.5" cy="8.5" r="1.5"/>
                <polyline points="21 15 16 10 5 21"/>
              </svg>
              <p>No images yet</p>
            </div>
          )}
        </div>

        {/* ── Thumbnail Strip ── */}
        {allThumbs.length > 0 && (
          <div className="flex gap-2 overflow-x-auto pb-2 pt-1 scrollbar-thin" role="list" aria-label="Image gallery">
            {allThumbs.map((t, i) => {
              const isActive = selected === t.src;
              const isBeingDeleted = !t.isPending && deleting === (t as { _raw?: string })._raw;
              return (
                <div
                  key={i}
                  className={`relative w-[72px] h-[72px] shrink-0 rounded-lg border-2 overflow-hidden cursor-pointer bg-surface-low transition-all ${isActive ? 'border-secondary shadow-[0_0_0_2px_color-mix(in_srgb,var(--color-secondary)_25%,transparent)]' : 'border-outline-variant'} ${isBeingDeleted ? 'opacity-50 pointer-events-none' : ''}`}
                  role="listitem"
                >
                  <img
                    src={t.src}
                    alt={`Image ${i + 1}`}
                    onClick={() => setSelected(t.src)}
                    className="w-full h-full object-cover block"
                  />
                  {/* Remove button */}
                  <button
                    className="absolute top-[3px] right-[3px] w-[18px] h-[18px] rounded-full bg-black/65 text-white text-[13px] leading-none flex items-center justify-center border-none cursor-pointer opacity-0 hover:opacity-100 transition-opacity p-0 [.img-gallery-thumb:hover_&]:opacity-100"
                    title={t.isPending ? 'Remove from queue' : 'Delete image'}
                    aria-label={t.isPending ? 'Remove from queue' : 'Delete image'}
                    disabled={uploading || !!deleting}
                    onClick={e => {
                      e.stopPropagation();
                      if (t.isPending && t.pendingIdx !== undefined) {
                        removePending(t.pendingIdx);
                      } else {
                        handleDelete((t as { _raw?: string })._raw!);
                      }
                    }}
                  >
                    {isBeingDeleted
                      ? <span className="w-3 h-3 rounded-full border-2 border-white/30 border-t-white animate-spin" />
                      : '×'}
                  </button>
                  {/* Pending badge */}
                  {t.isPending && (
                    <span className="absolute bottom-[3px] left-[3px] bg-secondary text-on-secondary text-[9px] font-bold uppercase tracking-[0.04em] px-1 py-[1px] rounded-sm leading-[1.4]">new</span>
                  )}
                </div>
              );
            })}

            {/* Add-more slot */}
            <button
              className="relative w-[72px] h-[72px] shrink-0 rounded-lg border-2 border-dashed border-outline-variant bg-transparent text-on-surface-variant cursor-pointer flex items-center justify-center transition-all hover:border-secondary hover:text-secondary disabled:opacity-40 disabled:cursor-not-allowed"
              onClick={() => inputRef.current?.click()}
              title="Add more images"
              aria-label="Add more images"
              disabled={uploading}
            >
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/>
              </svg>
            </button>
          </div>
        )}

        {/* ── Drop Zone (shown when no images exist at all) ── */}
        {allThumbs.length === 0 && (
          <div
            className={`border-2 border-dashed rounded-xl cursor-pointer transition-all overflow-hidden min-h-[200px] flex items-center justify-center bg-surface-low ${dragging ? 'border-secondary bg-secondary/6' : 'border-outline-variant hover:border-secondary hover:bg-secondary/6'}`}
            onClick={() => inputRef.current?.click()}
            onDragOver={e => { e.preventDefault(); setDragging(true); }}
            onDragLeave={() => setDragging(false)}
            onDrop={e => { e.preventDefault(); setDragging(false); pickFiles(e.dataTransfer.files); }}
          >
            <div className="flex flex-col items-center justify-center p-8 text-center text-on-surface w-full">
              <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" style={{ opacity: 0.4 }}>
                <rect x="3" y="3" width="18" height="18" rx="2" ry="2"/><circle cx="8.5" cy="8.5" r="1.5"/>
                <polyline points="21 15 16 10 5 21"/>
              </svg>
              <p className="mt-2.5 mb-1 font-semibold">Drop images here</p>
              <p className="text-[12px] text-on-surface-variant">
                or click to browse · JPEG, PNG, WebP, GIF · max {MAX_MB} MB each
              </p>
            </div>
          </div>
        )}

        {/* Hidden multi-file input */}
        <input
          ref={inputRef}
          type="file"
          accept={ALLOWED.join(',')}
          multiple
          className="hidden"
          onChange={e => pickFiles(e.target.files)}
          // reset value so re-selecting same file fires onChange
          onClick={e => { (e.target as HTMLInputElement).value = ''; }}
        />

        {files.length > 0 && (
          <p className="text-[12px] text-on-surface-variant mt-2.5 text-center">
            {files.length} file{files.length > 1 ? 's' : ''} queued —{' '}
            {(files.reduce((s, f) => s + f.size, 0) / 1024).toFixed(0)} KB total
          </p>
        )}

        <div className="flex justify-end gap-2.5 mt-6">
          <button className={btnCls('outline')} onClick={onClose} disabled={uploading || !!deleting}>
            Close
          </button>
          {files.length > 0 && (
            <button className={btnCls('primary')} onClick={handleUpload} disabled={uploading}>
              {uploading
                ? <><span className="w-3.5 h-3.5 rounded-full border-2 border-white/30 border-t-white animate-spin" />Uploading…</>
                : `⬆ Upload ${files.length} image${files.length > 1 ? 's' : ''}`}
            </button>
          )}
          {files.length === 0 && gallery.length > 0 && (
            <button className={btnCls('outline')} onClick={() => inputRef.current?.click()} disabled={uploading}>
              + Add images
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

/* ── Icons ────────────────────────────────────────────────────────────────── */
const overviewIcon    = <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/></svg>;
const productIcon     = <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"/></svg>;
const myProductsIcon  = <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M20.59 13.41l-7.17 7.17a2 2 0 01-2.83 0L2 12V2h10l8.59 8.59a2 2 0 010 2.82z"/><line x1="7" y1="7" x2="7.01" y2="7"/></svg>;
const categoryIcon    = <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M4 6h16M4 12h16M4 18h16"/></svg>;
const orderIcon       = <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M6 2L3 6v14a2 2 0 002 2h14a2 2 0 002-2V6l-3-4z"/><line x1="3" y1="6" x2="21" y2="6"/><path d="M16 10a4 4 0 01-8 0"/></svg>;
const sellerIcon      = <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 00-3-3.87"/><path d="M16 3.13a4 4 0 010 7.75"/></svg>;
const logoutIcon      = <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/></svg>;
