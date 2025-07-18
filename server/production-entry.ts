import express, { type Request, Response, NextFunction } from "express";
import { storage } from "./storage";
import bcrypt from "bcrypt";
import emailService from "./services/resend-email-service";
import { validateEnvironment, getFeatureFlags } from "./env-validation";
import path from "path";
import { createServer, IncomingMessage, ServerResponse } from "http";
import rateLimit from "express-rate-limit";
import helmet from "helmet";
import MemoryOptimizer from "./services/memory-optimizer";
import { errorMonitor, logError } from "./error-monitor";

// Import specific route modules directly (avoiding the registerRoutes wrapper)
import checkInRoutes from "./routes/check-in";
import reviewRoutes from "./routes/review";
import blogRoutes from "./routes/blog";
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
import crmIntegrationRoutes from "./routes/crm-integration";
import salesRoutes from "./routes/sales";
import supportRoutes from "./routes/support";
import embedRoutes from "./routes/embed";
import publicBlogRoutes from "./routes/public-blog";
import publicReviewsRoutes from "./routes/public-reviews";
import publicCompanyRoutes from "./routes/public-company";
import testimonialsRoutes from "./routes/testimonials";
import helpRoutes from "./routes/help";
import session from "express-session";
import MemoryStore from "memorystore";
import connectPg from "connect-pg-simple";
import { neon } from "@neondatabase/serverless";
import { insertUserSchema, insertCompanySchema } from "@shared/schema";
import { apiCredentialService } from "./services/api-credentials";
import { isAuthenticated, isCompanyAdmin, isSuperAdmin } from "./middleware/auth";
import { enforceTrialLimits } from "./middleware/trial-enforcement";
import multer from "multer";
import { z } from "zod";
import { WebSocketServer } from "ws";
import { securityMonitor } from "./security-monitor";
import { analyticsService } from "./services/analytics-service";

const app = express();

// Simple logging function for production
function log(message: string, source = "express") {
  const formattedTime = new Date().toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "2-digit",
    second: "2-digit",
    hour12: true,
  });
  console.log(`${formattedTime} [${source}] ${message}`);
}

// Trust proxy for production deployments
app.set('trust proxy', 1);

// Security middleware
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'", "https://fonts.googleapis.com"],
      fontSrc: ["'self'", "https://fonts.gstatic.com"],
      imgSrc: ["'self'", "data:", "https:"],
      scriptSrc: [
        "'self'", 
        "'unsafe-inline'", 
        "'unsafe-eval'",
        "https://js.stripe.com",
        "https://replit.com"
      ],
      connectSrc: [
        "'self'", 
        "https://api.openai.com", 
        "https://api.anthropic.com",
        "https://api.stripe.com",
        "wss:"
      ]
    }
  },
  crossOriginResourcePolicy: false
}));

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  message: {
    error: "Too many requests from this IP",
    retryAfter: "15 minutes"
  },
  standardHeaders: true,
  legacyHeaders: false,
  trustProxy: true
});

app.use(limiter);

// Express configuration
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: false }));

// Memory optimization
const memoryOptimizer = new MemoryOptimizer();
memoryOptimizer.start();

// Initialize error monitoring
errorMonitor.initialize(app);

// Database connection
const DATABASE_URL = process.env.DATABASE_URL;
if (!DATABASE_URL) {
  throw new Error("DATABASE_URL is required");
}

const isDevelopment = process.env.NODE_ENV !== 'production';
const isNeonDatabase = DATABASE_URL.includes('neon.tech');

console.log(`Database connection mode: ${isDevelopment ? 'development' : 'production'}, SSL: ${isNeonDatabase}, Provider: ${isNeonDatabase ? 'Neon' : 'PostgreSQL'}`);

// Session configuration
const MemoryStoreSession = MemoryStore(session);
const pgSession = connectPg(session);

const sessionConfig = {
  secret: process.env.SESSION_SECRET || 'your-secret-key-here',
  resave: false,
  saveUninitialized: false,
  cookie: {
    secure: process.env.NODE_ENV === 'production',
    httpOnly: true,
    maxAge: isDevelopment ? 4 * 60 * 60 * 1000 : 2 * 60 * 60 * 1000,
    sameSite: 'lax' as const
  },
  store: isNeonDatabase ? new pgSession({
    conString: DATABASE_URL,
    createTableIfMissing: true
  }) : new MemoryStoreSession({
    checkPeriod: 86400000
  })
};

app.use(session(sessionConfig));

// Simple static file serving for production
app.use(express.static(path.join(__dirname, 'public')));

// Configure multer for file uploads
const storage_multer = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/');
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + '-' + file.originalname);
  }
});

const upload = multer({ storage: storage_multer });

// Auth routes
app.post("/api/auth/login", async (req, res) => {
  try {
    const { email, password } = req.body;
    
    const user = await storage.getUserByEmail(email);
    if (!user) {
      return res.status(401).json({ message: "Invalid credentials" });
    }
    
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return res.status(401).json({ message: "Invalid credentials" });
    }
    
    if (!user.active) {
      return res.status(401).json({ message: "Account is disabled" });
    }
    
    req.session.userId = user.id;
    
    await new Promise<void>((resolve, reject) => {
      req.session.save((err: any) => {
        if (err) {
          reject(new Error("Session save failed"));
        } else {
          resolve();
        }
      });
    });
    
    const { password: _, ...userWithoutPassword } = user;
    res.json(userWithoutPassword);
  } catch (error) {
    console.error("Login error:", error);
    res.status(500).json({ message: "Internal server error" });
  }
});

app.get("/api/auth/me", isAuthenticated, async (req, res) => {
  try {
    const user = await storage.getUserById(req.session.userId!);
    if (!user) {
      return res.status(401).json({ message: "User not found" });
    }
    
    const { password: _, ...userWithoutPassword } = user;
    res.json(userWithoutPassword);
  } catch (error) {
    console.error("Get current user error:", error);
    res.status(500).json({ message: "Internal server error" });
  }
});

app.post("/api/auth/logout", (req, res) => {
  req.session.destroy((err) => {
    if (err) {
      console.error("Logout error:", err);
      return res.status(500).json({ message: "Could not log out" });
    }
    res.clearCookie('connect.sid');
    res.json({ message: "Logged out successfully" });
  });
});

// Mount route modules
app.use('/api/check-ins', checkInRoutes);
app.use('/api/reviews', reviewRoutes);
app.use('/api/blog', blogRoutes);
app.use('/api/review-requests', reviewRequestRoutes);
app.use('/api/review-responses', reviewResponseRoutes);
app.use('/api/review-automation', reviewAutomationRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/wordpress-custom-fields', wordpressCustomFieldsRoutes);
app.use('/api/js-widget', jsWidgetRoutes);
app.use('/api/billing', billingRoutes);
app.use('/api/users', userRoutes);
app.use('/api/ai-providers', aiProvidersRoutes);
app.use('/api/generate-content', generateContentRoutes);
app.use('/api/crm-integration', crmIntegrationRoutes);
app.use('/api/sales', salesRoutes);
app.use('/api/support', supportRoutes);
app.use('/api/embed', embedRoutes);
app.use('/api/public-blog', publicBlogRoutes);
app.use('/api/public-reviews', publicReviewsRoutes);
app.use('/api/public-company', publicCompanyRoutes);
app.use('/api/testimonials', testimonialsRoutes);
app.use('/api/help', helpRoutes);

// Catch-all route for SPA
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Error handling middleware
app.use((err: any, req: Request, res: Response, next: NextFunction) => {
  console.error('Server error:', err);
  
  if (err.code === 'EBADCSRFTOKEN') {
    return res.status(403).json({ message: 'Invalid CSRF token' });
  }
  
  res.status(500).json({ message: 'Internal server error' });
});

// Create HTTP server
const server = createServer(app);

// Initialize WebSocket server
const wss = new WebSocketServer({ 
  server: server, 
  path: '/ws',
  perMessageDeflate: false,
  maxPayload: 16 * 1024
});

wss.on('error', (error) => {
  console.error('WebSocket Server Error:', error);
});

wss.on('connection', (ws, req) => {
  console.log('✅ WebSocket connection established from:', req.socket.remoteAddress);
  
  ws.send(JSON.stringify({ 
    type: 'connection_confirmed', 
    timestamp: new Date().toISOString() 
  }));
  
  ws.on('message', async (message) => {
    try {
      const data = JSON.parse(message.toString());
      
      if (data.type === 'ping') {
        ws.send(JSON.stringify({ type: 'pong', timestamp: new Date().toISOString() }));
      }
    } catch (error) {
      console.error('WebSocket message error:', error);
    }
  });
  
  ws.on('close', () => {
    console.log('WebSocket connection closed');
  });
  
  ws.on('error', (error) => {
    console.error('WebSocket connection error:', error);
  });
});

// Start server
const PORT = process.env.PORT || 3000;
server.listen(PORT, "0.0.0.0", () => {
  log(`Server running on port ${PORT}`, "server");
  console.log(`✅ Database connection initialized`);
});

// Graceful shutdown
process.on('SIGTERM', () => {
  console.log('SIGTERM received, shutting down gracefully');
  server.close(() => {
    console.log('Process terminated');
    process.exit(0);
  });
});

process.on('SIGINT', () => {
  console.log('SIGINT received, shutting down gracefully');
  server.close(() => {
    console.log('Process terminated');
    process.exit(0);
  });
});

export default app;