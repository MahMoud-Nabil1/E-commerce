/**
 * Single entry point for all API services.
 * Import from here instead of individual service files.
 *
 * @example
 * import { authService, productService } from "@/services/api";
 */

export { authService } from "./authService";
export { categoryService } from "./categoryService";
export { productService } from "./productService";
export { cartService } from "./cartService";
export { addressService } from "./addressService";
export { orderService } from "./orderService";

export type { ApiError } from "./client";
export * from "./types";
