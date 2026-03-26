// Update fitness places with correct addresses
const { Pool } = require('pg');
const pool = new Pool({
  connectionString: 'postgresql://postgres:XZtCObtaOWfmkXhNtOOAvcASQeVhkpxu@centerbeam.proxy.rlwy.net:46202/railway',
  ssl: { rejectUnauthorized: false }
});

const correctAddresses = [
  { 
    id: 82, 
    name: 'Titi Batu Club',
    address: 'Jl. Cempaka, Banjar Kumbuh, Mas, Kecamatan Ubud, Kabupaten Gianyar, Bali 80571, Indonesia',
    area: 'Mas'
  },
  { 
    id: 83, 
    name: 'Gymnasium',
    address: 'Jl. Sri Wedari No.24, Tegallalang, Kecamatan Ubud, Kabupaten Gianyar, Bali 80571, Indonesia',
    area: 'North Ubud'
  },
  { 
    id: 84, 
    name: 'Bali Eden',
    address: 'Jl. Cempaka, Banjar Kumbuh, Mas, Kecamatan Ubud, Kabupaten Gianyar, Bali 80571, Indonesia',
    area: 'Mas'
  },
  { 
    id: 85, 
    name: 'Rendez Fitness',
    address: 'Jl. Sri Wedari No.83, Banjar Junjungan, Kecamatan Ubud, Kabupaten Gianyar, Bali 80571, Indonesia',
    area: 'North Ubud'
  },
  { 
    id: 86, 
    name: 'Ubud Cross Fit',
    address: 'Jl. Anak Agung Gede Rai, Lodtunduh, Kecamatan Ubud, Kabupaten Gianyar, Bali 80571, Indonesia',
    area: 'North Ubud'
  }
];

async function update() {
  console.log('Updating fitness places with correct addresses...\n');
  
  for (const place of correctAddresses) {
    try {
      await pool.query(
        'UPDATE places SET address = $1, area = $2 WHERE id = $3',
        [place.address, place.area, place.id]
      );
      console.log(`✅ ${place.name}`);
      console.log(`   ${place.address}\n`);
    } catch (e) {
      console.error(`❌ ${place.name}: ${e.message}\n`);
    }
  }
  
  await pool.end();
  console.log('Done!');
}

update();
