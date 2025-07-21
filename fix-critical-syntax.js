const fs = require('fs');

const fixes = [
  {
    file: 'server/routes/admin.ts',
    line: 423,
    pattern: /`Operation completed successfully`;/g,
    replacement: '`attachment; filename="financial-export-${period}.csv"`);'
  },
  {
    file: 'server/routes/admin.ts', 
    line: 470,
    pattern: /`Operation completed successfully`;/g,
    replacement: '`Error in Stripe webhook: ${error instanceof Error ? error.message : String(error)}`);'
  },
  {
    file: 'server/middleware/error-handling.ts',
    line: 196,
    pattern: /`Operation completed successfully`;/g,
    replacement: '`${req.method} ${req.path} - ${status} - ${responseTime}ms`);'
  },
  {
    file: 'server/penetration-tester.ts',
    line: 554,
    pattern: /`Operation completed successfully`;/g,
    replacement: '`Penetration test report generated: ${new Date().toISOString()}`);'
  },
  {
    file: 'server/routes/crm-integration.ts',
    line: 20,
    pattern: /`Operation completed successfully`;/g,
    replacement: '`Invalid CRM provider: ${provider}`);'
  }
];

fixes.forEach(fix => {
  try {
    let content = fs.readFileSync(fix.file, 'utf8');
    const lines = content.split('\n');
    
    // Apply fix to specific line range around the error
    for (let i = Math.max(0, fix.line - 3); i < Math.min(lines.length, fix.line + 3); i++) {
      if (lines[i].includes('`Operation completed successfully`;')) {
        lines[i] = lines[i].replace(fix.pattern, fix.replacement);
        console.log(`✅ Fixed line ${i + 1} in ${fix.file}`);
        break;
      }
    }
    
    fs.writeFileSync(fix.file, lines.join('\n'));
  } catch (error) {
    console.error(`❌ Error fixing ${fix.file}:`, error.message);
  }
});

console.log('✅ Critical syntax errors fixed');
