/**
 * Working System Test Suite for Rank It Pro
 * Tests existing system functionality with current authenticated session
 */

import fetch from 'node-fetch';

// Test configuration
const BASE_URL = 'http://localhost:5000';
const testResults = {
  total: 0,
  passed: 0,
  failed: 0,
  critical: 0
};

// Helper functions
function logTest(description, passed, details = '', critical = false) {
  const status = passed ? '✅ PASS' : (critical ? '❌ CRITICAL FAIL' : '⚠️  FAIL');
  console.log(`${status}: ${description}`);
  if (details) {
    console.log(`   Details: ${details}`);
  }
  console.log('');
  
  testResults.total++;
  if (passed) {
    testResults.passed++;
  } else {
    testResults.failed++;
    if (critical) {
      testResults.critical++;
    }
  }
}

async function makeRequest(method, endpoint, data = null, cookies = '') {
  const url = `${BASE_URL}${endpoint}`;
  const options = {
    method,
    headers: {
      'User-Agent': 'System-Test/1.0',
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
    return {
      ok: response.ok,
      status: response.status,
      headers: response.headers,
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
    console.error(`Request failed: ${method} ${endpoint}`, error.message);
    return {
      ok: false,
      status: 0,
      headers: new Map(),
      json: async () => ({ error: error.message })
    };
  }
}

function extractCookies(headers) {
  const cookies = [];
  const setCookieHeader = headers.get('set-cookie');
  if (setCookieHeader) {
    const cookieStrings = Array.isArray(setCookieHeader) ? setCookieHeader : [setCookieHeader];
    cookieStrings.forEach(cookieString => {
      const cookie = cookieString.split(';')[0];
      cookies.push(cookie);
    });
  }
  return cookies.join('; ');
}

async function runSystemTest() {
  console.log('🚀 Starting Comprehensive System Test');
  console.log('====================================\n');

  let adminCookies = '';
  let companyId = null;
  let technicianId = null;
  let checkInId = null;

  try {
    // Test 1: Authentication with existing credentials
    console.log('🔐 Phase 1: Authentication Testing');
    console.log('----------------------------------');
    
    const loginResponse = await makeRequest('POST', '/api/auth/login', {
      email: 'rodbartrufftech@gmail.com',
      password: 'test123'
    });
    
    const loginSuccess = loginResponse.ok;
    const loginResult = loginSuccess ? await loginResponse.json() : await loginResponse.json();
    
    if (loginSuccess) {
      adminCookies = extractCookies(loginResponse.headers);
      companyId = loginResult.companyId;
    }
    
    logTest('Admin Login', loginSuccess, 
      loginSuccess ? `User: ${loginResult.email}, Company: ${companyId}` : loginResult.message || loginResult.error, 
      true);

    if (!loginSuccess) {
      console.log('❌ Cannot continue without authentication');
      return;
    }

    // Test 2: User Profile Verification
    const meResponse = await makeRequest('GET', '/api/auth/me', null, adminCookies);
    const meSuccess = meResponse.ok;
    const meResult = meSuccess ? await meResponse.json() : await meResponse.json();
    
    logTest('User Profile Verification', meSuccess, 
      meSuccess ? `Role: ${meResult.user?.role}, Company: ${meResult.company?.name}` : meResult.error);

    // Test 3: Company Data Access
    console.log('🏢 Phase 2: Company Management');
    console.log('------------------------------');
    
    if (companyId) {
      const companyResponse = await makeRequest('GET', `/api/companies/${companyId}`, null, adminCookies);
      const companySuccess = companyResponse.ok;
      const companyResult = companySuccess ? await companyResponse.json() : await companyResponse.json();
      
      logTest('Company Data Access', companySuccess, 
        companySuccess ? `Company: ${companyResult.name}, Plan: ${companyResult.plan}` : companyResult.error);
    }

    // Test 4: Job Types Management
    console.log('🔧 Phase 3: Job Types System');
    console.log('----------------------------');
    
    const jobTypesResponse = await makeRequest('GET', '/api/job-types', null, adminCookies);
    const jobTypesSuccess = jobTypesResponse.ok;
    const jobTypesResult = jobTypesSuccess ? await jobTypesResponse.json() : await jobTypesResponse.json();
    
    logTest('Job Types Retrieval', jobTypesSuccess, 
      jobTypesSuccess ? `Found ${jobTypesResult.length} job types` : jobTypesResult.error);

    // Create a new job type for testing
    const newJobType = {
      name: 'System Test Repair',
      description: 'Test job type for system validation'
    };
    
    const createJobTypeResponse = await makeRequest('POST', '/api/job-types', newJobType, adminCookies);
    const createJobTypeSuccess = createJobTypeResponse.ok;
    const createJobTypeResult = createJobTypeSuccess ? await createJobTypeResponse.json() : await createJobTypeResponse.json();
    
    logTest('Job Type Creation', createJobTypeSuccess, 
      createJobTypeSuccess ? `Created: ${newJobType.name}` : createJobTypeResult.error);

    // Test 5: Technician Management
    console.log('👨‍🔧 Phase 4: Technician Management');
    console.log('---------------------------------');
    
    const techsResponse = await makeRequest('GET', '/api/technicians', null, adminCookies);
    const techsSuccess = techsResponse.ok;
    const techsResult = techsSuccess ? await techsResponse.json() : await techsResponse.json();
    
    if (techsSuccess && techsResult.length > 0) {
      technicianId = techsResult[0].id;
    }
    
    logTest('Technician Listing', techsSuccess, 
      techsSuccess ? `Found ${techsResult.length} technicians` : techsResult.error);

    // Test 6: Check-in System
    console.log('📝 Phase 5: Check-in System');
    console.log('---------------------------');
    
    const existingCheckInsResponse = await makeRequest('GET', '/api/check-ins', null, adminCookies);
    const existingCheckInsSuccess = existingCheckInsResponse.ok;
    const existingCheckInsResult = existingCheckInsSuccess ? await existingCheckInsResponse.json() : await existingCheckInsResponse.json();
    
    logTest('Check-ins Retrieval', existingCheckInsSuccess, 
      existingCheckInsSuccess ? `Found ${existingCheckInsResult.length} existing check-ins` : existingCheckInsResult.error);

    // Create a test check-in
    if (technicianId) {
      const checkInData = new FormData();
      checkInData.append('technicianId', technicianId.toString());
      checkInData.append('jobType', 'System Test Repair');
      checkInData.append('customerName', 'Test Customer');
      checkInData.append('customerEmail', 'test@example.com');
      checkInData.append('location', 'Test Location, Dallas, TX');
      checkInData.append('latitude', '32.7767');
      checkInData.append('longitude', '-96.7970');
      checkInData.append('notes', 'System test check-in submission');
      checkInData.append('workPerformed', 'Tested system functionality');
      checkInData.append('createBlogPost', 'true');
      checkInData.append('sendReviewRequest', 'true');

      const checkInResponse = await makeRequest('POST', '/api/check-ins', checkInData, adminCookies);
      const checkInSuccess = checkInResponse.ok;
      const checkInResult = checkInSuccess ? await checkInResponse.json() : await checkInResponse.json();
      
      if (checkInSuccess) {
        checkInId = checkInResult.id;
      }
      
      logTest('Check-in Creation', checkInSuccess, 
        checkInSuccess ? `Created check-in ID: ${checkInId}` : checkInResult.error);
    }

    // Test 7: Blog System
    console.log('📖 Phase 6: Blog Generation System');
    console.log('----------------------------------');
    
    const blogsResponse = await makeRequest('GET', '/api/blog', null, adminCookies);
    const blogsSuccess = blogsResponse.ok;
    const blogsResult = blogsSuccess ? await blogsResponse.json() : await blogsResponse.json();
    
    logTest('Blog Posts Retrieval', blogsSuccess, 
      blogsSuccess ? `Found ${blogsResult.length || 0} blog posts` : blogsResult.error);

    // Test blog generation from check-in
    if (checkInId) {
      const blogGenResponse = await makeRequest('POST', `/api/blog/generate-from-checkin/${checkInId}`, {
        aiProvider: 'openai'
      }, adminCookies);
      const blogGenSuccess = blogGenResponse.ok;
      const blogGenResult = blogGenSuccess ? await blogGenResponse.json() : await blogGenResponse.json();
      
      logTest('Blog Generation from Check-in', blogGenSuccess, 
        blogGenSuccess ? `Generated: ${blogGenResult.title?.substring(0, 50)}...` : blogGenResult.error);
    }

    // Test 8: Review System
    console.log('⭐ Phase 7: Review System');
    console.log('------------------------');
    
    const reviewsResponse = await makeRequest('GET', '/api/reviews', null, adminCookies);
    const reviewsSuccess = reviewsResponse.ok;
    const reviewsResult = reviewsSuccess ? await reviewsResponse.json() : await reviewsResponse.json();
    
    logTest('Reviews Retrieval', reviewsSuccess, 
      reviewsSuccess ? `Found ${reviewsResult.length || 0} reviews` : reviewsResult.error);

    // Test review request generation
    if (checkInId) {
      const reviewRequestResponse = await makeRequest('POST', `/api/reviews/request-review/${checkInId}`, {}, adminCookies);
      const reviewRequestSuccess = reviewRequestResponse.ok;
      const reviewRequestResult = reviewRequestSuccess ? await reviewRequestResponse.json() : await reviewRequestResponse.json();
      
      logTest('Review Request Generation', reviewRequestSuccess, 
        reviewRequestSuccess ? 'Review request created successfully' : reviewRequestResult.error);
    }

    // Test 9: WordPress Integration
    console.log('🔌 Phase 8: WordPress Integration');
    console.log('---------------------------------');
    
    const wpConfigResponse = await makeRequest('GET', '/api/wordpress/config', null, adminCookies);
    const wpConfigSuccess = wpConfigResponse.ok;
    const wpConfigResult = wpConfigSuccess ? await wpConfigResponse.json() : await wpConfigResponse.json();
    
    logTest('WordPress Configuration Check', wpConfigSuccess, 
      wpConfigSuccess ? 'WordPress config accessible' : wpConfigResult.error);

    // Test 10: Company Statistics
    console.log('📊 Phase 9: Analytics and Statistics');
    console.log('------------------------------------');
    
    const statsResponse = await makeRequest('GET', '/api/company-stats', null, adminCookies);
    const statsSuccess = statsResponse.ok;
    const statsResult = statsSuccess ? await statsResponse.json() : await statsResponse.json();
    
    logTest('Company Statistics', statsSuccess, 
      statsSuccess ? `Check-ins: ${statsResult.totalCheckins}, Techs: ${statsResult.activeTechs}` : statsResult.error);

    // Test 11: PWA Features
    console.log('📱 Phase 10: PWA Features');
    console.log('-------------------------');
    
    const manifestResponse = await makeRequest('GET', '/manifest.json');
    const manifestSuccess = manifestResponse.ok;
    
    logTest('PWA Manifest', manifestSuccess, 
      manifestSuccess ? 'PWA manifest accessible' : 'Manifest not found');

    // Test 12: Public APIs
    console.log('🌐 Phase 11: Public API Access');
    console.log('------------------------------');
    
    if (companyId) {
      const publicCheckInsResponse = await makeRequest('GET', `/api/public/check-ins?company_id=${companyId}&limit=5`);
      const publicCheckInsSuccess = publicCheckInsResponse.ok;
      const publicCheckInsResult = publicCheckInsSuccess ? await publicCheckInsResponse.json() : await publicCheckInsResponse.json();
      
      logTest('Public Check-ins API', publicCheckInsSuccess, 
        publicCheckInsSuccess ? `Public API returned ${publicCheckInsResult.length} items` : publicCheckInsResult.error);
    }

  } catch (error) {
    console.error('💥 Critical Error in Test Suite:', error);
    logTest('Test Suite Execution', false, error.message, true);
  }

  // Test Results Summary
  console.log('📋 SYSTEM TEST RESULTS SUMMARY');
  console.log('==============================');
  console.log(`Total Tests: ${testResults.total}`);
  console.log(`✅ Passed: ${testResults.passed}`);
  console.log(`❌ Failed: ${testResults.failed}`);
  console.log(`🔥 Critical Failures: ${testResults.critical}`);
  
  const passRate = testResults.total > 0 ? ((testResults.passed / testResults.total) * 100).toFixed(1) : 0;
  console.log(`📈 Pass Rate: ${passRate}%`);
  
  if (testResults.critical > 0) {
    console.log('\n❌ CRITICAL ISSUES DETECTED - System requires immediate attention');
  } else if (passRate >= 90) {
    console.log('\n✅ EXCELLENT - System is highly functional and ready for use');
  } else if (passRate >= 75) {
    console.log('\n⚠️  GOOD - System is mostly functional with minor issues');
  } else {
    console.log('\n🔧 NEEDS IMPROVEMENT - Multiple issues require attention');
  }

  console.log('\n🎯 System Test Complete');
  
  // Cleanup any test data created
  console.log('\n🧹 Cleaning up test data...');
  if (checkInId) {
    try {
      await makeRequest('DELETE', `/api/check-ins/${checkInId}`, null, adminCookies);
      console.log('✅ Test check-in removed');
    } catch (error) {
      console.log('⚠️  Could not remove test check-in (may need manual cleanup)');
    }
  }
}

// Execute the test suite
runSystemTest().catch(console.error);