import mongoose from 'mongoose';
import { Category, ICategory } from './Category';

describe('Category Model', () => {

  beforeEach(async () => {
    await Category.deleteMany({});
  });

  describe('Schema Validation', () => {
    it('should create a valid category', async () => {
      const categoryData = {
        name: 'Electronics',
        description: 'Electronic devices and gadgets'
      };

      const category = new Category(categoryData);
      const savedCategory = await category.save();

      expect(savedCategory._id).toBeDefined();
      expect(savedCategory.name).toBe(categoryData.name);
      expect(savedCategory.description).toBe(categoryData.description);
      expect(savedCategory.isActive).toBe(true);
      expect(savedCategory.parent).toBeNull();
      expect(savedCategory.children).toEqual([]);
      expect(savedCategory.createdAt).toBeDefined();
      expect(savedCategory.updatedAt).toBeDefined();
    });

    it('should require name field', async () => {
      const categoryData = {
        description: 'Electronic devices and gadgets'
      };

      const category = new Category(categoryData);

      await expect(category.save()).rejects.toThrow(/name/);
    });

    it('should enforce unique name constraint', async () => {
      const categoryData = {
        name: 'Electronics',
        description: 'Electronic devices and gadgets'
      };

      const category1 = new Category(categoryData);
      await category1.save();

      const category2 = new Category(categoryData);

      await expect(category2.save()).rejects.toThrow();
    });

    it('should trim name field', async () => {
      const categoryData = {
        name: '  Electronics  ',
        description: 'Electronic devices and gadgets'
      };

      const category = new Category(categoryData);
      const savedCategory = await category.save();

      expect(savedCategory.name).toBe('Electronics');
    });

    it('should enforce name max length', async () => {
      const longName = 'a'.repeat(101);
      const categoryData = {
        name: longName,
        description: 'Electronic devices and gadgets'
      };

      const category = new Category(categoryData);

      await expect(category.save()).rejects.toThrow();
    });

    it('should enforce description max length', async () => {
      const longDescription = 'a'.repeat(501);
      const categoryData = {
        name: 'Electronics',
        description: longDescription
      };

      const category = new Category(categoryData);

      await expect(category.save()).rejects.toThrow();
    });
  });

  describe('Hierarchical Relationships', () => {
    it('should create parent-child relationship', async () => {
      const parentCategory = new Category({
        name: 'Electronics',
        description: 'Electronic devices'
      });
      const savedParent = await parentCategory.save();

      const childCategory = new Category({
        name: 'Smartphones',
        description: 'Mobile phones',
        parent: savedParent._id
      });
      const savedChild = await childCategory.save();

      // Check that parent was updated with child
      const updatedParent = await Category.findById(savedParent._id);
      expect(updatedParent?.children).toContainEqual(savedChild._id);

      // Check child has correct parent
      expect(savedChild.parent?.toString()).toBe((savedParent._id as any).toString());
    });

    it('should allow multiple children for one parent', async () => {
      const parentCategory = new Category({
        name: 'Electronics',
        description: 'Electronic devices'
      });
      const savedParent = await parentCategory.save();

      const child1 = new Category({
        name: 'Smartphones',
        description: 'Mobile phones',
        parent: savedParent._id
      });
      await child1.save();

      const child2 = new Category({
        name: 'Laptops',
        description: 'Laptop computers',
        parent: savedParent._id
      });
      await child2.save();

      const updatedParent = await Category.findById(savedParent._id);
      expect(updatedParent?.children).toHaveLength(2);
    });

    it('should handle deletion of parent-child relationships', async () => {
      const parentCategory = new Category({
        name: 'Electronics',
        description: 'Electronic devices'
      });
      const savedParent = await parentCategory.save();

      const childCategory = new Category({
        name: 'Smartphones',
        description: 'Mobile phones',
        parent: savedParent._id
      });
      const savedChild = await childCategory.save();

      // Delete child using deleteOne
      await savedChild.deleteOne();

      // Check that parent's children array was updated
      const updatedParent = await Category.findById(savedParent._id);
      expect(updatedParent?.children).not.toContain(savedChild._id);
    });
  });

  describe('Default Values', () => {
    it('should set default isActive to true', async () => {
      const categoryData = {
        name: 'Electronics',
        description: 'Electronic devices'
      };

      const category = new Category(categoryData);
      const savedCategory = await category.save();

      expect(savedCategory.isActive).toBe(true);
    });

    it('should set default parent to null', async () => {
      const categoryData = {
        name: 'Electronics',
        description: 'Electronic devices'
      };

      const category = new Category(categoryData);
      const savedCategory = await category.save();

      expect(savedCategory.parent).toBeNull();
    });

    it('should set default children to empty array', async () => {
      const categoryData = {
        name: 'Electronics',
        description: 'Electronic devices'
      };

      const category = new Category(categoryData);
      const savedCategory = await category.save();

      expect(savedCategory.children).toEqual([]);
    });
  });

  describe('Indexes', () => {
    it('should have unique index on name', async () => {
      const indexes = await Category.collection.getIndexes();
      expect(indexes).toHaveProperty('name_1');
      expect(indexes.name_1[0]).toEqual(['name', 1]);
    });

    it('should have index on parent and isActive', async () => {
      const indexes = await Category.collection.getIndexes();
      expect(indexes).toHaveProperty('parent_1_isActive_1');
    });

    it('should have index on isActive', async () => {
      const indexes = await Category.collection.getIndexes();
      expect(indexes).toHaveProperty('isActive_1');
    });
  });
});