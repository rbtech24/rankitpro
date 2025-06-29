/**
 * Test Sales Staff Login
 * Tests the demo sales staff account login
 */

import fetch from 'node-fetch';

async function testSalesLogin() {
  const baseUrl = 'http://localhost:5000';
  
  try {
    console.log('🧪 Testing sales staff login...');
    
    const response = await fetch(`${baseUrl}/api/auth/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        email: 'demo@salesstaff.com',
        password: 'SalesDemo2025!'
      })
    });

    if (response.ok) {
      const data = await response.json();
      console.log('✅ Sales staff login successful!');
      console.log('👤 User:', {
        id: data.id,
        email: data.email,
        username: data.username,
        role: data.role
      });
      console.log('\n🎯 Demo Account Ready!');
      console.log('📧 Email: demo@salesstaff.com');
      console.log('🔑 Password: SalesDemo2025!');
      console.log('📍 Sales Dashboard: /sales-dashboard');
    } else {
      const error = await response.text();
      console.log('❌ Login failed:', error);
    }
    
  } catch (error) {
    console.error('❌ Test error:', error.message);
  }
}

testSalesLogin();