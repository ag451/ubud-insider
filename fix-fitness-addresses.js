// Fetch correct addresses for fitness places from Google Places
const { Pool } = require('pg');
const https = require('https');

const pool = new Pool({
  connectionString: 'postgresql://postgres:XZtCObtaOWfmkXhNtOOAvcASQeVhkpxu@centerbeam.proxy.rlwy.net:46202/railway',
  ssl: { rejectUnauthorized: false }
});

const GOOGLE_API_KEY = process.env.GOOGLE_PLACES_API_KEY || '';

const fitnessPlaces = [
  { id: 82, name: 'Titi Batu Club', query: 'Titi Batu Club Ubud Bali' },
  { id: 83, name: 'Gymnasium', query: 'Gymnasium Ubud Bali' },
  { id: 84, name: 'Bali Eden', query: 'Bali Eden Ubud Bali' },
  { id: 85, name: 'Rendez Fitness', query: 'Rendez Fitness Ubud Bali' },
  { id: 86, name: 'Ubud Cross Fit', query: 'Ubud CrossFit Bali' }
];

function fetchFromGoogle(url) {
  return new Promise((resolve, reject) => {
    https.get(url, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        try {
          resolve(JSON.parse(data));
        } catch (e) {
          reject(e);
        }
      });
    }).on('error', reject);
  });
}

async function findPlace(place) {
  try {
    // Search for place
    const searchUrl = `https://maps.googleapis.com/maps/api/place/findplacefromtext/json?` +
      `input=${encodeURIComponent(place.query)}&` +
      `inputtype=textquery&` +
      `fields=place_id,name,formatted_address,geometry&` +
      `key=${GOOGLE_API_KEY}`;
    
    const searchData = await fetchFromGoogle(searchUrl);
    
    if (searchData.status !== 'OK' || !searchData.candidates || searchData.candidates.length === 0) {
      console.log(`❌ ${place.name}: Not found - ${searchData.status}`);
      return null;
    }
    
    const candidate = searchData.candidates[0];
    
    console.log(`✅ ${place.name}:`);
    console.log(`   Place ID: ${candidate.place_id}`);
    console.log(`   Address: ${candidate.formatted_address}`);
    
    return {
      id: place.id,
      name: place.name,
      google_place_id: candidate.place_id,
      address: candidate.formatted_address,
      lat: candidate.geometry?.location?.lat,
      lng: candidate.geometry?.location?.lng
    };
    
  } catch (err) {
    console.error(`❌ ${place.name}: ${err.message}`);
    return null;
  }
}

async function updatePlaces() {
  if (!GOOGLE_API_KEY) {
    console.error('❌ GOOGLE_PLACES_API_KEY not set');
    process.exit(1);
  }
  
  console.log('🔍 Searching for fitness places...\n');
  
  for (const place of fitnessPlaces) {
    const data = await findPlace(place);
    
    if (data) {
      try {
        await pool.query(
          'UPDATE places SET google_place_id = $1, address = $2, lat = $3, lng = $4 WHERE id = $5',
          [data.google_place_id, data.address, data.lat, data.lng, data.id]
        );
        console.log(`   💾 Saved to database\n`);
      } catch (e) {
        console.error(`   ❌ DB error: ${e.message}\n`);
      }
    }
    
    // Rate limiting
    await new Promise(r => setTimeout(r, 300));
  }
  
  await pool.end();
  console.log('✅ Done!');
}

updatePlaces();
