/**
 * Security Headers Middleware
 * Adds comprehensive security headers to all responses
 */

import { Request, Response, NextFunction } from 'express';
import helmet from 'helmet';

export function securityHeaders() {
  return helmet({
    contentSecurityPolicy: {
      directives: {
        defaultSrc: ["'self'"],
        styleSrc: ["'self'", "'unsafe-inline'", "https://fonts.googleapis.com"],
        fontSrc: ["'self'", "https://fonts.gstatic.com"],
        scriptSrc: [
          "'self'", 
          "'unsafe-inline'", 
          "'unsafe-eval'",
          "https://js.stripe.com",
          "https://replit.com",
          "https://*.replit.com",
          "https://basil.stripe.com",
          "https://*.replit.dev",
          "data:"
        ],
        imgSrc: ["'self'", "data:", "https:", "blob:"],
        connectSrc: [
          "'self'", 
          "ws:", 
          "wss:",
          "https://api.stripe.com",
          "https://basil.stripe.com",
          "https://*.stripe.com",
          "https://*.replit.dev",
          "https://replit.com"
        ],
        objectSrc: ["'none'"],
        mediaSrc: ["'self'"],
        frameSrc: ["'self'", "https://js.stripe.com", "https://hooks.stripe.com"],
        childSrc: ["'self'"],
        workerSrc: ["'self'"],
        manifestSrc: ["'self'"],
        formAction: ["'self'"],
        upgradeInsecureRequests: process.env.NODE_ENV === 'production' ? [] : null,
      },
    },
    crossOriginEmbedderPolicy: false, // Disabled to allow external resources
    crossOriginOpenerPolicy: false,   // Disabled to allow external resources  
    crossOriginResourcePolicy: false, // Disabled to allow external resources
    dnsPrefetchControl: true,
    frameguard: { action: 'deny' },
    hidePoweredBy: true,
    hsts: {
      maxAge: 31536000, // 1 year
      includeSubDomains: true,
      preload: true
    },
    ieNoOpen: true,
    noSniff: true,
    originAgentCluster: true,
    permittedCrossDomainPolicies: false,
    referrerPolicy: { policy: "strict-origin-when-cross-origin" },
    xssFilter: true,
  });
}

/**
 * Additional security headers middleware
 */
export function additionalSecurityHeaders(req: Request, res: Response, next: NextFunction) {
  // Allow framing for widget embedding but deny for main app
  if (req.path.startsWith('/embed') || req.path.startsWith('/widget')) {
    res.setHeader('X-Frame-Options', 'ALLOWALL');
  } else {
    res.setHeader('X-Frame-Options', 'DENY');
  }
  
  // Prevent MIME type sniffing
  res.setHeader('X-Content-Type-Options', 'nosniff');
  
  // Enable XSS protection
  res.setHeader('X-XSS-Protection', '1; mode=block');
  
  // Strict transport security (HTTPS only)
  if (process.env.NODE_ENV === 'production') {
    res.setHeader('Strict-Transport-Security', 'max-age=31536000; includeSubDomains; preload');
  }
  
  // Referrer policy
  res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
  
  // Feature policy / permissions policy - enable geolocation, camera, and payment
  // Allow geolocation and camera for mobile field app, payment for Stripe
  res.setHeader('Permissions-Policy', 'camera=*, microphone=(), geolocation=*, payment=*');
  
  // Content type options - disabled for Stripe.js compatibility
  // Cross-Origin policies disabled to allow external resources
  // res.setHeader('Cross-Origin-Opener-Policy', 'same-origin');
  // res.setHeader('Cross-Origin-Embedder-Policy', 'require-corp');
  
  // Cache control for sensitive pages
  if (req.path.startsWith('/api/') || req.path.includes('admin') || req.path.includes('auth')) {
    res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate');
    res.setHeader('Pragma', 'no-cache');
    res.setHeader('Expires', '0');
  }
  
  next();
}

/**
 * API-specific security headers
 */
export function apiSecurityHeaders(req: Request, res: Response, next: NextFunction) {
  // Force JSON placeholder type for API routes
  res.setHeader('Content-Type', 'application/json');
  
  // Prevent caching of API responses
  res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate');
  res.setHeader('Pragma', 'no-cache');
  res.setHeader('Expires', '0');
  
  // CORS headers for API
  res.setHeader('Access-Control-Allow-Origin', req.headers.origin || '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-Requested-With');
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  
  // Prevent embedding API responses
  res.setHeader('X-Frame-Options', 'DENY');
  
  next();
}