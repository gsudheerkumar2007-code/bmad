import { Router } from 'express';
import { CategoryController } from '../controllers/categoryController';
import { authenticateToken, requireAdmin, optionalAuth, AuthRequest } from '../middleware/auth';

const router = Router();
const categoryController = new CategoryController();

// Public routes (no authentication required)
router.get('/', (req, res, next) => categoryController.getCategories(req, res, next));
router.get('/tree', (req, res, next) => categoryController.getCategoryTree(req, res, next));
router.get('/root', (req, res, next) => categoryController.getRootCategories(req, res, next));
router.get('/stats', (req, res, next) => categoryController.getCategoryStats(req, res, next));
router.get('/:id', (req, res, next) => categoryController.getCategoryById(req, res, next));
router.get('/:id/children', (req, res, next) => categoryController.getChildCategories(req, res, next));
router.get('/:id/path', (req, res, next) => categoryController.getCategoryPath(req, res, next));
router.get('/:id/descendants', (req, res, next) => categoryController.getDescendants(req, res, next));

// Admin routes (authentication + admin required)
router.post('/', authenticateToken, requireAdmin, (req, res, next) => categoryController.createCategory(req, res, next));
router.put('/:id', authenticateToken, requireAdmin, (req, res, next) => categoryController.updateCategory(req, res, next));
router.delete('/:id', authenticateToken, requireAdmin, (req, res, next) => categoryController.deleteCategory(req, res, next));
router.patch('/:id/move', authenticateToken, requireAdmin, (req, res, next) => categoryController.moveCategory(req, res, next));

export default router;