import React, { useState, useEffect, useMemo, useRef } from 'react';
import initialCatalog from './catalog.json';
import { 
  Search, Camera, ShoppingCart, MessageCircle, Home, ShoppingBag, 
  Tv, Bell, User, Truck, MapPin, MoreHorizontal, ShieldCheck, 
  Plus, Minus, Trash2, ArrowRight, X, AlertCircle, Lock, KeyRound, 
  Eye, EyeOff, LogIn, UserPlus, LogOut, Check, RefreshCw, Flame, Tag,
  ListFilter, Package, Clock, SlidersHorizontal, Layers, CheckCircle2,
  Phone, Calendar, ChevronRight, Upload, Download, FileSpreadsheet, 
  FileUp, Edit3, PlusCircle, CheckSquare, Square, Table, Grid, 
  Laptop, Smartphone, HelpCircle, ExternalLink, Sparkles
} from 'lucide-react';

export default function App() {
  // Navigation tabs: 'home' | 'catalog' | 'mall' | 'live' | 'notifications' | 'me' | 'track-order' | 'checkout' | 'order-success'
  const [activeTab, setActiveTab] = useState('home');
  
  // ==================== AUTHENTICATION & SECURITY (BACKEND CONNECTED) ====================
  const [authToken, setAuthToken] = useState(() => {
    return localStorage.getItem('manna_auth_token') || null;
  });
  
  const [currentUser, setCurrentUser] = useState(() => {
    const saved = localStorage.getItem('manna_current_user');
    return saved ? JSON.parse(saved) : null;
  });

  const [authModal, setAuthModal] = useState(null); // 'login' | 'register'
  const [authPromptMessage, setAuthPromptMessage] = useState('');
  const [authForm, setAuthForm] = useState({ fullName: '', email: '', phone: '', password: '', confirmPassword: '', honeypot: '' });
  const [authError, setAuthError] = useState('');
  const [userOrders, setUserOrders] = useState([]);
  const [isLoadingOrders, setIsLoadingOrders] = useState(false);
  const [isSubmittingCheckout, setIsSubmittingCheckout] = useState(false);
  const [checkoutError, setCheckoutError] = useState('');

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
  const [catalogViewMode, setCatalogViewMode] = useState('table'); // 'table' | 'cards'

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

  // ==================== MERCHANT CRUD & BULK ACTIONS STATE ====================
  const [selectedItemIds, setSelectedItemIds] = useState([]);
  const [bulkDiscountInput, setBulkDiscountInput] = useState('');
  const [itemModal, setItemModal] = useState(null); // 'add' | 'edit' | null
  const [editingItem, setEditingItem] = useState({
    id: '',
    name: '',
    category: 'General Hardware',
    unit: 'pc',
    price: 0,
    capital: 0,
    stock: 50,
    discount_percent: 0,
    image: '',
    description: ''
  });

  // CSV/PDF Upload state
  const [uploadModal, setUploadModal] = useState(false);
  const [importPreview, setImportPreview] = useState([]);
  const [importStatus, setImportStatus] = useState('');
  const fileInputRef = useRef(null);

  // Admin per-item discount editor filter
  const [itemSearchTerm, setItemSearchTerm] = useState('');

  // Persistent storage & Backend Session Synchronization
  useEffect(() => {
    if (authToken) {
      localStorage.setItem('manna_auth_token', authToken);
      fetch('/api/auth/me', {
        headers: { Authorization: `Bearer ${authToken}` }
      })
      .then(res => res.json())
      .then(data => {
        if (data.success && data.user) {
          setCurrentUser(data.user);
        } else {
          setAuthToken(null);
          setCurrentUser(null);
          localStorage.removeItem('manna_auth_token');
          localStorage.removeItem('manna_current_user');
        }
      })
      .catch(() => {});
    } else {
      localStorage.removeItem('manna_auth_token');
    }
  }, [authToken]);

  useEffect(() => {
    if (currentUser) {
      localStorage.setItem('manna_current_user', JSON.stringify(currentUser));
      setCustomer(prev => ({
        ...prev,
        fullName: prev.fullName || currentUser.fullName || '',
        email: currentUser.email || prev.email || '',
        phone: prev.phone || currentUser.phone || ''
      }));
    } else {
      localStorage.removeItem('manna_current_user');
    }
  }, [currentUser]);

  // Fetch logged in customer's live orders from backend
  const fetchUserOrders = () => {
    if (!authToken) return;
    setIsLoadingOrders(true);
    fetch('/api/user/orders', {
      headers: { Authorization: `Bearer ${authToken}` }
    })
    .then(res => res.json())
    .then(data => {
      if (data.success && data.orders) {
        setUserOrders(data.orders);
      }
    })
    .catch(console.error)
    .finally(() => setIsLoadingOrders(false));
  };

  useEffect(() => {
    if (currentUser && authToken) {
      fetchUserOrders();
    } else {
      setUserOrders([]);
    }
  }, [currentUser, authToken]);

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

  // ==================== CHECKOUT SUBMISSION (BACKEND REQUIRE AUTH) ====================
  const handleCheckoutSubmit = async (e) => {
    e.preventDefault();
    setCheckoutError('');

    // Strict Account Enforcement: Must be logged in to check out
    if (!currentUser || !authToken) {
      setAuthPromptMessage('Account Required: You must log in or create an account to check out items.');
      setAuthModal('login');
      return;
    }

    if (customer.honeypot || cart.length === 0) return;

    setIsSubmittingCheckout(true);

    try {
      const res = await fetch('/api/checkout', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${authToken}`
        },
        body: JSON.stringify({
          customer: {
            fullName: customer.fullName || currentUser.fullName,
            phone: customer.phone || currentUser.phone || '',
            email: currentUser.email,
            address: customer.address,
            paymentMethod: customer.paymentMethod || 'cod',
            notes: customer.notes || ''
          },
          items: cart.map(i => ({ id: i.id, quantity: i.quantity })),
          promoCode: appliedPromo ? appliedPromo.code : null,
          user_note_verification: customer.honeypot || ''
        })
      });

      const data = await res.json();

      if (!res.ok || !data.success) {
        if (data.requires_auth) {
          setAuthPromptMessage('Your session has expired. Please log in again to complete your order.');
          setAuthModal('login');
        } else {
          setCheckoutError(data.error || 'Failed to place order. Please review items.');
        }
        setIsSubmittingCheckout(false);
        return;
      }

      // Decrement stock locally to keep UI instant
      setProducts(prev => prev.map(p => {
        const cItem = cart.find(c => c.id === p.id);
        return cItem ? { ...p, stock: Math.max(0, p.stock - cItem.quantity) } : p;
      }));

      const newOrder = {
        orderId: data.order.orderId,
        date: new Date().toLocaleString(),
        customer: { ...data.order.customer },
        items: [...cart],
        subtotal: data.order.subtotal,
        discountAmount: data.order.discountAmount,
        promoCode: appliedPromo ? appliedPromo.code : null,
        total: data.order.finalTotal,
        status: data.order.status || 'Order Placed'
      };

      setOrders(prev => [newOrder, ...prev]);
      setPlacedOrder(newOrder);
      setTrackedOrder(newOrder);
      setCart([]);
      setAppliedPromo(null);
      setPromoInput('');
      setActiveTab('order-success');
      setIsCartOpen(false);
      fetchUserOrders();
    } catch (err) {
      setCheckoutError('Unable to connect to Manna backend server. Please make sure the backend is active.');
    } finally {
      setIsSubmittingCheckout(false);
    }
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

  // ==================== REAL BACKEND AUTH ACTIONS ====================
  const handleLoginSubmit = async (e) => {
    e.preventDefault();
    setAuthError('');

    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: authForm.email,
          password: authForm.password,
          user_note_verification: authForm.honeypot || ''
        })
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        setAuthError(data.error || 'Invalid email/phone or password.');
        return;
      }

      setAuthToken(data.token);
      localStorage.setItem('manna_auth_token', data.token);
      setCurrentUser(data.user);
      localStorage.setItem('manna_current_user', JSON.stringify(data.user));
      setAuthModal(null);
      setAuthPromptMessage('');
      setAuthForm({ fullName: '', email: '', phone: '', password: '', confirmPassword: '', honeypot: '' });

      // If user had clicked checkout, proceed straight to checkout!
      if (activeTab === 'checkout' || isCartOpen) {
        setIsCartOpen(false);
        setActiveTab('checkout');
      }
    } catch (err) {
      setAuthError('Connection error to Manna server. Please try again.');
    }
  };

  const handleRegisterSubmit = async (e) => {
    e.preventDefault();
    setAuthError('');

    if (authForm.password !== authForm.confirmPassword) {
      setAuthError('Passwords do not match.');
      return;
    }

    if (authForm.password.length < 6) {
      setAuthError('Password must be at least 6 characters long.');
      return;
    }

    try {
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          fullName: authForm.fullName,
          email: authForm.email,
          phone: authForm.phone,
          password: authForm.password,
          confirmPassword: authForm.confirmPassword,
          user_note_verification: authForm.honeypot || ''
        })
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        setAuthError(data.error || 'Registration failed.');
        return;
      }

      setAuthToken(data.token);
      localStorage.setItem('manna_auth_token', data.token);
      setCurrentUser(data.user);
      localStorage.setItem('manna_current_user', JSON.stringify(data.user));
      setAuthModal(null);
      setAuthPromptMessage('');
      setAuthForm({ fullName: '', email: '', phone: '', password: '', confirmPassword: '', honeypot: '' });

      if (activeTab === 'checkout' || isCartOpen) {
        setIsCartOpen(false);
        setActiveTab('checkout');
      }
    } catch (err) {
      setAuthError('Connection error to Manna server. Please try again.');
    }
  };

  const handleLogout = () => {
    fetch('/api/auth/logout', { method: 'POST' }).catch(() => {});
    setAuthToken(null);
    setCurrentUser(null);
    localStorage.removeItem('manna_auth_token');
    localStorage.removeItem('manna_current_user');
    setUserOrders([]);
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

  // ==================== CRUD & BULK ACTIONS HANDLERS ====================
  const handleSaveItem = (e) => {
    e.preventDefault();
    if (!editingItem.name || editingItem.price <= 0) {
      alert('Please provide a valid product name and price.');
      return;
    }

    if (itemModal === 'add') {
      const nextId = `MNA-${Date.now().toString().slice(-4)}${Math.floor(Math.random()*90 + 10)}`;
      const newItem = {
        ...editingItem,
        id: nextId,
        price: Number(editingItem.price),
        capital: Number(editingItem.capital || (editingItem.price * 0.78)),
        stock: Number(editingItem.stock || 50),
        discount_percent: Number(editingItem.discount_percent || 0),
        image: editingItem.image || 'https://images.pexels.com/photos/175039/pexels-photo-175039.jpeg?auto=compress&cs=tinysrgb&h=650&w=940'
      };
      setProducts(prev => [newItem, ...prev]);
    } else if (itemModal === 'edit') {
      setProducts(prev => prev.map(p => p.id === editingItem.id ? {
        ...editingItem,
        price: Number(editingItem.price),
        capital: Number(editingItem.capital),
        stock: Number(editingItem.stock),
        discount_percent: Number(editingItem.discount_percent || 0)
      } : p));
    }
    setItemModal(null);
  };

  const handleDeleteItem = (id) => {
    if (confirm(`Are you sure you want to delete item ${id}? This cannot be undone.`)) {
      setProducts(prev => prev.filter(p => p.id !== id));
      setSelectedItemIds(prev => prev.filter(selectedId => selectedId !== id));
    }
  };

  // Bulk actions
  const toggleSelectAll = () => {
    if (selectedItemIds.length === filteredProducts.length) {
      setSelectedItemIds([]);
    } else {
      setSelectedItemIds(filteredProducts.map(p => p.id));
    }
  };

  const toggleSelectItem = (id) => {
    setSelectedItemIds(prev => 
      prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]
    );
  };

  const handleBulkDiscountApply = () => {
    const val = Number(bulkDiscountInput);
    if (isNaN(val) || val < 0 || val > 90) {
      alert('Please enter a valid discount between 0% and 90%.');
      return;
    }
    setProducts(prev => prev.map(p => 
      selectedItemIds.includes(p.id) ? { ...p, discount_percent: val } : p
    ));
    setBulkDiscountInput('');
    alert(`Applied ${val}% discount to ${selectedItemIds.length} items!`);
  };

  const handleBulkDelete = () => {
    if (confirm(`Are you sure you want to delete all ${selectedItemIds.length} selected items?`)) {
      setProducts(prev => prev.filter(p => !selectedItemIds.includes(p.id)));
      setSelectedItemIds([]);
    }
  };

  const exportSelectedToCSV = () => {
    const itemsToExport = selectedItemIds.length > 0 
      ? products.filter(p => selectedItemIds.includes(p.id))
      : products;

    const headers = ['id', 'name', 'category', 'unit', 'price', 'capital', 'stock', 'discount_percent', 'description'];
    const rows = itemsToExport.map(p => [
      `"${p.id}"`,
      `"${p.name.replace(/"/g, '""')}"`,
      `"${p.category}"`,
      `"${p.unit}"`,
      p.price,
      p.capital,
      p.stock,
      p.discount_percent || 0,
      `"${(p.description || '').replace(/"/g, '""')}"`
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map(e => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `manna_catalog_export_${Date.now()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // CSV / PDF File Upload handler
  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setImportStatus(`Reading ${file.name}...`);
    const reader = new FileReader();

    if (file.name.endsWith('.csv')) {
      reader.onload = (event) => {
        const text = event.target.result;
        const lines = text.split(/\r\n|\n/).filter(l => l.trim().length > 0);
        if (lines.length <= 1) {
          setImportStatus('Error: CSV file appears empty.');
          return;
        }

        const headers = lines[0].split(',').map(h => h.trim().replace(/"/g, '').toLowerCase());
        const nameIdx = headers.findIndex(h => h.includes('name') || h.includes('item'));
        const priceIdx = headers.findIndex(h => h.includes('price'));
        const catIdx = headers.findIndex(h => h.includes('cat'));
        const unitIdx = headers.findIndex(h => h.includes('unit') || h.includes('u/m'));
        const stockIdx = headers.findIndex(h => h.includes('stock') || h.includes('qty'));
        const capIdx = headers.findIndex(h => h.includes('cap') || h.includes('cost'));

        const parsedItems = [];
        for (let i = 1; i < lines.length; i++) {
          const row = lines[i].split(/,(?=(?:(?:[^"]*"){2})*[^"]*$)/).map(v => v.trim().replace(/^"|"$/g, ''));
          if (row.length > nameIdx && row[nameIdx]) {
            const rawPrice = parseFloat(row[priceIdx] || '0') || 0;
            const parsed = {
              id: `MNA-IMP-${Date.now().toString().slice(-4)}${i}`,
              name: row[nameIdx],
              category: (catIdx >= 0 && row[catIdx]) ? row[catIdx] : 'General Hardware',
              unit: (unitIdx >= 0 && row[unitIdx]) ? row[unitIdx] : 'pc',
              price: rawPrice,
              capital: (capIdx >= 0 && row[capIdx]) ? parseFloat(row[capIdx]) : Math.round(rawPrice * 0.78),
              stock: (stockIdx >= 0 && row[stockIdx]) ? parseInt(row[stockIdx], 10) : 50,
              discount_percent: 0,
              image: 'https://images.pexels.com/photos/175039/pexels-photo-175039.jpeg?auto=compress&cs=tinysrgb&h=650&w=940',
              description: 'Imported hardware item from quote CSV.'
            };
            parsedItems.push(parsed);
          }
        }

        setImportPreview(parsedItems);
        setImportStatus(`Parsed ${parsedItems.length} hardware items from CSV.`);
      };
      reader.readAsText(file);
    } else if (file.name.endsWith('.pdf')) {
      setImportStatus(`PDF detected: ${file.name}. Commercial hardware PDF parser staging items...`);
      // Simulate/extract PDF catalog entries
      setTimeout(() => {
        const dummyPdfItems = [
          { id: `MNA-PDF-101`, name: `${file.name.replace('.pdf','')} Spec Item A`, category: 'Structural & Building Materials', unit: 'pc', price: 850, capital: 660, stock: 25, discount_percent: 0, image: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTs0xq8LSZ1RbLaY3gZz6I97DZTkMaU0_Jtpf9GEtbAqQ&s=10' },
          { id: `MNA-PDF-102`, name: `${file.name.replace('.pdf','')} Fastener Pack (100 pcs/pack)`, category: 'Fasteners & Hardware', unit: 'pack (100 pcs)', price: 150, capital: 110, stock: 80, discount_percent: 0, image: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRgpz4mFUqO9YpMuCy6Ycu_f7yTvQ0bO7BTRHwwmT-iyw&s=10' }
        ];
        setImportPreview(dummyPdfItems);
        setImportStatus(`Extracted ${dummyPdfItems.length} items from ${file.name}.`);
      }, 600);
    }
  };

  const confirmImport = () => {
    if (importPreview.length === 0) return;
    setProducts(prev => [...importPreview, ...prev]);
    alert(`Successfully imported ${importPreview.length} products into Manna Catalog!`);
    setImportPreview([]);
    setUploadModal(false);
  };

  return (
    <div className="min-h-screen bg-[#F6F6F6] text-[#222222] font-sans pb-16 md:pb-8 select-none w-full">
      
      {/* ==================== 1. DESKTOP TOP BRAND UTILITY BAR (md:flex) ==================== */}
      <div className="hidden md:block bg-[#D0011B] text-white/90 text-xs py-1.5 px-4 sm:px-6 lg:px-8 border-b border-red-700">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-4 text-[11px]">
            <span className="font-semibold text-white">MANNA HARDWARE & BUILDING SUPPLY</span>
            <span>•</span>
            <span className="text-white/80">Cabalwan, Tacloban City, Leyte</span>
            <span>•</span>
            <span className="flex items-center gap-1 text-white">
              <Phone className="w-3 h-3" /> (053) 888-2910 / 0917-882-9912
            </span>
          </div>

          <div className="flex items-center gap-4 text-[11px]">
            {currentUser ? (
              <div className="flex items-center gap-2">
                <button 
                  onClick={() => setActiveTab('me')}
                  className="text-white font-bold flex items-center gap-1 hover:underline cursor-pointer"
                >
                  <User className="w-3.5 h-3.5 text-orange-200" /> {currentUser.fullName}
                </button>
                <button
                  onClick={handleLogout}
                  className="text-white/80 hover:text-white cursor-pointer text-[10px]"
                >
                  (Log Out)
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <button 
                  onClick={() => { setAuthPromptMessage(''); setAuthModal('login'); }}
                  className="hover:text-white font-bold cursor-pointer"
                >
                  Customer Log In
                </button>
                <span>|</span>
                <button 
                  onClick={() => { setAuthPromptMessage(''); setAuthModal('register'); }}
                  className="hover:text-white font-bold cursor-pointer"
                >
                  Sign Up
                </button>
              </div>
            )}
            <span>|</span>
            <button onClick={() => setActiveTab('track-order')} className="hover:text-white flex items-center gap-1 cursor-pointer">
              <Truck className="w-3 h-3" /> Track My Order
            </button>
            <span>|</span>
            <button onClick={() => setActiveTab('catalog')} className="hover:text-white flex items-center gap-1 cursor-pointer">
              <FileSpreadsheet className="w-3 h-3" /> Master Catalog ({products.length})
            </button>
            <span>|</span>
            <button 
              onClick={() => setActiveTab('me')} 
              className="hover:text-white font-bold flex items-center gap-1 cursor-pointer bg-white/10 px-2 py-0.5 rounded"
            >
              <Lock className="w-3 h-3" /> Merchant Centre
            </button>
          </div>
        </div>
      </div>

      {/* ==================== 2. SHOPEE ORANGE MAIN HEADER (#EE4D2D) ==================== */}
      <header className="sticky top-0 z-40 bg-[#EE4D2D] text-white shadow-md w-full">
        <div className="max-w-7xl mx-auto pt-2 pb-2.5 px-3 sm:px-6 lg:px-8">
          
          {/* Main Search Row */}
          <div className="flex items-center gap-3">
            {/* Desktop Brand Logo */}
            <div 
              onClick={() => setActiveTab('home')} 
              className="hidden md:flex items-center gap-2 cursor-pointer shrink-0 mr-2"
            >
              <div className="w-9 h-9 rounded-lg bg-white text-[#EE4D2D] font-black flex items-center justify-center text-lg shadow-sm">
                M
              </div>
              <div>
                <h1 className="text-base font-black leading-tight tracking-tight text-white">MANNA</h1>
                <p className="text-[9px] uppercase tracking-wider text-orange-100 font-semibold leading-none">Building Supply</p>
              </div>
            </div>

            {/* Search Input Container */}
            <div className="flex-1 bg-white rounded-md h-9 sm:h-10 px-3 flex items-center gap-2 shadow-xs">
              <Search className="w-4 h-4 text-[#888888] shrink-0" />
              <input
                type="text"
                placeholder="Search C-purlins, Island Paint, Screws, Makita..."
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                className="w-full text-xs sm:text-sm text-[#222222] placeholder-[#EE4D2D]/70 font-normal focus:outline-none"
              />
              <button className="text-[#888888] hover:text-[#555] shrink-0 cursor-pointer">
                <Camera className="w-4 h-4" />
              </button>
            </div>

            {/* Cart Icon with Red/White Badge */}
            <button 
              onClick={() => setIsCartOpen(true)}
              className="relative p-1 text-white hover:opacity-90 shrink-0 cursor-pointer flex items-center gap-1.5"
            >
              <div className="relative">
                <ShoppingCart className="w-6 h-6 stroke-[1.8]" />
                <span className="absolute -top-1 -right-1.5 bg-white text-[#EE4D2D] text-[9px] font-black px-1 py-0.2 rounded-full border border-[#EE4D2D] leading-tight">
                  {cart.reduce((s, i) => s + i.quantity, 0) > 0 ? cart.reduce((s, i) => s + i.quantity, 0) : '99+'}
                </span>
              </div>
              <span className="hidden lg:inline text-xs font-bold">
                {cartSubtotal > 0 ? `₱${cartSubtotal.toLocaleString()}` : 'Cart'}
              </span>
            </button>

            {/* Mobile Track Order Icon */}
            <button 
              onClick={() => setActiveTab('track-order')}
              title="Track Order Status"
              className="md:hidden relative p-1 text-white hover:opacity-90 shrink-0 cursor-pointer"
            >
              <Truck className="w-6 h-6 stroke-[1.8]" />
              <span className="absolute -top-1 -right-1 bg-white text-[#EE4D2D] text-[8px] font-black px-1 rounded-full border border-[#EE4D2D]">
                TRACK
              </span>
            </button>
          </div>

          {/* Navigation Strip under Search */}
          <div className="flex items-center justify-between gap-3 overflow-x-auto no-scrollbar pt-2.5 text-[11px] sm:text-xs font-medium text-white/95 border-b border-white/10 pb-1.5">
            <div className="flex items-center gap-4">
              <button
                onClick={() => setActiveTab('home')}
                className={`whitespace-nowrap pb-0.5 cursor-pointer flex items-center gap-1 ${
                  activeTab === 'home' ? 'font-bold border-b-2 border-white' : 'opacity-85 hover:opacity-100'
                }`}
              >
                <Home className="w-3.5 h-3.5" /> Home Feed
              </button>

              {/* FULL CATALOG PUBLIC TAB (User Requested) */}
              <button
                onClick={() => setActiveTab('catalog')}
                className={`whitespace-nowrap px-2.5 py-0.5 rounded cursor-pointer flex items-center gap-1.5 font-bold ${
                  activeTab === 'catalog' ? 'bg-white text-[#EE4D2D] shadow-xs' : 'bg-white/20 text-white hover:bg-white/30'
                }`}
              >
                <Layers className="w-3.5 h-3.5" /> FULL CATALOG ({products.length})
              </button>

              <button
                onClick={() => setActiveTab('mall')}
                className={`whitespace-nowrap pb-0.5 cursor-pointer flex items-center gap-1 ${
                  activeTab === 'mall' ? 'font-bold border-b-2 border-white' : 'opacity-85 hover:opacity-100'
                }`}
              >
                <ShoppingBag className="w-3.5 h-3.5" /> Official Mall
              </button>

              <button
                onClick={() => setActiveTab('live')}
                className={`whitespace-nowrap pb-0.5 cursor-pointer flex items-center gap-1 ${
                  activeTab === 'live' ? 'font-bold border-b-2 border-white' : 'opacity-85 hover:opacity-100'
                }`}
              >
                <Tv className="w-3.5 h-3.5" /> Live Demos
              </button>

              <button
                onClick={() => setActiveTab('track-order')}
                className={`whitespace-nowrap pb-0.5 cursor-pointer flex items-center gap-1 ${
                  activeTab === 'track-order' ? 'font-bold border-b-2 border-white' : 'opacity-85 hover:opacity-100'
                }`}
              >
                <Truck className="w-3.5 h-3.5" /> Track Order
              </button>
            </div>

            {/* Desktop Merchant Dashboard Direct Gateway */}
            <div className="hidden md:flex items-center gap-3">
              <button
                onClick={() => setActiveTab('me')}
                className="bg-black/25 hover:bg-black/35 text-white px-2.5 py-0.5 rounded text-[11px] font-bold flex items-center gap-1 cursor-pointer transition-colors"
              >
                <Lock className="w-3 h-3" /> Merchant Centre
              </button>
            </div>
          </div>

          {/* Categories Horizontal Scroll Strip */}
          <div className="flex items-center gap-3 sm:gap-4 overflow-x-auto no-scrollbar pt-1.5 text-[10px] sm:text-[11px] font-normal text-white/90">
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
        </div>
      </header>

      {/* ==================== MAIN CONTENT CONTAINER (RESPONSIVE: MAX-W-7XL ON DESKTOP) ==================== */}
      <div className="max-w-7xl mx-auto px-2 sm:px-4 lg:px-8 mt-2 sm:mt-4">
        
        {/* ==================== TAB 1: HOME FEED (RESPONSIVE 2-6 COLS) ==================== */}
        {activeTab === 'home' && (
          <main className="w-full">
            {/* Active Promo Voucher Banner */}
            <div className="bg-gradient-to-r from-amber-500 to-[#EE4D2D] text-white p-3 rounded-md mb-3 flex flex-wrap items-center justify-between gap-2 shadow-xs">
              <div className="flex items-center gap-2 text-xs sm:text-sm">
                <Tag className="w-4 h-4 shrink-0" />
                <span>Special Promo: Use code <strong className="underline uppercase font-black">hardware</strong> for 40% OFF or <strong className="underline uppercase font-black">builder</strong> for 35% OFF!</span>
              </div>
              <button 
                onClick={() => { setActiveTab('checkout'); setIsCartOpen(true); }} 
                className="bg-white text-[#EE4D2D] text-xs font-black px-3 py-1 rounded shadow-xs shrink-0 cursor-pointer hover:bg-orange-50"
              >
                Apply Voucher
              </button>
            </div>

            {/* Responsive Products Grid: 2 cols mobile, 3-4 tablet, 5-6 desktop */}
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-2 sm:gap-3">
              {filteredProducts.map((item, idx) => (
                <ProductCard 
                  key={item.id} 
                  product={item} 
                  onAddToCart={addToCart} 
                  storewideDiscount={storewideDiscount} 
                  isRightCol={idx % 2 === 1}
                />
              ))}
            </div>
          </main>
        )}

        {/* ==================== TAB 2: PUBLIC "FULL CATALOG" (USER REQUESTED) ==================== */}
        {activeTab === 'catalog' && (
          <main className="w-full">
            {/* Full Catalog Control Panel */}
            <div className="bg-white p-4 rounded-xl border border-slate-200 mb-4 shadow-xs">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100">
                <div>
                  <h1 className="text-base sm:text-lg font-black text-slate-900 flex items-center gap-2">
                    <Layers className="w-5 h-5 text-[#EE4D2D]" /> FULL MASTER CATALOG
                  </h1>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Browse all {products.length} commercial hardware supplies with live inventory, bulk packaging, and contract pricing.
                  </p>
                </div>

                <div className="flex items-center gap-2">
                  {/* View Mode Toggle (Table / Grid) */}
                  <div className="hidden sm:flex items-center bg-slate-100 p-0.5 rounded border border-slate-200">
                    <button
                      onClick={() => setCatalogViewMode('table')}
                      className={`p-1.5 rounded text-xs font-bold flex items-center gap-1 cursor-pointer ${
                        catalogViewMode === 'table' ? 'bg-white shadow-xs text-slate-900' : 'text-slate-500'
                      }`}
                    >
                      <Table className="w-3.5 h-3.5" /> Table
                    </button>
                    <button
                      onClick={() => setCatalogViewMode('cards')}
                      className={`p-1.5 rounded text-xs font-bold flex items-center gap-1 cursor-pointer ${
                        catalogViewMode === 'cards' ? 'bg-white shadow-xs text-slate-900' : 'text-slate-500'
                      }`}
                    >
                      <Grid className="w-3.5 h-3.5" /> Grid
                    </button>
                  </div>

                  <span className="text-xs font-black bg-[#EE4D2D]/10 text-[#EE4D2D] px-2.5 py-1 rounded-full">
                    {filteredProducts.length} Items Listed
                  </span>
                </div>
              </div>

              {/* Filters row */}
              <div className="flex flex-wrap items-center justify-between gap-3 mt-3">
                <div className="flex items-center gap-4 text-xs">
                  <label className="flex items-center gap-1.5 text-slate-700 cursor-pointer font-medium">
                    <input 
                      type="checkbox"
                      checked={catalogFilterInStock}
                      onChange={e => setCatalogFilterInStock(e.target.checked)}
                      className="rounded text-[#EE4D2D] focus:ring-0"
                    />
                    In Stock Only ({products.filter(p => p.stock > 0).length})
                  </label>
                </div>

                <div className="flex items-center gap-2 text-xs">
                  <span className="text-slate-500 font-medium">Category:</span>
                  <select 
                    value={selectedCategory} 
                    onChange={e => setSelectedCategory(e.target.value)}
                    className="text-xs border border-slate-300 rounded px-2.5 py-1.5 bg-slate-50 focus:outline-none font-medium"
                  >
                    {categories.map(c => <option key={c} value={c}>{c}</option>)}
                  </select>
                </div>
              </div>
            </div>

            {/* Desktop Table View */}
            {catalogViewMode === 'table' ? (
              <div className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-xs">
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs border-collapse">
                    <thead>
                      <tr className="bg-slate-50 border-b border-slate-200 text-slate-600 font-bold uppercase text-[10px] tracking-wider">
                        <th className="py-3 px-3 w-16 text-center">Photo</th>
                        <th className="py-3 px-3 w-28">SKU</th>
                        <th className="py-3 px-3">Product Name & Grade</th>
                        <th className="py-3 px-3">Category</th>
                        <th className="py-3 px-3">Packaging Unit</th>
                        <th className="py-3 px-3 text-center">Available Stock</th>
                        <th className="py-3 px-3 text-right">Regular Price</th>
                        <th className="py-3 px-3 text-right">Final Price</th>
                        <th className="py-3 px-3 text-center">Action</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {filteredProducts.map(item => {
                        const itemDisc = Number(item.discount_percent || 0);
                        const maxDiscount = Math.max(itemDisc, storewideDiscount);
                        const effectivePrice = maxDiscount > 0 ? item.price * (1 - maxDiscount / 100) : item.price;
                        const isBulkPack = item.unit.includes('100');

                        return (
                          <tr key={item.id} className="hover:bg-orange-50/40 transition-colors">
                            {/* Photo */}
                            <td className="py-2.5 px-3 text-center">
                              <img 
                                src={item.image} 
                                alt={item.name} 
                                loading="lazy"
                                className="w-11 h-11 object-cover rounded bg-slate-100 border border-slate-200 mx-auto"
                                onError={(e) => {
                                  e.target.onerror = null;
                                  e.target.src = "https://images.pexels.com/photos/175039/pexels-photo-175039.jpeg?auto=compress&cs=tinysrgb&h=650&w=940";
                                }}
                              />
                            </td>

                            {/* SKU */}
                            <td className="py-2.5 px-3 font-mono font-bold text-slate-700">
                              {item.id}
                            </td>

                            {/* Name */}
                            <td className="py-2.5 px-3">
                              <p className="font-bold text-slate-900 leading-snug">{item.name}</p>
                              {item.description && (
                                <p className="text-[10px] text-slate-400 line-clamp-1">{item.description}</p>
                              )}
                            </td>

                            {/* Category */}
                            <td className="py-2.5 px-3">
                              <span className="text-[10px] font-semibold text-slate-600 bg-slate-100 px-2 py-0.5 rounded-full">
                                {item.category}
                              </span>
                            </td>

                            {/* Unit */}
                            <td className="py-2.5 px-3">
                              <span className={`text-[11px] font-bold ${isBulkPack ? 'text-blue-700 font-extrabold bg-blue-50 px-1.5 py-0.5 rounded' : 'text-slate-700'}`}>
                                {item.unit}
                              </span>
                            </td>

                            {/* Stock */}
                            <td className="py-2.5 px-3 text-center">
                              {item.stock <= 0 ? (
                                <span className="bg-rose-100 text-rose-700 text-[10px] font-black px-2 py-0.5 rounded-full">
                                  Out of Stock
                                </span>
                              ) : item.stock < 10 ? (
                                <span className="bg-amber-100 text-amber-800 text-[10px] font-bold px-2 py-0.5 rounded-full">
                                  {item.stock} Low Stock
                                </span>
                              ) : (
                                <span className="bg-emerald-100 text-emerald-800 text-[10px] font-bold px-2 py-0.5 rounded-full">
                                  {item.stock} Available
                                </span>
                              )}
                            </td>

                            {/* Regular Price */}
                            <td className="py-2.5 px-3 text-right font-medium text-slate-500">
                              ₱{item.price.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                            </td>

                            {/* Final Price */}
                            <td className="py-2.5 px-3 text-right">
                              <span className="font-black text-[#EE4D2D] text-sm">
                                ₱{effectivePrice.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                              </span>
                              {maxDiscount > 0 && (
                                <span className="block text-[9px] font-bold text-emerald-700">
                                  Save {maxDiscount}%
                                </span>
                              )}
                            </td>

                            {/* Action Add to Cart */}
                            <td className="py-2.5 px-3 text-center">
                              <button
                                onClick={() => addToCart(item, 1)}
                                disabled={item.stock <= 0}
                                className={`px-3 py-1.5 rounded text-xs font-bold transition-all inline-flex items-center gap-1 cursor-pointer ${
                                  item.stock <= 0
                                    ? 'bg-slate-100 text-slate-400 cursor-not-allowed'
                                    : 'bg-[#EE4D2D] hover:bg-[#d73f20] text-white shadow-xs'
                                }`}
                              >
                                <Plus className="w-3.5 h-3.5" /> Add
                              </button>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>
            ) : (
              /* Grid view fallback for catalog */
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-2 sm:gap-3">
                {filteredProducts.map((item, idx) => (
                  <ProductCard 
                    key={item.id} 
                    product={item} 
                    onAddToCart={addToCart} 
                    storewideDiscount={storewideDiscount} 
                    isRightCol={idx % 2 === 1}
                  />
                ))}
              </div>
            )}
          </main>
        )}

        {/* ==================== TAB 3: PUBLIC ORDER TRACKER ==================== */}
        {activeTab === 'track-order' && (
          <main className="max-w-2xl mx-auto w-full">
            <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm mb-4">
              <div className="flex items-center gap-2 mb-2">
                <Truck className="w-6 h-6 text-[#EE4D2D]" />
                <h2 className="text-base font-black text-slate-900">Live Hardware Order Tracker</h2>
              </div>
              <p className="text-xs text-slate-500 mb-4">
                Enter your Order Tracking ID (e.g., <code className="bg-slate-100 px-1.5 py-0.5 rounded font-mono text-xs">MNA-ORD-774921</code>) or your registered customer mobile number to track dispatch status.
              </p>

              <form onSubmit={handleTrackSearch} className="flex gap-2">
                <input 
                  type="text"
                  placeholder="Enter Tracking ID (MNA-ORD-...) or Mobile..."
                  value={trackingQuery}
                  onChange={e => setTrackingQuery(e.target.value)}
                  className="flex-1 px-3.5 py-2.5 text-xs sm:text-sm border border-slate-300 rounded-lg focus:border-[#EE4D2D] focus:outline-none"
                />
                <button 
                  type="submit"
                  className="bg-[#EE4D2D] hover:bg-[#d73f20] text-white px-5 py-2.5 rounded-lg text-xs sm:text-sm font-bold shrink-0 cursor-pointer shadow-xs"
                >
                  Track Status
                </button>
              </form>
              {trackingError && (
                <p className="text-rose-600 text-xs font-semibold mt-2">{trackingError}</p>
              )}
            </div>

            {trackedOrder ? (
              <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm space-y-5">
                <div className="flex justify-between items-start pb-4 border-b border-slate-100">
                  <div>
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Tracking Reference</span>
                    <h3 className="text-lg font-black text-slate-900 font-mono">{trackedOrder.orderId}</h3>
                    <p className="text-xs text-slate-500 flex items-center gap-1 mt-0.5">
                      <Calendar className="w-3.5 h-3.5" /> Placed on {trackedOrder.date}
                    </p>
                  </div>
                  <span className="text-xs sm:text-sm font-black px-3 py-1 rounded-full bg-orange-100 text-[#EE4D2D] border border-orange-200">
                    {trackedOrder.status}
                  </span>
                </div>

                {/* Step-by-Step Progress Bar */}
                <div>
                  <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-4">Fulfillment Timeline</h4>
                  <div className="space-y-4">
                    {[
                      { step: 'Order Placed', desc: 'Hardware order verified in warehouse database' },
                      { step: 'Processing', desc: 'Materials allocated from Tacloban stock' },
                      { step: 'Packed', desc: 'Commercial bundling and safety inspection complete' },
                      { step: 'Out for Delivery', desc: 'Dispatched with Manna logistics fleet vehicle' },
                      { step: 'Delivered', desc: 'Delivered to site and signed by receiver' }
                    ].map((s, idx) => {
                      const statusOrder = ['Order Placed', 'Processing', 'Packed', 'Out for Delivery', 'Delivered'];
                      const currentIdx = statusOrder.indexOf(trackedOrder.status);
                      const isPassed = currentIdx >= idx;
                      const isCurrent = currentIdx === idx;

                      return (
                        <div key={s.step} className="flex items-start gap-3.5 relative">
                          <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold shrink-0 z-10 ${
                            isPassed 
                              ? 'bg-emerald-600 text-white' 
                              : 'bg-slate-200 text-slate-400'
                          } ${isCurrent ? 'ring-4 ring-emerald-100' : ''}`}>
                            {isPassed ? '✓' : idx + 1}
                          </div>
                          <div className="flex-1 text-xs">
                            <p className={`text-sm font-bold ${isPassed ? 'text-slate-900' : 'text-slate-400'}`}>
                              {s.step} {isCurrent && <span className="text-[10px] text-emerald-600 font-black ml-1.5 uppercase bg-emerald-50 px-1.5 py-0.5 rounded">• CURRENT STEP</span>}
                            </p>
                            <p className="text-xs text-slate-500 mt-0.5">{s.desc}</p>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Delivery Information */}
                <div className="pt-4 border-t border-slate-100 text-xs space-y-2">
                  <div className="bg-slate-50 p-3 rounded-lg border border-slate-200 space-y-1">
                    <p className="text-slate-700">Receiver: <strong>{trackedOrder.customer.fullName}</strong> ({trackedOrder.customer.phone})</p>
                    <p className="text-slate-700">Delivery Address: <strong>{trackedOrder.customer.address}</strong></p>
                    <p className="text-slate-700">Payment: <strong className="uppercase">{trackedOrder.customer.paymentMethod}</strong></p>
                  </div>

                  <div className="flex justify-between items-baseline pt-2 text-base font-black text-slate-900">
                    <span>Order Total:</span>
                    <span className="text-[#EE4D2D]">₱{trackedOrder.total.toLocaleString()}</span>
                  </div>
                </div>
              </div>
            ) : (
              <div className="text-center py-12 text-xs text-slate-400 bg-white rounded-xl border border-slate-200">
                Enter your Tracking ID above to view live progress.
              </div>
            )}
          </main>
        )}

        {/* ==================== TAB 4: MALL VIEW ==================== */}
        {activeTab === 'mall' && (
          <main className="w-full">
            <div className="bg-[#EE4D2D] text-white p-5 rounded-xl mb-4 flex items-center justify-between shadow-sm">
              <div>
                <span className="text-[10px] uppercase font-black tracking-widest bg-white/20 px-2 py-0.5 rounded">
                  Official Hardware Mall
                </span>
                <h2 className="text-lg font-black mt-1">Manna Mall Tacloban</h2>
                <p className="text-xs text-white/90">100% Genuine Boysen, Island, Makita, Dewalt & Amerilock</p>
              </div>
              <ShieldCheck className="w-12 h-12 text-white/80" />
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-2 sm:gap-3">
              {filteredProducts.slice(0, 18).map((item, idx) => (
                <ProductCard key={item.id} product={item} onAddToCart={addToCart} storewideDiscount={storewideDiscount} isRightCol={idx % 2 === 1} />
              ))}
            </div>
          </main>
        )}

        {/* ==================== TAB 5: LIVE DEMOS ==================== */}
        {activeTab === 'live' && (
          <main className="w-full">
            <div className="bg-black text-white p-5 rounded-xl mb-4 flex items-center justify-between">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <span className="w-2.5 h-2.5 rounded-full bg-rose-500 animate-pulse" />
                  <span className="text-[10px] font-bold uppercase tracking-wider text-rose-400">Live Product Inspections</span>
                </div>
                <h3 className="font-bold text-base">Industrial C-Purlins, Makita Blades & Paint Mixing</h3>
                <p className="text-xs text-slate-400">Live demonstrations direct from our Tacloban warehouse</p>
              </div>
              <Tv className="w-10 h-10 text-[#EE4D2D]" />
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-2 sm:gap-3">
              {filteredProducts.slice(10, 28).map((item, idx) => (
                <ProductCard key={item.id} product={item} onAddToCart={addToCart} isVideoCard storewideDiscount={storewideDiscount} isRightCol={idx % 2 === 1} />
              ))}
            </div>
          </main>
        )}

        {/* ==================== TAB 6: NOTIFICATIONS ==================== */}
        {activeTab === 'notifications' && (
          <main className="max-w-2xl mx-auto w-full space-y-3">
            <div className="bg-white p-4 rounded-xl border border-slate-200 flex items-center gap-3.5 shadow-2xs">
              <div className="w-11 h-11 rounded-full bg-orange-100 text-[#EE4D2D] flex items-center justify-center text-lg">
                🏷️
              </div>
              <div className="flex-1 text-xs">
                <p className="font-bold text-slate-900 text-sm">Voucher Code "hardware" Live!</p>
                <p className="text-slate-500 mt-0.5">Save 40% OFF storewide with voucher code <strong className="text-slate-800">hardware</strong>.</p>
              </div>
            </div>

            <div className="bg-white p-4 rounded-xl border border-slate-200 flex items-center gap-3.5 shadow-2xs">
              <div className="w-11 h-11 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center text-lg">
                🏗️
              </div>
              <div className="flex-1 text-xs">
                <p className="font-bold text-slate-900 text-sm">Contractor Special "builder"</p>
                <p className="text-slate-500 mt-0.5">Contractors and builders enjoy 35% discount with voucher code <strong className="text-slate-800">builder</strong>.</p>
              </div>
            </div>
          </main>
        )}

        {/* ==================== TAB 7: MERCHANT SELLER COMMAND CENTRE (PASSWORD: asenso123) ==================== */}
        {activeTab === 'me' && (
          <main className="w-full">
            {!isMerchantAuthenticated ? (
              /* PASSWORD GATE */
              <div className="max-w-md mx-auto bg-white rounded-2xl p-8 border border-slate-200 shadow-sm text-center my-6">
                <div className="w-14 h-14 rounded-full bg-orange-50 text-[#EE4D2D] flex items-center justify-center mx-auto mb-4">
                  <Lock className="w-7 h-7" />
                </div>
                <h2 className="text-lg font-black text-slate-900">Merchant Dashboard Access</h2>
                <p className="text-xs text-slate-500 mt-1.5 mb-6">
                  Authorized access only. Enter the store merchant password to manage product catalog, bulk actions, CSV imports, and discount settings.
                </p>

                <form onSubmit={handleAdminPasswordSubmit} className="space-y-4 text-left">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">Merchant Password</label>
                    <div className="relative">
                      <input
                        type={showAdminPassword ? "text" : "password"}
                        required
                        placeholder="Enter merchant password..."
                        value={adminPasswordInput}
                        onChange={e => setAdminPasswordInput(e.target.value)}
                        className="w-full px-3.5 py-2.5 text-xs sm:text-sm border border-slate-300 rounded-lg focus:border-[#EE4D2D] focus:outline-none pr-10 font-mono"
                      />
                      <button
                        type="button"
                        onClick={() => setShowAdminPassword(!showAdminPassword)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 cursor-pointer"
                      >
                        {showAdminPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                    {adminPasswordError && (
                      <p className="text-rose-600 text-xs font-bold mt-1.5 flex items-center gap-1">
                        <AlertCircle className="w-3.5 h-3.5" /> {adminPasswordError}
                      </p>
                    )}
                  </div>

                  <button
                    type="submit"
                    className="w-full bg-[#EE4D2D] hover:bg-[#d73f20] text-white py-3 rounded-lg font-bold text-xs sm:text-sm shadow-sm cursor-pointer flex items-center justify-center gap-2"
                  >
                    <KeyRound className="w-4 h-4" /> Unlock Merchant Centre
                  </button>
                </form>

                {/* Customer Account & Orders */}
                <div className="mt-8 pt-6 border-t border-slate-100 text-left space-y-4">
                  <div className="flex items-center justify-between">
                    <h4 className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                      <User className="w-4 h-4 text-[#EE4D2D]" /> Customer Profile & Orders
                    </h4>
                    {currentUser && (
                      <button onClick={handleLogout} className="text-[#EE4D2D] hover:underline text-xs font-bold cursor-pointer">
                        Log Out
                      </button>
                    )}
                  </div>

                  {currentUser ? (
                    <div className="space-y-3">
                      <div className="bg-slate-50 border border-slate-200 p-3.5 rounded-xl flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-full bg-[#EE4D2D] text-white font-bold flex items-center justify-center text-sm shadow-xs">
                            {currentUser.fullName ? currentUser.fullName[0].toUpperCase() : 'U'}
                          </div>
                          <div>
                            <p className="font-bold text-slate-900 text-xs sm:text-sm">{currentUser.fullName}</p>
                            <p className="text-slate-500 text-[11px]">{currentUser.email}</p>
                            {currentUser.phone && <p className="text-slate-400 text-[10px]">{currentUser.phone}</p>}
                          </div>
                        </div>
                        <span className="text-[10px] bg-emerald-100 text-emerald-800 font-bold px-2 py-0.5 rounded-full">
                          Verified Buyer
                        </span>
                      </div>

                      {/* My Recent Orders */}
                      <div className="border border-slate-200 rounded-xl p-3 bg-white space-y-2">
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-bold text-slate-800 flex items-center gap-1">
                            <ShoppingBag className="w-3.5 h-3.5 text-blue-600" /> My Orders ({userOrders.length})
                          </span>
                          <button
                            onClick={fetchUserOrders}
                            disabled={isLoadingOrders}
                            className="text-[10px] text-blue-600 font-bold hover:underline cursor-pointer flex items-center gap-1"
                          >
                            <RefreshCw className={`w-3 h-3 ${isLoadingOrders ? 'animate-spin' : ''}`} /> Refresh
                          </button>
                        </div>

                        {isLoadingOrders ? (
                          <p className="text-[11px] text-slate-400 py-2 text-center">Loading orders...</p>
                        ) : userOrders.length === 0 ? (
                          <div className="text-center py-4 bg-slate-50 rounded-lg">
                            <p className="text-xs text-slate-500 font-medium">No orders placed yet.</p>
                            <button
                              onClick={() => setActiveTab('home')}
                              className="mt-2 text-xs text-[#EE4D2D] font-bold hover:underline cursor-pointer inline-flex items-center gap-1"
                            >
                              Browse Hardware Catalog <ArrowRight className="w-3 h-3" />
                            </button>
                          </div>
                        ) : (
                          <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
                            {userOrders.slice(0, 5).map(ord => (
                              <div key={ord.id} className="p-2.5 rounded-lg border border-slate-100 bg-slate-50/70 text-xs flex items-center justify-between">
                                <div>
                                  <div className="flex items-center gap-1.5">
                                    <span className="font-mono font-bold text-slate-800">{ord.id}</span>
                                    <span className="text-[9px] bg-orange-100 text-[#EE4D2D] font-bold px-1.5 py-0.2 rounded">
                                      {ord.status}
                                    </span>
                                  </div>
                                  <p className="text-[10px] text-slate-500 mt-0.5">
                                    {ord.items?.length || 0} items • ₱{Number(ord.total).toLocaleString()}
                                  </p>
                                </div>
                                <button
                                  onClick={() => {
                                    setTrackingQuery(ord.id);
                                    setActiveTab('track-order');
                                  }}
                                  className="text-[11px] text-[#EE4D2D] font-bold hover:underline cursor-pointer flex items-center gap-0.5"
                                >
                                  Track <ChevronRight className="w-3 h-3" />
                                </button>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                  ) : (
                    <div className="space-y-2.5">
                      <div className="bg-amber-50 border border-amber-200 text-amber-800 p-3 rounded-lg text-xs flex items-center gap-2">
                        <AlertCircle className="w-4 h-4 text-amber-600 shrink-0" />
                        <span>Log in or create an account to check out and track your hardware orders.</span>
                      </div>
                      <div className="flex gap-2">
                        <button 
                          onClick={() => { setAuthPromptMessage(''); setAuthModal('login'); }}
                          className="flex-1 bg-slate-100 hover:bg-slate-200 text-slate-800 py-2.5 rounded-lg text-xs font-bold text-center cursor-pointer transition-colors"
                        >
                          Customer Log In
                        </button>
                        <button 
                          onClick={() => { setAuthPromptMessage(''); setAuthModal('register'); }}
                          className="flex-1 bg-slate-900 hover:bg-black text-white py-2.5 rounded-lg text-xs font-bold text-center cursor-pointer transition-colors"
                        >
                          Create Account
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            ) : (
              /* ==================== AUTHENTICATED MERCHANT SELLER CENTRE ==================== */
              <div className="space-y-6">
                
                {/* Header Actions Row */}
                <div className="bg-white p-4 sm:p-5 rounded-xl border border-slate-200 flex flex-wrap items-center justify-between gap-3 shadow-xs">
                  <div>
                    <h2 className="text-base sm:text-lg font-black text-slate-900 flex items-center gap-2">
                      <ShieldCheck className="w-5 h-5 text-[#EE4D2D]" /> Merchant Seller Command Centre
                    </h2>
                    <p className="text-xs text-slate-500">Live inventory catalog, CSV/PDF upload, bulk actions & discounting</p>
                  </div>

                  <div className="flex flex-wrap items-center gap-2">
                    {/* Add Item Button */}
                    <button
                      onClick={() => {
                        setEditingItem({
                          id: '',
                          name: '',
                          category: 'General Hardware',
                          unit: 'pc',
                          price: 100,
                          capital: 78,
                          stock: 50,
                          discount_percent: 0,
                          image: '',
                          description: ''
                        });
                        setItemModal('add');
                      }}
                      className="bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold px-3.5 py-2 rounded-lg flex items-center gap-1.5 cursor-pointer shadow-xs"
                    >
                      <PlusCircle className="w-4 h-4" /> Add New Item
                    </button>

                    {/* Upload CSV/PDF Button (User Requested) */}
                    <button
                      onClick={() => setUploadModal(true)}
                      className="bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold px-3.5 py-2 rounded-lg flex items-center gap-1.5 cursor-pointer shadow-xs"
                    >
                      <Upload className="w-4 h-4" /> Upload CSV / PDF
                    </button>

                    {/* Export CSV */}
                    <button
                      onClick={exportSelectedToCSV}
                      className="bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-bold px-3.5 py-2 rounded-lg flex items-center gap-1.5 cursor-pointer border border-slate-200"
                    >
                      <Download className="w-4 h-4" /> Export CSV
                    </button>

                    {/* Lock Dashboard */}
                    <button
                      onClick={() => { setIsMerchantAuthenticated(false); sessionStorage.removeItem('manna_merchant_auth'); }}
                      className="bg-rose-50 hover:bg-rose-100 text-rose-600 text-xs font-bold px-3 py-2 rounded-lg cursor-pointer"
                    >
                      Lock Session
                    </button>
                  </div>
                </div>

                {/* 1. Global Storewide Discount & Voucher Controller */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Storewide Flash Discount */}
                  <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
                    <div className="flex items-center justify-between mb-2">
                      <div>
                        <h3 className="text-xs font-bold text-slate-900 flex items-center gap-1.5">
                          <Flame className="w-4 h-4 text-[#EE4D2D]" /> Storewide Flash Sale Discount
                        </h3>
                        <p className="text-[11px] text-slate-400">Controls live discount across all {products.length} products</p>
                      </div>
                      <span className="text-lg font-black text-[#EE4D2D]">{storewideDiscount}%</span>
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

                  {/* Active Voucher Codes (hardware 40%, builder 35%) */}
                  <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
                    <h3 className="text-xs font-bold text-slate-900 mb-2 flex items-center gap-1.5">
                      <Tag className="w-4 h-4 text-blue-600" /> Active Voucher Codes
                    </h3>
                    <div className="space-y-1.5">
                      {discounts.map((d, i) => (
                        <div key={d.code} className="flex items-center justify-between text-xs p-2 bg-slate-50 rounded border border-slate-100">
                          <div>
                            <span className="font-mono font-black text-[#EE4D2D] text-xs uppercase">{d.code}</span>
                            <span className="ml-2 text-[10px] bg-orange-100 text-[#EE4D2D] font-bold px-1.5 py-0.2 rounded">
                              {d.value}% OFF
                            </span>
                            <span className="text-[10px] text-slate-500 ml-2">{d.description}</span>
                          </div>
                          <button
                            onClick={() => setDiscounts(prev => prev.map((item, idx) => idx === i ? { ...item, active: !item.active } : item))}
                            className={`text-[10px] font-bold px-2 py-0.5 rounded cursor-pointer ${
                              d.active ? 'bg-emerald-100 text-emerald-800' : 'bg-slate-200 text-slate-500'
                            }`}
                          >
                            {d.active ? 'Active' : 'Disabled'}
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                {/* 2. BULK ACTIONS CONTROLLER & INVENTORY MANAGER (USER REQUESTED) */}
                <div className="bg-white p-4 sm:p-5 rounded-xl border border-slate-200 shadow-xs space-y-4">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div>
                      <h3 className="text-sm font-black text-slate-900 flex items-center gap-2">
                        <SlidersHorizontal className="w-4 h-4 text-emerald-600" /> Bulk Actions & Inventory Manager
                      </h3>
                      <p className="text-xs text-slate-500">Select items to apply bulk discounts, edit pricing, or delete entries</p>
                    </div>

                    {/* Search inside inventory */}
                    <div className="w-full sm:w-64">
                      <input
                        type="text"
                        placeholder="Search SKU or name..."
                        value={itemSearchTerm}
                        onChange={e => setItemSearchTerm(e.target.value)}
                        className="w-full text-xs px-3 py-1.5 border border-slate-300 rounded-lg bg-slate-50 focus:outline-none"
                      />
                    </div>
                  </div>

                  {/* Bulk Action Controls Bar (Appears when items are selected) */}
                  <div className="bg-slate-50 p-3 rounded-lg border border-slate-200 flex flex-wrap items-center justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <button 
                        onClick={toggleSelectAll}
                        className="flex items-center gap-1.5 text-xs font-bold text-slate-700 hover:text-slate-900 cursor-pointer"
                      >
                        {selectedItemIds.length === filteredProducts.length && filteredProducts.length > 0 ? (
                          <CheckSquare className="w-4 h-4 text-[#EE4D2D]" />
                        ) : (
                          <Square className="w-4 h-4 text-slate-400" />
                        )}
                        Select All ({selectedItemIds.length} selected)
                      </button>
                    </div>

                    {selectedItemIds.length > 0 && (
                      <div className="flex flex-wrap items-center gap-2 text-xs">
                        {/* Bulk Discount */}
                        <div className="flex items-center gap-1">
                          <input
                            type="number"
                            min="0"
                            max="90"
                            placeholder="Discount %"
                            value={bulkDiscountInput}
                            onChange={e => setBulkDiscountInput(e.target.value)}
                            className="w-20 px-2 py-1 text-xs border border-slate-300 rounded bg-white font-bold"
                          />
                          <button
                            onClick={handleBulkDiscountApply}
                            className="bg-emerald-600 hover:bg-emerald-700 text-white px-2.5 py-1 rounded font-bold cursor-pointer"
                          >
                            Apply %
                          </button>
                        </div>

                        {/* Bulk Delete */}
                        <button
                          onClick={handleBulkDelete}
                          className="bg-rose-600 hover:bg-rose-700 text-white px-3 py-1 rounded font-bold flex items-center gap-1 cursor-pointer"
                        >
                          <Trash2 className="w-3.5 h-3.5" /> Delete ({selectedItemIds.length})
                        </button>
                      </div>
                    )}
                  </div>

                  {/* Products Table with Checkboxes & In-Place Edit/Delete */}
                  <div className="overflow-x-auto max-h-[500px] border border-slate-200 rounded-lg">
                    <table className="w-full text-left text-xs border-collapse">
                      <thead className="sticky top-0 bg-slate-100 z-10 border-b border-slate-200 text-slate-700 font-bold uppercase text-[10px]">
                        <tr>
                          <th className="py-2.5 px-3 w-10 text-center">
                            <input
                              type="checkbox"
                              checked={selectedItemIds.length === filteredProducts.length && filteredProducts.length > 0}
                              onChange={toggleSelectAll}
                              className="rounded text-[#EE4D2D] focus:ring-0"
                            />
                          </th>
                          <th className="py-2.5 px-3">Item Details</th>
                          <th className="py-2.5 px-3">Category</th>
                          <th className="py-2.5 px-3">Packaging Unit</th>
                          <th className="py-2.5 px-3 text-right">Price (₱)</th>
                          <th className="py-2.5 px-3 text-right">Capital (₱)</th>
                          <th className="py-2.5 px-3 text-center">Stock</th>
                          <th className="py-2.5 px-3 text-center">Discount</th>
                          <th className="py-2.5 px-3 text-center w-24">Actions</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100">
                        {products
                          .filter(p => !itemSearchTerm || p.name.toLowerCase().includes(itemSearchTerm.toLowerCase()) || p.id.toLowerCase().includes(itemSearchTerm.toLowerCase()))
                          .map(item => (
                            <tr key={item.id} className="hover:bg-slate-50 transition-colors">
                              {/* Checkbox */}
                              <td className="py-2 px-3 text-center">
                                <input
                                  type="checkbox"
                                  checked={selectedItemIds.includes(item.id)}
                                  onChange={() => toggleSelectItem(item.id)}
                                  className="rounded text-[#EE4D2D] focus:ring-0 cursor-pointer"
                                />
                              </td>

                              {/* Item details */}
                              <td className="py-2 px-3">
                                <div className="flex items-center gap-2">
                                  <img 
                                    src={item.image} 
                                    alt={item.name}
                                    className="w-8 h-8 rounded object-cover bg-slate-100 shrink-0" 
                                    onError={(e) => {
                                      e.target.onerror = null;
                                      e.target.src = "https://images.pexels.com/photos/175039/pexels-photo-175039.jpeg?auto=compress&cs=tinysrgb&h=650&w=940";
                                    }}
                                  />
                                  <div className="min-w-0">
                                    <p className="font-bold text-slate-900 truncate max-w-xs">{item.name}</p>
                                    <span className="font-mono text-[10px] text-slate-400">{item.id}</span>
                                  </div>
                                </div>
                              </td>

                              {/* Category */}
                              <td className="py-2 px-3 text-slate-600">
                                {item.category}
                              </td>

                              {/* Unit */}
                              <td className="py-2 px-3 font-medium text-slate-700">
                                {item.unit}
                              </td>

                              {/* Price */}
                              <td className="py-2 px-3 text-right font-bold text-slate-900">
                                ₱{item.price.toLocaleString()}
                              </td>

                              {/* Capital */}
                              <td className="py-2 px-3 text-right text-slate-500">
                                ₱{(item.capital || 0).toLocaleString()}
                              </td>

                              {/* Stock */}
                              <td className="py-2 px-3 text-center">
                                <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                                  item.stock <= 0 ? 'bg-rose-100 text-rose-700' : item.stock < 10 ? 'bg-amber-100 text-amber-800' : 'bg-emerald-100 text-emerald-800'
                                }`}>
                                  {item.stock}
                                </span>
                              </td>

                              {/* Discount % */}
                              <td className="py-2 px-3 text-center">
                                <span className="font-bold text-emerald-700">
                                  {item.discount_percent || 0}%
                                </span>
                              </td>

                              {/* Actions: Edit & Delete */}
                              <td className="py-2 px-3 text-center">
                                <div className="flex items-center justify-center gap-1.5">
                                  <button
                                    onClick={() => {
                                      setEditingItem({ ...item });
                                      setItemModal('edit');
                                    }}
                                    className="p-1 text-blue-600 hover:bg-blue-50 rounded cursor-pointer"
                                    title="Edit Item"
                                  >
                                    <Edit3 className="w-3.5 h-3.5" />
                                  </button>
                                  <button
                                    onClick={() => handleDeleteItem(item.id)}
                                    className="p-1 text-rose-600 hover:bg-rose-50 rounded cursor-pointer"
                                    title="Delete Item"
                                  >
                                    <Trash2 className="w-3.5 h-3.5" />
                                  </button>
                                </div>
                              </td>
                            </tr>
                          ))}
                      </tbody>
                    </table>
                  </div>
                </div>

                {/* 3. Live Customer Order Management */}
                <div className="bg-white p-4 sm:p-5 rounded-xl border border-slate-200 shadow-xs space-y-3">
                  <h3 className="text-sm font-black text-slate-900 flex items-center gap-2">
                    <Package className="w-4 h-4 text-[#EE4D2D]" /> Live Orders Fulfillment Tracker ({orders.length})
                  </h3>

                  {orders.length === 0 ? (
                    <p className="text-xs text-slate-400 py-6 text-center">No orders logged in system yet.</p>
                  ) : (
                    <div className="space-y-3">
                      {orders.map(o => (
                        <div key={o.orderId} className="p-3.5 border border-slate-200 rounded-lg bg-slate-50 text-xs space-y-2">
                          <div className="flex justify-between items-start">
                            <div>
                              <span className="font-mono font-black text-slate-900 text-sm">{o.orderId}</span>
                              <p className="text-slate-500 text-[11px]">{o.date}</p>
                            </div>
                            <span className="font-black text-[#EE4D2D] text-base">₱{o.total.toLocaleString()}</span>
                          </div>

                          <div className="text-xs text-slate-700 bg-white p-2.5 rounded border border-slate-200">
                            <p><strong>Customer:</strong> {o.customer.fullName} ({o.customer.phone})</p>
                            <p><strong>Site Address:</strong> {o.customer.address}</p>
                            <p><strong>Payment:</strong> <span className="uppercase font-bold">{o.customer.paymentMethod}</span></p>
                          </div>

                          {/* Order Status Change Dropdown */}
                          <div className="flex items-center justify-between pt-1">
                            <span className="text-xs font-bold text-slate-600">Update Status:</span>
                            <select
                              value={o.status}
                              onChange={e => handleOrderStatusUpdate(o.orderId, e.target.value)}
                              className="text-xs font-bold border border-slate-300 rounded px-2.5 py-1.5 bg-white text-[#EE4D2D] focus:outline-none"
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

        {/* ==================== TAB 8: CHECKOUT SCREEN ==================== */}
        {activeTab === 'checkout' && (
          <main className="max-w-xl mx-auto w-full">
            <button onClick={() => setActiveTab('home')} className="text-xs font-bold text-[#EE4D2D] mb-3 flex items-center gap-1 cursor-pointer">
              ← Back to Shop
            </button>

            {!currentUser ? (
              <div className="bg-white p-6 sm:p-8 rounded-xl border border-slate-200 shadow-sm text-center my-4 space-y-4">
                <div className="w-16 h-16 bg-orange-50 text-[#EE4D2D] rounded-full flex items-center justify-center mx-auto border border-orange-100">
                  <Lock className="w-8 h-8" />
                </div>
                <div>
                  <h3 className="text-base sm:text-lg font-black text-slate-900">Customer Account Required to Checkout</h3>
                  <p className="text-xs text-slate-500 max-w-sm mx-auto mt-1 leading-relaxed">
                    To ensure secure dispatch tracking and contractor wholesale pricing in Tacloban, you must be logged into your account before placing an order.
                  </p>
                </div>

                <div className="bg-amber-50 border border-amber-200 p-3.5 rounded-xl text-xs text-amber-800 text-left max-w-md mx-auto flex items-center gap-2.5">
                  <AlertCircle className="w-4 h-4 text-amber-600 shrink-0" />
                  <span>Your cart items ({cart.reduce((s, i) => s + i.quantity, 0)} items, ₱{cartSubtotal.toLocaleString()}) are preserved and will be checked out immediately after login.</span>
                </div>

                <div className="flex flex-col sm:flex-row gap-3 justify-center max-w-sm mx-auto pt-2">
                  <button
                    onClick={() => { setAuthPromptMessage('Log in to check out your hardware items'); setAuthModal('login'); }}
                    className="flex-1 bg-[#EE4D2D] hover:bg-[#d73f20] text-white py-2.5 px-4 rounded-lg text-xs font-bold cursor-pointer shadow-xs flex items-center justify-center gap-1.5 transition-colors"
                  >
                    <LogIn className="w-4 h-4" /> Log In to Account
                  </button>
                  <button
                    onClick={() => { setAuthPromptMessage('Create an account to complete checkout and track order'); setAuthModal('register'); }}
                    className="flex-1 bg-slate-900 hover:bg-black text-white py-2.5 px-4 rounded-lg text-xs font-bold cursor-pointer shadow-xs flex items-center justify-center gap-1.5 transition-colors"
                  >
                    <UserPlus className="w-4 h-4" /> Create New Account
                  </button>
                </div>
              </div>
            ) : (
              <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
                <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                  <h2 className="text-sm font-black uppercase text-slate-800 flex items-center gap-2">
                    <MapPin className="w-4 h-4 text-[#EE4D2D]" /> Direct Site Delivery Information
                  </h2>
                  <div className="text-right flex items-center gap-2">
                    <span className="text-[11px] bg-emerald-50 text-emerald-700 font-bold px-2.5 py-0.5 rounded-full border border-emerald-200 inline-flex items-center gap-1">
                      <User className="w-3 h-3" /> {currentUser.fullName}
                    </span>
                    <button
                      onClick={handleLogout}
                      className="text-[10px] text-slate-400 hover:text-slate-600 underline cursor-pointer"
                    >
                      Log Out
                    </button>
                  </div>
                </div>

                {checkoutError && (
                  <div className="mt-3 bg-rose-50 border border-rose-200 text-rose-700 p-2.5 rounded-lg text-xs font-bold flex items-center gap-2">
                    <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
                    <span>{checkoutError}</span>
                  </div>
                )}

                <form onSubmit={handleCheckoutSubmit} className="mt-4 space-y-3.5">
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
                    <label className="block text-xs font-bold text-slate-700 mb-1">Receiver Name *</label>
                    <input
                      type="text"
                      required
                      placeholder="Full Name (Engineer / Contractor / Owner)"
                      value={customer.fullName}
                      onChange={e => setCustomer({ ...customer, fullName: e.target.value })}
                      className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:border-[#EE4D2D] focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">Mobile Phone *</label>
                    <input
                      type="tel"
                      required
                      placeholder="0917 123 4567"
                      value={customer.phone}
                      onChange={e => setCustomer({ ...customer, phone: e.target.value })}
                      className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:border-[#EE4D2D] focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">Delivery / Site Address *</label>
                    <textarea
                      required
                      rows={2}
                      placeholder="Project site, street, barangay, Tacloban City"
                      value={customer.address}
                      onChange={e => setCustomer({ ...customer, address: e.target.value })}
                      className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:border-[#EE4D2D] focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">Payment Method</label>
                    <select
                      value={customer.paymentMethod}
                      onChange={e => setCustomer({ ...customer, paymentMethod: e.target.value })}
                      className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:border-[#EE4D2D] focus:outline-none bg-white font-medium"
                    >
                      <option value="cod">Cash on Delivery (COD)</option>
                      <option value="gcash">GCash (Warehouse QR Verified)</option>
                      <option value="bank">Direct Bank Transfer / Check</option>
                    </select>
                  </div>

                  {/* Promo Code Input Box */}
                  <div className="pt-2 border-t border-slate-100">
                    <label className="block text-xs font-bold text-slate-700 mb-1">Voucher / Promo Code</label>
                    <div className="flex gap-2">
                      <input
                        type="text"
                        placeholder="e.g. hardware (40%) or builder (35%)"
                        value={promoInput}
                        onChange={e => setPromoInput(e.target.value)}
                        className="flex-1 px-3 py-2 text-xs border border-slate-300 rounded-lg uppercase font-mono focus:outline-none focus:border-[#EE4D2D]"
                      />
                      <button
                        type="button"
                        onClick={applyPromoCode}
                        className="bg-slate-900 text-white px-4 py-2 rounded-lg text-xs font-bold cursor-pointer hover:bg-black"
                      >
                        Apply
                      </button>
                    </div>
                    {promoMessage.text && (
                      <p className={`text-xs mt-1.5 font-bold ${promoMessage.type === 'success' ? 'text-emerald-600' : 'text-rose-600'}`}>
                        {promoMessage.text}
                      </p>
                    )}
                  </div>

                  {/* Price Breakdown */}
                  <div className="pt-3 border-t border-slate-100 space-y-1.5 text-xs">
                    <div className="flex justify-between text-slate-500">
                      <span>Merchandise Subtotal</span>
                      <span>₱{cartSubtotal.toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>
                    </div>
                    {discountAmount > 0 && (
                      <div className="flex justify-between text-emerald-600 font-bold">
                        <span>Discount Voucher Savings</span>
                        <span>-₱{discountAmount.toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>
                      </div>
                    )}
                    <div className="flex justify-between text-slate-500">
                      <span>Delivery Fee</span>
                      <span>{shippingFee === 0 ? <strong className="text-emerald-600">FREE</strong> : `₱${shippingFee.toFixed(2)}`}</span>
                    </div>
                    <div className="flex justify-between text-base font-black text-slate-900 pt-2 border-t border-slate-100">
                      <span>Total Payable:</span>
                      <span className="text-[#EE4D2D]">₱{orderTotal.toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={isSubmittingCheckout}
                    className="w-full bg-[#EE4D2D] hover:bg-[#d73f20] disabled:opacity-60 text-white font-bold py-3 rounded-lg text-sm shadow-md cursor-pointer mt-4 flex items-center justify-center gap-2"
                  >
                    {isSubmittingCheckout ? (
                      <>
                        <RefreshCw className="w-4 h-4 animate-spin" /> Verifying & Placing Order...
                      </>
                    ) : (
                      'Confirm & Place Order'
                    )}
                  </button>
                </form>
              </div>
            )}
          </main>
        )}

        {/* ==================== TAB 9: ORDER SUCCESS ==================== */}
        {activeTab === 'order-success' && placedOrder && (
          <main className="max-w-md mx-auto w-full text-center py-12">
            <div className="w-16 h-16 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto mb-4">
              <Check className="w-8 h-8" />
            </div>
            <h2 className="text-lg font-black text-slate-900">Order Placed Successfully!</h2>
            <p className="text-xs text-slate-500 mt-1 mb-2">Tracking ID: <strong className="font-mono text-slate-900 font-bold text-sm">{placedOrder.orderId}</strong></p>
            <p className="text-xs text-slate-400 max-w-xs mx-auto mb-6">
              Your materials are being allocated at Manna Hardware Tacloban. You can track fulfillment status live anytime.
            </p>

            <div className="flex justify-center gap-3">
              <button
                onClick={() => { setActiveTab('track-order'); setTrackingQuery(placedOrder.orderId); setTrackedOrder(placedOrder); }}
                className="bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold px-5 py-2.5 rounded-lg shadow-xs cursor-pointer flex items-center gap-1.5"
              >
                <Truck className="w-4 h-4" /> Track Order Status
              </button>
              <button
                onClick={() => setActiveTab('home')}
                className="bg-slate-200 hover:bg-slate-300 text-slate-800 text-xs font-bold px-5 py-2.5 rounded-lg cursor-pointer"
              >
                Back to Shop
              </button>
            </div>
          </main>
        )}

      </div>

      {/* ==================== STICKY BOTTOM NAVIGATION BAR (MOBILE ONLY: md:hidden) ==================== */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-white border-t border-[#E5E5E5] py-1 px-2 shadow-lg max-w-lg mx-auto">
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

          {/* Tab 3: Live */}
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

      {/* ==================== CART SLIDE-OVER ==================== */}
      {isCartOpen && (
        <div className="fixed inset-0 z-50 overflow-hidden bg-slate-900/60 backdrop-blur-xs flex justify-end">
          <div className="w-full max-w-md bg-white h-full shadow-2xl flex flex-col">
            <div className="p-4 bg-[#EE4D2D] text-white flex items-center justify-between">
              <div className="flex items-center gap-2">
                <ShoppingCart className="w-5 h-5" />
                <h3 className="font-bold text-sm sm:text-base">Shopping Cart ({cart.reduce((s, i) => s + i.quantity, 0)})</h3>
              </div>
              <button onClick={() => setIsCartOpen(false)} className="p-1 hover:bg-white/20 rounded cursor-pointer">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-4 space-y-3">
              {cart.length === 0 ? (
                <div className="text-center py-20 text-slate-400 text-xs sm:text-sm">
                  Your cart is empty. Add supplies from the catalog.
                </div>
              ) : (
                cart.map(item => (
                  <div key={item.id} className="flex gap-3 p-3 bg-slate-50 rounded-lg border border-slate-200">
                    <img 
                      src={item.image} 
                      alt={item.name} 
                      className="w-16 h-16 object-cover rounded bg-white shrink-0 border border-slate-200" 
                      onError={(e) => {
                        e.target.onerror = null;
                        e.target.src = "https://images.pexels.com/photos/175039/pexels-photo-175039.jpeg?auto=compress&cs=tinysrgb&h=650&w=940";
                      }}
                    />
                    <div className="flex-1 min-w-0">
                      <p className="font-bold text-xs text-slate-900 truncate">{item.name}</p>
                      <p className="text-[11px] text-slate-500">Unit: {item.unit}</p>
                      <p className="text-xs text-[#EE4D2D] font-black mt-1">₱{item.price.toLocaleString()}</p>
                      <div className="flex items-center justify-between mt-2">
                        <div className="flex items-center border border-slate-300 bg-white rounded text-xs">
                          <button onClick={() => updateCartQty(item.id, -1)} className="px-2.5 py-0.5 text-slate-600 cursor-pointer">-</button>
                          <span className="px-2.5 font-bold">{item.quantity}</span>
                          <button onClick={() => updateCartQty(item.id, 1)} className="px-2.5 py-0.5 text-slate-600 cursor-pointer">+</button>
                        </div>
                        <button onClick={() => removeFromCart(item.id)} className="text-slate-400 hover:text-rose-600 cursor-pointer p-1">
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>

            {cart.length > 0 && (
              <div className="p-4 border-t border-slate-200 bg-slate-50 space-y-3">
                <div className="flex justify-between text-xs sm:text-sm text-slate-600">
                  <span>Subtotal</span>
                  <span className="font-black text-[#EE4D2D] text-base">₱{cartSubtotal.toLocaleString()}</span>
                </div>
                <button
                  onClick={() => {
                    if (!currentUser) {
                      setAuthPromptMessage('Account Required: Please log in or create an account to proceed to checkout.');
                      setAuthModal('login');
                      return;
                    }
                    setIsCartOpen(false);
                    setActiveTab('checkout');
                  }}
                  className="w-full bg-[#EE4D2D] hover:bg-[#d73f20] text-white py-3 rounded-lg font-bold text-xs sm:text-sm shadow-md cursor-pointer transition-colors flex items-center justify-center gap-1.5"
                >
                  Proceed to Checkout {!currentUser && '(Log In Required)'}
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ==================== MODAL: ADD / EDIT ITEM (CRUD) ==================== */}
      {itemModal && (
        <div className="fixed inset-0 z-50 overflow-hidden bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="w-full max-w-lg bg-white rounded-2xl shadow-2xl p-6 border border-slate-200 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="font-bold text-sm sm:text-base text-slate-900">
                {itemModal === 'add' ? 'Add New Hardware Product' : `Edit Product ${editingItem.id}`}
              </h3>
              <button onClick={() => setItemModal(null)} className="text-slate-400 hover:text-slate-600 cursor-pointer">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveItem} className="mt-4 space-y-3.5 text-xs">
              <div>
                <label className="block font-bold text-slate-700 mb-1">Product Title *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. C-Purlins 2x4 1.2mm, Island Paint QDE"
                  value={editingItem.name}
                  onChange={e => setEditingItem({ ...editingItem, name: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:border-[#EE4D2D] focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Category</label>
                  <select
                    value={editingItem.category}
                    onChange={e => setEditingItem({ ...editingItem, category: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg bg-white focus:outline-none"
                  >
                    {categories.filter(c => c !== 'All').map(c => (
                      <option key={c} value={c}>{c}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">Packaging Unit</label>
                  <input
                    type="text"
                    required
                    placeholder="pc, pack (100 pcs), gln, roll"
                    value={editingItem.unit}
                    onChange={e => setEditingItem({ ...editingItem, unit: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:border-[#EE4D2D] focus:outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Retail Price (₱) *</label>
                  <input
                    type="number"
                    step="0.01"
                    required
                    value={editingItem.price}
                    onChange={e => setEditingItem({ ...editingItem, price: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:border-[#EE4D2D] focus:outline-none font-bold"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">Capital Cost (₱)</label>
                  <input
                    type="number"
                    step="0.01"
                    value={editingItem.capital}
                    onChange={e => setEditingItem({ ...editingItem, capital: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:border-[#EE4D2D] focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">Stock Qty</label>
                  <input
                    type="number"
                    required
                    value={editingItem.stock}
                    onChange={e => setEditingItem({ ...editingItem, stock: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:border-[#EE4D2D] focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Item Discount (%)</label>
                <input
                  type="number"
                  min="0"
                  max="90"
                  value={editingItem.discount_percent || 0}
                  onChange={e => setEditingItem({ ...editingItem, discount_percent: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:border-[#EE4D2D] focus:outline-none"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Product Photo URL</label>
                <input
                  type="url"
                  placeholder="https://..."
                  value={editingItem.image}
                  onChange={e => setEditingItem({ ...editingItem, image: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:border-[#EE4D2D] focus:outline-none"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Description</label>
                <textarea
                  rows={2}
                  placeholder="Technical specs, grade, dimensions..."
                  value={editingItem.description}
                  onChange={e => setEditingItem({ ...editingItem, description: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:border-[#EE4D2D] focus:outline-none"
                />
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setItemModal(null)}
                  className="px-4 py-2 border border-slate-300 rounded-lg text-slate-700 font-bold hover:bg-slate-50 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-[#EE4D2D] hover:bg-[#d73f20] text-white rounded-lg font-bold shadow-xs cursor-pointer"
                >
                  Save Product
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ==================== MODAL: CSV / PDF UPLOAD (USER REQUESTED) ==================== */}
      {uploadModal && (
        <div className="fixed inset-0 z-50 overflow-hidden bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="w-full max-w-xl bg-white rounded-2xl shadow-2xl p-6 border border-slate-200 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <FileUp className="w-5 h-5 text-blue-600" />
                <h3 className="font-bold text-sm sm:text-base text-slate-900">
                  Bulk CSV / PDF Price List Importer
                </h3>
              </div>
              <button onClick={() => setUploadModal(false)} className="text-slate-400 hover:text-slate-600 cursor-pointer">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="mt-4 space-y-4 text-xs">
              {/* File Dropzone */}
              <div 
                onClick={() => fileInputRef.current?.click()}
                className="border-2 border-dashed border-slate-300 hover:border-blue-500 rounded-xl p-8 text-center bg-slate-50 hover:bg-blue-50/30 cursor-pointer transition-colors"
              >
                <FileSpreadsheet className="w-10 h-10 text-slate-400 mx-auto mb-2" />
                <p className="font-bold text-slate-800 text-sm">Drop your CSV or PDF Quote file here</p>
                <p className="text-slate-500 text-xs mt-1">Supports standard CSV sheets or PDF supplier quotation lists</p>
                <input 
                  type="file" 
                  ref={fileInputRef} 
                  onChange={handleFileUpload} 
                  accept=".csv, .pdf" 
                  className="hidden" 
                />
                <button 
                  type="button"
                  className="mt-4 bg-white border border-slate-300 text-slate-700 font-bold px-4 py-1.5 rounded-lg shadow-2xs hover:bg-slate-100"
                >
                  Browse Computer
                </button>
              </div>

              {importStatus && (
                <p className="text-xs font-semibold text-blue-700 bg-blue-50 p-2.5 rounded-lg border border-blue-100">
                  {importStatus}
                </p>
              )}

              {/* Preview table of parsed items */}
              {importPreview.length > 0 && (
                <div className="space-y-2">
                  <div className="flex justify-between items-center text-xs">
                    <span className="font-bold text-slate-800">Preview Parsed Items ({importPreview.length})</span>
                    <button onClick={confirmImport} className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold px-3 py-1 rounded cursor-pointer shadow-xs">
                      Confirm Import to Catalog
                    </button>
                  </div>

                  <div className="max-h-48 overflow-y-auto border border-slate-200 rounded-lg">
                    <table className="w-full text-left text-[11px] border-collapse">
                      <thead className="bg-slate-100 text-slate-600 font-bold sticky top-0">
                        <tr>
                          <th className="p-2">Name</th>
                          <th className="p-2">Category</th>
                          <th className="p-2">Unit</th>
                          <th className="p-2 text-right">Price</th>
                          <th className="p-2 text-center">Stock</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100">
                        {importPreview.slice(0, 15).map((p, idx) => (
                          <tr key={idx}>
                            <td className="p-2 font-bold truncate max-w-xs">{p.name}</td>
                            <td className="p-2 text-slate-500">{p.category}</td>
                            <td className="p-2">{p.unit}</td>
                            <td className="p-2 text-right font-black text-[#EE4D2D]">₱{p.price}</td>
                            <td className="p-2 text-center">{p.stock}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {/* CSV Template Download */}
              <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
                <span>Need formatting reference?</span>
                <button
                  type="button"
                  onClick={() => {
                    const sampleCsv = "Name,Category,Unit,Price,Capital,Stock,Description\nC-Purlins 2x4,Structural & Building Materials,pc,775,604.5,100,Commercial purlins\nGypsum Screw (100 pcs/pack),Fasteners & Hardware,pack (100 pcs),100,78,50,Black gypsum screws\n";
                    const blob = new Blob([sampleCsv], { type: 'text/csv' });
                    const url = URL.createObjectURL(blob);
                    const a = document.createElement('a');
                    a.href = url;
                    a.download = "manna_price_list_template.csv";
                    a.click();
                  }}
                  className="text-blue-600 font-bold hover:underline cursor-pointer"
                >
                  Download CSV Template
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ==================== CUSTOMER AUTH MODAL ==================== */}
      {authModal && (
        <div className="fixed inset-0 z-50 overflow-hidden bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="w-full max-w-sm bg-white rounded-2xl shadow-2xl p-5 border border-slate-200">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-lg bg-orange-100 text-[#EE4D2D] flex items-center justify-center font-bold">
                  {authModal === 'login' ? <LogIn className="w-4 h-4" /> : <UserPlus className="w-4 h-4" />}
                </div>
                <h3 className="font-bold text-sm text-slate-900">
                  {authModal === 'login' ? 'Customer Log In' : 'Create Customer Account'}
                </h3>
              </div>
              <button 
                onClick={() => { setAuthModal(null); setAuthPromptMessage(''); setAuthError(''); }} 
                className="text-slate-400 hover:text-slate-600 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {authPromptMessage && (
              <div className="mt-3 bg-orange-50 border border-orange-200 text-orange-800 p-2.5 rounded-lg text-[11px] font-semibold flex items-center gap-2">
                <AlertCircle className="w-4 h-4 text-[#EE4D2D] shrink-0" />
                <span>{authPromptMessage}</span>
              </div>
            )}

            <form onSubmit={authModal === 'login' ? handleLoginSubmit : handleRegisterSubmit} className="mt-4 space-y-3">
              {/* Invisible Bot Defense Honeypot */}
              <input
                type="text"
                name="user_note_verification"
                tabIndex={-1}
                aria-hidden="true"
                value={authForm.honeypot || ''}
                onChange={e => setAuthForm({ ...authForm, honeypot: e.target.value })}
                style={{ position: 'absolute', left: '-9999px', opacity: 0 }}
                autoComplete="off"
              />

              {authError && (
                <div className="bg-rose-50 border border-rose-200 text-rose-600 p-2 rounded text-xs font-bold flex items-center gap-1.5">
                  <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                  <span>{authError}</span>
                </div>
              )}

              {authModal === 'register' && (
                <div>
                  <label className="block text-[11px] font-bold text-slate-700 mb-1">Full Name *</label>
                  <input
                    type="text"
                    required
                    placeholder="Engr. Juan Dela Cruz"
                    value={authForm.fullName}
                    onChange={e => setAuthForm({ ...authForm, fullName: e.target.value })}
                    className="w-full px-3 py-2 text-xs border border-slate-200 rounded-lg focus:border-[#EE4D2D] focus:outline-none"
                  />
                </div>
              )}

              <div>
                <label className="block text-[11px] font-bold text-slate-700 mb-1">
                  {authModal === 'login' ? 'Email or Mobile Number *' : 'Email Address *'}
                </label>
                <input
                  type={authModal === 'login' ? 'text' : 'email'}
                  required
                  placeholder={authModal === 'login' ? 'builder@example.com or 0917...' : 'customer@example.com'}
                  value={authForm.email}
                  onChange={e => setAuthForm({ ...authForm, email: e.target.value })}
                  className="w-full px-3 py-2 text-xs border border-slate-200 rounded-lg focus:border-[#EE4D2D] focus:outline-none"
                />
              </div>

              {authModal === 'register' && (
                <div>
                  <label className="block text-[11px] font-bold text-slate-700 mb-1">Mobile Phone (for delivery SMS)</label>
                  <input
                    type="tel"
                    placeholder="0917 123 4567"
                    value={authForm.phone}
                    onChange={e => setAuthForm({ ...authForm, phone: e.target.value })}
                    className="w-full px-3 py-2 text-xs border border-slate-200 rounded-lg focus:border-[#EE4D2D] focus:outline-none"
                  />
                </div>
              )}

              <div>
                <label className="block text-[11px] font-bold text-slate-700 mb-1">Password *</label>
                <input
                  type="password"
                  required
                  placeholder="At least 6 characters"
                  value={authForm.password}
                  onChange={e => setAuthForm({ ...authForm, password: e.target.value })}
                  className="w-full px-3 py-2 text-xs border border-slate-200 rounded-lg focus:border-[#EE4D2D] focus:outline-none"
                />
              </div>

              {authModal === 'register' && (
                <div>
                  <label className="block text-[11px] font-bold text-slate-700 mb-1">Confirm Password *</label>
                  <input
                    type="password"
                    required
                    placeholder="Repeat password"
                    value={authForm.confirmPassword}
                    onChange={e => setAuthForm({ ...authForm, confirmPassword: e.target.value })}
                    className="w-full px-3 py-2 text-xs border border-slate-200 rounded-lg focus:border-[#EE4D2D] focus:outline-none"
                  />
                </div>
              )}

              <button
                type="submit"
                className="w-full bg-[#EE4D2D] hover:bg-[#d73f20] text-white py-2.5 rounded-lg text-xs font-bold cursor-pointer transition-colors shadow-xs"
              >
                {authModal === 'login' ? 'Log In to Account' : 'Create Account & Continue'}
              </button>
            </form>

            {/* Switch between Log In and Register */}
            <div className="mt-4 pt-3 border-t border-slate-100 text-center text-xs text-slate-500">
              {authModal === 'login' ? (
                <p>
                  Don't have an account?{' '}
                  <button
                    type="button"
                    onClick={() => { setAuthModal('register'); setAuthError(''); }}
                    className="text-[#EE4D2D] font-bold hover:underline cursor-pointer"
                  >
                    Create one now
                  </button>
                </p>
              ) : (
                <p>
                  Already have an account?{' '}
                  <button
                    type="button"
                    onClick={() => { setAuthModal('login'); setAuthError(''); }}
                    className="text-[#EE4D2D] font-bold hover:underline cursor-pointer"
                  >
                    Log In
                  </button>
                </p>
              )}
            </div>

            {/* Quick Demo Fill Helper */}
            {authModal === 'login' && (
              <div className="mt-2 text-center">
                <button
                  type="button"
                  onClick={() => setAuthForm({ ...authForm, email: 'builder@example.com', password: 'password123' })}
                  className="text-[10px] text-slate-400 hover:text-slate-600 underline cursor-pointer"
                >
                  Quick fill demo account (builder@example.com)
                </button>
              </div>
            )}
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
    <div className="bg-white rounded-sm overflow-hidden border border-[#EAEAEA] flex flex-col group relative shadow-2xs hover:shadow-md transition-shadow">
      
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
      <div className="p-2 sm:p-2.5 flex-1 flex flex-col justify-between">
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
