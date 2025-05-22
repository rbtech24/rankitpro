// Script to create a test company and admin account
import { storage } from '../storage';

async function createTestData() {
  try {
    // Create test company
    console.log('Creating test company...');
    const company = await storage.createCompany({ 
      name: 'Test Company Ltd', 
      plan: 'pro', 
      usageLimit: 1000 
    });
    console.log('Company created with ID:', company.id);
    
    // Create company admin
    console.log('Creating company admin user...');
    const user = await storage.createUser({
      username: 'companyadmin',
      email: 'admin@testcompany.com',
      password: 'company123',
      role: 'company_admin',
      companyId: company.id,
      active: true
    });
    
    console.log('Company admin account created successfully!');
    console.log('Login details:');
    console.log('- Username:', user.username);
    console.log('- Password: company123');
    console.log('- Company:', company.name);
    
    // Create a test technician for this company
    console.log('\nCreating test technician...');
    const technician = await storage.createTechnician({
      name: 'John Technician',
      email: 'tech@testcompany.com',
      companyId: company.id,
      phone: '555-123-4567',
      specialty: 'HVAC'
    });
    
    console.log('Technician created with ID:', technician.id);
    
    return { company, user, technician };
  } catch (error) {
    console.error('Error creating test data:', error);
    throw error;
  }
}

// Execute the function
createTestData()
  .then(result => {
    console.log('Test data created successfully!');
  })
  .catch(error => {
    console.error('Failed to create test data:', error);
  });