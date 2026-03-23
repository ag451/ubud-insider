// Database module - supports SQLite (local) and PostgreSQL (Railway)
const { Pool } = require('pg');
const sqlite3 = require('sqlite3').verbose();
const path = require('path');

// Determine which database to use
const usePostgres = () => !!(process.env.DATABASE_URL || process.env.PGDATABASE);
let pgPool = null;

// Debug logging
console.log('📊 Database config check:');
console.log('   DATABASE_URL present:', !!process.env.DATABASE_URL);
console.log('   PGDATABASE present:', !!process.env.PGDATABASE);
console.log('   NODE_ENV:', process.env.NODE_ENV);

// Initialize database connection
async function initDatabase() {
  if (usePostgres()) {
    console.log('🔌 Using PostgreSQL database');
    return initPostgres();
  } else {
    console.log('📁 Using SQLite database');
    return initSQLite();
  }
}

// ========== POSTGRESQL ==========
async function initPostgres() {
  console.log('🔌 Using PostgreSQL database');
  
  pgPool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false
  });
  
  // Test connection
  const client = await pgPool.connect();
  console.log('✅ PostgreSQL connected');
  client.release();
  
  // Create tables if not exist
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
  
  console.log('✅ PostgreSQL tables ready');
  return pgPool;
}

// ========== SQLITE (local dev) ==========
function initSQLite() {
  console.log('📦 Using SQLite database (local)');
  
  return new Promise((resolve, reject) => {
    const db = new sqlite3.Database(path.join(__dirname, 'database.sqlite'), (err) => {
      if (err) reject(err);
      else {
        console.log('✅ SQLite connected');
        
        // Create tables
        db.exec(`
          CREATE TABLE IF NOT EXISTS places (
            id INTEGER PRIMARY KEY,
            name TEXT NOT NULL,
            category TEXT NOT NULL,
            description TEXT,
            area TEXT,
            maps TEXT,
            lat REAL,
            lng REAL,
            rating REAL,
            address TEXT,
            phone TEXT,
            website TEXT,
            hours TEXT,
            google_place_id TEXT,
            vibes TEXT DEFAULT '[]',
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP
          );
          
          CREATE TABLE IF NOT EXISTS reviews (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            place_id INTEGER,
            text TEXT,
            rating INTEGER,
            author TEXT,
            time INTEGER,
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (place_id) REFERENCES places(id) ON DELETE CASCADE
          );
          
          CREATE TABLE IF NOT EXISTS photos (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            place_id INTEGER,
            url TEXT,
            html_attributions TEXT DEFAULT '[]',
            reference TEXT,
            width INTEGER,
            height INTEGER,
            FOREIGN KEY (place_id) REFERENCES places(id) ON DELETE CASCADE
          );
          
          CREATE TABLE IF NOT EXISTS why_this_place (
            place_id INTEGER PRIMARY KEY,
            sentence TEXT,
            tags TEXT DEFAULT '[]',
            last_generated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (place_id) REFERENCES places(id) ON DELETE CASCADE
          );
        `, (err) => {
          if (err) reject(err);
          else {
            console.log('✅ SQLite tables ready');
            resolve(db);
          }
        });
      }
    });
  });
}

// ========== QUERY HELPERS ==========

async function getAllPlaces(db) {
  if (usePostgres()) {
    const result = await db.query(`
      SELECT p.*, w.sentence as why_sentence, w.tags as why_tags, w.last_generated_at
      FROM places p
      LEFT JOIN why_this_place w ON p.id = w.place_id
      ORDER BY p.id
    `);
    return result.rows.map(row => ({
      ...row,
      vibes: row.vibes || [],
      why_tags: row.why_tags || []
    }));
  } else {
    // SQLite
    return new Promise((resolve, reject) => {
      db.all(`
        SELECT p.*, w.sentence as why_sentence, w.tags as why_tags, w.last_generated_at
        FROM places p
        LEFT JOIN why_this_place w ON p.id = w.place_id
        ORDER BY p.id
      `, [], (err, rows) => {
        if (err) { reject(err); return; }
        const places = rows.map(row => {
          if (row.vibes) { try { row.vibes = JSON.parse(row.vibes); } catch (e) { row.vibes = []; }}
          else { row.vibes = []; }
          if (row.why_sentence) {
            row.why_this_place = {
              sentence: row.why_sentence,
              tags: row.why_tags ? JSON.parse(row.why_tags) : [],
              last_generated_at: row.last_generated_at
            };
          }
          return row;
        });
        resolve(places);
      });
    });
  }
}

async function getPlaceById(db, id) {
  if (usePostgres()) {
    const placeResult = await db.query(`
      SELECT p.*, w.sentence as why_sentence, w.tags as why_tags, w.last_generated_at
      FROM places p
      LEFT JOIN why_this_place w ON p.id = w.place_id
      WHERE p.id = $1
    `, [id]);
    
    if (placeResult.rows.length === 0) return null;
    const place = placeResult.rows[0];
    
    // Get reviews
    const reviewsResult = await db.query('SELECT * FROM reviews WHERE place_id = $1', [id]);
    place.reviews = reviewsResult.rows;
    
    // Get photos
    const photosResult = await db.query('SELECT * FROM photos WHERE place_id = $1', [id]);
    place.photos = photosResult.rows;
    
    // Parse JSON fields
    place.vibes = place.vibes || [];
    if (place.why_sentence) {
      place.why_this_place = {
        sentence: place.why_sentence,
        tags: place.why_tags || [],
        last_generated_at: place.last_generated_at
      };
    }
    
    return place;
  } else {
    // SQLite
    return new Promise((resolve, reject) => {
      db.get(`
        SELECT p.*, w.sentence as why_sentence, w.tags as why_tags, w.last_generated_at
        FROM places p
        LEFT JOIN why_this_place w ON p.id = w.place_id
        WHERE p.id = ?
      `, [id], async (err, place) => {
        if (err) { reject(err); return; }
        if (!place) { resolve(null); return; }
        
        if (place.vibes) { try { place.vibes = JSON.parse(place.vibes); } catch (e) { place.vibes = []; }}
        else { place.vibes = []; }
        
        if (place.why_sentence) {
          place.why_this_place = {
            sentence: place.why_sentence,
            tags: place.why_tags ? JSON.parse(place.why_tags) : [],
            last_generated_at: place.last_generated_at
          };
        }
        
        // Get reviews
        db.all('SELECT * FROM reviews WHERE place_id = ?', [id], (err, reviews) => {
          place.reviews = reviews || [];
          db.all('SELECT * FROM photos WHERE place_id = ?', [id], (err, photos) => {
            place.photos = photos || [];
            resolve(place);
          });
        });
      });
    });
  }
}

async function upsertPlace(db, place) {
  const { id, name, category, description, area, maps, lat, lng, rating, address, phone, website, hours, google_place_id, vibes } = place;
  
  if (usePostgres()) {
    await db.query(`
      INSERT INTO places (id, name, category, description, area, maps, lat, lng, rating, address, phone, website, hours, google_place_id, vibes)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15)
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
    `, [id, name, category, description, area, maps, lat, lng, rating, address, phone, website, hours, google_place_id, JSON.stringify(vibes || [])]);
  } else {
    // SQLite
    return new Promise((resolve, reject) => {
      db.run(`
        INSERT INTO places (id, name, category, description, area, maps, lat, lng, rating, address, phone, website, hours, google_place_id, vibes)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        ON CONFLICT(id) DO UPDATE SET
          name = excluded.name,
          category = excluded.category,
          description = excluded.description,
          area = excluded.area,
          maps = excluded.maps,
          lat = excluded.lat,
          lng = excluded.lng,
          rating = excluded.rating,
          address = excluded.address,
          phone = excluded.phone,
          website = excluded.website,
          hours = excluded.hours,
          google_place_id = excluded.google_place_id,
          vibes = excluded.vibes
      `, [id, name, category, description, area, maps, lat, lng, rating, address, phone, website, hours, google_place_id, JSON.stringify(vibes || [])], function(err) {
        if (err) reject(err);
        else resolve();
      });
    });
  }
}

async function deletePlace(db, id) {
  if (usePostgres()) {
    await db.query('DELETE FROM places WHERE id = $1', [id]);
  } else {
    return new Promise((resolve, reject) => {
      db.run('DELETE FROM places WHERE id = ?', [id], function(err) {
        if (err) reject(err);
        else resolve();
      });
    });
  }
}

async function addReview(db, placeId, review) {
  if (usePostgres()) {
    await db.query(`
      INSERT INTO reviews (place_id, text, rating, author, time)
      VALUES ($1, $2, $3, $4, $5)
      ON CONFLICT DO NOTHING
    `, [placeId, review.text, review.rating, review.author, review.time]);
  } else {
    return new Promise((resolve, reject) => {
      db.run(`
        INSERT OR IGNORE INTO reviews (place_id, text, rating, author, time)
        VALUES (?, ?, ?, ?, ?)
      `, [placeId, review.text, review.rating, review.author, review.time], function(err) {
        if (err) reject(err);
        else resolve();
      });
    });
  }
}

async function addPhoto(db, placeId, photo) {
  if (usePostgres()) {
    await db.query(`
      INSERT INTO photos (place_id, url, html_attributions, reference, width, height)
      VALUES ($1, $2, $3, $4, $5, $6)
    `, [placeId, photo.url, JSON.stringify(photo.html_attributions || []), photo.reference, photo.width, photo.height]);
  } else {
    return new Promise((resolve, reject) => {
      db.run(`
        INSERT INTO photos (place_id, url, html_attributions, reference, width, height)
        VALUES (?, ?, ?, ?, ?, ?)
      `, [placeId, photo.url, JSON.stringify(photo.html_attributions || []), photo.reference, photo.width, photo.height], function(err) {
        if (err) reject(err);
        else resolve();
      });
    });
  }
}

async function getWhyThisPlace(db, placeId) {
  if (usePostgres()) {
    const result = await db.query('SELECT * FROM why_this_place WHERE place_id = $1', [placeId]);
    if (result.rows.length === 0) return null;
    const row = result.rows[0];
    return {
      sentence: row.sentence,
      tags: row.tags || [],
      last_generated_at: row.last_generated_at
    };
  } else {
    return new Promise((resolve, reject) => {
      db.get('SELECT * FROM why_this_place WHERE place_id = ?', [placeId], (err, row) => {
        if (err) { reject(err); return; }
        if (!row) { resolve(null); return; }
        resolve({
          sentence: row.sentence,
          tags: row.tags ? JSON.parse(row.tags) : [],
          last_generated_at: row.last_generated_at
        });
      });
    });
  }
}

async function setWhyThisPlace(db, placeId, sentence, tags) {
  if (usePostgres()) {
    await db.query(`
      INSERT INTO why_this_place (place_id, sentence, tags, last_generated_at)
      VALUES ($1, $2, $3, CURRENT_TIMESTAMP)
      ON CONFLICT (place_id) DO UPDATE SET
        sentence = EXCLUDED.sentence,
        tags = EXCLUDED.tags,
        last_generated_at = EXCLUDED.last_generated_at
    `, [placeId, sentence, JSON.stringify(tags || [])]);
  } else {
    return new Promise((resolve, reject) => {
      db.run(`
        INSERT INTO why_this_place (place_id, sentence, tags, last_generated_at)
        VALUES (?, ?, ?, datetime('now'))
        ON CONFLICT(place_id) DO UPDATE SET
          sentence = excluded.sentence,
          tags = excluded.tags,
          last_generated_at = excluded.last_generated_at
      `, [placeId, sentence, JSON.stringify(tags || [])], function(err) {
        if (err) reject(err);
        else resolve();
      });
    });
  }
}

async function getAllPlacesWithWhy(db) {
  if (usePostgres()) {
    const result = await db.query(`
      SELECT p.*, w.sentence, w.tags as why_tags
      FROM places p
      LEFT JOIN why_this_place w ON p.id = w.place_id
      ORDER BY p.id
    `);
    return result.rows;
  } else {
    return new Promise((resolve, reject) => {
      db.all(`
        SELECT p.*, w.sentence, w.tags as why_tags
        FROM places p
        LEFT JOIN why_this_place w ON p.id = w.place_id
        ORDER BY p.id
      `, [], (err, rows) => {
        if (err) reject(err);
        else resolve(rows);
      });
    });
  }
}

async function importInitialData(db, places) {
  for (const place of places) {
    await upsertPlace(db, place);
  }
  console.log(`📥 Imported ${places.length} places`);
}

module.exports = {
  initDatabase,
  getAllPlaces,
  getPlaceById,
  upsertPlace,
  deletePlace,
  addReview,
  addPhoto,
  importInitialData,
  getWhyThisPlace,
  setWhyThisPlace,
  getAllPlacesWithWhy
};
