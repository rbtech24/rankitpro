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

// Check if user is authenticated (session-based authentication)
export const isAuthenticated = async (req: Request, res: Response, next: NextFunction) => {
  // Use session authentication as primary method
  const userId = req.session?.userId;
  
  if (!userId) {
    console.log("AUTH DEBUG: No session found - user not authenticated");
    res.setHeader('Content-Type', 'application/json');
    return res.status(401).json({ message: "Not authenticated" });
  }
  
  console.log("AUTH DEBUG: Session authentication for user:", userId);
  
  try {
    const user = await storage.getUser(userId);
    if (!user) {
      console.log("AUTH DEBUG: User not found in database for ID:", userId);
      res.setHeader('Content-Type', 'application/json');
      return res.status(401).json({ message: "User not found" });
    }
    
    console.log("AUTH DEBUG: User authenticated successfully:", user.email, "Role:", user.role);
    req.user = user;
    next();
  } catch (error) {
    console.error("AUTH MIDDLEWARE: Database error:", error);
    res.setHeader('Content-Type', 'application/json');
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
