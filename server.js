const express = require('express');
const path = require('path');
const https = require('https');
const {
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
} = require('./database');
const { analyzeReviews } = require('./reviewAnalyzer');
const { exportPlaces, importFromBackup } = require('./backup');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(express.json());
app.use(express.static(path.join(__dirname)));

// Google Places API configuration
const GOOGLE_PLACES_API_KEY = process.env.GOOGLE_PLACES_API_KEY || '';
console.log('🔑 GOOGLE_PLACES_API_KEY:', GOOGLE_PLACES_API_KEY ? 'Set (hidden)' : 'NOT SET');

// Database instance
let db = null;

// Helper: Generate Why This Place from description when no reviews available
function generateDescriptionBasedWhy(place) {
  const name = place.name;
  const description = place.description || '';
  const category = place.category || '';
  const area = place.area || 'Ubud';
  
  // Category-based templates
  const templates = {
    breakfast: [
      `${name} serves up reliable breakfast classics in ${area}. A solid choice to start your day.`,
      `Morning spot in ${area} with consistent quality. Regulars keep coming back for a reason.`,
      `No-nonsense breakfast in ${area}. The kind of place that doesn't need to try too hard.`
    ],
    dinner: [
      `Dinner spot in ${area} worth knowing about. Good food without the tourist-trap vibes.`,
      `Evening dining in ${area} that delivers. Come hungry and you won't be disappointed.`,
      `${name} handles dinner service well. Reliable choice in the ${area} area.`
    ],
    vegetarian: [
      `Plant-based eats in ${area} that even non-vegetarians enjoy. Flavor comes first here.`,
      `Thoughtful vegetarian food in ${area}. The kitchen knows how to work with vegetables.`,
      `Meat-free dining in ${area} without compromise. Worth seeking out.`
    ],
    warung: [
      `Local warung in ${area} serving authentic flavors at honest prices. Skip the fancy places.`,
      `Neighborhood spot in ${area} where locals actually eat. The real deal.`,
      `Warung-style dining in ${area}. Simple food done right, wallet-friendly prices.`
    ],
    'fine dining': [
      `Upscale experience in ${area} for when you want to treat yourself. Special occasion worthy.`,
      `Special dinner destination in ${area}. The extra effort shows on every plate.`,
      `${name} brings refined dining to ${area}. Worth dressing up for.`
    ],
    drinks: [
      `Evening spot in ${area} with good drinks and better vibes. Settle in for a while.`,
      `Bar scene in ${area} done right. Come solo or with friends - both work here.`,
      `Drinks destination in ${area}. The bartenders know what they're doing.`
    ],
    yoga: [
      `Yoga studio in ${area} with solid teaching. Your practice will feel the difference.`,
      `Well-run classes in ${area} for all levels. No ego, just yoga.`,
      `${name} keeps the yoga tradition alive in ${area}. Worth unrolling your mat here.`
    ],
    healers: [
      `Healing practice in ${area} with genuine intentions. Come with an open mind.`,
      `Wellness spot in ${area} that takes the work seriously. Results speak for themselves.`,
      `Alternative healing in ${area} worth exploring. The practitioners are the real deal.`
    ],
    massage: [
      `Massage spot in ${area} that knows how to fix tired muscles. Skip the fancy spas.`,
      `Bodywork in ${area} done right. You'll walk out feeling like a new person.`,
      `Therapeutic touch in ${area} at fair prices. Book extra time - you'll want it.`
    ],
    walks: [
      `Scenic walk in ${area} worth the effort. Bring water and take your time.`,
      `${area} path that rewards the curious. Early morning or late afternoon are best.`,
      `Walking route in ${area} away from the crowds. Your own slice of Ubud peace.`
    ],
    excursions: [
      `Day trip from Ubud that's worth the journey. Plan for a full morning or afternoon.`,
      `Excursion that delivers on the hype. Beat the crowds by going early.`,
      `Must-see spot worth leaving town for. The photos don't do it justice.`
    ]
  };
  
  // Pick template based on category
  const catTemplates = templates[category] || templates['breakfast'];
  const template = catTemplates[Math.floor(Math.random() * catTemplates.length)];
  
  // If we have a description, try to incorporate it
  if (description && description.length > 10) {
    // Use description as a hint but keep it natural
    const descHint = description.split('.')[0]; // First sentence
    if (descHint.length > 5 && descHint.length < 60) {
      return `${descHint}. ${template.split('.').slice(1).join('.').trim()}`;
    }
  }
  
  return template;
}

// Helper: Generate tags from place data
function generateTagsFromPlace(place) {
  const tags = [];
  const category = place.category || '';
  const area = place.area || '';
  
  // Category-based tags
  const categoryTags = {
    breakfast: ['Breakfast Spot', 'Morning Favorite'],
    dinner: ['Dinner', 'Evening Dining'],
    vegetarian: ['Vegetarian', 'Plant-based'],
    warung: ['Local Warung', 'Authentic'],
    'fine dining': ['Fine Dining', 'Special Occasion'],
    drinks: ['Drinks', 'Evening Spot'],
    yoga: ['Yoga', 'Wellness'],
    healers: ['Healing', 'Alternative'],
    massage: ['Massage', 'Relaxation'],
    walks: ['Walk', 'Scenic'],
    excursions: ['Day Trip', 'Must See']
  };
  
  if (categoryTags[category]) {
    tags.push(...categoryTags[category]);
  }
  
  // Area-based tags
  if (area) {
    if (area.toLowerCase().includes('centre') || area.toLowerCase().includes('center')) {
      tags.push('Central');
    } else if (area.toLowerCase().includes('rice')) {
      tags.push('Rice Field Views');
    } else if (area.toLowerCase().includes('jungle')) {
      tags.push('Jungle Setting');
    } else {
      tags.push(area);
    }
  }
  
  // Add generic tags based on description
  const desc = (place.description || '').toLowerCase();
  if (desc.includes('cheap') || desc.includes('affordable')) tags.push('Good Value');
  if (desc.includes('popular') || desc.includes('famous')) tags.push('Popular');
  if (desc.includes('quiet') || desc.includes('peaceful')) tags.push('Quiet');
  if (desc.includes('view') || desc.includes('scenic')) tags.push('Great Views');
  
  return tags.slice(0, 3); // Max 3 tags
}

// Initialize database
async function startServer() {
  try {
    db = await initDatabase();
    
    // Try to restore from backup if database is empty
    const places = await getAllPlaces(db);
    if (places.length === 0) {
      console.log('📥 Database empty, attempting to restore from backup...');
      const restored = await importFromBackup(db);
      if (restored > 0) {
        console.log(`✅ Restored ${restored} places from backup`);
      } else {
        console.log('📭 No backup available, starting fresh');
      }
    } else {
      console.log(`✅ Database ready with ${places.length} places`);
      // Export backup on startup to keep file current
      try {
        await exportPlaces(db);
      } catch (exportErr) {
        console.log('⚠️ Could not export backup:', exportErr.message);
      }
    }
    
    app.listen(PORT, () => {
      console.log(`🚀 Ubud Insider server running on port ${PORT}`);
    });
  } catch (err) {
    console.error('❌ Failed to start server:', err);
    process.exit(1);
  }
}

// ========== GOOGLE PLACES PROXY (MUST BE BEFORE /:id route) ==========

// Search Google Places
app.get('/api/places/search', async (req, res) => {
  if (!GOOGLE_PLACES_API_KEY) {
    console.error('❌ Google Places API key not configured');
    return res.status(500).json({ error: 'Google Places API key not configured' });
  }
  
  const { query, location } = req.query;
  if (!query) {
    return res.status(400).json({ error: 'Query parameter required' });
  }
  
  const searchUrl = `https://maps.googleapis.com/maps/api/place/findplacefromtext/json?` +
    `input=${encodeURIComponent(query)}&` +
    `inputtype=textquery&` +
    `fields=place_id,name,formatted_address,rating,user_ratings_total,geometry&` +
    `locationbias=circle:5000@${location || '-8.5069,115.2625'}&` +
    `key=${GOOGLE_PLACES_API_KEY}`;
  
  try {
    const data = await fetchFromGoogle(searchUrl);
    res.json(data);
  } catch (err) {
    console.error('❌ Places search error:', err.message);
    res.status(500).json({ error: 'Failed to fetch place data', details: err.message });
  }
});

// Get Google Place details
app.get('/api/places/details', async (req, res) => {
  if (!GOOGLE_PLACES_API_KEY) {
    return res.status(500).json({ error: 'Google Places API key not configured' });
  }
  
  const { placeId } = req.query;
  if (!placeId) {
    return res.status(400).json({ error: 'placeId parameter required' });
  }
  
  const fields = ['name', 'formatted_address', 'formatted_phone_number', 'opening_hours', 
                  'rating', 'reviews', 'photos', 'website', 'url', 'geometry'];
  
  const detailsUrl = `https://maps.googleapis.com/maps/api/place/details/json?` +
    `place_id=${placeId}&` +
    `fields=${fields.join(',')}&` +
    `key=${GOOGLE_PLACES_API_KEY}`;
  
  try {
    const data = await fetchFromGoogle(detailsUrl);
    res.json(data);
  } catch (err) {
    console.error('❌ Places details error:', err);
    res.status(500).json({ error: 'Failed to fetch place details' });
  }
});

// Get Google Place photo
app.get('/api/places/photo', async (req, res) => {
  if (!GOOGLE_PLACES_API_KEY) {
    return res.status(500).json({ error: 'Google Places API key not configured' });
  }
  
  const { photoReference, maxWidth } = req.query;
  if (!photoReference) {
    return res.status(400).json({ error: 'photoReference parameter required' });
  }
  
  const photoUrl = `https://maps.googleapis.com/maps/api/place/photo?` +
    `maxwidth=${maxWidth || 400}&` +
    `photoreference=${photoReference}&` +
    `key=${GOOGLE_PLACES_API_KEY}`;
  
  res.redirect(photoUrl);
});

// ========== WHY THIS PLACE API ==========

// Get Why This Place for a specific place
app.get('/api/places/:id/why', async (req, res) => {
  try {
    const placeId = parseInt(req.params.id);
    const whyData = await getWhyThisPlace(db, placeId);
    
    if (!whyData) {
      return res.status(404).json({ error: 'Why This Place not generated yet' });
    }
    
    res.json(whyData);
  } catch (err) {
    console.error('Error getting Why This Place:', err);
    res.status(500).json({ error: 'Failed to get Why This Place' });
  }
});

// Generate Why This Place for a specific place
app.post('/api/places/:id/why/generate', async (req, res) => {
  try {
    const placeId = parseInt(req.params.id);
    
    // Get place with reviews
    const place = await getPlaceById(db, placeId);
    if (!place) {
      return res.status(404).json({ error: 'Place not found' });
    }
    
    // Check if we have reviews in the database
    let reviews = place.reviews || [];
    
    // If no reviews in DB but we have a google_place_id, fetch from Google
    if (reviews.length === 0 && place.google_place_id && GOOGLE_PLACES_API_KEY) {
      const googleData = await fetchGooglePlaceDetails(place.google_place_id);
      if (googleData.result && googleData.result.reviews) {
        reviews = googleData.result.reviews;
        
        // Save reviews to database
        for (const review of googleData.result.reviews) {
          await addReview(db, placeId, {
            author: review.author_name,
            rating: review.rating,
            text: review.text,
            time: review.time ? new Date(review.time * 1000).toISOString() : null
          });
        }
      }
    }
    
    // Analyze reviews and generate Why This Place
    const analysis = analyzeReviews(reviews);
    
    // Save to database
    await setWhyThisPlace(db, placeId, analysis.sentence, analysis.tags);
    
    res.json(analysis);
  } catch (err) {
    console.error('Error generating Why This Place:', err);
    res.status(500).json({ error: 'Failed to generate Why This Place' });
  }
});

// Batch generate Why This Place for all places
app.post('/api/places/why/batch-generate', async (req, res) => {
  try {
    const { force = false } = req.body;
    const places = await getAllPlaces(db);
    const results = [];
    
    for (const place of places) {
      // Skip if already generated recently (within 7 days) unless force is true
      if (!force) {
        const existing = await getWhyThisPlace(db, place.id);
        if (existing && existing.last_generated_at) {
          const daysSince = (Date.now() - new Date(existing.last_generated_at).getTime()) / (1000 * 60 * 60 * 24);
          if (daysSince < 7) {
            results.push({ placeId: place.id, name: place.name, status: 'skipped' });
            continue;
          }
        }
      }
      
      try {
        // Get reviews
        let reviews = [];
        const placeWithReviews = await getPlaceById(db, place.id);
        reviews = placeWithReviews.reviews || [];
        
        console.log(`📍 ${place.name}: Found ${reviews.length} reviews in database`);
        
        // If no reviews but has google_place_id, fetch from Google
        if (reviews.length === 0 && place.google_place_id && GOOGLE_PLACES_API_KEY) {
          console.log(`  🔍 Fetching from Google Places API...`);
          const googleData = await fetchGooglePlaceDetails(place.google_place_id);
          if (googleData.result && googleData.result.reviews) {
            reviews = googleData.result.reviews;
            console.log(`  ✅ Fetched ${reviews.length} reviews from Google`);
            
            // Save to database
            for (const review of reviews) {
              await addReview(db, place.id, {
                author: review.author_name,
                rating: review.rating,
                text: review.text,
                time: review.time ? new Date(review.time * 1000).toISOString() : null
              });
            }
          } else {
            console.log(`  ⚠️ No reviews found in Google Places data`);
          }
        }
        
        // Debug: log sample review
        if (reviews.length > 0) {
          console.log(`  📝 Sample review: "${reviews[0].text?.substring(0, 60)}..." (rating: ${reviews[0].rating})`);
        }
        
        // Generate Why This Place
        const analysis = analyzeReviews(reviews);
        console.log(`  ✨ Generated: "${analysis.sentence}"`);
        
        await setWhyThisPlace(db, place.id, analysis.sentence, analysis.tags);
        
        results.push({ placeId: place.id, name: place.name, status: 'generated', sentence: analysis.sentence });
        
        // Small delay to avoid rate limiting
        await new Promise(resolve => setTimeout(resolve, 200));
      } catch (err) {
        console.error(`❌ Error generating for ${place.name}:`, err.message);
        results.push({ placeId: place.id, name: place.name, status: 'error', error: err.message });
      }
    }
    
    res.json({ message: `Processed ${results.length} places`, results });
  } catch (err) {
    console.error('Error in batch generate:', err);
    res.status(500).json({ error: 'Failed to batch generate' });
  }
});

// Directly set Why This Place data (for manual/admin updates)
// Triggered redeploy: March 23, 2026
app.post('/api/places/:id/why/set', async (req, res) => {
  try {
    const placeId = parseInt(req.params.id);
    const { sentence, tags } = req.body;
    
    if (!sentence || !tags || !Array.isArray(tags)) {
      return res.status(400).json({ error: 'sentence and tags array required' });
    }
    
    await setWhyThisPlace(db, placeId, sentence, tags);
    
    res.json({ 
      success: true, 
      placeId, 
      sentence, 
      tags,
      message: 'Why This Place updated successfully'
    });
  } catch (err) {
    console.error('Error setting Why This Place:', err);
    res.status(500).json({ error: 'Failed to set Why This Place' });
  }
});

// Sync vibes from data.js to database
app.post('/api/places/sync-vibes', async (req, res) => {
  try {
    // Import data.js to get original vibes
    const dataPath = path.join(__dirname, 'data.js');
    delete require.cache[require.resolve(dataPath)];
    const { UBUD_DATA } = require(dataPath);
    
    const results = [];
    
    for (const place of UBUD_DATA.places) {
      if (place.vibes && place.vibes.length > 0) {
        try {
          // Update place with vibes
          await upsertPlace(db, place);
          results.push({ id: place.id, name: place.name, vibes: place.vibes, status: 'updated' });
        } catch (err) {
          results.push({ id: place.id, name: place.name, status: 'error', error: err.message });
        }
      }
    }
    
    res.json({ message: `Synced vibes for ${results.filter(r => r.status === 'updated').length} places`, results });
  } catch (err) {
    console.error('Error syncing vibes:', err);
    res.status(500).json({ error: 'Failed to sync vibes' });
  }
});

// Helper to fetch Google Place details
async function fetchGooglePlaceDetails(placeId) {
  const fields = ['name', 'formatted_address', 'formatted_phone_number', 'opening_hours', 
                  'rating', 'reviews', 'photos', 'website', 'url', 'geometry'];
  
  const detailsUrl = `https://maps.googleapis.com/maps/api/place/details/json?` +
    `place_id=${placeId}&` +
    `fields=${fields.join(',')}&` +
    `key=${GOOGLE_PLACES_API_KEY}`;
  
  return fetchFromGoogle(detailsUrl);
}

// ========== DATABASE API ROUTES ==========

// Get all places
app.get('/api/places', async (req, res) => {
  try {
    const places = await getAllPlaces(db);
    res.json(places);
  } catch (err) {
    console.error('Error getting places:', err);
    res.status(500).json({ error: 'Failed to get places' });
  }
});

// Bulk import places
app.post('/api/places/import', async (req, res) => {
  try {
    const { places } = req.body;
    if (!Array.isArray(places)) {
      return res.status(400).json({ error: 'Places array required' });
    }
    
    for (const place of places) {
      await upsertPlace(db, place);
    }
    
    res.json({ message: `Imported ${places.length} places` });
  } catch (err) {
    console.error('Error importing places:', err);
    res.status(500).json({ error: 'Failed to import places' });
  }
});

// Get single place (MUST BE AFTER /search, /details, /photo)
app.get('/api/places/:id', async (req, res) => {
  try {
    const place = await getPlaceById(db, req.params.id);
    if (!place) {
      return res.status(404).json({ error: 'Place not found' });
    }
    res.json(place);
  } catch (err) {
    console.error('Error getting place:', err);
    res.status(500).json({ error: 'Failed to get place' });
  }
});

// Create new place
app.post('/api/places', async (req, res) => {
  try {
    const place = req.body;
    
    // Generate ID if not provided
    if (!place.id) {
      const places = await getAllPlaces(db);
      place.id = Math.max(...places.map(p => p.id), 0) + 1;
    }
    
    await upsertPlace(db, place);
    
    // Auto-generate Why This Place if we have enough info
    if (place.google_place_id || place.description) {
      console.log(`📝 Auto-generating Why This Place for: ${place.name}`);
      
      // Run in background - don't block the response
      (async () => {
        try {
          let reviews = [];
          
          // Try to fetch from Google if we have a place ID
          if (place.google_place_id && GOOGLE_PLACES_API_KEY) {
            try {
              const googleData = await fetchGooglePlaceDetails(place.google_place_id);
              if (googleData.result && googleData.result.reviews) {
                reviews = googleData.result.reviews;
                console.log(`  ✅ Fetched ${reviews.length} reviews from Google`);
                
                // Save reviews to database
                for (const review of reviews) {
                  await addReview(db, place.id, {
                    text: review.text,
                    rating: review.rating,
                    author: review.author_name,
                    time: review.time
                  });
                }
              }
            } catch (fetchErr) {
              console.log(`  ⚠️ Could not fetch Google reviews: ${fetchErr.message}`);
            }
          }
          
          // Generate Why This Place using our researched templates if no reviews
          if (reviews.length === 0) {
            // Use description-based generation
            const sentence = generateDescriptionBasedWhy(place);
            const tags = generateTagsFromPlace(place);
            
            await setWhyThisPlace(db, place.id, sentence, tags);
            console.log(`  ✅ Generated Why This Place from description`);
          } else {
            // Use review-based generation
            const analysis = analyzeReviews(reviews, place.category, place.name);
            await setWhyThisPlace(db, place.id, analysis.sentence, analysis.tags);
            console.log(`  ✅ Generated Why This Place from reviews`);
          }
        } catch (genErr) {
          console.error(`  ❌ Failed to auto-generate Why This Place:`, genErr);
        }
      })();
    }
    
    res.status(201).json({ id: place.id, message: 'Place created' });
  } catch (err) {
    console.error('Error creating place:', err);
    res.status(500).json({ error: 'Failed to create place' });
  }
});

// Update place with reviews and photos
app.put('/api/places/:id', async (req, res) => {
  try {
    const place = { ...req.body, id: parseInt(req.params.id) };
    
    // Update main place data
    await upsertPlace(db, place);
    
    // Save reviews if provided
    if (place.reviews && Array.isArray(place.reviews)) {
      // Delete old reviews first
      await new Promise((resolve, reject) => {
        db.run('DELETE FROM reviews WHERE place_id = ?', [place.id], (err) => {
          if (err) reject(err);
          else resolve();
        });
      });
      
      // Insert new reviews
      for (const review of place.reviews.slice(0, 5)) { // Max 5 reviews
        await addReview(db, place.id, review);
      }
    }
    
    // Save photos if provided
    if (place.photos && Array.isArray(place.photos)) {
      // Delete old photos first
      await new Promise((resolve, reject) => {
        db.run('DELETE FROM photos WHERE place_id = ?', [place.id], (err) => {
          if (err) reject(err);
          else resolve();
        });
      });
      
      // Insert new photos
      for (const photo of place.photos.slice(0, 5)) { // Max 5 photos
        await addPhoto(db, place.id, photo);
      }
    }
    
    res.json({ message: 'Place updated' });
  } catch (err) {
    console.error('Error updating place:', err);
    res.status(500).json({ error: 'Failed to update place' });
  }
});

// Delete place
app.delete('/api/places/:id', async (req, res) => {
  try {
    await deletePlace(db, parseInt(req.params.id));
    res.json({ message: 'Place deleted' });
  } catch (err) {
    console.error('Error deleting place:', err);
    res.status(500).json({ error: 'Failed to delete place' });
  }
});

// Helper function to fetch from Google API
function fetchFromGoogle(url) {
  return new Promise((resolve, reject) => {
    https.get(url, (response) => {
      let data = '';
      response.on('data', chunk => data += chunk);
      response.on('end', () => {
        try {
          resolve(JSON.parse(data));
        } catch (e) {
          reject(e);
        }
      });
    }).on('error', reject);
  });
}

// ========== BACKUP & RESTORE ENDPOINTS ==========

// Manual backup trigger
app.post('/api/admin/backup', async (req, res) => {
  try {
    const count = await exportPlaces(db);
    res.json({ success: true, message: `Backed up ${count} places`, file: 'data/places-backup.json' });
  } catch (err) {
    console.error('Backup error:', err);
    res.status(500).json({ error: 'Backup failed', details: err.message });
  }
});

// Manual restore trigger
app.post('/api/admin/restore', async (req, res) => {
  try {
    const count = await importFromBackup(db);
    res.json({ success: true, message: `Restored ${count} places from backup` });
  } catch (err) {
    console.error('Restore error:', err);
    res.status(500).json({ error: 'Restore failed', details: err.message });
  }
});

// Get backup status
app.get('/api/admin/backup-status', async (req, res) => {
  try {
    const fs = require('fs');
    const stats = await fs.promises.stat(BACKUP_FILE).catch(() => null);
    const placeCount = (await getAllPlaces(db)).length;
    
    res.json({
      places_in_database: placeCount,
      backup_exists: !!stats,
      last_backup: stats ? new Date(stats.mtime).toISOString() : null,
      backup_file: 'data/places-backup.json'
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ========== STATIC FILES & SPA SUPPORT ==========

// Serve index.html for all routes (SPA support)
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'index.html'));
});

// Start server
startServer();
