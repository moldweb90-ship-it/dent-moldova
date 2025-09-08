import React, { useState } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  MessageSquare, 
  Calendar, 
  User, 
  Star, 
  Check, 
  X, 
  Trash2,
  Search
} from 'lucide-react';
import { apiRequest } from '../../lib/utils';

interface Review {
  id: string;
  clinicId: string;
  authorName: string;
  authorEmail: string;
  qualityRating: string;
  serviceRating: string;
  comfortRating: string;
  priceRating: string;
  averageRating: string;
  comment: string;
  status: 'pending' | 'approved' | 'rejected';
  createdAt: string;
  updatedAt: string;
}

interface Clinic {
  id: string;
  nameRu: string;
  nameRo: string;
}

interface ReviewWithClinic {
  review: Review;
  clinic: Clinic;
}

export function ReviewsManagement() {
  const [selectedStatus, setSelectedStatus] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const queryClient = useQueryClient();

  const { data: reviewsData, isLoading, error } = useQuery({
    queryKey: ['admin-reviews', selectedStatus],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (selectedStatus !== 'all') {
        params.append('status', selectedStatus);
      }
      
      const response = await apiRequest('GET', `/api/admin/reviews?${params.toString()}`);
      if (!response.ok) {
        throw new Error('Ошибка загрузки отзывов');
      }
      return response.json();
    },
  });

  const reviews = reviewsData?.reviews || [];
  const total = reviewsData?.total || 0;

  const updateReviewStatus = async (reviewId: string, status: 'approved' | 'rejected') => {
    try {
      console.log('🔍 Updating review status:', { reviewId, status });
      
      const response = await apiRequest('PATCH', `/api/admin/reviews/${reviewId}/status`, { status });

      console.log('🔍 Response status:', response.status);
      console.log('🔍 Response ok:', response.ok);

      if (!response.ok) {
        const errorText = await response.text();
        console.error('🔍 Error response:', errorText);
        throw new Error('Ошибка обновления статуса');
      }

      console.log('✅ Review status updated successfully');
      queryClient.invalidateQueries({ queryKey: ['admin-reviews'] });
    } catch (error) {
      console.error('❌ Ошибка обновления статуса:', error);
    }
  };

  const deleteReview = async (reviewId: string) => {
    if (!confirm('Вы уверены, что хотите удалить этот отзыв?')) {
      return;
    }

    try {
      const response = await apiRequest('DELETE', `/api/admin/reviews/${reviewId}`);

      if (!response.ok) {
        throw new Error('Ошибка удаления отзыва');
      }

      queryClient.invalidateQueries({ queryKey: ['admin-reviews'] });
    } catch (error) {
      console.error('Ошибка удаления отзыва:', error);
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'pending':
        return <Badge variant="secondary">Ожидает</Badge>;
      case 'approved':
        return <Badge variant="default" className="bg-green-600">Одобрен</Badge>;
      case 'rejected':
        return <Badge variant="destructive">Отклонен</Badge>;
      default:
        return <Badge variant="secondary">{status}</Badge>;
    }
  };

  const renderStars = (rating: string) => {
    const numRating = parseFloat(rating);
    const stars = [];

    for (let i = 1; i <= 5; i++) {
      if (i <= numRating) {
        stars.push(<Star key={i} className="w-4 h-4 text-yellow-400 fill-current" />);
      } else if (i - 0.5 <= numRating) {
        stars.push(<Star key={i} className="w-4 h-4 text-yellow-400 fill-current opacity-50" />);
      } else {
        stars.push(<Star key={i} className="w-4 h-4 text-gray-300" />);
      }
    }

    return <div className="flex space-x-1">{stars}</div>;
  };

  if (isLoading) {
    return (
      <div className="space-y-4">
        <div className="h-8 bg-gray-200 rounded animate-pulse"></div>
        <div className="grid gap-4">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="h-24 bg-gray-200 rounded animate-pulse"></div>
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-8">
        <p className="text-red-600">Ошибка загрузки отзывов</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Управление отзывами</h2>
          <p className="text-gray-600">Всего отзывов: {total}</p>
        </div>
        
        {/* Filters */}
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <input
              type="text"
              placeholder="Поиск по клинике..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
          
          <select
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="all">Все статусы</option>
            <option value="pending">Ожидают</option>
            <option value="approved">Одобрены</option>
            <option value="rejected">Отклонены</option>
          </select>
        </div>
      </div>

      {/* Reviews List */}
      <div className="space-y-4">
        {reviews.length === 0 ? (
          <Card>
            <CardContent className="text-center py-8">
              <MessageSquare className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-600">Отзывы не найдены</p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {reviews.map((item: ReviewWithClinic) => (
              <Card key={item.review.id} className="hover:shadow-md transition-shadow">
                <CardContent className="p-6">
                  <div className="flex flex-col gap-4">
                    {/* Header */}
                    <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
                      <div>
                        <h3 className="text-lg font-semibold text-gray-900">
                          {item.clinic.nameRu}
                        </h3>
                        <div className="flex items-center gap-4 text-sm text-gray-600 mt-2">
                          <div className="flex items-center gap-1">
                            <Calendar className="w-4 h-4" />
                            <span>{new Date(item.review.createdAt).toLocaleDateString('ru-RU')}</span>
                          </div>
                          {item.review.authorName && (
                            <div className="flex items-center gap-1">
                              <User className="w-4 h-4" />
                              <span>{item.review.authorName}</span>
                            </div>
                          )}
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        {getStatusBadge(item.review.status)}
                      </div>
                    </div>

                    {/* Ratings */}
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                      <div className="text-center">
                        <p className="text-sm text-gray-600 mb-2">Качество</p>
                        <div className="flex justify-center mb-1">
                          {renderStars(item.review.qualityRating)}
                        </div>
                        <p className="text-sm font-medium">{item.review.qualityRating}</p>
                      </div>
                      <div className="text-center">
                        <p className="text-sm text-gray-600 mb-2">Сервис</p>
                        <div className="flex justify-center mb-1">
                          {renderStars(item.review.serviceRating)}
                        </div>
                        <p className="text-sm font-medium">{item.review.serviceRating}</p>
                      </div>
                      <div className="text-center">
                        <p className="text-sm text-gray-600 mb-2">Комфорт</p>
                        <div className="flex justify-center mb-1">
                          {renderStars(item.review.comfortRating)}
                        </div>
                        <p className="text-sm font-medium">{item.review.comfortRating}</p>
                      </div>
                      <div className="text-center">
                        <p className="text-sm text-gray-600 mb-2">Цены</p>
                        <div className="flex justify-center mb-1">
                          {renderStars(item.review.priceRating)}
                        </div>
                        <p className="text-sm font-medium">{item.review.priceRating}</p>
                      </div>
                    </div>

                    {/* Average Rating */}
                    <div className="text-center p-4 bg-gray-50 rounded-lg">
                      <p className="text-sm text-gray-600 mb-2">Средний рейтинг</p>
                      <div className="flex justify-center items-center gap-2">
                        <div className="flex">
                          {renderStars(item.review.averageRating)}
                        </div>
                        <span className="text-xl font-bold text-gray-900">
                          {item.review.averageRating}
                        </span>
                      </div>
                    </div>

                    {/* Comment */}
                    {item.review.comment && (
                      <div className="p-4 bg-blue-50 rounded-lg">
                        <p className="text-gray-700 italic">"{item.review.comment}"</p>
                      </div>
                    )}

                    {/* Actions */}
                    <div className="flex flex-wrap gap-2 pt-4 border-t">
                      {item.review.status === 'pending' && (
                        <>
                          <Button
                            onClick={() => updateReviewStatus(item.review.id, 'approved')}
                            className="bg-green-600 hover:bg-green-700 text-white"
                          >
                            <Check className="w-4 h-4 mr-2" />
                            Одобрить
                          </Button>
                          <Button
                            onClick={() => updateReviewStatus(item.review.id, 'rejected')}
                            variant="outline"
                            className="border-red-300 text-red-600 hover:bg-red-50"
                          >
                            <X className="w-4 h-4 mr-2" />
                            Отклонить
                          </Button>
                        </>
                      )}

                      {item.review.status === 'approved' && (
                        <Button
                          onClick={() => updateReviewStatus(item.review.id, 'rejected')}
                          variant="outline"
                          className="border-red-300 text-red-600 hover:bg-red-50"
                        >
                          <X className="w-4 h-4 mr-2" />
                          Отклонить
                        </Button>
                      )}

                      {item.review.status === 'rejected' && (
                        <Button
                          onClick={() => updateReviewStatus(item.review.id, 'approved')}
                          className="bg-green-600 hover:bg-green-700 text-white"
                        >
                          <Check className="w-4 h-4 mr-2" />
                          Одобрить
                        </Button>
                      )}

                      <Button
                        onClick={() => deleteReview(item.review.id)}
                        variant="outline"
                        className="border-red-300 text-red-600 hover:bg-red-50"
                      >
                        <Trash2 className="w-4 h-4 mr-2" />
                        Удалить
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}