const fs = require('fs');

const catalog = JSON.parse(fs.readFileSync('catalog.json', 'utf8'));
const images = JSON.parse(fs.readFileSync('real_hardware_images.json', 'utf8'));

// Helper to find best matching verified image
function matchImage(item) {
  const n = item.name.toLowerCase();

  // Paints & Coatings specific matching
  if (n.includes('island paint qde pink') || (n.includes('qde') && n.includes('pink'))) {
    return images["Island Paint QDE Pink Philippines"][0];
  }
  if (n.includes('nile green')) {
    return images["Island Paint QDE Nile Green Philippines"][0];
  }
  if (n.includes("int'l red") || n.includes('international red')) {
    return images["Island Paint QDE International Red Philippines"][0];
  }
  if (n.includes('signal red') || n.includes('v. red')) {
    return images["Island Paint QDE Signal Red Philippines"][0];
  }
  if (n.includes('primer red ox') || n.includes('red oxide') || n.includes('metal primer')) {
    return images["Island Primer Red Oxide Philippines"][0];
  }
  if (n.includes('baguio green') || (n.includes('roofkote') && n.includes('green'))) {
    return images["Boysen Roofkote Baguio Green Philippines"][0];
  }
  if (n.includes('nut brown') || n.includes('chocolate brown')) {
    return images["Boysen Roofkote Nut Brown Philippines"][0];
  }
  if (n.includes('clear blue') || n.includes('pacific blue')) {
    return images["Boysen Roofkote Clear Blue Philippines"][0];
  }
  if (n.includes('acrytex')) {
    return images["Boysen Acrytex Cast Philippines"][0];
  }
  if (n.includes('clear gloss lacquer') || n.includes('lacquer')) {
    return images["Boysen Clear Gloss Lacquer Philippines"][0];
  }
  if (n.includes('permacoat') || n.includes('flat latex') || n.includes('semi-gloss latex')) {
    return images["Boysen Permacoat Flat Latex White Philippines"][0];
  }
  if (n.includes('elastomer')) {
    return images["Star Elastomer Paint Philippines"][0];
  }
  if (n.includes('stikwel')) {
    return images["Stikwel Wood Glue Philippines"][0];
  }
  if (n.includes('roller brush') || n.includes('roller')) {
    return images["Paint Roller Brush with Tray Philippines"][0];
  }
  if (n.includes('otc') || n.includes('tinting')) {
    if (n.includes('island')) return images["Island Oil Tinting Color Philippines"][0];
    return images["Boysen Oil Tinting Colors OTC Philippines"][0];
  }
  if (n.includes('qde') || n.includes('enamel') || item.category === 'Paints & Coatings') {
    return images["Island Paint QDE Nile Green Philippines"][0];
  }

  // Steel & Structural
  if (n.includes('c-purlin') || n.includes('purlin')) {
    return images["C-purlins Philippines"][0];
  }
  if (n.includes('angle bar')) {
    return images["Angle Bar Steel Philippines"][0];
  }
  if (n.includes('plain bar') || n.includes('deformed bar') || n.includes('round bar')) {
    return images["Plain Bar 16mm Steel Philippines"][0];
  }
  if (n.includes('i-bar') || n.includes('t-bar')) {
    return images["Steel T-Bar I-Bar Construction Philippines"][0];
  }
  if (n.includes('polycarbonate')) {
    return images["Polycarbonate Roofing Sheet Twinwall Philippines"][0];
  }

  // Plumbing Fixtures & Shark / Lamco
  if (n.includes('shark') || n.includes('shower') || n.includes('rosco')) {
    if (n.includes('rosco') || n.includes('telephone')) return images["Rosco Telephone Shower Set Philippines"][0];
    return images["Shark Faucet Shower Plumbing Philippines"][0];
  }
  if (n.includes('faucet') || n.includes('gooseneck') || n.includes('sink faucet')) {
    return images["Gooseneck Kitchen Faucet Flexible Philippines"][0];
  }
  if (n.includes('kitchen sink') || n.includes('sink')) {
    return images["Stainless Steel Kitchen Sink Single Bowl Philippines"][0];
  }
  if (n.includes('floor drain') || n.includes('strainer') || n.includes('drain')) {
    return images["Stainless Steel Floor Drain Trap Philippines"][0];
  }
  if (n.includes('pitcher pump') || n.includes('champion') || n.includes('pump')) {
    return images["Pitcher Pump Champion Philippines"][0];
  }
  if (n.includes('pressure switch')) {
    return images["Water Pump Pressure Switch Square D Philippines"][0];
  }
  if (n.includes('teflon')) {
    return images["Teflon Thread Seal Tape Philippines"][0];
  }
  if (n.includes('gi pipe') || n.includes('samurai')) {
    return images["GI Pipe Samurai Schedule 40 Philippines"][0];
  }
  if (n.includes('gi nipple') || n.includes('nipple')) {
    return images["Galvanized Iron GI Nipple Fittings Philippines"][0];
  }
  if (n.includes('hose clamp')) {
    return images["Stainless Steel Hose Clamp Philippines"][0];
  }
  if (n.includes('lpg hose')) {
    return images["LPG Gas Hose Heavy Duty Philippines"][0];
  }
  if (n.includes('lavatory hose') || n.includes('flexible hose') || n.includes('lamco')) {
    return images["Lavatory Hose LAMCO Philippines"][0];
  }
  if (n.includes('hose coupling') || n.includes('coupling')) {
    if (n.includes('emt')) return images["EMT Conduit Coupling Electrical Philippines"][0];
    return images["Hose Coupling Metal Philippines"][0];
  }

  // PVC Blue Fittings
  if (n.includes('pvc blue elbow') || n.includes('elbow')) {
    return images["PVC Blue Elbow 90 Degree Philippines"][0];
  }
  if (n.includes('pvc blue tee') || n.includes('tee')) {
    return images["PVC Blue Tee Fitting Philippines"][0];
  }
  if (n.includes('pvc blue male adaptor') || n.includes('male adaptor')) {
    return images["PVC Blue Male Adaptor Philippines"][0];
  }
  if (n.includes('pvc blue union') || n.includes('union')) {
    return images["PVC Blue Union Patente Philippines"][0];
  }
  if (n.includes('pvc blue plug') || n.includes('end cap') || n.includes('plug')) {
    return images["PVC Blue End Cap Philippines"][0];
  }
  if (n.includes('check valve')) {
    return images["Swing Check Valve Brass Philippines"][0];
  }
  if (n.includes('foot valve')) {
    return images["Foot Valve Brass Plumbing Philippines"][0];
  }
  if (n.includes('gate valve')) {
    return images["Gate Valve Brass Philippines"][0];
  }
  if (n.includes('ball valve')) {
    return images["PVC Ball Valve Industrial Philippines"][0];
  }

  // Fasteners & Locks
  if (n.includes('amerilock') || n.includes('piano hinge') || n.includes('hinge')) {
    return images["Amerilock Hinges Lockset Philippines"][0];
  }
  if (n.includes('gypsum screw')) {
    return images["Gypsum Screw Black Philippines"][0];
  }
  if (n.includes('tek screw') || n.includes('tex screw')) {
    return images["Tek Screw Self Drilling Hex Head Philippines"][0];
  }
  if (n.includes('blind rivet') || n.includes('rivet')) {
    return images["Blind Rivets Aluminum Philippines"][0];
  }
  if (n.includes('concrete nail')) {
    return images["Concrete Nails Philippines"][0];
  }
  if (n.includes('finishing nail') || n.includes('nail')) {
    return images["Finishing Nails Philippines"][0];
  }
  if (n.includes('hasp') || n.includes('lock')) {
    return images["Safety Hasp and Staple Door Lock Philippines"][0];
  }
  if (n.includes('hook & eye') || n.includes('hook')) {
    return images["Hook and Eye Brass Hardware Philippines"][0];
  }
  if (n.includes('door spring') || n.includes('spring')) {
    return images["Screen Door Spring Heavy Duty Philippines"][0];
  }

  // Tools & Abrasives
  if (n.includes('makita') || n.includes('plainer blade') || n.includes('planer blade')) {
    return images["Makita Planer Blade Philippines"][0];
  }
  if (n.includes('dewalt') || n.includes('drill bit') || n.includes('dormer')) {
    return images["Dewalt Drill Bit Philippines"][0];
  }
  if (n.includes('cup brush')) {
    return images["Wire Cup Brush Angle Grinder Philippines"][0];
  }
  if (n.includes('flap disk') || n.includes('diamond c-disc') || n.includes('cutting disc')) {
    return images["Diamond Cutting Disc Angle Grinder Philippines"][0];
  }
  if (n.includes('sandpaper')) {
    return images["Waterproof Silicon Carbide Sandpaper Philippines"][0];
  }
  if (n.includes('carborandum') || n.includes('carburandum') || n.includes('sharpening stone')) {
    return images["Carborundum Sharpening Stone Philippines"][0];
  }
  if (n.includes('pliers') || n.includes('long nose')) {
    return images["Long Nose Pliers Heavy Duty Philippines"][0];
  }
  if (n.includes('snip') || n.includes('tin snip')) {
    return images["Tin Snips Sheet Metal Cutter Philippines"][0];
  }
  if (n.includes('saw') || n.includes('handsaw')) {
    return images["Wood Handsaw Hand Tool Philippines"][0];
  }
  if (n.includes('chisel')) {
    return images["Wood Chisel Set Hand Tools Philippines"][0];
  }
  if (n.includes('soldering')) {
    return images["Electric Soldering Iron 40W 60W Philippines"][0];
  }
  if (n.includes('plumb bob')) {
    return images["Plumb Bob Brass Magnetic Philippines"][0];
  }
  if (n.includes('wrench')) {
    return images["Combination Wrench Philippines"][0];
  }
  if (n.includes('catches magnetic') || n.includes('magnetic')) {
    return images["Magnetic Door Catches Cabinet Philippines"][0];
  }

  // Electrical
  if (n.includes('breaker')) {
    return images["Miniature Circuit Breaker Philippines"][0];
  }
  if (n.includes('entrance cap')) {
    return images["Service Entrance Cap Electrical Philippines"][0];
  }
  if (n.includes('coupling') && n.includes('emt')) {
    return images["EMT Conduit Coupling Electrical Philippines"][0];
  }
  if (n.includes('insulator')) {
    return images["Screw Insulator Philippines"][0];
  }

  // Fallbacks by category
  if (item.category === 'Paints & Coatings') return images["Island Paint QDE Nile Green Philippines"][0];
  if (item.category === 'Plumbing & Fixtures') return images["PVC Blue Elbow 90 Degree Philippines"][0];
  if (item.category === 'Structural & Building Materials') return images["C-purlins Philippines"][0];
  if (item.category === 'Fasteners & Hardware') return images["Gypsum Screw Black Philippines"][0];
  if (item.category === 'Tools & Accessories') return images["Combination Wrench Philippines"][0];
  if (item.category === 'Electrical & Lighting') return images["Miniature Circuit Breaker Philippines"][0];

  return images["C-purlins Philippines"][0];
}

// Update catalog items
let updatedCount = 0;
const updatedCatalog = catalog.map(item => {
  const verifiedImage = matchImage(item);
  if (verifiedImage) {
    updatedCount++;
    return {
      ...item,
      image: verifiedImage
    };
  }
  return item;
});

console.log(`Updated ${updatedCount} out of ${catalog.length} items with verified Google Images!`);

// Save updated catalog to both catalog.json and storefront-app/src/catalog.json
fs.writeFileSync('catalog.json', JSON.stringify(updatedCatalog, null, 2));
fs.writeFileSync('storefront-app/src/catalog.json', JSON.stringify(updatedCatalog, null, 2));
console.log('Successfully saved to catalog.json and storefront-app/src/catalog.json');
