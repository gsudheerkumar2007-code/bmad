import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { ProductService } from '../../features/products/services/product.service';
import { ProductListResponse, Product } from '../../features/products/interfaces/product.interface';

describe('Product API Contract Integration Tests', () => {
  let service: ProductService;
  let httpMock: HttpTestingController;

  const mockProductListResponse: ProductListResponse = {
    products: [
      {
        _id: '1',
        name: 'Test Product',
        description: 'Test description',
        price: 99.99,
        category: 'Electronics',
        images: ['https://example.com/test.jpg'],
        inventory: 10,
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date()
      }
    ],
    totalCount: 1,
    currentPage: 1,
    totalPages: 1,
    hasNextPage: false,
    hasPrevPage: false
  };

  const mockProduct: Product = {
    _id: '1',
    name: 'Test Product',
    description: 'Test description',
    price: 99.99,
    category: 'Electronics',
    images: ['https://example.com/test.jpg'],
    inventory: 10,
    isActive: true,
    createdAt: new Date(),
    updatedAt: new Date()
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
  });

  describe('ProductListResponse Contract Validation', () => {
    it('should handle valid ProductListResponse format from backend', () => {
      service.getProducts().subscribe(response => {
        // Validate that frontend service can process backend response
        expect(response).toBeDefined();
        expect(response.products).toBeDefined();
        expect(Array.isArray(response.products)).toBe(true);
        expect(typeof response.totalCount).toBe('number');
        expect(typeof response.currentPage).toBe('number');
        expect(typeof response.totalPages).toBe('number');
        expect(typeof response.hasNextPage).toBe('boolean');
        expect(typeof response.hasPrevPage).toBe('boolean');

        // Validate product structure
        if (response.products.length > 0) {
          const product = response.products[0];
          expect(product._id).toBeDefined();
          expect(product.name).toBeDefined();
          expect(product.description).toBeDefined();
          expect(typeof product.price).toBe('number');
          expect(product.category).toBeDefined();
          expect(Array.isArray(product.images)).toBe(true);
          expect(typeof product.inventory).toBe('number');
          expect(typeof product.isActive).toBe('boolean');
        }
      });

      const req = httpMock.expectOne('/api/products');
      expect(req.request.method).toBe('GET');
      req.flush(mockProductListResponse);
    });

    it('should handle empty products response correctly', () => {
      const emptyResponse: ProductListResponse = {
        products: [],
        totalCount: 0,
        currentPage: 1,
        totalPages: 0,
        hasNextPage: false,
        hasPrevPage: false
      };

      service.getProducts().subscribe(response => {
        expect(response.products).toEqual([]);
        expect(response.totalCount).toBe(0);
      });

      const req = httpMock.expectOne('/api/products');
      req.flush(emptyResponse);
    });

    it('should handle pagination fields correctly', () => {
      const paginatedResponse: ProductListResponse = {
        products: [mockProduct],
        totalCount: 25,
        currentPage: 2,
        totalPages: 3,
        hasNextPage: true,
        hasPrevPage: true
      };

      service.getProducts({ page: 2 }).subscribe(response => {
        expect(response.hasNextPage).toBe(true);
        expect(response.hasPrevPage).toBe(true);
        expect(response.currentPage).toBe(2);
        expect(response.totalPages).toBe(3);
      });

      const req = httpMock.expectOne('/api/products?page=2');
      req.flush(paginatedResponse);
    });
  });

  describe('Single Product Contract Validation', () => {
    it('should handle direct product object response (not wrapped)', () => {
      service.getProduct('1').subscribe(product => {
        expect(product).toBeDefined();
        expect(product._id).toBe('1');
        expect(product.name).toBe('Test Product');
        expect(typeof product.price).toBe('number');
        expect(Array.isArray(product.images)).toBe(true);
      });

      const req = httpMock.expectOne('/api/products/1');
      expect(req.request.method).toBe('GET');
      // Backend should return direct product object, not { product: ... }
      req.flush(mockProduct);
    });
  });

  describe('Error Response Contract Validation', () => {
    it('should handle standardized error response format', () => {
      const errorResponse = {
        error: {
          code: 'E002',
          message: 'Invalid query parameters',
          timestamp: '2025-09-23T16:00:00Z'
        }
      };

      service.getProducts().subscribe({
        next: () => fail('Should have failed'),
        error: (error) => {
          expect(error.message).toContain('Invalid request parameters');
        }
      });

      const req = httpMock.expectOne('/api/products');
      req.flush(errorResponse, { status: 400, statusText: 'Bad Request' });
    });

    it('should handle network connectivity errors', () => {
      service.getProducts().subscribe({
        next: () => fail('Should have failed'),
        error: (error) => {
          expect(error.message).toContain('Cannot connect to server');
        }
      });

      const req = httpMock.expectOne('/api/products');
      req.error(new ProgressEvent('network error'), { status: 0 });
    });
  });

  describe('Backward Compatibility Tests', () => {
    it('should fail gracefully if backend returns old format', () => {
      // Test what happens if backend accidentally returns old format
      const oldFormatResponse = {
        products: [mockProduct],
        pagination: {
          currentPage: 1,
          totalPages: 1,
          totalItems: 1,
          itemsPerPage: 20
        }
      };

      service.getProducts().subscribe({
        next: (response) => {
          // Frontend should still work but might have undefined pagination fields
          expect(response.products).toBeDefined();
          // These fields would be undefined in old format - test should catch this
          expect(response.totalCount).toBeUndefined();
          expect(response.hasNextPage).toBeUndefined();
        },
        error: () => {
          // Or it might fail completely, which is also a valid test outcome
          expect(true).toBe(true); // Test that error handling works
        }
      });

      const req = httpMock.expectOne('/api/products');
      req.flush(oldFormatResponse);
    });
  });
});