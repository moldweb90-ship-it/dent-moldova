import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Building2, MapPin, Package, TrendingUp, Users, Eye, Star, DollarSign } from 'lucide-react';
import { apiRequest } from '@/lib/queryClient';
import { useQuery } from '@tanstack/react-query';

interface Stats {
  totalClinics: number;
  totalCities: number;
  totalPackages: number;
  averageDScore: number;
}

interface ViewStats {
  views: number;
}

interface DashboardProps {
  onNavigate?: (page: string) => void;
}

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
      return response.json();
    }
  });

  const { data: todayViews } = useQuery({
    queryKey: ['/api/admin/today-views'],
    queryFn: async () => {
      const response = await apiRequest('GET', '/api/admin/today-views');
      return response.json();
    }
  });

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
      change: 'стабильно'
    },
    {
      title: 'Пакетов услуг',
      value: stats?.totalPackages || 0,
      icon: Package,
      color: 'bg-purple-500',
      change: '+8 за месяц'
    },
    {
      title: 'Средний D-Score',
      value: stats?.averageDScore || 0,
      icon: TrendingUp,
      color: 'bg-orange-500',
      change: '+3.2%',
      suffix: '/100'
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
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold text-gray-900">Панель управления</h1>
        <div className="text-sm text-gray-500">
          Обновлено: {new Date().toLocaleString('ru-RU')}
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
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
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">{stat.title}</p>
                    <p className="text-2xl font-bold text-gray-900">
                      {stat.value}{stat.suffix || ''}
                    </p>
                    <p className="text-xs text-gray-500 mt-1">{stat.change}</p>
                  </div>
                  <div className={`p-3 rounded-lg ${stat.color}`}>
                    <Icon className="h-6 w-6 text-white" />
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Recent Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Building2 className="h-5 w-5 mr-2" />
              Последние добавленные клиники
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {recentClinics?.slice(0, 5).map((clinic: any) => (
                <div 
                  key={clinic.id} 
                  className="flex items-center justify-between p-3 bg-gray-50 rounded-lg cursor-pointer hover:bg-gray-100 transition-colors"
                  onClick={() => onNavigate?.('clinics')}
                >
                  <div>
                    <h4 className="font-medium text-gray-900">{clinic.name}</h4>
                    <p className="text-sm text-gray-600">{clinic.city?.nameRu}</p>
                  </div>
                  <div className="text-right">
                    <div className="text-sm font-medium text-green-600">
                      D-Score: {clinic.dScore}
                    </div>
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
          <CardHeader>
            <CardTitle className="flex items-center">
              <TrendingUp className="h-5 w-5 mr-2" />
              Статистика производительности
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex justify-between items-center p-3 bg-blue-50 rounded-lg">
                <div className="flex items-center">
                  <Eye className="h-4 w-4 mr-2 text-blue-600" />
                  <span className="text-sm font-medium">Уникальные просмотры сегодня</span>
                </div>
                <span className="text-lg font-bold text-blue-600">
                  {todayViews?.views || 0}
                </span>
              </div>
              
              <div className="flex justify-between items-center p-3 bg-green-50 rounded-lg">
                <div className="flex items-center">
                  <Star className="h-4 w-4 mr-2 text-green-600" />
                  <span className="text-sm font-medium">Средний рейтинг</span>
                </div>
                <span className="text-lg font-bold text-green-600">4.6</span>
              </div>
              
              <div className="flex justify-between items-center p-3 bg-purple-50 rounded-lg">
                <div className="flex items-center">
                  <Users className="h-4 w-4 mr-2 text-purple-600" />
                  <span className="text-sm font-medium">Активные клиники</span>
                </div>
                <span className="text-lg font-bold text-purple-600">{stats?.totalClinics || 0}</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}