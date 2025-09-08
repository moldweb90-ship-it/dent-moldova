interface ClinicRatingData {
  // Google рейтинг
  googleRating?: number;
  googleReviewsCount?: number;
  
  // Опыт врачей
  doctorExperience: number;
  hasLicenses: boolean;
  hasCertificates: boolean;
  
  // Доступность записи
  onlineBooking: boolean;
  weekendWork: boolean;
  eveningWork: boolean;
  urgentCare: boolean;
  convenientLocation: boolean;
  
  // Ценовая политика (старые поля для обратной совместимости)
  installmentPlan: boolean;
  hasPromotions: boolean;
  
  // Ценовая политика (новые поля)
  publishedPricing: boolean;
  freeConsultation: boolean;
  interestFreeInstallment: boolean;
  implantWarranty: boolean;
  popularServicesPromotions: boolean;
  onlinePriceCalculator: boolean;
}

interface CalculatedRatings {
  reviewsIndex: number;    // Google рейтинг
  trustIndex: number;      // Опыт врачей
  accessIndex: number;     // Удобство записи
  priceIndex: number;      // Ценовая политика
  dScore: number;          // Общий рейтинг
}

export function calculateRatings(data: ClinicRatingData): CalculatedRatings {
  // 1. Google Рейтинг (Reviews Index) - Точная система
  let reviewsIndex = 70; // Базовый рейтинг 70
  
  if (data.googleRating && data.googleRating > 0) {
    // Рейтинг от 4.0 до 5.0: 20 баллов (2 балла на каждую десятую)
    let ratingBonus = 0;
    if (data.googleRating >= 4.0) {
      const ratingDiff = Math.min(data.googleRating - 4.0, 1.0); // максимум до 5.0
      ratingBonus = Math.round(ratingDiff * 20); // 20 баллов за 1.0 разницу
    }
    
    // Количество отзывов: 10 баллов максимум (2 балла за каждые 100 отзывов)
    let reviewsBonus = 0;
    if (data.googleReviewsCount) {
      reviewsBonus = Math.min(Math.floor(data.googleReviewsCount / 100) * 2, 10);
    }
    
    reviewsIndex = Math.min(100, 70 + ratingBonus + reviewsBonus);
  }

  // 2. Опыт врачей (Trust Index) - Точная система
  let trustIndex = 70; // Базовый рейтинг 70
  
  // Лицензии и сертификаты: 10 баллов
  if (data.hasLicenses) trustIndex += 5;
  if (data.hasCertificates) trustIndex += 5;
  
  // Опыт врачей: 20 баллов (1 балл за каждый год)
  const experienceBonus = Math.min(data.doctorExperience || 0, 20);
  trustIndex += experienceBonus;
  
  trustIndex = Math.min(trustIndex, 100);

  // 3. Удобство записи (Access Index) - Точная система
  let accessIndex = 70; // Базовый рейтинг 70
  
  // 5 опций по 6 баллов каждая (30 баллов максимум)
  if (data.onlineBooking) accessIndex += 6;
  if (data.weekendWork) accessIndex += 6;
  if (data.eveningWork) accessIndex += 6;
  if (data.urgentCare) accessIndex += 6;
  if (data.convenientLocation) accessIndex += 6;
  
  accessIndex = Math.min(accessIndex, 100);

  // 4. Ценовая политика (Price Index) - Новая система
  let priceIndex = 50; // Базовый рейтинг 50
  
  // Новые характеристики ценовой политики (50 баллов максимум)
  if (data.publishedPricing) priceIndex += 15; // Опубликован прайс на сайте/в приложении
  if (data.freeConsultation) priceIndex += 5;  // Бесплатная консультация
  if (data.interestFreeInstallment) priceIndex += 5; // Рассрочка без %
  if (data.implantWarranty) priceIndex += 10; // Гарантия на импланты/работы
  if (data.popularServicesPromotions) priceIndex += 10; // Акции на популярные услуги
  if (data.onlinePriceCalculator) priceIndex += 5; // Онлайн-калькулятор стоимости
  
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
