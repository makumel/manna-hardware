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
    discount_percent REAL DEFAULT 0,
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
  CREATE TABLE IF NOT EXISTS users (
    id TEXT PRIMARY KEY,
    email TEXT UNIQUE NOT NULL,
    phone TEXT,
    full_name TEXT NOT NULL,
    password_hash TEXT NOT NULL,
    salt TEXT NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
  );

  -- Decoy Honeypot Table for Deception-Based Defense
  CREATE TABLE IF NOT EXISTS decoy_admin_credentials (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    username TEXT NOT NULL,
    password_hash TEXT NOT NULL,
    api_secret TEXT NOT NULL,
    canary_token TEXT NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  );

  -- Internal Warehouse Box & Quote Location Tracking (Hidden from Front-End)
  CREATE TABLE IF NOT EXISTS item_locations (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    product_id TEXT,
    item_name TEXT NOT NULL,
    box_no TEXT NOT NULL,
    quote_no TEXT NOT NULL,
    warehouse TEXT NOT NULL DEFAULT 'Warehouse 1 (Tacloban Hub)',
    qty INTEGER NOT NULL DEFAULT 1,
    unit TEXT DEFAULT 'pc',
    price REAL DEFAULT 0,
    source_file TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  );

  CREATE INDEX IF NOT EXISTS idx_item_loc_name ON item_locations(item_name);
  CREATE INDEX IF NOT EXISTS idx_item_loc_box ON item_locations(box_no);
  CREATE INDEX IF NOT EXISTS idx_item_loc_quote ON item_locations(quote_no);
  CREATE INDEX IF NOT EXISTS idx_item_loc_pid ON item_locations(product_id);
  CREATE INDEX IF NOT EXISTS idx_item_loc_wh ON item_locations(warehouse);
`);

// Safe column migration for discount_percent and user_id if table existed previously
try {
  db.exec("ALTER TABLE products ADD COLUMN discount_percent REAL DEFAULT 0;");
} catch (e) {
  // column already exists
}

try {
  db.exec("ALTER TABLE orders ADD COLUMN user_id TEXT;");
} catch (e) {
  // column already exists
}

try {
  db.exec("ALTER TABLE orders ADD COLUMN distance_km REAL DEFAULT 0;");
} catch (e) {
  // column already exists
}

try {
  db.exec("ALTER TABLE orders ADD COLUMN long_cargo_fee REAL DEFAULT 0;");
} catch (e) {
  // column already exists
}

// Seed default demo user if users table is empty
const checkUsers = db.prepare("SELECT COUNT(*) as count FROM users").get();
if (checkUsers.count === 0) {
  const crypto = require('crypto');
  const demoSalt = crypto.randomBytes(16).toString('hex');
  const demoHash = crypto.scryptSync('password123', demoSalt, 64).toString('hex');
  db.prepare(`
    INSERT INTO users (id, email, phone, full_name, password_hash, salt)
    VALUES (?, ?, ?, ?, ?, ?)
  `).run('usr_demo_1', 'builder@example.com', '09171234567', 'Tacloban Builder', demoHash, demoSalt);
  console.log('Seeded demo user: builder@example.com (password: password123)');
}

// Seed canary decoy admin credentials for deception honeytoken defense
const checkDecoy = db.prepare("SELECT COUNT(*) as count FROM decoy_admin_credentials").get();
if (checkDecoy.count === 0) {
  db.prepare(`
    INSERT INTO decoy_admin_credentials (username, password_hash, api_secret, canary_token)
    VALUES (?, ?, ?, ?)
  `).run('superadmin_manna', '$2b$12$canary_superadmin_fake_hash_982736451', 'sk_live_canary_secret_88192736', 'CANARY_MNA_TOKEN_99182');
}

// Seed default settings and discounts
const checkSettings = db.prepare("SELECT COUNT(*) as count FROM store_settings").get();
if (checkSettings.count === 0) {
  const insertSetting = db.prepare("INSERT INTO store_settings (key, value) VALUES (?, ?)");
  insertSetting.run('storewide_discount', '0');
  insertSetting.run('free_shipping_threshold', '3000');
  insertSetting.run('standard_shipping_fee', '150');
}

// Ensure required promo codes: 'hardware' (40% off) and 'builder' (35% off)
const upsertDiscount = db.prepare(`
  INSERT INTO discounts (code, type, value, min_spend, active, description)
  VALUES (?, ?, ?, ?, ?, ?)
  ON CONFLICT(code) DO UPDATE SET
    type=excluded.type,
    value=excluded.value,
    min_spend=excluded.min_spend,
    active=excluded.active,
    description=excluded.description
`);

upsertDiscount.run('HARDWARE', 'percentage', 40, 100000, 1, '40% Wholesale Discount for Hardware Orders (Min. ₱100,000)');
upsertDiscount.run('BUILDER', 'percentage', 35, 50000, 1, '35% Contractor & Builder Discount (Min. ₱50,000)');
upsertDiscount.run('MANNA10', 'percentage', 10, 1000, 1, '10% off for orders over ₱1,000');
upsertDiscount.run('HARDWARE500', 'flat', 500, 5000, 1, '₱500 flat discount for orders over ₱5,000');

// Function to seed products from catalog.json
function seedProductsFromCatalog() {
  const catalogPath = path.join(__dirname, 'catalog.json');
  if (!fs.existsSync(catalogPath)) return;
  
  const catalog = JSON.parse(fs.readFileSync(catalogPath, 'utf-8'));
  
  const upsert = db.prepare(`
    INSERT INTO products (id, name, category, unit, price, capital, stock, discount_percent, rating, reviews, featured, image, description)
    VALUES (@id, @name, @category, @unit, @price, @capital, @stock, @discount_percent, @rating, @reviews, @featured, @image, @description)
    ON CONFLICT(id) DO UPDATE SET
      name=excluded.name,
      category=excluded.category,
      unit=excluded.unit,
      price=excluded.price,
      capital=excluded.capital,
      stock=excluded.stock,
      discount_percent=COALESCE(excluded.discount_percent, products.discount_percent, 0),
      image=COALESCE(excluded.image, products.image),
      description=excluded.description
  `);

  const runMany = db.transaction((items) => {
    for (const item of items) {
      const cleanId = item.id.replace('FAN-', 'MNA-');
      upsert.run({
        id: cleanId,
        name: item.name,
        category: item.category,
        unit: item.unit || 'pc',
        price: Number(item.price || 0),
        capital: Number(item.capital || 0),
        stock: Number(item.stock || 50),
        discount_percent: Number(item.discount_percent || 0),
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

// Function to seed initial warehouse box & quote locations
function seedWarehouseLocations() {
  const locPath = path.join(__dirname, 'warehouse_locations.json');
  if (!fs.existsSync(locPath)) return;
  
  const count = db.prepare("SELECT COUNT(*) as count FROM item_locations").get().count;
  if (count > 0) return;

  const locs = JSON.parse(fs.readFileSync(locPath, 'utf-8'));
  const insert = db.prepare(`
    INSERT INTO item_locations (product_id, item_name, box_no, quote_no, warehouse, qty, unit, price, source_file)
    VALUES (@product_id, @item_name, @box_no, @quote_no, @warehouse, @qty, @unit, @price, @source_file)
  `);

  const runBatch = db.transaction((items) => {
    for (const item of items) {
      insert.run({
        product_id: item.product_id || null,
        item_name: item.item_name,
        box_no: String(item.box_no),
        quote_no: String(item.quote_no),
        warehouse: item.warehouse || 'Warehouse 1 (Tacloban Hub)',
        qty: Number(item.qty || 1),
        unit: item.unit || 'pc',
        price: Number(item.price || 0),
        source_file: item.source_file || null
      });
    }
  });

  runBatch(locs);
  console.log(`Seeded ${locs.length} warehouse item box location records.`);
}

seedWarehouseLocations();

module.exports = {
  db,
  seedProductsFromCatalog,
  seedWarehouseLocations
};
