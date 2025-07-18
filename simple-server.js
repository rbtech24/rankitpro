const http = require('http');
const fs = require('fs');
const path = require('path');
const url = require('url');

// Simple HTTP server using only Node.js built-in modules
const server = http.createServer((req, res) => {
  const parsedUrl = url.parse(req.url, true);
  const pathname = parsedUrl.pathname;
  const method = req.method;

  // Set CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  
  // Handle preflight requests
  if (method === 'OPTIONS') {
    res.writeHead(200);
    res.end();
    return;
  }

  // Health check endpoint
  if (pathname === '/health') {
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({
      status: 'healthy',
      timestamp: new Date().toISOString(),
      message: 'Simple Node.js server running'
    }));
    return;
  }

  // API health endpoint
  if (pathname === '/api/health') {
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({
      status: 'healthy',
      message: 'API server is running',
      timestamp: new Date().toISOString()
    }));
    return;
  }

  // Simple login endpoint
  if (pathname === '/api/auth/login' && method === 'POST') {
    let body = '';
    req.on('data', chunk => body += chunk.toString());
    req.on('end', () => {
      try {
        const { email, password } = JSON.parse(body);
        
        // Simple authentication
        if (email === 'bill@mrsprinklerrepair.com' && password === 'admin123') {
          res.writeHead(200, { 'Content-Type': 'application/json' });
          res.end(JSON.stringify({
            success: true,
            message: 'Login successful',
            user: { email, role: 'super_admin' }
          }));
        } else if (email === 'rodbartrufftech@gmail.com' && password === 'tech123') {
          res.writeHead(200, { 'Content-Type': 'application/json' });
          res.end(JSON.stringify({
            success: true,
            message: 'Login successful',
            user: { email, role: 'company_admin' }
          }));
        } else {
          res.writeHead(401, { 'Content-Type': 'application/json' });
          res.end(JSON.stringify({
            success: false,
            message: 'Invalid credentials'
          }));
        }
      } catch (error) {
        res.writeHead(400, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({
          success: false,
          message: 'Invalid JSON'
        }));
      }
    });
    return;
  }

  // User info endpoint
  if (pathname === '/api/auth/me') {
    res.writeHead(401, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({
      message: 'Not authenticated'
    }));
    return;
  }

  // Try to serve static files if they exist
  const staticPaths = [
    path.join(__dirname, 'dist', 'public'),
    path.join(__dirname, 'client', 'dist'),
    path.join(__dirname, 'public')
  ];

  const filePath = pathname === '/' ? '/index.html' : pathname;
  let fileServed = false;

  for (const staticPath of staticPaths) {
    const fullPath = path.join(staticPath, filePath);
    if (fs.existsSync(fullPath)) {
      const ext = path.extname(fullPath);
      const contentType = {
        '.html': 'text/html',
        '.js': 'text/javascript',
        '.css': 'text/css',
        '.json': 'application/json',
        '.png': 'image/png',
        '.jpg': 'image/jpeg',
        '.gif': 'image/gif',
        '.svg': 'image/svg+xml',
        '.ico': 'image/x-icon'
      }[ext] || 'text/plain';

      res.writeHead(200, { 'Content-Type': contentType });
      fs.createReadStream(fullPath).pipe(res);
      fileServed = true;
      break;
    }
  }

  if (!fileServed) {
    // Serve a simple HTML page for the root path
    if (pathname === '/' || pathname === '/index.html') {
      res.writeHead(200, { 'Content-Type': 'text/html' });
      res.end(`<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Rank It Pro - Development Server</title>
    <style>
        body { font-family: Arial, sans-serif; margin: 0; padding: 20px; background: #f5f5f5; }
        .container { max-width: 800px; margin: 0 auto; background: white; padding: 30px; border-radius: 10px; box-shadow: 0 2px 10px rgba(0,0,0,0.1); }
        h1 { color: #333; text-align: center; }
        .status { background: #d4edda; color: #155724; padding: 15px; border-radius: 5px; margin: 20px 0; }
        .endpoints { background: #f8f9fa; padding: 20px; border-radius: 5px; margin: 20px 0; }
        .endpoint { margin: 10px 0; font-family: monospace; background: #e9ecef; padding: 8px; border-radius: 3px; }
        .credentials { background: #fff3cd; color: #856404; padding: 15px; border-radius: 5px; margin: 20px 0; }
        .issue { background: #f8d7da; color: #721c24; padding: 15px; border-radius: 5px; margin: 20px 0; }
        .solution { background: #cce5ff; color: #0056b3; padding: 15px; border-radius: 5px; margin: 20px 0; }
    </style>
</head>
<body>
    <div class="container">
        <h1>Rank It Pro - Development Server</h1>
        
        <div class="status">
            ✅ Simple Node.js server is running successfully!
        </div>

        <div class="issue">
            <h3>Current Issue:</h3>
            <p>The project has dependency conflicts preventing proper npm installation. The main issue is with <code>string-width-cjs@^4.2.3</code> and tsx not being available.</p>
        </div>

        <div class="solution">
            <h3>Temporary Solution:</h3>
            <p>Running a simple Node.js server without external dependencies to get the app working while we fix the underlying issues.</p>
        </div>
        
        <div class="endpoints">
            <h3>Available Endpoints:</h3>
            <div class="endpoint">GET /health - Server health check</div>
            <div class="endpoint">GET /api/health - API health check</div>
            <div class="endpoint">POST /api/auth/login - Authentication endpoint</div>
            <div class="endpoint">GET /api/auth/me - Current user info</div>
        </div>
        
        <div class="credentials">
            <h3>Test Credentials:</h3>
            <p><strong>Super Admin:</strong> bill@mrsprinklerrepair.com / admin123</p>
            <p><strong>Company Admin:</strong> rodbartrufftech@gmail.com / tech123</p>
        </div>
        
        <p>The server is running without external dependencies and is ready for testing the API endpoints.</p>
    </div>
</body>
</html>`);
    } else {
      res.writeHead(404, { 'Content-Type': 'text/plain' });
      res.end('Not Found');
    }
  }
});

const PORT = process.env.PORT || 5000;
server.listen(PORT, '0.0.0.0', () => {
  console.log(`🚀 Rank It Pro Development Server running on port ${PORT}`);
  console.log(`🌍 Access the app at: http://localhost:${PORT}`);
  console.log(`🔧 API endpoints available at: http://localhost:${PORT}/api/*`);
  console.log(`📊 Health check: http://localhost:${PORT}/health`);
  console.log(`✅ Server running with zero external dependencies!`);
});