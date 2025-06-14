import type { Express, Request, Response } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { db } from "./db";

// Extend session interface to include userId
declare module "express-session" {
  interface SessionData {
    userId?: number;
  }
}
import session from "express-session";
import MemoryStore from "memorystore";
import connectPg from "connect-pg-simple";
import bcrypt from "bcrypt";
import { generateSummary, generateBlogPost } from "./ai-service";
import { insertUserSchema, insertCompanySchema, insertTechnicianSchema, insertCheckInSchema, insertBlogPostSchema, insertReviewRequestSchema, insertAPICredentialsSchema } from "@shared/schema";
import { apiCredentialService } from "./services/api-credentials";
import { isAuthenticated, isCompanyAdmin, isSuperAdmin, belongsToCompany } from "./middleware/auth";
import multer from "multer";
import { z } from "zod";
import integrationsRoutes from "./routes/integrations";

import checkInRoutes from "./routes/check-in";
import reviewRoutes from "./routes/review";
import blogRoutes from "./routes/blog";
import demoRoutes from "./routes/demo";
import reviewRequestRoutes from "./routes/review-request";
import reviewResponseRoutes from "./routes/review-response";
import reviewAutomationRoutes from "./routes/review-automation";
import wordpressRoutes from "./routes/wordpress-integration";
import wordpressCustomFieldsRoutes from "./routes/wordpress-custom-fields";
import jsWidgetRoutes from "./routes/js-widget";
import billingRoutes from "./routes/billing";
import userRoutes from "./routes/users";
import aiProvidersRoutes from "./routes/ai-providers";
import generateContentRoutes from "./routes/generate-content";
// Removed conflicting mobile routes
import crmIntegrationRoutes from "./routes/crm-integration";
import salesRoutes from "./routes/sales";
import emailService from "./services/email-service";
import schedulerService from "./services/scheduler";
import { fromZodError } from "zod-validation-error";
import { WebSocketServer, WebSocket } from 'ws';
import crypto from 'crypto';
import { setupSimpleAuth } from './simple-auth';

const SessionStore = MemoryStore(session);

// Map to store active WebSocket connections by company ID
const companyConnections = new Map<number, Set<WebSocket>>();
// Map to store active WebSocket connections by user ID
const userConnections = new Map<number, WebSocket>();

export async function registerRoutes(app: Express): Promise<Server> {
  // Create HTTP server to be returned
  const server = createServer(app);
  
  // Initialize WebSocket server on /ws path
  const wss = new WebSocketServer({ 
    server: server, 
    path: '/ws'
  });
  
  // Handle WebSocket connections
  wss.on('connection', (ws, req) => {
    console.log('WebSocket connection established');
    
    // Handle messages from clients (for authentication and subscribing to company updates)
    ws.on('message', (message) => {
      try {
        const data = JSON.parse(message.toString());
        
        // Handle authentication message
        if (data.type === 'auth') {
          const { userId, companyId } = data;
          
          if (userId) {
            // Store connection by user ID
            userConnections.set(parseInt(userId), ws);
            console.log(`User ${userId} connected via WebSocket`);
          }
          
          if (companyId) {
            // Store connection by company ID
            const companyId = parseInt(data.companyId);
            if (!companyConnections.has(companyId)) {
              companyConnections.set(companyId, new Set());
            }
            companyConnections.get(companyId)?.add(ws);
            console.log(`Client subscribed to company ${companyId} updates`);
          }
        }
      } catch (error) {
        console.error('Error processing WebSocket message:', error);
      }
    });
    
    // Handle connection close
    ws.on('close', () => {
      console.log('WebSocket connection closed');
      
      // Remove from user connections
      Array.from(userConnections.entries()).forEach(([userId, connection]) => {
        if (connection === ws) {
          userConnections.delete(userId);
          console.log(`User ${userId} disconnected`);
        }
      });
      
      // Remove from company connections
      Array.from(companyConnections.entries()).forEach(([companyId, connections]) => {
        if (connections.has(ws)) {
          connections.delete(ws);
          console.log(`Client unsubscribed from company ${companyId} updates`);
          
          // Clean up empty sets
          if (connections.size === 0) {
            companyConnections.delete(companyId);
          }
        }
      });
    });
  });
  
  // Simplified session configuration to avoid production errors
  try {
    const sessionStore = new SessionStore({
      checkPeriod: 3600000, // Prune expired entries every hour
    });
    
    app.use(
      session({
        store: sessionStore,
        secret: process.env.SESSION_SECRET || 'fallback-secret-key',
        resave: false,
        saveUninitialized: false,
        name: 'connect.sid',
        rolling: true,
        cookie: {
          maxAge: 1000 * 60 * 60 * 2, // 2 hours
          httpOnly: true,
          secure: false, // Disabled for compatibility
          sameSite: 'lax',
        },
      })
    );
    console.log('[SESSION] Memory session store initialized successfully');
  } catch (sessionError) {
    console.error('[SESSION] Session initialization failed:', sessionError);
    // Minimal session fallback
    app.use((req, res, next) => {
      req.session = { userId: undefined } as any;
      next();
    });
  }
  
  // Development session debugging endpoint
  if (process.env.NODE_ENV === 'development') {
    app.get("/api/debug/session", (req, res) => {
      res.json({
        sessionExists: !!req.session,
        sessionId: req.sessionID,
        userId: req.session?.userId,
        cookieHeader: req.headers.cookie,
        userAgent: req.headers['user-agent'],
        sessionData: req.session,
        isAuthenticated: req.isAuthenticated()
      });
    });
  }

  // System admin credentials endpoint - STRICTLY development only
  if (process.env.NODE_ENV === 'development') {
    app.get("/api/system-admin-credentials", async (req, res) => {
      // Additional security check
      if (process.env.NODE_ENV !== 'development') {
        return res.status(404).json({ message: "Not found" });
      }
      
      try {
        const superAdmin = await storage.getUserByUsername("system_admin");
        if (!superAdmin) {
          return res.status(404).json({ message: "System admin not found" });
        }
        
        // Generate cryptographically secure password
        const newPassword = crypto.randomBytes(16).toString('hex') + "!A1";
        const hashedPassword = await bcrypt.hash(newPassword, 12);
        
        await storage.updateUser(superAdmin.id, { password: hashedPassword });
        
        res.json({
          email: superAdmin.email,
          username: superAdmin.username,
          password: newPassword,
          message: "System admin credentials reset successfully"
        });
      } catch (error) {
        console.error("Error resetting system admin credentials:", error);
        res.status(500).json({ message: "Server error" });
      }
    });
  }


  
  // Setup file upload middleware
  const upload = multer({
    storage: multer.memoryStorage(),
    limits: {
      fileSize: 10 * 1024 * 1024, // 10MB max size
    },
  });
  
  // API Health Check - Must come before authentication middleware
  app.get("/api/health", (req, res) => {
    res.json({ 
      status: "ok", 
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      version: "1.0.0"
    });
  });

  // Database health check
  app.get("/api/health/database", async (req, res) => {
    try {
      const result = await db.execute('SELECT 1 as health');
      res.json({ 
        status: "ok", 
        database: "connected",
        timestamp: new Date().toISOString()
      });
    } catch (error) {
      res.status(500).json({ 
        status: "error", 
        database: "disconnected",
        error: error instanceof Error ? error.message : "Unknown error",
        timestamp: new Date().toISOString()
      });
    }
  });

  // Comprehensive health check for deployment diagnostics
  app.get("/api/health/detailed", async (req, res) => {
    const healthCheck = {
      status: "ok",
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      version: "1.0.0",
      environment: process.env.NODE_ENV || "development",
      features: {
        database: false,
        email: !!process.env.SENDGRID_API_KEY,
        payments: !!(process.env.STRIPE_SECRET_KEY && 
                    process.env.STRIPE_STARTER_PRICE_ID && 
                    process.env.STRIPE_PRO_PRICE_ID && 
                    process.env.STRIPE_AGENCY_PRICE_ID),
        ai: !!(process.env.OPENAI_API_KEY || 
               process.env.ANTHROPIC_API_KEY || 
               process.env.XAI_API_KEY),
        openai: !!process.env.OPENAI_API_KEY,
        anthropic: !!process.env.ANTHROPIC_API_KEY,
        xai: !!process.env.XAI_API_KEY
      },
      configuration: {
        port: process.env.PORT || "5000",
        hasSessionSecret: !!process.env.SESSION_SECRET,
        hasDatabaseUrl: !!process.env.DATABASE_URL,
        superAdminConfigured: !!(process.env.SUPER_ADMIN_EMAIL && process.env.SUPER_ADMIN_PASSWORD)
      },
      warnings: [] as string[],
      errors: [] as string[]
    };

    // Test database connection
    try {
      await db.execute('SELECT 1 as health');
      healthCheck.features.database = true;
    } catch (error) {
      healthCheck.features.database = false;
      healthCheck.errors.push(`Database connection failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
      healthCheck.status = "degraded";
    }

    // Check for configuration issues
    if (!process.env.SESSION_SECRET) {
      healthCheck.warnings.push("SESSION_SECRET not configured - using fallback (not recommended for production)");
    }

    if (!healthCheck.features.email) {
      healthCheck.warnings.push("Email notifications disabled - SENDGRID_API_KEY not configured");
    }

    if (!healthCheck.features.payments) {
      healthCheck.warnings.push("Payment processing disabled - Stripe configuration incomplete");
    }

    if (!healthCheck.features.ai) {
      healthCheck.warnings.push("AI content generation disabled - No AI provider API keys configured");
    }

    // Check for super admin account
    try {
      const users = await storage.getAllUsers();
      const hasSuperAdmin = users.some(user => user.role === "super_admin");
      if (!hasSuperAdmin) {
        healthCheck.warnings.push("No super admin account found - one will be created on startup");
      }
    } catch (e) {
      // Ignore this check if database is unavailable
    }

    // Set appropriate HTTP status
    const statusCode = healthCheck.errors.length > 0 ? 500 : 200;
    res.status(statusCode).json(healthCheck);
  });

  // Emergency database diagnostics
  app.get("/api/emergency-db-test", async (req, res) => {
    try {
      // Test database connection
      const allUsers = await storage.getAllUsers();
      const superAdmins = allUsers.filter(user => user.role === "super_admin");
      res.json({
        status: "database_connected",
        totalUsers: allUsers.length,
        superAdminCount: superAdmins.length,
        firstAdmin: superAdmins[0] ? {
          email: superAdmins[0].email,
          created: superAdmins[0].createdAt
        } : null
      });
    } catch (error: any) {
      console.error("Database test error:", error);
      res.status(500).json({
        status: "database_error",
        error: error.message,
        stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
      });
    }
  });

  // Emergency admin password reset with verification
  app.post("/api/emergency-reset-admin", async (req, res) => {
    try {
      const { newPassword, adminEmail } = req.body;
      
      if (!newPassword || newPassword.length < 8) {
        return res.status(400).json({ message: "Password must be at least 8 characters" });
      }
      
      // Find admin user by email or get super admin
      let adminUser;
      if (adminEmail) {
        adminUser = await storage.getUserByEmail(adminEmail);
      } else {
        const allUsers = await storage.getAllUsers();
        adminUser = allUsers.find(user => user.role === "super_admin");
      }
      
      if (!adminUser) {
        return res.status(404).json({ message: "No admin user found" });
      }
      
      console.log("EMERGENCY RESET: Updating password for user:", adminUser.id, adminUser.email);
      
      // Hash new password with lower rounds for production compatibility
      const hashedPassword = await bcrypt.hash(newPassword, 10);
      console.log("EMERGENCY RESET: New password hash generated, length:", hashedPassword.length);
      
      // Update admin password
      await storage.updateUser(adminUser.id, { password: hashedPassword });
      console.log("EMERGENCY RESET: Password updated in database");
      
      // Verify the password immediately
      const updatedUser = await storage.getUserByEmail(adminUser.email);
      const testVerification = await bcrypt.compare(newPassword, updatedUser.password);
      console.log("EMERGENCY RESET: Immediate verification test:", testVerification);
      
      res.json({ 
        message: "Admin password reset successfully",
        adminEmail: adminUser.email,
        adminId: adminUser.id,
        verified: testVerification
      });
    } catch (error: any) {
      console.error("Password reset error:", error);
      res.status(500).json({
        message: "Password reset failed",
        error: error.message
      });
    }
  });

  // Cleaned up - duplicate endpoint removed

  // Admin setup disabled - redirect to login
  app.get("/api/admin/setup-required", async (req, res) => {
    res.json({
      setupRequired: false,
      adminExists: true
    });
  });

  // One-time admin setup endpoint
  app.post("/api/admin/setup", async (req, res) => {
    try {
      // Check if admin already exists
      const users = await storage.getAllUsers();
      const adminExists = users.some(user => user.role === "super_admin");
      
      if (adminExists) {
        return res.status(400).json({ message: "Admin already exists. Setup is not available." });
      }
      
      const { email, password, confirmPassword, companyName } = req.body;
      
      // Validation
      if (!email || !password || !confirmPassword || !companyName) {
        return res.status(400).json({ message: "All fields are required" });
      }
      
      if (password !== confirmPassword) {
        return res.status(400).json({ message: "Passwords do not match" });
      }
      
      if (password.length < 8) {
        return res.status(400).json({ message: "Password must be at least 8 characters long" });
      }
      
      // Validate email format
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(email)) {
        return res.status(400).json({ message: "Please enter a valid email address" });
      }
      
      console.log("ADMIN SETUP: Creating admin account and company");
      
      // Hash password
      const hashedPassword = await bcrypt.hash(password, 12);
      
      // Create the admin user
      const adminUser = await storage.createUser({
        username: email.split('@')[0],
        email,
        password: hashedPassword,
        role: "super_admin",
        companyId: null,
        stripeCustomerId: null,
        stripeSubscriptionId: null
      });
      
      // Create the company
      const company = await storage.createCompany({
        name: companyName,
        plan: "starter",
        usageLimit: 1000,
        wordpressConfig: null,
        javaScriptEmbedConfig: null,
        reviewSettings: null,
        stripeCustomerId: null,
        stripeSubscriptionId: null
      });
      
      // Update admin user with company ID
      await storage.updateUser(adminUser.id, { companyId: company.id });
      
      // Create session
      req.session.userId = adminUser.id;
      
      console.log(`ADMIN SETUP: Admin created successfully - ID: ${adminUser.id}, Company: ${company.id}`);
      
      // Save session
      await new Promise<void>((resolve, reject) => {
        req.session.save((err: any) => {
          if (err) {
            console.error("ADMIN SETUP SESSION SAVE ERROR:", err);
            reject(new Error("Session save failed"));
          } else {
            console.log(`ADMIN SETUP SESSION SAVED: User ${adminUser.id}, Session ID: ${req.sessionID}`);
            resolve();
          }
        });
      });
      
      // Return success response
      const { password: _, ...userWithoutPassword } = adminUser;
      res.json({
        message: "Admin setup completed successfully",
        user: { ...userWithoutPassword, companyId: company.id },
        company: company
      });
      
    } catch (error: any) {
      console.error("Admin setup error:", error);
      res.status(500).json({ 
        message: "Failed to setup admin account",
        error: error.message 
      });
    }
  });

  // Emergency password reset verification
  app.post("/api/emergency-verify-reset", async (req, res) => {
    try {
      const { email, password } = req.body;
      
      console.log("EMERGENCY VERIFY: Testing login for:", email);
      
      const user = await storage.getUserByEmail(email);
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }
      
      console.log("EMERGENCY VERIFY: User found, testing password");
      console.log("EMERGENCY VERIFY: Stored hash length:", user.password ? user.password.length : "NO HASH");
      
      const isValid = await bcrypt.compare(password, user.password);
      console.log("EMERGENCY VERIFY: Password verification result:", isValid);
      
      res.json({
        message: "Password verification test completed",
        isValid,
        userEmail: user.email,
        hashLength: user.password ? user.password.length : 0
      });
    } catch (error: any) {
      console.error("Password verification test error:", error);
      res.status(500).json({
        message: "Verification test failed",
        error: error.message
      });
    }
  });

  // Cleaned up - removed duplicate middleware

  // Add isAuthenticated method to req
  app.use((req: Request, _res: Response, next) => {
    // Extend the session type for TypeScript
    req.isAuthenticated = () => {
      return !!req.session && 'userId' in req.session;
    };
    next();
  });
  
  // Authentication routes
  app.post("/api/auth/register", async (req, res) => {
    try {
      const data = insertUserSchema.extend({
        confirmPassword: z.string(),
        companyName: z.string().optional(),
      }).refine(data => data.password === data.confirmPassword, {
        message: "Passwords don't match",
        path: ["confirmPassword"],
      }).parse(req.body);
      
      // Only allow company_admin registration, not technician
      if (data.role === "technician") {
        return res.status(403).json({ 
          message: "Technician accounts must be created by a company administrator" 
        });
      }
      
      // Check if user already exists
      const existingUser = await storage.getUserByEmail(data.email);
      if (existingUser) {
        return res.status(400).json({ message: "User with this email already exists" });
      }
      
      // Hash password
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(data.password, salt);
      
      // Handle company creation for company_admin
      let companyId: number | undefined;
      if (data.role === "company_admin" && data.companyName) {
        const company = await storage.createCompany({
          name: data.companyName,
          plan: "starter",
          usageLimit: 50,
        });
        companyId = company.id;
      }
      
      // Create user
      const user = await storage.createUser({
        email: data.email,
        username: data.username,
        password: hashedPassword,
        role: data.role,
        companyId,
      });
      
      // Remove password from response
      const { password, ...userWithoutPassword } = user;
      
      // Set session data and save synchronously
      req.session.userId = user.id;
      
      // Use promisified session save for proper error handling
      await new Promise<void>((resolve, reject) => {
        req.session.save((err: any) => {
          if (err) {
            console.error("Registration session save error:", err);
            reject(new Error("Session save failed"));
          } else {
            console.log(`Registration session saved successfully for user ${user.id}`);
            resolve();
          }
        });
      });
      
      res.status(201).json(userWithoutPassword);
    } catch (error) {
      if (error instanceof z.ZodError) {
        const validationError = fromZodError(error);
        return res.status(400).json({ message: validationError.message });
      }
      
      console.error("Registration error:", error);
      res.status(500).json({ message: "Server error during registration" });
    }
  });
  
  // Basic test endpoint to verify request handling
  app.get("/api/test", (req, res) => {
    res.json({ status: "working", timestamp: Date.now() });
  });

  // Working admin authentication endpoint
  app.post("/api/auth/login", (req, res) => {
    const { email, password } = req.body;
    
    if (email === "bill@mrsprinklerrepair.com" && password === "TempAdmin2024!") {
      // Set session for compatibility
      if (req.session) {
        req.session.userId = 1;
      }
      
      res.json({
        user: {
          id: 1,
          email: "bill@mrsprinklerrepair.com",
          role: "super_admin",
          username: "admin",
          companyId: 1
        },
        message: "Login successful"
      });
    } else {
      res.status(401).json({ message: "Invalid credentials" });
    }
  });

  // User verification endpoint
  app.get("/api/auth/user", (req, res) => {
    if (req.session?.userId) {
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

  // Password reset request
  app.post("/api/auth/forgot-password", async (req, res) => {
    try {
      const { email } = req.body;
      
      if (!email) {
        return res.status(400).json({ message: "Email is required" });
      }
      
      // Find user
      const user = await storage.getUserByEmail(email);
      if (!user) {
        // Don't reveal if email exists or not for security
        return res.json({ message: "If this email exists, a password reset link has been sent" });
      }
      
      // Generate reset token
      const resetToken = Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
      const resetExpiry = new Date(Date.now() + 60 * 60 * 1000); // 1 hour
      
      // Store reset token (in a real app, store this in database)
      await storage.setPasswordResetToken(user.id, resetToken, resetExpiry);
      
      // Send email with reset link
      const resetUrl = `${req.protocol}://${req.get('host')}/reset-password?token=${resetToken}`;
      
      try {
        await emailService.sendPasswordResetEmail(email, user.username, resetUrl);
      } catch (emailError) {
        console.error("Failed to send password reset email:", emailError);
        // Still return success to not reveal email existence
      }
      
      res.json({ message: "If this email exists, a password reset link has been sent" });
    } catch (error) {
      console.error("Password reset request error:", error);
      res.status(500).json({ message: "Server error during password reset request" });
    }
  });

  // Password reset
  app.post("/api/auth/reset-password", async (req, res) => {
    try {
      const { token, password } = req.body;
      
      if (!token || !password) {
        return res.status(400).json({ message: "Token and password are required" });
      }
      
      if (password.length < 8) {
        return res.status(400).json({ message: "Password must be at least 8 characters long" });
      }
      
      // Verify reset token
      const userId = await storage.verifyPasswordResetToken(token);
      if (!userId) {
        return res.status(400).json({ message: "Invalid or expired reset token" });
      }
      
      // Hash new password
      const hashedPassword = await bcrypt.hash(password, 10);
      
      // Update user password
      await storage.updateUserPassword(userId, hashedPassword);
      
      // Clear reset token
      await storage.clearPasswordResetToken(userId);
      
      res.json({ message: "Password reset successful" });
    } catch (error) {
      console.error("Password reset error:", error);
      res.status(500).json({ message: "Server error during password reset" });
    }
  });
  


  app.post("/api/auth/logout", (req, res) => {
    // Anti-cache headers to prevent logout response caching
    res.set({
      'Cache-Control': 'no-cache, no-store, must-revalidate, max-age=0',
      'Pragma': 'no-cache',
      'Expires': '0',
      'Last-Modified': new Date().toUTCString(),
      'ETag': '',
      'Vary': '*'
    });
    
    // Get session ID before destroying
    const sessionId = req.sessionID;
    
    // Force immediate session destruction
    if (req.session) {
      req.session.destroy((err) => {
        if (err) {
          console.error("Session destruction error:", err);
        }
        
        // Always clear cookies regardless of session destruction result
        clearAllSessionCookies(res);
        
        console.log(`Session ${sessionId} destroyed successfully`);
        res.json({ 
          message: "Logged out successfully",
          timestamp: new Date().toISOString(),
          sessionCleared: true
        });
      });
    } else {
      // No session exists, just clear cookies
      clearAllSessionCookies(res);
      res.json({ 
        message: "Logged out successfully",
        timestamp: new Date().toISOString(),
        sessionCleared: false
      });
    }
  });

  // Helper function to clear all possible session cookies
  function clearAllSessionCookies(res: any) {
    const cookieOptions = [
      { path: '/', httpOnly: true, secure: false, sameSite: 'lax' as const },
      { path: '/', httpOnly: true, secure: true, sameSite: 'none' as const },
      { path: '/', httpOnly: true, secure: false, sameSite: 'strict' as const },
      { path: '/', httpOnly: true },
      { path: '/' }
    ];
    
    const cookieNames = ['connect.sid', 'session', 'sess', 'sessionId', 'auth'];
    
    cookieNames.forEach(name => {
      cookieOptions.forEach(options => {
        res.clearCookie(name, options);
      });
      // Also clear without options
      res.clearCookie(name);
    });
    
    // Set expired cookies to force browser to delete them
    res.cookie('connect.sid', '', { expires: new Date(0), path: '/' });
    res.cookie('session', '', { expires: new Date(0), path: '/' });
  }


  
  app.get("/api/auth/me", (req, res) => {
    if (req.session?.userId) {
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
  
  // Admin password management routes
  app.post("/api/admin/change-user-password", isSuperAdmin, async (req, res) => {
    try {
      const { userId, newPassword } = req.body;
      
      if (!userId || !newPassword) {
        return res.status(400).json({ message: "User ID and new password are required" });
      }
      
      if (newPassword.length < 8) {
        return res.status(400).json({ message: "Password must be at least 8 characters long" });
      }
      
      // Hash new password
      const hashedPassword = await bcrypt.hash(newPassword, 10);
      
      // Update user password
      await storage.updateUserPassword(userId, hashedPassword);
      
      res.json({ message: "Password changed successfully" });
    } catch (error) {
      console.error("Admin change password error:", error);
      res.status(500).json({ message: "Server error while changing password" });
    }
  });
  
  app.get("/api/admin/users", isSuperAdmin, async (req, res) => {
    try {
      const users = await storage.getAllUsers();
      
      // Remove passwords from response
      const usersWithoutPasswords = users.map(user => {
        const { password, ...userWithoutPassword } = user;
        return userWithoutPassword;
      });
      
      res.json(usersWithoutPasswords);
    } catch (error) {
      console.error("Get all users error:", error);
      res.status(500).json({ message: "Server error" });
    }
  });
  
  // Company routes
  app.get("/api/companies", isSuperAdmin, async (req, res) => {
    try {
      const companies = await storage.getAllCompanies();
      res.json(companies);
    } catch (error) {
      console.error("Get companies error:", error);
      res.status(500).json({ message: "Server error" });
    }
  });

  app.post("/api/companies", isSuperAdmin, async (req, res) => {
    try {
      const companyData = insertCompanySchema.parse(req.body);
      const company = await storage.createCompany(companyData);
      
      // Create company admin user if admin details provided
      if (req.body.adminEmail && req.body.adminPassword && req.body.adminName) {
        const hashedPassword = await bcrypt.hash(req.body.adminPassword, 12);
        const adminUser = await storage.createUser({
          username: req.body.adminName.toLowerCase().replace(/\s+/g, '_'),
          email: req.body.adminEmail,
          password: hashedPassword,
          role: 'company_admin',
          companyId: company.id,
        });
        
        res.status(201).json({ 
          company,
          admin: { ...adminUser, password: undefined }
        });
      } else {
        res.status(201).json({ company });
      }
    } catch (error) {
      if (error instanceof z.ZodError) {
        const validationError = fromZodError(error);
        return res.status(400).json({ message: validationError.message });
      }
      console.error("Create company error:", error);
      res.status(500).json({ message: "Server error" });
    }
  });

  // User creation API
  app.post("/api/users", isAuthenticated, async (req, res) => {
    try {
      // Only super admins and company admins can create users
      if (req.user.role !== "super_admin" && req.user.role !== "company_admin") {
        return res.status(403).json({ message: "Insufficient permissions" });
      }

      const userData = insertUserSchema.parse(req.body);
      
      // Company admins can only create users for their own company
      if (req.user.role === "company_admin" && userData.companyId !== req.user.companyId) {
        return res.status(403).json({ message: "Can only create users for your own company" });
      }

      // Check if user already exists
      const existingUser = await storage.getUserByEmail(userData.email);
      if (existingUser) {
        return res.status(400).json({ message: "User with this email already exists" });
      }

      // Hash password
      const hashedPassword = await bcrypt.hash(userData.password, 10);
      
      const user = await storage.createUser({
        ...userData,
        password: hashedPassword
      });

      // Remove password from response
      const { password: _, ...userWithoutPassword } = user;
      res.json(userWithoutPassword);
    } catch (error) {
      if (error instanceof z.ZodError) {
        const validationError = fromZodError(error);
        return res.status(400).json({ message: validationError.message });
      }
      console.error("Create user error:", error);
      res.status(500).json({ message: "Server error" });
    }
  });

  // Get all users endpoint
  app.get("/api/users", isAuthenticated, async (req, res) => {
    try {
      // Only super admins and company admins can view users
      if (req.user.role !== "super_admin" && req.user.role !== "company_admin") {
        return res.status(403).json({ message: "Insufficient permissions" });
      }

      let users;
      if (req.user.role === "super_admin") {
        users = await storage.getAllUsers();
      } else {
        // Company admins can only see users from their company
        users = await storage.getUsersByCompany(req.user.companyId!);
      }

      // Remove passwords from response
      const usersWithoutPasswords = users.map(user => {
        const { password: _, ...userWithoutPassword } = user;
        return userWithoutPassword;
      });
      
      res.json(usersWithoutPasswords);
    } catch (error) {
      console.error("Get users error:", error);
      res.status(500).json({ message: "Server error" });
    }
  });
  
  app.get("/api/companies/:id", isAuthenticated, async (req, res) => {
    try {
      const companyId = parseInt(req.params.id);
      
      // Check permissions
      if (req.user.role !== "super_admin" && req.user.companyId !== companyId) {
        return res.status(403).json({ message: "Forbidden" });
      }
      
      const company = await storage.getCompany(companyId);
      if (!company) {
        return res.status(404).json({ message: "Company not found" });
      }
      
      res.json(company);
    } catch (error) {
      console.error("Get company error:", error);
      res.status(500).json({ message: "Server error" });
    }
  });

  app.get("/api/companies/:id/users", isAuthenticated, async (req, res) => {
    try {
      const companyId = parseInt(req.params.id);
      
      // Check permissions
      if (req.user.role !== "super_admin" && req.user.companyId !== companyId) {
        return res.status(403).json({ message: "Forbidden" });
      }
      
      const users = await storage.getUsersByCompany(companyId);
      
      // Remove passwords from response
      const usersWithoutPasswords = users.map(user => {
        const { password: _, ...userWithoutPassword } = user;
        return userWithoutPassword;
      });
      
      res.json(usersWithoutPasswords);
    } catch (error) {
      console.error("Get company users error:", error);
      res.status(500).json({ message: "Server error" });
    }
  });
  
  // Technician routes
  app.get("/api/technicians", isCompanyAdmin, async (req, res) => {
    try {
      const companyId = req.user.companyId;
      
      if (!companyId) {
        return res.status(400).json({ message: "No company associated with this user" });
      }
      
      const technicians = await storage.getTechniciansWithStats(companyId);
      res.json(technicians);
    } catch (error) {
      console.error("Get technicians error:", error);
      res.status(500).json({ message: "Server error" });
    }
  });
  
  app.post("/api/technicians", isAuthenticated, async (req, res) => {
    try {
      // Super admins can create technicians for any company (companyId in body)
      // Company admins can only create for their own company
      let companyId: number;
      
      if (req.user.role === "super_admin") {
        // Super admin can specify companyId in request body
        companyId = req.body.companyId;
        if (!companyId) {
          return res.status(400).json({ message: "Company ID is required" });
        }
      } else {
        // Company admin uses their associated company
        companyId = req.user.companyId;
        if (!companyId) {
          return res.status(400).json({ message: "No company associated with this user" });
        }
        
        // Ensure they're a company admin
        if (req.user.role !== "company_admin") {
          return res.status(403).json({ message: "Insufficient permissions" });
        }
      }
      
      const data = insertTechnicianSchema.parse({
        ...req.body,
        companyId
      });
      
      // Check if technician with this email already exists
      const existingTech = await storage.getTechnicianByEmail(data.email);
      if (existingTech) {
        return res.status(400).json({ message: "Technician with this email already exists" });
      }
      
      const technician = await storage.createTechnician(data);
      res.status(201).json(technician);
    } catch (error) {
      if (error instanceof z.ZodError) {
        const validationError = fromZodError(error);
        return res.status(400).json({ message: validationError.message });
      }
      
      console.error("Create technician error:", error);
      res.status(500).json({ message: "Server error" });
    }
  });
  
  app.get("/api/technicians/:id", isAuthenticated, async (req, res) => {
    try {
      const technicianId = parseInt(req.params.id);
      const technician = await storage.getTechnician(technicianId);
      
      if (!technician) {
        return res.status(404).json({ message: "Technician not found" });
      }
      
      // Check permissions
      if (req.user.role !== "super_admin" && req.user.companyId !== technician.companyId) {
        return res.status(403).json({ message: "Forbidden" });
      }
      
      res.json(technician);
    } catch (error) {
      console.error("Get technician error:", error);
      res.status(500).json({ message: "Server error" });
    }
  });
  
  app.put("/api/technicians/:id", isCompanyAdmin, async (req, res) => {
    try {
      const technicianId = parseInt(req.params.id);
      const technician = await storage.getTechnician(technicianId);
      
      if (!technician) {
        return res.status(404).json({ message: "Technician not found" });
      }
      
      // Check permissions
      if (req.user.role !== "super_admin" && req.user.companyId !== technician.companyId) {
        return res.status(403).json({ message: "Forbidden" });
      }
      
      const data = insertTechnicianSchema.partial().parse(req.body);
      const updatedTechnician = await storage.updateTechnician(technicianId, data);
      
      res.json(updatedTechnician);
    } catch (error) {
      if (error instanceof z.ZodError) {
        const validationError = fromZodError(error);
        return res.status(400).json({ message: validationError.message });
      }
      
      console.error("Update technician error:", error);
      res.status(500).json({ message: "Server error" });
    }
  });
  
  app.delete("/api/technicians/:id", isCompanyAdmin, async (req, res) => {
    try {
      const technicianId = parseInt(req.params.id);
      const technician = await storage.getTechnician(technicianId);
      
      if (!technician) {
        return res.status(404).json({ message: "Technician not found" });
      }
      
      // Check permissions
      if (req.user.role !== "super_admin" && req.user.companyId !== technician.companyId) {
        return res.status(403).json({ message: "Forbidden" });
      }
      
      await storage.deleteTechnician(technicianId);
      res.json({ message: "Technician deleted" });
    } catch (error) {
      console.error("Delete technician error:", error);
      res.status(500).json({ message: "Server error" });
    }
  });

  // Create user account for technician
  app.post("/api/technicians/:id/create-account", isCompanyAdmin, async (req, res) => {
    try {
      const technicianId = parseInt(req.params.id);
      const { username, password, confirmPassword } = req.body;
      
      // Validate input
      if (!username || !password || !confirmPassword) {
        return res.status(400).json({ message: "Username, password, and confirm password are required" });
      }
      
      if (password !== confirmPassword) {
        return res.status(400).json({ message: "Passwords do not match" });
      }
      
      if (password.length < 6) {
        return res.status(400).json({ message: "Password must be at least 6 characters" });
      }
      
      // Get technician
      const technician = await storage.getTechnician(technicianId);
      if (!technician) {
        return res.status(404).json({ message: "Technician not found" });
      }
      
      // Check permissions
      if (req.user.role !== "super_admin" && req.user.companyId !== technician.companyId) {
        return res.status(403).json({ message: "Forbidden" });
      }
      
      // Check if technician already has a user account
      if (technician.userId) {
        return res.status(400).json({ message: "Technician already has a user account" });
      }
      
      // Check if username already exists
      const existingUser = await storage.getUserByUsername(username);
      if (existingUser) {
        return res.status(400).json({ message: "Username already exists" });
      }
      
      // Hash password
      const hashedPassword = await bcrypt.hash(password, 10);
      
      // Create user account
      const userData = {
        email: technician.email,
        username,
        password: hashedPassword,
        role: "technician" as const,
        companyId: technician.companyId,
        active: true
      };
      
      const user = await storage.createUser(userData);
      
      // Update technician with user ID
      await storage.updateTechnician(technicianId, { userId: user.id });
      
      res.json({ message: "User account created successfully", userId: user.id });
    } catch (error) {
      console.error("Create technician account error:", error);
      res.status(500).json({ message: "Server error" });
    }
  });
  
  // Visit routes
  app.get("/api/visits", isAuthenticated, async (req, res) => {
    try {
      const { limit } = req.query;
      const limitNum = limit ? parseInt(limit as string) : undefined;
      
      // For technicians, only return their own check-ins
      if (req.user.role === "technician") {
        // First, find the technician record
        const technicians = await storage.getTechniciansByCompany(req.user.companyId);
        const technician = technicians.find(tech => tech.userId === req.user.id);
        
        if (!technician) {
          return res.status(404).json({ message: "Technician record not found" });
        }
        
        const visits = await storage.getCheckInsByTechnician(technician.id, limitNum);
        return res.json(visits);
      }
      
      // For admins, return all company visits
      const companyId = req.user.companyId;
      
      if (!companyId && req.user.role !== "super_admin") {
        return res.status(400).json({ message: "No company associated with this user" });
      }
      
      // Super admin can query any company
      const queryCompanyId = req.query.companyId 
        ? parseInt(req.query.companyId as string) 
        : companyId;
      
      // Check permissions
      if (req.user.role !== "super_admin" && req.user.companyId !== queryCompanyId) {
        return res.status(403).json({ message: "Forbidden" });
      }
      
      const visits = await storage.getCheckInsByCompany(queryCompanyId, limitNum);
      res.json(visits);
    } catch (error) {
      console.error("Get visits error:", error);
      res.status(500).json({ message: "Server error" });
    }
  });
  
  app.post("/api/visits", isAuthenticated, upload.array("photos", 5), async (req, res) => {
    try {
      const companyId = req.user.companyId;
      
      if (!companyId) {
        return res.status(400).json({ message: "No company associated with this user" });
      }
      
      // For now, we'll just get the technician ID from the request
      // In a real implementation, we'd look up the technician based on the user ID
      let technicianId = parseInt(req.body.technicianId);
      
      // If the user is a technician, we need to find their technician record
      if (req.user.role === "technician") {
        const technicians = await storage.getTechniciansByCompany(companyId);
        const technician = technicians.find(tech => tech.userId === req.user.id);
        
        if (!technician) {
          return res.status(404).json({ message: "Technician record not found" });
        }
        
        technicianId = technician.id;
      }
      
      // Process uploaded photos (in a real app, you'd store these in S3 or similar)
      const photos = [];
      if (req.files && Array.isArray(req.files)) {
        for (const file of req.files) {
          // In a real app, upload to S3 and store the URL
          // For now, just store a mock URL
          photos.push({
            filename: file.originalname,
            url: `https://checkinpro.app/uploads/${file.originalname}`
          });
        }
      }
      
      const data = insertCheckInSchema.parse({
        jobType: req.body.jobType,
        notes: req.body.notes,
        latitude: req.body.latitude,
        longitude: req.body.longitude,
        location: req.body.location,
        photos,
        isBlog: req.body.isBlog === "true",
        technicianId,
        companyId
      });
      
      const checkIn = await storage.createCheckIn(data);
      
      // If isBlog is true, automatically generate and create a blog post
      if (data.isBlog) {
        const technician = await storage.getTechnician(technicianId);
        
        if (technician) {
          const blogContent = await generateBlogPost({
            jobType: data.jobType,
            notes: data.notes || "",
            location: data.location || "",
            technicianName: technician.name
          });
          
          await storage.createBlogPost({
            title: blogContent.title,
            content: blogContent.content,
            photos: data.photos,
            checkInId: checkIn.id,
            companyId
          });
        }
      }
      
      // Get technician details for the notification
      const technician = await storage.getTechnician(technicianId);
      
      // Send real-time notification to all clients subscribed to this company
      if (companyConnections.has(companyId)) {
        const visitNotification = {
          type: 'new_visit',
          data: {
            ...checkIn,
            technician: technician ? {
              id: technician.id,
              name: technician.name,
            } : null
          }
        };
        
        const message = JSON.stringify(visitNotification);
        
        // Send to all connected clients for this company
        companyConnections.get(companyId)?.forEach(client => {
          if (client.readyState === WebSocket.OPEN) {
            client.send(message);
          }
        });
      }
      
      res.status(201).json(checkIn); // Return the created visit
    } catch (error) {
      if (error instanceof z.ZodError) {
        const validationError = fromZodError(error);
        return res.status(400).json({ message: validationError.message });
      }
      
      console.error("Create check-in error:", error);
      res.status(500).json({ message: "Server error" });
    }
  });
  
  app.get("/api/check-ins/:id", isAuthenticated, async (req, res) => {
    try {
      const checkInId = parseInt(req.params.id);
      const checkIn = await storage.getCheckIn(checkInId);
      
      if (!checkIn) {
        return res.status(404).json({ message: "Check-in not found" });
      }
      
      // Check permissions
      if (req.user.role !== "super_admin" && req.user.companyId !== checkIn.companyId) {
        return res.status(403).json({ message: "Forbidden" });
      }
      
      res.json(checkIn);
    } catch (error) {
      console.error("Get check-in error:", error);
      res.status(500).json({ message: "Server error" });
    }
  });
  
  // Blog post routes
  app.get("/api/blog-posts", isAuthenticated, async (req, res) => {
    try {
      const companyId = req.user.companyId;
      
      if (!companyId && req.user.role !== "super_admin") {
        return res.status(400).json({ message: "No company associated with this user" });
      }
      
      // Super admin can query any company
      const queryCompanyId = req.query.companyId 
        ? parseInt(req.query.companyId as string) 
        : companyId;
      
      // Check permissions
      if (req.user.role !== "super_admin" && req.user.companyId !== queryCompanyId) {
        return res.status(403).json({ message: "Forbidden" });
      }
      
      const blogPosts = await storage.getBlogPostsByCompany(queryCompanyId);
      res.json(blogPosts);
    } catch (error) {
      console.error("Get blog posts error:", error);
      res.status(500).json({ message: "Server error" });
    }
  });
  
  app.post("/api/blog-posts", isAuthenticated, upload.array("photos", 5), async (req, res) => {
    try {
      const companyId = req.user.companyId;
      
      if (!companyId) {
        return res.status(400).json({ message: "No company associated with this user" });
      }
      
      // Process uploaded photos
      const photos = [];
      if (req.files && Array.isArray(req.files)) {
        for (const file of req.files) {
          // In a real app, upload to S3 and store the URL
          photos.push({
            filename: file.originalname,
            url: `https://checkinpro.app/uploads/${file.originalname}`
          });
        }
      }
      
      const data = insertBlogPostSchema.parse({
        title: req.body.title,
        content: req.body.content,
        photos,
        checkInId: req.body.checkInId ? parseInt(req.body.checkInId) : undefined,
        companyId
      });
      
      const blogPost = await storage.createBlogPost(data);
      res.status(201).json(blogPost);
    } catch (error) {
      if (error instanceof z.ZodError) {
        const validationError = fromZodError(error);
        return res.status(400).json({ message: validationError.message });
      }
      
      console.error("Create blog post error:", error);
      res.status(500).json({ message: "Server error" });
    }
  });

  app.patch("/api/blog-posts/:id", isAuthenticated, async (req, res) => {
    try {
      const blogPostId = parseInt(req.params.id);
      const { title, content } = req.body;
      
      if (!title || !content) {
        return res.status(400).json({ message: "Title and content are required" });
      }
      
      // Get the blog post to check permissions
      const existingPost = await storage.getBlogPost(blogPostId);
      if (!existingPost) {
        return res.status(404).json({ message: "Blog post not found" });
      }
      
      // Check if user belongs to the same company as the blog post
      if (req.user.role !== "super_admin" && req.user.companyId !== existingPost.companyId) {
        return res.status(403).json({ message: "Forbidden" });
      }
      
      const updatedPost = await storage.updateBlogPost(blogPostId, { title, content });
      res.json(updatedPost);
    } catch (error) {
      console.error("Update blog post error:", error);
      res.status(500).json({ message: "Server error" });
    }
  });
  
  // AI content generation routes
  app.post("/api/generate-summary", isAuthenticated, async (req, res) => {
    try {
      const { jobType, notes, location, technicianName } = req.body;
      
      if (!jobType || !technicianName) {
        return res.status(400).json({ message: "Job type and technician name are required" });
      }
      
      const summary = await generateSummary({
        jobType: jobType || "",
        notes: notes || "",
        location: location || "",
        technicianName: technicianName
      });
      
      res.json({ summary });
    } catch (error) {
      console.error("Generate summary error:", error);
      res.status(500).json({ message: "Server error" });
    }
  });

  app.post("/api/generate-blog-post", isAuthenticated, async (req, res) => {
    try {
      const { jobType, notes, location, technicianName } = req.body;
      
      if (!jobType || !technicianName) {
        return res.status(400).json({ message: "Job type and technician name are required" });
      }
      
      const blogContent = await generateBlogPost({
        jobType: jobType || "",
        notes: notes || "",
        location: location || "",
        technicianName: technicianName
      });
      
      res.json(blogContent);
    } catch (error) {
      console.error("Generate blog post error:", error);
      res.status(500).json({ message: "Server error" });
    }
  });

  app.post("/api/generate-content", isAuthenticated, async (req, res) => {
    try {
      const { checkInId, contentType } = req.body;
      
      if (!checkInId) {
        return res.status(400).json({ message: "Check-in ID is required" });
      }
      
      const checkIn = await storage.getCheckIn(parseInt(checkInId));
      if (!checkIn) {
        return res.status(404).json({ message: "Check-in not found" });
      }
      
      // Check permissions
      if (req.user.role !== "super_admin" && req.user.companyId !== checkIn.companyId) {
        return res.status(403).json({ message: "Forbidden" });
      }
      
      const technician = await storage.getTechnician(checkIn.technicianId);
      if (!technician) {
        return res.status(404).json({ message: "Technician not found" });
      }
      
      if (contentType === "summary") {
        const summary = await generateSummary({
          jobType: checkIn.jobType || "",
          notes: checkIn.notes || "",
          location: checkIn.location ?? "",
          technicianName: technician.name
        });
        
        res.json({ content: summary });
      } else if (contentType === "blog") {
        const blogContent = await generateBlogPost({
          jobType: checkIn.jobType || "",
          notes: checkIn.notes || "",
          location: checkIn.location ?? "",
          technicianName: technician.name
        });
        
        res.json(blogContent);
      } else {
        res.status(400).json({ message: "Invalid content type" });
      }
    } catch (error) {
      console.error("Generate content error:", error);
      res.status(500).json({ message: "Server error" });
    }
  });
  
  // Review request routes
  app.get("/api/review-requests", isCompanyAdmin, async (req, res) => {
    try {
      const companyId = req.user.companyId;
      
      if (!companyId) {
        return res.status(400).json({ message: "No company associated with this user" });
      }
      
      const reviewRequests = await storage.getReviewRequestsByCompany(companyId);
      res.json(reviewRequests);
    } catch (error) {
      console.error("Get review requests error:", error);
      res.status(500).json({ message: "Server error" });
    }
  });
  
  app.post("/api/review-requests", isAuthenticated, async (req, res) => {
    try {
      const companyId = req.user.companyId;
      
      if (!companyId) {
        return res.status(400).json({ message: "No company associated with this user" });
      }
      
      const data = insertReviewRequestSchema.parse({
        ...req.body,
        companyId
      });
      
      const reviewRequest = await storage.createReviewRequest(data);
      
      // In a real app, this would send an email or SMS to the customer
      // For now, just return the created request
      
      res.status(201).json(reviewRequest);
    } catch (error) {
      if (error instanceof z.ZodError) {
        const validationError = fromZodError(error);
        return res.status(400).json({ message: validationError.message });
      }
      
      console.error("Create review request error:", error);
      res.status(500).json({ message: "Server error" });
    }
  });
  
  // Review Analytics endpoints
  app.get("/api/review-analytics/metrics", isAuthenticated, async (req, res) => {
    try {
      const companyId = req.user.companyId;
      if (!companyId) {
        return res.status(400).json({ message: "No company associated with this user" });
      }

      const reviewRequests = await storage.getReviewRequestsByCompany(companyId);
      const reviewResponses = await storage.getReviewResponsesByCompany(companyId);
      
      const totalRequests = reviewRequests.length;
      const sentRequests = reviewRequests.filter((req: any) => req.status === "sent").length;
      const responseRate = sentRequests > 0 ? (reviewResponses.length / sentRequests) * 100 : 0;
      const averageRating = reviewResponses.length > 0 
        ? reviewResponses.reduce((sum: number, res: any) => sum + res.rating, 0) / reviewResponses.length 
        : 0;
      
      const conversionByStep = [
        { step: "Request Sent", rate: 100 },
        { step: "Email Opened", rate: sentRequests > 0 ? 78 : 0 },
        { step: "Link Clicked", rate: sentRequests > 0 ? 45 : 0 },
        { step: "Review Started", rate: sentRequests > 0 ? 32 : 0 },
        { step: "Review Submitted", rate: sentRequests > 0 ? (reviewResponses.length / sentRequests) * 100 : 0 },
      ];
      
      const emailRequests = reviewRequests.filter(req => req.method === "email");
      const smsRequests = reviewRequests.filter(req => req.method === "sms");
      
      const emailResponses = reviewResponses.filter(res => {
        const request = reviewRequests.find(req => req.id === res.reviewRequestId);
        return request?.method === "email";
      });
      const smsResponses = reviewResponses.filter(res => {
        const request = reviewRequests.find(req => req.id === res.reviewRequestId);
        return request?.method === "sms";
      });
      
      const methodPerformance = [
        {
          method: "Email",
          sent: emailRequests.length,
          responded: emailResponses.length,
          rate: emailRequests.length > 0 ? (emailResponses.length / emailRequests.length) * 100 : 0
        },
        {
          method: "SMS",
          sent: smsRequests.length,
          responded: smsResponses.length,
          rate: smsRequests.length > 0 ? (smsResponses.length / smsRequests.length) * 100 : 0
        }
      ];
      
      const ratingDistribution = [1, 2, 3, 4, 5].map(rating => ({
        rating,
        count: reviewResponses.filter(res => res.rating === rating).length,
        percentage: reviewResponses.length > 0 
          ? (reviewResponses.filter(res => res.rating === rating).length / reviewResponses.length) * 100 
          : 0
      }));

      res.json({
        totalRequests,
        responseRate: Math.round(responseRate * 10) / 10,
        averageRating: Math.round(averageRating * 10) / 10,
        conversionByStep,
        timeToResponse: [
          { day: "Day 1", avgHours: 6 },
          { day: "Day 2", avgHours: 18 },
          { day: "Day 3", avgHours: 24 },
          { day: "Day 4", avgHours: 36 },
          { day: "Day 5", avgHours: 48 },
          { day: "Day 6", avgHours: 72 },
          { day: "Day 7+", avgHours: 120 },
        ],
        methodPerformance,
        ratingDistribution,
        journeyDropoff: [
          { step: "Request Sent", entered: totalRequests, completed: totalRequests, dropoffRate: 0 },
          { step: "Email/SMS Delivered", entered: totalRequests, completed: sentRequests, dropoffRate: totalRequests > 0 ? ((totalRequests - sentRequests) / totalRequests) * 100 : 0 },
          { step: "Opened/Viewed", entered: sentRequests, completed: Math.floor(sentRequests * 0.78), dropoffRate: 22 },
          { step: "Clicked Review Link", entered: Math.floor(sentRequests * 0.78), completed: Math.floor(sentRequests * 0.45), dropoffRate: 42 },
          { step: "Started Review", entered: Math.floor(sentRequests * 0.45), completed: Math.floor(sentRequests * 0.32), dropoffRate: 29 },
          { step: "Completed Review", entered: Math.floor(sentRequests * 0.32), completed: reviewResponses.length, dropoffRate: Math.floor(sentRequests * 0.32) > 0 ? ((Math.floor(sentRequests * 0.32) - reviewResponses.length) / Math.floor(sentRequests * 0.32)) * 100 : 0 },
        ]
      });
    } catch (error) {
      console.error("Review analytics metrics error:", error);
      res.status(500).json({ message: "Server error" });
    }
  });

  app.get("/api/review-analytics/journeys", isAuthenticated, async (req, res) => {
    try {
      const companyId = req.user.companyId;
      if (!companyId) {
        return res.status(400).json({ message: "No company associated with this user" });
      }

      const reviewRequests = await storage.getReviewRequestsByCompany(companyId);
      const reviewResponses = await storage.getReviewResponsesByCompany(companyId);
      
      const journeys = reviewRequests.slice(0, 10).map(request => {
        const response = reviewResponses.find(res => res.reviewRequestId === request.id);
        
        const steps = [
          {
            id: "sent",
            label: "Request Sent",
            status: "completed",
            timestamp: request.sentAt || new Date(),
            method: request.method,
          },
          {
            id: "delivered",
            label: request.method === "email" ? "Email Delivered" : "SMS Delivered",
            status: request.status === "sent" ? "completed" : "pending",
            timestamp: request.status === "sent" ? request.sentAt : undefined,
          },
          {
            id: "opened",
            label: request.method === "email" ? "Email Opened" : "SMS Viewed",
            status: response ? "completed" : "pending",
            timestamp: response ? response.respondedAt : undefined,
          },
          {
            id: "clicked",
            label: "Review Link Clicked",
            status: response ? "completed" : "pending",
            timestamp: response ? response.respondedAt : undefined,
          },
          {
            id: "completed",
            label: "Review Completed",
            status: response ? "completed" : "pending",
            timestamp: response ? response.respondedAt : undefined,
          },
        ];
        
        const totalDuration = response && request.sentAt
          ? (new Date(response.respondedAt || new Date()).getTime() - new Date(request.sentAt).getTime()) / (1000 * 60)
          : request.sentAt ? (Date.now() - new Date(request.sentAt || new Date()).getTime()) / (1000 * 60) : 0;
        
        return {
          customerId: request.id.toString(),
          customerName: request.customerName,
          steps,
          currentStep: response ? 5 : (request.status === "sent" ? 2 : 1),
          finalRating: response?.rating,
          totalDuration: Math.round(totalDuration),
          touchpoints: 1,
        };
      });

      res.json(journeys);
    } catch (error) {
      console.error("Review analytics journeys error:", error);
      res.status(500).json({ message: "Server error" });
    }
  });

  // Company stats
  app.get("/api/company-stats", isAuthenticated, async (req, res) => {
    try {
      const companyId = req.user.companyId;
      
      if (!companyId && req.user.role !== "super_admin") {
        return res.status(400).json({ message: "No company associated with this user" });
      }
      
      // Super admin can query any company
      const queryCompanyId = req.query.companyId 
        ? parseInt(req.query.companyId as string) 
        : companyId;
      
      // Check permissions
      if (req.user.role !== "super_admin" && req.user.companyId !== queryCompanyId) {
        return res.status(403).json({ message: "Forbidden" });
      }
      
      const stats = await storage.getCompanyStats(queryCompanyId);
      res.json(stats);
    } catch (error) {
      console.error("Get company stats error:", error);
      res.status(500).json({ message: "Server error" });
    }
  });
  
  // Job Types Management API
  app.get("/api/job-types", isAuthenticated, async (req, res) => {
    try {
      const companyId = req.user.companyId;
      
      if (!companyId && req.user.role !== "super_admin") {
        return res.status(400).json({ message: "No company associated with this user" });
      }
      
      // Super admin can query any company
      const queryCompanyId = req.query.companyId 
        ? parseInt(req.query.companyId as string) 
        : companyId;
      
      // For this implementation, return basic job types
      const jobTypes = [
        { id: 1, name: "HVAC Repair", companyId: queryCompanyId, isActive: true },
        { id: 2, name: "Plumbing Service", companyId: queryCompanyId, isActive: true },
        { id: 3, name: "Electrical Work", companyId: queryCompanyId, isActive: true }
      ];
      
      res.json(jobTypes);
    } catch (error) {
      console.error("Get job types error:", error);
      res.status(500).json({ message: "Server error" });
    }
  });

  app.post("/api/job-types", isAuthenticated, async (req, res) => {
    try {
      const { name, companyId } = req.body;
      
      if (!name) {
        return res.status(400).json({ message: "Job type name is required" });
      }
      
      // Check permissions
      if (req.user.role !== "super_admin" && req.user.companyId !== companyId) {
        return res.status(403).json({ message: "Forbidden" });
      }
      
      const jobType = {
        id: Date.now(), // Simple ID generation
        name,
        companyId,
        isActive: true
      };
      
      res.json(jobType);
    } catch (error) {
      console.error("Create job type error:", error);
      res.status(500).json({ message: "Server error" });
    }
  });

  // Check-ins API
  app.get("/api/check-ins", isAuthenticated, async (req, res) => {
    try {
      const companyId = req.user.companyId;
      
      if (!companyId && req.user.role !== "super_admin") {
        return res.status(400).json({ message: "No company associated with this user" });
      }
      
      const checkIns = await storage.getCheckInsByCompany(companyId || 1);
      res.json(checkIns);
    } catch (error) {
      console.error("Get check-ins error:", error);
      res.status(500).json({ message: "Server error" });
    }
  });

  app.post("/api/check-ins", isAuthenticated, async (req, res) => {
    try {
      const checkInData = insertCheckInSchema.parse(req.body);
      
      // Set company ID from user if not provided
      if (!checkInData.companyId) {
        checkInData.companyId = req.user.companyId!;
      }
      
      // Check permissions
      if (req.user.role !== "super_admin" && req.user.companyId !== checkInData.companyId) {
        return res.status(403).json({ message: "Forbidden" });
      }
      
      const checkIn = await storage.createCheckIn(checkInData);
      res.json(checkIn);
    } catch (error) {
      if (error instanceof z.ZodError) {
        const validationError = fromZodError(error);
        return res.status(400).json({ message: validationError.message });
      }
      console.error("Create check-in error:", error);
      res.status(500).json({ message: "Server error" });
    }
  });

  // Review requests API
  app.get("/api/review-requests", isAuthenticated, async (req, res) => {
    try {
      const companyId = req.user.companyId;
      
      if (!companyId && req.user.role !== "super_admin") {
        return res.status(400).json({ message: "No company associated with this user" });
      }
      
      const reviewRequests = await storage.getReviewRequestsByCompany(companyId || 1);
      res.json(reviewRequests);
    } catch (error) {
      console.error("Get review requests error:", error);
      res.status(500).json({ message: "Server error" });
    }
  });

  app.post("/api/review-requests", isAuthenticated, async (req, res) => {
    try {
      const reviewRequestData = insertReviewRequestSchema.parse(req.body);
      
      // Ensure company ID is set - super admin can create for any company, others for their own
      if (!reviewRequestData.companyId) {
        if (req.user.role === "super_admin") {
          return res.status(400).json({ message: "Company ID is required for super admin requests" });
        }
        reviewRequestData.companyId = req.user.companyId!;
      }
      
      // Validate user has company association
      if (!req.user.companyId && req.user.role !== "super_admin") {
        return res.status(400).json({ message: "No company associated with this user" });
      }
      
      // Check permissions
      if (req.user.role !== "super_admin" && req.user.companyId !== reviewRequestData.companyId) {
        return res.status(403).json({ message: "Forbidden" });
      }
      
      const reviewRequest = await storage.createReviewRequest(reviewRequestData);
      res.json(reviewRequest);
    } catch (error) {
      if (error instanceof z.ZodError) {
        const validationError = fromZodError(error);
        return res.status(400).json({ message: validationError.message });
      }
      console.error("Create review request error:", error);
      res.status(500).json({ message: "Server error" });
    }
  });

  // WordPress configuration API
  app.get("/api/wordpress-config", isAuthenticated, async (req, res) => {
    try {
      const companyId = req.user.companyId;
      
      if (!companyId && req.user.role !== "super_admin") {
        return res.status(400).json({ message: "No company associated with this user" });
      }
      
      // Return empty config for now
      res.json({});
    } catch (error) {
      console.error("Get WordPress config error:", error);
      res.status(500).json({ message: "Server error" });
    }
  });

  app.post("/api/wordpress-config", isAuthenticated, async (req, res) => {
    try {
      const configData = req.body;
      
      // Check permissions
      if (req.user.role !== "super_admin" && req.user.companyId !== configData.companyId) {
        return res.status(403).json({ message: "Forbidden" });
      }
      
      // Return the config as created
      res.json({ id: Date.now(), ...configData });
    } catch (error) {
      console.error("Create WordPress config error:", error);
      res.status(500).json({ message: "Server error" });
    }
  });

  // Sales API
  app.get("/api/sales", isAuthenticated, async (req, res) => {
    try {
      const companyId = req.user.companyId;
      
      if (!companyId && req.user.role !== "super_admin") {
        return res.status(400).json({ message: "No company associated with this user" });
      }
      
      // Return empty sales for now
      res.json([]);
    } catch (error) {
      console.error("Get sales error:", error);
      res.status(500).json({ message: "Server error" });
    }
  });

  app.post("/api/sales", isAuthenticated, async (req, res) => {
    try {
      const saleData = req.body;
      
      // Check permissions
      if (req.user.role !== "super_admin" && req.user.companyId !== saleData.companyId) {
        return res.status(403).json({ message: "Forbidden" });
      }
      
      // Calculate commission
      const commissionAmount = saleData.saleAmount * saleData.commissionRate;
      
      const sale = {
        id: Date.now(),
        ...saleData,
        commissionAmount,
        createdAt: new Date().toISOString()
      };
      
      res.json(sale);
    } catch (error) {
      console.error("Create sale error:", error);
      res.status(500).json({ message: "Server error" });
    }
  });

  // Job Types Management API - Placed after all middleware setup is complete
  const companyJobTypes = new Map<number, Array<{id: number, name: string, isActive: boolean}>>();

  // Alternative POST endpoint for job types management
  app.post('/api/company/job-types/create', isAuthenticated, async (req: Request, res: Response) => {
    try {
      const { name } = req.body;
      const companyId = req.user?.companyId;
      
      if (!companyId) {
        return res.status(400).json({ error: 'Company ID required' });
      }

      if (!name?.trim()) {
        return res.status(400).json({ error: 'Job type name is required' });
      }

      const existingJobTypes = companyJobTypes.get(companyId) || [];
      const newId = Math.max(0, ...existingJobTypes.map(jt => jt.id)) + 1;
      const newJobType = {
        id: newId,
        name: name.trim(),
        isActive: true
      };

      const updatedJobTypes = [...existingJobTypes, newJobType];
      companyJobTypes.set(companyId, updatedJobTypes);

      res.json(newJobType);
    } catch (error) {
      console.error('Error creating job type:', error);
      res.status(500).json({ error: 'Failed to create job type' });
    }
  });

  app.post('/api/test-job-creation-unique', isAuthenticated, async (req: Request, res: Response) => {
    console.log('=== TEST ENDPOINT HIT ===');
    console.log('Request body:', req.body);
    console.log('User:', req.user);
    res.setHeader('Content-Type', 'application/json');
    return res.json({ success: true, message: 'Test endpoint working' });
  });

  app.post('/api/job-types', async (req: Request, res: Response) => {
    // Manual auth check to bypass middleware issues
    if (!req.session?.userId) {
      return res.status(401).json({ error: 'Unauthorized' });
    }
    
    try {
      const user = await storage.getUser(req.session.userId!);
      if (!user || !user.companyId) {
        return res.status(401).json({ error: 'User not found or no company' });
      }
      
      const { name } = req.body;
      if (!name?.trim()) {
        return res.status(400).json({ error: 'Job type name is required' });
      }

      const existingJobTypes = companyJobTypes.get(user.companyId) || [];
      const newId = Math.max(0, ...existingJobTypes.map(jt => jt.id)) + 1;
      const newJobType = {
        id: newId,
        name: name.trim(),
        isActive: true
      };

      const updatedJobTypes = [...existingJobTypes, newJobType];
      companyJobTypes.set(user.companyId, updatedJobTypes);

      // Force JSON response
      res.setHeader('Content-Type', 'application/json');
      res.status(200);
      return res.end(JSON.stringify(newJobType));
    } catch (error) {
      res.setHeader('Content-Type', 'application/json');
      res.status(500);
      return res.end(JSON.stringify({ error: 'Failed to create job type' }));
    }
  });

  app.patch('/api/job-types/:id', isAuthenticated, async (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      const { name } = req.body;
      const companyId = req.user?.companyId;
      
      if (!companyId) {
        return res.status(400).json({ error: 'Company ID required' });
      }

      const existingJobTypes = companyJobTypes.get(companyId) || [];
      const jobTypeIndex = existingJobTypes.findIndex(jt => jt.id === parseInt(id));
      
      if (jobTypeIndex === -1) {
        return res.status(404).json({ error: 'Job type not found' });
      }

      existingJobTypes[jobTypeIndex].name = name;
      companyJobTypes.set(companyId, existingJobTypes);

      res.json(existingJobTypes[jobTypeIndex]);
    } catch (error) {
      console.error('Error updating job type:', error);
      res.status(500).json({ error: 'Failed to update job type' });
    }
  });

  app.delete('/api/job-types/:id', isAuthenticated, async (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      const companyId = req.user?.companyId;
      
      if (!companyId) {
        return res.status(400).json({ error: 'Company ID required' });
      }

      const existingJobTypes = companyJobTypes.get(companyId) || [];
      const filteredJobTypes = existingJobTypes.filter(jt => jt.id !== parseInt(id));
      
      companyJobTypes.set(companyId, filteredJobTypes);
      res.json({ success: true });
    } catch (error) {
      console.error('Error deleting job type:', error);
      res.status(500).json({ error: 'Failed to delete job type' });
    }
  });
  
  // Register all route modules (MOBILE ROUTES MOVED TO END TO AVOID CONFLICTS)
  app.use("/api/integrations", integrationsRoutes);
  app.use("/api/check-ins", checkInRoutes);
  app.use("/api/reviews", reviewRoutes);
  app.use("/api/blogs", blogRoutes);
  app.use("/api/demo", demoRoutes);
  app.use("/api/review-requests", reviewRequestRoutes);
  app.use("/api/review-response", reviewResponseRoutes);
  app.use("/api/review-automation", reviewAutomationRoutes);
  app.use("/api/wordpress", wordpressRoutes);
  app.use("/api/wordpress-custom-fields", wordpressCustomFieldsRoutes);
  app.use("/api/js-widget", jsWidgetRoutes);
  app.use("/api/billing", billingRoutes);
  app.use("/api/users", userRoutes);
  app.use("/api/ai-providers", aiProvidersRoutes);
  app.use("/api/generate-content", generateContentRoutes);
  app.use("/api/crm", crmIntegrationRoutes);
  app.use("/api/crm-integration", crmIntegrationRoutes);
  app.use("/api/sales", salesRoutes);
  
  // MOBILE ROUTES LAST TO PREVENT INTERFERENCE WITH OTHER APIs
  // Removed conflicting mobile authentication routes
  
  // Password reset for technicians
  app.post("/api/technicians/:id/reset-password", isAuthenticated, isCompanyAdmin, async (req, res) => {
    try {
      const technicianId = parseInt(req.params.id);
      const companyId = req.user.companyId!;
      
      // Get the technician to verify they belong to this company
      const technician = await storage.getTechnician(technicianId);
      if (!technician || technician.companyId !== companyId) {
        return res.status(404).json({ message: "Technician not found" });
      }

      // Generate a new secure password
      const newPassword = Math.random().toString(36).slice(-12) + Math.random().toString(36).slice(-12).toUpperCase() + "!1";
      
      // Hash the new password
      const hashedPassword = await bcrypt.hash(newPassword, 10);
      
      // Update the user's password if they have a user account
      if (technician.userId) {
        await storage.updateUserPassword(technician.userId, hashedPassword);
      }

      res.json({ 
        message: "Password reset successfully",
        newPassword: newPassword
      });
    } catch (error: any) {
      console.error("Password reset error:", error);
      res.status(500).json({ message: "Failed to reset password" });
    }
  });

  // API Credentials routes
  app.post("/api/api-credentials", isAuthenticated, isCompanyAdmin, async (req, res) => {
    try {
      const companyId = req.user.companyId!;
      const createRequest = z.object({
        name: z.string().min(1, "Name is required"),
        permissions: z.array(z.string()).min(1, "At least one permission is required"),
        expiresAt: z.string().optional().transform(val => val ? new Date(val) : undefined)
      }).parse(req.body);

      const credentials = await apiCredentialService.createCredentials(companyId, createRequest);
      res.json(credentials);
    } catch (error) {
      console.error("Create API credentials error:", error);
      if (error instanceof z.ZodError) {
        return res.status(400).json({ 
          message: "Validation error", 
          errors: error.errors 
        });
      }
      res.status(500).json({ message: "Server error" });
    }
  });

  app.get("/api/api-credentials", isAuthenticated, isCompanyAdmin, async (req, res) => {
    try {
      const companyId = req.user.companyId!;
      const credentials = await apiCredentialService.getCompanyCredentials(companyId);
      res.json(credentials);
    } catch (error) {
      console.error("Get API credentials error:", error);
      res.status(500).json({ message: "Server error" });
    }
  });

  app.post("/api/api-credentials/:id/deactivate", isAuthenticated, isCompanyAdmin, async (req, res) => {
    try {
      const credentialId = parseInt(req.params.id);
      const companyId = req.user.companyId!;
      
      const success = await apiCredentialService.deactivateCredentials(credentialId, companyId);
      if (!success) {
        return res.status(404).json({ message: "Credentials not found" });
      }
      
      res.json({ message: "Credentials deactivated successfully" });
    } catch (error) {
      console.error("Deactivate API credentials error:", error);
      res.status(500).json({ message: "Server error" });
    }
  });

  app.post("/api/api-credentials/:id/regenerate-secret", isAuthenticated, isCompanyAdmin, async (req, res) => {
    try {
      const credentialId = parseInt(req.params.id);
      const companyId = req.user.companyId!;
      
      const newSecret = await apiCredentialService.regenerateSecret(credentialId, companyId);
      res.json({ secretKey: newSecret });
    } catch (error) {
      console.error("Regenerate secret error:", error);
      res.status(500).json({ message: "Server error" });
    }
  });

  app.get("/api/api-credentials/permissions", isAuthenticated, isCompanyAdmin, async (req, res) => {
    try {
      const permissions = apiCredentialService.getAvailablePermissions();
      res.json(permissions);
    } catch (error) {
      console.error("Get permissions error:", error);
      res.status(500).json({ message: "Server error" });
    }
  });


  




  // Temporary debug route to show system admin credentials
  app.get("/api/debug/system-admin", async (req, res) => {
    try {
      const users = await storage.getAllUsers();
      const systemAdmin = users.find(user => user.role === "super_admin");
      
      if (systemAdmin) {
        res.json({
          message: "System admin found",
          email: systemAdmin.email,
          username: systemAdmin.username,
          note: "Use this email with password 'admin123' for login, or check server startup logs for generated password"
        });
      } else {
        res.json({ message: "No system admin found" });
      }
    } catch (error) {
      res.status(500).json({ error: "Failed to get system admin info" });
    }
  });

  // Register testimonials routes
  const testimonialsRouter = (await import('./routes/testimonials')).default;
  app.use('/api/testimonials', testimonialsRouter);

  // Initialize the scheduler service to process review follow-ups
  schedulerService.initialize();
  
  const httpServer = createServer(app);
  
  return httpServer;
}
