#!/bin/bash

echo "🔧 Fixing CRM integration template literal corruption..."

# Fix HousecallPro service corruption
sed -i 's/`${apiBase}\/${endpoint}`;/`\/customers?email=${encodeURIComponent(customer.email)}`;/g' server/services/crm-integration/housecall-pro.ts

# Replace remaining instances with proper endpoints
sed -i 's/`${apiBase}\/${endpoint}`;/`\/customers?phone=${phone}`;/g' server/services/crm-integration/housecall-pro.ts

# Fix ServiceTitan service corruption
sed -i 's/url: error instanceof Error ? error.message : String(error),/url: `${this.baseUrl}${endpoint}`,/g' server/services/crm-integration/service-titan.ts
sed -i "s/'Authorization': error instanceof Error ? error.message : String(error),/'Authorization': \`Bearer \${token}\`,/g" server/services/crm-integration/service-titan.ts

# Fix logger error syntax in ServiceTitan
sed -i 's/logger.error('\''ServiceTitan API error:'\'', { {/logger.error('\''ServiceTitan API error:'\'', {/g' server/services/crm-integration/service-titan.ts
sed -i 's/} }, {/});/g' server/services/crm-integration/service-titan.ts

# Remove duplicate data entries
sed -i '/status: error.response.status,/,+3d' server/services/crm-integration/service-titan.ts

echo "✅ CRM integration corruption fixed"