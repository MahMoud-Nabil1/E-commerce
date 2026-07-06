import { axiosClient } from './axiosClient';
import type {
  User,
  UserProfile,
  UserProfileUpdate,
  LoginResponse,
  Product,
  ProductResponse,
  Cart,
  Category,
  CategoryResponse,
  Address,
  Order,
  OrderResponse,
} from '../types';

// ── API Client ────────────────────────────────────────────────────────────────
// Powered by axiosClient with request & response interceptors for secure JWT handling.

class ApiClient {
  // ── Auth ──────────────────────────────────────────────────────────────────

  /** POST /api/auth/login — sets HttpOnly JWT cookie, returns UserInfoResponse */
  async login(username: string, password: string): Promise<LoginResponse> {
    const res = await axiosClient.post<LoginResponse>('/api/auth/login', { username, password });
    if (res.data.jwtToken) {
      localStorage.setItem('jwtToken', res.data.jwtToken);
    }
    return res.data;
  }

  /** POST /api/auth/signup — registers a new user */
  async signup(
    username: string,
    email: string,
    password: string,
    role: Set<string> = new Set(['user']),
  ): Promise<{ message: string }> {
    const res = await axiosClient.post<{ message: string }>('/api/auth/signup', {
      username,
      email,
      password,
      role: Array.from(role),
    });
    return res.data;
  }

  /** POST /api/auth/signout — clears the JWT cookie and local token */
  async signout(): Promise<{ message: string }> {
    localStorage.removeItem('jwtToken');
    const res = await axiosClient.post<{ message: string }>('/api/auth/signout');
    return res.data;
  }

  /** GET /api/auth/user — returns current user details */
  async getUser(): Promise<User> {
    const res = await axiosClient.get<User>('/api/auth/user');
    return res.data;
  }

  // ── User Profile & Dashboard ──────────────────────────────────────────────

  /** GET /api/users/me — returns detailed user profile */
  async getUserProfile(): Promise<UserProfile> {
    const res = await axiosClient.get<UserProfile>('/api/users/me');
    return res.data;
  }

  /** PATCH /api/users/update-profile — updates name or phone */
  async updateUserProfile(data: UserProfileUpdate): Promise<UserProfile> {
    const res = await axiosClient.patch<UserProfile>('/api/users/update-profile', data);
    return res.data;
  }

  /** GET /api/orders/my-orders — returns logged-in user order list */
  async getMyOrders(): Promise<Order[]> {
    const res = await axiosClient.get<Order[]>('/api/orders/my-orders');
    return res.data;
  }

  /** GET /api/orders/{orderId}/details — returns full order breakdown */
  async getOrderDetails(orderId: number): Promise<Order> {
    const res = await axiosClient.get<Order>(`/api/orders/${orderId}/details`);
    return res.data;
  }

  // ── Cart ──────────────────────────────────────────────────────────────────

  async getCart(): Promise<Cart> {
    const res = await axiosClient.get<Cart>('/api/carts/users/cart');
    return res.data;
  }

  async addToCart(productId: number, quantity: number): Promise<Cart> {
    const res = await axiosClient.post<Cart>(`/api/carts/products/${productId}/quantity/${quantity}`);
    return res.data;
  }

  async updateCartItem(productId: number, operation: 'add' | 'delete'): Promise<Cart> {
    const res = await axiosClient.put<Cart>(`/api/cart/products/${productId}/quantity/${operation}`);
    return res.data;
  }

  async removeFromCart(cartId: number, productId: number): Promise<string> {
    const res = await axiosClient.delete<string>(`/api/carts/${cartId}/product/${productId}`);
    return res.data;
  }

  // ── User / Addresses ──────────────────────────────────────────────────────

  async getUserAddresses(): Promise<Address[]> {
    const res = await axiosClient.get<Address[]>('/api/users/addresses');
    return res.data;
  }

  async addAddress(address: Partial<Address>): Promise<Address> {
    const res = await axiosClient.post<Address>('/api/addresses', address);
    return res.data;
  }

  async deleteAddress(addressId: number): Promise<string> {
    const res = await axiosClient.delete<string>(`/api/addresses/${addressId}`);
    return res.data;
  }

  // ── Checkout / Orders ─────────────────────────────────────────────────────

  async placeOrder(addressId: number, paymentMethod: string, transactionId?: string): Promise<Order> {
    const res = await axiosClient.post<Order>('/api/orders/checkout', {
      addressId,
      paymentMethod,
      transactionId: transactionId || '',
    });
    return res.data;
  }

  // ── Admin: Categories ─────────────────────────────────────────────────────

  async adminGetCategories(page = 0, size = 20): Promise<CategoryResponse> {
    const res = await axiosClient.get<CategoryResponse>(`/api/public/categories?pageNumber=${page}&pageSize=${size}`);
    return res.data;
  }

  async adminCreateCategory(name: string): Promise<Category> {
    const res = await axiosClient.post<Category>('/api/admin/categories', { categoryName: name });
    return res.data;
  }

  async adminUpdateCategory(id: number, name: string): Promise<Category> {
    const res = await axiosClient.put<Category>(`/api/admin/categories/${id}`, { categoryName: name });
    return res.data;
  }

  async adminDeleteCategory(id: number): Promise<Category> {
    const res = await axiosClient.delete<Category>(`/api/admin/categories/${id}`);
    return res.data;
  }

  // ── Admin: Products ───────────────────────────────────────────────────────

  async adminGetProducts(page = 0, size = 20): Promise<ProductResponse> {
    const res = await axiosClient.get<ProductResponse>(`/api/admin/products?pageNumber=${page}&pageSize=${size}`);
    return res.data;
  }

  async adminAddProduct(categoryId: number, product: Omit<Product, 'productId'>): Promise<Product> {
    const res = await axiosClient.post<Product>(`/api/admin/categories/${categoryId}/product`, product);
    return res.data;
  }

  async adminUpdateProduct(productId: number, product: Partial<Product>): Promise<Product> {
    const res = await axiosClient.put<Product>(`/api/admin/products/${productId}`, product);
    return res.data;
  }

  async adminDeleteProduct(productId: number): Promise<Product> {
    const res = await axiosClient.delete<Product>(`/api/admin/products/${productId}`);
    return res.data;
  }

  // ── Admin: Orders ─────────────────────────────────────────────────────────

  async adminGetOrders(page = 0, size = 20): Promise<OrderResponse> {
    const res = await axiosClient.get<OrderResponse>(`/api/admin/orders?pageNumber=${page}&pageSize=${size}`);
    return res.data;
  }

  async adminUpdateOrderStatus(orderId: number, status: string): Promise<Order> {
    const res = await axiosClient.put<Order>(`/api/admin/orders/${orderId}/status`, { status });
    return res.data;
  }

  async adminApprovePayment(orderId: number): Promise<Order> {
    const res = await axiosClient.put<Order>(`/api/admin/orders/${orderId}/approve-payment`, {});
    return res.data;
  }

  // ── Admin: Sellers ────────────────────────────────────────────────────────

  async adminGetSellers(page = 0): Promise<{ content: User[]; totalElements: number }> {
    const res = await axiosClient.get<{ content: User[]; totalElements: number }>(`/api/auth/sellers?pageNumber=${page}`);
    return res.data;
  }

  // ── Seller: Products ──────────────────────────────────────────────────────

  async sellerGetProducts(page = 0, size = 20): Promise<ProductResponse> {
    const res = await axiosClient.get<ProductResponse>(`/api/seller/products?pageNumber=${page}&pageSize=${size}`);
    return res.data;
  }

  async sellerAddProduct(categoryId: number, product: Omit<Product, 'productId'>): Promise<Product> {
    const res = await axiosClient.post<Product>(`/api/seller/categories/${categoryId}/product`, product);
    return res.data;
  }

  async sellerUpdateProduct(productId: number, product: Partial<Product>): Promise<Product> {
    const res = await axiosClient.put<Product>(`/api/seller/products/${productId}`, product);
    return res.data;
  }

  async sellerDeleteProduct(productId: number): Promise<Product> {
    const res = await axiosClient.delete<Product>(`/api/seller/products/${productId}`);
    return res.data;
  }

  // ── Seller: Orders ────────────────────────────────────────────────────────

  async sellerGetOrders(page = 0, size = 20): Promise<OrderResponse> {
    const res = await axiosClient.get<OrderResponse>(`/api/seller/orders?pageNumber=${page}&pageSize=${size}`);
    return res.data;
  }

  async sellerUpdateOrderStatus(orderId: number, status: string): Promise<Order> {
    const res = await axiosClient.put<Order>(`/api/seller/orders/${orderId}/status`, { status });
    return res.data;
  }

  async sellerApprovePayment(orderId: number): Promise<Order> {
    const res = await axiosClient.put<Order>(`/api/seller/orders/${orderId}/approve-payment`, {});
    return res.data;
  }

  // ── Public: Categories & Products ─────────────────────────────────────────

  async getCategories(page = 0, size = 50): Promise<CategoryResponse> {
    const res = await axiosClient.get<CategoryResponse>(`/api/public/categories?pageNumber=${page}&pageSize=${size}`);
    return res.data;
  }

  async getProducts(params?: Record<string, string | number>): Promise<ProductResponse> {
    const res = await axiosClient.get<ProductResponse>('/api/public/products', { params });
    return res.data;
  }

  async getProductById(productId: number | string): Promise<Product> {
    const res = await axiosClient.get<Product>(`/api/public/products/${productId}`);
    return res.data;
  }

  async getProductsByCategory(categoryId: number | string, params?: Record<string, string | number>): Promise<ProductResponse> {
    const res = await axiosClient.get<ProductResponse>(`/api/public/categories/${categoryId}/products`, { params });
    return res.data;
  }

  async searchProducts(keyword: string, params?: Record<string, string | number>): Promise<ProductResponse> {
    const res = await axiosClient.get<ProductResponse>(`/api/public/products/keyword/${keyword}`, { params });
    return res.data;
  }
}

export const apiClient = new ApiClient();
