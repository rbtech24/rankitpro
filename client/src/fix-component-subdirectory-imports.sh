#!/bin/bash

# Fix imports for components in subdirectories
# These components need to navigate up more levels to reach ui, lib, and hooks

# Fix all ui imports in subdirectories to use proper relative paths
find components -name "*.tsx" -o -name "*.ts" | xargs sed -i 's|from "\.\./components/ui/|from "../ui/|g'
find components -name "*.tsx" -o -name "*.ts" | xargs sed -i 's|from "\.\./lib/|from "../../lib/|g'
find components -name "*.tsx" -o -name "*.ts" | xargs sed -i 's|from "\.\./hooks/|from "../../hooks/|g'

# For deeper nested components (3 levels deep), we need even more relative paths
find components -path "*/*/*/\*" -name "*.tsx" -o -name "*.ts" | xargs sed -i 's|from "\.\./\.\./lib/|from "../../../lib/|g'
find components -path "*/*/*/\*" -name "*.tsx" -o -name "*.ts" | xargs sed -i 's|from "\.\./\.\./hooks/|from "../../../hooks/|g'

echo "Component subdirectory import fixes applied"
