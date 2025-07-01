#!/bin/bash

# Fix broken imports systematically

# Fix UI component imports - replace bare "ui/" with proper relative paths
find . -name "*.tsx" -o -name "*.ts" | xargs sed -i 's|from "ui/|from "../components/ui/|g'

# Fix lib imports - replace bare lib paths with proper relative paths  
find . -name "*.tsx" -o -name "*.ts" | xargs sed -i 's|from "auth"|from "../lib/auth"|g'
find . -name "*.tsx" -o -name "*.ts" | xargs sed -i 's|from "queryClient"|from "../lib/queryClient"|g'
find . -name "*.tsx" -o -name "*.ts" | xargs sed -i 's|from "logout"|from "../lib/logout"|g'

# Fix hook imports
find . -name "*.tsx" -o -name "*.ts" | xargs sed -i 's|from "use-toast"|from "../hooks/use-toast"|g'
find . -name "*.tsx" -o -name "*.ts" | xargs sed -i 's|from "useAuth"|from "../hooks/useAuth"|g'

# Fix layout imports
find . -name "*.tsx" -o -name "*.ts" | xargs sed -i 's|from "layout/DashboardLayout"|from "../components/layout/DashboardLayout"|g'
find . -name "*.tsx" -o -name "*.ts" | xargs sed -i 's|from "layouts/InfoPageLayout"|from "../components/layouts/InfoPageLayout"|g'

echo "Import fixes applied"
