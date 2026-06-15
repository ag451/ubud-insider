// Generate data/places-backup.json from the canonical front-end seed (data.js).
//
// The server auto-restores from this file when it boots against an empty
// database (e.g. a fresh Railway PostgreSQL instance), so committing it lets a
// new deployment come up pre-populated without manual seeding.
//
// Usage: node generate-seed-backup.js
const fs = require('fs');
const path = require('path');
const { UBUD_DATA } = require('./data.js');

const places = (UBUD_DATA.places || []).map(p => ({
  id: p.id,
  name: p.name,
  category: p.category,
  description: p.description || null,
  area: p.area || null,
  maps: p.maps || null,
  lat: p.lat ?? null,
  lng: p.lng ?? null,
  rating: p.rating ?? null,
  price_level: p.price_level ?? null,
  address: p.address || null,
  phone: p.phone || null,
  website: p.website || null,
  hours: p.hours || null,
  google_place_id: p.google_place_id || null,
  vibes: p.vibes || [],
  reviews: [],
  photos: [],
  why_sentence: null,
  why_tags: [],
  last_generated_at: null
}));

const outDir = path.join(__dirname, 'data');
const outFile = path.join(outDir, 'places-backup.json');
fs.mkdirSync(outDir, { recursive: true });
fs.writeFileSync(outFile, JSON.stringify({
  exported_at: new Date().toISOString(),
  places
}, null, 2));

console.log(`✅ Wrote ${places.length} places to ${outFile}`);
