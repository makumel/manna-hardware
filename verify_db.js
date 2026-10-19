const { db } = require('./db');

const rows = db.prepare(`
  SELECT id, name, category, image 
  FROM products 
  WHERE name LIKE '%Purlin%' 
     OR name LIKE '%Boysen%' 
     OR name LIKE '%Island%' 
     OR name LIKE '%Shark%' 
     OR name LIKE '%Amerilock%'
  LIMIT 8
`).all();

console.log('Sample verified items from database:');
rows.forEach(r => {
  console.log(`[${r.id}] ${r.name}`);
  console.log(`  Category: ${r.category}`);
  console.log(`  Image:    ${r.image}\n`);
});
