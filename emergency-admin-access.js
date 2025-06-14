#!/usr/bin/env node

/**
 * Emergency Admin Access Recovery
 * Creates a secure temporary access route for production admin login
 */

import bcrypt from 'bcrypt';
import { nanoid } from 'nanoid';

// Generate secure emergency credentials
const emergencyToken = nanoid(32);
const emergencyPassword = 'EmergencyAccess2024!' + nanoid(8);

console.log('Emergency Admin Access Recovery');
console.log('================================');
console.log('Emergency Token:', emergencyToken);
console.log('Temporary Password:', emergencyPassword);
console.log('Admin Email: admin-1749502542878@rankitpro.system');
console.log('================================');

// Generate hash for verification
const hash = await bcrypt.hash(emergencyPassword, 12);
console.log('Password Hash:', hash);

console.log('\nNext Steps:');
console.log('1. Add emergency login route to production server');
console.log('2. Update admin password in database');
console.log('3. Test login with new credentials');
console.log('4. Remove emergency access after verification');