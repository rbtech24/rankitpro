/**
 * Production Database Verification Script
 * Verifies database connection and creates missing schema if needed
 */

import { Pool } from 'pg';

async function verifyAndFixProductionDatabase() {
  console.log('🔍 Starting production database verification...');
  
  // This should be your Neon database URL
  const neonUrl = process.env.DATABASE_URL;
  
  if (!neonUrl) {
    console.error('❌ DATABASE_URL environment variable not set');
    return;
  }
  
  console.log('📊 Database URL configured:', neonUrl.replace(/:[^:@]*@/, ':****@'));
  
  const pool = new Pool({
    connectionString: neonUrl,
    ssl: neonUrl.includes('neon.tech') || neonUrl.includes('render.com') ? { rejectUnauthorized: false } : false
  });
  
  try {
    console.log('🔗 Testing database connection...');
    const client = await pool.connect();
    
    // Check current database and schema
    const dbInfo = await client.query('SELECT current_database(), current_schema()');
    console.log('📋 Connected to database:', dbInfo.rows[0].current_database);
    console.log('📋 Current schema:', dbInfo.rows[0].current_schema);
    
    // Check if users table exists
    const tableCheck = await client.query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' AND table_name = 'users'
    `);
    
    if (tableCheck.rows.length === 0) {
      console.log('❌ Users table does not exist - creating schema...');
      await createProductionSchema(client);
    } else {
      console.log('✅ Users table exists');
      
      // Check if admin user exists
      const adminCheck = await client.query(`
        SELECT id, email, role 
        FROM users 
        WHERE email = 'bill@mrsprinklerrepair.com'
      `);
      
      if (adminCheck.rows.length === 0) {
        console.log('❌ Admin user does not exist - creating...');
        await client.query(`
          INSERT INTO users (email, username, password, role, active, created_at) 
          VALUES (
            'bill@mrsprinklerrepair.com',
            'billsprinkler1',
            '$2b$12$oZgSKNhwzWBVGXJEPyZ9S.sTDGgmU/eMWJQmLKIJvFDFAjkq2vI4u',
            'super_admin',
            true,
            NOW()
          )
        `);
        console.log('✅ Admin user created');
      } else {
        console.log('✅ Admin user exists:', adminCheck.rows[0]);
      }
    }
    
    client.release();
    console.log('🎉 Production database verification completed successfully');
    
  } catch (error) {
    console.error('❌ Database verification failed:', error.message);
    console.error('🔧 Troubleshooting:');
    console.error('  1. Verify DATABASE_URL is set correctly in Render environment');
    console.error('  2. Ensure database is accessible from Render servers');
    console.error('  3. Check SSL configuration requirements');
  } finally {
    await pool.end();
  }
}

async function createProductionSchema(client) {
  console.log('🏗️ Creating production database schema...');
  
  const schemas = [
    `CREATE TABLE IF NOT EXISTS companies (
      id SERIAL PRIMARY KEY,
      name TEXT NOT NULL,
      domain TEXT,
      slug TEXT UNIQUE,
      address TEXT,
      phone TEXT,
      email TEXT,
      logo_url TEXT,
      created_at TIMESTAMP DEFAULT NOW(),
      subscription_status TEXT DEFAULT 'trial',
      subscription_plan TEXT DEFAULT 'starter',
      trial_ends_at TIMESTAMP,
      monthly_ai_limit INTEGER DEFAULT 10,
      ai_usage_count INTEGER DEFAULT 0,
      wordpress_url TEXT,
      wordpress_username TEXT,
      wordpress_password TEXT,
      social_media_accounts JSONB DEFAULT '{}',
      company_settings JSONB DEFAULT '{}'
    )`,
    
    `CREATE TABLE IF NOT EXISTS users (
      id SERIAL PRIMARY KEY,
      email TEXT NOT NULL UNIQUE,
      username TEXT NOT NULL UNIQUE,
      password TEXT NOT NULL,
      role TEXT NOT NULL DEFAULT 'technician' CHECK (role IN ('super_admin', 'company_admin', 'technician')),
      company_id INTEGER REFERENCES companies(id),
      stripe_customer_id TEXT,
      stripe_subscription_id TEXT,
      active BOOLEAN NOT NULL DEFAULT true,
      created_at TIMESTAMP DEFAULT NOW(),
      notification_preferences JSONB DEFAULT '{"emailNotifications": true, "newCheckIns": true, "newBlogPosts": true, "reviewRequests": true, "billingUpdates": true, "pushNotifications": true, "notificationSound": true}',
      appearance_preferences JSONB DEFAULT '{"theme": "light", "language": "en", "timezone": "UTC", "defaultView": "dashboard"}'
    )`,
    
    `CREATE TABLE IF NOT EXISTS session (
      sid TEXT PRIMARY KEY,
      sess JSONB NOT NULL,
      expire TIMESTAMP NOT NULL
    )`
  ];
  
  for (const schema of schemas) {
    await client.query(schema);
  }
  
  console.log('✅ Core schema created successfully');
}

// Run the verification
verifyAndFixProductionDatabase().catch(console.error);