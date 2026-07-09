import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { apiClient } from '../lib/api';
import type { Product, Category, Order } from '../types';
import { ProductModal, ImageUploadModal } from './AdminDashboard';
import './Dashboard.css';

type Tab = 'overview' | 'products' | 'orders';

const ORDER_STATUSES = ['Accepted', 'Processing', 'Shipped', 'Delivered', 'Cancelled'];

function statusBadge(status: string) {
  const map: Record<string, string> = {
    Accepted: 'badge--blue', Processing: 'badge--orange',
    Shipped: 'badge--purple', Delivered: 'badge--green', Cancelled: 'badge--red',
  };
  return map[status] ?? 'badge--gray';
}

export default function SellerDashboard() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [tab, setTab] = useState<Tab>('overview');

  const handleLogout = async () => { await logout(); navigate('/login'); };
  const initials = user?.username?.slice(0, 2).toUpperCase() ?? 'SE';

  return (
    <div className="dashboard">
      <aside className="dashboard__sidebar">
        <div className="sidebar__brand">
          <p className="sidebar__brand-label">Seller Panel</p>
          <p className="sidebar__brand-title">ShopFlow</p>
        </div>
        <nav className="sidebar__nav">
          {([
            ['overview', 'Overview', overviewIcon],
            ['products', 'My Products', productIcon],
            ['orders',   'My Orders',   orderIcon],
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
              <p className="sidebar__role">Seller</p>
            </div>
          </div>
        </div>
      </aside>
      <main className="dashboard__main">
        {tab === 'overview' && <SellerOverviewTab />}
        {tab === 'products' && <SellerProductsTab />}
        {tab === 'orders'   && <SellerOrdersTab />}
      </main>

      {/* ── Mobile bottom nav ── */}
      <nav className="dashboard__mobile-nav" aria-label="Dashboard navigation">
        <div className="dashboard__mobile-nav-inner">
          {([
            ['overview', 'Overview', <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/></svg>],
            ['products', 'Products', <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"/></svg>],
            ['orders',   'Orders',   <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M6 2L3 6v14a2 2 0 002 2h14a2 2 0 002-2V6l-3-4z"/><line x1="3" y1="6" x2="21" y2="6"/></svg>],
          ] as [Tab, string, React.ReactNode][]).map(([key, label, icon]) => (
            <button key={key} className={`dashboard__mobile-nav-btn${tab === key ? ' active' : ''}`} onClick={() => setTab(key)}>
              {icon}{label}
            </button>
          ))}
          <button className="dashboard__mobile-nav-btn" onClick={handleLogout}>
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

  if (loading) return <p style={{ color: 'var(--on-surface-variant)' }}>Loading…</p>;

  return (
    <>
      <div className="dashboard__header">
        <h1 className="dashboard__title">Welcome back, {user?.username} 👋</h1>
        <p className="dashboard__subtitle">Here's what's happening in your store today.</p>
      </div>

      {/* Primary stats */}
      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-card__icon stat-card__icon--blue">📦</div>
          <p className="stat-card__label">My Products</p>
          <p className="stat-card__value">{stats.totalProducts}</p>
          {stats.outOfStock > 0 && (
            <p className="stat-card__sub" style={{ color: '#b85c00' }}>
              ⚠ {stats.outOfStock} out of stock
            </p>
          )}
        </div>
        <div className="stat-card">
          <div className="stat-card__icon stat-card__icon--orange">🛒</div>
          <p className="stat-card__label">Total Orders</p>
          <p className="stat-card__value">{stats.totalOrders}</p>
          {stats.pendingOrders > 0 && (
            <p className="stat-card__sub" style={{ color: '#b85c00' }}>
              {stats.pendingOrders} need attention
            </p>
          )}
        </div>
        <div className="stat-card">
          <div className="stat-card__icon stat-card__icon--green">💰</div>
          <p className="stat-card__label">Total Revenue</p>
          <p className="stat-card__value">${stats.totalRevenue.toFixed(2)}</p>
          <p className="stat-card__sub">Excluding cancelled orders</p>
        </div>
        <div className="stat-card">
          <div className="stat-card__icon stat-card__icon--purple">✅</div>
          <p className="stat-card__label">Delivered</p>
          <p className="stat-card__value">{stats.deliveredOrders}</p>
          <p className="stat-card__sub">
            {stats.totalOrders > 0
              ? `${Math.round((stats.deliveredOrders / stats.totalOrders) * 100)}% completion rate`
              : 'No orders yet'}
          </p>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px' }}>
        {/* Recent Orders */}
        <div className="section-card" style={{ marginBottom: 0 }}>
          <div className="section-card__header">
            <h2 className="section-card__title">Recent Orders</h2>
          </div>
          <div className="data-table-wrap">
            <table className="data-table">
              <thead>
                <tr><th>ID</th><th>Date</th><th>Total</th><th>Status</th></tr>
              </thead>
              <tbody>
                {recentOrders.length === 0
                  ? <tr><td colSpan={4} style={{ textAlign: 'center', padding: '32px', color: 'var(--on-surface-variant)' }}>No orders yet</td></tr>
                  : recentOrders.map(o => (
                    <tr key={o.orderId}>
                      <td>#{o.orderId}</td>
                      <td>{o.orderDate}</td>
                      <td>${o.totalAmount?.toFixed(2)}</td>
                      <td><span className={`badge ${statusBadge(o.orderStatus)}`}>{o.orderStatus}</span></td>
                    </tr>
                  ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Top Products */}
        <div className="section-card" style={{ marginBottom: 0 }}>
          <div className="section-card__header">
            <h2 className="section-card__title">Your Products</h2>
          </div>
          <div className="data-table-wrap">
            <table className="data-table">
              <thead>
                <tr><th>Name</th><th>Price</th><th>Stock</th></tr>
              </thead>
              <tbody>
                {topProducts.length === 0
                  ? <tr><td colSpan={3} style={{ textAlign: 'center', padding: '32px', color: 'var(--on-surface-variant)' }}>No products yet</td></tr>
                  : topProducts.map(p => (
                    <tr key={p.productId}>
                      <td style={{ fontWeight: 600 }}>{p.productName}</td>
                      <td>${p.price?.toFixed(2)}</td>
                      <td>
                        <span className={`badge ${p.quantity > 0 ? 'badge--green' : 'badge--red'}`}>
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
        <div className="section-card" style={{ marginTop: '24px' }}>
          <div className="section-card__header">
            <h2 className="section-card__title">Order Status Breakdown</h2>
          </div>
          <div style={{ display: 'flex', gap: '12px', padding: '16px 20px', flexWrap: 'wrap' }}>
            {(['Accepted', 'Processing', 'Shipped', 'Delivered', 'Cancelled'] as const).map(status => {
              const count = recentOrders.filter(o => o.orderStatus === status).length;
              return (
                <div key={status} style={{
                  display: 'flex', alignItems: 'center', gap: '8px',
                  padding: '8px 14px', borderRadius: '10px',
                  background: 'var(--surface-container-low)',
                  border: '1px solid var(--outline-variant)',
                }}>
                  <span className={`badge ${statusBadge(status)}`}>{status}</span>
                  <span style={{ fontWeight: 700, fontSize: '15px', color: 'var(--on-surface)' }}>{count}</span>
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
      <div className="dashboard__header">
        <h1 className="dashboard__title">My Products</h1>
        <p className="dashboard__subtitle">{total} products in your store</p>
      </div>
      {error && <div className="alert alert--error">{error}</div>}
      <div className="section-card">
        <div className="section-card__header">
          <h2 className="section-card__title">Product Catalog</h2>
          <button className="btn btn--primary" onClick={() => { setEditing(null); setShowModal(true); }}>+ Add Product</button>
        </div>
        <div className="data-table-wrap">
          <table className="data-table">
            <thead><tr><th>ID</th><th>Name</th><th>Price</th><th>Discount</th><th>Stock</th><th>Actions</th></tr></thead>
            <tbody>
              {loading
                ? <tr className="loading-row"><td colSpan={6}>Loading…</td></tr>
                : products.length === 0
                  ? <tr><td colSpan={6} style={{ textAlign: 'center', padding: '32px', color: 'var(--on-surface-variant)' }}>No products yet. Add your first one!</td></tr>
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
                          <button className="btn btn--outline btn--sm" style={{ color: 'var(--primary)' }} onClick={() => setUploadTarget(p)}>📷 Image</button>
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
      <div className="dashboard__header">
        <h1 className="dashboard__title">My Orders</h1>
        <p className="dashboard__subtitle">Orders containing your products</p>
      </div>
      {error && <div className="alert alert--error">{error}</div>}
      <div className="section-card">
        <div className="section-card__header"><h2 className="section-card__title">Order List</h2></div>
        <div className="data-table-wrap">
          <table className="data-table">
            <thead><tr><th>ID</th><th>Customer</th><th>Date</th><th>Products</th><th>Address</th><th>Total</th><th>Status</th><th>Update</th></tr></thead>
            <tbody>
              {loading
                ? <tr className="loading-row"><td colSpan={8}>Loading…</td></tr>
                : orders.length === 0
                  ? <tr><td colSpan={8} style={{ textAlign: 'center', padding: '32px', color: 'var(--on-surface-variant)' }}>No orders yet</td></tr>
                  : orders.map(o => {
                    const addr = o.address;
                    const addrLine = addr
                      ? [addr.street, addr.buildingName, addr.city, addr.state, addr.country, addr.pincode]
                          .filter(Boolean).join(', ')
                      : '—';
                    return (
                    <tr key={o.orderId}>
                      <td>#{o.orderId}</td><td>{o.email}</td><td>{o.orderDate}</td>
                      <td>
                        {o.orderItems && o.orderItems.length > 0 ? (
                          <ul style={{ margin: 0, padding: 0, listStyle: 'none', display: 'flex', flexDirection: 'column', gap: 3 }}>
                            {o.orderItems.map((item, i) => (
                              <li key={i} style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                                <span style={{ width: 6, height: 6, borderRadius: '50%', background: 'var(--secondary)', flexShrink: 0, display: 'inline-block' }} />
                                <span style={{ fontWeight: 500, fontSize: 13 }}>{item.product?.productName}</span>
                                {item.quantity > 1 && (
                                  <span style={{ fontSize: 11, color: 'var(--on-surface-variant)', background: 'var(--surface-container)', borderRadius: 4, padding: '1px 5px' }}>×{item.quantity}</span>
                                )}
                              </li>
                            ))}
                          </ul>
                        ) : <span style={{ color: 'var(--on-surface-variant)' }}>—</span>}
                      </td>
                      <td style={{ fontSize: 13, color: 'var(--on-surface-variant)', maxWidth: 220, whiteSpace: 'normal', lineHeight: 1.4 }}>
                        {addrLine}
                      </td>
                      <td>${o.totalAmount?.toFixed(2)}</td>
                      <td><span className={`badge ${statusBadge(o.orderStatus)}`}>{o.orderStatus}</span></td>
                      <td>
                        {o.orderStatus === 'PENDING_PAYMENT' ? (
                          <button
                            className="btn btn--primary btn--sm"
                            disabled={updatingId === o.orderId}
                            onClick={() => handleApprovePayment(o.orderId)}
                          >
                            Approve
                          </button>
                        ) : (
                          <select className="form-select" style={{ padding: '4px 8px', fontSize: '12px' }}
                            value={o.orderStatus} disabled={updatingId === o.orderId}
                            onChange={e => handleStatusChange(o.orderId, e.target.value)}>
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
        <div className="pagination">
          <button className="btn btn--outline btn--sm" disabled={page === 0} onClick={() => setPage(p => p - 1)}>← Prev</button>
          <span>Page {page + 1} of {Math.ceil(total / 15) || 1}</span>
          <button className="btn btn--outline btn--sm" disabled={(page + 1) * 15 >= total} onClick={() => setPage(p => p + 1)}>Next →</button>
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
