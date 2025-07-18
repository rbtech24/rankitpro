#!/usr/bin/env node

const { spawn } = require('child_process');
const fs = require('fs');
const path = require('path');

console.log('🚀 Starting Rank It Pro Development Server...');

// Check if we have a working Node.js server
const serverFiles = [
  'simple-server.js',
  'index.js',
  'server.js'
];

let serverToUse = null;

for (const file of serverFiles) {
  if (fs.existsSync(path.join(__dirname, file))) {
    serverToUse = file;
    break;
  }
}

if (!serverToUse) {
  console.error('❌ No server file found. Creating a basic server...');
  
  const basicServer = `
const http = require('http');
const fs = require('fs');
const path = require('path');
const url = require('url');

const server = http.createServer((req, res) => {
  const parsedUrl = url.parse(req.url, true);
  const pathname = parsedUrl.pathname;
  
  // CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  
  if (req.method === 'OPTIONS') {
    res.writeHead(200);
    res.end();
    return;
  }
  
  // Health check
  if (pathname === '/health') {
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ status: 'healthy', timestamp: new Date().toISOString() }));
    return;
  }
  
  // Try to serve client files
  const clientPaths = [
    path.join(__dirname, 'client', 'dist'),
    path.join(__dirname, 'dist', 'public'),
    path.join(__dirname, 'public')
  ];
  
  const filePath = pathname === '/' ? '/index.html' : pathname;
  
  for (const clientPath of clientPaths) {
    const fullPath = path.join(clientPath, filePath);
    if (fs.existsSync(fullPath)) {
      const ext = path.extname(fullPath);
      const contentType = {
        '.html': 'text/html',
        '.js': 'text/javascript',
        '.css': 'text/css',
        '.json': 'application/json'
      }[ext] || 'text/plain';
      
      res.writeHead(200, { 'Content-Type': contentType });
      fs.createReadStream(fullPath).pipe(res);
      return;
    }
  }
  
  // Basic HTML response
  res.writeHead(200, { 'Content-Type': 'text/html' });
  res.end(\`<!DOCTYPE html>
<html>
<head><title>Rank It Pro</title></head>
<body>
  <h1>Rank It Pro - Server Running</h1>
  <p>Server is running on port \${process.env.PORT || 5000}</p>
  <p>Health check: <a href="/health">/health</a></p>
</body>
</html>\`);
});

const PORT = process.env.PORT || 5000;
server.listen(PORT, '0.0.0.0', () => {
  console.log(\`🚀 Server running on port \${PORT}\`);
});
  `;
  
  fs.writeFileSync(path.join(__dirname, 'emergency-server.js'), basicServer);
  serverToUse = 'emergency-server.js';
}

console.log(`✅ Using server: ${serverToUse}`);
console.log('📡 Starting server process...');

// Start the server
const serverProcess = spawn('node', [serverToUse], {
  stdio: 'inherit',
  env: { ...process.env, PORT: process.env.PORT || 5000 }
});

serverProcess.on('close', (code) => {
  console.log(`Server process exited with code ${code}`);
  process.exit(code);
});

serverProcess.on('error', (error) => {
  console.error('Failed to start server:', error);
  process.exit(1);
});

// Handle graceful shutdown
process.on('SIGINT', () => {
  console.log('\\n📛 Shutting down server...');
  serverProcess.kill('SIGINT');
});

process.on('SIGTERM', () => {
  console.log('\\n📛 Shutting down server...');
  serverProcess.kill('SIGTERM');
});