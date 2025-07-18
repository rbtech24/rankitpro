#!/usr/bin/env node
/**
 * CommonJS compatible server starter
 * This file properly handles the import.meta issues in the CommonJS build
 */

// Set up global variables that might be needed
global.__dirname = __dirname;
global.__filename = __filename;

// Override fileURLToPath to handle undefined import.meta.url
const { fileURLToPath } = require('url');
const path = require('path');

// Create a safe version of fileURLToPath
const originalFileURLToPath = fileURLToPath;
function safeFileURLToPath(url) {
  if (!url || url === 'undefined') {
    // Return the current file path as fallback
    return __filename;
  }
  return originalFileURLToPath(url);
}

// Override the url module's fileURLToPath
require('url').fileURLToPath = safeFileURLToPath;

// Override path.dirname to handle undefined
const originalPathDirname = path.dirname;
path.dirname = function(p) {
  if (!p || p === 'undefined') {
    return __dirname;
  }
  return originalPathDirname(p);
};

// Now require the main server file
console.log('Starting server with CommonJS compatibility fixes...');
require('./index.js');