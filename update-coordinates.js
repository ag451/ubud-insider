// Update place coordinates from Google Places API
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
    
    const url = `https://maps.googleapis.com/maps/api/place/details/json?place_id=${placeId}&fields=geometry&key=${GOOGLE_PLACES_API_KEY}`;
    
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

async function updateCoordinates() {
  try {
    console.log('🔍 Fetching places with Google Place IDs...\n');
    
    // Get all places with google_place_id
    const result = await pool.query(`
      SELECT id, name, lat, lng, google_place_id 
      FROM places 
      WHERE google_place_id IS NOT NULL AND google_place_id != ''
      ORDER BY id
    `);
    
    console.log(`Found ${result.rows.length} places with Google Place IDs\n`);
    
    let updated = 0;
    let failed = 0;
    
    for (const place of result.rows) {
      try {
        console.log(`📍 ${place.name} (ID: ${place.id})`);
        console.log(`   Current: ${place.lat}, ${place.lng}`);
        
        const details = await fetchPlaceDetails(place.google_place_id);
        
        if (details.result && details.result.geometry && details.result.geometry.location) {
          const { lat, lng } = details.result.geometry.location;
          
          // Update database
          await pool.query(`
            UPDATE places 
            SET lat = $1, lng = $2
            WHERE id = $3
          `, [lat, lng, place.id]);
          
          console.log(`   ✅ Updated: ${lat}, ${lng}\n`);
          updated++;
        } else {
          console.log(`   ⚠️ No geometry data found\n`);
          failed++;
        }
        
        // Rate limiting - wait 100ms between requests
        await new Promise(r => setTimeout(r, 100));
        
      } catch (err) {
        console.log(`   ❌ Error: ${err.message}\n`);
        failed++;
      }
    }
    
    console.log('📊 Summary:');
    console.log(`   Updated: ${updated} places`);
    console.log(`   Failed: ${failed} places`);
    
    // Show sample of updated coordinates
    const sample = await pool.query(`
      SELECT id, name, lat, lng 
      FROM places 
      WHERE google_place_id IS NOT NULL
      ORDER BY id 
      LIMIT 5
    `);
    
    console.log('\n🔍 Sample coordinates:');
    for (const place of sample.rows) {
      console.log(`   ${place.name}: ${place.lat}, ${place.lng}`);
    }
    
  } catch (err) {
    console.error('❌ Error:', err.message);
  } finally {
    await pool.end();
  }
}

// Check if API key is set
if (!GOOGLE_PLACES_API_KEY) {
  console.error('❌ GOOGLE_PLACES_API_KEY environment variable is required');
  console.log('Set it with: export GOOGLE_PLACES_API_KEY=your_key_here');
  process.exit(1);
}

updateCoordinates();
