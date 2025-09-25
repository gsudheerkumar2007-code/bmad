import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, BehaviorSubject, throwError } from 'rxjs';
import { catchError, tap, shareReplay } from 'rxjs/operators';
import {
  Product,
  ProductListResponse,
  ProductQuery,
  SearchSuggestion,
  CategoriesResponse,
  PriceRangeResponse
} from '../interfaces/product.interface';
import { environment } from '../../../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class ProductService {
  private readonly apiUrl = `${environment.apiUrl}/products`;
  private productsCache = new Map<string, Observable<any>>();
  private currentProductSubject = new BehaviorSubject<Product | null>(null);

  public currentProduct$ = this.currentProductSubject.asObservable();

  constructor(private http: HttpClient) {}

  /**
   * Get paginated list of products with optional filtering
   */
  getProducts(query: ProductQuery = {}): Observable<ProductListResponse> {
    const cacheKey = JSON.stringify(query);

    if (this.productsCache.has(cacheKey)) {
      return this.productsCache.get(cacheKey)!;
    }

    let params = new HttpParams();

    if (query.page) params = params.set('page', query.page.toString());
    if (query.limit) params = params.set('limit', query.limit.toString());
    // if (query.sort) params = params.set('sort', query.sort);

    if (query.filters) {
      if (query.filters.category) params = params.set('category', query.filters.category);
      if (query.filters.categories && query.filters.categories.length > 0) {
        params = params.set('categories', query.filters.categories.join(','));
      }
      if (query.filters.minPrice) params = params.set('minPrice', query.filters.minPrice.toString());
      if (query.filters.maxPrice) params = params.set('maxPrice', query.filters.maxPrice.toString());
      if (query.filters.search) params = params.set('search', query.filters.search);
      if (query.filters.inStock !== undefined) params = params.set('inStock', query.filters.inStock.toString());
      if (query.filters.tags) params = params.set('tags', query.filters.tags.join(','));
      if (query.filters.sortBy) params = params.set('sort', query.filters.sortBy);
    }

    const request$ = this.http.get<ProductListResponse>(this.apiUrl, { params })
      .pipe(
        catchError(this.handleError),
        shareReplay(1)
      );

    this.productsCache.set(cacheKey, request$);

    // Clear cache after 5 minutes
    setTimeout(() => {
      this.productsCache.delete(cacheKey);
    }, 5 * 60 * 1000);

    return request$;
  }

  /**
   * Get single product by ID
   */
  getProduct(id: string): Observable<Product> {
    const cacheKey = `product-${id}`;

    if (this.productsCache.has(cacheKey)) {
      return this.productsCache.get(cacheKey)!;
    }

    const request$ = this.http.get<Product>(`${this.apiUrl}/${id}`)
      .pipe(
        tap(product => this.currentProductSubject.next(product)),
        catchError(this.handleError),
        shareReplay(1)
      );

    this.productsCache.set(cacheKey, request$);

    // Clear cache after 10 minutes
    setTimeout(() => {
      this.productsCache.delete(cacheKey);
    }, 10 * 60 * 1000);

    return request$;
  }

  /**
   * Get products by category
   */
  getProductsByCategory(category: string, query: ProductQuery = {}): Observable<ProductListResponse> {
    return this.getProducts({
      ...query,
      filters: {
        ...query.filters,
        category
      }
    });
  }

  /**
   * Search products
   */
  searchProducts(searchTerm: string, query: ProductQuery = {}): Observable<ProductListResponse> {
    return this.getProducts({
      ...query,
      filters: {
        ...query.filters,
        search: searchTerm
      }
    });
  }

  /**
   * Clear current product selection
   */
  clearCurrentProduct(): void {
    this.currentProductSubject.next(null);
  }

  /**
   * Clear all cached data
   */
  clearCache(): void {
    this.productsCache.clear();
  }

  /**
   * Check if product is in stock
   */
  isInStock(product: Product): boolean {
    return product.isActive && product.inventory > 0;
  }

  /**
   * Get stock status text
   */
  getStockStatus(product: Product): string {
    if (!product.isActive) {
      return 'Discontinued';
    }

    if (product.inventory === 0) {
      return 'Out of Stock';
    }

    if (product.inventory <= 5) {
      return 'Low Stock';
    }

    return 'In Stock';
  }

  /**
   * Get stock status color for UI
   */
  getStockStatusColor(product: Product): string {
    if (!product.isActive || product.inventory === 0) {
      return 'warn';
    }

    if (product.inventory <= 5) {
      return 'accent';
    }

    return 'primary';
  }

  /**
   * Get search suggestions
   */
  getSearchSuggestions(query: string, limit: number = 10): Observable<SearchSuggestion> {
    if (!query || query.length < 2) {
      return throwError(() => new Error('Query must be at least 2 characters'));
    }

    let params = new HttpParams()
      .set('q', query)
      .set('limit', limit.toString());

    return this.http.get<SearchSuggestion>(`${this.apiUrl}/search/suggestions`, { params })
      .pipe(
        catchError(this.handleError)
      );
  }

  /**
   * Get all available categories with counts
   */
  getCategories(): Observable<CategoriesResponse> {
    const cacheKey = 'categories';

    if (this.productsCache.has(cacheKey)) {
      return this.productsCache.get(cacheKey)!;
    }

    const request$ = this.http.get<CategoriesResponse>(`${this.apiUrl}/categories`)
      .pipe(
        catchError(this.handleError),
        shareReplay(1)
      );

    this.productsCache.set(cacheKey, request$);

    // Clear cache after 10 minutes
    setTimeout(() => {
      this.productsCache.delete(cacheKey);
    }, 10 * 60 * 1000);

    return request$;
  }

  /**
   * Get price range for all products
   */
  getPriceRange(): Observable<PriceRangeResponse> {
    const cacheKey = 'price-range';

    if (this.productsCache.has(cacheKey)) {
      return this.productsCache.get(cacheKey)!;
    }

    const request$ = this.http.get<PriceRangeResponse>(`${this.apiUrl}/price-range`)
      .pipe(
        catchError(this.handleError),
        shareReplay(1)
      );

    this.productsCache.set(cacheKey, request$);

    // Clear cache after 30 minutes
    setTimeout(() => {
      this.productsCache.delete(cacheKey);
    }, 30 * 60 * 1000);

    return request$;
  }

  /**
   * Advanced search with multiple filters
   */
  advancedSearch(filters: {
    search?: string;
    categories?: string[];
    minPrice?: number;
    maxPrice?: number;
    sortBy?: string;
    sortOrder?: string;
    page?: number;
    limit?: number;
  }): Observable<ProductListResponse> {
    return this.getProducts({
      page: filters.page || 1,
      limit: filters.limit || 20,
      sort: filters.sortBy || 'relevance',
      filters: {
        search: filters.search,
        categories: filters.categories,
        minPrice: filters.minPrice,
        maxPrice: filters.maxPrice,
        sortBy: filters.sortBy as any
      }
    });
  }

  private handleError(error: any): Observable<never> {
    console.error('Product service error:', error);

    // Handle different types of errors
    if (error.status === 404) {
      return throwError(() => new Error('Product not found'));
    }

    if (error.status === 500) {
      return throwError(() => new Error('Server error. Please try again later.'));
    }

    if (error.status === 0) {
      return throwError(() => new Error('Cannot connect to server. Please check if the backend is running.'));
    }

    if (error.status === 400) {
      return throwError(() => new Error(error.error?.error?.message || 'Invalid request parameters'));
    }

    // For connection refused or other network issues
    if (error.name === 'HttpErrorResponse' && !error.status) {
      return throwError(() => new Error('Cannot connect to server. Please ensure the backend API is running on the correct port.'));
    }

    return throwError(() => new Error(error.message || 'An unexpected error occurred'));
  }
}