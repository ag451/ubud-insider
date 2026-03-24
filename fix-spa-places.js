// Fix the 5 new spa places - add vibes and regenerate Why This Place
const { Pool } = require('pg');

const DATABASE_URL = process.env.DATABASE_URL || 'postgresql://postgres:XZtCObtaOWfmkXhNtOOAvcASQeVhkpxu@centerbeam.proxy.rlwy.net:46202/railway';

const pool = new Pool({
  connectionString: DATABASE_URL,
  ssl: { rejectUnauthorized: false }
});

// Define proper vibes and Why This Place for each new spa
const spaUpdates = [
  {
    id: 77,
    name: "Karsa Spa",
    vibes: ["calm", "nature", "aesthetic"],
    why_sentence: "Set among rice fields with open-air treatment rooms. The Balinese massage here is consistently excellent.",
    why_tags: ["Rice Field Views", "Balinese Massage", "Open Air"]
  },
  {
    id: 78,
    name: "Hesa Wellness Spa Ubud",
    vibes: ["calm", "luxury", "aesthetic"],
    why_sentence: "Modern wellness spa with skilled therapists and a serene atmosphere. Great for a proper deep tissue session.",
    why_tags: ["Deep Tissue", "Modern Spa", "Skilled Therapists"]
  },
  {
    id: 79,
    name: "Putri Ubud Spa 3",
    vibes: ["calm", "local", "aesthetic"],
    why_sentence: "Local spa chain with reliable service and great value. The traditional Balinese massage won't disappoint.",
    why_tags: ["Great Value", "Local Chain", "Traditional Massage"]
  },
  {
    id: 80,
    name: "Maya Ubud Resort & Spa",
    vibes: ["calm", "nature", "luxury"],
    why_sentence: "Resort spa overlooking the Petanu River valley. The riverside treatment pavilions are worth the splurge.",
    why_tags: ["Riverside Views", "Luxury Resort", "Valley Setting"]
  },
  {
    id: 81,
    name: "Hutan Spa",
    vibes: ["calm", "nature", "aesthetic"],
    why_sentence: "Jungle spa with treatments in private bales surrounded by greenery. Feels miles away from town.",
    why_tags: ["Jungle Setting", "Private Bales", "Nature Immersion"]
  }
];

async function fixSpaPlaces() {
  const client = await pool.connect();
  
  try {
    console.log('🔧 Fixing spa places...\n');
    
    for (const update of spaUpdates) {
      // Update vibes
      await client.query(
        'UPDATE places SET vibes = $1 WHERE id = $2',
        [JSON.stringify(update.vibes), update.id]
      );
      
      // Update Why This Place
      await client.query(
        `INSERT INTO why_this_place (place_id, sentence, tags, last_generated_at)
         VALUES ($1, $2, $3, NOW())
         ON CONFLICT (place_id) DO UPDATE SET
           sentence = EXCLUDED.sentence,
           tags = EXCLUDED.tags,
           last_generated_at = EXCLUDED.last_generated_at`,
        [update.id, update.why_sentence, JSON.stringify(update.why_tags)]
      );
      
      console.log(`✅ ${update.name}`);
      console.log(`   Vibes: ${update.vibes.join(', ')}`);
      console.log(`   Why: ${update.why_sentence}\n`);
    }
    
    console.log('🎉 All spa places updated!');
    
  } catch (err) {
    console.error('❌ Error:', err.message);
  } finally {
    client.release();
    await pool.end();
  }
}

fixSpaPlaces();
