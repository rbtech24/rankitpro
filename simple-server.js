const http = require('http');
const fs = require('fs');
const path = require('path');

// Simple HTTP server to get the app running
const server = http.createServer((req, res) => {
  console.log(`${req.method} ${req.url}`);
  
  // Handle health check
  if (req.url === '/health') {
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ 
      status: 'healthy', 
      timestamp: new Date().toISOString(),
      server: 'simple-http-server'
    }));
    return;
  }
  
  // Handle API login endpoint
  if (req.url === '/api/auth/login' && req.method === 'POST') {
    let body = '';
    req.on('data', chunk => {
      body += chunk.toString();
    });
    req.on('end', () => {
      try {
        const { email, password } = JSON.parse(body);
        console.log('Login attempt:', email);
        
        if (email === 'bill@mrsprinklerrepair.com' && password === 'admin123') {
          res.writeHead(200, { 'Content-Type': 'application/json' });
          res.end(JSON.stringify({ 
            success: true, 
            message: 'Login successful',
            user: { email, role: 'admin' }
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
        res.end(JSON.stringify({ success: false, message: 'Invalid JSON' }));
      }
    });
    return;
  }
  
  // Handle static files
  let filePath = path.join(__dirname, 'dist/public');
  if (req.url === '/') {
    filePath = path.join(filePath, 'index.html');
  } else {
    filePath = path.join(filePath, req.url);
  }
  
  // Check if file exists
  if (fs.existsSync(filePath)) {
    const ext = path.extname(filePath);
    const contentType = getContentType(ext);
    
    res.writeHead(200, { 'Content-Type': contentType });
    fs.createReadStream(filePath).pipe(res);
  } else {
    // Try to serve index.html for client-side routing
    const indexPath = path.join(__dirname, 'dist/public/index.html');
    if (fs.existsSync(indexPath)) {
      res.writeHead(200, { 'Content-Type': 'text/html' });
      fs.createReadStream(indexPath).pipe(res);
    } else {
      res.writeHead(404, { 'Content-Type': 'text/plain' });
      res.end('404 Not Found');
    }
  }
});

function getContentType(ext) {
  const types = {
    '.html': 'text/html',
    '.css': 'text/css',
    '.js': 'application/javascript',
    '.json': 'application/json',
    '.png': 'image/png',
    '.jpg': 'image/jpeg',
    '.jpeg': 'image/jpeg',
    '.gif': 'image/gif',
    '.svg': 'image/svg+xml',
    '.ico': 'image/x-icon'
  };
  return types[ext] || 'application/octet-stream';
}

const PORT = process.env.PORT || 3000;
server.listen(PORT, '0.0.0.0', () => {
  console.log(`🚀 Simple HTTP server running on port ${PORT}`);
  console.log('📊 Bypassing npm dependency issues');
});