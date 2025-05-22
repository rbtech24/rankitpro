// Script to fix the test accounts
import { storage } from '../storage';

async function fixTestAccounts() {
  try {
    // Create company admin again with correct details
    console.log('Creating updated company admin user...');
    const companyAdminUser = await storage.createUser({
      username: 'companyadmin',
      email: 'admin@testcompany.com',
      password: 'company123',
      role: 'company_admin',
      companyId: 1, // Assuming company ID is 1
      active: true
    });
    
    console.log('Company admin account updated successfully!');
    console.log('Login details:');
    console.log('- Email:', companyAdminUser.email);
    console.log('- Password: company123');
    
    // Create technician user with 8+ character password
    console.log('\nCreating updated technician user...');
    const techUser = await storage.createUser({
      username: 'techuser',
      email: 'tech@testcompany.com',
      password: 'tech1234',
      role: 'technician',
      companyId: 1, // Assuming company ID is 1
      active: true
    });
    
    console.log('Technician user account updated successfully!');
    console.log('Login details:');
    console.log('- Email:', techUser.email);
    console.log('- Password: tech1234');
    
    return { companyAdminUser, techUser };
  } catch (error) {
    console.error('Error updating test accounts:', error);
    throw error;
  }
}

// Execute the function
fixTestAccounts()
  .then(result => {
    console.log('Test accounts updated successfully!');
  })
  .catch(error => {
    console.error('Failed to update test accounts:', error);
  });