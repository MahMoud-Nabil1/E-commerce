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
    // Backend sets the HttpOnly cookie automatically in the response
    const data = await apiClient.login(username, password);
    // Build the user object from the login response
    setUser({
      id: data.id,
      username: data.username,
      email: data.email,
      roles: data.roles,
    });
    // Fetch cart count after login
    try {
      const cart = await apiClient.getCart();
      setCartCount(cart.products?.length ?? 0);
    } catch {
      setCartCount(0);
    }
  };

  const register = async (username: string, email: string, password: string, role = 'user') => {
    await apiClient.signup(username, email, password, new Set([role]));
    // Registration doesn't log in — user must sign in separately
  };

  const logout = async () => {
    try {
      await apiClient.signout();
    } finally {
      setUser(null);
      setCartCount(0);
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
