# Rank It Pro - Render.com Deployment Guide

## Render.com Configuration

### 1. Create Web Service

**Build Settings:**
- **Build Command:** `npm install && npm run build`
- **Start Command:** `npm start`
- **Node Version:** 18+ (Latest LTS)
- **Root Directory:** `/` (project root)

### 2. Environment Variables

Add these environment variables in Render dashboard:

```bash
# Database (Use Render PostgreSQL add-on or external)
DATABASE_URL=postgresql://username:password@host:port/database

# Stripe Configuration (Production Keys)
STRIPE_SECRET_KEY=sk_live_...
VITE_STRIPE_PUBLIC_KEY=pk_live_...
STRIPE_STARTER_PRICE_ID=price_1234567890_starter
STRIPE_PRO_PRICE_ID=price_1234567890_pro
STRIPE_AGENCY_PRICE_ID=price_1234567890_agency

# Email Service (SendGrid)
SENDGRID_API_KEY=SG.XXXXXXXXXXXXXXXX

# AI Services (Optional)
OPENAI_API_KEY=sk-proj-...
ANTHROPIC_API_KEY=sk-ant-...
XAI_API_KEY=xai-...

# Security (Generate 32+ character random string)
SESSION_SECRET=your-super-secure-random-session-secret-here

# Application Settings
NODE_ENV=production
PORT=10000
```

### 3. Database Setup

**Option A: Render PostgreSQL (Recommended)**
1. Add PostgreSQL add-on in Render dashboard
2. Copy the DATABASE_URL from the add-on
3. Add to environment variables

**Option B: External Database**
- Use any PostgreSQL provider (AWS RDS, Google Cloud SQL, etc.)
- Ensure database allows connections from Render's IP ranges

### 4. Build Configuration

Create `package.json` scripts (already configured):
```json
{
  "scripts": {
    "build": "tsc && vite build",
    "start": "NODE_ENV=production node dist/server/index.js",
    "db:push": "drizzle-kit push:pg"
  }
}
```

### 5. Static Assets

Render automatically serves static files from the build directory. The current Vite configuration handles this correctly.

### 6. Health Checks

Render will automatically check the `/` endpoint. The app responds correctly to health checks.

## Deployment Steps

### 1. Connect Repository
1. Go to Render dashboard
2. Click "New +" → "Web Service"
3. Connect your GitHub repository
4. Select the branch to deploy

### 2. Configure Service
- **Name:** rank-it-pro (or your preferred name)
- **Environment:** Node
- **Region:** Choose closest to your users
- **Branch:** main/master
- **Build Command:** `npm install && npm run build`
- **Start Command:** `npm start`

### 3. Add Environment Variables
Copy all environment variables from the list above into Render's environment variables section.

### 4. Deploy
Click "Create Web Service" - Render will:
- Clone your repository
- Install dependencies
- Build the application
- Start the production server
- Provide HTTPS automatically

## Post-Deployment

### 1. Database Migration
After first deployment, run:
```bash
npm run db:push
```
This can be done via Render's web console or shell access.

### 2. Super Admin Account
The system automatically creates a super admin account on first startup. Check the logs for credentials:
```
Email: admin-[timestamp]@rankitpro.system
Password: [generated-secure-password]
```

### 3. Domain Configuration
- Use provided Render URL: `https://your-app-name.onrender.com`
- Or configure custom domain in Render dashboard

## Production Monitoring

### Health Checks
- Render automatically monitors `/` endpoint
- Custom health endpoint: `/api/health` (if implemented)

### Logs
- View logs in Render dashboard
- Set up log aggregation if needed

### Performance
- Render provides built-in metrics
- Monitor database connections and response times

## Scaling

### Auto-Scaling
Render can auto-scale based on:
- CPU usage
- Memory usage
- Request volume

### Database Scaling
- PostgreSQL add-on scales automatically
- Monitor connection limits and query performance

## Security Features

### HTTPS/SSL
- Automatic SSL certificate provisioning
- Force HTTPS redirects (built into the app)

### Environment Security
- All secrets encrypted at rest
- Environment variables not exposed in logs

### Session Security
- Secure session configuration for production
- CSRF protection enabled
- Secure cookie settings

## Backup Strategy

### Database Backups
- Render PostgreSQL includes automated backups
- Set up additional backup strategy if needed

### Application Backups
- Repository backup via Git
- Environment variables documented securely

## Troubleshooting

### Common Issues

**Build Failures:**
- Check Node.js version compatibility
- Verify all dependencies in package.json
- Review build logs for specific errors

**Database Connection:**
- Verify DATABASE_URL format
- Check database firewall settings
- Ensure PostgreSQL version compatibility

**Environment Variables:**
- Confirm all required variables are set
- Check for typos in variable names
- Verify secret key formats

### Debug Mode
Set `DEBUG=true` in environment variables for detailed logging.

## Performance Optimization

### CDN
Configure Render's CDN for static assets and improved global performance.

### Caching
The application includes appropriate caching headers for static resources.

### Database
- Use connection pooling (configured in app)
- Monitor slow queries
- Optimize indexes as needed

## Monitoring and Alerts

Set up monitoring for:
- Application uptime
- Response times
- Database performance
- Error rates
- Resource usage

Your Rank It Pro SaaS platform is now production-ready on Render.com with enterprise-grade security, scalability, and reliability!