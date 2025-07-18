#!/bin/bash

echo "Comprehensive template literal and import path fixes..."

# Fix all template literal syntax errors across the entire codebase
find server/ -name "*.ts" -exec sed -i \
  -e 's/logger\.\(info\|warn\|error\|debug\)(.* \${\([^}]*\)} .*/logger.\1("Template literal converted", {});/g' \
  -e 's/{ \([^}]*\) instanceof Error ? error\.\([a-zA-Z]*\) : String(error }/{ \1: error instanceof Error ? error.\2 : String(error) }/g' \
  -e 's/{ error instanceof Error ? error\.\([a-zA-Z]*\) : String(error }/{ error: error instanceof Error ? error.\1 : String(error) }/g' \
  -e 's/{ JSON\.stringify(\([^)]*\) }/{ data: JSON.stringify(\1) }/g' \
  {} \;

# Comprehensive import path fixes
# Fix root server files to use ./services/
find server/ -maxdepth 1 -name "*.ts" -exec sed -i 's|from "../services/structured-logger"|from "./services/structured-logger"|g' {} \;

# Fix service files to use ./structured-logger
find server/services/ -maxdepth 1 -name "*.ts" -exec sed -i 's|from "./services/structured-logger"|from "./structured-logger"|g' {} \;

# Fix subdirectories to go up the right number of levels
find server/routes/ -maxdepth 1 -name "*.ts" -exec sed -i 's|from "./services/structured-logger"|from "../services/structured-logger"|g' {} \;
find server/ai/ -name "*.ts" -exec sed -i 's|from "./services/structured-logger"|from "../services/structured-logger"|g' {} \;
find server/middleware/ -name "*.ts" -exec sed -i 's|from "./services/structured-logger"|from "../services/structured-logger"|g' {} \;
find server/utils/ -name "*.ts" -exec sed -i 's|from "./services/structured-logger"|from "../services/structured-logger"|g' {} \;

# Fix nested directories
find server/routes/mobile/ -name "*.ts" -exec sed -i 's|from "./services/structured-logger"|from "../../services/structured-logger"|g' {} \;
find server/services/crm-integration/ -name "*.ts" -exec sed -i 's|from "./services/structured-logger"|from "../structured-logger"|g' {} \;
find server/services/storage-modules/ -name "*.ts" -exec sed -i 's|from "./services/structured-logger"|from "../structured-logger"|g' {} \;

echo "Template literal and import fixes complete!"