/**
 * Render Deployment Verification Script
 * Run this after deploying to verify your Render setup
 */

const fetch = require('node-fetch');

async function testRenderDeployment(renderUrl) {
  console.log(`Testing Render deployment at: ${renderUrl}`);
  console.log('='.repeat(50));

  const tests = [
    { name: 'Basic Health Check', endpoint: '/api/health' },
    { name: 'Database Connection', endpoint: '/api/health/database' },
    { name: 'Detailed System Status', endpoint: '/api/health/detailed' }
  ];

  for (const test of tests) {
    try {
      console.log(`\nTesting: ${test.name}`);
      const response = await fetch(`${renderUrl}${test.endpoint}`);
      const data = await response.json();

      if (response.ok) {
        console.log(`✅ ${test.name}: SUCCESS`);
        
        if (test.endpoint === '/api/health/detailed') {
          console.log(`   Database: ${data.features.database ? 'Connected' : 'Failed'}`);
          console.log(`   Email Service: ${data.features.email ? 'Enabled' : 'Disabled'}`);
          console.log(`   Payment Processing: ${data.features.payments ? 'Enabled' : 'Disabled'}`);
          console.log(`   AI Content Generation: ${data.features.ai ? 'Enabled' : 'Disabled'}`);
          
          if (data.warnings && data.warnings.length > 0) {
            console.log('   Warnings:');
            data.warnings.forEach(warning => console.log(`     - ${warning}`));
          }
          
          if (data.errors && data.errors.length > 0) {
            console.log('   Errors:');
            data.errors.forEach(error => console.log(`     - ${error}`));
          }
        }
      } else {
        console.log(`❌ ${test.name}: FAILED (${response.status})`);
        console.log(`   Error: ${data.error || data.message || 'Unknown error'}`);
      }
    } catch (error) {
      console.log(`❌ ${test.name}: FAILED`);
      console.log(`   Error: ${error.message}`);
    }
  }

  // Test login page accessibility
  try {
    console.log('\nTesting: Login Page Access');
    const response = await fetch(renderUrl);
    if (response.ok) {
      console.log('✅ Login Page Access: SUCCESS');
    } else {
      console.log(`❌ Login Page Access: FAILED (${response.status})`);
    }
  } catch (error) {
    console.log('❌ Login Page Access: FAILED');
    console.log(`   Error: ${error.message}`);
  }

  console.log('\n' + '='.repeat(50));
  console.log('Render Deployment Test Complete');
  console.log('\nNext Steps:');
  console.log('1. If database shows "Failed", check your DATABASE_URL environment variable');
  console.log('2. If features are disabled, add the respective API keys in Render environment');
  console.log('3. Save the super admin credentials from your deployment logs');
  console.log('4. Test login functionality with the super admin account');
}

// Usage
if (process.argv.length < 3) {
  console.log('Usage: node render-deploy-test.js <your-render-url>');
  console.log('Example: node render-deploy-test.js https://your-app.onrender.com');
  process.exit(1);
}

const renderUrl = process.argv[2];
testRenderDeployment(renderUrl).catch(console.error);