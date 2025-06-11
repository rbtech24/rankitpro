/**
 * Application Configuration
 * Centralized configuration management with environment validation
 */

export interface AppConfig {
  database: {
    url: string;
  };
  server: {
    port: number;
    nodeEnv: string;
    sessionSecret: string;
  };
  auth: {
    superAdminEmail?: string;
    superAdminPassword?: string;
  };
  email: {
    sendgridApiKey?: string;
    enabled: boolean;
  };
  stripe: {
    secretKey?: string;
    starterPriceId?: string;
    proPriceId?: string;
    agencyPriceId?: string;
    enabled: boolean;
  };
  ai: {
    openaiApiKey?: string;
    anthropicApiKey?: string;
    xaiApiKey?: string;
    enabled: boolean;
  };
}

function validateRequiredEnvVar(name: string, value: string | undefined): string {
  if (!value) {
    console.error(`❌ Missing required environment variable: ${name}`);
    console.error(`Please set ${name} in your deployment platform's environment variables`);
    throw new Error(`Required environment variable ${name} is not set`);
  }
  return value;
}

function generateSessionSecret(): string {
  const chars = 'ABCDEFGHJKMNPQRSTUVWXYZabcdefghijkmnpqrstuvwxyz23456789!@#$%&*';
  let secret = '';
  for (let i = 0; i < 64; i++) {
    secret += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return secret;
}

export function loadConfig(): AppConfig {
  console.log('🔧 Loading application configuration...');

  // Database configuration (required)
  const databaseUrl = validateRequiredEnvVar('DATABASE_URL', process.env.DATABASE_URL);

  // Session secret (generate if not provided)
  let sessionSecret = process.env.SESSION_SECRET;
  if (!sessionSecret) {
    console.warn('⚠️  SESSION_SECRET not provided, generating one (not recommended for production)');
    sessionSecret = generateSessionSecret();
  }

  // Email configuration
  const emailEnabled = !!process.env.SENDGRID_API_KEY;
  if (!emailEnabled) {
    console.warn('⚠️  SENDGRID_API_KEY not set - email features will be disabled');
  }

  // Stripe configuration
  const stripeEnabled = !!(
    process.env.STRIPE_SECRET_KEY &&
    process.env.STRIPE_STARTER_PRICE_ID &&
    process.env.STRIPE_PRO_PRICE_ID &&
    process.env.STRIPE_AGENCY_PRICE_ID
  );
  if (!stripeEnabled) {
    console.warn('⚠️  Stripe configuration incomplete - payment features will be disabled');
  }

  // AI configuration
  const aiEnabled = !!(
    process.env.OPENAI_API_KEY ||
    process.env.ANTHROPIC_API_KEY ||
    process.env.XAI_API_KEY
  );
  if (!aiEnabled) {
    console.warn('⚠️  No AI API keys found - content generation will be disabled');
  }

  const config: AppConfig = {
    database: {
      url: databaseUrl,
    },
    server: {
      port: parseInt(process.env.PORT || '5000', 10),
      nodeEnv: process.env.NODE_ENV || 'development',
      sessionSecret,
    },
    auth: {
      superAdminEmail: process.env.SUPER_ADMIN_EMAIL,
      superAdminPassword: process.env.SUPER_ADMIN_PASSWORD,
    },
    email: {
      sendgridApiKey: process.env.SENDGRID_API_KEY,
      enabled: emailEnabled,
    },
    stripe: {
      secretKey: process.env.STRIPE_SECRET_KEY,
      starterPriceId: process.env.STRIPE_STARTER_PRICE_ID,
      proPriceId: process.env.STRIPE_PRO_PRICE_ID,
      agencyPriceId: process.env.STRIPE_AGENCY_PRICE_ID,
      enabled: stripeEnabled,
    },
    ai: {
      openaiApiKey: process.env.OPENAI_API_KEY,
      anthropicApiKey: process.env.ANTHROPIC_API_KEY,
      xaiApiKey: process.env.XAI_API_KEY,
      enabled: aiEnabled,
    },
  };

  console.log('✅ Configuration loaded successfully');
  console.log(`📊 Features: Email=${emailEnabled}, Payments=${stripeEnabled}, AI=${aiEnabled}`);

  return config;
}