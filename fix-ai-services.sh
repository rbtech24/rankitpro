#!/bin/bash

echo "🔧 Fixing AI service template corruptions..."

# Fix Anthropic service
find server/ai/ -name "anthropic-service.ts" -exec sed -i \
  -e 's/Job Type: placeholder/Job Type: ${params.jobType}/g' \
  -e 's/Location: placeholder/Location: ${params.location}/g' \
  -e 's/Technician: placeholder/Technician: ${params.technicianName}/g' \
  -e 's/Notes: placeholder/Notes: ${params.notes || "No additional notes"}/g' \
  -e 's/placeholder` : '"'"''"'"'}/params.customerInfo ? `Customer: ${params.customerInfo}` : '"'"''"'"'}/g' \
  -e 's/placeholder:/content:/g' \
  -e 's/{ success: true }/{ role: "user", content: prompt }/g' \
  -e 's/response\.placeholder/response.content/g' \
  -e 's/logger\.error("Unhandled error occurred");/logger.error("AI service error", { error: error.message || error });/g' \
  -e 's/throw new Error("System message");/throw new Error("Failed to generate content");/g' \
  {} \;

# Fix XAI service
find server/ai/ -name "xai-service.ts" -exec sed -i \
  -e 's/Job Type: placeholder/Job Type: ${params.jobType}/g' \
  -e 's/Location: placeholder/Location: ${params.location}/g' \
  -e 's/Technician: placeholder/Technician: ${params.technicianName}/g' \
  -e 's/Notes: placeholder/Notes: ${params.notes || "No additional notes"}/g' \
  -e 's/placeholder` : '"'"''"'"'}/params.customerInfo ? `Customer: ${params.customerInfo}` : '"'"''"'"'}/g' \
  -e 's/placeholder:/content:/g' \
  -e 's/{ success: true }/{ role: "user", content: prompt }/g' \
  -e 's/response\.placeholder/response.content/g' \
  -e 's/logger\.error("Unhandled error occurred");/logger.error("AI service error", { error: error.message || error });/g' \
  -e 's/throw new Error("System message");/throw new Error("Failed to generate content");/g' \
  {} \;

echo "✅ AI service fixes complete!"