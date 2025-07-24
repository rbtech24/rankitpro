/**
 * Advanced Rate Limiting Middleware
 * Enterprise-grade rate limiting with intelligent threat detection
 */

import rateLimit from 'express-rate-limit';
import type { Store } from 'express-rate-limit';
import { Request, Response, NextFunction } from 'express';
import { logger } from '../services/structured-logger';

interface RateLimitConfig {
  windowMs: number;
  max: number;
  message: string;
  standardHeaders: boolean;
  legacyHeaders: boolean;
  skipSuccessfulRequests?: boolean;
  skipFailedRequests?: boolean;
}

interface RateLimitTier {
  name: string;
  config: RateLimitConfig;
  endpoints: string[];
}

// Advanced rate limiting tiers with different protection levels
const rateLimitTiers: RateLimitTier[] = [
  {
    name: 'authentication',
    config: {
      windowMs: 15 * 60 * 1000, // 15 minutes
      max: 5, // 5 attempts per 15 minutes
      message: 'Too many authentication attempts. Please try again in 15 minutes.',
      standardHeaders: true,
      legacyHeaders: false,
      skipSuccessfulRequests: false,
      skipFailedRequests: false,
    },
    endpoints: ['/api/auth/login', '/api/auth/register', '/api/auth/forgot-password']
  },
  {
    name: 'content_generation',
    config: {
      windowMs: 60 * 60 * 1000, // 1 hour
      max: 20, // 20 content generations per hour
      message: 'Content generation limit exceeded. Upgrade your plan for higher limits.',
      standardHeaders: true,
      legacyHeaders: false,
      skipSuccessfulRequests: false,
    },
    endpoints: ['/api/generate-content', '/api/ai/*']
  },
  {
    name: 'api_access',
    config: {
      windowMs: 15 * 60 * 1000, // 15 minutes
      max: 100, // 100 requests per 15 minutes
      message: 'API rate limit exceeded. Please slow down your requests.',
      standardHeaders: true,
      legacyHeaders: false,
    },
    endpoints: ['/api/*']
  },
  {
    name: 'admin_operations',
    config: {
      windowMs: 5 * 60 * 1000, // 5 minutes
      max: 50, // 50 admin operations per 5 minutes
      message: 'Admin operation rate limit exceeded. Please wait before retrying.',
      standardHeaders: true,
      legacyHeaders: false,
    },
    endpoints: ['/api/admin/*', '/api/companies/*', '/api/billing/*']
  },
  {
    name: 'file_uploads',
    config: {
      windowMs: 60 * 60 * 1000, // 1 hour
      max: 30, // 30 file uploads per hour
      message: 'File upload limit exceeded. Please try again later.',
      standardHeaders: true,
      legacyHeaders: false,
    },
    endpoints: ['/api/upload/*', '/api/check-ins']
  }
];

// Suspicious activity patterns detection
interface SuspiciousActivity {
  ip: string;
  userAgent: string;
  endpoint: string;
  timestamp: number;
  attempts: number;
}

class ThreatDetectionService {
  private suspiciousActivities: Map<string, SuspiciousActivity> = new Map();
  private blockedIPs: Set<string> = new Set();
  private readonly cleanupInterval = 60 * 60 * 1000; // 1 hour

  constructor() {
    // Clean up old records periodically
    setInterval(() => {
      this.cleanupOldRecords();
    }, this.cleanupInterval);
  }

  detectSuspiciousActivity(req: Request): boolean {
    const ip = req.ip || req.connection.remoteAddress || 'unknown';
    const userAgent = req.get('User-Agent') || 'unknown';
    const endpoint = req.path;
    const now = Date.now();

    // Check if IP is already blocked
    if (this.blockedIPs.has(ip)) {
      logger.warn('Blocked IP attempted access', { ip, endpoint, userAgent });
      return true;
    }

    const key = `${ip}-${endpoint}`;
    const existing = this.suspiciousActivities.get(key);

    if (existing) {
      // Increment attempts
      existing.attempts++;
      existing.timestamp = now;

      // Block if too many rapid attempts
      if (existing.attempts > 50 && (now - existing.timestamp) < 60000) { // 50 attempts in 1 minute
        this.blockedIPs.add(ip);
        logger.error('IP blocked for suspicious activity', { 
          ip, 
          endpoint, 
          attempts: existing.attempts,
          timeWindow: now - existing.timestamp 
        });
        return true;
      }
    } else {
      // Create new tracking record
      this.suspiciousActivities.set(key, {
        ip,
        userAgent,
        endpoint,
        timestamp: now,
        attempts: 1
      });
    }

    return false;
  }

  private cleanupOldRecords(): void {
    const now = Date.now();
    const maxAge = 24 * 60 * 60 * 1000; // 24 hours

    for (const [key, activity] of this.suspiciousActivities.entries()) {
      if (now - activity.timestamp > maxAge) {
        this.suspiciousActivities.delete(key);
      }
    }

    logger.info('Threat detection cleanup completed', { 
      recordsRemaining: this.suspiciousActivities.size,
      blockedIPs: this.blockedIPs.size 
    });
  }

  getBlockedIPs(): string[] {
    return Array.from(this.blockedIPs);
  }

  unblockIP(ip: string): boolean {
    return this.blockedIPs.delete(ip);
  }

  getSuspiciousActivities(): SuspiciousActivity[] {
    return Array.from(this.suspiciousActivities.values());
  }
}

const threatDetection = new ThreatDetectionService();

// Dynamic rate limiting based on user subscription tier
function getDynamicRateLimit(req: Request, baseConfig: RateLimitConfig): RateLimitConfig {
  const user = (req as any).user;
  const company = (req as any).company;

  // Higher limits for paid subscribers
  if (company?.stripeSubscriptionId) {
    return {
      ...baseConfig,
      max: Math.floor(baseConfig.max * 2.5), // 2.5x higher limits for paid users
    };
  }

  // Higher limits for enterprise plans
  if (company?.subscriptionPlan === 'enterprise') {
    return {
      ...baseConfig,
      max: Math.floor(baseConfig.max * 5), // 5x higher limits for enterprise
    };
  }

  return baseConfig;
}

// Enhanced rate limiter with threat detection
function createAdvancedRateLimit(tierConfig: RateLimitTier) {
  return rateLimit({
    ...tierConfig.config,
    keyGenerator: (req: Request) => {
      const user = (req as any).user;
      const ip = req.ip || req.connection.remoteAddress || 'unknown';
      
      // Use user ID for authenticated requests, IP for anonymous
      return user ? `user:${user.id}` : `ip:${ip}`;
    },
    handler: (req: Request, res: Response) => {
      const ip = req.ip || req.connection.remoteAddress || 'unknown';
      const userAgent = req.get('User-Agent') || 'unknown';
      
      logger.warn('Rate limit exceeded', {
        ip,
        userAgent,
        endpoint: req.path,
        tier: tierConfig.name,
        user: (req as any).user?.id || 'anonymous'
      });

      res.status(429).json({
        error: 'rate_limit_exceeded',
        message: tierConfig.config.message,
        tier: tierConfig.name,
        retryAfter: Math.round(tierConfig.config.windowMs / 1000)
      });
    },
    skip: (req: Request) => {
      // Skip rate limiting for super admins
      const user = (req as any).user;
      if (user?.role === 'super_admin') {
        return true;
      }

      // Check for suspicious activity first
      if (threatDetection.detectSuspiciousActivity(req)) {
        return false; // Don't skip, let it be rate limited
      }

      return false;
    },
    // Rate limit reached callback
    standardHeaders: true,
    legacyHeaders: false
  });
}

// Middleware to apply appropriate rate limiting
export function advancedRateLimit(req: Request, res: Response, next: NextFunction) {
  // Check if IP is blocked by threat detection
  const ip = req.ip || req.connection.remoteAddress || 'unknown';
  if (threatDetection.getBlockedIPs().includes(ip)) {
    logger.warn('Blocked IP access attempt', { ip, endpoint: req.path });
    return res.status(403).json({
      error: 'ip_blocked',
      message: 'Your IP has been temporarily blocked due to suspicious activity.'
    });
  }

  // Find appropriate rate limiting tier
  const path = req.path;
  let applicableTier: RateLimitTier | null = null;

  // Check tiers in order of specificity
  for (const tier of rateLimitTiers) {
    for (const endpoint of tier.endpoints) {
      if (endpoint.endsWith('*')) {
        const prefix = endpoint.slice(0, -1);
        if (path.startsWith(prefix)) {
          applicableTier = tier;
          break;
        }
      } else if (path === endpoint) {
        applicableTier = tier;
        break;
      }
    }
    if (applicableTier) break;
  }

  if (applicableTier) {
    // Apply dynamic rate limiting based on user tier
    const dynamicConfig = getDynamicRateLimit(req, applicableTier.config);
    const rateLimiter = createAdvancedRateLimit({
      ...applicableTier,
      config: dynamicConfig
    });
    
    return rateLimiter(req, res, next);
  }

  // No specific rate limiting, continue
  next();
}

// Admin endpoints for managing rate limiting
export const rateLimitAdminRoutes = {
  getBlockedIPs: () => threatDetection.getBlockedIPs(),
  unblockIP: (ip: string) => threatDetection.unblockIP(ip),
  getSuspiciousActivities: () => threatDetection.getSuspiciousActivities(),
  getRateLimitTiers: () => rateLimitTiers.map(tier => ({
    name: tier.name,
    windowMs: tier.config.windowMs,
    max: tier.config.max,
    endpoints: tier.endpoints
  }))
};

export { threatDetection };