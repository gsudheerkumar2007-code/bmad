import { Request, Response, NextFunction } from 'express';
import { ProductService, ProductFilters, PaginationOptions } from '../services/productService';
import Joi from 'joi';

export class ProductController {
  private productService: ProductService;

  constructor() {
    this.productService = new ProductService();
  }

  // Validation schemas
  private readonly createProductSchema = Joi.object({
    name: Joi.string().trim().max(255).required(),
    description: Joi.string().max(2000).required(),
    price: Joi.number().min(0).required(),
    category: Joi.string().required(),
    images: Joi.array().items(Joi.string().uri()),
    inventory: Joi.number().min(0).default(0),
    isActive: Joi.boolean().default(true)
  });

  private readonly updateProductSchema = Joi.object({
    name: Joi.string().trim().max(255),
    description: Joi.string().max(2000),
    price: Joi.number().min(0),
    category: Joi.string(),
    images: Joi.array().items(Joi.string().uri()),
    inventory: Joi.number().min(0),
    isActive: Joi.boolean()
  });

  private readonly querySchema = Joi.object({
    page: Joi.number().min(1).default(1),
    limit: Joi.number().min(1).max(100).default(20),
    sort: Joi.string().valid('name', 'price', 'createdAt', 'inventory', 'relevance').default('createdAt'),
    sortOrder: Joi.string().valid('asc', 'desc').default('desc'),
    category: Joi.string(),
    categories: Joi.string().custom((value, helpers) => {
      // Allow comma-separated categories
      return value.split(',').map((cat: string) => cat.trim()).filter(Boolean);
    }),
    search: Joi.string(),
    isActive: Joi.boolean(),
    minPrice: Joi.number().min(0),
    maxPrice: Joi.number().min(0)
  });

  private readonly suggestionSchema = Joi.object({
    q: Joi.string().min(2).required(),
    limit: Joi.number().min(1).max(20).default(10)
  });

  async createProduct(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      // Validate request body
      const { error, value } = this.createProductSchema.validate(req.body);
      if (error) {
        res.status(400).json({
          error: {
            code: 'E001',
            message: 'Validation failed',
            details: error.details.map(detail => detail.message),
            timestamp: new Date().toISOString()
          }
        });
        return;
      }

      const product = await this.productService.createProduct(value);

      res.status(201).json({
        message: 'Product created successfully',
        product
      });
    } catch (error) {
      next(error);
    }
  }

  async getProducts(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      // Validate query parameters
      const { error, value } = this.querySchema.validate(req.query);
      if (error) {
        res.status(400).json({
          error: {
            code: 'E002',
            message: 'Invalid query parameters',
            details: error.details.map(detail => detail.message),
            timestamp: new Date().toISOString()
          }
        });
        return;
      }

      // Extract filters and pagination options
      const filters: ProductFilters = {
        category: value.category,
        categories: value.categories,
        search: value.search,
        isActive: value.isActive,
        minPrice: value.minPrice,
        maxPrice: value.maxPrice,
        sortBy: value.sort
      };

      const options: PaginationOptions = {
        page: value.page,
        limit: value.limit,
        sort: value.sort,
        sortOrder: value.sortOrder
      };

      const result = await this.productService.getProducts(filters, options);

      // Transform response to match frontend interface
      res.status(200).json({
        products: result.data,
        totalCount: result.pagination.totalItems,
        currentPage: result.pagination.currentPage,
        totalPages: result.pagination.totalPages,
        hasNextPage: result.pagination.currentPage < result.pagination.totalPages,
        hasPrevPage: result.pagination.currentPage > 1
      });
    } catch (error) {
      next(error);
    }
  }

  async getProductById(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { id } = req.params;

      const product = await this.productService.getProductById(id);

      if (!product) {
        res.status(404).json({
          error: {
            code: 'E003',
            message: 'Product not found',
            timestamp: new Date().toISOString()
          }
        });
        return;
      }

      res.status(200).json(product);
    } catch (error) {
      next(error);
    }
  }

  async updateProduct(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { id } = req.params;

      // Validate request body
      const { error, value } = this.updateProductSchema.validate(req.body);
      if (error) {
        res.status(400).json({
          error: {
            code: 'E004',
            message: 'Validation failed',
            details: error.details.map(detail => detail.message),
            timestamp: new Date().toISOString()
          }
        });
        return;
      }

      const product = await this.productService.updateProduct(id, value);

      if (!product) {
        res.status(404).json({
          error: {
            code: 'E005',
            message: 'Product not found',
            timestamp: new Date().toISOString()
          }
        });
        return;
      }

      res.status(200).json({
        message: 'Product updated successfully',
        product
      });
    } catch (error) {
      next(error);
    }
  }

  async deleteProduct(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { id } = req.params;

      const deleted = await this.productService.deleteProduct(id);

      if (!deleted) {
        res.status(404).json({
          error: {
            code: 'E006',
            message: 'Product not found',
            timestamp: new Date().toISOString()
          }
        });
        return;
      }

      res.status(200).json({
        message: 'Product deleted successfully'
      });
    } catch (error) {
      next(error);
    }
  }

  async updateInventory(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { id } = req.params;
      const { quantity } = req.body;

      // Validate quantity
      if (typeof quantity !== 'number' || quantity < 0) {
        res.status(400).json({
          error: {
            code: 'E007',
            message: 'Quantity must be a non-negative number',
            timestamp: new Date().toISOString()
          }
        });
        return;
      }

      const product = await this.productService.updateInventory(id, quantity);

      if (!product) {
        res.status(404).json({
          error: {
            code: 'E008',
            message: 'Product not found',
            timestamp: new Date().toISOString()
          }
        });
        return;
      }

      res.status(200).json({
        message: 'Inventory updated successfully',
        product: {
          id: product!._id,
          name: product!.name,
          inventory: product!.inventory
        }
      });
    } catch (error) {
      next(error);
    }
  }

  async adjustInventory(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { id } = req.params;
      const { adjustment } = req.body;

      // Validate adjustment
      if (typeof adjustment !== 'number') {
        res.status(400).json({
          error: {
            code: 'E009',
            message: 'Adjustment must be a number',
            timestamp: new Date().toISOString()
          }
        });
        return;
      }

      const product = await this.productService.adjustInventory(id, adjustment);

      res.status(200).json({
        message: 'Inventory adjusted successfully',
        product: {
          id: product!._id,
          name: product!.name,
          inventory: product!.inventory
        }
      });
    } catch (error) {
      next(error);
    }
  }

  async getProductsByCategory(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { category } = req.params;

      const products = await this.productService.getProductsByCategory(category);

      res.status(200).json({
        products,
        count: products.length
      });
    } catch (error) {
      next(error);
    }
  }

  async searchProducts(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { q: searchTerm, limit } = req.query;

      if (!searchTerm || typeof searchTerm !== 'string') {
        res.status(400).json({
          error: {
            code: 'E010',
            message: 'Search term is required',
            timestamp: new Date().toISOString()
          }
        });
        return;
      }

      const searchLimit = limit ? Math.min(100, Math.max(1, parseInt(limit as string))) : 20;

      const products = await this.productService.searchProducts(searchTerm, searchLimit);

      res.status(200).json({
        products,
        searchTerm,
        count: products.length
      });
    } catch (error) {
      next(error);
    }
  }

  async getSearchSuggestions(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      // Validate query parameters
      const { error, value } = this.suggestionSchema.validate(req.query);
      if (error) {
        res.status(400).json({
          error: {
            code: 'E011',
            message: 'Invalid suggestion request',
            details: error.details.map(detail => detail.message),
            timestamp: new Date().toISOString()
          }
        });
        return;
      }

      const suggestions = await this.productService.getSearchSuggestions(value.q, value.limit);

      res.status(200).json({
        suggestions,
        query: value.q
      });
    } catch (error) {
      next(error);
    }
  }

  async getCategories(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const categories = await this.productService.getCategories();
      const hierarchy = await this.productService.getCategoryHierarchy();

      res.status(200).json({
        categories: categories.map(category => ({
          name: category,
          count: hierarchy[category] || 0
        })).sort((a, b) => b.count - a.count)
      });
    } catch (error) {
      next(error);
    }
  }

  async getPriceRange(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const priceRange = await this.productService.getPriceRange();

      res.status(200).json({
        priceRange
      });
    } catch (error) {
      next(error);
    }
  }
}