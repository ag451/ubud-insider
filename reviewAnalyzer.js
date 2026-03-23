// Review Analysis Engine for "Why This Place?"
// Analyzes Google Places reviews and generates curated insights

// Keyword dictionaries for extracting signals
const SIGNAL_KEYWORDS = {
  food_quality: {
    positive: ['delicious', 'tasty', 'amazing food', 'great food', 'fresh', 'flavorful', 'authentic', 'yummy', 'perfect', 'excellent food', 'best food', 'incredible food', 'mouthwatering', 'scrumptious', 'outstanding', 'exceptional'],
    breakfast: ['great brunch', 'amazing breakfast', 'best breakfast', 'delicious brunch', 'perfect brunch', 'tasty breakfast', 'healthy breakfast', 'best brunch'],
    healthy: ['healthy', 'fresh', 'organic', 'vegan options', 'vegetarian friendly', 'clean eating', 'nutritious', 'wholesome', 'plant-based', 'gluten free'],
    coffee: ['great coffee', 'amazing coffee', 'best coffee', 'perfect coffee', 'excellent coffee', 'quality coffee', 'strong coffee', 'smooth coffee', 'exceptional coffee'],
    drinks: ['great cocktails', 'amazing drinks', 'best cocktails', 'perfect drinks', 'refreshing drinks', 'creative cocktails']
  },
  atmosphere: {
    calm: ['peaceful', 'quiet', 'relaxing', 'calm', 'serene', 'tranquil', 'zen', 'chill', 'laid back', 'mellow'],
    lively: ['lively', 'bustling', 'busy', 'vibrant', 'energetic', 'happening', 'buzzing', 'great vibe', 'good energy', 'upbeat'],
    aesthetic: ['beautiful', 'aesthetic', 'instagrammable', 'stunning', 'gorgeous', 'lovely decor', 'charming', 'pretty', 'elegant', 'stylish'],
    cozy: ['cozy', 'warm', 'intimate', 'homey', 'comfortable', 'welcoming', 'snug'],
    nature: ['jungle view', 'rice field', 'garden', 'outdoor seating', 'nature', 'scenic', 'greenery', 'surrounded by nature', 'tropical', 'lush']
  },
  crowd: {
    digital_nomad: ['digital nomads', 'laptop friendly', 'wifi', 'working', 'remote work', 'coworking', 'laptops'],
    tourists: ['tourists', 'touristy', 'visitors', 'travelers', 'backpackers'],
    locals: ['locals', 'local favorite', 'hidden gem', 'off the beaten path', 'authentic local', 'local secret'],
    families: ['family friendly', 'kids', 'children', 'family'],
    couples: ['romantic', 'date night', 'couples', 'intimate']
  },
  location: {
    central: ['central', 'heart of ubud', 'main street', 'easy to find', 'convenient location', 'walkable', 'center of town'],
    hidden: ['hidden', 'secret', 'tucked away', 'secluded', 'quiet corner', 'away from crowds'],
    scenic: ['view', 'views', 'overlooking', 'scenic', 'panoramic', 'vista', 'gorgeous view', 'stunning view']
  },
  service: {
    friendly: ['friendly staff', 'welcoming', 'helpful', 'kind', 'warm service', 'hospitable', 'attentive', 'lovely staff'],
    fast: ['fast service', 'quick', 'efficient', 'prompt', 'speedy'],
    knowledgeable: ['knowledgeable', 'expert', 'passionate', 'know their stuff']
  }
};

// Sentence templates for different signal combinations
const SENTENCE_TEMPLATES = {
  food_atmosphere: (food, atmos) => `Come here if you want ${food} in ${atmos}.`,
  food_location: (food, loc) => `Come here if you want ${food} with ${loc}.`,
  atmosphere_location: (atmos, loc) => `Come here if you want ${atmos} in ${loc}.`,
  food_service: (food, svc) => `Come here if you want ${food} and ${svc}.`,
  crowd_food: (crowd, food) => `Come here if you want ${food} in ${crowd}.`,
  nature_food: (nature, food) => `Come here if you want ${food} with ${nature}.`,
  default: (items) => `Come here if you want ${items.join(' and ')}.`
};

/**
 * Analyze reviews and generate "Why This Place" content
 * @param {Array} reviews - Array of Google Places review objects
 * @returns {Object} - { sentence, tags }
 */
function analyzeReviews(reviews) {
  if (!reviews || reviews.length === 0) {
    return {
      sentence: 'Come here if you want to discover a local favorite.',
      tags: ['Local spot']
    };
  }

  // Score and filter reviews
  const scoredReviews = reviews
    .filter(r => r.text && r.text.length > 15)
    .map(r => ({
      ...r,
      weightedScore: calculateReviewScore(r)
    }))
    .sort((a, b) => b.weightedScore - a.weightedScore)
    .slice(0, 25);

  if (scoredReviews.length === 0) {
    return {
      sentence: 'Come here if you want to discover a local favorite.',
      tags: ['Local spot']
    };
  }

  // Extract signals with per-review weighting
  const signalScores = extractWeightedSignals(scoredReviews);
  
  // Get top signals across different categories
  const topSignals = getTopSignalsByCategory(signalScores);
  
  // Generate unique sentence based on top signals
  const sentence = generateUniqueSentence(topSignals);
  
  // Generate tags from top signals
  const tags = generateTagsFromSignals(topSignals);

  return { sentence, tags };
}

/**
 * Calculate a score for a review based on rating, recency, and length
 */
function calculateReviewScore(review) {
  let score = 1;
  
  // Rating weight (higher rating = more weight)
  if (review.rating === 5) score *= 3;
  else if (review.rating === 4) score *= 2;
  else if (review.rating === 3) score *= 1;
  else score *= 0.5; // Lower ratings count less
  
  // Recency weight
  if (review.time) {
    const reviewDate = new Date(review.time);
    const daysAgo = (Date.now() - reviewDate.getTime()) / (1000 * 60 * 60 * 24);
    
    if (daysAgo <= 30) score *= 2.5;
    else if (daysAgo <= 90) score *= 1.8;
    else if (daysAgo <= 365) score *= 1.2;
  }
  
  // Length bonus (detailed reviews are more valuable)
  const textLength = review.text?.length || 0;
  if (textLength > 200) score *= 1.3;
  else if (textLength > 100) score *= 1.1;
  
  return score;
}

/**
 * Extract signals from reviews with proper weighting
 */
function extractWeightedSignals(scoredReviews) {
  const signalScores = {};
  
  // Initialize all categories
  for (const category of Object.keys(SIGNAL_KEYWORDS)) {
    signalScores[category] = {};
    for (const subcategory of Object.keys(SIGNAL_KEYWORDS[category])) {
      signalScores[category][subcategory] = 0;
    }
  }
  
  // Score each review's keywords weighted by review score
  for (const review of scoredReviews) {
    const text = review.text.toLowerCase();
    const reviewWeight = review.weightedScore;
    
    for (const [category, subcategories] of Object.entries(SIGNAL_KEYWORDS)) {
      for (const [subcategory, keywords] of Object.entries(subcategories)) {
        for (const keyword of keywords) {
          const regex = new RegExp(`\\b${keyword}\\b`, 'gi');
          const matches = text.match(regex);
          if (matches) {
            signalScores[category][subcategory] += matches.length * reviewWeight;
          }
        }
      }
    }
  }
  
  return signalScores;
}

/**
 * Get top signals, ensuring diversity across categories
 */
function getTopSignalsByCategory(signalScores) {
  const topByCategory = [];
  
  for (const [category, subcategories] of Object.entries(signalScores)) {
    const categorySignals = Object.entries(subcategories)
      .filter(([_, score]) => score > 0)
      .sort((a, b) => b[1] - a[1]);
    
    if (categorySignals.length > 0) {
      const [topSubcategory, topScore] = categorySignals[0];
      topByCategory.push({
        category,
        subcategory: topSubcategory,
        score: topScore,
        display: getDisplayName(category, topSubcategory),
        article: getArticle(category, topSubcategory)
      });
    }
  }
  
  // Sort by score descending
  return topByCategory.sort((a, b) => b.score - a.score);
}

/**
 * Get appropriate article for a signal
 */
function getArticle(category, subcategory) {
  const needsA = ['calm', 'lively', 'aesthetic', 'cozy', 'nature', 'central', 'hidden', 'scenic', 'friendly', 'fast'];
  return needsA.includes(subcategory) ? 'a' : '';
}

/**
 * Generate a unique sentence based on the top signals
 */
function generateUniqueSentence(topSignals) {
  if (topSignals.length === 0) {
    return 'Come here if you want to discover a local favorite.';
  }
  
  const signals = topSignals.slice(0, 3);
  const top = signals[0];
  const second = signals[1];
  const third = signals[2];
  
  // Try to create meaningful combinations
  if (top.category === 'food_quality' && second?.category === 'atmosphere') {
    return `Come here if you want ${top.display} in ${second.article} ${second.display}.`;
  }
  
  if (top.category === 'food_quality' && second?.category === 'location') {
    return `Come here if you want ${top.display} with ${second.article} ${second.display}.`;
  }
  
  if (top.category === 'atmosphere' && second?.category === 'food_quality') {
    return `Come here if you want ${second.display} in ${top.article} ${top.display}.`;
  }
  
  if (top.category === 'atmosphere' && second?.category === 'location') {
    return `Come here if you want ${top.display} in ${second.article} ${second.display}.`;
  }
  
  if (top.category === 'nature' && second?.category === 'food_quality') {
    return `Come here if you want ${second.display} with ${top.display}.`;
  }
  
  if (top.category === 'location' && second?.category === 'food_quality') {
    return `Come here if you want ${second.display} in ${top.article} ${top.display}.`;
  }
  
  if (top.category === 'crowd' && second?.category === 'food_quality') {
    return `Come here if you want ${second.display} in ${top.article} ${top.display}.`;
  }
  
  if (top.category === 'food_quality' && second?.category === 'crowd') {
    return `Come here if you want ${top.display} in ${second.article} ${second.display}.`;
  }
  
  if (top.category === 'service' && second?.category === 'food_quality') {
    return `Come here if you want ${second.display} with ${top.display}.`;
  }
  
  if (top.category === 'food_quality' && second?.category === 'service') {
    return `Come here if you want ${top.display} with ${second.display}.`;
  }
  
  // Three-signal combination
  if (signals.length >= 3) {
    const parts = signals.map(s => s.article ? `${s.article} ${s.display}` : s.display);
    return `Come here if you want ${parts[0]}, ${parts[1]} and ${parts[2]}.`;
  }
  
  // Two-signal fallback
  if (signals.length === 2) {
    const first = top.article ? `${top.article} ${top.display}` : top.display;
    const secondStr = second.article ? `${second.article} ${second.display}` : second.display;
    return `Come here if you want ${first} and ${secondStr}.`;
  }
  
  // Single signal fallback
  const display = top.article ? `${top.article} ${top.display}` : top.display;
  return `Come here if you want ${display}.`;
}

/**
 * Get human-readable display name for a signal
 */
function getDisplayName(category, subcategory) {
  const displayNames = {
    food_quality: {
      positive: 'delicious food',
      breakfast: 'amazing brunch',
      healthy: 'healthy options',
      coffee: 'great coffee',
      drinks: 'excellent cocktails'
    },
    atmosphere: {
      calm: 'peaceful vibe',
      lively: 'lively energy',
      aesthetic: 'beautiful setting',
      cozy: 'cozy atmosphere',
      nature: 'nature views'
    },
    crowd: {
      digital_nomad: 'laptop-friendly space',
      tourists: 'tourist-friendly spot',
      locals: 'local favorite',
      families: 'family-friendly atmosphere',
      couples: 'romantic setting'
    },
    location: {
      central: 'central location',
      hidden: 'hidden gem',
      scenic: 'scenic views'
    },
    service: {
      friendly: 'friendly staff',
      fast: 'quick service',
      knowledgeable: 'expert staff'
    }
  };
  
  return displayNames[category]?.[subcategory] || subcategory.replace(/_/g, ' ');
}

/**
 * Generate 2-3 highlight tags from top signals
 */
function generateTagsFromSignals(topSignals) {
  const tags = [];
  const usedCategories = new Set();
  
  for (const signal of topSignals) {
    if (tags.length >= 3) break;
    
    // Skip if we already have a tag from this category
    if (usedCategories.has(signal.category)) continue;
    
    // Format tag nicely
    let tag = signal.display;
    tag = tag.split(' ')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
    
    tags.push(tag);
    usedCategories.add(signal.category);
  }
  
  // Ensure at least one tag
  if (tags.length === 0) {
    tags.push('Local Favorite');
  }
  
  return tags;
}

module.exports = {
  analyzeReviews
};
