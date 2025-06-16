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
    
    // Create support_tickets table
    await pool.query(`
      CREATE TABLE IF NOT EXISTS support_tickets (
        id SERIAL PRIMARY KEY,
        ticket_number VARCHAR NOT NULL UNIQUE,
        title VARCHAR NOT NULL,
        description TEXT NOT NULL,
        category VARCHAR NOT NULL DEFAULT 'general',
        priority VARCHAR NOT NULL DEFAULT 'medium',
        status VARCHAR NOT NULL DEFAULT 'open',
        company_id INTEGER NOT NULL DEFAULT 0,
        submitted_by INTEGER NOT NULL,
        submitter_name VARCHAR,
        submitter_email VARCHAR,
        assigned_to INTEGER,
        resolved_by_id INTEGER,
        created_at TIMESTAMP DEFAULT NOW(),
        updated_at TIMESTAMP DEFAULT NOW(),
        resolved_at TIMESTAMP,
        last_response_at TIMESTAMP,
        tags TEXT[],
        attachments TEXT[]
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