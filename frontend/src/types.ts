export interface User {
  id: number;
  username: string;
  email: string;
  roles: string[];
  name?: string;
  phone?: string;
  joinedDate?: string;
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
