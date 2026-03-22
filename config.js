// Ubud Insider Google Places API Integration
// API key can be set via GOOGLE_PLACES_CONFIG.apiKey below

const GOOGLE_PLACES_CONFIG = {
    // Google Maps API Key (for frontend map)
    // Set your API key here (starts with AIza...):
    apiKey: 'API_KEY',
    
    // Backend proxy endpoints (no API key needed in browser)
    searchEndpoint: '/api/places/search',
    detailsEndpoint: '/api/places/details',
    photoEndpoint: '/api/places/photo',
    
    // Enable Google Places features
    enabled: true,
    
    // Cache duration (24 hours)
    cacheDuration: 24 * 60 * 60 * 1000
};

// Log which map provider will be used
if (GOOGLE_PLACES_CONFIG.apiKey && GOOGLE_PLACES_CONFIG.apiKey.length > 10) {
    console.log('✅ Google Maps API key configured');
} else {
    console.log('ℹ️ No Google Maps API key - will use Leaflet fallback');
}

// Initialize Google Places API (now uses backend proxy)
async function initGooglePlaces() {
    if (!GOOGLE_PLACES_CONFIG.enabled) {
        console.log('ℹ️ Google Places API not enabled.');
        return false;
    }
    
    console.log('✅ Google Places API ready (via backend proxy)');
    return true;
}

// Fetch place details from backend proxy
async function fetchPlaceDetails(placeName, location = { lat: -8.5069, lng: 115.2625 }) {
    if (!GOOGLE_PLACES_CONFIG.enabled) {
        return null;
    }
    
    // Check cache first
    const cacheKey = `place_details_${placeName.replace(/\s+/g, '_')}`;
    const cached = localStorage.getItem(cacheKey);
    if (cached) {
        const data = JSON.parse(cached);
        if (Date.now() - data.timestamp < GOOGLE_PLACES_CONFIG.cacheDuration) {
            console.log(`📦 Using cached data for ${placeName}`);
            return data.details;
        }
    }
    
    try {
        // Step 1: Search for the place via backend proxy
        const searchUrl = `${GOOGLE_PLACES_CONFIG.searchEndpoint}?` +
            `query=${encodeURIComponent(placeName + ', Ubud, Bali')}&` +
            `location=${location.lat},${location.lng}`;
        
        const searchResponse = await fetch(searchUrl);
        const searchData = await searchResponse.json();
        
        if (searchData.status !== 'OK' || !searchData.candidates || searchData.candidates.length === 0) {
            console.warn(`⚠️ Place not found: ${placeName}`);
            return null;
        }
        
        const placeId = searchData.candidates[0].place_id;
        const geometry = searchData.candidates[0].geometry;
        
        // Step 2: Get place details via backend proxy
        const detailsUrl = `${GOOGLE_PLACES_CONFIG.detailsEndpoint}?placeId=${placeId}`;
        
        const detailsResponse = await fetch(detailsUrl);
        const detailsData = await detailsResponse.json();
        
        if (detailsData.status !== 'OK') {
            console.warn(`⚠️ Could not get details for ${placeName}: ${detailsData.status}`);
            return null;
        }
        
        // Process and cache the result
        const result = {
            placeId: placeId,
            name: detailsData.result.name,
            address: detailsData.result.formatted_address,
            phone: detailsData.result.formatted_phone_number,
            hours: detailsData.result.opening_hours?.weekday_text?.join('\n'),
            rating: detailsData.result.rating,
            reviews: detailsData.result.reviews?.map(r => ({
                author: r.author_name,
                rating: r.rating,
                text: r.text,
                time: r.relative_time_description
            })) || [],
            photos: detailsData.result.photos?.map(p => ({
                reference: p.photo_reference,
                width: p.width,
                height: p.height
            })) || [],
            website: detailsData.result.website,
            url: detailsData.result.url,
            lat: geometry?.location?.lat,
            lng: geometry?.location?.lng
        };
        
        // Cache the result
        localStorage.setItem(cacheKey, JSON.stringify({
            details: result,
            timestamp: Date.now()
        }));
        
        console.log(`✅ Fetched details for ${placeName}`);
        return result;
        
    } catch (err) {
        console.error(`❌ Error fetching place details for ${placeName}:`, err);
        return null;
    }
}

// Get photo URL from backend proxy
function getPlacePhotoUrl(photoReference, maxWidth = 400) {
    if (!GOOGLE_PLACES_CONFIG.enabled || !photoReference) {
        return null;
    }
    
    return `${GOOGLE_PLACES_CONFIG.photoEndpoint}?` +
        `maxWidth=${maxWidth}&` +
        `photoReference=${photoReference}`;
}

// Batch fetch all places (call this to populate data)
async function batchFetchAllPlaces() {
    if (!GOOGLE_PLACES_CONFIG.enabled) {
        console.log('ℹ️ Google Places API not enabled. Skipping batch fetch.');
        return;
    }
    
    console.log('🚀 Starting batch fetch of all places...');
    let updatedCount = 0;
    
    for (const place of UBUD_DATA.places) {
        // Add delay to avoid rate limiting
        await new Promise(resolve => setTimeout(resolve, 200));
        
        const details = await fetchPlaceDetails(place.name);
        
        if (details) {
            // Update the place data
            place.address = details.address;
            place.phone = details.phone;
            place.hours = details.hours;
            place.rating = details.rating;
            place.reviews = details.reviews;
            place.photos = details.photos;
            place.website = details.website;
            place.googleMapsUrl = details.url;
            place.google_place_id = details.placeId;
            
            // Update coordinates if Google has better ones
            if (details.lat && details.lng) {
                place.lat = details.lat;
                place.lng = details.lng;
            }
            
            // SAVE TO DATABASE via API
            try {
                const response = await fetch(`/api/places/${place.id}`, {
                    method: 'PUT',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(place)
                });
                if (response.ok) {
                    console.log(`💾 Saved ${place.name} to database`);
                    updatedCount++;
                } else {
                    console.warn(`⚠️ Failed to save ${place.name}`);
                }
            } catch (err) {
                console.error(`❌ Error saving ${place.name}:`, err);
            }
        }
    }
    
    console.log(`✅ Batch fetch complete! Updated ${updatedCount} places.`);
    
    // Refresh the UI
    if (typeof renderPlaces === 'function') {
        renderPlaces();
    }
    if (typeof updateMapMarkers === 'function') {
        updateMapMarkers();
    }
    
    return updatedCount;
}

// Check if coordinates look correct for Ubud area
function validateCoordinates(lat, lng) {
    // Ubud is roughly: lat -8.4 to -8.6, lng 115.2 to 115.3
    const isValidLat = lat >= -8.7 && lat <= -8.3;
    const isValidLng = lng >= 115.1 && lng <= 115.4;
    
    return isValidLat && isValidLng;
}

// Export for use
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { 
        GOOGLE_PLACES_CONFIG, 
        initGooglePlaces, 
        fetchPlaceDetails, 
        getPlacePhotoUrl,
        batchFetchAllPlaces,
        validateCoordinates
    };
}
