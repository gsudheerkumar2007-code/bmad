import { Request, Response, NextFunction } from 'express';
import { authService, JWTPayload } from '../services/authService';

export interface AuthRequest extends Request {
  user?: JWTPayload;
}

export const authenticateToken = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({
        error: 'Access token is required'
      });
    }

    const token = authHeader.substring(7);
    const payload = await authService.verifyAccessToken(token);

    req.user = payload;
    next();
  } catch (error) {
    res.status(401).json({
      error: (error as Error).message
    });
  }
};

export const requireAdmin = (req: AuthRequest, res: Response, next: NextFunction): void => {
  if (!req.user?.isAdmin) {
    return res.status(403).json({
      error: 'Admin access required'
    });
  }
  next();
};

export const optionalAuth = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const authHeader = req.headers.authorization;

    if (authHeader && authHeader.startsWith('Bearer ')) {
      const token = authHeader.substring(7);
      const payload = await authService.verifyAccessToken(token);
      req.user = payload;
    }

    next();
  } catch (error) {
    // For optional auth, continue without user if token is invalid
    next();
  }
};