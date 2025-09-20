import { Router } from 'express';
import { authController } from '../controllers/authController';

const router = Router();

// Register new user
router.post('/register', (req, res) => authController.register(req, res));

// Login user
router.post('/login', (req, res) => authController.login(req, res));

// Refresh access token
router.post('/refresh', (req, res) => authController.refreshTokens(req, res));

// Get current user profile
router.get('/profile', (req, res) => authController.getProfile(req, res));

// Change password
router.post('/change-password', (req, res) => authController.changePassword(req, res));

export default router;