/**
 * Fix Admin Login Script
 * Creates a working super admin account with the correct password
 */

import bcrypt from 'bcrypt';
import { neon } from '@neondatabase/serverless';

async function fixAdminLogin() {
  const sql = neon(process.env.DATABASE_URL);
  
  try {
    // Hash the correct password
    const passwordHash = await bcrypt.hash('SuperAdmin2025!', 12);
    
    // Update the admin account with the correct password
    await sql`
      UPDATE users 
      SET password = ${passwordHash}
      WHERE email = 'bill@mrsprinklerrepair.com'
    `;
    
    console.log('✅ Admin password updated successfully');
    
    // Verify the account exists and is active
    const [admin] = await sql`
      SELECT id, email, role, active 
      FROM users 
      WHERE email = 'bill@mrsprinklerrepair.com'
    `;
    
    if (admin) {
      console.log('✅ Admin account verified:');
      console.log(`   Email: ${admin.email}`);
      console.log(`   Role: ${admin.role}`);
      console.log(`   Active: ${admin.active}`);
      console.log(`   Password: SuperAdmin2025!`);
    } else {
      console.log('❌ Admin account not found');
    }
    
  } catch (error) {
    console.error('❌ Error fixing admin login:', error);
  }
}

fixAdminLogin();