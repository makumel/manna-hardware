import React, { useState, useEffect, useMemo } from 'react';
import initialCatalog from './catalog.json';
import { 
  ShoppingCart, Search, Tag, SlidersHorizontal, Package, CheckCircle2, 
  Trash2, Plus, Minus, ArrowRight, ShieldCheck, TrendingUp, DollarSign,
  AlertCircle, RefreshCw, X, ChevronRight, Store, LayoutDashboard, Truck,
  Check, Percent, Layers, Heart, Home, Grid, Zap, User, Star, Flame, Sparkles
} from 'lucide-react';

export default function App() {
  // Navigation: 'home' | 'categories' | 'deals' | 'cart' | 'dashboard' | 'checkout' | 'order-success'
  const [activeTab, setActiveTab] = useState('home');
  
  // Persistent Products with Live Inventory
  const [products, setProducts] = useState(() => {
    const saved = localStorage.getItem('manna_products');
    return saved ? JSON.parse(saved) : initialCatalog;
  });

  // Cart State
  const [cart, setCart] = useState(() => {
    const saved = localStorage.getItem('manna_cart');
    return saved ? JSON.parse(saved) : [];
  });
  const [isCartOpen, setIsCartOpen] = useState(false);

  // Discount / Promotion Engine
  const [discounts, setDiscounts] = useState(() => {
    const saved = localStorage.getItem('manna_discounts');
    return saved ? JSON.parse(saved) : [
      { code: 'MANNA10', type: 'percentage', value: 10, minSpend: 1000, active: true, description: '10% OFF for orders over ₱1,000' },
      { code: 'HARDWARE500', type: 'flat', value: 500, minSpend: 5000, active: true, description: '₱500 Flat Voucher for orders over ₱5,000' },
      { code: 'BUILDER5', type: 'percentage', value: 5, minSpend: 0, active: true, description: '5% Contractor Special' },
      { code: 'FREESHIP', type: 'flat', value: 150, minSpend: 1500, active: true, description: 'Free Shipping Voucher' }
    ];
  });
  const [storewideDiscount, setStorewideDiscount] = useState(() => {
    const saved = localStorage.getItem('manna_storewide_discount');
    return saved ? Number(saved) : 10; // Default 10% Flash sale
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
    paymentMethod: 'cod',
    honeypot: ''
  });
  const [placedOrder, setPlacedOrder] = useState(null);

  // Orders History
  const [orders, setOrders] = useState(() => {
    const saved = localStorage.getItem('manna_orders');
    return saved ? JSON.parse(saved) : [];
  });

  // Save changes to localStorage
  useEffect(() => {
    localStorage.setItem('manna_products', JSON.stringify(products));
  }, [products]);

  useEffect(() => {
    localStorage.setItem('manna_cart', JSON.stringify(cart));
  }, [cart]);

  useEffect(() => {
    localStorage.setItem('manna_discounts', JSON.stringify(discounts));
  }, [discounts]);

  useEffect(() => {
    localStorage.setItem('manna_storewide_discount', storewideDiscount.toString());
  }, [storewideDiscount]);

  useEffect(() => {
    localStorage.setItem('manna_orders', JSON.stringify(orders));
  }, [orders]);

  // Categories list
  const categories = useMemo(() => {
    return ['All', ...new Set(products.map(p => p.category))];
  }, [products]);

  // Category Icon & Color map for Shopee Mall Category grid
  const categoryIcons = {
    'Paints & Coatings': '🎨',
    'Plumbing & Fixtures': '🚰',
    'Fasteners & Hardware': '🔩',
    'Structural & Building Materials': '🏗️',
    'Electrical & Lighting': '💡',
    'Tools & Accessories': '🔨',
    'General Hardware': '🛠️'
  };

  // Filtered products
  const filteredProducts = useMemo(() => {
    return products.filter(p => {
      const matchCat = selectedCategory === 'All' || p.category === selectedCategory;
      const matchSearch = p.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          p.id.toLowerCase().includes(searchQuery.toLowerCase());
      const matchStock = stockOnly ? p.stock > 0 : true;
      const matchDeals = activeTab === 'deals' ? (p.price > 500 || p.featured) : true;
      return matchCat && matchSearch && matchStock && matchDeals;
    }).sort((a, b) => {
      if (priceSort === 'low-high') return a.price - b.price;
      if (priceSort === 'high-low') return b.price - a.price;
      if (priceSort === 'name') return a.name.localeCompare(b.name);
      return (b.featured ? 1 : 0) - (a.featured ? 1 : 0);
    });
  }, [products, selectedCategory, searchQuery, priceSort, stockOnly, activeTab]);

  // Pricing calculations
  const cartSubtotal = useMemo(() => {
    return cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  }, [cart]);

  const discountAmount = useMemo(() => {
    let disc = 0;
    if (appliedPromo) {
      if (appliedPromo.type === 'percentage') {
        disc += (cartSubtotal * (appliedPromo.value / 100));
      } else if (appliedPromo.type === 'flat') {
        disc += appliedPromo.value;
      }
    }
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

  const handleApplyPromo = () => {
    const cleanCode = promoInput.trim().toUpperCase();
    if (!cleanCode) return;
    const promo = discounts.find(d => d.code === cleanCode && d.active);
    if (!promo) {
      setPromoMessage({ text: 'Invalid voucher code', type: 'error' });
      return;
    }
    if (cartSubtotal < promo.minSpend) {
      setPromoMessage({ text: `Min. spend ₱${promo.minSpend.toLocaleString()} required`, type: 'error' });
      return;
    }
    setAppliedPromo(promo);
    setPromoMessage({ text: `Voucher applied: ${promo.description}`, type: 'success' });
    setPromoInput('');
  };

  const handleCheckoutSubmit = (e) => {
    e.preventDefault();
    if (customer.honeypot) return;
    if (cart.length === 0) return;

    for (const item of cart) {
      const liveP = products.find(p => p.id === item.id);
      if (!liveP || liveP.stock < item.quantity) {
        alert(`Insufficient stock for ${item.name}. Available: ${liveP ? liveP.stock : 0}`);
        return;
      }
    }

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
      orderId: `MNA-${Date.now().toString().slice(-6)}`,
      date: new Date().toLocaleString(),
      customer: { ...customer },
      items: [...cart],
      subtotal: cartSubtotal,
      discount: discountAmount,
      promoCode: appliedPromo ? appliedPromo.code : null,
      shipping: shippingFee,
      total: orderTotal,
      status: 'To Ship'
    };

    setOrders(prev => [newOrder, ...prev]);
    setPlacedOrder(newOrder);
    setCart([]);
    setAppliedPromo(null);
    setActiveTab('order-success');
    setIsCartOpen(false);
  };

  return (
    <div className="min-h-screen bg-[#F5F5F5] flex flex-col font-sans pb-20 md:pb-6 select-none">
      
      {/* 1. SHOPEE ORANGE TOP HEADER BAR */}
      <header className="sticky top-0 z-40 bg-[#EE4D2D] text-white shadow-md">
        {/* Top mini strip */}
        <div className="max-w-6xl mx-auto px-4 py-1 flex items-center justify-between text-[11px] text-white/90 border-b border-white/10 hidden sm:flex">
          <div className="flex items-center gap-4">
            <span className="font-semibold flex items-center gap-1">
              <ShieldCheck className="w-3.5 h-3.5" /> 100% Authentic Hardware Guarantee
            </span>
            <span>|</span>
            <span className="flex items-center gap-1">
              <Truck className="w-3.5 h-3.5" /> Free Shipping Min. Spend ₱3,000
            </span>
          </div>
          <div className="flex items-center gap-3 font-semibold">
            <button onClick={() => setActiveTab('dashboard')} className="hover:text-amber-200">
              Seller Centre / Dashboard
            </button>
            <span>|</span>
            <span>Tacloban City Express Delivery</span>
          </div>
        </div>

        {/* Search & Brand Bar */}
        <div className="max-w-6xl mx-auto px-4 py-2.5 flex items-center gap-3">
          {/* Logo */}
          <button 
            onClick={() => { setActiveTab('home'); setSelectedCategory('All'); }}
            className="flex items-center gap-2 text-left shrink-0 cursor-pointer"
          >
            <div className="w-9 h-9 rounded-xl bg-white text-[#EE4D2D] flex items-center justify-center font-black text-xl shadow-xs">
              M
            </div>
            <div className="hidden xs:block">
              <span className="text-xl font-black tracking-tight block leading-tight text-white">MANNA</span>
              <span className="text-[9px] uppercase tracking-wider text-amber-200 font-bold block">Hardware Supply</span>
            </div>
          </button>

          {/* Search Box (Shopee Style) */}
          <div className="flex-1 relative">
            <div className="flex bg-white rounded-sm p-1 shadow-xs">
              <input
                type="text"
                placeholder="Search in Manna Hardware (Paints, Pipes, Screws, Tools, Shark)..."
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                className="w-full px-3 text-xs sm:text-sm text-slate-800 placeholder-slate-400 focus:outline-none"
              />
              <button 
                onClick={() => setActiveTab('home')}
                className="bg-[#EE4D2D] hover:bg-[#d73f20] text-white px-4 py-1.5 rounded-xs flex items-center justify-center transition-colors cursor-pointer"
              >
                <Search className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Header Cart Button */}
          <button
            onClick={() => setIsCartOpen(true)}
            className="relative p-2 text-white hover:text-amber-200 transition-colors cursor-pointer"
          >
            <ShoppingCart className="w-6 h-6" />
            {cart.length > 0 && (
              <span className="absolute -top-1 -right-1 bg-white text-[#EE4D2D] text-[10px] font-black w-5 h-5 rounded-full flex items-center justify-center shadow-md">
                {cart.reduce((s, i) => s + i.quantity, 0)}
              </span>
            )}
          </button>
        </div>
      </header>

      {/* 2. SHOPEE TICKER & MALL PROMO BANNERS */}
      {activeTab === 'home' && (
        <div className="bg-gradient-to-r from-[#EE4D2D] via-[#f25c3c] to-[#ff7337] text-white py-3 px-4 shadow-xs">
          <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center justify-between gap-3 text-xs">
            <div className="flex items-center gap-2 font-bold">
              <Flame className="w-4 h-4 text-amber-300 animate-bounce" />
              <span>SUPER HARDWARE SALE:</span>
              <span className="bg-white/20 px-2 py-0.5 rounded text-[11px] font-black text-amber-100">
                {storewideDiscount}% OFF STOREWIDE
              </span>
              <span className="hidden sm:inline font-normal text-white/90">Direct wholesale supplier pricing across 465 products!</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="bg-amber-400 text-slate-900 font-extrabold text-[10px] px-2 py-0.5 rounded uppercase">
                Free Hauling
              </span>
              <span className="text-white/90 text-[11px]">Orders ₱3,000+ qualify automatically</span>
            </div>
          </div>
        </div>
      )}

      {/* 3. SHOPEE CATEGORY GRID TILES */}
      {activeTab === 'home' && (
        <section className="max-w-6xl mx-auto px-4 pt-4 w-full">
          <div className="bg-white rounded-lg p-3 shadow-xs border border-slate-200/80 mb-4">
            <div className="flex items-center justify-between mb-3 px-1">
              <h2 className="text-xs font-black uppercase tracking-wider text-slate-600 flex items-center gap-1.5">
                <Grid className="w-3.5 h-3.5 text-[#EE4D2D]" /> Categories
              </h2>
              <button 
                onClick={() => setActiveTab('categories')}
                className="text-[11px] font-bold text-[#EE4D2D] hover:underline flex items-center"
              >
                View All <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>
            
            <div className="grid grid-cols-4 sm:grid-cols-7 gap-2 text-center">
              {categories.map(cat => (
                <button
                  key={cat}
                  onClick={() => { setSelectedCategory(cat); setActiveTab('home'); }}
                  className={`p-2 rounded-lg transition-all flex flex-col items-center justify-center cursor-pointer ${
                    selectedCategory === cat 
                      ? 'bg-orange-50 border border-[#EE4D2D] text-[#EE4D2D]' 
                      : 'hover:bg-slate-50 text-slate-700'
                  }`}
                >
                  <span className="text-2xl mb-1">{categoryIcons[cat] || '📦'}</span>
                  <span className="text-[11px] font-semibold line-clamp-1 leading-tight">{cat}</span>
                </button>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* 4. FLASH DEALS BANNER */}
      {activeTab === 'home' && (
        <section className="max-w-6xl mx-auto px-4 w-full mb-3">
          <div className="bg-white rounded-lg p-3 border-b-2 border-[#EE4D2D] shadow-xs flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="text-[#EE4D2D] font-black text-sm uppercase tracking-wider flex items-center gap-1">
                <Zap className="w-4 h-4 fill-[#EE4D2D]" /> FLASH DEALS
              </span>
              <span className="bg-slate-900 text-white text-[10px] font-bold px-1.5 py-0.5 rounded">02</span>
              <span>:</span>
              <span className="bg-slate-900 text-white text-[10px] font-bold px-1.5 py-0.5 rounded">45</span>
              <span>:</span>
              <span className="bg-slate-900 text-white text-[10px] font-bold px-1.5 py-0.5 rounded">18</span>
            </div>
            <span className="text-xs text-slate-400 font-medium hidden sm:inline">
              Up to {storewideDiscount}% off retail prices
            </span>
          </div>
        </section>
      )}

      {/* 5. VIEW: HOME / PRODUCT FEED (SHOPEE STYLE CARDS) */}
      {(activeTab === 'home' || activeTab === 'deals') && (
        <main className="max-w-6xl mx-auto px-4 flex-1 w-full">
          {/* Active filter chip & sort */}
          <div className="flex items-center justify-between text-xs text-slate-500 mb-3 bg-white p-2.5 rounded-md border border-slate-200">
            <div className="flex items-center gap-2">
              <span className="font-semibold text-slate-800">
                {selectedCategory === 'All' ? 'DAILY DISCOVER' : selectedCategory}
              </span>
              <span className="text-[11px] text-slate-400">({filteredProducts.length} items)</span>
            </div>
            <div className="flex items-center gap-3">
              <select
                value={priceSort}
                onChange={e => setPriceSort(e.target.value)}
                className="bg-slate-50 border border-slate-200 rounded px-2 py-1 text-xs text-slate-700 font-semibold"
              >
                <option value="featured">Top Sales</option>
                <option value="low-high">Price: Low to High</option>
                <option value="high-low">Price: High to Low</option>
                <option value="name">Product Name</option>
              </select>
            </div>
          </div>

          {/* Product Feed Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-2.5 sm:gap-3">
            {filteredProducts.map(product => {
              const effectivePrice = storewideDiscount > 0
                ? product.price * (1 - storewideDiscount / 100)
                : product.price;

              return (
                <div 
                  key={product.id}
                  className="bg-white rounded-md border border-slate-200 overflow-hidden flex flex-col hover:shadow-md hover:border-[#EE4D2D] transition-all group relative cursor-pointer"
                >
                  {/* Shopee Style Discount Ribbon (Top Right) */}
                  {storewideDiscount > 0 && (
                    <div className="absolute top-0 right-0 z-10 bg-amber-300 text-[#EE4D2D] font-black text-[9px] px-1.5 py-0.5 text-center leading-tight shadow-xs">
                      <span className="block font-bold">{storewideDiscount}%</span>
                      <span className="text-[8px] text-slate-800 uppercase block">OFF</span>
                    </div>
                  )}

                  {/* Mall Tag on Top Left */}
                  <div className="absolute top-1.5 left-1.5 z-10">
                    <span className="bg-[#EE4D2D] text-white text-[9px] font-black px-1 py-0.5 rounded-xs tracking-tighter uppercase">
                      Mall
                    </span>
                  </div>

                  {/* Stock Image Thumbnail */}
                  <div className="aspect-square bg-slate-100 relative overflow-hidden flex items-center justify-center">
                    {product.image ? (
                      <img 
                        src={product.image} 
                        alt={product.name}
                        loading="lazy"
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                        onError={(e) => {
                          e.target.onerror = null;
                          e.target.src = "https://images.pexels.com/photos/175039/pexels-photo-175039.jpeg?auto=compress&cs=tinysrgb&h=650&w=940";
                        }}
                      />
                    ) : (
                      <Package className="w-10 h-10 text-slate-400" />
                    )}
                  </div>

                  {/* Card Content */}
                  <div className="p-2.5 flex-1 flex flex-col justify-between">
                    <div>
                      <h3 className="font-medium text-xs text-slate-800 line-clamp-2 leading-snug group-hover:text-[#EE4D2D] transition-colors">
                        {product.name}
                      </h3>
                      <p className="text-[10px] text-slate-400 mt-0.5">Per {product.unit} • SKU: {product.id}</p>
                    </div>

                    <div className="mt-2.5 pt-2 border-t border-slate-100">
                      {/* Price Section */}
                      <div className="flex items-baseline gap-1.5">
                        <span className="text-xs font-bold text-[#EE4D2D]">₱</span>
                        <span className="text-base font-black text-[#EE4D2D] leading-none">
                          {Math.floor(effectivePrice).toLocaleString()}
                        </span>
                        <span className="text-[10px] font-bold text-[#EE4D2D]">
                          .{(effectivePrice % 1).toFixed(2).slice(2)}
                        </span>
                      </div>

                      {storewideDiscount > 0 && (
                        <span className="text-[10px] text-slate-400 line-through block mt-0.5">
                          ₱{product.price.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                        </span>
                      )}

                      {/* Rating & Sold count */}
                      <div className="flex items-center justify-between mt-2 text-[10px] text-slate-400">
                        <div className="flex items-center gap-0.5 text-amber-500">
                          <Star className="w-3 h-3 fill-amber-400" />
                          <span className="font-bold text-slate-700">{product.rating || 4.8}</span>
                        </div>
                        <span>{product.reviews || 25} sold</span>
                      </div>

                      {/* Add to Cart Button */}
                      <button
                        onClick={(e) => { e.stopPropagation(); addToCart(product); }}
                        disabled={product.stock <= 0}
                        className={`w-full mt-2 py-1.5 rounded-xs text-xs font-bold flex items-center justify-center gap-1 transition-colors cursor-pointer ${
                          product.stock <= 0 
                            ? 'bg-slate-100 text-slate-400 cursor-not-allowed'
                            : 'bg-[#EE4D2D] hover:bg-[#d73f20] text-white shadow-xs'
                        }`}
                      >
                        <Plus className="w-3 h-3" /> Add to Cart
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </main>
      )}

      {/* 6. VIEW: CATEGORIES HUB */}
      {activeTab === 'categories' && (
        <main className="max-w-4xl mx-auto px-4 py-4 flex-1 w-full">
          <h2 className="text-sm font-black text-slate-800 uppercase tracking-wider mb-3">All Hardware Departments</h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            {categories.filter(c => c !== 'All').map(cat => {
              const catItems = products.filter(p => p.category === cat);
              return (
                <button
                  key={cat}
                  onClick={() => { setSelectedCategory(cat); setActiveTab('home'); }}
                  className="bg-white p-4 rounded-lg border border-slate-200 text-left hover:border-[#EE4D2D] hover:shadow-xs transition-all flex items-center justify-between cursor-pointer"
                >
                  <div className="flex items-center gap-3">
                    <span className="text-3xl">{categoryIcons[cat] || '📦'}</span>
                    <div>
                      <h4 className="font-bold text-xs text-slate-800">{cat}</h4>
                      <p className="text-[11px] text-slate-400 mt-0.5">{catItems.length} products</p>
                    </div>
                  </div>
                  <ChevronRight className="w-4 h-4 text-slate-400" />
                </button>
              );
            })}
          </div>
        </main>
      )}

      {/* 7. VIEW: CHECKOUT FORM */}
      {activeTab === 'checkout' && (
        <main className="max-w-4xl mx-auto px-4 py-6 flex-1 w-full">
          <button
            onClick={() => setActiveTab('home')}
            className="flex items-center gap-1 text-xs font-bold text-slate-600 hover:text-[#EE4D2D] mb-4 cursor-pointer"
          >
            ← Back to Store
          </button>

          <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
            <div className="md:col-span-7 bg-white rounded-lg border border-slate-200 p-5 shadow-xs">
              <h2 className="text-sm font-black uppercase text-slate-900 pb-3 border-b border-slate-100 flex items-center gap-2">
                <Truck className="w-4 h-4 text-[#EE4D2D]" /> Delivery Address & Receiver Info
              </h2>

              <form onSubmit={handleCheckoutSubmit} className="mt-4 space-y-3.5">
                {/* Honeypot trap */}
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
                  <label className="block text-xs font-bold text-slate-700 mb-1">Receiver Name / Contractor *</label>
                  <input
                    type="text"
                    required
                    placeholder="Full Name (e.g., Juan Dela Cruz)"
                    value={customer.fullName}
                    onChange={e => setCustomer({ ...customer, fullName: e.target.value })}
                    className="w-full px-3 py-2 text-xs border border-slate-200 rounded focus:border-[#EE4D2D] focus:outline-none"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">Phone Number *</label>
                    <input
                      type="tel"
                      required
                      placeholder="0917 123 4567"
                      value={customer.phone}
                      onChange={e => setCustomer({ ...customer, phone: e.target.value })}
                      className="w-full px-3 py-2 text-xs border border-slate-200 rounded focus:border-[#EE4D2D] focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">Email Address</label>
                    <input
                      type="email"
                      placeholder="juan@example.com"
                      value={customer.email}
                      onChange={e => setCustomer({ ...customer, email: e.target.value })}
                      className="w-full px-3 py-2 text-xs border border-slate-200 rounded focus:border-[#EE4D2D] focus:outline-none"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Delivery / Project Site Address *</label>
                  <textarea
                    required
                    rows={2}
                    placeholder="Street, Barangay, City (Tacloban City & nearby Samar/Leyte)"
                    value={customer.address}
                    onChange={e => setCustomer({ ...customer, address: e.target.value })}
                    className="w-full px-3 py-2 text-xs border border-slate-200 rounded focus:border-[#EE4D2D] focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Payment Method</label>
                  <div className="grid grid-cols-3 gap-2">
                    {[
                      { id: 'cod', label: 'Cash on Delivery', desc: 'Pay on site' },
                      { id: 'gcash', label: 'GCash / Maya', desc: 'QR transfer' },
                      { id: 'bank', label: 'Bank Transfer', desc: 'BDO / BPI' }
                    ].map(pm => (
                      <label
                        key={pm.id}
                        onClick={() => setCustomer({ ...customer, paymentMethod: pm.id })}
                        className={`p-2.5 rounded border text-left cursor-pointer transition-all ${
                          customer.paymentMethod === pm.id 
                            ? 'border-[#EE4D2D] bg-orange-50/60 ring-1 ring-[#EE4D2D]' 
                            : 'border-slate-200 hover:bg-slate-50'
                        }`}
                      >
                        <span className="text-xs font-bold block text-slate-900">{pm.label}</span>
                        <span className="text-[10px] text-slate-500 block">{pm.desc}</span>
                      </label>
                    ))}
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={cart.length === 0}
                  className="w-full mt-4 bg-[#EE4D2D] hover:bg-[#d73f20] text-white font-black py-3 rounded text-sm shadow-md cursor-pointer transition-transform active:scale-98"
                >
                  Place Order • ₱{orderTotal.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                </button>
              </form>
            </div>

            {/* Summary */}
            <div className="md:col-span-5 bg-white rounded-lg border border-slate-200 p-5 shadow-xs h-fit">
              <h3 className="font-bold text-xs uppercase text-slate-800 pb-2 border-b border-slate-100 flex items-center justify-between">
                <span>Order Summary</span>
                <span>{cart.length} items</span>
              </h3>

              <div className="max-h-56 overflow-y-auto space-y-2 py-3">
                {cart.map(item => (
                  <div key={item.id} className="flex items-center justify-between text-xs">
                    <span className="text-slate-700 line-clamp-1 flex-1 pr-2">{item.name} × {item.quantity}</span>
                    <span className="font-bold text-slate-900">₱{(item.price * item.quantity).toLocaleString()}</span>
                  </div>
                ))}
              </div>

              {/* Promo input */}
              <div className="pt-3 border-t border-slate-100">
                <div className="flex gap-1.5">
                  <input
                    type="text"
                    placeholder="Shopee / Store Voucher"
                    value={promoInput}
                    onChange={e => setPromoInput(e.target.value)}
                    className="flex-1 uppercase font-mono text-xs px-2.5 py-1.5 border border-slate-200 rounded"
                  />
                  <button onClick={handleApplyPromo} className="bg-slate-900 text-white text-xs px-3 py-1.5 rounded font-bold">
                    Apply
                  </button>
                </div>
                {promoMessage.text && (
                  <p className={`text-[10px] mt-1 ${promoMessage.type === 'error' ? 'text-rose-600' : 'text-emerald-600 font-bold'}`}>
                    {promoMessage.text}
                  </p>
                )}
              </div>

              <div className="mt-4 pt-3 border-t border-slate-100 space-y-1.5 text-xs">
                <div className="flex justify-between text-slate-500">
                  <span>Merchandise Subtotal</span>
                  <span>₱{cartSubtotal.toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>
                </div>
                {discountAmount > 0 && (
                  <div className="flex justify-between text-[#EE4D2D] font-bold">
                    <span>Discount Voucher</span>
                    <span>-₱{discountAmount.toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>
                  </div>
                )}
                <div className="flex justify-between text-slate-500">
                  <span>Shipping Fee</span>
                  <span>{shippingFee === 0 ? <strong className="text-emerald-600">FREE</strong> : `₱${shippingFee.toFixed(2)}`}</span>
                </div>
                <div className="flex justify-between text-sm font-black text-slate-900 pt-2 border-t border-slate-200">
                  <span>Total Payment</span>
                  <span className="text-[#EE4D2D]">₱{orderTotal.toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>
                </div>
              </div>
            </div>
          </div>
        </main>
      )}

      {/* 8. VIEW: ORDER SUCCESS */}
      {activeTab === 'order-success' && placedOrder && (
        <main className="max-w-lg mx-auto px-4 py-12 flex-1 text-center">
          <div className="w-16 h-16 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto mb-3">
            <Check className="w-8 h-8" />
          </div>
          <h2 className="text-xl font-black text-slate-900 mb-1">Order Placed Successfully!</h2>
          <p className="text-xs text-slate-500 mb-6">Order ID: <strong className="text-slate-900 font-mono">{placedOrder.orderId}</strong></p>

          <div className="bg-white rounded-lg border border-slate-200 p-4 text-left text-xs space-y-2 mb-6">
            <div className="flex justify-between py-1 border-b border-slate-100">
              <span className="text-slate-400">Receiver</span>
              <span className="font-bold text-slate-800">{placedOrder.customer.fullName} ({placedOrder.customer.phone})</span>
            </div>
            <div className="flex justify-between py-1 border-b border-slate-100">
              <span className="text-slate-400">Destination</span>
              <span className="font-semibold text-slate-800">{placedOrder.customer.address}</span>
            </div>
            <div className="flex justify-between py-1 border-b border-slate-100">
              <span className="text-slate-400">Payment</span>
              <span className="font-bold uppercase text-slate-800">{placedOrder.customer.paymentMethod}</span>
            </div>
            <div className="flex justify-between pt-2 text-sm font-black text-[#EE4D2D]">
              <span>Total Payment</span>
              <span>₱{placedOrder.total.toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>
            </div>
          </div>

          <button
            onClick={() => setActiveTab('home')}
            className="bg-[#EE4D2D] hover:bg-[#d73f20] text-white text-xs font-bold px-6 py-2.5 rounded shadow-sm cursor-pointer"
          >
            Continue Shopping
          </button>
        </main>
      )}

      {/* 9. VIEW: MERCHANT DASHBOARD & DISCOUNT CONTROLS */}
      {activeTab === 'dashboard' && (
        <main className="max-w-6xl mx-auto px-4 py-6 flex-1 w-full space-y-6">
          <div className="flex items-center justify-between pb-4 border-b border-slate-200">
            <div>
              <h1 className="text-xl font-black text-slate-900 flex items-center gap-2">
                <Store className="w-5 h-5 text-[#EE4D2D]" /> Manna Seller Centre & Discount Controls
              </h1>
              <p className="text-xs text-slate-500">Manage live vouchers, storewide discounts, unit margins, and order fulfillment.</p>
            </div>
            <button
              onClick={() => {
                if (confirm("Reset store data to default factory catalog?")) {
                  localStorage.removeItem('manna_products');
                  localStorage.removeItem('manna_orders');
                  setProducts(initialCatalog);
                  setOrders([]);
                }
              }}
              className="bg-slate-200 text-slate-700 text-xs px-3 py-1.5 rounded font-bold flex items-center gap-1"
            >
              <RefreshCw className="w-3 h-3" /> Reset Store
            </button>
          </div>

          {/* Metrics */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div className="bg-white p-4 rounded-lg border border-slate-200">
              <span className="text-[10px] uppercase font-bold text-slate-400">Total Products</span>
              <p className="text-2xl font-black text-slate-900 mt-1">{products.length}</p>
            </div>
            <div className="bg-white p-4 rounded-lg border border-slate-200">
              <span className="text-[10px] uppercase font-bold text-slate-400">Orders Received</span>
              <p className="text-2xl font-black text-[#EE4D2D] mt-1">{orders.length}</p>
            </div>
            <div className="bg-white p-4 rounded-lg border border-slate-200">
              <span className="text-[10px] uppercase font-bold text-slate-400">Gross Sales</span>
              <p className="text-2xl font-black text-emerald-600 mt-1">
                ₱{orders.reduce((s, o) => s + o.total, 0).toLocaleString(undefined, { minimumFractionDigits: 2 })}
              </p>
            </div>
            <div className="bg-white p-4 rounded-lg border border-slate-200">
              <span className="text-[10px] uppercase font-bold text-slate-400">Low Stock (&lt;10)</span>
              <p className="text-2xl font-black text-amber-500 mt-1">{products.filter(p => p.stock < 10).length}</p>
            </div>
          </div>

          {/* Discount Controls */}
          <div className="bg-white p-5 rounded-lg border border-slate-200">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-slate-100 gap-3">
              <div>
                <h3 className="text-sm font-bold text-slate-900 flex items-center gap-1.5">
                  <Percent className="w-4 h-4 text-[#EE4D2D]" /> Storewide Flash Sale Controller
                </h3>
                <p className="text-xs text-slate-500">Live markdown applied across all 465 products simultaneously.</p>
              </div>

              <div className="flex items-center gap-3 bg-orange-50 border border-orange-200 px-3 py-1.5 rounded">
                <span className="text-xs font-bold text-slate-800">Flash Sale:</span>
                <input
                  type="range"
                  min="0"
                  max="35"
                  step="5"
                  value={storewideDiscount}
                  onChange={e => setStorewideDiscount(Number(e.target.value))}
                  className="accent-[#EE4D2D] cursor-pointer"
                />
                <span className="text-sm font-black text-[#EE4D2D] w-10 text-right">{storewideDiscount}%</span>
              </div>
            </div>

            {/* Vouchers list */}
            <div className="mt-4 overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="bg-slate-50 text-slate-500 uppercase border-y border-slate-100">
                    <th className="py-2 px-3">Voucher Code</th>
                    <th className="py-2 px-3">Type</th>
                    <th className="py-2 px-3">Value</th>
                    <th className="py-2 px-3">Min Spend</th>
                    <th className="py-2 px-3">Status</th>
                    <th className="py-2 px-3 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {discounts.map((d, i) => (
                    <tr key={d.code}>
                      <td className="py-2.5 px-3 font-mono font-bold text-[#EE4D2D]">{d.code}</td>
                      <td className="py-2.5 px-3 capitalize">{d.type}</td>
                      <td className="py-2.5 px-3 font-bold">{d.type === 'percentage' ? `${d.value}% OFF` : `₱${d.value} OFF`}</td>
                      <td className="py-2.5 px-3">₱{d.minSpend.toLocaleString()}</td>
                      <td className="py-2.5 px-3">
                        <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${d.active ? 'bg-emerald-50 text-emerald-700' : 'bg-slate-100 text-slate-400'}`}>
                          {d.active ? 'Active' : 'Disabled'}
                        </span>
                      </td>
                      <td className="py-2.5 px-3 text-right">
                        <button
                          onClick={() => setDiscounts(prev => prev.map((item, idx) => idx === i ? { ...item, active: !item.active } : item))}
                          className="text-[11px] font-bold text-slate-600 hover:text-[#EE4D2D]"
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
        </main>
      )}

      {/* 10. SHOPEE STICKY BOTTOM TABS BAR (MOBILE & DESKTOP) */}
      <nav className="fixed bottom-0 left-0 right-0 z-40 bg-white border-t border-slate-200 py-1 px-2 shadow-lg">
        <div className="max-w-md mx-auto grid grid-cols-5 text-center">
          {/* Home */}
          <button
            onClick={() => setActiveTab('home')}
            className={`flex flex-col items-center justify-center py-1 transition-colors cursor-pointer ${
              activeTab === 'home' ? 'text-[#EE4D2D]' : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            <Home className="w-5 h-5" />
            <span className="text-[10px] font-bold mt-0.5">Home</span>
          </button>

          {/* Categories */}
          <button
            onClick={() => setActiveTab('categories')}
            className={`flex flex-col items-center justify-center py-1 transition-colors cursor-pointer ${
              activeTab === 'categories' ? 'text-[#EE4D2D]' : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            <Grid className="w-5 h-5" />
            <span className="text-[10px] font-bold mt-0.5">Categories</span>
          </button>

          {/* Flash Deals */}
          <button
            onClick={() => setActiveTab('deals')}
            className={`flex flex-col items-center justify-center py-1 transition-colors cursor-pointer relative ${
              activeTab === 'deals' ? 'text-[#EE4D2D]' : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            <Zap className="w-5 h-5 fill-current" />
            <span className="text-[10px] font-bold mt-0.5">Deals</span>
            <span className="absolute 1 top-0.5 right-4 w-2 h-2 rounded-full bg-[#EE4D2D] animate-ping" />
          </button>

          {/* Cart */}
          <button
            onClick={() => setIsCartOpen(true)}
            className="flex flex-col items-center justify-center py-1 text-slate-500 hover:text-slate-800 transition-colors cursor-pointer relative"
          >
            <ShoppingCart className="w-5 h-5" />
            <span className="text-[10px] font-bold mt-0.5">Cart</span>
            {cart.length > 0 && (
              <span className="absolute top-0 right-4 bg-[#EE4D2D] text-white text-[9px] font-black w-4 h-4 rounded-full flex items-center justify-center">
                {cart.reduce((s, i) => s + i.quantity, 0)}
              </span>
            )}
          </button>

          {/* Dashboard / Me */}
          <button
            onClick={() => setActiveTab('dashboard')}
            className={`flex flex-col items-center justify-center py-1 transition-colors cursor-pointer ${
              activeTab === 'dashboard' ? 'text-[#EE4D2D]' : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            <User className="w-5 h-5" />
            <span className="text-[10px] font-bold mt-0.5">Me / Admin</span>
          </button>
        </div>
      </nav>

      {/* 11. SLIDE-OVER CART DRAWER */}
      {isCartOpen && (
        <div className="fixed inset-0 z-50 overflow-hidden bg-slate-900/50 backdrop-blur-xs flex justify-end">
          <div className="w-full max-w-md bg-white h-full shadow-2xl flex flex-col">
            <div className="p-4 bg-[#EE4D2D] text-white flex items-center justify-between">
              <div className="flex items-center gap-2">
                <ShoppingCart className="w-5 h-5" />
                <h3 className="font-black text-sm">Shopping Cart ({cart.reduce((s, i) => s + i.quantity, 0)})</h3>
              </div>
              <button onClick={() => setIsCartOpen(false)} className="p-1 hover:bg-white/20 rounded cursor-pointer">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-3 space-y-3">
              {cart.length === 0 ? (
                <div className="text-center py-20 text-slate-400">
                  <Package className="w-12 h-12 mx-auto mb-2 text-slate-300" />
                  <p className="text-xs font-bold text-slate-600">Your cart is empty</p>
                  <p className="text-[11px] text-slate-400 mt-1">Browse hardware items to add to cart.</p>
                </div>
              ) : (
                cart.map(item => (
                  <div key={item.id} className="flex gap-2.5 p-2.5 bg-slate-50 rounded border border-slate-200">
                    <img 
                      src={item.image} 
                      alt={item.name} 
                      className="w-16 h-16 object-cover rounded bg-white shrink-0" 
                      onError={(e) => {
                        e.target.onerror = null;
                        e.target.src = "https://images.pexels.com/photos/175039/pexels-photo-175039.jpeg?auto=compress&cs=tinysrgb&h=650&w=940";
                      }}
                    />
                    <div className="flex-1 min-w-0">
                      <h4 className="font-bold text-xs text-slate-900 line-clamp-1">{item.name}</h4>
                      <p className="text-xs text-[#EE4D2D] font-black mt-0.5">₱{item.price.toLocaleString()}</p>
                      <div className="flex items-center justify-between mt-2">
                        <div className="flex items-center border border-slate-200 bg-white rounded">
                          <button onClick={() => updateCartQty(item.id, -1)} className="px-2 py-0.5 text-slate-600">-</button>
                          <span className="px-2 text-xs font-bold">{item.quantity}</span>
                          <button onClick={() => updateCartQty(item.id, 1)} className="px-2 py-0.5 text-slate-600">+</button>
                        </div>
                        <button onClick={() => removeFromCart(item.id)} className="text-slate-400 hover:text-rose-600">
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>

            {cart.length > 0 && (
              <div className="p-4 border-t border-slate-100 bg-slate-50 space-y-2">
                <div className="flex justify-between text-xs text-slate-600">
                  <span>Subtotal</span>
                  <span className="font-black text-slate-900">₱{cartSubtotal.toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>
                </div>
                <button
                  onClick={() => {
                    setIsCartOpen(false);
                    setActiveTab('checkout');
                  }}
                  className="w-full bg-[#EE4D2D] hover:bg-[#d73f20] text-white font-black py-2.5 rounded shadow-sm flex items-center justify-center gap-1.5 text-xs cursor-pointer"
                >
                  Check Out Now ({cart.reduce((s, i) => s + i.quantity, 0)}) <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            )}
          </div>
        </div>
      )}

    </div>
  );
}
