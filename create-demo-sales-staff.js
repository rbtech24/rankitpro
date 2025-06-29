/**
 * Create Demo Sales Staff Account
 * Creates a working sales staff account to test the complete workflow
 */

import { Pool } from 'pg';
import bcrypt from 'bcrypt';

async function createDemoSalesStaff() {
  const client = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false
  });

  try {
    await client.connect();
    console.log('🔌 Connected to database');

    // Hash password for sales staff
    const hashedPassword = await bcrypt.hash('SalesDemo2025!', 10);
    
    // Create sales staff user
    const userResult = await client.query(`
      INSERT INTO users (email, username, password, role, active, created_at)
      VALUES ($1, $2, $3, $4, $5, NOW())
      ON CONFLICT (email) DO UPDATE SET
        username = EXCLUDED.username,
        password = EXCLUDED.password,
        role = EXCLUDED.role,
        active = EXCLUDED.active
      RETURNING id, email, username, role
    `, [
      'demo@salesstaff.com',
      'demosales',
      hashedPassword,
      'sales_staff',
      true
    ]);

    const salesUser = userResult.rows[0];
    console.log('✅ Created sales staff user:', salesUser);

    // Create sales person record
    await client.query(`
      INSERT INTO sales_people (user_id, name, email, phone, commission_rate, is_active, total_earnings, pending_commissions, created_at, updated_at)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, NOW(), NOW())
    `, [
      salesUser.id,
      'Demo Sales Staff',
      'demo@salesstaff.com',
      '+1-555-0123',
      '0.15', // 15% commission rate
      true,
      '0.00',
      '0.00'
    ]);

    console.log('✅ Created sales person record');

    // Create some demo customer assignments
    const demoCompanies = await client.query(`
      SELECT id, name FROM companies LIMIT 3
    `);

    if (demoCompanies.rows.length > 0) {
      for (const company of demoCompanies.rows) {
        await client.query(`
          INSERT INTO sales_customer_assignments (sales_person_id, company_id, subscription_plan, initial_plan_price, current_plan_price, billing_period, status, created_at, updated_at)
          VALUES ($1, $2, $3, $4, $5, $6, $7, NOW(), NOW())
          ON CONFLICT (sales_person_id, company_id) DO UPDATE SET
            subscription_plan = EXCLUDED.subscription_plan,
            current_plan_price = EXCLUDED.current_plan_price,
            updated_at = NOW()
        `, [
          salesUser.id,
          company.id,
          'pro',
          '99.00',
          '99.00',
          'monthly',
          'active'
        ]);

        // Create demo commission record
        await client.query(`
          INSERT INTO sales_commissions (sales_person_id, company_id, commission_rate, amount, base_amount, billing_period, payment_date, type, status, created_at, updated_at)
          VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, NOW(), NOW())
        `, [
          salesUser.id,
          company.id,
          '0.15',
          '14.85', // 15% of $99
          '99.00',
          'monthly',
          new Date(),
          'signup',
          'pending'
        ]);
      }

      console.log(`✅ Created demo customer assignments for ${demoCompanies.rows.length} companies`);
    }

    console.log('\n🎉 Demo Sales Staff Account Created Successfully!');
    console.log('📧 Email: demo@salesstaff.com');
    console.log('🔑 Password: SalesDemo2025!');
    console.log('👤 Role: sales_staff');
    console.log('💰 Commission Rate: 15%');
    console.log('\nYou can now test the sales staff dashboard at /sales-dashboard');

  } catch (error) {
    console.error('❌ Error creating demo sales staff:', error);
  } finally {
    await client.end();
  }
}

createDemoSalesStaff();