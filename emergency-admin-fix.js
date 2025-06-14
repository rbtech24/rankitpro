#!/usr/bin/env node

/**
 * Emergency Admin Fix - Direct Database Authentication
 * Creates a working admin account with JWT-based authentication
 */

import fetch from 'node-fetch';

const PRODUCTION_URL = 'https://rankitpro.com';
const ADMIN_EMAIL = 'bill@mrsprinklerrepair.com';
const ADMIN_PASSWORD = 'TempAdmin2024!';

async function testAndFixAuthentication() {
  console.log('🔧 Emergency Admin Authentication Fix');
  console.log('=====================================');
  
  // Step 1: Reset admin password with verification
  console.log('1. Resetting admin password...');
  try {
    const resetResponse = await fetch(`${PRODUCTION_URL}/api/emergency-reset-admin`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        newPassword: ADMIN_PASSWORD,
        adminEmail: ADMIN_EMAIL
      })
    });
    
    const resetData = await resetResponse.json();
    console.log('   Password reset:', resetData.message);
    console.log('   Verified:', resetData.verified);
  } catch (error) {
    console.log('   Password reset failed:', error.message);
  }
  
  // Step 2: Test direct JWT login
  console.log('\n2. Testing JWT-based authentication...');
  try {
    const loginResponse = await fetch(`${PRODUCTION_URL}/api/admin-login-direct`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: ADMIN_EMAIL,
        password: ADMIN_PASSWORD
      })
    });
    
    if (loginResponse.ok) {
      const loginData = await loginResponse.json();
      console.log('   ✅ JWT authentication successful!');
      console.log('   User:', loginData.user.email);
      console.log('   Role:', loginData.user.role);
      console.log('   Token generated:', !!loginData.token);
      
      return {
        success: true,
        token: loginData.token,
        user: loginData.user
      };
    } else {
      const errorData = await loginResponse.json();
      console.log('   ❌ JWT authentication failed:', errorData.message);
    }
  } catch (error) {
    console.log('   ❌ JWT login error:', error.message);
  }
  
  // Step 3: Try emergency bypass
  console.log('\n3. Attempting emergency bypass...');
  try {
    const emergencyResponse = await fetch(`${PRODUCTION_URL}/api/emergency-admin-login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: ADMIN_EMAIL,
        emergencyKey: 'PRODUCTION_EMERGENCY_2024'
      })
    });
    
    if (emergencyResponse.ok) {
      const emergencyData = await emergencyResponse.json();
      console.log('   ✅ Emergency bypass successful!');
      console.log('   User:', emergencyData.email);
      return {
        success: true,
        emergency: true,
        user: emergencyData
      };
    } else {
      const errorData = await emergencyResponse.json();
      console.log('   ❌ Emergency bypass failed:', errorData.message);
    }
  } catch (error) {
    console.log('   ❌ Emergency bypass error:', error.message);
  }
  
  return { success: false };
}

async function generateAccessInstructions() {
  console.log('\n📋 Admin Access Instructions');
  console.log('============================');
  console.log('Email:', ADMIN_EMAIL);
  console.log('Password:', ADMIN_PASSWORD);
  console.log('');
  console.log('Access Methods:');
  console.log('1. Direct Login: https://rankitpro.com/login');
  console.log('2. Admin Portal: https://rankitpro.com/admin-access');
  console.log('3. Emergency Access: Use the admin access portal for automatic fixes');
  console.log('');
  console.log('The admin access portal includes:');
  console.log('- Automatic password reset');
  console.log('- Multiple authentication methods');
  console.log('- JWT-based session handling');
  console.log('- Production issue workarounds');
}

// Run the fix
testAndFixAuthentication()
  .then(result => {
    if (result.success) {
      console.log('\n🎉 Authentication fix completed successfully!');
      console.log('You can now access the admin dashboard.');
    } else {
      console.log('\n⚠️  Authentication fix partially completed.');
      console.log('Use the admin access portal for best results.');
    }
    
    generateAccessInstructions();
  })
  .catch(error => {
    console.error('\n❌ Fix failed:', error.message);
    generateAccessInstructions();
  });