const Database = require('better-sqlite3');
const path = require('path');
const fs = require('fs');

const dbPath = path.join(__dirname, 'database.sqlite');
const db = new Database(dbPath);

// Enable WAL mode for high concurrency
db.pragma('journal_mode = WAL');

// Initialize schema
db.exec(`
  CREATE TABLE IF NOT EXISTS products (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    category TEXT NOT NULL,
    unit TEXT NOT NULL,
    price REAL NOT NULL,
    capital REAL NOT NULL,
    stock INTEGER NOT NULL,
    rating REAL DEFAULT 4.8,
    reviews INTEGER DEFAULT 25,
    featured INTEGER DEFAULT 0,
    image TEXT,
    description TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
  );

  CREATE TABLE IF NOT EXISTS discounts (
    code TEXT PRIMARY KEY,
    type TEXT NOT NULL, -- 'percentage' | 'flat'
    value REAL NOT NULL,
    min_spend REAL NOT NULL,
    active INTEGER NOT NULL DEFAULT 1,
    description TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  );

  CREATE TABLE IF NOT EXISTS store_settings (
    key TEXT PRIMARY KEY,
    value TEXT NOT NULL
  );

  CREATE TABLE IF NOT EXISTS orders (
    id TEXT PRIMARY KEY,
    customer_name TEXT NOT NULL,
    customer_phone TEXT NOT NULL,
    customer_email TEXT,
    delivery_address TEXT NOT NULL,
    payment_method TEXT NOT NULL,
    delivery_notes TEXT,
    subtotal REAL NOT NULL,
    discount_amount REAL NOT NULL,
    promo_code TEXT,
    shipping_fee REAL NOT NULL,
    total REAL NOT NULL,
    status TEXT DEFAULT 'Processing',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  );

  CREATE TABLE IF NOT EXISTS order_items (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    order_id TEXT NOT NULL,
    product_id TEXT NOT NULL,
    product_name TEXT NOT NULL,
    quantity INTEGER NOT NULL,
    unit_price REAL NOT NULL,
    total_price REAL NOT NULL,
    FOREIGN KEY(order_id) REFERENCES orders(id)
  );
`);

// Seed default settings and discounts if empty
const checkSettings = db.prepare("SELECT COUNT(*) as count FROM store_settings").get();
if (checkSettings.count === 0) {
  const insertSetting = db.prepare("INSERT INTO store_settings (key, value) VALUES (?, ?)");
  insertSetting.run('storewide_discount', '0');
  insertSetting.run('free_shipping_threshold', '3000');
  insertSetting.run('standard_shipping_fee', '150');
}

const checkDiscounts = db.prepare("SELECT COUNT(*) as count FROM discounts").get();
if (checkDiscounts.count === 0) {
  const insertDiscount = db.prepare("INSERT INTO discounts (code, type, value, min_spend, active, description) VALUES (?, ?, ?, ?, ?, ?)");
  insertDiscount.run('MANNA10', 'percentage', 10, 1000, 1, '10% off for orders over ₱1,000');
  insertDiscount.run('HARDWARE500', 'flat', 500, 5000, 1, '₱500 flat discount for orders over ₱5,000');
  insertDiscount.run('BUILDER5', 'percentage', 5, 0, 1, '5% Contractor wholesale special');
}

// Function to seed products from catalog.json
function seedProductsFromCatalog() {
  const catalogPath = path.join(__dirname, 'catalog.json');
  if (!fs.existsSync(catalogPath)) return;
  
  const catalog = JSON.parse(fs.readFileSync(catalogPath, 'utf-8'));
  const checkCount = db.prepare("SELECT COUNT(*) as count FROM products").get();
  
  const upsert = db.prepare(`
    INSERT INTO products (id, name, category, unit, price, capital, stock, rating, reviews, featured, image, description)
    VALUES (@id, @name, @category, @unit, @price, @capital, @stock, @rating, @reviews, @featured, @image, @description)
    ON CONFLICT(id) DO UPDATE SET
      name=excluded.name,
      category=excluded.category,
      unit=excluded.unit,
      price=excluded.price,
      capital=excluded.capital,
      image=COALESCE(excluded.image, products.image),
      description=excluded.description
  `);

  const runMany = db.transaction((items) => {
    for (const item of items) {
      // Rebrand to MANNA if still FAN-
      const cleanId = item.id.replace('FAN-', 'MNA-');
      upsert.run({
        id: cleanId,
        name: item.name,
        category: item.category,
        unit: item.unit || 'pc',
        price: Number(item.price || 0),
        capital: Number(item.capital || 0),
        stock: Number(item.stock || 50),
        rating: Number(item.rating || 4.8),
        reviews: Number(item.reviews || 20),
        featured: item.featured ? 1 : 0,
        image: item.image || null,
        description: item.description ? item.description.replace(/Fanvill/g, 'Manna') : 'Commercial building & hardware supply.'
      });
    }
  });

  runMany(catalog);
  console.log(`Database synchronized with ${catalog.length} products.`);
}

seedProductsFromCatalog();

module.exports = {
  db,
  seedProductsFromCatalog
};
