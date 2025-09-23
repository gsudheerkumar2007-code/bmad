import { Request, Response, NextFunction } from 'express';

export interface PaginationQuery {
  page?: string;
  limit?: string;
  sort?: string;
  sortOrder?: 'asc' | 'desc';
}

export interface PaginationParams {
  page: number;
  limit: number;
  skip: number;
  sort: string;
  sortOrder: 'asc' | 'desc';
}

export interface PaginatedRequest extends Request {
  pagination?: PaginationParams;
}

export const paginationMiddleware = (
  defaultLimit: number = 20,
  maxLimit: number = 100,
  defaultSort: string = 'createdAt',
  allowedSortFields: string[] = ['createdAt', 'updatedAt', 'name', 'price']
) => {
  return (req: PaginatedRequest, res: Response, next: NextFunction): void => {
    try {
      const query = req.query as PaginationQuery;

      // Parse and validate page
      let page = parseInt(query.page || '1', 10);
      if (isNaN(page) || page < 1) {
        page = 1;
      }

      // Parse and validate limit
      let limit = parseInt(query.limit || defaultLimit.toString(), 10);
      if (isNaN(limit) || limit < 1) {
        limit = defaultLimit;
      }
      if (limit > maxLimit) {
        limit = maxLimit;
      }

      // Calculate skip
      const skip = (page - 1) * limit;

      // Validate and set sort field
      let sort = query.sort || defaultSort;
      if (!allowedSortFields.includes(sort)) {
        sort = defaultSort;
      }

      // Validate and set sort order
      let sortOrder: 'asc' | 'desc' = 'desc';
      if (query.sortOrder === 'asc' || query.sortOrder === 'desc') {
        sortOrder = query.sortOrder;
      }

      // Attach pagination params to request
      req.pagination = {
        page,
        limit,
        skip,
        sort,
        sortOrder
      };

      next();
    } catch (error) {
      res.status(400).json({
        error: {
          code: 'E027',
          message: 'Invalid pagination parameters',
          timestamp: new Date().toISOString()
        }
      });
    }
  };
};

export const createPaginationResponse = <T>(
  data: T[],
  totalItems: number,
  page: number,
  limit: number
) => {
  const totalPages = Math.ceil(totalItems / limit);
  const hasNextPage = page < totalPages;
  const hasPrevPage = page > 1;

  return {
    data,
    pagination: {
      currentPage: page,
      totalPages,
      totalItems,
      itemsPerPage: limit,
      hasNextPage,
      hasPrevPage,
      nextPage: hasNextPage ? page + 1 : null,
      prevPage: hasPrevPage ? page - 1 : null
    }
  };
};

export const validatePaginationQuery = (
  page?: number,
  limit?: number,
  maxLimit: number = 100
): { isValid: boolean; error?: string } => {
  if (page !== undefined && (isNaN(page) || page < 1)) {
    return { isValid: false, error: 'Page must be a positive integer' };
  }

  if (limit !== undefined && (isNaN(limit) || limit < 1)) {
    return { isValid: false, error: 'Limit must be a positive integer' };
  }

  if (limit !== undefined && limit > maxLimit) {
    return { isValid: false, error: `Limit cannot exceed ${maxLimit}` };
  }

  return { isValid: true };
};