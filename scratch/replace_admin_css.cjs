const fs = require('fs');
const path = require('path');

const adminDir = path.join(__dirname, '../src/pages/admin');
const files = fs.readdirSync(adminDir).filter(f => f.endsWith('.tsx') && f !== 'AdminLayout.tsx');

for (const file of files) {
  const filePath = path.join(adminDir, file);
  let content = fs.readFileSync(filePath, 'utf8');
  
  // Replace bg-surface-1 border border-border with glass-card
  content = content.replace(/bg-surface-1 border border-border/g, 'glass-card');
  content = content.replace(/bg-surface-1 border-border/g, 'glass-card');
  
  fs.writeFileSync(filePath, content, 'utf8');
  console.log(`Updated ${file}`);
}
