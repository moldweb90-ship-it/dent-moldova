const { Pool } = require('pg');

const pool = new Pool({
  connectionString: process.env.DATABASE_URL || 'postgresql://postgres:password@localhost:5432/clinics'
});

async function checkWorkingHours() {
  try {
    const client = await pool.connect();
    
    // Получаем клинику Life Dental Чеканы
    const clinicResult = await client.query(
      'SELECT * FROM clinics WHERE id = $1',
      ['50700388-9022-46bf-ace0-8e2335b744bb']
    );
    
    console.log('Клиника:', clinicResult.rows[0]?.name);
    
    // Получаем рабочие часы
    const workingHoursResult = await client.query(
      'SELECT * FROM "workingHours" WHERE "clinicId" = $1 ORDER BY "dayOfWeek"',
      ['50700388-9022-46bf-ace0-8e2335b744bb']
    );
    
    console.log('Рабочие часы:');
    workingHoursResult.rows.forEach(wh => {
      console.log(`День ${wh.dayOfWeek}: ${wh.isOpen ? 'Открыто' : 'Закрыто'} ${wh.openTime}-${wh.closeTime}`);
    });
    
    client.release();
  } catch (error) {
    console.error('Ошибка:', error);
  } finally {
    await pool.end();
  }
}

checkWorkingHours();
