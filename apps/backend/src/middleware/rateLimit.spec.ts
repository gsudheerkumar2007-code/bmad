import request from 'supertest';
import express from 'express';
import { searchSuggestionsLimiter, rateLimiter } from './rateLimit';

describe('Rate Limiting Middleware', () => {
  let app: express.Application;

  beforeEach(() => {
    app = express();

    // Test route with rate limiting
    app.get('/test-suggestions', searchSuggestionsLimiter, (req, res) => {
      res.json({ success: true, message: 'Request successful' });
    });

    // Test route with custom limiter
    const customLimiter = rateLimiter.createLimiter({
      windowMs: 1000, // 1 second
      maxRequests: 2,
      errorMessage: 'Custom rate limit exceeded'
    });

    app.get('/test-custom', customLimiter, (req, res) => {
      res.json({ success: true });
    });
  });

  describe('Search Suggestions Rate Limiter', () => {
    it('should allow requests within limit', async () => {
      const response = await request(app)
        .get('/test-suggestions')
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.headers['x-ratelimit-limit']).toBe('50');
      expect(response.headers['x-ratelimit-remaining']).toBe('49');
      expect(response.headers['x-ratelimit-reset']).toBeDefined();
    });

    it('should block requests when limit exceeded', async () => {
      // Make requests up to the limit
      const promises = Array(50).fill(null).map(() =>
        request(app).get('/test-suggestions')
      );

      await Promise.all(promises);

      // This request should be blocked
      const response = await request(app)
        .get('/test-suggestions')
        .expect(429);

      expect(response.body.error.code).toBe('E029');
      expect(response.body.error.message).toContain('Too many search suggestions requests');
      expect(response.body.error.retryAfter).toBeDefined();
    });

    it('should include proper rate limit headers', async () => {
      const response = await request(app)
        .get('/test-suggestions')
        .expect(200);

      expect(response.headers).toHaveProperty('x-ratelimit-limit');
      expect(response.headers).toHaveProperty('x-ratelimit-remaining');
      expect(response.headers).toHaveProperty('x-ratelimit-reset');
    });
  });

  describe('Custom Rate Limiter', () => {
    it('should respect custom configuration', async () => {
      // First request should succeed
      await request(app)
        .get('/test-custom')
        .expect(200);

      // Second request should succeed
      await request(app)
        .get('/test-custom')
        .expect(200);

      // Third request should be blocked
      const response = await request(app)
        .get('/test-custom')
        .expect(429);

      expect(response.body.error.message).toBe('Custom rate limit exceeded');
    });

    it('should reset after window expires', async () => {
      // Make 2 requests to hit the limit
      await request(app).get('/test-custom').expect(200);
      await request(app).get('/test-custom').expect(200);

      // Third should be blocked
      await request(app).get('/test-custom').expect(429);

      // Wait for window to expire
      await new Promise(resolve => setTimeout(resolve, 1100));

      // Should allow requests again
      await request(app)
        .get('/test-custom')
        .expect(200);
    });
  });

  describe('Key Generation', () => {
    it('should use IP address as default key', async () => {
      const customLimiter = rateLimiter.createLimiter({
        windowMs: 1000,
        maxRequests: 1
      });

      app.get('/test-ip', customLimiter, (req, res) => {
        res.json({ ip: req.ip });
      });

      // First request should succeed
      await request(app)
        .get('/test-ip')
        .expect(200);

      // Second request from same IP should be blocked
      await request(app)
        .get('/test-ip')
        .expect(429);
    });

    it('should use custom key generator', async () => {
      const customLimiter = rateLimiter.createLimiter({
        windowMs: 1000,
        maxRequests: 1,
        keyGenerator: (req) => req.headers['x-user-id'] as string || 'anonymous'
      });

      app.get('/test-key', customLimiter, (req, res) => {
        res.json({ success: true });
      });

      // Request with user ID should succeed
      await request(app)
        .get('/test-key')
        .set('x-user-id', 'user1')
        .expect(200);

      // Second request with same user ID should be blocked
      await request(app)
        .get('/test-key')
        .set('x-user-id', 'user1')
        .expect(429);

      // Request with different user ID should succeed
      await request(app)
        .get('/test-key')
        .set('x-user-id', 'user2')
        .expect(200);
    });
  });

  describe('Error Handling', () => {
    it('should handle missing IP gracefully', async () => {
      const customLimiter = rateLimiter.createLimiter({
        windowMs: 1000,
        maxRequests: 1
      });

      app.get('/test-no-ip', customLimiter, (req, res) => {
        res.json({ success: true });
      });

      // Remove IP from request
      app.use('/test-no-ip', (req, res, next) => {
        (req as any).ip = undefined;
        next();
      });

      const response = await request(app)
        .get('/test-no-ip')
        .expect(200);

      expect(response.body.success).toBe(true);
    });
  });
});