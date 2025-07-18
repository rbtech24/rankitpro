const { spawn } = require('child_process');
const fs = require('fs');

// Kill any existing server process
try {
  const { execSync } = require('child_process');
  execSync('pkill -f "node.*server" || true', { stdio: 'ignore' });
} catch (e) {}

// Wait a moment then start server
setTimeout(() => {
  console.log('Starting Rank It Pro server...');
  
  const serverFile = fs.existsSync('./server/index.js') ? './server/index.js' : './simple-server.js';
  console.log(`Using: ${serverFile}`);
  
  const server = spawn('node', [serverFile], {
    stdio: 'inherit',
    env: { ...process.env, PORT: 5000 }
  });
  
  server.on('error', (err) => {
    console.error('Server error:', err);
  });
  
  server.on('close', (code) => {
    console.log(`Server exited with code ${code}`);
  });
  
  // Keep process alive
  process.on('SIGINT', () => {
    server.kill('SIGINT');
    process.exit(0);
  });
}, 1000);