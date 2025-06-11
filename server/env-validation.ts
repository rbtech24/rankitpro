/**
 * Environment Variable Validation
 * Validates required and optional environment variables on startup
 */

interface EnvConfig {
  DATABASE_URL: string;
  SESSION_SECRET?: string;
  NODE_ENV?: string;
  PORT?: string;
  SUPER_ADMIN_EMAIL?: string;
  SUPER_ADMIN_PASSWORD?: string;
  SENDGRID_API_KEY?: string;
  STRIPE_SECRET_KEY?: string;
  STRIPE_STARTER_PRICE_ID?: string;
  STRIPE_PRO_PRICE_ID?: string;
  STRIPE_AGENCY_PRICE_ID?: string;
  OPENAI_API_KEY?: string;
  ANTHROPIC_API_KEY?: string;
  XAI_API_KEY?: string;
}

export function validateEnvironment(): EnvConfig {
  const errors: string[] = [];
  const warnings: string[] = [];

  // Required variables
  if (!process.env.DATABASE_URL) {
    errors.push("DATABASE_URL is required - provide your PostgreSQL connection string");
  }

  // Session security
  if (!process.env.SESSION_SECRET) {
    warnings.push("SESSION_SECRET not set - using fallback (not recommended for production)");
  } else if (process.env.SESSION_SECRET.length < 32) {
    warnings.push("SESSION_SECRET should be at least 32 characters long for security");
  }

  // Feature availability checks
  if (!process.env.SENDGRID_API_KEY) {
    warnings.push("SENDGRID_API_KEY not set - email notifications will be disabled");
  }

  const hasStripeKeys = process.env.STRIPE_SECRET_KEY && 
                       process.env.STRIPE_STARTER_PRICE_ID && 
                       process.env.STRIPE_PRO_PRICE_ID && 
                       process.env.STRIPE_AGENCY_PRICE_ID;
  
  if (!hasStripeKeys) {
    warnings.push("Stripe configuration incomplete - subscription billing will be disabled");
  }

  const hasAIKeys = process.env.OPENAI_API_KEY || 
                   process.env.ANTHROPIC_API_KEY || 
                   process.env.XAI_API_KEY;
  
  if (!hasAIKeys) {
    warnings.push("No AI service API keys found - content generation will be disabled");
  }

  // Log validation results
  if (errors.length > 0) {
    console.error("\n🚨 ENVIRONMENT CONFIGURATION ERRORS:");
    errors.forEach(error => console.error(`  ❌ ${error}`));
    console.error("\nApplication cannot start. Please fix the above errors.\n");
    throw new Error("Environment validation failed");
  }

  if (warnings.length > 0) {
    console.warn("\n⚠️  ENVIRONMENT CONFIGURATION WARNINGS:");
    warnings.forEach(warning => console.warn(`  ⚠️  ${warning}`));
    console.warn("\nApplication will start with limited functionality.\n");
  }

  console.log("✅ Environment validation completed");

  return {
    DATABASE_URL: process.env.DATABASE_URL!,
    SESSION_SECRET: process.env.SESSION_SECRET,
    NODE_ENV: process.env.NODE_ENV,
    PORT: process.env.PORT,
    SUPER_ADMIN_EMAIL: process.env.SUPER_ADMIN_EMAIL,
    SUPER_ADMIN_PASSWORD: process.env.SUPER_ADMIN_PASSWORD,
    SENDGRID_API_KEY: process.env.SENDGRID_API_KEY,
    STRIPE_SECRET_KEY: process.env.STRIPE_SECRET_KEY,
    STRIPE_STARTER_PRICE_ID: process.env.STRIPE_STARTER_PRICE_ID,
    STRIPE_PRO_PRICE_ID: process.env.STRIPE_PRO_PRICE_ID,
    STRIPE_AGENCY_PRICE_ID: process.env.STRIPE_AGENCY_PRICE_ID,
    OPENAI_API_KEY: process.env.OPENAI_API_KEY,
    ANTHROPIC_API_KEY: process.env.ANTHROPIC_API_KEY,
    XAI_API_KEY: process.env.XAI_API_KEY
  };
}

export function getFeatureFlags() {
  return {
    emailEnabled: !!process.env.SENDGRID_API_KEY,
    paymentsEnabled: !!(process.env.STRIPE_SECRET_KEY && 
                       process.env.STRIPE_STARTER_PRICE_ID && 
                       process.env.STRIPE_PRO_PRICE_ID && 
                       process.env.STRIPE_AGENCY_PRICE_ID),
    aiEnabled: !!(process.env.OPENAI_API_KEY || 
                 process.env.ANTHROPIC_API_KEY || 
                 process.env.XAI_API_KEY),
    openAIEnabled: !!process.env.OPENAI_API_KEY,
    anthropicEnabled: !!process.env.ANTHROPIC_API_KEY,
    xaiEnabled: !!process.env.XAI_API_KEY
  };
}