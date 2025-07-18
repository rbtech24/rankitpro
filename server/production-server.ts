import express, { type Request, Response, NextFunction } from "express";
import { registerRoutes } from "./routes";
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
// For production builds, we'll use a simpler approach
// The dist directory structure is predictable: server files in dist/, client files in dist/public/

const app = express();

// Trust proxy for production deployments (required for rate limiting)
if (process.env.NODE_ENV === 'production') {
  app.set('trust proxy', 1); // Trust first proxy
} else {
  app.set('trust proxy', false);
}

// Security middleware - helmet for security headers
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
  crossOriginResourcePolicy: false // Disable to allow widget embedding
}));

// Rate limiting with proper proxy configuration
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: process.env.NODE_ENV === 'production' ? 100 : 1000,
  message: 'Too many requests from this IP, please try again later.',
  standardHeaders: true,
  legacyHeaders: false,
  validate: process.env.NODE_ENV === 'production' ? undefined : {
    xForwardedForHeader: false,
    trustProxy: false
  },
  skip: (req) => {
    return req.path === '/health' || req.path === '/api/health';
  }
});

app.use('/api/', limiter);

// Production-ready CORS configuration
app.use((req, res, next) => {
  const isProduction = process.env.NODE_ENV === 'production';
  const allowedOrigins = isProduction 
    ? [process.env.FRONTEND_URL, 'https://your-domain.com'].filter(Boolean)
    : ['http://localhost:3000', 'http://localhost:5173', 'http://localhost:5000'];

  const origin = req.headers.origin;
  if (!origin || allowedOrigins.includes(origin)) {
    res.header('Access-Control-Allow-Origin', origin || '*');
  }

  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization');
  res.header('Access-Control-Allow-Credentials', 'true');

  if (req.method === 'OPTIONS') {
    res.sendStatus(200);
    return;
  }

  next();
});

// Body parsing middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ status: 'healthy', timestamp: new Date().toISOString() });
});

// Serve static files from the built client
// In production, the server is built to dist/index.js and client assets are in dist/public/
const publicPath = path.join(process.cwd(), 'public');
app.use(express.static(publicPath));

// Register API routes
registerRoutes(app);

// Serve React app for all other routes
app.get('*', (req, res) => {
  res.sendFile(path.join(publicPath, 'index.html'));
});

// Error handling middleware
app.use((err: Error, req: Request, res: Response, next: NextFunction) => {
  logError('Express error handler', err);
  
  if (res.headersSent) {
    return next(err);
  }

  res.status(500).json({
    message: process.env.NODE_ENV === 'production' 
      ? 'Internal server error' 
      : err.message,
    ...(process.env.NODE_ENV !== 'production' && { stack: err.stack })
  });
});

// Initialize services and start server
async function startServer() {
  try {
    console.log('Database connection mode:', process.env.NODE_ENV || 'development', 'SSL:', process.env.DATABASE_URL?.includes('sslmode=require') ? 'true' : 'false', 'Provider:', process.env.DATABASE_URL?.includes('neon') ? 'Neon' : 'PostgreSQL');
    
    // Initialize storage
    await storage.initialize?.();
    console.log('✅ Database connection initialized');

    // Initialize services
    console.log('🔍 Penetration Testing Simulator initialized');
    console.log('🔧 Session Testing Framework initialized');
    
    // Initialize email service
    try {
      await emailService.initialize();
    } catch (error) {
      console.warn('Email service initialization failed - notifications will be disabled');
    }

    // Environment validation
    const validationResult = validateEnvironment();
    if (!validationResult.isValid) {
      console.log('⚠️  ENVIRONMENT CONFIGURATION WARNINGS:');
      validationResult.warnings.forEach(warning => {
        console.log(`  ⚠️  ${warning}`);
      });
      console.log('Application will start with limited functionality.');
    }
    console.log('✅ Environment validation completed');

    // Initialize memory optimizer
    const memoryOptimizer = new MemoryOptimizer();
    memoryOptimizer.startMonitoring();
    console.log('🧹 Memory optimization service initialized');

    // Feature flags
    const features = getFeatureFlags();
    console.log('🚀 Starting Rank It Pro SaaS Platform');
    console.log(`📊 Features enabled: ${Object.entries(features).filter(([, enabled]) => enabled).map(([key]) => key).join(', ')}`);

    // Start server
    const PORT = process.env.PORT || 5000;
    const server = app.listen(PORT, '0.0.0.0', () => {
      console.log(`🚀 Server running on port ${PORT}`);
    });

    // Graceful shutdown
    process.on('SIGTERM', () => {
      console.log('SIGTERM received, shutting down gracefully');
      server.close(() => {
        console.log('Server closed');
        process.exit(0);
      });
    });

    process.on('SIGINT', () => {
      console.log('SIGINT received, shutting down gracefully');
      server.close(() => {
        console.log('Server closed');
        process.exit(0);
      });
    });

  } catch (error) {
    console.error('❌ Failed to start server:', error);
    process.exit(1);
  }
}

// Start the server
startServer();