import { neon } from '@neondatabase/serverless';

const sql = neon(process.env.DATABASE_URL);

async function checkReviews() {
  try {
    const reviews = await sql`
      SELECT id, clinic_id, author_name, status, quality_rating, service_rating, comfort_rating, price_rating, average_rating, created_at
      FROM reviews 
      WHERE clinic_id = '50700388-9022-46bf-ace0-8e2335b744bb'
      ORDER BY created_at DESC
    `;
    
    console.log('Отзывы для Life Dental Чеканы:');
    console.log('Всего отзывов:', reviews.length);
    reviews.forEach((review, index) => {
      console.log(`${index + 1}. ID: ${review.id}`);
      console.log(`   Автор: ${review.author_name}`);
      console.log(`   Статус: ${review.status}`);
      console.log(`   Рейтинги: Качество=${review.quality_rating}, Сервис=${review.service_rating}, Комфорт=${review.comfort_rating}, Цены=${review.price_rating}`);
      console.log(`   Средний: ${review.average_rating}`);
      console.log(`   Дата: ${review.created_at}`);
      console.log('---');
    });
  } catch (error) {
    console.error('Ошибка:', error);
  }
}

checkReviews();
