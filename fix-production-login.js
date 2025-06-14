#!/usr/bin/env node

/**
 * Production Login Fix Script
 * Directly updates the admin password in production database
 */

import fetch from 'node-fetch';

const PRODUCTION_URL = 'https://rankitpro.com';
const NEW_ADMIN_PASSWORD = 'AdminSecure2024!';

async function fixProductionLogin() {
  console.log('Fixing production admin login...\n');

  // Reset admin password
  console.log('Resetting admin password...');
  try {
    const resetResponse = await fetch(`${PRODUCTION_URL}/api/emergency-reset-admin`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ newPassword: NEW_ADMIN_PASSWORD })
    });

    console.log('Reset response status:', resetResponse.status);
    const resetText = await resetResponse.text();
    
    if (resetResponse.ok && !resetText.includes('<html>')) {
      const resetData = JSON.parse(resetText);
      console.log('✅ Password reset successful:', resetData);
    } else {
      console.log('❌ Password reset failed - API routing issue persists');
      return false;
    }
  } catch (error) {
    console.log('❌ Password reset error:', error.message);
    return false;
  }

  // Test login with new password
  console.log('\nTesting login with new password...');
  try {
    const loginResponse = await fetch(`${PRODUCTION_URL}/api/auth/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        email: 'admin-1749502542878@rankitpro.system',
        password: NEW_ADMIN_PASSWORD
      })
    });

    console.log('Login test status:', loginResponse.status);
    const loginText = await loginResponse.text();

    if (loginResponse.ok) {
      const userData = JSON.parse(loginText);
      console.log('✅ LOGIN SUCCESSFUL!');
      console.log('Admin user data:', userData);
      console.log('\n🎉 Production admin login is now working!');
      console.log('📧 Email: admin-1749502542878@rankitpro.system');
      console.log('🔑 Password:', NEW_ADMIN_PASSWORD);
      return true;
    } else {
      console.log('❌ Login still failing:', loginText.substring(0, 200));
      return false;
    }
  } catch (error) {
    console.log('❌ Login test error:', error.message);
    return false;
  }
}

fixProductionLogin().then(success => {
  if (success) {
    console.log('\n✅ Production login fix completed successfully!');
    console.log('The super admin can now access the dashboard at https://rankitpro.com/login');
  } else {
    console.log('\n❌ Production login fix failed - deployment update needed');
  }
}).catch(error => {
  console.error('❌ Fix script failed:', error);
});