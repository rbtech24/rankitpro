#!/bin/bash

# Fix notification component imports
find . -name "*.tsx" -o -name "*.ts" | xargs sed -i 's|from "notifications/|from "../components/notifications/|g'
find . -name "*.tsx" -o -name "*.ts" | xargs sed -i 's|from "utils/|from "../lib/utils|g'
find . -name "*.tsx" -o -name "*.ts" | xargs sed -i 's|from "lib/|from "../lib/|g'

echo "Notification import fixes applied"
