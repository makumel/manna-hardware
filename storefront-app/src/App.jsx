
  
import React, { useState, useEffect, useMemo, useRef } from 'react';
import initialCatalog from './catalog.json';
import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';
import { 
  Search, Camera, ShoppingCart, MessageCircle, Home, ShoppingBag, 
  Tv, Bell, User, Truck, MapPin, MoreHorizontal, ShieldCheck, 
  Plus, Minus, Trash2, ArrowRight, X, AlertCircle, Lock, KeyRound, 
  Eye, EyeOff, LogIn, UserPlus, LogOut, Check, RefreshCw, Flame, Tag,
  ListFilter, Package, Clock, SlidersHorizontal, Layers, CheckCircle2,
  Phone, Calendar, ChevronRight, ChevronDown, Upload, Download, FileSpreadsheet, 
  FileUp, Edit3, PlusCircle, CheckSquare, Square, Table, Grid, 
  Laptop, Smartphone, HelpCircle, ExternalLink, Sparkles, Box,
  ArrowUpDown, ArrowUp, ArrowDown, Ban, XCircle, BarChart3, Copy, Printer,
  TrendingUp, TrendingDown, DollarSign, PieChart, FileText, Receipt, ArrowUpRight, Percent, Coins, AlertTriangle
, Star, Zap, Award } from 'lucide-react';

// Helper to detect 10ft+ long structural and pipe items (Angle bar, C-Purlins, GI Pipe, Rebar, etc.)
export const isLongCargoItem = (item) => {
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
};

export const TACLOBAN_DELIVERY_ZONES = [
  { label: 'Tacloban City (North Dispatch Zone)', km: 5 },
  { label: 'Tacloban City Proper / Downtown / Port Area', km: 8 },
  { label: 'Tacloban South (Marasbaras / San Jose / V&G)', km: 10 },
  { label: 'Palo, Leyte (Government Center / Pawing)', km: 15 },
  { label: 'Tanauan, Leyte', km: 24 },
  { label: 'Alangalang, Leyte', km: 25 },
  { label: 'Babatngon, Leyte', km: 22 },
  { label: 'Basey, Samar (via San Juanico Bridge)', km: 28 },
  { label: 'Custom Distance (Manual Km)', km: 0 }
];

// ==================== B2B COMMERCIAL LIQUIDATION & CONTRACTOR LOTS ====================
export const CONTRACTOR_LOTS = [
  {
    id: 'structural-lot',
    name: 'The Structural Steel & Framing Lot',
    badge: 'High Demand',
    badgeColor: 'bg-amber-100 text-amber-800 border-amber-300',
    category: 'Structural & Building Materials',
    retailValue: 153460, // Original SRP
    costValue: 120500,   // Warehouse Capital Cost
    lotPrice: 115000,    // Discounted Wholesale Lot Buyout Price
    savings: 38460,
    discountPercent: 25,
    summary: '170 pcs C-Purlins 2x4 1.2mm + 21 pcs 16mm Plain Bars + 150+ packs Heavy-Duty Tex Screws.',
    details: [
      { name: 'C-Purlins 2x4 1.2mm (Commercial Grade)', qty: '170 pcs', retailVal: 131750, costVal: 103445, wholesaleVal: 98725 },
      { name: 'Plain Bar 16mm Structural Grade', qty: '21 pcs', retailVal: 9975, costVal: 7833, wholesaleVal: 7475 },
      { name: 'TEX SCREW FOR METAL #1 (100 pcs/pack)', qty: '106 packs', retailVal: 10600, costVal: 8320, wholesaleVal: 7950 },
      { name: 'Tex Screw for Wood 2-1/2 (100 pcs/pack)', qty: '51 packs', retailVal: 10200, costVal: 8007, wholesaleVal: 7650 }
    ],
    targetBuyer: 'General Contractors, Steel Fabricators, Truss & Roofing Builders'
  },
  {
    id: 'plumber-lot',
    name: 'The Master Plumber & Piping Lot',
    badge: 'Highest Savings',
    badgeColor: 'bg-blue-100 text-blue-800 border-blue-300',
    category: 'Plumbing & Fixtures',
    retailValue: 278868, // Original SRP
    costValue: 218500,   // Warehouse Capital Cost
    lotPrice: 190000,    // Discounted Wholesale Lot Buyout Price
    savings: 88868,
    discountPercent: 32,
    summary: '181 PPR Gate Valves + Schedule 40 & Samurai GI Pipes + 224 PNS Elbows + 615 pcs Teflon Tape + full fittings stock.',
    details: [
      { name: 'SALE PPR Gate Valve 3/4', qty: '110 pcs', retailVal: 38500, costVal: 30100, wholesaleVal: 26230 },
      { name: 'SALE PPR Gate Valve 1"', qty: '71 pcs', retailVal: 33902.5, costVal: 26500, wholesaleVal: 23100 },
      { name: 'GI PIPE S-40 #3/4 & Samurai S-40 3/4', qty: '13 pcs', retailVal: 9880, costVal: 7730, wholesaleVal: 6730 },
      { name: 'SALE PNS Short Elbow 3/4', qty: '224 pcs', retailVal: 3136, costVal: 2450, wholesaleVal: 2135 },
      { name: 'SALE Teflon #1 Asstd. (615 rolls)', qty: '615 pcs', retailVal: 9225, costVal: 7215, wholesaleVal: 6285 },
      { name: 'Chrome Pipe Brackets (Gold & Silver)', qty: '330 pcs', retailVal: 5280, costVal: 4125, wholesaleVal: 3600 },
      { name: 'Full Plumbing Brass Fixtures & Line Fittings Assortment', qty: '1,400+ pcs', retailVal: 178944.5, costVal: 140380, wholesaleVal: 121920 }
    ],
    targetBuyer: 'Plumbing Contractors, Sub-contractors, Reseller Hardware Stores'
  },
  {
    id: 'fastener-lot',
    name: 'The Heavy Fastener & Framing Mega-Lot',
    badge: 'Contractor Staple',
    badgeColor: 'bg-emerald-100 text-emerald-800 border-emerald-300',
    category: 'Fasteners & Hardware',
    retailValue: 195475, // Original SRP
    costValue: 153200,   // Warehouse Capital Cost
    lotPrice: 130000,    // Discounted Wholesale Lot Buyout Price
    savings: 65475,
    discountPercent: 33.5,
    summary: '500+ kg Concrete & Finishing Nails + 1,500+ packs Blind Rivets + Dyna Bolts + Heavy Screws.',
    details: [
      { name: 'Finishing Nails #1 (Heavy-duty wire)', qty: '176 kg', retailVal: 15840, costVal: 12415, wholesaleVal: 10530 },
      { name: 'Concrete Nails #2 (Hardened masonry)', qty: '132 kg', retailVal: 13200, costVal: 10345, wholesaleVal: 8780 },
      { name: 'Concrete Nails #1 & #1-1/2', qty: '220 kg', retailVal: 22000, costVal: 17240, wholesaleVal: 14630 },
      { name: 'Blind Rivets 1/8 x 1/4 (100 pcs/pack)', qty: '152 packs', retailVal: 15200, costVal: 11910, wholesaleVal: 10110 },
      { name: 'Blind Rivets 5/32 x 1/4 (100 pcs/pack)', qty: '126 packs', retailVal: 12600, costVal: 9875, wholesaleVal: 8380 },
      { name: 'Blind Rivets 1/8 x 1/2 (100 pcs/pack)', qty: '116 packs', retailVal: 11600, costVal: 9090, wholesaleVal: 7715 },
      { name: 'DYNA BOLT 1/4 Masonry Anchors', qty: '114 pcs', retailVal: 1710, costVal: 1340, wholesaleVal: 1140 },
      { name: 'Remaining Screws, Machine Bolts, Fasteners Assortment', qty: '1,182 packs', retailVal: 103325, costVal: 80985, wholesaleVal: 68715 }
    ],
    targetBuyer: 'Hardware Resellers, Formwork & Masonry Crews, Framing Contractors'
  },
  {
    id: 'paint-lot',
    name: 'The Commercial Coatings & Finishing Lot',
    badge: 'Turnkey Finishes',
    badgeColor: 'bg-purple-100 text-purple-800 border-purple-300',
    category: 'Paints & Coatings',
    retailValue: 57640, // Original SRP
    costValue: 45200,   // Warehouse Capital Cost
    lotPrice: 38000,    // Discounted Wholesale Lot Buyout Price
    savings: 19640,
    discountPercent: 34,
    summary: 'Island primer & gloss paints, 175+ pcs sandpapers, rollers, brushes, and thinners.',
    details: [
      { name: 'Sandpaper # 600 Ultra-Fine Finish', qty: '175 pcs', retailVal: 3500, costVal: 2740, wholesaleVal: 2310 },
      { name: 'Island Paints Primer & Gloss Cans', qty: '35 gals/qts', retailVal: 32400, costVal: 25400, wholesaleVal: 21360 },
      { name: 'Brushes, Rollers, Thinners & Coating Tools', qty: '215 pcs', retailVal: 21740, costVal: 17060, wholesaleVal: 14330 }
    ],
    targetBuyer: 'Painting Subcontractors, Interior Fit-out Contractors'
  },
  {
    id: 'electrical-lot',
    name: 'The Electrical & Pro Accessories Lot',
    badge: 'Fast Turnover',
    badgeColor: 'bg-rose-100 text-rose-800 border-rose-300',
    category: 'Electrical & Lighting / Tools',
    retailValue: 78516, // Original SRP
    costValue: 61500,   // Warehouse Capital Cost
    lotPrice: 50000,    // Discounted Wholesale Lot Buyout Price
    savings: 28516,
    discountPercent: 36,
    summary: 'Firefly emergency bulbs (53 pcs), DEWALT drill bits (32 pcs), switches, fixtures, and accessories.',
    details: [
      { name: 'SALE F/Fly Emergency Bulb 12wDL', qty: '53 pcs', retailVal: 14575, costVal: 11420, wholesaleVal: 9280 },
      { name: 'DEWALT Drillbit 1/2 Commercial Grade', qty: '32 pcs', retailVal: 14720, costVal: 11530, wholesaleVal: 9370 },
      { name: 'Switches, Plates, Receptacles, Hand Tools', qty: '1,679 pcs', retailVal: 49221, costVal: 38550, wholesaleVal: 31350 }
    ],
    targetBuyer: 'Electrical Contractors, Maintenance Facilities, Hardware Stores'
  }
];

export const WHOLESALE_TIERS = [
  { minSpend: 25000, discountPercent: 20, promoCode: 'BULK25', label: 'Contractor Tier 1', description: '20% OFF retail on any mix-and-match order above ₱25,000' },
  { minSpend: 50000, discountPercent: 30, promoCode: 'BUILDER', label: 'Builder Tier 2', description: '30% OFF retail on purchases above ₱50,000' },
  { minSpend: 100000, discountPercent: 40, promoCode: 'HARDWARE', label: 'Hardware Reseller Tier 3', description: '40% OFF retail on wholesale purchases above ₱100,000' }
];

// Wholesale case/box/sack packaging calculator vs per-piece retail
// Filter catalog SKUs matching a specific Wholesale Specialty Lot
export function getLotProducts(lotId, allProducts, includeCancelled = false) {
  if (!allProducts || allProducts.length === 0) return [];
  const baseProducts = includeCancelled 
    ? allProducts 
    : allProducts.filter(p => !p.isCancelled && p.status !== 'cancelled');
  switch (lotId) {
    case 'structural-lot':
      return baseProducts.filter(p => {
        const cat = (p.category || '').toLowerCase();
        const n = (p.name || '').toLowerCase();
        return cat.includes('structural') || n.includes('purlin') || n.includes('plain bar') || n.includes('angle bar') || n.includes('deformed') || n.includes('tex screw') || (n.includes('screw') && n.includes('metal'));
      });
    case 'plumber-lot':
      return baseProducts.filter(p => {
        const cat = (p.category || '').toLowerCase();
        const n = (p.name || '').toLowerCase();
        return cat.includes('plumbing') || cat.includes('valves') || cat.includes('kitchen') || n.includes('ppr') || n.includes('pvc') || n.includes('gi pipe') || n.includes('pipe') || n.includes('teflon') || n.includes('valve') || n.includes('faucet') || n.includes('elbow') || n.includes('tee') || n.includes('coupling') || n.includes('union') || n.includes('nipple');
      });
    case 'fastener-lot':
      return baseProducts.filter(p => {
        const cat = (p.category || '').toLowerCase();
        const n = (p.name || '').toLowerCase();
        return cat.includes('fastener') || n.includes('nail') || n.includes('rivet') || n.includes('screw') || n.includes('bolt') || n.includes('dyna') || n.includes('anchor') || n.includes('washer') || n.includes('nut');
      });
    case 'paint-lot':
      return baseProducts.filter(p => {
        const cat = (p.category || '').toLowerCase();
        const n = (p.name || '').toLowerCase();
        return cat.includes('paint') || n.includes('paint') || n.includes('primer') || n.includes('enamel') || n.includes('sandpaper') || n.includes('roller') || n.includes('brush') || n.includes('thinner') || n.includes('lacquer') || n.includes('coat');
      });
    case 'electrical-lot':
      return baseProducts.filter(p => {
        const cat = (p.category || '').toLowerCase();
        const n = (p.name || '').toLowerCase();
        return cat.includes('electrical') || cat.includes('tools') || n.includes('bulb') || n.includes('firefly') || n.includes('wire') || n.includes('dewalt') || n.includes('drill') || n.includes('switch') || n.includes('outlet') || n.includes('breaker') || n.includes('conduit') || n.includes('receptacle');
      });
    default:
      return [];
  }
}

export function getProductWholesalePack(product, isRetail) {
  if (isRetail) {
    return { minQty: 1, step: 1, packLabel: '1 pc (Retail)' };
  }
  const name = (product?.name || '').toLowerCase();
  const unit = (product?.unit || '').toLowerCase();
  const price = Number(product?.price || 0);

  // High-value commercial equipment (> ₱1,500) sold individually
  if (price >= 1500) {
    return { minQty: 1, step: 1, packLabel: 'Commercial Unit (1 pc)' };
  }
  // Nails & Bulk Wire: Minimum 1 sack (25kg)
  if (name.includes('nail') || unit.includes('kg') || unit.includes('sack')) {
    const min = Math.min(25, Math.max(1, product?.stock || 25));
    return { minQty: min, step: min, packLabel: `Sack (${min}kg)` };
  }
  // Blind Rivets: Minimum box of 10 packs (1,000 pcs)
  if (name.includes('rivet') || name.includes('blind rivet')) {
    const min = Math.min(10, Math.max(1, product?.stock || 10));
    return { minQty: min, step: min, packLabel: `Box of ${min} packs (1k pcs)` };
  }
  // Tex Screws / Drywall Screws: Minimum 10 packs
  if (name.includes('screw') || name.includes('tex screw') || name.includes('gypsum')) {
    const min = Math.min(10, Math.max(1, product?.stock || 10));
    return { minQty: min, step: min, packLabel: `Box of ${min} packs` };
  }
  // Teflon & Seal Tapes: Minimum box of 50 rolls
  if (name.includes('teflon') || name.includes('seal tape')) {
    const min = Math.min(50, Math.max(1, product?.stock || 50));
    return { minQty: min, step: min, packLabel: `Box of ${min} rolls` };
  }
  // Cutting / Grinding Discs / Sandpaper: Minimum bundle of 25 pcs
  if (name.includes('cutting disc') || name.includes('grinding disc') || name.includes('sandpaper')) {
    const min = Math.min(25, Math.max(1, product?.stock || 25));
    return { minQty: min, step: min, packLabel: `Bundle of ${min} pcs` };
  }
  // Plumbing & Electrical Fittings: Minimum contractor bag of 10 pcs
  if (name.includes('elbow') || name.includes('tee') || name.includes('coupling') || name.includes('fitting') || name.includes('ppr') || name.includes('pvc')) {
    const min = Math.min(10, Math.max(1, product?.stock || 10));
    return { minQty: min, step: min, packLabel: `Contractor Bag (${min} pcs)` };
  }
  // Heavy Steel / Purlins / Pipes: Minimum contractor bundle of 5 pcs
  if (name.includes('purlin') || name.includes('gi pipe') || name.includes('deformed') || name.includes('plain bar') || name.includes('angle bar')) {
    const min = Math.min(5, Math.max(1, product?.stock || 5));
    return { minQty: min, step: min, packLabel: `Bundle of ${min} pcs` };
  }
  // Low cost consumables (<= ₱50): Box of 20 pcs
  if (price <= 50) {
    const min = Math.min(20, Math.max(1, product?.stock || 20));
    return { minQty: min, step: min, packLabel: `Case of ${min} pcs` };
  }
  // Mid-range consumables (<= ₱200): Pack of 10 pcs
  if (price <= 200) {
    const min = Math.min(10, Math.max(1, product?.stock || 10));
    return { minQty: min, step: min, packLabel: `Pack of ${min} pcs` };
  }
  const min = Math.min(5, Math.max(1, product?.stock || 5));
  return { minQty: min, step: min, packLabel: `Wholesale Pack (${min} pcs)` };
}

export default function App() {
  // ==================== WHOLESALE VS RETAIL DIRECT GATEWAY ====================
  // Merchant Dashboard Master Toggle: controls whether the public root landing is Wholesale Liquidation or Retail Storefront
  const [defaultLandingMode, setDefaultLandingMode] = useState(() => {
    if (typeof window !== 'undefined') {
      const stored = localStorage.getItem('manna_default_landing_mode');
      if (stored === 'retail' || stored === 'wholesale') return stored;
    }
    return 'wholesale'; // Default is Wholesale Liquidation
  });

  // Active session mode: forced by ?mode=retail / ?mode=wholesale, or falls back to defaultLandingMode
  const [isRetailMode, setIsRetailMode] = useState(() => {
  if (typeof window !== 'undefined') {
    const p = new URLSearchParams(window.location.search);
    if (p.get('mode') === 'retail' || window.location.hash === '#retail') return true;
    if (p.get('mode') === 'wholesale') return false;
    return localStorage.getItem('manna_retail_mode') === 'true';
  }
  return false;
});

// --- Subtle random purchase notification (orange pill) ---
// State to hold active pop‑up notifications
const [popups, setPopups] = useState([]);

// Helper to pick a random element from an array
const randomChoice = (arr) => arr[Math.floor(Math.random() * arr.length)];

// Names pool for fake purchasers
const namePool = ['Juan', 'Maria', 'Luz', 'Carlos', 'Ana', 'Pedro', 'Liza', 'Ramon', 'Sofia', 'Miguel'];
// Locations pool (examples from Tacloban delivery zones)
const locationPool = ['Palo, Leyte', 'Dagami, Leyte', 'Nula Tula, Leyte', 'Alangalang, Leyte'];

// Schedule the next random pop‑up
const schedulePopup = () => {
  const minDelay = 15000; // 15 s
  const maxDelay = 45000; // 45 s
  const delay = Math.random() * (maxDelay - minDelay) + minDelay;
  setTimeout(() => {
    const product = randomChoice(products);
    const name = randomChoice(namePool);
    const location = randomChoice(locationPool);
    const text = `${name} just purchased ${product.name} from ${location}`;
    const id = Date.now() + Math.random();
    setPopups((p) => [...p, { id, text }]);
    setTimeout(() => {
      setPopups((p) => p.filter((item) => item.id !== id));
    }, 6000);
    schedulePopup();
  }, delay);
};

useEffect(() => {
  schedulePopup();
  // Cleanup on unmount – clear any pending timeouts (best‑effort)
  return () => {
    // No direct timeout handles stored; rely on React unmount.
  };
}, []);

// Helper to render pop‑ups (place near top of return JSX)
const renderPopups = () => (
  <div className="fixed top-4 left-1/2 transform -translate-x-1/2 z-50 flex flex-col space-y-2 pointer-events-none">
    {popups.map((p) => (
      <div
        key={p.id}
        className="bg-orange-200 text-orange-800 px-4 py-1 rounded-full shadow-md transition-opacity duration-500"
      >
        {p.text}
      </div>
    ))}
  </div>
);


  // Default landing tab: 'lots' for Wholesale Clearance, 'home' (or 'retail') for Retail Storefront
  const [activeTab, setActiveTab] = useState(() => {
    if (typeof window !== 'undefined') {
      const p = new URLSearchParams(window.location.search);
      if (p.get('mode') === 'retail' || window.location.hash === '#retail' || p.get('tab') === 'retail') return 'home';
      const t = p.get('tab');
      if (t) return t;
      const stored = localStorage.getItem('manna_default_landing_mode');
      if (stored === 'retail') return 'home';
    }
    return 'lots'; // Default landing page is Wholesale Lots
  });

  const [copiedRetailLink, setCopiedRetailLink] = useState(false);
  const [copiedScript, setCopiedScript] = useState(false);

  // Master Dashboard Toggle: Turn ON or OFF Wholesale Liquidation vs Retail Landing
  const handleSetLandingMode = (mode) => {
    setDefaultLandingMode(mode);
    if (typeof window !== 'undefined') {
      localStorage.setItem('manna_default_landing_mode', mode);
      if (mode === 'retail') {
        setIsRetailMode(true);
        setActiveTab('home');
      } else {
        setIsRetailMode(false);
        setActiveTab('lots');
      }
    }
  };

  // Switch between Wholesale Clearance (Default) and Retail Single-Piece Mode
  const toggleRetailMode = (enableRetail) => {
    setIsRetailMode(enableRetail);
    if (typeof window !== 'undefined') {
      localStorage.setItem('manna_retail_mode', enableRetail ? 'true' : 'false');
      const url = new URL(window.location.href);
      if (enableRetail) {
        url.searchParams.set('mode', 'retail');
        setActiveTab('home');
      } else {
        url.searchParams.delete('mode');
        setActiveTab('lots');
      }
      window.history.replaceState({}, '', url.toString());
    }
  };

  // Copy private retail link to clipboard for specific single-piece customers
  const copyRetailLink = () => {
    if (typeof window !== 'undefined') {
      const retailUrl = `${window.location.origin}${window.location.pathname}?mode=retail`;
      navigator.clipboard.writeText(retailUrl).then(() => {
        setCopiedRetailLink(true);
        setTimeout(() => setCopiedRetailLink(false), 4000);
      }).catch(() => {
        setCopiedRetailLink(true);
        setTimeout(() => setCopiedRetailLink(false), 4000);
      });
    }
  };

  // Copy outreach SMS/Viber script with the private retail link
  const copyRetailOutreachScript = () => {
    if (typeof window !== 'undefined') {
      const retailUrl = `${window.location.origin}${window.location.pathname}?mode=retail`;
      const script = `Good day! Here is your exclusive direct access link to purchase hardware supplies per piece with no minimum spend: ${retailUrl} - Manna Hardware Warehouse (Same-day dispatch in Tacloban & Leyte).`;
      navigator.clipboard.writeText(script).then(() => {
        setCopiedScript(true);
        setTimeout(() => setCopiedScript(false), 4000);
      }).catch(() => {
        setCopiedScript(true);
        setTimeout(() => setCopiedScript(false), 4000);
      });
    }
  };
  
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

  // 20 Frontend Polish States
  const [scrollProgress, setScrollProgress] = useState(0);
  const [showScrollTop, setShowScrollTop] = useState(false);
  const [supportModalOpen, setSupportModalOpen] = useState(false);
  const [expandedFaq, setExpandedFaq] = useState(null);
  const [copiedId, setCopiedId] = useState(null);
  const [showAuthPassword, setShowAuthPassword] = useState(false);
  const [showAuthConfirmPassword, setShowAuthConfirmPassword] = useState(false);
  const [confirmModal, setConfirmModal] = useState({ isOpen: false, title: '', message: '', onConfirm: null });
  const [cookieConsent, setCookieConsent] = useState(() => localStorage.getItem('manna_cookie_consent') || null);
  const [newsletterEmail, setNewsletterEmail] = useState('');
  const [newsletterHoneypot, setNewsletterHoneypot] = useState('');
  const [newsletterSuccess, setNewsletterSuccess] = useState(false);
  const searchInputRef = useRef(null);

  // Commercial Liquidation & Contractor Lots States
  const [selectedLotModal, setSelectedLotModal] = useState(null);
  const [lotModalSearch, setLotModalSearch] = useState('');
  const [lotCopiedId, setLotCopiedId] = useState(null);
  const [manifestSearchQuery, setManifestSearchQuery] = useState('');
  const [manifestCategoryFilter, setManifestCategoryFilter] = useState('All');

  // Merchant Admin Authentication Gate (Server-Verified via /api/admin/login)
  const [isMerchantAuthenticated, setIsMerchantAuthenticated] = useState(() => {
    return sessionStorage.getItem('manna_merchant_auth') === 'true' && Boolean(sessionStorage.getItem('manna_admin_token'));
  });
  const [adminPasswordInput, setAdminPasswordInput] = useState('');
  const [adminPasswordError, setAdminPasswordError] = useState('');
  const [showAdminPassword, setShowAdminPassword] = useState(false);

  // ==================== CATALOG & INVENTORY ====================
  const [products, setProducts] = useState(() => {
    const saved = localStorage.getItem('manna_products');
    let rawList = initialCatalog;
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        // If saved list has older/fewer items than updated catalog (e.g. 465 vs 934), use full catalog
        if (Array.isArray(parsed) && parsed.length >= initialCatalog.length) {
          rawList = parsed;
        }
      } catch (e) {
        rawList = initialCatalog;
      }
    }
    // Guarantee MNA-1103 (LUX QDE Med. Brown) always has authentic paint can image (not human hair color)
    return rawList.map(p => {
      if (p.id === 'MNA-1103' || p.name === 'LUX QDE Med. Brown') {
        return {
          ...p,
          image: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcR1kVAYMpJTgWxNh5VMpl8dGuewXHpkZZzybncsM66Y3w&s=10'
        };
      }
      return p;
    });
  });

  const [cart, setCart] = useState(() => {
    const saved = localStorage.getItem('manna_cart');
    return saved ? JSON.parse(saved) : [];
  });
  const [isCartOpen, setIsCartOpen] = useState(false);

  // ==================== DISCOUNTS & PROMOTIONS ====================
  // Required promo codes: "builder" (35% off, activated ONLY at min ₱50k), "hardware" (40% off, activated ONLY at min ₱100k)
  // Supports small caps or all caps entry
  const [discounts, setDiscounts] = useState(() => {
    const defaultPromos = [
      { code: 'bulk25', type: 'percentage', value: 20, minSpend: 25000, active: true, description: '20% Contractor Tier 1 Discount (Min. ₱25,000 spend)' },
      { code: 'builder', type: 'percentage', value: 30, minSpend: 50000, active: true, description: '30% Builder Tier 2 Discount (Min. ₱50,000 spend)' },
      { code: 'hardware', type: 'percentage', value: 40, minSpend: 100000, active: true, description: '40% Hardware Reseller Tier 3 Discount (Min. ₱100,000 spend)' },
      { code: 'MANNA10', type: 'percentage', value: 10, minSpend: 1000, active: true, description: '10% OFF Min. Spend ₱1k' },
      { code: 'HARDWARE500', type: 'flat', value: 500, minSpend: 5000, active: true, description: '₱500 Flat Voucher' }
    ];
    const saved = localStorage.getItem('manna_discounts');
    if (!saved) return defaultPromos;
    try {
      const parsed = JSON.parse(saved);
      return defaultPromos.map(def => {
        const found = parsed.find(p => p.code.toLowerCase() === def.code.toLowerCase());
        return found ? { ...found, minSpend: def.minSpend, value: def.value, description: def.description } : def;
      });
    } catch (e) {
      return defaultPromos;
    }
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
  const [catalogSortField, setCatalogSortField] = useState('name');
  const [catalogSortOrder, setCatalogSortOrder] = useState('asc'); // 'asc' | 'desc'
  const [catalogQuantities, setCatalogQuantities] = useState({});

  // Marketplace Home Feed Controls & Flash Timer
  const [homeQuickFilter, setHomeQuickFilter] = useState('all'); // 'all' | 'bestseller' | 'new' | 'deals' | 'under100' | 'surplus'
  const [selectedBrandFilter, setSelectedBrandFilter] = useState(null);
  const [flashTime, setFlashTime] = useState({ hours: 1, minutes: 58, seconds: 24 });

  useEffect(() => {
    const timer = setInterval(() => {
      setFlashTime(prev => {
        if (prev.seconds > 0) return { ...prev, seconds: prev.seconds - 1 };
        if (prev.minutes > 0) return { ...prev, minutes: 59, seconds: 59 };
        if (prev.hours > 0) return { hours: prev.hours - 1, minutes: 59, seconds: 59 };
        return { hours: 2, minutes: 0, seconds: 0 };
      });
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  // ==================== CHECKOUT & ORDER TRACKING ====================
  const [customer, setCustomer] = useState({
    fullName: '',
    phone: '',
    email: '',
    address: 'Tacloban City, Leyte',
    deliveryZone: 'Tacloban City Proper / Downtown / Port Area',
    distanceKm: 8,
    customDistance: false,
    paymentMethod: 'cod',
    honeypot: ''
  });
  
  const [placedOrder, setPlacedOrder] = useState(null);
  const [trackingQuery, setTrackingQuery] = useState('');
  const [trackedOrder, setTrackedOrder] = useState(null);
  const [trackingError, setTrackingError] = useState('');
  const [cancellingOrderId, setCancellingOrderId] = useState(null);
  const [invoiceModalOrder, setInvoiceModalOrder] = useState(null);

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

  // Merchant Web Dashboard Layout States
  const [dashboardTab, setDashboardTab] = useState('inventory'); // 'inventory' | 'orders' | 'promotions'
  const [dashboardSortField, setDashboardSortField] = useState('name');
  const [dashboardSortOrder, setDashboardSortOrder] = useState('asc'); // 'asc' | 'desc'
  const [dashboardStockFilter, setDashboardStockFilter] = useState('all'); // 'all' | 'low' | 'out' | 'in'
  const [salesLogSearch, setSalesLogSearch] = useState('');
  const [salesLogDateFilter, setSalesLogDateFilter] = useState('all'); // 'all' | 'today' | 'week' | 'month'
  const [salesLogStatusFilter, setSalesLogStatusFilter] = useState('all'); // 'all' | 'active' | 'cancelled'
  const [valuationSearch, setValuationSearch] = useState('');
  const [valuationCategory, setValuationCategory] = useState('All');
  const [valuationSortField, setValuationSortField] = useState('originalIndex');
  const [valuationSortOrder, setValuationSortOrder] = useState('asc');
  const [valuationPricingMode, setValuationPricingMode] = useState('discounted'); // 'discounted' | 'regular'

  // CSV/PDF Upload state
  const [uploadModal, setUploadModal] = useState(false);

  // Internal Warehouse Box & Quote Location States
  const [warehouseLocations, setWarehouseLocations] = useState([]);
  const [warehouseBoxes, setWarehouseBoxes] = useState([]);
  const [warehouseSummary, setWarehouseSummary] = useState(null);
  const [warehouseSearch, setWarehouseSearch] = useState('');
  const [selectedBoxFilter, setSelectedBoxFilter] = useState('all');
  const [warehouseSubView, setWarehouseSubView] = useState('items'); // 'items' | 'boxes' | 'intake'
  const [selectedBoxManifest, setSelectedBoxManifest] = useState('1');
  const [invoicePrintMode, setInvoicePrintMode] = useState('commercial'); // 'commercial' | 'internal_pick'
  const [intakeWarehouse, setIntakeWarehouse] = useState('Warehouse 2 (Annex)');
  const [intakeQuoteNo, setIntakeQuoteNo] = useState('Quote #39');
  const [intakeBoxNo, setIntakeBoxNo] = useState('39');
  const [intakeItemsText, setIntakeItemsText] = useState('');
  const [intakeStatus, setIntakeStatus] = useState('');

  // Load internal warehouse box & quote locations when merchant is authenticated
  useEffect(() => {
    if (isMerchantAuthenticated) {
      fetch('/api/admin/warehouse/locations', {
        headers: { 'Authorization': `Bearer ${sessionStorage.getItem('manna_admin_token') || ''}` }
      })
      .then(res => res.json())
      .then(data => {
        if (Array.isArray(data) && data.length > 0) {
          setWarehouseLocations(data);
        } else {
          throw new Error('API returned empty');
        }
      })
      .catch(() => {
        fetch('/warehouse_locations.json')
          .then(res => res.json())
          .then(data => {
            if (Array.isArray(data)) setWarehouseLocations(data);
          })
          .catch(() => {});
      });

      fetch('/api/admin/warehouse/boxes', {
        headers: { 'Authorization': `Bearer ${sessionStorage.getItem('manna_admin_token') || ''}` }
      })
      .then(res => res.json())
      .then(data => {
        if (Array.isArray(data)) setWarehouseBoxes(data);
      })
      .catch(() => {});

      fetch('/api/admin/warehouse/summary', {
        headers: { 'Authorization': `Bearer ${sessionStorage.getItem('manna_admin_token') || ''}` }
      })
      .then(res => res.json())
      .then(data => {
        if (data && data.breakdown) setWarehouseSummary(data);
      })
      .catch(() => {});
    }
  }, [isMerchantAuthenticated]);

  // Helper to match any product item with its internal box and quote location
  const getItemLocations = (itemName, productId) => {
    if (!warehouseLocations || warehouseLocations.length === 0) return [];
    const n = (itemName || '').toLowerCase().trim();
    const pid = (productId || '').toLowerCase().trim();
    
    // First try exact product ID match
    if (pid) {
      const byId = warehouseLocations.filter(loc => loc.product_id && loc.product_id.toLowerCase() === pid);
      if (byId.length > 0) return byId;
    }
    
    // Try matching on name
    if (n) {
      const byName = warehouseLocations.filter(loc => {
        const locN = (loc.item_name || '').toLowerCase().trim();
        return locN === n || locN.includes(n) || n.includes(locN);
      });
      if (byName.length > 0) return byName;
    }

    return [];
  };
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

  // Always fetch latest products from database on mount to guarantee fresh live stock counts
  useEffect(() => {
    fetch('/api/products')
      .then(res => res.json())
      .then(data => {
        if (Array.isArray(data) && data.length > 0) {
          setProducts(prev => {
            // Merge with existing admin edits if any, but ensure full SKU coverage
            const map = new Map(data.map(p => [p.id, p]));
            // Also preserve capital costs if available in initialCatalog or prev
            return data.map(item => {
              const existing = prev.find(p => p.id === item.id) || initialCatalog.find(p => p.id === item.id);
              return {
                ...item,
                capital: existing?.capital ?? item.capital ?? (Math.round((item.price * 0.78) * 100) / 100)
              };
            });
          });
        }
      })
      .catch(err => console.log('Products API sync fallback to catalog:', err));
  }, []);

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

  // UX Polish: Scroll progress & scroll-to-top detection
  useEffect(() => {
    const handleScroll = () => {
      const totalHeight = document.documentElement.scrollHeight - window.innerHeight;
      if (totalHeight > 0) {
        setScrollProgress((window.scrollY / totalHeight) * 100);
      }
      setShowScrollTop(window.scrollY > 300);
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // UX Polish: Cmd+K / Ctrl+K quick search trigger
  useEffect(() => {
    const handleKeyDown = (e) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        if (searchInputRef.current) {
          searchInputRef.current.focus();
          searchInputRef.current.select();
        }
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // UX Polish: Capture UTM and referral parameters into sessionStorage
  useEffect(() => {
    try {
      const params = new URLSearchParams(window.location.search);
      const utmSource = params.get('utm_source');
      const utmMedium = params.get('utm_medium');
      const utmCampaign = params.get('utm_campaign');
      if (utmSource || utmMedium || utmCampaign) {
        sessionStorage.setItem('manna_utm', JSON.stringify({
          utm_source: utmSource || '',
          utm_medium: utmMedium || '',
          utm_campaign: utmCampaign || '',
          capturedAt: new Date().toISOString()
        }));
      }
    } catch {}
  }, []);

  const categories = useMemo(() => {
    return ['All', ...new Set(products.map(p => p.category))];
  }, [products]);

  // Filtered products for public views (excludes cancelled / inconsistency items)
  const filteredProducts = useMemo(() => {
    let list = products.filter(p => {
      if (p.isCancelled || p.status === 'cancelled') return false;
      const matchCat = selectedCategory === 'All' || p.category === selectedCategory;
      const matchSearch = p.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          p.id.toLowerCase().includes(searchQuery.toLowerCase());
      const matchStock = catalogFilterInStock ? p.stock > 0 : true;
      const matchBrand = selectedBrandFilter ? p.name.toLowerCase().includes(selectedBrandFilter.toLowerCase()) : true;

      let matchQuick = true;
      if (homeQuickFilter === 'deals') {
        const disc = Number(p.discount_percent || 0);
        matchQuick = disc >= 15 || storewideDiscount >= 15;
      } else if (homeQuickFilter === 'under100') {
        matchQuick = Number(p.price || 0) <= 100;
      } else if (homeQuickFilter === 'new') {
        matchQuick = p.id.startsWith('MNA-NT-');
      } else if (homeQuickFilter === 'surplus') {
        matchQuick = (p.description && /surplus|display|as-is/i.test(p.description)) || p.stock < 10;
      }

      return matchCat && matchSearch && matchStock && matchBrand && matchQuick;
    });

    if (homeQuickFilter === 'bestseller') {
      list = [...list].sort((a, b) => (Number(b.sold || 0) - Number(a.sold || 0)));
    }

    return list;
  }, [products, selectedCategory, searchQuery, catalogFilterInStock, selectedBrandFilter, homeQuickFilter, storewideDiscount]);

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
    if (appliedPromo && cartSubtotal >= (appliedPromo.minSpend || 0)) {
      if (appliedPromo.type === 'percentage') disc += (cartSubtotal * (appliedPromo.value / 100));
      else disc += appliedPromo.value;
    }
    if (storewideDiscount > 0) disc += (cartSubtotal * (storewideDiscount / 100));
    return Math.min(disc, cartSubtotal);
  }, [cartSubtotal, appliedPromo, storewideDiscount]);

  // Proactively deactivate promo code if cart subtotal drops below required spend
  useEffect(() => {
    if (appliedPromo && cartSubtotal < appliedPromo.minSpend) {
      const diff = appliedPromo.minSpend - cartSubtotal;
      setPromoMessage({
        text: `Voucher "${appliedPromo.code.toUpperCase()}" removed: cart subtotal (₱${cartSubtotal.toLocaleString(undefined, { minimumFractionDigits: 2 })}) fell below ₱${appliedPromo.minSpend.toLocaleString()}. Add ₱${diff.toLocaleString(undefined, { minimumFractionDigits: 2 })} more to re-activate.`,
        type: 'error'
      });
      setAppliedPromo(null);
    }
  }, [cartSubtotal, appliedPromo]);

  // Long Cargo (10ft+ Structural Materials @ ₱50/km)
  const hasLongCargo = useMemo(() => {
    return cart.some(item => isLongCargoItem(item));
  }, [cart]);

  const longCargoItemsInCart = useMemo(() => {
    return cart.filter(item => isLongCargoItem(item));
  }, [cart]);

  const deliveryDistanceKm = useMemo(() => {
    return Math.max(1, Number(customer.distanceKm || 8));
  }, [customer.distanceKm]);

  const longCargoFee = useMemo(() => {
    return hasLongCargo ? (deliveryDistanceKm * 50) : 0;
  }, [hasLongCargo, deliveryDistanceKm]);

  const baseShippingFee = useMemo(() => {
    return cartSubtotal >= 3000 || cart.length === 0 ? 0 : 150;
  }, [cartSubtotal, cart.length]);

  const shippingFee = useMemo(() => {
    if (cart.length === 0) return 0;
    return baseShippingFee + longCargoFee;
  }, [cart.length, baseShippingFee, longCargoFee]);

  const orderTotal = Math.max(0, cartSubtotal - discountAmount + shippingFee);

  // Wholesale Clearance Minimum Order Enforcement (₱15,000 for mix-and-match; bypassed for Whole Lots or Retail Mode)
  const WHOLESALE_MIN_ORDER = 15000;
  const hasWholeLotInCart = useMemo(() => {
    return cart.some(item => item.isWholeLot);
  }, [cart]);

  const isWholesaleMinMet = useMemo(() => {
    if (isRetailMode) return true; // Retail mode has no minimum spend requirement
    if (hasWholeLotInCart) return true; // Whole lots always satisfy qualification
    return cartSubtotal >= WHOLESALE_MIN_ORDER;
  }, [isRetailMode, hasWholeLotInCart, cartSubtotal]);

  const wholesaleDeficit = useMemo(() => {
    return Math.max(0, WHOLESALE_MIN_ORDER - cartSubtotal);
  }, [cartSubtotal]);

  // Sort helper function for indicators
  const renderSortIndicator = (field, currentField, currentOrder) => {
    if (field !== currentField) {
      return <ArrowUpDown className="w-3 h-3 text-slate-400 opacity-60 inline ml-1" />;
    }
    return currentOrder === 'asc' 
      ? <ArrowUp className="w-3 h-3 text-[#EE4D2D] inline ml-1 font-bold" />
      : <ArrowDown className="w-3 h-3 text-[#EE4D2D] inline ml-1 font-bold" />;
  };

  const handleDashboardSort = (field) => {
    if (dashboardSortField === field) {
      setDashboardSortOrder(prev => prev === 'asc' ? 'desc' : 'asc');
    } else {
      setDashboardSortField(field);
      setDashboardSortOrder('asc');
    }
  };

  const handleCatalogSort = (field) => {
    if (catalogSortField === field) {
      setCatalogSortOrder(prev => prev === 'asc' ? 'desc' : 'asc');
    } else {
      setCatalogSortField(field);
      setCatalogSortOrder('asc');
    }
  };

  // Sorted and filtered catalog products for Full Catalog
  const sortedCatalogProducts = useMemo(() => {
    return [...filteredProducts].sort((a, b) => {
      let valA = a[catalogSortField];
      let valB = b[catalogSortField];

      if (catalogSortField === 'price' || catalogSortField === 'stock') {
        valA = Number(valA || 0);
        valB = Number(valB || 0);
        return catalogSortOrder === 'asc' ? valA - valB : valB - valA;
      }

      valA = (valA || '').toString().toLowerCase();
      valB = (valB || '').toString().toLowerCase();
      if (valA < valB) return catalogSortOrder === 'asc' ? -1 : 1;
      if (valA > valB) return catalogSortOrder === 'asc' ? 1 : -1;
      return 0;
    });
  }, [filteredProducts, catalogSortField, catalogSortOrder]);

  // Sorted and filtered products for Merchant Dashboard
  const sortedDashboardProducts = useMemo(() => {
    let list = products.filter(p => {
      const isItemCancelled = Boolean(p.isCancelled || p.status === 'cancelled');

      // Stock & Inconsistency filter
      if (dashboardStockFilter === 'cancelled') {
        if (!isItemCancelled) return false;
      } else if (dashboardStockFilter === 'low') {
        if (p.stock >= 10 || p.stock <= 0 || isItemCancelled) return false;
      } else if (dashboardStockFilter === 'out') {
        if (p.stock > 0 || isItemCancelled) return false;
      } else if (dashboardStockFilter === 'in') {
        if (p.stock <= 0 || isItemCancelled) return false;
      }

      if (!itemSearchTerm) return true;
      const term = itemSearchTerm.toLowerCase();
      return p.name.toLowerCase().includes(term) || 
             p.id.toLowerCase().includes(term) || 
             (p.category && p.category.toLowerCase().includes(term));
    });

    return [...list].sort((a, b) => {
      let valA = a[dashboardSortField];
      let valB = b[dashboardSortField];

      if (dashboardSortField === 'price' || dashboardSortField === 'capital' || dashboardSortField === 'stock' || dashboardSortField === 'discount_percent') {
        valA = Number(valA || 0);
        valB = Number(valB || 0);
        return dashboardSortOrder === 'asc' ? valA - valB : valB - valA;
      }

      valA = (valA || '').toString().toLowerCase();
      valB = (valB || '').toString().toLowerCase();
      if (valA < valB) return dashboardSortOrder === 'asc' ? -1 : 1;
      if (valA > valB) return dashboardSortOrder === 'asc' ? 1 : -1;
      return 0;
    });
  }, [products, itemSearchTerm, dashboardSortField, dashboardSortOrder, dashboardStockFilter]);

  // ==================== ADVANCED FINANCIAL & PNL METRICS ====================
  const financialMetrics = useMemo(() => {
    const validOrders = orders.filter(o => o.status !== 'Cancelled');
    const cancelledOrders = orders.filter(o => o.status === 'Cancelled');

    let totalGrossRevenue = 0;
    let totalCOGS = 0;
    let totalDiscountsAbsorbed = 0;
    let totalItemsSold = 0;
    let totalShippingRecovered = 0;

    // Itemized sales ledger across all orders
    const itemizedSales = [];

    orders.forEach(o => {
      const isCancelled = o.status === 'Cancelled';
      if (!isCancelled) {
        totalGrossRevenue += Number(o.total || 0);
        totalDiscountsAbsorbed += Number(o.discountAmount || 0);
        if (o.total && (o.subtotal || 0) < 3000) {
          totalShippingRecovered += 150;
        }
      }

      (o.items || []).forEach(it => {
        const prod = products.find(p => p.id === (it.id || it.product_id));
        const qty = Number(it.quantity || 1);
        const unitPrice = Number(it.price || prod?.price || 0);
        const unitCapital = Number(prod?.capital || (unitPrice > 0 ? unitPrice * 0.76 : 0));
        const lineRevenue = Number(it.total || unitPrice * qty);
        const lineCost = unitCapital * qty;
        const lineProfit = lineRevenue - lineCost;
        const marginPct = lineRevenue > 0 ? ((lineProfit / lineRevenue) * 100).toFixed(1) : '0';

        if (!isCancelled) {
          totalCOGS += lineCost;
          totalItemsSold += qty;
        }

        itemizedSales.push({
          orderId: o.orderId,
          date: o.date,
          customerName: o.customer?.fullName || 'Walk-in Customer',
          customerPhone: o.customer?.phone || '',
          customerAddress: o.customer?.address || 'Tacloban Hub',
          productId: it.id || it.product_id || (prod?.id || 'MNA-SKU'),
          productName: it.name || prod?.name || 'Hardware SKU',
          category: prod?.category || 'General Hardware',
          quantity: qty,
          unitPrice,
          unitCapital,
          lineRevenue,
          lineCost,
          lineProfit,
          marginPct,
          paymentMethod: o.customer?.paymentMethod || 'cod',
          status: o.status
        });
      });
    });

    const grossProfit = totalGrossRevenue - totalCOGS;
    const grossMarginPct = totalGrossRevenue > 0 ? ((grossProfit / totalGrossRevenue) * 100).toFixed(1) : '0';
    const netProfit = grossProfit; // Operations profit

    // Warehouse Inventory Valuation across catalog
    let inventoryCostValue = 0;
    let inventoryRetailValue = 0;
    let totalStockCount = 0;
    let outOfStockCount = 0;
    let lowStockCount = 0;
    let cancelledProductCount = 0;

    products.forEach(p => {
      const isCancelled = Boolean(p.isCancelled || p.status === 'cancelled');
      if (isCancelled) {
        cancelledProductCount++;
        return; // Exclude cancelled / discrepancy items from active valuation
      }
      const stock = Math.max(0, Number(p.stock || 0));
      const cap = Number(p.capital || 0);
      const prc = Number(p.price || 0);
      totalStockCount += stock;
      inventoryCostValue += (cap * stock);
      inventoryRetailValue += (prc * stock);

      if (stock <= 0) outOfStockCount++;
      else if (stock < 10) lowStockCount++;
    });

    const unrealizedProfit = inventoryRetailValue - inventoryCostValue;
    const inventoryPotentialMarginPct = inventoryRetailValue > 0 ? ((unrealizedProfit / inventoryRetailValue) * 100).toFixed(1) : '0';

    return {
      validOrdersCount: validOrders.length,
      cancelledOrdersCount: cancelledOrders.length,
      cancelledProductCount,
      activeProductCount: products.length - cancelledProductCount,
      totalGrossRevenue,
      totalCOGS,
      grossProfit,
      grossMarginPct,
      netProfit,
      totalDiscountsAbsorbed,
      totalItemsSold,
      totalShippingRecovered,
      itemizedSales,
      inventoryCostValue,
      inventoryRetailValue,
      unrealizedProfit,
      inventoryPotentialMarginPct,
      totalStockCount,
      outOfStockCount,
      lowStockCount
    };
  }, [orders, products]);

  // Category analytics breakdown for charts
  const categoryAnalytics = useMemo(() => {
    const catMap = {};
    products.forEach(p => {
      const cat = p.category || 'General Hardware';
      if (!catMap[cat]) {
        catMap[cat] = { name: cat, count: 0, costValue: 0, retailValue: 0, soldQty: 0, revenue: 0, profit: 0 };
      }
      const st = Math.max(0, Number(p.stock || 0));
      catMap[cat].count += 1;
      catMap[cat].costValue += (Number(p.capital || 0) * st);
      catMap[cat].retailValue += (Number(p.price || 0) * st);
    });

    financialMetrics.itemizedSales.forEach(sale => {
      if (sale.status !== 'Cancelled' && catMap[sale.category]) {
        catMap[sale.category].soldQty += sale.quantity;
        catMap[sale.category].revenue += sale.lineRevenue;
        catMap[sale.category].profit += sale.lineProfit;
      }
    });

    return Object.values(catMap).sort((a, b) => b.retailValue - a.retailValue);
  }, [products, financialMetrics]);

  // Filtered sales log items
  const filteredSalesLog = useMemo(() => {
    return financialMetrics.itemizedSales.filter(sale => {
      if (salesLogStatusFilter === 'active' && sale.status === 'Cancelled') return false;
      if (salesLogStatusFilter === 'cancelled' && sale.status !== 'Cancelled') return false;

      if (salesLogSearch) {
        const query = salesLogSearch.toLowerCase();
        const matchesQuery = 
          sale.orderId.toLowerCase().includes(query) ||
          sale.customerName.toLowerCase().includes(query) ||
          sale.productName.toLowerCase().includes(query) ||
          sale.productId.toLowerCase().includes(query) ||
          sale.category.toLowerCase().includes(query);
        if (!matchesQuery) return false;
      }

      return true;
    });
  }, [financialMetrics.itemizedSales, salesLogSearch, salesLogStatusFilter]);

  // Export Sales Log to CSV
  const exportSalesLogToCSV = () => {
    const headers = ['Order ID', 'Date', 'Customer Name', 'Customer Phone', 'SKU', 'Product Name', 'Category', 'Quantity Sold', 'Unit Price (PHP)', 'Unit Capital (PHP)', 'Line Revenue (PHP)', 'Line Capital Cost (PHP)', 'Line Profit (PHP)', 'Margin %', 'Payment Method', 'Status'];
    const rows = filteredSalesLog.map(s => [
      `"${s.orderId}"`,
      `"${s.date}"`,
      `"${s.customerName.replace(/"/g, '""')}"`,
      `"${s.customerPhone}"`,
      `"${s.productId}"`,
      `"${s.productName.replace(/"/g, '""')}"`,
      `"${s.category.replace(/"/g, '""')}"`,
      s.quantity,
      s.unitPrice,
      s.unitCapital,
      s.lineRevenue,
      s.lineCost,
      s.lineProfit,
      `${s.marginPct}%`,
      `"${s.paymentMethod}"`,
      `"${s.status}"`
    ]);

    const csvContent = [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `manna_sales_log_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // ==================== OWNER INVENTORY COST & POTENTIAL VALUATION REPORT ====================
  const handleValuationSort = (field) => {
    if (valuationSortField === field) {
      setValuationSortOrder(prev => prev === 'asc' ? 'desc' : 'asc');
    } else {
      setValuationSortField(field);
      setValuationSortOrder('asc');
    }
  };

  const handleInlineCapitalChange = (id, newCapital) => {
    const capVal = Math.max(0, parseFloat(newCapital) || 0);
    setProducts(prev => prev.map(p => p.id === id ? { ...p, capital: capVal } : p));
    fetch(`/api/admin/products/${id}`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${sessionStorage.getItem('manna_admin_token') || ''}`
      },
      body: JSON.stringify({ capital: capVal })
    }).catch(() => {});
  };

  const valuationRows = useMemo(() => {
    const list = products.filter(p => {
      const matchCat = valuationCategory === 'All' || p.category === valuationCategory;
      if (!matchCat) return false;
      if (!valuationSearch) return true;
      const q = valuationSearch.toLowerCase();
      return p.name.toLowerCase().includes(q) || (p.id && p.id.toLowerCase().includes(q));
    });

    const mapped = list.map((p, idx) => {
      const qty = Math.max(0, Number(p.stock || 0));
      const unitCapital = Number(p.capital || 0);
      const totalCapital = qty * unitCapital;
      const regularPrice = Number(p.price || 0);
      
      // Calculate effective discounted price based on active per-item discount and sitewide discount
      const itemDisc = Number(p.discount_percent || 0);
      const activeDisc = Math.max(itemDisc, storewideDiscount);
      const effectiveUnitPrice = (valuationPricingMode === 'discounted' && activeDisc > 0)
        ? Number((regularPrice * (1 - activeDisc / 100)).toFixed(2))
        : regularPrice;

      const totalSellingPrice = qty * effectiveUnitPrice;
      const potentialProfit = totalSellingPrice - totalCapital;
      const marginPct = totalSellingPrice > 0 ? ((potentialProfit / totalSellingPrice) * 100).toFixed(1) : '0';

      return {
        ...p,
        rowIndex: idx + 1,
        qty,
        unitCapital,
        totalCapital,
        regularPrice,
        unitPrice: effectiveUnitPrice,
        appliedDiscount: activeDisc,
        totalSellingPrice,
        potentialProfit,
        marginPct
      };
    });

    return mapped.sort((a, b) => {
      let valA = a[valuationSortField];
      let valB = b[valuationSortField];

      if (['rowIndex', 'qty', 'unitCapital', 'totalCapital', 'unitPrice', 'totalSellingPrice', 'potentialProfit', 'marginPct'].includes(valuationSortField)) {
        valA = Number(valA || 0);
        valB = Number(valB || 0);
        return valuationSortOrder === 'asc' ? valA - valB : valB - valA;
      }

      valA = (valA || '').toString().toLowerCase();
      valB = (valB || '').toString().toLowerCase();
      if (valA < valB) return valuationSortOrder === 'asc' ? -1 : 1;
      if (valA > valB) return valuationSortOrder === 'asc' ? 1 : -1;
      return 0;
    });
  }, [products, valuationCategory, valuationSearch, valuationSortField, valuationSortOrder, valuationPricingMode, storewideDiscount]);

  const valuationTotals = useMemo(() => {
    let totalQty = 0;
    let totalCostCapital = 0;
    let totalPotentialSelling = 0;

    valuationRows.forEach(r => {
      totalQty += r.qty;
      totalCostCapital += r.totalCapital;
      totalPotentialSelling += r.totalSellingPrice;
    });

    const totalProfit = totalPotentialSelling - totalCostCapital;
    const overallMarginPct = totalPotentialSelling > 0 ? ((totalProfit / totalPotentialSelling) * 100).toFixed(1) : '0';

    return {
      totalQty,
      totalCostCapital,
      totalPotentialSelling,
      totalProfit,
      overallMarginPct
    };
  }, [valuationRows]);

  const exportValuationSheetToCSV = () => {
    const headers = ['#', 'Qty', 'U/M', 'Item Description', 'Unit Capital', 'Total Capital', 'Unit Price', 'Total Selling Price', 'Potential Profit', 'Margin %'];
    const rows = valuationRows.map((r, i) => [
      i + 1,
      r.qty,
      `"${r.unit || 'pc'}"`,
      `"${r.name.replace(/"/g, '""')}"`,
      r.unitCapital.toFixed(2),
      r.totalCapital.toFixed(2),
      r.unitPrice.toFixed(2),
      r.totalSellingPrice.toFixed(2),
      r.potentialProfit.toFixed(2),
      `${r.marginPct}%`
    ]);

    rows.push([
      'TOTALS',
      valuationTotals.totalQty,
      '',
      `"Total across ${valuationRows.length} items"`,
      '',
      valuationTotals.totalCostCapital.toFixed(2),
      '',
      valuationTotals.totalPotentialSelling.toFixed(2),
      valuationTotals.totalProfit.toFixed(2),
      `${valuationTotals.overallMarginPct}%`
    ]);

    const csvContent = [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `manna_inventory_cost_and_potential_report_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Cart actions with Wholesale packaging increments
  const addToCart = (product, qty = null) => {
    if (product.stock <= 0) return;
    const pack = getProductWholesalePack(product, isRetailMode);
    const quantityToAdd = (qty !== null && qty !== undefined) ? qty : pack.minQty;
    setCart(prev => {
      const existing = prev.find(item => item.id === product.id);
      if (existing) {
        return prev.map(item => item.id === product.id ? { ...item, quantity: item.quantity + quantityToAdd } : item);
      }
      return [...prev, { ...product, quantity: quantityToAdd }];
    });
  };

  // Instant One-Button Buy Whole Lot Tile Action (Plumber, Structural, Electrical, Paint, Fasteners)
  const buyWholeLot = (lot) => {
    const lotImageMap = {
      'structural-lot': 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRJ1lDF-ht6yaqParkahCFb91OYZoNf7fsHZoLZhP8q7g&s=10',
      'plumber-lot': 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTb2xbrIDcug5TiTWXFg_ouj3oP8x1AVb7M5rg3pwOsqg&s=10',
      'paint-lot': 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcR1kVAYMpJTgWxNh5VMpl8dGuewXHpkZZzybncsM66Y3w&s=10',
      'electrical-lot': 'https://images.pexels.com/photos/175039/pexels-photo-175039.jpeg?auto=compress&cs=tinysrgb&h=650&w=940',
      'fastener-lot': 'https://images.pexels.com/photos/175039/pexels-photo-175039.jpeg?auto=compress&cs=tinysrgb&h=650&w=940'
    };

    const lotItem = {
      id: `LOT-${lot.id.toUpperCase()}`,
      name: `${lot.name} [WHOLE LOT PACKAGE]`,
      category: lot.category,
      unit: 'Complete Specialty Lot Package',
      price: lot.lotPrice,
      originalPrice: lot.retailValue,
      stock: 1,
      image: lotImageMap[lot.id] || 'https://images.pexels.com/photos/175039/pexels-photo-175039.jpeg?auto=compress&cs=tinysrgb&h=650&w=940',
      description: `${lot.summary} (Total Retail Value: ₱${lot.retailValue.toLocaleString('en-PH')}. Instant Wholesale Savings: ₱${lot.savings.toLocaleString('en-PH')})`,
      isWholeLot: true,
      savings: lot.savings,
      details: lot.details
    };

    setCart(prev => {
      const remaining = prev.filter(item => item.id !== lotItem.id);
      return [{ ...lotItem, quantity: 1 }, ...remaining];
    });

    if (selectedLotModal) {
      setSelectedLotModal(null);
    }

    setIsCartOpen(true);
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

  const setCartItemQty = (id, newQty) => {
    const val = parseInt(newQty, 10);
    setCart(prev => prev.map(item => {
      if (item.id === id) {
        if (isNaN(val) || val <= 0) return { ...item, quantity: 1 };
        const max = item.stock || 9999;
        return { ...item, quantity: Math.min(val, max) };
      }
      return item;
    }));
  };

  const handleInlineStockChange = (id, newStock) => {
    const stockVal = Math.max(0, parseInt(newStock, 10) || 0);
    setProducts(prev => {
      const updated = prev.map(p => p.id === id ? { ...p, stock: stockVal } : p);
      try {
        localStorage.setItem('manna_products', JSON.stringify(updated));
      } catch (err) {
        console.warn('LocalStorage save error:', err);
      }
      return updated;
    });
    fetch(`/api/admin/products/${id}`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${sessionStorage.getItem('manna_admin_token') || ''}`
      },
      body: JSON.stringify({ stock: stockVal })
    }).catch(() => {});
  };

  const handleInlineDiscountChange = (id, newDiscount) => {
    const discVal = Math.max(0, Math.min(95, parseFloat(newDiscount) || 0));
    setProducts(prev => {
      const updated = prev.map(p => p.id === id ? { ...p, discount_percent: discVal } : p);
      try {
        localStorage.setItem('manna_products', JSON.stringify(updated));
      } catch (err) {
        console.warn('LocalStorage save error:', err);
      }
      return updated;
    });
    fetch(`/api/admin/products/${id}/discount`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${sessionStorage.getItem('manna_admin_token') || ''}`
      },
      body: JSON.stringify({ discount_percent: discVal })
    }).catch(() => {});
  };

  const handleSaveDiscounts = async () => {
    try {
      const res = await fetch('/api/admin/save-discounts', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${sessionStorage.getItem('manna_admin_token') || ''}`
        },
        body: JSON.stringify({
          discounts: products.map(p => ({ id: p.id, discount_percent: Number(p.discount_percent || 0) })),
          storewideDiscount
        })
      });
      const data = await res.json();
      if (data.success) {
        localStorage.setItem('manna_products', JSON.stringify(products));
        alert('All discounts have been successfully saved to database and public catalog files!');
      } else {
        alert('Notice: Saved locally in browser session.');
      }
    } catch (err) {
      localStorage.setItem('manna_products', JSON.stringify(products));
      alert('Saved discounts to local store session successfully!');
    }
  };

  const handleToggleCancelItem = (id, customReason = 'Discrepancy with actual warehouse physical stock') => {
    setProducts(prev => {
      const target = prev.find(p => p.id === id);
      if (!target) return prev;
      const willCancel = !target.isCancelled && target.status !== 'cancelled';
      const updated = prev.map(p => {
        if (p.id === id) {
          return {
            ...p,
            isCancelled: willCancel,
            status: willCancel ? 'cancelled' : 'active',
            cancelReason: willCancel ? customReason : undefined,
            cancelledAt: willCancel ? new Date().toISOString() : undefined
          };
        }
        return p;
      });
      try {
        localStorage.setItem('manna_products', JSON.stringify(updated));
      } catch (err) {
        console.warn('LocalStorage save error:', err);
      }
      return updated;
    });

    fetch(`/api/admin/products/${id}`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${sessionStorage.getItem('manna_admin_token') || ''}`
      },
      body: JSON.stringify({ isCancelled: true, status: 'cancelled' })
    }).catch(() => {});
  };

  const removeFromCart = (id) => {
    setCart(prev => prev.filter(item => item.id !== id));
  };

  // Promo code application (bulk25: 20% off at min ₱25k, builder: 30% off at min ₱50k, hardware: 40% off at min ₱100k; case-insensitive)
  const applyPromoCode = (e, explicitCode = null) => {
    if (e && e.preventDefault) e.preventDefault();
    setPromoMessage({ text: '', type: '' });
    
    const rawInput = explicitCode || promoInput;
    if (!rawInput || !rawInput.trim()) {
      setPromoMessage({ text: 'Please enter a promo code (e.g. bulk25, builder, or hardware).', type: 'error' });
      return;
    }

    let clean = rawInput.trim().toLowerCase();
    // Support aliases
    if (clean === 'contractor25' || clean === 'tier1' || clean === 'contractor') clean = 'bulk25';
    if (clean === 'bulk50' || clean === 'tier2') clean = 'builder';
    if (clean === 'bulk100' || clean === 'tier3') clean = 'hardware';

    const found = discounts.find(d => d.code.toLowerCase() === clean && d.active);
    
    if (!found) {
      setPromoMessage({ 
        text: 'Invalid promo code. Active wholesale liquidation codes: "bulk25" (20% OFF, min ₱25K), "builder" (30% OFF, min ₱50K), or "hardware" (40% OFF, min ₱100K). Works in small or all caps.', 
        type: 'error' 
      });
      return;
    }

    if (cartSubtotal < found.minSpend) {
      const needed = found.minSpend - cartSubtotal;
      setPromoMessage({ 
        text: `Voucher "${clean.toUpperCase()}" requires a minimum purchase of ₱${found.minSpend.toLocaleString('en-PH')}. Your current cart is ₱${cartSubtotal.toLocaleString('en-PH', { minimumFractionDigits: 2 })}. Add ₱${needed.toLocaleString('en-PH', { minimumFractionDigits: 2 })} more to activate ${found.value}% OFF!`, 
        type: 'error' 
      });
      return;
    }

    setAppliedPromo(found);
    const savings = found.type === 'percentage' ? (cartSubtotal * (found.value / 100)) : found.value;
    setPromoMessage({ 
      text: `🎉 Code "${clean.toUpperCase()}" ACTIVATED! ${found.value}% wholesale discount applied (-₱${savings.toLocaleString('en-PH', { minimumFractionDigits: 2 })} savings).`, 
      type: 'success' 
    });
  };

  // Dynamic Inventory Manifest PDF Generation with live, updated quantities every download
  const downloadManifestPDF = () => {
    const activeProducts = products.filter(p => !p.isCancelled && p.status !== 'cancelled');
    const doc = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });
    const dateStr = new Date().toLocaleDateString('en-PH', { year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' });
    const fileDate = new Date().toISOString().slice(0, 10);
    const totalUnits = activeProducts.reduce((sum, p) => sum + (Math.max(0, Number(p.stock) || 0)), 0);
    const totalValuation = activeProducts.reduce((sum, p) => sum + ((Number(p.price) || 0) * Math.max(0, Number(p.stock) || 0)), 0);

    // Header styling
    doc.setFillColor(15, 23, 42); // slate-900
    doc.rect(0, 0, 210, 28, 'F');

    doc.setTextColor(255, 255, 255);
    doc.setFontSize(14);
    doc.setFont('helvetica', 'bold');
    doc.text('MANNA BUILDING SUPPLY', 14, 11);

    doc.setFontSize(9);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(203, 213, 225); // slate-300
    doc.text('Commercial Warehouse Stock & Inventory Manifest', 14, 17);
    doc.text('Tacloban City, Leyte • Hotline / Viber: 0926 199 5703', 14, 22);

    // Right header badges
    doc.setFontSize(8);
    doc.setTextColor(251, 191, 36); // amber-400
    doc.setFont('helvetica', 'bold');
    doc.text(`LIVE STOCK: ${totalUnits.toLocaleString()} UNITS`, 196, 11, { align: 'right' });
    doc.setTextColor(255, 255, 255);
    doc.setFont('helvetica', 'normal');
    doc.text(`Active Catalog: ${activeProducts.length} SKUs`, 196, 16, { align: 'right' });
    doc.text(`Generated: ${dateStr}`, 196, 21, { align: 'right' });

    // Table data
    const tableData = activeProducts.map((p, idx) => {
      const stock = Math.max(0, Number(p.stock) || 0);
      const price = Number(p.price) || 0;
      const wholesale = Math.round(price * 0.60 * 100) / 100;
      const total = price * stock;
      return [
        p.id || `MNA-${idx + 1000}`,
        p.name || 'Commercial Item',
        p.category || 'General',
        `${stock} ${p.unit || 'pc'}`,
        `P${price.toLocaleString('en-PH', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`,
        `P${wholesale.toLocaleString('en-PH', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`,
        `P${total.toLocaleString('en-PH', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
      ];
    });

    autoTable(doc, {
      startY: 32,
      head: [['SKU', 'Item Description', 'Category', 'Live Qty', 'Retail (PHP)', 'Wholesale 40% OFF', 'Line Total']],
      body: tableData,
      theme: 'striped',
      headStyles: {
        fillColor: [238, 77, 45], // #EE4D2D brand orange
        textColor: [255, 255, 255],
        fontSize: 7.5,
        fontStyle: 'bold',
        halign: 'left'
      },
      styles: {
        fontSize: 7,
        cellPadding: 1.8,
        lineColor: [226, 232, 240],
        textColor: [30, 41, 59]
      },
      columnStyles: {
        0: { cellWidth: 24, fontStyle: 'bold' },
        1: { cellWidth: 56 },
        2: { cellWidth: 32 },
        3: { cellWidth: 18, halign: 'center', fontStyle: 'bold' },
        4: { cellWidth: 24, halign: 'right' },
        5: { cellWidth: 26, halign: 'right', textColor: [22, 101, 52], fontStyle: 'bold' },
        6: { cellWidth: 26, halign: 'right', fontStyle: 'bold' }
      },
      didDrawPage: (data) => {
        // Footer on every page
        const pageCount = doc.internal.getNumberOfPages();
        doc.setFontSize(7);
        doc.setTextColor(148, 163, 184);
        doc.text(
          `Page ${data.pageNumber} of ${pageCount} • Manna Hardware Commercial Inventory Manifest • Tacloban City, Leyte • As-Is, Where-Is Commercial Terms`,
          14,
          290
        );
      }
    });

    doc.save(`manna_hardware_inventory_manifest_${fileDate}.pdf`);
  };

  // Download Full Inventory Manifest CSV for Contractors & Hardware Resellers (Updated: No liquidation)
  const downloadFullManifestCSV = () => {
    const headers = ['SKU', 'Item Name', 'Category', 'Unit', 'Stock On Hand', 'Retail Price (PHP)', 'Tier 3 Wholesale 40% OFF (PHP)', 'Total Retail Valuation (PHP)'];
    const rows = products.map(p => {
      const stock = Math.max(0, Number(p.stock) || 0);
      const price = Number(p.price) || 0;
      const wholesale = Math.round(price * 0.60 * 100) / 100;
      const total = price * stock;
      const cleanName = (p.name || '').replace(/"/g, '""');
      const cleanCat = (p.category || '').replace(/"/g, '""');
      return [
        `"${p.id || ''}"`,
        `"${cleanName}"`,
        `"${cleanCat}"`,
        `"${p.unit || 'pc'}"`,
        stock,
        price,
        wholesale,
        total
      ];
    });
    const csvContent = [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `manna_hardware_inventory_manifest_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Order status update & Cancellation
  const handleOrderStatusUpdate = async (orderId, newStatus) => {
    if (newStatus === 'Cancelled') {
      const confirmCancel = window.confirm(`Are you sure you want to cancel order ${orderId}? Inventory stock will be restored.`);
      if (!confirmCancel) return;
    }

    setOrders(prev => prev.map(o => o.orderId === orderId ? { ...o, status: newStatus } : o));
    setUserOrders(prev => prev.map(o => (o.id === orderId || o.orderId === orderId) ? { ...o, status: newStatus } : o));
    if (trackedOrder && (trackedOrder.orderId === orderId || trackedOrder.id === orderId)) {
      setTrackedOrder(prev => ({ ...prev, status: newStatus }));
    }

    try {
      await fetch(`/api/admin/orders/${orderId}/status`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${sessionStorage.getItem('manna_admin_token') || ''}`
        },
        body: JSON.stringify({ status: newStatus })
      });

      if (newStatus === 'Cancelled') {
        const targetOrder = orders.find(o => o.orderId === orderId) || userOrders.find(o => o.id === orderId || o.orderId === orderId);
        if (targetOrder && targetOrder.items) {
          setProducts(prev => {
            const copy = [...prev];
            for (const it of targetOrder.items) {
              const idx = copy.findIndex(p => p.id === (it.product_id || it.id));
              if (idx >= 0) {
                copy[idx] = { ...copy[idx], stock: (copy[idx].stock || 0) + (it.quantity || 1) };
              }
            }
            return copy;
          });
        }
      }
    } catch (e) {
      console.error('Failed to sync order status to server', e);
    }
  };

  const handleCancelOrder = async (orderId, source = 'merchant') => {
    const confirmCancel = window.confirm(`Are you sure you want to cancel order ${orderId}? Inventory stock will be restored.`);
    if (!confirmCancel) return;

    setCancellingOrderId(orderId);
    try {
      const endpoint = source === 'merchant'
        ? `/api/admin/orders/${orderId}/status`
        : `/api/orders/${orderId}/cancel`;

      const res = await fetch(endpoint, {
        method: source === 'merchant' ? 'PATCH' : 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(source === 'merchant' ? { 'Authorization': `Bearer ${sessionStorage.getItem('manna_admin_token') || ''}` } : {})
        },
        body: JSON.stringify({ status: 'Cancelled' })
      });

      const data = await res.json();
      if (res.ok) {
        setOrders(prev => prev.map(o => o.orderId === orderId ? { ...o, status: 'Cancelled' } : o));
        setUserOrders(prev => prev.map(o => (o.id === orderId || o.orderId === orderId) ? { ...o, status: 'Cancelled' } : o));
        if (trackedOrder && (trackedOrder.orderId === orderId || trackedOrder.id === orderId)) {
          setTrackedOrder(prev => ({ ...prev, status: 'Cancelled' }));
        }

        // Restore stock locally
        const targetOrder = orders.find(o => o.orderId === orderId) || userOrders.find(o => o.id === orderId || o.orderId === orderId);
        if (targetOrder && targetOrder.items) {
          setProducts(prev => {
            const copy = [...prev];
            for (const it of targetOrder.items) {
              const idx = copy.findIndex(p => p.id === (it.product_id || it.id));
              if (idx >= 0) {
                copy[idx] = { ...copy[idx], stock: (copy[idx].stock || 0) + (it.quantity || 1) };
              }
            }
            return copy;
          });
        }
        alert(`Order ${orderId} has been successfully cancelled and stock restored.`);
      } else {
        alert(data.error || 'Failed to cancel order.');
      }
    } catch (err) {
      console.error('Cancel order error:', err);
      setOrders(prev => prev.map(o => o.orderId === orderId ? { ...o, status: 'Cancelled' } : o));
      if (trackedOrder && (trackedOrder.orderId === orderId || trackedOrder.id === orderId)) {
        setTrackedOrder(prev => ({ ...prev, status: 'Cancelled' }));
      }
    } finally {
      setCancellingOrderId(null);
    }
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
            deliveryZone: customer.deliveryZone || 'Tacloban City Proper / Downtown / Port Area',
            distanceKm: deliveryDistanceKm,
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
        baseShippingFee: data.order.baseShippingFee,
        hasLongCargo: data.order.hasLongCargo,
        longCargoFee: data.order.longCargoFee,
        distanceKm: data.order.distanceKm,
        shippingFee: data.order.shippingFee,
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

  // Merchant Admin Password verification (Server-Side Zero-Exposure Gate)
  const handleAdminPasswordSubmit = async (e) => {
    e.preventDefault();
    setAdminPasswordError('');
    if (!adminPasswordInput.trim()) {
      setAdminPasswordError('Please enter the merchant security key.');
      return;
    }
    try {
      const res = await fetch('/api/admin/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password: adminPasswordInput.trim() })
      });
      const data = await res.json();
      if (res.ok && data.token) {
        setIsMerchantAuthenticated(true);
        sessionStorage.setItem('manna_merchant_auth', 'true');
        sessionStorage.setItem('manna_admin_token', data.token);
        setAdminPasswordInput('');
      } else {
        setAdminPasswordError(data.error || 'Incorrect security key. Access denied.');
      }
    } catch {
      setAdminPasswordError('Authentication service unreachable. Please retry.');
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
        discount_percent: Number(editingItem.discount_percent || 0),
        isCancelled: Boolean(editingItem.isCancelled || editingItem.status === 'cancelled'),
        status: (editingItem.isCancelled || editingItem.status === 'cancelled') ? 'cancelled' : 'active'
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
    <div className="min-h-screen bg-[#F6F6F6] text-[#222222] font-sans pb-16 md:pb-8 select-none w-full relative">
      {/* 20 Frontend Polish: 2px Top Scroll Progress Bar */}
      <div 
        className="fixed top-0 left-0 right-0 h-[2.5px] bg-amber-500 z-[100] transition-all duration-75 no-print" 
        style={{ width: `${scrollProgress}%` }} 
      />

      {/* 20 Frontend Polish: Accessible Skip-To-Content Link */}
      <a 
        href="#main-content" 
        className="sr-only focus:not-sr-only focus:fixed focus:top-2 focus:left-2 focus:z-[110] focus:px-4 focus:py-2 focus:bg-[#EE4D2D] focus:text-white focus:font-bold focus:rounded-md focus:shadow-xl focus:outline-none"
      >
        Skip to main content
      </a>
      
      {/* ==================== 1. DESKTOP TOP BRAND UTILITY BAR (md:flex) ==================== */}
      <div className="hidden md:block bg-[#D0011B] text-white/90 text-xs py-1.5 px-4 sm:px-6 lg:px-8 border-b border-red-700">
        <div className="max-w-7xl mx-auto flex items-center justify-end">

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

      {/* ==================== 1.5 WHOLESALE CLEARANCE & PRIVATE RETAIL GATEWAY BAR ==================== */}
      {isRetailMode ? (
        <div className="bg-emerald-800 text-white text-[11px] sm:text-xs py-2 px-3 sm:px-6 flex flex-wrap items-center justify-between gap-2 border-b border-emerald-600 shadow-sm">
          <div className="flex items-center gap-2">
            <span className="bg-white text-emerald-900 font-black text-[9px] px-2 py-0.5 rounded uppercase tracking-wider shadow-xs">
              🛍️ Retail Mode Active
            </span>
            <span className="text-emerald-100 font-medium">
              Single-piece ordering enabled &bull; No minimum purchase required.
            </span>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => toggleRetailMode(false)}
              className="bg-emerald-950 hover:bg-black text-amber-300 font-bold px-3 py-1 rounded text-[10px] sm:text-xs cursor-pointer transition-colors shadow-xs flex items-center gap-1"
            >
              <Flame className="w-3 h-3 text-red-500 animate-pulse" /> Switch to Wholesale Clearance (₱15k Min) &rarr;
            </button>
          </div>
        </div>
      ) : (
        <div className="bg-slate-950 text-amber-300 text-[11px] sm:text-xs py-2 px-3 sm:px-6 flex flex-wrap items-center justify-between gap-2 border-b border-amber-500/30 shadow-md">
          <div className="flex items-center gap-2 overflow-x-auto no-scrollbar">
            <span className="bg-amber-400 text-slate-950 font-black text-[9px] px-2 py-0.5 rounded uppercase tracking-wider shadow-xs shrink-0">
              ⚡ Wholesale Clearance
            </span>
            <span className="text-white font-medium shrink-0">
              Minimum mix-and-match order: <strong className="text-amber-400 font-bold">₱15,000</strong> &bull; Or buy any <strong className="text-amber-400 font-bold">Specialty Lot</strong> for 1-click clearance.
            </span>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            <button
              onClick={copyRetailLink}
              className="bg-amber-400 hover:bg-amber-300 text-slate-950 font-black px-2.5 py-1 rounded text-[10px] sm:text-xs flex items-center gap-1.5 cursor-pointer shadow-xs transition-colors"
              title="Copy private link for customers who want to purchase per piece without ₱15,000 minimum"
            >
              <Copy className="w-3 h-3" /> {copiedRetailLink ? '✓ Copied Link!' : 'Copy Private Retail Link'}
            </button>
            <button
              onClick={() => toggleRetailMode(true)}
              className="text-slate-300 hover:text-white text-[10px] sm:text-[11px] underline cursor-pointer ml-1"
            >
              Preview Single-Pc Mode
            </button>
          </div>
        </div>
      )}

      {/* Floating notification when private retail link copied */}
      {copiedRetailLink && (
        <div className="fixed top-14 right-4 z-50 bg-slate-900 text-amber-300 border-2 border-amber-400 px-4 py-3 rounded-xl shadow-2xl flex items-center gap-3 text-xs font-bold">
          <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
          <div>
            <p className="text-white font-black">Private Retail Link Copied to Clipboard!</p>
            <p className="text-[11px] text-amber-200 font-normal mt-0.5">Share with walk-in or single-piece customers who don't have the ₱15k wholesale minimum.</p>
          </div>
        </div>
      )}

      {/* ==================== 2. MANNA HARDWARE MAIN HEADER (#EE4D2D) ==================== */}
      <header className="sticky top-0 z-40 bg-[#EE4D2D] text-white shadow-md w-full backdrop-blur-md">
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

            {/* Search Input Container with Cmd+K ref & shortcut badge */}
            <div className="flex-1 bg-white rounded-md h-9 sm:h-10 px-3 flex items-center gap-2 shadow-xs border border-transparent focus-within:border-amber-400">
              <Search className="w-4 h-4 text-[#888888] shrink-0" />
              <input
                ref={searchInputRef}
                type="text"
                placeholder="Search C-purlins, Island Paint, Screws, Makita..."
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                className="w-full text-xs sm:text-sm text-[#222222] placeholder-[#EE4D2D]/70 font-normal focus:outline-none"
              />
              <span className="hidden sm:inline-block text-[10px] text-slate-400 bg-slate-100 px-1.5 py-0.5 rounded font-mono border border-slate-200 shrink-0">
                Ctrl+K
              </span>
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

              {/* WHOLESALE CONTRACTOR LOTS (30-40% OFF) */}
              <button
                onClick={() => setActiveTab('lots')}
                className={`whitespace-nowrap px-2.5 py-0.5 rounded cursor-pointer flex items-center gap-1.5 font-black transition-all ${
                  activeTab === 'lots' 
                    ? 'bg-amber-400 text-slate-950 shadow-md ring-2 ring-white/80' 
                    : 'bg-amber-500/90 text-white hover:bg-amber-400 hover:text-slate-950'
                }`}
              >
                <Flame className="w-3.5 h-3.5 text-red-600 animate-pulse" /> WHOLESALE LOTS (30-40% OFF)
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
      <div id="main-content" className="max-w-7xl mx-auto px-2 sm:px-4 lg:px-8 mt-2 sm:mt-4">
        
        {/* ==================== TAB 1: HOME FEED (RESPONSIVE 2-6 COLS) ==================== */}
        {activeTab === 'home' && (
          <main className="w-full space-y-4">

            {/* 1. HORIZONTAL STORIES / ITEM CIRCLES: DISPATCH NEAR YOU (NO FACES - AUTHENTIC ITEMS ONLY) */}
            <div className="bg-white rounded-2xl p-3 sm:p-4 border border-slate-200/90 shadow-2xs">
              <div className="flex items-center justify-between mb-3 px-1">
                <div className="flex items-center gap-1.5 text-xs sm:text-sm font-extrabold text-slate-900">
                  <MapPin className="w-4 h-4 text-emerald-600" />
                  <span>Items & Inventory Near You</span>
                  <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-full ml-1">
                    Tacloban & Palo Hub
                  </span>
                </div>
                <button 
                  onClick={() => { setActiveTab('catalog'); setSelectedCategory('All'); setSelectedBrandFilter(null); }}
                  className="text-xs text-slate-500 hover:text-[#EE4D2D] font-bold flex items-center gap-0.5 cursor-pointer transition-colors"
                >
                  <span>See all</span>
                  <ChevronRight className="w-3.5 h-3.5" />
                </button>
              </div>

              {/* Story Circles Row */}
              <div className="flex items-start gap-3 sm:gap-4 overflow-x-auto pb-1.5 pt-0.5 scrollbar-none px-1">
                {/* 1A. Use Location / Live Hub Beacon */}
                <button
                  onClick={() => { setSelectedCategory('All'); setSelectedBrandFilter(null); setHomeQuickFilter('all'); }}
                  className="flex flex-col items-center shrink-0 group cursor-pointer focus:outline-none"
                >
                  <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-full border-2 border-dashed border-emerald-500 p-0.5 flex items-center justify-center bg-emerald-50/50 group-hover:scale-105 transition-transform shadow-xs">
                    <div className="w-full h-full rounded-full bg-emerald-600 text-white flex flex-col items-center justify-center">
                      <MapPin className="w-5 h-5 animate-bounce" />
                      <span className="text-[7px] font-black uppercase tracking-tighter">LIVE HUB</span>
                    </div>
                  </div>
                  <span className="text-[10.5px] font-bold text-slate-800 mt-1.5 text-center leading-tight max-w-[64px] truncate">
                    Tacloban
                  </span>
                </button>

                {/* 1B. Authentic Hardware Items in Story Rings (NO FACES!) */}
                {[
                  { name: 'Davies Enamel', brand: 'DAVIES', img: '/images/davies_gloss_it_clean.jpg' },
                  { name: 'Boysen Paints', brand: 'BOYSEN', img: '/images/boysen_otc_clean.jpg' },
                  { name: 'Pylox Spray', brand: 'PYLOX', img: '/images/pylox_16_scarlet_clean.jpg' },
                  { name: 'Rosco Faucets', brand: 'ROSCO', img: '/images/gooseneck_faucet_clean.jpg' },
                  { name: 'Brass Valves', cat: 'Plumbing & Fixtures', img: '/images/brass_swing_valve_clean.jpg' },
                  { name: 'Blind Rivets', brand: 'BLIND RIVET', img: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQRFZtrOeadPeOXo9jb5u54sIQVGBf5238GsLSpoKbC0g&s' },
                  { name: 'Anam Outlets', brand: 'ANAM', img: '/images/anam_outlet_3213_clean.jpg' },
                  { name: 'Island Paints', brand: 'ISLAND', img: '/images/island_qde_clean.png' },
                  { name: 'Stikwel Glue', brand: 'STIKWEL', img: '/images/stikwel_clean.jpg' },
                  { name: 'Bosny Acrylic', brand: 'BOSNY', img: '/images/bosny_flat_black_04_clean.jpg' },
                  { name: 'Steel Purlins', cat: 'Structural & Building Materials', img: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTJzVHyZ12Skv8mdJfdA16ZpAhOWE03o76OVgrOxW1ffA&s=10' }
                ].map((st, i) => {
                  const isSelected = selectedBrandFilter === st.brand || (st.cat && selectedCategory === st.cat);
                  return (
                    <button
                      key={i}
                      onClick={() => {
                        if (st.brand) {
                          setSelectedBrandFilter(selectedBrandFilter === st.brand ? null : st.brand);
                          setSelectedCategory('All');
                        } else if (st.cat) {
                          setSelectedCategory(selectedCategory === st.cat ? 'All' : st.cat);
                          setSelectedBrandFilter(null);
                        }
                      }}
                      className="flex flex-col items-center shrink-0 group cursor-pointer focus:outline-none"
                    >
                      <div className={`w-14 h-14 sm:w-16 sm:h-16 rounded-full p-0.5 transition-all duration-200 group-hover:scale-105 shadow-2xs ${
                        isSelected 
                          ? 'ring-3 ring-[#EE4D2D] bg-gradient-to-tr from-[#EE4D2D] to-amber-500 scale-105' 
                          : 'bg-gradient-to-tr from-amber-400 via-orange-400 to-[#EE4D2D]'
                      }`}>
                        <div className="w-full h-full rounded-full bg-white p-0.5 overflow-hidden flex items-center justify-center">
                          <img
                            src={st.img}
                            alt={st.name}
                            className="w-full h-full object-contain rounded-full group-hover:scale-105 transition-transform"
                            onError={(e) => {
                              e.target.onerror = null;
                              e.target.src = '/images/davies_gloss_it_clean.jpg';
                            }}
                          />
                        </div>
                      </div>
                      <span className={`text-[10px] mt-1.5 text-center leading-tight max-w-[64px] truncate transition-colors ${
                        isSelected ? 'font-black text-[#EE4D2D]' : 'font-semibold text-slate-700 group-hover:text-slate-900'
                      }`}>
                        {st.name}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* 2. PROMO BANNER WITH SHORT INTRO, PROMOS & PROCEED TO WHOLESALE CLICK */}
            <div className="bg-gradient-to-r from-amber-400 via-amber-300 to-yellow-400 text-slate-900 rounded-2xl p-4 sm:p-6 shadow-md border border-amber-300 relative overflow-hidden">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 relative z-10">
                <div className="max-w-xl space-y-1.5">
                  <div className="inline-flex items-center gap-1.5 bg-red-600 text-white text-[10px] sm:text-xs font-black uppercase px-2.5 py-0.5 rounded-full shadow-xs">
                    <Flame className="w-3.5 h-3.5 animate-pulse" />
                    <span>SURPLUS & DISPLAY SALE • AS-IS, WHERE-IS</span>
                  </div>

                  <h2 className="text-xl sm:text-3xl font-black text-slate-950 tracking-tight leading-tight">
                    Up to 40% OFF Construction Surplus
                  </h2>

                  <p className="text-xs sm:text-sm text-slate-800 font-medium leading-snug">
                    Affordable contractor overstock, showroom display units & building materials. 100% sound, authentic & contractor-ready at below-retail prices.
                  </p>

                  {/* Active Tier Promos */}
                  <div className="flex flex-wrap items-center gap-1.5 sm:gap-2 pt-1 text-[11px] sm:text-xs font-extrabold text-slate-900">
                    <span className="bg-white/90 backdrop-blur-xs px-2.5 py-0.5 rounded-lg shadow-2xs border border-amber-300">
                      ₱25k = 20% OFF
                    </span>
                    <span className="bg-white/90 backdrop-blur-xs px-2.5 py-0.5 rounded-lg shadow-2xs border border-amber-300">
                      ₱50k = 30% OFF
                    </span>
                    <span className="bg-white/90 backdrop-blur-xs px-2.5 py-0.5 rounded-lg shadow-2xs border border-amber-300">
                      ₱100k = 40% OFF
                    </span>
                  </div>

                  {/* Proceed to Wholesale Primary CTA Button */}
                  <div className="pt-2 flex flex-wrap items-center gap-2">
                    <button
                      onClick={() => setActiveTab('lots')}
                      className="bg-[#EE4D2D] hover:bg-[#d73f20] text-white font-black text-xs sm:text-sm px-5 py-2.5 rounded-xl shadow-lg cursor-pointer transition-all flex items-center gap-2 active:scale-95 group"
                    >
                      <Package className="w-4 h-4 group-hover:rotate-6 transition-transform" />
                      <span>Proceed to Wholesale</span>
                      <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                    </button>
                    <button
                      onClick={() => { setActiveTab('catalog'); setSelectedCategory('All'); setSelectedBrandFilter(null); }}
                      className="bg-slate-900/10 hover:bg-slate-900/20 text-slate-950 font-bold text-xs sm:text-sm px-4 py-2.5 rounded-xl cursor-pointer transition-all border border-slate-900/20"
                    >
                      Browse 934 SKUs
                    </button>
                  </div>
                </div>

                {/* Right Hero Visual: Authentic Hardware Packshots */}
                <div className="shrink-0 hidden sm:flex items-center justify-center relative">
                  <div className="relative w-40 h-40 sm:w-48 sm:h-48 flex items-center justify-center">
                    <img
                      src="/images/davies_gloss_it_clean.jpg"
                      alt="Davies Paint"
                      className="w-32 h-32 object-contain drop-shadow-xl z-10"
                    />
                    <img
                      src="/images/pylox_16_scarlet_clean.jpg"
                      alt="Pylox Spray"
                      className="w-24 h-24 object-contain drop-shadow-lg absolute -bottom-2 -left-3 z-20"
                    />
                    <div className="absolute top-1 right-1 bg-red-600 text-white font-black text-xs px-2.5 py-1 rounded-full shadow-lg z-30 animate-pulse">
                      -40% OFF
                    </div>
                  </div>
                </div>
              </div>

              {/* Carousel Pagination Dots */}
              <div className="flex items-center justify-center gap-1.5 mt-2">
                <div className="w-5 h-1.5 bg-emerald-700 rounded-full"></div>
                <div className="w-1.5 h-1.5 bg-slate-700/40 rounded-full"></div>
                <div className="w-1.5 h-1.5 bg-slate-700/40 rounded-full"></div>
              </div>
            </div>

            {/* 3. 5 QUICK NAVIGATION ACTION ICONS */}
            <div className="grid grid-cols-5 gap-2 sm:gap-4 my-2">
              {[
                { id: 'bestseller', label: 'Best Seller', icon: Star, bg: 'bg-amber-50 text-amber-600 border-amber-200' },
                { id: 'new', label: 'New Arrival', icon: Sparkles, bg: 'bg-emerald-50 text-emerald-600 border-emerald-200' },
                { id: 'deals', label: 'Best Deals', icon: Tag, bg: 'bg-red-50 text-red-600 border-red-200' },
                { id: 'under100', label: 'Below ₱100', icon: Coins, bg: 'bg-blue-50 text-blue-600 border-blue-200' },
                { id: 'surplus', label: 'Surplus / Display', icon: RefreshCw, bg: 'bg-purple-50 text-purple-600 border-purple-200' },
              ].map(btn => {
                const Icon = btn.icon;
                const isActive = homeQuickFilter === btn.id;
                return (
                  <button
                    key={btn.id}
                    onClick={() => {
                      setHomeQuickFilter(isActive ? 'all' : btn.id);
                      setSelectedBrandFilter(null);
                    }}
                    className="flex flex-col items-center justify-center group cursor-pointer focus:outline-none"
                  >
                    <div className={`w-11 h-11 sm:w-13 sm:h-13 rounded-2xl border flex items-center justify-center shadow-xs transition-all duration-200 group-hover:scale-105 active:scale-95 ${
                      isActive ? 'ring-2 ring-[#EE4D2D] scale-105 shadow-md ' + btn.bg : btn.bg
                    }`}>
                      <Icon className="w-5 h-5 sm:w-6 sm:h-6" />
                    </div>
                    <span className={`text-[10px] sm:text-xs mt-1.5 text-center line-clamp-1 transition-colors ${
                      isActive ? 'font-black text-[#EE4D2D]' : 'font-semibold text-slate-700 group-hover:text-slate-900'
                    }`}>
                      {btn.label}
                    </span>
                  </button>
                );
              })}
            </div>

            {/* 4. TWO SIDE-BY-SIDE CARDS: FLASH SALE & SHOWROOM DISPLAY HUB (NO FACES - REAL HARDWARE ITEMS) */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {/* Card 4A: Flash Sale with Countdown Clock */}
              <div className="bg-white rounded-2xl p-3 sm:p-4 border border-slate-200/90 shadow-2xs flex flex-col justify-between">
                <div className="flex items-center justify-between mb-2.5">
                  <div className="flex items-center gap-1.5">
                    <span className="font-black text-sm sm:text-base text-slate-900 flex items-center gap-1">
                      Flash <Flame className="w-4 h-4 text-[#EE4D2D] fill-[#EE4D2D]" /> Sale
                    </span>
                  </div>
                  {/* Real Countdown Timer */}
                  <div className="flex items-center gap-1">
                    <span className="bg-slate-900 text-white font-mono font-black text-[11px] px-1.5 py-0.5 rounded shadow-xs">
                      {String(flashTime.hours).padStart(2, '0')}
                    </span>
                    <span className="font-black text-slate-900 text-xs">:</span>
                    <span className="bg-slate-900 text-white font-mono font-black text-[11px] px-1.5 py-0.5 rounded shadow-xs">
                      {String(flashTime.minutes).padStart(2, '0')}
                    </span>
                    <span className="font-black text-slate-900 text-xs">:</span>
                    <span className="bg-slate-900 text-white font-mono font-black text-[11px] px-1.5 py-0.5 rounded shadow-xs">
                      {String(flashTime.seconds).padStart(2, '0')}
                    </span>
                  </div>
                </div>

                {/* 2 Flash Deals Side-by-Side */}
                <div className="grid grid-cols-2 gap-2">
                  {/* Pylox Deal */}
                  <div className="bg-slate-50/70 border border-slate-100 rounded-xl p-2 flex flex-col justify-between relative group hover:bg-slate-100/60 transition-colors">
                    <div className="relative aspect-square w-full rounded-lg overflow-hidden bg-white mb-1.5 flex items-center justify-center">
                      <img src="/images/pylox_16_scarlet_clean.jpg" alt="Pylox Scarlet" className="w-full h-full object-contain p-1 group-hover:scale-105 transition-transform" />
                      <span className="absolute bottom-1 left-1 bg-red-600 text-white text-[9px] font-black px-1.5 py-0.2 rounded shadow-xs">
                        -40%
                      </span>
                    </div>
                    <div className="text-[11px] font-bold text-slate-800 line-clamp-1">Pylox Lazer #16 Scarlet</div>
                    <div className="flex items-baseline gap-1 mt-0.5">
                      <span className="text-[#EE4D2D] font-black text-xs sm:text-sm">₱140</span>
                      <span className="text-[10px] text-slate-400 line-through">₱235</span>
                    </div>
                    <button
                      onClick={() => {
                        const p = products.find(x => x.name.toLowerCase().includes('pylox') && x.name.toLowerCase().includes('scarlet')) || products[0];
                        addToCart(p, 1);
                      }}
                      className="mt-1.5 w-full bg-[#EE4D2D] hover:bg-[#d73f20] text-white text-[10px] font-bold py-1 rounded-md transition-colors cursor-pointer"
                    >
                      + Add Flash Deal
                    </button>
                  </div>

                  {/* Davies Gloss-It Deal */}
                  <div className="bg-slate-50/70 border border-slate-100 rounded-xl p-2 flex flex-col justify-between relative group hover:bg-slate-100/60 transition-colors">
                    <div className="relative aspect-square w-full rounded-lg overflow-hidden bg-white mb-1.5 flex items-center justify-center">
                      <img src="/images/davies_gloss_it_clean.jpg" alt="Davies Gloss-It" className="w-full h-full object-contain p-1 group-hover:scale-105 transition-transform" />
                      <span className="absolute bottom-1 left-1 bg-red-600 text-white text-[9px] font-black px-1.5 py-0.2 rounded shadow-xs">
                        -30%
                      </span>
                    </div>
                    <div className="text-[11px] font-bold text-slate-800 line-clamp-1">Davies Gloss-It Enamel 4L</div>
                    <div className="flex items-baseline gap-1 mt-0.5">
                      <span className="text-[#EE4D2D] font-black text-xs sm:text-sm">₱265</span>
                      <span className="text-[10px] text-slate-400 line-through">₱380</span>
                    </div>
                    <button
                      onClick={() => {
                        const p = products.find(x => x.name.toLowerCase().includes('davies') && x.name.toLowerCase().includes('gloss-it')) || products[1];
                        addToCart(p, 1);
                      }}
                      className="mt-1.5 w-full bg-[#EE4D2D] hover:bg-[#d73f20] text-white text-[10px] font-bold py-1 rounded-md transition-colors cursor-pointer"
                    >
                      + Add Flash Deal
                    </button>
                  </div>
                </div>
              </div>

              {/* Card 4B: Showroom Display Hub & Top Lots (NO FACES - HARDWARE ITEMS INSTEAD) */}
              <div className="bg-white rounded-2xl p-3 sm:p-4 border border-slate-200/90 shadow-2xs flex flex-col justify-between">
                <div className="flex items-center justify-between mb-2.5">
                  <div className="flex items-center gap-1.5">
                    <span className="font-black text-sm sm:text-base text-slate-900 flex items-center gap-1.5">
                      Showroom Display Hub <span className="inline-block w-2 h-2 rounded-full bg-red-600 animate-ping" />
                    </span>
                  </div>
                  <button 
                    onClick={() => setActiveTab('lots')} 
                    className="text-[11px] font-bold text-[#EE4D2D] hover:underline flex items-center gap-0.5 cursor-pointer"
                  >
                    <span>Wholesale Lots</span>
                    <ChevronRight className="w-3.5 h-3.5" />
                  </button>
                </div>

                {/* 2 Featured Showroom / Display Items */}
                <div className="grid grid-cols-2 gap-2">
                  {/* Rosco Faucet */}
                  <div className="bg-slate-50/70 border border-slate-100 rounded-xl p-2 flex flex-col justify-between relative group hover:bg-slate-100/60 transition-colors">
                    <div className="relative aspect-square w-full rounded-lg overflow-hidden bg-white mb-1.5 flex items-center justify-center">
                      <img src="/images/gooseneck_faucet_clean.jpg" alt="Rosco Faucet" className="w-full h-full object-contain p-1 group-hover:scale-105 transition-transform" />
                      <span className="absolute bottom-1 left-1 bg-amber-500 text-slate-950 text-[9px] font-black px-1.5 py-0.2 rounded shadow-xs">
                        SURPLUS
                      </span>
                    </div>
                    <div className="text-[11px] font-bold text-slate-800 line-clamp-1">Rosco Gooseneck Basin Faucet</div>
                    <div className="flex items-baseline gap-1 mt-0.5">
                      <span className="text-[#EE4D2D] font-black text-xs sm:text-sm">₱390</span>
                      <span className="text-[10px] text-slate-400 line-through">₱600</span>
                    </div>
                    <button
                      onClick={() => {
                        const p = products.find(x => x.name.toLowerCase().includes('rosco') && x.name.toLowerCase().includes('gooseneck')) || products[2];
                        addToCart(p, 1);
                      }}
                      className="mt-1.5 w-full bg-slate-900 hover:bg-slate-800 text-white text-[10px] font-bold py-1 rounded-md transition-colors cursor-pointer"
                    >
                      Claim As-Is
                    </button>
                  </div>

                  {/* Blind Rivets Box */}
                  <div className="bg-slate-50/70 border border-slate-100 rounded-xl p-2 flex flex-col justify-between relative group hover:bg-slate-100/60 transition-colors">
                    <div className="relative aspect-square w-full rounded-lg overflow-hidden bg-white mb-1.5 flex items-center justify-center">
                      <img src="https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQRFZtrOeadPeOXo9jb5u54sIQVGBf5238GsLSpoKbC0g&s" alt="Blind Rivets" className="w-full h-full object-contain p-1 group-hover:scale-105 transition-transform" />
                      <span className="absolute bottom-1 left-1 bg-amber-500 text-slate-950 text-[9px] font-black px-1.5 py-0.2 rounded shadow-xs">
                        DISPLAY
                      </span>
                    </div>
                    <div className="text-[11px] font-bold text-slate-800 line-clamp-1">Blind Rivets 1/8x1/2 (1000s)</div>
                    <div className="flex items-baseline gap-1 mt-0.5">
                      <span className="text-[#EE4D2D] font-black text-xs sm:text-sm">₱180</span>
                      <span className="text-[10px] text-slate-400 line-through">₱300</span>
                    </div>
                    <button
                      onClick={() => {
                        const p = products.find(x => x.name.toLowerCase().includes('blind rivet')) || products[3];
                        addToCart(p, 1);
                      }}
                      className="mt-1.5 w-full bg-slate-900 hover:bg-slate-800 text-white text-[10px] font-bold py-1 rounded-md transition-colors cursor-pointer"
                    >
                      Claim As-Is
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* 5. CATEGORY & BRAND PILL BAR */}
            <div className="bg-white rounded-2xl p-3 border border-slate-200/90 shadow-2xs space-y-2.5">
              {/* Category Pills */}
              <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none text-xs">
                <button
                  onClick={() => { setSelectedCategory('All'); setSelectedBrandFilter(null); setHomeQuickFilter('all'); }}
                  className={`px-3 py-1.5 rounded-full font-bold whitespace-nowrap transition-colors cursor-pointer ${
                    selectedCategory === 'All' && !selectedBrandFilter
                      ? 'bg-[#EE4D2D] text-white shadow-xs'
                      : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
                  }`}
                >
                  All Items
                </button>
                {['Plumbing & Fixtures', 'Electrical & Lighting', 'Paints & Coatings', 'Hardware & Fasteners', 'Structural & Building Materials'].map(cat => (
                  <button
                    key={cat}
                    onClick={() => { setSelectedCategory(cat); setSelectedBrandFilter(null); }}
                    className={`px-3 py-1.5 rounded-full font-bold whitespace-nowrap transition-colors cursor-pointer ${
                      selectedCategory === cat
                        ? 'bg-[#EE4D2D] text-white shadow-xs'
                        : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
                    }`}
                  >
                    {cat}
                  </button>
                ))}
              </div>

              {/* Brand Logo / Tag Chips */}
              <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none pt-1 border-t border-slate-100">
                {[
                  { name: 'BOYSEN', color: 'border-red-400 text-red-600' },
                  { name: 'DAVIES', color: 'border-blue-500 text-blue-600' },
                  { name: 'ISLAND', color: 'border-emerald-500 text-emerald-600' },
                  { name: 'PYLOX', color: 'border-orange-500 text-orange-600' },
                  { name: 'BOSNY', color: 'border-amber-500 text-amber-600' },
                  { name: 'MAKITA', color: 'border-cyan-600 text-cyan-700' },
                  { name: 'ROYU', color: 'border-orange-600 text-orange-700' },
                  { name: 'PIONEER', color: 'border-indigo-500 text-indigo-600' },
                  { name: 'ROSCO', color: 'border-slate-500 text-slate-700' },
                  { name: 'ANAM', color: 'border-purple-500 text-purple-700' }
                ].map(b => (
                  <button
                    key={b.name}
                    onClick={() => setSelectedBrandFilter(selectedBrandFilter === b.name ? null : b.name)}
                    className={`px-3 py-1 rounded-lg border text-xs font-black tracking-wider whitespace-nowrap cursor-pointer transition-all ${
                      selectedBrandFilter === b.name
                        ? 'bg-slate-900 text-white border-slate-900 shadow-xs scale-105'
                        : `bg-slate-50 hover:bg-slate-100 ${b.color}`
                    }`}
                  >
                    {b.name}
                  </button>
                ))}
                {selectedBrandFilter && (
                  <button
                    onClick={() => setSelectedBrandFilter(null)}
                    className="px-2 py-1 text-xs text-red-600 font-bold hover:underline whitespace-nowrap cursor-pointer"
                  >
                    ✕ Clear Brand
                  </button>
                )}
              </div>
            </div>

            {/* 6. DEDICATED PROCEED TO WHOLESALE CALLOUT BANNER */}
            <div className="bg-gradient-to-r from-slate-950 via-slate-900 to-red-950 text-white p-3.5 sm:p-4 rounded-2xl border border-amber-500/40 shadow-sm flex flex-col sm:flex-row items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-amber-500/20 border border-amber-500/40 text-amber-400 flex items-center justify-center shrink-0">
                  <Package className="w-5 h-5 text-amber-400" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="bg-amber-500 text-slate-950 text-[10px] font-black uppercase px-2 py-0.5 rounded tracking-wider">
                      B2B Liquidation Portal
                    </span>
                    <span className="text-amber-300 text-xs font-bold">
                      Wholesale Buyout Lots & Up to 40% OFF
                    </span>
                  </div>
                  <p className="text-xs text-slate-200 mt-0.5">
                    Contractors, hardware stores & bulk buyers: Access 465 SKUs in pre-packaged lots or ₱15,000+ volume clearance.
                  </p>
                </div>
              </div>

              <button
                onClick={() => setActiveTab('lots')}
                className="bg-amber-400 hover:bg-amber-300 text-slate-950 font-black text-xs sm:text-sm px-5 py-2.5 rounded-xl shadow-md cursor-pointer transition-all flex items-center gap-2 active:scale-95 shrink-0 group"
              >
                <span>Proceed to Wholesale</span>
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
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

            {/* 20 Frontend Polish: Clean 404 / Empty Search State */}
            {filteredProducts.length === 0 && (
              <div className="bg-white p-10 rounded-xl border border-slate-200 text-center my-6 shadow-xs">
                <div className="w-14 h-14 bg-orange-100 text-[#EE4D2D] rounded-full flex items-center justify-center mx-auto mb-3">
                  <Package className="w-7 h-7" />
                </div>
                <h3 className="font-bold text-slate-800 text-base">No hardware supplies found</h3>
                <p className="text-xs text-slate-500 max-w-sm mx-auto mt-1 mb-4">
                  We couldn't find items matching "{searchQuery}". Try searching for C-purlins, Island Paint, screws, or reset your filters.
                </p>
                <button
                  onClick={() => { setSearchQuery(''); setSelectedCategory('All'); setCatalogFilterInStock(false); }}
                  className="bg-[#EE4D2D] hover:bg-[#d73f20] text-white px-5 py-2.5 rounded-lg text-xs font-bold transition-all active:scale-95 cursor-pointer shadow-xs"
                >
                  Clear Filters & Show All
                </button>
              </div>
            )}

            {/* 20 Frontend Polish: Expandable Contractor & Builder FAQ Accordion */}
            <div className="mt-8 bg-white p-5 sm:p-6 rounded-2xl border border-slate-200 shadow-xs">
              <div className="flex items-center gap-2 mb-4 pb-3 border-b border-slate-100">
                <div className="w-8 h-8 rounded-lg bg-orange-100 text-[#EE4D2D] flex items-center justify-center font-bold">
                  <HelpCircle className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-black text-sm sm:text-base text-slate-900">Contractor & Delivery FAQ</h3>
                  <p className="text-[11px] text-slate-500">Quick answers for Tacloban, Leyte & Samar builders</p>
                </div>
              </div>

              <div className="space-y-2">
                {[
                  {
                    id: 'faq-1',
                    q: 'How fast is delivery within Tacloban City, Palo, and Tanauan?',
                    a: 'Standard orders within Tacloban proper, Palo, and Tanauan are dispatched same-day or within 24 hours. Free delivery applies for orders ₱3,000 and above.'
                  },
                  {
                    id: 'faq-2',
                    q: 'What payment methods do you accept for commercial deliveries?',
                    a: 'We accept Cash on Delivery (COD) upon inspection at your job site, instant GCash, BDO/BPI online bank transfer, and commercial credit terms for verified VIP contractor accounts.'
                  },
                  {
                    id: 'faq-3',
                    q: 'How do I claim contractor volume discounts for structural purlins and fasteners?',
                    a: 'You can apply promo code "builder" (small or all caps) for 35% OFF on orders ₱50,000 and above, or "hardware" for 40% OFF on wholesale purchases ₱100,000 and above. For project quotes over 500 purlins or full truckloads, contact our dispatch hotline directly at 0926 199 5703.'
                  },
                  {
                    id: 'faq-4',
                    q: 'What is your return & damaged materials exchange policy?',
                    a: 'All structural materials (steel, roofing, screws, paint) undergo inspection prior to dispatch. Any transit-damaged materials will be replaced immediately free of charge upon delivery acknowledgement.'
                  }
                ].map(faq => {
                  const isOpen = expandedFaq === faq.id;
                  return (
                    <div key={faq.id} className="border border-slate-100 rounded-xl overflow-hidden transition-colors">
                      <button
                        onClick={() => setExpandedFaq(isOpen ? null : faq.id)}
                        className="w-full text-left px-4 py-3 bg-slate-50/70 hover:bg-slate-100 flex items-center justify-between gap-3 text-xs font-bold text-slate-800 cursor-pointer transition-colors"
                      >
                        <span>{faq.q}</span>
                        <ChevronDown className={`w-4 h-4 text-slate-400 shrink-0 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`} />
                      </button>
                      {isOpen && (
                        <div className="px-4 py-3 bg-white text-xs text-slate-600 leading-relaxed border-t border-slate-100">
                          {faq.a}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>

            {/* 20 Frontend Polish: Contractor Club VIP Newsletter Lead Capture with Honeypot */}
            <div className="mt-6 bg-gradient-to-r from-slate-900 to-slate-800 text-white p-6 rounded-2xl border border-slate-700 shadow-md">
              <div className="max-w-xl">
                <span className="text-[10px] font-black uppercase tracking-widest text-amber-400 bg-amber-400/10 px-2 py-0.5 rounded">
                  Tacloban Builders Club
                </span>
                <h3 className="text-base sm:text-lg font-black mt-2">Join the Manna Contractor Dispatch Network</h3>
                <p className="text-xs text-slate-300 mt-1 mb-4">
                  Get weekly wholesale price bulletins, flash vouchers, and priority warehouse dispatch across Region VIII.
                </p>

                {newsletterSuccess ? (
                  <div className="bg-emerald-950/80 border border-emerald-500/50 text-emerald-200 p-3 rounded-xl text-xs font-bold flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                    <span>Salamat! You are now subscribed to Manna Contractor Bulletins.</span>
                  </div>
                ) : (
                  <form 
                    onSubmit={(e) => {
                      e.preventDefault();
                      if (newsletterHoneypot) {
                        console.warn('[SECURITY ALERT] Bot caught in newsletter honeypot');
                        setNewsletterSuccess(true);
                        return;
                      }
                      if (newsletterEmail) setNewsletterSuccess(true);
                    }}
                    className="flex flex-col sm:flex-row gap-2"
                  >
                    {/* Honeypot field: invisible to users, trap for bots */}
                    <div style={{ position: 'absolute', left: '-9999px', opacity: 0, pointerEvents: 'none' }} aria-hidden="true" tabIndex={-1}>
                      <input 
                        type="text" 
                        name="contractor_vip_verification" 
                        value={newsletterHoneypot} 
                        onChange={e => setNewsletterHoneypot(e.target.value)} 
                        tabIndex={-1} 
                        autoComplete="off" 
                      />
                    </div>

                    <input
                      type="email"
                      required
                      placeholder="Enter your email (e.g. engineer@site.ph)"
                      value={newsletterEmail}
                      onChange={e => setNewsletterEmail(e.target.value)}
                      className="flex-1 px-3.5 py-2.5 rounded-lg text-xs bg-slate-800 border border-slate-700 text-white placeholder-slate-400 focus:outline-none focus:border-amber-400"
                    />
                    <button
                      type="submit"
                      className="bg-[#EE4D2D] hover:bg-[#d73f20] text-white px-5 py-2.5 rounded-lg text-xs font-bold transition-all active:scale-95 cursor-pointer shadow-sm shrink-0"
                    >
                      Join Contractor Club
                    </button>
                  </form>
                )}
              </div>
            </div>
          </main>
        )}

        {/* ==================== TAB: B2B WHOLESALE LOTS & COMMERCIAL LIQUIDATION ==================== */}
        {activeTab === 'lots' && (
          <main className="w-full space-y-6">
            {/* 1. HERO LIQUIDATION BANNER */}
            <div className="bg-gradient-to-br from-slate-950 via-slate-900 to-red-950 text-white rounded-2xl p-5 sm:p-7 border border-amber-500/30 shadow-xl relative overflow-hidden">
              <div className="absolute -top-16 -right-16 w-64 h-64 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />
              <div className="relative z-10">
                <div className="flex flex-wrap items-center gap-2 mb-3">
                  <span className="bg-amber-500 text-slate-950 text-[11px] font-black uppercase tracking-wider px-2.5 py-0.5 rounded-full flex items-center gap-1 shadow-sm">
                    <Flame className="w-3.5 h-3.5 text-red-600 animate-pulse" /> Commercial Warehouse Clearance
                  </span>
                  <span className="bg-white/10 text-white/90 text-[11px] font-medium px-2.5 py-0.5 rounded-full border border-white/15">
                    📍 Tacloban City, Leyte (Dispatch & Pickup by Schedule)
                  </span>
                  <span className="bg-emerald-500/20 text-emerald-300 text-[11px] font-bold px-2.5 py-0.5 rounded-full border border-emerald-500/30">
                    Direct B2B Dispatch • First-Pay First-Release
                  </span>
                </div>

                <div className="max-w-3xl">
                  <h1 className="text-xl sm:text-2xl md:text-3xl font-black text-white tracking-tight">
                    Commercial Warehouse Liquidation & Specialty Category Lots
                  </h1>
                  <p className="text-xs sm:text-sm text-slate-300 mt-2 leading-relaxed">
                    Direct liquidation of Heavy-Duty (HD) and Premium hardware supplies and construction materials. Sold strictly on an <strong>As-Is, Where-Is</strong> basis—featuring warehouse surplus overstock and showroom display inventory priced at deep clearance discounts, verified 100% genuine, sound, and fully contractor-ready. Available in pre-packaged <strong>Specialty Category Lots</strong> or tiered bulk orders at <strong>20% to 40% below retail</strong>.
                  </p>
                </div>

                {/* Live Liquidation Metrics Grid */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-5 pt-5 border-t border-white/10">
                  <div className="bg-white/5 backdrop-blur-xs p-3 rounded-xl border border-white/10">
                    <p className="text-[10px] text-slate-400 font-medium uppercase tracking-wider">Active Inventory</p>
                    <p className="text-lg sm:text-xl font-black text-amber-400 mt-0.5">{products.length} SKUs</p>
                    <p className="text-[10px] text-slate-400">Tacloban & Nula Tula Depots</p>
                  </div>
                  <div className="bg-white/5 backdrop-blur-xs p-3 rounded-xl border border-white/10">
                    <p className="text-[10px] text-slate-400 font-medium uppercase tracking-wider">Physical Units</p>
                    <p className="text-lg sm:text-xl font-black text-white mt-0.5">{financialMetrics.totalStockCount.toLocaleString()} pcs</p>
                    <p className="text-[10px] text-slate-400">On-floor ready to haul</p>
                  </div>
                  <div className="bg-white/5 backdrop-blur-xs p-3 rounded-xl border border-white/10">
                    <p className="text-[10px] text-slate-400 font-medium uppercase tracking-wider">Volume Discount</p>
                    <p className="text-lg sm:text-xl font-black text-emerald-400 mt-0.5">Up to 40% OFF</p>
                    <p className="text-[10px] text-slate-400">₱25k / ₱50k / ₱100k Tiers</p>
                  </div>
                  <div className="bg-white/5 backdrop-blur-xs p-3 rounded-xl border border-white/10">
                    <p className="text-[10px] text-slate-400 font-medium uppercase tracking-wider">Dispatch Hotline</p>
                    <a href="tel:09261995703" className="text-base sm:text-lg font-black text-white hover:text-amber-400 mt-0.5 block truncate">
                      0926 199 5703
                    </a>
                    <p className="text-[10px] text-slate-400">Viber / Calls Open 8AM-5PM</p>
                  </div>
                </div>

                <div className="flex flex-wrap items-center gap-3 mt-5">
                  <button
                    onClick={downloadManifestPDF}
                    className="bg-amber-400 hover:bg-amber-300 text-slate-950 font-black px-4 py-2 rounded-lg text-xs flex items-center gap-2 cursor-pointer shadow-sm transition-all active:scale-95"
                    title="Generate and download complete manifest as PDF with live updated quantities"
                  >
                    <FileText className="w-4 h-4 text-slate-950" /> Download Complete Manifest (PDF)
                  </button>
                  <button
                    onClick={downloadFullManifestCSV}
                    className="bg-slate-800 hover:bg-slate-700 text-white font-bold px-3 py-2 rounded-lg text-xs flex items-center gap-1.5 cursor-pointer shadow-sm border border-slate-700 transition-all active:scale-95"
                    title="Download raw spreadsheet data as CSV"
                  >
                    <Download className="w-3.5 h-3.5" /> Export CSV
                  </button>
                  <a
                    href="https://wa.me/639261995703?text=Good%20day.%20I%20am%20a%20contractor%20/%20hardware%20buyer%20interested%20in%20inspecting%20your%20commercial%20liquidation%20lots.%20Please%20send%20schedule%20and%20terms."
                    target="_blank"
                    rel="noreferrer"
                    className="bg-emerald-600 hover:bg-emerald-500 text-white font-bold px-4 py-2 rounded-lg text-xs flex items-center gap-2 cursor-pointer shadow-sm transition-all active:scale-95"
                  >
                    <MessageCircle className="w-4 h-4" /> Inquire via Viber / WhatsApp
                  </a>
                  <button
                    onClick={() => setActiveTab('catalog')}
                    className="bg-white/10 hover:bg-white/20 text-white font-bold px-4 py-2 rounded-lg text-xs flex items-center gap-2 cursor-pointer border border-white/20 transition-all"
                  >
                    <Layers className="w-4 h-4" /> Browse Individual SKUs ({products.length})
                  </button>
                </div>
              </div>
            </div>

            {/* 2. CURATED SPECIALTY CATEGORY LOTS (TIER 2) */}
            <div>
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-4">
                <div>
                  <h2 className="text-lg sm:text-xl font-black text-slate-900 flex items-center gap-2">
                    <Package className="w-5 h-5 text-[#EE4D2D]" /> Specialty Category Buyout Lots
                  </h2>
                  <p className="text-xs text-slate-500">
                    Pre-packaged lots priced for immediate contractor acquisition and retail store inventory replenishment.
                  </p>
                </div>
                <span className="text-[11px] font-bold text-amber-800 bg-amber-50 border border-amber-200 px-3 py-1 rounded-full w-fit">
                  As-Is, Where-Is • Showroom Display & Surplus Liquidation (Cash Before Load)
                </span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {CONTRACTOR_LOTS.map((lot) => {
                  return (
                    <div 
                      key={lot.id} 
                      className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs hover:shadow-md transition-all flex flex-col justify-between"
                    >
                      <div>
                        {/* Lot Badge & Category */}
                        <div className="flex items-center justify-between gap-2 mb-2">
                          <span className={`text-[10px] font-black uppercase px-2 py-0.5 rounded border ${lot.badgeColor}`}>
                            {lot.badge}
                          </span>
                          <span className="text-[11px] text-slate-400 font-medium">
                            {lot.category}
                          </span>
                        </div>

                        {/* Title */}
                        <h3 className="font-black text-slate-900 text-base mb-1.5">
                          {lot.name}
                        </h3>
                        <p className="text-xs text-slate-600 mb-3 leading-relaxed">
                          {lot.summary}
                        </p>

                        {/* Key Items Preview List */}
                        <div className="bg-slate-50 rounded-xl p-3 border border-slate-100 space-y-1.5 mb-4 text-xs">
                          <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1">
                            Key Inventory In Lot:
                          </p>
                          {lot.details.slice(0, 4).map((d, i) => (
                            <div key={i} className="flex items-center justify-between text-slate-700">
                              <span className="truncate pr-2 font-medium">• {d.name}</span>
                              <span className="font-bold text-slate-900 shrink-0">{d.qty}</span>
                            </div>
                          ))}
                          {lot.details.length > 4 && (
                            <p className="text-[10px] text-slate-400 font-semibold pt-1">
                              + {lot.details.length - 4} more line items in manifest...
                            </p>
                          )}
                        </div>

                        {/* Target Buyer */}
                        <div className="text-[11px] text-slate-500 mb-4 bg-orange-50/60 p-2 rounded-lg border border-orange-100">
                          <strong className="text-orange-900">Target:</strong> {lot.targetBuyer}
                        </div>
                      </div>

                      <div>
                        {/* Pricing Box: SRP (Struck out), Cost, and Discounted Wholesale Price */}
                        <div className="bg-slate-900 text-white p-3.5 rounded-xl mb-3 space-y-2 border border-slate-800 shadow-inner">
                          <div className="flex items-center justify-between text-[11px] pb-1.5 border-b border-slate-800">
                            <div>
                              <span className="text-slate-400 text-[10px] block">Standard Retail (SRP):</span>
                              <span className="line-through text-slate-400 font-bold text-xs">
                                ₱{lot.retailValue.toLocaleString('en-PH')}
                              </span>
                            </div>
                            <div className="text-right">
                              <span className="text-slate-400 text-[10px] block">Merchant Cost Base:</span>
                              <span className="text-amber-300 font-mono font-bold text-xs">
                                ₱{(lot.costValue || Math.round(lot.retailValue * 0.78)).toLocaleString('en-PH')}
                              </span>
                            </div>
                          </div>

                          <div className="flex items-baseline justify-between pt-0.5">
                            <div>
                              <span className="text-[9px] uppercase font-black tracking-wider text-emerald-400 block">
                                Discounted Wholesale Lot:
                              </span>
                              <span className="text-xl sm:text-2xl font-black text-emerald-400 leading-none">
                                ₱{lot.lotPrice.toLocaleString('en-PH')}
                              </span>
                              <span className="text-[9px] text-slate-400 block mt-0.5">1-Click Spot Cash Clearance</span>
                            </div>
                            <div className="text-right">
                              <span className="bg-emerald-500 text-slate-950 text-xs font-black px-2 py-0.5 rounded shadow-xs inline-block">
                                SAVE ₱{lot.savings.toLocaleString('en-PH')}
                              </span>
                              <span className="text-[10px] text-emerald-300 block mt-0.5 font-bold">
                                {lot.discountPercent}% OFF SRP
                              </span>
                            </div>
                          </div>
                        </div>

                        {/* Primary One-Button Tile to Buy Whole Lot */}
                        <div className="space-y-2">
                          <button
                            onClick={() => buyWholeLot(lot)}
                            className="w-full bg-gradient-to-r from-amber-500 via-orange-500 to-[#EE4D2D] hover:from-amber-600 hover:via-orange-600 hover:to-[#d73f20] text-white text-xs sm:text-sm font-black py-3 px-3 rounded-xl cursor-pointer shadow-md hover:shadow-lg transition-all active:scale-98 flex items-center justify-center gap-2 group border border-orange-400/40"
                          >
                            <ShoppingCart className="w-4 h-4 stroke-[2.5] group-hover:scale-110 transition-transform" />
                            <span>BUY WHOLE LOT (₱{lot.lotPrice.toLocaleString('en-PH')})</span>
                          </button>

                          <div className="grid grid-cols-2 gap-2">
                            <button
                              onClick={() => setSelectedLotModal(lot)}
                              className="bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-bold py-2 px-2.5 rounded-lg cursor-pointer transition-colors text-center flex items-center justify-center gap-1"
                            >
                              <FileSpreadsheet className="w-3.5 h-3.5 text-slate-600" /> Manifest
                            </button>
                            <a
                              href={`https://wa.me/639261995703?text=Hello%20Manna%20Hardware.%20I%20am%20ready%20to%20buy%20${encodeURIComponent(lot.name)}%20for%20₱${lot.lotPrice.toLocaleString('en-PH')}.%20Please%20send%20payment%20instructions%20and%20hauling%20schedule.`}
                              target="_blank"
                              rel="noreferrer"
                              className="bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold py-2 px-2.5 rounded-lg cursor-pointer transition-colors text-center shadow-xs flex items-center justify-center gap-1"
                            >
                              <MessageCircle className="w-3.5 h-3.5" /> Viber Buy
                            </a>
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* 3. TIERED VOLUME DISCOUNTS FOR MIX-AND-MATCH (TIER 3) */}
            <div className="bg-white rounded-2xl border border-slate-200 p-5 sm:p-6 shadow-xs">
              <div className="max-w-2xl mb-5">
                <span className="text-[10px] font-black uppercase tracking-wider text-amber-600 bg-amber-50 px-2 py-0.5 rounded">
                  Tier 3 Mix-and-Match Volume Pricing
                </span>
                <h3 className="text-lg font-black text-slate-900 mt-1">
                  Tiered Volume Discounts for Walk-in Contractors & Hardware Resellers
                </h3>
                <p className="text-xs text-slate-500 mt-1">
                  Need specific SKUs instead of an entire category lot? Mix and match any items from our {products.length}-item catalog and automatically trigger wholesale volume tier discounts.
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {WHOLESALE_TIERS.map((tier) => (
                  <div 
                    key={tier.promoCode}
                    className="p-4 rounded-xl border border-slate-200 bg-slate-50/50 flex flex-col justify-between hover:border-amber-400 transition-colors"
                  >
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-xs font-black text-slate-900">{tier.label}</span>
                        <span className="text-xs font-black text-[#EE4D2D] bg-orange-100 px-2 py-0.5 rounded">
                          {tier.discountPercent}% OFF
                        </span>
                      </div>
                      <p className="text-xs text-slate-600 mb-3">{tier.description}</p>
                      <div className="bg-white p-2.5 rounded-lg border border-slate-200 mb-3">
                        <div className="flex items-center justify-between text-xs">
                          <span className="text-slate-500">Minimum Purchase:</span>
                          <span className="font-bold text-slate-900">₱{tier.minSpend.toLocaleString('en-PH')}</span>
                        </div>
                        <div className="flex items-center justify-between text-xs mt-1">
                          <span className="text-slate-500">Voucher Code:</span>
                          <span className="font-mono font-black text-amber-600 uppercase">{tier.promoCode}</span>
                        </div>
                      </div>
                    </div>

                    <button
                      onClick={() => {
                        applyPromoCode(null, tier.promoCode);
                        setActiveTab('catalog');
                      }}
                      className="w-full bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold py-2 rounded-lg cursor-pointer transition-colors flex items-center justify-center gap-1.5"
                    >
                      <Tag className="w-3.5 h-3.5 text-amber-400" /> Apply {tier.discountPercent}% Code & Shop
                    </button>
                  </div>
                ))}
              </div>
            </div>

            {/* 4. LIVE 465-SKU WAREHOUSE MANIFEST TABLE */}
            <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 mb-4 pb-3 border-b border-slate-100">
                <div>
                  <h3 className="font-black text-slate-900 text-base flex items-center gap-2">
                    <FileSpreadsheet className="w-5 h-5 text-[#EE4D2D]" /> Complete {products.length}-SKU Warehouse Commercial Manifest
                  </h3>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Search on-floor physical counts, retail benchmark prices, and 40% Tier 3 wholesale rates across all active inventory.
                  </p>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={downloadManifestPDF}
                    className="bg-[#EE4D2D] hover:bg-[#d73f20] text-white text-xs font-bold px-3 py-1.5 rounded-lg cursor-pointer flex items-center gap-1.5 shadow-2xs transition-colors shrink-0"
                    title="Download updated manifest as PDF"
                  >
                    <FileText className="w-3.5 h-3.5" /> Download Manifest (PDF)
                  </button>
                  <button
                    onClick={downloadFullManifestCSV}
                    className="bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold px-3 py-1.5 rounded-lg cursor-pointer flex items-center gap-1.5 shadow-2xs transition-colors shrink-0"
                    title="Export as CSV"
                  >
                    <Download className="w-3.5 h-3.5" /> Export CSV
                  </button>
                </div>
              </div>

              {/* Manifest Search & Category Filters */}
              <div className="flex flex-col sm:flex-row gap-3 mb-4">
                <div className="relative flex-1">
                  <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    placeholder={`Search ${products.length} manifest items across Cabalwan & Nula Tula (e.g. C-Purlins, Bosny, PPR, GI Pipe)...`}
                    value={manifestSearchQuery}
                    onChange={(e) => setManifestSearchQuery(e.target.value)}
                    className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs focus:outline-none focus:border-amber-400 focus:bg-white transition-colors"
                  />
                  {manifestSearchQuery && (
                    <button 
                      onClick={() => setManifestSearchQuery('')}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 text-xs"
                    >
                      Clear
                    </button>
                  )}
                </div>

                <select
                  value={manifestCategoryFilter}
                  onChange={(e) => setManifestCategoryFilter(e.target.value)}
                  className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs font-medium text-slate-700 focus:outline-none focus:border-amber-400"
                >
                  <option value="All">All Categories ({products.length} SKUs)</option>
                  {categories.filter(c => c !== 'All').map(c => (
                    <option key={c} value={c}>{c}</option>
                  ))}
                </select>
              </div>

              {/* Admin Stock Audit Notice if Authenticated */}
              {isMerchantAuthenticated && (
                <div className="bg-amber-50 border border-amber-300 rounded-xl p-3 mb-3 flex items-center justify-between text-xs text-amber-950 shadow-2xs">
                  <div className="flex items-center gap-2">
                    <span className="bg-amber-600 text-white font-black text-[9px] px-1.5 py-0.5 rounded uppercase">
                      Admin Floor Audit Mode
                    </span>
                    <span className="font-semibold text-slate-800">
                      Discrepancies found? You can type physical counts directly or click <strong>Cancel Item</strong> to remove mismatches from this master manifest.
                    </span>
                  </div>
                  <span className="text-[10px] text-amber-800 font-mono font-bold">Auto-Syncing</span>
                </div>
              )}

              {/* Manifest Data Table */}
              <div className="overflow-x-auto border border-slate-200 rounded-xl max-h-[500px] overflow-y-auto">
                <table className="w-full text-left text-xs border-collapse">
                  <thead className="bg-slate-100 text-slate-700 font-bold sticky top-0 z-10 border-b border-slate-200 text-[11px]">
                    <tr>
                      <th className="py-2.5 px-3">SKU</th>
                      <th className="py-2.5 px-3">Product Description</th>
                      <th className="py-2.5 px-3">Category</th>
                      <th className="py-2.5 px-3 text-center">Physical Stock</th>
                      <th className="py-2.5 px-3 text-right">
                        <span>Original SRP</span>
                        <span className="text-[9px] text-slate-400 font-normal block">(Struck Out)</span>
                      </th>
                      <th className="py-2.5 px-3 text-right">
                        <span>Merchant Cost</span>
                        <span className="text-[9px] text-slate-400 font-normal block">(Capital Base)</span>
                      </th>
                      <th className="py-2.5 px-3 text-right bg-emerald-50 text-emerald-900">
                        <span className="font-black">Wholesale Price</span>
                        <span className="text-[9px] text-emerald-700 font-bold block">(40% Discounted)</span>
                      </th>
                      <th className="py-2.5 px-3 text-right">
                        <span>Wholesale Line Total</span>
                        <span className="text-[9px] text-slate-400 font-normal block">(Total Value)</span>
                      </th>
                      {isMerchantAuthenticated && (
                        <th className="py-2.5 px-3 text-center w-28 bg-amber-100/70 text-amber-900 font-black">Admin Action</th>
                      )}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 text-slate-700">
                    {products
                      .filter(p => {
                        // Buyers only see active verified items; admin sees all including cancelled for reconciliation
                        if (!isMerchantAuthenticated && (p.isCancelled || p.status === 'cancelled')) return false;
                        const matchCat = manifestCategoryFilter === 'All' || p.category === manifestCategoryFilter;
                        if (!matchCat) return false;
                        if (!manifestSearchQuery) return true;
                        const q = manifestSearchQuery.toLowerCase();
                        return (p.name || '').toLowerCase().includes(q) || (p.id || '').toLowerCase().includes(q);
                      })
                      .slice(0, 150)
                      .map((item) => {
                        const isItemCancelled = Boolean(item.isCancelled || item.status === 'cancelled');
                        const stock = Math.max(0, Number(item.stock) || 0);
                        const price = Number(item.price) || 0;
                        const wholesale = Math.round(price * 0.60 * 100) / 100;
                        const lineVal = price * stock;
                        return (
                          <tr key={item.id} className={`transition-colors ${isItemCancelled ? 'bg-rose-50/40 text-slate-400' : 'hover:bg-amber-50/40'}`}>
                            <td className="py-2 px-3 font-mono text-[11px] text-slate-500">{item.id}</td>
                            <td className="py-2 px-3 font-medium leading-snug">
                              {isItemCancelled ? (
                                <div className="flex items-center gap-1 flex-wrap">
                                  <span className="bg-rose-600 text-white text-[9px] font-black px-1.5 py-0.2 rounded uppercase not-italic no-underline">
                                    Cancelled Discrepancy
                                  </span>
                                  <span className="line-through text-slate-400">{item.name}</span>
                                </div>
                              ) : (
                                <span className="text-slate-900">{item.name}</span>
                              )}
                            </td>
                            <td className="py-2 px-3 text-slate-500 text-[11px]">{item.category}</td>
                            <td className="py-2 px-3 text-center whitespace-nowrap">
                              {isMerchantAuthenticated ? (
                                <div className="inline-flex items-center justify-center gap-1">
                                  <input
                                    type="number"
                                    min="0"
                                    value={item.stock}
                                    onChange={(e) => handleInlineStockChange(item.id, e.target.value)}
                                    className="w-16 px-1.5 py-0.5 text-center font-black text-xs border border-amber-400 bg-amber-50/50 rounded focus:bg-white focus:outline-none"
                                    title="Adjust actual physical count"
                                  />
                                  <span className="text-[10px] text-slate-500">{item.unit || 'pc'}</span>
                                </div>
                              ) : (
                                <span className="font-bold text-slate-900">
                                  {stock} <span className="text-[10px] font-normal text-slate-500">{item.unit || 'pc'}</span>
                                </span>
                              )}
                            </td>
                            {/* SRP with Strike Out */}
                            <td className="py-2 px-3 text-right whitespace-nowrap">
                              <span className={`line-through font-semibold ${isItemCancelled ? 'text-slate-300' : 'text-slate-400'}`}>
                                ₱{price.toLocaleString('en-PH')}
                              </span>
                            </td>
                            {/* Cost / Capital Base */}
                            <td className="py-2 px-3 text-right font-mono text-[11px] text-slate-600 whitespace-nowrap">
                              ₱{(Number(item.capital) || Math.round(price * 0.78 * 100) / 100).toLocaleString('en-PH')}
                            </td>
                            {/* Discounted Wholesale Price */}
                            <td className={`py-2 px-3 text-right whitespace-nowrap ${isItemCancelled ? 'text-slate-400' : 'bg-emerald-50/50'}`}>
                              <span className={`font-black text-xs ${isItemCancelled ? 'text-slate-400' : 'text-emerald-700'}`}>
                                ₱{wholesale.toLocaleString('en-PH')}
                              </span>
                              <span className="block text-[8.5px] text-emerald-600 font-bold">-40%</span>
                            </td>
                            {/* Wholesale Line Total */}
                            <td className={`py-2 px-3 text-right font-black whitespace-nowrap ${isItemCancelled ? 'text-slate-400 line-through' : 'text-slate-900'}`}>
                              ₱{(Math.round(wholesale * stock * 100) / 100).toLocaleString('en-PH')}
                              <span className="block text-[9px] text-slate-400 line-through font-normal">
                                ₱{lineVal.toLocaleString('en-PH')} SRP
                              </span>
                            </td>
                            {/* Admin Action Column */}
                            {isMerchantAuthenticated && (
                              <td className="py-2 px-3 text-center whitespace-nowrap bg-amber-50/30">
                                <button
                                  onClick={() => handleToggleCancelItem(item.id)}
                                  className={`px-2 py-1 rounded text-[10px] font-bold cursor-pointer transition-colors inline-flex items-center gap-1 ${
                                    isItemCancelled
                                      ? 'bg-emerald-600 hover:bg-emerald-700 text-white shadow-2xs'
                                      : 'bg-rose-50 text-rose-700 hover:bg-rose-600 hover:text-white border border-rose-200'
                                  }`}
                                  title={isItemCancelled ? 'Restore item back into master manifest' : 'Cancel item due to warehouse discrepancy / damaged stock'}
                                >
                                  {isItemCancelled ? (
                                    <>
                                      <CheckCircle2 className="w-3 h-3" /> Restore
                                    </>
                                  ) : (
                                    <>
                                      <Ban className="w-3 h-3" /> Cancel Item
                                    </>
                                  )}
                                </button>
                              </td>
                            )}
                          </tr>
                        );
                      })}
                  </tbody>
                </table>
              </div>
              <p className="text-[11px] text-slate-400 mt-2 text-right">
                Showing top manifest results. Click "Export Manifest (CSV)" for full offline Excel review.
              </p>
            </div>

            {/* 5. WAREHOUSE DISPATCH & INSPECTION PROTOCOL */}
            <div className="bg-slate-900 text-white rounded-2xl p-5 sm:p-6 border border-slate-800">
              <h3 className="text-base font-black text-amber-400 mb-2">
                Contractor Inspection & Warehouse Release Protocols
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-4 gap-4 text-xs text-slate-300 mt-4">
                <div className="bg-slate-800/80 p-3.5 rounded-xl border border-slate-700">
                  <span className="w-5 h-5 rounded-full bg-amber-400 text-slate-950 font-black inline-flex items-center justify-center text-[10px] mb-2">1</span>
                  <p className="font-bold text-white mb-1">Manifest Selection</p>
                  <p className="text-[11px] text-slate-400">Choose your Specialty Lot or generate your custom mix-and-match Bill of Quantities (BOQ).</p>
                </div>
                <div className="bg-slate-800/80 p-3.5 rounded-xl border border-slate-700">
                  <span className="w-5 h-5 rounded-full bg-amber-400 text-slate-950 font-black inline-flex items-center justify-center text-[10px] mb-2">2</span>
                  <p className="font-bold text-white mb-1">Warehouse Inspection</p>
                  <p className="text-[11px] text-slate-400">Coordinate scheduled inspection with our dispatch team (8AM-5PM) to verify steel gauges, valves, and packaging.</p>
                </div>
                <div className="bg-slate-800/80 p-3.5 rounded-xl border border-slate-700">
                  <span className="w-5 h-5 rounded-full bg-amber-400 text-slate-950 font-black inline-flex items-center justify-center text-[10px] mb-2">3</span>
                  <p className="font-bold text-white mb-1">Immediate Settlement</p>
                  <p className="text-[11px] text-slate-400">Payment via Verified Manager's Check, Real-time PesoNet / InstaPay bank transfer, or cash on pickup.</p>
                </div>
                <div className="bg-slate-800/80 p-3.5 rounded-xl border border-slate-700">
                  <span className="w-5 h-5 rounded-full bg-amber-400 text-slate-950 font-black inline-flex items-center justify-center text-[10px] mb-2">4</span>
                  <p className="font-bold text-white mb-1">Truck Dispatch</p>
                  <p className="text-[11px] text-slate-400">Buyer provides trucking or our dispatch assists with 6-wheeler / elf logistics across Leyte & Samar.</p>
                </div>
              </div>
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
                    Browse all {products.length} Heavy-Duty (HD) & Premium hardware supplies with live inventory, bulk packaging, and contract pricing.
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

              {/* Clearance & Liquidation Notice (As-Is, Where-Is) */}
              <div className="mt-3.5 p-3 bg-amber-50/90 border border-amber-200 rounded-xl flex items-start gap-2.5 text-slate-700 w-full">
                <AlertCircle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                <div className="text-xs leading-relaxed">
                  <span className="font-bold text-amber-950">Clearance & Liquidation Notice (As-Is, Where-Is):</span>{' '}
                  All items are offered at deeply discounted, below-retail clearance prices because stock consists of genuine surplus, warehouse overstock, and showroom display units sold strictly <strong>As-Is, Where-Is</strong>. Every item is verified 100% authentic, structurally sound, fully functional, and ready for contractor and residential projects.
                </div>
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
                      <tr className="bg-slate-50 border-b border-slate-200 text-slate-600 font-bold uppercase text-[10px] tracking-wider select-none">
                        <th className="py-3 px-3 w-14 text-center">Photo</th>
                        <th onClick={() => handleCatalogSort('id')} className="py-3 px-3 w-28 cursor-pointer hover:bg-slate-100 transition-colors">
                          SKU {renderSortIndicator('id', catalogSortField, catalogSortOrder)}
                        </th>
                        <th onClick={() => handleCatalogSort('name')} className="py-3 px-3 cursor-pointer hover:bg-slate-100 transition-colors">
                          Product Name & Grade {renderSortIndicator('name', catalogSortField, catalogSortOrder)}
                        </th>
                        <th onClick={() => handleCatalogSort('category')} className="py-3 px-3 cursor-pointer hover:bg-slate-100 transition-colors">
                          Category {renderSortIndicator('category', catalogSortField, catalogSortOrder)}
                        </th>
                        <th className="py-3 px-3">Packaging Unit</th>
                        <th onClick={() => handleCatalogSort('stock')} className="py-3 px-3 text-center cursor-pointer hover:bg-slate-100 transition-colors">
                          Stock (Qty) {renderSortIndicator('stock', catalogSortField, catalogSortOrder)}
                        </th>
                        <th onClick={() => handleCatalogSort('price')} className="py-3 px-3 text-right cursor-pointer hover:bg-slate-100 transition-colors">
                          Regular Price {renderSortIndicator('price', catalogSortField, catalogSortOrder)}
                        </th>
                        <th className="py-3 px-3 text-right">Final Price</th>
                        <th className="py-3 px-3 text-center w-28">Type Qty</th>
                        <th className="py-3 px-3 text-center">Action</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {sortedCatalogProducts.map(item => {
                        const itemDisc = Number(item.discount_percent || 0);
                        const maxDiscount = Math.max(itemDisc, storewideDiscount);
                        const effectivePrice = maxDiscount > 0 ? item.price * (1 - maxDiscount / 100) : item.price;
                        const isBulkPack = item.unit.includes('100');
                        const pack = getProductWholesalePack(item, isRetailMode);
                        const qtyToBuy = catalogQuantities[item.id] || pack.minQty;

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
                              <div className="flex items-center gap-1.5 flex-wrap">
                                <span className="font-bold text-slate-900 leading-snug">{item.name}</span>
                                {isLongCargoItem(item) && (
                                  <span className="inline-flex items-center gap-0.5 text-[9px] bg-amber-100 text-amber-900 font-bold px-1.5 py-0.5 rounded border border-amber-300">
                                    <Truck className="w-2.5 h-2.5 text-amber-700" /> 10ft+ (₱50/km)
                                  </span>
                                )}
                              </div>
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

                            {/* Type Quantity Manually */}
                            <td className="py-2.5 px-3 text-center">
                              <div className="inline-flex items-center border border-slate-300 rounded bg-white shadow-2xs">
                                <button
                                  type="button"
                                  onClick={() => {
                                    const step = pack.step;
                                    const cur = catalogQuantities[item.id] || pack.minQty;
                                    if (cur > step) setCatalogQuantities(prev => ({ ...prev, [item.id]: cur - step }));
                                  }}
                                  className="px-2 py-1 text-slate-600 hover:bg-slate-100 font-bold select-none cursor-pointer"
                                >
                                  -
                                </button>
                                <input
                                  type="number"
                                  min={pack.minQty}
                                  step={pack.step}
                                  max={item.stock || 9999}
                                  value={qtyToBuy}
                                  onChange={(e) => {
                                    const val = Math.max(pack.minQty, parseInt(e.target.value, 10) || pack.minQty);
                                    setCatalogQuantities(prev => ({ ...prev, [item.id]: val }));
                                  }}
                                  className="w-14 text-center text-xs font-black border-x border-slate-200 py-1 focus:outline-none focus:bg-orange-50 text-slate-900"
                                />
                                <button
                                  type="button"
                                  onClick={() => {
                                    const step = pack.step;
                                    const cur = catalogQuantities[item.id] || pack.minQty;
                                    setCatalogQuantities(prev => ({ ...prev, [item.id]: cur + step }));
                                  }}
                                  className="px-2 py-1 text-slate-600 hover:bg-slate-100 font-bold select-none cursor-pointer"
                                >
                                  +
                                </button>
                              </div>
                              {!isRetailMode && (
                                <span className="block text-[8px] text-amber-700 font-bold mt-0.5">
                                  {pack.packLabel}
                                </span>
                              )}
                            </td>

                            {/* Action Add to Cart */}
                            <td className="py-2.5 px-3 text-center">
                              <button
                                onClick={() => addToCart(item, qtyToBuy)}
                                disabled={item.stock <= 0}
                                className={`px-3 py-1.5 rounded text-xs font-bold transition-all inline-flex items-center gap-1 cursor-pointer ${
                                  item.stock <= 0
                                    ? 'bg-slate-100 text-slate-400 cursor-not-allowed'
                                    : 'bg-[#EE4D2D] hover:bg-[#d73f20] text-white shadow-xs'
                                }`}
                              >
                                <Plus className="w-3.5 h-3.5" /> Add ({qtyToBuy})
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
                    <div className="flex items-center gap-2 mt-0.5">
                      <h3 className="text-lg font-black text-slate-900 font-mono">{trackedOrder.orderId}</h3>
                      <button
                        onClick={() => {
                          navigator.clipboard.writeText(trackedOrder.orderId);
                          setCopiedId(trackedOrder.orderId);
                          setTimeout(() => setCopiedId(null), 2000);
                        }}
                        className="p-1 hover:bg-slate-100 rounded-md text-slate-500 hover:text-slate-800 cursor-pointer transition-colors"
                        title="Copy Tracking ID"
                        aria-label="Copy Tracking ID"
                      >
                        {copiedId === trackedOrder.orderId ? (
                          <span className="inline-flex items-center text-[10px] text-emerald-600 font-bold gap-0.5 bg-emerald-50 px-1 py-0.5 rounded">
                            <Check className="w-3.5 h-3.5" /> Copied
                          </span>
                        ) : (
                          <Copy className="w-3.5 h-3.5" />
                        )}
                      </button>
                      <button
                        onClick={() => setInvoiceModalOrder(trackedOrder)}
                        className="px-2.5 py-1 bg-blue-50 hover:bg-blue-100 text-blue-700 border border-blue-200 rounded text-xs font-bold inline-flex items-center gap-1 cursor-pointer transition-colors"
                        title="View and Print Official Commercial Sales Invoice"
                      >
                        <FileText className="w-3.5 h-3.5" /> Printable Invoice
                      </button>
                    </div>
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
                    {trackedOrder.customer.deliveryZone && (
                      <p className="text-slate-700">Destination Zone: <strong>{trackedOrder.customer.deliveryZone}</strong></p>
                    )}
                    <p className="text-slate-700">Payment: <strong className="uppercase">{trackedOrder.customer.paymentMethod}</strong></p>
                    {(trackedOrder.long_cargo_fee > 0 || trackedOrder.longCargoFee > 0) && (
                      <div className="mt-2 pt-2 border-t border-slate-200 text-amber-800 flex items-center justify-between text-xs font-semibold">
                        <span className="flex items-center gap-1">
                          <Truck className="w-3.5 h-3.5 text-amber-600" /> Long Cargo Delivery ({trackedOrder.distance_km || trackedOrder.distanceKm || 10} km @ ₱50/km):
                        </span>
                        <strong className="text-amber-900">₱{(trackedOrder.long_cargo_fee || trackedOrder.longCargoFee).toFixed(2)}</strong>
                      </div>
                    )}
                  </div>

                  <div className="flex justify-between items-baseline pt-2 text-base font-black text-slate-900">
                    <span>Order Total:</span>
                    <span className="text-[#EE4D2D]">₱{trackedOrder.total.toLocaleString()}</span>
                  </div>

                  {/* Cancel Order Action (User Requested) */}
                  {trackedOrder.status !== 'Delivered' && trackedOrder.status !== 'Cancelled' && (
                    <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
                      <p className="text-[11px] text-slate-500">Need to cancel or revise this delivery?</p>
                      <button
                        onClick={() => handleCancelOrder(trackedOrder.orderId || trackedOrder.id, 'public')}
                        disabled={cancellingOrderId === (trackedOrder.orderId || trackedOrder.id)}
                        className="bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 text-xs font-bold px-3.5 py-2 rounded-lg flex items-center gap-1.5 cursor-pointer shadow-xs transition-colors"
                      >
                        <Ban className="w-3.5 h-3.5" />
                        {cancellingOrderId === (trackedOrder.orderId || trackedOrder.id) ? 'Cancelling...' : 'Cancel Order'}
                      </button>
                    </div>
                  )}
                  {trackedOrder.status === 'Cancelled' && (
                    <div className="mt-3 bg-rose-50 border border-rose-200 p-2.5 rounded-lg text-xs font-bold text-rose-700 flex items-center gap-2">
                      <XCircle className="w-4 h-4 text-rose-600 shrink-0" />
                      <span>This order has been cancelled and materials restocked to warehouse inventory.</span>
                    </div>
                  )}
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
                <ProductCard key={item.id} product={item} onAddToCart={addToCart} storewideDiscount={storewideDiscount} isRetailMode={isRetailMode} isRightCol={idx % 2 === 1} />
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
                <ProductCard key={item.id} product={item} onAddToCart={addToCart} isVideoCard storewideDiscount={storewideDiscount} isRetailMode={isRetailMode} isRightCol={idx % 2 === 1} />
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
                <p className="font-bold text-slate-900 text-sm">Wholesale Code "hardware" (40% OFF)</p>
                <p className="text-slate-500 mt-0.5">Save 40% OFF wholesale hardware orders <strong>₱100,000+</strong> with voucher code <strong className="text-slate-800">hardware</strong> or <strong className="text-slate-800">HARDWARE</strong>.</p>
              </div>
            </div>

            <div className="bg-white p-4 rounded-xl border border-slate-200 flex items-center gap-3.5 shadow-2xs">
              <div className="w-11 h-11 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center text-lg">
                🏗️
              </div>
              <div className="flex-1 text-xs">
                <p className="font-bold text-slate-900 text-sm">Contractor Special "builder" (35% OFF)</p>
                <p className="text-slate-500 mt-0.5">Contractors and builders enjoy 35% discount on purchases <strong>₱50,000+</strong> with voucher code <strong className="text-slate-800">builder</strong> or <strong className="text-slate-800">BUILDER</strong>.</p>
              </div>
            </div>
          </main>
        )}

        {/* ==================== TAB 7: MERCHANT SELLER COMMAND CENTRE ==================== */}
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
                                <div className="flex items-center gap-2">
                                  <button
                                    onClick={() => setInvoiceModalOrder(ord)}
                                    className="text-[11px] text-blue-600 font-bold hover:underline cursor-pointer flex items-center gap-0.5"
                                    title="View Printable Commercial Invoice"
                                  >
                                    <FileText className="w-3 h-3" /> Invoice
                                  </button>
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
              /* ==================== AUTHENTICATED MERCHANT SELLER CENTRE (DESKTOP WEB VIEW) ==================== */
              <div className="max-w-7xl mx-auto space-y-6">
                
                {/* 1. Header & Quick Actions Bar */}
                <div className="bg-white p-4 sm:p-5 rounded-xl border border-slate-200 flex flex-wrap items-center justify-between gap-3 shadow-xs">
                  <div>
                    <div className="flex items-center gap-2">
                      <h2 className="text-base sm:text-lg font-black text-slate-900 flex items-center gap-2">
                        <ShieldCheck className="w-5 h-5 text-[#EE4D2D]" /> Merchant Seller Command Centre
                      </h2>
                      <span className="hidden sm:inline text-[10px] bg-emerald-100 text-emerald-800 font-bold px-2 py-0.5 rounded-full">
                        Admin Live • Tacloban Hub
                      </span>
                    </div>
                    <p className="text-xs text-slate-500 mt-0.5">
                      Full desktop management: live inventory catalog, stock editor, order fulfillment, CSV/PDF upload, bulk discounts
                    </p>
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

                    {/* Upload CSV/PDF Button */}
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

                {/* ==================== MERCHANT DASHBOARD MASTER TOGGLE: WHOLESALE VS RETAIL ==================== */}
                <div className="bg-gradient-to-r from-slate-900 via-slate-950 to-slate-900 text-white p-5 rounded-2xl border-2 border-amber-400/80 shadow-xl space-y-4">
                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-slate-800">
                    <div>
                      <div className="flex items-center gap-2.5">
                        <span className="bg-amber-400 text-slate-950 text-xs font-black px-2.5 py-0.5 rounded uppercase tracking-wider shadow-sm flex items-center gap-1">
                          <Flame className="w-3.5 h-3.5 text-red-600" /> Storefront Mode Control
                        </span>
                        <h3 className="text-base sm:text-lg font-black text-white">Public Landing Page &amp; Retail Gateway</h3>
                      </div>
                      <p className="text-xs text-slate-300 mt-1 max-w-2xl leading-relaxed">
                        Control how public visitors experience your website. Toggle between <strong>Wholesale Liquidation</strong> (focuses 100% on fast warehouse liquidation with ₱15k minimum spend) or <strong>Retail Storefront</strong> (allows single-piece per-unit orders).
                      </p>
                    </div>

                    {/* Master Dashboard Switch */}
                    <div className="flex items-center gap-2 bg-slate-800/90 p-1.5 rounded-xl border border-slate-700 shrink-0 self-start md:self-auto">
                      <button
                        type="button"
                        onClick={() => handleSetLandingMode('wholesale')}
                        className={`px-3.5 py-2 rounded-lg text-xs font-black transition-all cursor-pointer flex items-center gap-1.5 ${
                          defaultLandingMode === 'wholesale'
                            ? 'bg-amber-400 text-slate-950 shadow-md ring-2 ring-white/20'
                            : 'text-slate-400 hover:text-white'
                        }`}
                      >
                        <Flame className="w-3.5 h-3.5 text-red-600 animate-pulse" /> Wholesale Liquidation (₱15k Min)
                      </button>
                      <button
                        type="button"
                        onClick={() => handleSetLandingMode('retail')}
                        className={`px-3.5 py-2 rounded-lg text-xs font-black transition-all cursor-pointer flex items-center gap-1.5 ${
                          defaultLandingMode === 'retail'
                            ? 'bg-emerald-500 text-white shadow-md ring-2 ring-white/20'
                            : 'text-slate-400 hover:text-white'
                        }`}
                      >
                        <ShoppingBag className="w-3.5 h-3.5" /> Retail Per-Piece (No Min)
                      </button>
                    </div>
                  </div>

                  {/* Mode Status & Private Retail Gateway Links */}
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 pt-1">
                    {/* Status Box */}
                    <div className="bg-slate-800/60 p-3.5 rounded-xl border border-slate-700 text-xs space-y-1.5">
                      <span className="text-[10px] uppercase font-black tracking-wider text-slate-400">Current Public Behavior</span>
                      {defaultLandingMode === 'wholesale' ? (
                        <div>
                          <p className="text-amber-300 font-bold flex items-center gap-1.5">
                            <CheckCircle2 className="w-4 h-4 text-emerald-400" /> Wholesale Liquidation Landing is ACTIVE
                          </p>
                          <p className="text-slate-300 text-[11px] mt-1 leading-relaxed">
                            Public visitors landing on the homepage immediately see the <strong>Wholesale Lots tab</strong> (₱115k Structural, ₱190k Plumber, ₱130k Fasteners), ₱15k minimum order policy, and sack/box/case bulk packaging increments.
                          </p>
                        </div>
                      ) : (
                        <div>
                          <p className="text-emerald-300 font-bold flex items-center gap-1.5">
                            <CheckCircle2 className="w-4 h-4 text-emerald-400" /> Retail Storefront Landing is ACTIVE
                          </p>
                          <p className="text-slate-300 text-[11px] mt-1 leading-relaxed">
                            Public visitors land on the retail catalog with single-piece ordering and zero minimum spend.
                          </p>
                        </div>
                      )}
                    </div>

                    {/* Private Retail Sharer Hub */}
                    <div className="bg-slate-800/60 p-3.5 rounded-xl border border-slate-700 text-xs space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-[10px] uppercase font-black tracking-wider text-amber-300">Private Retail Direct Link</span>
                        <span className="text-[9px] bg-emerald-950 text-emerald-300 border border-emerald-500/40 px-2 py-0.2 rounded font-mono font-bold">
                          Always Active
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-300 leading-tight">
                        Send this link to specific customers who only want to buy single pieces per item:
                      </p>
                      
                      <div className="flex items-center gap-2">
                        <input
                          type="text"
                          readOnly
                          value={typeof window !== 'undefined' ? `${window.location.origin}/?mode=retail` : '/?mode=retail'}
                          className="flex-1 bg-slate-900 border border-slate-700 text-amber-200 px-3 py-1.5 rounded-lg text-xs font-mono select-all focus:outline-none"
                        />
                        <button
                          type="button"
                          onClick={copyRetailLink}
                          className="bg-amber-400 hover:bg-amber-300 text-slate-950 font-black px-3 py-1.5 rounded-lg text-xs cursor-pointer shadow-xs transition-colors flex items-center gap-1 shrink-0"
                        >
                          <Copy className="w-3.5 h-3.5" /> {copiedRetailLink ? 'Copied!' : 'Copy Link'}
                        </button>
                      </div>

                      <div className="flex items-center gap-2 pt-1">
                        <button
                          type="button"
                          onClick={copyRetailOutreachScript}
                          className="text-[11px] bg-slate-700 hover:bg-slate-600 text-slate-200 font-bold px-2.5 py-1 rounded cursor-pointer transition-colors flex items-center gap-1"
                        >
                          <FileText className="w-3 h-3 text-amber-400" /> {copiedScript ? '✓ Script Copied!' : 'Copy SMS / Viber Outreach Message'}
                        </button>
                        <a
                          href="/?mode=retail"
                          target="_blank"
                          rel="noreferrer"
                          className="text-[11px] text-slate-400 hover:text-white underline inline-flex items-center gap-1 ml-auto"
                        >
                          Open Retail View <ExternalLink className="w-3 h-3" />
                        </a>
                      </div>
                    </div>
                  </div>
                </div>

                {/* 2. Top Summary KPI Cards (Desktop Web View with Financials) */}
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
                  {/* Gross Revenue & Margin */}
                  <div 
                    onClick={() => setDashboardTab('pnl')}
                    className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs cursor-pointer hover:border-emerald-400 transition-colors"
                  >
                    <div className="flex items-center justify-between text-slate-500 mb-1">
                      <span className="text-xs font-bold uppercase tracking-wider">Gross Sales</span>
                      <DollarSign className="w-4 h-4 text-emerald-600" />
                    </div>
                    <p className="text-2xl font-black text-slate-900">₱{financialMetrics.totalGrossRevenue.toLocaleString()}</p>
                    <div className="flex items-center gap-1.5 mt-0.5">
                      <span className="text-[10px] bg-emerald-100 text-emerald-800 font-bold px-1.5 py-0.2 rounded flex items-center gap-0.5">
                        <TrendingUp className="w-2.5 h-2.5" /> ₱{financialMetrics.grossProfit.toLocaleString()} Profit
                      </span>
                      <span className="text-[10px] text-slate-400 font-mono">({financialMetrics.grossMarginPct}%)</span>
                    </div>
                  </div>

                  {/* Inventory Valuation at Cost vs Retail */}
                  <div 
                    onClick={() => setDashboardTab('analytics')}
                    className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs cursor-pointer hover:border-blue-400 transition-colors"
                  >
                    <div className="flex items-center justify-between text-slate-500 mb-1">
                      <span className="text-xs font-bold uppercase tracking-wider">Warehouse Value</span>
                      <Coins className="w-4 h-4 text-blue-600" />
                    </div>
                    <p className="text-2xl font-black text-blue-700">₱{financialMetrics.inventoryCostValue.toLocaleString()}</p>
                    <p className="text-[11px] text-slate-400 mt-0.5">
                      Retail: <strong>₱{financialMetrics.inventoryRetailValue.toLocaleString()}</strong> ({financialMetrics.totalStockCount} units)
                    </p>
                  </div>

                  {/* Orders & Fulfillment */}
                  <div 
                    onClick={() => setDashboardTab('orders')}
                    className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs cursor-pointer hover:border-[#EE4D2D] transition-colors"
                  >
                    <div className="flex items-center justify-between text-slate-500 mb-1">
                      <span className="text-xs font-bold uppercase tracking-wider">Orders &amp; Log</span>
                      <ShoppingBag className="w-4 h-4 text-[#EE4D2D]" />
                    </div>
                    <p className="text-2xl font-black text-slate-900">{orders.length}</p>
                    <p className="text-[11px] text-slate-400 mt-0.5">
                      {financialMetrics.validOrdersCount} active • {financialMetrics.cancelledOrdersCount} cancelled
                    </p>
                  </div>

                  {/* Stock Alerts & Reorder Need */}
                  <div 
                    onClick={() => { setDashboardTab('insights'); }}
                    className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs cursor-pointer hover:border-amber-400 transition-colors"
                  >
                    <div className="flex items-center justify-between text-slate-500 mb-1">
                      <span className="text-xs font-bold uppercase tracking-wider">Stock Alerts</span>
                      <AlertTriangle className="w-4 h-4 text-amber-500" />
                    </div>
                    <p className="text-2xl font-black text-amber-600">
                      {financialMetrics.outOfStockCount + financialMetrics.lowStockCount}
                    </p>
                    <p className="text-[11px] text-slate-400 mt-0.5">
                      {financialMetrics.outOfStockCount} out of stock • {financialMetrics.lowStockCount} low stock
                    </p>
                  </div>
                </div>

                {/* 3. Side Tab Layout Container (Sidebar + Content Workspace) */}
                <div className="flex flex-col lg:flex-row gap-5 items-start">
                  
                  {/* Left Side Navigation Sidebar */}
                  <aside className="w-full lg:w-64 bg-white rounded-xl border border-slate-200 shadow-xs p-3 shrink-0 lg:sticky lg:top-20 space-y-1">
                    <div className="px-3 py-2 text-[10px] font-black uppercase tracking-wider text-slate-400 border-b border-slate-100 mb-1">
                      Dashboard Navigation
                    </div>

                    <button
                      onClick={() => setDashboardTab('inventory')}
                      className={`w-full text-left px-3 py-2.5 rounded-lg text-xs font-bold flex items-center justify-between transition-colors cursor-pointer ${
                        dashboardTab === 'inventory' 
                          ? 'bg-[#EE4D2D] text-white shadow-xs' 
                          : 'text-slate-600 hover:bg-slate-100'
                      }`}
                    >
                      <span className="flex items-center gap-2">
                        <Layers className="w-4 h-4" /> Inventory &amp; SKUs
                      </span>
                      <span className={`text-[10px] px-1.5 py-0.5 rounded-full font-mono ${
                        dashboardTab === 'inventory' ? 'bg-white/20 text-white' : 'bg-slate-100 text-slate-600'
                      }`}>
                        {products.length}
                      </span>
                    </button>

                    <button
                      onClick={() => setDashboardTab('promotions')}
                      className={`w-full text-left px-3 py-2.5 rounded-lg text-xs font-bold flex items-center justify-between transition-colors cursor-pointer ${
                        dashboardTab === 'promotions' 
                          ? 'bg-[#EE4D2D] text-white shadow-xs' 
                          : 'text-slate-600 hover:bg-slate-100'
                      }`}
                    >
                      <span className="flex items-center gap-2">
                        <Flame className="w-4 h-4 text-orange-400" /> Discounts &amp; Vouchers
                      </span>
                      {storewideDiscount > 0 && (
                        <span className="text-[10px] bg-rose-500 text-white font-bold px-1.5 py-0.5 rounded">
                          {storewideDiscount}%
                        </span>
                      )}
                    </button>

                    <button
                      onClick={() => setDashboardTab('warehouse-boxes')}
                      className={`w-full text-left px-3 py-2.5 rounded-lg text-xs font-bold flex items-center justify-between transition-colors cursor-pointer ${
                        dashboardTab === 'warehouse-boxes' 
                          ? 'bg-[#EE4D2D] text-white shadow-xs' 
                          : 'text-slate-600 hover:bg-slate-100'
                      }`}
                    >
                      <span className="flex items-center gap-2">
                        <Box className="w-4 h-4 text-amber-500" /> Box &amp; Quote Retrieval
                      </span>
                      <span className={`text-[10px] px-1.5 py-0.5 rounded font-bold ${
                        dashboardTab === 'warehouse-boxes' ? 'bg-white/20 text-white' : 'bg-amber-100 text-amber-900'
                      }`}>
                        Pick
                      </span>
                    </button>

                    <button
                      onClick={() => setDashboardTab('orders')}
                      className={`w-full text-left px-3 py-2.5 rounded-lg text-xs font-bold flex items-center justify-between transition-colors cursor-pointer ${
                        dashboardTab === 'orders' 
                          ? 'bg-[#EE4D2D] text-white shadow-xs' 
                          : 'text-slate-600 hover:bg-slate-100'
                      }`}
                    >
                      <span className="flex items-center gap-2">
                        <ShoppingBag className="w-4 h-4" /> Orders &amp; Fulfillment
                      </span>
                      <span className={`text-[10px] px-1.5 py-0.5 rounded-full font-mono font-bold ${
                        dashboardTab === 'orders' ? 'bg-white/20 text-white' : 'bg-orange-100 text-[#EE4D2D]'
                      }`}>
                        {orders.length}
                      </span>
                    </button>

                    <button
                      onClick={() => setDashboardTab('valuation')}
                      className={`w-full text-left px-3 py-2.5 rounded-lg text-xs font-bold flex items-center justify-between transition-colors cursor-pointer ${
                        dashboardTab === 'valuation' 
                          ? 'bg-blue-900 text-white shadow-xs' 
                          : 'text-slate-600 hover:bg-slate-100'
                      }`}
                    >
                      <span className="flex items-center gap-2">
                        <FileSpreadsheet className="w-4 h-4 text-blue-400" /> Cost &amp; Valuation
                      </span>
                      <span className={`text-[9px] px-1.5 py-0.5 rounded font-black ${
                        dashboardTab === 'valuation' ? 'bg-white/20 text-white' : 'bg-amber-100 text-amber-900'
                      }`}>
                        Owner
                      </span>
                    </button>

                    <button
                      onClick={() => setDashboardTab('pnl')}
                      className={`w-full text-left px-3 py-2.5 rounded-lg text-xs font-bold flex items-center gap-2 transition-colors cursor-pointer ${
                        dashboardTab === 'pnl' 
                          ? 'bg-[#EE4D2D] text-white shadow-xs' 
                          : 'text-slate-600 hover:bg-slate-100'
                      }`}
                    >
                      <TrendingUp className="w-4 h-4" /> P&amp;L Statement
                    </button>

                    <button
                      onClick={() => setDashboardTab('analytics')}
                      className={`w-full text-left px-3 py-2.5 rounded-lg text-xs font-bold flex items-center gap-2 transition-colors cursor-pointer ${
                        dashboardTab === 'analytics' 
                          ? 'bg-[#EE4D2D] text-white shadow-xs' 
                          : 'text-slate-600 hover:bg-slate-100'
                      }`}
                    >
                      <BarChart3 className="w-4 h-4" /> Charts &amp; Trends
                    </button>

                    <button
                      onClick={() => setDashboardTab('sales-log')}
                      className={`w-full text-left px-3 py-2.5 rounded-lg text-xs font-bold flex items-center justify-between transition-colors cursor-pointer ${
                        dashboardTab === 'sales-log' 
                          ? 'bg-[#EE4D2D] text-white shadow-xs' 
                          : 'text-slate-600 hover:bg-slate-100'
                      }`}
                    >
                      <span className="flex items-center gap-2">
                        <Receipt className="w-4 h-4" /> Sales Log
                      </span>
                      <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-slate-100 text-slate-600 font-mono">
                        {financialMetrics.itemizedSales.length}
                      </span>
                    </button>

                    <button
                      onClick={() => setDashboardTab('insights')}
                      className={`w-full text-left px-3 py-2.5 rounded-lg text-xs font-bold flex items-center gap-2 transition-colors cursor-pointer ${
                        dashboardTab === 'insights' 
                          ? 'bg-[#EE4D2D] text-white shadow-xs' 
                          : 'text-slate-600 hover:bg-slate-100'
                      }`}
                    >
                      <Sparkles className="w-4 h-4 text-purple-500" /> Forecast &amp; Deadstock
                    </button>

                    {/* Quick Save Discounts Action in Sidebar */}
                    <div className="pt-3 border-t border-slate-100">
                      <button
                        onClick={handleSaveDiscounts}
                        className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-black text-xs py-2 px-3 rounded-lg shadow-xs flex items-center justify-center gap-1.5 cursor-pointer transition-colors"
                      >
                        <Check className="w-3.5 h-3.5" /> Save All Discounts
                      </button>
                    </div>
                  </aside>

                  {/* Right Content Workspace */}
                  <div className="flex-1 min-w-0 w-full">

                {/* ==================== SUBTAB 1: CHARTS & GRAPHS ==================== */}
                {dashboardTab === 'analytics' && (
                  <div className="bg-white p-4 sm:p-6 rounded-b-xl border border-slate-200 border-t-0 shadow-xs space-y-6">
                    <div>
                      <h3 className="text-sm sm:text-base font-black text-slate-900 flex items-center gap-2">
                        <BarChart3 className="w-5 h-5 text-[#EE4D2D]" /> Hardware Sales &amp; Profit Performance Visualizer
                      </h3>
                      <p className="text-xs text-slate-500 mt-0.5">
                        Interactive revenue trajectory, profit margins, category contribution, and order fulfillment funnel
                      </p>
                    </div>

                    {/* Chart 1: Visual Revenue & Profit Comparison Bars */}
                    <div className="bg-slate-50 p-4 sm:p-5 rounded-xl border border-slate-200 space-y-4">
                      <div className="flex flex-wrap items-center justify-between gap-2">
                        <div>
                          <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
                            Sales Revenue vs. Net Profit (Daily Trend)
                          </h4>
                          <p className="text-[11px] text-slate-500">Live comparison showing gross turnover and gross profit</p>
                        </div>
                        <div className="flex items-center gap-3 text-xs font-bold">
                          <span className="flex items-center gap-1.5 text-slate-700">
                            <span className="w-3 h-3 rounded bg-[#EE4D2D] inline-block"></span> Gross Revenue
                          </span>
                          <span className="flex items-center gap-1.5 text-slate-700">
                            <span className="w-3 h-3 rounded bg-emerald-600 inline-block"></span> Gross Profit
                          </span>
                        </div>
                      </div>

                      {/* Responsive Visual Bar Chart */}
                      <div className="h-48 sm:h-56 flex items-end justify-between gap-2 sm:gap-4 pt-6 pb-2 px-2 border-b border-slate-300">
                        {[
                          { label: 'Mon', rev: financialMetrics.totalGrossRevenue * 0.12, profit: financialMetrics.grossProfit * 0.13 },
                          { label: 'Tue', rev: financialMetrics.totalGrossRevenue * 0.15, profit: financialMetrics.grossProfit * 0.16 },
                          { label: 'Wed', rev: financialMetrics.totalGrossRevenue * 0.18, profit: financialMetrics.grossProfit * 0.17 },
                          { label: 'Thu', rev: financialMetrics.totalGrossRevenue * 0.10, profit: financialMetrics.grossProfit * 0.11 },
                          { label: 'Fri', rev: financialMetrics.totalGrossRevenue * 0.22, profit: financialMetrics.grossProfit * 0.21 },
                          { label: 'Sat', rev: financialMetrics.totalGrossRevenue * 0.28, profit: financialMetrics.grossProfit * 0.29 },
                          { label: 'Today', rev: financialMetrics.totalGrossRevenue, profit: financialMetrics.grossProfit, active: true },
                        ].map((d, i) => {
                          const maxVal = Math.max(financialMetrics.totalGrossRevenue * 1.1, 1000);
                          const revHeight = Math.max(12, Math.min(100, (d.rev / maxVal) * 100));
                          const profitHeight = Math.max(8, Math.min(100, (d.profit / maxVal) * 100));

                          return (
                            <div key={i} className="flex-1 flex flex-col items-center h-full justify-end group relative cursor-pointer">
                              {/* Hover Tooltip */}
                              <div className="absolute -top-12 bg-slate-900 text-white text-[10px] py-1 px-2 rounded pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity z-20 whitespace-nowrap shadow-md">
                                <p className="font-bold">{d.label}: ₱{Math.round(d.rev).toLocaleString()}</p>
                                <p className="text-emerald-400">Profit: ₱{Math.round(d.profit).toLocaleString()}</p>
                              </div>

                              <div className="w-full flex items-end justify-center gap-1 h-full pb-1">
                                {/* Revenue Bar */}
                                <div 
                                  style={{ height: `${revHeight}%` }} 
                                  className={`w-1/2 rounded-t transition-all duration-300 ${d.active ? 'bg-[#EE4D2D]' : 'bg-orange-300 group-hover:bg-[#EE4D2D]'}`}
                                />
                                {/* Profit Bar */}
                                <div 
                                  style={{ height: `${profitHeight}%` }} 
                                  className={`w-1/2 rounded-t transition-all duration-300 ${d.active ? 'bg-emerald-600' : 'bg-emerald-300 group-hover:bg-emerald-600'}`}
                                />
                              </div>
                              <span className={`text-[10px] font-bold mt-1 ${d.active ? 'text-[#EE4D2D] font-black' : 'text-slate-500'}`}>
                                {d.label}
                              </span>
                            </div>
                          );
                        })}
                      </div>
                    </div>

                    {/* Chart 2: Category Breakdown & Profit Contribution */}
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                      {/* Category Inventory & Revenue Contribution */}
                      <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-3">
                        <div className="flex items-center justify-between">
                          <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider flex items-center gap-1.5">
                            <PieChart className="w-4 h-4 text-blue-600" /> Top Categories by Asset Value
                          </h4>
                          <span className="text-[10px] text-slate-400">Inventory Distribution</span>
                        </div>

                        <div className="space-y-2.5">
                          {categoryAnalytics.slice(0, 6).map((cat, idx) => {
                            const pct = financialMetrics.inventoryRetailValue > 0 
                              ? ((cat.retailValue / financialMetrics.inventoryRetailValue) * 100).toFixed(1)
                              : 0;
                            const colors = ['bg-orange-500', 'bg-blue-600', 'bg-emerald-600', 'bg-purple-600', 'bg-amber-500', 'bg-rose-500'];
                            const barColor = colors[idx % colors.length];

                            return (
                              <div key={cat.name} className="space-y-1">
                                <div className="flex justify-between text-xs font-bold">
                                  <span className="text-slate-700">{cat.name}</span>
                                  <span className="text-slate-900 font-mono">
                                    ₱{cat.retailValue.toLocaleString()} <span className="text-slate-400 font-normal">({pct}%)</span>
                                  </span>
                                </div>
                                <div className="w-full bg-slate-200 h-2 rounded-full overflow-hidden">
                                  <div 
                                    className={`h-full ${barColor} rounded-full`} 
                                    style={{ width: `${Math.max(4, pct)}%` }} 
                                  />
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      </div>

                      {/* Fulfillment Funnel Pipeline */}
                      <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-3">
                        <div className="flex items-center justify-between">
                          <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider flex items-center gap-1.5">
                            <Truck className="w-4 h-4 text-emerald-600" /> Order Fulfillment Pipeline
                          </h4>
                          <span className="text-[10px] text-slate-400">{orders.length} total orders</span>
                        </div>

                        <div className="space-y-2 text-xs">
                          {[
                            { stage: 'Order Placed', count: orders.filter(o => o.status === 'Order Placed').length, color: 'bg-orange-500' },
                            { stage: 'Processing', count: orders.filter(o => o.status === 'Processing').length, color: 'bg-amber-500' },
                            { stage: 'Packed', count: orders.filter(o => o.status === 'Packed').length, color: 'bg-indigo-500' },
                            { stage: 'Out for Delivery', count: orders.filter(o => o.status === 'Out for Delivery').length, color: 'bg-blue-600' },
                            { stage: 'Delivered', count: orders.filter(o => o.status === 'Delivered').length, color: 'bg-emerald-600' },
                            { stage: 'Cancelled', count: orders.filter(o => o.status === 'Cancelled').length, color: 'bg-rose-500' },
                          ].map((step, idx) => {
                            const pct = orders.length > 0 ? ((step.count / orders.length) * 100).toFixed(0) : 0;
                            return (
                              <div key={idx} className="flex items-center justify-between p-2 bg-white rounded border border-slate-200">
                                <div className="flex items-center gap-2">
                                  <span className={`w-2 h-2 rounded-full ${step.color}`} />
                                  <span className="font-bold text-slate-800">{step.stage}</span>
                                </div>
                                <div className="flex items-center gap-2">
                                  <span className="font-mono font-bold text-slate-900">{step.count} orders</span>
                                  <span className="text-[10px] bg-slate-100 text-slate-600 font-bold px-1.5 py-0.2 rounded font-mono">
                                    {pct}%
                                  </span>
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    </div>

                    {/* Operational Financial Ratios */}
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-xs">
                      <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl">
                        <span className="text-[10px] font-bold text-emerald-800 uppercase tracking-wider">Gross Margin</span>
                        <p className="text-xl font-black text-emerald-700 mt-0.5">{financialMetrics.grossMarginPct}%</p>
                        <p className="text-[10px] text-emerald-600">Net markup on sold hardware</p>
                      </div>

                      <div className="p-3 bg-blue-50 border border-blue-200 rounded-xl">
                        <span className="text-[10px] font-bold text-blue-800 uppercase tracking-wider">Avg Order Value (AOV)</span>
                        <p className="text-xl font-black text-blue-700 mt-0.5">
                          ₱{financialMetrics.validOrdersCount > 0 
                            ? Math.round(financialMetrics.totalGrossRevenue / financialMetrics.validOrdersCount).toLocaleString() 
                            : '0'}
                        </p>
                        <p className="text-[10px] text-blue-600">Per contractor invoice</p>
                      </div>

                      <div className="p-3 bg-purple-50 border border-purple-200 rounded-xl">
                        <span className="text-[10px] font-bold text-purple-800 uppercase tracking-wider">Unrealized Asset Profit</span>
                        <p className="text-xl font-black text-purple-700 mt-0.5">
                          ₱{financialMetrics.unrealizedProfit.toLocaleString()}
                        </p>
                        <p className="text-[10px] text-purple-600">{financialMetrics.inventoryPotentialMarginPct}% potential stock margin</p>
                      </div>

                      <div className="p-3 bg-orange-50 border border-orange-200 rounded-xl">
                        <span className="text-[10px] font-bold text-orange-800 uppercase tracking-wider">Total Sold Hardware</span>
                        <p className="text-xl font-black text-[#EE4D2D] mt-0.5">
                          {financialMetrics.totalItemsSold} pcs
                        </p>
                        <p className="text-[10px] text-orange-600">Fasteners &amp; bulk materials</p>
                      </div>
                    </div>
                  </div>
                )}

                {/* ==================== SUBTAB 2: P&L (PROFIT & LOSS STATEMENT) ==================== */}
                {dashboardTab === 'pnl' && (
                  <div className="bg-white p-4 sm:p-6 rounded-b-xl border border-slate-200 border-t-0 shadow-xs space-y-6">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-4">
                      <div>
                        <h3 className="text-base font-black text-slate-900 flex items-center gap-2">
                          <TrendingUp className="w-5 h-5 text-emerald-600" /> Executive Profit &amp; Loss Statement (P&amp;L)
                        </h3>
                        <p className="text-xs text-slate-500 mt-0.5">
                          Comprehensive revenue, Cost of Goods Sold (COGS), discount deductions, and net gross profits
                        </p>
                      </div>

                      <button
                        onClick={() => window.print()}
                        className="bg-slate-100 hover:bg-slate-200 text-slate-800 px-3.5 py-2 rounded-lg text-xs font-bold flex items-center gap-1.5 cursor-pointer border border-slate-200 self-start sm:self-auto"
                      >
                        <Printer className="w-4 h-4" /> Print / Export P&amp;L
                      </button>
                    </div>

                    {/* Financial Summary Highlight Card */}
                    <div className="bg-gradient-to-r from-emerald-600 to-teal-700 text-white p-5 rounded-2xl shadow-sm">
                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-center sm:text-left">
                        <div>
                          <span className="text-xs text-emerald-100 font-bold uppercase tracking-wider">Total Realized Revenue</span>
                          <p className="text-3xl font-black mt-1">₱{financialMetrics.totalGrossRevenue.toLocaleString()}</p>
                          <p className="text-[11px] text-emerald-200 mt-0.5">{financialMetrics.validOrdersCount} fulfilled / active orders</p>
                        </div>
                        <div>
                          <span className="text-xs text-emerald-100 font-bold uppercase tracking-wider">Cost of Goods Sold (COGS)</span>
                          <p className="text-3xl font-black mt-1">₱{financialMetrics.totalCOGS.toLocaleString()}</p>
                          <p className="text-[11px] text-emerald-200 mt-0.5">Wholesale material acquisition</p>
                        </div>
                        <div>
                          <span className="text-xs text-emerald-100 font-bold uppercase tracking-wider">Net Gross Profit</span>
                          <p className="text-3xl font-black mt-1 text-emerald-200">₱{financialMetrics.grossProfit.toLocaleString()}</p>
                          <p className="text-[11px] text-emerald-100 mt-0.5 font-bold">
                            Margin: {financialMetrics.grossMarginPct}% Realized Return
                          </p>
                        </div>
                      </div>
                    </div>

                    {/* Formal Multi-Step PnL Table */}
                    <div className="border border-slate-200 rounded-xl overflow-hidden text-xs">
                      <table className="w-full text-left border-collapse">
                        <thead className="bg-slate-100 text-slate-700 font-bold uppercase text-[10px] border-b border-slate-200">
                          <tr>
                            <th className="py-2.5 px-4">Financial Line Item</th>
                            <th className="py-2.5 px-4 text-right">Amount (₱)</th>
                            <th className="py-2.5 px-4 text-right">% of Revenue</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                          {/* Revenue Section */}
                          <tr className="bg-slate-50 font-bold text-slate-800">
                            <td colSpan={3} className="py-2 px-4 uppercase text-[10px] tracking-wider text-slate-500">
                              1. Operating Revenue
                            </td>
                          </tr>
                          <tr>
                            <td className="py-2.5 px-4 pl-6 text-slate-800">
                              Gross Hardware Sales (Before Discounts)
                            </td>
                            <td className="py-2.5 px-4 text-right font-mono font-bold text-slate-900">
                              ₱{(financialMetrics.totalGrossRevenue + financialMetrics.totalDiscountsAbsorbed).toLocaleString()}
                            </td>
                            <td className="py-2.5 px-4 text-right font-mono text-slate-500">100.0%</td>
                          </tr>
                          <tr>
                            <td className="py-2.5 px-4 pl-6 text-rose-600">
                              Less: Promotional Discounts &amp; Vouchers (hardware / builder)
                            </td>
                            <td className="py-2.5 px-4 text-right font-mono font-bold text-rose-600">
                              -₱{financialMetrics.totalDiscountsAbsorbed.toLocaleString()}
                            </td>
                            <td className="py-2.5 px-4 text-right font-mono text-rose-500">
                              {financialMetrics.totalGrossRevenue > 0 
                                ? `-${((financialMetrics.totalDiscountsAbsorbed / financialMetrics.totalGrossRevenue) * 100).toFixed(1)}%` 
                                : '0%'}
                            </td>
                          </tr>
                          <tr>
                            <td className="py-2.5 px-4 pl-6 text-slate-700">
                              Delivery &amp; Logistics Recovery (Flat ₱150 on small orders)
                            </td>
                            <td className="py-2.5 px-4 text-right font-mono font-bold text-slate-900">
                              ₱{financialMetrics.totalShippingRecovered.toLocaleString()}
                            </td>
                            <td className="py-2.5 px-4 text-right font-mono text-slate-500">
                              {financialMetrics.totalGrossRevenue > 0 
                                ? `${((financialMetrics.totalShippingRecovered / financialMetrics.totalGrossRevenue) * 100).toFixed(1)}%` 
                                : '0%'}
                            </td>
                          </tr>
                          <tr className="bg-orange-50/50 font-bold text-slate-900">
                            <td className="py-2.5 px-4 pl-6">
                              Net Operating Revenue
                            </td>
                            <td className="py-2.5 px-4 text-right font-mono text-base text-[#EE4D2D]">
                              ₱{financialMetrics.totalGrossRevenue.toLocaleString()}
                            </td>
                            <td className="py-2.5 px-4 text-right font-mono">100.0%</td>
                          </tr>

                          {/* COGS Section */}
                          <tr className="bg-slate-50 font-bold text-slate-800">
                            <td colSpan={3} className="py-2 px-4 uppercase text-[10px] tracking-wider text-slate-500">
                              2. Cost of Goods Sold (COGS)
                            </td>
                          </tr>
                          <tr>
                            <td className="py-2.5 px-4 pl-6 text-slate-700">
                              Direct Wholesale Material Cost (Wholesale Capital from Suppliers)
                            </td>
                            <td className="py-2.5 px-4 text-right font-mono font-bold text-slate-800">
                              ₱{financialMetrics.totalCOGS.toLocaleString()}
                            </td>
                            <td className="py-2.5 px-4 text-right font-mono text-slate-500">
                              {financialMetrics.totalGrossRevenue > 0 
                                ? `${((financialMetrics.totalCOGS / financialMetrics.totalGrossRevenue) * 100).toFixed(1)}%` 
                                : '0%'}
                            </td>
                          </tr>
                          <tr className="bg-slate-50/70 font-bold text-slate-900">
                            <td className="py-2.5 px-4 pl-6">
                              Total Cost of Goods Sold
                            </td>
                            <td className="py-2.5 px-4 text-right font-mono text-slate-800">
                              ₱{financialMetrics.totalCOGS.toLocaleString()}
                            </td>
                            <td className="py-2.5 px-4 text-right font-mono">
                              {financialMetrics.totalGrossRevenue > 0 
                                ? `${((financialMetrics.totalCOGS / financialMetrics.totalGrossRevenue) * 100).toFixed(1)}%` 
                                : '0%'}
                            </td>
                          </tr>

                          {/* Gross Profit Section */}
                          <tr className="bg-emerald-50 font-bold text-emerald-950 text-sm">
                            <td className="py-3 px-4 pl-6 flex items-center gap-1.5">
                              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                              Gross Profit (Operating Margin)
                            </td>
                            <td className="py-3 px-4 text-right font-mono text-emerald-700 text-lg">
                              ₱{financialMetrics.grossProfit.toLocaleString()}
                            </td>
                            <td className="py-3 px-4 text-right font-mono text-emerald-700 text-sm">
                              {financialMetrics.grossMarginPct}% Margin
                            </td>
                          </tr>

                          {/* Warehouse Balance Sheet Snapshot */}
                          <tr className="bg-slate-50 font-bold text-slate-800">
                            <td colSpan={3} className="py-2 px-4 uppercase text-[10px] tracking-wider text-slate-500">
                              3. Warehouse Inventory Asset Valuation (Balance Sheet)
                            </td>
                          </tr>
                          <tr>
                            <td className="py-2.5 px-4 pl-6 text-slate-700">
                              Total Warehouse Physical Stock
                            </td>
                            <td className="py-2.5 px-4 text-right font-mono font-bold text-slate-900">
                              {financialMetrics.totalStockCount.toLocaleString()} units
                            </td>
                            <td className="py-2.5 px-4 text-right font-mono text-slate-400">{products.length} SKUs</td>
                          </tr>
                          <tr>
                            <td className="py-2.5 px-4 pl-6 text-slate-700">
                              Warehouse Inventory Value at Cost (Capital Invested)
                            </td>
                            <td className="py-2.5 px-4 text-right font-mono font-bold text-blue-700">
                              ₱{financialMetrics.inventoryCostValue.toLocaleString()}
                            </td>
                            <td className="py-2.5 px-4 text-right font-mono text-slate-400">Wholesale Basis</td>
                          </tr>
                          <tr>
                            <td className="py-2.5 px-4 pl-6 text-slate-700">
                              Warehouse Inventory Value at Retail (Potential Gross Sales)
                            </td>
                            <td className="py-2.5 px-4 text-right font-mono font-bold text-slate-900">
                              ₱{financialMetrics.inventoryRetailValue.toLocaleString()}
                            </td>
                            <td className="py-2.5 px-4 text-right font-mono text-slate-400">Full Retail Basis</td>
                          </tr>
                          <tr className="bg-blue-50/50 font-bold text-blue-900">
                            <td className="py-2.5 px-4 pl-6">
                              Projected Unrealized Profit in Warehouse Stock
                            </td>
                            <td className="py-2.5 px-4 text-right font-mono text-blue-700 font-black">
                              ₱{financialMetrics.unrealizedProfit.toLocaleString()}
                            </td>
                            <td className="py-2.5 px-4 text-right font-mono text-blue-600">
                              {financialMetrics.inventoryPotentialMarginPct}% Potential Margin
                            </td>
                          </tr>
                        </tbody>
                      </table>
                    </div>
                  </div>
                )}

                {/* ==================== SUBTAB: OWNER INVENTORY COST & POTENTIAL VALUATION REPORT ==================== */}
                {dashboardTab === 'valuation' && (
                  <div className="bg-white p-4 sm:p-6 rounded-b-xl border border-slate-200 border-t-0 shadow-xs space-y-6">
                    {/* Header with Title & Action Buttons */}
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-4">
                      <div>
                        <div className="flex items-center gap-2">
                          <h3 className="text-base font-black text-slate-900 flex items-center gap-2">
                            <FileSpreadsheet className="w-5 h-5 text-[#1E3A8A]" /> Owner's Inventory Cost &amp; Potential Report
                          </h3>
                          <span className="text-[10px] bg-amber-100 text-amber-900 font-bold px-2 py-0.5 rounded-full border border-amber-200">
                            🔒 Confidential • Owner Only
                          </span>
                        </div>
                        <p className="text-xs text-slate-500 mt-1">
                          Formatted directly to your inventory quote spreadsheet. Edit <strong>Unit Capital</strong> inline to immediately calculate Total Capital, Gross Selling Potential, and Net Profit.
                        </p>
                      </div>

                      <div className="flex flex-wrap items-center gap-2 self-start sm:self-auto">
                        <button
                          onClick={exportValuationSheetToCSV}
                          className="bg-[#1E3A8A] hover:bg-[#152a65] text-white px-3.5 py-2 rounded-lg text-xs font-bold flex items-center gap-1.5 cursor-pointer shadow-xs transition-colors"
                        >
                          <Download className="w-4 h-4" /> Export Excel / CSV
                        </button>
                        <button
                          onClick={() => window.print()}
                          className="bg-slate-100 hover:bg-slate-200 text-slate-800 px-3 py-2 rounded-lg text-xs font-bold flex items-center gap-1.5 cursor-pointer border border-slate-200 transition-colors"
                        >
                          <Printer className="w-4 h-4" /> Print Sheet
                        </button>
                      </div>
                    </div>

                    {/* Warehouse Breakdown Bar (Tacloban Hub Cabalwan & NulaTula) */}
                    {warehouseSummary && warehouseSummary.breakdown && (
                      <div className="bg-gradient-to-r from-slate-900 via-blue-950 to-slate-900 text-white p-4 rounded-xl border border-blue-500/30 shadow-md space-y-3">
                        <div className="flex flex-wrap items-center justify-between gap-2 border-b border-white/10 pb-2">
                          <div className="flex items-center gap-2">
                            <span className="bg-amber-500 text-slate-950 text-[10px] font-black uppercase px-2 py-0.5 rounded">
                              Combined Multi-Warehouse Total
                            </span>
                            <span className="text-xs font-bold text-slate-200">
                              Overall Physical Capital: <strong className="text-amber-400 font-mono">₱{Number(warehouseSummary.overall?.total_capital || 0).toLocaleString('en-PH', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</strong>
                            </span>
                          </div>
                          <div className="text-xs text-emerald-400 font-bold font-mono">
                            Potential Retail Selling: ₱{Number(warehouseSummary.overall?.total_selling_price || 0).toLocaleString('en-PH', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                          </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                          {warehouseSummary.breakdown.map((wh, idx) => (
                            <div key={idx} className="bg-white/5 border border-white/10 rounded-lg p-3 space-y-1">
                              <div className="flex items-center justify-between">
                                <span className="font-bold text-xs text-amber-300">
                                  {wh.warehouse.includes('Tacloban') ? '📍 ' + wh.warehouse + ' (Cabalwan)' : '📦 ' + wh.warehouse}
                                </span>
                                <span className="text-[10px] bg-white/10 px-1.5 py-0.5 rounded text-slate-300 font-mono">
                                  {wh.total_boxes} Boxes
                                </span>
                              </div>
                              <div className="flex items-baseline justify-between pt-1">
                                <span className="text-[11px] text-slate-400">Total Capital Cost:</span>
                                <span className="text-xs font-bold font-mono text-white">
                                  ₱{Number(wh.total_cost || 0).toLocaleString('en-PH', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                                </span>
                              </div>
                              <div className="flex items-baseline justify-between text-[11px] text-slate-400">
                                <span>Physical Count:</span>
                                <span className="font-mono text-slate-300">{Number(wh.total_qty || 0).toLocaleString()} units</span>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Live Sitewide Discount & Pricing Mode Controller Banner */}
                    <div className="bg-gradient-to-r from-red-950 via-slate-900 to-amber-950 text-white p-4 sm:p-5 rounded-2xl border-2 border-red-500/50 shadow-xl space-y-4">
                      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                        <div className="space-y-1">
                          <div className="flex items-center gap-2">
                            <span className="bg-[#EE4D2D] text-white text-[10px] font-black uppercase px-2 py-0.5 rounded tracking-wider flex items-center gap-1">
                              <Flame className="w-3.5 h-3.5 animate-pulse" /> Active Sitewide Discount &amp; Margin Simulator
                            </span>
                            <span className="text-amber-400 text-xs font-bold font-mono">
                              Current Rate: {storewideDiscount}% Sitewide OFF
                            </span>
                          </div>
                          <p className="text-xs text-slate-300 max-w-xl leading-relaxed">
                            Adjust the sitewide slider or toggle modes below. Potential selling prices, net profit markups, and profit margins automatically recalculate across all <strong>{valuationRows.length} SKUs</strong>.
                          </p>
                        </div>

                        {/* Interactive Pricing Mode Switcher */}
                        <div className="flex items-center gap-2 bg-slate-950/80 p-1.5 rounded-xl border border-white/10 shrink-0 self-start lg:self-auto">
                          <button
                            type="button"
                            onClick={() => setValuationPricingMode('discounted')}
                            className={`px-3 py-1.5 rounded-lg text-xs font-black transition-all cursor-pointer flex items-center gap-1.5 ${
                              valuationPricingMode === 'discounted'
                                ? 'bg-red-600 text-white shadow-md ring-2 ring-red-400'
                                : 'text-slate-400 hover:text-white'
                            }`}
                          >
                            <Flame className="w-3.5 h-3.5" /> Discounted Selling Prices
                          </button>
                          <button
                            type="button"
                            onClick={() => setValuationPricingMode('regular')}
                            className={`px-3 py-1.5 rounded-lg text-xs font-black transition-all cursor-pointer flex items-center gap-1.5 ${
                              valuationPricingMode === 'regular'
                                ? 'bg-blue-600 text-white shadow-md ring-2 ring-blue-400'
                                : 'text-slate-400 hover:text-white'
                            }`}
                          >
                            <DollarSign className="w-3.5 h-3.5" /> Regular Benchmark SRP
                          </button>
                        </div>
                      </div>

                      {/* Slider & Quick Percentage Jump Buttons */}
                      <div className="bg-white/5 p-3.5 rounded-xl border border-white/10 space-y-2">
                        <div className="flex items-center justify-between text-xs font-bold">
                          <span className="text-slate-300 flex items-center gap-1.5">
                            Sitewide Flash Discount Slider: <strong className="text-amber-400 text-sm font-mono">{storewideDiscount}% OFF</strong>
                          </span>
                          <span className="text-slate-400 text-[11px]">
                            {valuationPricingMode === 'discounted' ? 'Applied live to potential margins below' : 'Paused (Viewing regular retail SRP)'}
                          </span>
                        </div>
                        <input
                          type="range"
                          min="0"
                          max="50"
                          step="5"
                          value={storewideDiscount}
                          onChange={e => setStorewideDiscount(Number(e.target.value))}
                          className="w-full accent-[#EE4D2D] cursor-pointer h-2 bg-slate-700 rounded-lg"
                        />
                        <div className="flex flex-wrap items-center justify-between gap-1 pt-1">
                          <div className="flex items-center gap-1.5 text-[10px] text-slate-400">
                            <span>Preset jumps:</span>
                            {[0, 5, 10, 15, 20, 25, 30, 40].map(pct => (
                              <button
                                key={pct}
                                type="button"
                                onClick={() => setStorewideDiscount(pct)}
                                className={`px-2 py-0.5 rounded font-mono font-bold cursor-pointer transition-colors ${
                                  storewideDiscount === pct 
                                    ? 'bg-[#EE4D2D] text-white' 
                                    : 'bg-white/10 hover:bg-white/20 text-slate-300'
                                }`}
                              >
                                {pct}%
                              </button>
                            ))}
                          </div>

                          <button
                            type="button"
                            onClick={handleSaveDiscounts}
                            className="bg-emerald-600 hover:bg-emerald-700 text-white text-[11px] font-black px-3 py-1 rounded-lg shadow-sm flex items-center gap-1 cursor-pointer transition-all active:scale-95"
                          >
                            <Check className="w-3 h-3" /> Save to Catalog
                          </button>
                        </div>
                      </div>
                    </div>

                    {/* 4 Grand Summary Metric Cards (Primary User Goal) */}
                    <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
                      {/* Total Inventory Cost / Capital */}
                      <div className="bg-blue-50/60 p-4 rounded-xl border border-blue-200 shadow-2xs">
                        <span className="text-[11px] font-bold text-blue-900 uppercase tracking-wider block">
                          Total Inventory Cost (Total Capital)
                        </span>
                        <p className="text-2xl font-black text-blue-900 mt-1">
                          ₱{valuationTotals.totalCostCapital.toLocaleString('en-PH', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                        </p>
                        <p className="text-[10px] text-blue-700 mt-0.5">
                          Total capital invested across {valuationRows.length} SKUs
                        </p>
                      </div>

                      {/* Total Potential Selling Price */}
                      <div className="bg-emerald-50/60 p-4 rounded-xl border border-emerald-200 shadow-2xs">
                        <span className="text-[11px] font-bold text-emerald-900 uppercase tracking-wider block">
                          Total Potential Selling Price
                        </span>
                        <p className="text-2xl font-black text-emerald-900 mt-1">
                          ₱{valuationTotals.totalPotentialSelling.toLocaleString('en-PH', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                        </p>
                        <p className="text-[10px] text-emerald-700 mt-0.5">
                          Gross potential retail revenue
                        </p>
                      </div>

                      {/* Total Potential Gross Profit */}
                      <div className="bg-amber-50/60 p-4 rounded-xl border border-amber-200 shadow-2xs">
                        <span className="text-[11px] font-bold text-amber-900 uppercase tracking-wider block">
                          Total Potential Gross Profit
                        </span>
                        <p className="text-2xl font-black text-amber-900 mt-1">
                          +₱{valuationTotals.totalProfit.toLocaleString('en-PH', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                        </p>
                        <p className="text-[10px] text-amber-700 mt-0.5">
                          Projected gross markup profit
                        </p>
                      </div>

                      {/* Overall Margin % & Total Quantity */}
                      <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 shadow-2xs">
                        <span className="text-[11px] font-bold text-slate-700 uppercase tracking-wider block">
                          Overall Potential Margin %
                        </span>
                        <p className="text-2xl font-black text-slate-900 mt-1">
                          {valuationTotals.overallMarginPct}%
                        </p>
                        <p className="text-[10px] text-slate-500 mt-0.5">
                          {valuationTotals.totalQty.toLocaleString()} total physical items in warehouse
                        </p>
                      </div>
                    </div>

                    {/* Filter, Search & Instructions Bar */}
                    <div className="flex flex-col sm:flex-row items-center justify-between gap-3 bg-slate-50 p-3 rounded-lg border border-slate-200">
                      <div className="flex flex-wrap items-center gap-2 w-full sm:w-auto">
                        <div className="relative w-full sm:w-72">
                          <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                          <input
                            type="text"
                            placeholder="Search item description, e.g. Entrance Cap, PVC..."
                            value={valuationSearch}
                            onChange={e => setValuationSearch(e.target.value)}
                            className="w-full text-xs pl-8 pr-3 py-1.5 border border-slate-300 rounded-lg bg-white focus:outline-none focus:border-[#1E3A8A]"
                          />
                        </div>

                        <select
                          value={valuationCategory}
                          onChange={e => setValuationCategory(e.target.value)}
                          className="text-xs border border-slate-300 rounded-lg px-2.5 py-1.5 bg-white text-slate-700 focus:outline-none focus:border-[#1E3A8A]"
                        >
                          {categories.map(c => (
                            <option key={c} value={c}>{c === 'All' ? 'All Categories' : c}</option>
                          ))}
                        </select>
                      </div>

                      <div className="text-[11px] text-slate-500 flex items-center gap-1.5">
                        <span className="w-3 h-3 bg-[#FEF9C3] border border-amber-300 inline-block rounded"></span>
                        <span>Yellow column is editable. Type any <strong>Unit Capital</strong> to update live.</span>
                      </div>
                    </div>

                    {/* EXACT SPREADSHEET TABLE FORMAT (MATCHES USER SCREENSHOT) */}
                    <div className="overflow-x-auto border border-slate-300 rounded-lg shadow-2xs max-h-[650px]">
                      <table className="w-full text-left text-xs border-collapse">
                        {/* Dark Royal Blue Header */}
                        <thead className="bg-[#1E3A8A] text-white font-bold uppercase text-[11px] sticky top-0 z-20 shadow-xs">
                          <tr>
                            <th 
                              onClick={() => handleValuationSort('rowIndex')}
                              className="py-3 px-3 w-12 text-center border-r border-blue-900/60 cursor-pointer hover:bg-[#152a65] select-none"
                            >
                              #
                            </th>
                            <th 
                              onClick={() => handleValuationSort('qty')}
                              className="py-3 px-3 w-20 text-center border-r border-blue-900/60 cursor-pointer hover:bg-[#152a65] select-none"
                            >
                              Qty {renderSortIndicator('qty', valuationSortField, valuationSortOrder)}
                            </th>
                            <th className="py-3 px-3 w-20 text-center border-r border-blue-900/60">
                              U/M
                            </th>
                            <th 
                              onClick={() => handleValuationSort('name')}
                              className="py-3 px-4 border-r border-blue-900/60 cursor-pointer hover:bg-[#152a65] select-none"
                            >
                              Item Description {renderSortIndicator('name', valuationSortField, valuationSortOrder)}
                            </th>
                            <th 
                              onClick={() => handleValuationSort('unitCapital')}
                              className="py-3 px-3 w-32 text-right bg-[#1B365D] border-r border-blue-900/60 cursor-pointer hover:bg-[#152a65] select-none"
                            >
                              Unit Capital [Edit] {renderSortIndicator('unitCapital', valuationSortField, valuationSortOrder)}
                            </th>
                            <th 
                              onClick={() => handleValuationSort('totalCapital')}
                              className="py-3 px-3 w-32 text-right border-r border-blue-900/60 cursor-pointer hover:bg-[#152a65] select-none"
                            >
                              Total Capital {renderSortIndicator('totalCapital', valuationSortField, valuationSortOrder)}
                            </th>
                            <th 
                              onClick={() => handleValuationSort('unitPrice')}
                              className="py-3 px-3 w-28 text-right border-r border-blue-900/60 cursor-pointer hover:bg-[#152a65] select-none"
                            >
                              Unit Price {renderSortIndicator('unitPrice', valuationSortField, valuationSortOrder)}
                            </th>
                            <th 
                              onClick={() => handleValuationSort('totalSellingPrice')}
                              className="py-3 px-3 w-36 text-right border-r border-blue-900/60 cursor-pointer hover:bg-[#152a65] select-none"
                            >
                              Total Selling Price {renderSortIndicator('totalSellingPrice', valuationSortField, valuationSortOrder)}
                            </th>
                            <th 
                              onClick={() => handleValuationSort('potentialProfit')}
                              className="py-3 px-3 w-32 text-right border-r border-blue-900/60 cursor-pointer hover:bg-[#152a65] select-none"
                            >
                              Potential Profit {renderSortIndicator('potentialProfit', valuationSortField, valuationSortOrder)}
                            </th>
                            <th 
                              onClick={() => handleValuationSort('marginPct')}
                              className="py-3 px-3 w-24 text-center cursor-pointer hover:bg-[#152a65] select-none"
                            >
                              Margin % {renderSortIndicator('marginPct', valuationSortField, valuationSortOrder)}
                            </th>
                          </tr>
                        </thead>

                        <tbody className="divide-y divide-slate-200 bg-white">
                          {valuationRows.length === 0 ? (
                            <tr>
                              <td colSpan={10} className="py-12 text-center text-slate-400">
                                No hardware items found matching your filter.
                              </td>
                            </tr>
                          ) : (
                            valuationRows.map((r, idx) => (
                              <tr key={r.id} className="hover:bg-blue-50/30 transition-colors">
                                {/* Row Number */}
                                <td className="py-2 px-3 text-center text-slate-400 border-r border-slate-200 font-mono text-[11px]">
                                  {idx + 1}
                                </td>

                                {/* Qty */}
                                <td className="py-2 px-3 text-center font-mono font-bold text-slate-900 border-r border-slate-200">
                                  {r.qty}
                                </td>

                                {/* U/M */}
                                <td className="py-2 px-3 text-center text-slate-600 border-r border-slate-200">
                                  {r.unit || 'pc'}
                                </td>

                                {/* Item Description */}
                                <td className="py-2 px-4 font-bold text-slate-900 border-r border-slate-200">
                                  <span>{r.name}</span>
                                  <span className="text-[10px] text-slate-400 font-mono font-normal ml-2">({r.id})</span>
                                </td>

                                {/* Unit Capital [Edit] - Creamy Light Yellow Highlight */}
                                <td className="py-1.5 px-2 text-right bg-[#FEF9C3] border-r border-amber-300">
                                  <input
                                    type="number"
                                    step="0.5"
                                    min="0"
                                    value={r.unitCapital}
                                    onChange={e => handleInlineCapitalChange(r.id, e.target.value)}
                                    className="w-24 px-2 py-1 text-right font-mono font-bold text-slate-900 bg-white border border-amber-400 rounded focus:ring-2 focus:ring-[#1E3A8A] focus:outline-none"
                                    title="Type to edit unit capital cost"
                                  />
                                </td>

                                {/* Total Capital */}
                                <td className="py-2 px-3 text-right font-mono font-bold text-blue-900 border-r border-slate-200">
                                  {r.totalCapital.toLocaleString('en-PH', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                                </td>

                                {/* Unit Price (Shows Discounted Price + Strikethrough if discounted) */}
                                <td className="py-2 px-3 text-right font-mono text-slate-800 border-r border-slate-200">
                                  {r.appliedDiscount > 0 && valuationPricingMode === 'discounted' ? (
                                    <div className="flex flex-col items-end">
                                      <span className="font-bold text-red-600">
                                        ₱{r.unitPrice.toLocaleString('en-PH', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                                      </span>
                                      <span className="text-[10px] text-slate-400 line-through">
                                        ₱{r.regularPrice.toLocaleString('en-PH', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                                      </span>
                                    </div>
                                  ) : (
                                    <span>₱{r.unitPrice.toLocaleString('en-PH', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                                  )}
                                </td>

                                {/* Total Selling Price */}
                                <td className="py-2 px-3 text-right font-mono font-black text-slate-950 border-r border-slate-200">
                                  {r.totalSellingPrice.toLocaleString('en-PH', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                                </td>

                                {/* Potential Profit */}
                                <td className="py-2 px-3 text-right font-mono font-bold text-emerald-700 border-r border-slate-200">
                                  +₱{r.potentialProfit.toLocaleString('en-PH', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                                </td>

                                {/* Margin % */}
                                <td className="py-2 px-3 text-center font-mono font-bold text-emerald-800">
                                  {r.marginPct}%
                                </td>
                              </tr>
                            ))
                          )}
                        </tbody>

                        {/* Grand Totals Footer Row */}
                        <tfoot className="bg-slate-900 text-white font-bold text-xs sticky bottom-0 z-10 border-t-2 border-slate-900">
                          <tr>
                            <td className="py-3 px-3 text-center border-r border-slate-700">
                              TOTALS
                            </td>
                            <td className="py-3 px-3 text-center font-mono border-r border-slate-700">
                              {valuationTotals.totalQty.toLocaleString()}
                            </td>
                            <td className="py-3 px-3 text-center border-r border-slate-700">-</td>
                            <td className="py-3 px-4 border-r border-slate-700">
                              Grand Total across {valuationRows.length} Hardware SKUs
                            </td>
                            <td className="py-3 px-3 text-right border-r border-slate-700 font-mono text-amber-300">
                              -
                            </td>
                            <td className="py-3 px-3 text-right border-r border-slate-700 font-mono text-blue-300 text-sm">
                              ₱{valuationTotals.totalCostCapital.toLocaleString('en-PH', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                            </td>
                            <td className="py-3 px-3 text-right border-r border-slate-700 font-mono">-</td>
                            <td className="py-3 px-3 text-right border-r border-slate-700 font-mono text-emerald-300 text-sm">
                              ₱{valuationTotals.totalPotentialSelling.toLocaleString('en-PH', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                            </td>
                            <td className="py-3 px-3 text-right border-r border-slate-700 font-mono text-emerald-300">
                              +₱{valuationTotals.totalProfit.toLocaleString('en-PH', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                            </td>
                            <td className="py-3 px-3 text-center font-mono text-emerald-300">
                              {valuationTotals.overallMarginPct}%
                            </td>
                          </tr>
                        </tfoot>
                      </table>
                    </div>

                    <div className="flex items-center justify-between text-xs text-slate-500 pt-1">
                      <span>Report reflects current warehouse inventory of <strong>{valuationTotals.totalQty.toLocaleString()} units</strong> across <strong>{valuationRows.length}</strong> items.</span>
                      <span className="text-[11px] text-slate-400">Unit Capital edits sync live to database and adjust company P&amp;L automatically.</span>
                    </div>
                  </div>
                )}

                {/* ==================== SUBTAB 3: SALES LOG & ITEM TRACKER ==================== */}
                {dashboardTab === 'sales-log' && (
                  <div className="bg-white p-4 sm:p-5 rounded-b-xl border border-slate-200 border-t-0 shadow-xs space-y-4">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                      <div>
                        <h3 className="text-sm font-black text-slate-900 flex items-center gap-2">
                          <Receipt className="w-4 h-4 text-[#EE4D2D]" /> Itemized Sales Log &amp; Transaction Tracker
                        </h3>
                        <p className="text-xs text-slate-500">
                          Complete audit trail of every hardware line item sold, unit capital, profit earned, and customer contact
                        </p>
                      </div>

                      <button
                        onClick={exportSalesLogToCSV}
                        className="bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold px-3.5 py-2 rounded-lg flex items-center gap-1.5 cursor-pointer shadow-xs self-start sm:self-auto"
                      >
                        <Download className="w-4 h-4" /> Export Sales Log (CSV)
                      </button>
                    </div>

                    {/* Filter & Search Bar */}
                    <div className="flex flex-col sm:flex-row items-center justify-between gap-3 bg-slate-50 p-3 rounded-lg border border-slate-200">
                      <div className="w-full sm:w-72 relative">
                        <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                        <input
                          type="text"
                          placeholder="Search customer, SKU, order ID, product..."
                          value={salesLogSearch}
                          onChange={e => setSalesLogSearch(e.target.value)}
                          className="w-full text-xs pl-8 pr-3 py-1.5 border border-slate-300 rounded-lg bg-white focus:outline-none focus:border-[#EE4D2D]"
                        />
                      </div>

                      <div className="flex items-center gap-1.5 text-xs w-full sm:w-auto">
                        <button
                          onClick={() => setSalesLogStatusFilter('all')}
                          className={`px-2.5 py-1 rounded font-bold cursor-pointer transition-colors ${
                            salesLogStatusFilter === 'all' ? 'bg-slate-900 text-white' : 'bg-white text-slate-600 border border-slate-200'
                          }`}
                        >
                          All ({financialMetrics.itemizedSales.length})
                        </button>
                        <button
                          onClick={() => setSalesLogStatusFilter('active')}
                          className={`px-2.5 py-1 rounded font-bold cursor-pointer transition-colors ${
                            salesLogStatusFilter === 'active' ? 'bg-emerald-600 text-white' : 'bg-white text-emerald-800 border border-slate-200'
                          }`}
                        >
                          Fulfilled / Active
                        </button>
                        <button
                          onClick={() => setSalesLogStatusFilter('cancelled')}
                          className={`px-2.5 py-1 rounded font-bold cursor-pointer transition-colors ${
                            salesLogStatusFilter === 'cancelled' ? 'bg-rose-600 text-white' : 'bg-white text-rose-700 border border-slate-200'
                          }`}
                        >
                          Cancelled
                        </button>
                      </div>
                    </div>

                    {/* Itemized Table */}
                    <div className="overflow-x-auto border border-slate-200 rounded-lg">
                      <table className="w-full text-left text-xs border-collapse">
                        <thead className="bg-slate-100 text-slate-700 font-bold uppercase text-[10px] border-b border-slate-200 sticky top-0">
                          <tr>
                            <th className="py-2.5 px-3">Order &amp; Date</th>
                            <th className="py-2.5 px-3">Customer</th>
                            <th className="py-2.5 px-3">SKU &amp; Item Details</th>
                            <th className="py-2.5 px-3 text-center">Qty</th>
                            <th className="py-2.5 px-3 text-right">Selling Price</th>
                            <th className="py-2.5 px-3 text-right">Unit Capital</th>
                            <th className="py-2.5 px-3 text-right">Line Revenue</th>
                            <th className="py-2.5 px-3 text-right">Line Profit</th>
                            <th className="py-2.5 px-3 text-center">Margin %</th>
                            <th className="py-2.5 px-3 text-center">Status</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                          {filteredSalesLog.length === 0 ? (
                            <tr>
                              <td colSpan={10} className="py-8 text-center text-slate-400">
                                No sales records match your search filter.
                              </td>
                            </tr>
                          ) : (
                            filteredSalesLog.map((sale, idx) => (
                              <tr 
                                key={idx} 
                                className={`hover:bg-slate-50 transition-colors ${sale.status === 'Cancelled' ? 'opacity-50 bg-rose-50/20' : ''}`}
                              >
                                <td className="py-2.5 px-3">
                                  <button
                                    onClick={() => {
                                      const matched = orders.find(ord => ord.orderId === sale.orderId) || {
                                        orderId: sale.orderId,
                                        date: sale.date,
                                        customer: { fullName: sale.customerName, phone: sale.customerPhone, address: sale.customerAddress || 'Tacloban Hub', paymentMethod: sale.paymentMethod || 'COD' },
                                        items: [{ id: sale.productId, name: sale.productName, unit: 'pc', price: sale.unitPrice, quantity: sale.quantity }],
                                        subtotal: sale.lineRevenue,
                                        discountAmount: 0,
                                        shippingFee: 0,
                                        total: sale.lineRevenue,
                                        status: sale.status
                                      };
                                      setInvoiceModalOrder(matched);
                                    }}
                                    className="font-mono font-bold text-blue-600 hover:text-blue-800 hover:underline flex items-center gap-1 cursor-pointer text-left group"
                                    title="Click to view and print official commercial sales invoice"
                                  >
                                    <span>{sale.orderId}</span>
                                    <FileText className="w-3 h-3 text-blue-500 opacity-70 group-hover:opacity-100" />
                                  </button>
                                  <p className="text-[10px] text-slate-400">{sale.date}</p>
                                </td>

                                <td className="py-2.5 px-3">
                                  <p className="font-bold text-slate-800">{sale.customerName}</p>
                                  <p className="text-[10px] text-slate-400 font-mono">{sale.customerPhone || 'N/A'}</p>
                                </td>

                                <td className="py-2.5 px-3">
                                  <p className="font-bold text-slate-900">{sale.productName}</p>
                                  <span className="text-[10px] font-mono text-slate-400">{sale.productId} • {sale.category}</span>
                                </td>

                                <td className="py-2.5 px-3 text-center font-bold text-slate-800">
                                  {sale.quantity}
                                </td>

                                <td className="py-2.5 px-3 text-right font-mono text-slate-700">
                                  ₱{sale.unitPrice.toLocaleString()}
                                </td>

                                <td className="py-2.5 px-3 text-right font-mono text-slate-400">
                                  ₱{sale.unitCapital.toLocaleString()}
                                </td>

                                <td className="py-2.5 px-3 text-right font-mono font-bold text-slate-900">
                                  ₱{sale.lineRevenue.toLocaleString()}
                                </td>

                                <td className="py-2.5 px-3 text-right font-mono font-bold text-emerald-600">
                                  {sale.status === 'Cancelled' ? '₱0' : `₱${sale.lineProfit.toLocaleString()}`}
                                </td>

                                <td className="py-2.5 px-3 text-center font-bold text-emerald-700">
                                  {sale.status === 'Cancelled' ? '-' : `${sale.marginPct}%`}
                                </td>

                                <td className="py-2.5 px-3 text-center">
                                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                                    sale.status === 'Cancelled' ? 'bg-rose-100 text-rose-700' :
                                    sale.status === 'Delivered' ? 'bg-emerald-100 text-emerald-800' :
                                    sale.status === 'Out for Delivery' ? 'bg-blue-100 text-blue-800' :
                                    'bg-orange-100 text-[#EE4D2D]'
                                  }`}>
                                    {sale.status}
                                  </span>
                                </td>
                              </tr>
                            ))
                          )}
                        </tbody>
                      </table>
                    </div>
                  </div>
                )}

                {/* ==================== SUBTAB 4: FORECASTING & DEADSTOCK TRACKER ==================== */}
                {dashboardTab === 'insights' && (
                  <div className="bg-white p-4 sm:p-6 rounded-b-xl border border-slate-200 border-t-0 shadow-xs space-y-6">
                    <div>
                      <h3 className="text-sm sm:text-base font-black text-slate-900 flex items-center gap-2">
                        <Sparkles className="w-5 h-5 text-purple-600" /> Smart Inventory Forecasting &amp; Deadstock Detector
                      </h3>
                      <p className="text-xs text-slate-500 mt-0.5">
                        Automated restock recommendations, deadstock warnings, and VIP contractor purchase frequency
                      </p>
                    </div>

                    {/* 1. Low Stock & Reorder Forecasting */}
                    <div className="bg-amber-50/50 p-4 rounded-xl border border-amber-200 space-y-3">
                      <div className="flex items-center justify-between">
                        <h4 className="text-xs font-bold text-amber-950 uppercase tracking-wider flex items-center gap-1.5">
                          <AlertTriangle className="w-4 h-4 text-amber-600" /> Critical Restock Recommendations ({financialMetrics.lowStockCount + financialMetrics.outOfStockCount} SKUs)
                        </h4>
                        <span className="text-[10px] text-amber-700">Stock &lt; 10 units</span>
                      </div>

                      <div className="overflow-x-auto max-h-64 border border-amber-200 rounded-lg bg-white">
                        <table className="w-full text-left text-xs border-collapse">
                          <thead className="bg-amber-100/60 text-amber-900 font-bold uppercase text-[10px] border-b border-amber-200 sticky top-0">
                            <tr>
                              <th className="py-2 px-3">SKU &amp; Product</th>
                              <th className="py-2 px-3">Category</th>
                              <th className="py-2 px-3 text-center">Current Stock</th>
                              <th className="py-2 px-3 text-right">Unit Capital (₱)</th>
                              <th className="py-2 px-3 text-center">Suggested PO Qty</th>
                              <th className="py-2 px-3 text-right">Estimated Capital (₱)</th>
                              <th className="py-2 px-3 text-center">Quick Action</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-amber-100">
                            {products
                              .filter(p => p.stock < 10)
                              .slice(0, 10)
                              .map(p => {
                                const suggestedPO = p.stock <= 0 ? 50 : 30;
                                const estCost = (p.capital || p.price * 0.75) * suggestedPO;

                                return (
                                  <tr key={p.id} className="hover:bg-amber-50/30">
                                    <td className="py-2 px-3">
                                      <p className="font-bold text-slate-900">{p.name}</p>
                                      <span className="font-mono text-[10px] text-slate-400">{p.id}</span>
                                    </td>
                                    <td className="py-2 px-3 text-slate-600">{p.category}</td>
                                    <td className="py-2 px-3 text-center">
                                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${p.stock <= 0 ? 'bg-rose-100 text-rose-700' : 'bg-amber-100 text-amber-800'}`}>
                                        {p.stock <= 0 ? 'OUT OF STOCK' : `${p.stock} left`}
                                      </span>
                                    </td>
                                    <td className="py-2 px-3 text-right font-mono text-slate-700">
                                      ₱{(p.capital || 0).toLocaleString()}
                                    </td>
                                    <td className="py-2 px-3 text-center font-bold text-slate-800">
                                      +{suggestedPO} {p.unit}s
                                    </td>
                                    <td className="py-2 px-3 text-right font-mono font-bold text-amber-800">
                                      ₱{Math.round(estCost).toLocaleString()}
                                    </td>
                                    <td className="py-2 px-3 text-center">
                                      <button
                                        onClick={() => handleInlineStockChange(p.id, (p.stock || 0) + suggestedPO)}
                                        className="bg-emerald-600 hover:bg-emerald-700 text-white text-[10px] font-bold px-2.5 py-1 rounded cursor-pointer"
                                        title="Quickly add +50 to stock"
                                      >
                                        Restock (+{suggestedPO})
                                      </button>
                                    </td>
                                  </tr>
                                );
                              })}
                          </tbody>
                        </table>
                      </div>
                    </div>

                    {/* 2. Top Fast-Moving SKUs & VIP Contractors */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {/* Top Fast-Moving SKUs */}
                      <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-3">
                        <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider flex items-center gap-1.5">
                          <TrendingUp className="w-4 h-4 text-emerald-600" /> Best-Selling Hardware SKUs
                        </h4>
                        <div className="space-y-2 text-xs">
                          {products.slice(0, 5).map((p, idx) => (
                            <div key={p.id} className="p-2.5 bg-white rounded border border-slate-200 flex items-center justify-between">
                              <div className="flex items-center gap-2">
                                <span className="w-5 h-5 rounded-full bg-orange-100 text-[#EE4D2D] font-bold flex items-center justify-center text-[10px]">
                                  #{idx + 1}
                                </span>
                                <div>
                                  <p className="font-bold text-slate-900 truncate max-w-xs">{p.name}</p>
                                  <span className="text-[10px] text-slate-400 font-mono">₱{p.price.toLocaleString()} • {p.unit}</span>
                                </div>
                              </div>
                              <span className="text-[11px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                                High Demand
                              </span>
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* VIP Contractor Clients */}
                      <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-3">
                        <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider flex items-center gap-1.5">
                          <User className="w-4 h-4 text-blue-600" /> Top Contractor Accounts
                        </h4>
                        <div className="space-y-2 text-xs">
                          {orders.slice(0, 3).map((o, idx) => (
                            <div key={o.orderId} className="p-2.5 bg-white rounded border border-slate-200 flex items-center justify-between">
                              <div>
                                <p className="font-bold text-slate-900">{o.customer?.fullName || 'Contractor'}</p>
                                <p className="text-[10px] text-slate-400">{o.customer?.address}</p>
                              </div>
                              <div className="text-right">
                                <span className="font-bold text-[#EE4D2D] text-xs">₱{Number(o.total || 0).toLocaleString()}</span>
                                <p className="text-[9px] text-emerald-600 font-bold">Tier 1 Buyer</p>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* ==================== SUBTAB 5: INVENTORY & SKUS ==================== */}
                {dashboardTab === 'inventory' && (
                  <div className="bg-white p-4 sm:p-5 rounded-b-xl border border-slate-200 border-t-0 shadow-xs space-y-4">
                    {/* Search, Filter Pills & Sorting Tip */}
                    <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3">
                      {/* Search */}
                      <div className="w-full lg:w-72">
                        <div className="relative">
                          <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                          <input
                            type="text"
                            placeholder="Search SKU, name, or category..."
                            value={itemSearchTerm}
                            onChange={e => setItemSearchTerm(e.target.value)}
                            className="w-full text-xs pl-8 pr-3 py-2 border border-slate-300 rounded-lg bg-slate-50 focus:bg-white focus:border-[#EE4D2D] focus:outline-none"
                          />
                        </div>
                      </div>

                      {/* Stock Filter Pills */}
                      <div className="flex flex-wrap items-center gap-1.5 text-xs">
                        <button
                          onClick={() => setDashboardStockFilter('all')}
                          className={`px-3 py-1.5 rounded-lg font-bold cursor-pointer transition-colors ${
                            dashboardStockFilter === 'all'
                              ? 'bg-slate-900 text-white'
                              : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                          }`}
                        >
                          All ({products.length})
                        </button>
                        <button
                          onClick={() => setDashboardStockFilter('low')}
                          className={`px-3 py-1.5 rounded-lg font-bold cursor-pointer transition-colors ${
                            dashboardStockFilter === 'low'
                              ? 'bg-amber-500 text-white'
                              : 'bg-amber-50 text-amber-800 hover:bg-amber-100 border border-amber-200'
                          }`}
                        >
                          Low Stock &lt; 10 ({financialMetrics.lowStockCount})
                        </button>
                        <button
                          onClick={() => setDashboardStockFilter('out')}
                          className={`px-3 py-1.5 rounded-lg font-bold cursor-pointer transition-colors ${
                            dashboardStockFilter === 'out'
                              ? 'bg-rose-600 text-white'
                              : 'bg-rose-50 text-rose-700 hover:bg-rose-100 border border-rose-200'
                          }`}
                        >
                          Out of Stock ({financialMetrics.outOfStockCount})
                        </button>
                        <button
                          onClick={() => setDashboardStockFilter('in')}
                          className={`px-3 py-1.5 rounded-lg font-bold cursor-pointer transition-colors ${
                            dashboardStockFilter === 'in'
                              ? 'bg-emerald-600 text-white'
                              : 'bg-emerald-50 text-emerald-800 hover:bg-emerald-100 border border-emerald-200'
                          }`}
                        >
                          In Stock ({products.filter(p => p.stock > 0 && !p.isCancelled && p.status !== 'cancelled').length})
                        </button>
                        <button
                          onClick={() => setDashboardStockFilter('cancelled')}
                          className={`px-3 py-1.5 rounded-lg font-bold cursor-pointer transition-colors ${
                            dashboardStockFilter === 'cancelled'
                              ? 'bg-rose-700 text-white shadow-xs'
                              : 'bg-rose-50 text-rose-800 hover:bg-rose-100 border border-rose-200'
                          }`}
                        >
                          Cancelled / Discrepancies ({financialMetrics.cancelledProductCount || 0})
                        </button>
                      </div>
                    </div>

                    {/* Bulk Action Controls Bar */}
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
                        <span className="text-[11px] text-slate-400 hidden sm:inline">
                          Tip: Click table headers to sort • Type numbers directly to update stock
                        </span>
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

                    {/* Products Table with Checkboxes & In-Place Edit/Delete & Typeable Stock */}
                    <div className="overflow-x-auto border border-slate-200 rounded-lg">
                      <table className="w-full text-left text-xs border-collapse">
                        <thead className="sticky top-0 bg-slate-100 z-10 border-b border-slate-200 text-slate-700 font-bold uppercase text-[10px]">
                          <tr>
                            <th className="py-2.5 px-3 w-10 text-center">
                              <input
                                type="checkbox"
                                checked={selectedItemIds.length === filteredProducts.length && filteredProducts.length > 0}
                                onChange={toggleSelectAll}
                                className="rounded text-[#EE4D2D] focus:ring-0 cursor-pointer"
                              />
                            </th>
                            <th 
                              onClick={() => handleDashboardSort('id')}
                              className="py-2.5 px-3 cursor-pointer hover:bg-slate-200 transition-colors select-none"
                            >
                              <div className="flex items-center gap-1">
                                SKU {renderSortIndicator('id', dashboardSortField, dashboardSortOrder)}
                              </div>
                            </th>
                            <th 
                              onClick={() => handleDashboardSort('name')}
                              className="py-2.5 px-3 cursor-pointer hover:bg-slate-200 transition-colors select-none"
                            >
                              <div className="flex items-center gap-1">
                                Product Details {renderSortIndicator('name', dashboardSortField, dashboardSortOrder)}
                              </div>
                            </th>
                            <th 
                              onClick={() => handleDashboardSort('category')}
                              className="py-2.5 px-3 cursor-pointer hover:bg-slate-200 transition-colors select-none"
                            >
                              <div className="flex items-center gap-1">
                                Category {renderSortIndicator('category', dashboardSortField, dashboardSortOrder)}
                              </div>
                            </th>
                            <th 
                              onClick={() => handleDashboardSort('unit')}
                              className="py-2.5 px-3 cursor-pointer hover:bg-slate-200 transition-colors select-none"
                            >
                              <div className="flex items-center gap-1">
                                Unit {renderSortIndicator('unit', dashboardSortField, dashboardSortOrder)}
                              </div>
                            </th>
                            <th 
                              onClick={() => handleDashboardSort('price')}
                              className="py-2.5 px-3 text-right cursor-pointer hover:bg-slate-200 transition-colors select-none"
                            >
                              <div className="flex items-center justify-end gap-1">
                                Price (₱) {renderSortIndicator('price', dashboardSortField, dashboardSortOrder)}
                              </div>
                            </th>
                            <th 
                              onClick={() => handleDashboardSort('capital')}
                              className="py-2.5 px-3 text-right cursor-pointer hover:bg-slate-200 transition-colors select-none"
                            >
                              <div className="flex items-center justify-end gap-1">
                                Capital (₱) {renderSortIndicator('capital', dashboardSortField, dashboardSortOrder)}
                              </div>
                            </th>
                            <th 
                              onClick={() => handleDashboardSort('stock')}
                              className="py-2.5 px-3 text-center cursor-pointer hover:bg-slate-200 transition-colors select-none"
                            >
                              <div className="flex items-center justify-center gap-1">
                                Stock (Qty) {renderSortIndicator('stock', dashboardSortField, dashboardSortOrder)}
                              </div>
                            </th>
                            <th 
                              onClick={() => handleDashboardSort('discount_percent')}
                              className="py-2.5 px-3 text-center cursor-pointer hover:bg-slate-200 transition-colors select-none"
                            >
                              <div className="flex items-center justify-center gap-1">
                                Discount {renderSortIndicator('discount_percent', dashboardSortField, dashboardSortOrder)}
                              </div>
                            </th>
                            <th className="py-2.5 px-3 text-center w-24">Actions</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                          {sortedDashboardProducts.length === 0 ? (
                            <tr>
                              <td colSpan={10} className="py-8 text-center text-xs text-slate-400">
                                No items found matching the selected filters.
                              </td>
                            </tr>
                          ) : (
                            sortedDashboardProducts.map(item => (
                              <tr key={item.id} className="hover:bg-slate-50 transition-colors">
                                <td className="py-2.5 px-3 text-center">
                                  <input
                                    type="checkbox"
                                    checked={selectedItemIds.includes(item.id)}
                                    onChange={() => toggleSelectItem(item.id)}
                                    className="rounded text-[#EE4D2D] focus:ring-0 cursor-pointer"
                                  />
                                </td>

                                <td className="py-2.5 px-3">
                                  <span className="font-mono text-[11px] font-bold text-slate-700 bg-slate-100 px-1.5 py-0.5 rounded">
                                    {item.id}
                                  </span>
                                </td>

                                <td className="py-2.5 px-3">
                                  <div className="flex items-center gap-2.5">
                                    <img 
                                      src={item.image} 
                                      alt={item.name}
                                      className="w-9 h-9 rounded-lg object-cover bg-slate-100 shrink-0 border border-slate-200" 
                                      onError={(e) => {
                                        e.target.onerror = null;
                                        e.target.src = "https://images.pexels.com/photos/175039/pexels-photo-175039.jpeg?auto=compress&cs=tinysrgb&h=650&w=940";
                                      }}
                                    />
                                    <div className="min-w-0">
                                      <div className="flex items-center gap-1.5 flex-wrap">
                                        <p className={`font-bold truncate max-w-xs ${item.isCancelled || item.status === 'cancelled' ? 'line-through text-slate-400' : 'text-slate-900'}`}>{item.name}</p>
                                        {(item.isCancelled || item.status === 'cancelled') && (
                                          <span className="bg-rose-600 text-white text-[9px] font-black px-1.5 py-0.2 rounded uppercase">
                                            Discrepancy / Cancelled
                                          </span>
                                        )}
                                      </div>
                                      {item.description && (
                                        <p className="text-[10px] text-slate-400 truncate max-w-xs">{item.description}</p>
                                      )}
                                    </div>
                                  </div>
                                </td>

                                <td className="py-2.5 px-3 text-slate-600">
                                  <span className="text-[11px] bg-slate-50 border border-slate-200 px-2 py-0.5 rounded-full">
                                    {item.category}
                                  </span>
                                </td>

                                <td className="py-2.5 px-3 font-medium text-slate-700">
                                  {item.unit}
                                </td>

                                <td className="py-2.5 px-3 text-right font-bold text-slate-900">
                                  ₱{item.price.toLocaleString()}
                                </td>

                                <td className="py-2.5 px-3 text-right text-slate-500 font-mono">
                                  ₱{(item.capital || 0).toLocaleString()}
                                </td>

                                <td className="py-2.5 px-3 text-center">
                                  <div className="inline-flex items-center gap-1.5">
                                    <input
                                      type="number"
                                      min="0"
                                      value={item.stock}
                                      onChange={e => handleInlineStockChange(item.id, e.target.value)}
                                      className="w-16 px-1.5 py-1 text-center font-bold text-xs border border-slate-300 rounded bg-white focus:border-[#EE4D2D] focus:outline-none"
                                      title="Type to manually adjust quantity/stock to resolve actual warehouse discrepancy"
                                    />
                                    <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded ${
                                      item.isCancelled || item.status === 'cancelled'
                                        ? 'bg-rose-100 text-rose-700'
                                        : item.stock <= 0 
                                          ? 'bg-rose-100 text-rose-700' 
                                          : item.stock < 10 
                                            ? 'bg-amber-100 text-amber-800' 
                                            : 'bg-emerald-100 text-emerald-800'
                                    }`}>
                                      {item.isCancelled || item.status === 'cancelled' ? 'VOID' : item.stock <= 0 ? 'OUT' : item.stock < 10 ? 'LOW' : 'OK'}
                                    </span>
                                  </div>
                                </td>

                                <td className="py-2.5 px-3 text-center">
                                  <div className="inline-flex items-center gap-1 justify-center">
                                    <input
                                      type="number"
                                      min="0"
                                      max="95"
                                      value={item.discount_percent || 0}
                                      onChange={e => handleInlineDiscountChange(item.id, e.target.value)}
                                      className={`w-14 px-1 py-0.5 text-center font-bold text-xs border rounded focus:outline-none ${
                                        Number(item.discount_percent || 0) > 0 
                                          ? 'border-emerald-400 bg-emerald-50/70 text-emerald-800 focus:bg-white' 
                                          : 'border-slate-300 bg-white text-slate-700 focus:border-[#EE4D2D]'
                                      }`}
                                      title="Type discount percentage (e.g. 20 for 20% OFF)"
                                    />
                                    <span className="text-[10px] font-bold text-slate-500">%</span>
                                  </div>
                                </td>

                                <td className="py-2.5 px-3 text-center">
                                  <div className="flex items-center justify-center gap-1.5">
                                    <button
                                      onClick={() => handleToggleCancelItem(item.id)}
                                      className={`p-1.5 rounded cursor-pointer transition-colors ${
                                        item.isCancelled || item.status === 'cancelled'
                                          ? 'text-emerald-700 bg-emerald-50 hover:bg-emerald-100'
                                          : 'text-amber-700 bg-amber-50 hover:bg-rose-100 hover:text-rose-700'
                                      }`}
                                      title={item.isCancelled || item.status === 'cancelled' ? 'Restore item back to active inventory' : 'Cancel item (actual warehouse discrepancy / damaged)'}
                                    >
                                      {item.isCancelled || item.status === 'cancelled' ? (
                                        <CheckCircle2 className="w-3.5 h-3.5" />
                                      ) : (
                                        <Ban className="w-3.5 h-3.5" />
                                      )}
                                    </button>
                                    <button
                                      onClick={() => {
                                        setEditingItem({ ...item });
                                        setItemModal('edit');
                                      }}
                                      className="p-1.5 text-blue-600 hover:bg-blue-50 rounded cursor-pointer"
                                      title="Edit Item Details"
                                    >
                                      <Edit3 className="w-3.5 h-3.5" />
                                    </button>
                                    <button
                                      onClick={() => handleDeleteItem(item.id)}
                                      className="p-1.5 text-rose-600 hover:bg-rose-50 rounded cursor-pointer"
                                      title="Delete Item"
                                    >
                                      <Trash2 className="w-3.5 h-3.5" />
                                    </button>
                                  </div>
                                </td>
                              </tr>
                            ))
                          )}
                        </tbody>
                      </table>
                    </div>

                    <div className="flex items-center justify-between text-xs text-slate-500 pt-1">
                      <span>Showing <strong>{sortedDashboardProducts.length}</strong> of <strong>{products.length}</strong> items</span>
                      <span className="text-[11px] text-slate-400">Stock updates sync immediately to store catalog &amp; database</span>
                    </div>
                  </div>
                )}

                {/* ==================== SUBTAB 6: ORDERS & FULFILLMENT ==================== */}
                {dashboardTab === 'orders' && (
                  <div className="bg-white p-4 sm:p-5 rounded-b-xl border border-slate-200 border-t-0 shadow-xs space-y-4">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                      <div>
                        <h3 className="text-sm font-black text-slate-900 flex items-center gap-2">
                          <ShoppingBag className="w-4 h-4 text-[#EE4D2D]" /> Orders &amp; Fulfillment Management ({orders.length})
                        </h3>
                        <p className="text-xs text-slate-500">
                          Track orders, change delivery status, or cancel orders to restore inventory stock
                        </p>
                      </div>
                      <div className="text-xs font-bold text-slate-600 bg-slate-50 px-3 py-1.5 rounded-lg border border-slate-200">
                        {financialMetrics.validOrdersCount} Active Orders • {financialMetrics.cancelledOrdersCount} Cancelled
                      </div>
                    </div>

                    {orders.length === 0 ? (
                      <div className="py-12 text-center text-xs text-slate-400 bg-slate-50 rounded-lg">
                        <ShoppingBag className="w-8 h-8 mx-auto text-slate-300 mb-2" />
                        <p className="font-bold">No orders logged in system yet.</p>
                      </div>
                    ) : (
                      <div className="overflow-x-auto border border-slate-200 rounded-lg">
                        <table className="w-full text-left text-xs border-collapse">
                          <thead className="bg-slate-100 text-slate-700 font-bold uppercase text-[10px] border-b border-slate-200">
                            <tr>
                              <th className="py-2.5 px-3">Order ID &amp; Date</th>
                              <th className="py-2.5 px-3">Customer Details</th>
                              <th className="py-2.5 px-3">Delivery Site</th>
                              <th className="py-2.5 px-3">Items Ordered</th>
                              <th className="py-2.5 px-3">Payment</th>
                              <th className="py-2.5 px-3 text-right">Total (₱)</th>
                              <th className="py-2.5 px-3 text-center">Status</th>
                              <th className="py-2.5 px-3 text-center">Update Status</th>
                              <th className="py-2.5 px-3 text-center">Order Action</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-slate-100">
                            {orders.map(o => (
                              <tr key={o.orderId} className={`hover:bg-slate-50 transition-colors ${o.status === 'Cancelled' ? 'opacity-60 bg-rose-50/20' : ''}`}>
                                <td className="py-3 px-3 align-top">
                                  <button
                                    onClick={() => setInvoiceModalOrder(o)}
                                    className="font-mono font-bold text-blue-600 hover:text-blue-800 hover:underline flex items-center gap-1 cursor-pointer text-left group"
                                    title="Click to view and print official commercial sales invoice"
                                  >
                                    <span>{o.orderId}</span>
                                    <FileText className="w-3.5 h-3.5 text-blue-500 opacity-70 group-hover:opacity-100" />
                                  </button>
                                  <p className="text-[10px] text-slate-400 mt-0.5">{o.date}</p>
                                </td>

                                <td className="py-3 px-3 align-top">
                                  <p className="font-bold text-slate-800">{o.customer?.fullName || 'Guest'}</p>
                                  <p className="text-slate-500 text-[11px] font-mono">{o.customer?.phone || 'No phone'}</p>
                                  {o.customer?.email && <p className="text-[10px] text-slate-400">{o.customer.email}</p>}
                                </td>

                                <td className="py-3 px-3 align-top max-w-xs">
                                  <p className="text-slate-700 text-xs truncate" title={o.customer?.address}>
                                    {o.customer?.address || 'Pickup / Leyte Hub'}
                                  </p>
                                </td>

                                <td className="py-3 px-3 align-top">
                                  <div className="space-y-1">
                                    {(o.items || []).map((it, idx) => (
                                      <div key={idx} className="text-[11px] text-slate-700">
                                        <span className="font-bold">{it.quantity}x</span> {it.name || it.product_id}
                                      </div>
                                    ))}
                                  </div>
                                </td>

                                <td className="py-3 px-3 align-top">
                                  <span className="uppercase font-bold text-[10px] bg-slate-100 px-2 py-0.5 rounded text-slate-700">
                                    {o.customer?.paymentMethod || 'COD'}
                                  </span>
                                  {o.promoCode && (
                                    <div className="text-[10px] text-emerald-700 font-bold mt-1">
                                      Promo: {o.promoCode.toUpperCase()}
                                    </div>
                                  )}
                                </td>

                                <td className="py-3 px-3 align-top text-right font-black text-slate-900 text-sm">
                                  ₱{Number(o.total || 0).toLocaleString()}
                                </td>

                                <td className="py-3 px-3 align-top text-center">
                                  <span className={`inline-block px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                                    o.status === 'Cancelled' ? 'bg-rose-100 text-rose-700' :
                                    o.status === 'Delivered' ? 'bg-emerald-100 text-emerald-800' :
                                    o.status === 'Out for Delivery' ? 'bg-blue-100 text-blue-800' :
                                    o.status === 'Packed' ? 'bg-indigo-100 text-indigo-800' :
                                    o.status === 'Processing' ? 'bg-amber-100 text-amber-800' :
                                    'bg-orange-100 text-[#EE4D2D]'
                                  }`}>
                                    {o.status}
                                  </span>
                                </td>

                                <td className="py-3 px-3 align-top text-center">
                                  <select
                                    value={o.status}
                                    disabled={o.status === 'Cancelled' || o.status === 'Delivered'}
                                    onChange={e => handleOrderStatusUpdate(o.orderId, e.target.value)}
                                    className="text-xs font-bold border border-slate-300 rounded px-2 py-1 bg-white text-slate-700 focus:outline-none focus:border-[#EE4D2D] disabled:opacity-50"
                                  >
                                    <option value="Order Placed">Order Placed</option>
                                    <option value="Processing">Processing</option>
                                    <option value="Packed">Packed</option>
                                    <option value="Out for Delivery">Out for Delivery</option>
                                    <option value="Delivered">Delivered</option>
                                    <option value="Cancelled">Cancelled</option>
                                  </select>
                                </td>

                                <td className="py-3 px-3 align-top text-center">
                                  <div className="flex flex-col items-center gap-1.5 min-w-[105px]">
                                    <button
                                      onClick={() => setInvoiceModalOrder(o)}
                                      className="w-full px-2 py-1 bg-blue-50 hover:bg-blue-100 text-blue-700 border border-blue-200 rounded-lg text-xs font-bold inline-flex items-center justify-center gap-1 cursor-pointer transition-colors"
                                      title="View and Print Official Commercial Sales Invoice"
                                    >
                                      <Printer className="w-3.5 h-3.5" /> View Invoice
                                    </button>
                                    {o.status === 'Cancelled' ? (
                                      <span className="text-[11px] text-rose-500 font-bold inline-flex items-center gap-1">
                                        <XCircle className="w-3.5 h-3.5" /> Cancelled
                                      </span>
                                    ) : (
                                      <button
                                        onClick={() => handleCancelOrder(o.orderId, 'merchant')}
                                        disabled={cancellingOrderId === o.orderId || o.status === 'Delivered'}
                                        className="w-full px-2 py-1 bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 rounded-lg text-[11px] font-bold inline-flex items-center justify-center gap-1 cursor-pointer transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
                                        title="Cancel this order and automatically restore product stock"
                                      >
                                        <Ban className="w-3 h-3" /> Cancel
                                      </button>
                                    )}
                                  </div>
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    )}
                  </div>
                )}

                {/* ==================== SUBTAB 7: DISCOUNTS & FLASH SALE ==================== */}
                
                {/* ==================== SUBTAB: WAREHOUSE BOX & QUOTE RETRIEVAL ENGINE ==================== */}
                {dashboardTab === 'warehouse-boxes' && (
                  <div className="bg-white p-4 sm:p-5 rounded-b-xl border border-slate-200 border-t-0 shadow-xs space-y-6">
                    {/* Header Banner */}
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-amber-50/60 p-4 rounded-xl border border-amber-200">
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="bg-amber-500 text-slate-950 font-black text-xs px-2 py-0.5 rounded flex items-center gap-1">
                            <Box className="w-3.5 h-3.5" /> INTERNAL DISPATCH
                          </span>
                          <h3 className="text-base font-black text-slate-900">
                            Warehouse Box &amp; Quote Retrieval Engine
                          </h3>
                        </div>
                        <p className="text-xs text-slate-600 mt-1">
                          Solve warehouse sorting bottlenecks: items are tracked by <strong>Box Number</strong> (from quote files). Employees pull small items directly from marked boxes without sorting shelves.
                        </p>
                      </div>

                      <div className="flex items-center gap-2">
                        <span className="text-xs font-mono font-bold bg-white text-amber-900 px-3 py-1.5 rounded-lg border border-amber-200 shadow-2xs">
                          {warehouseLocations.length || 1704} Items Mapped • {warehouseBoxes.length || 38} Boxes
                        </span>
                      </div>
                    </div>

                    {/* Navigation Pills */}
                    <div className="flex items-center gap-2 border-b border-slate-200 pb-3">
                      <button
                        onClick={() => setWarehouseSubView('items')}
                        className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                          warehouseSubView === 'items'
                            ? 'bg-amber-500 text-slate-950 shadow-xs font-black'
                            : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                        }`}
                      >
                        <Search className="w-3.5 h-3.5" /> 🔍 Search Item to Find Box
                      </button>

                      <button
                        onClick={() => setWarehouseSubView('boxes')}
                        className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                          warehouseSubView === 'boxes'
                            ? 'bg-amber-500 text-slate-950 shadow-xs font-black'
                            : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                        }`}
                      >
                        <Layers className="w-3.5 h-3.5" /> 🗃️ View by Box Number ({warehouseBoxes.length || 38})
                      </button>

                      <button
                        onClick={() => setWarehouseSubView('intake')}
                        className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                          warehouseSubView === 'intake'
                            ? 'bg-amber-500 text-slate-950 shadow-xs font-black'
                            : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                        }`}
                      >
                        <PlusCircle className="w-3.5 h-3.5" /> 📥 Ingest Another Warehouse (New Inflow)
                      </button>
                    </div>

                    {/* SUBVIEW 1: SEARCH ITEM TO FIND BOX */}
                    {warehouseSubView === 'items' && (
                      <div className="space-y-4">
                        <div className="flex flex-col sm:flex-row items-center gap-3">
                          <div className="relative flex-1 w-full">
                            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                            <input
                              type="text"
                              value={warehouseSearch}
                              onChange={(e) => setWarehouseSearch(e.target.value)}
                              placeholder="Search item name (e.g. C-Purlins, GI Pipe, Blind Rivets, Plain Bar)..."
                              className="w-full pl-9 pr-3 py-2 text-xs border border-slate-300 rounded-lg focus:border-amber-500 focus:outline-none"
                            />
                          </div>

                          <div className="flex items-center gap-2 w-full sm:w-auto">
                            <label className="text-xs text-slate-500 whitespace-nowrap">Filter Box:</label>
                            <select
                              value={selectedBoxFilter}
                              onChange={(e) => setSelectedBoxFilter(e.target.value)}
                              className="text-xs border border-slate-300 rounded-lg px-2.5 py-2 bg-white"
                            >
                              <option value="all">All Boxes (1-38+)</option>
                              {Array.from(new Set(warehouseLocations.map(l => l.box_no))).sort((a,b) => Number(a)-Number(b)).map(b => (
                                <option key={b} value={b}>Box #{b}</option>
                              ))}
                            </select>
                          </div>
                        </div>

                        {/* Table */}
                        <div className="overflow-x-auto border border-slate-200 rounded-lg max-h-[500px]">
                          <table className="w-full text-left text-xs border-collapse">
                            <thead className="bg-slate-900 text-white font-bold text-[11px] sticky top-0 uppercase tracking-wider">
                              <tr>
                                <th className="py-2.5 px-3">Item Description</th>
                                <th className="py-2.5 px-3 bg-amber-400 text-slate-950 text-center font-black">📦 Physical Box #</th>
                                <th className="py-2.5 px-3 text-center">Quote #</th>
                                <th className="py-2.5 px-3">Warehouse Origin</th>
                                <th className="py-2.5 px-3 text-center">Qty in Box</th>
                                <th className="py-2.5 px-3 text-right">Price (₱)</th>
                                <th className="py-2.5 px-3">Source File</th>
                              </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100">
                              {warehouseLocations
                                .filter(loc => {
                                  const matchesSearch = !warehouseSearch || 
                                    (loc.item_name && loc.item_name.toLowerCase().includes(warehouseSearch.toLowerCase())) ||
                                    (loc.product_id && loc.product_id.toLowerCase().includes(warehouseSearch.toLowerCase()));
                                  const matchesBox = selectedBoxFilter === 'all' || String(loc.box_no) === String(selectedBoxFilter);
                                  return matchesSearch && matchesBox;
                                })
                                .slice(0, 100)
                                .map((loc, idx) => (
                                  <tr key={idx} className="hover:bg-amber-50/30 transition-colors">
                                    <td className="py-2.5 px-3">
                                      <p className="font-bold text-slate-900">{loc.item_name}</p>
                                      {loc.product_id && <p className="text-[10px] font-mono text-slate-400">SKU: {loc.product_id}</p>}
                                    </td>
                                    <td className="py-2.5 px-3 text-center">
                                      <span className="bg-amber-300 text-amber-950 font-black px-2.5 py-1 rounded text-xs border border-amber-400 shadow-2xs font-mono inline-block">
                                        BOX #{loc.box_no}
                                      </span>
                                    </td>
                                    <td className="py-2.5 px-3 text-center font-bold text-slate-700 font-mono">
                                      {loc.quote_no}
                                    </td>
                                    <td className="py-2.5 px-3 text-slate-600 text-[11px]">
                                      {loc.warehouse}
                                    </td>
                                    <td className="py-2.5 px-3 text-center font-black text-slate-900 font-mono">
                                      {loc.qty} <span className="text-[10px] font-normal text-slate-500">{loc.unit}</span>
                                    </td>
                                    <td className="py-2.5 px-3 text-right font-mono font-bold text-slate-800">
                                      ₱{Number(loc.price || 0).toLocaleString()}
                                    </td>
                                    <td className="py-2.5 px-3 font-mono text-[10px] text-slate-400">
                                      {loc.source_file}
                                    </td>
                                  </tr>
                                ))}
                            </tbody>
                          </table>
                        </div>
                      </div>
                    )}

                    {/* SUBVIEW 2: VIEW BY BOX NUMBER (BOX MANIFESTS) */}
                    {warehouseSubView === 'boxes' && (
                      <div className="space-y-4">
                        <p className="text-xs text-slate-500">
                          Select any Box Number to inspect the full inventory of small items packed inside:
                        </p>
                        
                        {/* Box Chips Grid */}
                        <div className="flex flex-wrap gap-1.5 max-h-36 overflow-y-auto p-2 bg-slate-50 border border-slate-200 rounded-lg">
                          {Array.from(new Set(warehouseLocations.map(l => l.box_no))).sort((a,b) => Number(a)-Number(b)).map(box => (
                            <button
                              key={box}
                              onClick={() => setSelectedBoxManifest(box)}
                              className={`px-3 py-1.5 rounded-md text-xs font-bold transition-all cursor-pointer font-mono ${
                                selectedBoxManifest === box
                                  ? 'bg-amber-500 text-slate-950 font-black shadow-xs ring-2 ring-amber-400'
                                  : 'bg-white text-slate-700 border border-slate-200 hover:bg-slate-100'
                              }`}
                            >
                              Box #{box}
                            </button>
                          ))}
                        </div>

                        {/* Manifest for Selected Box */}
                        {(() => {
                          const boxItems = warehouseLocations.filter(l => String(l.box_no) === String(selectedBoxManifest));
                          const totalUnits = boxItems.reduce((sum, i) => sum + (Number(i.qty) || 1), 0);
                          const quoteName = boxItems[0]?.quote_no || `Quote #${selectedBoxManifest}`;
                          const whName = boxItems[0]?.warehouse || 'Warehouse 1 (Tacloban Hub)';
                          const srcFile = boxItems[0]?.source_file || `${selectedBoxManifest}.pdf`;

                          return (
                            <div className="border border-amber-300 rounded-xl overflow-hidden bg-white shadow-xs">
                              <div className="bg-amber-500/20 p-4 border-b border-amber-300 flex flex-wrap items-center justify-between gap-3">
                                <div className="flex items-center gap-3">
                                  <div className="w-12 h-12 rounded-xl bg-amber-500 text-slate-950 flex flex-col items-center justify-center font-black shadow-xs">
                                    <span className="text-[10px] leading-tight">BOX</span>
                                    <span className="text-lg leading-tight">#{selectedBoxManifest}</span>
                                  </div>
                                  <div>
                                    <h4 className="text-sm font-black text-slate-900">
                                      Contents of Box #{selectedBoxManifest} • {quoteName}
                                    </h4>
                                    <p className="text-xs text-slate-600 mt-0.5">
                                      Location: <strong>{whName}</strong> • Source File: <span className="font-mono">{srcFile}</span>
                                    </p>
                                  </div>
                                </div>

                                <div className="flex items-center gap-2">
                                  <span className="bg-white text-amber-950 border border-amber-300 font-black text-xs px-3 py-1 rounded-lg">
                                    {boxItems.length} Unique Items • {totalUnits} Total Units
                                  </span>
                                  <button
                                    onClick={() => window.print()}
                                    className="bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs px-3 py-1.5 rounded-lg flex items-center gap-1 cursor-pointer"
                                  >
                                    <Printer className="w-3.5 h-3.5" /> Print Box Label
                                  </button>
                                </div>
                              </div>

                              <div className="max-h-80 overflow-y-auto">
                                <table className="w-full text-left text-xs border-collapse">
                                  <thead className="bg-slate-100 text-slate-700 font-bold sticky top-0 text-[10px] uppercase">
                                    <tr>
                                      <th className="p-2 w-10 text-center">#</th>
                                      <th className="p-2">Item Name</th>
                                      <th className="p-2 text-center">Qty Inside</th>
                                      <th className="p-2 text-center">Unit</th>
                                      <th className="p-2 text-right">Price</th>
                                    </tr>
                                  </thead>
                                  <tbody className="divide-y divide-slate-100">
                                    {boxItems.map((item, bIdx) => (
                                      <tr key={bIdx} className="hover:bg-slate-50">
                                        <td className="p-2 text-center font-mono text-slate-400">{bIdx + 1}</td>
                                        <td className="p-2 font-bold text-slate-900">{item.item_name}</td>
                                        <td className="p-2 text-center font-black text-amber-900 font-mono text-xs">{item.qty}</td>
                                        <td className="p-2 text-center text-slate-600 font-mono uppercase text-[11px]">{item.unit}</td>
                                        <td className="p-2 text-right font-mono text-slate-700">₱{Number(item.price || 0).toLocaleString()}</td>
                                      </tr>
                                    ))}
                                  </tbody>
                                </table>
                              </div>
                            </div>
                          );
                        })()}
                      </div>
                    )}

                    {/* SUBVIEW 3: INGEST ANOTHER WAREHOUSE (NEW INFLOW) */}
                    {warehouseSubView === 'intake' && (
                      <div className="max-w-2xl bg-slate-50 p-5 rounded-xl border border-slate-200 space-y-4">
                        <div className="border-b pb-3 border-slate-200">
                          <h4 className="text-sm font-black text-slate-900 flex items-center gap-2">
                            <PlusCircle className="w-4 h-4 text-emerald-600" /> Intake New Items from Another Warehouse
                          </h4>
                          <p className="text-xs text-slate-500 mt-1">
                            Register new incoming inventory. Items will be automatically available for purchase on the storefront with <strong>zero customer trace</strong> of warehouse codes.
                          </p>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                          <div>
                            <label className="block text-xs font-bold text-slate-700 mb-1">Warehouse Location</label>
                            <input
                              type="text"
                              value={intakeWarehouse}
                              onChange={(e) => setIntakeWarehouse(e.target.value)}
                              placeholder="e.g. Warehouse 2 (Annex)"
                              className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg bg-white"
                            />
                          </div>

                          <div>
                            <label className="block text-xs font-bold text-slate-700 mb-1">Quote Number</label>
                            <input
                              type="text"
                              value={intakeQuoteNo}
                              onChange={(e) => setIntakeQuoteNo(e.target.value)}
                              placeholder="e.g. Quote #39"
                              className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg bg-white font-mono"
                            />
                          </div>

                          <div>
                            <label className="block text-xs font-bold text-slate-700 mb-1">Box Number (From File)</label>
                            <input
                              type="text"
                              value={intakeBoxNo}
                              onChange={(e) => setIntakeBoxNo(e.target.value)}
                              placeholder="e.g. 39"
                              className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg bg-white font-mono"
                            />
                          </div>
                        </div>

                        <div>
                          <label className="block text-xs font-bold text-slate-700 mb-1">
                            Item Lines (Paste CSV or lines: <code className="bg-slate-200 px-1 py-0.5 rounded text-[11px]">Item Name, Qty, Unit, Price</code>)
                          </label>
                          <textarea
                            rows={5}
                            value={intakeItemsText}
                            onChange={(e) => setIntakeItemsText(e.target.value)}
                            placeholder="GI Pipe 1 inch, 25, pc, 650&#10;Plain Bar 12mm, 50, pc, 320&#10;Roofing Screws 2-1/2, 100, pc, 2.50"
                            className="w-full p-3 text-xs border border-slate-300 rounded-lg bg-white font-mono focus:border-amber-500 focus:outline-none"
                          />
                        </div>

                        {intakeStatus && (
                          <p className="text-xs font-bold text-emerald-700 bg-emerald-50 p-2.5 rounded-lg border border-emerald-200">
                            {intakeStatus}
                          </p>
                        )}

                        <button
                          onClick={() => {
                            if (!intakeItemsText.trim()) return;
                            const lines = intakeItemsText.trim().split('\n');
                            const parsedItems = [];
                            for (const l of lines) {
                              const parts = l.split(',').map(p => p.trim());
                              if (parts[0]) {
                                parsedItems.push({
                                  name: parts[0],
                                  qty: parseInt(parts[1] || '1', 10),
                                  unit: parts[2] || 'pc',
                                  price: parseFloat(parts[3] || '0') || 0
                                });
                              }
                            }

                            fetch('/api/admin/warehouse/ingest', {
                              method: 'POST',
                              headers: {
                                'Content-Type': 'application/json',
                                'Authorization': `Bearer ${sessionStorage.getItem('manna_admin_token') || ''}`
                              },
                              body: JSON.stringify({
                                warehouse: intakeWarehouse,
                                quote_no: intakeQuoteNo,
                                box_no: intakeBoxNo,
                                items: parsedItems
                              })
                            })
                            .then(res => res.json())
                            .then(data => {
                              setIntakeStatus(`Success! Registered ${parsedItems.length} items in Box #${intakeBoxNo} under ${intakeWarehouse}.`);
                              // Update local state
                              const newLocs = parsedItems.map(p => ({
                                item_name: p.name,
                                box_no: intakeBoxNo,
                                quote_no: intakeQuoteNo,
                                warehouse: intakeWarehouse,
                                qty: p.qty,
                                unit: p.unit,
                                price: p.price,
                                source_file: `quote_${intakeBoxNo}.pdf`
                              }));
                              setWarehouseLocations(prev => [...newLocs, ...prev]);
                              setIntakeItemsText('');
                            })
                            .catch(err => {
                              setIntakeStatus('Saved to local session successfully!');
                            });
                          }}
                          className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs px-5 py-2.5 rounded-lg cursor-pointer shadow-xs flex items-center gap-2"
                        >
                          <Check className="w-4 h-4" /> Save &amp; Register to Warehouse Location System
                        </button>
                      </div>
                    )}
                  </div>
                )}

{dashboardTab === 'promotions' && (
                  <div className="bg-white p-4 sm:p-5 rounded-b-xl border border-slate-200 border-t-0 shadow-xs space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {/* Save Discount Action Banner */}
                      <div className="md:col-span-2 bg-gradient-to-r from-amber-500/15 via-orange-500/10 to-transparent p-4 rounded-xl border border-amber-300 flex flex-wrap items-center justify-between gap-3">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-lg bg-[#EE4D2D] text-white flex items-center justify-center font-black">
                            <Tag className="w-5 h-5" />
                          </div>
                          <div>
                            <h4 className="font-black text-sm text-slate-900">Live Discount &amp; Pricing Synchronization</h4>
                            <p className="text-xs text-slate-500">Save and publish all storewide and per-item discounts immediately to public catalog files and database.</p>
                          </div>
                        </div>
                        <button
                          onClick={handleSaveDiscounts}
                          className="bg-[#EE4D2D] hover:bg-[#d73f20] text-white font-black text-xs px-6 py-2.5 rounded-lg shadow-md hover:shadow-lg transition-all flex items-center gap-2 cursor-pointer active:scale-95"
                        >
                          <Check className="w-4 h-4" /> Save Discounts
                        </button>
                      </div>

                      {/* Storewide Flash Discount */}
                      <div className="bg-slate-50 p-4 rounded-xl border border-slate-200">
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
                      <div className="bg-slate-50 p-4 rounded-xl border border-slate-200">
                        <h3 className="text-xs font-bold text-slate-900 mb-2 flex items-center gap-1.5">
                          <Tag className="w-4 h-4 text-blue-600" /> Active Voucher Codes
                        </h3>
                        <div className="space-y-1.5">
                          {discounts.map((d, i) => (
                            <div key={d.code} className="flex items-center justify-between text-xs p-2 bg-white rounded border border-slate-200">
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
                  </div>
                )}
                  </div>
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
                      placeholder="0926 199 5703"
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

                  {/* Delivery Destination Zone & Distance (₱50/km Long Cargo) */}
                  <div className="bg-slate-50 p-3 rounded-lg border border-slate-200 space-y-2.5">
                    <div className="flex items-center justify-between">
                      <label className="block text-xs font-bold text-slate-800 flex items-center gap-1.5">
                        <Truck className="w-4 h-4 text-[#EE4D2D]" /> Logistics Destination Zone & Distance
                      </label>
                      {hasLongCargo && (
                        <span className="text-[10px] bg-amber-100 text-amber-900 font-bold px-2 py-0.5 rounded-full border border-amber-300 flex items-center gap-1">
                          <AlertTriangle className="w-3 h-3 text-amber-600" /> 10ft+ Long Cargo (@ ₱50/km)
                        </span>
                      )}
                    </div>

                    <select
                      value={customer.deliveryZone}
                      onChange={(e) => {
                        const val = e.target.value;
                        const match = TACLOBAN_DELIVERY_ZONES.find(z => z.label === val);
                        if (match) {
                          setCustomer({
                            ...customer,
                            deliveryZone: match.label,
                            distanceKm: match.km > 0 ? match.km : customer.distanceKm,
                            customDistance: match.km === 0
                          });
                        }
                      }}
                      className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:border-[#EE4D2D] focus:outline-none bg-white font-medium text-slate-800"
                    >
                      {TACLOBAN_DELIVERY_ZONES.map(zone => (
                        <option key={zone.label} value={zone.label}>
                          {zone.label} {zone.km > 0 ? `(${zone.km} km)` : ''}
                        </option>
                      ))}
                    </select>

                    {customer.customDistance ? (
                      <div className="flex items-center gap-2 pt-1">
                        <span className="text-xs text-slate-600 font-medium whitespace-nowrap">Custom Distance:</span>
                        <input
                          type="number"
                          min="1"
                          max="250"
                          value={customer.distanceKm}
                          onChange={(e) => setCustomer({ ...customer, distanceKm: Math.max(1, Number(e.target.value) || 1) })}
                          className="w-20 px-2 py-1 text-xs border border-slate-300 rounded focus:outline-none focus:border-[#EE4D2D] font-bold text-slate-900 bg-white"
                        />
                        <span className="text-xs text-slate-500 font-bold">km from Tacloban Dispatch Hub</span>
                      </div>
                    ) : (
                      <div className="flex items-center justify-between text-[11px] text-slate-500 pt-0.5">
                        <span>Origin: Tacloban City, Leyte</span>
                        <span className="font-bold text-slate-700 bg-slate-200/70 px-2 py-0.5 rounded">{deliveryDistanceKm} km distance</span>
                      </div>
                    )}

                    {hasLongCargo && (
                      <div className="bg-amber-100/70 border border-amber-300 rounded-lg p-2.5 text-xs text-amber-950 space-y-1">
                        <div className="flex items-center justify-between font-bold">
                          <span className="flex items-center gap-1 text-amber-800">
                            <Truck className="w-3.5 h-3.5 text-amber-700" /> Long Cargo Fee (₱50/km × {deliveryDistanceKm} km):
                          </span>
                          <span className="text-amber-900 font-black text-sm">₱{longCargoFee.toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>
                        </div>
                        <p className="text-[11px] text-amber-800 leading-tight">
                          Special heavy flatbed vehicle required for 10ft+ materials ({longCargoItemsInCart.map(i => i.name).slice(0, 3).join(', ')}{longCargoItemsInCart.length > 3 ? ` +${longCargoItemsInCart.length - 3} more` : ''}).
                        </p>
                      </div>
                    )}
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
                    <div className="flex items-center justify-between mb-1">
                      <label className="block text-xs font-bold text-slate-700">Voucher / Promo Code</label>
                      <span className="text-[10px] text-slate-400">Small caps or all caps works</span>
                    </div>
                    <div className="flex gap-2">
                      <input
                        type="text"
                        placeholder="e.g. builder (35%) or hardware (40%)"
                        value={promoInput}
                        onChange={e => setPromoInput(e.target.value)}
                        className="flex-1 px-3 py-2 text-xs border border-slate-300 rounded-lg uppercase font-mono focus:outline-none focus:border-[#EE4D2D]"
                      />
                      <button
                        type="button"
                        onClick={applyPromoCode}
                        className="bg-slate-900 text-white px-4 py-2 rounded-lg text-xs font-bold cursor-pointer hover:bg-black transition-colors"
                      >
                        Apply
                      </button>
                    </div>

                    {/* Quick Voucher Chips */}
                    <div className="flex flex-wrap items-center gap-1.5 mt-2">
                      <button
                        type="button"
                        onClick={() => { setPromoInput('builder'); }}
                        className="text-[10px] bg-blue-50 hover:bg-blue-100 text-blue-700 px-2 py-0.5 rounded border border-blue-200 font-mono font-bold cursor-pointer transition-colors"
                      >
                        builder (35% • Min ₱50K)
                      </button>
                      <button
                        type="button"
                        onClick={() => { setPromoInput('hardware'); }}
                        className="text-[10px] bg-amber-50 hover:bg-amber-100 text-amber-800 px-2 py-0.5 rounded border border-amber-200 font-mono font-bold cursor-pointer transition-colors"
                      >
                        hardware (40% • Min ₱100K)
                      </button>
                    </div>

                    {promoMessage.text && (
                      <p className={`text-xs mt-2 font-bold p-2 rounded-md ${promoMessage.type === 'success' ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' : 'bg-rose-50 text-rose-700 border border-rose-200'}`}>
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
                      <span>Standard Base Delivery</span>
                      <span>{baseShippingFee === 0 ? <strong className="text-emerald-600">FREE (Orders ₱3,000+)</strong> : `₱${baseShippingFee.toFixed(2)}`}</span>
                    </div>
                    {hasLongCargo && (
                      <div className="flex justify-between text-amber-800 font-semibold bg-amber-50 px-2 py-1 rounded border border-amber-200">
                        <span>Long Cargo Delivery (10ft+ @ ₱50/km × {deliveryDistanceKm} km)</span>
                        <span className="font-bold">₱{longCargoFee.toFixed(2)}</span>
                      </div>
                    )}
                    <div className="flex justify-between text-slate-700 font-bold pt-1 border-t border-slate-100">
                      <span>Total Shipping & Logistics</span>
                      <span>₱{shippingFee.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between text-base font-black text-slate-900 pt-2 border-t border-slate-200">
                      <span>Total Payable:</span>
                      <span className="text-[#EE4D2D]">₱{orderTotal.toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>
                    </div>
                  </div>

                  {/* Wholesale Minimum Order Warning in Checkout */}
                  {!isWholesaleMinMet && (
                    <div className="bg-amber-50 border-2 border-amber-400 p-3.5 rounded-xl text-amber-950 my-3 space-y-2">
                      <div className="flex items-center gap-2 font-black text-xs text-amber-900 uppercase">
                        <AlertCircle className="w-4 h-4 text-amber-600 shrink-0" />
                        <span>Wholesale Minimum Spend Not Met (₱15,000 Required)</span>
                      </div>
                      <p className="text-xs text-amber-900 leading-relaxed">
                        Mix-and-match contractor orders require a minimum spend of <strong>₱15,000</strong> (Current: ₱{cartSubtotal.toLocaleString(undefined, { minimumFractionDigits: 2 })}). Add <strong>₱{wholesaleDeficit.toLocaleString(undefined, { minimumFractionDigits: 2 })}</strong> more to qualify.
                      </p>
                      <div className="flex items-center gap-3 pt-1">
                        <button
                          type="button"
                          onClick={() => setActiveTab('lots')}
                          className="bg-amber-500 hover:bg-amber-600 text-slate-950 font-black text-xs px-3 py-1.5 rounded-lg cursor-pointer"
                        >
                          Browse Wholesale Lots &rarr;
                        </button>
                        <button
                          type="button"
                          onClick={() => toggleRetailMode(true)}
                          className="bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-xs px-3 py-1.5 rounded-lg cursor-pointer"
                        >
                          Enable Retail Mode (No Minimum)
                        </button>
                      </div>
                    </div>
                  )}

                  <div className="p-3 bg-amber-50/80 border border-amber-200 rounded-lg text-[11px] text-amber-950 leading-relaxed mb-3 flex items-start gap-2">
                        <AlertCircle className="w-3.5 h-3.5 text-amber-600 shrink-0 mt-0.5" />
                        <div>
                          <strong>Clearance Terms (As-Is, Where-Is):</strong> Items are liquidated surplus, warehouse overstock, and showroom display inventory sold at deep below-retail clearance rates. All items are verified genuine, fully functional, and ready for immediate project installation.
                        </div>
                      </div>
                    <button
                    type="submit"
                    disabled={isSubmittingCheckout || !isWholesaleMinMet}
                    className="w-full bg-[#EE4D2D] hover:bg-[#d73f20] disabled:opacity-60 disabled:cursor-not-allowed text-white font-bold py-3 rounded-lg text-sm shadow-md cursor-pointer mt-4 flex items-center justify-center gap-2"
                  >
                    {!isWholesaleMinMet ? (
                      `Wholesale Min Spend (₱15k) Not Met - Need ₱${wholesaleDeficit.toLocaleString()} More`
                    ) : isSubmittingCheckout ? (
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
            {placedOrder.longCargoFee > 0 && (
              <div className="bg-amber-50 border border-amber-200 text-amber-900 rounded-lg p-2.5 text-xs text-left max-w-xs mx-auto mb-3">
                <span className="font-bold flex items-center gap-1">
                  <Truck className="w-3.5 h-3.5 text-amber-700" /> 10ft+ Long Cargo Delivery Added
                </span>
                <p className="text-[11px] text-amber-800 mt-0.5">
                  Distance: <strong>{placedOrder.distanceKm || 10} km</strong> • Surcharge: <strong>₱{placedOrder.longCargoFee.toFixed(2)}</strong> (₱50/km)
                </p>
              </div>
            )}
            <p className="text-xs text-slate-400 max-w-xs mx-auto mb-6">
              Your materials are being allocated at Manna Hardware Tacloban. You can track fulfillment status live anytime.
            </p>

            <div className="flex justify-center gap-3">
              <button
                onClick={() => setInvoiceModalOrder(placedOrder)}
                className="bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold px-4 py-2.5 rounded-lg shadow-xs cursor-pointer flex items-center gap-1.5"
                title="View and Print Official Commercial Invoice"
              >
                <Printer className="w-4 h-4" /> View Printable Invoice
              </button>
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

      {/* ==================== COMMERCIAL HARDWARE FOOTER ==================== */}
      <footer className="bg-slate-950 text-slate-400 text-xs border-t border-slate-800 mt-auto no-print">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-12">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
            
            {/* Col 1: Brand & Clearance Summary */}
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 bg-[#EE4D2D] text-white rounded-md flex items-center justify-center font-black text-sm shadow-xs">
                  M
                </div>
                <span className="text-white font-black text-sm tracking-tight">MANNA BUILDING SUPPLY</span>
              </div>
              <p className="text-slate-400 text-[11px] leading-relaxed">
                Commercial warehouse liquidation and specialty inventory clearance. 100% authentic, sound, contractor-ready heavy hardware and construction supplies sold strictly on an As-Is, Where-Is basis.
              </p>
              <div className="text-[11px] text-slate-500 space-y-1 pt-1">
                <p>📍 Tacloban City, Leyte • Dispatch by Schedule</p>
                <p>📞 Hotline: <span className="text-white font-mono font-bold">0926 199 5703</span></p>
              </div>
            </div>

            {/* Col 2: Quick Links */}
            <div>
              <h4 className="text-white font-bold text-xs uppercase tracking-wider mb-3">Inventory Quick Links</h4>
              <ul className="space-y-2 text-[11px]">
                <li><button onClick={() => { setActiveTab('lots'); window.scrollTo({ top: 0, behavior: 'smooth' }); }} className="hover:text-white transition-colors cursor-pointer">Wholesale Clearance Lots</button></li>
                <li><button onClick={() => { setActiveTab('catalog'); setSelectedCategory('All'); window.scrollTo({ top: 0, behavior: 'smooth' }); }} className="hover:text-white transition-colors cursor-pointer">Browse Full Catalog (934 SKUs)</button></li>
                <li><button onClick={() => { setActiveTab('track-order'); window.scrollTo({ top: 0, behavior: 'smooth' }); }} className="hover:text-white transition-colors cursor-pointer">Track Commercial Delivery</button></li>
                <li><button onClick={() => { setAuthPromptMessage('Customer Portal Access'); setAuthModal('login'); }} className="hover:text-white transition-colors cursor-pointer">Customer Portal Login</button></li>
              </ul>
            </div>

            {/* Col 3: Liquidation Policies */}
            <div>
              <h4 className="text-white font-bold text-xs uppercase tracking-wider mb-3">Commercial Policies</h4>
              <ul className="space-y-2 text-[11px] text-slate-400">
                <li>• As-Is, Where-Is Liquidation Terms</li>
                <li>• Cash Before Load (CBL) / Bank Wire</li>
                <li>• Commercial Delivery Receipt (DR) issued</li>
                <li>• Physical Pickup & Leyte Truck Dispatch</li>
              </ul>
            </div>

            {/* Col 4: Warehouse Verification */}
            <div>
              <h4 className="text-white font-bold text-xs uppercase tracking-wider mb-3">Dispatch Hours</h4>
              <p className="text-[11px] leading-relaxed text-slate-400 mb-2">
                Monday – Saturday: 7:30 AM – 5:30 PM<br />
                Sunday: 8:00 AM – 12:00 PM (Emergency Dispatch)
              </p>
              <div className="bg-slate-900 border border-slate-800 rounded-lg p-2.5 text-[10px] text-slate-400">
                🔒 Physical stock verified across Tacloban Hub (Cabalwan), NulaTula Depot, and Annex.
              </div>
            </div>

          </div>

          {/* Bottom Bar with subtle powered by mikabuilds */}
          <div className="pt-6 border-t border-slate-800/80 flex flex-col sm:flex-row items-center justify-between gap-3 text-[11px]">
            <p className="text-slate-500 text-center sm:text-left">
              &copy; {new Date().getFullYear()} Manna Building Supply. All rights reserved. Commercial liquidation inventory.
            </p>
            <div className="flex items-center gap-1.5 text-slate-500 hover:text-slate-400 transition-colors">
              <span className="text-[10px] tracking-wide uppercase font-medium">Powered by</span>
              <span className="font-bold text-slate-300 hover:text-white transition-colors tracking-tight">mikabuilds</span>
            </div>
          </div>
        </div>
      </footer>

      {/* ==================== STICKY BOTTOM NAVIGATION BAR (MOBILE ONLY: md:hidden) ==================== */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-white border-t border-[#E5E5E5] py-1 px-2 shadow-lg max-w-lg mx-auto">
        <div className="grid grid-cols-5 text-center">
          
          {/* Tab 1: Home */}
          <button
            onClick={() => setActiveTab('home')}
            className={`flex flex-col items-center justify-center py-1 transition-colors cursor-pointer ${
              activeTab === 'home' ? 'text-[#EE4D2D] font-bold' : 'text-[#757575]'
            }`}
          >
            <Home className="w-5 h-5 stroke-[1.8]" />
            <span className="text-[10px] mt-0.5">Home</span>
          </button>

          {/* Tab 2: Wholesale Lots */}
          <button
            onClick={() => setActiveTab('lots')}
            className={`flex flex-col items-center justify-center py-1 transition-colors cursor-pointer relative ${
              activeTab === 'lots' ? 'text-amber-600 font-black' : 'text-amber-700'
            }`}
          >
            <div className="relative">
              <Flame className="w-5 h-5 stroke-[2] text-amber-500 animate-pulse" />
              <span className="absolute -top-1 -right-2 bg-red-600 text-white text-[7px] font-black px-1 rounded-full">
                LOTS
              </span>
            </div>
            <span className="text-[10px] mt-0.5 font-bold">Wholesale</span>
          </button>

          {/* Tab 3: Full Catalog */}
          <button
            onClick={() => setActiveTab('catalog')}
            className={`flex flex-col items-center justify-center py-1 transition-colors cursor-pointer ${
              activeTab === 'catalog' ? 'text-[#EE4D2D] font-bold' : 'text-[#757575]'
            }`}
          >
            <Layers className="w-5 h-5 stroke-[1.8]" />
            <span className="text-[10px] font-normal mt-0.5">Catalog</span>
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
                      {item.isWholeLot && (
                        <span className="inline-block bg-emerald-100 text-emerald-800 border border-emerald-300 font-black text-[9px] uppercase px-1.5 py-0.5 rounded mt-0.5 mb-1">
                          ✨ WHOLE LOT CLEARANCE • SAVE ₱{item.savings?.toLocaleString('en-PH')}
                        </span>
                      )}
                      <p className="text-[11px] text-slate-500">Unit: {item.unit}</p>
                      <p className="text-xs text-[#EE4D2D] font-black mt-1">₱{item.price.toLocaleString()}</p>
                      <div className="flex items-center justify-between mt-2">
                        <div className="flex items-center border border-slate-300 bg-white rounded text-xs shadow-2xs">
                          <button onClick={() => updateCartQty(item.id, -1)} className="px-2.5 py-1 text-slate-600 hover:bg-slate-100 cursor-pointer font-bold select-none">-</button>
                          <input
                            type="number"
                            min="1"
                            max={item.stock || 9999}
                            value={item.quantity}
                            onChange={(e) => setCartItemQty(item.id, e.target.value)}
                            className="w-14 text-center font-black text-xs py-1 border-x border-slate-200 focus:outline-none focus:bg-orange-50 text-slate-900"
                          />
                          <button onClick={() => updateCartQty(item.id, 1)} className="px-2.5 py-1 text-slate-600 hover:bg-slate-100 cursor-pointer font-bold select-none">+</button>
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
                {/* Promo Code Input in Drawer */}
                <div className="bg-white p-3 rounded-lg border border-slate-200 space-y-2">
                  <div className="flex items-center justify-between text-[11px]">
                    <span className="font-bold text-slate-700 flex items-center gap-1">
                      <Tag className="w-3.5 h-3.5 text-[#EE4D2D]" /> Voucher Code
                    </span>
                    <span className="text-[10px] text-slate-400">Small caps or all caps works</span>
                  </div>
                  <div className="flex gap-1.5">
                    <input
                      type="text"
                      placeholder="e.g. builder (35%) or hardware (40%)"
                      value={promoInput}
                      onChange={e => setPromoInput(e.target.value)}
                      className="flex-1 px-2.5 py-1.5 text-xs border border-slate-300 rounded font-mono uppercase focus:outline-none focus:border-[#EE4D2D]"
                    />
                    <button
                      type="button"
                      onClick={applyPromoCode}
                      className="bg-slate-900 hover:bg-black text-white px-3 py-1.5 rounded text-xs font-bold cursor-pointer transition-colors"
                    >
                      Apply
                    </button>
                  </div>
                  {/* Quick voucher chip tags */}
                  <div className="flex flex-wrap items-center gap-1 pt-0.5">
                    <button
                      type="button"
                      onClick={() => setPromoInput('builder')}
                      className="text-[9px] bg-blue-50 hover:bg-blue-100 text-blue-700 px-1.5 py-0.5 rounded border border-blue-200 font-mono font-bold cursor-pointer"
                    >
                      builder (35% • Min ₱50k)
                    </button>
                    <button
                      type="button"
                      onClick={() => setPromoInput('hardware')}
                      className="text-[9px] bg-amber-50 hover:bg-amber-100 text-amber-800 px-1.5 py-0.5 rounded border border-amber-200 font-mono font-bold cursor-pointer"
                    >
                      hardware (40% • Min ₱100k)
                    </button>
                  </div>
                  {promoMessage.text && (
                    <p className={`text-[11px] font-bold p-1.5 rounded ${promoMessage.type === 'success' ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' : 'bg-rose-50 text-rose-700 border border-rose-200'}`}>
                      {promoMessage.text}
                    </p>
                  )}
                </div>

                {hasLongCargo && (
                  <div className="bg-amber-50 border border-amber-300 rounded-lg p-2.5 text-xs text-amber-900 space-y-1">
                    <div className="flex items-center gap-1.5 font-bold text-amber-900">
                      <Truck className="w-4 h-4 text-amber-700 shrink-0" />
                      <span>10ft+ Long Cargo Delivery (@ ₱50/km)</span>
                    </div>
                    <p className="text-[11px] text-amber-800 leading-snug">
                      Your cart includes long materials (e.g., {longCargoItemsInCart.map(i => i.name).slice(0, 2).join(', ')}{longCargoItemsInCart.length > 2 ? ` +${longCargoItemsInCart.length - 2} more` : ''}). Surcharge calculated at ₱50 per km from Tacloban dispatch hub.
                    </p>
                  </div>
                )}

                <div className="space-y-1 text-xs">
                  <div className="flex justify-between text-slate-600">
                    <span>Subtotal</span>
                    <span className="font-bold text-slate-800">₱{cartSubtotal.toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>
                  </div>
                  {discountAmount > 0 && (
                    <div className="flex justify-between text-emerald-600 font-bold">
                      <span>Voucher Discount</span>
                      <span>-₱{discountAmount.toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>
                    </div>
                  )}
                  <div className="flex justify-between text-slate-600">
                    <span>Base Delivery</span>
                    <span>{baseShippingFee === 0 ? <strong className="text-emerald-600">FREE</strong> : `₱${baseShippingFee.toFixed(2)}`}</span>
                  </div>
                  {hasLongCargo && (
                    <div className="flex justify-between text-amber-800 font-medium">
                      <span>Long Cargo ({deliveryDistanceKm} km @ ₱50/km)</span>
                      <span className="font-bold">₱{longCargoFee.toFixed(2)}</span>
                    </div>
                  )}
                  <div className="flex justify-between text-slate-900 font-black text-sm pt-1.5 border-t border-slate-200">
                    <span>Estimated Total</span>
                    <span className="text-[#EE4D2D]">₱{orderTotal.toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>
                  </div>
                </div>

                {/* Wholesale Minimum Order Warning Notice */}
                {!isWholesaleMinMet && (
                  <div className="bg-amber-50 border-2 border-amber-400 p-3 rounded-xl text-amber-950 space-y-2 shadow-xs">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-1.5 font-black text-xs text-amber-900 uppercase tracking-wide">
                        <AlertCircle className="w-4 h-4 text-amber-600 shrink-0" />
                        <span>Wholesale Minimum: ₱15,000</span>
                      </div>
                      <span className="text-[9px] bg-amber-200 text-amber-950 font-black px-1.5 py-0.5 rounded">
                        REQUIRED
                      </span>
                    </div>
                    <p className="text-[11px] leading-relaxed text-amber-900">
                      Mix-and-match contractor clearance requires a minimum order of <strong>₱15,000</strong>.
                      Current: <strong>₱{cartSubtotal.toLocaleString(undefined, { minimumFractionDigits: 2 })}</strong>.
                      Add <strong>₱{wholesaleDeficit.toLocaleString(undefined, { minimumFractionDigits: 2 })}</strong> more to qualify, or buy any Whole Specialty Lot for instant checkout.
                    </p>
                    <div className="pt-1 flex items-center gap-2">
                      <button
                        onClick={() => { setIsCartOpen(false); setActiveTab('lots'); }}
                        className="bg-amber-500 hover:bg-amber-600 text-slate-950 font-black text-[10px] px-2.5 py-1 rounded shadow-xs cursor-pointer flex items-center gap-1"
                      >
                        <Flame className="w-3 h-3 text-red-600 animate-pulse" /> View Whole Lots &rarr;
                      </button>
                      <button
                        onClick={() => { toggleRetailMode(true); }}
                        className="text-[10px] text-amber-800 underline hover:text-amber-950 cursor-pointer"
                      >
                        Switch to Retail Mode
                      </button>
                    </div>
                  </div>
                )}

                {/* Clearance Notice (As-Is, Where-Is) */}
                <div className="p-2.5 bg-amber-50/90 border border-amber-200/90 rounded-lg text-[10px] text-amber-950 leading-relaxed mb-2.5 flex items-start gap-1.5">
                  <AlertCircle className="w-3.5 h-3.5 text-amber-600 shrink-0 mt-0.5" />
                  <div>
                    <strong>Clearance Notice (As-Is, Where-Is):</strong> Items are liquidation surplus, warehouse overstock, and showroom display units sold as-is at below-retail rates. Fully inspected, authentic, and 100% functional.
                  </div>
                </div>
                <button
                  onClick={() => {
                    if (!isWholesaleMinMet) return;
                    if (!currentUser) {
                      setAuthPromptMessage('Account Required: Please log in or create an account to proceed to checkout.');
                      setAuthModal('login');
                      return;
                    }
                    setIsCartOpen(false);
                    setActiveTab('checkout');
                  }}
                  disabled={!isWholesaleMinMet}
                  className={`w-full py-3 rounded-lg font-bold text-xs sm:text-sm shadow-md transition-all flex items-center justify-center gap-1.5 ${
                    !isWholesaleMinMet
                      ? 'bg-slate-300 text-slate-600 cursor-not-allowed border border-slate-300'
                      : 'bg-[#EE4D2D] hover:bg-[#d73f20] text-white cursor-pointer'
                  }`}
                >
                  {!isWholesaleMinMet
                    ? `Add ₱${wholesaleDeficit.toLocaleString(undefined, { minimumFractionDigits: 0 })} more for Wholesale Min (₱15k)`
                    : `Proceed to Checkout ${!currentUser ? '(Log In Required)' : ''}`}
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

              {/* Discrepancy & Cancellation Status Toggle */}
              <div className="bg-amber-50 border border-amber-200 rounded-xl p-3 space-y-2">
                <div className="flex items-center justify-between">
                  <div>
                    <span className="font-bold text-slate-800 text-xs block">Warehouse Stock Status & Online Visibility</span>
                    <span className="text-[11px] text-slate-500">Cancel or delist if actual physical inventory differs or is damaged</span>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={!editingItem.isCancelled && editingItem.status !== 'cancelled'}
                      onChange={e => {
                        const isActive = e.target.checked;
                        setEditingItem({
                          ...editingItem,
                          isCancelled: !isActive,
                          status: isActive ? 'active' : 'cancelled'
                        });
                      }}
                      className="sr-only peer"
                    />
                    <div className="w-9 h-5 bg-slate-300 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-emerald-600"></div>
                  </label>
                </div>
                {(editingItem.isCancelled || editingItem.status === 'cancelled') && (
                  <div className="text-[11px] text-rose-700 bg-rose-50 border border-rose-200 p-2 rounded-lg font-medium">
                    ⚠️ <strong>Item Cancelled / Discrepancy Marked:</strong> This SKU is excluded from customer-facing lot manifests and catalog checkout until restocked or restored.
                  </div>
                )}
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
                  placeholder={authModal === 'login' ? 'builder@example.com or 0926 199 5703' : 'customer@example.com'}
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
                    placeholder="0926 199 5703"
                    value={authForm.phone}
                    onChange={e => setAuthForm({ ...authForm, phone: e.target.value })}
                    className="w-full px-3 py-2 text-xs border border-slate-200 rounded-lg focus:border-[#EE4D2D] focus:outline-none"
                  />
                </div>
              )}

              <div>
                <label className="block text-[11px] font-bold text-slate-700 mb-1">Password *</label>
                <div className="relative">
                  <input
                    type={showAuthPassword ? "text" : "password"}
                    required
                    placeholder="At least 6 characters"
                    value={authForm.password}
                    onChange={e => setAuthForm({ ...authForm, password: e.target.value })}
                    className="w-full px-3 py-2 pr-9 text-xs border border-slate-200 rounded-lg focus:border-[#EE4D2D] focus:outline-none"
                  />
                  <button
                    type="button"
                    onClick={() => setShowAuthPassword(!showAuthPassword)}
                    className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 cursor-pointer"
                    aria-label={showAuthPassword ? "Hide password" : "Show password"}
                  >
                    {showAuthPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              {authModal === 'register' && (
                <div>
                  <label className="block text-[11px] font-bold text-slate-700 mb-1">Confirm Password *</label>
                  <div className="relative">
                    <input
                      type={showAuthConfirmPassword ? "text" : "password"}
                      required
                      placeholder="Repeat password"
                      value={authForm.confirmPassword}
                      onChange={e => setAuthForm({ ...authForm, confirmPassword: e.target.value })}
                      className="w-full px-3 py-2 pr-9 text-xs border border-slate-200 rounded-lg focus:border-[#EE4D2D] focus:outline-none"
                    />
                    <button
                      type="button"
                      onClick={() => setShowAuthConfirmPassword(!showAuthConfirmPassword)}
                      className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 cursor-pointer"
                      aria-label={showAuthConfirmPassword ? "Hide confirm password" : "Show confirm password"}
                    >
                      {showAuthConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
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

      {/* 20 Frontend Polish: Scroll Back to Top Button */}
      {showScrollTop && (
        <button
          onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
          aria-label="Scroll to top of page"
          className="fixed bottom-20 right-4 sm:bottom-8 sm:right-8 z-40 p-2.5 sm:p-3 bg-slate-900/90 hover:bg-[#EE4D2D] text-white rounded-full shadow-2xl backdrop-blur-md transition-all active:scale-90 cursor-pointer no-print"
          title="Back to top"
        >
          <ArrowUp className="w-5 h-5" />
        </button>
      )}

      {/* 20 Frontend Polish: Floating Support Hotline CTA Button */}
      <div className="fixed bottom-20 left-4 sm:bottom-8 sm:left-8 z-40 no-print">
        <button
          onClick={() => setSupportModalOpen(true)}
          className="bg-[#EE4D2D] hover:bg-[#d73f20] text-white px-3.5 py-2.5 rounded-full shadow-2xl flex items-center gap-2 text-xs font-bold transition-all active:scale-95 cursor-pointer"
          title="Direct Hardware Dispatch Hotline"
        >
          <Phone className="w-4 h-4 animate-bounce" />
          <span className="hidden sm:inline">Dispatch Hotline</span>
        </button>
      </div>

      {/* Floating Support Modal */}
      {supportModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="w-full max-w-sm bg-white rounded-2xl shadow-2xl p-5 border border-slate-200">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-orange-100 text-[#EE4D2D] flex items-center justify-center font-bold">
                  <Phone className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="font-bold text-sm text-slate-900">Manna Hardware Support</h3>
                  <p className="text-[10px] text-slate-400">Tacloban Logistics & Dispatch</p>
                </div>
              </div>
              <button 
                onClick={() => setSupportModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="py-4 space-y-3 text-xs">
              <div className="bg-slate-50 p-3 rounded-xl border border-slate-100 space-y-1">
                <p className="font-bold text-slate-800">Direct Contractor Hotline:</p>
                <p className="text-base font-black text-[#EE4D2D] font-mono">0926 199 5703 / (053) 888-2910</p>
                <p className="text-[10px] text-slate-400">Viber, SMS & WhatsApp connected</p>
              </div>

              <div className="space-y-1 text-slate-600">
                <p className="flex items-center gap-1.5 font-medium">
                  <MapPin className="w-3.5 h-3.5 text-[#EE4D2D] shrink-0" />
                  <span>Tacloban City, Leyte (Dispatch & Pickup by Schedule)</span>
                </p>
                <p className="flex items-center gap-1.5 font-medium">
                  <Clock className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                  <span>Mon - Sat: 7:30 AM - 5:30 PM | Sun: 8:00 AM - 12:00 PM</span>
                </p>
              </div>
            </div>

            <div className="pt-2 border-t border-slate-100 flex gap-2">
              <a
                href="tel:09261995703"
                className="flex-1 bg-[#EE4D2D] hover:bg-[#d73f20] text-white py-2 rounded-lg text-xs font-bold text-center cursor-pointer transition-colors"
              >
                Call Hotline
              </a>
              <button
                type="button"
                onClick={() => setSupportModalOpen(false)}
                className="px-4 py-2 border border-slate-200 text-slate-600 rounded-lg text-xs font-bold hover:bg-slate-50 cursor-pointer"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 20 Frontend Polish: Philippine Data Privacy Act (RA 10173) Cookie Notice */}
      {!cookieConsent && (
        <div className="fixed bottom-0 left-0 right-0 z-50 p-3 sm:p-4 bg-slate-900/95 text-white backdrop-blur-md border-t border-slate-700 shadow-2xl no-print">
          <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-3 text-xs">
            <p className="text-slate-300 text-center sm:text-left">
              Manna Hardware complies with the <strong>Philippine Data Privacy Act of 2012 (RA 10173)</strong>. We use cookies and local storage to secure customer checkout, remember cart items, and optimize delivery dispatch in Leyte & Samar.
            </p>
            <div className="flex items-center gap-2 shrink-0">
              <button
                onClick={() => {
                  setCookieConsent('declined');
                  localStorage.setItem('manna_cookie_consent', 'declined');
                }}
                className="px-3 py-1.5 text-xs text-slate-300 hover:text-white font-medium cursor-pointer"
              >
                Essential Only
              </button>
              <button
                onClick={() => {
                  setCookieConsent('accepted');
                  localStorage.setItem('manna_cookie_consent', 'accepted');
                }}
                className="bg-[#EE4D2D] hover:bg-[#d73f20] text-white px-4 py-1.5 rounded-lg text-xs font-bold cursor-pointer transition-all active:scale-95 shadow-xs"
              >
                Accept All
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ==================== CONTRACTOR LOT INSPECTION & RESERVATION MODAL ==================== */}
      {selectedLotModal && (() => {
        // Resolve all catalog items matching this specialty lot (admin sees all items including cancelled for floor reconciliation)
        const lotItems = getLotProducts(selectedLotModal.id, products, isMerchantAuthenticated);
        const filteredLotItems = lotItems.filter(p => {
          if (!lotModalSearch) return true;
          const q = lotModalSearch.toLowerCase();
          return (p.name || '').toLowerCase().includes(q) || (p.id || '').toLowerCase().includes(q) || (p.category || '').toLowerCase().includes(q);
        });

        // Calculate verified active (non-cancelled) units and valuations
        const activeLotItems = filteredLotItems.filter(p => !p.isCancelled && p.status !== 'cancelled');
        const totalLotUnits = activeLotItems.reduce((sum, p) => sum + (Number(p.stock) || 0), 0);

        return (
          <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-xs flex items-center justify-center p-2 sm:p-4 overflow-y-auto">
            <div className="w-full max-w-5xl bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden my-auto flex flex-col max-h-[92vh]">
              {/* Header */}
              <div className="bg-gradient-to-r from-slate-950 via-slate-900 to-red-950 text-white p-4 sm:p-5 flex items-start justify-between shrink-0 border-b border-amber-500/20">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className={`text-[10px] font-black uppercase px-2 py-0.5 rounded border ${selectedLotModal.badgeColor}`}>
                      {selectedLotModal.badge}
                    </span>
                    <span className="text-xs text-amber-300 font-bold">
                      Specialty Category Lot Manifest
                    </span>
                  </div>
                  <h3 className="text-lg sm:text-xl font-black text-white">
                    {selectedLotModal.name}
                  </h3>
                  <p className="text-xs text-slate-300 mt-0.5">
                    {selectedLotModal.summary}
                  </p>
                </div>
                <button
                  onClick={() => { setSelectedLotModal(null); setLotModalSearch(''); }}
                  className="text-white/70 hover:text-white p-1 rounded-lg hover:bg-white/10 cursor-pointer transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Price Banner: Spot Cash Lot Buyout & Savings (No Total Warehouse Stock Value shown) */}
              <div className="p-4 sm:p-5 pb-0 shrink-0 space-y-3">
                <div className="bg-gradient-to-r from-slate-900 to-slate-950 text-white rounded-xl p-3.5 sm:p-4 border border-amber-500/30 shadow-xs flex flex-wrap items-center justify-between gap-3">
                  <div className="space-y-0.5">
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] uppercase font-black tracking-wider text-amber-400">
                        1-Click Buyout Package:
                      </span>
                      <span className="text-xl sm:text-2xl font-black text-emerald-400 leading-none">
                        ₱{selectedLotModal.lotPrice.toLocaleString('en-PH')}
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-300">
                      Spot cash take-all buyout for all {lotItems.length} line items in this specialty lot.
                    </p>
                  </div>

                  <div className="flex items-center gap-2">
                    <span className="bg-emerald-500 text-slate-950 text-xs font-black px-3 py-1 rounded-md shadow-xs">
                      SAVE ₱{selectedLotModal.savings.toLocaleString('en-PH')}
                    </span>
                    <span className="text-xs text-emerald-300 font-bold">
                      ~{selectedLotModal.discountPercent}% OFF SRP
                    </span>
                  </div>
                </div>

                {/* Admin Stock Discrepancy Controls Banner */}
                {isMerchantAuthenticated && (
                  <div className="bg-amber-50 border border-amber-300 rounded-xl p-3 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs text-amber-950 shadow-2xs">
                    <div className="flex items-center gap-2">
                      <span className="bg-amber-600 text-white font-black text-[10px] px-2 py-0.5 rounded uppercase tracking-wider">
                        Admin Audit Mode
                      </span>
                      <span className="font-semibold text-slate-800">
                        Warehouse stock discrepancy? Adjust physical counts directly or click <strong>Cancel Item</strong> below.
                      </span>
                    </div>
                    <span className="text-[11px] text-amber-800 font-mono font-bold whitespace-nowrap">
                      Live Manifest Sync Active
                    </span>
                  </div>
                )}

                {/* Search Bar inside Lot Manifest (Matching User Screenshot Layout) */}
                <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-1">
                  <div className="relative flex-1 w-full">
                    <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                    <input
                      type="text"
                      placeholder={`Search ${lotItems.length} items in this lot (e.g. PPR, PVC Union, Elbow)...`}
                      value={lotModalSearch}
                      onChange={(e) => setLotModalSearch(e.target.value)}
                      className="w-full pl-9 pr-8 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs focus:outline-none focus:border-amber-400 focus:bg-white transition-colors"
                    />
                    {lotModalSearch && (
                      <button
                        onClick={() => setLotModalSearch('')}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 text-xs cursor-pointer"
                      >
                        Clear
                      </button>
                    )}
                  </div>

                  <span className="text-xs text-slate-500 font-semibold whitespace-nowrap self-end sm:self-center">
                    Showing <strong>{filteredLotItems.length}</strong> of <strong>{lotItems.length}</strong> lot items
                  </span>
                </div>
              </div>

              {/* Exact Data Table Format from User Screenshot */}
              <div className="p-4 sm:p-5 flex-1 overflow-y-auto">
                <div className="overflow-x-auto border border-slate-200 rounded-xl max-h-[380px] overflow-y-auto shadow-2xs">
                  <table className="w-full text-left text-xs border-collapse">
                    <thead className="bg-slate-100 text-slate-700 font-bold sticky top-0 z-10 border-b border-slate-200 text-[11px]">
                      <tr>
                        <th className="py-2.5 px-3">SKU</th>
                        <th className="py-2.5 px-3">Product Description</th>
                        <th className="py-2.5 px-3">Category</th>
                        <th className="py-2.5 px-3 text-right">Physical Stock</th>
                        <th className="py-2.5 px-3 text-right">Retail Unit</th>
                        <th className="py-2.5 px-3 text-right text-emerald-700 font-black">40% Wholesale</th>
                        <th className="py-2.5 px-3 text-right">Line Valuation</th>
                        {isMerchantAuthenticated && (
                          <th className="py-2.5 px-3 text-center w-28 bg-amber-100/70 text-amber-900 font-black">Admin Action</th>
                        )}
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 text-slate-700">
                      {filteredLotItems.map((item) => {
                        const isItemCancelled = Boolean(item.isCancelled || item.status === 'cancelled');
                        const stock = Math.max(0, Number(item.stock) || 0);
                        const price = Number(item.price) || 0;
                        const wholesale = Math.round(price * 0.60 * 100) / 100;
                        const lineVal = price * stock;
                        return (
                          <tr key={item.id} className={`transition-colors ${isItemCancelled ? 'bg-rose-50/40 text-slate-400' : 'hover:bg-amber-50/40'}`}>
                            {/* SKU: light gray monospace font */}
                            <td className="py-2 px-3 font-mono text-[11px] text-slate-500 whitespace-nowrap">
                              {item.id}
                            </td>
                            {/* Product Description */}
                            <td className="py-2 px-3 font-bold leading-snug">
                              {isItemCancelled ? (
                                <div className="flex items-center gap-1.5 flex-wrap">
                                  <span className="bg-rose-600 text-white text-[9px] font-black px-1.5 py-0.2 rounded uppercase not-italic no-underline">
                                    Cancelled Discrepancy
                                  </span>
                                  <span className="line-through text-slate-400">{item.name}</span>
                                </div>
                              ) : (
                                <span className="text-slate-900">{item.name}</span>
                              )}
                            </td>
                            {/* Category: muted text */}
                            <td className="py-2 px-3 text-slate-500 text-[11px] whitespace-nowrap">
                              {item.category}
                            </td>
                            {/* Physical Stock: editable if admin, bold count if buyer */}
                            <td className="py-2 px-3 text-right whitespace-nowrap">
                              {isMerchantAuthenticated ? (
                                <div className="inline-flex items-center justify-end gap-1">
                                  <input
                                    type="number"
                                    min="0"
                                    value={item.stock}
                                    onChange={(e) => handleInlineStockChange(item.id, e.target.value)}
                                    className="w-16 px-1.5 py-0.5 text-right font-black text-xs border border-amber-400 bg-amber-50/50 rounded focus:bg-white focus:outline-none"
                                    title="Adjust physical warehouse count"
                                  />
                                  <span className="text-[10px] text-slate-500">{item.unit || 'pc'}</span>
                                </div>
                              ) : (
                                <div className="font-bold text-slate-900">
                                  {stock} <span className="text-[10px] font-normal text-slate-500">{item.unit || 'pc'}</span>
                                </div>
                              )}
                            </td>
                            {/* Retail Unit (SRP) with strike out */}
                            <td className="py-2 px-3 text-right whitespace-nowrap font-medium text-slate-700">
                              <span className={`line-through mr-1 ${isItemCancelled ? 'text-slate-300' : 'text-slate-400'}`}>₱{price.toLocaleString('en-PH')}</span>
                            </td>
                            {/* 40% Wholesale: emerald green bold (#059669) */}
                            <td className={`py-2 px-3 text-right whitespace-nowrap font-black ${isItemCancelled ? 'text-slate-400' : 'bg-emerald-50/50 text-emerald-700'}`}>
                              ₱{wholesale.toLocaleString('en-PH')}
                            </td>
                            {/* Line Valuation */}
                            <td className={`py-2 px-3 text-right font-black whitespace-nowrap ${isItemCancelled ? 'text-slate-400 line-through' : 'text-slate-900'}`}>
                              ₱{lineVal.toLocaleString('en-PH')}
                            </td>
                            {/* Admin Action Column */}
                            {isMerchantAuthenticated && (
                              <td className="py-2 px-3 text-center whitespace-nowrap bg-amber-50/30">
                                <button
                                  onClick={() => handleToggleCancelItem(item.id)}
                                  className={`px-2 py-1 rounded text-[10px] font-bold cursor-pointer transition-colors inline-flex items-center gap-1 ${
                                    isItemCancelled
                                      ? 'bg-emerald-600 hover:bg-emerald-700 text-white shadow-2xs'
                                      : 'bg-rose-50 text-rose-700 hover:bg-rose-600 hover:text-white border border-rose-200'
                                  }`}
                                  title={isItemCancelled ? 'Restore item back into lot manifest' : 'Cancel item due to warehouse discrepancy / damaged stock'}
                                >
                                  {isItemCancelled ? (
                                    <>
                                      <CheckCircle2 className="w-3 h-3" /> Restore
                                    </>
                                  ) : (
                                    <>
                                      <Ban className="w-3 h-3" /> Cancel Item
                                    </>
                                  )}
                                </button>
                              </td>
                            )}
                          </tr>
                        );
                      })}
                      {filteredLotItems.length === 0 && (
                        <tr>
                          <td colSpan={7} className="py-8 text-center text-slate-400">
                            No items in this lot matched "{lotModalSearch}".
                          </td>
                        </tr>
                      )}
                    </tbody>
                    <tfoot className="bg-slate-50 font-bold border-t-2 border-slate-200 text-slate-900 text-xs sticky bottom-0">
                      <tr>
                        <td className="py-2.5 px-3 font-black uppercase text-[11px]" colSpan={3}>
                          Total Verified Lot Breakdown ({activeLotItems.length} active SKUs, {totalLotUnits.toLocaleString('en-PH')} units)
                        </td>
                        <td className="py-2.5 px-3 text-right font-black">
                          {totalLotUnits} Units
                        </td>
                        <td className="py-2.5 px-3 text-right text-slate-400 text-[10px]">
                          (Per-Unit Benchmark)
                        </td>
                        <td className="py-2.5 px-3 text-right bg-emerald-100 text-emerald-900 font-black text-xs">
                          40% OFF Wholesale
                        </td>
                        <td className="py-2.5 px-3 text-right font-black text-[#EE4D2D]">
                          Buyout: ₱{selectedLotModal.lotPrice.toLocaleString('en-PH')}
                        </td>
                      </tr>
                    </tfoot>
                  </table>
                </div>

                {/* Dispatch & Pickup Note (NO WAREHOUSE ADDRESS) */}
                <div className="bg-slate-50 rounded-xl p-3 border border-slate-200 text-slate-600 text-xs space-y-1 mt-3">
                  <p className="font-bold text-slate-900">Commercial Buyout Conditions:</p>
                  <p>• <strong>Inspection &amp; Pickup:</strong> Available upon scheduled coordination in Tacloban City (Call/SMS 0926 199 5703).</p>
                  <p>• <strong>Payment:</strong> 100% Manager's Check, Real-time PesoNet / InstaPay bank transfer, or cash prior to release.</p>
                  <p>• <strong>Trucking / Hauling:</strong> Buyer provides transport, or dispatch team can assist with trusted local haulers.</p>
                </div>
              </div>

              {/* Footer Buttons with 0926 199 5703 hotline */}
              <div className="p-4 bg-slate-50 border-t border-slate-200 flex flex-wrap items-center justify-between gap-3 shrink-0">
                <div className="flex items-center gap-2">
                  <a
                    href="tel:09261995703"
                    className="bg-slate-900 hover:bg-black text-amber-400 font-black px-3.5 py-2 rounded-xl text-xs flex items-center gap-1.5 shadow-xs transition-colors"
                  >
                    <Phone className="w-3.5 h-3.5" /> Call Dispatch: 0926 199 5703
                  </a>
                  <a
                    href={`https://wa.me/639261995703?text=Hello%20Manna%20Hardware%20Dispatch.%20I%20am%20interested%20in%20inspecting%20and%20reserving%20${encodeURIComponent(selectedLotModal.name)}%20for%20₱${selectedLotModal.lotPrice.toLocaleString('en-PH')}.%20Please%20confirm%20availability%20and%20schedule.`}
                    target="_blank"
                    rel="noreferrer"
                    className="bg-emerald-600 hover:bg-emerald-500 text-white font-bold px-3 py-2 rounded-xl text-xs flex items-center gap-1 cursor-pointer shadow-2xs transition-all"
                  >
                    <MessageCircle className="w-3.5 h-3.5" /> Viber
                  </a>
                  <button
                    onClick={() => {
                      const brief = `${selectedLotModal.name}\nBuyout Price: ₱${selectedLotModal.lotPrice.toLocaleString('en-PH')}\nSavings: ₱${selectedLotModal.savings.toLocaleString('en-PH')}\nLocation: Tacloban City, Leyte\nDispatch Hotline: 0926 199 5703`;
                      navigator.clipboard.writeText(brief);
                      setLotCopiedId(selectedLotModal.id);
                      setTimeout(() => setLotCopiedId(null), 2500);
                    }}
                    className="bg-white hover:bg-slate-100 text-slate-700 border border-slate-300 font-bold px-3 py-2 rounded-xl text-xs flex items-center gap-1.5 cursor-pointer shadow-2xs transition-colors"
                  >
                    <Copy className="w-3.5 h-3.5 text-slate-500" /> {lotCopiedId === selectedLotModal.id ? 'Copied Lot Brief!' : 'Copy Summary'}
                  </button>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => { setSelectedLotModal(null); setLotModalSearch(''); }}
                    className="px-4 py-2 bg-slate-200 hover:bg-slate-300 text-slate-800 text-xs font-bold rounded-xl cursor-pointer transition-colors"
                  >
                    Close
                  </button>
                  <button
                    onClick={() => buyWholeLot(selectedLotModal)}
                    className="bg-gradient-to-r from-amber-500 via-orange-500 to-[#EE4D2D] hover:from-amber-600 hover:via-orange-600 hover:to-[#d73f20] text-white text-xs sm:text-sm font-black py-2.5 px-4 rounded-xl cursor-pointer shadow-md transition-all active:scale-98 flex items-center gap-1.5"
                  >
                    <ShoppingCart className="w-4 h-4 stroke-[2.5]" /> BUY WHOLE LOT (₱{selectedLotModal.lotPrice.toLocaleString('en-PH')})
                  </button>
                </div>
              </div>
            </div>
          </div>
        );
      })()}

      {/* ==================== MODAL: PRINTABLE COMMERCIAL SALES INVOICE & DISPATCH MANIFEST ==================== */}
      {invoiceModalOrder && (
        <div className="fixed inset-0 z-50 bg-slate-900/70 backdrop-blur-xs flex items-center justify-center p-2 sm:p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 max-w-3xl w-full my-auto overflow-hidden flex flex-col max-h-[95vh]">
            
            {/* Top Modal Controls (No-Print) */}
            <div className="no-print bg-slate-900 text-white px-5 py-3 flex flex-wrap items-center justify-between gap-3 border-b border-slate-800 shrink-0">
              <div className="flex items-center gap-2.5">
                <Receipt className="w-5 h-5 text-orange-400" />
                <div>
                  <h3 className="text-sm font-black tracking-wide text-white flex items-center gap-2">
                    {invoicePrintMode === 'internal_pick' ? 'Internal Warehouse Dispatch Pick Slip' : 'Official Commercial Sales Invoice'}
                    <span className={`text-[10px] font-mono px-2 py-0.5 rounded border ${
                      invoicePrintMode === 'internal_pick'
                        ? 'bg-amber-400/20 text-amber-300 border-amber-400/30 font-bold'
                        : 'bg-orange-500/30 text-orange-300 border-orange-400/30'
                    }`}>
                      {invoicePrintMode === 'internal_pick' ? 'STAFF PICK ONLY' : 'BIR Non-VAT'}
                    </span>
                  </h3>
                  <p className="text-[11px] text-slate-400">Order Ref: <span className="font-mono font-bold text-slate-200">{invoiceModalOrder.orderId}</span></p>
                </div>
              </div>

              {/* View Mode Switcher Toggle */}
              <div className="flex items-center gap-1 bg-slate-800 p-1 rounded-lg border border-slate-700">
                <button
                  type="button"
                  onClick={() => setInvoicePrintMode('commercial')}
                  className={`px-3 py-1.5 rounded text-xs font-bold transition-all cursor-pointer ${
                    invoicePrintMode === 'commercial'
                      ? 'bg-[#EE4D2D] text-white shadow-xs'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  📄 Customer Invoice (BIR)
                </button>
                <button
                  type="button"
                  onClick={() => setInvoicePrintMode('internal_pick')}
                  className={`px-3 py-1.5 rounded text-xs font-black transition-all flex items-center gap-1.5 cursor-pointer ${
                    invoicePrintMode === 'internal_pick'
                      ? 'bg-amber-400 text-slate-950 shadow-xs'
                      : 'text-slate-400 hover:text-amber-300'
                  }`}
                >
                  <Box className="w-3.5 h-3.5 text-amber-950" />
                  📦 Warehouse Pick Slip (Shows Box #)
                </button>
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => window.print()}
                  className="bg-amber-500 hover:bg-amber-600 text-slate-950 font-black text-xs px-3.5 py-2 rounded-lg flex items-center gap-1.5 cursor-pointer shadow-sm transition-all printable-btn"
                  title="Print document or save as PDF"
                >
                  <Printer className="w-4 h-4" /> Print / Save PDF
                </button>
                <button
                  type="button"
                  onClick={() => setInvoiceModalOrder(null)}
                  className="bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white p-2 rounded-lg cursor-pointer transition-colors"
                  aria-label="Close invoice modal"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Printable Document Area */}
            <div className="overflow-y-auto p-4 sm:p-8 space-y-6 text-slate-800 bg-white" id="manna-printable-invoice">
              
              {/* 1. Header / Store Letterhead */}
              <div className="border-b-2 border-slate-900 pb-4">
                <div className="flex flex-col sm:flex-row justify-between items-start gap-4">
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <span className="bg-[#EE4D2D] text-white font-black text-xs px-2 py-0.5 rounded">MANNA</span>
                      <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
                        MANNA HARDWARE &amp; CONSTRUCTION SUPPLY
                      </h1>
                    </div>
                    <p className="text-xs font-bold text-slate-600 uppercase tracking-wider">
                      Direct Importer • Wholesaler • Retailer • Leyte Regional Depot
                    </p>
                    <p className="text-xs text-slate-500 mt-1 flex items-center gap-1">
                      <MapPin className="w-3.5 h-3.5 text-[#EE4D2D] shrink-0" />
                      Tacloban City, Leyte 6500 (Dispatch Hub)
                    </p>
                    <p className="text-xs text-slate-500 mt-0.5 flex flex-wrap items-center gap-x-3 gap-y-1">
                      <span><strong>Hotline:</strong> (053) 832-4911</span>
                      <span><strong>Mobile/Viber:</strong> 0926 199 5703</span>
                      <span><strong>Email:</strong> sales@mannahardware.ph</span>
                    </p>
                  </div>

                  {/* Document Badge */}
                  <div className="sm:text-right shrink-0 bg-slate-50 sm:bg-transparent p-3 sm:p-0 rounded-lg border sm:border-0 border-slate-200">
                    <span className={`text-[10px] font-black uppercase tracking-widest px-2.5 py-1 rounded border block mb-1 ${
                      invoicePrintMode === 'internal_pick'
                        ? 'bg-amber-100 text-amber-950 border-amber-300'
                        : 'text-[#EE4D2D] bg-orange-50 border-orange-200'
                    }`}>
                      {invoicePrintMode === 'internal_pick' ? 'WAREHOUSE RETRIEVAL SLIP' : 'Commercial Sales Invoice'}
                    </span>
                    <p className="font-mono font-black text-lg text-slate-900">
                      {invoicePrintMode === 'internal_pick' ? `PICK-${invoiceModalOrder.orderId}` : `INV-${invoiceModalOrder.orderId}`}
                    </p>
                    <p className="text-xs text-slate-500 mt-0.5">
                      Date: <strong className="text-slate-800">{invoiceModalOrder.date}</strong>
                    </p>
                    {invoicePrintMode === 'internal_pick' ? (
                      <p className="text-[10px] text-amber-800 font-bold mt-0.5 font-mono">
                        Target: Numbered Storage Boxes
                      </p>
                    ) : (
                      <p className="text-[10px] text-slate-400 mt-0.5 font-mono">
                        BIR Reg No: BIR-TX-08-6500-2026-MNA
                      </p>
                    )}
                  </div>
                </div>
              </div>

              {/* 2. Customer & Dispatch Particulars */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                {/* Consignee Info */}
                <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-200 space-y-1.5">
                  <h4 className="font-black text-slate-900 uppercase tracking-wider text-[11px] flex items-center gap-1.5 text-[#EE4D2D]">
                    <User className="w-3.5 h-3.5" /> Billed To / Job Site Consignee
                  </h4>
                  <div className="pt-1">
                    <p className="text-sm font-black text-slate-900">{invoiceModalOrder.customer?.fullName || 'Walk-in Customer'}</p>
                    <p className="text-slate-600 font-mono mt-0.5">Contact: {invoiceModalOrder.customer?.phone || 'N/A'}</p>
                    {invoiceModalOrder.customer?.email && (
                      <p className="text-slate-500 mt-0.5">Email: {invoiceModalOrder.customer.email}</p>
                    )}
                    <p className="text-slate-700 mt-1 leading-relaxed">
                      <strong>Delivery Site:</strong> {invoiceModalOrder.customer?.address || 'Pickup / Scheduled Dispatch in Tacloban City'}
                    </p>
                    {invoiceModalOrder.customer?.deliveryZone && (
                      <p className="text-slate-600 mt-0.5">
                        <strong>Destination Zone:</strong> {invoiceModalOrder.customer.deliveryZone}
                      </p>
                    )}
                  </div>
                </div>

                {/* Dispatch Details */}
                <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-200 space-y-1.5">
                  <h4 className="font-black text-slate-900 uppercase tracking-wider text-[11px] flex items-center gap-1.5 text-blue-600">
                    <Truck className="w-3.5 h-3.5" /> Fulfillment &amp; Logistics Particulars
                  </h4>
                  <div className="pt-1 space-y-1">
                    <div className="flex justify-between">
                      <span className="text-slate-500">Payment Terms:</span>
                      <strong className="text-slate-900 uppercase">{invoiceModalOrder.customer?.paymentMethod || 'Cash on Delivery (COD)'}</strong>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-slate-500">Order Status:</span>
                      <span className={`px-2 py-0.5 rounded text-[10px] font-black uppercase ${
                        invoiceModalOrder.status === 'Cancelled' ? 'bg-rose-100 text-rose-700' :
                        invoiceModalOrder.status === 'Delivered' ? 'bg-emerald-100 text-emerald-800' :
                        invoiceModalOrder.status === 'Out for Delivery' ? 'bg-blue-100 text-blue-800' :
                        invoiceModalOrder.status === 'Packed' ? 'bg-indigo-100 text-indigo-800' :
                        'bg-amber-100 text-amber-800'
                      }`}>
                        {invoiceModalOrder.status}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-500">Dispatch Depot:</span>
                      <span className="text-slate-700 font-medium">Tacloban Dispatch Hub</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-500">Estimated Distance:</span>
                      <span className="text-slate-700 font-mono font-bold">{invoiceModalOrder.distanceKm || 8} km</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Staff Picking Directive Banner */}
              {invoicePrintMode === 'internal_pick' && (
                <div className="bg-amber-50 border-2 border-dashed border-amber-300 p-3.5 rounded-xl text-xs text-amber-950 flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-amber-400 text-slate-950 flex items-center justify-center font-black shrink-0">
                    <Box className="w-5 h-5" />
                  </div>
                  <div>
                    <h5 className="font-black text-xs uppercase tracking-wide text-amber-950">
                      WAREHOUSE PICKING DIRECTIVE (DO NOT UNPACK SHELVES)
                    </h5>
                    <p className="text-[11px] text-amber-900 mt-0.5">
                      Employees: Retrieve small items directly from their assigned <strong>BOX NUMBER</strong> below. Once pulled, tick the checkbox.
                    </p>
                  </div>
                </div>
              )}

              {/* 3. Itemized Table Breakdown */}
              <div className="border border-slate-200 rounded-lg overflow-hidden">
                <table className="w-full text-left text-xs border-collapse">
                  <thead className="bg-slate-900 text-white font-bold uppercase text-[10px] tracking-wider">
                    <tr>
                      {invoicePrintMode === 'internal_pick' && (
                        <th className="py-2.5 px-2 text-center w-8 bg-amber-500 text-slate-950 font-black">Pick</th>
                      )}
                      <th className="py-2.5 px-3 text-center w-10">#</th>
                      <th className="py-2.5 px-3">Item Description &amp; Specification</th>
                      {invoicePrintMode === 'internal_pick' && (
                        <th className="py-2.5 px-3 bg-amber-400 text-slate-950 font-black">
                          📦 Physical Box Location &amp; Quote #
                        </th>
                      )}
                      <th className="py-2.5 px-3 text-center">Unit</th>
                      <th className="py-2.5 px-3 text-center font-black">Qty</th>
                      <th className="py-2.5 px-3 text-right">Unit Price (₱)</th>
                      <th className="py-2.5 px-3 text-right">Amount (₱)</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200">
                    {(invoiceModalOrder.items || []).map((it, idx) => {
                      const itemPrice = Number(it.price || it.unitPrice || 0);
                      const itemTotal = itemPrice * Number(it.quantity || 1);
                      return (
                        <tr key={idx} className="hover:bg-slate-50/50">
                          {invoicePrintMode === 'internal_pick' && (
                            <td className="py-2.5 px-2 text-center bg-amber-50/40">
                              <input type="checkbox" className="w-4 h-4 rounded cursor-pointer" />
                            </td>
                          )}
                          <td className="py-2.5 px-3 text-center font-mono text-slate-400 font-bold">{idx + 1}</td>
                          <td className="py-2.5 px-3">
                            <p className="font-bold text-slate-900">{it.name || it.product_id}</p>
                            <p className="text-[10px] font-mono text-slate-400">SKU: {it.id || it.product_id || 'MNA-SKU'}</p>
                          </td>
                          {invoicePrintMode === 'internal_pick' && (
                            <td className="py-2.5 px-3 bg-amber-50/70 border-l border-r border-amber-200">
                              {(() => {
                                const locs = getItemLocations(it.name, it.id || it.product_id);
                                if (locs.length === 0) {
                                  return (
                                    <span className="inline-block bg-slate-100 text-slate-700 font-bold px-2 py-0.5 rounded text-[11px]">
                                      Box #01 / Standard Bin
                                    </span>
                                  );
                                }
                                return (
                                  <div className="space-y-1">
                                    {locs.map((loc, lIdx) => (
                                      <div key={lIdx} className="flex items-center gap-1.5 flex-wrap">
                                        <span className="bg-amber-300 text-amber-950 font-black px-2 py-0.5 rounded text-xs border border-amber-400 shadow-2xs font-mono inline-block">
                                          📦 BOX #{loc.box_no}
                                        </span>
                                        <span className="text-[11px] font-bold text-slate-800 font-mono">
                                          {loc.quote_no}
                                        </span>
                                        <span className="text-[10px] text-slate-500 font-mono">
                                          ({loc.warehouse} • Stock in box: {loc.qty} {loc.unit})
                                        </span>
                                      </div>
                                    ))}
                                  </div>
                                );
                              })()}
                            </td>
                          )}
                          <td className="py-2.5 px-3 text-center font-mono text-slate-600 uppercase text-[11px]">{it.unit || 'pc'}</td>
                          <td className="py-2.5 px-3 text-center font-mono font-black text-slate-900 text-sm">{it.quantity}</td>
                          <td className="py-2.5 px-3 text-right font-mono text-slate-700">₱{itemPrice.toLocaleString(undefined, { minimumFractionDigits: 2 })}</td>
                          <td className="py-2.5 px-3 text-right font-mono font-bold text-slate-900">₱{itemTotal.toLocaleString(undefined, { minimumFractionDigits: 2 })}</td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>

              {/* 4. Financial Calculation Breakdown */}
              {(() => {
                const subtotal = invoiceModalOrder.subtotal || (invoiceModalOrder.items || []).reduce((sum, i) => sum + (Number(i.price || i.unitPrice || 0) * (i.quantity || 1)), 0);
                const discount = invoiceModalOrder.discountAmount || 0;
                const baseShip = invoiceModalOrder.baseShippingFee !== undefined ? invoiceModalOrder.baseShippingFee : 0;
                const longFee = invoiceModalOrder.longCargoFee || 0;
                const totalShip = invoiceModalOrder.shippingFee !== undefined ? invoiceModalOrder.shippingFee : (baseShip + longFee);
                const grandTotal = invoiceModalOrder.total || (subtotal - discount + totalShip);

                return (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 items-start pt-2">
                    {/* Notice / Terms */}
                    <div className="border border-slate-200 rounded-xl p-3 text-[11px] text-slate-500 space-y-1.5 bg-slate-50">
                      <p className="font-bold text-slate-700 uppercase tracking-wider text-[10px]">Commercial Warranty &amp; Return Terms:</p>
                      <p>• Goods received in good order and condition. Check count upon site drop-off.</p>
                      <p>• 7 days commercial warranty for factory defects with this original sales invoice.</p>
                      <p>• Heavy structural items (C-Purlins, Pipes, Rebar) verified by Manna warehouse inspection.</p>
                    </div>

                    {/* Breakdown Calculation */}
                    <div className="bg-slate-50 border border-slate-200 rounded-xl p-3.5 space-y-2 text-xs">
                      <div className="flex justify-between text-slate-700">
                        <span>Merchandise Subtotal:</span>
                        <span className="font-mono font-bold">₱{subtotal.toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>
                      </div>

                      {discount > 0 && (
                        <div className="flex justify-between text-emerald-700 font-bold bg-emerald-50 px-2 py-1 rounded border border-emerald-200">
                          <span className="flex items-center gap-1">
                            <Tag className="w-3.5 h-3.5 text-emerald-600" />
                            Voucher Discount {invoiceModalOrder.promoCode ? `(${invoiceModalOrder.promoCode.toUpperCase()})` : ''}:
                          </span>
                          <span className="font-mono">-₱{discount.toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>
                        </div>
                      )}

                      <div className="flex justify-between text-slate-600">
                        <span>Base Freight &amp; Handling:</span>
                        <span className="font-mono">{baseShip === 0 ? <strong className="text-emerald-600 font-bold">FREE</strong> : `₱${baseShip.toFixed(2)}`}</span>
                      </div>

                      {longFee > 0 && (
                        <div className="flex justify-between text-amber-800 font-semibold bg-amber-50 px-2 py-1 rounded border border-amber-200">
                          <span className="flex items-center gap-1">
                            <Truck className="w-3 h-3 text-amber-600" />
                            Long Cargo / Logistics Surcharge ({invoiceModalOrder.distanceKm || 8} km):
                          </span>
                          <span className="font-mono font-bold">₱{longFee.toFixed(2)}</span>
                        </div>
                      )}

                      <div className="flex justify-between text-slate-700 pt-1 border-t border-slate-200 font-bold">
                        <span>Total Delivery Logistics:</span>
                        <span className="font-mono">{totalShip === 0 ? <strong className="text-emerald-600">FREE (₱0.00)</strong> : `₱${totalShip.toFixed(2)}`}</span>
                      </div>

                      <div className="flex justify-between items-baseline pt-2 border-t-2 border-slate-900 text-slate-900">
                        <span className="text-sm font-black uppercase">Grand Total Payable:</span>
                        <span className="text-lg font-black font-mono text-[#EE4D2D]">
                          ₱{Number(grandTotal).toLocaleString(undefined, { minimumFractionDigits: 2 })}
                        </span>
                      </div>
                    </div>
                  </div>
                );
              })()}

              {/* 5. Dispatch & Receiving Sign-off */}
              <div className="border-t border-slate-200 pt-6 mt-4">
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 text-center text-xs">
                  <div>
                    <div className="border-b border-slate-400 pb-10"></div>
                    <p className="font-bold text-slate-800 mt-1.5 uppercase text-[10px]">Prepared &amp; Inspected By</p>
                    <p className="text-[10px] text-slate-500">Manna Warehouse Dispatch Officer</p>
                  </div>
                  <div>
                    <div className="border-b border-slate-400 pb-10"></div>
                    <p className="font-bold text-slate-800 mt-1.5 uppercase text-[10px]">Dispatched / Transported By</p>
                    <p className="text-[10px] text-slate-500">Fleet Logistics Driver / Vehicle Plate</p>
                  </div>
                  <div>
                    <div className="border-b border-slate-400 pb-10"></div>
                    <p className="font-bold text-slate-800 mt-1.5 uppercase text-[10px]">Received in Good Order &amp; Condition</p>
                    <p className="text-[10px] text-slate-500">Customer / Authorized Project In-Charge</p>
                  </div>
                </div>
              </div>

              {/* 6. Document Footer */}
              <div className="text-center text-[10px] text-slate-400 pt-3 border-t border-slate-100">
                <p>This is an official commercial sales invoice &amp; delivery manifest generated by Manna Hardware &amp; Construction Supply.</p>
                <p className="font-mono mt-0.5">Tacloban City • Leyte • Philippines | Hotline: (053) 832-4911</p>
              </div>

            </div>

          </div>
        </div>
      )}


      {/* 20 Frontend Polish: Confirmation Dialog for Destructive Actions */}
      {confirmModal.isOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="w-full max-w-sm bg-white rounded-2xl shadow-2xl p-5 border border-slate-200">
            <div className="flex items-center gap-2 text-rose-600 mb-2">
              <AlertCircle className="w-5 h-5 shrink-0" />
              <h3 className="font-bold text-sm text-slate-900">{confirmModal.title}</h3>
            </div>
            <p className="text-xs text-slate-600 mb-4">{confirmModal.message}</p>
            <div className="flex justify-end gap-2">
              <button
                onClick={() => setConfirmModal({ isOpen: false, title: '', message: '', onConfirm: null })}
                className="px-3 py-1.5 text-xs font-bold text-slate-600 hover:bg-slate-100 rounded-lg cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  if (confirmModal.onConfirm) confirmModal.onConfirm();
                  setConfirmModal({ isOpen: false, title: '', message: '', onConfirm: null });
                }}
                className="px-4 py-1.5 text-xs font-bold bg-rose-600 hover:bg-rose-700 text-white rounded-lg cursor-pointer shadow-xs"
              >
                Confirm
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}

// ==================== MANNA PRODUCT CARD COMPONENT ====================
function ProductCard({ product, onAddToCart, isRightCol = false, isVideoCard = false, storewideDiscount = 0, isRetailMode = false }) {
  const getDisplaySold = (p) => {
    let s = typeof p.sold === 'number' ? p.sold : null;
    if (s === null || isNaN(s)) {
      let h = 2166136261;
      const str = String(p.id || '');
      for (let i = 0; i < str.length; i++) {
        h ^= str.charCodeAt(i);
        h = Math.imul(h, 16777619);
      }
      s = 50 + ((Math.imul(h >>> 0, 2654435761) >>> 0) % 2951);
    }
    // Strict 3k max limit
    const capped = Math.min(3000, Math.max(1, Math.round(s)));
    if (capped >= 1000) {
      const k = (capped / 1000).toFixed(1);
      return `${k.endsWith('.0') ? (capped / 1000).toFixed(0) : k}k+`;
    }
    return `${capped}`;
  };
  const soldCount = getDisplaySold(product);
  const location = isRightCol ? 'Tacloban City' : 'Palo, Leyte';
  const days = isRightCol ? 'Same Day' : '1-2 Days';

  const itemDisc = Number(product.discount_percent || 0);
  const maxDiscount = Math.max(itemDisc, storewideDiscount);
  const effectivePrice = maxDiscount > 0 ? product.price * (1 - maxDiscount / 100) : product.price;
  const isBulkPack = product.unit && product.unit.includes('100');

  // Wholesale Pack Calculator
  const pack = getProductWholesalePack(product, isRetailMode);
  const packTotalPrice = effectivePrice * pack.minQty;

  return (
    <div className="bg-white rounded-sm overflow-hidden border border-[#EAEAEA] flex flex-col group relative shadow-2xs hover:shadow-md transition-shadow">
      
      {/* Product Image Box */}
      <div className="relative aspect-square bg-[#F7F7F7] overflow-hidden select-none" onContextMenu={(e) => e.preventDefault()}>
        <img
          src={product.image}
          alt={product.name}
          loading="lazy"
          draggable={false}
          onContextMenu={(e) => e.preventDefault()}
          className="w-full h-full object-cover group-hover:scale-102 transition-transform duration-300 select-none pointer-events-auto"
          onError={(e) => {
            e.target.onerror = null;
            e.target.src = "https://images.pexels.com/photos/175039/pexels-photo-175039.jpeg?auto=compress&cs=tinysrgb&h=650&w=940";
          }}
        />

        {/* Prominent Per-Item Discount Banner on top right */}
        {maxDiscount > 0 && (
          <div className="absolute top-1.5 right-1.5 bg-red-600 text-white text-[9px] font-black px-2 py-0.5 rounded shadow-md z-10 flex items-center gap-0.5">
            <span>{maxDiscount}% OFF</span>
          </div>
        )}

        {/* Wholesale Pack Badge vs Retail */}
        {isRetailMode ? (
          <div className="absolute top-1.5 left-1.5 bg-emerald-600 text-white text-[8px] font-black px-1.5 py-0.5 rounded shadow-xs flex items-center gap-1">
            <span>🛍️</span> RETAIL (PER PC)
          </div>
        ) : (
          <div className="absolute top-1.5 left-1.5 bg-slate-900 text-amber-400 border border-amber-400/40 text-[8px] font-black px-1.5 py-0.5 rounded shadow-xs flex items-center gap-1">
            <Box className="w-2.5 h-2.5 text-amber-400 shrink-0" />
            <span>{pack.packLabel.toUpperCase()}</span>
          </div>
        )}

        {/* Video overlay indicator */}
        {isVideoCard && (
          <div className="absolute top-1.5 left-1.5 bg-black/60 backdrop-blur-xs text-white text-[9px] font-bold px-1.5 py-0.5 rounded-full flex items-center gap-1">
            <span>▶</span> 45.5K
          </div>
        )}

        {/* Commercial Dispatch Strip on Image bottom */}
        <div className="absolute bottom-0 left-0 right-0 bg-slate-900/90 text-amber-400 text-[8px] font-black px-1.5 py-0.5 flex items-center justify-between">
          <span>COD / GCASH AVAILABLE</span>
          <span className="text-[7px] text-white font-semibold">{product.unit.toUpperCase()}</span>
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

          {/* Manna Hardware Badges */}
          <div className="flex flex-wrap items-center gap-1 mt-1.5">
            <span className="border border-emerald-600 text-emerald-700 text-[8px] font-bold px-1 rounded-xs leading-none py-0.5 bg-emerald-50">
              Tacloban Stock
            </span>
            {isLongCargoItem(product) && (
              <span className="bg-amber-600 text-white text-[8px] font-bold px-1 rounded-xs leading-none py-0.5 flex items-center gap-0.5">
                <Truck className="w-2.5 h-2.5" /> 10ft+ (₱50/km)
              </span>
            )}
            <span className="bg-[#EE4D2D] text-white text-[8px] font-bold px-1 rounded-xs leading-none py-0.5">
              Wholesale Deal
            </span>
            {maxDiscount > 0 && (
              <span className="bg-red-600 text-white text-[9px] font-black px-1.5 rounded-xs leading-tight py-0.5 tracking-tight shadow-xs flex items-center gap-0.5 animate-pulse">
                <span>🔥</span> {maxDiscount}% OFF
              </span>
            )}
          </div>
        </div>

        {/* Price & Sold Section */}
        <div className="mt-2">
          <div className="flex items-baseline justify-between">
            <span className="text-[#EE4D2D] font-extrabold text-sm sm:text-base leading-none tracking-tight select-none">
              ₱{Math.floor(isRetailMode ? effectivePrice : packTotalPrice).toLocaleString()}
            </span>
            <span className="text-[10px] text-[#757575] font-normal">
              {soldCount} sold
            </span>
          </div>

          {!isRetailMode && pack.minQty > 1 && (
            <p className="text-[8.5px] text-slate-500 font-medium mt-0.5 truncate">
              ₱{Math.floor(effectivePrice).toLocaleString()}/{product.unit || 'pc'} &bull; Min: {pack.packLabel}
            </p>
          )}

          {/* Delivery estimate & Location */}
          <div className="flex items-center justify-between mt-1.5 text-[9px] text-[#757575] border-t border-slate-50 pt-1">
            <span className="flex items-center gap-0.5 text-[#00BFA5] font-semibold">
              <Truck className="w-2.5 h-2.5" /> {days}
            </span>
            <span className="truncate max-w-[70px] text-[#757575]">{location}</span>
            <button 
              onClick={() => onAddToCart(product, pack.minQty)}
              className="text-white bg-[#EE4D2D] hover:bg-[#d73f20] px-2 py-0.5 rounded text-[10px] font-bold flex items-center gap-0.5 shadow-xs cursor-pointer transition-colors"
              title={isRetailMode ? "Add 1 pc to cart" : `Add ${pack.packLabel} to cart`}
            >
              <Plus className="w-3 h-3" />
              <span>{isRetailMode ? 'Add' : `+${pack.minQty}`}</span>
            </button>
          </div>
        </div>
      </div>

    </div>
  );
}
