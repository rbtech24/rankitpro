# Render.com Deployment Setup Guide

## Step 1: Create PostgreSQL Database

1. **Go to your Render Dashboard**
   - Visit [dashboard.render.com](https://dashboard.render.com)
   - Click "New" button in the top right

2. **Create PostgreSQL Database**
   - Select "PostgreSQL" from the menu
   - Choose a name for your database (e.g., `rankitpro-db`)
   - Select your region (choose same region as your web service)
   - Choose your plan:
     - **Free tier**: Good for testing (limited to 1GB, expires after 90 days)
     - **Starter ($7/month)**: Recommended for production
   - Click "Create Database"

3. **Get Database Connection Details**
   - Once created, go to your database dashboard
   - Copy the "External Database URL" - this is your DATABASE_URL
   - Format: `postgresql://username:password@hostname:port/database_name`

## Step 2: Configure Web Service Environment Variables

1. **Go to Your Web Service**
   - Navigate to your web service in Render dashboard
   - Click on "Environment" in the left sidebar

2. **Add Required Environment Variables**
   
   **Essential (Required):**
   ```
   DATABASE_URL = [paste your External Database URL here]
   SESSION_SECRET = [generate a 32+ character random string]
   ```

   **Optional (Recommended for Production):**
   ```
   SUPER_ADMIN_EMAIL = your-email@company.com
   SUPER_ADMIN_PASSWORD = YourSecurePassword123!
   SENDGRID_API_KEY = [your SendGrid API key for emails]
   ```

   **Payment Processing (if needed):**
   ```
   STRIPE_SECRET_KEY = sk_live_your_stripe_secret_key
   STRIPE_STARTER_PRICE_ID = price_starter_id
   STRIPE_PRO_PRICE_ID = price_pro_id  
   STRIPE_AGENCY_PRICE_ID = price_agency_id
   ```

   **AI Services (if needed):**
   ```
   OPENAI_API_KEY = sk-your_openai_api_key
   ANTHROPIC_API_KEY = sk-ant-your_anthropic_key
   XAI_API_KEY = your_xai_api_key
   ```

## Step 3: Generate SESSION_SECRET

You need a secure random string for SESSION_SECRET. Here are a few ways to generate one:

**Option 1: Online Generator**
- Visit [generate-secret.vercel.app](https://generate-secret.vercel.app/64)
- Copy the generated 64-character string

**Option 2: Command Line (if you have Node.js)**
```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

**Option 3: Manual (less secure)**
- Create a random string with letters, numbers, and symbols
- Must be at least 32 characters long

## Step 4: Deploy Settings

Ensure your Render web service has these settings:

**Build & Deploy:**
- **Build Command**: `npm run build`
- **Start Command**: `npm run start`
- **Node Version**: 18 or higher

**Advanced Settings:**
- **Auto-Deploy**: Yes (deploys automatically on git push)
- **Environment**: Production

## Step 5: Deploy and Verify

1. **Trigger Deployment**
   - Either push to your connected repository
   - Or click "Manual Deploy" in Render dashboard

2. **Monitor Deployment Logs**
   - Watch the build logs for any errors
   - Look for successful database connection message
   - Note the super admin credentials that will be displayed

3. **Test Your Deployment**
   - Visit your Render URL (e.g., `https://your-app.onrender.com`)
   - Check health endpoints:
     - `https://your-app.onrender.com/api/health`
     - `https://your-app.onrender.com/api/health/detailed`

## Step 6: Post-Deployment Checklist

- [ ] Application loads without errors
- [ ] Database connection successful
- [ ] Super admin account created (save credentials!)
- [ ] Login functionality works
- [ ] Health check endpoints return success
- [ ] All required features working

## Troubleshooting Common Issues

### Database Connection Failed
- Verify DATABASE_URL is exactly as shown in Render database dashboard
- Ensure database and web service are in same region
- Check database is running and accessible

### Build Failures
- Check Node.js version is 18+
- Verify package.json scripts are correct
- Review build logs for specific errors

### Environment Variables Not Working
- Double-check variable names (case-sensitive)
- Ensure no extra spaces in values
- Redeploy after adding critical environment variables

### Application Not Accessible
- Check if Render assigned a URL
- Verify port configuration (should auto-detect)
- Review runtime logs for startup errors

## Getting Help

If you encounter issues:

1. **Check Render Status**: [status.render.com](https://status.render.com)
2. **Review Logs**: Use Render dashboard logs section
3. **Test Health Endpoints**: Use the health check URLs to diagnose issues
4. **Render Documentation**: [render.com/docs](https://render.com/docs)

## Cost Optimization

**Free Tier Limitations:**
- Database expires after 90 days
- Web service spins down after 15 minutes of inactivity
- Limited resources

**Recommended Production Setup:**
- PostgreSQL Starter ($7/month)
- Web Service Starter ($7/month)
- Total: ~$14/month for reliable hosting

Your application is now configured to provide detailed error messages and health diagnostics to help troubleshoot any deployment issues!