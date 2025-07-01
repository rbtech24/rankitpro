#!/bin/bash

# Fix dashboard component imports
find . -name "*.tsx" -o -name "*.ts" | xargs sed -i 's|from "dashboard/|from "../components/dashboard/|g'
find . -name "*.tsx" -o -name "*.ts" | xargs sed -i 's|from "modals/|from "../components/modals/|g'  
find . -name "*.tsx" -o -name "*.ts" | xargs sed -i 's|from "technician/|from "../components/technician/|g'
find . -name "*.tsx" -o -name "*.ts" | xargs sed -i 's|from "checkin/|from "../components/checkin/|g'
find . -name "*.tsx" -o -name "*.ts" | xargs sed -i 's|from "sales/|from "../components/sales/|g'
find . -name "*.tsx" -o -name "*.ts" | xargs sed -i 's|from "admin/|from "../components/admin/|g'

echo "Dashboard import fixes applied"
