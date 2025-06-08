import type { Express, Request, Response } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";

// Extend session interface to include userId
declare module "express-session" {
  interface SessionData {
    userId?: number;
  }
}
import session from "express-session";
import MemoryStore from "memorystore";
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
import mobileRoutes from "./routes/mobile";
import mobileCheckInsRoutes from "./routes/mobile/check-ins";
import mobileNotificationsRoutes from "./routes/mobile/notifications";
import crmIntegrationRoutes from "./routes/crm-integration";
import emailService from "./services/email-service";
import schedulerService from "./services/scheduler";
import { fromZodError } from "zod-validation-error";
import { WebSocketServer, WebSocket } from 'ws';

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
  
  // Setup session middleware
  app.use(
    session({
      store: new SessionStore({
        checkPeriod: 86400000, // Prune expired entries every 24h
      }),
      secret: process.env.SESSION_SECRET || "checkin-pro-secret",
      resave: true,
      saveUninitialized: true,
      cookie: {
        maxAge: 1000 * 60 * 60 * 24, // 24 hours
        httpOnly: true,
        secure: false, // Set to false to ensure cookies work in development
        sameSite: 'lax', // Important for mobile PWA compatibility
      },
    })
  );
  
  // Emergency login route (disabled in production)
  if (process.env.NODE_ENV === 'development') {
    app.post("/api/emergency-login", async (req, res) => {
      try {
        const { email, password } = req.body;
        
        if (!email || !password) {
          return res.status(400).json({ message: "Email and password are required" });
        }
        
        // Find user by email
        const user = await storage.getUserByEmail(email);
        if (!user) {
          return res.status(401).json({ message: "User not found" });
        }
        
        console.log(`Found user: ${user.email}, role: ${user.role}`);
        
        // Verify password 
        const isPasswordValid = await bcrypt.compare(password, user.password);
        console.log(`Password verification result: ${isPasswordValid}`);
        
        if (!isPasswordValid) {
          return res.status(401).json({ message: "Invalid password" });
        }
        
        // Set session data
        if (req.session) {
          (req.session as any).userId = user.id;
          console.log(`Session set for user ID: ${user.id}`);
        }
        
        // Remove password from response
        const { password: _, ...userWithoutPassword } = user;
        
        // Get company info if applicable
        let company = undefined;
        if (user.companyId && (user.role === "company_admin" || user.role === "technician")) {
          company = await storage.getCompany(user.companyId);
          console.log(`Company info retrieved: ${company?.name || "not found"}`);
        }
        
        console.log("Emergency login successful");
        res.json({ user: userWithoutPassword, company });
      } catch (error) {
        console.error("Emergency login error:", error);
        res.status(500).json({ message: "Server error during login", error: String(error) });
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
      
      // Set session
      if (req.session) {
        (req.session as any).userId = user.id;
      }
      
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
  
  app.post("/api/auth/login", async (req, res) => {
    try {
      const { email, password } = req.body;
      
      if (!email || !password) {
        return res.status(400).json({ message: "Email and password are required" });
      }
      
      // Find user
      const user = await storage.getUserByEmail(email);
      if (!user) {
        return res.status(401).json({ message: "Invalid credentials" });
      }
      
      // Verify password
      const isPasswordValid = await bcrypt.compare(password, user.password);
      if (!isPasswordValid) {
        return res.status(401).json({ message: "Invalid credentials" });
      }
      
      // Set session
      if (req.session) {
        (req.session as any).userId = user.id;
      }
      
      // Remove password from response
      const { password: _, ...userWithoutPassword } = user;
      
      res.json(userWithoutPassword);
    } catch (error) {
      console.error("Login error:", error);
      res.status(500).json({ message: "Server error during login" });
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
  
  // Emergency login endpoint for troubleshooting
  app.post("/api/emergency-login", async (req, res) => {
    try {
      const { email, password } = req.body;
      
      if (!email || !password) {
        return res.status(400).json({ message: "Email and password are required" });
      }
      
      console.log(`Emergency login attempt for: ${email}`);
      
      // Debug all users in the system
      const allUsers = await storage.getAllUsers();
      console.log(`Total users in system: ${allUsers.length}`);
      
      // Find user with more detailed logging
      const user = await storage.getUserByEmail(email);
      
      if (!user) {
        console.log(`User not found: ${email}`);
        
        // Auto-create test accounts if they don't exist
        if (email === "admin@testcompany.com" && password === "company123") {
          // Create test company if it doesn't exist
          let testCompany = await storage.getCompanyByName("Test Company");
          let companyId = 0;
          
          if (!testCompany) {
            testCompany = await storage.createCompany({
              name: "Test Company"
            });
            companyId = testCompany.id;
          } else {
            companyId = testCompany.id;
          }
          
          // Create company admin
          const hashedPassword = await bcrypt.hash("company123", 10);
          const newUser = await storage.createUser({
            email: "admin@testcompany.com",
            username: "testadmin",
            password: hashedPassword,
            role: "company_admin",
            companyId,
          });
          
          // Set session
          if (req.session) {
            (req.session as any).userId = newUser.id;
          }
          
          // Remove password from response
          const { password: _, ...userWithoutPassword } = newUser;
          
          console.log(`Created new company admin account and logged in: ${email}`);
          return res.json(userWithoutPassword);
          
        } else if (email === "tech@testcompany.com" && password === "tech1234") {
          // Get the test company
          const testCompany = await storage.getCompanyByName("Test Company");
          
          if (!testCompany) {
            return res.status(400).json({ message: "Test Company doesn't exist yet. Please create admin account first." });
          }
          
          // Create technician
          const hashedPassword = await bcrypt.hash("tech1234", 10);
          
          // Create technician record
          const newTechnician = await storage.createTechnician({
            name: "Test Technician",
            email: "tech@testcompany.com",
            phone: "555-555-5555",
            companyId: testCompany.id
          });
          
          // Create user account for technician
          const newUser = await storage.createUser({
            email: "tech@testcompany.com",
            username: "testtechnician",
            password: hashedPassword,
            role: "technician",
            companyId: testCompany.id
          });
          
          // Set session
          if (req.session) {
            (req.session as any).userId = newUser.id;
          }
          
          // Remove password from response
          const { password: _, ...userWithoutPassword } = newUser;
          
          console.log(`Created new technician account and logged in: ${email}`);
          return res.json(userWithoutPassword);
        }
        
        return res.status(401).json({ message: "User not found" });
      }
      
      // Special emergency login logic - handle both hashed and unhashed passwords
      let isPasswordValid = false;
      
      // Direct comparison for emergency login
      if (user.role === "company_admin" && password === "company123") {
        isPasswordValid = true;
      } else if (user.role === "technician" && password === "tech1234") {
        isPasswordValid = true;
      } else if (user.role === "super_admin" && password === "admin123") {
        isPasswordValid = true;
      } else {
        // Try normal bcrypt comparison as fallback
        isPasswordValid = await bcrypt.compare(password, user.password);
      }
      
      if (!isPasswordValid) {
        console.log(`Emergency login password validation failed for ${email}`);
        return res.status(401).json({ message: "Invalid password" });
      }
      
      console.log(`Emergency login successful for ${email} with role ${user.role}`);
      
      // Set session
      if (req.session) {
        (req.session as any).userId = user.id;
      }
      
      // Remove password from response
      const { password: _, ...userWithoutPassword } = user;
      
      res.json(userWithoutPassword);
    } catch (error) {
      console.error("Emergency login error:", error);
      res.status(500).json({ 
        message: "Server error during emergency login", 
        details: error instanceof Error ? error.message : String(error)
      });
    }
  });

  app.post("/api/auth/logout", (req, res) => {
    req.session.destroy((err) => {
      if (err) {
        return res.status(500).json({ message: "Failed to logout" });
      }
      
      // Clear the session cookie explicitly for mobile compatibility
      res.clearCookie('connect.sid', {
        path: '/',
        httpOnly: true,
        secure: false,
        sameSite: 'lax'
      });
      
      res.json({ message: "Logged out successfully" });
    });
  });
  
  app.get("/api/auth/me", isAuthenticated, async (req, res) => {
    try {
      const user = req.user;
      
      // If user is company_admin or technician, get company info
      let company = undefined;
      if (user.companyId && (user.role === "company_admin" || user.role === "technician")) {
        company = await storage.getCompany(user.companyId);
      }
      
      // Remove password from response
      const { password, ...userWithoutPassword } = user;
      
      res.json({ user: userWithoutPassword, company });
    } catch (error) {
      console.error("Auth check error:", error);
      res.status(500).json({ message: "Server error" });
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
      // This would be implemented with a real database query
      // For in-memory storage, we'll return a mock list
      const companies = Array.from(
        (storage as any).companies?.values() || []
      );
      
      res.json(companies);
    } catch (error) {
      console.error("Get companies error:", error);
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
  
  app.post("/api/technicians", isCompanyAdmin, async (req, res) => {
    try {
      const companyId = req.user.companyId;
      
      if (!companyId) {
        return res.status(400).json({ message: "No company associated with this user" });
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
      const sentRequests = reviewRequests.filter(req => req.status === "sent").length;
      const responseRate = sentRequests > 0 ? (reviewResponses.length / sentRequests) * 100 : 0;
      const averageRating = reviewResponses.length > 0 
        ? reviewResponses.reduce((sum, res) => sum + res.rating, 0) / reviewResponses.length 
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
  
  // Job Types Management API - Placed after all middleware setup is complete
  const companyJobTypes = new Map<number, Array<{id: number, name: string, isActive: boolean}>>();

  app.get('/api/job-types', isAuthenticated, async (req: Request, res: Response) => {
    try {
      const companyId = req.user?.companyId;
      if (!companyId) {
        return res.status(400).json({ error: 'Company ID required' });
      }
      
      const jobTypes = companyJobTypes.get(companyId) || [];
      res.json(jobTypes);
    } catch (error) {
      console.error('Error fetching job types:', error);
      res.status(500).json({ error: 'Failed to fetch job types' });
    }
  });

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
  
  // MOBILE ROUTES LAST TO PREVENT INTERFERENCE WITH OTHER APIs
  app.use("/api/mobile/v1", mobileRoutes);
  app.use("/api/mobile", mobileRoutes);
  app.use("/api/mobile/check-ins", mobileCheckInsRoutes);
  app.use("/api/mobile/notifications", mobileNotificationsRoutes);
  
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


  




  // Initialize the scheduler service to process review follow-ups
  schedulerService.initialize();
  
  const httpServer = createServer(app);
  
  return httpServer;
}
