// Backup and restore utilities for Railway ephemeral storage.
//
// This module is database-agnostic: it routes through the helpers in
// database.js, which branch internally between PostgreSQL (production /
// Railway) and SQLite (local dev). This means auto-seeding from a committed
// backup works on a fresh Railway Postgres instance, not just SQLite.
const fs = require('fs').promises;
const path = require('path');
const {
  getAllPlaces,
  getPlaceById,
  upsertPlace,
  addReview,
  addPhoto,
  setWhyThisPlace
} = require('./database');

const BACKUP_FILE = path.join(__dirname, 'data', 'places-backup.json');

// Export all places (with reviews, photos, and "why this place") to JSON.
async function exportPlaces(db) {
  const summaries = await getAllPlaces(db);

  const places = [];
  for (const summary of summaries) {
    const place = await getPlaceById(db, summary.id);
    if (!place) continue;

    const why = place.why_this_place || null;
    places.push({
      id: place.id,
      name: place.name,
      category: place.category,
      description: place.description,
      area: place.area,
      maps: place.maps,
      lat: place.lat,
      lng: place.lng,
      rating: place.rating,
      price_level: place.price_level,
      address: place.address,
      phone: place.phone,
      website: place.website,
      hours: place.hours,
      google_place_id: place.google_place_id,
      vibes: place.vibes || [],
      created_at: place.created_at,
      reviews: (place.reviews || []).map(r => ({
        text: r.text,
        rating: r.rating,
        author: r.author,
        time: r.time
      })),
      photos: (place.photos || []).map(p => ({
        url: p.url,
        reference: p.reference,
        width: p.width,
        height: p.height,
        html_attributions: p.html_attributions || []
      })),
      why_sentence: why ? why.sentence : null,
      why_tags: why ? (why.tags || []) : [],
      last_generated_at: why ? why.last_generated_at : null
    });
  }

  await fs.mkdir(path.dirname(BACKUP_FILE), { recursive: true });
  await fs.writeFile(BACKUP_FILE, JSON.stringify({
    exported_at: new Date().toISOString(),
    places
  }, null, 2));

  console.log(`💾 Exported ${places.length} places to ${BACKUP_FILE}`);
  return places.length;
}

// Restore places from the JSON backup into whichever database is active.
async function importFromBackup(db) {
  let data;
  try {
    data = await fs.readFile(BACKUP_FILE, 'utf8');
  } catch (err) {
    if (err.code === 'ENOENT') {
      console.log('📭 No backup file found, starting fresh');
      return 0;
    }
    throw err;
  }

  const backup = JSON.parse(data);
  if (!backup.places || !Array.isArray(backup.places)) {
    console.log('⚠️ No valid places found in backup');
    return 0;
  }

  let imported = 0;
  for (const place of backup.places) {
    await upsertPlace(db, {
      id: place.id,
      name: place.name,
      category: place.category,
      description: place.description,
      area: place.area,
      maps: place.maps,
      lat: place.lat,
      lng: place.lng,
      rating: place.rating,
      price_level: place.price_level,
      address: place.address,
      phone: place.phone,
      website: place.website,
      hours: place.hours,
      google_place_id: place.google_place_id,
      vibes: place.vibes || []
    });

    if (place.why_sentence) {
      await setWhyThisPlace(db, place.id, place.why_sentence, place.why_tags || []);
    }

    if (Array.isArray(place.reviews)) {
      for (const review of place.reviews) {
        if (!review.text) continue;
        await addReview(db, place.id, review);
      }
    }

    if (Array.isArray(place.photos)) {
      for (const photo of place.photos) {
        if (!photo.url && !photo.reference) continue;
        await addPhoto(db, place.id, photo);
      }
    }

    imported++;
  }

  console.log(`📥 Restored ${imported} places from backup`);
  return imported;
}

module.exports = { exportPlaces, importFromBackup, BACKUP_FILE };
