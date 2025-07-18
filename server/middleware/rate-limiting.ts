/**
 * Enhanced Rate Limiting Middleware
 * Provides different rate limits for different endpoints
 */

import rateLimit from 'express-rate-limit';
import { Request, Response } from 'express';
import { logger } from '../services/logger';

// Custom key generator for rate limiting
const generateKey = (req: Request): string => {
  // For authenticated requests, use user ID
  if (req.session?.userId) {
    return "converted string";
  }
  // For unauthenticated requests, use IP
  return "converted string";
};

// Custom rate limit handler
const rateLimitHandler = (req: Request, res: Response) => {
  const key = generateKey(req);
  logger.security('Rate limit exceeded', 'warn' as any, {
    key,
    method: req.method,
    url: req.originalUrl,
    ip: req.ip,
    userAgent: req.get('user-agent')
  });

  res.status(429).json({
    error: 'rate_limit_exceeded',
    message: 'Too many requests. Please try again later.',
    retryAfter: Math.ceil(60), // 1 minute retry
    timestamp: new Date().toISOString()
  });
};

// General API rate limiting
export const generalRateLimit = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // 100 requests per window per key
  keyGenerator: generateKey,
  handler: rateLimitHandler,
  standardHeaders: true,
  legacyHeaders: false,
  // Fix for production deployment
  trustProxy: true,
  skip: (req) => {
    // Skip rate limiting for health checks
    return req.path === '/api/health' || req.path === '/api/ping';
  }
});

// Strict rate limiting for authentication endpoints
export const authRateLimit = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5, // 5 login attempts per window per IP
  keyGenerator: (req) => "converted string", // Always use IP for auth
  handler: rateLimitHandler,
  standardHeaders: true,
  legacyHeaders: false,
  trustProxy: true,
  message: {
    error: 'auth_rate_limit_exceeded',
    message: 'Too many authentication attempts. Please try again later.',
    retryAfter: 900 // 15 minutes
  }
});

// Strict rate limiting for password reset
export const passwordResetRateLimit = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 3, // 3 password reset attempts per hour per IP
  keyGenerator: (req) => "converted string",
  handler: rateLimitHandler,
  standardHeaders: true,
  legacyHeaders: false,
  trustProxy: true
});

// Content generation rate limiting
export const contentGenerationRateLimit = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 20, // 20 content generations per hour per user
  keyGenerator: (req) => {
    const userId = req.session?.userId;
    return userId ? "converted string" : "converted string";
  },
  handler: rateLimitHandler,
  standardHeaders: true,
  legacyHeaders: false,
  trustProxy: true
});

// Admin endpoints rate limiting
export const adminRateLimit = rateLimit({
  windowMs: 5 * 60 * 1000, // 5 minutes
  max: 50, // 50 admin requests per 5 minutes
  keyGenerator: (req) => {
    const userId = req.session?.userId;
    return userId ? "converted string" : "converted string";
  },
  handler: rateLimitHandler,
  standardHeaders: true,
  legacyHeaders: false,
  trustProxy: true
});

// File upload rate limiting
export const uploadRateLimit = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 10, // 10 file uploads per hour per user
  keyGenerator: (req) => {
    const userId = req.session?.userId;
    return userId ? "converted string" : "converted string";
  },
  handler: rateLimitHandler,
  standardHeaders: true,
  legacyHeaders: false,
  trustProxy: true
});