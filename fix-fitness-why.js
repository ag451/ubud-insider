// Update Why This Place for fitness places with specific descriptions
const { Pool } = require('pg');
const pool = new Pool({
  connectionString: 'postgresql://postgres:XZtCObtaOWfmkXhNtOOAvcASQeVhkpxu@centerbeam.proxy.rlwy.net:46202/railway',
  ssl: { rejectUnauthorized: false }
});

const whyData = [
  { 
    place_id: 82, 
    sentence: "The kind of place where you can lift weights, swim laps, and play tennis all in one visit. Day passes mean you can treat it like your own country club without the membership commitment.", 
    tags: ['Fitness', 'Sports Club', 'Pool'] 
  },
  { 
    place_id: 83, 
    sentence: "Serious equipment that actually works, trainers who know what they're doing, and none of the usual gym ego. This is where you go when you're done messing around.", 
    tags: ['Fitness', 'Premium Gym', 'Personal Training'] 
  },
  { 
    place_id: 84, 
    sentence: "Strength training surrounded by greenery and quiet. They get that fitness isn't just about lifting heavy—it's about feeling good in your body while you do it.", 
    tags: ['Fitness', 'Holistic', 'Nature'] 
  },
  { 
    place_id: 85, 
    sentence: "CrossFit without the attitude. The community here actually supports each other, and the coaches focus on form over ego. Worth the drive north of town.", 
    tags: ['Fitness', 'CrossFit', 'Community'] 
  },
  { 
    place_id: 86, 
    sentence: "Proper CrossFit box with programming that follows the real methodology. If you want the intensity without the tourist-friendly modifications, this is your spot.", 
    tags: ['Fitness', 'CrossFit', 'Intense'] 
  }
];

async function update() {
  for (const w of whyData) {
    try {
      await pool.query(
        'INSERT INTO why_this_place (place_id, sentence, tags) VALUES ($1, $2, $3) ON CONFLICT (place_id) DO UPDATE SET sentence=$2, tags=$3',
        [w.place_id, w.sentence, JSON.stringify(w.tags)]
      );
      console.log('✅ Updated:', w.place_id);
    } catch (e) {
      console.error('❌ Error:', w.place_id, e.message);
    }
  }
  await pool.end();
  console.log('Done!');
}
update();
