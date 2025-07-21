#!/bin/bash

echo "Final recovery push - fixing remaining critical syntax errors..."

# Fix all malformed method calls in fetch requests
find server/ -name "*.ts" -exec sed -i 's/method: '\''POST'\'',/method: "POST",/g' {} \;
find server/ -name "*.ts" -exec sed -i 's/method: '\''GET'\'',/method: "GET",/g' {} \;

# Fix remaining template literal issues
find server/ -name "*.ts" -exec sed -i 's/\\\$\{/\${/g' {} \;

# Fix any remaining double indentation issues
find server/ -name "*.ts" -exec sed -i 's/            const/      const/g' {} \;

# Fix malformed JSON.stringify calls
find server/ -name "*.ts" -exec sed -i 's/JSON\.stringify({/JSON.stringify({/g' {} \;

# Final regex cleanup for broken patterns
find server/ -name "*.ts" -exec sed -i 's/wpConfig\.url\.replace(\*\/\/\*\$\*\/, "")/wpConfig.url.replace(\/\\\$\/, "")/g' {} \;

echo "Final recovery push complete!"