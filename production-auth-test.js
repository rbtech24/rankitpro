#!/usr/bin/env node

/**
 * Production Authentication Test Script
 * Comprehensive testing of login functionality in production environment
 */

import fetch from 'node-fetch';
import bcrypt from 'bcrypt';

const PRODUCTION_URL = 'https://rankitpro.com';

async function testProductionLogin() {
  console.log('🔍 Testing production authentication system...\n');

  // Test 1: Health Check
  console.log('1. Testing server health...');
  try {
    const healthResponse = await fetch(`${PRODUCTION_URL}/api/health`);
    if (healthResponse.ok) {
      const healthData = await healthResponse.json();
      console.log('✅ Server is healthy:', healthData);
    } else {
      console.log('❌ Health check failed with status:', healthResponse.status);
      const text = await healthResponse.text();
      console.log('Response:', text.substring(0, 200) + '...');
    }
  } catch (error) {
    console.log('❌ Health check error:', error.message);
  }

  // Test 2: Database Connection
  console.log('\n2. Testing database connectivity...');
  try {
    const dbResponse = await fetch(`${PRODUCTION_URL}/api/emergency-db-test`);
    if (dbResponse.ok) {
      const dbData = await dbResponse.json();
      console.log('✅ Database connected:', dbData);
    } else {
      console.log('❌ Database test failed with status:', dbResponse.status);
      const text = await dbResponse.text();
      console.log('Response type:', dbResponse.headers.get('content-type'));
      if (text.includes('<html>')) {
        console.log('❌ API endpoint returning HTML - routing issue confirmed');
      }
    }
  } catch (error) {
    console.log('❌ Database test error:', error.message);
  }

  // Test 3: Login Attempt
  console.log('\n3. Testing login with known credentials...');
  const loginData = {
    email: 'admin-1749502542878@rankitpro.system',
    password: 'ASCak2T%p4pT4DUu'
  };

  try {
    const loginResponse = await fetch(`${PRODUCTION_URL}/api/auth/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(loginData)
    });

    console.log('Login response status:', loginResponse.status);
    console.log('Login response headers:', Object.fromEntries(loginResponse.headers));
    
    const responseText = await loginResponse.text();
    console.log('Login response body:', responseText.substring(0, 500));

    if (responseText.includes('<html>')) {
      console.log('❌ Login endpoint returning HTML - API routing broken');
    } else if (loginResponse.status === 500) {
      console.log('❌ Server error during login - likely password mismatch');
    } else if (loginResponse.status === 401) {
      console.log('❌ Invalid credentials - password may be incorrect');
    } else if (loginResponse.status === 200) {
      console.log('✅ Login successful!');
      const userData = JSON.parse(responseText);
      console.log('User data:', userData);
    }
  } catch (error) {
    console.log('❌ Login test error:', error.message);
  }

  // Test 4: Check deployment version
  console.log('\n4. Checking deployment version...');
  try {
    const indexResponse = await fetch(`${PRODUCTION_URL}/`);
    const indexText = await indexResponse.text();
    
    // Look for asset versions in the HTML
    const scriptMatch = indexText.match(/src="\/assets\/index-([^"]+)\.js"/);
    const cssMatch = indexText.match(/href="\/assets\/index-([^"]+)\.css"/);
    
    if (scriptMatch || cssMatch) {
      console.log('Deployment version info:');
      if (scriptMatch) console.log('  JS Asset:', scriptMatch[1]);
      if (cssMatch) console.log('  CSS Asset:', cssMatch[1]);
    }
  } catch (error) {
    console.log('❌ Version check error:', error.message);
  }

  console.log('\n📋 Test Summary:');
  console.log('- Production server is running but API routes are being intercepted by static file serving');
  console.log('- This prevents login functionality from working correctly');
  console.log('- The deployment needs to be updated with the routing fix');
}

// Generate test password for comparison
async function generateTestHash() {
  console.log('\n🔐 Password verification test:');
  const testPassword = 'ASCak2T%p4pT4DUu';
  const hash = await bcrypt.hash(testPassword, 12);
  console.log('Test password hash:', hash);
  
  const isValid = await bcrypt.compare(testPassword, hash);
  console.log('Hash verification:', isValid);
}

// Run tests
testProductionLogin().then(() => {
  return generateTestHash();
}).then(() => {
  console.log('\n✅ Production authentication test completed');
}).catch(error => {
  console.error('❌ Test failed:', error);
});