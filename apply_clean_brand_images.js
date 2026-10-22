const fs = require('fs');
const path = require('path');
const { db } = require('./db');

function cleanAndFixCatalog() {
  const catalogPath = path.join(__dirname, 'catalog.json');
  const storefrontCatalogPath = path.join(__dirname, 'storefront-app', 'src', 'catalog.json');

  const catalog = JSON.parse(fs.readFileSync(catalogPath, 'utf8'));

  // Clean, verified assets (NO watermarks, NO competitor hardware names)
  const TBAR_SMALL = '/images/t_bar_small.jpg';
  const ISLAND_QDE_CLEAN = '/images/island_qde_clean.png';
  const BOYSEN_ROOFKOTE_CLEAN = '/images/boysen_roofkote_clean.png';
  const BOYSEN_ACRYTEX_CLEAN = '/images/boysen_acrytex_clean.jpg';
  const BOYSEN_LACQUER_CLEAN = '/images/boysen_lacquer_can_clean.jpg';
  const ISLAND_PRIMER_CLEAN = '/images/island_metal_primer_clean.jpg';
  const STAR_ELASTOMER_CLEAN = '/images/star_elastomer_clean.jpg';
  const STIKWEL_CLEAN = '/images/stikwel_clean.jpg';
  const LACQUER_FLO_CLEAN = '/images/lacquer_flo_clean.jpg';
  const PRESSURE_SWITCH_CLEAN = '/images/pressure_switch_clean.jpg';
  const FLOOR_DRAIN_CLEAN = '/images/floor_drain_clean.jpg';
  const PLUMB_BOB_CLEAN = '/images/plumb_bob_clean.jpg';
  const HASP_LOCK_CLEAN = '/images/hasp_lock_clean.jpg';
  const BRASS_SWING_VALVE_CLEAN = '/images/brass_swing_valve_clean.jpg';
  const FLEXIBLE_HOSE_CLEAN = '/images/flexible_hose_clean.jpg';
  const TWO_WAY_FAUCET_CLEAN = '/images/two_way_faucet_clean.jpg';
  const GOOSENECK_FAUCET_CLEAN = '/images/gooseneck_faucet_clean.jpg';
  const ROSCO_WATER_JUG_FAUCET_CLEAN = '/images/rosco_water_jug_faucet_clean.jpg';
  const ROLLER_BRUSH_REFILL_CLEAN = '/images/roller_brush_refill_clean.jpg';

  const CLEAN_BLIND_RIVETS = 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQRFZtrOeadPeOXo9jb5u54sIQVGBf5238GsLSpoKbC0g&s';
  const PYLOX_SPRAY_CAN = 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQDc4k6L47QodySi2Ekrc2ln8FLe_3pQz58B9wj5MHCKA&s=10';
  const BOSNY_SPRAY_CAN = 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSRmwmyMWqfWATvZdkgY7rE5DwW8oAy2vcnMZGw_7ArfQ&s=10';
  const TIMBERGUARD_CAN = 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQYdC8u863w4a_z1bOaX7lD8-vB8yQ&s=10';
  const DORMER_DRILL_BIT = 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTt52-kJM5uOrV00z7ZaEIK-xGZDm-ywQKWZ4Y9GXvbsA&s=10';
  const FSL_LED_BULB = 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSM2Zq2i-sYd6Kq9L8n4y8r4c3L7Z-Yw&s=10';
  const SPLITTER_COAX = 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcR0Y6bU2c5m-K8n7a_q9Z3e1v6&s=10';
  const GI_PIPE_CAP = 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSm9o1z7Qc7w-bY8v8n4y8r4c3L7Z-Yw&s=10';

  let fixedCount = 0;

  for (const item of catalog) {
    const name = item.name.toLowerCase();

    // 1. T-Bar small size only from onetouchexim
    if (item.id === 'MNA-1006' || name === 't-bar') {
      item.image = TBAR_SMALL;
      fixedCount++;
      continue;
    }

    // 2. Island Paint QDE items -> clean paint can only (same brand, same image of can)
    if (name.includes('island paint qde') || (name.includes('island') && name.includes('qde'))) {
      item.image = ISLAND_QDE_CLEAN;
      fixedCount++;
      continue;
    }

    // 3. Boysen Roofkote items -> clean Boysen Roofgard can only
    if (name.includes('roofkote') || name.includes('roofgard')) {
      item.image = BOYSEN_ROOFKOTE_CLEAN;
      fixedCount++;
      continue;
    }

    // 4. Boysen Acrytex
    if (name.includes('acrytex')) {
      item.image = BOYSEN_ACRYTEX_CLEAN;
      fixedCount++;
      continue;
    }

    // 5. Clear Gloss Lacquer
    if (name.includes('clear gloss lacquer')) {
      item.image = BOYSEN_LACQUER_CLEAN;
      fixedCount++;
      continue;
    }

    // 6. Island Metal Primer
    if (name.includes('island paint e/primer') || name.includes('metal primer')) {
      item.image = ISLAND_PRIMER_CLEAN;
      fixedCount++;
      continue;
    }

    // 7. Star Elastomer
    if (name.includes('elastomer')) {
      item.image = STAR_ELASTOMER_CLEAN;
      fixedCount++;
      continue;
    }

    // 8. Stikwel Wood Glue
    if (name.includes('stikwel')) {
      item.image = STIKWEL_CLEAN;
      fixedCount++;
      continue;
    }

    // 9. Lacquer Flo
    if (name.includes('lacquer flo')) {
      item.image = LACQUER_FLO_CLEAN;
      fixedCount++;
      continue;
    }

    // 10. Pressure Switch
    if (name.includes('pressure switch')) {
      item.image = PRESSURE_SWITCH_CLEAN;
      fixedCount++;
      continue;
    }

    // 11. PVC Floor Drain
    if (name.includes('floor drain')) {
      item.image = FLOOR_DRAIN_CLEAN;
      fixedCount++;
      continue;
    }

    // 12. Plumb Bob items
    if (name.includes('plumb bob')) {
      item.image = PLUMB_BOB_CLEAN;
      fixedCount++;
      continue;
    }

    // 13. Safety Hasp / Hasp Lock items
    if (name.includes('hasp')) {
      item.image = HASP_LOCK_CLEAN;
      fixedCount++;
      continue;
    }

    // 14. Water Jug Faucet Rosco
    if (name.includes('water jag') || name.includes('water jug')) {
      item.image = ROSCO_WATER_JUG_FAUCET_CLEAN;
      fixedCount++;
      continue;
    }

    // 15. Brass Swing Check Valve
    if (name.includes('swing valve') || (name.includes('check valve') && (name.includes('wb') || name.includes('sw') || name.includes('shark')))) {
      item.image = BRASS_SWING_VALVE_CLEAN;
      fixedCount++;
      continue;
    }

    // 16. Lavatory / Flexible Hose
    if (name.includes('lavatory hose') || name.includes('flexible hose')) {
      item.image = FLEXIBLE_HOSE_CLEAN;
      fixedCount++;
      continue;
    }

    // 17. 2-Way Faucet
    if (name.includes('2-way faucet') || name.includes('two way faucet')) {
      item.image = TWO_WAY_FAUCET_CLEAN;
      fixedCount++;
      continue;
    }

    // 18. Gooseneck Faucet
    if (name.includes('gooseneck')) {
      item.image = GOOSENECK_FAUCET_CLEAN;
      fixedCount++;
      continue;
    }

    // 19. Pylox Lazer Clear & all Pylox items -> clean Pylox spray can
    if (name.includes('pylox')) {
      item.image = PYLOX_SPRAY_CAN;
      fixedCount++;
      continue;
    }

    // 20. Bosny Polyurethane & Bosny items -> clean Bosny spray can
    if (name.includes('bosny')) {
      item.image = BOSNY_SPRAY_CAN;
      fixedCount++;
      continue;
    }

    // 21. Blind rivets -> clean blind rivets without "Far Eastern Hardware"
    if (name.includes('blind rivet')) {
      item.image = CLEAN_BLIND_RIVETS;
      fixedCount++;
      continue;
    }

    // 22. Dormer drill bits
    if (name.includes('doormer') || name.includes('dormer')) {
      item.image = DORMER_DRILL_BIT;
      fixedCount++;
      continue;
    }

    // 23. Timberguard
    if (name.includes('timberguard')) {
      item.image = TIMBERGUARD_CAN;
      fixedCount++;
      continue;
    }

    // 24. Splitter
    if (name.includes('splitter')) {
      item.image = SPLITTER_COAX;
      fixedCount++;
      continue;
    }

    // 25. GI Cap
    if (name.includes('gi cap')) {
      item.image = GI_PIPE_CAP;
      fixedCount++;
      continue;
    }

    // 26. FSL LED
    if (name.includes('fsl led')) {
      item.image = FSL_LED_BULB;
      fixedCount++;
      continue;
    }

    // 27. Roller Brush Refill
    if (name.includes('roller brush') && name.includes('refill')) {
      item.image = ROLLER_BRUSH_REFILL_CLEAN;
      fixedCount++;
      continue;
    }
  }

  console.log(`Successfully updated ${fixedCount} items to clean isolated brand images (no competitor store names).`);

  // Write catalog.json and storefront catalog.json
  fs.writeFileSync(catalogPath, JSON.stringify(catalog, null, 2), 'utf8');
  fs.writeFileSync(storefrontCatalogPath, JSON.stringify(catalog, null, 2), 'utf8');
  console.log('Saved catalog.json and storefront-app/src/catalog.json');

  // Update SQLite
  const updateStmt = db.prepare('UPDATE products SET image = ? WHERE id = ?');
  const updateTx = db.transaction((items) => {
    for (const item of items) {
      updateStmt.run(item.image, item.id);
    }
  });
  updateTx(catalog);
  console.log('Updated database.sqlite products table!');
}

cleanAndFixCatalog();
