import React, { useState, useEffect, useMemo } from 'react';
import initialCatalog from './catalog.json';
import { 
  ShoppingCart, Search, Tag, SlidersHorizontal, Package, CheckCircle2, 
  Trash2, Plus, Minus, ArrowRight, ShieldCheck, TrendingUp, DollarSign,
  AlertCircle, RefreshCw, X, ChevronRight, Store, LayoutDashboard, Truck,
  Check, Percent, Layers, Heart
} from 'lucide-react';

export default function App() {
  // Navigation: 'storefront' | 'dashboard' | 'checkout' | 'order-success'
  const [activeTab, setActiveTab] = useState('storefront');
  
  // Persistent Products with Live Inventory
  const [products, setProducts] = useState(() => {
    const saved = localStorage.getItem('fanvill_products');
    return saved ? JSON.parse(saved) : initialCatalog;
  });

  // Cart State
  const [cart, setCart] = useState(() => {
    const saved = localStorage.getItem('fanvill_cart');
    return saved ? JSON.parse(saved) : [];
  });
  const [isCartOpen, setIsCartOpen] = useState(false);

  // Discount / Promotion Engine
  const [discounts, setDiscounts] = useState(() => {
    const saved = localStorage.getItem('fanvill_discounts');
    return saved ? JSON.parse(saved) : [
      { code: 'FANVILL10', type: 'percentage', value: 10, minSpend: 1000, active: true, description: '10% off on orders over ₱1,000' },
      { code: 'HARDWARE500', type: 'flat', value: 500, minSpend: 5000, active: true, description: '₱500 flat discount on orders over ₱5,000' },
      { code: 'BUILDER5', type: 'percentage', value: 5, minSpend: 0, active: true, description: '5% Contractor Special' }
    ];
  });
  const [storewideDiscount, setStorewideDiscount] = useState(() => {
    const saved = localStorage.getItem('fanvill_storewide_discount');
    return saved ? Number(saved) : 0; // percentage
  });
  const [appliedPromo, setAppliedPromo] = useState(null);
  const [promoInput, setPromoInput] = useState('');
  const [promoMessage, setPromoMessage] = useState({ text: '', type: '' });

  // Storefront Filtering & Search
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [priceSort, setPriceSort] = useState('featured');
  const [stockOnly, setStockOnly] = useState(false);

  // Checkout Customer Information
  const [customer, setCustomer] = useState({
    fullName: '',
    phone: '',
    email: '',
    address: '',
    city: 'Tacloban City',
    notes: '',
    paymentMethod: 'cod', // 'cod' | 'gcash' | 'bank_transfer'
    honeypot: '' // Invisible bot security trap
  });
  const [placedOrder, setPlacedOrder] = useState(null);

  // Completed Orders History
  const [orders, setOrders] = useState(() => {
    const saved = localStorage.getItem('fanvill_orders');
    return saved ? JSON.parse(saved) : [];
  });

  // Save changes to localStorage
  useEffect(() => {
    localStorage.setItem('fanvill_products', JSON.stringify(products));
  }, [products]);

  useEffect(() => {
    localStorage.setItem('fanvill_cart', JSON.stringify(cart));
  }, [cart]);

  useEffect(() => {
    localStorage.setItem('fanvill_discounts', JSON.stringify(discounts));
  }, [discounts]);

  useEffect(() => {
    localStorage.setItem('fanvill_storewide_discount', storewideDiscount.toString());
  }, [storewideDiscount]);

  useEffect(() => {
    localStorage.setItem('fanvill_orders', JSON.stringify(orders));
  }, [orders]);

  // Categories list
  const categories = useMemo(() => {
    const cats = ['All', ...new Set(products.map(p => p.category))];
    return cats;
  }, [products]);

  // Filtered products
  const filteredProducts = useMemo(() => {
    return products.filter(p => {
      const matchCat = selectedCategory === 'All' || p.category === selectedCategory;
      const matchSearch = p.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          p.id.toLowerCase().includes(searchQuery.toLowerCase());
      const matchStock = stockOnly ? p.stock > 0 : true;
      return matchCat && matchSearch && matchStock;
    }).sort((a, b) => {
      if (priceSort === 'low-high') return a.price - b.price;
      if (priceSort === 'high-low') return b.price - a.price;
      if (priceSort === 'name') return a.name.localeCompare(b.name);
      return (b.featured ? 1 : 0) - (a.featured ? 1 : 0);
    });
  }, [products, selectedCategory, searchQuery, priceSort, stockOnly]);

  // Pricing calculations
  const cartSubtotal = useMemo(() => {
    return cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  }, [cart]);

  const discountAmount = useMemo(() => {
    let disc = 0;
    // Apply promo code if present
    if (appliedPromo) {
      if (appliedPromo.type === 'percentage') {
        disc += (cartSubtotal * (appliedPromo.value / 100));
      } else if (appliedPromo.type === 'flat') {
        disc += appliedPromo.value;
      }
    }
    // Apply storewide discount if active
    if (storewideDiscount > 0) {
      disc += (cartSubtotal * (storewideDiscount / 100));
    }
    return Math.min(disc, cartSubtotal);
  }, [cartSubtotal, appliedPromo, storewideDiscount]);

  const shippingFee = cartSubtotal > 3000 || cart.length === 0 ? 0 : 150;
  const orderTotal = Math.max(0, cartSubtotal - discountAmount + shippingFee);

  // Cart operations
  const addToCart = (product) => {
    if (product.stock <= 0) return;
    setCart(prev => {
      const existing = prev.find(item => item.id === product.id);
      if (existing) {
        if (existing.quantity >= product.stock) return prev;
        return prev.map(item => item.id === product.id ? { ...item, quantity: item.quantity + 1 } : item);
      }
      return [...prev, { ...product, quantity: 1 }];
    });
    setIsCartOpen(true);
  };

  const updateCartQty = (id, delta) => {
    setCart(prev => {
      return prev.map(item => {
        if (item.id === id) {
          const product = products.find(p => p.id === id);
          const maxStock = product ? product.stock : 999;
          const newQty = item.quantity + delta;
          if (newQty <= 0) return null;
          if (newQty > maxStock) return item;
          return { ...item, quantity: newQty };
        }
        return item;
      }).filter(Boolean);
    });
  };

  const removeFromCart = (id) => {
    setCart(prev => prev.filter(item => item.id !== id));
  };

  // Promo code validation
  const handleApplyPromo = () => {
    const cleanCode = promoInput.trim().toUpperCase();
    if (!cleanCode) return;
    const promo = discounts.find(d => d.code === cleanCode && d.active);
    if (!promo) {
      setPromoMessage({ text: 'Invalid or expired promo code', type: 'error' });
      return;
    }
    if (cartSubtotal < promo.minSpend) {
      setPromoMessage({ text: `Minimum spend of ₱${promo.minSpend.toLocaleString()} required`, type: 'error' });
      return;
    }
    setAppliedPromo(promo);
    setPromoMessage({ text: `Applied: ${promo.description}`, type: 'success' });
    setPromoInput('');
  };

  // Submit Order & Decrement Live Inventory
  const handleCheckoutSubmit = (e) => {
    e.preventDefault();
    // Honeypot bot protection
    if (customer.honeypot) {
      console.warn("Bot detected via honeypot trap.");
      return;
    }
    if (cart.length === 0) return;

    // Check inventory availability
    for (const item of cart) {
      const liveP = products.find(p => p.id === item.id);
      if (!liveP || liveP.stock < item.quantity) {
        alert(`Insufficient stock for ${item.name}. Available: ${liveP ? liveP.stock : 0}`);
        return;
      }
    }

    // Decrement stock
    setProducts(prev => {
      return prev.map(p => {
        const cartItem = cart.find(c => c.id === p.id);
        if (cartItem) {
          return { ...p, stock: Math.max(0, p.stock - cartItem.quantity) };
        }
        return p;
      });
    });

    const newOrder = {
      orderId: `ORD-${Date.now().toString().slice(-6)}`,
      date: new Date().toLocaleString(),
      customer: { ...customer },
      items: [...cart],
      subtotal: cartSubtotal,
      discount: discountAmount,
      promoCode: appliedPromo ? appliedPromo.code : null,
      shipping: shippingFee,
      total: orderTotal,
      status: 'Processing'
    };

    setOrders(prev => [newOrder, ...prev]);
    setPlacedOrder(newOrder);
    setCart([]);
    setAppliedPromo(null);
    setActiveTab('order-success');
    setIsCartOpen(false);
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans">
      {/* Top Banner */}
      <div className="bg-slate-900 text-slate-300 text-xs py-1.5 px-4 text-center font-medium flex items-center justify-center gap-3 border-b border-slate-800">
        <span className="flex items-center gap-1">
          <Truck className="w-3.5 h-3.5 text-emerald-400" /> Free delivery across Tacloban City for orders above ₱3,000!
        </span>
        {storewideDiscount > 0 && (
          <span className="bg-amber-500 text-slate-950 font-bold px-2 py-0.5 rounded-full text-[10px] uppercase tracking-wide">
            {storewideDiscount}% Storewide Sale Active!
          </span>
        )}
      </div>

      {/* Main Navbar */}
      <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-200 shadow-xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-4">
          
          {/* Logo / Brand */}
          <div className="flex items-center gap-3">
            <button 
              onClick={() => setActiveTab('storefront')}
              className="flex items-center gap-2.5 text-left group"
            >
              <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-blue-700 to-indigo-600 flex items-center justify-center text-white shadow-md shadow-blue-500/20 group-hover:scale-105 transition-transform">
                <Store className="w-5 h-5" />
              </div>
              <div>
                <span className="text-lg font-black tracking-tight text-slate-900 block leading-tight">FANVILL</span>
                <span className="text-[10px] font-semibold uppercase tracking-wider text-slate-500 block">Hardware Cabalwan</span>
              </div>
            </button>
          </div>

          {/* Navigation Pill Switcher */}
          <div className="flex items-center bg-slate-100 p-1 rounded-xl border border-slate-200">
            <button
              onClick={() => setActiveTab('storefront')}
              className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                activeTab === 'storefront' || activeTab === 'checkout'
                  ? 'bg-white text-slate-900 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Store className="w-3.5 h-3.5" />
              Online Store
            </button>
            <button
              onClick={() => setActiveTab('dashboard')}
              className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                activeTab === 'dashboard'
                  ? 'bg-white text-blue-700 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <LayoutDashboard className="w-3.5 h-3.5" />
              Merchant Dashboard
              {orders.length > 0 && (
                <span className="bg-blue-600 text-white rounded-full px-1.5 py-0.2 text-[10px]">
                  {orders.length}
                </span>
              )}
            </button>
          </div>

          {/* Right actions: Cart */}
          <div className="flex items-center gap-3">
            <button
              onClick={() => setIsCartOpen(true)}
              className="relative flex items-center gap-2 bg-blue-50 hover:bg-blue-100 text-blue-700 px-3.5 py-2 rounded-xl text-xs font-bold transition-colors"
            >
              <ShoppingCart className="w-4 h-4" />
              <span className="hidden sm:inline">Cart</span>
              <span className="bg-blue-600 text-white text-[11px] font-bold w-5 h-5 rounded-full flex items-center justify-center">
                {cart.reduce((s, i) => s + i.quantity, 0)}
              </span>
            </button>
          </div>
        </div>
      </header>

      {/* VIEW: STOREFRONT CATALOG */}
      {activeTab === 'storefront' && (
        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 flex-1 w-full">
          {/* Hero Banner */}
          <div className="relative rounded-2xl overflow-hidden bg-gradient-to-r from-slate-900 via-blue-950 to-indigo-950 text-white p-6 sm:p-10 mb-8 shadow-xl">
            <div className="relative z-10 max-w-2xl">
              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-blue-500/20 text-blue-300 border border-blue-400/30 mb-3">
                <ShieldCheck className="w-3.5 h-3.5" /> Official Wholesale & Retail Catalog
              </span>
              <h1 className="text-2xl sm:text-4xl font-extrabold tracking-tight text-white mb-2">
                Heavy Construction & Everyday Hardware Supplies
              </h1>
              <p className="text-slate-300 text-sm sm:text-base mb-6">
                Direct supplier pricing on paints, structural steel, plumbing pipes, fasteners, and power equipment in Tacloban City.
              </p>
              
              <div className="flex flex-wrap items-center gap-4 text-xs font-medium text-slate-300">
                <span className="flex items-center gap-1.5"><CheckCircle2 className="w-4 h-4 text-emerald-400" /> {products.length} Items In Stock</span>
                <span className="flex items-center gap-1.5"><CheckCircle2 className="w-4 h-4 text-emerald-400" /> Cash on Delivery Available</span>
                <span className="flex items-center gap-1.5"><CheckCircle2 className="w-4 h-4 text-emerald-400" /> Same-Day Hauling</span>
              </div>
            </div>
          </div>

          {/* Search & Filter Controls */}
          <div className="bg-white rounded-xl p-4 shadow-xs border border-slate-200 mb-6 flex flex-col md:flex-row items-center gap-4">
            {/* Search Input */}
            <div className="relative flex-1 w-full">
              <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                placeholder="Search across 465 products (e.g., Island Paint, Blind Rivets, Plain Bar)..."
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
              />
              {searchQuery && (
                <button onClick={() => setSearchQuery('')} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600">
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>

            {/* Filter controls */}
            <div className="flex items-center gap-3 w-full md:w-auto">
              {/* Sort By */}
              <select
                value={priceSort}
                onChange={e => setPriceSort(e.target.value)}
                className="bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-xs font-semibold text-slate-700 focus:outline-none focus:border-blue-500 cursor-pointer"
              >
                <option value="featured">Featured First</option>
                <option value="low-high">Price: Low to High</option>
                <option value="high-low">Price: High to Low</option>
                <option value="name">Name (A-Z)</option>
              </select>

              {/* In stock toggle */}
              <label className="flex items-center gap-2 text-xs font-semibold text-slate-600 cursor-pointer select-none bg-slate-50 border border-slate-200 rounded-lg px-3 py-2">
                <input
                  type="checkbox"
                  checked={stockOnly}
                  onChange={e => setStockOnly(e.target.checked)}
                  className="rounded text-blue-600 focus:ring-blue-500"
                />
                In Stock Only
              </label>
            </div>
          </div>

          {/* Category Tabs */}
          <div className="flex items-center gap-2 overflow-x-auto pb-3 mb-6 no-scrollbar">
            {categories.map(cat => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`whitespace-nowrap px-4 py-1.5 rounded-full text-xs font-bold transition-all ${
                  selectedCategory === cat
                    ? 'bg-blue-600 text-white shadow-sm'
                    : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>

          {/* Product Grid */}
          <div className="mb-4 flex items-center justify-between text-xs text-slate-500 font-medium">
            <span>Showing <strong className="text-slate-900">{filteredProducts.length}</strong> items in catalog</span>
            {selectedCategory !== 'All' && (
              <button onClick={() => setSelectedCategory('All')} className="text-blue-600 hover:underline">
                Clear Category Filter
              </button>
            )}
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
            {filteredProducts.map(product => {
              const effectivePrice = storewideDiscount > 0
                ? product.price * (1 - storewideDiscount / 100)
                : product.price;

              return (
                <div 
                  key={product.id}
                  className="bg-white rounded-xl border border-slate-200 overflow-hidden flex flex-col hover:shadow-lg transition-all group"
                >
                  {/* Product Card Top Badges & Category */}
                  <div className="p-3 pb-0 flex items-center justify-between">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 bg-slate-100 px-2 py-0.5 rounded-md">
                      {product.category}
                    </span>
                    {product.stock <= 0 ? (
                      <span className="text-[10px] font-bold bg-rose-50 text-rose-600 px-2 py-0.5 rounded-md">Out of Stock</span>
                    ) : product.stock < 10 ? (
                      <span className="text-[10px] font-bold bg-amber-50 text-amber-600 px-2 py-0.5 rounded-md">Low Stock: {product.stock}</span>
                    ) : (
                      <span className="text-[10px] font-bold bg-emerald-50 text-emerald-600 px-2 py-0.5 rounded-md">In Stock ({product.stock})</span>
                    )}
                  </div>

                  {/* Thumbnail / Icon area */}
                  <div className="h-36 bg-gradient-to-b from-slate-50 to-white flex items-center justify-center p-4">
                    <div className="w-16 h-16 rounded-2xl bg-blue-50 group-hover:bg-blue-100 text-blue-600 flex items-center justify-center transition-transform group-hover:scale-110">
                      <Package className="w-8 h-8" />
                    </div>
                  </div>

                  {/* Card Body */}
                  <div className="p-4 pt-1 flex-1 flex flex-col justify-between">
                    <div>
                      <span className="text-[11px] font-mono text-slate-400 block mb-1">SKU: {product.id}</span>
                      <h3 className="font-bold text-sm text-slate-900 group-hover:text-blue-600 transition-colors line-clamp-2 leading-snug">
                        {product.name}
                      </h3>
                      <p className="text-slate-500 text-xs mt-1">Per {product.unit}</p>
                    </div>

                    <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between">
                      <div>
                        {storewideDiscount > 0 ? (
                          <>
                            <span className="text-xs text-slate-400 line-through block">₱{product.price.toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>
                            <span className="text-base font-extrabold text-blue-700">₱{effectivePrice.toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>
                          </>
                        ) : (
                          <span className="text-base font-extrabold text-slate-900">₱{product.price.toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>
                        )}
                      </div>

                      <button
                        onClick={() => addToCart(product)}
                        disabled={product.stock <= 0}
                        className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 ${
                          product.stock <= 0
                            ? 'bg-slate-100 text-slate-400 cursor-not-allowed'
                            : 'bg-blue-600 hover:bg-blue-700 text-white shadow-sm hover:scale-102 active:scale-98'
                        }`}
                      >
                        <Plus className="w-3.5 h-3.5" /> Add
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </main>
      )}

      {/* VIEW: CHECKOUT FORM */}
      {activeTab === 'checkout' && (
        <main className="max-w-4xl mx-auto px-4 sm:px-6 py-8 flex-1 w-full">
          <button
            onClick={() => setActiveTab('storefront')}
            className="flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-slate-900 mb-6"
          >
            ← Back to Product Catalog
          </button>

          <div className="grid grid-cols-1 md:grid-cols-12 gap-8">
            {/* Customer Information Form */}
            <div className="md:col-span-7 bg-white rounded-2xl border border-slate-200 p-6 shadow-sm">
              <h2 className="text-lg font-bold text-slate-900 mb-1 flex items-center gap-2">
                <Truck className="w-5 h-5 text-blue-600" /> Delivery & Customer Details
              </h2>
              <p className="text-xs text-slate-500 mb-6">Enter your contact info for delivery verification and invoice billing.</p>

              <form onSubmit={handleCheckoutSubmit} className="space-y-4">
                {/* Honeypot hidden input */}
                <input
                  type="text"
                  name="user_note_verification"
                  tabIndex={-1}
                  aria-hidden="true"
                  value={customer.honeypot}
                  onChange={e => setCustomer({ ...customer, honeypot: e.target.value })}
                  style={{ position: 'absolute', left: '-9999px', opacity: 0 }}
                />

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Full Name / Contractor Name *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g., Juan Dela Cruz"
                    value={customer.fullName}
                    onChange={e => setCustomer({ ...customer, fullName: e.target.value })}
                    className="w-full px-3.5 py-2 text-sm border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">Mobile Contact Number *</label>
                    <input
                      type="tel"
                      required
                      placeholder="e.g., 0917 123 4567"
                      value={customer.phone}
                      onChange={e => setCustomer({ ...customer, phone: e.target.value })}
                      className="w-full px-3.5 py-2 text-sm border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">Email Address</label>
                    <input
                      type="email"
                      placeholder="e.g., juan@example.com"
                      value={customer.email}
                      onChange={e => setCustomer({ ...customer, email: e.target.value })}
                      className="w-full px-3.5 py-2 text-sm border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Delivery / Project Site Address *</label>
                  <textarea
                    required
                    rows={2}
                    placeholder="House/Site #, Street, Barangay, Cabalwan, Tacloban City..."
                    value={customer.address}
                    onChange={e => setCustomer({ ...customer, address: e.target.value })}
                    className="w-full px-3.5 py-2 text-sm border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Payment Method</label>
                  <div className="grid grid-cols-3 gap-2">
                    {[
                      { id: 'cod', label: 'Cash on Delivery', desc: 'Pay when unloaded' },
                      { id: 'gcash', label: 'GCash / Maya', desc: 'Instant QR payment' },
                      { id: 'bank_transfer', label: 'Bank Transfer', desc: 'BDO / BPI' }
                    ].map(pm => (
                      <label 
                        key={pm.id}
                        onClick={() => setCustomer({ ...customer, paymentMethod: pm.id })}
                        className={`p-3 rounded-xl border text-left cursor-pointer transition-all ${
                          customer.paymentMethod === pm.id
                            ? 'border-blue-600 bg-blue-50/50 ring-1 ring-blue-600'
                            : 'border-slate-200 hover:bg-slate-50'
                        }`}
                      >
                        <span className="text-xs font-bold block text-slate-900">{pm.label}</span>
                        <span className="text-[10px] text-slate-500 block mt-0.5">{pm.desc}</span>
                      </label>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Delivery Instructions / Remarks</label>
                  <input
                    type="text"
                    placeholder="e.g. Call before arrival, gate near barangay hall"
                    value={customer.notes}
                    onChange={e => setCustomer({ ...customer, notes: e.target.value })}
                    className="w-full px-3.5 py-2 text-sm border border-slate-200 rounded-lg"
                  />
                </div>

                <button
                  type="submit"
                  disabled={cart.length === 0}
                  className="w-full mt-6 bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-3.5 rounded-xl shadow-md flex items-center justify-center gap-2 cursor-pointer transition-transform active:scale-98"
                >
                  <ShieldCheck className="w-5 h-5" /> Confirm & Place Order (₱{orderTotal.toLocaleString(undefined, { minimumFractionDigits: 2 })})
                </button>
              </form>
            </div>

            {/* Order Summary Column */}
            <div className="md:col-span-5 bg-white rounded-2xl border border-slate-200 p-6 shadow-sm h-fit">
              <h3 className="font-bold text-sm text-slate-900 mb-4 pb-2 border-b border-slate-100 flex items-center justify-between">
                <span>Cart Order Summary</span>
                <span className="text-xs text-slate-500">{cart.length} unique items</span>
              </h3>

              <div className="max-h-60 overflow-y-auto space-y-3 mb-4 pr-1">
                {cart.map(item => (
                  <div key={item.id} className="flex items-center justify-between text-xs">
                    <div className="flex-1 pr-2">
                      <p className="font-semibold text-slate-800 line-clamp-1">{item.name}</p>
                      <span className="text-slate-400">Qty: {item.quantity} × ₱{item.price.toLocaleString()}</span>
                    </div>
                    <span className="font-bold text-slate-900">₱{(item.price * item.quantity).toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>
                  </div>
                ))}
              </div>

              {/* Promo code box */}
              <div className="pt-3 border-t border-slate-100 mb-4">
                <div className="flex gap-2">
                  <input
                    type="text"
                    placeholder="Enter promo code..."
                    value={promoInput}
                    onChange={e => setPromoInput(e.target.value)}
                    className="flex-1 uppercase font-mono text-xs px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:border-blue-500"
                  />
                  <button
                    type="button"
                    onClick={handleApplyPromo}
                    className="bg-slate-900 hover:bg-black text-white px-3 py-2 rounded-lg text-xs font-bold"
                  >
                    Apply
                  </button>
                </div>
                {promoMessage.text && (
                  <p className={`text-[11px] mt-1.5 ${promoMessage.type === 'error' ? 'text-rose-600' : 'text-emerald-600 font-semibold'}`}>
                    {promoMessage.text}
                  </p>
                )}
              </div>

              <div className="space-y-2 text-xs border-t border-slate-100 pt-3">
                <div className="flex justify-between text-slate-600">
                  <span>Subtotal</span>
                  <span>₱{cartSubtotal.toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>
                </div>
                {discountAmount > 0 && (
                  <div className="flex justify-between text-emerald-600 font-semibold">
                    <span>Discount Savings</span>
                    <span>-₱{discountAmount.toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>
                  </div>
                )}
                <div className="flex justify-between text-slate-600">
                  <span>Shipping / Hauling</span>
                  <span>{shippingFee === 0 ? <strong className="text-emerald-600">FREE</strong> : `₱${shippingFee.toFixed(2)}`}</span>
                </div>
                <div className="flex justify-between text-sm font-extrabold text-slate-900 pt-2 border-t border-slate-200">
                  <span>Final Total</span>
                  <span className="text-blue-700">₱{orderTotal.toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>
                </div>
              </div>
            </div>
          </div>
        </main>
      )}

      {/* VIEW: ORDER SUCCESS */}
      {activeTab === 'order-success' && placedOrder && (
        <main className="max-w-xl mx-auto px-4 py-16 flex-1 text-center">
          <div className="w-16 h-16 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto mb-4">
            <Check className="w-8 h-8" />
          </div>
          <h2 className="text-2xl font-black text-slate-900 mb-2">Order Confirmed!</h2>
          <p className="text-slate-600 text-sm mb-6">
            Thank you, <strong className="text-slate-900">{placedOrder.customer.fullName}</strong>. Your order has been dispatched to Fanvill Hardware Cabalwan.
          </p>

          <div className="bg-white rounded-2xl border border-slate-200 p-6 text-left shadow-sm mb-6">
            <div className="flex justify-between pb-3 border-b border-slate-100 text-xs">
              <span className="text-slate-500">Order Reference</span>
              <span className="font-mono font-bold text-slate-900">{placedOrder.orderId}</span>
            </div>
            <div className="flex justify-between py-2 border-b border-slate-100 text-xs">
              <span className="text-slate-500">Delivery Address</span>
              <span className="font-medium text-slate-800 text-right">{placedOrder.customer.address}</span>
            </div>
            <div className="flex justify-between py-2 border-b border-slate-100 text-xs">
              <span className="text-slate-500">Payment Mode</span>
              <span className="font-bold uppercase text-slate-900">{placedOrder.customer.paymentMethod}</span>
            </div>
            <div className="flex justify-between pt-3 text-sm font-black text-blue-700">
              <span>Total Amount</span>
              <span>₱{placedOrder.total.toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>
            </div>
          </div>

          <div className="flex gap-3 justify-center">
            <button
              onClick={() => setActiveTab('storefront')}
              className="bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold px-6 py-3 rounded-xl shadow-sm"
            >
              Continue Shopping
            </button>
            <button
              onClick={() => setActiveTab('dashboard')}
              className="bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-bold px-6 py-3 rounded-xl"
            >
              View in Merchant Dashboard
            </button>
          </div>
        </main>
      )}

      {/* VIEW: MERCHANT ADMIN DASHBOARD & DISCOUNT CONTROLS */}
      {activeTab === 'dashboard' && (
        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 flex-1 w-full space-y-8">
          {/* Header */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-slate-200">
            <div>
              <h1 className="text-2xl font-black text-slate-900 tracking-tight flex items-center gap-2">
                <LayoutDashboard className="w-6 h-6 text-blue-600" /> Merchant Control Dashboard
              </h1>
              <p className="text-xs text-slate-500 mt-1">
                Manage discounts, live inventory quantities, profit margins, and customer order history.
              </p>
            </div>
            
            <div className="flex items-center gap-2">
              <button
                onClick={() => {
                  if (confirm("Reset catalog and orders to default factory state?")) {
                    localStorage.removeItem('fanvill_products');
                    localStorage.removeItem('fanvill_orders');
                    setProducts(initialCatalog);
                    setOrders([]);
                  }
                }}
                className="bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold px-3 py-2 rounded-lg flex items-center gap-1.5"
              >
                <RefreshCw className="w-3.5 h-3.5" /> Reset Data
              </button>
            </div>
          </div>

          {/* KPI Metrics */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
              <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block">Total Catalog Items</span>
              <div className="mt-2 flex items-baseline justify-between">
                <span className="text-2xl font-black text-slate-900">{products.length}</span>
                <span className="text-xs font-semibold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-md">Live</span>
              </div>
            </div>

            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
              <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block">Low Stock Alerts</span>
              <div className="mt-2 flex items-baseline justify-between">
                <span className="text-2xl font-black text-amber-600">{products.filter(p => p.stock < 10).length}</span>
                <span className="text-xs font-semibold text-amber-700 bg-amber-50 px-2 py-0.5 rounded-md">Needs restock</span>
              </div>
            </div>

            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
              <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block">Customer Orders</span>
              <div className="mt-2 flex items-baseline justify-between">
                <span className="text-2xl font-black text-blue-700">{orders.length}</span>
                <span className="text-xs font-semibold text-blue-700 bg-blue-50 px-2 py-0.5 rounded-md">Completed</span>
              </div>
            </div>

            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
              <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block">Gross Sales Realized</span>
              <div className="mt-2 flex items-baseline justify-between">
                <span className="text-2xl font-black text-emerald-600">
                  ₱{orders.reduce((s, o) => s + o.total, 0).toLocaleString(undefined, { minimumFractionDigits: 2 })}
                </span>
                <TrendingUp className="w-4 h-4 text-emerald-500" />
              </div>
            </div>
          </div>

          {/* SECTION 1: DISCOUNT & PROMO CODE CONTROLS */}
          <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-slate-100 gap-4 mb-6">
              <div>
                <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                  <Percent className="w-5 h-5 text-blue-600" /> Discount & Promotions Control Center
                </h2>
                <p className="text-xs text-slate-500">Configure storewide sales and customer coupon codes in real-time.</p>
              </div>

              {/* Storewide Flash Sale Slider */}
              <div className="flex items-center gap-3 bg-blue-50 border border-blue-200 px-4 py-2 rounded-xl">
                <div>
                  <span className="text-xs font-bold text-blue-900 block">Storewide Flash Discount</span>
                  <span className="text-[10px] text-blue-600">Applied automatically to all catalog prices</span>
                </div>
                <div className="flex items-center gap-2">
                  <input
                    type="range"
                    min="0"
                    max="30"
                    step="5"
                    value={storewideDiscount}
                    onChange={e => setStorewideDiscount(Number(e.target.value))}
                    className="accent-blue-600 cursor-pointer w-24"
                  />
                  <span className="text-sm font-black text-blue-900 w-10 text-right">{storewideDiscount}%</span>
                </div>
              </div>
            </div>

            {/* Promo Codes Table */}
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="bg-slate-50 text-slate-500 uppercase tracking-wider border-y border-slate-100">
                    <th className="py-2.5 px-3">Promo Code</th>
                    <th className="py-2.5 px-3">Type</th>
                    <th className="py-2.5 px-3">Discount Value</th>
                    <th className="py-2.5 px-3">Min. Spend</th>
                    <th className="py-2.5 px-3">Description</th>
                    <th className="py-2.5 px-3 text-center">Status</th>
                    <th className="py-2.5 px-3 text-right">Toggle</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {discounts.map((d, idx) => (
                    <tr key={d.code} className="hover:bg-slate-50/50">
                      <td className="py-3 px-3 font-mono font-bold text-blue-700">{d.code}</td>
                      <td className="py-3 px-3 capitalize">{d.type}</td>
                      <td className="py-3 px-3 font-bold text-slate-900">
                        {d.type === 'percentage' ? `${d.value}% OFF` : `₱${d.value.toLocaleString()} OFF`}
                      </td>
                      <td className="py-3 px-3">₱{d.minSpend.toLocaleString()}</td>
                      <td className="py-3 px-3 text-slate-600">{d.description}</td>
                      <td className="py-3 px-3 text-center">
                        <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                          d.active ? 'bg-emerald-50 text-emerald-700' : 'bg-slate-100 text-slate-400'
                        }`}>
                          {d.active ? 'Active' : 'Disabled'}
                        </span>
                      </td>
                      <td className="py-3 px-3 text-right">
                        <button
                          onClick={() => {
                            setDiscounts(prev => prev.map((item, i) => i === idx ? { ...item, active: !item.active } : item));
                          }}
                          className={`text-xs font-bold px-3 py-1 rounded-lg ${
                            d.active ? 'bg-rose-50 text-rose-600 hover:bg-rose-100' : 'bg-emerald-50 text-emerald-600 hover:bg-emerald-100'
                          }`}
                        >
                          {d.active ? 'Disable' : 'Enable'}
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* SECTION 2: LIVE INVENTORY & CAPITAL MARGIN MANAGER */}
          <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm">
            <h2 className="text-lg font-bold text-slate-900 mb-1 flex items-center gap-2">
              <Package className="w-5 h-5 text-blue-600" /> Live Inventory & Stock Controller
            </h2>
            <p className="text-xs text-slate-500 mb-6">Update live on-hand quantities, retail prices, and inspect unit margins.</p>

            <div className="overflow-x-auto max-h-96 overflow-y-auto">
              <table className="w-full text-left text-xs">
                <thead className="sticky top-0 bg-slate-100 text-slate-700 uppercase tracking-wider z-10">
                  <tr>
                    <th className="py-2.5 px-3">SKU</th>
                    <th className="py-2.5 px-3">Item Description</th>
                    <th className="py-2.5 px-3">Category</th>
                    <th className="py-2.5 px-3 text-right">Unit Capital (₱)</th>
                    <th className="py-2.5 px-3 text-right">Selling Price (₱)</th>
                    <th className="py-2.5 px-3 text-right">Live Stock</th>
                    <th className="py-2.5 px-3 text-center">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {products.slice(0, 30).map((prod, idx) => {
                    return (
                      <tr key={prod.id} className="hover:bg-slate-50/50">
                        <td className="py-2.5 px-3 font-mono text-slate-400">{prod.id}</td>
                        <td className="py-2.5 px-3 font-semibold text-slate-800">{prod.name}</td>
                        <td className="py-2.5 px-3 text-slate-500">{prod.category}</td>
                        <td className="py-2.5 px-3 text-right">
                          <input
                            type="number"
                            value={prod.capital}
                            onChange={e => {
                              const val = Number(e.target.value);
                              setProducts(prev => prev.map((p, i) => i === idx ? { ...p, capital: val } : p));
                            }}
                            className="w-20 px-2 py-1 text-right border border-slate-200 rounded font-semibold text-slate-700"
                          />
                        </td>
                        <td className="py-2.5 px-3 text-right">
                          <input
                            type="number"
                            value={prod.price}
                            onChange={e => {
                              const val = Number(e.target.value);
                              setProducts(prev => prev.map((p, i) => i === idx ? { ...p, price: val } : p));
                            }}
                            className="w-24 px-2 py-1 text-right border border-slate-200 rounded font-bold text-slate-900"
                          />
                        </td>
                        <td className="py-2.5 px-3 text-right font-bold">
                          <span className={prod.stock < 10 ? 'text-amber-600' : 'text-slate-900'}>
                            {prod.stock}
                          </span>
                        </td>
                        <td className="py-2.5 px-3 text-center">
                          <button
                            onClick={() => {
                              const add = prompt(`Add stock quantity for ${prod.name}:`, "50");
                              if (add && !isNaN(add)) {
                                setProducts(prev => prev.map((p, i) => i === idx ? { ...p, stock: p.stock + Number(add) } : p));
                              }
                            }}
                            className="bg-blue-50 text-blue-700 hover:bg-blue-100 px-2.5 py-1 rounded-md text-[11px] font-bold"
                          >
                            + Restock
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
            <p className="text-[11px] text-slate-400 mt-3 italic">* Displaying top 30 active items for rapid control. All 465 items are synchronized in live state.</p>
          </div>

          {/* SECTION 3: RECENT CUSTOMER ORDERS */}
          <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm">
            <h2 className="text-lg font-bold text-slate-900 mb-1 flex items-center gap-2">
              <Truck className="w-5 h-5 text-blue-600" /> Recent Customer Orders & Invoices
            </h2>
            <p className="text-xs text-slate-500 mb-6">Customer orders placed through the online storefront.</p>

            {orders.length === 0 ? (
              <div className="text-center py-12 text-slate-400 text-xs">
                No orders placed yet. Place a test order in the Online Store to see it appear here!
              </div>
            ) : (
              <div className="space-y-4">
                {orders.map(ord => (
                  <div key={ord.orderId} className="border border-slate-200 rounded-xl p-4 flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-mono font-bold text-slate-900 text-sm">{ord.orderId}</span>
                        <span className="bg-emerald-50 text-emerald-700 text-[10px] font-bold px-2 py-0.5 rounded-full">{ord.status}</span>
                      </div>
                      <p className="text-xs text-slate-600 mt-1">
                        Customer: <strong className="text-slate-900">{ord.customer.fullName}</strong> ({ord.customer.phone})
                      </p>
                      <p className="text-xs text-slate-400">Site: {ord.customer.address}</p>
                    </div>

                    <div className="flex items-center gap-6">
                      <div className="text-right">
                        <span className="text-[10px] text-slate-400 block">{ord.items.length} items</span>
                        <span className="text-base font-extrabold text-blue-700">₱{ord.total.toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>
                      </div>
                      <span className="text-xs uppercase font-mono px-2 py-1 bg-slate-100 rounded text-slate-600">{ord.customer.paymentMethod}</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </main>
      )}

      {/* SLIDE-OVER CART DRAWER */}
      {isCartOpen && (
        <div className="fixed inset-0 z-50 overflow-hidden bg-slate-900/40 backdrop-blur-xs flex justify-end">
          <div className="w-full max-w-md bg-white h-full shadow-2xl flex flex-col">
            {/* Drawer Header */}
            <div className="p-4 border-b border-slate-100 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <ShoppingCart className="w-5 h-5 text-blue-600" />
                <h3 className="font-extrabold text-slate-900 text-base">Your Cart</h3>
                <span className="bg-blue-100 text-blue-700 text-xs font-bold px-2 py-0.5 rounded-full">
                  {cart.reduce((s, i) => s + i.quantity, 0)} items
                </span>
              </div>
              <button onClick={() => setIsCartOpen(false)} className="p-1 rounded-lg hover:bg-slate-100 text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Drawer Items List */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              {cart.length === 0 ? (
                <div className="text-center py-20 text-slate-400">
                  <Package className="w-12 h-12 mx-auto mb-2 text-slate-300" />
                  <p className="text-sm font-semibold text-slate-600">Your cart is empty</p>
                  <p className="text-xs text-slate-400 mt-1">Browse our catalog to add hardware supplies.</p>
                </div>
              ) : (
                cart.map(item => (
                  <div key={item.id} className="flex gap-3 p-3 bg-slate-50 rounded-xl border border-slate-200/60">
                    <div className="w-12 h-12 rounded-lg bg-white border border-slate-200 flex items-center justify-center text-blue-600 shrink-0">
                      <Package className="w-6 h-6" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h4 className="font-bold text-xs text-slate-900 truncate">{item.name}</h4>
                      <p className="text-xs text-blue-700 font-bold mt-0.5">₱{item.price.toLocaleString(undefined, { minimumFractionDigits: 2 })}</p>
                      
                      <div className="flex items-center justify-between mt-2">
                        <div className="flex items-center border border-slate-200 bg-white rounded-lg">
                          <button 
                            onClick={() => updateCartQty(item.id, -1)}
                            className="p-1 hover:bg-slate-50 text-slate-500"
                          >
                            <Minus className="w-3 h-3" />
                          </button>
                          <span className="px-2 text-xs font-bold text-slate-800">{item.quantity}</span>
                          <button 
                            onClick={() => updateCartQty(item.id, 1)}
                            className="p-1 hover:bg-slate-50 text-slate-500"
                          >
                            <Plus className="w-3 h-3" />
                          </button>
                        </div>

                        <button 
                          onClick={() => removeFromCart(item.id)}
                          className="text-slate-400 hover:text-rose-600 p-1"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>

            {/* Drawer Footer Checkout Button */}
            {cart.length > 0 && (
              <div className="p-4 border-t border-slate-100 bg-slate-50/50 space-y-3">
                <div className="flex justify-between text-xs text-slate-500">
                  <span>Subtotal</span>
                  <span className="font-bold text-slate-800">₱{cartSubtotal.toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>
                </div>
                
                <button
                  onClick={() => {
                    setIsCartOpen(false);
                    setActiveTab('checkout');
                  }}
                  className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 rounded-xl shadow-md flex items-center justify-center gap-2 cursor-pointer transition-transform active:scale-98"
                >
                  Proceed to Checkout <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
