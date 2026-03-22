const express = require('express');
const path = require('path');
const https = require('https');

const app = express();
const PORT = process.env.PORT || 3000;

// Google Places API configuration
// IMPORTANT: Set GOOGLE_PLACES_API_KEY environment variable in Railway dashboard
const GOOGLE_PLACES_API_KEY = process.env.GOOGLE_PLACES_API_KEY || '';

// Serve static files
app.use(express.static(path.join(__dirname)));

// Proxy endpoint for Google Places search
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
    `fields=place_id,geometry&` +
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

// Proxy endpoint for Google Places details
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

// Proxy endpoint for Google Places photos
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
  
  // Redirect to the photo URL (Google handles the redirect)
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

app.listen(PORT, () => {
  console.log(`Ubud Insider server running on port ${PORT}`);
  if (!GOOGLE_PLACES_API_KEY) {
    console.log('⚠️  Warning: GOOGLE_PLACES_API_KEY not set. Places API will not work.');
  }
});
