/**
 * Create Working Technician Account
 * Creates a functional technician for production testing
 */

import bcrypt from 'bcrypt';
import { neon } from '@neondatabase/serverless';

const sql = neon(process.env.DATABASE_URL);

async function createWorkingTechnician() {
  try {
    console.log('🔧 Creating working technician account...');
    
    // Hash password
    const hashedPassword = await bcrypt.hash('Tech2024!', 10);
    
    // Check if technician exists
    const existing = await sql`
      SELECT id FROM users WHERE email = 'john.smith@acmeservices.com'
    `;
    
    if (existing.length > 0) {
      // Update existing technician
      const result = await sql`
        UPDATE users 
        SET password = ${hashedPassword}, active = true
        WHERE email = 'john.smith@acmeservices.com'
        RETURNING id, email, username, role
      `;
      console.log('✅ Technician updated:', result[0]);
    } else {
      // Create new technician
      const result = await sql`
        INSERT INTO users (email, username, password, role, company_id, active)
        VALUES ('john.smith@acmeservices.com', 'johnsmith', ${hashedPassword}, 'technician', 14, true)
        RETURNING id, email, username, role
      `;
      console.log('✅ Technician created:', result[0]);
    }
    
    // Test login
    console.log('🔐 Testing login credentials...');
    const response = await fetch('http://localhost:5000/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: 'john.smith@acmeservices.com',
        password: 'Tech2024!'
      })
    });
    
    if (response.status === 200) {
      const user = await response.json();
      console.log('✅ Login test successful:', user.email, user.role);
    } else {
      console.log('❌ Login test failed:', response.status);
    }
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  }
}

createWorkingTechnician();