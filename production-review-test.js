/**
 * Comprehensive Production Review Test Suite
 * Tests all company and technician systems and features
 */

import fs from 'fs';
import fetch from 'node-fetch';

// Test configuration
const BASE_URL = 'http://localhost:5000';
const TEST_USER = {
  email: 'rodbartrufftech@gmail.com',
  password: 'password123'
};

let authCookies = '';
let testResults = [];

function logTest(description, passed, details = '', critical = false) {
  const status = passed ? '✅ PASS' : '❌ FAIL';
  const result = `${status} ${description}`;
  
  if (details) {
    console.log(`${result}: ${details}`);
  } else {
    console.log(result);
  }
  
  testResults.push({
    description,
    passed,
    details,
    critical,
    timestamp: new Date().toISOString()
  });
}

async function apiRequest(method, endpoint, data = null, cookies = '', expectedStatus = null) {
  const url = `${BASE_URL}${endpoint}`;
  const options = {
    method,
    headers: {
      'Content-Type': 'application/json',
      'Cookie': cookies || authCookies
    }
  };
  
  if (data && (method === 'POST' || method === 'PUT' || method === 'PATCH')) {
    options.body = JSON.stringify(data);
  }
  
  try {
    const response = await fetch(url, options);
    
    if (expectedStatus && response.status !== expectedStatus) {
      throw new Error(`Expected status ${expectedStatus}, got ${response.status}`);
    }
    
    return response;
  } catch (error) {
    throw new Error(`API request failed: ${error.message}`);
  }
}

async function authenticateUser() {
  console.log('\n🔐 Testing Authentication System...');
  
  try {
    const response = await apiRequest('POST', '/api/auth/login', TEST_USER);
    
    if (response.ok) {
      const setCookieHeader = response.headers.get('set-cookie');
      if (setCookieHeader) {
        authCookies = setCookieHeader.split(';')[0];
      }
      
      const userData = await response.json();
      logTest('User authentication', true, `Logged in as ${userData.email}`);
      return userData;
    } else {
      const error = await response.text();
      logTest('User authentication', false, `Login failed: ${error}`, true);
      return null;
    }
  } catch (error) {
    logTest('User authentication', false, `Network error: ${error.message}`, true);
    return null;
  }
}

async function testCompanyProfile() {
  console.log('\n🏢 Testing Company Profile System...');
  
  try {
    // Test company data retrieval
    const companyRes = await apiRequest('GET', '/api/companies/16');
    if (companyRes.ok) {
      const company = await companyRes.json();
      logTest('Company profile retrieval', true, `Company: ${company.name}`);
      
      // Test company stats
      const statsRes = await apiRequest('GET', '/api/company-stats');
      if (statsRes.ok) {
        const stats = await statsRes.json();
        logTest('Company statistics', true, `Stats loaded: ${JSON.stringify(stats).substring(0, 100)}...`);
      } else {
        logTest('Company statistics', false, 'Failed to load company stats');
      }
    } else {
      logTest('Company profile retrieval', false, 'Failed to load company profile');
    }
  } catch (error) {
    logTest('Company profile system', false, `Error: ${error.message}`);
  }
}

async function testTechnicianSystem() {
  console.log('\n👷 Testing Technician Management System...');
  
  try {
    // Test technician listing
    const techRes = await apiRequest('GET', '/api/technicians');
    if (techRes.ok) {
      const technicians = await techRes.json();
      logTest('Technician listing', true, `Found ${technicians.length} technicians`);
      
      if (technicians.length > 0) {
        const tech = technicians[0];
        logTest('Technician data structure', true, `Tech: ${tech.name} (${tech.email})`);
        
        // Test individual technician retrieval
        const techDetailRes = await apiRequest('GET', `/api/technicians/${tech.id}`);
        if (techDetailRes.ok) {
          const techDetail = await techDetailRes.json();
          logTest('Individual technician retrieval', true, `Retrieved details for ${techDetail.name}`);
        } else {
          logTest('Individual technician retrieval', false, 'Failed to get technician details');
        }
      } else {
        logTest('Technician data presence', false, 'No technicians found in system');
      }
    } else {
      logTest('Technician listing', false, 'Failed to load technicians');
    }
  } catch (error) {
    logTest('Technician system', false, `Error: ${error.message}`);
  }
}

async function testCheckInSystem() {
  console.log('\n📋 Testing Check-in System...');
  
  try {
    // Test check-in listing
    const checkInRes = await apiRequest('GET', '/api/check-ins');
    if (checkInRes.ok) {
      const checkIns = await checkInRes.json();
      logTest('Check-in listing', true, `Found ${checkIns.length} check-ins`);
      
      if (checkIns.length > 0) {
        const checkIn = checkIns[0];
        logTest('Check-in data structure', true, `Check-in: ${checkIn.jobType} for ${checkIn.customerName}`);
        
        // Test individual check-in retrieval
        const checkInDetailRes = await apiRequest('GET', `/api/check-ins/${checkIn.id}`);
        if (checkInDetailRes.ok) {
          const checkInDetail = await checkInDetailRes.json();
          logTest('Individual check-in retrieval', true, `Retrieved check-in details`);
        } else {
          logTest('Individual check-in retrieval', false, 'Failed to get check-in details');
        }
      } else {
        logTest('Check-in data presence', false, 'No check-ins found in system');
      }
    } else {
      logTest('Check-in listing', false, 'Failed to load check-ins');
    }
  } catch (error) {
    logTest('Check-in system', false, `Error: ${error.message}`);
  }
}

async function testPublicAPIs() {
  console.log('\n🌐 Testing Public APIs...');
  
  try {
    // Test public check-ins endpoint
    const publicCheckInRes = await apiRequest('GET', '/api/public/check-ins?company_id=16&limit=5', null, '');
    if (publicCheckInRes.ok) {
      const publicCheckIns = await publicCheckInRes.json();
      logTest('Public check-ins API', true, `Public API returned ${publicCheckIns.length} check-ins`);
    } else {
      logTest('Public check-ins API', false, 'Public API failed');
    }
  } catch (error) {
    logTest('Public APIs', false, `Error: ${error.message}`);
  }
}

async function testIntegrationSystems() {
  console.log('\n🔗 Testing Integration Systems...');
  
  try {
    // Test WordPress integration
    const wpRes = await apiRequest('GET', '/api/integration/wordpress');
    if (wpRes.ok) {
      const wpData = await wpRes.json();
      logTest('WordPress integration', true, `WordPress configured: ${wpData.configured}`);
    } else {
      logTest('WordPress integration', false, 'WordPress integration failed');
    }
    
    // Test embed integration
    const embedRes = await apiRequest('GET', '/api/integration/embed');
    if (embedRes.ok) {
      const embedData = await embedRes.json();
      logTest('Embed widget integration', true, `Embed code length: ${embedData.embedCode?.length || 0} chars`);
    } else {
      logTest('Embed widget integration', false, 'Embed integration failed');
    }
  } catch (error) {
    logTest('Integration systems', false, `Error: ${error.message}`);
  }
}

async function testJobTypesSystem() {
  console.log('\n🔧 Testing Job Types System...');
  
  try {
    const jobTypesRes = await apiRequest('GET', '/api/job-types');
    if (jobTypesRes.ok) {
      const jobTypes = await jobTypesRes.json();
      logTest('Job types listing', true, `Found ${jobTypes.length} job types`);
      
      if (jobTypes.length > 0) {
        const jobType = jobTypes[0];
        logTest('Job type data structure', true, `Job type: ${jobType.name}`);
      }
    } else {
      logTest('Job types listing', false, 'Failed to load job types');
    }
  } catch (error) {
    logTest('Job types system', false, `Error: ${error.message}`);
  }
}

async function testDashboardComponents() {
  console.log('\n📊 Testing Dashboard Components...');
  
  try {
    // Test company stats (dashboard data)
    const statsRes = await apiRequest('GET', '/api/company-stats');
    if (statsRes.ok) {
      const stats = await statsRes.json();
      logTest('Dashboard statistics', true, 'Company stats loaded successfully');
    } else {
      logTest('Dashboard statistics', false, 'Dashboard stats failed to load');
    }
    
    // Test recent activity
    const visitsRes = await apiRequest('GET', '/api/visits');
    if (visitsRes.ok) {
      const visits = await visitsRes.json();
      logTest('Recent visits data', true, `Loaded ${visits.length} recent visits`);
    } else {
      logTest('Recent visits data', false, 'Recent visits failed to load');
    }
  } catch (error) {
    logTest('Dashboard components', false, `Error: ${error.message}`);
  }
}

async function testMobileAppEndpoints() {
  console.log('\n📱 Testing Mobile App Endpoints...');
  
  try {
    // Test mobile authentication
    const mobileAuthRes = await apiRequest('POST', '/api/mobile/auth', {
      email: TEST_USER.email,
      password: TEST_USER.password
    }, '');
    
    if (mobileAuthRes.ok) {
      const mobileAuth = await mobileAuthRes.json();
      logTest('Mobile authentication', true, `Mobile auth successful`);
      
      // Test mobile-specific endpoints
      const mobileProfileRes = await apiRequest('GET', '/api/mobile/profile', null, authCookies);
      if (mobileProfileRes.ok) {
        logTest('Mobile profile endpoint', true, 'Mobile profile loaded');
      } else {
        logTest('Mobile profile endpoint', false, 'Mobile profile failed');
      }
    } else {
      logTest('Mobile authentication', false, 'Mobile auth failed');
    }
  } catch (error) {
    logTest('Mobile app endpoints', false, `Error: ${error.message}`);
  }
}

async function generateTestReport() {
  console.log('\n📋 PRODUCTION REVIEW SUMMARY');
  console.log('==================================');
  
  const totalTests = testResults.length;
  const passedTests = testResults.filter(r => r.passed).length;
  const failedTests = testResults.filter(r => !r.passed).length;
  const criticalFailures = testResults.filter(r => !r.passed && r.critical).length;
  
  console.log(`Total Tests: ${totalTests}`);
  console.log(`Passed: ${passedTests} (${((passedTests/totalTests)*100).toFixed(1)}%)`);
  console.log(`Failed: ${failedTests} (${((failedTests/totalTests)*100).toFixed(1)}%)`);
  console.log(`Critical Failures: ${criticalFailures}`);
  
  if (criticalFailures > 0) {
    console.log('\n⚠️  CRITICAL ISSUES DETECTED:');
    testResults.filter(r => !r.passed && r.critical).forEach(r => {
      console.log(`- ${r.description}: ${r.details}`);
    });
  }
  
  if (failedTests > 0) {
    console.log('\n❌ FAILED TESTS:');
    testResults.filter(r => !r.passed && !r.critical).forEach(r => {
      console.log(`- ${r.description}: ${r.details}`);
    });
  }
  
  console.log('\n✅ PASSED TESTS:');
  testResults.filter(r => r.passed).forEach(r => {
    console.log(`- ${r.description}`);
  });
  
  // Save detailed report
  const report = {
    timestamp: new Date().toISOString(),
    summary: {
      totalTests,
      passedTests,
      failedTests,
      criticalFailures,
      successRate: ((passedTests/totalTests)*100).toFixed(1)
    },
    results: testResults
  };
  
  fs.writeFileSync('production-review-report.json', JSON.stringify(report, null, 2));
  console.log('\n📄 Detailed report saved to: production-review-report.json');
  
  // Production readiness assessment
  console.log('\n🚀 PRODUCTION READINESS ASSESSMENT:');
  if (criticalFailures === 0 && failedTests < 3) {
    console.log('✅ READY FOR PRODUCTION - All critical systems operational');
  } else if (criticalFailures === 0) {
    console.log('⚠️  MOSTLY READY - Minor issues detected, but no critical failures');
  } else {
    console.log('❌ NOT READY - Critical issues must be resolved before production');
  }
}

async function runProductionReview() {
  console.log('🔍 Starting Comprehensive Production Review...');
  console.log('Testing all company and technician systems and features\n');
  
  // Authenticate first
  const user = await authenticateUser();
  if (!user) {
    console.log('❌ Authentication failed - cannot proceed with tests');
    return;
  }
  
  // Run all test suites
  await testCompanyProfile();
  await testTechnicianSystem();
  await testCheckInSystem();
  await testJobTypesSystem();
  await testDashboardComponents();
  await testPublicAPIs();
  await testIntegrationSystems();
  await testMobileAppEndpoints();
  
  // Generate final report
  await generateTestReport();
}

// Execute the production review
runProductionReview().catch(console.error);