// Debug authentication issues
import { storage } from '../storage';
import bcrypt from 'bcrypt';

async function debugAuth() {
  try {
    console.log('=== DEBUG AUTHENTICATION ===');
    
    // 1. Check all users in storage
    console.log('\nAll users in system:');
    const allUsers = await storage.getAllUsers();
    console.log(`Found ${allUsers.length} users:`);
    
    allUsers.forEach(user => {
      console.log(`- ID: ${user.id}, Email: ${user.email}, Role: ${user.role}, Password: ${user.password?.substring(0, 20)}...`);
    });
    
    // 2. Look for specific test accounts
    console.log('\nLooking for test accounts:');
    
    const adminEmail = 'admin@testcompany.com';
    const techEmail = 'tech@testcompany.com';
    
    const adminUser = await storage.getUserByEmail(adminEmail);
    const techUser = await storage.getUserByEmail(techEmail);
    
    console.log(`Admin account (${adminEmail}): ${adminUser ? 'FOUND' : 'NOT FOUND'}`);
    if (adminUser) {
      console.log(`- ID: ${adminUser.id}, Password hash: ${adminUser.password}`);
    }
    
    console.log(`Tech account (${techEmail}): ${techUser ? 'FOUND' : 'NOT FOUND'}`);
    if (techUser) {
      console.log(`- ID: ${techUser.id}, Password hash: ${techUser.password}`);
    }
    
    // 3. Test password verification with real passwords
    console.log('\nTesting password verification:');
    
    // Test admin account
    if (adminUser) {
      const adminPassword = 'company123';
      const adminPasswordValid = await bcrypt.compare(adminPassword, adminUser.password);
      console.log(`Admin password verification: ${adminPasswordValid ? 'SUCCESS' : 'FAILED'}`);
      
      // If failed, create new one with known hash
      if (!adminPasswordValid) {
        console.log('\nCreating new admin account with verified hash:');
        const newHash = await bcrypt.hash(adminPassword, 10);
        
        // Create new user or update existing one
        const newAdmin = await storage.createUser({
          username: 'companyadmin2',
          email: 'admin2@testcompany.com',
          password: newHash,
          role: 'company_admin',
          companyId: 1,
          active: true
        });
        
        console.log(`New admin created with ID: ${newAdmin.id}`);
        console.log(`Email: admin2@testcompany.com`);
        console.log(`Password: company123 (verified hash)`);
        
        // Verify the hash works
        const verifyHash = await bcrypt.compare(adminPassword, newHash);
        console.log(`New admin hash verification: ${verifyHash ? 'SUCCESS' : 'FAILED'}`);
      }
    }
    
    // Test tech account
    if (techUser) {
      const techPassword = 'tech1234';
      const techPasswordValid = await bcrypt.compare(techPassword, techUser.password);
      console.log(`Tech password verification: ${techPasswordValid ? 'SUCCESS' : 'FAILED'}`);
      
      // If failed, create new one with known hash
      if (!techPasswordValid) {
        console.log('\nCreating new tech account with verified hash:');
        const newHash = await bcrypt.hash(techPassword, 10);
        
        // Create new user
        const newTech = await storage.createUser({
          username: 'techuser2',
          email: 'tech2@testcompany.com',
          password: newHash,
          role: 'technician',
          companyId: 1,
          active: true
        });
        
        console.log(`New tech created with ID: ${newTech.id}`);
        console.log(`Email: tech2@testcompany.com`);
        console.log(`Password: tech1234 (verified hash)`);
        
        // Verify the hash works
        const verifyHash = await bcrypt.compare(techPassword, newHash);
        console.log(`New tech hash verification: ${verifyHash ? 'SUCCESS' : 'FAILED'}`);
      }
    }
  } catch (error) {
    console.error('Debug auth error:', error);
  }
}

// Run the debug function
debugAuth()
  .then(() => {
    console.log('\nDebug completed.');
  })
  .catch(error => {
    console.error('Failed during debug:', error);
  });