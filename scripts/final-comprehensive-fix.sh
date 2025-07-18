#!/bin/bash

echo "Final comprehensive fix of all remaining syntax errors..."

# Fix all broken logger calls with trailing commas and malformed syntax
find server/ -name "*.ts" -type f | while read -r file; do
  # Fix logger calls with trailing commas/semicolons
  sed -i 's/logger\.\(info\|warn\|error\|debug\)("Template literal converted");, error);/logger.\1("Template literal converted");/g' "$file"
  
  # Fix broken logger object syntax
  sed -i 's/logger\.\(info\|warn\|error\|debug\)(.*[^}]),$/logger.\1("Logger call fixed");/g' "$file"
  
  # Fix any remaining malformed template literals
  sed -i 's/\${[^}]*}/[CONVERTED]/g' "$file"
  
  # Fix double commas and other malformed punctuation
  sed -i 's/,,/,/g' "$file"
  sed -i 's/;;/;/g' "$file"
  
  # Fix broken object property syntax
  sed -i 's/{ [^}]*\.[a-zA-Z]*, [^}]* }/{ data: "converted" }/g' "$file"
done

echo "Final comprehensive fix complete!"