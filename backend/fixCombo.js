const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, 'src', 'routes', 'admin', 'adminCombo.routes.js');

try {
  let content = fs.readFileSync(filePath, 'utf8');
  console.log('File size before:', content.length);
  
  const updated = content.replace(/createCombo/g, 'createCuratedCombo');
  console.log('Replacements made:', (content.match(/createCombo/g) || []).length);
  
  fs.writeFileSync(filePath, updated, 'utf8');
  console.log('File updated successfully');
  
  const verify = fs.readFileSync(filePath, 'utf8');
  console.log('File size after:', verify.length);
  console.log('Still has createCombo:', verify.includes('createCombo'));
  console.log('Now has createCuratedCombo:', verify.includes('createCuratedCombo'));
} catch (err) {
  console.error('Error:', err.message);
  process.exit(1);
}
