/**
 * Standardized Error Handling Middleware
 * Provides consistent error responses and logging across all routes
 */

import { Request, Response, NextFunction } from 'express';
import { logger } from '../services/logger';

export interface ApiError extends Error {
  statusCode?: number;
  code?: string;
  details?: Record<string, unknown>;
}

export class AppError extends Error implements ApiError {
  public statusCode: number;
  public code: string;
  public details?: Record<string, unknown>;
  public isOperational: boolean;

  constructor(
    message: string,
    statusCode: number = 500,
    code: string = 'INTERNAL_ERROR',
    details?: Record<string, unknown>
  ) {
    super(message);
    this.statusCode = statusCode;
    this.code = code;
    this.details = details;
    this.isOperational = true;

    Error.captureStackTrace(this, this.constructor);
  }
}

// Common error types
export class ValidationError extends AppError {
  constructor(message: string, details?: Record<string, unknown>) {
    super(message, 400, 'VALIDATION_ERROR', details);
  }
}

export class AuthenticationError extends AppError {
  constructor(message: string = 'Authentication required') {
    super(message, 401, 'AUTHENTICATION_ERROR');
  }
}

export class AuthorizationError extends AppError {
  constructor(message: string = 'Insufficient permissions') {
    super(message, 403, 'AUTHORIZATION_ERROR');
  }
}

export class NotFoundError extends AppError {
  constructor(resource: string = 'Resource') {
    super(`${resource} not found`, 404, 'NOT_FOUND');
  }
}

export class ConflictError extends AppError {
  constructor(message: string) {
    super(message, 409, 'CONFLICT');
  }
}

export class RateLimitError extends AppError {
  constructor(message: string = 'Rate limit exceeded') {
    super(message, 429, 'RATE_LIMIT_EXCEEDED');
  }
}

export class DatabaseError extends AppError {
  constructor(message: string, details?: Record<string, unknown>) {
    super(message, 500, 'DATABASE_ERROR', details);
  }
}

export class ExternalServiceError extends AppError {
  constructor(service: string, message: string) {
    super(`${service} service error: ${message}`, 502, 'EXTERNAL_SERVICE_ERROR');
  }
}

/**
 * Async error handler wrapper
 */
export function asyncHandler(fn: (req: Request, res: Response, next: NextFunction) => Promise<void>) {
  return (req: Request, res: Response, next: NextFunction) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
}

/**
 * Error response formatter
 */
function formatErrorResponse(error: ApiError, req: Request) {
  const isDevelopment = process.env.NODE_ENV === 'development';
  
  const response: Record<string, unknown> = {
    message: error.message,
    code: error.code || 'INTERNAL_ERROR',
    timestamp: new Date().toISOString(),
    path: req.path,
    method: req.method
  };

  // Add details in development or for validation errors
  if (isDevelopment || error.statusCode === 400) {
    if (error.details) {
      response.details = error.details;
    }
    
    if (isDevelopment && error.stack) {
      response.stack = error.stack;
    }
  }

  return response;
}

/**
 * Global error handling middleware
 */
export function globalErrorHandler(
  error: ApiError,
  req: Request,
  res: Response,
  next: NextFunction
) {
  // Set default values if not present
  const statusCode = error.statusCode || 500;
  const code = error.code || 'INTERNAL_ERROR';

  // Log error
  logger.error('Request error', {
    message: error.message,
    code,
    statusCode,
    path: req.path,
    method: req.method,
    userId: req.user?.id,
    ip: req.ip,
    userAgent: req.get('User-Agent'),
    stack: error.stack,
    details: error.details
  });

  // Send error response
  const response = formatErrorResponse(error, req);
  res.status(statusCode).json(response);
}

/**
 * 404 handler for unmatched routes
 */
export function notFoundHandler(req: Request, res: Response) {
  const error = new NotFoundError('API endpoint');
  
  logger.warn('Route not found', {
    path: req.path,
    method: req.method,
    userId: req.user?.id,
    ip: req.ip,
    userAgent: req.get('User-Agent')
  });

  const response = formatErrorResponse(error, req);
  res.status(404).json(response);
}

/**
 * Database operation error handler
 */
export function handleDatabaseError(error: Error & { code?: string }, operation: string): never {
  logger.error('Database operation failed', {
    operation,
    error: error.message,
    stack: error.stack,
    code: error.code
  });

  if (error.code === '23505') { // Unique constraint violation
    throw new ConflictError('Resource already exists');
  }
  
  if (error.code === '23503') { // Foreign key constraint violation
    throw new ValidationError('Invalid reference to related resource');
  }
  
  if (error.code === '23514') { // Check constraint violation
    throw new ValidationError('Data validation failed');
  }

  throw new DatabaseError(`Database operation failed: ${operation}`);
}

/**
 * External service error handler
 */
export function handleExternalServiceError(error: Error & { status?: number; statusCode?: number }, service: string): never {
  logger.error('External service error', {
    service,
    error: error.message,
    status: error.status || error.statusCode,
    stack: error.stack
  });

  throw new ExternalServiceError(service, error.message);
}

/**
 * Success response helper
 */
export function successResponse(
  res: Response,
  data: unknown,
  message?: string,
  statusCode: number = 200
) {
  const response: Record<string, unknown> = {
    success: true,
    data,
    timestamp: new Date().toISOString()
  };

  if (message) {
    response.message = message;
  }

  res.status(statusCode).json(response);
}

/**
 * Paginated response helper
 */
export function paginatedResponse(
  res: Response,
  data: unknown[],
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  },
  message?: string
) {
  const response = {
    success: true,
    data,
    pagination,
    timestamp: new Date().toISOString(),
    message
  };

  res.json(response);
}

/**
 * Created response helper
 */
export function createdResponse(res: Response, data: unknown, message?: string) {
  successResponse(res, data, message || 'Resource created successfully', 201);
}

/**
 * Updated response helper
 */
export function updatedResponse(res: Response, data: unknown, message?: string) {
  successResponse(res, data, message || 'Resource updated successfully');
}

/**
 * Deleted response helper
 */
export function deletedResponse(res: Response, message?: string) {
  successResponse(res, null, message || 'Resource deleted successfully');
}

/**
 * Validation error helper
 */
export function validationError(message: string, details?: Record<string, unknown>): never {
  throw new ValidationError(message, details);
}

/**
 * Authorization error helper
 */
export function authorizationError(message?: string): never {
  throw new AuthorizationError(message);
}

/**
 * Not found error helper
 */
export function notFoundError(resource?: string): never {
  throw new NotFoundError(resource);
}

/**
 * Database constraint error helper
 */
export function constraintError(message: string): never {
  throw new ConflictError(message);
}