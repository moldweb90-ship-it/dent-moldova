import { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { apiRequest } from '@/lib/queryClient';
import { ReviewCard } from './ReviewCard';
import { ChevronLeft, ChevronRight, Star } from 'lucide-react';
import { useTranslation } from '../lib/i18n';

interface Review {
  id: string;
  authorName: string;
  authorEmail: string;
  qualityRating: number;
  serviceRating: number;
  comfortRating: number;
  priceRating: number;
  averageRating: number;
  comment: string;
  createdAt: string;
  status: string;
}

interface ReviewsSectionProps {
  clinicId: string;
  clinicName: string;
}

export function ReviewsSection({ clinicId, clinicName }: ReviewsSectionProps) {
  const { t } = useTranslation();
  const [currentPage, setCurrentPage] = useState(1);
  const reviewsPerPage = 12;

  // Получаем отзывы с пагинацией
  const { data: reviewsData, isLoading, error, refetch } = useQuery({
    queryKey: ['reviews', clinicId, currentPage, reviewsPerPage],
    queryFn: async () => {
      const offset = (currentPage - 1) * reviewsPerPage;
      const response = await apiRequest('GET', `/api/clinics/${clinicId}/reviews?status=approved&limit=${reviewsPerPage}&offset=${offset}`);
      return response.json();
    },
    enabled: !!clinicId,
  });

  // Получаем общее количество отзывов
  const { data: totalReviewsData } = useQuery({
    queryKey: ['reviews-total', clinicId],
    queryFn: async () => {
      const response = await apiRequest('GET', `/api/clinics/${clinicId}/reviews?status=approved&limit=1000&offset=0`);
      return response.json();
    },
    enabled: !!clinicId,
  });

  const reviews = reviewsData?.reviews || [];
  const totalReviews = totalReviewsData?.total || 0;
  const totalPages = Math.ceil(totalReviews / reviewsPerPage);


  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    // Прокручиваем к началу секции отзывов
    const reviewsSection = document.getElementById('reviews-section');
    if (reviewsSection) {
      reviewsSection.scrollIntoView({ behavior: 'smooth' });
    }
  };

  if (isLoading) {
    return (
      <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 py-8 sm:py-12">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">{t('loading')}</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 py-8 sm:py-12">
        <div className="text-center">
          <p className="text-red-600 font-medium">{t('reviewsLoadError')}</p>
        </div>
      </div>
    );
  }

  return (
    <div id="reviews-section" className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 py-8 sm:py-12">
      {/* Заголовок секции - компактный */}
      <div className="text-center mb-6 sm:mb-8">
        <div className="relative inline-block">
          <div className="absolute inset-0 bg-gradient-to-r from-blue-500 via-purple-600 to-pink-500 rounded-xl blur-sm opacity-20"></div>
          <div className="relative bg-gradient-to-r from-blue-500 via-purple-600 to-pink-500 rounded-xl px-6 py-3 shadow-lg">
            <div className="flex items-center justify-center gap-3">
              <div className="w-8 h-8 bg-white/20 backdrop-blur-sm rounded-lg flex items-center justify-center">
                <Star size={16} className="text-white fill-current" />
              </div>
              <div className="flex items-center gap-2">
                <h2 className="text-lg sm:text-xl font-bold text-white drop-shadow-sm">
                  {t('reviewsTitle')}
                </h2>
                {totalReviews > 0 && (
                  <span className="text-white/90 text-sm bg-white/10 px-2 py-1 rounded-full">
                    {totalReviews}
                  </span>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>


      {/* Сетка отзывов */}
      {reviews.length > 0 ? (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 lg:gap-8 mb-8 sm:mb-12">
            {reviews.map((review: Review) => (
              <div key={review.id} className="transform transition-all duration-300 hover:scale-105">
                <ReviewCard review={review} compact={false} />
              </div>
            ))}
          </div>

          {/* Постраничная навигация */}
          {totalPages > 1 && (
            <div className="flex items-center justify-center space-x-2 sm:space-x-4">
              {/* Кнопка "Предыдущая" */}
              <Button
                onClick={() => handlePageChange(currentPage - 1)}
                disabled={currentPage === 1}
                variant="outline"
                className="flex items-center space-x-2 focus:outline-none focus:ring-0 focus:ring-offset-0 focus-visible:outline-none focus-visible:ring-0 focus-visible:ring-offset-0"
              >
                <ChevronLeft className="h-4 w-4" />
                <span className="hidden sm:inline">Предыдущая</span>
              </Button>

              {/* Номера страниц */}
              <div className="flex items-center space-x-1 sm:space-x-2">
                {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                  let pageNum;
                  if (totalPages <= 5) {
                    pageNum = i + 1;
                  } else if (currentPage <= 3) {
                    pageNum = i + 1;
                  } else if (currentPage >= totalPages - 2) {
                    pageNum = totalPages - 4 + i;
                  } else {
                    pageNum = currentPage - 2 + i;
                  }

                  return (
                    <Button
                      key={pageNum}
                      onClick={() => handlePageChange(pageNum)}
                      variant={currentPage === pageNum ? "default" : "outline"}
                      className={`w-8 h-8 sm:w-10 sm:h-10 p-0 focus:outline-none focus:ring-0 focus:ring-offset-0 focus-visible:outline-none focus-visible:ring-0 focus-visible:ring-offset-0 ${
                        currentPage === pageNum 
                          ? 'bg-gradient-to-r from-blue-500 to-purple-600 text-white border-0' 
                          : ''
                      }`}
                    >
                      {pageNum}
                    </Button>
                  );
                })}
              </div>

              {/* Кнопка "Следующая" */}
              <Button
                onClick={() => handlePageChange(currentPage + 1)}
                disabled={currentPage === totalPages}
                variant="outline"
                className="flex items-center space-x-2 focus:outline-none focus:ring-0 focus:ring-offset-0 focus-visible:outline-none focus-visible:ring-0 focus-visible:ring-offset-0"
              >
                <span className="hidden sm:inline">Следующая</span>
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          )}

          {/* Информация о текущей странице */}
          <div className="text-center mt-6 text-sm text-gray-600">
            {t('showingResults')} {((currentPage - 1) * reviewsPerPage) + 1}-{Math.min(currentPage * reviewsPerPage, totalReviews)} {t('of')} {totalReviews} {t('reviewsCount')}
          </div>
        </>
      ) : (
        <div className="text-center py-12 sm:py-16">
          <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <Star className="w-12 h-12 text-gray-400" />
          </div>
          <h3 className="text-xl sm:text-2xl font-semibold text-gray-900 mb-4">
            {t('noReviews')}
          </h3>
          <p className="text-gray-600 mb-8 max-w-md mx-auto">
            {t('beFirstReview')}
          </p>
        </div>
      )}

    </div>
  );
}
