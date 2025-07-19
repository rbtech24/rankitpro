#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

// Files that contain template corruption
const corruptedFiles = [
  'server/routes.ts',
  'server/routes/wordpress.ts', 
  'server/routes/wordpress-broken.ts',
  'server/routes/integration.ts',
  'server/routes/embed.ts'
];

// Function to fix template corruption in a file
function fixTemplateCorruption(filePath) {
  console.log(`Fixing template corruption in: ${filePath}`);
  
  try {
    let content = fs.readFileSync(filePath, 'utf8');
    let fixes = 0;
    
    // Fix CSS justify-placeholder -> justify-content
    const beforeJustify = content;
    content = content.replace(/justify-placeholder/g, 'justify-content');
    if (content !== beforeJustify) {
      fixes++;
      console.log(`  - Fixed justify-placeholder -> justify-content`);
    }
    
    // Fix corrupted template literals and database fields
    const beforeTemplate = content;
    content = content.replace(/placeholder(?!Generation|_generation)/g, 'content');
    if (content !== beforeTemplate) {
      fixes++;
      console.log(`  - Fixed placeholder -> content in database fields`);
    }
    
    // Fix specific corrupted HTML attributes
    content = content.replace(/placeholder="width=device-width/g, 'content="width=device-width');
    content = content.replace(/meta name="viewport" placeholder=/g, 'meta name="viewport" content=');
    
    // Fix corrupted CSS body styles
    content = content.replace(/body { success: true }/g, 'body { font-family: Arial, sans-serif; margin: 0; padding: 0; }');
    
    // Write the fixed content back
    if (fixes > 0) {
      fs.writeFileSync(filePath, content, 'utf8');
      console.log(`  ✅ Applied ${fixes} fixes to ${filePath}`);
    } else {
      console.log(`  ℹ️  No fixes needed for ${filePath}`);
    }
    
  } catch (error) {
    console.error(`  ❌ Error fixing ${filePath}:`, error.message);
  }
}

// Fix all corrupted files
console.log('🔧 Starting template corruption fix...\n');

corruptedFiles.forEach(file => {
  if (fs.existsSync(file)) {
    fixTemplateCorruption(file);
  } else {
    console.log(`⚠️  File not found: ${file}`);
  }
});

console.log('\n✅ Template corruption fix completed!');