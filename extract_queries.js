const fs = require('fs');
const catalog = JSON.parse(fs.readFileSync('catalog.json', 'utf8'));

function getArchetype(name) {
  const n = name.toLowerCase();

  // Branded Paints
  if (n.includes('island paint qde')) {
    if (n.includes('pink')) return 'Island Paint QDE Pink Philippines';
    if (n.includes('nile green')) return 'Island Paint QDE Nile Green Philippines';
    if (n.includes("int'l red") || n.includes('international red')) return 'Island Paint QDE International Red Philippines';
    if (n.includes('signal red')) return 'Island Paint QDE Signal Red Philippines';
    return 'Island Paint Quick Drying Enamel Philippines';
  }
  if (n.includes('roofkote')) {
    if (n.includes('baguio green')) return 'Boysen Roofkote Baguio Green Philippines';
    if (n.includes('nut brown')) return 'Boysen Roofkote Nut Brown Philippines';
    if (n.includes('clear blue')) return 'Boysen Roofkote Clear Blue Philippines';
    return 'Boysen Roofkote Paint Philippines';
  }
  if (n.includes('acrytex')) return 'Boysen Acrytex Cast Philippines';
  if (n.includes('permacoat')) return 'Boysen Permacoat Flat Latex White Philippines';
  if (n.includes('clear gloss lacquer')) return 'Boysen Clear Gloss Lacquer Philippines';
  if (n.includes('primer red ox')) return 'Island Primer Red Oxide Philippines';
  if (n.includes('elastomer')) return 'Star Elastomer Paint Philippines';
  if (n.includes('stikwel')) return 'Stikwel Wood Glue Philippines';

  // Branded Tools & Plumbing
  if (n.includes('shark')) return 'Shark Faucet Shower Plumbing Philippines';
  if (n.includes('amerilock')) return 'Amerilock Hinges Lockset Philippines';
  if (n.includes('makita')) return 'Makita Planer Blade Philippines';
  if (n.includes('dewalt')) return 'Dewalt Drill Bit Philippines';
  if (n.includes('samurai')) return 'GI Pipe Samurai Schedule 40 Philippines';
  if (n.includes('champion')) return 'Pitcher Pump Champion Philippines';

  // Fasteners
  if (n.includes('gypsum screw')) return 'Gypsum Screw Black Philippines';
  if (n.includes('blind rivet')) return 'Blind Rivets Aluminum Philippines';
  if (n.includes('tek screw')) return 'Tek Screw Hex Head Philippines';
  if (n.includes('common nail')) return 'Common Wire Nails CWN Philippines';
  if (n.includes('concrete nail')) return 'Concrete Nails Philippines';
  if (n.includes('umbrella nail')) return 'Umbrella Nails Roofing Philippines';
  if (n.includes('hook & eye')) return 'Hook and Eye Brass Hardware Philippines';
  if (n.includes('piano hinge')) return 'Continuous Piano Hinge Stainless Philippines';
  if (n.includes('door spring')) return 'Screen Door Spring Heavy Duty Philippines';
  if (n.includes('cup brush')) return 'Wire Cup Brush Angle Grinder Philippines';
  if (n.includes('flap disk')) return 'Flap Disc Grinding Wheel Philippines';
  if (n.includes('sandpaper')) return 'Waterproof Silicon Carbide Sandpaper Philippines';
  if (n.includes('roller brush')) return 'Paint Roller Brush with Tray Philippines';

  // Steel & Structural
  if (n.includes('c-purlin') || n.includes('purlin')) return 'C-purlins Philippines';
  if (n.includes('angle bar')) return 'Angle Bar Steel Philippines';
  if (n.includes('plain bar') || n.includes('round bar')) return 'Steel Plain Round Bar Philippines';
  if (n.includes('i-bar') || n.includes('t-bar')) return 'Steel T-Bar I-Bar Construction Philippines';
  if (n.includes('polycarbonate')) return 'Polycarbonate Roofing Sheet Twinwall Philippines';

  // Plumbing
  if (n.includes('pvc blue male adaptor') || n.includes('male adaptor')) return 'PVC Blue Male Adaptor Philippines';
  if (n.includes('pvc blue female adaptor') || n.includes('female adaptor')) return 'PVC Blue Female Adaptor Philippines';
  if (n.includes('pvc blue tee') || n.includes('tee')) return 'PVC Blue Tee Fitting Philippines';
  if (n.includes('pvc blue elbow') || n.includes('elbow')) return 'PVC Blue Elbow 90 Degree Philippines';
  if (n.includes('pvc blue union') || n.includes('union')) return 'PVC Blue Union Patente Philippines';
  if (n.includes('pvc blue plug') || n.includes('plug')) return 'PVC Blue Plug End Cap Philippines';
  if (n.includes('check valve')) return 'Swing Check Valve Brass Philippines';
  if (n.includes('foot valve')) return 'Foot Valve Brass Plumbing Philippines';
  if (n.includes('gate valve')) return 'Gate Valve Brass Philippines';
  if (n.includes('ball valve')) return 'PVC Ball Valve Industrial Philippines';
  if (n.includes('gi pipe')) return 'Galvanized Iron GI Pipe S40 Philippines';
  if (n.includes('kitchen sink')) return 'Stainless Steel Kitchen Sink Single Bowl Philippines';
  if (n.includes('floor drain')) return 'Stainless Steel Floor Drain Trap Philippines';
  if (n.includes('teflon')) return 'Teflon Thread Seal Tape Philippines';
  if (n.includes('hose clamp')) return 'Stainless Steel Hose Clamp Philippines';
  if (n.includes('flexible hose')) return 'Stainless Flexible Hose Plumbing Philippines';

  // Electrical
  if (n.includes('pressure switch')) return 'Water Pump Pressure Switch Square D Philippines';
  if (n.includes('junction box')) return 'PVC Octagonal Junction Box Electrical Philippines';
  if (n.includes('utility box')) return 'PVC Utility Box Electrical Philippines';
  if (n.includes('circuit breaker') || n.includes('breaker')) return 'Miniature Circuit Breaker Philippines';
  if (n.includes('thhn') || n.includes('wire')) return 'THHN Stranded Electrical Wire Philippines';

  // General clean query
  const clean = name.replace(/\(.*?\)/g, '').replace(/#\S+/g, '').trim();
  return clean + ' Philippines';
}

const map = new Map();
catalog.forEach(item => {
  const arch = getArchetype(item.name);
  if (!map.has(arch)) map.set(arch, []);
  map.get(arch).push(item.id);
});

console.log('Archetype count:', map.size);
const sorted = Array.from(map.entries()).sort((a,b) => b[1].length - a[1].length);
sorted.slice(0, 30).forEach(([k, v]) => console.log(`  [${v.length} items]: ${k}`));
const top50Sum = sorted.slice(0, 50).reduce((acc, x) => acc + x[1].length, 0);
console.log(`Top 50 cover ${top50Sum} out of ${catalog.length} items (${((top50Sum/catalog.length)*100).toFixed(1)}%)`);

// Save mapping
const result = {};
for (const [k, v] of map.entries()) {
  result[k] = v;
}
fs.writeFileSync('archetype_mapping.json', JSON.stringify(result, null, 2));
console.log('Saved archetype_mapping.json');
