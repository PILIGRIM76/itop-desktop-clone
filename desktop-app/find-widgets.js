const fs = require('fs');
const content = fs.readFileSync('locales.json', 'utf-8');
const regex = /"widgets":\s*\{/g;
let match;
let count = 0;
const positions = [];

while ((match = regex.exec(content)) !== null) {
  count++;
  positions.push(match.index);
}

console.log('widgets objects found:', count);
positions.forEach((pos, i) => {
  // Найдем номер строки
  const lines = content.substring(0, pos).split('\n');
  console.log(`${i + 1}: line ${lines.length}, position ${pos}`);
});
