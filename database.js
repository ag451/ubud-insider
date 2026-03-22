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
          hours TEXT,
          google_place_id TEXT,
          vibes TEXT,
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

      // Why This Place table
      db.run(`
        CREATE TABLE IF NOT EXISTS why_this_place (
          place_id INTEGER PRIMARY KEY,
          sentence TEXT,
          tags TEXT,
          last_generated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
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
      // Parse vibes from JSON for each place
      const places = rows.map(row => {
        if (row.vibes) {
          try {
            row.vibes = JSON.parse(row.vibes);
          } catch (e) {
            row.vibes = [];
          }
        } else {
          row.vibes = [];
        }
        return row;
      });
      resolve(places);
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

      // Parse vibes from JSON
      if (place.vibes) {
        try {
          place.vibes = JSON.parse(place.vibes);
        } catch (e) {
          place.vibes = [];
        }
      } else {
        place.vibes = [];
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
      rating, address, phone, website, hours, google_place_id, vibes
    } = place;

    // Convert vibes array to JSON string for storage
    const vibesJson = vibes ? JSON.stringify(vibes) : null;

    db.run(`
      INSERT INTO places (
        id, name, category, description, area, maps, lat, lng,
        rating, address, phone, website, hours, google_place_id, vibes, updated_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP)
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
        vibes = excluded.vibes,
        updated_at = CURRENT_TIMESTAMP
    `, [id, name, category, description, area, maps, lat, lng,
        rating, address, phone, website, hours, google_place_id, vibesJson], function(err) {
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

// Get Why This Place data
function getWhyThisPlace(db, placeId) {
  return new Promise((resolve, reject) => {
    db.get('SELECT * FROM why_this_place WHERE place_id = ?', [placeId], (err, row) => {
      if (err) {
        reject(err);
        return;
      }
      if (!row) {
        resolve(null);
        return;
      }
      resolve({
        sentence: row.sentence,
        tags: row.tags ? JSON.parse(row.tags) : [],
        last_generated_at: row.last_generated_at
      });
    });
  });
}

// Set Why This Place data
function setWhyThisPlace(db, placeId, sentence, tags) {
  return new Promise((resolve, reject) => {
    db.run(`
      INSERT INTO why_this_place (place_id, sentence, tags, last_generated_at)
      VALUES (?, ?, ?, CURRENT_TIMESTAMP)
      ON CONFLICT(place_id) DO UPDATE SET
        sentence = excluded.sentence,
        tags = excluded.tags,
        last_generated_at = CURRENT_TIMESTAMP
    `, [placeId, sentence, JSON.stringify(tags)], function(err) {
      if (err) {
        reject(err);
        return;
      }
      resolve({ id: placeId });
    });
  });
}

// Get all places with their Why This Place data
function getAllPlacesWithWhy(db) {
  return new Promise((resolve, reject) => {
    db.all(`
      SELECT p.*, w.sentence as why_sentence, w.tags as why_tags
      FROM places p
      LEFT JOIN why_this_place w ON p.id = w.place_id
      ORDER BY p.id
    `, [], (err, rows) => {
      if (err) {
        reject(err);
        return;
      }
      const places = rows.map(row => {
        // Parse vibes from JSON
        if (row.vibes) {
          try {
            row.vibes = JSON.parse(row.vibes);
          } catch (e) {
            row.vibes = [];
          }
        } else {
          row.vibes = [];
        }
        
        return {
          ...row,
          why_this_place: row.why_sentence ? {
            sentence: row.why_sentence,
            tags: row.why_tags ? JSON.parse(row.why_tags) : []
          } : null
        };
      });
      resolve(places);
    });
  });
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
