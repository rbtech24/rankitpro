/**
 * Input Validation Middleware
 * Validates request data using Zod schemas
 */

import { Request, Response, NextFunction } from 'express';
import { z } from 'zod';
import { validationErrorHandler } from './error-handler';

export function validateBody<T extends z.ZodSchema>(schema: T) {
  return (req: Request, res: Response, next: NextFunction) => {
    try {
      const result = schema.safeParse(req.body);
      if (!result.success) {
        const error = validationErrorHandler(result.error);
        return res.status(400).json({
          error: error.code,
          message: error.message,
          details: error.details,
          timestamp: new Date().toISOString()
        });
      }
      req.body = result.data;
      next();
    } catch (error) {
      next(error);
    }
  };
}

export function validateParams<T extends z.ZodSchema>(schema: T) {
  return (req: Request, res: Response, next: NextFunction) => {
    try {
      const result = schema.safeParse(req.params);
      if (!result.success) {
        const error = validationErrorHandler(result.error);
        return res.status(400).json({
          error: error.code,
          message: error.message,
          details: error.details,
          timestamp: new Date().toISOString()
        });
      }
      req.params = result.data;
      next();
    } catch (error) {
      next(error);
    }
  };
}

export function validateQuery<T extends z.ZodSchema>(schema: T) {
  return (req: Request, res: Response, next: NextFunction) => {
    try {
      const result = schema.safeParse(req.query);
      if (!result.success) {
        const error = validationErrorHandler(result.error);
        return res.status(400).json({
          error: error.code,
          message: error.message,
          details: error.details,
          timestamp: new Date().toISOString()
        });
      }
      req.query = result.data;
      next();
    } catch (error) {
      next(error);
    }
  };
}

// Common validation schemas
export const commonSchemas = {
  // ID parameter validation
  idParam: z.object({
    id: z.string().regex(/^\d+$/).transform(Number)
  }),

  // Pagination query validation
  pagination: z.object({
    page: z.string().optional().default('1').transform(Number),
    limit: z.string().optional().default('10').transform(Number),
    sort: z.enum(['asc', 'desc']).optional().default('desc')
  }),

  // Email validation
  email: z.string().email('Invalid email format'),

  // Password validation (minimum 8 characters, at least one letter and one number)
  password: z.string().min(8, 'Password must be at least 8 characters')
    .regex(/^(?=.*[A-Za-z])(?=.*\d)/, 'Password must contain at least one letter and one number'),

  // Company slug validation
  companySlug: z.string().min(3).max(50).regex(/^[a-zA-Z0-9-]+$/, 'Invalid company slug format'),

  // File upload validation
  fileUpload: z.object({
    originalname: z.string(),
    mimetype: z.string(),
    size: z.number().max(10 * 1024 * 1024, 'File size must be less than 10MB'),
    buffer: z.instanceof(Buffer)
  })
};

// Sanitization helpers
export function sanitizeInput(input: string): string {
  if (typeof input !== 'string') return input;
  
  // Remove HTML tags and decode HTML entities
  return input
    .replace(/<[^>]*>/g, '')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&amp;/g, '&')
    .replace(/&quot;/g, '"')
    .replace(/&#x27;/g, "'")
    .trim();
}

// SQL injection prevention
export function preventSQLInjection(input: string): string {
  if (typeof input !== 'string') return input;
  
  // Remove common SQL injection patterns
  const sqlPatterns = [
    /(\b(SELECT|INSERT|UPDATE|DELETE|DROP|CREATE|ALTER|EXEC|UNION|SCRIPT)\b)/gi,
    /(\b(OR|AND)\s+\d+\s*=\s*\d+)/gi,
    /(\b(OR|AND)\s+\w+\s*=\s*\w+)/gi,
    /(--|#|\/\*|\*\/)/g,
    /('|"|`|;)/g
  ];
  
  let sanitized = input;
  sqlPatterns.forEach(pattern => {
    sanitized = sanitized.replace(pattern, '');
  });
  
  return sanitized.trim();
}

// XSS prevention
export function preventXSS(input: string): string {
  if (typeof input !== 'string') return input;
  
  // Remove potentially dangerous characters and patterns
  return input
    .replace(/[<>]/g, '')
    .replace(/javascript:/gi, '')
    .replace(/on\w+=/gi, '')
    .replace(/eval\(/gi, '')
    .replace(/expression\(/gi, '')
    .trim();
}