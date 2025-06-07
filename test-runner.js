#!/usr/bin/env node

/**
 * Automated Pre-Launch Testing Script
 * Tests all critical functionality before deployment
 */

import { execSync } from 'child_process';
import fs from 'fs';
import fetch from 'node-fetch';

console.log('🚀 Starting Pre-Launch Testing Suite...\n');

// Test configuration
const BASE_URL = 'http://localhost:5000';
const TEST_USERS = {
  superadmin: { email: 'superadmin@example.com', password: 'admin123' },
  admin: { email: 'admin@testcompany.com', password: 'company123' },
  technician: { email: 'tech@testcompany.com', password: 'tech1234' }
};

// Helper function to make API requests
async function apiRequest(method, endpoint, data = null, cookies = '') {
  
  const options = {
    method,
    headers: {
      'Content-Type': 'application/json',
      'Cookie': cookies
    }
  };
  
  if (data) {
    options.body = JSON.stringify(data);
  }
  
  const response = await fetch(`${BASE_URL}${endpoint}`, options);
  const result = await response.json();
  
  return {
    status: response.status,
    data: result,
    cookies: response.headers.get('set-cookie') || ''
  };
}

// Test results tracking
let testResults = {
  passed: 0,
  failed: 0,
  errors: []
};

function logTest(description, passed, error = null) {
  if (passed) {
    console.log(`✅ ${description}`);
    testResults.passed++;
  } else {
    console.log(`❌ ${description}`);
    testResults.failed++;
    if (error) {
      testResults.errors.push(`${description}: ${error}`);
    }
  }
}

// Authentication tests
async function testAuthentication() {
  console.log('\n📝 Testing Authentication...');
  
  try {
    // Test super admin login
    const loginResponse = await apiRequest('POST', '/api/auth/login', {
      email: TEST_USERS.superadmin.email,
      password: TEST_USERS.superadmin.password
    });
    
    logTest('Super admin login', loginResponse.status === 200);
    
    if (loginResponse.status === 200) {
      const cookies = loginResponse.cookies;
      
      // Test authenticated endpoint
      const meResponse = await apiRequest('GET', '/api/auth/me', null, cookies);
      logTest('Authentication persistence', meResponse.status === 200 && meResponse.data.user);
      
      // Test logout
      const logoutResponse = await apiRequest('POST', '/api/auth/logout', null, cookies);
      logTest('Logout functionality', logoutResponse.status === 200);
    }
    
  } catch (error) {
    logTest('Authentication tests', false, error.message);
  }
}

// Database connectivity tests
async function testDatabase() {
  console.log('\n🗄️  Testing Database Connectivity...');
  
  try {
    // Test companies endpoint
    const companiesResponse = await apiRequest('GET', '/api/companies');
    logTest('Database connection', companiesResponse.status === 401 || companiesResponse.status === 200);
    
    // Test visit creation (requires auth)
    const loginResponse = await apiRequest('POST', '/api/auth/login', {
      email: TEST_USERS.technician.email,
      password: TEST_USERS.technician.password
    });
    
    if (loginResponse.status === 200) {
      const testVisit = {
        customerName: 'Test Customer',
        customerEmail: 'test@example.com',
        customerPhone: '555-0123',
        jobType: 'HVAC Maintenance',
        notes: 'Test visit for pre-launch testing',
        location: 'Test Location',
        latitude: 40.7128,
        longitude: -74.0060
      };
      
      const visitResponse = await apiRequest('POST', '/api/visits', testVisit, loginResponse.cookies);
      logTest('Visit creation', visitResponse.status === 201 || visitResponse.status === 200);
    }
    
  } catch (error) {
    logTest('Database tests', false, error.message);
  }
}

// API endpoints tests
async function testAPIEndpoints() {
  console.log('\n🔗 Testing API Endpoints...');
  
  const endpoints = [
    { method: 'GET', path: '/api/health', expectedStatus: 200, requiresAuth: false },
    { method: 'GET', path: '/api/auth/me', expectedStatus: 401, requiresAuth: false },
    { method: 'GET', path: '/api/job-types', expectedStatus: 401, requiresAuth: false },
    { method: 'GET', path: '/api/blog-posts', expectedStatus: 401, requiresAuth: false }
  ];
  
  for (const endpoint of endpoints) {
    try {
      const response = await apiRequest(endpoint.method, endpoint.path);
      const passed = response.status === endpoint.expectedStatus;
      logTest(`${endpoint.method} ${endpoint.path}`, passed);
    } catch (error) {
      logTest(`${endpoint.method} ${endpoint.path}`, false, error.message);
    }
  }
}

// Environment variables check
function testEnvironmentVariables() {
  console.log('\n🔧 Testing Environment Configuration...');
  
  const requiredVars = [
    'DATABASE_URL',
    'PGHOST',
    'PGPORT',
    'PGUSER',
    'PGPASSWORD',
    'PGDATABASE'
  ];
  
  const optionalVars = [
    'OPENAI_API_KEY',
    'ANTHROPIC_API_KEY',
    'XAI_API_KEY',
    'SENDGRID_API_KEY',
    'STRIPE_SECRET_KEY',
    'VITE_STRIPE_PUBLIC_KEY'
  ];
  
  requiredVars.forEach(varName => {
    const exists = process.env[varName] !== undefined;
    logTest(`Required env var: ${varName}`, exists);
  });
  
  optionalVars.forEach(varName => {
    const exists = process.env[varName] !== undefined;
    if (exists) {
      console.log(`ℹ️  Optional env var configured: ${varName}`);
    } else {
      console.log(`⚠️  Optional env var missing: ${varName}`);
    }
  });
}

// Server health check
async function testServerHealth() {
  console.log('\n🏥 Testing Server Health...');
  
  try {
    // Check if server is responding
    const response = await apiRequest('GET', '/api/health');
    logTest('Server responding', response.status === 200);
    
    // Check response time
    const start = Date.now();
    await apiRequest('GET', '/api/auth/me');
    const responseTime = Date.now() - start;
    logTest('Response time < 1000ms', responseTime < 1000);
    
  } catch (error) {
    logTest('Server health', false, error.message);
  }
}

// File upload test
async function testFileUpload() {
  console.log('\n📁 Testing File Upload...');
  
  try {
    // Check uploads directory exists
    const uploadsDir = './uploads';
    const dirExists = fs.existsSync(uploadsDir);
    logTest('Uploads directory exists', dirExists);
    
    if (!dirExists) {
      fs.mkdirSync(uploadsDir, { recursive: true });
      logTest('Created uploads directory', true);
    }
    
    // Test write permissions
    const testFile = `${uploadsDir}/test.txt`;
    fs.writeFileSync(testFile, 'test');
    const canWrite = fs.existsSync(testFile);
    logTest('File write permissions', canWrite);
    
    if (canWrite) {
      fs.unlinkSync(testFile);
    }
    
  } catch (error) {
    logTest('File upload test', false, error.message);
  }
}

// TypeScript compilation test
function testTypeScriptCompilation() {
  console.log('\n🔷 Testing TypeScript Compilation...');
  
  try {
    execSync('npx tsc --noEmit', { stdio: 'pipe' });
    logTest('TypeScript compilation', true);
  } catch (error) {
    logTest('TypeScript compilation', false, 'Compilation errors found');
  }
}

// Main test runner
async function runAllTests() {
  console.log('🔍 Running comprehensive pre-launch tests...\n');
  
  testEnvironmentVariables();
  testTypeScriptCompilation();
  testFileUpload();
  await testServerHealth();
  await testAuthentication();
  await testDatabase();
  await testAPIEndpoints();
  
  // Print summary
  console.log('\n📊 Test Results Summary:');
  console.log(`✅ Passed: ${testResults.passed}`);
  console.log(`❌ Failed: ${testResults.failed}`);
  
  if (testResults.errors.length > 0) {
    console.log('\n🚨 Errors encountered:');
    testResults.errors.forEach(error => console.log(`   ${error}`));
  }
  
  const successRate = (testResults.passed / (testResults.passed + testResults.failed)) * 100;
  console.log(`\n🎯 Success Rate: ${successRate.toFixed(1)}%`);
  
  if (successRate >= 90) {
    console.log('\n🎉 System ready for launch!');
    return true;
  } else {
    console.log('\n⚠️  Please address failing tests before launch.');
    return false;
  }
}

// Run tests if called directly
if (require.main === module) {
  runAllTests().then(success => {
    process.exit(success ? 0 : 1);
  });
}

module.exports = { runAllTests };