import { useState, useEffect } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { apiRequest } from '@/lib/queryClient';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Star, 
  Check, 
  X, 
  Trash2, 
  Eye, 
  Calendar,
  User,
  MessageSquare,
  Filter,
  Search
} from 'lucide-react';

interface Review {
  id: string;
  clinicId: string;
  authorName?: string;
  authorEmail?: string;
  authorPhone?: string;
  qualityRating: string;
  serviceRating: string;
  comfortRating: string;
  priceRating: string;
  averageRating: string;
  comment?: string;
  status: 'pending' | 'approved' | 'rejected';
  ipAddress?: string;
  userAgent?: string;
  createdAt: string;
  updatedAt: string;
  approvedAt?: string;
  rejectedAt?: string;
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
  const [selectedStatus, setSelectedStatus] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [page, setPage] = useState(1);
  const [selectedReview, setSelectedReview] = useState<ReviewWithClinic | null>(null);
  const queryClient = useQueryClient();

  const { data: reviewsData, isLoading, error } = useQuery({
    queryKey: ['admin-reviews', selectedStatus, page],
    queryFn: async () => {
      const params = new URLSearchParams({
        page: page.toString(),
        limit: '20'
      });
      
      if (selectedStatus !== 'all') {
        params.set('status', selectedStatus);
      }

      const response = await apiRequest('GET', `/api/admin/reviews?${params}`);
      return response.json();
    },
  });

  const updateReviewStatus = async (reviewId: string, status: string) => {
    try {
      const response = await fetch(`/api/admin/reviews/${reviewId}/status`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ status }),
      });

      if (!response.ok) throw new Error('Failed to update review status');

      // Обновляем кэш
      queryClient.invalidateQueries({ queryKey: ['admin-reviews'] });
    } catch (error) {
      console.error('Error updating review status:', error);
    }
  };

  const deleteReview = async (reviewId: string) => {
    if (!confirm('Вы уверены, что хотите удалить этот отзыв?')) return;

    try {
      const response = await fetch(`/api/admin/reviews/${reviewId}`, {
        method: 'DELETE',
      });

      if (!response.ok) throw new Error('Failed to delete review');

      // Обновляем кэш
      queryClient.invalidateQueries({ queryKey: ['admin-reviews'] });
    } catch (error) {
      console.error('Error deleting review:', error);
    }
  };

  const getStatusBadge = (status: string) => {
    const variants = {
      pending: 'bg-yellow-100 text-yellow-800',
      approved: 'bg-green-100 text-green-800',
      rejected: 'bg-red-100 text-red-800'
    };

    const labels = {
      pending: 'Ожидает',
      approved: 'Одобрен',
      rejected: 'Отклонен'
    };

    return (
      <Badge className={variants[status as keyof typeof variants]}>
        {labels[status as keyof typeof labels]}
      </Badge>
    );
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

  const reviews = reviewsData?.reviews || [];
  const total = reviewsData?.total || 0;
  const totalPages = Math.ceil(total / 20);

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
          reviews.map((item: ReviewWithClinic) => (
            <Card key={item.review.id} className="hover:shadow-md transition-shadow">
              <CardContent className="p-6">
                <div className="flex flex-col lg:flex-row lg:items-start gap-4">
                  {/* Main Content */}
                  <div className="flex-1 space-y-3">
                    {/* Header */}
                    <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-2">
                      <div>
                        <h3 className="font-semibold text-gray-900">
                          {item.clinic.nameRu}
                        </h3>
                        <div className="flex items-center gap-2 text-sm text-gray-600">
                          <Calendar className="w-4 h-4" />
                          <span>{new Date(item.review.createdAt).toLocaleDateString('ru-RU')}</span>
                          {item.review.authorName && (
                            <>
                              <User className="w-4 h-4" />
                              <span>{item.review.authorName}</span>
                            </>
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
                        <p className="text-xs text-gray-600 mb-1">Качество</p>
                        <div className="flex justify-center mb-1">
                          {renderStars(item.review.qualityRating)}
                        </div>
                        <p className="text-sm font-medium">{item.review.qualityRating}</p>
                      </div>
                      <div className="text-center">
                        <p className="text-xs text-gray-600 mb-1">Сервис</p>
                        <div className="flex justify-center mb-1">
                          {renderStars(item.review.serviceRating)}
                        </div>
                        <p className="text-sm font-medium">{item.review.serviceRating}</p>
                      </div>
                      <div className="text-center">
                        <p className="text-xs text-gray-600 mb-1">Комфорт</p>
                        <div className="flex justify-center mb-1">
                          {renderStars(item.review.comfortRating)}
                        </div>
                        <p className="text-sm font-medium">{item.review.comfortRating}</p>
                      </div>
                      <div className="text-center">
                        <p className="text-xs text-gray-600 mb-1">Цены</p>
                        <div className="flex justify-center mb-1">
                          {renderStars(item.review.priceRating)}
                        </div>
                        <p className="text-sm font-medium">{item.review.priceRating}</p>
                      </div>
                    </div>

                    {/* Average Rating */}
                    <div className="text-center p-3 bg-gray-50 rounded-lg">
                      <p className="text-sm text-gray-600 mb-1">Средний рейтинг</p>
                      <div className="flex justify-center items-center gap-2">
                        <div className="flex">
                          {renderStars(item.review.averageRating)}
                        </div>
                        <span className="text-lg font-bold text-gray-900">
                          {item.review.averageRating}
                        </span>
                      </div>
                    </div>

                    {/* Comment */}
                    {item.review.comment && (
                      <div className="p-3 bg-blue-50 rounded-lg">
                        <p className="text-sm text-gray-700">{item.review.comment}</p>
                      </div>
                    )}
                  </div>

                  {/* Actions */}
                  <div className="flex flex-col gap-2 lg:min-w-[200px]">
                    {item.review.status === 'pending' && (
                      <>
                        <Button
                          onClick={() => updateReviewStatus(item.review.id, 'approved')}
                          className="w-full bg-green-600 hover:bg-green-700 text-white"
                          size="sm"
                        >
                          <Check className="w-4 h-4 mr-2" />
                          Одобрить
                        </Button>
                        <Button
                          onClick={() => updateReviewStatus(item.review.id, 'rejected')}
                          variant="outline"
                          className="w-full border-red-300 text-red-600 hover:bg-red-50"
                          size="sm"
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
                        className="w-full border-red-300 text-red-600 hover:bg-red-50"
                        size="sm"
                      >
                        <X className="w-4 h-4 mr-2" />
                        Отклонить
                      </Button>
                    )}
                    
                    {item.review.status === 'rejected' && (
                      <Button
                        onClick={() => updateReviewStatus(item.review.id, 'approved')}
                        className="w-full bg-green-600 hover:bg-green-700 text-white"
                        size="sm"
                      >
                        <Check className="w-4 h-4 mr-2" />
                        Одобрить
                      </Button>
                    )}
                    
                    <Button
                      onClick={() => deleteReview(item.review.id)}
                      variant="outline"
                      className="w-full border-red-300 text-red-600 hover:bg-red-50"
                      size="sm"
                    >
                      <Trash2 className="w-4 h-4 mr-2" />
                      Удалить
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex justify-center space-x-2">
          <Button
            onClick={() => setPage(Math.max(1, page - 1))}
            disabled={page === 1}
            variant="outline"
            size="sm"
          >
            Назад
          </Button>
          
          <span className="flex items-center px-4 py-2 text-sm text-gray-600">
            Страница {page} из {totalPages}
          </span>
          
          <Button
            onClick={() => setPage(Math.min(totalPages, page + 1))}
            disabled={page === totalPages}
            variant="outline"
            size="sm"
          >
            Вперед
          </Button>
        </div>
      )}
    </div>
  );
}
