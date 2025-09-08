import { useState, useEffect } from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import { apiRequest, queryClient } from '@/lib/queryClient';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { useToast } from '@/hooks/use-toast';
import { getClinicName } from '@/lib/utils';
import { 
  Calendar, 
  Clock, 
  Phone, 
  Mail, 
  User, 
  Building2, 
  FileText,
  Eye,
  Trash2,
  CheckSquare,
  Square
} from 'lucide-react';

interface Booking {
  id: string;
  firstName: string;
  phone: string;
  email?: string;
  contactMethod?: string;
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

const serviceLabels = {
  consultation: 'Консультация',
  hygiene: 'Профессиональная гигиена',
  implants: 'Имплантация',
  veneers: 'Виниры',
  endo: 'Лечение каналов',
  ortho: 'Ортодонтия',
};

export function BookingsManagement() {
  const { toast } = useToast();
  const [selectedBooking, setSelectedBooking] = useState<Booking | null>(null);
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [filterClinic, setFilterClinic] = useState<string>('all');
  const [filterContactMethod, setFilterContactMethod] = useState<string>('all');
  const [previousBookingsCount, setPreviousBookingsCount] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const bookingsPerPage = 20;
  const [selectedBookings, setSelectedBookings] = useState<Set<string>>(new Set());
  const [isSelectionMode, setIsSelectionMode] = useState(false);

  const { data: bookingsData, isLoading } = useQuery<{ bookings: Booking[] }>({
    queryKey: ['/api/admin/bookings'],
    queryFn: async () => {
      const response = await apiRequest('GET', '/api/admin/bookings');
      const data = await response.json();
      console.log('Bookings data:', data); // Отладочный лог
      return data;
    },
    refetchInterval: 30000, // Обновлять каждые 30 секунд
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

  const deleteBookingMutation = useMutation({
    mutationFn: async (bookingId: string) => {
      console.log('Sending DELETE request for booking:', bookingId);
      const response = await apiRequest('DELETE', `/api/admin/bookings/${bookingId}`);
      console.log('DELETE response:', response);
      return response;
    },
    onSuccess: () => {
      console.log('Delete booking success');
      queryClient.invalidateQueries({ queryKey: ['/api/admin/bookings'] });
      toast({
        title: 'Заявка удалена',
        description: 'Заявка успешно удалена.',
      });
    },
    onError: (error: any) => {
      console.error('Delete booking error:', error);
      toast({
        title: 'Ошибка',
        description: error.message || 'Не удалось удалить заявку.',
        variant: 'destructive',
      });
    },
  });

  const deleteMultipleBookingsMutation = useMutation({
    mutationFn: async (bookingIds: string[]) => {
      console.log('Sending DELETE multiple request for bookings:', bookingIds);
      const response = await apiRequest('DELETE', '/api/admin/bookings/multiple', { bookingIds });
      console.log('DELETE multiple response:', response);
      return response;
    },
    onSuccess: () => {
      console.log('Delete multiple bookings success');
      queryClient.invalidateQueries({ queryKey: ['/api/admin/bookings'] });
      setSelectedBookings(new Set());
      setIsSelectionMode(false);
      toast({
        title: 'Заявки удалены',
        description: 'Выбранные заявки успешно удалены.',
      });
    },
    onError: (error: any) => {
      console.error('Delete multiple bookings error:', error);
      toast({
        title: 'Ошибка',
        description: error.message || 'Не удалось удалить заявки.',
        variant: 'destructive',
      });
    },
  });

  const bookings = bookingsData?.bookings || [];
  
  // Фильтрация по статусу, клинике и способу связи
  const filteredBookings = bookings.filter(booking => {
    const statusMatch = filterStatus === 'all' || booking.status === filterStatus;
    const clinicMatch = filterClinic === 'all' || booking.clinic.id === filterClinic;
    const contactMethodMatch = filterContactMethod === 'all' || booking.contactMethod === filterContactMethod;
    return statusMatch && clinicMatch && contactMethodMatch;
  });

  // Получаем уникальные клиники для фильтра
  const uniqueClinics = Array.from(new Set(bookings.map(booking => booking.clinic.id)))
    .map(clinicId => {
      const booking = bookings.find(b => b.clinic.id === clinicId);
      return {
        id: clinicId,
        name: getClinicName(booking?.clinic) || ''
      };
    })
    .sort((a, b) => a.name.localeCompare(b.name));

  // Check for new bookings
  useEffect(() => {
    if (previousBookingsCount > 0 && bookings.length > previousBookingsCount) {
      const newCount = bookings.length - previousBookingsCount;
      toast({
        title: "Новые заявки!",
        description: `Получено ${newCount} новых заявок на запись.`,
      });
      
      // Play notification sound only if user has interacted
      const hasUserInteracted = localStorage.getItem('userHasInteracted') === 'true';
      if (hasUserInteracted) {
        try {
          const audio = new Audio('data:audio/wav;base64,UklGRnoGAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQoGAACBhYqFbF1fdJivrJBhNjVgodDbq2EcBj+a2/LDciUFLIHO8tiJNwgZaLvt559NEAxQp+PwtmMcBjiR1/LMeSwFJHfH8N2QQAoUXrTp66hVFApGn+DyvmwhBSuBzvLZiTYIG2m98OScTgwOUarm7blmGgU7k9n1unEiBC13yO/eizEIHWq+8+OWT');
          audio.play().catch(error => {
            console.log('Audio notification failed:', error);
          });
        } catch (error) {
          console.log('Audio notification not supported');
        }
      }

      // Автоматически прокручиваем к новым заявкам
      setTimeout(() => {
        const newBookings = document.querySelectorAll('.border-red-500');
        if (newBookings.length > 0) {
          newBookings[0].scrollIntoView({ 
            behavior: 'smooth', 
            block: 'center' 
          });
        }
      }, 1000);
    }
    setPreviousBookingsCount(bookings.length);
  }, [bookings.length, previousBookingsCount, toast]);

  // Calculate statistics
  const stats = {
    total: bookings.length,
    new: bookings.filter(b => b.status === 'new').length,
    contacted: bookings.filter(b => b.status === 'contacted').length,
    confirmed: bookings.filter(b => b.status === 'confirmed').length,
    completed: bookings.filter(b => b.status === 'completed').length,
    cancelled: bookings.filter(b => b.status === 'cancelled').length,
    today: bookings.filter(b => {
      const today = new Date().toDateString();
      const bookingDate = new Date(b.createdAt).toDateString();
      return today === bookingDate;
    }).length,
    // Contact method statistics
    phone: bookings.filter(b => b.contactMethod === 'phone').length,
    email: bookings.filter(b => b.contactMethod === 'email').length,
    whatsapp: bookings.filter(b => b.contactMethod === 'whatsapp').length,
    telegram: bookings.filter(b => b.contactMethod === 'telegram').length,
  };

  // Статистика для отфильтрованных заявок
  const filteredStats = {
    total: filteredBookings.length,
    new: filteredBookings.filter(b => b.status === 'new').length,
    contacted: filteredBookings.filter(b => b.status === 'contacted').length,
    confirmed: filteredBookings.filter(b => b.status === 'confirmed').length,
    completed: filteredBookings.filter(b => b.status === 'completed').length,
    cancelled: filteredBookings.filter(b => b.status === 'cancelled').length,
    today: filteredBookings.filter(b => {
      const today = new Date().toDateString();
      const bookingDate = new Date(b.createdAt).toDateString();
      return today === bookingDate;
    }).length,
    // Contact method statistics
    phone: filteredBookings.filter(b => b.contactMethod === 'phone').length,
    email: filteredBookings.filter(b => b.contactMethod === 'email').length,
    whatsapp: filteredBookings.filter(b => b.contactMethod === 'whatsapp').length,
    telegram: filteredBookings.filter(b => b.contactMethod === 'telegram').length,
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString('ru-RU', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  // Сортировка всех заявок: новые первыми, затем по дате создания
  const sortedBookings = [...filteredBookings].sort((a, b) => {
    // Сначала сортируем по статусу: новые заявки первыми
    if (a.status === 'new' && b.status !== 'new') return -1;
    if (a.status !== 'new' && b.status === 'new') return 1;
    
    // Затем по дате создания (новые первыми)
    return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
  });

  // Пагинация
  const totalPages = Math.ceil(sortedBookings.length / bookingsPerPage);
  const startIndex = (currentPage - 1) * bookingsPerPage;
  const endIndex = startIndex + bookingsPerPage;
  const currentBookings = sortedBookings.slice(startIndex, endIndex);

  // Сброс на первую страницу при изменении фильтров
  useEffect(() => {
    setCurrentPage(1);
  }, [filterStatus, filterClinic, filterContactMethod]);

  // Функции для работы с выделением
  const toggleSelection = (bookingId: string) => {
    const newSelected = new Set(selectedBookings);
    if (newSelected.has(bookingId)) {
      newSelected.delete(bookingId);
    } else {
      newSelected.add(bookingId);
    }
    setSelectedBookings(newSelected);
  };

  const selectAll = () => {
    setSelectedBookings(new Set(currentBookings.map(booking => booking.id)));
  };

  const deselectAll = () => {
    setSelectedBookings(new Set());
  };

  const handleDeleteSelected = () => {
    console.log('Attempting to delete multiple bookings:', selectedBookings.size, Array.from(selectedBookings));
    if (selectedBookings.size === 0) return;
    if (confirm(`Удалить ${selectedBookings.size} выбранных заявок?`)) {
      deleteMultipleBookingsMutation.mutate(Array.from(selectedBookings));
    }
  };

  const handleDeleteSingle = (bookingId: string) => {
    console.log('Attempting to delete booking:', bookingId);
    if (confirm('Удалить эту заявку?')) {
      deleteBookingMutation.mutate(bookingId);
    }
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
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
                  <div>
            <div className="flex items-center space-x-3">
              <h1 className="text-2xl font-bold text-gray-900">Заявки на запись</h1>
              {stats.new > 0 && (
                <div className="bg-red-500 text-white px-3 py-1 rounded-full text-sm font-bold animate-pulse flex items-center">
                  {stats.new} НОВЫХ
                </div>
              )}
              {isSelectionMode && selectedBookings.size > 0 && (
                <div className="bg-blue-500 text-white px-3 py-1 rounded-full text-sm font-bold flex items-center">
                  Выбрано: {selectedBookings.size}
                </div>
              )}
            </div>
            <p className="text-gray-600">
              {isSelectionMode 
                ? `Режим выделения - ${selectedBookings.size} заявок выбрано`
                : 'Управление заявками от клиентов'
              }
            </p>
          </div>
        
        <div className="flex flex-wrap items-center gap-3">
          {/* Кнопки управления выделением */}
          {isSelectionMode ? (
            <>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setIsSelectionMode(false)}
              >
                Отменить
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={selectAll}
              >
                Выбрать все
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={deselectAll}
              >
                Снять выбор
              </Button>
              {selectedBookings.size > 0 && (
                <Button
                  variant="destructive"
                  size="sm"
                  onClick={handleDeleteSelected}
                  disabled={deleteMultipleBookingsMutation.isPending}
                >
                  Удалить ({selectedBookings.size})
                </Button>
              )}
            </>
          ) : (
            <Button
              variant="outline"
              size="sm"
              onClick={() => setIsSelectionMode(true)}
            >
              Выбрать
            </Button>
          )}

          <Select value={filterStatus} onValueChange={setFilterStatus}>
            <SelectTrigger className="w-40 lg:w-48">
              <SelectValue placeholder="Статус" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Все статусы</SelectItem>
              <SelectItem value="new">Новые</SelectItem>
              <SelectItem value="contacted">Связались</SelectItem>
              <SelectItem value="confirmed">Подтвержденные</SelectItem>
              <SelectItem value="completed">Выполненные</SelectItem>
              <SelectItem value="cancelled">Отмененные</SelectItem>
            </SelectContent>
          </Select>
          
          <Select value={filterClinic} onValueChange={setFilterClinic}>
            <SelectTrigger className="w-40 lg:w-56">
              <SelectValue placeholder="Клиника" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Все клиники</SelectItem>
              {uniqueClinics.map((clinic) => (
                <SelectItem key={clinic.id} value={clinic.id}>
                  {getClinicName(clinic)}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          
          <Select value={filterContactMethod} onValueChange={setFilterContactMethod}>
            <SelectTrigger className="w-40 lg:w-48">
              <SelectValue placeholder="Связь" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Все способы</SelectItem>
              <SelectItem value="phone">📞 Телефон</SelectItem>
              <SelectItem value="email">📧 Email</SelectItem>
              <SelectItem value="whatsapp">📱 WhatsApp</SelectItem>
              <SelectItem value="telegram">✈️ Telegram</SelectItem>
            </SelectContent>
          </Select>
          
                      <Button 
              variant="outline" 
              size="sm"
              onClick={() => {
                const csvContent = [
                  ['ID', 'Клиент', 'Клиника', 'Телефон', 'Email', 'Способ связи', 'Услуга', 'Дата', 'Время', 'Статус', 'Комментарий', 'Создана'],
                  ...filteredBookings.map(booking => [
                    booking.id,
                    booking.firstName,
                    getClinicName(booking.clinic),
                    booking.phone,
                    booking.email || '',
                    booking.contactMethod ? 
                      (booking.contactMethod === 'phone' ? 'Телефон' :
                       booking.contactMethod === 'email' ? 'Email' :
                       booking.contactMethod === 'whatsapp' ? 'WhatsApp' :
                       booking.contactMethod === 'telegram' ? 'Telegram' : booking.contactMethod) : '',
                    serviceLabels[booking.service as keyof typeof serviceLabels] || booking.service,
                    booking.preferredDate,
                    booking.preferredTime,
                    statusLabels[booking.status as keyof typeof statusLabels]?.label || booking.status,
                    booking.notes || '',
                    formatDate(booking.createdAt)
                  ])
                ].map(row => row.join(',')).join('\n');
                
                const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
                const link = document.createElement('a');
                link.href = URL.createObjectURL(blob);
                link.download = `bookings-${new Date().toISOString().split('T')[0]}.csv`;
                link.click();
              }}
            >
              <FileText className="h-4 w-4 mr-2" />
              CSV
            </Button>
          
          {(filterStatus !== 'all' || filterClinic !== 'all' || filterContactMethod !== 'all') && (
            <Button 
              variant="outline"
              size="sm"
              onClick={() => {
                setFilterStatus('all');
                setFilterClinic('all');
                setFilterContactMethod('all');
              }}
            >
              Сброс
            </Button>
          )}
          
          {filteredStats.new > 0 && (
            <>
              <Button 
                variant="default"
                size="sm"
                className="bg-red-600 hover:bg-red-700"
                onClick={() => {
                  const newBookings = document.querySelectorAll('.border-red-500');
                  if (newBookings.length > 0) {
                    newBookings[0].scrollIntoView({ 
                      behavior: 'smooth', 
                      block: 'center' 
                    });
                  }
                }}
              >
                Новые
              </Button>
              <Button 
                variant="default"
                size="sm"
                className="bg-green-600 hover:bg-green-700"
                onClick={() => {
                  const newBookings = filteredBookings.filter(b => b.status === 'new');
                  newBookings.forEach(booking => {
                    updateStatusMutation.mutate({ 
                      bookingId: booking.id, 
                      status: 'contacted' 
                    });
                  });
                  toast({
                    title: "Статус обновлен",
                    description: `${newBookings.length} заявок помечены как 'Связались'`,
                  });
                }}
              >
                Связались
              </Button>
            </>
          )}
        </div>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
        <Card>
          <CardContent className="p-3">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-medium text-gray-600">
                  {filterClinic !== 'all' ? 'Отфильтровано' : 'Всего'}
                </p>
                <p className="text-xl font-bold text-gray-900">{filteredStats.total}</p>
                {filterClinic !== 'all' && (
                  <p className="text-xs text-gray-500">из {stats.total}</p>
                )}
              </div>
              <Calendar className="h-6 w-6 text-blue-600" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-3">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-medium text-gray-600">Новые</p>
                <p className="text-xl font-bold text-blue-600">{filteredStats.new}</p>
                {filterClinic !== 'all' && (
                  <p className="text-xs text-gray-500">из {stats.new}</p>
                )}
              </div>
              <button 
                onClick={() => setFilterStatus('new')}
                className="h-6 w-6 bg-blue-100 rounded-full flex items-center justify-center hover:bg-blue-200 transition-colors cursor-pointer"
                disabled={filteredStats.new === 0}
              >
                <span className="text-blue-600 font-bold text-xs">{filteredStats.new}</span>
              </button>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-3">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-medium text-gray-600">Сегодня</p>
                <p className="text-xl font-bold text-green-600">{filteredStats.today}</p>
                {filterClinic !== 'all' && (
                  <p className="text-xs text-gray-500">из {stats.today}</p>
                )}
              </div>
              <div className="h-6 w-6 bg-green-100 rounded-full flex items-center justify-center">
                <span className="text-green-600 font-bold text-xs">{filteredStats.today}</span>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-3">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-medium text-gray-600">Подтвержденные</p>
                <p className="text-xl font-bold text-purple-600">{filteredStats.confirmed}</p>
                {filterClinic !== 'all' && (
                  <p className="text-xs text-gray-500">из {stats.confirmed}</p>
                )}
              </div>
              <div className="h-6 w-6 bg-purple-100 rounded-full flex items-center justify-center">
                <span className="text-purple-600 font-bold text-xs">{filteredStats.confirmed}</span>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-3">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-medium text-gray-600">Телефон</p>
                <p className="text-xl font-bold text-blue-600">{filteredStats.phone}</p>
                {filterClinic !== 'all' && (
                  <p className="text-xs text-gray-500">из {stats.phone}</p>
                )}
              </div>
              <div className="h-6 w-6 bg-blue-100 rounded-full flex items-center justify-center">
                <span className="text-blue-600 font-bold text-xs">📞</span>
              </div>
            </div>
          </CardContent>
        </Card>
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
          {currentBookings.map((booking) => (
            <Card key={booking.id} className={`hover:shadow-md transition-all duration-200 ${
              booking.status === 'new' ? 'border-2 border-red-500 bg-red-50' : ''
            } ${selectedBookings.has(booking.id) ? 'ring-2 ring-blue-500 bg-blue-50 shadow-lg' : ''}`}>
              <CardHeader className="pb-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    {isSelectionMode && (
                      <button
                        onClick={() => toggleSelection(booking.id)}
                        className="p-1 hover:bg-gray-100 rounded transition-colors"
                      >
                        {selectedBookings.has(booking.id) ? (
                          <CheckSquare className="h-5 w-5 text-blue-600" />
                        ) : (
                          <Square className="h-5 w-5 text-gray-400 hover:text-blue-600" />
                        )}
                      </button>
                    )}
                    <div>
                      <CardTitle className="text-lg flex items-center">
                        {booking.firstName}
                        {booking.status === 'new' && (
                          <Badge className="ml-2 bg-red-500 text-white animate-pulse">
                            НОВАЯ
                          </Badge>
                        )}
                      </CardTitle>
                      <CardDescription className="flex items-center space-x-2 mt-1">
                        <Building2 className="h-4 w-4" />
                        <span>{getClinicName(booking.clinic)}</span>
                      </CardDescription>
                    </div>
                  </div>
                    
                    <div className="flex items-center space-x-2">
                      <Select 
                        value={booking.status} 
                        onValueChange={(status) => {
                          updateStatusMutation.mutate({ 
                            bookingId: booking.id, 
                            status 
                          });
                        }}
                      >
                        <SelectTrigger className={`w-32 ${
                          booking.status === 'new' ? 'border-blue-500 text-blue-600' :
                          booking.status === 'contacted' ? 'border-yellow-500 text-yellow-600' :
                          booking.status === 'confirmed' ? 'border-green-500 text-green-600' :
                          booking.status === 'completed' ? 'border-gray-500 text-gray-600' :
                          booking.status === 'cancelled' ? 'border-red-500 text-red-600' :
                          ''
                        }`}>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="new" className="text-blue-600">Новая</SelectItem>
                          <SelectItem value="contacted" className="text-yellow-600">Связались</SelectItem>
                          <SelectItem value="confirmed" className="text-green-600">Подтверждена</SelectItem>
                          <SelectItem value="completed" className="text-gray-600">Выполнена</SelectItem>
                          <SelectItem value="cancelled" className="text-red-600">Отменена</SelectItem>
                        </SelectContent>
                      </Select>
                      
                      <Button 
                        variant="destructive" 
                        size="sm"
                        onClick={() => handleDeleteSingle(booking.id)}
                        disabled={deleteBookingMutation.isPending}
                        className="hover:bg-red-700"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>

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
                                    <span>{selectedBooking.firstName}</span>
                                  </div>
                                </div>
                                
                                <div className="space-y-2">
                                  <label className="text-sm font-medium text-gray-500">Клиника</label>
                                  <div className="flex items-center space-x-2">
                                    <Building2 className="h-4 w-4 text-gray-400" />
                                    <span>{getClinicName(selectedBooking.clinic)}</span>
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

                              {/* Contact Method */}
                              <div className="space-y-2">
                                <label className="text-sm font-medium text-gray-500">Предпочтительный способ связи</label>
                                <div className="flex items-center space-x-2">
                                  {selectedBooking.contactMethod ? (
                                    <span className="capitalize bg-blue-100 text-blue-800 px-2 py-1 rounded text-sm">
                                      {selectedBooking.contactMethod === 'phone' && '📞 Телефон'}
                                      {selectedBooking.contactMethod === 'email' && '📧 Email'}
                                      {selectedBooking.contactMethod === 'whatsapp' && '📱 WhatsApp'}
                                      {selectedBooking.contactMethod === 'telegram' && '✈️ Telegram'}
                                    </span>
                                  ) : (
                                    <span className="text-gray-500 text-sm">Не указан</span>
                                  )}
                                </div>
                              </div>

                              {/* Appointment Info */}
                              <div className="grid grid-cols-3 gap-4">
                                <div className="space-y-2">
                                  <label className="text-sm font-medium text-gray-500">Услуга</label>
                                  <div>{serviceLabels[selectedBooking.service as keyof typeof serviceLabels] || selectedBooking.service}</div>
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
                  <div className="grid grid-cols-2 md:grid-cols-5 gap-3 text-sm">
                    <div className="flex items-center space-x-2">
                      <Phone className="h-4 w-4 text-gray-400" />
                      <span className="truncate">{booking.phone}</span>
                    </div>
                    
                    {booking.email && (
                      <div className="flex items-center space-x-2">
                        <Mail className="h-4 w-4 text-gray-400" />
                        <span className="truncate">{booking.email}</span>
                      </div>
                    )}
                    
                    <div className="flex items-center space-x-2">
                      {booking.contactMethod ? (
                        <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded">
                          {booking.contactMethod === 'phone' && '📞 Телефон'}
                          {booking.contactMethod === 'email' && '📧 Email'}
                          {booking.contactMethod === 'whatsapp' && '📱 WhatsApp'}
                          {booking.contactMethod === 'telegram' && '✈️ Telegram'}
                        </span>
                      ) : (
                        <span className="text-xs text-gray-500">Не указан</span>
                      )}
                    </div>
                    
                    <div className="flex items-center space-x-2">
                      <Calendar className="h-4 w-4 text-gray-400" />
                      <span>{new Date(booking.preferredDate).toLocaleDateString('ru-RU')}</span>
                    </div>
                    
                    <div className="flex items-center space-x-2">
                      <Clock className="h-4 w-4 text-gray-400" />
                      <span>{booking.preferredTime}</span>
                    </div>
                  </div>
                  
                  <div className="mt-3 p-2 bg-gray-50 rounded-md">
                    <div className="text-sm text-gray-600">
                      <strong>Услуга:</strong> {serviceLabels[booking.service as keyof typeof serviceLabels] || booking.service}
                    </div>
                    <div className="text-sm text-gray-600 mt-1">
                      <strong>Способ связи:</strong> 
                      <span className="ml-1">
                        {booking.contactMethod ? (
                          <>
                            {booking.contactMethod === 'phone' && '📞 Телефон'}
                            {booking.contactMethod === 'email' && '📧 Email'}
                            {booking.contactMethod === 'whatsapp' && '📱 WhatsApp'}
                            {booking.contactMethod === 'telegram' && '✈️ Telegram'}
                          </>
                        ) : (
                          'Не указан'
                        )}
                      </span>
                    </div>
                    {booking.notes && (
                      <div className="text-sm text-gray-600 mt-1">
                        <strong>Комментарий:</strong> {booking.notes}
                      </div>
                    )}
                  </div>
                  
                  <div className="mt-2 text-xs text-gray-500 flex items-center justify-between">
                    <span>Создана: {formatDate(booking.createdAt)}</span>
                    <span className="text-blue-600 font-medium">ID: {booking.id.slice(0, 8)}</span>
                  </div>
                </CardContent>
              </Card>
            ))}
        </div>
      )}

      {/* Пагинация */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between mt-6">
          <div className="text-sm text-gray-600">
            Показано {startIndex + 1}-{Math.min(endIndex, sortedBookings.length)} из {sortedBookings.length} заявок
          </div>
          <div className="flex items-center space-x-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentPage(currentPage - 1)}
              disabled={currentPage === 1}
            >
              ← Назад
            </Button>
            
            <div className="flex items-center space-x-1">
              {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                let pageNum;
                if (totalPages <= 5) {
                  pageNum = i + 1;
                } else if (currentPage <= 3) {
                  pageNum = i + 1;
                } else if (currentPage >= totalPages - 2) {
                  pageNum = totalPages - 4 + i;
                } else {
                  pageNum = currentPage - 2 + i;
                }
                
                return (
                  <Button
                    key={pageNum}
                    variant={currentPage === pageNum ? "default" : "outline"}
                    size="sm"
                    onClick={() => setCurrentPage(pageNum)}
                    className="w-8 h-8 p-0"
                  >
                    {pageNum}
                  </Button>
                );
              })}
            </div>
            
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentPage(currentPage + 1)}
              disabled={currentPage === totalPages}
            >
              Вперед →
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}