import request from 'supertest';
import mongoose from 'mongoose';
import app from '../../src/app';
import { Product } from '../../src/models/Product';
import { Category } from '../../src/models/Category';

describe('Product API Integration Tests', () => {
  // Database setup is handled by test-setup.ts

  beforeEach(async () => {
    // Clear test data
    await Product.deleteMany({});
    await Category.deleteMany({});

    // Create test category
    await Category.create({
      name: 'Test Electronics',
      description: 'Test category for electronics',
      isActive: true
    });

    // Create test products
    await Product.create([
      {
        name: 'Test Product 1',
        description: 'Test description 1',
        price: 99.99,
        category: 'Test Electronics',
        images: ['https://example.com/test1.jpg'],
        inventory: 10,
        isActive: true
      },
      {
        name: 'Test Product 2',
        description: 'Test description 2',
        price: 149.99,
        category: 'Test Electronics',
        images: ['https://example.com/test2.jpg'],
        inventory: 5,
        isActive: true
      }
    ]);
  });

  describe('GET /api/products - API Contract Validation', () => {
    it('should return products in correct ProductListResponse format', async () => {
      const response = await request(app)
        .get('/api/products')
        .expect(200);

      // Validate response structure matches frontend ProductListResponse interface
      expect(response.body).toHaveProperty('products');
      expect(response.body).toHaveProperty('totalCount');
      expect(response.body).toHaveProperty('currentPage');
      expect(response.body).toHaveProperty('totalPages');
      expect(response.body).toHaveProperty('hasNextPage');
      expect(response.body).toHaveProperty('hasPrevPage');

      // Validate data types
      expect(Array.isArray(response.body.products)).toBe(true);
      expect(typeof response.body.totalCount).toBe('number');
      expect(typeof response.body.currentPage).toBe('number');
      expect(typeof response.body.totalPages).toBe('number');
      expect(typeof response.body.hasNextPage).toBe('boolean');
      expect(typeof response.body.hasPrevPage).toBe('boolean');

      // Validate products array structure
      if (response.body.products.length > 0) {
        const product = response.body.products[0];
        expect(product).toHaveProperty('_id');
        expect(product).toHaveProperty('name');
        expect(product).toHaveProperty('description');
        expect(product).toHaveProperty('price');
        expect(product).toHaveProperty('category');
        expect(product).toHaveProperty('images');
        expect(product).toHaveProperty('inventory');
        expect(product).toHaveProperty('isActive');
      }
    });

    it('should handle pagination correctly', async () => {
      const response = await request(app)
        .get('/api/products?page=1&limit=1')
        .expect(200);

      expect(response.body.currentPage).toBe(1);
      expect(response.body.products.length).toBeLessThanOrEqual(1);
      expect(response.body.totalCount).toBeGreaterThanOrEqual(response.body.products.length);

      if (response.body.totalCount > 1) {
        expect(response.body.hasNextPage).toBe(true);
      }
      expect(response.body.hasPrevPage).toBe(false);
    });

    it('should handle filtering correctly', async () => {
      const response = await request(app)
        .get('/api/products?category=Test Electronics')
        .expect(200);

      expect(response.body.products.every((p: any) => p.category === 'Test Electronics')).toBe(true);
    });

    it('should handle empty results correctly', async () => {
      const response = await request(app)
        .get('/api/products?category=NonExistent')
        .expect(200);

      expect(response.body.products).toEqual([]);
      expect(response.body.totalCount).toBe(0);
      expect(response.body.currentPage).toBe(1);
      expect(response.body.totalPages).toBe(0);
      expect(response.body.hasNextPage).toBe(false);
      expect(response.body.hasPrevPage).toBe(false);
    });
  });

  describe('GET /api/products/:id - Single Product Contract', () => {
    it('should return single product in correct format', async () => {
      const products = await Product.find({});
      const testProductId = products[0]._id;

      const response = await request(app)
        .get(`/api/products/${testProductId}`)
        .expect(200);

      // Should return direct product object, not wrapped
      expect(response.body).toHaveProperty('_id');
      expect(response.body).toHaveProperty('name');
      expect(response.body).toHaveProperty('description');
      expect(response.body).toHaveProperty('price');
      expect(response.body).toHaveProperty('category');
      expect(response.body).toHaveProperty('images');
      expect(response.body).toHaveProperty('inventory');
      expect(response.body).toHaveProperty('isActive');

      // Should NOT be wrapped in { product: ... }
      expect(response.body).not.toHaveProperty('product');
    });

    it('should return 404 for non-existent product', async () => {
      const nonExistentId = new mongoose.Types.ObjectId();

      const response = await request(app)
        .get(`/api/products/${nonExistentId}`)
        .expect(404);

      expect(response.body).toHaveProperty('error');
      expect(response.body.error).toHaveProperty('code');
      expect(response.body.error).toHaveProperty('message');
      expect(response.body.error).toHaveProperty('timestamp');
    });
  });

  describe('Error Response Format Validation', () => {
    it('should return standardized error format for validation errors', async () => {
      const response = await request(app)
        .get('/api/products?page=invalid')
        .expect(400);

      expect(response.body).toHaveProperty('error');
      expect(response.body.error).toHaveProperty('code');
      expect(response.body.error).toHaveProperty('message');
      expect(response.body.error).toHaveProperty('timestamp');
      expect(response.body.error.code).toBe('E002');
    });
  });

  describe('Performance and Reliability', () => {
    it('should handle concurrent requests without data corruption', async () => {
      const requests = Array.from({ length: 5 }, () =>
        request(app).get('/api/products').expect(200)
      );

      const responses = await Promise.all(requests);

      // All responses should have consistent structure
      responses.forEach(response => {
        expect(response.body).toHaveProperty('products');
        expect(response.body).toHaveProperty('totalCount');
        expect(response.body.totalCount).toBeGreaterThanOrEqual(0);
      });
    });

    it('should respond within acceptable time limits', async () => {
      const startTime = Date.now();

      await request(app)
        .get('/api/products')
        .expect(200);

      const endTime = Date.now();
      const responseTime = endTime - startTime;

      // API should respond within 1 second
      expect(responseTime).toBeLessThan(1000);
    });
  });
});