// Ubud Insider App
let currentCategory = 'all';
let searchTerm = '';
let favorites = JSON.parse(localStorage.getItem('ubud_favorites') || '[]');

// Initialize app
document.addEventListener('DOMContentLoaded', () => {
    renderCategories();
    renderPlaces();
    updateFavCount();
    setupEventListeners();
});

// Setup event listeners
function setupEventListeners() {
    // Search input
    const searchInput = document.getElementById('searchInput');
    const clearBtn = document.getElementById('clearSearch');
    
    searchInput.addEventListener('input', (e) => {
        searchTerm = e.target.value.toLowerCase();
        clearBtn.style.display = searchTerm ? 'block' : 'none';
        renderPlaces();
    });
    
    clearBtn.addEventListener('click', () => {
        searchInput.value = '';
        searchTerm = '';
        clearBtn.style.display = 'none';
        renderPlaces();
    });
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
    
    renderPlaces();
}

// Get filtered places
function getFilteredPlaces() {
    return UBUD_DATA.places.filter(place => {
        // Category filter
        if (currentCategory !== 'all' && place.category !== currentCategory) {
            return false;
        }
        
        // Search filter
        if (searchTerm) {
            const searchFields = [
                place.name,
                place.description,
                place.area,
                UBUD_DATA.categories.find(c => c.id === place.category)?.name || ''
            ].join(' ').toLowerCase();
            
            if (!searchFields.includes(searchTerm)) {
                return false;
            }
        }
        
        return true;
    });
}

// Render places
function renderPlaces() {
    const container = document.getElementById('placesList');
    const emptyState = document.getElementById('emptyState');
    const statsText = document.getElementById('statsText');
    
    const filtered = getFilteredPlaces();
    
    // Update stats
    const categoryName = currentCategory === 'all' 
        ? 'all places' 
        : UBUD_DATA.categories.find(c => c.id === currentCategory)?.name.toLowerCase();
    statsText.textContent = `Showing ${filtered.length} ${categoryName}`;
    
    // Show/hide empty state
    if (filtered.length === 0) {
        container.style.display = 'none';
        emptyState.style.display = 'block';
        return;
    }
    
    container.style.display = 'flex';
    emptyState.style.display = 'none';
    
    // Render cards
    container.innerHTML = filtered.map((place, index) => {
        const category = UBUD_DATA.categories.find(c => c.id === place.category);
        const isFav = favorites.includes(place.id);
        
        return `
            <article class="place-card" style="animation-delay: ${index * 0.05}s">
                <div class="place-header">
                    <h3 class="place-name">${escapeHtml(place.name)}</h3>
                    <button class="fav-btn ${isFav ? 'active' : ''}" 
                            onclick="toggleFavorite(${place.id})"
                            aria-label="${isFav ? 'Remove from favorites' : 'Add to favorites'}">
                        ${isFav ? '⭐' : '☆'}
                    </button>
                </div>
                
                <div class="place-meta">
                    <span class="category-tag">
                        ${category?.icon || ''} ${category?.name || place.category}
                    </span>
                    ${place.area ? `<span class="area-tag">📍 ${escapeHtml(place.area)}</span>` : ''}
                </div>
                
                <p class="place-description">${escapeHtml(place.description)}</p>
                
                ${place.maps ? `
                    <a href="${place.maps}" target="_blank" rel="noopener" class="maps-link">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                            <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path>
                            <circle cx="12" cy="10" r="3"></circle>
                        </svg>
                        Open in Maps
                    </a>
                ` : ''}
            </article>
        `;
    }).join('');
}

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
    renderPlaces();
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

// Share function (for future use)
function sharePlace(place) {
    if (navigator.share) {
        navigator.share({
            title: place.name,
            text: `${place.name} - ${place.description}`,
            url: place.maps || window.location.href
        });
    } else {
        // Fallback - copy to clipboard
        const text = `${place.name}\n${place.description}\n${place.maps || ''}`;
        navigator.clipboard.writeText(text).then(() => {
            alert('Copied to clipboard!');
        });
    }
}
