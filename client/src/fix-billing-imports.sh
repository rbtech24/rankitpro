#!/bin/bash

# Fix billing and payment component imports
find . -name "*.tsx" -o -name "*.ts" | xargs sed -i 's|from "billing/|from "../components/billing/|g'
find . -name "*.tsx" -o -name "*.ts" | xargs sed -i 's|from "payment/|from "../components/payment/|g'
find . -name "*.tsx" -o -name "*.ts" | xargs sed -i 's|from "subscription/|from "../components/subscription/|g'

echo "Billing import fixes applied"
