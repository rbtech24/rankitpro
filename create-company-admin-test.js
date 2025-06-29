/**
 * Create Company Admin Test Account
 * Creates a company admin account specifically for testing the embed generator
 */

import pkg from 'pg';
const { Pool } = pkg;
import bcrypt from 'bcrypt';

async function createCompanyAdminTest() {
  const client = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false
  });

  try {
    await client.connect();
    console.log('✅ Connected to database');

    // Create a test company first
    const companyResult = await client.query(`
      INSERT INTO companies (name, plan, email, phone_number, address, city, state, zip_code, is_active)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
      ON CONFLICT (email) DO UPDATE SET
        name = EXCLUDED.name,
        plan = EXCLUDED.plan,
        is_active = EXCLUDED.is_active
      RETURNING id, name, email
    `, [
      'Embed Test Company',
      'pro',
      'embed@testcompany.com',
      '555-0123',
      '123 Test Street',
      'Test City',
      'CA',
      '90210',
      true
    ]);

    const company = companyResult.rows[0];
    console.log('✅ Company created/updated:', company);

    // Hash password for company admin
    const hashedPassword = await bcrypt.hash('EmbedTest2025!', 10);

    // Create company admin user
    const userResult = await client.query(`
      INSERT INTO users (email, password_hash, role, company_id, name, is_active)
      VALUES ($1, $2, $3, $4, $5, $6)
      ON CONFLICT (email) DO UPDATE SET
        password_hash = EXCLUDED.password_hash,
        role = EXCLUDED.role,
        company_id = EXCLUDED.company_id,
        name = EXCLUDED.name,
        is_active = EXCLUDED.is_active
      RETURNING id, email, role, company_id, name
    `, [
      'embed@testcompany.com',
      hashedPassword,
      'company_admin',
      company.id,
      'Embed Test Admin',
      true
    ]);

    const user = userResult.rows[0];
    console.log('✅ Company admin created/updated:', user);

    // Create API credentials for the company (needed for embed generator)
    await client.query(`
      INSERT INTO api_credentials (company_id, api_key, created_at)
      VALUES ($1, $2, NOW())
      ON CONFLICT (company_id) DO UPDATE SET
        api_key = EXCLUDED.api_key,
        created_at = NOW()
    `, [company.id, `test_${Date.now()}_${Math.random().toString(36).substring(7)}`]);

    console.log('✅ API credentials created for embed functionality');

    console.log('\n🎯 COMPANY ADMIN TEST CREDENTIALS:');
    console.log('Email: embed@testcompany.com');
    console.log('Password: EmbedTest2025!');
    console.log('Role: company_admin');
    console.log('Company: Embed Test Company');
    console.log('\n📝 Access Instructions:');
    console.log('1. Go to the login page');
    console.log('2. Use the credentials above');
    console.log('3. Navigate to /embed-generator');
    console.log('4. The page should load with full embed functionality');

  } catch (error) {
    console.error('❌ Error creating company admin test account:', error);
  } finally {
    await client.end();
  }
}

createCompanyAdminTest().catch(console.error);