import { storage } from './server/storage-simple.js';

async function activateAndCreateAccounts() {
  try {
    // Activate the existing super admin account
    const existingUser = await storage.getUserByEmail('bill@mrsprinklerrepair.com');
    if (existingUser) {
      await storage.updateUser(existingUser.id, { active: true });
      console.log('✅ Super admin account activated');
    }

    // Create company admin if not exists
    let companyAdmin = await storage.getUserByEmail('admin@testcompany.com');
    if (!companyAdmin) {
      const bcrypt = await import('bcrypt');
      const hashedPassword = await bcrypt.hash('company123', 10);
      
      // Create company first
      const company = await storage.createCompany({
        name: 'Test Company Ltd',
        plan: 'starter',
        usageLimit: 100
      });
      
      companyAdmin = await storage.createUser({
        email: 'admin@testcompany.com',
        username: 'companyadmin',
        password: hashedPassword,
        role: 'company_admin',
        companyId: company.id,
        active: true
      });
      console.log('✅ Company admin created');
    }

    // Create technician if not exists
    let technician = await storage.getUserByEmail('tech@testcompany.com');
    if (!technician) {
      const bcrypt = await import('bcrypt');
      const hashedPassword = await bcrypt.hash('company123', 10);
      
      technician = await storage.createUser({
        email: 'tech@testcompany.com',
        username: 'johntech',
        password: hashedPassword,
        role: 'technician',
        companyId: companyAdmin.companyId,
        active: true
      });
      console.log('✅ Technician created');
    }

    console.log('\n📋 ALL WORKING CREDENTIALS:');
    console.log('Super Admin: bill@mrsprinklerrepair.com / Temp1234');
    console.log('Company Admin: admin@testcompany.com / company123');
    console.log('Technician: tech@testcompany.com / company123');

  } catch (error) {
    console.error('Error:', error.message);
  }
}

activateAndCreateAccounts();