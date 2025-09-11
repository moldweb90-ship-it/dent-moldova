import { useState } from 'react';
import { useTranslation } from '@/lib/i18n';
import { AnimatedStarRating } from './AnimatedStarRating';
import { Quote, User, Calendar } from 'lucide-react';

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

interface ReviewCardProps {
  review: Review;
  compact?: boolean;
}

export const ReviewCard: React.FC<ReviewCardProps> = ({ review, compact = false }) => {
  const { t, language } = useTranslation();
  const [isExpanded, setIsExpanded] = useState(false);

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const locale = language === 'ru' ? 'ru-RU' : 'ro-RO';
    return date.toLocaleDateString(locale, {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const maxLength = 100;
  const shouldTruncate = review.comment && review.comment.length > maxLength;
  const displayText = shouldTruncate && !isExpanded 
    ? review.comment.substring(0, maxLength) + '...'
    : review.comment;

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
              <AnimatedStarRating rating={review.averageRating} size="sm" />
            </div>
          </div>
        </div>
        
        {/* Текст отзыва */}
        {review.comment && (
          <div className="relative">
            <p 
              className={`text-gray-600 text-sm leading-relaxed italic ${shouldTruncate ? 'cursor-pointer hover:text-gray-800 transition-colors' : ''}`}
              onClick={() => shouldTruncate && setIsExpanded(!isExpanded)}
            >
              "{displayText}"
            </p>
            {shouldTruncate && (
              <button
                onClick={() => setIsExpanded(!isExpanded)}
                className="text-xs text-blue-600 hover:text-blue-800 mt-1 font-medium focus:outline-none focus:ring-0 focus:ring-offset-0 focus-visible:outline-none focus-visible:ring-0 focus-visible:ring-offset-0"
              >
                {isExpanded ? t('readLess') : t('readMore')}
              </button>
            )}
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
            <AnimatedStarRating rating={review.averageRating} size="md" />
            <span className="text-sm font-medium text-gray-600">
              {(review.averageRating || 0).toFixed(1)} из 5
            </span>
          </div>
          <div className="flex items-center gap-2 text-sm text-gray-500">
            <Calendar size={16} />
            <span>{formatDate(review.createdAt)}</span>
          </div>
        </div>
      </div>

      {/* Детальные рейтинги */}
      <div className="grid grid-cols-2 gap-4 mb-6">
        <div className="flex items-center justify-between">
          <span className="text-sm text-gray-600">{t('quality')}</span>
          <AnimatedStarRating rating={review.qualityRating} size="sm" />
        </div>
        <div className="flex items-center justify-between">
          <span className="text-sm text-gray-600">{t('service')}</span>
          <AnimatedStarRating rating={review.serviceRating} size="sm" />
        </div>
        <div className="flex items-center justify-between">
          <span className="text-sm text-gray-600">{t('comfort')}</span>
          <AnimatedStarRating rating={review.comfortRating} size="sm" />
        </div>
        <div className="flex items-center justify-between">
          <span className="text-sm text-gray-600">{t('prices')}</span>
          <AnimatedStarRating rating={review.priceRating} size="sm" />
        </div>
      </div>

      {/* Текст отзыва */}
      {review.comment && (
        <div className="relative">
          <p 
            className={`text-gray-700 leading-relaxed ${shouldTruncate ? 'cursor-pointer hover:text-gray-900 transition-colors' : ''}`}
            onClick={() => shouldTruncate && setIsExpanded(!isExpanded)}
          >
            "{displayText}"
          </p>
          {shouldTruncate && (
            <button
              onClick={() => setIsExpanded(!isExpanded)}
              className="text-sm text-blue-600 hover:text-blue-800 mt-2 font-medium focus:outline-none focus:ring-0 focus:ring-offset-0 focus-visible:outline-none focus-visible:ring-0 focus-visible:ring-offset-0"
            >
              {isExpanded ? t('readLess') : t('readMore')}
            </button>
          )}
        </div>
      )}
    </div>
  );
};
