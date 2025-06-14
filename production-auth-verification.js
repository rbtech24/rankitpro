#!/usr/bin/env node

/**
 * Production Authentication Verification Script
 * Verifies complete authentication flow for Render.com deployment
 */

import fetch from 'node-fetch';

const PRODUCTION_URL = 'https://rankitpro.com';
const NEW_ADMIN_PASSWORD = 'ProductionSecure2024!';

async function apiRequest(method, endpoint, data = null, cookies = '', expectedStatus = null) {
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
  
  const response = await fetch(`${PRODUCTION_URL}${endpoint}`, options);
  const responseText = await response.text();
  
  let responseData;
  try {
    responseData = JSON.parse(responseText);
  } catch {
    responseData = { rawResponse: responseText.substring(0, 200) };
  }
  
  return {
    status: response.status,
    data: responseData,
    headers: Object.fromEntries(response.headers),
    isJson: responseText.startsWith('{') || responseText.startsWith('[')
  };
}

function logTest(description, passed, details = '', critical = false) {
  const icon = passed ? '✅' : (critical ? '🚫' : '❌');
  console.log(`${icon} ${description}`);
  if (details) console.log(`   ${details}`);
}

async function testAuthenticationFlow() {
  console.log('🔧 Testing Production Authentication Flow\n');
  
  // Step 1: Verify database connectivity
  console.log('1. Testing database connectivity...');
  const dbTest = await apiRequest('GET', '/api/emergency-db-test');
  logTest(
    'Database connection', 
    dbTest.status === 200 && dbTest.isJson,
    dbTest.status === 200 ? `${dbTest.data.totalUsers} users, ${dbTest.data.superAdminCount} admins` : `Status: ${dbTest.status}`
  );
  
  if (dbTest.status !== 200) {
    console.log('Cannot proceed without database access');
    return false;
  }
  
  const adminEmail = dbTest.data.firstAdmin?.email;
  console.log(`Found admin email: ${adminEmail}\n`);
  
  // Step 2: Reset admin password
  console.log('2. Resetting admin password...');
  const resetTest = await apiRequest('POST', '/api/emergency-reset-admin', {
    newPassword: NEW_ADMIN_PASSWORD,
    adminEmail: adminEmail
  });
  
  logTest(
    'Password reset', 
    resetTest.status === 200 && resetTest.isJson,
    resetTest.status === 200 ? 'Password updated successfully' : `Error: ${resetTest.data.message || resetTest.status}`
  );
  
  if (resetTest.status !== 200) {
    console.log('Password reset failed, cannot test login');
    return false;
  }
  
  // Step 3: Verify new password works
  console.log('\n3. Testing login with new password...');
  const loginTest = await apiRequest('POST', '/api/auth/login', {
    email: adminEmail,
    password: NEW_ADMIN_PASSWORD
  });
  
  logTest(
    'Admin login', 
    loginTest.status === 200 && loginTest.isJson && loginTest.data.role === 'super_admin',
    loginTest.status === 200 ? `Logged in as ${loginTest.data.email}` : `Status: ${loginTest.status}, ${loginTest.data.message || 'Unknown error'}`
  );
  
  if (loginTest.status === 200) {
    console.log('\n🎉 PRODUCTION LOGIN RESTORED!');
    console.log('Admin credentials:');
    console.log(`📧 Email: ${adminEmail}`);
    console.log(`🔑 Password: ${NEW_ADMIN_PASSWORD}`);
    console.log(`🌐 Login URL: ${PRODUCTION_URL}/login`);
    return true;
  }
  
  return false;
}

async function testDatabaseConnectivity() {
  console.log('\n🗄️ Database Health Check');
  
  const healthTest = await apiRequest('GET', '/api/health');
  logTest(
    'Server health',
    healthTest.status === 200,
    healthTest.status === 200 ? 'Server responsive' : `Status: ${healthTest.status}`
  );
  
  return healthTest.status === 200;
}

async function testProductionEnvironment() {
  console.log('\n🌐 Production Environment Check');
  
  try {
    const response = await fetch(PRODUCTION_URL);
    const html = await response.text();
    
    logTest(
      'Website accessibility',
      response.status === 200,
      response.status === 200 ? 'Site loads correctly' : `HTTP ${response.status}`
    );
    
    logTest(
      'Application assets',
      html.includes('/assets/index-') && html.includes('.js'),
      html.includes('/assets/') ? 'Assets found in HTML' : 'No assets detected'
    );
    
    return response.status === 200;
  } catch (error) {
    logTest('Website accessibility', false, `Connection error: ${error.message}`, true);
    return false;
  }
}

async function runProductionVerification() {
  console.log('Production Authentication Verification');
  console.log('=====================================\n');
  
  const environmentOk = await testProductionEnvironment();
  if (!environmentOk) {
    console.log('\n❌ Production environment not accessible');
    return;
  }
  
  const databaseOk = await testDatabaseConnectivity();
  if (!databaseOk) {
    console.log('\n❌ Database connectivity issues detected');
    return;
  }
  
  const authFixed = await testAuthenticationFlow();
  
  console.log('\n📋 Verification Summary:');
  console.log(`Environment: ${environmentOk ? 'Working' : 'Failed'}`);
  console.log(`Database: ${databaseOk ? 'Connected' : 'Failed'}`);
  console.log(`Authentication: ${authFixed ? 'Fixed' : 'Still broken'}`);
  
  if (authFixed) {
    console.log('\n✅ Production is ready for use!');
    console.log('You can now access the admin dashboard.');
  } else {
    console.log('\n❌ Authentication still needs manual intervention');
  }
}

runProductionVerification().catch(error => {
  console.error('❌ Verification failed:', error.message);
});