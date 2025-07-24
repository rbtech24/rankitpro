#!/usr/bin/env node

/**
 * Test Trial Blocking System
 * Direct API testing to verify trial enforcement
 */

const API_BASE = 'http://localhost:3000';

async function testAPI(endpoint, description) {
  try {
    const response = await fetch(`${API_BASE}${endpoint}`, {
      credentials: 'include',
      headers: {
        'Accept': 'application/json'
      }
    });
    
    const data = await response.json();
    
    let status, result;
    if (response.status === 403 && data.error === 'trial_expired') {
      status = '✅ BLOCKED';
      result = `Trial expired protection working`;
    } else if (response.status === 401) {
      status = '🔐 AUTH REQUIRED';
      result = 'Authentication required (expected)';
    } else if (response.status === 200) {
      status = '⚠️ ACCESS ALLOWED';
      result = 'Access granted (trial may not be expired)';
    } else {
      status = '❓ UNKNOWN';
      result = `Status: ${response.status}`;
    }
    
    console.log(`${status} ${endpoint} - ${description}`);
    console.log(`   Result: ${result}`);
    if (data.message) console.log(`   Message: ${data.message}`);
    console.log('');
    
  } catch (error) {
    console.log(`❌ ERROR ${endpoint} - ${description}`);
    console.log(`   Error: ${error.message}`);
    console.log('');
  }
}

async function main() {
  console.log('🧪 TRIAL BLOCKING SYSTEM TEST');
  console.log('=====================================\n');
  
  console.log('Testing protected endpoints that should be BLOCKED for expired trials:\n');
  
  const protectedEndpoints = [
    ['/api/check-ins', 'Check-ins API'],
    ['/api/blog-posts', 'Blog Posts API'],
    ['/api/testimonials', 'Testimonials API'],
    ['/api/review-requests', 'Review Requests API'],
    ['/api/generate-content', 'Content Generation API'],
    ['/api/technicians', 'Technicians API'],
    ['/api/analytics', 'Analytics API']
  ];
  
  for (const [endpoint, description] of protectedEndpoints) {
    await testAPI(endpoint, description);
  }
  
  console.log('Testing endpoints that should still work:\n');
  
  const allowedEndpoints = [
    ['/api/health', 'Health Check'],
    ['/api/auth/me', 'Auth Status'],
    ['/api/billing/plans', 'Billing Plans (for upgrade)']
  ];
  
  for (const [endpoint, description] of allowedEndpoints) {
    await testAPI(endpoint, description);
  }
  
  console.log('Test completed! For trial expiration to work:');
  console.log('• Protected endpoints should show "✅ BLOCKED" with trial_expired error');
  console.log('• Auth endpoints should work normally');
  console.log('• Users should see upgrade modals in the frontend');
}

main().catch(console.error);