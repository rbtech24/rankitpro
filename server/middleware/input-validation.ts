/**
 * Input Validation Middleware
 * Comprehensive input validation for all API endpoints
 */

import { Request, Response, NextFunction } from 'express';
import { z } from 'zod';
import { fromZodError } from 'zod-validation-error';
import { sanitizeText, sanitizeUrl } from '../utils/html-sanitizer';
import { logger } from '../services/logger';

export interface ValidationError {
  field: string;
  message: string;
  code: string;
}

/**
 * Common validation schemas
 */
export const commonValidationSchemas = {
  // ID validation
  id: z.coerce.number().positive(),
  
  // Email validation
  email: z.string().email().max(255),
  
  // Text validation with sanitization
  text: z.string().max(1000).transform(sanitizeText),
  shortText: z.string().max(255).transform(sanitizeText),
  longText: z.string().max(5000).transform(sanitizeText),
  
  // URL validation with sanitization
  url: z.string().url().max(2000).transform(sanitizeUrl),
  
  // Company name validation
  companyName: z.string().min(2).max(100).transform(sanitizeText),
  
  // Username validation
  username: z.string().min(3).max(50).regex(/^[a-zA-Z0-9_-]+$/),
  
  // Password validation
  password: z.string().min(8).max(128),
  
  // Business type validation
  businessType: z.enum(['service_business', 'non_service_business']),
  
  // Plan validation
  plan: z.enum(['starter', 'pro', 'agency']),
  
  // Role validation
  role: z.enum(['super_admin', 'company_admin', 'technician', 'sales_staff']),
  
  // JSON validation
  json: z.record(z.unknown()).optional(),
  
  // Boolean validation
  boolean: z.boolean(),
  
  // Pagination validation
  pagination: z.object({
    page: z.coerce.number().min(1).default(1),
    limit: z.coerce.number().min(1).max(100).default(10),
    offset: z.coerce.number().min(0).optional()
  })
};

/**
 * Company-specific validation schemas
 */
export const companyValidationSchemas = {
  create: z.object({
    name: commonValidationSchemas.companyName,
    plan: commonValidationSchemas.plan.optional(),
    businessType: commonValidationSchemas.businessType.optional(),
    usageLimit: z.number().min(1).max(1000).optional()
  }),
  
  update: z.object({
    name: commonValidationSchemas.companyName.optional(),
    plan: commonValidationSchemas.plan.optional(),
    businessType: commonValidationSchemas.businessType.optional(),
    usageLimit: z.number().min(1).max(1000).optional(),
    featuresEnabled: z.record(z.boolean()).optional()
  })
};

/**
 * User validation schemas
 */
export const userValidationSchemas = {
  create: z.object({
    email: commonValidationSchemas.email,
    username: commonValidationSchemas.username,
    password: commonValidationSchemas.password,
    role: commonValidationSchemas.role.optional(),
    companyId: commonValidationSchemas.id.optional()
  }),
  
  update: z.object({
    email: commonValidationSchemas.email.optional(),
    username: commonValidationSchemas.username.optional(),
    password: commonValidationSchemas.password.optional(),
    role: commonValidationSchemas.role.optional(),
    active: commonValidationSchemas.boolean.optional()
  }),
  
  login: z.object({
    email: commonValidationSchemas.email,
    password: z.string().min(1).max(128)
  })
};

/**
 * Check-in validation schemas
 */
export const checkInValidationSchemas = {
  create: z.object({
    technicianId: commonValidationSchemas.id,
    customerName: commonValidationSchemas.shortText,
    customerEmail: commonValidationSchemas.email.optional(),
    customerPhone: z.string().max(20).optional(),
    jobType: commonValidationSchemas.shortText,
    location: commonValidationSchemas.text.optional(),
    notes: commonValidationSchemas.longText.optional(),
    serviceType: commonValidationSchemas.shortText.optional(),
    photos: z.array(z.string().url()).optional()
  }),
  
  update: z.object({
    customerName: commonValidationSchemas.shortText.optional(),
    customerEmail: commonValidationSchemas.email.optional(),
    customerPhone: z.string().max(20).optional(),
    jobType: commonValidationSchemas.shortText.optional(),
    location: commonValidationSchemas.text.optional(),
    notes: commonValidationSchemas.longText.optional(),
    serviceType: commonValidationSchemas.shortText.optional(),
    photos: z.array(z.string().url()).optional()
  })
};

/**
 * AI content validation schemas
 */
export const aiContentValidationSchemas = {
  generateContent: z.object({
    jobType: commonValidationSchemas.shortText,
    notes: commonValidationSchemas.longText,
    location: commonValidationSchemas.text.optional(),
    technicianName: commonValidationSchemas.shortText,
    tone: z.enum(['professional', 'friendly', 'technical', 'casual']).optional(),
    length: z.enum(['short', 'medium', 'long']).optional(),
    contentType: z.enum(['blog_post', 'social_media', 'email', 'website_content']).optional(),
    targetAudience: z.enum(['homeowners', 'business_owners', 'property_managers', 'general']).optional(),
    includeKeywords: z.array(z.string().max(50)).optional(),
    seoFocus: commonValidationSchemas.boolean.optional(),
    includeCallToAction: commonValidationSchemas.boolean.optional()
  })
};

/**
 * Generic validation middleware factory
 */
export function validateInput<T extends z.ZodSchema>(schema: T, target: 'body' | 'params' | 'query' = 'body') {
  return (req: Request, res: Response, next: NextFunction) => {
    try {
      const data = target === 'body' ? req.body : 
                   target === 'params' ? req.params : 
                   req.query;
      
      const result = schema.safeParse(data);
      
      if (!result.success) {
        const validationError = fromZodError(result.error);
        
        logger.warn('Input validation failed', {
          path: req.path,
          method: req.method,
          target,
          errors: validationError.details,
          userId: req.user?.id
        });
        
        return res.status(400).json({
          message: 'Validation failed',
          errors: validationError.details.map(detail => ({
            field: detail.path.join('.'),
            message: detail.message,
            code: detail.code
          }))
        });
      }
      
      // Replace the original data with validated and sanitized data
      if (target === 'body') {
        req.body = result.data;
      } else if (target === 'params') {
        req.params = result.data;
      } else {
        req.query = result.data;
      }
      
      next();
    } catch (error) {
      logger.error('Validation middleware error', {
        path: req.path,
        method: req.method,
        error: error instanceof Error ? error.message : 'Unknown error',
        userId: req.user?.id
      });
      
      return res.status(500).json({
        message: 'Internal validation error'
      });
    }
  };
}

/**
 * Rate limiting validation
 */
export function validateRateLimit(maxRequests: number, windowMs: number = 60000) {
  const requests = new Map<string, { count: number; resetTime: number }>();
  
  return (req: Request, res: Response, next: NextFunction) => {
    const identifier = req.ip || 'unknown';
    const now = Date.now();
    
    const userRequests = requests.get(identifier);
    
    if (!userRequests || now > userRequests.resetTime) {
      requests.set(identifier, { count: 1, resetTime: now + windowMs });
      return next();
    }
    
    if (userRequests.count >= maxRequests) {
      logger.warn('Rate limit exceeded', {
        ip: req.ip,
        path: req.path,
        method: req.method,
        count: userRequests.count,
        userId: req.user?.id
      });
      
      return res.status(429).json({
        message: 'Rate limit exceeded',
        retryAfter: Math.ceil((userRequests.resetTime - now) / 1000)
      });
    }
    
    userRequests.count++;
    next();
  };
}

/**
 * File upload validation
 */
export function validateFileUpload(options: {
  maxSize?: number;
  allowedTypes?: string[];
  maxFiles?: number;
}) {
  return (req: Request, res: Response, next: NextFunction) => {
    const { maxSize = 10 * 1024 * 1024, allowedTypes = ['image/jpeg', 'image/png', 'image/webp'], maxFiles = 5 } = options;
    
    if (!req.files || Object.keys(req.files).length === 0) {
      return next();
    }
    
    const files = Array.isArray(req.files) ? req.files : Object.values(req.files).flat();
    
    if (files.length > maxFiles) {
      return res.status(400).json({
        message: `Maximum ${maxFiles} files allowed`
      });
    }
    
    for (const file of files) {
      if (file.size > maxSize) {
        return res.status(400).json({
          message: `File size must not exceed ${maxSize / (1024 * 1024)}MB`
        });
      }
      
      if (!allowedTypes.includes(file.mimetype)) {
        return res.status(400).json({
          message: `File type ${file.mimetype} not allowed. Allowed types: ${allowedTypes.join(', ')}`
        });
      }
    }
    
    next();
  };
}

/**
 * Middleware to sanitize all string inputs
 */
export function sanitizeAllInputs(req: Request, res: Response, next: NextFunction) {
  function sanitizeObject(obj: unknown): unknown {
    if (typeof obj === 'string') {
      return sanitizeText(obj);
    }
    
    if (Array.isArray(obj)) {
      return obj.map(sanitizeObject);
    }
    
    if (obj && typeof obj === 'object') {
      const sanitized: Record<string, unknown> = {};
      for (const [key, value] of Object.entries(obj)) {
        sanitized[key] = sanitizeObject(value);
      }
      return sanitized;
    }
    
    return obj;
  }
  
  if (req.body) {
    req.body = sanitizeObject(req.body);
  }
  
  if (req.query) {
    req.query = sanitizeObject(req.query);
  }
  
  next();
}

// Export validation middleware for specific endpoints
export const validateUser = {
  create: validateInput(userValidationSchemas.create),
  update: validateInput(userValidationSchemas.update),
  login: validateInput(userValidationSchemas.login)
};

export const validateCompany = {
  create: validateInput(companyValidationSchemas.create),
  update: validateInput(companyValidationSchemas.update)
};

export const validateCheckIn = {
  create: validateInput(checkInValidationSchemas.create),
  update: validateInput(checkInValidationSchemas.update)
};

export const validateAIContent = {
  generate: validateInput(aiContentValidationSchemas.generateContent)
};

export const validateParams = {
  id: validateInput(z.object({ id: commonValidationSchemas.id }), 'params')
};

export const validateQuery = {
  pagination: validateInput(commonValidationSchemas.pagination, 'query')
};