/**
 * Production Deployment Fix Script
 * Deploys updated routing fix to Render.com
 */

import { execSync } from 'child_process';
import fs from 'fs';

console.log('Deploying production fix to Render.com...\n');

// Check git status
console.log('1. Checking git status...');
try {
  const status = execSync('git status --porcelain', { encoding: 'utf8' });
  if (status.trim()) {
    console.log('Changes detected:', status);
    
    // Add all changes
    execSync('git add .');
    console.log('✅ Changes staged');
    
    // Commit changes
    const commitMessage = 'PRODUCTION FIX: Resolve admin login authentication failure - Update password verification and emergency diagnostics';
    execSync(`git commit -m "${commitMessage}"`);
    console.log('✅ Changes committed');
    
    // Push to trigger deployment
    execSync('git push origin main');
    console.log('✅ Changes pushed to GitHub');
    
    console.log('\n🚀 Deployment triggered on Render.com');
    console.log('📋 Changes include:');
    console.log('  - Emergency password reset endpoint');
    console.log('  - Enhanced database diagnostics'); 
    console.log('  - Authentication debugging improvements');
    
    console.log('\n⏱️  Deployment typically takes 3-5 minutes');
    console.log('🔗 Monitor progress at: https://dashboard.render.com');
    
  } else {
    console.log('No changes to deploy');
  }
} catch (error) {
  console.error('❌ Deployment failed:', error.message);
}

console.log('\n📋 Post-deployment verification steps:');
console.log('1. Wait for deployment to complete');
console.log('2. Test emergency password reset endpoint');
console.log('3. Verify admin login functionality');
console.log('4. Remove emergency endpoints after verification');