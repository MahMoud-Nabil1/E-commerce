import { apiClient } from "./client";
import type {
  OrderDTO,
  OrderRequestDTO,
  OrderResponse,
  OrderStatusUpdateDTO,
  StripePaymentDTO,
} from "./types";

type PaginationParams = {
  pageNumber?: number;
  pageSize?: number;
  sortBy?: string;
  sortOrder?: "asc" | "desc";
};

function buildQuery(params: PaginationParams): string {
  const q = new URLSearchParams();
  if (params.pageNumber !== undefined) q.set("pageNumber", String(params.pageNumber));
  if (params.pageSize !== undefined) q.set("pageSize", String(params.pageSize));
  if (params.sortBy) q.set("sortBy", params.sortBy);
  if (params.sortOrder) q.set("sortOrder", params.sortOrder);
  const str = q.toString();
  return str ? `?${str}` : "";
}

/**
 * Order endpoints — all require authentication.
 * Base path: /api
 */
export const orderService = {
  /**
   * Creates a Stripe PaymentIntent and returns the clientSecret
   * needed to confirm payment on the client side.
   * POST /api/order/stripe-client-secret
   */
  createStripeClientSecret: (data: StripePaymentDTO) =>
    apiClient.post<string>("/order/stripe-client-secret", data),

  /**
   * Places an order from the user's current cart.
   * Deducts stock automatically.
   * POST /api/order/users/payments/{paymentMethod}
   *
   * @param paymentMethod - e.g. "stripe" or "cod"
   */
  placeOrder: (paymentMethod: string, data: OrderRequestDTO) =>
    apiClient.post<OrderDTO>(
      `/order/users/payments/${encodeURIComponent(paymentMethod)}`,
      data
    ),

  /**
   * Gets the logged-in user's order history.
   * GET /api/users/{username}/orders
   *
   * Note: the backend ignores the username path param and uses
   * the authenticated user's context instead.
   */
  getMyOrders: (username: string) =>
    apiClient.get<OrderDTO[]>(`/users/${encodeURIComponent(username)}/orders`),

  // ─── Admin ─────────────────────────────────────────────────────────────────

  /**
   * Lists all orders in the system. Requires ROLE_ADMIN.
   * GET /api/admin/orders
   */
  getAllAdmin: (params: PaginationParams = {}) =>
    apiClient.get<OrderResponse>(`/admin/orders${buildQuery(params)}`),

  /**
   * Updates an order's status. Requires ROLE_ADMIN.
   * PUT /api/admin/orders/{orderId}/status
   */
  updateStatusAdmin: (orderId: number, data: OrderStatusUpdateDTO) =>
    apiClient.put<OrderDTO>(`/admin/orders/${orderId}/status`, data),

  // ─── Seller ────────────────────────────────────────────────────────────────

  /**
   * Lists orders containing the logged-in seller's products. Requires ROLE_SELLER.
   * GET /api/seller/orders
   */
  getAllSeller: (params: PaginationParams = {}) =>
    apiClient.get<OrderResponse>(`/seller/orders${buildQuery(params)}`),

  /**
   * Seller updates an order's status. Requires ROLE_SELLER.
   * PUT /api/seller/orders/{orderId}/status
   */
  updateStatusSeller: (orderId: number, data: OrderStatusUpdateDTO) =>
    apiClient.put<OrderDTO>(`/seller/orders/${orderId}/status`, data),
};
