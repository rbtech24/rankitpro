import type { Express, Request, Response } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { db } from "./db";
import path from "path";

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
import { enforceTrialLimits } from "./middleware/trial-enforcement";
import wordpressRoutes from "./routes/wordpress";
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
import adminRoutes from "./routes/admin";
import wordpressCustomFieldsRoutes from "./routes/wordpress-custom-fields";
import jsWidgetRoutes from "./routes/js-widget";
import billingRoutes from "./routes/billing";
import userRoutes from "./routes/users";
import aiProvidersRoutes from "./routes/ai-providers";
import generateContentRoutes from "./routes/generate-content";
// Removed conflicting mobile routes
import crmIntegrationRoutes from "./routes/crm-integration";
import salesRoutes from "./routes/sales";
import supportRoutes from "./routes/support";
import embedRoutes from "./routes/embed";
import publicBlogRoutes from "./routes/public-blog";
import publicReviewsRoutes from "./routes/public-reviews";
import publicCompanyRoutes from "./routes/public-company";
import emailService from "./services/email-service";
import schedulerService from "./services/scheduler";
import { analyticsService } from "./services/analytics-service";
import { fromZodError } from "zod-validation-error";
import { WebSocketServer, WebSocket } from 'ws';
import crypto from 'crypto';
// Removed conflicting auth modules

const SessionStore = MemoryStore(session);

// Map to store active WebSocket connections by company ID
const companyConnections = new Map<number, Set<WebSocket>>();
// Map to store active WebSocket connections by user ID
const userConnections = new Map<number, WebSocket>();

export async function registerRoutes(app: Express): Promise<Server> {
  // Configure session middleware with production-ready settings
  const isProduction = process.env.NODE_ENV === 'production';
  const sessionStore = isProduction ? 
    new (connectPg(session))({
      conString: process.env.DATABASE_URL,
      tableName: 'sessions',
      createTableIfMissing: true
    }) : 
    new SessionStore({});

  app.use(session({
    store: sessionStore,
    secret: process.env.SESSION_SECRET || 'dev-secret-key',
    resave: false,
    saveUninitialized: false,
    cookie: {
      secure: isProduction, // HTTPS only in production
      httpOnly: true,
      sameSite: 'strict',
      maxAge: isProduction ? 2 * 60 * 60 * 1000 : 24 * 60 * 60 * 1000 // 2 hours in production, 24 hours in dev
    }
  }));

  // Critical: Force API routes to bypass static file serving
  app.all('/api/*', (req, res, next) => {
    res.header('Content-Type', 'application/json');
    res.header('Cache-Control', 'no-cache, no-store, must-revalidate');
    next();
  });

  // Main login endpoint
  app.post("/api/auth/login", async (req, res) => {
    try {
      const { email, password } = req.body;
      
      if (!email || !password) {
        return res.status(400).json({ message: "Email and password are required" });
      }
      
      // Find user by email
      const user = await storage.getUserByEmail(email);
      if (!user) {
        return res.status(401).json({ message: "Invalid credentials" });
      }
      
      // Check password
      const isPasswordValid = await bcrypt.compare(password, user.password);
      if (!isPasswordValid) {
        return res.status(401).json({ message: "Invalid credentials" });
      }
      
      // Check if user is active
      if (!user.active) {
        return res.status(401).json({ message: "Account is disabled" });
      }
      
      // Set session
      req.session.userId = user.id;
      
      // Save session with promise
      await new Promise<void>((resolve, reject) => {
        req.session.save((err: any) => {
          if (err) {
            console.error("Login session save error:", err);
            reject(new Error("Session save failed"));
          } else {
            console.log("Login session saved successfully for user ${user.id}");
            resolve();
          }
        });
      });
      
      // Remove password from response
      const { password: _, ...userWithoutPassword } = user;
      
      res.json(userWithoutPassword);
    } catch (error) {
      console.error("Login error:", error);
      res.status(500).json({ message: "Server error during login" });
    }
  });
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
            console.log("User ${userId} connected via WebSocket");
          }
          
          if (companyId) {
            // Store connection by company ID
            const companyId = parseInt(data.companyId);
            if (!companyConnections.has(companyId)) {
              companyConnections.set(companyId, new Set());
            }
            companyConnections.get(companyId)?.add(ws);
            console.log("Client subscribed to company ${companyId} updates");
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
          console.log("User ${userId} disconnected");
        }
      });
      
      // Remove from company connections
      Array.from(companyConnections.entries()).forEach(([companyId, connections]) => {
        if (connections.has(ws)) {
          connections.delete(ws);
          console.log("Client unsubscribed from company ${companyId} updates");
          
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
  
  // Critical Security Middleware: Force all API routes to return JSON only
  app.use('/api', (req, res, next) => {
    // Override the end method to ensure JSON responses only
    const originalEnd = res.end;
    const originalSend = res.send;
    const originalJson = res.json;
    
    // Set JSON headers immediately
    res.setHeader('Content-Type', 'application/json');
    res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');
    
    // Override response methods to prevent HTML
    res.end = function(chunk?: any, encoding?: any) {
      if (chunk && typeof chunk === 'string' && chunk.includes('<!DOCTYPE html>')) {
        // Prevent HTML responses on API routes
        return originalJson.call(this, { 
          error: 'API endpoint not found',
          path: req.originalUrl,
          method: req.method,
          timestamp: new Date().toISOString()
        });
      }
      return originalEnd.call(this, chunk, encoding);
    };
    
    res.send = function(body?: any) {
      if (typeof body === 'string' && body.includes('<!DOCTYPE html>')) {
        // Prevent HTML responses on API routes
        return originalJson.call(this, { 
          error: 'API endpoint not found',
          path: req.originalUrl,
          method: req.method,
          timestamp: new Date().toISOString()
        });
      }
      return originalSend.call(this, body);
    };
    
    next();
  });

  // Apply trial enforcement middleware to all API routes except auth and health
  app.use('/api', (req, res, next) => {
    // Skip trial enforcement for health checks and auth endpoints
    if (req.path.startsWith('/health') || req.path.startsWith('/auth')) {
      return next();
    }
    enforceTrialLimits(req as any, res, next);
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
      healthCheck.errors.push("Database connection failed: ${error instanceof Error ? error.message : 'Unknown error'}");
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
      if (!updatedUser) {
        throw new Error("Failed to retrieve updated user");
      }
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
      
      console.log("ADMIN SETUP: Admin created successfully - ID: ${adminUser.id}, Company: ${company.id}");
      
      // Save session
      await new Promise<void>((resolve, reject) => {
        req.session.save((err: any) => {
          if (err) {
            console.error("ADMIN SETUP SESSION SAVE ERROR:", err);
            reject(new Error("Session save failed"));
          } else {
            console.log("ADMIN SETUP SESSION SAVED: User ${adminUser.id}, Session ID: ${req.sessionID}");
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

  // Job Types API endpoint
  app.get("/api/job-types", isAuthenticated, async (req, res) => {
    try {
      const user = req.user;
      if (!user || !user.companyId) {
        return res.status(400).json({ message: "Company ID required" });
      }

      const jobTypes = await storage.getJobTypesByCompany(user.companyId);
      res.json(jobTypes);
    } catch (error) {
      console.error("Error fetching job types:", error);
      res.status(500).json({ message: "Failed to fetch job types" });
    }
  });

  app.post("/api/job-types", isAuthenticated, async (req, res) => {
    try {
      const user = req.user;
      if (!user || !user.companyId) {
        return res.status(400).json({ message: "Company ID required" });
      }

      const { name, description } = req.body;
      if (!name) {
        return res.status(400).json({ message: "Job type name is required" });
      }

      const jobType = await storage.createJobType({
        name: name.trim(),
        description: description || null,
        companyId: user.companyId,
        isActive: true
      });

      res.status(201).json(jobType);
    } catch (error) {
      console.error("Error creating job type:", error);
      res.status(500).json({ message: "Failed to create job type" });
    }
  });

  app.put("/api/job-types/:id", isAuthenticated, async (req, res) => {
    try {
      const user = req.user;
      if (!user || !user.companyId) {
        return res.status(400).json({ message: "Company ID required" });
      }

      const jobTypeId = parseInt(req.params.id);
      const { name, description, isActive } = req.body;

      const updatedJobType = await storage.updateJobType(jobTypeId, {
        name: name?.trim(),
        description,
        isActive
      });

      if (!updatedJobType) {
        return res.status(404).json({ message: "Job type not found" });
      }

      res.json(updatedJobType);
    } catch (error) {
      console.error("Error updating job type:", error);
      res.status(500).json({ message: "Failed to update job type" });
    }
  });

  app.delete("/api/job-types/:id", isAuthenticated, async (req, res) => {
    try {
      const user = req.user;
      if (!user || !user.companyId) {
        return res.status(400).json({ message: "Company ID required" });
      }

      const jobTypeId = parseInt(req.params.id);
      const success = await storage.deleteJobType(jobTypeId);

      if (!success) {
        return res.status(404).json({ message: "Job type not found" });
      }

      res.json({ message: "Job type deleted successfully" });
    } catch (error) {
      console.error("Error deleting job type:", error);
      res.status(500).json({ message: "Failed to delete job type" });
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
      
      // Create user with active status
      const user = await storage.createUser({
        email: data.email,
        username: data.username,
        password: hashedPassword,
        role: data.role,
        companyId,
        active: true,
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
            console.log("Registration session saved successfully for user ${user.id}");
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

  // AI Content Generation for Check-ins
  app.post('/api/ai/generate-content', isAuthenticated, async (req: Request, res: Response) => {
    try {
      const { prompt, type, context } = req.body;
      
      if (!process.env.OPENAI_API_KEY) {
        return res.status(500).json({ error: 'AI service not configured' });
      }

      let aiPrompt = prompt;
      if (type === 'checkin' && context) {
        aiPrompt = 'Create a professional check-in summary for a ' + context.jobType + ' job at ' + context.location + '. Work performed: ' + context.workPerformed + '. Materials used: ' + context.materialsUsed + '. Generate a concise, professional summary (2-3 sentences) that could be shared with the customer and used for business documentation. Focus on the value provided and technical details.';
      }

      // Simple OpenAI integration for content generation
      const OpenAI = require('openai');
      const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

      const response = await openai.chat.completions.create({
        model: "gpt-4o", // the newest OpenAI model is "gpt-4o" which was released May 13, 2024. do not change this unless explicitly requested by the user
        messages: [{ role: "user", content: aiPrompt }],
        max_tokens: 200,
        temperature: 0.7,
      });

      const content = response.choices[0].message.content;
      
      res.json({ content });
    } catch (error) {
      console.error('AI content generation error:', error);
      res.status(500).json({ error: 'Failed to generate AI content' });
    }
  });

  // Removed duplicate authentication endpoint - using main server endpoint instead

  // User verification endpoint with trial status
  app.get("/api/auth/user", async (req, res) => {
    if (req.session?.userId) {
      try {
        const user = await storage.getUser(req.session.userId);
        if (user) {
          const { password, ...userWithoutPassword } = user;
          
          // Add trial status for company users
          if (user.companyId && user.role !== 'super_admin') {
            const { getTrialStatus } = await import('./middleware/trial-enforcement');
            const trialStatus = await getTrialStatus(user.companyId);
            (userWithoutPassword as any).trialStatus = trialStatus;
          }
          
          res.json(userWithoutPassword);
        } else {
          res.status(401).json({ message: "User not found" });
        }
      } catch (error) {
        console.error("Error fetching user:", error);
        res.status(500).json({ message: "Server error" });
      }
    } else {
      res.status(401).json({ message: "Not authenticated" });
    }
  });

  // Trial status endpoint
  app.get("/api/trial/status", isAuthenticated, async (req: any, res) => {
    try {
      if (req.user.role === 'super_admin') {
        return res.json({ subscriptionActive: true, expired: false });
      }

      if (!req.user.companyId) {
        return res.status(400).json({ error: 'No company associated with user' });
      }

      const { getTrialStatus } = await import('./middleware/trial-enforcement');
      const trialStatus = await getTrialStatus(req.user.companyId);
      
      res.json(trialStatus);
    } catch (error) {
      console.error('Error getting trial status:', error);
      res.status(500).json({ error: 'Failed to get trial status' });
    }
  });

  // Frontend compatibility endpoint
  app.get("/api/auth/me", async (req, res) => {
    if (req.session?.userId) {
      try {
        const user = await storage.getUser(req.session.userId);
        if (user) {
          const { password, ...userWithoutPassword } = user;
          
          // Get company data if user has companyId
          let company = null;
          if (user.companyId) {
            try {
              company = await storage.getCompany(user.companyId);
            } catch (error) {
              console.warn("Failed to fetch company data:", error);
            }
          }
          
          res.json({ user: userWithoutPassword, company });
        } else {
          res.status(401).json({ message: "User not found" });
        }
      } catch (error) {
        console.error("Error fetching user:", error);
        res.status(500).json({ message: "Server error" });
      }
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
      const resetUrl = "${req.protocol}://${req.get('host')}/reset-password?token=${resetToken}";
      
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
      const resetUserId = await storage.verifyPasswordResetToken(token);
      if (!resetUserId) {
        return res.status(400).json({ message: "Invalid or expired reset token" });
      }
      
      // Hash new password
      const hashedPassword = await bcrypt.hash(password, 10);
      
      // Update user password
      await storage.updateUserPassword(resetUserId, hashedPassword);
      
      // Clear reset token
      await storage.clearPasswordResetToken(resetUserId);
      
      res.json({ message: "Password reset successful" });
    } catch (error) {
      console.error("Password reset error:", error);
      res.status(500).json({ message: "Server error during password reset" });
    }
  });
  


  // GET logout route for direct navigation
  app.get("/api/auth/logout", (req, res) => {
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
        
        console.log("Session ${sessionId} destroyed successfully");
        // Redirect to home page after logout
        res.redirect('/?logged_out=true');
      });
    } else {
      // No session exists, just clear cookies and redirect
      clearAllSessionCookies(res);
      res.redirect('/?logged_out=true');
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
        
        console.log("Session ${sessionId} destroyed successfully");
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
      console.error('Error fetching company:', error);
      res.status(500).json({ error: 'Failed to fetch company data' });
    }
  });


  // Technicians routes
  app.get("/api/technicians", isAuthenticated, async (req, res) => {
    try {
      const technicians = await storage.getTechniciansByCompany(req.user.companyId);
      
      if (!technicians || !Array.isArray(technicians)) {
        return res.json([]);
      }
      
      const techniciansWithStats = technicians.map(tech => ({
        id: tech.id,
        name: tech.name || '',
        email: tech.email || '',
        phone: tech.phone || '',
        specialty: tech.specialty || '',
        location: tech.location || '',
        active: tech.active !== false,
        companyId: tech.companyId,
        userId: tech.userId || null,
        createdAt: tech.createdAt,
        checkinsCount: 0,
        reviewsCount: 0,
        rating: 0
      }));
      
      res.json(techniciansWithStats);
    } catch (error) {
      console.error("Error fetching technicians:", error);
      res.status(500).json({ message: "Server error" });
    }
  });

  // Create technician
  app.post("/api/technicians", isAuthenticated, isCompanyAdmin, async (req, res) => {
    try {
      const { name, email, phone, specialty, location, city, state, password } = req.body;
      
      // Validate required fields
      if (!name || !email || !phone || !city || !state) {
        return res.status(400).json({ message: "Name, email, phone, city, and state are required" });
      }
      
      // Check if email already exists
      const existingUser = await storage.getUserByEmail(email);
      if (existingUser) {
        return res.status(400).json({ message: "Email already in use" });
      }
      
      // Combine city and state for location if location not provided
      const techLocation = location || `${city}, ${state}`;
      
      // Create technician
      const technicianData = {
        name,
        email,
        phone,
        specialty: specialty || null,
        location: techLocation,
        companyId: req.user.companyId,
        active: true
      };
      
      const technician = await storage.createTechnician(technicianData);
      
      // Create user account if password provided
      if (password) {
        const hashedPassword = await bcrypt.hash(password, 10);
        const userData = {
          email,
          username: email,
          password: hashedPassword,
          role: 'technician' as const,
          companyId: req.user.companyId
        };
        
        const user = await storage.createUser(userData);
        
        // Update technician with user ID
        await storage.updateTechnician(technician.id, { userId: user.id });
      }
      
      res.status(201).json(technician);
    } catch (error) {
      console.error("Error creating technician:", error);
      res.status(500).json({ message: "Server error" });
    }
  });

  // Update technician
  app.put("/api/technicians/:id", isAuthenticated, isCompanyAdmin, async (req, res) => {
    try {
      const technicianId = parseInt(req.params.id);
      const { name, email, phone, specialty, location, city, state } = req.body;
      
      // Validate required fields
      if (!name || !email || !phone || !city || !state) {
        return res.status(400).json({ message: "Name, email, phone, city, and state are required" });
      }
      
      // Check if technician exists and belongs to company
      const existingTechnician = await storage.getTechnician(technicianId);
      if (!existingTechnician || existingTechnician.companyId !== req.user.companyId) {
        return res.status(404).json({ message: "Technician not found" });
      }
      
      // Combine city and state for location if location not provided
      const techLocation = location || `${city}, ${state}`;
      
      const updates = {
        name,
        email,
        phone,
        specialty: specialty || null,
        location: techLocation
      };
      
      const updatedTechnician = await storage.updateTechnician(technicianId, updates);
      
      if (!updatedTechnician) {
        return res.status(404).json({ message: "Technician not found" });
      }
      
      res.json(updatedTechnician);
    } catch (error) {
      console.error("Error updating technician:", error);
      res.status(500).json({ message: "Server error" });
    }
  });

  // Reset technician password
  app.post("/api/technicians/:id/reset-password", isAuthenticated, isCompanyAdmin, async (req, res) => {
    try {
      const technicianId = parseInt(req.params.id);
      
      // Check if technician exists and belongs to company
      const technician = await storage.getTechnician(technicianId);
      if (!technician || technician.companyId !== req.user.companyId) {
        return res.status(404).json({ message: "Technician not found" });
      }
      
      // Generate new password
      const newPassword = Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
      const hashedPassword = await bcrypt.hash(newPassword, 10);
      
      // Update user password if technician has a user account
      if (technician.userId) {
        await storage.updateUser(technician.userId, { password: hashedPassword });
      }
      
      res.json({ newPassword });
    } catch (error) {
      console.error("Error resetting technician password:", error);
      res.status(500).json({ message: "Server error" });
    }
  });

  // CRM Integration routes
  app.get("/api/crm/available", isAuthenticated, async (req, res) => {
    try {
      const availableCRMs = [
        {
          id: 'hubspot',
          name: 'HubSpot',
          description: 'Full-featured CRM with marketing automation',
          isConnected: false,
          features: ['Contact Management', 'Deal Tracking', 'Email Marketing']
        },
        {
          id: 'salesforce',
          name: 'Salesforce',
          description: 'Enterprise-grade CRM solution',
          isConnected: false,
          features: ['Lead Management', 'Opportunity Tracking', 'Reporting']
        },
        {
          id: 'pipedrive',
          name: 'Pipedrive',
          description: 'Sales-focused CRM for growing businesses',
          isConnected: false,
          features: ['Pipeline Management', 'Activity Tracking', 'Sales Reports']
        }
      ];
      
      res.json(availableCRMs);
    } catch (error) {
      console.error("Error fetching available CRMs:", error);
      res.status(500).json({ message: "Server error" });
    }
  });

  app.get("/api/crm/configured", isAuthenticated, async (req, res) => {
    try {
      const company = await storage.getCompany(req.user.companyId);
      
      if (!company || !company.crmIntegrations) {
        return res.json([]);
      }
      
      let crmConfigs = [];
      try {
        crmConfigs = JSON.parse(company.crmIntegrations);
      } catch (parseError) {
        console.error("Error parsing CRM integrations:", parseError);
        return res.json([]);
      }
      
      res.json(crmConfigs || []);
    } catch (error) {
      console.error("Error fetching configured CRMs:", error);
      res.status(500).json({ message: "Server error" });
    }
  });

  app.get("/api/crm/sync-history", isAuthenticated, async (req, res) => {
    try {
      const company = await storage.getCompany(req.user.companyId);
      
      if (!company || !company.crmSyncHistory) {
        return res.json([]);
      }
      
      let syncHistory = [];
      try {
        syncHistory = JSON.parse(company.crmSyncHistory);
      } catch (parseError) {
        console.error("Error parsing CRM sync history:", parseError);
        return res.json([]);
      }
      
      res.json(syncHistory || []);
    } catch (error) {
      console.error("Error fetching CRM sync history:", error);
      res.status(500).json({ message: "Server error" });
    }
  });

  // Public API routes for website widgets (no authentication required)
  app.get("/api/public/check-ins", async (req, res) => {
    try {
      const { company_id, limit = 10 } = req.query;
      
      if (!company_id) {
        return res.status(400).json({ message: "Company ID is required" });
      }
      
      const checkIns = await storage.getCheckInsByCompany(parseInt(company_id as string), parseInt(limit as string));
      
      // Format for public widget display
      const formattedCheckIns = checkIns.map(checkin => ({
        id: checkin.id,
        jobType: checkin.jobType || 'Service Call',
        customerName: checkin.customerName || 'Professional Service',
        location: checkin.location || checkin.city || 'Service Location',
        notes: checkin.notes || checkin.workPerformed || 'Quality service completed by our professional team.',
        photos: checkin.photos || [],
        createdAt: checkin.createdAt,
        completed: true,
        technicianName: 'Professional Technician'
      }));
      
      res.json(formattedCheckIns);
    } catch (error) {
      console.error("Error fetching public check-ins:", error);
      res.status(500).json({ message: "Server error" });
    }
  });

  // Register WordPress routes for plugin functionality
  app.use("/api/wordpress", wordpressRoutes);
  
  // Register integrations routes
  app.use("/api/integration", integrationsRoutes);
  
  // Register admin routes for subscription management
  app.use("/api/admin", adminRoutes);
  
  // Company stats endpoint
  app.get("/api/company-stats", isAuthenticated, async (req, res) => {
    try {
      const companyId = req.user.companyId;
      if (!companyId) {
        return res.status(400).json({ message: "Company ID is required" });
      }
      
      const stats = await storage.getCompanyStats(companyId);
      res.json(stats);
    } catch (error) {
      console.error("Get company stats error:", error);
      res.status(500).json({ message: "Server error" });
    }
  });

  // Job types endpoint
  app.get("/api/job-types", isAuthenticated, async (req, res) => {
    try {
      const companyId = req.user.companyId;
      if (!companyId) {
        return res.status(400).json({ message: "Company ID is required" });
      }
      
      const jobTypes = await storage.getJobTypesByCompany(companyId);
      res.json(jobTypes);
    } catch (error) {
      console.error("Get job types error:", error);
      res.status(500).json({ message: "Server error" });
    }
  });

  // Mount critical missing routes with proper paths
  app.use("/api/check-ins", checkInRoutes);
  app.use("/api/blog", blogRoutes);  
  app.use("/api/reviews", reviewRoutes);

  // Add embed routes for JavaScript widget
  app.use("/", embedRoutes);
  
  // Serve widget demo and preview files
  app.get("/widget-demo.html", (req, res) => {
    res.sendFile(path.join(process.cwd(), 'public', 'widget-demo.html'));
  });
  
  app.get("/widget-preview", (req, res) => {
    res.sendFile(path.join(process.cwd(), 'public', 'widget-preview.html'));
  });
  
  // Critical Security Fix: API catch-all handler to prevent HTML responses
  // This MUST be the last route handler to catch any unmatched API requests
  app.use('/api/*', (req, res) => {
    res.status(404).json({ 
      message: 'API endpoint not found',
      path: req.originalUrl,
      method: req.method,
      timestamp: new Date().toISOString()
    });
  });

  const httpServer = createServer(app);
  
  return httpServer;
}
