const fs = require('fs');
const catalog = JSON.parse(fs.readFileSync('catalog.json', 'utf8'));

function getSearchQuery(item) {
  let name = item.name.trim();

  // Normalize special characters
  let clean = name.replace(/[\(\)#\'\"]/g, ' ');
  // Remove packaging / units
  clean = clean.replace(/\b(SALE|GLn|Gal|Gl|gln|pc|pcs|box|roll|mtr|bag|set|bot|kg)\b/gi, ' ');
  clean = clean.replace(/\s+/g, ' ').trim();

  // Specific high precision cleanup
  const lower = clean.toLowerCase();
  if (lower.startsWith('c-purlin') || lower.includes('purlin')) {
    return 'C-purlins Philippines';
  }
  if (lower.includes('island paint qde')) {
    // extract color
    const match = clean.match(/qde\s+([a-zA-Z\s]+)/i);
    const color = match ? match[1].trim() : '';
    return `Island Paint QDE ${color} Philippines`.replace(/\s+/g, ' ').trim();
  }
  if (lower.includes('roofkote')) {
    const match = clean.match(/roofkote\s+([a-zA-Z\s]+)/i);
    const color = match ? match[1].trim() : '';
    return `Boysen Roofkote ${color} Philippines`.replace(/\s+/g, ' ').trim();
  }
  
  return clean + ' Philippines';
}

const map = {};
catalog.forEach(item => {
  const q = getSearchQuery(item);
  if (!map[q]) map[q] = [];
  map[q].push(item.id);
});

console.log('Total items:', catalog.length);
console.log('Distinct search queries:', Object.keys(map).length);

// Check queries with most items
const sorted = Object.entries(map).sort((a, b) => b[1].length - a[1].length);
console.log('\nTop 20 most frequent queries:');
sorted.slice(0, 20).forEach(([q, items]) => {
  console.log(`  [${items.length} items] ${q}`);
});

fs.writeFileSync('item_queries.json', JSON.stringify(map, null, 2));
