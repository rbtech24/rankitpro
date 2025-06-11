# Production Deployment Guide

## Environment Variables Configuration

Your application requires several environment variables to function properly in production. Configure these in your deployment platform:

### Required Environment Variables

#### Database Configuration
```
DATABASE_URL=postgresql://username:password@hostname:port/database_name
```
- **Required**: Yes
- **Description**: PostgreSQL connection string for your production database
- **Example**: `postgresql://myuser:mypass@db.render.com:5432/myapp_db`

#### Authentication & Security
```
SESSION_SECRET=your-long-random-session-secret-here
```
- **Required**: Yes
- **Description**: Secret key for session encryption (minimum 32 characters)
- **Example**: `a1b2c3d4e5f6g7h8i9j0k1l2m3n4o5p6q7r8s9t0`

#### Super Admin Account (Optional)
```
SUPER_ADMIN_EMAIL=admin@yourcompany.com
SUPER_ADMIN_PASSWORD=YourSecurePassword123!
```
- **Required**: No (will auto-generate if not provided)
- **Description**: Initial super admin credentials

#### Email Service (Optional)
```
SENDGRID_API_KEY=your-sendgrid-api-key
```
- **Required**: No (email notifications will be disabled without it)
- **Description**: SendGrid API key for email notifications

#### Payment Processing (Optional)
```
STRIPE_SECRET_KEY=sk_live_your-stripe-secret-key
STRIPE_STARTER_PRICE_ID=price_starter_id
STRIPE_PRO_PRICE_ID=price_pro_id
STRIPE_AGENCY_PRICE_ID=price_agency_id
```
- **Required**: No (payment features will be disabled without it)
- **Description**: Stripe configuration for subscription billing

#### AI Services (Optional)
```
OPENAI_API_KEY=sk-your-openai-api-key
ANTHROPIC_API_KEY=sk-ant-your-anthropic-key
XAI_API_KEY=your-xai-api-key
```
- **Required**: No (AI content generation will be disabled without at least one)
- **Description**: API keys for AI content generation services

## Platform-Specific Instructions

### Render.com Deployment

1. **Create a PostgreSQL Database**
   - Go to your Render dashboard
   - Click "New" → "PostgreSQL"
   - Choose your plan and region
   - Copy the "External Database URL" once created

2. **Configure Environment Variables**
   - In your web service settings, go to "Environment"
   - Add each required environment variable
   - Set `DATABASE_URL` to your PostgreSQL External Database URL

3. **Deploy Settings**
   - Build Command: `npm run build`
   - Start Command: `npm run start`
   - Node Version: 18 or higher

### Other Platforms

#### Heroku
```bash
heroku config:set DATABASE_URL=your-database-url
heroku config:set SESSION_SECRET=your-session-secret
```

#### Railway
```bash
railway variables set DATABASE_URL=your-database-url
railway variables set SESSION_SECRET=your-session-secret
```

#### DigitalOcean App Platform
Add environment variables in the App Platform console under "Settings" → "Environment Variables"

## Database Setup

Your application will automatically:
1. Create database tables on first startup
2. Create a super admin account if none exists
3. Display the admin credentials in the deployment logs

**Important**: Save the super admin credentials from your deployment logs immediately!

## Health Check

Once deployed, verify your application is working:

1. Visit your deployment URL
2. Check that the login page loads
3. Log in with your super admin credentials
4. Navigate to different sections to ensure database connectivity

## Troubleshooting

### Common Issues

#### "DATABASE_URL must be set" Error
- Ensure your DATABASE_URL environment variable is correctly configured
- Verify your database is accessible from your deployment platform
- Check that your database credentials are correct

#### Session/Authentication Issues
- Ensure SESSION_SECRET is set and is at least 32 characters long
- Clear browser cookies and try again

#### Email Notifications Not Working
- Verify SENDGRID_API_KEY is set correctly
- Check SendGrid dashboard for delivery status

#### Payment Processing Issues
- Ensure all Stripe environment variables are set
- Verify Stripe keys match your account (test vs live)

### Logs and Monitoring

Monitor your application logs for:
- Database connection status
- Super admin account creation
- Email service initialization
- Any error messages

## Security Considerations

1. **Use HTTPS**: Ensure your deployment platform provides SSL/TLS
2. **Environment Variables**: Never commit secrets to your code repository
3. **Database Access**: Restrict database access to your application only
4. **Regular Updates**: Keep dependencies updated for security patches

## Performance Optimization

1. **Database Indexing**: Ensure proper database indexes are in place
2. **Connection Pooling**: The application uses connection pooling for efficiency
3. **Static Assets**: Ensure static assets are served efficiently
4. **Monitoring**: Set up application performance monitoring

## Support

If you encounter issues:
1. Check your deployment platform's logs
2. Verify all environment variables are correctly set
3. Test database connectivity independently
4. Ensure your deployment platform supports Node.js applications