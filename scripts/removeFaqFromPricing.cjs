const fs = require('fs');
const path = 'src/pages/Pricing.tsx';
let s = fs.readFileSync(path, 'utf8');
const before = s;

const start = s.indexOf('const FAQ_ITEMS');
const end = s.indexOf('function PlanComparisonTable');

if (start === -1 || end === -1 || end <= start) {
  console.log('No FAQ blocks removed (markers not found)');
  process.exit(0);
}

s = s.slice(0, start) + s.slice(end);
fs.writeFileSync(path, s);
console.log('Removed inline FAQ blocks from Pricing.tsx');
