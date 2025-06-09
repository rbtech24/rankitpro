#!/usr/bin/env node

/**
 * Comprehensive System Test Suite for Rank It Pro SaaS Platform
 * Tests all major features and systems
 */

import fetch from 'node-fetch';
import fs from 'fs';

const BASE_URL = 'http://localhost:5000';
let authCookies = '';
let testResults = {
  passed: 0,
  failed: 0,
  tests: []
};

// Helper function for API requests
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

  const response = await fetch(`${BASE_URL}${endpoint}`, options);
  return response;
}

// Test logging
function logTest(description, passed, error = null) {
  const status = passed ? '✅ PASS' : '❌ FAIL';
  console.log(`${status}: ${description}`);
  
  if (error) {
    console.log(`   Error: ${error}`);
  }
  
  testResults.tests.push({ description, passed, error });
  if (passed) {
    testResults.passed++;
  } else {
    testResults.failed++;
  }
}

// Test 1: Authentication System
async function testAuthentication() {
  console.log('\n🔐 Testing Authentication System...');
  
  try {
    // Test login with super admin credentials
    const loginResponse = await apiRequest('POST', '/api/auth/login', {
      email: 'admin-1749433809072@rankitpro.system',
      password: 'KHv92*KgRPje43ZD'
    });

    if (loginResponse.ok) {
      const user = await loginResponse.json();
      authCookies = loginResponse.headers.get('set-cookie') || '';
      logTest('Super admin login successful', true);
      logTest(`User role verification: ${user.role}`, user.role === 'super_admin');
    } else {
      logTest('Super admin login failed', false, await loginResponse.text());
      return false;
    }

    // Test authenticated endpoint
    const meResponse = await apiRequest('GET', '/api/auth/me', null, authCookies);
    logTest('Authenticated endpoint access', meResponse.ok);
    
    return true;
  } catch (error) {
    logTest('Authentication system error', false, error.message);
    return false;
  }
}

// Test 2: Company Management
async function testCompanyManagement() {
  console.log('\n🏢 Testing Company Management...');
  
  try {
    // Create test company
    const companyData = {
      name: 'Test Home Services LLC',
      plan: 'pro',
      usageLimit: 1000,
      reviewSettings: JSON.stringify({ autoRequestDelay: 24, followUpEnabled: true }),
      brandingSettings: JSON.stringify({ primaryColor: '#0088d2', logo: '' }),
      notificationSettings: JSON.stringify({ emailEnabled: true, smsEnabled: true }),
      subscriptionStatus: 'active',
      billingCycle: 'monthly'
    };

    const createResponse = await apiRequest('POST', '/api/companies', companyData, authCookies);
    
    if (createResponse.ok) {
      const company = await createResponse.json();
      logTest('Company creation successful', true);
      
      // Test company retrieval
      const getResponse = await apiRequest('GET', '/api/companies', null, authCookies);
      const companies = await getResponse.json();
      logTest('Company retrieval successful', companies.length > 0);
      
      return company.id;
    } else {
      logTest('Company creation failed', false, await createResponse.text());
      return null;
    }
  } catch (error) {
    logTest('Company management error', false, error.message);
    return null;
  }
}

// Test 3: User Management & Roles
async function testUserManagement(companyId) {
  console.log('\n👥 Testing User Management & Roles...');
  
  if (!companyId) {
    logTest('Skipping user tests - no company created', false);
    return null;
  }

  try {
    // Create company admin
    const adminData = {
      email: 'admin@testhomeservices.com',
      username: 'company_admin',
      password: 'AdminPass123!',
      role: 'company_admin',
      companyId: companyId
    };

    const adminResponse = await apiRequest('POST', '/api/users', adminData, authCookies);
    
    if (adminResponse.ok) {
      const admin = await adminResponse.json();
      logTest('Company admin creation successful', true);
      
      // Create technician
      const techData = {
        email: 'tech@testhomeservices.com',
        username: 'technician_1',
        password: 'TechPass123!',
        role: 'technician',
        companyId: companyId
      };

      const techResponse = await apiRequest('POST', '/api/users', techData, authCookies);
      
      if (techResponse.ok) {
        const technician = await techResponse.json();
        logTest('Technician creation successful', true);
        return { admin, technician };
      } else {
        logTest('Technician creation failed', false, await techResponse.text());
      }
    } else {
      logTest('Company admin creation failed', false, await adminResponse.text());
    }
  } catch (error) {
    logTest('User management error', false, error.message);
  }
  
  return null;
}

// Test 4: Job Types Management
async function testJobTypes(companyId) {
  console.log('\n🔧 Testing Job Types Management...');
  
  if (!companyId) {
    logTest('Skipping job types tests - no company created', false);
    return [];
  }

  try {
    const jobTypes = [
      { name: 'HVAC Repair', companyId },
      { name: 'Plumbing Service', companyId },
      { name: 'Electrical Work', companyId }
    ];

    const createdJobTypes = [];
    
    for (const jobType of jobTypes) {
      const response = await apiRequest('POST', '/api/job-types', jobType, authCookies);
      if (response.ok) {
        const created = await response.json();
        createdJobTypes.push(created);
      }
    }

    logTest('Job types creation', createdJobTypes.length === jobTypes.length);
    
    // Test retrieval
    const getResponse = await apiRequest('GET', '/api/job-types', null, authCookies);
    const retrievedJobTypes = await getResponse.json();
    logTest('Job types retrieval', retrievedJobTypes.length >= createdJobTypes.length);
    
    return createdJobTypes;
  } catch (error) {
    logTest('Job types management error', false, error.message);
    return [];
  }
}

// Test 5: Check-in System
async function testCheckInSystem(companyId, technicianId) {
  console.log('\n📍 Testing Check-in System...');
  
  if (!companyId || !technicianId) {
    logTest('Skipping check-in tests - missing prerequisites', false);
    return null;
  }

  try {
    const checkInData = {
      jobType: 'HVAC Repair',
      customerName: 'John Smith',
      customerEmail: 'john@example.com',
      customerPhone: '555-1234',
      location: '123 Main St, Anytown, ST 12345',
      notes: 'Routine maintenance check',
      workPerformed: 'Cleaned filters, checked refrigerant levels',
      companyId: companyId,
      technicianId: technicianId
    };

    const response = await apiRequest('POST', '/api/check-ins', checkInData, authCookies);
    
    if (response.ok) {
      const checkIn = await response.json();
      logTest('Check-in creation successful', true);
      
      // Test retrieval
      const getResponse = await apiRequest('GET', '/api/check-ins', null, authCookies);
      const checkIns = await getResponse.json();
      logTest('Check-ins retrieval', checkIns.length > 0);
      
      return checkIn;
    } else {
      logTest('Check-in creation failed', false, await response.text());
    }
  } catch (error) {
    logTest('Check-in system error', false, error.message);
  }
  
  return null;
}

// Test 6: Review Request System
async function testReviewSystem(companyId, technicianId) {
  console.log('\n⭐ Testing Review Request System...');
  
  if (!companyId || !technicianId) {
    logTest('Skipping review tests - missing prerequisites', false);
    return null;
  }

  try {
    const reviewRequestData = {
      customerName: 'Jane Doe',
      email: 'jane@example.com',
      phone: '555-5678',
      jobType: 'Plumbing Service',
      method: 'email',
      companyId: companyId,
      technicianId: technicianId
    };

    const response = await apiRequest('POST', '/api/review-requests', reviewRequestData, authCookies);
    
    if (response.ok) {
      const reviewRequest = await response.json();
      logTest('Review request creation successful', true);
      
      // Test retrieval
      const getResponse = await apiRequest('GET', '/api/review-requests', null, authCookies);
      const requests = await getResponse.json();
      logTest('Review requests retrieval', requests.length > 0);
      
      return reviewRequest;
    } else {
      logTest('Review request creation failed', false, await response.text());
    }
  } catch (error) {
    logTest('Review system error', false, error.message);
  }
  
  return null;
}

// Test 7: AI Content Generation
async function testAIGeneration() {
  console.log('\n🤖 Testing AI Content Generation...');
  
  try {
    const contentParams = {
      jobType: 'HVAC Repair',
      notes: 'Completed routine maintenance on residential HVAC system',
      location: 'Downtown area',
      technicianName: 'Mike Johnson'
    };

    // Test summary generation
    const summaryResponse = await apiRequest('POST', '/api/generate-summary', contentParams, authCookies);
    
    if (summaryResponse.ok) {
      const summary = await summaryResponse.json();
      logTest('AI summary generation successful', summary.summary && summary.summary.length > 0);
    } else {
      logTest('AI summary generation failed', false, await summaryResponse.text());
    }

    // Test blog post generation
    const blogResponse = await apiRequest('POST', '/api/generate-blog-post', contentParams, authCookies);
    
    if (blogResponse.ok) {
      const blog = await blogResponse.json();
      logTest('AI blog post generation successful', blog.title && blog.content && blog.title.length > 0);
    } else {
      logTest('AI blog post generation failed', false, await blogResponse.text());
    }
  } catch (error) {
    logTest('AI generation error', false, error.message);
  }
}

// Test 8: WordPress Integration
async function testWordPressIntegration(companyId) {
  console.log('\n📝 Testing WordPress Integration...');
  
  if (!companyId) {
    logTest('Skipping WordPress tests - no company created', false);
    return;
  }

  try {
    const wpConfig = {
      siteUrl: 'https://example.com',
      apiKey: 'test_key',
      secretKey: 'test_secret',
      useRestApi: true,
      postType: 'post',
      defaultCategory: 'HVAC Services',
      companyId: companyId
    };

    const response = await apiRequest('POST', '/api/wordpress-config', wpConfig, authCookies);
    
    if (response.ok) {
      const config = await response.json();
      logTest('WordPress configuration creation successful', true);
      
      // Test retrieval
      const getResponse = await apiRequest('GET', '/api/wordpress-config', null, authCookies);
      logTest('WordPress configuration retrieval', getResponse.ok);
    } else {
      logTest('WordPress configuration failed', false, await response.text());
    }
  } catch (error) {
    logTest('WordPress integration error', false, error.message);
  }
}

// Test 9: Sales Commission System
async function testSalesCommission(companyId, technicianId) {
  console.log('\n💰 Testing Sales Commission System...');
  
  if (!companyId || !technicianId) {
    logTest('Skipping sales tests - missing prerequisites', false);
    return;
  }

  try {
    const saleData = {
      technicianId: technicianId,
      companyId: companyId,
      customerName: 'Bob Wilson',
      serviceType: 'HVAC Installation',
      saleAmount: 2500.00,
      commissionRate: 0.10,
      saleDate: new Date().toISOString(),
      status: 'completed'
    };

    const response = await apiRequest('POST', '/api/sales', saleData, authCookies);
    
    if (response.ok) {
      const sale = await response.json();
      logTest('Sales record creation successful', true);
      
      // Test commission calculation
      const expectedCommission = saleData.saleAmount * saleData.commissionRate;
      logTest('Commission calculation correct', Math.abs(sale.commissionAmount - expectedCommission) < 0.01);
      
      // Test retrieval
      const getResponse = await apiRequest('GET', '/api/sales', null, authCookies);
      const sales = await getResponse.json();
      logTest('Sales records retrieval', sales.length > 0);
    } else {
      logTest('Sales record creation failed', false, await response.text());
    }
  } catch (error) {
    logTest('Sales commission error', false, error.message);
  }
}

// Test 10: Testimonial System
async function testTestimonialSystem(companyId, technicianId) {
  console.log('\n🎥 Testing Testimonial System...');
  
  if (!companyId || !technicianId) {
    logTest('Skipping testimonial tests - missing prerequisites', false);
    return;
  }

  try {
    // Test testimonial data structure (without actual file upload)
    const testimonialData = {
      customerName: 'Sarah Johnson',
      customerEmail: 'sarah@example.com',
      customerPhone: '555-9999',
      jobType: 'Electrical Work',
      location: '456 Oak Ave, Springfield, ST 67890',
      type: 'video',
      duration: 45,
      companyId: companyId,
      technicianId: technicianId
    };

    // Test API endpoint structure
    const response = await apiRequest('GET', '/api/testimonials', null, authCookies);
    logTest('Testimonials endpoint accessible', response.status !== 404);
    
    if (response.ok) {
      const testimonials = await response.json();
      logTest('Testimonials retrieval successful', Array.isArray(testimonials));
    }
  } catch (error) {
    logTest('Testimonial system error', false, error.message);
  }
}

// Test 11: Database Health
async function testDatabaseHealth() {
  console.log('\n🗄️ Testing Database Health...');
  
  try {
    // Test basic database connectivity through API
    const response = await apiRequest('GET', '/api/companies', null, authCookies);
    logTest('Database connectivity', response.ok);
    
    // Test data persistence
    const companies = await response.json();
    logTest('Data persistence verified', Array.isArray(companies));
  } catch (error) {
    logTest('Database health error', false, error.message);
  }
}

// Test 12: Security & Authorization
async function testSecurity() {
  console.log('\n🔒 Testing Security & Authorization...');
  
  try {
    // Test unauthorized access
    const unauthorizedResponse = await apiRequest('GET', '/api/companies');
    logTest('Unauthorized access properly blocked', unauthorizedResponse.status === 401);
    
    // Test invalid credentials
    const invalidLoginResponse = await apiRequest('POST', '/api/auth/login', {
      email: 'invalid@example.com',
      password: 'wrongpassword'
    });
    logTest('Invalid credentials rejected', !invalidLoginResponse.ok);
  } catch (error) {
    logTest('Security testing error', false, error.message);
  }
}

// Test 13: PWA & Service Worker
async function testPWAFeatures() {
  console.log('\n📱 Testing PWA Features...');
  
  try {
    // Test manifest file
    const manifestResponse = await fetch(`${BASE_URL}/manifest.json`);
    logTest('PWA manifest accessible', manifestResponse.ok);
    
    if (manifestResponse.ok) {
      const manifest = await manifestResponse.json();
      logTest('Manifest has required PWA fields', 
        manifest.name && manifest.short_name && manifest.start_url);
    }
    
    // Test service worker
    const swResponse = await fetch(`${BASE_URL}/sw.js`);
    logTest('Service worker file accessible', swResponse.ok);
  } catch (error) {
    logTest('PWA testing error', false, error.message);
  }
}

// Main test execution
async function runAllTests() {
  console.log('🚀 Starting Comprehensive System Test Suite...\n');
  
  // Core system tests
  const authSuccess = await testAuthentication();
  if (!authSuccess) {
    console.log('❌ Authentication failed - stopping tests');
    return;
  }
  
  const companyId = await testCompanyManagement();
  const users = await testUserManagement(companyId);
  const technicianId = users?.technician?.id;
  
  // Feature tests
  await testJobTypes(companyId);
  await testCheckInSystem(companyId, technicianId);
  await testReviewSystem(companyId, technicianId);
  await testAIGeneration();
  await testWordPressIntegration(companyId);
  await testSalesCommission(companyId, technicianId);
  await testTestimonialSystem(companyId, technicianId);
  
  // System health tests
  await testDatabaseHealth();
  await testSecurity();
  await testPWAFeatures();
  
  // Final report
  console.log('\n📊 TEST RESULTS SUMMARY');
  console.log('=' .repeat(50));
  console.log(`✅ Passed: ${testResults.passed}`);
  console.log(`❌ Failed: ${testResults.failed}`);
  console.log(`📈 Success Rate: ${Math.round((testResults.passed / (testResults.passed + testResults.failed)) * 100)}%`);
  
  if (testResults.failed > 0) {
    console.log('\n🔍 Failed Tests:');
    testResults.tests.filter(t => !t.passed).forEach(test => {
      console.log(`   • ${test.description}: ${test.error || 'Unknown error'}`);
    });
  }
  
  console.log('\n🎉 Comprehensive testing completed!');
}

// Execute tests
runAllTests().catch(console.error);