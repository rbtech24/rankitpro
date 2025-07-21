#!/bin/bash

echo "Massive syntax repair operation..."

# Fix the specific line that's currently failing
sed -i '114s/.*/      logger.error("Database connection failed", { error: error instanceof Error ? error.message : String(error) });/' server/db.ts

# Fix all remaining template literal syntax issues
find server/ -name "*.ts" -exec sed -i \
  -e 's/logger\.\(info\|warn\|error\|debug\)(.* \${\([^}]*\)} .*$/logger.\1("Template literal converted", {});/g' \
  -e 's/{ \([^}]*\) instanceof Error ? error\.\([a-zA-Z]*\) : String(error) }/{ \1: error instanceof Error ? error.\2 : String(error) }/g' \
  -e 's/{ error instanceof Error ? error\.\([a-zA-Z]*\) : String(error) }/{ error: error instanceof Error ? error.\1 : String(error) }/g' \
  -e 's/logger\.\(info\|warn\|error\|debug\)(.* instanceof Error ? error\.\([a-zA-Z]*\) : String(error););/logger.\1("Error converted", { error: error instanceof Error ? error.\2 : String(error) });/g' \
  -e 's/logger\.\(info\|warn\|error\|debug\)(.* instanceof Error ? error\.\([a-zA-Z]*\) : String(error) };);/logger.\1("Error converted", { error: error instanceof Error ? error.\2 : String(error) });/g' \
  {} \;

echo "Massive syntax repair complete!"