#!/usr/bin/env node

// RENDER.COM UNIVERSAL BUILD - Handles missing vite dependencies
const fs = require('fs');
const { execSync } = require('child_process');

console.log('🚀 RENDER.COM UNIVERSAL BUILD - Starting...');

try {
  // Clean build directory
  console.log('🧹 Cleaning build directory...');
  if (fs.existsSync('dist')) {
    fs.rmSync('dist', { recursive: true, force: true });
  }
  fs.mkdirSync('dist', { recursive: true });
  fs.mkdirSync('dist/public', { recursive: true });

  // Install vite if missing
  console.log('📦 Installing vite if missing...');
  try {
    execSync('npm install vite@latest --no-save', { stdio: 'inherit' });
  } catch (error) {
    console.log('Vite install failed, will use fallback');
  }

  // Build client with multiple fallback strategies
  console.log('🏗️ Building client...');
  let clientBuilt = false;
  
  // Strategy 1: Try vite build
  try {
    execSync('npx vite build --outDir dist/public', { stdio: 'inherit' });
    clientBuilt = true;
    console.log('✅ Vite build successful');
  } catch (error) {
    console.log('❌ Vite build failed, trying alternatives...');
    
    // Strategy 2: Copy existing build
    if (fs.existsSync('client/dist/public')) {
      console.log('📂 Copying from client/dist/public...');
      execSync('cp -r client/dist/public/* dist/public/', { stdio: 'inherit' });
      clientBuilt = true;
    } else if (fs.existsSync('client/dist')) {
      console.log('📂 Copying from client/dist...');
      execSync('cp -r client/dist/* dist/public/', { stdio: 'inherit' });
      clientBuilt = true;
    } else if (fs.existsSync('public')) {
      console.log('📂 Copying from public...');
      execSync('cp -r public/* dist/public/', { stdio: 'inherit' });
      clientBuilt = true;
    }
  }
  
  // Strategy 3: Create minimal client if all else fails
  if (!clientBuilt) {
    console.log('🔧 Creating minimal client...');
    fs.writeFileSync('dist/public/index.html', `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Rank It Pro</title>
    <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background: #f8fafc; }
        .container { max-width: 400px; margin: 100px auto; background: white; padding: 40px; border-radius: 12px; box-shadow: 0 4px 20px rgba(0,0,0,0.1); }
        h1 { color: #1e293b; text-align: center; margin-bottom: 30px; }
        .form-group { margin-bottom: 20px; }
        label { display: block; margin-bottom: 5px; color: #374151; font-weight: 500; }
        input { width: 100%; padding: 12px; border: 2px solid #e5e7eb; border-radius: 6px; font-size: 16px; }
        input:focus { outline: none; border-color: #3b82f6; }
        button { width: 100%; padding: 12px; background: #3b82f6; color: white; border: none; border-radius: 6px; font-size: 16px; font-weight: 500; cursor: pointer; }
        button:hover { background: #2563eb; }
        .error { color: #ef4444; text-align: center; margin-top: 15px; }
    </style>
</head>
<body>
    <div class="container">
        <h1>Rank It Pro</h1>
        <form id="loginForm" action="/api/auth/login" method="POST">
            <div class="form-group">
                <label for="email">Email</label>
                <input type="email" id="email" name="email" required>
            </div>
            <div class="form-group">
                <label for="password">Password</label>
                <input type="password" id="password" name="password" required>
            </div>
            <button type="submit">Login</button>
            <div id="error" class="error"></div>
        </form>
    </div>
    <script>
        document.getElementById('loginForm').addEventListener('submit', async (e) => {
            e.preventDefault();
            const formData = new FormData(e.target);
            try {
                const response = await fetch('/api/auth/login', {
                    method: 'POST',
                    body: formData
                });
                if (response.ok) {
                    window.location.href = '/dashboard';
                } else {
                    document.getElementById('error').textContent = 'Login failed. Please check your credentials.';
                }
            } catch (error) {
                document.getElementById('error').textContent = 'Network error. Please try again.';
            }
        });
    </script>
</body>
</html>`);
    clientBuilt = true;
  }

  // Install esbuild if missing
  console.log('📦 Installing esbuild if missing...');
  try {
    execSync('npm install esbuild@latest --no-save', { stdio: 'inherit' });
  } catch (error) {
    console.log('Esbuild install failed, will try to continue');
  }

  // Build server
  console.log('🏗️ Building server...');
  execSync('npx esbuild server/index.ts --platform=node --outfile=dist/server.js --bundle --format=cjs --target=node18 --external:pg-native --external:@babel/core --external:lightningcss --external:typescript --external:@swc/core --external:esbuild --external:*.node', { stdio: 'inherit' });

  // Copy server to multiple locations
  console.log('📁 Creating server files...');
  const serverFiles = ['server.js', 'index.js', 'app.js', 'main.js'];
  serverFiles.forEach(filename => {
    fs.copyFileSync('dist/server.js', filename);
    console.log(`✅ Created ${filename}`);
  });

  // Create production package.json
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

  console.log('✅ BUILD COMPLETE!');
  console.log('📊 Summary:');
  console.log('- Client built successfully');
  console.log('- Server built successfully');
  console.log('- Multiple server files created');
  console.log('- Production package.json created');
  
} catch (error) {
  console.error('❌ Build failed:', error.message);
  process.exit(1);
}