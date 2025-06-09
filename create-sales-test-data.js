import { storage } from './server/storage.ts';

async function createSalesTestData() {
  console.log('Creating sales commission test data...');

  try {
    // Create test sales representatives
    const salesPerson1 = await storage.createSalesPerson({
      name: 'Sarah Johnson',
      email: 'sarah.johnson@rankitpro.com',
      phone: '+1 (555) 123-4567',
      commissionRate: '12.5',
      isActive: true
    });

    const salesPerson2 = await storage.createSalesPerson({
      name: 'Mike Rodriguez',
      email: 'mike.rodriguez@rankitpro.com',
      phone: '+1 (555) 234-5678',
      commissionRate: '15.0',
      isActive: true
    });

    const salesPerson3 = await storage.createSalesPerson({
      name: 'Jennifer Chen',
      email: 'jennifer.chen@rankitpro.com',
      phone: '+1 (555) 345-6789',
      commissionRate: '10.0',
      isActive: true
    });

    console.log(`Created sales people: ${salesPerson1.id}, ${salesPerson2.id}, ${salesPerson3.id}`);

    // Get existing companies to assign to sales people
    const companies = await storage.getAllCompanies();
    
    if (companies.length >= 3) {
      // Assign companies to sales representatives
      await storage.assignCompanyToSalesPerson({
        salesPersonId: salesPerson1.id,
        companyId: companies[0].id
      });

      await storage.assignCompanyToSalesPerson({
        salesPersonId: salesPerson2.id,
        companyId: companies[1].id
      });

      if (companies.length > 2) {
        await storage.assignCompanyToSalesPerson({
          salesPersonId: salesPerson3.id,
          companyId: companies[2].id
        });
      }

      console.log('Assigned companies to sales representatives');

      // Create sample commissions for current and previous months
      const currentDate = new Date();
      const currentMonth = currentDate.toISOString().slice(0, 7); // YYYY-MM format
      const lastMonth = new Date(currentDate.getFullYear(), currentDate.getMonth() - 1).toISOString().slice(0, 7);

      // Current month commissions
      await storage.createCommission({
        salesPersonId: salesPerson1.id,
        companyId: companies[0].id,
        subscriptionAmount: '199.00',
        commissionAmount: '24.88',
        commissionMonth: currentMonth,
        isPaid: false
      });

      await storage.createCommission({
        salesPersonId: salesPerson2.id,
        companyId: companies[1].id,
        subscriptionAmount: '399.00',
        commissionAmount: '59.85',
        commissionMonth: currentMonth,
        isPaid: false
      });

      // Previous month commissions (some paid, some unpaid)
      await storage.createCommission({
        salesPersonId: salesPerson1.id,
        companyId: companies[0].id,
        subscriptionAmount: '199.00',
        commissionAmount: '24.88',
        commissionMonth: lastMonth,
        isPaid: true,
        paidAt: new Date(currentDate.getTime() - 5 * 24 * 60 * 60 * 1000) // 5 days ago
      });

      await storage.createCommission({
        salesPersonId: salesPerson2.id,
        companyId: companies[1].id,
        subscriptionAmount: '399.00',
        commissionAmount: '59.85',
        commissionMonth: lastMonth,
        isPaid: true,
        paidAt: new Date(currentDate.getTime() - 3 * 24 * 60 * 60 * 1000) // 3 days ago
      });

      await storage.createCommission({
        salesPersonId: salesPerson3.id,
        companyId: companies[2].id,
        subscriptionAmount: '99.00',
        commissionAmount: '9.90',
        commissionMonth: lastMonth,
        isPaid: false
      });

      console.log('Created sample commission records');

      // Update company assignments for subscription tracking
      await storage.updateCompany(companies[0].id, {
        salesPersonId: salesPerson1.id
      });

      await storage.updateCompany(companies[1].id, {
        salesPersonId: salesPerson2.id
      });

      if (companies.length > 2) {
        await storage.updateCompany(companies[2].id, {
          salesPersonId: salesPerson3.id
        });
      }

      console.log('Updated company sales assignments');
      console.log('Sales commission test data created successfully!');
      
      // Display summary
      const dashboard = await storage.getSalesDashboard();
      console.log('\nSales Dashboard Summary:');
      console.log(`Total Commissions: ${dashboard.totalCommissions}`);
      console.log(`Paid Commissions: ${dashboard.paidCommissions}`);
      console.log(`Unpaid Commissions: ${dashboard.unpaidCommissions}`);
      console.log(`Total Amount: $${dashboard.totalAmount.toFixed(2)}`);
      console.log(`Sales People: ${dashboard.salesPeople.length}`);

    } else {
      console.log('Not enough companies found to create full test data. Please create some companies first.');
    }

  } catch (error) {
    console.error('Error creating sales test data:', error);
  }
}

// Run the function directly
createSalesTestData().then(() => {
  process.exit(0);
}).catch(error => {
  console.error('Failed to create test data:', error);
  process.exit(1);
});

export { createSalesTestData };