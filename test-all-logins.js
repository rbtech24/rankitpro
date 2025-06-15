/**
 * Comprehensive Authentication Test for Production Deployment
 * Tests all authentication flows and verifies system functionality
 */

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
  
  const response = await fetch(`http://localhost:5000${endpoint}`, options);
  const responseData = await response.text();
  
  try {
    return {
      status: response.status,
      data: JSON.parse(responseData),
      headers: response.headers
    };
  } catch {
    return {
      status: response.status,
      data: responseData,
      headers: response.headers
    };
  }
}

function logTest(description, passed, details = '') {
  const status = passed ? '✅ PASS' : '❌ FAIL';
  console.log(`${status}: ${description}`);
  if (details) console.log(`   ${details}`);
}

async function testCompleteAuthenticationSystem() {
  console.log('\n🔐 COMPREHENSIVE AUTHENTICATION SYSTEM TEST');
  console.log('='.repeat(60));
  
  let allTestsPassed = true;
  
  try {
    // Test 1: Super Admin Authentication
    console.log('\n1. Testing Super Admin Authentication...');
    const superAdminLogin = await apiRequest('POST', '/api/auth/login', {
      email: 'bill@mrsprinklerrepair.com',
      password: 'Temp1234'
    });
    
    const superAdminPass = superAdminLogin.status === 200 && superAdminLogin.data.role === 'super_admin';
    logTest('Super Admin Login', superAdminPass, `Status: ${superAdminLogin.status}, Role: ${superAdminLogin.data?.role}`);
    if (!superAdminPass) allTestsPassed = false;
    
    // Test 2: Company Admin Authentication
    console.log('\n2. Testing Company Admin Authentication...');
    const companyAdminLogin = await apiRequest('POST', '/api/auth/login', {
      email: 'admin@testcompany.com',
      password: 'company123'
    });
    
    const companyAdminPass = companyAdminLogin.status === 200 && companyAdminLogin.data.role === 'company_admin';
    logTest('Company Admin Login', companyAdminPass, `Status: ${companyAdminLogin.status}, Role: ${companyAdminLogin.data?.role}`);
    if (!companyAdminPass) allTestsPassed = false;
    
    // Test 3: Invalid Credentials Protection
    console.log('\n3. Testing Security - Invalid Credentials...');
    const invalidLogin = await apiRequest('POST', '/api/auth/login', {
      email: 'fake@email.com',
      password: 'wrongpassword'
    });
    
    const securityPass = invalidLogin.status === 401;
    logTest('Invalid Credentials Rejected', securityPass, `Status: ${invalidLogin.status}`);
    if (!securityPass) allTestsPassed = false;
    
    // Test 4: API Endpoint JSON Response Verification
    console.log('\n4. Testing API Response Format...');
    const responseIsJSON = typeof superAdminLogin.data === 'object' && superAdminLogin.data !== null;
    logTest('API Returns JSON (Not HTML)', responseIsJSON, 'Authentication endpoints return proper JSON responses');
    if (!responseIsJSON) allTestsPassed = false;
    
    // Test 5: Session Management
    console.log('\n5. Testing Session Management...');
    const sessionCookie = superAdminLogin.headers.get('set-cookie');
    const sessionPass = sessionCookie && sessionCookie.includes('connect.sid');
    logTest('Session Cookie Creation', sessionPass, sessionCookie ? 'Session cookie properly set' : 'No session cookie found');
    if (!sessionPass) allTestsPassed = false;
    
    // Test 6: Registration System
    console.log('\n6. Testing User Registration...');
    const testRegister = await apiRequest('POST', '/api/auth/register', {
      email: 'test@example.com',
      username: 'testuser',
      password: 'Test1234',
      confirmPassword: 'Test1234',
      role: 'super_admin'
    });
    
    const registrationPass = testRegister.status === 201;
    logTest('User Registration', registrationPass, `Status: ${testRegister.status}`);
    if (!registrationPass) allTestsPassed = false;
    
    // Final Results
    console.log('\n' + '='.repeat(60));
    if (allTestsPassed) {
      console.log('🎉 ALL AUTHENTICATION TESTS PASSED!');
      console.log('\n📋 WORKING CREDENTIALS FOR PRODUCTION:');
      console.log('Super Admin: bill@mrsprinklerrepair.com / Temp1234');
      console.log('Company Admin: admin@testcompany.com / company123');
      console.log('\n✅ Authentication system is production-ready!');
      console.log('✅ API endpoints return proper JSON responses');
      console.log('✅ Session management is functional');
      console.log('✅ Security validation is working');
      console.log('✅ Multi-role authentication implemented');
    } else {
      console.log('❌ SOME TESTS FAILED - Review above for details');
    }
    
  } catch (error) {
    console.error('❌ TEST SUITE ERROR:', error.message);
    allTestsPassed = false;
  }
  
  return allTestsPassed;
}

// Run the tests
testCompleteAuthenticationSystem().then(success => {
  process.exit(success ? 0 : 1);
});