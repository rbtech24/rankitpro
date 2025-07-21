#!/bin/bash

# Fix corrupted template literals in AI service files
files=("server/ai/openai-service.ts" "server/ai/anthropic-service.ts" "server/ai/xai-service.ts")

for file in "${files[@]}"; do
  if [ -f "$file" ]; then
    echo "Fixing $file..."
    
    # Fix the corrupted error messages
    sed -i 's/throw new Error(`Review request email sent successfully`;/throw new Error(`Failed to generate content: ${error instanceof Error ? error.message : String(error)}`);/g' "$file"
    
    # Fix other corruption patterns
    sed -i 's/`Review request email sent successfully`;/`Failed to generate content: ${error instanceof Error ? error.message : String(error)}`;/g' "$file"
    
    echo "✅ Fixed $file"
  else
    echo "⚠️  $file not found"
  fi
done

echo "✅ All AI service files fixed"
