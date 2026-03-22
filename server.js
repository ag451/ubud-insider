const express = require('express');
const path = require('path');
const https = require('https');
const {
  initDatabase,
  getAllPlaces,
  getPlaceById,
  upsertPlace,
  deletePlace,
  importInitialData
} = require('./database');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(express.json());
app.use(express.static(path.join(__dirname)));

// Google Places API configuration
const GOOGLE_PLACES_API_KEY = process.env.GOOGLE_PLACES_API_KEY || '';

// Database instance
let db = null;

// Initialize database
async function startServer() {
  try {
    db = await initDatabase();
    
    // Import initial data if database is empty
    const places = await getAllPlaces(db);
    if (places.length === 0) {
      // Load initial data from data.js
      const fs = require('fs');
      const dataContent = fs.readFileSync(path.join(__dirname, 'data.js'), 'utf8');
      
      // Extract places array from data.js (simple approach)
      const placesMatch = dataContent.match(/places:\s*\[(.*?)\n\s*\]/s);
      if (placesMatch) {
        console.log('Found places data in data.js');
        // Note: In production, you'd parse this properly
        // For now, we'll import on first API call if needed
      }
    }
    
    console.log(`✅ Database ready with ${places.length} places`);
    
    app.listen(PORT, () => {
      console.log(`Ubud Insider server running on port ${PORT}`);
    });
  } catch (err) {
    console.error('Failed to start server:', err);
    process.exit(1);
  }
}

// ========== API ROUTES ==========

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

// Get single place
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

// Update place
app.put('/api/places/:id', async (req, res) => {
  try {
    const place = { ...req.body, id: parseInt(req.params.id) };
    await upsertPlace(db, place);
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

// ========== GOOGLE PLACES PROXY ==========

// Search Google Places
app.get('/api/places/search', async (req, res) => {
  if (!GOOGLE_PLACES_API_KEY) {
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
    console.error('Places search error:', err);
    res.status(500).json({ error: 'Failed to fetch place data' });
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
    console.error('Places details error:', err);
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
