// Create direct users to the memory storage
import { storage } from '../storage';
import bcrypt from 'bcrypt';

async function createDirectUsers() {
  try {
    console.log('=== CREATING DIRECT USERS ===');
    
    // Create hashed passwords
    const adminPassword = 'company123';
    const techPassword = 'tech1234';
    
    const adminHash = await bcrypt.hash(adminPassword, 10);
    const techHash = await bcrypt.hash(techPassword, 10);
    
    // Access the internal storage maps directly
    const memStorage = storage as any;
    
    // Create company
    const companyId = memStorage.companyId++;
    const company = {
      id: companyId,
      name: 'Test Company XYZ',
      plan: 'pro',
      usageLimit: 1000,
      createdAt: new Date()
    };
    
    memStorage.companies.set(companyId, company);
    console.log(`Company created directly with ID: ${companyId}`);
    
    // Create company admin
    const adminId = memStorage.userId++;
    const adminUser = {
      id: adminId,
      username: 'testadmin',
      email: 'admin@testcompany.com',
      password: adminHash,
      role: 'company_admin',
      companyId: companyId,
      active: true,
      createdAt: new Date()
    };
    
    memStorage.users.set(adminId, adminUser);
    console.log(`Admin created directly with ID: ${adminId}`);
    
    // Create technician user
    const techId = memStorage.userId++;
    const techUser = {
      id: techId,
      username: 'testtechnician',
      email: 'tech@testcompany.com',
      password: techHash,
      role: 'technician',
      companyId: companyId,
      active: true,
      createdAt: new Date()
    };
    
    memStorage.users.set(techId, techUser);
    console.log(`Technician created directly with ID: ${techId}`);
    
    // Create technician profile
    const technicianProfileId = memStorage.technicianId++;
    const technicianProfile = {
      id: technicianProfileId,
      name: 'John Doe',
      email: 'tech@testcompany.com',
      companyId: companyId,
      phone: '555-123-4567',
      specialty: 'HVAC',
      createdAt: new Date()
    };
    
    memStorage.technicians.set(technicianProfileId, technicianProfile);
    console.log(`Technician profile created with ID: ${technicianProfileId}`);
    
    // Verification
    console.log('\nVerifying accounts:');
    const allUsers = Array.from(memStorage.users.values());
    console.log(`Total users: ${allUsers.length}`);
    
    const adminCheck = await storage.getUserByEmail('admin@testcompany.com');
    console.log(`Admin found: ${adminCheck ? 'YES' : 'NO'}`);
    
    const techCheck = await storage.getUserByEmail('tech@testcompany.com');
    console.log(`Tech found: ${techCheck ? 'YES' : 'NO'}`);
    
    // Test login
    if (adminCheck) {
      const adminLoginCheck = await bcrypt.compare(adminPassword, adminCheck.password);
      console.log(`Admin login check: ${adminLoginCheck ? 'WORKS' : 'FAILS'}`);
    }
    
    if (techCheck) {
      const techLoginCheck = await bcrypt.compare(techPassword, techCheck.password);
      console.log(`Tech login check: ${techLoginCheck ? 'WORKS' : 'FAILS'}`);
    }
    
    return { adminUser, techUser, company };
  } catch (error) {
    console.error('Error in direct user creation:', error);
    throw error;
  }
}

// Run the function
createDirectUsers()
  .then(result => {
    console.log('\nDirect user creation completed successfully!');
    console.log('You can log in with:');
    console.log('Admin: admin@testcompany.com / company123');
    console.log('Tech: tech@testcompany.com / tech1234');
  })
  .catch(error => {
    console.error('Direct user creation failed:', error);
  });