import { storage } from './server/storage.ts';

async function createMultipleCompanies() {
  console.log('Creating multiple test companies...');

  try {
    // Create three companies with different plans
    const company1 = await storage.createCompany({
      name: 'Premium Home Services LLC',
      plan: 'pro',
      usageLimit: 200
    });

    const company2 = await storage.createCompany({
      name: 'Elite Property Solutions',
      plan: 'agency', 
      usageLimit: 500
    });

    const company3 = await storage.createCompany({
      name: 'Quick Fix Home Repair',
      plan: 'starter',
      usageLimit: 50
    });

    console.log(`Created companies: ${company1.id}, ${company2.id}, ${company3.id}`);

    // Create a few more companies for comprehensive testing
    const company4 = await storage.createCompany({
      name: 'Metro Maintenance Corp',
      plan: 'pro',
      usageLimit: 200
    });

    const company5 = await storage.createCompany({
      name: 'Reliable Home Care',
      plan: 'starter',
      usageLimit: 50
    });

    console.log(`Additional companies created: ${company4.id}, ${company5.id}`);
    console.log('Multiple test companies created successfully!');

  } catch (error) {
    console.error('Error creating companies:', error);
  }
}

createMultipleCompanies().then(() => {
  process.exit(0);
}).catch(error => {
  console.error('Failed to create companies:', error);
  process.exit(1);
});

export { createMultipleCompanies };