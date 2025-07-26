/**
 * Emergency Routes.ts Recovery Script
 * Fixes corrupted syntax and structure issues
 */

const fs = require('fs');

function emergencyRouteFix() {
  console.log('🚑 Emergency routes.ts recovery...');
  
  let content = fs.readFileSync('server/routes.ts', 'utf8');
  
  // Fix broken app.use middleware calls that were mangled
  content = content.replace(
    /app\.use\((req, res, next) => {\s*enforceSessionTimeout\(req, res, next\);\s*}\);\s*app\.use\((req, res, next) => {\s*enforceConcurrentSessions\(req, res, next\);\s*}\);\s*app\.use\((req, res, next) => {\s*sessionMonitoring\(req, res, next\);\s*}\);/g,
    `app.use(enforceSessionTimeout);
  app.use(enforceConcurrentSessions);
  app.use(sessionMonitoring);`
  );
  
  // Fix corrupted function boundaries
  content = content.replace(/}\s*});/, '});');
  
  // Remove duplicate catch blocks
  content = content.replace(/} catch \([^}]+\)\s*{\s*[^}]*\s*}\s*} catch \([^}]+\)\s*{\s*[^}]*\s*}/g, (match) => {
    const firstCatch = match.match(/} catch \(([^}]+)\)\s*{\s*([^}]*)\s*}/)?.[0];
    return firstCatch || match;
  });
  
  // Fix import statements structure
  if (!content.includes('export default function registerRoutes(app: Express)')) {
    content = content.replace(
      /import rateLimitingRoutes from ".\/routes\/admin\/rate-limiting";/,
      `import rateLimitingRoutes from "./routes/admin/rate-limiting";

export default function registerRoutes(app: Express) {`
    );
    
    // Add closing brace at end
    content = content + '\n}';
  }
  
  fs.writeFileSync('server/routes.ts', content, 'utf8');
  console.log('✅ Emergency fix applied');
}

emergencyRouteFix();