import { useState, useEffect, useRef } from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import './Navbar.css';

interface NavItem {
  label: string;
  path: string;
}

const navItems: NavItem[] = [
  { label: 'Products', path: '/products' },
  { label: 'Categories', path: '/categories' },
  { label: 'Deals', path: '/deals' },
  { label: 'Support', path: '/support' },
];

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const searchInputRef = useRef<HTMLInputElement>(null);
  const location = useLocation();

  // Track scroll position to apply elevated navbar style
  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 8);
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Close mobile menu on route change
  useEffect(() => {
    setMobileMenuOpen(false);
    setSearchOpen(false);
  }, [location.pathname]);

  // Focus search input when opened
  useEffect(() => {
    if (searchOpen && searchInputRef.current) {
      searchInputRef.current.focus();
    }
  }, [searchOpen]);

  // Close search on Escape
  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setSearchOpen(false);
        setMobileMenuOpen(false);
      }
    };
    document.addEventListener('keydown', handleKey);
    return () => document.removeEventListener('keydown', handleKey);
  }, []);

  // Prevent body scroll when mobile menu is open
  useEffect(() => {
    document.body.style.overflow = mobileMenuOpen ? 'hidden' : '';
    return () => { document.body.style.overflow = ''; };
  }, [mobileMenuOpen]);

  return (
    <>
      <nav
        id="main-navbar"
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

          {/* Desktop Nav Links */}
          <ul className="navbar__links" role="menubar">
            {navItems.map((item) => (
              <li key={item.path} role="none">
                <NavLink
                  to={item.path}
                  role="menuitem"
                  className={({ isActive }) =>
                    `navbar__link ${isActive ? 'navbar__link--active' : ''}`
                  }
                >
                  {item.label}
                </NavLink>
              </li>
            ))}
          </ul>

          {/* Right Actions */}
          <div className="navbar__actions">
            {/* Search Bar (Desktop) */}
            <div className={`navbar__search ${searchOpen ? 'navbar__search--expanded' : ''}`}>
              <button
                type="button"
                className="navbar__search-toggle"
                onClick={() => setSearchOpen(!searchOpen)}
                aria-label="Toggle search"
                aria-expanded={searchOpen}
              >
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                  <circle cx="11" cy="11" r="8" />
                  <path d="m21 21-4.35-4.35" />
                </svg>
              </button>
              <div className="navbar__search-field">
                <input
                  ref={searchInputRef}
                  type="search"
                  id="navbar-search"
                  className="navbar__search-input"
                  placeholder="Search inventory..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  aria-label="Search inventory"
                />
              </div>
            </div>

            {/* Desktop Always-visible Search */}
            <div className="navbar__search-desktop">
              <svg className="navbar__search-desktop-icon" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                <circle cx="11" cy="11" r="8" />
                <path d="m21 21-4.35-4.35" />
              </svg>
              <input
                type="search"
                id="navbar-search-desktop"
                className="navbar__search-desktop-input"
                placeholder="Search inventory..."
                aria-label="Search inventory"
              />
            </div>

            {/* Cart */}
            <button type="button" className="navbar__icon-btn" id="navbar-cart-btn" aria-label="Shopping cart">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                <circle cx="8" cy="21" r="1" />
                <circle cx="19" cy="21" r="1" />
                <path d="M2.05 2.05h2l2.66 12.42a2 2 0 0 0 2 1.58h9.78a2 2 0 0 0 1.95-1.57l1.65-7.43H5.12" />
              </svg>
              <span className="navbar__badge" aria-label="3 items in cart">3</span>
            </button>

            {/* Notifications */}
            <button type="button" className="navbar__icon-btn" id="navbar-notifications-btn" aria-label="Notifications">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                <path d="M6 8a6 6 0 0 1 12 0c0 7 3 9 3 9H3s3-2 3-9" />
                <path d="M10.3 21a1.94 1.94 0 0 0 3.4 0" />
              </svg>
              <span className="navbar__dot" aria-hidden="true"></span>
            </button>

            {/* User Avatar */}
            <button type="button" className="navbar__avatar-btn" id="navbar-user-btn" aria-label="User account">
              <div className="navbar__avatar">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                  <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                  <circle cx="12" cy="7" r="4" />
                </svg>
              </div>
            </button>

            {/* Mobile Menu Toggle */}
            <button
              type="button"
              className={`navbar__hamburger ${mobileMenuOpen ? 'navbar__hamburger--active' : ''}`}
              id="navbar-mobile-toggle"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
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

      {/* Mobile Menu Overlay */}
      <div
        className={`navbar__overlay ${mobileMenuOpen ? 'navbar__overlay--visible' : ''}`}
        onClick={() => setMobileMenuOpen(false)}
        aria-hidden="true"
      />

      {/* Mobile Menu Drawer */}
      <aside
        id="navbar-mobile-menu"
        className={`navbar__mobile-menu ${mobileMenuOpen ? 'navbar__mobile-menu--open' : ''}`}
        role="dialog"
        aria-modal="true"
        aria-label="Mobile navigation"
      >
        {/* Mobile Search */}
        <div className="navbar__mobile-search">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            <circle cx="11" cy="11" r="8" />
            <path d="m21 21-4.35-4.35" />
          </svg>
          <input
            type="search"
            className="navbar__mobile-search-input"
            placeholder="Search inventory..."
            aria-label="Search inventory"
          />
        </div>

        {/* Mobile Nav Links */}
        <ul className="navbar__mobile-links">
          {navItems.map((item) => (
            <li key={item.path}>
              <NavLink
                to={item.path}
                className={({ isActive }) =>
                  `navbar__mobile-link ${isActive ? 'navbar__mobile-link--active' : ''}`
                }
              >
                {item.label}
              </NavLink>
            </li>
          ))}
        </ul>

        {/* Mobile Actions */}
        <div className="navbar__mobile-actions">
          <NavLink to="/cart" className="navbar__mobile-action">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <circle cx="8" cy="21" r="1" />
              <circle cx="19" cy="21" r="1" />
              <path d="M2.05 2.05h2l2.66 12.42a2 2 0 0 0 2 1.58h9.78a2 2 0 0 0 1.95-1.57l1.65-7.43H5.12" />
            </svg>
            <span>Cart</span>
            <span className="navbar__mobile-badge">3</span>
          </NavLink>
          <NavLink to="/notifications" className="navbar__mobile-action">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <path d="M6 8a6 6 0 0 1 12 0c0 7 3 9 3 9H3s3-2 3-9" />
              <path d="M10.3 21a1.94 1.94 0 0 0 3.4 0" />
            </svg>
            <span>Notifications</span>
          </NavLink>
          <NavLink to="/account" className="navbar__mobile-action">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
              <circle cx="12" cy="7" r="4" />
            </svg>
            <span>Account</span>
          </NavLink>
        </div>
      </aside>
    </>
  );
}
