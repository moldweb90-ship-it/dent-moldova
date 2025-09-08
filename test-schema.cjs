const { Pool } = require('pg');
require('dotenv').config();

async function testSchema() {
  const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
  });

  try {
    console.log('🔍 Testing Drizzle schema...');
    
    // Проверяем все поля таблицы clinics
    const tableInfo = await pool.query(`
      SELECT column_name, data_type, is_nullable, column_default
      FROM information_schema.columns 
      WHERE table_name = 'clinics' 
      AND column_name LIKE '%pricing%' OR column_name LIKE '%consultation%' OR column_name LIKE '%installment%' OR column_name LIKE '%warranty%' OR column_name LIKE '%promotion%' OR column_name LIKE '%calculator%'
      ORDER BY column_name
    `);

    console.log('📊 Price policy related fields in database:');
    tableInfo.rows.forEach(row => {
      console.log(`  - ${row.column_name}: ${row.data_type} (nullable: ${row.is_nullable}, default: ${row.column_default})`);
    });

    // Проверяем данные одной клиники
    const clinicData = await pool.query(`
      SELECT * FROM clinics WHERE id = '50700388-9022-46bf-ace0-8e2335b744bb'
    `);

    if (clinicData.rows.length > 0) {
      const clinic = clinicData.rows[0];
      console.log('\n📊 All clinic fields:');
      Object.keys(clinic).forEach(key => {
        if (key.includes('pricing') || key.includes('consultation') || key.includes('installment') || key.includes('warranty') || key.includes('promotion') || key.includes('calculator')) {
          console.log(`  - ${key}: ${clinic[key]}`);
        }
      });
    }

  } catch (error) {
    console.error('❌ Error testing schema:', error);
  } finally {
    await pool.end();
  }
}

testSchema();






