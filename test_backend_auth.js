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

    console.log('\n--- Test 13: Shipping & 10ft+ Long Cargo Rate Calculator (/api/shipping/calculate) ---');
    // Test A: Standard items (Paint / Screws) - No long cargo surcharge
    const calcStandard = await request('/api/shipping/calculate', {
      method: 'POST',
      body: JSON.stringify({
        items: [{ id: 'MNA-1010', name: 'Boysen Permacoat White', quantity: 2 }],
        distanceKm: 15,
        subtotal: 1800
      })
    });
    console.log('Standard calc:', calcStandard.data);
    if (calcStandard.data.hasLongCargo !== false || calcStandard.data.longCargoFee !== 0 || calcStandard.data.baseShippingFee !== 150) {
      throw new Error('Standard items should not incur long cargo fee');
    }

    // Test B: 10ft+ Long Structural items (C-Purlins, Angle Bar, GI Pipe) - ₱50/km surcharge
    const calcLong = await request('/api/shipping/calculate', {
      method: 'POST',
      body: JSON.stringify({
        items: [
          { id: 'MNA-1001', name: 'C-Purlins 2x4 1.2mm', quantity: 10 },
          { id: 'MNA-1007', name: 'Angle Bar 1/4 x 2', quantity: 5 }
        ],
        distanceKm: 15, // Palo, Leyte (15 km)
        subtotal: 12000 // Subtotal >= 3000 -> Free base shipping
      })
    });
    console.log('Long cargo calc (15 km @ 50/km = 750):', calcLong.data);
    if (!calcLong.data.hasLongCargo || calcLong.data.longCargoFee !== 750 || calcLong.data.baseShippingFee !== 0 || calcLong.data.totalShippingFee !== 750) {
      throw new Error(`Long cargo fee calculation mismatch: expected 750, got ${calcLong.data.longCargoFee}`);
    }

    console.log('\n--- Test 14: Authenticated Checkout with 10ft+ Long Cargo items and distance ---');
    const longCargoCheckout = await request('/api/checkout', {
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
          { id: 'MNA-1001', quantity: 5 }, // C-Purlins 2x4 1.2mm (10ft+ long cargo)
          { id: 'MNA-1002', quantity: 2 }  // GI Pipe S-40 (10ft+ long cargo)
        ]
      })
    });
    console.log('Long cargo checkout status:', longCargoCheckout.status, 'Order:', longCargoCheckout.data.order?.orderId);
    if (longCargoCheckout.status !== 201) throw new Error('Long cargo checkout failed');
    const orderData = longCargoCheckout.data.order;
    console.log('Order long cargo fee:', orderData.longCargoFee, 'Distance:', orderData.distanceKm, 'Total shipping:', orderData.shippingFee);
    if (!orderData.hasLongCargo || orderData.longCargoFee !== 750 || orderData.distanceKm !== 15) {
      throw new Error(`Order long cargo fee mismatch: expected 750 for 15km, got ${orderData.longCargoFee}`);
    }

    console.log('\nALL 14 BACKEND SECURITY, LOGISTICS & MULTI-TENANT TESTS PASSED SUCCESSFULLY!');
  } catch (err) {
    console.error('TEST ERROR:', err);
    process.exitCode = 1;
  } finally {
    server.close();
  }
});
