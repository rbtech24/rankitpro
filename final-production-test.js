/**
 * Final Production Readiness Verification
 * Tests critical security fixes and system readiness
 */

import fetch from 'node-fetch';

const BASE_URL = 'http://localhost:5000';

async function makeRequest(method, endpoint, data = null, cookies = '') {
  const url = `${BASE_URL}${endpoint}`;
  const options = {
    method,
    headers: {
      'User-Agent': 'Production-Test/1.0',
      'Accept': 'application/json'
    },
  };

  if (cookies) {
    options.headers['Cookie'] = cookies;
  }

  if (data) {
    if (data instanceof FormData) {
      options.body = data;
    } else {
      options.headers['Content-Type'] = 'application/json';
      options.body = JSON.stringify(data);
    }
  }

  try {
    const response = await fetch(url, options);
    const contentType = response.headers.get('content-type');
    
    return {
      ok: response.ok,
      status: response.status,
      headers: response.headers,
      contentType,
      json: async () => {
        const text = await response.text();
        try {
          return JSON.parse(text);
        } catch {
          return { error: 'Invalid JSON response', text: text.substring(0, 200) + '...' };
        }
      }
    };
  } catch (error) {
    return {
      ok: false,
      status: 0,
      headers: new Map(),
      contentType: null,
      json: async () => ({ error: error.message })
    };
  }
}

async function runFinalProductionTest() {
  console.log('🔒 Final Production Security Verification');
  console.log('=========================================\n');

  let testsPassed = 0;
  let totalTests = 0;

  // Test 1: Unauthorized API access should return JSON, not HTML
  console.log('Test 1: Unauthorized Access Protection');
  const unauthorizedResponse = await makeRequest('GET', '/api/check-ins');
  const isJson = unauthorizedResponse.contentType && unauthorizedResponse.contentType.includes('application/json');
  const isUnauthorized = unauthorizedResponse.status === 401;
  
  totalTests++;
  if (isJson && isUnauthorized) {
    console.log('✅ PASS: API returns JSON 401 response for unauthorized access');
    testsPassed++;
  } else {
    console.log('❌ FAIL: API security vulnerability detected');
    console.log(`   Status: ${unauthorizedResponse.status}, Content-Type: ${unauthorizedResponse.contentType}`);
  }

  // Test 2: Authentication flow
  console.log('\nTest 2: Authentication System');
  const loginResponse = await makeRequest('POST', '/api/auth/login', {
    email: 'rodbartrufftech@gmail.com',
    password: 'test123'
  });

  totalTests++;
  if (loginResponse.ok) {
    console.log('✅ PASS: Authentication system functional');
    testsPassed++;
  } else {
    console.log('❌ FAIL: Authentication system failed');
  }

  // Test 3: Technician authentication
  console.log('\nTest 3: Technician Authentication');
  const techLoginResponse = await makeRequest('POST', '/api/auth/login', {
    email: 'rodbartruffonline@gmail.com',
    password: 'test123'
  });

  totalTests++;
  if (techLoginResponse.ok) {
    console.log('✅ PASS: Technician authentication functional');
    testsPassed++;
  } else {
    console.log('❌ FAIL: Technician authentication failed');
  }

  // Test 4: API endpoint consistency
  console.log('\nTest 4: API Endpoint Consistency');
  const endpoints = ['/api/auth/me', '/api/technicians', '/api/check-ins', '/api/companies'];
  let endpointTests = 0;
  let endpointPassed = 0;

  for (const endpoint of endpoints) {
    const response = await makeRequest('GET', endpoint);
    const returnsJson = response.contentType && response.contentType.includes('application/json');
    
    endpointTests++;
    if (returnsJson) {
      endpointPassed++;
    }
  }

  totalTests++;
  if (endpointPassed === endpointTests) {
    console.log('✅ PASS: All API endpoints return JSON responses');
    testsPassed++;
  } else {
    console.log(`❌ FAIL: ${endpointTests - endpointPassed}/${endpointTests} endpoints return non-JSON`);
  }

  // Summary
  console.log('\n📊 FINAL PRODUCTION READINESS RESULTS');
  console.log('=====================================');
  console.log(`Tests Passed: ${testsPassed}/${totalTests}`);
  
  const passRate = (testsPassed / totalTests) * 100;
  console.log(`Pass Rate: ${passRate}%`);

  if (passRate === 100) {
    console.log('\n🎉 PRODUCTION READY');
    console.log('✅ All critical security tests passed');
    console.log('✅ System is ready for deployment');
  } else {
    console.log('\n⚠️  REQUIRES ATTENTION');
    console.log('❌ Some tests failed - review before deployment');
  }
}

runFinalProductionTest().catch(console.error);