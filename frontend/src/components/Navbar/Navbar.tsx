import { useState, useEffect, useRef } from 'react';
import { NavLink, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import './Navbar.css';

interface NavItem {
  label: string;
  path: string;
}

const navItems: NavItem[] = [
  { label: 'Products', path: '/products' },
  { label: 'Categories', path: '/categories' },
  { label: 'Deals', path: '/deals' },
];

export default function Navbar() {
  const { user, isAuthenticated, logout, cartCount } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const [scrolled, setScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const userMenuRef = useRef<HTMLDivElement>(null);

  // Scroll shadow
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  // Close mobile menu on route change
  useEffect(() => {
    setMobileMenuOpen(false);
    setUserMenuOpen(false);
  }, [location.pathname]);

  // Close user dropdown on outside click
  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (userMenuRef.current && !userMenuRef.current.contains(e.target as Node)) {
        setUserMenuOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);

  // Close on Escape
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setMobileMenuOpen(false);
        setUserMenuOpen(false);
      }
    };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, []);

  // Lock body scroll when mobile menu open
  useEffect(() => {
    document.body.style.overflow = mobileMenuOpen ? 'hidden' : '';
    return () => { document.body.style.overflow = ''; };
  }, [mobileMenuOpen]);

  async function handleLogout() {
    setUserMenuOpen(false);
    await logout();
    navigate('/');
  }

  const initials = user?.username?.slice(0, 2).toUpperCase() ?? '';

  return (
    <>
      <nav
        className={`navbar ${scrolled ? 'navbar--scrolled' : ''}`}
        role="navigation"
        aria-label="Main navigation"
      >
        <div className="navbar__inner">
          {/* Brand */}
          <NavLink to="/" className="navbar__brand" aria-label="E-Commerce Home">
            <span className="navbar__brand-icon">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                <rect width="24" height="24" rx="4" fill="var(--primary-container)" />
                <path d="M7 8h10M7 12h7M7 16h10" stroke="var(--on-primary)" strokeWidth="1.8" strokeLinecap="round" />
              </svg>
            </span>
            <span className="navbar__brand-text">E-Commerce</span>
          </NavLink>

          {/* Desktop nav links */}
          <ul className="navbar__links" role="menubar">
            {navItems.map((item) => (
              <li key={item.path} role="none">
                <NavLink
                  to={item.path}
                  role="menuitem"
                  className={({ isActive }) => `navbar__link${isActive ? ' navbar__link--active' : ''}`}
                >
                  {item.label}
                </NavLink>
              </li>
            ))}
          </ul>

          {/* Right actions */}
          <div className="navbar__actions">
            {/* Desktop search */}
            <div className="navbar__search-desktop">
              <svg className="navbar__search-desktop-icon" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                <circle cx="11" cy="11" r="8" /><path d="m21 21-4.35-4.35" />
              </svg>
              <input
                type="search"
                className="navbar__search-desktop-input"
                placeholder="Search inventory..."
                aria-label="Search inventory"
              />
            </div>

            {/* Cart */}
            <NavLink to="/cart" className="navbar__icon-btn" aria-label={`Shopping cart${cartCount > 0 ? `, ${cartCount} items` : ''}`}>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                <circle cx="8" cy="21" r="1" /><circle cx="19" cy="21" r="1" />
                <path d="M2.05 2.05h2l2.66 12.42a2 2 0 0 0 2 1.58h9.78a2 2 0 0 0 1.95-1.57l1.65-7.43H5.12" />
              </svg>
              {cartCount > 0 && (
                <span className="navbar__badge" aria-hidden="true">
                  {cartCount > 9 ? '9+' : cartCount}
                </span>
              )}
            </NavLink>

            {/* User — authenticated */}
            {isAuthenticated ? (
              <div className="navbar__user-menu" ref={userMenuRef}>
                <button
                  type="button"
                  className="navbar__avatar-btn"
                  onClick={() => setUserMenuOpen((o) => !o)}
                  aria-label="User menu"
                  aria-expanded={userMenuOpen}
                  aria-haspopup="menu"
                >
                  <div className="navbar__avatar navbar__avatar--filled">
                    {initials}
                  </div>
                </button>

                {userMenuOpen && (
                  <div className="navbar__dropdown" role="menu" aria-label="User menu">
                    <div className="navbar__dropdown-header">
                      <p className="navbar__dropdown-name">{user?.username}</p>
                      <p className="navbar__dropdown-email">{user?.email}</p>
                    </div>
                    <div className="navbar__dropdown-divider" />
                    <NavLink to="/cart" className="navbar__dropdown-item" role="menuitem">
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                        <circle cx="8" cy="21" r="1" /><circle cx="19" cy="21" r="1" />
                        <path d="M2.05 2.05h2l2.66 12.42a2 2 0 0 0 2 1.58h9.78a2 2 0 0 0 1.95-1.57l1.65-7.43H5.12" />
                      </svg>
                      Cart
                      {cartCount > 0 && <span className="navbar__dropdown-badge">{cartCount}</span>}
                    </NavLink>
                    <div className="navbar__dropdown-divider" />
                    <button
                      type="button"
                      className="navbar__dropdown-item navbar__dropdown-item--danger"
                      role="menuitem"
                      onClick={handleLogout}
                    >
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                        <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
                        <polyline points="16 17 21 12 16 7" />
                        <line x1="21" y1="12" x2="9" y2="12" />
                      </svg>
                      Sign out
                    </button>
                  </div>
                )}
              </div>
            ) : (
              /* User — guest */
              <div className="navbar__auth-links">
                <NavLink to="/login" className="navbar__auth-link">Sign in</NavLink>
                <NavLink to="/register" className="navbar__auth-link navbar__auth-link--primary">Register</NavLink>
              </div>
            )}

            {/* Mobile hamburger */}
            <button
              type="button"
              className={`navbar__hamburger${mobileMenuOpen ? ' navbar__hamburger--active' : ''}`}
              onClick={() => setMobileMenuOpen((o) => !o)}
              aria-label={mobileMenuOpen ? 'Close menu' : 'Open menu'}
              aria-expanded={mobileMenuOpen}
              aria-controls="navbar-mobile-menu"
            >
              <span className="navbar__hamburger-line" />
              <span className="navbar__hamburger-line" />
              <span className="navbar__hamburger-line" />
            </button>
          </div>
        </div>
      </nav>

      {/* Mobile overlay */}
      <div
        className={`navbar__overlay${mobileMenuOpen ? ' navbar__overlay--visible' : ''}`}
        onClick={() => setMobileMenuOpen(false)}
        aria-hidden="true"
      />

      {/* Mobile drawer */}
      <aside
        id="navbar-mobile-menu"
        className={`navbar__mobile-menu${mobileMenuOpen ? ' navbar__mobile-menu--open' : ''}`}
        role="dialog"
        aria-modal="true"
        aria-label="Mobile navigation"
      >
        {/* Mobile search */}
        <div className="navbar__mobile-search">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            <circle cx="11" cy="11" r="8" /><path d="m21 21-4.35-4.35" />
          </svg>
          <input type="search" className="navbar__mobile-search-input" placeholder="Search inventory..." aria-label="Search inventory" />
        </div>

        {/* Mobile nav links */}
        <ul className="navbar__mobile-links">
          {navItems.map((item) => (
            <li key={item.path}>
              <NavLink
                to={item.path}
                className={({ isActive }) => `navbar__mobile-link${isActive ? ' navbar__mobile-link--active' : ''}`}
              >
                {item.label}
              </NavLink>
            </li>
          ))}
        </ul>

        {/* Mobile actions */}
        <div className="navbar__mobile-actions">
          <NavLink to="/cart" className="navbar__mobile-action">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <circle cx="8" cy="21" r="1" /><circle cx="19" cy="21" r="1" />
              <path d="M2.05 2.05h2l2.66 12.42a2 2 0 0 0 2 1.58h9.78a2 2 0 0 0 1.95-1.57l1.65-7.43H5.12" />
            </svg>
            <span>Cart</span>
            {cartCount > 0 && <span className="navbar__mobile-badge">{cartCount}</span>}
          </NavLink>

          {isAuthenticated ? (
            <>
              <div className="navbar__mobile-user">
                <div className="navbar__avatar navbar__avatar--filled navbar__avatar--sm">{initials}</div>
                <div>
                  <p className="navbar__mobile-username">{user?.username}</p>
                  <p className="navbar__mobile-email">{user?.email}</p>
                </div>
              </div>
              <button type="button" className="navbar__mobile-action navbar__mobile-action--danger" onClick={handleLogout}>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                  <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
                  <polyline points="16 17 21 12 16 7" />
                  <line x1="21" y1="12" x2="9" y2="12" />
                </svg>
                <span>Sign out</span>
              </button>
            </>
          ) : (
            <>
              <NavLink to="/login" className="navbar__mobile-action">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                  <path d="M15 3h4a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-4" />
                  <polyline points="10 17 15 12 10 7" />
                  <line x1="15" y1="12" x2="3" y2="12" />
                </svg>
                <span>Sign in</span>
              </NavLink>
              <NavLink to="/register" className="navbar__mobile-action">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                  <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                  <circle cx="12" cy="7" r="4" />
                </svg>
                <span>Register</span>
              </NavLink>
            </>
          )}
        </div>
      </aside>
    </>
  );
}
