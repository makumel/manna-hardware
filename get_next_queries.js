const fs = require('fs');

const archetypes = JSON.parse(fs.readFileSync('archetype_mapping.json', 'utf8'));
const existing = JSON.parse(fs.readFileSync('real_hardware_images.json', 'utf8'));

const pending = [];
for (const [query, ids] of Object.entries(archetypes)) {
  if (!existing[query]) {
    pending.push({ query, count: ids.length });
  }
}

pending.sort((a,b) => b.count - a.count);

console.log(`Pending queries: ${pending.length}`);
console.log('Next 15 queries to fetch:');
console.log(JSON.stringify(pending.slice(0, 15).map(x => x.query), null, 2));
