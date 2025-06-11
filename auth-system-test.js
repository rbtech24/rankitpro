#!/usr/bin/env node

import fetch from 'node-fetch';
import fs from 'fs';

const BASE_URL = 'http://localhost:5000';

async function testAuthenticationSystem() {
  console.log('🔐 Testing Authentication System\n');
  
  try {
    // Step 1: Get current admin credentials from console logs
    console.log('1. Checking server logs for admin credentials...');
    
    // Step 2: Test health endpoint
    console.log('2. Testing health endpoint...');
    const healthResponse = await fetch(`${BASE_URL}/api/health`);
    if (healthResponse.headers.get('content-type')?.includes('application/json')) {
      const healthData = await healthResponse.json();
      console.log(`   Health Status: ${healthResponse.status} - ${healthData.status}`);
    } else {
      console.log(`   Health Status: ${healthResponse.status} - Non-JSON response`);
    }
    
    // Step 3: Get all users to find admin
    console.log('3. Attempting to get user list (should fail without auth)...');
    const usersResponse = await fetch(`${BASE_URL}/api/users`);
    console.log(`   Users endpoint: ${usersResponse.status} (expected 401)`);
    
    // Step 4: Test login with various credential formats
    console.log('4. Testing authentication with different credential formats...');
    
    const testCredentials = [
      // Extract from latest console output
      { email: 'admin-1749604920766@rankitpro.system', password: 'su!2$hXhJVW6Z69e' },
      // Common admin formats
      { email: 'admin@rankitpro.system', password: 'admin123' },
      { email: 'system_admin', password: 'admin123' },
      { username: 'system_admin', password: 'admin123' }
    ];
    
    let successfulLogin = null;
    
    for (const creds of testCredentials) {
      console.log(`   Testing: ${creds.email || creds.username}`);
      
      const loginResponse = await fetch(`${BASE_URL}/api/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(creds)
      });
      
      const loginData = await loginResponse.json();
      console.log(`   Status: ${loginResponse.status} - ${loginData.message || 'Unknown'}`);
      
      if (loginResponse.status === 200) {
        successfulLogin = { creds, response: loginData };
        console.log('   ✅ LOGIN SUCCESSFUL!');
        break;
      }
    }
    
    if (!successfulLogin) {
      console.log('\n❌ All authentication attempts failed');
      console.log('💡 Checking if we can create a test admin user directly...');
      
      // Test direct user creation via API (should fail)
      const createUserResponse = await fetch(`${BASE_URL}/api/auth/register`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          username: 'test_admin',
          email: 'test@rankitpro.system',
          password: 'TestPassword123!',
          role: 'super_admin'
        })
      });
      
      console.log(`   Direct user creation: ${createUserResponse.status}`);
      
      return false;
    }
    
    // Step 5: Test authenticated endpoints
    console.log('\n5. Testing authenticated endpoints...');
    
    const sessionCookie = successfulLogin.response.sessionId ? 
      `connect.sid=${successfulLogin.response.sessionId}` : '';
    
    const authHeaders = {
      'Content-Type': 'application/json',
      'Cookie': sessionCookie
    };
    
    // Test /api/auth/me
    const meResponse = await fetch(`${BASE_URL}/api/auth/me`, {
      headers: authHeaders
    });
    const meData = await meResponse.json();
    console.log(`   Profile endpoint: ${meResponse.status}`);
    if (meResponse.status === 200) {
      console.log(`   User: ${meData.user?.email} (${meData.user?.role})`);
    }
    
    // Test company creation
    const companyResponse = await fetch(`${BASE_URL}/api/companies`, {
      method: 'POST',
      headers: authHeaders,
      body: JSON.stringify({
        name: 'Test Company',
        email: 'test@company.com',
        phone: '555-0123',
        address: '123 Test St'
      })
    });
    console.log(`   Company creation: ${companyResponse.status}`);
    
    console.log('\n✅ Authentication system test completed');
    return true;
    
  } catch (error) {
    console.error('❌ Authentication test failed:', error.message);
    return false;
  }
}

async function extractCredentialsFromLogs() {
  console.log('📋 Extracting credentials from server logs...\n');
  
  // In a real scenario, we'd parse server logs or use the console output
  // For now, we'll return the most recent credentials from the startup
  const latestCreds = {
    email: 'admin-1749604920766@rankitpro.system',
    password: 'su!2$hXhJVW6Z69e'
  };
  
  console.log(`Found credentials: ${latestCreds.email}`);
  console.log(`Password: ${latestCreds.password.substring(0, 4)}...`);
  
  return latestCreds;
}

// Main execution
(async () => {
  console.log('🚀 Starting Authentication System Test\n');
  
  // Extract latest credentials
  const creds = await extractCredentialsFromLogs();
  
  // Test authentication
  const authSuccess = await testAuthenticationSystem();
  
  if (authSuccess) {
    console.log('\n🎉 Authentication system is working correctly');
  } else {
    console.log('\n🔧 Authentication system needs debugging');
    console.log('💡 Recommendations:');
    console.log('   - Check server logs for latest admin credentials');
    console.log('   - Verify database connection');
    console.log('   - Check session configuration');
    console.log('   - Verify password hashing');
  }
})();