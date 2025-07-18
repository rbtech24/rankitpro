/**
 * Centralized Error Handling Middleware
 * Provides consistent error responses and logging
 */

import { Request, Response, NextFunction } from 'express';
import { logError } from '../error-monitor';
import { z } from 'zod';

export interface ApiError extends Error {
  statusCode?: number;
  code?: string;
  details?: any;
}

// Global error handler middleware
export function errorHandler(
  error: ApiError,
  req: Request,
  res: Response,
  next: NextFunction
) {
  // Log error to monitoring system
  logError('API Error', error, {
    method: req.method,
    url: req.originalUrl,
    userAgent: req.get('user-agent'),
    ip: req.ip
  });

  // Default error response
  const statusCode = error.statusCode || 500;
  const errorResponse = {
    error: error.code || 'internal_server_error',
    message: error.message || 'Internal server error',
    timestamp: new Date().toISOString(),
    path: req.originalUrl
  };

  // Add details for development environment
  if (process.env.NODE_ENV !== 'production') {
    errorResponse.details = error.details || error.stack;
  }

  res.status(statusCode).json(errorResponse);
}

// Async error wrapper
export function asyncHandler(
  fn: (req: Request, res: Response, next: NextFunction) => Promise<any>
) {
  return (req: Request, res: Response, next: NextFunction) => {
    fn(req, res, next).catch(next);
  };
}

// Validation error handler
export function validationErrorHandler(error: z.ZodError) {
  const apiError: ApiError = new Error('Validation failed');
  apiError.statusCode = 400;
  apiError.code = 'validation_error';
  apiError.details = error.errors.map(err => ({
    field: err.path.join('.'),
    message: err.message,
    code: err.code
  }));
  return apiError;
}

// Create API error
export function createApiError(
  message: string,
  statusCode: number = 500,
  code?: string,
  details?: any
): ApiError {
  const error: ApiError = new Error(message);
  error.statusCode = statusCode;
  error.code = code;
  error.details = details;
  return error;
}

// Common error creators
export const apiErrors = {
  notFound: (resource: string) => createApiError(
    "converted string",
    404,
    'not_found'
  ),
  unauthorized: (message = 'Unauthorized') => createApiError(
    message,
    401,
    'unauthorized'
  ),
  forbidden: (message = 'Forbidden') => createApiError(
    message,
    403,
    'forbidden'
  ),
  badRequest: (message: string) => createApiError(
    message,
    400,
    'bad_request'
  ),
  conflict: (message: string) => createApiError(
    message,
    409,
    'conflict'
  ),
  rateLimited: () => createApiError(
    'Too many requests',
    429,
    'rate_limited'
  ),
  internal: (message = 'Internal server error') => createApiError(
    message,
    500,
    'internal_server_error'
  )
};