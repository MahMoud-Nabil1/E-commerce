export interface User {
  id: number;
  username: string;
  email: string;
  roles: string[];
  name?: string;
  phone?: string;
  joinedDate?: string;
  // Account status fields returned by the sellers list endpoint
  enabled?: boolean;
  banned?: boolean;
  suspended?: boolean;
}

export interface UserProfile {
  id: number;
  username: string;
  email: string;
  name: string;
  phone: string;
  joinedDate: string;
}

export interface UserProfileUpdate {
  name?: string;
  phone?: string;
}

export interface LoginResponse {
  id: number;
  username: string;
  email: string;
  roles: string[];
  jwtToken?: string;
  name?: string;
  phone?: string;
  joinedDate?: string;
}

export interface Product {
  productId: number;
  productName: string;
  description: string;
  image?: string;
  images?: string[];
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
  quantity: number;
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

export interface Address {
  addressId: number;
  street: string;
  buildingName: string;
  city: string;
  state: string;
  country: string;
  pincode: string;
}

export interface OrderItem {
  orderItemId: number;
  product: {
    productId: number;
    productName: string;
    image?: string;
    description?: string;
    quantity?: number;
    price?: number;
    discount?: number;
    specialPrice?: number;
  };
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
  address?: Address;
}

export interface OrderResponse {
  content: Order[];
  pageNumber: number;
  pageSize: number;
  totalElements: number;
  totalPages: number;
  lastPage: boolean;
}

export interface Review {
  reviewId: number;
  productId: number;
  username: string;
  rating: number;
  headline?: string;
  comment?: string;
  verifiedPurchase: boolean;
  createdAt: string;
  updatedAt?: string;
}

export interface ReviewPage {
  content: Review[];
  pageNumber: number;
  pageSize: number;
  totalElements: number;
  totalPages: number;
  lastPage: boolean;
}

export interface ReviewSummary {
  productId: number;
  averageRating: number;
  totalReviews: number;
  /** Key: star value (1-5), Value: count */
  starCounts: Record<number, number>;
}

export interface ReviewPayload {
  rating: number;
  headline?: string;
  comment?: string;
}
