/**
 * Comprehensive System Test Suite for Rank It Pro SaaS Platform
 * Tests complete workflow: Company signup → Tech management → Check-ins → Blogs → Reviews → Testimonials
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Helper function to make API requests
async function apiRequest(method, endpoint, data = null, cookies = '') {
  const url = `http://localhost:5000${endpoint}`;
  const options = {
    method,
    headers: {
      'User-Agent': 'Comprehensive-Test-Suite/1.0',
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
      json: async () => await response.json(),
      text: async () => await response.text()
    };
  } catch (error) {
    console.error(`API request failed: ${method} ${endpoint}`, error);
    throw error;
  }
}

// Helper function to extract cookies from response headers
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

// Test logging function
function logTest(description, passed, details = '', critical = false) {
  const status = passed ? '✅ PASS' : (critical ? '❌ CRITICAL FAIL' : '⚠️  FAIL');
  console.log(`${status}: ${description}`);
  if (details) {
    console.log(`   Details: ${details}`);
  }
  if (!passed && critical) {
    console.log('   ❌ CRITICAL ERROR - Test suite cannot continue');
  }
  console.log('');
}

// Test Results Tracking
const testResults = {
  total: 0,
  passed: 0,
  failed: 0,
  critical: 0
};

function trackResult(passed, critical = false) {
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

// Main test execution
async function runComprehensiveSystemTest() {
  console.log('🚀 Starting Comprehensive System Test Suite');
  console.log('=========================================\n');

  let companyId, adminCookies, technicianId, techCookies, checkInId, blogPostId, reviewId;

  try {
    // Test 1: Company Signup
    console.log('📋 Phase 1: Company Registration and Setup');
    console.log('------------------------------------------');
    
    const companyData = {
      companyName: 'ACME Home Services Test',
      adminName: 'John Admin',
      adminEmail: `test.admin.${Date.now()}@example.com`,
      adminPassword: 'test123',
      phone: '555-TEST-001',
      address: '123 Test Street',
      city: 'Test City',
      state: 'TX',
      zip: '12345'
    };

    const signupResponse = await apiRequest('POST', '/api/auth/signup', companyData);
    const signupSuccess = signupResponse.ok;
    const signupResult = signupSuccess ? await signupResponse.json() : { message: 'Signup failed' };
    
    logTest('Company Registration', signupSuccess, 
      signupSuccess ? `Company: ${companyData.companyName}, Admin: ${companyData.adminEmail}` : signupResult.message, 
      true);
    trackResult(signupSuccess, true);

    if (!signupSuccess) {
      console.log('❌ Cannot continue without successful company registration');
      return;
    }

    // Test 2: Admin Login
    const loginResponse = await apiRequest('POST', '/api/auth/login', {
      email: companyData.adminEmail,
      password: companyData.adminPassword
    });
    
    const loginSuccess = loginResponse.ok;
    adminCookies = loginSuccess ? extractCookies(loginResponse.headers) : '';
    const loginResult = loginSuccess ? await loginResponse.json() : { message: 'Login failed' };
    
    logTest('Admin Authentication', loginSuccess, 
      loginSuccess ? `User ID: ${loginResult.id}, Role: ${loginResult.role}` : loginResult.message, 
      true);
    trackResult(loginSuccess, true);

    if (!loginSuccess) return;

    companyId = loginResult.companyId;

    // Test 3: Create Job Types
    console.log('🔧 Phase 2: Job Types Management');
    console.log('--------------------------------');

    const jobTypes = [
      { name: 'Plumbing Repair', description: 'General plumbing repairs and maintenance' },
      { name: 'HVAC Installation', description: 'Heating and cooling system installation' },
      { name: 'Electrical Work', description: 'Electrical repairs and installations' }
    ];

    for (const jobType of jobTypes) {
      const jobTypeResponse = await apiRequest('POST', '/api/job-types', jobType, adminCookies);
      const success = jobTypeResponse.ok;
      logTest(`Create Job Type: ${jobType.name}`, success, 
        success ? 'Job type created successfully' : 'Failed to create job type');
      trackResult(success);
    }

    // Test 4: Add Technicians
    console.log('👨‍🔧 Phase 3: Technician Management');
    console.log('----------------------------------');

    const technicianData = {
      name: 'Mike Technician',
      email: `tech.${Date.now()}@example.com`,
      password: 'test123',
      phone: '555-TECH-01',
      specialty: 'Plumbing Repair',
      location: 'Test Area'
    };

    const techResponse = await apiRequest('POST', '/api/technicians', technicianData, adminCookies);
    const techSuccess = techResponse.ok;
    const techResult = techSuccess ? await techResponse.json() : { message: 'Tech creation failed' };
    
    logTest('Create Technician', techSuccess, 
      techSuccess ? `Technician: ${technicianData.name}, ID: ${techResult.id}` : techResult.message);
    trackResult(techSuccess);

    if (techSuccess) {
      technicianId = techResult.id;
      
      // Test technician login
      const techLoginResponse = await apiRequest('POST', '/api/auth/login', {
        email: technicianData.email,
        password: technicianData.password
      });
      
      const techLoginSuccess = techLoginResponse.ok;
      techCookies = techLoginSuccess ? extractCookies(techLoginResponse.headers) : '';
      
      logTest('Technician Authentication', techLoginSuccess, 
        techLoginSuccess ? 'Technician login successful' : 'Technician login failed');
      trackResult(techLoginSuccess);
    }

    // Test 5: Create Check-ins
    console.log('📝 Phase 4: Check-in System');
    console.log('---------------------------');

    const checkInData = {
      technicianId: technicianId,
      jobType: 'Plumbing Repair',
      customerName: 'Jane Customer',
      customerEmail: 'jane.customer@example.com',
      customerPhone: '555-CUST-01',
      location: '456 Customer Street, Test City, TX 12345',
      latitude: '32.7767',
      longitude: '-96.7970',
      address: '456 Customer Street',
      city: 'Test City',
      state: 'TX',
      zip: '12345',
      problemDescription: 'Leaky faucet in kitchen sink',
      solutionDescription: 'Replaced worn washers and O-rings',
      workPerformed: 'Fixed kitchen faucet leak by replacing internal components',
      materialsUsed: 'Washers, O-rings, plumber\'s grease',
      notes: 'Customer satisfied with repair. Provided maintenance tips.',
      followUpRequired: false,
      createBlogPost: true,
      sendReviewRequest: true
    };

    // Create FormData for check-in
    const formData = new FormData();
    Object.keys(checkInData).forEach(key => {
      const value = checkInData[key];
      if (value !== null && value !== undefined) {
        formData.append(key, value.toString());
      }
    });

    const checkInResponse = await apiRequest('POST', '/api/check-ins', formData, adminCookies);
    const checkInSuccess = checkInResponse.ok;
    const checkInResult = checkInSuccess ? await checkInResponse.json() : { message: 'Check-in creation failed' };
    
    logTest('Create Check-in', checkInSuccess, 
      checkInSuccess ? `Check-in ID: ${checkInResult.id}, Job: ${checkInData.jobType}` : checkInResult.message);
    trackResult(checkInSuccess);

    if (checkInSuccess) {
      checkInId = checkInResult.id;
    }

    // Test 6: Blog Post Generation
    console.log('📖 Phase 5: Blog Post System');
    console.log('----------------------------');

    if (checkInId) {
      const blogResponse = await apiRequest('POST', `/api/blog/generate-from-checkin/${checkInId}`, {
        aiProvider: 'openai'
      }, adminCookies);
      
      const blogSuccess = blogResponse.ok;
      const blogResult = blogSuccess ? await blogResponse.json() : { message: 'Blog generation failed' };
      
      logTest('Generate Blog Post from Check-in', blogSuccess, 
        blogSuccess ? `Title: ${blogResult.title}` : blogResult.message);
      trackResult(blogSuccess);

      if (blogSuccess) {
        // Save the blog post
        const saveBlogResponse = await apiRequest('POST', '/api/blog', {
          title: blogResult.title,
          content: blogResult.content,
          checkInId: checkInId,
          published: true
        }, adminCookies);
        
        const saveBlogSuccess = saveBlogResponse.ok;
        const saveBlogResult = saveBlogSuccess ? await saveBlogResponse.json() : { message: 'Blog save failed' };
        
        logTest('Save Generated Blog Post', saveBlogSuccess, 
          saveBlogSuccess ? `Blog Post ID: ${saveBlogResult.id}` : saveBlogResult.message);
        trackResult(saveBlogSuccess);
        
        if (saveBlogSuccess) {
          blogPostId = saveBlogResult.id;
        }
      }
    }

    // Test 7: Review System
    console.log('⭐ Phase 6: Review and Rating System');
    console.log('-----------------------------------');

    if (checkInId) {
      // Test review request generation
      const reviewRequestResponse = await apiRequest('POST', `/api/reviews/request-review/${checkInId}`, {}, adminCookies);
      const reviewRequestSuccess = reviewRequestResponse.ok;
      const reviewRequestResult = reviewRequestSuccess ? await reviewRequestResponse.json() : { message: 'Review request failed' };
      
      logTest('Generate Review Request', reviewRequestSuccess, 
        reviewRequestSuccess ? `Review request created for check-in ${checkInId}` : reviewRequestResult.message);
      trackResult(reviewRequestSuccess);

      // Simulate customer review submission
      const customerReviewData = {
        checkInId: checkInId,
        customerName: checkInData.customerName,
        customerEmail: checkInData.customerEmail,
        rating: 5,
        reviewText: 'Excellent service! Mike was professional and fixed the problem quickly. Highly recommend ACME Home Services.',
        wouldRecommend: true
      };

      const reviewResponse = await apiRequest('POST', '/api/reviews', customerReviewData);
      const reviewSuccess = reviewResponse.ok;
      const reviewResult = reviewSuccess ? await reviewResponse.json() : { message: 'Review submission failed' };
      
      logTest('Customer Review Submission', reviewSuccess, 
        reviewSuccess ? `Review ID: ${reviewResult.id}, Rating: ${customerReviewData.rating}/5` : reviewResult.message);
      trackResult(reviewSuccess);

      if (reviewSuccess) {
        reviewId = reviewResult.id;
      }
    }

    // Test 8: Testimonial System
    console.log('💬 Phase 7: Testimonial Management');
    console.log('----------------------------------');

    if (reviewId) {
      // Convert review to testimonial
      const testimonialResponse = await apiRequest('POST', `/api/testimonials/from-review/${reviewId}`, {
        featured: true,
        approved: true
      }, adminCookies);
      
      const testimonialSuccess = testimonialResponse.ok;
      const testimonialResult = testimonialSuccess ? await testimonialResponse.json() : { message: 'Testimonial creation failed' };
      
      logTest('Create Testimonial from Review', testimonialSuccess, 
        testimonialSuccess ? `Testimonial ID: ${testimonialResult.id}` : testimonialResult.message);
      trackResult(testimonialSuccess);
    }

    // Test 9: WordPress Integration
    console.log('🔌 Phase 8: WordPress Integration');
    console.log('---------------------------------');

    // Test WordPress configuration
    const wpConfigData = {
      siteUrl: 'https://acmehomeservices.com',
      apiKey: 'test-api-key-' + Date.now(),
      username: 'admin',
      password: 'wp-test-pass'
    };

    const wpConfigResponse = await apiRequest('POST', '/api/wordpress/configure', wpConfigData, adminCookies);
    const wpConfigSuccess = wpConfigResponse.ok;
    
    logTest('WordPress Configuration', wpConfigSuccess, 
      wpConfigSuccess ? 'WordPress integration configured' : 'WordPress config failed');
    trackResult(wpConfigSuccess);

    // Test public API for WordPress plugin
    if (wpConfigSuccess) {
      const publicApiResponse = await apiRequest('GET', `/api/wordpress/public/check-ins?apiKey=${wpConfigData.apiKey}&limit=5`);
      const publicApiSuccess = publicApiResponse.ok;
      const publicApiResult = publicApiSuccess ? await publicApiResponse.json() : { message: 'Public API failed' };
      
      logTest('WordPress Public API', publicApiSuccess, 
        publicApiSuccess ? `Retrieved ${publicApiResult.length || 0} check-ins` : publicApiResult.message);
      trackResult(publicApiSuccess);
    }

    // Test 10: Dashboard Analytics
    console.log('📊 Phase 9: Dashboard and Analytics');
    console.log('-----------------------------------');

    const statsResponse = await apiRequest('GET', '/api/company-stats', null, adminCookies);
    const statsSuccess = statsResponse.ok;
    const statsResult = statsSuccess ? await statsResponse.json() : { message: 'Stats retrieval failed' };
    
    logTest('Company Statistics', statsSuccess, 
      statsSuccess ? `Check-ins: ${statsResult.totalCheckins}, Techs: ${statsResult.activeTechs}` : statsResult.message);
    trackResult(statsSuccess);

    // Test 11: Mobile PWA Features
    console.log('📱 Phase 10: Mobile PWA Features');
    console.log('--------------------------------');

    const manifestResponse = await apiRequest('GET', '/manifest.json');
    const manifestSuccess = manifestResponse.ok;
    
    logTest('PWA Manifest', manifestSuccess, 
      manifestSuccess ? 'PWA manifest accessible' : 'PWA manifest failed');
    trackResult(manifestSuccess);

    const serviceWorkerResponse = await apiRequest('GET', '/service-worker.js');
    const swSuccess = serviceWorkerResponse.ok;
    
    logTest('Service Worker', swSuccess, 
      swSuccess ? 'Service worker accessible' : 'Service worker failed');
    trackResult(swSuccess);

  } catch (error) {
    console.error('💥 Critical Error in Test Suite:', error);
    logTest('Test Suite Execution', false, error.message, true);
    trackResult(false, true);
  }

  // Test Results Summary
  console.log('📋 COMPREHENSIVE TEST RESULTS SUMMARY');
  console.log('=====================================');
  console.log(`Total Tests: ${testResults.total}`);
  console.log(`✅ Passed: ${testResults.passed}`);
  console.log(`❌ Failed: ${testResults.failed}`);
  console.log(`🔥 Critical Failures: ${testResults.critical}`);
  
  const passRate = testResults.total > 0 ? ((testResults.passed / testResults.total) * 100).toFixed(1) : 0;
  console.log(`📈 Pass Rate: ${passRate}%`);
  
  if (testResults.critical > 0) {
    console.log('\n❌ CRITICAL ISSUES DETECTED - System not ready for production');
  } else if (passRate >= 90) {
    console.log('\n✅ EXCELLENT - System ready for production deployment');
  } else if (passRate >= 75) {
    console.log('\n⚠️  GOOD - System mostly functional, minor issues to address');
  } else {
    console.log('\n🔧 NEEDS WORK - Significant issues require attention');
  }

  console.log('\n🎯 Test Complete - Check individual test results above for details');
}

// Execute the test suite
runComprehensiveSystemTest().catch(console.error);