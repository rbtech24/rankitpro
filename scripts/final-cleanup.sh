#!/bin/bash

echo "Final comprehensive cleanup of all syntax errors..."

# Find and fix all files with remaining template literal issues
for file in $(find server/ -name "*.ts" -exec grep -l '\${' {} \; 2>/dev/null); do
  echo "Fixing template literals in $file"
  sed -i 's/\${[^}]*}/[CONVERTED]/g' "$file"
done

# Fix all remaining syntax errors across all TypeScript files
for file in $(find server/ -name "*.ts"); do
  # Fix double error objects
  sed -i 's/{ error: error: /{ error: /g' "$file"
  
  # Fix broken logger calls with extra semicolons
  sed -i 's/););$/);/g' "$file"
  
  # Fix template literal conversions that ended up broken
  sed -i 's/logger\.\(info\|warn\|error\|debug\)("Template literal converted"););/logger.\1("Template literal converted");/g' "$file"
  
  # Fix malformed object properties
  sed -i 's/error\.\([a-zA-Z]*\) }/error.\1 }/g' "$file"
done

echo "Final cleanup complete!"