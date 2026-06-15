// Shared helper: resolve the PostgreSQL connection string from the environment.
// Never hardcode credentials in source. Set DATABASE_URL (e.g. from Railway) before
// running any of the maintenance/import scripts.
require('dotenv').config();

function getDatabaseUrl() {
  const url = process.env.DATABASE_URL;
  if (!url) {
    console.error('❌ DATABASE_URL is not set.');
    console.error('   Set it before running this script, e.g.:');
    console.error('   export DATABASE_URL="postgresql://user:pass@host:port/db"');
    process.exit(1);
  }
  return url;
}

module.exports = { getDatabaseUrl };
