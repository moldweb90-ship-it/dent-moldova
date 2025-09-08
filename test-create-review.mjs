import Database from 'better-sqlite3';

async function testCreateReview() {
  try {
    console.log('🔍 Тестируем создание отзыва...');
    
    const sqlite = new Database('dev.db');
    
    // Получаем первую клинику
    const clinic = sqlite.prepare('SELECT id, name_ru FROM clinics LIMIT 1').get();
    
    if (!clinic) {
      console.log('❌ Клиники не найдены');
      sqlite.close();
      return;
    }
    
    console.log(`📋 Найдена клиника: ${clinic.name_ru} (ID: ${clinic.id})`);
    
    // Создаем тестовый отзыв
    const reviewData = {
      id: 'test-review-' + Date.now(),
      clinic_id: clinic.id,
      author_name: 'Test User',
      author_email: 'test@example.com',
      quality_rating: 4.5,
      service_rating: 4.0,
      comfort_rating: 3.5,
      price_rating: 4.0,
      average_rating: 4.0,
      comment: 'Тестовый отзыв для проверки системы',
      status: 'pending',
      ip_address: '127.0.0.1',
      user_agent: 'Test Script',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };
    
    const insertSQL = `
      INSERT INTO reviews (
        id, clinic_id, author_name, author_email, quality_rating, 
        service_rating, comfort_rating, price_rating, average_rating, 
        comment, status, ip_address, user_agent, created_at, updated_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `;
    
    const stmt = sqlite.prepare(insertSQL);
    stmt.run(
      reviewData.id,
      reviewData.clinic_id,
      reviewData.author_name,
      reviewData.author_email,
      reviewData.quality_rating,
      reviewData.service_rating,
      reviewData.comfort_rating,
      reviewData.price_rating,
      reviewData.average_rating,
      reviewData.comment,
      reviewData.status,
      reviewData.ip_address,
      reviewData.user_agent,
      reviewData.created_at,
      reviewData.updated_at
    );
    
    console.log('✅ Тестовый отзыв создан успешно!');
    
    // Проверяем, что отзыв создался
    const reviews = sqlite.prepare('SELECT * FROM reviews').all();
    console.log(`📊 Всего отзывов в базе: ${reviews.length}`);
    
    if (reviews.length > 0) {
      console.log('📋 Последний отзыв:');
      console.log(`  - ID: ${reviews[reviews.length - 1].id}`);
      console.log(`  - Клиника: ${reviews[reviews.length - 1].clinic_id}`);
      console.log(`  - Рейтинг: ${reviews[reviews.length - 1].average_rating}`);
      console.log(`  - Статус: ${reviews[reviews.length - 1].status}`);
    }
    
    sqlite.close();
    
  } catch (error) {
    console.error('❌ Ошибка при создании отзыва:', error);
  }
}

testCreateReview();
