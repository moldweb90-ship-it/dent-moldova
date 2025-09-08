// Утилиты для работы с рейтингами

export interface Review {
  averageRating: number;
}

export interface RatingData {
  averageRating: number;
  totalReviews: number;
  hasRating: boolean;
}

/**
 * Вычисляет средний рейтинг клиники на основе отзывов
 * @param reviews - массив отзывов с averageRating
 * @returns объект с данными рейтинга
 */
export const calculateClinicRating = (reviews: Review[]): RatingData => {
  if (!reviews || reviews.length === 0) {
    return {
      averageRating: 0,
      totalReviews: 0,
      hasRating: false
    };
  }

  // Суммируем все средние рейтинги отзывов
  const totalRating = reviews.reduce((sum, review) => {
    return sum + (review.averageRating || 0);
  }, 0);

  // Вычисляем средний рейтинг клиники
  const averageRating = totalRating / reviews.length;

  return {
    averageRating: Math.round(averageRating * 100) / 100, // Округляем до 2 знаков
    totalReviews: reviews.length,
    hasRating: true
  };
};

/**
 * Форматирует рейтинг для отображения
 * @param rating - рейтинг
 * @returns отформатированная строка
 */
export const formatRating = (rating: number): string => {
  return rating.toFixed(2);
};
