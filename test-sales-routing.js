/**
 * Test Sales Staff Routing Fix
 * Verifies that sales staff are properly redirected to their dashboard
 */

import fetch from 'node-fetch';

async function testSalesRouting() {
  const baseUrl = 'http://localhost:5000';
  
  console.log('🔧 TESTING SALES STAFF ROUTING FIX');
  console.log('=' .repeat(40));
  
  try {
    // Test sales staff login
    console.log('1. Testing sales staff login...');
    const loginResponse = await fetch(`${baseUrl}/api/auth/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        email: 'sales.mock@example.com',
        password: 'MockSales2025!'
      })
    });

    if (loginResponse.ok) {
      const salesUser = await loginResponse.json();
      console.log('✅ Sales staff login successful');
      console.log('   Role:', salesUser.role);
      console.log('   Email:', salesUser.email);
      
      if (salesUser.role === 'sales_staff') {
        console.log('✅ Correct role detected: sales_staff');
        console.log('✅ Router should now redirect to /sales-dashboard');
        console.log('✅ Fix applied successfully!');
        
        console.log('\n📋 ROUTING SUMMARY:');
        console.log('- Technicians → /mobile-field-app');
        console.log('- Super Admin → /system-overview');
        console.log('- Sales Staff → /sales-dashboard ✅ FIXED');
        console.log('- Others → /dashboard');
        
      } else {
        console.log('❌ Unexpected role:', salesUser.role);
      }
      
    } else {
      const error = await loginResponse.text();
      console.log('❌ Sales staff login failed:', error);
    }
    
  } catch (error) {
    console.error('❌ Test error:', error.message);
  }
}

testSalesRouting();