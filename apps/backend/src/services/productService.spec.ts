import mongoose from 'mongoose';
import { ProductService } from './productService';
import { Product } from '../models/Product';
import { Category } from '../models/Category';

describe('ProductService', () => {
  let productService: ProductService;

  beforeAll(async () => {
    productService = new ProductService();
  });

  beforeEach(async () => {
    await Product.deleteMany({});
    await Category.deleteMany({});

    // Create test categories
    const categories = [
      { name: 'Electronics', description: 'Electronic devices' },
      { name: 'Mobile', description: 'Mobile devices' },
      { name: 'Books', description: 'Books and publications' },
      { name: 'Clothing', description: 'Clothing and accessories' }
    ];

    for (const categoryData of categories) {
      const category = new Category(categoryData);
      await category.save();
    }
  });

  describe('createProduct', () => {
    it('should create a new product', async () => {
      const productData = {
        name: 'Test Product',
        description: 'A test product',
        price: 99.99,
        category: 'Electronics',
        inventory: 10
      };

      const product = await productService.createProduct(productData);

      expect(product._id).toBeDefined();
      expect(product.name).toBe(productData.name);
      expect(product.price).toBe(productData.price);
      expect(product.category).toBe(productData.category);
    });

    it('should throw error for invalid category', async () => {
      const productData = {
        name: 'Test Product',
        description: 'A test product',
        price: 99.99,
        category: 'NonExistentCategory',
        inventory: 10
      };

      await expect(productService.createProduct(productData))
        .rejects.toThrow('Category \'NonExistentCategory\' does not exist or is inactive');
    });
  });

  describe('getProductById', () => {
    it('should return product by valid ID', async () => {
      const productData = {
        name: 'Test Product',
        description: 'A test product',
        price: 99.99,
        category: 'Electronics'
      };

      const createdProduct = await productService.createProduct(productData);
      const foundProduct = await productService.getProductById((createdProduct._id as any).toString());

      expect(foundProduct).toBeTruthy();
      expect((foundProduct?._id as any).toString()).toBe((createdProduct._id as any).toString());
    });

    it('should return null for non-existent ID', async () => {
      const nonExistentId = new mongoose.Types.ObjectId().toString();
      const product = await productService.getProductById(nonExistentId);

      expect(product).toBeNull();
    });

    it('should throw error for invalid ID format', async () => {
      await expect(productService.getProductById('invalid-id'))
        .rejects.toThrow('Invalid product ID format');
    });
  });

  describe('getProducts', () => {
    beforeEach(async () => {
      // Create test products
      const products = [
        {
          name: 'Product 1',
          description: 'Description 1',
          price: 10.99,
          category: 'Electronics',
          isActive: true
        },
        {
          name: 'Product 2',
          description: 'Description 2',
          price: 20.99,
          category: 'Electronics',
          isActive: true
        },
        {
          name: 'Product 3',
          description: 'Description 3',
          price: 30.99,
          category: 'Electronics',
          isActive: false
        }
      ];

      for (const productData of products) {
        await productService.createProduct(productData);
      }
    });

    it('should return paginated products', async () => {
      const result = await productService.getProducts({}, { page: 1, limit: 2 });

      expect(result.data).toHaveLength(2);
      expect(result.pagination.currentPage).toBe(1);
      expect(result.pagination.totalPages).toBe(2);
      expect(result.pagination.totalItems).toBe(3);
      expect(result.pagination.itemsPerPage).toBe(2);
    });

    it('should filter by category', async () => {
      const result = await productService.getProducts(
        { category: 'Electronics' },
        { page: 1, limit: 10 }
      );

      expect(result.data).toHaveLength(3);
      result.data.forEach(product => {
        expect(product.category).toBe('Electronics');
      });
    });

    it('should filter by isActive', async () => {
      const result = await productService.getProducts(
        { isActive: true },
        { page: 1, limit: 10 }
      );

      expect(result.data).toHaveLength(2);
      result.data.forEach(product => {
        expect(product.isActive).toBe(true);
      });
    });

    it('should filter by price range', async () => {
      const result = await productService.getProducts(
        { minPrice: 15, maxPrice: 25 },
        { page: 1, limit: 10 }
      );

      expect(result.data).toHaveLength(1);
      expect(result.data[0].price).toBe(20.99);
    });

    it('should sort products', async () => {
      const result = await productService.getProducts(
        {},
        { page: 1, limit: 10, sort: 'price', sortOrder: 'asc' }
      );

      expect(result.data[0].price).toBeLessThanOrEqual(result.data[1].price);
    });
  });

  describe('updateProduct', () => {
    it('should update product successfully', async () => {
      const productData = {
        name: 'Test Product',
        description: 'A test product',
        price: 99.99,
        category: 'Electronics'
      };

      const createdProduct = await productService.createProduct(productData);
      const updateData = { name: 'Updated Product', price: 149.99 };

      const updatedProduct = await productService.updateProduct(
        (createdProduct._id as any).toString(),
        updateData
      );

      expect(updatedProduct?.name).toBe('Updated Product');
      expect(updatedProduct?.price).toBe(149.99);
    });

    it('should return null for non-existent product', async () => {
      const nonExistentId = new mongoose.Types.ObjectId().toString();
      const updateData = { name: 'Updated Product' };

      const result = await productService.updateProduct(nonExistentId, updateData);

      expect(result).toBeNull();
    });

    it('should validate category when updating', async () => {
      const productData = {
        name: 'Test Product',
        description: 'A test product',
        price: 99.99,
        category: 'Electronics'
      };

      const createdProduct = await productService.createProduct(productData);
      const updateData = { category: 'NonExistentCategory' };

      await expect(productService.updateProduct(
        (createdProduct._id as any).toString(),
        updateData
      )).rejects.toThrow('Category \'NonExistentCategory\' does not exist or is inactive');
    });
  });

  describe('deleteProduct', () => {
    it('should soft delete product', async () => {
      const productData = {
        name: 'Test Product',
        description: 'A test product',
        price: 99.99,
        category: 'Electronics'
      };

      const createdProduct = await productService.createProduct(productData);
      const deleted = await productService.deleteProduct((createdProduct._id as any).toString());

      expect(deleted).toBe(true);

      // Verify product is soft deleted
      const product = await Product.findById(createdProduct._id);
      expect(product?.isActive).toBe(false);
    });

    it('should return false for non-existent product', async () => {
      const nonExistentId = new mongoose.Types.ObjectId().toString();
      const deleted = await productService.deleteProduct(nonExistentId);

      expect(deleted).toBe(false);
    });
  });

  describe('inventory management', () => {
    let testProduct: any;

    beforeEach(async () => {
      const productData = {
        name: 'Test Product',
        description: 'A test product',
        price: 99.99,
        category: 'Electronics',
        inventory: 10
      };
      testProduct = await productService.createProduct(productData);
    });

    describe('updateInventory', () => {
      it('should update inventory to specific quantity', async () => {
        const updatedProduct = await productService.updateInventory(
          testProduct._id.toString(),
          25
        );

        expect(updatedProduct?.inventory).toBe(25);
      });

      it('should throw error for negative inventory', async () => {
        await expect(productService.updateInventory(
          testProduct._id.toString(),
          -5
        )).rejects.toThrow('Inventory quantity cannot be negative');
      });
    });

    describe('adjustInventory', () => {
      it('should increase inventory', async () => {
        const updatedProduct = await productService.adjustInventory(
          testProduct._id.toString(),
          5
        );

        expect(updatedProduct?.inventory).toBe(15);
      });

      it('should decrease inventory', async () => {
        const updatedProduct = await productService.adjustInventory(
          testProduct._id.toString(),
          -3
        );

        expect(updatedProduct?.inventory).toBe(7);
      });

      it('should throw error for insufficient inventory', async () => {
        await expect(productService.adjustInventory(
          testProduct._id.toString(),
          -15
        )).rejects.toThrow('Insufficient inventory');
      });
    });
  });

  describe('searchProducts', () => {
    beforeEach(async () => {
      const products = [
        {
          name: 'iPhone 15',
          description: 'Latest Apple smartphone',
          price: 999,
          category: 'Electronics'
        },
        {
          name: 'Samsung Galaxy',
          description: 'Android smartphone',
          price: 899,
          category: 'Electronics'
        },
        {
          name: 'MacBook Pro',
          description: 'Apple laptop computer',
          price: 1999,
          category: 'Electronics'
        }
      ];

      for (const productData of products) {
        await productService.createProduct(productData);
      }
    });

    it('should search products by name', async () => {
      const results = await productService.searchProducts('iPhone');

      expect(results.length).toBeGreaterThan(0);
      expect(results[0].name).toContain('iPhone');
    });

    it('should search products by description', async () => {
      const results = await productService.searchProducts('smartphone');

      expect(results.length).toBe(2);
    });

    it('should limit search results', async () => {
      const results = await productService.searchProducts('smartphone', 1);

      expect(results.length).toBe(1);
    });
  });

  describe('getSearchSuggestions', () => {
    beforeEach(async () => {
      const products = [
        {
          name: 'Apple iPhone 15',
          description: 'Latest Apple smartphone',
          price: 999,
          category: 'Electronics'
        },
        {
          name: 'Apple MacBook',
          description: 'Apple laptop computer',
          price: 1999,
          category: 'Electronics'
        },
        {
          name: 'Samsung Galaxy',
          description: 'Android smartphone',
          price: 899,
          category: 'Mobile'
        }
      ];

      for (const productData of products) {
        await productService.createProduct(productData);
      }
    });

    it('should return suggestions for valid query', async () => {
      const suggestions = await productService.getSearchSuggestions('Apple');

      expect(suggestions.length).toBeGreaterThan(0);
      expect(suggestions).toContain('Apple iPhone 15');
      expect(suggestions).toContain('Apple MacBook');
    });

    it('should return category suggestions', async () => {
      const suggestions = await productService.getSearchSuggestions('Electr');

      expect(suggestions).toContain('Electronics');
    });

    it('should return empty array for short query', async () => {
      const suggestions = await productService.getSearchSuggestions('A');

      expect(suggestions).toEqual([]);
    });

    it('should return empty array for empty query', async () => {
      const suggestions = await productService.getSearchSuggestions('');

      expect(suggestions).toEqual([]);
    });

    it('should limit suggestions', async () => {
      const suggestions = await productService.getSearchSuggestions('Apple', 1);

      expect(suggestions.length).toBeLessThanOrEqual(1);
    });

    it('should remove duplicates', async () => {
      const suggestions = await productService.getSearchSuggestions('Apple');

      const uniqueSuggestions = [...new Set(suggestions)];
      expect(suggestions.length).toBe(uniqueSuggestions.length);
    });
  });

  describe('getCategories', () => {
    beforeEach(async () => {
      const products = [
        {
          name: 'Product 1',
          description: 'Description 1',
          price: 99,
          category: 'Electronics'
        },
        {
          name: 'Product 2',
          description: 'Description 2',
          price: 199,
          category: 'Electronics'
        },
        {
          name: 'Product 3',
          description: 'Description 3',
          price: 299,
          category: 'Books'
        }
      ];

      for (const productData of products) {
        await productService.createProduct(productData);
      }
    });

    it('should return distinct categories', async () => {
      const categories = await productService.getCategories();

      expect(categories).toContain('Electronics');
      expect(categories).toContain('Books');
      expect(categories.length).toBe(2);
    });

    it('should only return categories from active products', async () => {
      // Create inactive product with different category
      const inactiveProduct = {
        name: 'Inactive Product',
        description: 'Description',
        price: 99,
        category: 'Inactive Category',
        isActive: false
      };

      await Product.create(inactiveProduct);

      const categories = await productService.getCategories();

      expect(categories).not.toContain('Inactive Category');
    });
  });

  describe('getCategoryHierarchy', () => {
    beforeEach(async () => {
      const products = [
        {
          name: 'Product 1',
          description: 'Description 1',
          price: 99,
          category: 'Electronics'
        },
        {
          name: 'Product 2',
          description: 'Description 2',
          price: 199,
          category: 'Electronics'
        },
        {
          name: 'Product 3',
          description: 'Description 3',
          price: 299,
          category: 'Books'
        }
      ];

      for (const productData of products) {
        await productService.createProduct(productData);
      }
    });

    it('should return category counts', async () => {
      const hierarchy = await productService.getCategoryHierarchy();

      expect(hierarchy['Electronics']).toBe(2);
      expect(hierarchy['Books']).toBe(1);
    });

    it('should only count active products', async () => {
      // Create inactive product
      await Product.create({
        name: 'Inactive Product',
        description: 'Description',
        price: 99,
        category: 'Electronics',
        isActive: false
      });

      const hierarchy = await productService.getCategoryHierarchy();

      expect(hierarchy['Electronics']).toBe(2); // Should still be 2, not 3
    });
  });

  describe('getPriceRange', () => {
    beforeEach(async () => {
      const products = [
        {
          name: 'Cheap Product',
          description: 'Description',
          price: 10.99,
          category: 'Electronics'
        },
        {
          name: 'Mid Product',
          description: 'Description',
          price: 50.99,
          category: 'Electronics'
        },
        {
          name: 'Expensive Product',
          description: 'Description',
          price: 999.99,
          category: 'Electronics'
        }
      ];

      for (const productData of products) {
        await productService.createProduct(productData);
      }
    });

    it('should return min and max prices', async () => {
      const priceRange = await productService.getPriceRange();

      expect(priceRange.min).toBe(10.99);
      expect(priceRange.max).toBe(999.99);
    });

    it('should only consider active products', async () => {
      // Add inactive expensive product
      await Product.create({
        name: 'Inactive Expensive',
        description: 'Description',
        price: 1999.99,
        category: 'Electronics',
        isActive: false
      });

      const priceRange = await productService.getPriceRange();

      expect(priceRange.max).toBe(999.99); // Should ignore inactive product
    });

    it('should return zero range when no products exist', async () => {
      await Product.deleteMany({});

      const priceRange = await productService.getPriceRange();

      expect(priceRange.min).toBe(0);
      expect(priceRange.max).toBe(0);
    });
  });
});