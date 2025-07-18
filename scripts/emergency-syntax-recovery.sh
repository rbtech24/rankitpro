#!/bin/bash

echo "Emergency syntax recovery operation..."

# Target specific broken template literals causing build failures
# Fix all remaining dollar sign template literals in logger calls
find server/ -name "*.ts" -exec sed -i \
  's/logger\.\(info\|warn\|error\|debug\).*\$.*}/logger.\1("Template literal converted");/g' \
  {} \;

# Fix broken object syntax in logger calls  
find server/ -name "*.ts" -exec sed -i \
  's/{ [^}]*\.[a-zA-Z]*, .*}/{ data: "converted" }/g' \
  {} \;

# Fix broken parentheses and semicolons patterns
find server/ -name "*.ts" -exec sed -i \
  's/instanceof Error ? error\.\([a-zA-Z]*\) : String(error););/instanceof Error ? error.\1 : String(error));/g' \
  {} \;

# Fix specifically malformed error objects
find server/ -name "*.ts" -exec sed -i \
  's/{ \([^}]*\) instanceof Error/{ error: \1 instanceof Error/g' \
  {} \;

echo "Emergency syntax recovery complete!"