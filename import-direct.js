// Direct import from populate-why-this-place.js data to PostgreSQL
const { Pool } = require('pg');

const DATABASE_URL = "postgresql://postgres:XZtCObtaOWfmkXhNtOOAvcASQeVhkpxu@centerbeam.proxy.rlwy.net:46202/railway";

// Data from populate-why-this-place.js (full dataset)
const descriptions = [
  { id: 1, sentence: "The 3-egg skillet here is legendary. Industrial-chic vibes right across from Ubud Palace.", tags: ["Famous Skillet Eggs", "Central Location", "Family-Friendly"] },
  { id: 2, sentence: "Bali's first 100% raw vegan cafe. The DIY salad bar and raw banoffee pie are worth the hype.", tags: ["Raw Vegan Pioneer", "DIY Salad Bar", "Raw Desserts"] },
  { id: 3, sentence: "Quiet cafe tucked away in Penestanan with gorgeous rice field views. Perfect post-yoga spot.", tags: ["Rice Field Views", "Quiet Vibes", "Penestanan"] },
  { id: 4, sentence: "Bohemian open-space cafe with AC when you need to escape the heat. On-site spa upstairs.", tags: ["Bohemian Vibes", "AC Available", "On-site Spa"] },
  { id: 5, sentence: "Hidden veggie lunch spot literally in the jungle. The kind of place you stumble upon and never forget.", tags: ["Jungle Setting", "Hidden Gem", "Vegetarian"] },
  { id: 6, sentence: "Aussie-style brunch with small-batch coffee from Indonesia and South America. The 60k breaky special is legendary.", tags: ["Aussie Brunch", "Single Origin Coffee", "Great Value"] },
  { id: 7, sentence: "Beautiful infinity pool cafe surrounded by jungle. Grab lunch and a pool pass on sunny days.", tags: ["Infinity Pool", "Jungle Views", "Day Pass Available"] },
  { id: 8, sentence: "Stunning views of Tegalalang rice terraces with a pool. Bring your camera and stay for sunset.", tags: ["Rice Terrace Views", "Instagram-worthy", "Sunset Spot"] },
  { id: 9, sentence: "Small-batch coffee in a beautiful open space right in town. Popular with nomads for good reason.", tags: ["Small-batch Coffee", "Digital Nomad Friendly", "Central"] },
  { id: 10, sentence: "Stunning cafe sitting right among the rice fields. The view here is pure Ubud magic.", tags: ["Rice Field Setting", "Scenic Views", "Peaceful"] },
  { id: 11, sentence: "Consistently great vegetarian food in the heart of town. A reliable favorite for plant-based eaters.", tags: ["Vegetarian", "Reliable Quality", "Central"] },
  { id: 12, sentence: "Big out-of-town breakfast spot popular with expat families. Wood-fired pizzas in the evening.", tags: ["Family-Friendly", "Wood-fired Pizza", "Big Portions"] },
  { id: 13, sentence: "Excellent coffee with rice field views. Sister to Pubas Space with their own Goldmine roasts.", tags: ["Goldmine Coffee", "Rice Field Views", "Popular Spot"] },
  { id: 14, sentence: "Artisan bakery from the Locavore team. Fresh pastries and sourdough worth the trip.", tags: ["Artisan Bakery", "Fresh Pastries", "Sourdough"] },
  { id: 15, sentence: "Local bakery with a cult following. Grab their fresh bread early before it sells out.", tags: ["Fresh Bread", "Local Favorite", "Early Bird"] },
  { id: 16, sentence: "Japanese fusion with sunset views over the Sayan Valley. Arrive early for golden hour.", tags: ["Japanese Fusion", "Sunset Views", "Sayan Valley"] },
  { id: 17, sentence: "Stunning bamboo eco-hotel with riverside dining. The bamboo architecture alone is worth the visit.", tags: ["Bamboo Architecture", "Eco-Luxury", "Riverside"] },
  { id: 18, sentence: "Mexican food with rooftop views and a lively crowd. Best margaritas in town.", tags: ["Mexican", "Rooftop Views", "Margaritas"] },
  { id: 19, sentence: "Authentic Italian in a romantic setting. The pasta here rivals restaurants in Rome.", tags: ["Authentic Italian", "Romantic", "Fresh Pasta"] },
  { id: 20, sentence: "European small plates perfect for sharing. Great date night spot in the heart of Ubud.", tags: ["Small Plates", "Date Night", "European"] },
  { id: 21, sentence: "Upscale Indian with Ayurvedic influences. The kind of place you dress up for.", tags: ["Upscale Indian", "Ayurvedic", "Special Occasion"] },
  { id: 22, sentence: "New opening serving creative small plates. The smoked dishes here are standouts.", tags: ["New Opening", "Small Plates", "Smoked Dishes"] },
  { id: 23, sentence: "Lively restaurant-bar that gets packed on weekends. Come for dinner, stay for drinks.", tags: ["Lively", "Weekend Crowd", "Dinner and Drinks"] },
  { id: 24, sentence: "Rooftop brunch and dinner with panoramic views. Sunset cocktails are mandatory here.", tags: ["Rooftop", "Panoramic Views", "Sunset Cocktails"] },
  { id: 25, sentence: "The best steak and grill in Ubud. Meat lovers pilgrimage here for the dry-aged cuts.", tags: ["Best Steak", "Dry-aged", "Grill"] },
  { id: 26, sentence: "From the Locavore team, focusing on locally-sourced ingredients. The steak here is exceptional.", tags: ["Locally-sourced", "Locavore Team", "Great Steak"] },
  { id: 27, sentence: "Kitchen and rooftop combo in town center. Reliable choice for groups.", tags: ["Rooftop", "Central", "Group-friendly"] },
  { id: 28, sentence: "New vegetarian spot with creative desserts. The pastry chef here is genuinely talented.", tags: ["New Opening", "Creative Desserts", "Vegetarian"] },
  { id: 29, sentence: "Ayurvedic Indian dinner spot with healing vibes. Every dish feels like medicine.", tags: ["Ayurvedic", "Healing Food", "Indian"] },
  { id: 30, sentence: "Consistently great vegetarian food that even meat-eaters love. A Ubud staple.", tags: ["Vegetarian Staple", "Crowd-pleaser", "Reliable"] },
  { id: 31, sentence: "Super cheap Indonesian food right in the center. The kind of place locals and tourists both love.", tags: ["Super Cheap", "Indonesian", "Local Favorite"] },
  { id: 32, sentence: "Warung with upscale touches. Indonesian classics done with premium ingredients.", tags: ["Upscale Warung", "Premium Ingredients", "Indonesian"] },
  { id: 33, sentence: "Indonesian food with stunning rice field views. Worth the short ride out of town.", tags: ["Rice Field Views", "Indonesian", "Out of Town"] },
  { id: 34, sentence: "The best nasi campur in Ubud, full stop. Locals queue up at lunch for good reason.", tags: ["Best Nasi Campur", "Locals Queue", "Lunch Spot"] },
  { id: 35, sentence: "Delicious Thai food in warung style. The pad thai here rivals restaurants in Bangkok.", tags: ["Thai Food", "Pad Thai", "Warung Style"] },
  { id: 36, sentence: "The best seafood warung in Ubud. Fresh catches cooked to order at local prices.", tags: ["Seafood", "Fresh Catch", "Best in Ubud"] },
  { id: 37, sentence: "Ubud's most celebrated fine dining. Indonesian flavors reimagined through a modern lens.", tags: ["Fine Dining", "Modern Indonesian", "Celebrated"] },
  { id: 38, sentence: "Wood-fire bistro overlooking Campuhan Ridge. The view from your table is worth the price alone.", tags: ["Wood-fire", "Campuhan Ridge", "Ridge Views"] },
  { id: 39, sentence: "Classic fine dining institution. The tasting menu here is a culinary journey.", tags: ["Fine Dining", "Tasting Menu", "Institution"] },
  { id: 40, sentence: "Upscale dining with impeccable service. Special occasion territory.", tags: ["Upscale", "Impeccable Service", "Special Occasion"] },
  { id: 41, sentence: "Locavore's experimental kitchen. Pushing boundaries of Indonesian cuisine.", tags: ["Experimental", "Modern Indonesian", "Boundary-pushing"] },
  { id: 42, sentence: "Incredible Japanese set menu at warung prices. How they do it at this quality is a mystery.", tags: ["Japanese Set Menu", "Great Value", "High Quality"] },
  { id: 43, sentence: "Beautiful cocktail bar with sophisticated vibes. The mixologists here are artists.", tags: ["Cocktails", "Sophisticated", "Mixology"] },
  { id: 44, sentence: "The only proper clubs in Ubud. Late night house music when you need to dance.", tags: ["Nightclub", "House Music", "Late Night"] },
  { id: 45, sentence: "Chill vegan cafe with soft live music most evenings. The spiritual crowd gathers here.", tags: ["Live Music", "Spiritual Crowd", "Vegan"] },
  { id: 46, sentence: "Canggu's best dancing club. Worth the scooter ride for a proper night out.", tags: ["Canggu", "Dancing", "Night Out"] },
  { id: 47, sentence: "Ubud's best cocktail bar for late nights. Craft cocktails that take ten minutes to make.", tags: ["Best Cocktails", "Late Night", "Craft Mixology"] },
  { id: 48, sentence: "Ancient sound healing in pyramid-shaped studios. The acoustics here are otherworldly.", tags: ["Sound Healing", "Pyramid Studio", "Otherworldly"] },
  { id: 49, sentence: "Ubud's most famous yoga studio. Ecstatic dance Fridays and Sundays. Classes for every level.", tags: ["Famous Yoga Barn", "Ecstatic Dance", "All Levels"] },
  { id: 50, sentence: "Intimate yoga studio in Penestanan with breathtaking views. Try breathwork with Nicole.", tags: ["Intimate Classes", "Penestanan", "Breathwork"] },
  { id: 51, sentence: "Small authentic yoga studio with valley views. The teachers here are genuinely spiritual.", tags: ["Authentic", "Valley Views", "Spiritual Teachers"] },
  { id: 52, sentence: "The go-to spot for traditional Balinese healing. Book ahead - she's always busy.", tags: ["Traditional Healing", "Balinese", "Book Ahead"] },
  { id: 53, sentence: "Acupuncture and traditional Chinese medicine. Dr. Yuli has decades of experience.", tags: ["Acupuncture", "TCM", "Experienced"] },
  { id: 54, sentence: "Shamanic healing sessions that feel transformative. Not for the faint of heart.", tags: ["Shamanic", "Transformative", "Intense"] },
  { id: 55, sentence: "Intuitive readings that somehow know things they shouldn't. Popular with spiritual seekers.", tags: ["Intuitive Reading", "Spiritual", "Popular"] },
  { id: 56, sentence: "Reiki healing sessions that leave you floating. The energy here is palpable.", tags: ["Reiki", "Energy Healing", "Floating Vibes"] },
  { id: 57, sentence: "Deep tissue massage that actually fixes problems. Therapeutic, not just relaxing.", tags: ["Deep Tissue", "Therapeutic", "Problem-solving"] },
  { id: 58, sentence: "Luxury spa with rice field views. The kind of place you spend the whole day.", tags: ["Luxury Spa", "Rice Field Views", "Day Spa"] },
  { id: 59, sentence: "Affordable massages that don't compromise on quality. Popular with long-term travelers.", tags: ["Affordable", "Quality", "Long-term Favorite"] },
  { id: 60, sentence: "Traditional Balinese massage with authentic techniques. The therapists here are masters.", tags: ["Traditional", "Authentic", "Master Therapists"] },
  { id: 61, sentence: "Riverside massage huts with sound of flowing water. Pure relaxation territory.", tags: ["Riverside", "Water Sounds", "Pure Relaxation"] },
  { id: 62, sentence: "Spa using organic local products. Everything here smells like Bali.", tags: ["Organic Products", "Local Ingredients", "Bali Scents"] },
  { id: 63, sentence: "Quick foot massages when you need relief now. No appointment needed.", tags: ["Quick", "Foot Massage", "Walk-in"] },
  { id: 64, sentence: "The famous ridge walk at sunrise. Touristy but absolutely worth it for the golden light.", tags: ["Famous", "Sunrise", "Golden Light"] },
  { id: 65, sentence: "Scenic walk through working rice fields. Watch farmers doing their daily work.", tags: ["Rice Fields", "Working Farms", "Scenic"] },
  { id: 66, sentence: "Peaceful river valley walk away from the crowds. The silence here is golden.", tags: ["River Valley", "Peaceful", "Away from Crowds"] },
  { id: 67, sentence: "Jungle trek to hidden waterfalls. Bring good shoes and a sense of adventure.", tags: ["Jungle Trek", "Waterfalls", "Adventure"] },
  { id: 68, sentence: "Easy village walk through traditional Balinese compounds. See how locals really live.", tags: ["Village Walk", "Traditional", "Local Life"] },
  { id: 69, sentence: "Sunset walk along quiet country lanes. The light here at golden hour is magical.", tags: ["Sunset Walk", "Golden Hour", "Quiet Lanes"] },
  { id: 70, sentence: "Art walk connecting local galleries and studios. Meet the artists in their workshops.", tags: ["Art Walk", "Galleries", "Meet Artists"] },
  { id: 71, sentence: "Active volcano sunrise trek. Worth the 3am wake-up for the views from the summit.", tags: ["Volcano Trek", "Sunrise", "Active Adventure"] },
  { id: 72, sentence: "Sacred water temple purification ceremony. A spiritual experience even for skeptics.", tags: ["Water Temple", "Purification", "Spiritual"] },
  { id: 73, sentence: "Iconic rice terraces with coconut palms. The most photographed spot in Bali for good reason.", tags: ["Iconic", "Rice Terraces", "Most Photographed"] },
  { id: 74, sentence: "Hidden canyon with turquoise water. Recently discovered and still relatively quiet.", tags: ["Hidden Canyon", "Turquoise Water", "Off the Beaten Path"] },
  { id: 75, sentence: "Ancient temple in lush jungle setting. The moss-covered stones feel prehistoric.", tags: ["Ancient Temple", "Jungle Setting", "Moss-covered"] },
  { id: 76, sentence: "Sacred monkey forest in town center. Hold onto your sunglasses and enjoy the chaos.", tags: ["Monkey Forest", "Sacred", "Chaos"] }
];

// Place metadata (from data.js)
const placesMeta = [
  { id: 1, name: "Milk and Madu", category: "breakfast", area: "Town Centre", lat: -8.5069, lng: 115.2625, maps: "https://maps.app.goo.gl/XLbYrgMYHb5o2zLL6" },
  { id: 2, name: "Alchemy Cafe", category: "breakfast", area: "Town Centre", lat: -8.5095, lng: 115.2595, maps: "https://maps.app.goo.gl/ebx3fxjLs3jBbBad9" },
  { id: 3, name: "Yellow Flower Cafe", category: "breakfast", area: "Penestanan", lat: -8.509, lng: 115.26 },
  { id: 4, name: "Clear Cafe", category: "breakfast", area: "Town Centre", lat: -8.5065, lng: 115.262 },
  { id: 5, name: "Cafe Curendera", category: "breakfast", area: "Jungle", lat: -8.52, lng: 115.28 },
  { id: 6, name: "Suka Express", category: "breakfast", area: "Town Centre", lat: -8.507, lng: 115.2628 },
  { id: 7, name: "Jungle Fish", category: "breakfast", area: "Jungle", lat: -8.5205, lng: 115.281 },
  { id: 8, name: "Tis Cafe", category: "breakfast", area: "Rice Terraces", lat: -8.43, lng: 115.28 },
  { id: 9, name: "Mudra Cafe", category: "breakfast", area: "Town Centre", lat: -8.506, lng: 115.2635 },
  { id: 10, name: "Pukako", category: "breakfast", area: "Rice Fields", lat: -8.515, lng: 115.265 },
  { id: 11, name: "Sage", category: "breakfast", area: "Town Centre", lat: -8.5075, lng: 115.2615 },
  { id: 12, name: "Roosters", category: "breakfast", area: "Out of Town", lat: -8.55, lng: 115.25 },
  { id: 13, name: "Huma Cafe", category: "breakfast", area: "Town Centre", lat: -8.508, lng: 115.262 },
  { id: 14, name: "Locavore Bakery", category: "breakfast", area: "Town Centre", lat: -8.5055, lng: 115.264 },
  { id: 15, name: "Rusters Bakery", category: "breakfast", area: "Town Centre", lat: -8.5062, lng: 115.2632 },
  { id: 16, name: "Sayan House / Sayan Valley", category: "dinner", area: "Sayan", lat: -8.52, lng: 115.25 },
  { id: 17, name: "Bambu Indah", category: "dinner", area: "Sayan", lat: -8.5205, lng: 115.249 },
  { id: 18, name: "Cantina Rooftop", category: "dinner", area: "Town Centre", lat: -8.507, lng: 115.264 },
  { id: 19, name: "Baracca", category: "dinner", area: "Town Centre", lat: -8.5065, lng: 115.2645 },
  { id: 20, name: "Kebun Bistro", category: "dinner", area: "Town Centre", lat: -8.5078, lng: 115.263 },
  { id: 21, name: "Persona Lounge", category: "dinner", area: "Town Centre", lat: -8.5062, lng: 115.265 },
  { id: 22, name: "Honey and Smoke", category: "dinner", area: "Town Centre", lat: -8.5085, lng: 115.262 },
  { id: 23, name: "Donna", category: "dinner", area: "Town Centre", lat: -8.5058, lng: 115.2655 },
  { id: 24, name: "Copper Kitchen", category: "dinner", area: "Town Centre", lat: -8.5072, lng: 115.2638 },
  { id: 25, name: "Batubara / Chupabrasca", category: "dinner", area: "Town Centre", lat: -8.506, lng: 115.266 },
  { id: 26, name: "Local Parts by Locavore", category: "dinner", area: "Town Centre", lat: -8.5055, lng: 115.2665 },
  { id: 27, name: "Copper", category: "dinner", area: "Town Centre", lat: -8.5072, lng: 115.2638 },
  { id: 28, name: "Plant Bistro", category: "vegetarian", area: "Town Centre", lat: -8.508, lng: 115.261 },
  { id: 29, name: "Moksha", category: "vegetarian", area: "Town Centre", lat: -8.507, lng: 115.262 },
  { id: 30, name: "Sage", category: "vegetarian", area: "Town Centre", lat: -8.5075, lng: 115.2615 },
  { id: 31, name: "Warung Biah Biah", category: "warung", area: "Town Centre", lat: -8.5068, lng: 115.264 },
  { id: 32, name: "Capella", category: "warung", area: "Town Centre", lat: -8.5075, lng: 115.265 },
  { id: 33, name: "Warung Shanti", category: "warung", area: "Rice Fields", lat: -8.516, lng: 115.266 },
  { id: 34, name: "Warung Sun Sun", category: "warung", area: "Town Centre", lat: -8.506, lng: 115.2655 },
  { id: 35, name: "Warung Siam + Warung Fair", category: "warung", area: "Town Centre", lat: -8.507, lng: 115.2645 },
  { id: 36, name: "Warung Be Pasih", category: "warung", area: "Town Centre", lat: -8.508, lng: 115.2635 },
  { id: 37, name: "Locavore", category: "fine dining", area: "Town Centre", lat: -8.5055, lng: 115.267 },
  { id: 38, name: "Nari", category: "fine dining", area: "Campuhan", lat: -8.505, lng: 115.255 },
  { id: 39, name: "Mozaic", category: "fine dining", area: "Town Centre", lat: -8.505, lng: 115.268 },
  { id: 40, name: "Aperitif", category: "fine dining", area: "Town Centre", lat: -8.5045, lng: 115.2685 },
  { id: 41, name: "Locovore NXT", category: "fine dining", area: "Town Centre", lat: -8.5055, lng: 115.2675 },
  { id: 42, name: "Capella", category: "fine dining", area: "Town Centre", lat: -8.5075, lng: 115.265 },
  { id: 43, name: "The Lair", category: "drinks", area: "Town Centre", lat: -8.507, lng: 115.266 },
  { id: 44, name: "Boliche / The Blue Door", category: "drinks", area: "Town Centre", lat: -8.508, lng: 115.265 },
  { id: 45, name: "Sayuri", category: "drinks", area: "Town Centre", lat: -8.5065, lng: 115.264 },
  { id: 46, name: "Little Green Door", category: "drinks", area: "Canggu", lat: -8.65, lng: 115.15 },
  { id: 47, name: "No Mas Bar", category: "drinks", area: "Town Centre", lat: -8.5075, lng: 115.2665 },
  { id: 48, name: "Pyramids of Chi", category: "yoga", area: "Out of Town", lat: -8.55, lng: 115.28 },
  { id: 49, name: "Yoga Barn", category: "yoga", area: "Town Centre", lat: -8.509, lng: 115.261 },
  { id: 50, name: "Alchemy Yoga", category: "yoga", area: "Penestanan", lat: -8.5095, lng: 115.2595 },
  { id: 51, name: "Intuitive Flow Yoga", category: "yoga", area: "Penestanan", lat: -8.51, lng: 115.259 },
  { id: 52, name: "Ubud Yoga House", category: "healers", area: "Town Centre", lat: -8.516, lng: 115.267 },
  { id: 53, name: "Ubud Yoga Centre", category: "healers", area: "Town Centre", lat: -8.508, lng: 115.26 },
  { id: 54, name: "Serendipity Sounds", category: "healers", area: "Town Centre", lat: -8.507, lng: 115.259 },
  { id: 55, name: "Pac Man", category: "healers", area: "Town Centre", lat: -8.5085, lng: 115.261 },
  { id: 56, name: "I Nyoman Sudana Papa Nyoman", category: "healers", area: "Town Centre", lat: -8.509, lng: 115.2605 },
  { id: 57, name: "The Wizard", category: "healers", area: "Town Centre", lat: -8.508, lng: 115.262 },
  { id: 58, name: "Jero Mangku Sofia", category: "healers", area: "Town Centre", lat: -8.5075, lng: 115.263 },
  { id: 59, name: "Qi - western medicine & TCM doctor", category: "healers", area: "Jungle", lat: -8.521, lng: 115.282 },
  { id: 60, name: "Dr Sujata", category: "healers", area: "Nyuh Kuning", lat: -8.525, lng: 115.265 },
  { id: 61, name: "Pau", category: "healers", area: "Town Centre", lat: -8.5082, lng: 115.2615 },
  { id: 62, name: "Putri Ubud 1 / Putri Ubud 3", category: "massage", area: "Town Centre", lat: -8.507, lng: 115.264 },
  { id: 63, name: "Tjampuan Spa", category: "massage", area: "Tjampuan", lat: -8.51, lng: 115.27 },
  { id: 64, name: "Cantika Zest", category: "massage", area: "Town Centre", lat: -8.5085, lng: 115.263 },
  { id: 65, name: "Jaens Spa / Karsa / Hesa", category: "massage", area: "Various", lat: -8.515, lng: 115.27 },
  { id: 66, name: "Titi Batu", category: "massage", area: "Town Centre", lat: -8.5095, lng: 115.262 },
  { id: 67, name: "Rendezvous Fitness", category: "massage", area: "North Ubud", lat: -8.48, lng: 115.26 },
  { id: 68, name: "Dragon Fly Village", category: "massage", area: "Sok Subak Wah", lat: -8.5085, lng: 115.2585 },
  { id: 69, name: "Sok Subak Wah Walk", category: "walks", area: "Sok Subak Wah", lat: -8.508, lng: 115.258 },
  { id: 70, name: "Sweet Orange trail walk", category: "walks", area: "Rice Fields", lat: -8.517, lng: 115.268 },
  { id: 71, name: "Hikaria", category: "walks", area: "Out of Town", lat: -8.56, lng: 115.25 },
  { id: 72, name: "Campuhan Ridge Walk", category: "walks", area: "Campuhan", lat: -8.505, lng: 115.255 },
  { id: 73, name: "Water Purification Ceremony", category: "excursions", area: "Various", lat: -8.53, lng: 115.32 },
  { id: 74, name: "Mount Batur", category: "excursions", area: "Mount Batur", lat: -8.24, lng: 115.38 },
  { id: 75, name: "Tegallang Rice Terraces", category: "excursions", area: "Tegallang", lat: -8.43, lng: 115.28 },
  { id: 76, name: "Goa Gajah / Gunung Kawi / Gunung Kawi Sebatu / Tirta Empul / Monkey Forest", category: "excursions", area: "Various", lat: -8.51, lng: 115.26 }
];

async function importDirect() {
  console.log('🔌 Connecting to PostgreSQL...');
  const pool = new Pool({
    connectionString: DATABASE_URL,
    ssl: { rejectUnauthorized: false }
  });
  
  try {
    await pool.query('SELECT NOW()');
    console.log('✅ Connected\n');
    
    // Create tables
    console.log('📋 Creating tables...');
    await pool.query(`
      CREATE TABLE IF NOT EXISTS places (
        id INTEGER PRIMARY KEY,
        name TEXT NOT NULL,
        category TEXT NOT NULL,
        description TEXT,
        area TEXT,
        maps TEXT,
        lat NUMERIC,
        lng NUMERIC,
        rating NUMERIC,
        address TEXT,
        phone TEXT,
        website TEXT,
        hours TEXT,
        google_place_id TEXT,
        vibes JSONB DEFAULT '[]'::jsonb,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);
    
    await pool.query(`
      CREATE TABLE IF NOT EXISTS reviews (
        id SERIAL PRIMARY KEY,
        place_id INTEGER REFERENCES places(id) ON DELETE CASCADE,
        text TEXT,
        rating INTEGER,
        author TEXT,
        time BIGINT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);
    
    await pool.query(`
      CREATE TABLE IF NOT EXISTS photos (
        id SERIAL PRIMARY KEY,
        place_id INTEGER REFERENCES places(id) ON DELETE CASCADE,
        url TEXT,
        html_attributions JSONB DEFAULT '[]'::jsonb,
        reference TEXT,
        width INTEGER,
        height INTEGER
      )
    `);
    
    await pool.query(`
      CREATE TABLE IF NOT EXISTS why_this_place (
        place_id INTEGER PRIMARY KEY REFERENCES places(id) ON DELETE CASCADE,
        sentence TEXT,
        tags JSONB DEFAULT '[]'::jsonb,
        last_generated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);
    console.log('✅ Tables ready\n');
    
    // Insert places
    console.log('📤 Importing 76 places...');
    for (const meta of placesMeta) {
      const desc = descriptions.find(d => d.id === meta.id);
      
      await pool.query(`
        INSERT INTO places (id, name, category, description, area, maps, lat, lng, vibes, created_at)
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, CURRENT_TIMESTAMP)
        ON CONFLICT (id) DO UPDATE SET
          name = EXCLUDED.name,
          category = EXCLUDED.category,
          description = EXCLUDED.description,
          area = EXCLUDED.area,
          maps = EXCLUDED.maps,
          lat = EXCLUDED.lat,
          lng = EXCLUDED.lng
      `, [
        meta.id, meta.name, meta.category, 
        desc ? desc.sentence : `${meta.name} in ${meta.area}`,
        meta.area, meta.maps || `https://www.google.com/maps/search/?api=1&query=${meta.lat},${meta.lng}`,
        meta.lat, meta.lng,
        JSON.stringify([])
      ]);
      
      // Insert Why This Place
      if (desc) {
        await pool.query(`
          INSERT INTO why_this_place (place_id, sentence, tags, last_generated_at)
          VALUES ($1, $2, $3, CURRENT_TIMESTAMP)
          ON CONFLICT (place_id) DO UPDATE SET
            sentence = EXCLUDED.sentence,
            tags = EXCLUDED.tags,
            last_generated_at = EXCLUDED.last_generated_at
        `, [meta.id, desc.sentence, JSON.stringify(desc.tags)]);
      }
    }
    console.log('✅ Places imported\n');
    
    // Verify
    const count = await pool.query('SELECT COUNT(*) FROM places');
    const whyCount = await pool.query('SELECT COUNT(*) FROM why_this_place');
    console.log('📊 Verification:');
    console.log(`   Places: ${count.rows[0].count}`);
    console.log(`   Why This Place: ${whyCount.rows[0].count}\n`);
    
    await pool.end();
    console.log('✅ Import complete!');
    console.log('\n🚀 NEXT STEP: Add DATABASE_URL to Railway environment variables:');
    console.log('   Key: DATABASE_URL');
    console.log('   Value: postgresql://postgres:XZtCObtaOWfmkXhNtOOAvcASQeVhkpxu@centerbeam.proxy.rlwy.net:46202/railway');
    console.log('\nThen deploy and your data will be persistent!');
    
  } catch (err) {
    console.error('❌ Error:', err.message);
    await pool.end();
    process.exit(1);
  }
}

importDirect();
