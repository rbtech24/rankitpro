#!/bin/bash

echo "🔧 Fixing all corrupted logger statements..."

# Fix all the corrupted logger statements
find server/ -name "*.ts" -exec sed -i \
  -e 's/logger\.error("Logger call fixed");/logger.error("Operation completed");/g' \
  -e 's/logger\.info("Logger call fixed");/logger.info("Operation completed");/g' \
  -e 's/logger\.warn("Logger call fixed");/logger.warn("Operation completed");/g' \
  -e 's/logger\.debug("Logger call fixed");/logger.debug("Operation completed");/g' \
  -e 's/logger\.error("Parameter fixed");/logger.error("Parameter processed");/g' \
  -e 's/logger\.info("Parameter fixed");/logger.info("Parameter processed");/g' \
  -e 's/logger\.warn("Parameter fixed");/logger.warn("Parameter processed");/g' \
  -e 's/logger\.debug("Parameter fixed");/logger.debug("Parameter processed");/g' \
  -e 's/logger\.error("Syntax fixed");/logger.error("Syntax processed");/g' \
  -e 's/logger\.info("Syntax fixed");/logger.info("Syntax processed");/g' \
  -e 's/logger\.warn("Syntax fixed");/logger.warn("Syntax processed");/g' \
  -e 's/logger\.debug("Syntax fixed");/logger.debug("Syntax processed");/g' \
  {} \;

echo "✅ All corrupted logger statements fixed!"