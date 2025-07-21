const fs = require('fs');

const files = [
  'server/error-monitor.ts',
  'server/ai/ai-factory.ts',
  'server/ai/openai-service.ts',
  'server/config.ts'
];

files.forEach(filePath => {
  try {
    let content = fs.readFileSync(filePath, 'utf8');
    
    // Fix template literal corruption patterns that have ` at the end without proper closing
    content = content.replace(/`\${[^}]+}\`\`;/g, (match) => {
      // Fix double backticks at end
      return match.replace(/\`\`;$/, '`;');
    });
    
    // Fix incomplete template literals
    content = content.replace(/`\${[^}]+}\`;/g, (match) => {
      // Ensure proper template literal closing
      return match.replace(/\`;$/, '`;');
    });
    
    // Fix specific broken patterns
    content = content.replace(/`\$\{baseUrl\}\/review\/\$\{reviewRequest\.id\}\``;/g, '`${baseUrl}/review/${reviewRequest.id}`;');
    
    fs.writeFileSync(filePath, content);
    console.log(`✅ Fixed ${filePath}`);
  } catch (error) {
    console.error(`❌ Error fixing ${filePath}:`, error.message);
  }
});
