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
  categories?: string[]; // Multiple categories support
  minPrice?: number;
  maxPrice?: number;
  search?: string;
  inStock?: boolean;
  tags?: string[];
  sortBy?: 'price' | 'name' | 'relevance' | 'createdAt';
}

export interface ProductQuery {
  page?: number;
  limit?: number;
  sort?: string;
  filters?: ProductFilters;
}

export interface SearchSuggestion {
  suggestions: string[];
  query: string;
}

export interface CategoryInfo {
  name: string;
  count: number;
}

export interface CategoriesResponse {
  categories: CategoryInfo[];
}

export interface PriceRange {
  min: number;
  max: number;
}

export interface PriceRangeResponse {
  priceRange: PriceRange;
}

export interface SearchFilters {
  searchTerm: string;
  categories: string[];
  priceRange: { min: number; max: number };
  sortBy: 'price' | 'name' | 'relevance' | 'createdAt';
  sortOrder: 'asc' | 'desc';
}

export interface SearchState {
  filters: SearchFilters;
  results: Product[];
  loading: boolean;
  totalResults: number;
  currentPage: number;
  totalPages: number;
  suggestions: string[];
}