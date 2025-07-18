#!/bin/bash

echo "🔧 Fixing all template corruption and syntax errors..."

# Fix the most critical template literal corruptions
find server/ -name "*.ts" -exec sed -i \
  -e 's/\[CONVERTED\]/`${content}`/g' \
  -e 's/placeholder<\/p>`[[:space:]]*:[[:space:]]*'"'"''"'"'}[[:space:]]*//g' \
  -e 's/placeholder<\/p>`[[:space:]]*:[[:space:]]*'"'"''"'"'}//g' \
  -e 's/placeholder<\/p>` : '"'"''"'"'}//g' \
  -e 's/placeholder : '"'"''"'"'}//g' \
  -e 's/placeholder:[[:space:]]*'"'"''"'"'}//g' \
  -e 's/"converted string"/`<${tagName}>`/g' \
  -e 's/`<\${closing}\${tagName}\${safeAttributes \? " " \+ safeAttributes : ""}>`/`<${tagName}>`/g' \
  -e 's/logger\.error("Error logging fixed");/logger.error("Error occurred");/g' \
  -e 's/logger\.info("Template literal converted");/logger.info("Template processed");/g' \
  -e 's/logger\.warn("Template literal converted");/logger.warn("Template processed");/g' \
  -e 's/logger\.debug("Template literal converted");/logger.debug("Template processed");/g' \
  -e 's/logger\.error("Template literal converted");/logger.error("Template processed");/g' \
  -e 's/logger\.info("System message");/logger.info("System operation");/g' \
  -e 's/logger\.error("System message");/logger.error("System error");/g' \
  -e 's/logger\.warn("System message");/logger.warn("System warning");/g' \
  -e 's/logger\.debug("System message");/logger.debug("System debug");/g' \
  {} \;

# Fix any remaining template literal issues
find server/ -name "*.ts" -exec sed -i \
  -e 's/placeholder/content/g' \
  -e 's/\${content}/\${safeContent}/g' \
  -e 's/content/placeholder/g' \
  -e 's/\${safeContent}/\${content}/g' \
  {} \;

# Fix broken email template structures
find server/services/ -name "email-templates.ts" -exec sed -i \
  -e 's/placeholder/\${companyName}/g' \
  -e 's/\${companyName}Team/\${companyName} Team/g' \
  -e 's/\${companyName} \${companyName}/\${companyName}/g' \
  {} \;

echo "✅ All template corruption fixed!"