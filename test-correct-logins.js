// Test the correct login credentials
const BASE_URL = 'http://localhost:5001';

async function testCorrectLogins() {
  console.log('Testing Super Admin with Temp1234...');
  
  // Test bill@mrsprinklerrepair.com with Temp1234
  try {
    const response = await fetch(`${BASE_URL}/api/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: 'bill@mrsprinklerrepair.com',
        password: 'Temp1234'
      })
    });

    const result = await response.text();
    
    if (response.ok) {
      console.log('✅ Super Admin login successful with Temp1234');
      console.log('Response:', result.substring(0, 100));
    } else {
      console.log('❌ Super Admin login failed with Temp1234');
      console.log('Status:', response.status);
      console.log('Response type:', typeof result);
      
      // Try with Admin123!
      console.log('\nTrying with Admin123!...');
      const response2 = await fetch(`${BASE_URL}/api/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: 'bill@mrsprinklerrepair.com',
          password: 'Admin123!'
        })
      });
      
      if (response2.ok) {
        console.log('✅ Super Admin login successful with Admin123!');
      } else {
        console.log('❌ Super Admin login failed with Admin123!');
      }
    }
  } catch (error) {
    console.log('Error testing login:', error.message);
  }
  
  console.log('\n=== CORRECT LOGIN CREDENTIALS ===');
  console.log('Super Admin: bill@mrsprinklerrepair.com');
  console.log('Password: Temp1234 (if working) or Admin123!');
  console.log('Company Admin: admin@elitehome.com / Company123!');
  console.log('Technician: mike@elitehome.com / Tech123!');
}

testCorrectLogins();