const fs = require('fs');

const cat = JSON.parse(fs.readFileSync('catalog.json', 'utf8'));

let totalRetail = 0;
let totalCost = 0;
let totalUnits = 0;
let categories = {};

cat.forEach(item => {
  const stock = Number(item.stock) || 0;
  const price = Number(item.price) || 0;
  const capital = Number(item.capital) || (price * 0.78);
  totalRetail += price * stock;
  totalCost += capital * stock;
  totalUnits += stock;

  const catName = item.category || 'Uncategorized';
  if (!categories[catName]) {
    categories[catName] = { count: 0, units: 0, retailValue: 0, costValue: 0 };
  }
  categories[catName].count++;
  categories[catName].units += stock;
  categories[catName].retailValue += price * stock;
  categories[catName].costValue += capital * stock;
});

console.log('=== INVENTORY OVERVIEW ===');
console.log('Total SKUs:', cat.length);
console.log('Total Units:', totalUnits);
console.log('Total Retail Value: ₱' + Math.round(totalRetail).toLocaleString());
console.log('Total Capital/Cost: ₱' + Math.round(totalCost).toLocaleString());

console.log('\n=== CATEGORY BREAKDOWN ===');
for (const [k, v] of Object.entries(categories)) {
  console.log(`${k} | SKUs: ${v.count} | Units: ${v.units} | Retail: ₱${Math.round(v.retailValue).toLocaleString()} | Cost: ₱${Math.round(v.costValue).toLocaleString()}`);
}

const sortedByValue = [...cat].sort((a,b) => ((b.price||0)*(b.stock||0)) - ((a.price||0)*(a.stock||0)));
console.log('\n=== TOP 15 HIGHEST VALUE BATCHES ===');
sortedByValue.slice(0, 15).forEach((i, idx) => {
  const lineVal = (i.price||0) * (i.stock||0);
  const capVal = (i.capital||0) * (i.stock||0);
  console.log(`${idx+1}. ${i.name} [${i.category}] - Stock: ${i.stock} ${i.unit||'pc'} @ ₱${i.price} (Retail: ₱${lineVal.toLocaleString()} | Cost: ₱${Math.round(capVal).toLocaleString()})`);
});

const highStockItems = [...cat].filter(i => i.stock >= 50).sort((a,b) => b.stock - a.stock);
console.log('\n=== HIGH QUANTITY ITEMS (FAST CONTRACTOR / HARDWARE BUNDLES) ===');
highStockItems.slice(0, 15).forEach((i, idx) => {
  console.log(`${idx+1}. ${i.name}: ${i.stock} ${i.unit||'pc'} @ ₱${i.price}/ea (Line: ₱${(i.price*i.stock).toLocaleString()})`);
});
