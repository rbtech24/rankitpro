# Working Test Credentials

## Authentication System Status: ✅ OPERATIONAL

All test accounts have been reset with the password: `test123`

### Test Company Admin Account

**Carrollton Sprinkler Repair (Primary Test Account)**
- Email: `rodbartrufftech@gmail.com`
- Password: `test123`
- Username: `carrolltonsprinklerrepair`
- Role: `company_admin`
- Company ID: 16
- Status: ✅ Active

### Super Admin Account

- Email: `bill@mrsprinklerrepair.com`
- Password: Available via system admin credentials endpoint
- Role: `super_admin`
- Status: ✅ Active

## System Status

- ✅ Database Connection: Operational
- ✅ Authentication System: Working
- ✅ Session Management: Active
- ✅ AI Services: Enabled (OpenAI, Anthropic, XAI)
- ⚠️ Email Service: Disabled (RESEND_API_KEY not configured)
- ⚠️ Stripe Payments: Disabled (incomplete configuration)

## Quick Test Commands

```bash
# Test login
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email": "rodbartrufftech@gmail.com", "password": "test123"}'

# Health check
curl http://localhost:5000/api/health

# Database health
curl http://localhost:5000/api/health/database
```

Last updated: June 22, 2025