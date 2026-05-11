import {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  type ReactNode,
} from "react";
import * as SecureStore from "expo-secure-store";
import { authService } from "@/services/api/authService";
import { cartService } from "@/services/api/cartService";
import { TOKEN_KEY } from "@/services/api/client";
import type { UserInfoResponse } from "@/services/api/types";

// ─── Types ────────────────────────────────────────────────────────────────────

type AuthUser = Omit<UserInfoResponse, "jwtToken">;

type AuthContextValue = {
  user: AuthUser | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  isAdmin: boolean;
  isSeller: boolean;
  isUser: boolean;
  cartCount: number;
  setCartCount: (n: number) => void;
  login: (username: string, password: string) => Promise<void>;
  register: (
    username: string,
    email: string,
    password: string,
    role?: string
  ) => Promise<void>;
  logout: () => Promise<void>;
  refreshUser: () => Promise<void>;
};

// ─── Context ──────────────────────────────────────────────────────────────────

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

// ─── Provider ─────────────────────────────────────────────────────────────────

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [cartCount, setCartCount] = useState(0);

  /**
   * Restores the session by calling /auth/user with the stored token.
   * The axios request interceptor in client.ts attaches the token automatically.
   */
  const refreshUser = useCallback(async () => {
    try {
      const token = await SecureStore.getItemAsync(TOKEN_KEY);
      if (!token) {
        setUser(null);
        return;
      }

      const { jwtToken: _, ...safeUser } = await authService.getUser();
      setUser(safeUser);

      // Refresh cart count — non-critical, swallow errors
      try {
        const cart = await cartService.getMyCart();
        setCartCount(cart.products?.length ?? 0);
      } catch {
        setCartCount(0);
      }
    } catch {
      // Token expired or invalid — clear everything
      await SecureStore.deleteItemAsync(TOKEN_KEY);
      setUser(null);
      setCartCount(0);
    }
  }, []);

  // Restore session on app launch
  useEffect(() => {
    refreshUser().finally(() => setIsLoading(false));
  }, [refreshUser]);

  const login = async (username: string, password: string) => {
    // The axios response interceptor in client.ts automatically extracts the
    // JWT from the Set-Cookie header and saves it to SecureStore — nothing
    // to do here manually.
    const { jwtToken: _, ...safeUser } = await authService.login({
      username,
      password,
    });
    setUser(safeUser);

    // Fetch cart count after login
    try {
      const cart = await cartService.getMyCart();
      setCartCount(cart.products?.length ?? 0);
    } catch {
      setCartCount(0);
    }
  };

  const register = async (
    username: string,
    email: string,
    password: string,
    role = "user"
  ) => {
    await authService.register({ username, email, password, role: [role] });
    // Registration doesn't log in — user must sign in separately
  };

  const logout = async () => {
    try {
      // Calling signout clears the server-side cookie. The response interceptor
      // detects the empty Set-Cookie and deletes the token from SecureStore.
      await authService.signout();
    } finally {
      // Belt-and-suspenders: always clear local state even if the API call fails
      await SecureStore.deleteItemAsync(TOKEN_KEY);
      setUser(null);
      setCartCount(0);
    }
  };

  // ─── Role helpers ──────────────────────────────────────────────────────────

  const isAdmin = !!user?.roles?.includes("ROLE_ADMIN");
  // A user with ROLE_ADMIN who also has ROLE_SELLER is treated as admin only
  const isSeller = !!user?.roles?.includes("ROLE_SELLER") && !isAdmin;
  const isUser = !!user && !isAdmin && !isSeller;

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

// ─── Hook ─────────────────────────────────────────────────────────────────────

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used inside <AuthProvider>");
  return ctx;
}
