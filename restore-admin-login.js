/**
 * Restore Super Admin Login Access
 * Creates a working super admin account directly in the database
 */

import bcrypt from 'bcrypt';
import { Pool, neonConfig } from '@neondatabase/serverless';
import ws from 'ws';

neonConfig.webSocketConstructor = ws;

const pool = new Pool({ 
  connectionString: process.env.DATABASE_URL 
});

async function restoreAdminLogin() {
  try {
    console.log('🔧 Restoring super admin login access...');
    
    // Create a properly hashed password
    const plainPassword = 'Admin2024!';
    const hashedPassword = await bcrypt.hash(plainPassword, 12);
    
    console.log('✅ Password hashed successfully');
    
    // Insert or update the super admin user
    const result = await pool.query(`
      INSERT INTO users (username, email, password, role, created_at)
      VALUES ($1, $2, $3, $4, NOW())
      ON CONFLICT (email) DO UPDATE SET
        password = $3,
        role = $4
      RETURNING id, username, email, role
    `, ['superadmin', 'admin@rankitpro.com', hashedPassword, 'super_admin']);
    
    console.log('✅ Super admin account created/updated:', result.rows[0]);
    
    // Test the login credentials
    const testUser = await pool.query('SELECT * FROM users WHERE email = $1', ['admin@rankitpro.com']);
    
    if (testUser.rows.length > 0) {
      const user = testUser.rows[0];
      const passwordMatch = await bcrypt.compare(plainPassword, user.password);
      
      console.log('🔐 Login test results:');
      console.log('  Email:', user.email);
      console.log('  Role:', user.role);
      console.log('  Password matches:', passwordMatch);
      
      if (passwordMatch) {
        console.log('🎉 Super admin login restored successfully!');
        console.log('');
        console.log('Login credentials:');
        console.log('  Email: admin@rankitpro.com');
        console.log('  Password: Admin2024!');
        console.log('');
      } else {
        console.log('❌ Password verification failed');
      }
    }
    
  } catch (error) {
    console.error('❌ Error restoring admin login:', error);
  } finally {
    await pool.end();
  }
}

restoreAdminLogin();