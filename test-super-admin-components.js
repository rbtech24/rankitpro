/**
 * Super Admin Components Comprehensive Test
 * Tests all super admin dashboard components and functionality
 */

import fs from 'fs';

async function apiRequest(method, endpoint, data = null, cookies = '') {
  const fetch = (await import('node-fetch')).default;
  
  const options = {
    method,
    headers: {
      'Content-Type': 'application/json',
      'Cookie': cookies
    },
  };
  
  if (data && (method === 'POST' || method === 'PUT' || method === 'PATCH')) {
    options.body = JSON.stringify(data);
  }
  
  const response = await fetch(`http://localhost:5000${endpoint}`, options);
  const result = await response.text();
  
  try {
    return {
      status: response.status,
      data: JSON.parse(result),
      headers: response.headers
    };
  } catch {
    return {
      status: response.status,
      data: result,
      headers: response.headers
    };
  }
}

function logTest(description, passed, details = '') {
  const status = passed ? '✅ PASS' : '❌ FAIL';
  console.log(`${status} - ${description}`);
  if (details) console.log(`   ${details}`);
}

async function testSuperAdminComponents() {
  console.log('\n🔐 SUPER ADMIN COMPONENTS - COMPREHENSIVE TEST');
  console.log('=' .repeat(70));
  
  let testResults = {
    authentication: false,
    companiesManagement: false,
    financialDashboard: false,
    systemStats: false,
    systemHealth: false,
    chartData: false,
    recentActivity: false,
    userManagement: false,
    billingOverview: false,
    subscriptionPlans: false,
    paymentTransactions: false,
    aiUsageTracking: false,
    supportTickets: false,
    databaseHealth: false,
    systemConfiguration: false
  };

  try {
    // 1. Super Admin Authentication
    console.log('\n1. Testing Super Admin Authentication...');
    const loginResponse = await apiRequest('POST', '/api/auth/login', {
      email: 'admin@rankitpro.com',
      password: 'Admin2024!'
    });
    
    if (loginResponse.status === 200 && loginResponse.data.role === 'super_admin') {
      logTest('Super admin authentication successful', true, `User: ${loginResponse.data.email}`);
      testResults.authentication = true;
      
      const setCookieHeader = loginResponse.headers.get('set-cookie');
      const sessionCookie = setCookieHeader ? setCookieHeader.split(';')[0] : '';
      
      // 2. Companies Management
      console.log('\n2. Testing Companies Management...');
      const companiesResponse = await apiRequest('GET', '/api/admin/companies', null, sessionCookie);
      
      if (companiesResponse.status === 200) {
        const companies = companiesResponse.data;
        logTest('Companies data retrieved', true, `Found ${companies.length} companies`);
        testResults.companiesManagement = true;
        
        // Display company summary
        companies.forEach((company, index) => {
          if (index < 5) { // Show first 5 companies
            console.log(`   Company ${index + 1}: ${company.name} (ID: ${company.id}) - Plan: ${company.plan || 'None'}`);
          }
        });
        if (companies.length > 5) {
          console.log(`   ... and ${companies.length - 5} more companies`);
        }
      }
      
      // 3. Financial Dashboard
      console.log('\n3. Testing Financial Dashboard...');
      const financialResponse = await apiRequest('GET', '/api/admin/financial-overview', null, sessionCookie);
      
      if (financialResponse.status === 200) {
        const financial = financialResponse.data;
        logTest('Financial data retrieved', true, `MRR: $${financial.monthlyRecurringRevenue || 0}`);
        testResults.financialDashboard = true;
        
        console.log(`   Monthly Recurring Revenue: $${financial.monthlyRecurringRevenue || 0}`);
        console.log(`   Total Revenue: $${financial.totalRevenue || 0}`);
        console.log(`   Active Subscriptions: ${financial.activeSubscriptions || 0}`);
        console.log(`   Churn Rate: ${financial.churnRate || 0}%`);
      }
      
      // 4. System Statistics
      console.log('\n4. Testing System Statistics...');
      const statsResponse = await apiRequest('GET', '/api/admin/system-stats', null, sessionCookie);
      
      if (statsResponse.status === 200) {
        const stats = statsResponse.data;
        logTest('System statistics retrieved', true, `Total users: ${stats.totalUsers || 0}`);
        testResults.systemStats = true;
        
        console.log(`   Total Users: ${stats.totalUsers || 0}`);
        console.log(`   Active Companies: ${stats.activeCompanies || 0}`);
        console.log(`   Check-ins Today: ${stats.checkInsToday || 0}`);
        console.log(`   AI Usage Today: ${stats.aiUsageToday || 0}`);
      } else {
        logTest('System statistics failed', false, `Status: ${statsResponse.status}`);
      }
      
      // 5. System Health
      console.log('\n5. Testing System Health...');
      const healthResponse = await apiRequest('GET', '/api/admin/system-health', null, sessionCookie);
      
      if (healthResponse.status === 200) {
        const health = healthResponse.data;
        logTest('System health check successful', true, `Status: ${health.status}`);
        testResults.systemHealth = true;
        
        console.log(`   System Status: ${health.status}`);
        console.log(`   Uptime: ${health.uptime}`);
        console.log(`   Database: ${health.database}`);
        console.log(`   Memory Usage: ${health.memoryUsage}`);
      }
      
      // 6. Chart Data
      console.log('\n6. Testing Chart Data...');
      const chartResponse = await apiRequest('GET', '/api/admin/chart-data', null, sessionCookie);
      
      if (chartResponse.status === 200) {
        const charts = chartResponse.data;
        logTest('Chart data retrieved', true, `Check-ins: ${charts.checkIns?.length || 0} data points`);
        testResults.chartData = true;
        
        console.log(`   Check-ins Data Points: ${charts.checkIns?.length || 0}`);
        console.log(`   Revenue Data Points: ${charts.revenue?.length || 0}`);
        console.log(`   User Growth Points: ${charts.userGrowth?.length || 0}`);
      }
      
      // 7. Recent Activity
      console.log('\n7. Testing Recent Activity...');
      const activityResponse = await apiRequest('GET', '/api/admin/recent-activity', null, sessionCookie);
      
      if (activityResponse.status === 200) {
        const activities = activityResponse.data;
        logTest('Recent activity retrieved', true, `Found ${activities.length} activities`);
        testResults.recentActivity = true;
        
        activities.slice(0, 3).forEach((activity, index) => {
          console.log(`   Activity ${index + 1}: ${activity.action} - ${activity.timestamp}`);
        });
      }
      
      // 8. User Management
      console.log('\n8. Testing User Management...');
      const usersResponse = await apiRequest('GET', '/api/admin/users', null, sessionCookie);
      
      if (usersResponse.status === 200) {
        const users = usersResponse.data;
        logTest('User management data retrieved', true, `Found ${users.length} users`);
        testResults.userManagement = true;
        
        // Count by role
        const roleCount = users.reduce((acc, user) => {
          acc[user.role] = (acc[user.role] || 0) + 1;
          return acc;
        }, {});
        
        Object.entries(roleCount).forEach(([role, count]) => {
          console.log(`   ${role}: ${count} users`);
        });
      }
      
      // 9. Billing Overview
      console.log('\n9. Testing Billing Overview...');
      const billingResponse = await apiRequest('GET', '/api/billing/plans', null, sessionCookie);
      
      if (billingResponse.status === 200) {
        const plans = billingResponse.data;
        logTest('Billing plans retrieved', true, `Found ${plans.length} subscription plans`);
        testResults.billingOverview = true;
        
        plans.forEach(plan => {
          console.log(`   Plan: ${plan.name} - $${plan.price}/${plan.interval}`);
        });
      }
      
      // 10. Subscription Plans Management
      console.log('\n10. Testing Subscription Plans...');
      const subscriptionsResponse = await apiRequest('GET', '/api/admin/subscriptions', null, sessionCookie);
      
      if (subscriptionsResponse.status === 200) {
        const subscriptions = subscriptionsResponse.data;
        logTest('Subscription data retrieved', true, `Found ${subscriptions.length} subscriptions`);
        testResults.subscriptionPlans = true;
      }
      
      // 11. Payment Transactions
      console.log('\n11. Testing Payment Transactions...');
      const transactionsResponse = await apiRequest('GET', '/api/admin/transactions', null, sessionCookie);
      
      if (transactionsResponse.status === 200) {
        const transactions = transactionsResponse.data;
        logTest('Transaction data retrieved', true, `Found ${transactions.length} transactions`);
        testResults.paymentTransactions = true;
      }
      
      // 12. AI Usage Tracking
      console.log('\n12. Testing AI Usage Tracking...');
      const aiUsageResponse = await apiRequest('GET', '/api/admin/ai-usage', null, sessionCookie);
      
      if (aiUsageResponse.status === 200) {
        const aiUsage = aiUsageResponse.data;
        logTest('AI usage data retrieved', true, `Found ${aiUsage.length} usage records`);
        testResults.aiUsageTracking = true;
      }
      
      // 13. Support Tickets
      console.log('\n13. Testing Support Tickets...');
      const supportResponse = await apiRequest('GET', '/api/admin/support-tickets', null, sessionCookie);
      
      if (supportResponse.status === 200) {
        const tickets = supportResponse.data;
        logTest('Support tickets retrieved', true, `Found ${tickets.length} tickets`);
        testResults.supportTickets = true;
      }
      
      // 14. Database Health Check
      console.log('\n14. Testing Database Health...');
      const dbHealthResponse = await apiRequest('GET', '/api/admin/database-health', null, sessionCookie);
      
      if (dbHealthResponse.status === 200) {
        const dbHealth = dbHealthResponse.data;
        logTest('Database health check successful', true, `Tables: ${dbHealth.tableCount || 'N/A'}`);
        testResults.databaseHealth = true;
      }
      
      // 15. System Configuration
      console.log('\n15. Testing System Configuration...');
      const configResponse = await apiRequest('GET', '/api/admin/system-config', null, sessionCookie);
      
      if (configResponse.status === 200) {
        const config = configResponse.data;
        logTest('System configuration retrieved', true, 'Configuration data available');
        testResults.systemConfiguration = true;
      }
      
    } else {
      logTest('Super admin authentication failed', false, `Status: ${loginResponse.status}`);
    }
    
  } catch (error) {
    logTest('Super admin test error', false, error.message);
  }
  
  // Generate Comprehensive Test Report
  console.log('\n📊 SUPER ADMIN COMPONENTS - TEST RESULTS SUMMARY');
  console.log('=' .repeat(70));
  
  const totalTests = Object.keys(testResults).length;
  const passedTests = Object.values(testResults).filter(result => result === true).length;
  const successRate = Math.round((passedTests / totalTests) * 100);
  
  console.log(`Overall Success Rate: ${successRate}% (${passedTests}/${totalTests})`);
  console.log('');
  
  // Categorized Results
  console.log('🔐 AUTHENTICATION & SECURITY:');
  logTest('Super Admin Authentication', testResults.authentication);
  
  console.log('\n🏢 COMPANY MANAGEMENT:');
  logTest('Companies Management', testResults.companiesManagement);
  logTest('User Management', testResults.userManagement);
  
  console.log('\n💰 FINANCIAL COMPONENTS:');
  logTest('Financial Dashboard', testResults.financialDashboard);
  logTest('Billing Overview', testResults.billingOverview);
  logTest('Subscription Plans', testResults.subscriptionPlans);
  logTest('Payment Transactions', testResults.paymentTransactions);
  
  console.log('\n📊 ANALYTICS & MONITORING:');
  logTest('System Statistics', testResults.systemStats);
  logTest('Chart Data', testResults.chartData);
  logTest('Recent Activity', testResults.recentActivity);
  logTest('AI Usage Tracking', testResults.aiUsageTracking);
  
  console.log('\n🔧 SYSTEM HEALTH:');
  logTest('System Health Check', testResults.systemHealth);
  logTest('Database Health', testResults.databaseHealth);
  logTest('System Configuration', testResults.systemConfiguration);
  
  console.log('\n🎫 SUPPORT SYSTEM:');
  logTest('Support Tickets', testResults.supportTickets);
  
  // Component Status Summary
  console.log('\n🎯 SUPER ADMIN DASHBOARD STATUS');
  console.log('=' .repeat(70));
  
  const workingComponents = Object.entries(testResults)
    .filter(([_, passed]) => passed)
    .map(([component, _]) => component.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase()));
  
  const failedComponents = Object.entries(testResults)
    .filter(([_, passed]) => !passed)
    .map(([component, _]) => component.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase()));
  
  console.log('✅ WORKING COMPONENTS:');
  workingComponents.forEach(component => console.log(`   • ${component}`));
  
  if (failedComponents.length > 0) {
    console.log('\n❌ FAILED COMPONENTS:');
    failedComponents.forEach(component => console.log(`   • ${component}`));
  }
  
  console.log('\n🚀 SUPER ADMIN SYSTEM SUMMARY');
  console.log('=' .repeat(70));
  console.log('The super admin dashboard provides comprehensive oversight of:');
  console.log('• Company management and user administration');
  console.log('• Financial tracking and subscription billing');
  console.log('• System monitoring and performance analytics');
  console.log('• AI usage tracking and resource management');
  console.log('• Support ticket management and customer service');
  console.log('• Database health and system configuration');
  
  return {
    success: successRate >= 80,
    results: testResults,
    successRate: successRate,
    workingComponents: workingComponents.length,
    failedComponents: failedComponents.length
  };
}

// Run the comprehensive test
testSuperAdminComponents()
  .then(results => {
    console.log(`\n🎉 SUPER ADMIN TEST COMPLETE: ${results.successRate}% SUCCESS`);
    console.log(`Working Components: ${results.workingComponents}`);
    console.log(`Failed Components: ${results.failedComponents}`);
    
    if (results.success) {
      console.log('\n✅ SUPER ADMIN DASHBOARD READY FOR PRODUCTION!');
    } else {
      console.log('\n⚠️  SUPER ADMIN DASHBOARD NEEDS ATTENTION');
    }
    
    process.exit(results.success ? 0 : 1);
  })
  .catch(error => {
    console.error('\n💥 SUPER ADMIN TEST FAILED:', error.message);
    process.exit(1);
  });