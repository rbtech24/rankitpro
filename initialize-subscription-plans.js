import { Pool } from '@neondatabase/serverless';

const pool = new Pool({ connectionString: process.env.DATABASE_URL });

async function initializeSubscriptionPlans() {
  const client = await pool.connect();
  
  try {
    // Check if subscription plans already exist
    const existingPlans = await client.query('SELECT COUNT(*) FROM subscription_plans');
    const planCount = parseInt(existingPlans.rows[0].count);
    
    if (planCount > 0) {
      console.log(`Found ${planCount} existing subscription plans. Skipping initialization.`);
      return;
    }

    console.log('Initializing subscription plans...');

    // Create the three predefined subscription plans
    const plans = [
      {
        name: 'Starter',
        price: '29.00',
        billingPeriod: 'monthly',
        maxTechnicians: 5,
        maxCheckIns: 100,
        features: JSON.stringify([
          'Basic check-in tracking',
          'Photo uploads',
          'Email review requests',
          'Basic analytics',
          'WordPress integration'
        ]),
        isActive: true
      },
      {
        name: 'Professional',
        price: '79.00',
        billingPeriod: 'monthly',
        maxTechnicians: 15,
        maxCheckIns: 500,
        features: JSON.stringify([
          'All Starter features',
          'Advanced analytics',
          'Custom branding',
          'Audio testimonials',
          'Priority support',
          'API access'
        ]),
        isActive: true
      },
      {
        name: 'Agency',
        price: '149.00',
        billingPeriod: 'monthly',
        maxTechnicians: -1, // Unlimited
        maxCheckIns: -1, // Unlimited
        features: JSON.stringify([
          'All Professional features',
          'Unlimited technicians',
          'Unlimited check-ins',
          'Video testimonials',
          'White-label solution',
          'Dedicated support',
          'Custom integrations'
        ]),
        isActive: true
      }
    ];

    for (const plan of plans) {
      await client.query(`
        INSERT INTO subscription_plans (name, price, billing_period, max_technicians, max_check_ins, features, is_active)
        VALUES ($1, $2, $3, $4, $5, $6, $7)
      `, [plan.name, plan.price, plan.billingPeriod, plan.maxTechnicians, plan.maxCheckIns, plan.features, plan.isActive]);
      
      console.log(`Created subscription plan: ${plan.name} - $${plan.price}/month`);
    }

    console.log('Successfully initialized all subscription plans');
    
    // Update existing companies to link to subscription plans
    console.log('Linking existing companies to subscription plans...');
    
    await client.query(`
      UPDATE companies 
      SET subscription_plan_id = (
        SELECT id FROM subscription_plans WHERE name = 'Starter'
      )
      WHERE plan = 'starter' AND subscription_plan_id IS NULL
    `);
    
    await client.query(`
      UPDATE companies 
      SET subscription_plan_id = (
        SELECT id FROM subscription_plans WHERE name = 'Professional'
      )
      WHERE plan = 'pro' AND subscription_plan_id IS NULL
    `);
    
    await client.query(`
      UPDATE companies 
      SET subscription_plan_id = (
        SELECT id FROM subscription_plans WHERE name = 'Agency'
      )
      WHERE plan = 'agency' AND subscription_plan_id IS NULL
    `);
    
    console.log('Successfully linked existing companies to subscription plans');

  } catch (error) {
    console.error('Error initializing subscription plans:', error);
    throw error;
  } finally {
    client.release();
  }
}

initializeSubscriptionPlans()
  .then(() => {
    console.log('Subscription plan initialization completed');
    process.exit(0);
  })
  .catch((error) => {
    console.error('Failed to initialize subscription plans:', error);
    process.exit(1);
  });