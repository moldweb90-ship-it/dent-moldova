import { useState, useEffect } from 'react';
import { useTranslation } from '@/lib/i18n';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { CheckCircle, XCircle, Clock, Eye, Shield, Trash2 } from 'lucide-react';

interface VerificationRequest {
  id: string;
  clinicId: string;
  clinicName: string;
  clinicAddress?: string;
  requesterEmail: string;
  requesterPhone: string;
  status: 'pending' | 'approved' | 'rejected';
  notes?: string;
  createdAt: string;
  updatedAt: string;
  clinic: {
    id: string;
    nameRu: string;
    nameRo: string;
    verified: boolean;
  };
}

export function VerificationRequests() {
  const { t, language } = useTranslation();
  const [requests, setRequests] = useState<VerificationRequest[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [selectedRequest, setSelectedRequest] = useState<VerificationRequest | null>(null);
  const [showDetails, setShowDetails] = useState(false);
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [page, setPage] = useState(1);
  const [updating, setUpdating] = useState<string | null>(null);
  const [deleting, setDeleting] = useState<string | null>(null);

  const fetchRequests = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams({
        page: page.toString(),
        limit: '20',
      });
      
      if (statusFilter !== 'all') {
        params.append('status', statusFilter);
      }
      
      const response = await fetch(`/api/admin/verification-requests?${params}`);
      const data = await response.json();
      
      setRequests(data.requests);
      setTotal(data.total);
    } catch (error) {
      console.error('Error fetching verification requests:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRequests();
  }, [page, statusFilter]);

  const handleStatusUpdate = async (requestId: string, status: 'approved' | 'rejected', notes?: string) => {
    try {
      setUpdating(requestId);
      
      const response = await fetch(`/api/admin/verification-requests/${requestId}/status`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ status, notes }),
      });
      
      if (response.ok) {
        // Обновляем список
        fetchRequests();
        setShowDetails(false);
        setSelectedRequest(null);
      }
    } catch (error) {
      console.error('Error updating verification request:', error);
    } finally {
      setUpdating(null);
    }
  };

  const handleDelete = async (requestId: string) => {
    if (!confirm('Вы уверены, что хотите удалить эту заявку? Это действие нельзя отменить.')) {
      return;
    }
    
    try {
      setDeleting(requestId);
      console.log('🗑️ Attempting to delete verification request:', requestId);
      
      const response = await fetch(`/api/admin/verification-requests/${requestId}`, {
        method: 'DELETE',
      });
      
      console.log('📡 Delete response status:', response.status);
      
      if (response.ok) {
        const result = await response.json();
        console.log('✅ Delete successful:', result);
        // Обновляем список
        fetchRequests();
      } else {
        const errorData = await response.json().catch(() => ({}));
        console.error('❌ Delete failed:', errorData);
        alert(`Ошибка при удалении заявки: ${errorData.error || 'Неизвестная ошибка'}`);
      }
    } catch (error) {
      console.error('❌ Error deleting verification request:', error);
      alert('Ошибка при удалении заявки');
    } finally {
      setDeleting(null);
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'pending':
        return <Badge variant="secondary" className="bg-yellow-100 text-yellow-800"><Clock className="w-3 h-3 mr-1" />Ожидает</Badge>;
      case 'approved':
        return <Badge variant="default" className="bg-green-100 text-green-800"><CheckCircle className="w-3 h-3 mr-1" />Одобрено</Badge>;
      case 'rejected':
        return <Badge variant="destructive" className="bg-red-100 text-red-800"><XCircle className="w-3 h-3 mr-1" />Отклонено</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('ru-RU', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  if (loading) {
    return (
      <div className="p-6">
        <div className="flex items-center justify-center h-64">
          <div className="text-gray-500">Загрузка заявок...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Заявки на верификацию</h1>
          <p className="text-gray-600 mt-1">Управление заявками на верификацию клиник</p>
        </div>
        <div className="flex items-center space-x-2">
          <Shield className="h-6 w-6 text-blue-600" />
          <span className="text-sm text-gray-600">Всего: {total}</span>
        </div>
      </div>

      {/* Filters */}
      <div className="flex items-center space-x-4">
        <div className="flex items-center space-x-2">
          <label className="text-sm font-medium text-gray-700">Статус:</label>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="border border-gray-300 rounded-md px-3 py-1 text-sm"
          >
            <option value="all">Все</option>
            <option value="pending">Ожидают</option>
            <option value="approved">Одобренные</option>
            <option value="rejected">Отклоненные</option>
          </select>
        </div>
      </div>

      {/* Requests List */}
      <div className="grid gap-4">
        {requests.length === 0 ? (
          <Card>
            <CardContent className="p-8 text-center">
              <Shield className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">Нет заявок</h3>
              <p className="text-gray-600">Заявки на верификацию отсутствуют</p>
            </CardContent>
          </Card>
        ) : (
          requests.map((request) => (
            <Card key={request.id} className="hover:shadow-md transition-shadow">
              <CardContent className="p-6">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center space-x-3 mb-2">
                      <h3 className="text-lg font-semibold text-gray-900">
                        {language === 'ru' ? request.clinic.nameRu : request.clinic.nameRo}
                      </h3>
                      {getStatusBadge(request.status)}
                      {request.clinic.verified && (
                        <Badge variant="default" className="bg-green-100 text-green-800">
                          Верифицирована
                        </Badge>
                      )}
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-gray-600">
                      <div>
                        <p><strong>Email:</strong> {request.requesterEmail}</p>
                        <p><strong>Телефон:</strong> {request.requesterPhone}</p>
                      </div>
                      <div>
                        <p><strong>Дата заявки:</strong> {formatDate(request.createdAt)}</p>
                        {request.clinicAddress && (
                          <p><strong>Адрес:</strong> {request.clinicAddress}</p>
                        )}
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-2 ml-4">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        setSelectedRequest(request);
                        setShowDetails(true);
                      }}
                    >
                      <Eye className="h-4 w-4 mr-1" />
                      Детали
                    </Button>
                    
                    {request.status === 'pending' && (
                      <>
                        <Button
                          variant="default"
                          size="sm"
                          onClick={() => handleStatusUpdate(request.id, 'approved')}
                          disabled={updating === request.id}
                          className="bg-green-600 hover:bg-green-700"
                        >
                          <CheckCircle className="h-4 w-4 mr-1" />
                          Одобрить
                        </Button>
                        <Button
                          variant="destructive"
                          size="sm"
                          onClick={() => handleStatusUpdate(request.id, 'rejected')}
                          disabled={updating === request.id}
                        >
                          <XCircle className="h-4 w-4 mr-1" />
                          Отклонить
                        </Button>
                      </>
                    )}
                    
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleDelete(request.id)}
                      disabled={deleting === request.id}
                      className="text-red-600 border-red-300 hover:bg-red-50"
                    >
                      <Trash2 className="h-4 w-4 mr-1" />
                      {deleting === request.id ? 'Удаление...' : 'Удалить'}
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>

      {/* Pagination */}
      {total > 20 && (
        <div className="flex items-center justify-center space-x-2">
          <Button
            variant="outline"
            onClick={() => setPage(Math.max(1, page - 1))}
            disabled={page === 1}
          >
            Назад
          </Button>
          <span className="text-sm text-gray-600">
            Страница {page} из {Math.ceil(total / 20)}
          </span>
          <Button
            variant="outline"
            onClick={() => setPage(page + 1)}
            disabled={page >= Math.ceil(total / 20)}
          >
            Вперед
          </Button>
        </div>
      )}

      {/* Details Modal */}
      <Dialog open={showDetails} onOpenChange={setShowDetails}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Детали заявки на верификацию</DialogTitle>
          </DialogHeader>
          
          {selectedRequest && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <h4 className="font-semibold text-gray-900 mb-2">Клиника</h4>
                  <p className="text-sm text-gray-600">
                    <strong>Название:</strong> {language === 'ru' ? selectedRequest.clinic.nameRu : selectedRequest.clinic.nameRo}
                  </p>
                  {selectedRequest.clinicAddress && (
                    <p className="text-sm text-gray-600">
                      <strong>Адрес:</strong> {selectedRequest.clinicAddress}
                    </p>
                  )}
                  <p className="text-sm text-gray-600">
                    <strong>Статус верификации:</strong> {selectedRequest.clinic.verified ? 'Верифицирована' : 'Не верифицирована'}
                  </p>
                </div>
                
                <div>
                  <h4 className="font-semibold text-gray-900 mb-2">Заявитель</h4>
                  <p className="text-sm text-gray-600">
                    <strong>Email:</strong> {selectedRequest.requesterEmail}
                  </p>
                  <p className="text-sm text-gray-600">
                    <strong>Телефон:</strong> {selectedRequest.requesterPhone}
                  </p>
                  <p className="text-sm text-gray-600">
                    <strong>Дата заявки:</strong> {formatDate(selectedRequest.createdAt)}
                  </p>
                </div>
              </div>
              
              {selectedRequest.notes && (
                <div>
                  <h4 className="font-semibold text-gray-900 mb-2">Примечания</h4>
                  <p className="text-sm text-gray-600 bg-gray-50 p-3 rounded-md">
                    {selectedRequest.notes}
                  </p>
                </div>
              )}
              
              {selectedRequest.status === 'pending' && (
                <div className="space-y-4">
                  <h4 className="font-semibold text-gray-900">Действия</h4>
                  <div className="flex space-x-3">
                    <Button
                      onClick={() => handleStatusUpdate(selectedRequest.id, 'approved')}
                      disabled={updating === selectedRequest.id}
                      className="bg-green-600 hover:bg-green-700"
                    >
                      <CheckCircle className="h-4 w-4 mr-2" />
                      Одобрить заявку
                    </Button>
                    <Button
                      variant="destructive"
                      onClick={() => handleStatusUpdate(selectedRequest.id, 'rejected')}
                      disabled={updating === selectedRequest.id}
                    >
                      <XCircle className="h-4 w-4 mr-2" />
                      Отклонить заявку
                    </Button>
                  </div>
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
