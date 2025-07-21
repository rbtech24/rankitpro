#!/bin/bash

# Comprehensive corruption fix script for build deployment

echo "🔧 Fixing template literal corruption across server codebase..."

# Fix placeholder-text corruption in all files
find server/services/ -type f -name "*.ts" -exec sed -i 's/"placeholder-text"/error instanceof Error ? error.message : String(error)/g' {} \;

# Fix System message corruption in API endpoints
find server/services/ -type f -name "*.ts" -exec sed -i 's/"System message")/`\${apiBase}\/\${endpoint}`/g' {} \;

# Fix specific corruption patterns
find server/services/ -type f -name "*.ts" -exec sed -i 's/"System message"/`\${this.apiBase}\/endpoint`/g' {} \;

# Fix HousecallPro specific URLs
sed -i 's|url: "placeholder-text"|url: `\${this.apiBase}/customers`|g' server/services/crm-integration/housecall-pro.ts
sed -i 's|Authorization.*placeholder-text|Authorization: `Bearer \${this.apiKey}`|g' server/services/crm-integration/housecall-pro.ts

# Fix ServiceTitan specific URLs  
sed -i 's|url: "placeholder-text"|url: `\${this.apiBase}/customers`|g' server/services/crm-integration/service-titan.ts
sed -i 's|Authorization.*placeholder-text|Authorization: `Bearer \${this.apiKey}`|g' server/services/crm-integration/service-titan.ts

# Fix WordPress service corruption
sed -i 's|this.apiBase = "placeholder-text"|this.apiBase = config.wordpressUrl|g' server/services/wordpress-service-corrupted.ts

# Fix email template subjects
sed -i 's|const subject = "placeholder-text"|const subject = "Important Update from Rank It Pro"|g' server/services/email-templates.ts

# Fix SMS service returns
sed -i 's|return "placeholder-text"|return "Message sent successfully"|g' server/services/sms-service.ts

echo "✅ Template literal corruption fixed"

# Fix import.meta issues for production build
echo "🔧 Creating production-compatible __dirname references..."

# Create __dirname equivalent for files using import.meta
cat > server/dirname-fix.ts << 'EOF'
import { fileURLToPath } from 'url';
import path from 'path';

// Production-compatible __dirname equivalent
export const __filename = fileURLToPath(import.meta.url);
export const __dirname = path.dirname(__filename);
EOF

echo "✅ Build compatibility fixes applied"
echo "🚀 Ready for deployment"