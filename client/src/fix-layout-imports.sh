#!/bin/bash

# Fix layout component imports
find . -name "*.tsx" -o -name "*.ts" | xargs sed -i 's|from "layout/|from "../components/layout/|g'
find . -name "*.tsx" -o -name "*.ts" | xargs sed -i 's|from "layouts/|from "../components/layouts/|g'
find . -name "*.tsx" -o -name "*.ts" | xargs sed -i 's|from "widgets/|from "../components/widgets/|g'
find . -name "*.tsx" -o -name "*.ts" | xargs sed -i 's|from "settings/|from "../components/settings/|g'

echo "Layout import fixes applied"
