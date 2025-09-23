import { Category, ICategory } from '../models/Category';
import mongoose from 'mongoose';

export interface CategoryTree extends Omit<ICategory, 'children'> {
  children: CategoryTree[];
}

export class CategoryService {

  async createCategory(categoryData: {
    name: string;
    description?: string;
    parent?: string;
  }): Promise<ICategory> {
    // Validate parent exists if provided
    if (categoryData.parent) {
      if (!mongoose.Types.ObjectId.isValid(categoryData.parent)) {
        throw new Error('Invalid parent category ID format');
      }

      const parentCategory = await Category.findById(categoryData.parent);
      if (!parentCategory) {
        throw new Error('Parent category not found');
      }

      if (!parentCategory.isActive) {
        throw new Error('Parent category is inactive');
      }
    }

    const category = new Category({
      name: categoryData.name,
      description: categoryData.description,
      parent: categoryData.parent ? new mongoose.Types.ObjectId(categoryData.parent) : null
    });

    return await category.save();
  }

  async getCategoryById(id: string): Promise<ICategory | null> {
    if (!mongoose.Types.ObjectId.isValid(id)) {
      throw new Error('Invalid category ID format');
    }

    return await Category.findById(id)
      .populate('parent', 'name description')
      .populate('children', 'name description');
  }

  async getAllCategories(includeInactive: boolean = false): Promise<ICategory[]> {
    const query = includeInactive ? {} : { isActive: true };

    return await Category.find(query)
      .populate('parent', 'name description')
      .sort({ name: 1 });
  }

  async getRootCategories(): Promise<ICategory[]> {
    return await Category.find({
      parent: null,
      isActive: true
    }).sort({ name: 1 });
  }

  async getChildCategories(parentId: string): Promise<ICategory[]> {
    if (!mongoose.Types.ObjectId.isValid(parentId)) {
      throw new Error('Invalid parent category ID format');
    }

    return await Category.find({
      parent: parentId,
      isActive: true
    }).sort({ name: 1 });
  }

  async getCategoryTree(): Promise<CategoryTree[]> {
    const rootCategories = await this.getRootCategories();

    const buildTree = async (categories: ICategory[]): Promise<CategoryTree[]> => {
      const tree: CategoryTree[] = [];

      for (const category of categories) {
        const children = await this.getChildCategories((category._id as mongoose.Types.ObjectId).toString());
        const categoryTree: CategoryTree = {
          ...category.toObject(),
          children: await buildTree(children)
        } as CategoryTree;
        tree.push(categoryTree);
      }

      return tree;
    };

    return await buildTree(rootCategories);
  }

  async updateCategory(id: string, updateData: {
    name?: string;
    description?: string;
    parent?: string | null;
    isActive?: boolean;
  }): Promise<ICategory | null> {
    if (!mongoose.Types.ObjectId.isValid(id)) {
      throw new Error('Invalid category ID format');
    }

    // Validate parent if being updated
    if (updateData.parent !== undefined) {
      if (updateData.parent !== null) {
        if (!mongoose.Types.ObjectId.isValid(updateData.parent)) {
          throw new Error('Invalid parent category ID format');
        }

        // Prevent circular references
        if (updateData.parent === id) {
          throw new Error('Category cannot be its own parent');
        }

        const parentCategory = await Category.findById(updateData.parent);
        if (!parentCategory) {
          throw new Error('Parent category not found');
        }

        if (!parentCategory.isActive) {
          throw new Error('Parent category is inactive');
        }

        // Check for circular reference in the hierarchy
        const isCircular = await this.wouldCreateCircularReference(id, updateData.parent);
        if (isCircular) {
          throw new Error('Update would create circular reference in category hierarchy');
        }
      }
    }

    const category = await Category.findByIdAndUpdate(
      id,
      updateData,
      { new: true, runValidators: true }
    );

    return category;
  }

  async deleteCategory(id: string, cascadeChildren: boolean = false): Promise<boolean> {
    if (!mongoose.Types.ObjectId.isValid(id)) {
      throw new Error('Invalid category ID format');
    }

    const category = await Category.findById(id);
    if (!category) {
      return false;
    }

    // Check if category has children
    const children = await Category.find({ parent: id });
    if (children.length > 0 && !cascadeChildren) {
      throw new Error('Category has child categories. Use cascade option to delete all children.');
    }

    if (cascadeChildren) {
      // Recursively delete all children
      for (const child of children) {
        await this.deleteCategory((child._id as mongoose.Types.ObjectId).toString(), true);
      }
    }

    // Soft delete by setting isActive to false
    await Category.findByIdAndUpdate(id, { isActive: false });
    return true;
  }

  async getCategoryPath(id: string): Promise<ICategory[]> {
    if (!mongoose.Types.ObjectId.isValid(id)) {
      throw new Error('Invalid category ID format');
    }

    const path: ICategory[] = [];
    let currentCategory = await Category.findById(id);

    while (currentCategory) {
      path.unshift(currentCategory);
      if (currentCategory.parent) {
        currentCategory = await Category.findById(currentCategory.parent);
      } else {
        break;
      }
    }

    return path;
  }

  async getCategoryLevel(id: string): Promise<number> {
    const path = await this.getCategoryPath(id);
    return path.length - 1; // Root level is 0
  }

  async getDescendants(id: string): Promise<ICategory[]> {
    if (!mongoose.Types.ObjectId.isValid(id)) {
      throw new Error('Invalid category ID format');
    }

    const descendants: ICategory[] = [];
    const queue = [id];

    while (queue.length > 0) {
      const currentId = queue.shift()!;
      const children = await Category.find({ parent: currentId });

      for (const child of children) {
        descendants.push(child);
        queue.push((child._id as mongoose.Types.ObjectId).toString());
      }
    }

    return descendants;
  }

  private async wouldCreateCircularReference(categoryId: string, newParentId: string): Promise<boolean> {
    // Check if the new parent is actually a descendant of the current category
    const descendants = await this.getDescendants(categoryId);
    return descendants.some(desc => (desc._id as mongoose.Types.ObjectId).toString() === newParentId);
  }

  async moveCategory(categoryId: string, newParentId: string | null): Promise<ICategory | null> {
    return await this.updateCategory(categoryId, { parent: newParentId });
  }

  async getActiveCategoriesCount(): Promise<number> {
    return await Category.countDocuments({ isActive: true });
  }

  async getCategoriesWithProductCount(): Promise<Array<any>> {
    const categories = await Category.find({ isActive: true });
    const categoriesWithCount: any[] = [];

    for (const category of categories) {
      // Note: This would require Product model import to get actual count
      // For now, we'll return 0 as placeholder - this should be implemented
      // when integrating with product queries
      categoriesWithCount.push({
        ...category.toObject(),
        productCount: 0
      });
    }

    return categoriesWithCount;
  }
}