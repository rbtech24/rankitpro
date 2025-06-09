/**
 * Comprehensive Authentication Flow Test
 * Tests complete login → session persistence → authenticated requests → logout cycle
 */

const baseUrl = 'http://localhost:5000';

async function apiRequest(method, endpoint, data = null, cookies = '') {
  const options = {
    method,
    headers: {
      'Content-Type': 'application/json',
      'Cookie': cookies
    },
    credentials: 'include'
  };
  
  if (data) {
    options.body = JSON.stringify(data);
  }
  
  const response = await fetch(`${baseUrl}${endpoint}`, options);
  
  // Extract cookies from response for session tracking
  const setCookieHeader = response.headers.get('set-cookie');
  const sessionCookie = setCookieHeader ? setCookieHeader.split(';')[0] : '';
  
  return {
    status: response.status,
    data: response.status !== 204 ? await response.json().catch(() => ({})) : {},
    cookies: sessionCookie || cookies
  };
}

function logTest(description, passed, details = '') {
  const status = passed ? '✅ PASS' : '❌ FAIL';
  console.log(`${status}: ${description}`);
  if (details) console.log(`   ${details}`);
}

async function testCompleteAuthFlow() {
  console.log('\n=== COMPREHENSIVE AUTHENTICATION FLOW TEST ===\n');
  
  let sessionCookies = '';
  let testsPassed = 0;
  let totalTests = 0;
  
  // Test 1: Register new user account
  try {
    totalTests++;
    const registerData = {
      username: `testuser_${Date.now()}`,
      email: `test_${Date.now()}@example.com`,
      password: 'testpass123',
      confirmPassword: 'testpass123',
      role: 'company_admin',
      companyName: `Test Company ${Date.now()}`
    };
    
    const registerResult = await apiRequest('POST', '/api/auth/register', registerData);
    
    if (registerResult.status === 201 && registerResult.data.email) {
      sessionCookies = registerResult.cookies;
      logTest('User registration with automatic login', true, `User: ${registerResult.data.email}`);
      testsPassed++;
    } else {
      logTest('User registration', false, `Status: ${registerResult.status}`);
    }
  } catch (error) {
    logTest('User registration', false, error.message);
  }
  
  // Test 2: Verify session persistence with /api/auth/me
  try {
    totalTests++;
    await new Promise(resolve => setTimeout(resolve, 300)); // Allow session to settle
    
    const authResult = await apiRequest('GET', '/api/auth/me', null, sessionCookies);
    
    if (authResult.status === 200 && authResult.data.user) {
      logTest('Session persistence after registration', true, `User authenticated: ${authResult.data.user.email}`);
      testsPassed++;
    } else {
      logTest('Session persistence after registration', false, `Status: ${authResult.status}`);
    }
  } catch (error) {
    logTest('Session persistence after registration', false, error.message);
  }
  
  // Test 3: Logout and verify session destruction
  try {
    totalTests++;
    const logoutResult = await apiRequest('POST', '/api/auth/logout', null, sessionCookies);
    
    if (logoutResult.status === 200) {
      logTest('Logout request successful', true);
      testsPassed++;
    } else {
      logTest('Logout request', false, `Status: ${logoutResult.status}`);
    }
  } catch (error) {
    logTest('Logout request', false, error.message);
  }
  
  // Test 4: Verify session is destroyed after logout
  try {
    totalTests++;
    const authAfterLogout = await apiRequest('GET', '/api/auth/me', null, sessionCookies);
    
    if (authAfterLogout.status === 401) {
      logTest('Session destroyed after logout', true);
      testsPassed++;
    } else {
      logTest('Session destroyed after logout', false, `Expected 401, got ${authAfterLogout.status}`);
    }
  } catch (error) {
    logTest('Session destroyed after logout', false, error.message);
  }
  
  // Test 5: Fresh login with existing account
  try {
    totalTests++;
    const loginData = {
      email: 'test@company.com', // Use previously created test account
      password: 'password123'
    };
    
    const loginResult = await apiRequest('POST', '/api/auth/login', loginData);
    
    if (loginResult.status === 200 && loginResult.data.email) {
      sessionCookies = loginResult.cookies;
      logTest('Fresh login with existing account', true, `User: ${loginResult.data.email}`);
      testsPassed++;
    } else {
      logTest('Fresh login attempt', false, `Status: ${loginResult.status}`);
    }
  } catch (error) {
    logTest('Fresh login attempt', false, error.message);
  }
  
  // Test 6: Verify fresh session works for authenticated requests
  try {
    totalTests++;
    await new Promise(resolve => setTimeout(resolve, 300)); // Allow session to settle
    
    const authResult = await apiRequest('GET', '/api/auth/me', null, sessionCookies);
    
    if (authResult.status === 200 && authResult.data.user && authResult.data.company) {
      logTest('Fresh session authentication with company data', true, `Company: ${authResult.data.company.name}`);
      testsPassed++;
    } else {
      logTest('Fresh session authentication', false, `Status: ${authResult.status}`);
    }
  } catch (error) {
    logTest('Fresh session authentication', false, error.message);
  }
  
  // Test 7: Test protected API endpoint access
  try {
    totalTests++;
    const protectedResult = await apiRequest('GET', '/api/technicians', null, sessionCookies);
    
    if (protectedResult.status === 200) {
      logTest('Access to protected API endpoints', true);
      testsPassed++;
    } else {
      logTest('Access to protected API endpoints', false, `Status: ${protectedResult.status}`);
    }
  } catch (error) {
    logTest('Access to protected API endpoints', false, error.message);
  }
  
  // Test 8: Final logout verification
  try {
    totalTests++;
    const finalLogout = await apiRequest('POST', '/api/auth/logout', null, sessionCookies);
    
    if (finalLogout.status === 200) {
      logTest('Final logout successful', true);
      testsPassed++;
    } else {
      logTest('Final logout', false, `Status: ${finalLogout.status}`);
    }
  } catch (error) {
    logTest('Final logout', false, error.message);
  }
  
  console.log('\n=== TEST SUMMARY ===');
  console.log(`Tests Passed: ${testsPassed}/${totalTests}`);
  console.log(`Success Rate: ${Math.round((testsPassed/totalTests) * 100)}%`);
  
  if (testsPassed === totalTests) {
    console.log('🎉 ALL AUTHENTICATION TESTS PASSED! The auth system is working correctly.');
  } else {
    console.log('⚠️  Some authentication tests failed. Review the issues above.');
  }
  
  return testsPassed === totalTests;
}

// Run the comprehensive test
testCompleteAuthFlow().catch(console.error);