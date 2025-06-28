// Script to reset and properly create test accounts
import { storage } from '../storage';
import bcrypt from 'bcrypt';

async function resetTestAccounts() {
  try {
    // Create test company (or use existing)
    console.log('Setting up test company...');
    let company;
    const existingCompany = await storage.getCompanyByName('Test Company Ltd');
    
    if (existingCompany) {
      company = existingCompany;
      console.log('Using existing company:', company.name, 'ID:', company.id);
    } else {
      company = await storage.createCompany({ 
        name: 'Test Company Ltd', 
        plan: 'pro', 
        usageLimit: 1000 
      });
      console.log('Created new company:', company.name, 'ID:', company.id);
    }

    // Generate proper hashed passwords
    const adminPassword = 'company123';
    const techPassword = 'tech1234';
    
    const adminHash = await bcrypt.hash(adminPassword, 10);
    const techHash = await bcrypt.hash(techPassword, 10);

    // Check for existing users and create or update them
    console.log('\nCreating admin account...');
    const adminEmail = 'admin@testcompany.com';
    const existingAdmin = await storage.getUserByEmail(adminEmail);
    
    let adminUser;
    
    if (existingAdmin) {
      // Update existing admin
      adminUser = await storage.updateUser(existingAdmin.id, {
        password: adminHash,
        active: true
      });
      console.log('Updated existing admin account');
    } else {
      // Create new admin
      adminUser = await storage.createUser({
        username: 'companyadmin',
        email: adminEmail,
        password: adminHash,
        role: 'company_admin',
        companyId: company.id,
        active: true
      });
      console.log('Created new admin account');
    }
    
    console.log('Admin account ready:');
    console.log('- Email:', adminEmail);
    console.log('- Password:', adminPassword);
    
    // Handle technician account
    console.log('\nCreating technician account...');
    const techEmail = 'tech@testcompany.com';
    const existingTech = await storage.getUserByEmail(techEmail);
    
    let techUser;
    
    if (existingTech) {
      // Update existing tech
      techUser = await storage.updateUser(existingTech.id, {
        password: techHash,
        active: true
      });
      console.log('Updated existing technician account');
    } else {
      // Create new tech user
      techUser = await storage.createUser({
        username: 'techuser',
        email: techEmail,
        password: techHash,
        role: 'technician',
        companyId: company.id,
        active: true
      });
      console.log('Created new technician account');
    }
    
    console.log('Technician account ready:');
    console.log('- Email:', techEmail);
    console.log('- Password:', techPassword);
    
    // Create technician profile if needed
    const existingTechProfile = await storage.getTechnicianByEmail(techEmail);
    
    if (!existingTechProfile) {
      const techProfile = await storage.createTechnician({
        name: 'John Technician',
        email: techEmail,
        companyId: company.id,
        phone: '555-123-4567',
        specialty: 'HVAC'
      });
      console.log('Created technician profile:', techProfile.name);
    } else {
      console.log('Using existing technician profile');
    }
    
    return { company, adminUser, techUser };
  } catch (error) {
    console.error('Error in reset-test-accounts:', error);
    throw error;
  }
}

// Execute the function
resetTestAccounts()
  .then(() => {
    console.log('\nTest accounts reset successfully!');
    console.log('You can now log in with the following credentials:');
    console.log('Admin: admin@testcompany.com / company123');
    console.log('Tech: tech@testcompany.com / tech1234');
  })
  .catch(error => {
    console.error('Failed to reset test accounts:', error);
  });