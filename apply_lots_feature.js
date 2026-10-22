const fs = require('fs');
const path = require('path');

const targetPath = path.join(__dirname, 'storefront-app', 'src', 'App.jsx');
let content = fs.readFileSync(targetPath, 'utf8');

// Normalize line endings to \n for reliable matching
const hasCRLF = content.includes('\r\n');
if (hasCRLF) {
  content = content.replace(/\r\n/g, '\n');
}

function doReplace(searchStr, replaceStr, label) {
  const normSearch = searchStr.replace(/\r\n/g, '\n');
  const normReplace = replaceStr.replace(/\r\n/g, '\n');
  if (!content.includes(normSearch)) {
    console.error(`ERROR: Could not find target for [${label}]!`);
    process.exit(1);
  }
  content = content.replace(normSearch, normReplace);
  console.log(`✓ Replaced [${label}] successfully.`);
}

// 1. Insert CONTRACTOR_LOTS & WHOLESALE_TIERS
const lotsDef = `// ==================== B2B COMMERCIAL LIQUIDATION & CONTRACTOR LOTS ====================
export const CONTRACTOR_LOTS = [
  {
    id: 'structural-lot',
    name: 'The Structural Steel & Framing Lot',
    badge: 'High Demand',
    badgeColor: 'bg-amber-100 text-amber-800 border-amber-300',
    category: 'Structural & Building Materials',
    retailValue: 153460,
    lotPrice: 115000,
    savings: 38460,
    discountPercent: 25,
    summary: '170 pcs C-Purlins 2x4 1.2mm + 21 pcs 16mm Plain Bars + 150+ packs Heavy-Duty Tex Screws.',
    details: [
      { name: 'C-Purlins 2x4 1.2mm (Commercial Grade)', qty: '170 pcs', retailVal: 131750 },
      { name: 'Plain Bar 16mm Structural Grade', qty: '21 pcs', retailVal: 9975 },
      { name: 'TEX SCREW FOR METAL #1 (100 pcs/pack)', qty: '106 packs', retailVal: 10600 },
      { name: 'Tex Screw for Wood 2-1/2 (100 pcs/pack)', qty: '51 packs', retailVal: 10200 }
    ],
    targetBuyer: 'General Contractors, Steel Fabricators, Truss & Roofing Builders'
  },
  {
    id: 'plumber-lot',
    name: 'The Master Plumber & Piping Lot',
    badge: 'Highest Savings',
    badgeColor: 'bg-blue-100 text-blue-800 border-blue-300',
    category: 'Plumbing & Fixtures',
    retailValue: 278868,
    lotPrice: 190000,
    savings: 88868,
    discountPercent: 32,
    summary: '181 PPR Gate Valves + Schedule 40 & Samurai GI Pipes + 224 PNS Elbows + 615 pcs Teflon Tape + full fittings stock.',
    details: [
      { name: 'SALE PPR Gate Valve 3/4', qty: '110 pcs', retailVal: 38500 },
      { name: 'SALE PPR Gate Valve 1"', qty: '71 pcs', retailVal: 33902.5 },
      { name: 'GI PIPE S-40 #3/4 & Samurai S-40 3/4', qty: '13 pcs', retailVal: 9880 },
      { name: 'SALE PNS Short Elbow 3/4', qty: '224 pcs', retailVal: 3136 },
      { name: 'SALE Teflon #1 Asstd. (615 rolls)', qty: '615 pcs', retailVal: 9225 },
      { name: 'Chrome Pipe Brackets (Gold & Silver)', qty: '330 pcs', retailVal: 5280 },
      { name: 'Full Plumbing Brass Fixtures & Line Fittings Assortment', qty: '1,400+ pcs', retailVal: 178944.5 }
    ],
    targetBuyer: 'Plumbing Contractors, Sub-contractors, Reseller Hardware Stores'
  },
  {
    id: 'fastener-lot',
    name: 'The Heavy Fastener & Framing Mega-Lot',
    badge: 'Contractor Staple',
    badgeColor: 'bg-emerald-100 text-emerald-800 border-emerald-300',
    category: 'Fasteners & Hardware',
    retailValue: 195475,
    lotPrice: 130000,
    savings: 65475,
    discountPercent: 33.5,
    summary: '500+ kg Concrete & Finishing Nails + 1,500+ packs Blind Rivets + Dyna Bolts + Heavy Screws.',
    details: [
      { name: 'Finishing Nails #1 (Heavy-duty wire)', qty: '176 kg', retailVal: 15840 },
      { name: 'Concrete Nails #2 (Hardened masonry)', qty: '132 kg', retailVal: 13200 },
      { name: 'Concrete Nails #1 & #1-1/2', qty: '220 kg', retailVal: 22000 },
      { name: 'Blind Rivets 1/8 x 1/4 (100 pcs/pack)', qty: '152 packs', retailVal: 15200 },
      { name: 'Blind Rivets 5/32 x 1/4 (100 pcs/pack)', qty: '126 packs', retailVal: 12600 },
      { name: 'Blind Rivets 1/8 x 1/2 (100 pcs/pack)', qty: '116 packs', retailVal: 11600 },
      { name: 'DYNA BOLT 1/4 Masonry Anchors', qty: '114 pcs', retailVal: 1710 },
      { name: 'Remaining Screws, Machine Bolts, Fasteners Assortment', qty: '1,182 packs', retailVal: 103325 }
    ],
    targetBuyer: 'Hardware Resellers, Formwork & Masonry Crews, Framing Contractors'
  },
  {
    id: 'paint-lot',
    name: 'The Commercial Coatings & Finishing Lot',
    badge: 'Turnkey Finishes',
    badgeColor: 'bg-purple-100 text-purple-800 border-purple-300',
    category: 'Paints & Coatings',
    retailValue: 57640,
    lotPrice: 38000,
    savings: 19640,
    discountPercent: 34,
    summary: 'Island primer & gloss paints, 175+ pcs sandpapers, rollers, brushes, and thinners.',
    details: [
      { name: 'Sandpaper # 600 Ultra-Fine Finish', qty: '175 pcs', retailVal: 3500 },
      { name: 'Island Paints Primer & Gloss Cans', qty: '35 gals/qts', retailVal: 32400 },
      { name: 'Brushes, Rollers, Thinners & Coating Tools', qty: '215 pcs', retailVal: 21740 }
    ],
    targetBuyer: 'Painting Subcontractors, Interior Fit-out Contractors'
  },
  {
    id: 'electrical-lot',
    name: 'The Electrical & Pro Accessories Lot',
    badge: 'Fast Turnover',
    badgeColor: 'bg-rose-100 text-rose-800 border-rose-300',
    category: 'Electrical & Lighting / Tools',
    retailValue: 78516,
    lotPrice: 50000,
    savings: 28516,
    discountPercent: 36,
    summary: 'Firefly emergency bulbs (53 pcs), DEWALT drill bits (32 pcs), switches, fixtures, and accessories.',
    details: [
      { name: 'SALE F/Fly Emergency Bulb 12wDL', qty: '53 pcs', retailVal: 14575 },
      { name: 'DEWALT Drillbit 1/2 Commercial Grade', qty: '32 pcs', retailVal: 14720 },
      { name: 'Switches, Plates, Receptacles, Hand Tools', qty: '1,679 pcs', retailVal: 49221 }
    ],
    targetBuyer: 'Electrical Contractors, Maintenance Facilities, Hardware Stores'
  }
];

export const WHOLESALE_TIERS = [
  { minSpend: 25000, discountPercent: 20, promoCode: 'BULK25', label: 'Contractor Tier 1', description: '20% OFF retail on any mix-and-match order above ₱25,000' },
  { minSpend: 50000, discountPercent: 30, promoCode: 'BUILDER', label: 'Builder Tier 2', description: '30% OFF retail on purchases above ₱50,000' },
  { minSpend: 100000, discountPercent: 40, promoCode: 'HARDWARE', label: 'Hardware Reseller Tier 3', description: '40% OFF retail on wholesale purchases above ₱100,000' }
];

export default function App()`;

doReplace('export default function App()', lotsDef, 'Lots Definition');

// 2. Insert lot states
const lotStates = `  const searchInputRef = useRef(null);

  // Commercial Liquidation & Contractor Lots States
  const [selectedLotModal, setSelectedLotModal] = useState(null);
  const [lotCopiedId, setLotCopiedId] = useState(null);
  const [manifestSearchQuery, setManifestSearchQuery] = useState('');
  const [manifestCategoryFilter, setManifestCategoryFilter] = useState('All');`;

doReplace('  const searchInputRef = useRef(null);', lotStates, 'Lot States');

// 3. Update default promos in discounts state
const oldDiscounts = `    const defaultPromos = [
      { code: 'builder', type: 'percentage', value: 35, minSpend: 50000, active: true, description: '35% Contractor & Builder Discount (Min. ₱50,000 spend)' },
      { code: 'hardware', type: 'percentage', value: 40, minSpend: 100000, active: true, description: '40% Hardware Wholesale Discount (Min. ₱100,000 spend)' },
      { code: 'MANNA10', type: 'percentage', value: 10, minSpend: 1000, active: true, description: '10% OFF Min. Spend ₱1k' },
      { code: 'HARDWARE500', type: 'flat', value: 500, minSpend: 5000, active: true, description: '₱500 Flat Voucher' }
    ];`;

const newDiscounts = `    const defaultPromos = [
      { code: 'bulk25', type: 'percentage', value: 20, minSpend: 25000, active: true, description: '20% Contractor Tier 1 Discount (Min. ₱25,000 spend)' },
      { code: 'builder', type: 'percentage', value: 30, minSpend: 50000, active: true, description: '30% Builder Tier 2 Discount (Min. ₱50,000 spend)' },
      { code: 'hardware', type: 'percentage', value: 40, minSpend: 100000, active: true, description: '40% Hardware Reseller Tier 3 Discount (Min. ₱100,000 spend)' },
      { code: 'MANNA10', type: 'percentage', value: 10, minSpend: 1000, active: true, description: '10% OFF Min. Spend ₱1k' },
      { code: 'HARDWARE500', type: 'flat', value: 500, minSpend: 5000, active: true, description: '₱500 Flat Voucher' }
    ];`;

doReplace(oldDiscounts, newDiscounts, 'Discounts Config');

// 4. Update applyPromoCode and add downloadFullManifestCSV
const oldApplyPromo = `  // Promo code application (builder: 35% off at min ₱50k, hardware: 40% off at min ₱100k; works in small caps or all caps)
  const applyPromoCode = (e) => {
    if (e && e.preventDefault) e.preventDefault();
    setPromoMessage({ text: '', type: '' });
    
    if (!promoInput || !promoInput.trim()) {
      setPromoMessage({ text: 'Please enter a promo code (e.g. builder or hardware).', type: 'error' });
      return;
    }

    const clean = promoInput.trim().toLowerCase();
    const found = discounts.find(d => d.code.toLowerCase() === clean && d.active);
    
    if (!found) {
      setPromoMessage({ 
        text: 'Invalid promo code. Active wholesale codes: "builder" (35% OFF, min ₱50K) or "hardware" (40% OFF, min ₱100K). Works in small or all caps.', 
        type: 'error' 
      });
      return;
    }

    if (cartSubtotal < found.minSpend) {
      const needed = found.minSpend - cartSubtotal;
      setPromoMessage({ 
        text: \`Voucher "\${clean.toUpperCase()}" requires a minimum purchase of ₱\${found.minSpend.toLocaleString('en-PH')}. Your current cart is ₱\${cartSubtotal.toLocaleString('en-PH', { minimumFractionDigits: 2 })}. Add ₱\${needed.toLocaleString('en-PH', { minimumFractionDigits: 2 })} more to activate \${found.value}% OFF!\`, 
        type: 'error' 
      });
      return;
    }

    setAppliedPromo(found);
    const savings = found.type === 'percentage' ? (cartSubtotal * (found.value / 100)) : found.value;
    setPromoMessage({ 
      text: \`🎉 Code "\${clean.toUpperCase()}" ACTIVATED! \${found.value}% wholesale discount applied (-₱\${savings.toLocaleString('en-PH', { minimumFractionDigits: 2 })} savings).\`, 
      type: 'success' 
    });
  };`;

const newApplyPromo = `  // Promo code application (bulk25: 20% off at min ₱25k, builder: 30% off at min ₱50k, hardware: 40% off at min ₱100k; case-insensitive)
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
        text: \`Voucher "\${clean.toUpperCase()}" requires a minimum purchase of ₱\${found.minSpend.toLocaleString('en-PH')}. Your current cart is ₱\${cartSubtotal.toLocaleString('en-PH', { minimumFractionDigits: 2 })}. Add ₱\${needed.toLocaleString('en-PH', { minimumFractionDigits: 2 })} more to activate \${found.value}% OFF!\`, 
        type: 'error' 
      });
      return;
    }

    setAppliedPromo(found);
    const savings = found.type === 'percentage' ? (cartSubtotal * (found.value / 100)) : found.value;
    setPromoMessage({ 
      text: \`🎉 Code "\${clean.toUpperCase()}" ACTIVATED! \${found.value}% wholesale discount applied (-₱\${savings.toLocaleString('en-PH', { minimumFractionDigits: 2 })} savings).\`, 
      type: 'success' 
    });
  };

  // Download Full Inventory Manifest CSV for Contractors & Hardware Resellers
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
        \`"\${p.id || ''}"\`,
        \`"\${cleanName}"\`,
        \`"\${cleanCat}"\`,
        \`"\${p.unit || 'pc'}"\`,
        stock,
        price,
        wholesale,
        total
      ];
    });
    const csvContent = [headers.join(','), ...rows.map(r => r.join(','))].join('\\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', \`manna_hardware_liquidation_manifest_\${new Date().toISOString().slice(0, 10)}.csv\`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };`;

doReplace(oldApplyPromo, newApplyPromo, 'Apply Promo Handler');

// 5. Header Navigation
const oldHomeNav = `<button
                onClick={() => setActiveTab('home')}
                className={\`whitespace-nowrap pb-0.5 cursor-pointer flex items-center gap-1 \${
                  activeTab === 'home' ? 'font-bold border-b-2 border-white' : 'opacity-85 hover:opacity-100'
                }\`}
              >
                <Home className="w-3.5 h-3.5" /> Home Feed
              </button>`;

const newHomeNav = `<button
                onClick={() => setActiveTab('home')}
                className={\`whitespace-nowrap pb-0.5 cursor-pointer flex items-center gap-1 \${
                  activeTab === 'home' ? 'font-bold border-b-2 border-white' : 'opacity-85 hover:opacity-100'
                }\`}
              >
                <Home className="w-3.5 h-3.5" /> Home Feed
              </button>

              {/* WHOLESALE CONTRACTOR LOTS (30-40% OFF) */}
              <button
                onClick={() => setActiveTab('lots')}
                className={\`whitespace-nowrap px-2.5 py-0.5 rounded cursor-pointer flex items-center gap-1.5 font-black transition-all \${
                  activeTab === 'lots' 
                    ? 'bg-amber-400 text-slate-950 shadow-md ring-2 ring-white/80' 
                    : 'bg-amber-500/90 text-white hover:bg-amber-400 hover:text-slate-950'
                }\`}
              >
                <Flame className="w-3.5 h-3.5 text-red-600 animate-pulse" /> WHOLESALE LOTS (30-40% OFF)
              </button>`;

doReplace(oldHomeNav, newHomeNav, 'Header Nav Strip');

// 6. Home Promo Banner
const oldHomeBanner = `<div className="bg-gradient-to-r from-amber-500 to-[#EE4D2D] text-white p-3 rounded-md mb-3 flex flex-wrap items-center justify-between gap-2 shadow-xs">
              <div className="flex items-center gap-2 text-xs sm:text-sm">
                <Tag className="w-4 h-4 shrink-0" />
                <span>Special Wholesale Promo: Use code <strong className="underline uppercase font-black">builder</strong> for 35% OFF (Min. ₱50K) or <strong className="underline uppercase font-black">hardware</strong> for 40% OFF (Min. ₱100K)! <span className="opacity-90 text-[11px] font-normal">(Works in small or all caps)</span></span>
              </div>
              <button 
                onClick={() => { setActiveTab('checkout'); setIsCartOpen(true); }} 
                className="bg-white text-[#EE4D2D] text-xs font-black px-3 py-1 rounded shadow-xs shrink-0 cursor-pointer hover:bg-orange-50"
              >
                Apply Voucher
              </button>
            </div>`;

const newHomeBanner = `<div className="bg-gradient-to-r from-slate-900 via-red-950 to-orange-950 text-white p-3.5 sm:p-4 rounded-xl mb-4 border border-amber-500/30 shadow-md">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
                <div className="flex items-start sm:items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-amber-500/20 text-amber-400 border border-amber-500/40 flex items-center justify-center shrink-0">
                    <Flame className="w-6 h-6 animate-pulse text-amber-400" />
                  </div>
                  <div>
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="bg-amber-500 text-slate-950 text-[10px] font-black uppercase px-2 py-0.5 rounded tracking-wider">
                        Commercial Warehouse Clearance
                      </span>
                      <span className="text-amber-300 text-xs font-bold">
                        Almost ₱1M Total Stock at 20%–40% Wholesale Rates
                      </span>
                    </div>
                    <p className="text-xs text-slate-200 mt-1">
                      Direct liquidation for contractors, fabricators & hardware stores. Available in curated <strong>Specialty Category Lots</strong> or mix-and-match volume tiers (<span className="text-amber-300 font-semibold">₱25k = 20% OFF</span>, <span className="text-amber-300 font-semibold">₱50k = 30% OFF</span>, <span className="text-amber-300 font-semibold">₱100k = 40% OFF</span>).
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2 shrink-0 self-end sm:self-auto">
                  <button 
                    onClick={() => setActiveTab('lots')} 
                    className="bg-amber-400 hover:bg-amber-300 text-slate-950 text-xs font-black px-4 py-2 rounded-lg shadow-sm cursor-pointer transition-all flex items-center gap-1.5 active:scale-95"
                  >
                    <Package className="w-4 h-4" /> Browse Buyout Lots
                  </button>
                  <button 
                    onClick={() => { setActiveTab('checkout'); setIsCartOpen(true); }} 
                    className="bg-white/10 hover:bg-white/20 text-white text-xs font-bold px-3 py-2 rounded-lg cursor-pointer transition-all border border-white/20"
                  >
                    Apply Bulk Code
                  </button>
                </div>
              </div>
            </div>`;

doReplace(oldHomeBanner, newHomeBanner, 'Home Banner');

// 7. Insert Lots View
const catalogTabHeader = `{/* ==================== TAB 2: PUBLIC "FULL CATALOG" (USER REQUESTED) ==================== */}
        {activeTab === 'catalog' && (`;

const lotsView = `{/* ==================== TAB: B2B WHOLESALE LOTS & COMMERCIAL LIQUIDATION ==================== */}
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
                    📍 Cabalwan / Abucay Warehouse, Tacloban City
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
                    Direct liquidation of commercial-grade hardware supplies and construction materials. Available in pre-packaged <strong>Specialty Category Lots</strong> or tiered bulk orders at <strong>20% to 40% below retail</strong> for general contractors, engineering firms, and hardware store resellers.
                  </p>
                </div>

                {/* Live Liquidation Metrics Grid */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-5 pt-5 border-t border-white/10">
                  <div className="bg-white/5 backdrop-blur-xs p-3 rounded-xl border border-white/10">
                    <p className="text-[10px] text-slate-400 font-medium uppercase tracking-wider">Total Inventory Value</p>
                    <p className="text-lg sm:text-xl font-black text-amber-400 mt-0.5">₱947,704</p>
                    <p className="text-[10px] text-slate-400">465 Verified SKUs</p>
                  </div>
                  <div className="bg-white/5 backdrop-blur-xs p-3 rounded-xl border border-white/10">
                    <p className="text-[10px] text-slate-400 font-medium uppercase tracking-wider">Physical Units</p>
                    <p className="text-lg sm:text-xl font-black text-white mt-0.5">10,269 pcs</p>
                    <p className="text-[10px] text-slate-400">On-floor ready to haul</p>
                  </div>
                  <div className="bg-white/5 backdrop-blur-xs p-3 rounded-xl border border-white/10">
                    <p className="text-[10px] text-slate-400 font-medium uppercase tracking-wider">Volume Discount</p>
                    <p className="text-lg sm:text-xl font-black text-emerald-400 mt-0.5">Up to 40% OFF</p>
                    <p className="text-[10px] text-slate-400">₱25k / ₱50k / ₱100k Tiers</p>
                  </div>
                  <div className="bg-white/5 backdrop-blur-xs p-3 rounded-xl border border-white/10">
                    <p className="text-[10px] text-slate-400 font-medium uppercase tracking-wider">Dispatch Hotline</p>
                    <a href="tel:09178829912" className="text-base sm:text-lg font-black text-white hover:text-amber-400 mt-0.5 block truncate">
                      0917-882-9912
                    </a>
                    <p className="text-[10px] text-slate-400">Viber / Calls Open 8AM-5PM</p>
                  </div>
                </div>

                <div className="flex flex-wrap items-center gap-3 mt-5">
                  <button
                    onClick={downloadFullManifestCSV}
                    className="bg-amber-400 hover:bg-amber-300 text-slate-950 font-black px-4 py-2 rounded-lg text-xs flex items-center gap-2 cursor-pointer shadow-sm transition-all active:scale-95"
                  >
                    <Download className="w-4 h-4" /> Download Complete Manifest (CSV)
                  </button>
                  <a
                    href="https://wa.me/639178829912?text=Good%20day.%20I%20am%20a%20contractor%20/%20hardware%20buyer%20interested%20in%20inspecting%20your%20commercial%20liquidation%20lots.%20Please%20send%20schedule%20and%20terms."
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
                <span className="text-[11px] font-bold text-slate-500 bg-slate-100 px-3 py-1 rounded-full w-fit">
                  As-Is, Where-Is • Cash Before Load
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
                          <span className={\`text-[10px] font-black uppercase px-2 py-0.5 rounded border \${lot.badgeColor}\`}>
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
                        {/* Pricing Box */}
                        <div className="bg-slate-900 text-white p-3.5 rounded-xl mb-3 flex items-center justify-between">
                          <div>
                            <span className="text-[10px] text-slate-400 block line-through">
                              Retail ₱{lot.retailValue.toLocaleString('en-PH')}
                            </span>
                            <span className="text-lg font-black text-emerald-400">
                              ₱{lot.lotPrice.toLocaleString('en-PH')}
                            </span>
                            <span className="text-[10px] text-slate-300 block">Spot Cash Buyout</span>
                          </div>
                          <div className="text-right">
                            <span className="bg-emerald-500/20 text-emerald-300 text-[11px] font-black px-2 py-0.5 rounded border border-emerald-500/30">
                              SAVE ₱{lot.savings.toLocaleString('en-PH')}
                            </span>
                            <span className="text-[10px] text-slate-400 block mt-0.5">
                              ~{lot.discountPercent}% Off Retail
                            </span>
                          </div>
                        </div>

                        {/* Actions */}
                        <div className="grid grid-cols-2 gap-2">
                          <button
                            onClick={() => setSelectedLotModal(lot)}
                            className="bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-bold py-2 px-3 rounded-lg cursor-pointer transition-colors text-center"
                          >
                            View Manifest
                          </button>
                          <a
                            href={\`https://wa.me/639178829912?text=Hello%20Manna%20Hardware.%20I%20am%20interested%20in%20reserving%20\${encodeURIComponent(lot.name)}%20for%20₱\${lot.lotPrice.toLocaleString('en-PH')}.%20Please%20confirm%20availability%20and%20inspection%20schedule.\`}
                            target="_blank"
                            rel="noreferrer"
                            className="bg-[#EE4D2D] hover:bg-[#d73f20] text-white text-xs font-black py-2 px-3 rounded-lg cursor-pointer transition-colors text-center shadow-xs"
                          >
                            Reserve Lot
                          </a>
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
                  Need specific SKUs instead of an entire category lot? Mix and match any items from our 465-item catalog and automatically trigger wholesale volume tier discounts.
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
                    <FileSpreadsheet className="w-5 h-5 text-[#EE4D2D]" /> Complete 465-SKU Warehouse Liquidation Manifest
                  </h3>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Search on-floor physical counts, retail benchmark prices, and 40% Tier 3 wholesale rates across all active inventory.
                  </p>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={downloadFullManifestCSV}
                    className="bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold px-3 py-1.5 rounded-lg cursor-pointer flex items-center gap-1.5 shadow-2xs transition-colors shrink-0"
                  >
                    <Download className="w-3.5 h-3.5" /> Export Manifest (CSV)
                  </button>
                </div>
              </div>

              {/* Manifest Search & Category Filters */}
              <div className="flex flex-col sm:flex-row gap-3 mb-4">
                <div className="relative flex-1">
                  <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    placeholder="Search 465 manifest items (e.g. C-Purlins, PPR, GI Pipe, Rivets)..."
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

              {/* Manifest Data Table */}
              <div className="overflow-x-auto border border-slate-200 rounded-xl max-h-[500px] overflow-y-auto">
                <table className="w-full text-left text-xs border-collapse">
                  <thead className="bg-slate-100 text-slate-700 font-bold sticky top-0 z-10 border-b border-slate-200">
                    <tr>
                      <th className="py-2.5 px-3">SKU</th>
                      <th className="py-2.5 px-3">Product Description</th>
                      <th className="py-2.5 px-3">Category</th>
                      <th className="py-2.5 px-3 text-right">Physical Stock</th>
                      <th className="py-2.5 px-3 text-right">Retail Unit</th>
                      <th className="py-2.5 px-3 text-right text-emerald-700">40% Wholesale</th>
                      <th className="py-2.5 px-3 text-right">Line Valuation</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 text-slate-700">
                    {products
                      .filter(p => {
                        const matchCat = manifestCategoryFilter === 'All' || p.category === manifestCategoryFilter;
                        if (!matchCat) return false;
                        if (!manifestSearchQuery) return true;
                        const q = manifestSearchQuery.toLowerCase();
                        return (p.name || '').toLowerCase().includes(q) || (p.id || '').toLowerCase().includes(q);
                      })
                      .slice(0, 150)
                      .map((item) => {
                        const stock = Math.max(0, Number(item.stock) || 0);
                        const price = Number(item.price) || 0;
                        const wholesale = Math.round(price * 0.60 * 100) / 100;
                        const lineVal = price * stock;
                        return (
                          <tr key={item.id} className="hover:bg-amber-50/40 transition-colors">
                            <td className="py-2 px-3 font-mono text-[11px] text-slate-500">{item.id}</td>
                            <td className="py-2 px-3 font-medium text-slate-900">{item.name}</td>
                            <td className="py-2 px-3 text-slate-500 text-[11px]">{item.category}</td>
                            <td className="py-2 px-3 text-right font-bold text-slate-900">
                              {stock} <span className="text-[10px] font-normal text-slate-500">{item.unit || 'pc'}</span>
                            </td>
                            <td className="py-2 px-3 text-right font-medium">₱{price.toLocaleString('en-PH')}</td>
                            <td className="py-2 px-3 text-right font-bold text-emerald-700">₱{wholesale.toLocaleString('en-PH')}</td>
                            <td className="py-2 px-3 text-right font-bold text-slate-900">₱{lineVal.toLocaleString('en-PH')}</td>
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
                  <p className="text-[11px] text-slate-400">Visit our Cabalwan facility (8AM-5PM) to verify steel gauges, valves, and physical packaging.</p>
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

        ${catalogTabHeader}`;

doReplace(catalogTabHeader, lotsView, 'Lots View Component');

// 8. Update mobile bottom navigation
const oldBottomNav = `<div className="grid grid-cols-5 text-center">
          
          {/* Tab 1: Home */}
          <button
            onClick={() => setActiveTab('home')}
            className={\`flex flex-col items-center justify-center py-1 transition-colors cursor-pointer \${
              activeTab === 'home' ? 'text-[#EE4D2D]' : 'text-[#757575]'
            }\`}
          >
            <Home className="w-5 h-5 stroke-[1.8]" />
            <span className="text-[10px] font-normal mt-0.5">Home</span>
          </button>

          {/* Tab 2: Full Catalog */}
          <button
            onClick={() => setActiveTab('catalog')}
            className={\`flex flex-col items-center justify-center py-1 transition-colors cursor-pointer \${
              activeTab === 'catalog' ? 'text-[#EE4D2D] font-bold' : 'text-[#757575]'
            }\`}
          >
            <Layers className="w-5 h-5 stroke-[1.8]" />
            <span className="text-[10px] font-normal mt-0.5">Catalog</span>
          </button>

          {/* Tab 3: Live */}
          <button
            onClick={() => setActiveTab('live')}
            className={\`flex flex-col items-center justify-center py-1 transition-colors cursor-pointer \${
              activeTab === 'live' ? 'text-[#EE4D2D]' : 'text-[#757575]'
            }\`}
          >
            <Tv className="w-5 h-5 stroke-[1.8]" />
            <span className="text-[10px] font-normal mt-0.5">Live</span>
          </button>`;

const newBottomNav = `<div className="grid grid-cols-5 text-center">
          
          {/* Tab 1: Home */}
          <button
            onClick={() => setActiveTab('home')}
            className={\`flex flex-col items-center justify-center py-1 transition-colors cursor-pointer \${
              activeTab === 'home' ? 'text-[#EE4D2D] font-bold' : 'text-[#757575]'
            }\`}
          >
            <Home className="w-5 h-5 stroke-[1.8]" />
            <span className="text-[10px] mt-0.5">Home</span>
          </button>

          {/* Tab 2: Wholesale Lots */}
          <button
            onClick={() => setActiveTab('lots')}
            className={\`flex flex-col items-center justify-center py-1 transition-colors cursor-pointer relative \${
              activeTab === 'lots' ? 'text-amber-600 font-black' : 'text-amber-700'
            }\`}
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
            className={\`flex flex-col items-center justify-center py-1 transition-colors cursor-pointer \${
              activeTab === 'catalog' ? 'text-[#EE4D2D] font-bold' : 'text-[#757575]'
            }\`}
          >
            <Layers className="w-5 h-5 stroke-[1.8]" />
            <span className="text-[10px] font-normal mt-0.5">Catalog</span>
          </button>`;

doReplace(oldBottomNav, newBottomNav, 'Mobile Bottom Nav');

// 9. Insert selectedLotModal dialog
const oldConfirmModal = `{/* 20 Frontend Polish: Confirmation Dialog for Destructive Actions */}
      {confirmModal.isOpen && (`;

const lotModalDialog = `{/* ==================== CONTRACTOR LOT INSPECTION & RESERVATION MODAL ==================== */}
      {selectedLotModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 overflow-y-auto">
          <div className="w-full max-w-xl bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden my-auto">
            {/* Header */}
            <div className="bg-gradient-to-r from-slate-950 via-slate-900 to-red-950 text-white p-5 flex items-start justify-between">
              <div>
                <div className="flex items-center gap-2 mb-1.5">
                  <span className={\`text-[10px] font-black uppercase px-2 py-0.5 rounded border \${selectedLotModal.badgeColor}\`}>
                    {selectedLotModal.badge}
                  </span>
                  <span className="text-xs text-amber-300 font-bold">
                    Specialty Category Lot
                  </span>
                </div>
                <h3 className="text-lg sm:text-xl font-black text-white">
                  {selectedLotModal.name}
                </h3>
                <p className="text-xs text-slate-300 mt-1">
                  {selectedLotModal.summary}
                </p>
              </div>
              <button
                onClick={() => setSelectedLotModal(null)}
                className="text-white/70 hover:text-white p-1 rounded-lg hover:bg-white/10 cursor-pointer transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Body */}
            <div className="p-5 max-h-[60vh] overflow-y-auto space-y-4">
              {/* Valuation vs Lot Price Summary */}
              <div className="bg-amber-50 rounded-xl p-4 border border-amber-200 flex flex-wrap items-center justify-between gap-3">
                <div>
                  <span className="text-[11px] text-slate-500 line-through block">
                    Total Retail Valuation: ₱{selectedLotModal.retailValue.toLocaleString('en-PH')}
                  </span>
                  <span className="text-2xl font-black text-slate-900">
                    ₱{selectedLotModal.lotPrice.toLocaleString('en-PH')}
                  </span>
                  <span className="text-[11px] text-emerald-700 font-bold block">
                    Spot Cash / Direct Buyout Price
                  </span>
                </div>
                <div className="text-right">
                  <span className="bg-emerald-600 text-white text-xs font-black px-2.5 py-1 rounded-md shadow-2xs">
                    SAVE ₱{selectedLotModal.savings.toLocaleString('en-PH')}
                  </span>
                  <span className="text-xs text-slate-600 block mt-1 font-semibold">
                    ~{selectedLotModal.discountPercent}% OFF Retail
                  </span>
                </div>
              </div>

              {/* Itemized Manifest Breakdown */}
              <div>
                <h4 className="font-bold text-xs text-slate-800 uppercase tracking-wider mb-2 flex items-center justify-between">
                  <span>Included Items & Manifest Breakdown:</span>
                  <span className="text-slate-500 font-normal">{selectedLotModal.details.length} line items</span>
                </h4>
                <div className="border border-slate-200 rounded-xl overflow-hidden text-xs">
                  <table className="w-full text-left">
                    <thead className="bg-slate-100 text-slate-700 font-bold border-b border-slate-200">
                      <tr>
                        <th className="py-2 px-3">Description</th>
                        <th className="py-2 px-3 text-right">Physical Quantity</th>
                        <th className="py-2 px-3 text-right">Retail Value</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 text-slate-700">
                      {selectedLotModal.details.map((item, idx) => (
                        <tr key={idx} className="hover:bg-slate-50">
                          <td className="py-2 px-3 font-medium text-slate-900">{item.name}</td>
                          <td className="py-2 px-3 text-right font-bold">{item.qty}</td>
                          <td className="py-2 px-3 text-right text-slate-600">₱{item.retailVal.toLocaleString('en-PH')}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Terms */}
              <div className="bg-slate-50 rounded-xl p-3 border border-slate-200 text-slate-600 text-xs space-y-1">
                <p className="font-bold text-slate-900">Buyout & Pickup Conditions:</p>
                <p>• <strong>Inspection:</strong> Open 8:00 AM – 5:00 PM at Cabalwan / Abucay Warehouse, Tacloban City.</p>
                <p>• <strong>Payment:</strong> 100% Manager's Check, Real-time PesoNet / InstaPay bank transfer, or cash prior to hauling.</p>
                <p>• <strong>Trucking:</strong> Buyer provides transport, or dispatch team can assist with local haulers.</p>
              </div>
            </div>

            {/* Footer Buttons */}
            <div className="p-4 bg-slate-50 border-t border-slate-200 flex flex-wrap items-center justify-between gap-2">
              <button
                onClick={() => {
                  const brief = \`\${selectedLotModal.name}\\nBuyout Price: ₱\${selectedLotModal.lotPrice.toLocaleString('en-PH')} (Retail: ₱\${selectedLotModal.retailValue.toLocaleString('en-PH')})\\nSavings: ₱\${selectedLotModal.savings.toLocaleString('en-PH')}\\nWarehouse: Cabalwan, Tacloban City\\nDispatch Hotline: 0917-882-9912\`;
                  navigator.clipboard.writeText(brief);
                  setLotCopiedId(selectedLotModal.id);
                  setTimeout(() => setLotCopiedId(null), 2500);
                }}
                className="bg-white hover:bg-slate-100 text-slate-700 border border-slate-300 font-bold px-3 py-2 rounded-lg text-xs flex items-center gap-1.5 cursor-pointer"
              >
                {lotCopiedId === selectedLotModal.id ? (
                  <>
                    <Check className="w-3.5 h-3.5 text-emerald-600" /> Copied Brief!
                  </>
                ) : (
                  <>
                    <Copy className="w-3.5 h-3.5" /> Copy Deal Brief
                  </>
                )}
              </button>

              <div className="flex items-center gap-2">
                <a
                  href="tel:09178829912"
                  className="bg-slate-900 hover:bg-slate-800 text-white font-bold px-3.5 py-2 rounded-lg text-xs flex items-center gap-1.5 cursor-pointer transition-colors"
                >
                  <Phone className="w-3.5 h-3.5" /> Call Dispatch
                </a>
                <a
                  href={\`https://wa.me/639178829912?text=Hello%20Manna%20Hardware%20Dispatch.%20I%20am%20interested%20in%20inspecting%20and%20reserving%20\${encodeURIComponent(selectedLotModal.name)}%20for%20₱\${selectedLotModal.lotPrice.toLocaleString('en-PH')}.%20Please%20confirm%20availability%20and%20schedule.\`}
                  target="_blank"
                  rel="noreferrer"
                  className="bg-emerald-600 hover:bg-emerald-500 text-white font-black px-4 py-2 rounded-lg text-xs flex items-center gap-1.5 cursor-pointer shadow-sm transition-all"
                >
                  <MessageCircle className="w-3.5 h-3.5" /> Reserve via Viber / WhatsApp
                </a>
              </div>
            </div>
          </div>
        </div>
      )}

      \${oldConfirmModal}`;

doReplace(oldConfirmModal, lotModalDialog, 'Lot Modal Dialog');

// Restore original line ending style if needed
if (hasCRLF) {
  content = content.replace(/\n/g, '\r\n');
}

fs.writeFileSync(targetPath, content, 'utf8');
console.log('ALL STEPS APPLIED AND SAVED TO App.jsx SUCCESSFULLY!');
