import { apiClient } from "./client";
import type { ProductDTO, ProductResponse } from "./types";

type PaginationParams = {
  pageNumber?: number;
  pageSize?: number;
  sortBy?: string;
  sortOrder?: "asc" | "desc";
};

type ProductFilters = PaginationParams & {
  keyword?: string;
  category?: string;
};

function buildQuery(params: Record<string, string | number | undefined>): string {
  const q = new URLSearchParams();
  for (const [key, value] of Object.entries(params)) {
    if (value !== undefined && value !== "") q.set(key, String(value));
  }
  const str = q.toString();
  return str ? `?${str}` : "";
}

type ProductInput = Omit<ProductDTO, "productId" | "image" | "specialPrice"> & { categoryId?: number };

/**
 * Product endpoints.
 * Public reads, ADMIN + SELLER writes.
 * Base path: /api
 */
export const productService = {
  // ─── Public ────────────────────────────────────────────────────────────────

  /**
   * Lists all available products with optional keyword/category filters.
   * GET /api/public/products
   */
  getAll: (params: ProductFilters = {}) =>
    apiClient.get<ProductResponse>(`/public/products${buildQuery(params)}`),

  /**
   * Gets a single product by ID.
   * GET /api/public/products/{productId}
   */
  getById: (productId: number) =>
    apiClient.get<ProductDTO>(`/public/products/${productId}`),

  /**
   * Lists products in a specific category.
   * GET /api/public/categories/{categoryId}/products
   */
  getByCategory: (categoryId: number, params: PaginationParams = {}) =>
    apiClient.get<ProductResponse>(
      `/public/categories/${categoryId}/products${buildQuery(params)}`
    ),

  /**
   * Searches products by keyword.
   * GET /api/public/products/keyword/{keyword}
   */
  searchByKeyword: (keyword: string, params: PaginationParams = {}) =>
    apiClient.get<ProductResponse>(
      `/public/products/keyword/${encodeURIComponent(keyword)}${buildQuery(params)}`
    ),

  // ─── Admin ─────────────────────────────────────────────────────────────────

  /**
   * Lists ALL products in the system (including out-of-stock). Requires ROLE_ADMIN.
   * GET /api/admin/products
   */
  getAllAdmin: (params: PaginationParams = {}) =>
    apiClient.get<ProductResponse>(`/admin/products${buildQuery(params)}`),

  /**
   * Creates a product under a category. Requires ROLE_ADMIN.
   * POST /api/admin/categories/{categoryId}/product
   */
  createAdmin: (categoryId: number, data: ProductInput) =>
    apiClient.post<ProductDTO>(`/admin/categories/${categoryId}/product`, data),

  /**
   * Updates a product. Requires ROLE_ADMIN.
   * PUT /api/admin/products/{productId}
   */
  updateAdmin: (productId: number, data: ProductInput) =>
    apiClient.put<ProductDTO>(`/admin/products/${productId}`, data),

  /**
   * Deletes a product. Requires ROLE_ADMIN.
   * DELETE /api/admin/products/{productId}
   */
  deleteAdmin: (productId: number) =>
    apiClient.delete<ProductDTO>(`/admin/products/${productId}`),

  /**
   * Uploads/replaces a product image. Requires ROLE_ADMIN.
   * PUT /api/admin/products/{productId}/image
   */
  uploadImageAdmin: (productId: number, imageFile: File | Blob, filename = "image.jpg") => {
    const formData = new FormData();
    formData.append("image", imageFile, filename);
    return apiClient.upload<ProductDTO>(`/admin/products/${productId}/image`, formData);
  },

  // ─── Seller ────────────────────────────────────────────────────────────────

  /**
   * Lists only the logged-in seller's products. Requires ROLE_SELLER.
   * GET /api/seller/products
   */
  getAllSeller: (params: PaginationParams = {}) =>
    apiClient.get<ProductResponse>(`/seller/products${buildQuery(params)}`),

  /**
   * Creates a product under a category. Requires ROLE_SELLER.
   * POST /api/seller/categories/{categoryId}/product
   */
  createSeller: (categoryId: number, data: ProductInput) =>
    apiClient.post<ProductDTO>(`/seller/categories/${categoryId}/product`, data),

  /**
   * Updates the seller's own product. Requires ROLE_SELLER.
   * PUT /api/seller/products/{productId}
   */
  updateSeller: (productId: number, data: ProductInput) =>
    apiClient.put<ProductDTO>(`/seller/products/${productId}`, data),

  /**
   * Deletes the seller's own product. Requires ROLE_SELLER.
   * DELETE /api/seller/products/{productId}
   */
  deleteSeller: (productId: number) =>
    apiClient.delete<ProductDTO>(`/seller/products/${productId}`),

  /**
   * Uploads/replaces a product image. Requires ROLE_SELLER.
   * PUT /api/seller/products/{productId}/image
   */
  uploadImageSeller: (productId: number, imageFile: File | Blob, filename = "image.jpg") => {
    const formData = new FormData();
    formData.append("image", imageFile, filename);
    return apiClient.upload<ProductDTO>(`/seller/products/${productId}/image`, formData);
  },
};
