import { useQuery } from '@tanstack/react-query';
import { calculateClinicRating, RatingData } from '../utils/ratingUtils';

interface Review {
  id: string;
  clinicId: string;
  qualityRating: string;
  serviceRating: string;
  comfortRating: string;
  priceRating: string;
  averageRating: string;
  status: 'pending' | 'approved' | 'rejected';
}

interface ReviewsResponse {
  reviews: Review[];
  total: number;
}

interface ClinicRatings {
  hasRating: boolean;
  qualityRating: number;
  serviceRating: number;
  comfortRating: number;
  priceRating: number;
  averageRating: number;
  totalReviews: number;
}

interface CombinedRatingData {
  // Данные из useClinicRating
  ratingData: RatingData;
  // Данные из useClinicRealRatings
  realRatings: ClinicRatings;
  isLoading: boolean;
  error: any;
}

/**
 * Объединенный хук для получения всех рейтингов клиники
 * Заменяет useClinicRating и useClinicRealRatings для устранения дублирования запросов
 */
export const useClinicRatings = (clinicId: string): CombinedRatingData => {
  const { data, isLoading, error } = useQuery<ReviewsResponse>({
    queryKey: ['clinic-ratings', clinicId],
    queryFn: async () => {
      if (!clinicId) throw new Error('Clinic ID is required');
      
      const response = await fetch(`/api/clinics/${clinicId}/reviews?status=approved&limit=1000`);
      if (!response.ok) {
        throw new Error('Failed to fetch reviews');
      }
      return response.json();
    },
    enabled: !!clinicId,
    staleTime: 10 * 60 * 1000, // Кешируем на 10 минут
    cacheTime: 15 * 60 * 1000, // Храним в кеше 15 минут
  });

  // Вычисляем данные для useClinicRating
  const ratingData = calculateClinicRating(data?.reviews || []);

  // Вычисляем данные для useClinicRealRatings
  const reviews: Review[] = data?.reviews || [];
  
  let realRatings: ClinicRatings;
  
  if (reviews.length === 0) {
    realRatings = {
      hasRating: false,
      qualityRating: 0,
      serviceRating: 0,
      comfortRating: 0,
      priceRating: 0,
      averageRating: 0,
      totalReviews: 0
    };
  } else {
    // Вычисляем средние значения
    const totalQuality = reviews.reduce((sum, review) => sum + Number(review.qualityRating), 0);
    const totalService = reviews.reduce((sum, review) => sum + Number(review.serviceRating), 0);
    const totalComfort = reviews.reduce((sum, review) => sum + Number(review.comfortRating), 0);
    const totalPrice = reviews.reduce((sum, review) => sum + Number(review.priceRating), 0);
    const totalAverage = reviews.reduce((sum, review) => sum + Number(review.averageRating), 0);
    
    const count = reviews.length;
    
    realRatings = {
      hasRating: true,
      qualityRating: totalQuality / count,
      serviceRating: totalService / count,
      comfortRating: totalComfort / count,
      priceRating: totalPrice / count,
      averageRating: totalAverage / count,
      totalReviews: count
    };
  }

  return {
    ratingData,
    realRatings,
    isLoading,
    error
  };
};











