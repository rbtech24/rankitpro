import fetch from 'node-fetch';
import bcrypt from 'bcrypt';

const PRODUCTION_URL = 'https://rankitpro.com';

async function fixProductionLogin() {
  console.log('🔧 Production Login Fix Script');
  console.log('==============================\n');
  
  // Test current admin credentials first
  console.log('1. Testing current admin login...');
  const currentTest = await fetch(`${PRODUCTION_URL}/api/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      email: 'admin-1749502542878@rankitpro.system',
      password: 'ASCak2T%p4pT4DUu'
    })
  });
  
  const currentResult = await currentTest.text();
  console.log(`Status: ${currentTest.status}`);
  console.log(`Response: ${currentResult.substring(0, 100)}...\n`);
  
  if (currentTest.status === 200) {
    console.log('✅ Admin login is already working!');
    return;
  }
  
  // Get database info
  console.log('2. Checking database status...');
  const dbTest = await fetch(`${PRODUCTION_URL}/api/emergency-db-test`);
  const dbResult = await dbTest.text();
  
  if (dbTest.status !== 200 || !dbResult.startsWith('{')) {
    console.log('❌ Database endpoint not accessible');
    console.log('This indicates the production API routes are being blocked by static file serving.');
    console.log('\nRecommended actions:');
    console.log('1. Check Render.com deployment logs for routing issues');
    console.log('2. Verify the Express server is running properly');
    console.log('3. Ensure static file middleware isn\'t overriding API routes');
    return;
  }
  
  const dbData = JSON.parse(dbResult);
  console.log(`Found ${dbData.totalUsers} users, ${dbData.superAdminCount} admins`);
  
  // Try password reset
  console.log('\n3. Attempting password reset...');
  const resetTest = await fetch(`${PRODUCTION_URL}/api/emergency-reset-admin`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      newPassword: 'ProductionSecure2024!',
      adminEmail: 'admin-1749502542878@rankitpro.system'
    })
  });
  
  const resetResult = await resetTest.text();
  console.log(`Reset Status: ${resetTest.status}`);
  console.log(`Reset Response: ${resetResult.substring(0, 200)}`);
  
  if (resetTest.status === 200 && resetResult.startsWith('{')) {
    console.log('\n4. Testing new password...');
    const newTest = await fetch(`${PRODUCTION_URL}/api/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: 'admin-1749502542878@rankitpro.system',
        password: 'ProductionSecure2024!'
      })
    });
    
    const newResult = await newTest.text();
    console.log(`New Login Status: ${newTest.status}`);
    
    if (newTest.status === 200) {
      console.log('\n🎉 PRODUCTION LOGIN RESTORED!');
      console.log('Admin Credentials:');
      console.log('📧 Email: admin-1749502542878@rankitpro.system');
      console.log('🔑 Password: ProductionSecure2024!');
      console.log('🌐 Login URL: https://rankitpro.com/login');
    } else {
      console.log('❌ New password login failed');
      console.log(`Response: ${newResult.substring(0, 200)}`);
    }
  } else {
    console.log('❌ Password reset failed or blocked by routing');
  }
}

fixProductionLogin().catch(console.error);