// Create guaranteed working test accounts
import { storage } from '../storage';
import bcrypt from 'bcrypt';

async function createGuaranteedAccounts() {
  try {
    console.log('Creating guaranteed test accounts');
    
    // Step 1: Create test company
    console.log('Step 1: Creating test company');
    const company = await storage.createCompany({
      name: 'Test Company Ltd',
      plan: 'pro',
      usageLimit: 1000
    });
    console.log(`Company created with ID: ${company.id}`);
    
    // Step 2: Create company admin with VERIFIED hash
    console.log('\nStep 2: Creating company admin');
    const adminPassword = 'company123';
    const adminHash = await bcrypt.hash(adminPassword, 10);
    
    // Verify the hash works with our password
    const adminVerify = await bcrypt.compare(adminPassword, adminHash);
    console.log(`Admin password hash verification: ${adminVerify ? 'SUCCESS' : 'FAILED'}`);
    
    const adminUser = await storage.createUser({
      username: 'companyadmin',
      email: 'admin@testcompany.com',
      password: adminHash,
      role: 'company_admin',
      companyId: company.id,
      active: true
    });
    
    console.log(`Admin user created with ID: ${adminUser.id}`);
    console.log(`Email: ${adminUser.email}`);
    console.log(`Password: ${adminPassword}`);
    
    // Step 3: Create technician user with VERIFIED hash
    console.log('\nStep 3: Creating technician user');
    const techPassword = 'tech1234';
    const techHash = await bcrypt.hash(techPassword, 10);
    
    // Verify the hash works with our password
    const techVerify = await bcrypt.compare(techPassword, techHash);
    console.log(`Tech password hash verification: ${techVerify ? 'SUCCESS' : 'FAILED'}`);
    
    const techUser = await storage.createUser({
      username: 'techuser',
      email: 'tech@testcompany.com',
      password: techHash,
      role: 'technician',
      companyId: company.id,
      active: true
    });
    
    console.log(`Tech user created with ID: ${techUser.id}`);
    console.log(`Email: ${techUser.email}`);
    console.log(`Password: ${techPassword}`);
    
    // Step 4: Create technician profile
    console.log('\nStep 4: Creating technician profile');
    const technician = await storage.createTechnician({
      name: 'John Technician',
      email: 'tech@testcompany.com',
      companyId: company.id,
      phone: '555-123-4567',
      specialty: 'HVAC'
    });
    
    console.log(`Technician profile created with ID: ${technician.id}`);
    
    // Step 5: Verify accounts exist and passwords work
    console.log('\nStep 5: Verifying accounts');
    
    const adminCheck = await storage.getUserByEmail('admin@testcompany.com');
    console.log(`Admin account check: ${adminCheck ? 'EXISTS' : 'MISSING'}`);
    
    const techCheck = await storage.getUserByEmail('tech@testcompany.com');
    console.log(`Tech account check: ${techCheck ? 'EXISTS' : 'MISSING'}`);
    
    if (adminCheck) {
      const adminPwCheck = await bcrypt.compare(adminPassword, adminCheck.password);
      console.log(`Admin password verification: ${adminPwCheck ? 'SUCCESS' : 'FAILED'}`);
    }
    
    if (techCheck) {
      const techPwCheck = await bcrypt.compare(techPassword, techCheck.password);
      console.log(`Tech password verification: ${techPwCheck ? 'SUCCESS' : 'FAILED'}`);
    }
    
    return { company, adminUser, techUser, technician };
  } catch (error) {
    console.error('Error creating guaranteed accounts:', error);
    throw error;
  }
}

// Execute the function
createGuaranteedAccounts()
  .then((result) => {
    console.log('\nTest accounts creation SUCCESSFUL!');
    console.log('You can now log in with:');
    console.log('- Admin: admin@testcompany.com / company123');
    console.log('- Tech: tech@testcompany.com / tech1234');
  })
  .catch(error => {
    console.error('Failed to create guaranteed accounts:', error);
  });