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
  console.log('🔍 useClinicRealRatings: hook called for clinicId:', clinicId);
  
        // Принудительная отладка для Life Dental Чеканы
        if (clinicId === '50700388-9022-46bf-ace0-8e2335b744bb') {
          console.log('🔍 Life Dental Чеканы - hook called!');
          console.log('🔍 Life Dental Чеканы - clinicId:', clinicId);
        }
  
  return useQuery({
    queryKey: ['clinic-real-ratings', clinicId],
    queryFn: async (): Promise<ClinicRatings> => {
      try {
        console.log('🔍 useClinicRealRatings: fetching for clinicId:', clinicId);
        
        if (!clinicId) {
          console.log('🔍 useClinicRealRatings: no clinicId, returning default');
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
        console.log('🔍 useClinicRealRatings: response status:', response.status);
        console.log('🔍 useClinicRealRatings: response ok:', response.ok);
        console.log('🔍 useClinicRealRatings: response headers:', response.headers);
        
        // Принудительная отладка для Life Dental Чеканы
        if (clinicId === '50700388-9022-46bf-ace0-8e2335b744bb') {
          console.log('🔍 Life Dental Чеканы - URL:', `/api/clinics/${clinicId}/reviews?status=approved&limit=1000`);
        }
        
        // Принудительная отладка для Life Dental Чеканы
        if (clinicId === '50700388-9022-46bf-ace0-8e2335b744bb') {
          console.log('🔍 Life Dental Чеканы - API response:', response);
          console.log('🔍 Life Dental Чеканы - response.ok:', response.ok);
          console.log('🔍 Life Dental Чеканы - response.status:', response.status);
          console.log('🔍 Life Dental Чеканы - response.headers:', response.headers);
          console.log('🔍 Life Dental Чеканы - response type:', typeof response);
        }
        
        if (!response.ok) {
          const errorText = await response.text();
          console.error('🔍 useClinicRealRatings: error response:', errorText);
          throw new Error(`Failed to fetch reviews: ${response.status} ${errorText}`);
        }
        
        const data = await response.json();
        console.log('🔍 useClinicRealRatings: raw data:', data);
        
        const reviews: Review[] = data.reviews || [];
        console.log('🔍 useClinicRealRatings: received reviews:', reviews.length, reviews);
        
        // Принудительная отладка для Life Dental Чеканы
        if (clinicId === '50700388-9022-46bf-ace0-8e2335b744bb') {
          console.log('🔍 Life Dental Чеканы - raw data:', data);
          console.log('🔍 Life Dental Чеканы - reviews:', reviews);
          console.log('🔍 Life Dental Чеканы - reviews.length:', reviews.length);
          console.log('🔍 Life Dental Чеканы - first review:', reviews[0]);
          console.log('🔍 Life Dental Чеканы - data type:', typeof data);
          console.log('🔍 Life Dental Чеканы - reviews type:', typeof reviews);
        }
        
        // Проверяем структуру первого отзыва
        if (reviews.length > 0) {
          console.log('🔍 useClinicRealRatings: first review structure:', reviews[0]);
        }
        
        // Используем все отзывы для hover-эффекта
        const approvedReviews = reviews;
        
        console.log('🔍 useClinicRealRatings: approved reviews:', approvedReviews.length, approvedReviews);
        
        // Принудительная отладка для Life Dental Чеканы
        if (clinicId === '50700388-9022-46bf-ace0-8e2335b744bb') {
          console.log('🔍 Life Dental Чеканы - approved reviews:', approvedReviews);
          console.log('🔍 Life Dental Чеканы - approved reviews.length:', approvedReviews.length);
          console.log('🔍 Life Dental Чеканы - first approved review:', approvedReviews[0]);
          console.log('🔍 Life Dental Чеканы - all review statuses:', reviews.map(r => r.status));
        }
        
        if (approvedReviews.length === 0) {
          console.log('🔍 useClinicRealRatings: no approved reviews, returning hasRating: false');
          
        // Принудительная отладка для Life Dental Чеканы
        if (clinicId === '50700388-9022-46bf-ace0-8e2335b744bb') {
          console.log('🔍 Life Dental Чеканы - NO APPROVED REVIEWS!');
          console.log('🔍 Life Dental Чеканы - reviews:', reviews);
          console.log('🔍 Life Dental Чеканы - approvedReviews:', approvedReviews);
          console.log('🔍 Life Dental Чеканы - all review statuses:', reviews.map(r => r.status));
        }
          
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
        
        // Принудительная отладка для Life Dental Чеканы
        if (clinicId === '50700388-9022-46bf-ace0-8e2335b744bb') {
          console.log('🔍 Life Dental Чеканы - calculations:', {
            totalQuality,
            totalService,
            totalComfort,
            totalPrice,
            totalAverage,
            count
          });
          console.log('🔍 Life Dental Чеканы - individual ratings:', {
            qualityRating: totalQuality / count,
            serviceRating: totalService / count,
            comfortRating: totalComfort / count,
            priceRating: totalPrice / count,
            averageRating: totalAverage / count
          });
          console.log('🔍 Life Dental Чеканы - approved reviews for calculation:', approvedReviews.map(r => ({
            id: r.id,
            status: r.status,
            qualityRating: r.qualityRating,
            serviceRating: r.serviceRating,
            comfortRating: r.comfortRating,
            priceRating: r.priceRating,
            averageRating: r.averageRating
          })));
        }
        
        const result = {
          hasRating: true,
          qualityRating: totalQuality / count,
          serviceRating: totalService / count,
          comfortRating: totalComfort / count,
          priceRating: totalPrice / count,
          averageRating: totalAverage / count,
          totalReviews: count
        };
        
        console.log('🔍 useClinicRealRatings: calculated result:', result);
        
        // Принудительная отладка для Life Dental Чеканы
        if (clinicId === '50700388-9022-46bf-ace0-8e2335b744bb') {
          console.log('🔍 Life Dental Чеканы - calculated result:', result);
          console.log('🔍 Life Dental Чеканы - hasRating:', result.hasRating);
          console.log('🔍 Life Dental Чеканы - qualityRating:', result.qualityRating);
          console.log('🔍 Life Dental Чеканы - serviceRating:', result.serviceRating);
          console.log('🔍 Life Dental Чеканы - comfortRating:', result.comfortRating);
          console.log('🔍 Life Dental Чеканы - priceRating:', result.priceRating);
          console.log('🔍 Life Dental Чеканы - totalReviews:', result.totalReviews);
        }
        
        return result;
      } catch (error) {
        console.error('Error fetching clinic ratings:', error);
        
        // Принудительная отладка для Life Dental Чеканы
        if (clinicId === '50700388-9022-46bf-ace0-8e2335b744bb') {
          console.log('🔍 Life Dental Чеканы - error:', error);
          console.log('🔍 Life Dental Чеканы - error message:', error.message);
        }
        
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
      staleTime: 5 * 60 * 1000, // 5 minutes
      cacheTime: 10 * 60 * 1000, // 10 minutes
  });
}
