import { Request, Response, NextFunction } from "express";
import { storage } from "../storage";

// Extend Express Request type to include user
declare global {
  namespace Express {
    interface Request {
      user?: any;
      isAuthenticated(): boolean;
    }
  }
}

// Check if user is authenticated (supports both JWT and session)
export const isAuthenticated = async (req: Request, res: Response, next: NextFunction) => {
  let userId: number | null = null;
  
  // Try JWT authentication first
  const token = req.cookies?.['auth-token'] || req.headers.authorization?.replace('Bearer ', '');
  if (token) {
    try {
      const jwt = require('jsonwebtoken');
      const decoded = jwt.verify(token, 'production-auth-key') as any;
      userId = decoded.userId;
      console.log("AUTH DEBUG: JWT authentication successful for user:", userId);
    } catch (jwtError: any) {
      console.log("AUTH DEBUG: JWT verification failed:", jwtError.message);
    }
  }
  
  // Fallback to session authentication
  if (!userId && req.session?.userId) {
    userId = req.session.userId;
    console.log("AUTH DEBUG: Session authentication for user:", userId);
  }
  
  if (!userId) {
    console.log("AUTH DEBUG: No valid authentication found");
    return res.status(401).json({ message: "Unauthorized" });
  }
  
  try {
    const user = await storage.getUser(userId);
    if (!user) {
      console.log("AUTH DEBUG: User not found in database for ID:", userId);
      return res.status(401).json({ message: "User not found" });
    }
    
    console.log("AUTH DEBUG: User authenticated successfully:", user.email, "Role:", user.role);
    req.user = user;
    next();
  } catch (error) {
    console.error("AUTH MIDDLEWARE: Database error:", error);
    return res.status(500).json({ message: "Server error" });
  }
};

// Check if user is super admin
export const isSuperAdmin = async (req: Request, res: Response, next: NextFunction) => {
  if (!req.session || !req.session.userId) {
    return res.status(401).json({ message: "Unauthorized" });
  }
  
  try {
    const user = await storage.getUser(req.session.userId);
    if (!user) {
      return res.status(401).json({ message: "User not found" });
    }
    
    if (user.role !== "super_admin") {
      return res.status(403).json({ message: "Forbidden: Requires super admin access" });
    }
    
    req.user = user;
    next();
  } catch (error) {
    return res.status(500).json({ message: "Server error" });
  }
};

// Check if user is company admin
export const isCompanyAdmin = async (req: Request, res: Response, next: NextFunction) => {
  if (!req.session || !req.session.userId) {
    return res.status(401).json({ message: "Unauthorized" });
  }
  
  try {
    const user = await storage.getUser(req.session.userId);
    if (!user) {
      return res.status(401).json({ message: "User not found" });
    }
    
    if (user.role !== "company_admin" && user.role !== "super_admin") {
      return res.status(403).json({ message: "Forbidden: Requires admin access" });
    }
    
    req.user = user;
    next();
  } catch (error) {
    return res.status(500).json({ message: "Server error" });
  }
};

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
        return res.status(403).json({ message: "Forbidden: You don't have access to this company" });
      }
      
      req.user = user;
      next();
    } catch (error) {
      return res.status(500).json({ message: "Server error" });
    }
  };
};
