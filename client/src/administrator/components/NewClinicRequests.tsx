import { useState, useEffect } from 'react';
import { useTranslation } from '@/lib/i18n';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { CheckCircle, XCircle, Clock, Eye, Building2, Trash2, Mail, Phone, MapPin, Globe } from 'lucide-react';

interface NewClinicRequest {
  id: string;
  clinicName: string;
  contactEmail: string | null;
  contactPhone: string;
  city: string | null;
  address: string | null;
  website?: string;
  specializations: string[] | null;
  description: string | null;
  status: 'pending' | 'approved' | 'rejected';
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

export function NewClinicRequests() {
  const { t, language } = useTranslation();
  const [requests, setRequests] = useState<NewClinicRequest[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [selectedRequest, setSelectedRequest] = useState<NewClinicRequest | null>(null);
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
      
             const response = await fetch(`/api/admin/new-clinic-requests?${params}`);
       const data = await response.json();
       
       console.log('🔍 Fetched new clinic requests:', data.requests);
       
       setRequests(data.requests);
       setTotal(data.total);
    } catch (error) {
      console.error('Error fetching new clinic requests:', error);
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
      
      const response = await fetch(`/api/admin/new-clinic-requests/${requestId}/status`, {
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
      console.error('Error updating new clinic request:', error);
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
      
      const response = await fetch(`/api/admin/new-clinic-requests/${requestId}`, {
        method: 'DELETE',
      });
      
      if (response.ok) {
        console.log('✅ Delete successful');
        fetchRequests();
      } else {
        const errorData = await response.json();
        console.error('❌ Delete failed:', errorData);
      }
    } catch (error) {
      console.error('❌ Error deleting new clinic request:', error);
    } finally {
      setDeleting(null);
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'pending':
        return <Badge className="bg-yellow-100 text-yellow-800"><Clock className="h-3 w-3 mr-1" />Ожидает</Badge>;
      case 'approved':
        return <Badge className="bg-green-100 text-green-800"><CheckCircle className="h-3 w-3 mr-1" />Одобрено</Badge>;
      case 'rejected':
        return <Badge className="bg-red-100 text-red-800"><XCircle className="h-3 w-3 mr-1" />Отклонено</Badge>;
      default:
        return <Badge variant="secondary">{status}</Badge>;
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('ru-RU', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  // Функция для получения названия города по ID
  const getCityDisplayName = (cityId: string | null) => {
    if (!cityId) return null;
    
    const cities = [
      { id: 'chisinau', nameRu: 'Кишинев', nameRo: 'Chișinău' },
      { id: 'balti', nameRu: 'Бельцы', nameRo: 'Bălți' },
      { id: 'tiraspol', nameRu: 'Тирасполь', nameRo: 'Tiraspol' },
      { id: 'cahul', nameRu: 'Кахул', nameRo: 'Cahul' },
      { id: 'orhei', nameRu: 'Орхей', nameRo: 'Orhei' },
      { id: 'comrat', nameRu: 'Комрат', nameRo: 'Comrat' }
    ];
    
    const city = cities.find(c => c.id === cityId);
    if (city) {
      return language === 'ru' ? city.nameRu : city.nameRo;
    }
    
    // Если не найден по ID, возвращаем как есть (возможно, уже переведенное название)
    return cityId;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-gray-900">Заявки на новые клиники</h2>
        <div className="flex gap-2">
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-md text-sm"
          >
            <option value="all">Все статусы</option>
            <option value="pending">Ожидающие</option>
            <option value="approved">Одобренные</option>
            <option value="rejected">Отклоненные</option>
          </select>
        </div>
      </div>

      {requests.length === 0 ? (
        <Card>
          <CardContent className="flex items-center justify-center h-32">
            <p className="text-gray-500">Нет заявок на новые клиники</p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4">
          {requests.map((request) => (
            <Card key={request.id} className="hover:shadow-md transition-shadow">
              <CardContent className="p-6">
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                                         <div className="flex items-center gap-3 mb-3">
                       <Building2 className="h-5 w-5 text-blue-600" />
                       <h3 
                         className="text-lg font-semibold text-gray-900 cursor-pointer hover:text-blue-600 transition-colors"
                         onClick={() => {
                           setSelectedRequest(request);
                           setShowDetails(true);
                         }}
                       >
                         {request.clinicName || 'Без названия'}
                       </h3>
                       {getStatusBadge(request.status)}
                     </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                      <div className="space-y-2">
                                                 {request.contactEmail && (
                           <div className="flex items-center gap-2 text-sm text-gray-600">
                             <Mail className="h-4 w-4" />
                             <span>{request.contactEmail}</span>
                           </div>
                         )}
                        <div className="flex items-center gap-2 text-sm text-gray-600">
                          <Phone className="h-4 w-4" />
                          <span>{request.contactPhone}</span>
                        </div>
                      </div>
                      <div className="space-y-2">
                                                 {(request.city || request.address) && (
                           <div className="flex items-center gap-2 text-sm text-gray-600">
                             <MapPin className="h-4 w-4" />
                             <span>{[getCityDisplayName(request.city), request.address].filter(Boolean).join(', ')}</span>
                           </div>
                         )}
                        {request.website && (
                          <div className="flex items-center gap-2 text-sm text-gray-600">
                            <Globe className="h-4 w-4" />
                            <span>{request.website}</span>
                          </div>
                        )}
                      </div>
                    </div>
                    
                                         {request.description && (
                       <p className="text-sm text-gray-600 mb-3 line-clamp-2">
                         {request.description}
                       </p>
                     )}
                    
                    <div className="flex items-center justify-between text-xs text-gray-500">
                      <span>Создано: {formatDate(request.createdAt)}</span>
                      {request.updatedAt !== request.createdAt && (
                        <span>Обновлено: {formatDate(request.updatedAt)}</span>
                      )}
                    </div>
                  </div>
                  
                  <div className="flex gap-2 ml-4">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        setSelectedRequest(request);
                        setShowDetails(true);
                      }}
                    >
                      <Eye className="h-4 w-4" />
                    </Button>
                    
                    {request.status === 'pending' && (
                      <>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleStatusUpdate(request.id, 'approved')}
                          disabled={updating === request.id}
                          className="text-green-600 hover:text-green-700"
                        >
                          <CheckCircle className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleStatusUpdate(request.id, 'rejected')}
                          disabled={updating === request.id}
                          className="text-red-600 hover:text-red-700"
                        >
                          <XCircle className="h-4 w-4" />
                        </Button>
                      </>
                    )}
                    
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleDelete(request.id)}
                      disabled={deleting === request.id}
                      className="text-red-600 hover:text-red-700"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Details Modal */}
      {selectedRequest && (
        <Dialog open={showDetails} onOpenChange={setShowDetails}>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
                             <DialogTitle className="flex items-center gap-2">
                 <Building2 className="h-5 w-5 text-blue-600" />
                 {selectedRequest.clinicName || 'Без названия'}
               </DialogTitle>
            </DialogHeader>
            
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <h4 className="font-semibold text-gray-900 mb-2">Контактная информация</h4>
                  <div className="space-y-2 text-sm">
                                         {selectedRequest.contactEmail && (
                       <div className="flex items-center gap-2">
                         <Mail className="h-4 w-4 text-gray-400" />
                         <span>{selectedRequest.contactEmail}</span>
                       </div>
                     )}
                    <div className="flex items-center gap-2">
                      <Phone className="h-4 w-4 text-gray-400" />
                      <span>{selectedRequest.contactPhone}</span>
                    </div>
                  </div>
                </div>
                
                <div>
                  <h4 className="font-semibold text-gray-900 mb-2">Адрес</h4>
                  <div className="space-y-2 text-sm">
                                         {(selectedRequest.city || selectedRequest.address) && (
                       <div className="flex items-center gap-2">
                         <MapPin className="h-4 w-4 text-gray-400" />
                         <span>{[getCityDisplayName(selectedRequest.city), selectedRequest.address].filter(Boolean).join(', ')}</span>
                       </div>
                     )}
                    {selectedRequest.website && (
                      <div className="flex items-center gap-2">
                        <Globe className="h-4 w-4 text-gray-400" />
                        <span>{selectedRequest.website}</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
              
                             {selectedRequest.description && (
                 <div>
                   <h4 className="font-semibold text-gray-900 mb-2">Описание</h4>
                   <p className="text-sm text-gray-600 whitespace-pre-wrap">{selectedRequest.description}</p>
                 </div>
               )}
              
              {selectedRequest.specializations && selectedRequest.specializations.length > 0 && (
                <div>
                  <h4 className="font-semibold text-gray-900 mb-2">Специализации</h4>
                  <div className="flex flex-wrap gap-2">
                    {selectedRequest.specializations.map((spec, index) => (
                      <Badge key={index} variant="secondary">{spec}</Badge>
                    ))}
                  </div>
                </div>
              )}
              
              <div className="flex items-center justify-between text-sm text-gray-500">
                <span>Создано: {formatDate(selectedRequest.createdAt)}</span>
                {selectedRequest.updatedAt !== selectedRequest.createdAt && (
                  <span>Обновлено: {formatDate(selectedRequest.updatedAt)}</span>
                )}
              </div>
              
              {selectedRequest.status === 'pending' && (
                <div className="flex gap-2 pt-4 border-t">
                  <Button
                    onClick={() => handleStatusUpdate(selectedRequest.id, 'approved')}
                    disabled={updating === selectedRequest.id}
                    className="bg-green-600 hover:bg-green-700"
                  >
                    <CheckCircle className="h-4 w-4 mr-2" />
                    Одобрить
                  </Button>
                  <Button
                    onClick={() => handleStatusUpdate(selectedRequest.id, 'rejected')}
                    disabled={updating === selectedRequest.id}
                    variant="destructive"
                  >
                    <XCircle className="h-4 w-4 mr-2" />
                    Отклонить
                  </Button>
                </div>
              )}
            </div>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}
