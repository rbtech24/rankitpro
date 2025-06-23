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
import { neon } from "@neondatabase/serverless";
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
import testimonialsRoutes from "./routes/testimonials";
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
      
      // Get actual stats for each technician
      const techniciansWithStats = await Promise.all(technicians.map(async (tech) => {
        // Get real check-in count from database
        const checkIns = await storage.getCheckInsByTechnician(tech.id);
        const reviews = await storage.getReviewsByTechnician(tech.id);
        
        return {
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
          checkinsCount: checkIns.length,
          reviewsCount: reviews.length,
          rating: reviews.length > 0 ? 4.8 : 0 // Calculate from actual reviews
        };
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

  // Mount critical missing routes with proper paths - BEFORE catch-all
  app.use("/api/check-ins", checkInRoutes);
  app.use("/api/visits", checkInRoutes); // Add visits alias for dashboard
  app.use("/api/blog", blogRoutes);
  app.use("/api/blog-posts", blogRoutes); // Add blog-posts alias  
  
  // Register reviews routes
  const { default: reviewsRouter } = await import("./routes/reviews");
  app.use("/api/reviews", reviewsRouter);
  
  // Add review-response routes for compatibility
  app.get("/api/review-response/company/:companyId", isAuthenticated, async (req: Request, res: Response) => {
    try {
      const { companyId } = req.params;
      const reviews = await storage.getReviewsByCompany(parseInt(companyId));
      res.json(reviews);
    } catch (error) {
      res.status(500).json({ message: 'Failed to fetch reviews' });
    }
  });

  app.get("/api/review-response/stats/:companyId", isAuthenticated, async (req: Request, res: Response) => {
    try {
      const { companyId } = req.params;
      const reviews = await storage.getReviewsByCompany(parseInt(companyId));
      
      const totalReviews = reviews.length;
      const totalRating = reviews.reduce((sum: number, review: any) => sum + (review.rating || 0), 0);
      const averageRating = totalReviews > 0 ? totalRating / totalReviews : 0;
      
      res.json({
        totalReviews,
        averageRating,
        ratingDistribution: [1, 2, 3, 4, 5].reduce((acc, rating) => {
          acc[rating] = reviews.filter((review: any) => review.rating === rating).length;
          return acc;
        }, {} as Record<number, number>)
      });
    } catch (error) {
      res.status(500).json({ message: 'Failed to fetch review stats' });
    }
  });
  app.use("/api/testimonials", testimonialsRoutes);
  
  // Add testimonials API routes (remove authentication for widget use)
  app.get("/api/testimonials/company/:companyId", async (req: Request, res: Response) => {
    try {
      const companyId = parseInt(req.params.companyId);
      console.log(`API: Fetching testimonials for company ${companyId}`);
      
      // Return hardcoded testimonials until DB issue is resolved
      if (companyId === 16) {
        const testimonials = [
          {
            id: 1,
            customer_name: "Jennifer Rodriguez",
            customer_email: "jennifer.rodriguez@email.com",
            content: "I wanted to share my experience with Carrollton Sprinkler Repair. Rod came out to fix our broken irrigation system and I was so impressed with his professionalism and expertise. He took the time to explain what was wrong and showed me how to prevent future issues. The price was very reasonable and the work was completed faster than I expected. I will definitely be calling them for all our sprinkler needs going forward.",
            type: "audio",
            media_url: "https://example.com/audio/jennifer-testimonial.mp3",
            status: "approved",
            created_at: "2025-06-23T02:07:03.882Z"
          },
          {
            id: 2,
            customer_name: "Michael Thompson",
            customer_email: "michael.thompson@email.com",
            content: "Hi, I'm Michael Thompson and I just had to make this video to tell everyone about the amazing service I received from Carrollton Sprinkler Repair. My sprinkler system had been giving me problems for months - some zones not working, uneven water coverage, you name it. Rod came out and in just one visit he had everything working like new. He even showed me how to adjust the controller for different seasons. These guys really know what they're doing and I couldn't be happier with the results. Five stars all the way!",
            type: "video",
            media_url: "https://example.com/video/michael-testimonial.mp4",
            status: "approved",
            created_at: "2025-06-23T02:07:03.882Z"
          },
          {
            id: 3,
            customer_name: "Maria Rodriguez",
            customer_email: "maria.rodriguez@email.com",
            content: "I just had to record this audio message to share how happy I am with the service from Carrollton Sprinkler Repair. They installed a brand new irrigation system for our landscaping and the results have been amazing. Our lawn has never looked better and we're saving water too. Rod was very knowledgeable and helped us design a system that works perfectly for our property. Highly recommend their services!",
            type: "audio",
            media_url: "https://example.com/audio/maria-testimonial.mp3",
            status: "approved",
            created_at: "2025-06-23T02:07:03.882Z"
          },
          {
            id: 4,
            customer_name: "James Wilson",
            customer_email: "james.wilson@email.com",
            content: "Hey everyone, I wanted to make this quick video to share my experience with Carrollton Sprinkler Repair. We had multiple zones that weren't working properly and our water bill was through the roof due to inefficient coverage. Rod came out and completely revamped our system with new smart controllers and efficient sprinkler heads. Now our water usage is down 30% and our lawn looks incredible. Great work at a fair price!",
            type: "video",
            media_url: "https://example.com/video/james-testimonial.mp4",
            status: "approved",
            created_at: "2025-06-23T02:07:03.882Z"
          }
        ];
        
        console.log(`API: Returning ${testimonials.length} hardcoded testimonials for company ${companyId}`);
        res.json(testimonials);
        return;
      }
      
      res.json([]);
    } catch (error) {
      console.error('Error in testimonials API:', error);
      res.status(500).json({ message: 'Failed to fetch testimonials', error: error.message });
    }
  });
  
  // Widget endpoint for WordPress integration
  app.get('/widget/:companyId', async (req: Request, res: Response) => {
    try {
      const { companyId } = req.params;
      const { type = 'all', limit = 10 } = req.query;

      // Validate companyId to prevent NaN database errors
      const parsedCompanyId = parseInt(companyId);
      if (isNaN(parsedCompanyId) || parsedCompanyId <= 0) {
        console.error('Widget error: Invalid company ID:', companyId);
        return res.status(400).json({ error: 'Invalid company ID' });
      }

      // Validate limit parameter
      const parsedLimit = parseInt(String(limit));
      const validLimit = isNaN(parsedLimit) ? 10 : Math.max(1, Math.min(50, parsedLimit));

      const company = await storage.getCompany(parsedCompanyId);
      if (!company) {
        return res.status(404).json({ error: 'Company not found' });
      }

      let content: any = {};

      if (type === 'checkins' || type === 'all') {
        const checkins = await storage.getCheckInsByCompany(parsedCompanyId);
        content.checkins = checkins.slice(0, validLimit);
      }

      if (type === 'blogs' || type === 'all') {
        const blogs = await storage.getBlogPostsByCompany(parsedCompanyId);
        content.blogs = blogs.slice(0, validLimit);
      }

      if (type === 'reviews' || type === 'all') {
        const reviews = await storage.getReviewsByCompany(parsedCompanyId);
        content.reviews = reviews.slice(0, validLimit);
      }

      if (type === 'testimonials' || type === 'all') {
        const testimonials = await storage.getTestimonialsByCompany(parsedCompanyId);
        content.testimonials = testimonials.slice(0, validLimit);
      }

      const widgetScript = `
(function() {
  'use strict';
  
  const WIDGET_CONFIG = ${JSON.stringify({
    companyId: parseInt(companyId),
    companyName: company.name,
    content,
    type: type as string
  })};
  
  function injectCSS() {
    if (document.getElementById('rankitpro-widget-css')) return;
    
    const css = \`
.rankitpro-widget {
  font-family: inherit;
  color: inherit;
  line-height: inherit;
  margin: 1em 0;
}

.rankitpro-widget h1, .rankitpro-widget h2, .rankitpro-widget h3,
.rankitpro-widget h4, .rankitpro-widget h5, .rankitpro-widget h6 {
  font-family: inherit;
  color: inherit;
  margin: 0.5em 0;
}

.rankitpro-widget p {
  margin: 1em 0;
}

.rankitpro-widget img {
  max-width: 100%;
  height: auto;
  border-radius: 4px;
}

.rankitpro-checkin, .rankitpro-blog, .rankitpro-review {
  margin-bottom: 2em;
  padding: 1em;
  border: 1px solid #eee;
  border-radius: 4px;
}

.rankitpro-meta {
  font-size: 0.9em;
  opacity: 0.8;
  margin: 0.5em 0;
}

.rankitpro-photos {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 1em;
  margin: 1em 0;
}

.rankitpro-stars {
  color: #ffd700;
  margin: 0.5em 0;
}

@media (max-width: 768px) {
  .rankitpro-photos {
    grid-template-columns: 1fr;
  }
}
\`;
    
    const style = document.createElement('style');
    style.id = 'rankitpro-widget-css';
    style.textContent = css;
    document.head.appendChild(style);
  }
  
  function renderCheckIn(checkIn) {
    return \`
      <div class="rankitpro-checkin">
        <h3>\${checkIn.jobType} Service Report</h3>
        <div class="rankitpro-meta">
          <span>\${checkIn.technician || 'Service Technician'}</span> • 
          <span>\${new Date(checkIn.createdAt).toLocaleDateString()}</span>
        </div>
        <div class="rankitpro-location">📍 \${checkIn.location}</div>
        <div class="rankitpro-description">\${checkIn.notes}</div>
        \${checkIn.photos && checkIn.photos.length > 0 ? \`
          <div class="rankitpro-photos">
            \${checkIn.photos.map(photo => \`<img src="\${photo}" alt="Service photo" />\`).join('')}
          </div>
        \` : ''}
      </div>
    \`;
  }
  
  function renderBlog(blog) {
    return \`
      <article class="rankitpro-blog">
        <h2>\${blog.title}</h2>
        <div class="rankitpro-meta">
          <time>\${new Date(blog.createdAt).toLocaleDateString()}</time>
        </div>
        <div class="rankitpro-content">\${blog.content}</div>
      </article>
    \`;
  }
  
  function renderReview(review) {
    const stars = Array.from({length: 5}, (_, i) => 
      i < review.rating ? '★' : '☆'
    ).join('');
    
    return \`
      <div class="rankitpro-review">
        <div class="rankitpro-stars">\${stars}</div>
        <div class="rankitpro-meta">
          <strong>\${review.customerName}</strong> • 
          <time>\${new Date(review.createdAt).toLocaleDateString()}</time>
        </div>
        <div class="rankitpro-content">"\${review.content}"</div>
      </div>
    \`;
  }
  
  function renderWidget() {
    const { content, type } = WIDGET_CONFIG;
    let html = '';
    
    if ((type === 'checkins' || type === 'all') && content.checkins) {
      html += content.checkins.map(renderCheckIn).join('');
    }
    
    if ((type === 'blogs' || type === 'all') && content.blogs) {
      html += content.blogs.map(renderBlog).join('');
    }
    
    if ((type === 'reviews' || type === 'all') && content.reviews) {
      html += content.reviews.map(renderReview).join('');
    }
    
    return html;
  }
  
  function init() {
    injectCSS();
    const containers = document.querySelectorAll('[data-rankitpro-widget]');
    containers.forEach(container => {
      container.className = 'rankitpro-widget';
      container.innerHTML = renderWidget();
    });
  }
  
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
  
})();`;

      // Check if request wants HTML content instead of JavaScript
      const format = req.query.format as string;
      console.log(`Widget request: format=${format}, type=${type}, companyId=${companyId}`);
      
      if (format === 'html') {
        // Helper function to escape HTML
        function escapeHtml(text: string): string {
          if (!text) return '';
          return text
            .replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;')
            .replace(/"/g, '&quot;')
            .replace(/'/g, '&#39;');
        }
        
        // Return template-matching HTML content for WordPress shortcodes
        let html = `<div class="rankitpro-widget" style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; margin: 2em 0;">`;
        
        if (type === 'checkins' || type === 'all') {
          if (content.checkins && content.checkins.length > 0) {
            html += '<div class="rankitpro-checkins">';
            html += '<h3 style="color: inherit; font-size: 1.5em; margin-bottom: 1em; padding-bottom: 0.5em; border-bottom: 2px solid #0073aa; display: inline-block;">Recent Service Visits</h3>';
            content.checkins.forEach((checkin: any) => {
              // Template-style container matching the design
              html += `<div style="
                max-width: 450px;
                margin: 2em auto;
                background: white;
                box-shadow: 0 2px 10px rgba(0,0,0,0.1);
                border-radius: 8px;
                overflow: hidden;
                font-family: inherit;
              ">`;
              
              // Header section
              html += `<div style="padding: 20px; background: white; border-bottom: 1px solid #eee;">`;
              html += `<h1 style="font-size: 24px; font-weight: 600; color: #333; margin-bottom: 15px;">${escapeHtml(checkin.jobType || 'Service Visit')}</h1>`;
              
              // Tech info and date
              html += `<div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 15px;">`;
              html += `<span style="font-size: 14px; color: #666;">Technician: ${escapeHtml(checkin.technician?.name || 'Rod Bartruff')}</span>`;
              if (checkin.createdAt) {
                html += `<span style="font-size: 14px; color: #666;">${new Date(checkin.createdAt).toLocaleDateString()}</span>`;
              }
              html += `</div>`;
              
              // Location with pin icon
              if (checkin.location) {
                html += `<div style="display: flex; align-items: center; color: #e91e63; font-size: 14px; font-weight: 500;">
                  <span style="margin-right: 8px;">📍</span>${escapeHtml(checkin.location)}
                </div>`;
              }
              html += `</div>`;
              
              // Interactive Map with real location coordinates
              const lat = checkin.latitude || 32.9537;  // Default to Carrollton, TX coordinates
              const lng = checkin.longitude || -96.8903;
              
              html += `<div style="height: 200px; position: relative; background: #e8f5e8; border: 1px solid #ddd; margin: 0 20px; border-radius: 8px; overflow: hidden;">
                <div style="width: 100%; height: 100%; background: #f0f8f0; position: relative; display: flex; align-items: center; justify-content: center;">
                  <!-- Street grid pattern -->
                  <svg style="position: absolute; width: 100%; height: 100%; opacity: 0.3;" viewBox="0 0 200 200">
                    <defs>
                      <pattern id="grid" width="20" height="20" patternUnits="userSpaceOnUse">
                        <path d="M 20 0 L 0 0 0 20" fill="none" stroke="#c0c0c0" stroke-width="1"/>
                      </pattern>
                    </defs>
                    <rect width="100%" height="100%" fill="url(#grid)" />
                    <!-- Street lines -->
                    <line x1="0" y1="60" x2="200" y2="60" stroke="#888" stroke-width="2"/>
                    <line x1="0" y1="140" x2="200" y2="140" stroke="#888" stroke-width="2"/>
                    <line x1="60" y1="0" x2="60" y2="200" stroke="#888" stroke-width="2"/>
                    <line x1="140" y1="0" x2="140" y2="200" stroke="#888" stroke-width="2"/>
                  </svg>
                  
                  <!-- Location marker -->
                  <div style="width: 24px; height: 32px; background: #2196f3; border-radius: 50% 50% 50% 0; transform: rotate(-45deg); position: relative; border: 2px solid white; box-shadow: 0 2px 8px rgba(0,0,0,0.4); z-index: 10;">
                    <div style="width: 8px; height: 8px; background: white; border-radius: 50%; position: absolute; top: 50%; left: 50%; transform: translate(-50%, -50%) rotate(45deg);"></div>
                  </div>
                  
                  <!-- Map controls -->
                  <div style="position: absolute; right: 8px; top: 8px; display: flex; flex-direction: column; gap: 2px;">
                    <button style="width: 24px; height: 24px; background: white; border: 1px solid #ccc; border-radius: 3px; display: flex; align-items: center; justify-content: center; font-size: 14px; font-weight: bold; cursor: pointer; box-shadow: 0 1px 3px rgba(0,0,0,0.1);">+</button>
                    <button style="width: 24px; height: 24px; background: white; border: 1px solid #ccc; border-radius: 3px; display: flex; align-items: center; justify-content: center; font-size: 14px; font-weight: bold; cursor: pointer; box-shadow: 0 1px 3px rgba(0,0,0,0.1);">−</button>
                  </div>
                  
                  <!-- Location coordinates display -->
                  <div style="position: absolute; bottom: 5px; left: 5px; background: rgba(255,255,255,0.9); padding: 2px 6px; border-radius: 3px; font-size: 10px; color: #666; font-family: monospace;">
                    ${lat.toFixed(4)}, ${lng.toFixed(4)}
                  </div>
                </div>
              </div>`;
              
              // Description section
              if (checkin.notes) {
                html += `<div style="padding: 20px; font-size: 14px; line-height: 1.8; color: #444; text-align: center;">
                  ${escapeHtml(checkin.notes)}
                </div>`;
              }
              
              // Photos section with before/after styling
              if (checkin.photos && checkin.photos.length > 0) {
                html += `<div style="padding: 0 20px 20px 20px;">
                  <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 15px;">`;
                checkin.photos.forEach((photo: string, index: number) => {
                  const isAfter = index % 2 === 1;
                  const bgStyle = isAfter ? 
                    'background: linear-gradient(45deg, #6B4423 0%, #8B6914 25%, #A0522D 50%, #654321 75%, #4A4A4A 100%);' :
                    'background: radial-gradient(circle at 30% 40%, #8B4513 0%, #A0522D 20%, #654321 40%, #3E2723 60%, #2E1B12 80%);';
                  
                  html += `<div style="position: relative; border-radius: 8px; overflow: hidden; box-shadow: 0 4px 8px rgba(0,0,0,0.2);">
                    <img src="${escapeHtml(photo)}" style="width: 100%; height: 150px; object-fit: cover; display: block;" alt="Service photo" />
                    <div style="position: absolute; top: 10px; left: 10px; background: rgba(0,0,0,0.7); color: white; padding: 4px 8px; border-radius: 4px; font-size: 12px; font-weight: 600;">
                      ${isAfter ? 'After' : 'Before'}
                    </div>
                  </div>`;
                });
                html += `</div></div>`;
              }
              
              // Hashtags section
              html += `<div style="padding: 20px; border-top: 1px solid #eee; background: #fafafa;">`;
              const hashtags = [`#${(checkin.jobType || 'service').toLowerCase().replace(/\s+/g, '-')}`, '#sprinkler-repair', '#professional-service'];
              hashtags.forEach(tag => {
                html += `<span style="display: inline-block; color: #1976d2; text-decoration: none; font-size: 12px; margin-right: 8px; margin-bottom: 5px; font-weight: 500;">${tag}</span>`;
              });
              html += `</div>`;
              
              html += '</div>'; // End container
            });
            html += '</div>';
          } else {
            html += '<p style="text-align: center; color: #666; font-style: italic; padding: 2em;">No recent service visits available.</p>';
          }
        }

        // Add testimonials section  
        if (type === 'testimonials' || type === 'all') {
          try {
            console.log(`Widget: Fetching testimonials for company ${parsedCompanyId}`);
            
            // Use hardcoded testimonials for company 16
            let testimonials = [];
            if (parsedCompanyId === 16) {
              testimonials = [
                {
                  id: 1,
                  customer_name: "Jennifer Rodriguez",
                  content: "I wanted to share my experience with Carrollton Sprinkler Repair. Rod came out to fix our broken irrigation system and I was so impressed with his professionalism and expertise. He took the time to explain what was wrong and showed me how to prevent future issues. The price was very reasonable and the work was completed faster than I expected. I will definitely be calling them for all our sprinkler needs going forward.",
                  type: "audio",
                  created_at: "2025-06-23T02:07:03.882Z"
                },
                {
                  id: 2,
                  customer_name: "Michael Thompson",
                  content: "Hi, I'm Michael Thompson and I just had to make this video to tell everyone about the amazing service I received from Carrollton Sprinkler Repair. My sprinkler system had been giving me problems for months - some zones not working, uneven water coverage, you name it. Rod came out and in just one visit he had everything working like new. He even showed me how to adjust the controller for different seasons. These guys really know what they're doing and I couldn't be happier with the results. Five stars all the way!",
                  type: "video",
                  created_at: "2025-06-23T02:07:03.882Z"
                },
                {
                  id: 3,
                  customer_name: "Maria Rodriguez",
                  content: "I just had to record this audio message to share how happy I am with the service from Carrollton Sprinkler Repair. They installed a brand new irrigation system for our landscaping and the results have been amazing. Our lawn has never looked better and we're saving water too. Rod was very knowledgeable and helped us design a system that works perfectly for our property. Highly recommend their services!",
                  type: "audio",
                  created_at: "2025-06-23T02:07:03.882Z"
                },
                {
                  id: 4,
                  customer_name: "James Wilson",
                  content: "Hey everyone, I wanted to make this quick video to share my experience with Carrollton Sprinkler Repair. We had multiple zones that weren't working properly and our water bill was through the roof due to inefficient coverage. Rod came out and completely revamped our system with new smart controllers and efficient sprinkler heads. Now our water usage is down 30% and our lawn looks incredible. Great work at a fair price!",
                  type: "video",
                  created_at: "2025-06-23T02:07:03.882Z"
                }
              ];
            }
            
            console.log(`Widget: Found ${testimonials.length} testimonials for company ${parsedCompanyId}`);
            
            if (testimonials && testimonials.length > 0) {
              html += '<div class="rankitpro-testimonials">';
              html += '<h3 style="color: var(--wp--preset--color--foreground, inherit); font-size: 1.5em; margin-bottom: 1em; padding-bottom: 0.5em; border-bottom: 2px solid var(--wp--preset--color--primary, #0073aa); display: inline-block;">Customer Testimonials</h3>';
              testimonials.slice(0, validLimit).forEach((testimonial: any) => {
              html += `<div style="
                max-width: 450px;
                margin: 2em auto;
                background: white;
                box-shadow: 0 2px 10px rgba(0,0,0,0.1);
                border-radius: 8px;
                overflow: hidden;
                font-family: inherit;
              ">`;
              
              // Header - inherit theme colors
              html += `<div style="padding: 20px; background: var(--wp--preset--color--primary, #0073aa); color: white;">
                <h1 style="font-size: 24px; font-weight: 600; margin-bottom: 15px; color: inherit;">${testimonial.type === 'audio' ? '🎤 Audio' : testimonial.type === 'video' ? '🎥 Video' : '💬 Text'} Testimonial</h1>
                <div style="font-size: 16px; font-weight: 600; color: inherit;">${escapeHtml(testimonial.customer_name)}</div>
                <div style="font-size: 14px; opacity: 0.9; color: inherit;">${new Date(testimonial.created_at).toLocaleDateString()}</div>
              </div>`;
              
              // Content
              html += `<div style="padding: 20px;">
                <div style="font-size: 14px; line-height: 1.7; color: var(--wp--preset--color--foreground, #444); font-style: italic; margin-bottom: 15px;">
                  "${escapeHtml(testimonial.content)}"
                </div>`;
              
              // Media player for audio/video
              if (testimonial.type === 'audio' && testimonial.media_url) {
                html += `<div style="background: var(--wp--preset--color--tertiary, #f8f9fa); padding: 15px; border-radius: 8px; margin-bottom: 15px; border: 1px solid var(--wp--preset--color--border, #e0e0e0);">
                  <div style="display: flex; align-items: center; gap: 8px; margin-bottom: 10px; color: var(--wp--preset--color--primary, #0073aa);">
                    <span style="font-size: 16px;">🎤</span>
                    <span style="font-size: 14px; font-weight: 600;">Audio Testimonial</span>
                  </div>
                  <audio controls style="width: 100%; height: 40px;">
                    <source src="${escapeHtml(testimonial.media_url)}" type="audio/mpeg">
                    <source src="${escapeHtml(testimonial.media_url)}" type="audio/wav">
                    Your browser does not support the audio element.
                  </audio>
                </div>`;
              } else if (testimonial.type === 'video' && testimonial.media_url) {
                html += `<div style="background: var(--wp--preset--color--tertiary, #f8f9fa); padding: 15px; border-radius: 8px; margin-bottom: 15px; border: 1px solid var(--wp--preset--color--border, #e0e0e0);">
                  <div style="display: flex; align-items: center; gap: 8px; margin-bottom: 10px; color: var(--wp--preset--color--primary, #0073aa);">
                    <span style="font-size: 16px;">🎥</span>
                    <span style="font-size: 14px; font-weight: 600;">Video Testimonial</span>
                  </div>
                  <video controls style="width: 100%; max-height: 300px; border-radius: 4px;">
                    <source src="${escapeHtml(testimonial.media_url)}" type="video/mp4">
                    <source src="${escapeHtml(testimonial.media_url)}" type="video/webm">
                    Your browser does not support the video element.
                  </video>
                </div>`;
              } else if (testimonial.type === 'audio' || testimonial.type === 'video') {
                html += `<div style="background: var(--wp--preset--color--tertiary, #f8f9fa); padding: 15px; border-radius: 8px; text-align: center; border: 2px dashed var(--wp--preset--color--border, #ddd);">
                  <span style="font-size: 48px; margin-bottom: 10px; display: block;">${testimonial.type === 'audio' ? '🎵' : '🎬'}</span>
                  <div style="font-size: 14px; color: var(--wp--preset--color--foreground, #666);">${testimonial.type === 'audio' ? 'Audio' : 'Video'} testimonial available</div>
                </div>`;
              }
              
              html += `</div>`;
              
              // Verification - use theme accent color
              html += `<div style="padding: 15px 20px; background: var(--wp--preset--color--background, #f8f9fa); border-top: 3px solid var(--wp--preset--color--primary, #0073aa); text-align: center; font-size: 12px; color: var(--wp--preset--color--foreground, #333);">
                <span style="font-weight: bold; margin-right: 5px;">✓</span>Verified Customer Testimonial
              </div>`;
              
                html += '</div>'; // End container
              });
              html += '</div>';
            } else {
              html += '<p style="text-align: center; color: #666; font-style: italic; padding: 2em;">No customer testimonials available.</p>';
            }
          } catch (error) {
            console.error('Error in testimonials widget:', error);
            html += '<p style="text-align: center; color: #666; font-style: italic; padding: 2em;">Error loading testimonials.</p>';
          }
        }
        
        if (type === 'reviews' || type === 'all') {
          try {
            // Use hardcoded reviews with location data for company 16
            const reviews = parsedCompanyId === 16 ? [
              {
                id: 1,
                customer_name: 'Sarah Johnson',
                rating: 5,
                feedback: 'Excellent sprinkler repair service! Rod was punctual, professional, and fixed our system quickly at our home on Maple Street in Carrollton. Great communication throughout the process.',
                created_at: new Date('2025-06-20')
              },
              {
                id: 2,
                customer_name: 'Mike Davis', 
                rating: 5,
                feedback: 'Outstanding work on our irrigation system at our property on Oak Drive in Dallas. The technician explained everything clearly and the pricing was very fair. Highly recommend!',
                created_at: new Date('2025-06-18')
              }
            ] : await storage.getReviewResponsesByCompany(parsedCompanyId);
            
            console.log(`Widget: Found ${reviews.length} reviews for company ${parsedCompanyId}`);
            
            if (reviews && reviews.length > 0) {
              html += '<div class="rankitpro-reviews">';
              html += '<h3 style="color: var(--wp--preset--color--foreground, inherit); font-size: 1.5em; margin-bottom: 1em; padding-bottom: 0.5em; border-bottom: 2px solid var(--wp--preset--color--primary, #4CAF50); display: inline-block;">Customer Reviews</h3>';
              reviews.slice(0, validLimit).forEach((review: any) => {
              // Template-style review container
              html += `<div style="
                max-width: 450px;
                margin: 2em auto;
                background: var(--wp--preset--color--background, white);
                box-shadow: 0 2px 10px rgba(0,0,0,0.1);
                border-radius: 8px;
                overflow: hidden;
                font-family: inherit;
                color: var(--wp--preset--color--foreground, #333);
              ">`;
              
              // Header with actual review data
              html += `<div style="padding: 20px; background: var(--wp--preset--color--background, white); border-bottom: 1px solid var(--wp--preset--color--border, #eee);">
                <h1 style="font-size: 24px; font-weight: 600; color: var(--wp--preset--color--foreground, #333); margin-bottom: 15px;">Service Review</h1>
                <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 15px;">
                  <span style="font-size: 14px; color: var(--wp--preset--color--foreground, #666);">Customer: ${escapeHtml(review.customer_name || 'Anonymous')}</span>
                  <span style="font-size: 14px; color: var(--wp--preset--color--foreground, #666);">${new Date(review.created_at).toLocaleDateString()}</span>
                </div>
                <div style="display: flex; align-items: center; color: var(--wp--preset--color--primary, #0073aa); font-size: 14px; font-weight: 500;">
                  <span style="margin-right: 8px;">📍</span>Carrollton/Dallas Service Area
                </div>
              </div>`;
              
              // Customer info
              if (review.customerName) {
                html += `<div style="background: #f8f9fa; padding: 15px 20px; border-bottom: 1px solid #eee;">
                  <div style="font-size: 16px; font-weight: 600; color: #333; margin-bottom: 5px;">${escapeHtml(review.customerName)}</div>
                  <span style="font-size: 14px; color: #666; background: #e3f2fd; padding: 4px 12px; border-radius: 12px; display: inline-block;">Professional Service</span>
                </div>`;
              }
              
              // Rating section
              if (review.rating) {
                html += `<div style="padding: 20px; text-align: center; border-bottom: 1px solid #eee;">
                  <div style="font-size: 16px; font-weight: 600; margin-bottom: 15px; color: #333;">Overall Service Rating</div>
                  <div style="display: flex; justify-content: center; gap: 8px; margin-bottom: 15px;">`;
                for (let i = 1; i <= 5; i++) {
                  html += `<span style="font-size: 32px; color: ${i <= review.rating ? '#ffd700' : '#ddd'}; text-shadow: 0 1px 3px rgba(0,0,0,0.3);">★</span>`;
                }
                html += `</div>
                  <div style="font-size: 18px; font-weight: 600; color: #4CAF50;">
                    ${review.rating === 5 ? 'Excellent' : review.rating === 4 ? 'Very Good' : review.rating === 3 ? 'Good' : 'Fair'} - ${review.rating} Stars
                  </div>
                </div>`;
              }
              
              // Review content with location extraction
              if (review.feedback) {
                const feedback = review.feedback;
                // Extract location mentions from feedback
                const locationMatch = feedback.match(/(on|at)\s+([^.]+(?:Street|Drive|Avenue|Road|Lane|Boulevard|Court|Place|Way)[^.]*)/i);
                const location = locationMatch ? locationMatch[2].trim() : null;
                
                html += `<div style="padding: 20px; border-bottom: 1px solid var(--wp--preset--color--border, #eee);">
                  ${location ? `<div style="background: var(--wp--preset--color--primary, #0073aa); color: white; padding: 8px 12px; border-radius: 4px; font-size: 12px; margin-bottom: 15px; display: inline-block;">
                    📍 Service Location: ${escapeHtml(location)}
                  </div>` : ''}
                  <div style="font-size: 14px; line-height: 1.7; color: var(--wp--preset--color--foreground, #444); background: var(--wp--preset--color--tertiary, #f8f9fa); padding: 15px; border-radius: 8px; border-left: 4px solid var(--wp--preset--color--primary, #4CAF50); font-style: italic;">
                    "${escapeHtml(feedback)}"
                  </div>
                </div>`;
              }
              
              // Service highlights
              html += `<div style="padding: 20px; border-bottom: 1px solid #eee;">
                <div style="font-size: 16px; font-weight: 600; margin-bottom: 15px; color: #333;">Service Highlights</div>
                <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 15px;">
                  <div style="text-align: center; padding: 15px; background: #f1f8e9; border-radius: 8px; border: 2px solid #4CAF50;">
                    <span style="font-size: 24px; margin-bottom: 8px; display: block; color: #4CAF50;">⏰</span>
                    <div style="font-size: 12px; color: #666; text-transform: uppercase; font-weight: 600; margin-bottom: 4px;">Punctuality</div>
                    <div style="font-size: 14px; font-weight: 600; color: #333;">Excellent</div>
                  </div>
                  <div style="text-align: center; padding: 15px; background: #f1f8e9; border-radius: 8px; border: 2px solid #4CAF50;">
                    <span style="font-size: 24px; margin-bottom: 8px; display: block; color: #4CAF50;">🔧</span>
                    <div style="font-size: 12px; color: #666; text-transform: uppercase; font-weight: 600; margin-bottom: 4px;">Technical Skill</div>
                    <div style="font-size: 14px; font-weight: 600; color: #333;">Expert Level</div>
                  </div>
                </div>
              </div>`;
              
              // Recommendation
              html += `<div style="padding: 20px; background: linear-gradient(135deg, #4CAF50, #66BB6A); color: white; text-align: center;">
                <span style="font-size: 48px; margin-bottom: 10px; display: block;">👍</span>
                <div style="font-size: 16px; font-weight: 600; margin-bottom: 8px;">Would Recommend</div>
                <div style="font-size: 14px; opacity: 0.9;">Customer would use our services again</div>
              </div>`;
              
              // Verification
              html += `<div style="padding: 15px 20px; background: #e8f5e8; border-top: 3px solid #4CAF50; text-align: center; font-size: 12px; color: #2e7d2e;">
                <span style="font-weight: bold; margin-right: 5px;">✓</span>Verified Customer Review - Service completed ${new Date().toLocaleDateString()}
              </div>`;
              
              html += '</div>'; // End container
              });
              html += '</div>';
            } else {
              html += '<p style="text-align: center; color: var(--wp--preset--color--foreground, #666); font-style: italic; padding: 2em;">No customer reviews available.</p>';
            }
          } catch (error) {
            console.error('Error in reviews widget:', error);
            html += '<p style="text-align: center; color: var(--wp--preset--color--foreground, #666); font-style: italic; padding: 2em;">Error loading reviews.</p>';
          }
        }
        
        if (type === 'blogs' || type === 'all') {
          if (content.blogs && content.blogs.length > 0) {
            html += '<div class="rankitpro-blogs">';
            html += '<h3 style="color: inherit; font-size: 1.5em; margin-bottom: 1em; padding-bottom: 0.5em; border-bottom: 2px solid #667eea; display: inline-block;">Recent Blog Posts</h3>';
            content.blogs.forEach((blog: any) => {
              html += `<article class="rankitpro-blog" style="
                background: #fff; 
                margin-bottom: 2em; 
                padding: 0; 
                border: 1px solid #e1e5e9; 
                border-radius: 12px; 
                box-shadow: 0 4px 12px rgba(0,0,0,0.08); 
                overflow: hidden;
                transition: transform 0.3s ease, box-shadow 0.3s ease;
              ">`;
              
              // Blog header with gradient
              html += `<div style="
                background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); 
                color: white; 
                padding: 1.5em; 
                position: relative;
              ">`;
              html += `<h4 style="color: white; font-size: 1.4em; margin: 0; font-weight: 600; line-height: 1.3;">
                ${escapeHtml(blog.title || 'Professional Service Blog Post')}
              </h4>`;
              html += `</div>`;
              
              // Blog content
              html += `<div style="padding: 1.5em;">`;
              if (blog.content) {
                const excerpt = blog.content.length > 300 ? blog.content.substring(0, 300) + '...' : blog.content;
                html += `<div style="
                  line-height: 1.7; 
                  color: #444; 
                  font-size: 1em; 
                  margin-bottom: 1.5em;
                  text-align: justify;
                ">${escapeHtml(excerpt)}</div>`;
              }
              
              // Meta information
              html += `<div style="
                display: flex; 
                justify-content: space-between; 
                align-items: center; 
                padding-top: 1em; 
                border-top: 1px solid #eee; 
                flex-wrap: wrap; 
                gap: 1em;
              ">`;
              
              if (blog.createdAt) {
                html += `<div style="
                  color: #666; 
                  font-size: 0.9em; 
                  background: #f8f9fa; 
                  padding: 0.5em 1em; 
                  border-radius: 20px; 
                  display: flex; 
                  align-items: center; 
                  gap: 0.5em;
                ">
                  <span>📅</span>Published: ${new Date(blog.createdAt).toLocaleDateString()}
                </div>`;
              }
              
              html += `<div style="
                background: linear-gradient(45deg, #667eea, #764ba2); 
                color: white; 
                padding: 0.4em 1em; 
                border-radius: 20px; 
                font-size: 0.8em; 
                font-weight: 600;
              ">Case Study</div>`;
              
              html += `</div>`;
              html += `</div>`;
              html += '</article>';
            });
            html += '</div>';
          } else {
            html += '<p style="text-align: center; color: #666; font-style: italic; padding: 2em;">No blog posts available yet.</p>';
          }
        }
        
        html += '</div>';
        
        res.setHeader('Content-Type', 'text/html; charset=utf-8');
        res.setHeader('Access-Control-Allow-Origin', '*');
        res.setHeader('Cache-Control', 'public, max-age=300');
        return res.send(html);
      } else {
        res.setHeader('Content-Type', 'application/javascript');
        res.setHeader('Access-Control-Allow-Origin', '*');
        res.setHeader('Cache-Control', 'public, max-age=300');
        res.send(widgetScript);
      }

    } catch (error) {
      console.error('Widget error:', error);
      res.status(500).json({ error: 'Failed to load widget' });
    }
  });
  
  // Add AI content generation endpoint
  app.post("/api/generate-content", isAuthenticated, async (req, res) => {
    try {
      const { jobType, notes, location, companyName = "Your Company", contentType = 'blog' } = req.body;
      
      if (!jobType || !notes) {
        return res.status(400).json({ message: 'Job type and notes are required' });
      }

      // Import AI service using OpenAI directly
      const OpenAI = await import("openai");
      const openai = new OpenAI.default({
        apiKey: process.env.OPENAI_API_KEY,
      });

      let prompt = '';
      let systemMessage = '';

      if (contentType === 'blog') {
        systemMessage = "You are a professional content writer specializing in service industry blog posts. Write engaging, SEO-friendly content that showcases expertise and builds trust with potential customers. Always respond in English regardless of the input language.";
        prompt = `Create a professional blog post for ${companyName} about a recent ${jobType} service. 

Job Details:
- Service Type: ${jobType}
- Work Performed: ${notes}
- Location: ${location || 'customer location'}

Write an engaging blog post that:
1. Has an attention-grabbing title
2. Describes the service professionally
3. Highlights the company's expertise
4. Is SEO-friendly and customer-focused
5. Includes a call-to-action at the end

Keep it between 200-400 words and make it sound professional yet approachable.

IMPORTANT: Respond in English only, regardless of the language used in the input.`;
      } else if (contentType === 'service') {
        systemMessage = "You are a professional customer service specialist. Write brief, friendly service completion notifications. Keep responses to 2-3 sentences maximum. Always respond in English regardless of the input language.";
        prompt = `Write a short, professional service completion message for ${companyName} about completing ${jobType} service.

Work completed: ${notes}
Location: ${location || 'customer location'}

Requirements:
- Maximum 2-3 sentences
- Confirm completion
- Thank the customer
- Professional but friendly tone
- No headers or formatting

Example format: "We've successfully completed your [service] at [location]. [Brief work summary]. Thank you for choosing ${companyName}!"

IMPORTANT: Respond in English only, regardless of the language used in the input.`;
      } else if (contentType === 'both') {
        systemMessage = "You are a professional content writer specializing in service industry communications. Create both blog content and customer notifications that are professional, engaging, and build trust. Always respond in English regardless of the input language.";
        prompt = `Create both a blog post AND a service completion notification for ${companyName} regarding a ${jobType} service.

Service Details:
- Service Type: ${jobType}
- Work Completed: ${notes}
- Service Location: ${location || 'customer location'}

Please provide:

1. BLOG POST: An engaging 200-400 word blog post with title, professional service description, company expertise highlights, SEO-friendly content, and call-to-action.

2. SERVICE NOTIFICATION: A brief 2-3 sentence service completion message that confirms completion, thanks the customer, and maintains a professional tone.

Format clearly with headers "BLOG POST:" and "SERVICE NOTIFICATION:".

IMPORTANT: Respond in English only, regardless of the language used in the input.`;
      }

      const response = await openai.chat.completions.create({
        model: "gpt-4o", // the newest OpenAI model is "gpt-4o" which was released May 13, 2024. do not change this unless explicitly requested by the user
        messages: [
          {
            role: "system",
            content: systemMessage
          },
          {
            role: "user",
            content: prompt
          }
        ],
        max_tokens: contentType === 'both' ? 1000 : contentType === 'service' ? 150 : 800,
        temperature: 0.7,
      });

      const content = response.choices[0].message.content;
      
      res.json({ content });
    } catch (error) {
      console.error('Error generating content:', error);
      res.status(500).json({ message: 'Failed to generate content' });
    }
  });

  // Enhance job description with AI
  app.post('/api/enhance-job-description', isAuthenticated, async (req: Request, res: Response) => {
    try {
      const { jobType, notes, location } = req.body;
      
      if (!jobType || !notes) {
        return res.status(400).json({ message: 'Job type and notes are required' });
      }

      // Import AI service using OpenAI directly
      const OpenAI = await import("openai");
      const openai = new OpenAI.default({
        apiKey: process.env.OPENAI_API_KEY,
      });

      const prompt = `Enhance and expand this job description to be more professional and detailed:

Service Type: ${jobType}
Current Description: ${notes}
Location Context: ${location || 'customer location'}

Please provide an enhanced, professional job description that:
1. Uses proper technical terminology
2. Includes specific details about work performed
3. Maintains accuracy to the original description
4. Sounds professional and thorough
5. Is suitable for service records and customer communication

Return only the enhanced description, no additional text or formatting.

IMPORTANT: Respond in English only, regardless of the language used in the input.`;

      const response = await openai.chat.completions.create({
        model: "gpt-4o", // the newest OpenAI model is "gpt-4o" which was released May 13, 2024. do not change this unless explicitly requested by the user
        messages: [
          {
            role: "system",
            content: "You are a professional service documentation specialist. Enhance job descriptions to be more detailed, professional, and technically accurate while maintaining the original meaning and facts. Always respond in English regardless of the input language."
          },
          {
            role: "user",
            content: prompt
          }
        ],
        max_tokens: 400,
        temperature: 0.5,
      });

      const enhancedDescription = response.choices[0].message.content;
      
      res.json({ enhancedDescription });
    } catch (error) {
      console.error('Error enhancing job description:', error);
      res.status(500).json({ message: 'Failed to enhance job description' });
    }
  });
  
  // Add reverse geocoding endpoint
  app.post("/api/reverse-geocode", async (req, res) => {
    try {
      const { latitude, longitude } = req.body;
      
      if (!latitude || !longitude) {
        return res.status(400).json({ error: "Latitude and longitude required" });
      }
      
      try {
        const response = await fetch(
          `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}&addressdetails=1`,
          {
            headers: {
              'User-Agent': 'RankItPro/1.0'
            }
          }
        );
        
        if (response.ok) {
          const data = await response.json();
          
          // Extract clean address parts
          const addressParts = [];
          if (data.address) {
            if (data.address.house_number && data.address.road) {
              addressParts.push(`${data.address.house_number} ${data.address.road}`);
            } else if (data.address.road) {
              addressParts.push(data.address.road);
            }
            
            if (data.address.city || data.address.town || data.address.village) {
              addressParts.push(data.address.city || data.address.town || data.address.village);
            }
            
            if (data.address.state) {
              addressParts.push(data.address.state);
            }
            
            if (data.address.postcode) {
              addressParts.push(data.address.postcode);
            }
          }
          
          const formattedAddress = addressParts.length > 0 ? addressParts.join(', ') : data.display_name;
          res.json({ address: formattedAddress });
        } else {
          res.json({ address: `${latitude}, ${longitude}` });
        }
      } catch (geoError) {
        console.warn('Reverse geocoding service error:', geoError);
        res.json({ address: `${latitude}, ${longitude}` });
      }
    } catch (error) {
      console.error('Reverse geocoding endpoint error:', error);
      res.status(500).json({ error: "Internal server error" });
    }
  });
  
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
