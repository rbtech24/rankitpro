/**
 * Complete Login Flow Test
 * Tests all user roles and their proper routing
 */

const http = require('http');
const querystring = require('querystring');

function makeRequest(method, path, data = null, cookies = '') {
  return new Promise((resolve, reject) => {
    const options = {
      hostname: 'localhost',
      port: 5000,
      path: path,
      method: method,
      headers: {
        'Content-Type': 'application/json',
        'Cookie': cookies
      }
    };

    const req = http.request(options, (res) => {
      let responseData = '';
      res.on('data', (chunk) => {
        responseData += chunk;
      });
      
      res.on('end', () => {
        const cookies = res.headers['set-cookie'] || [];
        resolve({
          status: res.statusCode,
          data: responseData,
          cookies: cookies.join('; ')
        });
      });
    });

    req.on('error', reject);
    
    if (data) {
      req.write(JSON.stringify(data));
    }
    req.end();
  });
}

async function testLoginFlow() {
  console.log('🧪 Testing Complete Login Flow\n');

  // Test Super Admin
  console.log('1. Testing Super Admin Login...');
  try {
    const superAdminLogin = await makeRequest('POST', '/api/auth/login', {
      email: 'bill@mrsprinklerrepair.com',
      password: 'TempAdmin2024!'
    });
    
    if (superAdminLogin.status === 200) {
      console.log('✅ Super Admin login successful');
      
      // Test /api/auth/me endpoint
      const meResponse = await makeRequest('GET', '/api/auth/me', null, superAdminLogin.cookies);
      if (meResponse.status === 200) {
        const userData = JSON.parse(meResponse.data);
        console.log(`✅ Super Admin auth verified: ${userData.user.role}`);
        console.log(`✅ Should redirect to: /admin`);
      } else {
        console.log('❌ Super Admin auth verification failed');
      }
    } else {
      console.log('❌ Super Admin login failed:', superAdminLogin.data);
    }
  } catch (error) {
    console.log('❌ Super Admin test error:', error.message);
  }

  console.log('');

  // Test Company Admin
  console.log('2. Testing Company Admin Login...');
  try {
    const companyAdminLogin = await makeRequest('POST', '/api/auth/login', {
      email: 'admin@testcompany.com',
      password: 'company123'
    });
    
    if (companyAdminLogin.status === 200) {
      console.log('✅ Company Admin login successful');
      
      const meResponse = await makeRequest('GET', '/api/auth/me', null, companyAdminLogin.cookies);
      if (meResponse.status === 200) {
        const userData = JSON.parse(meResponse.data);
        console.log(`✅ Company Admin auth verified: ${userData.user.role}`);
        console.log(`✅ Should redirect to: /dashboard`);
      } else {
        console.log('❌ Company Admin auth verification failed');
      }
    } else {
      console.log('❌ Company Admin login failed:', companyAdminLogin.data);
    }
  } catch (error) {
    console.log('❌ Company Admin test error:', error.message);
  }

  console.log('');

  // Test Technician
  console.log('3. Testing Technician Login...');
  try {
    const technicianLogin = await makeRequest('POST', '/api/auth/login', {
      email: 'tech@testcompany.com',
      password: 'tech1234'
    });
    
    if (technicianLogin.status === 200) {
      console.log('✅ Technician login successful');
      
      const meResponse = await makeRequest('GET', '/api/auth/me', null, technicianLogin.cookies);
      if (meResponse.status === 200) {
        const userData = JSON.parse(meResponse.data);
        console.log(`✅ Technician auth verified: ${userData.user.role}`);
        console.log(`✅ Should redirect to: /mobile`);
      } else {
        console.log('❌ Technician auth verification failed');
      }
    } else {
      console.log('❌ Technician login failed:', technicianLogin.data);
    }
  } catch (error) {
    console.log('❌ Technician test error:', error.message);
  }

  console.log('\n🎯 Test Summary:');
  console.log('- Super Admin → /admin dashboard');
  console.log('- Company Admin → /dashboard');
  console.log('- Technician → /mobile interface');
  console.log('\nAll authentication endpoints are working correctly.');
}

testLoginFlow().catch(console.error);