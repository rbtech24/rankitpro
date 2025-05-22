// Script to create a technician user account
import { storage } from '../storage';

async function createTechnicianUser() {
  try {
    console.log('Creating technician user account...');
    const techUser = await storage.createUser({
      username: 'techuser',
      email: 'tech@testcompany.com',
      password: 'tech123',
      role: 'technician',
      companyId: 1, // Assumes the test company has ID 1
      active: true
    });
    
    console.log('Technician user account created successfully!');
    console.log('Login details:');
    console.log('- Email:', techUser.email);
    console.log('- Password: tech123');
    
    return techUser;
  } catch (error) {
    console.error('Error creating technician user:', error);
    throw error;
  }
}

// Execute the function
createTechnicianUser()
  .then(result => {
    console.log('Technician user creation completed!');
  })
  .catch(error => {
    console.error('Failed to create technician user:', error);
  });