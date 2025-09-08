import fetch from 'node-fetch';

async function testReviewsAPI() {
  try {
    console.log('🔍 Тестируем API отзывов...');
    
    // Тестируем получение отзывов
    console.log('📋 Получаем отзывы...');
    const response = await fetch('http://localhost:5000/api/admin/reviews');
    
    console.log(`Status: ${response.status}`);
    
    if (response.ok) {
      const data = await response.json();
      console.log('✅ API работает!');
      console.log(`📊 Найдено отзывов: ${data.reviews?.length || 0}`);
      console.log(`📊 Всего отзывов: ${data.total || 0}`);
      
      if (data.reviews && data.reviews.length > 0) {
        console.log('📋 Первый отзыв:');
        const review = data.reviews[0];
        console.log(`  - ID: ${review.review.id}`);
        console.log(`  - Клиника: ${review.clinic?.name_ru || 'N/A'}`);
        console.log(`  - Рейтинг: ${review.review.average_rating}`);
        console.log(`  - Статус: ${review.review.status}`);
      }
    } else {
      const errorText = await response.text();
      console.log('❌ API не работает:');
      console.log(`Status: ${response.status}`);
      console.log(`Error: ${errorText}`);
    }
    
  } catch (error) {
    console.error('❌ Ошибка при тестировании API:', error);
  }
}

testReviewsAPI();
