#!/bin/bash

# Fix all remaining template literal syntax errors
echo "Fixing all template literal syntax errors..."

# Find all TypeScript files with broken template literals and fix them
find server/ -name "*.ts" -exec sed -i \
  -e "s/logger\.\(info\|warn\|error\|debug\)('\([^']*\)\${[^}]*}[^']*');/logger.\1(\"\2\", {});/g" \
  -e "s/logger\.\(info\|warn\|error\|debug\)('\([^']*\)\${[^}]*}[^']*');/logger.\1(\"\2\", {});/g" \
  -e "s/logger\.\(info\|warn\|error\|debug\)('\([^']*\)', { \([^}]*\) \}, [^)]*);/logger.\1(\"\2\", { \3 });/g" \
  {} \;

# Fix specific broken patterns we know about
find server/ -name "*.ts" -exec sed -i \
  -e "s/{ \([^}]*\) instanceof Error ? error\.\([a-zA-Z]*\) : String(error }/{ \1: error instanceof Error ? error.\2 : String(error) }/g" \
  -e "s/{ error instanceof Error ? error\.\([a-zA-Z]*\) : String(error }/{ error: error instanceof Error ? error.\1 : String(error) }/g" \
  {} \;

# Fix JSON.stringify patterns
find server/ -name "*.ts" -exec sed -i \
  -e "s/{ JSON\.stringify(\([^)]*\) }/{ data: JSON.stringify(\1) }/g" \
  {} \;

echo "Template literal fixes complete!"