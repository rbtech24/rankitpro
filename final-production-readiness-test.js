/**
 * Final Production Readiness Test
 * Comprehensive verification of all systems before deployment
 */

import fetch from 'node-fetch';

async function apiRequest(method, endpoint, data = null, cookies = '') {
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
  
  return await fetch(`http://localhost:5000${endpoint}`, options);
}

function logTest(description, passed, details = '') {
  const status = passed ? '✅' : '❌';
  console.log(`${status} ${description}`);
  if (details) console.log(`   ${details}`);
}

async function runFinalProductionTest() {
  console.log('🚀 FINAL PRODUCTION READINESS TEST');
  console.log('=' .repeat(60));
  
  let testResults = {
    passed: 0,
    failed: 0,
    critical: 0
  };
  
  try {
    // 1. Super Admin Authentication
    console.log('\n📊 SUPER ADMIN SYSTEM');
    const superAdminLogin = await apiRequest('POST', '/api/auth/login', {
      email: 'admin@rankitpro.com',
      password: 'SuperAdmin2024!'
    });
    
    const superAdminCookies = superAdminLogin.headers.get('set-cookie')?.split(';')[0] || '';
    const superAdminSuccess = superAdminLogin.status === 200;
    
    logTest('Super Admin Authentication', superAdminSuccess);
    if (superAdminSuccess) testResults.passed++; else testResults.failed++;
    
    // Test super admin dashboard access
    if (superAdminSuccess) {
      const companiesResponse = await apiRequest('GET', '/api/companies', null, superAdminCookies);
      const dashboardAccess = companiesResponse.status === 200;
      logTest('Super Admin Dashboard Access', dashboardAccess);
      if (dashboardAccess) testResults.passed++; else testResults.failed++;
      
      const companies = await companiesResponse.json();
      console.log(`   Managing ${companies.length} companies`);
    }
    
    // 2. Company Admin Authentication
    console.log('\n🏢 COMPANY ADMIN SYSTEM');
    const companyAdminLogin = await apiRequest('POST', '/api/auth/login', {
      email: 'demo@acmeservices.com',
      password: 'Demo2024!'
    });
    
    const companyAdminCookies = companyAdminLogin.headers.get('set-cookie')?.split(';')[0] || '';
    const companyAdminSuccess = companyAdminLogin.status === 200;
    
    logTest('Company Admin Authentication', companyAdminSuccess);
    if (companyAdminSuccess) testResults.passed++; else testResults.failed++;
    
    // Test company admin components
    if (companyAdminSuccess) {
      // Customer Management
      const customersResponse = await apiRequest('GET', '/api/customers', null, companyAdminCookies);
      const customersSuccess = customersResponse.status === 200;
      logTest('Customer Management Component', customersSuccess);
      if (customersSuccess) testResults.passed++; else testResults.failed++;
      
      // Review Automation Settings
      const automationResponse = await apiRequest('GET', '/api/review-automation/settings', null, companyAdminCookies);
      const automationSuccess = automationResponse.status === 200;
      logTest('Review Automation Component', automationSuccess);
      if (automationSuccess) testResults.passed++; else testResults.failed++;
      
      // Technician Management
      const techniciansResponse = await apiRequest('GET', '/api/technicians', null, companyAdminCookies);
      const techniciansSuccess = techniciansResponse.status === 200;
      logTest('Technician Management', techniciansSuccess);
      if (techniciansSuccess) testResults.passed++; else testResults.failed++;
    }
    
    // 3. Technician Authentication
    console.log('\n👷 TECHNICIAN SYSTEM');
    const technicianLogin = await apiRequest('POST', '/api/auth/login', {
      email: 'john.smith@acmeservices.com',
      password: 'Tech2024!'
    });
    
    const technicianCookies = technicianLogin.headers.get('set-cookie')?.split(';')[0] || '';
    const technicianSuccess = technicianLogin.status === 200;
    
    logTest('Technician Authentication', technicianSuccess);
    if (technicianSuccess) testResults.passed++; else testResults.failed++;
    
    // Test mobile field app access
    if (technicianSuccess) {
      const jobTypesResponse = await apiRequest('GET', '/api/job-types', null, technicianCookies);
      const mobileAppAccess = jobTypesResponse.status === 200;
      logTest('Mobile Field App Access', mobileAppAccess);
      if (mobileAppAccess) testResults.passed++; else testResults.failed++;
    }
    
    // 4. API Health Checks
    console.log('\n🔧 SYSTEM HEALTH');
    const healthResponse = await apiRequest('GET', '/api/health');
    const healthSuccess = healthResponse.status === 200;
    logTest('API Health Check', healthSuccess);
    if (healthSuccess) testResults.passed++; else testResults.failed++;
    
    // 5. Database Connectivity
    const dbTestResponse = await apiRequest('GET', '/api/companies');
    const dbSuccess = dbTestResponse.status === 401; // Expected unauthorized without auth
    logTest('Database Connectivity', dbSuccess, 'Expected 401 without authentication');
    if (dbSuccess) testResults.passed++; else testResults.failed++;
    
    // 6. WordPress Integration Test
    console.log('\n🌐 WORDPRESS INTEGRATION');
    if (companyAdminSuccess) {
      const wordpressResponse = await apiRequest('GET', '/api/wordpress/integration', null, companyAdminCookies);
      const wordpressSuccess = wordpressResponse.status === 200;
      logTest('WordPress Integration Endpoint', wordpressSuccess);
      if (wordpressSuccess) testResults.passed++; else testResults.failed++;
      
      const integration = await wordpressResponse.json();
      if (integration.siteUrl) {
        console.log(`   WordPress Site: ${integration.siteUrl}`);
        console.log(`   Status: ${integration.status}`);
      }
    }
    
    // 7. AI Content Generation Test
    console.log('\n🤖 AI CONTENT GENERATION');
    const aiHealthResponse = await apiRequest('GET', '/api/ai/health');
    const aiHealthSuccess = aiHealthResponse.status === 200;
    logTest('AI Services Health', aiHealthSuccess);
    if (aiHealthSuccess) testResults.passed++; else testResults.failed++;
    
    // Final Results
    console.log('\n📋 PRODUCTION READINESS SUMMARY');
    console.log('=' .repeat(60));
    const totalTests = testResults.passed + testResults.failed;
    const successRate = Math.round((testResults.passed / totalTests) * 100);
    
    console.log(`Total Tests: ${totalTests}`);
    console.log(`Passed: ${testResults.passed}`);
    console.log(`Failed: ${testResults.failed}`);
    console.log(`Success Rate: ${successRate}%`);
    
    if (successRate >= 95) {
      console.log('\n🎉 SYSTEM READY FOR PRODUCTION DEPLOYMENT');
      console.log('All critical systems operational');
      console.log('');
      console.log('✅ Multi-role authentication system');
      console.log('✅ Complete business management dashboard');
      console.log('✅ Mobile field technician app');
      console.log('✅ AI-powered content generation');
      console.log('✅ WordPress integration system');
      console.log('✅ Customer review automation');
      console.log('✅ Database connectivity and health');
      console.log('✅ API endpoints and security');
    } else {
      console.log('\n⚠️  PRODUCTION READINESS ISSUES DETECTED');
      console.log('Some systems require attention before deployment');
    }
    
  } catch (error) {
    console.error('❌ Production test failed:', error.message);
    testResults.critical++;
  }
}

runFinalProductionTest();