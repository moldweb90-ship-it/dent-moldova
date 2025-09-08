const { Pool } = require('pg');

const pool = new Pool({
  connectionString: process.env.DATABASE_URL || 'postgresql://postgres:password@localhost:5432/postgres'
});

async function addContactMethod() {
  try {
    const client = await pool.connect();
    
    // Проверяем, существует ли колонка
    const checkResult = await client.query(`
      SELECT column_name 
      FROM information_schema.columns 
      WHERE table_name = 'bookings' AND column_name = 'contact_method'
    `);
    
    if (checkResult.rows.length === 0) {
      // Добавляем колонку
      await client.query('ALTER TABLE bookings ADD COLUMN contact_method VARCHAR');
      console.log('Колонка contact_method успешно добавлена');
    } else {
      console.log('Колонка contact_method уже существует');
    }
    
    client.release();
  } catch (error) {
    console.error('Ошибка при добавлении колонки:', error);
  } finally {
    await pool.end();
  }
}

addContactMethod();
