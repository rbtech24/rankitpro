/**
 * Test New Sales Staff Login
 * Tests the newly created mock sales staff account
 */

import fetch from 'node-fetch';

async function testNewSalesLogin() {
  const baseUrl = 'http://localhost:5000';
  
  try {
    console.log('🧪 Testing new sales staff login...');
    
    const response = await fetch(`${baseUrl}/api/auth/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        email: 'sales.mock@example.com',
        password: 'MockSales2025!'
      })
    });

    if (response.ok) {
      const data = await response.json();
      console.log('✅ Mock sales staff login successful!');
      console.log('👤 User:', {
        id: data.id,
        email: data.email,
        username: data.username,
        role: data.role
      });
      console.log('\n🎯 New Mock Account Ready!');
      console.log('📧 Email: sales.mock@example.com');
      console.log('🔑 Password: MockSales2025!');
      console.log('📍 Sales Dashboard: /sales-dashboard');
    } else {
      const error = await response.text();
      console.log('❌ Login failed:', error);
    }
    
  } catch (error) {
    console.error('❌ Test error:', error.message);
  }
}

testNewSalesLogin();