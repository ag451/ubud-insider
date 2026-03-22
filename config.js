// Ubud Insider - Google Places API Configuration
// Get your API key from: https://developers.google.com/maps/documentation/places/web-service/get-api-key

const GOOGLE_PLACES_CONFIG = {
    // Add your Google Places API key here
    // apiKey: 'YOUR_API_KEY_HERE',
    
    // API endpoints
    baseUrl: 'https://maps.googleapis.com/maps/api/place',
    
    // Enable this when you have an API key
    enabled: false,
    
    // Cache duration (24 hours)
    cacheDuration: 24 * 60 * 60 * 1000
};

// Initialize Google Places API
async function initGooglePlaces() {
    if (!GOOGLE_PLACES_CONFIG.enabled || !GOOGLE_PLACES_CONFIG.apiKey) {
        console.log('Google Places API not configured. Add your API key to config.js');
        return false;
    }
    
    // Load Google Places library
    const script = document.createElement('script');
    script.src = `https://maps.googleapis.com/maps/api/js?key=${GOOGLE_PLACES_CONFIG.apiKey}&libraries=places`;
    script.async = true;
    script.defer = true;
    
    return new Promise((resolve) => {
        script.onload = () => {
            console.log('Google Places API loaded');
            resolve(true);
        };
        script.onerror = () => {
            console.error('Failed to load Google Places API');
            resolve(false);
        };
        document.head.appendChild(script);
    });
}

// Fetch place details from Google Places API
async function fetchPlaceDetails(placeId) {
    if (!GOOGLE_PLACES_CONFIG.enabled || !window.google?.maps?.places) {
        return null;
    }
    
    // Check cache first
    const cacheKey = `place_${placeId}`;
    const cached = localStorage.getItem(cacheKey);
    if (cached) {
        const data = JSON.parse(cached);
        if (Date.now() - data.timestamp < GOOGLE_PLACES_CONFIG.cacheDuration) {
            return data.details;
        }
    }
    
    try {
        const service = new google.maps.places.PlacesService(document.createElement('div'));
        
        return new Promise((resolve) => {
            service.getDetails({
                placeId: placeId,
                fields: ['name', 'formatted_address', 'formatted_phone_number', 'opening_hours', 'rating', 'reviews', 'photos', 'website', 'url']
            }, (result, status) => {
                if (status === google.maps.places.PlacesServiceStatus.OK) {
                    // Cache the result
                    localStorage.setItem(cacheKey, JSON.stringify({
                        details: result,
                        timestamp: Date.now()
                    }));
                    resolve(result);
                } else {
                    resolve(null);
                }
            });
        });
    } catch (err) {
        console.error('Error fetching place details:', err);
        return null;
    }
}

// Search for a place by name and location
async function searchPlace(name, location = { lat: -8.5069, lng: 115.2625 }) {
    if (!GOOGLE_PLACES_CONFIG.enabled || !window.google?.maps?.places) {
        return null;
    }
    
    try {
        const service = new google.maps.places.PlacesService(document.createElement('div'));
        
        return new Promise((resolve) => {
            service.findPlaceFromQuery({
                query: `${name}, Ubud, Bali`,
                fields: ['place_id', 'name', 'geometry', 'formatted_address']
            }, (results, status) => {
                if (status === google.maps.places.PlacesServiceStatus.OK && results.length > 0) {
                    resolve(results[0]);
                } else {
                    resolve(null);
                }
            });
        });
    } catch (err) {
        console.error('Error searching place:', err);
        return null;
    }
}

// Export for use
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { GOOGLE_PLACES_CONFIG, initGooglePlaces, fetchPlaceDetails, searchPlace };
}
