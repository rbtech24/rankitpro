// Script to create a test company and company admin
import { MemStorage } from './server/storage.js';

async function createTestData() {
  // Create a new instance of storage
  const storage = new MemStorage();
  
  try {
    console.log('Creating test company...');
    const company = await storage.createCompany({ 
      name: 'Test Company Ltd', 
      plan: 'pro', 
      usageLimit: 1000,
      wordpressConfig: null,
      javaScriptEmbedConfig: null,
      reviewSettings: null,
      crmIntegrations: null,
      crmSyncHistory: null
    });
    console.log('Company created with ID:', company.id);
    
    console.log('Creating company admin user...');
    const user = await storage.createUser({
      username: 'companyadmin',
      email: 'admin@testcompany.com',
      password: 'company123',
      role: 'company_admin',
      companyId: company.id,
      active: true,
      stripeCustomerId: null,
      stripeSubscriptionId: null
    });
    
    console.log('Company admin account created:');
    console.log(' - Username:', user.username);
    console.log(' - Email:', user.email);
    console.log(' - Password: company123');
    console.log(' - Company:', company.name);
    console.log(' - Role:', user.role);
    
    // Also create a test technician
    console.log('Creating test technician...');
    const technician = await storage.createTechnician({
      name: 'John Technician',
      email: 'tech@testcompany.com',
      companyId: company.id,
      phone: '555-123-4567',
      specialty: 'HVAC',
      userId: null
    });
    
    console.log('Technician created:');
    console.log(' - Name:', technician.name);
    console.log(' - Email:', technician.email);
    console.log(' - Company ID:', technician.companyId);
    
  } catch(e) {
    console.error('Error creating test data:', e);
  }
}

createTestData();