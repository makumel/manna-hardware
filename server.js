const express = require('express');
const cors = require('cors');
const fs = require('fs');
const path = require('path');
const { db, seedProductsFromCatalog } = require('./db');
const {
  hashPassword,
  verifyPassword,
  generateToken,
  verifyToken,
  requireAuth,
  optionalAuth
} = require('./auth');

const app = express();
const PORT = process.env.PORT || 4000;
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || 'asenso123';

// Security Headers Middleware
app.use((req, res, next) => {
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('X-Frame-Options', 'SAMEORIGIN');
  res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
  res.setHeader('X-XSS-Protection', '1; mode=block');
  next();
});

// Middleware
app.use(cors());
app.use(express.json());

// In-Memory Sliding-Window Rate Limiter
function createRateLimiter({ windowMs, max, message }) {
  const hits = new Map();
  setInterval(() => {
    const now = Date.now();
    for (const [key, record] of hits.entries()) {
      if (now > record.resetTime) {
        hits.delete(key);
      }
    }
  }, 60000).unref();

  return (req, res, next) => {
    const ip = req.ip || req.connection?.remoteAddress || '127.0.0.1';
    const now = Date.now();
    const record = hits.get(ip) || { count: 0, resetTime: now + windowMs };

    if (now > record.resetTime) {
      record.count = 0;
      record.resetTime = now + windowMs;
    }

    record.count += 1;
    hits.set(ip, record);

    const remaining = Math.max(0, max - record.count);
    res.setHeader('X-RateLimit-Limit', max);
    res.setHeader('X-RateLimit-Remaining', remaining);
    res.setHeader('X-RateLimit-Reset', Math.ceil(record.resetTime / 1000));

    if (record.count > max) {
      res.setHeader('Retry-After', Math.ceil((record.resetTime - now) / 1000));
      return res.status(429).json({
        error: message || 'Too many requests. Please try again later.'
      });
    }
    next();
  };
}

const authRateLimiter = createRateLimiter({
  windowMs: 15 * 60 * 1000,
  max: 50,
  message: 'Too many authentication attempts. Please try again after 15 minutes.'
});

const checkoutRateLimiter = createRateLimiter({
  windowMs: 10 * 60 * 1000,
  max: 50,
  message: 'Too many checkout attempts. Please slow down.'
});

// Server-side Honeypot Bot Interceptor Middleware
const honeypotGuard = (req, res, next) => {
  const { user_note_verification, honeypot } = req.body || {};
  if (user_note_verification || honeypot) {
    console.warn(`[SECURITY ALERT] Automated bot submission intercepted from IP: ${req.ip}`);
    return res.status(200).json({
      success: true,
      message: 'Order received',
      bot_intercepted: true
    });
  }
  next();
};

// Admin Password Gate Middleware
const adminAuth = (req, res, next) => {
  const password = req.headers['x-admin-password'] || req.headers['x-admin-key'] || req.query.password || req.body?.admin_password;
  if (password !== ADMIN_PASSWORD) {
    return res.status(401).json({
      error: 'Unauthorized: Access restricted to store merchant only. Valid password required.'
    });
  }
  next();
};

// ==================== DECEPTION & HONEYTOKEN DECOY ROUTES ====================
app.get('/.env', (req, res) => {
  console.warn(`[SECURITY ALERT - DECOY PROBED] Honeypot route '/.env' probed by IP: ${req.ip} | User-Agent: ${req.get('user-agent')}`);
  res.type('text/plain').send(
    '# MANNA ENVIRONMENT SECRETS (CANARY DECOY)\nPORT=4000\nDATABASE_URL=sqlite:///database.sqlite\nCANARY_TOKEN=CANARY_KEY_DEC_99824\nJWT_SECRET=super_secret_decoy_canary_key\nSTRIPE_SECRET=sk_live_canary_decoy_test_9921\n'
  );
});

app.get('/api/admin/config-backup.json', (req, res) => {
  console.warn(`[SECURITY ALERT - DECOY PROBED] Honeypot route '/api/admin/config-backup.json' probed by IP: ${req.ip}`);
  res.status(200).json({
    system: 'manna-core-hardware',
    version: '2.0.4-decoy',
    canary_token: 'CANARY_BACKUP_TOKEN_77218',
    status: 'archived',
    server_region: 'apac-ph-tacloban'
  });
});

app.get(['/wp-login.php', '/administrator', '/phpmyadmin'], (req, res) => {
  console.warn(`[SECURITY ALERT - BOT SCAN INTERCEPTED] Bot scan detected on '${req.path}' from IP: ${req.ip}`);
  res.status(200).type('text/html').send('<html><head><title>Admin Login</title></head><body><!-- Decoy Gateway --><h1>Restricted Terminal</h1></body></html>');
});

app.get('/api/v1/internal/users-export', (req, res) => {
  console.warn(`[SECURITY ALERT - DECOY PROBED] Honeypot route '/api/v1/internal/users-export' probed by IP: ${req.ip}`);
  res.status(200).json({
    export_id: 'exp_decoy_8819',
    users: [
      { id: 'usr_canary_1', email: 'decoy.admin@mannahardware.ph', role: 'admin', canary_token: 'CANARY_USER_EXPORT_6619' }
    ]
  });
});

// ==================== HEALTH & STATS ====================
app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    store: 'Manna Hardware & Building Supply API',
    timestamp: new Date().toISOString()
  });
});

// Admin stats endpoint (protected)
app.get('/api/admin/stats', adminAuth, (req, res) => {
  const totalProducts = db.prepare("SELECT COUNT(*) as count FROM products").get().count;
  const lowStock = db.prepare("SELECT COUNT(*) as count FROM products WHERE stock < 10").get().count;
  const totalOrders = db.prepare("SELECT COUNT(*) as count FROM orders").get().count;
  const salesSummary = db.prepare("SELECT COALESCE(SUM(total), 0) as gross_sales FROM orders").get().gross_sales;
  const storewideDiscount = db.prepare("SELECT value FROM store_settings WHERE key = 'storewide_discount'").get()?.value || '0';

  res.json({
    totalProducts,
    lowStock,
    totalOrders,
    grossSales: Number(salesSummary),
    storewideDiscount: Number(storewideDiscount)
  });
});

// ==================== PRODUCTS CATALOG API (PUBLIC - ZERO WAREHOUSE/BOX TRACE) ====================
app.get('/api/products', (req, res) => {
  const { category, search, stock_only } = req.query;
  // Customer-facing query strictly excludes capital, cost, box_no, quote_no, and internal bin codes
  let query = "SELECT id, name, category, unit, price, stock, discount_percent, rating, reviews, featured, image, description FROM products WHERE 1=1";
  const params = [];

  if (category && category !== 'All') {
    query += " AND category = ?";
    params.push(category);
  }

  if (search && search.trim()) {
    query += " AND (name LIKE ? OR id LIKE ? OR description LIKE ?)";
    const term = `%${search.trim()}%`;
    params.push(term, term, term);
  }

  if (stock_only === 'true') {
    query += " AND stock > 0";
  }

  query += " ORDER BY featured DESC, name ASC";

  const rows = db.prepare(query).all(...params);
  res.json(rows);
});

app.get('/api/products/categories', (req, res) => {
  const categories = db.prepare("SELECT DISTINCT category FROM products ORDER BY category ASC").all();
  res.json(['All', ...categories.map(c => c.category)]);
});

app.get('/api/products/:id', (req, res) => {
  // Public single product fetch - zero trace of internal warehouse/box metadata
  const product = db.prepare("SELECT id, name, category, unit, price, stock, discount_percent, rating, reviews, featured, image, description FROM products WHERE id = ?").get(req.params.id);
  if (!product) {
    return res.status(404).json({ error: 'Product not found' });
  }
  res.json(product);
});

// Admin-only complete products list with capital & warehouse summary
app.get('/api/admin/products', adminAuth, (req, res) => {
  const rows = db.prepare("SELECT * FROM products ORDER BY featured DESC, name ASC").all();
  res.json(rows);
});

// Admin product update (stock, price, capital, per-item discount)
app.patch('/api/admin/products/:id', adminAuth, (req, res) => {
  const { price, capital, stock, featured, discount_percent } = req.body;
  const updates = [];
  const params = [];

  if (price !== undefined) {
    updates.push("price = ?");
    params.push(Number(price));
  }
  if (capital !== undefined) {
    updates.push("capital = ?");
    params.push(Number(capital));
  }
  if (stock !== undefined) {
    updates.push("stock = ?");
    params.push(Number(stock));
  }
  if (featured !== undefined) {
    updates.push("featured = ?");
    params.push(featured ? 1 : 0);
  }
  if (discount_percent !== undefined) {
    updates.push("discount_percent = ?");
    params.push(Math.max(0, Math.min(100, Number(discount_percent))));
  }

  if (updates.length === 0) {
    return res.status(400).json({ error: 'No fields provided to update' });
  }

  updates.push("updated_at = CURRENT_TIMESTAMP");
  params.push(req.params.id);

  const stmt = db.prepare(`UPDATE products SET ${updates.join(', ')} WHERE id = ?`);
  const result = stmt.run(...params);

  if (result.changes === 0) {
    return res.status(404).json({ error: 'Product not found' });
  }

  const updated = db.prepare("SELECT * FROM products WHERE id = ?").get(req.params.id);
  res.json({ success: true, product: updated });
});

// Admin Add New Product
app.post('/api/admin/products', adminAuth, (req, res) => {
  const { name, category, unit, price, capital, stock, discount_percent, image, description } = req.body;
  if (!name || price === undefined) {
    return res.status(400).json({ error: 'Product name and price are required' });
  }

  // Generate SKU MNA-XXXX
  const lastProd = db.prepare("SELECT id FROM products WHERE id LIKE 'MNA-%' ORDER BY id DESC LIMIT 1").get();
  let nextNum = 1001;
  if (lastProd && lastProd.id) {
    const m = lastProd.id.match(/MNA-(\d+)/);
    if (m) nextNum = parseInt(m[1], 10) + 1;
  }
  const id = req.body.id || `MNA-${nextNum}`;

  const numPrice = Number(price || 0);
  const numCap = Number(capital || (numPrice * 0.78));
  const numStock = Number(stock || 50);
  const numDisc = Number(discount_percent || 0);

  const insert = db.prepare(`
    INSERT INTO products (id, name, category, unit, price, capital, stock, discount_percent, image, description)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);

  try {
    insert.run(
      id,
      name.trim(),
      category || 'General Hardware',
      unit || 'pc',
      numPrice,
      numCap,
      numStock,
      numDisc,
      image || 'https://images.pexels.com/photos/175039/pexels-photo-175039.jpeg?auto=compress&cs=tinysrgb&h=650&w=940',
      description || 'Commercial building & hardware supply.'
    );
    const created = db.prepare("SELECT * FROM products WHERE id = ?").get(id);
    res.status(201).json({ success: true, product: created });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// Admin Full Update Product
app.put('/api/admin/products/:id', adminAuth, (req, res) => {
  const { name, category, unit, price, capital, stock, discount_percent, image, description } = req.body;
  
  const update = db.prepare(`
    UPDATE products SET
      name = COALESCE(?, name),
      category = COALESCE(?, category),
      unit = COALESCE(?, unit),
      price = COALESCE(?, price),
      capital = COALESCE(?, capital),
      stock = COALESCE(?, stock),
      discount_percent = COALESCE(?, discount_percent),
      image = COALESCE(?, image),
      description = COALESCE(?, description),
      updated_at = CURRENT_TIMESTAMP
    WHERE id = ?
  `);

  const result = update.run(
    name, category, unit,
    price !== undefined ? Number(price) : null,
    capital !== undefined ? Number(capital) : null,
    stock !== undefined ? Number(stock) : null,
    discount_percent !== undefined ? Number(discount_percent) : null,
    image, description,
    req.params.id
  );

  if (result.changes === 0) {
    return res.status(404).json({ error: 'Product not found' });
  }

  const updated = db.prepare("SELECT * FROM products WHERE id = ?").get(req.params.id);
  res.json({ success: true, product: updated });
});

// Admin Delete Product
app.delete('/api/admin/products/:id', adminAuth, (req, res) => {
  const result = db.prepare("DELETE FROM products WHERE id = ?").run(req.params.id);
  if (result.changes === 0) {
    return res.status(404).json({ error: 'Product not found' });
  }
  res.json({ success: true, message: `Product ${req.params.id} deleted successfully` });
});

// Admin Bulk Actions
app.post('/api/admin/products/bulk-discount', adminAuth, (req, res) => {
  const { ids, discount_percent } = req.body;
  if (!Array.isArray(ids) || ids.length === 0) {
    return res.status(400).json({ error: 'ids array required' });
  }
  const val = Math.max(0, Math.min(100, Number(discount_percent || 0)));
  const placeholders = ids.map(() => '?').join(',');
  const result = db.prepare(`UPDATE products SET discount_percent = ?, updated_at = CURRENT_TIMESTAMP WHERE id IN (${placeholders})`)
    .run(val, ...ids);
  res.json({ success: true, updatedCount: result.changes });
});

app.post('/api/admin/products/bulk-delete', adminAuth, (req, res) => {
  const { ids } = req.body;
  if (!Array.isArray(ids) || ids.length === 0) {
    return res.status(400).json({ error: 'ids array required' });
  }
  const placeholders = ids.map(() => '?').join(',');
  const result = db.prepare(`DELETE FROM products WHERE id IN (${placeholders})`).run(...ids);
  res.json({ success: true, deletedCount: result.changes });
});

app.post('/api/admin/products/bulk-import', adminAuth, (req, res) => {
  const { items } = req.body;
  if (!Array.isArray(items) || items.length === 0) {
    return res.status(400).json({ error: 'items array required' });
  }

  const upsert = db.prepare(`
    INSERT INTO products (id, name, category, unit, price, capital, stock, discount_percent, image, description)
    VALUES (@id, @name, @category, @unit, @price, @capital, @stock, @discount_percent, @image, @description)
    ON CONFLICT(id) DO UPDATE SET
      name=excluded.name,
      category=excluded.category,
      unit=excluded.unit,
      price=excluded.price,
      capital=excluded.capital,
      stock=excluded.stock,
      discount_percent=COALESCE(excluded.discount_percent, products.discount_percent, 0),
      image=COALESCE(excluded.image, products.image),
      description=excluded.description,
      updated_at=CURRENT_TIMESTAMP
  `);

  const runBatch = db.transaction((rows) => {
    let count = 0;
    for (const r of rows) {
      if (r.name && r.price) {
        upsert.run({
          id: r.id || `MNA-${Date.now().toString().slice(-4)}${Math.floor(Math.random()*100)}`,
          name: r.name,
          category: r.category || 'General Hardware',
          unit: r.unit || 'pc',
          price: Number(r.price),
          capital: Number(r.capital || (r.price * 0.78)),
          stock: Number(r.stock || 50),
          discount_percent: Number(r.discount_percent || 0),
          image: r.image || 'https://images.pexels.com/photos/175039/pexels-photo-175039.jpeg?auto=compress&cs=tinysrgb&h=650&w=940',
          description: r.description || 'Imported hardware item.'
        });
        count++;
      }
    }
    return count;
  });

  const count = runBatch(items);
  res.json({ success: true, importedCount: count });
});

// Admin batch per-item discount updater
app.post('/api/admin/products/:id/discount', adminAuth, (req, res) => {
  const { discount_percent } = req.body;
  const discountVal = Math.max(0, Math.min(100, Number(discount_percent || 0)));
  
  const result = db.prepare("UPDATE products SET discount_percent = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?")
    .run(discountVal, req.params.id);

  if (result.changes === 0) {
    return res.status(404).json({ error: 'Product not found' });
  }

  // Also sync changes directly to public catalog.json so public files immediately reflect discounts
  try {
    const allProducts = db.prepare("SELECT * FROM products ORDER BY name ASC").all();
    const catPath = path.join(__dirname, 'storefront-app', 'src', 'catalog.json');
    const rootCatPath = path.join(__dirname, 'catalog.json');
    fs.writeFileSync(catPath, JSON.stringify(allProducts, null, 2), 'utf-8');
    fs.writeFileSync(rootCatPath, JSON.stringify(allProducts, null, 2), 'utf-8');
  } catch (err) {
    console.error('Error writing catalog.json:', err);
  }

  res.json({ success: true, id: req.params.id, discount_percent: discountVal });
});

// Admin Save All Discounts to public files & database
app.post('/api/admin/save-discounts', adminAuth, (req, res) => {
  const { discounts, storewideDiscount } = req.body;
  
  if (Array.isArray(discounts)) {
    const updateStmt = db.prepare("UPDATE products SET discount_percent = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?");
    const runBatch = db.transaction((list) => {
      for (const item of list) {
        if (item.id && item.discount_percent !== undefined) {
          updateStmt.run(Math.max(0, Math.min(100, Number(item.discount_percent || 0))), item.id);
        }
      }
    });
    runBatch(discounts);
  }

  // Sync to catalog.json in storefront-app/src and root
  try {
    const allProducts = db.prepare("SELECT * FROM products ORDER BY name ASC").all();
    const catPath = path.join(__dirname, 'storefront-app', 'src', 'catalog.json');
    const rootCatPath = path.join(__dirname, 'catalog.json');
    fs.writeFileSync(catPath, JSON.stringify(allProducts, null, 2), 'utf-8');
    fs.writeFileSync(rootCatPath, JSON.stringify(allProducts, null, 2), 'utf-8');
    res.json({ success: true, message: 'Discounts successfully saved to database and public catalog.json files', totalCount: allProducts.length });
  } catch (err) {
    console.error('Failed to sync catalog.json:', err);
    res.status(500).json({ error: 'Failed to write public catalog files', details: err.message });
  }
});

// ==================== INTERNAL WAREHOUSE & BOX PICK LOCATION API (ADMIN ONLY) ====================

// 1. Get warehouse item locations (Search by item name, SKU, box_no, quote_no, warehouse)
app.get('/api/admin/warehouse/locations', adminAuth, (req, res) => {
  const { search, box_no, quote_no, warehouse, product_id, limit = 500 } = req.query;
  let query = "SELECT * FROM item_locations WHERE 1=1";
  const params = [];

  if (search && search.trim()) {
    query += " AND (item_name LIKE ? OR product_id LIKE ?)";
    const term = `%${search.trim()}%`;
    params.push(term, term);
  }

  if (box_no && box_no.trim()) {
    query += " AND box_no = ?";
    params.push(box_no.trim());
  }

  if (quote_no && quote_no.trim()) {
    query += " AND (quote_no LIKE ? OR quote_no = ?)";
    const qTerm = `%${quote_no.trim()}%`;
    params.push(qTerm, quote_no.trim());
  }

  if (warehouse && warehouse.trim() && warehouse !== 'All') {
    query += " AND warehouse = ?";
    params.push(warehouse.trim());
  }

  if (product_id && product_id.trim()) {
    query += " AND product_id = ?";
    params.push(product_id.trim());
  }

  query += " ORDER BY CAST(box_no AS INTEGER) ASC, item_name ASC LIMIT ?";
  params.push(Number(limit));

  const rows = db.prepare(query).all(...params);
  res.json(rows);
});

// 2. Get summary list of all boxes (Item count, total units, quote #, warehouse)
app.get('/api/admin/warehouse/boxes', adminAuth, (req, res) => {
  const query = `
    SELECT 
      box_no, 
      quote_no, 
      warehouse, 
      source_file,
      COUNT(*) as total_items, 
      SUM(qty) as total_units
    FROM item_locations 
    GROUP BY box_no, quote_no, warehouse 
    ORDER BY CAST(box_no AS INTEGER) ASC, box_no ASC
  `;
  const rows = db.prepare(query).all();
  res.json(rows);
});

// 3. Get all items inside a specific box number
app.get('/api/admin/warehouse/boxes/:box_no', adminAuth, (req, res) => {
  const rows = db.prepare(`
    SELECT * FROM item_locations 
    WHERE box_no = ? 
    ORDER BY item_name ASC
  `).all(req.params.box_no);
  res.json(rows);
});

// 4. Get distinct warehouses and summary breakdown
app.get('/api/admin/warehouse/warehouses', adminAuth, (req, res) => {
  const rows = db.prepare("SELECT DISTINCT warehouse FROM item_locations ORDER BY warehouse ASC").all();
  res.json(rows.map(r => r.warehouse));
});

app.get('/api/admin/warehouse/summary', adminAuth, (req, res) => {
  const breakdown = db.prepare(`
    SELECT 
      warehouse,
      COUNT(DISTINCT box_no) as total_boxes,
      COUNT(*) as total_records,
      SUM(qty) as total_qty,
      SUM(qty * price) as total_cost
    FROM item_locations
    GROUP BY warehouse
    ORDER BY total_cost DESC
  `).all();

  const overall = db.prepare(`
    SELECT 
      COUNT(*) as total_skus,
      SUM(stock) as total_stock,
      SUM(capital * stock) as total_capital,
      SUM(price * stock) as total_selling_price
    FROM products
  `).get();

  res.json({
    breakdown,
    overall
  });
});

// 5. Ingest new inventory items from another warehouse / incoming quote file
app.post('/api/admin/warehouse/ingest', adminAuth, (req, res) => {
  const { warehouse, quote_no, box_no, source_file, items } = req.body;
  
  if (!items || !Array.isArray(items) || items.length === 0) {
    return res.status(400).json({ error: 'No items provided for warehouse intake.' });
  }

  const warehouseName = (warehouse && warehouse.trim()) || 'Warehouse 2 (New Inflow)';
  const boxNum = String(box_no || '1').trim();
  const quoteNum = String(quote_no || `Quote #${boxNum}`).trim();
  const fileName = source_file || `incoming_wh_${Date.now()}.csv`;

  const insertLocation = db.prepare(`
    INSERT INTO item_locations (product_id, item_name, box_no, quote_no, warehouse, qty, unit, price, source_file)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);

  const findProduct = db.prepare("SELECT * FROM products WHERE LOWER(name) = LOWER(?) OR id = ?");
  const updateProductStock = db.prepare("UPDATE products SET stock = stock + ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?");
  const insertNewProduct = db.prepare(`
    INSERT INTO products (id, name, category, unit, price, capital, stock, discount_percent, rating, reviews, featured, image, description)
    VALUES (?, ?, ?, ?, ?, ?, ?, 0, 4.8, 15, 0, ?, ?)
  `);

  let addedLocations = 0;
  let updatedProducts = 0;
  let createdProducts = 0;

  const runIngest = db.transaction(() => {
    let skuCounter = Date.now().toString().slice(-4);
    for (const itm of items) {
      const name = (itm.name || itm.item_name || '').trim();
      if (!name) continue;

      const qty = Math.max(1, parseInt(itm.qty || itm.stock || 1, 10));
      const price = parseFloat(itm.price || 0) || 0;
      const unit = itm.unit || itm.um || 'pc';
      const capital = parseFloat(itm.capital || itm.cost || 0) || Math.round(price * 0.78);
      const category = itm.category || 'General Hardware';

      // Check if product exists in catalog
      const existing = findProduct.get(name, itm.product_id || itm.id || '');
      let finalPid = '';

      if (existing) {
        finalPid = existing.id;
        updateProductStock.run(qty, existing.id);
        updatedProducts++;
      } else {
        finalPid = `MNA-WH2-${skuCounter++}`;
        const defaultImg = itm.image || 'https://images.pexels.com/photos/175039/pexels-photo-175039.jpeg?auto=compress&cs=tinysrgb&h=650&w=940';
        const desc = itm.description || `Commercial hardware item sourced directly for Manna Hardware.`;
        insertNewProduct.run(finalPid, name, category, unit, price, capital, qty, defaultImg, desc);
        createdProducts++;
      }

      insertLocation.run(finalPid, name, boxNum, quoteNum, warehouseName, qty, unit, price, fileName);
      addedLocations++;
    }
  });

  runIngest();

  res.json({
    success: true,
    message: `Successfully registered ${addedLocations} items in ${warehouseName} under Box #${boxNum} (${quoteNum})`,
    warehouse: warehouseName,
    box_no: boxNum,
    quote_no: quoteNum,
    added_locations: addedLocations,
    updated_products: updatedProducts,
    created_products: createdProducts
  });
});

// 6. Generate order pick list with box locations
app.get('/api/admin/orders/:id/pick-list', adminAuth, (req, res) => {
  const order = db.prepare("SELECT * FROM orders WHERE id = ?").get(req.params.id);
  if (!order) {
    return res.status(404).json({ error: 'Order not found' });
  }

  const items = db.prepare("SELECT * FROM order_items WHERE order_id = ?").all(req.params.id);
  const findLocs = db.prepare(`
    SELECT box_no, quote_no, warehouse, qty, unit, source_file 
    FROM item_locations 
    WHERE product_id = ? OR LOWER(item_name) = LOWER(?)
    ORDER BY warehouse ASC, CAST(box_no AS INTEGER) ASC
  `);

  const pickItems = items.map(itm => {
    const locs = findLocs.all(itm.product_id, itm.product_name);
    return {
      product_id: itm.product_id,
      product_name: itm.product_name,
      quantity_ordered: itm.quantity,
      unit_price: itm.unit_price,
      total_price: itm.total_price,
      locations: locs.length > 0 ? locs : [
        {
          box_no: 'General Rack',
          quote_no: 'Standard Shelf',
          warehouse: 'Warehouse 1 (Tacloban Hub)',
          qty: itm.quantity,
          unit: 'pc',
          source_file: 'Standard'
        }
      ]
    };
  });

  res.json({
    order_id: order.id,
    customer_name: order.customer_name,
    customer_phone: order.customer_phone,
    delivery_address: order.delivery_address,
    status: order.status,
    total: order.total,
    created_at: order.created_at,
    pick_items: pickItems
  });
});

// ==================== DISCOUNTS & PROMOTIONS API ====================
app.get('/api/discounts', (req, res) => {
  const rows = db.prepare("SELECT * FROM discounts WHERE active = 1 ORDER BY value DESC").all();
  res.json(rows);
});

// Admin discounts management
app.get('/api/admin/discounts', adminAuth, (req, res) => {
  const rows = db.prepare("SELECT * FROM discounts ORDER BY created_at ASC").all();
  res.json(rows);
});

// Validate Promo Code (Public, case-insensitive)
app.post('/api/discounts/validate', (req, res) => {
  const { code, subtotal } = req.body;
  if (!code) {
    return res.status(400).json({ error: 'Code is required' });
  }

  const cleanCode = code.trim().toUpperCase();
  const promo = db.prepare("SELECT * FROM discounts WHERE UPPER(code) = ? AND active = 1").get(cleanCode);
  
  if (!promo) {
    return res.status(404).json({ valid: false, message: 'Invalid or expired promo code.' });
  }

  if (Number(subtotal || 0) < promo.min_spend) {
    return res.status(400).json({
      valid: false,
      message: `Minimum spend of ₱${promo.min_spend.toLocaleString()} required for this code.`
    });
  }

  let discountAmount = 0;
  if (promo.type === 'percentage') {
    discountAmount = (subtotal * (promo.value / 100));
  } else {
    discountAmount = promo.value;
  }

  res.json({
    valid: true,
    code: promo.code,
    type: promo.type,
    value: promo.value,
    discountAmount: Math.min(discountAmount, subtotal),
    description: promo.description
  });
});

// Admin global storewide discount setting
app.get('/api/settings/storewide-discount', (req, res) => {
  const setting = db.prepare("SELECT value FROM store_settings WHERE key = 'storewide_discount'").get();
  res.json({ discount_percentage: Number(setting?.value || 0) });
});

app.post('/api/admin/settings/storewide-discount', adminAuth, (req, res) => {
  const { discount_percentage } = req.body;
  const num = Math.max(0, Math.min(100, Number(discount_percentage || 0)));
  db.prepare("INSERT INTO store_settings (key, value) VALUES ('storewide_discount', ?) ON CONFLICT(key) DO UPDATE SET value=excluded.value")
    .run(num.toString());
  res.json({ success: true, discount_percentage: num });
});

// ==================== USER AUTHENTICATION & ACCOUNT API ====================

// User Registration
app.post('/api/auth/register', authRateLimiter, honeypotGuard, (req, res) => {
  const { fullName, email, phone, password, confirmPassword } = req.body;

  if (!fullName || !fullName.trim()) {
    return res.status(400).json({ error: 'Full name is required.' });
  }

  if (!email || !email.trim() || !email.includes('@')) {
    return res.status(400).json({ error: 'Valid email address is required.' });
  }

  if (!password || password.length < 6) {
    return res.status(400).json({ error: 'Password must be at least 6 characters long.' });
  }

  if (confirmPassword !== undefined && password !== confirmPassword) {
    return res.status(400).json({ error: 'Passwords do not match.' });
  }

  const cleanEmail = email.trim().toLowerCase();
  const cleanPhone = phone ? phone.trim() : '';

  // Check if email already registered
  const existingUser = db.prepare('SELECT id FROM users WHERE LOWER(email) = ?').get(cleanEmail);
  if (existingUser) {
    return res.status(409).json({ error: 'An account with this email already exists. Please log in.' });
  }

  const { salt, hash } = hashPassword(password);
  const crypto = require('crypto');
  const userId = `usr_${Date.now()}_${crypto.randomBytes(3).toString('hex')}`;

  db.prepare(`
    INSERT INTO users (id, email, phone, full_name, password_hash, salt)
    VALUES (?, ?, ?, ?, ?, ?)
  `).run(userId, cleanEmail, cleanPhone, fullName.trim(), hash, salt);

  const newUser = db.prepare('SELECT id, email, phone, full_name, created_at FROM users WHERE id = ?').get(userId);
  const token = generateToken(newUser);

  res.status(201).json({
    success: true,
    message: 'Account created successfully.',
    token,
    user: {
      id: newUser.id,
      email: newUser.email,
      fullName: newUser.full_name,
      phone: newUser.phone,
      createdAt: newUser.created_at
    }
  });
});

// User Login
app.post('/api/auth/login', authRateLimiter, honeypotGuard, (req, res) => {
  const { email, password } = req.body;

  if (!email || !email.trim() || !password) {
    return res.status(400).json({ error: 'Email/phone and password are required.' });
  }

  const identifier = email.trim().toLowerCase();

  // Find user by email or phone
  const user = db.prepare(`
    SELECT * FROM users 
    WHERE LOWER(email) = ? OR phone = ?
  `).get(identifier, email.trim());

  if (!user || !verifyPassword(password, user.salt, user.password_hash)) {
    return res.status(401).json({ error: 'Invalid email/phone or password. Please try again.' });
  }

  const token = generateToken(user);

  res.json({
    success: true,
    message: 'Login successful.',
    token,
    user: {
      id: user.id,
      email: user.email,
      fullName: user.full_name,
      phone: user.phone,
      createdAt: user.created_at
    }
  });
});

// Get Current Logged-in User Profile
app.get('/api/auth/me', requireAuth, (req, res) => {
  res.json({
    success: true,
    user: req.user
  });
});

// User Logout (stateless token acknowledgment)
app.post('/api/auth/logout', (req, res) => {
  res.json({ success: true, message: 'Logged out successfully.' });
});

// User Order History (protected by requireAuth)
app.get('/api/user/orders', requireAuth, (req, res) => {
  const orders = db.prepare(`
    SELECT * FROM orders 
    WHERE user_id = ? OR LOWER(customer_email) = LOWER(?)
    ORDER BY created_at DESC
  `).all(req.user.id, req.user.email);

  const getItems = db.prepare("SELECT * FROM order_items WHERE order_id = ?");
  const populated = orders.map(ord => ({
    ...ord,
    items: getItems.all(ord.id)
  }));

  res.json({ success: true, orders: populated });
});

// Helper to detect 10ft+ long structural and pipe items (Angle bar, C-Purlins, GI Pipe, Rebar, etc.)
function isLongCargoItem(item) {
  if (!item || !item.name) return false;
  const name = item.name.toLowerCase();
  
  // Exclude small accessories and hand tools
  if (/(bolt|bracket|wrench|hinge|handle|cutter|clamp|fitting|threader|nipple|bushing|elbow|tee|cleaner|cement|glue|tape|lock|screw)/i.test(name)) {
    return false;
  }

  // Matches 10ft+ long structural steel, purlins, angle bars, pipes, and metal bars
  return (
    /(\bpurlin|\bangle\s*bar|\bgi\s*pipe|\bg\.i\.\s*pipe|\bpipe\s*s-40|\bschedule\s*40|\btubular|\bsquare\s*tube|\bdeformed\s*bar|\brebar|\bplain\s*bar|\bi-bar|\bt-bar|\bflat\s*bar|\bchannel\s*bar|\bsteel\s*bar|10\s*ft|20\s*ft|6\s*m\b)/i.test(name)
  );
}

// Delivery Calculation Rule:
// Free delivery for ₱5,000+ orders within Tacloban City (<= 10km); beyond Tacloban City (> 10km): ₱50/km
function calculateShipping({ items, subtotal, distanceKm, isWithinTacloban }) {
  const dist = Math.max(1, Number(distanceKm || 8));
  const numSubtotal = Number(subtotal || 0);

  // Check if order contains 10ft+ long materials
  let hasLongCargo = false;
  const longItems = [];
  if (Array.isArray(items)) {
    for (const item of items) {
      if (item && isLongCargoItem(item)) {
        hasLongCargo = true;
        longItems.push(item.name || item.id);
      }
    }
  }

  // Within Tacloban City if dist <= 10 km or explicitly marked
  const withinTacloban = isWithinTacloban !== undefined 
    ? Boolean(isWithinTacloban) 
    : (dist <= 10);

  const qualifiesForFreeTacloban = numSubtotal >= 5000;

  let baseShippingFee = 0;
  let longCargoFee = 0;
  let totalShippingFee = 0;
  let freeDeliveryApplied = false;
  let excessKm = 0;

  if (withinTacloban) {
    if (qualifiesForFreeTacloban) {
      // Free delivery for ₱5,000+ orders within Tacloban City
      freeDeliveryApplied = true;
      baseShippingFee = 0;
      longCargoFee = 0;
      totalShippingFee = 0;
    } else {
      // Under ₱5,000 within Tacloban City
      baseShippingFee = numSubtotal >= 3000 ? 0 : 150;
      longCargoFee = hasLongCargo ? (dist * 50) : 0;
      totalShippingFee = baseShippingFee + longCargoFee;
    }
  } else {
    // Outside / more than Tacloban City (> 10 km)
    // "more than that 50/km"
    excessKm = Math.max(0, dist - 10);
    if (qualifiesForFreeTacloban) {
      // Tacloban portion is covered free; customer only pays ₱50/km for distance beyond Tacloban
      baseShippingFee = 0;
      longCargoFee = excessKm * 50;
      totalShippingFee = longCargoFee;
    } else {
      // Under ₱5k outside Tacloban: full distance @ ₱50/km if long cargo, or base + excess
      baseShippingFee = numSubtotal >= 3000 ? 0 : 150;
      longCargoFee = hasLongCargo ? (dist * 50) : (excessKm * 50);
      totalShippingFee = Math.max(baseShippingFee, longCargoFee);
    }
  }

  return {
    hasLongCargo,
    longItems,
    distanceKm: dist,
    withinTacloban,
    qualifiesForFreeTacloban,
    freeDeliveryApplied,
    excessKm,
    ratePerKm: 50,
    baseShippingFee,
    longCargoFee,
    totalShippingFee
  };
}

// Public Shipping & Long Cargo Calculator API
app.post('/api/shipping/calculate', (req, res) => {
  const { items, distanceKm, subtotal, isWithinTacloban } = req.body || {};
  const result = calculateShipping({
    items,
    distanceKm,
    subtotal,
    isWithinTacloban
  });
  res.json(result);
});

// ==================== CHECKOUT & ORDERS API (ACCOUNT REQUIRED) ====================
app.post('/api/checkout', checkoutRateLimiter, honeypotGuard, requireAuth, (req, res) => {
  const { customer, items, promoCode } = req.body || {};

  if (!customer || !customer.fullName || !customer.phone || !customer.address) {
    return res.status(400).json({ error: 'Full customer name, phone, and delivery address are required' });
  }

  if (!items || !Array.isArray(items) || items.length === 0) {
    return res.status(400).json({ error: 'Order must contain at least one item' });
  }

  const checkoutTransaction = db.transaction(() => {
    let subtotal = 0;
    const validatedItems = [];

    // Verify stock and apply per-item discounts
    for (const item of items) {
      const liveProduct = db.prepare("SELECT * FROM products WHERE id = ?").get(item.id);
      if (!liveProduct) {
        throw new Error(`Product ${item.id} not found.`);
      }
      if (liveProduct.stock < item.quantity) {
        throw new Error(`Insufficient stock for ${liveProduct.name}. Available: ${liveProduct.stock}`);
      }

      // Check per-item discount
      const itemDiscountPercent = Number(liveProduct.discount_percent || 0);
      const effectiveUnitPrice = itemDiscountPercent > 0 
        ? liveProduct.price * (1 - itemDiscountPercent / 100)
        : liveProduct.price;

      const itemTotal = effectiveUnitPrice * item.quantity;
      subtotal += itemTotal;

      const isLong = isLongCargoItem(liveProduct);

      validatedItems.push({
        id: liveProduct.id,
        name: liveProduct.name,
        unit: liveProduct.unit,
        price: liveProduct.price,
        effectivePrice: effectiveUnitPrice,
        discountPercent: itemDiscountPercent,
        isLongCargo: isLong,
        quantity: item.quantity,
        total: itemTotal
      });
    }

    // Apply storewide global discount
    const storewideSetting = db.prepare("SELECT value FROM store_settings WHERE key = 'storewide_discount'").get();
    const storewidePercent = Number(storewideSetting?.value || 0);
    let promoDiscountAmount = 0;

    if (storewidePercent > 0) {
      promoDiscountAmount += (subtotal * (storewidePercent / 100));
    }

    // Apply promo code if provided
    let appliedCode = null;
    if (promoCode) {
      const cleanCode = promoCode.trim().toUpperCase();
      const promo = db.prepare("SELECT * FROM discounts WHERE UPPER(code) = ? AND active = 1").get(cleanCode);
      if (promo && subtotal >= promo.min_spend) {
        appliedCode = promo.code;
        if (promo.type === 'percentage') {
          promoDiscountAmount += (subtotal * (promo.value / 100));
        } else {
          promoDiscountAmount += promo.value;
        }
      }
    }

    const totalDiscountAmount = Math.min(promoDiscountAmount, subtotal);

    // ==================== TACLOBAN CITY ₱5,000+ FREE DELIVERY & ₱50/KM SHIPPING ====================
    const distanceKm = Math.max(1, Number(customer.distanceKm || customer.distance_km || 8));
    const isWithinTacloban = customer.isWithinTacloban !== undefined
      ? Boolean(customer.isWithinTacloban)
      : (customer.deliveryZone ? (!customer.deliveryZone.toLowerCase().includes('leyte') && !customer.deliveryZone.toLowerCase().includes('samar') && distanceKm <= 10) : distanceKm <= 10);

    const shippingResult = calculateShipping({
      items: validatedItems,
      subtotal,
      distanceKm,
      isWithinTacloban
    });

    const baseShippingFee = shippingResult.baseShippingFee;
    const longCargoFee = shippingResult.longCargoFee;
    const totalShippingFee = shippingResult.totalShippingFee;
    const hasLongCargo = shippingResult.hasLongCargo;

    const finalTotal = Math.max(0, subtotal - totalDiscountAmount + totalShippingFee);

    // Decrement stock
    const decrementStock = db.prepare("UPDATE products SET stock = stock - ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?");
    for (const item of validatedItems) {
      decrementStock.run(item.quantity, item.id);
    }

    // Insert order with initial status 'Order Placed' and bound authenticated user_id
    const orderId = `MNA-ORD-${Date.now().toString().slice(-6)}`;
    const insertOrder = db.prepare(`
      INSERT INTO orders (id, user_id, customer_name, customer_phone, customer_email, delivery_address, payment_method, delivery_notes, subtotal, discount_amount, promo_code, shipping_fee, distance_km, long_cargo_fee, total, status)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'Order Placed')
    `);

    insertOrder.run(
      orderId,
      req.user.id,
      customer.fullName || req.user.fullName,
      customer.phone || req.user.phone || '',
      customer.email || req.user.email,
      customer.address,
      customer.paymentMethod || 'cod',
      customer.notes || null,
      subtotal,
      totalDiscountAmount,
      appliedCode,
      totalShippingFee,
      distanceKm,
      longCargoFee,
      finalTotal
    );

    // Insert line items
    const insertItem = db.prepare(`
      INSERT INTO order_items (order_id, product_id, product_name, quantity, unit_price, total_price)
      VALUES (?, ?, ?, ?, ?, ?)
    `);

    for (const item of validatedItems) {
      insertItem.run(orderId, item.id, item.name, item.quantity, item.effectivePrice, item.total);
    }

    return {
      orderId,
      userId: req.user.id,
      customer: {
        ...customer,
        fullName: customer.fullName || req.user.fullName,
        email: customer.email || req.user.email,
        distanceKm,
        isWithinTacloban: shippingResult.withinTacloban
      },
      items: validatedItems,
      subtotal,
      discountAmount: totalDiscountAmount,
      baseShippingFee,
      hasLongCargo,
      longCargoItems: shippingResult.longItems,
      distanceKm,
      withinTacloban: shippingResult.withinTacloban,
      qualifiesForFreeTacloban: shippingResult.qualifiesForFreeTacloban,
      freeDeliveryApplied: shippingResult.freeDeliveryApplied,
      excessKm: shippingResult.excessKm,
      ratePerKm: shippingResult.ratePerKm,
      longCargoFee,
      shippingFee: totalShippingFee,
      finalTotal,
      status: 'Order Placed',
      createdAt: new Date().toISOString()
    };
  });

  try {
    const order = checkoutTransaction();
    res.status(201).json({ success: true, order });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// ==================== PUBLIC ORDER TRACKER API ====================
app.get('/api/orders/track/:query', (req, res) => {
  const query = req.params.query.trim();
  
  // Search by order id or phone number
  const order = db.prepare(`
    SELECT * FROM orders 
    WHERE id = ? OR customer_phone = ? 
    ORDER BY created_at DESC 
    LIMIT 1
  `).get(query, query);

  if (!order) {
    return res.status(404).json({ error: 'Order not found. Please verify your Tracking ID or Phone number.' });
  }

  const items = db.prepare("SELECT * FROM order_items WHERE order_id = ?").all(order.id);

  // Status progression mapping
  const steps = [
    { label: 'Order Placed', desc: 'Order received and logged in system' },
    { label: 'Processing', desc: 'Payment verified and inventory allocated' },
    { label: 'Packed', desc: 'Hardware packaged with quality inspection' },
    { label: 'Out for Delivery', desc: 'Dispatched with logistics carrier' },
    { label: 'Delivered', desc: 'Delivered to customer address' }
  ];

  const currentIdx = steps.findIndex(s => s.label.toLowerCase() === (order.status || '').toLowerCase());
  const activeStep = currentIdx >= 0 ? currentIdx : 0;

  res.json({
    order: {
      ...order,
      items,
      timeline: steps.map((s, idx) => ({
        ...s,
        completed: idx <= activeStep,
        current: idx === activeStep
      }))
    }
  });
});

// ==================== ADMIN ORDER MANAGEMENT (PROTECTED) ====================
app.get('/api/admin/orders', adminAuth, (req, res) => {
  const orders = db.prepare("SELECT * FROM orders ORDER BY created_at DESC LIMIT 100").all();
  const getItems = db.prepare("SELECT * FROM order_items WHERE order_id = ?");
  
  const populated = orders.map(ord => ({
    ...ord,
    items: getItems.all(ord.id)
  }));

  res.json(populated);
});

// Update order status live
app.patch('/api/admin/orders/:id/status', adminAuth, (req, res) => {
  const { status } = req.body;
  const validStatuses = ['Order Placed', 'Processing', 'Packed', 'Out for Delivery', 'Delivered', 'Cancelled'];
  
  if (!validStatuses.includes(status)) {
    return res.status(400).json({ error: `Invalid status. Must be one of: ${validStatuses.join(', ')}` });
  }

  const order = db.prepare("SELECT * FROM orders WHERE id = ?").get(req.params.id);
  if (!order) {
    return res.status(404).json({ error: 'Order not found' });
  }

  // Restore inventory if cancelled
  if (status === 'Cancelled' && order.status !== 'Cancelled') {
    const items = db.prepare("SELECT * FROM order_items WHERE order_id = ?").all(req.params.id);
    const restoreStock = db.prepare("UPDATE products SET stock = stock + ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?");
    for (const item of items) {
      if (item.product_id) {
        restoreStock.run(item.quantity, item.product_id);
      }
    }
  }

  const result = db.prepare("UPDATE orders SET status = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?").run(status, req.params.id);
  res.json({ success: true, orderId: req.params.id, status });
});

// Customer Cancel Order endpoint (Protected with Anti-IDOR Composite Ownership Check)
app.post('/api/orders/:id/cancel', optionalAuth, (req, res) => {
  const order = db.prepare("SELECT * FROM orders WHERE id = ?").get(req.params.id);
  if (!order) {
    return res.status(404).json({ error: 'Order not found' });
  }

  // Anti-IDOR Check: If order is associated with a registered user,
  // caller must be either that authenticated user OR the store merchant admin
  const isAdmin = req.headers['x-admin-password'] === ADMIN_PASSWORD;
  if (order.user_id && !isAdmin) {
    if (!req.user || req.user.id !== order.user_id) {
      return res.status(403).json({ error: 'Forbidden: You do not own this order.' });
    }
  }

  if (order.status === 'Cancelled') {
    return res.status(400).json({ error: 'Order is already cancelled' });
  }

  if (order.status === 'Delivered' || order.status === 'Out for Delivery') {
    return res.status(400).json({ error: `Cannot cancel order in '${order.status}' status.` });
  }

  // Restore stock
  const items = db.prepare("SELECT * FROM order_items WHERE order_id = ?").all(req.params.id);
  const restoreStock = db.prepare("UPDATE products SET stock = stock + ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?");
  for (const item of items) {
    if (item.product_id) {
      restoreStock.run(item.quantity, item.product_id);
    }
  }

  db.prepare("UPDATE orders SET status = 'Cancelled', updated_at = CURRENT_TIMESTAMP WHERE id = ?").run(req.params.id);
  res.json({ success: true, orderId: req.params.id, status: 'Cancelled', message: 'Order successfully cancelled and stock restored.' });
});

// Start server
if (require.main === module) {
  app.listen(PORT, () => {
    console.log(`Manna Hardware API server running on port ${PORT}`);
  });
}

module.exports = app;
