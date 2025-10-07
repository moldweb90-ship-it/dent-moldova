import { useQuery } from '@tanstack/react-query';
import { Building2, MapPin, MapPinned } from 'lucide-react';
import { useTranslation } from '../lib/i18n';

interface AdminStats {
  totalClinics: number;
  totalCities: number;
  totalPackages: number;
  verifiedClinics: number;
  todayBookings: number;
  averageDScore: number;
}

interface CityWithDistricts {
  id: string;
  nameRu: string;
  nameRo: string;
  districts: Array<{ id: string; nameRu: string; nameRo: string }>;
}

export function StatisticsBanner() {
  const { t, language } = useTranslation();

  // Получаем публичную статистику
  const { data: stats, isLoading } = useQuery<AdminStats>({
    queryKey: ['public-stats'],
    queryFn: async () => {
      const response = await fetch('/api/stats');
      if (!response.ok) throw new Error('Failed to fetch stats');
      return response.json();
    },
    staleTime: 5 * 60 * 1000, // Cache for 5 minutes
  });

  // Получаем данные городов с районами
  const { data: citiesData } = useQuery<CityWithDistricts[]>({
    queryKey: ['cities-with-districts'],
    queryFn: async () => {
      const response = await fetch('/api/cities-with-districts');
      if (!response.ok) throw new Error('Failed to fetch cities');
      return response.json();
    },
    staleTime: 10 * 60 * 1000, // Cache for 10 minutes
  });

  const totalClinics = stats?.totalClinics || 0;
  const totalCities = stats?.totalCities || 0;
  const totalDistricts = citiesData?.reduce((sum: number, city) => sum + (city.districts?.length || 0), 0) || 0;

  // Показываем скелетон пока загружается
  if (isLoading || !stats) {
    return (
      <div className="bg-gray-100 border border-gray-200 rounded-xl p-3 sm:p-4 mb-6 shadow-sm animate-pulse">
        <div className="h-6 bg-gray-200 rounded w-3/4 mx-auto"></div>
      </div>
    );
  }

  if (totalClinics === 0 && totalCities === 0) {
    return null;
  }

  return (
    <div className="bg-white border border-gray-200 rounded-xl p-3 sm:p-4 mb-6 shadow-sm animate-fade-in">
      {/* Desktop version */}
      <div className="hidden sm:flex items-center justify-center space-x-6 text-sm text-gray-600">
        {/* Стоматологии */}
        <div className="flex items-center space-x-2 cursor-pointer transition-all duration-300 hover:scale-110 hover:text-blue-600 group">
          <Building2 className="w-4 h-4 text-gray-500 group-hover:text-blue-600 transition-colors duration-300" />
          <span className="font-medium text-gray-900 group-hover:text-blue-600 transition-colors duration-300">{totalClinics}</span>
          <span className="group-hover:text-blue-600 transition-colors duration-300">{language === 'ro' ? 'stomatologii' : 'стоматологий'}</span>
        </div>

        <div className="text-gray-300">•</div>

        {/* Города */}
        <div className="flex items-center space-x-2 cursor-pointer transition-all duration-300 hover:scale-110 hover:text-green-600 group">
          <MapPin className="w-4 h-4 text-gray-500 group-hover:text-green-600 transition-colors duration-300" />
          <span className="font-medium text-gray-900 group-hover:text-green-600 transition-colors duration-300">{totalCities}</span>
          <span className="group-hover:text-green-600 transition-colors duration-300">{language === 'ro' ? 'orașe' : 'городов'}</span>
        </div>

        <div className="text-gray-300">•</div>

        {/* Районы */}
        <div className="flex items-center space-x-2 cursor-pointer transition-all duration-300 hover:scale-110 hover:text-purple-600 group">
          <MapPinned className="w-4 h-4 text-gray-500 group-hover:text-purple-600 transition-colors duration-300" />
          <span className="font-medium text-gray-900 group-hover:text-purple-600 transition-colors duration-300">{totalDistricts}</span>
          <span className="group-hover:text-purple-600 transition-colors duration-300">{language === 'ro' ? 'raioane' : 'районов'}</span>
        </div>

      </div>

      {/* Mobile version - compact */}
      <div className="flex sm:hidden items-center justify-center space-x-3 text-xs text-gray-600">
        {/* Стоматологии */}
        <div className="flex items-center space-x-1 active:scale-110 transition-transform duration-200 group">
          <Building2 className="w-3.5 h-3.5 text-gray-500 group-active:text-blue-600 transition-colors duration-200" />
          <span className="font-semibold text-gray-900 group-active:text-blue-600 transition-colors duration-200">{totalClinics}</span>
          <span className="text-gray-600 group-active:text-blue-600 transition-colors duration-200">{language === 'ro' ? 'clinici' : 'клиник'}</span>
        </div>

        <div className="text-gray-300">•</div>

        {/* Города */}
        <div className="flex items-center space-x-1 active:scale-110 transition-transform duration-200 group">
          <MapPin className="w-3.5 h-3.5 text-gray-500 group-active:text-green-600 transition-colors duration-200" />
          <span className="font-semibold text-gray-900 group-active:text-green-600 transition-colors duration-200">{totalCities}</span>
          <span className="text-gray-600 group-active:text-green-600 transition-colors duration-200">{language === 'ro' ? 'orașe' : 'городов'}</span>
        </div>

        <div className="text-gray-300">•</div>

        {/* Районы */}
        <div className="flex items-center space-x-1 active:scale-110 transition-transform duration-200 group">
          <MapPinned className="w-3.5 h-3.5 text-gray-500 group-active:text-purple-600 transition-colors duration-200" />
          <span className="font-semibold text-gray-900 group-active:text-purple-600 transition-colors duration-200">{totalDistricts}</span>
          <span className="text-gray-600 group-active:text-purple-600 transition-colors duration-200">{language === 'ro' ? 'raioane' : 'районов'}</span>
        </div>
      </div>
    </div>
  );
}
