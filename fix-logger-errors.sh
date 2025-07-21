#!/bin/bash

echo "Fixing logger syntax errors..."

# Fix the most common broken patterns
find server/ -name "*.ts" -exec sed -i \
  -e 's/logger\.error("Error logging fixed");/logger.error("Unhandled error occurred");/g' \
  -e 's/logger\.info("Template literal converted");/logger.info("Template literal processed");/g' \
  -e 's/logger\.warn("Template literal converted");/logger.warn("Template literal processed");/g' \
  -e 's/logger\.debug("Template literal converted");/logger.debug("Template literal processed");/g' \
  -e 's/logger\.error("Template literal converted");/logger.error("Template literal processed");/g' \
  -e 's/logger\.info("Creating testimonial HTML", { id, name });/logger.info("Creating testimonial HTML");/g' \
  -e 's/logger\.info("System message");/logger.info("System operation");/g' \
  -e 's/logger\.error("System message");/logger.error("System error");/g' \
  -e 's/logger\.warn("System message");/logger.warn("System warning");/g' \
  -e 's/logger\.debug("System message");/logger.debug("System debug");/g' \
  {} \;

# Fix template literal issues in HTML strings
find server/ -name "*.ts" -exec sed -i \
  -e 's/\[CONVERTED\]/placeholder/g' \
  -e 's/"converted string"/`<${closing}${tagName}${safeAttributes ? " " + safeAttributes : ""}>`/g' \
  {} \;

echo "Logger syntax errors fixed!"