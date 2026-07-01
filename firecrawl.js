// Firecrawl integration - pulls a short description for a place from the web.
// Uses the place's website when available, otherwise searches for the place,
// then scrapes an AI summary. Requires the FIRECRAWL_API_KEY environment variable.
const https = require('https');

const FIRECRAWL_API_KEY = process.env.FIRECRAWL_API_KEY || '';
const FIRECRAWL_HOST = 'api.firecrawl.dev';

function isConfigured() {
  return !!FIRECRAWL_API_KEY;
}

// Minimal JSON POST helper against the Firecrawl API.
function firecrawlPost(path, body) {
  return new Promise((resolve, reject) => {
    const payload = JSON.stringify(body);
    const req = https.request({
      hostname: FIRECRAWL_HOST,
      path,
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${FIRECRAWL_API_KEY}`,
        'Content-Length': Buffer.byteLength(payload)
      }
    }, (res) => {
      let data = '';
      res.on('data', (chunk) => { data += chunk; });
      res.on('end', () => {
        let parsed = null;
        try { parsed = JSON.parse(data); } catch (e) { /* non-JSON */ }
        if (res.statusCode >= 400) {
          const msg = (parsed && (parsed.error || parsed.message)) || `Firecrawl HTTP ${res.statusCode}`;
          reject(new Error(msg));
        } else if (!parsed) {
          reject(new Error('Firecrawl returned a non-JSON response'));
        } else {
          resolve(parsed);
        }
      });
    });
    req.on('error', reject);
    req.setTimeout(60000, () => req.destroy(new Error('Firecrawl request timed out')));
    req.write(payload);
    req.end();
  });
}

// Collapse whitespace and cap to a couple of sentences for a tidy card/modal description.
function tidyDescription(text) {
  if (!text) return '';
  let t = String(text).replace(/\s+/g, ' ').trim();
  if (t.length <= 320) return t;
  // Prefer cutting at a sentence boundary within the limit.
  const cut = t.slice(0, 320);
  const lastStop = Math.max(cut.lastIndexOf('. '), cut.lastIndexOf('! '), cut.lastIndexOf('? '));
  t = lastStop > 120 ? cut.slice(0, lastStop + 1) : cut.trim() + '…';
  return t.trim();
}

async function searchTopResult(query) {
  const json = await firecrawlPost('/v2/search', { query, limit: 3 });
  // v2 groups results (e.g. { data: { web: [...] } }); older/simple shapes return an array.
  let results = [];
  if (Array.isArray(json.data)) results = json.data;
  else if (json.data && Array.isArray(json.data.web)) results = json.data.web;
  else if (Array.isArray(json.results)) results = json.results;
  const first = results.find((r) => r && r.url);
  return first ? { url: first.url, description: first.description || '' } : null;
}

async function scrapeSummary(url) {
  const json = await firecrawlPost('/v2/scrape', {
    url,
    formats: ['summary'],
    onlyMainContent: true
  });
  const d = json.data || {};
  return (d.summary || (d.metadata && d.metadata.description) || '').trim();
}

// Returns { description, source_url } for a place, or throws with a clear message.
async function fetchPlaceDescription(place) {
  if (!isConfigured()) {
    throw new Error('FIRECRAWL_API_KEY not configured');
  }

  let url = (place.website && /^https?:\/\//i.test(place.website)) ? place.website : null;
  let searchDescription = '';

  if (!url) {
    const query = `${place.name}, ${place.area || 'Ubud'}, Bali`;
    const found = await searchTopResult(query);
    if (found) {
      url = found.url;
      searchDescription = found.description || '';
    }
  }

  if (!url) {
    throw new Error('No source URL found for this place');
  }

  let summary = '';
  try {
    summary = await scrapeSummary(url);
  } catch (e) {
    // Fall back to the search snippet if scraping the page fails.
    summary = '';
  }

  const description = tidyDescription(summary || searchDescription);
  if (!description) {
    throw new Error('No description could be extracted');
  }

  return { description, source_url: url };
}

module.exports = {
  isConfigured,
  fetchPlaceDescription,
  tidyDescription
};
