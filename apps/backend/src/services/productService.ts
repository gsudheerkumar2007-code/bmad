import { Product, IProduct } from '../models/Product';
import { Category } from '../models/Category';
import mongoose from 'mongoose';

export interface ProductFilters {
  category?: string;
  search?: string;
  isActive?: boolean;
  minPrice?: number;
  maxPrice?: number;
}

export interface PaginationOptions {
  page: number;
  limit: number;
  sort?: string;
  sortOrder?: 'asc' | 'desc';
}

export interface PaginatedResult<T> {
  data: T[];
  pagination: {
    currentPage: number;
    totalPages: number;
    totalItems: number;
    itemsPerPage: number;
  };
}

export class ProductService {

  async createProduct(productData: Partial<IProduct>): Promise<IProduct> {
    // Validate category exists
    if (productData.category) {
      const categoryExists = await Category.findOne({
        name: productData.category,
        isActive: true
      });
      if (!categoryExists) {
        throw new Error(`Category '${productData.category}' does not exist or is inactive`);
      }
    }

    const product = new Product(productData);
    return await product.save();
  }

  async getProductById(id: string): Promise<IProduct | null> {
    if (!mongoose.Types.ObjectId.isValid(id)) {
      throw new Error('Invalid product ID format');
    }

    return await Product.findById(id);
  }

  async getProducts(
    filters: ProductFilters = {},
    options: PaginationOptions = { page: 1, limit: 20 }
  ): Promise<PaginatedResult<IProduct>> {
    const query: any = {};

    // Apply filters
    if (filters.category) {
      query.category = filters.category;
    }

    if (filters.isActive !== undefined) {
      query.isActive = filters.isActive;
    }

    if (filters.minPrice !== undefined || filters.maxPrice !== undefined) {
      query.price = {};
      if (filters.minPrice !== undefined) {
        query.price.$gte = filters.minPrice;
      }
      if (filters.maxPrice !== undefined) {
        query.price.$lte = filters.maxPrice;
      }
    }

    // Text search
    if (filters.search) {
      query.$text = { $search: filters.search };
    }

    // Calculate pagination
    const page = Math.max(1, options.page);
    const limit = Math.min(100, Math.max(1, options.limit)); // Max 100 items per page
    const skip = (page - 1) * limit;

    // Build sort criteria
    let sort: any = { createdAt: -1 }; // Default sort
    if (options.sort) {
      const sortOrder = options.sortOrder === 'asc' ? 1 : -1;
      sort = { [options.sort]: sortOrder };
    }

    // Execute query with pagination
    const [products, totalItems] = await Promise.all([
      Product.find(query)
        .sort(sort)
        .skip(skip)
        .limit(limit)
        .exec(),
      Product.countDocuments(query)
    ]);

    const totalPages = Math.ceil(totalItems / limit);

    return {
      data: products,
      pagination: {
        currentPage: page,
        totalPages,
        totalItems,
        itemsPerPage: limit
      }
    };
  }

  async updateProduct(id: string, updateData: Partial<IProduct>): Promise<IProduct | null> {
    if (!mongoose.Types.ObjectId.isValid(id)) {
      throw new Error('Invalid product ID format');
    }

    // Validate category if being updated
    if (updateData.category) {
      const categoryExists = await Category.findOne({
        name: updateData.category,
        isActive: true
      });
      if (!categoryExists) {
        throw new Error(`Category '${updateData.category}' does not exist or is inactive`);
      }
    }

    const product = await Product.findByIdAndUpdate(
      id,
      updateData,
      { new: true, runValidators: true }
    );

    return product;
  }

  async deleteProduct(id: string): Promise<boolean> {
    if (!mongoose.Types.ObjectId.isValid(id)) {
      throw new Error('Invalid product ID format');
    }

    // Soft delete by setting isActive to false
    const result = await Product.findByIdAndUpdate(
      id,
      { isActive: false },
      { new: true }
    );

    return !!result;
  }

  async updateInventory(id: string, quantity: number): Promise<IProduct | null> {
    if (!mongoose.Types.ObjectId.isValid(id)) {
      throw new Error('Invalid product ID format');
    }

    if (quantity < 0) {
      throw new Error('Inventory quantity cannot be negative');
    }

    const product = await Product.findByIdAndUpdate(
      id,
      { inventory: quantity },
      { new: true, runValidators: true }
    );

    return product;
  }

  async adjustInventory(id: string, adjustment: number): Promise<IProduct | null> {
    if (!mongoose.Types.ObjectId.isValid(id)) {
      throw new Error('Invalid product ID format');
    }

    const product = await Product.findById(id);
    if (!product) {
      throw new Error('Product not found');
    }

    const newInventory = product.inventory + adjustment;
    if (newInventory < 0) {
      throw new Error('Insufficient inventory');
    }

    product.inventory = newInventory;
    return await product.save();
  }

  async getProductsByCategory(category: string): Promise<IProduct[]> {
    return await Product.find({
      category,
      isActive: true
    }).sort({ createdAt: -1 });
  }

  async searchProducts(searchTerm: string, limit: number = 20): Promise<IProduct[]> {
    return await Product.find({
      $text: { $search: searchTerm },
      isActive: true
    })
    .sort({ score: { $meta: 'textScore' } })
    .limit(limit);
  }

  async getActiveProducts(): Promise<IProduct[]> {
    return await Product.find({ isActive: true }).sort({ createdAt: -1 });
  }

  async getInactiveProducts(): Promise<IProduct[]> {
    return await Product.find({ isActive: false }).sort({ createdAt: -1 });
  }
}