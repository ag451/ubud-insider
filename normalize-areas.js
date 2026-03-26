// Normalize area classifications to 6 standard locations
const { Pool } = require('pg');
const pool = new Pool({
  connectionString: 'postgresql://postgres:XZtCObtaOWfmkXhNtOOAvcASQeVhkpxu@centerbeam.proxy.rlwy.net:46202/railway',
  ssl: { rejectUnauthorized: false }
});

// Map existing areas to the 6 standard ones
const areaMapping = {
  'Town Centre': 'Town Centre',
  'Sayan': 'Sayan',
  'North Ubud': 'North Ubud',
  'Nyuh Kuning': 'Nyuh Kuning',
  'Penestanan': 'Penestanan',
  // Mappings to standard areas
  'Campuhan': 'Town Centre',      // Close to town
  'Tjampuan': 'Sayan',            // Near Sayan
  'Sok Subak Wah': 'Penestanan',  // Near Penestanan
  'Jungle': 'North Ubud',         // Generally north
  'Rice Fields': 'Penestanan',    // Typically around Penestanan
  'Rice Terraces': 'North Ubud',  // Tegallang area
  'Tegallang': 'North Ubud',      // North of Ubud
  'Mas': 'Mas',                   // Keep as is (not currently in data)
  'Out of Town': 'North Ubud',    // General out of town -> North Ubud
  'Various': 'Town Centre',       // Default to town centre
  'Canggu': 'Town Centre',        // Not really Ubud but default
  'Mount Batur': 'North Ubud'     // Far north
};

async function normalize() {
  console.log('Normalizing areas to 6 standard locations...\n');
  
  for (const [oldArea, newArea] of Object.entries(areaMapping)) {
    try {
      const result = await pool.query(
        'UPDATE places SET area = $1 WHERE area = $2 RETURNING id, name',
        [newArea, oldArea]
      );
      if (result.rows.length > 0) {
        console.log(`${oldArea} -> ${newArea}: ${result.rows.length} places`);
      }
    } catch (e) {
      console.error(`Error updating ${oldArea}:`, e.message);
    }
  }
  
  // Show final distribution
  console.log('\n--- Final Area Distribution ---');
  const final = await pool.query('SELECT area, COUNT(*) as count FROM places WHERE area IS NOT NULL GROUP BY area ORDER BY count DESC');
  final.rows.forEach(row => {
    console.log(`${row.area}: ${row.count} places`);
  });
  
  await pool.end();
  console.log('\n✅ Done!');
}

normalize();
