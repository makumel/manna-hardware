const fs = require('fs');
const catalog = JSON.parse(fs.readFileSync('catalog.json', 'utf8'));
const verified = fs.existsSync('verified_google_images.json') ? JSON.parse(fs.readFileSync('verified_google_images.json', 'utf8')) : {};

const competitorKeywords = ['lucky', 'gazelle', 'dt-home', 'dthome', 'far eastern', 'click n go', 'comfy', 'baesa', 'ace hardware'];

const flagged = [];
for (const item of catalog) {
  for (const [q, data] of Object.entries(verified)) {
    if (data.image_url === item.image) {
      const title = (data.matched_title || '').toLowerCase();
      const match = competitorKeywords.find(k => title.includes(k));
      if (match) {
        flagged.push({ id: item.id, name: item.name, competitor: match, title: data.matched_title });
        break;
      }
    }
  }
}

console.log('Total flagged items with competitor store watermarks/overlays:', flagged.length);
flagged.forEach(f => console.log(`[${f.competitor}] ${f.id} ${f.name} --> ${f.title.slice(0, 60)}`));

fs.writeFileSync('flagged_competitors.json', JSON.stringify(flagged, null, 2));
