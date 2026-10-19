const express = require('express');
const cors = require('cors');
const { db, seedProductsFromCatalog } = require('./db');

const app = express();
const PORT = process.env.PORT || 4000;
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || 'asenso123';

// Middleware
app.use(cors());
app.use(express.json());

// Server-side Honeypot Bot Interceptor Middleware
const honeypotGuard = (req, res, next) => {
  const { user_note_verification, honeypot } = req.body;
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
  const password = req.headers['x-admin-password'] || req.query.password || req.body?.admin_password;
  if (password !== ADMIN_PASSWORD) {
    return res.status(401).json({
      error: 'Unauthorized: Access restricted to store merchant only. Valid password required.'
    });
  }
  next();
};

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

// ==================== PRODUCTS CATALOG API (PUBLIC) ====================
app.get('/api/products', (req, res) => {
  const { category, search, stock_only } = req.query;
  let query = "SELECT * FROM products WHERE 1=1";
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
  const product = db.prepare("SELECT * FROM products WHERE id = ?").get(req.params.id);
  if (!product) {
    return res.status(404).json({ error: 'Product not found' });
  }
  res.json(product);
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

// Admin batch per-item discount updater
app.post('/api/admin/products/:id/discount', adminAuth, (req, res) => {
  const { discount_percent } = req.body;
  const discountVal = Math.max(0, Math.min(100, Number(discount_percent || 0)));
  
  const result = db.prepare("UPDATE products SET discount_percent = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?")
    .run(discountVal, req.params.id);

  if (result.changes === 0) {
    return res.status(404).json({ error: 'Product not found' });
  }
  res.json({ success: true, id: req.params.id, discount_percent: discountVal });
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

// ==================== CHECKOUT & ORDERS API ====================
app.post('/api/checkout', honeypotGuard, (req, res) => {
  const { customer, items, promoCode } = req.body;

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

      validatedItems.push({
        id: liveProduct.id,
        name: liveProduct.name,
        unit: liveProduct.unit,
        price: liveProduct.price,
        effectivePrice: effectiveUnitPrice,
        discountPercent: itemDiscountPercent,
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
    const shippingFee = subtotal >= 3000 ? 0 : 150;
    const finalTotal = Math.max(0, subtotal - totalDiscountAmount + shippingFee);

    // Decrement stock
    const decrementStock = db.prepare("UPDATE products SET stock = stock - ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?");
    for (const item of validatedItems) {
      decrementStock.run(item.quantity, item.id);
    }

    // Insert order with initial status 'Order Placed'
    const orderId = `MNA-ORD-${Date.now().toString().slice(-6)}`;
    const insertOrder = db.prepare(`
      INSERT INTO orders (id, customer_name, customer_phone, customer_email, delivery_address, payment_method, delivery_notes, subtotal, discount_amount, promo_code, shipping_fee, total, status)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'Order Placed')
    `);

    insertOrder.run(
      orderId,
      customer.fullName,
      customer.phone,
      customer.email || null,
      customer.address,
      customer.paymentMethod || 'cod',
      customer.notes || null,
      subtotal,
      totalDiscountAmount,
      appliedCode,
      shippingFee,
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
      customer,
      items: validatedItems,
      subtotal,
      discountAmount: totalDiscountAmount,
      shippingFee,
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

  const result = db.prepare("UPDATE orders SET status = ? WHERE id = ?").run(status, req.params.id);
  if (result.changes === 0) {
    return res.status(404).json({ error: 'Order not found' });
  }

  res.json({ success: true, orderId: req.params.id, status });
});

// Start server
if (require.main === module) {
  app.listen(PORT, () => {
    console.log(`Manna Hardware API server running on port ${PORT}`);
  });
}

module.exports = app;
