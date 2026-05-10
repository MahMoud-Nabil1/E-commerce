import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { apiClient, type Product, type Category, type Order } from '../lib/api';
import './Dashboard.css';

type Tab = 'overview' | 'products' | 'categories' | 'orders' | 'sellers';

const ORDER_STATUSES = ['Accepted', 'Processing', 'Shipped', 'Delivered', 'Cancelled'];

function statusBadge(status: string) {
  const map: Record<string, string> = {
    Accepted: 'badge--blue', Processing: 'badge--orange',
    Shipped: 'badge--purple', Delivered: 'badge--green', Cancelled: 'badge--red',
  };
  return map[status] ?? 'badge--gray';
}

export default function AdminDashboard() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [tab, setTab] = useState<Tab>('overview');

  const handleLogout = async () => { await logout(); navigate('/login'); };
  const initials = user?.username?.slice(0, 2).toUpperCase() ?? 'AD';

  return (
    <div className="dashboard">
      <aside className="dashboard__sidebar">
        <div className="sidebar__brand">
          <p className="sidebar__brand-label">Admin Panel</p>
          <p className="sidebar__brand-title">ShopFlow</p>
        </div>
        <nav className="sidebar__nav">
          {([
            ['overview',   'Overview',   overviewIcon],
            ['products',   'Products',   productIcon],
            ['categories', 'Categories', categoryIcon],
            ['orders',     'Orders',     orderIcon],
            ['sellers',    'Sellers',    sellerIcon],
          ] as [Tab, string, React.ReactNode][]).map(([key, label, icon]) => (
            <button key={key} className={`sidebar__link${tab === key ? ' active' : ''}`} onClick={() => setTab(key)}>
              {icon}{label}
            </button>
          ))}
          <div className="sidebar__divider" />
          <button className="sidebar__link" onClick={handleLogout}>{logoutIcon}Sign Out</button>
        </nav>
        <div className="sidebar__footer">
          <div className="sidebar__user">
            <div className="sidebar__avatar">{initials}</div>
            <div className="sidebar__user-info">
              <p className="sidebar__username">{user?.username}</p>
              <p className="sidebar__role">Administrator</p>
            </div>
          </div>
        </div>
      </aside>
      <main className="dashboard__main">
        {tab === 'overview'   && <OverviewTab />}
        {tab === 'products'   && <ProductsTab />}
        {tab === 'categories' && <CategoriesTab />}
        {tab === 'orders'     && <OrdersTab />}
        {tab === 'sellers'    && <SellersTab />}
      </main>
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

  if (loading) return <p style={{ color: 'var(--on-surface-variant)' }}>Loading…</p>;

  return (
    <>
      <div className="dashboard__header">
        <h1 className="dashboard__title">Overview</h1>
        <p className="dashboard__subtitle">Welcome back — here's what's happening today.</p>
      </div>
      <div className="stats-grid">
        <StatCard icon="📦" iconClass="stat-card__icon--blue"   label="Total Products"  value={stats.products}   />
        <StatCard icon="🗂️" iconClass="stat-card__icon--purple" label="Categories"      value={stats.categories} />
        <StatCard icon="🛒" iconClass="stat-card__icon--orange" label="Total Orders"    value={stats.orders}     />
        <StatCard icon="🏪" iconClass="stat-card__icon--green"  label="Active Sellers"  value={stats.sellers}    />
      </div>
      <div className="section-card">
        <div className="section-card__header"><h2 className="section-card__title">Recent Orders</h2></div>
        <div className="data-table-wrap">
          <table className="data-table">
            <thead><tr><th>Order ID</th><th>Customer</th><th>Date</th><th>Total</th><th>Status</th></tr></thead>
            <tbody>
              {recentOrders.length === 0
                ? <tr><td colSpan={5} style={{ textAlign: 'center', padding: '32px', color: 'var(--on-surface-variant)' }}>No orders yet</td></tr>
                : recentOrders.map(o => (
                  <tr key={o.orderId}>
                    <td>#{o.orderId}</td><td>{o.email}</td><td>{o.orderDate}</td>
                    <td>${o.totalAmount?.toFixed(2)}</td>
                    <td><span className={`badge ${statusBadge(o.orderStatus)}`}>{o.orderStatus}</span></td>
                  </tr>
                ))}
            </tbody>
          </table>
        </div>
      </div>
    </>
  );
}

function StatCard({ icon, iconClass, label, value }: { icon: string; iconClass: string; label: string; value: number }) {
  return (
    <div className="stat-card">
      <div className={`stat-card__icon ${iconClass}`}>{icon}</div>
      <p className="stat-card__label">{label}</p>
      <p className="stat-card__value">{value.toLocaleString()}</p>
    </div>
  );
}

function ProductsTab() {
  const [products, setProducts] = useState<Product[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState<Product | null>(null);
  const [categories, setCategories] = useState<Category[]>([]);

  const load = useCallback(() => {
    setLoading(true);
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
      <div className="dashboard__header">
        <h1 className="dashboard__title">Products</h1>
        <p className="dashboard__subtitle">{total} products in the catalog</p>
      </div>
      {error && <div className="alert alert--error">{error}</div>}
      <div className="section-card">
        <div className="section-card__header">
          <h2 className="section-card__title">All Products</h2>
          <button className="btn btn--primary" onClick={() => { setEditing(null); setShowModal(true); }}>+ Add Product</button>
        </div>
        <div className="data-table-wrap">
          <table className="data-table">
            <thead><tr><th>ID</th><th>Name</th><th>Price</th><th>Discount</th><th>Stock</th><th>Actions</th></tr></thead>
            <tbody>
              {loading
                ? <tr className="loading-row"><td colSpan={6}>Loading…</td></tr>
                : products.length === 0
                  ? <tr><td colSpan={6} style={{ textAlign: 'center', padding: '32px', color: 'var(--on-surface-variant)' }}>No products</td></tr>
                  : products.map(p => (
                    <tr key={p.productId}>
                      <td>#{p.productId}</td>
                      <td style={{ fontWeight: 600 }}>{p.productName}</td>
                      <td>${p.price?.toFixed(2)}</td>
                      <td>{p.discount}%</td>
                      <td><span className={`badge ${p.quantity > 0 ? 'badge--green' : 'badge--red'}`}>{p.quantity > 0 ? p.quantity : 'Out'}</span></td>
                      <td>
                        <div style={{ display: 'flex', gap: '6px' }}>
                          <button className="btn btn--outline btn--sm" onClick={() => { setEditing(p); setShowModal(true); }}>Edit</button>
                          <button className="btn btn--danger btn--sm" onClick={() => handleDelete(p.productId)}>Delete</button>
                        </div>
                      </td>
                    </tr>
                  ))}
            </tbody>
          </table>
        </div>
        <div className="pagination">
          <button className="btn btn--outline btn--sm" disabled={page === 0} onClick={() => setPage(p => p - 1)}>← Prev</button>
          <span>Page {page + 1}</span>
          <button className="btn btn--outline btn--sm" disabled={(page + 1) * 15 >= total} onClick={() => setPage(p => p + 1)}>Next →</button>
        </div>
      </div>
      {showModal && <ProductModal product={editing} categories={categories} isAdmin onClose={() => setShowModal(false)} onSaved={() => { setShowModal(false); load(); }} />}
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
      <div className="dashboard__header">
        <h1 className="dashboard__title">Categories</h1>
        <p className="dashboard__subtitle">{total} categories</p>
      </div>
      {error && <div className="alert alert--error">{error}</div>}
      <div className="section-card">
        <div className="section-card__header">
          <h2 className="section-card__title">All Categories</h2>
          <button className="btn btn--primary" onClick={() => { setEditing(null); setShowModal(true); }}>+ Add Category</button>
        </div>
        <div className="data-table-wrap">
          <table className="data-table">
            <thead><tr><th>ID</th><th>Name</th><th>Actions</th></tr></thead>
            <tbody>
              {loading
                ? <tr className="loading-row"><td colSpan={3}>Loading…</td></tr>
                : cats.map(c => (
                  <tr key={c.categoryId}>
                    <td>#{c.categoryId}</td>
                    <td style={{ fontWeight: 600 }}>{c.categoryName}</td>
                    <td>
                      <div style={{ display: 'flex', gap: '6px' }}>
                        <button className="btn btn--outline btn--sm" onClick={() => { setEditing(c); setShowModal(true); }}>Edit</button>
                        <button className="btn btn--danger btn--sm" onClick={() => handleDelete(c.categoryId)}>Delete</button>
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

  return (
    <>
      <div className="dashboard__header">
        <h1 className="dashboard__title">Orders</h1>
        <p className="dashboard__subtitle">{total} total orders</p>
      </div>
      {error && <div className="alert alert--error">{error}</div>}
      <div className="section-card">
        <div className="section-card__header"><h2 className="section-card__title">All Orders</h2></div>
        <div className="data-table-wrap">
          <table className="data-table">
            <thead><tr><th>ID</th><th>Customer</th><th>Date</th><th>Items</th><th>Total</th><th>Status</th><th>Update</th></tr></thead>
            <tbody>
              {loading
                ? <tr className="loading-row"><td colSpan={7}>Loading…</td></tr>
                : orders.length === 0
                  ? <tr><td colSpan={7} style={{ textAlign: 'center', padding: '32px', color: 'var(--on-surface-variant)' }}>No orders</td></tr>
                  : orders.map(o => (
                    <tr key={o.orderId}>
                      <td>#{o.orderId}</td><td>{o.email}</td><td>{o.orderDate}</td>
                      <td>{o.orderItems?.length ?? 0}</td>
                      <td>${o.totalAmount?.toFixed(2)}</td>
                      <td><span className={`badge ${statusBadge(o.orderStatus)}`}>{o.orderStatus}</span></td>
                      <td>
                        <select className="form-select" style={{ padding: '4px 8px', fontSize: '12px' }}
                          value={o.orderStatus} disabled={updatingId === o.orderId}
                          onChange={e => handleStatusChange(o.orderId, e.target.value)}>
                          {ORDER_STATUSES.map(s => <option key={s} value={s}>{s}</option>)}
                        </select>
                      </td>
                    </tr>
                  ))}
            </tbody>
          </table>
        </div>
        <div className="pagination">
          <button className="btn btn--outline btn--sm" disabled={page === 0} onClick={() => setPage(p => p - 1)}>← Prev</button>
          <span>Page {page + 1} of {Math.ceil(total / 15) || 1}</span>
          <button className="btn btn--outline btn--sm" disabled={(page + 1) * 15 >= total} onClick={() => setPage(p => p + 1)}>Next →</button>
        </div>
      </div>
    </>
  );
}

function SellersTab() {
  const [sellers, setSellers] = useState<{ id: number; username: string; email: string; roles: string[] }[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    apiClient.adminGetSellers(0)
      .then(r => setSellers(r.content ?? []))
      .catch(() => setError('Failed to load sellers'))
      .finally(() => setLoading(false));
  }, []);

  return (
    <>
      <div className="dashboard__header">
        <h1 className="dashboard__title">Sellers</h1>
        <p className="dashboard__subtitle">All registered sellers on the platform</p>
      </div>
      {error && <div className="alert alert--error">{error}</div>}
      <div className="section-card">
        <div className="section-card__header"><h2 className="section-card__title">Seller Accounts</h2></div>
        <div className="data-table-wrap">
          <table className="data-table">
            <thead><tr><th>ID</th><th>Username</th><th>Email</th><th>Roles</th></tr></thead>
            <tbody>
              {loading
                ? <tr className="loading-row"><td colSpan={4}>Loading…</td></tr>
                : sellers.length === 0
                  ? <tr><td colSpan={4} style={{ textAlign: 'center', padding: '32px', color: 'var(--on-surface-variant)' }}>No sellers found</td></tr>
                  : sellers.map(s => (
                    <tr key={s.id}>
                      <td>#{s.id}</td>
                      <td style={{ fontWeight: 600 }}>{s.username}</td>
                      <td>{s.email}</td>
                      <td>{s.roles?.map(r => <span key={r} className="badge badge--blue" style={{ marginRight: 4 }}>{r.replace('ROLE_', '')}</span>)}</td>
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
    <div className="modal-overlay" onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="modal">
        <h2 className="modal__title">{product ? 'Edit Product' : 'Add Product'}</h2>
        {error && <div className="alert alert--error">{error}</div>}
        <div className="form-row">
          <div className="form-field" style={{ gridColumn: '1 / -1' }}>
            <label className="form-label">Product Name</label>
            <input className="form-input" value={form.productName} onChange={e => set('productName', e.target.value)} />
          </div>
          <div className="form-field" style={{ gridColumn: '1 / -1' }}>
            <label className="form-label">Description <span style={{ color: 'var(--on-surface-variant)', fontWeight: 400 }}>(min 6 chars)</span></label>
            <textarea
              className="form-input"
              rows={3}
              style={{ resize: 'vertical', fontFamily: 'inherit' }}
              placeholder="Describe the product (at least 6 characters)"
              value={form.description}
              onChange={e => set('description', e.target.value)}
            />
          </div>
          <div className="form-field">
            <label className="form-label">Price ($)</label>
            <input className="form-input" type="number" min="0" step="0.01" value={form.price} onChange={e => set('price', parseFloat(e.target.value))} />
          </div>
          <div className="form-field">
            <label className="form-label">Discount (%)</label>
            <input className="form-input" type="number" min="0" max="100" value={form.discount} onChange={e => set('discount', parseFloat(e.target.value))} />
          </div>
          <div className="form-field">
            <label className="form-label">Stock Quantity</label>
            <input className="form-input" type="number" min="0" value={form.quantity} onChange={e => set('quantity', parseInt(e.target.value))} />
          </div>
          {!product && (
            <div className="form-field">
              <label className="form-label">Category</label>
              <select className="form-select" value={form.categoryId} onChange={e => set('categoryId', parseInt(e.target.value))}>
                {categories.map(c => <option key={c.categoryId} value={c.categoryId}>{c.categoryName}</option>)}
              </select>
            </div>
          )}
        </div>
        <div className="modal__footer">
          <button className="btn btn--outline" onClick={onClose}>Cancel</button>
          <button className="btn btn--primary" onClick={handleSave} disabled={saving}>{saving ? 'Saving…' : 'Save'}</button>
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
    <div className="modal-overlay" onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="modal">
        <h2 className="modal__title">{category ? 'Edit Category' : 'Add Category'}</h2>
        {error && <div className="alert alert--error">{error}</div>}
        <div className="form-field">
          <label className="form-label">Category Name</label>
          <input className="form-input" value={name} onChange={e => setName(e.target.value)} autoFocus />
        </div>
        <div className="modal__footer">
          <button className="btn btn--outline" onClick={onClose}>Cancel</button>
          <button className="btn btn--primary" onClick={handleSave} disabled={saving}>{saving ? 'Saving…' : 'Save'}</button>
        </div>
      </div>
    </div>
  );
}

/* ── Icons ────────────────────────────────────────────────────────────────── */
import React from 'react';
const overviewIcon = <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/></svg>;
const productIcon  = <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"/></svg>;
const categoryIcon = <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M4 6h16M4 12h16M4 18h16"/></svg>;
const orderIcon    = <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M6 2L3 6v14a2 2 0 002 2h14a2 2 0 002-2V6l-3-4z"/><line x1="3" y1="6" x2="21" y2="6"/><path d="M16 10a4 4 0 01-8 0"/></svg>;
const sellerIcon   = <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 00-3-3.87"/><path d="M16 3.13a4 4 0 010 7.75"/></svg>;
const logoutIcon   = <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/></svg>;
