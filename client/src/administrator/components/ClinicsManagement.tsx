import { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { 
  Plus, 
  Search, 
  Edit, 
  Trash2, 
  Eye, 
  MapPin, 
  Phone,
  Globe,
  Star,
  Award,
  Clock
} from 'lucide-react';
import { apiRequest } from '@/lib/queryClient';
import { useToast } from '@/hooks/use-toast';
import { getCityName, getDistrictName } from '@/lib/utils';
import ClinicForm from './ClinicForm';
import { AnimatedProgressBar } from '../../components/AnimatedProgressBar';

interface Clinic {
  id: string;
  slug: string;
  nameRu: string;
  nameRo: string;
  logoUrl?: string;
  city: { nameRu: string; nameRo: string };
  district?: { nameRu: string; nameRo: string };
  address?: string;
  phone?: string;
  website?: string;
  verified: boolean;

  availToday: boolean;
  dScore: number;
  promotionalLabels?: string[];
  createdAt: string;
  updatedAt: string;
}

export function ClinicsManagement() {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCity, setSelectedCity] = useState('');
  const [selectedDistrict, setSelectedDistrict] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [editingClinic, setEditingClinic] = useState<Clinic | null>(null);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Запрос клиник с фильтрами
  const { data: clinicsData, isLoading } = useQuery({
    queryKey: ['/api/admin/clinics', { q: searchQuery, city: selectedCity, district: selectedDistrict, page: currentPage }],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (searchQuery) params.set('q', searchQuery);
      if (selectedCity) params.set('city', selectedCity);
      if (selectedDistrict) params.set('district', selectedDistrict);
      params.set('page', currentPage.toString());
      params.set('limit', '30');
      
      const response = await apiRequest('GET', `/api/admin/clinics?${params.toString()}`);
      return response.json();
    }
  });

  // Запрос городов для фильтра
  const { data: citiesData } = useQuery({
    queryKey: ['/api/cities'],
    queryFn: async () => {
      const response = await apiRequest('GET', '/api/cities');
      return response.json();
    }
  });

  // Запрос районов для выбранного города
  const { data: districtsData } = useQuery({
    queryKey: ['/api/districts', selectedCity],
    queryFn: async () => {
      if (!selectedCity) return [];
      const response = await apiRequest('GET', `/api/cities/${selectedCity}/districts`);
      return response.json();
    },
    enabled: !!selectedCity
  });

  // Проверяем URL на наличие clinicId для автоматического открытия формы редактирования
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const clinicId = urlParams.get('clinicId');
    
    if (clinicId && clinicsData?.clinics) {
      const clinic = clinicsData.clinics.find((c: Clinic) => c.id === clinicId);
      if (clinic) {
        setEditingClinic(clinic);
        // Очищаем URL параметр
        const url = new URL(window.location.href);
        url.searchParams.delete('clinicId');
        window.history.replaceState({}, '', url.toString());
      }
    }
  }, [clinicsData?.clinics]);

  const deleteMutation = useMutation({
    mutationFn: (id: string) => apiRequest('DELETE', `/api/admin/clinics/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/admin/clinics'] });
      toast({
        title: 'Клиника удалена',
        description: 'Клиника была успешно удалена из системы'
      });
    },
    onError: () => {
      toast({
        title: 'Ошибка',
        description: 'Не удалось удалить клинику',
        variant: 'destructive'
      });
    }
  });

  const handleDelete = (clinic: Clinic) => {
    if (window.confirm(`Вы уверены, что хотите удалить клинику "${clinic.nameRu}"?`)) {
      deleteMutation.mutate(clinic.id);
    }
  };

  // Обработчики фильтров
  const handleCityChange = (cityId: string) => {
    setSelectedCity(cityId === 'all' ? '' : cityId);
    setSelectedDistrict(''); // Сбрасываем район при смене города
    setCurrentPage(1); // Сбрасываем пагинацию
  };

  const handleDistrictChange = (districtId: string) => {
    setSelectedDistrict(districtId === 'all' ? '' : districtId);
    setCurrentPage(1); // Сбрасываем пагинацию
  };

  const handleResetFilters = () => {
    setSearchQuery('');
    setSelectedCity('');
    setSelectedDistrict('');
    setCurrentPage(1);
  };

  const clinics = clinicsData?.clinics || [];
  const total = clinicsData?.total || 0;
  const totalPages = Math.ceil(total / 30);

  const handleSearch = (query: string) => {
    setSearchQuery(query);
    setCurrentPage(1); // Сбрасываем на первую страницу при поиске
  };

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  return (
    <div className="space-y-4 sm:space-y-6 px-2 sm:px-0">
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Управление клиниками</h1>
          {!isLoading && (
            <p className="text-xs sm:text-sm text-gray-600 mt-1">
              Всего клиник: {total}
            </p>
          )}
        </div>
        <Button 
          onClick={() => setIsCreateModalOpen(true)}
          className="bg-blue-600 hover:bg-blue-700 w-full sm:w-auto"
        >
          <Plus className="h-4 w-4 mr-2" />
          <span className="hidden xs:inline">Добавить клинику</span>
          <span className="xs:hidden">Добавить</span>
        </Button>
      </div>

      {/* Search and Filters */}
      <Card>
        <CardContent className="p-4 sm:p-6">
          <div className="space-y-4">
            {/* Поиск */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Поиск клиник..."
                value={searchQuery}
                onChange={(e) => handleSearch(e.target.value)}
                className="pl-10 text-sm sm:text-base"
              />
            </div>
            
            {/* Фильтры по городам и районам */}
            <div className="flex flex-col sm:flex-row gap-2 sm:gap-4">
              {/* Фильтр по городу */}
              <div className="flex-1">
                <Select value={selectedCity || 'all'} onValueChange={handleCityChange}>
                  <SelectTrigger>
                    <SelectValue placeholder="Все города" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Все города</SelectItem>
                    {citiesData?.map((city: any) => (
                      <SelectItem key={city.id} value={city.id}>
                        {city.nameRu}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              {/* Фильтр по району */}
              <div className="flex-1">
                <Select 
                  value={selectedDistrict || 'all'} 
                  onValueChange={handleDistrictChange}
                  disabled={!selectedCity}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Все районы" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Все районы</SelectItem>
                    {districtsData?.map((district: any) => (
                      <SelectItem key={district.id} value={district.id}>
                        {district.nameRu}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              {/* Кнопка сброса фильтров */}
              <Button 
                variant="outline" 
                onClick={handleResetFilters}
                className="sm:w-auto"
              >
                Сбросить
              </Button>
            </div>
            
            {/* Счетчик результатов */}
            <div className="text-sm text-gray-600">
              Найдено клиник: <span className="font-medium">{total}</span>
              {selectedCity && (
                <span className="ml-2">
                  в городе: <span className="font-medium">
                    {citiesData?.find((c: any) => c.id === selectedCity)?.nameRu}
                  </span>
                </span>
              )}
              {selectedDistrict && (
                <span className="ml-2">
                  в районе: <span className="font-medium">
                    {districtsData?.find((d: any) => d.id === selectedDistrict)?.nameRu}
                  </span>
                </span>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Clinics List */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3 sm:gap-4 lg:gap-6">
        {isLoading ? (
          [...Array(6)].map((_, i) => (
            <Card key={i} className="animate-pulse">
              <CardContent className="p-6">
                <div className="space-y-3">
                  <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                  <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                  <div className="h-3 bg-gray-200 rounded w-2/3"></div>
                </div>
              </CardContent>
            </Card>
          ))
        ) : clinics.length === 0 ? (
          <div className="col-span-full text-center py-8 sm:py-12">
            <div className="text-gray-400 mb-3 sm:mb-4">
              <Search className="h-8 w-8 sm:h-12 sm:w-12 mx-auto" />
            </div>
            <h3 className="text-base sm:text-lg font-medium text-gray-900 mb-2">
              {searchQuery ? 'Клиники не найдены' : 'Нет клиник'}
            </h3>
            <p className="text-sm sm:text-base text-gray-600 px-4">
              {searchQuery 
                ? 'Попробуйте изменить поисковый запрос'
                : 'Добавьте первую клинику в систему'
              }
            </p>
          </div>
        ) : (
          clinics.map((clinic: Clinic) => (
            <Card key={clinic.id} className="hover:shadow-lg transition-shadow flex flex-col">
              <CardHeader className="pb-2 sm:pb-3 px-3 sm:px-6">
                <div className="flex justify-between items-start">
                  <div className="flex items-start space-x-2 sm:space-x-3 flex-1 min-w-0">
                    {/* Clinic Logo */}
                    <div className="flex-shrink-0">
                      <img 
                        src={clinic.logoUrl || `https://images.unsplash.com/photo-${clinic.id.slice(0, 10)}?ixlib=rb-4.0.3&auto=format&fit=crop&w=100&h=100`}
                        alt={clinic.nameRu}
                        className="w-12 h-12 sm:w-16 sm:h-16 rounded-lg object-cover border"
                        onError={(e) => {
                          (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1629909613654-28e377c37b09?ixlib=rb-4.0.3&auto=format&fit=crop&w=100&h=100';
                        }}
                      />
                    </div>
                    <div className="flex-1 min-w-0">
                      <CardTitle 
                        className="text-sm sm:text-lg font-bold text-gray-900 cursor-pointer hover:text-blue-600 transition-colors"
                        onClick={() => setEditingClinic(clinic)}
                      >
                        {clinic.nameRu}
                      </CardTitle>
                      <div className="flex items-center text-xs sm:text-sm text-gray-600 mt-1">
                        <MapPin className="h-3 w-3 mr-1" />
                        <span>
                          {getCityName(clinic.city)}
                          {clinic.district && `, ${getDistrictName(clinic.district)}`}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </CardHeader>
              
              <CardContent className="pt-0 px-3 sm:px-6 flex-1 flex flex-col">
                <div className="space-y-2 sm:space-y-3 flex-1">
                  {/* Status Badges */}
                  <div className="flex flex-wrap gap-1">
                    {clinic.verified && (
                      <Badge variant="secondary" className="bg-blue-100 text-blue-800 text-xs">
                        <Award className="h-2 w-2 sm:h-3 sm:w-3 mr-1" />
                        <span className="hidden xs:inline">Проверено</span>
                        <span className="xs:hidden">✓</span>
                      </Badge>
                    )}

                  </div>

                  {/* D-Score */}
                  <div className="flex items-center justify-between">
                    <span className="text-xs sm:text-sm font-medium text-gray-700">Общий рейтинг</span>
                    <div className="flex items-center">
                      <AnimatedProgressBar
                        value={clinic.dScore}
                        className="w-12 sm:w-20 bg-gray-200 rounded-full h-1.5 sm:h-2 mr-2"
                        barClassName="bg-gradient-to-r from-green-400 to-blue-500 h-1.5 sm:h-2 rounded-full"
                        duration={1000}
                        delay={200}
                      />
                      <span className="text-xs sm:text-sm font-bold">{clinic.dScore}</span>
                    </div>
                  </div>

                  {/* Contact Info */}
                  <div className="space-y-1 sm:space-y-2 text-xs sm:text-sm">
                    {clinic.phone && (
                      <div className="flex items-center text-gray-600">
                        <Phone className="h-3 w-3 mr-1 sm:mr-2" />
                        <span className="truncate">{clinic.phone}</span>
                      </div>
                    )}
                    {clinic.website && (
                      <div className="flex items-center text-gray-600">
                        <Globe className="h-3 w-3 mr-1 sm:mr-2" />
                        <span className="truncate">{clinic.website}</span>
                      </div>
                    )}
                  </div>

                  {/* Promotional Labels */}
                  {clinic.promotionalLabels && clinic.promotionalLabels.length > 0 && (
                    <div className="flex flex-wrap gap-1">
                      {clinic.promotionalLabels.map((label, index) => {
                        const labelStyles: Record<string, string> = {
                          'premium': 'bg-gradient-to-r from-yellow-400 to-orange-500 text-white',
                          'discount': 'bg-gradient-to-r from-red-400 to-pink-500 text-white',
                          'new': 'bg-gradient-to-r from-green-400 to-emerald-500 text-white',
                          'popular': 'bg-gradient-to-r from-purple-400 to-indigo-500 text-white',
                          'high_rating': 'bg-gradient-to-r from-blue-400 to-cyan-500 text-white'
                        };
                        
                        const labelNames: Record<string, string> = {
                          'premium': 'Премиум',
                          'discount': 'Скидки',
                          'new': 'Новая',
                          'popular': 'Выбор пациентов',
                          'high_rating': 'Высокий рейтинг'
                        };
                        
                        return (
                          <Badge 
                            key={index} 
                            className={`text-xs px-1.5 sm:px-2 py-0.5 sm:py-1 font-medium ${labelStyles[label] || 'bg-gray-500 text-white'}`}
                          >
                            {labelNames[label] || label}
                          </Badge>
                        );
                      })}
                    </div>
                  )}

                  {/* Last Updated Date */}
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-gray-500">
                      <span className="hidden sm:inline">Обновлено: </span>
                      <span className="sm:hidden">Обн: </span>
                      {new Date(clinic.updatedAt).toLocaleDateString('ru-RU')}
                    </span>
                  </div>
                </div>

                {/* Actions - всегда внизу */}
                <div className="flex space-x-1 sm:space-x-2 pt-2 border-t border-gray-100 mt-auto">
                  <Button
                    size="sm"
                    variant="outline"
                    className="flex-1 text-xs"
                    onClick={() => window.open(`/clinic/${clinic.slug}`, '_blank')}
                  >
                    <Eye className="h-3 w-3 mr-1" />
                    Просмотр
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    className="text-xs"
                    onClick={() => setEditingClinic(clinic)}
                  >
                    <Edit className="h-3 w-3" />
                    <span className="hidden xs:inline ml-1">Изм</span>
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    className="text-red-600 hover:text-red-700 hover:bg-red-50 text-xs"
                    onClick={() => handleDelete(clinic)}
                  >
                    <Trash2 className="h-3 w-3" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between border-t border-gray-200 bg-white px-2 sm:px-4 py-3 sm:px-6 rounded-lg">
          <div className="flex-1 flex justify-between sm:hidden">
            <Button
              variant="outline"
              size="sm"
              onClick={() => handlePageChange(currentPage - 1)}
              disabled={currentPage === 1}
              className="text-xs"
            >
              Назад
            </Button>
            <div className="flex items-center text-xs text-gray-600">
              {currentPage} / {totalPages}
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={() => handlePageChange(currentPage + 1)}
              disabled={currentPage === totalPages}
              className="text-xs"
            >
              Вперед
            </Button>
          </div>
          <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
            <div>
              <p className="text-sm text-gray-700">
                Показано <span className="font-medium">{((currentPage - 1) * 30) + 1}</span> -{' '}
                <span className="font-medium">
                  {Math.min(currentPage * 30, total)}
                </span>{' '}
                из <span className="font-medium">{total}</span> клиник
              </p>
            </div>
            <div>
              <nav className="isolate inline-flex -space-x-px rounded-md shadow-sm" aria-label="Pagination">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handlePageChange(currentPage - 1)}
                  disabled={currentPage === 1}
                  className="relative inline-flex items-center rounded-l-md px-2 py-2 text-gray-400 ring-1 ring-inset ring-gray-300 hover:bg-gray-50 focus:z-20 focus:outline-offset-0"
                >
                  <span className="sr-only">Предыдущая</span>
                  ←
                </Button>
                
                {/* Page numbers */}
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
                      onClick={() => handlePageChange(pageNum)}
                      className="relative inline-flex items-center px-4 py-2 text-sm font-semibold ring-1 ring-inset ring-gray-300 hover:bg-gray-50 focus:z-20 focus:outline-offset-0"
                    >
                      {pageNum}
                    </Button>
                  );
                })}
                
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handlePageChange(currentPage + 1)}
                  disabled={currentPage === totalPages}
                  className="relative inline-flex items-center rounded-r-md px-2 py-2 text-gray-400 ring-1 ring-inset ring-gray-300 hover:bg-gray-50 focus:z-20 focus:outline-offset-0"
                >
                  <span className="sr-only">Следующая</span>
                  →
                </Button>
              </nav>
            </div>
          </div>
        </div>
      )}

      {/* Create Modal */}
      <Dialog open={isCreateModalOpen} onOpenChange={setIsCreateModalOpen}>
        <DialogContent className="max-w-[95vw] sm:max-w-4xl max-h-[95vh] sm:max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Добавить новую клинику</DialogTitle>
          </DialogHeader>
          <ClinicForm
            onSuccess={() => {
              setIsCreateModalOpen(false);
              queryClient.invalidateQueries({ queryKey: ['/api/admin/clinics'] });
            }}
            onCancel={() => setIsCreateModalOpen(false)}
          />
        </DialogContent>
      </Dialog>

      {/* Edit Modal */}
      <Dialog open={!!editingClinic} onOpenChange={() => setEditingClinic(null)}>
        <DialogContent className="max-w-[95vw] sm:max-w-4xl max-h-[95vh] sm:max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Редактировать клинику</DialogTitle>
          </DialogHeader>
          {editingClinic && (
            <ClinicForm
              clinic={editingClinic}
              onSuccess={() => {
                setEditingClinic(null);
                queryClient.invalidateQueries({ queryKey: ['/api/admin/clinics'] });
              }}
              onCancel={() => setEditingClinic(null)}
            />
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}