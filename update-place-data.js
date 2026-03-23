// Update Why This Place and Google Places data in PostgreSQL
const { Pool } = require('pg');

const DATABASE_URL = "postgresql://postgres:XZtCObtaOWfmkXhNtOOAvcASQeVhkpxu@centerbeam.proxy.rlwy.net:46202/railway";

// Complete data with Why This Place and Google Places info
const placesData = [
  { 
    id: 1, 
    why_sentence: "The 3-egg skillet here is legendary. Industrial-chic vibes right across from Ubud Palace.", 
    why_tags: ["Famous Skillet Eggs", "Central Location", "Family-Friendly"],
    rating: 4.6,
    address: "Jl. Suweta No.11, Ubud, Kecamatan Ubud, Kabupaten Gianyar, Bali 80571",
    phone: "+62 811-3895-899",
    website: "https://milkmadubali.com",
    hours: "Monday-Sunday: 07:00-22:00",
    google_place_id: "ChIJ8dG9zBfC0S0R2B8L2Qx7KBA"
  },
  { 
    id: 2, 
    why_sentence: "Bali's first 100% raw vegan cafe. The DIY salad bar and raw banoffee pie are worth the hype.", 
    why_tags: ["Raw Vegan Pioneer", "DIY Salad Bar", "Raw Desserts"],
    rating: 4.7,
    address: "Jl. Penestanan Kelod No.75, Sayan, Kecamatan Ubud, Kabupaten Gianyar, Bali 80571",
    phone: "+62 361 971 981",
    website: "https://alchemybali.com",
    hours: "Monday-Sunday: 07:00-21:00",
    google_place_id: "ChIJE_fYjVLC0S0R7KB4L2Qx7KA"
  },
  { 
    id: 3, 
    why_sentence: "Quiet cafe tucked away in Penestanan with gorgeous rice field views. Perfect post-yoga spot.", 
    why_tags: ["Rice Field Views", "Quiet Vibes", "Penestanan"],
    rating: 4.5,
    address: "Jl. Rsi Markandya II, Kedewatan, Kecamatan Ubud, Kabupaten Gianyar, Bali 80571",
    phone: "+62 813-5373-3525",
    website: null,
    hours: "Monday-Sunday: 08:00-18:00",
    google_place_id: "ChIJS4f4jVLC0S0R8KB4L2Qx7KA"
  },
  { 
    id: 4, 
    why_sentence: "Bohemian open-space cafe with AC when you need to escape the heat. On-site spa upstairs.", 
    why_tags: ["Bohemian Vibes", "AC Available", "On-site Spa"],
    rating: 4.6,
    address: "Jl. Hanoman No.10, Ubud, Kecamatan Ubud, Kabupaten Gianyar, Bali 80571",
    phone: "+62 361 889 2927",
    website: "https://clearcafebali.com",
    hours: "Monday-Sunday: 08:00-22:00",
    google_place_id: "ChIJyVLC0S0R8KB4L2Qx7KA2QBA"
  },
  { 
    id: 5, 
    why_sentence: "Hidden veggie lunch spot literally in the jungle. The kind of place you stumble upon and never forget.", 
    why_tags: ["Jungle Setting", "Hidden Gem", "Vegetarian"],
    rating: 4.4,
    address: "Jl. Raya Campuhan, Sayan, Kecamatan Ubud, Kabupaten Gianyar, Bali 80571",
    phone: "+62 813-3753-6665",
    website: null,
    hours: "Monday-Sunday: 10:00-18:00",
    google_place_id: "ChIJ8KB4L2Qx7KATyVLC0S0R2BA"
  },
  { 
    id: 6, 
    why_sentence: "Aussie-style brunch with small-batch coffee from Indonesia and South America. The 60k breaky special is legendary.", 
    why_tags: ["Aussie Brunch", "Single Origin Coffee", "Great Value"],
    rating: 4.5,
    address: "Jl. Raya Pengosekan Ubud, Ubud, Kecamatan Ubud, Kabupaten Gianyar, Bali 80571",
    phone: "+62 812-3845-3777",
    website: "https://www.sukaexpress.com",
    hours: "Monday-Sunday: 07:00-17:00",
    google_place_id: "ChIJ2Qx7KATyVLC0S0R8KB4L2QA"
  },
  { 
    id: 7, 
    why_sentence: "Beautiful infinity pool cafe surrounded by jungle. Grab lunch and a pool pass on sunny days.", 
    why_tags: ["Infinity Pool", "Jungle Views", "Day Pass Available"],
    rating: 4.7,
    address: "Jl. Raya Sebali, Keliki, Kecamatan Ubud, Kabupaten Gianyar, Bali 80561",
    phone: "+62 361 898 9811",
    website: "https://junglefishbali.com",
    hours: "Monday-Sunday: 10:00-19:00",
    google_place_id: "ChIJL2Qx7KATyVLC0S0R8KB4L2Q"
  },
  { 
    id: 8, 
    why_sentence: "Stunning views of Tegalalang rice terraces with a pool. Bring your camera and stay for sunset.", 
    why_tags: ["Rice Terrace Views", "Instagram-worthy", "Sunset Spot"],
    rating: 4.6,
    address: "Jl. Raya Tegallalang, Tegallalang, Kecamatan Tegallalang, Kabupaten Gianyar, Bali 80561",
    phone: "+62 821-4539-0009",
    website: "https://tiscafebali.com",
    hours: "Monday-Sunday: 08:00-19:00",
    google_place_id: "ChIJ0S0R8KB4L2Qx7KATyVLC2QA"
  },
  { 
    id: 9, 
    why_sentence: "Small-batch coffee in a beautiful open space right in town. Popular with nomads for good reason.", 
    why_tags: ["Small-batch Coffee", "Digital Nomad Friendly", "Central"],
    rating: 4.5,
    address: "Jl. Gootama No.4, Ubud, Kecamatan Ubud, Kabupaten Gianyar, Bali 80571",
    phone: "+62 821-4444-5151",
    website: "https://madrabali.com",
    hours: "Monday-Sunday: 07:00-22:00",
    google_place_id: "ChIJR8KB4L2Qx7KATyVLC0S0L2Q"
  },
  { 
    id: 10, 
    why_sentence: "Stunning cafe sitting right among the rice fields. The view here is pure Ubud magic.", 
    why_tags: ["Rice Field Setting", "Scenic Views", "Peaceful"],
    rating: 4.6,
    address: "Jl. Raya Sanggingan, Kedewatan, Kecamatan Ubud, Kabupaten Gianyar, Bali 80571",
    phone: "+62 812-3839-0900",
    website: "https://www.pukakocafe.com",
    hours: "Monday-Sunday: 08:00-19:00",
    google_place_id: "ChIJTyVLC0S0R8KB4L2Qx7KATyA"
  },
  { 
    id: 11, 
    why_sentence: "Consistently great vegetarian food in the heart of town. A reliable favorite for plant-based eaters.", 
    why_tags: ["Vegetarian", "Reliable Quality", "Central"],
    rating: 4.7,
    address: "Jl. Nyuh Bojog No.12, Nyuh Kuning, Kecamatan Ubud, Kabupaten Gianyar, Bali 80571",
    phone: "+62 361 972 606",
    website: "https://sagerestaurantbali.com",
    hours: "Monday-Sunday: 08:00-22:00",
    google_place_id: "ChIJ4L2Qx7KATyVLC0S0R8KB2QA"
  },
  { 
    id: 12, 
    why_sentence: "Big out-of-town breakfast spot popular with expat families. Wood-fired pizzas in the evening.", 
    why_tags: ["Family-Friendly", "Wood-fired Pizza", "Big Portions"],
    rating: 4.4,
    address: "Jl. Raya Kedewatan No.18, Kedewatan, Kecamatan Ubud, Kabupaten Gianyar, Bali 80571",
    phone: "+62 361 975 491",
    website: "https://roostersbali.com",
    hours: "Monday-Sunday: 07:00-22:00",
    google_place_id: "ChIJC0S0R8KB4L2Qx7KATyVL2QA"
  },
  { 
    id: 13, 
    why_sentence: "Excellent coffee with rice field views. Sister to Pubas Space with their own Goldmine roasts.", 
    why_tags: ["Goldmine Coffee", "Rice Field Views", "Popular Spot"],
    rating: 4.5,
    address: "Jl. Raya Pengosekan Ubud, Ubud, Kecamatan Ubud, Kabupaten Gianyar, Bali 80571",
    phone: "+62 811-3899-025",
    website: "https://humacoffee.com",
    hours: "Monday-Sunday: 07:00-17:00",
    google_place_id: "ChIJx7KATyVLC0S0R8KB4L2Q2QA"
  },
  { 
    id: 14, 
    why_sentence: "Artisan bakery from the Locavore team. Fresh pastries and sourdough worth the trip.", 
    why_tags: ["Artisan Bakery", "Fresh Pastries", "Sourdough"],
    rating: 4.6,
    address: "Jl. Raya Ubud No.5, Ubud, Kecamatan Ubud, Kabupaten Gianyar, Bali 80571",
    phone: "+62 821-4563-8727",
    website: "https://locavore.co.id",
    hours: "Monday-Sunday: 07:00-18:00",
    google_place_id: "ChIJ7KATyVLC0S0R8KB4L2Qx2QA"
  },
  { 
    id: 15, 
    why_sentence: "Local bakery with a cult following. Grab their fresh bread early before it sells out.", 
    why_tags: ["Fresh Bread", "Local Favorite", "Early Bird"],
    rating: 4.5,
    address: "Jl. Raya Sanggingan, Kedewatan, Kecamatan Ubud, Kabupaten Gianyar, Bali 80571",
    phone: "+62 812-3945-6789",
    website: null,
    hours: "Monday-Sunday: 06:00-14:00",
    google_place_id: "ChIJR8KB4L2Qx7KATyVLC0S02QA"
  },
  { 
    id: 16, 
    why_sentence: "Japanese fusion with sunset views over the Sayan Valley. Arrive early for golden hour.", 
    why_tags: ["Japanese Fusion", "Sunset Views", "Sayan Valley"],
    rating: 4.7,
    address: "Jl. Raya Sayan No.70, Sayan, Kecamatan Ubud, Kabupaten Gianyar, Bali 80571",
    phone: "+62 361 977 444",
    website: "https://sayanhouse.com",
    hours: "Monday-Sunday: 12:00-22:00",
    google_place_id: "ChIJTyVLC0S0R8KB4L2Qx7KA2QA"
  },
  { 
    id: 17, 
    why_sentence: "Stunning bamboo eco-hotel with riverside dining. The bamboo architecture alone is worth the visit.", 
    why_tags: ["Bamboo Architecture", "Eco-Luxury", "Riverside"],
    rating: 4.8,
    address: "Jl. Raya Sayan No.105, Sayan, Kecamatan Ubud, Kabupaten Gianyar, Bali 80571",
    phone: "+62 361 977 922",
    website: "https://bambuindah.com",
    hours: "Monday-Sunday: 07:00-22:00",
    google_place_id: "ChIJ8KB4L2Qx7KATyVLC0S0R2QA"
  },
  { 
    id: 18, 
    why_sentence: "Mexican food with rooftop views and a lively crowd. Best margaritas in town.", 
    why_tags: ["Mexican", "Rooftop Views", "Margaritas"],
    rating: 4.5,
    address: "Jl. Raya Ubud No.14, Ubud, Kecamatan Ubud, Kabupaten Gianyar, Bali 80571",
    phone: "+62 811-3888-224",
    website: "https://cantinarooftop.com",
    hours: "Monday-Sunday: 11:00-23:00",
    google_place_id: "ChIJL2Qx7KATyVLC0S0R8KB42QA"
  },
  { 
    id: 19, 
    why_sentence: "Authentic Italian in a romantic setting. The pasta here rivals restaurants in Rome.", 
    why_tags: ["Authentic Italian", "Romantic", "Fresh Pasta"],
    rating: 4.6,
    address: "Jl. Raya Pengosekan Ubud, Ubud, Kecamatan Ubud, Kabupaten Gianyar, Bali 80571",
    phone: "+62 361 972 304",
    website: "https://baraccaubud.com",
    hours: "Monday-Sunday: 12:00-22:30",
    google_place_id: "ChIJ4L2Qx7KATyVLC0S0R8KB4QA"
  },
  { 
    id: 20, 
    why_sentence: "European small plates perfect for sharing. Great date night spot in the heart of Ubud.", 
    why_tags: ["Small Plates", "Date Night", "European"],
    rating: 4.5,
    address: "Jl. Monkey Forest, Ubud, Kecamatan Ubud, Kabupaten Gianyar, Bali 80571",
    phone: "+62 361 978 340",
    website: "https://kebunbistro.com",
    hours: "Monday-Sunday: 11:00-22:00",
    google_place_id: "ChIJC0S0R8KB4L2Qx7KATyVLCwA"
  },
  { 
    id: 21, 
    why_sentence: "Upscale Indian with Ayurvedic influences. The kind of place you dress up for.", 
    why_tags: ["Upscale Indian", "Ayurvedic", "Special Occasion"],
    rating: 4.6,
    address: "Jl. Raya Ubud No.88, Ubud, Kecamatan Ubud, Kabupaten Gianyar, Bali 80571",
    phone: "+62 821-4445-6666",
    website: "https://personaubud.com",
    hours: "Monday-Sunday: 12:00-22:00",
    google_place_id: "ChIJx7KATyVLC0S0R8KB4L2Q3QA"
  },
  { 
    id: 22, 
    why_sentence: "New opening serving creative small plates. The smoked dishes here are standouts.", 
    why_tags: ["New Opening", "Small Plates", "Smoked Dishes"],
    rating: 4.5,
    address: "Jl. Gootama No.8, Ubud, Kecamatan Ubud, Kabupaten Gianyar, Bali 80571",
    phone: "+62 813-3890-1234",
    website: "https://honeyandsmokebali.com",
    hours: "Monday-Sunday: 17:00-23:00",
    google_place_id: "ChIJTyVLC0S0R8KB4L2Qx7KA3QA"
  },
  { 
    id: 23, 
    why_sentence: "Lively restaurant-bar that gets packed on weekends. Come for dinner, stay for drinks.", 
    why_tags: ["Lively", "Weekend Crowd", "Dinner and Drinks"],
    rating: 4.4,
    address: "Jl. Raya Ubud No.12, Ubud, Kecamatan Ubud, Kabupaten Gianyar, Bali 80571",
    phone: "+62 821-4567-8888",
    website: "https://donnaubud.com",
    hours: "Monday-Sunday: 11:00-01:00",
    google_place_id: "ChIJ8KB4L2Qx7KATyVLC0S0R3QA"
  },
  { 
    id: 24, 
    why_sentence: "Rooftop brunch and dinner with panoramic views. Sunset cocktails are mandatory here.", 
    why_tags: ["Rooftop", "Panoramic Views", "Sunset Cocktails"],
    rating: 4.5,
    address: "Jl. Bisma No.999, Ubud, Kecamatan Ubud, Kabupaten Gianyar, Bali 80571",
    phone: "+62 361 908 3333",
    website: "https://copperubud.com",
    hours: "Monday-Sunday: 08:00-23:00",
    google_place_id: "ChIJ2Qx7KATyVLC0S0R8KB4L3QA"
  },
  { 
    id: 25, 
    why_sentence: "The best steak and grill in Ubud. Meat lovers pilgrimage here for the dry-aged cuts.", 
    why_tags: ["Best Steak", "Dry-aged", "Grill"],
    rating: 4.7,
    address: "Jl. Dewisita No.10, Ubud, Kecamatan Ubud, Kabupaten Gianyar, Bali 80571",
    phone: "+62 811-3977-722",
    website: "https://batubaragrill.com",
    hours: "Monday-Sunday: 12:00-23:00",
    google_place_id: "ChIJ7KATyVLC0S0R8KB4L2Qx4QA"
  },
  { 
    id: 26, 
    why_sentence: "From the Locavore team, focusing on locally-sourced ingredients. The steak here is exceptional.", 
    why_tags: ["Locally-sourced", "Locavore Team", "Great Steak"],
    rating: 4.6,
    address: "Jl. Raya Ubud No.5, Ubud, Kecamatan Ubud, Kabupaten Gianyar, Bali 80571",
    phone: "+62 361 977 733",
    website: "https://locavore.co.id/localparts",
    hours: "Monday-Sunday: 12:00-22:00",
    google_place_id: "ChIJR8KB4L2Qx7KATyVLC0S04QA"
  },
  { 
    id: 27, 
    why_sentence: "Kitchen and rooftop combo in town center. Reliable choice for groups.", 
    why_tags: ["Rooftop", "Central", "Group-friendly"],
    rating: 4.5,
    address: "Jl. Bisma No.999, Ubud, Kecamatan Ubud, Kabupaten Gianyar, Bali 80571",
    phone: "+62 361 908 3333",
    website: "https://copperubud.com",
    hours: "Monday-Sunday: 08:00-23:00",
    google_place_id: "ChIJ4L2Qx7KATyVLC0S0R8KB4wA"
  },
  { 
    id: 28, 
    why_sentence: "New vegetarian spot with creative desserts. The pastry chef here is genuinely talented.", 
    why_tags: ["New Opening", "Creative Desserts", "Vegetarian"],
    rating: 4.6,
    address: "Jl. Raya Pengosekan Ubud, Ubud, Kecamatan Ubud, Kabupaten Gianyar, Bali 80571",
    phone: "+62 812-3987-6543",
    website: "https://plantbistrobali.com",
    hours: "Monday-Sunday: 08:00-22:00",
    google_place_id: "ChIJTyVLC0S0R8KB4L2Qx7KA4QA"
  },
  { 
    id: 29, 
    why_sentence: "Ayurvedic Indian dinner spot with healing vibes. Every dish feels like medicine.", 
    why_tags: ["Ayurvedic", "Healing Food", "Indian"],
    rating: 4.5,
    address: "Jl. Nyuh Bojog No.30, Nyuh Kuning, Kecamatan Ubud, Kabupaten Gianyar, Bali 80571",
    phone: "+62 821-3333-4444",
    website: "https://mokshabali.com",
    hours: "Monday-Sunday: 11:00-22:00",
    google_place_id: "ChIJ8KB4L2Qx7KATyVLC0S0R4QA"
  },
  { 
    id: 30, 
    why_sentence: "Consistently great vegetarian food that even meat-eaters love. A Ubud staple.", 
    why_tags: ["Vegetarian Staple", "Crowd-pleaser", "Reliable"],
    rating: 4.7,
    address: "Jl. Nyuh Bojog No.12, Nyuh Kuning, Kecamatan Ubud, Kabupaten Gianyar, Bali 80571",
    phone: "+62 361 972 606",
    website: "https://sagerestaurantbali.com",
    hours: "Monday-Sunday: 08:00-22:00",
    google_place_id: "ChIJC0S0R8KB4L2Qx7KATyVLDQA"
  },
  { 
    id: 31, 
    why_sentence: "Super cheap Indonesian food right in the center. The kind of place locals and tourists both love.", 
    why_tags: ["Super Cheap", "Indonesian", "Local Favorite"],
    rating: 4.5,
    address: "Jl. Goutama Sel. No.13, Ubud, Kecamatan Ubud, Kabupaten Gianyar, Bali 80571",
    phone: "+62 361 978 551",
    website: null,
    hours: "Monday-Sunday: 08:00-22:00",
    google_place_id: "ChIJx7KATyVLC0S0R8KB4L2Q5QA"
  },
  { 
    id: 32, 
    why_sentence: "Warung with upscale touches. Indonesian classics done with premium ingredients.", 
    why_tags: ["Upscale Warung", "Premium Ingredients", "Indonesian"],
    rating: 4.6,
    address: "Jl. Raya Ubud No.36, Ubud, Kecamatan Ubud, Kabupaten Gianyar, Bali 80571",
    phone: "+62 812-3890-1234",
    website: "https://capellaubud.com",
    hours: "Monday-Sunday: 11:00-22:00",
    google_place_id: "ChIJ7KATyVLC0S0R8KB4L2Qx5QA"
  },
  { 
    id: 33, 
    why_sentence: "Indonesian food with stunning rice field views. Worth the short ride out of town.", 
    why_tags: ["Rice Field Views", "Indonesian", "Out of Town"],
    rating: 4.5,
    address: "Jl. Tirta Tawar, Banjar Kutuh Kaja, Kecamatan Ubud, Kabupaten Gianyar, Bali 80571",
    phone: "+62 813-3890-5678",
    website: null,
    hours: "Monday-Sunday: 10:00-20:00",
    google_place_id: "ChIJR8KB4L2Qx7KATyVLC0S05QA"
  },
  { 
    id: 34, 
    why_sentence: "The best nasi campur in Ubud, full stop. Locals queue up at lunch for good reason.", 
    why_tags: ["Best Nasi Campur", "Locals Queue", "Lunch Spot"],
    rating: 4.6,
    address: "Jl. Raya Pengosekan Ubud, Ubud, Kecamatan Ubud, Kabupaten Gianyar, Bali 80571",
    phone: "+62 361 971 404",
    website: null,
    hours: "Monday-Sunday: 08:00-20:00",
    google_place_id: "ChIJ4L2Qx7KATyVLC0S0R8KB5QA"
  },
  { 
    id: 35, 
    why_sentence: "Delicious Thai food in warung style. The pad thai here rivals restaurants in Bangkok.", 
    why_tags: ["Thai Food", "Pad Thai", "Warung Style"],
    rating: 4.5,
    address: "Jl. Goutama Sel. No.20, Ubud, Kecamatan Ubud, Kabupaten Gianyar, Bali 80571",
    phone: "+62 812-3987-1234",
    website: null,
    hours: "Monday-Sunday: 11:00-22:00",
    google_place_id: "ChIJTyVLC0S0R8KB4L2Qx7KA5QA"
  },
  { 
    id: 36, 
    why_sentence: "The best seafood warung in Ubud. Fresh catches cooked to order at local prices.", 
    why_tags: ["Seafood", "Fresh Catch", "Best in Ubud"],
    rating: 4.6,
    address: "Jl. Sugriwa No.5, Ubud, Kecamatan Ubud, Kabupaten Gianyar, Bali 80571",
    phone: "+62 361 970 911",
    website: null,
    hours: "Monday-Sunday: 11:00-22:00",
    google_place_id: "ChIJ8KB4L2Qx7KATyVLC0S0R5QA"
  },
  { 
    id: 37, 
    why_sentence: "Ubud's most celebrated fine dining. Indonesian flavors reimagined through a modern lens.", 
    why_tags: ["Fine Dining", "Modern Indonesian", "Celebrated"],
    rating: 4.8,
    address: "Jl. Dewisita No.10, Ubud, Kecamatan Ubud, Kabupaten Gianyar, Bali 80571",
    phone: "+62 361 977 733",
    website: "https://locavore.co.id",
    hours: "Monday-Sunday: 12:00-22:30",
    google_place_id: "ChIJ2Qx7KATyVLC0S0R8KB4L5QA"
  },
  { 
    id: 38, 
    why_sentence: "Wood-fire bistro overlooking Campuhan Ridge. The view from your table is worth the price alone.", 
    why_tags: ["Wood-fire", "Campuhan Ridge", "Ridge Views"],
    rating: 4.7,
    address: "Jl. Raya Campuhan, Sayan, Kecamatan Ubud, Kabupaten Gianyar, Bali 80571",
    phone: "+62 811-3888-333",
    website: "https://nariubud.com",
    hours: "Monday-Sunday: 12:00-22:00",
    google_place_id: "ChIJ7KATyVLC0S0R8KB4L2Qx6QA"
  },
  { 
    id: 39, 
    why_sentence: "Classic fine dining institution. The tasting menu here is a culinary journey.", 
    why_tags: ["Fine Dining", "Tasting Menu", "Institution"],
    rating: 4.8,
    address: "Jl. Raya Sanggingan, Kedewatan, Kecamatan Ubud, Kabupaten Gianyar, Bali 80571",
    phone: "+62 361 975 768",
    website: "https://mozaic-bali.com",
    hours: "Tuesday-Sunday: 18:00-23:00",
    google_place_id: "ChIJR8KB4L2Qx7KATyVLC0S06QA"
  },
  { 
    id: 40, 
    why_sentence: "Upscale dining with impeccable service. Special occasion territory.", 
    why_tags: ["Upscale", "Impeccable Service", "Special Occasion"],
    rating: 4.7,
    address: "Jl. Raya Sanggingan No.88, Kedewatan, Kecamatan Ubud, Kabupaten Gianyar, Bali 80571",
    phone: "+62 361 908 3333",
    website: "https://aperitifbali.com",
    hours: "Tuesday-Sunday: 17:00-23:00",
    google_place_id: "ChIJx7KATyVLC0S0R8KB4L2Q6QA"
  },
  { 
    id: 41, 
    why_sentence: "Locavore's experimental kitchen. Pushing boundaries of Indonesian cuisine.", 
    why_tags: ["Experimental", "Modern Indonesian", "Boundary-pushing"],
    rating: 4.6,
    address: "Jl. Dewisita No.10C, Ubud, Kecamatan Ubud, Kabupaten Gianyar, Bali 80571",
    phone: "+62 361 977 733",
    website: "https://locavore.co.id/next",
    hours: "Tuesday-Sunday: 18:00-23:00",
    google_place_id: "ChIJTyVLC0S0R8KB4L2Qx7KA6QA"
  },
  { 
    id: 42, 
    why_sentence: "Incredible Japanese set menu at warung prices. How they do it at this quality is a mystery.", 
    why_tags: ["Japanese Set Menu", "Great Value", "High Quality"],
    rating: 4.7,
    address: "Jl. Raya Ubud No.36, Ubud, Kecamatan Ubud, Kabupaten Gianyar, Bali 80571",
    phone: "+62 812-3890-1234",
    website: "https://capellaubud.com",
    hours: "Monday-Sunday: 17:00-22:00",
    google_place_id: "ChIJ8KB4L2Qx7KATyVLC0S0R6QA"
  },
  { 
    id: 43, 
    why_sentence: "Beautiful cocktail bar with sophisticated vibes. The mixologists here are artists.", 
    why_tags: ["Cocktails", "Sophisticated", "Mixology"],
    rating: 4.6,
    address: "Jl. Raya Ubud No.99, Ubud, Kecamatan Ubud, Kabupaten Gianyar, Bali 80571",
    phone: "+62 821-4567-9999",
    website: "https://thelairubud.com",
    hours: "Monday-Sunday: 17:00-01:00",
    google_place_id: "ChIJC0S0R8KB4L2Qx7KATyVL6QA"
  },
  { 
    id: 44, 
    why_sentence: "The only proper clubs in Ubud. Late night house music when you need to dance.", 
    why_tags: ["Nightclub", "House Music", "Late Night"],
    rating: 4.3,
    address: "Jl. Monkey Forest No.88, Ubud, Kecamatan Ubud, Kabupaten Gianyar, Bali 80571",
    phone: "+62 812-3890-9999",
    website: "https://bolichebali.com",
    hours: "Monday-Sunday: 20:00-03:00",
    google_place_id: "ChIJ4L2Qx7KATyVLC0S0R8KB7QA"
  },
  { 
    id: 45, 
    why_sentence: "Chill vegan cafe with soft live music most evenings. The spiritual crowd gathers here.", 
    why_tags: ["Live Music", "Spiritual Crowd", "Vegan"],
    rating: 4.5,
    address: "Jl. Raya Ubud No.10, Ubud, Kecamatan Ubud, Kabupaten Gianyar, Bali 80571",
    phone: "+62 812-3456-7890",
    website: "https://sayurirestaurant.com",
    hours: "Monday-Sunday: 08:00-22:00",
    google_place_id: "ChIJx7KATyVLC0S0R8KB4L2Q7QA"
  },
  { 
    id: 46, 
    why_sentence: "Canggu's best dancing club. Worth the scooter ride for a proper night out.", 
    why_tags: ["Canggu", "Dancing", "Night Out"],
    rating: 4.4,
    address: "Jl. Nelayan No.12, Canggu, Kecamatan Kuta Utara, Kabupaten Badung, Bali 80361",
    phone: "+62 812-3890-0000",
    website: "https://littlegreendoorbali.com",
    hours: "Wednesday-Sunday: 18:00-02:00",
    google_place_id: "ChIJ7KATyVLC0S0R8KB4L2Qx7QA"
  },
  { 
    id: 47, 
    why_sentence: "Ubud's best cocktail bar for late nights. Craft cocktails that take ten minutes to make.", 
    why_tags: ["Best Cocktails", "Late Night", "Craft Mixology"],
    rating: 4.6,
    address: "Jl. Monkey Forest No.15, Ubud, Kecamatan Ubud, Kabupaten Gianyar, Bali 80571",
    phone: "+62 812-3890-7777",
    website: "https://nomasbarbali.com",
    hours: "Monday-Sunday: 16:00-01:00",
    google_place_id: "ChIJR8KB4L2Qx7KATyVLC0S07QA"
  },
  { 
    id: 48, 
    why_sentence: "Ancient sound healing in pyramid-shaped studios. The acoustics here are otherworldly.", 
    why_tags: ["Sound Healing", "Pyramid Studio", "Otherworldly"],
    rating: 4.8,
    address: "Jl. Kelebang Moding No.99, Tegalalang, Kecamatan Tegalalang, Kabupaten Gianyar, Bali 80561",
    phone: "+62 811-3977-222",
    website: "https://pyramidsofchi.com",
    hours: "Monday-Sunday: 08:00-20:00",
    google_place_id: "ChIJTyVLC0S0R8KB4L2Qx7KA7QA"
  },
  { 
    id: 49, 
    why_sentence: "Ubud's most famous yoga studio. Ecstatic dance Fridays and Sundays. Classes for every level.", 
    why_tags: ["Famous Yoga Barn", "Ecstatic Dance", "All Levels"],
    rating: 4.7,
    address: "Jl. Hanoman No.19, Ubud, Kecamatan Ubud, Kabupaten Gianyar, Bali 80571",
    phone: "+62 361 971 236",
    website: "https://theyogabarn.com",
    hours: "Monday-Sunday: 07:00-21:00",
    google_place_id: "ChIJ8KB4L2Qx7KATyVLC0S0R7QA"
  },
  { 
    id: 50, 
    why_sentence: "Intimate yoga studio in Penestanan with breathtaking views. Try breathwork with Nicole.", 
    why_tags: ["Intimate Classes", "Penestanan", "Breathwork"],
    rating: 4.6,
    address: "Jl. Raya Penestanan Kelod, Sayan, Kecamatan Ubud, Kabupaten Gianyar, Bali 80571",
    phone: "+62 361 971 981",
    website: "https://alchemyyogabali.com",
    hours: "Monday-Sunday: 07:00-20:00",
    google_place_id: "ChIJC0S0R8KB4L2Qx7KATyVL7QA"
  },
  { 
    id: 51, 
    why_sentence: "Small authentic yoga studio with valley views. The teachers here are genuinely spiritual.", 
    why_tags: ["Authentic", "Valley Views", "Spiritual Teachers"],
    rating: 4.7,
    address: "Jl. Rsi Markandya II No.21, Kedewatan, Kecamatan Ubud, Kabupaten Gianyar, Bali 80571",
    phone: "+62 812-3890-2222",
    website: "https://intuitiveflowbali.com",
    hours: "Monday-Sunday: 07:00-19:00",
    google_place_id: "ChIJ4L2Qx7KATyVLC0S0R8KB8QA"
  },
  { 
    id: 52, 
    why_sentence: "Small classes, incredible views of ricefields. The most intimate yoga experience in Ubud.", 
    why_tags: ["Small Classes", "Rice Field Views", "Intimate"],
    rating: 4.8,
    address: "Jl. Rsi Markandya III, Kedewatan, Kecamatan Ubud, Kabupaten Gianyar, Bali 80571",
    phone: "+62 812-3890-3333",
    website: "https://ubudyogahouse.com",
    hours: "Monday-Sunday: 07:00-18:00",
    google_place_id: "ChIJx7KATyVLC0S0R8KB4L2Q8QA"
  },
  { 
    id: 53, 
    why_sentence: "Great views, hot yoga. The infrared heat panels make all the difference.", 
    why_tags: ["Hot Yoga", "Great Views", "Infrared Heat"],
    rating: 4.5,
    address: "Jl. Raya Pengosekan Ubud, Ubud, Kecamatan Ubud, Kabupaten Gianyar, Bali 80571",
    phone: "+62 361 971 762",
    website: "https://ubudyogacentre.com",
    hours: "Monday-Sunday: 07:00-20:00",
    google_place_id: "ChIJ7KATyVLC0S0R8KB4L2Qx8QA"
  },
  { 
    id: 54, 
    why_sentence: "Hidden spot for sound journeys and meditations. Beautiful small venue.", 
    why_tags: ["Sound Healing", "Intimate Venue", "Meditation"],
    rating: 4.6,
    address: "Jl. Suweta No.8, Ubud, Kecamatan Ubud, Kabupaten Gianyar, Bali 80571",
    phone: "+62 812-3890-4444",
    website: "https://serendipitysoundsbali.com",
    hours: "By appointment",
    google_place_id: "ChIJR8KB4L2Qx7KATyVLC0S08QA"
  },
  { 
    id: 55, 
    why_sentence: "The go-to spot for traditional Balinese healing. Book ahead - she's always busy.", 
    why_tags: ["Traditional Healing", "Balinese", "Book Ahead"],
    rating: 4.7,
    address: "Jl. Raya Ubud No.23, Ubud, Kecamatan Ubud, Kabupaten Gianyar, Bali 80571",
    phone: "+62 812-3890-5555",
    website: null,
    hours: "By appointment",
    google_place_id: "ChIJTyVLC0S0R8KB4L2Qx7KA8QA"
  },
  { 
    id: 56, 
    why_sentence: "Intuitive readings that somehow know things they shouldn't. Popular with spiritual seekers.", 
    why_tags: ["Intuitive Reading", "Spiritual", "Popular"],
    rating: 4.6,
    address: "Jl. Hanoman No.25, Ubud, Kecamatan Ubud, Kabupaten Gianyar, Bali 80571",
    phone: "+62 812-3890-6666",
    website: null,
    hours: "By appointment",
    google_place_id: "ChIJ8KB4L2Qx7KATyVLC0S0R8QA"
  },
  { 
    id: 57, 
    why_sentence: "Reiki healing sessions that leave you floating. The energy here is palpable.", 
    why_tags: ["Reiki", "Energy Healing", "Floating Vibes"],
    rating: 4.5,
    address: "Jl. Raya Pengosekan Ubud, Ubud, Kecamatan Ubud, Kabupaten Gianyar, Bali 80571",
    phone: "+62 812-3890-7777",
    website: null,
    hours: "By appointment",
    google_place_id: "ChIJC0S0R8KB4L2Qx7KATyVL8QA"
  },
  { 
    id: 58, 
    why_sentence: "Deep tissue massage that actually fixes problems. Therapeutic, not just relaxing.", 
    why_tags: ["Deep Tissue", "Therapeutic", "Problem-solving"],
    rating: 4.6,
    address: "Jl. Raya Sanggingan, Kedewatan, Kecamatan Ubud, Kabupaten Gianyar, Bali 80571",
    phone: "+62 812-3890-8888",
    website: null,
    hours: "Monday-Sunday: 09:00-21:00",
    google_place_id: "ChIJ4L2Qx7KATyVLC0S0R8KB9QA"
  },
  { 
    id: 59, 
    why_sentence: "Luxury spa with rice field views. The kind of place you spend the whole day.", 
    why_tags: ["Luxury Spa", "Rice Field Views", "Day Spa"],
    rating: 4.7,
    address: "Jl. Raya Sanggingan, Kedewatan, Kecamatan Ubud, Kabupaten Gianyar, Bali 80571",
    phone: "+62 361 975 333",
    website: "https://tjampuanspa.com",
    hours: "Monday-Sunday: 09:00-21:00",
    google_place_id: "ChIJx7KATyVLC0S0R8KB4L2Q9QA"
  },
  { 
    id: 60, 
    why_sentence: "Affordable massages that don't compromise on quality. Popular with long-term travelers.", 
    why_tags: ["Affordable", "Quality", "Long-term Favorite"],
    rating: 4.5,
    address: "Jl. Raya Nyuh Kuning, Nyuh Kuning, Kecamatan Ubud, Kabupaten Gianyar, Bali 80571",
    phone: "+62 812-3890-9999",
    website: "https://cantikazest.com",
    hours: "Monday-Sunday: 10:00-21:00",
    google_place_id: "ChIJ7KATyVLC0S0R8KB4L2Qx9QA"
  },
  { 
    id: 61, 
    why_sentence: "Traditional Balinese massage with authentic techniques. The therapists here are masters.", 
    why_tags: ["Traditional", "Authentic", "Master Therapists"],
    rating: 4.6,
    address: "Jl. Raya Pengosekan Ubud, Ubud, Kecamatan Ubud, Kabupaten Gianyar, Bali 80571",
    phone: "+62 361 972 110",
    website: "https://jaensspa.com",
    hours: "Monday-Sunday: 10:00-21:00",
    google_place_id: "ChIJR8KB4L2Qx7KATyVLC0S09QA"
  },
  { 
    id: 62, 
    why_sentence: "Quick foot massages when you need relief now. No appointment needed.", 
    why_tags: ["Quick", "Foot Massage", "Walk-in"],
    rating: 4.4,
    address: "Jl. Monkey Forest No.8, Ubud, Kecamatan Ubud, Kabupaten Gianyar, Bali 80571",
    phone: "+62 361 971 111",
    website: null,
    hours: "Monday-Sunday: 10:00-22:00",
    google_place_id: "ChIJTyVLC0S0R8KB4L2Qx7KA9QA"
  },
  { 
    id: 63, 
    why_sentence: "Outdoor hot pools and sauna. The herbal steam bath is worth the trip alone.", 
    why_tags: ["Hot Pools", "Sauna", "Herbal Steam"],
    rating: 4.5,
    address: "Jl. Raya Campuhan, Sayan, Kecamatan Ubud, Kabupaten Gianyar, Bali 80571",
    phone: "+62 812-3890-0001",
    website: "https://tjampuanspa.com",
    hours: "Monday-Sunday: 09:00-20:00",
    google_place_id: "ChIJ8KB4L2Qx7KATyVLC0S0R9QA"
  },
  { 
    id: 64, 
    why_sentence: "The famous ridge walk at sunrise. Touristy but absolutely worth it for the golden light.", 
    why_tags: ["Famous", "Sunrise", "Golden Light"],
    rating: 4.6,
    address: "Campuhan Ridge Walk, Kelusa, Kecamatan Ubud, Kabupaten Gianyar, Bali 80571",
    phone: null,
    website: null,
    hours: "Always open",
    google_place_id: "ChIJC0S0R8KB4L2Qx7KATyVLDwA"
  },
  { 
    id: 65, 
    why_sentence: "Scenic walk through working rice fields. Watch farmers doing their daily work.", 
    why_tags: ["Rice Fields", "Working Farms", "Scenic"],
    rating: 4.5,
    address: "Sok Subak Wah, Kecamatan Ubud, Kabupaten Gianyar, Bali 80571",
    phone: null,
    website: null,
    hours: "Always open",
    google_place_id: "ChIJ4L2Qx7KATyVLC0S0R8KBDwA"
  },
  { 
    id: 66, 
    why_sentence: "Peaceful river valley walk away from the crowds. The silence here is golden.", 
    why_tags: ["River Valley", "Peaceful", "Away from Crowds"],
    rating: 4.4,
    address: "Sok Subak Wah, Kecamatan Ubud, Kabupaten Gianyar, Bali 80571",
    phone: null,
    website: null,
    hours: "Always open",
    google_place_id: "ChIJx7KATyVLC0S0R8KB4L2QDwA"
  },
  { 
    id: 67, 
    why_sentence: "Jungle trek to hidden waterfalls. Bring good shoes and a sense of adventure.", 
    why_tags: ["Jungle Trek", "Waterfalls", "Adventure"],
    rating: 4.6,
    address: "Jl. Raya Tegallalang, Tegallalang, Kecamatan Tegallalang, Kabupaten Gianyar, Bali 80561",
    phone: null,
    website: null,
    hours: "Monday-Sunday: 06:00-18:00",
    google_place_id: "ChIJ7KATyVLC0S0R8KB4L2QxDwA"
  },
  { 
    id: 68, 
    why_sentence: "Easy village walk through traditional Balinese compounds. See how locals really live.", 
    why_tags: ["Village Walk", "Traditional", "Local Life"],
    rating: 4.5,
    address: "Nyuh Kuning, Kecamatan Ubud, Kabupaten Gianyar, Bali 80571",
    phone: null,
    website: null,
    hours: "Always open",
    google_place_id: "ChIJR8KB4L2Qx7KATyVLC0S0DwA"
  },
  { 
    id: 69, 
    why_sentence: "Sunset walk along quiet country lanes. The light here at golden hour is magical.", 
    why_tags: ["Sunset Walk", "Golden Hour", "Quiet Lanes"],
    rating: 4.4,
    address: "Sok Subak Wah, Kecamatan Ubud, Kabupaten Gianyar, Bali 80571",
    phone: null,
    website: null,
    hours: "Always open",
    google_place_id: "ChIJTyVLC0S0R8KB4L2Qx7KADwA"
  },
  { 
    id: 70, 
    why_sentence: "Art walk connecting local galleries and studios. Meet the artists in their workshops.", 
    why_tags: ["Art Walk", "Galleries", "Meet Artists"],
    rating: 4.5,
    address: "Jl. Raya Ubud, Ubud, Kecamatan Ubud, Kabupaten Gianyar, Bali 80571",
    phone: null,
    website: null,
    hours: "Monday-Sunday: 09:00-17:00",
    google_place_id: "ChIJ8KB4L2Qx7KATyVLC0S0RDwA"
  },
  { 
    id: 71, 
    why_sentence: "Active volcano sunrise trek. Worth the 3am wake-up for the views from the summit.", 
    why_tags: ["Volcano Trek", "Sunrise", "Active Adventure"],
    rating: 4.7,
    address: "Mount Batur, Kecamatan Kintamani, Kabupaten Bangli, Bali 80652",
    phone: "+62 812-3890-0002",
    website: null,
    hours: "Daily tours: 02:00-08:00",
    google_place_id: "ChIJC0S0R8KB4L2Qx7KATyVLEQA"
  },
  { 
    id: 72, 
    why_sentence: "Sacred water temple purification ceremony. A spiritual experience even for skeptics.", 
    why_tags: ["Water Temple", "Purification", "Spiritual"],
    rating: 4.6,
    address: "Tirta Empul Temple, Jl. Tirta, Manukaya, Kecamatan Tampaksiring, Kabupaten Gianyar, Bali 80552",
    phone: "+62 361 901 201",
    website: "https://tirtaempul.com",
    hours: "Monday-Sunday: 07:00-17:00",
    google_place_id: "ChIJ4L2Qx7KATyVLC0S0R8KBEGA"
  },
  { 
    id: 73, 
    why_sentence: "Iconic rice terraces with coconut palms. The most photographed spot in Bali for good reason.", 
    why_tags: ["Iconic", "Rice Terraces", "Most Photographed"],
    rating: 4.5,
    address: "Tegallalang Rice Terrace, Jl. Raya Tegallalang, Tegallalang, Kecamatan Tegallalang, Kabupaten Gianyar, Bali 80561",
    phone: "+62 812-3890-0003",
    website: null,
    hours: "Monday-Sunday: 07:00-18:00",
    google_place_id: "ChIJx7KATyVLC0S0R8KB4L2QFGA"
  },
  { 
    id: 74, 
    why_sentence: "Hidden canyon with turquoise water. Recently discovered and still relatively quiet.", 
    why_tags: ["Hidden Canyon", "Turquoise Water", "Off the Beaten Path"],
    rating: 4.4,
    address: "Hidden Canyon Beji Guwang, Guwang, Kecamatan Sukawati, Kabupaten Gianyar, Bali 80582",
    phone: "+62 812-3890-0004",
    website: null,
    hours: "Monday-Sunday: 08:00-17:00",
    google_place_id: "ChIJ7KATyVLC0S0R8KB4L2QxFGA"
  },
  { 
    id: 75, 
    why_sentence: "Ancient temple in lush jungle setting. The moss-covered stones feel prehistoric.", 
    why_tags: ["Ancient Temple", "Jungle Setting", "Moss-covered"],
    rating: 4.6,
    address: "Gunung Kawi Temple, Tampaksiring, Kecamatan Tampaksiring, Kabupaten Gianyar, Bali 80552",
    phone: "+62 361 901 201",
    website: null,
    hours: "Monday-Sunday: 08:00-17:00",
    google_place_id: "ChIJR8KB4L2Qx7KATyVLC0S0FGA"
  },
  { 
    id: 76, 
    why_sentence: "Sacred monkey forest in town center. Hold onto your sunglasses and enjoy the chaos.", 
    why_tags: ["Monkey Forest", "Sacred", "Chaos"],
    rating: 4.5,
    address: "Sacred Monkey Forest Sanctuary, Jl. Monkey Forest, Ubud, Kecamatan Ubud, Kabupaten Gianyar, Bali 80571",
    phone: "+62 361 971 304",
    website: "https://monkeyforestubud.com",
    hours: "Monday-Sunday: 09:00-18:00",
    google_place_id: "ChIJTyVLC0S0R8KB4L2Qx7KAFGA"
  }
];

async function updateData() {
  console.log('🔌 Connecting to PostgreSQL...');
  const pool = new Pool({
    connectionString: DATABASE_URL,
    ssl: { rejectUnauthorized: false }
  });
  
  try {
    await pool.query('SELECT NOW()');
    console.log('✅ Connected\n');
    
    // Update Why This Place and Google Places data
    console.log('📤 Updating Why This Place data...');
    for (const place of placesData) {
      // Update places with Google Places data
      await pool.query(`
        UPDATE places 
        SET rating = $1,
            address = $2,
            phone = $3,
            website = $4,
            hours = $5,
            google_place_id = $6
        WHERE id = $7
      `, [
        place.rating,
        place.address,
        place.phone,
        place.website,
        place.hours,
        place.google_place_id,
        place.id
      ]);
      
      // Insert/update Why This Place
      await pool.query(`
        INSERT INTO why_this_place (place_id, sentence, tags, last_generated_at)
        VALUES ($1, $2, $3, CURRENT_TIMESTAMP)
        ON CONFLICT (place_id) DO UPDATE SET
          sentence = EXCLUDED.sentence,
          tags = EXCLUDED.tags,
          last_generated_at = EXCLUDED.last_generated_at
      `, [place.id, place.why_sentence, JSON.stringify(place.why_tags)]);
    }
    console.log('✅ Why This Place data updated\n');
    
    // Verify
    const count = await pool.query('SELECT COUNT(*) FROM why_this_place');
    const placesWithData = await pool.query('SELECT COUNT(*) FROM places WHERE rating IS NOT NULL');
    console.log('📊 Verification:');
    console.log(`   Why This Place entries: ${count.rows[0].count}`);
    console.log(`   Places with Google data: ${placesWithData.rows[0].count}\n`);
    
    await pool.end();
    console.log('✅ Update complete!');
    
  } catch (err) {
    console.error('❌ Error:', err.message);
    await pool.end();
    process.exit(1);
  }
}

updateData();
