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

/**
 * Analyze reviews and generate "Why This Place" content
 * @param {Array} reviews - Array of Google Places review objects
 * @returns {Object} - { sentence, tags }
 */
function analyzeReviews(reviews) {
  console.log(`  🔍 Analyzer received ${reviews?.length || 0} reviews`);
  
  if (!reviews || reviews.length === 0) {
    console.log(`  ⚠️ No reviews provided, using fallback`);
    return {
      sentence: "A local favorite worth discovering.",
      tags: ['Local spot']
    };
  }

  // Score and filter reviews
  const scoredReviews = reviews
    .filter(r => {
      const hasText = r.text && r.text.length > 15;
      if (!hasText) {
        console.log(`    ⛔ Filtered out review (too short or no text): "${r.text?.substring(0, 30)}..."`);
      }
      return hasText;
    })
    .map(r => ({
      ...r,
      weightedScore: calculateReviewScore(r)
    }))
    .sort((a, b) => b.weightedScore - a.weightedScore)
    .slice(0, 25);

  console.log(`  ✅ ${scoredReviews.length} reviews passed filtering`);

  if (scoredReviews.length === 0) {
    console.log(`  ⚠️ No reviews after filtering, using fallback`);
    return {
      sentence: "A local favorite worth discovering.",
      tags: ['Local spot']
    };
  }

  // Extract signals with per-review weighting
  const signalScores = extractWeightedSignals(scoredReviews);
  
  // Debug: log top signals
  console.log(`  📊 Signal scores:`);
  for (const [cat, subcats] of Object.entries(signalScores)) {
    const top = Object.entries(subcats).sort((a, b) => b[1] - a[1])[0];
    if (top && top[1] > 0) {
      console.log(`    ${cat}: ${top[0]} = ${top[1].toFixed(1)}`);
    }
  }
  
  // Get top signals across different categories
  const topSignals = getTopSignalsByCategory(signalScores);
  
  console.log(`  🏆 Top signals: ${topSignals.map(s => s.display).join(', ')}`);
  
  // Generate natural sentence based on top signals
  const sentence = generateNaturalSentence(topSignals);
  
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
  else score *= 0.5;
  
  // Recency weight
  if (review.time) {
    const reviewDate = new Date(review.time);
    const daysAgo = (Date.now() - reviewDate.getTime()) / (1000 * 60 * 60 * 24);
    
    if (daysAgo <= 30) score *= 2.5;
    else if (daysAgo <= 90) score *= 1.8;
    else if (daysAgo <= 365) score *= 1.2;
  }
  
  // Length bonus
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
  
  for (const category of Object.keys(SIGNAL_KEYWORDS)) {
    signalScores[category] = {};
    for (const subcategory of Object.keys(SIGNAL_KEYWORDS[category])) {
      signalScores[category][subcategory] = 0;
    }
  }
  
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
        display: getDisplayName(category, topSubcategory)
      });
    }
  }
  
  return topByCategory.sort((a, b) => b.score - a.score);
}

/**
 * Generate a natural, friend-like sentence based on the top signals
 */
function generateNaturalSentence(topSignals) {
  if (topSignals.length === 0) {
    return "A local favorite worth discovering.";
  }
  
  const primary = topSignals[0];
  const secondary = topSignals[1];
  
  // Get natural phrasing for signals
  const p = {
    cat: primary.category,
    disp: primary.display,
    isFood: primary.category === 'food_quality',
    isAtmos: primary.category === 'atmosphere',
    isLoc: primary.category === 'location',
    isNature: primary.category === 'nature',
    isCrowd: primary.category === 'crowd'
  };
  
  const s = secondary ? {
    cat: secondary.category,
    disp: secondary.display,
    isFood: secondary.category === 'food_quality',
    isAtmos: secondary.category === 'atmosphere',
    isLoc: secondary.category === 'location',
    isNature: secondary.category === 'nature'
  } : null;
  
  // Build natural sentences based on signal combinations
  // Food + Atmosphere
  if (p.isFood && s?.isAtmos) {
    return pickOne([
      `${capitalize(p.disp)} in a ${s.disp}.`,
      `The kind of place where ${p.disp} meets ${s.disp}.`,
      `You come for the ${p.disp}, you stay for the ${s.disp}.`,
      `${capitalize(p.disp)} with ${s.disp}.`
    ]);
  }
  
  // Food + Location
  if (p.isFood && s?.isLoc) {
    return pickOne([
      `${capitalize(p.disp)} in ${article(s.disp)} ${s.disp}.`,
      `The ${s.disp} spot for ${p.disp}.`,
      `${capitalize(s.disp)} gem serving ${p.disp}.`
    ]);
  }
  
  // Food + Nature
  if (p.isFood && s?.isNature) {
    return pickOne([
      `${capitalize(p.disp)} with ${s.disp}.`,
      `${capitalize(s.disp)} setting, ${p.disp}.`
    ]);
  }
  
  // Atmosphere + Food
  if (p.isAtmos && s?.isFood) {
    return pickOne([
      `${capitalize(s.disp)} in ${article(p.disp)} ${p.disp}.`,
      `${capitalize(p.disp)} spot with ${s.disp}.`,
      `The ${p.disp} kind of place with ${s.disp}.`
    ]);
  }
  
  // Atmosphere + Location
  if (p.isAtmos && s?.isLoc) {
    return pickOne([
      `${capitalize(p.disp)} ${s.disp}.`,
      `${capitalize(p.disp)} and ${s.disp}.`,
      `A ${p.disp} spot in ${article(s.disp)} ${s.disp}.`
    ]);
  }
  
  // Location + Food
  if (p.isLoc && s?.isFood) {
    return pickOne([
      `${capitalize(s.disp)} in ${article(p.disp)} ${p.disp}.`,
      `${capitalize(p.disp)} spot for ${s.disp}.`
    ]);
  }
  
  // Nature + Food
  if (p.isNature && s?.isFood) {
    return pickOne([
      `${capitalize(s.disp)} with ${p.disp}.`,
      `${capitalize(p.disp)} and ${s.disp}.`
    ]);
  }
  
  // Crowd + Food
  if (p.isCrowd && s?.isFood) {
    return pickOne([
      `Where ${p.disp} go for ${s.disp}.`,
      `${capitalize(s.disp)} for the ${p.disp} crowd.`,
      `${capitalize(p.disp)} territory with ${s.disp}.`
    ]);
  }
  
  // Food + Crowd
  if (p.isFood && s?.isCrowd) {
    return pickOne([
      `${capitalize(p.disp)} that draws ${s.disp}.`,
      `${capitalize(s.disp)} love this spot for ${p.disp}.`
    ]);
  }
  
  // Single signal fallbacks - varied and natural
  if (p.isFood) {
    return pickOne([
      `${capitalize(p.disp)} that lives up to the hype.`,
      `Famous for ${p.disp}.`,
      `The ${p.disp} locals keep coming back for.`,
      `${capitalize(p.disp)} worth the trip.`,
      `You come here for the ${p.disp}.`
    ]);
  }
  
  if (p.isAtmos) {
    return pickOne([
      `${capitalize(p.disp)} personified.`,
      `Pure ${p.disp}.`,
      `The ${p.disp} you're looking for.`,
      `${capitalize(p.disp)} — simple as that.`
    ]);
  }
  
  if (p.isLoc) {
    return pickOne([
      `${capitalize(p.disp)} — worth finding.`,
      `The ${p.disp} kind of place.`,
      `${capitalize(p.disp)} and worth the search.`
    ]);
  }
  
  if (p.isNature) {
    return pickOne([
      `${capitalize(p.disp)} — period.`,
      `The ${p.disp} you need.`,
      `${capitalize(p.disp)} that hits different.`
    ]);
  }
  
  if (p.isCrowd) {
    return pickOne([
      `${capitalize(p.disp)} go-to.`,
      `${capitalize(p.disp)} territory.`,
      `Where ${p.disp} hang.`
    ]);
  }
  
  // Generic fallback
  return pickOne([
    `${capitalize(p.disp)} done right.`,
    `A solid choice for ${p.disp}.`,
    `${capitalize(p.disp)} — enough said.`,
    `The ${p.disp} locals whisper about.`
  ]);
}

/**
 * Utility: Pick a random item from array
 */
function pickOne(arr) {
  return arr[Math.floor(Math.random() * arr.length)];
}

/**
 * Utility: Capitalize first letter
 */
function capitalize(str) {
  return str.charAt(0).toUpperCase() + str.slice(1);
}

/**
 * Utility: Get appropriate article
 */
function article(str) {
  const vowels = ['a', 'e', 'i', 'o', 'u'];
  return vowels.includes(str.charAt(0).toLowerCase()) ? 'an' : 'a';
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
    
    if (usedCategories.has(signal.category)) continue;
    
    let tag = signal.display;
    tag = tag.split(' ')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
    
    tags.push(tag);
    usedCategories.add(signal.category);
  }
  
  if (tags.length === 0) {
    tags.push('Local Favorite');
  }
  
  return tags;
}

module.exports = {
  analyzeReviews
};
