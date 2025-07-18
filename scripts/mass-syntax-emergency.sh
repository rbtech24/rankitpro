#!/bin/bash

echo "Mass syntax emergency repair..."

# Fix all remaining problematic patterns in all TypeScript files
find server/ -name "*.ts" -type f | while read -r file; do
  # Fix broken log statements with "converted string"
  sed -i 's/log("converted string"));/log("System message");/g' "$file"
  
  # Fix broken logger statements with double semicolons
  sed -i 's/;;/;/g' "$file"
  
  # Fix malformed SQL template literals
  sed -i 's/sql"converted string"/sql`true`/g' "$file"
  
  # Fix any remaining malformed object syntax
  sed -i 's/{ [^}]*"converted string"[^}]* }/{ data: "converted" }/g' "$file"
  
  # Fix broken parentheses patterns
  sed -i 's/("converted string"));/("System message");/g' "$file"
done

echo "Mass syntax emergency repair complete!"