import type { Express } from "express";
import jwt from "jsonwebtoken";

const JWT_SECRET = process.env.JWT_SECRET || "temp-secret-key-for-auth";

export function setupSimpleAuth(app: Express) {
  // Simple login endpoint that bypasses all existing auth infrastructure
  app.post("/api/simple-login", (req, res) => {
    const { email, password } = req.body;
    
    if (email === "bill@mrsprinklerrepair.com" && password === "TempAdmin2024!") {
      const token = jwt.sign(
        { 
          id: 1, 
          email: "bill@mrsprinklerrepair.com", 
          role: "super_admin",
          username: "admin",
          companyId: 1 
        }, 
        JWT_SECRET, 
        { expiresIn: '7d' }
      );
      
      // Set both session and JWT for compatibility
      if (req.session) {
        req.session.userId = 1;
      }
      
      res.cookie('auth-token', token, { 
        httpOnly: true, 
        secure: true, 
        maxAge: 7 * 24 * 60 * 60 * 1000 
      });
      
      res.json({
        user: {
          id: 1,
          email: "bill@mrsprinklerrepair.com",
          role: "super_admin",
          username: "admin",
          companyId: 1
        },
        token,
        message: "Login successful"
      });
    } else {
      res.status(401).json({ message: "Invalid credentials" });
    }
  });

  // Simple user endpoint
  app.get("/api/simple-me", (req, res) => {
    const token = req.cookies['auth-token'] || req.headers.authorization?.replace('Bearer ', '');
    
    if (token) {
      try {
        const decoded = jwt.verify(token, JWT_SECRET) as any;
        res.json(decoded);
      } catch (error) {
        res.status(401).json({ message: "Invalid token" });
      }
    } else if (req.session?.userId) {
      res.json({
        id: 1,
        email: "bill@mrsprinklerrepair.com",
        role: "super_admin",
        username: "admin",
        companyId: 1
      });
    } else {
      res.status(401).json({ message: "Not authenticated" });
    }
  });

  // Simple logout
  app.post("/api/simple-logout", (req, res) => {
    res.clearCookie('auth-token');
    if (req.session) {
      req.session.destroy(() => {});
    }
    res.json({ message: "Logged out successfully" });
  });
}