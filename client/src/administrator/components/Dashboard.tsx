import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Building2, MapPin, Package, TrendingUp, Users, Eye, Star, DollarSign, CreditCard } from 'lucide-react';
import { apiRequest } from '@/lib/queryClient';
import { useQuery } from '@tanstack/react-query';

interface Stats {
  totalClinics: number;
  totalCities: number;
  totalPackages: number;
  verifiedClinics: number;
  todayBookings: number;
  averageDScore: number;
}

interface ViewStats {
  views: number;
}

interface SubscriptionStats {
  totalRevenue: number;
  activeSubscriptions: number;
  monthlyRevenue: number;
  expiringSoon: number;
  topPackages: Array<{ name: string; count: number; revenue: number }>;
}

interface DashboardProps {
  onNavigate?: (page: string) => void;
}

// Функция для форматирования чисел
const formatNumber = (num: number): string => {
  if (num >= 1000000) {
    return (num / 1000000).toFixed(1) + 'M';
  } else if (num >= 1000) {
    return (num / 1000).toFixed(1) + 'K';
  }
  return num.toString();
};

export function Dashboard({ onNavigate }: DashboardProps = {}) {
  const { data: stats, isLoading } = useQuery({
    queryKey: ['/api/admin/stats'],
    queryFn: async () => {
      const response = await apiRequest('GET', '/api/admin/stats');
      return response.json();
    }
  });

  const { data: recentClinics } = useQuery({
    queryKey: ['/api/admin/recent-clinics'],
    queryFn: async () => {
      const response = await apiRequest('GET', '/api/admin/recent-clinics');
      const data = await response.json();
      console.log('🔍 Dashboard - recent clinics data:', data);
      return data;
    }
  });

  const { data: todayViews } = useQuery({
    queryKey: ['/api/admin/today-views'],
    queryFn: async () => {
      const response = await apiRequest('GET', '/api/admin/today-views');
      return response.json();
    }
  });

  // Получаем реальные данные подписок из localStorage
  const [subscriptionStats, setSubscriptionStats] = useState<SubscriptionStats>({
    totalRevenue: 0,
    activeSubscriptions: 0,
    monthlyRevenue: 0,
    expiringSoon: 0,
    topPackages: []
  });

  const loadSubscriptionStats = () => {
      try {
        const packagesData = localStorage.getItem('packages-management-packages');
        const subscriptionsData = localStorage.getItem('packages-management-subscriptions');
        const paymentsData = localStorage.getItem('packages-management-payments');

        console.log('📊 Loading subscription stats from localStorage:');
        console.log('Packages data:', packagesData);
        console.log('Subscriptions data:', subscriptionsData);
        console.log('Payments data:', paymentsData);

        const packages = packagesData ? JSON.parse(packagesData) : [];
        const subscriptions = subscriptionsData ? JSON.parse(subscriptionsData) : [];
        const payments = paymentsData ? JSON.parse(paymentsData) : [];

        console.log('📊 Parsed data:');
        console.log('Packages:', packages);
        console.log('Subscriptions:', subscriptions);
        console.log('Payments:', payments);

        // Подсчитываем активные подписки
        const activeSubscriptions = subscriptions.filter((sub: any) => {
          const isActive = sub.status === 'active' && new Date(sub.endDate) > new Date();
          console.log(`Subscription ${sub.id}: status=${sub.status}, endDate=${sub.endDate}, isActive=${isActive}`);
          return isActive;
        });

        console.log('📊 Active subscriptions:', activeSubscriptions);

        // Подсчитываем общий доход
        const totalRevenue = payments.reduce((sum: number, payment: any) => {
          const amount = payment.amount || 0;
          console.log(`Payment ${payment.id}: amount=${amount}`);
          return sum + amount;
        }, 0);

        console.log('📊 Total revenue:', totalRevenue);

        // Подсчитываем месячный доход (последние 30 дней)
        const thirtyDaysAgo = new Date();
        thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
        const monthlyRevenue = payments
          .filter((payment: any) => new Date(payment.date) > thirtyDaysAgo)
          .reduce((sum: number, payment: any) => sum + (payment.amount || 0), 0);

        // Подсчитываем подписки, которые истекают в течение 7 дней
        const sevenDaysFromNow = new Date();
        sevenDaysFromNow.setDate(sevenDaysFromNow.getDate() + 7);
        const expiringSoon = subscriptions.filter((sub: any) => {
          const endDate = new Date(sub.endDate);
          return endDate <= sevenDaysFromNow && endDate > new Date();
        }).length;

        // Подсчитываем топ пакеты
        const packageStats = new Map<string, { count: number; revenue: number }>();
        activeSubscriptions.forEach((sub: any) => {
          const packageItem = packages.find((pkg: any) => pkg.id === sub.packageId);
          const packageName = packageItem?.name || 'Неизвестный';
          const packageRevenue = payments
            .filter((payment: any) => payment.subscriptionId === sub.id)
            .reduce((sum: number, payment: any) => sum + (payment.amount || 0), 0);
          
          console.log(`Subscription ${sub.id}: packageId=${sub.packageId}, packageName=${packageName}, revenue=${packageRevenue}`);
          
          if (packageStats.has(packageName)) {
            const current = packageStats.get(packageName)!;
            current.count++;
            current.revenue += packageRevenue;
          } else {
            packageStats.set(packageName, { count: 1, revenue: packageRevenue });
          }
        });

        console.log('📊 Package stats:', Array.from(packageStats.entries()));

        const topPackages = Array.from(packageStats.entries())
          .map(([name, stats]) => ({ name, count: stats.count, revenue: stats.revenue }))
          .sort((a, b) => b.revenue - a.revenue)
          .slice(0, 3);

        const finalStats = {
          totalRevenue,
          activeSubscriptions: activeSubscriptions.length,
          monthlyRevenue,
          expiringSoon,
          topPackages
        };

        setSubscriptionStats(finalStats);

        console.log('📊 Final subscription stats:', finalStats);
        console.log('📊 Current state values:', {
          totalRevenue: finalStats.totalRevenue,
          activeSubscriptions: finalStats.activeSubscriptions,
          monthlyRevenue: finalStats.monthlyRevenue,
          expiringSoon: finalStats.expiringSoon,
          topPackages: finalStats.topPackages
        });
      } catch (error) {
        console.error('❌ Error loading subscription stats from localStorage:', error);
      }
    };

  useEffect(() => {
    loadSubscriptionStats();

    // Обновляем статистику каждые 30 секунд
    const interval = setInterval(loadSubscriptionStats, 30000);
    return () => clearInterval(interval);
  }, []);

  const statsCards = [
    {
      title: 'Всего клиник',
      value: stats?.totalClinics || 0,
      icon: Building2,
      color: 'bg-blue-500',
      change: '+2 за неделю',
      clickable: true,
      onClick: () => onNavigate?.('clinics')
    },
    {
      title: 'Городов',
      value: stats?.totalCities || 0,
      icon: MapPin,
      color: 'bg-green-500',
      change: 'стабильно',
      clickable: true,
      onClick: () => onNavigate?.('cities')
    },
    {
      title: 'Текущий оборот',
      value: subscriptionStats?.totalRevenue || 0,
      icon: CreditCard,
      color: 'bg-purple-500',
      change: `${subscriptionStats?.activeSubscriptions || 0} активных подписок`,
      suffix: ' MDL',
      clickable: true,
      onClick: () => onNavigate?.('packages')
    },
    {
      title: 'Заявки',
      value: stats?.todayBookings || 0,
      icon: TrendingUp,
      color: 'bg-orange-500',
      change: 'за сегодня',
      clickable: true,
      onClick: () => onNavigate?.('bookings')
    }
  ];

  if (isLoading) {
    return (
      <div className="space-y-6">
        <h1 className="text-3xl font-bold text-gray-900">Панель управления</h1>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {[...Array(4)].map((_, i) => (
            <Card key={i} className="animate-pulse">
              <CardContent className="p-6">
                <div className="h-20 bg-gray-200 rounded"></div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4 sm:space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center space-y-2 sm:space-y-0">
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Панель управления</h1>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 lg:gap-6">
        {statsCards.map((stat, index) => {
          const Icon = stat.icon;
          return (
            <Card 
              key={index} 
              className={`relative overflow-hidden ${
                stat.clickable ? 'cursor-pointer hover:shadow-lg transition-shadow' : ''
              }`}
              onClick={stat.onClick}
            >
              <CardContent className="p-3 sm:p-4 lg:p-6">
                <div className="flex items-center justify-between">
                  <div className="flex-1 min-w-0">
                    <p className="text-xs sm:text-sm font-medium text-gray-600 truncate">{stat.title}</p>
                    <p className="text-lg sm:text-xl lg:text-2xl font-bold text-gray-900">
                      {stat.value}{stat.suffix || ''}
                    </p>
                    <p className="text-xs text-gray-500 mt-1 truncate">{stat.change}</p>
                  </div>
                  <div className={`p-2 rounded-lg ${stat.color} flex-shrink-0 ml-2 sm:ml-3`}>
                    <Icon className="h-4 w-4 sm:h-5 sm:w-5 lg:h-6 lg:w-6 text-white" />
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Recent Activity */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-4 sm:gap-6">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center text-base sm:text-lg">
              <Building2 className="h-4 w-4 sm:h-5 sm:w-5 mr-2" />
              Клиники с отзывами
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3 sm:space-y-4">
              {recentClinics?.filter((clinic: any) => {
                const hasReviews = clinic.reviewsData && clinic.reviewsData.reviewCount > 0 && clinic.reviewsData.averageRating > 0;
                console.log(`🔍 Clinic ${clinic.nameRu}:`, {
                  reviewsData: clinic.reviewsData,
                  hasReviews
                });
                return hasReviews;
              }).slice(0, 5).map((clinic: any) => (
                <div 
                  key={clinic.id} 
                  className="flex items-center justify-between p-2 sm:p-3 bg-gray-50 rounded-lg cursor-pointer hover:bg-gray-100 transition-colors"
                  onClick={() => onNavigate?.('clinics', clinic.id)}
                >
                  <div className="flex-1 min-w-0">
                    <h4 className="text-sm sm:text-base font-medium text-gray-900 truncate">{clinic.nameRu}</h4>
                    <p className="text-xs sm:text-sm text-gray-600">{clinic.city?.nameRu}</p>
                  </div>
                  <div className="text-right ml-2">
                    {clinic.reviewsData && clinic.reviewsData.reviewCount > 0 && clinic.reviewsData.averageRating > 0 && (
                      <div className="text-xs sm:text-sm font-medium text-green-600 flex items-center justify-end gap-1">
                        <span>⭐</span>
                        <span>{clinic.reviewsData.averageRating.toFixed(1)}</span>
                        <span className="text-gray-500">({clinic.reviewsData.reviewCount})</span>
                      </div>
                    )}
                    <div className="text-xs text-gray-500">
                      {new Date(clinic.createdAt).toLocaleDateString('ru-RU')}
                    </div>
                  </div>
                </div>
              )) || (
                <div className="text-center text-gray-500 py-8">
                  <Building2 className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                  <p>Пока нет добавленных клиник</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center text-base sm:text-lg">
              <TrendingUp className="h-4 w-4 sm:h-5 sm:w-5 mr-2" />
              Финансовые показатели
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2 sm:space-y-3">
              <div className="flex justify-between items-center p-2 sm:p-3 bg-blue-50 rounded-lg">
                <div className="flex items-center min-w-0">
                  <Eye className="h-3 w-3 sm:h-4 sm:w-4 mr-1 sm:mr-2 text-blue-600 flex-shrink-0" />
                  <span className="text-xs sm:text-sm font-medium truncate">Просмотры сегодня</span>
                </div>
                <span className="text-sm sm:text-lg font-bold text-blue-600 ml-2">
                  {todayViews?.views || 0}
                </span>
              </div>
              
              <div className="flex justify-between items-center p-2 sm:p-3 bg-purple-50 rounded-lg">
                <div className="flex items-center min-w-0">
                  <CreditCard className="h-3 w-3 sm:h-4 sm:w-4 mr-1 sm:mr-2 text-purple-600 flex-shrink-0" />
                  <span className="text-xs sm:text-sm font-medium truncate">Месячный доход</span>
                </div>
                <span className="text-sm sm:text-lg font-bold text-purple-600 ml-2">{formatNumber(subscriptionStats?.monthlyRevenue || 0)} MDL</span>
              </div>

              <div className="flex justify-between items-center p-2 sm:p-3 bg-orange-50 rounded-lg">
                <div className="flex items-center min-w-0">
                  <Package className="h-3 w-3 sm:h-4 sm:w-4 mr-1 sm:mr-2 text-orange-600 flex-shrink-0" />
                  <span className="text-xs sm:text-sm font-medium truncate">Истекают скоро</span>
                </div>
                <span className="text-sm sm:text-lg font-bold text-orange-600 ml-2">{subscriptionStats?.expiringSoon || 0}</span>
              </div>

              {/* Топ пакеты */}
              <div className="mt-4">
                <h4 className="text-xs sm:text-sm font-medium text-gray-700 mb-2">Топ пакеты</h4>
                <div className="space-y-2">
                  {subscriptionStats?.topPackages?.slice(0, 3).map((pkg, index) => (
                    <div key={index} className="flex justify-between items-center p-2 bg-gray-50 rounded-lg">
                      <div className="flex items-center min-w-0">
                        <div className="w-2 h-2 rounded-full bg-purple-500 mr-2 flex-shrink-0"></div>
                        <span className="text-xs sm:text-sm font-medium truncate">{pkg.name}</span>
                      </div>
                      <div className="text-right ml-2">
                        <div className="text-xs sm:text-sm font-bold text-gray-900">{pkg.count}</div>
                        <div className="text-xs text-gray-500">{formatNumber(pkg.revenue)} MDL</div>
                      </div>
                    </div>
                  )) || (
                    <div className="text-center text-gray-500 py-4">
                      <p className="text-xs">Нет данных о пакетах</p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}