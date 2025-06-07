# Rank It Pro - Deployment Guide

## GitHub Push Instructions

### 1. Initialize and Push to GitHub

```bash
# Remove any lock files if present
rm -f .git/index.lock

# Add all files to staging
git add .

# Commit with production-ready message
git commit -m "Production-ready Rank It Pro SaaS platform

- Complete authentication system with real user registration
- GPS visit logging with photo uploads
- AI content generation (OpenAI, Claude, Grok support)
- WordPress and JavaScript embed integrations
- Review request automation system
- Mobile-responsive technician interface
- Company admin dashboard with analytics
- Production URL management and security fixes
- Removed test data dependencies
- Comprehensive onboarding flow"

# Add your GitHub repository as origin (replace with your repo URL)
git remote add origin https://github.com/YOUR_USERNAME/rank-it-pro.git

# Push to main branch
git push -u origin main
```

### 2. Environment Variables for Production

Create a `.env` file with these required variables:

```env
# Database Configuration
DATABASE_URL=your_postgresql_connection_string
PGHOST=your_pg_host
PGPORT=5432
PGUSER=your_pg_user
PGPASSWORD=your_pg_password
PGDATABASE=your_pg_database

# AI Services (Optional but recommended)
OPENAI_API_KEY=your_openai_api_key
ANTHROPIC_API_KEY=your_anthropic_api_key
XAI_API_KEY=your_xai_api_key

# Email Service (Optional)
SENDGRID_API_KEY=your_sendgrid_api_key

# Payment Processing (Optional)
STRIPE_SECRET_KEY=your_stripe_secret_key
VITE_STRIPE_PUBLIC_KEY=your_stripe_public_key

# Session Configuration
SESSION_SECRET=your_secure_session_secret
```

### 3. Production Deployment Options

#### Option A: Replit Deployment
- Click the "Deploy" button in Replit
- Configure environment variables in the deployment settings
- Your app will be available at `your-app-name.replit.app`

#### Option B: Vercel Deployment
```bash
# Install Vercel CLI
npm i -g vercel

# Deploy to Vercel
vercel

# Configure environment variables in Vercel dashboard
```

#### Option C: Railway Deployment
```bash
# Install Railway CLI
npm i -g @railway/cli

# Login and deploy
railway login
railway deploy
```

### 4. Post-Deployment Setup

1. **Database Setup**: Run database migrations if needed
2. **Super Admin**: Login with `superadmin@example.com` / `admin123`
3. **Change Default Password**: Update super admin password immediately
4. **Configure Integrations**: Set up WordPress/email services as needed

### 5. Production Checklist

- [ ] All environment variables configured
- [ ] Database connected and accessible
- [ ] Super admin password changed
- [ ] Email service configured (if using review requests)
- [ ] AI services configured (if using content generation)
- [ ] Payment processing configured (if using billing)
- [ ] SSL certificate enabled
- [ ] Domain configured (if custom domain)

## Features Ready for Production

### Core Features
- User authentication and role management
- GPS visit logging with photo uploads
- AI-powered content generation
- WordPress integration for SEO content
- JavaScript embed for non-WordPress sites
- Automated review request system
- Mobile-optimized technician interface

### Admin Features
- Company management dashboard
- User and technician management
- Analytics and reporting
- Integration configuration
- Billing and subscription management

### Security Features
- Role-based access control
- Session management
- Input validation and sanitization
- Environment-based URL generation
- Secure file upload handling

The application is production-ready with real user accounts, authentic data flows, and comprehensive business functionality.