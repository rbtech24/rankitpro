// Development server using Node.js built-in modules for dependency-free operation
import { createServer } from 'http';
import { readFileSync, existsSync, createReadStream } from 'fs';
import { join, extname } from 'path';
import { parse } from 'url';

// Parse request body
function parseBody(req: any) {
  return new Promise((resolve) => {
    let body = '';
    req.on('data', (chunk: any) => {
      body += chunk.toString();
    });
    req.on('end', () => {
      try {
        resolve(JSON.parse(body));
      } catch {
        resolve({});
      }
    });
  });
}

// Create server
const server = createServer(async (req: any, res: any) => {
  const parsedUrl = parse(req.url, true);
  const pathname = parsedUrl.pathname;
  
  // Set security headers
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('X-Frame-Options', 'DENY');
  res.setHeader('X-XSS-Protection', '1; mode=block');
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  
  // Handle preflight requests
  if (req.method === 'OPTIONS') {
    res.writeHead(200);
    res.end();
    return;
  }
  
  // API endpoints
  if (pathname === '/api/auth/login' && req.method === 'POST') {
    const body = await parseBody(req);
    const { email, password } = body as any;
    
    console.log('Login attempt:', email);
    
    // Demo authentication - multiple test accounts
    const validCredentials = [
      { email: 'bill@mrsprinklerrepair.com', password: 'admin123', role: 'super_admin' },
      { email: 'rodbartrufftech@gmail.com', password: 'tech123', role: 'company_admin' },
      { email: 'admin@test.com', password: 'admin123', role: 'admin' }
    ];
    
    const user = validCredentials.find(u => u.email === email && u.password === password);
    
    if (user) {
      res.writeHead(200, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ 
        success: true, 
        message: 'Login successful',
        user: { email: user.email, role: user.role }
      }));
    } else {
      res.writeHead(401, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ 
        success: false, 
        message: 'Invalid credentials' 
      }));
    }
    return;
  }
  
  if (pathname === '/api/auth/me' && req.method === 'GET') {
    res.writeHead(401, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ message: 'Not authenticated' }));
    return;
  }
  
  if (pathname === '/health' && req.method === 'GET') {
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ 
      status: 'healthy', 
      timestamp: new Date().toISOString(),
      deployment: 'development',
      port: process.env.PORT || 5000
    }));
    return;
  }
  
  if (pathname === '/api/health' && req.method === 'GET') {
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ 
      status: 'healthy',
      message: 'Development server is running',
      timestamp: new Date().toISOString(),
      environment: 'development'
    }));
    return;
  }
  
  // Try to serve static files from multiple locations
  const staticPaths = [
    join(process.cwd(), 'dist', 'public'),
    join(process.cwd(), 'client', 'dist'),
    join(process.cwd(), 'public')
  ];
  
  const filePath = pathname === '/' ? '/index.html' : pathname;
  let fileServed = false;
  
  for (const staticPath of staticPaths) {
    const fullPath = join(staticPath, filePath);
    if (existsSync(fullPath)) {
      const ext = extname(fullPath);
      const contentType = {
        '.html': 'text/html',
        '.js': 'text/javascript',
        '.css': 'text/css',
        '.json': 'application/json',
        '.png': 'image/png',
        '.jpg': 'image/jpeg',
        '.gif': 'image/gif',
        '.svg': 'image/svg+xml'
      }[ext] || 'text/plain';
      
      res.writeHead(200, { 'Content-Type': contentType });
      createReadStream(fullPath).pipe(res);
      fileServed = true;
      break;
    }
  }
  
  if (!fileServed) {
    // Create a basic development index.html if none exists
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
    </style>
</head>
<body>
    <div class="container">
        <h1>Rank It Pro - Development Server</h1>
        
        <div class="status">
            ✅ Development server is running successfully!
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
            <p><strong>Test Admin:</strong> admin@test.com / admin123</p>
        </div>
        
        <p>The server is running without dependencies and is ready for development.</p>
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
  console.log(`🌍 Health check: http://localhost:${PORT}/health`);
  console.log(`🔧 API health: http://localhost:${PORT}/api/health`);
  console.log(`📱 Application: http://localhost:${PORT}/`);
  console.log(`✅ Development server ready without dependencies!`);
});