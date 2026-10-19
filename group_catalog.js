const fs = require('fs');
const catalog = JSON.parse(fs.readFileSync('catalog.json', 'utf8'));

// Build cleaner query grouping
function getNormalizedGroup(name) {
  let s = name.trim();
  // Remove trailing sizes or units
  s = s.replace(/\(.*?\)/g, '');
  s = s.replace(/#\d+[\/\d\.-]*/g, '');
  s = s.replace(/\b\d+[\/\d\.-]*\s*(mm|inch|in|"|cm|m|mtr|meter|kg|g|liters|liter|ltr|gal|gln)\b/gi, '');
  s = s.replace(/\b(SALE|GLn|Gal|Gl|gln|pc|pcs|box|roll|mtr|bag|set|Wood|Metal)\b/gi, '');
  s = s.replace(/\s+/g, ' ').trim();
  if (s.length < 3) s = name.trim();
  return s + ' Philippines';
}

const groups = new Map();
catalog.forEach(item => {
  const g = getNormalizedGroup(item.name);
  if (!groups.has(g)) groups.set(g, []);
  groups.get(g).push(item.id);
});

console.log('Group count:', groups.size);
const sorted = Array.from(groups.entries()).sort((a,b) => b[1].length - a[1].length);
console.log('Top 20 largest groups:');
sorted.slice(0, 20).forEach(([k, v]) => console.log(`  [${v.length} items]: ${k}`));

// Save the query mappings
const queryMapping = {};
for (const [k, v] of groups.entries()) {
  queryMapping[k] = v;
}
fs.writeFileSync('query_mapping.json', JSON.stringify(queryMapping, null, 2));
console.log('Saved query_mapping.json');
