import { apiClient } from "./client";
import type { CartDTO, CartItemDTO } from "./types";

/**
 * Cart endpoints — all require authentication.
 * Base path: /api
 */
export const cartService = {
  /**
   * Gets the logged-in user's cart.
   * Returns an empty CartDTO if the user has no cart yet.
   * GET /api/carts/users/cart
   */
  getMyCart: () => apiClient.get<CartDTO>("/carts/users/cart"),

  /**
   * Adds a product to the cart with the given quantity.
   * POST /api/carts/products/{productId}/quantity/{quantity}
   */
  addItem: (productId: number, quantity: number) =>
    apiClient.post<CartDTO>(`/carts/products/${productId}/quantity/${quantity}`),

  /**
   * Increments a cart item's quantity by 1.
   * PUT /api/cart/products/{productId}/quantity/add
   */
  incrementItem: (productId: number) =>
    apiClient.put<CartDTO>(`/cart/products/${productId}/quantity/add`),

  /**
   * Decrements a cart item's quantity by 1.
   * PUT /api/cart/products/{productId}/quantity/delete
   */
  decrementItem: (productId: number) =>
    apiClient.put<CartDTO>(`/cart/products/${productId}/quantity/delete`),

  /**
   * Removes a product entirely from the cart.
   * DELETE /api/carts/{cartId}/product/{productId}
   */
  removeItem: (cartId: number, productId: number) =>
    apiClient.delete<string>(`/carts/${cartId}/product/${productId}`),

  /**
   * Bulk sync — replaces the entire cart with the provided items.
   * Useful for syncing offline cart state on app launch.
   * POST /api/cart/create
   */
  syncCart: (items: CartItemDTO[]) =>
    apiClient.post<string>("/cart/create", items),

  /**
   * Lists all carts in the system. Admin diagnostic endpoint.
   * GET /api/carts
   */
  getAllCarts: () => apiClient.get<CartDTO[]>("/carts"),
};
