import { Request, Response, NextFunction } from 'express';

interface RateLimitEntry {
  count: number;
  resetTime: number;
}

class InMemoryRateLimit {
  private store = new Map<string, RateLimitEntry>();

  // Default configuration
  private defaultConfig = {
    windowMs: 60 * 1000, // 1 minute
    maxRequests: 30, // 30 requests per window
    keyGenerator: (req: Request) => req.ip || 'unknown',
    errorMessage: 'Too many requests, please try again later.',
    skipSuccessfulRequests: false
  };

  // Cleanup expired entries every 5 minutes
  constructor() {
    setInterval(() => this.cleanup(), 5 * 60 * 1000);
  }

  private cleanup(): void {
    const now = Date.now();
    for (const [key, entry] of this.store.entries()) {
      if (entry.resetTime <= now) {
        this.store.delete(key);
      }
    }
  }

  public createLimiter(config: {
    windowMs?: number;
    maxRequests?: number;
    keyGenerator?: (req: Request) => string;
    errorMessage?: string;
    skipSuccessfulRequests?: boolean;
  } = {}) {
    const options = { ...this.defaultConfig, ...config };

    return (req: Request, res: Response, next: NextFunction) => {
      const key = options.keyGenerator(req);
      const now = Date.now();

      let entry = this.store.get(key);

      // Initialize or reset if window has passed
      if (!entry || entry.resetTime <= now) {
        entry = {
          count: 0,
          resetTime: now + options.windowMs
        };
        this.store.set(key, entry);
      }

      // Check if limit exceeded
      if (entry.count >= options.maxRequests) {
        const timeRemaining = entry.resetTime - now;
        res.status(429).json({
          error: {
            code: 'E029',
            message: options.errorMessage,
            retryAfter: Math.ceil(timeRemaining / 1000),
            timestamp: new Date().toISOString()
          }
        });
        return;
      }

      // Increment counter (skip if configured to skip successful requests)
      if (!options.skipSuccessfulRequests || res.statusCode >= 400) {
        entry.count++;
      }

      // Set rate limit headers
      res.set({
        'X-RateLimit-Limit': options.maxRequests.toString(),
        'X-RateLimit-Remaining': Math.max(0, options.maxRequests - entry.count).toString(),
        'X-RateLimit-Reset': new Date(entry.resetTime).toISOString()
      });

      next();
    };
  }
}

// Create global instance
const rateLimiter = new InMemoryRateLimit();

// Pre-configured limiters for common use cases
export const searchSuggestionsLimiter = rateLimiter.createLimiter({
  windowMs: 60 * 1000, // 1 minute
  maxRequests: 50, // 50 requests per minute per IP
  keyGenerator: (req: Request) => `search:${req.ip}`,
  errorMessage: 'Too many search suggestions requests. Please try again in a moment.'
});

export const generalApiLimiter = rateLimiter.createLimiter({
  windowMs: 60 * 1000, // 1 minute
  maxRequests: 100, // 100 requests per minute per IP
  keyGenerator: (req: Request) => `api:${req.ip}`,
  errorMessage: 'Too many API requests. Please try again in a moment.'
});

export const strictLimiter = rateLimiter.createLimiter({
  windowMs: 60 * 1000, // 1 minute
  maxRequests: 10, // 10 requests per minute per IP
  keyGenerator: (req: Request) => `strict:${req.ip}`,
  errorMessage: 'Too many requests to this endpoint. Please try again later.'
});

export { rateLimiter };