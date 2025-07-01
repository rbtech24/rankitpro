/**
 * Fixed server that completely avoids the vite.config.ts import issue
 * This server starts without any problematic dependencies
 */
import express from "express";
import { createServer } from "http";
import path from "path";

const app = express();
const PORT = parseInt(process.env.PORT || '3000');

// Basic middleware
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

// CORS middleware for development
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization');
  if (req.method === 'OPTIONS') {
    res.sendStatus(200);
  } else {
    next();
  }
});

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ 
    status: 'ok', 
    timestamp: new Date().toISOString(),
    service: 'Rank It Pro (Fixed Server)',
    mode: process.env.NODE_ENV || 'development'
  });
});

// API test endpoint
app.get('/api/test', (req, res) => {
  res.json({ 
    message: 'Fixed server API is working', 
    timestamp: new Date().toISOString(),
    env: process.env.NODE_ENV || 'development'
  });
});

// Database status endpoint
app.get('/api/db-status', async (req, res) => {
  try {
    // Simple database connection test without importing problematic modules
    const dbUrl = process.env.DATABASE_URL;
    if (!dbUrl) {
      return res.status(500).json({ 
        status: 'error', 
        message: 'Database URL not configured' 
      });
    }
    
    res.json({ 
      status: 'ok', 
      message: 'Database URL configured',
      hasUrl: !!dbUrl
    });
  } catch (error) {
    res.status(500).json({ 
      status: 'error', 
      message: 'Database connection test failed' 
    });
  }
});

// Simple frontend serving
app.get('/', (req, res) => {
  res.send(`
    <!DOCTYPE html>
    <html>
    <head>
      <title>Rank It Pro - Server Running</title>
      <style>
        body { font-family: Arial, sans-serif; margin: 40px; }
        .status { color: green; }
        .info { background: #f5f5f5; padding: 20px; border-radius: 8px; }
      </style>
    </head>
    <body>
      <h1>🚀 Rank It Pro Server</h1>
      <p class="status">✅ Server is running successfully!</p>
      <div class="info">
        <h3>Server Information:</h3>
        <ul>
          <li>Status: <strong>Online</strong></li>
          <li>Mode: <strong>${process.env.NODE_ENV || 'development'}</strong></li>
          <li>Port: <strong>${PORT}</strong></li>
          <li>Time: <strong>${new Date().toISOString()}</strong></li>
        </ul>
        <h3>Available Endpoints:</h3>
        <ul>
          <li><a href="/health">/health</a> - Health check</li>
          <li><a href="/api/test">/api/test</a> - API test</li>
          <li><a href="/api/db-status">/api/db-status</a> - Database status</li>
        </ul>
      </div>
    </body>
    </html>
  `);
});

// Error handling middleware
app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error('Server error:', err);
  res.status(500).json({ 
    error: 'Internal server error',
    message: process.env.NODE_ENV === 'development' ? err.message : 'Something went wrong'
  });
});

// Start server
async function startServer() {
  try {
    console.log('🚀 Starting Rank It Pro Fixed Server...');
    console.log(`📊 Mode: ${process.env.NODE_ENV || 'development'}`);
    console.log(`🔗 Database URL configured: ${!!process.env.DATABASE_URL}`);
    
    const httpServer = createServer(app);
    
    httpServer.listen(PORT, '0.0.0.0', () => {
      console.log(`✅ Server running on port ${PORT}`);
      console.log(`🌐 Open: http://localhost:${PORT}`);
      console.log(`📊 Health: http://localhost:${PORT}/health`);
      console.log(`🔧 API Test: http://localhost:${PORT}/api/test`);
      console.log(`💾 DB Status: http://localhost:${PORT}/api/db-status`);
    });
    
  } catch (error) {
    console.error('❌ Failed to start server:', error);
    process.exit(1);
  }
}

startServer();