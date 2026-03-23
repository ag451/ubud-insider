// Backup and restore utilities for Railway ephemeral storage
const fs = require('fs').promises;
const path = require('path');

const BACKUP_FILE = path.join(__dirname, 'data', 'places-backup.json');

// Export all places data to JSON
async function exportPlaces(db) {
  return new Promise((resolve, reject) => {
    db.all(`
      SELECT p.*, 
        w.sentence as why_sentence, 
        w.tags as why_tags, 
        w.last_generated_at,
        (SELECT json_group_array(json_object(
          'text', text,
          'rating', rating,
          'author', author,
          'time', time
        )) FROM reviews WHERE place_id = p.id) as reviews,
        (SELECT json_group_array(json_object(
          'reference', reference,
          'url', url
        )) FROM photos WHERE place_id = p.id) as photos
      FROM places p
      LEFT JOIN why_this_place w ON p.id = w.place_id
      ORDER BY p.id
    `, [], async (err, rows) => {
      if (err) {
        reject(err);
        return;
      }
      
      // Parse JSON fields
      const places = rows.map(row => {
        if (row.vibes) {
          try { row.vibes = JSON.parse(row.vibes); } catch (e) { row.vibes = []; }
        }
        if (row.reviews) {
          try { row.reviews = JSON.parse(row.reviews); } catch (e) { row.reviews = []; }
        }
        if (row.photos) {
          try { row.photos = JSON.parse(row.photos); } catch (e) { row.photos = []; }
        }
        if (row.why_tags) {
          try { row.why_tags = JSON.parse(row.why_tags); } catch (e) { row.why_tags = []; }
        }
        return row;
      });
      
      // Ensure data directory exists
      await fs.mkdir(path.dirname(BACKUP_FILE), { recursive: true });
      
      // Write backup
      await fs.writeFile(BACKUP_FILE, JSON.stringify({
        exported_at: new Date().toISOString(),
        places: places
      }, null, 2));
      
      console.log(`💾 Exported ${places.length} places to ${BACKUP_FILE}`);
      resolve(places.length);
    });
  });
}

// Import places from JSON backup
async function importFromBackup(db) {
  try {
    const data = await fs.readFile(BACKUP_FILE, 'utf8');
    const backup = JSON.parse(data);
    
    if (!backup.places || !Array.isArray(backup.places)) {
      console.log('⚠️ No valid places found in backup');
      return 0;
    }
    
    // Import each place
    let imported = 0;
    for (const place of backup.places) {
      await new Promise((resolve, reject) => {
        const {
          id, name, category, description, area, maps, lat, lng,
          rating, address, phone, website, hours, google_place_id, vibes
        } = place;
        
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
        `, [id, name, category, description, area, maps, lat, lng, rating, address, phone, website, hours, google_place_id, 
            vibes ? JSON.stringify(vibes) : '[]'], 
        function(err) {
          if (err) reject(err);
          else resolve();
        });
      });
      
      // Import why_this_place if exists
      if (place.why_sentence) {
        await new Promise((resolve, reject) => {
          db.run(`
            INSERT INTO why_this_place (place_id, sentence, tags, last_generated_at)
            VALUES (?, ?, ?, ?)
            ON CONFLICT(place_id) DO UPDATE SET
              sentence = excluded.sentence,
              tags = excluded.tags,
              last_generated_at = excluded.last_generated_at
          `, [place.id, place.why_sentence, JSON.stringify(place.why_tags || []), place.last_generated_at || new Date().toISOString()],
          function(err) {
            if (err) reject(err);
            else resolve();
          });
        });
      }
      
      // Import reviews
      if (place.reviews && place.reviews.length > 0) {
        for (const review of place.reviews) {
          if (!review.text) continue;
          await new Promise((resolve, reject) => {
            db.run(`
              INSERT OR IGNORE INTO reviews (place_id, text, rating, author, time)
              VALUES (?, ?, ?, ?, ?)
            `, [place.id, review.text, review.rating, review.author, review.time],
            function(err) {
              if (err) reject(err);
              else resolve();
            });
          });
        }
      }
      
      imported++;
    }
    
    console.log(`📥 Restored ${imported} places from backup`);
    return imported;
  } catch (err) {
    if (err.code === 'ENOENT') {
      console.log('📭 No backup file found, starting fresh');
      return 0;
    }
    throw err;
  }
}

module.exports = { exportPlaces, importFromBackup, BACKUP_FILE };
