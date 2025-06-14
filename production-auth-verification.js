#!/usr/bin/env node

/**
 * Production Authentication Verification Script
 * Verifies complete authentication flow for Render.com deployment
 */

import fetch from 'node-fetch';

// Configuration
const BASE_URL = process.env.RENDER_URL || 'http://localhost:5000';
const TIMEOUT = 10000; // 10 seconds

// Test results tracking
const testResults = {
  passed: 0,
  failed: 0,
  critical: 0,
  details: []
};

// Helper functions
async function apiRequest(method, endpoint, data = null, cookies = '', expectedStatus = null) {
  const url = `${BASE_URL}${endpoint}`;
  const options = {
    method,
    timeout: TIMEOUT,
    headers: {
      'Content-Type': 'application/json',
      'Accept': 'application/json',
      'User-Agent': 'Production-Auth-Verification/1.0'
    }
  };

  if (cookies) {
    options.headers.Cookie = cookies;
  }

  if (data && (method === 'POST' || method === 'PUT' || method === 'PATCH')) {
    options.body = JSON.stringify(data);
  }

  try {
    const response = await fetch(url, options);
    const responseData = await response.text();
    
    let parsedData;
    try {
      parsedData = JSON.parse(responseData);
    } catch {
      parsedData = responseData;
    }

    const result = {
      status: response.status,
      data: parsedData,
      headers: response.headers.raw()
    };

    if (expectedStatus && response.status !== expectedStatus) {
      throw new Error(`Expected status ${expectedStatus}, got ${response.status}`);
    }

    return result;
  } catch (error) {
    throw new Error(`Request failed: ${error.message}`);
  }
}

function logTest(description, passed, details = '', critical = false) {
  const status = passed ? 'PASS' : 'FAIL';
  const prefix = critical ? '🔴 CRITICAL' : (passed ? '✅' : '❌');
  
  console.log(`${prefix} ${status}: ${description}`);
  if (details) {
    console.log(`   Details: ${details}`);
  }

  testResults.details.push({
    description,
    passed,
    details,
    critical
  });

  if (passed) {
    testResults.passed++;
  } else {
    testResults.failed++;
    if (critical) {
      testResults.critical++;
    }
  }
}

// Authentication flow tests
async function testAuthenticationFlow() {
  console.log('\n=== AUTHENTICATION FLOW VERIFICATION ===\n');

  try {
    // Test 1: Health check
    const healthCheck = await apiRequest('GET', '/api/health');
    logTest('Health endpoint accessible', healthCheck.status === 200, 
      `Status: ${healthCheck.status}`, true);

    if (healthCheck.status !== 200) {
      throw new Error('Health check failed - aborting authentication tests');
    }

    // Test 2: Get system admin credentials
    let adminCredentials;
    try {
      const credsResponse = await apiRequest('GET', '/api/system-admin-credentials');
      adminCredentials = credsResponse.data;
      logTest('Admin credentials endpoint accessible', credsResponse.status === 200,
        `Email: ${adminCredentials.email}`, false);
    } catch (error) {
      logTest('Admin credentials endpoint (expected in production)', false,
        'Not accessible - expected in production', false);
      
      // For production, we need to extract from logs or use provided credentials
      console.log('Note: In production, admin credentials are displayed in deployment logs');
      return false;
    }

    // Test 3: Login with admin credentials
    const loginData = {
      email: adminCredentials.email,
      password: adminCredentials.password
    };

    const loginResponse = await apiRequest('POST', '/api/auth/login', loginData);
    logTest('Admin login successful', loginResponse.status === 200,
      `Role: ${loginResponse.data.role}`, true);

    if (loginResponse.status !== 200) {
      throw new Error('Login failed - cannot continue with authenticated tests');
    }

    // Extract session cookies
    const setCookie = loginResponse.headers['set-cookie'];
    const sessionCookie = setCookie ? setCookie.find(cookie => cookie.includes('connect.sid')) : null;
    
    if (!sessionCookie) {
      logTest('Session cookie creation', false, 'No session cookie in response', true);
      return false;
    }

    const cookieHeader = sessionCookie.split(';')[0];
    logTest('Session cookie creation', true, 'Session cookie extracted', false);

    // Test 4: Verify session persistence
    const meResponse = await apiRequest('GET', '/api/auth/me', null, cookieHeader);
    logTest('Session persistence', meResponse.status === 200,
      `User ID: ${meResponse.data.user?.id}`, true);

    // Test 5: Create test company
    const companyData = {
      name: 'Production Test Company',
      plan: 'pro',
      contactEmail: 'test@production.com',
      contactPhone: '555-0123'
    };

    const companyResponse = await apiRequest('POST', '/api/companies', companyData, cookieHeader);
    logTest('Company creation', companyResponse.status === 201,
      `Company ID: ${companyResponse.data.company?.id}`, false);

    const companyId = companyResponse.data.company?.id;

    // Test 6: Create test technician
    const technicianData = {
      name: 'Production Test Technician',
      email: 'technician@production.com',
      phone: '555-9876',
      location: 'Phoenix, AZ',
      specialty: 'hvac',
      companyId: companyId
    };

    const techResponse = await apiRequest('POST', '/api/technicians', technicianData, cookieHeader);
    logTest('Technician creation', techResponse.status === 201,
      `Technician ID: ${techResponse.data.id}`, false);

    // Test 7: Verify data retrieval
    const companiesResponse = await apiRequest('GET', '/api/companies', null, cookieHeader);
    logTest('Data retrieval', companiesResponse.status === 200,
      `Companies count: ${companiesResponse.data.length}`, false);

    // Test 8: Logout
    const logoutResponse = await apiRequest('POST', '/api/auth/logout', null, cookieHeader);
    logTest('Logout functionality', logoutResponse.status === 200,
      'Session terminated', false);

    // Test 9: Verify session invalidation
    const postLogoutResponse = await apiRequest('GET', '/api/auth/me', null, cookieHeader);
    logTest('Session invalidation', postLogoutResponse.status === 401,
      'Access denied after logout', false);

    return true;

  } catch (error) {
    logTest('Authentication flow', false, error.message, true);
    return false;
  }
}

// Database connectivity test
async function testDatabaseConnectivity() {
  console.log('\n=== DATABASE CONNECTIVITY VERIFICATION ===\n');

  try {
    const dbHealthResponse = await apiRequest('GET', '/api/health/detailed');
    const dbStatus = dbHealthResponse.data.database?.status;
    
    logTest('Database connectivity', dbStatus === 'connected',
      `Status: ${dbStatus}`, true);

    return dbStatus === 'connected';
  } catch (error) {
    logTest('Database connectivity', false, error.message, true);
    return false;
  }
}

// Production environment verification
async function testProductionEnvironment() {
  console.log('\n=== PRODUCTION ENVIRONMENT VERIFICATION ===\n');

  try {
    const healthResponse = await apiRequest('GET', '/api/health/detailed');
    const envData = healthResponse.data.environment;

    logTest('Environment variables loaded', !!envData,
      `Node ENV: ${envData?.nodeEnv}`, true);

    logTest('Database URL configured', !!envData?.databaseConfigured,
      'Database connection string present', true);

    logTest('Session secret configured', !!envData?.sessionSecretConfigured,
      'Session security enabled', true);

    return true;
  } catch (error) {
    logTest('Production environment', false, error.message, true);
    return false;
  }
}

// Main verification function
async function runProductionVerification() {
  console.log('🚀 PRODUCTION AUTHENTICATION VERIFICATION');
  console.log('==========================================');
  console.log(`Target URL: ${BASE_URL}`);
  console.log(`Timeout: ${TIMEOUT}ms`);
  console.log('');

  const startTime = Date.now();

  // Run all verification tests
  const dbConnected = await testDatabaseConnectivity();
  const envConfigured = await testProductionEnvironment();
  const authWorking = await testAuthenticationFlow();

  // Generate final report
  const endTime = Date.now();
  const duration = ((endTime - startTime) / 1000).toFixed(2);

  console.log('\n' + '='.repeat(50));
  console.log('PRODUCTION VERIFICATION SUMMARY');
  console.log('='.repeat(50));
  console.log(`Duration: ${duration}s`);
  console.log(`Tests Passed: ${testResults.passed}`);
  console.log(`Tests Failed: ${testResults.failed}`);
  console.log(`Critical Failures: ${testResults.critical}`);

  // Deployment readiness assessment
  const isReady = testResults.critical === 0 && dbConnected && authWorking;
  
  console.log('\n' + (isReady ? '✅ DEPLOYMENT READY' : '❌ DEPLOYMENT NOT READY'));
  
  if (!isReady) {
    console.log('\nCRITICAL ISSUES FOUND:');
    testResults.details
      .filter(test => !test.passed && test.critical)
      .forEach(test => {
        console.log(`- ${test.description}: ${test.details}`);
      });
  }

  console.log('\nNOTES FOR RENDER.COM DEPLOYMENT:');
  console.log('- Ensure DATABASE_URL environment variable is set');
  console.log('- SESSION_SECRET will be auto-generated if not provided');
  console.log('- Admin credentials are displayed in deployment logs');
  console.log('- Health check endpoint: /api/health');

  // Exit with appropriate code
  process.exit(isReady ? 0 : 1);
}

// Handle command line execution
if (import.meta.url === `file://${process.argv[1]}`) {
  runProductionVerification().catch(error => {
    console.error('Verification script failed:', error);
    process.exit(1);
  });
}

export {
  runProductionVerification,
  testAuthenticationFlow,
  testDatabaseConnectivity,
  testProductionEnvironment
};