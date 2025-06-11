#!/usr/bin/env node

/**
 * Deployment Test Script
 * Tests the application's readiness for production deployment
 */

const fetch = require('node-fetch');

async function testHealthEndpoints() {
  const baseUrl = process.env.BASE_URL || 'http://localhost:5000';
  const endpoints = [
    '/api/health',
    '/api/health/database', 
    '/api/health/detailed'
  ];

  console.log('Testing health endpoints...');
  
  for (const endpoint of endpoints) {
    try {
      const response = await fetch(`${baseUrl}${endpoint}`);
      const data = await response.json();
      
      console.log(`${endpoint}: ${response.status} - ${data.status}`);
      
      if (endpoint === '/api/health/detailed') {
        console.log(`   Database: ${data.features.database ? 'Connected' : 'Failed'}`);
        console.log(`   Email: ${data.features.email ? 'Enabled' : 'Disabled'}`);
        console.log(`   Payments: ${data.features.payments ? 'Enabled' : 'Disabled'}`);
        console.log(`   AI: ${data.features.ai ? 'Enabled' : 'Disabled'}`);
        
        if (data.warnings.length > 0) {
          console.log('   Warnings:');
          data.warnings.forEach(warning => console.log(`     - ${warning}`));
        }
        
        if (data.errors.length > 0) {
          console.log('   Errors:');
          data.errors.forEach(error => console.log(`     - ${error}`));
        }
      }
    } catch (error) {
      console.log(`${endpoint}: Failed - ${error.message}`);
    }
  }
}

async function checkEnvironmentVariables() {
  console.log('\nChecking environment variables...');
  
  const required = ['DATABASE_URL'];
  const optional = [
    'SESSION_SECRET',
    'SENDGRID_API_KEY', 
    'STRIPE_SECRET_KEY',
    'OPENAI_API_KEY',
    'ANTHROPIC_API_KEY',
    'XAI_API_KEY'
  ];
  
  console.log('Required variables:');
  required.forEach(key => {
    const value = process.env[key];
    console.log(`  ${key}: ${value ? 'Set' : 'Missing'}`);
  });
  
  console.log('\nOptional variables:');
  optional.forEach(key => {
    const value = process.env[key];
    console.log(`  ${key}: ${value ? 'Set' : 'Not set'}`);
  });
}

async function main() {
  console.log('Rank It Pro Deployment Test');
  console.log('================================\n');
  
  await checkEnvironmentVariables();
  
  if (process.env.BASE_URL && !process.env.BASE_URL.includes('localhost')) {
    console.log('Testing remote deployment...');
  } else {
    console.log('Waiting for local server to start...');
    await new Promise(resolve => setTimeout(resolve, 5000));
  }
  
  await testHealthEndpoints();
  
  console.log('\nDeployment Test Complete');
  console.log('If all tests pass, your application is ready for production!');
}

if (require.main === module) {
  main().catch(console.error);
}

module.exports = { testHealthEndpoints, checkEnvironmentVariables };