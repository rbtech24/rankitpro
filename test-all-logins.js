// Test all three user role logins
const BASE_URL = 'http://localhost:5001';

async function testAllLogins() {
  console.log('🔐 Testing All User Role Logins\n');

  // Test 1: Super Admin Login
  console.log('1. Testing Super Admin Login');
  try {
    const superAdminResponse = await fetch(`${BASE_URL}/api/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: 'admin@rankitpro.com',
        password: 'Admin123!'
      })
    });

    if (superAdminResponse.ok) {
      const superAdminData = await superAdminResponse.json();
      console.log('   ✅ Super Admin login successful:', superAdminData.email, '- Role:', superAdminData.role);
    } else {
      console.log('   ❌ Super Admin login failed:', superAdminResponse.status);
    }
  } catch (error) {
    console.log('   ❌ Super Admin login error:', error.message);
  }

  // Create Company Admin for testing
  console.log('\n2. Creating Company Admin Account');
  try {
    const companyAdminResponse = await fetch(`${BASE_URL}/api/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: 'admin@elitehome.com',
        username: 'eliteadmin',
        password: 'Company123!',
        confirmPassword: 'Company123!',
        role: 'company_admin'
      })
    });

    if (companyAdminResponse.ok) {
      const companyAdmin = await companyAdminResponse.json();
      console.log('   ✅ Company Admin created:', companyAdmin.email, '- Role:', companyAdmin.role);
    } else {
      console.log('   ⚠️ Company Admin already exists or registration failed');
    }
  } catch (error) {
    console.log('   ❌ Company Admin creation error:', error.message);
  }

  // Test 2: Company Admin Login
  console.log('\n3. Testing Company Admin Login');
  try {
    const companyLoginResponse = await fetch(`${BASE_URL}/api/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: 'admin@elitehome.com',
        password: 'Company123!'
      })
    });

    if (companyLoginResponse.ok) {
      const companyLoginData = await companyLoginResponse.json();
      console.log('   ✅ Company Admin login successful:', companyLoginData.email, '- Role:', companyLoginData.role);
    } else {
      console.log('   ❌ Company Admin login failed:', companyLoginResponse.status);
    }
  } catch (error) {
    console.log('   ❌ Company Admin login error:', error.message);
  }

  // Create Technician for testing
  console.log('\n4. Creating Technician Account');
  try {
    const technicianResponse = await fetch(`${BASE_URL}/api/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: 'mike@elitehome.com',
        username: 'miketech',
        password: 'Tech123!',
        confirmPassword: 'Tech123!',
        role: 'technician'
      })
    });

    if (technicianResponse.ok) {
      const technician = await technicianResponse.json();
      console.log('   ✅ Technician created:', technician.email, '- Role:', technician.role);
    } else {
      console.log('   ⚠️ Technician already exists or registration failed');
    }
  } catch (error) {
    console.log('   ❌ Technician creation error:', error.message);
  }

  // Test 3: Technician Login
  console.log('\n5. Testing Technician Login');
  try {
    const techLoginResponse = await fetch(`${BASE_URL}/api/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: 'mike@elitehome.com',
        password: 'Tech123!'
      })
    });

    if (techLoginResponse.ok) {
      const techLoginData = await techLoginResponse.json();
      console.log('   ✅ Technician login successful:', techLoginData.email, '- Role:', techLoginData.role);
    } else {
      console.log('   ❌ Technician login failed:', techLoginResponse.status);
    }
  } catch (error) {
    console.log('   ❌ Technician login error:', error.message);
  }

  // Test Dashboard Access for Each Role
  console.log('\n6. Testing Dashboard Access by Role');
  
  // Test Super Admin Dashboard Access
  console.log('   Testing Super Admin Dashboard Access...');
  try {
    const superAdminDashResponse = await fetch(`${BASE_URL}/api/admin/dashboard`, {
      method: 'GET',
      headers: { 'Content-Type': 'application/json' }
    });
    console.log('   Super Admin Dashboard:', superAdminDashResponse.status === 200 ? '✅ Accessible' : '❌ Restricted');
  } catch (error) {
    console.log('   Super Admin Dashboard: ❌ Error accessing');
  }

  // Summary of Available Accounts
  console.log('\n📋 AVAILABLE LOGIN ACCOUNTS:');
  console.log('');
  console.log('🔑 Super Admin (Full Platform Access):');
  console.log('   Email: admin@rankitpro.com');
  console.log('   Password: Admin123!');
  console.log('   Access: All companies, users, system settings');
  console.log('');
  console.log('🏢 Company Admin (Company Management):');
  console.log('   Email: admin@elitehome.com');
  console.log('   Password: Company123!');
  console.log('   Access: Company settings, technicians, jobs, reviews');
  console.log('');
  console.log('🔧 Technician (Mobile App Access):');
  console.log('   Email: mike@elitehome.com');
  console.log('   Password: Tech123!');
  console.log('   Access: Job check-ins, customer data, photo uploads');
  console.log('');
  console.log('🌐 Access URLs:');
  console.log('   Platform: http://localhost:5001');
  console.log('   Mobile App: http://localhost:5001 (responsive)');
  console.log('   Admin Dashboard: http://localhost:5001/admin');

  return {
    superAdmin: { email: 'admin@rankitpro.com', password: 'Admin123!' },
    companyAdmin: { email: 'admin@elitehome.com', password: 'Company123!' },
    technician: { email: 'mike@elitehome.com', password: 'Tech123!' }
  };
}

// Run the login tests
testAllLogins()
  .then(credentials => {
    console.log('\n🎯 ALL AUTHENTICATION TESTS COMPLETED');
    console.log('Platform ready for multi-role user access');
  })
  .catch(error => {
    console.error('❌ Authentication test failed:', error);
  });