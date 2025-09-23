import mongoose from 'mongoose';
import { Product, IProduct } from './Product';
import { Category } from './Category';

describe('Product Model', () => {

  beforeEach(async () => {
    await Product.deleteMany({});
    await Category.deleteMany({});
  });

  describe('Schema Validation', () => {
    it('should create a valid product', async () => {
      const productData = {
        name: 'Test Product',
        description: 'A test product description',
        price: 99.99,
        category: 'Electronics',
        images: ['https://example.com/image1.jpg'],
        inventory: 10
      };

      const product = new Product(productData);
      const savedProduct = await product.save();

      expect(savedProduct._id).toBeDefined();
      expect(savedProduct.name).toBe(productData.name);
      expect(savedProduct.price).toBe(productData.price);
      expect(savedProduct.isActive).toBe(true); // default value
      expect(savedProduct.createdAt).toBeDefined();
      expect(savedProduct.updatedAt).toBeDefined();
    });

    it('should require name field', async () => {
      const productData = {
        description: 'A test product description',
        price: 99.99,
        category: 'Electronics'
      };

      const product = new Product(productData);

      await expect(product.save()).rejects.toThrow(/name/);
    });

    it('should require description field', async () => {
      const productData = {
        name: 'Test Product',
        price: 99.99,
        category: 'Electronics'
      };

      const product = new Product(productData);

      await expect(product.save()).rejects.toThrow(/description/);
    });

    it('should require price field', async () => {
      const productData = {
        name: 'Test Product',
        description: 'A test product description',
        category: 'Electronics'
      };

      const product = new Product(productData);

      await expect(product.save()).rejects.toThrow(/price/);
    });

    it('should require category field', async () => {
      const productData = {
        name: 'Test Product',
        description: 'A test product description',
        price: 99.99
      };

      const product = new Product(productData);

      await expect(product.save()).rejects.toThrow(/category/);
    });

    it('should validate price is non-negative', async () => {
      const productData = {
        name: 'Test Product',
        description: 'A test product description',
        price: -10,
        category: 'Electronics'
      };

      const product = new Product(productData);

      await expect(product.save()).rejects.toThrow(/Path `price` \(-10\) is less than minimum allowed value \(0\)/);
    });

    it('should validate inventory is non-negative', async () => {
      const productData = {
        name: 'Test Product',
        description: 'A test product description',
        price: 99.99,
        category: 'Electronics',
        inventory: -5
      };

      const product = new Product(productData);

      await expect(product.save()).rejects.toThrow();
    });

    it('should validate image URLs', async () => {
      const productData = {
        name: 'Test Product',
        description: 'A test product description',
        price: 99.99,
        category: 'Electronics',
        images: ['invalid-url']
      };

      const product = new Product(productData);

      await expect(product.save()).rejects.toThrow(/Image must be a valid URL/);
    });

    it('should trim name field', async () => {
      const productData = {
        name: '  Test Product  ',
        description: 'A test product description',
        price: 99.99,
        category: 'Electronics'
      };

      const product = new Product(productData);
      const savedProduct = await product.save();

      expect(savedProduct.name).toBe('Test Product');
    });

    it('should enforce name max length', async () => {
      const longName = 'a'.repeat(256);
      const productData = {
        name: longName,
        description: 'A test product description',
        price: 99.99,
        category: 'Electronics'
      };

      const product = new Product(productData);

      await expect(product.save()).rejects.toThrow();
    });

    it('should enforce description max length', async () => {
      const longDescription = 'a'.repeat(2001);
      const productData = {
        name: 'Test Product',
        description: longDescription,
        price: 99.99,
        category: 'Electronics'
      };

      const product = new Product(productData);

      await expect(product.save()).rejects.toThrow();
    });
  });

  describe('Default Values', () => {
    it('should set default inventory to 0', async () => {
      const productData = {
        name: 'Test Product',
        description: 'A test product description',
        price: 99.99,
        category: 'Electronics'
      };

      const product = new Product(productData);
      const savedProduct = await product.save();

      expect(savedProduct.inventory).toBe(0);
    });

    it('should set default isActive to true', async () => {
      const productData = {
        name: 'Test Product',
        description: 'A test product description',
        price: 99.99,
        category: 'Electronics'
      };

      const product = new Product(productData);
      const savedProduct = await product.save();

      expect(savedProduct.isActive).toBe(true);
    });
  });

  describe('Indexes', () => {
    it('should have text index on name and description', async () => {
      const indexes = await Product.collection.getIndexes();
      const textIndex = Object.keys(indexes).find(key =>
        indexes[key].some((field: any) => field[1] === 'text')
      );

      expect(textIndex).toBeDefined();
    });

    it('should have index on category', async () => {
      const indexes = await Product.collection.getIndexes();
      expect(indexes).toHaveProperty('category_1');
    });

    it('should have index on isActive', async () => {
      const indexes = await Product.collection.getIndexes();
      expect(indexes).toHaveProperty('isActive_1');
    });
  });
});