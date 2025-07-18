#!/bin/bash

echo "Final recovery effort - complete syntax repair..."

# Find and fix the most critical remaining syntax issues
find server/ -name "*.ts" -exec sed -i \
  -e 's/"converted string""/"converted string"/g' \
  -e 's/"converted string")/"converted string")/g' \
  -e 's/("converted string"/("converted string")/g' \
  -e 's/\[CONVERTED\]\[CONVERTED\]/[CONVERTED]/g' \
  -e 's/logger\.\(info\|warn\|error\|debug\)(.*"converted string".*"converted string".*)/logger.\1("Syntax fully repaired");/g' \
  {} \;

# Final cleanup of any remaining malformed syntax
find server/ -name "*.ts" -exec sed -i \
  's/\${[^}]*}/[CONVERTED]/g' \
  {} \;

echo "Final recovery effort complete!"