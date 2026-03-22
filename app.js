// Ubud Insider App
let currentCategory = 'all';
let searchTerm = '';
let currentView = 'list';
let favorites = JSON.parse(localStorage.getItem('ubud_favorites') || '[]');
let map = null;
let markers = [];

const API_BASE = '';

// Initialize app
document.addEventListener('DOMContentLoaded', () => {
    renderCategories();
    renderPlaces();
    updateFavCount();
    setupEventListeners();
    initMap();
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
}

// Switch between list and map view
function switchView(view) {
    currentView = view;
    
    // Update button states
    document.querySelectorAll('.view-btn').forEach(btn => {
        btn.classList.toggle('active', btn.dataset.view === view);
    });
    
    // Show/hide containers
    document.getElementById('placesList').style.display = view === 'list' ? 'flex' : 'none';
    document.getElementById('mapContainer').style.display = view === 'map' ? 'block' : 'none';
    
    if (view === 'list') {
        renderPlaces();
    } else {
        setTimeout(() => {
            if (map) map.invalidateSize();
            updateMapMarkers();
        }, 100);
    }
}

// Initialize map
function initMap() {
    const mapCenter = UBUD_DATA.mapCenter;
    
    map = L.map('map').setView([mapCenter.lat, mapCenter.lng], 15);
    
    // Add dark theme tiles
    L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png', {
        attribution: '&copy; OpenStreetMap contributors &copy; CARTO',
        subdomains: 'abcd',
        maxZoom: 19
    }).addTo(map);
    
    updateMapMarkers();
}

// Update map markers
function updateMapMarkers() {
    // Clear existing markers
    markers.forEach(marker => map.removeLayer(marker));
    markers = [];
    
    const filtered = getFilteredPlaces();
    
    filtered.forEach(place => {
        if (!place.lat || !place.lng) return;
        
        const category = UBUD_DATA.categories.find(c => c.id === place.category);
        const icon = category ? category.icon : '📍';
        
        const marker = L.marker([place.lat, place.lng])
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
    
    // Fit bounds if we have markers
    if (markers.length > 0) {
        const group = new L.featureGroup(markers);
        map.fitBounds(group.getBounds().pad(0.1));
    }
}

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
    
    // Update button states
    document.querySelectorAll('.category-btn').forEach(btn => {
        btn.classList.toggle('active', btn.dataset.category === category);
    });
    
    if (currentView === 'list') {
        renderPlaces();
    } else {
        updateMapMarkers();
    }
}

// Get filtered places
function getFilteredPlaces() {
    return UBUD_DATA.places.filter(place => {
        if (currentCategory !== 'all' && place.category !== currentCategory) {
            return false;
        }
        
        if (searchTerm) {
            const searchFields = [
                place.name,
                place.description,
                place.area,
                UBUD_DATA.categories.find(c => c.id === place.category)?.name || ''
            ].join(' ').toLowerCase();
            
            return searchFields.includes(searchTerm);
        }
        
        return true;
    });
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
    statsText.textContent = `Showing ${filtered.length} ${categoryName}`;
    
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
        
        return `
            <article class="place-card" style="animation-delay: ${index * 0.05}s" onclick="openPlaceModal(${place.id})">
                <div class="place-header">
                    <h3 class="place-name">${escapeHtml(place.name)}</h3>
                </div>
                
                <button class="fav-btn ${isFav ? 'active' : ''}" 
                        onclick="event.stopPropagation(); toggleFavorite(${place.id})"
                        aria-label="${isFav ? 'Remove from favorites' : 'Add to favorites'}">
                    ${isFav ? '⭐' : '☆'}
                </button>
                
                <div class="place-meta">
                    <span class="category-tag">${category?.icon || ''} ${category?.name || place.category}</span>
                    ${place.area ? `<span class="area-tag">📍 ${escapeHtml(place.area)}</span>` : ''}
                </div>
                
                <p class="place-description">${escapeHtml(place.description)}</p>
                
                <div class="card-actions">
                    ${place.maps ? `
                        <a href="${place.maps}" target="_blank" rel="noopener" class="maps-link" onclick="event.stopPropagation()">
                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                <polygon points="1 6 1 22 8 18 16 22 21 18 21 2 16 6 8 2 1 6"></polygon>
                            </svg>
                            Directions
                        </a>
                    ` : ''}
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
            ${place.maps ? `
                <a href="${place.maps}" target="_blank" rel="noopener" class="maps-link" style="width: 100%; justify-content: center; padding: 12px; font-size: 1rem;">
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <polygon points="1 6 1 22 8 18 16 22 21 18 21 2 16 6 8 2 1 6"></polygon>
                    </svg>
                    Open in Google Maps
                </a>
            ` : ''}
        </div>
        
        ${!place.address ? `
            <div class="modal-section" style="margin-top: 16px; padding: 12px; background: var(--bg-secondary); border-radius: var(--radius-sm);">
                <p class="modal-text" style="font-size: 0.8rem; color: var(--text-tertiary); text-align: center;">
                    💡 More details available with <a href="https://developers.google.com/maps/documentation/places/web-service/get-api-key" target="_blank" style="color: var(--accent-light);">Google Places API</a>
                </p>
            </div>
        ` : ''}
    `;
    
    document.getElementById('placeModal').style.display = 'flex';
    document.body.style.overflow = 'hidden';
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
