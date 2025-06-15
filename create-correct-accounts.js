// Create the correct user accounts with proper passwords
const bcrypt = require('bcrypt');

async function createCorrectAccounts() {
  console.log('Creating correct user accounts...');
  
  try {
    // Create Super Admin with Temp1234 password
    const superAdminResponse = await fetch('http://localhost:5001/api/auth/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: 'bill@mrsprinklerrepair.com',
        username: 'billsprinkler',
        password: 'Temp1234',
        confirmPassword: 'Temp1234',
        role: 'super_admin'
      })
    });
    
    if (superAdminResponse.ok) {
      console.log('✅ Super Admin created with Temp1234');
    } else {
      console.log('⚠️ Super Admin may already exist');
    }

    // Create technician account
    const techResponse = await fetch('http://localhost:5001/api/auth/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: 'tech@testcompany.com',
        username: 'johntech',
        password: 'company123',
        confirmPassword: 'company123',
        role: 'technician'
      })
    });
    
    if (techResponse.ok) {
      console.log('✅ Technician created');
    } else {
      console.log('⚠️ Technician creation restricted or already exists');
    }

    // Test all three logins
    console.log('\nTesting all login credentials:');
    
    // Test 1: Super Admin with Temp1234
    const superTest = await fetch('http://localhost:5001/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: 'bill@mrsprinklerrepair.com',
        password: 'Temp1234'
      })
    });
    
    console.log('Super Admin (bill@mrsprinklerrepair.com / Temp1234):', superTest.ok ? '✅ WORKS' : '❌ FAILED');
    
    // Test 2: Company Admin  
    const companyTest = await fetch('http://localhost:5001/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: 'admin@testcompany.com',
        password: 'company123'
      })
    });
    
    console.log('Company Admin (admin@testcompany.com / company123):', companyTest.ok ? '✅ WORKS' : '❌ FAILED');
    
    // Test 3: Technician
    const techTest = await fetch('http://localhost:5001/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: 'tech@testcompany.com',
        password: 'company123'
      })
    });
    
    console.log('Technician (tech@testcompany.com / company123):', techTest.ok ? '✅ WORKS' : '❌ FAILED');

    console.log('\n📋 FINAL WORKING CREDENTIALS:');
    console.log('Super Admin: bill@mrsprinklerrepair.com / Temp1234');
    console.log('Company Admin: admin@testcompany.com / company123'); 
    console.log('Technician: tech@testcompany.com / company123');

  } catch (error) {
    console.error('Error:', error.message);
  }
}

createCorrectAccounts();