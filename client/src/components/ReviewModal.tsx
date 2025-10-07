import { useState, useEffect } from 'react';
import { X, Star, Send, Heart } from 'lucide-react';
import { useTranslation } from '../lib/i18n';
import { StarRating } from './StarRating';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';

interface ReviewModalProps {
  open: boolean;
  onClose: () => void;
  clinicId: string;
  clinicName: string;
  onSubmit: (review: ReviewData) => void;
}

interface ReviewData {
  quality: number;
  service: number;
  comfort: number;
  price: number;
  averageRating: number;
  comment: string;
}

export function ReviewModal({ open, onClose, clinicId, clinicName, onSubmit }: ReviewModalProps) {
  const { t } = useTranslation();
  
  // Reset form when modal opens
  useEffect(() => {
    if (open) {
      setRatings({ quality: 0, service: 0, comfort: 0, price: 0 });
      setComment('');
      setAverageRating(0);
      setAuthorName('');
      setAuthorEmail('');
      setIsSubmitting(false);
    }
  }, [open]);
  
  const [ratings, setRatings] = useState({
    quality: 0,
    service: 0,
    comfort: 0,
    price: 0
  });
  const [comment, setComment] = useState('');
  const [averageRating, setAverageRating] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [authorName, setAuthorName] = useState('');
  const [authorEmail, setAuthorEmail] = useState('');

  // Автоматический подсчет среднего рейтинга
  useEffect(() => {
    const { quality, service, comfort, price } = ratings;
    const total = quality + service + comfort + price;
    const average = total > 0 ? total / 4 : 0;
    setAverageRating(average);
  }, [ratings]);

  // Управление блокировкой скролла для скрытия меню браузера на iOS
  // Radix UI Dialog автоматически управляет блокировкой скролла без прокрутки страницы

  const handleRatingChange = (category: keyof typeof ratings, value: number) => {
    setRatings(prev => ({
      ...prev,
      [category]: value
    }));
  };

  const handleSubmit = async () => {
    if (averageRating === 0 || !authorName.trim() || !authorEmail.trim()) {
      return;
    }

    setIsSubmitting(true);
    
    const reviewData: ReviewData = {
      ...ratings,
      averageRating,
      comment: comment.trim()
    };

    try {
      // Отправляем отзыв на сервер
      const response = await fetch('/api/reviews', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          clinicId: clinicId,
          authorName: authorName.trim(),
          authorEmail: authorEmail.trim(),
          qualityRating: ratings.quality,
          serviceRating: ratings.service,
          comfortRating: ratings.comfort,
          priceRating: ratings.price,
          averageRating: averageRating,
          comment: comment.trim()
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to submit review');
      }

      const result = await response.json();
      console.log('Review submitted successfully:', result);

      // Вызываем callback для уведомления
      await onSubmit(reviewData);
      
      // Сброс формы
      setRatings({ quality: 0, service: 0, comfort: 0, price: 0 });
      setComment('');
      setAuthorName('');
      setAuthorEmail('');
      onClose();
    } catch (error) {
      console.error('Error submitting review:', error);
      throw error; // Пробрасываем ошибку для обработки в родительском компоненте
    } finally {
      setIsSubmitting(false);
    }
  };

  const isFormValid = averageRating > 0 && authorName.trim() && authorEmail.trim();

  if (!open) return null;

  return (
    <div 
      className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-[99999] p-4"
      onClick={onClose}
    >
      <div 
        className="bg-white rounded-3xl shadow-2xl max-w-2xl w-full mx-4 overflow-hidden border-0"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header (в стиле модала верификации) */}
        <div className="bg-gradient-to-br from-indigo-600 via-purple-600 to-pink-600 p-6 text-white relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-white/10 to-transparent pointer-events-none"></div>
          <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 rounded-full -translate-y-16 translate-x-16 pointer-events-none"></div>
          <div className="absolute bottom-0 left-0 w-24 h-24 bg-white/5 rounded-full translate-y-12 -translate-x-12 pointer-events-none"></div>
          <div className="flex items-center justify-between relative z-10">
            <div className="flex items-center space-x-4">
              <div className="w-12 h-12 bg-white/20 backdrop-blur-sm rounded-2xl flex items-center justify-center border border-white/30">
                <Heart className="h-6 w-6" />
              </div>
              <div>
                <h3 className="text-xl font-bold">{t('leaveReview')}</h3>
                <p className="text-white/90 text-sm font-medium">{t('reviewForClinic')}: {clinicName}</p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="w-8 h-8 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center hover:bg-white/30 transition-all duration-200 border border-white/30"
              aria-label="Close"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Form */}
        <div className="p-6 space-y-6 max-h-[75vh] overflow-y-auto">
          {/* Контактная информация */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-gray-800">
              {t('contactInfo')}
            </h3>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  {t('yourName')} <span className="text-red-500">*</span>
                </label>
            <input
              type="text"
              value={authorName}
              onChange={(e) => setAuthorName(e.target.value)}
              placeholder={t('enterYourName')}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              maxLength={100}
              required
            />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  {t('yourEmail')} <span className="text-red-500">*</span>
                </label>
            <input
              type="email"
              value={authorEmail}
              onChange={(e) => setAuthorEmail(e.target.value)}
              placeholder={t('enterYourEmail')}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              maxLength={150}
              required
            />
              </div>
            </div>
          </div>

          {/* Рейтинги */}
          <div className="space-y-4">
            <div className="text-center">
              <h3 className="text-lg font-semibold text-gray-800 mb-2">
                {t('rateYourExperience')}
              </h3>
              <p className="text-sm text-gray-600">
                {t('rateEachAspect')}
              </p>
            </div>

            <div className="grid grid-cols-2 gap-6">
              <StarRating
                value={ratings.quality}
                onChange={(value) => handleRatingChange('quality', value)}
                size="md"
                label={t('quality')}
              />
              
              <StarRating
                value={ratings.service}
                onChange={(value) => handleRatingChange('service', value)}
                size="md"
                label={t('service')}
              />
              
              <StarRating
                value={ratings.comfort}
                onChange={(value) => handleRatingChange('comfort', value)}
                size="md"
                label={t('comfort')}
              />
              
              <StarRating
                value={ratings.price}
                onChange={(value) => handleRatingChange('price', value)}
                size="md"
                label={t('price')}
              />
            </div>

            {/* Средний рейтинг */}
            {averageRating > 0 && (
              <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg p-4 border border-blue-200">
                <div className="flex items-center justify-center space-x-3">
                  <div className="flex items-center space-x-1">
                    <Star className="w-6 h-6 text-yellow-400 fill-current" />
                    <span className="text-2xl font-bold text-gray-800">
                      {averageRating.toFixed(1)}
                    </span>
                  </div>
                  <div className="text-center">
                    <p className="text-sm font-medium text-gray-700">{t('averageRating')}</p>
                    <p className="text-xs text-gray-500">{t('basedOnFourAspects')}</p>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Текстовый отзыв */}
          <div className="space-y-3">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                {t('shareYourExperience')}
              </label>
              <p className="text-xs text-gray-500 mb-3">
                {t('reviewHelpText')}
              </p>
            </div>
            
            <Textarea
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              placeholder={t('reviewPlaceholder')}
              className="min-h-[120px] resize-none border-gray-300 focus:border-blue-500 focus:ring-blue-500"
              maxLength={500}
            />
            
            <div className="flex justify-between items-center text-xs text-gray-500">
              <span>{t('optional')}</span>
              <span>{comment.length}/500</span>
            </div>
          </div>

          {/* Кнопки */}
          <div className="flex space-x-3 pt-4 border-t border-gray-200">
            <Button
              variant="outline"
              onClick={onClose}
              className="flex-1 focus:outline-none focus:ring-0 focus:ring-offset-0 focus-visible:outline-none focus-visible:ring-0 focus-visible:ring-offset-0"
              disabled={isSubmitting}
            >
              {t('cancel')}
            </Button>
            
            <Button
              onClick={handleSubmit}
              disabled={!isFormValid || isSubmitting}
              className="flex-1 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white shadow-lg hover:shadow-xl transition-all duration-200 focus:outline-none focus:ring-0 focus:ring-offset-0 focus-visible:outline-none focus-visible:ring-0 focus-visible:ring-offset-0"
            >
              {isSubmitting ? (
                <div className="flex items-center space-x-2">
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  <span>{t('submitting')}</span>
                </div>
              ) : (
                <div className="flex items-center space-x-2">
                  <Send className="w-4 h-4" />
                  <span>{t('submitReview')}</span>
                </div>
              )}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
