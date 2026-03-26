// Update price levels for all places from Google Places API
const { Pool } = require('pg');
const https = require('https');

const DATABASE_URL = process.env.DATABASE_URL || 'postgresql://postgres:XZtCObtaOWfmkXhNtOOAvcASQeVhkpxu@centerbeam.proxy.rlwy.net:46202/railway';
const GOOGLE_PLACES_API_KEY = process.env.GOOGLE_PLACES_API_KEY || '';

const pool = new Pool({
  connectionString: DATABASE_URL,
  ssl: { rejectUnauthorized: false }
});

// Fetch place details from Google Places API
function fetchPlaceDetails(placeId) {
  return new Promise((resolve, reject) => {
    if (!GOOGLE_PLACES_API_KEY) {
      reject(new Error('GOOGLE_PLACES_API_KEY not set'));
      return;
    }
    
    const url = `https://maps.googleapis.com/maps/api/place/details/json?place_id=${placeId}&fields=price_level&key=${GOOGLE_PLACES_API_KEY}`;
    
    https.get(url, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        try {
          const json = JSON.parse(data);
          resolve(json);
        } catch (e) {
          reject(e);
        }
      });
    }).on('error', reject);
  });
}

async function updatePriceLevels() {
  try {
    console.log('💰 Fetching price levels from Google Places...\n');
    
    // Get all places with google_place_id
    const result = await pool.query(`
      SELECT id, name, google_place_id, price_level 
      FROM places 
      WHERE google_place_id IS NOT NULL AND google_place_id != ''
      ORDER BY id
    `);
    
    console.log(`Found ${result.rows.length} places with Google Place IDs\n`);
    
    let updated = 0;
    let failed = 0;
    let skipped = 0;
    
    for (const place of result.rows) {
      // Skip if already has price_level
      if (place.price_level) {
        skipped++;
        continue;
      }
      
      try {
        const data = await fetchPlaceDetails(place.google_place_id);
        
        if (data.result && data.result.price_level) {
          await pool.query(
            'UPDATE places SET price_level = $1 WHERE id = $2',
            [data.result.price_level, place.id]
          );
          
          const dollars = '$'.repeat(data.result.price_level);
          console.log(`✅ ${place.name}: ${dollars}`);
          updated++;
        } else {
          console.log(`⚠️ ${place.name}: No price level available`);
          skipped++;
        }
        
        // Rate limiting
        await new Promise(r => setTimeout(r, 150));
        
      } catch (err) {
        console.log(`❌ ${place.name}: ${err.message}`);
        failed++;
      }
    }
    
    console.log('\n📊 Summary:');
    console.log(`   Updated: ${updated} places`);
    console.log(`   Skipped: ${skipped} places`);
    console.log(`   Failed: ${failed} places`);
    
  } catch (err) {
    console.error('❌ Error:', err.message);
  } finally {
    await pool.end();
  }
}

if (!GOOGLE_PLACES_API_KEY) {
  console.error('❌ GOOGLE_PLACES_API_KEY environment variable is required');
  process.exit(1);
}

updatePriceLevels();
