#!/usr/bin/env node

/**
 * Script to fix corrupted template literals across the codebase
 * Replaces patterns like `<${closing}${tagName}${safeAttributes ? " " + safeAttributes : ""}>` 
 * with meaningful replacements based on context
 */

const fs = require('fs');
const path = require('path');

// Common replacement patterns
const patterns = [
  {
    // Generic corrupted template - replace with empty string or placeholder
    regex: /`<\$\{closing\}\$\{tagName\}\$\{safeAttributes \? " " \+ safeAttributes : ""\}>`/g,
    replacement: (context, file) => {
      if (file.includes('rate-limiting') || file.includes('auth')) {
        return '`ip:${req.ip}`';
      }
      if (file.includes('user') || file.includes('session')) {
        return '`user:${userId || "anonymous"}`';
      }
      return '"default-key"';
    }
  },
  {
    // Generic message templates
    regex: /message: `<\$\{closing\}\$\{tagName\}\$\{safeAttributes \? " " \+ safeAttributes : ""\}>`/g,
    replacement: () => 'message: "Operation failed"'
  },
  {
    // Return statements
    regex: /return `<\$\{closing\}\$\{tagName\}\$\{safeAttributes \? " " \+ safeAttributes : ""\}>`;/g,
    replacement: () => 'return "default-value";'
  }
];

function fixFile(filePath) {
  try {
    let content = fs.readFileSync(filePath, 'utf8');
    let modified = false;

    patterns.forEach(pattern => {
      if (pattern.regex.test(content)) {
        content = content.replace(pattern.regex, (match) => {
          modified = true;
          if (typeof pattern.replacement === 'function') {
            return pattern.replacement(match, filePath);
          }
          return pattern.replacement;
        });
      }
    });

    if (modified) {
      fs.writeFileSync(filePath, content);
      console.log(`Fixed: ${filePath}`);
      return true;
    }
  } catch (error) {
    console.error(`Error processing ${filePath}:`, error.message);
  }
  return false;
}

function processDirectory(dirPath) {
  const entries = fs.readdirSync(dirPath);
  
  entries.forEach(entry => {
    const fullPath = path.join(dirPath, entry);
    const stat = fs.statSync(fullPath);
    
    if (stat.isDirectory() && !entry.startsWith('.') && entry !== 'node_modules') {
      processDirectory(fullPath);
    } else if (stat.isFile() && (entry.endsWith('.ts') || entry.endsWith('.js'))) {
      fixFile(fullPath);
    }
  });
}

// Process server directory
processDirectory('./server');
console.log('Template corruption fix completed!');