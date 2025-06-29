/**
 * Create Sales Staff via Super Admin API
 * Creates a sales staff member using the admin interface
 */

import fetch from 'node-fetch';

async function createSalesStaffViaAdmin() {
  const baseUrl = 'http://localhost:5000';
  
  try {
    console.log('🔐 Logging in as super admin...');
    
    // Login as super admin
    const loginResponse = await fetch(`${baseUrl}/api/auth/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        email: 'bill@mrsprinklerrepair.com',
        password: 'SuperAdmin2025!'
      })
    });

    if (!loginResponse.ok) {
      throw new Error('Super admin login failed');
    }

    // Extract session cookies
    const cookies = loginResponse.headers.get('set-cookie') || '';
    console.log('✅ Super admin logged in successfully');

    console.log('👥 Creating sales staff member...');
    
    // Create sales staff member
    const createResponse = await fetch(`${baseUrl}/api/sales/people`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Cookie': cookies
      },
      body: JSON.stringify({
        name: 'Mock Sales Representative',
        email: 'sales.mock@example.com',
        phone: '+1-555-0199',
        commissionRate: 0.12, // 12% commission
        password: 'MockSales2025!',
        username: 'mocksales'
      })
    });

    if (createResponse.ok) {
      const salesStaff = await createResponse.json();
      console.log('✅ Sales staff created successfully!');
      console.log('📧 Email:', salesStaff.email || 'sales.mock@example.com');
      console.log('🔑 Password: MockSales2025!');
      console.log('👤 Username:', salesStaff.username || 'mocksales');
      console.log('💰 Commission Rate: 12%');
    } else {
      const error = await createResponse.text();
      console.log('❌ Failed to create sales staff:', error);
    }
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  }
}

createSalesStaffViaAdmin();