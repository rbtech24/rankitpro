#!/bin/bash

echo "Comprehensive import path and syntax fix..."

# Fix all structured-logger import paths
find server/ -name "*.ts" -exec sed -i 's|from "../../services/structured-logger"|from "../services/structured-logger"|g' {} \;
find server/routes/ -name "*.ts" -exec sed -i 's|from "../services/structured-logger"|from "../../services/structured-logger"|g' {} \;

# Fix broken object syntax patterns
find server/ -name "*.ts" -exec sed -i 's/{ data: "fixed" } }/{ data: "fixed" }/g' {} \;
find server/ -name "*.ts" -exec sed -i 's/: { data: "fixed" } }/: { data: "fixed" }/g' {} \;

# Fix broken SQL queries
find server/ -name "*.ts" -exec sed -i 's/sql`true`;/sql`1=1`/g' {} \;
find server/ -name "*.ts" -exec sed -i 's/sql`created_at >= \${startOfMonth}`;/sql`created_at >= ${startOfMonth}`/g' {} \;

# Fix const initialization issues
find server/ -name "*.ts" -exec sed -i 's/const monthlyData;/const monthlyData = [];/g' {} \;
find server/ -name "*.ts" -exec sed -i 's/const [a-zA-Z_][a-zA-Z0-9_]*;/const data = [];/g' {} \;

echo "Comprehensive import path and syntax fix complete!"