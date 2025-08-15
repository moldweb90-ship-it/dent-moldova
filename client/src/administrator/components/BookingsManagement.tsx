import { useState, useEffect } from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import { apiRequest, queryClient } from '@/lib/queryClient';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { useToast } from '@/hooks/use-toast';
import { 
  Calendar, 
  Clock, 
  Phone, 
  Mail, 
  User, 
  Building2, 
  FileText,
  Eye
} from 'lucide-react';

interface Booking {
  id: string;
  firstName: string;
  lastName: string;
  phone: string;
  email?: string;
  service: string;
  preferredDate: string;
  preferredTime: string;
  notes?: string;
  status: string;
  createdAt: string;
  clinic: {
    id: string;
    name: string;
  };
}

const statusLabels = {
  new: { label: 'Новая', color: 'bg-blue-100 text-blue-800' },
  contacted: { label: 'Связались', color: 'bg-yellow-100 text-yellow-800' },
  confirmed: { label: 'Подтверждена', color: 'bg-green-100 text-green-800' },
  completed: { label: 'Выполнена', color: 'bg-gray-100 text-gray-800' },
  cancelled: { label: 'Отменена', color: 'bg-red-100 text-red-800' },
};

export function BookingsManagement() {
  const { toast } = useToast();
  const [selectedBooking, setSelectedBooking] = useState<Booking | null>(null);
  const [filterStatus, setFilterStatus] = useState<string>('all');

  const { data: bookingsData, isLoading } = useQuery<{ bookings: Booking[] }>({
    queryKey: ['/api/admin/bookings'],
  });

  const updateStatusMutation = useMutation({
    mutationFn: async ({ bookingId, status }: { bookingId: string; status: string }) => {
      return apiRequest('PUT', `/api/admin/bookings/${bookingId}/status`, { status });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/admin/bookings'] });
      toast({
        title: 'Статус обновлен',
        description: 'Статус заявки успешно изменен.',
      });
    },
    onError: (error: any) => {
      toast({
        title: 'Ошибка',
        description: error.message || 'Не удалось обновить статус заявки.',
        variant: 'destructive',
      });
    },
  });

  const bookings = bookingsData?.bookings || [];
  const filteredBookings = filterStatus === 'all' 
    ? bookings 
    : bookings.filter(booking => booking.status === filterStatus);

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString('ru-RU', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Заявки на запись</h1>
          <p className="text-gray-600">Управление заявками от клиентов</p>
        </div>
        
        <div className="flex items-center space-x-4">
          <Select value={filterStatus} onValueChange={setFilterStatus}>
            <SelectTrigger className="w-48">
              <SelectValue placeholder="Фильтр по статусу" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Все заявки</SelectItem>
              <SelectItem value="new">Новые</SelectItem>
              <SelectItem value="contacted">Связались</SelectItem>
              <SelectItem value="confirmed">Подтвержденные</SelectItem>
              <SelectItem value="completed">Выполненные</SelectItem>
              <SelectItem value="cancelled">Отмененные</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {filteredBookings.length === 0 ? (
        <Card>
          <CardContent className="py-8">
            <div className="text-center">
              <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900">Заявки не найдены</h3>
              <p className="text-gray-500">
                {filterStatus === 'all' 
                  ? 'Пока нет ни одной заявки на запись.' 
                  : 'Нет заявок с выбранным статусом.'}
              </p>
            </div>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4">
          {filteredBookings.map((booking) => {
            const statusInfo = statusLabels[booking.status as keyof typeof statusLabels];
            
            return (
              <Card key={booking.id} className="hover:shadow-md transition-shadow">
                <CardHeader className="pb-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <div>
                        <CardTitle className="text-lg">
                          {booking.firstName} {booking.lastName}
                        </CardTitle>
                        <CardDescription className="flex items-center space-x-2 mt-1">
                          <Building2 className="h-4 w-4" />
                          <span>{booking.clinic.name}</span>
                        </CardDescription>
                      </div>
                    </div>
                    
                    <div className="flex items-center space-x-2">
                      <Badge className={statusInfo.color}>
                        {statusInfo.label}
                      </Badge>
                      
                      <Dialog>
                        <DialogTrigger asChild>
                          <Button 
                            variant="outline" 
                            size="sm"
                            onClick={() => setSelectedBooking(booking)}
                          >
                            <Eye className="h-4 w-4 mr-2" />
                            Детали
                          </Button>
                        </DialogTrigger>
                        
                        <DialogContent className="max-w-2xl">
                          <DialogHeader>
                            <DialogTitle>Детали заявки</DialogTitle>
                          </DialogHeader>
                          
                          {selectedBooking && (
                            <div className="space-y-6">
                              {/* Client Info */}
                              <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                  <label className="text-sm font-medium text-gray-500">Клиент</label>
                                  <div className="flex items-center space-x-2">
                                    <User className="h-4 w-4 text-gray-400" />
                                    <span>{selectedBooking.firstName} {selectedBooking.lastName}</span>
                                  </div>
                                </div>
                                
                                <div className="space-y-2">
                                  <label className="text-sm font-medium text-gray-500">Клиника</label>
                                  <div className="flex items-center space-x-2">
                                    <Building2 className="h-4 w-4 text-gray-400" />
                                    <span>{selectedBooking.clinic.name}</span>
                                  </div>
                                </div>
                              </div>

                              {/* Contact Info */}
                              <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                  <label className="text-sm font-medium text-gray-500">Телефон</label>
                                  <div className="flex items-center space-x-2">
                                    <Phone className="h-4 w-4 text-gray-400" />
                                    <span>{selectedBooking.phone}</span>
                                  </div>
                                </div>
                                
                                {selectedBooking.email && (
                                  <div className="space-y-2">
                                    <label className="text-sm font-medium text-gray-500">Email</label>
                                    <div className="flex items-center space-x-2">
                                      <Mail className="h-4 w-4 text-gray-400" />
                                      <span>{selectedBooking.email}</span>
                                    </div>
                                  </div>
                                )}
                              </div>

                              {/* Appointment Info */}
                              <div className="grid grid-cols-3 gap-4">
                                <div className="space-y-2">
                                  <label className="text-sm font-medium text-gray-500">Услуга</label>
                                  <div>{selectedBooking.service}</div>
                                </div>
                                
                                <div className="space-y-2">
                                  <label className="text-sm font-medium text-gray-500">Дата</label>
                                  <div className="flex items-center space-x-2">
                                    <Calendar className="h-4 w-4 text-gray-400" />
                                    <span>{selectedBooking.preferredDate}</span>
                                  </div>
                                </div>
                                
                                <div className="space-y-2">
                                  <label className="text-sm font-medium text-gray-500">Время</label>
                                  <div className="flex items-center space-x-2">
                                    <Clock className="h-4 w-4 text-gray-400" />
                                    <span>{selectedBooking.preferredTime}</span>
                                  </div>
                                </div>
                              </div>

                              {/* Notes */}
                              {selectedBooking.notes && (
                                <div className="space-y-2">
                                  <label className="text-sm font-medium text-gray-500">Комментарии</label>
                                  <div className="bg-gray-50 p-3 rounded-md">
                                    {selectedBooking.notes}
                                  </div>
                                </div>
                              )}

                              {/* Status and Actions */}
                              <div className="flex items-center justify-between pt-4 border-t">
                                <div className="space-y-2">
                                  <label className="text-sm font-medium text-gray-500">Статус</label>
                                  <Select 
                                    value={selectedBooking.status} 
                                    onValueChange={(status) => {
                                      updateStatusMutation.mutate({ 
                                        bookingId: selectedBooking.id, 
                                        status 
                                      });
                                      setSelectedBooking({...selectedBooking, status});
                                    }}
                                  >
                                    <SelectTrigger className="w-48">
                                      <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                      <SelectItem value="new">Новая</SelectItem>
                                      <SelectItem value="contacted">Связались</SelectItem>
                                      <SelectItem value="confirmed">Подтверждена</SelectItem>
                                      <SelectItem value="completed">Выполнена</SelectItem>
                                      <SelectItem value="cancelled">Отменена</SelectItem>
                                    </SelectContent>
                                  </Select>
                                </div>
                                
                                <div className="text-sm text-gray-500">
                                  Создана: {formatDate(selectedBooking.createdAt)}
                                </div>
                              </div>
                            </div>
                          )}
                        </DialogContent>
                      </Dialog>
                    </div>
                  </div>
                </CardHeader>
                
                <CardContent className="pt-0">
                  <div className="grid grid-cols-3 gap-4 text-sm">
                    <div className="flex items-center space-x-2">
                      <Phone className="h-4 w-4 text-gray-400" />
                      <span>{booking.phone}</span>
                    </div>
                    
                    <div className="flex items-center space-x-2">
                      <Calendar className="h-4 w-4 text-gray-400" />
                      <span>{booking.preferredDate}</span>
                    </div>
                    
                    <div className="flex items-center space-x-2">
                      <Clock className="h-4 w-4 text-gray-400" />
                      <span>{booking.preferredTime}</span>
                    </div>
                  </div>
                  
                  <div className="mt-2 text-sm text-gray-600">
                    <strong>Услуга:</strong> {booking.service}
                  </div>
                  
                  <div className="mt-2 text-xs text-gray-500">
                    Заявка создана: {formatDate(booking.createdAt)}
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}