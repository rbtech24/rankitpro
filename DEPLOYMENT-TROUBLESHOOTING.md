# Deployment Troubleshooting Guide

## Common Deployment Issues

### 1. DATABASE_URL Configuration Error

**Symptoms:**
- Application fails to start with "DATABASE_URL must be set" error
- Exit code 1 during deployment

**Solution:**
1. **Create PostgreSQL Database** (if not already done)
   - Render: Dashboard → New → PostgreSQL
   - Heroku: `heroku addons:create heroku-postgresql:mini`
   - Railway: Add PostgreSQL service

2. **Configure DATABASE_URL Environment Variable**
   - Copy your database's external connection string
   - Add to your deployment platform's environment variables
   - Format: `postgresql://username:password@hostname:port/database`

3. **Verify Database Access**
   ```bash
   # Test connection (replace with your URL)
   psql "postgresql://user:pass@host:port/db" -c "SELECT version();"
   ```

### 2. Build Failures

**Symptoms:**
- Build process fails during `npm run build`
- TypeScript compilation errors

**Solution:**
1. **Check Build Logs** for specific error messages
2. **Common Fixes:**
   ```bash
   # Clear node_modules and reinstall
   rm -rf node_modules package-lock.json
   npm install
   
   # Run build locally to test
   npm run build
   ```

### 3. Port Configuration Issues

**Symptoms:**
- Application starts but isn't accessible
- Port binding errors

**Solution:**
- Ensure your application uses `process.env.PORT`
- Default fallback should be 5000
- Most platforms automatically set PORT environment variable

### 4. Session/Authentication Problems

**Symptoms:**
- Users can't log in
- Session data not persisting
- "Unauthorized" errors

**Solution:**
1. **Check SESSION_SECRET Configuration**
   - Must be set in production environment variables
   - Should be at least 32 characters long
   - Use a cryptographically secure random string

2. **Database Session Store**
   - Verify database connection is working
   - Check session table exists and is accessible

### 5. Missing Environment Variables

**Symptoms:**
- Features not working (email, payments, AI)
- Warning messages in logs

**Solution:**
Review and configure optional environment variables:
```bash
# Email notifications
SENDGRID_API_KEY=your_sendgrid_key

# Payment processing
STRIPE_SECRET_KEY=sk_live_your_stripe_key
STRIPE_STARTER_PRICE_ID=price_starter_id
STRIPE_PRO_PRICE_ID=price_pro_id
STRIPE_AGENCY_PRICE_ID=price_agency_id

# AI content generation
OPENAI_API_KEY=sk-your_openai_key
ANTHROPIC_API_KEY=sk-ant-your_anthropic_key
XAI_API_KEY=your_xai_key
```

## Platform-Specific Troubleshooting

### Render.com

**Database Connection Issues:**
1. Ensure you're using the "External Database URL"
2. Check database and web service are in same region
3. Verify database allows external connections

**Build Issues:**
1. Check Node.js version in environment settings
2. Verify build and start commands:
   - Build: `npm run build`
   - Start: `npm run start`

**Environment Variables:**
1. Go to Service → Environment tab
2. Add variables one by one
3. Redeploy after adding critical variables

### Heroku

**Database Issues:**
```bash
# Check database status
heroku pg:info

# Check environment variables
heroku config

# View logs
heroku logs --tail
```

**Dyno Issues:**
```bash
# Restart application
heroku restart

# Scale dynos
heroku ps:scale web=1
```

### Railway

**Database Connection:**
1. Use Railway's generated DATABASE_URL
2. Check service connectivity in dashboard
3. Verify database service is running

**Deployment Logs:**
1. Check build logs in Railway dashboard
2. Monitor runtime logs for errors
3. Use Railway CLI for detailed debugging

## Health Check Endpoints

Your application provides health check endpoints:

### `/api/health`
Basic health check - returns application status

### `/api/health/database`
Database connectivity check

### `/api/health/detailed`
Comprehensive system status including:
- Database connection
- Environment configuration
- Feature availability

## Debugging Steps

### 1. Check Deployment Logs
Look for specific error messages during startup

### 2. Verify Environment Variables
Ensure all required variables are set correctly

### 3. Test Database Connection
Use health check endpoints or direct database tools

### 4. Monitor Application Logs
Watch for runtime errors after successful deployment

### 5. Test Core Functionality
- Login/logout
- Database operations
- API endpoints

## Getting Help

If issues persist:

1. **Collect Information:**
   - Deployment platform and plan
   - Complete error messages
   - Environment variable configuration (without secrets)
   - Database connection string format

2. **Check Platform Status:**
   - Render Status: status.render.com
   - Heroku Status: status.heroku.com
   - Railway Status: railway.app/status

3. **Review Platform Documentation:**
   - Each platform has specific deployment guides
   - Check for recent changes or known issues

## Prevention

1. **Test Locally:** Always test builds locally before deploying
2. **Environment Parity:** Keep development and production environments similar
3. **Gradual Deployment:** Deploy configuration changes incrementally
4. **Monitor Continuously:** Set up alerts for application health
5. **Regular Updates:** Keep dependencies and platform configurations current