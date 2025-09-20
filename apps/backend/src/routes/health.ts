import { Router, Request, Response } from 'express';
import { checkDatabaseHealth } from '../config/database';
import { createSuccessResponse, createErrorResponse } from '@ecommerce/shared-utils';

const router = Router();

/**
 * GET /api/health
 * Health check endpoint returning server status and database connectivity
 */
router.get('/', async (_req: Request, res: Response) => {
  try {
    const dbHealth = await checkDatabaseHealth();

    const healthData = {
      server: {
        status: 'running',
        timestamp: new Date().toISOString(),
        uptime: process.uptime(),
        environment: process.env.NODE_ENV || 'development',
        version: process.env.npm_package_version || '1.0.0'
      },
      database: dbHealth
    };

    // Return 200 if both server and database are healthy
    if (dbHealth.status === 'connected') {
      res.status(200).json(createSuccessResponse(healthData, 'System is healthy'));
    } else {
      // Return 503 if database is not connected
      res.status(503).json(createErrorResponse('System is unhealthy', 'SERVICE_UNAVAILABLE'));
    }
  } catch (error) {
    res.status(500).json(createErrorResponse('Health check failed', 'HEALTH_CHECK_ERROR'));
  }
});

export default router;