const express = require('express');
const path = require('path');
const session = require('express-session');
const cors = require('cors');
const helmet = require('helmet');

// Production-specific imports (no Vite)
const { createRoutes } = require('./routes');
const { initializeDatabase, storage } = require('./storage');
const { authMiddleware } = require('./middleware/auth');
const { validationMiddleware } = require('./middleware/validation');
const { rateLimitMiddleware } = require('./middleware/rate-limit');
const { securityMiddleware } = require('./middleware/security');
const { errorMiddleware } = require('./middleware/error-handling');
const { createWebSocketServer } = require('./websocket-server');
const { logger } = require('./services/logger');

const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 5000;

// Initialize database
(async () => {
  await initializeDatabase();

// Security middleware
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      scriptSrc: ["'self'", "'unsafe-inline'", "'unsafe-eval'", "https://js.stripe.com"],
      styleSrc: ["'self'", "'unsafe-inline'", "https://fonts.googleapis.com"],
      fontSrc: ["'self'", "https://fonts.gstatic.com"],
      imgSrc: ["'self'", "data:", "https:", "blob:"],
      connectSrc: ["'self'", "https://api.stripe.com", "wss:"],
      frameSrc: ["'self'", "https://js.stripe.com"],
      frameAncestors: ["'none'"],
    },
  },
  crossOriginEmbedderPolicy: false,
}));

// CORS configuration
app.use(cors({
  origin: process.env.NODE_ENV === 'production' 
    ? [process.env.FRONTEND_URL, /\.replit\.app$/, /\.render\.com$/].filter(Boolean)
    : true,
  credentials: true,
}));

// Body parsing
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ success: true }));

// Session configuration
app.use(session({
  secret: process.env.SESSION_SECRET || 'your-secret-key',
  resave: false,
  saveUninitialized: false,
  cookie: {
    secure: process.env.NODE_ENV === 'production',
    httpOnly: true,
    maxAge: process.env.NODE_ENV === 'production' ? 2 * 60 * 60 * 1000 : 4 * 60 * 60 * 1000, // 2hrs prod, 4hrs dev
    sameSite: 'lax'
  }
}));

// Apply middleware
app.use(securityMiddleware);
app.use(validationMiddleware);
app.use(rateLimitMiddleware);

// Serve static files from dist/public in production
app.use(express.static(path.join(__dirname, 'public')));

// API routes
app.use('/api', createRoutes());

// Serve React app for all other routes
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Error handling
app.use(errorMiddleware);

// Create HTTP server
const server = app.listen(PORT, '0.0.0.0', () => {
  logger.info("Template literal converted");`);
  logger.info("Template literal converted");`);
  logger.info("Template literal converted");`);
});

// Initialize WebSocket server
createWebSocketServer(server);

// Graceful shutdown
process.on('SIGTERM', () => {
  logger.info('SIGTERM received, shutting down gracefully');
  server.close(() => {
    logger.info('Process terminated');
    process.exit(0);
  });
});

process.on('SIGINT', () => {
  logger.info('SIGINT received, shutting down gracefully');
  server.close(() => {
    logger.info('Process terminated');
    process.exit(0);
  });
});

})().catch(console.error);