import { useState, useEffect } from 'react';
import { X, Star, Send, Heart } from 'lucide-react';
import { useTranslation } from '../lib/i18n';
import { StarRating } from './StarRating';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogOverlay } from '@/components/ui/dialog';
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

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogOverlay className="fixed inset-0 z-[10000] bg-black/90 backdrop-blur-sm" />
      <DialogContent className="w-[95vw] max-w-2xl max-h-[90vh] overflow-y-auto shadow-2xl border-2 border-gray-200 z-[10001]">
        <DialogHeader className="border-b border-gray-200 pb-4">
          <div className="flex items-center justify-between">
            <DialogTitle className="text-xl font-bold text-gray-900 flex items-center gap-2">
              <Heart className="w-6 h-6 text-red-500" />
              {t('leaveReview')}
            </DialogTitle>
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-100 rounded-full transition-colors focus:outline-none focus:ring-0 focus:ring-offset-0 focus-visible:outline-none focus-visible:ring-0 focus-visible:ring-offset-0 hidden"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
          <p className="text-gray-600 mt-2">
            {t('reviewForClinic')}: <span className="font-semibold text-blue-600">{clinicName}</span>
          </p>
        </DialogHeader>

        <div className="space-y-6 py-4">
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
                size="lg"
                label={t('quality')}
              />
              
              <StarRating
                value={ratings.service}
                onChange={(value) => handleRatingChange('service', value)}
                size="lg"
                label={t('service')}
              />
              
              <StarRating
                value={ratings.comfort}
                onChange={(value) => handleRatingChange('comfort', value)}
                size="lg"
                label={t('comfort')}
              />
              
              <StarRating
                value={ratings.price}
                onChange={(value) => handleRatingChange('price', value)}
                size="lg"
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
      </DialogContent>
    </Dialog>
  );
}
