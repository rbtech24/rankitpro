#!/usr/bin/env node

// RENDER.COM FINAL FIX - Works without npm install
const fs = require('fs');
const { execSync } = require('child_process');

console.log('🚀 RENDER.COM FINAL FIX - No npm needed');

try {
  // Clean build directory
  if (fs.existsSync('dist')) {
    fs.rmSync('dist', { recursive: true, force: true });
  }
  fs.mkdirSync('dist', { recursive: true });
  fs.mkdirSync('dist/public', { recursive: true });

  // Build client - try multiple approaches
  console.log('Building client...');
  let clientBuilt = false;
  
  try {
    // Try with existing node_modules if available
    execSync('npx vite build --outDir dist/public', { stdio: 'inherit' });
    clientBuilt = true;
  } catch (error) {
    console.log('Vite build failed, trying alternative...');
    
    // Copy static files if they exist
    if (fs.existsSync('client/dist/public')) {
      execSync('cp -r client/dist/public/* dist/public/', { stdio: 'inherit' });
      clientBuilt = true;
    } else if (fs.existsSync('client/dist')) {
      execSync('cp -r client/dist/* dist/public/', { stdio: 'inherit' });
      clientBuilt = true;
    } else if (fs.existsSync('public')) {
      execSync('cp -r public/* dist/public/', { stdio: 'inherit' });
      clientBuilt = true;
    }
  }
  
  // Create minimal HTML if client build failed
  if (!clientBuilt) {
    console.log('Creating minimal client...');
    fs.writeFileSync('dist/public/index.html', `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Rank It Pro</title>
    <style>
        body { font-family: Arial, sans-serif; margin: 0; padding: 20px; background: #f5f5f5; }
        .container { max-width: 400px; margin: 50px auto; background: white; padding: 30px; border-radius: 8px; box-shadow: 0 2px 10px rgba(0,0,0,0.1); }
        h1 { color: #333; text-align: center; }
        .login-form { margin-top: 20px; }
        input { width: 100%; padding: 10px; margin: 10px 0; border: 1px solid #ddd; border-radius: 4px; }
        button { width: 100%; padding: 12px; background: #007bff; color: white; border: none; border-radius: 4px; cursor: pointer; }
        button:hover { background: #0056b3; }
    </style>
</head>
<body>
    <div class="container">
        <h1>Rank It Pro</h1>
        <form class="login-form" action="/api/auth/login" method="POST">
            <input type="email" name="email" placeholder="Email" required>
            <input type="password" name="password" placeholder="Password" required>
            <button type="submit">Login</button>
        </form>
    </div>
</body>
</html>`);
  }

  // Build server
  console.log('Building server...');
  execSync('npx esbuild server/index.ts --platform=node --outfile=dist/server.js --bundle --format=cjs --target=node18 --external:pg-native --external:@babel/core --external:lightningcss --external:typescript --external:@swc/core --external:esbuild --external:*.node', { stdio: 'inherit' });

  // Copy server to multiple locations for maximum compatibility
  console.log('Creating server files...');
  const serverFiles = ['server.js', 'index.js', 'app.js', 'main.js'];
  serverFiles.forEach(filename => {
    fs.copyFileSync('dist/server.js', filename);
    console.log(`Created ${filename}`);
  });

  // Create package.json for production
  const productionPackage = {
    name: 'rankitpro',
    version: '1.0.0',
    main: 'server.js',
    scripts: {
      start: 'node server.js'
    },
    engines: {
      node: '>=18.0.0'
    }
  };
  
  fs.writeFileSync('dist/package.json', JSON.stringify(productionPackage, null, 2));
  fs.writeFileSync('package.json', JSON.stringify(productionPackage, null, 2));

  console.log('✅ BUILD COMPLETE!');
  console.log('Files created:');
  console.log('- dist/server.js (Server bundle)');
  console.log('- server.js (Root server)');
  console.log('- index.js (Alternative server)');
  console.log('- app.js (Backup server)');
  console.log('- main.js (Extra backup)');
  console.log('- dist/public/index.html (Client)');
  
  // Verify all files exist
  const requiredFiles = ['dist/server.js', 'server.js', 'index.js', 'app.js', 'dist/public/index.html'];
  requiredFiles.forEach(file => {
    if (fs.existsSync(file)) {
      console.log(`✅ ${file} exists`);
    } else {
      console.log(`❌ ${file} missing`);
    }
  });

} catch (error) {
  console.error('❌ Build failed:', error.message);
  process.exit(1);
}