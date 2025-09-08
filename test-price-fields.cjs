const { Pool } = require('pg');
require('dotenv').config();

async function testPriceFields() {
  const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
  });

  try {
    console.log('🔍 Testing price policy fields in database...');
    
    // Проверяем структуру таблицы
    const tableInfo = await pool.query(`
      SELECT column_name, data_type, is_nullable, column_default
      FROM information_schema.columns 
      WHERE table_name = 'clinics' 
      AND column_name IN (
        'published_pricing', 'free_consultation', 'interest_free_installment',
        'implant_warranty', 'popular_services_promotions', 'online_price_calculator'
      )
      ORDER BY column_name
    `);

    console.log('📊 Price policy fields in database:');
    tableInfo.rows.forEach(row => {
      console.log(`  - ${row.column_name}: ${row.data_type} (nullable: ${row.is_nullable}, default: ${row.column_default})`);
    });

    // Проверяем данные клиник
    const clinicsData = await pool.query(`
      SELECT 
        id,
        name_ru,
        published_pricing,
        free_consultation,
        interest_free_installment,
        implant_warranty,
        popular_services_promotions,
        online_price_calculator,
        price_index
      FROM clinics
      ORDER BY name_ru
    `);

    console.log('\n📊 Clinics price policy data:');
    clinicsData.rows.forEach(clinic => {
      console.log(`\n🏥 ${clinic.name_ru}:`);
      console.log(`  - published_pricing: ${clinic.published_pricing}`);
      console.log(`  - free_consultation: ${clinic.free_consultation}`);
      console.log(`  - interest_free_installment: ${clinic.interest_free_installment}`);
      console.log(`  - implant_warranty: ${clinic.implant_warranty}`);
      console.log(`  - popular_services_promotions: ${clinic.popular_services_promotions}`);
      console.log(`  - online_price_calculator: ${clinic.online_price_calculator}`);
      console.log(`  - price_index: ${clinic.price_index}`);
    });

  } catch (error) {
    console.error('❌ Error testing price fields:', error);
  } finally {
    await pool.end();
  }
}

testPriceFields();






