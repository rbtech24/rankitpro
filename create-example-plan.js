// Script to create your example plan: "Blog Post 10, Technicians: 15, no testimonials, Check-ins: 200"

import pg from 'pg';
import bcrypt from 'bcrypt';

const { Pool } = pg;

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

async function createExamplePlan() {
  const client = await pool.connect();
  
  try {
    // Create the Professional Plan with your specific requirements
    const planResult = await client.query(`
      INSERT INTO subscription_plans (
        name, 
        description, 
        price, 
        billing_period, 
        max_technicians, 
        max_check_ins, 
        features, 
        is_active
      ) VALUES (
        'Professional Plan',
        'Perfect for growing businesses - Blog Posts (10), Technicians (15), Check-ins (200), No testimonials',
        99.00,
        'monthly',
        15,
        200,
        $1,
        true
      ) RETURNING id
    `, [JSON.stringify([
      'blog_posts_10',
      'advanced_reporting', 
      'priority_support',
      'custom_branding',
      'wordpress_integration'
    ])]);
    
    const planId = planResult.rows[0].id;
    console.log(`✅ Created Professional Plan with ID: ${planId}`);
    
    // Show what features are enabled vs disabled
    console.log('\n📋 Plan Features:');
    console.log('✅ Blog Posts: 10 per month');
    console.log('✅ Technicians: Up to 15');
    console.log('✅ Check-ins: Up to 200 per month');
    console.log('✅ Advanced Reporting');
    console.log('✅ Priority Support');
    console.log('✅ Custom Branding');
    console.log('✅ WordPress Integration');
    console.log('❌ Audio Testimonials (blocked)');
    console.log('❌ Video Testimonials (blocked)');
    console.log('❌ Testimonial Collection (blocked)');
    
    // Create test company and assign to this plan
    const companyResult = await client.query(`
      INSERT INTO companies (
        name,
        email,
        subscription_plan_id,
        is_active
      ) VALUES (
        'Test Company - Professional Plan',
        'test@example.com',
        $1,
        true
      ) RETURNING id
    `, [planId]);
    
    const companyId = companyResult.rows[0].id;
    console.log(`✅ Created test company with ID: ${companyId}`);
    
    // Create company admin user
    const hashedPassword = await bcrypt.hash('testpassword123', 10);
    
    await client.query(`
      INSERT INTO users (
        email,
        password_hash,
        role,
        company_id,
        name,
        is_active
      ) VALUES (
        'admin@testcompany.com',
        $1,
        'company_admin',
        $2,
        'Test Admin',
        true
      )
    `, [hashedPassword, companyId]);
    
    console.log('✅ Created company admin user: admin@testcompany.com (password: testpassword123)');
    
    return {
      planId,
      companyId,
      features: [
        'blog_posts_10',
        'advanced_reporting', 
        'priority_support',
        'custom_branding',
        'wordpress_integration'
      ],
      limits: {
        maxTechnicians: 15,
        maxCheckIns: 200,
        blogPosts: 10
      }
    };
    
  } catch (error) {
    console.error('❌ Error creating plan:', error);
    throw error;
  } finally {
    client.release();
  }
}

// Test the plan restrictions
async function testPlanRestrictions(companyId) {
  const client = await pool.connect();
  
  try {
    console.log('\n🧪 Testing Plan Restrictions...');
    
    // Test 1: Check current usage
    const checkInsCount = await client.query(`
      SELECT COUNT(*) as count 
      FROM check_ins 
      WHERE company_id = $1 
      AND EXTRACT(MONTH FROM created_at) = EXTRACT(MONTH FROM CURRENT_DATE)
      AND EXTRACT(YEAR FROM created_at) = EXTRACT(YEAR FROM CURRENT_DATE)
    `, [companyId]);
    
    const techniciansCount = await client.query(`
      SELECT COUNT(*) as count FROM technicians WHERE company_id = $1
    `, [companyId]);
    
    console.log(`📊 Current Usage:`);
    console.log(`   Check-ins this month: ${checkInsCount.rows[0].count}/200`);
    console.log(`   Technicians: ${techniciansCount.rows[0].count}/15`);
    
    // Test 2: Feature availability
    const plan = await client.query(`
      SELECT features FROM subscription_plans 
      WHERE id = (SELECT subscription_plan_id FROM companies WHERE id = $1)
    `, [companyId]);
    
    const features = plan.rows[0].features;
    console.log('\n🔐 Feature Access Control:');
    console.log(`   Blog posts: ${features.includes('blog_posts_10') ? '✅ Allowed (10/month)' : '❌ Blocked'}`);
    console.log(`   Video testimonials: ${features.includes('video_testimonials') ? '✅ Allowed' : '❌ Blocked'}`);
    console.log(`   Audio testimonials: ${features.includes('audio_testimonials') ? '✅ Allowed' : '❌ Blocked'}`);
    console.log(`   Advanced reporting: ${features.includes('advanced_reporting') ? '✅ Allowed' : '❌ Blocked'}`);
    
  } catch (error) {
    console.error('❌ Error testing restrictions:', error);
  } finally {
    client.release();
  }
}

// Run the demonstration
async function main() {
  console.log('🚀 Creating Example Professional Plan');
  console.log('📝 Plan Specs: Blog Posts (10), Technicians (15), Check-ins (200), No testimonials\n');
  
  try {
    const result = await createExamplePlan();
    await testPlanRestrictions(result.companyId);
    
    console.log('\n✅ Example plan created successfully!');
    console.log('\n📖 How to use:');
    console.log('1. Login as admin@testcompany.com (password: testpassword123)');
    console.log('2. Try adding 16th technician - should be blocked');
    console.log('3. Try creating 201st check-in - should be blocked');
    console.log('4. Access testimonial features - should be hidden/blocked');
    console.log('5. Blog posts should work up to 10 per month');
    
  } catch (error) {
    console.error('❌ Failed to create example plan:', error);
  } finally {
    await pool.end();
  }
}

if (require.main === module) {
  main();
}

module.exports = { createExamplePlan, testPlanRestrictions };