import { useState, useCallback, useRef } from "react";
import { productService } from "@/services/api/productService";
import type { ProductDTO } from "@/services/api/types";

type Params = {
  keyword?: string;
  category?: string;
  categoryId?: number;
  sortBy?: string;
  sortOrder?: "asc" | "desc";
  pageSize?: number;
};

/**
 * Infinite-scroll hook for products.
 * Supports keyword search, category filter (by name or ID), and sort.
 * Call `loadMore()` when the list end is reached.
 * Call `reset(newParams)` to start fresh with new filters.
 */
export function useInfiniteProducts(initialParams: Params = {}) {
  const [products, setProducts] = useState<ProductDTO[]>([]);
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const pageRef = useRef(0);
  const paramsRef = useRef<Params>(initialParams);
  const fetchingRef = useRef(false); // guard against concurrent fetches

  const fetchPage = useCallback(async (page: number, params: Params, append: boolean) => {
    if (fetchingRef.current) return;
    fetchingRef.current = true;
    setError(null);

    try {
      const shared = {
        pageNumber: page,
        pageSize: params.pageSize ?? 10,
        sortBy: params.sortBy ?? "productId",
        sortOrder: params.sortOrder ?? "asc",
      };

      let response;

      if (params.categoryId !== undefined) {
        // Products by category ID
        response = await productService.getByCategory(params.categoryId, shared);
      } else if (params.keyword) {
        // Keyword search
        response = await productService.searchByKeyword(params.keyword, shared);
      } else {
        // All products — optional category name filter
        response = await productService.getAll({
          ...shared,
          category: params.category,
        });
      }

      setProducts((prev) => (append ? [...prev, ...response.content] : response.content));
      setHasMore(!response.lastPage);
      pageRef.current = page;
    } catch (e: any) {
      setError(e?.message ?? "Failed to load products");
    } finally {
      fetchingRef.current = false;
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  /** Load the next page — no-op if already loading or no more pages. */
  const loadMore = useCallback(() => {
    if (fetchingRef.current || !hasMore) return;
    setLoading(true);
    fetchPage(pageRef.current + 1, paramsRef.current, true);
  }, [hasMore, fetchPage]);

  /** Pull-to-refresh — resets to page 0 with current params. */
  const refresh = useCallback(() => {
    setRefreshing(true);
    pageRef.current = 0;
    fetchPage(0, paramsRef.current, false);
  }, [fetchPage]);

  /** Apply new filters/sort and restart from page 0. */
  const reset = useCallback((newParams: Params) => {
    paramsRef.current = newParams;
    pageRef.current = 0;
    setProducts([]);
    setHasMore(true);
    setLoading(true);
    fetchPage(0, newParams, false);
  }, [fetchPage]);

  return { products, loading, refreshing, hasMore, error, loadMore, refresh, reset };
}
