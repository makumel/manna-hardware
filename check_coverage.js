const fs = require('fs');

const catalog = JSON.parse(fs.readFileSync('catalog.json', 'utf8'));
const archetypes = JSON.parse(fs.readFileSync('archetype_mapping.json', 'utf8'));
const verified = JSON.parse(fs.readFileSync('real_hardware_images.json', 'utf8'));

// Build item-to-image map
let coveredCount = 0;
const uncovered = [];

catalog.forEach(item => {
  let matchedImg = null;
  for (const [query, urls] of Object.entries(verified)) {
    if (archetypes[query] && archetypes[query].includes(item.id)) {
      matchedImg = urls[0];
      break;
    }
  }
  if (matchedImg) {
    coveredCount++;
  } else {
    uncovered.push(item);
  }
});

console.log(`Covered: ${coveredCount} / ${catalog.length} (${((coveredCount/catalog.length)*100).toFixed(1)}%)`);
console.log(`Uncovered: ${uncovered.length}`);
console.log('Sample uncovered items:');
uncovered.slice(0, 10).forEach(u => console.log(`  [${u.id}] ${u.name} (${u.category})`));
