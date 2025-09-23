import { Request, Response, NextFunction } from 'express';
import { CategoryService } from '../services/categoryService';
import Joi from 'joi';

export class CategoryController {
  private categoryService: CategoryService;

  constructor() {
    this.categoryService = new CategoryService();
  }

  // Validation schemas
  private readonly createCategorySchema = Joi.object({
    name: Joi.string().trim().max(100).required(),
    description: Joi.string().max(500),
    parent: Joi.string().pattern(/^[0-9a-fA-F]{24}$/)
  });

  private readonly updateCategorySchema = Joi.object({
    name: Joi.string().trim().max(100),
    description: Joi.string().max(500),
    parent: Joi.string().pattern(/^[0-9a-fA-F]{24}$/).allow(null),
    isActive: Joi.boolean()
  });

  async createCategory(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      // Validate request body
      const { error, value } = this.createCategorySchema.validate(req.body);
      if (error) {
        res.status(400).json({
          error: {
            code: 'E011',
            message: 'Validation failed',
            details: error.details.map(detail => detail.message),
            timestamp: new Date().toISOString()
          }
        });
        return;
      }

      const category = await this.categoryService.createCategory(value);

      res.status(201).json({
        message: 'Category created successfully',
        category
      });
    } catch (error) {
      next(error);
    }
  }

  async getCategories(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { includeInactive, tree } = req.query;

      const includeInactiveBool = includeInactive === 'true';
      const treeFormat = tree === 'true';

      if (treeFormat) {
        const categoryTree = await this.categoryService.getCategoryTree();
        res.status(200).json({
          categories: categoryTree,
          format: 'tree'
        });
      } else {
        const categories = await this.categoryService.getAllCategories(includeInactiveBool);
        res.status(200).json({
          categories,
          count: categories.length,
          format: 'flat'
        });
      }
    } catch (error) {
      next(error);
    }
  }

  async getCategoryById(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { id } = req.params;

      const category = await this.categoryService.getCategoryById(id);

      if (!category) {
        res.status(404).json({
          error: {
            code: 'E012',
            message: 'Category not found',
            timestamp: new Date().toISOString()
          }
        });
        return;
      }

      res.status(200).json({
        category
      });
    } catch (error) {
      next(error);
    }
  }

  async updateCategory(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { id } = req.params;

      // Validate request body
      const { error, value } = this.updateCategorySchema.validate(req.body);
      if (error) {
        res.status(400).json({
          error: {
            code: 'E013',
            message: 'Validation failed',
            details: error.details.map(detail => detail.message),
            timestamp: new Date().toISOString()
          }
        });
        return;
      }

      const category = await this.categoryService.updateCategory(id, value);

      if (!category) {
        res.status(404).json({
          error: {
            code: 'E014',
            message: 'Category not found',
            timestamp: new Date().toISOString()
          }
        });
        return;
      }

      res.status(200).json({
        message: 'Category updated successfully',
        category
      });
    } catch (error) {
      next(error);
    }
  }

  async deleteCategory(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { id } = req.params;
      const { cascade } = req.query;

      const cascadeChildren = cascade === 'true';

      const deleted = await this.categoryService.deleteCategory(id, cascadeChildren);

      if (!deleted) {
        res.status(404).json({
          error: {
            code: 'E015',
            message: 'Category not found',
            timestamp: new Date().toISOString()
          }
        });
        return;
      }

      res.status(200).json({
        message: 'Category deleted successfully',
        cascaded: cascadeChildren
      });
    } catch (error) {
      next(error);
    }
  }

  async getRootCategories(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const categories = await this.categoryService.getRootCategories();

      res.status(200).json({
        categories,
        count: categories.length
      });
    } catch (error) {
      next(error);
    }
  }

  async getChildCategories(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { id } = req.params;

      const children = await this.categoryService.getChildCategories(id);

      res.status(200).json({
        parentId: id,
        children,
        count: children.length
      });
    } catch (error) {
      next(error);
    }
  }

  async getCategoryPath(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { id } = req.params;

      const path = await this.categoryService.getCategoryPath(id);

      res.status(200).json({
        categoryId: id,
        path,
        level: path.length - 1
      });
    } catch (error) {
      next(error);
    }
  }

  async moveCategory(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { id } = req.params;
      const { newParentId } = req.body;

      // Validate newParentId if provided
      if (newParentId !== null && newParentId !== undefined) {
        if (typeof newParentId !== 'string' || !/^[0-9a-fA-F]{24}$/.test(newParentId)) {
          res.status(400).json({
            error: {
              code: 'E016',
              message: 'Invalid parent ID format',
              timestamp: new Date().toISOString()
            }
          });
          return;
        }
      }

      const category = await this.categoryService.moveCategory(id, newParentId || null);

      if (!category) {
        res.status(404).json({
          error: {
            code: 'E017',
            message: 'Category not found',
            timestamp: new Date().toISOString()
          }
        });
        return;
      }

      res.status(200).json({
        message: 'Category moved successfully',
        category
      });
    } catch (error) {
      next(error);
    }
  }

  async getCategoryTree(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const tree = await this.categoryService.getCategoryTree();

      res.status(200).json({
        tree,
        format: 'hierarchical'
      });
    } catch (error) {
      next(error);
    }
  }

  async getDescendants(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { id } = req.params;

      const descendants = await this.categoryService.getDescendants(id);

      res.status(200).json({
        parentId: id,
        descendants,
        count: descendants.length
      });
    } catch (error) {
      next(error);
    }
  }

  async getCategoryStats(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const totalCategories = await this.categoryService.getActiveCategoriesCount();
      const rootCategories = await this.categoryService.getRootCategories();

      res.status(200).json({
        totalCategories,
        rootCategoriesCount: rootCategories.length,
        averageDepth: 0 // This could be calculated if needed
      });
    } catch (error) {
      next(error);
    }
  }
}