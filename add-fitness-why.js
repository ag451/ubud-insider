// Generate Why This Place for fitness places
const { Pool } = require('pg');
const pool = new Pool({
  connectionString: 'postgresql://postgres:XZtCObtaOWfmkXhNtOOAvcASQeVhkpxu@centerbeam.proxy.rlwy.net:46202/railway',
  ssl: { rejectUnauthorized: false }
});

const whyData = [
  { place_id: 82, sentence: "Gym in Town Centre with serious equipment and a motivating crowd. You'll actually want to work out here.", tags: ['Fitness', 'Gym', 'Town Centre'] },
  { place_id: 83, sentence: "Training spot in Town Centre where fitness people gather. Good energy, no nonsense.", tags: ['Fitness', 'Gym', 'Town Centre'] },
  { place_id: 84, sentence: "Bali Eden keeps you accountable in Penestanan. The kind of gym that becomes part of your routine.", tags: ['Fitness', 'Wellness', 'Penestanan'] },
  { place_id: 85, sentence: "Gym in North Ubud with serious equipment and a motivating crowd. You'll actually want to work out here.", tags: ['Fitness', 'CrossFit', 'North Ubud'] },
  { place_id: 86, sentence: "Training spot in Out of Town where fitness people gather. Good energy, no nonsense.", tags: ['Fitness', 'CrossFit', 'Out of Town'] }
];

async function insert() {
  for (const w of whyData) {
    try {
      await pool.query(
        'INSERT INTO why_this_place (place_id, sentence, tags) VALUES ($1, $2, $3) ON CONFLICT (place_id) DO UPDATE SET sentence=$2, tags=$3',
        [w.place_id, w.sentence, JSON.stringify(w.tags)]
      );
      console.log('Added Why This Place for ID:', w.place_id);
    } catch (e) {
      console.error('Error:', w.place_id, e.message);
    }
  }
  await pool.end();
  console.log('Done!');
}
insert();
