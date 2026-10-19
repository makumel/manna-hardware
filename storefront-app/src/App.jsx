import React, { useState, useEffect, useMemo } from 'react';
import initialCatalog from './catalog.json';
import { 
  Search, Camera, ShoppingCart, MessageCircle, Home, ShoppingBag, 
  Tv, Bell, User, Truck, MapPin, MoreHorizontal, ShieldCheck, 
  Plus, Minus, Trash2, ArrowRight, X, AlertCircle, Lock, KeyRound, 
  Eye, EyeOff, LogIn, UserPlus, LogOut, Check, RefreshCw, Flame, Tag,
  ListFilter, Package, Clock, SlidersHorizontal, Layers, CheckCircle2,
  Phone, Calendar, ChevronRight
} from 'lucide-react';

export default function App() {
  // Navigation tabs: 'home' | 'catalog' | 'mall' | 'live' | 'notifications' | 'me' | 'track-order' | 'checkout' | 'order-success'
  const [activeTab, setActiveTab] = useState('home');
  
  // ==================== AUTHENTICATION & SECURITY ====================
  const [users, setUsers] = useState(() => {
    const saved = localStorage.getItem('manna_registered_users');
    return saved ? JSON.parse(saved) : [
      { id: 'usr_1', fullName: 'Tacloban Builder', email: 'builder@example.com', phone: '09171234567', password: 'password123' }
    ];
  });
  
  const [currentUser, setCurrentUser] = useState(() => {
    const saved = localStorage.getItem('manna_current_user');
    return saved ? JSON.parse(saved) : null;
  });

  const [authModal, setAuthModal] = useState(null); // 'login' | 'register'
  const [authForm, setAuthForm] = useState({ fullName: '', email: '', phone: '', password: '', confirmPassword: '' });
  const [authError, setAuthError] = useState('');

  // Merchant Admin Password Gate (STRICT: asenso123)
  const [isMerchantAuthenticated, setIsMerchantAuthenticated] = useState(() => {
    return sessionStorage.getItem('manna_merchant_auth') === 'true';
  });
  const [adminPasswordInput, setAdminPasswordInput] = useState('');
  const [adminPasswordError, setAdminPasswordError] = useState('');
  const [showAdminPassword, setShowAdminPassword] = useState(false);

  // ==================== CATALOG & INVENTORY ====================
  const [products, setProducts] = useState(() => {
    const saved = localStorage.getItem('manna_products');
    return saved ? JSON.parse(saved) : initialCatalog;
  });

  const [cart, setCart] = useState(() => {
    const saved = localStorage.getItem('manna_cart');
    return saved ? JSON.parse(saved) : [];
  });
  const [isCartOpen, setIsCartOpen] = useState(false);

  // ==================== DISCOUNTS & PROMOTIONS ====================
  // Required promo codes: "hardware" (40% off), "builder" (35% off)
  const [discounts, setDiscounts] = useState(() => {
    const saved = localStorage.getItem('manna_discounts');
    return saved ? JSON.parse(saved) : [
      { code: 'hardware', type: 'percentage', value: 40, minSpend: 0, active: true, description: '40% OFF Hardware Promo' },
      { code: 'builder', type: 'percentage', value: 35, minSpend: 0, active: true, description: '35% OFF Builder Special' },
      { code: 'MANNA10', type: 'percentage', value: 10, minSpend: 1000, active: true, description: '10% OFF Min. Spend ₱1k' },
      { code: 'HARDWARE500', type: 'flat', value: 500, minSpend: 5000, active: true, description: '₱500 Flat Voucher' }
    ];
  });

  // Global Storewide Discount (%)
  const [storewideDiscount, setStorewideDiscount] = useState(() => {
    const saved = localStorage.getItem('manna_storewide_discount');
    return saved ? Number(saved) : 0;
  });

  const [appliedPromo, setAppliedPromo] = useState(null);
  const [promoInput, setPromoInput] = useState('');
  const [promoMessage, setPromoMessage] = useState({ text: '', type: '' });

  // Search & Filter
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [catalogFilterInStock, setCatalogFilterInStock] = useState(false);

  // ==================== CHECKOUT & ORDER TRACKING ====================
  const [customer, setCustomer] = useState({
    fullName: '',
    phone: '',
    email: '',
    address: 'Tacloban City, Leyte',
    paymentMethod: 'cod',
    honeypot: ''
  });
  
  const [placedOrder, setPlacedOrder] = useState(null);
  const [trackingQuery, setTrackingQuery] = useState('');
  const [trackedOrder, setTrackedOrder] = useState(null);
  const [trackingError, setTrackingError] = useState('');

  const [orders, setOrders] = useState(() => {
    const saved = localStorage.getItem('manna_orders');
    return saved ? JSON.parse(saved) : [
      {
        orderId: 'MNA-ORD-774921',
        date: new Date(Date.now() - 3600000 * 4).toLocaleString(),
        customer: { fullName: 'Eduardo Ramos', phone: '09189876543', address: 'Brgy. Abucay, Tacloban City', paymentMethod: 'cod' },
        items: [
          { id: 'MNA-1001', name: 'C-Purlins 2x4 1.2mm', unit: 'pc', price: 775, quantity: 4, total: 3100 },
          { id: 'MNA-1022', name: 'GYPSUM Screw #1-1/2 Wood (100 pcs/pack)', unit: 'pack (100 pcs)', price: 100, quantity: 2, total: 200 }
        ],
        subtotal: 3300,
        discountAmount: 1320,
        promoCode: 'hardware',
        total: 1980,
        status: 'Out for Delivery'
      }
    ];
  });

  // Admin per-item discount editor state
  const [itemDiscountSearch, setItemDiscountSearch] = useState('');

  // Persistent storage
  useEffect(() => {
    localStorage.setItem('manna_registered_users', JSON.stringify(users));
  }, [users]);
  useEffect(() => {
    if (currentUser) localStorage.setItem('manna_current_user', JSON.stringify(currentUser));
    else localStorage.removeItem('manna_current_user');
  }, [currentUser]);
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

  const categories = useMemo(() => {
    return ['All', ...new Set(products.map(p => p.category))];
  }, [products]);

  // Filtered products for public views
  const filteredProducts = useMemo(() => {
    return products.filter(p => {
      const matchCat = selectedCategory === 'All' || p.category === selectedCategory;
      const matchSearch = p.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          p.id.toLowerCase().includes(searchQuery.toLowerCase());
      const matchStock = catalogFilterInStock ? p.stock > 0 : true;
      return matchCat && matchSearch && matchStock;
    });
  }, [products, selectedCategory, searchQuery, catalogFilterInStock]);

  // Dual column masonry for Home view
  const leftColumnItems = useMemo(() => {
    return filteredProducts.filter((_, idx) => idx % 2 === 0);
  }, [filteredProducts]);

  const rightColumnItems = useMemo(() => {
    return filteredProducts.filter((_, idx) => idx % 2 === 1);
  }, [filteredProducts]);

  // Cart & Pricing calculations
  const cartSubtotal = useMemo(() => {
    return cart.reduce((sum, item) => {
      const itemDisc = Number(item.discount_percent || 0);
      const effectivePrice = itemDisc > 0 ? item.price * (1 - itemDisc / 100) : item.price;
      return sum + (effectivePrice * item.quantity);
    }, 0);
  }, [cart]);

  const discountAmount = useMemo(() => {
    let disc = 0;
    if (appliedPromo) {
      if (appliedPromo.type === 'percentage') disc += (cartSubtotal * (appliedPromo.value / 100));
      else disc += appliedPromo.value;
    }
    if (storewideDiscount > 0) disc += (cartSubtotal * (storewideDiscount / 100));
    return Math.min(disc, cartSubtotal);
  }, [cartSubtotal, appliedPromo, storewideDiscount]);

  const shippingFee = cartSubtotal > 3000 || cart.length === 0 ? 0 : 150;
  const orderTotal = Math.max(0, cartSubtotal - discountAmount + shippingFee);

  // Cart actions
  const addToCart = (product, qty = 1) => {
    if (product.stock <= 0) return;
    setCart(prev => {
      const existing = prev.find(item => item.id === product.id);
      if (existing) {
        return prev.map(item => item.id === product.id ? { ...item, quantity: item.quantity + qty } : item);
      }
      return [...prev, { ...product, quantity: qty }];
    });
  };

  const updateCartQty = (id, delta) => {
    setCart(prev => {
      return prev.map(item => {
        if (item.id === id) {
          const newQty = item.quantity + delta;
          if (newQty <= 0) return null;
          return { ...item, quantity: newQty };
        }
        return item;
      }).filter(Boolean);
    });
  };

  const removeFromCart = (id) => {
    setCart(prev => prev.filter(item => item.id !== id));
  };

  // Promo code application (supports "hardware" 40%, "builder" 35%)
  const applyPromoCode = (e) => {
    e.preventDefault();
    setPromoMessage({ text: '', type: '' });
    const clean = promoInput.trim().toLowerCase();
    
    const found = discounts.find(d => d.code.toLowerCase() === clean && d.active);
    if (!found) {
      setPromoMessage({ text: 'Invalid promo code. Try "hardware" or "builder"', type: 'error' });
      return;
    }
    if (cartSubtotal < found.minSpend) {
      setPromoMessage({ text: `Minimum order of ₱${found.minSpend.toLocaleString()} required.`, type: 'error' });
      return;
    }
    setAppliedPromo(found);
    setPromoMessage({ text: `Success! Code "${found.code.toUpperCase()}" applied (${found.value}% OFF)`, type: 'success' });
  };

  // Checkout submission
  const handleCheckoutSubmit = (e) => {
    e.preventDefault();
    if (customer.honeypot || cart.length === 0) return;

    // Decrement stock
    setProducts(prev => prev.map(p => {
      const cItem = cart.find(c => c.id === p.id);
      return cItem ? { ...p, stock: Math.max(0, p.stock - cItem.quantity) } : p;
    }));

    const newOrder = {
      orderId: `MNA-ORD-${Date.now().toString().slice(-6)}`,
      date: new Date().toLocaleString(),
      customer: { ...customer },
      items: [...cart],
      subtotal: cartSubtotal,
      discountAmount,
      promoCode: appliedPromo ? appliedPromo.code : null,
      total: orderTotal,
      status: 'Order Placed'
    };

    setOrders(prev => [newOrder, ...prev]);
    setPlacedOrder(newOrder);
    setTrackedOrder(newOrder);
    setCart([]);
    setAppliedPromo(null);
    setPromoInput('');
    setActiveTab('order-success');
    setIsCartOpen(false);
  };

  // Public order search & tracking
  const handleTrackSearch = (e) => {
    e.preventDefault();
    setTrackingError('');
    const query = trackingQuery.trim().toLowerCase();
    if (!query) return;

    const match = orders.find(o => 
      o.orderId.toLowerCase() === query || 
      (o.customer.phone && o.customer.phone.replace(/\s+/g, '') === query.replace(/\s+/g, ''))
    );

    if (match) {
      setTrackedOrder(match);
    } else {
      setTrackedOrder(null);
      setTrackingError('No order found matching that Tracking ID or Phone number.');
    }
  };

  // Auth actions
  const handleLoginSubmit = (e) => {
    e.preventDefault();
    setAuthError('');
    const user = users.find(u => (u.email.toLowerCase() === authForm.email.toLowerCase() || u.phone === authForm.email) && u.password === authForm.password);
    if (!user) {
      setAuthError('Invalid credentials.');
      return;
    }
    setCurrentUser(user);
    setAuthModal(null);
  };

  const handleRegisterSubmit = (e) => {
    e.preventDefault();
    setAuthError('');
    if (authForm.password !== authForm.confirmPassword) {
      setAuthError('Passwords do not match.');
      return;
    }
    const newUser = { id: `usr_${Date.now()}`, fullName: authForm.fullName, email: authForm.email, phone: authForm.phone, password: authForm.password };
    setUsers(prev => [...prev, newUser]);
    setCurrentUser(newUser);
    setAuthModal(null);
  };

  // Merchant Admin Password verification (STRICT: asenso123)
  const handleAdminPasswordSubmit = (e) => {
    e.preventDefault();
    setAdminPasswordError('');
    if (adminPasswordInput.trim() === 'asenso123') {
      setIsMerchantAuthenticated(true);
      sessionStorage.setItem('manna_merchant_auth', 'true');
      setAdminPasswordInput('');
    } else {
      setAdminPasswordError('Incorrect password. Access denied.');
    }
  };

  // Admin order status update
  const handleOrderStatusUpdate = (orderId, newStatus) => {
    setOrders(prev => prev.map(o => o.orderId === orderId ? { ...o, status: newStatus } : o));
    if (trackedOrder && trackedOrder.orderId === orderId) {
      setTrackedOrder(prev => ({ ...prev, status: newStatus }));
    }
  };

  // Admin per-item discount update
  const handleItemDiscountChange = (productId, discountVal) => {
    const val = Math.max(0, Math.min(100, Number(discountVal || 0)));
    setProducts(prev => prev.map(p => p.id === productId ? { ...p, discount_percent: val } : p));
  };

  return (
    <div className="min-h-screen bg-[#F6F6F6] text-[#222222] font-sans pb-16 select-none max-w-lg mx-auto shadow-2xl relative">
      
      {/* 1. EXACT SHOPEE ORANGE STATUS BAR & HEADER (#EE4D2D) */}
      <header className="sticky top-0 z-40 bg-[#EE4D2D] text-white pt-2 pb-2.5 px-3 shadow-sm">
        
        {/* Search Bar Row with Camera, Cart 99+, Chat 16 */}
        <div className="flex items-center gap-2">
          {/* White Search Input Container */}
          <div className="flex-1 bg-white rounded-md h-9 px-3 flex items-center gap-2 shadow-xs">
            <Search className="w-4 h-4 text-[#888888] shrink-0" />
            <input
              type="text"
              placeholder="Search C-purlins, Island Paint, Screws..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              className="w-full text-xs text-[#222222] placeholder-[#EE4D2D]/80 font-normal focus:outline-none"
            />
            <button className="text-[#888888] hover:text-[#555] shrink-0">
              <Camera className="w-4 h-4" />
            </button>
          </div>

          {/* Cart Icon with Red/White Badge */}
          <button 
            onClick={() => setIsCartOpen(true)}
            className="relative p-1 text-white hover:opacity-90 shrink-0 cursor-pointer"
          >
            <ShoppingCart className="w-6 h-6 stroke-[1.8]" />
            <span className="absolute -top-1 -right-1 bg-white text-[#EE4D2D] text-[9px] font-black px-1 py-0.2 rounded-full border border-[#EE4D2D] leading-tight">
              {cart.reduce((s, i) => s + i.quantity, 0) > 0 ? cart.reduce((s, i) => s + i.quantity, 0) : '99+'}
            </span>
          </button>

          {/* Track Order / Chat Icon */}
          <button 
            onClick={() => setActiveTab('track-order')}
            title="Track Order Status"
            className="relative p-1 text-white hover:opacity-90 shrink-0 cursor-pointer"
          >
            <Truck className="w-6 h-6 stroke-[1.8]" />
            <span className="absolute -top-1 -right-1 bg-white text-[#EE4D2D] text-[9px] font-black px-1 py-0.2 rounded-full border border-[#EE4D2D] leading-tight">
              LIVE
            </span>
          </button>
        </div>

        {/* Navigation Strip under Search: Home, FULL CATALOG, Mall, Track Order */}
        <div className="flex items-center justify-between gap-2 overflow-x-auto no-scrollbar pt-2.5 text-[11px] font-medium text-white/95 border-b border-white/10 pb-1">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setActiveTab('home')}
              className={`whitespace-nowrap pb-0.5 cursor-pointer ${
                activeTab === 'home' ? 'font-bold border-b-2 border-white' : 'opacity-85 hover:opacity-100'
              }`}
            >
              Discover
            </button>

            {/* FULL CATALOG PUBLIC TAB (User Requested) */}
            <button
              onClick={() => setActiveTab('catalog')}
              className={`whitespace-nowrap px-2 py-0.5 rounded cursor-pointer flex items-center gap-1 font-bold ${
                activeTab === 'catalog' ? 'bg-white text-[#EE4D2D] shadow-xs' : 'bg-white/20 text-white hover:bg-white/30'
              }`}
            >
              <Layers className="w-3.5 h-3.5" /> FULL CATALOG ({products.length})
            </button>

            <button
              onClick={() => setActiveTab('mall')}
              className={`whitespace-nowrap pb-0.5 cursor-pointer ${
                activeTab === 'mall' ? 'font-bold border-b-2 border-white' : 'opacity-85 hover:opacity-100'
              }`}
            >
              Mall
            </button>
          </div>

          {/* Quick Order Tracker Link */}
          <button
            onClick={() => setActiveTab('track-order')}
            className={`whitespace-nowrap text-[10px] font-bold px-2 py-0.5 rounded cursor-pointer ${
              activeTab === 'track-order' ? 'bg-white text-[#EE4D2D]' : 'text-white/90 hover:text-white'
            }`}
          >
            Track Order
          </button>
        </div>

        {/* Categories Horizontal Scroll Strip */}
        <div className="flex items-center gap-3 overflow-x-auto no-scrollbar pt-1.5 text-[10px] font-normal text-white/90">
          {categories.map(cat => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`whitespace-nowrap pb-0.5 transition-colors cursor-pointer ${
                selectedCategory === cat ? 'font-bold text-white underline underline-offset-4' : 'opacity-80 hover:opacity-100'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </header>

      {/* ==================== 2. MAIN FEED: SHOPEE DUAL-COLUMN ==================== */}
      {activeTab === 'home' && (
        <main className="p-2 w-full">
          {/* Active Promo Banner */}
          <div className="bg-gradient-to-r from-amber-500 to-[#EE4D2D] text-white p-2.5 rounded-sm mb-2 flex items-center justify-between text-xs shadow-xs">
            <div className="flex items-center gap-1.5">
              <Tag className="w-4 h-4 shrink-0" />
              <span>Use voucher <strong>hardware</strong> for 40% OFF or <strong>builder</strong> for 35% OFF!</span>
            </div>
            <button onClick={() => { setActiveTab('checkout'); setIsCartOpen(true); }} className="bg-white text-[#EE4D2D] text-[10px] font-black px-2 py-1 rounded shrink-0">
              Apply
            </button>
          </div>

          {/* Dual Columns Grid */}
          <div className="grid grid-cols-2 gap-2 items-start">
            <div className="space-y-2">
              {leftColumnItems.map(item => (
                <ProductCard key={item.id} product={item} onAddToCart={addToCart} storewideDiscount={storewideDiscount} />
              ))}
            </div>

            <div className="space-y-2">
              {rightColumnItems.map(item => (
                <ProductCard key={item.id} product={item} onAddToCart={addToCart} isRightCol storewideDiscount={storewideDiscount} />
              ))}
            </div>
          </div>
        </main>
      )}

      {/* ==================== 3. PUBLIC "FULL CATALOG" VIEW (USER REQUESTED) ==================== */}
      {activeTab === 'catalog' && (
        <main className="p-2.5 w-full">
          {/* Full Catalog Header & Filter Card */}
          <div className="bg-white p-3 rounded-lg border border-slate-200 mb-3 shadow-xs">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100">
              <div>
                <h1 className="text-sm font-black text-slate-900 flex items-center gap-1.5">
                  <Layers className="w-4 h-4 text-[#EE4D2D]" /> FULL MASTER CATALOG
                </h1>
                <p className="text-[11px] text-slate-500">Live inventory, packaging units, and commercial discounts</p>
              </div>
              <span className="text-[10px] font-bold bg-[#EE4D2D]/10 text-[#EE4D2D] px-2 py-0.5 rounded-full">
                {filteredProducts.length} Items
              </span>
            </div>

            {/* Quick in-stock filter & Category selector */}
            <div className="flex items-center justify-between gap-2 mt-2 pt-1 text-xs">
              <label className="flex items-center gap-1.5 text-slate-700 cursor-pointer text-[11px] font-medium">
                <input 
                  type="checkbox"
                  checked={catalogFilterInStock}
                  onChange={e => setCatalogFilterInStock(e.target.checked)}
                  className="rounded text-[#EE4D2D] focus:ring-0"
                />
                In Stock Only
              </label>

              <select 
                value={selectedCategory} 
                onChange={e => setSelectedCategory(e.target.value)}
                className="text-xs border border-slate-200 rounded px-2 py-1 bg-slate-50 focus:outline-none"
              >
                {categories.map(c => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>
          </div>

          {/* High-Density Catalog List */}
          <div className="space-y-2">
            {filteredProducts.map(item => {
              const itemDisc = Number(item.discount_percent || 0);
              const maxDiscount = Math.max(itemDisc, storewideDiscount);
              const effectivePrice = maxDiscount > 0 ? item.price * (1 - maxDiscount / 100) : item.price;
              const isBulkPack = item.unit.includes('100');

              return (
                <div key={item.id} className="bg-white p-2.5 rounded-lg border border-slate-200 shadow-2xs flex gap-3 items-center">
                  {/* Thumbnail Image */}
                  <div className="w-16 h-16 rounded bg-slate-50 border border-slate-100 overflow-hidden shrink-0 relative">
                    <img 
                      src={item.image} 
                      alt={item.name} 
                      loading="lazy"
                      className="w-full h-full object-cover" 
                      onError={(e) => {
                        e.target.onerror = null;
                        e.target.src = "https://images.pexels.com/photos/175039/pexels-photo-175039.jpeg?auto=compress&cs=tinysrgb&h=650&w=940";
                      }}
                    />
                    {isBulkPack && (
                      <span className="absolute bottom-0 left-0 right-0 bg-blue-600 text-white text-[7px] font-black text-center py-0.2">
                        100 PCS
                      </span>
                    )}
                  </div>

                  {/* Item Details */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-1.5 mb-0.5">
                      <span className="text-[9px] font-mono font-bold text-slate-400 bg-slate-100 px-1 rounded">
                        {item.id}
                      </span>
                      <span className="text-[9px] text-slate-500 font-semibold truncate max-w-[120px]">
                        {item.category}
                      </span>
                    </div>

                    <h3 className="text-xs font-bold text-slate-900 line-clamp-1 leading-snug">
                      {item.name}
                    </h3>

                    {/* Unit & Live Stock */}
                    <div className="flex items-center gap-2 mt-0.5 text-[10px]">
                      <span className="text-slate-500">Unit: <strong className="text-slate-800">{item.unit}</strong></span>
                      <span>•</span>
                      {item.stock <= 0 ? (
                        <span className="font-bold text-rose-600">Out of Stock</span>
                      ) : item.stock < 10 ? (
                        <span className="font-bold text-amber-600">Low: {item.stock}</span>
                      ) : (
                        <span className="font-bold text-emerald-600">{item.stock} Avail</span>
                      )}
                    </div>

                    {/* Price with Discount */}
                    <div className="flex items-baseline gap-2 mt-1">
                      <span className="text-sm font-black text-[#EE4D2D]">
                        ₱{effectivePrice.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                      </span>
                      {maxDiscount > 0 && (
                        <>
                          <span className="text-[10px] text-slate-400 line-through">
                            ₱{item.price.toLocaleString()}
                          </span>
                          <span className="text-[9px] font-bold text-emerald-700 bg-emerald-50 px-1 py-0.2 rounded">
                            -{maxDiscount}%
                          </span>
                        </>
                      )}
                    </div>
                  </div>

                  {/* Add to Cart Button */}
                  <button
                    onClick={() => addToCart(item, 1)}
                    disabled={item.stock <= 0}
                    className={`px-3 py-2 rounded text-xs font-bold shrink-0 flex items-center gap-1 cursor-pointer transition-colors ${
                      item.stock <= 0
                        ? 'bg-slate-100 text-slate-400 cursor-not-allowed'
                        : 'bg-[#EE4D2D] hover:bg-[#d73f20] text-white shadow-xs'
                    }`}
                  >
                    <Plus className="w-3.5 h-3.5" /> Cart
                  </button>
                </div>
              );
            })}
          </div>
        </main>
      )}

      {/* ==================== 4. PUBLIC ORDER TRACKER VIEW (USER REQUESTED) ==================== */}
      {activeTab === 'track-order' && (
        <main className="p-3 w-full">
          {/* Tracker Search Box */}
          <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm mb-4">
            <div className="flex items-center gap-2 mb-2">
              <Truck className="w-5 h-5 text-[#EE4D2D]" />
              <h2 className="text-sm font-black text-slate-900">Live Order Fulfillment Tracker</h2>
            </div>
            <p className="text-xs text-slate-500 mb-3">
              Enter your Order Tracking ID (e.g., <code className="bg-slate-100 px-1 py-0.5 rounded font-mono text-[11px]">MNA-ORD-774921</code>) or your registered mobile phone number.
            </p>

            <form onSubmit={handleTrackSearch} className="flex gap-2">
              <input 
                type="text"
                placeholder="Enter Tracking ID or Phone Number..."
                value={trackingQuery}
                onChange={e => setTrackingQuery(e.target.value)}
                className="flex-1 px-3 py-2 text-xs border border-slate-200 rounded focus:border-[#EE4D2D] focus:outline-none"
              />
              <button 
                type="submit"
                className="bg-[#EE4D2D] text-white px-4 py-2 rounded text-xs font-bold shrink-0 cursor-pointer"
              >
                Track
              </button>
            </form>
            {trackingError && (
              <p className="text-rose-600 text-xs font-semibold mt-2">{trackingError}</p>
            )}
          </div>

          {/* Tracked Order Details & Visual Timeline */}
          {trackedOrder ? (
            <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm space-y-4">
              <div className="flex justify-between items-start pb-3 border-b border-slate-100">
                <div>
                  <span className="text-[10px] font-bold text-slate-400 uppercase">Order ID</span>
                  <h3 className="text-sm font-black text-slate-900 font-mono">{trackedOrder.orderId}</h3>
                  <p className="text-[11px] text-slate-500 flex items-center gap-1 mt-0.5">
                    <Calendar className="w-3 h-3" /> {trackedOrder.date}
                  </p>
                </div>
                <span className="text-xs font-black px-2.5 py-1 rounded-full bg-orange-100 text-[#EE4D2D] border border-orange-200">
                  {trackedOrder.status}
                </span>
              </div>

              {/* Step-by-Step Visual Progress Bar */}
              <div>
                <h4 className="text-xs font-bold text-slate-800 mb-3">Fulfillment Journey</h4>
                <div className="space-y-3">
                  {[
                    { step: 'Order Placed', desc: 'Hardware order verified in database' },
                    { step: 'Processing', desc: 'Materials allocated from Tacloban warehouse' },
                    { step: 'Packed', desc: 'Loaded and bundled for transit' },
                    { step: 'Out for Delivery', desc: 'Dispatched via Manna fleet truck' },
                    { step: 'Delivered', desc: 'Successfully signed by receiver' }
                  ].map((s, idx) => {
                    const statusOrder = ['Order Placed', 'Processing', 'Packed', 'Out for Delivery', 'Delivered'];
                    const currentIdx = statusOrder.indexOf(trackedOrder.status);
                    const isPassed = currentIdx >= idx;
                    const isCurrent = currentIdx === idx;

                    return (
                      <div key={s.step} className="flex items-start gap-3 relative">
                        <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold shrink-0 z-10 ${
                          isPassed 
                            ? 'bg-emerald-600 text-white' 
                            : 'bg-slate-200 text-slate-400'
                        } ${isCurrent ? 'ring-4 ring-emerald-100' : ''}`}>
                          {isPassed ? '✓' : idx + 1}
                        </div>
                        <div className="flex-1 text-xs">
                          <p className={`font-bold ${isPassed ? 'text-slate-900' : 'text-slate-400'}`}>
                            {s.step} {isCurrent && <span className="text-[10px] text-emerald-600 font-black ml-1">• CURRENT</span>}
                          </p>
                          <p className="text-[11px] text-slate-500">{s.desc}</p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Destination & Ordered Items */}
              <div className="pt-3 border-t border-slate-100 text-xs space-y-1.5">
                <p className="text-slate-500">Receiver: <strong className="text-slate-800">{trackedOrder.customer.fullName}</strong></p>
                <p className="text-slate-500">Address: <strong className="text-slate-800">{trackedOrder.customer.address}</strong></p>
                <p className="text-slate-500">Payment: <strong className="text-slate-800 uppercase">{trackedOrder.customer.paymentMethod}</strong></p>
                <div className="pt-2 border-t border-slate-100 flex justify-between font-black text-sm">
                  <span>Total Amount:</span>
                  <span className="text-[#EE4D2D]">₱{trackedOrder.total.toLocaleString()}</span>
                </div>
              </div>
            </div>
          ) : (
            <div className="text-center py-10 text-xs text-slate-400 bg-white rounded-xl border border-slate-200">
              Enter a valid tracking ID or phone above to see live fulfillment updates.
            </div>
          )}
        </main>
      )}

      {/* ==================== 5. MALL VIEW ==================== */}
      {activeTab === 'mall' && (
        <main className="p-3 w-full">
          <div className="bg-[#EE4D2D] text-white p-4 rounded-lg mb-3 flex items-center justify-between shadow-sm">
            <div>
              <span className="text-[10px] uppercase font-black tracking-widest bg-white/20 px-2 py-0.5 rounded">
                Official Hardware Mall
              </span>
              <h2 className="text-base font-black mt-1">Manna Mall Tacloban</h2>
              <p className="text-xs text-white/90">100% Genuine Boysen, Island, Makita & Amerilock</p>
            </div>
            <ShieldCheck className="w-10 h-10 text-white/80" />
          </div>

          <div className="grid grid-cols-2 gap-2">
            {filteredProducts.slice(0, 10).map(item => (
              <ProductCard key={item.id} product={item} onAddToCart={addToCart} storewideDiscount={storewideDiscount} />
            ))}
          </div>
        </main>
      )}

      {/* ==================== 6. LIVE & VIDEO VIEW ==================== */}
      {activeTab === 'live' && (
        <main className="p-3 w-full">
          <div className="bg-black text-white p-4 rounded-xl mb-3 flex items-center justify-between">
            <div>
              <div className="flex items-center gap-1.5 mb-1">
                <span className="w-2 h-2 rounded-full bg-rose-500 animate-pulse" />
                <span className="text-[10px] font-bold uppercase tracking-wider text-rose-400">Live Demonstrations</span>
              </div>
              <h3 className="font-bold text-sm">Industrial Fasteners & Paint Mixing Demo</h3>
              <p className="text-xs text-slate-400">Watch live demonstrations from our warehouse</p>
            </div>
            <Tv className="w-8 h-8 text-[#EE4D2D]" />
          </div>

          <div className="grid grid-cols-2 gap-2">
            {filteredProducts.slice(10, 20).map(item => (
              <ProductCard key={item.id} product={item} onAddToCart={addToCart} isVideoCard storewideDiscount={storewideDiscount} />
            ))}
          </div>
        </main>
      )}

      {/* ==================== 7. NOTIFICATIONS VIEW ==================== */}
      {activeTab === 'notifications' && (
        <main className="p-3 w-full space-y-2">
          <div className="bg-white p-3 rounded-lg border border-slate-200 flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-orange-100 text-[#EE4D2D] flex items-center justify-center font-bold">
              🏷️
            </div>
            <div className="flex-1 text-xs">
              <p className="font-bold text-slate-900">Voucher Code "hardware" Live!</p>
              <p className="text-slate-500 text-[11px]">Get 40% OFF your hardware orders right now.</p>
            </div>
          </div>

          <div className="bg-white p-3 rounded-lg border border-slate-200 flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center font-bold">
              🏗️
            </div>
            <div className="flex-1 text-xs">
              <p className="font-bold text-slate-900">Contractor Special "builder"</p>
              <p className="text-slate-500 text-[11px]">Builders and contractors enjoy 35% OFF on structural orders.</p>
            </div>
          </div>
        </main>
      )}

      {/* ==================== 8. VIEW: ME / MERCHANT DASHBOARD (PASSWORD PROTECTED: asenso123) ==================== */}
      {activeTab === 'me' && (
        <main className="p-3 w-full">
          {!isMerchantAuthenticated ? (
            /* PASSWORD GATE */
            <div className="bg-white rounded-xl p-6 border border-slate-200 shadow-sm text-center my-4">
              <div className="w-12 h-12 rounded-full bg-orange-50 text-[#EE4D2D] flex items-center justify-center mx-auto mb-3">
                <Lock className="w-6 h-6" />
              </div>
              <h2 className="text-base font-bold text-slate-900">Merchant Dashboard Access</h2>
              <p className="text-xs text-slate-500 mt-1 mb-5">
                Authorized management only. Enter the store merchant password to access order management, live discount controllers, and inventory costs.
              </p>

              <form onSubmit={handleAdminPasswordSubmit} className="space-y-3 text-left">
                <div>
                  <label className="block text-[11px] font-bold text-slate-700 mb-1">Merchant Password</label>
                  <div className="relative">
                    <input
                      type={showAdminPassword ? "text" : "password"}
                      required
                      placeholder="Enter merchant password..."
                      value={adminPasswordInput}
                      onChange={e => setAdminPasswordInput(e.target.value)}
                      className="w-full px-3 py-2 text-xs border border-slate-200 rounded focus:border-[#EE4D2D] focus:outline-none pr-8 font-mono"
                    />
                    <button
                      type="button"
                      onClick={() => setShowAdminPassword(!showAdminPassword)}
                      className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400"
                    >
                      {showAdminPassword ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                    </button>
                  </div>
                  {adminPasswordError && (
                    <p className="text-rose-600 text-[10px] font-bold mt-1 flex items-center gap-1">
                      <AlertCircle className="w-3 h-3" /> {adminPasswordError}
                    </p>
                  )}
                </div>

                <button
                  type="submit"
                  className="w-full bg-[#EE4D2D] text-white py-2.5 rounded font-bold text-xs shadow-xs cursor-pointer flex items-center justify-center gap-1.5"
                >
                  <KeyRound className="w-3.5 h-3.5" /> Unlock Dashboard
                </button>
              </form>

              {/* Customer Account & Order Tracker Direct Links */}
              <div className="mt-6 pt-5 border-t border-slate-100 text-left">
                <h4 className="text-xs font-bold text-slate-800 mb-2">Customer Tools</h4>
                <div className="space-y-2">
                  <button
                    onClick={() => setActiveTab('track-order')}
                    className="w-full text-left text-xs bg-slate-50 hover:bg-slate-100 p-2.5 rounded border border-slate-200 flex items-center justify-between cursor-pointer"
                  >
                    <span className="flex items-center gap-2 font-bold text-slate-700">
                      <Truck className="w-4 h-4 text-[#EE4D2D]" /> Track My Order Online
                    </span>
                    <ChevronRight className="w-4 h-4 text-slate-400" />
                  </button>

                  <button
                    onClick={() => setActiveTab('catalog')}
                    className="w-full text-left text-xs bg-slate-50 hover:bg-slate-100 p-2.5 rounded border border-slate-200 flex items-center justify-between cursor-pointer"
                  >
                    <span className="flex items-center gap-2 font-bold text-slate-700">
                      <Layers className="w-4 h-4 text-blue-600" /> View Full Master Catalog ({products.length} items)
                    </span>
                    <ChevronRight className="w-4 h-4 text-slate-400" />
                  </button>
                </div>
              </div>
            </div>
          ) : (
            /* ==================== AUTHENTICATED MERCHANT DASHBOARD ==================== */
            <div className="space-y-4">
              {/* Dashboard Header Bar */}
              <div className="bg-white p-4 rounded-lg border border-slate-200 flex items-center justify-between shadow-xs">
                <div>
                  <h2 className="text-sm font-black text-slate-900 flex items-center gap-1.5">
                    <ShieldCheck className="w-4 h-4 text-[#EE4D2D]" /> Merchant Seller Command Centre
                  </h2>
                  <p className="text-[11px] text-slate-500">Authorized Protected Session</p>
                </div>
                <button
                  onClick={() => { setIsMerchantAuthenticated(false); sessionStorage.removeItem('manna_merchant_auth'); }}
                  className="text-xs font-bold bg-rose-50 text-rose-600 px-3 py-1.5 rounded cursor-pointer"
                >
                  Lock
                </button>
              </div>

              {/* 1. Global Storewide Discount Controller */}
              <div className="bg-white p-4 rounded-lg border border-slate-200 shadow-xs">
                <div className="flex items-center justify-between mb-2">
                  <div>
                    <h3 className="text-xs font-bold text-slate-900 flex items-center gap-1">
                      <Flame className="w-3.5 h-3.5 text-[#EE4D2D]" /> Global Storewide Flash Sale Discount
                    </h3>
                    <p className="text-[10px] text-slate-400">Instantly marks down all 465 items simultaneously</p>
                  </div>
                  <span className="text-base font-black text-[#EE4D2D]">{storewideDiscount}%</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="50"
                  step="5"
                  value={storewideDiscount}
                  onChange={e => setStorewideDiscount(Number(e.target.value))}
                  className="w-full accent-[#EE4D2D] cursor-pointer"
                />
                <div className="flex justify-between text-[10px] text-slate-400 mt-1">
                  <span>0% (Standard)</span>
                  <span>25%</span>
                  <span>50% (Max)</span>
                </div>
              </div>

              {/* 2. Active Promo Codes Manager (hardware 40%, builder 35%) */}
              <div className="bg-white p-4 rounded-lg border border-slate-200 shadow-xs">
                <h3 className="text-xs font-bold text-slate-900 mb-2 flex items-center gap-1">
                  <Tag className="w-3.5 h-3.5 text-blue-600" /> Active Voucher Codes
                </h3>
                <div className="space-y-2">
                  {discounts.map((d, i) => (
                    <div key={d.code} className="flex items-center justify-between text-xs p-2.5 bg-slate-50 rounded border border-slate-100">
                      <div>
                        <div className="flex items-center gap-1.5">
                          <span className="font-mono font-black text-[#EE4D2D] text-xs uppercase">{d.code}</span>
                          <span className="text-[9px] bg-orange-100 text-[#EE4D2D] font-bold px-1 rounded">
                            {d.type === 'percentage' ? `${d.value}% OFF` : `₱${d.value} FLAT`}
                          </span>
                        </div>
                        <p className="text-[10px] text-slate-500 mt-0.5">{d.description}</p>
                      </div>
                      <button
                        onClick={() => setDiscounts(prev => prev.map((item, idx) => idx === i ? { ...item, active: !item.active } : item))}
                        className={`text-[10px] font-bold px-2 py-1 rounded cursor-pointer ${
                          d.active ? 'bg-emerald-100 text-emerald-800' : 'bg-slate-200 text-slate-500'
                        }`}
                      >
                        {d.active ? 'Active' : 'Disabled'}
                      </button>
                    </div>
                  ))}
                </div>
              </div>

              {/* 3. Manual Per-Item Discount Manager (User Requested) */}
              <div className="bg-white p-4 rounded-lg border border-slate-200 shadow-xs">
                <div className="flex items-center justify-between mb-2">
                  <div>
                    <h3 className="text-xs font-bold text-slate-900 flex items-center gap-1">
                      <SlidersHorizontal className="w-3.5 h-3.5 text-emerald-600" /> Manual Per-Item Discounts
                    </h3>
                    <p className="text-[10px] text-slate-400">Adjust individual product discount percentages</p>
                  </div>
                </div>

                <input
                  type="text"
                  placeholder="Filter product to discount..."
                  value={itemDiscountSearch}
                  onChange={e => setItemDiscountSearch(e.target.value)}
                  className="w-full text-xs px-2.5 py-1.5 border border-slate-200 rounded mb-2 bg-slate-50 focus:outline-none"
                />

                <div className="max-h-48 overflow-y-auto space-y-1.5 divide-y divide-slate-100">
                  {products
                    .filter(p => !itemDiscountSearch || p.name.toLowerCase().includes(itemDiscountSearch.toLowerCase()) || p.id.toLowerCase().includes(itemDiscountSearch.toLowerCase()))
                    .slice(0, 10)
                    .map(item => (
                      <div key={item.id} className="pt-1.5 flex items-center justify-between text-xs">
                        <div className="truncate max-w-[180px]">
                          <p className="font-bold text-slate-800 truncate">{item.name}</p>
                          <p className="text-[10px] text-slate-400">₱{item.price} • {item.unit}</p>
                        </div>
                        <div className="flex items-center gap-1">
                          <input
                            type="number"
                            min="0"
                            max="90"
                            value={item.discount_percent || 0}
                            onChange={e => handleItemDiscountChange(item.id, e.target.value)}
                            className="w-14 text-center text-xs font-bold border border-slate-200 rounded py-0.5"
                          />
                          <span className="text-[10px] font-bold text-slate-500">%</span>
                        </div>
                      </div>
                    ))}
                </div>
              </div>

              {/* 4. Live Order Management & Status Controller */}
              <div className="bg-white p-4 rounded-lg border border-slate-200 shadow-xs">
                <h3 className="text-xs font-bold text-slate-900 mb-2 flex items-center gap-1.5">
                  <Package className="w-4 h-4 text-[#EE4D2D]" /> Live Orders Management ({orders.length})
                </h3>

                {orders.length === 0 ? (
                  <p className="text-xs text-slate-400 py-6 text-center">No orders logged in system yet.</p>
                ) : (
                  <div className="space-y-3">
                    {orders.map(o => (
                      <div key={o.orderId} className="p-3 border border-slate-200 rounded-lg bg-slate-50 text-xs space-y-2">
                        <div className="flex justify-between items-start">
                          <div>
                            <span className="font-mono font-black text-slate-900">{o.orderId}</span>
                            <p className="text-slate-500 text-[10px]">{o.date}</p>
                          </div>
                          <span className="font-black text-[#EE4D2D] text-sm">₱{o.total.toLocaleString()}</span>
                        </div>

                        <div className="text-[11px] text-slate-700 bg-white p-2 rounded border border-slate-100">
                          <p><strong>Customer:</strong> {o.customer.fullName} ({o.customer.phone})</p>
                          <p><strong>Address:</strong> {o.customer.address}</p>
                          <p><strong>Payment:</strong> <span className="uppercase font-bold">{o.customer.paymentMethod}</span></p>
                        </div>

                        {/* Order Status Change Dropdown */}
                        <div className="flex items-center justify-between pt-1">
                          <span className="text-[11px] font-bold text-slate-600">Update Status:</span>
                          <select
                            value={o.status}
                            onChange={e => handleOrderStatusUpdate(o.orderId, e.target.value)}
                            className="text-xs font-bold border border-slate-300 rounded px-2 py-1 bg-white text-[#EE4D2D] focus:outline-none"
                          >
                            <option value="Order Placed">Order Placed</option>
                            <option value="Processing">Processing</option>
                            <option value="Packed">Packed</option>
                            <option value="Out for Delivery">Out for Delivery</option>
                            <option value="Delivered">Delivered</option>
                            <option value="Cancelled">Cancelled</option>
                          </select>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}
        </main>
      )}

      {/* ==================== 9. VIEW: CHECKOUT SCREEN ==================== */}
      {activeTab === 'checkout' && (
        <main className="p-3 w-full">
          <button onClick={() => setActiveTab('home')} className="text-xs font-bold text-[#EE4D2D] mb-3 flex items-center gap-1 cursor-pointer">
            ← Back to Hardware Catalog
          </button>

          <div className="bg-white p-4 rounded-lg border border-slate-200 shadow-sm">
            <h2 className="text-xs font-black uppercase text-slate-800 pb-2 border-b border-slate-100 flex items-center gap-1.5">
              <MapPin className="w-4 h-4 text-[#EE4D2D]" /> Direct Delivery Information
            </h2>

            <form onSubmit={handleCheckoutSubmit} className="mt-3 space-y-3">
              {/* Invisible Honeypot */}
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
                <label className="block text-[11px] font-bold text-slate-700 mb-1">Receiver Name *</label>
                <input
                  type="text"
                  required
                  placeholder="Engineer / Foreman / Owner Name"
                  value={customer.fullName}
                  onChange={e => setCustomer({ ...customer, fullName: e.target.value })}
                  className="w-full px-3 py-2 text-xs border border-slate-200 rounded focus:border-[#EE4D2D] focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-700 mb-1">Mobile Phone *</label>
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
                <label className="block text-[11px] font-bold text-slate-700 mb-1">Site / Delivery Address *</label>
                <textarea
                  required
                  rows={2}
                  placeholder="Building project / street / barangay, Tacloban City"
                  value={customer.address}
                  onChange={e => setCustomer({ ...customer, address: e.target.value })}
                  className="w-full px-3 py-2 text-xs border border-slate-200 rounded focus:border-[#EE4D2D] focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-700 mb-1">Payment Method</label>
                <select
                  value={customer.paymentMethod}
                  onChange={e => setCustomer({ ...customer, paymentMethod: e.target.value })}
                  className="w-full px-3 py-2 text-xs border border-slate-200 rounded focus:border-[#EE4D2D] focus:outline-none bg-white font-medium"
                >
                  <option value="cod">Cash on Delivery (COD)</option>
                  <option value="gcash">GCash (Warehouse QR Verified)</option>
                  <option value="bank">Direct Bank Transfer / Check</option>
                </select>
              </div>

              {/* Promo Code Input Box */}
              <div className="pt-2 border-t border-slate-100">
                <label className="block text-[11px] font-bold text-slate-700 mb-1">Voucher / Promo Code</label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    placeholder="Enter code (e.g. hardware or builder)"
                    value={promoInput}
                    onChange={e => setPromoInput(e.target.value)}
                    className="flex-1 px-3 py-1.5 text-xs border border-slate-200 rounded uppercase font-mono focus:outline-none focus:border-[#EE4D2D]"
                  />
                  <button
                    type="button"
                    onClick={applyPromoCode}
                    className="bg-slate-900 text-white px-3 py-1.5 rounded text-xs font-bold cursor-pointer"
                  >
                    Apply
                  </button>
                </div>
                {promoMessage.text && (
                  <p className={`text-[11px] mt-1 font-bold ${promoMessage.type === 'success' ? 'text-emerald-600' : 'text-rose-600'}`}>
                    {promoMessage.text}
                  </p>
                )}
              </div>

              {/* Price Breakdown */}
              <div className="pt-2 border-t border-slate-100 space-y-1.5 text-xs">
                <div className="flex justify-between text-slate-500">
                  <span>Merchandise Subtotal</span>
                  <span>₱{cartSubtotal.toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>
                </div>
                {discountAmount > 0 && (
                  <div className="flex justify-between text-emerald-600 font-bold">
                    <span>Discount Savings</span>
                    <span>-₱{discountAmount.toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>
                  </div>
                )}
                <div className="flex justify-between text-slate-500">
                  <span>Shipping Fee</span>
                  <span>{shippingFee === 0 ? <strong className="text-emerald-600">FREE</strong> : `₱${shippingFee.toFixed(2)}`}</span>
                </div>
                <div className="flex justify-between text-sm font-black text-slate-900 pt-1 border-t border-slate-100">
                  <span>Total Payable:</span>
                  <span className="text-[#EE4D2D]">₱{orderTotal.toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>
                </div>
              </div>

              <button
                type="submit"
                className="w-full bg-[#EE4D2D] hover:bg-[#d73f20] text-white font-bold py-3 rounded text-xs shadow-md cursor-pointer mt-4"
              >
                Confirm & Place Order
              </button>
            </form>
          </div>
        </main>
      )}

      {/* ==================== 10. ORDER SUCCESS ==================== */}
      {activeTab === 'order-success' && placedOrder && (
        <main className="p-4 w-full text-center py-12">
          <div className="w-14 h-14 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto mb-3">
            <Check className="w-7 h-7" />
          </div>
          <h2 className="text-base font-black text-slate-900">Order Placed Successfully!</h2>
          <p className="text-xs text-slate-500 mt-1 mb-2">Tracking ID: <strong className="font-mono text-slate-900 font-bold">{placedOrder.orderId}</strong></p>
          <p className="text-[11px] text-slate-400 max-w-xs mx-auto mb-5">
            Your materials are being prepared at Manna Hardware Tacloban. You can track fulfillment status live anytime.
          </p>

          <div className="flex justify-center gap-3">
            <button
              onClick={() => { setActiveTab('track-order'); setTrackingQuery(placedOrder.orderId); setTrackedOrder(placedOrder); }}
              className="bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold px-4 py-2 rounded shadow-xs cursor-pointer flex items-center gap-1.5"
            >
              <Truck className="w-4 h-4" /> Track Order Status
            </button>
            <button
              onClick={() => setActiveTab('home')}
              className="bg-slate-200 hover:bg-slate-300 text-slate-800 text-xs font-bold px-4 py-2 rounded cursor-pointer"
            >
              Back to Shop
            </button>
          </div>
        </main>
      )}

      {/* ==================== 11. EXACT SHOPEE 5-TAB STICKY BOTTOM NAVIGATION BAR ==================== */}
      <nav className="fixed bottom-0 left-0 right-0 z-40 bg-white border-t border-[#E5E5E5] py-1 px-2 shadow-lg max-w-lg mx-auto">
        <div className="grid grid-cols-5 text-center">
          
          {/* Tab 1: Home */}
          <button
            onClick={() => setActiveTab('home')}
            className={`flex flex-col items-center justify-center py-1 transition-colors cursor-pointer ${
              activeTab === 'home' ? 'text-[#EE4D2D]' : 'text-[#757575]'
            }`}
          >
            <Home className="w-5 h-5 stroke-[1.8]" />
            <span className="text-[10px] font-normal mt-0.5">Home</span>
          </button>

          {/* Tab 2: Full Catalog */}
          <button
            onClick={() => setActiveTab('catalog')}
            className={`flex flex-col items-center justify-center py-1 transition-colors cursor-pointer ${
              activeTab === 'catalog' ? 'text-[#EE4D2D] font-bold' : 'text-[#757575]'
            }`}
          >
            <Layers className="w-5 h-5 stroke-[1.8]" />
            <span className="text-[10px] font-normal mt-0.5">Catalog</span>
          </button>

          {/* Tab 3: Live & Video */}
          <button
            onClick={() => setActiveTab('live')}
            className={`flex flex-col items-center justify-center py-1 transition-colors cursor-pointer ${
              activeTab === 'live' ? 'text-[#EE4D2D]' : 'text-[#757575]'
            }`}
          >
            <Tv className="w-5 h-5 stroke-[1.8]" />
            <span className="text-[10px] font-normal mt-0.5">Live</span>
          </button>

          {/* Tab 4: Notifications (Badge 22) */}
          <button
            onClick={() => setActiveTab('notifications')}
            className={`flex flex-col items-center justify-center py-1 transition-colors cursor-pointer relative ${
              activeTab === 'notifications' ? 'text-[#EE4D2D]' : 'text-[#757575]'
            }`}
          >
            <div className="relative">
              <Bell className="w-5 h-5 stroke-[1.8]" />
              <span className="absolute -top-1 -right-2 bg-[#EE4D2D] text-white text-[8px] font-bold px-1 rounded-full leading-tight">
                22
              </span>
            </div>
            <span className="text-[10px] font-normal mt-0.5">Alerts</span>
          </button>

          {/* Tab 5: Me */}
          <button
            onClick={() => setActiveTab('me')}
            className={`flex flex-col items-center justify-center py-1 transition-colors cursor-pointer ${
              activeTab === 'me' ? 'text-[#EE4D2D]' : 'text-[#757575]'
            }`}
          >
            <User className="w-5 h-5 stroke-[1.8]" />
            <span className="text-[10px] font-normal mt-0.5">Me</span>
          </button>

        </div>
      </nav>

      {/* ==================== 12. CART SLIDE-OVER ==================== */}
      {isCartOpen && (
        <div className="fixed inset-0 z-50 overflow-hidden bg-slate-900/60 backdrop-blur-xs flex justify-end">
          <div className="w-full max-w-sm bg-white h-full shadow-2xl flex flex-col">
            <div className="p-3 bg-[#EE4D2D] text-white flex items-center justify-between">
              <div className="flex items-center gap-2">
                <ShoppingCart className="w-5 h-5" />
                <h3 className="font-bold text-sm">Hardware Cart ({cart.reduce((s, i) => s + i.quantity, 0)})</h3>
              </div>
              <button onClick={() => setIsCartOpen(false)} className="p-1 hover:bg-white/20 rounded cursor-pointer">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-3 space-y-2.5">
              {cart.length === 0 ? (
                <div className="text-center py-16 text-slate-400 text-xs">
                  Your cart is empty.
                </div>
              ) : (
                cart.map(item => (
                  <div key={item.id} className="flex gap-2 p-2 bg-slate-50 rounded border border-slate-200">
                    <img 
                      src={item.image} 
                      alt={item.name} 
                      className="w-14 h-14 object-cover rounded bg-white shrink-0" 
                      onError={(e) => {
                        e.target.onerror = null;
                        e.target.src = "https://images.pexels.com/photos/175039/pexels-photo-175039.jpeg?auto=compress&cs=tinysrgb&h=650&w=940";
                      }}
                    />
                    <div className="flex-1 min-w-0">
                      <p className="font-bold text-xs text-slate-900 truncate">{item.name}</p>
                      <p className="text-[10px] text-slate-500">Unit: {item.unit}</p>
                      <p className="text-xs text-[#EE4D2D] font-black mt-0.5">₱{item.price.toLocaleString()}</p>
                      <div className="flex items-center justify-between mt-1">
                        <div className="flex items-center border border-slate-200 bg-white rounded text-xs">
                          <button onClick={() => updateCartQty(item.id, -1)} className="px-2 py-0.5 text-slate-600 cursor-pointer">-</button>
                          <span className="px-2 font-bold">{item.quantity}</span>
                          <button onClick={() => updateCartQty(item.id, 1)} className="px-2 py-0.5 text-slate-600 cursor-pointer">+</button>
                        </div>
                        <button onClick={() => removeFromCart(item.id)} className="text-slate-400 hover:text-rose-600 cursor-pointer">
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>

            {cart.length > 0 && (
              <div className="p-3 border-t border-slate-100 bg-slate-50 space-y-2">
                <div className="flex justify-between text-xs text-slate-600">
                  <span>Subtotal</span>
                  <span className="font-black text-[#EE4D2D]">₱{cartSubtotal.toLocaleString()}</span>
                </div>
                <button
                  onClick={() => { setIsCartOpen(false); setActiveTab('checkout'); }}
                  className="w-full bg-[#EE4D2D] text-white py-2.5 rounded font-bold text-xs shadow-sm cursor-pointer"
                >
                  Proceed to Checkout
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ==================== 13. AUTH MODAL ==================== */}
      {authModal && (
        <div className="fixed inset-0 z-50 overflow-hidden bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="w-full max-w-sm bg-white rounded-xl shadow-2xl p-5 border border-slate-200">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="font-bold text-sm text-slate-900">
                {authModal === 'login' ? 'Customer Log In' : 'Create Customer Account'}
              </h3>
              <button onClick={() => setAuthModal(null)} className="text-slate-400 hover:text-slate-600">
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={authModal === 'login' ? handleLoginSubmit : handleRegisterSubmit} className="mt-4 space-y-3">
              {authError && (
                <p className="text-rose-600 text-xs font-bold">{authError}</p>
              )}

              {authModal === 'register' && (
                <div>
                  <label className="block text-[11px] font-bold text-slate-700 mb-1">Full Name</label>
                  <input
                    type="text"
                    required
                    placeholder="Juan Dela Cruz"
                    value={authForm.fullName}
                    onChange={e => setAuthForm({ ...authForm, fullName: e.target.value })}
                    className="w-full px-3 py-1.5 text-xs border border-slate-200 rounded focus:border-[#EE4D2D] focus:outline-none"
                  />
                </div>
              )}

              <div>
                <label className="block text-[11px] font-bold text-slate-700 mb-1">Email or Phone</label>
                <input
                  type="text"
                  required
                  placeholder="email@example.com"
                  value={authForm.email}
                  onChange={e => setAuthForm({ ...authForm, email: e.target.value })}
                  className="w-full px-3 py-1.5 text-xs border border-slate-200 rounded focus:border-[#EE4D2D] focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-700 mb-1">Password</label>
                <input
                  type="password"
                  required
                  placeholder="Password"
                  value={authForm.password}
                  onChange={e => setAuthForm({ ...authForm, password: e.target.value })}
                  className="w-full px-3 py-1.5 text-xs border border-slate-200 rounded focus:border-[#EE4D2D] focus:outline-none"
                />
              </div>

              {authModal === 'register' && (
                <div>
                  <label className="block text-[11px] font-bold text-slate-700 mb-1">Confirm Password</label>
                  <input
                    type="password"
                    required
                    placeholder="Confirm password"
                    value={authForm.confirmPassword}
                    onChange={e => setAuthForm({ ...authForm, confirmPassword: e.target.value })}
                    className="w-full px-3 py-1.5 text-xs border border-slate-200 rounded focus:border-[#EE4D2D] focus:outline-none"
                  />
                </div>
              )}

              <button
                type="submit"
                className="w-full bg-[#EE4D2D] text-white py-2 rounded text-xs font-bold cursor-pointer"
              >
                {authModal === 'login' ? 'Log In' : 'Sign Up'}
              </button>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}

// ==================== EXACT SHOPEE PRODUCT CARD COMPONENT ====================
function ProductCard({ product, onAddToCart, isRightCol = false, isVideoCard = false, storewideDiscount = 0 }) {
  const soldCount = product.reviews ? `${product.reviews}k+` : '3k+';
  const location = isRightCol ? 'San Rafael, Bul...' : 'Bocaue, Bula...';
  const days = isRightCol ? '3-7 Days' : '10-11 Days';

  const itemDisc = Number(product.discount_percent || 0);
  const maxDiscount = Math.max(itemDisc, storewideDiscount);
  const effectivePrice = maxDiscount > 0 ? product.price * (1 - maxDiscount / 100) : product.price;
  const isBulkPack = product.unit && product.unit.includes('100');

  return (
    <div className="bg-white rounded-sm overflow-hidden border border-[#EAEAEA] flex flex-col group relative">
      
      {/* Product Image Box */}
      <div className="relative aspect-square bg-[#F7F7F7] overflow-hidden">
        <img
          src={product.image}
          alt={product.name}
          loading="lazy"
          className="w-full h-full object-cover group-hover:scale-102 transition-transform duration-300"
          onError={(e) => {
            e.target.onerror = null;
            e.target.src = "https://images.pexels.com/photos/175039/pexels-photo-175039.jpeg?auto=compress&cs=tinysrgb&h=650&w=940";
          }}
        />

        {/* Bulk 100-pack Badge */}
        {isBulkPack && (
          <div className="absolute top-1.5 left-1.5 bg-blue-600 text-white text-[8px] font-black px-1.5 py-0.5 rounded shadow-xs">
            PACK OF 100
          </div>
        )}

        {/* Video overlay indicator */}
        {isVideoCard && (
          <div className="absolute top-1.5 left-1.5 bg-black/60 backdrop-blur-xs text-white text-[9px] font-bold px-1.5 py-0.5 rounded-full flex items-center gap-1">
            <span>▶</span> 45.5K
          </div>
        )}

        {/* SpayLater Yellow Overlay Strip on Image bottom (Exact from Shopee Screenshot) */}
        <div className="absolute bottom-0 left-0 right-0 bg-[#FFB800] text-[#D0011B] text-[8px] font-black px-1.5 py-0.5 flex items-center justify-between">
          <span>SPayLater 0% INTEREST</span>
          <span className="text-[7px] text-[#222] font-semibold">{product.unit.toUpperCase()}</span>
        </div>
      </div>

      {/* Product Details Section */}
      <div className="p-2 flex-1 flex flex-col justify-between">
        <div>
          {/* LIVE Red Pill */}
          {product.featured && (
            <span className="bg-[#EE4D2D] text-white text-[8px] font-black px-1 py-0.2 rounded-xs mr-1 uppercase">
              LIVE
            </span>
          )}

          {/* Title - Clean 2-line clamp */}
          <h3 className="text-xs text-[#222222] font-normal leading-[1.3] line-clamp-2">
            {product.name}
          </h3>

          {/* Shopee Badges */}
          <div className="flex flex-wrap items-center gap-1 mt-1.5">
            <span className="border border-[#EE4D2D] text-[#EE4D2D] text-[8px] font-semibold px-1 rounded-xs leading-none py-0.5">
              SPayLater 0%
            </span>
            <span className="bg-[#EE4D2D] text-white text-[8px] font-bold px-1 rounded-xs leading-none py-0.5">
              Sulit Deal
            </span>
            {maxDiscount > 0 && (
              <span className="bg-emerald-600 text-white text-[8px] font-black px-1 rounded-xs leading-none py-0.5">
                -{maxDiscount}%
              </span>
            )}
          </div>
        </div>

        {/* Price & Sold Section */}
        <div className="mt-2">
          <div className="flex items-baseline justify-between">
            <span className="text-[#EE4D2D] font-extrabold text-sm sm:text-base leading-none tracking-tight">
              ₱{Math.floor(effectivePrice).toLocaleString()}
            </span>
            <span className="text-[10px] text-[#757575] font-normal">
              {soldCount} sold
            </span>
          </div>

          {/* Delivery estimate & Location */}
          <div className="flex items-center justify-between mt-1.5 text-[9px] text-[#757575] border-t border-slate-50 pt-1">
            <span className="flex items-center gap-0.5 text-[#00BFA5] font-semibold">
              <Truck className="w-2.5 h-2.5" /> {days}
            </span>
            <span className="truncate max-w-[70px] text-[#757575]">{location}</span>
            <button 
              onClick={() => onAddToCart(product)}
              className="text-[#757575] hover:text-[#EE4D2D] cursor-pointer"
              title="Add to cart"
            >
              <Plus className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>

    </div>
  );
}
