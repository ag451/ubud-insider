// Ubud Insider App
let currentCategory = 'all';
let searchTerm = '';
let currentView = 'list';
let favorites = JSON.parse(localStorage.getItem('ubud_favorites') || '[]');
let map = null;
let markers = [];
let userLocation = null; // { lat, lng, address }

const API_BASE = '/api';

// Load places from database
async function loadPlacesFromDB() {
  try {
    const response = await fetch(`${API_BASE}/places`);
    if (!response.ok) throw new Error('Failed to fetch places');
    
    const places = await response.json();
    if (places.length > 0) {
      UBUD_DATA.places = places;
      console.log(`✅ Loaded ${places.length} places from database`);
    } else {
      // Database empty, import from data.js
      console.log('📥 Database empty, importing initial data...');
      await importInitialData();
    }
    return true;
  } catch (err) {
    console.error('Error loading places from DB:', err);
    // Fallback to data.js if API fails
    console.log('⚠️ Using local data as fallback');
    return false;
  }
}

// Import initial data from data.js to database
async function importInitialData() {
  try {
    const response = await fetch(`${API_BASE}/places/import`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ places: UBUD_DATA.places })
    });
    
    if (response.ok) {
      console.log('✅ Initial data imported to database');
    }
  } catch (err) {
    console.error('Error importing initial data:', err);
  }
}

// Initialize app
document.addEventListener('DOMContentLoaded', async () => {
  await loadPlacesFromDB();
  renderCategories();
  renderPlaces();
  updateFavCount();
  setupEventListeners();
  // Map is initialized by Google Maps callback (initGoogleMap)
});

// Setup event listeners
function setupEventListeners() {
  // Search input
  const searchInput = document.getElementById('searchInput');
  const clearBtn = document.getElementById('clearSearch');
  
  searchInput.addEventListener('input', (e) => {
    searchTerm = e.target.value.toLowerCase();
    clearBtn.style.display = searchTerm ? 'flex' : 'none';
    if (currentView === 'list') {
      renderPlaces();
    } else {
      updateMapMarkers();
    }
  });
  
  clearBtn.addEventListener('click', () => {
    searchInput.value = '';
    searchTerm = '';
    clearBtn.style.display = 'none';
    if (currentView === 'list') {
      renderPlaces();
    } else {
      updateMapMarkers();
    }
  });
  
  // View toggle
  document.querySelectorAll('.view-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      const view = btn.dataset.view;
      switchView(view);
    });
  });
  
  // Location input with autocomplete
  const locationInput = document.getElementById('locationInput');
  const autocompleteDropdown = document.getElementById('locationAutocomplete');
  let autocompleteTimeout = null;
  let selectedAutocompleteIndex = -1;
  let currentAutocompleteResults = [];
  
  if (locationInput) {
    // Input event for autocomplete with debounce
    locationInput.addEventListener('input', (e) => {
      const value = e.target.value.trim();
      
      // Clear previous timeout
      if (autocompleteTimeout) {
        clearTimeout(autocompleteTimeout);
      }
      
      // Hide dropdown if input is empty
      if (value.length < 2) {
        hideAutocomplete();
        return;
      }
      
      // Debounce API call (300ms)
      autocompleteTimeout = setTimeout(() => {
        fetchAutocompleteResults(value);
      }, 300);
    });
    
    // Keyboard navigation
    locationInput.addEventListener('keydown', (e) => {
      if (currentAutocompleteResults.length === 0) return;
      
      switch (e.key) {
        case 'ArrowDown':
          e.preventDefault();
          selectedAutocompleteIndex = Math.min(selectedAutocompleteIndex + 1, currentAutocompleteResults.length - 1);
          renderAutocompleteSelection();
          break;
        case 'ArrowUp':
          e.preventDefault();
          selectedAutocompleteIndex = Math.max(selectedAutocompleteIndex - 1, -1);
          renderAutocompleteSelection();
          break;
        case 'Enter':
          e.preventDefault();
          if (selectedAutocompleteIndex >= 0) {
            selectAutocompleteResult(currentAutocompleteResults[selectedAutocompleteIndex]);
          } else {
            setUserLocation();
          }
          break;
        case 'Escape':
          hideAutocomplete();
          break;
      }
    });
    
    // Hide dropdown when clicking outside
    document.addEventListener('click', (e) => {
      if (!e.target.closest('.location-section')) {
        hideAutocomplete();
      }
    });
  }
  
  async function fetchAutocompleteResults(query) {
    try {
      const searchQuery = encodeURIComponent(`${query}, Ubud, Bali, Indonesia`);
      const response = await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${searchQuery}&limit=5`);
      const data = await response.json();
      
      if (data && data.length > 0) {
        currentAutocompleteResults = data;
        selectedAutocompleteIndex = -1;
        renderAutocompleteDropdown(data);
      } else {
        hideAutocomplete();
      }
    } catch (err) {
      console.error('Autocomplete error:', err);
      hideAutocomplete();
    }
  }
  
  function renderAutocompleteDropdown(results) {
    autocompleteDropdown.innerHTML = results.map((result, index) => {
      const shortName = result.display_name.split(',')[0];
      const subText = result.display_name.split(',').slice(1, 3).join(', ');
      
      return `
        <div class="location-autocomplete-item" data-index="${index}" onclick="selectAutocompleteResultByIndex(${index})">
          <span class="location-autocomplete-icon">📍</span>
          <div style="flex: 1; min-width: 0;">
            <div class="location-autocomplete-text">${escapeHtml(shortName)}</div>
            <div class="location-autocomplete-subtext">${escapeHtml(subText)}</div>
          </div>
        </div>
      `;
    }).join('');
    
    autocompleteDropdown.style.display = 'block';
  }
  
  function renderAutocompleteSelection() {
    const items = autocompleteDropdown.querySelectorAll('.location-autocomplete-item');
    items.forEach((item, index) => {
      item.classList.toggle('selected', index === selectedAutocompleteIndex);
    });
  }
  
  globalThis.selectAutocompleteResultByIndex = function(index) {
    selectAutocompleteResult(currentAutocompleteResults[index]);
  };
  
  function selectAutocompleteResult(result) {
    const shortName = result.display_name.split(',')[0];
    locationInput.value = shortName;
    
    userLocation = {
      lat: parseFloat(result.lat),
      lng: parseFloat(result.lon),
      address: shortName
    };
    
    localStorage.setItem('ubud_user_location', JSON.stringify(userLocation));
    
    updateLocationUI();
    showLocationStatus(`📍 ${userLocation.address} — Places sorted by distance`, 'success');
    
    renderPlaces();
    
    if (map && window.mapProvider === 'leaflet') {
      map.setView([userLocation.lat, userLocation.lng], 15);
    }
    
    hideAutocomplete();
  }
  
  function hideAutocomplete() {
    autocompleteDropdown.style.display = 'none';
    currentAutocompleteResults = [];
    selectedAutocompleteIndex = -1;
  }
  
  // Load saved location from localStorage
  const savedLocation = localStorage.getItem('ubud_user_location');
  if (savedLocation) {
    userLocation = JSON.parse(savedLocation);
    updateLocationUI();
  }
}

// Set user location from address input (manual fallback)
async function setUserLocation() {
  const input = document.getElementById('locationInput');
  const status = document.getElementById('locationStatus');
  const btn = document.getElementById('setLocationBtn');
  
  const address = input.value.trim();
  if (!address) {
    showLocationStatus('Please enter an address', 'error');
    return;
  }
  
  btn.disabled = true;
  btn.textContent = '📍 Geocoding...';
  
  try {
    const query = encodeURIComponent(`${address}, Ubud, Bali, Indonesia`);
    const response = await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${query}&limit=1`);
    const data = await response.json();
    
    if (data && data.length > 0) {
      userLocation = {
        lat: parseFloat(data[0].lat),
        lng: parseFloat(data[0].lon),
        address: data[0].display_name.split(',')[0]
      };
      
      localStorage.setItem('ubud_user_location', JSON.stringify(userLocation));
      
      updateLocationUI();
      showLocationStatus(`📍 ${userLocation.address} — Places sorted by distance`, 'success');
      
      renderPlaces();
      
      if (map && window.mapProvider === 'leaflet') {
        map.setView([userLocation.lat, userLocation.lng], 15);
      }
    } else {
      showLocationStatus('❌ Address not found. Try "Yoga Barn Ubud" or "Ubud Market"', 'error');
    }
  } catch (err) {
    console.error('Geocoding error:', err);
    showLocationStatus('❌ Error finding address. Please try again.', 'error');
  } finally {
    btn.disabled = false;
    btn.textContent = '📍 Set Location';
  }
}

// Clear user location
function clearUserLocation() {
  userLocation = null;
  localStorage.removeItem('ubud_user_location');
  
  const input = document.getElementById('locationInput');
  const status = document.getElementById('locationStatus');
  const clearBtn = document.getElementById('clearLocationBtn');
  
  input.value = '';
  status.style.display = 'none';
  clearBtn.style.display = 'none';
  
  // Re-render without distance sorting
  renderPlaces();
}

// Update location UI
function updateLocationUI() {
  if (!userLocation) return;
  
  const input = document.getElementById('locationInput');
  const clearBtn = document.getElementById('clearLocationBtn');
  
  input.value = userLocation.address;
  clearBtn.style.display = 'flex';
}

// Show location status message
function showLocationStatus(message, type) {
  const status = document.getElementById('locationStatus');
  status.innerHTML = message;
  status.style.display = 'flex';
  status.className = 'location-status ' + (type === 'success' ? 'active' : '');
}

// Calculate distance between two points using Haversine formula
function calculateDistance(lat1, lng1, lat2, lng2) {
  const R = 6371; // Earth's radius in kilometers
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLng = (lng2 - lng1) * Math.PI / 180;
  
  const a = Math.sin(dLat/2) * Math.sin(dLat/2) +
            Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
            Math.sin(dLng/2) * Math.sin(dLng/2);
  
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
  return R * c; // Distance in km
}

// Switch between list and map view
function switchView(view) {
  currentView = view;
  
  // Update button states
  document.querySelectorAll('.view-btn').forEach(btn => {
    btn.classList.toggle('active', btn.dataset.view === view);
  });
  
  const isMobile = window.innerWidth <= 768;
  
  if (isMobile) {
    // Mobile: Full screen map overlay
    switchViewMobile(view);
  } else {
    // Desktop: Inline map within app
    switchViewDesktop(view);
  }
}

// Mobile view switch - full screen overlay
function switchViewMobile(view) {
  const appContainer = document.getElementById('appContainer');
  const mapContainer = document.getElementById('mapContainer');
  const placesList = document.getElementById('placesList');
  
  if (view === 'map') {
    appContainer.style.display = 'none';
    mapContainer.classList.add('active');
    
    renderMapCategories();
    
    if (!map) {
      initLeafletMap();
    }
    
    setTimeout(() => {
      if (window.mapProvider === 'leaflet' && map) {
        map.invalidateSize();
      }
      updateMapMarkers();
    }, 100);
  } else {
    appContainer.style.display = 'block';
    mapContainer.classList.remove('active');
    placesList.style.display = 'flex';
    renderPlaces();
  }
}

// Desktop view switch - inline map
function switchViewDesktop(view) {
  const placesList = document.getElementById('placesList');
  const mapInlineContainer = document.getElementById('mapInlineContainer');
  
  if (view === 'map') {
    placesList.style.display = 'none';
    mapInlineContainer.style.display = 'block';
    
    renderInlineMapCategories();
    
    if (!window.inlineMap) {
      initInlineLeafletMap();
    }
    
    setTimeout(() => {
      if (window.inlineMap) {
        window.inlineMap.invalidateSize();
      }
      updateInlineMapMarkers();
    }, 100);
  } else {
    placesList.style.display = 'flex';
    mapInlineContainer.style.display = 'none';
    renderPlaces();
  }
}

// Render categories for inline map
function renderInlineMapCategories() {
  const container = document.getElementById('inlineMapCategoryList');
  if (container.children.length > 1) return; // Already rendered
  
  UBUD_DATA.categories.forEach(cat => {
    const btn = document.createElement('button');
    btn.className = 'map-category-btn';
    btn.dataset.category = cat.id;
    btn.textContent = `${cat.icon} ${cat.name}`;
    btn.onclick = () => selectCategory(cat.id);
    container.appendChild(btn);
  });
}

// Initialize inline Leaflet map for desktop
function initInlineLeafletMap() {
  const mapCenter = userLocation || UBUD_DATA.mapCenter;
  
  window.inlineMap = L.map('inlineMap').setView([mapCenter.lat, mapCenter.lng], 14);
  
  L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '© OpenStreetMap',
    maxZoom: 19
  }).addTo(window.inlineMap);
  
  // Add dark filter via CSS
  document.getElementById('inlineMap').style.filter = 'invert(1) hue-rotate(180deg) brightness(0.8)';
}

// Update markers on inline map
function updateInlineMapMarkers() {
  if (!window.inlineMap) return;
  
  // Clear existing markers
  window.inlineMap.eachLayer(layer => {
    if (layer instanceof L.Marker) {
      window.inlineMap.removeLayer(layer);
    }
  });
  
  const filtered = getFilteredPlaces();
  
  filtered.forEach(place => {
    if (!place.lat || !place.lng) return;
    
    const category = UBUD_DATA.categories.find(c => c.id === place.category);
    const icon = category?.icon || '📍';
    
    const customIcon = L.divIcon({
      className: 'custom-marker',
      html: `<div style="width: 36px; height: 36px; background: #22c55e; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-size: 18px; border: 2px solid #0a0a0a; box-shadow: 0 2px 8px rgba(0,0,0,0.3);">${icon}</div>`,
      iconSize: [36, 36],
      iconAnchor: [18, 18]
    });
    
    L.marker([place.lat, place.lng], { icon: customIcon })
      .addTo(window.inlineMap)
      .bindPopup(`
        <div style="font-family: Inter, sans-serif; min-width: 200px;">
          <div style="font-weight: 600; font-size: 1rem; margin-bottom: 4px;">${icon} ${escapeHtml(place.name)}</div>
          <div style="color: #888; font-size: 0.85rem; margin-bottom: 8px;">${escapeHtml(place.description.substring(0, 60))}...</div>
          <button onclick="openPlaceModal(${place.id})" style="background: #22c55e; color: #000; border: none; padding: 6px 12px; border-radius: 6px; cursor: pointer; font-size: 0.85rem; font-weight: 500;">View Details</button>
        </div>
      `);
  });
  
  // Fit bounds if we have markers
  const markers = [];
  window.inlineMap.eachLayer(layer => {
    if (layer instanceof L.Marker) {
      markers.push(layer);
    }
  });
  
  if (markers.length > 0) {
    const group = new L.featureGroup(markers);
    window.inlineMap.fitBounds(group.getBounds().pad(0.1));
  }
}

// Initialize Google Map
globalThis.initGoogleMap = function() {
  window.mapProvider = 'google';
  const mapCenter = UBUD_DATA.mapCenter;
  
  const mapElement = document.getElementById('map');
  if (!mapElement) {
    console.error('Map element not found');
    return;
  }
  
  // Dark theme map styles
  const darkTheme = [
    { elementType: 'geometry', stylers: [{ color: '#1d1d1d' }] },
    { elementType: 'labels.text.fill', stylers: [{ color: '#888888' }] },
    { elementType: 'labels.text.stroke', stylers: [{ color: '#1d1d1d' }] },
    {
      featureType: 'administrative.locality',
      elementType: 'labels.text.fill',
      stylers: [{ color: '#ffffff' }]
    },
    {
      featureType: 'poi',
      elementType: 'labels.text.fill',
      stylers: [{ color: '#888888' }]
    },
    {
      featureType: 'poi.park',
      elementType: 'geometry',
      stylers: [{ color: '#0d2818' }]
    },
    {
      featureType: 'poi.park',
      elementType: 'labels.text.fill',
      stylers: [{ color: '#22c55e' }]
    },
    {
      featureType: 'road',
      elementType: 'geometry',
      stylers: [{ color: '#2a2a2a' }]
    },
    {
      featureType: 'road',
      elementType: 'labels.text.fill',
      stylers: [{ color: '#888888' }]
    },
    {
      featureType: 'road.highway',
      elementType: 'geometry',
      stylers: [{ color: '#3a3a3a' }]
    },
    {
      featureType: 'road.highway',
      elementType: 'labels.text.fill',
      stylers: [{ color: '#aaaaaa' }]
    },
    {
      featureType: 'transit',
      elementType: 'geometry',
      stylers: [{ color: '#2a2a2a' }]
    },
    {
      featureType: 'water',
      elementType: 'geometry',
      stylers: [{ color: '#0f1729' }]
    },
    {
      featureType: 'water',
      elementType: 'labels.text.fill',
      stylers: [{ color: '#4a5568' }]
    }
  ];
  
  map = new google.maps.Map(mapElement, {
    center: { lat: mapCenter.lat, lng: mapCenter.lng },
    zoom: 15,
    styles: darkTheme,
    mapTypeControl: false,
    fullscreenControl: false,
    streetViewControl: false,
    zoomControl: true,
    zoomControlOptions: {
      position: google.maps.ControlPosition.RIGHT_BOTTOM
    }
  });
  
  updateMapMarkers();
};

// Initialize Leaflet Map (fallback)
function initLeafletMap() {
  window.mapProvider = 'leaflet';
  const mapCenter = UBUD_DATA.mapCenter;
  
  const mapElement = document.getElementById('map');
  if (!mapElement) {
    console.error('Map element not found');
    return;
  }
  
  // Clear any existing map
  if (map) {
    map.remove();
  }
  
  map = L.map('map').setView([mapCenter.lat, mapCenter.lng], 15);
  
  // Use OpenStreetMap tiles with dark theme via CSS filter
  L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '&copy; OpenStreetMap contributors',
    maxZoom: 19,
    crossOrigin: true
  }).addTo(map);
  
  // Apply dark filter to map tiles via CSS
  mapElement.style.filter = 'invert(100%) hue-rotate(180deg) brightness(95%) contrast(90%)';
  
  updateMapMarkers();
}

// Update map markers (supports both Google Maps and Leaflet)
function updateMapMarkers() {
  if (!map) return;
  
  const filtered = getFilteredPlaces();
  
  if (window.mapProvider === 'google') {
    // Google Maps markers
    markers.forEach(marker => marker.setMap(null));
    markers = [];
    
    filtered.forEach(place => {
      if (!place.lat || !place.lng) return;
      
      const category = UBUD_DATA.categories.find(c => c.id === place.category);
      const icon = category ? category.icon : '📍';
      
      const marker = new google.maps.Marker({
        position: { lat: place.lat, lng: place.lng },
        map: map,
        title: place.name,
        icon: {
          url: `data:image/svg+xml;charset=UTF-8,${encodeURIComponent(
            `<svg xmlns="http://www.w3.org/2000/svg" width="40" height="40" viewBox="0 0 40 40">
              <circle cx="20" cy="20" r="18" fill="#22c55e" stroke="#0a0a0a" stroke-width="2"/>
              <text x="20" y="25" font-size="18" text-anchor="middle" fill="#000">${icon}</text>
            </svg>`
          )}`,
          scaledSize: new google.maps.Size(40, 40),
          anchor: new google.maps.Point(20, 20)
        }
      });
      
      const infoWindow = new google.maps.InfoWindow({
        content: `
          <div style="font-family: Inter, sans-serif; min-width: 200px; padding: 8px;">
            <div style="font-weight: 600; font-size: 1rem; margin-bottom: 4px;">${icon} ${escapeHtml(place.name)}</div>
            <div style="color: #666; font-size: 0.85rem; margin-bottom: 8px;">${escapeHtml(place.description.substring(0, 60))}...</div>
            <button onclick="window.openPlaceModal(${place.id}); window.closeInfoWindow();" 
              style="background: #22c55e; color: #000; border: none; padding: 6px 12px; border-radius: 6px; cursor: pointer; font-size: 0.85rem; font-weight: 500;">
              View Details
            </button>
          </div>
        `
      });
      
      marker.addListener('click', () => {
        if (window.currentInfoWindow) window.currentInfoWindow.close();
        window.currentInfoWindow = infoWindow;
        infoWindow.open(map, marker);
      });
      
      markers.push(marker);
    });
    
    if (markers.length > 0) {
      const bounds = new google.maps.LatLngBounds();
      markers.forEach(marker => bounds.extend(marker.getPosition()));
      map.fitBounds(bounds);
      const listener = google.maps.event.addListener(map, 'idle', () => {
        if (map.getZoom() > 17) map.setZoom(17);
        google.maps.event.removeListener(listener);
      });
    }
  } else {
    // Leaflet markers
    markers.forEach(marker => map.removeLayer(marker));
    markers = [];
    
    filtered.forEach(place => {
      if (!place.lat || !place.lng) return;
      
      const category = UBUD_DATA.categories.find(c => c.id === place.category);
      const icon = category ? category.icon : '📍';
      
      const customIcon = L.divIcon({
        className: 'custom-marker',
        html: `<div style="width: 40px; height: 40px; background: #22c55e; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-size: 20px; border: 2px solid #0a0a0a; box-shadow: 0 2px 8px rgba(0,0,0,0.3);">${icon}</div>`,
        iconSize: [40, 40],
        iconAnchor: [20, 20]
      });
      
      const marker = L.marker([place.lat, place.lng], { icon: customIcon })
        .addTo(map)
        .bindPopup(`
          <div style="font-family: Inter, sans-serif; min-width: 200px;">
            <div style="font-weight: 600; font-size: 1rem; margin-bottom: 4px;">${icon} ${escapeHtml(place.name)}</div>
            <div style="color: #888; font-size: 0.85rem; margin-bottom: 8px;">${escapeHtml(place.description.substring(0, 60))}...</div>
            <button onclick="openPlaceModal(${place.id})" style="background: #22c55e; color: #000; border: none; padding: 6px 12px; border-radius: 6px; cursor: pointer; font-size: 0.85rem; font-weight: 500;">View Details</button>
          </div>
        `);
      
      markers.push(marker);
    });
    
    if (markers.length > 0) {
      const group = new L.featureGroup(markers);
      map.fitBounds(group.getBounds().pad(0.1));
    }
  }
}

// Close info window helper (Google Maps only)
globalThis.closeInfoWindow = function() {
  if (window.currentInfoWindow) {
    window.currentInfoWindow.close();
  }
};

// Render category buttons
function renderCategories() {
  const container = document.getElementById('categoryList');
  
  UBUD_DATA.categories.forEach(cat => {
    const btn = document.createElement('button');
    btn.className = 'category-btn';
    btn.dataset.category = cat.id;
    btn.innerHTML = `
      <span class="category-icon">${cat.icon}</span>
      <span class="category-name">${cat.name}</span>
    `;
    btn.addEventListener('click', () => selectCategory(cat.id));
    container.appendChild(btn);
  });
}

// Select category
function selectCategory(category) {
  currentCategory = category;
  
  document.querySelectorAll('.category-btn').forEach(btn => {
    btn.classList.toggle('active', btn.dataset.category === category);
  });
  
  document.querySelectorAll('.map-category-btn').forEach(btn => {
    btn.classList.toggle('active', btn.dataset.category === category);
  });
  
  if (currentView === 'list') {
    renderPlaces();
  } else {
    updateMapMarkers();
  }
}

// Render map category buttons
function renderMapCategories() {
  const container = document.getElementById('mapCategoryList');
  if (!container || container.children.length > 1) return;
  
  container.innerHTML = '<button class="map-category-btn active" data-category="all" onclick="selectCategory(\'all\')">All</button>';
  
  UBUD_DATA.categories.forEach(cat => {
    const btn = document.createElement('button');
    btn.className = 'map-category-btn';
    btn.dataset.category = cat.id;
    btn.textContent = `${cat.icon} ${cat.name}`;
    btn.onclick = () => selectCategory(cat.id);
    container.appendChild(btn);
  });
  
  const mapSearchInput = document.getElementById('mapSearchInput');
  if (mapSearchInput) {
    mapSearchInput.addEventListener('input', (e) => {
      searchTerm = e.target.value.toLowerCase();
      updateMapMarkers();
    });
  }
}

// Get filtered places
function getFilteredPlaces() {
  let places = UBUD_DATA.places.filter(place => {
    if (currentCategory !== 'all' && place.category !== currentCategory) {
      return false;
    }
    
    if (searchTerm) {
      const searchLower = searchTerm.toLowerCase();
      const matchesSearch = 
        place.name.toLowerCase().includes(searchLower) ||
        place.description.toLowerCase().includes(searchLower) ||
        (place.area && place.area.toLowerCase().includes(searchLower));
      
      if (!matchesSearch) return false;
    }
    
    return true;
  });
  
  // Calculate and sort by distance if user location is set
  if (userLocation && userLocation.lat && userLocation.lng) {
    places = places.map(place => {
      if (place.lat && place.lng) {
        place.distance = calculateDistance(
          userLocation.lat, userLocation.lng,
          place.lat, place.lng
        );
      } else {
        place.distance = null;
      }
      return place;
    });
    
    // Sort by distance (null distances go to end)
    places.sort((a, b) => {
      if (a.distance === null && b.distance === null) return 0;
      if (a.distance === null) return 1;
      if (b.distance === null) return -1;
      return a.distance - b.distance;
    });
  }
  
  return places;
}

// Render places list
function renderPlaces() {
  const container = document.getElementById('placesList');
  const emptyState = document.getElementById('emptyState');
  const statsText = document.getElementById('statsText');
  
  const filtered = getFilteredPlaces();
  
  const categoryName = currentCategory === 'all' 
    ? 'all places' 
    : UBUD_DATA.categories.find(c => c.id === currentCategory)?.name.toLowerCase();
  
  const sortInfo = userLocation ? ' — sorted by distance 📍' : '';
  statsText.textContent = `Showing ${filtered.length} ${categoryName}${sortInfo}`;
  
  if (filtered.length === 0) {
    container.style.display = 'none';
    emptyState.style.display = 'block';
    return;
  }
  
  container.style.display = 'flex';
  emptyState.style.display = 'none';
  
  container.innerHTML = filtered.map((place, index) => {
    const category = UBUD_DATA.categories.find(c => c.id === place.category);
    const isFav = favorites.includes(place.id);
    const hasNotes = place.description && place.description.length > 10;
    
    return `
      <article class="place-card" style="animation-delay: ${index * 0.05}s" onclick="openPlaceModal(${place.id})">
        <div class="place-header">
          <h3 class="place-name">${escapeHtml(place.name)}</h3>
          ${hasNotes ? `<div class="user-avatar" title="Abrar's notes">A</div>` : ''}
        </div>
        
        <button class="fav-btn ${isFav ? 'active' : ''}" 
                onclick="event.stopPropagation(); toggleFavorite(${place.id})"
                aria-label="${isFav ? 'Remove from favorites' : 'Add to favorites'}">
          ${isFav ? '⭐' : '☆'}
        </button>
        
        <div class="place-meta">
          <span class="category-tag">${category?.icon || ''} ${category?.name || place.category}</span>
          ${place.area ? `<span class="area-tag">📍 ${escapeHtml(place.area)}</span>` : ''}
          ${place.distance ? `<span class="distance-tag">${place.distance.toFixed(1)} km</span>` : ''}
          ${place.rating ? `<span class="place-rating"><span class="star">★</span> ${place.rating}</span>` : ''}
        </div>
        
        ${hasNotes ? `
          <div class="highlights-box">
            <div class="highlights-header">
              <span class="highlights-icon">✨</span>
              <span class="highlights-label">Notes</span>
            </div>
            <p class="highlights-text">${escapeHtml(place.description)}</p>
          </div>
        ` : ''}
        
        <div class="card-actions">
          ${getCardMapsLink(place)}
          <button class="details-btn" onclick="event.stopPropagation(); openPlaceModal(${place.id})">
            Details →
          </button>
        </div>
      </article>
    `;
  }).join('');
}

// Open place detail modal
function openPlaceModal(placeId) {
  const place = UBUD_DATA.places.find(p => p.id === placeId);
  if (!place) return;
  
  const category = UBUD_DATA.categories.find(c => c.id === place.category);
  const isFav = favorites.includes(place.id);
  
  const modalBody = document.getElementById('modalBody');
  modalBody.innerHTML = `
    <div class="modal-header">
      <h2 class="modal-title">${category?.icon || ''} ${escapeHtml(place.name)}</h2>
      <div class="modal-meta">
        <span class="category-tag">${category?.name || place.category}</span>
        ${place.area ? `<span class="area-tag">📍 ${escapeHtml(place.area)}</span>` : ''}
        <button class="fav-btn ${isFav ? 'active' : ''}" onclick="toggleFavorite(${place.id}); updateModalFav(${place.id})" style="position: static; margin-left: auto;">
          ${isFav ? '⭐ Saved' : '☆ Save'}
        </button>
      </div>
    </div>
    
    <div class="modal-section">
      <div class="modal-section-title">About</div>
      <p class="modal-text">${escapeHtml(place.description)}</p>
    </div>
    
    ${place.distance ? `
      <div class="modal-section">
        <div class="modal-section-title">Distance</div>
        <p class="modal-text" style="color: var(--accent-light); font-weight: 600;">
          📍 ${place.distance.toFixed(2)} km from your location
        </p>
      </div>
    ` : ''}
    
    ${place.rating ? `
      <div class="modal-section">
        <div class="modal-section-title">Rating</div>
        <div class="rating-stars">${'★'.repeat(Math.floor(place.rating))}${'☆'.repeat(5 - Math.floor(place.rating))} ${place.rating}/5</div>
      </div>
    ` : ''}
    
    ${place.address ? `
      <div class="modal-section">
        <div class="modal-section-title">Address</div>
        <p class="modal-text">${escapeHtml(place.address)}</p>
      </div>
    ` : ''}
    
    ${place.phone ? `
      <div class="modal-section">
        <div class="modal-section-title">Phone</div>
        <p class="modal-text">${escapeHtml(place.phone)}</p>
      </div>
    ` : ''}
    
    ${place.hours ? `
      <div class="modal-section">
        <div class="modal-section-title">Hours</div>
        <p class="modal-text">${escapeHtml(place.hours)}</p>
      </div>
    ` : ''}
    
    ${place.reviews && place.reviews.length > 0 ? `
      <div class="modal-section">
        <div class="modal-section-title">Reviews</div>
        ${place.reviews.map(r => `
          <div class="review-item">
            <div class="review-header">
              <span class="review-author">${escapeHtml(r.author)}</span>
              <span class="review-rating">${'★'.repeat(r.rating)}</span>
            </div>
            <p class="review-text">${escapeHtml(r.text)}</p>
          </div>
        `).join('')}
      </div>
    ` : ''}
    
    <div class="modal-section" style="margin-top: 24px;">
      ${getGoogleMapsLink(place)}
    </div>
  `;
  
  document.getElementById('placeModal').style.display = 'flex';
  document.body.style.overflow = 'hidden';
}

// Helper function to generate Google Maps link
function getGoogleMapsLink(place) {
  let mapsUrl;
  
  if (place.maps) {
    // Use existing maps URL
    mapsUrl = place.maps;
  } else if (place.googleMapsUrl) {
    // Use Google Places URL from sync
    mapsUrl = place.googleMapsUrl;
  } else if (place.address) {
    // Use full address from Google Places API for most accurate results
    const searchQuery = encodeURIComponent(place.address);
    mapsUrl = `https://www.google.com/maps/search/?api=1&query=${searchQuery}`;
  } else if (place.lat && place.lng) {
    // Fallback to coordinates
    mapsUrl = `https://www.google.com/maps/search/?api=1&query=${place.lat},${place.lng}`;
  } else {
    // Last resort: name search
    const searchQuery = encodeURIComponent(`${place.name}, Ubud, Bali`);
    mapsUrl = `https://www.google.com/maps/search/?api=1&query=${searchQuery}`;
  }
  
  return `
    <a href="${mapsUrl}" target="_blank" rel="noopener" class="maps-link" style="width: 100%; justify-content: center; padding: 12px; font-size: 1rem;">
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
        <polygon points="1 6 1 22 8 18 16 22 21 18 21 2 16 6 8 2 1 6"></polygon>
      </svg>
      Open in Google Maps
    </a>
  `;
}

// Helper function to generate Google Maps link for cards
function getCardMapsLink(place) {
  let mapsUrl;
  
  if (place.maps) {
    mapsUrl = place.maps;
  } else if (place.googleMapsUrl) {
    mapsUrl = place.googleMapsUrl;
  } else if (place.address) {
    // Use full address from Google Places API for most accurate results
    const searchQuery = encodeURIComponent(place.address);
    mapsUrl = `https://www.google.com/maps/search/?api=1&query=${searchQuery}`;
  } else if (place.lat && place.lng) {
    mapsUrl = `https://www.google.com/maps/search/?api=1&query=${place.lat},${place.lng}`;
  } else {
    const searchQuery = encodeURIComponent(`${place.name}, Ubud, Bali`);
    mapsUrl = `https://www.google.com/maps/search/?api=1&query=${searchQuery}`;
  }
  
  return `
    <a href="${mapsUrl}" target="_blank" rel="noopener" class="maps-link" onclick="event.stopPropagation()">
      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
        <polygon points="1 6 1 22 8 18 16 22 21 18 21 2 16 6 8 2 1 6"></polygon>
      </svg>
      Directions
    </a>
  `;
}

// Update modal favorite button
function updateModalFav(placeId) {
  setTimeout(() => openPlaceModal(placeId), 50);
}

// Close modal
function closeModal() {
  document.getElementById('placeModal').style.display = 'none';
  document.body.style.overflow = '';
}

// Close modal on escape key
document.addEventListener('keydown', (e) => {
  if (e.key === 'Escape') closeModal();
});

// Toggle favorite
function toggleFavorite(placeId) {
  const index = favorites.indexOf(placeId);
  
  if (index > -1) {
    favorites.splice(index, 1);
  } else {
    favorites.push(placeId);
  }
  
  localStorage.setItem('ubud_favorites', JSON.stringify(favorites));
  updateFavCount();
  
  if (currentView === 'list') {
    renderPlaces();
  }
}

// Update favorite count display
function updateFavCount() {
  const favCountEl = document.getElementById('favCount');
  const favCountNum = document.getElementById('favCountNum');
  
  if (favorites.length > 0) {
    favCountEl.style.display = 'inline';
    favCountNum.textContent = favorites.length;
  } else {
    favCountEl.style.display = 'none';
  }
}

// Escape HTML to prevent XSS
function escapeHtml(text) {
  const div = document.createElement('div');
  div.textContent = text;
  return div.innerHTML;
}

// Sync with Google Places API
async function syncWithGoogle() {
  const btn = document.getElementById('syncBtn');
  btn.disabled = true;
  btn.textContent = '🔄 Syncing...';
  
  try {
    console.log('🚀 Starting sync with Google Places...');
    
    const testResponse = await fetch('/api/places/search?query=Milk%20and%20Madu%20Ubud');
    const testData = await testResponse.json();
    
    if (testData.error) {
      alert('❌ API Error: ' + testData.error + '\n\nMake sure GOOGLE_PLACES_API_KEY is set in Railway environment variables.');
      console.error('API Error:', testData.error);
      return;
    }
    
    if (testData.status === 'REQUEST_DENIED' || testData.status === 'INVALID_REQUEST') {
      alert('❌ Google API Error: ' + testData.status + '\n\nCheck that your API key is valid and has Places API enabled.');
      console.error('Google API Error:', testData);
      return;
    }
    
    console.log('✅ API test passed, starting batch fetch...');
    await batchFetchAllPlaces();
    alert('✅ Sync complete! Check console for details.');
    
  } catch (err) {
    console.error('Sync error:', err);
    alert('❌ Sync failed: ' + err.message);
  } finally {
    btn.disabled = false;
    btn.textContent = '🔄 Sync Places';
  }
}
