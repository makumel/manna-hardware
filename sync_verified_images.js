const fs = require('fs');
const path = require('path');
const { db, seedProductsFromCatalog } = require('./db');

// Cleaning function matching vision_google_matcher.py
function getCleanQuery(name) {
  let clean = name.trim();
  clean = clean.replace(/[\(\)#\"\'/]/g, ' ');
  clean = clean.replace(/\b(GLn|Gln|Gl|pc|box|roll|bot|kg|set|pcs)\b/gi, ' ');
  clean = clean.replace(/\s+/g, ' ').trim();

  const lower = clean.toLowerCase();
  if (lower.startsWith('c-purlin') || lower.includes('purlin')) {
    return 'C-purlins Philippines';
  }
  if (lower.includes('island paint qde')) {
    const match = clean.match(/qde\s+([a-zA-Z\s]+)/i);
    const color = match ? match[1].trim() : '';
    return `Island Paint QDE ${color} Philippines`.replace(/\s+/g, ' ').trim();
  }
  if (lower.includes('roofkote')) {
    const match = clean.match(/roofkote\s+([a-zA-Z\s]+)/i);
    const color = match ? match[1].trim() : '';
    return `Boysen Roofkote ${color} Philippines`.replace(/\s+/g, ' ').trim();
  }
  if (lower.includes('stikwel')) {
    return 'Stikwel Glue Philippines';
  }
  if (lower.includes('shark')) {
    if (lower.includes('faucet')) return `Shark Faucet ${clean} Philippines`;
    return `Shark Shower Faucet Philippines`;
  }
  if (lower.includes('amerilock')) {
    return 'Amerilock Hinge Philippines';
  }

  return `${clean} Philippines`;
}

function sync() {
  const verifiedPath = path.join(__dirname, 'verified_google_images.json');
  const catalogPath = path.join(__dirname, 'catalog.json');
  const storefrontCatalogPath = path.join(__dirname, 'storefront-app', 'src', 'catalog.json');

  if (!fs.existsSync(verifiedPath)) {
    console.log('No verified_google_images.json found yet.');
    return;
  }

  const verified = JSON.parse(fs.readFileSync(verifiedPath, 'utf8'));
  const catalog = JSON.parse(fs.readFileSync(catalogPath, 'utf8'));

  console.log(`Total verified queries available: ${Object.keys(verified).length}`);

  let updatedCount = 0;
  for (const item of catalog) {
    const q = getCleanQuery(item.name);
    if (verified[q] && verified[q].image_url) {
      item.image = verified[q].image_url;
      updatedCount++;
    }
  }

  console.log(`Updated ${updatedCount}/${catalog.length} items with verified Google hardware images.`);

  // Write catalog.json
  fs.writeFileSync(catalogPath, JSON.stringify(catalog, null, 2), 'utf8');
  console.log(`Saved ${catalogPath}`);

  // Write storefront catalog
  if (fs.existsSync(path.dirname(storefrontCatalogPath))) {
    fs.writeFileSync(storefrontCatalogPath, JSON.stringify(catalog, null, 2), 'utf8');
    console.log(`Saved ${storefrontCatalogPath}`);
  }

  // Update SQLite database directly
  const updateStmt = db.prepare('UPDATE products SET image = ? WHERE id = ?');
  const updateMany = db.transaction((items) => {
    for (const item of items) {
      if (item.image) {
        updateStmt.run(item.image, item.id);
      }
    }
  });

  updateMany(catalog);
  console.log('Successfully synced images into database.sqlite products table!');
}

sync();
