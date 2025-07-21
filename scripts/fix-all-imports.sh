#!/bin/bash

echo "Fixing all structured-logger import paths..."

# Fix imports in root server files
find server/ -maxdepth 1 -name "*.ts" -exec sed -i 's|from "./structured-logger"|from "./services/structured-logger"|g' {} \;

# Fix imports in subdirectories - they need to go back to parent first
find server/routes/ -name "*.ts" -exec sed -i 's|from "./services/structured-logger"|from "../services/structured-logger"|g' {} \;
find server/routes/ -name "*.ts" -exec sed -i 's|from "./structured-logger"|from "../services/structured-logger"|g' {} \;

find server/ai/ -name "*.ts" -exec sed -i 's|from "./services/structured-logger"|from "../services/structured-logger"|g' {} \;
find server/ai/ -name "*.ts" -exec sed -i 's|from "./structured-logger"|from "../services/structured-logger"|g' {} \;

find server/middleware/ -name "*.ts" -exec sed -i 's|from "./services/structured-logger"|from "../services/structured-logger"|g' {} \;
find server/middleware/ -name "*.ts" -exec sed -i 's|from "./structured-logger"|from "../services/structured-logger"|g' {} \;

find server/utils/ -name "*.ts" -exec sed -i 's|from "./services/structured-logger"|from "../services/structured-logger"|g' {} \;
find server/utils/ -name "*.ts" -exec sed -i 's|from "./structured-logger"|from "../services/structured-logger"|g' {} \;

# Fix imports in nested directories
find server/routes/mobile/ -name "*.ts" -exec sed -i 's|from "./services/structured-logger"|from "../../services/structured-logger"|g' {} \;
find server/routes/mobile/ -name "*.ts" -exec sed -i 's|from "../services/structured-logger"|from "../../services/structured-logger"|g' {} \;
find server/routes/mobile/ -name "*.ts" -exec sed -i 's|from "./structured-logger"|from "../../services/structured-logger"|g' {} \;

find server/services/crm-integration/ -name "*.ts" -exec sed -i 's|from "./services/structured-logger"|from "../structured-logger"|g' {} \;
find server/services/crm-integration/ -name "*.ts" -exec sed -i 's|from "../services/structured-logger"|from "../structured-logger"|g' {} \;
find server/services/crm-integration/ -name "*.ts" -exec sed -i 's|from "./structured-logger"|from "../structured-logger"|g' {} \;

find server/services/storage-modules/ -name "*.ts" -exec sed -i 's|from "./services/structured-logger"|from "../structured-logger"|g' {} \;
find server/services/storage-modules/ -name "*.ts" -exec sed -i 's|from "./structured-logger"|from "../structured-logger"|g' {} \;

# Fix services directory itself - they should import relatively within same directory
find server/services/ -maxdepth 1 -name "*.ts" -exec sed -i 's|from "./services/structured-logger"|from "./structured-logger"|g' {} \;

echo "Import path fixes complete!"