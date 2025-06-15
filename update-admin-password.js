// Update admin password to correct Temp1234
const bcrypt = require('bcrypt');

async function updateAdminPassword() {
  console.log('🔐 Updating Super Admin Password');
  
  try {
    // Hash the correct password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash('Temp1234', salt);
    
    console.log('✅ Password hashed successfully');
    console.log('Hash length:', hashedPassword.length);
    
    // Test the existing account with Temp1234
    const loginResponse = await fetch('http://localhost:5001/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: 'bill@mrsprinklerrepair.com',
        password: 'Temp1234'
      })
    });
    
    if (loginResponse.ok) {
      console.log('✅ Login with Temp1234 already works');
    } else {
      console.log('⚠️ Need to update password in storage');
    }
    
    return hashedPassword;
    
  } catch (error) {
    console.error('❌ Error updating password:', error);
  }
}

updateAdminPassword();