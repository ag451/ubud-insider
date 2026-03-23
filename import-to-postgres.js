// Direct import from API to PostgreSQL
const { Pool } = require('pg');

const DATABASE_URL = "postgresql://postgres:XZtCObtaOWfmkXhNtOOAvcASQeVhkpxu@centerbeam.proxy.rlwy.net:46202/railway";
const API_BASE = "https://ubud-insider-production.up.railway.app/api";

async function importToPostgres() {
  console.log('🔌 Connecting to PostgreSQL...');
  const pool = new Pool({
    connectionString: DATABASE_URL,
    ssl: { rejectUnauthorized: false }
  });
  
  try {
    await pool.query('SELECT NOW()');
    console.log('✅ Connected\n');
    
    // Create tables
    console.log('📋 Creating tables...');
    await pool.query(`
      CREATE TABLE IF NOT EXISTS places (
        id INTEGER PRIMARY KEY,
        name TEXT NOT NULL,
        category TEXT NOT NULL,
        description TEXT,
        area TEXT,
        maps TEXT,
        lat NUMERIC,
        lng NUMERIC,
        rating NUMERIC,
        address TEXT,
        phone TEXT,
        website TEXT,
        hours TEXT,
        google_place_id TEXT,
        vibes JSONB DEFAULT '[]'::jsonb,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);
    
    await pool.query(`
      CREATE TABLE IF NOT EXISTS reviews (
        id SERIAL PRIMARY KEY,
        place_id INTEGER REFERENCES places(id) ON DELETE CASCADE,
        text TEXT,
        rating INTEGER,
        author TEXT,
        time BIGINT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);
    
    await pool.query(`
      CREATE TABLE IF NOT EXISTS photos (
        id SERIAL PRIMARY KEY,
        place_id INTEGER REFERENCES places(id) ON DELETE CASCADE,
        url TEXT,
        html_attributions JSONB DEFAULT '[]'::jsonb,
        reference TEXT,
        width INTEGER,
        height INTEGER
      )
    `);
    
    await pool.query(`
      CREATE TABLE IF NOT EXISTS why_this_place (
        place_id INTEGER PRIMARY KEY REFERENCES places(id) ON DELETE CASCADE,
        sentence TEXT,
        tags JSONB DEFAULT '[]'::jsonb,
        last_generated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);
    console.log('✅ Tables ready\n');
    
    // Fetch places from API
    console.log('📥 Fetching places from API...');
    const response = await fetch(`${API_BASE}/places`);
    const places = await response.json();
    console.log(`   Found ${places.length} places\n`);
    
    // Insert places
    console.log('📤 Importing places...');
    for (const place of places) {
      await pool.query(`
        INSERT INTO places (id, name, category, description, area, maps, lat, lng, rating, address, phone, website, hours, google_place_id, vibes, created_at)
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16)
        ON CONFLICT (id) DO UPDATE SET
          name = EXCLUDED.name,
          category = EXCLUDED.category,
          description = EXCLUDED.description,
          area = EXCLUDED.area,
          maps = EXCLUDED.maps,
          lat = EXCLUDED.lat,
          lng = EXCLUDED.lng,
          rating = EXCLUDED.rating,
          address = EXCLUDED.address,
          phone = EXCLUDED.phone,
          website = EXCLUDED.website,
          hours = EXCLUDED.hours,
          google_place_id = EXCLUDED.google_place_id,
          vibes = EXCLUDED.vibes
      `, [
        place.id, place.name, place.category, place.description, place.area,
        place.maps, place.lat, place.lng, place.rating, place.address,
        place.phone, place.website, place.hours, place.google_place_id,
        JSON.stringify(place.vibes || []), place.created_at || new Date().toISOString()
      ]);
      
      // Insert Why This Place if exists
      if (place.why_sentence) {
        await pool.query(`
          INSERT INTO why_this_place (place_id, sentence, tags, last_generated_at)
          VALUES ($1, $2, $3, $4)
          ON CONFLICT (place_id) DO UPDATE SET
            sentence = EXCLUDED.sentence,
            tags = EXCLUDED.tags,
            last_generated_at = EXCLUDED.last_generated_at
        `, [
          place.id, 
          place.why_sentence, 
          JSON.stringify(place.why_tags || []), 
          place.last_generated_at || new Date().toISOString()
        ]);
      }
    }
    console.log(`✅ Imported ${places.length} places\n`);
    
    // Verify
    const count = await pool.query('SELECT COUNT(*) FROM places');
    const whyCount = await pool.query('SELECT COUNT(*) FROM why_this_place');
    console.log('📊 Verification:');
    console.log(`   Places: ${count.rows[0].count}`);
    console.log(`   Why This Place: ${whyCount.rows[0].count}\n`);
    
    await pool.end();
    console.log('✅ Import complete!');
    console.log('\n🚀 Next steps:');
    console.log('1. Add DATABASE_URL to Railway environment variables');
    console.log('2. Deploy the updated code');
    console.log('3. Your data is now on PostgreSQL!');
    
  } catch (err) {
    console.error('❌ Error:', err.message);
    await pool.end();
    process.exit(1);
  }
}

importToPostgres();
