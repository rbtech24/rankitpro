#!/usr/bin/env node

/**
 * Trial System Testing Script
 * Comprehensive testing of trial expiration functionality
 */

const readline = require('readline');

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

// Configuration
const BASE_URL = 'http://localhost:3000';
const TEST_COMPANIES = [
  { id: 29, name: 'Mr Sprinkler Repair' },
  { id: 28, name: 'Pool Allstars' },
  { id: 16, name: 'Carrollton Sprinkler Repair' }
];

// Helper function to make API requests
async function makeRequest(url, options = {}) {
  try {
    const response = await fetch(url, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        ...options.headers
      }
    });
    
    const data = await response.json();
    return { status: response.status, data };
  } catch (error) {
    return { status: 0, error: error.message };
  }
}

// Display menu
function showMenu() {
  console.log('\n🧪 TRIAL SYSTEM TESTING MENU');
  console.log('═══════════════════════════════');
  console.log('1. View all companies with trial status');
  console.log('2. Expire a company\'s trial (test blocking)');
  console.log('3. Set trial to expire in X days');
  console.log('4. Restore 14-day trial');
  console.log('5. Test API blocking with expired trial');
  console.log('6. Run complete trial workflow test');
  console.log('7. SQL commands for manual testing');
  console.log('0. Exit');
  console.log('═══════════════════════════════');
}

// 1. View all companies
async function viewCompanies() {
  console.log('\n📊 Fetching company trial information...');
  
  const result = await makeRequest(`${BASE_URL}/api/test/trial/companies`);
  
  if (result.status === 200) {
    const { companies, totalCompanies, activeTrials, expiredTrials, paidSubscriptions } = result.data;
    
    console.log(`\n📈 TRIAL OVERVIEW`);
    console.log(`Total Companies: ${totalCompanies}`);
    console.log(`Active Trials: ${activeTrials}`);
    console.log(`Expired Trials: ${expiredTrials}`);
    console.log(`Paid Subscriptions: ${paidSubscriptions}`);
    
    console.log('\n📋 COMPANY DETAILS:');
    companies.forEach(company => {
      const status = company.hasSubscription ? '💳 PAID' : 
                    company.expired ? '❌ EXPIRED' : 
                    company.daysLeft <= 3 ? '⚠️ EXPIRING' : '✅ ACTIVE';
      
      console.log(`${status} ${company.name} (ID: ${company.id})`);
      console.log(`   Plan: ${company.plan} | Days Left: ${company.daysLeft} | Trial End: ${company.trialEndDate || 'N/A'}`);
    });
  } else {
    console.log('❌ Failed to fetch companies:', result.data?.message || result.error);
  }
}

// 2. Expire trial
async function expireTrial() {
  console.log('\n⏰ EXPIRE TRIAL TEST');
  console.log('Available companies:');
  TEST_COMPANIES.forEach(company => {
    console.log(`${company.id}. ${company.name}`);
  });
  
  return new Promise((resolve) => {
    rl.question('\nEnter company ID to expire trial: ', async (companyId) => {
      const id = parseInt(companyId);
      if (isNaN(id)) {
        console.log('❌ Invalid company ID');
        resolve();
        return;
      }
      
      console.log(`\n🔄 Expiring trial for company ${id}...`);
      const result = await makeRequest(`${BASE_URL}/api/test/trial/expire/${id}`, {
        method: 'POST'
      });
      
      if (result.status === 200) {
        console.log('✅ Trial expired successfully!');
        console.log(`Company: ${result.data.message}`);
        console.log(`Trial End Date: ${result.data.trialEndDate}`);
        console.log('\n🧪 Now test accessing the application with this company\'s account');
        console.log('   Expected: 403 errors and "trial expired" messages');
      } else {
        console.log('❌ Failed to expire trial:', result.data?.message || result.error);
      }
      resolve();
    });
  });
}

// 3. Set trial days
async function setTrialDays() {
  console.log('\n📅 SET TRIAL EXPIRATION');
  
  return new Promise((resolve) => {
    rl.question('Enter company ID: ', (companyId) => {
      rl.question('Enter days until expiration (0 = expire now, negative = already expired): ', async (days) => {
        const id = parseInt(companyId);
        const dayCount = parseInt(days);
        
        if (isNaN(id) || isNaN(dayCount)) {
          console.log('❌ Invalid input');
          resolve();
          return;
        }
        
        console.log(`\n🔄 Setting trial to expire in ${dayCount} days...`);
        const result = await makeRequest(`${BASE_URL}/api/test/trial/set-days/${id}/${dayCount}`, {
          method: 'POST'
        });
        
        if (result.status === 200) {
          console.log('✅ Trial updated successfully!');
          console.log(`Company: ${result.data.companyName}`);
          console.log(`Days Left: ${result.data.daysLeft}`);
          console.log(`Trial End: ${result.data.trialEndDate}`);
          console.log(`Status: ${result.data.isActive ? 'Active' : 'Expired'}`);
        } else {
          console.log('❌ Failed to set trial days:', result.data?.message || result.error);
        }
        resolve();
      });
    });
  });
}

// 4. Restore trial
async function restoreTrial() {
  console.log('\n🔄 RESTORE TRIAL');
  
  return new Promise((resolve) => {
    rl.question('Enter company ID to restore trial: ', async (companyId) => {
      const id = parseInt(companyId);
      if (isNaN(id)) {
        console.log('❌ Invalid company ID');
        resolve();
        return;
      }
      
      console.log(`\n🔄 Restoring 14-day trial for company ${id}...`);
      const result = await makeRequest(`${BASE_URL}/api/test/trial/restore/${id}`, {
        method: 'POST'
      });
      
      if (result.status === 200) {
        console.log('✅ Trial restored successfully!');
        console.log(`Company: ${result.data.message}`);
        console.log(`Days Left: ${result.data.daysLeft}`);
        console.log(`Trial End: ${result.data.trialEndDate}`);
      } else {
        console.log('❌ Failed to restore trial:', result.data?.message || result.error);
      }
      resolve();
    });
  });
}

// 5. Test API blocking
async function testAPIBlocking() {
  console.log('\n🚫 API BLOCKING TEST');
  console.log('This test checks if expired trials are properly blocked');
  
  const testEndpoints = [
    '/api/check-ins',
    '/api/blog-posts',
    '/api/testimonials',
    '/api/review-requests'
  ];
  
  console.log('\n🔍 Testing protected endpoints...');
  
  for (const endpoint of testEndpoints) {
    const result = await makeRequest(`${BASE_URL}${endpoint}`);
    
    if (result.status === 403 && result.data?.error === 'trial_expired') {
      console.log(`✅ ${endpoint} - Properly blocked (403 trial_expired)`);
    } else if (result.status === 401) {
      console.log(`🔐 ${endpoint} - Authentication required (login first)`);
    } else if (result.status === 200) {
      console.log(`⚠️ ${endpoint} - Access allowed (trial may not be expired)`);
    } else {
      console.log(`❓ ${endpoint} - Status: ${result.status}, Response: ${JSON.stringify(result.data)}`);
    }
  }
  
  console.log('\n💡 To properly test, make sure you:');
  console.log('   1. Have expired a trial using option 2');
  console.log('   2. Are logged in as a user from that company');
  console.log('   3. Include session cookies in requests');
}

// 6. Complete workflow test
async function runCompleteTest() {
  console.log('\n🧪 COMPLETE TRIAL WORKFLOW TEST');
  console.log('This will test the entire trial expiration process');
  
  return new Promise((resolve) => {
    rl.question('Enter company ID for complete test: ', async (companyId) => {
      const id = parseInt(companyId);
      if (isNaN(id)) {
        console.log('❌ Invalid company ID');
        resolve();
        return;
      }
      
      console.log(`\n🔄 Running complete test for company ${id}...`);
      
      // Step 1: Check initial status
      console.log('Step 1: Checking initial trial status...');
      let result = await makeRequest(`${BASE_URL}/api/test/trial/status/${id}`);
      if (result.status === 200) {
        console.log(`✅ Initial status - Days left: ${result.data.daysLeft}, Expired: ${result.data.expired}`);
      }
      
      // Step 2: Set to expire in 1 day
      console.log('Step 2: Setting trial to expire in 1 day...');
      result = await makeRequest(`${BASE_URL}/api/test/trial/set-days/${id}/1`, { method: 'POST' });
      if (result.status === 200) {
        console.log('✅ Trial set to 1 day remaining');
      }
      
      // Step 3: Expire trial
      console.log('Step 3: Expiring trial now...');
      result = await makeRequest(`${BASE_URL}/api/test/trial/expire/${id}`, { method: 'POST' });
      if (result.status === 200) {
        console.log('✅ Trial expired');
      }
      
      // Step 4: Verify blocking
      console.log('Step 4: Testing API blocking...');
      result = await makeRequest(`${BASE_URL}/api/check-ins`);
      if (result.status === 403) {
        console.log('✅ API properly blocked');
      } else {
        console.log(`⚠️ API response: ${result.status}`);
      }
      
      // Step 5: Restore trial
      console.log('Step 5: Restoring trial...');
      result = await makeRequest(`${BASE_URL}/api/test/trial/restore/${id}`, { method: 'POST' });
      if (result.status === 200) {
        console.log('✅ Trial restored');
      }
      
      console.log('\n🎉 Complete test finished!');
      resolve();
    });
  });
}

// 7. Show SQL commands
function showSQLCommands() {
  console.log('\n📊 SQL COMMANDS FOR MANUAL TESTING');
  console.log('═══════════════════════════════════');
  
  console.log('\n-- View all companies with trial status');
  console.log(`SELECT 
  id, name, is_trial_active, trial_end_date,
  CASE 
    WHEN trial_end_date < NOW() THEN 'EXPIRED'
    WHEN trial_end_date IS NULL THEN 'NO_TRIAL'
    ELSE 'ACTIVE'
  END as status,
  EXTRACT(DAY FROM (trial_end_date - NOW())) as days_left
FROM companies 
ORDER BY trial_end_date DESC;`);

  console.log('\n-- Expire trial for company ID 29');
  console.log(`UPDATE companies 
SET trial_end_date = NOW() - INTERVAL '1 day',
    is_trial_active = false
WHERE id = 29;`);

  console.log('\n-- Restore 14-day trial for company ID 29');
  console.log(`UPDATE companies 
SET trial_end_date = NOW() + INTERVAL '14 days',
    is_trial_active = true
WHERE id = 29;`);

  console.log('\n-- Check specific company trial status');
  console.log(`SELECT 
  id, name, plan, is_trial_active, trial_end_date,
  stripe_subscription_id IS NOT NULL as has_subscription,
  CASE 
    WHEN stripe_subscription_id IS NOT NULL THEN 'PAID_SUBSCRIPTION'
    WHEN trial_end_date < NOW() THEN 'TRIAL_EXPIRED'
    WHEN trial_end_date IS NULL THEN 'NO_TRIAL'
    ELSE 'TRIAL_ACTIVE'
  END as account_status
FROM companies 
WHERE id = 29;`);
}

// Main menu loop
async function main() {
  console.log('🚀 Trial System Testing Tool');
  console.log('Testing server at:', BASE_URL);
  
  while (true) {
    showMenu();
    
    const choice = await new Promise((resolve) => {
      rl.question('\nSelect option (0-7): ', resolve);
    });
    
    switch (choice) {
      case '1':
        await viewCompanies();
        break;
      case '2':
        await expireTrial();
        break;
      case '3':
        await setTrialDays();
        break;
      case '4':
        await restoreTrial();
        break;
      case '5':
        await testAPIBlocking();
        break;
      case '6':
        await runCompleteTest();
        break;
      case '7':
        showSQLCommands();
        break;
      case '0':
        console.log('\n👋 Goodbye!');
        rl.close();
        return;
      default:
        console.log('❌ Invalid option');
    }
    
    // Wait for user before showing menu again
    await new Promise((resolve) => {
      rl.question('\nPress Enter to continue...', resolve);
    });
  }
}

// Check if fetch is available (Node 18+)
if (typeof fetch === 'undefined') {
  console.log('❌ This script requires Node.js 18+ or install node-fetch');
  process.exit(1);
}

// Run the main function
main().catch(console.error);