import { useQuery } from '@tanstack/react-query';
import { apiRequest } from '../lib/utils';

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

interface ClinicRatings {
  hasRating: boolean;
  qualityRating: number;
  serviceRating: number;
  comfortRating: number;
  priceRating: number;
  averageRating: number;
  totalReviews: number;
}

export function useClinicRealRatings(clinicId: string) {
  
  return useQuery({
    queryKey: ['clinic-real-ratings', clinicId],
    queryFn: async (): Promise<ClinicRatings> => {
      try {
        
        if (!clinicId) {
          return {
            hasRating: false,
            qualityRating: 0,
            serviceRating: 0,
            comfortRating: 0,
            priceRating: 0,
            averageRating: 0,
            totalReviews: 0
          };
        }
        
        const response = await apiRequest('GET', `/api/clinics/${clinicId}/reviews?limit=1000`);
        
        if (!response.ok) {
          const errorText = await response.text();
          throw new Error(`Failed to fetch reviews: ${response.status} ${errorText}`);
        }

        const data = await response.json();
        const reviews: Review[] = data.reviews || [];
        
        // Используем все отзывы для hover-эффекта
        const approvedReviews = reviews;
        
        if (approvedReviews.length === 0) {
          
          return {
            hasRating: false,
            qualityRating: 0,
            serviceRating: 0,
            comfortRating: 0,
            priceRating: 0,
            averageRating: 0,
            totalReviews: 0
          };
        }
        
        // Вычисляем средние значения
        const totalQuality = approvedReviews.reduce((sum, review) => sum + Number(review.qualityRating), 0);
        const totalService = approvedReviews.reduce((sum, review) => sum + Number(review.serviceRating), 0);
        const totalComfort = approvedReviews.reduce((sum, review) => sum + Number(review.comfortRating), 0);
        const totalPrice = approvedReviews.reduce((sum, review) => sum + Number(review.priceRating), 0);
        const totalAverage = approvedReviews.reduce((sum, review) => sum + Number(review.averageRating), 0);
        
        const count = approvedReviews.length;
        
        return {
          hasRating: true,
          qualityRating: totalQuality / count,
          serviceRating: totalService / count,
          comfortRating: totalComfort / count,
          priceRating: totalPrice / count,
          averageRating: totalAverage / count,
          totalReviews: count
        };
      } catch (error) {
        console.error('Error fetching clinic ratings:', error);
        return {
          hasRating: false,
          qualityRating: 0,
          serviceRating: 0,
          comfortRating: 0,
          priceRating: 0,
          averageRating: 0,
          totalReviews: 0
        };
      }
      },
      staleTime: 10 * 60 * 1000, // 10 minutes
      cacheTime: 15 * 60 * 1000, // 15 minutes
  });
}
