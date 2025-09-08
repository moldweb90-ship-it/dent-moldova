const { Pool } = require('pg');
require('dotenv').config();

// Функция расчета рейтингов (новая строгая система)
function calculateRatings(data) {
  // 1. Google Рейтинг (Reviews Index) - Более строгая система
  let reviewsIndex = 30; // Базовый рейтинг снижен
  
  if (data.googleRating && data.googleRating > 0) {
    // Рейтинг 5.0 = 100 баллов, 4.0 = 60 баллов, 3.0 = 20 баллов
    const ratingScore = Math.max(0, (data.googleRating - 3.0) * 40);
    
    // Количество отзывов (максимум 30 баллов)
    let reviewsBonus = 0;
    if (data.googleReviewsCount) {
      if (data.googleReviewsCount >= 200) reviewsBonus = 30;
      else if (data.googleReviewsCount >= 100) reviewsBonus = 25;
      else if (data.googleReviewsCount >= 50) reviewsBonus = 20;
      else if (data.googleReviewsCount >= 20) reviewsBonus = 15;
      else if (data.googleReviewsCount >= 10) reviewsBonus = 10;
      else if (data.googleReviewsCount >= 5) reviewsBonus = 5;
    }
    
    reviewsIndex = Math.min(100, Math.round(ratingScore + reviewsBonus));
  }

  // 2. Опыт врачей (Trust Index) - Более строгая система
  let trustIndex = 30; // Базовый рейтинг снижен
  
  // Опыт врачей (максимум 50 баллов)
  if (data.doctorExperience >= 20) trustIndex += 50;
  else if (data.doctorExperience >= 15) trustIndex += 40;
  else if (data.doctorExperience >= 10) trustIndex += 30;
  else if (data.doctorExperience >= 5) trustIndex += 20;
  else if (data.doctorExperience >= 2) trustIndex += 10;
  
  // Лицензии и сертификаты (максимум 20 баллов)
  if (data.hasLicenses) trustIndex += 10;
  if (data.hasCertificates) trustIndex += 10;
  
  trustIndex = Math.min(trustIndex, 100);

  // 3. Удобство записи (Access Index) - Более строгая система
  let accessIndex = 30; // Базовый рейтинг снижен
  
  // Онлайн запись (20 баллов)
  if (data.onlineBooking) accessIndex += 20;
  
  // Время работы (максимум 30 баллов)
  if (data.eveningWork) accessIndex += 15;
  if (data.urgentCare) accessIndex += 15;
  
  // Удобство расположения (20 баллов)
  if (data.convenientLocation) accessIndex += 20;
  
  accessIndex = Math.min(accessIndex, 100);

  // 4. Ценовая политика (Price Index) - Более строгая система
  let priceIndex = 30; // Базовый рейтинг снижен
  
  // Рассрочка (35 баллов)
  if (data.installmentPlan) priceIndex += 35;
  
  // Акции и скидки (35 баллов)
  if (data.hasPromotions) priceIndex += 35;
  
  priceIndex = Math.min(priceIndex, 100);

  // 5. Общий рейтинг (взвешенная сумма)
  const dScore = Math.round(
    trustIndex * 0.3 +      // Доверие: 30%
    reviewsIndex * 0.25 +   // Отзывы: 25%
    priceIndex * 0.25 +     // Цена: 25%
    accessIndex * 0.2       // Удобство: 20%
  );

  return {
    reviewsIndex,
    trustIndex,
    accessIndex,
    priceIndex,
    dScore
  };
}

async function updateClinicRatings() {
  const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
  });

  try {
    console.log('🔍 Starting clinic ratings update...');
    
    // Получаем все клиники
    const clinicsResult = await pool.query(`
      SELECT 
        id,
        name_ru,
        name_ro,
        google_rating,
        google_reviews_count,
        doctor_experience,
        has_licenses,
        has_certificates,
        online_booking,
        evening_work,
        urgent_care,
        convenient_location,
        installment_plan,
        has_promotions,
        reviews_index,
        trust_index,
        access_index,
        price_index,
        d_score
      FROM clinics
      ORDER BY name_ru
    `);

    console.log(`📊 Found ${clinicsResult.rows.length} clinics to update`);

    for (const clinic of clinicsResult.rows) {
      console.log(`\n🔍 Processing clinic: ${clinic.name_ru || clinic.name_ro}`);
      
      // Подготавливаем данные для расчета
      const ratingData = {
        googleRating: clinic.google_rating,
        googleReviewsCount: clinic.google_reviews_count,
        doctorExperience: clinic.doctor_experience || 0,
        hasLicenses: clinic.has_licenses || false,
        hasCertificates: clinic.has_certificates || false,
        onlineBooking: clinic.online_booking || false,
        eveningWork: clinic.evening_work || false,
        urgentCare: clinic.urgent_care || false,
        convenientLocation: clinic.convenient_location || false,
        installmentPlan: clinic.installment_plan || false,
        hasPromotions: clinic.has_promotions || false
      };

      // Рассчитываем новые рейтинги
      const newRatings = calculateRatings(ratingData);

      console.log(`📊 Old ratings:`, {
        reviewsIndex: clinic.reviews_index,
        trustIndex: clinic.trust_index,
        accessIndex: clinic.access_index,
        priceIndex: clinic.price_index,
        dScore: clinic.d_score
      });

      console.log(`📊 New ratings:`, newRatings);

      // Обновляем клинику в базе
      await pool.query(`
        UPDATE clinics 
        SET 
          reviews_index = $1,
          trust_index = $2,
          access_index = $3,
          price_index = $4,
          d_score = $5,
          updated_at = NOW()
        WHERE id = $6
      `, [
        newRatings.reviewsIndex,
        newRatings.trustIndex,
        newRatings.accessIndex,
        newRatings.priceIndex,
        newRatings.dScore,
        clinic.id
      ]);

      console.log(`✅ Updated clinic: ${clinic.name_ru || clinic.name_ro}`);
    }

    console.log('\n🎉 All clinic ratings updated successfully!');
    
  } catch (error) {
    console.error('❌ Error updating clinic ratings:', error);
  } finally {
    await pool.end();
  }
}

updateClinicRatings();






