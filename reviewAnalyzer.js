// Review Analysis Engine for "Why This Place?"
// Analyzes Google Places reviews and generates curated insights

// Keyword dictionaries for extracting signals
const SIGNAL_KEYWORDS = {
  food_quality: {
    positive: ['delicious', 'tasty', 'amazing food', 'great food', 'fresh', 'flavorful', 'authentic', 'yummy', 'perfect', 'excellent food', 'best food', 'incredible food', 'mouthwatering', 'scrumptious'],
    breakfast: ['great brunch', 'amazing breakfast', 'best breakfast', 'delicious brunch', 'perfect brunch', 'tasty breakfast', 'healthy breakfast'],
    healthy: ['healthy', 'fresh', 'organic', 'vegan options', 'vegetarian friendly', 'clean eating', 'nutritious', 'wholesome'],
    coffee: ['great coffee', 'amazing coffee', 'best coffee', 'perfect coffee', 'excellent coffee', 'quality coffee', 'strong coffee', 'smooth coffee'],
    drinks: ['great cocktails', 'amazing drinks', 'best cocktails', 'perfect drinks', 'refreshing drinks']
  },
  atmosphere: {
    calm: ['peaceful', 'quiet', 'relaxing', 'calm', 'serene', 'tranquil', 'zen', 'chill', 'laid back'],
    lively: ['lively', 'bustling', 'busy', 'vibrant', 'energetic', 'happening', 'buzzing', 'great vibe', 'good energy'],
    aesthetic: ['beautiful', 'aesthetic', 'instagrammable', 'stunning', 'gorgeous', 'lovely decor', 'charming', 'pretty'],
    cozy: ['cozy', 'warm', 'intimate', 'homey', 'comfortable', 'welcoming'],
    nature: ['jungle view', 'rice field', 'garden', 'outdoor seating', 'nature', 'scenic', 'greenery', 'surrounded by nature']
  },
  crowd: {
    digital_nomad: ['digital nomads', 'laptop friendly', 'wifi', 'working', 'remote work', 'coworking'],
    tourists: ['tourists', 'touristy', 'visitors', 'travelers'],
    locals: ['locals', 'local favorite', 'hidden gem', 'off the beaten path', 'authentic local'],
    families: ['family friendly', 'kids', 'children', 'family'],
    couples: ['romantic', 'date night', 'couples', 'intimate']
  },
  location: {
    central: ['central', 'heart of ubud', 'main street', 'easy to find', 'convenient location', 'walkable'],
    hidden: ['hidden', 'secret', 'tucked away', ' secluded', 'quiet corner'],
    scenic: ['view', 'views', 'overlooking', 'scenic', 'panoramic', 'vista']
  },
  service: {
    friendly: ['friendly staff', 'welcoming', 'helpful', 'kind', 'warm service', 'hospitable', 'attentive'],
    fast: ['fast service', 'quick', 'efficient', 'prompt'],
    knowledgeable: ['knowledgeable', 'expert', 'passionate', 'know their stuff']
  }
};

// Weight factors for scoring
const WEIGHTS = {
  rating_5: 3,
  rating_4: 2,
  rating_3: 1,
  recent_30_days: 2,
  recent_90_days: 1.5,
  review_length_bonus: 1.2 // Longer reviews get a slight bonus
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

  // Filter and score reviews
  const scoredReviews = reviews
    .filter(r => r.text && r.text.length > 20) // Ignore very short reviews
    .map(r => ({
      ...r,
      score: calculateReviewScore(r)
    }))
    .sort((a, b) => b.score - a.score)
    .slice(0, 30); // Top 30 reviews

  // Extract signals from all reviews
  const signals = extractSignals(scoredReviews);
  
  // Rank signals by frequency and weight
  const rankedSignals = rankSignals(signals);
  
  // Generate output
  const sentence = generateSentence(rankedSignals);
  const tags = generateTags(rankedSignals);

  return { sentence, tags };
}

/**
 * Calculate a score for a review based on rating, recency, and length
 */
function calculateReviewScore(review) {
  let score = 0;
  
  // Rating weight
  if (review.rating === 5) score += WEIGHTS.rating_5;
  else if (review.rating === 4) score += WEIGHTS.rating_4;
  else if (review.rating === 3) score += WEIGHTS.rating_3;
  
  // Recency weight (if time is available)
  if (review.time) {
    const reviewDate = new Date(review.time);
    const daysAgo = (Date.now() - reviewDate.getTime()) / (1000 * 60 * 60 * 24);
    
    if (daysAgo <= 30) score *= WEIGHTS.recent_30_days;
    else if (daysAgo <= 90) score *= WEIGHTS.recent_90_days;
  }
  
  // Length bonus for detailed reviews
  if (review.text && review.text.length > 100) {
    score *= WEIGHTS.review_length_bonus;
  }
  
  return score;
}

/**
 * Extract signals from reviews
 */
function extractSignals(reviews) {
  const signals = {};
  const text = reviews.map(r => r.text.toLowerCase()).join(' ');
  
  // Check each keyword category
  for (const [category, subcategories] of Object.entries(SIGNAL_KEYWORDS)) {
    signals[category] = {};
    
    for (const [subcategory, keywords] of Object.entries(subcategories)) {
      let count = 0;
      
      for (const keyword of keywords) {
        const regex = new RegExp(keyword, 'gi');
        const matches = text.match(regex);
        if (matches) {
          count += matches.length;
        }
      }
      
      if (count > 0) {
        signals[category][subcategory] = count;
      }
    }
  }
  
  return signals;
}

/**
 * Rank signals by frequency
 */
function rankSignals(signals) {
  const ranked = [];
  
  for (const [category, subcategories] of Object.entries(signals)) {
    for (const [subcategory, count] of Object.entries(subcategories)) {
      ranked.push({
        category,
        subcategory,
        count,
        display: getDisplayName(category, subcategory)
      });
    }
  }
  
  return ranked.sort((a, b) => b.count - a.count);
}

/**
 * Get human-readable display name for a signal
 */
function getDisplayName(category, subcategory) {
  const displayNames = {
    food_quality: {
      positive: 'great food',
      breakfast: 'amazing brunch',
      healthy: 'healthy options',
      coffee: 'great coffee',
      drinks: 'excellent drinks'
    },
    atmosphere: {
      calm: 'peaceful vibe',
      lively: 'lively energy',
      aesthetic: 'beautiful setting',
      cozy: 'cozy atmosphere',
      nature: 'nature views'
    },
    crowd: {
      digital_nomad: 'laptop-friendly',
      tourists: 'tourist-friendly',
      locals: 'local favorite',
      families: 'family-friendly',
      couples: 'romantic spot'
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
  
  return displayNames[category]?.[subcategory] || subcategory.replace('_', ' ');
}

/**
 * Generate the "Come here if you want..." sentence
 */
function generateSentence(topSignals) {
  if (topSignals.length === 0) {
    return 'Come here if you want to discover a local favorite.';
  }
  
  // Get top 2-3 signals
  const top3 = topSignals.slice(0, 3);
  
  // Build sentence based on signal types
  const parts = [];
  let hasFood = false;
  let hasAtmosphere = false;
  let hasLocation = false;
  
  for (const signal of top3) {
    if (signal.category === 'food_quality' && !hasFood) {
      parts.push(signal.display);
      hasFood = true;
    } else if (signal.category === 'atmosphere' && !hasAtmosphere) {
      parts.push(`a ${signal.display}`);
      hasAtmosphere = true;
    } else if (signal.category === 'location' && !hasLocation) {
      parts.push(`a ${signal.display}`);
      hasLocation = true;
    } else if (signal.category === 'crowd' && parts.length < 2) {
      parts.push(`a ${signal.display}`);
    } else if (signal.category === 'service' && parts.length < 2) {
      parts.push(`with ${signal.display}`);
    }
    
    if (parts.length >= 2) break;
  }
  
  // Combine into sentence
  if (parts.length === 0) {
    return `Come here if you want ${topSignals[0].display}.`;
  }
  
  if (parts.length === 1) {
    return `Come here if you want ${parts[0]}.`;
  }
  
  // Join with 'and' or 'with'
  const lastPart = parts.pop();
  const combined = parts.join(', ') + ' and ' + lastPart;
  
  return `Come here if you want ${combined}.`;
}

/**
 * Generate 2-3 highlight tags
 */
function generateTags(topSignals) {
  const tags = [];
  const usedCategories = new Set();
  
  for (const signal of topSignals) {
    if (tags.length >= 3) break;
    
    // Don't duplicate categories
    if (usedCategories.has(signal.category)) continue;
    
    // Format tag
    let tag = signal.display;
    
    // Capitalize first letter of each word
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
