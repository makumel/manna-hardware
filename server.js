const express = require('express');
const cors = require('cors');
const { db, seedProductsFromCatalog } = require('./db');

const app = express();
const PORT = process.env.PORT || 4000;

// Middleware
app.use(cors());
app.use(express.json());

// Server-side Honeypot Bot Interceptor Middleware
const honeypotGuard = (req, res, next) => {
  const { user_note_verification, honeypot } = req.body;
  if (user_note_verification || honeypot) {
    console.warn(`[SECURITY ALERT] Automated bot submission intercepted from IP: ${req.ip}`);
    // Respond with fake 200 to trick bots without executing transaction
    return res.status(200).json({
      success: true,
      message: 'Order received',
      bot_intercepted: true
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

app.get('/api/stats', (req, res) => {
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

// ==================== PRODUCTS CATALOG API ====================
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

// Update product stock / price / capital from dashboard
app.patch('/api/products/:id', (req, res) => {
  const { price, capital, stock, featured } = req.body;
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

// ==================== DISCOUNTS & PROMOTIONS API ====================
app.get('/api/discounts', (req, res) => {
  const rows = db.prepare("SELECT * FROM discounts ORDER BY created_at ASC").all();
  res.json(rows);
});

// Validate Promo Code
app.post('/api/discounts/validate', (req, res) => {
  const { code, subtotal } = req.body;
  if (!code) {
    return res.status(400).json({ error: 'Code is required' });
  }

  const promo = db.prepare("SELECT * FROM discounts WHERE code = ? AND active = 1").get(code.trim().toUpperCase());
  if (!promo) {
    return res.status(404).json({ valid: false, message: 'Invalid or inactive promo code.' });
  }

  if (Number(subtotal || 0) < promo.min_spend) {
    return res.status(400).json({
      valid: false,
      message: `Minimum spend of ₱${promo.min_spend.toLocaleString()} required.`
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

// Toggle discount status
app.patch('/api/discounts/:code/toggle', (req, res) => {
  const promo = db.prepare("SELECT * FROM discounts WHERE code = ?").get(req.params.code);
  if (!promo) return res.status(404).json({ error: 'Discount code not found' });

  const newStatus = promo.active ? 0 : 1;
  db.prepare("UPDATE discounts SET active = ? WHERE code = ?").run(newStatus, req.params.code);
  res.json({ success: true, code: req.params.code, active: Boolean(newStatus) });
});

// Storewide Flash Discount Settings
app.get('/api/settings/storewide-discount', (req, res) => {
  const setting = db.prepare("SELECT value FROM store_settings WHERE key = 'storewide_discount'").get();
  res.json({ discount_percentage: Number(setting?.value || 0) });
});

app.post('/api/settings/storewide-discount', (req, res) => {
  const { discount_percentage } = req.body;
  const num = Math.max(0, Math.min(50, Number(discount_percentage || 0)));
  db.prepare("UPDATE store_settings SET value = ? WHERE key = 'storewide_discount'").run(num.toString());
  res.json({ success: true, discount_percentage: num });
});

// ==================== CHECKOUT & ORDERS API ====================
app.post('/api/checkout', honeypotGuard, (req, res) => {
  const { customer, items, promoCode } = req.body;

  if (!customer || !customer.fullName || !customer.phone || !customer.address) {
    return res.status(400).json({ error: 'Full customer name, phone, and address are required' });
  }

  if (!items || !Array.isArray(items) || items.length === 0) {
    return res.status(400).json({ error: 'Order must contain at least one item' });
  }

  // Transaction: Verify stock, compute verified totals, decrement inventory, insert order
  const checkoutTransaction = db.transaction(() => {
    let subtotal = 0;
    const validatedItems = [];

    // Verify stock and current prices
    for (const item of items) {
      const liveProduct = db.prepare("SELECT * FROM products WHERE id = ?").get(item.id);
      if (!liveProduct) {
        throw new Error(`Product ${item.id} not found.`);
      }
      if (liveProduct.stock < item.quantity) {
        throw new Error(`Insufficient stock for ${liveProduct.name}. Available: ${liveProduct.stock}`);
      }
      const itemTotal = liveProduct.price * item.quantity;
      subtotal += itemTotal;
      validatedItems.push({
        id: liveProduct.id,
        name: liveProduct.name,
        unit: liveProduct.unit,
        price: liveProduct.price,
        quantity: item.quantity,
        total: itemTotal
      });
    }

    // Apply storewide discount
    const storewideSetting = db.prepare("SELECT value FROM store_settings WHERE key = 'storewide_discount'").get();
    const storewidePercent = Number(storewideSetting?.value || 0);
    let discountAmount = 0;

    if (storewidePercent > 0) {
      discountAmount += (subtotal * (storewidePercent / 100));
    }

    // Apply promo code if provided
    let appliedCode = null;
    if (promoCode) {
      const promo = db.prepare("SELECT * FROM discounts WHERE code = ? AND active = 1").get(promoCode.trim().toUpperCase());
      if (promo && subtotal >= promo.min_spend) {
        appliedCode = promo.code;
        if (promo.type === 'percentage') {
          discountAmount += (subtotal * (promo.value / 100));
        } else {
          discountAmount += promo.value;
        }
      }
    }

    discountAmount = Math.min(discountAmount, subtotal);
    const shippingFee = subtotal >= 3000 ? 0 : 150;
    const finalTotal = Math.max(0, subtotal - discountAmount + shippingFee);

    // Decrement stock
    const decrementStock = db.prepare("UPDATE products SET stock = stock - ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?");
    for (const item of validatedItems) {
      decrementStock.run(item.quantity, item.id);
    }

    // Insert order
    const orderId = `MNA-${Date.now().toString().slice(-6)}`;
    const insertOrder = db.prepare(`
      INSERT INTO orders (id, customer_name, customer_phone, customer_email, delivery_address, payment_method, delivery_notes, subtotal, discount_amount, promo_code, shipping_fee, total, status)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'Processing')
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
      discountAmount,
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
      insertItem.run(orderId, item.id, item.name, item.quantity, item.price, item.total);
    }

    return {
      orderId,
      customer,
      items: validatedItems,
      subtotal,
      discountAmount,
      shippingFee,
      finalTotal,
      status: 'Processing'
    };
  });

  try {
    const order = checkoutTransaction();
    res.status(201).json({ success: true, order });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

app.get('/api/orders', (req, res) => {
  const orders = db.prepare("SELECT * FROM orders ORDER BY created_at DESC LIMIT 50").all();
  res.json(orders);
});

// Start server
if (require.main === module) {
  app.listen(PORT, () => {
    console.log(`Manna Hardware API server running on port ${PORT}`);
  });
}

module.exports = app;
