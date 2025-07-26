import { Request, Response, NextFunction } from "express";
import { storage } from "../storage";
import { User } from "@shared/schema";
import { logger } from "../services/logger";
import { asyncHandler } from "./error-handler";

// Extend Express Request type to include user
declare global {
  namespace Express {
    interface Request {
      user?: User;
      isAuthenticated(): boolean;
    }
  }
}

// Check if user is authenticated (session-based authentication)
export const isAuthenticated = asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
  // Use session authentication as primary method
  const userId = req.session?.userId;

  if (!userId) {
    logger.auth('Authentication failed - no session', undefined, undefined, {
      method: req.method,
      url: req.originalUrl,
      ip: req.ip,
      sessionId: req.sessionID,
      cookies: Object.keys(req.cookies || {}),
      headers: {
        cookie: req.headers.cookie ? 'present' : 'missing',
        userAgent: req.headers['user-agent']
      }
    });
    res.setHeader('Content-Type', 'application/json');
    return res.status(401).json({ message: "Not authenticated" });
  }

  const user = await storage.getUser(userId);
  if (!user) {
    logger.auth('Authentication failed - user not found', userId, undefined, {
      method: req.method,
      url: req.originalUrl,
      ip: req.ip
    });
    res.setHeader('Content-Type', 'application/json');
    return res.status(401).json({ message: "User not found" });
  }

  // Check if user is active
  if (!user.active) {
    logger.auth('Authentication failed - user inactive', userId, user.email, {
      method: req.method,
      url: req.originalUrl,
      ip: req.ip
    });
    res.setHeader('Content-Type', 'application/json');
    return res.status(401).json({ message: "Account is disabled" });
  }

  req.user = user;
  next();
});

// Check if user is super admin
export const isSuperAdmin = asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
  if (!req.session || !req.session.userId) {
    logger.security('Super admin access denied - no session', 'warn' as any, {
      method: req.method,
      url: req.originalUrl,
      ip: req.ip
    });
    return res.status(401).json({ message: "Unauthorized" });
  }

  const user = await storage.getUser(req.session.userId);
  if (!user) {
    logger.security('Super admin access denied - user not found', 'warn' as any, {
      userId: req.session.userId,
      method: req.method,
      url: req.originalUrl,
      ip: req.ip
    });
    return res.status(401).json({ message: "User not found" });
  }

  if (user.role !== "super_admin") {
    logger.security('Super admin access denied - insufficient privileges', 'warn' as any, {
      userId: user.id,
      userRole: user.role,
      method: req.method,
      url: req.originalUrl,
      ip: req.ip
    });
    return res.status(403).json({ success: true });
  }

  req.user = user;
  next();
});

// Check if user is company admin
export const isCompanyAdmin = asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
  if (!req.session || !req.session.userId) {
    logger.security('Company admin access denied - no session', 'warn' as any, {
      method: req.method,
      url: req.originalUrl,
      ip: req.ip
    });
    return res.status(401).json({ message: "Unauthorized" });
  }

  const user = await storage.getUser(req.session.userId);
  if (!user) {
    logger.security('Company admin access denied - user not found', 'warn' as any, {
      userId: req.session.userId,
      method: req.method,
      url: req.originalUrl,
      ip: req.ip
    });
    return res.status(401).json({ message: "User not found" });
  }

  if (user.role !== "company_admin" && user.role !== "super_admin") {
    logger.security('Company admin access denied - insufficient privileges', 'warn' as any, {
      userId: user.id,
      userRole: user.role,
      method: req.method,
      url: req.originalUrl,
      ip: req.ip
    });
    return res.status(403).json({ success: true });
  }

  req.user = user;
  next();
});

// Check if user belongs to company
export const belongsToCompany = (companyId: number) => {
  return async (req: Request, res: Response, next: NextFunction) => {
    if (!req.session || !req.session.userId) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    try {
      const user = await storage.getUser(req.session.userId);
      if (!user) {
        return res.status(401).json({ message: "User not found" });
      }

      // Super admins can access any company
      if (user.role === "super_admin") {
        req.user = user;
        return next();
      }

      // Check if user belongs to the specified company
      if (user.companyId !== companyId) {
        return res.status(403).json({ success: true });
      }

      req.user = user;
      next();
    } catch (error) {
      return res.status(500).json({ message: "Server error" });
    }
  };
};