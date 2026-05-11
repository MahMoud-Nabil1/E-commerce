/**
 * Shared TypeScript types that mirror the backend DTOs.
 * Keep these in sync with the Java Payload classes.
 */

// ─── Pagination ──────────────────────────────────────────────────────────────

export type PaginatedResponse<T> = {
  content: T[];
  pageNumber: number;
  pageSize: number;
  totalElements: number;
  totalPages: number;
  lastPage: boolean;
};

// ─── Auth ─────────────────────────────────────────────────────────────────────

export type LoginRequest = {
  username: string;
  password: string;
};

export type RegisterRequest = {
  username: string;
  email: string;
  password: string;
  role?: string[]; // e.g. ["seller"] — omit for default ROLE_USER
};

export type UserInfoResponse = {
  id: number;
  username: string;
  email: string;
  roles: string[];
  jwtToken?: string | null;
};

export type MessageResponse = {
  message: string;
};

// ─── Category ─────────────────────────────────────────────────────────────────

export type CategoryDTO = {
  categoryId: number;
  categoryName: string;
};

export type CategoryResponse = PaginatedResponse<CategoryDTO>;

// ─── Product ──────────────────────────────────────────────────────────────────

export type ProductDTO = {
  productId: number;
  productName: string;
  image: string;
  description: string;
  quantity: number;
  price: number;
  discount: number;
  specialPrice: number;
};

export type ProductResponse = PaginatedResponse<ProductDTO>;

// ─── Address ──────────────────────────────────────────────────────────────────

export type AddressDTO = {
  addressId?: number;
  street: string;
  buildingName?: string;
  city: string;
  state: string;
  country: string;
  pincode: string;
};

// ─── Cart ─────────────────────────────────────────────────────────────────────

export type CartItemDTO = {
  productId: number;
  quantity: number;
};

export type CartDTO = {
  cartId: number;
  totalPrice: number;
  products: ProductDTO[];
};

// ─── Order ────────────────────────────────────────────────────────────────────

export type OrderRequestDTO = {
  addressId: number;
  pgName?: string;
  pgPaymentId?: string;
  pgStatus?: string;
  pgResponseMessage?: string;
};

export type PaymentDTO = {
  paymentId: number;
  paymentMethod: string;
  pgName?: string;
  pgPaymentId?: string;
  pgStatus?: string;
  pgResponseMessage?: string;
};

export type OrderItemDTO = {
  orderItemId: number;
  product: ProductDTO;
  quantity: number;
  discount: number;
  orderedProductPrice: number;
};

export type OrderDTO = {
  orderId: number;
  email: string;
  orderItems: OrderItemDTO[];
  orderDate: string; // ISO date string e.g. "2026-05-11"
  payment: PaymentDTO;
  totalAmount: number;
  orderStatus: string;
  addressId: number;
};

export type OrderResponse = PaginatedResponse<OrderDTO>;

export type OrderStatusUpdateDTO = {
  status: string;
};

// ─── Stripe ───────────────────────────────────────────────────────────────────

export type StripeAddress = {
  street: string;
  city: string;
  state: string;
  pincode: string;
  country: string;
};

export type StripePaymentDTO = {
  amount: number; // smallest currency unit (e.g. cents)
  email: string;
  name: string;
  currency: string;
  description?: string;
  address?: StripeAddress;
};
