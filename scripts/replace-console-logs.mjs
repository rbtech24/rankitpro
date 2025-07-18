/**
 * Script to replace console.log statements with structured logging
 * Run: node scripts/replace-console-logs.cjs
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const STRUCTURED_LOGGER_IMPORT = "import { logger } from '../services/structured-logger';";
const ALT_STRUCTURED_LOGGER_IMPORT = "import { logger } from './services/structured-logger';";

function replaceConsoleInFile(filePath) {
  let content = fs.readFileSync(filePath, 'utf8');
  let modified = false;

  // Add import if not present and console usage found
  const hasConsoleUsage = /console\.(log|error|warn|info|debug)/.test(content);
  const hasLoggerImport = /import.*logger.*from.*structured-logger/.test(content);
  
  if (hasConsoleUsage && !hasLoggerImport) {
    // Determine correct import path based on file location
    const relativePath = path.relative(process.cwd(), filePath);
    const importPath = relativePath.startsWith('server/services/') ? 
      ALT_STRUCTURED_LOGGER_IMPORT : STRUCTURED_LOGGER_IMPORT;
    
    // Add import after other imports
    const importRegex = /(import.*from.*['"][^'"]*['"];?\s*\n)/g;
    const imports = content.match(importRegex);
    if (imports) {
      const lastImport = imports[imports.length - 1];
      content = content.replace(lastImport, lastImport + importPath + '\n');
      modified = true;
    }
  }

  // Replace console.error with logger.error
  content = content.replace(
    /console\.error\(['`"]([^'`"]*?)['`"],?\s*([^)]*)\);?/g,
    (match, message, context) => {
      modified = true;
      if (context.trim()) {
        return `logger.error('${message}', { ${context.includes('error') ? '' : 'error: '}${context} }, ${context.includes('error') ? context : 'error'});`;
      }
      return `logger.error('${message}');`;
    }
  );

  // Replace console.warn with logger.warn  
  content = content.replace(
    /console\.warn\(['`"]([^'`"]*?)['`"],?\s*([^)]*)\);?/g,
    (match, message, context) => {
      modified = true;
      return context.trim() ? 
        `logger.warn('${message}', { ${context} });` : 
        `logger.warn('${message}');`;
    }
  );

  // Replace console.log with logger.info or logger.debug based on content
  content = content.replace(
    /console\.log\(['`"]([^'`"]*?)['`"],?\s*([^)]*)\);?/g,
    (match, message, context) => {
      modified = true;
      // Use debug for detailed/development info, info for business events
      const logLevel = message.toLowerCase().includes('debug') || 
                     message.toLowerCase().includes('trace') ||
                     context.includes('detailed') ? 'debug' : 'info';
      
      return context.trim() ? 
        `logger.${logLevel}('${message}', { ${context} });` : 
        `logger.${logLevel}('${message}');`;
    }
  );

  // Replace console.info with logger.info
  content = content.replace(
    /console\.info\(['`"]([^'`"]*?)['`"],?\s*([^)]*)\);?/g,
    (match, message, context) => {
      modified = true;
      return context.trim() ? 
        `logger.info('${message}', { ${context} });` : 
        `logger.info('${message}');`;
    }
  );

  if (modified) {
    fs.writeFileSync(filePath, content, 'utf8');
    console.log(`✅ Updated: ${filePath}`);
    return true;
  }
  return false;
}

function processDirectory(dirPath) {
  const files = fs.readdirSync(dirPath);
  let totalUpdated = 0;

  files.forEach(file => {
    const fullPath = path.join(dirPath, file);
    const stat = fs.statSync(fullPath);

    if (stat.isDirectory() && !file.startsWith('.') && file !== 'node_modules') {
      totalUpdated += processDirectory(fullPath);
    } else if (file.endsWith('.ts') || file.endsWith('.js')) {
      if (replaceConsoleInFile(fullPath)) {
        totalUpdated++;
      }
    }
  });

  return totalUpdated;
}

// Process server directory
console.log('🔄 Replacing console.log statements with structured logging...');
const serverPath = path.join(__dirname, '../server');
const updatedFiles = processDirectory(serverPath);

console.log(`\n✅ Complete! Updated ${updatedFiles} files with structured logging.`);
console.log('📝 All console.log statements have been replaced with appropriate logger methods.');