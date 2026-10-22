const http = require('http');
const app = require('./server');

const server = app.listen(0, async () => {
  const port = server.address().port;
  const baseUrl = `http://localhost:${port}`;
  console.log(`Test server running at ${baseUrl}`);

  async function request(path, options = {}) {
    const headers = {
      'Content-Type': 'application/json',
      ...(options.headers || {})
    };
    const res = await fetch(`${baseUrl}${path}`, {
      ...options,
      headers
    });
    const text = await res.text();
    try {
      return { status: res.status, data: JSON.parse(text) };
    } catch {
      return { status: res.status, text };
    }
  }

  try {
    console.log('\n--- Test 1: Public Health ---');
    const health = await request('/api/health');
    console.log('Health:', health.status, health.data.status);
    if (health.status !== 200) throw new Error('Health check failed');

    console.log('\n--- Test 2: Login with demo account ---');
    const loginRes = await request('/api/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email: 'builder@example.com', password: 'password123' })
    });
    console.log('Login Status:', loginRes.status, 'Success:', loginRes.data.success);
    if (loginRes.status !== 200 || !loginRes.data.token) throw new Error('Demo login failed');
    const demoToken = loginRes.data.token;
    console.log('User:', loginRes.data.user.fullName, loginRes.data.user.email);

    console.log('\n--- Test 3: Login with invalid password ---');
    const badLogin = await request('/api/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email: 'builder@example.com', password: 'wrongpassword' })
    });
    console.log('Bad login status (expect 401):', badLogin.status, badLogin.data.error);
    if (badLogin.status !== 401) throw new Error('Bad login should return 401');

    console.log('\n--- Test 4: Register new customer ---');
    const testEmail = `newcustomer_${Date.now()}@example.com`;
    const regRes = await request('/api/auth/register', {
      method: 'POST',
      body: JSON.stringify({
        fullName: 'Engr. Maria Santos',
        email: testEmail,
        phone: '09189998877',
        password: 'securePass123',
        confirmPassword: 'securePass123'
      })
    });
    console.log('Register Status (expect 201):', regRes.status, 'User:', regRes.data.user?.fullName);
    if (regRes.status !== 201 || !regRes.data.token) throw new Error('Registration failed');
    const newCustomerToken = regRes.data.token;

    console.log('\n--- Test 5: Verify /api/auth/me with Bearer token ---');
    const meRes = await request('/api/auth/me', {
      headers: { Authorization: `Bearer ${newCustomerToken}` }
    });
    console.log('Auth Me Status:', meRes.status, 'Email:', meRes.data.user?.email);
    if (meRes.status !== 200 || meRes.data.user?.email !== testEmail) throw new Error('Auth me failed');

    console.log('\n--- Test 6: Checkout without login (EXPECT 401 UNAUTHORIZED) ---');
    const unauthCheckout = await request('/api/checkout', {
      method: 'POST',
      body: JSON.stringify({
        customer: { fullName: 'Guest', phone: '09123456789', address: 'Tacloban City' },
        items: [{ id: 'MNA-001', quantity: 1 }]
      })
    });
    console.log('Unauth Checkout Status (expect 401):', unauthCheckout.status, unauthCheckout.data.error);
    if (unauthCheckout.status !== 401) throw new Error('Unauth checkout must be 401');

    console.log('\n--- Test 7: Checkout with authenticated account ---');
    const authCheckout = await request('/api/checkout', {
      method: 'POST',
      headers: { Authorization: `Bearer ${newCustomerToken}` },
      body: JSON.stringify({
        customer: { fullName: 'Engr. Maria Santos', phone: '09189998877', address: 'Palo, Leyte', paymentMethod: 'cod' },
        items: [{ id: 'MNA-1001', quantity: 2 }]
      })
    });
    console.log('Auth Checkout Status (expect 201):', authCheckout.status, 'Order ID:', authCheckout.data.order?.orderId, 'User ID:', authCheckout.data.order?.userId);
    if (authCheckout.status !== 201 || !authCheckout.data.order?.orderId) throw new Error('Authenticated checkout failed');

    console.log('\n--- Test 8: Get User Orders ---');
    const userOrders = await request('/api/user/orders', {
      headers: { Authorization: `Bearer ${newCustomerToken}` }
    });
    console.log('User Orders Status:', userOrders.status, 'Total orders:', userOrders.data.orders?.length);
    if (userOrders.status !== 200 || userOrders.data.orders?.length === 0) throw new Error('User orders fetch failed');
    console.log('First order ID:', userOrders.data.orders[0].id, 'Total:', userOrders.data.orders[0].total);

    console.log('\n--- Test 9: Honeypot Protection on Register ---');
    const botReg = await request('/api/auth/register', {
      method: 'POST',
      body: JSON.stringify({
        fullName: 'Bot Spammer',
        email: 'spam@bot.com',
        password: 'password123',
        honeypot: 'spam-bot-value'
      })
    });
    console.log('Bot Register Status (intercepted):', botReg.status, botReg.data);
    if (!botReg.data.bot_intercepted) throw new Error('Honeypot should intercept bot');

    console.log('\n--- Test 10: Multi-Tenant Isolation & IDOR Defense (Prove It) ---');
    // Register Tenant User B
    const userBEmail = `tenant_b_${Date.now()}@example.com`;
    const regB = await request('/api/auth/register', {
      method: 'POST',
      body: JSON.stringify({
        fullName: 'Contractor B',
        email: userBEmail,
        phone: '09191112233',
        password: 'passwordB123',
        confirmPassword: 'passwordB123'
      })
    });
    const tokenB = regB.data.token;
    if (!tokenB) throw new Error('Tenant B registration failed');

    // Tenant B queries /api/user/orders - must NOT see User A's order
    const ordersB = await request('/api/user/orders', {
      headers: { Authorization: `Bearer ${tokenB}` }
    });
    console.log('Tenant B orders count (expect 0):', ordersB.data.orders?.length);
    if (ordersB.data.orders?.length !== 0) throw new Error('Tenant B should have 0 orders');

    // Tenant B attempts to cancel User A's order (IDOR attack - expect 403 Forbidden)
    const userAOrderId = authCheckout.data.order.orderId;
    const idorCancel = await request(`/api/orders/${userAOrderId}/cancel`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${tokenB}` }
    });
    console.log('IDOR Cancel Status (expect 403):', idorCancel.status, idorCancel.data.error);
    if (idorCancel.status !== 403) throw new Error('IDOR cancellation attempt by Tenant B should return 403 Forbidden');

    console.log('\n--- Test 11: Decoy Honeytokens / Canary Traps ---');
    const envTrap = await request('/.env');
    console.log('Decoy .env status (expect 200 with canary):', envTrap.status, envTrap.text?.includes('CANARY_KEY_DEC_99824'));
    if (envTrap.status !== 200 || !envTrap.text?.includes('CANARY_KEY_DEC_99824')) {
      throw new Error('Decoy .env canary trap failed');
    }

    const backupTrap = await request('/api/admin/config-backup.json');
    console.log('Decoy Backup status (expect 200 with canary):', backupTrap.status, backupTrap.data.canary_token);
    if (backupTrap.status !== 200 || !backupTrap.data.canary_token) {
      throw new Error('Decoy config-backup canary trap failed');
    }

    console.log('\n--- Test 12: Rate Limiting & Security Headers ---');
    const healthHeaders = await fetch(`${baseUrl}/api/health`);
    console.log('X-Content-Type-Options:', healthHeaders.headers.get('x-content-type-options'));
    console.log('X-Frame-Options:', healthHeaders.headers.get('x-frame-options'));
    if (healthHeaders.headers.get('x-content-type-options') !== 'nosniff') {
      throw new Error('Missing X-Content-Type-Options security header');
    }

    console.log('\n--- Test 13: Shipping & Long Cargo Calculator (/api/shipping/calculate) ---');
    // Test A: ₱5,000+ within Tacloban City (8 km, C-Purlins & Angle Bars) -> 100% FREE DELIVERY (₱0)
    const calcFreeTacloban = await request('/api/shipping/calculate', {
      method: 'POST',
      body: JSON.stringify({
        items: [
          { id: 'MNA-1001', name: 'C-Purlins 2x4 1.2mm', quantity: 8 },
          { id: 'MNA-1007', name: 'Angle Bar 1/4 x 2', quantity: 4 }
        ],
        distanceKm: 8, // Downtown Tacloban (within Tacloban City <= 10 km)
        subtotal: 8200 // >= ₱5,000
      })
    });
    console.log('Tacloban ₱5k+ Free Delivery:', calcFreeTacloban.data);
    if (!calcFreeTacloban.data.withinTacloban || !calcFreeTacloban.data.freeDeliveryApplied || calcFreeTacloban.data.totalShippingFee !== 0) {
      throw new Error(`Expected FREE delivery within Tacloban City for ₱5k+, got totalShippingFee: ${calcFreeTacloban.data.totalShippingFee}`);
    }

    // Test B: Under ₱5,000 within Tacloban City with 10ft items -> ₱50/km
    const calcUnder5k = await request('/api/shipping/calculate', {
      method: 'POST',
      body: JSON.stringify({
        items: [{ id: 'MNA-1001', name: 'C-Purlins 2x4 1.2mm', quantity: 2 }],
        distanceKm: 8,
        subtotal: 1550 // < ₱5,000
      })
    });
    console.log('Tacloban Under ₱5k with Long Cargo (8 km @ 50/km = 400 + 150 base):', calcUnder5k.data);
    if (calcUnder5k.data.freeDeliveryApplied !== false || calcUnder5k.data.longCargoFee !== 400) {
      throw new Error(`Expected 400 long cargo fee for 8km, got ${calcUnder5k.data.longCargoFee}`);
    }

    // Test C: ₱5,000+ Outside Tacloban City (Palo, Leyte - 15 km) -> Tacloban portion is Free, excess 5 km @ ₱50/km = ₱250
    const calcOutsideTacloban = await request('/api/shipping/calculate', {
      method: 'POST',
      body: JSON.stringify({
        items: [
          { id: 'MNA-1001', name: 'C-Purlins 2x4 1.2mm', quantity: 10 }
        ],
        distanceKm: 15, // Palo, Leyte (15 km)
        subtotal: 7750  // >= ₱5,000
      })
    });
    console.log('Beyond Tacloban ₱5k+ (15 km, 5 km excess @ 50/km = 250):', calcOutsideTacloban.data);
    if (calcOutsideTacloban.data.withinTacloban !== false || calcOutsideTacloban.data.excessKm !== 5 || calcOutsideTacloban.data.totalShippingFee !== 250) {
      throw new Error(`Expected 250 shipping fee for 15km (5km excess @ 50/km), got ${calcOutsideTacloban.data.totalShippingFee}`);
    }

    console.log('\n--- Test 14: Authenticated Checkout with Tacloban City ₱5,000+ Free Delivery ---');
    // Test 14A: ₱5k+ within Tacloban City
    const freeTaclobanCheckout = await request('/api/checkout', {
      method: 'POST',
      headers: { Authorization: `Bearer ${newCustomerToken}` },
      body: JSON.stringify({
        customer: {
          fullName: 'Engr. Maria Santos',
          phone: '09189998877',
          address: 'Downtown, Tacloban City',
          distanceKm: 8,
          paymentMethod: 'cod'
        },
        items: [
          { id: 'MNA-1001', quantity: 8 } // 8 * 775 = 6200 (>= ₱5,000)
        ]
      })
    });
    console.log('Tacloban ₱5k+ Checkout status:', freeTaclobanCheckout.status, 'Order:', freeTaclobanCheckout.data.order?.orderId);
    if (freeTaclobanCheckout.status !== 201) throw new Error('Tacloban checkout failed');
    const orderA = freeTaclobanCheckout.data.order;
    console.log('Order A - Shipping fee (expect 0):', orderA.shippingFee, 'Free delivery applied:', orderA.freeDeliveryApplied);
    if (orderA.shippingFee !== 0 || !orderA.freeDeliveryApplied) {
      throw new Error(`Order within Tacloban City >= ₱5k should have FREE delivery (0), got ${orderA.shippingFee}`);
    }

    // Test 14B: ₱5k+ outside Tacloban City (Palo, 15 km -> 250 shipping)
    const outsideTaclobanCheckout = await request('/api/checkout', {
      method: 'POST',
      headers: { Authorization: `Bearer ${newCustomerToken}` },
      body: JSON.stringify({
        customer: {
          fullName: 'Engr. Maria Santos',
          phone: '09189998877',
          address: 'Pawing, Palo, Leyte',
          distanceKm: 15,
          paymentMethod: 'cod'
        },
        items: [
          { id: 'MNA-1001', quantity: 8 } // 8 * 775 = 6200 (>= ₱5,000)
        ]
      })
    });
    console.log('Outside Tacloban Checkout status:', outsideTaclobanCheckout.status, 'Order:', outsideTaclobanCheckout.data.order?.orderId);
    if (outsideTaclobanCheckout.status !== 201) throw new Error('Outside Tacloban checkout failed');
    const orderB = outsideTaclobanCheckout.data.order;
    console.log('Order B - Shipping fee (expect 250):', orderB.shippingFee, 'Excess km:', orderB.excessKm);
    if (orderB.shippingFee !== 250 || orderB.excessKm !== 5) {
      throw new Error(`Order outside Tacloban should be charged 250 for 15km, got ${orderB.shippingFee}`);
    }

    console.log('\nALL 14 BACKEND SECURITY, LOGISTICS & MULTI-TENANT TESTS PASSED SUCCESSFULLY!');
  } catch (err) {
    console.error('TEST ERROR:', err);
    process.exitCode = 1;
  } finally {
    server.close();
  }
});
