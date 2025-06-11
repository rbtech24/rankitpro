# Render Deployment Checklist

## Pre-Deployment Setup

### 1. Create PostgreSQL Database
- [ ] Go to Render Dashboard → New → PostgreSQL
- [ ] Name: `rankitpro-database` (or your preference)
- [ ] Region: Same as your web service
- [ ] Plan: Free (testing) or Starter ($7/month for production)
- [ ] Copy the "External Database URL" once created

### 2. Configure Environment Variables
Go to your web service → Environment tab and add:

**Required:**
- [ ] `DATABASE_URL` = Your PostgreSQL External Database URL
- [ ] `SESSION_SECRET` = 64-character random string

**Optional (for full functionality):**
- [ ] `SUPER_ADMIN_EMAIL` = your@email.com
- [ ] `SUPER_ADMIN_PASSWORD` = SecurePassword123!
- [ ] `SENDGRID_API_KEY` = Your SendGrid API key
- [ ] `STRIPE_SECRET_KEY` = Your Stripe secret key
- [ ] `OPENAI_API_KEY` = Your OpenAI API key

### 3. Verify Build Settings
- [ ] Build Command: `npm run build`
- [ ] Start Command: `npm run start`
- [ ] Node Version: 18 or higher

## Deployment Process

### 4. Deploy Application
- [ ] Push to connected repository OR click "Manual Deploy"
- [ ] Monitor build logs for errors
- [ ] Wait for deployment to complete

### 5. Verify Deployment
- [ ] Visit your Render URL
- [ ] Test health endpoints:
  - [ ] `/api/health` - Basic health check
  - [ ] `/api/health/database` - Database connectivity
  - [ ] `/api/health/detailed` - Full system status

### 6. Save Admin Credentials
- [ ] Check deployment logs for super admin credentials
- [ ] Save email and password immediately
- [ ] Test login with admin account

## Testing Commands

Run these commands to verify your deployment:

```bash
# Test basic health
curl https://your-app.onrender.com/api/health

# Test database connection
curl https://your-app.onrender.com/api/health/database

# Get detailed status
curl https://your-app.onrender.com/api/health/detailed

# Or use the verification script
node render-deploy-test.js https://your-app.onrender.com
```

## Common Issues & Solutions

### Database Connection Failed
**Issue:** `DATABASE_URL must be set` error
**Solution:** 
1. Verify DATABASE_URL in environment variables
2. Ensure it's the "External Database URL" from Render
3. Check database and web service are in same region

### Build Failures
**Issue:** Build process fails
**Solution:**
1. Check Node.js version (18+)
2. Verify package.json build script
3. Review build logs for specific errors

### Session Issues
**Issue:** Login doesn't work
**Solution:**
1. Ensure SESSION_SECRET is set (32+ characters)
2. Clear browser cookies
3. Check database session store connectivity

## Post-Deployment

### 7. Monitor Application
- [ ] Set up Render monitoring alerts
- [ ] Check application logs regularly
- [ ] Monitor database usage

### 8. Configure Custom Domain (Optional)
- [ ] Add custom domain in Render dashboard
- [ ] Update DNS records
- [ ] Verify SSL certificate

### 9. Backup Strategy
- [ ] Set up database backups
- [ ] Document environment variables
- [ ] Save admin credentials securely

## Production Optimization

### Performance
- [ ] Enable Render's CDN
- [ ] Configure caching headers
- [ ] Monitor response times

### Security
- [ ] Use strong SESSION_SECRET
- [ ] Enable HTTPS redirect
- [ ] Review environment variable security

### Scaling
- [ ] Monitor resource usage
- [ ] Plan for higher tier if needed
- [ ] Consider database scaling

## Success Criteria

Your deployment is successful when:
- [ ] Application loads without errors
- [ ] Database health check passes
- [ ] Admin login works
- [ ] All required features function
- [ ] Health endpoints return successful status

## Getting Help

If issues persist:
1. Check Render status page
2. Review deployment logs
3. Use health check endpoints for diagnostics
4. Contact Render support if infrastructure issues