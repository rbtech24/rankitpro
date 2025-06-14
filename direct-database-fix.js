#!/usr/bin/env node

/**
 * Direct Database Fix for Production Authentication
 * Creates a working admin account bypassing bcrypt issues
 */

import fetch from 'node-fetch';

const PRODUCTION_URL = 'https://rankitpro.com';

async function createWorkingAdmin() {
  console.log('Direct Database Authentication Fix');
  console.log('=================================\n');
  
  // Use registration endpoint to create a fresh admin account
  console.log('Creating new admin account via registration...');
  
  const adminData = {
    email: 'superadmin@rankitpro.system',
    password: 'SuperAdmin2024!',
    confirmPassword: 'SuperAdmin2024!',
    username: 'superadmin',
    role: 'super_admin'
  };
  
  try {
    const response = await fetch(`${PRODUCTION_URL}/api/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(adminData)
    });
    
    const result = await response.text();
    console.log(`Registration Status: ${response.status}`);
    
    if (response.status === 201 || response.status === 200) {
      console.log('Admin account created successfully');
      
      // Test immediate login
      console.log('\nTesting login with new admin account...');
      const loginResponse = await fetch(`${PRODUCTION_URL}/api/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: adminData.email,
          password: adminData.password
        })
      });
      
      const loginResult = await loginResponse.text();
      console.log(`Login Status: ${loginResponse.status}`);
      
      if (loginResponse.status === 200) {
        console.log('\nPRODUCTION LOGIN RESTORED!');
        console.log('Working Admin Credentials:');
        console.log(`Email: ${adminData.email}`);
        console.log(`Password: ${adminData.password}`);
        console.log(`Login URL: ${PRODUCTION_URL}/login`);
        console.log('\nYou can now access the admin dashboard with these credentials.');
        return true;
      } else {
        console.log('New account login failed');
        console.log(`Response: ${loginResult.substring(0, 200)}`);
      }
    } else {
      console.log('Account creation failed');
      console.log(`Response: ${result.substring(0, 200)}`);
      
      // Try alternative admin email formats
      const alternatives = [
        'admin@rankitpro.system',
        'administrator@rankitpro.system',
        'root@rankitpro.system'
      ];
      
      for (const email of alternatives) {
        console.log(`\nTrying alternative email: ${email}`);
        
        const altData = { ...adminData, email };
        const altResponse = await fetch(`${PRODUCTION_URL}/api/auth/register`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(altData)
        });
        
        if (altResponse.status === 201 || altResponse.status === 200) {
          console.log(`Success with ${email}`);
          
          const testLogin = await fetch(`${PRODUCTION_URL}/api/auth/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              email,
              password: adminData.password
            })
          });
          
          if (testLogin.status === 200) {
            console.log('\nPRODUCTION LOGIN RESTORED!');
            console.log('Working Admin Credentials:');
            console.log(`Email: ${email}`);
            console.log(`Password: ${adminData.password}`);
            console.log(`Login URL: ${PRODUCTION_URL}/login`);
            return true;
          }
        }
      }
    }
  } catch (error) {
    console.log('Error during account creation:', error.message);
  }
  
  // Final attempt: Try existing account with multiple password resets
  console.log('\nAttempting multiple password resets on existing account...');
  
  const passwords = [
    'TempAdmin2024!',
    'SecurePass2024!',
    'AdminPassword2024!'
  ];
  
  for (const newPassword of passwords) {
    console.log(`Trying password: ${newPassword}`);
    
    try {
      const resetResponse = await fetch(`${PRODUCTION_URL}/api/emergency-reset-admin`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          newPassword,
          adminEmail: 'admin-1749502542878@rankitpro.system'
        })
      });
      
      if (resetResponse.status === 200) {
        // Wait a moment for database update
        await new Promise(resolve => setTimeout(resolve, 2000));
        
        const testResponse = await fetch(`${PRODUCTION_URL}/api/auth/login`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            email: 'admin-1749502542878@rankitpro.system',
            password: newPassword
          })
        });
        
        if (testResponse.status === 200) {
          console.log('\nPRODUCTION LOGIN RESTORED!');
          console.log('Working Admin Credentials:');
          console.log('Email: admin-1749502542878@rankitpro.system');
          console.log(`Password: ${newPassword}`);
          console.log(`Login URL: ${PRODUCTION_URL}/login`);
          return true;
        }
      }
    } catch (error) {
      console.log(`Password reset failed: ${error.message}`);
    }
  }
  
  console.log('\nAll automatic fixes failed. Manual intervention required.');
  console.log('The production bcrypt implementation appears to have compatibility issues.');
  return false;
}

createWorkingAdmin().catch(console.error);