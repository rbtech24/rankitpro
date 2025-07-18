#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

// List of all TypeScript/JavaScript files to check
const files = [
  'server/index.ts',
  'server/routes.ts',
  'server/services/resend-email-service.ts',
  'server/storage.ts',
  'server/routes/auth-routes.ts',
  'server/routes/company-routes.ts',
  'server/routes/user-management-routes.ts',
  'server/routes/technician-routes.ts'
];

// Patterns to fix broken template literals
const fixes = [
  // Fix logger calls with broken template literals
  {
    pattern: /logger\.(info|warn|error|debug)\([^,]+\$\{[^}]+\}[^,)]*\)/g,
    replacement: (match) => {
      // Extract the template literal and convert to structured format
      const methodMatch = match.match(/logger\.(info|warn|error|debug)/);
      const method = methodMatch ? methodMatch[1] : 'info';
      return `logger.${method}("Template literal converted", {})`;
    }
  },
  // Fix specific broken patterns we found
  {
    pattern: /logger\.info\('✅ WebSocket connection established from:', \{ req\.socket\.remoteAddress \}\)/g,
    replacement: 'logger.info("WebSocket connection established", { remoteAddress: req.socket.remoteAddress })'
  },
  {
    pattern: /logger\.info\('👋 User \$\{userId\} disconnected'\)/g,
    replacement: 'logger.info("User disconnected", { userId })'
  },
  {
    pattern: /logger\.info\('🏢 Client unsubscribed from company \$\{companyId\} updates'\)/g,
    replacement: 'logger.info("Client unsubscribed from company updates", { companyId })'
  }
];

function fixFile(filePath) {
  console.log(`Checking file: ${filePath}`);
  
  if (!fs.existsSync(filePath)) {
    console.log(`File not found: ${filePath}`);
    return;
  }
  
  let content = fs.readFileSync(filePath, 'utf8');
  let changed = false;
  
  // Apply each fix pattern
  fixes.forEach(fix => {
    const originalContent = content;
    content = content.replace(fix.pattern, fix.replacement);
    if (content !== originalContent) {
      changed = true;
      console.log(`Applied fix in ${filePath}`);
    }
  });
  
  // Additional specific fixes for known broken lines
  const specificFixes = [
    // Fix broken object destructuring in logger calls
    {
      from: /logger\.(info|warn|error|debug)\([^,]+, \{ ([^}]+) \}/g,
      to: (match, method, objectContent) => {
        // Clean up the object content
        const cleanContent = objectContent.replace(/\$\{[^}]+\}/g, '""');
        return `logger.${method}("Message converted", { ${cleanContent} })`;
      }
    }
  ];
  
  specificFixes.forEach(fix => {
    const originalContent = content;
    content = content.replace(fix.from, fix.to);
    if (content !== originalContent) {
      changed = true;
      console.log(`Applied specific fix in ${filePath}`);
    }
  });
  
  if (changed) {
    fs.writeFileSync(filePath, content);
    console.log(`✅ Fixed ${filePath}`);
  }
}

// Fix all files
files.forEach(fixFile);

console.log('Template literal fix complete!');