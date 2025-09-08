import { useState, useEffect } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { apiRequest } from '@/lib/queryClient';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Eye, 
  MousePointer, 
  Phone, 
  ExternalLink, 
  Calendar,
  TrendingUp,
  Users,
  Activity,
  Building2,
  Trash2,
  BarChart3,
  PieChart,
  MapPin,
  Navigation
} from 'lucide-react';
import { AnimatedProgressBar } from '../../components/AnimatedProgressBar';
import { AnimatedNumber } from '../../components/AnimatedNumber';
import { getClinicName } from '@/lib/utils';

interface ClinicStats {
  id: string;
  name: string;
  clicks: {
    book: number;
    phone: number;
    website: number;
    details: number;
  };
  totalClicks: number;
}

interface CityStats {
  id: string;
  name: string;
  totalClicks: number;
  clinicCount: number;
}

interface DistrictStats {
  id: string;
  name: string;
  cityName: string;
  totalClicks: number;
  clinicCount: number;
}

interface OverallStats {
  totalClicks: number;
  totalClinics: number;
  topClinic: ClinicStats | null;
}

export function Statistics() {
  const [selectedPeriod, setSelectedPeriod] = useState('7d');
  const [selectedClinic, setSelectedClinic] = useState('all');
  const [activeTab, setActiveTab] = useState('clinics');
  const [isClearing, setIsClearing] = useState(false);
  const [forceRefresh, setForceRefresh] = useState(0);
  const queryClient = useQueryClient();

  // Получаем статистику
  const { data: stats, isLoading, refetch } = useQuery({
    queryKey: ['/api/admin/statistics', selectedPeriod, selectedClinic, forceRefresh],
    queryFn: async () => {
      const response = await apiRequest('GET', `/api/admin/statistics?period=${selectedPeriod}&clinic=${selectedClinic}`);
      return response.json();
    },
    refetchInterval: 30000, // Обновляем каждые 30 секунд
  });

  // Получаем список клиник для фильтра
  const { data: clinicsData } = useQuery({
    queryKey: ['/api/admin/clinics'],
    queryFn: async () => {
      const response = await apiRequest('GET', '/api/admin/clinics');
      return response.json();
    }
  });

  const clinics = clinicsData?.clinics || [];

  const handleClearStats = async () => {
    if (!confirm('Вы уверены, что хотите очистить всю статистику? Это действие нельзя отменить.')) {
      return;
    }

    setIsClearing(true);
    try {
      await apiRequest('DELETE', '/api/admin/statistics');
      
      // Принудительно очищаем весь кэш React Query
      queryClient.clear();
      
      // Принудительно обновляем данные
      await queryClient.refetchQueries({ 
        queryKey: ['/api/admin/statistics'],
        exact: false 
      });
      
      // Принудительно обновляем компонент
      setForceRefresh(prev => prev + 1);
      
      // Дополнительно принудительно обновляем текущий запрос
      await refetch();
    } catch (error) {
      console.error('Error clearing statistics:', error);
      alert('Ошибка при очистке статистики');
    } finally {
      setIsClearing(false);
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-4 sm:space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between space-y-4 sm:space-y-0">
          <h1 className="text-xl sm:text-2xl font-bold text-gray-900">Статистика</h1>
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center space-y-2 sm:space-y-0 sm:space-x-4">
            <div className="h-10 w-full sm:w-32 bg-gray-200 animate-pulse rounded"></div>
            <div className="h-10 w-full sm:w-48 bg-gray-200 animate-pulse rounded"></div>
            <div className="h-10 w-full sm:w-32 bg-gray-200 animate-pulse rounded"></div>
          </div>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
          {[...Array(3)].map((_, i) => (
            <Card key={i}>
              <CardContent className="p-4 sm:p-6">
                <div className="h-6 sm:h-8 bg-gray-200 animate-pulse rounded mb-2"></div>
                <div className="h-4 bg-gray-200 animate-pulse rounded mb-2"></div>
                <div className="h-2 bg-gray-200 animate-pulse rounded"></div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  const overallStats: OverallStats = stats?.overall || {
    totalClicks: 0,
    totalClinics: 0,
    topClinic: null
  };

  const clinicStats: ClinicStats[] = stats?.clinics || [];
  const cityStats: CityStats[] = stats?.cities || [];
  const districtStats: DistrictStats[] = stats?.districts || [];

  return (
    <div className="space-y-4 sm:space-y-6">
      {/* Заголовок и фильтры */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between space-y-4 sm:space-y-0">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-gray-900">Статистика</h1>
          <p className="text-sm sm:text-base text-gray-600 mt-1">Аналитика переходов и просмотров клиник</p>
        </div>
        
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center space-y-2 sm:space-y-0 sm:space-x-4">
          <Select value={selectedPeriod} onValueChange={setSelectedPeriod}>
            <SelectTrigger className="w-full sm:w-32">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="1d">Сегодня</SelectItem>
              <SelectItem value="7d">7 дней</SelectItem>
              <SelectItem value="30d">30 дней</SelectItem>
              <SelectItem value="90d">90 дней</SelectItem>
            </SelectContent>
          </Select>

          <Select value={selectedClinic} onValueChange={setSelectedClinic}>
            <SelectTrigger className="w-full sm:w-48">
              <SelectValue placeholder="Все клиники" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Все клиники</SelectItem>
              {clinics.map((clinic: any) => (
                <SelectItem key={clinic.id} value={clinic.id}>
                  {getClinicName(clinic)}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Button 
            variant="destructive" 
            size="sm"
            onClick={handleClearStats}
            disabled={isClearing}
            className="flex items-center justify-center space-x-2"
          >
            <Trash2 className="h-4 w-4" />
            <span className="hidden sm:inline">{isClearing ? 'Очистка...' : 'Очистить статистику'}</span>
            <span className="sm:hidden">{isClearing ? '...' : 'Очистить'}</span>
          </Button>
        </div>
      </div>

      {/* Общая статистика */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
        <Card className="relative overflow-hidden">
          <CardContent className="p-4 sm:p-6">
            <div className="flex items-center justify-between">
              <div className="flex-1">
                <p className="text-xs sm:text-sm font-medium text-gray-600">Всего кликов</p>
                <p className="text-xl sm:text-2xl font-bold text-gray-900">
                  <AnimatedNumber value={overallStats.totalClicks} />
                </p>
                <div className="mt-2">
                  <AnimatedProgressBar
                    value={Math.min((overallStats.totalClicks / 100) * 100, 100)}
                    className="w-full bg-gray-200 rounded-full h-2"
                    barClassName="bg-gradient-to-r from-green-400 to-green-600 h-2 rounded-full"
                    duration={1500}
                    delay={200}
                  />
                </div>
              </div>
              <div className="p-3 bg-green-100 rounded-lg flex-shrink-0 ml-3">
                <MousePointer className="h-6 w-6 sm:h-8 sm:w-8 text-green-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="relative overflow-hidden">
          <CardContent className="p-4 sm:p-6">
            <div className="flex items-center justify-between">
              <div className="flex-1">
                <p className="text-xs sm:text-sm font-medium text-gray-600">Клиники</p>
                <p className="text-xl sm:text-2xl font-bold text-gray-900">
                  <AnimatedNumber value={overallStats.totalClinics} />
                </p>
                <div className="mt-2">
                  <AnimatedProgressBar
                    value={Math.min((overallStats.totalClinics / 10) * 100, 100)}
                    className="w-full bg-gray-200 rounded-full h-2"
                    barClassName="bg-gradient-to-r from-purple-400 to-purple-600 h-2 rounded-full"
                    duration={1500}
                    delay={400}
                  />
                </div>
              </div>
              <div className="p-3 bg-purple-100 rounded-lg flex-shrink-0 ml-3">
                <Building2 className="h-6 w-6 sm:h-8 sm:w-8 text-purple-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="relative overflow-hidden">
          <CardContent className="p-4 sm:p-6">
            <div className="flex items-center justify-between">
              <div className="flex-1">
                <p className="text-xs sm:text-sm font-medium text-gray-600">Активные клиники</p>
                <p className="text-xl sm:text-2xl font-bold text-gray-900">
                  <AnimatedNumber value={clinicStats.filter(clinic => clinic.totalClicks > 0).length} />
                </p>
                <div className="mt-2">
                  <AnimatedProgressBar
                    value={overallStats.totalClinics > 0 ? (clinicStats.filter(clinic => clinic.totalClicks > 0).length / overallStats.totalClinics) * 100 : 0}
                    className="w-full bg-gray-200 rounded-full h-2"
                    barClassName="bg-gradient-to-r from-orange-400 to-orange-600 h-2 rounded-full"
                    duration={1500}
                    delay={600}
                  />
                </div>
              </div>
              <div className="p-3 bg-orange-100 rounded-lg flex-shrink-0 ml-3">
                <Activity className="h-6 w-6 sm:h-8 sm:w-8 text-orange-600" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Графики и диаграммы */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
        {/* График топ клиник */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center text-base sm:text-lg">
              <BarChart3 className="h-4 w-4 sm:h-5 sm:w-5 mr-2" />
              Топ клиник по кликам
            </CardTitle>
          </CardHeader>
          <CardContent>
            {clinicStats.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                Нет данных для отображения
              </div>
            ) : (
              <div className="space-y-3">
                {clinicStats
                  .sort((a, b) => b.totalClicks - a.totalClicks)
                  .slice(0, 5)
                  .map((clinic, index) => {
                    const maxClicks = Math.max(...clinicStats.map(c => c.totalClicks));
                    const percentage = maxClicks > 0 ? (clinic.totalClicks / maxClicks) * 100 : 0;
                    
                    return (
                      <div key={clinic.id} className="space-y-2">
                        <div className="flex items-center justify-between text-sm">
                          <span className="font-medium text-gray-900 truncate flex-1 mr-2">
                            {index + 1}. {getClinicName(clinic)}
                          </span>
                          <span className="text-gray-600 font-medium">
                            <AnimatedNumber value={clinic.totalClicks} />
                          </span>
                        </div>
                        <AnimatedProgressBar
                          value={percentage}
                          className="w-full bg-gray-200 rounded-full h-3"
                          barClassName="bg-gradient-to-r from-blue-400 to-blue-600 h-3 rounded-full"
                          duration={1000}
                          delay={index * 100}
                        />
                      </div>
                    );
                  })}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Круговая диаграмма типов кликов */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center text-base sm:text-lg">
              <PieChart className="h-4 w-4 sm:h-5 sm:w-5 mr-2" />
              Распределение кликов
            </CardTitle>
          </CardHeader>
          <CardContent>
            {overallStats.totalClicks === 0 ? (
              <div className="text-center py-8 text-gray-500">
                Нет данных для отображения
              </div>
            ) : (
              <div className="space-y-3">
                {[
                  { label: 'Подробнее', value: clinicStats.reduce((sum, clinic) => sum + clinic.clicks.details, 0), color: 'from-blue-400 to-blue-600' },
                  { label: 'Запись', value: clinicStats.reduce((sum, clinic) => sum + clinic.clicks.book, 0), color: 'from-green-400 to-green-600' },
                  { label: 'Позвонить', value: clinicStats.reduce((sum, clinic) => sum + clinic.clicks.phone, 0), color: 'from-orange-400 to-orange-600' },
                  { label: 'Сайт', value: clinicStats.reduce((sum, clinic) => sum + clinic.clicks.website, 0), color: 'from-purple-400 to-purple-600' }
                ].map((item, index) => {
                  const percentage = overallStats.totalClicks > 0 ? (item.value / overallStats.totalClicks) * 100 : 0;
                  
                  return (
                    <div key={item.label} className="space-y-2">
                      <div className="flex items-center justify-between text-sm">
                        <span className="font-medium text-gray-900">{item.label}</span>
                        <span className="text-gray-600 font-medium">
                          <AnimatedNumber value={item.value} />
                        </span>
                      </div>
                      <AnimatedProgressBar
                        value={percentage}
                        className="w-full bg-gray-200 rounded-full h-3"
                        barClassName={`bg-gradient-to-r ${item.color} h-3 rounded-full`}
                        duration={1000}
                        delay={index * 150}
                      />
                    </div>
                  );
                })}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Детальная статистика с вкладками */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center text-base sm:text-lg">
            <Activity className="h-4 w-4 sm:h-5 sm:w-5 mr-2" />
            Детальная статистика
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="clinics" className="flex items-center gap-2">
                <Building2 className="h-4 w-4" />
                <span className="hidden sm:inline">Клиники</span>
                <span className="sm:hidden">Клиники</span>
              </TabsTrigger>
              <TabsTrigger value="cities" className="flex items-center gap-2">
                <MapPin className="h-4 w-4" />
                <span className="hidden sm:inline">Города</span>
                <span className="sm:hidden">Города</span>
              </TabsTrigger>
              <TabsTrigger value="districts" className="flex items-center gap-2">
                <Navigation className="h-4 w-4" />
                <span className="hidden sm:inline">Районы</span>
                <span className="sm:hidden">Районы</span>
              </TabsTrigger>
            </TabsList>

            {/* Вкладка Клиники */}
            <TabsContent value="clinics" className="mt-4">
              {clinicStats.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  Нет данных для отображения
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b border-gray-200">
                        <th className="text-left py-2 sm:py-3 px-2 sm:px-4 font-medium text-gray-900 text-xs sm:text-sm">Клиника</th>
                        <th className="text-center py-2 sm:py-3 px-2 sm:px-4 font-medium text-gray-900 text-xs sm:text-sm">
                          <MousePointer className="h-3 w-3 sm:h-4 sm:w-4 inline mr-1" />
                          <span className="hidden sm:inline">Всего кликов</span>
                          <span className="sm:hidden">Клики</span>
                        </th>
                        <th className="text-center py-2 sm:py-3 px-2 sm:px-4 font-medium text-gray-900 text-xs sm:text-sm">
                          <Eye className="h-3 w-3 sm:h-4 sm:w-4 inline mr-1" />
                          <span className="hidden sm:inline">Подробнее</span>
                          <span className="sm:hidden">Детали</span>
                        </th>
                        <th className="text-center py-2 sm:py-3 px-2 sm:px-4 font-medium text-gray-900 text-xs sm:text-sm">
                          <Calendar className="h-3 w-3 sm:h-4 sm:w-4 inline mr-1" />
                          <span className="hidden sm:inline">Запись</span>
                          <span className="sm:hidden">Запись</span>
                        </th>
                        <th className="text-center py-2 sm:py-3 px-2 sm:px-4 font-medium text-gray-900 text-xs sm:text-sm">
                          <Phone className="h-3 w-3 sm:h-4 sm:w-4 inline mr-1" />
                          <span className="hidden sm:inline">Позвонить</span>
                          <span className="sm:hidden">Звонок</span>
                        </th>
                        <th className="text-center py-2 sm:py-3 px-2 sm:px-4 font-medium text-gray-900 text-xs sm:text-sm">
                          <ExternalLink className="h-3 w-3 sm:h-4 sm:w-4 inline mr-1" />
                          <span className="hidden sm:inline">Сайт</span>
                          <span className="sm:hidden">Сайт</span>
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {clinicStats.map((clinic) => (
                        <tr key={clinic.id} className="border-b border-gray-100 hover:bg-gray-50">
                          <td className="py-2 sm:py-3 px-2 sm:px-4 font-medium text-gray-900 text-xs sm:text-sm truncate max-w-32 sm:max-w-none">
                            {getClinicName(clinic)}
                          </td>
                          <td className="py-2 sm:py-3 px-2 sm:px-4 text-center font-medium text-gray-900 text-xs sm:text-sm">
                            <AnimatedNumber value={clinic.totalClicks} />
                          </td>
                          <td className="py-2 sm:py-3 px-2 sm:px-4 text-center text-gray-700 text-xs sm:text-sm">
                            <AnimatedNumber value={clinic.clicks.details} />
                          </td>
                          <td className="py-2 sm:py-3 px-2 sm:px-4 text-center text-gray-700 text-xs sm:text-sm">
                            <AnimatedNumber value={clinic.clicks.book} />
                          </td>
                          <td className="py-2 sm:py-3 px-2 sm:px-4 text-center text-gray-700 text-xs sm:text-sm">
                            <AnimatedNumber value={clinic.clicks.phone} />
                          </td>
                          <td className="py-2 sm:py-3 px-2 sm:px-4 text-center text-gray-700 text-xs sm:text-sm">
                            <AnimatedNumber value={clinic.clicks.website} />
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </TabsContent>

            {/* Вкладка Города */}
            <TabsContent value="cities" className="mt-4">
              {cityStats.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  Нет данных для отображения
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b border-gray-200">
                        <th className="text-left py-2 sm:py-3 px-2 sm:px-4 font-medium text-gray-900 text-xs sm:text-sm">Город</th>
                        <th className="text-center py-2 sm:py-3 px-2 sm:px-4 font-medium text-gray-900 text-xs sm:text-sm">
                          <MousePointer className="h-3 w-3 sm:h-4 sm:w-4 inline mr-1" />
                          <span className="hidden sm:inline">Всего кликов</span>
                          <span className="sm:hidden">Клики</span>
                        </th>
                        <th className="text-center py-2 sm:py-3 px-2 sm:px-4 font-medium text-gray-900 text-xs sm:text-sm">
                          <Building2 className="h-3 w-3 sm:h-4 sm:w-4 inline mr-1" />
                          <span className="hidden sm:inline">Клиник</span>
                          <span className="sm:hidden">Клиник</span>
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {cityStats.map((city) => (
                        <tr key={city.id} className="border-b border-gray-100 hover:bg-gray-50">
                          <td className="py-2 sm:py-3 px-2 sm:px-4 font-medium text-gray-900 text-xs sm:text-sm">
                            {city.name}
                          </td>
                          <td className="py-2 sm:py-3 px-2 sm:px-4 text-center font-medium text-gray-900 text-xs sm:text-sm">
                            <AnimatedNumber value={city.totalClicks} />
                          </td>
                          <td className="py-2 sm:py-3 px-2 sm:px-4 text-center text-gray-700 text-xs sm:text-sm">
                            <AnimatedNumber value={city.clinicCount} />
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </TabsContent>

            {/* Вкладка Районы */}
            <TabsContent value="districts" className="mt-4">
              {districtStats.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  Нет данных для отображения
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b border-gray-200">
                        <th className="text-left py-2 sm:py-3 px-2 sm:px-4 font-medium text-gray-900 text-xs sm:text-sm">Район</th>
                        <th className="text-left py-2 sm:py-3 px-2 sm:px-4 font-medium text-gray-900 text-xs sm:text-sm">Город</th>
                        <th className="text-center py-2 sm:py-3 px-2 sm:px-4 font-medium text-gray-900 text-xs sm:text-sm">
                          <MousePointer className="h-3 w-3 sm:h-4 sm:w-4 inline mr-1" />
                          <span className="hidden sm:inline">Всего кликов</span>
                          <span className="sm:hidden">Клики</span>
                        </th>
                        <th className="text-center py-2 sm:py-3 px-2 sm:px-4 font-medium text-gray-900 text-xs sm:text-sm">
                          <Building2 className="h-3 w-3 sm:h-4 sm:w-4 inline mr-1" />
                          <span className="hidden sm:inline">Клиник</span>
                          <span className="sm:hidden">Клиник</span>
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {districtStats.map((district) => (
                        <tr key={district.id} className="border-b border-gray-100 hover:bg-gray-50">
                          <td className="py-2 sm:py-3 px-2 sm:px-4 font-medium text-gray-900 text-xs sm:text-sm">
                            {district.name}
                          </td>
                          <td className="py-2 sm:py-3 px-2 sm:px-4 text-gray-700 text-xs sm:text-sm">
                            {district.cityName}
                          </td>
                          <td className="py-2 sm:py-3 px-2 sm:px-4 text-center font-medium text-gray-900 text-xs sm:text-sm">
                            <AnimatedNumber value={district.totalClicks} />
                          </td>
                          <td className="py-2 sm:py-3 px-2 sm:px-4 text-center text-gray-700 text-xs sm:text-sm">
                            <AnimatedNumber value={district.clinicCount} />
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
}
