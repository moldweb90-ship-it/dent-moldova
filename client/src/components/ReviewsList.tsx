import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { useTranslation } from '../lib/i18n';
import { Star, Quote, User, Calendar } from 'lucide-react';

interface Review {
  id: string;
  authorName: string;
  qualityRating: number;
  serviceRating: number;
  comfortRating: number;
  priceRating: number;
  averageRating: number;
  comment: string;
  createdAt: string;
}

interface ReviewsListProps {
  clinicId: string;
  compact?: boolean;
}

const StarRating: React.FC<{ rating: number; size?: number }> = ({ rating, size = 16 }) => {
  const safeRating = Number(rating) || 0;
  const fullStars = Math.floor(safeRating);
  const hasHalfStar = safeRating % 1 >= 0.5;
  const emptyStars = 5 - fullStars - (hasHalfStar ? 1 : 0);

  return (
    <div className="flex items-center gap-0.5">
      {/* Полные звезды */}
      {Array.from({ length: fullStars }).map((_, i) => (
        <Star
          key={`full-${i}`}
          size={size}
          className="fill-yellow-400 text-yellow-400"
        />
      ))}
      
      {/* Половинчатая звезда */}
      {hasHalfStar && (
        <div className="relative">
          <Star size={size} className="text-gray-300" />
          <div 
            className="absolute inset-0 overflow-hidden"
            style={{ width: '50%' }}
          >
            <Star size={size} className="fill-yellow-400 text-yellow-400" />
          </div>
        </div>
      )}
      
      {/* Пустые звезды */}
      {Array.from({ length: emptyStars }).map((_, i) => (
        <Star
          key={`empty-${i}`}
          size={size}
          className="text-gray-300"
        />
      ))}
      
      <span className="ml-1 text-sm text-gray-600 font-medium">
        {safeRating.toFixed(1)}
      </span>
    </div>
  );
};

const ReviewCard: React.FC<{ review: Review; compact?: boolean }> = ({ review, compact = false }) => {
  const { t } = useTranslation();
  
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('ru-RU', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  if (compact) {
    return (
      <div className="relative bg-gradient-to-br from-white to-gray-50 rounded-xl border border-gray-100 p-4 mb-3 shadow-sm hover:shadow-md transition-all duration-200">
        {/* Декоративная кавычка */}
        <div className="absolute top-3 right-3 opacity-10">
          <Quote size={32} className="text-blue-500" />
        </div>
        
        {/* Заголовок */}
        <div className="flex items-center gap-3 mb-3">
          <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-blue-600 rounded-full flex items-center justify-center flex-shrink-0">
            <User size={16} className="text-white" />
          </div>
          <div className="flex-1 min-w-0">
            <h5 className="font-semibold text-gray-900 text-sm truncate">
              {review.authorName || 'Анонимный пользователь'}
            </h5>
            <div className="flex items-center gap-2">
              <StarRating rating={review.averageRating} size={14} />
            </div>
          </div>
        </div>
        
        {/* Текст отзыва */}
        {review.comment && (
          <div className="relative">
            <p className="text-gray-600 text-sm leading-relaxed italic">
              "{review.comment.substring(0, 100)}{review.comment.length > 100 ? '...' : ''}"
            </p>
          </div>
        )}
        
        {/* Дата */}
        <div className="flex items-center gap-1 mt-2 text-xs text-gray-400">
          <Calendar size={12} />
          <span>{formatDate(review.createdAt)}</span>
        </div>
      </div>
    );
  }

  return (
    <div className="relative bg-white rounded-2xl border border-gray-100 p-6 mb-6 shadow-sm hover:shadow-lg transition-all duration-300">
      {/* Декоративные элементы */}
      <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-blue-400 via-purple-500 to-pink-500 rounded-t-2xl"></div>
      <div className="absolute top-6 right-6 opacity-5">
        <Quote size={48} className="text-blue-500" />
      </div>
      
      {/* Заголовок отзыва */}
      <div className="flex items-start gap-4 mb-6">
        <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center flex-shrink-0">
          <User size={20} className="text-white" />
        </div>
        <div className="flex-1">
          <h4 className="font-bold text-gray-900 text-lg mb-1">
            {review.authorName || 'Анонимный пользователь'}
          </h4>
          <div className="flex items-center gap-3 mb-2">
            <StarRating rating={review.averageRating} size={20} />
            <span className="text-sm font-medium text-gray-600">
              {review.averageRating.toFixed(1)} из 5
            </span>
          </div>
          <div className="flex items-center gap-2 text-sm text-gray-500">
            <Calendar size={16} />
            <span>{formatDate(review.createdAt)}</span>
          </div>
        </div>
      </div>

      {/* Детальные оценки */}
      <div className="grid grid-cols-2 gap-4 mb-6 p-4 bg-gradient-to-br from-gray-50 to-blue-50 rounded-xl border border-gray-100">
        <div className="flex items-center justify-between">
          <span className="text-sm font-medium text-gray-700">{t('quality')}:</span>
          <StarRating rating={review.qualityRating} size={16} />
        </div>
        <div className="flex items-center justify-between">
          <span className="text-sm font-medium text-gray-700">{t('service')}:</span>
          <StarRating rating={review.serviceRating} size={16} />
        </div>
        <div className="flex items-center justify-between">
          <span className="text-sm font-medium text-gray-700">{t('comfort')}:</span>
          <StarRating rating={review.comfortRating} size={16} />
        </div>
        <div className="flex items-center justify-between">
          <span className="text-sm font-medium text-gray-700">{t('prices')}:</span>
          <StarRating rating={review.priceRating} size={16} />
        </div>
      </div>

      {/* Текст отзыва */}
      {review.comment && (
        <div className="relative">
          <div className="absolute -left-2 top-0 w-1 h-full bg-gradient-to-b from-blue-400 to-purple-500 rounded-full opacity-20"></div>
          <div className="pl-6">
            <p className="text-gray-700 leading-relaxed text-base italic">
              "{review.comment}"
            </p>
          </div>
        </div>
      )}
    </div>
  );
};

export const ReviewsList: React.FC<ReviewsListProps> = ({ clinicId, compact = false }) => {
  const { t } = useTranslation();

  const { data: reviewsData, isLoading, error } = useQuery({
    queryKey: ['clinic-reviews', clinicId, compact],
    queryFn: async () => {
      const limit = compact ? 3 : 10; // В компактном режиме показываем только 3 отзыва
      const response = await fetch(`/api/clinics/${clinicId}/reviews?limit=${limit}`);
      if (!response.ok) {
        throw new Error('Failed to fetch reviews');
      }
      return response.json();
    },
    enabled: !!clinicId
  });

  if (isLoading) {
    const loadingItemCount = compact ? 2 : 3;
    
    return (
      <div className="space-y-6">
        {/* Заголовок загрузки */}
        <div className={compact ? "bg-white rounded-lg border border-gray-100 p-4" : "bg-gradient-to-r from-blue-50 to-purple-50 rounded-xl border border-gray-100 p-6"}>
          <div className="flex items-center gap-3">
            <div className={`${compact ? "w-8 h-8" : "w-12 h-12"} bg-gradient-to-br from-gray-300 to-gray-400 rounded-full flex items-center justify-center animate-pulse`}>
              <Star size={compact ? 16 : 20} className="text-white fill-current" />
            </div>
            <div>
              <div className={`${compact ? "h-4 w-32" : "h-5 w-40"} bg-gray-300 rounded animate-pulse mb-2`}></div>
              {!compact && (
                <div className="h-3 w-64 bg-gray-200 rounded animate-pulse"></div>
              )}
            </div>
          </div>
        </div>

        {/* Скелетоны отзывов */}
        <div className={compact ? "space-y-3" : "space-y-4"}>
          {Array.from({ length: loadingItemCount }).map((_, i) => (
            <div key={i} className={`${compact ? "rounded-xl p-4" : "rounded-2xl p-6"} bg-white border border-gray-100 animate-pulse`}>
              <div className="flex items-center gap-3 mb-4">
                <div className={`${compact ? "w-8 h-8" : "w-12 h-12"} bg-gray-300 rounded-full`}></div>
                <div className="flex-1">
                  <div className={`${compact ? "h-3 w-24" : "h-4 w-32"} bg-gray-300 rounded mb-2`}></div>
                  <div className={`${compact ? "h-2 w-16" : "h-3 w-20"} bg-gray-200 rounded`}></div>
                </div>
              </div>
              <div className={`${compact ? "h-12" : "h-16"} bg-gray-200 rounded-lg`}></div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="space-y-6">
        <div className={compact ? "bg-white rounded-lg border border-gray-100 p-4" : "bg-gradient-to-r from-red-50 to-pink-50 rounded-xl border border-red-100 p-6"}>
          <div className="flex items-center gap-3">
            <div className={`${compact ? "w-8 h-8" : "w-12 h-12"} bg-gradient-to-br from-red-500 to-pink-600 rounded-full flex items-center justify-center`}>
              <Star size={compact ? 16 : 20} className="text-white fill-current" />
            </div>
            <div>
              <h3 className={`${compact ? "text-base" : "text-lg"} font-bold text-gray-900 mb-1`}>
                Отзывы пациентов
              </h3>
              {!compact && (
                <p className="text-sm text-red-600">
                  Ошибка загрузки отзывов
                </p>
              )}
            </div>
          </div>
        </div>
        {compact && (
          <p className="text-center text-red-500 text-sm">Ошибка загрузки отзывов</p>
        )}
      </div>
    );
  }

  const reviews = reviewsData?.reviews || [];

  if (reviews.length === 0) {
    return (
      <div className="space-y-6">
        <div className={compact ? "bg-white rounded-lg border border-gray-100 p-4" : "bg-gradient-to-r from-blue-50 to-purple-50 rounded-xl border border-gray-100 p-6"}>
          <div className="flex items-center gap-3">
            <div className={`${compact ? "w-8 h-8" : "w-12 h-12"} bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center`}>
              <Star size={compact ? 16 : 20} className="text-white fill-current" />
            </div>
            <div>
              <h3 className={`${compact ? "text-base" : "text-lg"} font-bold text-gray-900 mb-1`}>
                Отзывы пациентов
              </h3>
              {!compact && (
                <p className="text-sm text-gray-600">
                  Реальные отзывы от людей, которые получили здесь лечение
                </p>
              )}
            </div>
          </div>
        </div>
        
        <div className={`${compact ? "rounded-xl p-6" : "rounded-2xl p-8"} bg-gradient-to-br from-gray-50 to-blue-50 border border-gray-100 text-center`}>
          <div className="mb-4">
            <div className={`${compact ? "w-16 h-16" : "w-20 h-20"} bg-gradient-to-br from-blue-400 to-purple-500 rounded-full flex items-center justify-center mx-auto mb-4 opacity-20`}>
              <Star size={compact ? 24 : 32} className="text-white fill-current" />
            </div>
          </div>
          <h4 className={`${compact ? "text-sm" : "text-base"} font-semibold text-gray-700 mb-2`}>
            Пока нет отзывов
          </h4>
          {!compact && (
            <p className="text-sm text-gray-500">
              Станьте первым, кто оставит отзыв о клинике
            </p>
          )}
        </div>
      </div>
    );
  }

  const containerClass = compact 
    ? "bg-white rounded-lg border border-gray-200 p-4" 
    : "bg-white rounded-lg border border-gray-200 p-6";
    
  const headerClass = compact 
    ? "flex items-start justify-between mb-4" 
    : "flex items-start justify-between mb-6";
    
  const titleClass = compact 
    ? "text-base font-semibold" 
    : "text-lg font-semibold";

  const headerContainerClass = compact 
    ? "bg-white rounded-lg border border-gray-100 p-4" 
    : "bg-gradient-to-r from-blue-50 to-purple-50 rounded-xl border border-gray-100 p-6";

  return (
    <div className="space-y-6">
      {/* Красивый заголовок */}
      <div className={headerContainerClass}>
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            <div className={`${compact ? "w-8 h-8" : "w-12 h-12"} bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center flex-shrink-0`}>
              <Star size={compact ? 16 : 20} className="text-white fill-current" />
            </div>
            <div>
              <h3 className={`${compact ? "text-base" : "text-lg"} font-bold text-gray-900 mb-1`}>
                Отзывы пациентов
              </h3>
              {!compact && (
                <p className="text-sm text-gray-600 leading-relaxed">
                  Реальные отзывы от людей, которые получили здесь лечение
                </p>
              )}
            </div>
          </div>
          <div className="text-right">
            <div className={`${compact ? "px-2 py-1 text-xs" : "px-3 py-2 text-sm"} bg-white rounded-full border border-gray-200 font-medium text-gray-700 shadow-sm`}>
              {reviews.length} отзывов
            </div>
            {!compact && reviews.length > 0 && (
              <div className="mt-2 flex items-center justify-end gap-1">
                <StarRating rating={reviews.reduce((acc, r) => acc + r.averageRating, 0) / reviews.length} size={14} />
                <span className="text-xs text-gray-500 ml-1">
                  средняя оценка
                </span>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Список отзывов */}
      <div className={compact ? "space-y-3" : "space-y-4"}>
        {reviews.map((review) => (
          <ReviewCard key={review.id} review={review} compact={compact} />
        ))}
      </div>

      {/* Кнопка "Показать больше" */}
      {reviewsData?.total > reviews.length && (
        <div className="text-center">
          <button className="px-6 py-3 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-full font-medium hover:from-blue-600 hover:to-purple-700 transition-all duration-200 transform hover:scale-105 shadow-lg">
            Показать больше отзывов
          </button>
        </div>
      )}
    </div>
  );
};

export default ReviewsList;
