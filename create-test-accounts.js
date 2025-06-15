import bcrypt from 'bcrypt';
import { storage } from './server/storage-simple.js';

async function createTestAccounts() {
  console.log('Creating test accounts...');
  
  try {
    // Create super admin
    const superAdmin = await storage.createUser({
      email: 'bill@mrsprinklerrepair.com',
      username: 'billsprinkler',
      password: await bcrypt.hash('TempAdmin2024!', 12),
      role: 'super_admin',
      companyId: null,
      stripeCustomerId: null,
      stripeSubscriptionId: null,
      active: true
    });
    console.log('✓ Super admin created:', superAdmin.email);

    // Create test company
    const testCompany = await storage.createCompany({
      name: 'Test Company Ltd',
      plan: 'pro',
      usageLimit: 1000,
      wordpressConfig: null,
      javaScriptEmbedConfig: null,
      reviewSettings: null,
      stripeCustomerId: null,
      stripeSubscriptionId: null
    });
    console.log('✓ Test company created:', testCompany.name);

    // Create company admin
    const companyAdmin = await storage.createUser({
      email: 'admin@testcompany.com',
      username: 'companyadmin',
      password: await bcrypt.hash('company123', 12),
      role: 'company_admin',
      companyId: testCompany.id,
      stripeCustomerId: null,
      stripeSubscriptionId: null,
      active: true
    });
    console.log('✓ Company admin created:', companyAdmin.email);

    // Create technician
    const technician = await storage.createUser({
      email: 'tech@testcompany.com',
      username: 'techuser',
      password: await bcrypt.hash('tech1234', 12),
      role: 'technician',
      companyId: testCompany.id,
      stripeCustomerId: null,
      stripeSubscriptionId: null,
      active: true
    });
    console.log('✓ Technician created:', technician.email);

    console.log('\nTest accounts created successfully!');
    console.log('\nLogin credentials:');
    console.log('Super Admin: bill@mrsprinklerrepair.com / TempAdmin2024!');
    console.log('Company Admin: admin@testcompany.com / company123');
    console.log('Technician: tech@testcompany.com / tech1234');
    
  } catch (error) {
    console.error('Error creating test accounts:', error);
  }
}

createTestAccounts();