export interface Product {
  _id: string;
  name: string;
  description: string;
  price: number;
  category: string;
  images: string[];
  inventory: number;
  isActive: boolean;
  weight?: number;
  dimensions?: {
    length: number;
    width: number;
    height: number;
  };
  tags?: string[];
  createdAt: Date;
  updatedAt: Date;
}

export interface ProductListResponse {
  products: Product[];
  totalCount: number;
  currentPage: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPrevPage: boolean;
}

export interface ProductFilters {
  category?: string;
  minPrice?: number;
  maxPrice?: number;
  search?: string;
  inStock?: boolean;
  tags?: string[];
}

export interface ProductQuery {
  page?: number;
  limit?: number;
  sort?: string;
  filters?: ProductFilters;
}