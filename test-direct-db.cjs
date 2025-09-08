const { Pool } = require('pg');
require('dotenv').config();

async function testDirectDB() {
  const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
  });

  try {
    console.log('🔍 Testing direct database access...');
    
    // Проверяем данные клиники напрямую
    const clinicData = await pool.query(`
      SELECT 
        id,
        name_ru,
        published_pricing,
        free_consultation,
        interest_free_installment,
        implant_warranty,
        popular_services_promotions,
        online_price_calculator,
        price_index,
        access_index,
        online_booking,
        weekend_work,
        evening_work,
        urgent_care,
        convenient_location
      FROM clinics 
      WHERE id = '50700388-9022-46bf-ace0-8e2335b744bb'
    `);

    if (clinicData.rows.length > 0) {
      const clinic = clinicData.rows[0];
      console.log('\n📊 Clinic data from database:');
      console.log(`🏥 ${clinic.name_ru}:`);
      console.log('  Price Policy fields:');
      console.log(`    - published_pricing: ${clinic.published_pricing}`);
      console.log(`    - free_consultation: ${clinic.free_consultation}`);
      console.log(`    - interest_free_installment: ${clinic.interest_free_installment}`);
      console.log(`    - implant_warranty: ${clinic.implant_warranty}`);
      console.log(`    - popular_services_promotions: ${clinic.popular_services_promotions}`);
      console.log(`    - online_price_calculator: ${clinic.online_price_calculator}`);
      console.log(`    - price_index: ${clinic.price_index}`);
      
      console.log('  Access fields:');
      console.log(`    - online_booking: ${clinic.online_booking}`);
      console.log(`    - weekend_work: ${clinic.weekend_work}`);
      console.log(`    - evening_work: ${clinic.evening_work}`);
      console.log(`    - urgent_care: ${clinic.urgent_care}`);
      console.log(`    - convenient_location: ${clinic.convenient_location}`);
      console.log(`    - access_index: ${clinic.access_index}`);
    }

    // Тестируем обновление поля
    console.log('\n🔧 Testing field update...');
    await pool.query(`
      UPDATE clinics 
      SET published_pricing = true 
      WHERE id = '50700388-9022-46bf-ace0-8e2335b744bb'
    `);
    
    console.log('✅ Updated published_pricing to true');
    
    // Проверяем результат
    const updatedData = await pool.query(`
      SELECT published_pricing FROM clinics 
      WHERE id = '50700388-9022-46bf-ace0-8e2335b744bb'
    `);
    
    console.log(`📊 After update - published_pricing: ${updatedData.rows[0].published_pricing}`);

  } catch (error) {
    console.error('❌ Error testing database:', error);
  } finally {
    await pool.end();
  }
}

testDirectDB();






