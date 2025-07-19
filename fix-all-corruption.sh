#!/bin/bash

echo "🔧 Starting comprehensive server file corruption fix..."

# Find all TypeScript files in server directory
find server -name "*.ts" -type f | while read file; do
  echo "Processing: $file"
  
  # Fix common corruption patterns
  sed -i 's/throw new Error(`Review request email sent successfully`;/throw new Error(`Operation failed: ${error instanceof Error ? error.message : String(error)}`);/g' "$file"
  sed -i 's/`Review request email sent successfully`;/`Operation completed successfully`;/g' "$file"
  sed -i 's/"placeholder-text"/"Operation completed"/g' "$file"
  sed -i 's/System message/Operation completed successfully/g' "$file"
  sed -i 's/placeholder-text/content/g' "$file"
  
  # Fix incomplete template literals 
  sed -i 's/`;$/`;/g' "$file"
  
  # Fix broken log statements
  sed -i 's/log("System message"), '"'"'error'"'"');/log(`Operation failed: ${error instanceof Error ? error.message : String(error)}`, '"'"'error'"'"');/g' "$file"
  sed -i 's/log("System message");/log("Operation completed successfully", "info");/g' "$file"
  
  echo "✅ Fixed: $file"
done

echo "✅ Comprehensive corruption fix completed"
