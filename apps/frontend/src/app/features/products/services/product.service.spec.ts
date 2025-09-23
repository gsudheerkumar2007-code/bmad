import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { ProductService } from './product.service';
import { Product, ProductListResponse } from '../interfaces/product.interface';

describe('ProductService', () => {
  let service: ProductService;
  let httpMock: HttpTestingController;

  const mockProduct: Product = {
    _id: '1',
    name: 'Test Product',
    description: 'Test description',
    price: 99.99,
    category: 'Electronics',
    images: ['image1.jpg', 'image2.jpg'],
    inventory: 10,
    isActive: true,
    weight: 2.5,
    dimensions: { length: 10, width: 8, height: 3 },
    tags: ['test', 'electronics'],
    createdAt: new Date(),
    updatedAt: new Date()
  };

  const mockProductListResponse: ProductListResponse = {
    products: [mockProduct],
    totalCount: 1,
    currentPage: 1,
    totalPages: 1,
    hasNextPage: false,
    hasPrevPage: false
  };

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [ProductService]
    });
    service = TestBed.inject(ProductService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
    service.clearCache();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  describe('getProducts', () => {
    it('should fetch products list', () => {
      service.getProducts().subscribe(response => {
        expect(response).toEqual(mockProductListResponse);
      });

      const req = httpMock.expectOne('/api/products');
      expect(req.request.method).toBe('GET');
      req.flush(mockProductListResponse);
    });

    it('should send correct query parameters', () => {
      const query = {
        page: 2,
        limit: 20,
        sort: 'price',
        filters: {
          category: 'Electronics',
          minPrice: 50,
          maxPrice: 200,
          search: 'test',
          inStock: true,
          tags: ['tag1', 'tag2']
        }
      };

      service.getProducts(query).subscribe();

      const req = httpMock.expectOne(req => {
        return req.url === '/api/products' &&
               req.params.get('page') === '2' &&
               req.params.get('limit') === '20' &&
               req.params.get('sort') === 'price' &&
               req.params.get('category') === 'Electronics' &&
               req.params.get('minPrice') === '50' &&
               req.params.get('maxPrice') === '200' &&
               req.params.get('search') === 'test' &&
               req.params.get('inStock') === 'true' &&
               req.params.get('tags') === 'tag1,tag2';
      });

      expect(req.request.method).toBe('GET');
      req.flush(mockProductListResponse);
    });

    it('should cache requests', () => {
      const query = { page: 1, limit: 10 };

      // First request
      service.getProducts(query).subscribe();

      // Second identical request
      service.getProducts(query).subscribe();

      // Should only make one HTTP request due to caching
      const req = httpMock.expectOne('/api/products?page=1&limit=10');
      req.flush(mockProductListResponse);
    });

    it('should handle errors', () => {
      service.getProducts().subscribe({
        next: () => fail('should have failed'),
        error: (error) => {
          expect(error.message).toBe('Server error. Please try again later.');
        }
      });

      const req = httpMock.expectOne('/api/products');
      req.flush('Server Error', { status: 500, statusText: 'Internal Server Error' });
    });
  });

  describe('getProduct', () => {
    it('should fetch single product', () => {
      service.getProduct('1').subscribe(product => {
        expect(product).toEqual(mockProduct);
      });

      const req = httpMock.expectOne('/api/products/1');
      expect(req.request.method).toBe('GET');
      req.flush(mockProduct);
    });

    it('should update current product subject', () => {
      let currentProduct: Product | null = null;
      service.currentProduct$.subscribe(product => {
        currentProduct = product;
      });

      service.getProduct('1').subscribe();

      const req = httpMock.expectOne('/api/products/1');
      req.flush(mockProduct);

      expect(currentProduct).toEqual(mockProduct);
    });

    it('should handle 404 error', () => {
      service.getProduct('999').subscribe({
        next: () => fail('should have failed'),
        error: (error) => {
          expect(error.message).toBe('Product not found');
        }
      });

      const req = httpMock.expectOne('/api/products/999');
      req.flush('Not Found', { status: 404, statusText: 'Not Found' });
    });
  });

  describe('getProductsByCategory', () => {
    it('should fetch products by category', () => {
      service.getProductsByCategory('Electronics').subscribe(response => {
        expect(response).toEqual(mockProductListResponse);
      });

      const req = httpMock.expectOne('/api/products?category=Electronics');
      expect(req.request.method).toBe('GET');
      req.flush(mockProductListResponse);
    });
  });

  describe('searchProducts', () => {
    it('should search products', () => {
      service.searchProducts('test').subscribe(response => {
        expect(response).toEqual(mockProductListResponse);
      });

      const req = httpMock.expectOne('/api/products?search=test');
      expect(req.request.method).toBe('GET');
      req.flush(mockProductListResponse);
    });
  });

  describe('utility methods', () => {
    it('should check if product is in stock', () => {
      expect(service.isInStock(mockProduct)).toBe(true);

      const outOfStockProduct = { ...mockProduct, inventory: 0 };
      expect(service.isInStock(outOfStockProduct)).toBe(false);

      const inactiveProduct = { ...mockProduct, isActive: false };
      expect(service.isInStock(inactiveProduct)).toBe(false);
    });

    it('should get correct stock status', () => {
      expect(service.getStockStatus(mockProduct)).toBe('In Stock');

      const lowStockProduct = { ...mockProduct, inventory: 3 };
      expect(service.getStockStatus(lowStockProduct)).toBe('Low Stock');

      const outOfStockProduct = { ...mockProduct, inventory: 0 };
      expect(service.getStockStatus(outOfStockProduct)).toBe('Out of Stock');

      const discontinuedProduct = { ...mockProduct, isActive: false };
      expect(service.getStockStatus(discontinuedProduct)).toBe('Discontinued');
    });

    it('should get correct stock status color', () => {
      expect(service.getStockStatusColor(mockProduct)).toBe('primary');

      const lowStockProduct = { ...mockProduct, inventory: 3 };
      expect(service.getStockStatusColor(lowStockProduct)).toBe('accent');

      const outOfStockProduct = { ...mockProduct, inventory: 0 };
      expect(service.getStockStatusColor(outOfStockProduct)).toBe('warn');

      const discontinuedProduct = { ...mockProduct, isActive: false };
      expect(service.getStockStatusColor(discontinuedProduct)).toBe('warn');
    });
  });

  describe('cache management', () => {
    it('should clear current product', () => {
      let currentProduct: Product | null = mockProduct;
      service.currentProduct$.subscribe(product => {
        currentProduct = product;
      });

      service.clearCurrentProduct();
      expect(currentProduct).toBeNull();
    });

    it('should clear cache', () => {
      // Make a request to populate cache
      service.getProducts().subscribe();
      const req1 = httpMock.expectOne('/api/products');
      req1.flush(mockProductListResponse);

      // Clear cache
      service.clearCache();

      // Make the same request again - should result in new HTTP call
      service.getProducts().subscribe();
      const req2 = httpMock.expectOne('/api/products');
      req2.flush(mockProductListResponse);

      // Verify both requests were made
      expect(req1).toBeTruthy();
      expect(req2).toBeTruthy();
    });
  });
});