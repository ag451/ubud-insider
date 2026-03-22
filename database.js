const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const DB_PATH = process.env.DB_PATH || path.join(__dirname, 'ubud_places.db');

// Initialize database
function initDatabase() {
  return new Promise((resolve, reject) => {
    const db = new sqlite3.Database(DB_PATH, (err) => {
      if (err) {
        console.error('Error opening database:', err);
        reject(err);
        return;
      }
      console.log('✅ Connected to SQLite database');
    });

    // Create tables
    db.serialize(() => {
      // Places table
      db.run(`
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
          google_place_id TEXT,
          created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
          updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
        )
      `);

      // Reviews table
      db.run(`
        CREATE TABLE IF NOT EXISTS reviews (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          place_id INTEGER,
          author TEXT,
          rating INTEGER,
          text TEXT,
          time TEXT,
          FOREIGN KEY (place_id) REFERENCES places(id) ON DELETE CASCADE
        )
      `);

      // Photos table
      db.run(`
        CREATE TABLE IF NOT EXISTS photos (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          place_id INTEGER,
          reference TEXT,
          width INTEGER,
          height INTEGER,
          FOREIGN KEY (place_id) REFERENCES places(id) ON DELETE CASCADE
        )
      `);
    });

    resolve(db);
  });
}

// Get all places
function getAllPlaces(db) {
  return new Promise((resolve, reject) => {
    db.all('SELECT * FROM places ORDER BY id', [], (err, rows) => {
      if (err) {
        reject(err);
        return;
      }
      resolve(rows);
    });
  });
}

// Get place by ID with reviews and photos
function getPlaceById(db, id) {
  return new Promise((resolve, reject) => {
    db.get('SELECT * FROM places WHERE id = ?', [id], (err, place) => {
      if (err) {
        reject(err);
        return;
      }
      if (!place) {
        resolve(null);
        return;
      }

      // Get reviews
      db.all('SELECT * FROM reviews WHERE place_id = ?', [id], (err, reviews) => {
        if (err) {
          reject(err);
          return;
        }
        place.reviews = reviews || [];

        // Get photos
        db.all('SELECT * FROM photos WHERE place_id = ?', [id], (err, photos) => {
          if (err) {
            reject(err);
            return;
          }
          place.photos = photos || [];
          resolve(place);
        });
      });
    });
  });
}

// Insert or update place
function upsertPlace(db, place) {
  return new Promise((resolve, reject) => {
    const {
      id, name, category, description, area, maps, lat, lng,
      rating, address, phone, website, google_place_id
    } = place;

    db.run(`
      INSERT INTO places (
        id, name, category, description, area, maps, lat, lng,
        rating, address, phone, website, google_place_id, updated_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP)
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
        google_place_id = excluded.google_place_id,
        updated_at = CURRENT_TIMESTAMP
    `, [id, name, category, description, area, maps, lat, lng,
        rating, address, phone, website, google_place_id], function(err) {
      if (err) {
        reject(err);
        return;
      }
      resolve({ id: id || this.lastID });
    });
  });
}

// Delete place
function deletePlace(db, id) {
  return new Promise((resolve, reject) => {
    db.run('DELETE FROM places WHERE id = ?', [id], function(err) {
      if (err) {
        reject(err);
        return;
      }
      resolve({ changes: this.changes });
    });
  });
}

// Add review
function addReview(db, placeId, review) {
  return new Promise((resolve, reject) => {
    const { author, rating, text, time } = review;
    db.run(
      'INSERT INTO reviews (place_id, author, rating, text, time) VALUES (?, ?, ?, ?, ?)',
      [placeId, author, rating, text, time],
      function(err) {
        if (err) {
          reject(err);
          return;
        }
        resolve({ id: this.lastID });
      }
    );
  });
}

// Add photo
function addPhoto(db, placeId, photo) {
  return new Promise((resolve, reject) => {
    const { reference, width, height } = photo;
    db.run(
      'INSERT INTO photos (place_id, reference, width, height) VALUES (?, ?, ?, ?)',
      [placeId, reference, width, height],
      function(err) {
        if (err) {
          reject(err);
          return;
        }
        resolve({ id: this.lastID });
      }
    );
  });
}

// Import initial data
async function importInitialData(db, placesData) {
  console.log('📥 Importing initial data...');
  
  for (const place of placesData) {
    try {
      await upsertPlace(db, place);
    } catch (err) {
      console.error(`Error importing place ${place.name}:`, err);
    }
  }
  
  console.log(`✅ Imported ${placesData.length} places`);
}

module.exports = {
  initDatabase,
  getAllPlaces,
  getPlaceById,
  upsertPlace,
  deletePlace,
  addReview,
  addPhoto,
  importInitialData
};
