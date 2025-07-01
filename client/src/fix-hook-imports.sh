#!/bin/bash

# Fix remaining hook imports
find . -name "*.tsx" -o -name "*.ts" | xargs sed -i 's|from "use-mobile"|from "../hooks/use-mobile"|g'
find . -name "*.tsx" -o -name "*.ts" | xargs sed -i 's|from "use-isAuthenticated"|from "../hooks/use-isAuthenticated"|g'
find . -name "*.tsx" -o -name "*.ts" | xargs sed -i 's|from "use-user"|from "../hooks/use-user"|g'

echo "Hook import fixes applied"
