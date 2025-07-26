/**
 * Authentication Routes Module
 * Extracted from main routes.ts for better maintainability
 */

import { Router } from "express";
import bcrypt from "bcrypt";
import { storage } from "../storage";
import { logger } from "../services/logger";
import { authRateLimit } from "../middleware/rate-limiting";
import { validateBody } from "../middleware/validation";
import { z } from "zod";

const router = Router();

// Login schema
const loginSchema = z.object({
  email: z.string().email("Invalid email format"),
  password: z.string().min(1, "Password is required"),
  rememberMe: z.boolean().optional()
});

// Registration schema
const registerSchema = z.object({
  email: z.string().email("Invalid email format"),
  username: z.string().min(3, "Username must be at least 3 characters"),
  password: z.string().min(8, "Password must be at least 8 characters"),
  companyName: z.string().min(1, "Company name is required"),
  plan: z.enum(["starter", "pro", "agency"]).default("starter")
});

// Login endpoint
router.post('/login', 
  authRateLimit,
  validateBody(loginSchema),
  async (req, res) => {
    try {
      const { email, password, rememberMe } = req.body;
      
      // Check if user is already logged in
      if (req.session?.userId) {
        const existingUser = await storage.getUser(req.session.userId);
        if (existingUser) {
          logger.info('Login attempt with existing session', { 
            email, 
            existingUserId: req.session.userId,
            existingUserEmail: existingUser.email,
            ip: req.ip 
          });
          
          return res.status(200).json({
            message: "You're already logged in! If you need to switch accounts, please log out first.",
            alreadyLoggedIn: true,
            currentUser: {
              email: existingUser.email,
              role: existingUser.role
            }
          });
        }
      }
      
      logger.info('Login attempt initiated', { 
        email, 
        ip: req.ip,
        userAgent: req.get('User-Agent')
      });

      // Get user by email
      const user = await storage.getUserByEmail(email);
      if (!user) {
        logger.warn('Login failed - user not found', { email, ip: req.ip });
        return res.status(401).json({ message: "Invalid credentials" });
      }

      // Check if user is active
      if (!user.active) {
        logger.warn('Login failed - user inactive', { 
          email, 
          userId: user.id,
          ip: req.ip 
        });
        return res.status(401).json({ message: "Account is deactivated" });
      }

      // Verify password
      const isPasswordValid = await bcrypt.compare(password, user.password);
      if (!isPasswordValid) {
        logger.warn('Login failed - invalid password', { 
          email, 
          userId: user.id,
          ip: req.ip 
        });
        return res.status(401).json({ message: "Invalid credentials" });
      }

      // Create session
      req.session.userId = user.id;
      
      // Set session expiry based on remember me
      if (rememberMe) {
        req.session.cookie.maxAge = 30 * 24 * 60 * 60 * 1000; // 30 days
      } else {
        req.session.cookie.maxAge = 4 * 60 * 60 * 1000; // 4 hours
      }

      logger.info('User logged in successfully', {
        userId: user.id,
        email,
        role: user.role,
        companyId: user.companyId,
        rememberMe,
        ip: req.ip
      });

      res.json({
        user: {
          id: user.id,
          email: user.email,
          username: user.username,
          role: user.role,
          companyId: user.companyId,
          active: user.active
        }
      });

    } catch (error) {
      logger.error('Login endpoint error', { 
        email: req.body.email,
        ip: req.ip,
        error: error instanceof Error ? error.message : String(error)
      });
      res.status(500).json({ message: "Internal server error" });
    }
  }
);

// Registration endpoint
router.post('/register',
  authRateLimit,
  validateBody(registerSchema),
  async (req, res) => {
    try {
      const { email, username, password, companyName, plan } = req.body;

      logger.info('Registration attempt initiated', { 
        email, 
        username,
        companyName,
        plan,
        ip: req.ip 
      });

      // Check if user already exists
      const existingUser = await storage.getUserByEmail(email);
      if (existingUser) {
        logger.warn('Registration failed - email already exists', { 
          email,
          ip: req.ip 
        });
        return res.status(400).json({ message: "Email already registered" });
      }

      const existingUsername = await storage.getUserByUsername(username);
      if (existingUsername) {
        logger.warn('Registration failed - username already exists', { 
          username,
          ip: req.ip 
        });
        return res.status(400).json({ message: "Username already taken" });
      }

      // Hash password
      const hashedPassword = await bcrypt.hash(password, 12);

      // Create company first
      const company = await storage.createCompany({
        name: companyName,
        plan,
        usageLimit: plan === "starter" ? 50 : plan === "pro" ? 200 : 1000
      });

      // Create user
      const user = await storage.createUser({
        email,
        username,
        password: hashedPassword,
        role: "company_admin",
        companyId: company.id,
        active: true
      });

      logger.info('New user and company registered', {
        userId: user.id,
        companyId: company.id,
        email,
        companyName,
        plan,
        ip: req.ip
      });

      // Auto-login after registration
      req.session.userId = user.id;

      res.status(201).json({
        user: {
          id: user.id,
          email: user.email,
          username: user.username,
          role: user.role,
          companyId: user.companyId,
          active: user.active
        }
      });

    } catch (error) {
      logger.error('Registration endpoint error', { 
        email: req.body.email,
        username: req.body.username,
        ip: req.ip,
        error: error instanceof Error ? error.message : String(error)
      });
      res.status(500).json({ message: "Server error during registration" });
    }
  }
);

// Logout endpoint
router.post('/logout', async (req, res) => {
  try {
    const userId = req.session.userId;
    
    if (userId) {
      logger.info("Operation completed");
    }

    req.session.destroy((err) => {
      if (err) {
        logger.error("Session destroy error", { error: err.message || "Unknown error" });
        return res.status(500).json({ message: "Could not log out" });
      }
      
      res.clearCookie('connect.sid');
      
      if (userId) {
        logger.info("Operation completed");
      }
      
      res.json({ message: "Logged out successfully" });
    });

  } catch (error) {
    logger.error('Logout endpoint error', { 
      userId: req.session.userId,
      ip: req.ip,
      error: error instanceof Error ? error.message : String(error)
    });
    res.status(500).json({ message: "Internal server error" });
  }
});

// Current user endpoint
router.get('/me', async (req, res) => {
  try {
    if (!req.session.userId) {
      return res.status(401).json({ message: "Not authenticated" });
    }

    // Handle super admin case
    if (req.session.userId === 1) {
      logger.debug('Super admin session validated', { 
        userId: req.session.userId,
        ip: req.ip 
      });
      
      return res.json({
        user: {
          id: 1,
          email: "bill@mrsprinklerrepair.com",
          username: "admin",
          role: "super_admin",
          companyId: 1,
          active: true
        }
      });
    }

    const user = await storage.getUser(req.session.userId);
    if (!user) {
      logger.warn('User session invalid - user not found', { 
        sessionUserId: req.session.userId,
        ip: req.ip 
      });
      return res.status(401).json({ message: "Invalid session" });
    }

    if (!user.active) {
      logger.warn('User session invalid - user inactive', { 
        userId: user.id,
        ip: req.ip 
      });
      return res.status(401).json({ message: "Account deactivated" });
    }

    logger.debug('User session validated', { 
      userId: user.id,
      role: user.role,
      ip: req.ip 
    });

    res.json({
      user: {
        id: user.id,
        email: user.email,
        username: user.username,
        role: user.role,
        companyId: user.companyId,
        active: user.active
      }
    });

  } catch (error) {
    logger.error('Current user endpoint error', { 
      sessionUserId: req.session.userId,
      ip: req.ip,
      error: error instanceof Error ? error.message : String(error)
    });
    res.status(500).json({ message: "Internal server error" });
  }
});

export default router;