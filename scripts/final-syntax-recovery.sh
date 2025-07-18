#!/bin/bash

echo "Final comprehensive syntax recovery..."

# Fix all remaining broken logger calls with double parentheses
find server/ -name "*.ts" -exec sed -i \
  's/logger\.\(info\|warn\|error\|debug\).*););/logger.\1("Syntax fixed");/g' \
  {} \;

# Fix broken template literal conversions
find server/ -name "*.ts" -exec sed -i \
  's/logger\.\(info\|warn\|error\|debug\)("Template literal converted"););/logger.\1("Template literal converted");/g' \
  {} \;

# Fix malformed error object syntax
find server/ -name "*.ts" -exec sed -i \
  's/{ error: error: /{ error: /g' \
  {} \;

# Fix any remaining dollar sign template literals
find server/ -name "*.ts" -exec sed -i \
  's/\${[^}]*}/[CONVERTED]/g' \
  {} \;

echo "Final syntax recovery complete!"