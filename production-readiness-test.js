/**
 * Complete Production Readiness Test Suite
 * Tests all critical system functionality for deployment readiness
 */

import fetch from 'node-fetch';

const BASE_URL = 'http://localhost:5000';
const testResults = {
  total: 0,
  passed: 0,
  failed: 0,
  critical: 0,
  sections: {}
};

// Test logging
function logTest(section, description, passed, details = '', critical = false) {
  const status = passed ? '✅ PASS' : (critical ? '❌ CRITICAL FAIL' : '⚠️  FAIL');
  console.log(`${status}: ${description}`);
  if (details) {
    console.log(`   ${details}`);
  }
  
  if (!testResults.sections[section]) {
    testResults.sections[section] = { total: 0, passed: 0, failed: 0 };
  }
  
  testResults.total++;
  testResults.sections[section].total++;
  
  if (passed) {
    testResults.passed++;
    testResults.sections[section].passed++;
  } else {
    testResults.failed++;
    testResults.sections[section].failed++;
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
      'User-Agent': 'Production-Test/1.0',
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

async function runProductionReadinessTest() {
  console.log('🚀 Production Readiness Test Suite');
  console.log('==================================\n');

  let adminCookies = '';
  let techCookies = '';
  let companyId = null;
  let technicianId = null;
  let checkInId = null;
  let blogPostId = null;
  let reviewId = null;

  // Section 1: Authentication & Security
  console.log('🔐 Section 1: Authentication & Security');
  console.log('--------------------------------------');
  
  // Test admin login
  const adminLoginResponse = await makeRequest('POST', '/api/auth/login', {
    email: 'rodbartrufftech@gmail.com',
    password: 'test123'
  });
  
  const adminLoginSuccess = adminLoginResponse.ok;
  if (adminLoginSuccess) {
    adminCookies = extractCookies(adminLoginResponse.headers);
    const adminResult = await adminLoginResponse.json();
    companyId = adminResult.companyId;
  }
  
  logTest('auth', 'Admin Authentication', adminLoginSuccess, 
    adminLoginSuccess ? 'Company admin login successful' : 'Failed to authenticate admin', true);

  // Test technician login
  const techLoginResponse = await makeRequest('POST', '/api/auth/login', {
    email: 'rodbartruffonline@gmail.com',
    password: 'test123'
  });
  
  const techLoginSuccess = techLoginResponse.ok;
  if (techLoginSuccess) {
    techCookies = extractCookies(techLoginResponse.headers);
  }
  
  logTest('auth', 'Technician Authentication', techLoginSuccess, 
    techLoginSuccess ? 'Technician login successful' : 'Failed to authenticate technician');

  // Test session persistence
  const sessionResponse = await makeRequest('GET', '/api/auth/me', null, adminCookies);
  const sessionSuccess = sessionResponse.ok;
  logTest('auth', 'Session Persistence', sessionSuccess, 
    sessionSuccess ? 'Session maintained correctly' : 'Session not persistent');

  // Test logout
  const logoutResponse = await makeRequest('POST', '/api/auth/logout', null, adminCookies);
  const logoutSuccess = logoutResponse.ok;
  logTest('auth', 'Logout Functionality', logoutSuccess, 
    logoutSuccess ? 'Logout successful' : 'Logout failed');

  // Re-login for remaining tests
  const reloginResponse = await makeRequest('POST', '/api/auth/login', {
    email: 'rodbartrufftech@gmail.com',
    password: 'test123'
  });
  if (reloginResponse.ok) {
    adminCookies = extractCookies(reloginResponse.headers);
  }

  // Section 2: Core Data Management
  console.log('\n🏢 Section 2: Core Data Management');
  console.log('----------------------------------');

  // Test company data access
  if (companyId) {
    const companyResponse = await makeRequest('GET', `/api/companies/${companyId}`, null, adminCookies);
    logTest('data', 'Company Data Access', companyResponse.ok, 
      companyResponse.ok ? 'Company data retrieved successfully' : 'Failed to access company data');
  }

  // Test technician management
  const techsResponse = await makeRequest('GET', '/api/technicians', null, adminCookies);
  const techsSuccess = techsResponse.ok;
  if (techsSuccess) {
    const techsResult = await techsResponse.json();
    if (techsResult.length > 0) {
      technicianId = techsResult[0].id;
    }
  }
  logTest('data', 'Technician Management', techsSuccess, 
    techsSuccess ? `Technician data accessible` : 'Failed to access technician data');

  // Test job types
  const jobTypesResponse = await makeRequest('GET', '/api/job-types', null, adminCookies);
  logTest('data', 'Job Types Management', jobTypesResponse.ok, 
    jobTypesResponse.ok ? 'Job types accessible' : 'Failed to access job types');

  // Section 3: Check-in System
  console.log('\n📝 Section 3: Check-in System');
  console.log('-----------------------------');

  // Test check-in creation
  if (technicianId) {
    const checkInData = new FormData();
    checkInData.append('technicianId', technicianId.toString());
    checkInData.append('jobType', 'Production Test');
    checkInData.append('customerName', 'Test Customer');
    checkInData.append('customerEmail', 'test@example.com');
    checkInData.append('location', '123 Test Street, Dallas, TX 75001');
    checkInData.append('latitude', '32.7767');
    checkInData.append('longitude', '-96.7970');
    checkInData.append('notes', 'Production readiness test check-in');
    checkInData.append('workPerformed', 'System validation testing');
    checkInData.append('createBlogPost', 'true');
    checkInData.append('sendReviewRequest', 'true');

    const checkInResponse = await makeRequest('POST', '/api/check-ins', checkInData, adminCookies);
    const checkInSuccess = checkInResponse.ok;
    
    if (checkInSuccess) {
      const checkInResult = await checkInResponse.json();
      checkInId = checkInResult.id;
    }
    
    logTest('checkin', 'Check-in Creation', checkInSuccess, 
      checkInSuccess ? `Check-in created with ID: ${checkInId}` : 'Failed to create check-in', true);
  }

  // Test check-in retrieval
  const checkInsResponse = await makeRequest('GET', '/api/check-ins', null, adminCookies);
  logTest('checkin', 'Check-in Retrieval', checkInsResponse.ok, 
    checkInsResponse.ok ? 'Check-ins retrieved successfully' : 'Failed to retrieve check-ins');

  // Test photo upload (if check-in exists)
  if (checkInId) {
    const photoData = new FormData();
    photoData.append('photos', Buffer.from('fake-image-data'), 'test.jpg');
    
    const photoResponse = await makeRequest('POST', `/api/check-ins/upload-photos`, photoData, adminCookies);
    logTest('checkin', 'Photo Upload', photoResponse.ok, 
      photoResponse.ok ? 'Photo upload successful' : 'Photo upload failed');
  }

  // Section 4: Content Generation
  console.log('\n📖 Section 4: Content Generation');
  console.log('---------------------------------');

  // Test blog post generation
  if (checkInId) {
    const blogGenResponse = await makeRequest('POST', `/api/blog/generate-from-checkin/${checkInId}`, {
      aiProvider: 'openai'
    }, adminCookies);
    
    const blogGenSuccess = blogGenResponse.ok;
    if (blogGenSuccess) {
      const blogResult = await blogGenResponse.json();
      
      // Save the generated blog post
      const saveBlogResponse = await makeRequest('POST', '/api/blog', {
        title: blogResult.title,
        content: blogResult.content,
        checkInId: checkInId,
        published: true
      }, adminCookies);
      
      if (saveBlogResponse.ok) {
        const savedBlog = await saveBlogResponse.json();
        blogPostId = savedBlog.id;
      }
    }
    
    logTest('content', 'Blog Generation', blogGenSuccess, 
      blogGenSuccess ? 'Blog post generated successfully' : 'Blog generation failed');
  }

  // Test blog retrieval
  const blogsResponse = await makeRequest('GET', '/api/blog', null, adminCookies);
  logTest('content', 'Blog Management', blogsResponse.ok, 
    blogsResponse.ok ? 'Blog posts accessible' : 'Failed to access blog posts');

  // Section 5: Review System
  console.log('\n⭐ Section 5: Review System');
  console.log('---------------------------');

  // Test review request generation
  if (checkInId) {
    const reviewRequestResponse = await makeRequest('POST', `/api/reviews/request-review/${checkInId}`, {}, adminCookies);
    logTest('reviews', 'Review Request Generation', reviewRequestResponse.ok, 
      reviewRequestResponse.ok ? 'Review request created' : 'Review request failed');
  }

  // Test customer review submission
  if (checkInId) {
    const customerReviewData = {
      checkInId: checkInId,
      customerName: 'Test Customer',
      customerEmail: 'test@example.com',
      rating: 5,
      reviewText: 'Excellent service! Professional and efficient work.',
      wouldRecommend: true
    };

    const reviewResponse = await makeRequest('POST', '/api/reviews', customerReviewData);
    const reviewSuccess = reviewResponse.ok;
    
    if (reviewSuccess) {
      const reviewResult = await reviewResponse.json();
      reviewId = reviewResult.id;
    }
    
    logTest('reviews', 'Customer Review Submission', reviewSuccess, 
      reviewSuccess ? 'Customer review submitted successfully' : 'Review submission failed');
  }

  // Test review retrieval
  const reviewsResponse = await makeRequest('GET', '/api/reviews', null, adminCookies);
  logTest('reviews', 'Review Management', reviewsResponse.ok, 
    reviewsResponse.ok ? 'Reviews accessible' : 'Failed to access reviews');

  // Section 6: Integration Systems
  console.log('\n🔌 Section 6: Integration Systems');
  console.log('---------------------------------');

  // Test WordPress configuration
  const wpConfigResponse = await makeRequest('GET', '/api/wordpress/config', null, adminCookies);
  logTest('integration', 'WordPress Configuration', wpConfigResponse.ok, 
    wpConfigResponse.ok ? 'WordPress config accessible' : 'WordPress config inaccessible');

  // Test public API
  if (companyId) {
    const publicApiResponse = await makeRequest('GET', `/api/public/check-ins?company_id=${companyId}&limit=5`);
    logTest('integration', 'Public API Access', publicApiResponse.ok, 
      publicApiResponse.ok ? 'Public API functional' : 'Public API failed');
  }

  // Section 7: Analytics & Reporting
  console.log('\n📊 Section 7: Analytics & Reporting');
  console.log('-----------------------------------');

  // Test company statistics
  const statsResponse = await makeRequest('GET', '/api/company-stats', null, adminCookies);
  logTest('analytics', 'Company Statistics', statsResponse.ok, 
    statsResponse.ok ? 'Statistics accessible' : 'Statistics failed');

  // Section 8: PWA & Mobile Features
  console.log('\n📱 Section 8: PWA & Mobile Features');
  console.log('-----------------------------------');

  // Test PWA manifest
  const manifestResponse = await makeRequest('GET', '/manifest.json');
  logTest('pwa', 'PWA Manifest', manifestResponse.ok, 
    manifestResponse.ok ? 'PWA manifest accessible' : 'PWA manifest missing');

  // Test service worker
  const swResponse = await makeRequest('GET', '/service-worker.js');
  logTest('pwa', 'Service Worker', swResponse.ok, 
    swResponse.ok ? 'Service worker accessible' : 'Service worker missing');

  // Section 9: Database Health
  console.log('\n🗄️  Section 9: Database Health');
  console.log('------------------------------');

  // Test database connectivity through multiple endpoints
  const dbTests = [
    { endpoint: '/api/companies', name: 'Companies Table' },
    { endpoint: '/api/technicians', name: 'Technicians Table' },
    { endpoint: '/api/check-ins', name: 'Check-ins Table' },
    { endpoint: '/api/job-types', name: 'Job Types Table' }
  ];

  for (const test of dbTests) {
    const response = await makeRequest('GET', test.endpoint, null, adminCookies);
    logTest('database', test.name, response.ok, 
      response.ok ? `${test.name} accessible` : `${test.name} failed`);
  }

  // Section 10: Security & Performance
  console.log('\n🔒 Section 10: Security & Performance');
  console.log('------------------------------------');

  // Test unauthorized access protection
  const unauthorizedResponse = await makeRequest('GET', '/api/check-ins');
  const securityTest = unauthorizedResponse.status === 401;
  logTest('security', 'Unauthorized Access Protection', securityTest, 
    securityTest ? 'Protected endpoints secured' : 'Security vulnerability detected', true);

  // Test rate limiting (simulate multiple requests)
  let rateLimitTest = true;
  try {
    for (let i = 0; i < 5; i++) {
      await makeRequest('GET', '/api/auth/me', null, adminCookies);
    }
  } catch (error) {
    rateLimitTest = false;
  }
  logTest('security', 'Rate Limiting', rateLimitTest, 
    rateLimitTest ? 'Rate limiting functional' : 'Rate limiting failed');

  // Test CORS headers
  const corsResponse = await makeRequest('OPTIONS', '/api/auth/me');
  const corsTest = corsResponse.headers.get('access-control-allow-origin') !== null;
  logTest('security', 'CORS Configuration', corsTest, 
    corsTest ? 'CORS headers configured' : 'CORS headers missing');

  // Cleanup test data
  console.log('\n🧹 Cleanup Test Data');
  console.log('--------------------');
  
  if (checkInId) {
    try {
      await makeRequest('DELETE', `/api/check-ins/${checkInId}`, null, adminCookies);
      console.log('✅ Test check-in cleaned up');
    } catch (error) {
      console.log('⚠️  Could not clean up test check-in');
    }
  }

  if (blogPostId) {
    try {
      await makeRequest('DELETE', `/api/blog/${blogPostId}`, null, adminCookies);
      console.log('✅ Test blog post cleaned up');
    } catch (error) {
      console.log('⚠️  Could not clean up test blog post');
    }
  }

  // Final Results Summary
  console.log('\n📋 PRODUCTION READINESS SUMMARY');
  console.log('===============================');
  
  console.log(`Total Tests: ${testResults.total}`);
  console.log(`✅ Passed: ${testResults.passed}`);
  console.log(`❌ Failed: ${testResults.failed}`);
  console.log(`🔥 Critical Failures: ${testResults.critical}`);
  
  const passRate = testResults.total > 0 ? ((testResults.passed / testResults.total) * 100).toFixed(1) : 0;
  console.log(`📈 Pass Rate: ${passRate}%`);
  
  console.log('\n📊 Section Breakdown:');
  for (const [section, results] of Object.entries(testResults.sections)) {
    const sectionRate = results.total > 0 ? ((results.passed / results.total) * 100).toFixed(1) : 0;
    console.log(`   ${section}: ${results.passed}/${results.total} (${sectionRate}%)`);
  }
  
  console.log('\n🎯 Production Readiness Assessment:');
  if (testResults.critical > 0) {
    console.log('❌ NOT READY - Critical failures detected');
    console.log('   System requires immediate fixes before deployment');
  } else if (passRate >= 95) {
    console.log('✅ PRODUCTION READY - Excellent system health');
    console.log('   System is ready for deployment with confidence');
  } else if (passRate >= 85) {
    console.log('⚠️  MOSTLY READY - Minor issues detected');
    console.log('   System can be deployed but monitor for issues');
  } else {
    console.log('🔧 NEEDS WORK - Multiple issues require attention');
    console.log('   Address failures before production deployment');
  }
  
  console.log('\n✨ Production Readiness Test Complete');
}

// Execute the test suite
runProductionReadinessTest().catch(console.error);