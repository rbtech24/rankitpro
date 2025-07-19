const fs = require('fs');
const path = require('path');

// Function to fix template literal corruption in a file
function fixTemplateCorruption(filePath) {
  try {
    let content = fs.readFileSync(filePath, 'utf8');
    let hasChanges = false;
    
    // Fix common template literal corruptions
    const fixes = [
      // Fix broken template literal endings
      {
        pattern: /\/uploads\/checkins\/converted;/g,
        replacement: `/uploads/checkins/\${photo}\``
      },
      // Fix placeholder-text corruption
      {
        pattern: /"placeholder-text"/g,
        replacement: '`${baseUrl}/review/${reviewRequest.id}`'
      },
      // Fix System message corruption
      {
        pattern: /"System message"\)/g,
        replacement: '`Review request email sent successfully`'
      },
      // Fix log statement corruption
      {
        pattern: /log\("System message"\);/g,
        replacement: 'log(`SMS review request would be sent to ${reviewRequest.phone}`, "info");'
      }
    ];
    
    fixes.forEach(fix => {
      const newContent = content.replace(fix.pattern, fix.replacement);
      if (newContent !== content) {
        hasChanges = true;
        content = newContent;
        console.log(`Fixed pattern in ${filePath}`);
      }
    });
    
    if (hasChanges) {
      fs.writeFileSync(filePath, content);
      console.log(`✅ Fixed corruptions in ${filePath}`);
    }
    
  } catch (error) {
    console.error(`❌ Error processing ${filePath}:`, error.message);
  }
}

// Process all TypeScript files in server directory
function processDirectory(dirPath) {
  const files = fs.readdirSync(dirPath);
  
  files.forEach(file => {
    const fullPath = path.join(dirPath, file);
    const stat = fs.statSync(fullPath);
    
    if (stat.isDirectory()) {
      processDirectory(fullPath);
    } else if (file.endsWith('.ts') && !file.endsWith('.d.ts')) {
      fixTemplateCorruption(fullPath);
    }
  });
}

console.log('🔧 Starting template literal corruption fix...');
processDirectory('./server');
console.log('✅ Template literal corruption fix completed');
