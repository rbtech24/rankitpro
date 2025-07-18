const http = require('http');
const path = require('path');
const fs = require('fs');

// Simple HTTP server without Express
const server = http.createServer((req, res) => {
  // Set CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  
  if (req.method === 'OPTIONS') {
    res.writeHead(200);
    res.end();
    return;
  }
  
  // Basic routing
  if (req.url === '/health') {
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ status: 'healthy', timestamp: new Date().toISOString() }));
    return;
  }
  
  if (req.url === '/api/health') {
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ 
      status: 'healthy',
      message: 'Server is running',
      timestamp: new Date().toISOString()
    }));
    return;
  }
  
  // Serve static files from dist/public
  const filePath = req.url === '/' ? '/index.html' : req.url;
  const fullPath = path.join(__dirname, 'dist', 'public', filePath);
  
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
      '.svg': 'image/svg+xml'
    }[ext] || 'text/plain';
    
    res.writeHead(200, { 'Content-Type': contentType });
    fs.createReadStream(fullPath).pipe(res);
  } else {
    // Return 404 for missing files
    res.writeHead(404, { 'Content-Type': 'text/plain' });
    res.end('Not Found');
  }
});

const PORT = process.env.PORT || 5000;
server.listen(PORT, '0.0.0.0', () => {
  console.log(`✅ Server running on port ${PORT}`);
  console.log(`🌍 Health check: http://localhost:${PORT}/health`);
  console.log(`🔧 API health: http://localhost:${PORT}/api/health`);
});