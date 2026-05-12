/**
 * CartContext — shared cart state across all screens.
 * Wraps cartService calls and keeps a single source of truth for
 * the cart so the tab badge, product detail, and cart screen
 * all stay in sync without prop drilling.
 */
import {
  createContext,
  useContext,
  useState,
  useCallback,
  useEffect,
  type ReactNode,
} from "react";
import { cartService } from "@/services/api/cartService";
import { useAuth } from "@/contexts/AuthContext";
import type { CartDTO } from "@/services/api/types";

type CartContextValue = {
  cart: CartDTO | null;
  itemCount: number;
  loading: boolean;
  addItem: (productId: number, quantity?: number) => Promise<void>;
  increment: (productId: number) => Promise<void>;
  decrement: (productId: number) => Promise<void>;
  removeItem: (productId: number) => Promise<void>;
  refresh: () => Promise<void>;
};

const CartContext = createContext<CartContextValue | undefined>(undefined);

export function CartProvider({ children }: { children: ReactNode }) {
  const { isAuthenticated } = useAuth();
  const [cart, setCart] = useState<CartDTO | null>(null);
  const [loading, setLoading] = useState(false);

  const refresh = useCallback(async () => {
    if (!isAuthenticated) return;
    try {
      const data = await cartService.getMyCart();
      setCart(data);
    } catch {
      // non-critical
    }
  }, [isAuthenticated]);

  // Load cart when user logs in
  useEffect(() => {
    if (isAuthenticated) refresh();
    else setCart(null);
  }, [isAuthenticated, refresh]);

  const addItem = useCallback(async (productId: number, quantity = 1) => {
    setLoading(true);
    try {
      const updated = await cartService.addItem(productId, quantity);
      setCart(updated);
    } finally {
      setLoading(false);
    }
  }, []);

  const increment = useCallback(async (productId: number) => {
    try {
      const updated = await cartService.incrementItem(productId);
      setCart(updated);
    } catch { await refresh(); }
  }, [refresh]);

  const decrement = useCallback(async (productId: number) => {
    try {
      const updated = await cartService.decrementItem(productId);
      setCart(updated);
    } catch { await refresh(); }
  }, [refresh]);

  const removeItem = useCallback(async (productId: number) => {
    if (!cart?.cartId) return;
    try {
      await cartService.removeItem(cart.cartId, productId);
      setCart((prev) =>
        prev
          ? {
              ...prev,
              products: prev.products.filter((p) => p.productId !== productId),
              totalPrice: prev.products
                .filter((p) => p.productId !== productId)
                .reduce((sum, p) => sum + p.specialPrice, 0),
            }
          : prev
      );
    } catch { await refresh(); }
  }, [cart, refresh]);

  const itemCount = cart?.products?.length ?? 0;

  return (
    <CartContext.Provider value={{ cart, itemCount, loading, addItem, increment, decrement, removeItem, refresh }}>
      {children}
    </CartContext.Provider>
  );
}

export function useCart(): CartContextValue {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error("useCart must be used inside <CartProvider>");
  return ctx;
}
