const { Pool } = require('pg');
require('dotenv').config();

async function addPriceTypeMigration() {
  const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
  });

  try {
    console.log('🔍 Starting priceType migration...');
    
    // Add priceType column to services table
    await pool.query(`
      ALTER TABLE services ADD COLUMN IF NOT EXISTS price_type VARCHAR NOT NULL DEFAULT 'fixed';
    `);
    
    // Add comment to explain the field
    await pool.query(`
      COMMENT ON COLUMN services.price_type IS 'Type of price: "fixed" for exact price, "from" for minimum price';
    `);
    
    console.log('✅ Migration completed successfully!');
    
  } catch (error) {
    console.error('❌ Migration failed:', error);
  } finally {
    await pool.end();
  }
}

addPriceTypeMigration();






