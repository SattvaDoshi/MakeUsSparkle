const fs = require('fs');

const data = JSON.parse(fs.readFileSync('eslint-report.json', 'utf16le'));

let totalErrors = 0;
let fileStats = [];
let ruleStats = {};

for (const file of data) {
  if (file.errorCount > 0) {
    fileStats.push({ path: file.filePath, errors: file.errorCount });
    totalErrors += file.errorCount;
    for (const msg of file.messages) {
      if (msg.severity === 2) {
        ruleStats[msg.ruleId] = (ruleStats[msg.ruleId] || 0) + 1;
      }
    }
  }
}

fileStats.sort((a, b) => b.errors - a.errors);

console.log('Total Errors:', totalErrors);
console.log('\nTop 10 Files by Error Count:');
fileStats.slice(0, 10).forEach(f => console.log(`${f.errors}: ${f.path}`));

console.log('\nErrors by Rule:');
for (const [rule, count] of Object.entries(ruleStats).sort((a, b) => b[1] - a[1])) {
  console.log(`${count}: ${rule}`);
}
