// Ubud Insider - Recommendations Data
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
    
    places: [
        // Breakfast & Brunch
        {
            id: 1,
            name: "Milk and Madu",
            category: "breakfast",
            description: "Tasty breakfast in town centre",
            maps: "https://maps.app.goo.gl/XLbYrgMYHb5o2zLL6",
            area: "Town Centre"
        },
        {
            id: 2,
            name: "Alchemy Cafe",
            category: "breakfast",
            description: "Great smoothie bowls, go upstairs",
            maps: "https://maps.app.goo.gl/ebx3fxjLs3jBbBad9",
            area: "Town Centre"
        },
        {
            id: 3,
            name: "Yellow Flower Cafe",
            category: "breakfast",
            description: "Quiet cafe with gorgeous views",
            area: "Penestanan"
        },
        {
            id: 4,
            name: "Clear Cafe",
            category: "breakfast",
            description: "For hot days, great food and AC",
            area: "Town Centre"
        },
        {
            id: 5,
            name: "Cafe Curendera",
            category: "breakfast",
            description: "Hidden veggie lunch spot in jungle",
            area: "Jungle"
        },
        {
            id: 6,
            name: "Suka Express",
            category: "breakfast",
            description: "Tasty breakfast and coffee spot in town centre",
            area: "Town Centre"
        },
        {
            id: 7,
            name: "Jungle Fish",
            category: "breakfast",
            description: "Beautiful jungle pool, go for lunch with pool pass on sunny day",
            area: "Jungle"
        },
        {
            id: 8,
            name: "Tis Cafe",
            category: "breakfast",
            description: "Beautiful views of rice terraces and pool",
            area: "Rice Terraces"
        },
        {
            id: 9,
            name: "Mudra Cafe",
            category: "breakfast",
            description: "Great coffee, beautiful open-space in middle of town",
            area: "Town Centre"
        },
        {
            id: 10,
            name: "Pukako",
            category: "breakfast",
            description: "Beautiful cafe on rice fields",
            area: "Rice Fields"
        },
        {
            id: 11,
            name: "Sage",
            category: "breakfast",
            description: "Great vegetarian food",
            area: "Town Centre"
        },
        {
            id: 12,
            name: "Roosters",
            category: "breakfast",
            description: "Big out of town brekkie/lunch spot",
            area: "Out of Town"
        },
        {
            id: 13,
            name: "Huma Cafe",
            category: "breakfast",
            description: "Popular breakfast spot",
            area: "Town Centre"
        },
        {
            id: 14,
            name: "Locavore Bakery",
            category: "breakfast",
            description: "Great bakery",
            area: "Town Centre"
        },
        {
            id: 15,
            name: "Rusters Bakery",
            category: "breakfast",
            description: "Local bakery",
            area: "Town Centre"
        },

        // Dinner
        {
            id: 16,
            name: "Sayan House / Sayan Valley",
            category: "dinner",
            description: "Japanese fusion, great views. Go for sunset",
            area: "Sayan"
        },
        {
            id: 17,
            name: "Bambu Indah",
            category: "dinner",
            description: "Stunning bamboo hotel with fusion and riverside restaurant. Go for sunset",
            area: "Sayan"
        },
        {
            id: 18,
            name: "Cantina Rooftop",
            category: "dinner",
            description: "Mexican food with rooftop views",
            area: "Town Centre"
        },
        {
            id: 19,
            name: "Baracca",
            category: "dinner",
            description: "Italian restaurant",
            area: "Town Centre"
        },
        {
            id: 20,
            name: "Kebun Bistro",
            category: "dinner",
            description: "European style small plates",
            area: "Town Centre"
        },
        {
            id: 21,
            name: "Persona Lounge",
            category: "dinner",
            description: "Indian Food",
            area: "Town Centre"
        },
        {
            id: 22,
            name: "Honey and Smoke",
            category: "dinner",
            description: "New opening, great small plates",
            area: "Town Centre"
        },
        {
            id: 23,
            name: "Donna",
            category: "dinner",
            description: "Restaurant/bar in town. Lively at the weekend",
            area: "Town Centre"
        },
        {
            id: 24,
            name: "Copper Kitchen",
            category: "dinner",
            description: "Rooftop brunch/dinner",
            area: "Town Centre"
        },
        {
            id: 25,
            name: "Batubara / Chupabrasca",
            category: "dinner",
            description: "Best steak/grill spot",
            area: "Town Centre"
        },
        {
            id: 26,
            name: "Local Parts by Locavore",
            category: "dinner",
            description: "Great steak",
            area: "Town Centre"
        },
        {
            id: 27,
            name: "Copper",
            category: "dinner",
            description: "Kitchen and rooftop",
            area: "Town Centre"
        },

        // Vegetarian & Vegan
        {
            id: 28,
            name: "Plant Bistro",
            category: "vegetarian",
            description: "New vegetarian, great desserts",
            area: "Town Centre"
        },
        {
            id: 29,
            name: "Moksha",
            category: "vegetarian",
            description: "Dinner Ayurvedic Indian",
            area: "Town Centre"
        },
        {
            id: 30,
            name: "Sage",
            category: "vegetarian",
            description: "Great vegetarian food",
            area: "Town Centre"
        },

        // Warung (Local Food)
        {
            id: 31,
            name: "Warung Biah Biah",
            category: "warung",
            description: "Indonesian food, super cheap",
            area: "Town Centre"
        },
        {
            id: 32,
            name: "Capella",
            category: "warung",
            description: "Warung £££",
            area: "Town Centre"
        },
        {
            id: 33,
            name: "Warung Shanti",
            category: "warung",
            description: "Indonesian, great views",
            area: "Rice Fields"
        },
        {
            id: 34,
            name: "Warung Sun Sun",
            category: "warung",
            description: "Best nasi campur in Ubud",
            area: "Town Centre"
        },
        {
            id: 35,
            name: "Warung Siam + Warung Fair",
            category: "warung",
            description: "Delicious Thai food",
            area: "Town Centre"
        },
        {
            id: 36,
            name: "Warung Be Pasih",
            category: "warung",
            description: "Best seafood warung in Ubud",
            area: "Town Centre"
        },

        // Fine Dining
        {
            id: 37,
            name: "Locavore",
            category: "finedining",
            description: "£££ Best high end Indonesian. Also try Nusantara",
            area: "Town Centre"
        },
        {
            id: 38,
            name: "Nari",
            category: "finedining",
            description: "Wood-fire bistro overlooking Campuhan Ridge walk",
            area: "Campuhan"
        },
        {
            id: 39,
            name: "Mozaic",
            category: "finedining",
            description: "Fine dining restaurant",
            area: "Town Centre"
        },
        {
            id: 40,
            name: "Aperitif",
            category: "finedining",
            description: "Fine dining",
            area: "Town Centre"
        },
        {
            id: 41,
            name: "Locovore NXT",
            category: "finedining",
            description: "Fine dining",
            area: "Town Centre"
        },
        {
            id: 42,
            name: "Capella",
            category: "finedining",
            description: "£££ Incredible Japanese set menu",
            area: "Town Centre"
        },

        // Drinks & Evening
        {
            id: 43,
            name: "The Lair",
            category: "drinks",
            description: "Beautiful spot for cocktails",
            area: "Town Centre"
        },
        {
            id: 44,
            name: "Boliche / The Blue Door",
            category: "drinks",
            description: "The only two clubs in Ubud, for late night house dance vibes",
            area: "Town Centre"
        },
        {
            id: 45,
            name: "Sayuri",
            category: "drinks",
            description: "Chill spiritual vegan cafe with soft live music",
            area: "Town Centre"
        },
        {
            id: 46,
            name: "Little Green Door",
            category: "drinks",
            description: "Best dancing club (Canggu)",
            area: "Canggu"
        },
        {
            id: 47,
            name: "No Mas Bar",
            category: "drinks",
            description: "Ubud's best Bar for late-night cocktails and dancing",
            area: "Town Centre"
        },

        // Yoga & Spiritual
        {
            id: 48,
            name: "Pyramids of Chi",
            category: "yoga",
            description: "Ancient Sound Healing, Inner Child with Nicole",
            area: "Out of Town"
        },
        {
            id: 49,
            name: "Yoga Barn",
            category: "yoga",
            description: "Best teachers: Byron De Marse (Empowerment/Slow Flow), Paul Toledo (Vinyasa), Carlos Romero (Yin), Chris Walker (Yin), Gregory Kapps (Kundalini Yoga), Alyssa Goldberg, Emily Kusser, Bex Tyler. Ecstatic dance Friday night & Sunday morning. Special events on Saturday night.",
            area: "Town Centre"
        },
        {
            id: 50,
            name: "Alchemy Yoga",
            category: "yoga",
            description: "Love Ashton, Emma and Persia's classes. Try breathwork with Nicole. Special events on Saturday night.",
            area: "Penestanan"
        },
        {
            id: 51,
            name: "Intuitive Flow Yoga",
            category: "yoga",
            description: "Beautiful small Yoga Studio in Penestanan. Breathtaking views, very authentic teachers, small classes. Favourite studio.",
            area: "Penestanan"
        },
        {
            id: 52,
            name: "Ubud Yoga House",
            category: "yoga",
            description: "Small classes, incredible views of ricefields",
            area: "Rice Fields"
        },
        {
            id: 53,
            name: "Ubud Yoga Centre",
            category: "yoga",
            description: "Great views, hot yoga",
            area: "Town Centre"
        },
        {
            id: 54,
            name: "Serendipity Sounds",
            category: "yoga",
            description: "Hidden spot for sound journeys and meditations, beautiful small venue. Book in advance on website.",
            area: "Town Centre"
        },

        // Healers
        {
            id: 55,
            name: "Pac Man",
            category: "healers",
            description: "Famous energy healer",
            area: "Town Centre"
        },
        {
            id: 56,
            name: "I Nyoman Sudana Papa Nyoman",
            category: "healers",
            description: "Reflexology",
            area: "Town Centre"
        },
        {
            id: 57,
            name: "The Wizard",
            category: "healers",
            description: "Aura readings & stone selection",
            area: "Town Centre"
        },
        {
            id: 58,
            name: "Jero Mangku Sofia",
            category: "healers",
            description: "Balancing",
            area: "Town Centre"
        },
        {
            id: 59,
            name: "Qi - western medicine & TCM doctor",
            category: "healers",
            description: "Book for acupuncture or cupping, beautiful clinic in the jungle",
            area: "Jungle"
        },
        {
            id: 60,
            name: "Dr Sujata",
            category: "healers",
            description: "Ayurvedic doctor in Nyuh Kuning, great for Ayurvedic balancing and treatments",
            area: "Nyuh Kuning"
        },
        {
            id: 61,
            name: "Pau",
            category: "healers",
            description: "Osteopathatic healer",
            area: "Town Centre"
        },

        // Massage & Spa
        {
            id: 62,
            name: "Putri Ubud 1 / Putri Ubud 3",
            category: "spa",
            description: "Massage spa",
            area: "Town Centre"
        },
        {
            id: 63,
            name: "Tjampuan Spa",
            category: "spa",
            description: "Outdoor hot pools / sauna etc",
            area: "Tjampuan"
        },
        {
            id: 64,
            name: "Cantika Zest",
            category: "spa",
            description: "Spa with great masseuses",
            area: "Town Centre"
        },
        {
            id: 65,
            name: "Jaens Spa / Karsa / Hesa",
            category: "spa",
            description: "Beautiful spas with great masseuses",
            area: "Various"
        },
        {
            id: 66,
            name: "Titi Batu",
            category: "spa",
            description: "Gym and day pool club",
            area: "Town Centre"
        },
        {
            id: 67,
            name: "Rendezvous Fitness",
            category: "spa",
            description: "New gym north of Ubud",
            area: "North Ubud"
        },
        {
            id: 68,
            name: "Dragon Fly Village",
            category: "spa",
            description: "Outdoor herbal sauna, bonfire and Salt Water Pool. Mon/Weds/Saturday evening 6-9pm, on Sok Subak Wah",
            area: "Sok Subak Wah"
        },

        // Walks
        {
            id: 69,
            name: "Sok Subak Wah Walk",
            category: "walks",
            description: "Beautiful peaceful sunset walk in rice fields. Google 'Shanti Warung' to find.",
            area: "Rice Fields"
        },
        {
            id: 70,
            name: "Sweet Orange trail walk",
            category: "walks",
            description: "Rice field walk, nice Warungs for dinner",
            area: "Rice Fields"
        },
        {
            id: 71,
            name: "Hikaria",
            category: "walks",
            description: "Beautiful night walk with sound and light show",
            area: "Out of Town"
        },
        {
            id: 72,
            name: "Campuhan Ridge Walk",
            category: "walks",
            description: "Famous ridge walk with scenic views",
            area: "Campuhan"
        },

        // Excursions
        {
            id: 73,
            name: "Water Purification Ceremony",
            category: "excursions",
            description: "Book on Airbnb with trip to shaman, or go to Tirta Empul or Sebatu. Recommend going early to avoid crowds.",
            area: "Various"
        },
        {
            id: 74,
            name: "Mount Batur",
            category: "excursions",
            description: "Sunrise Volcano Hike",
            area: "Mount Batur"
        },
        {
            id: 75,
            name: "Tegallang Rice Terraces",
            category: "excursions",
            description: "Go for walk, lunch at Tis Cafe and swim. Don't need a guide.",
            area: "Tegallang"
        },
        {
            id: 76,
            name: "Jetuwia Rice Terraces / Batukaru Coffee Estate",
            category: "excursions",
            description: "Rice terraces and coffee estate tour",
            area: "Out of Town"
        }
    ]
};

// Export for use in app
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { UBUD_DATA };
}
