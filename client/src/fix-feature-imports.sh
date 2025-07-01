#!/bin/bash

# Fix features and admin component imports
find . -name "*.tsx" -o -name "*.ts" | xargs sed -i 's|from "features"|from "../components/features"|g'
find . -name "*.tsx" -o -name "*.ts" | xargs sed -i 's|from "reports/|from "../components/reports/|g'
find . -name "*.tsx" -o -name "*.ts" | xargs sed -i 's|from "analytics/|from "../components/analytics/|g'
find . -name "*.tsx" -o -name "*.ts" | xargs sed -i 's|from "integration/|from "../components/integration/|g'

echo "Feature import fixes applied"
