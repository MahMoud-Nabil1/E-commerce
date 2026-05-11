import { apiClient } from "./client";
import type { CategoryDTO, CategoryResponse } from "./types";

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
 * Category endpoints.
 * Public reads, ADMIN writes.
 * Base path: /api
 */
export const categoryService = {
  /**
   * Lists all categories with pagination.
   * GET /api/public/categories
   */
  getAll: (params: PaginationParams = {}) =>
    apiClient.get<CategoryResponse>(`/public/categories${buildQuery(params)}`),

  /**
   * Creates a new category. Requires ROLE_ADMIN.
   * POST /api/admin/categories
   */
  create: (data: Pick<CategoryDTO, "categoryName">) =>
    apiClient.post<CategoryDTO>("/admin/categories", data),

  /**
   * Updates an existing category. Requires ROLE_ADMIN.
   * PUT /api/admin/categories/{categoryId}
   */
  update: (categoryId: number, data: Pick<CategoryDTO, "categoryName">) =>
    apiClient.put<CategoryDTO>(`/admin/categories/${categoryId}`, data),

  /**
   * Deletes a category. Requires ROLE_ADMIN.
   * DELETE /api/admin/categories/{categoryId}
   */
  delete: (categoryId: number) =>
    apiClient.delete<CategoryDTO>(`/admin/categories/${categoryId}`),
};
