// Script to create proper test accounts with correctly hashed passwords
import { storage } from '../storage';
import bcrypt from 'bcrypt';

async function createProperTestAccounts() {
  try {
    // Generate hash for the company admin password
    const adminSalt = await bcrypt.genSalt(10);
    const adminHashedPassword = await bcrypt.hash('company123', adminSalt);
    
    // Generate hash for the technician password
    const techSalt = await bcrypt.genSalt(10);
    const techHashedPassword = await bcrypt.hash('tech1234', techSalt);
    
    console.log('Creating company admin user with properly hashed password...');
    const companyAdminUser = await storage.createUser({
      username: 'companyadmin',
      email: 'admin@testcompany.com',
      password: adminHashedPassword,
      role: 'company_admin',
      companyId: 1, // Assuming company ID is 1
      active: true
    });
    
    console.log('Company admin account created successfully!');
    console.log('Login details:');
    console.log('- Email:', companyAdminUser.email);
    console.log('- Password: company123 (hashed in database)');
    
    console.log('\nCreating technician user with properly hashed password...');
    const techUser = await storage.createUser({
      username: 'techuser',
      email: 'tech@testcompany.com',
      password: techHashedPassword,
      role: 'technician',
      companyId: 1, // Assuming company ID is 1
      active: true
    });
    
    console.log('Technician user account created successfully!');
    console.log('Login details:');
    console.log('- Email:', techUser.email);
    console.log('- Password: tech1234 (hashed in database)');
    
    return { companyAdminUser, techUser };
  } catch (error) {
    console.error('Error creating test accounts:', error);
    throw error;
  }
}

// Execute the function
createProperTestAccounts()
  .then(result => {
    console.log('Test accounts created successfully with proper password hashing!');
  })
  .catch(error => {
    console.error('Failed to create test accounts:', error);
  });