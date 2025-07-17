#!/usr/bin/env node

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

// Get __dirname equivalent for ESM
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Create a CommonJS-compatible server entry point
const serverEntry = `
// CommonJS-compatible server entry point
const express = require('express');
const path = require('path');
const fs = require('fs');
const { createServer } = require('http');

// Import the original server logic
const serverModule = require('./server/index.js');

// Replace import.meta references with __dirname equivalents
global.__dirname = __dirname;
global.__filename = __filename;

// Start the server
if (require.main === module) {
  // This is the main module, so start the server
  console.log('Starting server in CommonJS mode...');
}
`;

// Create the helper file
fs.writeFileSync(path.join(__dirname, 'dist', 'server-cjs-helper.js'), serverEntry);

console.log('✅ CommonJS helper created successfully');