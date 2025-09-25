import { Router } from 'express';
import { ProductController } from '../controllers/productController';
import { authenticateToken, requireAdmin, optionalAuth, AuthRequest } from '../middleware/auth';
import { upload, handleUploadError, getFileUrl } from '../config/upload';
import { searchSuggestionsLimiter } from '../middleware/rateLimit';

const router = Router();
const productController = new ProductController();

// Public routes (no authentication required)
router.get('/', (req, res, next) => productController.getProducts(req, res, next));
router.get('/search', (req, res, next) => productController.searchProducts(req, res, next));
router.get('/search/suggestions', searchSuggestionsLimiter, (req, res, next) => productController.getSearchSuggestions(req, res, next));
router.get('/categories', (req, res, next) => productController.getCategories(req, res, next));
router.get('/price-range', (req, res, next) => productController.getPriceRange(req, res, next));
router.get('/category/:category', (req, res, next) => productController.getProductsByCategory(req, res, next));
router.get('/:id', (req, res, next) => productController.getProductById(req, res, next));

// Admin routes (authentication + admin required)
router.post('/', authenticateToken, requireAdmin, (req, res, next) => productController.createProduct(req, res, next));
router.put('/:id', authenticateToken, requireAdmin, (req, res, next) => productController.updateProduct(req, res, next));
router.delete('/:id', authenticateToken, requireAdmin, (req, res, next) => productController.deleteProduct(req, res, next));

// Inventory management routes (admin only)
router.put('/:id/inventory', authenticateToken, requireAdmin, (req, res, next) => productController.updateInventory(req, res, next));
router.patch('/:id/inventory/adjust', authenticateToken, requireAdmin, (req, res, next) => productController.adjustInventory(req, res, next));

// Image upload route (admin only)
router.post('/:id/images',
  authenticateToken,
  requireAdmin,
  upload.array('images', 10),
  handleUploadError,
  async (req: AuthRequest, res, next) => {
    try {
      const { id } = req.params;
      const files = req.files as Express.Multer.File[];

      if (!files || files.length === 0) {
        return res.status(400).json({
          error: {
            code: 'E023',
            message: 'No images provided',
            timestamp: new Date().toISOString()
          }
        });
      }

      // Generate URLs for uploaded files
      const imageUrls = files.map(file => getFileUrl(file.filename));

      // Here you would typically update the product with new image URLs
      // For now, just return the uploaded file URLs
      res.status(200).json({
        message: 'Images uploaded successfully',
        productId: id,
        images: imageUrls,
        count: imageUrls.length
      });
    } catch (error) {
      next(error);
    }
  }
);

// Bulk operations (admin only)
router.post('/bulk/create', authenticateToken, requireAdmin, async (req: AuthRequest, res, next) => {
  try {
    const { products } = req.body;

    if (!Array.isArray(products) || products.length === 0) {
      return res.status(400).json({
        error: {
          code: 'E024',
          message: 'Products array is required and cannot be empty',
          timestamp: new Date().toISOString()
        }
      });
    }

    if (products.length > 100) {
      return res.status(400).json({
        error: {
          code: 'E025',
          message: 'Cannot create more than 100 products at once',
          timestamp: new Date().toISOString()
        }
      });
    }

    // This would be implemented in the service layer for bulk operations
    res.status(501).json({
      error: {
        code: 'E026',
        message: 'Bulk operations not yet implemented',
        timestamp: new Date().toISOString()
      }
    });
  } catch (error) {
    next(error);
  }
});

export default router;