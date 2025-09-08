import { useQuery } from '@tanstack/react-query';
import { calculateClinicRating, RatingData } from '../utils/ratingUtils';

interface Review {
  averageRating: number;
}

interface ReviewsResponse {
  reviews: Review[];
  total: number;
}

/**
 * Хук для получения реального рейтинга клиники на основе отзывов
 */
export const useClinicRating = (clinicId: string): {
  ratingData: RatingData;
  isLoading: boolean;
  error: any;
} => {
  const { data, isLoading, error } = useQuery<ReviewsResponse>({
    queryKey: ['clinic-rating', clinicId],
    queryFn: async () => {
      if (!clinicId) throw new Error('Clinic ID is required');
      
      const response = await fetch(`/api/clinics/${clinicId}/reviews?status=approved&limit=1000`);
      if (!response.ok) {
        throw new Error('Failed to fetch reviews');
      }
      return response.json();
    },
    enabled: !!clinicId,
    staleTime: 5 * 60 * 1000, // Кешируем на 5 минут
  });

  const ratingData = calculateClinicRating(data?.reviews || []);

  return {
    ratingData,
    isLoading,
    error
  };
};
