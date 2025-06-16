/**
 * Create Support Ticket Tables
 * Creates the missing support ticket tables directly in the database
 */

import { Pool, neonConfig } from '@neondatabase/serverless';
import ws from 'ws';

neonConfig.webSocketConstructor = ws;

const pool = new Pool({ 
  connectionString: process.env.DATABASE_URL 
});

async function createSupportTables() {
  try {
    console.log('🔧 Creating support ticket tables...');
    
    // Drop and recreate support_tickets table with correct schema structure
    await pool.query(`DROP TABLE IF EXISTS support_tickets CASCADE`);
    await pool.query(`
      CREATE TABLE support_tickets (
        id SERIAL PRIMARY KEY,
        ticket_number TEXT NOT NULL UNIQUE,
        company_id INTEGER,
        submitter_id INTEGER NOT NULL,
        submitter_name TEXT NOT NULL,
        submitter_email TEXT NOT NULL,
        subject TEXT NOT NULL,
        description TEXT NOT NULL,
        category TEXT NOT NULL,
        priority TEXT DEFAULT 'medium' NOT NULL,
        status TEXT DEFAULT 'open' NOT NULL,
        assigned_to_id INTEGER,
        assigned_at TIMESTAMP,
        resolution TEXT,
        resolved_at TIMESTAMP,
        resolved_by_id INTEGER,
        attachments TEXT[],
        tags TEXT[],
        created_at TIMESTAMP DEFAULT NOW() NOT NULL,
        updated_at TIMESTAMP DEFAULT NOW() NOT NULL,
        last_response_at TIMESTAMP DEFAULT NOW() NOT NULL
      )
    `);
    
    console.log('✅ support_tickets table created');
    
    // Create support_ticket_responses table
    await pool.query(`
      CREATE TABLE IF NOT EXISTS support_ticket_responses (
        id SERIAL PRIMARY KEY,
        ticket_id INTEGER NOT NULL,
        responder_id INTEGER NOT NULL,
        responder_name VARCHAR NOT NULL,
        responder_type VARCHAR NOT NULL,
        message TEXT NOT NULL,
        is_internal BOOLEAN DEFAULT false,
        attachments TEXT[],
        created_at TIMESTAMP DEFAULT NOW()
      )
    `);
    
    console.log('✅ support_ticket_responses table created');
    
    console.log('🎉 Support ticket tables created successfully!');
    
  } catch (error) {
    console.error('❌ Error creating support tables:', error);
  } finally {
    await pool.end();
  }
}

createSupportTables();