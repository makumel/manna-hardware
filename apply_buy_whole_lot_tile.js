const fs = require('fs');
const path = require('path');

const targetPath = path.join(__dirname, 'storefront-app', 'src', 'App.jsx');
let content = fs.readFileSync(targetPath, 'utf8');

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

// 1. Add buyWholeLot right after addToCart
const oldAddToCart = `  // Cart actions
  const addToCart = (product, qty = 1) => {
    if (product.stock <= 0) return;
    setCart(prev => {
      const existing = prev.find(item => item.id === product.id);
      if (existing) {
        return prev.map(item => item.id === product.id ? { ...item, quantity: item.quantity + qty } : item);
      }
      return [...prev, { ...product, quantity: qty }];
    });
  };`;

const newAddToCart = `  // Cart actions
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
      id: \`LOT-\${lot.id.toUpperCase()}\`,
      name: \`\${lot.name} [WHOLE LOT PACKAGE]\`,
      category: lot.category,
      unit: 'Complete Specialty Lot Package',
      price: lot.lotPrice,
      originalPrice: lot.retailValue,
      stock: 1,
      image: lotImageMap[lot.id] || 'https://images.pexels.com/photos/175039/pexels-photo-175039.jpeg?auto=compress&cs=tinysrgb&h=650&w=940',
      description: \`\${lot.summary} (Total Retail Value: ₱\${lot.retailValue.toLocaleString('en-PH')}. Instant Wholesale Savings: ₱\${lot.savings.toLocaleString('en-PH')})\`,
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
  };`;

doReplace(oldAddToCart, newAddToCart, 'Add buyWholeLot function');

// 2. Update Lot Cards actions to include the One-Button Tile
const oldLotActions = `                        {/* Actions */}
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
                        </div>`;

const newLotActions = `                        {/* Primary One-Button Tile to Buy Whole Lot */}
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
                              href={\`https://wa.me/639178829912?text=Hello%20Manna%20Hardware.%20I%20am%20ready%20to%20buy%20\${encodeURIComponent(lot.name)}%20for%20₱\${lot.lotPrice.toLocaleString('en-PH')}.%20Please%20send%20payment%20instructions%20and%20hauling%20schedule.\`}
                              target="_blank"
                              rel="noreferrer"
                              className="bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold py-2 px-2.5 rounded-lg cursor-pointer transition-colors text-center shadow-xs flex items-center justify-center gap-1"
                            >
                              <MessageCircle className="w-3.5 h-3.5" /> Viber Buy
                            </a>
                          </div>
                        </div>`;

doReplace(oldLotActions, newLotActions, 'Lot One-Button Tile Action');

// 3. Update SelectedLotModal to also have the One-Click Buy Tile
const oldModalButtons = `              <div className="flex items-center gap-2">
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
              </div>`;

const newModalButtons = `              <div className="flex flex-wrap items-center gap-2">
                <a
                  href="tel:09178829912"
                  className="bg-slate-800 hover:bg-slate-700 text-white font-bold px-3 py-2 rounded-lg text-xs flex items-center gap-1 cursor-pointer transition-colors"
                >
                  <Phone className="w-3.5 h-3.5" /> Call
                </a>
                <a
                  href={\`https://wa.me/639178829912?text=Hello%20Manna%20Hardware%20Dispatch.%20I%20am%20interested%20in%20inspecting%20and%20reserving%20\${encodeURIComponent(selectedLotModal.name)}%20for%20₱\${selectedLotModal.lotPrice.toLocaleString('en-PH')}.%20Please%20confirm%20availability%20and%20schedule.\`}
                  target="_blank"
                  rel="noreferrer"
                  className="bg-emerald-600 hover:bg-emerald-500 text-white font-bold px-3 py-2 rounded-lg text-xs flex items-center gap-1 cursor-pointer shadow-2xs transition-all"
                >
                  <MessageCircle className="w-3.5 h-3.5" /> Viber
                </a>
                <button
                  onClick={() => buyWholeLot(selectedLotModal)}
                  className="bg-gradient-to-r from-amber-500 to-[#EE4D2D] hover:from-amber-600 hover:to-[#d73f20] text-white font-black px-4 py-2 rounded-lg text-xs flex items-center gap-1.5 cursor-pointer shadow-md transition-all active:scale-95"
                >
                  <ShoppingCart className="w-4 h-4 stroke-[2.5]" />
                  <span>Buy Whole Lot (₱{selectedLotModal.lotPrice.toLocaleString('en-PH')})</span>
                </button>
              </div>`;

doReplace(oldModalButtons, newModalButtons, 'Modal One-Button Tile Action');

// 4. Cart drawer highlight for whole lot items
const oldCartItemDetails = `<p className="font-bold text-xs text-slate-900 truncate">{item.name}</p>
                      <p className="text-[11px] text-slate-500">Unit: {item.unit}</p>`;

const newCartItemDetails = `<p className="font-bold text-xs text-slate-900 truncate">{item.name}</p>
                      {item.isWholeLot && (
                        <span className="inline-block bg-emerald-100 text-emerald-800 border border-emerald-300 font-black text-[9px] uppercase px-1.5 py-0.5 rounded mt-0.5 mb-1">
                          ✨ WHOLE LOT CLEARANCE • SAVE ₱{item.savings?.toLocaleString('en-PH')}
                        </span>
                      )}
                      <p className="text-[11px] text-slate-500">Unit: {item.unit}</p>`;

doReplace(oldCartItemDetails, newCartItemDetails, 'Cart Whole Lot Badge');

if (hasCRLF) {
  content = content.replace(/\n/g, '\r\n');
}

fs.writeFileSync(targetPath, content, 'utf8');
console.log('Successfully added One-Button Tile to Buy Whole Lot across Plumber, Structural, Electrical, Paint, and Fasteners!');
