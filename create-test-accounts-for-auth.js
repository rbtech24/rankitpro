/**
 * Create Test Accounts for Authentication Testing
 * Creates company admin and technician accounts to test role-based routing
 */

const bcrypt = require('bcrypt');

async function createTestAccounts() {
  console.log('Creating test accounts for authentication testing...');
  
  try {
    // Create test company
    const companyResponse = await fetch('http://localhost:5000/api/admin/companies', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Cookie': 'connect.sid=test-session'
      },
      body: JSON.stringify({
        name: 'Test Company',
        email: 'company@test.com',
        phone: '555-0123',
        address: '123 Test St, Test City, TS 12345',
        website: 'https://testcompany.com',
        industry: 'Testing'
      })
    });

    let company;
    if (companyResponse.ok) {
      company = await companyResponse.json();
      console.log('✓ Test company created:', company.name);
    } else {
      console.log('⚠️ Company may already exist, continuing...');
      // Get existing companies to find test company
      const companiesResponse = await fetch('http://localhost:5000/api/admin/companies');
      const companies = await companiesResponse.json();
      company = companies.find(c => c.email === 'company@test.com') || { id: 1 };
    }

    // Hash passwords
    const companyPassword = await bcrypt.hash('Company2024!', 10);
    const techPassword = await bcrypt.hash('Tech2024!', 10);

    // Create company admin user
    const companyUserResponse = await fetch('http://localhost:5000/api/auth/register', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        email: 'company@test.com',
        password: 'Company2024!',
        confirmPassword: 'Company2024!',
        username: 'companytest',
        role: 'company_admin',
        companyId: company.id
      })
    });

    if (companyUserResponse.ok) {
      const companyUser = await companyUserResponse.json();
      console.log('✓ Company admin user created:', companyUser.email);
    } else {
      const error = await companyUserResponse.text();
      console.log('⚠️ Company admin user creation:', error);
    }

    // Create technician user
    const techUserResponse = await fetch('http://localhost:5000/api/auth/register', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        email: 'tech@test.com',
        password: 'Tech2024!',
        confirmPassword: 'Tech2024!',
        username: 'techtest',
        role: 'technician',
        companyId: company.id
      })
    });

    if (techUserResponse.ok) {
      const techUser = await techUserResponse.json();
      console.log('✓ Technician user created:', techUser.email);
    } else {
      const error = await techUserResponse.text();
      console.log('⚠️ Technician user creation:', error);
    }

    console.log('\n🎯 Test Account Summary:');
    console.log('Super Admin: admin@rankitpro.com / Admin2024!');
    console.log('Company Admin: company@test.com / Company2024!');
    console.log('Technician: tech@test.com / Tech2024!');
    console.log('\nTesting authentication flows...');

    // Test company admin login
    await testLogin('company@test.com', 'Company2024!', 'Company Admin');
    
    // Test technician login
    await testLogin('tech@test.com', 'Tech2024!', 'Technician');

  } catch (error) {
    console.error('❌ Error creating test accounts:', error);
  }
}

async function testLogin(email, password, userType) {
  try {
    const response = await fetch('http://localhost:5000/api/auth/login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ email, password })
    });

    if (response.ok) {
      const user = await response.json();
      console.log(`✓ ${userType} login successful:`, user.role);
      
      // Test role-specific redirects
      if (user.role === 'company_admin') {
        console.log('  → Should redirect to /dashboard');
      } else if (user.role === 'technician') {
        console.log('  → Should redirect to /field-mobile');
      }
    } else {
      const error = await response.text();
      console.log(`❌ ${userType} login failed:`, error);
    }
  } catch (error) {
    console.error(`❌ ${userType} login error:`, error);
  }
}

// Run the script
createTestAccounts();