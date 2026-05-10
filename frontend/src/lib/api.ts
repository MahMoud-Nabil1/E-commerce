// ── Types ────────────────────────────────────────────────────────────────────

export interface User {
  id: number;
  username: string;
  email: string;
  roles: string[];
}

// Response from POST /api/auth/login  (UserInfoResponse from backend)
export interface LoginResponse {
  id: number;
  username: string;
  email: string;
  roles: string[];
  jwtToken?: string; // may be null when using cookie transport
}

export interface Product {
  productId: number;
  productName: string;
  description: string;
  image?: string;
  quantity: number;
  price: number;
  discount: number;
  specialPrice: number;
  seller?: { userId: number; username: string };
}

export interface ProductResponse {
  content: Product[];
  pageNumber: number;
  pageSize: number;
  totalElements: number;
  totalPages: number;
  lastPage: boolean;
}

export interface CartProduct {
  productId: number;
  productName: string;
  image?: string;
  description: string;
  quantity: number;  // quantity in cart
  price: number;
  discount: number;
  specialPrice: number;
}

export interface Cart {
  cartId: number;
  totalPrice: number;
  products: CartProduct[];
}

export interface Category {
  categoryId: number;
  categoryName: string;
}

export interface CategoryResponse {
  content: Category[];
  pageNumber: number;
  pageSize: number;
  totalElements: number;
  totalPages: number;
  lastPage: boolean;
}

export interface OrderItem {
  orderItemId: number;
  productId: number;
  productName: string;
  image?: string;
  quantity: number;
  discount: number;
  orderedProductPrice: number;
}

export interface Order {
  orderId: number;
  email: string;
  orderItems: OrderItem[];
  orderDate: string;
  payment?: { paymentMethod: string };
  totalAmount: number;
  orderStatus: string;
  addressId?: number;
}

export interface OrderResponse {
  content: Order[];
  pageNumber: number;
  pageSize: number;
  totalElements: number;
  totalPages: number;
  lastPage: boolean;
}

// ── API Client ────────────────────────────────────────────────────────────────
// Auth uses HttpOnly cookies set by the backend — no localStorage token needed.
// All requests go through Vite's /api proxy → http://localhost:8080/api

class ApiClient {
  private getHeaders(): HeadersInit {
    return { 'Content-Type': 'application/json' };
  }

  private async handle<T>(res: Response): Promise<T> {
    if (!res.ok) {
      let message = `HTTP ${res.status}`;
      try {
        const body = await res.json();
        if (body.message) {
          message = body.message;
        } else if (body.error) {
          message = body.error;
        } else if (typeof body === 'object' && body !== null) {
          // Validation error map: { fieldName: "error message", ... }
          const entries = Object.entries(body as Record<string, string>);
          if (entries.length > 0) {
            message = entries.map(([field, msg]) => `${field}: ${msg}`).join(' | ');
          }
        }
      } catch { /* ignore parse errors */ }
      throw new Error(message);
    }
    // 204 No Content — return empty object
    const text = await res.text();
    return (text ? JSON.parse(text) : {}) as T;
  }

  // ── Auth ──────────────────────────────────────────────────────────────────

  /** POST /api/auth/login — sets HttpOnly JWT cookie, returns UserInfoResponse */
  async login(username: string, password: string): Promise<LoginResponse> {
    const res = await fetch('/api/auth/login', {
      method: 'POST',
      headers: this.getHeaders(),
      credentials: 'include', // send & receive cookies
      body: JSON.stringify({ username, password }),
    });
    return this.handle<LoginResponse>(res);
  }

  /** POST /api/auth/signup — registers a new user */
  async signup(
    username: string,
    email: string,
    password: string,
    role: Set<string> = new Set(['user']),
  ): Promise<{ message: string }> {
    const res = await fetch('/api/auth/signup', {
      method: 'POST',
      headers: this.getHeaders(),
      body: JSON.stringify({ username, email, password, role: Array.from(role) }),
    });
    return this.handle<{ message: string }>(res);
  }

  /** POST /api/auth/signout — clears the JWT cookie */
  async signout(): Promise<{ message: string }> {
    const res = await fetch('/api/auth/signout', {
      method: 'POST',
      headers: this.getHeaders(),
      credentials: 'include',
    });
    return this.handle<{ message: string }>(res);
  }

  /** GET /api/auth/user — returns current user details (requires valid cookie) */
  async getUser(): Promise<User> {
    const res = await fetch('/api/auth/user', {
      headers: this.getHeaders(),
      credentials: 'include',
    });
    return this.handle<User>(res);
  }

  // ── Cart ──────────────────────────────────────────────────────────────────

  async getCart(): Promise<Cart> {
    const res = await fetch('/api/carts/users/cart', {
      headers: this.getHeaders(),
      credentials: 'include',
    });
    return this.handle<Cart>(res);
  }

  async addToCart(productId: number, quantity: number): Promise<Cart> {
    const res = await fetch(`/api/carts/products/${productId}/quantity/${quantity}`, {
      method: 'POST',
      headers: this.getHeaders(),
      credentials: 'include',
    });
    return this.handle<Cart>(res);
  }

  async updateCartItem(productId: number, operation: 'add' | 'delete'): Promise<Cart> {
    const res = await fetch(`/api/cart/products/${productId}/quantity/${operation}`, {
      method: 'PUT',
      headers: this.getHeaders(),
      credentials: 'include',
    });
    return this.handle<Cart>(res);
  }

  async removeFromCart(cartId: number, productId: number): Promise<string> {
    const res = await fetch(`/api/carts/${cartId}/product/${productId}`, {
      method: 'DELETE',
      headers: this.getHeaders(),
      credentials: 'include',
    });
    return this.handle<string>(res);
  }

  // ── Admin: Categories ─────────────────────────────────────────────────────

  async adminGetCategories(page = 0, size = 20): Promise<CategoryResponse> {
    const res = await fetch(`/api/public/categories?pageNumber=${page}&pageSize=${size}`, {
      headers: this.getHeaders(),
      credentials: 'include',
    });
    return this.handle<CategoryResponse>(res);
  }

  async adminCreateCategory(name: string): Promise<Category> {
    const res = await fetch('/api/admin/categories', {
      method: 'POST',
      headers: this.getHeaders(),
      credentials: 'include',
      body: JSON.stringify({ categoryName: name }),
    });
    return this.handle<Category>(res);
  }

  async adminUpdateCategory(id: number, name: string): Promise<Category> {
    const res = await fetch(`/api/admin/categories/${id}`, {
      method: 'PUT',
      headers: this.getHeaders(),
      credentials: 'include',
      body: JSON.stringify({ categoryName: name }),
    });
    return this.handle<Category>(res);
  }

  async adminDeleteCategory(id: number): Promise<Category> {
    const res = await fetch(`/api/admin/categories/${id}`, {
      method: 'DELETE',
      headers: this.getHeaders(),
      credentials: 'include',
    });
    return this.handle<Category>(res);
  }

  // ── Admin: Products ───────────────────────────────────────────────────────

  async adminGetProducts(page = 0, size = 20): Promise<ProductResponse> {
    const res = await fetch(`/api/admin/products?pageNumber=${page}&pageSize=${size}`, {
      headers: this.getHeaders(),
      credentials: 'include',
    });
    return this.handle<ProductResponse>(res);
  }

  async adminAddProduct(categoryId: number, product: Omit<Product, 'productId'>): Promise<Product> {
    const res = await fetch(`/api/admin/categories/${categoryId}/product`, {
      method: 'POST',
      headers: this.getHeaders(),
      credentials: 'include',
      body: JSON.stringify(product),
    });
    return this.handle<Product>(res);
  }

  async adminUpdateProduct(productId: number, product: Partial<Product>): Promise<Product> {
    const res = await fetch(`/api/admin/products/${productId}`, {
      method: 'PUT',
      headers: this.getHeaders(),
      credentials: 'include',
      body: JSON.stringify(product),
    });
    return this.handle<Product>(res);
  }

  async adminDeleteProduct(productId: number): Promise<Product> {
    const res = await fetch(`/api/admin/products/${productId}`, {
      method: 'DELETE',
      headers: this.getHeaders(),
      credentials: 'include',
    });
    return this.handle<Product>(res);
  }

  // ── Admin: Orders ─────────────────────────────────────────────────────────

  async adminGetOrders(page = 0, size = 20): Promise<OrderResponse> {
    const res = await fetch(`/api/admin/orders?pageNumber=${page}&pageSize=${size}`, {
      headers: this.getHeaders(),
      credentials: 'include',
    });
    return this.handle<OrderResponse>(res);
  }

  async adminUpdateOrderStatus(orderId: number, status: string): Promise<Order> {
    const res = await fetch(`/api/admin/orders/${orderId}/status`, {
      method: 'PUT',
      headers: this.getHeaders(),
      credentials: 'include',
      body: JSON.stringify({ status }),
    });
    return this.handle<Order>(res);
  }

  // ── Admin: Sellers ────────────────────────────────────────────────────────

  async adminGetSellers(page = 0): Promise<{ content: User[]; totalElements: number }> {
    const res = await fetch(`/api/auth/sellers?pageNumber=${page}`, {
      headers: this.getHeaders(),
      credentials: 'include',
    });
    return this.handle<{ content: User[]; totalElements: number }>(res);
  }

  // ── Seller: Products ──────────────────────────────────────────────────────

  async sellerGetProducts(page = 0, size = 20): Promise<ProductResponse> {
    const res = await fetch(`/api/seller/products?pageNumber=${page}&pageSize=${size}`, {
      headers: this.getHeaders(),
      credentials: 'include',
    });
    return this.handle<ProductResponse>(res);
  }

  async sellerAddProduct(categoryId: number, product: Omit<Product, 'productId'>): Promise<Product> {
    const res = await fetch(`/api/seller/categories/${categoryId}/product`, {
      method: 'POST',
      headers: this.getHeaders(),
      credentials: 'include',
      body: JSON.stringify(product),
    });
    return this.handle<Product>(res);
  }

  async sellerUpdateProduct(productId: number, product: Partial<Product>): Promise<Product> {
    const res = await fetch(`/api/seller/products/${productId}`, {
      method: 'PUT',
      headers: this.getHeaders(),
      credentials: 'include',
      body: JSON.stringify(product),
    });
    return this.handle<Product>(res);
  }

  async sellerDeleteProduct(productId: number): Promise<Product> {
    const res = await fetch(`/api/seller/products/${productId}`, {
      method: 'DELETE',
      headers: this.getHeaders(),
      credentials: 'include',
    });
    return this.handle<Product>(res);
  }

  // ── Seller: Orders ────────────────────────────────────────────────────────

  async sellerGetOrders(page = 0, size = 20): Promise<OrderResponse> {
    const res = await fetch(`/api/seller/orders?pageNumber=${page}&pageSize=${size}`, {
      headers: this.getHeaders(),
      credentials: 'include',
    });
    return this.handle<OrderResponse>(res);
  }

  async sellerUpdateOrderStatus(orderId: number, status: string): Promise<Order> {
    const res = await fetch(`/api/seller/orders/${orderId}/status`, {
      method: 'PUT',
      headers: this.getHeaders(),
      credentials: 'include',
      body: JSON.stringify({ status }),
    });
    return this.handle<Order>(res);
  }

  // ── Public: Categories ────────────────────────────────────────────────────

  async getCategories(page = 0, size = 50): Promise<CategoryResponse> {
    const res = await fetch(`/api/public/categories?pageNumber=${page}&pageSize=${size}`, {
      headers: this.getHeaders(),
      credentials: 'include',
    });
    return this.handle<CategoryResponse>(res);
  }
}

export const apiClient = new ApiClient();
