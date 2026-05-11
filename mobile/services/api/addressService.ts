import { apiClient } from "./client";
import type { AddressDTO } from "./types";

/**
 * Address endpoints — all require authentication.
 * Base path: /api
 */
export const addressService = {
  /**
   * Creates a new address linked to the logged-in user.
   * POST /api/addresses
   */
  create: (data: Omit<AddressDTO, "addressId">) =>
    apiClient.post<AddressDTO>("/addresses", data),

  /**
   * Gets all addresses belonging to the logged-in user.
   * GET /api/users/addresses
   */
  getMyAddresses: () => apiClient.get<AddressDTO[]>("/users/addresses"),

  /**
   * Gets all addresses in the system.
   * GET /api/addresses
   */
  getAll: () => apiClient.get<AddressDTO[]>("/addresses"),

  /**
   * Gets a single address by ID.
   * GET /api/addresses/{addressId}
   */
  getById: (addressId: number) =>
    apiClient.get<AddressDTO>(`/addresses/${addressId}`),

  /**
   * Updates an existing address.
   * PUT /api/addresses/{addressId}
   */
  update: (addressId: number, data: Omit<AddressDTO, "addressId">) =>
    apiClient.put<AddressDTO>(`/addresses/${addressId}`, data),

  /**
   * Deletes an address by ID.
   * DELETE /api/addresses/{addressId}
   */
  delete: (addressId: number) =>
    apiClient.delete<string>(`/addresses/${addressId}`),
};
