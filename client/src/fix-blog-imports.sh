#!/bin/bash

# Fix blog and content component imports
find . -name "*.tsx" -o -name "*.ts" | xargs sed -i 's|from "blog/|from "../components/blog/|g'
find . -name "*.tsx" -o -name "*.ts" | xargs sed -i 's|from "content/|from "../components/content/|g'
find . -name "*.tsx" -o -name "*.ts" | xargs sed -i 's|from "chat/|from "../components/chat/|g'
find . -name "*.tsx" -o -name "*.ts" | xargs sed -i 's|from "reviews/|from "../components/reviews/|g'
find . -name "*.tsx" -o -name "*.ts" | xargs sed -i 's|from "testimonials/|from "../components/testimonials/|g'
find . -name "*.tsx" -o -name "*.ts" | xargs sed -i 's|from "wordpress/|from "../components/wordpress/|g'
find . -name "*.tsx" -o -name "*.ts" | xargs sed -i 's|from "mobile/|from "../components/mobile/|g'

echo "Blog and content import fixes applied"
