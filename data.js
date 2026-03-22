// Ubud Insider - Recommendations Data
// Coordinates are approximate (Ubud, Bali area)
// For precise locations, enable Google Places API in config.js

const UBUD_DATA = {
    categories: [
        { id: 'breakfast', name: 'Breakfast & Brunch', icon: '🍳' },
        { id: 'dinner', name: 'Dinner', icon: '🍽️' },
        { id: 'vegetarian', name: 'Vegetarian & Vegan', icon: '🥗' },
        { id: 'warung', name: 'Warung (Local Food)', icon: '🍜' },
        { id: 'finedining', name: 'Fine Dining', icon: '✨' },
        { id: 'drinks', name: 'Drinks & Evening', icon: '🍸' },
        { id: 'yoga', name: 'Yoga & Spiritual', icon: '🧘' },
        { id: 'healers', name: 'Healers', icon: '💫' },
        { id: 'spa', name: 'Massage & Spa', icon: '💆' },
        { id: 'walks', name: 'Walks', icon: '🚶' },
        { id: 'excursions', name: 'Excursions', icon: '🌄' }
    ],
    
    // Center of Ubud for map
    mapCenter: { lat: -8.5069, lng: 115.2625 },
    
    places: [
        // Breakfast & Brunch
        { id: 1, name: "Milk and Madu", category: "breakfast", description: "Tasty breakfast in town centre", maps: "https://maps.app.goo.gl/XLbYrgMYHb5o2zLL6", area: "Town Centre", lat: -8.5069, lng: 115.2625 },
        { id: 2, name: "Alchemy Cafe", category: "breakfast", description: "Great smoothie bowls, go upstairs", maps: "https://maps.app.goo.gl/ebx3fxjLs3jBbBad9", area: "Town Centre", lat: -8.5072, lng: 115.2630 },
        { id: 3, name: "Yellow Flower Cafe", category: "breakfast", description: "Quiet cafe with gorgeous views", area: "Penestanan", lat: -8.5090, lng: 115.2600 },
        { id: 4, name: "Clear Cafe", category: "breakfast", description: "For hot days, great food and AC", area: "Town Centre", lat: -8.5065, lng: 115.2620 },
        { id: 5, name: "Cafe Curendera", category: "breakfast", description: "Hidden veggie lunch spot in jungle", area: "Jungle", lat: -8.5200, lng: 115.2800 },
        { id: 6, name: "Suka Express", category: "breakfast", description: "Tasty breakfast and coffee spot in town centre", area: "Town Centre", lat: -8.5070, lng: 115.2628 },
        { id: 7, name: "Jungle Fish", category: "breakfast", description: "Beautiful jungle pool, go for lunch with pool pass on sunny day", area: "Jungle", lat: -8.5205, lng: 115.2810 },
        { id: 8, name: "Tis Cafe", category: "breakfast", description: "Beautiful views of rice terraces and pool", area: "Rice Terraces", lat: -8.4300, lng: 115.2800 },
        { id: 9, name: "Mudra Cafe", category: "breakfast", description: "Great coffee, beautiful open-space in middle of town", area: "Town Centre", lat: -8.5060, lng: 115.2635 },
        { id: 10, name: "Pukako", category: "breakfast", description: "Beautiful cafe on rice fields", area: "Rice Fields", lat: -8.5150, lng: 115.2650 },
        { id: 11, name: "Sage", category: "breakfast", description: "Great vegetarian food", area: "Town Centre", lat: -8.5075, lng: 115.2615 },
        { id: 12, name: "Roosters", category: "breakfast", description: "Big out of town brekkie/lunch spot", area: "Out of Town", lat: -8.5500, lng: 115.2500 },
        { id: 13, name: "Huma Cafe", category: "breakfast", description: "Popular breakfast spot", area: "Town Centre", lat: -8.5080, lng: 115.2620 },
        { id: 14, name: "Locavore Bakery", category: "breakfast", description: "Great bakery", area: "Town Centre", lat: -8.5055, lng: 115.2640 },
        { id: 15, name: "Rusters Bakery", category: "breakfast", description: "Local bakery", area: "Town Centre", lat: -8.5062, lng: 115.2632 },

        // Dinner
        { id: 16, name: "Sayan House / Sayan Valley", category: "dinner", description: "Japanese fusion, great views. Go for sunset", area: "Sayan", lat: -8.5200, lng: 115.2500 },
        { id: 17, name: "Bambu Indah", category: "dinner", description: "Stunning bamboo hotel with fusion and riverside restaurant. Go for sunset", area: "Sayan", lat: -8.5205, lng: 115.2490 },
        { id: 18, name: "Cantina Rooftop", category: "dinner", description: "Mexican food with rooftop views", area: "Town Centre", lat: -8.5070, lng: 115.2640 },
        { id: 19, name: "Baracca", category: "dinner", description: "Italian restaurant", area: "Town Centre", lat: -8.5065, lng: 115.2645 },
        { id: 20, name: "Kebun Bistro", category: "dinner", description: "European style small plates", area: "Town Centre", lat: -8.5078, lng: 115.2630 },
        { id: 21, name: "Persona Lounge", category: "dinner", description: "Indian Food", area: "Town Centre", lat: -8.5062, lng: 115.2650 },
        { id: 22, name: "Honey and Smoke", category: "dinner", description: "New opening, great small plates", area: "Town Centre", lat: -8.5085, lng: 115.2620 },
        { id: 23, name: "Donna", category: "dinner", description: "Restaurant/bar in town. Lively at the weekend", area: "Town Centre", lat: -8.5058, lng: 115.2655 },
        { id: 24, name: "Copper Kitchen", category: "dinner", description: "Rooftop brunch/dinner", area: "Town Centre", lat: -8.5072, lng: 115.2638 },
        { id: 25, name: "Batubara / Chupabrasca", category: "dinner", description: "Best steak/grill spot", area: "Town Centre", lat: -8.5060, lng: 115.2660 },
        { id: 26, name: "Local Parts by Locavore", category: "dinner", description: "Great steak", area: "Town Centre", lat: -8.5055, lng: 115.2665 },
        { id: 27, name: "Copper", category: "dinner", description: "Kitchen and rooftop", area: "Town Centre", lat: -8.5072, lng: 115.2638 },

        // Vegetarian & Vegan
        { id: 28, name: "Plant Bistro", category: "vegetarian", description: "New vegetarian, great desserts", area: "Town Centre", lat: -8.5080, lng: 115.2610 },
        { id: 29, name: "Moksha", category: "vegetarian", description: "Dinner Ayurvedic Indian", area: "Town Centre", lat: -8.5070, lng: 115.2620 },
        { id: 30, name: "Sage", category: "vegetarian", description: "Great vegetarian food", area: "Town Centre", lat: -8.5075, lng: 115.2615 },

        // Warung (Local Food)
        { id: 31, name: "Warung Biah Biah", category: "warung", description: "Indonesian food, super cheap", area: "Town Centre", lat: -8.5068, lng: 115.2640 },
        { id: 32, name: "Capella", category: "warung", description: "Warung £££", area: "Town Centre", lat: -8.5075, lng: 115.2650 },
        { id: 33, name: "Warung Shanti", category: "warung", description: "Indonesian, great views", area: "Rice Fields", lat: -8.5160, lng: 115.2660 },
        { id: 34, name: "Warung Sun Sun", category: "warung", description: "Best nasi campur in Ubud", area: "Town Centre", lat: -8.5060, lng: 115.2655 },
        { id: 35, name: "Warung Siam + Warung Fair", category: "warung", description: "Delicious Thai food", area: "Town Centre", lat: -8.5070, lng: 115.2645 },
        { id: 36, name: "Warung Be Pasih", category: "warung", description: "Best seafood warung in Ubud", area: "Town Centre", lat: -8.5080, lng: 115.2635 },

        // Fine Dining
        { id: 37, name: "Locavore", category: "finedining", description: "£££ Best high end Indonesian. Also try Nusantara", area: "Town Centre", lat: -8.5055, lng: 115.2670 },
        { id: 38, name: "Nari", category: "finedining", description: "Wood-fire bistro overlooking Campuhan Ridge walk", area: "Campuhan", lat: -8.5050, lng: 115.2550 },
        { id: 39, name: "Mozaic", category: "finedining", description: "Fine dining restaurant", area: "Town Centre", lat: -8.5050, lng: 115.2680 },
        { id: 40, name: "Aperitif", category: "finedining", description: "Fine dining", area: "Town Centre", lat: -8.5045, lng: 115.2685 },
        { id: 41, name: "Locovore NXT", category: "finedining", description: "Fine dining", area: "Town Centre", lat: -8.5055, lng: 115.2675 },
        { id: 42, name: "Capella", category: "finedining", description: "£££ Incredible Japanese set menu", area: "Town Centre", lat: -8.5075, lng: 115.2650 },

        // Drinks & Evening
        { id: 43, name: "The Lair", category: "drinks", description: "Beautiful spot for cocktails", area: "Town Centre", lat: -8.5070, lng: 115.2660 },
        { id: 44, name: "Boliche / The Blue Door", category: "drinks", description: "The only two clubs in Ubud, for late night house dance vibes", area: "Town Centre", lat: -8.5080, lng: 115.2650 },
        { id: 45, name: "Sayuri", category: "drinks", description: "Chill spiritual vegan cafe with soft live music", area: "Town Centre", lat: -8.5065, lng: 115.2640 },
        { id: 46, name: "Little Green Door", category: "drinks", description: "Best dancing club (Canggu)", area: "Canggu", lat: -8.6500, lng: 115.1500 },
        { id: 47, name: "No Mas Bar", category: "drinks", description: "Ubud's best Bar for late-night cocktails and dancing", area: "Town Centre", lat: -8.5075, lng: 115.2665 },

        // Yoga & Spiritual
        { id: 48, name: "Pyramids of Chi", category: "yoga", description: "Ancient Sound Healing, Inner Child with Nicole", area: "Out of Town", lat: -8.5500, lng: 115.2800 },
        { id: 49, name: "Yoga Barn", category: "yoga", description: "Best teachers: Byron De Marse (Empowerment/Slow Flow), Paul Toledo (Vinyasa), Carlos Romero (Yin), Chris Walker (Yin), Gregory Kapps (Kundalini Yoga). Ecstatic dance Friday night & Sunday morning.", area: "Town Centre", lat: -8.5090, lng: 115.2610 },
        { id: 50, name: "Alchemy Yoga", category: "yoga", description: "Love Ashton, Emma and Persia's classes. Try breathwork with Nicole.", area: "Penestanan", lat: -8.5095, lng: 115.2595 },
        { id: 51, name: "Intuitive Flow Yoga", category: "yoga", description: "Beautiful small Yoga Studio in Penestanan. Breathtaking views, very authentic teachers.", area: "Penestanan", lat: -8.5100, lng: 115.2590 },
        { id: 52, name: "Ubud Yoga House", category: "yoga", description: "Small classes, incredible views of ricefields", area: "Rice Fields", lat: -8.5160, lng: 115.2670 },
        { id: 53, name: "Ubud Yoga Centre", category: "yoga", description: "Great views, hot yoga", area: "Town Centre", lat: -8.5080, lng: 115.2600 },
        { id: 54, name: "Serendipity Sounds", category: "yoga", description: "Hidden spot for sound journeys and meditations, beautiful small venue.", area: "Town Centre", lat: -8.5070, lng: 115.2590 },

        // Healers
        { id: 55, name: "Pac Man", category: "healers", description: "Famous energy healer", area: "Town Centre", lat: -8.5085, lng: 115.2610 },
        { id: 56, name: "I Nyoman Sudana Papa Nyoman", category: "healers", description: "Reflexology", area: "Town Centre", lat: -8.5090, lng: 115.2605 },
        { id: 57, name: "The Wizard", category: "healers", description: "Aura readings & stone selection", area: "Town Centre", lat: -8.5080, lng: 115.2620 },
        { id: 58, name: "Jero Mangku Sofia", category: "healers", description: "Balancing", area: "Town Centre", lat: -8.5075, lng: 115.2630 },
        { id: 59, name: "Qi - western medicine & TCM doctor", category: "healers", description: "Book for acupuncture or cupping, beautiful clinic in the jungle", area: "Jungle", lat: -8.5210, lng: 115.2820 },
        { id: 60, name: "Dr Sujata", category: "healers", description: "Ayurvedic doctor in Nyuh Kuning, great for Ayurvedic balancing", area: "Nyuh Kuning", lat: -8.5250, lng: 115.2650 },
        { id: 61, name: "Pau", category: "healers", description: "Osteopathatic healer", area: "Town Centre", lat: -8.5082, lng: 115.2615 },

        // Massage & Spa
        { id: 62, name: "Putri Ubud 1 / Putri Ubud 3", category: "spa", description: "Massage spa", area: "Town Centre", lat: -8.5070, lng: 115.2640 },
        { id: 63, name: "Tjampuan Spa", category: "spa", description: "Outdoor hot pools / sauna etc", area: "Tjampuan", lat: -8.5100, lng: 115.2700 },
        { id: 64, name: "Cantika Zest", category: "spa", description: "Spa with great masseuses", area: "Town Centre", lat: -8.5085, lng: 115.2630 },
        { id: 65, name: "Jaens Spa / Karsa / Hesa", category: "spa", description: "Beautiful spas with great masseuses", area: "Various", lat: -8.5150, lng: 115.2700 },
        { id: 66, name: "Titi Batu", category: "spa", description: "Gym and day pool club", area: "Town Centre", lat: -8.5095, lng: 115.2620 },
        { id: 67, name: "Rendezvous Fitness", category: "spa", description: "New gym north of Ubud", area: "North Ubud", lat: -8.4800, lng: 115.2600 },
        { id: 68, name: "Dragon Fly Village", category: "spa", description: "Outdoor herbal sauna, bonfire and Salt Water Pool. Mon/Weds/Sat 6-9pm", area: "Sok Subak Wah", lat: -8.5085, lng: 115.2585 },

        // Walks
        { id: 69, name: "Sok Subak Wah Walk", category: "walks", description: "Beautiful peaceful sunset walk in rice fields", area: "Sok Subak Wah", lat: -8.5080, lng: 115.2580 },
        { id: 70, name: "Sweet Orange trail walk", category: "walks", description: "Rice field walk, nice Warungs for dinner", area: "Rice Fields", lat: -8.5170, lng: 115.2680 },
        { id: 71, name: "Hikaria", category: "walks", description: "Beautiful night walk with sound and light show", area: "Out of Town", lat: -8.5600, lng: 115.2500 },
        { id: 72, name: "Campuhan Ridge Walk", category: "walks", description: "Famous ridge walk with scenic views", area: "Campuhan", lat: -8.5050, lng: 115.2550 },

        // Excursions
        { id: 73, name: "Water Purification Ceremony", category: "excursions", description: "Book on Airbnb with trip to shaman, or go to Tirta Empul or Sebatu. Go early to avoid crowds.", area: "Various", lat: -8.5300, lng: 115.3200 },
        { id: 74, name: "Mount Batur", category: "excursions", description: "Sunrise Volcano Hike", area: "Mount Batur", lat: -8.2400, lng: 115.3800 },
        { id: 75, name: "Tegallang Rice Terraces", category: "excursions", description: "Go for walk, lunch at Tis Cafe and swim. Don't need a guide.", area: "Tegallang", lat: -8.4300, lng: 115.2800 },
        { id: 76, name: "Jetuwia Rice Terraces / Batukaru Coffee Estate", category: "excursions", description: "Rice terraces and coffee estate tour", area: "Out of Town", lat: -8.4500, lng: 115.3000 }
    ]
};

// Export for use in app
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { UBUD_DATA };
}
