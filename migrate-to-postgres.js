// Migration script: SQLite → PostgreSQL
// Usage: node migrate-to-postgres.js

require('dotenv').config();
const sqlite3 = require('sqlite3').verbose();
const { Pool } = require('pg');
const path = require('path');

const SQLITE_DB = path.join(__dirname, 'database.sqlite');

async function migrate() {
  console.log('🚀 Starting migration from SQLite to PostgreSQL...\n');
  
  // Check for PostgreSQL connection
  if (!process.env.DATABASE_URL) {
    console.error('❌ DATABASE_URL not set! Set it to your Railway Postgres URL:');
    console.error('   export DATABASE_URL="postgresql://..."');
    process.exit(1);
  }
  
  // Connect to PostgreSQL
  console.log('🔌 Connecting to PostgreSQL...');
  const pgPool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: { rejectUnauthorized: false }
  });
  
  try {
    await pgPool.query('SELECT NOW()');
    console.log('✅ PostgreSQL connected\n');
  } catch (err) {
    console.error('❌ Failed to connect to PostgreSQL:', err.message);
    process.exit(1);
  }
  
  // Connect to SQLite
  console.log('📦 Connecting to SQLite...');
  const sqliteDb = new sqlite3.Database(SQLITE_DB, sqlite3.OPEN_READONLY, (err) => {
    if (err) {
      console.error('❌ SQLite database not found:', err.message);
      console.log('   Run the app locally first to create the SQLite database');
      process.exit(1);
    }
  });
  
  console.log('✅ SQLite connected\n');
  
  // Create PostgreSQL tables
  console.log('📋 Creating PostgreSQL tables...');
  await pgPool.query(`
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
  
  await pgPool.query(`
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
  
  await pgPool.query(`
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
  
  await pgPool.query(`
    CREATE TABLE IF NOT EXISTS why_this_place (
      place_id INTEGER PRIMARY KEY REFERENCES places(id) ON DELETE CASCADE,
      sentence TEXT,
      tags JSONB DEFAULT '[]'::jsonb,
      last_generated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )
  `);
  
  console.log('✅ Tables created\n');
  
  // Migrate places
  console.log('📤 Migrating places...');
  const places = await new Promise((resolve, reject) => {
    sqliteDb.all('SELECT * FROM places ORDER BY id', [], (err, rows) => {
      if (err) reject(err);
      else resolve(rows);
    });
  });
  
  console.log(`   Found ${places.length} places in SQLite`);
  
  for (const place of places) {
    try {
      let vibes = [];
      if (place.vibes) {
        try { vibes = JSON.parse(place.vibes); } catch (e) { vibes = []; }
      }
      
      await pgPool.query(`
        INSERT INTO places (id, name, category, description, area, maps, lat, lng, rating, address, phone, website, hours, google_place_id, vibes, created_at)
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16)
        ON CONFLICT (id) DO NOTHING
      `, [
        place.id, place.name, place.category, place.description, place.area, 
        place.maps, place.lat, place.lng, place.rating, place.address, 
        place.phone, place.website, place.hours, place.google_place_id, 
        JSON.stringify(vibes), place.created_at || new Date().toISOString()
      ]);
    } catch (err) {
      console.error(`   ❌ Failed to migrate place ${place.id}:`, err.message);
    }
  }
  console.log('✅ Places migrated\n');
  
  // Migrate reviews
  console.log('📤 Migrating reviews...');
  const reviews = await new Promise((resolve, reject) => {
    sqliteDb.all('SELECT * FROM reviews ORDER BY id', [], (err, rows) => {
      if (err) reject(err);
      else resolve(rows);
    });
  });
  
  console.log(`   Found ${reviews.length} reviews in SQLite`);
  
  for (const review of reviews) {
    try {
      await pgPool.query(`
        INSERT INTO reviews (place_id, text, rating, author, time, created_at)
        VALUES ($1, $2, $3, $4, $5, $6)
      `, [review.place_id, review.text, review.rating, review.author, review.time, review.created_at || new Date().toISOString()]);
    } catch (err) {
      console.error(`   ❌ Failed to migrate review ${review.id}:`, err.message);
    }
  }
  console.log('✅ Reviews migrated\n');
  
  // Migrate photos
  console.log('📤 Migrating photos...');
  const photos = await new Promise((resolve, reject) => {
    sqliteDb.all('SELECT * FROM photos ORDER BY id', [], (err, rows) => {
      if (err) reject(err);
      else resolve(rows);
    });
  });
  
  console.log(`   Found ${photos.length} photos in SQLite`);
  
  for (const photo of photos) {
    try {
      let htmlAttributions = [];
      if (photo.html_attributions) {
        try { htmlAttributions = JSON.parse(photo.html_attributions); } catch (e) { htmlAttributions = []; }
      }
      
      await pgPool.query(`
        INSERT INTO photos (place_id, url, html_attributions, reference, width, height)
        VALUES ($1, $2, $3, $4, $5, $6)
      `, [photo.place_id, photo.url, JSON.stringify(htmlAttributions), photo.reference, photo.width, photo.height]);
    } catch (err) {
      console.error(`   ❌ Failed to migrate photo ${photo.id}:`, err.message);
    }
  }
  console.log('✅ Photos migrated\n');
  
  // Migrate why_this_place
  console.log('📤 Migrating Why This Place data...');
  const whyData = await new Promise((resolve, reject) => {
    sqliteDb.all('SELECT * FROM why_this_place ORDER BY place_id', [], (err, rows) => {
      if (err) reject(err);
      else resolve(rows);
    });
  });
  
  console.log(`   Found ${whyData.length} Why This Place entries in SQLite`);
  
  for (const why of whyData) {
    try {
      let tags = [];
      if (why.tags) {
        try { tags = JSON.parse(why.tags); } catch (e) { tags = []; }
      }
      
      await pgPool.query(`
        INSERT INTO why_this_place (place_id, sentence, tags, last_generated_at)
        VALUES ($1, $2, $3, $4)
        ON CONFLICT (place_id) DO NOTHING
      `, [why.place_id, why.sentence, JSON.stringify(tags), why.last_generated_at || new Date().toISOString()]);
    } catch (err) {
      console.error(`   ❌ Failed to migrate Why This Place ${why.place_id}:`, err.message);
    }
  }
  console.log('✅ Why This Place data migrated\n');
  
  // Verify migration
  console.log('📊 Verification:');
  const pgPlaces = await pgPool.query('SELECT COUNT(*) FROM places');
  const pgReviews = await pgPool.query('SELECT COUNT(*) FROM reviews');
  const pgPhotos = await pgPool.query('SELECT COUNT(*) FROM photos');
  const pgWhy = await pgPool.query('SELECT COUNT(*) FROM why_this_place');
  
  console.log(`   Places: ${pgPlaces.rows[0].count} / ${places.length}`);
  console.log(`   Reviews: ${pgReviews.rows[0].count} / ${reviews.length}`);
  console.log(`   Photos: ${pgPhotos.rows[0].count} / ${photos.length}`);
  console.log(`   Why This Place: ${pgWhy.rows[0].count} / ${whyData.length}`);
  
  // Close connections
  sqliteDb.close();
  await pgPool.end();
  
  console.log('\n✅ Migration complete!');
  console.log('\nNext steps:');
  console.log('1. Set DATABASE_URL in Railway environment variables');
  console.log('2. Deploy the updated code');
  console.log('3. Data will persist on PostgreSQL!');
}

migrate().catch(err => {
  console.error('Migration failed:', err);
  process.exit(1);
});
