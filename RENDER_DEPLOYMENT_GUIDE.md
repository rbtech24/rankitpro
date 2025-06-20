# Render.com Deployment Guide for RankItPro SaaS

## Prerequisites
1. GitHub repository with your code
2. Render.com account
3. Required API keys (see Environment Variables section)

## Step 1: Create PostgreSQL Database
1. Go to Render Dashboard → New → PostgreSQL
2. Name: `rankitpro-db`
3. Plan: Choose based on your needs (Starter plan available)
4. Region: Select closest to your users
5. Click "Create Database"
6. Copy the **External Database URL** for later use

## Step 2: Create Web Service
1. Go to Render Dashboard → New → Web Service
2. Connect your GitHub repository
3. Configure the following settings:

### Basic Settings
- **Name**: `rankitpro-saas`
- **Runtime**: Node
- **Build Command**: `npm install`
- **Start Command**: `npm run dev`
- **Instance Type**: Starter (or higher based on needs)

### Environment Variables
Add these in the Environment tab:

#### Required (Core Functionality)
```
NODE_ENV=production
DATABASE_URL=[paste your PostgreSQL External Database URL]
SESSION_SECRET=[generate a random 32+ character string]
PORT=10000
```

#### AI Features (Required for content generation)
```
OPENAI_API_KEY=[your OpenAI API key]
ANTHROPIC_API_KEY=[your Anthropic API key]
XAI_API_KEY=[your xAI API key]
```

#### Email Service (Required for notifications)
```
RESEND_API_KEY=[your Resend API key]
```

#### Stripe Payment Processing (Required for subscriptions)
```
STRIPE_SECRET_KEY=[your Stripe secret key]
STRIPE_PUBLISHABLE_KEY=[your Stripe publishable key]
STRIPE_WEBHOOK_SECRET=[your Stripe webhook secret]
STRIPE_STARTER_PRICE_ID=[Stripe price ID for starter plan]
STRIPE_PRO_PRICE_ID=[Stripe price ID for pro plan]
STRIPE_AGENCY_PRICE_ID=[Stripe price ID for agency plan]
```

#### SMS Features (Optional)
```
TWILIO_ACCOUNT_SID=[your Twilio account SID]
TWILIO_AUTH_TOKEN=[your Twilio auth token]
TWILIO_PHONE_NUMBER=[your Twilio phone number]
```

## Step 3: Deploy
1. Click "Create Web Service"
2. Render will automatically deploy your application
3. Monitor the build logs for any errors
4. Once deployed, your app will be available at `https://your-service-name.onrender.com`

## Step 4: Database Setup
After first deployment, your database tables will be automatically created. The app includes:
- User management system
- Company and technician management
- Check-in and review systems
- Subscription plan management
- WordPress integration features

## Step 5: Configure Custom Domain (Optional)
1. In your web service settings, go to "Settings" → "Custom Domains"
2. Add your custom domain
3. Configure DNS records as instructed by Render

## API Key Setup Instructions

### OpenAI API Key
1. Visit https://platform.openai.com/api-keys
2. Create new secret key
3. Copy and add to environment variables

### Anthropic API Key
1. Visit https://console.anthropic.com/
2. Create API key in settings
3. Copy and add to environment variables

### Resend API Key
1. Visit https://resend.com/api-keys
2. Create new API key
3. Copy and add to environment variables

### Stripe Configuration
1. Visit https://dashboard.stripe.com/apikeys
2. Copy secret and publishable keys
3. Create products and pricing in Stripe dashboard
4. Copy price IDs for each plan

## Health Check
Your app includes a health check endpoint at `/api/health` that Render can use to monitor your application.

## Troubleshooting

### Build Failures
- Check that all environment variables are set
- Verify Node.js version compatibility
- Review build logs for specific errors

### Database Connection Issues
- Ensure DATABASE_URL is correctly set
- Check that database is running and accessible
- Verify SSL connection settings

### Performance Optimization
- Enable auto-scaling in Render settings
- Consider upgrading to higher-tier plans for production
- Monitor memory and CPU usage in Render dashboard

## Production Checklist
- [ ] All environment variables configured
- [ ] Database connected and tables created
- [ ] Health check endpoint responding
- [ ] SSL certificate configured
- [ ] Custom domain configured (if applicable)
- [ ] Stripe webhooks configured
- [ ] Email service tested
- [ ] Admin account created and tested

## Support
For deployment issues, check:
1. Render build logs
2. Application logs in Render dashboard
3. Database connection status
4. Environment variable configuration