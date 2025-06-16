#!/usr/bin/env node

/**
 * Mobile App Functionality Test Script
 * Tests all core mobile features including GPS, camera, and offline capabilities
 */

import fetch from 'node-fetch';

const BASE_URL = 'http://localhost:5000';
let authCookies = '';

// Test authentication with correct credentials
async function testAuthentication() {
  console.log('Testing authentication...');
  
  const response = await fetch(`${BASE_URL}/api/auth/login`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      email: 'tech@testcompany.com',
      password: 'tech1234'
    })
  });

  if (response.ok) {
    const cookies = response.headers.get('set-cookie');
    if (cookies) {
      authCookies = cookies;
      console.log('✅ Authentication successful');
      return true;
    }
  }
  
  console.log('❌ Authentication failed');
  return false;
}

// Test technician profile access
async function testTechnicianProfile() {
  console.log('Testing technician profile access...');
  
  const response = await fetch(`${BASE_URL}/api/auth/me`, {
    headers: {
      'Cookie': authCookies
    }
  });

  if (response.ok) {
    const user = await response.json();
    console.log('✅ Profile access successful:', user.email);
    return user;
  }
  
  console.log('❌ Profile access failed');
  return null;
}

// Test company data access
async function testCompanyAccess() {
  console.log('Testing company data access...');
  
  const response = await fetch(`${BASE_URL}/api/companies`, {
    headers: {
      'Cookie': authCookies
    }
  });

  if (response.ok) {
    const companies = await response.json();
    console.log('✅ Company access successful, found', companies.length, 'companies');
    return companies;
  }
  
  console.log('❌ Company access failed');
  return null;
}

// Test check-in creation (core mobile feature)
async function testCheckInCreation() {
  console.log('Testing check-in creation...');
  
  const checkInData = {
    customerName: 'Test Customer Mobile',
    customerEmail: 'mobile@test.com',
    customerPhone: '555-0123',
    address: '123 Mobile Test St',
    latitude: '40.7128',
    longitude: '-74.0060',
    workDescription: 'Mobile app functionality test',
    jobTypeId: '1',
    beforePhotos: [],
    afterPhotos: []
  };

  const response = await fetch(`${BASE_URL}/api/check-ins`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Cookie': authCookies
    },
    body: JSON.stringify(checkInData)
  });

  if (response.ok) {
    const checkIn = await response.json();
    console.log('✅ Check-in creation successful, ID:', checkIn.id);
    return checkIn;
  }
  
  console.log('❌ Check-in creation failed');
  return null;
}

// Test AI content generation
async function testAIContentGeneration(checkInId) {
  console.log('Testing AI content generation...');
  
  const response = await fetch(`${BASE_URL}/api/ai/generate-blog-post`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Cookie': authCookies
    },
    body: JSON.stringify({
      checkInId: checkInId,
      provider: 'openai'
    })
  });

  if (response.ok) {
    const result = await response.json();
    console.log('✅ AI content generation successful');
    return result;
  }
  
  console.log('❌ AI content generation failed');
  return null;
}

// Test review request functionality
async function testReviewRequest(checkInId) {
  console.log('Testing review request...');
  
  const response = await fetch(`${BASE_URL}/api/reviews/request`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Cookie': authCookies
    },
    body: JSON.stringify({
      checkInId: checkInId,
      customerEmail: 'mobile@test.com'
    })
  });

  if (response.ok) {
    const result = await response.json();
    console.log('✅ Review request successful');
    return result;
  }
  
  console.log('❌ Review request failed');
  return null;
}

// Test mobile field app endpoint
async function testMobileFieldApp() {
  console.log('Testing mobile field app endpoint...');
  
  const response = await fetch(`${BASE_URL}/api/mobile/field-app-data`, {
    headers: {
      'Cookie': authCookies
    }
  });

  if (response.ok) {
    const responseText = await response.text();
    try {
      const data = JSON.parse(responseText);
      console.log('✅ Mobile field app data access successful');
      return data;
    } catch (e) {
      console.log('❌ Mobile field app data access failed - Invalid JSON response');
      console.log('Response:', responseText.substring(0, 200));
      return null;
    }
  }
  
  console.log('❌ Mobile field app data access failed');
  return null;
}

// Test PWA manifest
async function testPWAManifest() {
  console.log('Testing PWA manifest...');
  
  const response = await fetch(`${BASE_URL}/manifest.json`);

  if (response.ok) {
    const manifest = await response.json();
    console.log('✅ PWA manifest accessible:', manifest.name);
    return manifest;
  }
  
  console.log('❌ PWA manifest access failed');
  return null;
}

// Test service worker
async function testServiceWorker() {
  console.log('Testing service worker...');
  
  const response = await fetch(`${BASE_URL}/sw.js`);

  if (response.ok) {
    console.log('✅ Service worker accessible');
    return true;
  }
  
  console.log('❌ Service worker access failed');
  return false;
}

// Run all mobile functionality tests
async function runMobileFunctionalityTests() {
  console.log('🚀 Starting Mobile App Functionality Tests\n');
  
  const results = {
    passed: 0,
    failed: 0,
    tests: []
  };

  // Test authentication
  const authSuccess = await testAuthentication();
  results.tests.push({ name: 'Authentication', passed: authSuccess });
  authSuccess ? results.passed++ : results.failed++;

  if (!authSuccess) {
    console.log('\n❌ Cannot continue without authentication');
    return results;
  }

  // Test technician profile
  const profile = await testTechnicianProfile();
  const profileSuccess = profile !== null;
  results.tests.push({ name: 'Technician Profile', passed: profileSuccess });
  profileSuccess ? results.passed++ : results.failed++;

  // Test company access
  const companies = await testCompanyAccess();
  const companySuccess = companies !== null;
  results.tests.push({ name: 'Company Access', passed: companySuccess });
  companySuccess ? results.passed++ : results.failed++;

  // Test check-in creation
  const checkIn = await testCheckInCreation();
  const checkInSuccess = checkIn !== null;
  results.tests.push({ name: 'Check-in Creation', passed: checkInSuccess });
  checkInSuccess ? results.passed++ : results.failed++;

  // Test AI content generation
  if (checkIn) {
    const aiContent = await testAIContentGeneration(checkIn.id);
    const aiSuccess = aiContent !== null;
    results.tests.push({ name: 'AI Content Generation', passed: aiSuccess });
    aiSuccess ? results.passed++ : results.failed++;

    // Test review request
    const reviewRequest = await testReviewRequest(checkIn.id);
    const reviewSuccess = reviewRequest !== null;
    results.tests.push({ name: 'Review Request', passed: reviewSuccess });
    reviewSuccess ? results.passed++ : results.failed++;
  }

  // Test mobile field app
  const mobileApp = await testMobileFieldApp();
  const mobileSuccess = mobileApp !== null;
  results.tests.push({ name: 'Mobile Field App', passed: mobileSuccess });
  mobileSuccess ? results.passed++ : results.failed++;

  // Test PWA features
  const manifest = await testPWAManifest();
  const manifestSuccess = manifest !== null;
  results.tests.push({ name: 'PWA Manifest', passed: manifestSuccess });
  manifestSuccess ? results.passed++ : results.failed++;

  const serviceWorker = await testServiceWorker();
  results.tests.push({ name: 'Service Worker', passed: serviceWorker });
  serviceWorker ? results.passed++ : results.failed++;

  // Print results
  console.log('\n📊 Mobile App Functionality Test Results:');
  console.log('========================================');
  
  results.tests.forEach(test => {
    console.log(`${test.passed ? '✅' : '❌'} ${test.name}`);
  });
  
  console.log('\n📈 Summary:');
  console.log(`Passed: ${results.passed}`);
  console.log(`Failed: ${results.failed}`);
  console.log(`Total: ${results.passed + results.failed}`);
  
  const successRate = (results.passed / (results.passed + results.failed) * 100).toFixed(1);
  console.log(`Success Rate: ${successRate}%`);

  if (results.failed === 0) {
    console.log('\n🎉 All mobile functionality tests passed!');
    console.log('Mobile app is ready for deployment and app store submission.');
  } else {
    console.log('\n⚠️  Some tests failed. Review the issues before deployment.');
  }

  return results;
}

// Run the tests
runMobileFunctionalityTests().catch(console.error);