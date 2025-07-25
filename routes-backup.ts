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
import { insertUserSchema, insertCompanySchema, insertCompanyLocationSchema, insertTechnicianSchema, insertCheckInSchema, insertBlogPostSchema, insertReviewRequestSchema, insertAPICredentialsSchema } from "@shared/schema";
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
import helpRoutes from "./routes/help";
import trialTestingRoutes from "./routes/trial-testing";
import rateLimitingRoutes from "./routes/admin/rate-limiting";
import emailService from "./services/email-service";
import schedulerService from "./services/scheduler";
import { analyticsService } from "./services/analytics-service";
import { fromZodError } from "zod-validation-error";
import { WebSocketServer, WebSocket } from 'ws';
import crypto from 'crypto';
import { securityMonitor, securityMonitoringMiddleware } from "./security-monitor";
import { penetrationTester } from "./penetration-tester";
import { sessionTester } from "./session-tester";
import { errorHandler, asyncHandler } from "./middleware/error-handler";
import { validateBody, validateParams, validateQuery, commonSchemas } from "./middleware/validation";
import { logger } from "./services/logger";
import { 
  globalErrorHandler, 
  notFoundHandler, 
  AppError, 
  ValidationError, 
  AuthenticationError, 
  NotFoundError,
  asyncHandler as safeAsyncHandler,
  successResponse,
  createdResponse,
  updatedResponse
} from "./middleware/error-handling";
import { 
  validateUser, 
  validateCompany, 
  validateCheckIn, 
  validateParams as validateInputParams,
  sanitizeAllInputs
} from "./middleware/input-validation";
import { setupSimpleAuth } from "./simple-auth";
import { enforceSessionTimeout, enforceConcurrentSessions, sessionMonitoring, cleanupSession } from "./middleware/session-management";
import { generalRateLimit, authRateLimit, passwordResetRateLimit, placeholderGenerationRateLimit, adminRateLimit } from "./middleware/rate-limiting";
import { securityHeaders, additionalSecurityHeaders, apiSecurityHeaders } from "./middleware/security-headers";

const SessionStore = MemoryStore(session);

// Map to store active WebSocket connections by company ID
const companyConnections = new Map<number, Set<WebSocket>>();
// Map to store active WebSocket connections by user ID
const userConnections = new Map<number, WebSocket>();
// Map to store chat session connections
const chatSessionConnections = new Map<string, Set<WebSocket>>();

export interface SessionRequest extends Request {
  session: session.Session & Partial<session.SessionData>;
  user?: {
    id: number;
    email: string;
    role: string;
    companyId: number | null;
  };
}

export default function registerRoutes(app: Express) {
  // Apply security middleware
  app.use(enforceSessionTimeout);
  app.use(enforceConcurrentSessions);
  app.use(sessionMonitoring);

  // Register all route modules
  app.use("/api/admin", adminRoutes);
  app.use("/api/admin/rate-limiting", rateLimitingRoutes);
  app.use("/api/sales", salesRoutes);
  app.use("/api/check-ins", checkInRoutes);
  app.use("/api/blog", blogRoutes);
  app.use("/api/wordpress", wordpressRoutes);
  app.use("/api/integration", integrationsRoutes);
  app.use("/api/generate-content", generateContentRoutes);

  // Add basic health check endpoint
  app.get("/api/health", (req: Request, res: Response) => {
    res.json({ status: "ok", timestamp: new Date().toISOString() });
  });

  console.log("✅ All routes registered successfully");
}