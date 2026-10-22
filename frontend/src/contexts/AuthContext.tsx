import {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  type ReactNode,
} from 'react';
import { apiClient } from '../lib/api';
import type { User } from '../types';

// ── Types ─────────────────────────────────────────────────────────────────────

interface AuthContextValue {
  user: User | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  isAdmin: boolean;
  isSeller: boolean;
  isUser: boolean;
  cartCount: number;
  setCartCount: (n: number) => void;
  login: (username: string, password: string) => Promise<void>;
  register: (username: string, email: string, password: string, role?: string) => Promise<void>;
  logout: () => Promise<void>;
  refreshUser: () => Promise<void>;
}

// ── Context ───────────────────────────────────────────────────────────────────

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [cartCount, setCartCount] = useState(0);

  // Try to restore session from the HttpOnly cookie on mount
  const refreshUser = useCallback(async () => {
    try {
      const userData = await apiClient.getUser();
      setUser(userData);
      // Refresh cart count while we're at it
      try {
        const cart = await apiClient.getCart();
        setCartCount(cart.products?.length ?? 0);
      } catch {
        // cart is non-critical
      }
    } catch {
      // No valid session — that's fine
      setUser(null);
      setCartCount(0);
    }
  }, []);

  useEffect(() => {
    refreshUser().finally(() => setIsLoading(false));
  }, [refreshUser]);

  const login = async (username: string, password: string) => {
    // If a user is already signed in, sign them out first so the old HttpOnly
    // cookie is cleared before the new one arrives. Without this, the browser
    // may keep sending the stale cookie on the immediate GET /api/auth/user
    // that follows, which makes it look like the old account is still active.
    if (user) {
      try {
        await apiClient.signout();
      } catch {
        // best-effort — carry on even if signout fails
      }
      setUser(null);
      setCartCount(0);
    }
    // Backend sets the HttpOnly cookie automatically in the response
    await apiClient.login(username, password);
    // Always fetch the full user from the server after login so roles are
    // guaranteed to be current — avoids stale-state issues when switching accounts.
    await refreshUser();
  };

  const register = async (username: string, email: string, password: string, role = 'user') => {
    await apiClient.signup(username, email, password, new Set([role]));
    // Registration doesn't log in — user must sign in separately
  };

  const logout = async () => {
    // Clear local state immediately so no stale user is visible during the request
    setUser(null);
    setCartCount(0);

    // Clean up local storage and session storage
    localStorage.removeItem('jwtToken');
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    sessionStorage.clear();

    // Expire non-HttpOnly client cookies on all paths if any exist
    document.cookie = 'ecommerce-cookie=; Path=/; Expires=Thu, 01 Jan 1970 00:00:01 GMT;';
    document.cookie = 'ecommerce-cookie=; Path=/api; Expires=Thu, 01 Jan 1970 00:00:01 GMT;';

    try {
      await apiClient.signout();
    } catch (err) {
      console.warn('Signout request failed on backend:', err);
    }
  };

  const isAdmin  = !!user?.roles?.includes('ROLE_ADMIN');
  // A user with ROLE_ADMIN who also has ROLE_SELLER is treated as admin only.
  const isSeller = !!user?.roles?.includes('ROLE_SELLER') && !isAdmin;
  const isUser   = !!user && !isAdmin && !isSeller;

  return (
    <AuthContext.Provider
      value={{
        user,
        isLoading,
        isAuthenticated: !!user,
        isAdmin,
        isSeller,
        isUser,
        cartCount,
        setCartCount,
        login,
        register,
        logout,
        refreshUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used inside <AuthProvider>');
  return ctx;
}
