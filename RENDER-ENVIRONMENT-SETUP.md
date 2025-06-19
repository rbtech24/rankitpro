# Render.com Environment Variables Setup

## Required Environment Variables for Production

### 1. Database (Already Configured)
```
DATABASE_URL=postgresql://[your-postgres-url]
PGHOST=[auto-configured]
PGPORT=[auto-configured]
PGUSER=[auto-configured]
PGPASSWORD=[auto-configured]
PGDATABASE=[auto-configured]
```

### 2. OpenAI Integration (Optional - for AI content generation)
```
OPENAI_API_KEY=sk-proj-[your-openai-key]
```
**How to get:** Visit https://platform.openai.com/api-keys

### 3. Stripe Payment Processing (Optional - for subscriptions)
```
STRIPE_SECRET_KEY=sk_live_[your-stripe-secret-key]
VITE_STRIPE_PUBLIC_KEY=pk_live_[your-stripe-public-key]
```
**How to get:** Visit https://dashboard.stripe.com/apikeys

### 4. SendGrid Email Service (Optional - for review automation)
```
SENDGRID_API_KEY=SG.[your-sendgrid-key]
```
**How to get:** Visit https://app.sendgrid.com/settings/api_keys

### 5. Session Security (Required)
```
SESSION_SECRET=[random-32-character-string]
```
**Generate with:** `openssl rand -base64 32`

### 6. Application Configuration (Required)
```
NODE_ENV=production
PORT=5000
```

## How to Add Environment Variables in Render.com

1. **Go to your Render Dashboard**
2. **Click on your deployed service**
3. **Navigate to "Environment" tab**
4. **Click "Add Environment Variable"**
5. **Add each variable with its key and value**
6. **Click "Save Changes"**

## Priority Setup Order

### Essential (Required for basic functionality):
1. `SESSION_SECRET` - Generate a secure random string
2. `NODE_ENV=production`
3. `PORT=5000`

### Business Features (Add as needed):
1. `OPENAI_API_KEY` - For AI content generation
2. `STRIPE_SECRET_KEY` + `VITE_STRIPE_PUBLIC_KEY` - For subscription billing
3. `SENDGRID_API_KEY` - For automated email reviews

## Testing After Setup

After adding environment variables:
1. **Redeploy** your service in Render
2. **Test login** with: admin@rankitpro.com / Admin2024!
3. **Verify features** work based on configured APIs

## Current System Status

The platform works without external APIs but with limited functionality:
- ✅ **Authentication & Dashboard** - Full functionality
- ✅ **Company Management** - Full functionality  
- ✅ **Technician Check-ins** - Full functionality
- ✅ **Customer Management** - Full functionality
- ⚠️ **AI Content Generation** - Requires OPENAI_API_KEY
- ⚠️ **Email Automation** - Requires SENDGRID_API_KEY
- ⚠️ **Subscription Billing** - Requires STRIPE keys

## Notes

- Environment variables are encrypted and secure in Render
- Changes require a redeploy to take effect
- Database connection is automatically configured by Render
- The system gracefully handles missing optional API keys