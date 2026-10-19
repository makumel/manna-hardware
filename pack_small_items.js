const fs = require('fs');

const catalogPath = 'catalog.json';
const storefrontCatalogPath = 'storefront-app/src/catalog.json';

const catalog = JSON.parse(fs.readFileSync(catalogPath, 'utf8'));

let packedCount = 0;

const updatedCatalog = catalog.map(item => {
  const n = item.name.toLowerCase();
  const isFastener = (
    n.includes('screw') || 
    n.includes('rivet') || 
    n.includes('nail') || 
    n.includes('washer') || 
    n.includes('tox') || 
    n.includes('tacks')
  );
  
  // Initialize discount_percent if not present
  const discountPercent = item.discount_percent || 0;

  // Criteria: price <= 5 pesos and > 0, or small fastener with unit pc/pcs and price <= 5
  if ((item.price <= 5.0 && item.price > 0) || (isFastener && (item.unit === 'pc' || item.unit === 'pcs' || !item.unit) && item.price <= 5.0)) {
    packedCount++;
    const origPrice = item.price;
    const origCapital = item.capital || (origPrice * 0.78);
    const origStock = item.stock || 100;

    const newPrice = Math.round(origPrice * 100);
    const newCapital = Math.round(origCapital * 100 * 100) / 100;
    const newStock = Math.max(1, Math.floor(origStock / 100));
    
    // Clean name to avoid duplicate (100 pcs/pack)
    let cleanName = item.name.replace(/\(100 pcs\/pack\)/gi, '').replace(/\(Pack of 100\)/gi, '').trim();
    cleanName = `${cleanName} (100 pcs/pack)`;

    return {
      ...item,
      name: cleanName,
      unit: 'pack (100 pcs)',
      price: newPrice,
      capital: newCapital,
      stock: newStock,
      discount_percent: discountPercent,
      description: `${item.description || ''} Sourced in commercial bulk packs of 100 pcs.`
    };
  }

  return {
    ...item,
    discount_percent: discountPercent
  };
});

console.log(`Successfully packed ${packedCount} small/sub-5 peso items into packs of 100!`);

fs.writeFileSync(catalogPath, JSON.stringify(updatedCatalog, null, 2));
fs.writeFileSync(storefrontCatalogPath, JSON.stringify(updatedCatalog, null, 2));
console.log('Saved updated catalog to catalog.json and storefront-app/src/catalog.json');
