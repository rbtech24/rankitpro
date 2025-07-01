#!/bin/bash

# Fix remaining hook imports
find . -name "*.tsx" -o -name "*.ts" | xargs sed -i 's|from "use-review-requests"|from "../hooks/use-review-requests"|g'
find . -name "*.tsx" -o -name "*.ts" | xargs sed -i 's|from "use-testimonials"|from "../hooks/use-testimonials"|g'
find . -name "*.tsx" -o -name "*.ts" | xargs sed -i 's|from "use-companies"|from "../hooks/use-companies"|g'
find . -name "*.tsx" -o -name "*.ts" | xargs sed -i 's|from "use-technicians"|from "../hooks/use-technicians"|g'

echo "Remaining hook import fixes applied"
