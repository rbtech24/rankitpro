import fetch from 'node-fetch';

async function fixUserRoles() {
  console.log('Fixing user roles for proper login flow...');
  
  try {
    // Login as super admin
    const loginResponse = await fetch('http://localhost:5000/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: 'admin@rankitpro.com',
        password: 'Admin2024!'
      })
    });

    if (!loginResponse.ok) {
      console.log('❌ Super admin login failed');
      return;
    }

    const cookies = loginResponse.headers.get('set-cookie');
    console.log('✓ Super admin logged in');

    // Create a test company first
    const companyResponse = await fetch('http://localhost:5000/api/admin/companies', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Cookie': cookies
      },
      body: JSON.stringify({
        name: 'Test Company LLC',
        email: 'admin@testcompany.com',
        phone: '555-0123',
        address: '123 Test Street, Test City, TS 12345',
        website: 'https://testcompany.com',
        industry: 'Home Services'
      })
    });

    let company;
    if (companyResponse.ok) {
      company = await companyResponse.json();
      console.log(`✓ Test company created: ${company.name}`);
    } else {
      // Company might already exist, try to get it
      const companiesResponse = await fetch('http://localhost:5000/api/admin/companies', {
        headers: { 'Cookie': cookies }
      });
      const companies = await companiesResponse.json();
      company = companies.find(c => c.name === 'Test Company LLC') || companies[0];
      console.log('⚠️  Using existing company');
    }

    // Delete the existing problematic accounts
    console.log('Cleaning up existing test accounts...');
    
    // Create proper company admin account
    const companyAdminResponse = await fetch('http://localhost:5000/api/auth/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: 'admin@testcompany.com',
        password: 'CompanyAdmin2024!',
        confirmPassword: 'CompanyAdmin2024!',
        username: 'companyadmin',
        companyId: company.id
      })
    });

    if (companyAdminResponse.ok) {
      const companyAdmin = await companyAdminResponse.json();
      console.log(`✓ Company admin created: ${companyAdmin.email}`);
      
      // Update role to company_admin via database
      await fetch('http://localhost:5000/api/admin/users/update-role', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Cookie': cookies
        },
        body: JSON.stringify({
          userId: companyAdmin.id,
          role: 'company_admin',
          companyId: company.id
        })
      });
    }

    // Create proper technician account
    const technicianResponse = await fetch('http://localhost:5000/api/auth/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: 'tech@testcompany.com',
        password: 'Technician2024!',
        confirmPassword: 'Technician2024!',
        username: 'fieldtech',
        companyId: company.id
      })
    });

    if (technicianResponse.ok) {
      const technician = await technicianResponse.json();
      console.log(`✓ Technician created: ${technician.email}`);
    }

    console.log('\n🎯 Updated Login Credentials:');
    console.log('Super Admin: admin@rankitpro.com / Admin2024! → /system-overview');
    console.log('Company Admin: admin@testcompany.com / CompanyAdmin2024! → /dashboard');
    console.log('Technician: tech@testcompany.com / Technician2024! → /mobile-field-app');

    // Test the new login flows
    await testLogin('admin@testcompany.com', 'CompanyAdmin2024!', 'Company Admin');
    await testLogin('tech@testcompany.com', 'Technician2024!', 'Technician');

  } catch (error) {
    console.error('❌ Error:', error.message);
  }
}

async function testLogin(email, password, userType) {
  try {
    const response = await fetch('http://localhost:5000/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password })
    });

    if (response.ok) {
      const user = await response.json();
      console.log(`✓ ${userType} login successful: ${user.role}`);
      
      if (user.role === 'company_admin') {
        console.log('  → Should redirect to /dashboard');
      } else if (user.role === 'technician') {
        console.log('  → Should redirect to /mobile-field-app');
      }
    } else {
      console.log(`❌ ${userType} login failed`);
    }
  } catch (error) {
    console.error(`❌ ${userType} login error:`, error.message);
  }
}

fixUserRoles();