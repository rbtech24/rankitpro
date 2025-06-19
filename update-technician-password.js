/**
 * Update Technician Password
 * Fixes the technician login credentials
 */

import bcrypt from 'bcrypt';
import { neon } from '@neondatabase/serverless';

const sql = neon(process.env.DATABASE_URL);

async function updateTechnicianPassword() {
  try {
    console.log('🔧 Updating technician password...');
    
    // Hash the new password
    const hashedPassword = await bcrypt.hash('Tech2024!', 10);
    
    // Update technician password
    const result = await sql`
      UPDATE users 
      SET password = ${hashedPassword}
      WHERE email = 'john.smith@acmeservices.com'
      RETURNING id, email, username, role
    `;
    
    if (result.length > 0) {
      console.log('✅ Technician password updated:', result[0]);
      
      // Test login
      const testPassword = await bcrypt.compare('Tech2024!', hashedPassword);
      console.log('🔐 Password test:', testPassword ? 'PASS' : 'FAIL');
      
    } else {
      console.log('❌ No technician found to update');
    }
    
  } catch (error) {
    console.error('❌ Error updating password:', error.message);
  }
}

updateTechnicianPassword();