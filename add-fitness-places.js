// Add fitness places to database
const { Pool } = require('pg');
const pool = new Pool({
  connectionString: 'postgresql://postgres:XZtCObtaOWfmkXhNtOOAvcASQeVhkpxu@centerbeam.proxy.rlwy.net:46202/railway',
  ssl: { rejectUnauthorized: false }
});

const places = [
  { id: 82, name: 'Titi Batu Club', category: 'fitness', description: "High-end gym and sports club with pool, tennis courts, and fitness classes. Day passes available for gym and pool access.", area: 'Town Centre', lat: -8.5095, lng: 115.2620, vibes: ['social', 'lively', 'aesthetic'] },
  { id: 83, name: 'Gymnasium', category: 'fitness', description: "Premium gym with state-of-the-art equipment and personal training. Known for its motivating atmosphere and quality facilities.", area: 'Town Centre', lat: -8.5070, lng: 115.2640, vibes: ['deepwork', 'social', 'aesthetic'] },
  { id: 84, name: 'Bali Eden', category: 'fitness', description: "Holistic fitness and wellness center offering yoga, pilates, and strength training in a beautiful natural setting.", area: 'Penestanan', lat: -8.5105, lng: 115.2590, vibes: ['nature', 'calm', 'spiritual'] },
  { id: 85, name: 'Rendez Fitness', category: 'fitness', description: "Popular gym north of Ubud with CrossFit classes, weight training, and functional fitness. Great community vibe.", area: 'North Ubud', lat: -8.4800, lng: 115.2600, vibes: ['lively', 'social', 'deepwork'] },
  { id: 86, name: 'Ubud Cross Fit', category: 'fitness', description: "Dedicated CrossFit box offering high-intensity workouts and strong community. Perfect for serious fitness enthusiasts.", area: 'Out of Town', lat: -8.4950, lng: 115.2550, vibes: ['lively', 'social', 'deepwork'] }
];

async function insert() {
  for (const p of places) {
    try {
      await pool.query(
        'INSERT INTO places (id, name, category, description, area, lat, lng, vibes) VALUES ($1, $2, $3, $4, $5, $6, $7, $8) ON CONFLICT (id) DO UPDATE SET name=$2, category=$3, description=$4, area=$5, lat=$6, lng=$7, vibes=$8',
        [p.id, p.name, p.category, p.description, p.area, p.lat, p.lng, JSON.stringify(p.vibes)]
      );
      console.log('Added:', p.name);
    } catch (e) {
      console.error('Error:', p.name, e.message);
    }
  }
  await pool.end();
  console.log('Done!');
}
insert();
