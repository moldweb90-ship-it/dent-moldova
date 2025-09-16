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
  const [selectedClinic, setSelectedClinic] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedReview, setSelectedReview] = useState<ReviewWithClinic | null>(null);
  const queryClient = useQueryClient();

  const { data: reviewsData, isLoading, error } = useQuery({
    queryKey: ['admin-reviews', selectedStatus, selectedClinic],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (selectedStatus !== 'all') {
        params.append('status', selectedStatus);
      }
      if (selectedClinic !== 'all') {
        params.append('clinicId', selectedClinic);
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

  // Загружаем список клиник для фильтра
  const { data: clinicsData } = useQuery({
    queryKey: ['admin-clinics-list'],
    queryFn: async () => {
      const response = await apiRequest('GET', '/api/admin/clinics');
      if (!response.ok) {
        throw new Error('Ошибка загрузки клиник');
      }
      return response.json();
    },
  });

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
          <div className="flex items-center gap-4 text-gray-600">
            <span>Всего отзывов: {total}</span>
            {selectedClinic !== 'all' && (
              <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded-full text-sm">
                Фильтр: {clinicsData?.clinics?.find((c: any) => c.id === selectedClinic)?.nameRu}
              </span>
            )}
          </div>
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
            value={selectedClinic}
            onChange={(e) => setSelectedClinic(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent min-w-[200px]"
          >
            <option value="all">Все клиники</option>
            {clinicsData?.clinics?.map((clinic: any) => (
              <option key={clinic.id} value={clinic.id}>
                {clinic.nameRu}
              </option>
            ))}
          </select>
          
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

          {(selectedClinic !== 'all' || selectedStatus !== 'all') && (
            <Button
              onClick={() => {
                setSelectedClinic('all');
                setSelectedStatus('all');
                setSearchQuery('');
              }}
              variant="outline"
              className="whitespace-nowrap"
            >
              <X className="w-4 h-4 mr-2" />
              Сбросить
            </Button>
          )}
        </div>
      </div>

      {/* Compact Reviews Grid */}
      <div className="space-y-4">
        {reviews.length === 0 ? (
          <Card>
            <CardContent className="text-center py-8">
              <MessageSquare className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-600">Отзывы не найдены</p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {reviews.map((item: ReviewWithClinic) => (
              <Card 
                key={item.review.id} 
                className="hover:shadow-md transition-shadow cursor-pointer"
                onClick={() => setSelectedReview(item)}
              >
                <CardContent className="p-4">
                  <div className="flex flex-col gap-3">
                    {/* Header */}
                    <div className="flex items-start justify-between">
                      <div className="flex-1 min-w-0">
                        <h3 className="text-sm font-semibold text-gray-900 truncate">
                          {item.clinic.nameRu}
                        </h3>
                        <div className="flex items-center gap-2 text-xs text-gray-500 mt-1">
                          <Calendar className="w-3 h-3" />
                          <span>{new Date(item.review.createdAt).toLocaleDateString('ru-RU')}</span>
                        </div>
                      </div>
                      <div className="ml-2">
                        {getStatusBadge(item.review.status)}
                      </div>
                    </div>

                    {/* Author */}
                    {item.review.authorName && (
                      <div className="flex items-center gap-1 text-xs text-gray-600">
                        <User className="w-3 h-3" />
                        <span className="truncate">{item.review.authorName}</span>
                      </div>
                    )}

                    {/* Average Rating */}
                    <div className="flex items-center justify-center gap-2 p-2 bg-gray-50 rounded">
                      <div className="flex">
                        {renderStars(item.review.averageRating)}
                      </div>
                      <span className="text-lg font-bold text-gray-900">
                        {item.review.averageRating}
                      </span>
                    </div>

                    {/* Comment Preview */}
                    {item.review.comment && (
                      <div className="text-xs text-gray-600" style={{
                        display: '-webkit-box',
                        WebkitLineClamp: 2,
                        WebkitBoxOrient: 'vertical',
                        overflow: 'hidden'
                      }}>
                        "{item.review.comment}"
                      </div>
                    )}

                    {/* Quick Actions */}
                    <div className="flex gap-1 pt-2 border-t">
                      {item.review.status === 'pending' && (
                        <>
                          <Button
                            size="sm"
                            onClick={(e) => {
                              e.stopPropagation();
                              updateReviewStatus(item.review.id, 'approved');
                            }}
                            className="flex-1 bg-green-600 hover:bg-green-700 text-white text-xs py-1"
                          >
                            <Check className="w-3 h-3 mr-1" />
                            Одобрить
                          </Button>
                          <Button
                            size="sm"
                            onClick={(e) => {
                              e.stopPropagation();
                              updateReviewStatus(item.review.id, 'rejected');
                            }}
                            variant="outline"
                            className="flex-1 border-red-300 text-red-600 hover:bg-red-50 text-xs py-1"
                          >
                            <X className="w-3 h-3 mr-1" />
                            Отклонить
                          </Button>
                        </>
                      )}

                      {item.review.status === 'approved' && (
                        <Button
                          size="sm"
                          onClick={(e) => {
                            e.stopPropagation();
                            updateReviewStatus(item.review.id, 'rejected');
                          }}
                          variant="outline"
                          className="flex-1 border-red-300 text-red-600 hover:bg-red-50 text-xs py-1"
                        >
                          <X className="w-3 h-3 mr-1" />
                          Отклонить
                        </Button>
                      )}

                      {item.review.status === 'rejected' && (
                        <Button
                          size="sm"
                          onClick={(e) => {
                            e.stopPropagation();
                            updateReviewStatus(item.review.id, 'approved');
                          }}
                          className="flex-1 bg-green-600 hover:bg-green-700 text-white text-xs py-1"
                        >
                          <Check className="w-3 h-3 mr-1" />
                          Одобрить
                        </Button>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>

      {/* Review Detail Modal */}
      {selectedReview && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black bg-opacity-50">
          <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              {/* Modal Header */}
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h2 className="text-xl font-bold text-gray-900">Детали отзыва</h2>
                  <p className="text-sm text-gray-600 mt-1">
                    {selectedReview.clinic.nameRu}
                  </p>
                </div>
                <div className="flex items-center gap-3">
                  {getStatusBadge(selectedReview.review.status)}
                  <button
                    onClick={() => setSelectedReview(null)}
                    className="p-2 hover:bg-gray-100 rounded-full transition-colors"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>
              </div>

              {/* Review Info */}
              <div className="space-y-6">
                {/* Author & Date */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium text-gray-700">Автор</label>
                    <p className="text-gray-900">{selectedReview.review.authorName || 'Не указан'}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-700">Дата</label>
                    <p className="text-gray-900">
                      {new Date(selectedReview.review.createdAt).toLocaleDateString('ru-RU', {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit'
                      })}
                    </p>
                  </div>
                </div>

                {/* Contact Info */}
                {(selectedReview.review.authorEmail || selectedReview.review.authorPhone) && (
                  <div className="grid grid-cols-2 gap-4">
                    {selectedReview.review.authorEmail && (
                      <div>
                        <label className="text-sm font-medium text-gray-700">Email</label>
                        <p className="text-gray-900">{selectedReview.review.authorEmail}</p>
                      </div>
                    )}
                    {selectedReview.review.authorPhone && (
                      <div>
                        <label className="text-sm font-medium text-gray-700">Телефон</label>
                        <p className="text-gray-900">{selectedReview.review.authorPhone}</p>
                      </div>
                    )}
                  </div>
                )}

                {/* Detailed Ratings */}
                <div>
                  <label className="text-sm font-medium text-gray-700 mb-3 block">Оценки по критериям</label>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="text-center p-3 bg-gray-50 rounded-lg">
                      <p className="text-sm text-gray-600 mb-2">Качество</p>
                      <div className="flex justify-center mb-1">
                        {renderStars(selectedReview.review.qualityRating)}
                      </div>
                      <p className="font-medium">{selectedReview.review.qualityRating}</p>
                    </div>
                    <div className="text-center p-3 bg-gray-50 rounded-lg">
                      <p className="text-sm text-gray-600 mb-2">Сервис</p>
                      <div className="flex justify-center mb-1">
                        {renderStars(selectedReview.review.serviceRating)}
                      </div>
                      <p className="font-medium">{selectedReview.review.serviceRating}</p>
                    </div>
                    <div className="text-center p-3 bg-gray-50 rounded-lg">
                      <p className="text-sm text-gray-600 mb-2">Комфорт</p>
                      <div className="flex justify-center mb-1">
                        {renderStars(selectedReview.review.comfortRating)}
                      </div>
                      <p className="font-medium">{selectedReview.review.comfortRating}</p>
                    </div>
                    <div className="text-center p-3 bg-gray-50 rounded-lg">
                      <p className="text-sm text-gray-600 mb-2">Цены</p>
                      <div className="flex justify-center mb-1">
                        {renderStars(selectedReview.review.priceRating)}
                      </div>
                      <p className="font-medium">{selectedReview.review.priceRating}</p>
                    </div>
                  </div>
                </div>

                {/* Average Rating */}
                <div className="text-center p-4 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg border border-blue-200">
                  <label className="text-sm font-medium text-gray-700 block mb-2">Средний рейтинг</label>
                  <div className="flex justify-center items-center gap-3">
                    <div className="flex">
                      {renderStars(selectedReview.review.averageRating)}
                    </div>
                    <span className="text-2xl font-bold text-gray-900">
                      {selectedReview.review.averageRating}
                    </span>
                  </div>
                </div>

                {/* Comment */}
                {selectedReview.review.comment && (
                  <div>
                    <label className="text-sm font-medium text-gray-700 mb-2 block">Комментарий</label>
                    <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
                      <p className="text-gray-700 italic">"{selectedReview.review.comment}"</p>
                    </div>
                  </div>
                )}

                {/* Actions */}
                <div className="flex flex-wrap gap-3 pt-4 border-t">
                  {selectedReview.review.status === 'pending' && (
                    <>
                      <Button
                        onClick={() => {
                          updateReviewStatus(selectedReview.review.id, 'approved');
                          setSelectedReview(null);
                        }}
                        className="bg-green-600 hover:bg-green-700 text-white"
                      >
                        <Check className="w-4 h-4 mr-2" />
                        Одобрить
                      </Button>
                      <Button
                        onClick={() => {
                          updateReviewStatus(selectedReview.review.id, 'rejected');
                          setSelectedReview(null);
                        }}
                        variant="outline"
                        className="border-red-300 text-red-600 hover:bg-red-50"
                      >
                        <X className="w-4 h-4 mr-2" />
                        Отклонить
                      </Button>
                    </>
                  )}

                  {selectedReview.review.status === 'approved' && (
                    <Button
                      onClick={() => {
                        updateReviewStatus(selectedReview.review.id, 'rejected');
                        setSelectedReview(null);
                      }}
                      variant="outline"
                      className="border-red-300 text-red-600 hover:bg-red-50"
                    >
                      <X className="w-4 h-4 mr-2" />
                      Отклонить
                    </Button>
                  )}

                  {selectedReview.review.status === 'rejected' && (
                    <Button
                      onClick={() => {
                        updateReviewStatus(selectedReview.review.id, 'approved');
                        setSelectedReview(null);
                      }}
                      className="bg-green-600 hover:bg-green-700 text-white"
                    >
                      <Check className="w-4 h-4 mr-2" />
                      Одобрить
                    </Button>
                  )}

                  <Button
                    onClick={() => {
                      if (confirm('Вы уверены, что хотите удалить этот отзыв?')) {
                        deleteReview(selectedReview.review.id);
                        setSelectedReview(null);
                      }
                    }}
                    variant="outline"
                    className="border-red-300 text-red-600 hover:bg-red-50"
                  >
                    <Trash2 className="w-4 h-4 mr-2" />
                    Удалить
                  </Button>

                  <Button
                    onClick={() => setSelectedReview(null)}
                    variant="outline"
                    className="ml-auto"
                  >
                    Закрыть
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}