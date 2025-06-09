/**
 * Comprehensive Authentication Test for All User Roles
 * Tests super admin, company admin, and technician authentication flows
 */

async function apiRequest(method, endpoint, data = null, cookies = '') {
  const fetch = await import('node-fetch').then(m => m.default);
  
  const options = {
    method,
    headers: {
      'Content-Type': 'application/json',
      ...(cookies && { 'Cookie': cookies })
    }
  };
  
  if (data) {
    options.body = JSON.stringify(data);
  }
  
  const response = await fetch(`http://localhost:5000${endpoint}`, options);
  const text = await response.text();
  
  let responseData;
  try {
    responseData = JSON.parse(text);
  } catch {
    responseData = text;
  }
  
  const setCookieHeader = response.headers.get('set-cookie');
  const cookieString = setCookieHeader ? setCookieHeader.split(';')[0] : '';
  
  return {
    status: response.status,
    data: responseData,
    cookies: cookieString
  };
}

function logTest(description, passed, details = '') {
  const status = passed ? '✅ PASS' : '❌ FAIL';
  console.log(`${status}: ${description}`);
  if (details) {
    console.log(`   ${details}`);
  }
}

async function testCompanyAdminAuth() {
  console.log('\n=== TESTING COMPANY ADMIN AUTHENTICATION ===');
  let testsPassed = 0;
  let totalTests = 0;
  
  // Test 1: Company Admin Registration
  try {
    totalTests++;
    const timestamp = Date.now();
    const registrationData = {
      email: `admin_${timestamp}@example.com`,
      username: `admin_${timestamp}`,
      password: 'adminpass123',
      confirmPassword: 'adminpass123',
      role: 'company_admin',
      companyName: `Test Company ${timestamp}`
    };
    
    const registerResult = await apiRequest('POST', '/api/auth/register', registrationData);
    
    if (registerResult.status === 201 && registerResult.data.role === 'company_admin') {
      logTest('Company admin registration', true, `User: ${registerResult.data.email}`);
      testsPassed++;
      
      // Test 2: Immediate session verification
      totalTests++;
      const authResult = await apiRequest('GET', '/api/auth/me', null, registerResult.cookies);
      
      if (authResult.status === 200 && authResult.data.user) {
        logTest('Company admin session after registration', true, `Company: ${authResult.data.company?.name}`);
        testsPassed++;
        
        // Test 3: Logout
        totalTests++;
        const logoutResult = await apiRequest('POST', '/api/auth/logout', null, registerResult.cookies);
        
        if (logoutResult.status === 200) {
          logTest('Company admin logout', true);
          testsPassed++;
          
          // Test 4: Fresh login
          totalTests++;
          const loginData = {
            email: registrationData.email,
            password: registrationData.password
          };
          
          const loginResult = await apiRequest('POST', '/api/auth/login', loginData);
          
          if (loginResult.status === 200 && loginResult.data.role === 'company_admin') {
            logTest('Company admin fresh login', true, `User: ${loginResult.data.email}`);
            testsPassed++;
            
            // Test 5: Access protected endpoint
            totalTests++;
            const protectedResult = await apiRequest('GET', '/api/technicians', null, loginResult.cookies);
            
            if (protectedResult.status === 200) {
              logTest('Company admin protected endpoint access', true);
              testsPassed++;
            } else {
              logTest('Company admin protected endpoint access', false, `Status: ${protectedResult.status}`);
            }
            
            // Final logout
            await apiRequest('POST', '/api/auth/logout', null, loginResult.cookies);
          } else {
            logTest('Company admin fresh login', false, `Status: ${loginResult.status}`);
          }
        } else {
          logTest('Company admin logout', false, `Status: ${logoutResult.status}`);
        }
      } else {
        logTest('Company admin session after registration', false, `Status: ${authResult.status}`);
      }
    } else {
      logTest('Company admin registration', false, `Status: ${registerResult.status}`);
    }
  } catch (error) {
    logTest('Company admin authentication test', false, error.message);
  }
  
  return { passed: testsPassed, total: totalTests };
}

async function testTechnicianAuth() {
  console.log('\n=== TESTING TECHNICIAN AUTHENTICATION ===');
  let testsPassed = 0;
  let totalTests = 0;
  
  try {
    // First create a company admin to manage technicians
    const timestamp = Date.now();
    const companyAdminData = {
      email: `companyadmin_${timestamp}@example.com`,
      username: `companyadmin_${timestamp}`,
      password: 'companyadmin123',
      confirmPassword: 'companyadmin123',
      role: 'company_admin',
      companyName: `Tech Test Company ${timestamp}`
    };
    
    const companyResult = await apiRequest('POST', '/api/auth/register', companyAdminData);
    
    if (companyResult.status === 201) {
      // Create a technician
      const technicianData = {
        name: `Test Technician ${timestamp}`,
        email: `tech_${timestamp}@example.com`,
        phone: '555-123-4567',
        location: 'Test City',
        specialty: 'HVAC'
      };
      
      const techResult = await apiRequest('POST', '/api/technicians', technicianData, companyResult.cookies);
      
      if (techResult.status === 201) {
        // Create technician user account
        const techAccountData = {
          username: `tech_${timestamp}`,
          password: 'techpass123',
          confirmPassword: 'techpass123'
        };
        
        const accountResult = await apiRequest(
          'POST', 
          `/api/technicians/${techResult.data.id}/create-account`, 
          techAccountData, 
          companyResult.cookies
        );
        
        if (accountResult.status === 200) {
          totalTests++;
          logTest('Technician account creation', true, `Tech ID: ${techResult.data.id}`);
          testsPassed++;
          
          // Test technician login
          totalTests++;
          const loginData = {
            email: technicianData.email,
            password: techAccountData.password
          };
          
          const loginResult = await apiRequest('POST', '/api/auth/login', loginData);
          
          if (loginResult.status === 200 && loginResult.data.role === 'technician') {
            logTest('Technician login', true, `User: ${loginResult.data.email}`);
            testsPassed++;
            
            // Test session verification
            totalTests++;
            const authResult = await apiRequest('GET', '/api/auth/me', null, loginResult.cookies);
            
            if (authResult.status === 200 && authResult.data.user) {
              logTest('Technician session verification', true);
              testsPassed++;
              
              // Test logout
              totalTests++;
              const logoutResult = await apiRequest('POST', '/api/auth/logout', null, loginResult.cookies);
              
              if (logoutResult.status === 200) {
                logTest('Technician logout', true);
                testsPassed++;
              } else {
                logTest('Technician logout', false, `Status: ${logoutResult.status}`);
              }
            } else {
              logTest('Technician session verification', false, `Status: ${authResult.status}`);
            }
          } else {
            logTest('Technician login', false, `Status: ${loginResult.status}`);
          }
        } else {
          logTest('Technician account creation', false, `Status: ${accountResult.status}`);
        }
      } else {
        logTest('Technician creation', false, `Status: ${techResult.status}`);
      }
    } else {
      logTest('Company admin setup for technician test', false, `Status: ${companyResult.status}`);
    }
  } catch (error) {
    logTest('Technician authentication test', false, error.message);
  }
  
  return { passed: testsPassed, total: totalTests };
}

async function testSuperAdminAccess() {
  console.log('\n=== TESTING SUPER ADMIN ACCESS ===');
  let testsPassed = 0;
  let totalTests = 0;
  
  // Test super admin protected endpoint access (without login since we don't have credentials)
  // We'll test that the endpoint exists and requires authentication
  try {
    totalTests++;
    const result = await apiRequest('GET', '/api/admin/users');
    
    if (result.status === 401) {
      logTest('Super admin endpoint security', true, 'Correctly requires authentication');
      testsPassed++;
    } else {
      logTest('Super admin endpoint security', false, `Unexpected status: ${result.status}`);
    }
  } catch (error) {
    logTest('Super admin endpoint test', false, error.message);
  }
  
  return { passed: testsPassed, total: totalTests };
}

async function runAllAuthTests() {
  console.log('=== COMPREHENSIVE AUTHENTICATION TEST SUITE ===\n');
  
  const companyAdminResults = await testCompanyAdminAuth();
  const technicianResults = await testTechnicianAuth();
  const superAdminResults = await testSuperAdminAccess();
  
  const totalPassed = companyAdminResults.passed + technicianResults.passed + superAdminResults.passed;
  const totalTests = companyAdminResults.total + technicianResults.total + superAdminResults.total;
  const successRate = Math.round((totalPassed / totalTests) * 100);
  
  console.log('\n=== FINAL RESULTS ===');
  console.log(`Company Admin Tests: ${companyAdminResults.passed}/${companyAdminResults.total}`);
  console.log(`Technician Tests: ${technicianResults.passed}/${technicianResults.total}`);
  console.log(`Super Admin Tests: ${superAdminResults.passed}/${superAdminResults.total}`);
  console.log(`\nOverall: ${totalPassed}/${totalTests} (${successRate}%)`);
  
  if (successRate === 100) {
    console.log('🎉 All authentication tests passed! The system is working correctly.');
  } else if (successRate >= 80) {
    console.log('⚠️  Most tests passed, but some issues need attention.');
  } else {
    console.log('❌ Multiple authentication issues detected. Review required.');
  }
}

// Run the tests
runAllAuthTests().catch(console.error);