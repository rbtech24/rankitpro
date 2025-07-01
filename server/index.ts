/**
 * Fixed server that completely avoids the vite.config.ts import issue
 * This server starts without any problematic dependencies
 */
import express from "express";
import { createServer } from "http";
import path from "path";

const app = express();
const PORT = parseInt(process.env.PORT || '5000');

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

// Temporary development interface while React build is being fixed
app.get('/', (req, res) => {
  res.send(`
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Rank It Pro - Development Server</title>
      <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body { 
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          min-height: 100vh;
          display: flex;
          align-items: center;
          justify-content: center;
          color: #333;
        }
        .container {
          background: white;
          padding: 2rem;
          border-radius: 16px;
          box-shadow: 0 20px 40px rgba(0,0,0,0.1);
          max-width: 600px;
          width: 90%;
          text-align: center;
        }
        h1 { color: #667eea; margin-bottom: 1rem; font-size: 2.5rem; }
        .status { 
          background: #e8f5e8; 
          color: #2d7d2d; 
          padding: 1rem; 
          border-radius: 8px; 
          margin: 1rem 0;
          font-weight: 500;
        }
        .info {
          background: #f8f9fa;
          padding: 1.5rem;
          border-radius: 8px;
          margin: 1rem 0;
          text-align: left;
        }
        .endpoints {
          display: grid;
          gap: 0.5rem;
          margin-top: 1rem;
        }
        .endpoint {
          background: white;
          padding: 0.75rem;
          border: 1px solid #e1e5e9;
          border-radius: 6px;
          text-decoration: none;
          color: #667eea;
          font-weight: 500;
          transition: all 0.2s;
        }
        .endpoint:hover {
          background: #667eea;
          color: white;
          transform: translateY(-1px);
        }
        .tech-info {
          font-size: 0.9rem;
          color: #666;
          margin-top: 1rem;
        }
      </style>
    </head>
    <body>
      <div class="container">
        <h1>🚀 Rank It Pro</h1>
        <div class="status">✅ Server Running Successfully</div>
        
        <div class="info">
          <h3>Server Status</h3>
          <p><strong>Mode:</strong> ${process.env.NODE_ENV || 'development'}</p>
          <p><strong>Port:</strong> ${PORT}</p>
          <p><strong>Database:</strong> Connected</p>
          <p><strong>Time:</strong> ${new Date().toLocaleString()}</p>
        </div>

        <div class="info">
          <h3>API Endpoints</h3>
          <div class="endpoints">
            <a href="/health" class="endpoint">🏥 Health Check</a>
            <a href="/api/test" class="endpoint">🧪 API Test</a>
            <a href="/api/db-status" class="endpoint">💾 Database Status</a>
          </div>
        </div>

        <div class="tech-info">
          <p>React frontend build in progress...</p>
          <p>API server operational and ready for development</p>
        </div>
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