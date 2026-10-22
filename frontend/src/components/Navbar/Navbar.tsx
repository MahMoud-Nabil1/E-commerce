import { useState, useEffect, useRef } from 'react';
import { NavLink, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';

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
        className={`fixed top-0 left-0 right-0 z-[1000] h-14 bg-white border-b border-outline-variant transition-all duration-250 ${scrolled ? 'bg-white/92 backdrop-blur-md shadow-md border-b-transparent' : ''}`}
        role="navigation"
        aria-label="Main navigation"
      >
        <div className="flex items-center gap-4 md:gap-8 h-full w-full px-4 sm:px-6 md:px-8">
          {/* Brand */}
          <NavLink to="/" className="group flex items-center gap-2.5 no-underline text-on-surface shrink-0 transition-opacity hover:opacity-85 hover:text-on-surface" aria-label="E-Commerce Home">
            <span className="flex items-center justify-center">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                <rect width="24" height="24" rx="4" fill="var(--color-primary-container)" />
                <path d="M7 8h10M7 12h7M7 16h10" stroke="var(--color-on-primary)" strokeWidth="1.8" strokeLinecap="round" />
              </svg>
            </span>
            <span className="font-sans text-lg font-extrabold tracking-tight text-primary-container whitespace-nowrap">E-Commerce</span>
          </NavLink>

          {/* Desktop nav links */}
          <ul className="hidden md:flex items-center gap-1 list-none m-0 p-0 h-full" role="menubar">
            {navItems.map((item) => (
              <li key={item.path} role="none">
                <NavLink
                  to={item.path}
                  role="menuitem"
                  className={({ isActive }) =>
                    `relative flex items-center h-full px-4 text-sm font-medium text-on-surface-variant no-underline whitespace-nowrap transition-colors hover:text-on-surface after:content-[''] after:absolute after:bottom-0 after:left-1/2 after:-translate-x-1/2 after:w-[calc(100%-2rem)] after:h-0.5 after:bg-primary-container after:rounded-t-sm after:transition-transform ${isActive ? 'text-on-surface font-semibold after:scale-x-100' : 'after:scale-x-0 hover:after:scale-x-50'}`
                  }
                >
                  {item.label}
                </NavLink>
              </li>
            ))}
          </ul>

          {/* Right actions */}
          <div className="flex items-center gap-1 ml-auto">
            {/* Desktop search */}
            <div className="relative hidden md:flex items-center">
              <svg className="absolute left-3 text-outline pointer-events-none" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                <circle cx="11" cy="11" r="8" /><path d="m21 21-4.35-4.35" />
              </svg>
              <input
                type="search"
                className="w-[220px] h-9 border border-outline-variant rounded-lg pl-9 pr-3 font-sans text-[13px] text-on-surface bg-surface-low outline-none transition-all focus:border-secondary focus:w-[280px] focus:ring-[3px] focus:ring-secondary/[0.08] placeholder:text-outline"
                placeholder="Search inventory..."
                aria-label="Search inventory"
              />
            </div>

            {/* Cart */}
            <NavLink to="/cart" className="relative flex items-center justify-center w-9 h-9 rounded-lg bg-transparent text-on-surface-variant border-none cursor-pointer hover:bg-surface-container hover:text-on-surface hover:-translate-y-px transition-all" aria-label={`Shopping cart${cartCount > 0 ? `, ${cartCount} items` : ''}`}>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                <circle cx="8" cy="21" r="1" /><circle cx="19" cy="21" r="1" />
                <path d="M2.05 2.05h2l2.66 12.42a2 2 0 0 0 2 1.58h9.78a2 2 0 0 0 1.95-1.57l1.65-7.43H5.12" />
              </svg>
              {cartCount > 0 && (
                <span className="absolute top-1 right-0.5 min-w-[16px] h-4 bg-secondary text-on-secondary text-[10px] font-bold leading-4 text-center rounded-full px-1 pointer-events-none animate-[badge-pop_0.3s_ease]" aria-hidden="true">
                  {cartCount > 9 ? '9+' : cartCount}
                </span>
              )}
            </NavLink>

            {/* User — authenticated */}
            {isAuthenticated ? (
              <div className="relative hidden md:block" ref={userMenuRef}>
                <button
                  type="button"
                  className="flex items-center justify-center w-9 h-9 border-none bg-transparent cursor-pointer p-0 rounded-full transition-transform hover:scale-105"
                  onClick={() => setUserMenuOpen((o) => !o)}
                  aria-label="User menu"
                  aria-expanded={userMenuOpen}
                  aria-haspopup="menu"
                >
                  <div className="w-8 h-8 rounded-full bg-secondary text-on-secondary text-xs font-extrabold tracking-wide border-transparent border-2 flex items-center justify-center overflow-hidden transition-colors">
                    {initials}
                  </div>
                </button>

                {userMenuOpen && (
                  <div className="absolute top-[calc(100%+10px)] right-0 min-w-[220px] bg-white border border-outline-variant rounded-[14px] shadow-xl overflow-hidden z-[200] animate-[dropdown-in_0.15s_ease-out]" role="menu" aria-label="User menu">
                    <div className="px-4 pt-3.5 pb-3">
                      <p className="text-[0.9rem] font-bold text-on-surface">{user?.username}</p>
                      <p className="text-[0.78rem] text-on-surface-variant mt-0.5">{user?.email}</p>
                    </div>
                    <div className="h-px bg-outline-variant" />
                    <NavLink to="/profile" className="flex items-center gap-2.5 w-full px-4 py-[11px] font-sans text-sm font-medium text-on-surface no-underline bg-transparent border-none cursor-pointer hover:bg-surface-container transition-colors text-left" role="menuitem">
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                        <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                        <circle cx="12" cy="7" r="4" />
                      </svg>
                      Profile
                    </NavLink>
                    <NavLink to="/cart" className="flex items-center gap-2.5 w-full px-4 py-[11px] font-sans text-sm font-medium text-on-surface no-underline bg-transparent border-none cursor-pointer hover:bg-surface-container transition-colors text-left" role="menuitem">
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                        <circle cx="8" cy="21" r="1" /><circle cx="19" cy="21" r="1" />
                        <path d="M2.05 2.05h2l2.66 12.42a2 2 0 0 0 2 1.58h9.78a2 2 0 0 0 1.95-1.57l1.65-7.43H5.12" />
                      </svg>
                      Cart
                      {cartCount > 0 && <span className="ml-auto min-w-[20px] h-5 bg-secondary text-on-secondary text-[0.7rem] font-bold rounded-full flex items-center justify-center px-1.5">{cartCount}</span>}
                    </NavLink>
                    <div className="h-px bg-outline-variant" />
                    <button
                      type="button"
                      className="flex items-center gap-2.5 w-full px-4 py-[11px] font-sans text-sm font-medium text-error bg-transparent border-none cursor-pointer hover:bg-error-container transition-colors text-left"
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
              <div className="hidden md:flex items-center gap-2">
                <NavLink to="/login" className="py-[7px] px-4 rounded-[10px] text-sm font-semibold no-underline text-on-surface-variant transition-colors hover:bg-surface-container hover:text-on-surface">Sign in</NavLink>
                <NavLink to="/register" className="bg-secondary text-on-secondary rounded-[10px] px-4 py-[7px] text-sm font-semibold no-underline hover:bg-secondary-container hover:text-on-secondary-container transition-colors">Register</NavLink>
              </div>
            )}

            {/* Mobile hamburger */}
            <button
              type="button"
              className="flex md:hidden flex-col justify-center items-center gap-[5px] w-9 h-9 border-none bg-transparent cursor-pointer rounded-lg p-0 transition-colors hover:bg-surface-container"
              onClick={() => setMobileMenuOpen((o) => !o)}
              aria-label={mobileMenuOpen ? 'Close menu' : 'Open menu'}
              aria-expanded={mobileMenuOpen}
              aria-controls="navbar-mobile-menu"
            >
              <span className={`block w-[18px] h-0.5 bg-on-surface rounded-sm transition-all origin-center ${mobileMenuOpen ? 'translate-y-[7px] rotate-45' : ''}`} />
              <span className={`block w-[18px] h-0.5 bg-on-surface rounded-sm transition-all origin-center ${mobileMenuOpen ? 'opacity-0' : ''}`} />
              <span className={`block w-[18px] h-0.5 bg-on-surface rounded-sm transition-all origin-center ${mobileMenuOpen ? '-translate-y-[7px] -rotate-45' : ''}`} />
            </button>
          </div>
        </div>
      </nav>

      {/* Mobile overlay */}
      <div
        className={`fixed inset-0 z-[998] bg-[rgba(11,28,48,0.4)] backdrop-blur-sm transition-opacity duration-250 ${mobileMenuOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'}`}
        onClick={() => setMobileMenuOpen(false)}
        aria-hidden="true"
      />

      {/* Mobile drawer */}
      <aside
        id="navbar-mobile-menu"
        className={`fixed top-0 right-0 z-[999] w-[300px] max-w-[85vw] h-screen bg-white shadow-xl transition-transform duration-250 flex flex-col pt-[72px] px-6 pb-6 overflow-y-auto ${mobileMenuOpen ? 'translate-x-0' : 'translate-x-full'}`}
        role="dialog"
        aria-modal="true"
        aria-label="Mobile navigation"
      >
        {/* Mobile search */}
        <div className="flex items-center gap-2.5 px-3.5 py-2.5 bg-surface-low border border-outline-variant rounded-lg mb-6 text-outline transition-colors focus-within:border-secondary">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            <circle cx="11" cy="11" r="8" /><path d="m21 21-4.35-4.35" />
          </svg>
          <input type="search" className="flex-1 border-none bg-transparent font-sans text-sm text-on-surface outline-none placeholder:text-outline" placeholder="Search inventory..." aria-label="Search inventory" />
        </div>

        {/* Mobile nav links */}
        <ul className="list-none flex flex-col gap-0.5 m-0 mb-6 p-0">
          {navItems.map((item) => (
            <li key={item.path}>
              <NavLink
                to={item.path}
                className={({ isActive }) =>
                  `flex items-center px-4 py-3 text-[15px] font-medium no-underline rounded-lg transition-colors ${isActive ? 'bg-surface-high text-primary-container font-bold' : 'text-on-surface-variant hover:bg-surface-container hover:text-on-surface'}`
                }
              >
                {item.label}
              </NavLink>
            </li>
          ))}
        </ul>

        {/* Mobile actions */}
        <div className="flex flex-col gap-0.5 border-t border-outline-variant pt-4 mt-auto">
          <NavLink to="/cart" className="flex items-center gap-3 px-4 py-3 text-sm font-medium text-on-surface-variant no-underline rounded-lg transition-colors hover:bg-surface-container hover:text-on-surface">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <circle cx="8" cy="21" r="1" /><circle cx="19" cy="21" r="1" />
              <path d="M2.05 2.05h2l2.66 12.42a2 2 0 0 0 2 1.58h9.78a2 2 0 0 0 1.95-1.57l1.65-7.43H5.12" />
            </svg>
            <span>Cart</span>
            {cartCount > 0 && <span className="ml-auto min-w-[20px] h-5 bg-secondary text-on-secondary text-[11px] font-bold leading-5 text-center rounded-full px-1.5">{cartCount}</span>}
          </NavLink>

          {isAuthenticated ? (
            <>
              <div className="flex items-center gap-3 px-4 py-3 rounded-lg bg-surface-container mb-1">
                <div className="w-9 h-9 rounded-full bg-secondary text-on-secondary text-[0.7rem] font-extrabold flex items-center justify-center border-2 border-transparent overflow-hidden">{initials}</div>
                <div>
                  <p className="text-[0.9rem] font-bold text-on-surface">{user?.username}</p>
                  <p className="text-[0.75rem] text-on-surface-variant">{user?.email}</p>
                </div>
              </div>
              <button type="button" className="flex items-center gap-3 px-4 py-3 text-sm font-medium text-error no-underline rounded-lg transition-colors hover:bg-error-container bg-transparent border-none cursor-pointer font-sans text-left" onClick={handleLogout}>
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
              <NavLink to="/login" className="flex items-center gap-3 px-4 py-3 text-sm font-medium text-on-surface-variant no-underline rounded-lg transition-colors hover:bg-surface-container hover:text-on-surface">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                  <path d="M15 3h4a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-4" />
                  <polyline points="10 17 15 12 10 7" />
                  <line x1="15" y1="12" x2="3" y2="12" />
                </svg>
                <span>Sign in</span>
              </NavLink>
              <NavLink to="/register" className="flex items-center gap-3 px-4 py-3 text-sm font-medium text-on-surface-variant no-underline rounded-lg transition-colors hover:bg-surface-container hover:text-on-surface">
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
