#!/bin/bash

echo "🎯 Starting syntax error hunter..."

# Function to fix the next syntax error
fix_next_error() {
  local error_line=$(npx tsc --noEmit --project . 2>&1 | grep "ERROR:" | head -1)
  
  if [[ -z "$error_line" ]]; then
    echo "✅ No syntax errors found!"
    return 1
  fi
  
  echo "Found error: $error_line"
  
  # Extract file and line number
  local file=$(echo "$error_line" | cut -d':' -f1)
  local line_num=$(echo "$error_line" | cut -d':' -f2)
  
  if [[ -f "$file" ]]; then
    echo "Fixing $file at line $line_num..."
    
    # Common fixes for corruption patterns
    sed -i "${line_num}s/\`Operation completed successfully\`;/\`Template string content\`);/" "$file"
    sed -i "${line_num}s/\`;$/\`;/" "$file"
    sed -i "${line_num}s/\`[^}]*\`\`;/\`Template content\`);/" "$file"
    
    echo "✅ Applied fixes to $file"
    return 0
  else
    echo "❌ File $file not found"
    return 1
  fi
}

# Hunt and fix errors until none remain
for i in {1..10}; do
  echo "--- Round $i ---"
  if ! fix_next_error; then
    break
  fi
  sleep 1
done

echo "🎯 Syntax error hunting completed!"
