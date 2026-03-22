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

// Initialize database
async function startServer() {
  try {
    db = await initDatabase();
    
    // Import initial data if database is empty
    const places = await getAllPlaces(db);
    if (places.length === 0) {
      console.log('📥 Database empty, waiting for import...');
    }
    
    console.log(`✅ Database ready with ${places.length} places`);
    
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
    const places = await getAllPlaces(db);
    const results = [];
    
    for (const place of places) {
      // Skip if already generated recently (within 7 days)
      const existing = await getWhyThisPlace(db, place.id);
      if (existing && existing.last_generated_at) {
        const daysSince = (Date.now() - new Date(existing.last_generated_at).getTime()) / (1000 * 60 * 60 * 24);
        if (daysSince < 7) {
          results.push({ placeId: place.id, name: place.name, status: 'skipped' });
          continue;
        }
      }
      
      try {
        // Get reviews
        let reviews = [];
        const placeWithReviews = await getPlaceById(db, place.id);
        reviews = placeWithReviews.reviews || [];
        
        // If no reviews but has google_place_id, fetch from Google
        if (reviews.length === 0 && place.google_place_id && GOOGLE_PLACES_API_KEY) {
          const googleData = await fetchGooglePlaceDetails(place.google_place_id);
          if (googleData.result && googleData.result.reviews) {
            reviews = googleData.result.reviews;
            
            // Save to database
            for (const review of reviews) {
              await addReview(db, place.id, {
                author: review.author_name,
                rating: review.rating,
                text: review.text,
                time: review.time ? new Date(review.time * 1000).toISOString() : null
              });
            }
          }
        }
        
        // Generate Why This Place
        const analysis = analyzeReviews(reviews);
        await setWhyThisPlace(db, place.id, analysis.sentence, analysis.tags);
        
        results.push({ placeId: place.id, name: place.name, status: 'generated' });
        
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

// Serve index.html for all routes (SPA support)
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'index.html'));
});

// Start server
startServer();
