// Shared TypeScript interfaces and types for the e-commerce platform

export interface User {
  _id: string;
  email: string;
  firstName: string;
  lastName: string;
  isAdmin: boolean;
}

export interface Product {
  _id: string;
  name: string;
  description: string;
  price: number;
  category: string;
  images: string[];
  inventory: number;
  isActive: boolean;
}

export interface CartItem {
  product: string;
  quantity: number;
  priceAtTime: number;
}

export interface Cart {
  _id: string;
  userId: string;
  items: CartItem[];
  totalAmount: number;
}

export interface OrderItem {
  product: string;
  name: string;
  price: number;
  quantity: number;
}

export interface Address {
  street: string;
  city: string;
  state: string;
  zipCode: string;
  country: string;
}

export interface Order {
  _id: string;
  userId: string;
  orderNumber: string;
  items: OrderItem[];
  totalAmount: number;
  status: 'pending' | 'processing' | 'shipped' | 'delivered' | 'cancelled';
  shippingAddress: Address;
}

export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

export interface PaginationResponse<T = any> {
  data: T[];
  pagination: {
    currentPage: number;
    totalPages: number;
    totalItems: number;
    itemsPerPage: number;
  };
}