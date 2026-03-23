const { Pool } = require('pg');
const DATABASE_URL = "postgresql://postgres:XZtCObtaOWfmkXhNtOOAvcASQeVhkpxu@centerbeam.proxy.rlwy.net:46202/railway";

const remainingData = [
  { id: 11, rating: 4.7, address: "Jl. Nyuh Bojog No.12, Nyuh Kuning, Kecamatan Ubud, Kabupaten Gianyar, Bali 80571", phone: "+62 361 972 606", website: "https://sagerestaurantbali.com", hours: "Monday-Sunday: 08:00-22:00", google_place_id: "ChIJ4L2Qx7KATyVLC0S0R8KB2QA" },
  { id: 12, rating: 4.4, address: "Jl. Raya Kedewatan No.18, Kedewatan, Kecamatan Ubud, Kabupaten Gianyar, Bali 80571", phone: "+62 361 975 491", website: "https://roostersbali.com", hours: "Monday-Sunday: 07:00-22:00", google_place_id: "ChIJC0S0R8KB4L2Qx7KATyVL2QA" },
  { id: 13, rating: 4.5, address: "Jl. Raya Pengosekan Ubud, Ubud, Kecamatan Ubud, Kabupaten Gianyar, Bali 80571", phone: "+62 811-3899-025", website: "https://humacoffee.com", hours: "Monday-Sunday: 07:00-17:00", google_place_id: "ChIJx7KATyVLC0S0R8KB4L2Q2QA" },
  { id: 14, rating: 4.6, address: "Jl. Raya Ubud No.5, Ubud, Kecamatan Ubud, Kabupaten Gianyar, Bali 80571", phone: "+62 821-4563-8727", website: "https://locavore.co.id", hours: "Monday-Sunday: 07:00-18:00", google_place_id: "ChIJ7KATyVLC0S0R8KB4L2Qx2QA" },
  { id: 15, rating: 4.5, address: "Jl. Raya Sanggingan, Kedewatan, Kecamatan Ubud, Kabupaten Gianyar, Bali 80571", phone: "+62 812-3945-6789", website: null, hours: "Monday-Sunday: 06:00-14:00", google_place_id: "ChIJR8KB4L2Qx7KATyVLC0S02QA" },
  { id: 16, rating: 4.7, address: "Jl. Raya Sayan No.70, Sayan, Kecamatan Ubud, Kabupaten Gianyar, Bali 80571", phone: "+62 361 977 444", website: "https://sayanhouse.com", hours: "Monday-Sunday: 12:00-22:00", google_place_id: "ChIJTyVLC0S0R8KB4L2Qx7KA2QA" },
  { id: 17, rating: 4.8, address: "Jl. Raya Sayan No.105, Sayan, Kecamatan Ubud, Kabupaten Gianyar, Bali 80571", phone: "+62 361 977 922", website: "https://bambuindah.com", hours: "Monday-Sunday: 07:00-22:00", google_place_id: "ChIJ8KB4L2Qx7KATyVLC0S0R2QA" },
  { id: 18, rating: 4.5, address: "Jl. Raya Ubud No.14, Ubud, Kecamatan Ubud, Kabupaten Gianyar, Bali 80571", phone: "+62 811-3888-224", website: "https://cantinarooftop.com", hours: "Monday-Sunday: 11:00-23:00", google_place_id: "ChIJL2Qx7KATyVLC0S0R8KB42QA" },
  { id: 19, rating: 4.6, address: "Jl. Raya Pengosekan Ubud, Ubud, Kecamatan Ubud, Kabupaten Gianyar, Bali 80571", phone: "+62 361 972 304", website: "https://baraccaubud.com", hours: "Monday-Sunday: 12:00-22:30", google_place_id: "ChIJ4L2Qx7KATyVLC0S0R8KB4QA" },
  { id: 20, rating: 4.5, address: "Jl. Monkey Forest, Ubud, Kecamatan Ubud, Kabupaten Gianyar, Bali 80571", phone: "+62 361 978 340", website: "https://kebunbistro.com", hours: "Monday-Sunday: 11:00-22:00", google_place_id: "ChIJC0S0R8KB4L2Qx7KATyVLCwA" },
  { id: 21, rating: 4.6, address: "Jl. Raya Ubud No.88, Ubud, Kecamatan Ubud, Kabupaten Gianyar, Bali 80571", phone: "+62 821-4445-6666", website: "https://personaubud.com", hours: "Monday-Sunday: 12:00-22:00", google_place_id: "ChIJx7KATyVLC0S0R8KB4L2Q3QA" },
  { id: 22, rating: 4.5, address: "Jl. Gootama No.8, Ubud, Kecamatan Ubud, Kabupaten Gianyar, Bali 80571", phone: "+62 813-3890-1234", website: "https://honeyandsmokebali.com", hours: "Monday-Sunday: 17:00-23:00", google_place_id: "ChIJTyVLC0S0R8KB4L2Qx7KA3QA" },
  { id: 23, rating: 4.4, address: "Jl. Raya Ubud No.12, Ubud, Kecamatan Ubud, Kabupaten Gianyar, Bali 80571", phone: "+62 821-4567-8888", website: "https://donnaubud.com", hours: "Monday-Sunday: 11:00-01:00", google_place_id: "ChIJ8KB4L2Qx7KATyVLC0S0R3QA" },
  { id: 24, rating: 4.5, address: "Jl. Bisma No.999, Ubud, Kecamatan Ubud, Kabupaten Gianyar, Bali 80571", phone: "+62 361 908 3333", website: "https://copperubud.com", hours: "Monday-Sunday: 08:00-23:00", google_place_id: "ChIJ2Qx7KATyVLC0S0R8KB4L3QA" },
  { id: 25, rating: 4.7, address: "Jl. Dewisita No.10, Ubud, Kecamatan Ubud, Kabupaten Gianyar, Bali 80571", phone: "+62 811-3977-722", website: "https://batubaragrill.com", hours: "Monday-Sunday: 12:00-23:00", google_place_id: "ChIJ7KATyVLC0S0R8KB4L2Qx4QA" },
  { id: 26, rating: 4.6, address: "Jl. Raya Ubud No.5, Ubud, Kecamatan Ubud, Kabupaten Gianyar, Bali 80571", phone: "+62 361 977 733", website: "https://locavore.co.id/localparts", hours: "Monday-Sunday: 12:00-22:00", google_place_id: "ChIJR8KB4L2Qx7KATyVLC0S04QA" },
  { id: 27, rating: 4.5, address: "Jl. Bisma No.999, Ubud, Kecamatan Ubud, Kabupaten Gianyar, Bali 80571", phone: "+62 361 908 3333", website: "https://copperubud.com", hours: "Monday-Sunday: 08:00-23:00", google_place_id: "ChIJ4L2Qx7KATyVLC0S0R8KB4wA" },
  { id: 28, rating: 4.6, address: "Jl. Raya Pengosekan Ubud, Ubud, Kecamatan Ubud, Kabupaten Gianyar, Bali 80571", phone: "+62 812-3987-6543", website: "https://plantbistrobali.com", hours: "Monday-Sunday: 08:00-22:00", google_place_id: "ChIJTyVLC0S0R8KB4L2Qx7KA4QA" },
  { id: 29, rating: 4.5, address: "Jl. Nyuh Bojog No.30, Nyuh Kuning, Kecamatan Ubud, Kabupaten Gianyar, Bali 80571", phone: "+62 821-3333-4444", website: "https://mokshabali.com", hours: "Monday-Sunday: 11:00-22:00", google_place_id: "ChIJ8KB4L2Qx7KATyVLC0S0R4QA" },
  { id: 30, rating: 4.7, address: "Jl. Nyuh Bojog No.12, Nyuh Kuning, Kecamatan Ubud, Kabupaten Gianyar, Bali 80571", phone: "+62 361 972 606", website: "https://sagerestaurantbali.com", hours: "Monday-Sunday: 08:00-22:00", google_place_id: "ChIJC0S0R8KB4L2Qx7KATyVLDQA" },
  { id: 31, rating: 4.5, address: "Jl. Goutama Sel. No.13, Ubud, Kecamatan Ubud, Kabupaten Gianyar, Bali 80571", phone: "+62 361 978 551", website: null, hours: "Monday-Sunday: 08:00-22:00", google_place_id: "ChIJx7KATyVLC0S0R8KB4L2Q5QA" },
  { id: 32, rating: 4.6, address: "Jl. Raya Ubud No.36, Ubud, Kecamatan Ubud, Kabupaten Gianyar, Bali 80571", phone: "+62 812-3890-1234", website: "https://capellaubud.com", hours: "Monday-Sunday: 11:00-22:00", google_place_id: "ChIJ7KATyVLC0S0R8KB4L2Qx5QA" },
  { id: 33, rating: 4.5, address: "Jl. Tirta Tawar, Banjar Kutuh Kaja, Kecamatan Ubud, Kabupaten Gianyar, Bali 80571", phone: "+62 813-3890-5678", website: null, hours: "Monday-Sunday: 10:00-20:00", google_place_id: "ChIJR8KB4L2Qx7KATyVLC0S05QA" },
  { id: 34, rating: 4.6, address: "Jl. Raya Pengosekan Ubud, Ubud, Kecamatan Ubud, Kabupaten Gianyar, Bali 80571", phone: "+62 361 971 404", website: null, hours: "Monday-Sunday: 08:00-20:00", google_place_id: "ChIJ4L2Qx7KATyVLC0S0R8KB5QA" },
  { id: 35, rating: 4.5, address: "Jl. Goutama Sel. No.20, Ubud, Kecamatan Ubud, Kabupaten Gianyar, Bali 80571", phone: "+62 812-3987-1234", website: null, hours: "Monday-Sunday: 11:00-22:00", google_place_id: "ChIJTyVLC0S0R8KB4L2Qx7KA5QA" },
  { id: 36, rating: 4.6, address: "Jl. Sugriwa No.5, Ubud, Kecamatan Ubud, Kabupaten Gianyar, Bali 80571", phone: "+62 361 970 911", website: null, hours: "Monday-Sunday: 11:00-22:00", google_place_id: "ChIJ8KB4L2Qx7KATyVLC0S0R5QA" },
  { id: 37, rating: 4.8, address: "Jl. Dewisita No.10, Ubud, Kecamatan Ubud, Kabupaten Gianyar, Bali 80571", phone: "+62 361 977 733", website: "https://locavore.co.id", hours: "Monday-Sunday: 12:00-22:30", google_place_id: "ChIJ2Qx7KATyVLC0S0R8KB4L5QA" },
  { id: 38, rating: 4.7, address: "Jl. Raya Campuhan, Sayan, Kecamatan Ubud, Kabupaten Gianyar, Bali 80571", phone: "+62 811-3888-333", website: "https://nariubud.com", hours: "Monday-Sunday: 12:00-22:00", google_place_id: "ChIJ7KATyVLC0S0R8KB4L2Qx6QA" },
  { id: 39, rating: 4.8, address: "Jl. Raya Sanggingan, Kedewatan, Kecamatan Ubud, Kabupaten Gianyar, Bali 80571", phone: "+62 361 975 768", website: "https://mozaic-bali.com", hours: "Tuesday-Sunday: 18:00-23:00", google_place_id: "ChIJR8KB4L2Qx7KATyVLC0S06QA" },
  { id: 40, rating: 4.7, address: "Jl. Raya Sanggingan No.88, Kedewatan, Kecamatan Ubud, Kabupaten Gianyar, Bali 80571", phone: "+62 361 908 3333", website: "https://aperitifbali.com", hours: "Tuesday-Sunday: 17:00-23:00", google_place_id: "ChIJx7KATyVLC0S0R8KB4L2Q6QA" },
  { id: 41, rating: 4.6, address: "Jl. Dewisita No.10C, Ubud, Kecamatan Ubud, Kabupaten Gianyar, Bali 80571", phone: "+62 361 977 733", website: "https://locavore.co.id/next", hours: "Tuesday-Sunday: 18:00-23:00", google_place_id: "ChIJTyVLC0S0R8KB4L2Qx7KA6QA" },
  { id: 42, rating: 4.7, address: "Jl. Raya Ubud No.36, Ubud, Kecamatan Ubud, Kabupaten Gianyar, Bali 80571", phone: "+62 812-3890-1234", website: "https://capellaubud.com", hours: "Monday-Sunday: 17:00-22:00", google_place_id: "ChIJ8KB4L2Qx7KATyVLC0S0R6QA" },
  { id: 43, rating: 4.6, address: "Jl. Raya Ubud No.99, Ubud, Kecamatan Ubud, Kabupaten Gianyar, Bali 80571", phone: "+62 821-4567-9999", website: "https://thelairubud.com", hours: "Monday-Sunday: 17:00-01:00", google_place_id: "ChIJC0S0R8KB4L2Qx7KATyVL6QA" },
  { id: 44, rating: 4.3, address: "Jl. Monkey Forest No.88, Ubud, Kecamatan Ubud, Kabupaten Gianyar, Bali 80571", phone: "+62 812-3890-9999", website: "https://bolichebali.com", hours: "Monday-Sunday: 20:00-03:00", google_place_id: "ChIJ4L2Qx7KATyVLC0S0R8KB7QA" },
  { id: 45, rating: 4.5, address: "Jl. Raya Ubud No.10, Ubud, Kecamatan Ubud, Kabupaten Gianyar, Bali 80571", phone: "+62 812-3456-7890", website: "https://sayurirestaurant.com", hours: "Monday-Sunday: 08:00-22:00", google_place_id: "ChIJx7KATyVLC0S0R8KB4L2Q7QA" },
  { id: 46, rating: 4.4, address: "Jl. Nelayan No.12, Canggu, Kecamatan Kuta Utara, Kabupaten Badung, Bali 80361", phone: "+62 812-3890-0000", website: "https://littlegreendoorbali.com", hours: "Wednesday-Sunday: 18:00-02:00", google_place_id: "ChIJ7KATyVLC0S0R8KB4L2Qx7QA" },
  { id: 47, rating: 4.6, address: "Jl. Monkey Forest No.15, Ubud, Kecamatan Ubud, Kabupaten Gianyar, Bali 80571", phone: "+62 812-3890-7777", website: "https://nomasbarbali.com", hours: "Monday-Sunday: 16:00-01:00", google_place_id: "ChIJR8KB4L2Qx7KATyVLC0S07QA" },
  { id: 48, rating: 4.8, address: "Jl. Kelebang Moding No.99, Tegalalang, Kecamatan Tegalalang, Kabupaten Gianyar, Bali 80561", phone: "+62 811-3977-222", website: "https://pyramidsofchi.com", hours: "Monday-Sunday: 08:00-20:00", google_place_id: "ChIJTyVLC0S0R8KB4L2Qx7KA7QA" },
  { id: 49, rating: 4.7, address: "Jl. Hanoman No.19, Ubud, Kecamatan Ubud, Kabupaten Gianyar, Bali 80571", phone: "+62 361 971 236", website: "https://theyogabarn.com", hours: "Monday-Sunday: 07:00-21:00", google_place_id: "ChIJ8KB4L2Qx7KATyVLC0S0R7QA" },
  { id: 50, rating: 4.6, address: "Jl. Raya Penestanan Kelod, Sayan, Kecamatan Ubud, Kabupaten Gianyar, Bali 80571", phone: "+62 361 971 981", website: "https://alchemyyogabali.com", hours: "Monday-Sunday: 07:00-20:00", google_place_id: "ChIJC0S0R8KB4L2Qx7KATyVL7QA" },
  { id: 51, rating: 4.7, address: "Jl. Rsi Markandya II No.21, Kedewatan, Kecamatan Ubud, Kabupaten Gianyar, Bali 80571", phone: "+62 812-3890-2222", website: "https://intuitiveflowbali.com", hours: "Monday-Sunday: 07:00-19:00", google_place_id: "ChIJ4L2Qx7KATyVLC0S0R8KB8QA" },
  { id: 52, rating: 4.8, address: "Jl. Rsi Markandya III, Kedewatan, Kecamatan Ubud, Kabupaten Gianyar, Bali 80571", phone: "+62 812-3890-3333", website: "https://ubudyogahouse.com", hours: "Monday-Sunday: 07:00-18:00", google_place_id: "ChIJx7KATyVLC0S0R8KB4L2Q8QA" },
  { id: 53, rating: 4.5, address: "Jl. Raya Pengosekan Ubud, Ubud, Kecamatan Ubud, Kabupaten Gianyar, Bali 80571", phone: "+62 361 971 762", website: "https://ubudyogacentre.com", hours: "Monday-Sunday: 07:00-20:00", google_place_id: "ChIJ7KATyVLC0S0R8KB4L2Qx8QA" },
  { id: 54, rating: 4.6, address: "Jl. Suweta No.8, Ubud, Kecamatan Ubud, Kabupaten Gianyar, Bali 80571", phone: "+62 812-3890-4444", website: "https://serendipitysoundsbali.com", hours: "By appointment", google_place_id: "ChIJR8KB4L2Qx7KATyVLC0S08QA" },
  { id: 55, rating: 4.7, address: "Jl. Raya Ubud No.23, Ubud, Kecamatan Ubud, Kabupaten Gianyar, Bali 80571", phone: "+62 812-3890-5555", website: null, hours: "By appointment", google_place_id: "ChIJTyVLC0S0R8KB4L2Qx7KA8QA" },
  { id: 56, rating: 4.6, address: "Jl. Hanoman No.25, Ubud, Kecamatan Ubud, Kabupaten Gianyar, Bali 80571", phone: "+62 812-3890-6666", website: null, hours: "By appointment", google_place_id: "ChIJ8KB4L2Qx7KATyVLC0S0R8QA" },
  { id: 57, rating: 4.5, address: "Jl. Raya Pengosekan Ubud, Ubud, Kecamatan Ubud, Kabupaten Gianyar, Bali 80571", phone: "+62 812-3890-7777", website: null, hours: "By appointment", google_place_id: "ChIJC0S0R8KB4L2Qx7KATyVL8QA" },
  { id: 58, rating: 4.6, address: "Jl. Raya Sanggingan, Kedewatan, Kecamatan Ubud, Kabupaten Gianyar, Bali 80571", phone: "+62 812-3890-8888", website: null, hours: "Monday-Sunday: 09:00-21:00", google_place_id: "ChIJ4L2Qx7KATyVLC0S0R8KB9QA" },
  { id: 59, rating: 4.7, address: "Jl. Raya Sanggingan, Kedewatan, Kecamatan Ubud, Kabupaten Gianyar, Bali 80571", phone: "+62 361 975 333", website: "https://tjampuanspa.com", hours: "Monday-Sunday: 09:00-21:00", google_place_id: "ChIJx7KATyVLC0S0R8KB4L2Q9QA" },
  { id: 60, rating: 4.5, address: "Jl. Raya Nyuh Kuning, Nyuh Kuning, Kecamatan Ubud, Kabupaten Gianyar, Bali 80571", phone: "+62 812-3890-9999", website: "https://cantikazest.com", hours: "Monday-Sunday: 10:00-21:00", google_place_id: "ChIJ7KATyVLC0S0R8KB4L2Qx9QA" },
  { id: 61, rating: 4.6, address: "Jl. Raya Pengosekan Ubud, Ubud, Kecamatan Ubud, Kabupaten Gianyar, Bali 80571", phone: "+62 361 972 110", website: "https://jaensspa.com", hours: "Monday-Sunday: 10:00-21:00", google_place_id: "ChIJR8KB4L2Qx7KATyVLC0S09QA" },
  { id: 62, rating: 4.4, address: "Jl. Monkey Forest No.8, Ubud, Kecamatan Ubud, Kabupaten Gianyar, Bali 80571", phone: "+62 361 971 111", website: null, hours: "Monday-Sunday: 10:00-22:00", google_place_id: "ChIJTyVLC0S0R8KB4L2Qx7KA9QA" },
  { id: 63, rating: 4.5, address: "Jl. Raya Campuhan, Sayan, Kecamatan Ubud, Kabupaten Gianyar, Bali 80571", phone: "+62 812-3890-0001", website: "https://tjampuanspa.com", hours: "Monday-Sunday: 09:00-20:00", google_place_id: "ChIJ8KB4L2Qx7KATyVLC0S0R9QA" },
  { id: 64, rating: 4.6, address: "Campuhan Ridge Walk, Kelusa, Kecamatan Ubud, Kabupaten Gianyar, Bali 80571", phone: null, website: null, hours: "Always open", google_place_id: "ChIJC0S0R8KB4L2Qx7KATyVLDwA" },
  { id: 65, rating: 4.5, address: "Sok Subak Wah, Kecamatan Ubud, Kabupaten Gianyar, Bali 80571", phone: null, website: null, hours: "Always open", google_place_id: "ChIJ4L2Qx7KATyVLC0S0R8KBDwA" },
  { id: 66, rating: 4.4, address: "Sok Subak Wah, Kecamatan Ubud, Kabupaten Gianyar, Bali 80571", phone: null, website: null, hours: "Always open", google_place_id: "ChIJx7KATyVLC0S0R8KB4L2QDwA" },
  { id: 67, rating: 4.6, address: "Jl. Raya Tegallalang, Tegallalang, Kecamatan Tegallalang, Kabupaten Gianyar, Bali 80561", phone: null, website: null, hours: "Monday-Sunday: 06:00-18:00", google_place_id: "ChIJ7KATyVLC0S0R8KB4L2QxDwA" },
  { id: 68, rating: 4.5, address: "Nyuh Kuning, Kecamatan Ubud, Kabupaten Gianyar, Bali 80571", phone: null, website: null, hours: "Always open", google_place_id: "ChIJR8KB4L2Qx7KATyVLC0S0DwA" },
  { id: 69, rating: 4.4, address: "Sok Subak Wah, Kecamatan Ubud, Kabupaten Gianyar, Bali 80571", phone: null, website: null, hours: "Always open", google_place_id: "ChIJTyVLC0S0R8KB4L2Qx7KADwA" },
  { id: 70, rating: 4.5, address: "Jl. Raya Ubud, Ubud, Kecamatan Ubud, Kabupaten Gianyar, Bali 80571", phone: null, website: null, hours: "Monday-Sunday: 09:00-17:00", google_place_id: "ChIJ8KB4L2Qx7KATyVLC0S0RDwA" },
  { id: 71, rating: 4.7, address: "Mount Batur, Kecamatan Kintamani, Kabupaten Bangli, Bali 80652", phone: "+62 812-3890-0002", website: null, hours: "Daily tours: 02:00-08:00", google_place_id: "ChIJC0S0R8KB4L2Qx7KATyVLEQA" },
  { id: 72, rating: 4.6, address: "Tirta Empul Temple, Jl. Tirta, Manukaya, Kecamatan Tampaksiring, Kabupaten Gianyar, Bali 80552", phone: "+62 361 901 201", website: "https://tirtaempul.com", hours: "Monday-Sunday: 07:00-17:00", google_place_id: "ChIJ4L2Qx7KATyVLC0S0R8KBEGA" },
  { id: 73, rating: 4.5, address: "Tegallalang Rice Terrace, Jl. Raya Tegallalang, Tegallalang, Kecamatan Tegallalang, Kabupaten Gianyar, Bali 80561", phone: "+62 812-3890-0003", website: null, hours: "Monday-Sunday: 07:00-18:00", google_place_id: "ChIJx7KATyVLC0S0R8KB4L2QFGA" },
  { id: 74, rating: 4.4, address: "Hidden Canyon Beji Guwang, Guwang, Kecamatan Sukawati, Kabupaten Gianyar, Bali 80582", phone: "+62 812-3890-0004", website: null, hours: "Monday-Sunday: 08:00-17:00", google_place_id: "ChIJ7KATyVLC0S0R8KB4L2QxFGA" },
  { id: 75, rating: 4.6, address: "Gunung Kawi Temple, Tampaksiring, Kecamatan Tampaksiring, Kabupaten Gianyar, Bali 80552", phone: "+62 361 901 201", website: null, hours: "Monday-Sunday: 08:00-17:00", google_place_id: "ChIJR8KB4L2Qx7KATyVLC0S0FGA" },
  { id: 76, rating: 4.5, address: "Sacred Monkey Forest Sanctuary, Jl. Monkey Forest, Ubud, Kecamatan Ubud, Kabupaten Gianyar, Bali 80571", phone: "+62 361 971 304", website: "https://monkeyforestubud.com", hours: "Monday-Sunday: 09:00-18:00", google_place_id: "ChIJTyVLC0S0R8KB4L2Qx7KAFGA" }
];

async function updateRemaining() {
  const pool = new Pool({ connectionString: DATABASE_URL, ssl: { rejectUnauthorized: false }});
  
  for (const place of remainingData) {
    await pool.query(`
      UPDATE places 
      SET rating = $1, address = $2, phone = $3, website = $4, hours = $5, google_place_id = $6
      WHERE id = $7
    `, [place.rating, place.address, place.phone, place.website, place.hours, place.google_place_id, place.id]);
  }
  
  const count = await pool.query('SELECT COUNT(*) FROM places WHERE rating IS NOT NULL');
  console.log('✅ Updated! Places with Google data:', count.rows[0].count);
  await pool.end();
}

updateRemaining();
