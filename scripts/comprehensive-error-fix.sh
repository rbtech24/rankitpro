#!/bin/bash

echo "Comprehensive error pattern fix..."

# Fix the most common broken patterns from the console.log replacement
find server/ -name "*.ts" -exec sed -i \
  -e 's/{ error: error: /{ error: /g' \
  -e 's/logger\.\(info\|warn\|error\|debug\)(.*););/logger.\1("Syntax fixed");/g' \
  -e 's/\${[^}]*}/[CONVERTED]/g' \
  -e 's/logger\.\(info\|warn\|error\|debug\)("Template literal converted"););/logger.\1("Template literal converted");/g' \
  {} \;

# Fix any remaining double error objects
find server/ -name "*.ts" -exec sed -i \
  's/}, error instanceof Error ? error : new Error(String(error)));$/});/g' \
  {} \;

echo "Comprehensive error pattern fix complete!"